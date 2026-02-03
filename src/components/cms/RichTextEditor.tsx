import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bold, Italic, Underline, List, Info, Check } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
    minHeight?: string;
    charLimit?: number;
    hardLimit?: number;
    seoRecommend?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    label,
    placeholder,
    className = "",
    minHeight = "100px",
    charLimit,
    hardLimit,
    seoRecommend
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isMounted = useRef(false);

    // Timer for debouncing updates to parent
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [isFocused, setIsFocused] = useState(false);
    const [charCount, setCharCount] = useState(0);

    const getCharCount = (html: string) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent?.length || 0;
    };

    // --- ARCHITECTURE CHANGE: Uncontrolled during typing ---
    useEffect(() => {
        if (!editorRef.current) return;

        const currentLocalValue = editorRef.current.innerHTML;

        // 1. Initial Mount: Always set content
        if (!isMounted.current) {
            editorRef.current.innerHTML = value;
            setCharCount(getCharCount(value));
            isMounted.current = true;
            return;
        }

        // 2. External Update (e.g. Navigation):
        if (value !== currentLocalValue) {
            // Safety: If focused, we BLOCK external updates unless they are empty (reset).
            if (isFocused && value !== '') {
                return;
            }

            editorRef.current.innerHTML = value;
            setCharCount(getCharCount(value));
        }
    }, [value, isFocused]);

    const updateParent = useCallback((html: string) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            const normalized = (html === '<br>' || html === '<div><br></div>') ? '' : html;
            onChange(normalized);
        }, 1000); // 1-second debounce
    }, [onChange]);

    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            setCharCount(getCharCount(html));
            updateParent(html);
        }
    };

    // Ensure we flush pending changes on blur
    const handleBlur = () => {
        setIsFocused(false);
        if (editorRef.current) {
            // Immediate update on blur
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            const html = editorRef.current.innerHTML;
            const normalized = (html === '<br>' || html === '<div><br></div>') ? '' : html;
            onChange(normalized);
        }
    };

    const execCmd = (e: React.MouseEvent, command: string, val: string | undefined = undefined) => {
        e.preventDefault();
        e.stopPropagation();
        document.execCommand(command, false, val);
        handleInput();
        if (editorRef.current) editorRef.current.focus();
    };

    const isOverLimit = charLimit && charCount > charLimit;
    const isHardStop = hardLimit && charCount > hardLimit;
    const isNearLimit = charLimit && charCount > charLimit * 0.9 && charCount <= charLimit;
    const isOptimal = charLimit && charCount >= charLimit * 0.5 && charCount <= charLimit * 0.9;

    const BrandColors = [{ name: 'Dark', value: '#0f172a' }, { name: 'Brand', value: '#4f46e5' }, { name: 'Success', value: '#10b981' }, { name: 'Danger', value: '#ef4444' }];

    const getStatusColor = () => {
        if (isHardStop) return 'bg-red-50 border-red-100 text-red-700';
        if (isOverLimit) return 'bg-orange-50 border-orange-100 text-orange-700';
        if (isNearLimit) return 'bg-amber-50 border-amber-100 text-amber-700';
        if (isOptimal) return 'bg-emerald-50 border-emerald-100 text-emerald-700';
        return 'bg-slate-50 border-slate-100 text-slate-500';
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="flex justify-between items-end mb-1">
                {label && <label className="block text-xs font-bold text-slate-700">{label}</label>}
                {(charLimit || hardLimit) && (
                    <span className={`text-[10px] font-mono ${isHardStop ? 'text-red-600 font-bold' :
                            isOverLimit ? 'text-orange-600 font-bold' :
                                isNearLimit ? 'text-amber-500' : 'text-slate-400'
                        }`}>
                        {charCount} / {charLimit || hardLimit}
                    </span>
                )}
            </div>

            <div className={`border rounded-lg overflow-hidden bg-white group ${isHardStop ? 'border-red-300 ring-2 ring-red-100' :
                    isFocused ? 'ring-2 ring-brand-500 border-brand-500' :
                        'border-slate-200 hover:border-slate-300'
                }`}>
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-1 border-b border-slate-100 bg-slate-50">
                    <button onMouseDown={(e) => execCmd(e, 'bold')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Bold"><Bold size={14} /></button>
                    <button onMouseDown={(e) => execCmd(e, 'italic')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Italic"><Italic size={14} /></button>
                    <button onMouseDown={(e) => execCmd(e, 'underline')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Underline"><Underline size={14} /></button>
                    <div className="w-px h-4 bg-slate-300 mx-1" />

                    <div className="flex bg-white rounded border border-slate-200 overflow-hidden mx-1">
                        <button onMouseDown={(e) => execCmd(e, 'fontSize', '2')} className="px-2 py-1 text-[10px] hover:bg-slate-100 border-r border-slate-200" title="Small">S</button>
                        <button onMouseDown={(e) => execCmd(e, 'fontSize', '3')} className="px-2 py-1 text-xs hover:bg-slate-100 border-r border-slate-200" title="Normal">M</button>
                        <button onMouseDown={(e) => execCmd(e, 'fontSize', '5')} className="px-2 py-1 text-sm font-bold hover:bg-slate-100" title="Large">L</button>
                    </div>

                    <div className="w-px h-4 bg-slate-300 mx-1" />

                    <div className="flex items-center gap-1 mx-1">
                        {BrandColors.map(c => (
                            <button
                                key={c.name}
                                onMouseDown={(e) => execCmd(e, 'foreColor', c.value)}
                                className="w-4 h-4 rounded-full border border-slate-200 hover:scale-110 transition-transform"
                                style={{ backgroundColor: c.value }}
                                title={`Color: ${c.name}`}
                            />
                        ))}
                    </div>

                    <div className="w-px h-4 bg-slate-300 mx-1" />
                    <button onMouseDown={(e) => execCmd(e, 'insertUnorderedList')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Bullet List"><List size={14} /></button>
                </div>

                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    className="p-3 outline-none prose prose-sm max-w-none text-slate-700 leading-relaxed"
                    style={{ minHeight }}
                />
            </div>

            {placeholder && !value && <div className="text-xs text-slate-400 mt-1 pointer-events-none px-1">{placeholder}</div>}

            {seoRecommend && (
                <div className={`mt-2 flex items-start gap-3 p-3 rounded-md border text-[11px] transition-colors ${getStatusColor()}`}>
                    <div className="shrink-0 mt-0.5">
                        {isOptimal ? <Check size={14} className="text-emerald-600" /> : <Info size={14} />}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${isOptimal ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                }`}>SEO</span>
                            <span className="font-semibold opacity-90">
                                {isOptimal ? "Perfect! Content length is optimal." :
                                    isOverLimit ? "Content is too long." :
                                        "Content recommendation:"}
                            </span>
                        </div>
                        <p className="opacity-80 leading-relaxed">{seoRecommend}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
