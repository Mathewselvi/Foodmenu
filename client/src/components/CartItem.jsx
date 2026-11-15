import { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProductImage } from '../menuMeta';

const CartItem = ({ item }) => {
    const { updateQty, removeFromCart, setExactQty } = useCart();
    // Text being typed in the qty field; null when not editing (then the real qty is shown).
    const [draft, setDraft] = useState(null);
    const localQty = draft ?? item.qty;

    const handleInputChange = (e) => {
        const val = e.target.value;
        setDraft(val);
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed)) {
            setExactQty(item._id, parsed);
        }
    };

    const imageUrl = getProductImage(item);
    const isVeg = item.isVeg;
    const hasVegMark = isVeg === true || isVeg === false;

    return (
        <div className="flex gap-4 items-start bg-white py-4 border-b border-gray-50 last:border-0 relative">
            {/* Veg/Non-Veg Badge */}
            {hasVegMark && (
                <div className={`absolute top-4 left-0 w-3 h-3 rounded-sm border ${isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center bg-white z-10`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                </div>
            )}

            {/* Dish Image */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 ml-4 relative">
                <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
            </div>

            <div className="flex-1 min-w-0 pr-6">
                <h4 className="font-bold text-text-primary text-[15px] leading-tight mb-1">{item.name}</h4>
                <p className="text-text-primary font-bold mb-3">₹{item.price * (parseInt(localQty, 10) || 0)}</p>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-green-50 border border-primary rounded-lg overflow-hidden shadow-sm h-8 w-24">
                        <button 
                            onClick={() => {
                                setDraft(null);
                                if (item.qty === 1) removeFromCart(item._id);
                                else updateQty(item._id, -1);
                            }}
                            aria-label={`Remove one ${item.name}`}
                            className="w-8 h-full flex items-center justify-center text-primary hover:bg-green-100 transition-colors"
                        >
                            <Minus size={14} strokeWidth={3} />
                        </button>
                        <input 
                            type="number" 
                            value={localQty} 
                            onChange={handleInputChange} 
                            onBlur={() => setDraft(null)}
                            name={`qty-${item._id}`}
                            aria-label={`${item.name} quantity`}
                            className="w-8 min-w-0 flex-1 bg-transparent text-center font-bold text-primary text-sm outline-none appearance-none" 
                            min="0" 
                        />
                        <button 
                            onClick={() => { setDraft(null); updateQty(item._id, 1); }}
                            aria-label={`Add one more ${item.name}`}
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
                aria-label={`Remove ${item.name} from cart`}
                className="absolute top-4 right-0 p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default CartItem;
