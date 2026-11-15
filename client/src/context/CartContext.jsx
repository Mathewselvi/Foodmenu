import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

const STORAGE_KEY = 'foodMenuCart';

// Keep only what the cart needs. Uploaded images are stored as base64 data URIs, which can
// overflow localStorage, so those fall back to the category photo in the cart.
const toCartItem = (product, qty) => ({
    _id: product._id,
    name: product.name,
    price: Number(product.price) || 0,
    category: product.category,
    isVeg: product.isVeg ?? null,
    imageUrl: typeof product.imageUrl === 'string' && !product.imageUrl.startsWith('data:') ? product.imageUrl : '',
    qty,
});

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(saved) ? saved.filter((i) => i && i._id && i.qty > 0) : [];
        } catch {
            return [];
        }
    });
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
        } catch {
            // storage full or unavailable — cart still works for this session
        }
    }, [cartItems]);

    const addToCart = useCallback((product) => {
        setCartItems((prevItems) => {
            const itemExists = prevItems.find((item) => item._id === product._id);
            if (itemExists) {
                return prevItems.map((item) =>
                    item._id === product._id ? { ...item, qty: item.qty + 1 } : item
                );
            }
            return [...prevItems, toCartItem(product, 1)];
        });
    }, []);

    const removeFromCart = useCallback((id) => {
        setCartItems((prevItems) => prevItems.filter((item) => item._id !== id));
    }, []);

    const updateQty = useCallback((id, amount) => {
        setCartItems((prevItems) =>
            prevItems.map((item) => {
                if (item._id === id) {
                    const newQty = item.qty + amount;
                    return newQty > 0 ? { ...item, qty: newQty } : item;
                }
                return item;
            })
        );
    }, []);

    const setExactQty = useCallback((id, qty) => {
        setCartItems((prevItems) => {
            if (qty <= 0) {
                return prevItems.filter((item) => item._id !== id);
            }
            return prevItems.map((item) => (item._id === id ? { ...item, qty } : item));
        });
    }, []);

    // Bring a saved cart in line with the live menu: apply current prices/names and drop items
    // that were removed, sold out, or have no price (seasonal).
    const syncWithMenu = useCallback((products) => {
        const byId = new Map(products.map((p) => [p._id, p]));
        setCartItems((prevItems) => {
            let changed = false;
            const next = [];
            for (const item of prevItems) {
                const live = byId.get(item._id);
                if (!live || !live.isAvailable || !(Number(live.price) > 0)) {
                    changed = true;
                    continue;
                }
                const fresh = toCartItem(live, item.qty);
                if (fresh.price !== item.price || fresh.name !== item.name || fresh.isVeg !== item.isVeg || fresh.imageUrl !== item.imageUrl) {
                    changed = true;
                    next.push(fresh);
                } else {
                    next.push(item);
                }
            }
            return changed ? next : prevItems;
        });
    }, []);

    const cartTotal = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    }, [cartItems]);

    const totalItems = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + item.qty, 0);
    }, [cartItems]);

    const clearCart = useCallback(() => setCartItems([]), []);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQty,
                setExactQty,
                syncWithMenu,
                clearCart,
                cartTotal,
                totalItems,
                isCartOpen,
                setIsCartOpen
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
