import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Zap,
  ArrowRight,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  Bell,
  CheckCircle2,
  FileText,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MagneticButton } from './MagneticButton';

interface LandingNavbarProps {
  onNavigate: (route: string) => void;
  onOpenDemo?: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onNavigate,
  onOpenDemo,
}) => {
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Scroll listener for dynamic glass behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside and ESC key listener for popups
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileDropdownOpen(false);
        setNotificationsOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleStartNow = () => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    if (user) {
      onNavigate('/dashboard');
    } else {
      onNavigate('/login?redirect=/dashboard');
    }
  };

  const handleSignIn = () => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    onNavigate('/login?redirect=/dashboard');
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    logout();
    onNavigate('/');
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-[#070A0F]/90 backdrop-blur-2xl border-b border-slate-200/90 dark:border-slate-800/90 shadow-sm'
          : 'bg-white/40 dark:bg-[#070A0F]/40 backdrop-blur-md border-b border-slate-200/40 dark:border-slate-800/40'
      }`}
    >
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            onNavigate('/');
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/40 text-cyan-600 dark:text-cyan-400 shadow-xs group-hover:border-cyan-500 transition-all">
            <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-wider text-slate-900 dark:text-slate-100 font-mono flex items-center gap-1.5">
              THREATLENS <span className="text-cyan-600 dark:text-cyan-400">AI</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider -mt-1 hidden sm:inline">
              CYBER DEFENSE INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-mono">
          <button
            onClick={() => scrollToSection('features')}
            className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            Defense Vectors
          </button>
          <button
            onClick={() => scrollToSection('pipeline')}
            className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            Intelligence Engine
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            Architecture
          </button>
          <button
            onClick={() => scrollToSection('security')}
            className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            Trust & Ethics
          </button>
          {onOpenDemo && (
            <button
              onClick={onOpenDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors font-semibold cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Interactive Demo</span>
            </button>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Telemetry / Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              id="landing-notif-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors relative cursor-pointer"
              title="Live Telemetry Feed"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 ring-2 ring-white dark:ring-[#070A0F]" />
            </button>

            {/* Notification Glass Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-dropdown p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                      TELEMETRY HUB
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                    ALL ACTIVE
                  </span>
                </div>

                <div className="mt-3 space-y-2.5 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>RADAR ENGINE</span>
                      <span>JUST NOW</span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-semibold text-[11px]">
                      Quad-vector threat scanning heuristics operational.
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>AI REASONING</span>
                      <span>2m AGO</span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-semibold text-[11px]">
                      Gemini 2.5 Flash neural models online (42ms latency).
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      onNavigate('/history');
                    }}
                    className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline font-bold"
                  >
                    View Global Threat Logs →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme switcher */}
          <button
            id="landing-theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} theme`}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {user ? (
            /* Logged-in State with Glass Dropdown */
            <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="max-w-[110px] truncate font-medium">{user.name || user.email.split('@')[0]}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Glass Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-dropdown p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {user.name || 'Threat Analyst'}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </div>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified SOC Analyst</span>
                    </div>
                  </div>

                  <div className="py-2 space-y-1 font-mono text-xs">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('/dashboard');
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Command Center</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('/history');
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left"
                    >
                      <FileText className="w-3.5 h-3.5 text-sky-500" />
                      <span>Audit Reports</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('/settings');
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Security Settings</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-mono font-medium transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated State */
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <button
                id="landing-signin-btn"
                onClick={handleSignIn}
                className="px-3.5 py-2 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors font-medium cursor-pointer"
              >
                Sign In
              </button>

              <MagneticButton
                id="landing-start-now-nav-btn"
                onClick={handleStartNow}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-cyan-600/20"
              >
                <span>START NOW</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </MagneticButton>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#070A0F]/95 backdrop-blur-2xl px-4 py-5 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1 font-mono text-xs">
            <button
              onClick={() => scrollToSection('features')}
              className="text-left py-2.5 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Defense Vectors
            </button>
            <button
              onClick={() => scrollToSection('pipeline')}
              className="text-left py-2.5 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Intelligence Engine
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-left py-2.5 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Architecture
            </button>
            <button
              onClick={() => scrollToSection('security')}
              className="text-left py-2.5 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Trust & Ethics
            </button>
            {onOpenDemo && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDemo();
                }}
                className="text-left py-2.5 px-3 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2 font-semibold"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Interactive Demo</span>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {user ? (
              <>
                <div className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="font-semibold">{user.name || user.email}</span>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase">Active</span>
                </div>
                <button
                  onClick={handleStartNow}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 rounded-xl text-rose-600 dark:text-rose-400 font-mono text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/20 text-center"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSignIn}
                  className="w-full py-2.5 rounded-xl text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-mono text-xs font-semibold text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={handleStartNow}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>START NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
