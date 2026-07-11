import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Users, GraduationCap,
  LogOut, User, Menu, X, Shield, FileCheck2,
  Upload, Download, FilePlus2, CheckCircle2
} from "lucide-react";
import { PDFDocument, rgb } from "pdf-lib";
import barcodeImg from "../../assets/barcode.jpeg";
import toast from "react-hot-toast";
import ProfileEditModal from "../../components/ProfileEditModal";

const API_URL = import.meta.env.VITE_API_URL;

const NAV_LINKS = [
  { label:"Dashboard",   path:"/dean/dashboard",      icon: LayoutDashboard },
  { label:"Syllabi",     path:"/dean/syllabi",        icon: FileText        },
  { label:"Manual Approve", path:"/dean/manual-approve", icon: FileCheck2 },
  { label:"Manage BOS",  path:"/dean/manage-bos",     icon: Users           },
  { label:"Faculty",     path:"/dean/faculty",        icon: GraduationCap   },
];

async function loadBarcodeBytes(src) {
  const response = await fetch(src);
  const blob     = await response.blob();
  return new Uint8Array(await blob.arrayBuffer());
}

export default function DeanManualApprove() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const [barcodeUrl, setBarcodeUrl] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/v1/settings/barcode_url`)
      .then(res => res.json())
      .then(data => { if (data && data.value) setBarcodeUrl(data.value); })
      .catch(console.error);
  }, []);

  function handleLogout() {
    if (confirm("Log out?")) { localStorage.removeItem("user"); navigate("/login"); }
  }

  function onFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setSelectedFile(file);
      } else {
        toast.error("Please upload a PDF file.");
      }
    }
  }

  async function handleApproveAndDownload() {
    if (!selectedFile) return;
    setProcessing(true);
    try {
      const fileBytes = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      if (!barcodeUrl) {
        toast.error("Please configure the barcode image in Settings first!");
        setProcessing(false);
        return;
      }
      const barcodeBytes = await loadBarcodeBytes(barcodeUrl);
      const barcodeImage = await pdfDoc.embedJpg(barcodeBytes);

      const formatted = new Date().toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });

      pages.forEach((page, i) => {
        const { width } = page.getSize();
        page.drawRectangle({
          x: 0,
          y: 0,
          width: width,
          height: 30,
          color: rgb(1, 1, 1)
        });

        let textX = 20;
        if (barcodeImage) {
          page.drawImage(barcodeImage, {
            x: 30,
            y: 5,
            width: 60,
            height: 20,
          });
          textX = 90;
        }

        page.drawText(`Generated on: ${formatted}`, {
          x: textX,
          y: 10,
          size: 9,
          color: rgb(0, 0, 0),
        });

        page.drawText(`${i + 1} / ${pages.length}`, {
          x: width - 60,
          y: 10,
          size: 10,
          color: rgb(0, 0, 0),
        });
      });

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Approved_${selectedFile.name}`;
      a.click();
      URL.revokeObjectURL(url);
      
      // Log manual approval to analytics
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userObj = JSON.parse(userStr);
          await fetch(`${import.meta.env.VITE_API_URL}/api/v1/stats/log`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: userObj.id || userObj._id,
              user_name: userObj.name,
              role: userObj.role,
              action: "MANUAL_APPROVE",
              details: `Approved ${selectedFile.name}`
            }),
          });
        }
      } catch (logErr) {
        console.error("Failed to log approval", logErr);
      }
      
      // Clear selection after successful download
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("PDF modified and downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to modify PDF. Please ensure it is a valid PDF file.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]" style={{ fontFamily:"'Figtree','Segoe UI',sans-serif" }}>
      {/* ── SIDEBAR ──────────────────────────────────────────────── */}
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
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left
                                 ${active ? "bg-white/15 text-white" : "text-amber-200 hover:bg-white/8 hover:text-white"}`}>
                <Icon size={16} strokeWidth={2} />{label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 bg-white/8 rounded-xl px-3 py-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-amber-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || "Dean"}</p>
              <p className="text-[10px] text-amber-300 truncate">Dean of Studies</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
            <LogOut size={15} /> Log Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── MAIN ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm flex items-center gap-4 px-5 py-3.5">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-xl hover:bg-slate-100 cursor-pointer">
            <Menu size={19} className="text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="font-extrabold text-slate-800 text-base">Manual Approve</h1>
            <p className="text-xs text-slate-400 hidden md:block">Bangalore Institute of Technology</p>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
            <Shield size={13} className="text-amber-600" />
            <span className="text-xs font-bold text-amber-700">Dean</span>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">
          <div className="w-full max-w-2xl mx-auto mt-4 md:mt-10">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="p-8 md:p-10 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #fffbeb, #ffffff)" }}>
                <div className="w-16 h-16 bg-amber-100 rounded-2xl mx-auto flex items-center justify-center mb-5 border border-amber-200">
                  <FileCheck2 size={32} className="text-amber-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-2">Manually Approve Syllabus</h2>
                <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto">
                  Upload a PDF document. This tool will embed the official barcode, date stamp, and page numbers, and allow you to download the finalized copy.
                </p>
              </div>

              <div className="p-8 md:p-10 border-t border-slate-100 bg-white">
                <input 
                  type="file" 
                  accept=".pdf" 
                  ref={fileInputRef}
                  onChange={onFileChange}
                  className="hidden" 
                  id="pdf-upload" 
                />
                
                <label 
                  htmlFor="pdf-upload"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop} 
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                    selectedFile ? "border-amber-500 bg-amber-50" : "border-slate-300 hover:border-amber-400 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {selectedFile ? (
                      <>
                        <FilePlus2 className="w-10 h-10 mb-3 text-amber-500" />
                        <p className="mb-2 text-sm font-semibold text-amber-700">{selectedFile.name}</p>
                        <p className="text-xs text-amber-600/70">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mb-3 text-slate-400" />
                        <p className="mb-2 text-sm font-semibold text-slate-600"><span className="text-amber-600 font-bold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-slate-400">PDF files only (Max 20MB)</p>
                      </>
                    )}
                  </div>
                </label>

                {selectedFile && (
                  <div className="mt-8 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button 
                      onClick={handleApproveAndDownload}
                      disabled={!selectedFile || processing}
                      className="flex items-center gap-2 px-8 py-3.5 bg-amber-500 text-white font-bold rounded-xl text-sm md:text-base transition-all hover:bg-amber-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                    >
                      {processing ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download size={18} />
                          Approve & Download PDF
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex items-center justify-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                <p className="text-xs text-slate-500 font-semibold">Processed files are not saved to the server. They are downloaded directly to your device.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
