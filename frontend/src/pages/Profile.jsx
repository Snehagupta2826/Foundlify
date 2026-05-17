import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Shield, Camera, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    if (!user) return null;

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            return toast.error('Image must be less than 5MB');
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            const res = await api.put('/auth/profile-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser(res.data);
            toast.success('Profile picture updated!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile picture');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <div className="px-8 pb-8 relative">
                    <div className="relative -top-16 flex justify-between items-end">
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-5xl font-bold text-indigo-600 shadow-md overflow-hidden bg-cover bg-center"
                                style={user.profileImage ? { backgroundImage: `url(http://localhost:5000${user.profileImage})` } : {}}
                            >
                                {!user.profileImage && user.name.charAt(0)}
                            </div>
                            
                            {/* Upload Overlay */}
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                                ) : (
                                    <Camera className="h-8 w-8 text-white" />
                                )}
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>
                    
                    <div className="-mt-8">
                        <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                        <p className="text-gray-500 flex items-center mt-1">
                            <Mail className="h-4 w-4 mr-2" />
                            {user.email}
                        </p>
                        
                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Account Role</dt>
                                    <dd className="mt-1 text-sm text-gray-900 flex items-center capitalize">
                                        <Shield className="h-4 w-4 mr-1 text-blue-500" />
                                        {user.role}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
