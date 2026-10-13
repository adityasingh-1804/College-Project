/**
 * SMART CAFÉ - DATA LAYER & LOCALSTORAGE MANAGEMENT
 * 
 * Manages default menu catalogue, shopping cart, orders, and
 * standard billing calculations for the entire café system.
 */

// Storage Keys Constants
const STORAGE_KEYS = {
  MENU: 'smartcafe_menu_items',
  CART: 'smartcafe_cart',
  ORDERS: 'smartcafe_orders',
  LAST_ORDER_ID: 'smartcafe_last_order_id',
  ADMIN_AUTH: 'smartcafe_admin_logged_in'
};

// Initial Default Menu Items (24 items across 5 categories as specified)
const DEFAULT_MENU_ITEMS = [
  // ☕ BEVERAGES
  {
    id: 'bev_1',
    name: 'Cappuccino',
    category: 'Beverages',
    price: 120,
    description: 'Freshly ground rich espresso topped with foamy steamed milk and a dusting of cocoa.',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'bev_2',
    name: 'Cold Coffee',
    category: 'Beverages',
    price: 100,
    description: 'Thick, chilled brew blended with rich creamy milk, vanilla ice cream, and chocolate syrup.',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'bev_3',
    name: 'Masala Tea',
    category: 'Beverages',
    price: 50,
    description: 'Traditional spiced Indian chai brewed with cardamom, ginger, cloves, and fresh milk.',
    image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'bev_4',
    name: 'Green Tea',
    category: 'Beverages',
    price: 60,
    description: 'Antioxidant-rich organic whole-leaf green tea with subtle floral and grassy undertones.',
    image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'bev_5',
    name: 'Hot Chocolate',
    category: 'Beverages',
    price: 130,
    description: 'Decadent melted Belgian chocolate whisked with warm milk, topped with mini marshmallows.',
    image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'bev_6',
    name: 'Fresh Lime Soda',
    category: 'Beverages',
    price: 80,
    description: 'Refreshing fizzy soda infused with freshly squeezed key limes, mint, and black salt.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    available: true
  },

  // 🍔 FAST FOOD
  {
    id: 'ff_1',
    name: 'Veg Burger',
    category: 'Fast Food',
    price: 120,
    description: 'Crispy spiced vegetable patty layered with ripe tomato, fresh lettuce, and herb mayo in a brioche bun.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'ff_2',
    name: 'Cheese Burger',
    category: 'Fast Food',
    price: 150,
    description: 'Double melted cheddar draped over a gourmet savory patty with caramelized onions and pickled gherkins.',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'ff_3',
    name: 'Veg Sandwich',
    category: 'Fast Food',
    price: 100,
    description: 'Triple-decker sandwich loaded with crunchy cucumbers, beetroot, cheese slice, and tangy mint chutney.',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'ff_4',
    name: 'Grilled Sandwich',
    category: 'Fast Food',
    price: 140,
    description: 'Golden grilled to perfection, stuffed with bell peppers, sweet corn, melted mozzarella, and oregano.',
    image: 'https://images.unsplash.com/photo-1554433607-66b5efe9d304?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'ff_5',
    name: 'French Fries',
    category: 'Fast Food',
    price: 90,
    description: 'Crispy golden potato fingers, lightly salted, served piping hot with garlic dip and tomato ketchup.',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'ff_6',
    name: 'Peri Peri Fries',
    category: 'Fast Food',
    price: 110,
    description: 'Crunchy potato fries tossed in a fiery and tangy African peri-peri herb blend.',
    image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=600&auto=format&fit=crop&q=80',
    available: true
  },

  // 🍕 PIZZA
  {
    id: 'piz_1',
    name: 'Margherita Pizza',
    category: 'Pizza',
    price: 180,
    description: 'Classic Napoli crust topped with San Marzano style tomato sauce, fresh basil leaves, and stretchy mozzarella.',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'piz_2',
    name: 'Farmhouse Pizza',
    category: 'Pizza',
    price: 250,
    description: 'Overloaded with fresh green bell peppers, red onions, juicy mushrooms, and sweet American golden corn.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'piz_3',
    name: 'Paneer Tikka Pizza',
    category: 'Pizza',
    price: 280,
    description: 'Tandoori-marinated cottage cheese cubes paired with charred capsicum, spicy onion rings, and cilantro.',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'piz_4',
    name: 'Cheese Burst Pizza',
    category: 'Pizza',
    price: 300,
    description: 'Molten liquid cheese inside the double crust, topped with four artisan cheeses and Italian seasonings.',
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&auto=format&fit=crop&q=80',
    available: true
  },

  // 🍝 MAIN COURSE
  {
    id: 'mc_1',
    name: 'White Sauce Pasta',
    category: 'Main Course',
    price: 180,
    description: 'Al dente penne folded in a velvety, rich bechamel cream sauce with sauteed broccoli, bell peppers, and parmesan.',
    image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'mc_2',
    name: 'Red Sauce Pasta',
    category: 'Main Course',
    price: 170,
    description: 'Penne simmered in a zesty, garlic-infused arrabbiata plum tomato sauce with fresh basil and black olives.',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'mc_3',
    name: 'Paneer Wrap',
    category: 'Main Course',
    price: 150,
    description: 'Soft whole wheat tortilla filled with succulent tandoori paneer, pickled onions, and minty yogurt dressing.',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'mc_4',
    name: 'Veg Noodles',
    category: 'Main Course',
    price: 140,
    description: 'Wok-tossed Hakka noodles with julienned cabbage, carrots, bell peppers, spring onions, and savory soy.',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80',
    available: true
  },

  // 🍰 DESSERTS
  {
    id: 'des_1',
    name: 'Chocolate Cake',
    category: 'Desserts',
    price: 120,
    description: 'Moist multi-layered dark chocolate truffle sponge coated with smooth chocolate ganache.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'des_2',
    name: 'Brownie',
    category: 'Desserts',
    price: 100,
    description: 'Warm, fudgy chocolate walnut brownie with a crackly top, served with chocolate drizzle.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'des_3',
    name: 'Ice Cream',
    category: 'Desserts',
    price: 80,
    description: 'Double scoop of artisanal churned ice cream (Choice of Bourbon Vanilla, Belgian Chocolate, or Alphonso Mango).',
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'des_4',
    name: 'Chocolate Shake',
    category: 'Desserts',
    price: 140,
    description: 'Luscious, thick shake blended with milk chocolate fudge, ice cream, whipped cream, and chocolate curls.',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
    available: true
  }
];

