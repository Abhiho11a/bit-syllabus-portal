// pages/bos/Faculty.jsx
// BOS — manage faculty in their department (view, add, deactivate)

import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, ClipboardList, Plus,
  LogOut, User, Menu, X, BookOpen,
  Search, Trash2, UserPlus, CheckCircle,
  AlertCircle, Send
} from "lucide-react";

const MOCK_FACULTY = [
  { id:"f1", name:"Mrs. Priya Sharma", subject_code:"CS601",  subject_name:"Machine Learning",        is_active:true,  added_date:"2025-06-01" },
  { id:"f2", name:"Mr. Ravi Kumar",    subject_code:"BCS303", subject_name:"Operating Systems",       is_active:true,  added_date:"2025-06-02" },
  { id:"f3", name:"Dr. Suresh Naik",   subject_code:"CS501",  subject_name:"Computer Networks",      is_active:true,  added_date:"2025-06-05" },
  { id:"f4", name:"Ms. Deepa Rao",     subject_code:"CS401",  subject_name:"Analysis of Algorithms", is_active:false, added_date:"2025-05-10" },
];

const NAV_LINKS = [
  { label:"Dashboard",   path:"/bos/dashboard",  icon: LayoutDashboard },
  { label:"Assign",      path:"/bos/assign",      icon: Plus            },
  { label:"Assignments", path:"/bos/assignments", icon: ClipboardList   },
  { label:"Faculty",     path:"/bos/faculty",     icon: Users           },
];

const BLANK_FORM = { name:"", subject_code:"", subject_name:"", password:"" };

