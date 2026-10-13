/**
 * SMART CAFÉ - ADMIN DASHBOARD LOGIC
 * 
 * Features:
 * 1. Admin Authentication (Demo PIN: admin123)
 * 2. Real-time KPI Stats (Total Orders, Total Sales, Items Sold, Pending Orders)
 * 3. Live Kitchen Order Pipeline (Accept, Preparing, Ready, Completed)
 * 4. Full Menu Management CRUD (Add, Edit, Delete, Stock Availability Toggle)
 * 5. Factory Reset for College Demo Presentation
 */

const ADMIN_DEFAULT_PIN = 'admin123';
let currentAdminTab = 'orders'; // 'orders' or 'menu'

document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
});

/**
 * Initialize admin dashboard or login view
 */
function initAdmin() {
  const isLoggedIn = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  const loginView = document.getElementById('admin-login-view');
  const dashView = document.getElementById('admin-dashboard-view');

  if (!isLoggedIn) {
    if (loginView) loginView.style.display = 'block';
    if (dashView) dashView.style.display = 'none';
    setupLoginForm();
  } else {
    if (loginView) loginView.style.display = 'none';
    if (dashView) dashView.style.display = 'block';
    renderDashboardStats();
    renderActiveAdminTab();
  }
}

/**
 * Set up admin login form submission
 */
function setupLoginForm() {
  const form = document.getElementById('admin-login-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const pinInput = document.getElementById('admin-password-input');
    const pin = pinInput ? pinInput.value.trim() : '';

    if (pin === ADMIN_DEFAULT_PIN) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      showToast('Admin Access Granted! Welcome to Smart Café Control.', 'success');
      initAdmin();
    } else {
      showToast('Incorrect Admin PIN! (Default is admin123)', 'danger');
      if (pinInput) {
        pinInput.value = '';
        pinInput.focus();
      }
    }
  });
}

/**
 * Log out admin
 */
function handleAdminLogout() {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  showToast('Logged out of Admin Portal.', 'info');
  initAdmin();
}

/**
 * Calculate and render KPI Cards:
 * Total Orders, Total Sales, Items Sold, Pending Orders
 */
