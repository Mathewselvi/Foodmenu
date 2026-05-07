import { useState, useEffect, useMemo } from 'react';
import { Search, WifiOff } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import { useNotification } from '../context/NotificationContext';
import { useRestaurant } from '../context/RestaurantContext';
import API_URL from '../api';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const { showNotification } = useNotification();
    const { selectedRestaurant, restaurants, changeRestaurant } = useRestaurant();

    useEffect(() => {
        const fetchProducts = async () => {
            if (!selectedRestaurant) return;
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/products?restaurantId=${selectedRestaurant._id}`);
                if (!res.ok) throw new Error('Failed to fetch products');
                const data = await res.json();
                setProducts(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch products:", error);
                setError(error.message);
                setLoading(false);
                showNotification('Could not connect to server. Please try again.', 'error');
            }
        };

        fetchProducts();
    }, [showNotification, selectedRestaurant]);

    const categories = useMemo(() => {
        const cats = ['All', ...new Set(products.map(item => item.category))];
        return cats;
    }, [products]);

    const filteredProducts = useMemo(() => {
        let result = products;
        
        if (activeCategory !== 'All') {
            result = result.filter(item => item.category === activeCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item => item.name.toLowerCase().includes(query));
        }

        return result;
    }, [activeCategory, products, searchQuery]);

    if (!selectedRestaurant) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Select a Restaurant
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Please select a restaurant to view its menu and order food.
                        </p>
                    </div>
                    <div className="mt-8 space-y-4">
                        {restaurants.map((restaurant) => (
                            <button
                                key={restaurant._id}
                                onClick={() => changeRestaurant(restaurant)}
                                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-md hover:shadow-lg"
                            >
                                {restaurant.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-24 pt-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{selectedRestaurant.name} Menu</h2>
                        <button 
                            onClick={() => changeRestaurant(null)}
                            className="text-sm text-green-600 hover:text-green-800 underline"
                        >
                            Change Restaurant
                        </button>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        {/* Search Bar */}
                        <div className="relative w-full md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search dishes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all sm:text-sm"
                            />
                        </div>

                        {/* Categories Filter */}
                        <div className="flex overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide space-x-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all shadow-sm flex-shrink-0 ${
                                        activeCategory === cat
                                            ? 'bg-green-600 text-white shadow-md'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-red-50 p-6 rounded-full mb-4">
                            <WifiOff size={48} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Connection Issues</h3>
                        <p className="text-gray-500 mb-6 max-w-xs">We're having trouble reaching the kitchen. Please check your connection and refresh.</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-green-700 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                ) : loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((idx) => (
                            <div key={idx} className="bg-gray-100 rounded-2xl h-80 animate-pulse border border-gray-200"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map(product => (
                            <FoodCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
                
                {!loading && filteredProducts.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">
                            {searchQuery ? `No results found for "${searchQuery}"` : "No items found in this category."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
