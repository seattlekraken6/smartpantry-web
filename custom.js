// Inject Avatars
function injectAvatars() {
  const icons = document.querySelectorAll('div[dir="auto"]');
  icons.forEach(icon => {
    if (icon.textContent.includes('👤') || icon.textContent === '👤') {
      icon.innerHTML = `<img class="user-avatar" src="assets/avatar.png" alt="User Avatar" />`;
    }
  });
}

// Inject Analytics Dashboard
function injectAnalytics() {
  const isDashboard = window.location.pathname === '/' || window.location.pathname.includes('index.html');
  if (!isDashboard) return;

  const quickActionsHeader = Array.from(document.querySelectorAll('div[dir="auto"]')).find(el => el.textContent === 'Quick Actions');
  if (!quickActionsHeader) return;

  const analyticsSection = document.createElement('div');
  analyticsSection.innerHTML = `
    <div dir="auto" class="css-146c3p1 r-ubezar r-b88u0q" style="color:rgba(26,40,32,1.00); margin-top: 20px;">📈 Analytics - Money Spent</div>
    <div class="analytics-container">
      <canvas id="spendingChart"></canvas>
    </div>
  `;
  quickActionsHeader.parentNode.insertBefore(analyticsSection, quickActionsHeader);

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
  script.onload = () => {
    const ctx = document.getElementById('spendingChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
          label: 'Monthly Grocery Spending ($)',
          data: [350, 420, 380, 410, 290],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  };
  document.head.appendChild(script);
}

// Create Modal System
function createModal() {
  const modalHTML = `
    <div class="custom-modal-overlay" id="global-modal-overlay">
      <div class="custom-modal" id="global-modal">
        <button class="modal-close" onclick="closeModal()">×</button>
        <h2 id="modal-title" style="font-family: 'Outfit'; margin-top: 0;">Modal</h2>
        <div id="modal-content"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.openModal = function(title, contentHTML) {
  const titleEl = document.getElementById('modal-title');
  const contentEl = document.getElementById('modal-content');
  const overlay = document.getElementById('global-modal-overlay');
  if (!titleEl || !contentEl || !overlay) return;
  titleEl.textContent = title;
  contentEl.innerHTML = contentHTML;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeModal = function() {
  const overlay = document.getElementById('global-modal-overlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
  if (window.html5QrcodeScanner) {
    window.html5QrcodeScanner.clear().catch(e => console.error(e));
    window.html5QrcodeScanner = null;
  }
  if (window.cameraStream) {
    window.cameraStream.getTracks().forEach(track => track.stop());
    window.cameraStream = null;
  }
};

function openBarcodeScannerModal() {
  openModal('Barcode Scanner', '<div id="reader" width="100%"></div><p style="text-align:center;font-family:Outfit;margin-top:16px;">Point your camera at a barcode for fast scanning.</p>');
  if (!window.Html5QrcodeScanner) {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode';
    script.onload = initScanner;
    document.head.appendChild(script);
  } else {
    initScanner();
  }
}

function initScanner() {
  if (!document.getElementById('reader')) return;
  window.html5QrcodeScanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false);
  window.html5QrcodeScanner.render((decodedText) => {
    alert(`Barcode scanned successfully: ${decodedText}`);
    closeModal();
  }, () => {});
}

function openCameraCaptureModal() {
  openModal('Camera Capture', `
    <p style="font-family:Outfit;margin-bottom:16px;">Using your webcam, Pantry Pal can preview items instantly.</p>
    <video id="capture-video" autoplay playsinline style="width:100%; border-radius:16px; background:#000"></video>
    <div id="capture-status" style="font-family:Outfit; margin-top:12px; color:#475569;">Waiting for camera permission...</div>
  `);
  startCameraPreview();
}

function startCameraPreview() {
  const video = document.getElementById('capture-video');
  const status = document.getElementById('capture-status');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (status) status.textContent = 'Camera is not supported in this browser.';
    return;
  }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
      window.cameraStream = stream;
      if (video) video.srcObject = stream;
      if (status) status.textContent = 'Camera active. Point at items to preview.';
    })
    .catch(() => {
      if (status) status.textContent = 'Unable to access camera. Please allow permission or try another browser.';
    });
}

function openImageUploadModal() {
  openModal('Image Upload', `
    <p style="font-family:Outfit;margin-bottom:16px;">Upload a photo of your receipt or pantry item.</p>
    <input type="file" id="image-upload" accept="image/*" style="width:100%; padding:12px; border-radius:12px; border:1px solid #CBD5E1; margin-bottom:14px; font-family:Outfit;">
    <div id="upload-result" style="font-family:Outfit; background:#f4f7f6; padding:14px; border-radius:12px; min-height:80px; color:#334155;">Select an image to begin.</div>
  `);
  const upload = document.getElementById('image-upload');
  if (!upload) return;
  upload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const result = document.getElementById('upload-result');
    if (result) result.textContent = 'Analyzing image…';
    if (!window.Tesseract) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
      script.onload = () => runOCR(file, false);
      document.head.appendChild(script);
    } else {
      runOCR(file, false);
    }
  });
}

function openReceiptScannerModal() {
  openModal('Receipt Scanner', `
    <p style="font-family:Outfit;margin-bottom:16px;">Upload a receipt to extract items automatically.</p>
    <input type="file" id="receipt-upload" accept="image/*" style="width:100%; padding:12px; border-radius:12px; border:1px solid #CBD5E1; margin-bottom:14px; font-family:Outfit;">
    <div id="ocr-result" style="font-family:Outfit; background:#f4f7f6; padding:14px; border-radius:12px; min-height:70px; color:#334155;">Waiting for receipt upload…</div>
  `);
  const upload = document.getElementById('receipt-upload');
  if (!upload) return;
  upload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const result = document.getElementById('ocr-result');
    if (result) result.textContent = 'Scanning receipt with AI... Please wait.';
    if (!window.Tesseract) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
      script.onload = () => runOCR(file, true);
      document.head.appendChild(script);
    } else {
      runOCR(file, true);
    }
  });
}

function runOCR(file, isReceipt = false) {
  Tesseract.recognize(file, 'eng', { logger: () => {} })
    .then(({ data: { text } }) => {
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      const preview = lines.slice(0, 7).map(line => `<li>${line}</li>`).join('');
      const totalLine = lines.find(line => /total/i.test(line)) || 'Total not found yet';
      const container = document.getElementById(isReceipt ? 'ocr-result' : 'upload-result');
      if (!container) return;
      container.innerHTML = `
        <strong style="display:block; margin-bottom:8px;">Recognized text</strong>
        <div style="margin-bottom:10px; color:#475569;">${totalLine}</div>
        <ul style="padding-left:18px; margin:0; color:#334155;">${preview}</ul>
      `;
    })
    .catch(() => {
      const container = document.getElementById(isReceipt ? 'ocr-result' : 'upload-result');
      if (container) {
        container.textContent = 'We could not read that file. Please try a different photo.';
      }
    });
}

function setupOnboardingBanner() {
  if (localStorage.getItem('pantryPalOnboardingSeen')) return;
  const banner = document.createElement('div');
  banner.className = 'onboarding-banner';
  banner.innerHTML = `
    <div class="onboarding-banner-content">
      <div>
        <strong>Welcome to Pantry Pal!</strong> Start the onboarding tour to set up your kitchen.
      </div>
      <div class="onboarding-banner-actions">
        <button id="start-onboarding">Start Tour</button>
        <button id="dismiss-onboarding">Maybe later</button>
      </div>
    </div>
  `;
  document.body.prepend(banner);
  document.getElementById('start-onboarding').addEventListener('click', () => {
    localStorage.setItem('pantryPalOnboardingSeen', 'true');
    window.location.href = 'onboarding.html';
  });
  document.getElementById('dismiss-onboarding').addEventListener('click', () => {
    localStorage.setItem('pantryPalOnboardingSeen', 'true');
    banner.remove();
  });
}

function replaceBrandingText(node) {
  const updated = node.nodeValue
    .replace(/\bSmart\s*Pantry\b/gi, 'Pantry Pal')
    .replace(/\bSmartPantry\b/gi, 'Pantry Pal');
  if (updated !== node.nodeValue) {
    node.nodeValue = updated;
  }
}

function applyBrandingReplacements() {
  if (document.title) {
    document.title = document.title
      .replace(/\bSmart\s*Pantry\b/gi, 'Pantry Pal')
      .replace(/\bSmartPantry\b/gi, 'Pantry Pal');
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return /\bSmart\s*Pantry\b|\bSmartPantry\b/i.test(node.nodeValue)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }
  nodes.forEach(replaceBrandingText);

  document.querySelectorAll('[alt],[placeholder],[title]').forEach(el => {
    ['alt', 'placeholder', 'title'].forEach(attr => {
      if (el[attr]) {
        el[attr] = el[attr]
          .replace(/\bSmart\s*Pantry\b/gi, 'Pantry Pal')
          .replace(/\bSmartPantry\b/gi, 'Pantry Pal');
      }
    });
  });
}

function createFloatingScannerPanel() {
  if (document.getElementById('floating-scanner-panel')) return;
  const panel = document.createElement('div');
  panel.id = 'floating-scanner-panel';
  panel.innerHTML = `
    <button class="scanner-action-btn" id="floating-barcode-btn" type="button">📷 Scan Barcode</button>
    <button class="scanner-action-btn" id="floating-receipt-btn" type="button">🧾 Scan Receipt</button>
    <button class="scanner-action-btn" id="floating-camera-btn" type="button">📸 Camera Preview</button>
  `;
  document.body.appendChild(panel);

  document.getElementById('floating-barcode-btn').addEventListener('click', openBarcodeScannerModal);
  document.getElementById('floating-receipt-btn').addEventListener('click', openReceiptScannerModal);
  document.getElementById('floating-camera-btn').addEventListener('click', openCameraCaptureModal);
}

function handleGlobalActions(event) {
  const target = event.target.closest('[tabindex="0"], .r-1loqt21, button, a, [role="button"]');
  if (!target) return;
  const text = (target.innerText || '').trim();
  if (!text) return;

  if (/\b(Add Item|➕|＋)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    openBarcodeScannerModal();
    return;
  }

  if (/\b(Camera Detection|Camera Capture|Smart Capture)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    openCameraCaptureModal();
    return;
  }

  if (/\b(Image Upload|Upload a photo)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    openImageUploadModal();
    return;
  }

  if (/\b(Receipt OCR|Receipt Scanner|Scan a grocery receipt|Bulk Add)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    openReceiptScannerModal();
    return;
  }

  if (/\b(Generate Meal Plan|Plan week)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'meals.html';
    return;
  }

  if (/\b(Order Now)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'grocery.html';
    return;
  }

  if (/\b(3D Designer)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'designer.html';
    return;
  }

  if (text.includes('🏠')) {
    window.location.href = 'index.html';
    return;
  }
  if (text.includes('🛒') && !text.includes('Order Now')) {
    window.location.href = 'grocery.html';
    return;
  }
  if (text.includes('🍽️')) {
    window.location.href = 'meals.html';
    return;
  }
  if (text.includes('🧊') || text.includes('3D Designer')) {
    window.location.href = 'designer.html';
    return;
  }
  if (text.includes('🌐') || /Community/i.test(text)) {
    window.location.href = 'community.html';
    return;
  }
  if (text.includes('⚙️') || /Settings/i.test(text)) {
    window.location.href = 'settings.html';
    return;
  }
  if (text.includes('👤') || target.querySelector('.user-avatar')) {
    window.location.href = 'profile.html';
    return;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  createModal();
  injectAvatars();
  injectAnalytics();
  setupOnboardingBanner();
  applyBrandingReplacements();
  createFloatingScannerPanel();
  document.addEventListener('click', handleGlobalActions, true);
});
