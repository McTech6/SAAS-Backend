// src/utils/dataTranslator.js

import { translateText } from './translator.js';

/**
 * Recursively translates the fields within an Audit Template structure.
 * Only translates deep content fields (name, description, text, guidance, value, recommendation).
 * * @param {object} template - The mongoose template document (or plain object).
 * @param {string} lang - The target language code (e.g., 'FR', 'DE').
 * @returns {Promise<object>} The template object with translated fields.
 */
const translateAuditTemplate = async (template, lang) => {
    if (lang.toUpperCase() === 'EN') return template;
    if (!template) return template;

    // Use a deep clone of the Mongoose object to ensure we don't modify the source data cache
    const translatedTemplate = template.toObject ? template.toObject() : template;

    // 1. Translate top-level fields
    const translations = [
        translatedTemplate.description ? translateText(translatedTemplate.description, lang) : translatedTemplate.description,
        // Name and Version are typically static/internal, but we translate description
    ];

    [translatedTemplate.description] = await Promise.all(translations);


    // 2. Translate sections, subsections, questions, and answer options
    if (translatedTemplate.sections && translatedTemplate.sections.length > 0) {
        translatedTemplate.sections = await Promise.all(translatedTemplate.sections.map(async (section) => {
            const sectionTranslations = [
                translateText(section.name, lang),
                translateText(section.description, lang),
            ];
            [section.name, section.description] = await Promise.all(sectionTranslations);

            if (section.subSections && section.subSections.length > 0) {
                section.subSections = await Promise.all(section.subSections.map(async (subSection) => {
                    const subSectionTranslations = [
                        translateText(subSection.name, lang),
                        translateText(subSection.description, lang),
                    ];
                    [subSection.name, subSection.description] = await Promise.all(subSectionTranslations);

                    if (subSection.questions && subSection.questions.length > 0) {
                        subSection.questions = await Promise.all(subSection.questions.map(async (question) => {
                            const questionTranslations = [
                                translateText(question.text, lang),
                                translateText(question.guidance, lang),
                            ];
                            [question.text, question.guidance] = await Promise.all(questionTranslations);

                            if (question.answerOptions && question.answerOptions.length > 0) {
                                question.answerOptions = await Promise.all(question.answerOptions.map(async (option) => {
                                    const optionTranslations = [
                                        // Note: We intentionally DO NOT translate 'value' (it's internal/static like 'Yes' or 'No')
                                        translateText(option.description, lang),
                                        translateText(option.recommendation, lang),
                                    ];
                                    [option.description, option.recommendation] = await Promise.all(optionTranslations);
                                    return option;
                                }));
                            }
                            return question;
                        }));
                    }
                    return subSection;
                }));
            }
            return section;
        }));
    }

    return translatedTemplate;
};

/**
 * Translates specific descriptive fields within a Company document.
 * @param {object} company - The mongoose company document.
 * @param {string} lang - The target language code (e.g., 'FR', 'DE').
 * @returns {Promise<object>} The company object with translated fields.
 */
const translateCompany = async (company, lang) => {
    if (lang.toUpperCase() === 'EN') return company;
    if (!company || !company.examinationEnvironment) return company;

    const translatedCompany = company.toObject ? company.toObject() : company;

    const environment = translatedCompany.examinationEnvironment;
    
    // Only translate 'notes' and 'generalInfo' in the examination environment
    const translations = [
        environment.notes ? translateText(environment.notes, lang) : environment.notes,
        environment.generalInfo ? translateText(environment.generalInfo, lang) : environment.generalInfo,
    ];

    [environment.notes, environment.generalInfo] = await Promise.all(translations);

    return translatedCompany;
};


export {
    translateAuditTemplate,
    translateCompany
};