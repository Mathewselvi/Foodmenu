import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { totalItems, setIsCartOpen } = useCart();

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-green-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-black text-green-800 tracking-tight flex items-center">
                           <span className="text-green-700">Food</span>
                           <span className="text-gray-800">Menu</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link 
                            to="/orders" 
                            className="text-gray-600 font-bold hover:text-green-700 bg-gray-50 border border-gray-100 hover:bg-gray-100 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-full transition-all"
                        >
                            Orders
                        </Link>
                        <Link 
                            to="/admin" 
                            className="text-gray-600 font-bold hover:text-green-700 bg-gray-50 border border-gray-100 hover:bg-gray-100 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-full transition-all"
                        >
                            Admin
                        </Link>
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative bg-green-50 hover:bg-green-100 p-2 rounded-full transition-colors duration-200 focus:outline-none"
                            aria-label="Cart"
                        >
                            <ShoppingBag className="h-6 w-6 text-green-700" />
                            {totalItems > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-green-600 rounded-full">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
