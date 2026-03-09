import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import type { Employee, ContractInfo, ContractDocument } from '../data/mockData';
import { toast } from 'sonner';
import '../SalaryModal.css';

interface ContractManagementModalProps {
    employee: Employee;
    onClose: () => void;
    onSaveContract: (contractInfo: Partial<ContractInfo>) => void;
    onUploadDocument: (document: Omit<ContractDocument, 'id' | 'uploadedAt' | 'uploadedBy'>) => void;
}

export const ContractManagementModal: React.FC<ContractManagementModalProps> = ({
    employee,
    onClose,
    onSaveContract,
    onUploadDocument
}) => {
    const contract = employee.contractInfo;

    // Contract Info State
    const [contractType, setContractType] = useState<string>(contract?.contractType || 'Full-Time');
    const [startDate, setStartDate] = useState(contract?.startDate || '');
    const [endDate, setEndDate] = useState(contract?.endDate || '');
    const [probationEndDate, setProbationEndDate] = useState(contract?.probationEndDate || '');
    const [noticePeriod, setNoticePeriod] = useState(contract?.noticePeriod?.toString() || '30');

    // Document Upload State
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [docName, setDocName] = useState('');
    const [docType, setDocType] = useState<ContractDocument['type']>('Employment Contract');
    const [docFile, setDocFile] = useState<File | null>(null);

    // Determine if end date should be enabled (only for Contract and Intern)
    const isEndDateEnabled = contractType === 'Contract' || contractType === 'Intern';

    // Handle contract type change - clear end date if switching to Full-Time/Part-Time
    const handleContractTypeChange = (newType: string) => {
        setContractType(newType);
        if (newType === 'Full-Time' || newType === 'Part-Time') {
            setEndDate(''); // Clear end date for permanent staff
        }
    };

    const handleSaveContract = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Probation end date is required
        if (!probationEndDate) {
            toast.error('Validation Error', { description: 'Probation End Date is required for all employees' });
            return;
        }

        // Validation: End date required for Contract and Intern
        if (isEndDateEnabled && !endDate) {
            toast.error('Validation Error', { description: `End Date is required for ${contractType} employees` });
            return;
        }

        const updatedContract: Partial<ContractInfo> = {
            contractType: contractType as ContractInfo['contractType'],
            startDate,
            endDate: isEndDateEnabled ? endDate : undefined,
            probationEndDate,
            noticePeriod: parseInt(noticePeriod),
            documents: contract?.documents || []
        };

        onSaveContract(updatedContract);
    };

    const handleUploadDocument = (e: React.FormEvent) => {
        e.preventDefault();

        if (!docName.trim()) {
            toast.error('Validation Error', { description: 'Please enter a document name' });
            return;
        }

        const newDocument: Omit<ContractDocument, 'id' | 'uploadedAt' | 'uploadedBy'> = {
            name: docName,
            type: docType,
            fileUrl: docFile ? URL.createObjectURL(docFile) : '/documents/placeholder.pdf',
            fileSize: docFile?.size || 0,
            status: 'active'
        };

        onUploadDocument(newDocument);

        // Reset form
        setDocName('');
        setDocType('Employment Contract');
        setDocFile(null);
        setShowUploadForm(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <h2>Contract Management - {employee.name}</h2>
                    <button onClick={onClose} className="icon-btn" aria-label="Close modal">
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Contract Information Form */}
                    <form onSubmit={handleSaveContract}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>Contract Information</h3>

                        <div className="form-group">
                            <label htmlFor="contractType">Contract Type</label>
                            <select
                                id="contractType"
                                value={contractType}
                                onChange={(e) => handleContractTypeChange(e.target.value)}
                                required
                            >
                                <option value="Full-Time">Full-Time</option>
                                <option value="Part-Time">Part-Time</option>
                                <option value="Contract">Contract</option>
                                <option value="Intern">Intern</option>
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label htmlFor="startDate">Start Date</label>
                                <input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="endDate">
                                    End Date {isEndDateEnabled ? '(Required)' : '(N/A for permanent staff)'}
                                </label>
                                <input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    disabled={!isEndDateEnabled}
                                    required={isEndDateEnabled}
                                    style={{
                                        backgroundColor: !isEndDateEnabled ? '#f1f5f9' : 'white',
                                        cursor: !isEndDateEnabled ? 'not-allowed' : 'text'
                                    }}
                                />
                                {!isEndDateEnabled && (
                                    <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                                        Full-Time and Part-Time employees have indefinite contracts
                                    </small>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label htmlFor="probationEndDate">Probation End Date (Required)</label>
                                <input
                                    id="probationEndDate"
                                    type="date"
                                    value={probationEndDate}
                                    onChange={(e) => setProbationEndDate(e.target.value)}
                                    required
                                />
                                <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                                    All employees must complete a probation period
                                </small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="noticePeriod">Notice Period (Days)</label>
                                <input
                                    id="noticePeriod"
                                    type="number"
                                    value={noticePeriod}
                                    onChange={(e) => setNoticePeriod(e.target.value)}
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                            Save Contract Information
                        </button>
                    </form>

                    {/* Documents Section */}
                    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>Contract Documents</h3>
                            <button
                                type="button"
                                onClick={() => setShowUploadForm(!showUploadForm)}
                                className="btn-primary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                            >
                                <Upload size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
                                Upload Document
                            </button>
                        </div>

                        {/* Upload Form */}
                        {showUploadForm && (
                            <form onSubmit={handleUploadDocument} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <div className="form-group">
                                    <label htmlFor="docName">Document Name</label>
                                    <input
                                        id="docName"
                                        type="text"
                                        value={docName}
                                        onChange={(e) => setDocName(e.target.value)}
                                        placeholder="e.g., Employment Contract 2024"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="docType">Document Type</label>
                                    <select
                                        id="docType"
                                        value={docType}
                                        onChange={(e) => setDocType(e.target.value as ContractDocument['type'])}
                                        required
                                    >
                                        <option value="Employment Contract">Employment Contract</option>
                                        <option value="NDA">NDA</option>
                                        <option value="Offer Letter">Offer Letter</option>
                                        <option value="Amendment">Amendment</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="docFile">File (Optional - Simulated)</label>
                                    <input
                                        id="docFile"
                                        type="file"
                                        onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                                        accept=".pdf,.doc,.docx"
                                    />
                                    <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                        In production, this would upload to cloud storage
                                    </small>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button type="submit" className="btn-primary">
                                        Add Document
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowUploadForm(false)}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Documents List */}
                        {contract?.documents && contract.documents.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {contract.documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        style={{
                                            padding: '1rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem'
                                        }}
                                    >
                                        <FileText size={24} style={{ color: '#3b82f6', flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{doc.name}</div>
                                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                                {doc.type} • {(doc.fileSize / 1024).toFixed(1)} KB • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <span
                                            style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                backgroundColor: doc.status === 'active' ? '#dcfce7' : '#fee2e2',
                                                color: doc.status === 'active' ? '#166534' : '#991b1b'
                                            }}
                                        >
                                            {doc.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                <p>No contract documents uploaded yet</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
