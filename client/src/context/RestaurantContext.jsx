import { createContext, useState, useContext, useEffect } from 'react';
import API_URL from '../api';

const RestaurantContext = createContext();

export const useRestaurant = () => useContext(RestaurantContext);

export const RestaurantProvider = ({ children }) => {
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [restaurants, setRestaurants] = useState([]);

    useEffect(() => {
        // Load selected restaurant from localStorage if available
        const saved = localStorage.getItem('selectedRestaurant');
        if (saved) {
            setSelectedRestaurant(JSON.parse(saved));
        }

        // Fetch all restaurants
        const fetchRestaurants = async () => {
            try {
                const res = await fetch(`${API_URL}/restaurants`);
                if (res.ok) {
                    const data = await res.json();
                    setRestaurants(data);
                }
            } catch (error) {
                console.error("Failed to fetch restaurants:", error);
            }
        };

        fetchRestaurants();
    }, []);

    const changeRestaurant = (restaurant) => {
        setSelectedRestaurant(restaurant);
        if (restaurant) {
            localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
        } else {
            localStorage.removeItem('selectedRestaurant');
        }
    };

    return (
        <RestaurantContext.Provider value={{ selectedRestaurant, changeRestaurant, restaurants, setRestaurants }}>
            {children}
        </RestaurantContext.Provider>
    );
};
