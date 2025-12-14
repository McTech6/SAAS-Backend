 

// const LOGO_URL = 'https://res.cloudinary.com/dcviwtoog/image/upload/v1757777319/DV-Koch-Logo_0225_Logo_Farbe-rgb_bzefrw.jpg';

// /** * Escapes HTML to prevent XSS vulnerabilities. 
//  * @param {string} str - The string to escape.
//  * @returns {string} The escaped string.
//  */
// const escapeHtml = (str) => {
//     if (!str) return '';
//     return str.replace(/&/g, '&amp;')
//         .replace(/</g, '&lt;')
//         .replace(/>/g, '&gt;')
//         .replace(/"/g, '&quot;')
//         .replace(/'/g, '&#039;');
// };

// const formatDate = (d) => {
//     if (!d) return null;
//     try {
//         if (isNaN(new Date(d).getTime())) return null;
//         return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
//     } catch {
//         return null;
//     }
// };

// /** * FIXED: Properly detects compliant/yes/implemented as GREEN 
//  * @param {string|string[]} selectedValue - The value(s) of the selected answer(s).
//  * @param {string} questionType - The type of the question.
//  * @returns {{label: string, color: string}} Status info with color.
//  */
// const getStatusInfo = (selectedValue, questionType) => {
//     // Handle empty/null values
//     if (selectedValue === undefined || selectedValue === null || selectedValue === '') {
//         return { label: 'N/A', color: '#a3a3a3' };
//     }
    
//     let rawValue = '';
//     let values = [];
        
//     // Handle array values (for multi-choice)
//     if (Array.isArray(selectedValue)) {
//         values = selectedValue.map(v => String(v).trim().toLowerCase());
//         if (values.length === 0) {
//             return { label: 'N/A', color: '#a3a3a3' };
//         }
//         rawValue = values.join(', ');
//     } else {
//         rawValue = String(selectedValue).trim().toLowerCase();
//         values = [rawValue];
//     }
    
//     let color = '#a3a3a3'; // Default Grey
//     const label = rawValue || 'N/A';

//     // Logic for choice-based questions
//     if (questionType === 'single_choice' || questionType === 'multi_choice') {
        
//         // Define keywords (use .includes() for robustness against combined strings in multi-choice)
//         const implementedKeywords = ['implemented', 'yes', 'compliant'];
//         const partialKeywords = ['partially implemented', 'partial'];
//         const negativeKeywords = ['not implemented', 'no', 'non-compliant', 'absent'];

//         // Normalize rawValue for check (important for multi-choice strings like "yes, compliant")
//         const normalizedRawValue = rawValue.split(',').map(s => s.trim());

//         // 1. Check for RED (Non-Compliant/Negative)
//         const isNegative = normalizedRawValue.some(v => negativeKeywords.includes(v)) || rawValue.includes('non-compliant');

//         // 2. Check for ORANGE (Partial)
//         const isPartial = normalizedRawValue.some(v => partialKeywords.includes(v)) || rawValue.includes('partially');
        
//         // 3. Check for GREEN (Compliant/Implemented) - Must NOT be negative or partial
//         const isImplemented = normalizedRawValue.some(v => implementedKeywords.includes(v)) || 
//                               (rawValue.includes('implemented') && !rawValue.includes('not implemented') && !rawValue.includes('partially')) ||
//                               (rawValue.includes('compliant') && !rawValue.includes('non-compliant'));
                              
//         if (isNegative) {
//             color = '#ef4444'; // RED
//         } else if (isPartial) {
//             color = '#f59e0b'; // ORANGE
//         } else if (isImplemented) {
//              // Use GREEN if any positive keyword is present and no negative/partial override.
//              color = '#16a34a'; // GREEN
//         } else {
//              // Fallback for custom or unrecognized choice-based answers
//              color = '#a3a3a3'; 
//         }

//     } else {
//         // For non-choice types - always grey
//         color = '#a3a3a3';
//     }

//     return { 
//         label: label, 
//         color: color 
//     };
// };

// /** * Build table of contents HTML 
//  */
// const buildToc = (templateStructure) => {
//     if (!Array.isArray(templateStructure) || templateStructure.length === 0) return '<p>(No content)</p>';
//     let tocHtml = '<ul class="toc-root">';
//     templateStructure.forEach((section, sIdx) => {
//         const secId = `sec-${sIdx}`;
//         tocHtml += `<li><a href="#${secId}">${escapeHtml(section.name || 'Unnamed Section')}</a>`;
//         if (Array.isArray(section.subSections) && section.subSections.length > 0) {
//             tocHtml += '<ul>';
//             section.subSections.forEach((ss, ssIdx) => {
//                 const subId = `sec-${sIdx}-sub-${ssIdx}`;
//                 tocHtml += `<li><a href="#${subId}">${escapeHtml(ss.name || 'Unnamed Subsection')}</a></li>`;
//             });
//             tocHtml += '</ul>';
//         }
//         tocHtml += '</li>';
//     });
//     tocHtml += '</ul>';
//     return tocHtml;
// };

// const generateReportHtml = (auditInstance = {}) => {
//     console.log('[generateReportHtml] Received audit instance');
    
//     const company = auditInstance.company || {};
//     const template = auditInstance.template || {};
//     const responses = auditInstance.responses || [];
//     const templateStructure = auditInstance.templateStructureSnapshot || [];
//     const overallScore = (typeof auditInstance.overallScore === 'number') ? Math.round(auditInstance.overallScore) : 0;
//     const createdBy = auditInstance.createdBy || {};
//     const auditorsToDisplay = auditInstance.auditorsToDisplay || [];
//     const examinationEnvironment = company.examinationEnvironment || auditInstance.examinationEnvironment || {};
//     const summaries = auditInstance.summaries || [];
//     const reportDate = formatDate(new Date());

//     const startDateFormatted = formatDate(auditInstance.startDate);
//     const endDateFormatted = formatDate(auditInstance.endDate);
//     let auditDateRange = 'N/A';
//     if (startDateFormatted && endDateFormatted) {
//         auditDateRange = `${startDateFormatted} - ${endDateFormatted}`;
//     } else if (startDateFormatted) {
//         auditDateRange = startDateFormatted;
//     }

//     const auditorLines = auditorsToDisplay.map(u => `${escapeHtml(u.firstName || '')} ${escapeHtml(u.lastName || '')} (${escapeHtml(u.email || '')})`).join('<br/>') || `${escapeHtml(createdBy.firstName || '')} ${escapeHtml(createdBy.lastName || '')} (${escapeHtml(createdBy.email || '')})`;

//     const contactName = company.contactPerson?.name || '';
//     const contactEmail = company.contactPerson?.email || '';

//     const tocHtml = buildToc(templateStructure);

//     // Build main content with sections starting on new pages
//     let mainHtml = '';
//     templateStructure.forEach((section, sIdx) => {
//         const secId = `sec-${sIdx}`;
        
//         // Each section starts on a new page (except the first one)
//         const sectionClass = sIdx === 0 ? 'section' : 'section section-page-break';
        
//         mainHtml += `<div class="${sectionClass}" id="${secId}">`;
//         mainHtml += `<h2 class="header-spacing">${escapeHtml(section.name || 'Unnamed Section')}</h2>`;
        
//         if (section.description) {
//             mainHtml += `<p class="section-desc">${escapeHtml(section.description)}</p>`;
//         }

//         (section.subSections || []).forEach((subSection, ssIdx) => {
//             const subId = `sec-${sIdx}-sub-${ssIdx}`;
            
//             // Subsections keep together intelligently (via CSS page-break-inside: avoid on .subsection)
//             mainHtml += `<div class="subsection" id="${subId}">`;
//             mainHtml += `<h3 class="header-spacing">${escapeHtml(subSection.name || 'Unnamed Subsection')}</h3>`;
            
//             if (subSection.description) {
//                 mainHtml += `<p class="subsection-desc">${escapeHtml(subSection.description)}</p>`;
//             }

//             (subSection.questions || []).forEach((question, qIdx) => {
//                 const resp = responses.find(r => r.questionId?.toString() === question._id?.toString()) || {};
                
//                 let selectedValueDisplay = resp.selectedValue;
//                 if (Array.isArray(resp.selectedValue)) {
//                     selectedValueDisplay = resp.selectedValue.join(', ');
//                 } else if (resp.selectedValue === undefined || resp.selectedValue === null || resp.selectedValue === '') {
//                     selectedValueDisplay = 'N/A';
//                 }

//                 const questionType = resp.questionTypeSnapshot || question.type || 'text_input';
//                 const status = getStatusInfo(resp.selectedValue, questionType);
                
//                 const answerText = escapeHtml(String(selectedValueDisplay));
//                 const answerHtml = `<span style="color: ${status.color};"><strong>${answerText}</strong></span>`;
                
//                 const commentHtml = resp.comment ? `<div class="comment"><strong>Comment:</strong><div>${escapeHtml(resp.comment)}</div></div>` : '';
//                 const evidenceHtml = (Array.isArray(resp.evidenceUrls) && resp.evidenceUrls.length > 0) ? `<div class="evidence"><strong>Evidence:</strong><ul>${resp.evidenceUrls.map(u => `<li><a href="${escapeHtml(u)}">${escapeHtml(u)}</a></li>`).join('')}</ul></div>` : '';
//                 const recommendationHtml = resp.recommendation ? `<div class="recommendation"><strong>Recommendation:</strong><div>${escapeHtml(resp.recommendation)}</div></div>` : '';

//                 mainHtml += `
//                     <div class="question-block">
//                         <div class="question-header" style="border-left:3px solid ${status.color};">
//                             <p class="question-title"><strong>${escapeHtml(question.text || 'Untitled question')}</strong></p>
//                         </div>
//                         <div class="answer-row"><strong>Answer:</strong> ${answerHtml}</div>
//                         ${recommendationHtml}
//                         ${commentHtml}
//                         ${evidenceHtml}
//                     </div>
//                 `;
//             });

//             mainHtml += `</div>`; // Close subsection
//         });

//         mainHtml += `</div>`; // Close section
//     });

//     const envHtml = `
//         <table class="env">
//             <tr><td><strong>Locations</strong></td><td>${escapeHtml(String(examinationEnvironment.locations || 'N/A'))}</td></tr>
//             <tr><td><strong>Number of employees</strong></td><td>${escapeHtml(String(examinationEnvironment.employees || 'N/A'))}</td></tr>
//             <tr><td><strong>Clients (total)</strong></td><td>${escapeHtml(String(examinationEnvironment.clients?.total || 'N/A'))}</td></tr>
//             <tr><td><strong>Clients (managed)</strong></td><td>${escapeHtml(String(examinationEnvironment.clients?.managed || 'N/A'))}</td></tr>
//             <tr><td><strong>Clients (unmanaged)</strong></td><td>${escapeHtml(String(examinationEnvironment.clients?.unmanaged || 'N/A'))}</td></tr>
//             <tr><td><strong>Industry</strong></td><td>${escapeHtml(examinationEnvironment.industry || company.industry || 'N/A')}</td></tr>
//             <tr><td><strong>Physical servers</strong></td><td>${escapeHtml(String(examinationEnvironment.physicalServers || 'N/A'))}</td></tr>
//             <tr><td><strong>VM servers</strong></td><td>${escapeHtml(String(examinationEnvironment.vmServers || 'N/A'))}</td></tr>
//             <tr><td><strong>Firewalls</strong></td><td>${escapeHtml(String(examinationEnvironment.firewalls || 'N/A'))}</td></tr>
//             <tr><td><strong>Switches</strong></td><td>${escapeHtml(String(examinationEnvironment.switches || 'N/A'))}</td></tr>
//             <tr><td><strong>Mobile working</strong></td><td>${examinationEnvironment.mobileWorking ? 'Yes' : 'No'}</td></tr>
//             <tr><td><strong>Smartphones</strong></td><td>${examinationEnvironment.smartphones ? 'Yes' : 'No'}</td></tr>
//             ${examinationEnvironment.notes ? `<tr><td><strong>Notes</strong></td><td>${escapeHtml(examinationEnvironment.notes)}</td></tr>` : ''}
//         </table>
//     `;

//     const summariesHtml = (Array.isArray(summaries) && summaries.length > 0)
//         ? summaries.map(s => `<div class="summary"><p><strong>${escapeHtml(s.auditor?.firstName || '')} ${escapeHtml(s.auditor?.lastName || '')}</strong></p><p>${escapeHtml(s.text || '')}</p></div>`).join('')
//         : '<p class="justify-text">No summaries provided.</p>';

//     const introductionText = `
//         <p class="justify-text static-text">When we speak about Cyber, Information, and IT Security, it is important to recognize that it is not only a technical matter. Technology plays a key role, but security is always the result of three dimensions working together:</p>
//         <ul style="margin-top: 5px; margin-bottom: 5px;">
//             <li><strong>Technology</strong> – the tools and systems that protect our data.</li>
//             <li><strong>Organization</strong> – the rules, processes, and responsibilities that guide how we work.</li>
//             <li><strong>People</strong> – the awareness, behavior, and decisions of everyone involved.</li>
//         </ul>
//         <p class="justify-text static-text">Only when these three elements are combined can we create real protection. Focusing on technology alone is not enough. A secure company requires clear structures, well-trained employees, and a culture where security is seen as part of everyday work.</p>
//         <p class="justify-text static-text">In today's ever-changing world, the importance of protecting data and systems continues to grow. New threats appear daily, and digitalization increases the complexity of our business environment. For this reason, security must be given the right priority. It should not be treated as an "add-on" or a last step, but as an integral part of every decision, process, and investment.</p>
//         <p class="justify-text static-text">This audit report is designed to make this approach practical and understandable. It gives a transparent overview of your current situation, highlights strengths and weaknesses, and provides clear guidance for next steps. The goal is not only to identify risks but also to enable your organization to build sustainable protection—so that technology, organization, and people are aligned and your company can continue to operate with confidence and resilience.</p>
//     `;

//     const aboutCompanyAudited = `
//         <p class="justify-text static-text">As a prominent player in the <strong>${escapeHtml(company.industry || '')}</strong> industry, <strong>${escapeHtml(company.name || 'Test company')}</strong> has shown a strong commitment to maintaining a secure and reliable operational environment. Our audit was conducted to assess their current security posture, providing a detailed overview of their defenses and identifying key areas for continuous improvement. This assessment highlights their dedication to protecting their digital assets and fostering a resilient business infrastructure.</p>
//         <p class="static-text" style="margin-top: 5px;"><strong>Contact person:</strong> ${escapeHtml(contactName || '')} — ${escapeHtml(contactEmail || '')}</p>
//         ${company.generalInfo || company.examinationEnvironment?.generalInfo ? `<p class="justify-text static-text">${escapeHtml(company.generalInfo || company.examinationEnvironment?.generalInfo)}</p>` : ''}
//     `;

//     const aboutCompanyHardcoded = `
//         <p class="justify-text static-text">We, DV-Beratung Koch, are your reliable partner and system house for information technology, telecommunications and video surveillance. Since 1993, we have been successfully implementing IT projects in the areas of government, healthcare and small and medium-sized enterprises.</p>
//         <p class="justify-text static-text">Over the years, our product and service portfolio has been continuously adapted and expanded in line with technological developments. Our aim is to offer you a comprehensive range of IT solutions from a single source, including perfectly coordinated hardware and software for your company.</p>
//         <p class="justify-text static-text">Through continuous training of our team, we ensure that our expert knowledge is always up to date in order to guarantee you modern IT consulting and implementation. We look forward to starting a successful and cooperative partnership with you.</p>
//     `;

//     const prefaceText = `
//         <p class="justify-text static-text">The ISARON Check Report has been developed to provide organizations with a structured and independent assessment of their information security posture. The aim is not only to identify technical issues, but to create a holistic view that combines technology, organization, and people.</p>
//         <p class="justify-text static-text">This report is designed as a practical tool for decision-makers at all levels. Whether you have a technical background or not, the findings and recommendations are presented in a way that allows you to clearly understand where strengths lie, where risks exist, and what steps can be taken to achieve sustainable improvement.</p>
//         <p class="justify-text static-text">Our mission is to support organizations in treating cybersecurity as an integral part of their business strategy and daily operations—helping to build trust, ensure compliance, and strengthen resilience in an ever-changing digital world.</p>
//     `;

//     const disclaimerText = `
//         <p class="justify-text static-text">This report is based on the information, data, and evidence made available during the audit process. While every effort has been made to provide accurate and reliable findings, the results and recommendations are limited to the scope of the audit and the time of its execution.</p>
//         <p class="justify-text static-text">The report should not be considered a guarantee against future risks or incidents. Security threats evolve constantly, and continuous monitoring, improvement, and adaptation remain essential.</p>
//         <p class="justify-text static-text">The auditor and auditing organization do not assume liability for direct or indirect damages that may result from the use of this report. The responsibility for implementing and maintaining effective security measures lies with the audited organization.</p>
//     `;

//     const handoverText = `
//         <p class="justify-text static-text">This page confirms that the assessment  report titled "<strong>${escapeHtml(template.name || 'Name of the audit')}</strong>" has been formally handed over by the auditor to the audited company.</p>
//         <p class="justify-text static-text">By signing below, both parties acknowledge the reception of the full audit report and confirm that it has been delivered in its final version.</p>

//         <div class="handover-section">
//             <h3 class="handover-heading">Auditor:</h3>
//             <table class="handover-table">
//                 <tr><td>Name:</td><td><span class="signature-input"></span></td><td>Organization:</td><td><span class="signature-input"></span></td><td>Date:</td><td><span class="signature-input"></span></td></tr>
//                 <tr><td colspan="6" class="signature-line-row">Signature: <span class="signature-line"></span></td></tr>
//             </table>
//         </div>
        
//         <div class="handover-section" style="margin-top: 30px;">
//             <h3 class="handover-heading">Audited Company Representative:</h3>
//             <table class="handover-table">
//                 <tr><td>Name:</td><td><span class="signature-input"></span></td><td>Organization:</td><td><span class="signature-input"></span></td><td>Date:</td><td><span class="signature-input"></span></td></tr>
//                 <tr><td colspan="6" class="signature-line-row">Signature: <span class="signature-line"></span></td></tr>
//             </table>
//         </div>
//     `;

//     const thankYouText = `
//         <div style="text-align: center;">
//             <h2 style="border-bottom: none; margin-bottom: 5px; font-size: 26pt; color: #014f65; margin-top: 0; font-family: 'Lexend', sans-serif;">Thank You</h2>
//             <p style="font-size: 16pt; margin-bottom: 15px; margin-top: 5px; font-weight: bold; line-height: 1.5;">for Choosing Cybersecurity Audit 360</p>
//             <p class="justify-text static-text">We are committed to enhancing your organization's security posture and ensuring compliance in an ever evolving threat landscape. This report serves as a foundational step towards a more resilient and secure future.</p>
//             <p class="justify-text static-text">Our team is dedicated to supporting your journey beyond this audit. We encourage you to review the findings and recommendations carefully and reach out to us for any clarifications or assistance in implementing the suggested improvements.</p>
//             <p class="static-text" style="margin-top: 15px;">For further discussions or to schedule a follow-up consultation, please contact us:</p>
//             <div class="contact">
//                 <p class="static-text"><strong>Email:</strong> <a href="mailto:info@cybersecurityaudit360.com">info@cybersecurityaudit360.com</a></p>
//                 <p class="static-text"><strong>Website:</strong> <a href="https://www.cybersecurityaudit360.com">www.cybersecurityaudit360.com</a></p>
//             </div>
//             <h3 class="slogan-center">"Securing Your Digital Horizon, Together."</h3>
//         </div>
//     `;

//     const html = `
//     <!doctype html>
//     <html>
//     <head>
//         <meta charset="utf-8">
//         <title>Audit Report - ${escapeHtml(company.name || 'Unknown Company')}</title>
//         <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
//         <style>
//             @page { 
//                 margin: 0.35in;
//                 @bottom-center {
//                     content: counter(page) "/" counter(pages);
//                     font-family: 'Arial', Helvetica, sans-serif;
//                     font-size: 10pt;
//                     color: #666;
//                 }
//             }
//             body { 
//                 font-family: 'Arial', Helvetica, sans-serif; 
//                 font-size: 14pt;
//                 color: #2c3e50; 
//                 margin: 0; 
//                 -webkit-print-color-adjust: exact; 
//                 counter-reset: page;
//             } 
//             .container { 
//                 padding: 0.35in; 
//                 box-sizing: border-box;
//                 position: relative;
//             }

//             /* Hide page number on cover page */
//             .cover-page {
//                 counter-increment: page;
//             }
//             .cover-page::after {
//                 display: none;
//             }

//             /* ========================================================= */
//             /* Global Styles: Headers and Static Text */
//             /* ========================================================= */

//             h2, .cover-title h1, .cover-title h2 { 
//                 font-family: 'Lexend', sans-serif !important; 
//                 font-size: 26pt !important;
//                 color: #014f65;
//                 text-align: center; 
//             }
//             h3 { 
//                 font-family: 'Lexend', sans-serif !important; 
//                 font-size: 20pt !important;
//                 color: #2c3e50;
//                 text-align: left;
//             }

//             .header-spacing { 
//                 margin-top: 25px !important;
//                 margin-bottom: 16px !important;
//                 padding-bottom: 0 !important;
//             }
            
//             .static-text, .static-text > *, ul li, .justify-text, .cover-quote p { 
//                 line-height: 1.5 !important; 
//             }
//             .justify-text { text-align: justify; }

//             p { margin: 3px 0; line-height: 1.4; }

//             /* ========================================================= */
//             /* PAGE BREAK MANAGEMENT - TARGETED FIXES */
//             /* ========================================================= */
            
//             /* Start main report sections on a new page */
//             .page-break { page-break-before: always; }
            
//             /* Start all content sections on a new page (except the first one) */
//             .section-page-break {
//                 page-break-before: always;
//             }
            
//             /* Keep subsections together intelligently */
//             .subsection {
//                 page-break-inside: avoid;
//                 page-break-after: auto;
//             }
            
//             /* Prevent orphaned headers and widows */
//             h2, h3 {
//                 page-break-after: avoid;
//                 orphans: 3;
//                 widows: 3;
//             }
            