export default function BosFaculty() {
  const navigate        = useNavigate();
//   const { user, logout} = useAuth();
const user = JSON.parse(localStorage.getItem("user"))

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch]           = useState("");
  const [faculty, setFaculty]         = useState(MOCK_FACULTY);
  const [showAdd, setShowAdd]         = useState(false);
  const [form, setForm]               = useState(BLANK_FORM);
  const [adding, setAdding]           = useState(false);

  const setF = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  function handleLogout() {
    if (confirm("Log out?")) { 
        // logout(); 
        navigate("/login"); }
  }

  function handleToggleActive(id) {
    setFaculty(f => f.map(m =>
      m.id === id ? { ...m, is_active: !m.is_active } : m
    ));
    // TODO: PATCH /api/v1/users/:id  { is_active: !current }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name || !form.subject_code || !form.subject_name || !form.password) {
      alert("Please fill all fields"); return;
    }
    setAdding(true);
    // TODO: POST /api/v1/users { ...form, role:"faculty", department: user?.department, created_by: user?._id }
    await new Promise(r => setTimeout(r, 800));
    const newFac = {
      id: `f${Date.now()}`,
      name:         form.name,
      subject_code: form.subject_code.toUpperCase(),
      subject_name: form.subject_name,
      is_active:    true,
      added_date:   new Date().toISOString().split("T")[0],
    };
    setFaculty(f => [newFac, ...f]);
    setForm(BLANK_FORM);
    setShowAdd(false);
    setAdding(false);
  }

  const visible = faculty.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.subject_code.toLowerCase().includes(search.toLowerCase()) ||
    f.subject_name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount   = faculty.filter(f => f.is_active).length;
  const inactiveCount = faculty.filter(f => !f.is_active).length;

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]"
         style={{ fontFamily:"'Figtree','Segoe UI',sans-serif" }}>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0f2744]
                        transition-all duration-300 overflow-hidden flex-shrink-0
                        ${sidebarOpen ? "w-64" : "w-0 md:w-64"}`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30
                          flex items-center justify-center flex-shrink-0">
            <BookOpen size={17} className="text-purple-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-white truncate">BOS Portal</p>
            <p className="text-[11px] text-purple-300 font-mono">{user?.department || "—"}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)}
                  className="md:hidden text-white/40 hover:text-white cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, path, icon: Icon }) => {
            const active = window.location.pathname === path;
            return (
              <button key={path} onClick={() => { navigate(path); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm
                                 font-semibold transition-all cursor-pointer text-left
                                 ${active ? "bg-white/15 text-white" : "text-purple-200 hover:bg-white/8 hover:text-white"}`}>
                <Icon size={16} strokeWidth={2} />{label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 bg-white/8 rounded-xl px-3 py-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-purple-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || "BOS"}</p>
              <p className="text-[10px] text-purple-300 truncate">{user?.department || "—"}</p>
            </div>
          </div>
          <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm
                             font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
            <LogOut size={15} /> Log Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden"
             onClick={() => setSidebarOpen(false)} />
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm
                           flex items-center gap-4 px-5 py-3.5">
          <button onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
            <Menu size={19} className="text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="font-extrabold text-slate-800 text-base">Faculty</h1>
            <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
          </div>
          <button onClick={() => setShowAdd(true)}
                  className="flex items-center gap-2 bg-[#0f2744] text-white text-xs font-bold
                             px-4 py-2 rounded-xl hover:bg-[#1e3a5f] transition-all
                             hover:-translate-y-0.5 cursor-pointer">
            <UserPlus size={14} /> Add Faculty
          </button>
        </header>

        <main className="flex-1 p-5 md:p-8">

          {/* Page header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-purple-500" />
              <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">
                {user?.department || "CSE"} Dept
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">Faculty Members</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Manage faculty in your department
            </p>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label:"Total",    val: faculty.length,  color:"#6d28d9", bg:"#f5f3ff", border:"#ddd6fe" },
              { label:"Active",   val: activeCount,      color:"#059669", bg:"#ecfdf5", border:"#6ee7b7" },
              { label:"Inactive", val: inactiveCount,    color:"#94a3b8", bg:"#f8fafc", border:"#e2e8f0" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-4 flex flex-col gap-1"
                   style={{ background:s.bg, border:`1.5px solid ${s.border}` }}>
                <p className="text-2xl font-extrabold" style={{ color:s.color }}>{s.val}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-slate-200
                          rounded-xl px-4 py-2.5 mb-5 shadow-sm">
            <Search size={14} className="text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
                   placeholder="Search by name, subject code…"
                   className="flex-1 text-sm text-slate-700 outline-none bg-transparent placeholder:text-slate-300" />
          </div>

          {/* Faculty cards */}
          {visible.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center shadow-sm">
              <Users size={40} className="mx-auto text-slate-200 mb-3" />
              <p className="font-bold text-slate-700">No faculty found</p>
              <button onClick={() => setShowAdd(true)}
                      className="mt-4 flex items-center gap-2 mx-auto bg-[#0f2744] text-white
                                 text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer
                                 hover:bg-[#1e3a5f] transition-all">
                <UserPlus size={14} /> Add Faculty
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {visible.map(f => (
                <div key={f.id}
                     className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5
                                hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center
                                      flex-shrink-0 text-base font-extrabold text-white"
                           style={{ background: f.is_active
                             ? "linear-gradient(135deg,#6d28d9,#4f46e5)"
                             : "#94a3b8" }}>
                        {f.name.split(" ").map(n => n[0]).slice(0,2).join("")}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{f.name}</h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{f.subject_code}</p>
                      </div>
                    </div>
                    {/* Active badge */}
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1
                      ${f.is_active
                        ? "bg-green-50 text-green-600 border border-green-100"
                        : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                      {f.is_active
                        ? <><CheckCircle size={10} /> Active</>
                        : <><AlertCircle size={10} /> Inactive</>
                      }
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 leading-snug">
                    <span className="font-semibold text-slate-700">Subject:</span> {f.subject_name}
                  </p>

                  <div className="text-[11px] text-slate-400 mb-4">
                    Added {new Date(f.added_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(f.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer
                        ${f.is_active
                          ? "bg-red-50 text-red-500 border border-red-100 hover:bg-red-100"
                          : "bg-green-50 text-green-600 border border-green-100 hover:bg-green-100"}`}
                    >
                      {f.is_active ? "Deactivate" : "Reactivate"}
                    </button>
                    <button
                      onClick={() => navigate(`/bos/assign?faculty=${f.id}`)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-purple-50
                                 text-purple-600 border border-purple-100 hover:bg-purple-100
                                 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus size={12} /> Assign Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ADD FACULTY MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
             style={{ background:"rgba(0,0,0,0.45)", backdropFilter:"blur(6px)", animation:"fadeIn .15s ease" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
               style={{ animation:"slideUp .2s ease" }}>

            <div className="px-6 pt-6 pb-5 relative"
                 style={{ background:"linear-gradient(135deg,#f5f3ff,white)" }}>
              <button onClick={() => setShowAdd(false)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100
                                 flex items-center justify-center hover:bg-slate-200 cursor-pointer">
                <X size={14} className="text-slate-500" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200
                              flex items-center justify-center mb-3">
                <UserPlus size={22} className="text-purple-600" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">Add Faculty Member</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Faculty can login using these credentials
              </p>
            </div>

            <form onSubmit={handleAdd} className="px-6 py-5 flex flex-col gap-4">
              {[
                { key:"name",         label:"Full Name",     placeholder:"e.g. Mrs. Priya Sharma",      mono:false },
                { key:"subject_code", label:"Subject Code",  placeholder:"e.g. CS601",                  mono:true  },
                { key:"subject_name", label:"Subject Name",  placeholder:"e.g. Machine Learning",       mono:false },
                { key:"password",     label:"Password",      placeholder:"Set a login password",        mono:false, type:"password" },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {field.label} *
                  </label>
                  <input
                    type={field.type || "text"}
                    value={form[field.key]}
                    onChange={e => setF(field.key)(
                      field.mono ? e.target.value.toUpperCase() : e.target.value
                    )}
                    placeholder={field.placeholder}
                    className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5
                               text-sm text-slate-800 outline-none focus:border-purple-400
                               focus:ring-2 focus:ring-purple-50 transition-all placeholder:text-slate-300
                               ${field.mono ? "font-mono" : ""}`}
                  />
                </div>
              ))}

              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex gap-2.5">
                <AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Department <span className="font-bold">{user?.department}</span> will be auto-assigned.
                  Faculty logs in with their <span className="font-bold">name + subject code + password</span>.
                </p>
              </div>

              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setShowAdd(false)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold
                                   text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={adding}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white
                                   flex items-center justify-center gap-2 transition-all cursor-pointer"
                        style={{ background: adding ? "#94a3b8" : "#6d28d9" }}>
                  {adding
                    ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Adding…</>
                    : <><Send size={14} />Add Faculty</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn  { from{opacity:0}  to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>
    </div>
  );
}