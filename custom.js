// Inject Avatars
function injectAvatars() {
  const profile = getUserProfile();
  if (!profile) return;
  applyThemeStyles(profile);
  const initials = getProfileInitials(profile.name);
  const avatarHtml = `
    <div class="user-avatar user-avatar-themed" title="${profile.name}">
      <span>${initials}</span>
    </div>
  `;

  const icons = document.querySelectorAll('div[dir="auto"]');
  icons.forEach(icon => {
    if (icon.textContent.includes('👤') || icon.textContent === '👤' || icon.querySelector('img[src*="avatar.png"]')) {
      icon.innerHTML = avatarHtml;
    }
  });

  document.querySelectorAll('img[src*="avatar.png"]').forEach(img => {
    img.outerHTML = avatarHtml;
  });
}

function getProfileInitials(name) {
  return name
    .split(' ')
    .map(part => part[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function randomTheme() {
  const themes = [
    { name: 'Midnight', accent: '#6366F1', gradient: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' },
    { name: 'Aurora', accent: '#0EA5E9', gradient: 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)' },
    { name: 'Sterling', accent: '#94A3B8', gradient: 'linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%)' },
    { name: 'Slate', accent: '#334155', gradient: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)' }
  ];
  return themes[Math.floor(Math.random() * themes.length)];
}

function getUserProfile() {
  const stored = localStorage.getItem('pantryPalProfile');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
}

function createUserProfile({ name, email }) {
  const theme = randomTheme();
  const profile = {
    id: `pp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: name ? name.trim() : `Pantry Pal ${theme.name}`,
    email: email ? email.trim() : '',
    theme: theme.name,
    accent: theme.accent,
    gradient: theme.gradient,
    avatarSeed: Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('pantryPalProfile', JSON.stringify(profile));
  localStorage.setItem('pantryPalAccountCreated', 'true');
  return profile;
}

function ensureUserProfile() {
  let profile = getUserProfile();
  if (profile && profile.id) return profile;

  const theme = randomTheme();
  profile = {
    id: `pp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: `Pantry Pal ${theme.name}`,
    theme: theme.name,
    accent: theme.accent,
    gradient: theme.gradient,
    avatarSeed: Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('pantryPalProfile', JSON.stringify(profile));
  return profile;
}

function applyThemeStyles(profile) {
  document.documentElement.style.setProperty('--primary-gradient', profile.gradient);
  document.documentElement.style.setProperty('--avatar-bg', profile.accent);
  document.documentElement.style.setProperty('--accent', profile.accent);
  document.documentElement.style.setProperty('--accent-light', profile.gradient ? profile.gradient.split(' ')[0] : '#D9A85C');
  document.documentElement.style.setProperty('--accent-glow', profile.accent + '33');
  document.documentElement.style.setProperty('--glass-bg', 'rgba(20, 17, 12, 0.92)');
  document.documentElement.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.08)');
  document.documentElement.style.setProperty('--shadow-soft', '0 22px 70px rgba(0, 0, 0, 0.35)');
}

function openAccountOnboardingModal() {
  const profile = ensureUserProfile();
  document.body.classList.add('pantry-pal-modal-required');
  let step = 0;
  const slides = [
    {
      number: '01',
      title: `Welcome, ${profile.name.split(' ')[0]}`,
      copy: 'Keep your kitchen organized with one calm, simple workspace.',
      detail: 'Track what you have, what is running low, and what to cook next.'
    },
    {
      number: '02',
      title: 'Add items your way',
      copy: 'Use a barcode, a receipt, or the add-item action whenever groceries come in.',
      detail: 'Your pantry stays current without a long setup process.'
    },
    {
      number: '03',
      title: 'Plan with less effort',
      copy: 'Turn your pantry into a grocery list or a weekly meal plan in a few taps.',
      detail: 'Everything remains editable as your week changes.'
    }
  ];

  const render = () => {
    const slide = slides[step];
    openModal('Getting started', `
      <section class="onboarding-screen">
        <div class="onboarding-screen-brand">Pantry Pal</div>
        <div class="onboarding-screen-number">${slide.number}</div>
        <h3>${slide.title}</h3>
        <p>${slide.copy}</p>
        <div class="onboarding-screen-detail">${slide.detail}</div>
        <div class="onboarding-screen-footer">
          <div class="onboarding-screen-dots" aria-label="Onboarding progress">
            ${slides.map((_, index) => `<span class="${index === step ? 'active' : ''}"></span>`).join('')}
          </div>
          <div class="modal-actions">
            ${step > 0 ? '<button id="onboarding-back" class="scanner-action-btn secondary" type="button">Back</button>' : ''}
            <button id="onboarding-next" class="scanner-action-btn" type="button">${step === slides.length - 1 ? 'Start using Pantry Pal' : 'Continue'}</button>
          </div>
        </div>
      </section>
    `);

    document.getElementById('onboarding-back')?.addEventListener('click', () => {
      step -= 1;
      render();
    });
    document.getElementById('onboarding-next')?.addEventListener('click', () => {
      if (step < slides.length - 1) {
        step += 1;
        render();
        return;
      }
      localStorage.setItem('pantryPalOnboardingSeen', 'true');
      document.body.classList.remove('pantry-pal-modal-required');
      closeModal();
    });
  };

  render();
}

function openAccountCreationModal() {
  document.body.classList.add('pantry-pal-modal-required');
  openModal('Create your Pantry Pal account', `
    <div class="account-creation-form">
      <p class="account-creation-copy">Please create a Pantry Pal account to continue. This account powers onboarding, your pantry snapshot, and smart scan features.</p>
      <label for="pantry-pal-name">Full name</label>
      <input id="pantry-pal-name" class="receipt-upload" type="text" placeholder="Jane Doe" />
      <label for="pantry-pal-email">Email address</label>
      <input id="pantry-pal-email" class="receipt-upload" type="email" placeholder="jane@pantrypal.com" />
      <div id="account-error" class="ocr-result" style="margin-top:10px; font-size:0.92rem;"></div>
      <div class="modal-actions" style="margin-top:16px;">
        <button id="create-account" class="scanner-action-btn" type="button">Create account</button>
      </div>
    </div>
  `);

  const createBtn = document.getElementById('create-account');
  const errorEl = document.getElementById('account-error');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('pantry-pal-name');
      const emailInput = document.getElementById('pantry-pal-email');
      const name = nameInput ? nameInput.value : '';
      const email = emailInput ? emailInput.value : '';
      if (!name.trim()) {
        if (errorEl) errorEl.textContent = 'Please enter your full name to continue.';
        return;
      }
      const profile = createUserProfile({ name, email });
      applyThemeStyles(profile);
      document.body.classList.remove('pantry-pal-modal-required');
      closeModal();
      startApp();
      openAccountOnboardingModal();
    });
  }
}

function startApp() {
  document.body.classList.add('pantry-pal-ready');
  injectAvatars();
  injectAnalytics();
  applyBrandingReplacements();
  wireExportedHamburgerMenu();
  document.addEventListener('click', handleGlobalActions, true);
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
  openModal('Barcode Scanner', `
    <p class="account-creation-copy">Point your camera at a barcode to add an item automatically.</p>
    <div id="reader" class="scanner-box"></div>
    <div id="barcode-status" class="scanner-status">Looking for a barcode...</div>
  `);
  if (!window.Html5Qrcode) {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode';
    script.onload = initScanner;
    document.head.appendChild(script);
  } else {
    initScanner();
  }
}

function initScanner() {
  const reader = document.getElementById('reader');
  const status = document.getElementById('barcode-status');
  if (!reader || !window.Html5Qrcode) {
    if (status) status.textContent = 'Scanner failed to initialize. Please refresh the page.';
    return;
  }

  const qrCodeScanner = new Html5Qrcode('reader');
  window.html5QrcodeScanner = qrCodeScanner;
  const config = { fps: 10, qrbox: { width: 250, height: 250 } };
  qrCodeScanner.start(
    { facingMode: 'environment' },
    config,
    decodedText => {
      if (status) status.textContent = `Scanned: ${decodedText}`;
      onBarcodeScanned(decodedText);
    },
    errorMessage => {
      if (status) status.textContent = 'Searching for a barcode...';
    }
  ).catch(error => {
    console.error('Html5Qrcode failed to start', error);
    if (status) status.textContent = 'Unable to start camera scanner. Please allow camera access.';
  });
}

function decodeBarcodeToItem(code) {
  const mapping = {
    '012345678905': 'Bananas',
    '123456789012': 'Organic Milk',
    '036000291452': 'Cereal',
    '049000042002': 'Pasta'
  };
  return mapping[code] || `Scanned Item ${code.slice(-4)}`;
}

function onBarcodeScanned(decodedText) {
  const name = decodeBarcodeToItem(decodedText);
  addInventoryItem({ name, quantity: 1, unit: 'pcs', category: 'barcode', source: decodedText });
  closeModal();
  openModal('Barcode Added', `
    <p style="font-family:Outfit;">Added <strong>${name}</strong> to your pantry.</p>
    <p style="font-family:Outfit;color:#94a3b8;">Barcode: ${decodedText}</p>
  `);
}

function openCameraCaptureModal() {
  openModal('Camera Preview', `
    <p class="account-creation-copy">Your camera is active. Use this to preview an item or add a quick pantry note.</p>
    <video id="capture-video" autoplay playsinline muted class="scanner-box"></video>
    <div id="capture-status" class="scanner-status">Waiting for camera permission...</div>
    <div class="modal-actions" style="margin-top:18px;">
      <button class="scanner-action-btn" id="capture-add-item" type="button">Add sample item</button>
      <button class="scanner-action-btn secondary" id="capture-close" type="button">Close preview</button>
    </div>
  `);
  startCameraPreview();
  document.getElementById('capture-add-item')?.addEventListener('click', () => {
    addInventoryItem({ name: 'Camera Quick Add', quantity: 1, unit: 'pcs', category: 'camera' });
    closeModal();
    openModal('Added from Camera', '<p style="font-family:Outfit;">A quick pantry item was added from camera preview.</p>');
  });
  document.getElementById('capture-close')?.addEventListener('click', closeModal);
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
      if (video) {
        video.srcObject = stream;
        video.play?.();
      }
      if (status) status.textContent = 'Camera active. Tap add item for a quick pantry entry.';
    })
    .catch(() => {
      if (status) status.textContent = 'Unable to access camera. Please allow permission or try another browser.';
    });
}

