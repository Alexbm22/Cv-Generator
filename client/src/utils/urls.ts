
// Cache for URL validation results
const urlValidationCache = new Map<string, boolean>();

export const isUrlValid = async (url: string): Promise<boolean> => {
    // Check cache first
    if (urlValidationCache.has(url)) {
        return urlValidationCache.get(url)!;
    }
    
    const controller = new AbortController();
    try {
        const response = await fetch(url, { signal: controller.signal });
        controller.abort();
        const isValid = response.ok;
        // Cache the result
        urlValidationCache.set(url, isValid);
        return isValid;
    } catch(error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            urlValidationCache.set(url, true);
            return true;
        }
        console.error("Error validating URL:", error);
        urlValidationCache.set(url, false);
        return false;
    }
};

