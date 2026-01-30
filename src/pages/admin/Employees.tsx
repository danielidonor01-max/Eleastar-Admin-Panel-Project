import React, { useState } from 'react';
import { Search, MoreVertical, Plus, Download, UserPlus, FileText, Trash2, QrCode } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import type { Employee } from '../../data/mockData';
import { EmployeeProfileModal } from '../../components/EmployeeProfileModal';

export const Employees: React.FC = () => {
    const { employees, addEmployee, updateEmployee, toggleQRStatus, logAction } = useAdmin();
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    // Form State
    const [newEmp, setNewEmp] = useState<Partial<Employee>>({
        status: 'active',
        employmentType: 'Full-time'
    });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmp.name || !newEmp.email) return;

        const emp: Employee = {
            id: `EMP-${Math.floor(Math.random() * 1000)}`,
            name: newEmp.name!,
            title: newEmp.title || 'Staff',
            department: newEmp.department || 'General',
            email: newEmp.email!,
            photoUrl: `https://ui-avatars.com/api/?name=${newEmp.name}`,
            status: newEmp.status as any || 'active',
            employmentType: newEmp.employmentType as any || 'Full-time',
            verifiedAt: new Date().toISOString(),
            joinedAt: new Date().toISOString(),
            salary: newEmp.salary || 100000,
            systemRole: 'User',
            accessGranted: newEmp.status === 'active'
        };
        addEmployee(emp);
        setShowAddModal(false);
        setNewEmp({ status: 'active', employmentType: 'Full-time' });
    };

    const handleAction = (action: string, emp: Employee) => {
        setActiveMenuId(null);
        if (action === 'suspend_qr') {
            toggleQRStatus(emp.id, 'suspended');
            alert(`QR Access suspended for ${emp.name}`);
        } else if (action === 'enable_qr') {
            toggleQRStatus(emp.id, 'active');
            alert(`QR Access enabled for ${emp.name}`);
        } else if (action === 'view_profile') {
            setSelectedEmployee(emp);
        } else if (action === 'terminate') {
            if (confirm(`Are you sure you want to TERMINATE ${emp.name}? This will revoke all access.`)) {
                updateEmployee(emp.id, { status: 'terminated', accessGranted: false });
                logAction('Employee Termination', `Terminated ${emp.name} (ID: ${emp.id})`);
            }
        }
    };

    return (
        <div onClick={() => setActiveMenuId(null)}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
                    <p className="text-slate-500">Manage your team members and their access.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors" title="Export List">
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

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-t-xl border border-slate-200 border-b-0 flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input id="search-emp" type="text" placeholder="Search by name, ID, or role..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-b-xl pb-20 shadow-sm overflow-visible">
                {/* overflow-visible needed for dropdowns if they go outside */}
                <div className="overflow-x-visible">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 border-b border-slate-200">Employee</th>
                                <th className="px-6 py-4 border-b border-slate-200">ID</th>
                                <th className="px-6 py-4 border-b border-slate-200">Role & Dept</th>
                                <th className="px-6 py-4 border-b border-slate-200">Type</th>
                                <th className="px-6 py-4 border-b border-slate-200">Status</th>
                                <th className="px-6 py-4 border-b border-slate-200 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-slate-50 transition-colors group relative">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden">
                                                <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="font-semibold text-slate-900">{emp.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-mono text-slate-500">{emp.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-900">{emp.title}</div>
                                        <div className="text-xs text-slate-500">{emp.department}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-700">{emp.employmentType}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${emp.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            emp.status === 'suspended' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                emp.status === 'terminated' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                                    'bg-red-50 text-red-700 border-red-100' // inactive
                                            }`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="relative">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === emp.id ? null : emp.id); }}
                                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                aria-label="Employee Actions"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeMenuId === emp.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 py-1 text-left">
                                                    {emp.status !== 'active' ? (
                                                        <button onClick={() => handleAction('enable_qr', emp)} className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2">
                                                            <QrCode size={14} />
                                                            Activate & Grant Access
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleAction('suspend_qr', emp)} className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                                                            <QrCode size={14} />
                                                            Suspend Access
                                                        </button>
                                                    )}

                                                    <button onClick={() => handleAction('view_profile', emp)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                        <FileText size={14} className="text-slate-400" />
                                                        View Profile
                                                    </button>

                                                    {emp.status !== 'terminated' && (
                                                        <>
                                                            <div className="border-t border-slate-100 my-1"></div>
                                                            <button onClick={() => handleAction('terminate', emp)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                                <Trash2 size={14} />
                                                                Terminate
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

            {/* Add Employee Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                                <UserPlus size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Onboard New Employee</h2>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="emp-name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    id="emp-name"
                                    type="text"
                                    required
                                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                                    value={newEmp.name || ''}
                                    onChange={e => setNewEmp({ ...newEmp, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="emp-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        id="emp-email"
                                        type="email"
                                        required
                                        className="w-full p-2 border border-slate-200 rounded-lg"
                                        value={newEmp.email || ''}
                                        onChange={e => setNewEmp({ ...newEmp, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="emp-title" className="block text-sm font-medium text-slate-700 mb-1">Role Title</label>
                                    <input
                                        id="emp-title"
                                        type="text"
                                        required
                                        className="w-full p-2 border border-slate-200 rounded-lg"
                                        value={newEmp.title || ''}
                                        onChange={e => setNewEmp({ ...newEmp, title: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="emp-dept" className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                    <select
                                        id="emp-dept"
                                        className="w-full p-2 border border-slate-200 rounded-lg"
                                        value={newEmp.department || 'Engineering'}
                                        onChange={e => setNewEmp({ ...newEmp, department: e.target.value })}
                                    >
                                        <option>Management</option>
                                        <option>Engineering</option>
                                        <option>Operations</option>
                                        <option>Product</option>
                                        <option>Marketing</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="emp-salary" className="block text-sm font-medium text-slate-700 mb-1">Salary (₦)</label>
                                    <input
                                        id="emp-salary"
                                        type="number"
                                        className="w-full p-2 border border-slate-200 rounded-lg"
                                        value={newEmp.salary || ''}
                                        onChange={e => setNewEmp({ ...newEmp, salary: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="emp-type" className="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
                                    <select
                                        id="emp-type"
                                        className="w-full p-2 border border-slate-200 rounded-lg"
                                        value={newEmp.employmentType || 'Full-time'}
                                        onChange={e => setNewEmp({ ...newEmp, employmentType: e.target.value as any })}
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Intern">Intern</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="emp-status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select
                                        id="emp-status"
                                        className="w-full p-2 border border-slate-200 rounded-lg"
                                        value={newEmp.status || 'active'}
                                        onChange={e => setNewEmp({ ...newEmp, status: e.target.value as any })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-bold">Create Profile & QR</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {selectedEmployee && (
                <EmployeeProfileModal
                    employee={selectedEmployee}
                    onClose={() => setSelectedEmployee(null)}
                />
            )}
        </div>
    );
};
