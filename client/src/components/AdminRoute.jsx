import { useState } from 'react';
import API_URL from '../api';
import { useNotification } from '../context/NotificationContext';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';

const AdminRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem('adminToken');
    });
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const { showNotification } = useNotification();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setIsAuthenticated(true);
                localStorage.setItem('adminToken', data.token);
                showNotification('Login successful');
            } else {
                showNotification(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            showNotification('Server error', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

                <div className="w-full max-w-[400px] bg-white p-8 sm:p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative z-10 animate-fade-in-up">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3 shadow-inner">
                            <Shield className="text-primary w-8 h-8 -rotate-3" />
                        </div>
                        <h2 className="text-[24px] font-black text-text-primary tracking-tight">
                            Admin Portal
                        </h2>
                        <p className="text-sm text-text-secondary mt-2">
                            Sign in to manage resort orders and menu
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-text-primary text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="Admin Username"
                                    value={loginData.username}
                                    onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                                />
                            </div>
                            
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-text-primary text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="Password"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-primary text-white text-[15px] font-bold rounded-2xl hover:bg-primary-light focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-70"
                        >
                            {isLoading ? 'Authenticating...' : 'Secure Sign In'}
                            {!isLoading && <ArrowRight size={18} />}
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center">
                        <a href="/" className="text-[13px] font-semibold text-text-secondary hover:text-primary transition-colors">
                            ← Back to Guest Menu
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

export default AdminRoute;
