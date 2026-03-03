// pages/bos/Dashboard.jsx — fully dynamic with My/Dept toggle

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, ClipboardList, LogOut,
  User, Menu, X, BookOpen, GraduationCap,
  ArrowRight, CheckCircle, Clock, TrendingUp,
  Plus, Send, RefreshCw, UserCircle, Building2, XCircle,
  GitMerge
} from "lucide-react";

const STATUS_META = {
  pending:   { label:"Pending",   color:"#f59e0b", bg:"#fffbeb", border:"#fcd34d", icon: Clock        },
  submitted: { label:"Submitted", color:"#2563eb", bg:"#eff6ff", border:"#bae6fd", icon: ClipboardList },
  approved:  { label:"Approved",  color:"#059669", bg:"#ecfdf5", border:"#6ee7b7", icon: CheckCircle   },
  rejected:  { label:"Rejected",  color:"#dc2626", bg:"#fef2f2", border:"#fca5a5", icon: XCircle       },
};

const NAV_LINKS = [
  { label:"Dashboard",   path:"/bos/dashboard",  icon: LayoutDashboard },
  { label:"Assign",      path:"/bos/assign",      icon: Plus            },
  { label:"Assignments", path:"/bos/assignments", icon: ClipboardList   },
  { label:"Faculty",     path:"/bos/faculty",     icon: Users           },
  { label:"Merge Files",     path:"/mergefiles",     icon: GitMerge           },
];

const VIEWS = [
  { id:"mine", label:"My Assignments", icon: UserCircle },
  { id:"dept", label:"Department",     icon: Building2  },
];

