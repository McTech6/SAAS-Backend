 

// // src/utils/dataTranslator.js

// import { translateText } from './translator.js';





// // --- Helper function for batch translation ---
// const translateArray = async (items, lang, fieldsToTranslate) => {
//     // Ensure the input is an array of plain objects for mutation safety
//     const plainItems = items.map(item => item.toObject ? item.toObject() : item);

//     return Promise.all(plainItems.map(async (item) => {
//         // Create an array of translation promises for the specified fields
//         const translations = fieldsToTranslate.map(field => 
//             // Only attempt to translate if the field exists and has content
//             item[field] ? translateText(item[field], lang) : Promise.resolve(item[field])
//         );

//         const translatedResults = await Promise.all(translations);
//         
//         // Map the translated results back to the item fields
//         fieldsToTranslate.forEach((field, index) => {
//             item[field] = translatedResults[index];
//         });

//         return item;
//     }));
// };


// // --- End Helper function ---


// // const translateAuditTemplate = async (template, lang) => {
// //     if (lang.toUpperCase() === 'EN') return template;
// //     if (!template) return template;

// //     // Convert to plain object if it's a Mongoose document/lean object.
// //     let translatedTemplate = template.toObject ? template.toObject() : { ...template };

// //     
// //     // 1. Translate top-level fields (INCLUDING 'name' and 'description')
// //     // =========================================================================
// //     if (translatedTemplate.name) {
// //         translatedTemplate.name = await translateText(translatedTemplate.name, lang);
// //     }
// //     if (translatedTemplate.description) {
// //         translatedTemplate.description = await translateText(translatedTemplate.description, lang);
// //     }
// //     // =========================================================================


// //     // 2. Translate sections, subsections, questions, and answer options
// //     if (translatedTemplate.sections && translatedTemplate.sections.length > 0) {
// //         
// //         translatedTemplate.sections = await Promise.all(translatedTemplate.sections.map(async (section) => {
// //             
// //             // Translate Section's descriptive fields: name, description
// //             if (section.name) section.name = await translateText(section.name, lang);
// //             if (section.description) section.description = await translateText(section.description, lang);

// //             if (section.subSections && section.subSections.length > 0) {
// //                 
// //                 section.subSections = await Promise.all(section.subSections.map(async (subSection) => {

// //                     // Translate SubSection's descriptive fields: name, description
// //                     if (subSection.name) subSection.name = await translateText(subSection.name, lang);
// //                     if (subSection.description) subSection.description = await translateText(subSection.description, lang);

// //                     if (subSection.questions && subSection.questions.length > 0) {
// //                         
// //                         subSection.questions = await Promise.all(subSection.questions.map(async (question) => {

// //                             // *** TRANSLATES QUESTION 'text' and 'guidance' ***
// //                             if (question.text) question.text = await translateText(question.text, lang);
// //                             if (question.guidance) question.guidance = await translateText(question.guidance, lang);

// //                             if (question.answerOptions && question.answerOptions.length > 0) {
// //                                 
// //                                 // *** TRANSLATES 'value', 'description', and 'recommendation' ***
// //                                 question.answerOptions = await translateArray(
// //                                     question.answerOptions, 
// //                                     lang, 
// //                                     ['value', 'description', 'recommendation'] 
// //                                 );
// //                                 
// //                             }
// //                             return question;
// //                         }));
// //                     }
// //                     return subSection;
// //                 }));
// //             }
// //             return section;
// //         }));
// //     }

// //     return translatedTemplate;
// // };

// // // src/utils/dataTranslator.js

// // /**
// //  * Translates specific descriptive fields within a Company document.
// //  * @param {object} company - The mongoose company document (or lean object).
// //  * @param {string} lang - The target language code (e.g., 'FR', 'DE').
// //  * @returns {Promise<object>} The company object with translated fields.
// //  */
// // const translateCompany = async (company, lang) => {
// //     // *** FIX APPLIED HERE ***
// //     if (!lang || lang.toUpperCase() === 'EN') return company; 
// //     // *************************
    
// //     if (!company || !company.examinationEnvironment) return company;

// //     // Ensure it's a mutable plain object
// //     const translatedCompany = company.toObject ? company.toObject() : company;

