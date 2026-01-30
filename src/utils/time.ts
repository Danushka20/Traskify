export const hours = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'));
export const minutes = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0')); // Multiples of 5 for easier Selection
export const periods = ['AM', 'PM'] as const;

export const to24Hour = (hour: string, period: 'AM' | 'PM') => {
    let value = parseInt(hour, 10);
    if (period === 'AM') {
        value = value === 12 ? 0 : value;
    } else {
        value = value === 12 ? 12 : value + 12;
    }
    return String(value).padStart(2, '0');
};

export const from24Hour = (timeStr: string) => {
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr;
    const p = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return { hour: String(h).padStart(2, '0'), minute: m, period: p as 'AM' | 'PM' };
};
