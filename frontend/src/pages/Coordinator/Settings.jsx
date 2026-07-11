// pages/coordinator/Settings.jsx

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LayoutDashboard, FileText, Plus,
  LogOut, User, Menu, X, Settings as SettingsIcon,
  Image as ImageIcon, UploadCloud, Link as LinkIcon, GitMerge, FileCheck2,
} from "lucide-react";
import ProfileEditModal from "../../components/ProfileEditModal";

const API_URL = import.meta.env.VITE_API_URL;

const NAV_LINKS = [
  { label:"Dashboard", path:"/coordinator/dashboard", icon: LayoutDashboard },
  { label:"Assign",    path:"/coordinator/assign",    icon: Plus },
  { label:"Syllabi",   path:"/coordinator/syllabi",   icon: FileText },
  { label:"Merge Files", path:"/mergefiles",          icon: GitMerge },
  { label:"Manual Approve", path:"/coordinator/manual-approve", icon: FileCheck2 },
  { label:"Settings",  path:"/coordinator/settings",  icon: SettingsIcon },
];

export default function CoordinatorSettings() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user"));

  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [barcodeUrl, setBarcodeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch current setting on mount
  useEffect(() => {
    fetch(`${API_URL}/api/v1/settings/barcode_url`)
      .then(res => res.json())
      .then(data => {
        if (data && data.value) {
          setBarcodeUrl(data.value);
        }
      })
      .catch(err => console.error("Failed to fetch barcode_url:", err));
  }, []);

  function handleLogout() {
    if (confirm("Log out?")) { localStorage.removeItem("user"); navigate("/login"); }
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    setLoading(true);
    const uploadToast = toast.loading("Uploading barcode image...");

    try {
      // 1. Upload to Cloudinary using Unsigned upload
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "v1conote"); // Using existing preset
      fd.append("folder", "barcodes");

      const cloudRes = await fetch(import.meta.env.VITE_CLOUDINARY_UPLOAD_URL || "https://api.cloudinary.com/v1_1/dxsgtzp7i/image/upload", {
        method: "POST",
        body: fd
      });
      const cloudData = await cloudRes.json();

      if (!cloudData.secure_url) {
        throw new Error("Cloudinary upload failed");
      }

      const newUrl = cloudData.secure_url;

      // 2. Save URL to backend settings
      const dbRes = await fetch(`${API_URL}/api/v1/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "barcode_url", value: newUrl })
      });
      
      if (!dbRes.ok) {
        throw new Error("Failed to save URL to database");
      }

      setBarcodeUrl(newUrl);
      toast.success("Barcode updated successfully!", { id: uploadToast });

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong.", { id: uploadToast });
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

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
            <SettingsIcon size={17} className="text-teal-300" />
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
          <div onClick={() => setShowProfileModal(true)}
               className="flex items-center gap-3 bg-white/8 hover:bg-white/15 rounded-xl px-3 py-2.5 mb-2 cursor-pointer transition-colors"
               title="Edit Profile">
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
            <h1 className="font-extrabold text-slate-800 text-base">Portal Settings</h1>
            <p className="text-xs text-slate-400 hidden md:block">Manage global configurations</p>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 flex items-start justify-center">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
               style={{ animation:"slideUp .2s ease" }}>

            <div className="px-7 pt-7 pb-5 bg-gradient-to-br from-slate-50 to-white">
              <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                <ImageIcon size={22} className="text-teal-600" />
                Barcode Image Setup
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Upload the barcode image that will be automatically embedded into the generated PDF syllabus.
              </p>
            </div>

            <div className="px-7 py-6 flex flex-col gap-6">
              
              {/* CURRENT BARCODE PREVIEW */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Current Barcode
                </label>
                {barcodeUrl ? (
                  <div className="flex flex-col items-start gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <img src={barcodeUrl} alt="Barcode preview" className="max-h-32 object-contain" />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg break-all">
                      <LinkIcon size={12} />
                      {barcodeUrl}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon size={30} className="mb-2 opacity-50" />
                    <p className="text-sm font-medium">No barcode uploaded yet.</p>
                  </div>
                )}
              </div>

              <hr className="border-slate-100" />

              {/* UPLOAD NEW BARCODE */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Upload New Barcode
                </label>
                
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange} 
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed 
                             ${loading ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" : "border-teal-200 bg-teal-50/50 text-teal-600 hover:bg-teal-50 cursor-pointer transition-colors"}`}
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" /> Uploading...</>
                  ) : (
                    <><UploadCloud size={20} /> Click to browse image file</>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 mt-2 text-center">
                  Recommended format: PNG or JPEG.
                </p>
              </div>

            </div>

          </div>
        </main>
      </div>

      {showProfileModal && (
        <ProfileEditModal user={user} onClose={() => setShowProfileModal(false)} />
      )}

      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
