import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, LogOut, User,
  Menu, X, BookOpen, CheckCircle, Clock, XCircle,
  ArrowRight, Trash2, Eye, Search, RefreshCw,
  ChevronLeft, Building2, AlertTriangle,
  GitMerge
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_META = {
  pending:   { label:"Pending",      color:"#f59e0b", bg:"#fffbeb", border:"#fcd34d", icon: Clock       },
  submitted: { label:"Under Review", color:"#2563eb", bg:"#eff6ff", border:"#bae6fd", icon: Clock       },
  approved:  { label:"Approved",     color:"#059669", bg:"#ecfdf5", border:"#6ee7b7", icon: CheckCircle  },
  rejected:  { label:"Rejected",     color:"#dc2626", bg:"#fef2f2", border:"#fca5a5", icon: XCircle      },
};

// Rose accent for Admin
const NAV_LINKS = [
  { label:"Dashboard",   path:"/admin/dashboard",   icon: LayoutDashboard },
  { label:"Users",       path:"/admin/users",        icon: Users           },
  { label:"Syllabi",     path:"/admin/syllabi",      icon: FileText        },
//   { label:"Departments", path:"/admin/departments",  icon: Building2       },
  { label:"Merge Files",     path:"/mergefiles",     icon: GitMerge           },
];

// Dept colors — each dept gets a distinct accent
const DEPT_COLORS = [
  { color:"#6d28d9", bg:"#f5f3ff", border:"#ddd6fe", light:"#ede9fe" },
  { color:"#0f766e", bg:"#f0fdfa", border:"#99f6e4", light:"#ccfbf1" },
  { color:"#b45309", bg:"#fffbeb", border:"#fde68a", light:"#fef3c7" },
  { color:"#1d4ed8", bg:"#eff6ff", border:"#bfdbfe", light:"#dbeafe" },
  { color:"#be185d", bg:"#fdf2f8", border:"#f9a8d4", light:"#fce7f3" },
  { color:"#065f46", bg:"#ecfdf5", border:"#a7f3d0", light:"#d1fae5" },
];

