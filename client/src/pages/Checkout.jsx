import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Info, Edit2, ShieldCheck, QrCode, Smartphone, ChevronRight } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useRestaurant } from '../context/RestaurantContext';
import API_URL from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const [guestName, setGuestName] = useState('');
    const [email, setEmail] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState(1); // 1 = Form, 2 = Payment, 3 = Success
    const [finalAmount, setFinalAmount] = useState(0);
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { selectedRestaurant } = useRestaurant();

    // Calculate dynamic service charge
    const serviceCharge = selectedRestaurant 
        ? (selectedRestaurant.serviceChargeEnabled !== false ? (selectedRestaurant.serviceChargeAmount ?? 500) : 0)
        : 500;

    const grandTotal = cartTotal + serviceCharge;

    useEffect(() => {
        window.scrollTo(0, 0);
        if (cartItems.length === 0 && checkoutStep !== 3) {
            navigate('/');
        }
    }, [cartItems, navigate, checkoutStep]);

    const isFormValid = guestName.trim() !== '' && email.trim() !== '' && email.includes('@');

    const handleProceedToPayment = () => {
        if (!isFormValid) return;
        setCheckoutStep(2);
        window.scrollTo(0, 0);
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
            totalAmount: grandTotal,
            restaurant: selectedRestaurant?._id,
            serviceCharge: serviceCharge
        };

        try {
            await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            setIsPlacingOrder(false);
            setFinalAmount(grandTotal);
            setCheckoutStep(3);
            clearCart();
            window.scrollTo(0, 0);

        } catch (error) {
            console.error('Failed to place order:', error);
            setIsPlacingOrder(false);
            showNotification('Failed to place order. Please check your connection.', 'error');
        }
    };

    // Page Transition Variants
    const pageVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
    };

    if (cartItems.length === 0 && checkoutStep !== 3) return null;

    return (
        <div className="bg-gray-50 min-h-screen pb-24 font-sans">
            {/* Header & Progress Indicator */}
            {checkoutStep !== 3 && (
                <div className="bg-white sticky top-0 z-30 border-b border-gray-100 shadow-sm">
                    <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center">
                            <Link to="/" className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors mr-2">
                                <ArrowLeft size={24} />
                            </Link>
                            <h1 className="text-xl font-black text-gray-900 tracking-tight">Checkout</h1>
                        </div>
                        
                        {/* Progress Tracker */}
                        <div className="flex items-center gap-2 sm:gap-4 text-xs font-bold uppercase tracking-wider">
                            <div className={`flex items-center gap-1.5 ${checkoutStep >= 1 ? 'text-primary' : 'text-gray-300'}`}>
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checkoutStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</span>
                                Details
                            </div>
                            <div className={`w-8 h-[2px] rounded-full ${checkoutStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                            <div className={`flex items-center gap-1.5 ${checkoutStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checkoutStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
                                Payment
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                
                {/* STEP 1: GUEST DETAILS */}
                {checkoutStep === 1 && (
                    <motion.div 
                        key="step1"
                        variants={pageVariants}
                        initial="initial" animate="animate" exit="exit"
                        className="max-w-3xl mx-auto p-4 space-y-6 mt-4"
                    >
                        {/* Guest Details Section */}
                        <div className="bg-white p-5 md:p-8 rounded-[24px] shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10"></div>
                            
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Guest Information</h2>
                                <Edit2 size={18} className="text-primary" />
                            </div>
                            
                            <div className="space-y-5">
                                <div className="relative">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Full Name</label>
                                    <input 
                                        type="text"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        placeholder="e.g. John Doe"
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                                <div className="relative">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Email Address</label>
                                    <input 
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white p-5 md:p-8 rounded-[24px] shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                            <div className="space-y-4 mb-6">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-gray-100 text-gray-700 font-bold w-6 h-6 rounded-md flex items-center justify-center text-xs">{item.qty}x</span>
                                            <span className="font-medium text-gray-800 group-hover:text-primary transition-colors">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">₹{item.price * item.qty}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="pt-5 border-t border-dashed border-gray-200 space-y-3 mb-6">
                                <div className="flex justify-between items-center text-gray-500 text-sm">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">₹{cartTotal}</span>
                                </div>
                                {serviceCharge > 0 && (
                                    <div className="flex justify-between items-center text-gray-500 text-sm">
                                        <span>Room Service Fee</span>
                                        <span className="font-medium text-gray-900">₹{serviceCharge}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-between items-center pt-5 border-t border-gray-100 bg-gray-50/50 -mx-6 -mb-6 p-6 rounded-b-[24px]">
                                <span className="font-bold text-gray-600 uppercase tracking-wider text-sm">To Pay</span>
                                <span className="font-black text-primary text-2xl sm:text-3xl">₹{grandTotal}</span>
                            </div>
                        </div>

                        {/* Important Notice */}
                        <div className="bg-blue-50 p-5 rounded-[20px] flex gap-4 items-start border border-blue-100">
                            <div className="bg-blue-100 text-blue-600 p-2 rounded-full shrink-0">
                                <Info size={20} />
                            </div>
                            <p className="text-sm text-blue-900 leading-relaxed font-medium">
                                Please ensure your Email Address is correct as your final receipt will be sent there. Orders cannot be cancelled once placed.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: PAYMENT */}
                {checkoutStep === 2 && (
                    <motion.div 
                        key="step2"
                        variants={pageVariants}
                        initial="initial" animate="animate" exit="exit"
                        className="max-w-lg mx-auto p-4 space-y-6 mt-4"
                    >
                        <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
                            {/* Decorative background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
                            
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <ShieldCheck className="text-primary w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Secure Payment</h2>
                                <p className="text-gray-500 text-sm mt-2 font-medium">Scan to pay securely via UPI</p>
                            </div>
                            
                            {/* QR Code Container */}
                            <div className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200 mb-8 flex flex-col items-center justify-center group relative overflow-hidden transition-all hover:border-primary/50">
                                {/* Scanner Line Animation */}
                                <div className="absolute inset-x-0 top-0 h-1 bg-primary/50 shadow-[0_0_15px_rgba(22,163,74,0.5)] z-20 hidden group-hover:block animate-scan"></div>
                                
                                <img src="/qr.jpeg" alt="GPay QR Code" className="w-40 h-40 sm:w-48 sm:h-48 object-contain rounded-xl mix-blend-multiply" onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = "https://via.placeholder.com/200?text=QR+Code";
                                }} />
                                <div className="mt-4 flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                                    <QrCode size={16} className="text-gray-400" />
                                    <span className="text-xs font-bold text-gray-700 tracking-widest uppercase">Pay ₹{grandTotal}</span>
                                </div>
                            </div>
                            
                            {/* Alternate Payment */}
                            <div className="flex items-center justify-center gap-4 mb-8">
                                <div className="h-[1px] flex-1 bg-gray-100"></div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Or UPI Number</span>
                                <div className="h-[1px] flex-1 bg-gray-100"></div>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="text-gray-400" size={24} />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">GPay / PhonePe</p>
                                        <p className="text-lg font-black text-gray-900 tracking-wide">+91 9633035175</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <button 
                                onClick={() => setCheckoutStep(1)}
                                disabled={isPlacingOrder}
                                className="sm:w-1/3 bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 font-bold py-4 rounded-2xl transition-all active:scale-[0.98]"
                            >
                                Back
                            </button>
                            <button 
                                onClick={handleCheckout}
                                disabled={isPlacingOrder}
                                className="sm:w-2/3 bg-primary hover:bg-primary-light text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-xl shadow-primary/30"
                            >
                                {isPlacingOrder ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>I have paid ₹{grandTotal} <ChevronRight size={20} /></>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: SUCCESS */}
                {checkoutStep === 3 && (
                    <motion.div 
                        key="step3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, type: 'spring' } }}
                        className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-white absolute inset-0 z-50"
                    >
                        {/* Confetti-like elements (CSS simulated) */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-[20%] left-[20%] w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                            <div className="absolute top-[30%] right-[25%] w-4 h-4 bg-blue-400 rounded-sm rotate-45 animate-pulse"></div>
                            <div className="absolute bottom-[40%] left-[30%] w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                            <div className="absolute top-[10%] right-[40%] w-3 h-3 bg-green-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                        </div>

                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(34,197,94,0.3)]"
                        >
                            <CheckCircle size={48} className="text-green-500" />
                        </motion.div>
                        
                        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Order Placed!</h1>
                        <p className="text-lg text-gray-500 mb-10 max-w-sm font-medium">
                            Your payment is confirmed and the kitchen has received your order. We'll deliver it shortly!
                        </p>
                        
                        <div className="w-full max-w-sm bg-gray-50 p-6 rounded-[24px] border border-gray-100 mb-10 text-left relative overflow-hidden">
                            <div className="absolute -left-3 top-1/2 w-6 h-6 bg-white rounded-full -translate-y-1/2 border-r border-gray-100"></div>
                            <div className="absolute -right-3 top-1/2 w-6 h-6 bg-white rounded-full -translate-y-1/2 border-l border-gray-100"></div>
                            <div className="border-b-2 border-dashed border-gray-200 absolute top-1/2 left-4 right-4 -translate-y-1/2"></div>
                            
                            <div className="mb-8">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Amount Paid</p>
                                <p className="text-3xl font-black text-gray-900">₹{finalAmount}</p>
                            </div>
                            <div className="mt-8">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sent to</p>
                                <p className="text-sm font-bold text-gray-700">{email}</p>
                            </div>
                        </div>

                        <Link to="/" className="w-full max-w-sm bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl active:scale-[0.98]">
                            Back to Home
                        </Link>
                    </motion.div>
                )}

            </AnimatePresence>

            {/* Bottom Sticky Checkout Bar for Step 1 */}
            {checkoutStep === 1 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white p-4 pb-6 sm:pb-4 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.15)] z-40 border-t border-gray-100">
                    <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Total to Pay</span>
                            <span className="font-black text-2xl text-gray-900 leading-none mt-1">₹{grandTotal}</span>
                        </div>
                        
                        <button 
                            onClick={handleProceedToPayment}
                            disabled={!isFormValid}
                            className={`flex-1 font-bold py-4 px-6 rounded-[20px] flex items-center justify-center gap-2 transition-all shadow-lg ${
                                isFormValid
                                    ? 'bg-primary hover:bg-primary-light text-white active:scale-[0.98] shadow-primary/25'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            }`}
                        >
                            Proceed to Payment <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
