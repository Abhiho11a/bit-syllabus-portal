// pages/dean/Faculty.jsx
// Dean views all faculty across all departments (read-only)

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Users, GraduationCap,
  LogOut, User, Menu, X, Shield,
  Search, CheckCircle, AlertCircle
} from "lucide-react";
import { useEffect } from "react";

const NAV_LINKS = [
  { label:"Dashboard",   path:"/dean/dashboard",  icon: LayoutDashboard },
  { label:"Syllabi",     path:"/dean/syllabi",     icon: FileText        },
  { label:"Manage BOS",  path:"/dean/manage-bos",  icon: Users           },
  { label:"Faculty",     path:"/dean/faculty",     icon: GraduationCap   },
];

const DEPTS = ["CSE", "ISE", "ECE", "MECH", "CIVIL"];

export default function DeanFaculty() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search,      setSearch]      = useState("");
  const [deptFilter,  setDeptFilter]  = useState("All");
  const [facList,setFacList] = useState([])

  async function fetchAllFac() {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/faculty`,{
          method:"GET",
          headers: {
              "Content-Type": "application/json",
          }
      })
      const data = await response.json();
  
      if(data.status === "Success")
      {
          setFacList(data.bos)
          alert(data.message)
      }
      else
          alert(data.message)
    }
  
    useEffect(()=>{
      fetchAllFac()
    },[])

  function handleLogout() {
    if (confirm("Log out?")) { localStorage.removeItem("user"); navigate("/login"); }
  }

  const visible = facList
    .filter(f => deptFilter === "All" || f.department === deptFilter)
    .filter(f =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.subject_code.toLowerCase().includes(search.toLowerCase()) ||
      f.department.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]"
         style={{ fontFamily:"'Figtree','Segoe UI',sans-serif" }}>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0f2744] transition-all duration-300 overflow-hidden flex-shrink-0 ${sidebarOpen ? "w-64" : "w-0 md:w-64"}`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
            <Shield size={17} className="text-amber-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-white">Dean Portal</p>
            <p className="text-[11px] text-amber-300 font-mono">All Departments</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/40 hover:text-white cursor-pointer"><X size={16} /></button>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, path, icon: Icon }) => {
            const active = window.location.pathname === path;
            return (
              <button key={path} onClick={() => { navigate(path); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${active ? "bg-white/15 text-white" : "text-amber-200 hover:bg-white/8 hover:text-white"}`}>
                <Icon size={16} strokeWidth={2} />{label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 bg-white/8 rounded-xl px-3 py-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0"><User size={14} className="text-amber-300" /></div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || "Dean"}</p>
              <p className="text-[10px] text-amber-300">Dean of Studies</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
            <LogOut size={15} /> Log Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm flex items-center gap-4 px-5 py-3.5">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-xl hover:bg-slate-100 cursor-pointer"><Menu size={19} className="text-slate-600" /></button>
          <div className="flex-1">
            <h1 className="font-extrabold text-slate-800 text-base">Faculty</h1>
            <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
            <GraduationCap size={13} className="text-amber-600" />
            <span className="text-xs font-bold text-amber-700">{facList.length} Total</span>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap size={16} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">All Departments</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">Faculty Directory</h2>
            <p className="text-slate-400 text-sm mt-0.5">View all faculty across the institution</p>
          </div>

          {/* Dept filter + search */}
          <div className="flex flex-wrap gap-2 mb-5">
            {["All", ...DEPTS].map(d => (
              <button key={d} onClick={() => setDeptFilter(d)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${deptFilter===d ? "bg-amber-500 text-white border-amber-500" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                {d}
              </button>
            ))}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 ml-auto">
              <Search size={13} className="text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                     placeholder="Search faculty…"
                     className="text-sm text-slate-700 outline-none bg-transparent w-36 placeholder:text-slate-300" />
            </div>
          </div>

          {/* Faculty grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visible.map(f => (
              <div key={f.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-base font-extrabold text-white"
                         style={{ background: f.is_active ? "linear-gradient(135deg,#f59e0b,#d97706)" : "#94a3b8" }}>
                      {f.name.split(" ").map(n => n[0]).slice(0,2).join("")}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{f.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-bold bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-lg">{f.department}</span>
                        <span className="font-mono text-xs text-slate-400">{f.subject_code}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 flex-shrink-0
                    ${f.is_active ? "bg-green-50 text-green-600 border border-green-100" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                    {f.is_active ? <><CheckCircle size={10} />Active</> : <><AlertCircle size={10} />Inactive</>}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Subject: </span>{f.subject_name}
                </p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}