import React, { useState, useEffect } from 'react';
import { HackPassword } from './types';
import AdminPanel from './components/AdminPanel';
import Vip1Hack from './components/Vip1Hack';
import Vip2Hack from './components/Vip2Hack';
import Vip3Hack from './components/Vip3Hack';
import Vip4Hack from './components/Vip4Hack';
import { 
  ShieldCheck, 
  Settings, 
  Crown, 
  ExternalLink, 
  CheckCircle, 
  User, 
  HelpCircle,
  TrendingUp,
  Cpu,
  LockKeyhole,
  Trophy
} from 'lucide-react';

export default function App() {
  const [passwords, setPasswords] = useState<HackPassword[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [selectedVipView, setSelectedVipView] = useState<number | null>(null);
  
  // King emoji clicking tracker
  const [kingClicks, setKingClicks] = useState(0);

  // Load initial passwords/keys or set default seeds from backend
  const fetchKeysFromServer = async () => {
    try {
      const res = await fetch('/api/passwords');
      if (res.ok) {
        const data = await res.json();
        setPasswords(data);
      }
    } catch (e) {
      console.error('Error syncing keys:', e);
    }
  };

  useEffect(() => {
    fetchKeysFromServer();
    // Poll the server every 3 seconds to keep keys in sync across all devices
    const interval = setInterval(fetchKeysFromServer, 3000);
    return () => clearInterval(interval);
  }, []);

  // Add a brand new password key via Admin control panel
  const handleAddPassword = async (
    vipNum: number, 
    code: string, 
    maxUsers: number, 
    validityHours: string | 'alltime'
  ) => {
    try {
      const res = await fetch('/api/passwords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vipNum, code, maxUsers, validityHours })
      });
      if (res.ok) {
        fetchKeysFromServer();
      }
    } catch (e) {
      console.error('Error adding key:', e);
    }
  };

  // Delete key completely
  const handleDeletePassword = async (id: string) => {
    try {
      const res = await fetch(`/api/passwords/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchKeysFromServer();
      }
    } catch (e) {
      console.error('Error deleting key:', e);
    }
  };

  // King Crown Emoji handler to trigger Admin panel (5 click mechanism requested)
  const handleKingClick = () => {
    setKingClicks(prev => {
      const nextCount = prev + 1;
      if (nextCount >= 5) {
        setAdminOpen(true);
        return 0; // reset
      }
      return nextCount;
    });
  };

  // Check if session for currently selected view is validated (always require password on launch per user request)
  const getSavedSessionKey = (vipNum: number) => {
    return '';
  };

  // VIP Hack panel component rendering mapper
  if (selectedVipView === 1) {
    return <Vip1Hack onBack={() => setSelectedVipView(null)} savedPassKey={getSavedSessionKey(1)} />;
  }
  if (selectedVipView === 2) {
    return <Vip2Hack onBack={() => setSelectedVipView(null)} savedPassKey={getSavedSessionKey(2)} />;
  }
  if (selectedVipView === 3) {
    return <Vip3Hack onBack={() => setSelectedVipView(null)} savedPassKey={getSavedSessionKey(3)} />;
  }
  if (selectedVipView === 4) {
    return <Vip4Hack onBack={() => setSelectedVipView(null)} savedPassKey={getSavedSessionKey(4)} />;
  }

  return (
    <div className="min-h-screen bg-[#020205] text-slate-100 flex flex-col relative overflow-hidden scanline-overlay">
      
      {/* Decorative cyber grid backdrop */}
      <div className="absolute inset-0 cyber-matrix-grid opacity-80 pointer-events-none" />
      
      {/* Decorative cyber backdrop circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[65%] h-[55%] bg-red-950/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[65%] h-[55%] bg-orange-950/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] left-[30%] w-[45%] h-[45%] bg-purple-950/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container / Content Header */}
      <header className="border-b border-red-500/20 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-[1000] shadow-2xl shadow-red-950/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-red-600 via-orange-600 to-yellow-500 p-2.5 rounded-2xl border border-orange-500/40 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black font-orbitron tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 flex items-center gap-1.5 select-none animate-glow-text">
                SULAIMAN OWN HACK <span className="text-white text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-red-600/30 border border-red-500/40 animate-pulse">v3.5</span>
              </h1>
              <p className="text-[9px] text-orange-400/80 font-mono uppercase tracking-widest font-bold">PREDICTIVE PLASMA BYPASS DECK</p>
            </div>
          </div>

          {/* Interactive King Icon (Click 5 times for Admin panel) */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleKingClick}
              className="text-2xl p-2.5 bg-red-950/20 border-2 border-orange-500/30 hover:border-orange-500/60 rounded-2xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center relative cursor-pointer shadow-[0_0_10px_rgba(234,88,12,0.1)]"
              title="Click 5 times to reveal Decryptor Gate"
            >
              👑
              {kingClicks > 0 ? (
                <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white font-black text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-mono shadow-[0_0_10px_#f97316] animate-bounce">
                  {kingClicks}
                </span>
              ) : (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Welcome banner */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full flex flex-col justify-center relative z-10">
        
        {/* Real-time Status Terminal bar */}
        <div className="max-w-4xl mx-auto w-full bg-slate-950/85 border-2 border-red-950 rounded-2xl p-4 mb-8 flex flex-wrap gap-4 items-center justify-between text-[11px] font-mono text-slate-300 shadow-[0_0_20px_rgba(127,29,29,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400" />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
            <span className="text-orange-500 font-extrabold uppercase tracking-widest">🔥 SULAIMAN BYPASS ENGINE ONLINE 🔥</span>
          </div>
          <div className="flex items-center gap-6">
            <div>SIGNAL: <span className="text-red-400 font-extrabold">99.9% ACCURACY</span></div>
            <div className="hidden sm:inline">DECRYPTION: <span className="text-orange-400 font-extrabold">LATENCY 8MS</span></div>
            <div>MODE: <span className="text-yellow-400 font-extrabold">BYPASS SEED SECURED</span></div>
          </div>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="px-3.5 py-1.5 bg-gradient-to-r from-red-950 via-orange-950 to-slate-950 border border-red-500/30 rounded-full text-[9px] font-black font-mono tracking-widest text-orange-400 uppercase mb-4 inline-block shadow-lg shadow-red-950/20">
            ⚡ LIVE QUANTUM TRANSMISSION SIGNALS ⚡
          </span>
          <h2 className="text-3xl md:text-5xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-orange-200 leading-tight mb-4 tracking-tight">
            WINGO AUTOMATION DECK
          </h2>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
            Experience next-generation forecasting telemetry. Unlock secure predictive bypass layers utilizing validated master passkeys.
          </p>
        </div>

        {/* 4 Cards Grid - VIP 1, VIP 2, VIP 3, VIP 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto w-full mb-10">
          
          {/* VIP 1 Card */}
          <div className="group bg-slate-950/90 border-2 border-red-500/25 hover:border-orange-500 rounded-3xl p-6 transition-all duration-300 flex flex-col relative overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:scale-[1.03] animate-cyber-pulse-fire">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-red-600/10 to-orange-500/0 rounded-full blur-2xl group-hover:bg-red-600/20 transition-all duration-300" />
            <div className="absolute -inset-px bg-gradient-to-r from-red-500/0 via-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 pointer-events-none" />
            
            <div className="flex justify-between items-start mb-5">
              <span className="text-[9px] font-black font-mono px-2.5 py-1 rounded-lg bg-red-950/80 text-orange-400 border border-red-500/40 tracking-wider">
                MODULE VIP-01
              </span>
              <div className="bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                <Trophy className="w-4 h-4 text-red-500 animate-pulse" />
              </div>
            </div>

            <h3 className="text-base font-black font-orbitron text-white mb-2 tracking-wide group-hover:text-orange-400 transition-colors uppercase">VIP 1 SYSTEM</h3>
            <p className="text-[11px] text-slate-400 mb-6 flex-1 leading-relaxed">
              Provides real-time WingO 30S prediction algorithms integrated directly into a secure quantum bypass interface.
            </p>

            <button 
              onClick={() => setSelectedVipView(1)}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white hover:brightness-110 font-black font-orbitron text-[10px] tracking-widest rounded-2xl transition-all cursor-pointer shadow-[0_4px_15px_rgba(239,68,68,0.4)] active:scale-[0.96]"
            >
              LAUNCH INTERFACE
            </button>
          </div>

          {/* VIP 2 Card */}
          <div className="group bg-slate-950/90 border-2 border-orange-500/25 hover:border-yellow-500 rounded-3xl p-6 transition-all duration-300 flex flex-col relative overflow-hidden shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:scale-[1.03] animate-cyber-pulse-fire">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-orange-600/10 to-yellow-500/0 rounded-full blur-2xl group-hover:bg-orange-600/20 transition-all duration-300" />
            <div className="absolute -inset-px bg-gradient-to-r from-orange-500/0 via-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 pointer-events-none" />
            
            <div className="flex justify-between items-start mb-5">
              <span className="text-[9px] font-black font-mono px-2.5 py-1 rounded-lg bg-orange-950/80 text-yellow-400 border border-orange-500/40 tracking-wider">
                MODULE VIP-02
              </span>
              <div className="bg-orange-500/10 p-2 rounded-xl border border-orange-500/20">
                <TrendingUp className="w-4 h-4 text-orange-400 animate-pulse" />
              </div>
            </div>

            <h3 className="text-base font-black font-orbitron text-white mb-2 tracking-wide group-hover:text-yellow-400 transition-colors uppercase">VIP 2 SYSTEM</h3>
            <p className="text-[11px] text-slate-400 mb-6 flex-1 leading-relaxed">
              Provides detailed telemetry win-rate multipliers, active diagnostic arrays, and advanced visual target forecasts.
            </p>

            <button 
              onClick={() => setSelectedVipView(2)}
              className="w-full py-3.5 bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 text-white hover:brightness-110 font-black font-orbitron text-[10px] tracking-widest rounded-2xl transition-all cursor-pointer shadow-[0_4px_15px_rgba(249,115,22,0.4)] active:scale-[0.96]"
            >
              LAUNCH INTERFACE
            </button>
          </div>

          {/* VIP 3 Card */}
          <div className="group bg-slate-950/90 border-2 border-pink-500/25 hover:border-red-500 rounded-3xl p-6 transition-all duration-300 flex flex-col relative overflow-hidden shadow-[0_0_15px_rgba(236,72,153,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:scale-[1.03] animate-cyber-pulse-fire">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-pink-600/10 to-red-500/0 rounded-full blur-2xl group-hover:bg-pink-600/20 transition-all duration-300" />
            <div className="absolute -inset-px bg-gradient-to-r from-pink-500/0 via-red-500/20 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 pointer-events-none" />
            
            <div className="flex justify-between items-start mb-5">
              <span className="text-[9px] font-black font-mono px-2.5 py-1 rounded-lg bg-pink-950/80 text-pink-400 border border-pink-500/40 tracking-wider">
                MODULE VIP-03
              </span>
              <div className="bg-pink-500/10 p-2 rounded-xl border border-pink-500/20">
                <ShieldCheck className="w-4 h-4 text-pink-500 animate-pulse" />
              </div>
            </div>

            <h3 className="text-base font-black font-orbitron text-white mb-2 tracking-wide group-hover:text-pink-400 transition-colors uppercase">VIP 3 SYSTEM</h3>
            <p className="text-[11px] text-slate-400 mb-6 flex-1 leading-relaxed">
              Provides dynamic target radar loaders, customized minimize overlays, and persistent authorization memory.
            </p>

            <button 
              onClick={() => setSelectedVipView(3)}
              className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-red-500 to-orange-500 text-white hover:brightness-110 font-black font-orbitron text-[10px] tracking-widest rounded-2xl transition-all cursor-pointer shadow-[0_4px_15px_rgba(236,72,153,0.4)] active:scale-[0.96]"
            >
              LAUNCH INTERFACE
            </button>
          </div>

          {/* VIP 4 Card */}
          <div className="group bg-slate-950/90 border-2 border-yellow-500/25 hover:border-orange-500 rounded-3xl p-6 transition-all duration-300 flex flex-col relative overflow-hidden shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:scale-[1.03] animate-cyber-pulse-fire">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-yellow-600/10 to-orange-500/0 rounded-full blur-2xl group-hover:bg-yellow-600/20 transition-all duration-300" />
            <div className="absolute -inset-px bg-gradient-to-r from-yellow-500/0 via-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 pointer-events-none" />
            
            <div className="flex justify-between items-start mb-5">
              <span className="text-[9px] font-black font-mono px-2.5 py-1 rounded-lg bg-yellow-950/80 text-yellow-400 border border-yellow-800/40 tracking-wider">
                MODULE VIP-04
              </span>
              <div className="bg-yellow-500/10 p-2 rounded-xl border border-yellow-500/20">
                <Crown className="w-4 h-4 text-yellow-500 animate-pulse" />
              </div>
            </div>

            <h3 className="text-base font-black font-orbitron text-white mb-2 tracking-wide group-hover:text-yellow-400 transition-colors uppercase">VIP 4 SYSTEM</h3>
            <p className="text-[11px] text-slate-400 mb-6 flex-1 leading-relaxed">
              Provides orbital drag-and-drop bypass modules, active vector tracking widgets, and custom overlay filters.
            </p>

            <button 
              onClick={() => setSelectedVipView(4)}
              className="w-full py-3.5 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 text-white hover:brightness-110 font-black font-orbitron text-[10px] tracking-widest rounded-2xl transition-all cursor-pointer shadow-[0_4px_15px_rgba(234,179,8,0.4)] active:scale-[0.96]"
            >
              LAUNCH INTERFACE
            </button>
          </div>

        </div>

        {/* Telegram Direct launcher banner */}
        <div className="max-w-2xl mx-auto w-full bg-slate-950/40 border border-slate-900 rounded-3xl p-6 text-center shadow-xl mb-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
          <p className="text-[10px] text-slate-500 mb-3 font-mono uppercase tracking-widest">STAY UPDATED WITH OUR RELEASES</p>
          <a 
            href="https://t.me/+xCmnnFbcYRw4NDZl" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 py-3 px-8 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 text-white font-black font-orbitron text-xs tracking-widest rounded-2xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            📢 JOIN VIP TELEGRAM CHANNEL <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </main>

      {/* Admin Panel Modal Portal */}
      {adminOpen && (
        <AdminPanel 
          passwords={passwords}
          onAddPassword={handleAddPassword}
          onDeletePassword={handleDeletePassword}
          onClose={() => setAdminOpen(false)}
        />
      )}

      {/* Footer copyright banner */}
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-xl py-5 text-center text-[10px] text-slate-500 font-mono z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 SULAIMAN BYPASS LABS INC. ALL RIGHTS RESERVED.</span>
          <span className="flex items-center gap-1.5 text-cyan-400/80 animate-pulse">
            <LockKeyhole className="w-3.5 h-3.5" /> QUANTUM DECRYPTION PORTAL ACTIVE
          </span>
        </div>
      </footer>

    </div>
  );
}
