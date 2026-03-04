import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, Settings,
  LogOut, User, Menu, X, ShieldCheck,
  GraduationCap, BookOpen, FileText,
  ArrowRight, TrendingUp, CheckCircle,
  GitMerge
} from "lucide-react";
import { useEffect } from "react";
import { useMemo } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const NAV_LINKS = [
  { label:"Dashboard",   path:"/admin/dashboard",   icon: LayoutDashboard },
  { label:"Users",       path:"/admin/users",       icon: Users           },
  { label:"Syllabi",     path:"/admin/syllabi",     icon: FileText },
  // { label:"Departments", path:"/admin/departments", icon: Building2       },
  { label:"Merge Files",     path:"/mergefiles",     icon: GitMerge           },
];

const ROLE_META = {
  faculty:     { color:"#2563eb", bg:"#eff6ff" },
  bos:         { color:"#7c3aed", bg:"#f5f3ff" },
  coordinator: { color:"#0f766e", bg:"#f0fdfa" },
  dean:        { color:"#d97706", bg:"#fffbeb" },
  admin:       { color:"#dc2626", bg:"#fef2f2" },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users,setUsers] = useState([])
  const [syllabi,setSyllabi] = useState([])

  useEffect(()=>{
    fetchAllUsers();
    fetchAssignmentCnt();
  },[])

  async function fetchAllUsers(){
    const response = await fetch(`${API_URL}/api/v1/allusers`)

    const data = await response.json();

    if(!response.ok)
        alert(data.message)
    else
    {
        // alert("All users fetched")
        console.log(data.users)
        setUsers(data.users)
    }
  }
  
  async function fetchAssignmentCnt() {
    try {
      // Admin fetches ALL — no filter
      const res  = await fetch(`${API_URL}/api/v1/assignments`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");
      setSyllabi(data.assignments)
    } catch (err) {
      console.error(err);
      alert("Failed to load syllabi.");
    }
  }

  const stats = useMemo(() => {
    const byRole = (role) => users.filter(u => u.role === role).length;
    const depts  = new Set(users.map(u => u.department).filter(Boolean));
    return {
      totalUsers:  users.length,
      faculty:     byRole("faculty"),
      bos:         byRole("bos"),
      coordinator: byRole("coordinator"),
      dean:        byRole("dean"),
      admin:       byRole("admin"),
      departments: depts.size,
      totalSyllabi:syllabi.length
    };
  }, [users]);

  const recentUsers = useMemo(() => {
  if (!users.length) return [];
  return [...users]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);
}, [users]);

  function handleLogout() {
    if (confirm("Log out?")) { localStorage.removeItem("user"); navigate("/login"); }
  }

  const ROLE_CARDS = [
    { label:"Faculty",     value: stats.faculty,     color:"#2563eb", bg:"#eff6ff", border:"#bae6fd", icon: GraduationCap },
    { label:"BOS",         value: stats.bos,         color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe", icon: BookOpen      },
    { label:"Coordinator", value: stats.coordinator, color:"#0f766e", bg:"#f0fdfa", border:"#99f6e4", icon: Users         },
    { label:"Dean",        value: stats.dean,        color:"#d97706", bg:"#fffbeb", border:"#fcd34d", icon: ShieldCheck   },
  ];

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
            <h1 className="font-extrabold text-slate-800 text-base">Dashboard</h1>
            <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
          </div>
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl">
            <ShieldCheck size={13} className="text-rose-600" />
            <span className="text-xs font-bold text-rose-700">Admin</span>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">

          {/* Banner */}
          <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
               style={{ background:"linear-gradient(135deg,#7f1d1d 0%,#0f2744 100%)" }}>
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
                 style={{ background:"radial-gradient(circle,#fca5a5,transparent)" }} />
            <p className="text-rose-300 text-xs font-bold tracking-widest uppercase mb-1">Admin Panel</p>
            <h2 className="text-white text-xl md:text-2xl font-extrabold mb-0.5">
              Welcome, {user?.name?.split(" ")[0] || "Admin"} 👋
            </h2>
            <p className="text-rose-200 text-sm mb-5">
              Managing <span className="font-bold text-white">{stats.totalUsers} users</span> across{" "}
              <span className="font-bold text-white">{stats.departments} departments</span>
            </p>

            {/* System health */}
            <div className="flex gap-4 mb-5">
              {[
                { label:"Total Users",   val: stats.totalUsers  },
                { label:"Departments",   val: stats.departments },
                { label:"Total Syllabi",       val: stats.totalSyllabi},
              ].map(s => (
                <div key={s.label} className="bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                  <p className="text-2xl font-extrabold text-white">{s.val}</p>
                  <p className="text-xs text-rose-200 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate("/admin/users")}
                      className="flex items-center gap-2 bg-white text-[#7f1d1d] text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-rose-50 transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-lg w-fit">
                Manage Users <ArrowRight size={14} />
              </button>
              <button onClick={() => navigate("/admin/departments")}
                      className="flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-white/20 transition-all cursor-pointer hover:-translate-y-0.5 w-fit">
                Departments
              </button>
            </div>
          </div>

          {/* Role breakdown cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
            {ROLE_CARDS.map(({ label, value, icon: Icon, color, bg, border }) => (
              <button key={label} onClick={() => navigate("/admin/users")}
                      className="rounded-2xl p-5 text-left flex flex-col gap-2 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer"
                      style={{ background:bg, border:`1.5px solid ${border}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:`${color}18` }}>
                  <Icon size={19} style={{ color }} strokeWidth={2} />
                </div>
                <p className="text-3xl font-extrabold leading-none mt-1" style={{ color }}>{value}</p>
                <p className="text-xs font-bold text-slate-700">{label}</p>
                <div className="flex items-center gap-1 mt-auto pt-1" style={{ color }}>
                  <span className="text-[11px] font-bold">Manage</span>
                  <ArrowRight size={11} />
                </div>
              </button>
            ))}
          </div>

          {/* Recent users */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-rose-500" />
                <h3 className="font-bold text-slate-800">Recently Added Users</h3>
              </div>
              <button onClick={() => navigate("/admin/users")}
                      className="text-xs text-rose-600 font-bold flex items-center gap-1 hover:text-rose-800 cursor-pointer">
                View All <ArrowRight size={12} />
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {recentUsers?.map(u => {
                const meta = ROLE_META[u.role] || ROLE_META.faculty;
                return (
                  <div key={u.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-extrabold text-white"
                           style={{ background:"linear-gradient(135deg,#dc2626,#7f1d1d)" }}>
                        {u.name.split(" ").map(n => n[0]).slice(0,2).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{u.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full capitalize"
                            style={{ background:meta.bg, color:meta.color }}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}