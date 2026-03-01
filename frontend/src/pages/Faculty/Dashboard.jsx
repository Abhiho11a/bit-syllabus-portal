// pages/faculty/Dashboard.jsx — fully dynamic

import { useNavigate } from "react-router-dom";
import {
  Clock, CheckCircle, AlertCircle, FileText,
  ArrowRight, BookOpen, TrendingUp,
  GraduationCap, LayoutDashboard, LogOut,
  User, Menu, X
} from "lucide-react";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label:"Dashboard",     path:"/faculty/dashboard", icon: LayoutDashboard },
  { label:"Pending Tasks", path:"/faculty/pending",   icon: Clock           },
  { label:"Submitted",     path:"/faculty/submitted", icon: FileText         },
];

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user"));

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats,       setStats]       = useState({ pending:0, submitted:0, approved:0, rejected:0 });
  const [recent,      setRecent]      = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // fetch ALL assignments for this faculty
      const res  = await fetch(
        `http://127.0.0.1:8000/api/v1/assignments?faculty_id=${user?.id}`
      );
      const data = await res.json();
      const all  = data.assignments || [];

      // compute stats from response
      setStats({
        pending:   all.filter(a => a.status === "pending").length,
        submitted: all.filter(a => a.status === "submitted").length,
        approved:  all.filter(a => a.status === "approved").length,
        rejected:  all.filter(a => a.status === "rejected").length,
      });

      // recent pending — latest 3
      setRecent(
        all
          .filter(a => a.status === "pending")
          .slice(0, 3)
      );
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    if (confirm("Log out?")) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }

  const total   = stats.pending + stats.submitted + stats.approved + stats.rejected;
  const done    = stats.submitted + stats.approved + stats.rejected;
  const donePct = total ? Math.round((done / total) * 100) : 0;

  const CARDS = [
    { label:"Pending Tasks",  value: stats.pending,   icon: Clock,         color:"#f59e0b", bg:"#fffbeb", border:"#fcd34d", desc:"Subjects assigned by BOS",  path:"/faculty/pending"   },
    { label:"Submitted",      value: stats.submitted, icon: FileText,      color:"#2563eb", bg:"#eff6ff", border:"#bae6fd", desc:"Syllabi submitted so far",   path:"/faculty/submitted" },
    { label:"Approved",       value: stats.approved,  icon: CheckCircle,   color:"#059669", bg:"#ecfdf5", border:"#6ee7b7", desc:"Approved by coordinator",    path:"/faculty/submitted" },
    { label:"Needs Revision", value: stats.rejected,  icon: AlertCircle,   color:"#dc2626", bg:"#fef2f2", border:"#fca5a5", desc:"Sent back for correction",   path:"/faculty/submitted" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]"
         style={{ fontFamily:"'Figtree','Segoe UI',sans-serif" }}>

      {/* SIDEBAR */}
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

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
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
                {label === "Pending Tasks" && stats.pending > 0 && (
                  <span className="text-[10px] font-bold bg-amber-400 text-amber-900
                                   px-1.5 py-0.5 rounded-full">{stats.pending}</span>
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
            <h1 className="font-extrabold text-slate-800 text-base">Dashboard</h1>
            <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl">
            <GraduationCap size={13} className="text-blue-600" />
            <span className="text-xs font-bold text-blue-700">Faculty</span>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">

          {/* Welcome banner */}
          <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
               style={{ background:"linear-gradient(135deg,#1e3a5f 0%,#0f2744 100%)" }}>
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
                 style={{ background:"radial-gradient(circle,#60a5fa,transparent)" }} />
            <p className="text-blue-300 text-xs font-bold tracking-widest uppercase mb-1">Faculty Portal</p>
            <h2 className="text-white text-xl md:text-2xl font-extrabold mb-0.5">
              Welcome, {user?.name?.split(" ")[0] || "Faculty"} 👋
            </h2>
            <p className="text-blue-200 text-sm mb-5">
              Dept of <span className="font-bold text-white">{user?.department || "CSE"}</span>
              {user?.subject_code && <> · <span className="font-mono text-blue-300">{user.subject_code}</span></>}
            </p>

            {/* Progress */}
            <div className="max-w-xs mb-5">
              <div className="flex justify-between text-xs text-blue-300 mb-1.5">
                <span>Overall Completion</span>
                <span className="font-bold text-white">
                  {loading ? "—" : `${donePct}%`}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                     style={{ width:`${donePct}%`, background:"linear-gradient(90deg,#60a5fa,#34d399)" }} />
              </div>
              <p className="text-blue-300 text-xs mt-1.5">
                {loading ? "Loading…" : `${done} of ${total} syllabi submitted`}
              </p>
            </div>

            <button onClick={() => navigate("/faculty/pending")}
                    className="flex items-center gap-2 bg-white text-[#1e3a5f] text-sm font-bold
                               px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all cursor-pointer
                               hover:-translate-y-0.5 hover:shadow-lg w-fit">
              View Pending Tasks <ArrowRight size={14} />
            </button>
          </div>

          {/* Stat cards */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
              {[1,2,3,4].map(i => (
                <div key={i} className="rounded-2xl p-5 bg-white border border-slate-100 animate-pulse">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl mb-3" />
                  <div className="h-7 bg-slate-100 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
              {CARDS.map(({ label, value, icon: Icon, color, bg, border, desc, path }) => (
                <button key={label} onClick={() => navigate(path)}
                        className="rounded-2xl p-5 text-left flex flex-col gap-2
                                   hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer"
                        style={{ background:bg, border:`1.5px solid ${border}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                       style={{ background:`${color}18` }}>
                    <Icon size={19} style={{ color }} strokeWidth={2} />
                  </div>
                  <p className="text-3xl font-extrabold leading-none mt-1" style={{ color }}>{value}</p>
                  <p className="text-xs font-bold text-slate-700 leading-tight">{label}</p>
                  <p className="text-[11px] text-slate-400 leading-snug">{desc}</p>
                  <div className="flex items-center gap-1 mt-auto pt-1" style={{ color }}>
                    <span className="text-[11px] font-bold">View</span>
                    <ArrowRight size={11} />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent pending */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-600" />
                <h3 className="font-bold text-slate-800">Recent Pending Tasks</h3>
              </div>
              <button onClick={() => navigate("/faculty/pending")}
                      className="text-xs text-blue-600 font-bold flex items-center gap-1
                                 hover:text-blue-800 transition-colors cursor-pointer">
                View All <ArrowRight size={12} />
              </button>
            </div>

            {loading ? (
              <div className="divide-y divide-slate-50">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center justify-between px-6 py-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                      <div>
                        <div className="h-3 bg-slate-100 rounded w-32 mb-2" />
                        <div className="h-2.5 bg-slate-100 rounded w-20" />
                      </div>
                    </div>
                    <div className="h-8 bg-slate-100 rounded-lg w-20" />
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                <CheckCircle size={38} className="mx-auto mb-3 opacity-20" />
                <p className="font-semibold text-sm">All caught up 🎉</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recent.map(task => (
                  <div key={task._id}
                       className="flex items-center justify-between px-6 py-4
                                  hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100
                                      flex items-center justify-center flex-shrink-0">
                        <BookOpen size={16} className="text-amber-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{task.subject_name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">
                          {task.subject_code} · Sem {task.sem}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const params = new URLSearchParams({
                          assignmentId: task._id,
                          subjectCode:  task.subject_code,
                          subjectName:  task.subject_name,
                          sem:          task.sem,
                          department:   user?.department,
                          facultyName:  user?.name,
                        });
                        window.open(`${import.meta.env.VITE_SYLLABUS_URL || "https://bit-syllabus-gen.netlify.app/"}?${params}`, "_blank");
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg
                                 bg-[#0f2744] text-white hover:bg-[#1e3a5f]
                                 transition-all hover:-translate-y-0.5 cursor-pointer"
                    >
                      Fill Now <ArrowRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}