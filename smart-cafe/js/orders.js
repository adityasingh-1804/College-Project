/**
 * SMART CAFÉ - ORDER HISTORY & TRACKING LOGIC
 * 
 * Displays customer order records, interactive status tracker stepper,
 * detailed breakdown modal, and receipt linking.
 */

document.addEventListener('DOMContentLoaded', () => {
  renderOrdersPage();

  // Re-render when orders are modified (e.g. by admin updating status)
  window.addEventListener('smartcafe_orders_updated', () => {
    renderOrdersPage();
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'smartcafe_orders') {
      renderOrdersPage();
    }
  });
});

/**
 * Main render function for customer orders page
 */
function renderOrdersPage() {
  const container = document.getElementById('orders-page-container');
  if (!container) return;

  const orders = getOrders();

  // If no past orders exist
  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-state">
        <div class="empty-cart-icon">📦</div>
        <h2 class="empty-cart-title">No Orders Placed Yet</h2>
        <p class="empty-cart-desc">
          You haven't placed any orders yet. Visit our digital menu to place your first delicious café order!
        </p>
        <a href="menu.html" class="btn btn-primary btn-lg">Explore Menu</a>
      </div>
    `;
    return;
  }

  // Active / Most recent order for Live Stepper Tracker
  const latestOrder = orders[0];

  container.innerHTML = `
    <!-- Live Order Progress Stepper (Latest Order) -->
    <div class="order-stepper-box">
      <div class="stepper-header">
        <div>
          <span class="section-tag">Live Order Tracker</span>
          <h2 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--primary-dark);">
            Order #${latestOrder.orderId}
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">
            Customer: <strong>${latestOrder.customerName}</strong> • Table: <strong>${latestOrder.tableNumber}</strong> (${latestOrder.orderType})
          </p>
        </div>
        <div>
          <span class="status-pill ${latestOrder.status.toLowerCase()}">
            ● ${latestOrder.status}
          </span>
        </div>
      </div>

      ${renderStepperTrack(latestOrder.status)}

      <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap: 1rem;">
        <span style="font-size: 0.88rem; color: var(--text-secondary);">
          ⏱️ Estimated Prep Time: <strong>${latestOrder.estimatedTime || '15–20 minutes'}</strong>
        </span>
        <a href="bill.html?orderId=${latestOrder.orderId}" class="btn btn-secondary btn-sm">
          🧾 View Bill
        </a>
      </div>
    </div>

    <!-- Orders History List -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--primary-dark);">
        Past Orders (${orders.length})
      </h2>
      <span style="font-size: 0.85rem; color: var(--text-muted);">
        Stored securely in browser LocalStorage
      </span>
    </div>

    <div class="orders-list">
      ${orders.map(order => `
        <div class="order-history-card">
          <div class="order-card-main">
            <div class="order-id-chip">${order.orderId}</div>
            <div>
              <div style="font-weight: 700; color: var(--primary-dark); font-size: 1.05rem;">
                ${order.customerName} • Table ${order.tableNumber}
              </div>
              <div style="font-size: 0.82rem; color: var(--text-muted);">
                ${order.date} at ${order.time} • ${order.items.reduce((s, i) => s + Number(i.quantity), 0)} items • ${order.paymentMethod}
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 1.25rem;">
            <div style="text-align: right;">
              <div style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; color: var(--primary-dark);">
                ₹${Number(order.grandTotal).toFixed(2)}
              </div>
              <span class="status-pill ${order.status.toLowerCase()}">
                ${order.status}
              </span>
            </div>

            <div style="display: flex; gap: 0.5rem;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="showOrderDetailsModal('${order.orderId}')">
                Details
              </button>
              <a href="bill.html?orderId=${order.orderId}" class="btn btn-accent btn-sm" title="View & Print Bill">
                🧾 Bill
              </a>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Order Details Modal Container -->
    <div id="order-details-modal" class="modal-overlay"></div>
  `;
}

/**
 * Generate visual Stepper HTML based on current order status
 * @param {string} status 
 * @returns {string} HTML markup
 */
function renderStepperTrack(status) {
  const steps = [
    { key: 'Pending', label: 'Order Received', icon: '📝' },
    { key: 'Accepted', label: 'Accepted', icon: '👍' },
    { key: 'Preparing', label: 'In Kitchen', icon: '👨‍🍳' },
    { key: 'Ready', label: 'Ready for Pickup', icon: '🛎️' },
    { key: 'Completed', label: 'Served / Enjoy', icon: '🍽️' }
  ];

  const statusOrder = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed'];
  const currentIndex = statusOrder.indexOf(status);

  return `
    <div class="stepper-track">
      ${steps.map((step, idx) => {
        let nodeClass = '';
        if (currentIndex > idx) {
          nodeClass = 'completed';
        } else if (currentIndex === idx) {
          nodeClass = 'active';
        }

        return `
          <div class="step-node ${nodeClass}">
            <div class="step-circle">
              ${currentIndex > idx ? '✓' : step.icon}
            </div>
            <div class="step-label">${step.label}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Open popup modal with itemized order details
 * @param {string} orderId 
 */
function showOrderDetailsModal(orderId) {
  const modal = document.getElementById('order-details-modal');
  if (!modal) return;

  const orders = getOrders();
  const order = orders.find(o => o.orderId === orderId);

  if (!order) return;

  modal.innerHTML = `
    <div class="modal-card">
      <button type="button" class="modal-close-btn" onclick="closeOrderDetailsModal()">✕</button>
      
      <div style="margin-bottom: 1.25rem;">
        <span class="status-pill ${order.status.toLowerCase()}" style="margin-bottom: 0.5rem;">
          ${order.status}
        </span>
        <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--primary-dark);">
          Order #${order.orderId}
        </h3>
        <p style="font-size: 0.85rem; color: var(--text-muted);">
          Placed on ${order.date} at ${order.time}
        </p>
      </div>

      <div style="background: var(--bg-warm-tint); padding: 0.9rem; border-radius: var(--radius-md); margin-bottom: 1.25rem; font-size: 0.88rem;">
        <div><strong>Customer:</strong> ${order.customerName} (${order.customerPhone})</div>
        <div><strong>Table:</strong> ${order.tableNumber} • <strong>Order Type:</strong> ${order.orderType}</div>
        <div><strong>Payment:</strong> ${order.paymentMethod} • Txn: <code>${order.transactionId}</code></div>
      </div>

      <h4 style="font-family: var(--font-heading); font-size: 1rem; margin-bottom: 0.6rem; color: var(--primary-dark);">
        Items Ordered
      </h4>
      <div style="max-height: 200px; overflow-y: auto; margin-bottom: 1.25rem;">
        ${order.items.map(item => `
          <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px dotted var(--border-light); font-size: 0.9rem;">
            <span>${item.name} <strong>× ${item.quantity}</strong></span>
            <span style="font-weight: 700;">₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>

      <div style="border-top: 1px dashed var(--border-light); padding-top: 0.75rem; font-size: 0.9rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.3rem;">
          <span>Subtotal:</span>
          <span>₹${order.subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.3rem;">
          <span>GST (5%):</span>
          <span>₹${order.gstAmount.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.3rem; color: #16A34A;">
          <span>Discount:</span>
          <span>${order.discountAmount > 0 ? `-₹${order.discountAmount.toFixed(2)}` : '₹0.00'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1.15rem; color: var(--primary-dark); margin-top: 0.5rem; padding-top: 0.5rem; border-top: 2px solid var(--border-light);">
          <span>Grand Total:</span>
          <span style="color: var(--accent-gold);">₹${order.grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem; justify-content: flex-end;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="closeOrderDetailsModal()">Close</button>
        <a href="bill.html?orderId=${order.orderId}" class="btn btn-primary btn-sm">View Full Tax Invoice</a>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

/**
 * Close details modal
 */
function closeOrderDetailsModal() {
  const modal = document.getElementById('order-details-modal');
  if (modal) modal.classList.remove('open');
}
