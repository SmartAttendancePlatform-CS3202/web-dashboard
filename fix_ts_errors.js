const fs = require('fs');
const file = 'src/app/admin/users/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\(newStudent as any\)/g, '(newStudent as {role?: string})');
content = content.replace(/as any\)}/g, 'as unknown as typeof newStudent)}');
content = content.replace(/!newStudent\.role/g, '!(newStudent as {role?: string}).role');

fs.writeFileSync(file, content);
