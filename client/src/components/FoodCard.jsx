import { useState, useEffect } from 'react';
import { Plus, Minus, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { getFullImageUrl } from '../api';

const FoodCard = ({ product, onClick }) => {
    const { addToCart, cartItems, updateQty, removeFromCart, setExactQty } = useCart();
    const cartItem = cartItems.find(item => item._id === product._id);
    
    const [localQty, setLocalQty] = useState(cartItem ? cartItem.qty : '');

    useEffect(() => {
        if (cartItem) {
            setLocalQty(cartItem.qty);
        } else {
            setLocalQty('');
        }
    }, [cartItem]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setLocalQty(val);

        const parsed = parseInt(val, 10);
        if (!isNaN(parsed)) {
            setExactQty(product._id, parsed);
        } else if (val === '') {
            setExactQty(product._id, 0);
        }
    };

    const handleAddClick = (e) => {
        e.stopPropagation();
        addToCart(product);
    };

    const handleQtyChange = (e, amount) => {
        e.stopPropagation();
        if (amount === -1 && cartItem.qty === 1) {
            removeFromCart(product._id);
        } else {
            updateQty(product._id, amount);
        }
    };

    // Placeholder image if product doesn't have one
    const imageUrl = getFullImageUrl(product.imageUrl) || `https://source.unsplash.com/400x300/?food,${encodeURIComponent(product.category)}`;
    const isVeg = product.category === 'Vegetarian' || product.category === 'Veg';

    return (
        <motion.div 
            whileHover={{ y: -4 }}
            onClick={onClick}
            className="bg-white rounded-[24px] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col border border-gray-100 overflow-hidden relative cursor-pointer group"
        >
            {!product.isAvailable && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-20 flex items-center justify-center">
                    <span className="bg-text-primary text-white font-bold px-4 py-2 rounded-full uppercase tracking-wider text-xs shadow-md">
                        Sold Out
                    </span>
                </div>
            )}
            
            {/* Image Section */}
            <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'; // fallback
                    }}
                />
                
                {/* Veg/Non-Veg Badge overlay */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur p-1 rounded-md shadow-sm">
                    <div className={`w-3 h-3 rounded-sm border ${isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-[18px] font-bold text-text-primary leading-tight line-clamp-2 pr-2">
                        {product.name}
                    </h3>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[12px] font-medium text-text-secondary bg-gray-100 px-2 py-0.5 rounded-md">
                        {product.category}
                    </span>
                    <div className="flex items-center gap-1 text-[12px] font-bold text-gray-700">
                        <Star size={12} className="fill-accent text-accent" />
                        <span>4.5</span>
                    </div>
                </div>

                <p className="text-[13px] text-text-secondary line-clamp-2 mb-4">
                    {product.description || `Delicious ${product.name} freshly prepared by our expert chefs.`}
                </p>
                
                <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-[18px] font-bold text-text-primary">
                            ₹{product.price}
                        </span>
                    </div>
                    
                    <div className="z-20 relative" onClick={(e) => e.stopPropagation()}>
                        {!product.isAvailable ? (
                            <button disabled className="bg-gray-100 text-gray-400 font-semibold px-4 py-2 rounded-xl text-sm cursor-not-allowed">
                                Sold Out
                            </button>
                        ) : cartItem ? (
                            <div className="flex items-center bg-green-50 border border-primary rounded-xl overflow-hidden shadow-sm h-9">
                                <button 
                                    onClick={(e) => handleQtyChange(e, -1)}
                                    className="px-3 h-full flex items-center text-primary hover:bg-green-100 transition-colors"
                                >
                                    <Minus size={16} strokeWidth={3} />
                                </button>
                                <span className="w-6 text-center font-bold text-primary text-sm">
                                    {cartItem.qty}
                                </span>
                                <button 
                                    onClick={(e) => handleQtyChange(e, 1)}
                                    className="px-3 h-full flex items-center text-primary hover:bg-green-100 transition-colors"
                                >
                                    <Plus size={16} strokeWidth={3} />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleAddClick}
                                className="flex items-center justify-center font-bold px-6 py-2 rounded-xl transition-all active:scale-95 bg-primary/10 text-primary hover:bg-primary hover:text-white"
                            >
                                ADD
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default FoodCard;

