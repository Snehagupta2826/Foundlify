import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShieldAlert, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClaimTracker = () => {
    const [myClaims, setMyClaims] = useState([]);
    const [receivedClaims, setReceivedClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            const [myRes, receivedRes] = await Promise.all([
                api.get('/claims/my-claims'),
                api.get('/claims/received-claims')
            ]);
            setMyClaims(myRes.data);
            setReceivedClaims(receivedRes.data);
        } catch (error) {
            toast.error('Failed to load claims');
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (claimId, status) => {
        try {
            await api.put(`/claims/${claimId}/respond`, { status });
            toast.success(`Claim ${status} successfully!`);
            fetchClaims();
        } catch (error) {
            toast.error('Failed to respond to claim');
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Loading claims...</div>;

    const StatusBadge = ({ status }) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            accepted: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200'
        };
        const icons = {
            pending: <Clock size={14} className="mr-1" />,
            accepted: <CheckCircle size={14} className="mr-1" />,
            rejected: <XCircle size={14} className="mr-1" />
        };
        
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center w-max ${styles[status]}`}>
                {icons[status]} {status.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center">
                <ShieldAlert className="mr-3 text-blue-600" size={32} />
                Claim Tracker
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Claims I Received */}
                <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">Claims I Received</h2>
                    {receivedClaims.length === 0 ? (
                        <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-xl">No one has claimed your items yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {receivedClaims.map(claim => (
                                <div key={claim._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <StatusBadge status={claim.status} />
                                        <span className="text-xs text-gray-400">{new Date(claim.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    
                                    <h3 className="font-bold text-lg mb-1">
                                        {claim.itemId ? claim.itemId.title : 'Deleted Item'}
                                    </h3>
                                    
                                    <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                                        <p className="font-semibold text-gray-800 mb-1">Claimant: {claim.claimantId?.name}</p>
                                        <p><strong>Message:</strong> {claim.message || 'No message provided'}</p>
                                        {claim.proofDocument && (
                                            <a href={`http://localhost:5000${claim.proofDocument}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-2 inline-block">
                                                View Proof Document
                                            </a>
                                        )}
                                    </div>

                                    {claim.status === 'pending' && (
                                        <div className="flex gap-3 pt-3 border-t border-gray-100">
                                            <button 
                                                onClick={() => handleRespond(claim._id, 'accepted')}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm transition-colors"
                                            >
                                                Accept Claim
                                            </button>
                                            <button 
                                                onClick={() => handleRespond(claim._id, 'rejected')}
                                                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-bold text-sm transition-colors"
                                            >
                                                Reject Claim
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Claims I Submitted */}
                <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">Claims I Submitted</h2>
                    {myClaims.length === 0 ? (
                        <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-xl">You haven't submitted any claims.</p>
                    ) : (
                        <div className="space-y-4">
                            {myClaims.map(claim => (
                                <div key={claim._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-gray-50">
                                    <div className="flex justify-between items-start mb-3">
                                        <StatusBadge status={claim.status} />
                                        <span className="text-xs text-gray-400">{new Date(claim.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    
                                    <h3 className="font-bold text-lg mb-1">
                                        {claim.itemId ? claim.itemId.title : 'Deleted Item'}
                                    </h3>
                                    
                                    <div className="text-sm text-gray-600 mb-3">
                                        <p><strong>Message Sent:</strong> {claim.message || 'None'}</p>
                                    </div>
                                    
                                    {claim.itemId && (
                                        <Link 
                                            to={`/item/${claim.itemModel === 'LostItem' ? 'lost' : 'found'}/${claim.itemId._id}`}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline"
                                        >
                                            View Original Item
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ClaimTracker;
