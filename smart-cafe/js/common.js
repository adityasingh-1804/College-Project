/**
 * SMART CAFÉ - COMMON APPLICATION SCRIPT
 * 
 * Shared UI helpers: Navigation, Cart Badges, Toast Notifications,
 * and Cross-Tab Real-Time Sync.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  updateCartBadges();
  initStorageListeners();
});

/**
 * Initialize Navbar, active route styling, and mobile hamburger toggle
 */
function initNavbar() {
  // Mobile Hamburger Toggle
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      mobileBtn.setAttribute('aria-expanded', isOpen);
      mobileBtn.innerHTML = isOpen ? '✕' : '☰';
    });

    // Close menu when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileBtn.contains(e.target) && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        mobileBtn.innerHTML = '☰';
      }
    });
  }

  // Active Link Highlighting
  highlightActiveNavLink();
}

/**
 * Highlights current active navigation item based on current URL
 */
function highlightActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Update Cart badges in navigation and floating kiosk widgets
 */
function updateCartBadges() {
  const count = typeof getCartItemCount === 'function' ? getCartItemCount() : 0;
  const badges = document.querySelectorAll('.cart-nav-badge, #cart-badge-count, .cart-count-display');

  badges.forEach(badge => {
    badge.textContent = count;
    badge.classList.remove('animate-pop');
    void badge.offsetWidth; // Trigger reflow for animation restart
    badge.classList.add('animate-pop');
  });

  // Update floating bar on menu page if present
  const floatingBar = document.getElementById('floating-kiosk-cart');
  if (floatingBar && typeof calculateBill === 'function') {
    if (count > 0) {
      floatingBar.classList.remove('hidden');
      const bill = calculateBill();
      const countEl = floatingBar.querySelector('.floating-cart-count');
      const totalEl = floatingBar.querySelector('.floating-cart-total');
      if (countEl) countEl.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
      if (totalEl) totalEl.textContent = `₹${bill.grandTotal.toFixed(2)}`;
    } else {
      floatingBar.classList.add('hidden');
    }
  }
}

/**
 * Listen for storage events across tabs & custom internal events
 */
function initStorageListeners() {
  window.addEventListener('smartcafe_cart_updated', () => {
    updateCartBadges();
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'smartcafe_cart') {
      updateCartBadges();
    }
  });
}

/**
 * Global Toast Notification Generator
 * @param {string} message - Message text
 * @param {'success'|'warning'|'danger'|'info'} type - Color classification
 * @param {number} duration - Auto-dismiss timeout in ms
 */
function showToast(message, type = 'success', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✓',
    warning: '⚠',
    danger: '✕',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span style="font-size: 1.1rem; font-weight: 800;">${iconMap[type] || '•'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, duration);
}
