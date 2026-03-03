import { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { renderAsync } from "docx-preview";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { DOMParser, XMLSerializer } from "xmldom";
import { X, Upload, Trash2, Merge, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MergeFilesModal() {
  const [files,            setFiles]           = useState([]);
  const [mergeWithPageNos, setMergeWithPageNos] = useState(false);
  const [merging,          setMerging]          = useState(false);
  const [progress,         setProgress]         = useState("");
  const user     = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate()

  function onClose(){
    navigate(`/${user.role}/dashboard`)
  }

  function handleFileSelect(e) {
    setFiles(prev => [...prev, ...Array.from(e.target.files)]);
  }

  function removeFile(index) {
    setFiles(files.filter((_, i) => i !== index));
  }

  function getFileIcon(name) {
    if (name.endsWith(".pdf"))  return "📄";
    if (name.endsWith(".docx")) return "📝";
    return "📁";
  }

  // ── PDF MERGE ───────────────────────────────────────────────
  async function mergePDFs(pdfFiles) {
    const mergedPdf = await PDFDocument.create();
    for (const file of pdfFiles) {
      const bytes = await file.arrayBuffer();
      const pdf   = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }
    if (mergeWithPageNos) {
      const pages = mergedPdf.getPages();
      pages.forEach((page, i) => {
        const { width } = page.getSize();
        page.drawRectangle({ x: width-90, y:10, width:80, height:20, color: rgb(1,1,1) });
        page.drawText(`${i+1} / ${pages.length}`, { x: width-50, y:10, size:10, color: rgb(0,0,0) });
      });
    }
    const blob = new Blob([await mergedPdf.save()], { type:"application/pdf" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `merged_${new Date().toLocaleDateString()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── DOCX → PDF ─────────────────────────────────────────────
  async function convertDOCXtoPDF(docxFile) {
    return new Promise(async (resolve) => {
      const buf     = await docxFile.arrayBuffer();
      const wrapper = document.createElement("div");
      Object.assign(wrapper.style, {
        position:"fixed", top:"-99999px", left:"-99999px",
        width:"900px", background:"#ffffff",
      });
      wrapper.className = "docx-wrapper";
      document.body.appendChild(wrapper);
      await renderAsync(buf, wrapper);

      const pdf    = new jsPDF("p", "pt", "a4");
      const pdfW   = pdf.internal.pageSize.getWidth();
      const pages  = wrapper.querySelectorAll("section.docx");

      for (let i = 0; i < pages.length; i++) {
        const img = await htmlToImage.toPng(pages[i], { backgroundColor:"#ffffff", pixelRatio:2 });
        const p   = await pdf.getImageProperties(img);
        if (i !== 0) pdf.addPage();
        pdf.addImage(img, "PNG", 0, 0, pdfW, (p.height * pdfW) / p.width);
      }
      document.body.removeChild(wrapper);
      resolve(new File([pdf.output("blob")], docxFile.name.replace(".docx", ".pdf"), { type:"application/pdf" }));
    });
  }

  // ── DOCX MERGE ─────────────────────────────────────────────
  async function mergeDOCX(docxFiles) {
    const zipMain = new JSZip();
    await zipMain.loadAsync(await docxFiles[0].arrayBuffer());
    let mainXML = await zipMain.file("word/document.xml").async("string");

    for (let i = 1; i < docxFiles.length; i++) {
      const zipNext = new JSZip();
      await zipNext.loadAsync(await docxFiles[i].arrayBuffer());
      let xml2 = await zipNext.file("word/document.xml").async("string");

      const parser = new DOMParser();
      const xMain  = parser.parseFromString(mainXML, "text/xml");
      const xNext  = parser.parseFromString(xml2,    "text/xml");
      const bMain  = xMain.getElementsByTagName("w:body")[0];
      const bNext  = xNext.getElementsByTagName("w:body")[0];
      while (bNext.firstChild) bMain.appendChild(bNext.firstChild);
      mainXML = new XMLSerializer().serializeToString(xMain);
    }
    zipMain.file("word/document.xml", mainXML);
    const blob = await zipMain.generateAsync({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    return new File([blob], "Merged_File.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  }

  // ── MAIN HANDLER ───────────────────────────────────────────
  async function handleMerge() {
    const pdfFiles  = files.filter(f => f.name.endsWith(".pdf"));
    const docxFiles = files.filter(f => f.name.endsWith(".docx"));

    // DOCX-only path
    if (pdfFiles.length === 0) {
      if (docxFiles.length < 2) { alert("Add at least 2 DOCX files to merge!"); return; }
      setMerging(true);
      setProgress("Merging DOCX files…");
      const merged = await mergeDOCX(docxFiles);
      const url    = URL.createObjectURL(merged);
      const a      = document.createElement("a");
      a.href = url; a.download = `merged_${new Date().toLocaleDateString()}.docx`; a.click();
      URL.revokeObjectURL(url);
      setMerging(false);
      onClose();
      return;
    }

    if (files.length < 2) { alert("Add at least 2 files to merge!"); return; }

    setMerging(true);
    const converted = [];
    for (let i = 0; i < docxFiles.length; i++) {
      setProgress(`Converting ${docxFiles[i].name} (${i+1}/${docxFiles.length})…`);
      converted.push(await convertDOCXtoPDF(docxFiles[i]));
    }
    setProgress("Merging PDFs…");
    await mergePDFs([...pdfFiles, ...converted]);
    setMerging(false);
    onClose();
  }

  const pdfCount  = files.filter(f => f.name.endsWith(".pdf")).length;
  const docxCount = files.filter(f => f.name.endsWith(".docx")).length;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"
         style={{ background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)", animation:"fadeIn .15s ease" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[634px]"
           style={{ animation:"slideUp .2s ease" }}>

        {/* ── HEADER ── */}
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 relative"
             style={{ background:"linear-gradient(135deg,#f8fafc,white)" }}>
          <button onClick={() => { setMergeWithPageNos(false); onClose(); }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100
                             flex items-center justify-center hover:bg-slate-200 cursor-pointer
                             transition-colors">
            <X size={14} className="text-slate-500" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200
                          flex items-center justify-center mb-3">
            <Merge size={22} className="text-slate-600" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">Merge Files</h2>
          <p className="text-sm text-slate-400 mt-0.5">Combine PDF and DOCX files into one document</p>

          {/* File count badges */}
          {files.length > 0 && (
            <div className="flex gap-2 mt-3">
              {pdfCount  > 0 && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border
                                 bg-slate-100 text-slate-600 border-slate-200">
                  {pdfCount} PDF
                </span>
              )}
              {docxCount > 0 && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border
                                 bg-blue-50 text-blue-700 border-blue-200">
                  {docxCount} DOCX
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── BODY ── */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Page numbers toggle */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200
                          rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-bold text-slate-700">Add Page Numbers</p>
              <p className="text-xs text-slate-400">Print page numbers at the bottom of each page</p>
            </div>
            <button type="button" onClick={() => setMergeWithPageNos(p => !p)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full
                               transition-colors duration-300 cursor-pointer flex-shrink-0
                               ${mergeWithPageNos ? "bg-[#0f2744]" : "bg-slate-300"}`}>
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow
                               transition-transform duration-300
                               ${mergeWithPageNos ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          {/* Upload drop zone */}
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center
                          hover:border-slate-300 hover:bg-slate-50 transition-colors">
            <input type="file" id="mergeFileInput" className="hidden"
                   multiple accept=".pdf,.docx" onChange={handleFileSelect} />
            <label htmlFor="mergeFileInput" className="cursor-pointer block">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200
                              mx-auto flex items-center justify-center mb-3">
                <Upload size={20} className="text-slate-500" />
              </div>
              <p className="text-sm font-bold text-slate-700">Click to upload files</p>
              <p className="text-xs text-slate-400 mt-1">Supports .pdf and .docx</p>
            </label>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="max-h-25 overflow-y-auto space-y-2 pr-1">
              {files.map((file, i) => (
                <div key={i}
                     className="flex items-center gap-3 bg-slate-50 border border-slate-200
                                rounded-xl px-4 py-2.5">
                  <span className="text-base flex-shrink-0">{getFileIcon(file.name)}</span>
                  <span className="text-sm text-slate-700 font-semibold flex-1 truncate">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                  <button onClick={() => removeFile(i)}
                          className="w-6 h-6 rounded-lg bg-red-50 border border-red-100
                                     flex items-center justify-center text-red-400
                                     hover:bg-red-100 transition-colors cursor-pointer flex-shrink-0">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Progress indicator */}
          {merging && progress && (
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200
                            rounded-xl px-4 py-3">
              <Loader2 size={14} className="text-slate-500 animate-spin flex-shrink-0" />
              <p className="text-xs font-semibold text-slate-600">{progress}</p>
            </div>
          )}

          {/* Mixed files warning */}
          {pdfCount > 0 && docxCount > 0 && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200
                            rounded-xl px-4 py-3">
              <AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 font-semibold">
                DOCX files will be converted to PDF before merging
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} disabled={merging}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold
                               text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer
                               disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>
            <button onClick={handleMerge} disabled={merging || files.length < 2}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white
                               flex items-center justify-center gap-2 transition-all cursor-pointer
                               bg-[#0f2744] hover:bg-[#1e3a5f]
                               disabled:opacity-50 disabled:cursor-not-allowed">
              {merging
                ? <><Loader2 size={14} className="animate-spin" />Processing…</>
                : <><Merge size={14} />Merge Files</>
              }
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>
    </div>
  );
}