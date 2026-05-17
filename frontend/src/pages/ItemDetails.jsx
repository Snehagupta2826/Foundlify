import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import QRCodePackage from 'react-qr-code';
const QRCode = QRCodePackage.QRCode || QRCodePackage.default || QRCodePackage;
import toast from 'react-hot-toast';
import { MapPin, Calendar, Tag, Info, User } from 'lucide-react';

const ItemDetails = () => {
    const { type, id } = useParams(); // type is 'lost' or 'found'
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [item, setItem] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [proofImage, setProofImage] = useState(null);
    const [claimMessage, setClaimMessage] = useState('');
    const [claiming, setClaiming] = useState(false);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await api.get(`/${type}-items/${id}`);
                setItem(res.data);
                
                // Fetch matches
                try {
                    const matchRes = await api.get(`/${type}-items/${id}/matches`);
                    setMatches(matchRes.data);
                } catch (matchErr) {
                    console.error('Failed to fetch matches', matchErr);
                }
                
            } catch (err) {
                toast.error('Item not found');
                navigate('/search');
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [type, id, navigate]);

    const handleClaimSubmit = async (e) => {
        e.preventDefault();
        if (!proofImage) return toast.error('Please upload a proof document');

        setClaiming(true);
        const formData = new FormData();
        formData.append('itemId', item._id);
        formData.append('itemModel', type === 'lost' ? 'LostItem' : 'FoundItem');
        formData.append('itemUniqueCode', item.uniqueId);
        formData.append('message', claimMessage);
        formData.append('proofDocument', proofImage);

        try {
            await api.post('/claims', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Claim submitted successfully! Admin will review it soon.');
            setShowClaimModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit claim');
        } finally {
            setClaiming(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Loading item...</div>;
    if (!item) return null;

    const currentUserId = user?._id || user?.id;
    const itemOwnerId = item.userId?._id || item.userId;
    const isOwner = Boolean(user && currentUserId && itemOwnerId && String(currentUserId) === String(itemOwnerId));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
                
                {/* Left Side: Image & QR */}
                <div className="md:w-5/12 bg-gray-50 p-8 flex flex-col items-center justify-center border-r border-gray-100 relative">
                    <span className={`absolute top-4 left-4 px-4 py-1 rounded-full text-sm font-bold ${type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {(type || 'unknown').toUpperCase()}
                    </span>
                    <span className={`absolute top-4 right-4 px-4 py-1 rounded-full text-sm font-bold ${(item.status || 'active') === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                        {(item.status || 'active').toUpperCase()}
                    </span>

                    {item.image ? (
                        <img src={`http://localhost:5000${item.image}`} alt={item.title} className="w-full h-64 object-contain rounded-xl shadow-sm bg-white p-2 mb-8" />
                    ) : (
                        <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 mb-8">
                            No Image Available
                        </div>
                    )}
                    
                    <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center">
                        <QRCode value={item.uniqueId || 'NO-ID'} size={120} />
                        <p className="mt-3 font-mono text-sm font-bold text-gray-600 tracking-wider">{item.uniqueId || 'NO-ID'}</p>
                        <p className="text-xs text-gray-400 mt-1">Scan for item details</p>
                    </div>
                </div>

                {/* Right Side: Details */}
                <div className="md:w-7/12 p-8 lg:p-12">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{item.title}</h1>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <div className="flex items-start">
                            <Tag className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-gray-500">Category</p>
                                <p className="font-semibold text-gray-900 capitalize">{item.category}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <MapPin className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-gray-500">Location</p>
                                <p className="font-semibold text-gray-900">{item.location}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Calendar className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-gray-500">Date {type === 'lost' ? 'Lost' : 'Found'}</p>
                                <p className="font-semibold text-gray-900">
                                    {(item.dateLost || item.dateFound) 
                                        ? new Date(item.dateLost || item.dateFound).toLocaleDateString() 
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <User className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-gray-500">Reported By</p>
                                <p className="font-semibold text-gray-900">{item.userId?.name || 'Anonymous'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                            <Info size={20} className="mr-2 text-gray-500" /> Description
                        </h3>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-xl leading-relaxed">
                            {item.description}
                        </p>
                    </div>

                    {/* Match Suggestions Area */}
                    {isOwner && matches.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold mr-3">Possible Match Found</span>
                                Similar Items
                            </h3>
                            <div className="space-y-4">
                                {matches.map((matchItem) => (
                                    <div key={matchItem._id} className="border border-orange-200 bg-orange-50 p-4 rounded-xl flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-900">{matchItem.title}</p>
                                            <p className="text-sm text-gray-600">Location: {matchItem.location}</p>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/item/${type === 'lost' ? 'found' : 'lost'}/${matchItem._id}`)}
                                            className="text-orange-600 hover:text-orange-700 font-semibold text-sm underline"
                                        >
                                            View Item
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Area */}
                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            {isOwner && (
                                <p className="text-green-600 font-medium text-sm">You are the reporter of this item.</p>
                            )}
                            {item.status !== 'active' && (
                                <p className="text-gray-500 font-medium text-sm">This item is no longer active ({item.status}).</p>
                            )}
                        </div>
                        
                        <div className="flex gap-3">
                            {isOwner && item.status === 'active' && (
                                <button 
                                    onClick={async () => {
                                        if(window.confirm('Mark this item as recovered?')) {
                                            try {
                                                await api.put(`/${type}-items/${item._id}`, { ...item, status: 'recovered' });
                                                window.location.reload();
                                            } catch (err) {
                                                toast.error('Failed to update status');
                                            }
                                        }
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    Mark as Recovered
                                </button>
                            )}
                            
                            {!isOwner && item.status === 'active' && user && (
                                <button 
                                    onClick={() => setShowClaimModal(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    {type === 'found' ? 'Claim Ownership' : 'Claim (I Found This)'}
                                </button>
                            )}
                            {!user && (
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-xl font-medium transition-colors"
                                >
                                    Login to Claim
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Claim Modal */}
            {showClaimModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowClaimModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="relative z-10 inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleClaimSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-xl leading-6 font-bold text-gray-900 mb-4" id="modal-title">
                                        {type === 'found' ? 'Claim Ownership' : 'Report as Found'}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-6">
                                        {type === 'found' 
                                            ? `To claim this item (${item.uniqueId}), you must provide proof of ownership (e.g. a receipt, photo of you with the item, or specific identifying details written on a document).`
                                            : `If you have found this lost item (${item.uniqueId}), please upload a photo of the item you found as proof so the owner can verify it.`}
                                    </p>
                                    
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Message to {type === 'found' ? 'Finder' : 'Owner'} (Optional)</label>
                                        <textarea 
                                            value={claimMessage}
                                            onChange={(e) => setClaimMessage(e.target.value)}
                                            rows="3"
                                            placeholder="Provide any additional details or contact info..."
                                            className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        ></textarea>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Proof Document / Image</label>
                                        <input 
                                            type="file" 
                                            required
                                            accept="image/*,.pdf"
                                            onChange={(e) => setProofImage(e.target.files[0])}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button 
                                        type="submit" 
                                        disabled={claiming}
                                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                    >
                                        {claiming ? 'Submitting...' : 'Submit Claim'}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowClaimModal(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemDetails;
