const fs = require('fs');
const path = require('path');

const files = [
    "src/app/[slug]/page.tsx",
    "src/app/api/payment/callback/route.ts",
    "src/app/api/payment/create-bill/route.ts",
    "src/app/api/payment/redirect/route.ts",
    "src/app/auth/callback/route.ts",
    "src/app/events/[id]/builder/page.tsx",
    "src/app/events/[id]/checkin/page.tsx",
    "src/app/events/[id]/contact/page.tsx",
    "src/app/events/[id]/gift/page.tsx",
    "src/app/events/[id]/guests/page.tsx",
    "src/app/events/[id]/itinerary/page.tsx",
    "src/app/events/[id]/music/page.tsx",
    "src/app/events/[id]/payment/page.tsx",
    "src/app/events/[id]/preview/page.tsx",
    "src/app/events/[id]/report/page.tsx",
    "src/app/events/[id]/rsvp/page.tsx",
    "src/app/events/[id]/sections/page.tsx",
    "src/app/events/[id]/send/page.tsx",
    "src/app/events/[id]/template/page.tsx",
    "src/app/events/[id]/theme/page.tsx"
];

files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes("export const runtime = 'edge'")) {
            // Append to the end
            content += "\nexport const runtime = 'edge';\n";
            fs.writeFileSync(filePath, content);
            console.log(`Updated ${file}`);
        } else {
            console.log(`Skipped ${file} (already exists)`);
        }
    } else {
        console.error(`File not found: ${file}`);
    }
});
