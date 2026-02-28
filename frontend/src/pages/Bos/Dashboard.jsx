// pages/bos/Dashboard.jsx
// BOS Dashboard — stats + recent assignments + quick assign modal

import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, ClipboardList, LogOut,
  User, Menu, X, BookOpen, GraduationCap,
  ArrowRight, CheckCircle, Clock,
  TrendingUp, Plus, Send
} from "lucide-react";

// ── Mock data — replace with API ─────────────────────────────────
const MOCK_STATS = { totalAssigned:8, submitted:5, pending:3, approved:4 };

const MOCK_RECENT = [
  { id:"a1", faculty_name:"Mrs. Priya Sharma", subject_code:"BCS300", subject_name:"Mathematics III",   sem:3, status:"submitted" },
  { id:"a2", faculty_name:"Mr. Ravi Kumar",    subject_code:"BCS303", subject_name:"Operating Systems", sem:3, status:"pending"   },
  { id:"a3", faculty_name:"Mrs. Priya Sharma", subject_code:"CS601",  subject_name:"Machine Learning",  sem:6, status:"pending"   },
  { id:"a4", faculty_name:"Dr. Suresh Naik",   subject_code:"CS501",  subject_name:"Computer Networks", sem:5, status:"submitted" },
];

const MOCK_FACULTY = [
  { id:"f1", name:"Mrs. Priya Sharma"  },
  { id:"f2", name:"Mr. Ravi Kumar"     },
  { id:"f3", name:"Dr. Suresh Naik"   },
];

const STATUS_META = {
  pending:   { label:"Pending",   color:"#f59e0b", bg:"#fffbeb", border:"#fcd34d", icon: Clock         },
  submitted: { label:"Submitted", color:"#2563eb", bg:"#eff6ff", border:"#bae6fd", icon: ClipboardList  },
  approved:  { label:"Approved",  color:"#059669", bg:"#ecfdf5", border:"#6ee7b7", icon: CheckCircle    },
};

const NAV_LINKS = [
  { label:"Dashboard",   path:"/bos/dashboard",  icon: LayoutDashboard },
  { label:"Assign",      path:"/bos/assign",      icon: Plus            },
  { label:"Assignments", path:"/bos/assignments", icon: ClipboardList   },
  { label:"Faculty",     path:"/bos/faculty",     icon: Users           },
];

const CARDS = [
  { label:"Total Assigned", value: MOCK_STATS.totalAssigned, icon: ClipboardList, color:"#6d28d9", bg:"#f5f3ff", border:"#ddd6fe" },
  { label:"Pending",        value: MOCK_STATS.pending,       icon: Clock,         color:"#f59e0b", bg:"#fffbeb", border:"#fcd34d" },
  { label:"Submitted",      value: MOCK_STATS.submitted,     icon: CheckCircle,   color:"#2563eb", bg:"#eff6ff", border:"#bae6fd" },
  { label:"Approved",       value: MOCK_STATS.approved,      icon: GraduationCap, color:"#059669", bg:"#ecfdf5", border:"#6ee7b7" },
];

