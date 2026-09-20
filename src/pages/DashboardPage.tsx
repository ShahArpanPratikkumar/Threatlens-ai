import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Globe,
  MessageSquareWarning,
  Camera,
  QrCode,
  ArrowRight,
  TrendingUp,
  FileText,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { api } from '../services/api';
import type { DashboardStats, SecurityAnalysisResult } from '../types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ThreatRadar } from '../components/ThreatRadar';

interface DashboardPageProps {
  onNavigate: (route: string) => void;
  onOpenDemo: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenDemo }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentScans, setRecentScans] = useState<SecurityAnalysisResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, scansData] = await Promise.all([
        api.getDashboardStats(),
        api.getScans({ limit: 6 }),
      ]);
      setStats(statsData);
      setRecentScans(scansData.scans || []);
    } catch {
      showToast('Failed to load dashboard telemetry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-cyan-600 dark:text-cyan-400 animate-spin" />
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Loading SOC telemetry feed...</span>
      </div>
    );
  }

  const pieColors: Record<string, string> = {
    safe: '#10B981',
    low: '#06B6D4',
    medium: '#EAB308',
    high: '#F97316',
    critical: '#EF4444',
  };

  const riskDistributionData = [
    { name: 'Safe', value: stats.riskDistribution.safe, color: pieColors.safe },
    { name: 'Low', value: stats.riskDistribution.low, color: pieColors.low },
    { name: 'Medium', value: stats.riskDistribution.medium, color: pieColors.medium },
    { name: 'High', value: stats.riskDistribution.high, color: pieColors.high },
    { name: 'Critical', value: stats.riskDistribution.critical, color: pieColors.critical },
  ].filter((item) => item.value > 0);

  const getRiskBadge = (level: string) => {
    const badges: Record<string, string> = {
      SAFE: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
      LOW: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
      MEDIUM: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
      HIGH: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30',
      CRITICAL: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${badges[level] || badges.MEDIUM}`}>
        {level}
      </span>
    );
  };

  const getScanIcon = (type: string) => {
    switch (type) {
      case 'url':
        return <Globe className="w-3.5 h-3.5 text-cyan-500" />;
      case 'message':
        return <MessageSquareWarning className="w-3.5 h-3.5 text-amber-500" />;
      case 'screenshot':
        return <Camera className="w-3.5 h-3.5 text-purple-500" />;
      case 'qr':
        return <QrCode className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-slate-100">
              SECURITY OPERATIONS CENTER
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 text-[10px] font-mono font-bold">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global threat analysis & social engineering telemetry metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={onOpenDemo}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/15 hover:bg-amber-100 dark:hover:bg-amber-500/25 border border-amber-200 dark:border-amber-500/30 text-xs font-mono text-amber-700 dark:text-amber-300 font-bold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Load Scenarios</span>
          </button>
        </div>
      </div>

      {/* 1. Core Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Scans */}
        <div className="p-4 rounded-2xl glass-card">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Inquiries
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-2">
            {stats.totalScans}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            <span>Database Records</span>
          </div>
        </div>

        {/* Threats Detected */}
        <div className="p-4 rounded-2xl glass-card">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Threats Detected
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-2">
            {stats.threatsDetected}
          </div>
          <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">
            Suspicious & Malicious
          </div>
        </div>

        {/* High Risk Threats */}
        <div className="p-4 rounded-2xl glass-card">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Critical Alerts
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-2">
            {stats.highRiskThreats}
          </div>
          <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">
            High Severity Threats
          </div>
        </div>

        {/* Safe Scans */}
        <div className="p-4 rounded-2xl glass-card">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Verified Clean
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.safeScans}
          </div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
            Trusted Destinations
          </div>
        </div>

        {/* Security Awareness Score */}
        <div className="p-4 rounded-2xl glass-card col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Resilience Score
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-600 dark:text-cyan-400 mt-2">
            {stats.securityAwarenessScore}%
          </div>
          <div className="text-[11px] text-cyan-600/80 dark:text-cyan-400/80 mt-1">
            {stats.totalScans === 0 ? 'No activity yet' : 'Real posture index'}
          </div>
        </div>
      </div>

      {/* 2. Visual Charts Row (Threat Activity & Threat Radar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Chart (Activity Trend) */}
        <div className="lg:col-span-8 p-6 rounded-2xl glass-panel">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                TELEMETRY SCAN ACTIVITY
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total inquiries vs detected threats (Last 7 days)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span>Inquiries</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Threats</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.scansOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="threatsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <XAxis dataKey="date" stroke="currentColor" className="text-slate-400 font-mono text-[10px]" />
                <YAxis stroke="currentColor" className="text-slate-400 font-mono text-[10px]" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="scans" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#scansGradient)" />
                <Area type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#threatsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Widget: Threat Radar Visual Identity */}
        <div className="lg:col-span-4 p-6 rounded-2xl glass-panel flex flex-col items-center justify-between">
          <div className="w-full text-center">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
              THREAT RADAR DEFENSE
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live active vector interception array</p>
          </div>

          <div className="py-4">
            <ThreatRadar
              score={stats.totalScans > 0 ? (recentScans[0]?.riskScore ?? 0) : 0}
              threatType={recentScans[0]?.threatType}
              size="md"
            />
          </div>

          <div className="w-full text-center">
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {stats.totalScans > 0
                ? `Latest inspection evaluated: ${recentScans[0]?.scanType.toUpperCase()} (${recentScans[0]?.riskLevel})`
                : 'Zero active threats recorded in SOC storage'}
            </p>
          </div>
        </div>

      </div>

      {/* 3. Breakdown Rows (Risk Distribution & Vector Types) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Risk Distribution Donut */}
        <div className="p-6 rounded-2xl glass-panel">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mb-1">
            RISK SEVERITY SPREAD
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Inspections categorized by risk level</p>

          {stats.totalScans === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs font-mono border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <span>No telemetry data logged yet</span>
            </div>
          ) : (
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Vector Types Bar Chart */}
        <div className="p-6 rounded-2xl glass-panel">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mb-1">
            INQUIRY VECTORS
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Threat inquiries categorized by scanner channel</p>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.scansByType} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <XAxis dataKey="type" stroke="currentColor" className="text-slate-400 font-mono text-[9px]" />
                <YAxis stroke="currentColor" className="text-slate-400 font-mono text-[10px]" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Threat Categories list */}
        <div className="p-6 rounded-2xl glass-panel">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mb-1">
            ACTIVE THREAT FAMILIES
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Highest occurrence malicious patterns</p>

          {stats.topThreatCategories.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs font-mono border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <span>No malicious threat families detected yet</span>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topThreatCategories.map((t, idx) => (
                <div
                  key={t.category}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-mono font-bold text-[10px] flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-mono text-slate-800 dark:text-slate-200 font-medium truncate max-w-[150px]">
                      {t.category}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                    {t.count} detected
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 4. Recent Scans Table with Elegant Empty State */}
      <div className="p-6 rounded-2xl glass-panel">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
              RECENT THREAT INSPECTIONS
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click any inspection to view detailed evidence and explainability report</p>
          </div>

          {recentScans.length > 0 && (
            <button
              onClick={() => onNavigate('/history')}
              className="flex items-center gap-1 text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
            >
              <span>View All History</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {recentScans.length === 0 ? (
          /* High Craft Clean Empty State */
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4 shadow-xs">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h4 className="text-base font-mono font-bold text-slate-900 dark:text-slate-100">
              No telemetry collected yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-5">
              Run your first scan to populate security metrics.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                id="dashboard-run-first-scan-btn"
                onClick={() => onNavigate('/scan/url')}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <span>Run First Scan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenDemo}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-mono text-xs font-semibold transition-all"
              >
                Load Attack Scenarios
              </button>
            </div>
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
                  <th className="pb-3">TIMESTAMP</th>
                  <th className="pb-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentScans.map((scan) => (
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
                    <td className="py-3 font-mono text-cyan-700 dark:text-cyan-300 max-w-[280px] truncate" title={scan.target}>
                      {scan.target}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{scan.riskScore}/100</span>
                        {getRiskBadge(scan.riskLevel)}
                      </div>
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300 font-sans max-w-[180px] truncate">
                      {scan.threatType}
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(scan.metadata.timestamp).toLocaleDateString()}{' '}
                      {new Date(scan.metadata.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(`/report/${scan.id}`);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-500/20 text-slate-700 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-300 text-[11px] transition-colors"
                      >
                        Report ↗
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
