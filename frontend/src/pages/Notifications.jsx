import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Bell, CheckCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const Notifications = () => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => 
                n._id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            toast.error('Failed to update notification');
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Loading notifications...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-8 border-b pb-4">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                        <Bell className="mr-3 text-blue-500" size={32} />
                        Notifications
                    </h1>
                </div>

                {notifications.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl">
                        <Info className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-gray-500 font-medium">You have no notifications yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notif) => (
                            <div 
                                key={notif._id} 
                                className={`p-4 rounded-xl border ${notif.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200 shadow-sm'} transition-colors flex justify-between items-start`}
                            >
                                <div className="flex-grow pr-4">
                                    <div className="flex items-center mb-1">
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full mr-3 ${
                                            notif.type === 'match_found' ? 'bg-orange-100 text-orange-700' :
                                            notif.type === 'claim_request' ? 'bg-purple-100 text-purple-700' :
                                            notif.type === 'claim_accepted' ? 'bg-green-100 text-green-700' :
                                            notif.type === 'claim_rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {notif.type.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className={`text-sm ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                        {notif.message}
                                    </p>
                                    
                                    {notif.relatedItemId && (
                                        <Link 
                                            to={`/item/${notif.itemModel === 'LostItem' ? 'lost' : 'found'}/${notif.relatedItemId}`}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold mt-2 inline-block"
                                        >
                                            View Related Item &rarr;
                                        </Link>
                                    )}
                                </div>
                                
                                {!notif.isRead && (
                                    <button 
                                        onClick={() => markAsRead(notif._id)}
                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Mark as read"
                                    >
                                        <CheckCircle size={24} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
