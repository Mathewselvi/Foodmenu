import { useCart } from '../context/CartContext';
import { X, ArrowLeft, Percent, FileText, Plus } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { Link, useNavigate } from 'react-router-dom';
import CartItem from './CartItem';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const CartDrawer = () => {
    const { isCartOpen, setIsCartOpen, cartItems, cartTotal } = useCart();
    const [couponCode, setCouponCode] = useState('');
    const navigate = useNavigate();

    const { selectedRestaurant } = useRestaurant();

    // Actual charges based on restaurant settings
    const serviceFee = (selectedRestaurant?.serviceChargeEnabled !== false && cartTotal > 0) 
        ? (selectedRestaurant?.serviceChargeAmount || 500) 
        : 0;
    const grandTotal = cartTotal + serviceFee;

    const handleCheckoutClick = () => {
        setIsCartOpen(false);
        navigate('/checkout');
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                        onClick={() => setIsCartOpen(false)}
                    />
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:max-w-md bg-background shadow-2xl z-[60] flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-4 py-4 border-b border-gray-100 flex items-center bg-white sticky top-0 z-10 shadow-sm">
                            <button 
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 text-text-primary hover:bg-gray-100 rounded-full mr-3 transition-colors"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h2 className="text-[18px] font-bold text-text-primary leading-tight">Cart</h2>
                                <p className="text-[12px] text-text-secondary font-medium">
                                    {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto bg-gray-50 pb-32 custom-scrollbar">
                            {cartItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-400 p-6 bg-white">
                                    <div className="w-48 h-48 bg-[url('https://cdn-icons-png.flaticon.com/512/11329/11329060.png')] bg-contain bg-no-repeat bg-center opacity-50 mb-4"></div>
                                    <h3 className="text-xl font-bold text-text-primary">Your cart is empty</h3>
                                    <p className="text-text-secondary">Looks like you haven't added anything yet.</p>
                                    <button 
                                        onClick={() => setIsCartOpen(false)}
                                        className="mt-4 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-sm"
                                    >
                                        Browse Menu
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 space-y-4">
                                    {/* Items List */}
                                    <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xl font-bold">
                                                F
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-text-primary text-[15px]">Friends Hotel & Resort</h3>
                                                <p className="text-[12px] text-text-secondary">Delivery to your room</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            {cartItems.map((item) => (
                                                <CartItem key={item._id} item={item} />
                                            ))}
                                        </div>
                                        {/* Add More Items CTA */}
                                        <button 
                                            onClick={() => setIsCartOpen(false)}
                                            className="w-full mt-4 py-3 border-2 border-dashed border-primary/30 rounded-xl text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
                                        >
                                            <Plus size={18} /> Add more items
                                        </button>
                                    </div>

                                    {/* Offers Section */}
                                    <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
                                        <div className="bg-blue-50 p-2 rounded-full">
                                            <Percent size={20} className="text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-text-primary text-sm">Apply Coupon</h4>
                                            <p className="text-xs text-text-secondary">Avail exciting discounts</p>
                                        </div>
                                        <ChevronRightIcon />
                                    </div>

                                    {/* Bill Details */}
                                    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
                                        <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                                            <FileText size={18} /> Bill Details
                                        </h3>
                                        
                                        <div className="space-y-3 text-[13px]">
                                            <div className="flex justify-between text-text-secondary">
                                                <span>Item Total</span>
                                                <span className="font-medium text-text-primary">₹{cartTotal}</span>
                                            </div>
                                            <div className="flex justify-between text-text-secondary pb-3 border-b border-gray-100">
                                                <span>Service Fee | Room Service</span>
                                                <span className="font-medium text-text-primary">₹{serviceFee}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-text-primary text-[15px] pt-1">
                                                <span>To Pay</span>
                                                <span>₹{grandTotal}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Cancellation Policy */}
                                    <div className="bg-gray-100/50 rounded-[16px] p-4 text-[11px] text-text-secondary">
                                        <span className="font-bold text-text-primary">Review your order and address details to avoid cancellations.</span><br/>
                                        <span className="mt-1 block">Orders cannot be cancelled once accepted by the restaurant.</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sticky Bottom CTA */}
                        {cartItems.length > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-white p-4 pb-safe shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] rounded-t-[24px] border-t border-gray-100">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[18px] text-text-primary leading-tight">₹{grandTotal}</span>
                                        <span className="text-[12px] text-primary font-bold">TOTAL</span>
                                    </div>
                                    
                                    <button 
                                        onClick={handleCheckoutClick}
                                        className="flex-1 bg-primary hover:bg-primary-light text-white font-bold py-4 rounded-[16px] flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-primary/30"
                                    >
                                        Proceed to Checkout
                                        <ChevronRightIcon color="#fff" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Simple helper icon
const ChevronRightIcon = ({ color = "#6B7280" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
    </svg>
);

export default CartDrawer;
