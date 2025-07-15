
export const getFutureDate = (
    interval: string,
    amount: number = 1,
) => {
    const date = new Date();

    switch(interval) {
        case 'day': 
            date.setDate(date.getDate() + amount);
            break;
        case 'week':
            date.setDate(date.getDate() + 7 * amount);
            break;
        case 'month':
            date.setMonth(date.getMonth() + amount);
            break;
        case 'year':
            date.setFullYear(date.getFullYear() + amount);
            break;
        default: 
            throw new Error(`Unsupported interval: ${interval}`);
    }

    return date;
}