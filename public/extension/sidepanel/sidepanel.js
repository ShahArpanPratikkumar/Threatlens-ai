/**
 * ThreatLens AI — Side Panel Core Application Logic
 * Pure Manifest V3 compliant implementation (No eval, no inline scripts, zero remote code)
 */

(() => {
  // Global State
  let activeTabUrl = '';
  let activeTabTitle = '';
  let activeTabId = null;
  let isSystemPage = false;
  let currentScanResult = null;
  let authToken = null;
  let currentUser = null;
  let apiBaseUrl = 'http://localhost:3000';
  let anonymousSessionId = 'ext-anon-' + Math.random().toString(36).substring(2, 11);
  let authMode = 'login'; // 'login' | 'register'

  // DOM Element Selectors
  const currentTabUrlEl = document.getElementById('current-tab-url');
  const systemPageNotice = document.getElementById('system-page-notice');
  const inspectCurrentBtn = document.getElementById('inspect-current-btn');
  const notAnalyzedCard = document.getElementById('not-analyzed-card');
  const currentScanningBox = document.getElementById('current-scanning-box');
  const scanStepLabel = document.getElementById('scan-step-label');
  const currentResultsContainer = document.getElementById('current-results-container');
  const verdictBanner = document.getElementById('verdict-banner');
  const verdictLevel = document.getElementById('verdict-level');
  const verdictThreatType = document.getElementById('verdict-threat-type');
  const verdictConfidence = document.getElementById('verdict-confidence');
  const verdictScore = document.getElementById('verdict-score');
  const analysisSummaryText = document.getElementById('analysis-summary-text');
  const evidenceListBox = document.getElementById('evidence-list-box');
  const signalsContainer = document.getElementById('signals-container');
  const radarPolygon = document.getElementById('radar-polygon');
  const viewFullReportBtn = document.getElementById('view-full-report-btn');
  const rescanCurrentBtn = document.getElementById('rescan-current-btn');
  const openWebappBtn = document.getElementById('open-webapp-btn');
  const footerWebLink = document.getElementById('footer-web-link');
  const connectionChip = document.getElementById('connection-chip');
  const connectionText = document.getElementById('connection-text');

  // Quick Tools Elements
  const manualUrlInput = document.getElementById('manual-url-input');
  const scanManualUrlBtn = document.getElementById('scan-manual-url-btn');
  const messageInput = document.getElementById('message-input');
  const scanMessageBtn = document.getElementById('scan-message-btn');
  const captureTabBtn = document.getElementById('capture-tab-btn');
  const screenshotFileInput = document.getElementById('screenshot-file-input');
  const screenshotPreviewBox = document.getElementById('screenshot-preview-box');
  const screenshotPreviewImg = document.getElementById('screenshot-preview-img');
  const analyzeScreenshotBtn = document.getElementById('analyze-screenshot-btn');
  let pendingScreenshotBase64 = null;
  const qrFileInput = document.getElementById('qr-file-input');
  const qrDecodedBox = document.getElementById('qr-decoded-box');
  const qrDecodedText = document.getElementById('qr-decoded-text');
  const scanQrBtn = document.getElementById('scan-qr-btn');
  let pendingQrPayload = null;
  const quickToolResult = document.getElementById('quick-tool-result');
  const quickResultTitle = document.getElementById('quick-result-title');
  const quickResultBadge = document.getElementById('quick-result-badge');
  const quickResultContent = document.getElementById('quick-result-content');

  // History & Dashboard Elements
  const historyItemsList = document.getElementById('history-items-list');
  const historyLoadingText = document.getElementById('history-loading-text');
  const refreshHistoryBtn = document.getElementById('refresh-history-btn');
  const dashTotalScans = document.getElementById('dash-total-scans');
  const dashCleanScans = document.getElementById('dash-clean-scans');
  const dashSuspiciousScans = document.getElementById('dash-suspicious-scans');
  const dashHighScans = document.getElementById('dash-high-scans');

  // Account & Settings Elements
  const accountLoggedIn = document.getElementById('account-logged-in');
  const accountLoggedOut = document.getElementById('account-logged-out');
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const logoutBtn = document.getElementById('logout-btn');
  const authModeLabel = document.getElementById('auth-mode-label');
  const authNameInput = document.getElementById('auth-name-input');
  const authEmailInput = document.getElementById('auth-email-input');
  const authPasswordInput = document.getElementById('auth-password-input');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const authBtnText = document.getElementById('auth-btn-text');
  const toggleAuthModeLink = document.getElementById('toggle-auth-mode-link');
  const authErrorMsg = document.getElementById('auth-error-msg');
  const apiBaseUrlInput = document.getElementById('api-base-url-input');
  const saveApiUrlBtn = document.getElementById('save-api-url-btn');
  const resetApiUrlBtn = document.getElementById('reset-api-url-btn');
  const apiUrlStatus = document.getElementById('api-url-status');

  // =========================================================================
  // STORAGE HELPERS (Chrome Storage with LocalStorage fallback)
  // =========================================================================
  function getStorage(key, callback) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([key], (res) => callback(res ? res[key] : null));
    } else {
      try {
        const val = localStorage.getItem(key);
        callback(val ? JSON.parse(val) : null);
      } catch {
        callback(null);
      }
    }
  }

  function setStorage(key, value, callback) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const obj = {};
      obj[key] = value;
      chrome.storage.local.set(obj, callback);
    } else {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
      if (callback) callback();
    }
  }

  function removeStorage(key, callback) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove([key], callback);
    } else {
      try {
        localStorage.removeItem(key);
      } catch {}
      if (callback) callback();
    }
  }

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  async function init() {
    setupTabNavigation();
    setupToolSubtabs();
    setupEventListeners();

    // Determine default API base URL
    if (window.location.origin && (window.location.origin.includes('localhost') || window.location.origin.includes('run.app'))) {
      apiBaseUrl = window.location.origin;
    }

    // Load saved settings & auth
    getStorage('threatlens_api_url', (savedUrl) => {
      if (savedUrl) {
        apiBaseUrl = savedUrl;
      }
      apiBaseUrlInput.value = apiBaseUrl;
      testApiConnection();
    });

    getStorage('threatlens_anon_id', (savedAnonId) => {
      if (savedAnonId) {
        anonymousSessionId = savedAnonId;
      } else {
        setStorage('threatlens_anon_id', anonymousSessionId);
      }
    });

    getStorage('threatlens_auth', (authData) => {
      if (authData && authData.token) {
        authToken = authData.token;
        currentUser = authData.user;
        renderAccountState();
      } else {
        renderAccountState();
      }
      loadHistory();
    });

    // Check for pending scan target passed from context menu
    getStorage('pendingScanTarget', (pendingUrl) => {
      if (pendingUrl) {
        manualUrlInput.value = pendingUrl;
        removeStorage('pendingScanTarget');
        // Switch to quick tools URL tab
        activateTab('tab-tools');
      }
    });

    // Detect active tab
    detectActiveTab();
  }

  // =========================================================================
  // ACTIVE TAB DETECTION & MONITORING
  // =========================================================================
  function detectActiveTab() {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
          updateCurrentTabInfo(tabs[0].url, tabs[0].title, tabs[0].id);
        } else {
          updateCurrentTabInfo('https://github.com/', 'GitHub', null);
        }
      });
    } else {
      updateCurrentTabInfo(window.location.href, document.title, null);
    }
  }

  function isInternalChromePage(url) {
    if (!url) return true;
    const lower = url.toLowerCase();
    return (
      lower.startsWith('chrome://') ||
      lower.startsWith('chrome-extension://') ||
      lower.startsWith('edge://') ||
      lower.startsWith('about:') ||
      lower.startsWith('view-source:') ||
      lower.startsWith('devtools://') ||
      lower.includes('chromewebstore.google.com')
    );
  }

  function updateCurrentTabInfo(url, title, tabId) {
    activeTabUrl = url || '';
    activeTabTitle = title || '';
    activeTabId = tabId;
    isSystemPage = isInternalChromePage(activeTabUrl);

    currentTabUrlEl.textContent = activeTabUrl || 'No active tab detected';
    currentTabUrlEl.title = activeTabUrl;

    const protocolBadge = document.getElementById('page-protocol-badge');
    if (activeTabUrl.startsWith('https://')) {
      protocolBadge.textContent = 'HTTPS';
      protocolBadge.style.color = '#10b981';
      protocolBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    } else if (activeTabUrl.startsWith('http://')) {
      protocolBadge.textContent = 'HTTP (INSECURE)';
      protocolBadge.style.color = '#f59e0b';
      protocolBadge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
    } else {
      protocolBadge.textContent = 'SYSTEM';
      protocolBadge.style.color = '#94a3b8';
      protocolBadge.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }

    if (isSystemPage) {
      systemPageNotice.style.display = 'block';
      inspectCurrentBtn.disabled = true;
      inspectCurrentBtn.title = 'Internal Chrome pages cannot be scanned.';
    } else {
      systemPageNotice.style.display = 'none';
      inspectCurrentBtn.disabled = false;
      inspectCurrentBtn.title = 'Inspect active page';
    }

    // Tab changed -> reset to Not Analyzed state (Never show SAFE until inspected)
    currentScanResult = null;
    currentResultsContainer.style.display = 'none';
    currentScanningBox.style.display = 'none';
    notAnalyzedCard.style.display = 'block';
  }

  // Listen for messages from background service worker
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'TAB_CHANGED' || msg.type === 'TAB_UPDATED') {
        updateCurrentTabInfo(msg.url, msg.title, msg.tabId);
      }
    });
  }

  // =========================================================================
  // INSPECT CURRENT PAGE
  // =========================================================================
  async function handleInspectCurrentPage() {
    if (!activeTabUrl || isSystemPage) return;

    inspectCurrentBtn.disabled = true;
    notAnalyzedCard.style.display = 'none';
    currentResultsContainer.style.display = 'none';
    currentScanningBox.style.display = 'flex';

    // Sequence of high-tech scanning step labels
    const steps = [
      'Resolving DNS A-records & IP geolocation...',
      'Validating SSL/TLS cryptographic chain...',
      'Deconstructing URL authority & homoglyphs...',
      'Evaluating behavioral AI heuristics...'
    ];
    let stepIdx = 0;
    scanStepLabel.textContent = steps[0];
    const stepTimer = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      scanStepLabel.textContent = steps[stepIdx];
    }, 450);

    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-ThreatLens-Anon-Session': anonymousSessionId
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch(`${apiBaseUrl}/api/scan/url`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: activeTabUrl })
      });

      clearInterval(stepTimer);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 403 && (errorData.code === 'AUTH_REQUIRED' || errorData.requiresAuth)) {
          alert('Free scan limit reached. Please sign in or create an account in the Account tab for unlimited scans.');
          activateTab('tab-account');
          return;
        }
        throw new Error(errorData.error || `Scan error (${res.status})`);
      }

      const result = await res.json();
      currentScanResult = result;
      renderCurrentScanResult(result);
      loadHistory(); // refresh history
    } catch (err) {
      clearInterval(stepTimer);
      alert('ThreatLens scan failed: ' + (err.message || 'Service unavailable'));
      notAnalyzedCard.style.display = 'block';
    } finally {
      currentScanningBox.style.display = 'none';
      inspectCurrentBtn.disabled = isSystemPage;
    }
  }

  function renderCurrentScanResult(result) {
    notAnalyzedCard.style.display = 'none';
    currentScanningBox.style.display = 'none';
    currentResultsContainer.style.display = 'flex';

    // Verdict Banner
    const level = (result.riskLevel || 'SAFE').toUpperCase();
    verdictLevel.textContent = level;
    verdictThreatType.textContent = result.threatType || 'Security Inspection';
    verdictScore.textContent = result.riskScore ?? 0;
    verdictConfidence.textContent = `Confidence: ${Math.round((result.confidence || 0.95) * 100)}%`;

    verdictBanner.className = 'verdict-banner ' + level.toLowerCase();

    // Summary Text
    analysisSummaryText.textContent = result.summary || 'Target analysis complete.';

    // Evidence List
    evidenceListBox.innerHTML = '';
    const reasons = result.explanation && result.explanation.whyDangerous ? result.explanation.whyDangerous : [];
    if (reasons.length > 0) {
      reasons.slice(0, 3).forEach((r) => {
        const item = document.createElement('div');
        item.style.cssText = 'display: flex; align-items: flex-start; gap: 6px; font-size: 11px; color: var(--text-primary);';
        item.innerHTML = `<span style="color: var(--accent-cyan); font-weight: bold;">•</span><span>${escapeHtml(r)}</span>`;
        evidenceListBox.appendChild(item);
      });
    } else {
      const item = document.createElement('div');
      item.style.cssText = 'color: var(--accent-emerald); font-size: 11px;';
      item.textContent = '✓ No deceptive patterns or malicious indicators detected.';
      evidenceListBox.appendChild(item);
    }

    // Signals List
    signalsContainer.innerHTML = '';
    const signals = result.technicalSignals || [];
    signals.slice(0, 4).forEach((sig) => {
      const div = document.createElement('div');
      div.className = 'signal-item';
      let dotColor = '#10b981';
      if (sig.status === 'malicious') dotColor = '#f43f5e';
      else if (sig.status === 'suspicious') dotColor = '#f59e0b';

      div.innerHTML = `
        <div>
          <span class="signal-status-dot" style="background-color: ${dotColor};"></span>
          <span style="font-weight: 600;">${escapeHtml(sig.key || 'Signal')}</span>
        </div>
        <span class="signal-category">${escapeHtml(String(sig.value || ''))}</span>
      `;
      signalsContainer.appendChild(div);
    });

    // Threat Radar Polygon Calculation
    updateRadarPolygon(result);
  }

  function updateRadarPolygon(result) {
    const rb = result.riskBreakdown || {};
    const domainNorm = Math.min(1, Math.max(0.1, (rb.domainRisk || 0) / 25));
    const urlNorm = Math.min(1, Math.max(0.1, (rb.urlStructureRisk || 0) / 25));
    const sslNorm = Math.min(1, Math.max(0.1, (rb.sslRisk || 0) / 20));
    const intelNorm = Math.min(1, Math.max(0.1, (rb.reputationRisk || 0) / 20));
    const aiNorm = Math.min(1, Math.max(0.1, (rb.aiRisk || 0) / 30));

    // Radar Center (100, 80) Max Radius ~ 65
    const cx = 100, cy = 80;
    const p1 = `${cx},${cy - 65 * domainNorm}`; // Top (Domain)
    const p2 = `${cx + 55 * urlNorm},${cy - 30 * urlNorm}`; // Top-Right (URL)
    const p3 = `${cx + 55 * sslNorm},${cy + 30 * sslNorm}`; // Bottom-Right (SSL)
    const p4 = `${cx},${cy + 65 * intelNorm}`; // Bottom (Intel)
    const p5 = `${cx - 55 * (urlNorm * 0.5)},${cy + 30 * (urlNorm * 0.5)}`; // Bottom-Left (Route)
    const p6 = `${cx - 55 * aiNorm},${cy - 30 * aiNorm}`; // Top-Left (AI)

    radarPolygon.setAttribute('points', `${p1} ${p2} ${p3} ${p4} ${p5} ${p6}`);

    let strokeColor = '#10b981';
    let fillColor = 'rgba(16, 185, 129, 0.25)';
    if (result.riskScore > 60) {
      strokeColor = '#f43f5e';
      fillColor = 'rgba(244, 63, 94, 0.35)';
    } else if (result.riskScore > 25) {
      strokeColor = '#f59e0b';
      fillColor = 'rgba(245, 158, 11, 0.3)';
    }
    radarPolygon.setAttribute('stroke', strokeColor);
    radarPolygon.setAttribute('fill', fillColor);
  }

  // =========================================================================
  // QUICK TOOLS (URL, MESSAGE, SCREENSHOT, QR)
  // =========================================================================
  async function handleScanManualUrl() {
    const target = (manualUrlInput.value || '').trim();
    if (!target) return alert('Please enter a valid URL to scan');

    scanManualUrlBtn.disabled = true;
    scanManualUrlBtn.textContent = 'Analyzing...';
    quickToolResult.style.display = 'none';

    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-ThreatLens-Anon-Session': anonymousSessionId
      };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`${apiBaseUrl}/api/scan/url`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: target })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');

      renderQuickResult(
        `URL Inspection: ${data.target}`,
        data.riskLevel,
        data.riskScore,
        data.summary,
        data.id
      );
      loadHistory();
    } catch (err) {
      alert('Inspection error: ' + err.message);
    } finally {
      scanManualUrlBtn.disabled = false;
      scanManualUrlBtn.textContent = 'Inspect URL';
    }
  }

  async function handleScanMessage() {
    const text = (messageInput.value || '').trim();
    if (!text) return alert('Please paste message content to analyze');

    scanMessageBtn.disabled = true;
    scanMessageBtn.textContent = 'Analyzing text patterns...';
    quickToolResult.style.display = 'none';

    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-ThreatLens-Anon-Session': anonymousSessionId
      };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`${apiBaseUrl}/api/scan/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Message scan failed');

      renderQuickResult(
        `Message Threat: ${data.threatType || 'Social Engineering Analysis'}`,
        data.riskLevel,
        data.riskScore,
        data.summary,
        data.id
      );
      loadHistory();
    } catch (err) {
      alert('Message inspection error: ' + err.message);
    } finally {
      scanMessageBtn.disabled = false;
      scanMessageBtn.textContent = 'Inspect Message';
    }
  }

  // Screenshot Capture Active Tab via Background Worker
  async function handleCaptureTabScreenshot() {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      captureTabBtn.disabled = true;
      captureTabBtn.textContent = '📸 Capturing tab...';
      chrome.runtime.sendMessage({ type: 'CAPTURE_TAB_SCREENSHOT' }, (response) => {
        captureTabBtn.disabled = false;
        captureTabBtn.innerHTML = '<span>📸 Capture Current Tab Screenshot</span>';
        if (response && response.success && response.dataUrl) {
          pendingScreenshotBase64 = response.dataUrl;
          screenshotPreviewImg.src = response.dataUrl;
          screenshotPreviewBox.style.display = 'block';
          analyzeScreenshotBtn.disabled = false;
        } else {
          alert('Could not capture screenshot. (Internal browser pages cannot be screenshotted).');
        }
      });
    } else {
      alert('Chrome tab capture is only available within an active unpacked extension.');
    }
  }

  // Screenshot File Upload
  screenshotFileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        pendingScreenshotBase64 = reader.result;
        screenshotPreviewImg.src = reader.result;
        screenshotPreviewBox.style.display = 'block';
        analyzeScreenshotBtn.disabled = false;
      };
      reader.readAsDataURL(file);
    }
  });

  async function handleAnalyzeScreenshot() {
    if (!pendingScreenshotBase64) return;

    analyzeScreenshotBtn.disabled = true;
    analyzeScreenshotBtn.textContent = 'Analyzing visual layout & OCR...';
    quickToolResult.style.display = 'none';

    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-ThreatLens-Anon-Session': anonymousSessionId
      };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`${apiBaseUrl}/api/scan/screenshot`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ image: pendingScreenshotBase64 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Screenshot inspection failed');

      renderQuickResult(
        `Screenshot Analysis: ${data.threatType || 'Visual Assessment'}`,
        data.riskLevel,
        data.riskScore,
        data.summary,
        data.id
      );
      loadHistory();
    } catch (err) {
      alert('Screenshot inspection error: ' + err.message);
    } finally {
      analyzeScreenshotBtn.disabled = false;
      analyzeScreenshotBtn.textContent = 'Inspect Screenshot';
    }
  }

  // QR File Input
  qrFileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        pendingQrPayload = reader.result;
        qrDecodedBox.style.display = 'flex';
        qrDecodedText.textContent = `Image Loaded: ${file.name}`;
        scanQrBtn.disabled = false;
      };
      reader.readAsDataURL(file);
    }
  });

  async function handleScanQr() {
    if (!pendingQrPayload) return;

    scanQrBtn.disabled = true;
    scanQrBtn.textContent = 'Decoding & inspecting QR...';
    quickToolResult.style.display = 'none';

    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-ThreatLens-Anon-Session': anonymousSessionId
      };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`${apiBaseUrl}/api/scan/qr`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ qrData: pendingQrPayload })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'QR scan failed');

      renderQuickResult(
        `QR / Quishing Analysis: ${data.threatType || 'Payload Inspection'}`,
        data.riskLevel,
        data.riskScore,
        data.summary,
        data.id
      );
      loadHistory();
    } catch (err) {
      alert('QR inspection error: ' + err.message);
    } finally {
      scanQrBtn.disabled = false;
      scanQrBtn.textContent = 'Inspect QR Threat';
    }
  }

  function renderQuickResult(title, level, score, summary, scanId) {
    quickToolResult.style.display = 'flex';
    quickResultTitle.textContent = title;
    quickResultBadge.textContent = `${level} (${score}/100)`;

    let color = '#10b981';
    if (level === 'CRITICAL' || level === 'HIGH') color = '#f43f5e';
    else if (level === 'MEDIUM' || level === 'SUSPICIOUS') color = '#f59e0b';
    quickResultBadge.style.color = color;
    quickResultBadge.style.borderColor = color;

    quickResultContent.innerHTML = `
      <p style="margin-bottom: 8px;">${escapeHtml(summary)}</p>
      ${scanId ? `<button id="btn-open-quick-report" class="btn-secondary" style="font-size: 10px; padding: 4px 8px;">Open Full Web Report ↗</button>` : ''}
    `;

    const openRepBtn = document.getElementById('btn-open-quick-report');
    if (openRepBtn && scanId) {
      openRepBtn.onclick = () => openWebReport(scanId);
    }
  }

  // =========================================================================
  // HISTORY & DASHBOARD SYNC
  // =========================================================================
  async function loadHistory() {
    historyLoadingText.style.display = 'block';
    historyItemsList.innerHTML = '';

    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-ThreatLens-Anon-Session': anonymousSessionId
      };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`${apiBaseUrl}/api/scans`, { headers });
      if (!res.ok) throw new Error('Could not fetch history');

      const data = await res.json();
      const scans = data.scans || [];

      historyLoadingText.style.display = 'none';

      // Update Dashboard Metrics
      dashTotalScans.textContent = scans.length;
      const cleanCount = scans.filter((s) => s.riskLevel === 'SAFE' || s.riskScore < 20).length;
      const highCount = scans.filter((s) => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL' || s.riskScore >= 60).length;
      const suspCount = scans.length - cleanCount - highCount;

      dashCleanScans.textContent = cleanCount;
      dashSuspiciousScans.textContent = Math.max(0, suspCount);
      dashHighScans.textContent = highCount;

      if (scans.length === 0) {
        historyItemsList.innerHTML = `
          <div style="text-align: center; padding: 16px; color: var(--text-muted); font-size: 11px;">
            No scans recorded yet. Run an inspection to populate your security history.
          </div>
        `;
        return;
      }

      scans.slice(0, 15).forEach((scan) => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const dateStr = new Date(scan.createdAt || scan.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let badgeColor = '#10b981';
        if (scan.riskLevel === 'HIGH' || scan.riskLevel === 'CRITICAL') badgeColor = '#f43f5e';
        else if (scan.riskLevel === 'MEDIUM' || scan.riskLevel === 'SUSPICIOUS') badgeColor = '#f59e0b';

        item.innerHTML = `
          <div class="history-top">
            <span class="history-target" title="${escapeHtml(scan.target)}">${escapeHtml(scan.target)}</span>
            <span class="status-chip" style="color: ${badgeColor}; border-color: ${badgeColor};">${scan.riskLevel} (${scan.riskScore})</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; color: var(--text-secondary);">${escapeHtml(scan.threatType || 'Inspection')}</span>
            <span class="history-date">${dateStr}</span>
          </div>
        `;

        item.onclick = () => {
          openWebReport(scan.id);
        };
        historyItemsList.appendChild(item);
      });
    } catch {
      historyLoadingText.textContent = 'Could not load scans (backend unreachable).';
    }
  }

  // =========================================================================
  // AUTHENTICATION & SETTINGS
  // =========================================================================
  function renderAccountState() {
    if (authToken && currentUser) {
      accountLoggedIn.style.display = 'flex';
      accountLoggedOut.style.display = 'none';
      profileName.textContent = currentUser.name || 'ThreatLens Operator';
      profileEmail.textContent = currentUser.email || '';
    } else {
      accountLoggedIn.style.display = 'none';
      accountLoggedOut.style.display = 'flex';
    }
  }

  async function handleAuthSubmit() {
    authErrorMsg.style.display = 'none';
    const email = (authEmailInput.value || '').trim();
    const password = (authPasswordInput.value || '').trim();
    const name = (authNameInput.value || '').trim();

    if (!email || !password) {
      showAuthError('Please enter both email and password');
      return;
    }

    authSubmitBtn.disabled = true;
    authBtnText.textContent = 'Authenticating...';

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = { email, password, anonymousSessionId };
      if (authMode === 'register') {
        body.name = name || email.split('@')[0];
      }

      const res = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      authToken = data.token;
      currentUser = data.user;
      setStorage('threatlens_auth', { token: authToken, user: currentUser });

      authPasswordInput.value = '';
      renderAccountState();
      loadHistory();
      testApiConnection();
      activateTab('tab-current');
    } catch (err) {
      showAuthError(err.message);
    } finally {
      authSubmitBtn.disabled = false;
      authBtnText.textContent = authMode === 'login' ? 'Sign In' : 'Create Account';
    }
  }

  function showAuthError(msg) {
    authErrorMsg.textContent = msg;
    authErrorMsg.style.display = 'block';
  }

  function handleLogout() {
    authToken = null;
    currentUser = null;
    removeStorage('threatlens_auth');
    renderAccountState();
    loadHistory();
  }

  // =========================================================================
  // API CONNECTIVITY & WEB APP LINKING
  // =========================================================================
  async function testApiConnection() {
    connectionText.textContent = 'CHECKING...';
    connectionChip.style.color = '#94a3b8';
    try {
      const startTime = Date.now();
      const res = await fetch(`${apiBaseUrl}/api/health`).catch(() => null);
      const latency = Date.now() - startTime;
      if (res && res.ok) {
        connectionText.textContent = 'ONLINE';
        connectionChip.style.color = '#10b981';
        apiUrlStatus.textContent = `✓ Connected to SOC Engine (${latency}ms)`;
        apiUrlStatus.style.color = '#10b981';
      } else {
        throw new Error();
      }
    } catch {
      connectionText.textContent = 'OFFLINE';
      connectionChip.style.color = '#f43f5e';
      apiUrlStatus.textContent = '✗ Backend unreachable at this URL';
      apiUrlStatus.style.color = '#f43f5e';
    }
  }

  function openWebReport(scanId) {
    const url = `${apiBaseUrl}/report/${scanId}`;
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  }

  function openWebApp(path = '') {
    const url = `${apiBaseUrl}${path}`;
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  }

  // =========================================================================
  // UI HELPERS & LISTENERS
  // =========================================================================
  function setupTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        activateTab(tab.dataset.tab);
      });
    });
  }

  function activateTab(tabId) {
    document.querySelectorAll('.nav-tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-pane').forEach((p) => {
      p.classList.toggle('active', p.id === tabId);
    });
  }

  function setupToolSubtabs() {
    const subtabs = document.querySelectorAll('.tool-subtab');
    subtabs.forEach((st) => {
      st.addEventListener('click', () => {
        subtabs.forEach((s) => s.classList.toggle('active', s === st));
        const targetViewId = st.dataset.subtab;
        document.querySelectorAll('.tool-view').forEach((tv) => {
          tv.style.display = tv.id === targetViewId ? 'flex' : 'none';
        });
      });
    });

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        manualUrlInput.value = btn.dataset.url;
      });
    });
  }

  function setupEventListeners() {
    inspectCurrentBtn.addEventListener('click', handleInspectCurrentPage);
    rescanCurrentBtn.addEventListener('click', handleInspectCurrentPage);
    scanManualUrlBtn.addEventListener('click', handleScanManualUrl);
    scanMessageBtn.addEventListener('click', handleScanMessage);
    captureTabBtn.addEventListener('click', handleCaptureTabScreenshot);
    analyzeScreenshotBtn.addEventListener('click', handleAnalyzeScreenshot);
    scanQrBtn.addEventListener('click', handleScanQr);
    refreshHistoryBtn.addEventListener('click', loadHistory);
    authSubmitBtn.addEventListener('click', handleAuthSubmit);
    logoutBtn.addEventListener('click', handleLogout);

    viewFullReportBtn.addEventListener('click', () => {
      if (currentScanResult && currentScanResult.id) {
        openWebReport(currentScanResult.id);
      }
    });

    openWebappBtn.addEventListener('click', () => openWebApp('/dashboard'));
    footerWebLink.addEventListener('click', (e) => {
      e.preventDefault();
      openWebApp('/dashboard');
    });

    // Auth mode toggle
    toggleAuthModeLink.addEventListener('click', () => {
      authMode = authMode === 'login' ? 'register' : 'login';
      authModeLabel.textContent = authMode === 'login' ? 'SIGN IN' : 'SIGN UP';
      authBtnText.textContent = authMode === 'login' ? 'Sign In' : 'Create Account';
      authNameInput.style.display = authMode === 'register' ? 'block' : 'none';
      toggleAuthModeLink.textContent = authMode === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Sign In';
      authErrorMsg.style.display = 'none';
    });

    // API settings
    saveApiUrlBtn.addEventListener('click', () => {
      const val = (apiBaseUrlInput.value || '').trim();
      if (val) {
        apiBaseUrl = val;
        setStorage('threatlens_api_url', apiBaseUrl, () => {
          testApiConnection();
        });
      }
    });

    resetApiUrlBtn.addEventListener('click', () => {
      apiBaseUrl = window.location.origin && (window.location.origin.includes('localhost') || window.location.origin.includes('run.app'))
        ? window.location.origin
        : 'http://localhost:3000';
      apiBaseUrlInput.value = apiBaseUrl;
      removeStorage('threatlens_api_url', () => {
        testApiConnection();
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start app
  document.addEventListener('DOMContentLoaded', init);
})();