export default function BosDashboard() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user"));

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view,        setView]        = useState("mine");
  const [allData,     setAllData]     = useState([]);   // raw assignments array
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  // Modal state
  const [showModal,   setShowModal]   = useState(false);
  const [modalFac,    setModalFac]    = useState([]);
  const [form,        setForm]        = useState({ faculty_id:"", subject_code:"", subject_name:"", sem:"" });
  const [assigning,   setAssigning]   = useState(false);

  const setF = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  // Fetch when view changes
  useEffect(() => { fetchData(view); }, [view]);

  // Also fetch faculty for modal on mount
  useEffect(() => {
    if (!user?.department) return;
    fetch(`http://127.0.0.1:8000/api/v1/users?role=faculty&department=${user.department}`)
      .then(r => r.json())
      .then(d => setModalFac(d.users || []))
      .catch(() => {});
  }, []);

  async function fetchData(currentView = view) {
    setLoading(true);
    setError("");
    try {
      const query = currentView === "mine"
        ? `assigned_by=${user?._id}`
        : `department=${user?.department}`;
      const res  = await fetch(`http://127.0.0.1:8000/api/v1/assignments?${query}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch");
      setAllData(json.assignments || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  // ── Compute stats client-side from fetched array ──────────────
  const stats = useMemo(() => {
    const count = (s) => allData.filter(a => a.status === s).length;
    const submitted = count("submitted");
    const approved  = count("approved");
    const pending   = count("pending");
    const rejected  = count("rejected");
    const total     = allData.length;
    const progress  = total > 0 ? Math.round((submitted + approved) / total * 100) : 0;
    return { total, pending, submitted, approved, rejected, progress };
  }, [allData]);

  // Recent 4 — sorted newest first
  const recent = useMemo(() =>
    [...allData].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4),
  [allData]);

  function handleViewSwitch(v) { console.log(v);setView(v); }

  function handleLogout() {
    if (confirm("Log out?")) { localStorage.removeItem("user"); navigate("/login"); }
  }

  async function handleAssign(e) {
    e.preventDefault();
    if (!form.faculty_id || !form.subject_code || !form.subject_name || !form.sem) {
      alert("Please fill all fields"); return;
    }
    setAssigning(true);
    try {
      const res  = await fetch("http://127.0.0.1:8000/api/v1/assignments", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faculty_id:   form.faculty_id,
          subject_code: form.subject_code,
          subject_name: form.subject_name,
          sem:          form.sem,
          department:   user?.department,
          assigned_by:  user?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Failed to assign"); return; }
      setForm({ faculty_id:"", subject_code:"", subject_name:"", sem:"" });
      setShowModal(false);
      fetchData(view); // refresh stats
    } catch (err) {
      console.error(err);
      alert("Server error. Try again.");
    } finally {
      setAssigning(false);
    }
  }

  const CARDS = [
    { label:"Total",     value: stats.total,     icon: ClipboardList, color:"#6d28d9", bg:"#f5f3ff", border:"#ddd6fe" },
    { label:"Pending",   value: stats.pending,   icon: Clock,         color:"#f59e0b", bg:"#fffbeb", border:"#fcd34d" },
    { label:"Submitted", value: stats.submitted, icon: CheckCircle,   color:"#2563eb", bg:"#eff6ff", border:"#bae6fd" },
    { label:"Approved",  value: stats.approved,  icon: GraduationCap, color:"#059669", bg:"#ecfdf5", border:"#6ee7b7" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]"
         style={{ fontFamily:"'Figtree','Segoe UI',sans-serif" }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
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
          <button onClick={() => fetchData(view)} title="Refresh"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
            <RefreshCw size={14} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-[#0f2744] text-white text-xs font-bold
                             px-4 py-2 rounded-xl hover:bg-[#1e3a5f] transition-all
                             hover:-translate-y-0.5 cursor-pointer">
            <Plus size={14} /> Assign Syllabus
          </button>
        </header>

        <main className="flex-1 p-5 md:p-8">

          {/* ── BANNER ──────────────────────────────────────────── */}
          <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
               style={{ background:"linear-gradient(135deg,#3b1fa8 0%,#1e3a5f 100%)" }}>
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
                 style={{ background:"radial-gradient(circle,#a78bfa,transparent)" }} />

            {/* Title + toggle on same row */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-purple-300 text-xs font-bold tracking-widest uppercase mb-1">BOS Portal</p>
                <h2 className="text-white text-xl md:text-2xl font-extrabold mb-0.5">
                  Welcome, {user?.name?.split(" ")[0] || "BOS"} 👋
                </h2>
                <p className="text-purple-200 text-sm">
                  Board of Studies · <span className="font-bold text-white">{user?.department || "—"}</span>
                </p>
              </div>

              {/* ── VIEW TOGGLE ── */}
              <div className="flex items-center bg-white/10 rounded-xl p-1 gap-1 flex-shrink-0 relative z-10">
                {VIEWS.map(v => (
                  <button key={v.id} onClick={() => handleViewSwitch(v.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px]
                                      font-bold transition-all cursor-pointer
                                      ${view === v.id
                                        ? "bg-white text-[#3b1fa8] shadow"
                                        : "text-purple-300 hover:text-white"}`}>
                    <v.icon size={12} />{v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Context label */}
            <p className="text-purple-300 text-xs mb-3">
              {view === "mine"
                ? "Showing assignments you created"
                : `Showing all assignments across ${user?.department} department`}
            </p>

            {/* Progress bar */}
            <div className="max-w-xs mb-5">
              <div className="flex justify-between text-xs text-purple-300 mb-1.5">
                <span>Submission Progress</span>
                <span className="font-bold text-white">
                  {loading ? "…" : `${stats.progress}%`}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                     style={{
                       width: loading ? "0%" : `${stats.progress}%`,
                       background:"linear-gradient(90deg,#a78bfa,#34d399)"
                     }} />
              </div>
              <p className="text-purple-300 text-xs mt-1.5">
                {loading ? "Loading…" : `${stats.submitted + stats.approved} of ${stats.total} syllabi submitted`}
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

          {/* Error */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-6
                            flex items-center justify-between">
              <p className="text-sm font-bold text-red-700">{error}</p>
              <button onClick={() => fetchData(view)}
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
                  <button key={label} onClick={() => navigate("/bos/assignments")}
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

          {/* ── RECENT ASSIGNMENTS ──────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-purple-600" />
                <h3 className="font-bold text-slate-800">Recent Assignments</h3>
                {view === "dept" && (
                  <span className="text-[11px] font-bold bg-purple-50 text-purple-600
                                   border border-purple-100 px-2 py-0.5 rounded-full">
                    {user?.department}
                  </span>
                )}
              </div>
              <button onClick={() => navigate("/bos/assignments")}
                      className="text-xs text-purple-600 font-bold flex items-center gap-1
                                 hover:text-purple-800 transition-colors cursor-pointer">
                View All <ArrowRight size={12} />
              </button>
            </div>

            {/* Loading skeletons */}
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
                    <div className="h-6 bg-slate-100 rounded-full w-20" />
                  </div>
                ))}
              </div>

            ) : recent.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                <ClipboardList size={36} className="mx-auto mb-3 opacity-20" />
                <p className="font-semibold text-sm">No assignments yet</p>
                <button onClick={() => setShowModal(true)}
                        className="mt-4 flex items-center gap-2 mx-auto bg-[#0f2744] text-white
                                   text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer
                                   hover:bg-[#1e3a5f] transition-all">
                  <Plus size={14} /> Create First Assignment
                </button>
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
                        <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100
                                        flex items-center justify-center flex-shrink-0">
                          <BookOpen size={16} className="text-purple-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{a.subject_name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            <span className="font-mono">{a.subject_code}</span>
                            {" · "}
                            {/* Show faculty name from populated field */}
                            {a.faculty_id?.name || "—"}
                            {/* In dept view also show who assigned */}
                            {view === "dept" && a.assigned_by?.name && (
                              <span className="ml-1 text-slate-300">
                                · by {a.assigned_by.name}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold
                                       px-2.5 py-1 rounded-full flex-shrink-0"
                            style={{ background:meta.bg, color:meta.color, border:`1px solid ${meta.border}` }}>
                        <Icon size={10} strokeWidth={2.5} />{meta.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── QUICK ASSIGN MODAL ──────────────────────────────────── */}
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
              {/* Faculty select */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Select Faculty
                </label>
                <select value={form.faculty_id} onChange={e => setF("faculty_id")(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5
                                   text-sm text-slate-800 outline-none focus:border-purple-400
                                   focus:ring-2 focus:ring-purple-50 transition-all cursor-pointer">
                  <option value="">Choose faculty…</option>
                  {modalFac.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                </select>
              </div>

              {/* Subject code */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Subject Code
                </label>
                <input value={form.subject_code}
                       onChange={e => setF("subject_code")(e.target.value.toUpperCase())}
                       placeholder="e.g. BCS300"
                       className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5
                                  text-sm font-mono text-slate-800 outline-none focus:border-purple-400
                                  focus:ring-2 focus:ring-purple-50 transition-all placeholder:text-slate-300" />
              </div>

              {/* Subject name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Subject Name
                </label>
                <input value={form.subject_name}
                       onChange={e => setF("subject_name")(e.target.value)}
                       placeholder="e.g. Mathematics III"
                       className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5
                                  text-sm text-slate-800 outline-none focus:border-purple-400
                                  focus:ring-2 focus:ring-purple-50 transition-all placeholder:text-slate-300" />
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Semester
                </label>
                <select value={form.sem} onChange={e => setF("sem")(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5
                                   text-sm text-slate-800 outline-none focus:border-purple-400
                                   focus:ring-2 focus:ring-purple-50 transition-all cursor-pointer">
                  <option value="">Select semester…</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>

              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setShowModal(false)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold
                                   text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={assigning}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white
                                   flex items-center justify-center gap-2 transition-all cursor-pointer
                                   disabled:cursor-not-allowed"
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