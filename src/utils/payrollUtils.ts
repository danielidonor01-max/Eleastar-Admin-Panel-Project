import type { PayrollCycle } from '../context/AdminContext';



const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const generatePastCycles = (currentCycle: PayrollCycle, count: number = 12): PayrollCycle[] => {
    const cycles: PayrollCycle[] = [];
    const currentMonthIndex = MONTHS.indexOf(currentCycle.month);
    const date = new Date(currentCycle.year, currentMonthIndex);

    // Start generating from the previous month
    for (let i = 1; i <= count; i++) {
        const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
        const monthName = MONTHS[d.getMonth()];
        const year = d.getFullYear();
        const id = `${monthName.substring(0, 3).toUpperCase()}-${year}`;

        cycles.push({
            id,
            month: monthName,
            year: year,
            status: 'Paid', // All past cycles are Paid for audit purposes
            adjustments: [] // Empty by default, can be populated if we had a backend
        });
    }

    return cycles;
};
