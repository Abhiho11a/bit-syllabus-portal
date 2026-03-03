import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, LogOut,
  User, Menu, X, ShieldCheck, Search,
  Plus, CheckCircle, AlertCircle, Send,
  GraduationCap, BookOpen,
  GitMerge
} from "lucide-react";

const NAV_LINKS = [
  { label:"Dashboard",   path:"/admin/dashboard",   icon: LayoutDashboard },
  { label:"Users",       path:"/admin/users",        icon: Users           },
  { label:"Departments", path:"/admin/departments",  icon: Building2       },
  { label:"Merge Files",     path:"/mergefiles",     icon: GitMerge           },
];

const MOCK_DEPTS = [
  { id:"d1", name:"Computer Science & Engineering",       code:"CSE",   faculty:8,  bos:"Prof. Anitha Rao",   coordinator:"Dr. Suresh Naik",  is_active:true  },
  { id:"d2", name:"Information Science & Engineering",    code:"ISE",   faculty:7,  bos:"Dr. Ramesh Babu",    coordinator:"Dr. Maya Patel",    is_active:true  },
  { id:"d3", name:"Electronics & Communication Engg.",    code:"ECE",   faculty:9,  bos:"Prof. Kavya Shetty", coordinator:"Mr. Arjun Das",     is_active:true  },
  { id:"d4", name:"Mechanical Engineering",               code:"MECH",  faculty:6,  bos:"Dr. Mohan Reddy",    coordinator:"Dr. Seema Joshi",   is_active:true  },
  { id:"d5", name:"Civil Engineering",                    code:"CIVIL", faculty:5,  bos:"Prof. Sujatha Naik", coordinator:"Mr. Vijay Shetty",  is_active:true  },
];

const BLANK = { name:"", code:"" };

