/**
 * SMART CAFÉ - CHECKOUT & ORDER PLACEMENT LOGIC
 * 
 * Handles customer input validation, dynamic payment method switching,
 * simulated UPI QR generation, order object persistence, and confirmation.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCheckout();
});

/**
 * Initialize checkout page
 */
function initCheckout() {
  const cart = getCart();

  // Redirect if cart is empty
  if (cart.length === 0) {
    const container = document.getElementById('checkout-page-container');
    if (container) {
      container.innerHTML = `
        <div class="empty-cart-state">
          <div class="empty-cart-icon">🛒</div>
          <h2 class="empty-cart-title">Your Cart is Empty</h2>
          <p class="empty-cart-desc">
            You don't have any items to checkout. Please choose some delicious items first!
          </p>
          <a href="menu.html" class="btn btn-primary btn-lg">Explore Menu</a>
        </div>
      `;
    }
    return;
  }

  renderCheckoutSummary(cart);
  setupPaymentMethodToggle();
  setupOrderTypeToggle();
}

/**
 * Render order item list and totals in the checkout sidebar
 * @param {Array} cart 
 */
function renderCheckoutSummary(cart) {
  const listEl = document.getElementById('checkout-items-list');
  const bill = calculateBill(cart);

  if (listEl) {
    listEl.innerHTML = cart.map(item => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px dotted var(--border-subtle); font-size: 0.92rem;">
        <div>
          <span style="font-weight: 700; color: var(--primary-dark);">${item.name}</span>
          <span style="color: var(--text-muted); font-size: 0.8rem;"> × ${item.quantity}</span>
        </div>
        <div style="font-weight: 700;">₹${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `).join('');
  }

  // Update summary totals
  const subtotalEl = document.getElementById('checkout-subtotal');
  const gstEl = document.getElementById('checkout-gst');
  const discountEl = document.getElementById('checkout-discount');
  const totalEl = document.getElementById('checkout-total');

  if (subtotalEl) subtotalEl.textContent = `₹${bill.subtotal.toFixed(2)}`;
  if (gstEl) gstEl.textContent = `₹${bill.gstAmount.toFixed(2)}`;
  if (discountEl) discountEl.textContent = bill.hasDiscount ? `-₹${bill.discountAmount.toFixed(2)}` : '₹0.00';
  if (totalEl) totalEl.textContent = `₹${bill.grandTotal.toFixed(2)}`;

  // Also update UPI QR display total if present
  const upiAmtEl = document.getElementById('upi-amount-display');
  if (upiAmtEl) upiAmtEl.textContent = `₹${bill.grandTotal.toFixed(2)}`;
}

/**
 * Handle switching payment method tabs (Cash, UPI QR, Card)
 */
function setupPaymentMethodToggle() {
  const paymentInputs = document.querySelectorAll('input[name="paymentMethod"]');
  const upiBox = document.getElementById('upi-payment-box');
  const cardBox = document.getElementById('card-payment-box');
  const cashBox = document.getElementById('cash-payment-box');

  paymentInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const selected = e.target.value;

      if (upiBox) upiBox.style.display = selected === 'UPI' ? 'block' : 'none';
      if (cardBox) cardBox.style.display = selected === 'Card' ? 'block' : 'none';
      if (cashBox) cashBox.style.display = selected === 'Cash' ? 'block' : 'none';
    });
  });
}

/**
 * Handle Dine-in vs Takeaway table field toggle
 */
function setupOrderTypeToggle() {
  const orderTypeInputs = document.querySelectorAll('input[name="orderType"]');
  const tableGroup = document.getElementById('table-number-group');
  const tableInput = document.getElementById('tableNumber');

  orderTypeInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      if (e.target.value === 'Take Away') {
        if (tableInput) {
          tableInput.value = 'Counter';
          tableInput.setAttribute('disabled', 'true');
        }
      } else {
        if (tableInput) {
          tableInput.removeAttribute('disabled');
          if (tableInput.value === 'Counter') tableInput.value = '';
        }
      }
    });
  });
}

/**
 * Main form submission and order validation handler
 * @param {Event} e 
 */
function handlePlaceOrder(e) {
  if (e) e.preventDefault();

  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'danger');
    return;
  }

  // 1. Validate Form Fields
  const nameInput = document.getElementById('customerName');
  const phoneInput = document.getElementById('customerPhone');
  const tableInput = document.getElementById('tableNumber');
  const orderTypeInput = document.querySelector('input[name="orderType"]:checked');
  const paymentMethodInput = document.querySelector('input[name="paymentMethod"]:checked');

  const customerName = nameInput ? nameInput.value.trim() : '';
  const customerPhone = phoneInput ? phoneInput.value.trim() : '';
  let tableNumber = tableInput ? tableInput.value.trim() : '';
  const orderType = orderTypeInput ? orderTypeInput.value : 'Dine In';
  const paymentMethod = paymentMethodInput ? paymentMethodInput.value : 'Cash';

  if (!customerName || customerName.length < 2) {
    showToast('Please enter a valid Customer Name (at least 2 characters)', 'warning');
    if (nameInput) nameInput.focus();
    return;
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!customerPhone || !phoneRegex.test(customerPhone.replace(/[\s-]/g, ''))) {
    showToast('Please enter a valid 10-digit mobile number', 'warning');
    if (phoneInput) phoneInput.focus();
    return;
  }

  if (orderType === 'Dine In' && !tableNumber) {
    showToast('Please enter your Table Number for Dine In', 'warning');
    if (tableInput) tableInput.focus();
    return;
  }

  if (orderType === 'Take Away') {
    tableNumber = 'Counter / Takeaway';
  }

  // 2. Generate Simulated Transaction ID for UPI/Card
  let transactionId = 'N/A';
  if (paymentMethod === 'UPI') {
    transactionId = `SCUPI${Math.floor(100000 + Math.random() * 900000)}`;
  } else if (paymentMethod === 'Card') {
    transactionId = `SCCARD${Math.floor(100000 + Math.random() * 900000)}`;
  } else {
    transactionId = `SCCASH${Math.floor(100000 + Math.random() * 900000)}`;
  }

  // 3. Bill Calculations
  const bill = calculateBill(cart);

  // 4. Create Order Object
  const orderId = generateNextOrderId();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const newOrder = {
    orderId: orderId,
    customerName: customerName,
    customerPhone: customerPhone,
    tableNumber: tableNumber,
    orderType: orderType,
    items: cart,
    subtotal: bill.subtotal,
    gstRate: bill.gstRate,
    gstAmount: bill.gstAmount,
    discountRate: bill.discountRate,
    discountAmount: bill.discountAmount,
    grandTotal: bill.grandTotal,
    paymentMethod: paymentMethod,
    transactionId: transactionId,
    status: 'Pending', // Pending -> Accepted -> Preparing -> Ready -> Completed
    date: dateStr,
    time: timeStr,
    createdAt: now.toISOString(),
    estimatedTime: '15–20 minutes'
  };

  // 5. Save Order to LocalStorage
  const orders = getOrders();
  orders.unshift(newOrder); // Add to beginning
  saveOrders(orders);

  // 6. Clear Shopping Cart
  clearCart();

  // 7. Show Confirmation Screen
  renderOrderConfirmationScreen(newOrder);
}

/**
 * Renders the final Order Confirmation Screen in place
 * @param {Object} order 
 */
function renderOrderConfirmationScreen(order) {
  const container = document.getElementById('checkout-page-container');
  if (!container) return;

  container.innerHTML = `
    <div class="order-success-screen">
      <div class="success-icon-wrap">✓</div>
      <h1 class="order-success-title">Order Confirmed! 🎉</h1>
      <p style="color: var(--text-muted); margin-bottom: 1.25rem;">
        Thank you, <strong>${order.customerName}</strong>! Your order has been placed successfully and sent to the kitchen.
      </p>

      <div class="order-id-badge">Order ID: ${order.orderId}</div>

      <div class="order-success-details">
        <div class="success-detail-row">
          <span>Customer:</span>
          <span>${order.customerName}</span>
        </div>
        <div class="success-detail-row">
          <span>Mobile:</span>
          <span>${order.customerPhone}</span>
        </div>
        <div class="success-detail-row">
          <span>Order Type:</span>
          <span>${order.orderType}</span>
        </div>
        <div class="success-detail-row">
          <span>Table / Counter:</span>
          <span>${order.tableNumber}</span>
        </div>
        <div class="success-detail-row">
          <span>Payment Mode:</span>
          <span>${order.paymentMethod} (${order.paymentMethod === 'Cash' ? 'Pay at Counter' : 'Paid ✓'})</span>
        </div>
        <div class="success-detail-row">
          <span>Transaction ID:</span>
          <span style="font-family: monospace;">${order.transactionId}</span>
        </div>
        <div class="success-detail-row">
          <span>Grand Total:</span>
          <span style="color: var(--accent-gold); font-size: 1.1rem;">₹${order.grandTotal.toFixed(2)}</span>
        </div>
        <div class="success-detail-row" style="border-top: 1px dashed var(--border-light); margin-top: 0.5rem; padding-top: 0.5rem;">
          <span>Estimated Prep Time:</span>
          <span style="color: var(--status-success);">⏱️ ${order.estimatedTime}</span>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <a href="bill.html?orderId=${order.orderId}" class="btn btn-accent btn-lg">
          🧾 Generate Bill & Print
        </a>
        <a href="orders.html" class="btn btn-secondary btn-lg">
          📦 Track Order Status
        </a>
      </div>
    </div>
  `;
}