function openReceiptScannerModal() {
  openModal('Receipt Scanner', `
    <p class="account-creation-copy">Upload a receipt to extract purchase details and add items.</p>
    <input type="file" id="receipt-upload" accept="image/*" class="receipt-upload" />
    <div id="ocr-result" class="receipt-preview">Waiting for receipt upload…</div>
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

function openImageUploadModal() {
  openModal('Add a pantry photo', `
    <p class="account-creation-copy">Choose a kitchen or grocery photo. Pantry Pal will add a review-ready item from the image.</p>
    <input type="file" id="image-upload" accept="image/*" class="receipt-upload" />
    <div id="image-upload-result" class="receipt-preview">Waiting for an image...</div>
  `);
  const upload = document.getElementById('image-upload');
  if (!upload) return;
  upload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const result = document.getElementById('image-upload-result');
    if (!result) return;
    result.innerHTML = `
      <strong>${file.name}</strong>
      <p class="account-creation-copy">Image ready. Add a review item now and rename it from your inventory.</p>
      <button id="image-add-item" class="scanner-action-btn" type="button">Add review item</button>
    `;
    document.getElementById('image-add-item')?.addEventListener('click', () => {
      addInventoryItem({ name: 'Photo review item', quantity: 1, unit: 'pcs', category: 'photo' });
      closeModal();
      openModal('Photo added', '<p class="account-creation-copy">Your review item was added to inventory.</p>');
    });
  });
}

function runOCR(file, isReceipt = false) {
  Tesseract.recognize(file, 'eng', { logger: () => {} })
    .then(({ data: { text } }) => {
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      const suggestedItems = lines
        .filter(line => /^[A-Za-z ]{3,}/.test(line) && !/total|subtotal|tax|amount|visa|mastercard|change/i.test(line))
        .slice(0, 6)
        .map(line => line.replace(/\s{2,}/g, ' ').trim());

      const preview = suggestedItems.length
        ? suggestedItems.map(line => `<li>${line}</li>`).join('')
        : '<li>No items recognized. Try a clearer photo.</li>';
      const totalLine = lines.find(line => /total/i.test(line)) || 'Total not found yet';
      const container = document.getElementById('ocr-result');
      if (!container) return;
      container.innerHTML = `
        <strong style="display:block; margin-bottom:8px;">Detected receipt text</strong>
        <div style="margin-bottom:10px; color:#93c5fd;">${totalLine}</div>
        <ul style="padding-left:18px; margin:0; color:#e2e8f0;">${preview}</ul>
        <button id="receipt-add-items" class="scanner-action-btn" type="button" style="margin-top:16px;">Add recognized items</button>
      `;

      document.getElementById('receipt-add-items')?.addEventListener('click', () => {
        suggestedItems.forEach(line => addInventoryItem({ name: line, quantity: 1, unit: 'pcs', category: 'receipt' }));
        openModal('Receipt Added', `<p style="font-family:Outfit;">Added ${suggestedItems.length} items from the receipt to your pantry.</p>`);
      });
    })
    .catch(() => {
      const container = document.getElementById('ocr-result');
      if (container) {
        container.textContent = 'We could not read that file. Please try a different photo.';
      }
    });
}

function setupOnboardingBanner() {
  const profile = ensureUserProfile();
  if (localStorage.getItem('pantryPalOnboardingSeen')) return;
  const banner = document.createElement('div');
  banner.className = 'onboarding-banner';
  banner.innerHTML = `
    <div class="onboarding-banner-content">
      <div>
        <strong>Welcome to Pantry Pal!</strong>
        Your account is ready with a <strong>${profile.theme}</strong> theme.
      </div>
      <div class="onboarding-banner-actions">
        <button id="start-onboarding" class="primary">Start setup</button>
        <button id="dismiss-onboarding" class="secondary">Maybe later</button>
      </div>
    </div>
  `;
  document.body.prepend(banner);
  document.getElementById('start-onboarding').addEventListener('click', () => {
    localStorage.setItem('pantryPalOnboardingSeen', 'true');
    openAccountOnboardingModal();
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

function getPantryInventory() {
  try {
    return JSON.parse(localStorage.getItem('pantryPalInventory') || '[]') || [];
  } catch (e) {
    return [];
  }
}

function savePantryInventory(items) {
  localStorage.setItem('pantryPalInventory', JSON.stringify(items));
}

function ensurePantryInventory() {
  const current = getPantryInventory();
  if (current.length) return current;
  const seed = [
    { id: 'pp_item_apple', name: 'Honeycrisp Apples', quantity: 4, unit: 'pcs', category: 'produce', addedDate: new Date().toISOString() },
    { id: 'pp_item_rice', name: 'Basmati Rice', quantity: 2, unit: 'lbs', category: 'grains', addedDate: new Date().toISOString() }
  ];
  savePantryInventory(seed);
  return seed;
}

function addInventoryItem(item) {
  const inventory = getPantryInventory();
  const normalized = item.name.trim();
  const existing = inventory.find(i => i.name.toLowerCase() === normalized.toLowerCase());
  if (existing) {
    existing.quantity = Number(existing.quantity || 0) + Number(item.quantity || 1);
  } else {
    inventory.unshift({
      id: `pp_item_${Date.now()}`,
      name: normalized,
      quantity: Number(item.quantity || 1),
      unit: item.unit || 'pcs',
      category: item.category || 'scanned',
      addedDate: new Date().toISOString(),
      source: item.source || 'manual'
    });
  }
  savePantryInventory(inventory);
  renderPantrySnapshot();
}

function renderPantrySnapshot() {
  const panel = document.getElementById('pantry-snapshot-panel');
  if (!panel) return;
  const inventory = getPantryInventory();
  const count = inventory.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const itemsHtml = inventory.slice(0, 4).map(item => `
    <li><strong>${item.name}</strong> · ${item.quantity} ${item.unit}</li>
  `).join('') || '<li>No pantry items yet. Scan a barcode to start.</li>';

  panel.innerHTML = `
    <div class="pantry-snapshot-header">
      <div>🗄️ Pantry snapshot</div>
      <div class="pantry-snapshot-count">${count} items</div>
    </div>
    <ul class="pantry-snapshot-list">${itemsHtml}</ul>
    <button id="open-pantry-detail" class="scanner-action-btn secondary">View full pantry</button>
  `;

  const detailButton = document.getElementById('open-pantry-detail');
  if (detailButton) {
    detailButton.addEventListener('click', openPantryModal);
  }
}

function createPantrySnapshotPanel() {
  if (document.getElementById('pantry-snapshot-panel')) return;
  ensurePantryInventory();
  const panel = document.createElement('aside');
  panel.id = 'pantry-snapshot-panel';
  panel.className = 'pantry-snapshot-panel';
  document.body.appendChild(panel);
  renderPantrySnapshot();
}

function openPantryModal() {
  const inventory = getPantryInventory();
  const itemsHtml = inventory.map(item => `
    <div class="pantry-item-card">
      <div><strong>${item.name}</strong></div>
      <div>${item.quantity} ${item.unit}</div>
      <div class="pantry-item-meta">${item.category}</div>
    </div>
  `).join('') || '<div class="pantry-empty">No pantry items yet. Add one with barcode scan or receipt import.</div>';

  openModal('Your Pantry', `
    <div class="pantry-detail-list">${itemsHtml}</div>
    <div class="modal-actions">
      <button class="scanner-action-btn" type="button" id="pantry-add-barcode">Scan barcode</button>
      <button class="scanner-action-btn secondary" type="button" id="pantry-add-receipt">Scan receipt</button>
    </div>
  `);

  const barcodeBtn = document.getElementById('pantry-add-barcode');
  const receiptBtn = document.getElementById('pantry-add-receipt');
  if (barcodeBtn) barcodeBtn.addEventListener('click', openBarcodeScannerModal);
  if (receiptBtn) receiptBtn.addEventListener('click', openReceiptScannerModal);
}

function wireExportedHamburgerMenu() {
  const candidates = document.querySelectorAll('[tabindex="0"]');
  candidates.forEach(candidate => {
    if (candidate.innerText.trim()) return;
    const lines = candidate.querySelectorAll(':scope > div');
    if (lines.length !== 3) return;
    candidate.setAttribute('role', 'button');
    candidate.setAttribute('aria-label', 'Open menu');
    candidate.dataset.pantryPalAction = 'menu';
  });
}

function openMenuModal() {
  const inventory = getPantryInventory();
  const count = inventory.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  openModal('Pantry Pal Menu', `
    <div class="menu-card">
      <button class="menu-link" data-target="index.html">🏠 Home</button>
      <button class="menu-link" data-target="inventory.html">🗄️ Inventory</button>
      <button class="menu-link" data-target="grocery.html">🛒 Grocery</button>
      <button class="menu-link" data-target="meals.html">🍽️ Meals</button>
      <button class="menu-link" data-target="settings.html">⚙️ Settings</button>
      <div class="menu-summary">${count} pantry items tracked</div>
      <button class="scanner-action-btn" id="menu-scan-barcode">📷 Scan barcode</button>
      <button class="scanner-action-btn secondary" id="menu-scan-receipt">🧾 Receipt scan</button>
    </div>
  `);

  document.querySelectorAll('.menu-link').forEach(btn => {
    btn.addEventListener('click', (event) => {
      const target = event.currentTarget.dataset.target;
      if (target) {
        window.location.href = target;
      }
    });
  });
  const barcodeBtn = document.getElementById('menu-scan-barcode');
  const receiptBtn = document.getElementById('menu-scan-receipt');
  if (barcodeBtn) barcodeBtn.addEventListener('click', openBarcodeScannerModal);
  if (receiptBtn) receiptBtn.addEventListener('click', openReceiptScannerModal);
}

function createFloatingScannerPanel() {
  if (document.getElementById('floating-scanner-panel')) return;
  const panel = document.createElement('div');
  panel.id = 'floating-scanner-panel';
  panel.innerHTML = `
    <button class="scanner-action-btn" id="floating-barcode-btn" type="button">📷 Scan Barcode</button>
    <button class="scanner-action-btn" id="floating-receipt-btn" type="button">🧾 Scan Receipt</button>
    <button class="scanner-action-btn" id="floating-camera-btn" type="button">📸 Camera Preview</button>
    <button class="scanner-action-btn secondary" id="floating-pantry-btn" type="button">🗄️ Pantry</button>
  `;
  document.body.appendChild(panel);

  document.getElementById('floating-barcode-btn').addEventListener('click', openBarcodeScannerModal);
  document.getElementById('floating-receipt-btn').addEventListener('click', openReceiptScannerModal);
  document.getElementById('floating-camera-btn').addEventListener('click', openCameraCaptureModal);
  document.getElementById('floating-pantry-btn').addEventListener('click', openPantryModal);
}

function handleGlobalActions(event) {
  const target = event.target.closest('button, a, [role="button"], [tabindex="0"], .r-1loqt21');
  if (!target) return;
  if (target.closest('#global-modal')) return;
  if (target.dataset.pantryPalAction === 'menu') {
    event.preventDefault();
    event.stopPropagation();
    openMenuModal();
    return;
  }
  const text = ((target.innerText || target.getAttribute('aria-label') || '') || '').trim();
  if (!text) return;

  const action = text.toLowerCase();

  if (/\b(scan barcode)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    openBarcodeScannerModal();
    return;
  }

  if (/\b(scan receipt|receipt scanner)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    openReceiptScannerModal();
    return;
  }

  if (/\b(add item|➕|＋)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'item/add.html';
    return;
  }

  if (/\b(camera|preview|smart capture|camera detection)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    openCameraCaptureModal();
    return;
  }

  if (/\b(image upload|upload a photo)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    openImageUploadModal();
    return;
  }

  if (/\b(generate meal plan|plan week|ai meal plan|meal plan|plan meals)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'meals.html';
    return;
  }

  if (/\b(order now|grocery|shop|buy)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'grocery.html';
    return;
  }

  if (/\b(3d designer|designer|ar preview)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'designer.html';
    return;
  }

  if (/\b(inventory history|activity log)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'inventory-history.html';
    return;
  }

  if (/\b(inventory|pantry|stock|warehouse)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'inventory.html';
    return;
  }

  if (/\b(settings|preferences|gear|⚙️)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'settings.html';
    return;
  }

  if (/\b(forecast|forecasting)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'forecasting.html';
    return;
  }

  if (/\b(smart cart|shopping list)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'smart-cart.html';
    return;
  }

  if (/\b(community)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'community.html';
    return;
  }

  if (/\b(subscription|upgrade|premium)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'subscription.html';
    return;
  }

  if (/\b(privacy)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'privacy.html';
    return;
  }

  if (/\b(add recipe|create recipe)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'recipe/add.html';
    return;
  }

  if (/\b(order history|past orders)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'grocery/orders.html';
    return;
  }

  if (/\b(checkout|review order|continue to checkout)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'grocery/checkout.html';
    return;
  }

  if (/\b(confirm order)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    openModal('Order confirmed', '<p class="account-creation-copy">Your grocery order has been confirmed.</p>');
    return;
  }

  if (/^(‹|back)$/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.history.back();
    return;
  }

  if (/\b(profile|account|👤)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.href = 'profile.html';
    return;
  }

  if (/\b(menu|☰)\b/i.test(text)) {
    event.preventDefault();
    event.stopPropagation();
    openMenuModal();
    return;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  createModal();
  const profile = getUserProfile();
  if (!profile) {
    openAccountCreationModal();
    return;
  }

  startApp();
  if (!localStorage.getItem('pantryPalOnboardingSeen')) {
    openAccountOnboardingModal();
  }
});
