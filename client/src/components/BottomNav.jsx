import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Grid, Tag, ScrollText, User, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const BottomNav = () => {
  const location = useLocation();
  const { totalItems, cartTotal, setIsCartOpen } = useCart();

  // Don't show bottom nav on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Categories', path: '/#categories', icon: Grid },
    { name: 'Offers', path: '/#offers', icon: Tag },
    { name: 'Orders', path: '/my-orders', icon: ScrollText },
    { name: 'Admin', path: '/admin', icon: User },
  ];

  return (
    <>
      {/* Floating Cart Bar (Visible when items are in cart) */}
      {totalItems > 0 && (
        <div className="fixed bottom-16 left-4 right-4 z-40 md:hidden animate-fade-in-up">
            <button 
                onClick={() => setIsCartOpen(true)}
                className="w-full bg-primary text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-between hover:bg-primary-light transition-all active:scale-[0.98]"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl">
                        <ShoppingBag size={20} className="text-white" />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-medium text-white/80">{totalItems} ITEM{totalItems > 1 ? 'S' : ''}</span>
                        <span className="font-bold text-sm leading-tight">₹{cartTotal}</span>
                    </div>
                </div>
                <div className="font-bold flex items-center gap-1 text-[13px] uppercase tracking-wider">
                    View Cart <span className="text-xl leading-none">&rsaquo;</span>
                </div>
            </button>
        </div>
      )}

      {/* Main Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-40 md:hidden">
        <div className="flex justify-between items-center h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Simple active check. If path is '/', we want strict match unless it has a hash.
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive: routerIsActive }) => 
                  `flex flex-col items-center justify-center w-16 gap-1 transition-colors duration-200 ${
                    isActive || routerIsActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                  }`
                }
              >
                <Icon size={22} className={isActive ? 'fill-primary/10' : ''} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : ''}`}>
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default BottomNav;
