// pages/admin/Users.jsx
// Admin manages all users across all roles

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, LogOut,
  User, Menu, X, ShieldCheck, Search,
  UserPlus, CheckCircle, AlertCircle, Send, Trash2
} from "lucide-react";

const NAV_LINKS = [
  { label:"Dashboard",   path:"/admin/dashboard",  icon: LayoutDashboard },
  { label:"Users",       path:"/admin/users",       icon: Users           },
  { label:"Departments", path:"/admin/departments", icon: Building2       },
];

const ROLES    = ["faculty", "bos", "coordinator", "dean", "admin"];
const DEPTS    = ["CSE", "ISE", "ECE", "MECH", "CIVIL"];

const ROLE_META = {
  faculty:     { color:"#2563eb", bg:"#eff6ff" },
  bos:         { color:"#7c3aed", bg:"#f5f3ff" },
  coordinator: { color:"#0f766e", bg:"#f0fdfa" },
  dean:        { color:"#d97706", bg:"#fffbeb" },
  admin:       { color:"#dc2626", bg:"#fef2f2" },
};

const MOCK_USERS = [
  { _id:"u1", name:"Mrs. Priya Sharma", role:"faculty",     department:"CSE",   subject_code:"CS601",  is_active:true  },
  { _id:"u2", name:"Mr. Ravi Kumar",    role:"faculty",     department:"CSE",   subject_code:"BCS303", is_active:true  },
  { _id:"u3", name:"Prof. Anitha Rao",  role:"bos",         department:"CSE",   subject_code:"",       is_active:true  },
  { _id:"u4", name:"Dr. Ramesh Babu",   role:"bos",         department:"ISE",   subject_code:"",       is_active:true  },
  { _id:"u5", name:"Dr. Suresh Naik",   role:"coordinator", department:"CSE",   subject_code:"",       is_active:true  },
  { _id:"u6", name:"Prof. Kavya Shetty",role:"coordinator", department:"ECE",   subject_code:"",       is_active:false },
  { _id:"u7", name:"Dr. Anand Verma",   role:"dean",        department:"",      subject_code:"",       is_active:true  },
  { _id:"u8", name:"System Admin",      role:"admin",       department:"",      subject_code:"",       is_active:true  },
];

const BLANK = { name:"", role:"faculty", department:"", subject_code:"", password:"" };

