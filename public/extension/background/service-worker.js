/**
 * ThreatLens AI — Manifest V3 Background Service Worker
 * Coordinates side panel, active tab monitoring, screenshot captures, and context menus.
 */

// Enable side panel to open on toolbar action click (Chrome 116+)
chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((err) => console.log('[ThreatLens Worker] Side panel behavior notice:', err));
  }

  // Create context menu for quick right-click inspection
  if (chrome.contextMenus) {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'threatlens-inspect-link',
        title: 'Inspect Link with ThreatLens AI',
        contexts: ['link']
      });
      chrome.contextMenus.create({
        id: 'threatlens-inspect-selection',
        title: 'Inspect Text for Scams with ThreatLens',
        contexts: ['selection']
      });
    });
  }

  console.log('[ThreatLens Shield] Background service worker initialized successfully.');
});

// Context menu click listener
if (chrome.contextMenus && chrome.contextMenus.onClicked) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (tab && tab.id) {
      if (info.menuItemId === 'threatlens-inspect-link' && info.linkUrl) {
        // Save target and open side panel
        if (chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ pendingScanTarget: info.linkUrl, pendingScanType: 'url' }, () => {
            if (chrome.sidePanel && chrome.sidePanel.open) {
              chrome.sidePanel.open({ tabId: tab.id }).catch(() => {});
            }
          });
        }
      } else if (info.menuItemId === 'threatlens-inspect-selection' && info.selectionText) {
        if (chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ pendingScanTarget: info.selectionText, pendingScanType: 'message' }, () => {
            if (chrome.sidePanel && chrome.sidePanel.open) {
              chrome.sidePanel.open({ tabId: tab.id }).catch(() => {});
            }
          });
        }
      }
    }
  });
}

// Listen for tab changes and notify side panel if open
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab && tab.url) {
      chrome.runtime.sendMessage({
        type: 'TAB_CHANGED',
        url: tab.url,
        title: tab.title || '',
        tabId: tab.id,
        isSystemPage: isInternalChromePage(tab.url)
      }).catch(() => {
        // Side panel might not be open, safe to ignore
      });
    }
  } catch {
    // Ignore transient errors
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab && tab.url) {
    chrome.runtime.sendMessage({
      type: 'TAB_UPDATED',
      url: tab.url,
      title: tab.title || '',
      tabId: tab.id,
      isSystemPage: isInternalChromePage(tab.url)
    }).catch(() => {});
  }
});

// Helper: detect internal / non-inspectable browser pages
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

// Central Message Hub for Side Panel & Content Scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_CURRENT_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        const tab = tabs[0];
        sendResponse({
          success: true,
          url: tab.url || '',
          title: tab.title || '',
          id: tab.id,
          isSystemPage: isInternalChromePage(tab.url)
        });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true; // Keep message channel open for async response
  }

  if (request.type === 'CAPTURE_TAB_SCREENSHOT') {
    chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 85 }, (dataUrl) => {
      if (chrome.runtime.lastError || !dataUrl) {
        sendResponse({
          success: false,
          error: chrome.runtime.lastError ? chrome.runtime.lastError.message : 'Could not capture tab screenshot'
        });
      } else {
        sendResponse({ success: true, dataUrl });
      }
    });
    return true;
  }

  if (request.type === 'OPEN_WEB_APP') {
    const targetUrl = request.url || 'http://localhost:3000';
    chrome.tabs.create({ url: targetUrl });
    sendResponse({ success: true });
    return true;
  }
});
