import React, { useEffect, useState } from 'react';
import {
  History,
  Search,
  Trash2,
  Download,
  RefreshCw,
  Globe,
  MessageSquareWarning,
  Camera,
  QrCode,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import type { SecurityAnalysisResult, ScanFilterLevel, ScanFilterType } from '../types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface HistoryPageProps {
  onNavigate: (route: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [scans, setScans] = useState<SecurityAnalysisResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<ScanFilterLevel>('ALL');
  const [selectedType, setSelectedType] = useState<ScanFilterType>('ALL');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const { showToast } = useToast();

  const fetchScans = async () => {
    setLoading(true);
    try {
      const res = await api.getScans({
        q: searchQuery || undefined,
        level: selectedLevel !== 'ALL' ? selectedLevel : undefined,
        type: selectedType !== 'ALL' ? selectedType : undefined,
        page,
        limit: 10,
      });
      setScans(res.scans || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch {
      showToast('Failed to fetch threat history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [selectedLevel, selectedType, page, user?.id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchScans();
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to purge all stored inspection logs? This cannot be undone.')) {
      try {
        await api.clearAllScans();
        showToast('All scan history purged', 'info');
        fetchScans();
      } catch {
        showToast('Failed to clear history', 'error');
      }
    }
  };

  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.deleteScan(id);
      showToast('Scan log deleted', 'info');
      fetchScans();
    } catch {
      showToast('Failed to delete scan', 'error');
    }
  };

  const handleExportJson = () => {
    if (scans.length === 0) {
      showToast('No logs available to export', 'warning');
      return;
    }
    const blob = new Blob([JSON.stringify(scans, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `threatlens-telemetry-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported scan history JSON', 'success');
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-500/40">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40">LOW</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40">SAFE</span>;
    }
  };

  const getScanIcon = (type: string) => {
    switch (type) {
      case 'url': return <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />;
      case 'message': return <MessageSquareWarning className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'screenshot': return <Camera className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      case 'qr': return <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      default: return <History className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto py-6 px-4 md:px-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1">
            <History className="w-4 h-4" />
            <span>Forensic Audit Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
            Threat Inspection History ({totalCount})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Historical logs of all scanned URLs, scam texts, QR codes, and suspicious screenshots.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-xs font-mono text-rose-700 dark:text-rose-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by target URL, payload text, or threat classification..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-mono font-bold shadow-xs transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono">
          {/* Risk Level Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 mr-1">Risk:</span>
            {(['ALL', 'SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as ScanFilterLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setSelectedLevel(lvl);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedLevel === lvl
                    ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40 font-bold'
                    : 'glass-pill text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Vector Type Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 mr-1">Vector:</span>
            {(['ALL', 'url', 'message', 'screenshot', 'qr'] as ScanFilterType[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSelectedType(t);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg uppercase transition-colors ${
                  selectedType === t
                    ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40 font-bold'
                    : 'glass-pill text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="p-6 rounded-2xl glass-panel">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 text-cyan-600 dark:text-cyan-400 animate-spin" />
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Loading audit records...</span>
          </div>
        ) : scans.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
              No History Records Found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Either no inquiries match your active filter criteria, or the telemetry database has not recorded any scans yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="pb-3">VECTOR</th>
                  <th className="pb-3">TARGET</th>
                  <th className="pb-3">RISK SCORE</th>
                  <th className="pb-3">CLASSIFICATION</th>
                  <th className="pb-3">SIGNALS</th>
                  <th className="pb-3">TIMESTAMP</th>
                  <th className="pb-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {scans.map((scan) => (
                  <tr
                    key={scan.id}
                    onClick={() => onNavigate(`/report/${scan.id}`)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 uppercase text-[10px] text-slate-700 dark:text-slate-300">
                        {getScanIcon(scan.scanType)}
                        {scan.scanType}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-cyan-700 dark:text-cyan-300 max-w-[260px] truncate" title={scan.target}>
                      {scan.target}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{scan.riskScore}/100</span>
                        {getRiskBadge(scan.riskLevel)}
                      </div>
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300 font-sans max-w-[160px] truncate">
                      {scan.threatType}
                    </td>
                    <td className="py-3 text-slate-500">
                      {scan.indicators?.length || 0} indicators
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(scan.metadata.timestamp).toLocaleDateString()}{' '}
                      {new Date(scan.metadata.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate(`/report/${scan.id}`);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-500/20 text-slate-700 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-300 text-[11px] transition-colors"
                        >
                          Report ↗
                        </button>
                        <button
                          onClick={(e) => handleDeleteItem(e, scan.id)}
                          className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 text-[11px] transition-colors"
                          title="Delete from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400">
                <div>
                  Page {page} of {totalPages} ({totalCount} total inquiries)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
