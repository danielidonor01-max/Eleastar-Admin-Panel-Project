import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, AlertCircle, Info } from 'lucide-react';

interface ImageUploaderProps {
    imageUrl: string;
    altText?: string;
    onImageChange: (newUrl: string) => void;
    onAltTextChange?: (newAlt: string) => void;
    label?: string;
    recommendedSize?: string;
    maxSizeInMB?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
    imageUrl,
    altText = '',
    onImageChange,
    onAltTextChange,
    label = "Section Image",
    recommendedSize,
    maxSizeInMB = 2
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewError, setPreviewError] = useState(false);
    const [warning, setWarning] = useState<string | null>(null);
    const [fileSize, setFileSize] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setWarning(null);
        setFileSize(null);

        if (file) {
            if (!file.type.startsWith('image/')) {
                setWarning('Invalid file type. Please upload an image.');
                return;
            }
            const sizeInMB = file.size / (1024 * 1024);
            setFileSize(`${sizeInMB.toFixed(2)} MB`);
            if (sizeInMB > maxSizeInMB) {
                setWarning(`File size (${sizeInMB.toFixed(2)} MB) exceeds limit of ${maxSizeInMB} MB.`);
            }
            const processUpload = () => {
                const objectUrl = URL.createObjectURL(file);
                onImageChange(objectUrl);
                setPreviewError(false);
            };
            processUpload();
        }
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-1">
                {label && <label className="block text-xs font-bold text-slate-700">{label}</label>}
                <div className="text-right">
                    {recommendedSize && <span className="block text-[10px] text-slate-400">Rec: {recommendedSize}</span>}
                    {maxSizeInMB && <span className="block text-[10px] text-slate-400">Max: {maxSizeInMB}MB</span>}
                </div>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 transition-colors hover:border-slate-300">
                <div className="flex items-start gap-4">
                    {/* Preview Area with Focal Point Guidance */}
                    <div className="relative group w-24 h-24 shrink-0 bg-slate-200 rounded overflow-hidden border border-slate-300 flex items-center justify-center">
                        {imageUrl && !previewError ? (
                            <>
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover relative z-0"
                                    onError={() => setPreviewError(true)}
                                />
                                {/* Overlay Safe Zone */}
                                <div className="absolute inset-2 border border-dashed border-white/50 rounded pointer-events-none z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[8px] text-white font-bold bg-black/50 px-1 rounded">Subject Center</span>
                                </div>
                            </>
                        ) : (
                            <ImageIcon className="text-slate-400" size={24} />
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex-1 space-y-3">
                        <div className="flex gap-2">
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-brand-500 hover:text-brand-600 text-slate-600 rounded text-xs font-bold shadow-sm transition-colors flex items-center gap-2"
                            >
                                <Upload size={14} />
                                {imageUrl ? 'Replace Image' : 'Upload Image'}
                            </button>

                            {imageUrl && (
                                <button
                                    onClick={() => { onImageChange(''); setWarning(null); setFileSize(null); }}
                                    className="px-2 py-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    title="Remove Image"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* URL Fallback Input */}
                        <div>
                            <div className="flex justify-between">
                                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Or paste URL</label>
                                {fileSize && <span className="text-[10px] text-slate-500 font-mono">Size: {fileSize}</span>}
                            </div>
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => {
                                    onImageChange(e.target.value);
                                    setPreviewError(false);
                                    setWarning(null);
                                    setFileSize(null);
                                }}
                                className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-brand-500 outline-none text-slate-600 font-mono"
                                placeholder="https://"
                            />
                        </div>

                        {/* Alt Text Input */}
                        {onAltTextChange && imageUrl && (
                            <div className="space-y-1 pt-1 border-t border-slate-100 mt-2">
                                <label className="block text-xs font-bold text-slate-700">Alt Text <span className="text-slate-400 font-normal">(Recommended)</span></label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={altText}
                                        onChange={(e) => onAltTextChange(e.target.value)}
                                        className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-brand-500 outline-none text-slate-600"
                                        placeholder="Describe image for SEO..."
                                    />
                                    {altText.length === 0 && (
                                        <div className="group relative" title="Adding alt text improves accessibility and SEO.">
                                            <AlertCircle size={14} className="text-amber-500 cursor-help" />
                                        </div>
                                    )}
                                </div>
                                {altText.length === 0 && (
                                    <span className="text-[10px] text-amber-600 italic">Adding alt text improves accessibility and SEO.</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages */}
                {previewError && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-red-500 font-medium">
                        <AlertCircle size={12} />
                        <span>Unable to load image. Check URL.</span>
                    </div>
                )}
                {warning && (
                    <div className="mt-2 flex items-start gap-1 text-[10px] text-amber-600 bg-amber-50 p-1.5 rounded border border-amber-100">
                        <Info size={12} className="mt-0.5 shrink-0" />
                        <span>{warning}</span>
                    </div>
                )}
            </div>

            {/* Focal Point Hint */}
            {imageUrl && !previewError && (
                <div className="flex justify-end mt-1">
                    <span className="text-[10px] text-slate-400 italic">Keep main subject centered — edges may be cropped on smaller screens.</span>
                </div>
            )}
        </div>
    );
};
