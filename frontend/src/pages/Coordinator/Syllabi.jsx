import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, LogOut, User,
  Menu, X, Users, Search, Eye,
  CheckCircle, XCircle, Clock, RefreshCw,
  Send, AlertCircle,
  GitMerge
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_META = {
  submitted: { label:"Under Review", color:"#2563eb", bg:"#eff6ff", border:"#bae6fd", icon: Clock       },
  approved:  { label:"Approved",     color:"#059669", bg:"#ecfdf5", border:"#6ee7b7", icon: CheckCircle  },
  rejected:  { label:"Rejected",     color:"#dc2626", bg:"#fef2f2", border:"#fca5a5", icon: XCircle      },
};

const TABS = [
  { id:"all",       label:"All"          },
  { id:"submitted", label:"Under Review" },
  { id:"approved",  label:"Approved"     },
  { id:"rejected",  label:"Rejected"     },
];

const NAV_LINKS = [
  { label:"Dashboard", path:"/coordinator/dashboard", icon: LayoutDashboard },
  { label:"Syllabi",   path:"/coordinator/syllabi",   icon: FileText         },
  { label:"Merge Files",     path:"/mergefiles",     icon: GitMerge           },
];

export default function CoordinatorSyllabi() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user"));

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab]     = useState("all");
  const [search, setSearch]           = useState("");
  const [syllabi, setSyllabi]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  // ── Reject modal state ───────────────────────────────────────
  const [rejectModal, setRejectModal] = useState(null); // holds the syllabus being rejected
  const [remark, setRemark]           = useState("");
  const [submitting, setSubmitting]   = useState(false);

  // ── Per-card action loading ──────────────────────────────────
  const [actionLoading, setActionLoading] = useState({}); // { [id]: true }

  useEffect(() => { fetchSyllabi(); }, []);

  async function fetchSyllabi() {
    setLoading(true); setError("");
    try {
      const res  = await fetch(
        `${API_URL}/api/v1/assignments?department=${user?.department}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");
      setSyllabi((data.assignments || []).filter(a => a.status !== "pending"));
    } catch (err) {
      setError("Failed to load syllabi. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  // ── Approve directly ─────────────────────────────────────────
  async function handleApprove(s) {
    setActionLoading(l => ({ ...l, [s._id]:"approve" }));
    try {
      const res = await fetch(
        `${API_URL}/api/v1/assignments/${s._id}/review`,
        {
          method:  "PATCH",
          headers: { "Content-Type":"application/json" },
          body:    JSON.stringify({ status:"approved", remark:"" }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      // update locally — no need to refetch
      setSyllabi(prev => prev.map(a =>
        a._id === s._id ? { ...a, status:"approved" } : a
      ));
    } catch (err) {
      alert("Failed to approve: " + err.message);
    } finally {
      setActionLoading(l => ({ ...l, [s._id]:null }));
    }
  }

  // ── Open reject modal ────────────────────────────────────────
  function openRejectModal(s) {
    setRejectModal(s);
    setRemark("");
  }

  // ── Submit rejection ─────────────────────────────────────────
  async function handleReject() {
    if (!remark.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_URL}/api/v1/assignments/${rejectModal._id}/review`,
        {
          method:  "PATCH",
          headers: { "Content-Type":"application/json" },
          body:    JSON.stringify({ status:"rejected", remark }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSyllabi(prev => prev.map(a =>
        a._id === rejectModal._id ? { ...a, status:"rejected", remark } : a
      ));
      setRejectModal(null);
      setRemark("");
    } catch (err) {
      alert("Failed to reject: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    if (confirm("Log out?")) { localStorage.removeItem("user"); navigate("/login"); }
  }

  const tabCount = (id) =>
    id === "all" ? syllabi.length : syllabi.filter(s => s.status === id).length;

  const visible = syllabi
    .filter(s => activeTab === "all" || s.status === activeTab)
    .filter(s => {
      const q = search.toLowerCase();
      return (
        s.subject_name?.toLowerCase().includes(q) ||
        s.subject_code?.toLowerCase().includes(q) ||
        s.faculty_id?.name?.toLowerCase().includes(q)
      );
    });

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]"
         style={{ fontFamily:"'Figtree','Segoe UI',sans-serif" }}>

      {/* SIDEBAR */}
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
                <Icon size={16} strokeWidth={2} />{label}
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

      {/* MAIN */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm
                           flex items-center gap-4 px-5 py-3.5">
          <button onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
            <Menu size={19} className="text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="font-extrabold text-slate-800 text-base">Syllabi</h1>
            <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
          </div>
          <button onClick={fetchSyllabi} title="Refresh"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
            <RefreshCw size={14} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-xl">
            <FileText size={13} className="text-teal-600" />
            <span className="text-xs font-bold text-teal-700">{syllabi.length} Total</span>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={16} className="text-teal-500" />
              <span className="text-xs font-bold text-teal-500 uppercase tracking-widest">Review Queue</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">All Submitted Syllabi</h2>
            <p className="text-slate-400 text-sm mt-0.5">Review and approve or reject faculty syllabi</p>
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
            <div className="flex items-center gap-2 bg-white border border-slate-200
                            rounded-xl px-3.5 py-2 ml-auto">
              <Search size={13} className="text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                     placeholder="Search faculty, subject…"
                     className="text-sm text-slate-700 outline-none bg-transparent w-36 placeholder:text-slate-300" />
            </div>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                  <div className="h-1.5 bg-slate-100 rounded mb-4" />
                  <div className="flex gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-3/4" />
                      <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-8 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
              <XCircle size={32} className="mx-auto text-red-300 mb-2" />
              <p className="font-bold text-red-700 text-sm">{error}</p>
              <button onClick={fetchSyllabi}
                      className="mt-3 px-4 py-2 bg-red-600 text-white text-xs font-bold
                                 rounded-xl hover:bg-red-700 cursor-pointer">Retry</button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && visible.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center shadow-sm">
              <FileText size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold text-slate-700">
                {syllabi.length === 0 ? "No syllabi submitted yet" : "No syllabi match your filter"}
              </p>
            </div>
          )}

          {/* Cards */}
          {!loading && !error && visible.length > 0 && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visible.map(s => {
                const meta    = STATUS_META[s.status] || STATUS_META.submitted;
                const Icon    = meta.icon;
                const faculty = s.faculty_id;
                const busy    = actionLoading[s._id];

                return (
                  <div key={s._id}
                       className="bg-white rounded-2xl border border-slate-100 shadow-sm
                                  overflow-hidden hover:shadow-md hover:-translate-y-0.5
                                  transition-all duration-200">
                    {/* stripe */}
                    <div className="h-1.5" style={{
                      background: s.status === "approved"
                        ? "linear-gradient(90deg,#34d399,#059669)"
                        : s.status === "rejected"
                        ? "linear-gradient(90deg,#f87171,#ef4444)"
                        : "linear-gradient(90deg,#60a5fa,#3b82f6)"
                    }} />

                    <div className="p-5">
                      {/* header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100
                                          flex items-center justify-center flex-shrink-0">
                            <FileText size={16} className="text-teal-500" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm">{s.subject_name}</h3>
                            <span className="font-mono text-xs text-slate-400">{s.subject_code}</span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold
                                         px-2 py-1 rounded-full flex-shrink-0"
                              style={{ background:meta.bg, color:meta.color, border:`1px solid ${meta.border}` }}>
                          <Icon size={10} strokeWidth={2.5} />{meta.label}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mb-0.5">
                        <span className="font-semibold text-slate-700">Faculty: </span>
                        {faculty?.name || "—"}
                      </p>
                      <p className="text-xs text-slate-400 mb-4">
                        Sem {s.sem} ·{" "}
                        {new Date(s.submitted_at || s.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                      </p>

                      {/* rejection remark */}
                      {s.status === "rejected" && s.remark && (
                        <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-3 flex gap-2">
                          <XCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold text-red-500 mb-0.5">Remark sent</p>
                            <p className="text-xs text-red-700 line-clamp-2">{s.remark}</p>
                          </div>
                        </div>
                      )}

                      {/* ── ACTION BUTTONS ────────────────────── */}
                      <div className="flex gap-2">
                        {/* PDF button */}
                        {s.pdf_url ? (
                          <button onClick={() => window.open(s.pdf_url, "_blank")}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs
                                             font-bold bg-slate-100 border border-slate-200 text-slate-600
                                             hover:bg-slate-200 transition-colors cursor-pointer flex-shrink-0">
                            <Eye size={12} /> PDF
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs
                                          font-bold bg-slate-50 border border-slate-100 text-slate-300
                                          cursor-not-allowed flex-shrink-0">
                            <Eye size={12} /> No PDF
                          </div>
                        )}

                        {/* Approve + Reject — only for under review */}
                        {s.status === "submitted" ? (
                          <>
                            <button
                              onClick={() => handleApprove(s)}
                              disabled={!!busy}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2
                                         rounded-xl text-xs font-bold text-white transition-all
                                         cursor-pointer hover:-translate-y-0.5 disabled:opacity-60
                                         disabled:cursor-not-allowed"
                              style={{ background:"#059669" }}
                            >
                              {busy === "approve"
                                ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <><CheckCircle size={12} /> Approve</>
                              }
                            </button>
                            <button
                              onClick={() => openRejectModal(s)}
                              disabled={!!busy}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2
                                         rounded-xl text-xs font-bold text-white transition-all
                                         cursor-pointer hover:-translate-y-0.5 disabled:opacity-60
                                         disabled:cursor-not-allowed"
                              style={{ background:"#dc2626" }}
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        ) : (
                          /* Already decided — show greyed label */
                          <div className="flex-1 flex items-center justify-center gap-1.5 py-2
                                          rounded-xl text-xs font-bold border border-slate-100
                                          text-slate-400 bg-slate-50">
                            {s.status === "approved"
                              ? <><CheckCircle size={12} className="text-green-400" /> Approved</>
                              : <><XCircle    size={12} className="text-red-400"   /> Rejected</>
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ══ REJECT MODAL ═════════════════════════════════════════ */}
      {rejectModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
             style={{ background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)",
                      animation:"fadeIn .15s ease" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
               style={{ animation:"slideUp .2s ease" }}>

            {/* Modal header */}
            <div className="px-6 pt-6 pb-5 relative"
                 style={{ background:"linear-gradient(135deg,#fef2f2,white)" }}>
              <button onClick={() => setRejectModal(null)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100
                                 flex items-center justify-center hover:bg-slate-200 cursor-pointer">
                <X size={14} className="text-slate-500" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200
                              flex items-center justify-center mb-3">
                <XCircle size={22} className="text-red-600" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">Reject Syllabus</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                <span className="font-semibold text-slate-700">{rejectModal.subject_name}</span>
                {" · "}{rejectModal.faculty_id?.name}
              </p>
            </div>

            <div className="px-6 py-5">
              {/* Remark input */}
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Remark for Faculty *
              </label>
              <textarea
                rows={4}
                value={remark}
                onChange={e => setRemark(e.target.value)}
                placeholder="Tell the faculty exactly what needs to be fixed…"
                autoFocus
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3
                           text-sm text-slate-800 outline-none resize-none transition-all
                           focus:border-red-300 focus:ring-2 focus:ring-red-50 focus:bg-white
                           placeholder:text-slate-300"
              />

              {/* Warning if empty */}
              {!remark.trim() && (
                <div className="flex items-center gap-2 mt-2">
                  <AlertCircle size={12} className="text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-600">
                    Faculty needs to know what to fix — remark is required.
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2 mt-4">
                <button onClick={() => setRejectModal(null)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm
                                   font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!remark.trim() || submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white
                             flex items-center justify-center gap-2 transition-all cursor-pointer
                             disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                  style={{ background: remark.trim() ? "#dc2626" : "#94a3b8",
                           boxShadow:  remark.trim() ? "0 6px 20px #dc262633" : "none" }}
                >
                  {submitting
                    ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending…</>
                    : <><Send size={14} />Send to Faculty</>
                  }
                </button>
              </div>
            </div>
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