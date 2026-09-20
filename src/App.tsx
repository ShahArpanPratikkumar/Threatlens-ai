import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CinematicLoader } from './components/CinematicLoader';
import { AppLayout } from './components/AppLayout';
import { AuthLayout } from './components/AuthLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingNavbar } from './components/LandingNavbar';
import { LandingFooter } from './components/LandingFooter';
import { DemoModal, type DemoScenario } from './components/DemoModal';
import { BrowserExtensionModal } from './components/BrowserExtensionModal';
import { ErrorBoundary } from './components/ErrorBoundary';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { UrlScannerPage } from './pages/UrlScannerPage';
import { MessageScannerPage } from './pages/MessageScannerPage';
import { ScreenshotScannerPage } from './pages/ScreenshotScannerPage';
import { QrScannerPage } from './pages/QrScannerPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportPage } from './pages/ReportPage';
import { SettingsPage } from './pages/SettingsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AboutPage } from './pages/AboutPage';
import { AuthSplitPage } from './pages/AuthSplitPage';

function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  // Runs once on initial website open or browser refresh, does not replay on internal navigation
  const [hasBooted, setHasBooted] = useState<boolean>(false);

  // Cross-page payload state for demo scenarios or deep links
  const [initialUrl, setInitialUrl] = useState<string>('');
  const [initialMessage, setInitialMessage] = useState<string>('');
  const [initialQr, setInitialQr] = useState<string>('');

  // Modals accessible from landing page or deep links
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState<boolean>(false);

  const { user } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDemoScenario = (scenario: DemoScenario) => {
    setIsDemoModalOpen(false);
    if (scenario.category === 'url') {
      setInitialUrl(scenario.payload);
      navigate(user ? '/scan/url' : `/login?redirect=${encodeURIComponent('/scan/url')}`);
    } else if (scenario.category === 'message') {
      setInitialMessage(scenario.payload);
      navigate(user ? '/scan/message' : `/login?redirect=${encodeURIComponent('/scan/message')}`);
    } else if (scenario.category === 'qr') {
      setInitialQr(scenario.payload);
      navigate(user ? '/scan/qr' : `/login?redirect=${encodeURIComponent('/scan/qr')}`);
    } else if (scenario.category === 'screenshot') {
      navigate(user ? '/scan/screenshot' : `/login?redirect=${encodeURIComponent('/scan/screenshot')}`);
    }
  };

  const cleanPath = (currentPath.split('?')[0] || '').replace(/\/$/, '') || '/';
  const isAuthRoute =
    cleanPath === '/login' ||
    cleanPath === '/register' ||
    cleanPath === '/signup';

  // 1. PUBLIC ROUTE: Dedicated Landing Page Experience
  if (cleanPath === '/') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-[#070A0F] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
        {!hasBooted && <CinematicLoader onComplete={() => setHasBooted(true)} />}

        {/* Dedicated Landing Navigation Bar */}
        <LandingNavbar
          onNavigate={navigate}
          onOpenDemo={() => setIsDemoModalOpen(true)}
        />

        {/* Landing Page Content */}
        <main className="flex-1 w-full">
          <LandingPage
            onNavigate={navigate}
            onOpenDemo={() => setIsDemoModalOpen(true)}
            onOpenExtension={() => setIsExtensionModalOpen(true)}
          />
        </main>

        {/* Dedicated Landing Footer */}
        <LandingFooter
          onNavigate={navigate}
          onStartNow={() => {
            if (user) {
              navigate('/dashboard');
            } else {
              navigate('/login?redirect=/dashboard');
            }
          }}
        />

        {/* Global Modals for Demo Scenarios & Extension */}
        <DemoModal
          isOpen={isDemoModalOpen}
          onClose={() => setIsDemoModalOpen(false)}
          onSelectScenario={handleSelectDemoScenario}
        />
        <BrowserExtensionModal
          isOpen={isExtensionModalOpen}
          onClose={() => setIsExtensionModalOpen(false)}
          onOpenReport={(scanId) => navigate(`/report/${scanId}`)}
        />
      </div>
    );
  }

  // 2. PUBLIC ROUTE: Authentication Pages (Sign In & Sign Up)
  if (isAuthRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-[#070A0F] text-slate-900 dark:text-slate-100 font-sans transition-colors">
        {!hasBooted && <CinematicLoader onComplete={() => setHasBooted(true)} />}
        <AuthLayout onNavigate={navigate}>
          <AuthSplitPage
            initialMode={cleanPath === '/login' ? 'login' : 'register'}
            onNavigate={navigate}
          />
        </AuthLayout>
      </div>
    );
  }

  // 3. PUBLIC INFORMATIONAL ROUTES: Privacy & About (Accessible with or without auth)
  if (cleanPath === '/privacy' || cleanPath === '/about') {
    if (user) {
      // If user is already authenticated, show within main application shell
      return (
        <AppLayout
          currentPath={currentPath}
          onNavigate={navigate}
          onSelectScenario={handleSelectDemoScenario}
        >
          {!hasBooted && <CinematicLoader onComplete={() => setHasBooted(true)} />}
          {cleanPath === '/privacy' ? <PrivacyPage /> : <AboutPage />}
        </AppLayout>
      );
    }

    // If visitor is unauthenticated, show with clean public navigation & footer
    return (
      <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-[#070A0F] text-slate-900 dark:text-slate-100 font-sans transition-colors">
        {!hasBooted && <CinematicLoader onComplete={() => setHasBooted(true)} />}
        <LandingNavbar
          onNavigate={navigate}
          onOpenDemo={() => setIsDemoModalOpen(true)}
        />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-8">
          {cleanPath === '/privacy' ? <PrivacyPage /> : <AboutPage />}
        </main>
        <LandingFooter
          onNavigate={navigate}
          onStartNow={() => navigate('/login?redirect=/dashboard')}
        />
      </div>
    );
  }

  // 4. PROTECTED APPLICATION ROUTES: Dashboard, Scanners, History, Reports, Settings
  const renderProtectedView = () => {
    const reportMatch = cleanPath.match(/^\/report\/(.+)$/);
    if (reportMatch) {
      return <ReportPage scanId={reportMatch[1]} onNavigate={navigate} />;
    }

    switch (cleanPath) {
      case '/dashboard':
        return (
          <DashboardPage
            onNavigate={navigate}
            onOpenDemo={() => setIsDemoModalOpen(true)}
          />
        );
      case '/scan/url':
        return <UrlScannerPage initialUrl={initialUrl} onNavigate={navigate} />;
      case '/scan/message':
        return <MessageScannerPage initialMessage={initialMessage} onNavigate={navigate} />;
      case '/scan/screenshot':
        return <ScreenshotScannerPage onNavigate={navigate} />;
      case '/scan/qr':
        return <QrScannerPage initialPayload={initialQr} onNavigate={navigate} />;
      case '/history':
        return <HistoryPage onNavigate={navigate} />;
      case '/settings':
        return <SettingsPage onNavigate={navigate} />;
      default:
        // Any unknown path redirects to dashboard or landing
        return (
          <DashboardPage
            onNavigate={navigate}
            onOpenDemo={() => setIsDemoModalOpen(true)}
          />
        );
    }
  };

  return (
    <ProtectedRoute currentPath={currentPath} onNavigate={navigate}>
      {!hasBooted && <CinematicLoader onComplete={() => setHasBooted(true)} />}
      <AppLayout
        currentPath={currentPath}
        onNavigate={navigate}
        onSelectScenario={handleSelectDemoScenario}
      >
        {renderProtectedView()}
      </AppLayout>
    </ProtectedRoute>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
