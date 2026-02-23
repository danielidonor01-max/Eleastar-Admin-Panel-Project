import React, { useState, useRef } from 'react';
import { QrCode, RefreshCw, Ban, CheckCircle2, AlertTriangle, FileBadge, Download, Search, FileText as FilePdf } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useFeedback } from '../../context/FeedbackContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const QRPage: React.FC = () => {
    const { employees, regenerateQR, ceoSignature, logAction } = useAdmin();
    const { showSuccess, showError, showConfirm } = useFeedback();
    const [showRegenModal, setShowRegenModal] = useState(false);
    const [showIDModal, setShowIDModal] = useState(false);

    // Editor State
    const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
    const [templateConfig, setTemplateConfig] = useState({
        showPhoto: true,
        showDept: true,
        showRole: true,
        showQRC: true,
        showSignature: true,
        viewSide: 'front' as 'front' | 'back'
    });

    // Refs for Export
    const frontCardRef = useRef<HTMLDivElement>(null);
    const backCardRef = useRef<HTMLDivElement>(null);

    const selectedEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];

    // Derived stats
    const activeCodeCount = employees.filter(e => e.status === 'active').length;
    const suspendedCount = employees.filter(e => e.status !== 'active').length;

    const handleBulkRegenerate = () => {
        const allIds = employees.map(e => e.id);
        regenerateQR(allIds);
        setShowRegenModal(false);
        logAction('UPDATE', 'Employee', 'Regenerated all QR codes manually from Admin Panel.', 'SUCCESS');
        showSuccess({ title: 'Regeneration Complete', message: 'All QR codes have been regenerated. Please reprint ID cards.' });
    };

    const validateAndExport = async (format: 'pdf' | 'png' | 'jpg') => {
        if (!selectedEmployee) {
            showError({ title: 'Export Blocked', message: 'No employee selected.' });
            return;
        }

        // Block if QR is missing (per requirements)
        if (!templateConfig.showQRC) {
            showError({ title: 'Export Blocked', message: 'QR Code must be visible for valid ID Cards.' });
            return;
        }

        // Warn for quality issues
        const warnings: string[] = [];
        if (templateConfig.showSignature && !ceoSignature) warnings.push("Authorized Signature is missing.");
        if (!templateConfig.showPhoto) warnings.push("Employee photo is hidden.");

        if (warnings.length > 0) {
            showConfirm({
                title: 'Export Warning',
                message: `Issues detected:\n\n• ${warnings.join('\n• ')}\n\nDo you want to proceed with the export?`,
                confirmLabel: 'Proceed Anyway',
                onConfirm: () => executeExport(format)
            });
        } else {
            executeExport(format);
        }
    };

    const generateImages = async () => {
        if (!frontCardRef.current || !backCardRef.current) return null;

        // Use high scale for print quality (300 DPI approx)
        const options = {
            scale: 4,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
        };

        const frontCanvas = await html2canvas(frontCardRef.current, options);
        const backCanvas = await html2canvas(backCardRef.current, options);

        return {
            front: frontCanvas.toDataURL('image/png', 1.0),
            back: backCanvas.toDataURL('image/png', 1.0)
        };
    };

    const executeExport = async (format: 'pdf' | 'png' | 'jpg') => {
        const safeName = selectedEmployee.name.replace(/[^a-z0-9]/gi, '_');
        const fileName = `ID_${safeName}_${selectedEmployee.id}`;

        logAction('SECURITY', 'Employee', `Started ID Card export (${format}) for ${selectedEmployee.name}`, 'SUCCESS', selectedEmployee.id);

        const images = await generateImages();
        if (!images) {
            showError({ title: 'Export Error', message: 'Failed to generate high-resolution images.' });
            return;
        }

        if (format === 'pdf') {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: [2.13, 3.38] // CR-80 Standard
            });

            // Page 1: Front
            pdf.addImage(images.front, 'PNG', 0, 0, 2.13, 3.38);

            // Page 2: Back
            pdf.addPage();
            pdf.addImage(images.back, 'PNG', 0, 0, 2.13, 3.38);

            pdf.save(`${fileName}.pdf`);
        } else {
            // Download as individual images
            const link = document.createElement('a');

            // Download Front
            link.href = images.front;
            link.download = `${fileName}_Front.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Download Back (delayed to ensure browser handles both)
            setTimeout(() => {
                const link2 = document.createElement('a');
                link2.href = images.back;
                link2.download = `${fileName}_Back.${format}`;
                document.body.appendChild(link2);
                link2.click();
                document.body.removeChild(link2);
            }, 800);
        }

        showSuccess({ title: 'Export Complete', message: `ID Card exported as ${format.toUpperCase()}` });
    };

    // Components for the Card Faces
    const CardFront = ({ isPreview = false }: { isPreview?: boolean }) => (
        <div className={`w-[320px] h-[508px] bg-white rounded-xl shadow-sm overflow-hidden relative border border-slate-200 flex flex-col ${isPreview ? 'shadow-2xl' : ''}`}>
            {/* Header Branding */}
            <div className="h-32 bg-slate-900 relative shrink-0">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-6">
                    <img
                        src="/assets/logo-horizontal-white.png"
                        alt="Eleastar Technologies"
                        className="w-full max-w-[180px] object-contain"
                    />
                </div>
                {/* Decorative Curve */}
                <div className="absolute -bottom-6 left-0 right-0 h-12 bg-white rounded-t-[50%] z-20"></div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-6 pt-2 pb-6 relative z-30 flex flex-col items-center">
                {/* Photo: Reduced size and adjusted margin to clear logo */}
                {templateConfig.showPhoto && (
                    <div className="w-28 h-28 rounded-full border-[5px] border-white shadow-lg bg-slate-200 overflow-hidden mb-3 -mt-10 relative z-30 ring-1 ring-slate-100">
                        <img src={selectedEmployee.photoUrl} alt="Employee" className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Name & Title */}
                <h2 className="text-2xl font-bold text-slate-900 text-center leading-tight mb-1">{selectedEmployee.name}</h2>

                {templateConfig.showRole && (
                    <p className="text-brand-600 font-bold text-sm mb-1 uppercase tracking-wide">{selectedEmployee.title}</p>
                )}

                {templateConfig.showDept && (
                    <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">{selectedEmployee.department}</p>
                )}

                {/* QR Code Area */}
                {templateConfig.showQRC && (
                    <div className="mt-auto mb-2 p-3 bg-white rounded-xl border border-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                        <QrCode size={80} className="text-slate-900" />
                    </div>
                )}

                {/* Footer Info: Split Layout */}
                <div className="mt-4 w-full border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <div>
                        ID: <span className="text-slate-600 font-bold">{selectedEmployee.id}</span>
                    </div>
                    <div>
                        ISS: <span className="text-slate-600">JAN 26</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const CardBack = ({ isPreview = false }: { isPreview?: boolean }) => (
        <div className={`w-[320px] h-[508px] bg-white rounded-xl shadow-sm overflow-hidden relative border border-slate-200 flex flex-col ${isPreview ? 'shadow-2xl' : ''}`}>

            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">

                {/* Loop Logo Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                    <FileBadge size={240} />
                </div>

                <div className="relative z-10 w-full flex flex-col h-full justify-center gap-12">

                    {/* Signature Section - Primary Focus */}
                    <div className="w-full">
                        <div className="h-28 w-full border-b-2 border-slate-100 mb-3 relative flex items-end justify-center pb-2">
                            {templateConfig.showSignature && ceoSignature ? (
                                <img src={ceoSignature} alt="Authorized Signature" className="h-full max-w-[85%] object-contain" />
                            ) : (
                                <span className="text-slate-300 italic text-sm">No Signature Loaded</span>
                            )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">AUTHORIZED SIGNATURE</p>
                    </div>

                    {/* Instructions & Contact */}
                    <div className="space-y-6">
                        <p className="text-sm font-medium text-slate-600 leading-relaxed px-1">
                            If found, please return this card to<br />
                            <strong className="text-slate-900 text-base block mt-1.5">Eleastar Technologies Limited</strong>
                        </p>

                        <div className="pt-2 text-[11px] text-slate-400 font-medium tracking-wide flex flex-col gap-1.5 opacity-80">
                            <span>www.eleastar.com</span>
                            <span>hr@eleastar.com</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="h-3 w-full bg-slate-900 shrink-0"></div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">QR & ID Manager</h1>
                    <p className="text-slate-500">Manage access codes and generate staff ID cards.</p>
                </div>
                <button
                    onClick={() => setShowIDModal(true)}
                    className="btn-primary"
                >
                    <FileBadge size={18} /> ID Card Studio
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <QrCode size={64} className="text-brand-600" />
                    </div>
                    <div className="text-slate-500 text-sm font-medium">Active Codes</div>
                    <div className="text-3xl font-bold text-slate-900 mt-2">{activeCodeCount}</div>
                    <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                        <CheckCircle2 size={12} /> 100% Operational
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium">Suspended Access</div>
                    <div className="text-3xl font-bold text-slate-900 mt-2">{suspendedCount}</div>
                    <div className="text-xs text-orange-600 font-medium mt-1">Requires Review</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium">Total Scans (Jan)</div>
                    <div className="text-3xl font-bold text-slate-900 mt-2">1,204</div>
                    <div className="text-xs text-slate-400 mt-1">Generating Insights...</div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <h3 className="font-bold text-slate-700">Recent Validation Activity</h3>
                    </div>
                    <div className="p-6 text-center text-slate-500 italic py-12">
                        <div className="flex justify-center mb-2 opacity-50"><QrCode size={32} /></div>
                        No recent scans logged in this session.
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <h3 className="font-bold text-slate-700">System Actions</h3>
                    </div>
                    <div className="p-6 grid gap-4">
                        <button
                            onClick={() => setShowRegenModal(true)}
                            className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium group"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                <RefreshCw size={18} />
                            </div>
                            <div className="text-left">
                                <div className="text-slate-900 font-bold">Regenerate All QRs</div>
                                <div className="text-xs text-slate-500">Invalidates all current codes immediately</div>
                            </div>
                        </button>

                        <button className="flex items-center gap-3 p-4 border border-red-100 bg-red-50/50 rounded-xl hover:bg-red-50 transition-colors text-red-700 font-medium group">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center group-hover:shadow-sm transition-all">
                                <Ban size={18} />
                            </div>
                            <div className="text-left">
                                <div className="text-red-900 font-bold">Emergency Lockout</div>
                                <div className="text-xs text-red-600/80">Suspend all access temporarily</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Regenerate Modal */}
            {showRegenModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Regenerate Compliance</h3>
                                <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                    This action will <strong className="text-slate-900">permanently invalidate</strong> existing QR codes for all {employees.length} employees.
                                    New codes will be generated immediately.
                                </p>
                            </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-6 text-sm text-orange-800 flex gap-2 items-start">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                            <span>Physical ID cards must be reprinted to work with the new system.</span>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowRegenModal(false)} className="btn-ghost">Cancel</button>
                            <button onClick={handleBulkRegenerate} className="btn-danger">
                                Confirm & Regenerate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ID Card Editor Modal */}
            {showIDModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6 backdrop-blur-md">
                    <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-brand-400">
                                    <FileBadge size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">ID Card Studio</h3>
                                    <p className="text-xs text-slate-500">Design and Export Staff Identity Cards</p>
                                </div>
                            </div>
                            <button onClick={() => setShowIDModal(false)} className="btn-ghost btn-icon rounded-full text-slate-400 hover:text-slate-600">
                                <span className="sr-only">Close</span>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50">

                            {/* Left Panel: Controls */}
                            <div className="w-full lg:w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Employee</label>
                                    <div className="relative">
                                        <select
                                            value={selectedEmpId}
                                            onChange={(e) => setSelectedEmpId(e.target.value)}
                                            className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 hover:border-brand-300 transition-colors appearance-none cursor-pointer font-medium text-slate-700"
                                        >
                                            {employees.map(e => (
                                                <option key={e.id} value={e.id}>{e.name}</option>
                                            ))}
                                        </select>
                                        <Search className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Card View</label>
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        <button
                                            onClick={() => setTemplateConfig(curr => ({ ...curr, viewSide: 'front' }))}
                                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${templateConfig.viewSide === 'front' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Front
                                        </button>
                                        <button
                                            onClick={() => setTemplateConfig(curr => ({ ...curr, viewSide: 'back' }))}
                                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${templateConfig.viewSide === 'back' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Back
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Visible Fields</label>

                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group">
                                        <input type="checkbox" checked={templateConfig.showPhoto} onChange={e => setTemplateConfig({ ...templateConfig, showPhoto: e.target.checked })}
                                            className="rounded text-brand-600 focus:ring-brand-500 w-5 h-5 border-slate-300" />
                                        <span className="font-medium text-slate-700 group-hover:text-slate-900">Profile Photo</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group">
                                        <input type="checkbox" checked={templateConfig.showDept} onChange={e => setTemplateConfig({ ...templateConfig, showDept: e.target.checked })}
                                            className="rounded text-brand-600 focus:ring-brand-500 w-5 h-5 border-slate-300" />
                                        <span className="font-medium text-slate-700 group-hover:text-slate-900">Department</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group">
                                        <input type="checkbox" checked={templateConfig.showRole} onChange={e => setTemplateConfig({ ...templateConfig, showRole: e.target.checked })}
                                            className="rounded text-brand-600 focus:ring-brand-500 w-5 h-5 border-slate-300" />
                                        <span className="font-medium text-slate-700 group-hover:text-slate-900">Job Title</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group">
                                        <input type="checkbox" checked={templateConfig.showSignature} onChange={e => setTemplateConfig({ ...templateConfig, showSignature: e.target.checked })}
                                            className="rounded text-brand-600 focus:ring-brand-500 w-5 h-5 border-slate-300" />
                                        <span className="font-medium text-slate-700 group-hover:text-slate-900">CEO Signature</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group">
                                        <input type="checkbox" checked={templateConfig.showQRC} onChange={e => setTemplateConfig({ ...templateConfig, showQRC: e.target.checked })}
                                            className="rounded text-brand-600 focus:ring-brand-500 w-5 h-5 border-slate-300" />
                                        <span className="font-medium text-slate-700 group-hover:text-slate-900">QR Code</span>
                                    </label>
                                </div>

                                <div className="mt-auto pt-6 border-t border-slate-100 grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => validateAndExport('pdf')}
                                        className="col-span-2 w-full btn-primary btn-lg justify-center shadow-lg active:scale-95"
                                    >
                                        <FilePdf size={18} /> Export PDF
                                    </button>
                                    <button
                                        onClick={() => validateAndExport('png')}
                                        className="w-full btn-secondary btn-lg justify-center active:scale-95"
                                    >
                                        <Download size={18} /> PNG
                                    </button>
                                    <button
                                        onClick={() => validateAndExport('jpg')}
                                        className="w-full btn-secondary btn-lg justify-center active:scale-95"
                                    >
                                        <Download size={18} /> JPG
                                    </button>
                                </div>
                            </div>

                            {/* Right Panel: Canvas Area */}
                            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-100 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                    style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                                </div>

                                {/* Card Preview Wrapper */}
                                <div className="relative group perspective-1000">
                                    <div className="transition-all duration-500 relative">
                                        {/* View Toggle */}
                                        {templateConfig.viewSide === 'front' ? (
                                            <CardFront isPreview={true} />
                                        ) : (
                                            <CardBack isPreview={true} />
                                        )}
                                    </div>

                                    {/* Print Guide Lines */}
                                    <div className="absolute -left-4 top-0 bottom-0 border-l border-dashed border-slate-300"></div>
                                    <div className="absolute -right-4 top-0 bottom-0 border-l border-dashed border-slate-300"></div>
                                    <p className="absolute -bottom-8 left-0 right-0 text-center text-xs text-slate-400 font-mono">CR-80 Standard Size (2.13" x 3.38")</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Export Staging Area */}
            <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
                <div ref={frontCardRef}><CardFront /></div>
                <div ref={backCardRef}><CardBack /></div>
            </div>
        </div>
    );
};
