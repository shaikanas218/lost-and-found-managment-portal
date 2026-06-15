/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  HelpCircle, 
  Globe, 
  Badge, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Sun, 
  Leaf, 
  Monitor, 
  Palette 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserRole } from '../types';
import HCETLogo from './HCETLogo';

interface LoginScreenProps {
  onLogin: (userId: string, passwordEntered: string) => boolean;
  onRegister: (newUser: User) => boolean;
  errorMsg: string | null;
  setErrorMsg: (msg: string | null) => void;
}

type AmbianceMode = 'sky' | 'lawn' | 'aurora' | 'matrix';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  char?: string;
  rotation?: number;
  rotSpeed?: number;
}

export default function LoginScreen({ onLogin, onRegister, errorMsg, setErrorMsg }: LoginScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Background Ambiance state saved local-first
  const [ambiance, setAmbiance] = useState<AmbianceMode>(() => {
    return (localStorage.getItem('hcet_portal_ambiance') as AmbianceMode) || 'sky';
  });

  // Track focused field for dynamic shadow overlays
  const [activeInput, setActiveInput] = useState<string | null>(null);

  // New user registration fields
  const [regName, setRegName] = useState('');
  const [regId, setRegId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    localStorage.setItem('hcet_portal_ambiance', ambiance);
  }, [ambiance]);

  // canvas floating background particles engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    const particleCount = ambiance === 'matrix' ? 80 : 50;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Helper to get ambiance particles colors
    const getParticleColor = () => {
      switch (ambiance) {
        case 'lawn':
          // emerald green / gold mix
          return Math.random() > 0.4 ? '16, 185, 129' : '234, 179, 8';
        case 'aurora':
          // lavender purple / teal mix
          return Math.random() > 0.5 ? '167, 139, 250' : '45, 212, 191';
        case 'matrix':
          // digital fluorescent matrix terminal green
          return '34, 197, 94';
        case 'sky':
        default:
          // sunny golden rays / diamond shimmer
          return Math.random() > 0.4 ? '253, 224, 71' : '255, 255, 255';
      }
    };

    // Initialize particles
    particles = [];
    const hcetLet = ['H', 'C', 'E', 'T'];
    for (let i = 0; i < particleCount; i++) {
      const isChar = Math.random() > 0.70; // 30% chance of particle being an HCET letter
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (ambiance === 'matrix' ? 0.2 : 0.6),
        vy: ambiance === 'matrix' ? (Math.random() * 1.5 + 0.5) : (-Math.random() * 0.4 - 0.2), // Downward rain for matrix, upward drift for others
        alpha: Math.random() * (isChar ? 0.25 : 0.6) + 0.1,
        size: isChar ? (Math.random() * 14 + 10) : (Math.random() * (ambiance === 'matrix' ? 2 : 3) + 0.5),
        color: getParticleColor(),
        char: isChar ? hcetLet[Math.floor(Math.random() * 4)] : undefined,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Support special digital grid wallpaper for Matrix ambiance
      if (ambiance === 'matrix') {
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.03)';
        ctx.lineWidth = 1;
        const spacing = 40;
        for (let x = 0; x < canvas.width; x += spacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += spacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      // Render flowing items
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.rotation !== undefined && p.rotSpeed !== undefined) {
          p.rotation += p.rotSpeed;
        }

        // Wrap boundaries
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }
        if (p.y > canvas.height) {
          p.y = 0;
          p.x = Math.random() * canvas.width;
        }

        if (p.char) {
          ctx.save();
          ctx.translate(p.x, p.y);
          if (p.rotation !== undefined) {
            ctx.rotate(p.rotation);
          }
          ctx.font = `bold ${Math.floor(p.size)}px "Inter", sans-serif`;
          ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
          ctx.shadowBlur = ambiance === 'aurora' ? 10 : 0;
          ctx.shadowColor = `rgba(${p.color}, 0.5)`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.char, 0, 0);
          ctx.restore();
        } else if (ambiance === 'matrix' && Math.random() > 0.98) {
          // Draw random binary strings or HCET characters for visual matrix fidelity
          ctx.font = '8px monospace';
          ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
          const matrixChar = Math.random() > 0.4 ? (Math.random() > 0.5 ? '1' : '0') : ['H', 'C', 'E', 'T'][Math.floor(Math.random() * 4)];
          ctx.fillText(matrixChar, p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
          ctx.shadowBlur = ambiance === 'aurora' ? 6 : 0;
          ctx.shadowColor = `rgba(${p.color}, 0.5)`;
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [ambiance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!id.trim()) {
      setErrorMsg('Please enter your Student/Staff ID.');
      return;
    }
    const success = onLogin(id.trim(), password);
    if (!success && !errorMsg) {
      setErrorMsg('Invalid login credentials. Try "20241001" or "admin".');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!regName.trim() || !regId.trim() || !regEmail.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (!regPassword) {
      setErrorMsg('Please set a password for your account.');
      return;
    }
    if (regPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please verify and try again.');
      return;
    }
    const newUser: User = {
      id: regId.trim(),
      name: regName.trim(),
      email: regEmail.trim(),
      role: regRole,
      department: regDept.trim() || 'General Academics',
      avatar: `https://images.unsplash.com/photo-${regRole === 'admin' ? '1573496359142-b8d87734a5a2' : '1534528741775-53994a69daeb'}?auto=format&fit=crop&q=80&w=150`,
      password: regPassword
    };
    const success = onRegister(newUser);
    if (success) {
      setIsRegistering(false);
      setId(regId);
      setPassword(regPassword);
      setErrorMsg(null);
    } else {
      setErrorMsg('User ID already exists. Please choose a unique one.');
    }
  };

  const autofill = (type: 'student' | 'admin') => {
    setErrorMsg(null);
    if (type === 'student') {
      setId('20241001');
      setPassword('••••••••');
    } else {
      setId('admin');
      setPassword('••••••••');
    }
  };

  // True if active ambiance is a dark category
  const isDarkAmbiance = ambiance === 'aurora' || ambiance === 'matrix';

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden font-sans py-12 transition-colors duration-1000 ${
      isDarkAmbiance ? 'bg-black text-white' : 'bg-neutral-100 text-slate-900'
    }`}>
      {/* 1. Full-bleed Ambient Responsive Background Container */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        
        {/* Sky View */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${ambiance === 'sky' ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-[#00236f]/90 to-indigo-950"></div>
          {/* Drifting blurred deep indigo orbs for dynamic feeling */}
          <div className="absolute top-[10%] left-[20%] w-[45%] aspect-square rounded-full bg-blue-600/10 blur-[130px] animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[20%] w-[40%] aspect-square rounded-full bg-indigo-505/15 blur-[120px] animate-pulse" style={{ animationDelay: '3s' }}></div>
          
          {/* Floating giant vector transparent letters H C E T */}
          <div className="absolute inset-0 opacity-[0.09] overflow-hidden">
            <motion.div 
              animate={{ 
                y: [0, -35, 0],
                x: [0, 25, 0],
                rotate: [0, 8, 0]
              }}
              transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[12%] left-[12%] text-[14rem] font-sans font-black tracking-tight text-white select-none pointer-events-none"
            >
              H
            </motion.div>
            <motion.div 
              animate={{ 
                y: [0, 40, 0],
                x: [0, -30, 0],
                rotate: [0, -12, 0]
              }}
              transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 3 }}
              className="absolute bottom-[18%] left-[28%] text-[13rem] font-sans font-black tracking-tight text-white select-none pointer-events-none"
            >
              C
            </motion.div>
            <motion.div 
              animate={{ 
                y: [0, -30, 0],
                x: [0, -20, 0],
                rotate: [0, 10, 0]
              }}
              transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 6 }}
              className="absolute top-[22%] right-[28%] text-[11rem] font-sans font-black tracking-tight text-white select-none pointer-events-none"
            >
              E
            </motion.div>
            <motion.div 
              animate={{ 
                y: [0, 45, 0],
                x: [0, 15, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 9 }}
              className="absolute bottom-[8%] right-[12%] text-[15rem] font-sans font-black tracking-tight text-white select-none pointer-events-none"
            >
              T
            </motion.div>
          </div>
        </div>

        {/* Lawn View */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${ambiance === 'lawn' ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-emerald-950 to-neutral-900"></div>
          {/* Drifting blurred organic orbs */}
          <div className="absolute top-[15%] right-[10%] w-[45%] aspect-square rounded-full bg-emerald-500/10 blur-[130px] animate-pulse"></div>
          <div className="absolute bottom-[15%] left-[10%] w-[40%] aspect-square rounded-full bg-yellow-600/5 blur-[120px] animate-pulse" style={{ animationDelay: '4s' }}></div>
          
          {/* Floating giant vector green/gold outlines of HCET */}
          <div className="absolute inset-0 opacity-[0.08] overflow-hidden">
            <motion.div 
              animate={{ 
                y: [0, 45, 0],
                x: [0, -20, 0],
                rotate: [0, -10, 0]
              }}
              transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[18%] left-[10%] text-[15rem] font-sans font-black tracking-tight text-emerald-450 select-none pointer-events-none"
            >
              H
            </motion.div>
            <motion.div 
              animate={{ 
                y: [0, -40, 0],
                x: [0, 25, 0],
                rotate: [0, 15, 0]
              }}
              transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 4 }}
              className="absolute bottom-[20%] left-[28%] text-[14rem] font-sans font-black tracking-tight text-yellow-550 select-none pointer-events-none"
            >
              C
            </motion.div>
            <motion.div 
              animate={{ 
                y: [0, 30, 0],
                x: [0, 15, 0],
                rotate: [0, -8, 0]
              }}
              transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 7 }}
              className="absolute top-[15%] right-[28%] text-[12rem] font-sans font-black tracking-tight text-teal-450 select-none pointer-events-none"
            >
              E
            </motion.div>
            <motion.div 
              animate={{ 
                y: [0, -45, 0],
                x: [0, -15, 0],
                rotate: [0, 8, 0]
              }}
              transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 10 }}
              className="absolute bottom-[10%] right-[12%] text-[16rem] font-sans font-black tracking-tight text-emerald-555 select-none pointer-events-none"
            >
              T
            </motion.div>
          </div>
        </div>

        {/* Aurora View (Aesthetic Night Theme) */}
        <div className={`absolute inset-0 transition-opacity duration-1000 bg-slate-950 flex items-center justify-center ${
          ambiance === 'aurora' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Drifting blurred chemical gas orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-indigo-600/20 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-teal-500/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[40%] right-[20%] w-[35%] aspect-square rounded-full bg-purple-500/15 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/80 to-[#122244]/90"></div>
        </div>

        {/* Cyber Matrix View */}
        <div className={`absolute inset-0 transition-opacity duration-1000 bg-zinc-950 ${
          ambiance === 'matrix' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Glowing matrix grid scanline animation */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-950/30 via-zinc-950 to-black"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,_6px_100%] pointer-events-none opacity-40"></div>
        </div>

        {/* 2. Responsive Canvas Particle Overlay */}
        <canvas
          ref={canvasRef}
          id="ambient-particles-canvas"
          className="absolute inset-0 z-10 opacity-75"
        />
      </div>

      {/* 3. Floating Modular Atmosphere Selector Pill */}
      <div className="absolute top-4 right-4 z-30 md:top-6 md:right-6" id="ambiance-selector-dock">
        <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border transition-all duration-500 shadow-lg ${
          isDarkAmbiance 
            ? 'bg-slate-900/80 border-slate-800 text-slate-300 backdrop-blur-md' 
            : 'bg-white/90 border-[#c5c5d3]/50 text-slate-700 backdrop-blur-md'
        }`}>
          <div className="px-2 py-1 text-[10px] font-extrabold tracking-widest uppercase opacity-75 flex items-center gap-1">
            <Palette className="w-3 h-3 text-teal-400 animate-spin-slow" />
            Ambiance:
          </div>

          <button
            onClick={() => setAmbiance('sky')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              ambiance === 'sky'
                ? 'bg-[#00236f] text-white shadow-xs'
                : 'hover:bg-black/10 text-xs'
            }`}
            title="Aesthetic Royal Blue HCET Drift"
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sky Drift</span>
          </button>

          <button
            onClick={() => setAmbiance('lawn')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              ambiance === 'lawn'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'hover:bg-black/10 text-xs'
            }`}
            title="Gilded Emerald HCET Flow"
          >
            <Leaf className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Emerald Flow</span>
          </button>

          <button
            onClick={() => setAmbiance('aurora')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              ambiance === 'aurora'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'hover:bg-black/10 text-xs'
            }`}
            title="Dreamy Midnight Aurora Blur"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Aurora</span>
          </button>

          <button
            onClick={() => setAmbiance('matrix')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              ambiance === 'matrix'
                ? 'bg-green-600 text-neutral-950 shadow-xs'
                : 'hover:bg-white/10 text-xs'
            }`}
            title="Matrix Cyber Grid Space"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Binary</span>
          </button>
        </div>
      </div>

      {/* 4. Main Application Form Wrapper */}
      <main className="relative z-20 w-full max-w-[330px] flex flex-col items-center p-4 md:p-0">
        
        {/* Campus Header with Entrance staggered fade-in */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-4 text-center flex flex-col items-center relative"
        >
          <div className="mb-2 transform hover:rotate-1 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
            <HCETLogo variant="medium" />
          </div>
          <p className="text-[10px] font-extrabold text-white tracking-[0.25em] mt-1.5 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Campus Connect Portal
          </p>
          <p className="text-[10px] text-neutral-250 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            Managing lost & found campus life. Together.
          </p>
        </motion.header>

        {/* Glassmorphic Portal Container Panel */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          className={`w-full border rounded-xl p-4 md:p-5 transition-all duration-500 shadow-[0px_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-lg ${
            isDarkAmbiance
              ? 'bg-slate-950/85 border-slate-800/80'
              : 'bg-white/92 border-white/45'
          }`}
          id="login-glass-card"
        >
          <AnimatePresence mode="wait">
            {!isRegistering ? (
              <motion.div
                key="login-view"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4">
                  <h2 className={`text-xl font-extrabold mb-1 tracking-tight ${isDarkAmbiance ? 'text-white' : 'text-slate-900'}`}>
                    Welcome Back
                  </h2>
                  <p className={`text-[12px] leading-relaxed ${isDarkAmbiance ? 'text-slate-300' : 'text-[#444651]'}`}>
                    Please enter your credentials to access your university portal.
                  </p>
                </div>

                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    id="login-error-alert" 
                    className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-semibold flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                    {errorMsg}
                  </motion.div>
                )}

                <form className="space-y-3" onSubmit={handleSubmit}>
                  <div>
                    <label className={`block text-[11px] font-extrabold uppercase tracking-wider mb-1.5 ${isDarkAmbiance ? 'text-slate-300' : 'text-[#444651]'}`} htmlFor="id">
                      Student / Staff ID
                    </label>
                    <div className="relative">
                      <span className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 ${
                        activeInput === 'id' 
                          ? (ambiance === 'matrix' ? 'text-green-400' : 'text-[#00236f]') 
                          : 'text-slate-400'
                      }`}>
                        <Badge className="w-4 h-4" />
                      </span>
                      <input
                        className={`w-full pl-11 pr-4 py-2 border rounded-lg focus:outline-none transition-all duration-300 text-sm font-medium ${
                          isDarkAmbiance
                            ? `bg-slate-900/60 text-white placeholder-slate-500 border-slate-850 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10`
                            : `bg-white text-slate-900 border-[#c5c5d3] focus:border-[#00236f] focus:ring-4 focus:ring-[#00236f]/10`
                        }`}
                        id="id"
                        name="id"
                        placeholder="Name"
                        type="text"
                        value={id}
                        onFocus={() => setActiveInput('id')}
                        onBlur={() => setActiveInput(null)}
                        onChange={(e) => setId(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-extrabold uppercase tracking-wider mb-1.5 ${isDarkAmbiance ? 'text-slate-300' : 'text-[#444651]'}`} htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <span className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 ${
                        activeInput === 'password'
                          ? (ambiance === 'matrix' ? 'text-green-400' : 'text-[#00236f]')
                          : 'text-slate-400'
                      }`}>
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        className={`w-full pl-11 pr-11 py-2 border rounded-lg focus:outline-none transition-all duration-300 text-sm font-medium ${
                          isDarkAmbiance
                            ? `bg-slate-900/60 text-white placeholder-slate-500 border-slate-850 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10`
                            : `bg-white text-slate-900 border-[#c5c5d3] focus:border-[#00236f] focus:ring-4 focus:ring-[#00236f]/10`
                        }`}
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onFocus={() => setActiveInput('password')}
                        onBlur={() => setActiveInput(null)}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                          isDarkAmbiance ? 'text-slate-400 hover:text-white' : 'text-[#444651]/75 hover:text-[#00236f]'
                        }`}
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input
                        className="w-3.5 h-3.5 rounded border-[#c5c5d3] text-[#00236f] focus:ring-[#00236f]/20 cursor-pointer"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span className={`text-[11px] font-semibold select-none group-hover:opacity-100 transition-opacity ${
                        isDarkAmbiance ? 'text-slate-300' : 'text-[#444651]'
                      }`}>
                        Remember me
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => alert("Credentials bypass: Use Quick Auto-fill chips located right below to log in immediately as Student or Admin!")}
                      className={`text-[11px] font-bold transition-colors ${
                        isDarkAmbiance ? 'text-emerald-400 hover:text-emerald-300' : 'text-[#00236f] hover:text-[#264191]'
                      }`}
                    >
                      Forgot?
                    </button>
                  </div>

                  <button
                    className={`w-full py-2 font-extrabold text-xs rounded-lg shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-1 ${
                      isDarkAmbiance
                        ? ambiance === 'matrix'
                          ? 'bg-green-500 text-neutral-950 hover:bg-green-400 shadow-green-500/10'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/15'
                        : 'bg-[#00236f] text-white hover:bg-[#264191] shadow-[#00236f]/10'
                    }`}
                    type="submit"
                  >
                    <span>Proceed & Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5 animate-bounce-horizontal" />
                  </button>
                </form>

                {/* Quick Academic Bypass Options/Chips */}
                <div className={`mt-3.5 p-3 rounded-lg border ${
                  isDarkAmbiance
                    ? 'bg-slate-900/40 border-slate-800'
                    : 'bg-slate-50 border-[#c5c5d3]/40'
                }`}>
                  <span className={`text-[9px] uppercase tracking-wider font-extrabold block mb-1.5 ${
                    isDarkAmbiance ? 'text-slate-400' : 'text-[#444651]/80'
                  }`}>
                    ⚡ Quick Access Academic Bypass
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => autofill('student')}
                      className={`flex-grow py-1.5 px-2.5 border rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-[0.97] ${
                        isDarkAmbiance
                          ? 'bg-slate-950/40 text-sky-400 border-sky-500/20 hover:bg-sky-500/5'
                          : 'bg-white text-[#00236f] border-[#00236f]/20 hover:bg-[#00236f]/5'
                      }`}
                    >
                      🎓 Student Demo
                    </button>
                    <button
                      onClick={() => autofill('admin')}
                      className={`flex-grow py-1.5 px-2.5 border rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-[0.97] ${
                        isDarkAmbiance
                          ? 'bg-slate-950/40 text-teal-400 border-teal-500/20 hover:bg-teal-500/5'
                          : 'bg-white text-[#006a61] border-[#006a61]/20 hover:bg-[#006a61]/5'
                      }`}
                    >
                      🛡️ Security Admin
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-700/15 text-center">
                  <p className={`text-[11px] ${isDarkAmbiance ? 'text-slate-300' : 'text-[#444651]'}`}>
                    Need a portal account?{' '}
                    <button
                      onClick={() => {
                        setErrorMsg(null);
                        setIsRegistering(true);
                      }}
                      className={`font-extrabold transition-all ml-1 cursor-pointer hover:underline ${
                        isDarkAmbiance ? 'text-emerald-400' : 'text-[#006a61]'
                      }`}
                    >
                      Register Now
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="register-view"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-3.5">
                  <h2 className={`text-xl font-extrabold mb-1 tracking-tight ${isDarkAmbiance ? 'text-white' : 'text-slate-900'}`}>
                    Create Portal Account
                  </h2>
                  <p className={`text-[12px] leading-relaxed ${isDarkAmbiance ? 'text-slate-300' : 'text-[#444651]'}`}>
                    Register on Campus Connect to report, locate, or recover lost student property.
                  </p>
                </div>

                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    id="register-error-alert" 
                    className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-semibold flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                    {errorMsg}
                  </motion.div>
                )}

                <form className="space-y-3.5" onSubmit={handleRegisterSubmit}>
                  <div>
                    <label className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${isDarkAmbiance ? 'text-slate-300' : 'text-[#444651]'}`} htmlFor="regName">
                      Full Legal Name
                    </label>
                    <input
                      className={`w-full px-4 py-2 rounded-xl border focus:outline-none transition-all text-sm font-medium ${
                        isDarkAmbiance
                          ? 'bg-slate-900/60 text-white border-slate-800 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10'
                          : 'bg-white text-slate-900 border-[#c5c5d3] focus:border-[#00236f] focus:ring-4 focus:ring-[#00236f]/10'
                      }`}
                      id="regName"
                      placeholder="e.g. Liam Sterling"
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${isDarkAmbiance ? 'text-slate-300' : 'text-[#444651]'}`} htmlFor="regId">
                        Student / Staff ID
                      </label>
                      <input
                        className={`w-full px-4 py-2 rounded-xl border focus:outline-none transition-all text-sm font-medium ${
                          isDarkAmbiance
                            ? 'bg-slate-900/60 text-white border-slate-800 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10'
                            : 'bg-white text-slate-900 border-[#c5c5d3] focus:border-[#00236f] focus:ring-4 focus:ring-[#00236f]/10'
                        }`}
                        id="regId"
                        placeholder="e.g. 20241099"
                        type="text"
                        required
                        value={regId}
                        onChange={(e) => setRegId(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${isDarkAmbiance ? 'text-slate-300' : 'text-[#444651]'}`}>
                        Account Role
                      </label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none transition-all text-sm font-bold cursor-pointer ${
                          isDarkAmbiance
                            ? 'bg-slate-900 text-white border-slate-800 focus:border-teal-500'
                            : 'bg-white text-slate-900 border-[#c5c5d3] focus:border-[#00236f]'
                        }`}
                      >
                        <option value="student">Student User</option>
                        <option value="admin">Campus security / Staff</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${isDarkAmbiance ? 'text-slate-300' : 'text-[#444651]'}`} htmlFor="regEmail">
                      University Email
                    </label>
                    <input
                      className={`w-full px-4 py-2 rounded-xl border focus:outline-none transition-all text-sm font-medium ${
                        isDarkAmbiance
                          ? 'bg-slate-900/60 text-white border-slate-800 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10'
                          : 'bg-white text-slate-900 border-[#c5c5d3] focus:border-[#00236f] focus:ring-4 focus:ring-[#00236f]/10'
                      }`}
                      id="regEmail"
                      placeholder="username@university.edu"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${isDarkAmbiance ? 'text-slate-300' : 'text-[#444651]'}`} htmlFor="regDept">
                      Academic Department / Department
                    </label>
                    <input
                      className={`w-full px-4 py-2 rounded-xl border focus:outline-none transition-all text-sm font-medium ${
                        isDarkAmbiance
                          ? 'bg-slate-900/60 text-white border-slate-800 focus:border-teal-500'
                          : 'bg-white text-slate-900 border-[#c5c5d3]'
                      }`}
                      id="regDept"
                      placeholder="e.g. Science / Eng. / Business"
                      type="text"
                      value={regDept}
                      onChange={(e) => setRegDept(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${isDarkAmbiance ? 'text-slate-300' : 'text-[#444651]'}`} htmlFor="regPassword">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          className={`w-full pl-4 pr-10 py-2 rounded-xl border focus:outline-none transition-all text-sm font-medium ${
                            isDarkAmbiance
                              ? 'bg-slate-900/60 text-white border-slate-800 focus:border-teal-500'
                              : 'bg-white text-slate-900 border-[#c5c5d3]'
                          }`}
                          id="regPassword"
                          placeholder="••••••••"
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                        />
                        <button
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${isDarkAmbiance ? 'text-slate-300' : 'text-[#444651]'}`} htmlFor="regConfirmPassword">
                        Confirm
                      </label>
                       <input
                        className={`w-full px-3 py-2 rounded-xl border focus:outline-none transition-all text-sm font-medium ${
                          isDarkAmbiance
                            ? 'bg-slate-900/60 text-white border-slate-800 focus:border-teal-500'
                            : 'bg-white text-slate-900 border-[#c5c5d3]'
                        }`}
                        id="regConfirmPassword"
                        placeholder="••••••••"
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full mt-3 py-2 font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                      isDarkAmbiance
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/10'
                        : 'bg-[#006a61] text-white hover:bg-[#005049] shadow-[#006a61]/15'
                    }`}
                  >
                    Create Account & Login
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <button
                    onClick={() => {
                      setErrorMsg(null);
                      setIsRegistering(false);
                    }}
                    className={`text-xs font-extrabold cursor-pointer hover:underline ${
                      isDarkAmbiance ? 'text-indigo-400 hover:text-indigo-300' : 'text-[#00236f] hover:text-[#264191]'
                    }`}
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Access Footer */}
        <footer className="mt-12 text-center space-y-4">
          <div className="flex items-center justify-center gap-6">
            <button title="Help" className={`transition-colors cursor-pointer ${
              isDarkAmbiance ? 'text-slate-400 hover:text-white' : 'text-[#444651] hover:text-[#00236f]'
            }`}>
              <HelpCircle className="w-5 h-5" />
            </button>
            <button title="Language" className={`transition-colors cursor-pointer ${
              isDarkAmbiance ? 'text-slate-400 hover:text-white' : 'text-[#444651] hover:text-[#00236f]'
            }`}>
              <Globe className="w-5 h-5" />
            </button>
            <button title="Privacy Guidelines" className={`transition-colors cursor-pointer ${
              isDarkAmbiance ? 'text-slate-400 hover:text-white' : 'text-[#444651] hover:text-[#00236f]'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </button>
          </div>
          <p className={`text-[10px] font-extrabold uppercase tracking-[0.2em] ${
            isDarkAmbiance ? 'text-slate-500' : 'text-[#444651]/60'
          }`}>
            © 2026 CAMPUS CONNECT ADMINISTRATION
          </p>
        </footer>
      </main>
    </div>
  );
}

