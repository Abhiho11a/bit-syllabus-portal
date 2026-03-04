// pages/faculty/Submitted.jsx — fully dynamic

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle, XCircle, Clock, FileText,
  Search, Eye, RotateCcw, RefreshCw,
  GraduationCap, LayoutDashboard, LogOut,
  User, Menu, X
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_META = {
  approved:  { label:"Approved",       color:"#059669", bg:"#ecfdf5", border:"#6ee7b7", icon: CheckCircle },
  rejected:  { label:"Needs Revision", color:"#dc2626", bg:"#fef2f2", border:"#fca5a5", icon: XCircle     },
  submitted: { label:"Under Review",   color:"#2563eb", bg:"#eff6ff", border:"#bae6fd", icon: Clock       },
};

const NAV_LINKS = [
  { label:"Dashboard",     path:"/faculty/dashboard", icon: LayoutDashboard },
  { label:"Pending Tasks", path:"/faculty/pending",   icon: Clock           },
  { label:"Submitted",     path:"/faculty/submitted", icon: FileText         },
];

const TABS = [
  { id:"all",       label:"All"            },
  { id:"approved",  label:"Approved"       },
  { id:"submitted", label:"Under Review"   },
  { id:"rejected",  label:"Needs Revision" },
];

export default function FacultySubmitted() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user"));

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab]     = useState("all");
  const [search, setSearch]           = useState("");
  const [syllabi, setSyllabi]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true); setError("");
    try {
      const res  = await fetch(
        `${API_URL}/api/v1/assignments?faculty_id=${user?.id}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");

      // only show submitted/approved/rejected — not pending
      setSyllabi((data.assignments || []).filter(a => a.status !== "pending"));
    } catch (err) {
      console.error(err);
      setError("Failed to load. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    if (confirm("Log out?")) { localStorage.removeItem("user"); navigate("/login"); }
  }

  const tabCount = (id) =>
    id === "all" ? syllabi.length : syllabi.filter(s => s.status === id).length;

  const visible = syllabi
    .filter(s => activeTab === "all" || s.status === activeTab)
    .filter(s =>
      s.subject_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.subject_code?.toLowerCase().includes(search.toLowerCase())
    );

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
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, path, icon: Icon }) => {
            const active = window.location.pathname === path;
            return (
              <button key={path} onClick={() => { navigate(path); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
                                 text-sm font-semibold transition-all cursor-pointer text-left
                                 ${active ? "bg-white/15 text-white" : "text-blue-200 hover:bg-white/8 hover:text-white"}`}>
                <Icon size={16} strokeWidth={2} />{label}
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
            <h1 className="font-extrabold text-slate-800 text-base">Submitted Syllabi</h1>
            <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
          </div>
          <button onClick={fetchData} title="Refresh"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
            <RefreshCw size={14} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl">
            <FileText size={13} className="text-blue-600" />
            <span className="text-xs font-bold text-blue-700">{syllabi.length} Total</span>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={16} className="text-blue-500" />
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">History</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">Submitted Syllabi</h2>
            <p className="text-slate-400 text-sm mt-0.5">Track approval status of all your submissions</p>
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
                     placeholder="Search…"
                     className="text-sm text-slate-700 outline-none bg-transparent w-32 placeholder:text-slate-300" />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-50 animate-pulse">
                  <div className="flex-1">
                    <div className="h-3 bg-slate-100 rounded w-1/3 mb-2" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                  </div>
                  <div className="h-3 bg-slate-100 rounded w-16" />
                  <div className="h-3 bg-slate-100 rounded w-8" />
                  <div className="h-6 bg-slate-100 rounded-full w-24" />
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                    <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
              <XCircle size={32} className="mx-auto text-red-300 mb-2" />
              <p className="font-bold text-red-700 text-sm">{error}</p>
              <button onClick={fetchData}
                      className="mt-3 px-4 py-2 bg-red-600 text-white text-xs font-bold
                                 rounded-xl hover:bg-red-700 cursor-pointer">Retry</button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="hidden md:grid md:grid-cols-[2fr_120px_60px_150px_110px]
                              gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100
                              text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Subject</span>
                <span>Code</span>
                <span>Sem</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {visible.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <FileText size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="font-semibold text-sm">
                    {syllabi.length === 0 ? "No submissions yet" : "No results match your filter"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {visible.map(s => {
                    const meta = STATUS_META[s.status] || STATUS_META.submitted;
                    const Icon = meta.icon;
                    return (
                      <div key={s._id}>
                        <div className="flex flex-col md:grid md:grid-cols-[2fr_120px_60px_150px_110px]
                                        gap-2 md:gap-4 items-start md:items-center
                                        px-6 py-4 hover:bg-slate-50 transition-colors">
                          {/* Subject */}
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{s.subject_name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {s.submitted_at
                                ? new Date(s.submitted_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})
                                : new Date(s.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})
                              }
                            </p>
                          </div>

                          <span className="font-mono text-sm text-slate-600">{s.subject_code}</span>
                          <span className="text-sm text-slate-600">Sem {s.sem}</span>

                          {/* Status badge */}
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold
                                           px-2.5 py-1 rounded-full w-fit"
                                style={{ background:meta.bg, color:meta.color, border:`1px solid ${meta.border}` }}>
                            <Icon size={11} strokeWidth={2.5} />{meta.label}
                          </span>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {/* View / Download PDF */}
                            {s.pdf_url ? (
                              <button
                                onClick={() => window.open(s.pdf_url, "_blank")}
                                title={s.status === "approved" ? "Download PDF" : "View PDF"}
                                className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100
                                           flex items-center justify-center text-blue-500
                                           hover:bg-blue-100 transition-colors cursor-pointer">
                                <Eye size={13} />
                              </button>
                            ) : (
                              <div title="No PDF yet"
                                   className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100
                                              flex items-center justify-center text-slate-300 cursor-not-allowed">
                                <Eye size={13} />
                              </div>
                            )}

                            {/* Re-edit button for rejected */}
                            {s.status === "rejected" && (
                              <button
                                onClick={() => {
                                  const params = new URLSearchParams({
                                    assignmentId: s._id,
                                    subjectCode:  s.subject_code,
                                    subjectName:  s.subject_name,
                                    sem:          s.sem,
                                    department:   user?.department,
                                    facultyName:  user?.name,
                                  });
                                  window.open(`${import.meta.env.VITE_SYLLABUS_URL || "http://localhost:5174"}?${params}`, "_blank");
                                }}
                                title="Re-edit & Resubmit"
                                className="w-8 h-8 rounded-lg bg-red-50 border border-red-100
                                           flex items-center justify-center text-red-500
                                           hover:bg-red-100 transition-colors cursor-pointer">
                                <RotateCcw size={13} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Rejection remark */}
                        {s.status === "rejected" && s.remark && (
                          <div className="mx-6 mb-4 bg-red-50 border border-red-100 rounded-xl
                                          px-4 py-3 flex gap-2.5 items-start">
                            <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-[11px] font-bold text-red-500 mb-0.5">
                                Coordinator's Remark
                              </p>
                              <p className="text-sm text-red-700">{s.remark}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}