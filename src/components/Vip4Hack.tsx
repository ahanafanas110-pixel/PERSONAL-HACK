import React, { useState, useEffect, useRef } from 'react';
import { Shield } from 'lucide-react';

interface Vip4HackProps {
  onBack: () => void;
  savedPassKey: string;
}

export default function Vip4Hack({ onBack, savedPassKey }: Vip4HackProps) {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return !!savedPassKey;
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Circular State engine variables
  const [timerNum, setTimerNum] = useState('00');
  const [periodNum, setPeriodNum] = useState('000');
  const [resText, setResText] = useState('ANALYZING');
  const [resColor, setResColor] = useState('#00f7ff');

  // Modern pointer dragging coordinates & status
  const [position, setPosition] = useState({ x: 30, y: 180 });
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
      k.vipNum === 4 && 
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
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Orbital Engine Loops
  useEffect(() => {
    if (!isUnlocked) return;

    let isReady = false;
    let lastResult = '';
    let animationFrameId: number;

    const updateEngine = () => {
      const now = new Date();
      const sec = now.getUTCSeconds();
      let sync = 29 - (sec % 30);
      
      setTimerNum(sync < 10 ? '0' + sync : sync.toString());

      const pid = Math.floor(((now.getUTCHours() * 60) + now.getUTCMinutes()) * 2) + (sec >= 30 ? 1 : 0) + 1;
      setPeriodNum(String(pid).slice(-3));

      if (sync <= 2 || sync >= 28) {
        setResText('WAITING...');
        setResColor('#00f7ff'); // Cyan
        isReady = false;
      } else if (!isReady) {
        const sequence = ['BIG', 'BIG', 'SMALL', 'BIG', 'SMALL', 'SMALL', 'BIG', 'SMALL', 'BIG', 'BIG'];
        let result = sequence[pid % 10];
        if (pid % 4 === 0) {
          result = (lastResult === 'BIG') ? 'SMALL' : 'BIG';
        }
        setResText(result);
        setResColor(result === 'BIG' ? '#ffcc00' : '#a855f7'); // Gold or Purple
        lastResult = result;
        isReady = true;
      }

      animationFrameId = requestAnimationFrame(updateEngine);
    };

    updateEngine();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isUnlocked]);

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col items-center justify-center p-4 select-none">
      {isUnlocked ? (
        <>
          {/* Target Game Background Frame */}
          <iframe 
            id="game-frame" 
            src="https://hgnice.biz/#/register?invitationCode=83335233034" 
            className="absolute inset-0 w-full h-full border-none z-0"
          />

          {/* Floating Orbital Drag Container Box */}
          <div 
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className={`fixed z-50 w-[110px] h-[110px] flex items-center justify-center transition-all duration-300 ${
              isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'
            }`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              touchAction: 'none'
            }}
          >
            {/* Animated matrix particles and transparent background */}
            <div className="absolute inset-0 rounded-full bg-transparent flex items-center justify-center pointer-events-none" />

            {/* Custom Trademark Top Badge (SULAIMAN trademark) */}
            <div className="absolute top-[-8px] left-[5px] w-5 h-5 rounded-full border border-orange-500 bg-black z-50 flex items-center justify-center shadow-[0_0_4px_#f97316] overflow-hidden">
              <img 
                src="https://ik.imagekit.io/tsa2ivx6b/images%20(7).jpeg" 
                alt="SULAIMAN LOGO" 
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Fast Telegram launcher indicator */}
            <div className="absolute top-[-8px] right-[5px] w-5 h-5 rounded-full border border-red-500 bg-black z-50 flex items-center justify-center shadow-[0_0_4px_#ef4444] overflow-hidden">
              <a href="https://t.me/+xCmnnFbcYRw4NDZl" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="#ef4444">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.75-.85 3.85-1.2 5.75-.15.8-.45 1.05-.75 1.1-.65.05-1.15-.45-1.75-.85-.95-.65-1.5-1.05-2.45-1.65-1.1-.7-2.35-.45-2.95.1-.25.25-.95.95-1.8 1.8-.75.75-1.25.75-1.65.35-.3-.3-.4-.9-.05-1.75l1.6-4.9c.15-.45-.1-.7-.65-.65-.35 0-1.1.25-1.75.8-.1.05-.3-.15-.2-.35.15-.35.95-1.6 1.7-2.1.85-.5 1.55-.5 1.95-.3.45.2.55.75.4 1.1-.35 1.1-1.1 3.55-.95 4.05.05.15.15.2.25.1.25-.25 1.05-1.05 1.55-1.6.45-.5.7-.9.85-1.1.2-.3.15-.55-.1-.75-.2-.15-.5-.25-.65-.3-.1-.05-.2-.15-.15-.25.05-.1.15-.15.25-.1.7.25 1.25.35 1.6.5.3.1.4.3.35.5z" />
                </svg>
              </a>
            </div>

            {/* Orbit Lines (Centering with absolute coordinates for pixel-perfect browser display) */}
            <div className="absolute left-[calc(50%-48px)] top-[calc(50%-48px)] w-[96px] h-[96px] rounded-full border border-red-500/20 opacity-40 pointer-events-none" />
            <div className="absolute left-[calc(50%-38px)] top-[calc(50%-38px)] w-[76px] h-[76px] rounded-full border border-dashed border-orange-500/30 animate-[spin_12s_linear_infinite] pointer-events-none" />
            <div className="absolute left-[calc(50%-28px)] top-[calc(50%-28px)] w-[56px] h-[56px] rounded-full border border-yellow-500/30 animate-[spin_8s_linear_infinite_reverse] pointer-events-none" />

            {/* Orbiting glowing particles (Balls perfectly positioned and fully visible) */}
            <div className="absolute left-[calc(50%-5px)] top-[calc(50%-5px)] w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_12px_#dc2626,0_0_20px_#dc2626] animate-orbit-cw-slow z-30 pointer-events-none" />
            <div className="absolute left-[calc(50%-5px)] top-[calc(50%-5px)] w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_12px_#f97316,0_0_20px_#f97316] animate-orbit-ccw-fast z-30 pointer-events-none" />
            <div className="absolute left-[calc(50%-5px)] top-[calc(50%-5px)] w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_12px_#facc15,0_0_20px_#facc15] animate-orbit-cw-mid z-30 pointer-events-none" />

            {/* Inner core display circle - SOLID black for supreme contrast */}
            <div className="relative w-[58px] h-[58px] bg-black rounded-full flex flex-col justify-center items-center text-center border-2 border-red-500/80 z-10 p-1 shadow-[0_0_12px_rgba(239,68,68,0.4)]">
              {/* Core Hack diagnostics readout */}
              <div id="hack-view" className="flex flex-col items-center animate-fade-in w-full space-y-0 pointer-events-none">
                <div className="text-[5.5px] font-black text-red-500 font-orbitron tracking-widest uppercase leading-none font-bold">SULAIMAN</div>
                <div className="text-[5px] text-orange-400 font-mono leading-none mt-0.5">PID:#{periodNum}</div>
                
                <div className="text-[13px] font-black font-orbitron text-orange-400 leading-none my-0.5" id="timer">
                  {timerNum}
                </div>
                
                <div 
                  id="res" 
                  className="text-[7.5px] font-black tracking-widest uppercase font-orbitron transition-colors duration-300 leading-none mb-0.5"
                  style={{ color: resColor === 'CYAN' ? '#f97316' : resColor, textShadow: `0 0 5px ${resColor === 'CYAN' ? '#f97316' : resColor}` }}
                >
                  {resText}
                </div>
                <div className="text-[4px] text-orange-400/80 font-mono tracking-widest uppercase font-black">TELEMETRY</div>
              </div>
            </div>

          </div>
        </>
      ) : (
        /* Full screen Lock Gateway screen if not authorized yet */
        <div className="w-full max-w-xs p-6 bg-slate-950 border-2 border-red-500 rounded-3xl shadow-[0_0_35px_rgba(239,68,68,0.4)] text-center relative z-10 animate-fade-in select-none">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl animate-pulse">🛰️</span>
            </div>
          </div>
          <h2 className="font-orbitron text-sm font-black tracking-widest text-white uppercase mb-1">
            SULAIMAN OWN HACK
          </h2>
          <p className="text-[8px] font-mono text-orange-500 uppercase tracking-widest font-bold mb-6">
            VIP MODULE 4 ACCESS GATEWAY
          </p>

          <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-white/5">
            <label className="block text-[10px] font-bold text-red-400 uppercase tracking-widest font-mono text-center">
              🔑 Enter VIP 4 Authorization Key
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

      {/* Control Panel Exit trigger in bottom corner - sleeker and transparent */}
      {isUnlocked && (
        <div className="fixed bottom-4 left-4 z-[1001] flex items-center gap-1">
          <button 
            onClick={onBack}
            className="px-2.5 py-1 bg-red-950/20 backdrop-blur-md hover:bg-red-950/40 text-red-400 hover:text-white border border-red-500/20 rounded-lg text-[8px] font-black tracking-wider uppercase font-orbitron transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
          >
            ← EXIT VIP 4
          </button>
        </div>
      )}

    </div>
  );
}
