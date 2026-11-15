import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import API_URL from '../api';

const RestaurantContext = createContext();

export const useRestaurant = () => useContext(RestaurantContext);

const STORAGE_KEY = 'selectedRestaurant';

const readSaved = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
};

// The site serves a single menu: the first active restaurant record.
const pickDefault = (list) => list.find((r) => r.isActive !== false) || null;

export const RestaurantProvider = ({ children }) => {
    const [selectedRestaurant, setSelectedRestaurant] = useState(readSaved);
    const [restaurants, setRestaurants] = useState([]);
    const [loadError, setLoadError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const res = await fetch(`${API_URL}/restaurants`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const list = Array.isArray(data) ? data : [];
                setRestaurants(list);
                setLoadError(false);
                // Refresh the saved selection (service charge etc. may have changed); drop it if
                // that restaurant was removed or disabled.
                setSelectedRestaurant((prev) => {
                    const fresh = prev && list.find((r) => r._id === prev._id && r.isActive !== false);
                    return fresh || pickDefault(list);
                });
            } catch (error) {
                console.error('Failed to fetch restaurants:', error);
                setLoadError(true);
            } finally {
                setIsLoaded(true);
            }
        };

        fetchRestaurants();
    }, []);

    useEffect(() => {
        try {
            if (selectedRestaurant) localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedRestaurant));
            else localStorage.removeItem(STORAGE_KEY);
        } catch {
            // storage unavailable (private mode) — selection still works for this session
        }
    }, [selectedRestaurant]);

    const changeRestaurant = useCallback((restaurant) => setSelectedRestaurant(restaurant || null), []);

    return (
        <RestaurantContext.Provider value={{ selectedRestaurant, changeRestaurant, restaurants, setRestaurants, loadError, isLoaded }}>
            {children}
        </RestaurantContext.Provider>
    );
};
