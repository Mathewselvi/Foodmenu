# Resort Food Ordering System

A full-stack MERN application for Beyond Heaven Resort's food ordering. Built with React (Vite), Tailwind CSS, Node.js, Express, and MongoDB.

## Features
* Modern, responsive interface inspired by nature and resorts
* Browse menu items by categories
* Add items to cart with dynamic quantity updates
* **No Authentication:** Simple flow for hotel guests.
* **WhatsApp Checkout:** Sends a pre-compiled order to the resort's WhatsApp number.
* **Hidden Admin Dashboard:** Access `/admin` to add, edit, toggle availability, or delete items.

## Prerequisites
* Node.js (v18+)
* MongoDB installed locally or MongoDB Atlas URI

## Installation

### 1. Backend Setup
1. Open a terminal and navigate to the `server` folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and add your MongoDB connection string (or use the one provided, which points to localhost):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/resortFoodDB
   ```
4. Load the menu (the only menu this app serves):
   ```bash
   npm run menu:preview   # print the final price list, no database changes
   npm run seed:menu      # back up the DB to server/backups/, remove any other menus, load this one
   ```
   Prices live in `server/seedMenu.js` as the partner's printed-menu price plus a per-category markup
   (+0 Hot Beverages/Lime/Mojitos, +100 Al-Faham/Mandhi/Tandoor, +60 everything else).
5. Start the backend server:
   ```bash
   node index.js
   ```

### 2. Frontend Setup
1. Open a second terminal and navigate to the `client` folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Usage
1. Open `http://localhost:5173` to see the client app.
2. Open `http://localhost:5173/admin` to see the hidden admin dashboard.
3. Configure your actual WhatsApp number in `client/src/components/CartDrawer.jsx`.
