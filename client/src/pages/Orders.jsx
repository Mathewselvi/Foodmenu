import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, History, Printer } from 'lucide-react';
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
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-gray-50 pb-4">
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
                                        <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                            <button 
                                                onClick={() => printBill(order)}
                                                className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 flex-1 sm:flex-none justify-center flex items-center gap-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                                            >
                                                <Printer size={16} /> Print Bill
                                            </button>
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
