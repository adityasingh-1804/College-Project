let currentCategory = 'All';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  initMenuPage();
});

/**
 * Initialize Menu Page components and event listeners
 */
function initMenuPage() {
  renderCategoryPills();
  renderMenu();
  setupSearchListener();

  // Re-render when menu changes via admin
  window.addEventListener('smartcafe_menu_updated', () => {
    renderCategoryPills();
    renderMenu();
  });
}

/**
 * Setup Real-time Search input handler
 */
function setupSearchListener() {
  const searchInput = document.getElementById('menu-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderMenu();
  });
}

/**
 * Renders the category filter buttons with live counts
 */
function renderCategoryPills() {
  const container = document.getElementById('category-filter-container');
  if (!container) return;

  const allItems = getMenu();
  const categories = ['All', 'Beverages', 'Fast Food', 'Pizza', 'Main Course', 'Desserts'];

  // Calculate counts per category
  const counts = { All: allItems.length };
  categories.forEach(cat => {
    if (cat !== 'All') {
      counts[cat] = allItems.filter(item => item.category === cat).length;
    }
  });

  const categoryIcons = {
    'All': '🍽️',
    'Beverages': '☕',
    'Fast Food': '🍔',
    'Pizza': '🍕',
    'Main Course': '🍝',
    'Desserts': '🍰'
  };

  container.innerHTML = categories.map(cat => `
    <button type="button" 
            class="cat-btn ${cat === currentCategory ? 'active' : ''}" 
            onclick="selectCategory('${cat}')">
      <span>${categoryIcons[cat] || '•'}</span>
      <span>${cat}</span>
      <span class="cat-count">${counts[cat] || 0}</span>
    </button>
  `).join('');
}

/**
 * Handle category tab selection
 * @param {string} category 
 */
function selectCategory(category) {
  currentCategory = category;
  renderCategoryPills();
  renderMenu();
}

/**
 * Filters items and renders food cards into the DOM
 */
function renderMenu() {
  const grid = document.getElementById('menu-items-grid');
  const countEl = document.getElementById('visible-count-display');
  if (!grid) return;

  const allItems = getMenu();

  // Apply Category Filter & Search Filter
  const filtered = allItems.filter(item => {
    const matchesCategory = currentCategory === 'All' || item.category === currentCategory;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery) ||
      (item.description && item.description.toLowerCase().includes(searchQuery)) ||
      item.category.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${allItems.length} items`;
  }

  // Handle Empty Search Results
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 2px dashed var(--border-light);">
        <div style="font-size: 3rem; margin-bottom: 0.75rem;">🔍</div>
        <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--primary-dark); margin-bottom: 0.5rem;">No Dishes Found</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.25rem;">
          We couldn't find anything matching "<strong>${searchQuery}</strong>" in ${currentCategory}.
        </p>
        <button class="btn btn-secondary btn-sm" onclick="clearFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  // Fallback image generator function
  const fallbackSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="#4A2E20">
      <rect width="100%" height="100%" fill="#F6EFE8"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="bold" fill="#6F4E37">Smart Café</text>
    </svg>
  `);

  grid.innerHTML = filtered.map(item => {
    const isOutOfStock = item.available === false;
    const itemCardClass = isOutOfStock ? 'food-card out-of-stock' : 'food-card';

    return `
      <div class="${itemCardClass}" id="card-${item.id}">
        <div class="food-img-wrap">
          <img src="${item.image}" 
               alt="${item.name}" 
               class="food-img" 
               loading="lazy" 
               onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,${fallbackSvg}'">
          
          <span class="food-card-badge">${item.category}</span>
          
          <span class="stock-tag ${isOutOfStock ? 'out-stock' : 'in-stock'}">
            ${isOutOfStock ? 'Out of Stock' : 'Available'}
          </span>
        </div>

        <div class="food-card-body">
          <span class="food-category-meta">${item.category}</span>
          <h3 class="food-name">${item.name}</h3>
          <p class="food-desc">${item.description || 'Delicious freshly prepared café specialty.'}</p>
          
          <div class="food-card-footer">
            <div class="food-price">
              <span class="currency">₹</span>${Number(item.price).toFixed(0)}
            </div>

            ${isOutOfStock ? `
              <button type="button" class="btn btn-add-cart btn-sm" disabled>
                Out of Stock
              </button>
            ` : `
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div class="qty-counter">
                  <button type="button" class="qty-btn" onclick="stepQty('${item.id}', -1)" aria-label="Decrease quantity">−</button>
                  <input type="text" id="qty-${item.id}" class="qty-input" value="1" readonly>
                  <button type="button" class="qty-btn" onclick="stepQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
                </div>
                
                <button type="button" 
                        class="btn btn-primary btn-sm btn-add-cart" 
                        onclick="addToCart('${item.id}')"
                        title="Add ${item.name} to Cart">
                  + Add
                </button>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Step quantity counter up or down
 * @param {string} itemId 
 * @param {number} delta 
 */
function stepQty(itemId, delta) {
  const input = document.getElementById(`qty-${itemId}`);
  if (!input) return;
  let val = parseInt(input.value, 10) || 1;
  val += delta;
  if (val < 1) val = 1;
  if (val > 20) val = 20; // safe upper limit
  input.value = val;
}

/**
 * Reset all active filters and search inputs
 */
function clearFilters() {
  currentCategory = 'All';
  searchQuery = '';
  const searchInput = document.getElementById('menu-search-input');
  if (searchInput) searchInput.value = '';
  renderCategoryPills();
  renderMenu();
}

/**
 * Add specified item and quantity to LocalStorage cart
 * @param {string} itemId 
 */
function addToCart(itemId) {
  const menu = getMenu();
  const item = menu.find(i => i.id === itemId);

  if (!item) {
    showToast('Item not found in menu!', 'danger');
    return;
  }

  if (item.available === false) {
    showToast('Sorry, this item is currently Out of Stock!', 'warning');
    return;
  }

  const qtyInput = document.getElementById(`qty-${itemId}`);
  const quantity = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;

  let cart = getCart();
  const existingIndex = cart.findIndex(c => c.id === item.id);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      quantity: quantity,
      image: item.image
    });
  }

  saveCart(cart);
  showToast(`Added ${quantity} × ${item.name} to cart!`, 'success');

  // Reset quantity input back to 1
  if (qtyInput) qtyInput.value = 1;
}
