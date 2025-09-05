
import { v4 as uuid } from 'uuid';
import { DEFAULT_CV_DATA } from '../constants/CV/CVEditor';

export const createDefaultCVObject = () => ({
    id: uuid(),
    ...DEFAULT_CV_DATA,
});