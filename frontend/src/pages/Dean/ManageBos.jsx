// pages/dean/ManageBOS.jsx
// Dean manages BOS members across all departments

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Users, GraduationCap,
  LogOut, User, Menu, X, Shield,
  Search, UserPlus, CheckCircle, AlertCircle,
  Send, BookOpen
} from "lucide-react";

const NAV_LINKS = [
  { label:"Dashboard",   path:"/dean/dashboard",  icon: LayoutDashboard },
  { label:"Syllabi",     path:"/dean/syllabi",     icon: FileText        },
  { label:"Manage BOS",  path:"/dean/manage-bos",  icon: Users           },
  { label:"Faculty",     path:"/dean/faculty",     icon: GraduationCap   },
];

const MOCK_BOS = [
  { id:"b1", name:"Prof. Anitha Rao",    department:"CSE",   is_active:true,  added_date:"2025-01-10" },
  { id:"b2", name:"Dr. Ramesh Babu",     department:"ISE",   is_active:true,  added_date:"2025-01-12" },
  { id:"b3", name:"Prof. Kavya Shetty",  department:"ECE",   is_active:true,  added_date:"2025-01-15" },
  { id:"b4", name:"Dr. Mohan Reddy",     department:"MECH",  is_active:false, added_date:"2024-12-01" },
  { id:"b5", name:"Prof. Sujatha Naik",  department:"CIVIL", is_active:true,  added_date:"2025-02-01" },
];

const DEPTS = ["CSE", "ISE", "ECE", "MECH", "CIVIL"];
const BLANK = { name:"", department:"", password:"" };

