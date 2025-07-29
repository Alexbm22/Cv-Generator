
import { v4 as uuid } from 'uuid';
import { DEFAULT_CV_EDITOR_STATE } from '../constants/CV/CVEditor';

export const createDefaultCVObject = () => ({
    id: uuid(),
    ...DEFAULT_CV_EDITOR_STATE,
});