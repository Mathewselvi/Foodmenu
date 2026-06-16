import { useState, useEffect, useMemo } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useRestaurant } from '../context/RestaurantContext';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, X, Trash2, Check, Utensils, Settings, Shield, LogOut, Menu as MenuIcon, ClipboardList, Home } from 'lucide-react';
import API_URL from '../api';
import Orders from './Orders';

const Admin = () => {
    const { showNotification } = useNotification();
    const { selectedRestaurant, restaurants, changeRestaurant, setRestaurants } = useRestaurant();
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: '', price: '', category: 'BEVERAGES', isAvailable: true
    });
    const [restaurantFormData, setRestaurantFormData] = useState({ name: '' });
    const [restaurantEditId, setRestaurantEditId] = useState(null);
    const [serviceChargeData, setServiceChargeData] = useState({ enabled: true, amount: 500 });
    const [editId, setEditId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkCategory, setBulkCategory] = useState('');
    
    // Dashboard States
    const [activeTab, setActiveTab] = useState('orders');
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
            setFormData({ name: '', price: '', category: 'BEVERAGES', isAvailable: true });
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
        { id: 'orders', name: 'Live Orders', icon: ClipboardList },
        { id: 'menu', name: 'Menu Items', icon: Utensils },
        { id: 'settings', name: 'Restaurant Settings', icon: Settings },
        { id: 'security', name: 'Security', icon: Shield }
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            
            {/* Sidebar Navigation */}
            <aside className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-green-700 tracking-tight flex items-center gap-2">
                            <span className="bg-green-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm">B</span> 
                            Beyond <span className="text-gray-800">Heaven</span>
                        </h2>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1 ml-10">FoodMenu Dashboard</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1">
                    <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 mb-4 rounded-lg font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                        <Home size={18} className="text-blue-600" /> Go to Live Menu
                    </Link>
                    
                    <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-2">Dashboard</p>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${activeTab === tab.id ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <tab.icon size={18} className={activeTab === tab.id ? 'text-green-600' : 'text-gray-400'} />
                            {tab.name}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                        <LogOut size={18} className="text-gray-400" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Layout */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                
                {/* Header Navbar */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-gray-500 hover:text-gray-900">
                            <MenuIcon size={20} />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
                            {tabs.find(t => t.id === activeTab)?.name}
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500 hidden md:block">Managing Menu For:</span>
                        <div className="relative">
                            <select 
                                value={selectedRestaurant?._id || ''} 
                                onChange={(e) => {
                                    const rest = restaurants.find(r => r._id === e.target.value);
                                    changeRestaurant(rest);
                                }}
                                className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 hover:border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none font-medium text-sm text-gray-900 min-w-[160px] shadow-sm cursor-pointer transition-all"
                            >
                                <option value="" disabled>Select Hotel</option>
                                {restaurants.map(r => (
                                    <option key={r._id} value={r._id}>{r.name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="w-full h-full">
                        
                        {/* TAB 0: ORDERS */}
                        {activeTab === 'orders' && (
                            <div className="animate-fade-in-up h-full">
                                <Orders isEmbedded={true} />
                            </div>
                        )}

                        {/* TAB 1: MENU MANAGEMENT */}
                        {activeTab === 'menu' && (
                            <div className="animate-fade-in-up p-4 sm:p-8 max-w-6xl mx-auto pb-24">
                                {!selectedRestaurant ? (
                                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                                        <Utensils className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                        <h3 className="text-xl font-bold text-gray-600">Please select a hotel from the top dropdown to manage its menu.</h3>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                                            <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                                                {editId ? <Edit size={20} className="text-blue-500"/> : <Plus size={20} className="text-green-500"/>} 
                                                {editId ? 'Edit Menu Item' : 'Add New Menu Item'}
                                            </h2>
                                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <input 
                                                    name="name" value={formData.name} onChange={handleChange} 
                                                    placeholder="Item Name" required 
                                                    className="px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all" 
                                                />
                                                <input 
                                                    name="price" type="number" value={formData.price} onChange={handleChange} 
                                                    placeholder="Price (₹)" required 
                                                    className="px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all" 
                                                />
                                                <select 
                                                    name="category" value={formData.category} onChange={handleChange} 
                                                    className="px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all cursor-pointer"
                                                >
                                                    {categories.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                            
                                                <div className="flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                                                    <input 
                                                        type="checkbox" name="isAvailable" id="isAvailable"
                                                        checked={formData.isAvailable} onChange={handleChange} 
                                                        className="w-5 h-5 text-green-600 rounded cursor-pointer"
                                                    />
                                                    <label htmlFor="isAvailable" className="font-bold text-gray-700 cursor-pointer">Item is Available</label>
                                                </div>
                                                <div className="md:col-span-2 flex gap-4 mt-2">
                                                    <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-md shadow-green-600/20 transition-all">
                                                        {editId ? 'Update Item' : 'Save Item'}
                                                    </button>
                                                    {editId && (
                                                        <button type="button" onClick={() => { setEditId(null); setFormData({ name: '', price: '', category: 'BEVERAGES', isAvailable: true })}} className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all">
                                                            Cancel Edit
                                                        </button>
                                                    )}
                                                </div>
                                            </form>
                                        </div>

                                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                                            <h2 className="text-xl font-bold text-gray-800">Menu List <span className="text-gray-400 text-sm ml-2">({filteredProducts.length} items)</span></h2>
                                            <div className="relative w-full md:w-80">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Search size={18} className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Search menu..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm transition-all"
                                                />
                                            </div>
                                        </div>
                            
                                        {/* Bulk Actions */}
                                        <div className={`bg-white border ${selectedIds.length > 0 ? 'border-blue-200 shadow-md ring-1 ring-blue-100' : 'border-gray-100 opacity-60'} rounded-xl p-4 mb-6 flex flex-col lg:flex-row items-center justify-between gap-4 transition-all duration-300`}>
                                            <div className={`font-black ${selectedIds.length > 0 ? 'text-blue-700' : 'text-gray-400'}`}>
                                                {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
                                            </div>
                                            <div className="flex flex-wrap gap-2 items-center w-full lg:w-auto">
                                                <button onClick={() => handleBulkAvailability(true)} disabled={selectedIds.length === 0} className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-100 disabled:opacity-50 flex items-center gap-2">
                                                    <Check size={16} /> Mark Available
                                                </button>
                                                <button onClick={() => handleBulkAvailability(false)} disabled={selectedIds.length === 0} className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-100 disabled:opacity-50 flex items-center gap-2">
                                                    <X size={16} /> Mark Sold Out
                                                </button>
                                                
                                                <div className="flex items-center gap-2 border-l border-gray-200 pl-3 ml-1">
                                                    <select value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} disabled={selectedIds.length === 0} className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-blue-500 text-sm font-bold disabled:opacity-50 cursor-pointer">
                                                        <option value="" disabled>Move to Category...</option>
                                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                    </select>
                                                    <button onClick={handleBulkCategoryChange} disabled={selectedIds.length === 0 || !bulkCategory} className="bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all">
                                                        Move
                                                    </button>
                                                </div>
                                                
                                                <button onClick={handleBulkDelete} disabled={selectedIds.length === 0} className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 disabled:opacity-50 flex items-center gap-2 ml-auto lg:ml-2">
                                                    <Trash2 size={16} /> Delete
                                                </button>
                                            </div>
                                        </div>
                            
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full text-left text-sm">
                                                    <thead className="bg-gray-50/80 text-gray-600 font-bold border-b border-gray-100">
                                                        <tr>
                                                            <th className="px-6 py-4 w-10">
                                                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded border-gray-300 cursor-pointer" checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0} onChange={handleSelectAll} />
                                                            </th>
                                                            <th className="px-6 py-4">Item Name</th>
                                                            <th className="px-6 py-4">Price</th>
                                                            <th className="px-6 py-4">Category</th>
                                                            <th className="px-6 py-4">Status</th>
                                                            <th className="px-6 py-4">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {filteredProducts.map(product => (
                                                            <tr key={product._id} className={`hover:bg-gray-50/80 transition-colors ${selectedIds.includes(product._id) ? 'bg-blue-50/30' : ''}`}>
                                                                <td className="px-6 py-4">
                                                                    <input type="checkbox" className="w-4 h-4 text-green-600 rounded border-gray-300 cursor-pointer" checked={selectedIds.includes(product._id)} onChange={() => handleSelectOne(product._id)} />
                                                                </td>
                                                                <td className="px-6 py-4 font-bold text-gray-800">{product.name}</td>
                                                                <td className="px-6 py-4 font-medium text-gray-600">₹{product.price}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide">{product.category}</span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <button onClick={() => toggleAvailability(product)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${product.isAvailable ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
                                                                        {product.isAvailable ? 'Available' : 'Sold Out'}
                                                                    </button>
                                                                </td>
                                                                <td className="px-6 py-4 flex gap-3">
                                                                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-lg transition-colors"><Edit size={16} /></button>
                                                                    <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {filteredProducts.length === 0 && (
                                                            <tr>
                                                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">No menu items found.</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* TAB 2: SETTINGS */}
                        {activeTab === 'settings' && (
                            <div className="animate-fade-in-up max-w-4xl p-4 sm:p-8 mx-auto pb-24">
                                
                                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                                    <h2 className="text-xl font-bold mb-6 text-gray-800">Add / Edit Hotel Property</h2>
                                    <form onSubmit={handleRestaurantSubmit} className="flex flex-col sm:flex-row gap-4 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                                        <input 
                                            name="name" value={restaurantFormData.name} onChange={(e) => setRestaurantFormData({ name: e.target.value })} 
                                            placeholder="Property Name (e.g., Resort Beyond Heaven Wayanad)" required 
                                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all" 
                                        />
                                        <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-md shadow-green-600/20 transition-all">
                                            {restaurantEditId ? <><Edit size={18}/> Update</> : <><Plus size={18}/> Add Property</>}
                                        </button>
                                        {restaurantEditId && (
                                            <button type="button" onClick={() => { setRestaurantEditId(null); setRestaurantFormData({ name: '' })}} className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all">
                                                Cancel
                                            </button>
                                        )}
                                    </form>

                                    <h3 className="font-bold text-gray-700 mb-4">All Hotel Properties</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {restaurants.map((restaurant) => (
                                            <div key={restaurant._id} className={`flex items-center justify-between gap-4 border p-4 rounded-xl transition-all ${restaurant.isActive !== false ? 'bg-white border-green-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-bold truncate ${restaurant.isActive !== false ? 'text-gray-900' : 'text-gray-500 line-through'}`}>{restaurant.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{restaurant.isActive !== false ? 'Active Property' : 'Disabled Property'}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => toggleRestaurantStatus(restaurant)} className={`p-2 rounded-lg transition-colors ${restaurant.isActive !== false ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`} title={restaurant.isActive !== false ? 'Disable' : 'Enable'}>
                                                        {restaurant.isActive !== false ? <X size={18} /> : <Check size={18} />}
                                                    </button>
                                                    <button onClick={() => handleRestaurantEdit(restaurant)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Edit">
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={() => handleRestaurantDelete(restaurant._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Delete">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedRestaurant && (
                                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-orange-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-0"></div>
                                        <h2 className="text-xl font-bold mb-2 text-gray-800 relative z-10">Service Charge / Delivery Fee</h2>
                                        <p className="text-gray-500 mb-6 text-sm relative z-10">Configuring fees for <strong className="text-orange-600">{selectedRestaurant.name}</strong></p>
                                        
                                        <form onSubmit={handleServiceChargeSubmit} className="flex flex-col sm:flex-row items-end gap-5 relative z-10">
                                            <div className="flex flex-col gap-3 flex-1 w-full">
                                                <label className="text-sm font-bold text-gray-700">Fee Status</label>
                                                <div className="flex items-center gap-3 bg-gray-50 px-5 py-3.5 rounded-xl border border-gray-200 w-full cursor-pointer" onClick={() => setServiceChargeData({ ...serviceChargeData, enabled: !serviceChargeData.enabled })}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={serviceChargeData.enabled} 
                                                        readOnly
                                                        className="w-5 h-5 text-orange-600 rounded pointer-events-none"
                                                    />
                                                    <span className="font-bold text-gray-700 select-none">Enable Extra Fees</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3 flex-1 w-full">
                                                <label className="text-sm font-bold text-gray-700">Fee Amount (₹)</label>
                                                <input 
                                                    type="number" 
                                                    value={serviceChargeData.amount} 
                                                    onChange={(e) => setServiceChargeData({ ...serviceChargeData, amount: Number(e.target.value) })} 
                                                    placeholder="e.g. 500" 
                                                    disabled={!serviceChargeData.enabled}
                                                    className="px-5 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none disabled:opacity-50 transition-all w-full" 
                                                />
                                            </div>
                                            <button type="submit" className="w-full sm:w-auto bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-orange-700 shadow-md shadow-orange-600/20 transition-all h-[54px]">
                                                Save Fees
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: SECURITY */}
                        {activeTab === 'security' && (
                            <div className="animate-fade-in-up max-w-2xl p-4 sm:p-8 mx-auto pb-24">
                                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-red-50 rounded-xl text-red-500">
                                            <Shield size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Change Admin Password</h2>
                                            <p className="text-gray-500 text-sm">Ensure your account is using a long, random password to stay secure.</p>
                                        </div>
                                    </div>
                                    
                                    <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-gray-700">Current Password</label>
                                            <input 
                                                type="password" name="currentPassword" value={passwordData.currentPassword} 
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} 
                                                placeholder="Enter current password" required 
                                                className="px-5 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all w-full" 
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-gray-700">New Password</label>
                                            <input 
                                                type="password" name="newPassword" value={passwordData.newPassword} 
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                                                placeholder="Enter new password" required 
                                                className="px-5 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all w-full" 
                                            />
                                        </div>
                                        <button type="submit" className="mt-2 bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 shadow-md shadow-red-600/20 transition-all self-start">
                                            Update Password
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>
            
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default Admin;
