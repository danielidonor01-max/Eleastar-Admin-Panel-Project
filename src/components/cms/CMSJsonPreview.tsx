import React, { useState } from 'react';
import { Copy, Check, FileJson } from 'lucide-react';


interface CMSJsonPreviewProps {
    data: any;
    pageName: string;
}

export const CMSJsonPreview: React.FC<CMSJsonPreviewProps> = ({ data, pageName }) => {
    const [copied, setCopied] = useState(false);
    const jsonString = JSON.stringify(data, null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const metaInfo = Array.isArray(data)
        ? { type: 'Page Collection', count: data.length, page: pageName }
        : { type: 'Single Section', id: data.id, sectionType: data.type, status: data.status };

    return (
        <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-inner text-slate-300">
            {/* Toolbar */}
            <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FileJson size={18} className="text-brand-400" />
                    <div>
                        <h4 className="text-sm font-bold text-slate-200">JSON Data View</h4>
                        <div className="flex gap-2 text-[10px] text-slate-400 font-mono">
                            {Object.entries(metaInfo).map(([k, v]) => (
                                <span key={k}>{k}: <span className="text-slate-300">{v}</span></span>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${copied
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-white'
                        }`}
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy JSON'}
                </button>
            </div>

            {/* Code View */}
            <div className="grow overflow-auto p-4 custom-scrollbar">
                <pre className="font-mono text-xs leading-relaxed">
                    <code dangerouslySetInnerHTML={{ __html: syntaxHighlight(jsonString) }} />
                </pre>
            </div>
        </div>
    );
};

// Simple helper for basic syntax highlighting
const syntaxHighlight = (json: string) => {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'text-purple-400'; // number
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'text-sky-300 font-bold'; // key
            } else {
                cls = 'text-emerald-300'; // string
            }
        } else if (/true|false/.test(match)) {
            cls = 'text-amber-400 font-bold'; // boolean
        } else if (/null/.test(match)) {
            cls = 'text-red-400 italic'; // null
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
};
