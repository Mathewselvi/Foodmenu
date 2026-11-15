import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, WifiOff, Sparkles } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import DishDetailsModal from '../components/DishDetailsModal';
import { useNotification } from '../context/NotificationContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import API_URL from '../api';
import { getCategoryImage, getCategoryLabel, groupBySize, sortCategories } from '../menuMeta';

const ALL_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&q=80';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [vegOnly, setVegOnly] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const { showNotification } = useNotification();
    const { selectedRestaurant, loadError, isLoaded } = useRestaurant();
    const { syncWithMenu } = useCart();
    const location = useLocation();

    // Wait for the restaurant list so a stale saved selection never loads an old menu.
    const restaurantId = isLoaded ? selectedRestaurant?._id : undefined;

    useEffect(() => {
        if (!restaurantId) return;
        let cancelled = false;
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/products?restaurantId=${restaurantId}`);
                if (!res.ok) throw new Error('Failed to fetch products');
                const data = await res.json();
                if (cancelled) return;
                const list = Array.isArray(data) ? data : [];
                setProducts(list);
                syncWithMenu(list); // update prices of anything already in the cart
                setLoading(false);
            } catch (error) {
                if (cancelled) return;
                console.error("Failed to fetch products:", error);
                setError(error.message);
                setLoading(false);
                showNotification('Could not connect to server. Please try again.', 'error');
            }
        };

        fetchProducts();
        return () => { cancelled = true; };
    }, [showNotification, restaurantId, syncWithMenu]);

    // Bottom nav "Categories" links to /#categories
    useEffect(() => {
        if (location.hash === '#categories' && !loading) {
            document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location.hash, loading]);

    const categories = useMemo(() => {
        return ['All', ...sortCategories([...new Set(products.map(item => item.category))])];
    }, [products]);

    // Cards to show, grouped by category (Quarter / Half / Full sizes share one card).
    const sections = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const byCategory = new Map();
        for (const item of products) {
            if (activeCategory !== 'All' && item.category !== activeCategory) continue;
            if (vegOnly && item.isVeg === false) continue;
            if (query && !item?.name?.toLowerCase().includes(query) && !getCategoryLabel(item.category).toLowerCase().includes(query)) continue;
            if (!byCategory.has(item.category)) byCategory.set(item.category, []);
            byCategory.get(item.category).push(item);
        }
        return sortCategories([...byCategory.keys()]).map((key) => ({
            key,
            label: getCategoryLabel(key),
            cards: groupBySize(byCategory.get(key)),
        }));
    }, [activeCategory, products, searchQuery, vegOnly]);

    const cardCount = sections.reduce((n, s) => n + s.cards.length, 0);
    const showSectionTitles = activeCategory === 'All' && !searchQuery;

    if ((loadError && !selectedRestaurant) || (error && products.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
                <div className="bg-red-50 p-6 rounded-full mb-6">
                    <WifiOff size={48} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-2">Connection Issues</h3>
                <p className="text-text-secondary mb-8 max-w-sm">We're having trouble reaching the kitchen. Please check your connection.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-primary-light transition-all active:scale-95"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!selectedRestaurant) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center">
                {isLoaded ? (
                    <p className="text-text-secondary font-medium px-6 text-center">Our menu is being updated. Please check back in a few minutes.</p>
                ) : (
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen pb-24 pt-2">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Search Section */}
                <div className="sticky top-20 z-30 bg-background/95 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search size={20} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="menu-search"
                            name="search"
                            aria-label="Search dishes"
                            placeholder="Search dishes, cuisines..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-12 pr-4 py-3.5 border-none rounded-2xl bg-white shadow-sm text-text-primary placeholder-gray-400 focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-[15px] font-medium"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Hero Banner - Only show if not searching */}
                {!searchQuery && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 mb-8 relative rounded-[28px] overflow-hidden bg-gray-900 shadow-xl"
                    >
                        <div className="absolute inset-0">
                            <img
                                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070"
                                alt="Delicious food"
                                className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
                        </div>
                        <div className="relative px-6 py-8 sm:p-10 flex flex-col justify-center h-full max-w-sm">
                            <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-max mb-4">
                                <Sparkles size={14} className="text-yellow-400" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Premium Dining</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-2 tracking-tight">
                                Delicious food, <br/>delivered to your room.
                            </h2>
                            <p className="text-gray-200 text-sm mb-6">Freshly prepared &amp; hygienic meals · ready in 15–20 min</p>
                            <button
                                onClick={() => {
                                    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="bg-primary hover:bg-primary-light text-white font-bold py-3 px-6 rounded-xl w-max transition-colors shadow-lg shadow-green-900/50"
                            >
                                Order Now
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Categories */}
                <div className="mb-8 scroll-mt-40" id="categories">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-text-primary tracking-tight">Categories</h3>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={vegOnly}
                            onClick={() => setVegOnly((v) => !v)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[13px] font-bold transition-colors ${
                                vegOnly ? 'bg-green-50 border-primary text-primary' : 'bg-white border-gray-200 text-text-secondary'
                            }`}
                        >
                            <span className={`relative w-8 h-[18px] rounded-full transition-colors ${vegOnly ? 'bg-primary' : 'bg-gray-200'}`}>
                                <span className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-all ${vegOnly ? 'left-[16px]' : 'left-[2px]'}`} />
                            </span>
                            Veg only
                        </button>
                    </div>
                    <div className="flex overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 gap-3">
                        {categories.map((cat) => {
                            const img = cat === 'All' ? ALL_IMAGE : getCategoryImage(cat, 100, 100);
                            const label = cat === 'All' ? 'All' : getCategoryLabel(cat);

                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[80px] p-2 rounded-2xl transition-all ${
                                        activeCategory === cat ? 'bg-green-50 scale-105' : 'bg-transparent hover:bg-gray-50'
                                    }`}
                                >
                                    <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${activeCategory === cat ? 'border-primary shadow-md' : 'border-transparent shadow-sm'}`}>
                                        <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                                    </div>
                                    <span className={`text-xs font-semibold whitespace-nowrap ${activeCategory === cat ? 'text-primary' : 'text-text-secondary'}`}>
                                        {label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Menu or Search Results */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-text-primary tracking-tight">
                            {searchQuery ? 'Search Results' : activeCategory === 'All' ? 'Our Menu' : `${getCategoryLabel(activeCategory)} Dishes`}
                        </h3>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((idx) => (
                                <div key={idx} className="bg-white rounded-[24px] h-[340px] animate-pulse border border-gray-100 shadow-sm"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {sections.map((section) => (
                                <section key={section.key}>
                                    {showSectionTitles && (
                                        <h4 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                                            {section.label}
                                            <span className="text-xs font-semibold text-text-secondary bg-gray-100 px-2 py-0.5 rounded-full">{section.cards.length}</span>
                                        </h4>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {section.cards.map((card, index) => (
                                            <motion.div
                                                key={card.key}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: Math.min(index, 8) * 0.05 }}
                                            >
                                                {card.type === 'sizes' ? (
                                                    <FoodCard name={card.name} variants={card.variants} onClick={setSelectedProduct} />
                                                ) : (
                                                    <FoodCard product={card.item} onClick={setSelectedProduct} />
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}

                    {!loading && cardCount === 0 && (
                        <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm mt-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">No dishes found</h3>
                            <p className="text-text-secondary text-sm max-w-xs mx-auto">
                                {searchQuery ? `We couldn't find anything matching "${searchQuery}"` : "No items available in this category at the moment."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Details Modal */}
            <DishDetailsModal
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                product={selectedProduct}
            />
        </div>
    );
};

export default Home;
