/**
 * SMART CAFÉ - SHOPPING CART LOGIC
 * 
 * Handles cart item rendering, dynamic quantity adjustment,
 * live subtotal/GST/discount calculation, and checkout navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  renderCart();

  // Listen for cart changes (e.g. from other tabs or actions)
  window.addEventListener('smartcafe_cart_updated', () => {
    renderCart();
  });
});

/**
 * Main render function for shopping cart page
 */
function renderCart() {
  const container = document.getElementById('cart-container');
  if (!container) return;

  const cart = getCart();

  // 1. Handle Empty Cart
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-state">
        <div class="empty-cart-icon">🛒</div>
        <h2 class="empty-cart-title">Your Cart is Empty</h2>
        <p class="empty-cart-desc">
          Your cart is currently empty. Please add some delicious café items first! 🍔☕
        </p>
        <a href="menu.html" class="btn btn-primary btn-lg">
          Explore Digital Menu
        </a>
      </div>
    `;
    return;
  }

  // 2. Perform Dynamic Bill Calculation
  const bill = calculateBill(cart);

  // Fallback SVG for broken images
  const fallbackSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="#4A2E20">
      <rect width="100%" height="100%" fill="#F6EFE8"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#6F4E37">Food</text>
    </svg>
  `);

  // Discount Offer Progress Calculation
  const progressPercent = Math.min(100, Math.round((bill.subtotal / bill.discountThreshold) * 100));

  container.innerHTML = `
    <div class="cart-layout">
      <!-- Left Column: Items List -->
      <div class="cart-items-card">
        <div class="cart-card-header">
          <h2 class="cart-card-title">
            Your Order Items 
            <span style="font-size: 0.95rem; font-weight: 500; color: var(--text-muted);">(${bill.itemCount} items)</span>
          </h2>
          <button type="button" class="btn btn-danger btn-sm" onclick="handleClearCart()">
            Clear All
          </button>
        </div>

        <div style="overflow-x: auto;">
          <table class="cart-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => {
                const itemTotal = (Number(item.price) * Number(item.quantity)).toFixed(2);
                return `
                  <tr id="cart-row-${item.id}">
                    <td>
                      <div class="cart-item-info">
                        <img src="${item.image}" 
                             alt="${item.name}" 
                             class="cart-item-thumb"
                             onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,${fallbackSvg}'">
                        <div>
                          <div class="cart-item-title">${item.name}</div>
                          <span class="cart-item-cat">${item.category}</span>
                        </div>
                      </div>
                    </td>
                    <td class="cart-item-price">₹${Number(item.price).toFixed(2)}</td>
                    <td style="text-align: center;">
                      <div class="qty-counter">
                        <button type="button" class="qty-btn" onclick="updateItemQuantity('${item.id}', -1)" aria-label="Decrease quantity">−</button>
                        <input type="text" class="qty-input" value="${item.quantity}" readonly>
                        <button type="button" class="qty-btn" onclick="updateItemQuantity('${item.id}', 1)" aria-label="Increase quantity">+</button>
                      </div>
                    </td>
                    <td class="cart-item-total" style="text-align: right;">₹${itemTotal}</td>
                    <td style="text-align: right;">
                      <button type="button" class="btn-remove-item" onclick="handleRemoveItem('${item.id}', '${item.name}')" title="Remove item">
                        🗑️
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
          <a href="menu.html" class="btn btn-secondary btn-sm">
            ← Add More Items
          </a>
          <span style="font-size: 0.85rem; color: var(--text-muted);">
            Prices inclusive of all kitchen prep charges
          </span>
        </div>
      </div>

      <!-- Right Column: Order Summary & Bill Calculation -->
      <div class="cart-summary-card">
        <h2 class="cart-card-title" style="margin-bottom: 1.25rem;">Order Summary</h2>

        <!-- Discount Alert & Incentive Progress -->
        ${bill.hasDiscount ? `
          <div class="discount-alert-box" style="background: var(--status-success-bg); border-color: var(--status-success); color: #065F46;">
            <div class="discount-alert-icon">🎉</div>
            <div class="discount-alert-text">
              <strong>10% Discount Applied!</strong>
              <div>You saved ₹${bill.discountAmount.toFixed(2)} on this order.</div>
            </div>
          </div>
        ` : `
          <div class="discount-alert-box">
            <div class="discount-alert-icon">🏷️</div>
            <div class="discount-alert-text" style="width: 100%;">
              <strong>Special Offer: 10% OFF on ₹${bill.discountThreshold}+</strong>
              <div>Add <strong>₹${bill.remainingForDiscount.toFixed(2)}</strong> more food to unlock 10% discount!</div>
              <div class="discount-progress-bar">
                <div class="discount-progress-fill" style="width: ${progressPercent}%;"></div>
              </div>
            </div>
          </div>
        `}

        <!-- Dynamic Calculation Breakdown -->
        <div class="summary-row">
          <span>Subtotal (${bill.itemCount} items)</span>
          <strong style="color: var(--primary-dark);">₹${bill.subtotal.toFixed(2)}</strong>
        </div>

        <div class="summary-row">
          <span>GST (${bill.gstRate}%)</span>
          <span style="color: var(--text-secondary);">₹${bill.gstAmount.toFixed(2)}</span>
        </div>

        <div class="summary-row discount-row">
          <span>Discount ${bill.hasDiscount ? '(10%)' : ''}</span>
          <span>${bill.hasDiscount ? `-₹${bill.discountAmount.toFixed(2)}` : '₹0.00'}</span>
        </div>

        <div class="summary-divider"></div>

        <div class="summary-row grand-total-row">
          <span>Grand Total</span>
          <span class="grand-total-amount">₹${bill.grandTotal.toFixed(2)}</span>
        </div>

        <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1.5rem; text-align: center;">
          *Includes 2.5% CGST and 2.5% SGST as per café compliance
        </p>

        <a href="checkout.html" class="btn btn-accent btn-lg" style="width: 100%;">
          Proceed to Checkout →
        </a>
      </div>
    </div>
  `;
}

/**
 * Update quantity of a single cart item
 * @param {string} itemId 
 * @param {number} delta - (+1 or -1)
 */
function updateItemQuantity(itemId, delta) {
  let cart = getCart();
  const itemIndex = cart.findIndex(i => i.id === itemId);

  if (itemIndex === -1) return;

  cart[itemIndex].quantity += delta;

  if (cart[itemIndex].quantity <= 0) {
    // Confirm removal if quantity reduced below 1
    const itemName = cart[itemIndex].name;
    cart.splice(itemIndex, 1);
    showToast(`Removed ${itemName} from cart`, 'info');
  }

  saveCart(cart);
  renderCart();
}

/**
 * Remove a specific item from cart
 * @param {string} itemId 
 * @param {string} itemName 
 */
function handleRemoveItem(itemId, itemName) {
  let cart = getCart();
  cart = cart.filter(i => i.id !== itemId);
  saveCart(cart);
  showToast(`Removed ${itemName} from cart`, 'info');
  renderCart();
}

/**
 * Clear all items from cart with confirmation
 */
function handleClearCart() {
  if (confirm('Are you sure you want to clear your entire cart?')) {
    clearCart();
    showToast('Shopping cart cleared', 'warning');
    renderCart();
  }
}
