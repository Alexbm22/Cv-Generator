const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const formatDate = (date: Date): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatDateRange = (startDate: Date, endDate: Date): string => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    if (!start) return '';
    return `${start} - ${end || 'Present'}`;
};
