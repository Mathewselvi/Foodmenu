import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const FoodCard = ({ product }) => {
    const { addToCart, cartItems, updateQty, removeFromCart, setExactQty } = useCart();
    const cartItem = cartItems.find(item => item._id === product._id);
    
    // Local state for the input to handle typing smoothly
    const [localQty, setLocalQty] = useState(cartItem ? cartItem.qty : '');

    // Synchronize local state when cart changes (e.g., from +/- buttons)
    useEffect(() => {
        if (cartItem) {
            setLocalQty(cartItem.qty);
        } else {
            setLocalQty('');
        }
    }, [cartItem]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setLocalQty(val); // Always update local state for visual feedback

        const parsed = parseInt(val, 10);
        if (!isNaN(parsed)) {
            setExactQty(product._id, parsed);
        } else if (val === '') {
            setExactQty(product._id, 0); // Remove if empty
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100 p-5 relative overflow-hidden">
            {!product.isAvailable && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-full uppercase tracking-wider text-sm shadow-sm">
                        Sold Out
                    </span>
                </div>
            )}
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-start">
                    {product.category === 'Vegetarian' && (
                        <div className="mt-1 bg-white p-1 rounded border border-green-500 flex items-center justify-center shadow-sm flex-shrink-0">
                             <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                    )}
                    {product.category === 'Non-Vegetarian' && (
                        <div className="mt-1 bg-white p-1 rounded border border-red-500 flex items-center justify-center shadow-sm flex-shrink-0">
                             <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        </div>
                    )}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{product.name}</h3>
                        <span className="inline-block mt-2 text-xs font-semibold px-2 py-1 bg-green-50 text-green-700 rounded whitespace-nowrap">
                            {product.category}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                <div className="text-xl font-bold text-gray-900">
                    ₹{product.price}
                </div>
                
                <div className="z-20">
                    {!product.isAvailable ? (
                        <button disabled className="bg-gray-100 text-gray-400 font-semibold px-4 py-2 rounded-full cursor-not-allowed">
                            Sold Out
                        </button>
                    ) : cartItem ? (
                        <div className="flex items-center bg-green-50 border border-green-200 rounded-full overflow-hidden shadow-sm">
                            <button 
                                onClick={() => {
                                    if (cartItem.qty === 1) removeFromCart(product._id);
                                    else updateQty(product._id, -1);
                                }}
                                className="p-2 text-green-700 hover:bg-green-100 transition-colors"
                            >
                                <Minus size={18} />
                            </button>
                            <input 
                                type="number" 
                                value={localQty} 
                                onChange={handleInputChange} 
                                className="w-10 bg-transparent text-center font-bold text-green-800 outline-none appearance-none" 
                                min="0" 
                            />
                            <button 
                                onClick={() => updateQty(product._id, 1)}
                                className="p-2 text-green-700 hover:bg-green-100 transition-colors"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => addToCart(product)}
                            className="flex items-center gap-1 font-semibold px-4 py-2 rounded-full transition-all active:scale-95 bg-green-600 text-white hover:bg-green-700 hover:shadow-md"
                        >
                            <Plus size={18} />
                            <span>Add</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FoodCard;
