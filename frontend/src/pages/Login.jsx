// pages/shared/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, Shield, GraduationCap,
  BookOpen, Users, Lock, ChevronRight,
  AlertCircle, Loader
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const BIT_CAMPUS = "/BIT1.png"
const ROLES = [
  { id:"faculty",     label:"Faculty",     icon:GraduationCap, color:"#2563eb", bg:"#eff6ff", ring:"#bfdbfe", fields:["name","department","password"], redirect:"/faculty/dashboard"     },
  { id:"bos",         label:"BOS",         icon:BookOpen,      color:"#7c3aed", bg:"#f5f3ff", ring:"#ddd6fe", fields:["name","department","password"], redirect:"/bos/dashboard"         },
  { id:"coordinator", label:"Coordinator", icon:Users,         color:"#0f766e", bg:"#f0fdfa", ring:"#99f6e4", fields:["name","department","password"], redirect:"/coordinator/dashboard" },
  { id:"dean",        label:"Dean",        icon:Shield,        color:"#b45309", bg:"#fffbeb", ring:"#fde68a", fields:["name","password"],              redirect:"/dean/dashboard"        },
  { id:"admin",       label:"Admin",       icon:Lock,          color:"#374151", bg:"#f9fafb", ring:"#d1d5db", fields:["email","password"],             redirect:"/admin/dashboard"       },
];

const DEPARTMENTS = [
  "CSE","CSE(IOT)","CS(DS)","ISE","ECE",
  "EEE","EIE","ETE","VLSI","ME","CIVIL","RAI",
];

const FIELD_META = {
  name:       { label:"Full Name",     placeholder:"Enter your full name",  type:"text",     icon:"👤" },
  email:      { label:"Email Address", placeholder:"admin@college.edu",     type:"email",    icon:"✉️"  },
  department: { label:"Department",    placeholder:"",                       type:"select",   icon:"🏛️" },
  password:   { label:"Password",      placeholder:"Enter your password",   type:"password", icon:"🔒" },
};

