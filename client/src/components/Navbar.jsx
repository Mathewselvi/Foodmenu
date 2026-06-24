import { Bell, MapPin, ShoppingBag } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const location = useLocation();
    const { totalItems, setIsCartOpen } = useCart();

    if (
        location.pathname.startsWith('/admin') || 
        location.pathname.startsWith('/orders') ||
        location.pathname.startsWith('/checkout')
    ) {
        return null;
    }

    return (
        <nav className="bg-white sticky top-0 z-40 border-b border-gray-100 pb-2 pt-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-sm">
                            F
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-[16px] font-bold text-text-primary leading-tight mt-1">
                                Friends Hotel & Resort
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="/admin" className="hidden sm:flex items-center gap-2 text-[13px] font-bold text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors">
                            Admin Login
                        </a>
                        
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 rounded-full hover:bg-gray-50 transition-colors focus:outline-none hidden sm:block"
                        >
                            <ShoppingBag size={22} className="text-text-primary" />
                            {totalItems > 0 && (
                                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </button>

                        <button className="relative p-2 rounded-full hover:bg-gray-50 transition-colors focus:outline-none">
                            <Bell size={22} className="text-text-primary" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

