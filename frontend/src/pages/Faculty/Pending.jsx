import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock, BookOpen, ArrowRight, CheckCircle,
  Search, Calendar, GraduationCap, LayoutDashboard,
  FileText, LogOut, User, Menu, X, RefreshCw,
  RotateCcw, Eye, AlertCircle, Loader2, X as XIcon,
  Download, RefreshCw as RefreshIcon
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;
const SYLLABUS_URL = (import.meta.env.VITE_SYLLABUS_URL || "http://localhost:5174").replace(/\/$/, "");

const NAV_LINKS = [
  { label:"Dashboard",     path:"/faculty/dashboard", icon: LayoutDashboard },
  { label:"Pending Tasks", path:"/faculty/pending",   icon: Clock           },
  { label:"Submitted",     path:"/faculty/submitted", icon: FileText        },
];

function daysSince(d) {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
}

function UrgencyBadge({ days, status }) {
  // Don't show urgency for submitted assignments
  if (status === "submitted") {
    return (
      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-100">
        Submitted
      </span>
    );
  }

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

// ── PDF Viewer Modal ──────────────────────────────────────────
function PDFViewerModal({ isOpen, pdfUrl, onClose, taskName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col
                      shadow-2xl animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="font-bold text-slate-800">View Syllabus</h2>
            <p className="text-xs text-slate-400 mt-1">{taskName}</p>
          </div>
          <button onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <XIcon size={20} className="text-slate-500" />
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-slate-50">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="Syllabus PDF"
              className="w-full h-full"
              style={{ minHeight: "500px" }}
            />
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <AlertCircle size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400">PDF not available</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex-shrink-0 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {pdfUrl ? (
              <>
                💡 <span>You can download the PDF using your browser's download button</span>
              </>
            ) : (
              <span>Unable to load PDF</span>
            )}
          </p>
          <button onClick={onClose}
                  className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg
                             hover:bg-slate-800 transition-colors cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FacultyPending() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user"));

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search,      setSearch]      = useState("");
  const [semFilter,   setSemFilter]   = useState("all");
  const [tasks,       setTasks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(null);
  const [barcodeUrl, setBarcodeUrl] = useState("");

  // PDF Viewer state
  const [pdfModal, setPdfModal] = useState({ isOpen: false, url: "", taskName: "" });

  useEffect(() => {
    fetch(`${API_URL}/api/v1/settings/barcode_url`)
      .then(r => r.json())
      .then(d => { if (d && d.value) setBarcodeUrl(d.value); })
      .catch(e => console.error(e));
  }, []);

  // ── Fetch all pending assignments (exclude approved) ─────────
  function fetchAssignments() {
    setLoading(true);
    fetch(`${API_URL}/api/v1/assignments?faculty_id=${user?.id}&status=pending,submitted`)
      .then(r => r.json())
      .then(data => {
        console.log(data);
        // Filter out approved assignments
        const filteredTasks = (data.assignments || []).filter(
          task => task.status !== "approved"
        );
        setTasks(filteredTasks);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }

  // ── On mount: check if returning from Netlify form ─────────────
  useEffect(() => {
    const params       = new URLSearchParams(window.location.search);
    const pdfUrl       = params.get("pdf_url");
    const assignmentId = params.get("assignmentId");

    if (pdfUrl && assignmentId) {
      // Clean URL immediately
      window.history.replaceState({}, "", window.location.pathname);
      submitAssignment(assignmentId, pdfUrl);
    }
    fetchAssignments();
  }, []);

  // ── Save submission to backend ─────────────────────────────────
  async function submitAssignment(assignmentId, pdfUrl) {
    setSubmitting(true);
    try {
      const res  = await fetch(`${API_URL}/api/v1/submit`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, pdf_url: pdfUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setJustSubmitted(assignmentId);
      setTimeout(() => {
        setJustSubmitted(null);
        fetchAssignments();
      }, 2500);
    } catch (err) {
      toast.error("Failed to save submission: " + err.message);
      fetchAssignments();
    } finally {
      setSubmitting(false);
    }
  }

  // ── Open syllabus form for pending assignments ──────────────────
  function openSyllabusForm(assignment) {
    const params = new URLSearchParams({
      assignmentId: assignment._id,
      subjectCode:  assignment.subject_code,
      subjectName:  assignment.subject_name,
      sem:          String(assignment.sem),
      faculty:      assignment.faculty_id?.name || user?.name || "",
      department:   assignment.department || user?.department || "",
      callbackUrl:  window.location.origin + "/faculty/pending",
    });
    if (barcodeUrl) params.append("barcodeUrl", barcodeUrl);
    window.location.href = `${SYLLABUS_URL}/?${params.toString()}`;
  }

  // ── Refill syllabus (for submitted assignments) ───────────────
  function refillSyllabusForm(assignment) {
    const params = new URLSearchParams({
      assignmentId: assignment._id,
      subjectCode:  assignment.subject_code,
      subjectName:  assignment.subject_name,
      sem:          String(assignment.sem),
      faculty:      assignment.faculty_id?.name || user?.name || "",
      department:   assignment.department || user?.department || "",
      callbackUrl:  window.location.origin + "/faculty/pending",
    });
    if (barcodeUrl) params.append("barcodeUrl", barcodeUrl);
    window.location.href = `${SYLLABUS_URL}/?${params.toString()}`;
  }

  // ── View submitted PDF ─────────────────────────────────────────
  function viewPDF(pdfUrl, taskName) {
    setPdfModal({ isOpen: true, url: pdfUrl, taskName });
  }

  function closePDFModal() {
    setPdfModal({ isOpen: false, url: "", taskName: "" });
  }

  function handleLogout() {
    if (confirm("Log out?")) { navigate("/login"); }
  }

  const sems     = useMemo(() => [...new Set(tasks.map(t => t.sem))].sort(), [tasks]);
  const filtered = useMemo(() =>
    tasks
      .filter(t => semFilter === "all" || t.sem === Number(semFilter))
      .filter(t =>
        t.subject_name?.toLowerCase().includes(search.toLowerCase()) ||
        t.subject_code?.toLowerCase().includes(search.toLowerCase())
      ),
    [tasks, semFilter, search]
  );

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]"
         style={{ fontFamily:"'Figtree','Segoe UI',sans-serif" }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
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
              <button key={path} onClick={() => { navigate(path); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
                                 text-sm font-semibold transition-all cursor-pointer text-left
                                 ${active ? "bg-white/15 text-white" : "text-blue-200 hover:bg-white/8 hover:text-white"}`}>
                <Icon size={16} strokeWidth={2} />
                <span className="flex-1">{label}</span>
                {label === "Pending Tasks" && tasks.filter(t => t.status === "pending").length > 0 && (
                  <span className="text-[10px] font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full">
                    {tasks.filter(t => t.status === "pending").length}
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
              <p className="text-[10px] text-blue-300 truncate">{user?.department || "—"}</p>
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

      {/* ── MAIN ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">

        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm
                           flex items-center gap-4 px-5 py-3.5">
          <button onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 rounded-xl hover:bg-slate-100 cursor-pointer">
            <Menu size={19} className="text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="font-extrabold text-slate-800 text-base">Pending Tasks</h1>
            <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
          </div>
          <button onClick={fetchAssignments} title="Refresh"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
            <RefreshCw size={14} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
            <Clock size={13} className="text-amber-500" />
            <span className="text-xs font-bold text-amber-600">
              {tasks.filter(t => t.status === "pending").length} Pending
            </span>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">

          {/* Submitting banner */}
          {submitting && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 mb-6
                            flex items-center gap-3" style={{ animation:"fadeIn .2s ease" }}>
              <Loader2 size={16} className="text-blue-500 animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-blue-700">Saving your submission…</p>
                <p className="text-xs text-blue-400">Uploading to database, please wait</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Assigned by BOS</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">Your Pending Tasks</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {tasks.length} subject{tasks.length !== 1 ? "s" : ""} waiting for syllabus
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

          {/* Loading skeletons */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse flex flex-col md:flex-row items-center gap-4">
                  <div className="flex items-center gap-4 w-full md:w-auto md:min-w-[220px]">
                    <div className="w-11 h-11 bg-slate-100 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-32" />
                      <div className="h-3 bg-slate-100 rounded w-20" />
                    </div>
                  </div>
                  <div className="hidden md:block h-4 bg-slate-100 rounded w-24 flex-1" />
                  <div className="w-full md:w-32 h-10 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center shadow-sm">
              <CheckCircle size={44} className="mx-auto text-green-300 mb-3" />
              <p className="font-bold text-slate-700 text-lg">All caught up!</p>
              <p className="text-slate-400 text-sm mt-1">No pending tasks match your filter.</p>
            </div>
          )}

          {/* Task lists */}
          {!loading && filtered.length > 0 && (
            <div className="flex flex-col gap-3">
              {filtered.map(task => {
                const days            = daysSince(task.createdAt);
                const isJustSubmitted = justSubmitted === task._id;
                const isPending       = task.status === "pending";
                const isSubmitted     = task.status === "submitted";

                // ── Card: just submitted state ──────────────────
                if (isJustSubmitted) {
                  return (
                    <div key={task._id}
                         className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden relative flex flex-col md:flex-row items-center p-5 pl-7 md:pr-6"
                         style={{ animation:"fadeIn .3s ease" }}>
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-green-400 to-emerald-500" />
                      
                      <div className="flex items-center gap-3.5 mb-3 md:mb-0 md:min-w-[260px] w-full md:w-auto">
                        <div className="w-11 h-11 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle size={20} className="text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">{task.subject_name}</h3>
                          <span className="font-mono text-xs text-slate-400">{task.subject_code}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 flex justify-end w-full md:w-auto">
                        <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-2.5 text-center w-full md:w-auto">
                          <p className="text-sm font-bold text-green-700">✅ Submitted successfully!</p>
                          <p className="text-[11px] text-green-600 mt-0.5">Sent to coordinator for review</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                // ── Card: normal state (pending or submitted) ────
                return (
                  <div key={task._id}
                       className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative group
                                  hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-200">
                    <div className="absolute left-0 top-0 w-full h-1 md:w-1.5 md:h-full transition-all" style={{
                      background: isPending
                        ? (days > 14
                          ? "linear-gradient(180deg,#f87171,#ef4444)"
                          : days > 7
                          ? "linear-gradient(180deg,#fbbf24,#f59e0b)"
                          : "linear-gradient(180deg,#60a5fa,#3b82f6)")
                        : "linear-gradient(180deg,#34d399,#10b981)"
                    }} />

                    <div className="p-5 md:pl-7 md:pr-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                      
                      {/* Left: Icon & Title */}
                      <div className="flex items-center gap-3.5 md:min-w-[280px]">
                        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105
                                        ${isSubmitted 
                                          ? "bg-green-50 border-green-100 text-green-600" 
                                          : "bg-blue-50 border-blue-100 text-blue-600"}`}>
                          <BookOpen size={18} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-blue-600 transition-colors truncate">
                            {task.subject_name}
                          </h3>
                          <span className="font-mono text-xs text-slate-400 mt-0.5 block truncate">
                            {task.subject_code}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 md:flex-1 gap-y-2 gap-x-4 items-center text-xs text-slate-500 md:px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600">S{task.sem}</span>
                          <span className="hidden lg:inline">Semester {task.sem}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span className="hidden xl:inline">{new Date(task.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                          <span className="xl:hidden">{new Date(task.createdAt).toLocaleDateString("en-IN",{month:"short",year:"2-digit"})}</span>
                        </div>
                        <div className="flex items-center gap-1.5 hidden md:flex">
                          <User size={13} className="text-slate-400" />
                          <span className="truncate">By {task.assigned_by?.name || "BOS"}</span>
                        </div>
                        <div className="flex items-center md:justify-end">
                           <UrgencyBadge days={days} status={task.status} />
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 flex-shrink-0">
                        {isPending && (
                          <button onClick={() => openSyllabusForm(task)}
                                  className="w-full md:w-auto flex items-center justify-center gap-2
                                             bg-[#0f2744] text-white text-sm font-bold px-6 py-2.5 rounded-xl
                                             hover:bg-[#1e3a5f] transition-all hover:-translate-y-0.5 cursor-pointer shadow-md shadow-slate-900/10">
                            Fill Syllabus <ArrowRight size={14} />
                          </button>
                        )}

                        {isSubmitted && (
                          <>
                            <button onClick={() => refillSyllabusForm(task)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2
                                               bg-[#0f2744] text-white text-sm font-bold px-6 py-2.5 rounded-xl
                                               hover:bg-[#1e3a5f] transition-all hover:-translate-y-0.5 cursor-pointer shadow-md shadow-slate-900/10">
                              <RefreshIcon size={14} /> Refill
                            </button>
                            <button onClick={() => viewPDF(task.pdf_url, task.subject_name)}
                                    className="flex-shrink-0 flex items-center justify-center gap-2
                                               bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl
                                               hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all cursor-pointer shadow-sm"
                                    title="View PDF">
                              <Eye size={16} />
                            </button>
                          </>
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

      {/* PDF Viewer Modal */}
      <PDFViewerModal 
        isOpen={pdfModal.isOpen}
        pdfUrl={pdfModal.url}
        onClose={closePDFModal}
        taskName={pdfModal.taskName}
      />

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}