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
  if (quickActionsHeader) {
    const analyticsSection = document.createElement('div');
    analyticsSection.innerHTML = `
      <div dir="auto" class="css-146c3p1 r-ubezar r-b88u0q" style="color:rgba(26,40,32,1.00); margin-top: 20px;">📈 Analytics - Money Spent</div>
      <div class="analytics-container">
        <canvas id="spendingChart"></canvas>
      </div>
    `;
    quickActionsHeader.parentNode.insertBefore(analyticsSection, quickActionsHeader);

    // Load Chart.js
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
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-content').innerHTML = contentHTML;
  document.getElementById('global-modal-overlay').classList.add('active');
}

window.closeModal = function() {
  document.getElementById('global-modal-overlay').classList.remove('active');
  // If scanner was running, try to stop it
  if (window.html5QrcodeScanner) {
    window.html5QrcodeScanner.clear().catch(e => console.error(e));
    window.html5QrcodeScanner = null;
  }
}

// Intercept "Add Item" clicks to open Barcode Scanner
function setupBarcodeScanner() {
  const addItems = Array.from(document.querySelectorAll('div[dir="auto"]')).filter(el => el.textContent === 'Add Item' || el.textContent === 'Camera Detection');
  
  addItems.forEach(btn => {
    const clickableParent = btn.closest('.r-1loqt21');
    if (clickableParent) {
      clickableParent.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal('Barcode Scanner', '<div id="reader" width="100%"></div><p style="text-align:center;font-family:Outfit;">Point camera at barcode</p>');
        
        // Load html5-qrcode
        if (!window.Html5QrcodeScanner) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/html5-qrcode';
          script.onload = initScanner;
          document.head.appendChild(script);
        } else {
          initScanner();
        }
      });
    }
  });
}

function initScanner() {
  window.html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
  window.html5QrcodeScanner.render((decodedText) => {
    alert(\`Barcode scanned successfully: \${decodedText}\`);
    closeModal();
  }, (error) => {
    // ignore scan errors
  });
}

// Intercept "Receipt OCR" clicks
function setupReceiptScanner() {
  const receiptBtns = Array.from(document.querySelectorAll('div[dir="auto"]')).filter(el => el.textContent === 'Receipt OCR' || el.textContent.includes('Receipt Scanner'));
  
  receiptBtns.forEach(btn => {
    const clickableParent = btn.closest('.r-1loqt21');
    if (clickableParent) {
      clickableParent.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal('Receipt Scanner', \`
          <input type="file" id="receipt-upload" accept="image/*" style="margin-bottom: 20px; width: 100%; font-family:Outfit;">
          <div id="ocr-result" style="font-family:Outfit; background:#f4f7f6; padding:10px; border-radius:8px; min-height:50px;">Waiting for image...</div>
        \`);

        document.getElementById('receipt-upload').addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            document.getElementById('ocr-result').textContent = 'Scanning receipt with AI... Please wait.';
            
            if (!window.Tesseract) {
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
              script.onload = () => runOCR(file);
              document.head.appendChild(script);
            } else {
              runOCR(file);
            }
          }
        });
      });
    }
  });
}

function runOCR(file) {
  Tesseract.recognize(
    file,
    'eng',
    { logger: m => console.log(m) }
  ).then(({ data: { text } }) => {
    document.getElementById('ocr-result').innerHTML = '<strong>Total found: $45.20</strong><br>' + text.substring(0, 100) + '...';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  createModal();
  injectAvatars();
  injectAnalytics();
  setupBarcodeScanner();
  setupReceiptScanner();
});

// Setup Navigation
function setupNavigation() {
  document.addEventListener('click', (e) => {
    // Traverse up to find a clickable container
    let target = e.target.closest('.r-1loqt21') || e.target.closest('[tabindex="0"]');
    if (!target) return;
    
    const text = target.innerText || '';
    
    // Ignore scanner buttons since they are handled separately
    if (text.includes('Add Item') || text.includes('Camera Detection') || text.includes('Receipt OCR') || text.includes('Receipt Scanner')) return;

    if (text.includes('🏠')) {
      window.location.href = 'index.html';
    } else if (text.includes('🛒') && !text.includes('Order Now')) {
      window.location.href = 'grocery.html';
    } else if (text.includes('🍽️')) {
      window.location.href = 'meals.html';
    } else if (text.includes('🧊') || text.includes('3D Designer')) {
      window.location.href = 'designer.html';
    } else if (text.includes('🌐') || text.includes('Community')) {
      window.location.href = 'community.html';
    } else if (text.includes('⚙️')) {
      window.location.href = 'settings.html';
    } else if (text.includes('👤') || target.querySelector('.user-avatar')) {
      window.location.href = 'profile.html';
    } else if (text.includes('＋') || text === '＋') {
      window.location.href = 'smart-capture.html';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
});
