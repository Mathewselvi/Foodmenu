import React, { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

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

    return (
        <div className="flex gap-4 items-center bg-white border border-gray-50 p-3 rounded-2xl shadow-sm">
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 truncate mb-1">{item.name}</h4>
                <p className="text-green-600 font-bold mb-3">₹{item.price * (parseInt(localQty) || 0)}</p>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                        <button 
                            onClick={() => {
                                if (item.qty === 1) removeFromCart(item._id);
                                else updateQty(item._id, -1);
                            }}
                            className="p-1 text-gray-500 hover:text-green-600 bg-white rounded-md shadow-sm"
                        >
                            <Minus size={16} />
                        </button>
                        <input 
                            type="number" 
                            value={localQty} 
                            onChange={handleInputChange} 
                            className="w-10 bg-transparent text-center font-bold text-gray-800 outline-none appearance-none" 
                            min="0" 
                        />
                        <button 
                            onClick={() => updateQty(item._id, 1)}
                            className="p-1 text-gray-500 hover:text-green-600 bg-white rounded-md shadow-sm"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => removeFromCart(item._id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
            >
                <X size={20} />
            </button>
        </div>
    );
};

export default CartItem;
