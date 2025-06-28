import { IndexedDBService } from "../../services/indexedDB";
import { CVAttributes } from "../../interfaces/cv_interface";

const cvDB = new IndexedDBService('CV_Store');

// Save all CVs from Zustand store to IndexedDB
export const saveToIndexedDB = async (CVs: CVAttributes[]) => {
    CVs.forEach((cv) => {
        // encrypt CVs before saving
        // the logic needs to be improved

        cvDB.set<CVAttributes>(cv.id, cv)
    })
}

export const setIndexedDbCVs = (CVs: CVAttributes[]) => {
    cvDB.clearStore();

    CVs.forEach((cv) => {
        // encrypt CVs before saving
        cvDB.set<CVAttributes>(cv.id, cv)
    })
}

// Retrieve all CVs from IndexedDB
export const loadAllCVs = async (): Promise<CVAttributes[] | null> => {
    const CVs = await cvDB.getAll<CVAttributes[]>();

    // Decrypt CVs
    // the logic needs to be improved

    return CVs;
}

export const removeCVById = (id: string) => {
    return cvDB.del(id);
}