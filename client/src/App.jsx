import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import { CartProvider } from './context/CartContext';

import { NotificationProvider } from './context/NotificationContext';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <NotificationProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <div className="font-sans bg-gray-50 min-h-screen">
            <Navbar />
            <CartDrawer />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </NotificationProvider>
  );
}

export default App;
