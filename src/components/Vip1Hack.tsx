import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  CheckCircle, 
  ExternalLink, 
  GripHorizontal, 
  Activity, 
  Cpu 
} from 'lucide-react';

interface Vip1HackProps {
  onBack: () => void;
  savedPassKey: string;
}

export default function Vip1Hack({ onBack, savedPassKey }: Vip1HackProps) {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return !!savedPassKey;
  });
  const [errorMsg, setErrorMsg] = useState('');

  const [currentPeriod, setCurrentPeriod] = useState('-');
  const [countdown, setCountdown] = useState('30s');
  const [prediction, setPrediction] = useState('SMALL');
  const [predNum, setPredNum] = useState(1);
  const [isSmallClass, setIsSmallClass] = useState(true);

  // Modern pointer dragging coordinates & status
  const [position, setPosition] = useState({ x: 10, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsUnlocked(!!savedPassKey);
  }, [savedPassKey]);

  const handleLogin = () => {
    const activeKeysStr = localStorage.getItem('sulaiman_active_keys') || '[]';
    const activeKeys = JSON.parse(activeKeysStr) as Array<{
      id: string; 
      code: string; 
      vipNum: number; 
      validUntil: string; 
      maxUsers: number; 
      usedCount: number;
    }>;
    
    const matchedKey = activeKeys.find(
      k => k.code === password.trim() && 
      k.vipNum === 1 && 
      (k.maxUsers === -1 || k.usedCount < k.maxUsers) &&
      (k.validUntil === 'alltime' || new Date(k.validUntil) > new Date())
    );

    if (matchedKey) {
      matchedKey.usedCount += 1;
      localStorage.setItem('sulaiman_active_keys', JSON.stringify(activeKeys));
      setIsUnlocked(true);
      setErrorMsg('');
    } else {
      setErrorMsg('❌ Invalid/Expired Key!');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  // Modern Pointer Drag Handlers with global capture
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('input') || 
      target.closest('button') || 
      target.closest('a')
    ) return;

    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Prediction loop
  useEffect(() => {
    if (!isUnlocked) return;

    let lastIssuePeriod: string | null = null;

    const fetchRealPeriod = async () => {
      try {
        const ts = Date.now();
        const res = await fetch(`https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=${ts}`);
        if (!res.ok) return null;
        const data = await res.json();
        if (data?.data?.list && data.data.list.length > 0) {
          const latest = data.data.list[0];
          const issueNum = latest.issueNumber || latest.issue || latest.period;
          const nextPeriod = (BigInt(issueNum) + 1n).toString();
          return nextPeriod;
        }
      } catch (e) {
        // Safe fallback
      }
      return null;
    };

    const tick = async () => {
      const now = new Date();
      const totalSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      const remaining = 30 - (totalSec % 30);

      setCountdown(remaining + 's');

      const currentPeriodDisplay = document.getElementById('period-display-v1')?.textContent;
      if (remaining === 30 || currentPeriod === '-' || !currentPeriodDisplay) {
        const realPeriod = await fetchRealPeriod();
        if (realPeriod) {
          setCurrentPeriod(realPeriod);
          lastIssuePeriod = realPeriod;
        } else if (lastIssuePeriod) {
          try {
            const next = (BigInt(lastIssuePeriod) + 1n).toString();
            setCurrentPeriod(next);
            lastIssuePeriod = next;
          } catch (e) {}
        } else {
          const seed = Math.floor(Date.now() / 30000);
          setCurrentPeriod((2026070400000 + seed).toString());
        }

        const isSmall = Math.random() < 0.5;
        const num = isSmall ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 5) + 5;

        setPrediction(isSmall ? 'SMALL' : 'BIG');
        setPredNum(num);
        setIsSmallClass(isSmall);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isUnlocked, currentPeriod]);

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {isUnlocked ? (
        <>
          {/* Target Game Frame */}
          <iframe 
            id="site-frame" 
            src="https://hgzy.app/" 
            className="absolute inset-0 w-full h-full border-none z-0"
          />

          {/* Floating Sleek Opaque Overlay Box */}
          <div 
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className={`fixed z-50 w-[155px] bg-slate-950/95 rounded-2xl border-2 border-red-500 p-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] text-center select-none overflow-hidden transition-all duration-300 ${
              isDragging ? 'cursor-grabbing border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.6)] scale-[1.01]' : 'cursor-grab hover:border-orange-500'
            }`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              touchAction: 'none'
            }}
          >
            {/* Animated scanner laser scan bar */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(239,68,68,0.04)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />

            {/* Drag Handle Bar */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
              <button 
                onClick={onBack}
                className="text-[7.5px] text-red-400 hover:text-white px-1.5 py-0.5 bg-red-950/40 border border-red-500/20 rounded-lg font-black transition-all cursor-pointer hover:bg-red-900/60"
              >
                ← EXIT
              </button>
              
              <div className="flex items-center gap-1 text-slate-500">
                <GripHorizontal className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                <span className="text-[6.5px] font-mono tracking-widest uppercase text-orange-400 font-extrabold">DRAG</span>
              </div>

              <span className="text-[7.5px] font-mono px-1 py-0.5 rounded bg-red-950 border border-red-800 text-red-400 font-extrabold animate-pulse">
                VIP 1
              </span>
            </div>

            {/* Title Brand */}
            <div className="space-y-0.5 mb-2">
              <div className="flex items-center justify-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-orange-500 animate-spin-slow" />
                <h1 className="font-orbitron font-black tracking-wider text-[9px] text-white">
                  SULAIMAN <span className="text-red-500">OWN HACK</span>
                </h1>
              </div>
              <p className="text-[6.5px] text-orange-500 font-mono tracking-widest uppercase font-black">WINGO 30S DECRYPTOR</p>
            </div>

            {/* Active Hack Panel */}
            <div className="space-y-2.5 py-0.5 animate-fade-in text-center">
              
              {/* Live Telemetry Data */}
              <div className="grid grid-cols-2 gap-1 bg-slate-900 border border-white/5 p-1 rounded-xl">
                <div className="text-left">
                  <span className="text-[6px] text-slate-500 block font-mono">ALG</span>
                  <span className="text-[8px] text-red-400 font-mono font-bold">PLASMA</span>
                </div>
                <div className="text-right">
                  <span className="text-[6px] text-slate-500 block font-mono">STATUS</span>
                  <span className="text-[8px] text-orange-400 font-mono font-bold flex items-center justify-end gap-1">
                    <span className="w-1 h-1 rounded-full bg-orange-500 animate-ping" /> LIVE
                  </span>
                </div>
              </div>

              {/* Period Display Label */}
              <div className="bg-red-400/5 border border-red-500/20 py-1.5 px-2 rounded-xl relative">
                <div className="text-[7px] text-red-500 font-bold tracking-widest uppercase mb-0.5 font-orbitron">WINGO PERIOD</div>
                <div id="period-display-v1" className="text-[10px] font-black font-mono text-red-400 tracking-wider">
                  {currentPeriod}
                </div>
              </div>

              {/* AI Core Diagnostics Output Box */}
              <div className="bg-slate-900 border border-white/5 rounded-xl p-2 relative">
                <div className="absolute top-1 left-2 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                  <span className="text-[6.5px] text-slate-500 font-mono font-bold">SIGNAL</span>
                </div>

                <div className="mt-2 flex flex-col items-center">
                  <span className={`text-[11px] font-black px-3 py-1 rounded-xl font-orbitron tracking-widest shadow-inner transition-all ${
                    isSmallClass ? 'text-red-400 bg-red-950/40 border border-red-500/30' : 'text-orange-400 bg-orange-950/40 border border-orange-500/30'
                  }`}>
                    {prediction}
                  </span>
                </div>

                {/* Advanced Neon Number Box */}
                <div className="flex justify-center mt-1.5">
                  <div className={`relative w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-md transition-all duration-300 ${
                    isSmallClass 
                      ? 'bg-gradient-to-br from-red-600 to-orange-600 border border-red-400/20 shadow-red-500/20' 
                      : 'bg-gradient-to-br from-orange-500 to-yellow-600 border border-orange-400/20 shadow-orange-500/20'
                  }`}>
                    <span className="relative z-10 font-orbitron">{predNum}</span>
                  </div>
                </div>
              </div>

              {/* Countdown timer state */}
              <div className="flex items-center justify-between px-1 text-[8px] text-slate-400 font-mono font-bold">
                <span>ALGO CALIB</span>
                <span id="countdown" className="text-white font-extrabold font-mono bg-slate-900 border border-white/10 px-1 py-0.5 rounded text-orange-400">
                  {countdown}
                </span>
              </div>

              {/* Validation footer sticker */}
              <div className="flex items-center justify-center gap-1 text-[7px] text-orange-400/80 font-mono py-1 border-t border-white/10">
                <CheckCircle className="w-3 h-3 text-orange-400 animate-pulse" />
                <span>SULAIMAN CERTIFIED</span>
              </div>
            </div>

            {/* Telegram Direct launcher banner link */}
            <div className="mt-1.5 pt-1.5 border-t border-white/10">
              <a 
                href="https://t.me/+xCmnnFbcYRw4NDZl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 w-full py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-[8px] font-black tracking-widest font-orbitron transition-all border border-red-500/20"
              >
                📢 JOIN TELEGRAM <ExternalLink className="w-3 h-3 text-red-400 animate-pulse" />
              </a>
            </div>

          </div>
        </>
      ) : (
        /* Full screen Lock Gateway card */
        <div className="w-full max-w-xs p-6 bg-slate-950 border-2 border-red-500 rounded-3xl shadow-[0_0_35px_rgba(239,68,68,0.4)] text-center relative z-10 animate-fade-in select-none">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-center justify-center shadow-lg">
              <Cpu className="w-6 h-6 text-red-500 animate-pulse" />
            </div>
          </div>
          <h2 className="font-orbitron text-sm font-black tracking-widest text-white uppercase mb-1">
            SULAIMAN OWN HACK
          </h2>
          <p className="text-[8px] font-mono text-orange-500 uppercase tracking-widest font-bold mb-6">
            VIP MODULE 1 ACCESS GATEWAY
          </p>

          <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-white/5">
            <label className="block text-[10px] font-bold text-red-400 uppercase tracking-widest font-mono text-center">
              🔑 Enter VIP 1 Authorization Key
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER PASSKEY"
              className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2 text-center text-xs font-mono text-white tracking-widest outline-none"
            />
            <button
              onClick={handleLogin}
              className="w-full py-2.5 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white font-black font-orbitron text-[9px] tracking-widest rounded-xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-red-900/20"
            >
              LAUNCH SECURE SYSTEM
            </button>
            {errorMsg && (
              <p className="text-[10px] text-red-400 font-mono font-bold animate-pulse mt-1">{errorMsg}</p>
            )}
          </div>

          <button 
            onClick={onBack}
            className="mt-6 text-[10px] text-red-400 hover:text-white font-mono font-bold cursor-pointer transition-colors"
          >
            ← BACK TO MAIN MENU
          </button>
        </div>
      )}
    </div>
  );
}
