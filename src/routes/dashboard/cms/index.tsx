import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCMSStore } from '@/stores/useCMSStore';
import type { CMSPageItem } from '@/types';
import { ExternalLink, Plus, Trash2, X, Pencil } from 'lucide-react';
import { toast } from 'sonner';

export const CMSPage = () => {
    const navigate = useNavigate();
    const { isLoading, pagesList, createCMSPage, updateCMSPage, deleteCMSPage, refreshCMSData } = useCMSStore();
    const [pages, setPages] = useState<CMSPageItem[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editPage, setEditPage] = useState<CMSPageItem | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newSlug, setNewSlug] = useState('');
    const [isSubPage, setIsSubPage] = useState(false);
    const [parentId, setParentId] = useState<string | number | ''>('');
    const [editTitle, setEditTitle] = useState('');
    const [editSlug, setEditSlug] = useState('');
    const [editIsSubPage, setEditIsSubPage] = useState(false);
    const [editParentId, setEditParentId] = useState<string | number | ''>('');

    const displayPages = pages.length > 0 ? pages : pagesList || [];
    const topLevelPages = displayPages.filter((p) => !p.parent_id || p.parent_id === null);
    const parentOptionsCreate = topLevelPages;
    const parentOptionsEdit = editPage
        ? topLevelPages.filter((p) => String(p.id) !== String(editPage.id))
        : topLevelPages;

    const resetCreateForm = () => {
        setNewTitle('');
        setNewSlug('');
        setIsSubPage(false);
        setParentId('');
    };

    const openEditModal = (page: CMSPageItem) => {
        setEditPage(page);
        setEditTitle(page.name);
        setEditSlug(page.slug);
        setEditIsSubPage(page.is_sub_page ?? !!page.parent_id);
        setEditParentId(page.parent_id ?? '');
        setShowEditModal(true);
    };

    const handleCreate = async () => {
        if (!newTitle || !newSlug) return;
        const slug = newSlug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const payload: Record<string, unknown> = { name: newTitle, slug };
        if (isSubPage && parentId) payload.parent_id = parentId;
        try {
            const res = await createCMSPage(payload);
            if (res.success) {
                setShowCreateModal(false);
                resetCreateForm();
                refreshCMSData();
            } else {
                toast.error('Creation Failed', { description: res.error || 'Unable to create page.' });
            }
        } catch (e: unknown) {
            toast.error('Error', { description: e instanceof Error ? e.message : 'Unknown error' });
        }
    };

    const handleEdit = async () => {
        if (!editPage || !editTitle || !editSlug) return;
        const slug = editSlug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const payload: Record<string, unknown> = { name: editTitle, slug };
        if (editIsSubPage && editParentId) payload.parent_id = editParentId;
        else if (!editIsSubPage) payload.parent_id = null;
        try {
            const res = await updateCMSPage(editPage.slug, payload);
            if (res.success) {
                setShowEditModal(false);
                setEditPage(null);
                refreshCMSData();
                toast.success('Page updated');
            } else {
                toast.error('Update Failed', { description: (res as { error?: string }).error || 'Unable to update page.' });
            }
        } catch (e: unknown) {
            toast.error('Error', { description: e instanceof Error ? e.message : 'Unknown error' });
        }
    };

    const handleDelete = async (slug: string) => {
        if (!window.confirm(`Delete page "${slug}"? This cannot be undone.`)) return;
        try {
            const res = await deleteCMSPage(slug);
            if (res.success) {
                setPages((prev) => prev.filter((p) => p.slug !== slug));
                toast.success('Deleted', { description: 'Page removed.' });
            } else {
                toast.error('Error', { description: 'Failed to delete page.' });
            }
        } catch (e: unknown) {
            toast.error('Error', { description: e instanceof Error ? e.message : 'Unknown error' });
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
            <div className="px-8 py-6 shrink-0">
                <div className="flex items-center justify-between mb-1">
                    <h1 className="text-2xl font-bold text-slate-900">CMS Pages</h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border border-brand-100 text-brand-600 hover:bg-brand-50 transition-all"
                    >
                        <Plus size={18} /> Add New Page
                    </button>
                </div>
                <p className="text-sm text-slate-500">Manage your website pages. Open to edit or preview.</p>
            </div>

            <div className="flex-1 overflow-auto px-8 pb-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin" />
                        <p className="text-sm font-medium">Loading pages...</p>
                    </div>
                ) : displayPages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3 border-2 border-dashed border-slate-200 rounded-2xl">
                        <p className="text-base font-medium">No pages yet</p>
                        <p className="text-sm">Create your first page to get started.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border border-brand-100 text-brand-600 hover:bg-brand-50"
                        >
                            <Plus size={18} /> Add New Page
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Name</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Slug</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {displayPages.map((page) => (
                                    <tr key={page.slug} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800">{page.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">/{page.slug}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full uppercase ${
                                                    page.status === 'live' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {page.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(page)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50"
                                                >
                                                    <Pencil size={16} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/cms/${page.slug}`)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50"
                                                >
                                                    <ExternalLink size={16} /> Open
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(page.slug)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-red-100 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Create New Page</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                                title="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Page Title</label>
                                <input
                                    value={newTitle}
                                    onChange={(e) => {
                                        setNewTitle(e.target.value);
                                        setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                                    }}
                                    placeholder="e.g. Technology"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                                <div className="flex">
                                    <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-500">/</span>
                                    <input
                                        value={newSlug}
                                        onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                                        placeholder="technology"
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-r-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isSubPage}
                                        onChange={(e) => {
                                            setIsSubPage(e.target.checked);
                                            if (!e.target.checked) setParentId('');
                                        }}
                                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Sub-page (child menu)</span>
                                </label>
                            </div>
                            {isSubPage && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Parent Page</label>
                                    <select
                                        value={String(parentId)}
                                        onChange={(e) => setParentId(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                                    >
                                        <option value="">Select parent page...</option>
                                        {parentOptionsCreate.map((p) => (
                                            <option key={p.slug} value={String(p.id)}>
                                                {p.name} ({p.slug})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!newTitle || !newSlug || (isSubPage && !parentId)}
                                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create Page
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && editPage && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Edit Page</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                                title="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Page Title</label>
                                <input
                                    value={editTitle}
                                    onChange={(e) => {
                                        setEditTitle(e.target.value);
                                        setEditSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                                    }}
                                    placeholder="e.g. Technology"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                                <div className="flex">
                                    <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-500">/</span>
                                    <input
                                        value={editSlug}
                                        onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                                        placeholder="technology"
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-r-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editIsSubPage}
                                        onChange={(e) => {
                                            setEditIsSubPage(e.target.checked);
                                            if (!e.target.checked) setEditParentId('');
                                        }}
                                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Sub-page (child menu)</span>
                                </label>
                            </div>
                            {editIsSubPage && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Parent Page</label>
                                    <select
                                        value={String(editParentId)}
                                        onChange={(e) => setEditParentId(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                                    >
                                        <option value="">Select parent page...</option>
                                        {parentOptionsEdit.map((p) => (
                                            <option key={p.slug} value={String(p.id)}>
                                                {p.name} ({p.slug})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEdit}
                                disabled={!editTitle || !editSlug || (editIsSubPage && !editParentId)}
                                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
