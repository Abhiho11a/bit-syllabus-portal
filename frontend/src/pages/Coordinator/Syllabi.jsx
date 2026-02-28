// pages/coordinator/Syllabi.jsx
// Full list of submitted syllabi with filters + review actions

import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, FileText, LogOut, User,
  Menu, X, Users, Search, Eye,
  CheckCircle, XCircle, Clock, Download
} from "lucide-react";

const MOCK_SYLLABI = [
  { id:"s1", faculty_name:"Mrs. Priya Sharma", subject_code:"BCS300", subject_name:"Mathematics III",         sem:3, submitted_date:"2025-07-01", status:"submitted", pdf_url:"" },
  { id:"s2", faculty_name:"Mr. Ravi Kumar",    subject_code:"BCS303", subject_name:"Operating Systems",       sem:3, submitted_date:"2025-07-03", status:"approved",  pdf_url:"https://example.com/pdf1" },
  { id:"s3", faculty_name:"Dr. Suresh Naik",   subject_code:"CS501",  subject_name:"Computer Networks",      sem:5, submitted_date:"2025-07-05", status:"rejected",  pdf_url:"https://example.com/pdf2" },
  { id:"s4", faculty_name:"Mrs. Priya Sharma", subject_code:"CS601",  subject_name:"Machine Learning",       sem:6, submitted_date:"2025-07-06", status:"submitted", pdf_url:"" },
  { id:"s5", faculty_name:"Mr. Ravi Kumar",    subject_code:"CS401",  subject_name:"Analysis of Algorithms", sem:4, submitted_date:"2025-07-07", status:"approved",  pdf_url:"https://example.com/pdf3" },
];

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
];

export default function CoordinatorSyllabi() {
  const navigate        = useNavigate();
//   const { user, logout} = useAuth();
const user = JSON.parse(localStorage.getItem("user"))

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab]     = useState("all");
  const [search, setSearch]           = useState("");

  function handleLogout() {
    if (confirm("Log out?")) { 
        // logout(); 
        navigate("/login"); }
  }

  const tabCount = (id) =>
    id === "all" ? MOCK_SYLLABI.length : MOCK_SYLLABI.filter(s => s.status === id).length;

  const visible = MOCK_SYLLABI
    .filter(s => activeTab === "all" || s.status === activeTab)
    .filter(s =>
      s.subject_name.toLowerCase().includes(search.toLowerCase()) ||
      s.subject_code.toLowerCase().includes(search.toLowerCase()) ||
      s.faculty_name.toLowerCase().includes(search.toLowerCase())
    );

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

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

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
          <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-xl">
            <FileText size={13} className="text-teal-600" />
            <span className="text-xs font-bold text-teal-700">{MOCK_SYLLABI.length} Total</span>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={16} className="text-teal-500" />
              <span className="text-xs font-bold text-teal-500 uppercase tracking-widest">Review Queue</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">All Submitted Syllabi</h2>
            <p className="text-slate-400 text-sm mt-0.5">Review, approve or reject faculty-submitted syllabi</p>
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

          {/* Cards grid */}
          {visible.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center shadow-sm">
              <FileText size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-semibold text-sm text-slate-400">No syllabi found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visible.map(s => {
                const meta = STATUS_META[s.status];
                const Icon = meta.icon;
                return (
                  <div key={s.id}
                       className="bg-white rounded-2xl border border-slate-100 shadow-sm
                                  overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    {/* top stripe */}
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
                            <h3 className="font-bold text-slate-800 text-sm leading-snug">
                              {s.subject_name}
                            </h3>
                            <span className="font-mono text-xs text-slate-400">{s.subject_code}</span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold
                                         px-2 py-1 rounded-full flex-shrink-0"
                              style={{ background:meta.bg, color:meta.color, border:`1px solid ${meta.border}` }}>
                          <Icon size={10} strokeWidth={2.5} />{meta.label}
                        </span>
                      </div>

                      {/* meta */}
                      <p className="text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-slate-700">Faculty:</span> {s.faculty_name}
                      </p>
                      <p className="text-xs text-slate-400 mb-4">
                        Sem {s.sem} ·{" "}
                        {new Date(s.submitted_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {/* View PDF — only if pdf_url exists */}
                        {s.pdf_url ? (
                          <button
                            onClick={() => window.open(s.pdf_url, "_blank")}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
                                       bg-slate-100 border border-slate-200 text-slate-600
                                       hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <Eye size={12} /> PDF
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
                                          bg-slate-50 border border-slate-100 text-slate-300 cursor-not-allowed">
                            <Eye size={12} /> No PDF
                          </div>
                        )}

                        {/* Review button — only for submitted */}
                        {s.status === "submitted" ? (
                          <button
                            onClick={() => navigate(`/coordinator/syllabi/${s.id}`)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                                       text-xs font-bold bg-[#0f2744] text-white
                                       hover:bg-[#1e3a5f] transition-all cursor-pointer hover:-translate-y-0.5"
                          >
                            Review & Decide
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/coordinator/syllabi/${s.id}`)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                                       text-xs font-bold border border-slate-200 text-slate-600
                                       hover:bg-slate-50 transition-all cursor-pointer"
                          >
                            View Details
                          </button>
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
    </div>
  );
}