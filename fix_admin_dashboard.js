const fs = require('fs');
let file = 'src/app/admin/page.tsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Remove "Export Data" button
c = c.replace(/<Button variant="outline" onClick={handleExportLedger}[\s\S]*?<\/Button>/g, '');

// 2. Remove "Unusual Activity Flags" card
c = c.replace(/<Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">\s*<CardContent className="p-6 flex items-start gap-4">\s*<div className="bg-rose-50 dark:bg-rose-900\/30 p-3 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800 shrink-0">\s*<ShieldAlertIcon size={24} \/>\s*<\/div>\s*<div>\s*<p className="text-\[0\.7rem\] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">Unusual Activity Flags<\/p>\s*<h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">\s*\{stats\?\.flagged_proxies_today \|\| 0\}\s*<\/h3>\s*<\/div>\s*<\/CardContent>\s*<\/Card>/g, '');

// 3. Make responsive the cards
c = c.replace(/<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">/g, '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">');

// 4. Remove "Recent Security Events"
c = c.replace(/{\/\* 4\. Recent Logs \*\/}[\s\S]*?<\/Card>/g, '');

fs.writeFileSync(file, c);
