import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Send } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useRestaurant } from '../context/RestaurantContext';
import API_URL from '../api';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const [guestName, setGuestName] = useState('');
    const [email, setEmail] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState(1); // 1 = Form, 2 = Payment, 3 = Success
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { selectedRestaurant } = useRestaurant();

    useEffect(() => {
        window.scrollTo(0, 0);
        if (cartItems.length === 0 && checkoutStep !== 3) {
            navigate('/');
        }
    }, [cartItems, navigate, checkoutStep]);

    const handleProceedToPayment = () => {
        if (!isFormValid) return;
        setCheckoutStep(2);
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        setIsPlacingOrder(true);

        const orderData = {
            guestName,
            email,
            items: cartItems.map(item => ({
                name: item.name,
                qty: item.qty,
                price: item.price
            })),
            totalAmount: cartTotal + 500,
            restaurant: selectedRestaurant?._id
        };

        try {
            await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            setIsPlacingOrder(false);
            setCheckoutStep(3);
            clearCart();

        } catch (error) {
            console.error('Failed to place order:', error);
            setIsPlacingOrder(false);
            showNotification('Failed to place order. Please check your connection.', 'error');
        }
    };

    if (checkoutStep === 3) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center animate-fade-in-up">
                <CheckCircle size={100} className="text-green-500 mb-6 animate-bounce" />
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Order Placed Successfully!</h1>
                <p className="text-xl text-gray-700 mb-8 max-w-lg font-medium">
                    Your order will be delivered on time. Please wait for the confirmation email containing your final bill.
                </p>
                
                <div className="mt-6">
                    <Link to="/" className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg">
                        Return to Menu
                    </Link>
                </div>
            </div>
        );
    }

    if (checkoutStep === 2) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center animate-fade-in-up">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Complete Your Payment</h1>
                <p className="text-lg text-gray-600 mb-8 max-w-md">
                    Please scan the QR code below or use the Google Pay number to make your payment of <strong className="text-green-700 font-black text-xl">₹{cartTotal + 500}</strong>.
                </p>
                
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full mb-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Scan to Pay</h2>
                    <div className="bg-gray-100 w-full aspect-square rounded-xl flex items-center justify-center mb-6 overflow-hidden border border-gray-200">
                        <img src="/qr.jpeg" alt="GPay QR Code" className="w-full h-full object-cover" onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = "https://via.placeholder.com/300?text=Please+add+qr.jpeg+to+public+folder";
                        }} />
                    </div>
                    
                    <div className="border-t border-gray-100 pt-6">
                        <p className="text-sm text-gray-500 mb-1">Or pay via Google Pay / PhonePe</p>
                        <p className="text-2xl font-black text-green-700 tracking-wider">
                            +91 9633035175
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <button 
                        onClick={() => setCheckoutStep(1)}
                        disabled={isPlacingOrder}
                        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-bold py-4 rounded-xl transition-all"
                    >
                        Payment Not Done
                    </button>
                    <button 
                        onClick={handleCheckout}
                        disabled={isPlacingOrder}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-lg shadow-green-600/30"
                    >
                        {isPlacingOrder ? 'Processing...' : 'Payment Done'}
                    </button>
                </div>
            </div>
        );
    }

    const isFormValid = guestName.trim() !== '' && email.trim() !== '' && email.includes('@');

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
                    <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                        <div className="flex justify-between items-center text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-semibold text-gray-800">₹{cartTotal}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600 pb-2">
                            <span>Service Fee</span>
                            <span className="font-semibold text-gray-800">₹500</span>
                        </div>
                        <div className="flex justify-between items-center text-lg pt-3 border-t border-gray-100">
                            <span className="font-bold text-gray-700">Total</span>
                            <span className="font-black text-gray-900 text-2xl">₹{cartTotal + 500}</span>
                        </div>
                    </div>
                </div>

                {/* Right side: Form & Checkout */}
                <div className="md:w-[350px] bg-green-50/50 p-6 rounded-xl border border-green-100 h-fit">
                    <h2 className="text-xl font-bold mb-6 text-gray-800">Delivery Details</h2>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Guest Name <span className="text-red-500">*</span></label>
                        <input 
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="e.g., John Doe"
                            className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                            disabled={isPlacingOrder}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                            disabled={isPlacingOrder}
                        />
                    </div>
                    
                    {isFormValid ? (
                        <button 
                            onClick={handleProceedToPayment}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-lg shadow-green-600/30"
                        >
                            Proceed to Payment
                        </button>
                    ) : (
                        <div className="text-center p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-600 text-sm font-medium">
                            Please enter your Name and a valid Email Address to place your order.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Checkout;
