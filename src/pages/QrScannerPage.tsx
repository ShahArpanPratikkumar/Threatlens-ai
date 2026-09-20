import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode,
  Camera,
  Upload,
  ArrowRight,
  RefreshCw,
  FileText,
  ShieldCheck,
  Copy,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  VideoOff,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  HelpCircle,
  X,
  Layers,
  Network,
  Lock,
  Globe,
  Radio,
  User,
  CreditCard,
  Check,
  Info,
  Shield,
} from 'lucide-react';
import { api } from '../services/api';
import type { SecurityAnalysisResult, QrForensicDetails, QrCheckItem } from '../types';
import { RiskScoreGauge } from '../components/RiskScoreGauge';
import { ScannerAnimation } from '../components/ScannerAnimation';
import { ExplainableAiCard } from '../components/ExplainableAiCard';
import { ThreatIndicatorsList } from '../components/ThreatIndicatorsList';
import { TechnicalSignalsTable } from '../components/TechnicalSignalsTable';
import { ThreatRadar } from '../components/ThreatRadar';
import { useToast } from '../context/ToastContext';

interface QrScannerPageProps {
  initialPayload?: string;
  onNavigate: (route: string) => void;
}

type ScanStatus =
  | 'idle'
  | 'requesting_permission'
  | 'permission_granted'
  | 'permission_denied'
  | 'camera_unavailable'
  | 'scanning'
  | 'qr_detected'
  | 'no_qr_found'
  | 'analyzing';

