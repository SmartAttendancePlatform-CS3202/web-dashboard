const fs = require('fs');
const file = 'src/app/page.tsx';
let c = fs.readFileSync(file, 'utf8');

const replacementFn = `
  const isToday = (dateString: string) => {
    const d = new Date(dateString);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };
  const todaysSessions = sessions.filter(s => isToday(s.scheduled_at)).sort((a,b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
`;

if (!c.includes('const isToday =')) {
    const insertIdx = c.indexOf('return (');
    if (insertIdx !== -1) {
        c = c.substring(0, insertIdx) + replacementFn + '\n  ' + c.substring(insertIdx);
    }
}

// Now replace the offerings mapping
const mapStart = `{offerings.filter(off => off.day?.toLowerCase() === new Date().toLocaleDateString('en-US', {weekday: 'long'}).toLowerCase()).length === 0 ? (`;
const mapEnd = `              </div>\n            ))}`;

const oldBlock = c.substring(c.indexOf(mapStart), c.indexOf(mapEnd) + mapEnd.length);

const newBlock = `{todaysSessions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <CalendarIcon size={32} className="opacity-20 mb-3" />
                <p className="text-sm font-medium">It looks quiet here! You have no classes scheduled today.</p>
              </div>
            ) : todaysSessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between group/item hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all shadow-sm relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl opacity-0 group-hover/item:opacity-100 transition-opacity" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[0.65rem] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded uppercase tracking-wider">{sess.course_code || offerings.find(o => o.id === sess.course_offering_id)?.course_code}</span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-wider">{new Date(sess.scheduled_at).toLocaleDateString('en-US', {weekday: 'short'})}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                    {sess.course_name || offerings.find(o => o.id === sess.course_offering_id)?.course_name}
                  </h4>
                  <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-md">
                      <ClockIcon size={12} className="text-blue-500 dark:text-blue-400" /> 
                      {new Date(sess.scheduled_at).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-md">
                      <MapPinIcon size={12} className="text-emerald-500 dark:text-emerald-400" /> {sess.venue_name || offerings.find(o => o.id === sess.course_offering_id)?.venue_name}
                    </span>
                  </div>
                </div>
                
                <div className="ml-3 flex flex-col items-end gap-2">
                  <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md text-xs font-bold whitespace-nowrap shadow-sm border border-blue-200 dark:border-blue-800">
                    Session {sess.session_number}
                  </span>
                  <span className={\`text-[0.65rem] font-bold px-2 py-0.5 rounded uppercase tracking-wider border shadow-sm \${sess.status === 'ongoing' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 animate-pulse' : 'bg-slate-100 text-slate-500 border-slate-200'}\`}>
                    {sess.status}
                  </span>
                </div>
              </div>
            ))}`;

if (c.indexOf(mapStart) !== -1) {
    c = c.replace(oldBlock, newBlock);
    fs.writeFileSync(file, c);
    console.log("Updated page.tsx with sessions logic");
} else {
    console.log("Could not find the map block");
}
