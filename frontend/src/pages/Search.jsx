import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search as SearchIcon, MapPin, QrCode, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Search = () => {
    const [query, setQuery] = useState('');
    const [type, setType] = useState('lost'); // 'lost' or 'found'
    const [category, setCategory] = useState('all');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            // Fetch all items of the selected type and filter locally for simplicity in this demo.
            // In a production app, the filtering should happen on the backend via query params.
            const res = await api.get(`/${type}-items`);
            let filtered = res.data;

            if (query) {
                const q = query.toLowerCase();
                filtered = filtered.filter(item => 
                    item.title.toLowerCase().includes(q) || 
                    item.description.toLowerCase().includes(q) ||
                    item.location.toLowerCase().includes(q)
                );
            }

            if (category !== 'all') {
                filtered = filtered.filter(item => item.category === category);
            }

            setResults(filtered);
        } catch (err) {
            console.error("Search error", err);
        } finally {
            setLoading(false);
        }
    };

    // Run search once on mount
    useEffect(() => {
        handleSearch();
    }, [type, category]);

    // QR Code Scanner effect
    useEffect(() => {
        if (showScanner) {
            const scanner = new Html5QrcodeScanner('reader', {
                qrbox: { width: 250, height: 250 },
                fps: 5
            });

            scanner.render(
                (result) => {
                    scanner.clear();
                    setShowScanner(false);
                    // The QR code contains the Unique ID. Let's find it.
                    handleScanResult(result);
                },
                (err) => { /* ignore normal scanning errors */ }
            );

            return () => {
                scanner.clear().catch(e => console.error(e));
            };
        }
    }, [showScanner]);

    const handleScanResult = async (uniqueId) => {
        setLoading(true);
        try {
            // Determine type by prefix
            const itemType = uniqueId.startsWith('LF') ? 'lost' : 'found';
            const res = await api.get(`/${itemType}-items`);
            const item = res.data.find(i => i.uniqueId === uniqueId);
            
            if (item) {
                navigate(`/item/${itemType}/${item._id}`);
            } else {
                alert('Item not found for this QR code.');
            }
        } catch (error) {
            alert('Error scanning item.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Search Items</h1>
                    <p className="mt-2 text-gray-600">Search through the community reports to find your lost belongings.</p>
                </div>
                <button 
                    onClick={() => setShowScanner(true)}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
                >
                    <QrCode size={20} />
                    <span>Scan QR</span>
                </button>
            </div>

            {/* QR Scanner Modal */}
            {showScanner && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800 flex items-center">
                                <QrCode className="mr-2" size={20}/> Scan Item QR
                            </h3>
                            <button onClick={() => setShowScanner(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 bg-black">
                            <div id="reader" className="w-full"></div>
                        </div>
                        <div className="p-4 text-center text-sm text-gray-500 bg-gray-50">
                            Point your camera at an item's QR code.
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <form onSubmit={handleSearch} className="space-y-4 md:space-y-0 md:flex md:space-x-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="pl-10 block w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search by keywords or location..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="md:w-48">
                        <select
                            className="block w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="lost">Lost Items</option>
                            <option value="found">Found Items</option>
                        </select>
                    </div>

                    <div className="md:w-48">
                        <select
                            className="block w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            <option value="electronics">Electronics</option>
                            <option value="wallets">Wallets & Bags</option>
                            <option value="keys">Keys</option>
                            <option value="documents">Documents</option>
                            <option value="pets">Pets</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full md:w-auto flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Search
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-gray-500">Loading...</div>
                ) : results.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <SearchIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No results found</h3>
                        <p className="text-gray-500">Try adjusting your search filters.</p>
                    </div>
                ) : (
                    results.map(item => (
                        <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-48 bg-gray-100 relative">
                                {item.image ? (
                                    <img src={`http://localhost:5000${item.image}`} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                )}
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/90 shadow-sm backdrop-blur-sm ${type === 'lost' ? 'text-red-600' : 'text-green-600'}`}>
                                        {type === 'lost' ? 'Lost' : 'Found'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <MapPin size={16} className="mr-1" />
                                    <span className="line-clamp-1">{item.location}</span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{item.description}</p>
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-mono font-bold bg-gray-100 px-2 py-1 rounded">
                                        {item.uniqueId || 'NO-ID'}
                                    </span>
                                    <Link 
                                        to={`/item/${type}/${item._id}`} 
                                        className="text-blue-600 text-sm font-medium hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Search;
