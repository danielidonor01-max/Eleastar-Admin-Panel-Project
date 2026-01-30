import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Employee } from '../data/mockData';
import type { PayrollCycle } from '../context/AdminContext';

export const generatePayslipPDF = (employee: Employee, payrollStatus: PayrollCycle) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // --- Header ---
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 60);
    doc.text("Eleastar Technologies Ltd.", 15, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("123 Innovation Drive, Lagos, Nigeria", 15, 26);
    doc.text("Payslip for " + payrollStatus.month + " " + payrollStatus.year, 15, 32);

    doc.line(15, 36, pageWidth - 15, 36);

    // --- Employee Details ---
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Employee Details", 15, 45);

    doc.setFontSize(10);
    doc.text(`Name: ${employee.name}`, 15, 52);
    doc.text(`ID: ${employee.id}`, 15, 57);
    doc.text(`Role: ${employee.title}`, 15, 62);
    doc.text(`Department: ${employee.department}`, 100, 52);
    doc.text(`Payment Date: ${new Date().toLocaleDateString()}`, 100, 57);

    // --- Calculations ---
    const adjustments = payrollStatus.adjustments.filter(adj => adj.empId === employee.id);
    const bonuses = adjustments.filter(a => a.type === 'Bonus').reduce((sum, a) => sum + a.amount, 0);
    const grossSalary = employee.salary + bonuses;

    // Deductions
    const fines = adjustments.filter(a => a.type === 'Fine' || a.type === 'Deduction').reduce((sum, a) => sum + a.amount, 0);
    const tax = employee.salary * 0.05; // 5% Tax (Example)
    const pension = employee.salary * 0.08; // 8% Pension (Example)
    const totalDeductions = fines + tax + pension;

    const netPay = grossSalary - totalDeductions;

    // --- Earnings Table ---
    autoTable(doc, {
        startY: 70,
        head: [['Earnings', 'Amount (NGN)']],
        body: [
            ['Basic Salary', employee.salary.toLocaleString()],
            ['Bonuses / Performance', bonuses.toLocaleString()],
            ['Gross Earnings', { content: grossSalary.toLocaleString(), styles: { fontStyle: 'bold' } }],
        ],
        theme: 'striped',
        headStyles: { fillColor: [63, 81, 181] }
    });

    // --- Deductions Table ---
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 10;

    autoTable(doc, {
        startY: finalY,
        head: [['Deductions', 'Amount (NGN)']],
        body: [
            ['Tax (PAYE - 5%)', tax.toLocaleString()],
            ['Pension (8%)', pension.toLocaleString()],
            ['Other Deductions / Fines', fines.toLocaleString()],
            ['Total Deductions', { content: totalDeductions.toLocaleString(), styles: { fontStyle: 'bold', textColor: [200, 0, 0] } }],
        ],
        theme: 'striped',
        headStyles: { fillColor: [211, 47, 47] }
    });

    // --- Net Pay Summary ---
    // @ts-ignore
    const summaryY = doc.lastAutoTable.finalY + 15;

    doc.setFillColor(240, 240, 240);
    doc.rect(15, summaryY, pageWidth - 30, 20, 'F');

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Net Pay:", 20, summaryY + 13);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`NGN ${netPay.toLocaleString()}`, pageWidth - 20, summaryY + 13, { align: "right" });

    // --- Footer ---
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("This is a system generated payslip and does not require a signature.", pageWidth / 2, 280, { align: 'center' });

    // Save
    doc.save(`Payslip_${employee.name.replace(' ', '_')}_${payrollStatus.month}_${payrollStatus.year}.pdf`);
};
