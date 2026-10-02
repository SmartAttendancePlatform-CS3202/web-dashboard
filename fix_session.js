const fs = require('fs');
let content = fs.readFileSync('src/app/session/live/page.tsx', 'utf8');
content = content.replace(/{initialWindow && \([\s\S]*?\)}/g, '{/* First Check-In Window Card Removed */}');
content = content.replace(/<p style={{ fontSize: "0\.8rem", color: "var\(--text-secondary\)", textAlign: "center", margin: 0 }}>\s*Trigger a surprise location check to verify students are still in the venue\.\s*<\/p>/g, '{/* text removed */}');
fs.writeFileSync('src/app/session/live/page.tsx', content);
