import { IndexedDBService } from "../indexedDB";

export const cvDB = new IndexedDBService('CV_Store');

export const CVStorage = {
    getItem: async (key: string) => {
        const value = await cvDB.get<string>(key);
        return value;
    },
    setItem: async (key: string, value: string) => {
        await cvDB.set<string>(key, value);
    },
    removeItem: async (key: string) => {
        await cvDB.del(key);
    },
}
