// pages/bos/Assignments.jsx
// Toggle between "My Assignments" (by this BOS) and "Department" (all in dept)

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, ClipboardList, Plus,
  LogOut, User, Menu, X, BookOpen,
  Search, Clock, CheckCircle, Trash2, Eye,
  XCircle, RefreshCw, UserCircle, Building2,
  GitMerge
} from "lucide-react";

const STATUS_META = {
  pending:   { label:"Pending",   color:"#f59e0b", bg:"#fffbeb", border:"#fcd34d", icon: Clock        },
  submitted: { label:"Submitted", color:"#2563eb", bg:"#eff6ff", border:"#bae6fd", icon: ClipboardList },
  approved:  { label:"Approved",  color:"#059669", bg:"#ecfdf5", border:"#6ee7b7", icon: CheckCircle   },
  rejected:  { label:"Rejected",  color:"#dc2626", bg:"#fef2f2", border:"#fca5a5", icon: XCircle       },
};

const TABS = [
  { id:"all",       label:"All"       },
  { id:"pending",   label:"Pending"   },
  { id:"submitted", label:"Submitted" },
  { id:"approved",  label:"Approved"  },
  { id:"rejected",  label:"Rejected"  },
];

const NAV_LINKS = [
  { label:"Dashboard",   path:"/bos/dashboard",  icon: LayoutDashboard },
  { label:"Assign",      path:"/bos/assign",      icon: Plus            },
  { label:"Assignments", path:"/bos/assignments", icon: ClipboardList   },
  { label:"Faculty",     path:"/bos/faculty",     icon: Users           },
  { label:"Merge Files",     path:"/mergefiles",     icon: GitMerge           },
];

// "mine" = assigned by this BOS | "dept" = all in department
const VIEWS = [
  { id:"mine", label:"My Assignments",     icon: UserCircle  },
  { id:"dept", label:"Department View",    icon: Building2   },
];

