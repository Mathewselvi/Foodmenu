import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Home, ScrollText, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, grandTotal, itemsCount } = location.state || {};

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!orderId) {
            navigate('/');
        }
    }, [orderId, navigate]);

    if (!orderId) return null;

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-background">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white max-w-md w-full rounded-[32px] shadow-sm border border-gray-100 p-8 text-center relative overflow-hidden"
            >
                {/* Decorative confetti/dots could go here */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>

                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, duration: 0.6, delay: 0.2 }}
                    className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 relative"
                >
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                        <Check size={32} strokeWidth={3} className="text-white" />
                    </div>
                    {/* Confetti particles */}
                    <motion.div animate={{ y: -10, opacity: 0 }} transition={{ duration: 1, repeat: Infinity }} className="absolute top-0 left-0 w-2 h-2 bg-yellow-400 rounded-full"></motion.div>
                    <motion.div animate={{ x: 20, y: -20, opacity: 0 }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="absolute top-4 right-0 w-2 h-2 bg-blue-400 rounded-full"></motion.div>
                    <motion.div animate={{ x: -20, y: -10, opacity: 0 }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="absolute bottom-4 left-0 w-2 h-2 bg-red-400 rounded-full"></motion.div>
                </motion.div>

                <h1 className="text-2xl font-extrabold text-text-primary mb-2">Thank you, Order Placed! 🎉</h1>
                <p className="text-text-secondary text-sm mb-8">
                    Your order has been sent to the kitchen via WhatsApp successfully.
                </p>

                <div className="bg-gray-50 rounded-[20px] p-5 mb-8 text-left space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-text-secondary text-sm font-medium">Order ID</span>
                        <span className="text-text-primary font-bold">{orderId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-text-secondary text-sm font-medium">Items</span>
                        <span className="text-text-primary font-bold">{itemsCount}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                        <span className="text-text-secondary text-sm font-medium">Total Amount</span>
                        <span className="text-text-primary font-bold text-lg">₹{grandTotal}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <Link 
                        to="/my-orders"
                        className="w-full bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-light transition-colors shadow-md"
                    >
                        <ScrollText size={18} />
                        Track Order
                    </Link>
                    <Link 
                        to="/"
                        className="w-full bg-white border-2 border-gray-100 text-text-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                        <Home size={18} />
                        Back to Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderSuccess;
