import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import Orders from './pages/Orders';
import { CartProvider } from './context/CartContext';
import { RestaurantProvider } from './context/RestaurantContext';
import { NotificationProvider } from './context/NotificationContext';
import ScrollToTop from './components/ScrollToTop';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <NotificationProvider>
      <RestaurantProvider>
        <CartProvider>
        <Router>
          <ScrollToTop />
          <div className="font-sans bg-background min-h-screen pb-20 md:pb-0 text-text-primary">
            <Navbar />
            <CartDrawer />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin/*" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/orders" element={<AdminRoute><Orders /></AdminRoute>} />
            </Routes>
            <BottomNav />
          </div>
        </Router>
      </CartProvider>
      </RestaurantProvider>
    </NotificationProvider>
  );
}

export default App;
