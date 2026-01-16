const fs = require('fs');
const path = require('path');

const viewsDir = path.join(process.cwd(), 'src/views/events');

if (fs.existsSync(viewsDir)) {
    const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.tsx'));

    files.forEach(file => {
        const filePath = path.join(viewsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Remove existing "use client" directives (start of file or elsewhere)
        content = content.replace(/['"]use client['"];?\s*/g, '');

        // Add it back at the vary top
        content = `"use client";\n` + content;

        fs.writeFileSync(filePath, content);
        console.log(`Fixed ${file}`);
    });
} else {
    console.error(`Directory not found: ${viewsDir}`);
}
