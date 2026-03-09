import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Link as LinkIcon, Edit3, Trash2, Plus } from 'lucide-react';

interface DynamicJsonEditorProps {
    data: any;
    onChange: (newData: any) => void;
    label?: string;
    level?: number;
    path?: string; // used for debugging or fine-grained tracing
}

/**
 * A recursive component that takes ANY JSON object/array and renders it as an editable web form.
 * This ensures the CMS remains 100% synchronized with the backend schema without needing hardcoded layouts.
 */
export const DynamicJsonEditor: React.FC<DynamicJsonEditorProps> = ({ data, onChange, label, level = 0, path = '' }) => {
    // Auto-expand deeper so nested/grouped content is visible by default (levels 0–3)
    const [isExpanded, setIsExpanded] = useState(level < 4);

    // Handle Primitive values (string, number, boolean)
    if (typeof data !== 'object' || data === null) {
        // Render different input types based on value mapping
        const isUrl = typeof data === 'string' && (data.startsWith('http') || data.startsWith('/'));
        const isLongText = typeof data === 'string' && data.length > 60;
        const isBoolean = typeof data === 'boolean';
        const isNumber = typeof data === 'number';

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            let val: any = e.target.value;
            if (isNumber) val = Number(val);
            onChange(val);
        };

        const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.checked);
        };

        return (
            <div className={`mb-3 flex ${level > 0 ? 'ml-4' : ''} flex-col`}>
                {label && (
                    <label className="text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5 capitalize">
                        {isUrl ? <LinkIcon size={12} className="text-brand-500" /> : <Edit3 size={12} className="text-slate-400" />}
                        {label.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                )}
                {isBoolean ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={data} onChange={handleCheckChange} className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500" />
                        <span className="text-sm text-slate-700">{data ? 'Yes' : 'No'}</span>
                    </label>
                ) : isLongText ? (
                    <textarea
                        value={data}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm min-h-[100px] focus:ring-2 focus:ring-brand-500 outline-none transition-shadow whitespace-pre-wrap"
                        placeholder={`Enter ${label || 'value'}...`}
                        title={`Edit ${label || 'value'}`}
                        aria-label={`Edit ${label || 'value'}`}
                    />
                ) : (
                    <input
                        type={isNumber ? 'number' : 'text'}
                        value={data}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-shadow"
                        placeholder={`Enter ${label || 'value'}...`}
                        title={`Edit ${label || 'value'}`}
                        aria-label={`Edit ${label || 'value'}`}
                    />
                )}
            </div>
        );
    }

    // Handle Arrays
    if (Array.isArray(data)) {
        return (
            <div className={`mb-4 border border-slate-200 rounded-xl overflow-hidden ${level > 0 ? 'ml-4 mt-2' : ''}`}>
                <div
                    className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}
                        <span className="font-bold text-sm text-slate-800 capitalize">{label || 'List'}</span>
                        <span className="text-xs font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Array[{data.length}]</span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // If array has objects, duplicate the first one as template. Otherwise add empty string.
                            const template = data.length > 0 && typeof data[0] === 'object' ? JSON.parse(JSON.stringify(data[0])) : '';
                            onChange([...data, template]);
                            setIsExpanded(true);
                        }}
                        className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-2 py-1 rounded-md"
                    >
                        <Plus size={14} /> Add Item
                    </button>
                </div>

                {isExpanded && (
                    <div className="p-4 space-y-4 bg-white">
                        {data.map((item, index) => (
                            <div key={index} className="relative border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">
                                        #{index + 1}
                                    </span>
                                    <button
                                        onClick={() => {
                                            const newArr = [...data];
                                            newArr.splice(index, 1);
                                            onChange(newArr);
                                        }}
                                        className="p-1 rounded bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm"
                                        title="Remove Item"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                                <DynamicJsonEditor
                                    data={item}
                                    level={level + 1}
                                    path={`${path}[${index}]`}
                                    onChange={(newItemData) => {
                                        const newArr = [...data];
                                        newArr[index] = newItemData;
                                        onChange(newArr);
                                    }}
                                />
                            </div>
                        ))}
                        {data.length === 0 && (
                            <div className="text-center py-6 text-slate-400 text-sm italic">
                                This list is empty. Click "Add Item" to create one.
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Handle Objects — ensure nested/grouped content is always reachable
    const displayLabel = label || 'Item';
    return (
        <div className={`mb-2 ${level === 0 ? '' : 'ml-4 border-l-2 border-slate-100 pl-4 py-2'}`}>
            {level > 0 && (
                <div
                    className="flex items-center gap-2 mb-3 cursor-pointer group"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" /> : <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />}
                    <h4 className="text-sm font-bold text-slate-700 capitalize group-hover:text-slate-900 transition-colors">
                        {displayLabel.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                </div>
            )}
            {isExpanded && (
                <div className="grid grid-cols-1 gap-x-6 gap-y-1">
                    {Object.entries(data ?? {}).map(([key, value]) => {
                        // Skip rendering completely empty internal structural fields unless they are inside arrays
                        if (key.startsWith('_') || key === 'id') return null;

                        return (
                            <div key={key} className={typeof value === 'object' && value !== null ? 'col-span-1' : 'col-span-1'}>
                                <DynamicJsonEditor
                                    data={value}
                                    label={key}
                                    level={level + 1}
                                    path={`${path}.${key}`}
                                    onChange={(newValue) => {
                                        onChange({ ...data, [key]: newValue });
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