export default function AdminSyllabi() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user"));

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [allData,     setAllData]     = useState([]);   // ALL assignments
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  // Drill-down state
  const [selectedDept, setSelectedDept] = useState(null); // null = grid view
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId,   setDeletingId]   = useState(null);
  const [deleteConfirm,setDeleteConfirm]= useState(null); // id to confirm

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    setError("");
    try {
      // Admin fetches ALL — no filter
      const res  = await fetch(`${API_URL}/api/v1/assignments`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch");
      setAllData(json.assignments || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load syllabi.");
    } finally {
      setLoading(false);
    }
  }

  // ── Group by department ───────────────────────────────────────
  const deptGroups = useMemo(() => {
    const map = {};
    allData.forEach(a => {
      const d = a.department || "UNKNOWN";
      if (!map[d]) map[d] = [];
      map[d].push(a);
    });
    // Sort dept names alphabetically
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dept, items], idx) => {
        const count   = (s) => items.filter(i => i.status === s).length;
        const total   = items.length;
        const approved  = count("approved");
        const submitted = count("submitted");
        const rejected  = count("rejected");
        const pending   = count("pending");
        const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
        return {
          dept, items, total, approved, submitted, rejected, pending, pct,
          color: DEPT_COLORS[idx % DEPT_COLORS.length],
        };
      });
  }, [allData]);

  // ── Dept detail filtered list ─────────────────────────────────
  const deptItems = useMemo(() => {
    if (!selectedDept) return [];
    const group = deptGroups.find(g => g.dept === selectedDept);
    if (!group) return [];
    return group.items
      .filter(a => statusFilter === "all" || a.status === statusFilter)
      .filter(a => {
        const q = search.toLowerCase();
        return (
          a.subject_name?.toLowerCase().includes(q) ||
          a.subject_code?.toLowerCase().includes(q) ||
          a.faculty_id?.name?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [selectedDept, deptGroups, search, statusFilter]);

  async function handleDelete(id) {
    setDeletingId(id);
    setDeleteConfirm(null);
    try {
      const res  = await fetch(`${API_URL}/api/v1/assignments/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) { alert(json.message || "Failed to delete"); return; }
      setAllData(d => d.filter(a => a._id !== id));
    } catch (err) {
      console.error(err);
      alert("Server error. Try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleLogout() {
    if (confirm("Log out?")) { localStorage.removeItem("user"); navigate("/login"); }
  }

  // Global stats for header
  const globalStats = useMemo(() => ({
    total:     allData.length,
    approved:  allData.filter(a => a.status === "approved").length,
    submitted: allData.filter(a => a.status === "submitted").length,
    pending:   allData.filter(a => a.status === "pending").length,
    rejected:  allData.filter(a => a.status === "rejected").length,
    depts:     deptGroups.length,
  }), [allData, deptGroups]);

  const selectedGroup = deptGroups.find(g => g.dept === selectedDept);

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]"
         style={{ fontFamily:"'Figtree','Segoe UI',sans-serif" }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0f2744]
                        transition-all duration-300 overflow-hidden flex-shrink-0
                        ${sidebarOpen ? "w-64" : "w-0 md:w-64"}`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/30
                          flex items-center justify-center flex-shrink-0">
            <BookOpen size={17} className="text-rose-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-white truncate">Admin Portal</p>
            <p className="text-[11px] text-rose-300 font-mono">System Admin</p>
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
                                 ${active ? "bg-white/15 text-white" : "text-rose-200 hover:bg-white/8 hover:text-white"}`}>
                <Icon size={16} strokeWidth={2} />{label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 bg-white/8 rounded-xl px-3 py-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-rose-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-rose-300 truncate">Administrator</p>
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
            {selectedDept ? (
              <div className="flex items-center gap-3">
                <button onClick={() => { setSelectedDept(null); setSearch(""); setStatusFilter("all"); }}
                        className="flex items-center gap-1 text-sm text-slate-400 font-semibold
                                   hover:text-slate-700 transition-colors cursor-pointer">
                  <ChevronLeft size={16} /> All Departments
                </button>
                <span className="text-slate-300">/</span>
                <span className="font-extrabold text-slate-800 text-sm">{selectedDept}</span>
              </div>
            ) : (
              <div>
                <h1 className="font-extrabold text-slate-800 text-base">Syllabi Management</h1>
                <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
              </div>
            )}
          </div>
          <button onClick={fetchAll} title="Refresh"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
            <RefreshCw size={14} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </header>

        <main className="flex-1 p-5 md:p-8">

          {/* Error */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-6
                            flex items-center justify-between">
              <p className="text-sm font-bold text-red-700">{error}</p>
              <button onClick={fetchAll}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold
                                 rounded-xl cursor-pointer hover:bg-red-700">Retry</button>
            </div>
          )}

          {/* ════════════════════════════════════════════════════ */}
          {/* VIEW 1 — DEPARTMENT GRID                           */}
          {/* ════════════════════════════════════════════════════ */}
          {!selectedDept && (
            <>
              {/* Page header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={16} className="text-rose-500" />
                  <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">
                    Syllabi Overview
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800">All Departments</h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  Click any department to view and manage syllabi
                </p>
              </div>

              {/* Global summary strip */}
              {!loading && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-7">
                  {[
                    { label:"Total",      value: globalStats.total,     color:"#1e293b" },
                    { label:"Approved",   value: globalStats.approved,  color:"#059669" },
                    { label:"Reviewing",  value: globalStats.submitted, color:"#2563eb" },
                    { label:"Pending",    value: globalStats.pending,   color:"#f59e0b" },
                    { label:"Rejected",   value: globalStats.rejected,  color:"#dc2626" },
                  ].map(s => (
                    <div key={s.label}
                         className="bg-white rounded-2xl border border-slate-100 px-4 py-3
                                    flex items-center justify-between shadow-sm">
                      <span className="text-xs font-bold text-slate-500">{s.label}</span>
                      <span className="text-xl font-extrabold" style={{ color: s.color }}>
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Dept grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-100 rounded w-16" />
                          <div className="h-3 bg-slate-100 rounded w-24" />
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full mb-4" />
                      <div className="grid grid-cols-4 gap-2">
                        {[1,2,3,4].map(j => <div key={j} className="h-10 bg-slate-100 rounded-xl" />)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : deptGroups.length === 0 ? (
                <div className="py-24 text-center text-slate-400">
                  <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-semibold">No assignments found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {deptGroups.map(({ dept, total, approved, submitted, rejected, pending, pct, color }) => (
                    <button
                      key={dept}
                      onClick={() => setSelectedDept(dept)}
                      className="bg-white rounded-2xl border text-left p-6 hover:shadow-lg
                                 hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
                      style={{ borderColor: color.border }}>

                      {/* Dept header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold
                                          text-lg tracking-tight transition-all group-hover:scale-110"
                               style={{ background: color.light, color: color.color }}>
                            {dept.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 text-base">{dept}</p>
                            <p className="text-xs text-slate-400">{total} syllab{total === 1 ? "us" : "i"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100
                                        transition-opacity" style={{ color: color.color }}>
                          <span className="text-xs font-bold">View</span>
                          <ArrowRight size={13} />
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-1.5">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400 font-semibold">Approval rate</span>
                          <span className="font-extrabold" style={{ color: color.color }}>{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden"
                             style={{ background: color.light }}>
                          <div className="h-full rounded-full transition-all duration-700"
                               style={{ width:`${pct}%`, background: color.color }} />
                        </div>
                      </div>

                      {/* Status breakdown */}
                      <div className="grid grid-cols-4 gap-2 mt-4">
                        {[
                          { label:"Approved",  val: approved,  color:"#059669", bg:"#ecfdf5" },
                          { label:"Review",    val: submitted, color:"#2563eb", bg:"#eff6ff" },
                          { label:"Pending",   val: pending,   color:"#f59e0b", bg:"#fffbeb" },
                          { label:"Rejected",  val: rejected,  color:"#dc2626", bg:"#fef2f2" },
                        ].map(s => (
                          <div key={s.label} className="rounded-xl p-2 text-center"
                               style={{ background: s.bg }}>
                            <p className="text-base font-extrabold leading-none mb-0.5"
                               style={{ color: s.color }}>{s.val}</p>
                            <p className="text-[9px] font-bold text-slate-500">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════════════ */}
          {/* VIEW 2 — DEPT DETAIL / SYLLABUS LIST               */}
          {/* ════════════════════════════════════════════════════ */}
          {selectedDept && selectedGroup && (
            <>
              {/* Dept header card */}
              <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
                   style={{ background:`linear-gradient(135deg,#1e293b,#0f2744)` }}>
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10"
                     style={{ background:`radial-gradient(circle,${selectedGroup.color.color},transparent)` }} />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center
                                      font-extrabold text-lg"
                           style={{ background: selectedGroup.color.light, color: selectedGroup.color.color }}>
                        {selectedDept.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-white font-extrabold text-xl">{selectedDept}</p>
                        <p className="text-slate-400 text-xs">{selectedGroup.total} total assignments</p>
                      </div>
                    </div>
                  </div>
                  {/* Mini stats */}
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { label:"Approved",  v: selectedGroup.approved,  c:"#059669" },
                      { label:"Review",    v: selectedGroup.submitted, c:"#2563eb" },
                      { label:"Pending",   v: selectedGroup.pending,   c:"#f59e0b" },
                      { label:"Rejected",  v: selectedGroup.rejected,  c:"#dc2626" },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <p className="text-2xl font-extrabold" style={{ color: s.c }}>{s.v}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filters row */}
              <div className="flex flex-wrap gap-2 mb-5">
                {["all","pending","submitted","approved","rejected"].map(s => {
                  const count = s === "all"
                    ? selectedGroup.total
                    : selectedGroup[s === "submitted" ? "submitted" : s];
                  return (
                    <button key={s} onClick={() => setStatusFilter(s)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold
                                       transition-all cursor-pointer border capitalize
                              ${statusFilter === s
                                ? "bg-[#0f2744] text-white border-[#0f2744] shadow"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                      {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold
                        ${statusFilter === s ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                        {count ?? selectedGroup.items.filter(a => a.status === s).length}
                      </span>
                    </button>
                  );
                })}
                {/* Search */}
                <div className="flex items-center gap-2 bg-white border border-slate-200
                                rounded-xl px-3.5 py-2 ml-auto">
                  <Search size={13} className="text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                         placeholder="Search faculty, subject…"
                         className="text-sm text-slate-700 outline-none bg-transparent
                                    w-36 placeholder:text-slate-300" />
                </div>
              </div>

              {/* Syllabus table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Table header */}
                <div className="hidden md:grid gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100
                                text-[11px] font-bold text-slate-500 uppercase tracking-wider"
                     style={{ gridTemplateColumns:"2fr 110px 60px 1fr 130px 100px" }}>
                  <span>Subject</span>
                  <span>Code</span>
                  <span>Sem</span>
                  <span>Faculty</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>

                {deptItems.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <FileText size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="font-semibold text-sm">
                      {search ? "No results match your search" : "No assignments in this view"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {deptItems.map(a => {
                      const meta = STATUS_META[a.status] || STATUS_META.pending;
                      const Icon = meta.icon;
                      const isDeleting = deletingId === a._id;
                      const isConfirming = deleteConfirm === a._id;

                      return (
                        <div key={a._id}
                             className={`flex flex-col md:grid gap-2 md:gap-4 items-start
                                        md:items-center px-6 py-4 transition-colors
                                        ${isDeleting ? "opacity-40" : "hover:bg-slate-50"}`}
                             style={{ gridTemplateColumns:"2fr 110px 60px 1fr 130px 100px" }}>

                          {/* Subject */}
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{a.subject_name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {a.createdAt
                                ? new Date(a.createdAt).toLocaleDateString("en-IN",{
                                    day:"numeric", month:"short", year:"numeric"
                                  })
                                : "—"}
                            </p>
                          </div>

                          <span className="font-mono text-sm text-slate-600">{a.subject_code}</span>
                          <span className="text-sm text-slate-600">Sem {a.sem}</span>
                          <span className="text-sm text-slate-600">{a.faculty_id?.name || "—"}</span>

                          {/* Status */}
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold
                                           px-2.5 py-1 rounded-full w-fit"
                                style={{ background:meta.bg, color:meta.color, border:`1px solid ${meta.border}` }}>
                            <Icon size={10} strokeWidth={2.5} />{meta.label}
                          </span>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {/* View PDF */}
                            <button
                              title={a.pdf_url ? "View syllabus PDF" : "No PDF submitted yet"}
                              onClick={() => a.pdf_url && window.open(a.pdf_url, "_blank")}
                              className={`w-8 h-8 rounded-lg border flex items-center justify-center
                                          transition-colors
                                          ${a.pdf_url
                                            ? "bg-blue-50 border-blue-100 text-blue-500 hover:bg-blue-100 cursor-pointer"
                                            : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"}`}>
                              <Eye size={13} />
                            </button>

                            {/* Delete — with inline confirmation */}
                            {isConfirming ? (
                              <div className="flex items-center gap-1.5"
                                   style={{ animation:"fadeIn .15s ease" }}>
                                <span className="text-[10px] font-bold text-red-500">Sure?</span>
                                <button
                                  onClick={() => handleDelete(a._id)}
                                  disabled={isDeleting}
                                  className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold
                                             rounded-lg cursor-pointer hover:bg-red-600 transition-colors
                                             disabled:opacity-50">
                                  {isDeleting ? "…" : "Yes"}
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold
                                             rounded-lg cursor-pointer hover:bg-slate-200 transition-colors">
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(a._id)}
                                disabled={isDeleting}
                                title="Delete assignment"
                                className="w-8 h-8 rounded-lg bg-red-50 border border-red-100
                                           flex items-center justify-center text-red-400
                                           hover:bg-red-100 transition-colors cursor-pointer
                                           disabled:opacity-50 disabled:cursor-not-allowed">
                                {isDeleting
                                  ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                                  : <Trash2 size={13} />
                                }
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Remark display for rejected items */}
              {deptItems.some(a => a.status === "rejected" && a.remark) && (
                <div className="mt-4 space-y-2">
                  {deptItems
                    .filter(a => a.status === "rejected" && a.remark)
                    .map(a => (
                      <div key={`remark-${a._id}`}
                           className="bg-red-50 border border-red-100 rounded-xl px-4 py-3
                                      flex gap-3 items-start">
                        <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-red-700">
                            {a.subject_name} — Rejection Remark
                          </p>
                          <p className="text-xs text-red-500 mt-0.5">{a.remark}</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}