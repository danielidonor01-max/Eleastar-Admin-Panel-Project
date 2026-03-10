import { useMediaStore } from "@/stores/useMediaStore";
import type { MediaFile } from "@/types/media";
import { Check, FileIcon, FileText, Film, Image, ImageOff, Link2, Music, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MIME_ICON: Record<string, React.ReactNode> = {
    image: <Image size={20} />,
    video: <Film size={20} />,
    audio: <Music size={20} />,
    text: <FileText size={20} />,
    application: <FileIcon size={20} />,
};
const getMimeIcon = (type: string) => MIME_ICON[type.split('/')[0]] ?? <FileIcon size={20} />;
const isImage = (type: string) => type.startsWith('image/');
const fmtSize = (b: number) => b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(2)} MB`;

const Media = () => {
    const {
        files,
        uploads,
        loading,
        loadFiles,
        uploadFiles,
        deleteFile,
    } = useMediaStore();

    const [dragOver, setDragOver] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'image' | 'document' | 'video'>('all');
    const [search, setSearch] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    const handleFiles = (fileList: FileList | null) => {
        if (!fileList) return;
        uploadFiles(fileList);
    };

    const handleDelete = async (key: string) => {
        if (!window.confirm('Delete this file from the media bucket? This cannot be undone.')) return;
        await deleteFile(key);
    };

    const copyUrl = (url: string, key: string) => {
        navigator.clipboard.writeText(url);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const filtered = files.filter((f: MediaFile) => {
        const matchFilter = filter === 'all'
            || (filter === 'image' && isImage(f.type))
            || (filter === 'video' && f.type.startsWith('video/'))
            || (filter === 'document' && !isImage(f.type) && !f.type.startsWith('video/'));
        const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const inProgressUploads = uploads.filter((u) => u.status !== 'done');

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="px-8 py-6 shrink-0 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Media Library</h1>
                        <p className="text-sm text-slate-500 mt-1">{files.length} file{files.length !== 1 ? 's' : ''} in bucket · Cloudflare R2</p>
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-bold rounded-xl hover:bg-brand-700 transition-all shadow-sm"
                    >
                        <Upload size={18} /> Upload Files
                    </button>
                </div>

                {/* Filter bar */}
                <div className="flex items-center gap-4 mt-4">
                    <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                        {(['all', 'image', 'video', 'document'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all capitalize ${filter === f ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search files..."
                        className="flex-1 max-w-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto p-8">
                {/* Drag and drop zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                    className={`border-2 border-dashed rounded-2xl p-8 mb-6 text-center transition-all cursor-pointer ${dragOver ? 'border-brand-400 bg-brand-50 scale-[1.01]' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                        }`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="flex flex-col items-center gap-2">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${dragOver ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                            <Upload size={24} />
                        </div>
                        <p className="font-bold text-slate-700">{dragOver ? 'Drop to upload!' : 'Drag & drop files here'}</p>
                        <p className="text-slate-400 text-sm">or click to browse · Images, videos, documents supported</p>
                    </div>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => handleFiles(e.target.files)}
                />

                {/* In-progress uploads */}
                {inProgressUploads.length > 0 && (
                    <div className="mb-6 space-y-2">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Uploading</h3>
                        {inProgressUploads.map((u, i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3">
                                <div className="text-slate-400">{getMimeIcon(u.file.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate">{u.file.name}</p>
                                    <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${u.status === 'error' ? 'bg-red-400' : 'bg-brand-500'
                                                }`}
                                            style={{ width: `${u.progress}%` }}
                                        />
                                    </div>
                                </div>
                                <span className={`text-xs font-bold ${u.status === 'error' ? 'text-red-500' : 'text-slate-400'
                                    }`}>
                                    {u.status === 'error' ? 'Failed' : `${u.progress}%`}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* File Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin" />
                        <p className="text-sm">Loading media...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-3">
                        <ImageOff size={48} />
                        <p className="text-base font-medium text-slate-400">
                            {files.length === 0 ? 'No files yet — upload something above' : 'No files match your search'}
                        </p>
                        {files.length === 0 && (
                            <p className="text-xs text-amber-500 bg-amber-50 border border-amber-100 px-4 py-2 rounded-lg mt-2">
                                ⚡ Uploads are stored in Cloudflare R2 — ensure your backend /media/* endpoints are configured
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filtered.map((file) => (
                            <div key={file.key} className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-200 transition-all">
                                {/* Thumbnail */}
                                <div className="h-32 bg-slate-50 flex items-center justify-center">
                                    {isImage(file.type) ? (
                                        <img
                                            src={file.url}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                                        />
                                    ) : (
                                        <div className="text-slate-300 text-4xl">
                                            {getMimeIcon(file.type)}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-3">
                                    <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{fmtSize(file.size)}</p>
                                </div>

                                {/* Hover actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 p-3">
                                    <button
                                        onClick={() => copyUrl(file.url, file.key)}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white text-slate-800 text-xs font-bold rounded-lg hover:bg-brand-50 transition-all"
                                    >
                                        {copiedKey === file.key ? <><Check size={14} className="text-green-500" /> Copied!</> : <><Link2 size={14} /> Copy URL</>}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file.key)}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-all"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Media;
