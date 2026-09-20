import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Lock,
  Mail,
  User,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  KeyRound,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AuthSecurityExperience } from '../components/AuthSecurityExperience';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onNavigate: (route: string) => void;
}

export const AuthSplitPage: React.FC<AuthPageProps> = ({ initialMode = 'login', onNavigate }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Form states
  const [email, setEmail] = useState('analyst@threatlens.ai');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [name, setName] = useState('Senior SOC Analyst');
  const [rememberMe, setRememberMe] = useState(true);

  // UX states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Validation touched states
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [touchedConfirmPassword, setTouchedConfirmPassword] = useState(false);

  const { login, register, user, isLoading } = useAuth();
  const { showToast } = useToast();

  const getRedirectDestination = () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect');
      if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
        return decodeURIComponent(redirect);
      }
    } catch {
      // Fallback to dashboard
    }
    return '/dashboard';
  };

  // If user is already authenticated, smoothly redirect to intended destination
  useEffect(() => {
    if (user && !isLoading) {
      onNavigate(getRedirectDestination());
    }
  }, [user, isLoading]);

  // Mode switcher handler
  const handleSwitchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMessage(null);
    const searchParams = new URLSearchParams(window.location.search);
    const redirect = searchParams.get('redirect');
    const suffix = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
    if (newMode === 'login') {
      onNavigate(`/login${suffix}`);
    } else {
      onNavigate(`/signup${suffix}`);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(score, 4);
  };

  const strengthScore = getPasswordStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Strong', 'Enterprise Grade'];
  const strengthColors = [
    'bg-rose-500 text-rose-500',
    'bg-amber-500 text-amber-500',
    'bg-sky-500 text-sky-500',
    'bg-emerald-500 text-emerald-500',
  ];

  // Validation checks
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;
  const isConfirmValid = mode === 'login' || password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate fields
    if (!email.trim()) {
      setErrorMessage('Please enter your analyst email address.');
      return;
    }
    if (!isEmailValid) {
      setErrorMessage('Please enter a valid email address (e.g., name@company.com).');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Please provide your full analyst name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        showToast('Analyst authenticated. Welcome to ThreatLens SOC.', 'success');
      } else {
        await register(name.trim(), email.trim(), password);
        showToast('Analyst account initialized successfully.', 'success');
      }
      const destination = getRedirectDestination();
      onNavigate(destination);
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please verify credentials.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('analyst@threatlens.ai');
    setPassword('password123');
    setConfirmPassword('password123');
    setName('Senior SOC Analyst');
    setErrorMessage(null);
    showToast('Demo analyst credentials loaded', 'info');
  };

  return (
    <div className="w-full select-none">
      {/* Outer Card Container */}
      <div className="w-full rounded-2xl sm:rounded-3xl glass-panel shadow-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800/90 grid grid-cols-1 lg:grid-cols-12 transition-all">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: SECURITY INTELLIGENCE & SOC EXPERIENCE       */}
        {/* Visible on Desktop (lg:), hidden on small mobile to avoid */}
        {/* vertical bloat while keeping desktop rich and immersive  */}
        {/* ======================================================== */}
        <div className="hidden lg:flex lg:col-span-6 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200/60 dark:from-[#080c13] dark:via-[#0c121e] dark:to-[#070a10] border-r border-slate-200/80 dark:border-slate-800/80 flex-col justify-between relative overflow-hidden">
          <AuthSecurityExperience mode={mode} />
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: HIGH-CRAFT AUTHENTICATION FORM              */}
        {/* Optimized for all viewports from 320px to 1440px+         */}
        {/* ======================================================== */}
        <div className="col-span-1 lg:col-span-6 p-5 sm:p-8 lg:p-10 flex flex-col justify-center bg-white/95 dark:bg-[#0b0f17]/95 backdrop-blur-xl">
          <div className="max-w-md w-full mx-auto space-y-5 sm:space-y-6">

            {/* Mobile Header Banner (Visible on < lg screens only) */}
            <div className="lg:hidden flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-500/40 text-cyan-600 dark:text-cyan-400">
                  <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <div className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 tracking-wider">
                    THREATLENS <span className="text-cyan-600 dark:text-cyan-400">SOC</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 tracking-wider">
                    COMMAND ACCESS GATEWAY
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>ONLINE</span>
              </div>
            </div>

            {/* Segmented Mode Switch Tabs */}
            <div className="relative p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center text-xs font-mono">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className={`relative z-10 flex-1 py-2.5 px-3 sm:px-4 rounded-xl font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'login'
                    ? 'text-cyan-700 dark:text-cyan-300'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                {mode === 'login' && (
                  <motion.div
                    layoutId="auth-tab-slider"
                    className="absolute inset-0 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-20 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode('register')}
                className={`relative z-10 flex-1 py-2.5 px-3 sm:px-4 rounded-xl font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'register'
                    ? 'text-cyan-700 dark:text-cyan-300'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                {mode === 'register' && (
                  <motion.div
                    layoutId="auth-tab-slider"
                    className="absolute inset-0 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-20 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </span>
              </button>
            </div>

            {/* Context Heading */}
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                {mode === 'login' ? 'Welcome back' : 'Create your ThreatLens AI account'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {mode === 'login'
                  ? 'Continue protecting your digital world and access ThreatLens SOC.'
                  : 'Start analyzing threats with AI-powered security intelligence.'}
              </p>
            </div>

            {/* Quick Demo Credentials Pill Button */}
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/15 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all hover:border-cyan-500/50 shadow-2xs group cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Fill Demo Analyst Credentials</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-cyan-600/15 dark:bg-cyan-400/15 text-cyan-700 dark:text-cyan-300 font-mono">
                1-CLICK
              </span>
            </button>

            {/* Error Message Alert */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-mono flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="grow">{errorMessage}</div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 text-sm leading-none cursor-pointer"
                    aria-label="Dismiss error"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name field (Register only) */}
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <label
                      htmlFor="auth-fullname"
                      className="text-xs font-mono text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between"
                    >
                      <span>Full Name</span>
                      <span className="text-[10px] text-slate-400 font-normal">Security Lead</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="auth-fullname"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Vance, Senior Analyst"
                        autoComplete="name"
                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 glass-input rounded-xl text-xs sm:text-sm font-mono focus:border-cyan-500 focus:outline-none transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label
                  htmlFor="auth-email"
                  className="text-xs font-mono text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between"
                >
                  <span>Analyst Email</span>
                  {touchedEmail && !isEmailValid && email && (
                    <span className="text-[10px] text-rose-500 font-normal">Enter a valid email address</span>
                  )}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (!touchedEmail) setTouchedEmail(true);
                    }}
                    onBlur={() => setTouchedEmail(true)}
                    placeholder="analyst@threatlens.ai"
                    autoComplete="username email"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 sm:py-3 glass-input rounded-xl text-xs sm:text-sm font-mono focus:border-cyan-500 focus:outline-none transition-all ${
                      touchedEmail && !isEmailValid && email ? 'border-rose-400 dark:border-rose-500' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="auth-password"
                  className="text-xs font-mono text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between"
                >
                  <span>Password</span>
                  {mode === 'register' && (
                    <span className="text-[10px] text-slate-400 font-normal">Min 6 characters</span>
                  )}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="auth-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (!touchedPassword) setTouchedPassword(true);
                    }}
                    onBlur={() => setTouchedPassword(true)}
                    placeholder="••••••••••••"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 glass-input rounded-xl text-xs sm:text-sm font-mono focus:border-cyan-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator for Register */}
                {mode === 'register' && password && (
                  <div className="pt-1.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-500 dark:text-slate-400">Password Strength:</span>
                      <span className={`font-bold ${strengthColors[strengthScore - 1]?.split(' ')[1] || 'text-slate-400'}`}>
                        {strengthLabels[strengthScore - 1] || 'Too Short'}
                      </span>
                    </div>
                    {/* 4 Segmented Strength Bars */}
                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`rounded-full transition-all duration-300 ${
                            strengthScore >= step
                              ? strengthColors[strengthScore - 1]?.split(' ')[0]
                              : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Criteria checklist */}
                    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono pt-1 text-slate-500 dark:text-slate-400">
                      <span className={`flex items-center gap-1 ${password.length >= 6 ? 'text-emerald-500' : ''}`}>
                        <Check className="w-3 h-3" /> 6+ characters
                      </span>
                      <span className={`flex items-center gap-1 ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-emerald-500' : ''}`}>
                        <Check className="w-3 h-3" /> Uppercase & lowercase
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password (Register only) */}
              <AnimatePresence mode="wait">
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <label
                      htmlFor="auth-confirm-password"
                      className="text-xs font-mono text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between"
                    >
                      <span>Confirm Password</span>
                      {touchedConfirmPassword && !isConfirmValid && (
                        <span className="text-[10px] text-rose-500 font-normal">Passwords do not match</span>
                      )}
                      {touchedConfirmPassword && isConfirmValid && confirmPassword && (
                        <span className="text-[10px] text-emerald-500 font-normal flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Matching
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="auth-confirm-password"
                        name="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (!touchedConfirmPassword) setTouchedConfirmPassword(true);
                        }}
                        onBlur={() => setTouchedConfirmPassword(true)}
                        placeholder="••••••••••••"
                        autoComplete="new-password"
                        required
                        className={`w-full pl-10 pr-11 py-2.5 sm:py-3 glass-input rounded-xl text-xs sm:text-sm font-mono focus:border-cyan-500 focus:outline-none transition-all ${
                          touchedConfirmPassword && !isConfirmValid ? 'border-rose-400 dark:border-rose-500' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 cursor-pointer"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Remember Me & Forgot Password (Sign In only) */}
              {mode === 'login' && (
                <div className="flex items-center justify-between text-xs font-mono pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-cyan-500 dark:bg-slate-900 cursor-pointer"
                    />
                    <span>Remember workstation</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:underline transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 sm:py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-cyan-700 hover:from-cyan-500 hover:via-sky-500 hover:to-cyan-600 text-white font-mono font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md hover:shadow-cyan-500/20 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{mode === 'login' ? 'Authenticating Session...' : 'Creating Account...'}</span>
                  </div>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In to Command Center' : 'Create Analyst Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Direct Switch Link */}
            <div className="pt-2 text-center text-xs font-mono text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800/80">
              {mode === 'login' ? (
                <p>
                  Don't have an analyst account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('register')}
                    className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Create account →
                  </button>
                </p>
              ) : (
                <p>
                  Already have an analyst account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Sign in →
                  </button>
                </p>
              )}
            </div>

            {/* Cryptographic Session Assurance */}
            <div className="text-center">
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                ThreatLens Hardware Keystore Bound • SOC-2 Certified
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Forgot Password Recovery Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={email}
      />
    </div>
  );
};

export default AuthSplitPage;
