import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, History, Printer, Edit, Plus, Minus, X, Search } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useRestaurant } from '../context/RestaurantContext';
import API_URL from '../api';

const Orders = ({ isEmbedded = false }) => {
    const { showNotification } = useNotification();
    const { selectedRestaurant, restaurants, changeRestaurant } = useRestaurant();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingOrder, setEditingOrder] = useState(null);
    const [products, setProducts] = useState([]);
    const [editSearchQuery, setEditSearchQuery] = useState('');

    const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
    };

    const authHeaderOnly = {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
    };

    const filteredEditProducts = useMemo(() => {
        if (!editSearchQuery.trim()) return products;
        const query = editSearchQuery.toLowerCase();
        return products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
        );
    }, [products, editSearchQuery]);

    const fetchProducts = async () => {
        if (!selectedRestaurant) return;
        try {
            const res = await fetch(`${API_URL}/products?restaurantId=${selectedRestaurant._id}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchOrders = async () => {
        if (!selectedRestaurant) {
            setOrders([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/orders?restaurantId=${selectedRestaurant._id}`, {
                headers: authHeaderOnly
            });
            if (!res.ok) throw new Error('Fetch failed');
            const data = await res.json();
            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
            showNotification('Failed to load recent orders', 'error');
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, [selectedRestaurant]);

    const handleEditOrder = (order) => {
        setEditingOrder(JSON.parse(JSON.stringify(order))); // Deep copy
    };

    const handleSaveOrder = async () => {
        try {
            const res = await fetch(`${API_URL}/orders/${editingOrder._id}`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({
                    items: editingOrder.items,
                    totalAmount: editingOrder.totalAmount
                })
            });
            if (!res.ok) throw new Error('Update failed');
            showNotification('Order updated successfully');
            setEditingOrder(null);
            fetchOrders();
        } catch (error) {
            console.error(error);
            showNotification('Failed to update order', 'error');
        }
    };

    const updateOrderItemQty = (itemName, delta) => {
        setEditingOrder(prev => {
            const newItems = [...prev.items];
            const itemIndex = newItems.findIndex(i => i.name === itemName);
            
            if (itemIndex >= 0) {
                newItems[itemIndex].qty += delta;
                if (newItems[itemIndex].qty <= 0) {
                    newItems.splice(itemIndex, 1);
                }
            }
            
            const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.qty), 0) + 500;
            return { ...prev, items: newItems, totalAmount: newTotal };
        });
    };

    const addProductToOrder = (product) => {
        setEditingOrder(prev => {
            const newItems = [...prev.items];
            const itemIndex = newItems.findIndex(i => i.name === product.name);
            
            if (itemIndex >= 0) {
                newItems[itemIndex].qty += 1;
            } else {
                newItems.push({ name: product.name, price: product.price, qty: 1 });
            }
            
            const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.qty), 0) + 500;
            return { ...prev, items: newItems, totalAmount: newTotal };
        });
    };

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/orders/${id}`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error('Update failed');
            showNotification(`Order marked as ${status}`);
            fetchOrders();
        } catch (error) {
            console.error(error);
            showNotification('Failed to update order status', 'error');
        }
    };

    const markPaymentReceived = async (id) => {
        try {
            const res = await fetch(`${API_URL}/orders/${id}/payment`, {
                method: 'PUT',
                headers: authHeaderOnly
            });
            if (!res.ok) throw new Error('Update failed');
            showNotification('Payment marked as received and email sent!');
            fetchOrders();
        } catch (error) {
            console.error(error);
            showNotification('Failed to update payment status', 'error');
        }
    };

    const deleteOrder = async (id) => {
        if (window.confirm('Are you sure you want to delete this order records?')) {
            try {
                const res = await fetch(`${API_URL}/orders/${id}`, {
                    method: 'DELETE',
                    headers: authHeaderOnly
                });
                if (!res.ok) throw new Error('Delete failed');
                showNotification('Order record deleted');
                fetchOrders();
            } catch (error) {
                console.error(error);
                showNotification('Could not delete order history', 'error');
            }
        }
    };

    const printBill = (order) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Bill - ${order.guestName}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                        
                        /* Removes default browser headers and footers (date, title, url) */
                        @page { 
                            size: auto;
                            margin: 0mm; 
                        }
                        
                        body { 
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
                            padding: 40px; 
                            max-width: 500px; 
                            margin: 0 auto; 
                            color: #1f2937; 
                            background: white;
                            -webkit-print-color-adjust: exact;
                        }
                        
                        .bill-wrapper {
                            padding: 20px;
                        }

                        h1 { 
                            text-align: center; 
                            font-size: 26px; 
                            margin: 0 0 6px 0; 
                            font-weight: 700;
                            letter-spacing: -0.5px;
                            color: #111827;
                            text-transform: uppercase;
                        }
                        
                        .subtitle { 
                            text-align: center; 
                            font-size: 12px; 
                            margin-bottom: 30px; 
                            color: #6b7280;
                            text-transform: uppercase;
                            letter-spacing: 2px;
                            font-weight: 600;
                        }
                        
                        .info-section {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 24px;
                            padding-bottom: 16px;
                            border-bottom: 1px solid #e5e7eb;
                        }

                        .info-block {
                            display: flex;
                            flex-direction: column;
                        }

                        .info-label {
                            font-size: 11px;
                            color: #6b7280;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            margin-bottom: 4px;
                            font-weight: 500;
                        }

                        .info-value {
                            font-weight: 600;
                            font-size: 14px;
                            color: #111827;
                        }
                        
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-bottom: 24px;
                        }
                        
                        th {
                            text-align: left; 
                            padding: 8px 0; 
                            font-size: 12px; 
                            color: #6b7280;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            border-bottom: 2px solid #e5e7eb;
                            font-weight: 600;
                        }

                        td { 
                            text-align: left; 
                            padding: 14px 0; 
                            font-size: 14px; 
                            border-bottom: 1px solid #f3f4f6;
                            color: #374151;
                            font-weight: 500;
                        }

                        .item-name {
                            font-weight: 600;
                            color: #111827;
                        }

                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                        
                        .total-section {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding-top: 16px;
                            border-top: 2px solid #111827;
                            margin-top: 8px;
                        }

                        .total-label {
                            font-size: 16px;
                            font-weight: 600;
                            color: #374151;
                            text-transform: uppercase;
                        }

                        .total-amount { 
                            font-size: 24px; 
                            font-weight: 700; 
                            text-align: right; 
                            color: #111827;
                        }

                        .footer {
                            margin-top: 50px;
                            text-align: center;
                            font-size: 13px;
                            color: #6b7280;
                        }
                        
                        .footer p { margin: 4px 0; }

                        @media print {
                            body { padding: 15px; max-width: 100%; }
                            .bill-wrapper { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="bill-wrapper">
                        <h1>Resort Beyond Heaven</h1>
                        <div class="subtitle">Guest Receipt</div>
                        
                        <div class="info-section">
                            <div class="info-block">
                                <span class="info-label">Guest Name</span>
                                <span class="info-value">${order.guestName}</span>
                            </div>
                            <div class="info-block text-right">
                                <span class="info-label">Date & Time</span>
                                <span class="info-value">${new Date(order.createdAt).toLocaleString()}</span>
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Item Summary</th>
                                    <th class="text-center">Qty</th>
                                    <th class="text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr>
                                        <td class="item-name">${item.name}</td>
                                        <td class="text-center">${item.qty}</td>
                                        <td class="text-right">₹${item.price * item.qty}</td>
                                    </tr>
                                `).join('')}
                                <tr>
                                    <td class="item-name" style="color: #6b7280; font-size: 13px;">Service Fee</td>
                                    <td class="text-center">-</td>
                                    <td class="text-right" style="color: #6b7280; font-size: 13px;">₹500</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div class="total-section">
                            <span class="total-label">Total Paid</span>
                            <span class="total-amount">₹${order.totalAmount}</span>
                        </div>

                        <div class="footer">
                            <p>Thank you for choosing Resort Beyond Heaven!</p>
                            <p>Have a wonderful stay.</p>
                        </div>
                    </div>
                    <script>
                        window.onload = function() { 
                            window.print(); 
                            setTimeout(function(){ window.close(); }, 500); 
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Calculate aggregated quantities of each dish across all Pending/Completed orders
    const dishCounts = useMemo(() => {
        const counts = {};
        orders.forEach(order => {
            // Include or exclude based on status if needed. Let's include everything except Cancelled.
            if (order.status !== 'Cancelled') {
                order.items.forEach(item => {
                    if (!counts[item.name]) {
                        counts[item.name] = 0;
                    }
                    counts[item.name] += item.qty;
                });
            }
        });
        
        // Convert to array and sort by highest count
        return Object.entries(counts).map(([name, qty]) => ({ name, qty }))
            .sort((a, b) => b.qty - a.qty);
    }, [orders]);

    return (
        <div className={isEmbedded ? "w-full" : "max-w-6xl mx-auto px-4 py-8"}>
            {!isEmbedded && (
                <>
                    <div className="mb-6">
                        <Link to="/" className="inline-flex items-center gap-2 text-green-700 font-medium hover:underline">
                            <ArrowLeft size={18} /> Back to Menu
                        </Link>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-4">
                        <h1 className="text-3xl font-bold text-gray-900">Orders Dashboard</h1>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full md:w-auto">
                            <label className="font-bold text-gray-700 whitespace-nowrap">Viewing Orders For:</label>
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
                    </div>
                </>
            )}

            {!selectedRestaurant ? (
                <div className="text-center py-20 text-gray-500">Please select a hotel from the top dropdown to view its orders.</div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
                
                {/* Orders List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Loading orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                            No orders received yet.
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-gray-50 pb-4">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <span className="font-extrabold text-lg text-gray-900">Guest: {order.guestName}</span>
                                            {order.email && <span className="text-sm font-medium text-gray-500">({order.email})</span>}
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                Status: {order.status}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                order.paymentStatus === 'Received' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                Payment: {order.paymentStatus || 'Pending'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock size={12} /> {new Date(order.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    
                                    {order.status === 'Pending' ? (
                                        <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                            <button 
                                                onClick={() => printBill(order)}
                                                className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 flex-1 sm:flex-none justify-center flex items-center gap-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                                            >
                                                <Printer size={16} /> Print Bill
                                            </button>
                                            
                                            {order.paymentStatus !== 'Received' && (
                                                <button 
                                                    onClick={() => markPaymentReceived(order._id)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
                                                >
                                                    Mark Payment Received
                                                </button>
                                            )}

                                            <button 
                                                onClick={() => updateStatus(order._id, 'Completed')}
                                                className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
                                            >
                                                Mark Complete
                                            </button>
                                            <button 
                                                onClick={() => updateStatus(order._id, 'Cancelled')}
                                                className="bg-red-50 text-red-700 hover:bg-red-100 flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                            <button 
                                                onClick={() => printBill(order)}
                                                className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 flex-1 sm:flex-none justify-center flex items-center gap-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                                            >
                                                <Printer size={16} /> Print Bill
                                            </button>
                                            <button 
                                                onClick={() => deleteOrder(order._id)}
                                                className="bg-gray-100 text-gray-500 hover:text-red-600 hover:bg-red-50 flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                                            >
                                                Delete Record
                                            </button>
                                        </div>
                                    )}
                                    {order.status === 'Pending' && (
                                        <button 
                                            onClick={() => handleEditOrder(order)}
                                            className="bg-orange-50 text-orange-700 hover:bg-orange-100 flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                                        >
                                            <Edit size={16} /> Edit Order
                                        </button>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-gray-700 text-sm">
                                            <span><span className="font-semibold">{item.qty}x</span> {item.name}</span>
                                            <span>₹{item.price * item.qty}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-gray-500 text-sm italic pt-2 border-t border-dashed">
                                        <span>Service Fee</span>
                                        <span>₹500</span>
                                    </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                                    <span className="text-gray-500 text-sm font-semibold">Total Paid</span>
                                    <span className="text-xl font-bold text-gray-900">₹{order.totalAmount}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Aggregation Stats */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Dish Tracking</h2>
                        
                        {dishCounts.length === 0 ? (
                            <p className="text-gray-500 text-sm">No dishes ordered yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {dishCounts.map((dish, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <span className="font-semibold text-gray-800">{dish.name}</span>
                                        <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                                            {dish.qty}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <p className="text-xs text-gray-400 mt-6 text-center">
                            Shows total amounts of dishes ordered across all active workflows. (Excludes cancelled)
                        </p>
                    </div>
                </div>

            </div>
            )}

            {/* Edit Order Modal */}
            {editingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold">Edit Order - {editingOrder.guestName}</h2>
                            <button onClick={() => setEditingOrder(null)} className="text-gray-500 hover:text-gray-800">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Current Items</h3>
                                <div className="space-y-3">
                                    {editingOrder.items.length === 0 ? (
                                        <p className="text-gray-500 italic">No items in order.</p>
                                    ) : editingOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                                            <div>
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-xs text-gray-500">₹{item.price}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => updateOrderItemQty(item.name, -1)} className="bg-red-100 text-red-600 p-1 rounded hover:bg-red-200">
                                                    <Minus size={14} />
                                                </button>
                                                <span className="font-bold w-4 text-center">{item.qty}</span>
                                                <button onClick={() => updateOrderItemQty(item.name, 1)} className="bg-green-100 text-green-600 p-1 rounded hover:bg-green-200">
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-4 border-t flex justify-between items-center text-gray-500 mb-2">
                                    <span className="font-medium text-sm">Service Fee</span>
                                    <span className="font-medium text-sm">₹500</span>
                                </div>
                                <div className="pt-2 border-t flex justify-between items-center">
                                    <span className="font-bold text-gray-700">New Total</span>
                                    <span className="font-bold text-2xl">₹{editingOrder.totalAmount}</span>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Add Products</h3>
                                
                                <div className="relative mb-4">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by name or category..."
                                        value={editSearchQuery}
                                        onChange={(e) => setEditSearchQuery(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm"
                                    />
                                </div>

                                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                                    {filteredEditProducts.length === 0 ? (
                                        <p className="text-gray-500 text-sm italic">No products found.</p>
                                    ) : (
                                        filteredEditProducts.map(product => (
                                            <div key={product._id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded border-b">
                                                <div>
                                                    <p className="font-medium text-sm">{product.name}</p>
                                                    <p className="text-xs text-gray-500">₹{product.price} - {product.category}</p>
                                                </div>
                                                <button 
                                                    onClick={() => addProductToOrder(product)}
                                                    className="bg-blue-50 text-blue-600 p-1.5 rounded hover:bg-blue-100 transition-colors"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-end">
                            <button 
                                onClick={() => setEditingOrder(null)}
                                className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveOrder}
                                className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
