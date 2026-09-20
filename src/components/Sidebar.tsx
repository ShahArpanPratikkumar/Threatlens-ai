import React from 'react';
import {
  LayoutDashboard,
  ScanSearch,
  MessageSquareWarning,
  Image as ImageIcon,
  QrCode,
  History,
  FileText,
  Settings,
  ShieldCheck,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  Puzzle,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onOpenExtension: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  isOpen,
  onClose,
  onNavigate,
  onOpenExtension,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  // Navigation items as explicitly specified
  const primaryNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'URL Scanner', path: '/scan/url', icon: ScanSearch },
    { label: 'Message Scanner', path: '/scan/message', icon: MessageSquareWarning },
    { label: 'Screenshot Scanner', path: '/scan/screenshot', icon: ImageIcon },
    { label: 'QR Scanner', path: '/scan/qr', icon: QrCode },
    { label: 'History', path: '/history', icon: History },
  ];

  const secondaryNavItems = [
    { label: 'Audit Reports', path: '/history', icon: FileText },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Privacy Policy', path: '/privacy', icon: ShieldCheck },
    { label: 'Architecture Specs', path: '/about', icon: Info },
  ];

  const handleItemClick = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        id="app-sidebar"
        className={`fixed top-16 bottom-0 left-0 z-40 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#080B10]/90 backdrop-blur-xl transition-all duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-[72px] overflow-visible' : 'md:w-64 overflow-x-hidden'} w-64 flex flex-col justify-between`}
      >
        <div className={`p-3 sm:p-4 space-y-5 flex-1 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
          {/* Mobile close button & desktop collapse trigger */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="md:hidden flex items-center justify-between w-full">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                NAVIGATION
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Desktop Collapse Toggle */}
            {onToggleCollapse && (
              <div className="hidden md:flex items-center justify-between w-full">
                {!isCollapsed && (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    INTEL PLATFORM
                  </span>
                )}
                <button
                  id="sidebar-collapse-toggle-btn"
                  onClick={onToggleCollapse}
                  className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    isCollapsed ? 'mx-auto' : ''
                  }`}
                  title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Core Scanners Section */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                DEFENSE VECTORS
              </div>
            )}
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <div key={item.path} className="relative group">
                  <button
                    onClick={() => handleItemClick(item.path)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40 shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 group-hover:text-cyan-500'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </button>

                  {/* Tooltip in collapsed mode: Icon + Name, never clipped */}
                  {isCollapsed && (
                    <div className="hidden md:group-hover:flex items-center gap-2 absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-[99999] px-3 py-1.5 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 text-white text-xs font-mono whitespace-nowrap shadow-2xl border border-slate-700 pointer-events-none backdrop-blur-md">
                      <Icon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{item.label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Secondary Section */}
          <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-slate-800">
            {!isCollapsed && (
              <div className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                GOVERNANCE & AUDIT
              </div>
            )}
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <div key={item.label} className="relative group">
                  <button
                    onClick={() => handleItemClick(item.path)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40 shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 group-hover:text-cyan-500'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </button>

                  {/* Tooltip in collapsed mode */}
                  {isCollapsed && (
                    <div className="hidden md:group-hover:flex items-center gap-2 absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-[99999] px-3 py-1.5 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 text-white text-xs font-mono whitespace-nowrap shadow-2xl border border-slate-700 pointer-events-none backdrop-blur-md">
                      <Icon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{item.label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Extension Banner at Bottom */}
        {!isCollapsed ? (
          <div className="p-3 m-3 rounded-2xl glass-card">
            <div className="flex items-center gap-2 mb-1">
              <Puzzle className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                ThreatLens Agent
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mb-2.5">
              Browser extension for real-time link protection.
            </p>
            <button
              onClick={onOpenExtension}
              className="w-full py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-mono font-bold transition-colors flex items-center justify-center gap-1 shadow-xs"
            >
              <span>Test Simulator</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="p-2 mb-3 flex justify-center">
            <button
              onClick={onOpenExtension}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-800 transition-colors"
              title="Browser Extension Simulator"
            >
              <Puzzle className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
