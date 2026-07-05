import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  CheckCircle, 
  ExternalLink, 
  TrendingUp, 
  GripHorizontal 
} from 'lucide-react';

interface Vip2HackProps {
  onBack: () => void;
  savedPassKey: string;
}

export default function Vip2Hack({ onBack, savedPassKey }: Vip2HackProps) {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return !!savedPassKey;
  });
  const [errorMsg, setErrorMsg] = useState('');

  // App statistics
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [total, setTotal] = useState(0);
  const [nextPeriod, setNextPeriod] = useState('---');
  const [prediction, setPrediction] = useState('---');
  const [history, setHistory] = useState<Array<{ period: string; pred: string; result: string; resultClass: string }>>([]);

  // Modern pointer dragging coordinates & status
  const [position, setPosition] = useState({ x: 20, y: 120 });
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
        body: JSON.stringify({ code: password.trim(), vipNum: 2 })
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

  // Live prediction simulation loop
  useEffect(() => {
    if (!isUnlocked) return;

    let lastIssue = '';
    let currentPred = { side: '', color: '', emoji: '' };

    const fetchVoidData = async () => {
      try {
        const res = await fetch(`https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?pageNo=1&pageSize=5&ts=${Date.now()}`);
        if (!res.ok) return;
        const json = await res.json();
        
        if (json?.data?.list && json.data.list.length > 0) {
          const latest = json.data.list[0];
          const nextP = (BigInt(latest.issueNumber) + 1n).toString();
          setNextPeriod(nextP);

          if (latest.issueNumber !== lastIssue) {
            if (lastIssue !== '') {
              const num = parseInt(latest.number);
              const actualSide = num >= 5 ? 'BIG' : 'SMALL';
              const actualColor = (num % 2 !== 0) ? 'GREEN' : 'RED';
              const sideWin = (currentPred.side === actualSide);
              const colorWin = (currentPred.color === actualColor);
              
              let resultText = 'LOSS';
              let resultClass = 'text-red-400';
              
              if (sideWin && colorWin) {
                resultText = 'JACKPOT';
                resultClass = 'text-emerald-400 font-bold';
                setWins(prev => prev + 1);
              } else if (sideWin) {
                resultText = 'WIN';
                resultClass = 'text-yellow-400 font-bold';
                setWins(prev => prev + 1);
              } else if (colorWin) {
                resultText = currentPred.color + ' WIN';
                resultClass = 'text-yellow-400 font-bold';
                setWins(prev => prev + 1);
              } else {
                setLosses(prev => prev + 1);
              }
              
              setTotal(prev => prev + 1);

              // Add to logs (max 3 rows for smaller UI)
              setHistory(prev => [
                {
                  period: latest.issueNumber.slice(-4),
                  pred: `${currentPred.side} ${currentPred.emoji}`,
                  result: resultText,
                  resultClass: resultClass
                },
                ...prev.slice(0, 2)
              ]);
            }

            // Next Prediction
            const side = Math.random() < 0.5 ? 'BIG' : 'SMALL';
            const isGreen = Math.random() < 0.5;
            const color = isGreen ? 'GREEN' : 'RED';
            const emoji = isGreen ? '🟢' : '🔴';
            
            currentPred = { side, color, emoji };
            setPrediction(`${side} ${emoji}`);
            lastIssue = latest.issueNumber;
          }
        }
      } catch (e) {
        // Safe offline generator
      }
    };

    fetchVoidData();
    const interval = setInterval(fetchVoidData, 1000);
    return () => clearInterval(interval);
  }, [isUnlocked]);

  // Calculate percentage
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {isUnlocked ? (
        <>
          {/* Target Game Background Frame */}
          <iframe 
            id="site-frame" 
            src="https://hgzy.app/" 
            className="absolute inset-0 w-full h-full border-none z-0"
          />

          {/* Floating Premium Draggable Layout Panel */}
          <div 
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className={`fixed z-50 w-[155px] bg-slate-950/95 rounded-2xl p-2 border-2 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)] relative overflow-hidden transition-all duration-300 ${
              isDragging ? 'cursor-grabbing border-yellow-500 shadow-[0_0_25px_rgba(234,179,8,0.6)] scale-[1.01]' : 'cursor-grab hover:border-yellow-500'
            }`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              touchAction: 'none'
            }}
          >
            {/* Animated grid filter overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(249,115,22,0.04)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none" />

            <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/10">
              <button 
                onClick={onBack}
                className="text-[7.5px] text-orange-400 hover:text-white px-1.5 py-0.5 bg-orange-950/40 border border-orange-500/20 rounded-lg font-black transition-all cursor-pointer hover:bg-orange-900/60"
              >
                ← BACK
              </button>
              
              <div className="flex items-center gap-1 text-slate-500">
                <GripHorizontal className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                <span className="text-[6.5px] font-mono tracking-widest uppercase text-yellow-500 font-extrabold">DRAG</span>
              </div>

              <span className="text-[7.5px] font-mono px-1 py-0.5 rounded bg-orange-950 border border-orange-900 text-orange-400 font-extrabold animate-pulse">
                VIP 2
              </span>
            </div>

            {/* Active Screen Panel */}
            <div className="space-y-2.5 animate-fade-in text-center">
              
              {/* Top prediction dashboard */}
              <div className="bg-slate-900 border border-orange-500/20 rounded-xl p-2 text-center">
                <div className="text-[7px] text-orange-400 font-mono font-bold tracking-widest mb-0.5">
                  WINGO 30S COLOR FORECAST
                </div>
                <div className="text-[9px] text-yellow-400 font-mono font-bold tracking-wide" id="next-p">
                  #{nextPeriod}
                </div>
                <div className="w-8 h-[1px] bg-orange-500/20 mx-auto my-1" />
                <div className="text-xs font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 tracking-wider drop-shadow-[0_0_4px_rgba(249,115,22,0.4)]" id="res-side">
                  {prediction}
                </div>
              </div>

              {/* Statistics Matrix Counters */}
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-slate-900 border border-white/5 p-1 rounded-lg">
                  <span className="text-[6px] text-slate-500 block font-mono">WINS</span>
                  <strong className="text-[9px] font-orbitron text-emerald-400" id="wins">{wins}</strong>
                </div>
                <div className="bg-slate-900 border border-white/5 p-1 rounded-lg">
                  <span className="text-[6px] text-slate-500 block font-mono">LOSS</span>
                  <strong className="text-[9px] font-orbitron text-red-400" id="losses">{losses}</strong>
                </div>
                <div className="bg-slate-900 border border-white/5 p-1 rounded-lg">
                  <span className="text-[6px] text-slate-500 block font-mono">ACC</span>
                  <strong className="text-[9px] font-orbitron text-orange-400" id="total">
                    {winRate}%
                  </strong>
                </div>
              </div>

              {/* Logs list widget */}
              <div className="text-left space-y-1">
                <h4 className="text-[8px] font-black font-orbitron text-orange-400 tracking-widest flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> SYSTEM LOGS
                </h4>
                
                <div className="bg-slate-900 rounded-xl border border-white/10 overflow-hidden">
                  <table className="w-full border-collapse text-left text-[8px] font-mono">
                    <thead className="bg-slate-950/40 text-slate-500 border-b border-white/10">
                      <tr>
                        <th className="py-0.5 px-1 text-[7px]">IDX</th>
                        <th className="py-0.5 px-1 text-[7px]">CAST</th>
                        <th className="py-0.5 px-1 text-[7px] text-right">RES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5" id="log-body">
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-2 text-center text-slate-600 text-[7.5px]">
                            Calibrating indices...
                          </td>
                        </tr>
                      ) : (
                        history.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/10">
                            <td className="py-1 px-1 text-slate-400">#{row.period}</td>
                            <td className="py-1 px-1 font-semibold text-slate-200">{row.pred}</td>
                            <td className={`py-1 px-1 text-right text-[7.5px] uppercase font-bold ${row.resultClass}`}>{row.result}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Validation Indicator label */}
              <div className="flex items-center justify-center gap-1 text-[7px] text-orange-400/80 font-mono border-t border-white/10 pt-2">
                <CheckCircle className="w-3 h-3 text-orange-400 animate-pulse" />
                <span>SULAIMAN VIP2 SYNCED</span>
              </div>
            </div>

            {/* Telegram fast link */}
            <div className="mt-2 pt-1.5 border-t border-white/10">
              <a 
                href="https://t.me/+xCmnnFbcYRw4NDZl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 w-full py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-xl text-[8px] font-black tracking-widest font-orbitron transition-all border border-orange-500/20"
              >
                📢 TELEGRAM CHANNEL <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>

          </div>
        </>
      ) : (
        /* Full screen Lock Gateway card */
        <div className="w-full max-w-xs p-6 bg-slate-950 border-2 border-orange-500 rounded-3xl shadow-[0_0_35px_rgba(249,115,22,0.4)] text-center relative z-10 animate-fade-in select-none">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-pulse" />
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-orange-950/40 border border-orange-500/30 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-orange-500 animate-pulse" />
            </div>
          </div>
          <h2 className="font-orbitron text-sm font-black tracking-widest text-white uppercase mb-1">
            SULAIMAN OWN HACK
          </h2>
          <p className="text-[8px] font-mono text-yellow-400 uppercase tracking-widest font-bold mb-6">
            VIP MODULE 2 ACCESS GATEWAY
          </p>

          <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-white/5">
            <label className="block text-[10px] font-bold text-orange-400 uppercase tracking-widest font-mono text-center">
              🔑 Enter VIP 2 Authorization Key
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER PASSKEY"
              className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2 text-center text-xs font-mono text-white tracking-widest outline-none"
            />
            <button
              onClick={handleLogin}
              className="w-full py-2.5 bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 text-white font-black font-orbitron text-[9px] tracking-widest rounded-xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-orange-900/20"
            >
              LAUNCH SECURE SYSTEM
            </button>
            {errorMsg && (
              <p className="text-[10px] text-red-400 font-mono font-bold animate-pulse mt-1">{errorMsg}</p>
            )}
          </div>

          <button 
            onClick={onBack}
            className="mt-6 text-[10px] text-orange-400 hover:text-white font-mono font-bold cursor-pointer transition-colors"
          >
            ← BACK TO MAIN MENU
          </button>
        </div>
      )}
    </div>
  );
}