export default function BosAssignments() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user"));

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab,   setActiveTab]   = useState("all");
  const [search,      setSearch]      = useState("");
  const [data,        setData]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [deletingId,  setDeletingId]  = useState(null);
  const [view,        setView]        = useState("mine"); // ← new toggle state

  // Re-fetch whenever view changes
  useEffect(() => { fetchAssignments(view); }, [view]);

  async function fetchAssignments(currentView = view) {
    setLoading(true);
    setError("");
    setActiveTab("all"); // reset tab on view switch
    try {
      // "mine"  → filter by assigned_by (this BOS's _id)
      // "dept"  → filter by department (all BOS in dept combined)
      const query = currentView === "mine"
        ? `assigned_by=${user?.id}`
        : `department=${user?.department}`;

      const res  = await fetch(`http://127.0.0.1:8000/api/v1/assignments?${query}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch");
      setData(json.assignments || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this assignment? The faculty will lose this pending task.")) return;
    setDeletingId(id);
    try {
      const res  = await fetch(`http://127.0.0.1:8000/api/v1/assignments/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) { alert(json.message || "Failed to delete"); return; }
      setData(d => d.filter(a => a._id !== id));
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

  const tabCount = (id) =>
    id === "all" ? data.length : data.filter(a => a.status === id).length;

  const visible = data
    .filter(a => activeTab === "all" || a.status === activeTab)
    .filter(a => {
      const q = search.toLowerCase();
      return (
        a.subject_name?.toLowerCase().includes(q) ||
        a.subject_code?.toLowerCase().includes(q) ||
        a.faculty_id?.name?.toLowerCase().includes(q)
      );
    });

  // In dept view, BOS can only delete assignments THEY created
  const canDelete = (a) =>
    a.status === "pending" &&
    (view === "mine" || a.assigned_by?._id === user?._id || a.assigned_by === user?._id);

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
                  className="md:hidden p-2 rounded-xl hover:bg-slate-100 cursor-pointer">
            <Menu size={19} className="text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="font-extrabold text-slate-800 text-base">Assignments</h1>
            <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
          </div>
          <button onClick={() => fetchAssignments(view)} title="Refresh"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
            <RefreshCw size={14} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => navigate("/bos/assign")}
                  className="flex items-center gap-2 bg-[#0f2744] text-white text-xs font-bold
                             px-4 py-2 rounded-xl hover:bg-[#1e3a5f] transition-all
                             hover:-translate-y-0.5 cursor-pointer">
            <Plus size={14} /> Assign New
          </button>
        </header>

        <main className="flex-1 p-5 md:p-8">

          {/* Page title + VIEW TOGGLE */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ClipboardList size={16} className="text-purple-500" />
                <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">
                  Assignments
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800">
                {view === "mine" ? "My Assignments" : `${user?.department} Department`}
              </h2>
              <p className="text-slate-400 text-sm mt-0.5">
                {view === "mine"
                  ? "Assignments you have created"
                  : `All assignments across ${user?.department} department`}
              </p>
            </div>

            {/* ── VIEW TOGGLE PILL ── */}
            <div className="flex items-center bg-slate-100 rounded-2xl p-1 gap-1 flex-shrink-0">
              {VIEWS.map(v => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold
                               transition-all cursor-pointer
                               ${view === v.id
                                 ? "bg-white text-[#0f2744] shadow-sm"
                                 : "text-slate-500 hover:text-slate-700"}`}>
                  <v.icon size={13} />
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dept view info banner */}
          {view === "dept" && (
            <div className="bg-purple-50 border border-purple-100 rounded-2xl px-5 py-3
                            flex items-center gap-3 mb-5"
                 style={{ animation:"fadeIn .2s ease" }}>
              <Building2 size={15} className="text-purple-500 flex-shrink-0" />
              <p className="text-xs text-purple-700 font-semibold">
                Showing all <span className="font-extrabold">{user?.department}</span> assignments.
                You can only delete assignments <span className="font-extrabold">you created</span>.
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-6
                            flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-red-700">{error}</p>
              <button onClick={() => fetchAssignments(view)}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold
                                 rounded-xl cursor-pointer hover:bg-red-700">
                Retry
              </button>
            </div>
          )}

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
                  {loading ? "…" : tabCount(t.id)}
                </span>
              </button>
            ))}
            <div className="flex items-center gap-2 bg-white border border-slate-200
                            rounded-xl px-3.5 py-2 ml-auto">
              <Search size={13} className="text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                     placeholder="Search faculty, subject…"
                     className="text-sm text-slate-700 outline-none bg-transparent
                                w-36 placeholder:text-slate-300" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="hidden md:grid gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100
                            text-[11px] font-bold text-slate-500 uppercase tracking-wider"
                 style={{ gridTemplateColumns: view === "dept" ? "2fr 120px 60px 1fr 130px 130px 90px" : "2fr 120px 60px 1fr 130px 90px" }}>
              <span>Subject</span><span>Code</span><span>Sem</span>
              <span>Faculty</span><span>Status</span>
              {view === "dept" && <span>Assigned By</span>}
              <span>Actions</span>
            </div>

            {/* Skeletons */}
            {loading ? (
              <div className="divide-y divide-slate-50">
                {[1,2,3,4].map(i => (
                  <div key={i} className="grid gap-4 px-6 py-4 animate-pulse"
                       style={{ gridTemplateColumns: "2fr 120px 60px 1fr 130px 90px" }}>
                    <div className="space-y-2">
                      <div className="h-3.5 bg-slate-100 rounded w-3/4" />
                      <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                    </div>
                    <div className="h-3.5 bg-slate-100 rounded w-16 self-center" />
                    <div className="h-3.5 bg-slate-100 rounded w-8 self-center" />
                    <div className="h-3.5 bg-slate-100 rounded w-2/3 self-center" />
                    <div className="h-6 bg-slate-100 rounded-full w-24 self-center" />
                    <div className="flex gap-2 self-center">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <ClipboardList size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-semibold text-sm">
                  {search ? "No assignments match your search" : "No assignments yet"}
                </p>
                {!search && view === "mine" && (
                  <button onClick={() => navigate("/bos/assign")}
                          className="mt-4 flex items-center gap-2 mx-auto bg-[#0f2744] text-white
                                     text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer
                                     hover:bg-[#1e3a5f] transition-all">
                    <Plus size={14} /> Create First Assignment
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {visible.map(a => {
                  const meta       = STATUS_META[a.status] || STATUS_META.pending;
                  const Icon       = meta.icon;
                  const isDeleting = deletingId === a._id;
                  const isMine     = a.assigned_by?._id === user?._id || a.assigned_by === user?._id;

                  return (
                    <div key={a._id}
                         className={`flex flex-col md:grid gap-2 md:gap-4 items-start
                                    md:items-center px-6 py-4 transition-colors
                                    ${isDeleting ? "opacity-50" : "hover:bg-slate-50"}`}
                         style={{ gridTemplateColumns: view === "dept" ? "2fr 120px 60px 1fr 130px 130px 90px" : "2fr 120px 60px 1fr 130px 90px" }}>

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

                      {/* Assigned By — only in dept view */}
                      {view === "dept" && (
                        <span className="text-sm text-slate-500 flex items-center gap-1.5">
                          {isMine ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold
                                             px-2 py-0.5 rounded-full bg-purple-50 text-purple-600
                                             border border-purple-100">
                              <UserCircle size={10} /> You
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 truncate max-w-[100px]">
                              {a.assigned_by?.name || "—"}
                            </span>
                          )}
                        </span>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          title={a.pdf_url ? "View submission" : "Not submitted yet"}
                          onClick={() => a.pdf_url && window.open(a.pdf_url, "_blank")}
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center
                                      transition-colors
                                      ${a.pdf_url
                                        ? "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200 cursor-pointer"
                                        : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"}`}>
                          <Eye size={13} />
                        </button>

                        {canDelete(a) && (
                          <button
                            onClick={() => handleDelete(a._id)}
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
        </main>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}