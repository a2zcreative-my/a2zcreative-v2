const fs = require('fs');
const path = require('path');

const eventDir = path.join(process.cwd(), 'src/app/events/[id]');
const dirs = [
    "builder",
    "checkin",
    "contact",
    "gift",
    "guests",
    "itinerary",
    "music",
    "payment",
    "preview",
    "report",
    "rsvp",
    "sections",
    "send",
    "template",
    "theme"
];

dirs.forEach(dir => {
    const dirPath = path.join(eventDir, dir);
    if (fs.existsSync(dirPath)) {
        try {
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`Deleted ${dir}`);
        } catch (e) {
            console.error(`Failed to delete ${dir}: ${e.message}`);
        }
    } else {
        console.log(`${dir} not found`);
    }
});
