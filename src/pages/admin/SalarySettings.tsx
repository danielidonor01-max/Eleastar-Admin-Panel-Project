import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import type { AdminRole, SalaryStructure } from '../../data/mockData';
import { Save, Plus, ShieldAlert } from 'lucide-react';

export const SalarySettings: React.FC = () => {
    const { salaryStructures, saveSalaryStructure, currentUserRole } = useAdmin();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<SalaryStructure>>({});

    const ROLES: AdminRole[] = ['SUPER_ADMIN', 'COO', 'HR_ADMIN', 'FINANCE_ADMIN', 'PAYROLL_ADMIN', 'CHIEF_RISK_OFFICER', 'USER'];

    if (!['SUPER_ADMIN', 'HR_ADMIN'].includes(currentUserRole)) {
        return (
            <div className="p-8 text-center text-gray-500">
                <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-medium">Access Denied</h3>
                <p>You do not have permission to view Salary Structures.</p>
            </div>
        );
    }

    const handleEdit = (structure: SalaryStructure) => {
        setEditingId(structure.id);
        setEditForm(structure);
    };

    const handleCreate = () => {
        const newStructure: SalaryStructure = {
            id: `SS-${Date.now()}`,
            tenantId: 'tenant-default',
            role: 'USER',
            grade: 'New Grade',
            minSalary: 0,
            maxSalary: 0,
            currency: 'NGN'
        };
        setEditingId(newStructure.id);
        setEditForm(newStructure);
    };

    const handleSave = () => {
        if (editForm.role && editForm.grade) {
            saveSalaryStructure(editForm as SalaryStructure);
            setEditingId(null);
            setEditForm({});
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Salary Structures</h1>
                    <p className="text-gray-500">Define salary bands and grades per role.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    New Structure
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-700 font-medium">
                        <tr>
                            <th className="p-4">System Role</th>
                            <th className="p-4">Grade / Band</th>
                            <th className="p-4 text-right">Min Salary</th>
                            <th className="p-4 text-right">Max Salary</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {/* New Item Row if created but not saved specific logic could go here, but using editingId state */}
                        {editingId && !salaryStructures.find(s => s.id === editingId) && (
                            <tr className="bg-blue-50">
                                <td className="p-4">
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={editForm.role}
                                        onChange={e => setEditForm({ ...editForm, role: e.target.value as AdminRole })}
                                        aria-label="Role"
                                    >
                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </td>
                                <td className="p-4">
                                    <input
                                        className="w-full p-2 border rounded"
                                        value={editForm.grade || ''}
                                        onChange={e => setEditForm({ ...editForm, grade: e.target.value })}
                                        placeholder="e.g. L1 - Associate"
                                        aria-label="Grade"
                                    />
                                </td>
                                <td className="p-4 text-right">
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded text-right"
                                        value={editForm.minSalary || 0}
                                        onChange={e => setEditForm({ ...editForm, minSalary: Number(e.target.value) })}
                                        aria-label="Minimum Salary"
                                    />
                                </td>
                                <td className="p-4 text-right">
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded text-right"
                                        value={editForm.maxSalary || 0}
                                        onChange={e => setEditForm({ ...editForm, maxSalary: Number(e.target.value) })}
                                        aria-label="Maximum Salary"
                                    />
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={handleSave} className="text-blue-600 hover:text-blue-800 font-medium px-3">Save</button>
                                    <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                                </td>
                            </tr>
                        )}

                        {salaryStructures.map(structure => (
                            <tr key={structure.id} className="hover:bg-gray-50">
                                {editingId === structure.id ? (
                                    <>
                                        <td className="p-4">
                                            <span className="text-gray-500">{structure.role}</span>
                                        </td>
                                        <td className="p-4">
                                            <input
                                                className="w-full p-2 border rounded"
                                                value={editForm.grade || ''}
                                                onChange={e => setEditForm({ ...editForm, grade: e.target.value })}
                                                aria-label="Grade"
                                            />
                                        </td>
                                        <td className="p-4 text-right">
                                            <input
                                                type="number"
                                                className="w-full p-2 border rounded text-right"
                                                value={editForm.minSalary || 0}
                                                onChange={e => setEditForm({ ...editForm, minSalary: Number(e.target.value) })}
                                                aria-label="Minimum Salary"
                                            />
                                        </td>
                                        <td className="p-4 text-right">
                                            <input
                                                type="number"
                                                className="w-full p-2 border rounded text-right"
                                                value={editForm.maxSalary || 0}
                                                onChange={e => setEditForm({ ...editForm, maxSalary: Number(e.target.value) })}
                                                aria-label="Maximum Salary"
                                            />
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={handleSave} className="text-green-600 hover:text-green-800 font-medium px-2" aria-label="Save">
                                                <Save className="w-4 h-4 inline" />
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700 px-2">
                                                Cancel
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-4 font-medium text-gray-900">{structure.role}</td>
                                        <td className="p-4 text-gray-600"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold">{structure.grade}</span></td>
                                        <td className="p-4 text-right text-gray-900">₦{structure.minSalary.toLocaleString()}</td>
                                        <td className="p-4 text-right text-gray-900">₦{structure.maxSalary.toLocaleString()}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleEdit(structure)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}

                        {salaryStructures.length === 0 && !editingId && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No salary structures defined yet. Click "New Structure" to start.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
