import { useState, useEffect, useMemo } from 'react';
import { useNotification } from '../context/NotificationContext';
import { Search } from 'lucide-react';
import API_URL from '../api';

const Admin = () => {
    const { showNotification } = useNotification();
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: '', price: '', category: 'BEVERAGES', isAvailable: true
    });
    const [editId, setEditId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        const query = searchQuery.toLowerCase();
        return products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
        );
    }, [products, searchQuery]);

    const categories = [
        'BEVERAGES', 'SANDWICH', 'BREAKFAST', 'SHORT BITES', 'SOUPS', 
        'SALADS', 'EGG BASKET', 'RICE / MEALS', 'RAITA', 'ROTIS', 
        'BIRIYANI', 'FRIED RICE', 'NOODLES', 'VEG CURRY', 'BEEF', 
        'MUTTON', 'TANDOORI', 'SHAWARMA', 'SHAWAYA', 'MASALA SHAWAYA', 
        'CHICKEN SPECIAL', 'ALFAHAM', 'LIME JUICE', 'FRESH PULP', 
        'SIGNATURE', 'LASSI', 'MILKSHAKE', 'SUNDAES'
    ];

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_URL}/products`);
            if (!res.ok) throw new Error('Fetch failed');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error(error);
            showNotification('Failed to load menu items', 'error');
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

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

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
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
                const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
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
                headers: { 'Content-Type': 'application/json' },
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

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">Admin Dashboard</h1>
            
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

            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 mb-20">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>

                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map(product => (
                            <tr key={product._id} className="hover:bg-gray-50">

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
        </div>
    );
};

export default Admin;
