import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Printer, Edit, Plus, Minus, X, Search, ShoppingBag, Activity, CheckCircle2, XCircle, TrendingUp, DollarSign, MoreVertical } from 'lucide-react';
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
                        @page { size: auto; margin: 0mm; }
                        body { font-family: 'Inter', sans-serif; padding: 40px; max-width: 500px; margin: 0 auto; color: #111827; }
                        h1 { text-align: center; font-size: 26px; margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase; }
                        .subtitle { text-align: center; font-size: 12px; margin-bottom: 30px; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; }
                        .info-section { display: flex; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
                        .info-block { display: flex; flex-direction: column; }
                        .info-label { font-size: 11px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; font-weight: 500; }
                        .info-value { font-weight: 600; font-size: 14px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
                        th { text-align: left; padding: 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb; }
                        td { text-align: left; padding: 14px 0; font-size: 14px; border-bottom: 1px solid #f3f4f6; font-weight: 500; }
                        .item-name { font-weight: 600; }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                        .total-section { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 2px solid #111827; margin-top: 8px; }
                        .total-label { font-size: 16px; font-weight: 600; text-transform: uppercase; }
                        .total-amount { font-size: 24px; font-weight: 700; text-align: right; }
                        .footer { margin-top: 50px; text-align: center; font-size: 13px; color: #6b7280; }
                        @media print { body { padding: 15px; max-width: 100%; } }
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
                        </div>
                    </div>
                    <script>window.onload = function() { window.print(); setTimeout(function(){ window.close(); }, 500); }</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Calculate aggregated quantities of each dish across all Pending/Completed orders
    const dishStats = useMemo(() => {
        const counts = {};
        let maxQty = 0;
        orders.forEach(order => {
            if (order.status !== 'Cancelled') {
                order.items.forEach(item => {
                    if (!counts[item.name]) {
                        counts[item.name] = { qty: 0, revenue: 0 };
                    }
                    counts[item.name].qty += item.qty;
                    counts[item.name].revenue += item.price * item.qty;
                    if (counts[item.name].qty > maxQty) maxQty = counts[item.name].qty;
                });
            }
        });
        
        const sorted = Object.entries(counts).map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.qty - a.qty);
            
        return { items: sorted, maxQty };
    }, [orders]);

    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0,0,0,0);
        
        let total = 0, active = 0, completed = 0, cancelled = 0;
        orders.forEach(o => {
            const orderDate = new Date(o.createdAt);
            if (orderDate >= today) total++;
            if (o.status === 'Pending') active++;
            if (o.status === 'Completed') completed++;
            if (o.status === 'Cancelled') cancelled++;
        });

        return { total, active, completed, cancelled };
    }, [orders]);

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Pending': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock size={12}/> Pending</span>;
            case 'Completed': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 size={12}/> Completed</span>;
            case 'Cancelled': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200"><XCircle size={12}/> Cancelled</span>;
            default: return null;
        }
    };

    const getPaymentBadge = (status) => {
        return status === 'Received' 
            ? <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-semibold bg-green-50 text-green-700 uppercase tracking-wider">Paid</span>
            : <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-semibold bg-gray-100 text-gray-600 uppercase tracking-wider">Unpaid</span>;
    };

    return (
        <div className={isEmbedded ? "w-full p-6 sm:p-8" : "max-w-7xl mx-auto px-4 py-8"}>
            {!isEmbedded && (
                <>
                    <div className="mb-6">
                        <Link to="/" className="inline-flex items-center gap-2 text-green-700 font-medium hover:text-green-800 transition-colors">
                            <ArrowLeft size={18} /> Back to Menu
                        </Link>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 pb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Orders Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage live orders and track performance.</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
                            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Viewing Orders For:</label>
                            <select 
                                value={selectedRestaurant?._id || ''} 
                                onChange={(e) => {
                                    const rest = restaurants.find(r => r._id === e.target.value);
                                    changeRestaurant(rest);
                                }}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm font-medium shadow-sm transition-all w-full sm:w-auto"
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
                <div className="flex flex-col items-center justify-center py-24 px-4 bg-white rounded-xl shadow-sm border border-gray-200 border-dashed">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No Hotel Selected</h3>
                    <p className="text-gray-500 text-center max-w-md">Please select a hotel from the dropdown menu to view its live orders and analytics.</p>
                </div>
            ) : (
            <div className="animate-fade-in-up">
                
                {/* 4-Column Analytics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Orders Today</p>
                            <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <ShoppingBag size={24} />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Active Orders</p>
                            <h3 className="text-3xl font-bold text-gray-900">{stats.active}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <Activity size={24} />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Completed</p>
                            <h3 className="text-3xl font-bold text-gray-900">{stats.completed}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Cancelled</p>
                            <h3 className="text-3xl font-bold text-gray-900">{stats.cancelled}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                            <XCircle size={24} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    
                    {/* Orders Table */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{orders.length} Total</span>
                        </div>
                        
                        {loading ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex justify-center">
                                <div className="animate-pulse flex space-x-4">
                                    <div className="flex-1 space-y-4 py-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 rounded"></div>
                                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <ShoppingBag className="text-gray-400 w-8 h-8" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">No orders yet</h3>
                                <p className="text-sm text-gray-500">When orders come in, they will appear here.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative z-0">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase tracking-wider sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-4">Order Details</th>
                                                <th className="px-6 py-4">Ordered Items</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {orders.map(order => (
                                                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-gray-900">{order.guestName}</span>
                                                            <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                                <Clock size={12}/> {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 align-top">
                                                        <div className="flex flex-col gap-1.5 max-w-[200px] whitespace-normal">
                                                            {order.items.map((item, idx) => (
                                                                <div key={idx} className="flex items-start text-sm">
                                                                    <span className="font-bold text-gray-900 mr-2 min-w-[24px]">{item.qty}x</span>
                                                                    <span className="text-gray-600 leading-tight">{item.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col items-start gap-1">
                                                            <span className="font-bold text-gray-900">₹{order.totalAmount}</span>
                                                            {getPaymentBadge(order.paymentStatus)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(order.status)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => printBill(order)}
                                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors tooltip-trigger"
                                                                title="Print Bill"
                                                            >
                                                                <Printer size={18} />
                                                            </button>
                                                            
                                                            {order.status === 'Pending' && (
                                                                <>
                                                                    <button 
                                                                        onClick={() => handleEditOrder(order)}
                                                                        className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                                                                        title="Edit Order"
                                                                    >
                                                                        <Edit size={18} />
                                                                    </button>
                                                                    {order.paymentStatus !== 'Received' && (
                                                                        <button 
                                                                            onClick={() => markPaymentReceived(order._id)}
                                                                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                                                            title="Mark Paid"
                                                                        >
                                                                            <DollarSign size={18} />
                                                                        </button>
                                                                    )}
                                                                    <button 
                                                                        onClick={() => updateStatus(order._id, 'Completed')}
                                                                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                                        title="Mark Complete"
                                                                    >
                                                                        <CheckCircle2 size={18} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => updateStatus(order._id, 'Cancelled')}
                                                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                                        title="Cancel Order"
                                                                    >
                                                                        <XCircle size={18} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            
                                                            {order.status !== 'Pending' && (
                                                                <button 
                                                                    onClick={() => deleteOrder(order._id)}
                                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                                    title="Delete Record"
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dish Tracking Analytics Widget */}
                    <div className="lg:col-span-1 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Dish Performance</h2>
                        </div>
                        
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                            {dishStats.items.length === 0 ? (
                                <div className="text-center py-12">
                                    <TrendingUp className="mx-auto h-8 w-8 text-gray-300 mb-3" />
                                    <p className="text-sm font-medium text-gray-900">No data available</p>
                                    <p className="text-xs text-gray-500 mt-1">Analytics will populate as orders arrive.</p>
                                </div>
                            ) : (
                                <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {dishStats.items.map((dish, idx) => {
                                        const percentage = Math.max(5, (dish.qty / dishStats.maxQty) * 100);
                                        return (
                                            <div key={idx} className="flex flex-col gap-1.5">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-sm font-semibold text-gray-900">{dish.name}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">₹{dish.revenue.toLocaleString()}</span>
                                                        <span className="text-xs font-medium text-gray-500">{dish.qty} ordered</span>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                    <div 
                                                        className="bg-green-500 h-1.5 rounded-full transition-all duration-500 ease-out" 
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
            )}

            {/* Edit Order Modal */}
            {editingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in-up">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Edit Order</h2>
                                <p className="text-sm text-gray-500">Guest: {editingOrder.guestName}</p>
                            </div>
                            <button onClick={() => setEditingOrder(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Current Items */}
                            <div className="flex flex-col">
                                <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-4">Current Cart</h3>
                                <div className="space-y-3 flex-1">
                                    {editingOrder.items.length === 0 ? (
                                        <div className="text-center py-8 border border-dashed rounded-xl border-gray-200 text-gray-400 text-sm">Cart is empty</div>
                                    ) : editingOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-colors">
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                                                <p className="text-xs text-gray-500 font-medium">₹{item.price}</p>
                                            </div>
                                            <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
                                                <button onClick={() => updateOrderItemQty(item.name, -1)} className="text-gray-500 hover:text-red-600 p-2 transition-colors"><Minus size={14} /></button>
                                                <span className="font-bold text-sm w-6 text-center text-gray-900">{item.qty}</span>
                                                <button onClick={() => updateOrderItemQty(item.name, 1)} className="text-gray-500 hover:text-green-600 p-2 transition-colors"><Plus size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center text-gray-500 mb-2">
                                        <span className="font-medium text-sm">Service Fee</span>
                                        <span className="font-medium text-sm">₹500</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-900">Total Amount</span>
                                        <span className="font-bold text-2xl text-green-600">₹{editingOrder.totalAmount}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Add Products */}
                            <div className="flex flex-col border-t md:border-t-0 md:border-l border-gray-100 md:pl-8 pt-8 md:pt-0">
                                <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-4">Add Items</h3>
                                
                                <div className="relative mb-4">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search menu..."
                                        value={editSearchQuery}
                                        onChange={(e) => setEditSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm font-medium transition-all"
                                    />
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar max-h-64 md:max-h-full">
                                    {filteredEditProducts.length === 0 ? (
                                        <p className="text-center text-gray-400 text-sm py-4">No products found.</p>
                                    ) : (
                                        filteredEditProducts.map(product => (
                                            <div key={product._id} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900">{product.name}</p>
                                                    <p className="text-xs text-gray-500 font-medium mt-0.5">₹{product.price} • <span className="text-green-600">{product.category}</span></p>
                                                </div>
                                                <button 
                                                    onClick={() => addProductToOrder(product)}
                                                    className="bg-white border border-gray-200 text-gray-700 p-1.5 rounded-md hover:border-green-500 hover:text-green-600 shadow-sm transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                            <button 
                                onClick={() => setEditingOrder(null)}
                                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveOrder}
                                className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-all shadow-sm shadow-green-600/20"
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
