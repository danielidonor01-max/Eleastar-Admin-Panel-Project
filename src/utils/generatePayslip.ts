import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Adjustment, Employee } from '@/types';
import type { PayrollCycle } from '@/types';

export const generatePayslipPDF = (employee: Partial<Employee>, payrollStatus: Partial<PayrollCycle>) => {
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
    doc.text(`Role: ${employee.role_relation as unknown as string}`, 15, 62);
    doc.text(`Department: ${employee.department_id as unknown as string}`, 100, 52);
    doc.text(`Payment Date: ${new Date().toLocaleDateString()}`, 100, 57);

    // --- Calculations ---
    const adjustments = payrollStatus.adjustments?.filter((adj: Partial<Adjustment>) => adj.empId === employee.id) || [];
    const bonuses = adjustments.filter((a: Partial<Adjustment>) => a.type === 'Bonus').reduce((sum: number, a: Partial<Adjustment>) => sum + (a.amount as unknown as number), 0);
    const grossSalary = (employee.salary as unknown as number) + bonuses;

    // Deductions
    const fines = adjustments.filter((a: Partial<Adjustment>) => a.type === 'Fine' || a.type === 'Deduction').reduce((sum: number, a: Partial<Adjustment>) => sum + (a.amount as unknown as number), 0);
    const tax = (employee.salary as unknown as number) * 0.05; // 5% Tax (Example)
    const pension = (employee.salary as unknown as number) * 0.08; // 8% Pension (Example)
    const totalDeductions = (fines as unknown as number) + (tax as unknown as number) + (pension as unknown as number);

    const netPay = (grossSalary as unknown as number) - (totalDeductions as unknown as number);

    // --- Earnings Table ---
    autoTable(doc, {
        startY: 70,
        head: [['Earnings', 'Amount (NGN)']],
        body: [
            ['Basic Salary', (employee.salary as unknown as number).toLocaleString()],
            ['Bonuses / Performance', (bonuses as unknown as number).toLocaleString()],
            ['Gross Earnings', { content: grossSalary.toLocaleString(), styles: { fontStyle: 'bold' } }],
        ],
        theme: 'striped',
        headStyles: { fillColor: [63, 81, 181] }
    });

    // --- Deductions Table ---
    // @ts-expect-ignore
    const finalY = ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable as unknown as { finalY: number }).finalY + 10;
    // @ts-expect-ignore
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
    // @ts-expect-ignore
        const summaryY = ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable as unknown as { finalY: number }).finalY + 15;

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
    doc.save(`Payslip_${employee.name as string || ''}_${payrollStatus.month}_${payrollStatus.year}.pdf`);
};
