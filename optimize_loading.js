const fs = require('fs');

// 1. Optimize page.tsx
let pageCode = fs.readFileSync('src/app/page.tsx', 'utf8');

const oldPromiseAll = `        const [sess, rep, tr, al, nots] = await Promise.all([
          attendanceApi.getSessions(),
          activeOffId ? reportsApi.getOfferingReport(activeOffId).catch(() => null) : Promise.resolve(null),
          activeOffId ? reportsApi.getOfferingTrends(activeOffId).catch(() => null) : Promise.resolve(null),
          alertsApi.getAlerts().catch(() => []),
          noticesApi.getNotices().catch(() => []),
        ]);`;

const newPromiseAll = `        const [sess, rep, nots] = await Promise.all([
          attendanceApi.getSessions(),
          activeOffId ? reportsApi.getOfferingReport(activeOffId).catch(() => null) : Promise.resolve(null),
          noticesApi.getNotices().catch(() => []),
        ]);`;

pageCode = pageCode.replace(oldPromiseAll, newPromiseAll);

const oldSet = `        setSessions(mySessions);
        setReport(rep as OfferingReport | null);
        setTrends(tr as TrendData | null);
        setAlerts(al);
        setNotices(myNotices);`;

const newSet = `        setSessions(mySessions);
        setReport(rep as OfferingReport | null);
        setNotices(myNotices);`;

pageCode = pageCode.replace(oldSet, newSet);
fs.writeFileSync('src/app/page.tsx', pageCode);

// 2. Optimize services.ts hydrateSessions
let svcCode = fs.readFileSync('src/lib/api/services.ts', 'utf8');

const oldHydrate = `async function hydrateSessions(raw:any[]): Promise<LectureSession[]> {
  // Fetch offerings directly (single API call — no more hydrateOfferings chain)
  const offerings = await memoFetch<any[]>(\`\${API_CONFIG.scheduling}/offerings\`).catch(()=>[] as any[]);
  const om = new Map(offerings.map((o:any)=>[o.id,o]));
  return (raw||[]).map((s:any)=>({
    ...s,
    course_code: om.get(s.course_offering_id)?.course_code,
    course_name: om.get(s.course_offering_id)?.course_name,
    venue_name: om.get(s.course_offering_id)?.venue_name,
    lecturer_id: om.get(s.course_offering_id)?.lecturer_id,
    lecturer_name: om.get(s.course_offering_id)?.lecturer_name,
  }));
}`;

// Make hydrateSessions optionally accept offerings map to avoid re-fetching!
const newHydrate = `async function hydrateSessions(raw:any[]): Promise<LectureSession[]> {
  // We use caching via memoFetch for offerings
  const offerings = await memoFetch<any[]>(\`\${API_CONFIG.scheduling}/offerings\`).catch(()=>[] as any[]);
  const om = new Map(offerings.map((o:any)=>[o.id,o]));
  return (raw||[]).map((s:any)=>({
    ...s,
    course_code: om.get(s.course_offering_id)?.course_code || s.course_code,
    course_name: om.get(s.course_offering_id)?.course_name || s.course_name,
    venue_name: om.get(s.course_offering_id)?.venue_name || s.venue_name,
    lecturer_id: om.get(s.course_offering_id)?.lecturer_id || s.lecturer_id,
    lecturer_name: om.get(s.course_offering_id)?.lecturer_name || s.lecturer_name,
  }));
}`;

svcCode = svcCode.replace(oldHydrate, newHydrate);
fs.writeFileSync('src/lib/api/services.ts', svcCode);

console.log("Optimized page.tsx and services.ts");
