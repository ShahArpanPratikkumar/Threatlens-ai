import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Zap,
  Puzzle,
  Moon,
  Sun,
  User,
  LogOut,
  Menu,
  LayoutDashboard,
  ScanSearch,
  MessageSquareWarning,
  Image as ImageIcon,
  QrCode,
  History,
  Columns,
  Rows,
  Bell,
  Settings,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export interface NavbarProps {
  currentPath: string;
  navMode: 'vertical' | 'horizontal';
  onToggleNavMode: () => void;
  onOpenDemo: () => void;
  onOpenExtension: () => void;
  onToggleSidebar: () => void;
  onNavigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  navMode,
  onToggleNavMode,
  onOpenDemo,
  onOpenExtension,
  onToggleSidebar,
  onNavigate,
}) => {
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const horizontalNavLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'URL Scanner', path: '/scan/url', icon: ScanSearch },
    { label: 'Message Scanner', path: '/scan/message', icon: MessageSquareWarning },
    { label: 'Screenshot Forensic', path: '/scan/screenshot', icon: ImageIcon },
    { label: 'QR Scanner', path: '/scan/qr', icon: QrCode },
    { label: 'Threat History', path: '/history', icon: History },
  ];

  return (
    <header
      className={`sticky top-0 z-30 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-[#080B10]/95 backdrop-blur-2xl border-b border-slate-200/90 dark:border-slate-800/90 shadow-xs'
          : 'bg-white/80 dark:bg-[#080B10]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80'
      }`}
    >
      <div className="flex h-16 items-center justify-between px-3 sm:px-6">
        {/* Left: Hamburger (mobile or vertical mode) + Brand */}
        <div className="flex items-center gap-3">
          {navMode === 'vertical' && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 md:hidden transition-colors cursor-pointer"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/40 text-cyan-600 dark:text-cyan-400 shadow-xs group-hover:border-cyan-500 transition-all">
              <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-wider text-slate-900 dark:text-slate-100 font-mono flex items-center gap-1.5">
                THREATLENS <span className="text-cyan-600 dark:text-cyan-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider -mt-1 hidden sm:inline">
                CYBERSECURITY SOC SHIELD
              </span>
            </div>
          </div>
        </div>

        {/* Center: When Horizontal Nav is active, show tabs; otherwise show status feed */}
        {navMode === 'horizontal' ? (
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {horizontalNavLinks.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentPath === tab.path;
              return (
                <button
                  key={tab.path}
                  onClick={() => onNavigate(tab.path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shadow-xs border border-slate-200/80 dark:border-cyan-500/40 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        ) : (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold tracking-wider text-[11px]">SOC ENGINE ACTIVE • THREAT RADAR ONLINE</span>
          </div>
        )}

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Navigation layout switch (Vertical vs Horizontal) */}
          <button
            onClick={onToggleNavMode}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-800 text-[11px] font-mono transition-colors cursor-pointer"
            title={`Switch to ${navMode === 'vertical' ? 'Horizontal top' : 'Vertical sidebar'} navigation`}
          >
            {navMode === 'vertical' ? (
              <>
                <Rows className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span className="hidden md:inline">Top Nav</span>
              </>
            ) : (
              <>
                <Columns className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span className="hidden md:inline">Sidebar</span>
              </>
            )}
          </button>

          {/* Quick Try Demo button */}
          <button
            id="nav-try-demo-btn"
            onClick={onOpenDemo}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 hover:border-amber-400 text-xs font-mono font-bold transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span className="hidden sm:inline">Demo Scenarios</span>
          </button>

          {/* Browser Extension simulator trigger */}
          <button
            id="nav-extension-btn"
            onClick={onOpenExtension}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-cyan-950/30 border border-slate-200 dark:border-cyan-500/30 text-slate-700 dark:text-cyan-300 hover:border-cyan-500 text-xs font-mono font-semibold transition-all cursor-pointer"
          >
            <Puzzle className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden md:inline">Extension</span>
          </button>

          {/* Telemetry Alerts Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              id="app-notif-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
              title="SOC Telemetry Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 ring-2 ring-white dark:ring-[#080B10]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-dropdown p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                      LIVE SOC TELEMETRY
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                    HEALTHY
                  </span>
                </div>

                <div className="mt-2.5 space-y-2 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <span>RADAR TELEMETRY</span>
                      <span>1m AGO</span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-semibold text-[11px]">
                      Threat radar synchronized with MITRE ATT&CK quadrant matrix.
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <span>ZERO-TRUST FILTER</span>
                      <span>5m AGO</span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-semibold text-[11px]">
                      IDN homoglyph & DNS spoofing blacklist updated.
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      onNavigate('/history');
                    }}
                    className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline font-bold cursor-pointer"
                  >
                    View All Audit Logs →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme switcher */}
          <button
            id="nav-theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} theme`}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* User Auth Profile Dropdown */}
          {user ? (
            <div className="relative pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-mono text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700"
              >
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="max-w-[70px] sm:max-w-[100px] truncate font-medium">
                  {user.name || user.email.split('@')[0]}
                </span>
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
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('/history');
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5 text-sky-500" />
                      <span>Threat History</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('/settings');
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Settings & Heuristics</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                        onNavigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-mono font-medium transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={() => onNavigate('/login')}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('/register')}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
