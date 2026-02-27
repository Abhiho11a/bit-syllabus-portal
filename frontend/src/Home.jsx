// pages/shared/HomePage.jsx
// Main landing home page with sidebar + login button
// Matches existing BIT design: dark navy sidebar, white content area

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
import {
  ChevronRight, ChevronLeft, ChevronDown,
  Menu, X, Download, Link2,
  BookOpen, LogIn, Eye, GraduationCap,
  Search, FileText
} from "lucide-react";

// ── Config (same as your existing appConfig) ─────────────────────
const PROGRAM_STRUCTURE = {
  "BE/BTECH": {
    label: "BE/BTECH",
    departments: ["CSE","CSE(IOT)","CS(DS)","ISE","ECE","EEE","EIE","ETE","VLSI","ME","CIVIL","RAI"],
  },
  "MCA": { label: "MCA", departments: ["MCA"] },
  "MBA": { label: "MBA", departments: ["MBA"] },
  "MTECH": {
    label: "MTECH",
    departments: ["M.Tech CSE","M.Tech ECE","M.Tech ME"],
  },
};

// ── Mock courses — replace with api.getCourses(department) ───────
const MOCK_COURSES = [
  { id:1, sem:3, course_title:"Mathematics-III for CS",        course_code:"BCS300", credits:3, course_type:"PCC (T)" },
  { id:2, sem:3, course_title:"Operating Systems",             course_code:"BCS303", credits:4, course_type:"IPCC (T+L)" },
  { id:3, sem:4, course_title:"Design & Analysis of Algorithms", course_code:"BCS401", credits:3, course_type:"PCC (T)" },
  { id:4, sem:4, course_title:"Microcontrollers",              course_code:"BCS402", credits:4, course_type:"IPCC (T+L)" },
  { id:5, sem:5, course_title:"Machine Learning",              course_code:"BCS501", credits:3, course_type:"PCC (T)" },
  { id:6, sem:5, course_title:"Computer Networks",             course_code:"BCS502", credits:3, course_type:"PCC (T)" },
  { id:7, sem:6, course_title:"Compiler Design",               course_code:"BCS601", credits:3, course_type:"PCC (T)" },
  { id:8, sem:6, course_title:"Big Data Analytics",            course_code:"BCS602", credits:3, course_type:"OE (T)" },
];

const DEPT_NAMES = {
  CSE:"Computer Science and Engineering",
  "CSE(IOT)":"Computer Science (IoT)",
  "CS(DS)":"Computer Science (Data Science)",
  ISE:"Information Science and Engineering",
  ECE:"Electronics and Communication Engineering",
  EEE:"Electrical and Electronics Engineering",
  EIE:"Electronics and Instrumentation Engineering",
  ETE:"Electronics and Telecommunication Engineering",
  VLSI:"VLSI Design and Embedded Systems",
  ME:"Mechanical Engineering",
  CIVIL:"Civil Engineering",
  RAI:"Robotics and AI",
  MCA:"Master of Computer Applications",
  MBA:"Master of Business Administration",
  "M.Tech CSE":"M.Tech - Computer Science",
  "M.Tech ECE":"M.Tech - Electronics",
  "M.Tech ME":"M.Tech - Mechanical",
};