//             /* Try to keep question blocks together */
//             .question-block {
//                 page-break-inside: avoid;
//             }
            
//             /* ========================================================= */
//             /* Cover Page Styles */
//             /* ========================================================= */
//             .cover { 
//                 text-align: center; 
//                 padding-top: 15px; 
//                 padding-bottom: 10px; 
//                 height: 9.3in; 
//                 display: flex; 
//                 flex-direction: column; 
//                 justify-content: space-between; 
//             }
//             .logo { max-width: 350px; margin-bottom: 15px; } 
            
//             .cover-title { margin-top: 15px; } 
//             .cover-title h1 { font-size: 40pt !important; line-height: 1.1; margin: 0; }
//             .cover-title h2 { font-size: 30pt !important; padding-bottom: 5px; font-weight: normal; margin-top: 5px;}

//             .meta { 
//                 margin: 20px 0 30px 0; 
//                 font-size: 16pt;
//                 line-height: 1.5;
//             }
//             .meta p { margin: 16px 0; }
//             .for-company { 
//                 margin-top: 15px; 
//                 line-height: 1.5; 
//                 font-size: 16pt;
//             }
//             .cover-quote { margin-top: 20px; font-style: italic; color: #555; max-width: 700px; margin-left: auto; margin-right: auto; line-height: 1.5; font-size: 14pt; }


//             /* ========================================================= */
//             /* Content Section Styles */
//             /* ========================================================= */
            
//             .toc-root { counter-reset: section; padding-left: 0; margin-top: 8px; font-size: 14pt; }
//             .toc-root > li { counter-increment: section; margin-top: 4px; list-style: none; } 
//             .toc-root > li:before { content: counter(section) ". "; font-weight: bold; }
//             .toc-root > li ul { list-style: none; padding-left: 30px; margin-top: 2px; counter-reset: subsection; }
//             .toc-root > li li { counter-increment: subsection; margin-top: 2px; }
//             .toc-root > li li:before { content: counter(section) "." counter(subsection) ". "; font-weight: normal; }
//             .toc-root a { text-decoration: none; color: #003340; }
            
//             .question-block { margin-bottom: 6px; padding: 6px 10px; background: #fafafa; border: 1px solid #eee; border-radius: 4px; }
//             .question-header { display: flex; align-items: flex-start; margin-bottom: 2px; border-left: 3px solid; padding-left: 10px; }
//             .question-header .question-title { font-size: 11pt; margin: 0; font-family: 'Arial', Helvetica, sans-serif !important; }
//             .answer-row { margin: 3px 0; font-size: 11pt; }
//             .answer-row strong { font-weight: normal !important; }
//             .comment, .recommendation, .evidence { margin-top: 4px; padding: 5px; border-left: 3px solid #014f65; font-size: 11pt; }
//             .comment { background:#e6f7f6; }
//             .recommendation { background: #f0f8ff; }
//             .evidence { background: #fff8e6; }
//             .evidence ul { margin:3px 0 0 18px; font-size: 11pt; }
//             .section-desc, .subsection-desc { font-size: 12pt; color: #444; margin-bottom: 5px; text-align: justify; }

//             .env { width: 100%; border-collapse: collapse; margin: 8px 0 15px 0; table-layout: fixed; }
//             .env td { padding: 5px 8px; border: 1px solid #e6e6e6; font-size: 12pt; } 
//             .env td:first-child { width: 30%; font-weight: bold; background: #f5f5f5; }

//             .summary { margin:5px 0; padding:8px; background:#f6f6f6; border-radius:4px; font-size: 12pt; } 
//             .handover-heading { margin-bottom: 5px; font-size: 14pt; color: #014f65; text-align: left; font-weight: bold; font-family: 'Arial', Helvetica, sans-serif !important;}
//             .handover-table { width: 100%; margin-top: 5px; border-collapse: collapse; font-size: 12pt; } 
//             .handover-table td { padding: 2px 0; vertical-align: top; width: 16%; }
//             .handover-table td:nth-child(2), .handover-table td:nth-child(4), .handover-table td:nth-child(6) { padding-left: 5px; }
//             .signature-input { display: inline-block; border-bottom: 1px solid #000; width: 85%; height: 1em; } 
//             .signature-line-row { padding-top: 15px !important; }
//             .signature-line { display: inline-block; border-bottom: 1px solid #000; width: 250px; height: 1em; margin-left: 5px;}
//             .handover-section { margin-bottom: 25px; }
            
//             .contact { margin-top: 12px; font-size: 14pt; } 
//             .contact a { color: #003340; }
//             .slogan-center { text-align: center; margin-top: 25px; font-style: italic; color: #014f65; font-size: 20pt; font-family: 'Lexend', sans-serif !important;}
//         </style>
//     </head>
//     <body>
//         <div class="container cover-page">
//             <div class="cover">
//                 <div>
//                     <img class="logo" src="${LOGO_URL}" alt="Logo" />
//                     <div class="cover-title">
//                         <h1>${escapeHtml(template.name || 'Name of the audit')}</h1>
//                         <h2>REPORT</h2>
//                     </div>
//                     <div class="meta">
//                         <p><strong>Report Date:</strong> ${escapeHtml(reportDate)}</p>
//                         <p><strong>Audit Date:</strong> ${escapeHtml(auditDateRange)}</p>
//                         <p><strong>Auditor:</strong><br/>${auditorLines}</p>
//                     </div>
//                 </div>
//                 <div>
//                     <div class="for-company">
//                         <p class="static-text"><strong>FOR</strong></p>
//                         <p class="static-text"><strong>${escapeHtml(company.name || 'Test company')}</strong></p>
//                         <p class="static-text">${escapeHtml(contactName || 'Test contact person')} — ${escapeHtml(contactEmail || 'Test contact person email')}</p>
//                     </div>
//                     <div class="cover-quote">
//                         <p class="static-text"><em>The strength of your defence lies in knowing and understanding your vulnerabilities. This audit provides you with the information you need to create a secure environment in your company. "You can only protect what you know."</em></p>
//                     </div>
//                 </div>
//             </div>
//         </div>

//         <div class="container page-break">
//             <h2 class="header-spacing">Table of Contents</h2>
//             ${tocHtml}
//         </div>

//         <div class="container page-break">
//             <h2 class="header-spacing">Introduction</h2>
//             ${introductionText}
//         </div>

//         <div class="container page-break">
//             <h2 class="header-spacing">About the Auditing Company</h2>
//             ${aboutCompanyHardcoded}
//             <h2 class="header-spacing" style="margin-top: 25px;">About the Audited Company</h2>
//             ${aboutCompanyAudited}
//         </div>

//         <div class="container page-break">
//             <h2 class="header-spacing">Preface</h2>
//             ${prefaceText}
//             <h2 class="header-spacing" style="margin-top: 25px;">Disclaimer</h2>
//             ${disclaimerText}
//         </div>

//         <div class="container page-break">
//             <h2 class="header-spacing">Executive Summary</h2>
//             <p class="justify-text static-text">This report provides a comprehensive overview of the cybersecurity posture for <strong>${escapeHtml(company.name || 'Test Company')}</strong> based on the "<strong>${escapeHtml(template.name || 'Name of the audit')}</strong>".</p>
//             <p class="justify-text static-text">The audit covered key areas including Information Security Policies, Access Control, and other critical domains as defined in the selected template.</p>
//             <p class="justify-text static-text">Overall, the assessment indicates a compliance score of <strong>${escapeHtml(String(overallScore))}%</strong>. Detailed findings and observations are provided in the subsequent sections, along with specific recommendations for improvement.</p>
//             <p class="justify-text static-text">It is crucial to address identified areas of non-compliance and implement recommended remediation actions to strengthen the overall security posture and ensure continuous adherence to best practices.</p>
//             ${(Array.isArray(summaries) && summaries.length > 0) ? `
//             <h2 class="header-spacing" style="margin-top: 25px;">Summary</h2>
//             ${summariesHtml}
//             ` : ''}
//         </div>

//         <div class="container page-break">
//             <h2 class="header-spacing">Examination Environment</h2>
//             ${envHtml}
//         </div>

//         <div class="container page-break">
//             <h2 class="header-spacing">Content</h2>
//             ${mainHtml}
//         </div>

//         <div class="container page-break">
//             <h2 class="header-spacing">Handover</h2>
//             ${handoverText}
//         </div>

//         <div class="container page-break">
            
//             ${thankYouText}
//         </div>

//     </body>
//     </html>
//     `;

//     return html;
// };

// export default generateReportHtml;


// const LOGO_URL = 'https://res.cloudinary.com/dcviwtoog/image/upload/v1765422490/1_BKGS_Consulting_boqy3g.png';

// /** * Escapes HTML to prevent XSS vulnerabilities. 
//  * @param {string} str - The string to escape.
//  * @returns {string} The escaped string.
//  */
// const escapeHtml = (str) => {
//     if (!str) return '';
//     return str.replace(/&/g, '&amp;')
//         .replace(/</g, '&lt;')
//         .replace(/>/g, '&gt;')
//         .replace(/"/g, '&quot;')
//         .replace(/'/g, '&#039;');
// };

// const formatDate = (d) => {
//     if (!d) return null;
//     try {
//         if (isNaN(new Date(d).getTime())) return null;
//         return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
//     } catch {
//         return null;
//     }
// };

// /** * FIXED: Properly detects compliant/yes/implemented as GREEN 
//  * @param {string|string[]} selectedValue - The value(s) of the selected answer(s).
//  * @param {string} questionType - The type of the question.
//  * @returns {{label: string, color: string}} Status info with color.
//  */
// const getStatusInfo = (selectedValue, questionType) => {
//     // Handle empty/null values
//     if (selectedValue === undefined || selectedValue === null || selectedValue === '') {
//         return { label: 'N/A', color: '#a3a3a3' };
//     }
    
//     let rawValue = '';
//     let values = [];
        
//     // Handle array values (for multi-choice)
//     if (Array.isArray(selectedValue)) {
//         values = selectedValue.map(v => String(v).trim().toLowerCase());
//         if (values.length === 0) {
//             return { label: 'N/A', color: '#a3a3a3' };
//         }
//         rawValue = values.join(', ');
//     } else {
//         rawValue = String(selectedValue).trim().toLowerCase();
//         values = [rawValue];
//     }
    
//     let color = '#a3a3a3'; // Default Grey
//     const label = rawValue || 'N/A';

//     // Logic for choice-based questions
//     if (questionType === 'single_choice' || questionType === 'multi_choice') {
        
//         // Define keywords (use .includes() for robustness against combined strings in multi-choice)
//         const implementedKeywords = ['implemented', 'yes', 'compliant'];
//         const partialKeywords = ['partially implemented', 'partial'];
//         const negativeKeywords = ['not implemented', 'no', 'non-compliant', 'absent'];

//         // Normalize rawValue for check (important for multi-choice strings like "yes, compliant")
//         const normalizedRawValue = rawValue.split(',').map(s => s.trim());

//         // 1. Check for RED (Non-Compliant/Negative)
//         const isNegative = normalizedRawValue.some(v => negativeKeywords.includes(v)) || rawValue.includes('non-compliant');

//         // 2. Check for ORANGE (Partial)
//         const isPartial = normalizedRawValue.some(v => partialKeywords.includes(v)) || rawValue.includes('partially');
        
//         // 3. Check for GREEN (Compliant/Implemented) - Must NOT be negative or partial
//         const isImplemented = normalizedRawValue.some(v => implementedKeywords.includes(v)) || 
//                               (rawValue.includes('implemented') && !rawValue.includes('not implemented') && !rawValue.includes('partially')) ||
//                               (rawValue.includes('compliant') && !rawValue.includes('non-compliant'));
                              
//         if (isNegative) {
//             color = '#ef4444'; // RED
//         } else if (isPartial) {
//             color = '#f59e0b'; // ORANGE
//         } else if (isImplemented) {
//              // Use GREEN if any positive keyword is present and no negative/partial override.
//              color = '#16a34a'; // GREEN
//         } else {
//              // Fallback for custom or unrecognized choice-based answers
//              color = '#a3a3a3'; 
//         }

//     } else {
//         // For non-choice types - always grey
//         color = '#a3a3a3';
//     }

//     return { 
//         label: label, 
//         color: color 
//     };
// };

// /** * Build table of contents HTML 
//  */
// const buildToc = (templateStructure) => {
//     if (!Array.isArray(templateStructure) || templateStructure.length === 0) return '<p>(No content)</p>';
//     let tocHtml = '<ul class="toc-root">';
//     templateStructure.forEach((section, sIdx) => {
//         const secId = `sec-${sIdx}`;
//         tocHtml += `<li><a href="#${secId}">${escapeHtml(section.name || 'Unnamed Section')}</a>`;
//         if (Array.isArray(section.subSections) && section.subSections.length > 0) {
//             tocHtml += '<ul>';
//             section.subSections.forEach((ss, ssIdx) => {
//                 const subId = `sec-${sIdx}-sub-${ssIdx}`;
//                 tocHtml += `<li><a href="#${subId}">${escapeHtml(ss.name || 'Unnamed Subsection')}</a></li>`;
//             });
//             tocHtml += '</ul>';
//         }
//         tocHtml += '</li>';
//     });
//     tocHtml += '</ul>';
//     return tocHtml;
// };

// const generateReportHtml = (auditInstance = {}) => {
//     console.log('[generateReportHtml] Received audit instance');
    
//     const company = auditInstance.company || {};
//     const template = auditInstance.template || {};
//     const responses = auditInstance.responses || [];
//     const templateStructure = auditInstance.templateStructureSnapshot || [];
//     const overallScore = (typeof auditInstance.overallScore === 'number') ? Math.round(auditInstance.overallScore) : 0;
//     const createdBy = auditInstance.createdBy || {};
//     const auditorsToDisplay = auditInstance.auditorsToDisplay || [];
//     const examinationEnvironment = company.examinationEnvironment || auditInstance.examinationEnvironment || {};
//     const summaries = auditInstance.summaries || [];
//     const reportDate = formatDate(new Date());

//     const startDateFormatted = formatDate(auditInstance.startDate);
//     const endDateFormatted = formatDate(auditInstance.endDate);
//     let auditDateRange = 'N/A';
//     if (startDateFormatted && endDateFormatted) {
//         auditDateRange = `${startDateFormatted} - ${endDateFormatted}`;
//     } else if (startDateFormatted) {
//         auditDateRange = startDateFormatted;
//     }

//     const auditorLines = auditorsToDisplay.map(u => `${escapeHtml(u.firstName || '')} ${escapeHtml(u.lastName || '')} (${escapeHtml(u.email || '')})`).join('<br/>') || `${escapeHtml(createdBy.firstName || '')} ${escapeHtml(createdBy.lastName || '')} (${escapeHtml(createdBy.email || '')})`;

//     const contactName = company.contactPerson?.name || '';
//     const contactEmail = company.contactPerson?.email || '';

//     const tocHtml = buildToc(templateStructure);

//     // Build main content with sections starting on new pages
//     let mainHtml = '';
//     templateStructure.forEach((section, sIdx) => {
//         const secId = `sec-${sIdx}`;
        
//         // Each section starts on a new page (except the first one)
//         const sectionClass = sIdx === 0 ? 'section' : 'section section-page-break';
        
//         mainHtml += `<div class="${sectionClass}" id="${secId}">`;
//         mainHtml += `<h2 class="header-spacing">${escapeHtml(section.name || 'Unnamed Section')}</h2>`;
        
//         if (section.description) {
//             mainHtml += `<p class="section-desc">${escapeHtml(section.description)}</p>`;
//         }

//         (section.subSections || []).forEach((subSection, ssIdx) => {
//             const subId = `sec-${sIdx}-sub-${ssIdx}`;
            
//             // Subsections keep together intelligently (via CSS page-break-inside: avoid on .subsection)
//             mainHtml += `<div class="subsection" id="${subId}">`;
//             mainHtml += `<h3 class="header-spacing">${escapeHtml(subSection.name || 'Unnamed Subsection')}</h3>`;
            
//             if (subSection.description) {
//                 mainHtml += `<p class="subsection-desc">${escapeHtml(subSection.description)}</p>`;
//             }

//             (subSection.questions || []).forEach((question, qIdx) => {
//                 const resp = responses.find(r => r.questionId?.toString() === question._id?.toString()) || {};
                
//                 let selectedValueDisplay = resp.selectedValue;
//                 if (Array.isArray(resp.selectedValue)) {
//                     selectedValueDisplay = resp.selectedValue.join(', ');
//                 } else if (resp.selectedValue === undefined || resp.selectedValue === null || resp.selectedValue === '') {
//                     selectedValueDisplay = 'N/A';
//                 }

//                 const questionType = resp.questionTypeSnapshot || question.type || 'text_input';
//                 const status = getStatusInfo(resp.selectedValue, questionType);
                
//                 const answerText = escapeHtml(String(selectedValueDisplay));
//                 const answerHtml = `<span style="color: ${status.color};"><strong>${answerText}</strong></span>`;
                
//                 const commentHtml = resp.comment ? `<div class="comment"><strong>Comment:</strong><div>${escapeHtml(resp.comment)}</div></div>` : '';
//                 const evidenceHtml = (Array.isArray(resp.evidenceUrls) && resp.evidenceUrls.length > 0) ? `<div class="evidence"><strong>Evidence:</strong><ul>${resp.evidenceUrls.map(u => `<li><a href="${escapeHtml(u)}">${escapeHtml(u)}</a></li>`).join('')}</ul></div>` : '';
//                 const recommendationHtml = resp.recommendation ? `<div class="recommendation"><strong>Recommendation:</strong><div>${escapeHtml(resp.recommendation)}</div></div>` : '';

//                 mainHtml += `
//                     <div class="question-block">
//                         <div class="question-header" style="border-left:3px solid ${status.color};">
//                             <p class="question-title"><strong>${escapeHtml(question.text || 'Untitled question')}</strong></p>
//                         </div>
//                         <div class="answer-row"><strong>Answer:</strong> ${answerHtml}</div>
//                         ${recommendationHtml}
//                         ${commentHtml}
//                         ${evidenceHtml}
//                     </div>
//                 `;
//             });

//             mainHtml += `</div>`; // Close subsection
//         });

//         mainHtml += `</div>`; // Close section
//     });

//     const envHtml = `
//         <table class="env">
//             <tr><td><strong>Locations</strong></td><td>${escapeHtml(String(examinationEnvironment.locations || 'N/A'))}</td></tr>
//             <tr><td><strong>Number of employees</strong></td><td>${escapeHtml(String(examinationEnvironment.employees || 'N/A'))}</td></tr>
//             <tr><td><strong>Clients (total)</strong></td><td>${escapeHtml(String(examinationEnvironment.clients?.total || 'N/A'))}</td></tr>
//             <tr><td><strong>Clients (managed)</strong></td><td>${escapeHtml(String(examinationEnvironment.clients?.managed || 'N/A'))}</td></tr>
//             <tr><td><strong>Clients (unmanaged)</strong></td><td>${escapeHtml(String(examinationEnvironment.clients?.unmanaged || 'N/A'))}</td></tr>
//             <tr><td><strong>Industry</strong></td><td>${escapeHtml(examinationEnvironment.industry || company.industry || 'N/A')}</td></tr>
//             <tr><td><strong>Physical servers</strong></td><td>${escapeHtml(String(examinationEnvironment.physicalServers || 'N/A'))}</td></tr>
//             <tr><td><strong>VM servers</strong></td><td>${escapeHtml(String(examinationEnvironment.vmServers || 'N/A'))}</td></tr>
//             <tr><td><strong>Firewalls</strong></td><td>${escapeHtml(String(examinationEnvironment.firewalls || 'N/A'))}</td></tr>
//             <tr><td><strong>Switches</strong></td><td>${escapeHtml(String(examinationEnvironment.switches || 'N/A'))}</td></tr>
//             <tr><td><strong>Mobile working</strong></td><td>${examinationEnvironment.mobileWorking ? 'Yes' : 'No'}</td></tr>
//             <tr><td><strong>Smartphones</strong></td><td>${examinationEnvironment.smartphones ? 'Yes' : 'No'}</td></tr>
//             ${examinationEnvironment.notes ? `<tr><td><strong>Notes</strong></td><td>${escapeHtml(examinationEnvironment.notes)}</td></tr>` : ''}
//         </table>
//     `;

//     const summariesHtml = (Array.isArray(summaries) && summaries.length > 0)
//         ? summaries.map(s => `<div class="summary"><p><strong>${escapeHtml(s.auditor?.firstName || '')} ${escapeHtml(s.auditor?.lastName || '')}</strong></p><p>${escapeHtml(s.text || '')}</p></div>`).join('')
//         : '<p class="justify-text">No summaries provided.</p>';

//     const introductionText = `
//         <p class="justify-text static-text">When we speak about Cyber, Information, and IT Security, it is important to recognize that it is not only a technical matter. Technology plays a key role, but security is always the result of three dimensions working together:</p>
//         <ul style="margin-top: 5px; margin-bottom: 5px;">
//             <li><strong>Technology</strong> – the tools and systems that protect our data.</li>
//             <li><strong>Organization</strong> – the rules, processes, and responsibilities that guide how we work.</li>
//             <li><strong>People</strong> – the awareness, behavior, and decisions of everyone involved.</li>
//         </ul>
//         <p class="justify-text static-text">Only when these three elements are combined can we create real protection. Focusing on technology alone is not enough. A secure company requires clear structures, well-trained employees, and a culture where security is seen as part of everyday work.</p>
//         <p class="justify-text static-text">In today's ever-changing world, the importance of protecting data and systems continues to grow. New threats appear daily, and digitalization increases the complexity of our business environment. For this reason, <strong>security must be given the right priority</strong>. It should not be treated as an "add-on" or a last step, but as an <strong>integral part of every decision, process, and investment</strong>.</p>
//         <p class="justify-text static-text">This assessment report is designed to make this approach practical and understandable. It gives a transparent overview of your current situation, highlights strengths and weaknesses, and provides clear guidance for next steps. The goal is not only to identify risks but also to enable your organization to <strong>build sustainable protection</strong> so that technology, organization, and people are aligned and your company can continue to operate with confidence and resilience.</p>
//     `;

