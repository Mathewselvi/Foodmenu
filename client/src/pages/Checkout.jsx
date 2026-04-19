import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import API_URL from '../api';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const [guestName, setGuestName] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    useEffect(() => {
        window.scrollTo(0, 0);
        if (cartItems.length === 0 && !orderSuccess) {
            navigate('/');
        }
    }, [cartItems, navigate, orderSuccess]);

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        setIsPlacingOrder(true);

        const orderData = {
            guestName,
            items: cartItems.map(item => ({
                name: item.name,
                qty: item.qty,
                price: item.price
            })),
            totalAmount: cartTotal
        };

        try {
            await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            setIsPlacingOrder(false);
            setOrderSuccess(true);
            clearCart();

            // Redirect back to home after 3 seconds
            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (error) {
            console.error('Failed to place order:', error);
            setIsPlacingOrder(false);
            showNotification('Failed to place order. Please check your connection.', 'error');
        }
    };

    if (orderSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center animate-fade-in-up">
                <CheckCircle size={100} className="text-green-500 mb-6 animate-bounce" />
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Order Placed Successfully!</h1>
                <p className="text-lg text-gray-500 mb-8">Your food is being prepared and will be delivered shortly.</p>
                <div className="text-sm text-gray-400">Redirecting to menu...</div>
            </div>
        );
    }

    if (cartItems.length === 0) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 min-h-[80vh]">
            <div className="mb-6">
                <Link to="/" className="inline-flex items-center gap-2 text-green-700 font-medium hover:underline">
                    <ArrowLeft size={18} /> Back to Menu
                </Link>
            </div>
            
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Checkout Survey</h1>
            
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-10">
                
                {/* Left side: Item review */}
                <div className="flex-1">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">Your Items</h2>
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <div key={item._id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                <div>
                                    <h4 className="font-bold text-gray-800">{item.name}</h4>
                                    <p className="text-sm text-gray-500">
                                        ₹{item.price} x {item.qty}
                                    </p>
                                </div>
                                <span className="font-bold text-green-700">₹{item.price * item.qty}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-bold text-gray-700">Subtotal</span>
                            <span className="font-black text-gray-900 text-2xl">₹{cartTotal}</span>
                        </div>
                    </div>
                </div>

                {/* Right side: Form & Checkout */}
                <div className="md:w-[350px] bg-green-50/50 p-6 rounded-xl border border-green-100 h-fit">
                    <h2 className="text-xl font-bold mb-6 text-gray-800">Delivery Details</h2>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Guest Name</label>
                        <input 
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="e.g., John Doe"
                            className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                            disabled={isPlacingOrder}
                        />
                    </div>
                    
                    <button 
                        onClick={handleCheckout}
                        disabled={isPlacingOrder}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-lg shadow-green-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <Send size={20} className={isPlacingOrder ? 'animate-pulse' : ''} />
                        {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
