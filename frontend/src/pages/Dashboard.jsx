import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { PlusCircle, Search, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [recentItems, setRecentItems] = useState([]);

    useEffect(() => {
        const fetchRecentItems = async () => {
            try {
                const [lostRes, foundRes] = await Promise.all([
                    api.get('/lost-items'),
                    api.get('/found-items')
                ]);
                
                // Add a type flag and combine them
                const lostItems = lostRes.data.map(item => ({ ...item, type: 'lost' }));
                const foundItems = foundRes.data.map(item => ({ ...item, type: 'found' }));
                
                const combined = [...lostItems, ...foundItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                setRecentItems(combined.slice(0, 8)); // Taking top 8 most recent
            } catch (err) {
                console.error("Error fetching items", err);
            }
        };
        fetchRecentItems();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
                <p className="mt-2 text-gray-600">Here's what's happening with your reported items.</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Link to="/add-lost-item" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center group">
                    <div className="h-12 w-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <PlusCircle size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900">Report Lost Item</h3>
                </Link>

                <Link to="/add-found-item" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center group">
                    <div className="h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <PlusCircle size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900">Report Found Item</h3>
                </Link>

                <Link to="/search" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center group">
                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Search size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900">Search Items</h3>
                </Link>

                <Link to="/my-items" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center group">
                    <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Package size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900">My Reports</h3>
                </Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Community Activity</h3>
                </div>
                <ul className="divide-y divide-gray-100">
                    {recentItems.length === 0 ? (
                        <li className="px-6 py-8 text-center text-gray-500">No recent activity found.</li>
                    ) : (
                        recentItems.map(item => (
                            <li key={item._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gray-100 overflow-hidden">
                                        {item.image ? (
                                            <img src={`http://localhost:5000${item.image}`} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                <Package size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                                                item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                                {item.type}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">{item.location} • {new Date(item.dateLost || item.dateFound).toLocaleDateString()}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="font-mono text-xs text-gray-400 bg-gray-50 px-1 rounded">{item.uniqueId || 'NO-ID'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {item.status}
                                        </span>
                                        <Link 
                                            to={`/item/${item.type}/${item._id}`}
                                            className="text-blue-600 text-xs font-medium hover:text-blue-800 transition-colors bg-blue-50 px-2 py-1 rounded"
                                        >
                                            View
                                        </Link>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
