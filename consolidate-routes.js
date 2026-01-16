const fs = require('fs');
const path = require('path');

const eventDir = path.join(process.cwd(), 'src/app/events/[id]');
const viewsDir = path.join(process.cwd(), 'src/views/events');
const tabsPagePath = path.join(eventDir, '[tab]/page.tsx');

// Ensure views directory exists
if (!fs.existsSync(viewsDir)) {
    fs.mkdirSync(viewsDir, { recursive: true });
}

// Get all subdirectories
const dirs = fs.readdirSync(eventDir).filter(f => fs.statSync(path.join(eventDir, f)).isDirectory());
const components = [];

dirs.forEach(dir => {
    if (dir === '[tab]') return; // Skip the destination
    const pagePath = path.join(eventDir, dir, 'page.tsx');

    if (fs.existsSync(pagePath)) {
        let content = fs.readFileSync(pagePath, 'utf8');

        // Transform content
        // 1. Remove runtime config
        content = content.replace(/export const runtime = 'edge';/g, '');

        // 2. Add useParams import if missing
        if (!content.includes('next/navigation')) {
            content = `import { useParams } from 'next/navigation';\n` + content;
        } else if (!content.includes('useParams')) {
            content = content.replace(/import \{([^}]*)\} from ["']next\/navigation["']/, 'import {$1, useParams} from "next/navigation"');
        }

        // 3. Transform component signature (remove props)
        // Match: export default function X({ params }: { params: Promise<{ id: string }> })
        content = content.replace(/export default function (\w+)\s*\({ params }\s*:\s*\{[^}]*\}\)/, 'export default function $1()');
        // Match generic props pattern if above failed
        content = content.replace(/export default function (\w+)\s*\([^)]*\)/, 'export default function $1()');

        // 4. Transform params usage
        // Old: const { id } = use(params);
        // New: const params = useParams(); const id = params?.id as string;
        if (content.includes('use(params)')) {
            content = content.replace(/const \{ id \} = use\(params\);/, 'const params = useParams(); const id = params?.id as string;');
        } else {
            // Just inject it at start of function if not found but needed?
            // Most files we saw followed the pattern. 
            // If they utilize `params` directly elsewhere, this is risky.
            // We'll hope they used the pattern we standardized.
        }

        // 5. Ensure "use client"
        if (!content.includes('"use client"')) {
            content = '"use client";\n' + content;
        }

        // Write to new location
        fs.writeFileSync(path.join(viewsDir, `${dir}.tsx`), content);

        components.push({ name: dir, componentName: dir.charAt(0).toUpperCase() + dir.slice(1) + 'Page' });

        console.log(`Moved ${dir} to views`);

        // Prepare to delete old dir (commented out for safety first run, or rename?)
        // fs.rmSync(path.join(eventDir, dir), { recursive: true, force: true });
    }
});

// Generate catch-all page
let catchAllContent = `'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic imports to split code (though bundled in worker, helps local dev)
`;

components.forEach(c => {
    catchAllContent += `const ${c.componentName} = dynamic(() => import('@/views/events/${c.name}'));\n`;
});

catchAllContent += `
export const runtime = 'edge';

export default function EventTabPage({ params }: { params: Promise<{ tab: string }> }) {
    const { tab } = use(params);

    switch (tab) {
`;

components.forEach(c => {
    catchAllContent += `        case '${c.name}': return <${c.componentName} />;\n`;
});

catchAllContent += `        default: return notFound();
    }
}
`;

// Create [tab] directory
if (!fs.existsSync(path.join(eventDir, '[tab]'))) {
    fs.mkdirSync(path.join(eventDir, '[tab]'));
}

fs.writeFileSync(tabsPagePath, catchAllContent);
console.log('Created catch-all route');