//     const aboutCompanyAudited = `
//         <p class="justify-text static-text">As a prominent player in the <strong>${escapeHtml(company.industry || '')}</strong> industry, <strong>${escapeHtml(company.name || 'Test company')}</strong> has shown a strong commitment to maintaining a secure and reliable operational environment. Our assessment was conducted to assess their current information, IT and security posture, providing a detailed overview of their defenses and identifying key areas for continuous improvement. This assessment highlights their dedication to protecting their digital assets and fostering a resilient business infrastructure.</p>
//         <p class="static-text" style="margin-top: 5px;"><strong>Contact person:</strong> ${escapeHtml(contactName || '')} — ${escapeHtml(contactEmail || '')}</p>
//         ${company.generalInfo || company.examinationEnvironment?.generalInfo ? `<p class="justify-text static-text">${escapeHtml(company.generalInfo || company.examinationEnvironment?.generalInfo)}</p>` : ''}
//     `;

//     const aboutCompanyHardcoded = `
//         <p class="justify-text static-text">We at <strong>BKGS Consulting</strong> believe that audits and assessments should strengthen companies rather than slow them down. In a world where compliance requirements, standards, and technologies evolve faster than ever, many companies still rely on rigid tools and outdated methods to evaluate performance, security, and quality. At <strong>BKGS Consulting</strong>, we exist to change that. Our mission is to make assessments and audits simple, smart, and adaptable transforming them from static checklists into dynamic instruments for growth, trust, and improvement. We believe that every organization, regardless of its size, sector, or country deserves access to modern, intelligent solutions that align with its specific needs, frameworks, and ambitions. </p>
//         <p class="justify-text static-text style="margin-top: 5px">We combine <strong>technology, methodology,</strong> and <strong>human expertise</strong> to develop flexible, powerful audit and assessment solutions tailored to the individual needs of our clients. Our work combines <strong>32 years of consulting experience</strong> with state-of-the-art software platforms, ensuring that every client benefits from precision, scalability, and adaptability.</p>
//         <p class="justify-text static-text style="margin-top: 5px">We don’t just deliver tools we build <strong>solutions that fit your context</strong>.From defining requirements to designing <strong>dashboards</strong>, from building reporting logic to automating workflows, our team ensures that your assessment system reflects <strong>your goals, standards</strong>, and <strong>operational culture</strong>.</p>
//         <p class="justify-text static-text style="margin-top: 5px">We envision a future where audits and assessments are not bureaucratic obligations, but <strong>strategic enablers of trust and performance</strong>. A world where organizations of any size can assess themselves <strong>continuously</strong>, adjust in real time, and make decisions with confidence.</p>
//         <h3 class="slogan-local">"Securing Your Digital Horizon, Together."</h3>
//     `;

//     const prefaceText = `
//         <p class="justify-text static-text">The <strong>ISARION (Information Security Assessment Evolution) -Report</strong> has been developed to provide organizations with a structured and independent assessment of their information security posture. The aim is not only to identify technical issues, but to create a holistic view that combines <strong>technology, organization, and people</strong>.</p>
//         <p class="justify-text static-text">This report is designed as a practical tool for decision-makers at all levels. Whether you have a technical background or not, the findings and recommendations are presented in a way that allows you to clearly understand where strengths lie, where risks exist, and what steps can be taken to achieve sustainable improvement.</p>
//         <p class="justify-text static-text">Our mission is to support organizations in treating cybersecurity as an integral part of their business strategy and daily operations—helping to build trust, ensure compliance, and strengthen resilience in an ever-changing digital world.</p>
//     `;

//     const disclaimerText = `
//         <p class="justify-text static-text">This report is based on the information, data, and evidence made available during the assessment process. While every effort has been made to provide accurate and reliable findings, the results and recommendations are limited to the scope of the assessment and the time of its execution.</p>
//         <p class="justify-text static-text">The report should not be considered a guarantee against future risks or incidents. Security threats evolve constantly, and continuous monitoring, improvement, and adaptation remain essential.</p>
//         <p class="justify-text static-text">The assessor and assessing organization do not assume liability for direct or indirect damages that may result from the use of this report. The responsibility for implementing and maintaining effective security measures lies with the assessed organization.</p>
//     `;

//     const handoverText = `
//         <p class="justify-text static-text">This page confirms that the assessment report titled "<strong>${escapeHtml(template.name || 'Name of the assessment')}</strong>" has been formally handed over by the assessor to the assessed company.</p>
//         <p class="justify-text static-text">By signing below, both parties acknowledge the reception of the full assessment report and confirm that it has been delivered in its final version.</p>

//         <div class="handover-section">
//             <h3 class="handover-heading">Consultant:</h3>
//             <table class="handover-table">
//                 <tr><td>Name:</td><td><span class="signature-input"></span></td><td>Organization:</td><td><span class="signature-input"></span></td><td>Date:</td><td><span class="signature-input"></span></td></tr>
//                 <tr><td colspan="6" class="signature-line-row">Signature: <span class="signature-line"></span></td></tr>
//             </table>
//         </div>
        
//         <div class="handover-section" style="margin-top: 30px;">
//             <h3 class="handover-heading">Consulted Company Representative:</h3>
//             <table class="handover-table">
//                 <tr><td>Name:</td><td><span class="signature-input"></span></td><td>Organization:</td><td><span class="signature-input"></span></td><td>Date:</td><td><span class="signature-input"></span></td></tr>
//                 <tr><td colspan="6" class="signature-line-row">Signature: <span class="signature-line"></span></td></tr>
//             </table>
//         </div>
//     `;

//     const thankYouText = `
//         <div style="text-align: center;">
//             <h2 style="border-bottom: none; margin-bottom: 5px; font-size: 26pt; color: #014f65; margin-top: 0; font-family: 'Lexend', sans-serif;">Thank You</h2>
//             <p style="font-size: 16pt; margin-bottom: 15px; margin-top: 5px; font-weight: bold; line-height: 1.5;">for Choosing ISARION</p>
//             <p class="justify-text static-text">We are committed to enhancing your organization's security posture and ensuring compliance in an ever evolving threat landscape. This report serves as a foundational step towards a more resilient and secure future.</p>
//             <p class="justify-text static-text">Our team is dedicated to supporting your journey beyond this assessment. We encourage you to review the findings and recommendations carefully and reach out to us for any clarifications or assistance in implementing the suggested improvements.</p>
//             <p class="static-text" style="margin-top: 15px;">For further discussions or to schedule a follow-up consultation, please contact us:</p>
//             <div class="contact">
//                 <p class="static-text"><strong>Email:</strong> <a href="mailto:info@isarion.com">info@isarion.com</a></p>
//                 <p class="static-text"><strong>Website:</strong> <a href="https://www.isarion.io">www.isarion.io</a></p>
//             </div>
//             <h3 class="slogan-center"><strong>"Improvement begins with assessment and assessment begins with the right questions"</strong></h3>
//         </div>
//     `;

//     const html = `
//     <!doctype html>
//     <html>
//     <head>
//         <meta charset="utf-8">
//         <title>Assessment Report - ${escapeHtml(company.name || 'Unknown Company')}</title>
//         <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
//         <style>
//             @page { 
//                 margin: 0.35in;
//                 @bottom-center {
//                     content: counter(page) "/" counter(pages);
//                     font-family: 'Arial', Helvetica, sans-serif;
//                     font-size: 10pt;
//                     color: #666;
//                 }
//             }
//             body { 
//                 font-family: 'Arial', Helvetica, sans-serif; 
//                 font-size: 14pt;
//                 color: #2c3e50; 
//                 margin: 0; 
//                 -webkit-print-color-adjust: exact; 
//                 counter-reset: page;
//             } 
//             .container { 
//                 padding: 0.35in; 
//                 box-sizing: border-box;
//                 position: relative;
//             }

//             /* Hide page number on cover page */
//             .cover-page {
//                 counter-increment: page;
//             }
//             .cover-page::after {
//                 display: none;
//             }

//             /* ========================================================= */
//             /* Global Styles: Headers and Static Text */
//             /* ========================================================= */

//             h2, .cover-title h1, .cover-title h2 { 
//                 font-family: 'Lexend', sans-serif !important; 
//                 font-size: 26pt !important;
//                 color: #014f65;
//                 text-align: center; 
//             }
//             h3 { 
//                 font-family: 'Lexend', sans-serif !important; 
//                 font-size: 20pt !important;
//                 color: #2c3e50;
//                 text-align: left;
//             }

//             .header-spacing { 
//                 margin-top: 25px !important;
//                 margin-bottom: 16px !important;
//                 padding-bottom: 0 !important;
//             }
            
//             .static-text, .static-text > *, ul li, .justify-text, .cover-quote p { 
//                 line-height: 1.5 !important; 
//             }
//             .justify-text { text-align: justify; }

//             p { margin: 3px 0; line-height: 1.4; }

//             /* ========================================================= */
//             /* PAGE BREAK MANAGEMENT - TARGETED FIXES */
//             /* ========================================================= */
            
//             /* Start main report sections on a new page */
//             .page-break { page-break-before: always; }
            
//             /* Start all content sections on a new page (except the first one) */
//             .section-page-break {
//                 page-break-before: always;
//             }
            
//             /* Keep subsections together intelligently */
//             .subsection {
//                 page-break-inside: avoid;
//                 page-break-after: auto;
//             }
            
//             /* Prevent orphaned headers and widows */
//             h2, h3 {
//                 page-break-after: avoid;
//                 orphans: 3;
//                 widows: 3;
//             }
            
//             /* Try to keep question blocks together */
//             .question-block {
//                 page-break-inside: avoid;
//             }
            
//             /* ========================================================= */
//             /* Cover Page Styles */
//             /* ========================================================= */
//             .cover { 
//                 text-align: center; 
//                 padding-top: 15px; 
//                 padding-bottom: 10px; 
//                 height: 9.3in; 
//                 display: flex; 
//                 flex-direction: column; 
//                 justify-content: space-between; 
//             }
//             .logo { max-width: 350px; margin-bottom: 15px; } 
            
//             .cover-title { margin-top: 15px; } 
//             .cover-title h1 { font-size: 40pt !important; line-height: 1.1; margin: 0; }
//             .cover-title h2 { font-size: 30pt !important; padding-bottom: 5px; font-weight: normal; margin-top: 5px;}

//             .meta { 
//                 margin: 20px 0 30px 0; 
//                 font-size: 16pt;
//                 line-height: 1.5;
//             }
//             .meta p { margin: 16px 0; }
//             .for-company { 
//                 margin-top: 15px; 
//                 line-height: 1.5; 
//                 font-size: 16pt;
//             }
//             .cover-quote { margin-top: 20px; font-style: italic; color: #555; max-width: 700px; margin-left: auto; margin-right: auto; line-height: 1.5; font-size: 14pt; }


//             /* ========================================================= */
//             /* Content Section Styles */
//             /* ========================================================= */
            
//             .toc-root { counter-reset: section; padding-left: 0; margin-top: 8px; font-size: 14pt; }
//             .toc-root > li { counter-increment: section; margin-top: 4px; list-style: none; } 
//             .toc-root > li:before { content: counter(section) ". "; font-weight: bold; }
//             .toc-root > li ul { list-style: none; padding-left: 30px; margin-top: 2px; counter-reset: subsection; }
//             .toc-root > li li { counter-increment: subsection; margin-top: 2px; }
//             .toc-root > li li:before { content: counter(section) "." counter(subsection) ". "; font-weight: normal; }
//             .toc-root a { text-decoration: none; color: #003340; }
            
//             .question-block { margin-bottom: 6px; padding: 6px 10px; background: #fafafa; border: 1px solid #eee; border-radius: 4px; }
//             .question-header { display: flex; align-items: flex-start; margin-bottom: 2px; border-left: 3px solid; padding-left: 10px; }
//             .question-header .question-title { font-size: 11pt; margin: 0; font-family: 'Arial', Helvetica, sans-serif !important; }
//             .answer-row { margin: 3px 0; font-size: 11pt; }
//             .answer-row strong { font-weight: normal !important; }
//             .comment, .recommendation, .evidence { margin-top: 4px; padding: 5px; border-left: 3px solid #014f65; font-size: 11pt; }
//             .comment { background:#e6f7f6; }
//             .recommendation { background: #f0f8ff; }
//             .evidence { background: #fff8e6; }
//             .evidence ul { margin:3px 0 0 18px; font-size: 11pt; }
//             .section-desc, .subsection-desc { font-size: 12pt; color: #444; margin-bottom: 5px; text-align: justify; }

//             .env { width: 100%; border-collapse: collapse; margin: 8px 0 15px 0; table-layout: fixed; }
//             .env td { padding: 5px 8px; border: 1px solid #e6e6e6; font-size: 12pt; } 
//             .env td:first-child { width: 30%; font-weight: bold; background: #f5f5f5; }

//             .summary { margin:5px 0; padding:8px; background:#f6f6f6; border-radius:4px; font-size: 12pt; } 
//             .handover-heading { margin-bottom: 5px; font-size: 14pt; color: #014f65; text-align: left; font-weight: bold; font-family: 'Arial', Helvetica, sans-serif !important;}
//             .handover-table { width: 100%; margin-top: 5px; border-collapse: collapse; font-size: 12pt; } 
//             .handover-table td { padding: 2px 0; vertical-align: top; width: 16%; }
//             .handover-table td:nth-child(2), .handover-table td:nth-child(4), .handover-table td:nth-child(6) { padding-left: 5px; }
//             .signature-input { display: inline-block; border-bottom: 1px solid #000; width: 85%; height: 1em; } 
//             .signature-line-row { padding-top: 15px !important; }
//             .signature-line { display: inline-block; border-bottom: 1px solid #000; width: 250px; height: 1em; margin-left: 5px;}
//             .handover-section { margin-bottom: 25px; }
            
//             .contact { margin-top: 12px; font-size: 14pt; } 
//             .contact a { color: #003340; }
//             .slogan-center { text-align: center; margin-top: 25px; font-style: italic; color: #014f65; font-size: 20pt; font-family: 'Lexend', sans-serif !important;}
//             .slogan-local { text-align: center; margin-top: 5px; font-style: italic; color: #000; font-size: 14pt; font-family: 'Lexend', sans-serif !important;}
//             .slogan-random { text-align: center; margin-top: 5px; color: #000; font-size: 14pt; font-family: 'Lexend', sans-serif !important;}
//         </style>
//     </head>
//     <body>
//         <div class="container cover-page">
//             <div class="cover">
//                 <div>
//                     <img class="logo" src="${LOGO_URL}" alt="Logo" />
//                     <div class="cover-title">
//                         <h1>${escapeHtml(template.name || 'Name of the assessment')}</h1>
//                         <h2>REPORT</h2>
//                     </div>
//                     <div class="meta">
//                         <p><strong>Report Date:</strong> ${escapeHtml(reportDate)}</p>
//                         <p><strong>Assessment Date:</strong> ${escapeHtml(auditDateRange)}</p>
//                         <p><strong>Assessor:</strong><br/>${auditorLines}</p>
//                     </div>
//                 </div>
//                 <div>
//                     <div class="for-company">
//                         <p class="static-text"><strong>FOR</strong></p>
//                         <p class="static-text"><strong>${escapeHtml(company.name || 'Test company')}</strong></p>
//                         <p class="static-text">${escapeHtml(contactName || 'Test contact person')} — ${escapeHtml(contactEmail || 'Test contact person email')}</p>
//                     </div>
//                     <div class="cover-quote">
//                         <p class="static-text"><em>The strength of your defence lies in knowing and understanding your vulnerabilities. This assessment provides you with the information you need to create a secure environment in your company. "You can only protect what you know."</em></p>
//                     </div>
//                 </div>
//             </div>
//         </div>

//         <div class="container page-break">
//             <h2 class="header-spacing">Table of Contents</h2>
//             ${tocHtml}
//         </div>

//         <div class="container page-break">
//             <h2 class="header-spacing">Introduction</h2>
//             ${introductionText}
//         </div>

//         <div class="container page-break">
//             <h2 class="header-spacing">About the Consulting Company</h2>
//             ${aboutCompanyHardcoded}
//             <h2 class="header-spacing" style="margin-top: 25px;">About the Examinated Company</h2>
//             ${aboutCompanyAudited}
//         </div>

//         <div class="container page-break">
//             <h2 class="header-spacing">Preface</h2>
//             ${prefaceText}
//             <h2 class="header-spacing" style="margin-top: 25px;">Disclaimer</h2>
//             ${disclaimerText}
//         </div>

//         <div class="container page-break">
//             <h2 class="header-spacing">Executive Summary</h2>
//             <p class="justify-text static-text">This report provides a comprehensive overview of the Information, IT, and cybersecurity posture for <strong>${escapeHtml(company.name || 'Test Company')}</strong> based on the "<strong>${escapeHtml(template.name || 'Name of the assessment')}</strong>".</p>
//             <p class="justify-text static-text">The assessment covered key areas including Information Security Policies, Access Control, and other critical domains as defined in the selected template.</p>
//             <p class="justify-text static-text">Overall, the assessment indicates a compliance score of <strong>${escapeHtml(String(overallScore))}%</strong>. Detailed findings and observations are provided in the subsequent sections, along with specific recommendations for improvement.</p>
//             <p class="justify-text static-text">It is crucial to address identified areas of non-compliance and implement recommended remediation actions to strengthen the overall security posture and ensure continuous adherence to best practices.</p>
//              <h3 class="slogan-random"><strong>"Cyber resilience as part of your organization's reputation"</strong></h3>
//              <p class="justify-text static-text" style="margin-top: 5px;>Cyber resilience refers to an entity's ability to continuously deliver the intended outcome, despite cyber-attacks. Resilience to cyber-attacks is essential to IT systems, critical infrastructure, business processes, organizations, societies, and nation-states.</p>
//               <p class="justify-text static-text" style="margin-top: 5px;>Resilience is like juggling lots of balls: it is not enough to optimize individual points. The key to success lies in the ability to think holistically and to orchestrate several strands of action in parallel, from awareness training and technical security to clear crisis management. Resources (budget and people) alone does not lead to success. This is also evident in reality: organizations with the largest IT budgets are not automatically the best protected. The decisive factor is whether security and resilience issues are at the top of the agenda and whether processes, responsibilities and recovery concepts are regularly reviewed, tested and further developed. Cyber resilience is therefore not a project with an end date, but an ongoing management task. As with sustainability, it requires a cultural shift: away from pure compliance thinking and towards genuine risk competence at all levels.</p>
//                <p class="justify-text static-text" style="margin-top: 5px;>The biggest mistake is to believe that you are not affected, or even to rely on getting help in an emergency. Because when cyber-attacks become a reality, only one thing matters: <strong>“how well prepared an organization is”</strong>. Resilience begins in the mind and unfolds its effect where technology, processes and people interact. Those who take the issue seriously not only gain security, but also the trust of customers, partners, employees and ultimately the market. Cyber resilience is not just about keeping systems running. It's about taking responsibility and maintaining trust, especially when it matters, and with this assessment, you have just taken the first step. Congratulations!</p>
//             ${(Array.isArray(summaries) && summaries.length > 0) ? `
//             <h2 class="header-spacing" style="margin-top: 25px;">Summary</h2>
//             ${summariesHtml}
//             ` : ''}
//         </div>

//         <div class="container page-break">
//             <h2 class="header-spacing">Examination Environment</h2>
//             ${envHtml}
//             <p class="justify-text static-text" style="margin-top: 7px;>“The question must be predetermined, and the examiner must simply ask it and attempt to summarise these points based on the answer.”</p>
//         </div>

//         <div class="container page-break">
//             <h2 class="header-spacing">Content</h2>
//             ${mainHtml}
//         </div>

//         <div class="container page-break">
//             <h2 class="header-spacing">Handover</h2>
//             ${handoverText}
//         </div>

//         <div class="container page-break">
            
//             ${thankYouText}
//         </div>

//     </body>
//     </html>
//     `;

//     return html;
// };

// export default generateReportHtml;


// const LOGO_URL = 'https://res.cloudinary.com/dcviwtoog/image/upload/v1765422490/1_BKGS_Consulting_boqy3g.png';

// /** Escapes HTML to prevent XSS */
// const escapeHtml = (str) => {
//     if (!str) return '';
//     return String(str).replace(/&/g, '&amp;')
//         .replace(/</g, '&lt;')
//         .replace(/>/g, '&gt;')
//         .replace(/"/g, '&quot;')
//         .replace(/'/g, '&#039;');
// };

// const formatDate = (d) => {
//     if (!d) return null;
//     try {
//         const date = new Date(d);
//         if (isNaN(date.getTime())) return null;
//         return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
//     } catch {
//         return null;
//     }
// };

// /** Status color logic - GREEN for yes/compliant/implemented */
// const getStatusInfo = (selectedValue, questionType) => {
//     console.log('[getStatusInfo] Input:', { selectedValue, questionType });

//     if (selectedValue === undefined || selectedValue === null || selectedValue === '') {
//         return { label: 'N/A', color: '#a3a3a3' };
//     }

//     let values = [];
//     let rawValue = '';

//     if (Array.isArray(selectedValue)) {
//         values = selectedValue.map(v => String(v).trim().toLowerCase());
//         rawValue = values.join(', ');
//     } else {
//         rawValue = String(selectedValue).trim().toLowerCase();
//         values = [rawValue];
//     }

//     if (values.length === 0) {
//         return { label: 'N/A', color: '#a3a3a3' };
//     }

//     const implementedKeywords = ['implemented', 'yes', 'compliant', 'fully implemented'];
//     const partialKeywords = ['partially implemented', 'partial', 'partially'];
//     const negativeKeywords = ['not implemented', 'no', 'non-compliant', 'absent'];

//     const normalized = rawValue.split(',').map(s => s.trim().toLowerCase());

//     const isNegative = normalized.some(v => negativeKeywords.some(k => v.includes(k))) || 
//                        normalized.includes('no') || 
//                        normalized.includes('non-compliant');

//     const isPartial = normalized.some(v => partialKeywords.some(k => v.includes(k)));

//     const isImplemented = normalized.some(v => implementedKeywords.some(k => v.includes(k))) &&
//                           !isNegative && !isPartial;

