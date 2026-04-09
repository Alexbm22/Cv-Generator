
export const isUrlValid = async (url: string, init?: RequestInit): Promise<boolean> => {
    try {
        const response = await fetch(url, { method: "HEAD", mode: "no-cors", ...init });
        return response.ok || response.status === 0; // status 0 for no-cors
    } catch {
        return false;
    }
};

