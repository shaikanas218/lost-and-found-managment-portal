/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, LogOut, User as UserIcon, PlusCircle, History, LayoutDashboard, Shield, ShieldAlert, Check, ToggleLeft, Palette, Sun, Leaf, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LostItem, VerificationClaim, Notification, UserRole } from './types';
import { DEFAULT_USERS, DEFAULT_ITEMS, DEFAULT_CLAIMS } from './data';

import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import ReportScreen from './components/ReportScreen';
import AdminScreen from './components/AdminScreen';
import HistoryScreen from './components/HistoryScreen';
import ProfileScreen from './components/ProfileScreen';
import HCETLogo from './components/HCETLogo';

export default function App() {
  // Global States persisted in LocalStorage for 100% reliability
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [items, setItems] = useState<LostItem[]>([]);
  const [claims, setClaims] = useState<VerificationClaim[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Navigation tabs: 'dashboard' | 'report' | 'history' | 'profile' | 'admin'
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [reportPresetType, setReportPresetType] = useState<'lost' | 'found' | null>(null);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ambiance mode for background
  const [ambiance, setAmbiance] = useState<'sky' | 'lawn' | 'aurora' | 'matrix'>(() => {
    return (localStorage.getItem('hcet_portal_ambiance') as any) || 'sky';
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keep synced with localStorage changes from login screen or switcher
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('hcet_portal_ambiance');
      if (stored) setAmbiance(stored as any);
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleAmbianceChange = (newMode: 'sky' | 'lawn' | 'aurora' | 'matrix') => {
    setAmbiance(newMode);
    localStorage.setItem('hcet_portal_ambiance', newMode);
    window.dispatchEvent(new Event('storage'));
  };

  interface BackendParticle {
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
    isHcSeq?: boolean;
    charIndex?: number;
    locked?: boolean;
    hasPausedThisCycle?: boolean;
  }

  // Backstage canvas floating background particles engine
  useEffect(() => {
    if (!currentUser) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: BackendParticle[] = [];
    let globalPauseTimer = 90; // about 1.5 seconds at 60 FPS
    const particleCount = 20; // optimal density of ambient stars so they look premium

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const getParticleColor = () => {
      switch (ambiance) {
        case 'lawn': return Math.random() > 0.4 ? '16, 185, 129' : '234, 179, 8';
        case 'aurora': return Math.random() > 0.5 ? '167, 139, 250' : '45, 212, 191';
        case 'matrix': return '34, 197, 94';
        case 'sky':
        default: return Math.random() > 0.4 ? '14, 165, 233' : '234, 179, 8';
      }
    };

    particles = [];

    // Add standard background ambient dots
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (ambiance === 'matrix' ? 0.15 : 0.4),
        vy: ambiance === 'matrix' ? (Math.random() * 0.8 + 0.3) : (-Math.random() * 0.25 - 0.1),
        alpha: Math.random() * 0.12 + 0.04,
        size: Math.random() * 2 + 0.5,
        color: getParticleColor(),
        isHcSeq: false,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.005
      });
    }

    const draw = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (ambiance === 'matrix') {
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.02)';
        ctx.lineWidth = 1;
        const spacing = 60;
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

      particles.forEach((p) => {
        // Standard ambient dot drift update
        p.x += p.vx;
        p.y += p.vy;

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

        if (p.rotation !== undefined && p.rotSpeed !== undefined) {
          p.rotation += p.rotSpeed;
        }

        if (ambiance === 'matrix' && Math.random() > 0.99) {
          ctx.font = '7px monospace';
          ctx.fillStyle = `rgba(${p.color}, ${p.alpha * 0.5})`;
          ctx.fillText(Math.random() > 0.5 ? '1' : '0', p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
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
  }, [ambiance, currentUser]);

  // Load from local storage
  useEffect(() => {
    // Users
    const storedUsers = localStorage.getItem('cc_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers(DEFAULT_USERS);
      localStorage.setItem('cc_users', JSON.stringify(DEFAULT_USERS));
    }

    // Active User Session
    const storedSession = localStorage.getItem('cc_current_user');
    if (storedSession) {
      const user = JSON.parse(storedSession);
      setCurrentUser(user);
      // Route admin instantly to admin queue, students to student dashboard
      setActiveTab(user.role === 'admin' ? 'admin' : 'dashboard');
    }

    // Reported Items
    const storedItems = localStorage.getItem('cc_items');
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    } else {
      setItems(DEFAULT_ITEMS);
      localStorage.setItem('cc_items', JSON.stringify(DEFAULT_ITEMS));
    }

    // Ownership Verification Claims
    const storedClaims = localStorage.getItem('cc_claims');
    if (storedClaims) {
      setClaims(JSON.parse(storedClaims));
    } else {
      setClaims(DEFAULT_CLAIMS);
      localStorage.setItem('cc_claims', JSON.stringify(DEFAULT_CLAIMS));
    }

    // Welcome Notifications Setup
    const storedNotifs = localStorage.getItem('cc_notifications');
    if (storedNotifs) {
      setNotifications(JSON.parse(storedNotifs));
    } else {
      const initialNotifs: Notification[] = [
        {
          id: 'notif-1',
          userId: 'all',
          title: 'Welcome to Campus Connect!',
          message: 'Securely report lost items, verify ownership, and track physical releases in real-time.',
          type: 'info',
          isRead: false,
          timestamp: 'Just now',
        },
        {
          id: 'notif-2',
          userId: 'admin',
          title: 'New Claims Pending Review',
          message: 'There are 4 active ownership claims awaiting secure release validation.',
          type: 'alert',
          isRead: false,
          timestamp: '2h ago',
        }
      ];
      setNotifications(initialNotifs);
      localStorage.setItem('cc_notifications', JSON.stringify(initialNotifs));
    }
  }, []);

  // Login handler
  const handleLogin = (id: string, passwordEntered: string): boolean => {
    const userMatch = users.find(u => u.id === id);
    if (userMatch) {
      // Check password matching
      const savedPassword = userMatch.password;
      const isDefaultUser = ['20241001', '20241002', '20241003', '20241004', 'admin'].includes(id);

      // Validation logic:
      if (savedPassword) {
        if (savedPassword !== passwordEntered) {
          setErrorMsg('Incorrect password for this user ID.');
          return false;
        }
      } else if (isDefaultUser) {
        // Default users can use 'password', '••••••••', or empty/custom if autofilled
        const acceptableDefaults = ['password', '••••••••', ''];
        if (passwordEntered && !acceptableDefaults.includes(passwordEntered)) {
          setErrorMsg('Invalid password. For default accounts, use "password" or click the Quick Auto-fill chips.');
          return false;
        }
      }

      setCurrentUser(userMatch);
      localStorage.setItem('cc_current_user', JSON.stringify(userMatch));
      setActiveTab(userMatch.role === 'admin' ? 'admin' : 'dashboard');
      setErrorMsg(null);
      return true;
    }
    return false;
  };

  // Register new accounts
  const handleRegister = (newUser: User): boolean => {
    const userExists = users.some(u => u.id === newUser.id);
    if (userExists) return false;

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('cc_users', JSON.stringify(updatedUsers));

    // Automatically log in
    setCurrentUser(newUser);
    localStorage.setItem('cc_current_user', JSON.stringify(newUser));
    setActiveTab(newUser.role === 'admin' ? 'admin' : 'dashboard');
    
    // Add welcome notification
    const welcomeNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: newUser.id,
      title: 'Account Registered!',
      message: `Welcome, ${newUser.name}. You are logged in with student ID card ${newUser.id}.`,
      type: 'success',
      isRead: false,
      timestamp: 'Just now',
    };
    const updatedNotifs = [welcomeNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem('cc_notifications', JSON.stringify(updatedNotifs));

    return true;
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cc_current_user');
    setActiveTab('dashboard');
    setShowNotifDropdown(false);
  };

  // Profile update handler
  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('cc_current_user', JSON.stringify(updatedUser));
    
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('cc_users', JSON.stringify(updatedUsers));
  };

  // Submit a new Lost or Found report
  const handleAddReport = (newItemData: Omit<LostItem, 'id' | 'createdAt' | 'status'> & { status: 'lost' | 'found' | 'pending' }) => {
    const newItem: LostItem = {
      ...newItemData,
      id: `item-${Date.now()}`,
      createdAt: 'Today',
    };
    const updatedItems = [newItem, ...items];
    setItems(updatedItems);
    localStorage.setItem('cc_items', JSON.stringify(updatedItems));

    // Push notification log
    const reportNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: currentUser?.id || 'all',
      title: 'Report Logged Successfully',
      message: `Your item "${newItem.name}" is officially logged in public listings.`,
      type: 'success',
      isRead: false,
      timestamp: 'Just now',
    };
    const updatedNotifs = [reportNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem('cc_notifications', JSON.stringify(updatedNotifs));
  };

  // Claim ownership of found items
  const handleClaimItem = (itemId: string, itemName: string, itemImage: string, proof: string) => {
    if (!currentUser) return;
    
    const newClaim: VerificationClaim = {
      id: `claim-${Date.now()}`,
      itemId,
      itemName,
      itemImage,
      claimantId: currentUser.id,
      claimantName: currentUser.name,
      claimantStudentId: currentUser.id,
      description: proof,
      timestamp: 'Just now',
      status: 'pending',
      locationMatch: true,
    };

    const updatedClaims = [newClaim, ...claims];
    setClaims(updatedClaims);
    localStorage.setItem('cc_claims', JSON.stringify(updatedClaims));

    // Update item status to pending so it flags in system
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return { ...item, status: 'pending' as const };
      }
      return item;
    });
    setItems(updatedItems);
    localStorage.setItem('cc_items', JSON.stringify(updatedItems));

    // Create a student log and admin alarm notification
    const studentNotif: Notification = {
      id: `notif-s-${Date.now()}`,
      userId: currentUser.id,
      title: 'Ownership Claim Lodged',
      message: `Your verification certificate is processing. Standard admin cross-examination takes up to 24h.`,
      type: 'info',
      isRead: false,
      timestamp: 'Just now',
    };

    const adminAlarmNotif: Notification = {
      id: `notif-a-${Date.now()}`,
      userId: 'admin',
      title: 'New Ownership Request Filed',
      message: `Student ${currentUser.name} claimed the found item "${itemName}".`,
      type: 'alert',
      isRead: false,
      timestamp: 'Just now',
    };

    const updatedNotifs = [studentNotif, adminAlarmNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem('cc_notifications', JSON.stringify(updatedNotifs));
  };

  // Resolve an ownership claim (Approve/Reject)
  const handleResolveClaim = (claimId: string, itemId: string, action: 'approved' | 'rejected') => {
    const claimMatch = claims.find(c => c.id === claimId);
    if (!claimMatch) return;

    // 1. Update claim status
    const updatedClaims = claims.map(c => {
      if (c.id === claimId) {
        return { ...c, status: action === 'approved' ? 'approved' as const : 'rejected' as const };
      }
      return c;
    });
    setClaims(updatedClaims);
    localStorage.setItem('cc_claims', JSON.stringify(updatedClaims));

    // 2. Update item status to resolved if approved, otherwise restore to found
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return { ...item, status: action === 'approved' ? 'resolved' as const : 'found' as const };
      }
      return item;
    });
    setItems(updatedItems);
    localStorage.setItem('cc_items', JSON.stringify(updatedItems));

    // 3. Create real notification for matching student claimant
    const finalMsg = action === 'approved' 
      ? `APPROVED! Pickup your item from Room 102 Administrative Block.`
      : `DECLINED. The credentials do not align with item factors.`;

    const userResolutionNotif: Notification = {
      id: `notif-res-${Date.now()}`,
      userId: claimMatch.claimantId,
      title: `Ownership Claim for "${claimMatch.itemName}" is ${action.toUpperCase()}`,
      message: finalMsg,
      type: action === 'approved' ? 'success' : 'alert',
      isRead: false,
      timestamp: 'Just now',
    };

    const updatedNotifs = [userResolutionNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem('cc_notifications', JSON.stringify(updatedNotifs));
  };

  // Read notification handler
  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    localStorage.setItem('cc_notifications', JSON.stringify(updated));
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => {
    if (currentUser?.role === 'admin') {
      return !n.isRead && (n.userId === 'admin' || n.userId === 'all');
    }
    return !n.isRead && (n.userId === currentUser?.id || n.userId === 'all');
  }).length;

  // Filter current active user's notifications
  const activeUserNotifs = notifications.filter(n => {
    if (currentUser?.role === 'admin') {
      return n.userId === 'admin' || n.userId === 'all';
    }
    return n.userId === currentUser?.id || n.userId === 'all';
  });

  // Render Login page if no logged-in session exists
  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
      />
    );
  }

  // Set style based on current tab selection
  const isDarkAmbiance = ambiance === 'aurora' || ambiance === 'matrix';

  const getRootBgClass = () => {
    switch (ambiance) {
      case 'lawn':
        return 'bg-gradient-to-tr from-[#f3f9f5] via-[#e8f5ed] to-[#fcfdfa] text-slate-900';
      case 'aurora':
        return 'bg-gradient-to-tr from-[#0a0614] via-[#101226] to-[#170a24] text-slate-100';
      case 'matrix':
        return 'bg-gradient-to-b from-[#010a01] via-[#041104] to-[#010801] text-green-400';
      case 'sky':
      default:
        return 'bg-gradient-to-tr from-slate-50 via-[#ecf2fa] to-blue-50/40 text-slate-900';
    }
  };

  const navItemClass = (tabName: string) => {
    if (isDarkAmbiance) {
      const activeColor = ambiance === 'matrix' ? 'text-green-400 border-green-500' : 'text-fuchsia-400 border-fuchsia-500';
      return activeTab === tabName
        ? `${activeColor} font-bold border-b-2 py-1.5`
        : 'text-slate-400 hover:text-white font-medium py-1.5 transition-colors';
    }
    const activeColor = ambiance === 'lawn' ? 'text-emerald-700 border-emerald-600' : 'text-[#00236f] border-[#00236f]';
    return activeTab === tabName
      ? `${activeColor} font-bold border-b-2 py-1.5`
      : 'text-gray-500 hover:text-gray-800 font-medium py-1.5 transition-colors';
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 flex flex-col font-sans select-none relative overflow-x-hidden ${getRootBgClass()}`}>
      
      {/* BACKEND MAIN CANVAS BACKDROP WITH DRIFTING HCET LETTERS & STARS */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Dynamic Header top-bar */}
      <header className={`border-b transition-all duration-500 w-full sticky top-0 z-40 shadow-xs backdrop-blur-md ${
        isDarkAmbiance 
          ? 'bg-slate-950/80 border-slate-800/80 text-white' 
          : 'bg-white/80 border-[#c5c5d3]/40 text-[#00236f]'
      }`}>
        <div className="max-w-[1200px] mx-auto flex justify-between items-center px-4 md:px-8 h-16 w-full relative z-10">
          
          {/* Left layout alignment */}
          <div className="flex items-center gap-3">
            <HCETLogo variant="small" />
            <span className={`text-[15px] font-extrabold tracking-wider hidden sm:inline-block border-l pl-3 transition-all duration-500 ${
              isDarkAmbiance ? 'text-slate-300 border-slate-800' : 'text-[#00236f] border-gray-200'
            }`}>
              Campus Connect
            </span>
          </div>

          {/* Center items on desktop screens */}
          <div className="hidden md:flex gap-8 items-center text-sm">
            {currentUser.role === 'admin' ? (
              <button
                onClick={() => setActiveTab('admin')}
                className={navItemClass('admin')}
              >
                Verification approvals
              </button>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={navItemClass('dashboard')}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('report')}
                  className={navItemClass('report')}
                >
                  Report Item
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={navItemClass('history')}
                >
                  My History
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('profile')}
              className={navItemClass('profile')}
            >
              My Profile
            </button>
          </div>

          {/* Right quick notifications tray & ambiance switcher */}
          <div className="flex items-center gap-4 relative">
            
            {/* INLINE REAL-TIME AMBIANCE CONTROLLER */}
            <div className={`flex items-center gap-2 border rounded-full px-2.5 py-1.5 transition-all duration-300 ${
              isDarkAmbiance ? 'bg-slate-900/90 border-slate-800/85' : 'bg-gray-100/90 border-gray-250/70'
            }`} title="Sync Ambiance">
              <Palette className={`w-3.5 h-3.5 transition-colors duration-300 ${isDarkAmbiance ? 'text-green-400' : 'text-[#00236f]'}`} />
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAmbianceChange('sky')}
                  className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-[1.3] ${
                    ambiance === 'sky' 
                      ? 'bg-blue-500 ring-2 ring-white scale-110' 
                      : 'bg-blue-300 opacity-50 hover:opacity-100'
                  }`}
                  title="Aesthetic Royal Sky"
                />
                <button
                  onClick={() => handleAmbianceChange('lawn')}
                  className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-[1.3] ${
                    ambiance === 'lawn' 
                      ? 'bg-emerald-600 ring-2 ring-white scale-110' 
                      : 'bg-emerald-400 opacity-50 hover:opacity-100'
                  }`}
                  title="Emerald HCET Flow"
                />
                <button
                  onClick={() => handleAmbianceChange('aurora')}
                  className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-[1.3] ${
                    ambiance === 'aurora' 
                      ? 'bg-fuchsia-500 ring-2 ring-white scale-110' 
                      : 'bg-fuchsia-400 opacity-50 hover:opacity-100'
                  }`}
                  title="Celestial Twilight Aurora"
                />
                <button
                  onClick={() => handleAmbianceChange('matrix')}
                  className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-[1.3] ${
                    ambiance === 'matrix' 
                      ? 'bg-green-500 ring-2 ring-white scale-110' 
                      : 'bg-green-400 opacity-50 hover:opacity-100'
                  }`}
                  title="Matrix Terminal Rain"
                />
              </div>
            </div>

            {/* Role indicator chip */}
            <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase border transition-all duration-300 ${
              isDarkAmbiance 
                ? 'bg-slate-900/80 text-slate-300 border-slate-800' 
                : 'bg-[#eceef0]/90 text-[#00236f] border-[#c0c0d0]/40'
            }`}>
              {currentUser.role === 'admin' ? '🛡️ Admin' : '🎓 Student'}
            </span>

            {/* Notification button dropdown trigger */}
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className={`p-2 cursor-pointer transition-colors rounded-full relative outline-none ${
                isDarkAmbiance ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
              }`}
              title="Notifications"
            >
              <Bell className={`w-5.5 h-5.5 transition-colors duration-300 ${isDarkAmbiance ? 'text-slate-200' : 'text-[#00236f]'}`} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-650 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-bold animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Container */}
            {showNotifDropdown && (
              <div className={`absolute right-0 top-12 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden text-xs max-h-[400px] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 ${
                isDarkAmbiance 
                  ? 'bg-slate-900 border-slate-800 text-slate-100' 
                  : 'bg-white border-[#c5c5d3]/60 text-slate-800'
              }`}>
                <div className={`p-4 border-b flex justify-between items-center ${
                  isDarkAmbiance ? 'bg-slate-950/80 border-slate-800' : 'bg-[#f2f4f6]/50 border-gray-100'
                }`}>
                  <span className={`font-bold ${isDarkAmbiance ? 'text-slate-200' : 'text-[#00236f]'}`}>My Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[#006a61] hover:underline hover:text-[#005049] text-[10px] font-bold uppercase tracking-wider"
                    >
                      Clear Unreads
                    </button>
                  )}
                </div>

                <div className={`overflow-y-auto flex-1 divide-y ${isDarkAmbiance ? 'divide-slate-800' : 'divide-gray-100'}`}>
                  {activeUserNotifs.length === 0 ? (
                    <p className={`text-center py-8 font-semibold font-sans ${isDarkAmbiance ? 'text-slate-500' : 'text-gray-400'}`}>No notifications</p>
                  ) : (
                    activeUserNotifs.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3.5 space-y-1 transition-colors relative ${
                          isDarkAmbiance ? 'hover:bg-slate-800/60' : 'hover:bg-[#f2f4f6]/40'
                        } ${
                          !notif.isRead 
                            ? (isDarkAmbiance ? 'bg-slate-800/40 border-l-4 border-emerald-500' : 'bg-indigo-50/40 border-l-4 border-[#00236f]') 
                            : ''
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p className={`font-bold tracking-tight ${isDarkAmbiance ? 'text-slate-200' : 'text-gray-800'}`}>{notif.title}</p>
                          <span className="text-[9px] text-gray-400 shrink-0">{notif.timestamp}</span>
                        </div>
                        <p className={isDarkAmbiance ? 'text-slate-400 leading-normal' : 'text-gray-500 leading-normal'}>{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Container Wrapper */}
      <main className="max-w-[1240px] w-full mx-auto px-4 md:px-8 py-6 pb-28 md:pb-12 flex-grow relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {activeTab === 'dashboard' && (
              <DashboardScreen
                items={items}
                currentUser={currentUser}
                onClaimItem={handleClaimItem}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                myClaims={claims.filter(c => c.claimantId === currentUser.id).map(c => c.itemId)}
                onNewReportWithType={(type) => {
                  setReportPresetType(type);
                  setActiveTab('report');
                }}
              />
            )}

            {activeTab === 'report' && (
              <ReportScreen
                currentUser={currentUser}
                onAddReport={handleAddReport}
                setActiveTab={setActiveTab}
                presetType={reportPresetType}
                clearPresetType={() => setReportPresetType(null)}
              />
            )}

            {activeTab === 'history' && (
              <HistoryScreen
                currentUser={currentUser}
                items={items}
                claims={claims}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileScreen
                currentUser={currentUser}
                onLogout={handleLogout}
                onUpdateUser={handleUpdateUser}
              />
            )}

            {activeTab === 'admin' && (
              <AdminScreen
                claims={claims}
                items={items}
                users={users}
                onResolveClaim={handleResolveClaim}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom navbar for mobile/touch screens */}
      <nav className={`fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-4 pb-safe border-t shadow-xl z-40 rounded-t-2xl md:hidden transition-all duration-500 ${
        isDarkAmbiance 
          ? 'bg-slate-950/90 border-slate-800 text-white shadow-2xl backdrop-blur-md' 
          : 'bg-white/95 border-[#c5c5d3]/40 text-slate-800 backdrop-blur-md'
      }`}>
        {currentUser.role === 'admin' ? (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center text-xs font-semibold px-4 py-1.5 rounded-xl transition-all ${
              activeTab === 'admin' 
                ? (isDarkAmbiance ? 'bg-green-950/60 text-green-400 border border-green-500/30' : 'bg-[#86f2e4]/45 text-[#005049]')
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span>Approvals</span>
          </button>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center text-xs font-semibold px-4 py-1.5 rounded-xl transition-all ${
                activeTab === 'dashboard' 
                  ? (isDarkAmbiance 
                      ? (ambiance === 'matrix' ? 'bg-green-950/60 text-green-400 border border-green-500/30' : 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30')
                      : 'bg-indigo-55 text-[#00236f]') 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => setActiveTab('report')}
              className={`flex flex-col items-center justify-center text-xs font-semibold px-4 py-1.5 rounded-xl transition-all ${
                activeTab === 'report' 
                  ? (isDarkAmbiance 
                      ? (ambiance === 'matrix' ? 'bg-green-950/60 text-green-400 border border-green-500/30' : 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30')
                      : 'bg-indigo-55 text-[#00236f]') 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <PlusCircle className="w-5 h-5 mb-0.5" />
              <span>Report</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center justify-center text-xs font-semibold px-4 py-1.5 rounded-xl transition-all ${
                activeTab === 'history' 
                  ? (isDarkAmbiance 
                      ? (ambiance === 'matrix' ? 'bg-green-950/60 text-green-400 border border-green-500/30' : 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30')
                      : 'bg-indigo-55 text-[#00236f]') 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <History className="w-5 h-5 mb-0.5" />
              <span>History</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center text-xs font-semibold px-4 py-1.5 rounded-xl transition-all ${
            activeTab === 'profile' 
              ? (isDarkAmbiance 
                  ? (ambiance === 'matrix' ? 'bg-green-950/60 text-green-400 border border-green-500/30' : 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30')
                  : 'bg-indigo-55 text-[#00236f]') 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <UserIcon className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </button>
      </nav>

    </div>
  );
}
