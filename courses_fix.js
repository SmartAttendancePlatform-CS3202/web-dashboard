const fs = require('fs');
let code = fs.readFileSync('src/app/courses/page.tsx', 'utf8');

code = code.replace(
  'const [searchTerm, setSearchTerm] = useState("");',
  'const [searchTerm, setSearchTerm] = useState("");\n  const [semesterFilter, setSemesterFilter] = useState("all");\n  const [dayFilter, setDayFilter] = useState("all");'
);

code = code.replace(
  'const filteredOfferings = offerings.filter(o => \n    (o.course_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || \n    (o.course_code?.toLowerCase() || "").includes(searchTerm.toLowerCase())\n  );',
  `const filteredOfferings = offerings.filter(o => {
    const matchSearch = (o.course_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                        (o.course_code?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchSem = semesterFilter === "all" || o.semester === semesterFilter;
    const matchDay = dayFilter === "all" || o.day === dayFilter;
    return matchSearch && matchSem && matchDay;
  });

  const semesters = Array.from(new Set(offerings.map(o => o.semester).filter(Boolean)));
  const days = Array.from(new Set(offerings.map(o => o.day).filter(Boolean)));`
);

const searchBarBlock = `          {/* Search Bar */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
              <input 
                type="text" 
                placeholder="Search by course code or name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
              />
            </div>
          </div>`;

const replaceBlock = `          {/* Search and Filters Bar */}
          <div className="glass-card" style={{ display: "flex", flexWrap: "wrap", gap: "16px", padding: "16px", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
              <input 
                type="text" 
                placeholder="Search by course code or name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="all" style={{ color: "black" }}>All Semesters</option>
                {semesters.map(sem => <option key={sem} value={sem} style={{ color: "black" }}>{sem}</option>)}
              </select>
              
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="all" style={{ color: "black" }}>All Days</option>
                {days.map(day => <option key={day} value={day} style={{ color: "black" }}>{day}</option>)}
              </select>
            </div>
          </div>`;

code = code.replace(searchBarBlock, replaceBlock);

fs.writeFileSync('src/app/courses/page.tsx', code);
