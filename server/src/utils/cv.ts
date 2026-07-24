import { CVContentAttributes } from "@/interfaces/cv";

export const getCVLanguageDetectionText = (cv: CVContentAttributes): string => {
    const parts: string[] = [];

    const add = (...values: (string | null | undefined)[]) => {
        for (const v of values) {
            if (v && v.trim()) parts.push(v.trim());
        }
    };

    add(cv.aboutMe);

    for (const exp of cv.workExperience) {
        add(exp.description);
    }

    for (const edu of cv.education) {
        add(edu.description);
    }

    for (const project of cv.projects) {
        add(project.description);
    }

    for (const item of cv.customSections.content) {
        add(item.description);
    }

    return parts.join(' ');
};
