import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Package, Trash2, Edit, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const MyItems = () => {
    const { user } = useContext(AuthContext);
    const [items, setItems] = useState({ lost: [], found: [] });
    const [loading, setLoading] = useState(true);

    const fetchMyItems = async () => {
        try {
            setLoading(true);
            const [lostRes, foundRes] = await Promise.all([
                api.get('/lost-items'),
                api.get('/found-items')
            ]);
            // Filter on frontend for simplicity; ideally backend should have /api/users/me/items
            const currentUserId = user._id || user.id;
            
            const myLost = lostRes.data.filter(item => {
                const itemOwnerId = item.userId?._id || item.userId;
                return itemOwnerId === currentUserId;
            });
            
            const myFound = foundRes.data.filter(item => {
                const itemOwnerId = item.userId?._id || item.userId;
                return itemOwnerId === currentUserId;
            });
            
            setItems({ lost: myLost, found: myFound });
        } catch (error) {
            console.error('Error fetching my items', error);
            toast.error('Failed to load your reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMyItems();
        }
    }, [user]);

    const handleDelete = async (type, id) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;
        
        try {
            await api.delete(`/${type}-items/${id}`);
            toast.success('Item deleted successfully');
            fetchMyItems();
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    if (loading) return <div className="text-center py-12">Loading your items...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Reports</h1>
            
            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2 border-red-100 flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span> Lost Items
                    </h2>
                    {items.lost.length === 0 ? (
                        <p className="text-gray-500 bg-white p-6 rounded-xl border border-gray-100">You haven't reported any lost items.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.lost.map(item => (
                                <ItemCard key={item._id} item={item} type="lost" onDelete={handleDelete} />
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2 border-green-100 flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span> Found Items
                    </h2>
                    {items.found.length === 0 ? (
                        <p className="text-gray-500 bg-white p-6 rounded-xl border border-gray-100">You haven't reported any found items.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.found.map(item => (
                                <ItemCard key={item._id} item={item} type="found" onDelete={handleDelete} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

const ItemCard = ({ item, type, onDelete }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group relative">
        <div className="h-40 bg-gray-100 relative">
            {item.image ? (
                <img src={`http://localhost:5000${item.image}`} alt={item.title} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package size={32} />
                </div>
            )}
            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => onDelete(type, item._id)}
                    className="p-2 bg-white text-red-500 rounded-lg shadow hover:bg-red-50 transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
        <div className="p-5">
            <h3 className="font-bold text-gray-900 mb-1 truncate">{item.title}</h3>
            <p className="text-sm text-gray-500 mb-3 truncate">{item.location}</p>
            <div className="flex justify-between items-center text-sm mb-4">
                <span className={`px-2 py-1 rounded-full font-medium ${item.status === 'active' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {item.status}
                </span>
                <span className="text-gray-400 font-mono text-xs">{item.uniqueId || 'NO-ID'}</span>
            </div>
            <Link 
                to={`/item/${type}/${item._id}`}
                className="w-full inline-flex justify-center items-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 rounded-xl transition-colors"
            >
                <span>View Details</span>
                <ExternalLink size={16} />
            </Link>
        </div>
    </div>
);

export default MyItems;