export default function AdminUsers() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user"));

  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [users,       setUsers]         = useState(MOCK_USERS);
  const [search,      setSearch]        = useState("");
  const [roleFilter,  setRoleFilter]    = useState("all");
  const [showAdd,     setShowAdd]       = useState(false);
  const [form,        setForm]          = useState(BLANK);
  const [adding,      setAdding]        = useState(false);

  const setF = (k) => (v) => setForm(f => ({ ...f, [k]:v }));

  function handleLogout() {
    if (confirm("Log out?")) { localStorage.removeItem("user"); navigate("/login"); }
  }

  function handleToggle(id) {
    setUsers(l => l.map(u => u._id === id ? { ...u, is_active:!u.is_active } : u));
    // TODO: PATCH /api/v1/users/:id { is_active }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name || !form.role || !form.password) { alert("Fill all required fields"); return; }
    if (["faculty","bos","coordinator"].includes(form.role) && !form.department) {
      alert("Department is required for this role"); return;
    }
    setAdding(true);
    // TODO: POST /api/v1/users { ...form }
    await new Promise(r => setTimeout(r, 800));
    setUsers(l => [{
      _id:         `u${Date.now()}`,
      name:        form.name,
      role:        form.role,
      department:  form.department,
      subject_code:form.subject_code,
      is_active:   true,
    }, ...l]);
    setForm(BLANK); setShowAdd(false); setAdding(false);
  }

  const visible = users
    .filter(u => roleFilter === "all" || u.role === roleFilter)
    .filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
    );

  const needsDept    = ["faculty","bos","coordinator"].includes(form.role);
  const needsSubject = form.role === "faculty";

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]"
         style={{ fontFamily:"'Figtree','Segoe UI',sans-serif" }}>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0f2744] transition-all duration-300 overflow-hidden flex-shrink-0 ${sidebarOpen ? "w-64" : "w-0 md:w-64"}`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={17} className="text-rose-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-white">Admin Panel</p>
            <p className="text-[11px] text-rose-300 font-mono">System Control</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/40 hover:text-white cursor-pointer"><X size={16} /></button>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, path, icon: Icon }) => {
            const active = window.location.pathname === path;
            return (
              <button key={path} onClick={() => { navigate(path); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${active ? "bg-white/15 text-white" : "text-rose-200 hover:bg-white/8 hover:text-white"}`}>
                <Icon size={16} strokeWidth={2} />{label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 bg-white/8 rounded-xl px-3 py-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0"><User size={14} className="text-rose-300" /></div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-rose-300">System Admin</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
            <LogOut size={15} /> Log Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm flex items-center gap-4 px-5 py-3.5">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-xl hover:bg-slate-100 cursor-pointer"><Menu size={19} className="text-slate-600" /></button>
          <div className="flex-1">
            <h1 className="font-extrabold text-slate-800 text-base">Manage Users</h1>
            <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
          </div>
          <button onClick={() => setShowAdd(true)}
                  className="flex items-center gap-2 bg-[#0f2744] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#1e3a5f] transition-all hover:-translate-y-0.5 cursor-pointer">
            <UserPlus size={14} /> Add User
          </button>
        </header>

        <main className="flex-1 p-5 md:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-rose-500" />
              <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">System Users</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">All Users</h2>
            <p className="text-slate-400 text-sm mt-0.5">Add, activate or deactivate users across all roles</p>
          </div>

          {/* Role filter tabs */}
          <div className="flex flex-wrap gap-2 mb-5">
            {["all", ...ROLES].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border capitalize
                        ${roleFilter===r ? "bg-[#0f2744] text-white border-[#0f2744] shadow" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                {r === "all" ? `All (${users.length})` : `${r} (${users.filter(u=>u.role===r).length})`}
              </button>
            ))}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 ml-auto">
              <Search size={13} className="text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                     placeholder="Search users…"
                     className="text-sm text-slate-700 outline-none bg-transparent w-36 placeholder:text-slate-300" />
            </div>
          </div>

          {/* Users table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="hidden md:grid md:grid-cols-[2fr_100px_120px_100px_110px]
                            gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100
                            text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Name</span><span>Role</span><span>Department</span><span>Status</span><span>Actions</span>
            </div>

            {visible.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                <Users size={38} className="mx-auto mb-3 opacity-20" />
                <p className="font-semibold text-sm">No users found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {visible.map(u => {
                  const meta = ROLE_META[u.role] || ROLE_META.faculty;
                  return (
                    <div key={u._id}
                         className="flex flex-col md:grid md:grid-cols-[2fr_100px_120px_100px_110px]
                                    gap-2 md:gap-4 items-start md:items-center px-6 py-4
                                    hover:bg-slate-50 transition-colors">
                      {/* Name */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                                        text-xs font-extrabold text-white"
                             style={{ background: u.is_active ? "linear-gradient(135deg,#dc2626,#7f1d1d)" : "#94a3b8" }}>
                          {u.name.split(" ").map(n => n[0]).slice(0,2).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                          {u.subject_code && <p className="text-xs text-slate-400 font-mono">{u.subject_code}</p>}
                        </div>
                      </div>

                      {/* Role */}
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full capitalize w-fit"
                            style={{ background:meta.bg, color:meta.color }}>
                        {u.role}
                      </span>

                      {/* Dept */}
                      <span className="text-sm text-slate-600">{u.department || "—"}</span>

                      {/* Status */}
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full w-fit
                        ${u.is_active ? "bg-green-50 text-green-600 border border-green-100" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                        {u.is_active ? <><CheckCircle size={10} />Active</> : <><AlertCircle size={10} />Inactive</>}
                      </span>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button onClick={() => handleToggle(u._id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer
                                  ${u.is_active
                                    ? "bg-red-50 text-red-500 border border-red-100 hover:bg-red-100"
                                    : "bg-green-50 text-green-600 border border-green-100 hover:bg-green-100"}`}>
                          {u.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ADD USER MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
             style={{ background:"rgba(0,0,0,0.45)", backdropFilter:"blur(6px)", animation:"fadeIn .15s ease" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
               style={{ animation:"slideUp .2s ease" }}>
            <div className="px-6 pt-6 pb-5 relative" style={{ background:"linear-gradient(135deg,#fef2f2,white)" }}>
              <button onClick={() => setShowAdd(false)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 cursor-pointer">
                <X size={14} className="text-slate-500" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center mb-3">
                <UserPlus size={22} className="text-rose-600" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">Add New User</h2>
              <p className="text-sm text-slate-400 mt-0.5">Create an account for any role</p>
            </div>

            <form onSubmit={handleAdd} className="px-6 py-5 flex flex-col gap-4">

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input value={form.name} onChange={e => setF("name")(e.target.value)}
                       placeholder="e.g. Dr. Anand Verma"
                       className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all placeholder:text-slate-300" />
              </div>

              {/* Role + Dept side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role *</label>
                  <select value={form.role} onChange={e => setF("role")(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all cursor-pointer capitalize">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                {needsDept && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department *</label>
                    <select value={form.department} onChange={e => setF("department")(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all cursor-pointer">
                      <option value="">Select…</option>
                      {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Subject code — only for faculty */}
              {needsSubject && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject Code</label>
                  <input value={form.subject_code} onChange={e => setF("subject_code")(e.target.value.toUpperCase())}
                         placeholder="e.g. CS601"
                         className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-mono text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all placeholder:text-slate-300" />
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password *</label>
                <input type="password" value={form.password} onChange={e => setF("password")(e.target.value)}
                       placeholder="Set a login password"
                       className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all placeholder:text-slate-300" />
              </div>

              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setShowAdd(false)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={adding}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5"
                        style={{ background: adding ? "#94a3b8" : "#dc2626", boxShadow: adding ? "none" : "0 6px 20px #dc262633" }}>
                  {adding ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Adding…</> : <><Send size={14} />Create User</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  );
}