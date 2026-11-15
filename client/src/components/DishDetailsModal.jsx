import { X, Minus, Plus, Info, Leaf, Drumstick } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryLabel, getProductImage, isSeasonal } from '../menuMeta';

const DishDetailsModal = ({ isOpen, onClose, product }) => {
    const { addToCart, cartItems, updateQty, removeFromCart } = useCart();
    
    if (!product) return null;

    const cartItem = cartItems.find(item => item._id === product._id);
    const isVeg = product?.isVeg;
    const seasonal = isSeasonal(product);
    const imageUrl = getProductImage(product, 900, 600);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
                    onClick={handleBackdropClick}
                >
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                        className="bg-white w-full max-w-lg sm:rounded-[32px] rounded-t-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Image */}
                        <div className="relative h-64 sm:h-72 w-full bg-gray-100 shrink-0">
                            <img 
                                src={imageUrl} 
                                alt={product?.name || 'Dish'} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';
                                }}
                            />
                            <button 
                                type="button"
                                onClick={onClose}
                                aria-label="Close"
                                className="absolute top-4 right-4 bg-white/80 p-2 rounded-full text-gray-800 active:bg-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                            {(isVeg === true || isVeg === false) && (
                                <div className="absolute -bottom-5 right-6 bg-white rounded-full p-1.5 shadow-lg" title={isVeg ? 'Vegetarian' : 'Non-vegetarian'}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isVeg ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {isVeg ? <Leaf size={14} /> : <Drumstick size={14} />}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content Scrollable Area */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-2xl font-bold text-text-primary pr-4">{product?.name || 'Item'}</h2>
                            </div>
                            
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-gray-100 text-text-secondary px-2.5 py-1 rounded-lg text-sm font-medium">
                                    {getCategoryLabel(product?.category)}
                                </span>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                                    <Info size={18} className="text-gray-400" />
                                    Description
                                </h3>
                                <p className="text-text-secondary leading-relaxed">
                                    {seasonal
                                        ? 'This dish depends on the day\'s catch, so its price varies by season. Please ask our staff for today\'s price.'
                                        : product?.description || `A delightful preparation of ${product?.name || 'dish'}, crafted with fresh ingredients and authentic spices. Every dish is prepared fresh — please allow 15–20 minutes.`}
                                </p>
                            </div>

                        </div>

                        {/* Bottom Sticky Action Area */}
                        <div className="p-4 pb-6 sm:pb-4 border-t border-gray-100 bg-white shrink-0 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm text-text-secondary font-medium">Total Price</span>
                                    <span className="text-2xl font-bold text-text-primary">
                                        {seasonal ? 'Seasonal' : `₹${(product?.price || 0) * (cartItem ? cartItem.qty : 1)}`}
                                    </span>
                                </div>

                                {!product?.isAvailable ? (
                                    <button type="button" disabled className="bg-gray-100 text-gray-400 font-bold px-8 py-3.5 rounded-2xl">
                                        Sold Out
                                    </button>
                                ) : seasonal ? (
                                    <button type="button" disabled className="bg-gray-100 text-gray-500 font-bold px-8 py-3.5 rounded-2xl">
                                        Ask staff
                                    </button>
                                ) : cartItem ? (
                                    <div className="flex items-center bg-green-50 border border-primary rounded-2xl overflow-hidden h-12 w-36 shadow-sm">
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (cartItem.qty === 1) removeFromCart(product._id);
                                                else updateQty(product._id, -1);
                                            }}
                                            className="w-10 h-full flex items-center justify-center text-primary active:bg-green-200"
                                        >
                                            <Minus size={20} strokeWidth={2.5} />
                                        </button>
                                        <span className="flex-1 text-center font-bold text-primary text-lg">
                                            {cartItem.qty}
                                        </span>
                                        <button 
                                            type="button"
                                            onClick={() => updateQty(product._id, 1)}
                                            className="w-10 h-full flex items-center justify-center text-primary active:bg-green-200"
                                        >
                                            <Plus size={20} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        type="button"
                                        onClick={() => addToCart(product)}
                                        className="bg-primary text-white font-bold px-10 py-3.5 rounded-2xl active:scale-95 transition-all shadow-md flex items-center gap-2"
                                    >
                                        <Plus size={20} />
                                        Add to Cart
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DishDetailsModal;
