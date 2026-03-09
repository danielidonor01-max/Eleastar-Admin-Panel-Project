import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { cmsService } from '@/services/cmsService';
import type { CMSPageDetail } from '@/types';
import { ArrowLeft, Edit } from 'lucide-react';
import { SectionPreviewRenderer } from '@/components/cms/preview';

const PagesListPreview = () => {
    const { pageSlug } = useParams<{ pageSlug: string }>();
    const [page, setPage] = useState<CMSPageDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!pageSlug) {
            setError('No page specified');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        cmsService
            .getPageBySlug(pageSlug)
            .then((res) => {
                if (res.success && res.data) {
                    setPage(res.data);
                } else {
                    setError(res.error || 'Page not found');
                    setPage(null);
                }
            })
            .catch(() => {
                setError('Failed to load page');
                setPage(null);
            })
            .finally(() => setLoading(false));
    }, [pageSlug]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin" />
                <p className="mt-4 text-sm font-medium">Loading preview...</p>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-slate-500">
                <p className="text-lg font-medium">{error || 'Page not found'}</p>
                <Link to="/admin/cms" className="mt-4 flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium">
                    <ArrowLeft size={18} /> Back to Pages
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
            <div className="shrink-0 bg-white border-b border-slate-200 px-8 py-4">
                <div className="flex items-center justify-between">
                    <Link
                        to={`/admin/cms/${page.slug}`}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
                    >
                        <ArrowLeft size={16} /> Back to Page
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">{page.name}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-xs font-mono text-slate-500">Preview</span>
                        <Link
                            to={`/admin/cms/${page.slug}`}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-brand-100 text-brand-600 hover:bg-brand-50"
                        >
                            <Edit size={16} /> Edit Page
                        </Link>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-auto">
                <SectionPreviewRenderer sections={page.sections} />
            </div>
        </div>
    );
};

export default PagesListPreview;
