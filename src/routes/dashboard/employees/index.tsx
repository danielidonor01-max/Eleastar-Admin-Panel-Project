import React, { useEffect, useState } from 'react';
import { Search, MoreVertical, Plus, Download, UserPlus, FileText, Trash2, QrCode, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useEmployeeStore } from '@/stores/useEmployeeStore';
import { useAuditStore } from '@/stores/useAuditStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useConfirmStore } from '@/stores/useConfirmStore';
import { useDepartmentStore } from '@/stores/useDepartmentStore';
import type { Department, Employee, RolesProps } from '@/types';
import { EmployeeProfileModal } from '@/components/EmployeeProfileModal';
import { ContractManagementModal } from '@/components/ContractManagementModal';

export const Employees: React.FC = () => {
    const {employees, fetchEmployees, addEmployee, updateEmployee, toggleQRStatus, updateEmployeeContract, uploadContractDocument} = useEmployeeStore();
    const {logAction} = useAuditStore();
    const {requestAuth} = useSettingsStore();
    const {departments} = useDepartmentStore();
    const {showConfirm} = useConfirmStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [contractEmployee, setContractEmployee] = useState<Employee | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);



    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const [newEmp, setNewEmp] = useState<Partial<Employee> & { password?: string; password_confirmation?: string; role_id?: string }>({
        status: 'active',
        employment_type: 'Full-time',
        department_id: departments.length > 0 ? departments[0].id : '1',
        salary: '0',
        role_id: '3'
    });

    const handleAddSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newEmp.name || !newEmp.email || !newEmp.department_id || !newEmp.salary || !newEmp.password || !newEmp.password_confirmation || !newEmp.role_id) {
            toast.error('Validation Error', { description: 'Please fill in all required fields including password and role.' });
            return;
        }
        if (newEmp.password !== newEmp.password_confirmation) {
            toast.error('Validation Error', { description: 'Passwords do not match.' });
            return;
        }
        const dept = departments.find((d: Department) => d.id === newEmp.department_id);
        if (dept) {
            if (Number(newEmp.salary!) < dept.minSalary || Number(newEmp.salary!) > dept.maxSalary) {
                toast.error('Validation Error', { description: `Salary must be between ₦${dept.minSalary.toLocaleString()} and ₦${dept.maxSalary.toLocaleString()} for the ${dept.name} department.` });
                return;
            }
        } else {
            toast.error('Validation Error', { description: 'Selected department is invalid.' });
            return;
        }
        const emp: Partial<Employee> & { password?: string; password_confirmation?: string; role_id?: never } = {
            id: Number(`EMP-${Date.now().toString().slice(-4)}`),
            name: newEmp.name!,
            role_relation: newEmp.role_relation as RolesProps || 'Staff',
            department_id: newEmp.department_id!,
            email: newEmp.email!,
            photoUrl: `https://ui-avatars.com/api/?name=${newEmp.name}`,
            status: newEmp.status as Employee['status'] || 'active',
            employment_type: newEmp.employment_type as Employee['employment_type'] || 'Full-time',
            verifiedAt: new Date().toISOString(),
            joinedAt: new Date().toISOString(),
            salary: newEmp.salary || '100000',
            hire_date: new Date().toISOString(),
            password: newEmp.password,
            password_confirmation: newEmp.password_confirmation,
            role_id: newEmp?.role_id as unknown as never,
            employee_id: `EMP-${Date.now().toString().slice(-4)}`,
        };
        await addEmployee(emp as Omit<Employee, 'tenantId'> & { password?: string; password_confirmation?: string; role_id?: number });
        setShowAddModal(false);
        setNewEmp({ status: 'active', employment_type: 'Full-time', role_id: '3' });
    };

    const handleAction = (action: string, emp: Employee) => {
        setActiveMenuId(null);
        if (action === 'suspend_qr') {
            requestAuth('SENSITIVE', `Suspend QR Access for ${emp.name}`, () => {
                toggleQRStatus(emp.employee_id, 'suspended');
                toast.success('Access Suspended', { description: `${emp.name}'s QR access has been suspended.` });
            });
        } else if (action === 'enable_qr') {
            requestAuth('SENSITIVE', `Re-activate QR Access for ${emp.name}`, () => {
                toggleQRStatus(emp.employee_id, 'active');
                toast.success('Access Restored', { description: `${emp.name}'s QR access has been restored.` });
            });
        } else if (action === 'view_profile') {
            setSelectedEmployee(emp);
        } else if (action === 'manage_contract') {
            setContractEmployee(emp);
        } else if (action === 'terminate') {
            showConfirm({
                title: 'Terminate Employee',
                message: `Are you sure you want to completely terminate ${emp.name}? This cannot be easily undone.`,
                onConfirm: () => {
                    requestAuth('SENSITIVE', `PERMANENTLY TERMINATE ${emp.name}`, () => {
                        updateEmployee(emp.employee_id, { status: 'exited' });
                        logAction('Employee Termination', `Terminated ${emp.name} (${emp.id})`);
                        toast.success('Employee Terminated', { description: `${emp.name} has been marked as exited.` });
                    });
                }
            });
        }
    };

    const filteredEmployees = employees.filter((emp: Employee) => {
        const query = searchQuery.toLowerCase();
        return (
            emp.name?.toLowerCase().includes(query) ||
            emp.role_relation?.name.toLowerCase().includes(query) ||
            emp.department_id?.toLowerCase().includes(query) ||
            emp.employee_id?.toLowerCase().includes(query) ||
            emp.status?.toLowerCase().includes(query)
        );
    });

    const handleExport = () => {
        if (filteredEmployees.length === 0) return;
        const headers = ['Full Name', 'Role', 'Department', 'Employment Status', 'Date Joined'];
        const rows = filteredEmployees.map((emp: Employee) => [
            emp.name,
            emp.role_relation?.name || 'N/A',
            emp.department_id || 'N/A',
            emp.status,
            new Date(emp.joinedAt).toISOString().split('T')[0]
        ].map(val => `"${val}"`).join(','));
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `eleastar-employees-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div onClick={() => setActiveMenuId(null)}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
                    <p className="text-slate-500">Manage your team members and their access.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        disabled={filteredEmployees.length === 0}
                        className={`flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg font-medium transition-colors ${filteredEmployees.length === 0 ? 'opacity-50 cursor-not-allowed text-slate-400' : 'hover:bg-slate-50 text-slate-700'}`}
                        title="Export List"
                    >
                        <Download size={18} />
                        Export
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium transition-colors shadow-sm"
                        title="Add New Employee"
                    >
                        <Plus size={18} />
                        Add Employee
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-t-xl border border-slate-200 border-b-0 flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        id="search-emp"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, ID, or role..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-b-xl pb-20 shadow-sm overflow-visible">
                <div className="overflow-x-visible">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 border-b border-slate-200">Employee</th>
                                <th className="px-6 py-4 border-b border-slate-200">Job Title & Dept</th>
                                <th className="px-6 py-4 border-b border-slate-200">Employment Type</th>
                                <th className="px-6 py-4 border-b border-slate-200">Status</th>
                                <th className="px-6 py-4 border-b border-slate-200 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEmployees.map((emp: Employee) => (
                                <tr key={emp.id} className="hover:bg-slate-50 transition-colors group relative cursor-pointer" onClick={() => setSelectedEmployee(emp)}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden">
                                                <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="font-semibold text-slate-900">{emp.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-900">{emp.role_relation?.name}</div>
                                        <div className="text-xs text-slate-500">{emp.department_id ?? 'General'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-700 capitalize">{emp.employment_type ?? 'Full-time'}</div>
                                        <div className="text-xs text-slate-500">Hire Date: {emp.hire_date ? new Date(emp.hire_date).toLocaleDateString() : 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${emp.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            emp.status === 'suspended' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                emp.status === 'exited' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    emp.status === 'probation' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        'bg-slate-100 text-slate-600 border-slate-200' }`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="relative">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === emp.employee_id ? null : emp.employee_id); }}
                                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                aria-label="Employee Actions"
                                            >
                                                <MoreVertical size={18} />
                                            </button>
                                            {activeMenuId === emp.employee_id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 py-1 text-left">
                                                    {emp.status !== 'active' ? (
                                                        <button onClick={() => handleAction('enable_qr', emp)} className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2">
                                                            <QrCode size={14} /> Activate & Grant Access
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleAction('suspend_qr', emp)} className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                                                            <QrCode size={14} /> Suspend Access
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleAction('view_profile', emp)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                        <FileText size={14} className="text-slate-400" /> View Profile
                                                    </button>
                                                    <button onClick={() => handleAction('manage_contract', emp)} className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2">
                                                        <FileText size={14} /> Manage Contract
                                                    </button>
                                                    {emp.status !== 'exited' && (
                                                        <>
                                                            <div className="border-t border-slate-100 my-1"></div>
                                                            <button onClick={() => handleAction('terminate', emp)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                                <Trash2 size={14} /> Terminate
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                                <UserPlus size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Onboard New Employee</h2>
                        </div>
                        <form onSubmit={ (e) => handleAddSubmit(e)} className="space-y-6">
                            <div>
                                <label htmlFor="emp-name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input id="emp-name" type="text" required className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500" value={newEmp.name || ''} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="emp-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input id="emp-email" type="email" required className="w-full p-2 border border-slate-200 rounded-lg" value={newEmp.email || ''} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} />
                                </div>
                                <div>
                                    <label htmlFor="emp-title" className="block text-sm font-medium text-slate-700 mb-1">Role Title</label>
                                    <input id="emp-title" type="text" required className="w-full p-2 border border-slate-200 rounded-lg" value={newEmp.role_relation?.name || ''} onChange={e => setNewEmp({ ...newEmp, role_relation: { ...newEmp.role_relation, name: e.target.value } as RolesProps })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="emp-dept" className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                    <select id="emp-dept" className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" value={newEmp.department_id || (departments[0]?.id || '1')} onChange={e => setNewEmp({ ...newEmp, department_id: e.target.value })} required>
                                        {departments.length > 0 ? departments.map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>) : <option value="1">General</option>}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="emp-salary" className="block text-sm font-medium text-slate-700 mb-1">Salary (â‚¦)</label>
                                    <input id="emp-salary" type="number" className="w-full p-2 border border-slate-200 rounded-lg" value={newEmp.salary || ''} onChange={e => setNewEmp({ ...newEmp, salary: e.target.value })} required />
                                    {newEmp.department_id && departments.find((d: Department) => d.id === newEmp.department_id) && (
                                        <p className="text-xs text-brand-600 mt-1">Band: â‚¦{departments.find((d: Department) => d.id === newEmp.department_id)?.minSalary.toLocaleString()} - â‚¦{departments.find((d: Department) => d.id === newEmp.department_id)?.maxSalary.toLocaleString()}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="emp-role" className="block text-sm font-medium text-slate-700 mb-1">System Role</label>
                                    <select id="emp-role" className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" value={newEmp.role_id || '3'} onChange={e => setNewEmp({ ...newEmp, role_id: e.target.value })}>
                                        <option value={1}>Administrator</option>
                                        <option value={2}>HR Manager</option>
                                        <option value={3}>User</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="emp-type" className="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
                                    <select id="emp-type" className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" value={newEmp.employment_type || 'Full-time'} onChange={e => setNewEmp({ ...newEmp, employment_type: e.target.value as Employee['employment_type'] })}>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Intern">Intern</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="emp-password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                    <div className="relative">
                                        <input id="emp-password" type={showPassword ? 'text' : 'password'} required className="w-full p-2 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" value={newEmp.password || ''} onChange={e => setNewEmp({ ...newEmp, password: e.target.value })} minLength={6} />
                                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-600" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="emp-password-conf" className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                                    <div className="relative">
                                        <input id="emp-password-conf" type={showConfirmPassword ? 'text' : 'password'} required className="w-full p-2 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" value={newEmp.password_confirmation || ''} onChange={e => setNewEmp({ ...newEmp, password_confirmation: e.target.value })} minLength={6} />
                                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="emp-status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                <select id="emp-status" className="w-full p-2 border border-slate-200 rounded-lg" value={newEmp.status || 'onboarding'} onChange={e => setNewEmp({ ...newEmp, status: e.target.value as Employee['status'] })}>
                                    <option value="onboarding">Onboarding</option>
                                    <option value="probation">Probation</option>
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="exited">Exited</option>
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Create Profile & QR</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedEmployee && (
                <EmployeeProfileModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
            )}
            {contractEmployee && (
                <ContractManagementModal
                    employee={contractEmployee}
                    onClose={() => setContractEmployee(null)}
                    onSaveContract={(contractInfo) => {
                        updateEmployeeContract(contractEmployee.employee_id, contractInfo);
                        setContractEmployee(null);
                    }}
                    onUploadDocument={(document) => {
                        uploadContractDocument(contractEmployee.employee_id, document);
                    }}
                />
            )}
        </div>
    );
};
