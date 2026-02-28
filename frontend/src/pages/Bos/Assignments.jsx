// pages/bos/Assignments.jsx
// All assignments BOS has made — filter by status, search, delete pending

import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, ClipboardList, Plus,
  LogOut, User, Menu, X, BookOpen,
  Search, Clock, CheckCircle, Trash2, Eye
} from "lucide-react";

const MOCK_ASSIGNMENTS = [
  { id:"a1", faculty_name:"Mrs. Priya Sharma", subject_code:"BCS300", subject_name:"Mathematics III",         sem:3, assigned_date:"2025-07-01", status:"submitted" },
  { id:"a2", faculty_name:"Mr. Ravi Kumar",    subject_code:"BCS303", subject_name:"Operating Systems",       sem:3, assigned_date:"2025-07-03", status:"pending"   },
  { id:"a3", faculty_name:"Mrs. Priya Sharma", subject_code:"CS601",  subject_name:"Machine Learning",        sem:6, assigned_date:"2025-07-05", status:"pending"   },
  { id:"a4", faculty_name:"Dr. Suresh Naik",   subject_code:"CS501",  subject_name:"Computer Networks",      sem:5, assigned_date:"2025-06-28", status:"approved"  },
  { id:"a5", faculty_name:"Mr. Ravi Kumar",    subject_code:"CS401",  subject_name:"Analysis of Algorithms", sem:4, assigned_date:"2025-06-20", status:"submitted" },
  { id:"a6", faculty_name:"Dr. Suresh Naik",   subject_code:"CS301",  subject_name:"Data Structures",        sem:3, assigned_date:"2025-06-15", status:"approved"  },
];

const STATUS_META = {
  pending:   { label:"Pending",   color:"#f59e0b", bg:"#fffbeb", border:"#fcd34d", icon: Clock        },
  submitted: { label:"Submitted", color:"#2563eb", bg:"#eff6ff", border:"#bae6fd", icon: ClipboardList },
  approved:  { label:"Approved",  color:"#059669", bg:"#ecfdf5", border:"#6ee7b7", icon: CheckCircle   },
};

const TABS = [
  { id:"all",       label:"All"       },
  { id:"pending",   label:"Pending"   },
  { id:"submitted", label:"Submitted" },
  { id:"approved",  label:"Approved"  },
];

const NAV_LINKS = [
  { label:"Dashboard",   path:"/bos/dashboard",  icon: LayoutDashboard },
  { label:"Assign",      path:"/bos/assign",      icon: Plus            },
  { label:"Assignments", path:"/bos/assignments", icon: ClipboardList   },
  { label:"Faculty",     path:"/bos/faculty",     icon: Users           },
];

export default function BosAssignments() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"))

//   const { user, logout} = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab]     = useState("all");
  const [search, setSearch]           = useState("");
  const [data, setData]               = useState(MOCK_ASSIGNMENTS);

  function handleLogout() {
    if (confirm("Log out?")) { 
        // logout();
        navigate("/login"); }
  }

  function handleDelete(id) {
    if (confirm("Delete this assignment? The faculty will lose this pending task.")) {
      setData(d => d.filter(a => a.id !== id));
      // TODO: await fetch(`/api/v1/assignments/${id}`, { method:'DELETE' })
    }
  }

  const tabCount = (id) => id === "all" ? data.length : data.filter(a => a.status === id).length;

  const visible = data
    .filter(a => activeTab === "all" || a.status === activeTab)
    .filter(a =>
      a.subject_name.toLowerCase().includes(search.toLowerCase()) ||
      a.subject_code.toLowerCase().includes(search.toLowerCase()) ||
      a.faculty_name.toLowerCase().includes(search.toLowerCase())
    );

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
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/40 hover:text-white cursor-pointer"><X size={16} /></button>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, path, icon: Icon }) => {
            const active = window.location.pathname === path;
            return (
              <button key={path} onClick={() => { navigate(path); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold
                                 transition-all cursor-pointer text-left
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
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold
                             text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
            <LogOut size={15} /> Log Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* MAIN */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm flex items-center gap-4 px-5 py-3.5">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
            <Menu size={19} className="text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="font-extrabold text-slate-800 text-base">All Assignments</h1>
            <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
          </div>
          <button onClick={() => navigate("/bos/assign")}
                  className="flex items-center gap-2 bg-[#0f2744] text-white text-xs font-bold
                             px-4 py-2 rounded-xl hover:bg-[#1e3a5f] transition-all hover:-translate-y-0.5 cursor-pointer">
            <Plus size={14} /> Assign New
          </button>
        </header>

        <main className="flex-1 p-5 md:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList size={16} className="text-purple-500" />
              <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">Assignments</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">All Assignments</h2>
            <p className="text-slate-400 text-sm mt-0.5">Track syllabus assignments across all faculty</p>
          </div>

          {/* Tabs + search */}
          <div className="flex flex-wrap gap-2 mb-5">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold
                                 transition-all cursor-pointer border
                        ${activeTab === t.id
                          ? "bg-[#0f2744] text-white border-[#0f2744] shadow"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                {t.label}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold
                  ${activeTab === t.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {tabCount(t.id)}
                </span>
              </button>
            ))}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 ml-auto">
              <Search size={13} className="text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                     placeholder="Search faculty, subject…"
                     className="text-sm text-slate-700 outline-none bg-transparent w-36 placeholder:text-slate-300" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="hidden md:grid md:grid-cols-[2fr_120px_60px_1fr_130px_90px]
                            gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100
                            text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Subject</span><span>Code</span><span>Sem</span>
              <span>Faculty</span><span>Status</span><span>Actions</span>
            </div>

            {visible.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <ClipboardList size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-semibold text-sm">No assignments found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {visible.map(a => {
                  const meta = STATUS_META[a.status];
                  const Icon = meta.icon;
                  return (
                    <div key={a.id}
                         className="flex flex-col md:grid md:grid-cols-[2fr_120px_60px_1fr_130px_90px]
                                    gap-2 md:gap-4 items-start md:items-center px-6 py-4
                                    hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{a.subject_name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(a.assigned_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                        </p>
                      </div>
                      <span className="font-mono text-sm text-slate-600">{a.subject_code}</span>
                      <span className="text-sm text-slate-600">Sem {a.sem}</span>
                      <span className="text-sm text-slate-600">{a.faculty_name}</span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full w-fit"
                            style={{ background:meta.bg, color:meta.color, border:`1px solid ${meta.border}` }}>
                        <Icon size={10} strokeWidth={2.5} />{meta.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <button title="View submission"
                                className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200
                                           flex items-center justify-center text-slate-500
                                           hover:bg-slate-200 transition-colors cursor-pointer">
                          <Eye size={13} />
                        </button>
                        {a.status === "pending" && (
                          <button onClick={() => handleDelete(a.id)} title="Delete assignment"
                                  className="w-8 h-8 rounded-lg bg-red-50 border border-red-100
                                             flex items-center justify-center text-red-400
                                             hover:bg-red-100 transition-colors cursor-pointer">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}