import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Employee } from '../data/mockData';
import { useFeedback } from '../context/FeedbackContext';
import '../SalaryModal.css';

interface SalaryEditModalProps {
    employee: Employee;
    onClose: () => void;
    onSave: (newSalary: number, reason: string, effectiveDate: string) => void;
}

export const SalaryEditModal: React.FC<SalaryEditModalProps> = ({ employee, onClose, onSave }) => {
    const { showError } = useFeedback();
    const [newSalary, setNewSalary] = useState(employee.salary.toString());
    const [reason, setReason] = useState<string>('Promotion');
    const [customReason, setCustomReason] = useState('');
    const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const salaryValue = parseFloat(newSalary);
        if (isNaN(salaryValue) || salaryValue <= 0) {
            showError({ title: 'Invalid Salary', message: 'Please enter a valid salary amount' });
            return;
        }

        const finalReason = reason === 'Other' ? customReason : reason;
        if (!finalReason.trim()) {
            showError({ title: 'Reason Required', message: 'Please provide a reason for the salary change' });
            return;
        }

        onSave(salaryValue, finalReason, effectiveDate);
        onClose();
    };

    const salaryChange = parseFloat(newSalary) - employee.salary;
    const percentageChange = ((salaryChange / employee.salary) * 100).toFixed(2);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Salary - {employee.name}</h2>
                    <button onClick={onClose} className="icon-btn" aria-label="Close modal">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* Current Salary Display */}
                        <div className="current-salary-display">
                            <div className="label-text">
                                Current Salary
                            </div>
                            <div className="salary-amount">
                                ₦{employee.salary.toLocaleString()}
                            </div>
                        </div>

                        {/* New Salary Input */}
                        <div className="form-group">
                            <label htmlFor="newSalary">New Salary (₦)</label>
                            <input
                                id="newSalary"
                                type="number"
                                value={newSalary}
                                onChange={(e) => setNewSalary(e.target.value)}
                                placeholder="Enter new salary"
                                required
                                min="0"
                                step="1000"
                            />
                        </div>

                        {/* Change Summary */}
                        {!isNaN(parseFloat(newSalary)) && parseFloat(newSalary) !== employee.salary && (
                            <div className={`change-summary ${salaryChange > 0 ? 'positive' : 'negative'}`}>
                                <div className="label-text">
                                    Change
                                </div>
                                <div className="change-amount">
                                    {salaryChange > 0 ? '+' : ''}₦{salaryChange.toLocaleString()} ({percentageChange}%)
                                </div>
                            </div>
                        )}

                        {/* Reason Dropdown */}
                        <div className="form-group">
                            <label htmlFor="reason">Reason for Change</label>
                            <select
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            >
                                <option value="Promotion">Promotion</option>
                                <option value="Annual Raise">Annual Raise</option>
                                <option value="Market Adjustment">Market Adjustment</option>
                                <option value="Performance Bonus">Performance Bonus</option>
                                <option value="Correction">Correction</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Custom Reason Input */}
                        {reason === 'Other' && (
                            <div className="form-group">
                                <label htmlFor="customReason">Specify Reason</label>
                                <input
                                    id="customReason"
                                    type="text"
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    placeholder="Enter custom reason"
                                    required
                                />
                            </div>
                        )}

                        {/* Effective Date */}
                        <div className="form-group">
                            <label htmlFor="effectiveDate">Effective Date</label>
                            <input
                                id="effectiveDate"
                                type="date"
                                value={effectiveDate}
                                onChange={(e) => setEffectiveDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Update Salary
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