//     let color = '#a3a3a3';
//     if (isNegative) color = '#ef4444';      // RED
//     else if (isPartial) color = '#f59e0b';  // ORANGE
//     else if (isImplemented) color = '#16a34a'; // GREEN

//     console.log('[getStatusInfo] Result:', { rawValue, isNegative, isPartial, isImplemented, color });

//     return { label: rawValue || 'N/A', color };
// };

// const buildToc = (templateStructure) => {
//     if (!Array.isArray(templateStructure) || templateStructure.length === 0) return '<p>(No content)</p>';
//     let tocHtml = '<ul class="toc-root">';
//     templateStructure.forEach((section, sIdx) => {
//         const secId = `sec-${sIdx}`;
//         tocHtml += `<li><a href="#${secId}">${escapeHtml(section.name || 'Unnamed Section')}</a>`;
//         if (Array.isArray(section.subSections) && section.subSections.length > 0) {
//             tocHtml += '<ul>';
//             section.subSections.forEach((ss, ssIdx) => {
//                 const subId = `sec-${sIdx}-sub-${ssIdx}`;
//                 tocHtml += `<li><a href="#${subId}">${escapeHtml(ss.name || 'Unnamed Subsection')}</a></li>`;
//             });
//             tocHtml += '</ul>';
//         }
//         tocHtml += '</li>';
//     });
//     tocHtml += '</ul>';
//     return tocHtml;
// };

// const generateReportHtml = (auditInstance = {}) => {
//     console.log('[generateReportHtml] Starting report generation...', auditInstance);

//     const company = auditInstance.company || {};
//     const template = auditInstance.template || {};
//     const responses = auditInstance.responses || [];
//     const templateStructure = auditInstance.templateStructureSnapshot || [];
//     const overallScore = (typeof auditInstance.overallScore === 'number') ? Math.round(auditInstance.overallScore) : 0;
//     const createdBy = auditInstance.createdBy || {};
//     const auditorsToDisplay = auditInstance.auditorsToDisplay || [];
//     const examinationEnvironment = company.examinationEnvironment || auditInstance.examinationEnvironment || {};
//     const summaries = auditInstance.summaries || [];

//     const reportDate = formatDate(new Date());
//     const startDateFormatted = formatDate(auditInstance.startDate);
//     const endDateFormatted = formatDate(auditInstance.endDate);
//     let auditDateRange = 'N/A';
//     if (startDateFormatted && endDateFormatted) {
//         auditDateRange = `${startDateFormatted} - ${endDateFormatted}`;
//     } else if (startDateFormatted) {
//         auditDateRange = startDateFormatted;
//     }

//     const auditorLines = auditorsToDisplay.length > 0
//         ? auditorsToDisplay.map(u => `${escapeHtml(u.firstName || '')} ${escapeHtml(u.lastName || '')} (${escapeHtml(u.email || '')})`).join('<br/>')
//         : `${escapeHtml(createdBy.firstName || '')} ${escapeHtml(createdBy.lastName || '')} (${escapeHtml(createdBy.email || '')})`;

//     const contactName = company.contactPerson?.name || '';
//     const contactEmail = company.contactPerson?.email || '';

//     // Use main auditor as examiner contact
//     const examinerName = auditorsToDisplay[0]?.firstName && auditorsToDisplay[0]?.lastName
//         ? `${auditorsToDisplay[0].firstName} ${auditorsToDisplay[0].lastName}`
//         : `${createdBy.firstName || ''} ${createdBy.lastName || ''}`.trim() || 'Auditor';
//     const examinerEmail = auditorsToDisplay[0]?.email || createdBy.email || 'info@isarion.com';

//     const tocHtml = buildToc(templateStructure);

//     let mainHtml = '';
//     templateStructure.forEach((section, sIdx) => {
//         const secId = `sec-${sIdx}`;
//         const sectionClass = sIdx === 0 ? 'section' : 'section section-page-break';

//         mainHtml += `<div class="${sectionClass}" id="${secId}">`;
//         mainHtml += `<h2 class="header-spacing">${escapeHtml(section.name || 'Unnamed Section')}</h2>`;

//         if (section.description) {
//             mainHtml += `<p class="section-desc">${escapeHtml(section.description)}</p>`;
//         }

//         (section.subSections || []).forEach((subSection, ssIdx) => {
//             const subId = `sec-${sIdx}-sub-${ssIdx}`;
//             mainHtml += `<div class="subsection" id="${subId}">`;
//             mainHtml += `<h3 class="header-spacing">${escapeHtml(subSection.name || 'Unnamed Subsection')}</h3>`;

//             if (subSection.description) {
//                 mainHtml += `<p class="subsection-desc">${escapeHtml(subSection.description)}</p>`;
//             }

//             (subSection.questions || []).forEach((question, qIdx) => {
//                 const resp = responses.find(r => r.questionId?.toString() === question._id?.toString()) || {};
//                 console.log(`[Question ${qIdx}] Found response:`, resp);

//                 let selectedValueDisplay = resp.selectedValue;
//                 if (Array.isArray(resp.selectedValue)) {
//                     selectedValueDisplay = resp.selectedValue.join(', ');
//                 } else if (resp.selectedValue === undefined || resp.selectedValue === null || resp.selectedValue === '') {
//                     selectedValueDisplay = 'N/A';
//                 }

//                 const questionType = resp.questionTypeSnapshot || question.type || 'text_input';
//                 const status = getStatusInfo(resp.selectedValue, questionType);

//                 const answerText = escapeHtml(String(selectedValueDisplay || 'N/A'));
//                 const answerHtml = `<span style="color: ${status.color};"><strong>${answerText}</strong></span>`;

//                 const commentHtml = resp.comment
//                     ? `<div class="comment"><strong>Comment:</strong><div>${escapeHtml(resp.comment)}</div></div>`
//                     : '';

//                 const evidenceHtml = (Array.isArray(resp.evidenceUrls) && resp.evidenceUrls.length > 0)
//                     ? `<div class="evidence"><strong>Evidence:</strong><ul>${resp.evidenceUrls.map(u => `<li><a href="${escapeHtml(u)}">${escapeHtml(u)}</a></li>`).join('')}</ul></div>`
//                     : '';

//                 // Fixed: Recommendations now properly displayed
//                 const recommendationHtml = resp.recommendation
//                     ? `<div class="recommendation"><strong>Recommendation:</strong><div>${escapeHtml(resp.recommendation)}</div></div>`
//                     : '';

//                 mainHtml += `
//                     <div class="question-block">
//                         <div class="question-header" style="border-left:3px solid ${status.color};">
//                             <p class="question-title"><strong>${escapeHtml(question.text || 'Untitled question')}</strong></p>
//                         </div>
//                         <div class="answer-row"><strong>Answer:</strong> ${answerHtml}</div>
//                         ${recommendationHtml}
//                         ${commentHtml}
//                         ${evidenceHtml}
//                     </div>
//                 `;
//             });

//             mainHtml += `</div>`; // Close subsection
//         });
//         mainHtml += `</div>`; // Close section
//     });

//     const envHtml = `
//         <table class="env">
//             <tr><td><strong>Locations</strong></td><td>${escapeHtml(String(examinationEnvironment.locations || 'N/A'))}</td></tr>
//             <tr><td><strong>Number of employees</strong></td><td>${escapeHtml(String(examinationEnvironment.employees || 'N/A'))}</td></tr>
//             <tr><td><strong>Clients (total)</strong></td><td>${escapeHtml(String(examinationEnvironment.clients?.total || 'N/A'))}</td></tr>
//             <tr><td><strong>Clients (managed)</strong></td><td>${escapeHtml(String(examinationEnvironment.clients?.managed || 'N/A'))}</td></tr>
//             <tr><td><strong>Clients (unmanaged)</strong></td><td>${escapeHtml(String(examinationEnvironment.clients?.unmanaged || 'N/A'))}</td></tr>
//             <tr><td><strong>Industry</strong></td><td>${escapeHtml(examinationEnvironment.industry || company.industry || 'N/A')}</td></tr>
//             <tr><td><strong>Physical servers</strong></td><td>${escapeHtml(String(examinationEnvironment.physicalServers || 'N/A'))}</td></tr>
//             <tr><td><strong>VM servers</strong></td><td>${escapeHtml(String(examinationEnvironment.vmServers || 'N/A'))}</td></tr>
//             <tr><td><strong>Firewalls</strong></td><td>${escapeHtml(String(examinationEnvironment.firewalls || 'N/A'))}</td></tr>
//             <tr><td><strong>Switches</strong></td><td>${escapeHtml(String(examinationEnvironment.switches || 'N/A'))}</td></tr>
//             <tr><td><strong>Mobile working</strong></td><td>${examinationEnvironment.mobileWorking ? 'Yes' : 'No'}</td></tr>
//             <tr><td><strong>Smartphones</strong></td><td>${examinationEnvironment.smartphones ? 'Yes' : 'No'}</td></tr>
//             ${examinationEnvironment.notes ? `<tr><td><strong>Notes</strong></td><td>${escapeHtml(examinationEnvironment.notes)}</td></tr>` : ''}
//         </table>
//     `;

//     const summariesHtml = (Array.isArray(summaries) && summaries.length > 0)
//         ? summaries.map(s => `<div class="summary"><p><strong>${escapeHtml(s.auditor?.firstName || '')} ${escapeHtml(s.auditor?.lastName || '')}</strong></p><p>${escapeHtml(s.text || '')}</p></div>`).join('')
//         : '<p class="justify-text">No summaries provided.</p>';

//     const introductionText = `
//         <p class="justify-text static-text">When we speak about Cyber, Information, and IT Security, it is important to recognize that it is not only a technical matter. Technology plays a key role, but security is always the result of three dimensions working together:</p>
//         <ul style="margin-top: 5px; margin-bottom: 5px;">
//             <li><strong>Technology</strong> – the tools and systems that protect our data.</li>
//             <li><strong>Organization</strong> – the rules, processes, and responsibilities that guide how we work.</li>
//             <li><strong>People</strong> – the awareness, behavior, and decisions of everyone involved.</li>
//         </ul>
//         <p class="justify-text static-text">Only when these three elements are combined can we create real protection. Focusing on technology alone is not enough. A secure company requires clear structures, well-trained employees, and a culture where security is seen as part of everyday work.</p>
//         <p class="justify-text static-text">In today's ever-changing world, the importance of protecting data and systems continues to grow. New threats appear daily, and digitalization increases the complexity of our business environment. For this reason, <strong>security must be given the right priority</strong>. It should not be treated as an "add-on" or a last step, but as an <strong>integral part of every decision, process, and investment</strong>.</p>
//         <p class="justify-text static-text">This assessment report is designed to make this approach practical and understandable. It gives a transparent overview of your current situation, highlights strengths and weaknesses, and provides clear guidance for next steps. The goal is not only to identify risks but also to enable your organization to <strong>build sustainable protection</strong> so that technology, organization, and people are aligned and your company can continue to operate with confidence and resilience.</p>
//     `;

//     const aboutCompanyHardcoded = `
//         <p class="justify-text static-text">We at <strong>BKGS Consulting</strong> believe that audits and assessments should strengthen companies rather than slow them down. In a world where compliance requirements, standards, and technologies evolve faster than ever, many companies still rely on rigid tools and outdated methods to evaluate performance, security, and quality. At <strong>BKGS Consulting</strong>, we exist to change that. Our mission is to make assessments and audits simple, smart, and adaptable — transforming them from static checklists into dynamic instruments for growth, trust, and improvement. We believe that every organization, regardless of its size, sector, or country deserves access to modern, intelligent solutions that align with its specific needs, frameworks, and ambitions.</p>
//         <p class="justify-text static-text" style="margin-top: 15px;">We combine <strong>technology, methodology,</strong> and <strong>human expertise</strong> to develop flexible, powerful audit and assessment solutions tailored to the individual needs of our clients. Our work combines <strong>32 years of consulting experience</strong> with state-of-the-art software platforms, ensuring that every client benefits from precision, scalability, and adaptability.</p>
//         <p class="justify-text static-text" style="margin-top: 15px;">We don’t just deliver tools — we build <strong>solutions that fit your context</strong>. From defining requirements to designing dashboards, from building reporting logic to automating workflows, our team ensures that your assessment system reflects <strong>your goals, standards</strong>, and <strong>operational culture</strong>.</p>
//         <p class="justify-text static-text" style="margin-top: 15px;">We envision a future where audits and assessments are not bureaucratic obligations, but <strong>strategic enablers of trust and performance</strong>. A world where organizations of any size can assess themselves <strong>continuously</strong>, adjust in real time, and make decisions with confidence.</p>
//         <h3 class="slogan-local">"Securing Your Digital Horizon, Together."</h3>
//     `;

//     const aboutCompanyAudited = `
//         <p class="justify-text static-text">As a prominent player in the <strong>${escapeHtml(company.industry || '')}</strong> industry, <strong>${escapeHtml(company.name || 'Test company')}</strong> has shown a strong commitment to maintaining a secure and reliable operational environment. Our assessment was conducted to assess their current information, IT and security posture, providing a detailed overview of their defenses and identifying key areas for continuous improvement. This assessment highlights their dedication to protecting their digital assets and fostering a resilient business infrastructure.</p>
//         <p class="static-text" style="margin-top: 5px;"><strong>Contact person:</strong> ${escapeHtml(contactName || '')} — ${escapeHtml(contactEmail || '')}</p>
//         ${company.generalInfo || examinationEnvironment.generalInfo ? `<p class="justify-text static-text">${escapeHtml(company.generalInfo || examinationEnvironment.generalInfo)}</p>` : ''}
//     `;

//     const prefaceText = `
//         <p class="justify-text static-text">The <strong>ISARION (Information Security Assessment Evolution) -Report</strong> has been developed to provide organizations with a structured and independent assessment of their information security posture. The aim is not only to identify technical issues, but to create a holistic view that combines <strong>technology, organization, and people</strong>.</p>
//         <p class="justify-text static-text">This report is designed as a practical tool for decision-makers at all levels. Whether you have a technical background or not, the findings and recommendations are presented in a way that allows you to clearly understand where strengths lie, where risks exist, and what steps can be taken to achieve sustainable improvement.</p>
//         <p class="justify-text static-text">Our mission is to support organizations in treating cybersecurity as an integral part of their business strategy and daily operations—helping to build trust, ensure compliance, and strengthen resilience in an ever-changing digital world.</p>
//     `;

//     const disclaimerText = `
//         <p class="justify-text static-text">This report is based on the information, data, and evidence made available during the assessment process. While every effort has been made to provide accurate and reliable findings, the results and recommendations are limited to the scope of the assessment and the time of its execution.</p>
//         <p class="justify-text static-text">The report should not be considered a guarantee against future risks or incidents. Security threats evolve constantly, and continuous monitoring, improvement, and adaptation remain essential.</p>
//         <p class="justify-text static-text">The assessor and assessing organization do not assume liability for direct or indirect damages that may result from the use of this report. The responsibility for implementing and maintaining effective security measures lies with the assessed organization.</p>
//     `;

//     const handoverText = `
//         <p class="justify-text static-text">This page confirms that the assessment report titled "<strong>${escapeHtml(template.name || 'Name of the assessment')}</strong>" has been formally handed over by the assessor to the assessed company.</p>
//         <p class="justify-text static-text">By signing below, both parties acknowledge the reception of the full assessment report and confirm that it has been delivered in its final version.</p>
//         <div class="handover-section">
//             <h3 class="handover-heading">Consultant:</h3>
//             <table class="handover-table">
//                 <tr><td>Name:</td><td><span class="signature-input"></span></td><td>Organization:</td><td><span class="signature-input">BKGS Consulting</span></td><td>Date:</td><td><span class="signature-input"></span></td></tr>
//                 <tr><td colspan="6" class="signature-line-row">Signature: <span class="signature-line"></span></td></tr>
//             </table>
//         </div>
//         <div class="handover-section" style="margin-top: 30px;">
//             <h3 class="handover-heading">Company Representative:</h3>
//             <table class="handover-table">
//                 <tr><td>Name:</td><td><span class="signature-input"></span></td><td>Organization:</td><td><span class="signature-input">${escapeHtml(company.name || '')}</span></td><td>Date:</td><td><span class="signature-input"></span></td></tr>
//                 <tr><td colspan="6" class="signature-line-row">Signature: <span class="signature-line"></span></td></tr>
//             </table>
//         </div>
//     `;

// const thankYouText = `
//     <div style="text-align: center;">
//         <h2 style="border-bottom: none; margin-bottom: 5px; font-size: 26pt; color: #014f65; margin-top: 0; font-family: 'Lexend', sans-serif;">Thank You</h2>
//         <p style="font-size: 16pt; margin-bottom: 15px; margin-top: 5px; font-weight: bold; line-height: 1.5;">for Choosing ISARION</p>
//         <p class="justify-text static-text">We are committed to enhancing your organization's security posture and ensuring compliance in an ever-evolving threat landscape. This report serves as a foundational step towards a more resilient and secure future.</p>
//         <p class="justify-text static-text">Our team is dedicated to supporting your journey beyond this assessment. We encourage you to review the findings and recommendations carefully and reach out to us for any clarifications or assistance in implementing the suggested improvements.</p>
//         <p class="static-text" style="margin-top: 15px;">For further discussions or to schedule a follow-up consultation, please contact your examiner:</p>
//         <div class="contact">
//             <p class="static-text"><strong>${escapeHtml(examinerName)}</strong></p>
//             <p class="static-text">
//                 <a href="mailto:${escapeHtml(examinerEmail)}" class="no-style-link">${escapeHtml(examinerEmail)}</a>
//             </p>
//         </div>
//         <h3 class="slogan-center"><strong>"Improvement begins with assessment and assessment begins with the right questions"</strong></h3>
//     </div>
// `;

//     const cyberResilienceText = `
//         <h3 class="slogan-random"><strong>"Cyber resilience as part of your organization's reputation"</strong></h3>
//         <p class="justify-text static-text" style="margin-top: 10px;">Cyber resilience refers to an entity's ability to continuously deliver the intended outcome, despite cyber-attacks. Resilience to cyber-attacks is essential to IT systems, critical infrastructure, business processes, organizations, societies, and nation-states.</p>
//         <p class="justify-text static-text">Resilience is like juggling lots of balls: it is not enough to optimize individual points. The key to success lies in the ability to think holistically and to orchestrate several strands of action in parallel, from awareness training and technical security to clear crisis management. Resources (budget and people) alone does not lead to success. This is also evident in reality: organizations with the largest IT budgets are not automatically the best protected. The decisive factor is whether security and resilience issues are at the top of the agenda and whether processes, responsibilities and recovery concepts are regularly reviewed, tested and further developed. Cyber resilience is therefore not a project with an end date, but an ongoing management task. As with sustainability, it requires a cultural shift: away from pure compliance thinking and towards genuine risk competence at all levels.</p>
//         <p class="justify-text static-text">The biggest mistake is to believe that you are not affected, or even to rely on getting help in an emergency. Because when cyber-attacks become a reality, only one thing matters: <strong>“how well prepared an organization is”</strong>. Resilience begins in the mind and unfolds its effect where technology, processes and people interact. Those who take the issue seriously not only gain security, but also the trust of customers, partners, employees and ultimately the market. Cyber resilience is not just about keeping systems running. It's about taking responsibility and maintaining trust, especially when it matters — and with this assessment, you have just taken the first step. Congratulations!</p>
//     `;

//     const coverQuoteText = `
//         <p class="static-text"><em><strong>"You can only protect what you know."</strong></em></p>
//     `;

//     const html = `
//     <!doctype html>
//     <html>
//     <head>
//         <meta charset="utf-8">
//         <title>Assessment Report - ${escapeHtml(company.name || 'Unknown Company')}</title>
//         <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
//         <style>
//             @page {
//                 margin: 0.35in;
//                 @bottom-center {
//                     content: counter(page) "/" counter(pages);
//                     font-family: Arial, sans-serif;
//                     font-size: 10pt;
//                     color: #666;
//                 }
//             }
//             body { font-family: Arial, sans-serif; font-size: 14pt; color: #2c3e50; margin: 0; -webkit-print-color-adjust: exact; }
//             .container { padding: 0.35in; box-sizing: border-box; }
//             .cover-page { counter-increment: page; }
//             .cover-page::after { display: none; }
//             h2, h3, .cover-title h1, .cover-title h2 { font-family: 'Lexend', sans-serif !important; color: #014f65; }
//             h2 { font-size: 26pt !important; text-align: center; }
//             h3 { font-size: 20pt !important; }
//             .header-spacing { margin: 25px 0 16px !important; }
//             .static-text, .justify-text { line-height: 1.5 !important; }
//             .justify-text { text-align: justify; }
//             .page-break { page-break-before: always; }
//             .section-page-break { page-break-before: always; }
//             .subsection { page-break-inside: avoid; }
//             .question-block { page-break-inside: avoid; margin-bottom: 10px; padding: 10px; background: #fafafa; border: 1px solid #eee; border-radius: 4px; }
//             .question-header { padding-left: 10px; border-left: 3px solid; }
//             .answer-row, .comment, .recommendation, .evidence { margin: 5px 0; font-size: 11pt; }
//             .recommendation { background: #f0f8ff; padding: 8px; border-left: 4px solid #014f65; }
//             .comment { background: #e6f7f6; padding: 8px; border-left: 4px solid #014f65; }
//             .evidence { background: #fff8e6; padding: 8px; border-left: 4px solid #014f65; }
//             .cover { height: 9.3in; display: flex; flex-direction: column; justify-content: space-between; text-align: center; padding: 20px 0; }
//             .logo { max-width: 350px; }
//             .cover-quote { margin-top: 30px; font-size: 15pt; max-width: 700px; margin-left: auto; margin-right: auto; }
//             .slogan-center { font-size: 20pt; margin-top: 30px; font-style: italic; color: #014f65; }
//             .slogan-random { font-size: 18pt; text-align: center; margin: 30px 0 10px; color: #014f65; }
//             .no-style-link {
//     color: #000000 !important;
//     text-decoration: none !important;
// }
//         </style>
//     </head>
//     <body>
//         <div class="container cover-page">
//             <div class="cover">
//                 <div>
//                     <img class="logo" src="${LOGO_URL}" alt="Logo" />
//                     <div class="cover-title">
//                         <h1>${escapeHtml(template.name || 'Name of the assessment')}</h1>
//                         <h2>REPORT</h2>
//                     </div>
//                     <div class="meta" style="margin: 20px 0; font-size: 16pt;">
//                         <p><strong>Report Date:</strong> ${escapeHtml(reportDate)}</p>
//                         <p><strong>Assessment Date:</strong> ${escapeHtml(auditDateRange)}</p>
//                         <p><strong>Assessor:</strong><br/>${auditorLines}</p>
//                     </div>
//                 </div>
//                 <div>
//                     <div style="font-size: 16pt;">
//                         <p><strong>FOR</strong></p>
//                         <p><strong>${escapeHtml(company.name || 'Test company')}</strong></p>
//                         <p>${escapeHtml(contactName)} — ${escapeHtml(contactEmail)}</p>
//                     </div>
//                     <div class="cover-quote">
//                         ${coverQuoteText}
//                     </div>
//                 </div>
//             </div>
//         </div>

