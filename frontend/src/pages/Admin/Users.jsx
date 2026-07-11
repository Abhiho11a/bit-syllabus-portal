// pages/admin/Users.jsx
// Admin manages all users across all roles

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, LogOut,
  User, Menu, X, ShieldCheck, Search,
  UserPlus, CheckCircle, AlertCircle, Send, Trash2,
  FileText,
  GitMerge,
  LayoutList,
  Layers,
  Edit2
} from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const NAV_LINKS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Syllabi", path: "/admin/syllabi", icon: FileText },
  { label: "Merge Files", path: "/mergefiles", icon: GitMerge },
];

const ROLES = ["faculty", "bos", "coordinator", "dean", "admin"];
const DEPTS = ["CSE", "ISE", "ECE", "MECH", "CIVIL"];

const ROLE_META = {
  faculty: { color: "#2563eb", bg: "#eff6ff" },
  bos: { color: "#7c3aed", bg: "#f5f3ff" },
  coordinator: { color: "#0f766e", bg: "#f0fdfa" },
  dean: { color: "#d97706", bg: "#fffbeb" },
  admin: { color: "#dc2626", bg: "#fef2f2" },
};

const DEPT_META = {
  CSE: { color: "#2563eb", bg: "#eff6ff", accent: "#3b82f6" },
  ISE: { color: "#7c3aed", bg: "#f5f3ff", accent: "#8b5cf6" },
  ECE: { color: "#0f766e", bg: "#f0fdfa", accent: "#14b8a6" },
  MECH: { color: "#d97706", bg: "#fffbeb", accent: "#f59e0b" },
  CIVIL: { color: "#dc2626", bg: "#fef2f2", accent: "#ef4444" },
  "—": { color: "#64748b", bg: "#f8fafc", accent: "#94a3b8" },
};

const BLANK = { name: "", role: "faculty", department: "", subject_code: "", password: "", email: "" };

