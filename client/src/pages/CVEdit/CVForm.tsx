import React, { useCallback } from "react";
import {
    PersonalInfos,
    ProfessionalSummary,
    WorkExperience,
    Education,
    Skill,
    Language,
    Projects,
    CustomSection
} from "../../components/features/CV/CVEditor/formSections";
import SocialLinks from "../../components/features/CV/CVEditor/formSections/SocialLinks";
import { useCvEditStore } from "../../Store";
import { SortableSectionList, SortableSectionItem } from "../../components/features/CV/CVEditor/DnD";
import { CV_EDITOR_FORM_CONSTANTS } from "../../constants/CV/CVEditor";

type ComponentProps = {
  isShowingPreview: boolean;
  padding?: string 
}

const sections_mapping: Record<string, React.FC<{ }>> = {
    socialLinks: SocialLinks,
    skills: Skill,
    languages: Language,
    aboutMe: ProfessionalSummary,
    workExperience: WorkExperience,
    education: Education,
    projects: Projects,
    customSections: CustomSection
}

const { sections: sectionConstants } = CV_EDITOR_FORM_CONSTANTS;

const sections_labels: Record<string, { title: string; description?: string }> = {
    socialLinks: { title: sectionConstants.personal_infos.fields.social_links.title, description: sectionConstants.personal_infos.fields.social_links.description },
    skills: { title: sectionConstants.skills.title, description: sectionConstants.skills.description },
    languages: { title: sectionConstants.languages.title, description: sectionConstants.languages.description },
    aboutMe: { title: sectionConstants.professional_summary.title, description: sectionConstants.professional_summary.description },
    workExperience: { title: sectionConstants.work_experience.title, description: sectionConstants.work_experience.description },
    education: { title: sectionConstants.education.title, description: sectionConstants.education.description },
    projects: { title: sectionConstants.projects.title, description: sectionConstants.projects.description },
    customSections: { title: sectionConstants.custom_section.title, description: sectionConstants.custom_section.description },
}

const sections_add_labels: Record<string, string> = {
    socialLinks: 'link',
    skills: 'Skill',
    languages: 'Language',
    workExperience: 'Work Experience',
    education: 'Education',
    projects: 'Project',
    customSections: 'Custom Section',
}

const CVEditorForm: React.FC<ComponentProps> = ({ isShowingPreview }) => {
    const sectionsOrder = useCvEditStore(state => state.sectionsOrder);
    const reorderSections = useCvEditStore(state => state.reorderSections);
    const changeSectionVisibility = useCvEditStore(state => state.changeSectionVisibility);
    const addSocialLink = useCvEditStore(state => state.addSocialLink);
    const addSkill = useCvEditStore(state => state.addSkill);
    const addLanguage = useCvEditStore(state => state.addLanguage);
    const addWorkExperience = useCvEditStore(state => state.addWorkExperience);
    const addEducation = useCvEditStore(state => state.addEducation);
    const addProject = useCvEditStore(state => state.addProject);
    const addCustomSectionAttributes = useCvEditStore(state => state.addCustomSectionAttributes);
    const customSections = useCvEditStore(state => state.customSections);
    const setCustomSectionTitle = useCvEditStore(state => state.setCustomSectionTitle);

    const sectionAddHandlers: Record<string, () => void> = React.useMemo(() => ({
        socialLinks: addSocialLink,
        skills: addSkill,
        languages: addLanguage,
        workExperience: addWorkExperience,
        education: addEducation,
        projects: addProject,
        customSections: addCustomSectionAttributes,
    }), [addSocialLink, addSkill, addLanguage, addWorkExperience, addEducation, addProject, addCustomSectionAttributes]);

    const handleReorder = useCallback(
        (activeId: string, overId: string) => reorderSections(activeId, overId),
        [reorderSections]
    );

    const handleToggleVisibility = useCallback(
        (id: string, isVisible: boolean) => changeSectionVisibility(id, isVisible),
        [changeSectionVisibility]
    );

    return (
        <div 
            className="transition-all duration-1000 bg-[#f3fbff] w-full shadow-lg z-0.5 overflow-y-auto"
            style={isShowingPreview ? {flexBasis: '56.25%'} : {flexBasis: '100%'} }
         >
            <div className="p-cv-editor-padding gap-5 flex flex-col">   
                <PersonalInfos/>
                <SortableSectionList sections={sectionsOrder} onReorder={handleReorder}>
                    {sectionsOrder.map(section => {
                        const SectionComponent = sections_mapping[section.id];
                        const labels = sections_labels[section.id];
                        if (!SectionComponent || !labels) return null;
                        return (
                            <SortableSectionItem
                                key={section.id}
                                id={section.id}
                                title={section.id === 'customSections' ? (customSections?.title ?? '') : labels.title}
                                description={labels.description}
                                isVisible={section.isVisible}
                                onToggleVisibility={handleToggleVisibility}
                                onAdd={sectionAddHandlers[section.id]}
                                addButtonLabel={sections_add_labels[section.id]}
                                editableTitle={section.id === 'customSections'}
                                titlePlaceholder={sectionConstants.custom_section.section_title_placeholder}
                                onTitleChange={section.id === 'customSections' ? setCustomSectionTitle : undefined}
                            >
                                <SectionComponent />
                            </SortableSectionItem>
                        );
                    })}
                </SortableSectionList>
            </div>
        </div>  
    );
}

export default CVEditorForm;