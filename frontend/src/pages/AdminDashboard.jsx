import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Shield, CheckCircle, XCircle, FileText } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchClaims = async () => {
        try {
            const res = await api.get('/claims');
            setClaims(res.data);
        } catch (error) {
            toast.error('Failed to fetch claims');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchClaims();
        }
    }, [user]);

    if (!user || user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    const handleVerify = async (id, status) => {
        try {
            await api.put(`/claims/${id}/verify`, { status });
            toast.success(`Claim ${status} successfully`);
            fetchClaims(); // refresh list
        } catch (error) {
            toast.error('Verification failed');
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Loading admin dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <Shield size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500">Review and verify ownership claims</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Pending Verification Requests ({claims.length})</h2>
                </div>
                
                {claims.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No pending claims to review.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {claims.map((claim) => (
                            <li key={claim._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-700">
                                                {claim.itemUniqueCode}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                Claimed by {claim.claimantId?.name} ({claim.claimantId?.email})
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <span>Target Item: </span>
                                            <span className="font-semibold text-gray-700">
                                                {claim.itemId ? claim.itemId.title : 'Deleted Item'}
                                            </span>
                                        </div>
                                        <div className="mt-3">
                                            <a 
                                                href={`http://localhost:5000${claim.proofDocument}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg"
                                            >
                                                <FileText size={16} />
                                                <span>View Proof Document</span>
                                            </a>
                                        </div>
                                    </div>
                                    
                                    <div className="flex space-x-3">
                                        <button 
                                            onClick={() => handleVerify(claim._id, 'approved')}
                                            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium transition-colors"
                                        >
                                            <CheckCircle size={18} />
                                            <span>Approve</span>
                                        </button>
                                        <button 
                                            onClick={() => handleVerify(claim._id, 'rejected')}
                                            className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors"
                                        >
                                            <XCircle size={18} />
                                            <span>Reject</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-400">
                                    Submitted on {new Date(claim.createdAt).toLocaleString()}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
