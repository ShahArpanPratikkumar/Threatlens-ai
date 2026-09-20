/**
 * ThreatLens AI — Passive Browser Content Script
 * Gathers high-level structural telemetry without inspecting or harvesting sensitive user inputs.
 * Strictly conforms to privacy policies (no password values, OTPs, or credit cards are ever accessed).
 */

(() => {
  // Listen for analysis queries from the ThreatLens Side Panel
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'INSPECT_PAGE_DOM_TELEMETRY') {
      try {
        const passwordFields = document.querySelectorAll('input[type="password"]');
        const forms = document.querySelectorAll('form');
        const links = document.querySelectorAll('a[href]');
        const iframes = document.querySelectorAll('iframe');

        // Check if password fields exist on plaintext HTTP
        const insecurePasswordForm = window.location.protocol === 'http:' && passwordFields.length > 0;

        // Count external links
        const currentHost = window.location.hostname;
        let externalLinksCount = 0;
        links.forEach((a) => {
          try {
            const linkHost = new URL(a.href).hostname;
            if (linkHost && linkHost !== currentHost) {
              externalLinksCount++;
            }
          } catch {
            // Ignore malformed hrefs
          }
        });

        sendResponse({
          success: true,
          telemetry: {
            title: document.title || '',
            url: window.location.href,
            hasPasswordInput: passwordFields.length > 0,
            insecurePasswordForm,
            formCount: forms.length,
            linkCount: links.length,
            externalLinksCount,
            iframeCount: iframes.length,
            protocol: window.location.protocol.replace(':', '')
          }
        });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
      return true;
    }
  });

  // Passive non-intrusive warning on HTTP password pages
  if (window.location.protocol === 'http:') {
    const pwd = document.querySelector('input[type="password"]');
    if (pwd) {
      console.warn('[ThreatLens Warning] Plaintext HTTP password field detected on this page.');
    }
  }
})();
