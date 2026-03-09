import { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { cmsService } from '@/services/cmsService';
import { useCMSStore } from '@/stores/useCMSStore';
import type { CMSPageDetail, CMSPageSection } from '@/types';
import { PageSEOPanel } from '@/components/cms/PageSEOPanel';
import { SectionBlockEditor } from '@/components/cms/SectionBlockEditor';
import { SectionPreviewRenderer } from '@/components/cms/preview';
import { getDefaultContent, generateSectionKey } from '@/components/cms/sectionTypes';
import {
    ArrowLeft,
    Globe,
    Layout,
    FileCode,
    Eye,
    Trash2,
    AlertCircle,
    Save,
    EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

const PagesList = () => {
    const { pageSlug } = useParams<{ pageSlug: string }>();
    const navigate = useNavigate();
    const { updateCMSPageStatus, updateSEOMetadata, deleteCMSPage, refreshCMSData } = useCMSStore();
    const [page, setPage] = useState<CMSPageDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState<CMSPageSection[]>([]);
    const [isDirty, setIsDirty] = useState(false);
    const [activeView, setActiveView] = useState<'content' | 'seo' | 'preview' | 'json'>('content');
    const [jsonInput, setJsonInput] = useState('{}');
    const [jsonError, setJsonError] = useState<string | null>(null);

    const loadPage = useCallback(async () => {
        if (!pageSlug) return;
        setLoading(true);
        try {
            const res = await cmsService.getPageBySlug(pageSlug);
            if (res.success && res.data) {
                setPage(res.data);
                setSections(res.data.sections);
                setJsonInput(JSON.stringify(res.data.sections, null, 2));
            }
        } catch {
            toast.error('Error', { description: 'Failed to load page.' });
        } finally {
            setLoading(false);
        }
    }, [pageSlug]);

    useEffect(() => {
        loadPage();
    }, [loadPage]);

    useEffect(() => {
        if (activeView === 'json') setJsonInput(JSON.stringify(sections, null, 2));
    }, [activeView, sections]);

    const handleSectionContentChange = useCallback(
        async (sectionId: number, content: Record<string, unknown>) => {
            setSections((prev) =>
                prev.map((s) => (s.id === sectionId ? { ...s, content } : s))
            );
            setIsDirty(true);
        },
        []
    );

    const handleAddSection = useCallback(
        async (type: string, order: number, defaultContent?: Record<string, unknown>) => {
            if (!page) return;
            const sectionKey = generateSectionKey(type);
            const content = defaultContent ?? getDefaultContent(type) ?? {};
            try {
                const res = await cmsService.createCMSSection({
                    page_id: page.id,
                    type,
                    section_key: sectionKey,
                    order,
                    content,
                    status: 'published',
                });
                if (res.success && res.data) {
                    const created = res.data as CMSPageSection;
                    setSections((prev) => [...prev, created].sort((a, b) => a.order - b.order));
                    setPage((p) => (p ? { ...p, sections: [...p.sections, created] } : null));
                    toast.success('Block added');
                    loadPage();
                } else {
                    toast.error('Failed to add block');
                }
            } catch (e: unknown) {
                toast.error('Error', { description: e instanceof Error ? e.message : 'Unknown error' });
            }
        },
        [page, loadPage]
    );

    const handleRemoveSection = useCallback(
        async (sectionId: number) => {
            try {
                const res = await cmsService.deleteCMSSection(sectionId);
                if (res.success) {
                    setSections((prev) => prev.filter((s) => s.id !== sectionId));
                    setPage((p) => (p ? { ...p, sections: p.sections.filter((s) => s.id !== sectionId) } : null));
                    toast.success('Block removed');
                }
            } catch (e: unknown) {
                toast.error('Error', { description: e instanceof Error ? e.message : 'Unknown error' });
            }
        },
        []
    );

    const handleReorderSection = useCallback(
        async (sectionId: number, direction: 'up' | 'down') => {
            const sorted = [...sections].sort((a, b) => a.order - b.order);
            const idx = sorted.findIndex((s) => s.id === sectionId);
            if (idx < 0) return;
            const newIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (newIdx < 0 || newIdx >= sorted.length) return;
            const [moved] = sorted.splice(idx, 1);
            sorted.splice(newIdx, 0, moved);
            const updates = sorted.map((s, i) => ({ ...s, order: i }));
            setSections(updates);
            setIsDirty(true);
            try {
                for (const s of updates) {
                    await cmsService.updateCMSSection(s.id, { order: s.order });
                }
                toast.success('Reordered');
            } catch {
                toast.error('Failed to save order');
                loadPage();
            }
        },
        [sections, loadPage]
    );

    const handleSave = async () => {
        if (!page || jsonError) return;
        try {
            for (const section of sections) {
                await cmsService.updateCMSSection(section.id, { content: section.content });
            }
            toast.success('Published', { description: `${page.name} changes are now live.` });
            setIsDirty(false);
            await loadPage();
        } catch (e: unknown) {
            toast.error('Publish Failed', { description: e instanceof Error ? e.message : 'Unknown error' });
        }
    };

    const handleDelete = async () => {
        if (!page || !window.confirm(`Delete page "${page.slug}"? This cannot be undone.`)) return;
        try {
            const res = await deleteCMSPage(page.slug);
            if (res.success) {
                toast.success('Deleted');
                navigate('/admin/cms');
            }
        } catch (e: unknown) {
            toast.error('Error', { description: e instanceof Error ? e.message : 'Unknown error' });
        }
    };

    const handleToggleStatus = async () => {
        if (!page) return;
        const next = page.status === 'live' ? 'draft' : 'live';
        try {
            const res = await updateCMSPageStatus(page.slug, next);
            if (res.success) {
                setPage((p) => (p ? { ...p, status: next } : null));
                refreshCMSData();
                toast.success(`Page set to ${next}`);
            }
        } catch (e: unknown) {
            toast.error('Error', { description: e instanceof Error ? e.message : 'Unknown error' });
        }
    };

    const handleSaveSEO = async (payload: Record<string, unknown>) => {
        if (!page) return;
        try {
            const res = await updateSEOMetadata(page.slug, payload);
            if (res.success) {
                toast.success('SEO Updated');
                await loadPage();
            }
        } catch (e: unknown) {
            toast.error('SEO Save Failed', { description: e instanceof Error ? e.message : 'Unknown error' });
        }
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJsonInput(e.target.value);
        setIsDirty(true);
        setJsonError(null);
        try {
            const parsed = JSON.parse(e.target.value);
            setSections(Array.isArray(parsed) ? parsed : []);
        } catch (err: unknown) {
            setJsonError(err instanceof Error ? err.message : 'Unknown error');
        }
    };

    const mergedSections = sections;

    if (loading && !page) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin" />
                <p className="mt-4 text-sm font-medium">Loading page...</p>
            </div>
        );
    }

    if (!page) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-slate-500">
                <p className="text-lg font-medium">Page not found</p>
                <Link to="/admin/cms" className="mt-4 flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium">
                    <ArrowLeft size={18} /> Back to Pages
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white min-h-[calc(100vh-64px)]">
            <div className="px-8 py-6 shrink-0 border-b border-slate-100 bg-white">
                <Link to="/admin/cms" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4">
                    <ArrowLeft size={16} /> Back to Pages
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{page.name}</h1>
                        <p className="text-sm text-slate-500 font-mono mt-1">/{page.slug}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span
                                className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full uppercase ${
                                    page.status === 'live' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                                {page.status}
                            </span>
                            <Link
                                to={`/admin/cms/${page.slug}/preview`}
                                className="text-xs font-medium text-brand-600 hover:text-brand-700"
                            >
                                Preview
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleToggleStatus}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                            {page.status === 'live' ? <EyeOff size={18} /> : <Eye size={18} />}
                            {page.status === 'live' ? 'Hide' : 'Show'}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border border-red-100 text-red-600 hover:bg-red-50"
                        >
                            <Trash2 size={18} /> Delete
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!isDirty || !!jsonError}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold shadow-md ${
                                !isDirty || jsonError
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-brand-600 text-white hover:bg-brand-700'
                            }`}
                        >
                            <Save size={18} /> Publish
                        </button>
                    </div>
                </div>
                {isDirty && (
                    <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">
                        <AlertCircle size={14} /> Unsaved changes
                    </span>
                )}
            </div>

            <div className="flex-1 flex flex-col overflow-hidden px-8 pb-8">
                <div className="flex items-center gap-8 border-b border-slate-100 mb-6">
                    {[
                        { key: 'content', label: 'Blocks', icon: <Layout size={16} /> },
                        { key: 'seo', label: 'SEO', icon: <Globe size={16} /> },
                        { key: 'json', label: 'JSON', icon: <FileCode size={16} /> },
                        { key: 'preview', label: 'Preview', icon: <Eye size={16} /> },
                    ].map(({ key, label, icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveView(key as typeof activeView)}
                            className={`flex items-center gap-2 py-4 text-sm font-medium transition-all relative ${
                                activeView === key ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {icon}
                            {label}
                            {activeView === key && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {activeView === 'content' && (
                        <div className="flex-1 overflow-auto">
                            <div className="max-w-6xl mx-auto">
                                <SectionBlockEditor
                                    sections={sections}
                                    pageId={page.id}
                                    onSectionContentChange={handleSectionContentChange}
                                    onAddSection={handleAddSection}
                                    onRemoveSection={handleRemoveSection}
                                    onReorderSection={handleReorderSection}
                                    isDirty={isDirty}
                                />
                            </div>
                        </div>
                    )}
                    {activeView === 'seo' && <PageSEOPanel page={page} onSave={handleSaveSEO} />}
                    {activeView === 'json' && (
                        <div className="flex-1 flex flex-col">
                            <p className="text-xs text-slate-500 mb-2">Edit sections as JSON (array format)</p>
                            <textarea
                                value={jsonInput}
                                onChange={handleJsonChange}
                                className="flex-1 min-h-[400px] p-6 font-mono text-sm bg-[#1e1e1e] text-slate-300 rounded-xl focus:outline-none"
                                spellCheck={false}
                            />
                        </div>
                    )}
                    {activeView === 'preview' && (
                        <div className="flex-1 overflow-auto">
                            <SectionPreviewRenderer sections={mergedSections} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PagesList;