function renderDashboardStats() {
  const orders = getOrders();

  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
  const itemsSold = orders.reduce((sum, o) => {
    return sum + (o.items ? o.items.reduce((s, i) => s + (Number(i.quantity) || 0), 0) : 0);
  }, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing' || o.status === 'Accepted').length;

  const countEl = document.getElementById('stat-total-orders');
  const salesEl = document.getElementById('stat-total-sales');
  const itemsEl = document.getElementById('stat-items-sold');
  const pendingEl = document.getElementById('stat-pending-orders');

  if (countEl) countEl.textContent = totalOrders;
  if (salesEl) salesEl.textContent = `₹${totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (itemsEl) itemsEl.textContent = itemsSold;
  if (pendingEl) pendingEl.textContent = pendingOrders;
}

/**
 * Switch active admin tab
 * @param {'orders'|'menu'} tab 
 */
function switchAdminTab(tab) {
  currentAdminTab = tab;
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  tabBtns.forEach(btn => {
    if (btn.dataset.tab === tab) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  renderActiveAdminTab();
}

/**
 * Render content based on current active tab
 */
function renderActiveAdminTab() {
  const container = document.getElementById('admin-tab-content');
  if (!container) return;

  if (currentAdminTab === 'orders') {
    renderAdminOrders(container);
  } else if (currentAdminTab === 'menu') {
    renderAdminMenu(container);
  }
}

/* ==========================================================================
   Order Management Logic
   ========================================================================== */

/**
 * Render Orders Management Section
 * @param {HTMLElement} container 
 */
function renderAdminOrders(container) {
  const orders = getOrders();

  if (orders.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; background: #fff; border-radius: var(--radius-md); border: 1px dashed var(--border-light);">
        <p style="color: var(--text-muted);">No orders placed yet. Place an order from the customer side to see it live here!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h3 style="font-family: var(--font-heading); font-size: 1.25rem;">Live Orders Queue</h3>
      <span style="font-size: 0.85rem; color: var(--text-muted);">Auto-refreshes on status change</span>
    </div>

    <div style="overflow-x: auto;">
      <table class="admin-data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer & Table</th>
            <th>Items Ordered</th>
            <th>Total Amount</th>
            <th>Current Status</th>
            <th>Update Workflow</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(order => `
            <tr>
              <td>
                <strong>${order.orderId}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${order.time}</div>
              </td>
              <td>
                <div style="font-weight: 700;">${order.customerName}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${order.tableNumber} • ${order.orderType}</div>
              </td>
              <td>
                <div style="font-size: 0.85rem; max-width: 250px;">
                  ${order.items.map(i => `<span style="display: inline-block; background: var(--bg-warm-tint); padding: 0.15rem 0.4rem; border-radius: 4px; margin: 2px;">${i.quantity}× ${i.name}</span>`).join(' ')}
                </div>
              </td>
              <td>
                <strong style="color: var(--primary-dark);">₹${Number(order.grandTotal).toFixed(2)}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${order.paymentMethod}</div>
              </td>
              <td>
                <span class="status-pill ${order.status.toLowerCase()}">${order.status}</span>
              </td>
              <td>
                <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                  ${order.status === 'Pending' ? `
                    <button class="btn btn-primary btn-sm" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;" onclick="updateOrderStatus('${order.orderId}', 'Accepted')">
                      Accept
                    </button>
                  ` : ''}

                  ${order.status === 'Accepted' || order.status === 'Pending' ? `
                    <button class="btn btn-secondary btn-sm" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;" onclick="updateOrderStatus('${order.orderId}', 'Preparing')">
                      👨‍🍳 Preparing
                    </button>
                  ` : ''}

                  ${order.status === 'Preparing' ? `
                    <button class="btn btn-accent btn-sm" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;" onclick="updateOrderStatus('${order.orderId}', 'Ready')">
                      🛎️ Ready
                    </button>
                  ` : ''}

                  ${order.status === 'Ready' ? `
                    <button class="btn btn-primary btn-sm" style="font-size: 0.75rem; padding: 0.3rem 0.6rem; background: var(--status-success);" onclick="updateOrderStatus('${order.orderId}', 'Completed')">
                      ✓ Complete
                    </button>
                  ` : ''}

                  ${order.status !== 'Completed' && order.status !== 'Cancelled' ? `
                    <button class="btn btn-danger btn-sm" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;" onclick="updateOrderStatus('${order.orderId}', 'Cancelled')">
                      Cancel
                    </button>
                  ` : `
                    <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Finished</span>
                  `}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Transition order to a new state
 * @param {string} orderId 
 * @param {'Pending'|'Accepted'|'Preparing'|'Ready'|'Completed'|'Cancelled'} newStatus 
 */
function updateOrderStatus(orderId, newStatus) {
  let orders = getOrders();
  const orderIndex = orders.findIndex(o => o.orderId === orderId);

  if (orderIndex === -1) return;

  orders[orderIndex].status = newStatus;
  saveOrders(orders);
  showToast(`Order #${orderId} marked as "${newStatus}"`, 'success');

  renderDashboardStats();
  renderActiveAdminTab();
}

/* ==========================================================================
   Menu Management Logic (CRUD)
   ========================================================================== */

/**
 * Render Menu Management Section
 * @param {HTMLElement} container 
 */
function renderAdminMenu(container) {
  const menu = getMenu();

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h3 style="font-family: var(--font-heading); font-size: 1.25rem;">Dishes & Inventory (${menu.length} items)</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Add new dishes, edit pricing, or toggle out-of-stock items</p>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="handleResetDefaultMenu()">
          🔄 Reset Default Menu
        </button>
        <button type="button" class="btn btn-accent btn-sm" onclick="openAddMenuItemModal()">
          + Add New Item
        </button>
      </div>
    </div>

    <div style="overflow-x: auto;">
      <table class="admin-data-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Price</th>
            <th>Availability</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${menu.map(item => `
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <img src="${item.image}" alt="${item.name}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/44'">
                  <div>
                    <div style="font-weight: 700; color: var(--primary-dark);">${item.name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); max-width: 280px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                      ${item.description || ''}
                    </div>
                  </div>
                </div>
              </td>
              <td><span style="background: var(--bg-warm-tint); padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">${item.category}</span></td>
              <td><strong style="color: var(--primary-dark);">₹${Number(item.price).toFixed(2)}</strong></td>
              <td>
                <button type="button" 
                        class="status-pill ${item.available !== false ? 'completed' : 'cancelled'}" 
                        style="cursor: pointer;"
                        onclick="toggleItemStock('${item.id}')"
                        title="Click to toggle stock status">
                  ${item.available !== false ? 'In Stock ✓' : 'Out of Stock ✕'}
                </button>
              </td>
              <td style="text-align: right;">
                <button type="button" class="btn btn-secondary btn-sm" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="openEditMenuItemModal('${item.id}')">
                  Edit
                </button>
                <button type="button" class="btn btn-danger btn-sm" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="handleDeleteMenuItem('${item.id}', '${item.name}')">
                  Delete
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Add / Edit Modal Container -->
    <div id="admin-menu-modal" class="modal-overlay"></div>
  `;
}

/**
 * Toggle stock availability of a menu item
 * @param {string} itemId 
 */
function toggleItemStock(itemId) {
  let menu = getMenu();
  const item = menu.find(i => i.id === itemId);
  if (!item) return;

  item.available = item.available === false ? true : false;
  saveMenu(menu);
  showToast(`"${item.name}" marked as ${item.available ? 'Available' : 'Out of Stock'}`, 'info');
  renderAdminMenu(document.getElementById('admin-tab-content'));
}

/**
 * Open Modal to Add a New Item
 */
function openAddMenuItemModal() {
  const modal = document.getElementById('admin-menu-modal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-card">
      <button type="button" class="modal-close-btn" onclick="closeAdminMenuModal()">✕</button>
      <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--primary-dark); margin-bottom: 1.25rem;">
        Add New Menu Item
      </h3>

      <form id="add-menu-form" onsubmit="handleSaveMenuItem(event, null)">
        <div class="form-group">
          <label class="form-label">Dish Name <span class="required">*</span></label>
          <input type="text" id="menu-form-name" class="form-control" placeholder="e.g. Hazelnut Frappe" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Category <span class="required">*</span></label>
            <select id="menu-form-category" class="form-control" required>
              <option value="Beverages">Beverages</option>
              <option value="Fast Food">Fast Food</option>
              <option value="Pizza">Pizza</option>
              <option value="Main Course">Main Course</option>
              <option value="Desserts">Desserts</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Price (₹) <span class="required">*</span></label>
            <input type="number" id="menu-form-price" class="form-control" placeholder="150" min="1" step="1" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Image URL</label>
          <input type="url" id="menu-form-image" class="form-control" placeholder="https://images.unsplash.com/photo-...">
        </div>

        <div class="form-group">
          <label class="form-label">Short Description</label>
          <textarea id="menu-form-desc" class="form-control" rows="3" placeholder="Describe the ingredients, taste and presentation..."></textarea>
        </div>

        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; cursor: pointer;">
            <input type="checkbox" id="menu-form-available" checked>
            <span>Mark as Immediately Available for Ordering</span>
          </label>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="closeAdminMenuModal()">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Add Item to Menu</button>
        </div>
      </form>
    </div>
  `;

  modal.classList.add('open');
}

/**
 * Open Modal to Edit an Existing Menu Item
 * @param {string} itemId 
 */
function openEditMenuItemModal(itemId) {
  const modal = document.getElementById('admin-menu-modal');
  if (!modal) return;

  const menu = getMenu();
  const item = menu.find(i => i.id === itemId);
  if (!item) return;

  modal.innerHTML = `
    <div class="modal-card">
      <button type="button" class="modal-close-btn" onclick="closeAdminMenuModal()">✕</button>
      <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--primary-dark); margin-bottom: 1.25rem;">
        Edit: ${item.name}
      </h3>

      <form id="edit-menu-form" onsubmit="handleSaveMenuItem(event, '${item.id}')">
        <div class="form-group">
          <label class="form-label">Dish Name <span class="required">*</span></label>
          <input type="text" id="menu-form-name" class="form-control" value="${item.name}" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Category <span class="required">*</span></label>
            <select id="menu-form-category" class="form-control" required>
              <option value="Beverages" ${item.category === 'Beverages' ? 'selected' : ''}>Beverages</option>
              <option value="Fast Food" ${item.category === 'Fast Food' ? 'selected' : ''}>Fast Food</option>
              <option value="Pizza" ${item.category === 'Pizza' ? 'selected' : ''}>Pizza</option>
              <option value="Main Course" ${item.category === 'Main Course' ? 'selected' : ''}>Main Course</option>
              <option value="Desserts" ${item.category === 'Desserts' ? 'selected' : ''}>Desserts</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Price (₹) <span class="required">*</span></label>
            <input type="number" id="menu-form-price" class="form-control" value="${item.price}" min="1" step="1" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Image URL</label>
          <input type="url" id="menu-form-image" class="form-control" value="${item.image || ''}">
        </div>

        <div class="form-group">
          <label class="form-label">Short Description</label>
          <textarea id="menu-form-desc" class="form-control" rows="3">${item.description || ''}</textarea>
        </div>

        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; cursor: pointer;">
            <input type="checkbox" id="menu-form-available" ${item.available !== false ? 'checked' : ''}>
            <span>Item is In Stock</span>
          </label>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="closeAdminMenuModal()">Cancel</button>
          <button type="submit" class="btn btn-accent btn-sm">Update Item</button>
        </div>
      </form>
    </div>
  `;

  modal.classList.add('open');
}

/**
 * Handle form save for both Add and Edit
 * @param {Event} e 
 * @param {string|null} existingId 
 */
function handleSaveMenuItem(e, existingId) {
  e.preventDefault();

  const name = document.getElementById('menu-form-name').value.trim();
  const category = document.getElementById('menu-form-category').value;
  const price = parseFloat(document.getElementById('menu-form-price').value) || 0;
  let image = document.getElementById('menu-form-image').value.trim();
  const description = document.getElementById('menu-form-desc').value.trim();
  const available = document.getElementById('menu-form-available').checked;

  if (!image) {
    // Default fallback image by category
    const catImages = {
      'Beverages': 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
      'Fast Food': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
      'Main Course': 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=600&auto=format&fit=crop&q=80',
      'Desserts': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80'
    };
    image = catImages[category] || 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80';
  }

  let menu = getMenu();

  if (existingId) {
    const idx = menu.findIndex(i => i.id === existingId);
    if (idx > -1) {
      menu[idx] = {
        ...menu[idx],
        name,
        category,
        price,
        image,
        description,
        available
      };
      showToast(`Updated "${name}" successfully!`, 'success');
    }
  } else {
    const newId = `custom_${Date.now()}`;
    menu.push({
      id: newId,
      name,
      category,
      price,
      image,
      description,
      available
    });
    showToast(`Added "${name}" to menu!`, 'success');
  }

  saveMenu(menu);
  closeAdminMenuModal();
  renderAdminMenu(document.getElementById('admin-tab-content'));
}

/**
 * Delete a menu item with confirmation
 * @param {string} itemId 
 * @param {string} itemName 
 */
function handleDeleteMenuItem(itemId, itemName) {
  if (confirm(`Are you sure you want to delete "${itemName}" from the menu?`)) {
    let menu = getMenu();
    menu = menu.filter(i => i.id !== itemId);
    saveMenu(menu);
    showToast(`Deleted "${itemName}" from menu`, 'info');
    renderAdminMenu(document.getElementById('admin-tab-content'));
  }
}

/**
 * Reset menu to factory default items
 */
function handleResetDefaultMenu() {
  if (confirm('Reset menu back to the original 24 items? Any custom added items will be removed.')) {
    resetDefaultMenu();
    showToast('Menu restored to factory defaults!', 'success');
    renderAdminMenu(document.getElementById('admin-tab-content'));
  }
}

/**
 * Close modal
 */
function closeAdminMenuModal() {
  const modal = document.getElementById('admin-menu-modal');
  if (modal) modal.classList.remove('open');
}
