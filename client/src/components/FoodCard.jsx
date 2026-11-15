import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { getCategoryLabel, getProductImage, isSeasonal } from '../menuMeta';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';

// Green dot = veg, red dot = non-veg. Hidden when not specified (e.g. drinks).
export const VegBadge = ({ isVeg, className = '' }) => {
    if (isVeg !== true && isVeg !== false) return null;
    return (
        <div className={`bg-white/90 backdrop-blur p-1 rounded-md shadow-sm ${className}`} title={isVeg ? 'Vegetarian' : 'Non-vegetarian'}>
            <div className={`w-3 h-3 rounded-sm border ${isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
            </div>
        </div>
    );
};

/**
 * One menu card. For dishes sold in sizes (Quarter / Half / Full) pass `variants`
 * ([{ size, item }]) and the card shows a size picker; `product` is then ignored.
 */
const FoodCard = ({ product: single, variants, name, onClick }) => {
    const { addToCart, cartItems, updateQty, removeFromCart } = useCart();
    const firstOrderable = variants?.find((v) => v.item.isAvailable && !isSeasonal(v.item)) || variants?.[0];
    const [size, setSize] = useState(firstOrderable?.size);

    const selected = variants ? variants.find((v) => v.size === size) || variants[0] : null;
    const product = selected ? selected.item : single;
    const title = variants ? name : product?.name;
    const cartItem = cartItems.find(item => item._id === product._id);
    const seasonal = isSeasonal(product);

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

    const imageUrl = getProductImage(product, 600, 400);
    const inCart = variants
        ?.map((v) => ({ size: v.size, qty: cartItems.find((c) => c._id === v.item._id)?.qty || 0 }))
        .filter((v) => v.qty > 0) || [];

    return (
        <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick?.(product)}
            className="bg-white rounded-[24px] shadow-sm transition-all duration-300 flex flex-col h-full border border-gray-100 overflow-hidden relative cursor-pointer group"
        >
            {!product?.isAvailable && (
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
                    alt={title || 'Food item'}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGE;
                    }}
                />

                {/* Veg/Non-Veg Badge overlay */}
                <VegBadge isVeg={product?.isVeg} className="absolute top-3 right-3" />
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-[18px] font-bold text-text-primary leading-tight line-clamp-2 pr-2">
                        {title || 'Item'}
                    </h3>
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[12px] font-medium text-text-secondary bg-gray-100 px-2 py-0.5 rounded-md">
                        {getCategoryLabel(product?.category)}
                    </span>
                </div>

                {variants ? (
                    <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                        <div role="radiogroup" aria-label={`${title} size`} className="inline-flex p-1 rounded-xl bg-gray-100">
                            {variants.map((v) => {
                                const active = v.size === selected.size;
                                return (
                                    <button
                                        key={v.size}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        onClick={() => setSize(v.size)}
                                        className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-all ${
                                            active ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                    >
                                        {v.size}
                                    </button>
                                );
                            })}
                        </div>
                        {inCart.length > 0 && (
                            <p className="text-[12px] font-semibold text-primary mt-1.5">
                                In cart: {inCart.map((v) => `${v.qty} × ${v.size}`).join(', ')}
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-[13px] text-text-secondary line-clamp-2 mb-4">
                        {seasonal
                            ? 'Price varies by season — please ask our staff.'
                            : product?.description || `Delicious ${product?.name || 'dish'} freshly prepared by our expert chefs.`}
                    </p>
                )}

                <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-[18px] font-bold text-text-primary">
                            {seasonal ? 'Seasonal' : `₹${product?.price || 0}`}
                        </span>
                    </div>

                    <div className="z-20 relative" onClick={(e) => e.stopPropagation()}>
                        {!product?.isAvailable ? (
                            <button type="button" disabled className="bg-gray-100 text-gray-400 font-semibold px-4 py-2 rounded-xl text-sm cursor-not-allowed">
                                Sold Out
                            </button>
                        ) : seasonal ? (
                            <button type="button" disabled className="bg-gray-100 text-gray-500 font-semibold px-4 py-2 rounded-xl text-sm cursor-not-allowed">
                                Ask staff
                            </button>
                        ) : cartItem ? (
                            <div className="flex items-center bg-green-50 border border-primary rounded-xl overflow-hidden shadow-sm h-9">
                                <button
                                    type="button"
                                    onClick={(e) => handleQtyChange(e, -1)}
                                    aria-label={`Remove one ${product.name}`}
                                    className="px-3 h-full flex items-center text-primary active:bg-green-200 transition-colors"
                                >
                                    <Minus size={16} strokeWidth={3} />
                                </button>
                                <span className="w-6 text-center font-bold text-primary text-sm">
                                    {cartItem.qty}
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => handleQtyChange(e, 1)}
                                    aria-label={`Add one more ${product.name}`}
                                    className="px-3 h-full flex items-center text-primary active:bg-green-200 transition-colors"
                                >
                                    <Plus size={16} strokeWidth={3} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleAddClick}
                                aria-label={`Add ${product.name}`}
                                className="flex items-center justify-center font-bold px-6 py-2 rounded-xl transition-all active:scale-95 bg-primary text-white shadow-sm"
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
