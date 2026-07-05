import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  CheckCircle, 
  ExternalLink, 
  Radio, 
  GripHorizontal 
} from 'lucide-react';

interface Vip3HackProps {
  onBack: () => void;
  savedPassKey: string;
}

export default function Vip3Hack({ onBack, savedPassKey }: Vip3HackProps) {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return !!savedPassKey;
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Engine variables
  const [timerNum, setTimerNum] = useState(30);
  const [sigOutput, setSigOutput] = useState('SCANNING');
  const [sigColor, setSigColor] = useState('#00ffff');
  const [isMini, setIsMini] = useState(false);

  // Modern pointer dragging coordinates & status
  const [position, setPosition] = useState({ x: 20, y: 160 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsUnlocked(!!savedPassKey);
  }, [savedPassKey]);

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/passwords/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: password.trim(), vipNum: 3 })
      });
      
      if (res.ok) {
        setIsUnlocked(true);
        setErrorMsg('');
      } else {
        const data = await res.json();
        setErrorMsg('❌ ' + (data.error || 'Invalid/Expired Key!'));
        setTimeout(() => setErrorMsg(''), 3000);
      }
    } catch (e) {
      setErrorMsg('❌ Connection Error!');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  // Pointer dragging handlers with global capture
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
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    
    // Bounds to prevent widget from sliding completely off screen on mobiles
    const minX = 0;
    const maxX = Math.max(20, window.innerWidth - 165);
    const minY = 0;
    const maxY = Math.max(20, window.innerHeight - 200);

    setPosition({
      x: Math.max(minX, Math.min(newX, maxX)),
      y: Math.max(minY, Math.min(newY, maxY))
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Nexus Engine execution loop
  useEffect(() => {
    if (!isUnlocked) return;

    const signals = [
      { t: 'BIG', c: '#00ffff' },
      { t: 'SMALL', c: '#a855f7' }
    ];

    const runNexusEngine = () => {
      const now = new Date();
      const sec = 30 - (Math.floor(now.getTime() / 1000) % 30);
      setTimerNum(sec);
      
      const data = signals[Math.floor(now.getTime() / 30000) % 2];
      if (data) {
        setSigOutput(data.t);
        setSigColor(data.c);
      }
    };

    runNexusEngine();
    const interval = setInterval(runNexusEngine, 1000);
    return () => clearInterval(interval);
  }, [isUnlocked]);

  const progressPercent = (timerNum / 30) * 100;

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {isUnlocked ? (
        <>
          {/* Underlying Game Iframe Target */}
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
            <iframe 
              src="https://hgnice.biz/#/register?invitationCode=83335233034" 
              className="w-full h-full border-none"
            />
          </div>

          {/* Mini Maximizer Floating Bubble */}
          {isMini && (
            <button 
              onClick={() => setIsMini(false)}
              className="fixed left-4 top-[30%] w-10 h-10 bg-slate-950/70 backdrop-blur-md border border-red-500/40 rounded-full flex flex-col items-center justify-center z-[10000] cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:scale-105 active:scale-95 transition-all text-red-400 animate-pulse"
            >
              <Radio className="w-4 h-4 text-red-500 animate-pulse mb-0.5" />
              <span className="text-[6px] font-black font-orbitron text-red-400 tracking-widest">SHOW</span>
            </button>
          )}

          {/* Floating Panel Console (Nexus Decryptor) */}
          {!isMini && (
            <div 
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              className={`fixed z-50 w-[155px] bg-slate-950/95 border-2 border-red-500 rounded-2xl p-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] text-center select-none overflow-hidden transition-all duration-300 ${
                isDragging ? 'cursor-grabbing border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.6)] scale-[1.01]' : 'cursor-grab hover:border-orange-500'
              }`}
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                touchAction: 'none'
              }}
            >
              {/* Diagnostic scanner top gradient */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(239,68,68,0.04)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none" />

              {/* Grip Header */}
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/10">
                <button 
                  onClick={onBack}
                  className="text-[7.5px] text-red-400 hover:text-white px-1.5 py-0.5 bg-red-950/40 border border-red-500/20 rounded-lg font-black transition-all hover:bg-red-900/60"
                >
                  ← MENU
                </button>
                
                <div className="flex items-center gap-1 text-slate-500">
                  <GripHorizontal className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                  <span className="text-[6.5px] font-mono tracking-widest text-orange-400 font-extrabold">DRAG</span>
                </div>

                <div className="text-right">
                  <span className="text-[7.5px] font-mono tracking-widest text-red-400 font-black animate-pulse">
                    VIP 3
                  </span>
                </div>
              </div>

              <div className="space-y-0.5 mb-2">
                <h2 className="font-orbitron text-[9px] font-black tracking-wider text-white uppercase drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]">
                  SULAIMAN NEXUS
                </h2>
                <p className="text-[6.5px] font-mono text-orange-400 uppercase tracking-widest font-black animate-pulse">NEXUS OVERLAY</p>
              </div>

              {/* Unlocked Live Signal Display Panel */}
              <div className="space-y-2.5 animate-fade-in text-center">
                
                {/* Radar Circle and Output Display */}
                <div className="bg-slate-900 rounded-xl p-2 border border-white/5 flex flex-col items-center">
                  
                  {/* Simulated spinning radar circles around output */}
                  <div className="relative w-20 h-20 flex items-center justify-center mb-1.5">
                    <div className="absolute inset-0 rounded-full border border-dashed border-red-500/30 animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-2 rounded-full border border-orange-500/15 animate-[spin_6s_linear_infinite_reverse]" />
                    <div className="absolute inset-4 rounded-full border border-yellow-400/20 animate-pulse" />
                    
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <span className="text-[6px] text-slate-500 font-mono font-bold uppercase tracking-widest">RECOMMEND</span>
                      <div 
                        id="sig-output" 
                        className="text-xs font-black font-orbitron tracking-wider uppercase transition-colors duration-500 my-0.5"
                        style={{ color: sigColor === 'CYAN' ? '#f97316' : sigColor, textShadow: `0 0 6px ${sigColor === 'CYAN' ? '#f97316' : sigColor}` }}
                      >
                        {sigOutput}
                      </div>
                      <span className="text-[6.5px] font-mono text-orange-400 uppercase tracking-widest">98.2% ACC</span>
                    </div>
                  </div>

                  <div className="text-[8px] text-slate-400 font-mono font-bold uppercase">
                    SWAP IN: <span id="timer-num" className="text-orange-400 font-extrabold font-mono">{timerNum}S</span>
                  </div>

                  {/* Smooth fluid progress bar */}
                  <div className="w-full h-1 bg-slate-950/80 rounded-full mt-1.5 border border-white/10 overflow-hidden">
                    <div 
                      id="progress-fill" 
                      className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons to minimize or terminate panel */}
                <div className="grid grid-cols-2 gap-1.5">
                  <button 
                    onClick={() => setIsMini(true)}
                    className="py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[8px] font-black tracking-wider uppercase font-orbitron border border-white/10 transition-colors cursor-pointer"
                  >
                    MINIMIZE
                  </button>
                  <button 
                    onClick={onBack}
                    className="py-1 bg-red-950/20 hover:bg-red-950/30 text-red-400 hover:text-red-300 rounded-xl text-[8px] font-black tracking-wider uppercase font-orbitron border border-red-900/20 transition-colors cursor-pointer"
                  >
                    EXIT
                  </button>
                </div>

                {/* Verified Badge */}
                <div className="flex items-center justify-center gap-1 text-[7px] text-orange-400/80 font-mono">
                  <CheckCircle className="w-3 h-3 text-orange-400 animate-pulse" />
                  <span>NEXUS TELEMETRY ONLINE</span>
                </div>
              </div>

              {/* Telegram Footer Link banner */}
              <div className="mt-1.5 pt-1.5 border-t border-white/5">
                <a 
                  href="https://t.me/+xCmnnFbcYRw4NDZl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 w-full py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[8px] font-black tracking-widest font-orbitron transition-all border border-red-500/20"
                >
                  📢 Telegram Channel <ExternalLink className="w-2.5 h-2.5 ml-0.5 text-red-400 animate-pulse" />
                </a>
              </div>

            </div>
          )}
        </>
      ) : (
        /* Full screen Lock Gateway card */
        <div className="w-full max-w-xs p-6 bg-slate-950 border-2 border-red-500 rounded-3xl shadow-[0_0_35px_rgba(244,63,94,0.4)] text-center relative z-10 animate-fade-in select-none">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-center justify-center shadow-lg">
              <Radio className="w-6 h-6 text-red-500 animate-pulse" />
            </div>
          </div>
          <h2 className="font-orbitron text-sm font-black tracking-widest text-white uppercase mb-1">
            SULAIMAN OWN HACK
          </h2>
          <p className="text-[8px] font-mono text-pink-400 uppercase tracking-widest font-bold mb-6">
            VIP MODULE 3 ACCESS GATEWAY
          </p>

          <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-white/5">
            <label className="block text-[10px] font-bold text-red-400 uppercase tracking-widest font-mono text-center">
              🔑 Enter VIP 3 Authorization Key
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
