import { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const itemExists = prevItems.find((item) => item._id === product._id);
            if (itemExists) {
                return prevItems.map((item) =>
                    item._id === product._id ? { ...item, qty: item.qty + 1 } : item
                );
            } else {
                return [...prevItems, { ...product, qty: 1 }];
            }
        });
    };

    const removeFromCart = (id) => {
        setCartItems((prevItems) => prevItems.filter((item) => item._id !== id));
    };

    const updateQty = (id, amount) => {
        setCartItems((prevItems) => {
            return prevItems.map((item) => {
                if (item._id === id) {
                    const newQty = item.qty + amount;
                    return newQty > 0 ? { ...item, qty: newQty } : item;
                }
                return item;
            });
        });
    };

    const setExactQty = (id, qty) => {
        setCartItems((prevItems) => {
            if (qty <= 0) {
                return prevItems.filter(item => item._id !== id);
            }
            return prevItems.map((item) => 
                item._id === id ? { ...item, qty } : item
            );
        });
    };

    const cartTotal = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    }, [cartItems]);

    const totalItems = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + item.qty, 0);
    }, [cartItems]);

    const clearCart = () => setCartItems([]);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQty,
                setExactQty,
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
