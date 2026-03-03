// pages/coordinator/Dashboard.jsx — fully dynamic

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, LogOut, User,
  Menu, X, CheckCircle, Clock, XCircle,
  ArrowRight, TrendingUp, Eye, Users, RefreshCw,
  GitMerge
} from "lucide-react";

const STATUS_META = {
  submitted: { label:"Under Review", color:"#2563eb", bg:"#eff6ff", border:"#bae6fd", icon: Clock      },
  approved:  { label:"Approved",     color:"#059669", bg:"#ecfdf5", border:"#6ee7b7", icon: CheckCircle },
  rejected:  { label:"Rejected",     color:"#dc2626", bg:"#fef2f2", border:"#fca5a5", icon: XCircle     },
  pending:   { label:"Pending",      color:"#f59e0b", bg:"#fffbeb", border:"#fcd34d", icon: Clock       },
};

const NAV_LINKS = [
  { label:"Dashboard", path:"/coordinator/dashboard", icon: LayoutDashboard },
  { label:"Syllabi",   path:"/coordinator/syllabi",   icon: FileText         },
  { label:"Merge Files",     path:"/mergefiles",     icon: GitMerge           },
];

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user"));

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [allData,     setAllData]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(
        `http://127.0.0.1:8000/api/v1/assignments?department=${user?.department}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch");
      // Coordinator only sees submitted/approved/rejected — not pending
      setAllData((json.assignments || []).filter(a => a.status !== "pending"));
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  // ── Stats computed from single array ─────────────────────────
  const stats = useMemo(() => {
    const count     = (s) => allData.filter(a => a.status === s).length;
    const submitted = count("submitted");
    const approved  = count("approved");
    const rejected  = count("rejected");
    const total     = allData.length;
    const reviewPct = total > 0
      ? Math.round(((approved + rejected) / total) * 100)
      : 0;
    return { total, submitted, approved, rejected, reviewPct };
  }, [allData]);

  // Recent 4 — submitted (needs action) first, then newest
  const recent = useMemo(() => {
    const needsReview = allData.filter(a => a.status === "submitted");
    const done        = allData.filter(a => a.status !== "submitted");
    return [...needsReview, ...done]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 4);
  }, [allData]);

  function handleLogout() {
    if (confirm("Log out?")) { localStorage.removeItem("user"); navigate("/login"); }
  }

  const CARDS = [
    { label:"Total Syllabi", value: stats.total,     color:"#0f766e", bg:"#f0fdfa", border:"#99f6e4", icon: FileText    },
    { label:"Under Review",  value: stats.submitted, color:"#2563eb", bg:"#eff6ff", border:"#bae6fd", icon: Clock       },
    { label:"Approved",      value: stats.approved,  color:"#059669", bg:"#ecfdf5", border:"#6ee7b7", icon: CheckCircle },
    { label:"Rejected",      value: stats.rejected,  color:"#dc2626", bg:"#fef2f2", border:"#fca5a5", icon: XCircle     },
  ];

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]"
         style={{ fontFamily:"'Figtree','Segoe UI',sans-serif" }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0f2744]
                        transition-all duration-300 overflow-hidden flex-shrink-0
                        ${sidebarOpen ? "w-64" : "w-0 md:w-64"}`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/30
                          flex items-center justify-center flex-shrink-0">
            <Users size={17} className="text-teal-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-white truncate">Coordinator</p>
            <p className="text-[11px] text-teal-300 font-mono">{user?.department || "—"}</p>
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
                                 ${active ? "bg-white/15 text-white" : "text-teal-200 hover:bg-white/8 hover:text-white"}`}>
                <Icon size={16} strokeWidth={2} />
                <span className="flex-1">{label}</span>
                {/* Live badge from real data */}
                {label === "Syllabi" && !loading && stats.submitted > 0 && (
                  <span className="text-[10px] font-bold bg-teal-400 text-teal-900
                                   px-1.5 py-0.5 rounded-full">{stats.submitted}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 bg-white/8 rounded-xl px-3 py-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-teal-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || "Coordinator"}</p>
              <p className="text-[10px] text-teal-300 truncate">{user?.department || "—"}</p>
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

      {/* ── MAIN ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">

        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm
                           flex items-center gap-4 px-5 py-3.5">
          <button onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 rounded-xl hover:bg-slate-100 cursor-pointer">
            <Menu size={19} className="text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="font-extrabold text-slate-800 text-base">Dashboard</h1>
            <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
          </div>
          <button onClick={fetchData} title="Refresh"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
            <RefreshCw size={14} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-xl">
            <Users size={13} className="text-teal-600" />
            <span className="text-xs font-bold text-teal-700">Coordinator</span>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">

          {/* ── BANNER ──────────────────────────────────────────── */}
          <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
               style={{ background:"linear-gradient(135deg,#0f4c3a 0%,#0f2744 100%)" }}>
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
                 style={{ background:"radial-gradient(circle,#5eead4,transparent)" }} />
            <p className="text-teal-300 text-xs font-bold tracking-widest uppercase mb-1">
              Coordinator Portal
            </p>
            <h2 className="text-white text-xl md:text-2xl font-extrabold mb-0.5">
              Welcome, {user?.name?.split(" ")[0] || "Coordinator"} 👋
            </h2>
            <p className="text-teal-200 text-sm mb-5">
              Dept of <span className="font-bold text-white">{user?.department || "—"}</span>
            </p>

            {/* Progress bar — animates from 0 to real % */}
            <div className="max-w-xs mb-5">
              <div className="flex justify-between text-xs text-teal-300 mb-1.5">
                <span>Review Progress</span>
                <span className="font-bold text-white">
                  {loading ? "…" : `${stats.reviewPct}%`}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                     style={{
                       width: loading ? "0%" : `${stats.reviewPct}%`,
                       background:"linear-gradient(90deg,#5eead4,#34d399)"
                     }} />
              </div>
              <p className="text-teal-300 text-xs mt-1.5">
                {loading
                  ? "Loading…"
                  : `${stats.approved + stats.rejected} of ${stats.total} syllabi reviewed`}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate("/coordinator/syllabi")}
                      className="flex items-center gap-2 bg-white text-[#0f4c3a] text-sm font-bold
                                 px-5 py-2.5 rounded-xl hover:bg-teal-50 transition-all cursor-pointer
                                 hover:-translate-y-0.5 hover:shadow-lg w-fit">
                Review Syllabi <ArrowRight size={14} />
              </button>

              {/* Urgent nudge — only shows when there's work to do */}
              {!loading && stats.submitted > 0 && (
                <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-400/30
                                px-4 py-2.5 rounded-xl">
                  <Clock size={13} className="text-blue-300" />
                  <span className="text-xs font-bold text-blue-200">
                    {stats.submitted} awaiting your review
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Error banner */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-6
                            flex items-center justify-between">
              <p className="text-sm font-bold text-red-700">{error}</p>
              <button onClick={fetchData}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold
                                 rounded-xl cursor-pointer hover:bg-red-700">Retry</button>
            </div>
          )}

          {/* ── STAT CARDS ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
            {loading
              ? [1,2,3,4].map(i => (
                  <div key={i} className="rounded-2xl p-5 bg-white border border-slate-100 animate-pulse">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl mb-3" />
                    <div className="h-8 bg-slate-100 rounded w-12 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-20" />
                  </div>
                ))
              : CARDS.map(({ label, value, icon: Icon, color, bg, border }) => (
                  <button key={label} onClick={() => navigate("/coordinator/syllabi")}
                          className="rounded-2xl p-5 text-left flex flex-col gap-2
                                     hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer"
                          style={{ background:bg, border:`1.5px solid ${border}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                         style={{ background:`${color}18` }}>
                      <Icon size={19} style={{ color }} strokeWidth={2} />
                    </div>
                    <p className="text-3xl font-extrabold leading-none mt-1" style={{ color }}>
                      {value}
                    </p>
                    <p className="text-xs font-bold text-slate-700">{label}</p>
                    <div className="flex items-center gap-1 mt-auto pt-1" style={{ color }}>
                      <span className="text-[11px] font-bold">View</span>
                      <ArrowRight size={11} />
                    </div>
                  </button>
                ))
            }
          </div>

          {/* ── RECENT SUBMISSIONS ──────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-teal-600" />
                <h3 className="font-bold text-slate-800">Recent Submissions</h3>
              </div>
              <button onClick={() => navigate("/coordinator/syllabi")}
                      className="text-xs text-teal-600 font-bold flex items-center gap-1
                                 hover:text-teal-800 transition-colors cursor-pointer">
                View All <ArrowRight size={12} />
              </button>
            </div>

            {loading ? (
              <div className="divide-y divide-slate-50">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center justify-between px-6 py-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex-shrink-0" />
                      <div className="space-y-2">
                        <div className="h-3.5 bg-slate-100 rounded w-36" />
                        <div className="h-2.5 bg-slate-100 rounded w-48" />
                      </div>
                    </div>
                    <div className="h-6 bg-slate-100 rounded-full w-24" />
                  </div>
                ))}
              </div>

            ) : recent.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                <FileText size={36} className="mx-auto mb-3 opacity-20" />
                <p className="font-semibold text-sm">No submissions yet</p>
                <p className="text-xs mt-1 text-slate-300">Faculty haven't submitted any syllabi yet</p>
              </div>

            ) : (
              <div className="divide-y divide-slate-50">
                {recent.map(a => {
                  const meta = STATUS_META[a.status] || STATUS_META.pending;
                  const Icon = meta.icon;
                  return (
                    <div key={a._id}
                         className="flex items-center justify-between px-6 py-4
                                    hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100
                                        flex items-center justify-center flex-shrink-0">
                          <FileText size={16} className="text-teal-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{a.subject_name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            <span className="font-mono">{a.subject_code}</span>
                            {" · "}{a.faculty_id?.name || "—"}
                            {" · Sem "}{a.sem}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold
                                         px-2.5 py-1 rounded-full"
                              style={{ background:meta.bg, color:meta.color, border:`1px solid ${meta.border}` }}>
                          <Icon size={10} strokeWidth={2.5} />{meta.label}
                        </span>
                        {a.status === "submitted" && (
                          <button onClick={() => navigate("/coordinator/syllabi")}
                                  className="flex items-center gap-1 text-xs font-bold text-teal-600
                                             hover:text-teal-800 transition-colors cursor-pointer">
                            <Eye size={13} /> Review
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