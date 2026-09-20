import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CinematicLoaderProps {
  onComplete: () => void;
}

type BootPhase =
  | 'black'
  | 'ring_draw'
  | 'shield_draw'
  | 'shield_activate'
  | 'scanning'
  | 'ready'
  | 'expanding'
  | 'complete';

export const CinematicLoader: React.FC<CinematicLoaderProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<BootPhase>('black');
  const [statusText, setStatusText] = useState<string>('INITIALIZING SECURITY CORE');
  const [statusState, setStatusState] = useState<'idle' | 'scanning' | 'ready'>('idle');
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Safe trigger for completion to prevent double-firing
  const completedRef = useRef<boolean>(false);
  const handleFinish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  // Body scroll lock during splash
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Reduced motion & Keyboard shortcut (ESC to skip)
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setIsReducedMotion(true);
      setStatusText('SECURITY SYSTEM READY');
      const timer = setTimeout(() => {
        handleFinish();
      }, 1400);
      return () => clearTimeout(timer);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFinish]);

  // Timed Cinematic Sequence Orchestration
  useEffect(() => {
    if (isReducedMotion) return;

    const timers: NodeJS.Timeout[] = [];

    // Step 1 -> Step 2: Ring Form (400ms)
    timers.push(
      setTimeout(() => {
        setPhase('ring_draw');
        setStatusText('INITIALIZING SECURITY CORE');
      }, 400)
    );

    // Step 2 -> Step 3: Shield Draw (1100ms)
    timers.push(
      setTimeout(() => {
        setPhase('shield_draw');
      }, 1100)
    );

    // Step 3 -> Step 4: Shield Activate (2000ms)
    timers.push(
      setTimeout(() => {
        setPhase('shield_activate');
        setStatusText('LOADING THREAT INTELLIGENCE');
        setStatusState('scanning');
      }, 2000)
    );

    // Step 4 -> Step 5 & 6: Shield Scanning Light Beam (2800ms)
    timers.push(
      setTimeout(() => {
        setPhase('scanning');
        setStatusText('INITIALIZING AI ENGINE');
      }, 2800)
    );

    // Step 7: Shield Complete / Ready State (3800ms)
    timers.push(
      setTimeout(() => {
        setPhase('ready');
        setStatusText('SECURITY SYSTEM READY');
        setStatusState('ready');
      }, 3800)
    );

    // Step 8: Final Logo Expansion toward camera (4400ms)
    timers.push(
      setTimeout(() => {
        setPhase('expanding');
      }, 4400)
    );

    // Step 9: Transition to main website (5300ms)
    timers.push(
      setTimeout(() => {
        setPhase('complete');
        handleFinish();
      }, 5300)
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [isReducedMotion, handleFinish]);

  // Subtle floating background particles canvas (cybersecurity atmosphere)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Subtle particles: quiet, purposeful, non-distracting
    const count = Math.min(36, Math.floor(width / 35));
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.4 + 0.6,
      alpha: Math.random() * 0.35 + 0.12,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle connection lines between close nodes
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 95) {
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.08 * (1 - dist / 95)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw subtle particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `rgba(6, 182, 212, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const isExpanding = phase === 'expanding';
  const isRingActive = phase !== 'black';
  const isShieldDrawn = phase !== 'black' && phase !== 'ring_draw';
  const isShieldActive =
    phase === 'shield_activate' || phase === 'scanning' || phase === 'ready' || phase === 'expanding';
  const isScanning = phase === 'scanning';
  const isReady = phase === 'ready' || phase === 'expanding';

  return (
    <AnimatePresence>
      <motion.div
        key="threatlens-cyber-splash"
        initial={{ opacity: 1 }}
        animate={{
          opacity: isExpanding ? 0 : 1,
        }}
        transition={{
          duration: 0.9,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#020408] text-slate-100 select-none overflow-hidden"
        id="cybersecurity-splash-screen"
        style={{ perspective: '1200px' }}
      >
        {/* 1. Extremely Subtle Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(6, 182, 212, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* 2. Soft Deep Radial Vignette & Moving Ambient Light */}
        <motion.div
          animate={{
            scale: isReady ? [1, 1.15, 1.05] : [1, 1.06, 1],
            opacity: isExpanding ? 0 : isReady ? 0.35 : 0.22,
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          className="absolute w-[600px] h-[600px] bg-cyan-500/15 blur-[160px] rounded-full pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />

        {/* 3. Floating Node Particles Canvas */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
            isExpanding ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Subtle Top-Right Skip Control */}
        <div className="absolute top-6 right-6 z-20">
          <button
            type="button"
            onClick={handleFinish}
            className="text-[10px] text-slate-500 hover:text-cyan-400 font-mono tracking-widest uppercase transition-colors px-2.5 py-1 rounded-md border border-slate-800/80 hover:border-cyan-500/40 bg-slate-950/60 backdrop-blur-xs"
            aria-label="Skip splash animation"
          >
            Skip [ESC]
          </button>
        </div>

        {/* Central Stage: Cyber Security Shield & Reticle */}
        <motion.div
          animate={{
            scale: isExpanding ? 0.88 : 1,
            opacity: isExpanding ? 0 : 1,
            filter: isExpanding ? 'blur(12px)' : 'blur(0px)',
          }}
          transition={{
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative flex flex-col items-center justify-center max-w-[360px] sm:max-w-[440px] w-full px-4"
        >
          {/* Main Shield SVG Canvas */}
          <div className="relative w-[300px] h-[350px] sm:w-[360px] sm:h-[420px] flex items-center justify-center">
            <svg
              viewBox="0 0 360 420"
              className="w-full h-full overflow-visible drop-shadow-[0_0_24px_rgba(6,182,212,0.25)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Luminous Glow Filter */}
                <filter id="cyanLaserGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur1" />
                  <feGaussianBlur stdDeviation="8" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Intense Core Bloom Filter */}
                <filter id="coreBloom" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Shield Dark Glass Fill Gradient */}
                <linearGradient id="shieldGlassFill" x1="180" y1="38" x2="180" y2="384" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#081426" stopOpacity="0.88" />
                  <stop offset="45%" stopColor="#050B16" stopOpacity="0.92" />
                  <stop offset="100%" stopColor="#02050A" stopOpacity="0.96" />
                </linearGradient>

                {/* Specular Edge Gradient */}
                <linearGradient id="specularEdge" x1="54" y1="68" x2="306" y2="384" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.95" />
                  <stop offset="35%" stopColor="#06B6D4" stopOpacity="0.75" />
                  <stop offset="70%" stopColor="#0284C7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.9" />
                </linearGradient>

                {/* Horizontal Scanning Beam Gradient */}
                <linearGradient id="scanLaserBeam" x1="0" y1="-28" x2="0" y2="28" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="rgba(6, 182, 212, 0)" />
                  <stop offset="30%" stopColor="rgba(6, 182, 212, 0.25)" />
                  <stop offset="48%" stopColor="rgba(56, 189, 248, 0.7)" />
                  <stop offset="50%" stopColor="#FFFFFF" />
                  <stop offset="52%" stopColor="rgba(56, 189, 248, 0.7)" />
                  <stop offset="70%" stopColor="rgba(6, 182, 212, 0.25)" />
                  <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
                </linearGradient>

                {/* Clip Path for Shield Interior (Keeps scan beam inside the shield) */}
                <clipPath id="shieldInnerClip">
                  <path d="M 180 38 L 306 68 C 304 176 290 252 180 384 C 70 252 56 176 54 68 Z" />
                </clipPath>
              </defs>

              {/* STEP 2: Outer Circular Security Calibration Ring & Degree Guides */}
              <g className="transition-opacity duration-700" style={{ opacity: isRingActive ? 1 : 0 }}>
                {/* Thin outer circular range guide */}
                <motion.circle
                  cx="180"
                  cy="200"
                  r="175"
                  stroke="rgba(6, 182, 212, 0.18)"
                  strokeWidth="1"
                  strokeDasharray="4 8"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
                  style={{ transformOrigin: '180px 200px' }}
                />

                {/* Secondary inner calibrated ring */}
                <motion.circle
                  cx="180"
                  cy="200"
                  r="150"
                  stroke="rgba(6, 182, 212, 0.12)"
                  strokeWidth="1"
                  strokeDasharray="2 12"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                  style={{ transformOrigin: '180px 200px' }}
                />

                {/* Cardinal Tick Marks */}
                <line x1="180" y1="16" x2="180" y2="28" stroke="rgba(6, 182, 212, 0.45)" strokeWidth="1.5" />
                <line x1="180" y1="372" x2="180" y2="384" stroke="rgba(6, 182, 212, 0.45)" strokeWidth="1.5" />
                <line x1="4" y1="200" x2="16" y2="200" stroke="rgba(6, 182, 212, 0.45)" strokeWidth="1.5" />
                <line x1="344" y1="200" x2="356" y2="200" stroke="rgba(6, 182, 212, 0.45)" strokeWidth="1.5" />
              </g>

              {/* STEP 3 & 4: Progressive Shield Outline Construction */}
              {/* Shield Body Fill (Dark Glass Effect) */}
              <motion.path
                d="M 180 38 L 306 68 C 304 176 290 252 180 384 C 70 252 56 176 54 68 Z"
                fill="url(#shieldGlassFill)"
                initial={{ opacity: 0 }}
                animate={{ opacity: isShieldActive ? 1 : 0 }}
                transition={{ duration: 0.6 }}
              />

              {/* Inner Facet Security Lines (Activated inside the shield) */}
              <g
                clipPath="url(#shieldInnerClip)"
                className="transition-opacity duration-700"
                style={{ opacity: isShieldActive ? 1 : 0 }}
              >
                {/* Subtle Hexagonal / Faceted Pattern */}
                <line
                  x1="180"
                  y1="38"
                  x2="180"
                  y2="384"
                  stroke="rgba(6, 182, 212, 0.16)"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
                <line x1="180" y1="168" x2="74" y2="84" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" />
                <line x1="180" y1="168" x2="286" y2="84" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" />
                <line x1="180" y1="168" x2="62" y2="200" stroke="rgba(6, 182, 212, 0.12)" strokeWidth="1" />
                <line x1="180" y1="168" x2="298" y2="200" stroke="rgba(6, 182, 212, 0.12)" strokeWidth="1" />
                <line x1="180" y1="168" x2="180" y2="356" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1.2" />

                {/* Concentric Telemetry Arcs around central core */}
                <circle
                  cx="180"
                  cy="168"
                  r="42"
                  stroke="rgba(6, 182, 212, 0.25)"
                  strokeWidth="1"
                  strokeDasharray="6 10"
                />
                <circle
                  cx="180"
                  cy="168"
                  r="72"
                  stroke="rgba(6, 182, 212, 0.16)"
                  strokeWidth="1"
                  strokeDasharray="8 14"
                />

                {/* Inner Shield Nesting Line */}
                <path
                  d="M 180 58 L 286 84 C 284 176 272 238 180 356 C 88 238 76 176 74 84 Z"
                  stroke="rgba(6, 182, 212, 0.35)"
                  strokeWidth="1"
                  fill="none"
                />
              </g>

              {/* STEP 3: Self-Drawing Outer Shield Path (Constructs from top to sides to bottom) */}
              <motion.path
                d="M 180 38 L 306 68 C 304 176 290 252 180 384 C 70 252 56 176 54 68 Z"
                stroke="url(#specularEdge)"
                strokeWidth={isReady ? '2.5' : '2'}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={isShieldActive ? 'url(#cyanLaserGlow)' : undefined}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: isShieldDrawn ? 1 : 0,
                  opacity: isShieldDrawn ? 1 : 0,
                }}
                transition={{
                  duration: 0.9,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />

              {/* STEP 6: Scanning Light Beam passing Top -> Middle -> Bottom -> Reverse */}
              <g clipPath="url(#shieldInnerClip)">
                <motion.g
                  animate={
                    isScanning
                      ? { y: [38, 360, 110, 168] }
                      : isReady
                      ? { y: 168 }
                      : { y: 20 }
                  }
                  transition={{
                    duration: 1.5,
                    ease: 'easeInOut',
                  }}
                >
                  {/* Beam Vertical Halo */}
                  <rect
                    x="40"
                    y="-28"
                    width="280"
                    height="56"
                    fill="url(#scanLaserBeam)"
                    opacity={isScanning ? 0.9 : isReady ? 0.25 : 0}
                  />
                  {/* Razor Sharp Laser Line */}
                  <line
                    x1="45"
                    y1="0"
                    x2="315"
                    y2="0"
                    stroke="#E0F2FE"
                    strokeWidth="2"
                    filter="url(#cyanLaserGlow)"
                    opacity={isScanning ? 1 : 0}
                  />
                </motion.g>
              </g>

              {/* STEP 5: Corner Data Points, Signal Nodes & Connection Markers */}
              <g className="transition-opacity duration-500" style={{ opacity: isShieldActive ? 1 : 0 }}>
                {/* Top Center Node */}
                <circle cx="180" cy="38" r="3" fill="#38BDF8" filter="url(#cyanLaserGlow)" />
                {/* Top-Right Shoulder Node */}
                <circle cx="306" cy="68" r="2.5" fill="#06B6D4" />
                {/* Top-Left Shoulder Node */}
                <circle cx="54" cy="68" r="2.5" fill="#06B6D4" />
                {/* Bottom Apex Node */}
                <circle cx="180" cy="384" r="3" fill="#38BDF8" filter="url(#cyanLaserGlow)" />

                {/* Subtle telemetry corner ticks */}
                <path d="M 40 54 L 40 44 L 50 44" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" fill="none" />
                <path d="M 320 54 L 320 44 L 310 44" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" fill="none" />
                <path d="M 170 404 L 180 412 L 190 404" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" fill="none" />
              </g>

              {/* STEP 7: Central AI Security Core */}
              <g
                transform="translate(180, 168)"
                className="transition-opacity duration-700"
                style={{ opacity: isShieldActive ? 1 : 0 }}
              >
                {/* Expanding pulse shockwave when system becomes ready */}
                {isReady && (
                  <motion.circle
                    cx="0"
                    cy="0"
                    r="16"
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                    fill="none"
                    initial={{ scale: 0.8, opacity: 0.85 }}
                    animate={{ scale: 3.2, opacity: 0 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}

                {/* Outer Rotating Diamond Frame */}
                <motion.rect
                  x="-16"
                  y="-16"
                  width="32"
                  height="32"
                  stroke="#06B6D4"
                  strokeWidth="1.2"
                  fill="rgba(6, 182, 212, 0.08)"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                />

                {/* Inner Counter-Rotating Hex Frame */}
                <motion.circle
                  cx="0"
                  cy="0"
                  r="10"
                  stroke="#38BDF8"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />

                {/* Central Luminous Node Core */}
                <motion.circle
                  cx="0"
                  cy="0"
                  r="5"
                  fill="#FFFFFF"
                  filter="url(#coreBloom)"
                  animate={{
                    scale: isReady ? [1, 1.35, 1.1] : [1, 1.2, 1],
                    opacity: isReady ? [0.95, 1, 0.95] : [0.75, 0.9, 0.75],
                  }}
                  transition={{
                    duration: isReady ? 1.0 : 1.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </g>

              {/* STEP 4: "THREATLENS AI" Inside the Shield */}
              {/* Positioned inside the shield lower apex below the central core, perfectly responsive */}
              <motion.g
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: isShieldActive && !isExpanding ? 1 : 0,
                  scale: isShieldActive && !isExpanding ? (isReady ? 1.14 : 1) : 0.9,
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ transformOrigin: '180px 278px' }}
              >
                <text
                  x="180"
                  y="282"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    letterSpacing: '0.24em',
                    fontSize: '15.5px',
                    filter: isReady
                      ? 'drop-shadow(0 0 14px rgba(6,182,212,0.95)) drop-shadow(0 0 4px #FFFFFF)'
                      : 'drop-shadow(0 0 8px rgba(6,182,212,0.6))',
                  }}
                >
                  THREATLENS{' '}
                  <tspan
                    fill="#06B6D4"
                    style={{
                      fontWeight: 900,
                      filter: 'drop-shadow(0 0 10px #06B6D4)',
                    }}
                  >
                    AI
                  </tspan>
                </text>
              </motion.g>
            </svg>
          </div>

          {/* STEP 5: Security System Status Text (smooth sequence cycling below the shield) */}
          <div className="mt-4 flex flex-col items-center justify-center min-h-[44px]">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase">
              {/* Status indicator pulse dot */}
              <span
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  statusState === 'ready'
                    ? 'bg-emerald-400 shadow-[0_0_10px_#34D399]'
                    : statusState === 'scanning'
                    ? 'bg-cyan-400 shadow-[0_0_10px_#06B6D4] animate-pulse'
                    : 'bg-slate-600'
                }`}
              />
              <AnimatePresence mode="wait">
                <motion.span
                  key={statusText}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className={`${
                    statusState === 'ready'
                      ? 'text-emerald-400 font-bold'
                      : 'text-slate-400 font-medium'
                  }`}
                >
                  {statusText}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Subtle Progress Bar */}
            <div className="w-48 h-[2px] bg-slate-900 rounded-full mt-2.5 overflow-hidden border border-slate-800/60">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 shadow-[0_0_8px_#06B6D4]"
                animate={{
                  width:
                    phase === 'black'
                      ? '5%'
                      : phase === 'ring_draw'
                      ? '25%'
                      : phase === 'shield_draw'
                      ? '50%'
                      : phase === 'shield_activate'
                      ? '70%'
                      : phase === 'scanning'
                      ? '88%'
                      : '100%',
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* STEP 8: FINAL LOGO EXPANSION TOWARD THE VIEWER (THE CRUCIAL FINALE)     */}
        {/* THREATLENS AI grows large, surges toward the screen, and dissolves smoothly */}
        {/* ========================================================================= */}
        {isExpanding && (
          <motion.div
            key="expanding-logo-portal"
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            initial={{
              scale: 1,
              opacity: 0.9,
              filter: 'blur(0px)',
            }}
            animate={{
              scale: [1, 2.4, 14],
              opacity: [0.95, 1, 0],
              filter: ['blur(0px)', 'blur(1.5px)', 'blur(28px)'],
            }}
            transition={{
              duration: 0.9,
              times: [0, 0.45, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div className="flex items-center gap-3 sm:gap-4 font-sans font-black tracking-[0.26em] text-3xl sm:text-5xl md:text-6xl drop-shadow-[0_0_40px_rgba(6,182,212,0.85)]">
              <span className="text-white">THREATLENS</span>
              <span className="text-cyan-400 drop-shadow-[0_0_30px_#06B6D4]">AI</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CinematicLoader;
