// pages/bos/Assign.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, ClipboardList, Plus,
  LogOut, User, Menu, X, BookOpen,
  Send, ChevronLeft, CheckCircle, UserCircle, Building2,
  GitMerge
} from "lucide-react";

const NAV_LINKS = [
  { label:"Dashboard",   path:"/bos/dashboard",  icon: LayoutDashboard },
  { label:"Assign",      path:"/bos/assign",      icon: Plus            },
  { label:"Assignments", path:"/bos/assignments", icon: ClipboardList   },
  { label:"Faculty",     path:"/bos/faculty",     icon: Users           },
  { label:"Merge Files",     path:"/mergefiles",     icon: GitMerge           },
];

const FACULTY_VIEWS = [
  { id:"mine", label:"My Faculty",  icon: UserCircle },
  { id:"all",  label:"All in Dept", icon: Building2  },
];

export default function BosAssign() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user"));

  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [allFaculty,   setAllFaculty]   = useState([]);   // all dept faculty from API
  const [facultyView,  setFacultyView]  = useState("mine"); // toggle state
  const [form, setForm] = useState({
    faculty_id: "", subject_code: "", subject_name: "", sem: ""
  });

  const setF = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  // Fetch ALL faculty in this dept once — filter client-side
  useEffect(() => {
    if (!user?.department) return;
    fetch(`http://127.0.0.1:8000/api/v1/users?role=faculty&department=${user.department}`)
      .then(r => r.json())
      .then(data => setAllFaculty(data.users || []))
      .catch(err => console.error("Failed to load faculty:", err));
  }, []);

  // Filter based on toggle:
  // "mine" → only faculty whose created_by === this BOS's _id
  // "all"  → everyone in the department
  const facultyList = facultyView === "mine"
  ? allFaculty.filter(f => 
      f.created_by?.toString() === user?.id?.toString() ||
      f.created_by?._id?.toString() === user?.id?.toString()
    )
  : allFaculty;

  // Reset faculty_id selection when switching view
  function handleViewSwitch(v) {
    setFacultyView(v);
    setF("faculty_id")("");
  }

  function handleLogout() {
    if (confirm("Log out?")) { localStorage.removeItem("user"); navigate("/login"); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.faculty_id || !form.subject_code || !form.subject_name || !form.sem) {
      alert("Please fill all fields"); return;
    }
    setLoading(true);
    try {
      const res  = await fetch("http://127.0.0.1:8000/api/v1/assignments", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faculty_id:   form.faculty_id,
          subject_code: form.subject_code,
          subject_name: form.subject_name,
          sem:          form.sem,
          department:   user?.department,
          assigned_by:  user?.id,          
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Something went wrong"); return; }
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function assignAnother() {
    setForm({ faculty_id:"", subject_code:"", subject_name:"", sem:"" });
    setSubmitted(false);
  }

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
            <h1 className="font-extrabold text-slate-800 text-base">Assign Syllabus</h1>
            <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
          </div>
          <div className="flex items-center gap-2 bg-purple-50 border border-purple-100
                          px-3 py-1.5 rounded-xl">
            <BookOpen size={13} className="text-purple-600" />
            <span className="text-xs font-bold text-purple-700">BOS</span>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 flex items-start justify-center">
          <div className="w-full max-w-lg">

            <button onClick={() => navigate("/bos/dashboard")}
                    className="flex items-center gap-1.5 text-sm text-slate-500 font-semibold
                               hover:text-slate-800 transition-colors mb-6 cursor-pointer">
              <ChevronLeft size={15} /> Back to Dashboard
            </button>

            {/* ── SUCCESS STATE ── */}
            {submitted ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10
                              flex flex-col items-center text-center"
                   style={{ animation:"slideUp .25s ease" }}>
                <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100
                                flex items-center justify-center mb-4">
                  <CheckCircle size={30} className="text-green-500" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-800 mb-1">Assigned Successfully!</h2>
                <p className="text-slate-400 text-sm mb-2">
                  The faculty will see this in their{" "}
                  <span className="font-semibold text-slate-600">Pending Tasks</span>.
                </p>
                <p className="font-mono text-xs bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600 mb-6">
                  {form.subject_code} · {form.subject_name} · Sem {form.sem}
                </p>
                <div className="flex gap-3 w-full">
                  <button onClick={assignAnother}
                          className="flex-1 py-3 rounded-xl bg-[#0f2744] text-white text-sm
                                     font-bold hover:bg-[#1e3a5f] transition-all cursor-pointer
                                     hover:-translate-y-0.5">
                    Assign Another
                  </button>
                  <button onClick={() => navigate("/bos/assignments")}
                          className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600
                                     text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer">
                    View Assignments
                  </button>
                </div>
              </div>

            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                   style={{ animation:"slideUp .2s ease" }}>

                {/* Card header */}
                <div className="px-7 pt-7 pb-5"
                     style={{ background:"linear-gradient(135deg,#f5f3ff,white)" }}>
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200
                                  flex items-center justify-center mb-3">
                    <Plus size={22} className="text-purple-600" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-800">Assign Syllabus to Faculty</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Once assigned, faculty will see it as a pending task in their dashboard.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-5">

                  {/* ── FACULTY SECTION ── */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Select Faculty *
                      </label>

                      {/* Toggle pill */}
                      <div className="flex items-center bg-slate-100 rounded-xl p-0.5 gap-0.5">
                        {FACULTY_VIEWS.map(v => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => handleViewSwitch(v.id)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px]
                                        font-bold transition-all cursor-pointer
                                        ${facultyView === v.id
                                          ? "bg-white text-[#0f2744] shadow-sm"
                                          : "text-slate-400 hover:text-slate-600"}`}>
                            <v.icon size={11} />
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <select
                      value={form.faculty_id}
                      onChange={e => setF("faculty_id")(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5
                                 text-sm text-slate-800 outline-none focus:border-purple-400
                                 focus:ring-2 focus:ring-purple-50 transition-all cursor-pointer">
                      <option value="">
                        {facultyList.length === 0
                          ? facultyView === "mine"
                            ? "No faculty added by you yet"
                            : "No faculty in department yet"
                          : "Choose faculty member…"}
                      </option>
                      {facultyList.map(f => (
                        <option key={f._id} value={f._id}>{f.name}</option>
                      ))}
                    </select>

                    {/* Hint below dropdown */}
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      {facultyView === "mine"
                        ? `Showing ${facultyList.length} faculty you added`
                        : `Showing all ${facultyList.length} faculty in ${user?.department}`}
                    </p>
                  </div>

                  {/* Subject code + semester */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Subject Code *
                      </label>
                      <input
                        value={form.subject_code}
                        onChange={e => setF("subject_code")(e.target.value.toUpperCase())}
                        placeholder="e.g. BCS300"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5
                                   text-sm font-mono text-slate-800 outline-none focus:border-purple-400
                                   focus:ring-2 focus:ring-purple-50 transition-all placeholder:text-slate-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Semester *
                      </label>
                      <select
                        value={form.sem}
                        onChange={e => setF("sem")(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5
                                   text-sm text-slate-800 outline-none focus:border-purple-400
                                   focus:ring-2 focus:ring-purple-50 transition-all cursor-pointer">
                        <option value="">Select…</option>
                        {[1,2,3,4,5,6,7,8].map(s => (
                          <option key={s} value={s}>Sem {s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subject name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Subject Name *
                    </label>
                    <input
                      value={form.subject_name}
                      onChange={e => setF("subject_name")(e.target.value)}
                      placeholder="e.g. Mathematics III for CS"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5
                                 text-sm text-slate-800 outline-none focus:border-purple-400
                                 focus:ring-2 focus:ring-purple-50 transition-all placeholder:text-slate-300" />
                  </div>

                  {/* Info note */}
                  <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 flex gap-2.5">
                    <BookOpen size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-purple-700 leading-relaxed">
                      After assigning, the faculty member will see this subject in their
                      <span className="font-bold"> Pending Tasks</span> page and can start filling the syllabus.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                               text-sm font-bold text-white transition-all cursor-pointer
                               hover:-translate-y-0.5 mt-1 disabled:cursor-not-allowed"
                    style={{
                      background:  loading ? "#94a3b8" : "#6d28d9",
                      boxShadow:   loading ? "none" : "0 6px 20px #6d28d933",
                    }}>
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Assigning…</>
                      : <><Send size={15} /> Assign to Faculty</>
                    }
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}