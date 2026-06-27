import { useTranslation } from "react-i18next";
import cvI18n from "../../../../../i18n/cvi18n";

 

const useLanguageLevel = () => {
    const { t } = useTranslation('cvTemplate', { keyPrefix: 'sections.languages.Levels', i18n: cvI18n });
    const LanguageLevelsMap = {
        1:  { index: 0, color: '#da4500', displayedVal: 'A1', label: t('beginner') },
        2:  { index: 1, color: '#ffac33', displayedVal: 'A2', label: t('elementary') },
        3:  { index: 2, color: '#ffd413', displayedVal: 'B1', label: t('intermediate') },
        4:  { index: 3, color: '#7ad96d', displayedVal: 'B2', label: t('upperIntermediate') },
        5:  { index: 4, color: '#5cd41c', displayedVal: 'C1', label: t('advanced') },
        6:  { index: 5, color: '#41bc00', displayedVal: 'C2', label: t('proficient') }
    }

    return LanguageLevelsMap;
}

export default useLanguageLevel;
