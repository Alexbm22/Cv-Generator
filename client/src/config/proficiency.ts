import { SkillLevel, ProficiencyLanguageLevel } from '../interfaces/cv';

export const SkillsLevelsMap = {
    [SkillLevel.BEGINNER]: { index: 0, color: '#da4500'},
    [SkillLevel.INTERMEDIATE]:  { index: 1, color: '#ffd413'},
    [SkillLevel.ADVANCED]:  { index: 2, color: '#5cd41c'},
    [SkillLevel.EXPERT]:  { index: 3, color: '#41bc00'}
}

export const LanguageLevelsMap = {
    [ProficiencyLanguageLevel.A1]: { index: 0, color: '#da4500', displayedVal: 'A1'},
    [ProficiencyLanguageLevel.A2]:  { index: 1, color: '#ffac33', displayedVal: 'A2'},
    [ProficiencyLanguageLevel.B1]:  { index: 2, color: '#ffd413', displayedVal: 'B1'},
    [ProficiencyLanguageLevel.B2]:  { index: 3, color: '#7ad96d', displayedVal: 'B2'},
    [ProficiencyLanguageLevel.C1]:  { index: 4, color: '#5cd41c', displayedVal: 'C1'},
    [ProficiencyLanguageLevel.C2]:  { index: 5, color: '#41bc00', displayedVal: 'C2'}
}