import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('All'); // All, Active, Completed, Cancelled

    useEffect(() => {
        window.scrollTo(0, 0);
        // Load orders from local storage
        const savedOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
        setOrders(savedOrders);
    }, []);

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Active') return order.status === 'Confirmed' || order.status === 'Preparing';
        if (activeTab === 'Completed') return order.status === 'Delivered';
        if (activeTab === 'Cancelled') return order.status === 'Cancelled';
        return true;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'text-green-600';
            case 'Preparing': return 'text-orange-500';
            case 'Cancelled': return 'text-red-500';
            default: return 'text-primary';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <CheckCircle2 size={14} className="text-green-600" />;
            case 'Preparing': return <Clock size={14} className="text-orange-500" />;
            case 'Cancelled': return <XCircle size={14} className="text-red-500" />;
            default: return <CheckCircle2 size={14} className="text-primary" />;
        }
    };

    return (
        <div className="bg-background min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white sticky top-0 z-30 border-b border-gray-100 px-4 py-4 flex items-center shadow-sm">
                <Link to="/" className="p-2 -ml-2 text-text-primary hover:bg-gray-50 rounded-full transition-colors mr-2">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-[18px] font-bold text-text-primary">My Orders</h1>
            </div>

            <div className="max-w-3xl mx-auto px-4 mt-4">
                {/* Tabs */}
                <div className="flex overflow-x-auto scrollbar-hide gap-2 mb-6">
                    {['All', 'Active', 'Completed', 'Cancelled'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all shadow-sm flex-shrink-0 ${
                                activeTab === tab
                                    ? 'bg-text-primary text-white shadow-md'
                                    : 'bg-white text-text-secondary hover:bg-gray-50 border border-gray-100'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[32px] shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">No orders yet</h3>
                        <p className="text-text-secondary text-sm max-w-xs mx-auto mb-6">
                            You haven't placed any orders from this device yet.
                        </p>
                        <Link to="/" className="bg-primary text-white px-6 py-3 rounded-xl font-bold inline-block shadow-sm">
                            Browse Menu
                        </Link>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        No {activeTab?.toLowerCase()} orders found.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order, index) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={order.id} 
                                className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-text-primary text-sm mb-1">{order.id}</h3>
                                        <p className="text-xs text-text-secondary">
                                            {new Date(order.date).toLocaleString('en-IN', { 
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-text-primary">₹{order.total}</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-sm text-text-secondary">{order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}</span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-200">
                                    <div className="flex items-center gap-1.5">
                                        {getStatusIcon(order.status)}
                                        <span className={`text-xs font-bold ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <button className="text-primary text-sm font-bold bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors">
                                        View Details
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