export default function AdminDepartments() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user"));

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [depts,       setDepts]       = useState(MOCK_DEPTS);
  const [search,      setSearch]      = useState("");
  const [showAdd,     setShowAdd]     = useState(false);
  const [form,        setForm]        = useState(BLANK);
  const [adding,      setAdding]      = useState(false);

  const setF = (k) => (v) => setForm(f => ({ ...f, [k]:v }));

  function handleLogout() {
    if (confirm("Log out?")) { localStorage.removeItem("user"); navigate("/login"); }
  }

  function handleToggle(id) {
    setDepts(l => l.map(d => d.id === id ? { ...d, is_active:!d.is_active } : d));
    // TODO: PATCH /api/v1/departments/:id { is_active }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name || !form.code) { alert("Fill all fields"); return; }
    setAdding(true);
    // TODO: POST /api/v1/departments { name, code }
    await new Promise(r => setTimeout(r, 800));
    setDepts(l => [{
      id:         `d${Date.now()}`,
      name:        form.name,
      code:        form.code.toUpperCase(),
      faculty:     0,
      bos:         "Not assigned",
      coordinator: "Not assigned",
      is_active:   true,
    }, ...l]);
    setForm(BLANK); setShowAdd(false); setAdding(false);
  }

  const visible = depts.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]"
         style={{ fontFamily:"'Figtree','Segoe UI',sans-serif" }}>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0f2744] transition-all duration-300 overflow-hidden flex-shrink-0 ${sidebarOpen ? "w-64" : "w-0 md:w-64"}`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={17} className="text-rose-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-white">Admin Panel</p>
            <p className="text-[11px] text-rose-300 font-mono">System Control</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/40 hover:text-white cursor-pointer"><X size={16} /></button>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, path, icon: Icon }) => {
            const active = window.location.pathname === path;
            return (
              <button key={path} onClick={() => { navigate(path); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${active ? "bg-white/15 text-white" : "text-rose-200 hover:bg-white/8 hover:text-white"}`}>
                <Icon size={16} strokeWidth={2} />{label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 bg-white/8 rounded-xl px-3 py-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0"><User size={14} className="text-rose-300" /></div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-rose-300">System Admin</p>
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
            <h1 className="font-extrabold text-slate-800 text-base">Departments</h1>
            <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
          </div>
          <button onClick={() => setShowAdd(true)}
                  className="flex items-center gap-2 bg-[#0f2744] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#1e3a5f] transition-all hover:-translate-y-0.5 cursor-pointer">
            <Plus size={14} /> Add Department
          </button>
        </header>

        <main className="flex-1 p-5 md:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={16} className="text-rose-500" />
              <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Institution</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">Departments</h2>
            <p className="text-slate-400 text-sm mt-0.5">Manage academic departments and their assigned roles</p>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 mb-5 w-full max-w-xs">
            <Search size={13} className="text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
                   placeholder="Search departments…"
                   className="text-sm text-slate-700 outline-none bg-transparent flex-1 placeholder:text-slate-300" />
          </div>

          {/* Dept cards */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visible.map(d => (
              <div key={d.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">

                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-extrabold text-white"
                         style={{ background: d.is_active ? "linear-gradient(135deg,#dc2626,#7f1d1d)" : "#94a3b8" }}>
                      {d.code.slice(0,2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm leading-snug">{d.name}</h3>
                      <span className="font-mono text-xs text-slate-400">{d.code}</span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 flex-shrink-0
                    ${d.is_active ? "bg-green-50 text-green-600 border border-green-100" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                    {d.is_active ? <><CheckCircle size={10} />Active</> : <><AlertCircle size={10} />Inactive</>}
                  </span>
                </div>

                {/* Assigned roles */}
                <div className="flex flex-col gap-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <GraduationCap size={12} className="text-rose-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-700">{d.faculty}</span> Faculty members
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <BookOpen size={12} className="text-purple-400 flex-shrink-0" />
                    BOS: <span className="font-semibold text-slate-700">{d.bos}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users size={12} className="text-teal-400 flex-shrink-0" />
                    Coordinator: <span className="font-semibold text-slate-700">{d.coordinator}</span>
                  </div>
                </div>

                <button onClick={() => handleToggle(d.id)}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer
                          ${d.is_active
                            ? "bg-red-50 text-red-500 border border-red-100 hover:bg-red-100"
                            : "bg-green-50 text-green-600 border border-green-100 hover:bg-green-100"}`}>
                  {d.is_active ? "Deactivate Department" : "Reactivate Department"}
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* ADD DEPT MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
             style={{ background:"rgba(0,0,0,0.45)", backdropFilter:"blur(6px)", animation:"fadeIn .15s ease" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
               style={{ animation:"slideUp .2s ease" }}>
            <div className="px-6 pt-6 pb-5 relative" style={{ background:"linear-gradient(135deg,#fef2f2,white)" }}>
              <button onClick={() => setShowAdd(false)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 cursor-pointer">
                <X size={14} className="text-slate-500" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center mb-3">
                <Building2 size={22} className="text-rose-600" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">Add Department</h2>
              <p className="text-sm text-slate-400 mt-0.5">Create a new academic department</p>
            </div>

            <form onSubmit={handleAdd} className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department Name *</label>
                <input value={form.name} onChange={e => setF("name")(e.target.value)}
                       placeholder="e.g. Computer Science & Engineering"
                       className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all placeholder:text-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department Code *</label>
                <input value={form.code} onChange={e => setF("code")(e.target.value.toUpperCase())}
                       placeholder="e.g. CSE"
                       maxLength={8}
                       className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-mono text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all placeholder:text-slate-300" />
                <p className="text-[11px] text-slate-400 mt-1">Short code used across the system (e.g. CSE, ISE)</p>
              </div>
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setShowAdd(false)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={adding}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5"
                        style={{ background: adding ? "#94a3b8" : "#dc2626", boxShadow: adding ? "none" : "0 6px 20px #dc262633" }}>
                  {adding ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Adding…</> : <><Send size={14} />Create</>}
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