import { useCart } from '../context/CartContext';
import { X, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import CartItem from './CartItem';

const CartDrawer = () => {
    const { isCartOpen, setIsCartOpen, cartItems, cartTotal } = useCart();

    if (!isCartOpen) return null;

    return (
        <>
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
                onClick={() => setIsCartOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-green-50/50">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                        <ShoppingBag className="text-green-600" /> My Order
                    </h2>
                    <button 
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 bg-white rounded-full text-gray-500 hover:text-red-500 shadow-sm transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-400">
                            <ShoppingBag size={64} className="text-gray-200" />
                            <p className="text-lg">Your cart is empty.</p>
                            <button 
                                onClick={() => setIsCartOpen(false)}
                                className="text-green-600 font-semibold hover:underline"
                            >
                                Browse Menu
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {cartItems.map((item) => (
                                <CartItem key={item._id} item={item} />
                            ))}
                        </div>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="border-t border-gray-100 bg-white p-6 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-500 font-medium">Total Amount</span>
                            <span className="text-2xl font-black text-gray-900">₹{cartTotal}</span>
                        </div>
                        
                        <Link 
                            to="/checkout"
                            onClick={() => setIsCartOpen(false)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-lg shadow-green-600/30"
                        >
                            <ShoppingBag size={20} />
                            Proceed to Checkout
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
