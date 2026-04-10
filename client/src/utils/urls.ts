
export const isUrlValid = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(url);
        return response.ok;
    } catch(error) {
        console.error("Error validating URL:", error);
        return false;
    }
};

