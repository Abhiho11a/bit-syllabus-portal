// pages/dean/Dashboard.jsx — fully dynamic
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Users, BookOpen,
  LogOut, User, Menu, X, Shield,
  CheckCircle, Clock, XCircle, ArrowRight,
  TrendingUp, RefreshCw, GraduationCap
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const NAV_LINKS = [
  { label:"Dashboard",  path:"/dean/dashboard", icon: LayoutDashboard },
  { label:"Syllabi",    path:"/dean/syllabi",    icon: FileText        },
  { label:"Manage BOS", path:"/dean/manage-bos", icon: Users           },
  { label:"Faculty",    path:"/dean/faculty",    icon: GraduationCap   },
];

const STATUS_META = {
  submitted: { label:"Under Review", color:"#2563eb", bg:"#eff6ff", border:"#bae6fd", icon: Clock       },
  approved:  { label:"Approved",     color:"#059669", bg:"#ecfdf5", border:"#6ee7b7", icon: CheckCircle  },
  rejected:  { label:"Rejected",     color:"#dc2626", bg:"#fef2f2", border:"#fca5a5", icon: XCircle      },
  pending:   { label:"Pending",      color:"#f59e0b", bg:"#fffbeb", border:"#fcd34d", icon: Clock        },
};

export default function DeanDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  // All computed from a single fetch
  const [stats,       setStats]       = useState({ total:0, approved:0, submitted:0, rejected:0, pending:0 });
  const [deptSummary, setDeptSummary] = useState([]); // [{ dept, total, approved, submitted, rejected, pending }]
  const [recent,      setRecent]      = useState([]); // latest 4 non-pending

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      // Dean fetches all — no filters
      const res  = await fetch(`${API_URL}/api/v1/assignments`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");

      const all = data.assignments || [];

      // ── Global stats ──────────────────────────────────────────
      setStats({
        total:     all.length,
        approved:  all.filter(a => a.status === "approved").length,
        submitted: all.filter(a => a.status === "submitted").length,
        rejected:  all.filter(a => a.status === "rejected").length,
        pending:   all.filter(a => a.status === "pending").length,
      });

      // ── Per-dept breakdown — computed client-side ─────────────
      const deptMap = {};
      all.forEach(a => {
        const d = a.department || "Unknown";
        if (!deptMap[d]) deptMap[d] = { dept:d, total:0, approved:0, submitted:0, rejected:0, pending:0 };
        deptMap[d].total++;
        if (deptMap[d][a.status] !== undefined) deptMap[d][a.status]++;
        else deptMap[d][a.status] = 1;
      });
      setDeptSummary(Object.values(deptMap).sort((a, b) => a.dept.localeCompare(b.dept)));

      // ── Recent activity — latest 4 non-pending ────────────────
      const nonPending = all
        .filter(a => a.status !== "pending")
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 4);
      setRecent(nonPending);

    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    if (confirm("Log out?")) { localStorage.removeItem("user"); navigate("/login"); }
  }

  const approvedPct = stats.total ? Math.round((stats.approved / stats.total) * 100) : 0;

  const CARDS = [
    { label:"Total Syllabi", value: stats.total,     icon: FileText,    color:"#0f766e", bg:"#f0fdfa", border:"#99f6e4" },
    { label:"Approved",      value: stats.approved,  icon: CheckCircle, color:"#059669", bg:"#ecfdf5", border:"#6ee7b7" },
    { label:"Under Review",  value: stats.submitted, icon: Clock,       color:"#2563eb", bg:"#eff6ff", border:"#bae6fd" },
    { label:"Rejected",      value: stats.rejected,  icon: XCircle,     color:"#dc2626", bg:"#fef2f2", border:"#fca5a5" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]"
         style={{ fontFamily:"'Figtree','Segoe UI',sans-serif" }}>

      {/* ── SIDEBAR ──────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0f2744]
                        transition-all duration-300 overflow-hidden flex-shrink-0
                        ${sidebarOpen ? "w-64" : "w-0 md:w-64"}`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30
                          flex items-center justify-center flex-shrink-0">
            <Shield size={17} className="text-amber-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-white">Dean Portal</p>
            <p className="text-[11px] text-amber-300 font-mono">All Departments</p>
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
                                 ${active ? "bg-white/15 text-white" : "text-amber-200 hover:bg-white/8 hover:text-white"}`}>
                <Icon size={16} strokeWidth={2} />{label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 bg-white/8 rounded-xl px-3 py-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-amber-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || "Dean"}</p>
              <p className="text-[10px] text-amber-300 truncate">Dean of Studies</p>
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

      {/* ── MAIN ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">

        {/* Header */}
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
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
            <Shield size={13} className="text-amber-600" />
            <span className="text-xs font-bold text-amber-700">Dean</span>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">

          {/* Error banner */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-6
                            flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-red-700">{error}</p>
              <button onClick={fetchData}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl
                                 cursor-pointer hover:bg-red-700 flex-shrink-0">
                Retry
              </button>
            </div>
          )}

          {/* ── Hero banner ─────────────────────────────────────── */}
          <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
               style={{ background:"linear-gradient(135deg,#78350f 0%,#0f2744 100%)" }}>
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
                 style={{ background:"radial-gradient(circle,#fbbf24,transparent)" }} />

            <p className="text-amber-300 text-xs font-bold tracking-widest uppercase mb-1">Dean Portal</p>
            <h2 className="text-white text-xl md:text-2xl font-extrabold mb-0.5">
              Welcome, {user?.name?.split(" ")[0] || "Dean"} 👋
            </h2>
            <p className="text-amber-200 text-sm mb-5">
              Overseeing{" "}
              <span className="font-bold text-white">
                {loading ? "…" : `${deptSummary.length} Department${deptSummary.length !== 1 ? "s" : ""}`}
              </span>
            </p>

            {/* College-wide progress bar */}
            <div className="max-w-xs mb-5">
              <div className="flex justify-between text-xs text-amber-300 mb-1.5">
                <span>College-wide Approval</span>
                <span className="font-bold text-white">{loading ? "—" : `${approvedPct}%`}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                     style={{
                       width: loading ? "0%" : `${approvedPct}%`,
                       background: "linear-gradient(90deg,#fbbf24,#34d399)"
                     }} />
              </div>
              <p className="text-amber-300 text-xs mt-1.5">
                {loading
                  ? "Loading…"
                  : `${stats.approved} of ${stats.total} syllabi approved`}
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate("/dean/syllabi")}
                      className="flex items-center gap-2 bg-white text-[#78350f] text-sm font-bold
                                 px-5 py-2.5 rounded-xl hover:bg-amber-50 transition-all cursor-pointer
                                 hover:-translate-y-0.5 hover:shadow-lg w-fit">
                View All Syllabi <ArrowRight size={14} />
              </button>
              <button onClick={() => navigate("/dean/manage-bos")}
                      className="flex items-center gap-2 bg-white/10 border border-white/20 text-white
                                 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-white/20
                                 transition-all cursor-pointer hover:-translate-y-0.5 w-fit">
                Manage BOS
              </button>
            </div>
          </div>

          {/* ── Stat cards ─────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
            {loading
              ? [1,2,3,4].map(i => (
                  <div key={i} className="rounded-2xl p-5 bg-white border border-slate-100 animate-pulse">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl mb-3" />
                    <div className="h-7 bg-slate-100 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                  </div>
                ))
              : CARDS.map(({ label, value, icon: Icon, color, bg, border }) => (
                  <button key={label} onClick={() => navigate("/dean/syllabi")}
                          className="rounded-2xl p-5 text-left flex flex-col gap-2
                                     hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer"
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
                ))
            }
          </div>

          {/* ── Bottom panels ───────────────────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Dept breakdown */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
                <BookOpen size={16} className="text-amber-500" />
                <h3 className="font-bold text-slate-800">Department Overview</h3>
              </div>

              {loading ? (
                <div className="divide-y divide-slate-50">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="px-6 py-4 animate-pulse">
                      <div className="flex justify-between mb-2">
                        <div className="h-4 bg-slate-100 rounded w-16" />
                        <div className="h-4 bg-slate-100 rounded w-8" />
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full mb-2" />
                      <div className="h-3 bg-slate-100 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : deptSummary.length === 0 ? (
                <div className="py-12 text-center">
                  <BookOpen size={30} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-slate-400 text-sm font-semibold">No assignments yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {deptSummary.map(d => {
                    // % based on reviewed ones (exclude pending — not submitted yet)
                    const reviewed = d.approved + d.submitted + d.rejected;
                    const pct = reviewed ? Math.round((d.approved / reviewed) * 100) : 0;
                    return (
                      <div key={d.dept} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold bg-amber-50 border border-amber-100
                                             text-amber-700 px-2 py-0.5 rounded-lg">{d.dept}</span>
                            <span className="text-xs text-slate-400">{d.total} total</span>
                          </div>
                          <span className="text-xs font-bold text-slate-600">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                               style={{ width:`${pct}%`, background:"linear-gradient(90deg,#fbbf24,#34d399)" }} />
                        </div>
                        <div className="flex gap-3 mt-2 text-[11px] font-semibold">
                          <span className="text-green-600">{d.approved} approved</span>
                          <span className="text-blue-500">{d.submitted} review</span>
                          <span className="text-red-500">{d.rejected} rejected</span>
                          <span className="text-amber-500">{d.pending} pending</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-amber-500" />
                  <h3 className="font-bold text-slate-800">Recent Activity</h3>
                </div>
                <button onClick={() => navigate("/dean/syllabi")}
                        className="text-xs text-amber-600 font-bold flex items-center gap-1
                                   hover:text-amber-800 cursor-pointer">
                  View All <ArrowRight size={12} />
                </button>
              </div>

              {loading ? (
                <div className="divide-y divide-slate-50">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center gap-3 px-6 py-4 animate-pulse">
                      <div className="w-9 h-9 bg-slate-100 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-3/4" />
                        <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                      </div>
                      <div className="h-5 bg-slate-100 rounded-full w-20" />
                    </div>
                  ))}
                </div>
              ) : recent.length === 0 ? (
                <div className="py-12 text-center">
                  <TrendingUp size={30} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-slate-400 text-sm font-semibold">No recent activity yet</p>
                  <p className="text-slate-300 text-xs mt-1">Faculty need to submit syllabi first</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {recent.map(s => {
                    const meta = STATUS_META[s.status] || STATUS_META.pending;
                    const Icon = meta.icon;
                    return (
                      <div key={s._id}
                           className="flex items-center justify-between px-6 py-4
                                      hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100
                                          flex items-center justify-center flex-shrink-0">
                            <FileText size={14} className="text-amber-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate">{s.subject_name}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                              <span className="font-mono">{s.subject_code}</span>
                              {" · "}{s.department}
                              {s.faculty_id?.name && ` · ${s.faculty_id.name}`}
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold
                                         px-2 py-1 rounded-full flex-shrink-0 ml-2"
                              style={{ background:meta.bg, color:meta.color, border:`1px solid ${meta.border}` }}>
                          <Icon size={10} />{meta.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}