export default function Home() {
  const navigate          = useNavigate();
//   const { user, role, logout } = useAuth();
const user =""
  const scrollRef          = useRef(null);

  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [program, setProgram]           = useState("BE/BTECH");
  const [expandedProg, setExpanded]     = useState("BE/BTECH");
  const [department, setDepartment]     = useState("CSE");
  const [search, setSearch]             = useState("");

  const courses  = MOCK_COURSES; // replace: await api.getCourses(department)
  const deptName = DEPT_NAMES[department] || department;
  const depts    = PROGRAM_STRUCTURE[program].departments;

  const filtered = courses.filter(c =>
    c.course_title.toLowerCase().includes(search.toLowerCase()) ||
    c.course_code.toLowerCase().includes(search.toLowerCase())
  );

  function handleProgram(prog) {
    setProgram(prog);
    setExpanded(prog);
    setDepartment(PROGRAM_STRUCTURE[prog].departments[0]);
  }

  const scrollLeft  = () => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () => scrollRef.current?.scrollBy({ left:  200, behavior: "smooth" });

  const isLoggedIn = !!user;

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]"
         style={{ fontFamily: "'Figtree','Segoe UI',sans-serif" }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0f2744] text-white
                   transition-all duration-300 ease-in-out
                   ${sidebarOpen ? "w-64" : "w-0 md:w-64"} overflow-hidden flex-shrink-0`}
      >
        {/* Top — close btn mobile */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="text-sm font-extrabold tracking-wide text-white">Programs</span>
          <button onClick={() => setSidebarOpen(false)}
                  className="md:hidden text-white/50 hover:text-white cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Program list */}
        <nav className="flex-1 overflow-y-auto py-2">
          {Object.entries(PROGRAM_STRUCTURE).map(([key, prog]) => {
            const isExpanded = expandedProg === key;
            const hasSubs    = prog.departments.length > 1;
            return (
              <div key={key}>
                <button
                  onClick={() => handleProgram(key)}
                  className={`w-full flex items-center justify-between px-5 py-3.5
                             text-sm font-semibold transition-all cursor-pointer
                             ${program === key
                               ? "bg-white/15 text-white"
                               : "text-slate-300 hover:bg-white/8 hover:text-white"}`}
                >
                  <span>{prog.label}</span>
                  {hasSubs && (
                    <ChevronRight
                      size={15}
                      className={`transition-transform duration-200 opacity-60
                                  ${isExpanded ? "rotate-90" : ""}`}
                    />
                  )}
                </button>

                {/* Sub-departments */}
                {isExpanded && hasSubs && (
                  <div className="bg-black/20">
                    {prog.departments.map(d => (
                      <button
                        key={d}
                        onClick={() => { setDepartment(d); setSidebarOpen(false); }}
                        className={`w-full text-left px-8 py-2.5 text-xs font-medium
                                   transition-colors cursor-pointer
                                   ${department === d
                                     ? "text-blue-300 bg-white/10"
                                     : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-4 py-4 border-t border-white/10 flex flex-col gap-2">
          {/* If logged in — show user + role dashboard btn */}
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3 bg-white/8 rounded-xl px-3 py-2.5 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={15} className="text-blue-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-blue-300 capitalize truncate">{role}</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/${role}/dashboard`)}
                className="w-full flex items-center justify-center gap-2
                           bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold
                           py-2.5 rounded-xl transition-all cursor-pointer hover:-translate-y-0.5"
              >
                <GraduationCap size={14} />
                Go to Dashboard
              </button>
              <button
                onClick={() => { if(confirm("Log out?")){ logout(); window.location.reload(); } }}
                className="w-full text-xs font-semibold text-red-400 hover:text-red-300
                           py-2 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              {/* Generated Data btn (keep from your design) */}
              <button
                className="w-full flex items-center justify-center gap-2
                           bg-white/10 hover:bg-white/15 text-white text-xs font-semibold
                           py-2.5 rounded-xl transition-all cursor-pointer border border-white/10"
              >
                <FileText size={14} />
                Generated Data
              </button>

              {/* LOGIN BUTTON */}
              <button
                onClick={() => navigate("/login")}
                className="w-full flex items-center justify-center gap-2
                           bg-red-600 hover:bg-red-700 text-white text-sm font-bold
                           py-3 rounded-xl transition-all cursor-pointer
                           hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-900/40"
              >
                <LogIn size={15} />
                Login
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Overlay — mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden"
             onClick={() => setSidebarOpen(false)} />
      )}

      {/* ══ MAIN CONTENT ═════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">

        {/* ── Top bar ───────────────────────────────────────────── */}
        <header className="bg-white border-b border-slate-200 px-4 py-3
                           flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <Menu size={20} className="text-slate-600" />
          </button>

          {/* College branding — center */}
          <div className="flex-1 flex flex-col items-center">
            <h1 className="text-base md:text-lg font-extrabold text-[#0f2744] tracking-tight leading-none">
              BANGALORE INSTITUTE OF TECHNOLOGY
            </h1>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              An Autonomous Institution Under VTU
            </p>
            <div className="mt-1.5 h-[2px] w-full max-w-xs bg-gradient-to-r from-blue-600 to-blue-300 rounded-full" />
          </div>

          {/* Login shortcut — top right */}
          {!isLoggedIn && (
            <button
              onClick={() => navigate("/login")}
              className="hidden md:flex items-center gap-1.5 text-xs font-bold
                         text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <LogIn size={15} />
              Login
            </button>
          )}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-2 bg-blue-50 border border-blue-100
                            px-3 py-1.5 rounded-xl">
              <GraduationCap size={13} className="text-blue-600" />
              <span className="text-xs font-bold text-blue-700 capitalize">{role}</span>
            </div>
          )}
        </header>

        {/* ── Main body ─────────────────────────────────────────── */}
        <main className="flex-1 p-4 md:p-8">

          {/* Department pill scroller */}
          <div className="flex items-center gap-2 mb-5">
            <button onClick={scrollLeft}
                    className="p-2 rounded-full bg-white border border-slate-200
                               hover:bg-slate-50 transition-colors flex-shrink-0 cursor-pointer shadow-sm">
              <ChevronLeft size={18} className="text-slate-500" />
            </button>

            <div ref={scrollRef}
                 className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
              {depts.map(d => (
                <button
                  key={d}
                  onClick={() => setDepartment(d)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap
                             border-2 transition-all cursor-pointer
                             ${department === d
                               ? "border-[#0f2744] text-[#0f2744] bg-blue-50 shadow-sm"
                               : "border-slate-300 text-slate-500 hover:border-slate-400 hover:bg-white"}`}
                >
                  {d}
                </button>
              ))}
            </div>

            <button onClick={scrollRight}
                    className="p-2 rounded-full bg-white border border-slate-200
                               hover:bg-slate-50 transition-colors flex-shrink-0 cursor-pointer shadow-sm">
              <ChevronRight size={18} className="text-slate-500" />
            </button>
          </div>

          {/* Dept title */}
          <div className="text-center mb-6">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">
              Department of
            </p>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">{deptName}</h2>
            <div className="mt-2 h-0.5 w-24 bg-blue-500 mx-auto rounded-full" />
          </div>

          {/* Action row */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0f2744] text-white
                               text-sm font-semibold rounded-lg hover:bg-[#1e3a5f]
                               transition-all hover:-translate-y-0.5 cursor-pointer shadow-sm">
              <Download size={15} />
              Download
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600
                               text-sm font-semibold rounded-lg border border-blue-200
                               hover:bg-blue-50 transition-all hover:-translate-y-0.5 cursor-pointer">
              <Link2 size={15} />
              Merge
            </button>

            {/* Eye icon — guest view label */}
            {!isLoggedIn && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100
                              border border-slate-200 rounded-lg text-xs font-semibold text-slate-500">
                <Eye size={14} />
                Viewing as Guest
              </div>
            )}
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 bg-white border border-slate-200
                          rounded-xl px-4 py-2.5 mb-5 shadow-sm max-w-md mx-auto">
            <Search size={15} className="text-slate-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search courses or codes…"
              className="flex-1 text-sm text-slate-700 outline-none bg-transparent placeholder:text-slate-300"
            />
          </div>

          {/* Course table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[60px_1fr_130px_80px_130px_110px]
                            bg-[#0f2744] text-white text-xs font-bold
                            uppercase tracking-wider">
              <div className="px-4 py-3.5 text-center">Sem</div>
              <div className="px-4 py-3.5">Course Title</div>
              <div className="px-4 py-3.5 text-center">Course Code</div>
              <div className="px-4 py-3.5 text-center">Credits</div>
              <div className="px-4 py-3.5 text-center">Exam Type</div>
              <div className="px-4 py-3.5 text-center">Action</div>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-semibold">No courses found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map((course, i) => (
                  <div
                    key={course.id}
                    className={`grid grid-cols-[60px_1fr_130px_80px_130px_110px]
                                items-center hover:bg-slate-50 transition-colors
                                ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}
                  >
                    <div className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7
                                       rounded-lg bg-blue-50 border border-blue-100
                                       text-xs font-bold text-blue-700">
                        {course.sem}
                      </span>
                    </div>
                    <div className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-slate-800 leading-snug">
                        {course.course_title}
                      </p>
                    </div>
                    <div className="px-4 py-3.5 text-center">
                      <span className="font-mono text-sm font-bold text-slate-700">
                        {course.course_code}
                      </span>
                    </div>
                    <div className="px-4 py-3.5 text-center text-sm text-slate-600 font-medium">
                      {course.credits}
                    </div>
                    <div className="px-4 py-3.5 text-center">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg
                                       bg-slate-100 text-slate-600 border border-slate-200">
                        {course.course_type}
                      </span>
                    </div>
                    <div className="px-4 py-3.5 flex items-center justify-center gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                         bg-[#0f2744] text-white text-xs font-bold
                                         hover:bg-[#1e3a5f] transition-all cursor-pointer
                                         hover:-translate-y-0.5">
                        <Eye size={12} />
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Table footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100
                            flex items-center justify-between">
              <p className="text-xs text-slate-400 font-medium">
                {filtered.length} course{filtered.length !== 1 ? "s" : ""} · {department}
              </p>
              {!isLoggedIn && (
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600
                             hover:text-blue-800 transition-colors cursor-pointer"
                >
                  <LogIn size={13} />
                  Login to manage courses
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}