/**
 * SMART CAFÉ - DIGITAL BILL & INVOICE GENERATOR
 * 
 * Renders print-ready digital tax invoice, calculates item breakdowns,
 * and triggers window.print() for physical printing or PDF export.
 */

document.addEventListener('DOMContentLoaded', () => {
  renderBill();
});

/**
 * Fetch targeted order and render the digital invoice
 */
function renderBill() {
  const container = document.getElementById('bill-content-container');
  if (!container) return;

  // Retrieve orderId from URL parameters
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('orderId');

  const orders = getOrders();
  let targetOrder = null;

  if (requestedId) {
    targetOrder = orders.find(o => o.orderId === requestedId);
  } else if (orders.length > 0) {
    // Default to most recent order if no query parameter supplied
    targetOrder = orders[0];
  }

  // Handle case where no orders exist
  if (!targetOrder) {
    container.innerHTML = `
      <div class="empty-cart-state" style="max-width: 500px; margin: 3rem auto;">
        <div class="empty-cart-icon">📄</div>
        <h2 class="empty-cart-title">No Invoice Found</h2>
        <p class="empty-cart-desc">
          We couldn't locate this bill. Please place an order first or browse past orders in history.
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <a href="menu.html" class="btn btn-primary btn-sm">Browse Menu</a>
          <a href="orders.html" class="btn btn-secondary btn-sm">Order History</a>
        </div>
      </div>
    `;
    return;
  }

  // Generate Simulated Barcode pattern based on Order ID
  const barcodeNumber = `*${targetOrder.orderId}*`;

  // Render Tax Invoice Paper
  container.innerHTML = `
    <div class="bill-page-container">
      <!-- Invoice Actions Bar (Hidden during printing via CSS) -->
      <div class="invoice-actions">
        <a href="orders.html" class="btn btn-secondary btn-sm">
          ← Order History
        </a>
        <div style="display: flex; gap: 0.75rem;">
          <button type="button" class="btn btn-accent btn-sm" onclick="handlePrintInvoice()">
            🖨️ Print Bill (Ctrl+P)
          </button>
          <a href="menu.html" class="btn btn-primary btn-sm">
            + Order More
          </a>
        </div>
      </div>

      <!-- Printable Invoice Paper -->
      <div class="invoice-paper" id="printable-bill-area">
        <div class="invoice-header">
          <div class="invoice-cafe-name">SMART CAFÉ</div>
          <div class="invoice-cafe-subtitle">Digi-Menu & Auto Billing System</div>
          <div class="invoice-cafe-address">
            Kiosk Terminal #01 • Ghaziabad, Uttar Pradesh, India<br>
            Phone: +91 98765 43210 • GSTIN: 07AAAAA0000A1Z5
          </div>
        </div>

        <div class="invoice-meta-grid">
          <div class="meta-item">
            <strong>Order ID:</strong> ${targetOrder.orderId}<br>
            <strong>Date:</strong> ${targetOrder.date}<br>
            <strong>Time:</strong> ${targetOrder.time}
          </div>
          <div class="meta-item" style="text-align: right;">
            <strong>Customer:</strong> ${targetOrder.customerName}<br>
            <strong>Table:</strong> ${targetOrder.tableNumber}<br>
            <strong>Type:</strong> ${targetOrder.orderType}
          </div>
        </div>

        <table class="invoice-table">
          <thead>
            <tr>
              <th style="width: 45%;">ITEM</th>
              <th style="width: 15%; text-align: center;">QTY</th>
              <th style="width: 20%; text-align: right;">PRICE</th>
              <th style="width: 20%; text-align: right;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${targetOrder.items.map(item => `
              <tr>
                <td style="font-weight: bold; color: #111;">${item.name}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">₹${Number(item.price).toFixed(2)}</td>
                <td style="text-align: right; font-weight: bold;">₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="invoice-calc-box">
          <div class="invoice-calc-row">
            <span>Subtotal:</span>
            <span>₹${targetOrder.subtotal.toFixed(2)}</span>
          </div>
          <div class="invoice-calc-row">
            <span>CGST (2.5%):</span>
            <span>₹${(targetOrder.gstAmount / 2).toFixed(2)}</span>
          </div>
          <div class="invoice-calc-row">
            <span>SGST (2.5%):</span>
            <span>₹${(targetOrder.gstAmount / 2).toFixed(2)}</span>
          </div>
          <div class="invoice-calc-row">
            <span>Total GST (5%):</span>
            <span>₹${targetOrder.gstAmount.toFixed(2)}</span>
          </div>
          <div class="invoice-calc-row" style="color: #16A34A; font-weight: bold;">
            <span>Discount (10% on ₹500+):</span>
            <span>${targetOrder.discountAmount > 0 ? `-₹${targetOrder.discountAmount.toFixed(2)}` : '₹0.00'}</span>
          </div>

          <div class="invoice-calc-row grand-total">
            <span>GRAND TOTAL:</span>
            <span>₹${targetOrder.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div style="background: #FDFBF7; padding: 0.75rem; border-radius: 4px; border: 1px dashed #DDD; font-size: 0.82rem; margin-bottom: 1.25rem;">
          <div><strong>Payment Mode:</strong> ${targetOrder.paymentMethod}</div>
          <div><strong>Transaction ID:</strong> <span style="font-family: monospace;">${targetOrder.transactionId}</span></div>
          <div><strong>Order Status:</strong> <span style="text-transform: uppercase; font-weight: bold;">${targetOrder.status}</span></div>
        </div>

        <div class="invoice-footer">
          <div style="font-family: monospace; letter-spacing: 2px; font-weight: bold;">${barcodeNumber}</div>
          <p style="margin: 0.5rem 0 0.25rem; font-weight: bold;">Thank you for visiting Smart Café!</p>
          <p style="font-size: 0.75rem; color: #777;">Please retain this digital slip for pickup confirmation.</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Trigger browser print dialog for printing or PDF export
 */
function handlePrintInvoice() {
  window.print();
}
