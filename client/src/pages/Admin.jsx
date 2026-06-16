import { useState, useEffect, useMemo } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useRestaurant } from '../context/RestaurantContext';
import { Search, Plus, Edit, X, Trash2, CheckSquare, Square, Check, ToggleLeft } from 'lucide-react';
import API_URL from '../api';

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
        // Clear selections if search changes or products change
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
            const url = editId 
                ? `${API_URL}/products/${editId}` 
                : `${API_URL}/products`;
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
            const url = restaurantEditId 
                ? `${API_URL}/restaurants/${restaurantEditId}` 
                : `${API_URL}/restaurants`;
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

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <button onClick={handleLogout} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                    Logout
                </button>
            </div>

            {/* Password Change */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-10">
                <h2 className="text-xl font-bold mb-4">Change Admin Password</h2>
                <form onSubmit={handleChangePassword} className="flex flex-col sm:flex-row gap-4 mb-2">
                    <input 
                        type="password" name="currentPassword" value={passwordData.currentPassword} 
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} 
                        placeholder="Current Password" required 
                        className="flex-1 px-4 py-3 sm:py-2 border rounded-lg focus:ring-green-500 w-full" 
                    />
                    <input 
                        type="password" name="newPassword" value={passwordData.newPassword} 
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                        placeholder="New Password" required 
                        className="flex-1 px-4 py-3 sm:py-2 border rounded-lg focus:ring-green-500 w-full" 
                    />
                    <button type="submit" className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700">
                        Update Password
                    </button>
                </form>
            </div>

            {/* Restaurant Management */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-10">
                <h2 className="text-xl font-bold mb-4">Manage Restaurants</h2>
                <form onSubmit={handleRestaurantSubmit} className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input 
                        name="name" value={restaurantFormData.name} onChange={(e) => setRestaurantFormData({ name: e.target.value })} 
                        placeholder="Restaurant Name" required 
                        className="flex-1 px-4 py-3 sm:py-2 border rounded-lg focus:ring-green-500 w-full" 
                    />
                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2">
                        {restaurantEditId ? <><Edit size={16}/> Update</> : <><Plus size={16}/> Add</>}
                    </button>
                    {restaurantEditId && (
                        <button type="button" onClick={() => { setRestaurantEditId(null); setRestaurantFormData({ name: '' })}} className="bg-gray-400 text-white px-6 py-2 rounded-lg font-bold">
                            Cancel
                        </button>
                    )}
                </form>

                <div className="flex flex-wrap gap-2">
                    {restaurants.map((restaurant) => (
                        <div key={restaurant._id} className={`flex items-center gap-2 border px-4 py-2 rounded-lg ${restaurant.isActive !== false ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                            <span className={`font-medium ${restaurant.isActive !== false ? 'text-green-800' : 'text-gray-500 line-through'}`}>{restaurant.name}</span>
                            <button onClick={() => toggleRestaurantStatus(restaurant)} className={`text-xs px-2 py-1 rounded font-bold ${restaurant.isActive !== false ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'} ml-2`}>
                                {restaurant.isActive !== false ? 'Disable' : 'Enable'}
                            </button>
                            <button onClick={() => handleRestaurantEdit(restaurant)} className="text-blue-600 hover:text-blue-800 ml-2">
                                <Edit size={14} />
                            </button>
                            <button onClick={() => handleRestaurantDelete(restaurant._id)} className="text-red-500 hover:text-red-700 ml-1">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Select Restaurant Context */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="font-bold text-gray-700">Managing Menu For:</label>
                <select 
                    value={selectedRestaurant?._id || ''} 
                    onChange={(e) => {
                        const rest = restaurants.find(r => r._id === e.target.value);
                        changeRestaurant(rest);
                    }}
                    className="px-4 py-3 sm:py-2 border rounded-lg focus:ring-green-500 w-full sm:min-w-[250px]"
                >
                    <option value="" disabled>Select a restaurant</option>
                    {restaurants.map(r => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                </select>
            </div>

            {selectedRestaurant && (
                <>
                
            {/* Service Charge Settings */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 mb-10">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Service Charge for {selectedRestaurant.name}</h2>
                <form onSubmit={handleServiceChargeSubmit} className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                            <input 
                                type="checkbox" id="serviceChargeEnabled"
                                checked={serviceChargeData.enabled} 
                                onChange={(e) => setServiceChargeData({ ...serviceChargeData, enabled: e.target.checked })}
                                className="w-5 h-5 text-orange-600 rounded"
                            />
                            <label htmlFor="serviceChargeEnabled" className="text-sm font-bold text-gray-700">Enable Service Charge / Delivery Fee</label>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-sm font-bold text-gray-700">Amount (₹)</label>
                        <input 
                            type="number" 
                            value={serviceChargeData.amount} 
                            onChange={(e) => setServiceChargeData({ ...serviceChargeData, amount: Number(e.target.value) })} 
                            placeholder="e.g. 500" 
                            disabled={!serviceChargeData.enabled}
                            className="px-4 py-3 border rounded-lg focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-400" 
                        />
                    </div>
                    <button type="submit" className="bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 h-[50px]">
                        Save Settings
                    </button>
                </form>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-10">
                <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Item' : 'Add New Item'}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        name="name" value={formData.name} onChange={handleChange} 
                        placeholder="Item Name" required 
                        className="px-4 py-2 border rounded-lg focus:ring-green-500" 
                    />
                    <input 
                        name="price" type="number" value={formData.price} onChange={handleChange} 
                        placeholder="Price" required 
                        className="px-4 py-2 border rounded-lg focus:ring-green-500" 
                    />
                    <select 
                        name="category" value={formData.category} onChange={handleChange} 
                        className="px-4 py-2 border rounded-lg focus:ring-green-500"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <div className="flex items-center space-x-2 md:col-span-2">
                        <input 
                            type="checkbox" name="isAvailable" id="isAvailable"
                            checked={formData.isAvailable} onChange={handleChange} 
                            className="w-5 h-5 text-green-600 rounded"
                        />
                        <label htmlFor="isAvailable" className="font-medium">Is Available?</label>
                    </div>
                    <div className="md:col-span-2 flex gap-4 mt-2">
                        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">
                            {editId ? 'Update Item' : 'Add Item'}
                        </button>
                        {editId && (
                            <button type="button" onClick={() => { setEditId(null); setFormData({ name: '', price: '', category: 'Vegetarian', isAvailable: true })}} className="bg-gray-400 text-white px-6 py-2 rounded-lg font-bold">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold">Menu Items ({filteredProducts.length})</h2>
                
                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all sm:text-sm shadow-sm"
                    />
                </div>
            </div>

            {/* Bulk Actions */}
            <div className={`bg-blue-50 border ${selectedIds.length > 0 ? 'border-blue-300 shadow-md' : 'border-blue-100 opacity-70'} rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 transition-all`}>
                <div className={`font-bold ${selectedIds.length > 0 ? 'text-blue-800' : 'text-gray-500'}`}>
                    {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
                </div>
                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                    <button 
                        onClick={() => handleBulkAvailability(true)} 
                        disabled={selectedIds.length === 0}
                        className="bg-white border border-blue-200 text-green-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
                    >
                        <Check size={16} /> Mark Available
                    </button>
                    <button 
                        onClick={() => handleBulkAvailability(false)} 
                        disabled={selectedIds.length === 0}
                        className="bg-white border border-blue-200 text-orange-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
                    >
                        <X size={16} /> Mark Sold Out
                    </button>
                    
                    <div className="flex items-center gap-1 border-l border-blue-200 pl-2 ml-1">
                        <select 
                            value={bulkCategory} 
                            onChange={(e) => setBulkCategory(e.target.value)}
                            disabled={selectedIds.length === 0}
                            className="px-2 py-2 border rounded-lg focus:ring-blue-500 text-sm disabled:opacity-50"
                        >
                            <option value="" disabled>Change Category</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <button 
                            onClick={handleBulkCategoryChange} 
                            disabled={selectedIds.length === 0 || !bulkCategory} 
                            className="bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm"
                        >
                            Apply
                        </button>
                    </div>
                    
                    <button 
                        onClick={handleBulkDelete} 
                        disabled={selectedIds.length === 0}
                        className="bg-white border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm ml-auto md:ml-2"
                    >
                        <Trash2 size={16} /> Delete Selected
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 mb-20">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="px-6 py-3 w-10">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 text-green-600 rounded border-gray-300"
                                    checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map(product => (
                            <tr key={product._id} className={`hover:bg-gray-50 ${selectedIds.includes(product._id) ? 'bg-blue-50/50' : ''}`}>
                                <td className="px-6 py-4">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 text-green-600 rounded border-gray-300"
                                        checked={selectedIds.includes(product._id)}
                                        onChange={() => handleSelectOne(product._id)}
                                    />
                                </td>
                                <td className="px-6 py-4 font-medium">{product.name}</td>
                                <td className="px-6 py-4">₹{product.price}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{product.category}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => toggleAvailability(product)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${product.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                    >
                                        {product.isAvailable ? 'Available' : 'Sold Out'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button onClick={() => handleEdit(product)} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 font-medium transition-colors">Edit</button>
                                    <button onClick={() => handleDelete(product._id)} className="bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 font-medium transition-colors">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </>
            )}
        </div>
    );
};

export default Admin;
