import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuditStore } from '@/stores/useAuditStore';
import { useEmployeeStore } from '@/stores/useEmployeeStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { Shield, Upload, Save, AlertTriangle, Check, Lock, Eye, RefreshCw, Key, Activity, Copy, CheckCircle2 } from 'lucide-react';
import type { Employee, AdminRole, ModuleType, SystemApiKey, ActivityLog, RolesProps } from '@/types';
import { cmsService } from '@/services/cmsService';

export const SettingsPage: React.FC = () => {
    const {activityLogs, logAction} = useAuditStore();
    const {employees, updateEmployee,ceoSignature, updateCeoSignature, addEmployee} = useEmployeeStore();
    const {rolePermissions, updateRolePermissions, currentUserRole} = useAuthStore();
    const {requestAuth, generateSystemPassword, apiKeys, addApiKey, toggleApiKeyStatus} = useSettingsStore();
    const {sendEmail} = useNotificationStore();

    // UI State
    const [pendingChange, setPendingChange] = useState<{ id: string; updates: Partial<Employee> } | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(ceoSignature);
    const [selectedUser, setSelectedUSER] = useState<Employee | null>(null);

    // Permission Change State
    const [pendingPermChange, setPendingPermChange] = useState<{ role: AdminRole; module: ModuleType; allow: boolean } | null>(null);

    // Handlers
    const handleRoleChange = (id: string, newRole: string) => {
        setPendingChange({ id, updates: { role: newRole as AdminRole } });
    };

    const handleAccessToggle = (id: string, currentAccess: boolean) => {
        setPendingChange({ id, updates: { status: currentAccess ? 'active' : 'suspended' } });
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
        if (role === 'SUPER_ADMIN') {
            toast.error('Protected Role', { description: 'SUPER_ADMIN permissions cannot be modified. Safety lock engaged.' });
            return;
        }
        if (currentUserRole !== 'SUPER_ADMIN') {
            toast.error('Access Denied', { description: 'Only SUPER_ADMINs can modify role permissions.' });
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
                newModules = currentModules.filter((m: ModuleType) => m !== module);
            }

            updateRolePermissions(role, newModules);
            setPendingPermChange(null);
        }
    };

    // Tab State
    const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'assets' | 'api'>('roles');

    // API Key State
    const [apiKeyName, setApiKeyName] = useState('');
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKeyName.trim()) {
            toast.error('Missing Name', { description: 'Please provide a name for the API key.' });
            return;
        }

        setIsGenerating(true);
        try {
            const res = await cmsService.generateApiKey(apiKeyName);
            if (res.success && res.data) {
                setGeneratedKey(res.data.key);
                toast.success('Key Generated', { description: 'API Key has been created successfully. Copy it now, it will not be shown again.' });
                // Automatically save it to our history list via context
                addApiKey({
                    name: apiKeyName,
                    keyPreview: `${res.data.key.substring(0, 5)}********************${res.data.key.substring(res.data.key.length - 4)}`
                });

                setApiKeyName('');
                setCopied(false);
            } else {
                toast.error('Generation Failed', { description: res.error || 'Failed to generate key.' });
            }
        } catch (err: unknown) {
            console.error(err);
            toast.error('Error', { description: 'An unexpected error occurred.' });
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        if (generatedKey) {
            navigator.clipboard.writeText(generatedKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // System USER State & Handlers
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUSER] = useState<{
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



    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.name || !newUser.email) {
            toast.error('Missing Fields', { description: 'Name and Email are required.' });
            return;
        }

        const newPass = generateSystemPassword();

        const newEmpId = `EMP-${Math.floor(Math.random() * 10000)}`;
        const newEmployee: Partial<Employee> = {
            employee_id: newEmpId,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            department_id: newUser.department,
            role_relation: newUser.role as unknown as RolesProps,
            status: 'active',
            joinedAt: new Date().toISOString(),
            photoUrl: `https://ui-avatars.com/api/?name=${newUser.name}&background=random`,
            salary: '0',
            employment_type: 'Full-time',
        };

        addEmployee(newEmployee as Omit<Employee, 'tenantId'> & { password?: string | undefined; password_confirmation?: string | undefined; role_id?: number | undefined; });
        logAction('User Creation', `Created new system user ${newUser.name} as ${newUser.role}`);
        toast.success('User Created', { description: `${newUser.name} added. Check email for credentials.` });

        // Simulating email
        sendEmail(newUser.email, 'Welcome to Eleastar Admin', `Your account has been created.\n\nLogin Email: ${newUser.email}\nTemporary Password: ${newPass}`);

        setShowAddModal(false);
        setNewUSER({ name: '', email: '', role: 'USER', department: 'General' });
    };

    const modules: ModuleType[] = ['Employees', 'QR & ID', 'Payroll', 'Recruitment', 'Compliance', 'Website CMS', 'Settings'];
    // Filtered Roles as requested
    const rolesList: AdminRole[] = ['SUPER_ADMIN', 'COO', 'HR_ADMIN', 'FINANCE_ADMIN', 'PAYROLL_ADMIN', 'CHIEF_RISK_OFFICER', 'USER'];

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">System Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings Column - Full Width */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Tabs */}
                    <div className="flex items-center gap-4 border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'roles'
                                ? 'text-brand-600 border-b-2 border-brand-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Role Configuration
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'users'
                                ? 'text-brand-600 border-b-2 border-brand-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            System Users
                        </button>
                        <button
                            onClick={() => setActiveTab('assets')}
                            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'assets'
                                ? 'text-brand-600 border-b-2 border-brand-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            System Assets
                        </button>
                        <button
                            onClick={() => setActiveTab('api')}
                            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'api'
                                ? 'text-brand-600 border-b-2 border-brand-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            API Configuration
                        </button>
                    </div>

                    {activeTab === 'roles' && (
                        <div className="space-y-8">
                            {/* Role Access Matrix */}
                            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 rounded-lg">
                                            <Lock className="text-purple-600" size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">Role Access Control</h2>
                                            <p className="text-sm text-slate-500">Configure module access for vital system roles.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                            <tr>
                                                <th className="px-4 py-3">System Role</th>
                                                {modules.map(m => <th key={m} className="px-2 py-3 text-center">{m.replace('Website ', '').replace('Compliance', 'Risk & Compliance')}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {rolesList.map(role => (
                                                <tr key={role} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-bold text-slate-900">{role}</td>
                                                    {modules.map(module => {
                                                        const hasAccess = rolePermissions[role].includes(module);
                                                        const isSuper = role === 'SUPER_ADMIN';

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
                        </div>
                    )}

                    {activeTab === 'assets' && (
                        <div className="space-y-8">
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
                    )}

                    {activeTab === 'api' && (
                        <div className="space-y-8">
                            {/* API Key Generation */}
                            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-800 rounded-lg">
                                            <Key className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">CMS API Configuration</h2>
                                            <p className="text-sm text-slate-500">Generate secure tokens to authenticate external data reads.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="max-w-xl mx-auto bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
                                        <h3 className="text-sm font-bold text-slate-900 mb-2">Generate New Key</h3>
                                        <p className="text-xs text-slate-500 mb-4">Create a new API key for a specific integration. For your security, the key will only be shown once.</p>

                                        <form onSubmit={handleGenerateKey} className="flex gap-3">
                                            <input
                                                type="text"
                                                value={apiKeyName}
                                                onChange={(e) => setApiKeyName(e.target.value)}
                                                placeholder="e.g., Main Website Frontend"
                                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-shadow outline-none"
                                            />
                                            <button
                                                type="submit"
                                                disabled={isGenerating || !apiKeyName.trim()}
                                                className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
                                            >
                                                {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Key size={16} />}
                                                Generate
                                            </button>
                                        </form>
                                    </div>

                                    {generatedKey && (
                                        <div className="max-w-xl mx-auto bg-emerald-50 border border-emerald-200 rounded-xl p-6 animate-in fade-in slide-in-from-top-4">
                                            <div className="flex items-center gap-2 mb-2 text-emerald-800">
                                                <CheckCircle2 size={18} />
                                                <h3 className="font-bold">Key Generated Successfully</h3>
                                            </div>
                                            <p className="text-sm text-emerald-600 mb-4 font-medium">Please copy this key immediately. You will not be able to retrieve it again later.</p>

                                            <div className="flex items-stretch gap-2">
                                                <div className="flex-1 bg-white border border-emerald-200 px-4 py-3 rounded-lg font-mono text-sm text-slate-700 break-all overflow-x-auto whitespace-nowrap scrollbar-hide">
                                                    {generatedKey}
                                                </div>
                                                <button
                                                    onClick={copyToClipboard}
                                                    className={`px-4 flex items-center justify-center rounded-lg transition-colors border ${copied ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-100'}`}
                                                >
                                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* API Keys History Table */}
                            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-8">
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded-lg">
                                            <Activity className="text-slate-600" size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">Active API Keys</h2>
                                            <p className="text-sm text-slate-500">Manage and disable previously generated keys.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                            <tr>
                                                <th className="px-6 py-4">Key Name</th>
                                                <th className="px-6 py-4">Preview</th>
                                                <th className="px-6 py-4">Created Date</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {apiKeys.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                                        No API keys generated yet. Use the tool above to create one.
                                                    </td>
                                                </tr>
                                            ) : (
                                                apiKeys.map((key: SystemApiKey) => (
                                                    <tr key={key.id} className={`hover:bg-slate-50 transition-colors ${key.status === 'disabled' ? 'opacity-60 bg-slate-50' : ''}`}>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-900">{key.name}</div>
                                                            <div className="text-xs text-slate-500 font-mono mt-0.5">{key.id}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <code className="px-2 py-1 bg-slate-100 rounded border border-slate-200 text-slate-600 font-mono text-xs">
                                                                {key.keyPreview}
                                                            </code>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600">
                                                            {new Date(key.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${key.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                                                                {key.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => toggleApiKeyStatus(key.id)}
                                                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${key.status === 'active' ? 'bg-emerald-600' : 'bg-slate-300'}`}
                                                                title={key.status === 'active' ? 'Disable API Key' : 'Enable API Key'}
                                                            >
                                                                <span
                                                                    aria-hidden="true"
                                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${key.status === 'active' ? 'translate-x-5' : 'translate-x-0'}`}
                                                                />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-8">
                            {/* System Users List */}
                            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-brand-50 rounded-lg">
                                            <Shield className="text-brand-600" size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">System Users</h2>
                                            <p className="text-sm text-slate-500">Manage individual employee system roles.</p>
                                        </div>
                                    </div>
                                    {currentUserRole === 'SUPER_ADMIN' && (
                                        <button
                                            onClick={() => setShowAddModal(true)}
                                            className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-sm flex items-center gap-2"
                                        >
                                            <Upload size={16} /> {/* Using Upload icon as Plus is not imported, will fix import later if needed, or stick to what is available */}
                                            Add System User
                                        </button>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                            <tr>
                                                <th className="px-6 py-4">Employee</th>
                                                <th className="px-6 py-4">System Role</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                                <th className="px-6 py-4 text-center">Access</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {employees.map((emp: Employee) => (
                                                <tr key={emp.employee_id} className={`hover:bg-slate-50 transition-colors ${!emp.status ? 'opacity-60 bg-slate-50' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-900">{emp.name}</div>
                                                        <div className="text-xs text-slate-500">{emp.role_relation?.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={emp.role}
                                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleRoleChange(emp.employee_id, e.target.value)}
                                                            className={`border-none bg-transparent font-medium focus:ring-2 rounded cursor-pointer ${emp.role === 'SUPER_ADMIN' ? 'text-purple-600' :
                                                                emp.role === 'COO' ? 'text-brand-600' :
                                                                    'text-slate-600'
                                                                }`}
                                                            aria-label={`Change role for ${emp.name}`}
                                                            title={`Change role for ${emp.name}`}
                                                        >
                                                            {rolesList.map((r: AdminRole) => <option key={r} value={r}>{r}</option>)}
                                                            <option value="USER">USER</option>
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
                                                            onClick={() => handleAccessToggle(emp.employee_id, emp.status === 'active')}
                                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${emp.status ? 'bg-brand-600' : 'bg-slate-200'
                                                                }`}
                                                            aria-label={emp.status ? `Revoke access for ${emp.name}` : `Grant access to ${emp.name}`}
                                                            title={emp.status ? `Revoke access for ${emp.name}` : `Grant access to ${emp.name}`}
                                                        >
                                                            <span
                                                                aria-hidden="true"
                                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${emp.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                                                                    }`}
                                                            />
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    requestAuth('SENSITIVE', `Regenerate password for ${emp.name}`, () => {
                                                                        const newPass = generateSystemPassword();
                                                                        sendEmail(emp.email, 'Security Alert: Password Reset', `Your password has been reset by an administrator.\n\nNew Password: ${newPass}\n\nPlease change this immediately after logging in.`);
                                                                        toast.success('Password Reset', { description: `Email sent to ${emp.email} with new credentials.` });
                                                                        logAction('Security', `Regenerated password for user ${emp.name}`);
                                                                    });
                                                                }}
                                                                className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                                title="Regenerate Password"
                                                            >
                                                                <RefreshCw size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedUSER(emp)}
                                                                className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                                title="View Account Details"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    )}
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
                            Are you sure you want to update permissions for <span className="font-bold text-slate-900">{employees.find((e: Employee) => e.employee_id === pendingChange.id)?.name || ''}</span>?
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
                            to <strong className="text-slate-900">{pendingPermChange.module as ModuleType}</strong> for the <strong className="text-slate-900">{pendingPermChange.role as AdminRole}</strong> role.
                        </p>
                        <p className="text-center text-slate-500 mb-6">
                            Are you sure you want to update permissions for <span className="font-bold text-slate-900">{employees.find((e: Employee) => e.employee_id === pendingPermChange.role)?.name || ''}</span>?
                            This action will be logged.
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

            {/* Add USER Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Shield className="text-brand-600" size={18} />
                                Add System User
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600" title="Close Modal">
                                <XIcon />
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
                                    onChange={e => setNewUSER({ ...newUser, name: e.target.value })}
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
                                    onChange={e => setNewUSER({ ...newUser, email: e.target.value })}
                                    placeholder="e.g. jane@company.com"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">System Role</label>
                                    <select
                                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                                        value={newUser.role}
                                        onChange={e => setNewUSER({ ...newUser, role: e.target.value as AdminRole })}
                                        aria-label="Select System Role"
                                        title="Select System Role"
                                    >
                                        {rolesList.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                                        value={newUser.department}
                                        onChange={e => setNewUSER({ ...newUser, department: e.target.value })}
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
                                    <Upload size={16} />
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Confirmation Modal */}
            {pendingChange && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Confirm Changes</h3>
                        <p className="text-center text-slate-500 mb-6">
                            Are you sure you want to update permissions for <span className="font-bold text-slate-900">{employees.find((e: Employee) => e.employee_id === pendingChange.id)?.name || ''}</span>?
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

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg">
                                    {selectedUser.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{selectedUser.name}</h3>
                                    <p className="text-sm text-slate-500">{selectedUser.role_relation?.name} • {selectedUser.department_id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUSER(null)} className="text-slate-400 hover:text-slate-600" title="Close Details">
                                <XIcon />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="grid gap-6">
                                {/* System Access */}
                                <section>
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <Shield size={16} className="text-brand-600" />
                                        System Access & Permissions
                                    </h4>
                                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-medium text-slate-700">Assigned Role:</span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${selectedUser.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-brand-100 text-brand-700'}`}>
                                                {selectedUser.role}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xs text-slate-500 font-medium uppercase">Accessible Modules:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {rolePermissions[selectedUser.role as AdminRole]?.map((m: ModuleType) => (
                                                    <span key={m} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 flex items-center gap-1">
                                                        <Check size={12} className="text-emerald-500" />
                                                        {m}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Credentials & Security */}
                                <section>
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <Key size={16} className="text-orange-600" />
                                        Credentials & Security
                                    </h4>
                                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600 mb-1">Login Email: <span className="font-medium text-slate-900">{selectedUser.email}</span></p>
                                            <p className="text-xs text-slate-400">Last login: {new Date().toLocaleDateString()}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                requestAuth('SENSITIVE', `Regenerate password for ${selectedUser.name}`, () => {
                                                    const newPass = generateSystemPassword();
                                                    sendEmail(selectedUser.email, 'Security Alert: Password Reset', `Your password has been reset by an administrator.\n\nNew Password: ${newPass}`);
                                                    toast.success('Password Reset', { description: `Email sent to ${selectedUser.email}` });
                                                    logAction('Security', `Regenerated password for user ${selectedUser.name}`);
                                                });
                                            }}
                                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-2"
                                        >
                                            <RefreshCw size={14} />
                                            Reset Password
                                        </button>
                                    </div>
                                </section>

                                {/* USER Audit Log */}
                                <section>
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <Activity size={16} className="text-blue-600" />
                                        User Activity Log
                                    </h4>
                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-medium text-slate-500 flex justify-between">
                                            <span>Recent Actions</span>
                                            <span>Target: {selectedUser.name}</span>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto bg-white p-0">
                                            {/* Mocking filtered logs or using real logs if they have user association we can infer */}
                                            {activityLogs.length > 0 ? (
                                                <div className="divide-y divide-slate-100">
                                                    {activityLogs.slice(0, 10).map((log: ActivityLog) => (
                                                        <div key={log.id} className="px-4 py-3 hover:bg-slate-50 flex gap-3">
                                                            <div className="mt-0.5">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-slate-900 font-medium">{log.actionType}</p>
                                                                <p className="text-xs text-slate-500">{log.details}</p>
                                                                <p className="text-[10px] text-slate-400 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center text-slate-400 text-sm">No recent activity found for this user.</div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button
                                onClick={() => setSelectedUSER(null)}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 shadow-sm"
                            >
                                Close Details
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
                            to <strong className="text-slate-900">{pendingPermChange.module as ModuleType}</strong> for the <strong className="text-slate-900">{pendingPermChange.role as AdminRole}</strong> role.
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