// //     const environment = translatedCompany.examinationEnvironment;
// //     
// //     // Only translate 'notes' and 'generalInfo' in the examination environment
// //     // We DO NOT translate company.name
// //     const translations = [
// //         environment.notes ? translateText(environment.notes, lang) : environment.notes,
// //         environment.generalInfo ? translateText(environment.generalInfo, lang) : environment.generalInfo,
// //     ];

// //     [environment.notes, environment.generalInfo] = await Promise.all(translations);

// //     return translatedCompany;
// // };




// // export {
// //     translateAuditTemplate,
// //     translateCompany
// // };

// // src/utils/dataTranslator.js
// import { translateText } from './translator.js';

// /**
//  * Translate an array of objects fields
//  * @param {Array} items - Array of objects to translate
//  * @param {String} lang - Target language
//  * @param {Array} fields - Fields to translate
//  */
// const translateArray = async (items = [], lang, fields) => {
//   const plain = items.map(i => (i.toObject ? i.toObject() : i));

//   return Promise.all(
//     plain.map(async (item) => {
//       const translated = { ...item };
//       for (const field of fields) {
//         if (translated[field]) {
//           translated[field] = await translateText(translated[field], lang);
//         }
//       }
//       return translated;
//     })
//   );
// };

// /**
//  * Translate Audit Template OR Audit Snapshot
//  * @param {Object} template - Audit template or snapshot
//  * @param {String} lang - Target language
//  */
// export const translateAuditTemplate = async (template, lang = 'EN') => {
//   if (!template || lang === 'EN') return template;

//   const tpl = template.toObject ? template.toObject() : { ...template };

//   // Translate template-level fields
//   if (tpl.name) tpl.name = await translateText(tpl.name, lang);
//   if (tpl.description) tpl.description = await translateText(tpl.description, lang);

//   if (!tpl.sections?.length) return tpl;

//   tpl.sections = await Promise.all(
//     tpl.sections.map(async (section) => {
//       const sec = { ...section };

//       if (sec.name) sec.name = await translateText(sec.name, lang);
//       if (sec.description) sec.description = await translateText(sec.description, lang);

//       if (!sec.subSections?.length) return sec;

//       sec.subSections = await Promise.all(
//         sec.subSections.map(async (sub) => {
//           const subSec = { ...sub };

//           if (subSec.name) subSec.name = await translateText(subSec.name, lang);
//           if (subSec.description) subSec.description = await translateText(subSec.description, lang);

//           if (!subSec.questions?.length) return subSec;

//           subSec.questions = await Promise.all(
//             subSec.questions.map(async (q) => {
//               const question = { ...q };

//               if (question.text) question.text = await translateText(question.text, lang);
//               if (question.guidance) question.guidance = await translateText(question.guidance, lang);
//               if (question.recommendation) question.recommendation = await translateText(question.recommendation, lang);

//               if (question.answerOptions?.length) {
//                 question.answerOptions = await translateArray(
//                   question.answerOptions,
//                   lang,
//                   ['value', 'description', 'recommendation']
//                 );
//               }

//               return question;
//             })
//           );

//           return subSec;
//         })
//       );

//       return sec;
//     })
//   );

//   return tpl;
// };

// /**
//  * Translate Company examination environment ONLY
//  * @param {Object} company - Company object
//  * @param {String} lang - Target language
//  */
// export const translateCompany = async (company, lang = 'EN') => {
//   if (!company || lang === 'EN') return company;

//   const comp = company.toObject ? company.toObject() : company;

//   if (!comp.examinationEnvironment) return comp;

//   const env = comp.examinationEnvironment;

//   if (env.notes) env.notes = await translateText(env.notes, lang);
//   if (env.generalInfo) env.generalInfo = await translateText(env.generalInfo, lang);

//   return comp;
// };

// /**
//  * Translate audit responses (snapshot-safe)
//  * @param {Array} responses - Responses array
//  * @param {String} lang - Target language
//  */
// export const translateAuditResponses = async (responses = [], lang = 'EN') => {
//   if (!responses.length || lang === 'EN') return responses;

//   return Promise.all(
//     responses.map(async (resp) => {
//       const r = resp.toObject ? resp.toObject() : { ...resp };

