import React, { useState } from 'react';
import { Search, Shield, Lock, Unlock, RefreshCw, AlertCircle, CheckCircle, Edit2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useEmployeeStore } from '@/stores/useEmployeeStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAuditStore } from '@/stores/useAuditStore';
import { useConfirmStore } from '@/stores/useConfirmStore';
import type { AdminRole, Employee } from '@/types';

export const SystemUsersPage: React.FC = () => {
    const employees = useEmployeeStore((s) => s.employees);
    const updateEmployee = useEmployeeStore((s) => s.updateEmployee);
    const currentUserRole = useAuthStore((s) => s.currentUserRole);
    const requestAuth = useSettingsStore((s) => s.requestAuth);
    const logAction = useAuditStore((s) => s.logAction);
    const addEmployee = useEmployeeStore((s) => s.addEmployee);
    const showConfirm = useConfirmStore((s) => s.showConfirm);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<AdminRole | 'All'>('All');
    const [editingUser, setEditingUser] = useState<Employee | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // Add User Form State
    const [newUser, setNewUser] = useState<{
        name: string;
        email: string;
        role: AdminRole;
        department: string;
    }>({
        name: '',
        email: '',
        role: 'USER',
        department: 'General'
    });

    // Filter Logic
    const filteredUsers = employees.filter(emp => {
        const matchesSearch =
            emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.role?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = filterRole === 'All' || emp.role === filterRole;

        return matchesSearch && matchesRole;
    });

    const handleRoleChange = (emp: Employee, newRole: AdminRole) => {
        if (emp.id === 1 && currentUserRole !== 'SUPER_ADMIN') {
            toast.error('Permission Denied', { description: 'Cannot modify Super Admin.' });
            return;
        }

        // Security Check for escalating privileges
        if (newRole === 'SUPER_ADMIN' && currentUserRole !== 'SUPER_ADMIN') {
            toast.error('Permission Denied', { description: 'Only Super Admins can promote others to Super Admin.' });
            return;
        }

        showConfirm({
            title: 'Change User Role',
            message: `Are you sure you want to change ${emp.name}'s role from ${emp.role} to ${newRole}? This will affect their system permissions immediately.`,
            onConfirm: () => {
                requestAuth('SENSITIVE', `Promote/Demote ${emp.name} to ${newRole}`, () => {
                    updateEmployee(emp.employee_id.toString(), { role: newRole });
                    logAction('Role Change', `Changed role for ${emp.name} to ${newRole}`);
                    toast.success('Role Updated', { description: 'User role updated successfully.' });
                });
            }
        });
    };

    const toggleAccess = (emp: Employee) => {
        if (emp.employee_id === 'EMP-001') {
            toast.error('Action Denied', { description: 'Cannot revoke access for the Root Super Admin.' });
            return;
        }

        const newStatus = emp.status === 'active' ? 'suspended' : 'active';
        const action = newStatus ? 'Grant Access' : 'Revoke Access';

        showConfirm({
            title: `${action}?`,
            message: `Are you sure you want to ${action.toLowerCase()} for ${emp.name}? ${!newStatus ? 'They will no longer be able to log in.' : 'They will be able to access the system.'}`,
            onConfirm: () => {
                requestAuth('SENSITIVE', `${action} for ${emp.name}`, () => {
                    updateEmployee(emp.employee_id.toString(), { status: newStatus });
                    logAction('Access Control', `${action} for ${emp.name}`);
                    toast.success('Access Updated', { description: `User access has been ${newStatus ? 'granted' : 'revoked'}.` });
                });
            }
        });
    };

    const handlePasswordReset = (emp: Employee) => {
        showConfirm({
            title: 'Reset Password',
            message: `Send a password reset link to ${emp.email}?`,
            onConfirm: () => {
                // Mock Action
                logAction('Password Reset', `Initiated password reset for ${emp.email}`);
                toast.success('Reset Link Sent', { description: `Password reset instructions sent to ${emp.email}` });
            }
        });
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!newUser.name || !newUser.email) {
            toast.error('Missing Fields', { description: 'Name and Email are required.' });
            return;
        }

        requestAuth('SENSITIVE', `Create new System User: ${newUser.name} (${newUser.role})`, () => {
            const newEmpId = `EMP-${Math.floor(Math.random() * 10000)}`;
            const newEmployee: Partial<Employee> = {
                employee_id: newEmpId,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role as AdminRole,
                department_id: newUser.department,
                status: 'active',
                joinedAt: new Date().toISOString(),
                photoUrl: `https://ui-avatars.com/api/?name=${newUser.name}&background=random`,
            };

            addEmployee(newEmployee as Omit<Employee, 'tenantId'> & { password?: string | undefined; password_confirmation?: string | undefined; role_id?: never; });

            logAction('User Creation', `Created new system user ${newUser.name} as ${newUser.role}`);
            toast.success('User Created', { description: `${newUser.name} has been added to the system.` });
            setShowAddModal(false);
            setNewUser({ name: '', email: '', role: 'USER', department: 'General' });
        });
    };

    const roles: AdminRole[] = ['SUPER_ADMIN', 'COO', 'HR_ADMIN', 'FINANCE_ADMIN', 'PAYROLL_ADMIN', 'CHIEF_RISK_OFFICER', 'USER'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Shield className="text-brand-600" />
                        System Users & Access
                    </h1>
                    <p className="text-slate-500">Manage system roles, permissions, and account access.</p>
                </div>
                <div className="flex items-center gap-3">
                    {currentUserRole === 'SUPER_ADMIN' && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add System User
                        </button>
                    )}
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold uppercase rounded-full border border-amber-200">
                        Sensitive Area
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users by name, email, or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                </div>
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value as AdminRole)}
                    className="w-full sm:w-48 p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    aria-label="Filter by Role"
                    title="Filter by Role"
                >
                    <option value="All">All Roles</option>
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 border-b border-slate-200">User</th>
                            <th className="px-6 py-4 border-b border-slate-200">System Role</th>
                            <th className="px-6 py-4 border-b border-slate-200">Status</th>
                            <th className="px-6 py-4 border-b border-slate-200 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map(emp => (
                            <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                            <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{emp.name}</div>
                                            <div className="text-xs text-slate-500">{emp.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {editingUser?.id === emp.id ? (
                                        <div className="flex items-center gap-2">
                                            <select
                                                className="text-sm p-1 border border-slate-300 rounded"
                                                value={emp.role}
                                                onChange={(e) => handleRoleChange(emp, e.target.value as AdminRole)}
                                                onBlur={() => setEditingUser(null)}
                                                autoFocus
                                                aria-label={`Change role for ${emp.name}`}
                                                title={`Change role for ${emp.name}`}
                                            >
                                                {roles.map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${emp.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                            emp.role === 'USER' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                                'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                            {emp.role}
                                            <button
                                                onClick={() => setEditingUser(emp)}
                                                className="p-0.5 hover:bg-black/5 rounded transition-colors ml-1"
                                                title="Edit Role"
                                            >
                                                <Edit2 size={10} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {emp.status === 'active' ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            <CheckCircle size={12} />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-red-50 text-red-700 border border-red-100">
                                            <AlertCircle size={12} />
                                            Revoked
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => toggleAccess(emp)}
                                            className={`p-2 rounded-lg transition-colors border ${emp.status === 'active'
                                                ? 'text-red-600 border-red-200 hover:bg-red-50'
                                                : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                                                }`}
                                            title={emp.status === 'active' ? 'Revoke Access' : 'Grant Access'}
                                        >
                                            {emp.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                                        </button>

                                        <button
                                            onClick={() => handlePasswordReset(emp)}
                                            className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 border border-slate-200 rounded-lg transition-colors"
                                            title="Reset Password"
                                        >
                                            <RefreshCw size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No users found matching your search.
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            {
                showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Shield className="text-brand-600" size={18} />
                                    Add System User
                                </h3>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600" title="Close Modal">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddUser} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                                        value={newUser.name}
                                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                        placeholder="e.g. Jane Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        placeholder="e.g. jane@company.com"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">System Role</label>
                                        <select
                                            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                                            value={newUser.role}
                                            onChange={e => setNewUser({ ...newUser, role: e.target.value as AdminRole })}
                                            aria-label="Select System Role"
                                            title="Select System Role"
                                        >
                                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                                            value={newUser.department}
                                            onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                                            placeholder="e.g. IT"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium text-sm border border-transparent"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium text-sm shadow-sm flex items-center gap-2"
                                    >
                                        <Plus size={16} />
                                        Create User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
