const fs = require('fs');
const file = 'src/app/admin/users/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The replacement code for the Add User Modal
const newModal = `      {/* Add User Modal */}
      {isAddingStudent && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <ShieldAlertIcon size={20} className="text-cyan-500" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Register New User
                </h3>
              </div>
              <button
                onClick={() => setIsAddingStudent(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form onSubmit={handleRegisterStudent} className="flex flex-col gap-4" autoComplete="off">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
                    <input
                      type="email"
                      className="input-control"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                      required
                      autoComplete="new-email"
                      name="new_user_email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Password</label>
                    <input
                      type="password"
                      className="input-control"
                      value={newStudent.password}
                      onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      name="new_user_password"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Role</label>
                    <select
                      className="input-control"
                      value={(newStudent as any).role || "student"}
                      onChange={(e) => setNewStudent({...newStudent, role: e.target.value} as any)}
                      required
                    >
                      <option value="student">Student</option>
                      <option value="lecturer">Lecturer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      {((newStudent as any).role === "lecturer" || (newStudent as any).role === "admin") ? "Employee ID" : "Student Index No"}
                    </label>
                    <input
                      type="text"
                      className="input-control"
                      value={newStudent.student_index_no}
                      onChange={(e) => setNewStudent({...newStudent, student_index_no: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">NIC (Optional)</label>
                    <input
                      type="text"
                      className="input-control"
                      value={newStudent.nic}
                      onChange={(e) => setNewStudent({...newStudent, nic: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Date of Birth</label>
                    <input
                      type="date"
                      className="input-control"
                      value={newStudent.date_of_birth}
                      onChange={(e) => setNewStudent({...newStudent, date_of_birth: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    className="input-control"
                    value={newStudent.full_name}
                    onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Name with Initials</label>
                    <input
                      type="text"
                      className="input-control"
                      value={newStudent.name_with_initials}
                      onChange={(e) => setNewStudent({...newStudent, name_with_initials: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Display Name</label>
                    <input
                      type="text"
                      className="input-control"
                      value={newStudent.display_name}
                      onChange={(e) => setNewStudent({...newStudent, display_name: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Gender</label>
                    <select
                      className="input-control"
                      value={newStudent.gender}
                      onChange={(e) => setNewStudent({...newStudent, gender: e.target.value})}
                      required
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Contact Number</label>
                    <input
                      type="text"
                      className="input-control"
                      value={newStudent.contact_number}
                      onChange={(e) => setNewStudent({...newStudent, contact_number: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Address</label>
                  <input
                    type="text"
                    className="input-control"
                    value={newStudent.address}
                    onChange={(e) => setNewStudent({...newStudent, address: e.target.value})}
                  />
                </div>

                {((newStudent as any).role === "student" || (newStudent as any).role === "lecturer") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Academic Department</label>
                      <select
                        className="input-control"
                        value={newStudent.department_id}
                        onChange={(e) => setNewStudent({...newStudent, department_id: e.target.value})}
                        required
                      >
                        <option value="" disabled>Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.code} - {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {(!newStudent.role || (newStudent as any).role === "student") && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Academic Year</label>
                        <select
                          className="input-control"
                          value={newStudent.academic_year_id}
                          onChange={(e) => setNewStudent({...newStudent, academic_year_id: e.target.value})}
                          required
                        >
                          <option value="" disabled>Select Year</option>
                          {academicYears.map((yr) => (
                            <option key={yr.id} value={yr.id}>
                              {yr.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingStudent(false)}
                    className="btn-secondary flex-1 py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1 py-2.5"
                    disabled={isSaving}
                  >
                    {isSaving ? "Registering..." : "Register User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}`;

// We replace everything from {/* Add Student Modal */} to the end of that block.
// The easiest way is using regex from {\/\* Add Student Modal \*\/} to the end of the file before </AdminDashboardLayout>
content = content.replace(/{\/\* Add Student Modal \*\/}[\s\S]*?(?=<\/AdminDashboardLayout>)/, newModal + '\n    ');

fs.writeFileSync(file, content);
