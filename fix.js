const fs = require('fs');
let code = fs.readFileSync('src/app/session/live/page.tsx', 'utf8');

code = code.replace(
  'if (sess) setSession(sess);',
  'if (sess) setSession(sess);\n        if (sess && !hasSynced && recs && recs.length === 0) {\n          setHasSynced(true);\n          attendanceApi.syncSessionRoster(sessionId).then(() => attendanceApi.getAttendanceRecords(sessionId).then(setRecords)).catch(console.error);\n        }'
);

code = code.replace(
  'No check-in records recorded for this session yet.',
  'No check-in records recorded for this session yet. Click "Sync Full Roster" to load enrolled students.'
);

code = code.replace(
  'records.map((record) => {',
  'records.filter((record) => {\n                  if (filter === "all") return true;\n                  if (filter === "marked") return record.status === "present" || record.is_manually_overridden;\n                  if (filter === "late") return record.status === "late";\n                  if (filter === "flagged") return record.status === "flagged_proxy";\n                  if (filter === "absent") return record.status === "absent" && !record.first_check_in_at;\n                  if (filter === "partial") return record.first_check_in_at && record.status !== "present" && !record.is_manually_overridden;\n                  return true;\n                }).map((record) => {'
);

fs.writeFileSync('src/app/session/live/page.tsx', code);
