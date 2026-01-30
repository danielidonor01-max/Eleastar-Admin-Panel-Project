import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import type { AdminRole, ModuleType } from '../../context/AdminContext';
import { Shield, Upload, Save, AlertTriangle, Check, History, Lock } from 'lucide-react';
import type { Employee } from '../../data/mockData';

export const SettingsPage: React.FC = () => {
    const { activityLogs, employees, updateEmployee, ceoSignature, updateCeoSignature, rolePermissions, updateRolePermissions, currentUserRole } = useAdmin();

    // UI State
    const [pendingChange, setPendingChange] = useState<{ id: string; updates: Partial<Employee> } | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(ceoSignature);

    // Permission Change State
    const [pendingPermChange, setPendingPermChange] = useState<{ role: AdminRole; module: ModuleType; allow: boolean } | null>(null);

    // Handlers
    const handleRoleChange = (id: string, newRole: string) => {
        setPendingChange({ id, updates: { systemRole: newRole as any } });
    };

    const handleAccessToggle = (id: string, currentAccess: boolean) => {
        setPendingChange({ id, updates: { accessGranted: !currentAccess } });
    };

    const confirmChange = () => {
        if (pendingChange) {
            updateEmployee(pendingChange.id, pendingChange.updates);
            setPendingChange(null);
        }
    };

    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSignaturePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveSignature = () => {
        if (signaturePreview) {
            updateCeoSignature(signaturePreview);
        }
    };

    // Permission Handlers
    const handlePermissionToggle = (role: AdminRole, module: ModuleType) => {
        if (role === 'Super Admin') {
            alert("Super Admin permissions cannot be modified. Safety lock engaged.");
            return;
        }
        if (currentUserRole !== 'Super Admin') {
            alert("Only Super Admins can modify role permissions.");
            return;
        }

        const currentModules = rolePermissions[role];
        const isAllowed = currentModules.includes(module);

        setPendingPermChange({ role, module, allow: !isAllowed });
    };

    const confirmPermissionChange = () => {
        if (pendingPermChange) {
            const { role, module, allow } = pendingPermChange;
            const currentModules = rolePermissions[role];
            let newModules: ModuleType[];

            if (allow) {
                newModules = [...currentModules, module];
            } else {
                newModules = currentModules.filter(m => m !== module);
            }

            updateRolePermissions(role, newModules);
            setPendingPermChange(null);
        }
    };

    const modules: ModuleType[] = ['Employees', 'QR & ID', 'Payroll', 'Recruitment', 'Website CMS', 'Settings'];
    const rolesList: AdminRole[] = ['Super Admin', 'Management Admin', 'HR Admin', 'Finance Admin', 'Web Admin'];

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">System Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Role Access Matrix (New) */}
                    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Lock className="text-purple-600" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Role Access Control</h2>
                                    <p className="text-sm text-slate-500">Configure module access for system roles.</p>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Role</th>
                                        {modules.map(m => <th key={m} className="px-2 py-3 text-center">{m.replace('Website ', '')}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rolesList.map(role => (
                                        <tr key={role} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-bold text-slate-900">{role}</td>
                                            {modules.map(module => {
                                                const hasAccess = rolePermissions[role].includes(module);
                                                const isSuper = role === 'Super Admin';

                                                return (
                                                    <td key={module} className="px-2 py-3 text-center">
                                                        <button
                                                            onClick={() => handlePermissionToggle(role, module)}
                                                            disabled={isSuper}
                                                            className={`p-1.5 rounded-md transition-colors ${hasAccess
                                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                                } ${isSuper ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            {hasAccess ? <Check size={16} /> : <XIcon />}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Access Matrix (Existing) */}
                    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-50 rounded-lg">
                                    <Shield className="text-brand-600" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Staff Access Matrix</h2>
                                    <p className="text-sm text-slate-500">Manage individual employee system roles.</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Employee</th>
                                        <th className="px-6 py-4">System Role</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-center">Access</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {employees.map((emp) => (
                                        <tr key={emp.id} className={`hover:bg-slate-50 transition-colors ${!emp.accessGranted ? 'opacity-60 bg-slate-50' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{emp.name}</div>
                                                <div className="text-xs text-slate-500">{emp.title}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={emp.systemRole}
                                                    onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                                                    className={`border-none bg-transparent font-medium focus:ring-2 rounded cursor-pointer ${emp.systemRole === 'Super Admin' ? 'text-purple-600' :
                                                        emp.systemRole === 'Management Admin' ? 'text-brand-600' :
                                                            'text-slate-600'
                                                        }`}
                                                >
                                                    <option value="Super Admin">Super Admin</option>
                                                    <option value="Management Admin">Management Admin</option>
                                                    <option value="User">User</option>
                                                    <option value="Viewer">Viewer</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                                                    }`}>
                                                    {emp.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleAccessToggle(emp.id, emp.accessGranted)}
                                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${emp.accessGranted ? 'bg-brand-600' : 'bg-slate-200'
                                                        }`}
                                                >
                                                    <span
                                                        aria-hidden="true"
                                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${emp.accessGranted ? 'translate-x-5' : 'translate-x-0'
                                                            }`}
                                                    />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* CEO Signature Asset */}
                    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">System Assets</h2>
                            <p className="text-sm text-slate-500">Manage global assets like signatures and logos.</p>
                        </div>
                        <div className="p-6 grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h3 className="font-bold text-slate-900 mb-2">CEO Signature</h3>
                                <p className="text-sm text-slate-500 mb-6">
                                    This signature will be applied to all ID cards and official generated documents.
                                    Ensure it is a high-resolution PNG with valid transparency.
                                </p>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                                        <Upload size={16} className="text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700">Upload New</span>
                                        <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                                    </label>
                                    {signaturePreview !== ceoSignature && (
                                        <button
                                            onClick={saveSignature}
                                            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-sm transition-colors text-sm font-medium"
                                        >
                                            <Save size={16} />
                                            Save Changes
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <div className="p-4 border border-dashed border-slate-200 rounded-lg bg-slate-50 w-full max-w-[200px] h-32 flex items-center justify-center relative overflow-hidden group">
                                    {signaturePreview ? (
                                        <img src={signaturePreview} alt="Signature Preview" className="max-w-full max-h-full object-contain" />
                                    ) : (
                                        <span className="text-slate-400 text-xs text-center">No signature<br />uploaded</span>
                                    )}
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-slate-500 font-medium">
                                        Asset Preview
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Activity Log */}
                    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-6 text-slate-900">
                            <History size={20} className="text-slate-400" />
                            <h2 className="font-bold">Activity Log</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[600px] pr-2 space-y-4">
                            {activityLogs.map((log) => (
                                <div key={log.id} className="relative pl-6 border-l-2 border-slate-100 pb-2">
                                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-200 border-2 border-white box-content"></div>
                                    <div className="text-xs text-slate-400 mb-0.5">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                    <div className="text-sm font-medium text-slate-900 leading-tight">{log.action}</div>
                                    {log.details && <div className="text-xs text-slate-500 mt-1">{log.details}</div>}
                                    {log.role && <div className="text-[10px] text-brand-600 font-medium mt-1 uppercase tracking-wide">{log.role}</div>}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Confirmation Modal */}
            {pendingChange && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Confirm Changes</h3>
                        <p className="text-center text-slate-500 mb-6">
                            Are you sure you want to update permissions for <span className="font-bold text-slate-900">{employees.find(e => e.id === pendingChange.id)?.name}</span>?
                            This action will be logged.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setPendingChange(null)}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmChange}
                                className="px-4 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 flex items-center justify-center gap-2"
                            >
                                <Check size={18} />
                                Confirm Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Permission Modal */}
            {pendingPermChange && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <Shield size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Modify Role Access?</h3>
                        <p className="text-center text-slate-500 mb-6">
                            You are about to <strong className={pendingPermChange.allow ? "text-emerald-600" : "text-red-600"}>{pendingPermChange.allow ? "GRANT" : "REVOKE"}</strong> access
                            to <strong className="text-slate-900">{pendingPermChange.module}</strong> for the <strong className="text-slate-900">{pendingPermChange.role}</strong> role.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setPendingPermChange(null)}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmPermissionChange}
                                className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                            >
                                <Check size={18} />
                                Confirm Change
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);
