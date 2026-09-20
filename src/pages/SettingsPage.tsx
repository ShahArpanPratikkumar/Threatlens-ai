import React, { useState } from 'react';
import { Settings, User, Lock, Key, Trash2, Shield, Moon, Sun, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

interface SettingsPageProps {
  onNavigate: (route: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { user, updateUser, logout } = useAuth();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [name, setName] = useState<string>(user?.name || 'Security Analyst');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsUpdatingProfile(true);
    try {
      if (user) {
        const res = await api.updateProfile(name);
        updateUser(res.user);
        showToast('Profile updated successfully', 'success');
      } else {
        showToast('Guest profile updated in session', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Please enter both current and new passwords', 'warning');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.updatePassword(currentPassword, newPassword);
      showToast('Password updated successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your entire threat inspection history?')) {
      try {
        await api.clearAllScans();
        showToast('All scan history cleared', 'success');
      } catch {
        showToast('Failed to clear history', 'error');
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your ThreatLens account and all data? This cannot be undone.')) {
      try {
        await api.deleteAccount();
        logout();
        onNavigate('/');
        showToast('Account deleted successfully', 'info');
      } catch (err: any) {
        showToast(err.message || 'Failed to delete account', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-6 px-4 md:px-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1">
          <Settings className="w-4 h-4" />
          <span>Platform Preferences & Security Controls</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-slate-100">
          Settings & Security
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your analyst profile, credentials, active threat feeds, and privacy settings.
        </p>
      </div>

      {/* 1. Threat Intelligence Feed Status */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          SOC Threat Engine & Integrations Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl glass-card flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">AI Neural Engine</div>
              <div className="font-bold text-cyan-700 dark:text-cyan-300 mt-0.5">Gemini 3.1 Flash-Lite / 3.8 Flash</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="p-3.5 rounded-xl glass-card flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Heuristic Rulebook</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Online • 20+ Rules</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <div className="p-3.5 rounded-xl glass-card flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">DNS & Host Telemetry</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Authoritative DNS Active</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* 2. Profile Settings */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          Analyst Profile Information
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-600 dark:text-slate-400">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 glass-input focus:border-cyan-500 rounded-xl text-xs font-mono focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-600 dark:text-slate-400">Registered Email</label>
            <input
              type="email"
              disabled
              value={user?.email || 'analyst@threatlens.ai'}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-400 dark:text-slate-500 cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all disabled:opacity-50"
          >
            {isUpdatingProfile ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* 3. Password Security */}
      {user && (
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            Security & Password Change
          </h3>

          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-600 dark:text-slate-400">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 glass-input focus:border-amber-500 rounded-xl text-xs font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-600 dark:text-slate-400">New Secure Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 glass-input focus:border-amber-500 rounded-xl text-xs font-mono focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition-all disabled:opacity-50"
            >
              {isUpdatingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* 4. Appearance & Preferences */}
      <div className="p-6 rounded-2xl glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">Theme Mode</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Toggle between SOC Dark-first and High Contrast Light mode</p>
        </div>
        <div className="flex items-center gap-2 p-1 rounded-xl glass-card text-xs font-mono">
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all ${
              theme === 'dark'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark SOC</span>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all ${
              theme === 'light'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all ${
              theme === 'system'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Auto</span>
          </button>
        </div>
      </div>

      {/* 5. Danger Zone */}
      <div className="p-6 rounded-2xl bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/20 dark:border-rose-500/30 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 font-mono flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          Danger Zone
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-200">Clear All Threat History</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Permanently erase all historical URL and scan audit logs.</div>
          </div>
          <button
            onClick={handleClearHistory}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/40 text-xs font-mono font-bold transition-colors shrink-0 shadow-xs"
          >
            Clear History
          </button>
        </div>

        {user && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-rose-200 dark:border-rose-500/20">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-200">Delete Account</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Permanently remove user credentials and personal records.</div>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold transition-colors shrink-0 shadow-xs"
            >
              Delete Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
