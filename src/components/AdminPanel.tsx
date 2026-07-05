import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HackPassword } from '../types';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Users, 
  Key, 
  X, 
  Check, 
  ShieldAlert, 
  RefreshCw, 
  Sliders, 
  Lock, 
  Layers,
  HelpCircle,
  Eye,
  EyeOff,
  Terminal,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';

interface AdminPanelProps {
  passwords: HackPassword[];
  onAddPassword: (vipNum: number, code: string, maxUsers: number, validityHours: string | 'alltime') => void;
  onDeletePassword: (id: string) => void;
  onClose: () => void;
}

export default function AdminPanel({ passwords, onAddPassword, onDeletePassword, onClose }: AdminPanelProps) {
  const [selectedVip, setSelectedVip] = useState<number>(1);
  const [newCode, setNewCode] = useState<string>('');
  const [maxUsers, setMaxUsers] = useState<string>('unlimited');
  const [maxUsersCount, setMaxUsersCount] = useState<number>(10);
  const [validityType, setValidityType] = useState<'alltime' | 'hours' | 'minutes'>('alltime');
  const [validityHours, setValidityHours] = useState<number>(24);
  const [validityMinutes, setValidityMinutes] = useState<number>(30);

  // Admin Authentication State
  const [masterPassword, setMasterPassword] = useState('SADMAN018');
  const [newMasterPassword, setNewMasterPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [decryptionProgress, setDecryptionProgress] = useState(0);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [matrixCols, setMatrixCols] = useState<{ left: string; duration: string; delay: string; text: string }[]>([]);

  // Load master password from server on mount
  useEffect(() => {
    const fetchAdminPassword = async () => {
      try {
        const res = await fetch('/api/admin/password');
        if (res.ok) {
          const data = await res.json();
          if (data.password) {
            setMasterPassword(data.password);
          }
        }
      } catch (e) {
        console.error('Error fetching admin password:', e);
      }
    };
    fetchAdminPassword();
  }, []);

  // Generate Matrix characters on mount
  useEffect(() => {
    const cols = Array.from({ length: 18 }).map((_, idx) => {
      const chars = Array.from({ length: 12 }).map(() => Math.round(Math.random()).toString()).join('\n');
      return {
        left: `${(idx * 5.5) + 3}%`,
        duration: `${5 + Math.random() * 5}s`,
        delay: `${Math.random() * 3}s`,
        text: chars
      };
    });
    setMatrixCols(cols);
  }, []);

  // Admin session check removed for absolute security (always require password on modal open)

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === masterPassword) {
      setIsDecrypting(true);
      setAuthError('');
      setTerminalLogs(['[SYSTEM] Establishing SSH Handshake with root host...']);
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 4;
        if (progress >= 100) {
          setDecryptionProgress(100);
          setTerminalLogs(prev => [...prev, '[SUCCESS] System decrypted. Root privileges granted.']);
          clearInterval(interval);
          setTimeout(() => {
            setIsAdminAuthenticated(true);
            setIsDecrypting(false);
          }, 500);
        } else {
          setDecryptionProgress(progress);
          if (progress === 16) {
            setTerminalLogs(prev => [...prev, '[FIREWALL] Bypassing administrative secure hash gateways...']);
          } else if (progress === 40) {
            setTerminalLogs(prev => [...prev, '[RSA] Decrypting SSL table tokens and active keys...']);
          } else if (progress === 68) {
            setTerminalLogs(prev => [...prev, '[MEM_MAP] Overwriting system registers with exploit payload...']);
          } else if (progress === 88) {
            setTerminalLogs(prev => [...prev, '[ADMIN] Spawning administrative session hooks...']);
          }
        }
      }, 50);
    } else {
      setIsShaking(true);
      setAuthError('ACCESS COMPROMISED - RETRY Master key!');
      setTimeout(() => setIsShaking(false), 800);
    }
  };

  const handleUpdateMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPwd = newMasterPassword.trim();
    if (!newPwd) return;
    
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPwd })
      });
      if (res.ok) {
        setMasterPassword(newPwd);
        setNewMasterPassword('');
        setPasswordChangeSuccess('Password updated successfully!');
        setTimeout(() => setPasswordChangeSuccess(''), 3000);
      }
    } catch (e) {
      console.error('Error updating admin password:', e);
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    let finalExpiry = 'alltime';
    if (validityType === 'hours') {
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + validityHours);
      finalExpiry = expiryDate.toISOString();
    } else if (validityType === 'minutes') {
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + validityMinutes);
      finalExpiry = expiryDate.toISOString();
    }

    const finalMaxUsers = maxUsers === 'unlimited' ? -1 : maxUsersCount;

    onAddPassword(selectedVip, newCode.trim(), finalMaxUsers, finalExpiry);
    setNewCode('');
  };

  const getStatusText = (pw: HackPassword) => {
    const isExpired = pw.validUntil !== 'alltime' && new Date(pw.validUntil) < new Date();
    const isExceeded = pw.maxUsers !== -1 && pw.usedCount >= pw.maxUsers;

    if (isExpired) return <span className="text-red-400 font-semibold text-xs">Expired</span>;
    if (isExceeded) return <span className="text-red-400 font-semibold text-xs">Limit Reached</span>;
    return <span className="text-emerald-400 font-semibold text-xs">Active</span>;
  };

  // Render Gate screen if not authenticated
  if (!isAdminAuthenticated) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-[11000] flex items-center justify-center p-4 overflow-y-auto font-sans select-none">
        {/* Falling Matrix Rain background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
          {matrixCols.map((col, i) => (
            <motion.div 
              key={i} 
              initial={{ y: -200, opacity: 0 }}
              animate={{ y: 800, opacity: [0, 1, 1, 0] }}
              transition={{
                duration: parseFloat(col.duration),
                delay: parseFloat(col.delay),
                repeat: Infinity,
                ease: 'linear'
              }}
              className="absolute text-[9px] font-mono text-emerald-500 font-bold whitespace-pre leading-none"
              style={{ left: col.left }}
            >
              {col.text}
            </motion.div>
          ))}
        </div>

        {/* Ambient background glows */}
        <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />

        {/* Laser scanner element */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-[bounce_4s_ease-in-out_infinite] opacity-35 pointer-events-none z-0" />

        {/* Glowing cyberpunk card box */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={`relative bg-slate-900 border-2 ${authError ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]' : 'border-purple-500 shadow-[0_0_45px_rgba(168,85,247,0.25)]'} rounded-3xl w-full max-w-md p-8 md:p-10 flex flex-col items-center backdrop-blur-sm z-10 ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
        >
          {/* Neon border lines tracing effect */}
          <div className="absolute -top-[2px] -left-[2px] -right-[2px] -bottom-[2px] rounded-3xl border-2 border-transparent bg-gradient-to-r from-purple-500 via-cyan-500 to-indigo-500 [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] opacity-40 pointer-events-none" />

          {/* Top aesthetic crown & lock indicator */}
          <div className="relative mb-6">
            <motion.div 
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 0.95, 1] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 border-2 border-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/20"
            >
              <Lock className="w-8 h-8 text-purple-300 animate-pulse" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 text-2xl drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)]"
            >
              👑
            </motion.div>
          </div>

          <h2 className="text-2xl font-black font-orbitron tracking-[0.25em] text-white uppercase text-center mb-1">
            ADMIN BYPASS
          </h2>
          <p className="text-[10px] text-purple-400 font-mono uppercase tracking-[0.35em] text-center mb-8 font-black">
            SYSTEM CONTROL ACCESS
          </p>

          <AnimatePresence mode="wait">
            {isDecrypting ? (
              <motion.div 
                key="decrypting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-center space-y-4"
              >
                {/* Rotating holographic rings */}
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center mb-2">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/40 animate-[spin_5s_linear_infinite]" />
                  <div className="absolute inset-2 rounded-full border border-purple-500/30 animate-[spin_3s_linear_infinite_reverse]" />
                  <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>

                <div className="space-y-1 bg-slate-950/80 rounded-xl p-3 border border-white/5 font-mono text-left max-h-[110px] overflow-hidden">
                  <p className="text-[9px] text-cyan-400 font-bold uppercase mb-1 tracking-widest flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-cyan-400" /> SULAIMAN MATRIX TERMINAL
                  </p>
                  <div className="space-y-1 max-h-[75px] overflow-y-auto scrollbar-none text-[8px]">
                    {terminalLogs.map((log, idx) => (
                      <div key={idx} className={`${log.includes('[SUCCESS]') ? 'text-emerald-400' : 'text-slate-300'} leading-normal`}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-mono text-cyan-400 tracking-widest font-black uppercase">DECRYPTING SYSTEM MATRIX...</p>
                  <p className="text-2xl font-black font-orbitron text-white">{decryptionProgress}%</p>
                </div>

                <div className="w-full bg-slate-950 h-2.5 rounded-full border border-slate-800 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400"
                    style={{ width: `${decryptionProgress}%` }}
                    transition={{ type: 'spring', stiffness: 80 }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.form 
                key="login-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleAdminLogin} 
                className="w-full space-y-6"
              >
                <div className="space-y-2.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-center font-mono">
                    ENTER MASTER ACCESS KEY
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPass ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••••"
                      className="w-full bg-slate-950/80 border-2 border-slate-800 focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] rounded-2xl px-5 py-4 text-center text-sm font-mono text-white tracking-[0.3em] outline-none transition-all placeholder:text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPass(!showAdminPass)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showAdminPass ? <EyeOff className="w-4 h-4 text-purple-400" /> : <Eye className="w-4 h-4 text-purple-400" />}
                    </button>
                  </div>
                  {authError && (
                    <motion.p 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xs text-red-400 font-mono text-center font-bold animate-pulse mt-1.5"
                    >
                      ⚠️ {authError}
                    </motion.p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black font-orbitron text-xs tracking-[0.18em] rounded-2xl transition-all cursor-pointer shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-300 animate-pulse" /> DECRYPT SYSTEM
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Quick instructions and diagnostic telemetry */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 w-full text-center space-y-3">
            <p className="text-[9px] text-slate-500 font-mono tracking-wider">
              PORT: SECURE CLIENT PORTAL • CORE PLATFORM V3.5
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              type="button"
              onClick={onClose}
              className="text-[11px] text-purple-400 hover:text-purple-300 font-mono hover:underline uppercase tracking-widest font-black block mx-auto cursor-pointer"
            >
              ← CLOSE & ESCAPE
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[11000] flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-slate-900/95 border border-purple-500/30 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl shadow-purple-500/10 relative overflow-hidden">
        
        {/* Animated scanline inside authenticated dashboard */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(138,43,226,0.02)_50%,rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 p-2.5 rounded-xl border border-purple-500/30 shadow-lg shadow-purple-500/5">
              <Sliders className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold font-orbitron tracking-wider text-white flex items-center gap-2">
                SULAIMAN ADMIN <span className="text-purple-400 text-[10px] px-2.5 py-1 rounded-full bg-purple-950 border border-purple-800 font-bold tracking-widest font-mono">ROOT CONTROL</span>
              </h2>
              <p className="text-[11px] text-slate-400">Generate password bounds, manage live expiration indices, and VIP modules</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all border border-slate-800 hover:border-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inner Content Split */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
          
          {/* Create Password Form */}
          <div className="lg:col-span-5 bg-slate-950/40 border border-slate-800 p-6 rounded-2xl h-fit space-y-4">
            <h3 className="font-orbitron text-xs text-purple-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Plus className="w-4 h-4 text-purple-400" /> Issue Premium Key
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* VIP Select */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">Target Hack Module</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSelectedVip(num)}
                      className={`py-2.5 rounded-xl text-xs font-black font-orbitron border transition-all cursor-pointer ${
                        selectedVip === num
                          ? 'bg-purple-600/20 text-purple-300 border-purple-500 shadow-lg shadow-purple-500/5'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      VIP {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">Key / Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-purple-400/50" />
                  </span>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. SULAIMAN-X"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono tracking-wider"
                  />
                </div>
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => setNewCode('SULAIMAN-' + Math.random().toString(36).substring(2, 8).toUpperCase())}
                    className="text-[10px] text-purple-400 hover:underline hover:text-purple-300 font-mono cursor-pointer"
                  >
                    Generate Random Code
                  </button>
                </div>
              </div>

              {/* User Bounds */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">User Bounds</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setMaxUsers('unlimited')}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      maxUsers === 'unlimited'
                        ? 'bg-cyan-600/10 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Unlimited
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaxUsers('limited')}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      maxUsers === 'limited'
                        ? 'bg-cyan-600/10 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Max Bound Limit
                  </button>
                </div>

                {maxUsers === 'limited' && (
                  <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800 animate-slide-down">
                    <span className="text-xs text-slate-400">Limit:</span>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={maxUsersCount}
                      onChange={(e) => setMaxUsersCount(parseInt(e.target.value) || 1)}
                      className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-center text-sm font-semibold text-cyan-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}
              </div>

              {/* Expiry / Time limits */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">Validity Frame</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setValidityType('alltime')}
                    className={`py-2 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer ${
                      validityType === 'alltime'
                        ? 'bg-yellow-600/10 text-yellow-300 border-yellow-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Lifetime
                  </button>
                  <button
                    type="button"
                    onClick={() => setValidityType('hours')}
                    className={`py-2 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer ${
                      validityType === 'hours'
                        ? 'bg-yellow-600/10 text-yellow-300 border-yellow-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => setValidityType('minutes')}
                    className={`py-2 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer ${
                      validityType === 'minutes'
                        ? 'bg-yellow-600/10 text-yellow-300 border-yellow-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Minutes
                  </button>
                </div>

                {validityType === 'hours' && (
                  <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800 animate-slide-down">
                    <span className="text-xs text-slate-400">Hours:</span>
                    <input
                      type="number"
                      min="1"
                      max="8760"
                      value={validityHours}
                      onChange={(e) => setValidityHours(parseInt(e.target.value) || 1)}
                      className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-center text-sm font-semibold text-yellow-300 focus:outline-none focus:border-yellow-500"
                    />
                    <span className="text-[10px] text-slate-500 font-mono">({Math.round(validityHours/24)} Days)</span>
                  </div>
                )}

                {validityType === 'minutes' && (
                  <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800 animate-slide-down">
                    <span className="text-xs text-slate-400">Minutes:</span>
                    <input
                      type="number"
                      min="1"
                      max="525600"
                      value={validityMinutes}
                      onChange={(e) => setValidityMinutes(parseInt(e.target.value) || 1)}
                      className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-center text-sm font-semibold text-yellow-300 focus:outline-none focus:border-yellow-500"
                    />
                    <span className="text-[10px] text-slate-500 font-mono">({Math.round((validityMinutes / 60) * 10) / 10} Hours)</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-orbitron tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-purple-900/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> ADD KEY TO DATABASE
              </button>
            </form>

            {/* Master Key Security Configuration */}
            <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-4 select-none">
              <h4 className="font-orbitron text-[10px] text-purple-400 uppercase tracking-widest font-black flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> MASTER SECURITY PASSKEY
              </h4>
              <form onSubmit={handleUpdateMasterPassword} className="space-y-3">
                <div>
                  <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                    Current: <span className="text-purple-300 font-bold font-mono">{masterPassword}</span>
                  </label>
                  <input
                    type="text"
                    value={newMasterPassword}
                    onChange={(e) => setNewMasterPassword(e.target.value)}
                    placeholder="Set New Master Passkey"
                    className="block w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs placeholder-slate-700 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 rounded-xl text-[10px] font-bold tracking-wider transition-all cursor-pointer"
                  >
                    CHANGE MASTER KEY
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="py-2 px-3 bg-red-950/20 hover:bg-red-950/50 border border-red-900/20 text-red-400 rounded-xl text-[10px] font-bold tracking-wider transition-all cursor-pointer"
                  >
                    LOG OUT
                  </button>
                </div>
                {passwordChangeSuccess && (
                  <p className="text-[10px] text-emerald-400 font-mono text-center animate-pulse">{passwordChangeSuccess}</p>
                )}
              </form>
            </div>
          </div>

          {/* Password Registry Table */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="font-orbitron text-xs text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400 animate-pulse" /> Active Keys List
              </h3>
              <span className="text-xs font-mono text-slate-500 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
                Total Keys: {passwords.length}
              </span>
            </div>

            {passwords.length === 0 ? (
              <div className="flex-1 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
                <Lock className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
                <p className="text-slate-400 text-sm font-semibold mb-1">No Premium Keys Issued</p>
                <p className="text-slate-600 text-xs">Use the Left Control Panel to generate keys for VIP-1 to VIP-4.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-x-auto bg-slate-950/20 border border-slate-850 rounded-2xl max-h-[420px] overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono border-b border-slate-800 sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="py-3 px-4 font-bold text-center">VIP</th>
                      <th className="py-3 px-4 font-bold">Password Key</th>
                      <th className="py-3 px-4 font-bold">Expiration Info</th>
                      <th className="py-3 px-4 font-bold text-center">Used Count</th>
                      <th className="py-3 px-4 font-bold text-center">Status</th>
                      <th className="py-3 px-4 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 font-mono">
                    {passwords.map((pw) => {
                      const isExpired = pw.validUntil !== 'alltime' && new Date(pw.validUntil) < new Date();
                      const expiryLabel = pw.validUntil === 'alltime' 
                        ? '♾️ All Time' 
                        : new Date(pw.validUntil).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                      return (
                        <tr key={pw.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-3 px-4 text-center">
                            <span className="bg-purple-950 border border-purple-500/40 text-purple-300 font-bold px-2 py-0.5 rounded-lg text-[10px]">
                              VIP {pw.vipNum}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-white tracking-wide text-xs">
                            {pw.code}
                          </td>
                          <td className="py-3 px-4 text-slate-400 max-w-[140px] truncate">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-yellow-500/70" />
                              <span className={isExpired ? 'text-red-400 line-through' : ''}>{expiryLabel}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-slate-200">
                            <div className="flex items-center justify-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-cyan-500/70" />
                              <span>
                                {pw.usedCount} / {pw.maxUsers === -1 ? '∞' : pw.maxUsers}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getStatusText(pw)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => onDeletePassword(pw.id)}
                              className="p-1.5 bg-red-950/40 hover:bg-red-900/40 border border-red-900/30 rounded-lg text-red-400 hover:text-red-300 transition-all cursor-pointer"
                              title="Delete Key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Footer info banner */}
        <div className="bg-slate-950/60 p-4 border-t border-slate-800 rounded-b-3xl text-xs text-slate-400 flex items-center gap-3">
          <HelpCircle className="w-4.5 h-4.5 text-purple-400 shrink-0" />
          <span>
            <strong>Note:</strong> Premium Keys will immediately expire and refuse access when they hit their user limit or date. Removing a password terminates current live sessions for that key on the next validation tick.
          </span>
        </div>

      </div>
    </div>
  );
}

