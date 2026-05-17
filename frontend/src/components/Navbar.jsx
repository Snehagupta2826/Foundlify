import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Search, Bell, User, LogOut, Check } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll for notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => 
                n._id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-indigo-50/50 sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center group">
                            <span className="text-2xl font-black text-indigo-600 transform group-hover:scale-105 transition-transform duration-300">
                                Foundify
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-6">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 font-semibold transition-colors">
                                    Dashboard
                                </Link>
                                
                                <Link to="/claims" className="text-slate-600 hover:text-indigo-600 font-semibold transition-colors">
                                    Claims
                                </Link>
                                
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="text-purple-600 hover:text-purple-700 font-bold transition-colors">
                                        Admin Panel
                                    </Link>
                                )}
                                
                                {/* Notifications Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button 
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200 relative"
                                    >
                                        <Bell size={20} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                                            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                                <h3 className="font-semibold text-gray-800">Notifications</h3>
                                                <span className="text-xs text-gray-500">{unreadCount} new</span>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                                        No notifications yet.
                                                    </div>
                                                ) : (
                                                    <ul className="divide-y divide-gray-100">
                                                        {notifications.map(notification => (
                                                            <li 
                                                                key={notification._id} 
                                                                className={`p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <p className="text-sm text-gray-800 flex-1 pr-4">{notification.message}</p>
                                                                    {!notification.isRead && (
                                                                        <button 
                                                                            onClick={() => markAsRead(notification._id)}
                                                                            className="text-blue-500 hover:text-blue-700 bg-white p-1 rounded-full shadow-sm"
                                                                            title="Mark as read"
                                                                        >
                                                                            <Check size={14} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-gray-400 mt-2 block">
                                                                    {new Date(notification.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-center">
                                                    <Link to="/notifications" onClick={() => setShowNotifications(false)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                                                        View All Notifications
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-slate-200">
                                    <Link to="/profile" className="flex items-center space-x-2 text-slate-700 hover:opacity-80 transition-opacity">
                                        {user.profileImage ? (
                                            <img 
                                                src={`http://localhost:5000${user.profileImage}`} 
                                                alt="Profile" 
                                                className="h-8 w-8 rounded-full object-cover shadow-sm border border-slate-200"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 bg-indigo-100 text-indigo-700 flex items-center justify-center rounded-full font-bold shadow-sm">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                        <span className="font-medium text-sm hidden sm:block">{user.name}</span>
                                    </Link>
                                    <button 
                                        onClick={handleLogout}
                                        className="text-gray-500 hover:text-red-500 transition-colors flex items-center space-x-1"
                                    >
                                        <LogOut size={18} />
                                        <span className="text-sm font-medium hidden sm:block">Logout</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-semibold transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transform hover:-translate-y-0.5">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