export default function AdminUsers() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [adding, setAdding] = useState(false);
  // NEW: view mode toggle
  const [viewMode, setViewMode] = useState("role"); // "role" | "department"

  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", name: "", password: "", email: "" });
  const [editing, setEditing] = useState(false);

  const setF = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const setE = (k) => (v) => setEditForm(f => ({ ...f, [k]: v }));

  useEffect(() => { fetchAllUsers(); }, []);

  async function fetchAllUsers() {
    const fetchPromise = fetch(`${API_URL}/api/v1/allusers`).then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    });

    toast.promise(fetchPromise, {
      loading: 'Fetching users...',
      success: 'Users fetched successfully!',
      error: err => err.message || 'Failed to fetch users'
    }, { id: 'fetch-users' }).then(data => setUsers(data.users)).catch(() => { });
  }

  function handleLogout() {
    if (confirm("Log out?")) { localStorage.removeItem("user"); navigate("/login"); }
  }

  async function handleToggle(id) {
    try {
      const response = await fetch(`${API_URL}/api/v1/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (response.ok)
        setUsers(l => l.map(u => u._id === id ? { ...u, is_active: !u.is_active } : u));
      else throw new Error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDeleteUser(id, name) {
    if (!confirm(`Are you sure you want to permanently delete user "${name}"? This action cannot be undone.`)) {
      return;
    }
    
    const loadingToast = toast.loading(`Deleting ${name}...`);
    try {
      const response = await fetch(`${API_URL}/api/v1/allusers/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message, { id: loadingToast });
        setUsers(l => l.filter(u => u._id !== id));
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete user", { id: loadingToast });
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name || !form.role || !form.password) { toast.error("Fill all required fields"); return; }
    if (["faculty", "bos", "coordinator"].includes(form.role) && !form.department) {
      toast.error("Department is required for this role"); return;
    }
    setAdding(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/allUsers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form })
      });
      const data = await response.json();
      if (data.status === "Success") {
        toast.success(data.message);
        setUsers(l => [{
          _id: `u${Date.now()}`,
          name: form.name,
          role: form.role,
          department: form.department,
          subject_code: form.subject_code,
          email: form.email,
          is_active: true,
        }, ...l]);
        setForm(BLANK);
        setShowAdd(false);
      }
      else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
    setAdding(false);
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editForm.name) { toast.error("Name cannot be empty"); return; }

    setEditing(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/users/${editForm.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editForm.name, password: editForm.password || undefined, email: editForm.email || undefined })
      });
      const data = await response.json();
      if (data.status === "Success") {
        toast.success(data.message);
        setUsers(l => l.map(u => u._id === editForm.id ? { ...u, name: editForm.name } : u));
        setShowEdit(false);
        setEditForm({ id: "", name: "", password: "", email: "" });
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
    setEditing(false);
  }

  // Filtered users for role view
  const filteredByRole = users
    .filter(u => roleFilter === "all" || u.role === roleFilter)
    .filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.department || "").toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
    );

  // Grouped users for dept view
  const allDepts = [...new Set(users.map(u => u.department || "—"))].sort();
  const deptGroups = allDepts.map(dept => ({
    dept,
    users: users
      .filter(u => (u.department || "—") === dept)
      .filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
      )
  })).filter(g => g.users.length > 0);

  const needsDept = ["faculty", "bos", "coordinator"].includes(form.role);

  // Shared user row component
  const UserRow = ({ u }) => {
    const meta = ROLE_META[u.role] || ROLE_META.faculty;
    return (
      <div className="flex flex-col md:grid md:grid-cols-[2.5fr_1fr_1fr_1fr_130px]
                      gap-3 md:gap-4 items-start md:items-center px-6 py-4
                      bg-white hover:bg-slate-50 transition-all duration-200
                      border-b border-slate-100 last:border-none group">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0
                          text-xs font-extrabold text-white shadow-sm transition-transform group-hover:scale-105"
            style={{ background: u.is_active ? `linear-gradient(135deg, ${meta.color}, ${meta.color}dd)` : "#94a3b8" }}>
            {u.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
          </div>
          <div className="flex flex-col">
            <p className="font-bold text-slate-800 text-sm group-hover:text-rose-600 transition-colors">{u.name}</p>
            {u.subject_code && <p className="text-[11px] text-slate-400 font-mono mt-0.5">{u.subject_code}</p>}
          </div>
        </div>

        <div className="flex items-center">
          <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl capitalize w-fit shadow-sm"
            style={{ background: meta.bg, color: meta.color }}>
            {u.role === "autonomous_coordinator" ? "coordinator" : u.role}
          </span>
        </div>

        <div className="flex items-center text-sm font-semibold text-slate-600">
          {u.department || "—"}
        </div>

        <div className="flex items-center">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl w-fit shadow-sm transition-colors
            ${u.is_active ? "bg-green-50 text-green-600 border border-green-100" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
            {u.is_active ? <><CheckCircle size={12} />Active</> : <><AlertCircle size={12} />Inactive</>}
          </span>
        </div>

        <div className="flex items-center gap-1.5 opacity-100 md:opacity-40 group-hover:opacity-100 transition-opacity">
          <button onClick={() => {
            setEditForm({ id: u._id, name: u.name, password: "", email: u.email || "" });
            setShowEdit(true);
          }}
            title="Edit User"
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all shadow-sm">
            <Edit2 size={13} strokeWidth={2.5} />
          </button>
          <button onClick={() => handleToggle(u._id)}
            title={u.is_active ? "Deactivate" : "Activate"}
            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all shadow-sm
                    ${u.is_active
                ? "bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white"
                : "bg-green-50 text-green-500 hover:bg-green-500 hover:text-white"}`}>
            {u.is_active ? <X size={14} strokeWidth={2.5} /> : <CheckCircle size={14} strokeWidth={2.5} />}
          </button>
          <button onClick={() => handleDeleteUser(u._id, u.name)}
            title="Delete User"
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
            <Trash2 size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  };
  const [selectedDept, setSelectedDept] = useState(null);

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]"
      style={{ fontFamily: "'Figtree','Segoe UI',sans-serif" }}>

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
            <h1 className="font-extrabold text-slate-800 text-base">Manage Users</h1>
            <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-[#0f2744] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#1e3a5f] transition-all hover:-translate-y-0.5 cursor-pointer shadow-md">
            <UserPlus size={14} /> Add New User
          </button>
        </header>

        <main className="flex-1 p-5 md:p-8">
          <div className="mb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-rose-100">
                  <Users size={12} className="text-rose-600" />
                </span>
                <span className="text-[11px] font-extrabold text-rose-500 uppercase tracking-widest">Directory</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">System Users</h2>
              <p className="text-slate-500 text-sm mt-1 max-w-lg">
                Manage all accounts across the institution. You can activate, deactivate, or edit user details.
              </p>
            </div>

            {/* VIEW MODE TOGGLE */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => { setViewMode("role"); setRoleFilter("all"); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer
                  ${viewMode === "role"
                    ? "bg-[#0f2744] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
                <LayoutList size={13} />
                Role View
              </button>
              <button
                onClick={() => { setViewMode("department"); setRoleFilter("all"); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer
                  ${viewMode === "department"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"}`}>
                <Layers size={13} />
                Dept View
              </button>
            </div>
          </div>

          {/* ── ROLE VIEW ── */}
          {viewMode === "role" && (
            <>
              {/* Role filter tabs */}
              <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {["all", ...ROLES].map(r => (
                    <button key={r} onClick={() => setRoleFilter(r)}
                      className={`px-4 py-2 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer uppercase tracking-wider
                              ${roleFilter === r ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700"}`}>
                      {r === "all" ? `All (${users.length})` : `${r} (${users.filter(u => u.role === r).length})`}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm w-full md:w-auto focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-50 transition-all">
                  <Search size={14} className="text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search users…"
                    className="text-sm font-semibold text-slate-700 outline-none bg-transparent w-full md:w-48 placeholder:text-slate-300 placeholder:font-normal" />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="hidden md:grid md:grid-cols-[2.5fr_1fr_1fr_1fr_130px]
                                gap-4 px-6 py-4 bg-slate-50/80 border-b border-slate-100
                                text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  <span>Name</span><span>Role</span><span>Department</span><span>Status</span><span>Actions</span>
                </div>
                {filteredByRole.length === 0 ? (
                  <div className="py-14 text-center text-slate-400">
                    <Users size={38} className="mx-auto mb-3 opacity-20" />
                    <p className="font-semibold text-sm">No users found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {filteredByRole.map(u => <UserRow key={u._id} u={u} />)}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── DEPARTMENT VIEW ── */}
          {viewMode === "department" && (
            <>
              {/* SEARCH */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                  <Search size={14} className="text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users..."
                    className="text-sm outline-none bg-transparent"
                  />
                </div>

                {selectedDept && (
                  <button
                    onClick={() => setSelectedDept(null)}
                    className="text-sm font-semibold text-indigo-600 hover:underline"
                  >
                    ← Back
                  </button>
                )}
              </div>

              {/* 🔥 STEP A — DEPT CARDS */}
              {!selectedDept && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {deptGroups.map(({ dept, users: dUsers }) => {
                    const m = DEPT_META[dept] || DEPT_META["—"];

                    return (
                      <div
                        key={dept}
                        onClick={() => setSelectedDept(dept)}
                        className="cursor-pointer bg-white rounded-2xl border border-slate-200 p-6 
                         shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                            style={{
                              background: `linear-gradient(135deg, ${m.accent}, ${m.color})`,
                            }}
                          >
                            {dept.slice(0, 2)}
                          </div>

                          <span className="text-xs font-bold text-slate-400">
                            {dUsers.length} users
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-2">{dept}</h3>

                        {/* role breakdown */}
                        <div className="flex flex-wrap gap-2">
                          {[...new Set(dUsers.map((u) => u.role))].map((r) => {
                            const rm = ROLE_META[r] || ROLE_META.faculty;
                            return (
                              <span
                                key={r}
                                className="text-[11px] font-bold px-2 py-1 rounded-full"
                                style={{ background: rm.bg, color: rm.color }}
                              >
                                {r} ({dUsers.filter((u) => u.role === r).length})
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 🔥 STEP B — USERS INSIDE SELECTED DEPT */}
              {selectedDept && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-extrabold shadow-inner">
                        {selectedDept.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-lg">{selectedDept} Department</h3>
                        <p className="text-xs font-semibold text-slate-400">{users.filter((u) => (u.department || "—") === selectedDept).length} Users Found</p>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:grid md:grid-cols-[2.5fr_1fr_1fr_1fr_130px]
                        gap-4 px-6 py-4 bg-white border-b border-slate-100
                        text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    <span>Name</span><span>Role</span><span>Department</span><span>Status</span><span>Actions</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {users
                      .filter((u) => (u.department || "—") === selectedDept)
                      .map((u) => (
                        <UserRow key={u._id} u={u} />
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ADD USER MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", animation: "fadeIn .15s ease" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{ animation: "slideUp .2s ease" }}>
            <div className="px-6 pt-6 pb-5 relative" style={{ background: "linear-gradient(135deg,#fef2f2,white)" }}>
              <button onClick={() => setShowAdd(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 cursor-pointer">
                <X size={14} className="text-slate-500" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center mb-3">
                <UserPlus size={22} className="text-rose-600" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">Add New User</h2>
              <p className="text-sm text-slate-400 mt-0.5">Create an account for any role</p>
            </div>

            <form onSubmit={handleAdd} className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input value={form.name} onChange={e => setF("name")(e.target.value)}
                  placeholder="e.g. Dr. Anand Verma"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all placeholder:text-slate-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role *</label>
                  <select value={form.role} onChange={e => setF("role")(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all cursor-pointer capitalize">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                {needsDept && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department *</label>
                    <select value={form.department} onChange={e => setF("department")(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all cursor-pointer">
                      <option value="">Select…</option>
                      {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address (Optional)</label>
                <input type="email" value={form.email} onChange={e => setF("email")(e.target.value)}
                  placeholder="For automated PDF dispatch"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all placeholder:text-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password *</label>
                <input type="password" value={form.password} onChange={e => setF("password")(e.target.value)}
                  placeholder="Set a login password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all placeholder:text-slate-300" />
              </div>
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={adding}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5"
                  style={{ background: adding ? "#94a3b8" : "#dc2626", boxShadow: adding ? "none" : "0 6px 20px #dc262633" }}>
                  {adding ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Adding…</> : <><Send size={14} />Create User</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEdit && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", animation: "fadeIn .15s ease" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{ animation: "slideUp .2s ease" }}>
            <div className="px-6 pt-6 pb-5 relative" style={{ background: "linear-gradient(135deg,#eff6ff,white)" }}>
              <button onClick={() => setShowEdit(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 cursor-pointer">
                <X size={14} className="text-slate-500" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center mb-3">
                <Edit2 size={22} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">Edit User</h2>
              <p className="text-sm text-slate-400 mt-0.5">Update user name or reset password</p>
            </div>

            <form onSubmit={handleEditSubmit} className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input value={editForm.name} onChange={e => setE("name")(e.target.value)}
                  placeholder="e.g. Dr. Anand Verma"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address (Optional)</label>
                <input type="email" value={editForm.email} onChange={e => setE("email")(e.target.value)}
                  placeholder="For automated PDF dispatch"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">New Password (Optional)</label>
                <input type="password" value={editForm.password} onChange={e => setE("password")(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300" />
              </div>
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setShowEdit(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={editing}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5"
                  style={{ background: editing ? "#94a3b8" : "#2563eb", boxShadow: editing ? "none" : "0 6px 20px #2563eb33" }}>
                  {editing ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : <><Send size={14} />Save Changes</>}
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