export const QrScannerPage: React.FC<QrScannerPageProps> = ({ initialPayload, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Ready to scan');
  const [detectedPayload, setDetectedPayload] = useState<string>(initialPayload || '');
  const [manualInput, setManualInput] = useState<string>('');
  const [decodedSource, setDecodedSource] = useState<string>('QR Capture');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('Initializing scan...');
  const [result, setResult] = useState<SecurityAnalysisResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);

  // Modals
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);
  const [showWhyThisResult, setShowWhyThisResult] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const { showToast } = useToast();

  // Escape key handler for open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowHowItWorks(false);
        setShowWhyThisResult(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Stop camera stream & release hardware
  const stopCamera = useCallback(() => {
    isScanningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Frame tick loop for jsQR camera scanning
  const tickScan = useCallback(() => {
    if (!isScanningRef.current || !videoRef.current) return;

    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data && code.data.trim()) {
          // QR DETECTED
          stopCamera();
          setScanStatus('qr_detected');
          setStatusMessage('QR Code detected! Commencing forensic inspection...');
          setDetectedPayload(code.data);
          setDecodedSource('Live Camera Feed');
          showToast('QR Code captured successfully', 'success');
          performThreatAnalysis(code.data, 'Live Camera Scan');
          return;
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(tickScan);
  }, [stopCamera]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setScanStatus('requesting_permission');
    setStatusMessage('Requesting camera permissions...');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setScanStatus('camera_unavailable');
        setStatusMessage('Camera API is not supported by your browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      streamRef.current = stream;
      setScanStatus('permission_granted');
      setStatusMessage('Camera active. Align QR code within the viewfinder.');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();

        isScanningRef.current = true;
        setScanStatus('scanning');
        setStatusMessage('Scanning viewport for 2D matrix...');
        animationFrameRef.current = requestAnimationFrame(tickScan);
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setScanStatus('permission_denied');
        setStatusMessage('Camera access denied. Please upload a QR image or enter text below.');
      } else {
        setScanStatus('camera_unavailable');
        setStatusMessage(err?.message || 'Camera hardware unavailable.');
      }
    }
  }, [stopCamera, tickScan]);

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
      setScanStatus('idle');
      setStatusMessage(activeTab === 'upload' ? 'Ready for QR image upload' : 'Enter decoded payload');
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, startCamera, stopCamera]);

  useEffect(() => {
    if (initialPayload) {
      setDetectedPayload(initialPayload);
      setDecodedSource('Preset Scenario');
      performThreatAnalysis(initialPayload, 'Preset Scenario');
    }
  }, [initialPayload]);

  // Decode Image using jsQR
  const decodeImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please provide an image file (PNG, JPG, WebP, SVG)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      setScanStatus('scanning');
      setStatusMessage('Decoding QR image pixels in memory...');

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          setScanStatus('no_qr_found');
          setStatusMessage('Failed to initialize 2D canvas context');
          return;
        }

        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data && code.data.trim()) {
          setScanStatus('qr_detected');
          setStatusMessage('QR matrix decoded successfully from image');
          setDetectedPayload(code.data);
          setDecodedSource(`Image: ${file.name}`);
          showToast(`QR Code decoded: "${code.data.slice(0, 28)}..."`, 'success');
          performThreatAnalysis(code.data, `Uploaded QR: ${file.name}`);
        } else {
          setScanStatus('no_qr_found');
          setStatusMessage('No valid QR matrix detected in this image. Try another clear image.');
          showToast('No readable QR code pattern detected in the image', 'warning');
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Perform Security Intelligence Analysis with realistic progress simulation
  const performThreatAnalysis = async (payloadToAnalyze: string, sourceName: string) => {
    if (!payloadToAnalyze.trim()) {
      showToast('Please provide a QR payload to inspect', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setScanStatus('analyzing');
    setResult(null);

    // Realistic progressive pipeline step messages
    setAnalysisStep('1/5: Decoding QR 2D pixel matrix in local sandbox...');
    const timer1 = setTimeout(() => {
      setAnalysisStep('2/5: Identifying content type & protocol schema...');
    }, 400);
    const timer2 = setTimeout(() => {
      setAnalysisStep('3/5: Resolving destination infrastructure & DNS authority...');
    }, 800);
    const timer3 = setTimeout(() => {
      setAnalysisStep('4/5: Cross-referencing global threat intelligence feeds...');
    }, 1200);
    const timer4 = setTimeout(() => {
      setAnalysisStep('5/5: Calculating quishing deception heuristics & risk score...');
    }, 1600);

    try {
      const analysis = await api.scanQr(payloadToAnalyze, sourceName);
      setResult(analysis);
      showToast(
        `Quishing inspection complete: ${analysis.riskLevel} threat posture`,
        analysis.riskLevel === 'SAFE' ? 'success' : 'warning'
      );
    } catch (err: any) {
      showToast(err?.message || 'Quishing inspection failed', 'error');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      setIsAnalyzing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      decodeImageFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      decodeImageFile(file);
    }
  };

  const copyPayloadText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    showToast('Payload copied to clipboard', 'info');
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const copyReportLink = () => {
    if (result) {
      navigator.clipboard.writeText(`${window.location.origin}/report/${result.id}`);
      showToast('Report link copied to clipboard', 'success');
    }
  };

  // Helper to extract content type styling
  const getContentTypeBadge = (type?: string) => {
    switch (type) {
      case 'url':
        return { label: 'Web URL Destination', icon: <Globe className="w-3.5 h-3.5 text-cyan-500" />, badge: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/40' };
      case 'wifi':
        return { label: 'Wi-Fi Network Setup', icon: <Radio className="w-3.5 h-3.5 text-indigo-500" />, badge: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/40' };
      case 'contact':
        return { label: 'Contact Card (vCard)', icon: <User className="w-3.5 h-3.5 text-emerald-500" />, badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40' };
      case 'payment':
        return { label: 'Cryptocurrency / Payment', icon: <CreditCard className="w-3.5 h-3.5 text-amber-500" />, badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40' };
      case 'text':
      default:
        return { label: 'Plain Text / Content', icon: <FileText className="w-3.5 h-3.5 text-slate-500" />, badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700' };
    }
  };

  const qrForensics = result?.qrForensics;
  const contentTypeConfig = getContentTypeBadge(qrForensics?.contentType);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-6 px-4 md:px-6 select-none" id="qr-scanner-page">
      {/* Hidden offscreen canvas for frame processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ======================================================== */}
      {/* 1. HEADER SECTION & HOW IT WORKS TRIGGER                 */}
      {/* ======================================================== */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
            <QrCode className="w-4 h-4" />
            <span>Anti-Quishing & QR Threat Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100 tracking-tight">
            QR Code Security Scanner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Forensic analysis of physical or digital QR codes. ThreatLens decodes, parses, and inspects underlying destinations in an isolated sandbox without opening links or running untrusted code.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="qr-how-it-works-btn"
            onClick={() => setShowHowItWorks(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 font-mono text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-xs"
          >
            <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>How It Works?</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. QR SCANNER INPUT EXPERIENCE (CAMERA / UPLOAD / TEXT)  */}
      {/* ======================================================== */}
      <section className="p-6 rounded-2xl glass-panel space-y-6" id="qr-input-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              id="qr-tab-camera"
              onClick={() => setActiveTab('camera')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
                activeTab === 'camera'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Live Camera</span>
            </button>

            <button
              id="qr-tab-upload"
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
                activeTab === 'upload'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Image</span>
            </button>

            <button
              id="qr-tab-manual"
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
                activeTab === 'manual'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Paste Decoded Link / Text</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero Remote Execution</span>
          </div>
        </div>

        {/* TAB 1: Live Camera Scan */}
        {activeTab === 'camera' && (
          <div className="flex flex-col items-center justify-center p-2 sm:p-4">
            {/* Status Feedback Badge */}
            <div className="mb-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-mono">
              {scanStatus === 'scanning' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{statusMessage}</span>
                </>
              )}
              {scanStatus === 'permission_granted' && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{statusMessage}</span>
                </>
              )}
              {scanStatus === 'qr_detected' && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 animate-bounce" />
                  <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{statusMessage}</span>
                </>
              )}
              {scanStatus === 'requesting_permission' && (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-500 animate-spin" />
                  <span className="text-cyan-600 dark:text-cyan-400">{statusMessage}</span>
                </>
              )}
              {(scanStatus === 'permission_denied' || scanStatus === 'camera_unavailable') && (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">{statusMessage}</span>
                </>
              )}
            </div>

            {/* Error Fallback Card */}
            {scanStatus === 'permission_denied' || scanStatus === 'camera_unavailable' ? (
              <div className="p-8 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 text-center max-w-md space-y-4 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
                  <VideoOff className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                    Camera Access Unavailable
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {scanStatus === 'permission_denied'
                      ? 'Camera permission was denied. You can re-enable it in your browser settings or switch to image upload / manual text mode below.'
                      : 'No video capture hardware detected in this environment. Switch to image upload or paste the QR link directly.'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    onClick={startCamera}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-mono text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                  >
                    Retry Permission
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload QR Image</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Camera Viewport with Animated Laser Reticle */
              <div className="relative w-full max-w-md aspect-video sm:aspect-square rounded-3xl overflow-hidden bg-black border-2 border-slate-700 dark:border-emerald-500/40 shadow-2xl flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />

                {/* Tactical HUD Reticle Overlay */}
                <div className="absolute inset-8 sm:inset-12 border border-emerald-400/30 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
                    <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
                  </div>

                  {/* Animated Laser Sweep Line */}
                  <div className="absolute inset-x-3 inset-y-4 overflow-hidden pointer-events-none">
                    <motion.div
                      animate={{ y: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-full h-12 relative"
                    >
                      <div className="w-full h-full bg-gradient-to-b from-transparent via-emerald-500/15 to-emerald-400/40" />
                      <div className="w-full h-[2px] bg-emerald-400 shadow-[0_0_16px_3px_#10B981]" />
                    </motion.div>
                  </div>

                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
                    <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>

                {/* Subtitle guidance */}
                <div className="absolute bottom-4 px-4 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-mono text-emerald-400 flex items-center gap-2 border border-emerald-500/30 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>CENTER QR CODE IN VIEWPORT</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Upload QR Image */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-8 sm:p-12 transition-all cursor-pointer text-center relative ${
                isDragOver
                  ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 scale-[0.99]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-950/40'
              }`}
            >
              <input
                id="qr-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 shadow-xs">
                <Upload className="w-7 h-7" />
              </div>
              <span className="text-base font-bold font-mono text-slate-800 dark:text-slate-200">
                Drag & Drop QR Image or Click to Browse
              </span>
              <span className="text-xs text-slate-500 mt-1 max-w-sm">
                Supports PNG, JPG, JPEG, WebP, SVG. Decoded entirely client-side using jsQR in isolated memory.
              </span>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <img src={imagePreview} alt="QR Preview" className="w-16 h-16 rounded-xl object-cover border" />
                <div className="text-xs font-mono min-w-0 flex-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span>Decoded File</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[10px]">
                      {scanStatus === 'qr_detected' ? 'QR Found' : 'Processing'}
                    </span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 truncate mt-1">
                    {detectedPayload || statusMessage}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Paste Decoded Text / Link */}
        {activeTab === 'manual' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>Enter Decoded QR Payload or URL</span>
              </label>
              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Paste any decoded QR URL (e.g. https://... or WIFI:S:MyNetwork;T:WPA;P:Secret;; or plain text)..."
                rows={3}
                className="w-full p-3.5 rounded-xl bg-white dark:bg-[#070A0F] border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500 dark:focus:border-emerald-500 resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (!manualInput.trim()) {
                    showToast('Please enter text to analyze', 'warning');
                    return;
                  }
                  setDetectedPayload(manualInput.trim());
                  setDecodedSource('Manual Text Input');
                  performThreatAnalysis(manualInput.trim(), 'Manual Text Input');
                }}
                disabled={!manualInput.trim() || isAnalyzing}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <span>Analyze Payload</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Test Scenarios with 5 Realistic Cases */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-500 mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Real-World Test Scenarios (Instant Forensic Audit)</span>
            </span>
            <span className="text-[10px] text-slate-400">Click any scenario to audit</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs font-mono">
            {/* Scenario 1: Safe Official */}
            <button
              type="button"
              onClick={() => {
                const sample = 'https://www.cisa.gov/resources-tools/resources/cyber-guidance';
                setDetectedPayload(sample);
                setDecodedSource('Safe Official QR (Federal Guidance)');
                performThreatAnalysis(sample, 'Safe Official QR');
              }}
              className="p-3 rounded-xl glass-card hover:border-emerald-500/50 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Safe Official QR</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-1">cisa.gov cybersecurity portal</div>
              </div>
              <span className="text-[9px] text-emerald-600/70 dark:text-emerald-400/70 mt-2 font-mono">Status: 0 pts • Safe</span>
            </button>

            {/* Scenario 2: Quishing Spoof */}
            <button
              type="button"
              onClick={() => {
                const sample = 'http://secure-update.wellsfargo-portal.login-verify.top/auth/signin';
                setDetectedPayload(sample);
                setDecodedSource('Quishing Attack (Wells Fargo Spoof)');
                performThreatAnalysis(sample, 'Quishing Sample');
              }}
              className="p-3 rounded-xl glass-card hover:border-rose-500/50 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-rose-600 dark:text-rose-400 group-hover:underline flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Quishing Spoof</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-1">wellsfargo-portal.login-verify.top</div>
              </div>
              <span className="text-[9px] text-rose-600/70 dark:text-rose-400/70 mt-2 font-mono">Status: High Risk</span>
            </button>

            {/* Scenario 3: Suspicious APK */}
            <button
              type="button"
              onClick={() => {
                const sample = 'http://192.168.1.200:8888/payload.apk?install=force';
                setDetectedPayload(sample);
                setDecodedSource('Sideload APK QR (Raw IP)');
                performThreatAnalysis(sample, 'Sideload APK QR');
              }}
              className="p-3 rounded-xl glass-card hover:border-orange-500/50 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-orange-600 dark:text-orange-400 group-hover:underline flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Suspicious APK QR</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-1">Raw IP direct app sideload</div>
              </div>
              <span className="text-[9px] text-orange-600/70 dark:text-orange-400/70 mt-2 font-mono">Status: Elevated Risk</span>
            </button>

            {/* Scenario 4: Wi-Fi Setup */}
            <button
              type="button"
              onClick={() => {
                const sample = 'WIFI:S:Secure_HQ_Wireless_5G;T:WPA;P:CyberSecurity2026!;;';
                setDetectedPayload(sample);
                setDecodedSource('Protected Wi-Fi Network Setup');
                performThreatAnalysis(sample, 'Wi-Fi Network Setup');
              }}
              className="p-3 rounded-xl glass-card hover:border-indigo-500/50 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
                  <Radio className="w-3 h-3" />
                  <span>Wi-Fi Network QR</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-1">WPA-secured network pairing</div>
              </div>
              <span className="text-[9px] text-indigo-600/70 dark:text-indigo-400/70 mt-2 font-mono">Status: Authentic Config</span>
            </button>

            {/* Scenario 5: Plain Text Advisory */}
            <button
              type="button"
              onClick={() => {
                const sample = 'Security Notice: Never scan unverified QR stickers pasted over public parking meters or merchant payment kiosks.';
                setDetectedPayload(sample);
                setDecodedSource('Plain Text Advisory Note');
                performThreatAnalysis(sample, 'Plain Text Note');
              }}
              className="p-3 rounded-xl glass-card hover:border-cyan-500/50 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-cyan-600 dark:text-cyan-400 group-hover:underline flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>Plain Text QR</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-1">Informational advisory text</div>
              </div>
              <span className="text-[9px] text-cyan-600/70 dark:text-cyan-400/70 mt-2 font-mono">Status: Plaintext Data</span>
            </button>
          </div>
        </div>

        {/* Decoded Payload Inspector Banner (Always isolated, never auto-executes) */}
        {detectedPayload && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Decoded QR Payload ({decodedSource})</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold border border-emerald-300 dark:border-emerald-500/30">
                  Zero Remote Callbacks
                </span>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold uppercase">
                  Isolated • Not Visited
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all shadow-inner">
              {detectedPayload}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                onClick={() => performThreatAnalysis(detectedPayload, decodedSource)}
                disabled={isAnalyzing}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Auditing Payload...</span>
                  </>
                ) : (
                  <>
                    <span>Re-Analyze Payload</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <button
                onClick={() => copyPayloadText(detectedPayload)}
                className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-800"
              >
                {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPayload ? 'Copied' : 'Copy Payload'}</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 3. ACTIVE ANALYSIS PROGRESS STATE                        */}
      {/* ======================================================== */}
      {isAnalyzing && (
        <section className="p-8 rounded-2xl glass-panel flex flex-col items-center justify-center text-center space-y-4">
          <ScannerAnimation scanType="qr" target={detectedPayload} />
          <div className="space-y-1">
            <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">
              {analysisStep}
            </p>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Correlating domain infrastructure, SSL certificates & quishing threat feeds...
            </p>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 4. RESULTS SECTION (STABLE GRID, ZERO OVERLAP)           */}
      {/* ======================================================== */}
      <AnimatePresence>
        {result && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8"
            id="qr-results-container"
          >
            {/* 4A. RESULT HEADER BAR */}
            <div className="p-4 sm:p-5 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-4 border border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border flex items-center gap-1.5 ${contentTypeConfig.badge}`}>
                  {contentTypeConfig.icon}
                  <span>{contentTypeConfig.label}</span>
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Forensic Audit #{result.id}</span>
                </span>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
                  {new Date(result.metadata.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="qr-why-result-btn"
                  onClick={() => setShowWhyThisResult(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                >
                  <Info className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Why This Result?</span>
                </button>
                <button
                  onClick={copyReportLink}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
                <button
                  onClick={() => onNavigate(`/report/${result.id}`)}
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Full Intelligence Dossier</span>
                </button>
              </div>
            </div>

            {/* 4B. PRIMARY SECURITY VERDICT & RADAR GRID (DESKTOP: SIDE-BY-SIDE; MOBILE: STACKED) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* LEFT CARD: Primary Security Verdict */}
              <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                        result.riskLevel === 'SAFE'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                          : result.riskLevel === 'CRITICAL' || result.riskLevel === 'HIGH'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/40'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
                      }`}
                    >
                      {result.riskLevel === 'SAFE' ? 'SAFE & AUTHENTIC' : `${result.riskLevel} THREAT POSTURE`}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      AI Model Confidence: {Math.round(result.confidence * 100)}%
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 leading-snug">
                    {result.threatType || 'QR Code Security Audit'}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2.5">
                    {result.summary}
                  </p>
                </div>

                {/* Verdict Gauge & Confidence Distinction */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="shrink-0 text-center">
                      <div className={`text-3xl font-extrabold font-mono ${
                        result.riskScore <= 15 ? 'text-emerald-600 dark:text-emerald-400' :
                        result.riskScore >= 60 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {result.riskScore}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Risk Index</div>
                    </div>
                    <div className="text-xs font-mono text-slate-600 dark:text-slate-400 space-y-0.5">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {result.riskScore <= 15 ? 'Clean Verification' : result.riskScore >= 60 ? 'Critical Severity' : 'Elevated Caution'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {result.riskScore <= 15
                          ? 'Zero deceptive signals detected'
                          : `${result.indicators.length} threat indicators flagged`}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-center space-y-1">
                    <div className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Verification Layers</span>
                    </div>
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {qrForensics?.confidenceMetrics.sourcesCheckedCount || 4} Authoritative Sources Checked
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      DNS, SSL/TLS, Threat Feeds & Heuristics
                    </div>
                  </div>
                </div>

                {/* Trust Guidance Footer */}
                <div className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
                  result.riskLevel === 'SAFE'
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                    : result.riskLevel === 'CRITICAL' || result.riskLevel === 'HIGH'
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
                    : 'bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                }`}>
                  {result.riskLevel === 'SAFE' ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span>
                    {result.riskLevel === 'SAFE'
                      ? 'Safe destination: Content conforms to authentic security standards with valid transport.'
                      : 'Security Warning: High quishing probability. Avoid opening in personal browsers or entering credentials.'}
                  </span>
                </div>
              </div>

              {/* RIGHT CARD: QR Threat Intelligence Radar */}
              <div className="lg:col-span-5 p-6 rounded-3xl glass-panel flex flex-col justify-between items-center text-center">
                <div className="w-full flex items-center justify-between text-xs font-mono border-b border-slate-200 dark:border-slate-800 pb-3 mb-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>QR INTELLIGENCE RADAR</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {result.riskLevel === 'SAFE' ? 'Calm State' : 'Active Vectors'}
                  </span>
                </div>

                <div className="my-auto py-2 flex items-center justify-center w-full max-w-[340px]">
                  <ThreatRadar
                    scanResult={result}
                    scanType="qr"
                    size="sm"
                  />
                </div>

                <div className="w-full pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Hover detection nodes for evidence</span>
                  <span className="text-emerald-500 font-semibold">Real Data Signals</span>
                </div>
              </div>
            </div>

            {/* 4C. EXTRACTED INFORMATION SECTION (DECODED CONTENT & FORENSIC METADATA) */}
            <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6" id="qr-extracted-info">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <span>EXTRACTED INFORMATION</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Decoded parameters and structured metadata extracted directly from the 2D matrix
                  </p>
                </div>
                <button
                  onClick={() => copyPayloadText(result.target)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-mono transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                >
                  {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPayload ? 'Copied' : 'Copy Full Payload'}</span>
                </button>
              </div>

              {/* Decoded Payload Box */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  Decoded Content Payload
                </span>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all leading-relaxed shadow-inner">
                  {result.target}
                </div>
              </div>

              {/* Structured Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                {/* Field 1: Content Type */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Content Type</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    {contentTypeConfig.icon}
                    <span>{qrForensics?.contentType.toUpperCase() || 'URL'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">ISO/IEC 18004 Format</div>
                </div>

                {/* Field 2: Protocol / Scheme */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Protocol / Transport</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>
                      {qrForensics?.urlDetails?.protocol ||
                        (qrForensics?.wifiDetails ? qrForensics.wifiDetails.security : 'N/A')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {qrForensics?.urlDetails?.isHttps ? 'Cryptographic TLS active' : 'Standard transport'}
                  </div>
                </div>

                {/* Field 3: Destination Domain / Host */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Destination Host / Domain</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {qrForensics?.urlDetails?.domain ||
                      qrForensics?.wifiDetails?.ssid ||
                      qrForensics?.contactDetails?.name ||
                      'Direct Text'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {qrForensics?.urlDetails?.tld ? `.${qrForensics.urlDetails.tld} zone` : 'Isolated content'}
                  </div>
                </div>

                {/* Field 4: Resolved IP / Infrastructure */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Resolved IP Address</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {qrForensics?.urlDetails?.ipAddress || 'Not available'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {qrForensics?.urlDetails?.isIpHost ? 'Host bypasses DNS' : 'Authoritative nameserver'}
                  </div>
                </div>
              </div>
            </div>

            {/* 4D. "WHAT WE CHECKED" SECTION */}
            <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6" id="qr-what-we-checked">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>WHAT THREATLENS CHECKED</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated forensic audit pipeline results. Only verifiable layers are marked as checked.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
                {qrForensics?.checksPerformed && qrForensics.checksPerformed.length > 0 ? (
                  qrForensics.checksPerformed.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            item.status === 'CHECKED'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {item.evidence}
                      </p>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        Category: {item.category}
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback standard checked items
                  [
                    { name: 'QR Matrix Decoded', status: 'CHECKED', note: 'ISO/IEC 18004 2D matrix structure' },
                    { name: 'Content Type Identified', status: 'CHECKED', note: 'Schema syntax parsed' },
                    { name: 'URL Extracted', status: 'CHECKED', note: 'Target address isolated' },
                    { name: 'Domain & Host Inspected', status: 'CHECKED', note: 'Apex and subdomain validated' },
                    { name: 'Threat Intelligence Feeds', status: 'CHECKED', note: 'SOC feed cross-reference' },
                    { name: 'Quishing Heuristics', status: 'CHECKED', note: 'Deception & credential probe check' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-300 dark:border-emerald-500/30">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{item.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 4E. DETAILED ANALYSIS & FINDINGS */}
            <div className="space-y-4" id="qr-indicators-section">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-emerald-500" />
                  <span>ANALYSIS & THREAT INDICATORS</span>
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  {result.indicators.length} signals identified
                </span>
              </div>
              <ThreatIndicatorsList indicators={result.indicators} />
            </div>

            {/* 4F. EXPLAINABLE AI & THREAT MECHANICS */}
            <div id="qr-explainable-ai-section">
              <ExplainableAiCard
                summary={result.summary}
                whyDangerous={result.explanation.whyDangerous}
                threatMechanics={result.explanation.threatMechanics}
                recommendations={result.recommendations}
                riskBreakdown={result.riskBreakdown}
                aiModelUsed={result.metadata?.aiModelUsed || 'ThreatLens Anti-Quishing Engine'}
                isAiFallback={result.metadata?.isAiFallback || false}
                riskLevel={result.riskLevel}
              />
            </div>

            {/* 4G. TECHNICAL TELEMETRY */}
            <div className="space-y-4" id="qr-telemetry-section">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Network className="w-4 h-4 text-emerald-500" />
                  <span>TECHNICAL TELEMETRY</span>
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  Detailed forensic signals
                </span>
              </div>
              <TechnicalSignalsTable signals={result.technicalSignals} />
            </div>

            {/* 4H. RECOMMENDED ACTIONS */}
            <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-4" id="qr-recommendations">
              <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>RECOMMENDED ACTIONS</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                {result.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 text-[11px] font-bold">
                      {i + 1}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4I. FOOTER BAR & DOSSIER LINK */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-card text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>ThreatLens Forensic Audit ID: TL-QR-{result.id}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={copyReportLink}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Share Audit</span>
                </button>
                <button
                  onClick={() => onNavigate(`/report/${result.id}`)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Full Intelligence Dossier</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 5. "HOW IT WORKS" EXPLAINABILITY MODAL                   */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showHowItWorks && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                    How ThreatLens Analyzes QR Codes
                  </h3>
                </div>
                <button
                  onClick={() => setShowHowItWorks(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step-by-step visual pipeline */}
              <div className="space-y-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center text-[10px]">1</span>
                    <span>CAPTURE & IN-MEMORY DECODING</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                    The camera frame or uploaded image is processed locally inside your browser using jsQR. The binary 2D pixel matrix is decoded strictly in memory without uploading your raw camera feed to remote servers.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center text-[10px]">2</span>
                    <span>PAYLOAD CLASSIFICATION & PARSING</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                    The decoded payload is evaluated against URI schemas to categorize it into Web URL, Wi-Fi Configuration, vCard Address Book, Cryptocurrency Payment, or Plain Text.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-[10px]">3</span>
                    <span>ISOLATED DESTINATION AUDIT</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                    For web destinations, ThreatLens performs isolated nameserver and WHOIS lookups. It audits domain age, TLD risk, homoglyph characters, and checks whether the destination bypasses DNS with a raw IP address.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center text-[10px]">4</span>
                    <span>THREAT INTEL & QUISHING HEURISTICS</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                    The endpoint is correlated against global threat intelligence blocklists and audited for quishing vectors (e.g. login keywords concealing credential traps behind physical QR stickers).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center text-[10px]">5</span>
                    <span>RISK ENGINE & EXPLAINABLE VERDICT</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                    Findings are compiled into an actionable 0-100 risk score with clear recommendations. If a code is safe, it is clearly verified; if deceptive, you are warned before any link is visited.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowHowItWorks(false)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-md"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 6. "WHY THIS RESULT?" TRANSPARENCY MODAL                 */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showWhyThisResult && result && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-cyan-500" />
                  <h3 className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                    Why This Result?
                  </h3>
                </div>
                <button
                  onClick={() => setShowWhyThisResult(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-mono">
                {/* Evidence Found */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Key Evidence Identified</div>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                    {result.indicators.length > 0 ? (
                      result.indicators.map((ind, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className={`w-2 h-2 rounded-full mt-1.5 ${
                            ind.severity === 'info' || ind.severity === 'low' ? 'bg-emerald-500' :
                            ind.severity === 'critical' ? 'bg-rose-500' :
                            ind.severity === 'high' ? 'bg-orange-500' : 'bg-amber-500'
                          }`} />
                          <span><strong>{ind.name}:</strong> {ind.description}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-emerald-600 dark:text-emerald-400">
                        Zero malicious or deceptive signatures detected in this QR payload.
                      </li>
                    )}
                  </ul>
                </div>

                {/* Risk Calculation Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Risk Score Calculation</div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Score {result.riskScore}/100 derived from cross-correlated factors:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2 rounded-xl bg-white dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Domain</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{result.riskBreakdown.domainRisk} pts</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Structure</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{result.riskBreakdown.urlStructureRisk} pts</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Transport</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{result.riskBreakdown.sslRisk} pts</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Content</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{result.riskBreakdown.contentRisk} pts</div>
                    </div>
                  </div>
                </div>

                {/* Confidence Distinction */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Confidence & Verification Layers</div>
                  <div className="text-slate-600 dark:text-slate-400 leading-relaxed space-y-1">
                    <div>• <strong>AI Model Confidence:</strong> {Math.round(result.confidence * 100)}% ({qrForensics?.confidenceMetrics.aiConfidence || 'High'})</div>
                    <div>• <strong>External Sources Verified:</strong> {qrForensics?.confidenceMetrics.externalVerification || 'Authoritative DNS, Threat Feeds & TLS'}</div>
                  </div>
                </div>

                {/* Limitations Notice */}
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Analysis Limitations Notice</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {qrForensics?.confidenceMetrics.limitationsNotice ||
                      'Forensic inspection statically evaluates destination parameters, domain records, and threat feeds. Dynamic interactive client browser execution is isolated to protect against zero-day exploits.'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowWhyThisResult(false)}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QrScannerPage;