export default function Login() {
  const navigate       = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [form,         setForm]         = useState({});
  const [showPwd,      setShowPwd]      = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  const role = ROLES.find(r => r.id === selectedRole);

  function pickRole(r) { setSelectedRole(r.id); setForm({}); setError(""); }
  function set(key, val) { setForm(f => ({ ...f, [key]: val })); setError(""); }

  async function handleLogin(e) {
    e.preventDefault();
    if (!role) return;
    for (const f of role.fields) {
      if (!form[f]?.trim()) { setError(`${FIELD_META[f].label} is required`); return; }
    }
    setLoading(true); setError("");
    try {
      // console.log(form,selectedRole)
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ ...form, role: selectedRole }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.message); return; }
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(role.redirect);
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily:"'Figtree','Segoe UI',sans-serif" }}>

      {/* ── LEFT PANEL — Campus photo ──────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[46%] relative overflow-hidden"
        style={{
          backgroundImage: `url(${BIT_CAMPUS})`,
          backgroundSize:  "cover",
          backgroundPosition: "center 30%",
        }}
      >
        {/* Dark gradient overlay — heavy at top/bottom, lighter in middle so building shows */}
        <div className="absolute inset-0"
             style={{
               background: "linear-gradient(180deg, rgba(10,22,44,0.88) 0%, rgba(10,22,44,0.45) 40%, rgba(10,22,44,0.55) 70%, rgba(10,22,44,0.92) 100%)",
             }} />

        {/* Subtle vignette on sides */}
        <div className="absolute inset-0"
             style={{ background:"linear-gradient(90deg,rgba(10,22,44,0.4) 0%,transparent 30%,transparent 70%,rgba(10,22,44,0.3) 100%)" }} />

        {/* Top — College branding */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25
                            flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <p className="text-white font-extrabold text-base leading-tight">
                Bangalore Institute
              </p>
              <p className="text-white font-extrabold text-base leading-tight">
                of Technology
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20
                          backdrop-blur-sm rounded-full px-3.5 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/90 text-xs font-semibold">
              An Autonomous Institution Under VTU
            </span>
          </div>
        </div>

        {/* Centre — Floating stats card over the campus image */}
        {/* <div className="relative z-10 px-10 mt-60">
          <div className="bg-white/10 border border-white/20 backdrop-blur-md
                          rounded-3xl p-6 mb-6">
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">
              Syllabus Portal
            </p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { num:"5",   label:"Roles"         },
                { num:"6+",  label:"Departments"   },
                { num:"100%",label:"Digital"       },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-white text-2xl font-extrabold leading-none">{s.num}</p>
                  <p className="text-white/50 text-[10px] font-semibold mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="h-px bg-white/10 mb-4 " />
            <div className="flex flex-col gap-2.5">
              {[
                { icon:"📋", text:"Manage syllabus generation end-to-end"            },
                { icon:"👥", text:"Role-based access for all stakeholders"           },
                { icon:"✅", text:"Review, approve and download syllabi as PDF"       },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="text-base flex-shrink-0">{icon}</span>
                  <p className="text-white/80 text-xs font-medium leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div> */}

        {/* Bottom — Photo credit strip */}
        <div className="relative z-10 px-10 pb-8">
          <div className="flex items-center justify-between">
            <p className="text-white/30 text-[11px] font-medium">
              © 2025 BIT Syllabus Management System
            </p>
            {/* Small label showing it's the actual campus */}
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/15
                            rounded-full px-2.5 py-1 backdrop-blur-sm">
              <span className="text-[9px] text-white/60 font-bold">📍 BIT Campus, Bengaluru</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Login form ───────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center
                      bg-[#f4f6fb] p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Bangalore Institute of Technology
            </p>
            <h2 className="text-xl font-extrabold text-[#0f2744] mt-1">Syllabus Portal</h2>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

            <div className="px-8 pt-8 pb-6"
                 style={{
                   background: role
                     ? `linear-gradient(135deg,${role.bg},white)`
                     : "linear-gradient(135deg,#f8fafc,white)",
                 }}>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-1">
                {role ? `${role.label} Login` : "Welcome Back"}
              </h2>
              <p className="text-sm text-slate-400">
                {role ? `Sign in to access the ${role.label} portal` : "Select your role to continue"}
              </p>
            </div>

            <div className="px-8 pb-8">

              {/* Role selector */}
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  I am a…
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {ROLES.map(r => {
                    const Icon   = r.icon;
                    const active = selectedRole === r.id;
                    return (
                      <button key={r.id} type="button" onClick={() => pickRole(r)}
                              className="flex flex-col items-center gap-1.5 py-3 px-1
                                         rounded-2xl border-2 transition-all duration-200
                                         cursor-pointer hover:-translate-y-0.5"
                              style={{
                                background:  active ? r.bg    : "#f8fafc",
                                borderColor: active ? r.color : "#e2e8f0",
                                boxShadow:   active ? `0 4px 14px ${r.color}22` : "none",
                              }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                             style={{ background: active ? `${r.color}20` : "#f1f5f9" }}>
                          <Icon size={16} style={{ color: active ? r.color : "#94a3b8" }} strokeWidth={2} />
                        </div>
                        <span className="text-[10px] font-bold text-center leading-tight"
                              style={{ color: active ? r.color : "#94a3b8" }}>
                          {r.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic form */}
              {role && (
                <form onSubmit={handleLogin} className="flex flex-col gap-4"
                      style={{ animation:"slideIn .2s ease" }}>
                  <div className="h-px bg-slate-100 mb-1" />

                  {role.fields.map(fieldKey => {
                    const meta = FIELD_META[fieldKey];

                    if (meta.type === "select") {
                      return (
                        <div key={fieldKey}>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            {meta.icon} {meta.label}
                          </label>
                          <select value={form[fieldKey] || ""} onChange={e => set(fieldKey, e.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50
                                             px-4 py-2.5 text-sm text-slate-800 outline-none
                                             focus:border-blue-400 focus:ring-2 focus:ring-blue-50
                                             focus:bg-white transition-all cursor-pointer">
                            <option value="">Select department…</option>
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      );
                    }

                    if (meta.type === "password") {
                      return (
                        <div key={fieldKey}>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            {meta.icon} {meta.label}
                          </label>
                          <div className="relative">
                            <input type={showPwd ? "text" : "password"}
                                   value={form[fieldKey] || ""}
                                   onChange={e => set(fieldKey, e.target.value)}
                                   placeholder={meta.placeholder}
                                   className="w-full rounded-xl border border-slate-200 bg-slate-50
                                              px-4 py-2.5 pr-11 text-sm text-slate-800 outline-none
                                              focus:border-blue-400 focus:ring-2 focus:ring-blue-50
                                              focus:bg-white transition-all placeholder:text-slate-300" />
                            <button type="button" onClick={() => setShowPwd(v => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2
                                               text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={fieldKey}>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          {meta.icon} {meta.label}
                        </label>
                        <input type={meta.type} value={form[fieldKey] || ""}
                               onChange={e => set(fieldKey, e.target.value)}
                               placeholder={meta.placeholder}
                               className="w-full rounded-xl border border-slate-200 bg-slate-50
                                          px-4 py-2.5 text-sm text-slate-800 outline-none
                                          focus:border-blue-400 focus:ring-2 focus:ring-blue-50
                                          focus:bg-white transition-all placeholder:text-slate-300" />
                      </div>
                    );
                  })}

                  {error && (
                    <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                      <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                          className="w-full flex items-center justify-center gap-2.5
                                     py-3 rounded-xl text-sm font-bold text-white
                                     transition-all hover:-translate-y-0.5 active:scale-95 mt-1"
                          style={{
                            background:  loading ? "#94a3b8" : `linear-gradient(135deg,${role.color},${role.color}cc)`,
                            cursor:      loading ? "not-allowed" : "pointer",
                            boxShadow:   loading ? "none" : `0 6px 20px ${role.color}33`,
                          }}>
                    {loading
                      ? <><Loader size={16} className="animate-spin" />Verifying…</>
                      : <>Sign In <ChevronRight size={16} /></>
                    }
                  </button>
                </form>
              )}

              {!role && (
                <div className="text-center py-6 text-slate-400">
                  <div className="text-3xl mb-2">☝️</div>
                  <p className="text-sm font-medium">Pick your role above to see the login form</p>
                </div>
              )}
            </div>
          </div>

          {/* <p className="text-center text-xs text-slate-400 mt-5">
            Just browsing?{" "}
            <button onClick={() => navigate("/")}
                    className="text-blue-600 font-semibold hover:underline cursor-pointer">
              Continue as Guest →
            </button>
          </p> */}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}