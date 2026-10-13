# ☕ SMART CAFÉ – DIGI-MENU & AUTO BILLING MACHINE

> **College Mini Project – Web-Based Café Management System**  
> **Subtitle:** *“Order Smart. Eat Fresh. Pay Fast.”*  
> **Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+), LocalStorage  

---

## 📌 Project Overview

**Smart Café** is a modern, responsive web application and self-service café ordering kiosk. It simulates an in-café digital terminal where customers can browse an interactive digital menu, search and filter food items, customize order portions, auto-calculate bills with live 5% GST and dynamic 10% discount rules, simulate digital payments (Cash, UPI QR, Card), print official tax invoices, and track kitchen order preparation in real-time.

An integrated **Admin Dashboard** provides café managers with live sales KPIs, kitchen order progression controls, and full menu inventory management (CRUD).

---

## 📂 Project Folder Structure

```
College project/
├── index.html                  # Quick Launcher / Automatic Redirector
└── smart-cafe/
    ├── index.html              # Kiosk Landing / Welcome Screen
    ├── menu.html               # 24-Item Digital Menu with Search & Category Filters
    ├── cart.html               # Dynamic Shopping Cart with Real-time Auto-Calculation
    ├── checkout.html           # Customer Info Validation & Payment Simulation (Cash/UPI/Card)
    ├── bill.html               # Printable Digital Tax Invoice (window.print() ready)
    ├── orders.html             # Customer Order History & Live 5-Stage Kitchen Tracker
    ├── admin.html              # Manager Dashboard (KPIs, Order Pipeline, Menu CRUD)
    ├── about.html              # About System, Traditional vs Smart Comparison, Contact
    │
    ├── css/
    │   └── style.css           # Complete Café Theme, Grid/Flexbox, Kiosk UI & Print CSS
    │
    ├── js/
    │   ├── data.js             # 24 Menu Items Seed, Storage Keys, & Billing Formulas
    │   ├── common.js           # Navigation, Mobile Drawer, Cart Badges, & Toasts
    │   ├── menu.js             # Search, Filtering, Quantities, & Add-to-Cart
    │   ├── cart.js             # Cart Table, Item Deletions, & Dynamic Totals
    │   ├── checkout.js         # Form Validation, UPI QR Generation, & Order Generator
    │   ├── bill.js             # Invoice Populator & Print Layout Trigger
    │   ├── orders.js           # Customer Order List & Kitchen Progress Stepper
    │   └── admin.js            # PIN Auth (admin123), Analytics, Status Flow, & Menu CRUD
    │
    ├── images/
    │   ├── logo.svg            # Smart Café SVG Logo
    │   ├── qr-code.svg         # Simulated UPI QR Code
    │   ├── burger.svg          # Burger Graphic
    │   ├── pizza.svg           # Pizza Graphic
    │   ├── coffee.svg          # Coffee Graphic
    │   └── fries.svg           # French Fries Graphic
    │
    ├── README.md               # Quickstart & Execution Guide
    └── PROJECT_REPORT.md       # Complete College Viva Dossier (DFDs, ER, Flowcharts & Q&A)
```

---

## 🚀 How to Run the Project in Visual Studio Code

### Method 1: Using the "Live Server" Extension (Recommended)
1. Open **Visual Studio Code**.
2. Click **File → Open Folder...** and select `/Users/adityasingh/College project`.
3. In VS Code, install the **Live Server** extension by *Ritwick Dey* (from the Extensions marketplace `Ctrl+Shift+X` or `Cmd+Shift+X`).
4. In the Explorer pane, right-click on `index.html` (or `smart-cafe/index.html`).
5. Select **"Open with Live Server"**.
6. Your default web browser will automatically open:
   `http://127.0.0.1:5500/smart-cafe/index.html`

---

### Method 2: Direct Browser Opening (No Server Required)
Because Smart Café is written in pure, standards-compliant HTML5, CSS3, and Vanilla JavaScript, it requires **no backend installation or Node.js runtime**:
1. Open your file manager (Finder on macOS or Explorer on Windows).
2. Navigate to `/Users/adityasingh/College project/smart-cafe/`.
3. Double-click `index.html` to open it directly in Google Chrome, Microsoft Edge, Safari, or Firefox.

---

### Method 3: Using Python Built-in HTTP Server
If you prefer running a command line server:
```bash
# Navigate to the workspace directory
cd "/Users/adityasingh/College project"

# Start Python 3 HTTP Server
python3 -m http.server 8000
```
Then visit: `http://localhost:8000/smart-cafe/index.html`

---

## 🔑 Admin Credentials (For Demonstration)

- **Admin Portal URL:** `admin.html`
- **Manager PIN:** `admin123`

---

## 🎯 Final Demonstration Walkthrough for Viva

To showcase the complete flow during a viva examination:

1. **Home Screen (`index.html`)**:
   - Show the self-service kiosk welcome screen, logo, opening hours, and click **"Start Ordering"**.
2. **Digital Menu (`menu.html`)**:
   - Filter items by clicking category pills (e.g. *Beverages*, *Pizza*, *Fast Food*).
   - Type in the search box (e.g. *"Burger"* or *"Cold Coffee"*) to show real-time filtering.
   - Adjust quantities using the `+` / `−` steppers and click **"+ Add"**.
   - Notice the animated cart badge in the header update immediately.
3. **Shopping Cart (`cart.html`)**:
   - Observe the live breakdown: **Subtotal**, **GST (5%)**, **Discount (10% on ₹500+)**, and **Grand Total**.
   - Test the discount threshold: add items over ₹500 to observe the 10% discount banner trigger automatically.
   - Click **"Proceed to Checkout"**.
4. **Checkout & Payment Simulation (`checkout.html`)**:
   - Enter Customer Name, 10-digit Mobile Number, Table Number, and choose **Dine In** or **Take Away**.
   - Select payment: choose **UPI** to display the simulated QR code.
   - Click **"Place Order & Generate Bill"**.
5. **Confirmation & Bill (`bill.html`)**:
   - View the generated sequential order ID (e.g. `SC1001`), date, time, and tax invoice.
   - Click **"Print Bill"** to preview the clean, print-optimized receipt layout (`window.print()`).
6. **Order Tracking (`orders.html`)**:
   - Check the live 5-stage kitchen progress tracker.
7. **Admin Dashboard (`admin.html`)**:
   - Enter PIN `admin123`.
   - Inspect today's live KPI counters (Total Orders, Total Revenue, Items Sold, Pending Orders).
   - Advance the order status from `Pending` → `Accepted` → `Preparing` → `Ready` → `Completed`.
   - In the **Menu Management** tab, add a new dish, edit an existing price, or toggle an item to **Out of Stock**.
   - Switch back to `menu.html` to demonstrate that the out-of-stock item is disabled in real-time.