//         <div class="container page-break"><h2 class="header-spacing">Table of Contents</h2>${tocHtml}</div>
//         <div class="container page-break"><h2 class="header-spacing">Introduction</h2>${introductionText}</div>
//         <div class="container page-break"><h2 class="header-spacing">About the Consulting Company</h2>${aboutCompanyHardcoded}</div>
        
//         <!-- About the Examined Company starts on new page -->
//         <div class="container page-break">
//             <h2 class="header-spacing">About the Examined Company</h2>
//             ${aboutCompanyAudited}
//         </div>

//         <div class="container page-break">
//             <h2 class="header-spacing">Preface</h2>${prefaceText}
//             <h2 class="header-spacing" style="margin-top: 25px;">Disclaimer</h2>${disclaimerText}
//         </div>

//         <div class="container page-break">
//             <h2 class="header-spacing">Executive Summary</h2>
//             <p class="justify-text static-text">This report provides a comprehensive overview of the Information, IT, and cybersecurity posture for <strong>${escapeHtml(company.name || 'Test Company')}</strong> based on the "<strong>${escapeHtml(template.name || 'Name of the assessment')}</strong>".</p>
//             <p class="justify-text static-text">Overall compliance score: <strong>${overallScore}%</strong>.</p>
//             ${cyberResilienceText}
//             ${summaries.length > 0 ? `<h2 class="header-spacing" style="margin-top: 25px;">Auditor Summary</h2>${summariesHtml}` : ''}
//         </div>

//         <div class="container page-break"><h2 class="header-spacing">Examination Environment</h2>${envHtml}</div>
//         <div class="container page-break"><h2 class="header-spacing">Assessment Findings</h2>${mainHtml}</div>
//         <div class="container page-break"><h2 class="header-spacing">Handover Confirmation</h2>${handoverText}</div>
//         <div class="container page-break">${thankYouText}</div>
//     </body>
//     </html>
//     `;

//     console.log('[generateReportHtml] Report generated successfully.');
//     return html;
// };

// export default generateReportHtml;
 
/* =========================================================
 *  ISARION – generateReportHtml  (2025-06-25  final)
 *  – dates are dynamic (not hard-coded)
 *  – TOC numbering / CSS identical to original commented code
 * ========================================================= *//* =========================================================
 *  ISARION – generateReportHtml  (2025-06-25  final-2)
 *  – dynamic dates
 *  – TOC identical to original commented code
 *  – examiner on one line
 *  – cyber-resilience block restored
 *  – handover tables left blank (no pre-fill)
 *  – smaller slogan font
 *  – line-height for signature rows
 *  – env vars debugged (remove `?? 0` fallback)
 * ========================================================= */
/* =========================================================
 *  ISARION – generateReportHtml  (final 2025-06-25)
 *  – overallScore used straight from auditInstance
 *  – env values merged from COMPANY first
 * ========================================================= */


// //_______MAIN________________________________
// const LOGO_URL = 'https://res.cloudinary.com/dcviwtoog/image/upload/v1765422490/1_BKGS_Consulting_boqy3g.png';

// /* ---------- helpers ---------- */
// const escapeHtml = (str) => {
//   if (!str) return '';
//   return String(str)
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;')
//     .replace(/"/g, '&quot;')
//     .replace(/'/g, '&#039;');
// };

// const formatDate = (d) => {
//   if (!d) return null;
//   try {
//     const date = new Date(d);
//     if (isNaN(date.getTime())) return null;
//     return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
//   } catch {
//     return null;
//   }
// };

// /* ---------- status colour engine ---------- */
// const getStatusInfo = (selectedValue, questionType) => {
//   if (selectedValue === undefined || selectedValue === null || selectedValue === '') {
//     return { label: 'N/A', color: '#a3a3a3' };
//   }
//   const raw = Array.isArray(selectedValue)
//     ? selectedValue.map(v => String(v).trim().toLowerCase())
//     : [String(selectedValue).trim().toLowerCase()];

//   const negative = ['not implemented', 'no', 'non-compliant', 'absent'];
//   const partial = ['partially implemented', 'partial', 'partially'];
//   const positive = ['implemented', 'yes', 'compliant', 'fully implemented'];

//   const isNeg  = raw.some(v => negative.some(k => v.includes(k))) || raw.includes('no') || raw.includes('non-compliant');
//   const isPart = raw.some(v => partial.some(k => v.includes(k)));
//   const isPos  = raw.some(v => positive.some(k => v.includes(k))) && !isNeg && !isPart;

//   let color = '#a3a3a3';
//   if (isNeg)  color = '#ef4444';
//   if (isPart) color = '#f59e0b';
//   if (isPos)  color = '#16a34a';

//   return { label: raw.join(', ') || 'N/A', color };
// };

// /* ---------- TOC (identical to original commented code) ---------- */
// const buildToc = (templateStructure) => {
//   if (!Array.isArray(templateStructure) || !templateStructure.length) return '<p>(No content)</p>';
//   let html = '<ul class="toc-root">';
//   templateStructure.forEach((sec, sIdx) => {
//     const secId = `sec-${sIdx}`;
//     html += `<li><a href="#${secId}">${escapeHtml(sec.name || 'Unnamed Section')}</a>`;
//     if (Array.isArray(sec.subSections) && sec.subSections.length) {
//       html += '<ul>';
//       sec.subSections.forEach((sub, ssIdx) => {
//         const subId = `sec-${sIdx}-sub-${ssIdx}`;
//         html += `<li><a href="#${subId}">${escapeHtml(sub.name || 'Unnamed Subsection')}</a></li>`;
//       });
//       html += '</ul>';
//     }
//     html += '</li>';
//   });
//   html += '</ul>';
//   return html;
// };

// /* =========================================================
//  *  MAIN GENERATOR
//  * ========================================================= */
// const generateReportHtml = (auditInstance = {}) => {
//   console.log('[generateReportHtml] input:', auditInstance);

//   /* ---------- core data ---------- */
//   const company   = auditInstance.company || {};
//   const template  = auditInstance.template || {};
//   const responses = auditInstance.responses || [];
//   const struct    = auditInstance.templateStructureSnapshot || [];
//   const summaries = auditInstance.summaries || [];

//   /* >>>  SCORE STRAIGHT FROM DB  <<< */
//   const overallScore = (typeof auditInstance.overallScore === 'number') ? auditInstance.overallScore : 0;
//   console.log('[generateReportHtml] overallScore from DB:', overallScore);

//   const createdBy = auditInstance.createdBy || {};
//   const auditors  = auditInstance.auditorsToDisplay || [];

//   /* ---------- environment: COMPANY first, fall-back to auditInstance ---------- */
//   const companyEnv = company.examinationEnvironment || {};
//   const auditEnv   = auditInstance.examinationEnvironment || {};
//   const examEnv    = { ...auditEnv, ...companyEnv };   // company wins

//   console.log('[generateReportHtml] merged examinationEnvironment:', examEnv);

//   /* ---------- dates ---------- */
//   const reportDate = formatDate(new Date());
//   const startDate  = formatDate(auditInstance.startDate);
//   const endDate    = formatDate(auditInstance.endDate);
//   let examinationDateRange = 'N/A';
//   if (startDate && endDate) examinationDateRange = `${startDate} - ${endDate}`;
//   else if (startDate) examinationDateRange = startDate;

//   /* ---------- auditor block ---------- */
//   const auditorLines = auditors.length
//     ? auditors.map(u => `${escapeHtml(u.firstName || '')} ${escapeHtml(u.lastName || '')} (${escapeHtml(u.email || '')})`).join('<br/>')
//     : `${escapeHtml(createdBy.firstName || '')} ${escapeHtml(createdBy.lastName || '')} (${escapeHtml(createdBy.email || '')})`;

//   /* ---------- contact ---------- */
//   const contactName  = company.contactPerson?.name  || 'Test contact person';
//   const contactEmail = company.contactPerson?.email || 'test@example.com';
//   const companyName  = company.name || 'Test company';

//   /* ---------- examiner (dynamic) ---------- */
//   const examinerName  = auditors[0]?.firstName && auditors[0]?.lastName
//     ? `${auditors[0].firstName} ${auditors[0].lastName}`
//     : `${createdBy.firstName || ''} ${createdBy.lastName || ''}`.trim() || 'Examiner';
//   const examinerEmail = auditors[0]?.email || createdBy.email || 'examiner@isarion.com';

//   /* ---------- TOC ---------- */
//   const tocHtml = buildToc(struct);

//   /* ---------- main content ---------- */
//   let mainHtml = '';
//   struct.forEach((section, sIdx) => {
//     const secId = `sec-${sIdx}`;
//     const cls   = sIdx === 0 ? 'section' : 'section section-page-break';
//     mainHtml += `<div class="${cls}" id="${secId}">`;
//     mainHtml += `<h2 class="header-spacing">${escapeHtml(section.name || 'Unnamed Section')}</h2>`;
//     if (section.description) mainHtml += `<p class="section-desc">${escapeHtml(section.description)}</p>`;

//     (section.subSections || []).forEach((sub, ssIdx) => {
//       const subId = `sec-${sIdx}-sub-${ssIdx}`;
//       mainHtml += `<div class="subsection" id="${subId}">`;
//       mainHtml += `<h3 class="header-spacing">${escapeHtml(sub.name || 'Unnamed Subsection')}</h3>`;
//       if (sub.description) mainHtml += `<p class="subsection-desc">${escapeHtml(sub.description)}</p>`;

//       (sub.questions || []).forEach((q) => {
//         const resp = responses.find(r => String(r.questionId) === String(q._id)) || {};
//         const qType = resp.questionTypeSnapshot || q.type || 'text_input';

//         let display = resp.selectedValue;
//         if (Array.isArray(display)) display = display.join(', ');
//         else if (display === undefined || display === null || display === '') display = 'N/A';

//         const status = getStatusInfo(resp.selectedValue, qType);
//         const answerHtml = `<span style="color:${status.color};"><strong>${escapeHtml(String(display))}</strong></span>`;

//         const commentHtml = resp.comment
//           ? `<div class="comment"><strong>Comment:</strong><div>${escapeHtml(resp.comment)}</div></div>` : '';
//         const recomHtml = resp.recommendation
//           ? `<div class="recommendation"><strong>Recommendation:</strong><div>${escapeHtml(resp.recommendation)}</div></div>` : '';
//         const evidHtml = (Array.isArray(resp.evidenceUrls) && resp.evidenceUrls.length)
//           ? `<div class="evidence"><strong>Evidence:</strong><ul>${resp.evidenceUrls.map(u => `<li><a href="${escapeHtml(u)}">${escapeHtml(u)}</a></li>`).join('')}</ul></div>` : '';

//         mainHtml += `
//           <div class="question-block">
//             <div class="question-header" style="border-left:3px solid ${status.color};">
//               <p class="question-title"><strong>${escapeHtml(q.text || 'Untitled question')}</strong></p>
//             </div>
//             <div class="answer-row"><strong>Answer:</strong> ${answerHtml}</div>
//             ${recomHtml}${commentHtml}${evidHtml}
//           </div>`;
//       });
//       mainHtml += '</div>';
//     });
//     mainHtml += '</div>';
//   });

//   /* ---------- examination environment (null-safe, company first) ---------- */
//   const envHtml = `
//     <table class="env">
//       <tr><td><strong>Locations</strong></td><td>${escapeHtml(String(examEnv.locations ?? 'N/A'))}</td></tr>
//       <tr><td><strong>Number of employees</strong></td><td>${escapeHtml(String(examEnv.employees ?? 'N/A'))}</td></tr>
//       <tr><td><strong>Clients (total)</strong></td><td>${escapeHtml(String(examEnv.clients?.total ?? 'N/A'))}</td></tr>
//       <tr><td><strong>Clients (managed)</strong></td><td>${escapeHtml(String(examEnv.clients?.managed ?? 'N/A'))}</td></tr>
//       <tr><td><strong>Clients (unmanaged)</strong></td><td>${escapeHtml(String(examEnv.clients?.unmanaged ?? 'N/A'))}</td></tr>
//       <tr><td><strong>Industry</strong></td><td>${escapeHtml(examEnv.industry || company.industry || 'N/A')}</td></tr>
//       <tr><td><strong>Physical servers</strong></td><td>${escapeHtml(String(examEnv.physicalServers ?? 'N/A'))}</td></tr>
//       <tr><td><strong>VM servers</strong></td><td>${escapeHtml(String(examEnv.vmServers ?? 'N/A'))}</td></tr>
//       <tr><td><strong>Firewalls</strong></td><td>${escapeHtml(String(examEnv.firewalls ?? 'N/A'))}</td></tr>
//       <tr><td><strong>Switches</strong></td><td>${escapeHtml(String(examEnv.switches ?? 'N/A'))}</td></tr>
//       <tr><td><strong>Mobile working</strong></td><td>${examEnv.mobileWorking ? 'Yes' : 'No'}</td></tr>
//       <tr><td><strong>Smartphones</strong></td><td>${examEnv.smartphones ? 'Yes' : 'No'}</td></tr>
//       ${examEnv.notes ? `<tr><td><strong>Notes</strong></td><td>${escapeHtml(examEnv.notes)}</td></tr>` : ''}
//     </table>`;

//   /* ---------- summaries ---------- */
//   const summariesHtml = (Array.isArray(summaries) && summaries.length)
//     ? summaries.map(s => `<div class="summary"><p><strong>${escapeHtml(s.auditor?.firstName || '')} ${escapeHtml(s.auditor?.lastName || '')}</strong></p><p>${escapeHtml(s.text || '')}</p></div>`).join('')
//     : '<p class="justify-text">No summaries provided.</p>';

//   /* ---------- static texts ---------- */
//   const introText = `
//     <p class="justify-text static-text">When we speak about Cyber, Information, and IT Security, it is important to recognize that it is not only a technical matter. Technology plays a key role, but security is always the result of three dimensions working together:</p>
//     <ul style="margin-top:5px;margin-bottom:5px;"><li><strong>Technology</strong> – the tools and systems that protect our data.</li><li><strong>Organization</strong> – the rules, processes, and responsibilities that guide how we work.</li><li><strong>People</strong> – the awareness, behavior, and decisions of everyone involved.</li></ul>
//     <p class="justify-text static-text">Only when these three elements are combined can we create real protection. Focusing on technology alone is not enough. A secure company requires clear structures, well-trained employees, and a culture where security is seen as part of everyday work.</p>
//     <p class="justify-text static-text">In today's ever-changing world, the importance of protecting data and systems continues to grow. New threats appear daily, and digitalization increases the complexity of our business environment. For this reason, <strong>security must be given the right priority</strong>. It should not be treated as an "add-on" or a last step, but as an <strong>integral part of every decision, process, and investment</strong>.</p>
//     <p class="justify-text static-text">This assessment report is designed to make this approach practical and understandable. It gives a transparent overview of your current situation, highlights strengths and weaknesses, and provides clear guidance for next steps. The goal is not only to identify risks but also to enable your organization to <strong>build sustainable protection</strong> so that technology, organization, and people are aligned and your company can continue to operate with confidence and resilience.</p>`;

//   const aboutConsulting = `
//     <p class="justify-text static-text">We at <strong>BKGS Consulting</strong> believe that audits and assessments should strengthen companies rather than slow them down. In a world where compliance requirements, standards, and technologies evolve faster than ever, many companies still rely on rigid tools and outdated methods to evaluate performance, security, and quality. At <strong>BKGS Consulting</strong>, we exist to change that. Our mission is to make assessments and audits simple, smart, and adaptable — transforming them from static checklists into dynamic instruments for growth, trust, and improvement. We believe that every organization, regardless of its size, sector, or country deserves access to modern, intelligent solutions that align with its specific needs, frameworks, and ambitions.</p>
//     <p class="justify-text static-text" style="margin-top:15px;">We combine <strong>technology, methodology,</strong> and <strong>human expertise</strong> to develop flexible, powerful audit and assessment solutions tailored to the individual needs of our clients. Our work combines <strong>32 years of consulting experience</strong> with state-of-the-art software platforms, ensuring that every client benefits from precision, scalability, and adaptability.</p>
//     <p class="justify-text static-text" style="margin-top:15px;">We don’t just deliver tools — we build <strong>solutions that fit your context</strong>. From defining requirements to designing dashboards, from building reporting logic to automating workflows, our team ensures that your assessment system reflects <strong>your goals, standards</strong>, and <strong>operational culture</strong>.</p>
//     <p class="justify-text static-text" style="margin-top:15px;">We envision a future where audits and assessments are not bureaucratic obligations, but <strong>strategic enablers of trust and performance</strong>. A world where organizations of any size can assess themselves <strong>continuously</strong>, adjust in real time, and make decisions with confidence.</p>
//     <h3 class="slogan-local" style="text-align:center;margin-top:20px;font-style:italic;color:#014f65;font-size:16pt;">"Improvement begins with assessment and assessment begins with the right questions"</h3>`;

//   const aboutAudited = `
//     <p class="justify-text static-text">As a prominent player in the <strong>${escapeHtml(company.industry || '')}</strong> industry, <strong>${escapeHtml(companyName)}</strong> has shown a strong commitment to maintaining a secure and reliable operational environment. Our assessment was conducted to evaluate their current information, IT and security posture, providing a detailed overview of their defenses and identifying key areas for continuous improvement. This assessment highlights their dedication to protecting their digital assets and fostering a resilient business infrastructure.</p>
//     <p class="static-text" style="margin-top:5px;"><strong>Contact person:</strong> ${escapeHtml(contactName)} — ${escapeHtml(contactEmail)}</p>
//     ${company.generalInfo || examEnv.generalInfo ? `<p class="justify-text static-text">${escapeHtml(company.generalInfo || examEnv.generalInfo)}</p>` : ''}`;

//   const prefaceText = `
//     <p class="justify-text static-text">The <strong>ISARION (Information Security Assessment Evolution) - Report</strong> has been developed to provide organizations with a structured and independent assessment of their information security posture. The aim is not only to identify technical issues, but to create a holistic view that combines <strong>technology, organization, and people</strong>.</p>
//     <p class="justify-text static-text">This report is designed as a practical tool for decision-makers at all levels. Whether you have a technical background or not, the findings and recommendations are presented in a way that allows you to clearly understand where strengths lie, where risks exist, and what steps can be taken to achieve sustainable improvement.</p>
//     <p class="justify-text static-text">Our mission is to support organizations in treating cybersecurity as an integral part of their business strategy and daily operations—helping to build trust, ensure compliance, and strengthen resilience in an ever-changing digital world.</p>`;

//   const disclaimerText = `
//     <p class="justify-text static-text">This report is based on the information, data, and evidence made available during the assessment process. While every effort has been made to provide accurate and reliable findings, the results and recommendations are limited to the scope of the assessment and the time of its execution.</p>
//     <p class="justify-text static-text">The report should not be considered a guarantee against future risks or incidents. Security threats evolve constantly, and continuous monitoring, improvement, and adaptation remain essential.</p>
//     <p class="justify-text static-text">The assessor and assessing organization do not assume liability for direct or indirect damages that may result from the use of this report. The responsibility for implementing and maintaining effective security measures lies with the assessed organization.</p>`;

//   const cyberResilienceText = `
//     <h3 class="slogan-random" style="font-size:16pt;text-align:center;margin:30px 0 10px;color:#014f65;"><strong>"Cyber resilience as part of your organization’s reputation"</strong></h3>
//     <p class="justify-text static-text">Cyber resilience refers to an entity's ability to continuously deliver the intended outcome, despite cyber-attacks. Resilience to cyber-attacks is essential to IT systems, critical infrastructure, business processes, organizations, societies, and nation-states.</p>
//     <p class="justify-text static-text">Resilience is like juggling lots of balls: it is not enough to optimize individual points. The key to success lies in the ability to think holistically and to orchestrate several strands of action in parallel, from awareness training and technical security to clear crisis management. Resources (budget and people) alone does not lead to success. This is also evident in reality: organizations with the largest IT budgets are not automatically the best protected. The decisive factor is whether security and resilience issues are at the top of the agenda and whether processes, responsibilities and recovery concepts are regularly reviewed, tested and further developed. Cyber resilience is therefore not a project with an end date, but an ongoing management task. As with sustainability, it requires a cultural shift: away from pure compliance thinking and towards genuine risk competence at all levels.</p>
//     <p class="justify-text static-text">The biggest mistake is to believe that you are not affected, or even to rely on getting help in an emergency. Because when cyber-attacks become a reality, only one thing matters: <strong>“how well prepared an organization is”</strong>. Resilience begins in the mind and unfolds its effect where technology, processes and people interact. Those who take the issue seriously not only gain security, but also the trust of customers, partners, employees and ultimately the market. Cyber resilience is not just about keeping systems running. It's about taking responsibility and maintaining trust, especially when it matters — and with this assessment, you have just taken the first step. Congratulations!</p>`;

