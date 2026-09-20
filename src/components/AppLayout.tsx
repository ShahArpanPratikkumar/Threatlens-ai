import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { DemoModal, type DemoScenario } from './DemoModal';
import { BrowserExtensionModal } from './BrowserExtensionModal';

interface AppLayoutProps {
  currentPath: string;
  onNavigate: (route: string) => void;
  onSelectScenario?: (scenario: DemoScenario) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPath,
  onNavigate,
  onSelectScenario,
  children,
}) => {
  const [navMode, setNavMode] = useState<'vertical' | 'horizontal'>(() => {
    return (localStorage.getItem('threatlens_nav_mode') as 'vertical' | 'horizontal') || 'vertical';
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('threatlens_sidebar_collapsed') === 'true';
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState<boolean>(false);

  const toggleNavMode = () => {
    const next = navMode === 'vertical' ? 'horizontal' : 'vertical';
    setNavMode(next);
    localStorage.setItem('threatlens_nav_mode', next);
  };

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('threatlens_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleScenarioSelect = (scenario: DemoScenario) => {
    setIsDemoModalOpen(false);
    if (onSelectScenario) {
      onSelectScenario(scenario);
    } else {
      if (scenario.category === 'url') {
        onNavigate('/scan/url');
      } else if (scenario.category === 'message') {
        onNavigate('/scan/message');
      } else if (scenario.category === 'qr') {
        onNavigate('/scan/qr');
      } else if (scenario.category === 'screenshot') {
        onNavigate('/scan/screenshot');
      }
    }
  };

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [currentPath]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/40 dark:bg-[#070A0F]/50 text-slate-900 dark:text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-400 font-sans transition-colors duration-300">
      {/* Top Navbar */}
      <Navbar
        currentPath={currentPath}
        navMode={navMode}
        onToggleNavMode={toggleNavMode}
        onOpenDemo={() => setIsDemoModalOpen(true)}
        onOpenExtension={() => setIsExtensionModalOpen(true)}
        onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        onNavigate={onNavigate}
      />

      {/* Main Body Area */}
      <div className="flex-1 flex w-full relative">
        {/* Vertical Sidebar (rendered if in vertical mode) */}
        {navMode === 'vertical' && (
          <Sidebar
            currentPath={currentPath}
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
            onNavigate={onNavigate}
            onOpenExtension={() => setIsExtensionModalOpen(true)}
            isCollapsed={isCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />
        )}

        {/* Content Wrapper */}
        <main
          className={`flex-1 flex flex-col w-full transition-all duration-300 ${
            navMode === 'vertical'
              ? isCollapsed
                ? 'md:pl-[72px]'
                : 'md:pl-64'
              : 'pl-0'
          }`}
        >
          <div className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 lg:p-8">
            {children}
          </div>

          {/* Clean App Footer */}
          <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-[#080B10]/40 backdrop-blur-xs py-5 px-4 sm:px-8 text-xs font-mono text-slate-500 dark:text-slate-400">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  ThreatLens Autonomous SOC
                </span>
                <span>• Active Telemetry & Machine Learning Defense</span>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  Architecture Specs
                </button>
                <button
                  onClick={() => onNavigate('/privacy')}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  Zero-Retention Privacy
                </button>
                <button
                  onClick={() => onNavigate('/settings')}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  API Keys & Config
                </button>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Global Modals */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectScenario={handleScenarioSelect}
      />
      <BrowserExtensionModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
        onOpenReport={(id) => onNavigate(`/report/${id}`)}
      />
    </div>
  );
};
export default AppLayout;
