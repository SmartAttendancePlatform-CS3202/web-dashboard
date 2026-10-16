const fs = require('fs');
const file = 'src/app/page.tsx';
let c = fs.readFileSync(file, 'utf8');

const startStr = `{/* Main Grid: Schedule & Trends */}`;
const endStr = `</DashboardLayout>`;
const startIdx = c.indexOf(startStr);
const endIdx = c.lastIndexOf(endStr);

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find boundaries");
    process.exit(1);
}

const replacement = `{/* Main Grid: Schedule & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-7">
        
        {/* Today's Schedule */}
        <div 
          onClick={() => window.location.href = '/timetable'}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-400/10 transition-colors" />
          
          <div className="flex items-center justify-between mb-5 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
                <CalendarIcon size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Today's Classes
              </h3>
            </div>
            <Link href="/timetable" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              Full Timetable &rarr;
            </Link>
          </div>

          <div className="flex flex-col gap-3 flex-1 relative z-10 overflow-y-auto custom-scrollbar max-h-[350px] pr-1">
            {offerings.filter(off => off.day?.toLowerCase() === new Date().toLocaleDateString('en-US', {weekday: 'long'}).toLowerCase()).length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <CalendarIcon size={32} className="opacity-20 mb-3" />
                <p className="text-sm font-medium">It looks quiet here! You have no classes scheduled today.</p>
              </div>
            ) : offerings.filter(off => off.day?.toLowerCase() === new Date().toLocaleDateString('en-US', {weekday: 'long'}).toLowerCase()).map((off) => (
              <div
                key={off.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between group/item hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all shadow-sm relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl opacity-0 group-hover/item:opacity-100 transition-opacity" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[0.65rem] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded uppercase tracking-wider">{off.course_code}</span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-wider">{off.day}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                    {off.course_name}
                  </h4>
                  <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-md">
                      <ClockIcon size={12} className="text-blue-500 dark:text-blue-400" /> {off.start_time} - {off.end_time}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-md">
                      <MapPinIcon size={12} className="text-emerald-500 dark:text-emerald-400" /> {off.venue_name}
                    </span>
                  </div>
                </div>
                
                <div className="ml-3 hidden sm:flex">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Broadcast Notices */}
        <div 
          onClick={() => window.location.href = '/notices'}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-400/10 transition-colors" />
          
          <div className="flex items-center justify-between mb-5 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-2 rounded-lg"><BellIcon size={20} /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Recent Announcements
              </h3>
            </div>
            <Link href="/notices" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              All Notices &rarr;
            </Link>
          </div>

          <div className="flex flex-col gap-3 relative z-10 overflow-y-auto custom-scrollbar max-h-[350px] pr-1">
            {notices.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                 <BellIcon size={32} className="opacity-20 mb-3" />
                 <p className="text-sm font-medium">No recent announcements.</p>
              </div>
            ) : notices.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 transition-all relative overflow-hidden group/notice shadow-sm"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-xl opacity-0 group-hover/notice:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.65rem] font-bold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded uppercase tracking-wider">{n.course_code}</span>
                  <span className={cn(
                    "text-[0.65rem] font-bold px-2 py-0.5 rounded uppercase tracking-wider border shadow-sm",
                    n.urgency === "high" 
                      ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" 
                      : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  )}>
                    {n.urgency}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1.5">{n.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 font-medium">
                  {n.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
`;

const newCode = c.substring(0, startIdx) + replacement;
fs.writeFileSync(file, newCode);
console.log("Updated page.tsx layout");