//   const executiveSummary = `
//     <p class="justify-text static-text">This report provides a comprehensive overview of the Information, IT and cybersecurity posture for <strong>${escapeHtml(companyName)}</strong> based on the "<strong>${escapeHtml(template.name || 'Name of the assessment')}</strong>".</p>
//     <p class="justify-text static-text">The assessment covered key areas including Information Security Policies, Access Control, Physical Security, Mobile & Remote Working, Awareness, Compliance & Legal Requirements and other critical domains as defined in the selected template.</p>
//     <p class="justify-text static-text">Overall, the assessment indicates a compliance score of <strong>${overallScore}%</strong>. Detailed findings and observations are provided in the subsequent sections, along with specific recommendations for improvement.</p>
//     <p class="justify-text static-text">It is crucial to address identified areas of non-compliance and implement recommended remediation actions to strengthen the overall security posture and ensure continuous adherence to best practices.</p>
//     ${cyberResilienceText}`;

//   /* ---------- handover (blank tables) ---------- */
//   const handoverHtml = `
//     <p class="justify-text static-text">This page confirms that the assessment report titled "<strong>${escapeHtml(template.name || 'Name of the assessment')}</strong>" has been formally handed over by the assessor to the assessed company.</p>
//     <p class="justify-text static-text">By signing below, both parties acknowledge the reception of the full assessment report and confirm that it has been delivered in its final version.</p>

//     <div class="handover-section">
//       <h3 class="handover-heading">Consultant:</h3>
//       <table class="handover-table">
//         <tr><td>Name:</td><td><span class="signature-input"></span></td><td>Organization:</td><td><span class="signature-input"></span></td><td>Date:</td><td><span class="signature-input"></span></td></tr>
//         <tr><td colspan="6" class="signature-line-row">Signature: <span class="signature-line"></span></td></tr>
//       </table>
//     </div>

//     <div class="handover-section" style="margin-top:30px;">
//       <h3 class="handover-heading">Consulted Company Representative:</h3>
//       <table class="handover-table">
//         <tr><td>Name:</td><td><span class="signature-input"></span></td><td>Organization:</td><td><span class="signature-input"></span></td><td>Date:</td><td><span class="signature-input"></span></td></tr>
//         <tr><td colspan="6" class="signature-line-row">Signature: <span class="signature-line"></span></td></tr>
//       </table>
//     </div>`;

//   /* ---------- thank-you + dynamic contact ---------- */
//   const thankYouHtml = `
//     <div style="text-align:center;">
//       <h2 style="border-bottom:none;margin-bottom:5px;font-size:26pt;color:#014f65;margin-top:0;font-family:'Lexend',sans-serif;">Thank You</h2>
//       <p style="font-size:16pt;margin-bottom:15px;margin-top:5px;font-weight:bold;line-height:1.5;">for choosing ISARION</p>
//       <p class="justify-text static-text">We are committed to enhancing your organization's security posture and ensuring compliance in an ever-evolving threat landscape. This report serves as a foundational step towards a more resilient and secure future.</p>
//       <p class="justify-text static-text">Our team is dedicated to supporting your journey beyond this assessment. We encourage you to review the findings and recommendations carefully and reach out to us for any clarifications or assistance in implementing the suggested improvements.</p>
//       <p class="static-text" style="margin-top:15px;">For further discussions or to schedule a follow-up consultation, please contact your partner:</p>
//       <div class="contact">
//         <p class="static-text"><strong>${escapeHtml(examinerName)} — <a href="mailto:${escapeHtml(examinerEmail)}" class="no-style-link">${escapeHtml(examinerEmail)}</a></strong></p>
//       </div>
//       <h3 class="slogan-center" style="font-size:14pt;margin-top:20px;"><strong>"Improvement begins with assessment and assessment begins with the right questions"</strong></h3>
//     </div>`;

//   /* =========================================================
//    *  HTML SHELL
//    * ========================================================= */
//   const html = `<!doctype html>
// <html>
// <head>
//   <meta charset="utf-8">
//   <title>Assessment Report - ${escapeHtml(companyName)}</title>
//   <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
//   <style>
//     @page{margin:0.35in; @bottom-center{content:counter(page)"/"counter(pages); font-family:Arial,sans-serif; font-size:10pt; color:#666;}}
//     body{font-family:Arial,sans-serif; font-size:14pt; color:#2c3e50; margin:0; -webkit-print-color-adjust:exact;}
//     .container{padding:0.35in; box-sizing:border-box;}
//     .cover-page{counter-increment:page;} .cover-page::after{display:none;}
//     h2,h3,.cover-title h1,.cover-title h2{font-family:'Lexend',sans-serif !important; color:#014f65;}
//     h2{font-size:26pt !important; text-align:center;} h3{font-size:20pt !important;}
//     .header-spacing{margin:25px 0 16px !important;}
//     .static-text,.justify-text{line-height:1.5 !important;} .justify-text{text-align:justify;}
//     .page-break{page-break-before:always;} .section-page-break{page-break-before:always;}
//     .subsection{page-break-inside:avoid;}
//     .question-block{page-break-inside:avoid; margin-bottom:10px; padding:10px; background:#fafafa; border:1px solid #eee; border-radius:4px;}
//     .question-header{padding-left:10px; border-left:3px solid;}
//     .answer-row,.comment,.recommendation,.evidence{margin:5px 0; font-size:11pt;}
//     .recommendation{background:#f0f8ff; padding:8px; border-left:4px solid #014f65;}
//     .comment{background:#e6f7f6; padding:8px; border-left:4px solid #014f65;}
//     .evidence{background:#fff8e6; padding:8px; border-left:4px solid #014f65;}
//     .cover{height:9.3in; display:flex; flex-direction:column; justify-content:space-between; text-align:center; padding:20px 0;}
//     .logo{max-width:350px;}
//     .cover-quote{margin-top:30px; font-size:15pt; max-width:700px; margin-left:auto; margin-right:auto;}
//     .slogan-center{font-size:14pt; margin-top:20px; font-style:italic; color:#014f65; text-align:center;}
//     .slogan-local{text-align:center; font-style:italic; color:#014f65; margin-top:20px; font-size:16pt;}
//     .no-style-link{color:#000 !important; text-decoration:none !important;}

//     /* --- TOC (original) --- */
//     .toc-root{counter-reset:section; padding-left:0; margin-top:8px; font-size:14pt;}
//     .toc-root>li{counter-increment:section; margin-top:4px; list-style:none;}
//     .toc-root>li:before{content:counter(section) ". "; font-weight:bold;}
//     .toc-root>li ul{list-style:none; padding-left:30px; margin-top:2px; counter-reset:subsection;}
//     .toc-root>li li{counter-increment:subsection; margin-top:2px;}
//     .toc-root>li li:before{content:counter(section)"."counter(subsection)". "; font-weight:normal;}
//     .toc-root a{text-decoration:none; color:#003340;}

//     /* --- handover table (blank) --- */
//     .handover-heading{margin-bottom:5px; font-size:14pt; color:#014f65; text-align:left; font-weight:bold; font-family:Arial,sans-serif !important;}
//     .handover-table{width:100%; margin-top:5px; border-collapse:collapse; font-size:12pt;}
//     .handover-table td{padding:2px 0; vertical-align:top; width:16%; line-height:1.8;}
//     .handover-table td:nth-child(2),.handover-table td:nth-child(4),.handover-table td:nth-child(6){padding-left:5px;}
//     .signature-input{display:inline-block; border-bottom:1px solid #000; width:85%; height:1em;}
//     .signature-line-row{padding-top:15px !important;}
//     .signature-line{display:inline-block; border-bottom:1px solid #000; width:250px; height:1em; margin-left:5px;}
//     .handover-section{margin-bottom:25px;}

//     /* --- env table --- */
//     .env{width:100%; border-collapse:collapse; margin:8px 0 15px 0; table-layout:fixed;}
//     .env td{padding:5px 8px; border:1px solid #e6e6e6; font-size:12pt;}
//     .env td:first-child{width:30%; font-weight:bold; background:#f5f5f5;}
//   </style>
// </head>
// <body>
//   <!-- ===========================  COVER  =========================== -->
//   <div class="container cover-page">
//     <div class="cover">
//       <div>
//         <img class="logo" src="${LOGO_URL}" alt="Logo" />
//         <div class="cover-title">
//           <h1>${escapeHtml(template.name || 'Name of the assessment')}</h1>
//           <h2>REPORT</h2>
//         </div>
//         <div class="meta" style="margin:20px 0; font-size:16pt;">
//           <p><strong>Report Date:</strong> ${escapeHtml(reportDate)}</p>
//           <p><strong>Examination’s date:</strong> ${escapeHtml(examinationDateRange)}</p>
//           <p><strong>Examiner:</strong> Recks Binda</p>
//           <p><strong>E-Mail:</strong> <a href="mailto:bindaramsey@gmail.com" class="no-style-link">bindaramsey@gmail.com</a></p>
//         </div>
//       </div>
//       <div>
//         <div style="font-size:16pt;">
//           <p><strong>FOR</strong></p>
//           <p><strong>${escapeHtml(companyName)}</strong></p>
//           <p>${escapeHtml(contactName)} — ${escapeHtml(contactEmail)}</p>
//         </div>
//         <div class="cover-quote">
//           <p class="static-text"><strong>The strength of your defense lies in knowing and understanding your vulnerabilities. This assessment provides you with the information you need to create a secure environment in your company.</strong></p>
//           <p class="static-text"><em><strong>"You can only protect what you know."</strong></em></p>
//         </div>
//       </div>
//     </div>
//   </div>

//   <!-- ===========================  TOC  =========================== -->
//   <div class="container page-break"><h2 class="header-spacing">Table of Contents</h2>${tocHtml}</div>

//   <!-- ===========================  INTRO  =========================== -->
//   <div class="container page-break"><h2 class="header-spacing">Introduction</h2>${introText}</div>

//   <!-- ===========================  ABOUT CONSULTING  =========================== -->
//   <div class="container page-break">
//     <h2 class="header-spacing">About BKGS Consulting </h2>
//     ${aboutConsulting}
//   </div>

//   <!-- ===========================  ABOUT AUDITED  =========================== -->
//   <div class="container page-break">
//     <h2 class="header-spacing">About the Examined Company</h2>
//     ${aboutAudited}
//   </div>

//   <!-- ===========================  PREFACE / DISCLAIMER  =========================== -->
//   <div class="container page-break">
//     <h2 class="header-spacing">Preface</h2>${prefaceText}
//     <h2 class="header-spacing" style="margin-top:25px;">Disclaimer</h2>${disclaimerText}
//   </div>

//   <!-- ===========================  EXECUTIVE SUMMARY  =========================== -->
//   <div class="container page-break">
//     <h2 class="header-spacing">Executive Summary</h2>
//     ${executiveSummary}
//     ${summaries.length ? `<h2 class="header-spacing" style="margin-top:25px;">Auditor Summary</h2>${summariesHtml}` : ''}
//   </div>

//   <!-- ===========================  EXAMINATION ENVIRONMENT  =========================== -->
//   <div class="container page-break"><h2 class="header-spacing">Examination Environment</h2>${envHtml}</div>

//   <!-- ===========================  FINDINGS  =========================== -->
//   <div class="container page-break"><h2 class="header-spacing">Assessment Findings</h2>${mainHtml}</div>

//   <!-- ===========================  HANDOVER  =========================== -->
//   <div class="container page-break"><h2 class="header-spacing">Handover</h2>${handoverHtml}</div>

//   <!-- ===========================  THANK YOU  =========================== -->
//   <div class="container page-break">${thankYouHtml}</div>

// </body>
// </html>`;

//   console.log('[generateReportHtml] finished.');
//   return html;
// };

// export default generateReportHtml;





//============================================================TRANSLATED REPORT=========================//

