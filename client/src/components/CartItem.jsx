import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getFullImageUrl } from '../api';

const CartItem = ({ item }) => {
    const { updateQty, removeFromCart, setExactQty } = useCart();
    const [localQty, setLocalQty] = useState(item.qty);

    useEffect(() => {
        setLocalQty(item.qty);
    }, [item.qty]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setLocalQty(val);
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed)) {
            setExactQty(item._id, parsed);
        } else if (val === '') {
            setExactQty(item._id, 0);
        }
    };

    const imageUrl = getFullImageUrl(item.imageUrl) || `https://source.unsplash.com/100x100/?food,${encodeURIComponent(item.category)}`;
    const isVeg = item.category === 'Vegetarian' || item.category === 'Veg';

    return (
        <div className="flex gap-4 items-start bg-white py-4 border-b border-gray-50 last:border-0 relative">
            {/* Veg/Non-Veg Badge */}
            <div className={`absolute top-4 left-0 w-3 h-3 rounded-sm border ${isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center bg-white z-10`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
            </div>

            {/* Dish Image */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 ml-4 relative">
                <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0 pr-6">
                <h4 className="font-bold text-text-primary text-[15px] leading-tight mb-1">{item.name}</h4>
                <p className="text-text-primary font-bold mb-3">₹{item.price * (parseInt(localQty) || 0)}</p>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-green-50 border border-primary rounded-lg overflow-hidden shadow-sm h-8 w-24">
                        <button 
                            onClick={() => {
                                if (item.qty === 1) removeFromCart(item._id);
                                else updateQty(item._id, -1);
                            }}
                            className="w-8 h-full flex items-center justify-center text-primary hover:bg-green-100 transition-colors"
                        >
                            <Minus size={14} strokeWidth={3} />
                        </button>
                        <input 
                            type="number" 
                            value={localQty} 
                            onChange={handleInputChange} 
                            className="flex-1 bg-transparent text-center font-bold text-primary text-sm outline-none appearance-none" 
                            min="0" 
                        />
                        <button 
                            onClick={() => updateQty(item._id, 1)}
                            className="w-8 h-full flex items-center justify-center text-primary hover:bg-green-100 transition-colors"
                        >
                            <Plus size={14} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Remove button moved to corner */}
            <button 
                onClick={() => removeFromCart(item._id)}
                className="absolute top-4 right-0 p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default CartItem;
