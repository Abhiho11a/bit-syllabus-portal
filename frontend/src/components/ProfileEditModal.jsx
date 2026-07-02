import React, { useState } from "react";
import { X, Save, User as UserIcon, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProfileEditModal({ user, onClose }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/users/${user.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      
      const updatedUser = { ...user, ...data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile updated successfully");
      onClose();
      window.location.reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
         style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", animation: "fadeIn .2s ease" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
           style={{ animation: "slideUp .2s ease" }}>
        
        <div className="px-6 pt-6 pb-4 relative" style={{ background: "linear-gradient(135deg, #f0f9ff, white)" }}>
          <button onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 cursor-pointer">
            <X size={14} className="text-slate-500" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center mb-3">
            <UserIcon size={20} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">Edit Profile</h2>
          <p className="text-xs text-slate-500 mt-0.5">Update your personal details</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
            <div className="relative">
              <UserIcon size={14} className="absolute left-3 top-3 text-slate-400" />
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                     className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" required />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                     placeholder="Used for PDF dispatch"
                     className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">New Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                     placeholder="Leave blank to keep current"
                     className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300" />
            </div>
          </div>

          <button type="submit" disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-blue-700 transition-all cursor-pointer shadow-md shadow-blue-600/20 disabled:opacity-50">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