//____________________________________________________________
//  1.  HAND-WRITTEN TRILINGUAL MINI-DICTIONARY
//____________________________________________________________
const DICT = {
  // ---- cover ------------------------------------------------
  REPORT_TITLE:     { EN: 'REPORT',                       FR: 'RAPPORT',                       DE: 'BERICHT' },
  REPORT_DATE:      { EN: 'Report Date:',                 FR: 'Date du rapport :',             DE: 'Berichtsdatum:' },
  EXAM_DATE:        { EN: "Examination's date:",          FR: "Date de l'examen :",            DE: 'Prüfungsdatum:' },
  EXAMINER:         { EN: 'Examiner:',                    FR: 'Examinateur :',                 DE: 'Prüfer:' },
  EMAIL:            { EN: 'E-Mail:',                      FR: 'E-Mail :',                      DE: 'E-Mail:' },
  FOR:              { EN: 'FOR',                          FR: 'POUR',                          DE: 'FÜR' },

  COVER_QUOTE_1: {
    EN: 'The strength of your defense lies in knowing and understanding your vulnerabilities. This assessment provides you with the information you need to create a secure environment in your company.',
    FR: 'La force de votre défense réside dans la connaissance et la compréhension de vos vulnérabilités. Cette évaluation vous fournit les informations nécessaires pour créer un environnement sécurisé dans votre entreprise.',
    DE: 'Die Stärke Ihrer Verteidigung liegt im Kennen und Verstehen Ihrer Schwachstellen. Diese Bewertung liefert Ihnen die Informationen, die Sie benötigen, um eine sichere Umgebung in Ihrem Unternehmen zu schaffen.'
  },
  COVER_QUOTE_2: { EN: '“You can only protect what you know.”',  FR: '« Vous ne pouvez protéger que ce que vous connaissez. »',  DE: '„Sie können nur schützen, was Sie kennen.“' },

  // ---- TOC ---------------------------------------------------
  TOC:              { EN: 'Table of Contents',            FR: 'Table des matières',            DE: 'Inhaltsverzeichnis' },

  // ---- intro / static sections ------------------------------
  INTRO:            { EN: 'Introduction',                 FR: 'Introduction',                  DE: 'Einleitung' },
  ABOUT_CONSULTING: { EN: 'About BKGS Consulting',        FR: 'À propos de BKGS Consulting',   DE: 'Über BKGS Consulting' },
  ABOUT_AUDITED:    { EN: 'About the Examined Company',   FR: 'À propos de la société examinée', DE: 'Über das geprüfte Unternehmen' },
  PREFACE:          { EN: 'Preface',                      FR: 'Préface',                       DE: 'Vorwort' },
  DISCLAIMER:       { EN: 'Disclaimer',                   FR: 'Avertissement',                 DE: 'Haftungsausschluss' },
  EXEC_SUMMARY:     { EN: 'Executive Summary',            FR: 'Résumé exécutif',               DE: 'Executive Summary' },
  AUDITOR_SUMMARY:  { EN: 'Auditor Summary',              FR: 'Résumé de l’auditeur',          DE: 'Zusammenfassung des Prüfers' },
  EXAM_ENV:         { EN: 'Examination Environment',      FR: "Environnement d'examen",        DE: 'Prüfungsumgebung' },
  FINDINGS:         { EN: 'Assessment Findings',          FR: 'Constats de lévaluation',       DE: 'Bewertungsbefunde' },
  HANDOVER:         { EN: 'Handover',                     FR: 'Remise',                        DE: 'Übergabe' },
  THANK_YOU:        { EN: 'Thank You',                    FR: 'Merci',                         DE: 'Vielen Dank' },

  // ---- intro texts ------------------------------------------
  INTRO_TEXT: {
    EN: `When we speak about Cyber, Information, and IT Security, it is important to recognize that it is not only a technical matter. Technology plays a key role, but security is always the result of three dimensions working together:<ul><li><strong>Technology</strong> – the tools and systems that protect our data.</li><li><strong>Organization</strong> – the rules, processes, and responsibilities that guide how we work.</li><li><strong>People</strong> – the awareness, behavior, and decisions of everyone involved.</li></ul>Only when these three elements are combined can we create real protection. Focusing on technology alone is not enough. A secure company requires clear structures, well-trained employees, and a culture where security is seen as part of everyday work.<p>In today's ever-changing world, the importance of protecting data and systems continues to grow. New threats appear daily, and digitalization increases the complexity of our business environment. For this reason, <strong>security must be given the right priority</strong>. It should not be treated as an "add-on" or a last step, but as an <strong>integral part of every decision, process, and investment</strong>.</p><p>This assessment report is designed to make this approach practical and understandable. It gives a transparent overview of your current situation, highlights strengths and weaknesses, and provides clear guidance for next steps. The goal is not only to identify risks but also to enable your organization to <strong>build sustainable protection</strong> so that technology, organization, and people are aligned and your company can continue to operate with confidence and resilience.</p>`,
    FR: `Lorsque nous parlons de cybersécurité, de sécurité de l'information et de sécurité IT, il est important de reconnaître que ce n'est pas uniquement une question technique. La technologie joue un rôle clé, mais la sécurité est toujours le résultat de trois dimensions qui travaillent ensemble :<ul><li><strong>Technologie</strong> – les outils et systèmes qui protègent nos données.</li><li><strong>Organisation</strong> – les règles, processus et responsabilités qui guident notre travail.</li><li><strong>Personnes</strong> – la sensibilisation, le comportement et les décisions de chacun.</li></ul>Seule la combinaison de ces trois éléments permet de créer une protection réelle. Se concentrer uniquement sur la technologie ne suffit pas. Une entreprise sécurisée nécessite des structures claires, des employés bien formés et une culture où la sécurité fait partie du quotidien.<p>Dans un monde en constante évolution, l'importance de protéger les données et les systèmes ne cesse de croître. De nouvelles menaces apparaissent chaque jour et la digitalisation augmente la complexité de notre environnement commercial. C'est pourquoi <strong>la sécurité doit être la bonne priorité</strong>. Elle ne doit pas être traitée comme un « extra » ou une dernière étape, mais comme une <strong>partie intégrante de chaque décision, processus et investissement</strong>.</p><p>Ce rapport d'évaluation est conçu pour rendre cette approche pratique et compréhensible. Il donne une vue transparente de votre situation actuelle, met en évidence les forces et les faiblesses, et fournit des orientations claires pour les prochaines étapes. Le but n'est pas seulement d'identifier les risques, mais aussi de permettre à votre organisation de <strong>construire une protection durable</strong> afin que la technologie, l'organisation et les personnes soient alignées et que votre entreprise puisse continuer à opérer avec confiance et résilience.</p>`,
    DE: `Wenn wir über Cyber-, Informations- und IT-Sicherheit sprechen, ist es wichtig zu erkennen, dass es sich nicht nur um eine technische Angelegenheit handelt. Die Technologie spielt eine Schlüsselrolle, aber Sicherheit ist immer das Ergebnis von drei Dimensionen, die zusammenarbeiten:<ul><li><strong>Technologie</strong> – die Werkzeuge und Systeme, die unsere Daten schützen.</li><li><strong>Organisation</strong> – die Regeln, Prozesse und Verantwortlichkeiten, die unser Handeln leiten.</li><li><strong>Menschen</strong> – das Bewusstsein, das Verhalten und die Entscheidungen aller Beteiligten.</li></ul>Nur wenn diese drei Elemente kombiniert werden, können wir realen Schutz schaffen. Sich allein auf die Technologie zu konzentrieren reicht nicht aus. Ein sicheres Unternehmen benötigt klare Strukturen, gut ausgebildete Mitarbeiter und eine Kultur, in der Sicherheit zum Alltag gehört.<p>In einer sich ständig verändernden Welt wächst die Bedeutung des Schutzes von Daten und Systemen kontinuierlich. Neue Bedrohungen tauchen täglich auf und die Digitalisierung erhöht die Komplexität unserer Geschäftsumgebung. Aus diesem Grund muss <strong>Sicherheit die richtige Priorität erhalten</strong>. Sie sollte nicht als „Nice-to-have“ oder letzter Schritt behandelt werden, sondern als <strong>integralen Bestandteil jeder Entscheidung, jedes Prozesses und jeder Investition</strong>.</p><p>Dieses Bewertungsreport ist darauf ausgelegt, diesen Ansatz praktikabel und verständlich zu machen. Es gibt einen transparenten Überblick über Ihre aktuelle Situation, hebt Stärken und Schwächen hervor und liefert klare Handlungsanweisungen für die nächsten Schritte. Das Ziel ist es nicht nur, Risiken zu identifizieren, sondern auch Ihre Organisation zu befähigen, <strong>nachhaltigen Schutz aufzubauen</strong>, damit Technologie, Organisation und Menschen aufeinander abgestimmt sind und Ihr Unternehmen weiterhin mit Vertrauen und Resilienz operieren kann.</p>`
  },

  // ---- about BKGS -------------------------------------------
  ABOUT_CONSULTING_TEXT: {
    EN: `<p>We at <strong>BKGS Consulting</strong> believe that audits and assessments should strengthen companies rather than slow them down. In a world where compliance requirements, standards, and technologies evolve faster than ever, many companies still rely on rigid tools and outdated methods to evaluate performance, security, and quality. At <strong>BKGS Consulting</strong>, we exist to change that. Our mission is to make assessments and audits simple, smart, and adaptable — transforming them from static checklists into dynamic instruments for growth, trust, and improvement. We believe that every organization, regardless of its size, sector, or country deserves access to modern, intelligent solutions that align with its specific needs, frameworks, and ambitions.</p><p>We combine <strong>technology, methodology,</strong> and <strong>human expertise</strong> to develop flexible, powerful audit and assessment solutions tailored to the individual needs of our clients. Our work combines <strong>32 years of consulting experience</strong> with state-of-the-art software platforms, ensuring that every client benefits from precision, scalability, and adaptability.</p><p>We don’t just deliver tools — we build <strong>solutions that fit your context</strong>. From defining requirements to designing dashboards, from building reporting logic to automating workflows, our team ensures that your assessment system reflects <strong>your goals, standards</strong>, and <strong>operational culture</strong>.</p><p>We envision a future where audits and assessments are not bureaucratic obligations, but <strong>strategic enablers of trust and performance</strong>. A world where organizations of any size can assess themselves <strong>continuously</strong>, adjust in real time, and make decisions with confidence.</p><h3 class="slogan-local">"Improvement begins with assessment and assessment begins with the right questions"</h3>`,
    FR: `<p>Nous chez <strong>BKGS Consulting</strong> croyons que les audits et évaluations devraient renforcer les entreprises plutôt que de les ralentir. Dans un monde où les exigences de conformité, les normes et les technologies évoluent plus rapidement que jamais, de nombreuses entreprises s'appuient encore sur des outils rigides et des méthodes dépassées pour évaluer la performance, la sécurité et la qualité. Chez <strong>BKGS Consulting</strong>, nous existons pour changer cela. Notre mission est de rendre les évaluations et audits simples, intelligents et adaptables — les transformant de listes de contrôle statiques en instruments dynamiques de croissance, de confiance et d'amélioration. Nous pensons que chaque organisation, quelle que soit sa taille, son secteur ou son pays, mérite d’accéder à des solutions modernes et intelligentes alignées sur ses besoins, cadres et ambitions spécifiques.</p><p>Nous combinons <strong>technologie, méthodologie</strong> et <strong>expertise humaine</strong> pour développer des solutions d’audit et d’évaluation flexibles et puissantes, adaptées aux besoins individuels de nos clients. Notre travail allie <strong>32 ans d’expérience en conseil</strong> à des plateformes logicielles de pointe, garantissant à chaque client précision, évolutivité et adaptabilité.</p><p>Nous ne livrons pas seulement des outils — nous construisons <strong>des solutions qui s’adaptent à votre contexte</strong>. De la définition des exigences à la conception de tableaux de bord, de la création de logiques de reporting à l’automatisation des workflows, notre équipe veille à ce que votre système d’évaluation reflète <strong>vos objectifs, normes</strong> et <strong>culture opérationnelle</strong>.</p><p>Nous envisageons un avenir où les audits et évaluations ne sont pas des obligations bureaucratiques, mais <strong>des leviers stratégiques de confiance et de performance</strong>. Un monde où les organisations de toute taille peuvent s’évaluer <strong>en continu</strong>, ajuster en temps réel et prendre des décisions en toute confiance.</p><h3 class="slogan-local">« L’amélioration commence par l’évaluation et l’évaluation commence par les bonnes questions »</h3>`,
    DE: `<p>Wir bei <strong>BKGS Consulting</strong> glauben, dass Audits und Bewertungen Unternehmen stärken sollten, anstatt sie zu verlangsamen. In einer Welt, in der Compliance-Anforderungen, Standards und Technologien schneller denn je evolveieren, verlassen sich viele Unternehmen noch immer auf starrer Tools und veraltete Methoden, um Leistung, Sicherheit und Qualität zu bewerten. Bei <strong>BKGS Consulting</strong> existieren wir, um das zu ändern. Unsere Mission ist es, Bewertungen und Audits einfach, smart und anpassbar zu machen — sie von statischen Checklisten in dynamische Instrumente für Wachstum, Vertrauen und Verbesserung zu verwandeln. Wir glauben, dass jede Organisation – unabhängig von Größe, Sektor oder Land – Zugang zu modernen, intelligenten Lösungen verdient, die auf ihre spezifischen Bedürfnisse, Rahmen und Ambitionen zugeschnitten sind.</p><p>Wir kombinieren <strong>Technologie, Methodik</strong> und <strong>menschliche Expertise</strong>, um flexible und leistungsfähige Audit- und Bewertungslösungen zu entwickeln, die auf die individuellen Bedürfnisse unserer Kunden zugeschnitten sind. Unsere Arbeit verbindet <strong>32 Jahre Beratungserfahrung</strong> mit modernsten Softwareplattformen und stellt sicher, dass jeder Kunde von Präzision, Skalierbarkeit und Anpassungsfähigkeit profitiert.</p><p>Wir liefern nicht nur Tools – wir bauen <strong>Lösungen, die in Ihren Kontext passen</strong>. Von der Definition der Anforderungen über das Design von Dashboards bis zur Erstellung von Reporting-Logik und der Automatisierung von Workflows – unser Team stellt sicher, dass Ihr Bewertungssystem <strong>Ihre Ziele, Standards</strong> und <strong>Betriebskultur</strong> widerspiegelt.</p><p>Wir visionieren eine Zukunft, in der Audits und Bewertungen keine bürokratischen Pflichten sind, sondern <strong>strategische Hebel für Vertrauen und Leistung</strong>. Eine Welt, in der Organisationen jeder Größe sich <strong>kontinuierlich</strong> bewerten, in Echtzeit anpassen und mit Zuversicht Entscheidungen treffen können.</p><h3 class="slogan-local">„Verbesserung beginnt mit Bewertung und Bewertung beginnt mit den richtigen Fragen“</h3>`
  },

  // ---- about audited company --------------------------------
  ABOUT_AUDITED_TEXT: (companyName, industry, contactName, contactEmail, general) => `
    <p>As a prominent player in the <strong>${escapeHtml(industry || '')}</strong> industry, <strong>${escapeHtml(companyName)}</strong> has shown a strong commitment to maintaining a secure and reliable operational environment. Our assessment was conducted to evaluate their current information, IT and security posture, providing a detailed overview of their defenses and identifying key areas for continuous improvement. This assessment highlights their dedication to protecting their digital assets and fostering a resilient business infrastructure.</p>
    <p style="margin-top:5px;"><strong>Contact person:</strong> ${escapeHtml(contactName)} — ${escapeHtml(contactEmail)}</p>
    ${general ? `<p class="justify-text">${escapeHtml(general)}</p>` : ''}`,

  // ---- preface / disclaimer ---------------------------------
  PREFACE_TEXT: {
    EN: `<p>The <strong>ISARION (Information Security Assessment Evolution) - Report</strong> has been developed to provide organizations with a structured and independent assessment of their information security posture. The aim is not only to identify technical issues, but to create a holistic view that combines <strong>technology, organization, and people</strong>.</p><p>This report is designed as a practical tool for decision-makers at all levels. Whether you have a technical background or not, the findings and recommendations are presented in a way that allows you to clearly understand where strengths lie, where risks exist, and what steps can be taken to achieve sustainable improvement.</p><p>Our mission is to support organizations in treating cybersecurity as an integral part of their business strategy and daily operations—helping to build trust, ensure compliance, and strengthen resilience in an ever-changing digital world.</p>`,
    FR: `<p>Le <strong>rapport ISARION (Information Security Assessment Evolution)</strong> a été développé pour fournir aux organisations une évaluation structurée et indépendante de leur posture de sécurité de l'information. L'objectif n'est pas seulement d'identifier les problèmes techniques, mais de créer une vue d'ensemble qui combine <strong>technologie, organisation et personnes</strong>.</p><p>Ce rapport est conçu comme un outil pratique pour les décideurs de tous niveaux. Que vous ayez ou non un background technique, les constats et recommandations sont présentés de manière à vous permettre de comprendre clairement où se situent les forces, où existent les risques et quelles mesures peuvent être prises pour atteindre une amélioration durable.</p><p>Notre mission est de soutenir les organisations pour qu'elles traitent la cybersécurité comme une partie intégrante de leur stratégie d'affaires et de leurs opérations quotidiennes – afin de construire la confiance, garantir la conformité et renforcer la résilience dans un monde numérique en constante évolution.</p>`,
    DE: `<p>Der <strong>ISARION (Information Security Assessment Evolution) - Bericht</strong> wurde entwickelt, um Organisationen eine strukturierte und unabhängige Bewertung ihrer Informationssicherheitsposition zu bieten. Ziel ist es nicht nur, technische Probleme zu identifizieren, sondern eine ganzheitliche Sicht zu schaffen, die <strong>Technologie, Organisation und Menschen</strong> kombiniert.</p><p>Dieser Bericht ist als praktisches Werkzeug für Entscheidungsträger aller Ebenen konzipiert. Ob Sie nun technisches Fachwissen mitbringen oder nicht – die Feststellungen und Empfehlungen werden so dargestellt, dass Sie klar verstehen, wo Stärken liegen, wo Risiken bestehen und welche Schritte unternommen werden können, um nachhaltige Verbesserungen zu erzielen.</p><p>Unsere Mission ist es, Organisationen dabei zu unterstützen, Cybersicherheit als integralen Bestandteil ihrer Geschäftsstrategie und ihres täglichen Betriebs zu behandeln – um Vertrauen aufzubauen, Compliance sicherzustellen und Resilienz in einer sich ständig verändernden digitalen Welt zu stärken.</p>`
  },

  DISCLAIMER_TEXT: {
    EN: `<p>This report is based on the information, data, and evidence made available during the assessment process. While every effort has been made to provide accurate and reliable findings, the results and recommendations are limited to the scope of the assessment and the time of its execution.</p><p>The report should not be considered a guarantee against future risks or incidents. Security threats evolve constantly, and continuous monitoring, improvement, and adaptation remain essential.</p><p>The assessor and assessing organization do not assume liability for direct or indirect damages that may result from the use of this report. The responsibility for implementing and maintaining effective security measures lies with the assessed organization.</p>`,
    FR: `<p>Ce rapport est basé sur les informations, données et preuves rendues disponibles pendant le processus d’évaluation. Bien que tous les efforts aient été faits pour fournir des résultats exacts et fiables, les constats et recommandations sont limités au périmètre de l’évaluation et à la date de son exécution.</p><p>Le rapport ne doit pas être considéré comme une garantie contre les risques ou incidents futurs. Les menaces de sécurité évoluent constamment, et une surveillance, amélioration et adaptation continues restent essentielles.</p><p>L’évaluateur et l’organisation d’évaluation n’assument aucune responsabilité pour les dommages directs ou indirects pouvant résulter de l’utilisation de ce rapport. La responsabilité de mettre en œuvre et de maintenir des mesures de sécurité efficaces incombe à l’organisation évaluée.</p>`,
    DE: `<p>Dieser Bericht basiert auf den während des Bewertungsprozesses verfügbaren Informationen, Daten und Beweisen. Obwohl alle Anstrengungen unternommen wurden, genaue und zuverlässige Ergebnisse zu liefern, sind die Feststellungen und Empfehlungen auf den Umfang der Bewertung und den Zeitpunkt ihrer Durchführung begrenzt.</p><p>Der Bericht sollte nicht als Garantie gegen zukünftige Risiken oder Vorfälle betrachtet werden. Sicherheitsbedrohungen entwickeln sich ständig weiter, und kontinuierliche Überwachung, Verbesserung und Anpassung bleiben unerlässlich.</p><p>Der Prüfer und die prüfende Organisation übernehmen keine Haftung für direkte oder indirekte Schäden, die durch die Nutzung dieses Berichts entstehen können. Die Verantwortung für die Umsetzung und Aufrechterhaltung wirksamer Sicherheitsmaßnahmen liegt bei der geprüften Organisation.</p>`
  },

  // ---- executive summary ------------------------------------
  EXEC_SUMMARY_TEXT: (companyName, templateName, overallScore) => `
    <p>This report provides a comprehensive overview of the Information, IT and cybersecurity posture for <strong>${escapeHtml(companyName)}</strong> based on the "<strong>${escapeHtml(templateName)}</strong>".</p>
    <p>The assessment covered key areas including Information Security Policies, Access Control, Physical Security, Mobile & Remote Working, Awareness, Compliance & Legal Requirements and other critical domains as defined in the selected template.</p>
    <p>Overall, the assessment indicates a compliance score of <strong>${overallScore}%</strong>. Detailed findings and observations are provided in the subsequent sections, along with specific recommendations for improvement.</p>
    <p>It is crucial to address identified areas of non-compliance and implement recommended remediation actions to strengthen the overall security posture and ensure continuous adherence to best practices.</p>`,

  // ---- env table labels -------------------------------------
  LOCATIONS:        { EN: 'Locations',                    FR: 'Sites',                         DE: 'Standorte' },
  EMPLOYEES:        { EN: 'Number of employees',          FR: "Nombre d'employés",            DE: 'Anzahl Mitarbeiter' },
  CLIENTS_TOTAL:    { EN: 'Clients (total)',              FR: 'Clients (total)',               DE: 'Kunden (gesamt)' },
  CLIENTS_MAN:      { EN: 'Clients (managed)',            FR: 'Clients (gérés)',               DE: 'Kunden (verwaltet)' },
  CLIENTS_UNMAN:    { EN: 'Clients (unmanaged)',          FR: 'Clients (non gérés)',           DE: 'Kunden (unverwaltet)' },
  INDUSTRY:         { EN: 'Industry',                     FR: 'Industrie',                     DE: 'Branche' },
  PHY_SERVERS:      { EN: 'Physical servers',             FR: 'Serveurs physiques',            DE: 'Physische Server' },
  VM_SERVERS:       { EN: 'VM servers',                   FR: 'Serveurs VM',                   DE: 'VM-Server' },
  FIREWALLS:        { EN: 'Firewalls',                    FR: 'Pare-feux',                     DE: 'Firewalls' },
  SWITCHES:         { EN: 'Switches',                     FR: 'Switchs',                       DE: 'Switches' },
  MOBILE_WORKING:   { EN: 'Mobile working',               FR: 'Travail mobile',                DE: 'Mobiles Arbeiten' },
  SMARTPHONES:      { EN: 'Smartphones',                  FR: 'Smartphones',                   DE: 'Smartphones' },
  NOTES:            { EN: 'Notes',                        FR: 'Remarques',                     DE: 'Notizen' },

  // ---- question block labels --------------------------------
  ANSWER:           { EN: 'Answer',                       FR: 'Réponse',                       DE: 'Antwort' },
  COMMENT:          { EN: 'Comment',                      FR: 'Commentaire',                   DE: 'Kommentar' },
  RECOMMENDATION:   { EN: 'Recommendation',               FR: 'Recommandation',                DE: 'Empfehlung' },
  EVIDENCE:         { EN: 'Evidence',                     FR: 'Preuve',                        DE: 'Beweis' },
  NO_RESPONSE:      { EN: 'No response provided',         FR: 'Aucune réponse fournie',        DE: 'Keine Antwort gegeben' },

  // ---- handover table headers -------------------------------
  CONSULTANT:       { EN: 'Consultant',                   FR: 'Consultant',                    DE: 'Berater' },
  CONSULTED_REP:    { EN: 'Consulted Company Representative', FR: 'Représentant de la société consultée', DE: 'Vertreter des beratenen Unternehmens' },
  NAME:             { EN: 'Name',                         FR: 'Nom',                           DE: 'Name' },
  ORGANIZATION:     { EN: 'Organization',                 FR: 'Organisation',                  DE: 'Organisation' },
  DATE:             { EN: 'Date',                         FR: 'Date',                          DE: 'Datum' },
  SIGNATURE:        { EN: 'Signature',                    FR: 'Signature',                     DE: 'Unterschrift' },

  // ---- thank-you / final slogan -----------------------------
  THANK_YOU_TITLE:  { EN: 'Thank You',                    FR: 'Merci',                         DE: 'Vielen Dank' },
  THANK_YOU_FOR:    { EN: 'for choosing ISARION',         FR: "d'avoir choisi ISARION",        DE: 'dass Sie ISARION gewählt haben' },
  THANK_YOU_TEXT: {
    EN: 'We are committed to enhancing your organization\'s security posture and ensuring compliance in an ever-evolving threat landscape. This report serves as a foundational step towards a more resilient and secure future.',
    FR: 'Nous nous engageons à renforcer la posture de sécurité de votre organisation et à garantir la conformité dans un paysage des menaces en constante évolution. Ce rapport constitue une étape fondamentale vers un avenir plus résilient et plus sûr.',
    DE: 'Wir sind verpflichtet, die Sicherheitsposition Ihrer Organisation zu verbessern und Compliance in einer sich ständig weiterentwickelnden Bedrohungslandschaft sicherzustellen. Dieser Bericht dient als Grundstein für eine widerstandsfähigere und sicherere Zukunft.'
  },
  THANK_YOU_CONTACT: { EN: 'For further discussions or to schedule a follow-up consultation, please contact your partner:', FR: 'Pour des discussions supplémentaires ou pour planifier une consultation de suivi, veuillez contacter votre partenaire :', DE: 'Für weitere Diskussionen oder um eine Nachfolgeberatung zu vereinbaren, wenden Sie sich bitte an Ihren Partner:' },
  THANK_SLOGAN:      { EN: '"Improvement begins with assessment and assessment begins with the right questions"', FR: '« L’amélioration commence par l’évaluation et l’évaluation commence par les bonnes questions »', DE: '„Verbesserung beginnt mit Bewertung und Bewertung beginnt mit den richtigen Fragen“' },

  // ---- cyber resilience box ---------------------------------
  CYBER_RESILIENCE: {
    EN: `<h3 class="slogan-random">"Cyber resilience as part of your organization’s reputation"</h3><p>Cyber resilience refers to an entity's ability to continuously deliver the intended outcome, despite cyber-attacks. Resilience to cyber-attacks is essential to IT systems, critical infrastructure, business processes, organizations, societies, and nation-states.</p><p>Resilience is like juggling lots of balls: it is not enough to optimize individual points. The key to success lies in the ability to think holistically and to orchestrate several strands of action in parallel, from awareness training and technical security to clear crisis management. Resources (budget and people) alone does not lead to success. This is also evident in reality: organizations with the largest IT budgets are not automatically the best protected. The decisive factor is whether security and resilience issues are at the top of the agenda and whether processes, responsibilities and recovery concepts are regularly reviewed, tested and further developed. Cyber resilience is therefore not a project with an end date, but an ongoing management task. As with sustainability, it requires a cultural shift: away from pure compliance thinking and towards genuine risk competence at all levels.</p><p>The biggest mistake is to believe that you are not affected, or even to rely on getting help in an emergency. Because when cyber-attacks become a reality, only one thing matters: <strong>“how well prepared an organization is”</strong>. Resilience begins in the mind and unfolds its effect where technology, processes and people interact. Those who take the issue seriously not only gain security, but also the trust of customers, partners, employees and ultimately the market. Cyber resilience is not just about keeping systems running. It's about taking responsibility and maintaining trust, especially when it matters — and with this assessment, you have just taken the first step. Congratulations!</p>`,
    FR: `<h3 class="slogan-random">« La cyber-résilience comme partie de la réputation de votre organisation »</h3><p>La cyber-résilience fait référence à la capacité d'une entité à fournir en continu le résultat escompté, malgré des cyber-attaques. La résilience aux cyber-attaques est essentielle pour les systèmes IT, les infrastructures critiques, les processus métier, les organisations, les sociétés et les États-nations.</p><p>La résilience, c’est comme jongler avec de nombreuses balles : il ne suffit pas d’optimiser des points isolés. La clé du succès réside dans la capacité de penser de manière globale et d’orchestrer plusieurs volets d’action en parallèle, de la sensibilisation et de la sécurité technique à une gestion de crise claire. Les ressources seules (budget et personnes) ne garantissent pas le succès. Cela est également évident dans la réalité : les organisations avec les plus gros budgets IT ne sont pas automatiquement les mieux protégées. Le facteur décisif est de savoir si la sécurité et la résilience figurent en haut de l’agenda et si processus, responsabilités et concepts de récupération sont régulièrement revus, testés et développés. La cyber-résilience n’est donc pas un projet avec une date de fin, mais une tâche de gestion continue. Comme pour la durabilité, elle exige un changement culturel : passer d’une pensée de conformité pure à une véritable compétence en matière de risque à tous les niveaux.</p><p>La plus grosse erreur est de croire que l’on n’est pas concerné, ou même de compter sur une aide en cas d’urgence. Parce que lorsque les cyber-attaques deviennent réalité, une seule chose compte : <strong>« la préparation de l’organisation »</strong>. La résilience commence dans l’esprit et déploie son effet là où technologie, processus et personnes interagissent. Ceux qui prennent le sujet au sérieux gagnent non seulement en sécurité, mais aussi la confiance des clients, partenaires, employés et finalement du marché. La cyber-résilience ne consiste pas seulement à maintenir les systèmes en marche. Il s’agit d’assumer ses responsabilités et de maintenir la confiance, surtout quand cela compte — et avec cette évaluation, vous venez de faire le premier pas. Félicitations !</p>`,
    DE: `<h3 class="slogan-random">„Cyber-Resilienz als Teil des Rufs Ihrer Organisation“</h3><p>Cyber-Resilienz bezeichnet die Fähigkeit einer Einheit, die gewünschten Ergebnisse auch bei Cyber-Angriffen kontinuierlich zu liefern. Resilienz gegenüber Cyber-Angriffen ist für IT-Systeme, kritische Infrastrukturen, Geschäftsprozesse, Organisationen, Gesellschaften und Nationalstaaten von wesentlicher Bedeutung.</p><p>Resilienz ist wie Jonglieren mit vielen Bällen: Es reicht nicht aus, einzelne Punkte zu optimieren. Der Schlüssel zum Erfolg liegt in der Fähigkeit, ganzheitlich zu denken und mehrere Handlungsstränge parallel zu orchestrieren – von Awareness-Schulungen und technischer Sicherheit bis hin zu klarem Krisenmanagement. Ressourcen (Budget und Menschen) allein führen nicht zum Erfolg. Dies zeigt sich auch in der Realität: Organisationen mit den größten IT-Budgets sind nicht automatisch die besten geschützt. Entscheidend ist, ob Sicherheits- und Resilienzthemen ganz oben auf der Agenda stehen und ob Prozesse, Verantwortlichkeiten und Wiederherstellungskonzepte regelmäßig überprüft, getestet und weiterentwickelt werden. Cyber-Resilienz ist daher kein Projekt mit einem Enddatum, sondern eine laufende Managementaufgabe. Wie bei der Nachhaltigkeit erfordert sie eine kulturelle Veränderung: weg vom reinen Compliance-Denken und hin zu echter Risikokompetenz auf allen Ebenen.</p><p>Der größte Fehler ist es, zu glauben, dass man nicht betroffen ist, oder sogar darauf zu vertrauen, im Notfall Hilfe zu bekommen. Denn wenn Cyber-Angriffe Realität werden, zählt nur eines: <strong>„Wie gut eine Organisation vorbereitet ist.“</strong> Resilienz beginnt im Kopf und entfaltet ihre Wirkung dort, wo Technologie, Prozesse und Menschen interagieren. Wer das Thema ernst nimmt, gewinnt nicht nur Sicherheit, sondern auch das Vertrauen von Kunden, Partnern, Mitarbeitern und letztlich des Marktes. Cyber-Resilienz geht nicht nur darum, Systeme am Laufen zu halten. Es geht darum, Verantwortung zu übernehmen und Vertrauen – besonders dann, wenn es darauf ankommt – zu bewahren. Mit dieser Bewertung haben Sie soeben den ersten Schritt gemacht. Herzlichen Glückwunsch!</p>`
  }
};

