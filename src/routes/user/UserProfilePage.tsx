import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Save, Linkedin, Facebook, Instagram, Phone, Mail, Camera, ShieldCheck } from 'lucide-react';



export const UserProfilePage: React.FC = () => {
    const { employees, currentUserId, updateUserProfile } = useAdmin();

    const [formData, setFormData] = useState<{
        phoneNumber: string;
        linkedin: string;
        facebook: string;
        instagram: string;
        photoUrl: string;
    }>({
        phoneNumber: '',
        linkedin: '',
        facebook: '',
        instagram: '',
        photoUrl: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentUser = employees.find(e => e.id === currentUserId);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                phoneNumber: currentUser.phoneNumber || '',
                linkedin: currentUser.socialLinks?.linkedin || '',
                facebook: currentUser.socialLinks?.facebook || '',
                instagram: currentUser.socialLinks?.instagram || '',
                photoUrl: currentUser.photoUrl || ''
            });
        }
    }, [currentUser]);

    if (!currentUser) return <div>Loading...</div>;

    const handleSave = () => {
        updateUserProfile({
            phoneNumber: formData.phoneNumber,
            photoUrl: formData.photoUrl,
            socialLinks: {
                linkedin: formData.linkedin,
                facebook: formData.facebook,
                instagram: formData.instagram
            }
        });
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
        setIsEditing(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData(prev => ({ ...prev, photoUrl: base64String }));
                setIsEditing(true); // Automatically trigger save-mode so they don't accidentally leave without saving
            };
            reader.readAsDataURL(file);
        }
    };


    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                    <p className="text-slate-500">Manage your personal information</p>
                </div>
                {message && (
                    <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium animate-pulse">
                        {message}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Read-Only Overview */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="h-32 bg-slate-900 relative">
                            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                                <div className="relative group">
                                    <img
                                        src={formData.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=0D8ABC&color=fff`}
                                        alt={currentUser.name}
                                        className="w-24 h-24 rounded-full border-4 border-white object-cover bg-slate-200"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 p-1.5 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-colors shadow-sm"
                                        title="Change Photo"
                                    >
                                        <Camera size={14} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="pt-16 pb-6 px-6 text-center">
                            <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
                            <p className="text-brand-600 font-medium">{currentUser.title}</p>

                            <div className="mt-6 flex flex-col gap-2 text-sm text-slate-500 text-left border-t border-slate-100 pt-4">
                                <div className="flex justify-between">
                                    <span>Employee ID:</span>
                                    <span className="font-mono text-slate-900">{currentUser.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Department:</span>
                                    <span className="text-slate-900">{currentUser.department}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Joined:</span>
                                    <span className="text-slate-900">{new Date(currentUser.joinedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Employment:</span>
                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-700 font-medium">{currentUser.employmentType}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Read-Only Salary Card (Protected) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 opacity-75 grayscale-[0.5]">
                        <div className="flex items-center gap-2 mb-4 text-slate-900">
                            <ShieldCheck className="text-slate-400" size={20} />
                            <h3 className="font-bold">Finance Details</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Base Salary</label>
                                <div className="font-mono text-lg font-bold text-slate-400">₦ •••••••</div>
                                <p className="text-[10px] text-slate-400 italic">Visible only in payroll slips</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Editable Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-900">Edit Personal Details</h3>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 text-brand-600 bg-brand-50 rounded-lg text-sm font-bold hover:bg-brand-100 transition-colors"
                                >
                                    Edit Details
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Contact Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            value={currentUser.email}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Contact HR to change email</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            disabled={!isEditing}
                                            className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg transition-all ${isEditing ? 'border-brand-300 focus:ring-2 focus:ring-brand-200 text-slate-900' : 'border-slate-200 text-slate-600'}`}
                                            placeholder="+234..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Removed text-based photoUrl input block */}

                            {/* Social Links */}
                            <div className="border-t border-slate-100 pt-6">
                                <h4 className="font-bold text-slate-900 mb-4 bg-slate-50 p-2 rounded-lg inline-block text-sm">Social Profiles</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">LinkedIn Profile</label>
                                        <div className="relative">
                                            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="url"
                                                value={formData.linkedin}
                                                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                                disabled={!isEditing}
                                                className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg transition-all ${isEditing ? 'border-brand-300 focus:ring-2 focus:ring-brand-200 text-slate-900' : 'border-slate-200 text-slate-600'}`}
                                                placeholder="https://linkedin.com/in/..."
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Facebook</label>
                                            <div className="relative">
                                                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="url"
                                                    value={formData.facebook}
                                                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                                                    disabled={!isEditing}
                                                    className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg transition-all ${isEditing ? 'border-brand-300 focus:ring-2 focus:ring-brand-200 text-slate-900' : 'border-slate-200 text-slate-600'}`}
                                                    placeholder="Username or URL"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Instagram</label>
                                            <div className="relative">
                                                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="url"
                                                    value={formData.instagram}
                                                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                                    disabled={!isEditing}
                                                    className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg transition-all ${isEditing ? 'border-brand-300 focus:ring-2 focus:ring-brand-200 text-slate-900' : 'border-slate-200 text-slate-600'}`}
                                                    placeholder="@username"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2.5 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


