import cvI18n from "../../../../../../i18n/cvi18n";

const MONTHS = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
];

export const formatDate = (date: Date): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return `${cvI18n.t(MONTHS[d.getMonth()], { ns: 'months' })} ${d.getFullYear()}`;
};

export const formatDateRange = (startDate: Date, endDate: Date): string => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    if (!start) return '';
    return `${start} - ${end || cvI18n.t('present', { ns: 'months' })}`;
};
