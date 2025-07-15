
export const parseDurationToSeconds = (duration: string): number => { 
    const match = duration.match(/^(\d+)([smhdw])$/);
    if (!match) return 0; // Default to 0 seconds if format is incorrect    
    
    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 60 * 60;
        case 'd': return value * 24 * 60 * 60;
        case 'w': return value * 7 * 24 * 60 * 60; // weeks
        default: return 0;
    }
}