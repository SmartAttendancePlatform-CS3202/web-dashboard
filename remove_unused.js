const fs = require('fs');

let pageCode = fs.readFileSync('src/app/page.tsx', 'utf8');
const lines = pageCode.split('\n');

const newLines = lines.filter(line => {
    if (line.includes('const [trends, setTrends]') || line.includes('const [alerts, setAlerts]')) {
        return false;
    }
    if (line.includes('reportsApi.getOfferingTrends') || line.includes('alertsApi.getAlerts')) {
        return false;
    }
    if (line.includes('setTrends(') || line.includes('setAlerts(')) {
        return false;
    }
    return true;
});

// Now we need to fix the `const [sess, rep, tr, al, nots]` line
for (let i = 0; i < newLines.length; i++) {
    if (newLines[i].includes('const [sess, rep, tr, al, nots] = await Promise.all([')) {
        newLines[i] = newLines[i].replace('const [sess, rep, tr, al, nots]', 'const [sess, rep, nots]');
    }
}

fs.writeFileSync('src/app/page.tsx', newLines.join('\n'));
console.log("Fixed page.tsx states and API calls");
