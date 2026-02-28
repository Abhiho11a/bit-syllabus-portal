// pages/faculty/Pending.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
import {
  Clock, BookOpen, ArrowRight, CheckCircle,
  Search, Calendar, GraduationCap, LayoutDashboard,
  FileText, LogOut, User, Menu, X
} from "lucide-react";

// ── Mock data — replace with API call ────────────────────────────
const MOCK_PENDING = [
  { id:"a1", subject_code:"BCS300", subject_name:"Mathematics III",         sem:3, assigned_date:"2025-07-01", assigned_by:"Prof. Anitha Rao" },
  { id:"a2", subject_code:"BCS303", subject_name:"Operating Systems",       sem:3, assigned_date:"2025-07-03", assigned_by:"Prof. Anitha Rao" },
  { id:"a3", subject_code:"CS601",  subject_name:"Machine Learning",        sem:6, assigned_date:"2025-07-05", assigned_by:"Prof. Anitha Rao" },
  { id:"a4", subject_code:"CS501",  subject_name:"Computer Networks",       sem:5, assigned_date:"2025-06-28", assigned_by:"Prof. Anitha Rao" },
];

const NAV_LINKS = [
  { label:"Dashboard",     path:"/faculty/dashboard", icon: LayoutDashboard },
  { label:"Pending Tasks", path:"/faculty/pending",   icon: Clock           },
  { label:"Submitted",     path:"/faculty/submitted", icon: FileText         },
];

function daysSince(d) {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
}

function UrgencyBadge({ days }) {
  if (days > 14) return (
    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-500 border border-red-100">
      Overdue · {days}d
    </span>
  );
  if (days > 7) return (
    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-500 border border-amber-100">
      Due soon · {days}d
    </span>
  );
  return (
    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 border border-slate-100">
      {days}d ago
    </span>
  );
}

export default function FacultyPending() {
  const navigate        = useNavigate();
//   const { user, logout} = useAuth();
const user = JSON.parse(localStorage.getItem("user"))

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch]           = useState("");
  const [semFilter, setSemFilter]     = useState("all");

  const sems     = [...new Set(MOCK_PENDING.map(t => t.sem))].sort();
  const filtered = MOCK_PENDING
    .filter(t => semFilter === "all" || t.sem === Number(semFilter))
    .filter(t =>
      t.subject_name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject_code.toLowerCase().includes(search.toLowerCase())
    );

  function handleLogout() {
    if (confirm("Log out?")) { 
        // logout(); 
        navigate("/login"); }
  }

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]"
         style={{ fontFamily:"'Figtree','Segoe UI',sans-serif" }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════ */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0f2744]
                        transition-all duration-300 overflow-hidden flex-shrink-0
                        ${sidebarOpen ? "w-64" : "w-0 md:w-64"}`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30
                          flex items-center justify-center flex-shrink-0">
            <GraduationCap size={17} className="text-blue-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-white truncate">Faculty Portal</p>
            <p className="text-[11px] text-blue-300 font-mono">{user?.department || "—"}</p>
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
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
                                 text-sm font-semibold transition-all cursor-pointer text-left
                                 ${active ? "bg-white/15 text-white" : "text-blue-200 hover:bg-white/8 hover:text-white"}`}>
                <Icon size={16} strokeWidth={2} />
                <span className="flex-1">{label}</span>
                {label === "Pending Tasks" && MOCK_PENDING.length > 0 && (
                  <span className="text-[10px] font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full">
                    {MOCK_PENDING.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 bg-white/8 rounded-xl px-3 py-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-blue-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || "Faculty"}</p>
              <p className="text-[10px] text-blue-300 font-mono truncate">{user?.subject_code || "—"}</p>
            </div>
          </div>
          <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
                             text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
            <LogOut size={15} /> Log Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ══ MAIN ═════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm
                           flex items-center gap-4 px-5 py-3.5">
          <button onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
            <Menu size={19} className="text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="font-extrabold text-slate-800 text-base">Pending Tasks</h1>
            <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
            <Clock size={13} className="text-amber-500" />
            <span className="text-xs font-bold text-amber-600">{MOCK_PENDING.length} Pending</span>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">

          {/* Page title */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Assigned by BOS</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">Your Pending Tasks</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {MOCK_PENDING.length} subject{MOCK_PENDING.length !== 1 ? "s" : ""} waiting for syllabus
            </p>
          </div>

          {/* Filter bar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm
                          px-5 py-4 flex flex-wrap gap-3 items-center mb-6">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200
                            rounded-xl px-3.5 py-2 flex-1 min-w-48">
              <Search size={14} className="text-slate-400 flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                     placeholder="Search subject or code…"
                     className="bg-transparent text-sm text-slate-700 outline-none w-full placeholder:text-slate-300" />
            </div>
            <select value={semFilter} onChange={e => setSemFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2
                               text-sm text-slate-700 outline-none cursor-pointer">
              <option value="all">All Semesters</option>
              {sems.map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
            <span className="text-xs text-slate-400 font-medium ml-auto">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Cards */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center shadow-sm">
              <CheckCircle size={44} className="mx-auto text-green-300 mb-3" />
              <p className="font-bold text-slate-700 text-lg">All caught up!</p>
              <p className="text-slate-400 text-sm mt-1">No pending tasks match your filter.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map(task => {
                const days = daysSince(task.assigned_date);
                return (
                  <div key={task.id}
                       className="bg-white rounded-2xl border border-slate-100 shadow-sm
                                  overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    {/* urgency stripe */}
                    <div className="h-1.5" style={{
                      background: days > 14
                        ? "linear-gradient(90deg,#f87171,#ef4444)"
                        : days > 7
                        ? "linear-gradient(90deg,#fbbf24,#f59e0b)"
                        : "linear-gradient(90deg,#60a5fa,#3b82f6)"
                    }} />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100
                                          flex items-center justify-center flex-shrink-0">
                            <BookOpen size={18} className="text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm leading-snug">
                              {task.subject_name}
                            </h3>
                            <span className="font-mono text-xs text-slate-400 mt-0.5 block">
                              {task.subject_code}
                            </span>
                          </div>
                        </div>
                        <UrgencyBadge days={days} />
                      </div>

                      <div className="flex gap-4 mb-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center
                                           font-bold text-[10px] text-slate-600">S{task.sem}</span>
                          Semester {task.sem}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar size={11} className="text-slate-400" />
                          {new Date(task.assigned_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 mb-4">
                        Assigned by <span className="font-semibold text-slate-600">{task.assigned_by}</span>
                      </p>

                      <button
                        onClick={() => navigate(`/faculty/syllabus/${task.id}`)}
                        className="w-full flex items-center justify-center gap-2
                                   bg-[#0f2744] text-white text-sm font-bold py-2.5 rounded-xl
                                   hover:bg-[#1e3a5f] transition-all hover:-translate-y-0.5 cursor-pointer"
                      >
                        Fill Syllabus <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}