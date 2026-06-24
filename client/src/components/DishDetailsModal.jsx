import React, { useState } from 'react';
import { X, Minus, Plus, Star, Info, Leaf, Drumstick } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const DishDetailsModal = ({ isOpen, onClose, product }) => {
    const { addToCart, cartItems, updateQty, removeFromCart } = useCart();
    
    if (!product) return null;

    const cartItem = cartItems.find(item => item._id === product._id);
    const isVeg = product.category === 'Vegetarian' || product.category === 'Veg';
    const imageUrl = product.imageUrl || `https://source.unsplash.com/400x400/?food,${encodeURIComponent(product.category)}`;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={handleBackdropClick}
                >
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                        className="bg-white w-full max-w-lg sm:rounded-[32px] rounded-t-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Image */}
                        <div className="relative h-64 sm:h-72 w-full bg-gray-100 shrink-0">
                            <img 
                                src={imageUrl} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                            />
                            <button 
                                onClick={onClose}
                                className="absolute top-4 right-4 bg-white/50 backdrop-blur p-2 rounded-full text-gray-800 hover:bg-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <div className="absolute -bottom-5 right-6 bg-white rounded-full p-1.5 shadow-lg">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isVeg ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {isVeg ? <Leaf size={14} /> : <Drumstick size={14} />}
                                </div>
                            </div>
                        </div>

                        {/* Content Scrollable Area */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-2xl font-bold text-text-primary pr-4">{product.name}</h2>
                            </div>
                            
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-gray-100 text-text-secondary px-2.5 py-1 rounded-lg text-sm font-medium">
                                    {product.category}
                                </span>
                                <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                                    <Star size={16} className="fill-accent text-accent" />
                                    <span>4.8 (120+ ratings)</span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                                    <Info size={18} className="text-gray-400" />
                                    Description
                                </h3>
                                <p className="text-text-secondary leading-relaxed">
                                    {product.description || `A delightful preparation of ${product.name}, crafted with fresh ingredients and authentic spices. Perfectly cooked to satisfy your cravings.`}
                                </p>
                            </div>

                            {/* Mock Add-ons section as per prompt */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-text-primary mb-3">Add-ons</h3>
                                <div className="space-y-3">
                                    {['Extra Cheese', 'Spicy Dip', 'Coke (330ml)'].map((addon, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-primary/30 transition-colors">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                                                <span className="font-medium text-text-primary">{addon}</span>
                                            </label>
                                            <span className="text-text-secondary">₹{Math.floor(Math.random() * 50) + 20}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Sticky Action Area */}
                        <div className="p-4 pb-6 sm:pb-4 border-t border-gray-100 bg-white shrink-0 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm text-text-secondary font-medium">Total Price</span>
                                    <span className="text-2xl font-bold text-text-primary">
                                        ₹{product.price * (cartItem ? cartItem.qty : 1)}
                                    </span>
                                </div>

                                {!product.isAvailable ? (
                                    <button disabled className="bg-gray-100 text-gray-400 font-bold px-8 py-3.5 rounded-2xl">
                                        Sold Out
                                    </button>
                                ) : cartItem ? (
                                    <div className="flex items-center bg-green-50 border border-primary rounded-2xl overflow-hidden h-12 w-36 shadow-sm">
                                        <button 
                                            onClick={() => {
                                                if (cartItem.qty === 1) removeFromCart(product._id);
                                                else updateQty(product._id, -1);
                                            }}
                                            className="w-10 h-full flex items-center justify-center text-primary hover:bg-green-100"
                                        >
                                            <Minus size={20} strokeWidth={2.5} />
                                        </button>
                                        <span className="flex-1 text-center font-bold text-primary text-lg">
                                            {cartItem.qty}
                                        </span>
                                        <button 
                                            onClick={() => updateQty(product._id, 1)}
                                            className="w-10 h-full flex items-center justify-center text-primary hover:bg-green-100"
                                        >
                                            <Plus size={20} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => addToCart(product)}
                                        className="bg-primary text-white font-bold px-10 py-3.5 rounded-2xl hover:bg-primary-light active:scale-95 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
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