//       if (r.questionTextSnapshot) r.questionTextSnapshot = await translateText(r.questionTextSnapshot, lang);
//       if (r.comment) r.comment = await translateText(r.comment, lang);
//       if (r.recommendation) r.recommendation = await translateText(r.recommendation, lang);

//       if (Array.isArray(r.answerOptionsSnapshot)) {
//         r.answerOptionsSnapshot = await Promise.all(
//           r.answerOptionsSnapshot.map(async (opt) => ({
//             ...opt,
//             value: opt.value ? await translateText(opt.value, lang) : opt.value,
//             description: opt.description ? await translateText(opt.description, lang) : opt.description,
//             recommendation: opt.recommendation ? await translateText(opt.recommendation, lang) : opt.recommendation,
//           }))
//         );
//       }

//       return r;
//     })
//   );
// };



import { translateText } from './translator.js'; // ✅ Only once

const translateArray = async (items = [], lang, fields) => {
  const plain = items.map(i => (i.toObject ? i.toObject() : i));
  return Promise.all(
    plain.map(async (item) => {
      const translated = { ...item };
      for (const field of fields) {
        if (translated[field]) {
          translated[field] = await translateText(translated[field], lang);
        }
      }
      return translated;
    })
  );
};

export const translateAuditTemplate = async (template, lang = 'EN') => {
  if (!template || lang === 'EN') return template;
  const tpl = template.toObject ? template.toObject() : { ...template };

  if (tpl.name) tpl.name = await translateText(tpl.name, lang);
  if (tpl.description) tpl.description = await translateText(tpl.description, lang);

  if (!tpl.sections?.length) return tpl;

  tpl.sections = await Promise.all(
    tpl.sections.map(async (section) => {
      const sec = { ...section };
      if (sec.name) sec.name = await translateText(sec.name, lang);
      if (sec.description) sec.description = await translateText(sec.description, lang);

      if (!sec.subSections?.length) return sec;

      sec.subSections = await Promise.all(
        sec.subSections.map(async (sub) => {
          const subSec = { ...sub };
          if (subSec.name) subSec.name = await translateText(subSec.name, lang);
          if (subSec.description) subSec.description = await translateText(subSec.description, lang);

          if (!subSec.questions?.length) return subSec;

          subSec.questions = await Promise.all(
            subSec.questions.map(async (q) => {
              const question = { ...q };
              if (question.text) question.text = await translateText(question.text, lang);
              if (question.guidance) question.guidance = await translateText(question.guidance, lang);
              if (question.recommendation) question.recommendation = await translateText(question.recommendation, lang);

              if (question.answerOptions?.length) {
                question.answerOptions = await translateArray(
                  question.answerOptions,
                  lang,
                  ['value', 'description', 'recommendation']
                );
              }

              return question;
            })
          );

          return subSec;
        })
      );

      return sec;
    })
  );

  return tpl;
};

export const translateCompany = async (company, lang = 'EN') => {
  if (!company || lang === 'EN') return company;
  const comp = company.toObject ? company.toObject() : company;
  if (!comp.examinationEnvironment) return comp;

  const env = comp.examinationEnvironment;
  if (env.notes) env.notes = await translateText(env.notes, lang);
  if (env.generalInfo) env.generalInfo = await translateText(env.generalInfo, lang);

  return comp;
};

export const translateAuditResponses = async (responses = [], lang = 'EN') => {
  if (!responses.length || lang === 'EN') return responses;

  return Promise.all(
    responses.map(async (resp) => {
      const r = resp.toObject ? resp.toObject() : { ...resp };

      if (r.questionTextSnapshot) r.questionTextSnapshot = await translateText(r.questionTextSnapshot, lang);
      if (r.comment) r.comment = await translateText(r.comment, lang);
      if (r.recommendation) r.recommendation = await translateText(r.recommendation, lang);

      if (Array.isArray(r.answerOptionsSnapshot)) {
        r.answerOptionsSnapshot = await Promise.all(
          r.answerOptionsSnapshot.map(async (opt) => ({
            ...opt,
            value: opt.value ? await translateText(opt.value, lang) : opt.value,
            description: opt.description ? await translateText(opt.description, lang) : opt.description,
            recommendation: opt.recommendation ? await translateText(opt.recommendation, lang) : opt.recommendation,
          }))
        );
      }

      return r;
    })
  );
};
