import type { CMSPageSection } from '@/types/cms';

interface GenericSectionPreviewProps {
    section: CMSPageSection;
}

function renderValue(value: unknown): React.ReactNode {
    if (value === null || value === undefined) return <span className="text-slate-400 italic">—</span>;
    if (typeof value === 'string') return <span>{value}</span>;
    if (typeof value === 'number' || typeof value === 'boolean') return <span>{String(value)}</span>;
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            return (
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {value.map((item, i) => (
                        <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
                    ))}
                </ul>
            );
        }
        const obj = value as Record<string, unknown>;
        if (obj.url && typeof obj.url === 'string' && (obj.url.startsWith('http') || obj.url.startsWith('/'))) {
            return (
                <div className="mt-2">
                    <img src={obj.url} alt={String(obj.alt ?? '')} className="max-h-48 rounded-lg object-cover" />
                </div>
            );
        }
        return (
            <div className="mt-2 pl-4 border-l-2 border-slate-200 space-y-2">
                {Object.entries(obj).map(([k, v]) => (
                    <div key={k}>
                        <span className="text-xs font-mono text-slate-500">{k}: </span>
                        {typeof v === 'object' && v !== null ? renderValue(v) : <span className="text-slate-700">{String(v)}</span>}
                    </div>
                ))}
            </div>
        );
    }
    return <span>{String(value)}</span>;
}

export const GenericSectionPreview = ({ section }: GenericSectionPreviewProps) => {
    const content = section.content || {};
    const entries = Object.entries(content).filter(([, v]) => v !== undefined && v !== null && v !== '');

    return (
        <section className="py-12 px-6 md:px-12 border-b border-slate-200 bg-white">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{section.type}</span>
                    {section.label && (
                        <span className="text-sm text-slate-500">— {section.label}</span>
                    )}
                </div>
                {entries.length === 0 ? (
                    <p className="text-slate-400 italic text-sm">No content</p>
                ) : (
                    <div className="space-y-4">
                        {entries.map(([key, value]) => (
                            <div key={key} className="pb-4 border-b border-slate-100 last:border-0">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                                </div>
                                <div className="text-slate-800">{renderValue(value)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};
