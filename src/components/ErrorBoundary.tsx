import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ThreatLens ErrorBoundary] Uncaught UI error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100 font-sans">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-mono text-slate-100">
                Application Interruption
              </h2>
              <p className="text-xs text-slate-400">
                An unexpected interface anomaly occurred. The cybersecurity engine state has been safely isolated.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-left overflow-x-auto max-h-32">
                <span className="text-[11px] font-mono text-rose-400 block break-words">
                  {this.state.error.message || 'Unknown Exception'}
                </span>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-semibold text-slate-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-mono font-semibold text-white transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
