/**
 * ThreatLens AI — Quick Popup Launcher
 */
document.addEventListener('DOMContentLoaded', () => {
  const tabUrlEl = document.getElementById('popup-tab-url');
  const inspectBtn = document.getElementById('btn-popup-inspect');
  const resultCard = document.getElementById('popup-result-card');
  const riskLevelEl = document.getElementById('popup-risk-level');
  const threatTypeEl = document.getElementById('popup-threat-type');
  const riskScoreEl = document.getElementById('popup-risk-score');
  const summaryTextEl = document.getElementById('popup-summary-text');
  const openSidepanelBtn = document.getElementById('btn-open-sidepanel');
  const fullSidepanelBtn = document.getElementById('btn-full-sidepanel');
  const openDashboardBtn = document.getElementById('btn-open-dashboard');

  let currentTab = null;
  let apiBaseUrl = 'http://localhost:3000';

  // Load API URL
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['threatlens_api_url'], (res) => {
      if (res && res.threatlens_api_url) apiBaseUrl = res.threatlens_api_url;
    });
  }

  // Get current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      currentTab = tabs[0];
      tabUrlEl.textContent = currentTab.url || 'No URL';
      tabUrlEl.title = currentTab.url || '';
    }
  });

  // Open side panel
  function openSidePanel() {
    if (chrome.sidePanel && chrome.sidePanel.open && currentTab) {
      chrome.sidePanel.open({ tabId: currentTab.id }).catch(() => {
        window.close();
      });
      window.close();
    }
  }

  openSidepanelBtn.addEventListener('click', openSidePanel);
  fullSidepanelBtn.addEventListener('click', openSidePanel);

  openDashboardBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: `${apiBaseUrl}/dashboard` });
    window.close();
  });

  // Quick inspect
  inspectBtn.addEventListener('click', async () => {
    if (!currentTab || !currentTab.url) return;
    inspectBtn.disabled = true;
    inspectBtn.textContent = 'Analyzing target...';

    try {
      const res = await fetch(`${apiBaseUrl}/api/scan/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ThreatLens-Anon-Session': 'popup-scan'
        },
        body: JSON.stringify({ url: currentTab.url })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');

      resultCard.style.display = 'flex';
      riskLevelEl.textContent = data.riskLevel;
      threatTypeEl.textContent = data.threatType || 'Security Inspection';
      riskScoreEl.textContent = data.riskScore;
      summaryTextEl.textContent = data.summary;

      let color = '#10b981';
      if (data.riskScore >= 60) color = '#f43f5e';
      else if (data.riskScore >= 25) color = '#f59e0b';
      riskLevelEl.style.color = color;
      riskScoreEl.style.color = color;
    } catch (err) {
      alert('Inspection error: ' + err.message);
    } finally {
      inspectBtn.disabled = false;
      inspectBtn.innerHTML = '<span>Inspect Current Page</span>';
    }
  });
});