export default function BosDashboard() {
  const navigate        = useNavigate();
//   const { user, logout} = useAuth();
const user = JSON.parse(localStorage.getItem("user"))

  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [showModal, setShowModal]         = useState(false);
  const [form, setForm]                   = useState({ faculty_id:"", subject_code:"", subject_name:"", sem:"" });
  const [assigning, setAssigning]         = useState(false);

  const setF = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  function handleLogout() {
    if (confirm("Log out?")) { 
        // logout(); 
        navigate("/login"); }
  }

  async function handleAssign(e) {
    e.preventDefault();
    if (!form.faculty_id || !form.subject_code || !form.subject_name || !form.sem) {
      alert("Please fill all fields"); return;
    }
    setAssigning(true);
    // TODO: await api.post('/api/assignments', { ...form, department: user?.department, assigned_by: user?._id })
    await new Promise(r => setTimeout(r, 800));
    alert("✅ Assigned successfully! Faculty will see this in their pending tasks.");
    setForm({ faculty_id:"", subject_code:"", subject_name:"", sem:"" });
    setShowModal(false);
    setAssigning(false);
  }

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]"
         style={{ fontFamily:"'Figtree','Segoe UI',sans-serif" }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════ */}
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
              <button key={path}
                      onClick={() => { navigate(path); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm
                                 font-semibold transition-all cursor-pointer text-left
                                 ${active ? "bg-white/15 text-white" : "text-purple-200 hover:bg-white/8 hover:text-white"}`}>
                <Icon size={16} strokeWidth={2} />
                <span className="flex-1">{label}</span>
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
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ══ MAIN ═════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">

        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm
                           flex items-center gap-4 px-5 py-3.5">
          <button onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
            <Menu size={19} className="text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="font-extrabold text-slate-800 text-base">Dashboard</h1>
            <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
          </div>
          <button onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-[#0f2744] text-white text-xs font-bold
                             px-4 py-2 rounded-xl hover:bg-[#1e3a5f] transition-all
                             hover:-translate-y-0.5 cursor-pointer">
            <Plus size={14} /> Assign Syllabus
          </button>
        </header>

        <main className="flex-1 p-5 md:p-8">

          {/* Banner */}
          <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
               style={{ background:"linear-gradient(135deg,#3b1fa8 0%,#1e3a5f 100%)" }}>
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
                 style={{ background:"radial-gradient(circle,#a78bfa,transparent)" }} />
            <p className="text-purple-300 text-xs font-bold tracking-widest uppercase mb-1">BOS Portal</p>
            <h2 className="text-white text-xl md:text-2xl font-extrabold mb-0.5">
              Welcome, {user?.name?.split(" ")[0] || "BOS"} 👋
            </h2>
            <p className="text-purple-200 text-sm mb-5">
              Board of Studies · <span className="font-bold text-white">{user?.department || "CSE"}</span>
            </p>

            <div className="max-w-xs mb-5">
              <div className="flex justify-between text-xs text-purple-300 mb-1.5">
                <span>Submission Progress</span>
                <span className="font-bold text-white">
                  {Math.round((MOCK_STATS.submitted / MOCK_STATS.totalAssigned) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full"
                     style={{
                       width:`${Math.round((MOCK_STATS.submitted / MOCK_STATS.totalAssigned) * 100)}%`,
                       background:"linear-gradient(90deg,#a78bfa,#34d399)"
                     }} />
              </div>
              <p className="text-purple-300 text-xs mt-1.5">
                {MOCK_STATS.submitted} of {MOCK_STATS.totalAssigned} syllabi submitted by faculty
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowModal(true)}
                      className="flex items-center gap-2 bg-white text-[#3b1fa8] text-sm font-bold
                                 px-5 py-2.5 rounded-xl hover:bg-purple-50 transition-all
                                 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg w-fit">
                <Plus size={15} /> Assign Syllabus
              </button>
              <button onClick={() => navigate("/bos/assignments")}
                      className="flex items-center gap-2 bg-white/10 border border-white/20
                                 text-white text-sm font-bold px-5 py-2.5 rounded-xl
                                 hover:bg-white/20 transition-all cursor-pointer hover:-translate-y-0.5 w-fit">
                View All <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
            {CARDS.map(({ label, value, icon: Icon, color, bg, border }) => (
              <button key={label} onClick={() => navigate("/bos/assignments")}
                      className="rounded-2xl p-5 text-left flex flex-col gap-2
                                 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer"
                      style={{ background:bg, border:`1.5px solid ${border}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ background:`${color}18` }}>
                  <Icon size={19} style={{ color }} strokeWidth={2} />
                </div>
                <p className="text-3xl font-extrabold leading-none mt-1" style={{ color }}>{value}</p>
                <p className="text-xs font-bold text-slate-700">{label}</p>
                <div className="flex items-center gap-1 mt-auto pt-1" style={{ color }}>
                  <span className="text-[11px] font-bold">View</span>
                  <ArrowRight size={11} />
                </div>
              </button>
            ))}
          </div>

          {/* Recent assignments */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-purple-600" />
                <h3 className="font-bold text-slate-800">Recent Assignments</h3>
              </div>
              <button onClick={() => navigate("/bos/assignments")}
                      className="text-xs text-purple-600 font-bold flex items-center gap-1
                                 hover:text-purple-800 transition-colors cursor-pointer">
                View All <ArrowRight size={12} />
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {MOCK_RECENT.map(a => {
                const meta = STATUS_META[a.status];
                const Icon = meta.icon;
                return (
                  <div key={a.id}
                       className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100
                                      flex items-center justify-center flex-shrink-0">
                        <BookOpen size={16} className="text-purple-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{a.subject_name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          <span className="font-mono">{a.subject_code}</span> · {a.faculty_name}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold
                                     px-2.5 py-1 rounded-full"
                          style={{ background:meta.bg, color:meta.color, border:`1px solid ${meta.border}` }}>
                      <Icon size={10} strokeWidth={2.5} /> {meta.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* ══ ASSIGN MODAL ═════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
             style={{ background:"rgba(0,0,0,0.45)", backdropFilter:"blur(6px)", animation:"fadeIn .15s ease" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
               style={{ animation:"slideUp .2s ease" }}>

            <div className="px-6 pt-6 pb-5 relative"
                 style={{ background:"linear-gradient(135deg,#f5f3ff,white)" }}>
              <button onClick={() => setShowModal(false)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100
                                 flex items-center justify-center hover:bg-slate-200 cursor-pointer">
                <X size={14} className="text-slate-500" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200
                              flex items-center justify-center mb-3">
                <Plus size={22} className="text-purple-600" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">Assign Syllabus</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                This will appear as a pending task for the selected faculty
              </p>
            </div>

            <form onSubmit={handleAssign} className="px-6 py-5 flex flex-col gap-4">

              {[
                { key:"faculty_id", label:"Select Faculty", type:"select" },
                { key:"subject_code", label:"Subject Code", type:"text", placeholder:"e.g. BCS300", mono:true },
                { key:"subject_name", label:"Subject Name", type:"text", placeholder:"e.g. Mathematics III" },
                { key:"sem", label:"Semester", type:"select-sem" },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <select value={form.faculty_id}
                            onChange={e => setF("faculty_id")(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5
                                       text-sm text-slate-800 outline-none focus:border-purple-400
                                       focus:ring-2 focus:ring-purple-50 transition-all cursor-pointer">
                      <option value="">Choose faculty…</option>
                      {MOCK_FACULTY.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  ) : field.type === "select-sem" ? (
                    <select value={form.sem} onChange={e => setF("sem")(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5
                                       text-sm text-slate-800 outline-none focus:border-purple-400
                                       focus:ring-2 focus:ring-purple-50 transition-all cursor-pointer">
                      <option value="">Select semester…</option>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  ) : (
                    <input value={form[field.key]}
                           onChange={e => setF(field.key)(
                             field.mono ? e.target.value.toUpperCase() : e.target.value
                           )}
                           placeholder={field.placeholder}
                           className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5
                                      text-sm text-slate-800 outline-none focus:border-purple-400
                                      focus:ring-2 focus:ring-purple-50 transition-all placeholder:text-slate-300
                                      ${field.mono ? "font-mono" : ""}`} />
                  )}
                </div>
              ))}

              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setShowModal(false)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold
                                   text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={assigning}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white
                                   flex items-center justify-center gap-2 transition-all cursor-pointer"
                        style={{ background: assigning ? "#94a3b8" : "#6d28d9" }}>
                  {assigning
                    ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Assigning…</>
                    : <><Send size={14} />Assign to Faculty</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>
    </div>
  );
}