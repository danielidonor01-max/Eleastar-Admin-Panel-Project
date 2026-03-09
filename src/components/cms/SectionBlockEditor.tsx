import { useState } from 'react';
import { DynamicJsonEditor } from '@/components/DynamicJsonEditor';
import type { CMSPageSection } from '@/types/cms';
import { getSectionTypeDef, getDefaultContent } from './sectionTypes';
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react';

interface SectionBlockEditorProps {
    sections: CMSPageSection[];
    pageId: number;
    onSectionContentChange: (sectionId: number, content: Record<string, unknown>) => void;
    onAddSection: (type: string, order: number, defaultContent?: Record<string, unknown>) => Promise<void>;
    onRemoveSection: (sectionId: number) => Promise<void>;
    onReorderSection: (sectionId: number, direction: 'up' | 'down') => Promise<void>;
    /** Optional: section types available to add (from backend or config). If empty, uses "Add custom block" flow. */
    availableTypes?: { type: string; label?: string }[];
    isDirty?: boolean;
}

export const SectionBlockEditor = ({
    sections,
    onSectionContentChange,
    onAddSection,
    onRemoveSection,
    onReorderSection,
    availableTypes = [],
}: SectionBlockEditorProps) => {
    const [addMenuOpen, setAddMenuOpen] = useState(false);
    const [customModalOpen, setCustomModalOpen] = useState(false);
    const [customType, setCustomType] = useState('');
    const [adding, setAdding] = useState(false);
    const sorted = [...sections].sort((a, b) => a.order - b.order);

    const typesFromSections = Array.from(new Set(sections.map((s) => s.type))).map((type) => ({
        type,
        label: getSectionTypeDef(type)?.label ?? type,
    }));
    const addOptions = availableTypes.length > 0 ? availableTypes : typesFromSections;

    const handleAdd = async (type: string) => {
        setAdding(true);
        setAddMenuOpen(false);
        setCustomModalOpen(false);
        setCustomType('');
        try {
            const content = getDefaultContent(type);
            await onAddSection(type, sorted.length, content);
        } finally {
            setAdding(false);
        }
    };

    const handleAddCustom = () => {
        const t = customType.trim();
        if (t) handleAdd(t);
    };

    const handleRemove = async (sectionId: number) => {
        if (!window.confirm('Remove this section?')) return;
        await onRemoveSection(sectionId);
    };

    const handleContentChange = (section: CMSPageSection, newContent: Record<string, unknown>) => {
        onSectionContentChange(section.id, newContent);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Content Blocks</h3>
                <div className="relative">
                    <button
                        onClick={() => setAddMenuOpen(!addMenuOpen)}
                        disabled={adding}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                    >
                        <Plus size={16} /> Add Block
                        <ChevronDown size={14} className={addMenuOpen ? 'rotate-180' : ''} />
                    </button>
                    {addMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => { setAddMenuOpen(false); setCustomModalOpen(false); }} />
                            <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-20">
                                {addOptions.map((opt) => (
                                    <button
                                        key={opt.type}
                                        onClick={() => handleAdd(opt.type)}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors flex items-center gap-3"
                                    >
                                        <span className="font-medium text-slate-800">{opt.label ?? opt.type}</span>
                                        <span className="text-xs text-slate-400 font-mono">{opt.type}</span>
                                    </button>
                                ))}
                                <button
                                    onClick={() => { setAddMenuOpen(false); setCustomModalOpen(true); }}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors flex items-center gap-3 border-t border-slate-100 mt-1 pt-2"
                                >
                                    <span className="font-medium text-slate-600">Custom section...</span>
                                    <span className="text-xs text-slate-400">Enter type name</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {customModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                        <h4 className="font-bold text-slate-800 mb-2">Add Custom Block</h4>
                        <p className="text-sm text-slate-500 mb-4">Enter the section type (e.g. Hero, Gallery, CustomBlock)</p>
                        <input
                            value={customType}
                            onChange={(e) => setCustomType(e.target.value)}
                            placeholder="Section type"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-500 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                        />
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => { setCustomModalOpen(false); setCustomType(''); }}
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCustom}
                                disabled={!customType.trim()}
                                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {sorted.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                    <p className="text-slate-500 font-medium">No content blocks yet</p>
                    <p className="text-sm text-slate-400 mt-1">Add blocks to build your page</p>
                    <button
                        onClick={() => setAddMenuOpen(true)}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
                    >
                        <Plus size={16} /> Add Block
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {sorted.map((section, index) => {
                        const def = getSectionTypeDef(section.type);
                        return (
                            <div
                                key={section.id}
                                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col gap-0.5">
                                            <button
                                                onClick={() => onReorderSection(section.id, 'up')}
                                                disabled={index === 0}
                                                className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ChevronUp size={16} />
                                            </button>
                                            <button
                                                onClick={() => onReorderSection(section.id, 'down')}
                                                disabled={index === sorted.length - 1}
                                                className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ChevronDown size={16} />
                                            </button>
                                        </div>
                                        <GripVertical size={16} className="text-slate-400" />
                                        <span className="text-sm font-bold text-slate-700">
                                            {def?.label ?? section.label ?? section.type}
                                        </span>
                                        <span className="text-xs font-mono text-slate-400">{section.section_key}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(section.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove section"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <DynamicJsonEditor
                                        data={section.content ?? {}}
                                        onChange={(newContent) =>
                                            handleContentChange(section, newContent as Record<string, unknown>)
                                        }
                                        label={section.section_key}
                                        level={1}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
