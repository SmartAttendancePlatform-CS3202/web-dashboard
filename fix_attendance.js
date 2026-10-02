const fs = require('fs');
let file = 'src/app/attendance/page.tsx';
let c = fs.readFileSync(file, 'utf8');

// Fix options styles
c = c.replace(/style={{ backgroundColor: "#111827" }}/g, 'className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"');

// Add "All Courses" and "All Sessions" options
c = c.replace(/onChange={\(e\) => setSelectedOfferingId\(e\.target\.value\)}\s*>\s*\{offerings\.map/g, 'onChange={(e) => setSelectedOfferingId(e.target.value)}>\n              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Courses</option>\n              {offerings.map');
c = c.replace(/onChange={\(e\) => setSelectedSessionId\(e\.target\.value\)}\s*>\s*\{sessions\.map/g, 'onChange={(e) => setSelectedSessionId(e.target.value)}>\n              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Sessions</option>\n              {sessions.map');

// Update data fetching logic
let fetchLogicTarget = `if (targetSessionId) {
          const recs = await attendanceApi.getAttendanceRecords(targetSessionId);
          setRecords(recs);
        } else {
          setRecords([]);
        }`;

let fetchLogicReplacement = `if (targetSessionId && targetSessionId !== "all") {
          const recs = await attendanceApi.getAttendanceRecords(targetSessionId);
          setRecords(recs);
        } else if (targetSessionId === "all" || (targetSessionId === null && selectedOfferingId === "all")) {
          // We fetch all records for all sessions if "all" is selected
          const allRecs = [];
          const sessionList = targetSessionId === "all" ? sessions : await attendanceApi.getSessions();
          for (const s of sessionList) {
             if (selectedOfferingId !== "all" && s.course_offering_id !== selectedOfferingId) continue;
             const recs = await attendanceApi.getAttendanceRecords(s.id).catch(() => []);
             allRecs.push(...recs);
          }
          setRecords(allRecs);
        } else {
          setRecords([]);
        }`;

c = c.replace(fetchLogicTarget, fetchLogicReplacement);

fs.writeFileSync(file, c);
