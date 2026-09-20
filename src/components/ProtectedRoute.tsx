import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

interface ProtectedRouteProps {
  currentPath: string;
  onNavigate: (route: string) => void;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  currentPath,
  onNavigate,
  children,
}) => {
  const { user, token, isLoading } = useAuth();

  useEffect(() => {
    // Only redirect if auth session check has finished and no user is present
    if (!isLoading && !user && !token) {
      const cleanPath = (currentPath.split('?')[0] || '').replace(/\/$/, '') || '/';
      onNavigate(`/login?redirect=${encodeURIComponent(currentPath || cleanPath)}`);
    }
  }, [user, token, isLoading, currentPath, onNavigate]);

  // If loading session from storage/API, show clean cybersecurity verification indicator
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-6">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
          <Shield className="w-8 h-8 animate-pulse" />
        </div>
        <div className="font-mono text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          <span>Verifying Analyst Credentials...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, return null while redirect executes
  if (!user && !token) {
    return null;
  }

  // If authenticated, render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