/**
 * Initialize Menu in LocalStorage if not already present.
 */
function initMenuStorage() {
  const existing = localStorage.getItem(STORAGE_KEYS.MENU);
  if (!existing || JSON.parse(existing).length === 0) {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_MENU_ITEMS));
  }
}

/**
 * Retrieve all menu items from LocalStorage
 * @returns {Array} List of menu objects
 */
function getMenu() {
  initMenuStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MENU)) || [];
  } catch (e) {
    console.error('Failed to parse menu from LocalStorage', e);
    return DEFAULT_MENU_ITEMS;
  }
}

/**
 * Save updated menu array to LocalStorage
 * @param {Array} menuArray 
 */
function saveMenu(menuArray) {
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuArray));
  window.dispatchEvent(new Event('smartcafe_menu_updated'));
}

/**
 * Reset menu back to initial 24 factory items
 */
function resetDefaultMenu() {
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_MENU_ITEMS));
  window.dispatchEvent(new Event('smartcafe_menu_updated'));
}

/**
 * Get current shopping cart items from LocalStorage
 * @returns {Array} Cart items array
 */
function getCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read cart', e);
    return [];
  }
}

/**
 * Save shopping cart items to LocalStorage and trigger update event
 * @param {Array} cartArray 
 */
function saveCart(cartArray) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartArray));
  window.dispatchEvent(new Event('smartcafe_cart_updated'));
}

/**
 * Clear the entire shopping cart
 */
function clearCart() {
  localStorage.removeItem(STORAGE_KEYS.CART);
  window.dispatchEvent(new Event('smartcafe_cart_updated'));
}

/**
 * Get Total Cart Item Count (sum of quantities)
 * @returns {number}
 */
function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
}

/**
 * Retrieve all recorded orders from LocalStorage
 * @returns {Array} List of order objects
 */
function getOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load orders', e);
    return [];
  }
}

/**
 * Save updated orders list to LocalStorage
 * @param {Array} ordersArray 
 */
function saveOrders(ordersArray) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(ordersArray));
  window.dispatchEvent(new Event('smartcafe_orders_updated'));
}

/**
 * Generate sequential unique Order ID: SC1001, SC1002, etc.
 * @returns {string} e.g. "SC1001"
 */
function generateNextOrderId() {
  let lastId = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_ORDER_ID), 10);
  if (isNaN(lastId) || lastId < 1000) {
    lastId = 1000;
  }
  const nextId = lastId + 1;
  localStorage.setItem(STORAGE_KEYS.LAST_ORDER_ID, nextId.toString());
  return `SC${nextId}`;
}

/**
 * Standard dynamic billing calculation based on cart items.
 * 
 * Rules:
 * 1. Subtotal = Sum of (Item Price * Quantity)
 * 2. GST = 5% of Subtotal (CGST 2.5% + SGST 2.5%)
 * 3. Discount = 10% of Subtotal if Subtotal >= ₹500, otherwise ₹0.
 * 4. Grand Total = Subtotal + GST - Discount.
 * 
 * @param {Array} cartItems 
 * @returns {Object} { subtotal, gstRate, gstAmount, discountRate, discountAmount, grandTotal, itemCount }
 */
function calculateBill(cartItems) {
  const items = cartItems || getCart();
  
  let subtotal = 0;
  let itemCount = 0;

  items.forEach(item => {
    const qty = parseInt(item.quantity, 10) || 1;
    const price = parseFloat(item.price) || 0;
    subtotal += price * qty;
    itemCount += qty;
  });

  // GST Calculation (5%)
  const gstRate = 5;
  const gstAmount = parseFloat(((subtotal * gstRate) / 100).toFixed(2));

  // Discount Calculation (10% if subtotal >= 500)
  let discountRate = 0;
  let discountAmount = 0;
  const discountThreshold = 500;

  if (subtotal >= discountThreshold) {
    discountRate = 10;
    discountAmount = parseFloat(((subtotal * discountRate) / 100).toFixed(2));
  }

  // Grand Total Calculation
  const grandTotal = parseFloat((subtotal + gstAmount - discountAmount).toFixed(2));

  // Amount remaining to unlock discount
  const remainingForDiscount = subtotal < discountThreshold ? parseFloat((discountThreshold - subtotal).toFixed(2)) : 0;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    gstRate,
    gstAmount,
    discountRate,
    discountAmount,
    grandTotal,
    itemCount,
    discountThreshold,
    remainingForDiscount,
    hasDiscount: discountAmount > 0
  };
}

// Ensure Menu is seeded on script evaluation
initMenuStorage();
