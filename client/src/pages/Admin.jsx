import { useState, useEffect, useMemo } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useRestaurant } from '../context/RestaurantContext';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, X, Trash2, Check, Utensils, Settings, Shield, LogOut, Menu as MenuIcon, ClipboardList, Home, LayoutDashboard, TrendingUp, DollarSign, Activity, Package, ExternalLink, ChevronDown, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import API_URL from '../api';
import Orders from './Orders';
import { motion, AnimatePresence } from 'framer-motion';

const Admin = () => {
    const { showNotification } = useNotification();
    const { selectedRestaurant, restaurants, changeRestaurant, setRestaurants } = useRestaurant();
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: '', price: '', category: 'BEVERAGES', isAvailable: true, imageUrl: ''
    });
    const [restaurantFormData, setRestaurantFormData] = useState({ name: '' });
    const [restaurantEditId, setRestaurantEditId] = useState(null);
    const [serviceChargeData, setServiceChargeData] = useState({ enabled: true, amount: 500 });
    const [editId, setEditId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkCategory, setBulkCategory] = useState('');
    
    // Dashboard States
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
    };

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        const query = searchQuery.toLowerCase();
        return products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
        );
    }, [products, searchQuery]);

    useEffect(() => {
        setSelectedIds([]);
    }, [searchQuery, selectedRestaurant]);

    const categories = [
        'BEVERAGES', 'SANDWICH', 'BREAKFAST', 'SHORT BITES', 'SOUPS', 
        'SALADS', 'EGG BASKET', 'RICE / MEALS', 'RAITA', 'ROTIS', 
        'BIRIYANI', 'FRIED RICE', 'NOODLES', 'VEG CURRY', 'BEEF', 
        'MUTTON', 'TANDOORI', 'SHAWARMA', 'SHAWAYA', 'MASALA SHAWAYA', 
        'CHICKEN SPECIAL', 'ALFAHAM', 'LIME JUICE', 'FRESH PULP', 
        'SIGNATURE', 'LASSI', 'MILKSHAKE', 'SUNDAES', 'COOL DRINKS'
    ];

    const fetchProducts = async () => {
        if (!selectedRestaurant) return;
        try {
            const res = await fetch(`${API_URL}/products?restaurantId=${selectedRestaurant._id}`);
            if (!res.ok) throw new Error('Fetch failed');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error(error);
            showNotification('Failed to load menu items', 'error');
        }
    };

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

    useEffect(() => {
        fetchProducts();
        if (selectedRestaurant) {
            setServiceChargeData({
                enabled: selectedRestaurant.serviceChargeEnabled !== false,
                amount: selectedRestaurant.serviceChargeAmount !== undefined ? selectedRestaurant.serviceChargeAmount : 500
            });
        }
    }, [selectedRestaurant]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editId ? `${API_URL}/products/${editId}` : `${API_URL}/products`;
            const method = editId ? 'PUT' : 'POST';
            const payload = { ...formData, restaurant: selectedRestaurant._id };

            const res = await fetch(url, {
                method,
                headers: authHeaders,
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Save failed');

            showNotification(editId ? 'Item updated successfully!' : 'New item added!');
            setFormData({ name: '', price: '', category: 'BEVERAGES', isAvailable: true, imageUrl: '' });
            setEditId(null);
            fetchProducts();
        } catch (error) {
            console.error(error);
            showNotification('Error saving item', 'error');
        }
    };

    const handleEdit = (product) => {
        setFormData(product);
        setEditId(product._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this item?')) {
            try {
                const res = await fetch(`${API_URL}/products/${id}`, { 
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
                });
                if (!res.ok) throw new Error('Delete failed');
                showNotification('Item removed from menu');
                fetchProducts();
            } catch (error) {
                console.error(error);
                showNotification('Could not delete item', 'error');
            }
        }
    };

    const toggleAvailability = async (product) => {
        try {
            const res = await fetch(`${API_URL}/products/${product._id}`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({ ...product, isAvailable: !product.isAvailable })
            });
            if (!res.ok) throw new Error('Update failed');
            showNotification(product.isAvailable ? 'Marked as Sold Out' : 'Marked as Available');
            fetchProducts();
        } catch (error) {
            console.error(error);
            showNotification('Failed to update status', 'error');
        }
    };

    const handleRestaurantSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = restaurantEditId ? `${API_URL}/restaurants/${restaurantEditId}` : `${API_URL}/restaurants`;
            const method = restaurantEditId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: authHeaders,
                body: JSON.stringify(restaurantFormData)
            });

            if (!res.ok) throw new Error('Save failed');

            showNotification(restaurantEditId ? 'Restaurant updated successfully!' : 'New restaurant added!');
            setRestaurantFormData({ name: '' });
            setRestaurantEditId(null);
            fetchRestaurants();
        } catch (error) {
            console.error(error);
            showNotification('Error saving restaurant', 'error');
        }
    };

    const handleRestaurantEdit = (restaurant) => {
        setRestaurantFormData({ name: restaurant.name });
        setRestaurantEditId(restaurant._id);
    };

    const toggleRestaurantStatus = async (restaurant) => {
        try {
            const currentStatus = restaurant.isActive !== false;
            const res = await fetch(`${API_URL}/restaurants/${restaurant._id}`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (!res.ok) throw new Error('Update failed');
            showNotification(currentStatus ? 'Restaurant Disabled' : 'Restaurant Enabled');
            fetchRestaurants();
        } catch (error) {
            console.error(error);
            showNotification('Failed to update status', 'error');
        }
    };

    const handleRestaurantDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this restaurant? This might orphan some products/orders.')) {
            try {
                const res = await fetch(`${API_URL}/restaurants/${id}`, { 
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
                });
                if (!res.ok) throw new Error('Delete failed');
                showNotification('Restaurant removed');
                if (selectedRestaurant && selectedRestaurant._id === id) {
                    changeRestaurant(null);
                }
                fetchRestaurants();
            } catch (error) {
                console.error(error);
                showNotification('Could not delete restaurant', 'error');
            }
        }
    };

    const handleServiceChargeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRestaurant) return;
        try {
            const res = await fetch(`${API_URL}/restaurants/${selectedRestaurant._id}`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({ 
                    serviceChargeEnabled: serviceChargeData.enabled,
                    serviceChargeAmount: serviceChargeData.amount
                })
            });
            if (!res.ok) throw new Error('Failed to update service charge');
            const updatedRestaurant = await res.json();
            showNotification('Service charge updated successfully!');
            fetchRestaurants();
            changeRestaurant(updatedRestaurant);
        } catch (error) {
            console.error(error);
            showNotification('Error updating service charge', 'error');
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredProducts.map(p => p._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selId => selId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) {
            try {
                await Promise.all(selectedIds.map(id => fetch(`${API_URL}/products/${id}`, { 
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
                })));
                showNotification(`${selectedIds.length} items deleted successfully`);
                setSelectedIds([]);
                fetchProducts();
            } catch (error) {
                console.error(error);
                showNotification('Error during bulk delete', 'error');
            }
        }
    };

    const handleBulkAvailability = async (isAvailable) => {
        if (selectedIds.length === 0) return;
        try {
            await Promise.all(selectedIds.map(id => fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({ isAvailable })
            })));
            showNotification(`${selectedIds.length} items marked as ${isAvailable ? 'Available' : 'Sold Out'}`);
            setSelectedIds([]);
            fetchProducts();
        } catch (error) {
            console.error(error);
            showNotification('Error updating items', 'error');
        }
    };

    const handleBulkCategoryChange = async () => {
        if (selectedIds.length === 0 || !bulkCategory) return;
        try {
            await Promise.all(selectedIds.map(id => fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({ category: bulkCategory })
            })));
            showNotification(`${selectedIds.length} items moved to ${bulkCategory}`);
            setSelectedIds([]);
            setBulkCategory('');
            fetchProducts();
        } catch (error) {
            console.error(error);
            showNotification('Error updating categories', 'error');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        window.location.reload();
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/admin/change-password`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify(passwordData)
            });
            const data = await res.json();
            if (res.ok) {
                showNotification('Password updated successfully!');
                setPasswordData({ currentPassword: '', newPassword: '' });
            } else {
                showNotification(data.message || 'Failed to update password', 'error');
            }
        } catch (error) {
            showNotification('Server error', 'error');
        }
    };

    const tabs = [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { id: 'orders', name: 'Live Orders', icon: ClipboardList },
        { id: 'menu', name: 'Menu Editor', icon: Utensils },
        { id: 'settings', name: 'Configurations', icon: Settings },
        { id: 'security', name: 'Security', icon: Shield }
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans selection:bg-primary/20">
            
            {/* LIGHT PREMIUM SIDEBAR */}
            <aside className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 z-50 w-[280px] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col shadow-2xl md:shadow-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Brand Logo Area */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-primary to-emerald-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                            <Utensils size={20} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-900 font-black tracking-wide leading-none text-[15px]">Beyond Heaven</span>
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Admin Portal</span>
                        </div>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 space-y-6">
                    <div>
                        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Main Menu</p>
                        <nav className="space-y-1">
                            {tabs.map(tab => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                                        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl font-medium transition-all duration-200 group ${
                                            isActive 
                                                ? 'bg-primary/10 text-primary relative' 
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <tab.icon size={18} className={isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'} />
                                            {tab.name}
                                        </div>
                                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div>
                        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Links</p>
                        <Link to="/" className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all group">
                            <ExternalLink size={18} className="text-gray-400 group-hover:text-gray-600" /> Go to Guest Menu
                        </Link>
                    </div>
                </div>

                {/* Logout Button Footer */}
                <div className="p-4 border-t border-gray-100 bg-white">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50/50">
                
                {/* Glassmorphism Top Header */}
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-6 sm:px-10 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-gray-500 hover:text-gray-900 bg-white shadow-sm border border-gray-200 p-2 rounded-xl">
                            <MenuIcon size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight capitalize">
                                {tabs.find(t => t.id === activeTab)?.name}
                            </h1>
                            <p className="text-xs text-gray-500 font-medium hidden sm:block">Manage your resort's operations efficiently</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm">
                        <div className="bg-primary/10 p-2 rounded-xl hidden sm:block">
                            <Home size={16} className="text-primary" />
                        </div>
                        <div className="relative">
                            <select 
                                value={selectedRestaurant?._id || ''} 
                                onChange={(e) => {
                                    const rest = restaurants.find(r => r._id === e.target.value);
                                    changeRestaurant(rest);
                                }}
                                className="appearance-none pl-3 pr-8 py-1.5 bg-transparent outline-none font-bold text-sm text-gray-800 w-[140px] sm:w-[180px] cursor-pointer"
                            >
                                <option value="" disabled>Select Hotel</option>
                                {restaurants.map(r => (
                                    <option key={r._id} value={r._id}>{r.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="w-full h-full p-6 sm:p-10 max-w-[1600px] mx-auto">
                        
                        {/* TAB: DASHBOARD */}
                        {activeTab === 'dashboard' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
                                
                                {/* Welcome Banner */}
                                <div className="bg-gradient-to-r from-primary to-emerald-500 rounded-[24px] p-8 sm:p-10 mb-8 text-white relative overflow-hidden shadow-lg shadow-primary/20">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                                    <h2 className="text-3xl font-black tracking-tight mb-2 relative z-10">Welcome back, Admin!</h2>
                                    <p className="text-primary-50 text-sm font-medium relative z-10 max-w-md">
                                        Here's what's happening at {selectedRestaurant?.name || 'your resort'} today. Check out the latest orders and revenue metrics.
                                    </p>
                                </div>

                                {/* Premium Stat Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    {[
                                        { title: 'Total Revenue', value: '₹24,500', trend: '+12.5%', isUp: true, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                        { title: 'Orders Today', value: '142', trend: '+8.2%', isUp: true, icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                        { title: 'Active Orders', value: '12', trend: '-2.4%', isUp: false, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                        { title: 'Menu Items', value: products.length, trend: 'Updated', isUp: true, icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                                            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity ${stat.bg}`}></div>
                                            <div className="flex justify-between items-start mb-6 relative z-10">
                                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                                    <stat.icon size={22} strokeWidth={2.5} />
                                                </div>
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {stat.trend}
                                                </span>
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                                                <h3 className="text-gray-500 text-sm font-semibold mt-1">{stat.title}</h3>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Charts & Tables Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Mock Chart */}
                                    <div className="lg:col-span-2 bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
                                                <p className="text-xs text-gray-400 font-medium mt-1">Daily income over the past week</p>
                                            </div>
                                            <select className="bg-gray-50 border border-gray-200 text-sm font-bold text-gray-700 rounded-xl px-4 py-2 outline-none hover:bg-gray-100 transition-colors cursor-pointer">
                                                <option>This Week</option>
                                                <option>This Month</option>
                                            </select>
                                        </div>
                                        <div className="h-64 flex items-end gap-3 sm:gap-6 pt-4 border-t border-gray-100">
                                            {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                                    <div className="w-full bg-emerald-50 rounded-xl relative transition-all duration-300 group-hover:bg-emerald-100" style={{ height: `${h}%` }}>
                                                        <div className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-emerald-400 rounded-xl transition-all shadow-sm" style={{ height: '100%' }}></div>
                                                        {/* Tooltip */}
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                                                            ₹{h * 100}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-400 font-bold uppercase">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Top Items */}
                                    <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-900 mb-6">Trending Items</h3>
                                        <div className="space-y-6">
                                            {products.slice(0, 5).map((p, i) => (
                                                <div key={i} className="flex items-center gap-4 group">
                                                    <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-shadow">
                                                        <img src={`https://source.unsplash.com/100x100/?food,${p.category}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm text-gray-900 truncate group-hover:text-primary transition-colors">{p.name}</p>
                                                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{p.category}</p>
                                                    </div>
                                                    <div className="text-right bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                                        <p className="font-black text-xs text-gray-700">{100 - i * 15}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        
                        {/* TAB 0: ORDERS */}
                        {activeTab === 'orders' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full">
                                <Orders isEmbedded={true} />
                            </motion.div>
                        )}

                        {/* TAB 1: MENU MANAGEMENT */}
                        {activeTab === 'menu' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-10 max-w-7xl mx-auto">
                                {!selectedRestaurant ? (
                                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[32px] shadow-sm border border-gray-100">
                                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                            <Utensils className="h-10 w-10 text-gray-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Hotel Selected</h3>
                                        <p className="text-gray-500 text-sm">Please select a hotel from the top dropdown to manage its menu.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* FLOATING FORM CARD */}
                                        <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-10 relative overflow-hidden">
                                            {/* Decorative Background */}
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                            
                                            <div className="flex items-center gap-3 mb-8 relative z-10">
                                                <div className={`p-3 rounded-2xl ${editId ? 'bg-blue-50 text-blue-500' : 'bg-primary/10 text-primary'}`}>
                                                    {editId ? <Edit size={20} /> : <Plus size={20} />}
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-gray-900">{editId ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
                                                    <p className="text-xs text-gray-500 font-medium mt-1">Configure details, pricing, and availability.</p>
                                                </div>
                                            </div>
                                            
                                            <form onSubmit={handleSubmit} className="relative z-10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                    <div className="relative">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Item Name</label>
                                                        <input 
                                                            name="name" value={formData.name} onChange={handleChange} 
                                                            placeholder="e.g. Chicken Biriyani" required 
                                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-gray-900 placeholder-gray-400" 
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Price (₹)</label>
                                                        <input 
                                                            name="price" type="number" value={formData.price} onChange={handleChange} 
                                                            placeholder="0.00" required 
                                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-gray-900 placeholder-gray-400" 
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Category</label>
                                                        <div className="relative">
                                                            <select 
                                                                name="category" value={formData.category} onChange={handleChange} 
                                                                className="w-full appearance-none px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-gray-900 cursor-pointer"
                                                            >
                                                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                            </select>
                                                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                    <div className="relative">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Image URL (Optional)</label>
                                                        <input 
                                                            name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} 
                                                            placeholder="e.g. https://example.com/image.jpg" 
                                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-gray-900 placeholder-gray-400" 
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-gray-100">
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div className={`w-12 h-6 rounded-full transition-colors relative ${formData.isAvailable ? 'bg-primary' : 'bg-gray-300'}`}>
                                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isAvailable ? 'left-7' : 'left-1'}`}></div>
                                                        </div>
                                                        <input 
                                                            type="checkbox" name="isAvailable"
                                                            checked={formData.isAvailable} onChange={handleChange} 
                                                            className="hidden"
                                                        />
                                                        <span className="font-bold text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Item is currently Available</span>
                                                    </label>
                                                    
                                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                                        {editId && (
                                                            <button type="button" onClick={() => { setEditId(null); setFormData({ name: '', price: '', category: 'BEVERAGES', isAvailable: true, imageUrl: '' })}} className="flex-1 sm:flex-none bg-white border border-gray-200 text-gray-700 px-8 py-3.5 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95">
                                                                Cancel
                                                            </button>
                                                        )}
                                                        <button type="submit" className="flex-1 sm:flex-none bg-primary text-white px-10 py-3.5 rounded-2xl font-bold hover:bg-primary-light shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                                                            {editId ? 'Save Changes' : 'Add Item'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>

                                        {/* DATA TABLE HEADER */}
                                        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">Menu List</h2>
                                                <p className="text-sm text-gray-500 font-medium mt-1">Managing {filteredProducts.length} items for this hotel.</p>
                                            </div>
                                            
                                            <div className="relative w-full md:w-96">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Search size={18} className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Search dishes or categories..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm transition-all text-sm font-medium"
                                                />
                                            </div>
                                        </div>
                            
                                        {/* STICKY BULK ACTIONS */}
                                        <AnimatePresence>
                                            {selectedIds.length > 0 && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                                    className="bg-white rounded-[20px] p-3 mb-6 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 sticky top-24 z-20"
                                                >
                                                    <div className="font-bold text-gray-900 px-4 flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-white">{selectedIds.length}</div>
                                                        Selected
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 items-center w-full lg:w-auto">
                                                        <button onClick={() => handleBulkAvailability(true)} className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                                                            <CheckCircle2 size={16} className="text-emerald-500" /> Available
                                                        </button>
                                                        <button onClick={() => handleBulkAvailability(false)} className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                                                            <AlertCircle size={16} className="text-rose-500" /> Sold Out
                                                        </button>
                                                        
                                                        <div className="flex items-center gap-2 border-l border-gray-200 pl-3 ml-1">
                                                            <div className="relative">
                                                                <select value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} className="appearance-none px-4 pr-8 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl outline-none text-xs font-bold cursor-pointer transition-all">
                                                                    <option value="" disabled className="text-gray-900">Move to Category...</option>
                                                                    {categories.map(cat => <option key={cat} value={cat} className="text-gray-900">{cat}</option>)}
                                                                </select>
                                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                            </div>
                                                            <button onClick={handleBulkCategoryChange} disabled={!bulkCategory} className="bg-primary disabled:bg-gray-300 disabled:text-gray-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-primary-light transition-all shadow-md">
                                                                Move
                                                            </button>
                                                        </div>
                                                        
                                                        <button onClick={handleBulkDelete} className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ml-auto lg:ml-2">
                                                            <Trash2 size={16} /> Delete
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                            
                                        {/* SAAS STYLE DATA TABLE */}
                                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden mb-10">
                                            <div className="overflow-x-auto custom-scrollbar">
                                                <table className="min-w-full text-left text-sm whitespace-nowrap">
                                                    <thead className="bg-gray-50/50 border-b border-gray-100">
                                                        <tr>
                                                            <th className="px-6 py-5 w-10">
                                                                <input type="checkbox" className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer accent-primary" checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0} onChange={handleSelectAll} />
                                                            </th>
                                                            <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Item Name</th>
                                                            <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Category</th>
                                                            <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Price</th>
                                                            <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                                                            <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {filteredProducts.map(product => {
                                                            const isSelected = selectedIds.includes(product._id);
                                                            return (
                                                                <tr key={product._id} className={`hover:bg-gray-50/80 transition-colors group ${isSelected ? 'bg-primary/5' : ''}`}>
                                                                    <td className="px-6 py-4">
                                                                        <input type="checkbox" className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer accent-primary" checked={isSelected} onChange={() => handleSelectOne(product._id)} />
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden shrink-0 hidden sm:block">
                                                                                <img src={product.imageUrl || `https://source.unsplash.com/100x100/?food,${product.category}`} className="w-full h-full object-cover" alt="" />
                                                                            </div>
                                                                            <span className="font-bold text-gray-900 text-[15px] group-hover:text-primary transition-colors">{product.name}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase">{product.category}</span>
                                                                    </td>
                                                                    <td className="px-6 py-4 font-black text-gray-900 text-[15px]">₹{product.price}</td>
                                                                    <td className="px-6 py-4">
                                                                        <button onClick={() => toggleAvailability(product)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${product.isAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}`}>
                                                                            <div className={`w-1.5 h-1.5 rounded-full ${product.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                                            {product.isAvailable ? 'Available' : 'Sold Out'}
                                                                        </button>
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <button onClick={() => handleEdit(product)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-xl transition-colors shadow-sm"><Edit size={16} /></button>
                                                                            <button onClick={() => handleDelete(product._id)} className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-2 rounded-xl transition-colors shadow-sm"><Trash2 size={16} /></button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                        {filteredProducts.length === 0 && (
                                                            <tr>
                                                                <td colSpan="6" className="px-6 py-16 text-center">
                                                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                        <Filter size={24} className="text-gray-400" />
                                                                    </div>
                                                                    <h3 className="text-lg font-bold text-gray-900 mb-1">No items found</h3>
                                                                    <p className="text-gray-500 text-sm">Try adjusting your search query or add a new item.</p>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {/* TAB 2: SETTINGS */}
                        {activeTab === 'settings' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto pb-24 space-y-8">
                                
                                {/* Hotel Properties Section */}
                                <div className="bg-white p-6 md:p-10 rounded-[32px] shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-500">
                                            <Home size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Hotel Properties</h2>
                                            <p className="text-sm text-gray-500 font-medium mt-1">Manage physical locations and resorts.</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleRestaurantSubmit} className="flex flex-col sm:flex-row gap-4 mb-10 bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                                        <div className="flex-1 relative">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Property Name</label>
                                            <input 
                                                name="name" value={restaurantFormData.name} onChange={(e) => setRestaurantFormData({ name: e.target.value })} 
                                                placeholder="e.g., Resort Beyond Heaven Wayanad" required 
                                                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-gray-900" 
                                            />
                                        </div>
                                        <div className="flex items-end gap-3 sm:pb-0 pb-2">
                                            <button type="submit" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
                                                {restaurantEditId ? <><Edit size={18}/> Update</> : <><Plus size={18}/> Add Property</>}
                                            </button>
                                            {restaurantEditId && (
                                                <button type="button" onClick={() => { setRestaurantEditId(null); setRestaurantFormData({ name: '' })}} className="bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </form>

                                    <div className="space-y-4">
                                        {restaurants.map((restaurant) => (
                                            <div key={restaurant._id} className={`flex items-center justify-between gap-4 border p-5 rounded-[20px] transition-all ${restaurant.isActive !== false ? 'bg-white border-blue-100 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-70 grayscale'}`}>
                                                <div className="flex-1 min-w-0 flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${restaurant.isActive !== false ? 'bg-blue-50 text-blue-500' : 'bg-gray-200 text-gray-400'}`}>
                                                        <MapPin size={18} />
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-[15px] truncate ${restaurant.isActive !== false ? 'text-gray-900' : 'text-gray-500 line-through'}`}>{restaurant.name}</p>
                                                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mt-1">{restaurant.isActive !== false ? 'Active Property' : 'Disabled Property'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                                                    <button onClick={() => toggleRestaurantStatus(restaurant)} className={`p-2 rounded-lg transition-colors ${restaurant.isActive !== false ? 'hover:bg-orange-100 hover:text-orange-600 text-gray-500' : 'hover:bg-green-100 hover:text-green-600 text-gray-500'}`} title={restaurant.isActive !== false ? 'Disable' : 'Enable'}>
                                                        {restaurant.isActive !== false ? <X size={18} /> : <Check size={18} />}
                                                    </button>
                                                    <button onClick={() => handleRestaurantEdit(restaurant)} className="p-2 rounded-lg hover:bg-blue-100 hover:text-blue-600 text-gray-500 transition-colors" title="Edit">
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={() => handleRestaurantDelete(restaurant._id)} className="p-2 rounded-lg hover:bg-rose-100 hover:text-rose-600 text-gray-500 transition-colors" title="Delete">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Service Charge Section */}
                                {selectedRestaurant && (
                                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 md:p-10 rounded-[32px] border border-orange-100/50 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -z-0"></div>
                                        
                                        <div className="flex items-center gap-4 mb-8 border-b border-orange-200/50 pb-6 relative z-10">
                                            <div className="p-3 bg-orange-100 rounded-2xl text-orange-600 shadow-inner">
                                                <DollarSign size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">Room Service Fees</h2>
                                                <p className="text-sm text-gray-600 font-medium mt-1">Configuring fees for <strong className="text-orange-600">{selectedRestaurant.name}</strong></p>
                                            </div>
                                        </div>
                                        
                                        <form onSubmit={handleServiceChargeSubmit} className="flex flex-col sm:flex-row items-end gap-5 relative z-10">
                                            <div className="flex flex-col flex-1 w-full relative">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Fee Status</label>
                                                <div className="flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-orange-100 w-full cursor-pointer shadow-sm hover:border-orange-300 transition-colors" onClick={() => setServiceChargeData({ ...serviceChargeData, enabled: !serviceChargeData.enabled })}>
                                                    <div className={`w-12 h-6 rounded-full transition-colors relative ${serviceChargeData.enabled ? 'bg-orange-500' : 'bg-gray-300'}`}>
                                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${serviceChargeData.enabled ? 'left-7' : 'left-1'}`}></div>
                                                    </div>
                                                    <span className="font-bold text-gray-800 select-none">Enable Additional Fees</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col flex-1 w-full relative">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Fixed Amount (₹)</label>
                                                <input 
                                                    type="number" 
                                                    value={serviceChargeData.amount} 
                                                    onChange={(e) => setServiceChargeData({ ...serviceChargeData, amount: Number(e.target.value) })} 
                                                    placeholder="e.g. 500" 
                                                    disabled={!serviceChargeData.enabled}
                                                    className="px-5 py-4 border border-orange-100 bg-white rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none disabled:opacity-50 transition-all w-full font-bold text-gray-900 shadow-sm" 
                                                />
                                            </div>
                                            <button type="submit" className="w-full sm:w-auto bg-orange-500 text-white px-10 py-4 rounded-2xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                                                Save Config
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* TAB 3: SECURITY */}
                        {activeTab === 'security' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto pb-24">
                                <div className="bg-white p-6 md:p-10 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                                    
                                    <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6 relative z-10">
                                        <div className="p-3 bg-rose-50 rounded-2xl text-rose-500">
                                            <Shield size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                                            <p className="text-gray-500 text-sm font-medium mt-1">Update your administrator password here.</p>
                                        </div>
                                    </div>
                                    
                                    <form onSubmit={handleChangePassword} className="flex flex-col gap-6 relative z-10">
                                        <div className="relative">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Current Password</label>
                                            <input 
                                                type="password" name="currentPassword" value={passwordData.currentPassword} 
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} 
                                                placeholder="Enter your current password" required 
                                                className="px-5 py-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all w-full font-medium" 
                                            />
                                        </div>
                                        <div className="relative">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">New Password</label>
                                            <input 
                                                type="password" name="newPassword" value={passwordData.newPassword} 
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                                                placeholder="Create a strong new password" required 
                                                className="px-5 py-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all w-full font-medium" 
                                            />
                                        </div>
                                        <div className="pt-4 border-t border-gray-100">
                                            <button type="submit" className="bg-rose-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all active:scale-95 w-full sm:w-auto">
                                                Update Password
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        )}

                    </div>
                </main>
            </div>
            
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Admin;
