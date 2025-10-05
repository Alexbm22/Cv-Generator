
export function generateRandomSuffix(length: number): string {
    if (length < 1) {
        throw new Error('Length must be greater than 0');
    }

    // Removed potentially confusing characters (0,1,l,o)
    const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    
    // Use crypto.getRandomValues for better randomness
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);
    
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(randomValues[i] % chars.length);
    }
    
    return result;
}