//____________________________________________________________
//  2.  ESCAPE & FORMAT HELPERS (unchanged)
//____________________________________________________________
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
const formatDate = (d) => {
  if (!d) return null;
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return null;
  }
};

//____________________________________________________________
//  3.  STATUS COLOUR ENGINE (unchanged)
//____________________________________________________________
const getStatusInfo = (selectedValue, questionType) => {
  if (selectedValue === undefined || selectedValue === null || selectedValue === '') {
    return { label: 'N/A', color: '#a3a3a3' };
  }
  const raw = Array.isArray(selectedValue)
    ? selectedValue.map(v => String(v).trim().toLowerCase())
    : [String(selectedValue).trim().toLowerCase()];

  const negative = ['not implemented', 'no', 'non-compliant', 'absent'];
  const partial = ['partially implemented', 'partial', 'partially'];
  const positive = ['implemented', 'yes', 'compliant', 'fully implemented'];

  const isNeg = raw.some(v => negative.some(k => v.includes(k))) || raw.includes('no') || raw.includes('non-compliant');
  const isPart = raw.some(v => partial.some(k => v.includes(k)));
  const isPos = raw.some(v => positive.some(k => v.includes(k))) && !isNeg && !isPart;

  let color = '#a3a3a3';
  if (isNeg) color = '#ef4444';
  if (isPart) color = '#f59e0b';
  if (isPos) color = '#16a34a';

  return { label: raw.join(', ') || 'N/A', color };
};

//____________________________________________________________
//  4.  TOC BUILDER (unchanged)
//____________________________________________________________
const buildToc = (templateStructure, lang) => {
  if (!Array.isArray(templateStructure) || !templateStructure.length) return '<p>(No content)</p>';
  let html = `<ul class="toc-root">`;
  templateStructure.forEach((sec, sIdx) => {
    const secId = `sec-${sIdx}`;
    html += `<li><a href="#${secId}">${escapeHtml(sec.name || 'Unnamed Section')}</a>`;
    if (Array.isArray(sec.subSections) && sec.subSections.length) {
      html += '<ul>';
      sec.subSections.forEach((sub, ssIdx) => {
        const subId = `sec-${sIdx}-sub-${ssIdx}`;
        html += `<li><a href="${subId}">${escapeHtml(sub.name || 'Unnamed Subsection')}</a></li>`;
      });
      html += '</ul>';
    }
    html += '</li>';
  });
  html += '</ul>';
  return html;
};

//____________________________________________________________
//  5.  MAIN GENERATOR
//____________________________________________________________
const generateReportHtml = (auditInstance = {}, lang = 'EN') => {
  console.log('[generateReportHtml] input:', auditInstance);

  /* ---------- core data ---------- */
  const company   = auditInstance.company || {};
  const template  = auditInstance.template || {};
  const responses = auditInstance.responses || [];
  const struct    = auditInstance.templateStructureSnapshot || [];

  const overallScore = (typeof auditInstance.overallScore === 'number') ? auditInstance.overallScore : 0;
  console.log('[generateReportHtml] overallScore from DB:', overallScore);

  const createdBy = auditInstance.createdBy || {};
  const auditors  = auditInstance.auditorsToDisplay || [];

  /* ---------- environment ---------- */
  const companyEnv = company.examinationEnvironment || {};
  const auditEnv   = auditInstance.examinationEnvironment || {};
  const examEnv    = { ...auditEnv, ...companyEnv };

  console.log('[generateReportHtml] merged examinationEnvironment:', examEnv);

  /* ---------- dates ---------- */
  const reportDate = formatDate(new Date());
  const startDate  = formatDate(auditInstance.startDate);
  const endDate    = formatDate(auditInstance.endDate);
  let examinationDateRange = 'N/A';
  if (startDate && endDate) examinationDateRange = `${startDate} - ${endDate}`;
  else if (startDate) examinationDateRange = startDate;

  /* ---------- auditor block ---------- */
  const auditorLines = auditors.length
    ? auditors.map(u => `${escapeHtml(u.firstName || '')} ${escapeHtml(u.lastName || '')} (${escapeHtml(u.email || '')})`).join('<br/>')
    : `${escapeHtml(createdBy.firstName || '')} ${escapeHtml(createdBy.lastName || '')} (${escapeHtml(createdBy.email || '')})`;

  /* ---------- contact ---------- */
  const contactName  = company.contactPerson?.name  || 'Test contact person';
  const contactEmail = company.contactPerson?.email || 'test@example.com';
  const companyName  = company.name || 'Test company';

  /* ---------- examiner (dynamic) ---------- */
  const examinerName  = auditors[0]?.firstName && auditors[0]?.lastName
    ? `${auditors[0].firstName} ${auditors[0].lastName}`
    : `${createdBy.firstName || ''} ${createdBy.lastName || ''}`.trim() || 'Examiner';
  const examinerEmail = auditors[0]?.email || createdBy.email || 'examiner@isarion.com';

  /* ---------- TOC ---------- */
  const tocHtml = buildToc(struct, lang);

  /* ---------- main content ---------- */
  let mainHtml = '';
  struct.forEach((section, sIdx) => {
    const secId = `sec-${sIdx}`;
    const cls   = sIdx === 0 ? 'section' : 'section section-page-break';
    mainHtml += `<div class="${cls}" id="${secId}">`;
    mainHtml += `<h2 class="header-spacing">${escapeHtml(section.name || 'Unnamed Section')}</h2>`;
    if (section.description) mainHtml += `<p class="section-desc">${escapeHtml(section.description)}</p>`;

    (section.subSections || []).forEach((sub, ssIdx) => {
      const subId = `sec-${sIdx}-sub-${ssIdx}`;
      mainHtml += `<div class="subsection" id="${subId}">`;
      mainHtml += `<h3 class="header-spacing">${escapeHtml(sub.name || 'Unnamed Subsection')}</h3>`;
      if (sub.description) mainHtml += `<p class="subsection-desc">${escapeHtml(sub.description)}</p>`;

      (sub.questions || []).forEach((q) => {
        const resp = responses.find(r => String(r.questionId) === String(q._id)) || {};
        const qType = resp.questionTypeSnapshot || q.type || 'text_input';

        let display = resp.selectedValue;
        if (Array.isArray(display)) display = display.join(', ');
        else if (display === undefined || display === null || display === '') display = DICT.NO_RESPONSE[lang];

        const status = getStatusInfo(resp.selectedValue, qType);
        const answerHtml = `<span style="color:${status.color};"><strong>${escapeHtml(String(display))}</strong></span>`;

        const commentHtml = resp.comment
          ? `<div class="comment"><strong>${DICT.COMMENT[lang]}:</strong><div>${escapeHtml(resp.comment)}</div></div>` : '';
        const recomHtml = resp.recommendation
          ? `<div class="recommendation"><strong>${DICT.RECOMMENDATION[lang]}:</strong><div>${escapeHtml(resp.recommendation)}</div></div>` : '';
        const evidHtml = (Array.isArray(resp.evidenceUrls) && resp.evidenceUrls.length)
          ? `<div class="evidence"><strong>${DICT.EVIDENCE[lang]}:</strong><ul>${resp.evidenceUrls.map(u => `<li><a href="${escapeHtml(u)}">${escapeHtml(u)}</a></li>`).join('')}</ul></div>` : '';

        mainHtml += `
          <div class="question-block">
            <div class="question-header" style="border-left:3px solid ${status.color};">
              <p class="question-title"><strong>${escapeHtml(q.text || 'Untitled question')}</strong></p>
            </div>
            <div class="answer-row"><strong>${DICT.ANSWER[lang]}:</strong> ${answerHtml}</div>
            ${recomHtml}${commentHtml}${evidHtml}
          </div>`;
      });
      mainHtml += '</div>';
    });
    mainHtml += '</div>';
  });

  /* ---------- examination environment (null-safe, company first) ---------- */
  const envHtml = `
    <table class="env">
      <tr><td><strong>${DICT.LOCATIONS[lang]}</strong></td><td>${escapeHtml(String(examEnv.locations ?? 'N/A'))}</td></tr>
      <tr><td><strong>${DICT.EMPLOYEES[lang]}</strong></td><td>${escapeHtml(String(examEnv.employees ?? 'N/A'))}</td></tr>
      <tr><td><strong>${DICT.CLIENTS_TOTAL[lang]}</strong></td><td>${escapeHtml(String(examEnv.clients?.total ?? 'N/A'))}</td></tr>
      <tr><td><strong>${DICT.CLIENTS_MAN[lang]}</strong></td><td>${escapeHtml(String(examEnv.clients?.managed ?? 'N/A'))}</td></tr>
      <tr><td><strong>${DICT.CLIENTS_UNMAN[lang]}</strong></td><td>${escapeHtml(String(examEnv.clients?.unmanaged ?? 'N/A'))}</td></tr>
      <tr><td><strong>${DICT.INDUSTRY[lang]}</strong></td><td>${escapeHtml(examEnv.industry || company.industry || 'N/A')}</td></tr>
      <tr><td><strong>${DICT.PHY_SERVERS[lang]}</strong></td><td>${escapeHtml(String(examEnv.physicalServers ?? 'N/A'))}</td></tr>
      <tr><td><strong>${DICT.VM_SERVERS[lang]}</strong></td><td>${escapeHtml(String(examEnv.vmServers ?? 'N/A'))}</td></tr>
      <tr><td><strong>${DICT.FIREWALLS[lang]}</strong></td><td>${escapeHtml(String(examEnv.firewalls ?? 'N/A'))}</td></tr>
      <tr><td><strong>${DICT.SWITCHES[lang]}</strong></td><td>${escapeHtml(String(examEnv.switches ?? 'N/A'))}</td></tr>
      <tr><td><strong>${DICT.MOBILE_WORKING[lang]}</strong></td><td>${examEnv.mobileWorking ? 'Yes' : 'No'}</td></tr>
      <tr><td><strong>${DICT.SMARTPHONES[lang]}</strong></td><td>${examEnv.smartphones ? 'Yes' : 'No'}</td></tr>
      ${examEnv.notes ? `<tr><td><strong>${DICT.NOTES[lang]}</strong></td><td>${escapeHtml(examEnv.notes)}</td></tr>` : ''}
    </table>`;

  /* ---------- summaries ---------- */
  const summariesHtml = (Array.isArray(auditInstance.summaries) && auditInstance.summaries.length)
    ? auditInstance.summaries.map(s => `<div class="summary"><p><strong>${escapeHtml(s.auditor?.firstName || '')} ${escapeHtml(s.auditor?.lastName || '')}</strong></p><p>${escapeHtml(s.text || '')}</p></div>`).join('')
    : `<p class="justify-text">${DICT.NO_RESPONSE[lang]}</p>`;

  /* ---------- static texts (translated) ---------- */
  const introText        = DICT.INTRO_TEXT[lang];
  const aboutConsulting  = DICT.ABOUT_CONSULTING_TEXT[lang];
  const aboutAudited     = DICT.ABOUT_AUDITED_TEXT(companyName, company.industry || '', contactName, contactEmail, company.generalInfo || examEnv.generalInfo);
  const prefaceText      = DICT.PREFACE_TEXT[lang];
  const disclaimerText   = DICT.DISCLAIMER_TEXT[lang];
  const executiveSummary = DICT.EXEC_SUMMARY_TEXT(companyName, template.name || '', overallScore) + DICT.CYBER_RESILIENCE[lang];

  /* ---------- handover (blank tables) ---------- */
  const handoverHtml = `
    <p class="justify-text static-text">This page confirms that the assessment report titled "<strong>${escapeHtml(template.name || '')}</strong>" has been formally handed over by the assessor to the assessed company.</p>
    <p class="justify-text static-text">By signing below, both parties acknowledge the reception of the full assessment report and confirm that it has been delivered in its final version.</p>

    <div class="handover-section">
      <h3 class="handover-heading">${DICT.CONSULTANT[lang]}</h3>
      <table class="handover-table">
        <tr><td>${DICT.NAME[lang]}:</td><td><span class="signature-input"></span></td><td>${DICT.ORGANIZATION[lang]}:</td><td><span class="signature-input"></span></td><td>${DICT.DATE[lang]}:</td><td><span class="signature-input"></span></td></tr>
        <tr><td colspan="6" class="signature-line-row">${DICT.SIGNATURE[lang]}: <span class="signature-line"></span></td></tr>
      </table>
    </div>

    <div class="handover-section" style="margin-top:30px;">
      <h3 class="handover-heading">${DICT.CONSULTED_REP[lang]}</h3>
      <table class="handover-table">
        <tr><td>${DICT.NAME[lang]}:</td><td><span class="signature-input"></span></td><td>${DICT.ORGANIZATION[lang]}:</td><td><span class="signature-input"></span></td><td>${DICT.DATE[lang]}:</td><td><span class="signature-input"></span></td></tr>
        <tr><td colspan="6" class="signature-line-row">${DICT.SIGNATURE[lang]}: <span class="signature-line"></span></td></tr>
      </table>
    </div>`;

  /* ---------- thank-you + dynamic contact ---------- */
  const thankYouHtml = `
    <div style="text-align:center;">
      <h2 style="border-bottom:none;margin-bottom:5px;font-size:26pt;color:#014f65;margin-top:0;font-family:'Lexend',sans-serif;">${DICT.THANK_YOU_TITLE[lang]}</h2>
      <p style="font-size:16pt;margin-bottom:15px;margin-top:5px;font-weight:bold;line-height:1.5;">${DICT.THANK_YOU_FOR[lang]}</p>
      <p class="justify-text static-text">${DICT.THANK_YOU_TEXT[lang]}</p>
      <p class="justify-text static-text">${DICT.THANK_YOU_CONTACT[lang]}</p>
      <div class="contact">
        <p class="static-text"><strong>${escapeHtml(examinerName)} — <a href="mailto:${escapeHtml(examinerEmail)}" class="no-style-link">${escapeHtml(examinerEmail)}</a></strong></p>
      </div>
      <h3 class="slogan-center" style="font-size:14pt;margin-top:20px;"><strong>${DICT.THANK_SLOGAN[lang]}</strong></h3>
    </div>`;

  /* =========================================================
   *  HTML SHELL  (identical structure – only labels translated)
   * ========================================================= */
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(template.name || 'Assessment Report')} - ${escapeHtml(companyName)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
  <style>
    @page{margin:0.35in; @bottom-center{content:counter(page)"/"counter(pages); font-family:Arial,sans-serif; font-size:10pt; color:#666;}}
    body{font-family:Arial,sans-serif; font-size:14pt; color:#2c3e50; margin:0; -webkit-print-color-adjust:exact;}
    .container{padding:0.35in; box-sizing:border-box;}
    .cover-page{counter-increment:page;} .cover-page::after{display:none;}
    h2,h3,.cover-title h1,.cover-title h2{font-family:'Lexend',sans-serif !important; color:#014f65;}
    h2{font-size:26pt !important; text-align:center;} h3{font-size:20pt !important;}
    .header-spacing{margin:25px 0 16px !important;}
    .static-text,.justify-text{line-height:1.5 !important;} .justify-text{text-align:justify;}
    .page-break{page-break-before:always;} .section-page-break{page-break-before:always;}
    .subsection{page-break-inside:avoid;}
    .question-block{page-break-inside:avoid; margin-bottom:10px; padding:10px; background:#fafafa; border:1px solid #eee; border-radius:4px;}
    .question-header{padding-left:10px; border-left:3px solid;}
    .answer-row,.comment,.recommendation,.evidence{margin:5px 0; font-size:11pt;}
    .recommendation{background:#f0f8ff; padding:8px; border-left:4px solid #014f65;}
    .comment{background:#e6f7f6; padding:8px; border-left:4px solid #014f65;}
    .evidence{background:#fff8e6; padding:8px; border-left:4px solid #014f65;}
    .cover{height:9.3in; display:flex; flex-direction:column; justify-content:space-between; text-align:center; padding:20px 0;}
    .logo{max-width:350px;}
    .cover-quote{margin-top:30px; font-size:15pt; max-width:700px; margin-left:auto; margin-right:auto;}
    .slogan-center{font-size:14pt; margin-top:20px; font-style:italic; color:#014f65; text-align:center;}
    .slogan-local{text-align:center; font-style:italic; color:#014f65; margin-top:20px; font-size:16pt;}
    .no-style-link{color:#000 !important; text-decoration:none !important;}

    /* --- TOC --- */
    .toc-root{counter-reset:section; padding-left:0; margin-top:8px; font-size:14pt;}
    .toc-root>li{counter-increment:section; margin-top:4px; list-style:none;}
    .toc-root>li:before{content:counter(section) ". "; font-weight:bold;}
    .toc-root>li ul{list-style:none; padding-left:30px; margin-top:2px; counter-reset:subsection;}
    .toc-root>li li{counter-increment:subsection; margin-top:2px;}
    .toc-root>li li:before{content:counter(section)"."counter(subsection)". "; font-weight:normal;}
    .toc-root a{text-decoration:none; color:#003340;}

    /* --- handover table (blank) --- */
    .handover-heading{margin-bottom:5px; font-size:14pt; color:#014f65; text-align:left; font-weight:bold; font-family:Arial,sans-serif !important;}
    .handover-table{width:100%; margin-top:5px; border-collapse:collapse; font-size:12pt;}
    .handover-table td{padding:2px 0; vertical-align:top; width:16%; line-height:1.8;}
    .handover-table td:nth-child(2),.handover-table td:nth-child(4),.handover-table td:nth-child(6){padding-left:5px;}
    .signature-input{display:inline-block; border-bottom:1px solid #000; width:85%; height:1em;}
    .signature-line-row{padding-top:15px !important;}
    .signature-line{display:inline-block; border-bottom:1px solid #000; width:250px; height:1em; margin-left:5px;}
    .handover-section{margin-bottom:25px;}

    /* --- env table --- */
    .env{width:100%; border-collapse:collapse; margin:8px 0 15px 0; table-layout:fixed;}
    .env td{padding:5px 8px; border:1px solid #e6e6e6; font-size:12pt;}
    .env td:first-child{width:30%; font-weight:bold; background:#f5f5f5;}
  </style>
</head>
<body>
  <!-- ===========================  COVER  =========================== -->
  <div class="container cover-page">
    <div class="cover">
      <div>
        <img class="logo" src="https://res.cloudinary.com/dcviwtoog/image/upload/v1765422490/1_BKGS_Consulting_boqy3g.png" alt="Logo" />
        <div class="cover-title">
          <h1>${escapeHtml(template.name || 'Name of the assessment')}</h1>
          <h2>${DICT.REPORT_TITLE[lang]}</h2>
        </div>
        <div class="meta" style="margin:20px 0; font-size:16pt;">
          <p><strong>${DICT.REPORT_DATE}</strong> ${escapeHtml(reportDate)}</p>
          <p><strong>${DICT.EXAM_DATE}</strong> ${escapeHtml(examinationDateRange)}</p>
          <p><strong>${DICT.EXAMINER[lang]}</strong> Recks Binda</p>
          <p><strong>${DICT.EMAIL[lang]}</strong> <a href="mailto:bindaramsey@gmail.com" class="no-style-link">bindaramsey@gmail.com</a></p>
        </div>
      </div>
      <div>
        <div style="font-size:16pt;">
          <p><strong>${DICT.FOR[lang]}</strong></p>
          <p><strong>${escapeHtml(companyName)}</strong></p>
          <p>${escapeHtml(contactName)} — ${escapeHtml(contactEmail)}</p>
        </div>
        <div class="cover-quote">
          <p class="static-text"><strong>${DICT.COVER_QUOTE_1[lang]}</strong></p>
          <p class="static-text"><em><strong>${DICT.COVER_QUOTE_2[lang]}</strong></em></p>
        </div>
      </div>
    </div>
  </div>

  <!-- ===========================  TOC  =========================== -->
  <div class="container page-break"><h2 class="header-spacing">${DICT.TOC[lang]}</h2>${tocHtml}</div>

  <!-- ===========================  INTRO  =========================== -->
  <div class="container page-break"><h2 class="header-spacing">${DICT.INTRO[lang]}</h2>${introText}</div>

  <!-- ===========================  ABOUT CONSULTING  =========================== -->
  <div class="container page-break">
    <h2 class="header-spacing">${DICT.ABOUT_CONSULTING[lang]}</h2>
    ${aboutConsulting}
  </div>

  <!-- ===========================  ABOUT AUDITED  =========================== -->
  <div class="container page-break">
    <h2 class="header-spacing">${DICT.ABOUT_AUDITED[lang]}</h2>
    ${aboutAudited}
  </div>

  <!-- ===========================  PREFACE / DISCLAIMER  =========================== -->
  <div class="container page-break">
    <h2 class="header-spacing">${DICT.PREFACE[lang]}</h2>${prefaceText}
    <h2 class="header-spacing" style="margin-top:25px;">${DICT.DISCLAIMER[lang]}</h2>${disclaimerText}
  </div>

  <!-- ===========================  EXECUTIVE SUMMARY  =========================== -->
  <div class="container page-break">
    <h2 class="header-spacing">${DICT.EXEC_SUMMARY[lang]}</h2>
    ${executiveSummary}
    ${auditInstance.summaries?.length ? `<h2 class="header-spacing" style="margin-top:25px;">${DICT.AUDITOR_SUMMARY[lang]}</h2>${summariesHtml}` : ''}
  </div>

  <!-- ===========================  EXAMINATION ENVIRONMENT  =========================== -->
  <div class="container page-break"><h2 class="header-spacing">${DICT.EXAM_ENV[lang]}</h2>${envHtml}</div>

  <!-- ===========================  FINDINGS  =========================== -->
  <div class="container page-break"><h2 class="header-spacing">${DICT.FINDINGS[lang]}</h2>${mainHtml}</div>

  <!-- ===========================  HANDOVER  =========================== -->
  <div class="container page-break"><h2 class="header-spacing">${DICT.HANDOVER[lang]}</h2>${handoverHtml}</div>

  <!-- ===========================  THANK YOU  =========================== -->
  <div class="container page-break">${thankYouHtml}</div>

</body>
</html>`;

  console.log('[generateReportHtml] finished.');
  return html;
};

export default generateReportHtml;