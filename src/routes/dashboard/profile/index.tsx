import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAuditStore } from '@/stores/useAuditStore';
import { useEmployeeStore } from '@/stores/useEmployeeStore';
import { User, Lock, Bell, LogOut, Camera } from 'lucide-react';

import { useLocation, useNavigate } from 'react-router';
import type { Employee, UserProfile } from '@/types';

const DEFAULT_PROFILE: UserProfile = {
    name: 'Admin User',
    email: 'admin@eleastar.com',
    phoneNumber: '+234 800 000 0000',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    photoUrl: ''
};

function buildInitialForm(currentUser: Employee | undefined): UserProfile {
    if (!currentUser) return { ...DEFAULT_PROFILE };
    return {
        ...DEFAULT_PROFILE,
        name: currentUser.name,
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber || DEFAULT_PROFILE.phoneNumber,
        photoUrl: currentUser.photoUrl || ''
    };
}

interface ProfileContentProps {
    currentUser: Employee | undefined;
    currentUserRole: string;
    onSaveProfile: (updates: { name: string; email: string; phoneNumber: string; photoUrl: string }) => void;
    onLogAction: (action: string, scope: string, details: string, status: string) => void;
    onShowSuccess: (payload: { title: string; message: string }) => void;
    onLogout: () => void;
    navigate: (to: string) => void;
    initialTab: 'profile' | 'security' | 'notifications';
}

const ProfileContent = ({
    currentUser,
    currentUserRole,
    onSaveProfile,
    onLogAction,
    onShowSuccess,
    onLogout,
    navigate,
    initialTab
}: ProfileContentProps) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>(initialTab);
    const [formData, setFormData] = useState<UserProfile>(() => buildInitialForm(currentUser));
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [notifPrefs, setNotifPrefs] = useState({
        system: true,
        hr: true,
        payroll: true,
        recruitment: false,
        qr: true
    });

    const handleSave = () => {
        if (currentUser) {
            onSaveProfile({
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                photoUrl: formData.photoUrl
            });
        }
        onLogAction('UPDATE', 'System', 'Updated personal profile settings', 'SUCCESS');
        onShowSuccess({ title: 'Profile Updated', message: 'Profile details updated successfully.' });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData(prev => ({ ...prev, photoUrl: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        onLogAction('SECURITY', 'System', 'User changed their password', 'SUCCESS');
        onShowSuccess({ title: 'Password Changed', message: 'Password updated successfully.' });
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Personal Settings</h1>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4">
                    <div className="flex flex-col items-center mb-8 pt-4">
                        <div className="relative group mb-3">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xl relative">
                                {formData.photoUrl ? (
                                    <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{formData.name.substring(0, 2).toUpperCase()}</span>
                                )}
                            </div>
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
                        <h2 className="font-bold text-slate-900">{formData.name}</h2>
                        <span className="text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded-full mt-1 font-medium">{currentUserRole}</span>
                    </div>

                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <User size={18} /> My Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <Lock size={18} /> Security
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <Bell size={18} /> Notifications
                        </button>
                    </nav>

                    <div className="mt-auto pt-8">
                        <button
                            onClick={() => {
                                onLogout();
                                navigate('/login');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8">
                    {activeTab === 'profile' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Profile Information</h3>
                            <div className="grid gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                    <input type="text" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500" />
                                </div>
                                <div className="pt-4">
                                    <button onClick={handleSave} className="btn-primary">Save Changes</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Security Settings</h3>
                            <form onSubmit={handlePasswordChange} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                    <input type="password" required value={formData.currentPassword} onChange={e => setFormData({ ...formData, currentPassword: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                    <input type="password" required value={formData.newPassword} onChange={e => setFormData({ ...formData, newPassword: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                    <input type="password" required value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500" />
                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="btn-primary">Update Password</button>
                                </div>
                            </form>

                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <h4 className="font-bold text-slate-900 mb-4">Active Sessions</h4>
                                <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center text-sm">
                                    <div>
                                        <div className="font-bold text-slate-900">Windows PC (Chrome)</div>
                                        <div className="text-slate-500">Lagos, Nigeria • Current Session</div>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-600 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Active
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Notification Preferences</h3>
                            <p className="text-slate-500 text-sm mb-6">Control which in-app notifications you receive.</p>

                            <div className="space-y-4">
                                {Object.entries(notifPrefs).map(([key, enabled]) => (
                                    <div key={key} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="capitalize font-medium text-slate-900">{key.replace(/([A-Z])/g, ' $1')} Notifications</div>
                                        <button
                                            onClick={() => setNotifPrefs(prev => ({ ...prev, [key]: !enabled }))}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-brand-600' : 'bg-slate-200'}`}
                                        >
                                            <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 flex justify-end">
                                <button onClick={handleSave} className="btn-primary">Save Preferences</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ProfilePage = () => {
    const currentUserRole = useAuthStore((s) => s.currentUserRole);
    const logout = useAuthStore((s) => s.logout);
    const employees = useEmployeeStore((s) => s.employees);
    const currentUserId = useAuthStore((s) => s.currentUserId);
    const updateUserProfile = useEmployeeStore((s) => s.updateUserProfile);
    const logAction = useAuditStore((s) => s.logAction);
    const location = useLocation();
    const navigate = useNavigate();
    const currentUser = employees.find((e: Employee) => e.id === currentUserId);
    const initialTab = (location.state as { activeTab?: 'profile' | 'security' | 'notifications' })?.activeTab || 'profile';

    return (
        <ProfileContent
            key={currentUserId ?? 'anon'}
            currentUser={currentUser}
            currentUserRole={currentUserRole}
            initialTab={initialTab}
            onSaveProfile={(updates) => updateUserProfile(updates)}
            onLogAction={(action, _scope, details, _status) => logAction(action, details)}
            onShowSuccess={({ title, message }) => toast.success(title, { description: message })}
            onLogout={logout}
            navigate={(to) => navigate(to)}
        />
    );
};
