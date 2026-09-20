# ThreatLens AI — Full-Stack SOC Platform & Chrome Extension

ThreatLens AI is an advanced, production-grade cybersecurity platform that combines live DNS analysis, cryptographic TLS verification, behavioral heuristics, and Gemini AI threat intelligence to detect phishing, quishing (QR threats), smishing, and deceptive visual spoofing in real-time.

---

## 🛡️ Chrome Extension (Manifest V3 Side Panel)

ThreatLens AI includes a **Chrome Extension (Manifest V3)** built on Chrome's **Side Panel API**, providing a SOC experience directly alongside your web browsing without cramming UI into a tiny popup.

### Key Capabilities

1. **Current Tab URL Inspection**
   - Active URL detection with status indicator (`NOT ANALYZED` by default—never claims "SAFE" before an actual scan).
   - "Inspect Current Page" sends the URL to the real backend (`/api/scan/url`).
   - Automatically detects Chrome internal/system pages (`chrome://`, `chrome-extension://`, Web Store) with user guidance.
   - Live Risk Score (0-100), Risk Level badge (`SAFE`, `LOW`, `SUSPICIOUS`, `HIGH`, `CRITICAL`), threat classification, and confidence.
   - Compact **Spatial Threat Radar** visualizer mapping Domain, DNS, SSL/TLS, Threat Intel, Route, and AI signals.
   - Detailed evidence list and verified technical signals.

2. **Quick Multi-Vector Tools**
   - **Manual URL Scanner:** Input any URL or select presets to inspect suspicious links before clicking.
   - **Message / Scam Scanner:** Paste suspicious SMS, urgent bank text, WhatsApp job offers, or emails to detect social engineering.
   - **Screenshot Forensics:** "📸 Capture Current Tab Screenshot" captures the active tab via `chrome.tabs.captureVisibleTab`, or upload any image file for visual deception & brand impersonation inspection.
   - **QR Threat Scanner:** Upload QR codes to decode payloads and inspect against quishing attacks.

3. **Account Authentication & Shared State**
   - Direct Sign In & Sign Up inside the side panel.
   - JWT tokens stored in `chrome.storage.local`.
   - **Complete Data Isolation:** Authenticated users see only their own scan history.
   - Scans performed from the Chrome Extension appear in the web app, and scans from the web app appear in the extension.
   - 1 free scan for unauthenticated users, followed by a login gate.

4. **Compact Dashboard & Metrics**
   - Real-time telemetry: Total Scans, Clean / Safe, Suspicious, High Risk breakdown.
   - Direct shortcuts to open full forensic reports in the web dashboard.

5. **Configurable Endpoint Settings**
   - Backend API URL is configurable in the Settings tab (defaults to `http://localhost:3000` or the deployed origin).
   - "Save & Test" button verifies connectivity with latency benchmarking.

---

## 🚀 Building & Loading the Extension in Google Chrome

### 1. Build the Extension
Run the build script from the project root:
```bash
npm run build:extension
```
This prepares the extension distribution in `dist-extension/` and creates a direct download archive `public/threatlens-extension.zip`.

### 2. Load Unpacked in Chrome
1. Open Google Chrome and navigate to:
   ```
   chrome://extensions
   ```
2. Toggle on **Developer mode** (toggle switch in the top right corner).
3. Click the **Load unpacked** button.
4. Select the `dist-extension` directory in the project root.
5. ThreatLens AI will now appear in your browser extensions list!

### 3. Open the ThreatLens Side Panel
- Click the **ThreatLens shield icon** in your browser toolbar to immediately open the side panel.
- Or click the Side Panel icon in Chrome's top toolbar and select **ThreatLens AI**.
- Right-click any link or highlighted text and select **"Inspect Link with ThreatLens AI"**.

---

## 🏗️ Architecture & Security Compliance

- **Manifest V3:** Ephemeral background service worker (`background/service-worker.js`), no persistent background page battery drain.
- **Side Panel API:** `chrome.sidePanel` with `openPanelOnActionClick: true`.
- **Zero Remote JavaScript:** All code is packaged locally (no `eval()`, no external script injection, strict CSP compliant).
- **Privacy First:** The content script only reads structural page metadata (form counts, link hosts); it never accesses password values, credit cards, or private input fields.
- **Full-Stack Synchronization:** RESTful API with CORS headers supporting extension requests.

---

## 💻 Web Application Commands

- **Development:** `npm run dev` (starts the Express backend & Vite dev server on port 3000)
- **Production Build:** `npm run build` (builds client SPA to `dist/` and compiles server to `dist/server.cjs`)
- **Extension Build:** `npm run build:extension` (bundles extension to `dist-extension/` and packages `.zip`)
- **Start Production Server:** `npm run start`
