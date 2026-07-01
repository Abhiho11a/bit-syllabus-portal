import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BarChart3, Activity, Users, FileCheck2, 
  ArrowLeft, Clock, RefreshCw, LayoutDashboard,
  Zap
} from "lucide-react";

export default function Stats() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/stats`);
      const data = await res.json();
      if (data.status === "Success") {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // auto refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const totalVisits = stats?.totalVisits || 0;
  const totalApprovals = stats?.totalApprovals || 0;
  const roleBreakdown = stats?.roleBreakdown || [];
  const recentActivity = stats?.recentActivity || [];

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden" style={{ fontFamily:"'Inter', 'Figtree', sans-serif" }}>
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-slate-900/60 backdrop-blur-xl border-b border-white/10 flex items-center px-6 py-4">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-white/5 cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/30">
          <Activity size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h1 className="font-extrabold text-white text-lg tracking-tight">System Analytics</h1>
          <p className="text-[11px] font-semibold text-indigo-300/80 uppercase tracking-widest">Live Platform Statistics</p>
        </div>
        <button 
          onClick={fetchStats}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/25 cursor-pointer hover:-translate-y-0.5"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <main className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-7 shadow-xl shadow-blue-900/20 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 border border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
                <BarChart3 size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-100">Total Page Views</p>
                <p className="text-xs text-blue-200/60 font-medium">Across all roles</p>
              </div>
            </div>
            <h2 className="text-6xl font-black text-white relative z-10 tracking-tight">{totalVisits}</h2>
          </div>

          {/* Card 2 */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-7 shadow-xl shadow-emerald-900/20 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 border border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
                <FileCheck2 size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-100">Manual Approvals</p>
                <p className="text-xs text-emerald-200/60 font-medium">PDFs officially stamped</p>
              </div>
            </div>
            <h2 className="text-6xl font-black text-white relative z-10 tracking-tight">{totalApprovals}</h2>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-7 shadow-xl flex flex-col justify-between relative overflow-hidden border border-slate-700 hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
            <div className="relative z-10 flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-700/50 flex items-center justify-center text-purple-400 border border-slate-600 shadow-inner">
                <Users size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">Active Roles</p>
                <p className="text-xs text-slate-400 font-medium">Approval breakdown</p>
              </div>
            </div>
            <div className="relative z-10 flex gap-3 flex-wrap">
              {roleBreakdown.length > 0 ? roleBreakdown.map(rb => (
                <div key={rb._id} className="bg-slate-700/40 px-4 py-2.5 rounded-xl border border-slate-600/50 flex items-center gap-3">
                  <span className="text-2xl font-black text-white">{rb.count}</span>
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">{rb._id}</span>
                </div>
              )) : (
                <div className="bg-slate-700/30 px-4 py-3 rounded-xl border border-slate-600/50 w-full">
                  <p className="text-slate-400 text-sm font-semibold flex items-center gap-2">
                    <Zap size={14} className="text-slate-500"/> No approvals yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTIVITY FEED */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-700/50 bg-slate-800/80 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-3">
              <Clock size={20} className="text-indigo-400" />
              Real-time Activity Log
            </h3>
            <span className="text-[11px] font-bold bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-4 py-1.5 rounded-full tracking-widest uppercase shadow-inner">
              Latest {recentActivity.length} events
            </span>
          </div>
          
          {loading && recentActivity.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw size={32} className="animate-spin mb-4 text-indigo-500" />
              <p className="font-medium text-sm">Fetching live data...</p>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="p-16 text-center text-slate-500 font-semibold text-sm">
              No activity recorded in the database yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50 max-h-[500px] overflow-y-auto custom-scrollbar">
              {recentActivity.map(act => (
                <div key={act._id} className="p-5 px-8 hover:bg-slate-700/30 transition-colors flex flex-col sm:flex-row sm:items-center gap-4 group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-inner transition-transform group-hover:scale-110 ${
                    act.action === "MANUAL_APPROVE" 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                      : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  }`}>
                    {act.action === "MANUAL_APPROVE" ? <FileCheck2 size={20} /> : <LayoutDashboard size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-base font-extrabold text-slate-200">{act.user_name}</span> 
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded border uppercase tracking-widest ${
                        act.role === 'dean' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        act.role === 'coordinator' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 
                        'bg-slate-500/10 text-slate-300 border-slate-500/20'
                      }`}>{act.role}</span>
                    </div>
                    <p className="text-sm text-slate-400">
                      {act.action === "MANUAL_APPROVE" ? (
                        <span>Approved document: <span className="font-semibold text-emerald-400">{act.details}</span></span>
                      ) : (
                        <span>Viewed page: <span className="font-mono text-[11px] bg-slate-900 px-2 py-1 rounded-md text-blue-300 border border-slate-700">{act.details}</span></span>
                      )}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
                    {new Date(act.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5); 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(51, 65, 85, 0.8); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 1); 
        }
      `}} />
    </div>
  );
}