export default function DeanManageBOS() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user"));

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bosList,     setBosList]     = useState(MOCK_BOS);
  const [search,      setSearch]      = useState("");
  const [deptFilter,  setDeptFilter]  = useState("All");
  const [showAdd,     setShowAdd]     = useState(false);
  const [form,        setForm]        = useState(BLANK);
  const [adding,      setAdding]      = useState(false);

  const setF = (k) => (v) => setForm(f => ({ ...f, [k]:v }));

  function handleLogout() {
    if (confirm("Log out?")) { localStorage.removeItem("user"); navigate("/login"); }
  }

  function handleToggle(id) {
    setBosList(l => l.map(b => b.id === id ? { ...b, is_active:!b.is_active } : b));
    // TODO: PATCH /api/v1/users/:id { is_active }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name || !form.department || !form.password) { alert("Fill all fields"); return; }
    setAdding(true);
    // TODO: POST /api/v1/users { ...form, role:"bos" }
    await new Promise(r => setTimeout(r, 800));
    setBosList(l => [{
      id:         `b${Date.now()}`,
      name:        form.name,
      department:  form.department,
      is_active:   true,
      added_date:  new Date().toISOString().split("T")[0],
    }, ...l]);
    setForm(BLANK); setShowAdd(false); setAdding(false);
  }

  const activeCount   = bosList.filter(b => b.is_active).length;
  const inactiveCount = bosList.filter(b => !b.is_active).length;

  const visible = bosList
    .filter(b => deptFilter === "All" || b.department === deptFilter)
    .filter(b => b.name.toLowerCase().includes(search.toLowerCase()) ||
                 b.department.toLowerCase().includes(search.toLowerCase()));

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

      {/* MAIN */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm flex items-center gap-4 px-5 py-3.5">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-xl hover:bg-slate-100 cursor-pointer"><Menu size={19} className="text-slate-600" /></button>
          <div className="flex-1">
            <h1 className="font-extrabold text-slate-800 text-base">Manage BOS</h1>
            <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
          </div>
          <button onClick={() => setShowAdd(true)}
                  className="flex items-center gap-2 bg-[#0f2744] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#1e3a5f] transition-all hover:-translate-y-0.5 cursor-pointer">
            <UserPlus size={14} /> Add BOS
          </button>
        </header>

        <main className="flex-1 p-5 md:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Board of Studies</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">BOS Members</h2>
            <p className="text-slate-400 text-sm mt-0.5">Add and manage BOS members across all departments</p>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label:"Total",    val: bosList.length, color:"#0f766e", bg:"#f0fdfa", border:"#99f6e4" },
              { label:"Active",   val: activeCount,    color:"#059669", bg:"#ecfdf5", border:"#6ee7b7" },
              { label:"Inactive", val: inactiveCount,  color:"#94a3b8", bg:"#f8fafc", border:"#e2e8f0" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-4 flex flex-col gap-1"
                   style={{ background:s.bg, border:`1.5px solid ${s.border}` }}>
                <p className="text-2xl font-extrabold" style={{ color:s.color }}>{s.val}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
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
                     placeholder="Search BOS members…"
                     className="text-sm text-slate-700 outline-none bg-transparent w-36 placeholder:text-slate-300" />
            </div>
          </div>

          {/* BOS cards */}
          {visible.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-14 text-center shadow-sm">
              <Users size={38} className="mx-auto text-slate-200 mb-3" />
              <p className="font-bold text-slate-400">No BOS members found</p>
              <button onClick={() => setShowAdd(true)}
                      className="mt-4 flex items-center gap-2 mx-auto bg-[#0f2744] text-white text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:bg-[#1e3a5f]">
                <UserPlus size={14} /> Add BOS Member
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visible.map(b => (
                <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
                                      text-base font-extrabold text-white"
                           style={{ background: b.is_active ? "linear-gradient(135deg,#f59e0b,#d97706)" : "#94a3b8" }}>
                        {b.name.split(" ").map(n => n[0]).slice(0,2).join("")}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{b.name}</h3>
                        <span className="text-[11px] font-bold bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-lg">
                          {b.department}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 flex-shrink-0
                      ${b.is_active ? "bg-green-50 text-green-600 border border-green-100" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                      {b.is_active ? <><CheckCircle size={10} />Active</> : <><AlertCircle size={10} />Inactive</>}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-4">
                    Added {new Date(b.added_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                  </p>

                  <button onClick={() => handleToggle(b.id)}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer
                            ${b.is_active
                              ? "bg-red-50 text-red-500 border border-red-100 hover:bg-red-100"
                              : "bg-green-50 text-green-600 border border-green-100 hover:bg-green-100"}`}>
                    {b.is_active ? "Deactivate" : "Reactivate"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ADD BOS MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
             style={{ background:"rgba(0,0,0,0.45)", backdropFilter:"blur(6px)", animation:"fadeIn .15s ease" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
               style={{ animation:"slideUp .2s ease" }}>
            <div className="px-6 pt-6 pb-5 relative" style={{ background:"linear-gradient(135deg,#fffbeb,white)" }}>
              <button onClick={() => setShowAdd(false)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 cursor-pointer">
                <X size={14} className="text-slate-500" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mb-3">
                <UserPlus size={22} className="text-amber-600" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">Add BOS Member</h2>
              <p className="text-sm text-slate-400 mt-0.5">Assign a Board of Studies member to a department</p>
            </div>
            <form onSubmit={handleAdd} className="px-6 py-5 flex flex-col gap-4">
              {[
                { key:"name",     label:"Full Name",  placeholder:"e.g. Prof. Anitha Rao" },
                { key:"password", label:"Password",   placeholder:"Set login password", type:"password" },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{field.label} *</label>
                  <input type={field.type || "text"} value={form[field.key]}
                         onChange={e => setF(field.key)(e.target.value)}
                         placeholder={field.placeholder}
                         className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-all placeholder:text-slate-300" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department *</label>
                <select value={form.department} onChange={e => setF("department")(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-all cursor-pointer">
                  <option value="">Select department…</option>
                  {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex gap-2.5">
                <BookOpen size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  BOS logs in with their <span className="font-bold">name + department + password</span>.
                  They can assign syllabi to faculty in their department.
                </p>
              </div>
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setShowAdd(false)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={adding}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
                        style={{ background: adding ? "#94a3b8" : "#f59e0b" }}>
                  {adding ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Adding…</> : <><Send size={14} />Add BOS</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  );
}