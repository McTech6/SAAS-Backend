// // src/utils/dataTranslator.js

// import { translateText } from './translator.js';

// /**
//  * Recursively translates the fields within an Audit Template structure.
//  * Only translates deep content fields (name, description, text, guidance, value, recommendation).
//  * * @param {object} template - The mongoose template document (or plain object).
//  * @param {string} lang - The target language code (e.g., 'FR', 'DE').
//  * @returns {Promise<object>} The template object with translated fields.
//  */
// const translateAuditTemplate = async (template, lang) => {
//     if (lang.toUpperCase() === 'EN') return template;
//     if (!template) return template;

//     // Use a deep clone of the Mongoose object to ensure we don't modify the source data cache
//     const translatedTemplate = template.toObject ? template.toObject() : template;

//     // 1. Translate top-level fields
//     const translations = [
//         translatedTemplate.description ? translateText(translatedTemplate.description, lang) : translatedTemplate.description,
//         // Name and Version are typically static/internal, but we translate description
//     ];

//     [translatedTemplate.description] = await Promise.all(translations);


//     // 2. Translate sections, subsections, questions, and answer options
//     if (translatedTemplate.sections && translatedTemplate.sections.length > 0) {
//         translatedTemplate.sections = await Promise.all(translatedTemplate.sections.map(async (section) => {
//             const sectionTranslations = [
//                 translateText(section.name, lang),
//                 translateText(section.description, lang),
//             ];
//             [section.name, section.description] = await Promise.all(sectionTranslations);

//             if (section.subSections && section.subSections.length > 0) {
//                 section.subSections = await Promise.all(section.subSections.map(async (subSection) => {
//                     const subSectionTranslations = [
//                         translateText(subSection.name, lang),
//                         translateText(subSection.description, lang),
//                     ];
//                     [subSection.name, subSection.description] = await Promise.all(subSectionTranslations);

//                     if (subSection.questions && subSection.questions.length > 0) {
//                         subSection.questions = await Promise.all(subSection.questions.map(async (question) => {
//                             const questionTranslations = [
//                                 translateText(question.text, lang),
//                                 translateText(question.guidance, lang),
//                             ];
//                             [question.text, question.guidance] = await Promise.all(questionTranslations);

//                             if (question.answerOptions && question.answerOptions.length > 0) {
//                                 question.answerOptions = await Promise.all(question.answerOptions.map(async (option) => {
//                                     const optionTranslations = [
//                                         // Note: We intentionally DO NOT translate 'value' (it's internal/static like 'Yes' or 'No')
//                                         translateText(option.description, lang),
//                                         translateText(option.recommendation, lang),
//                                     ];
//                                     [option.description, option.recommendation] = await Promise.all(optionTranslations);
//                                     return option;
//                                 }));
//                             }
//                             return question;
//                         }));
//                     }
//                     return subSection;
//                 }));
//             }
//             return section;
//         }));
//     }

//     return translatedTemplate;
// };

// /**
//  * Translates specific descriptive fields within a Company document.
//  * @param {object} company - The mongoose company document.
//  * @param {string} lang - The target language code (e.g., 'FR', 'DE').
//  * @returns {Promise<object>} The company object with translated fields.
//  */
// const translateCompany = async (company, lang) => {
//     if (lang.toUpperCase() === 'EN') return company;
//     if (!company || !company.examinationEnvironment) return company;

//     const translatedCompany = company.toObject ? company.toObject() : company;

//     const environment = translatedCompany.examinationEnvironment;
    
//     // Only translate 'notes' and 'generalInfo' in the examination environment
//     const translations = [
//         environment.notes ? translateText(environment.notes, lang) : environment.notes,
//         environment.generalInfo ? translateText(environment.generalInfo, lang) : environment.generalInfo,
//     ];

//     [environment.notes, environment.generalInfo] = await Promise.all(translations);

//     return translatedCompany;
// };


// export {
//     translateAuditTemplate,
//     translateCompany
// };



// src/utils/dataTranslator.js

import { translateText } from './translator.js';

// --- Helper function for batch translation ---
const translateArray = async (items, lang, fieldsToTranslate) => {
    // Ensure the input is an array of plain objects for mutation safety
    const plainItems = items.map(item => item.toObject ? item.toObject() : item);

    return Promise.all(plainItems.map(async (item) => {
        // Create an array of translation promises for the specified fields
        const translations = fieldsToTranslate.map(field => 
            // Only attempt to translate if the field exists and has content
            item[field] ? translateText(item[field], lang) : Promise.resolve(item[field])
        );

        const translatedResults = await Promise.all(translations);
        
        // Map the translated results back to the item fields
        fieldsToTranslate.forEach((field, index) => {
            item[field] = translatedResults[index];
        });

        return item;
    }));
};


// --- End Helper function ---


const translateAuditTemplate = async (template, lang) => {
    if (lang.toUpperCase() === 'EN') return template;
    if (!template) return template;

    // Convert to plain object if it's a Mongoose document/lean object.
    let translatedTemplate = template.toObject ? template.toObject() : { ...template };

    
    // 1. Translate top-level fields (INCLUDING 'name' and 'description')
    // =========================================================================
    if (translatedTemplate.name) {
        translatedTemplate.name = await translateText(translatedTemplate.name, lang);
    }
    if (translatedTemplate.description) {
        translatedTemplate.description = await translateText(translatedTemplate.description, lang);
    }
    // =========================================================================


    // 2. Translate sections, subsections, questions, and answer options
    if (translatedTemplate.sections && translatedTemplate.sections.length > 0) {
        
        translatedTemplate.sections = await Promise.all(translatedTemplate.sections.map(async (section) => {
            
            // Translate Section's descriptive fields: name, description
            if (section.name) section.name = await translateText(section.name, lang);
            if (section.description) section.description = await translateText(section.description, lang);

            if (section.subSections && section.subSections.length > 0) {
                
                section.subSections = await Promise.all(section.subSections.map(async (subSection) => {

                    // Translate SubSection's descriptive fields: name, description
                    if (subSection.name) subSection.name = await translateText(subSection.name, lang);
                    if (subSection.description) subSection.description = await translateText(subSection.description, lang);

                    if (subSection.questions && subSection.questions.length > 0) {
                        
                        subSection.questions = await Promise.all(subSection.questions.map(async (question) => {

                            // *** TRANSLATES QUESTION 'text' and 'guidance' ***
                            if (question.text) question.text = await translateText(question.text, lang);
                            if (question.guidance) question.guidance = await translateText(question.guidance, lang);

                            if (question.answerOptions && question.answerOptions.length > 0) {
                                
                                // *** TRANSLATES 'value', 'description', and 'recommendation' ***
                                question.answerOptions = await translateArray(
                                    question.answerOptions, 
                                    lang, 
                                    ['value', 'description', 'recommendation'] 
                                );
                                
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
 * @param {object} company - The mongoose company document (or lean object).
 * @param {string} lang - The target language code (e.g., 'FR', 'DE').
 * @returns {Promise<object>} The company object with translated fields.
 */
const translateCompany = async (company, lang) => {
    if (lang.toUpperCase() === 'EN') return company;
    if (!company || !company.examinationEnvironment) return company;

    // Ensure it's a mutable plain object
    const translatedCompany = company.toObject ? company.toObject() : company;

    const environment = translatedCompany.examinationEnvironment;
    
    // Only translate 'notes' and 'generalInfo' in the examination environment
    // We DO NOT translate company.name
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