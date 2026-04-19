import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, History } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import API_URL from '../api';

const Orders = () => {
    const { showNotification } = useNotification();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/orders`);
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
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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

    const deleteOrder = async (id) => {
        if (window.confirm('Are you sure you want to delete this order records?')) {
            try {
                const res = await fetch(`${API_URL}/orders/${id}`, {
                    method: 'DELETE'
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
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-6">
                <Link to="/" className="inline-flex items-center gap-2 text-green-700 font-medium hover:underline">
                    <ArrowLeft size={18} /> Back to Menu
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">Orders Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
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
                                <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-extrabold text-lg text-gray-900">Guest: {order.guestName}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock size={12} /> {new Date(order.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    
                                    {order.status === 'Pending' ? (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => updateStatus(order._id, 'Completed')}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
                                            >
                                                Mark Complete
                                            </button>
                                            <button 
                                                onClick={() => updateStatus(order._id, 'Cancelled')}
                                                className="bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => deleteOrder(order._id)}
                                            className="bg-gray-100 text-gray-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                                        >
                                            Delete Record
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
        </div>
    );
};

export default Orders;
