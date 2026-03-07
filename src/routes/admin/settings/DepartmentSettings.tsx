import React, { useState } from 'react';
import { useAdmin } from '@/context/admin';
import type { Department } from '@/types';
import { Save, Plus, ShieldAlert, Trash2 } from 'lucide-react';

export const DepartmentSettings: React.FC = () => {
    const { departments, saveDepartment, deleteDepartment, currentUserRole } = useAdmin();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Department>>({});

    if (!['SUPER_ADMIN', 'HR_ADMIN'].includes(currentUserRole)) {
        return (
            <div className="p-8 text-center text-gray-500">
                <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-medium">Access Denied</h3>
                <p>You do not have permission to view Department Settings.</p>
            </div>
        );
    }

    const handleEdit = (dept: Department) => {
        setEditingId(dept.id);
        setEditForm(dept);
    };

    const handleCreate = () => {
        const newDept: Department = {
            id: `DEPT-${Date.now()}`,
            tenantId: 'tenant-default',
            name: '',
            description: '',
            minSalary: 0,
            maxSalary: 0,
            currency: 'NGN'
        };
        setEditingId(newDept.id);
        setEditForm(newDept);
    };

    const handleSave = () => {
        if (editForm.name) {
            saveDepartment(editForm as Department);
            setEditingId(null);
            setEditForm({});
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this department?")) {
            deleteDepartment(id);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Departments & Salary Bands</h1>
                    <p className="text-gray-500">Manage departments and their associated salary minimums and maximums.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    New Department
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-700 font-medium text-sm">
                        <tr>
                            <th className="p-4 w-1/4">Department Name</th>
                            <th className="p-4 w-1/4">Description</th>
                            <th className="p-4 text-right w-1/6">Min Salary</th>
                            <th className="p-4 text-right w-1/6">Max Salary</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {editingId && !departments.find((d: Department) => d.id === editingId) && (
                            <tr className="bg-blue-50">
                                <td className="p-4">
                                    <input
                                        className="w-full p-2 border rounded"
                                        value={editForm.name || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, name: e.target.value })}
                                        placeholder="e.g. Engineering"
                                        autoFocus
                                    />
                                </td>
                                <td className="p-4">
                                    <input
                                        className="w-full p-2 border rounded"
                                        value={editForm.description || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, description: e.target.value })}
                                        placeholder="Brief description"
                                    />
                                </td>
                                <td className="p-4 text-right">
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded text-right"
                                        value={editForm.minSalary || 0}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, minSalary: Number(e.target.value) })}
                                    />
                                </td>
                                <td className="p-4 text-right">
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded text-right"
                                        value={editForm.maxSalary || 0}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, maxSalary: Number(e.target.value) })}
                                    />
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2 items-center h-full pt-4">
                                    <button onClick={handleSave} className="text-blue-600 hover:text-blue-800 font-medium px-2">Save</button>
                                    <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700 px-2">Cancel</button>
                                </td>
                            </tr>
                        )}

                        {departments.map((dept: Department) => (
                            <tr key={dept.id} className="hover:bg-gray-50">
                                {editingId === dept.id ? (
                                    <>
                                        <td className="p-4">
                                            <input
                                                className="w-full p-2 border rounded font-medium"
                                                value={editForm.name || ''}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, name: e.target.value })}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <input
                                                className="w-full p-2 border rounded text-sm"
                                                value={editForm.description || ''}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, description: e.target.value })}
                                            />
                                        </td>
                                        <td className="p-4 text-right">
                                            <input
                                                type="number"
                                                className="w-full p-2 border rounded text-right"
                                                value={editForm.minSalary || 0}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, minSalary: Number(e.target.value) })}
                                            />
                                        </td>
                                        <td className="p-4 text-right">
                                            <input
                                                type="number"
                                                className="w-full p-2 border rounded text-right"
                                                value={editForm.maxSalary || 0}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, maxSalary: Number(e.target.value) })}
                                            />
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2 items-center h-full pt-4">
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
                                        <td className="p-4 font-semibold text-gray-900">{dept.name}</td>
                                        <td className="p-4 text-gray-600 text-sm truncate max-w-[200px]">{dept.description}</td>
                                        <td className="p-4 text-right text-gray-900">₦{dept.minSalary.toLocaleString()}</td>
                                        <td className="p-4 text-right text-gray-900">₦{dept.maxSalary.toLocaleString()}</td>
                                        <td className="p-4 text-right flex justify-end gap-3 items-center h-full">
                                            <button
                                                onClick={() => handleEdit(dept as Department)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(dept.id as string)}
                                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition"
                                                title="Delete Department"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}

                        {departments.length === 0 && !editingId && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No departments defined yet. Click "New Department" to start.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
