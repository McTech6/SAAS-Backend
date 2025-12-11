 

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


const LOGO_URL = 'https://res.cloudinary.com/dcviwtoog/image/upload/v1765422490/1_BKGS_Consulting_boqy3g.png';

/** Escapes HTML to prevent XSS */
const escapeHtml = (str) => {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;')
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

/** Status color logic - GREEN for yes/compliant/implemented */
const getStatusInfo = (selectedValue, questionType) => {
    console.log('[getStatusInfo] Input:', { selectedValue, questionType });

    if (selectedValue === undefined || selectedValue === null || selectedValue === '') {
        return { label: 'N/A', color: '#a3a3a3' };
    }

    let values = [];
    let rawValue = '';

    if (Array.isArray(selectedValue)) {
        values = selectedValue.map(v => String(v).trim().toLowerCase());
        rawValue = values.join(', ');
    } else {
        rawValue = String(selectedValue).trim().toLowerCase();
        values = [rawValue];
    }

    if (values.length === 0) {
        return { label: 'N/A', color: '#a3a3a3' };
    }

    const implementedKeywords = ['implemented', 'yes', 'compliant', 'fully implemented'];
    const partialKeywords = ['partially implemented', 'partial', 'partially'];
    const negativeKeywords = ['not implemented', 'no', 'non-compliant', 'absent'];

    const normalized = rawValue.split(',').map(s => s.trim().toLowerCase());

    const isNegative = normalized.some(v => negativeKeywords.some(k => v.includes(k))) || 
                       normalized.includes('no') || 
                       normalized.includes('non-compliant');

    const isPartial = normalized.some(v => partialKeywords.some(k => v.includes(k)));

    const isImplemented = normalized.some(v => implementedKeywords.some(k => v.includes(k))) &&
                          !isNegative && !isPartial;

    let color = '#a3a3a3';
    if (isNegative) color = '#ef4444';      // RED
    else if (isPartial) color = '#f59e0b';  // ORANGE
    else if (isImplemented) color = '#16a34a'; // GREEN

    console.log('[getStatusInfo] Result:', { rawValue, isNegative, isPartial, isImplemented, color });

    return { label: rawValue || 'N/A', color };
};

const buildToc = (templateStructure) => {
    if (!Array.isArray(templateStructure) || templateStructure.length === 0) return '<p>(No content)</p>';
    let tocHtml = '<ul class="toc-root">';
    templateStructure.forEach((section, sIdx) => {
        const secId = `sec-${sIdx}`;
        tocHtml += `<li><a href="#${secId}">${escapeHtml(section.name || 'Unnamed Section')}</a>`;
        if (Array.isArray(section.subSections) && section.subSections.length > 0) {
            tocHtml += '<ul>';
            section.subSections.forEach((ss, ssIdx) => {
                const subId = `sec-${sIdx}-sub-${ssIdx}`;
                tocHtml += `<li><a href="#${subId}">${escapeHtml(ss.name || 'Unnamed Subsection')}</a></li>`;
            });
            tocHtml += '</ul>';
        }
        tocHtml += '</li>';
    });
    tocHtml += '</ul>';
    return tocHtml;
};

const generateReportHtml = (auditInstance = {}) => {
    console.log('[generateReportHtml] Starting report generation...', auditInstance);

    const company = auditInstance.company || {};
    const template = auditInstance.template || {};
    const responses = auditInstance.responses || [];
    const templateStructure = auditInstance.templateStructureSnapshot || [];
    const overallScore = (typeof auditInstance.overallScore === 'number') ? Math.round(auditInstance.overallScore) : 0;
    const createdBy = auditInstance.createdBy || {};
    const auditorsToDisplay = auditInstance.auditorsToDisplay || [];
    const examinationEnvironment = company.examinationEnvironment || auditInstance.examinationEnvironment || {};
    const summaries = auditInstance.summaries || [];

    const reportDate = formatDate(new Date());
    const startDateFormatted = formatDate(auditInstance.startDate);
    const endDateFormatted = formatDate(auditInstance.endDate);
    let auditDateRange = 'N/A';
    if (startDateFormatted && endDateFormatted) {
        auditDateRange = `${startDateFormatted} - ${endDateFormatted}`;
    } else if (startDateFormatted) {
        auditDateRange = startDateFormatted;
    }

    const auditorLines = auditorsToDisplay.length > 0
        ? auditorsToDisplay.map(u => `${escapeHtml(u.firstName || '')} ${escapeHtml(u.lastName || '')} (${escapeHtml(u.email || '')})`).join('<br/>')
        : `${escapeHtml(createdBy.firstName || '')} ${escapeHtml(createdBy.lastName || '')} (${escapeHtml(createdBy.email || '')})`;

    const contactName = company.contactPerson?.name || '';
    const contactEmail = company.contactPerson?.email || '';

    // Use main auditor as examiner contact
    const examinerName = auditorsToDisplay[0]?.firstName && auditorsToDisplay[0]?.lastName
        ? `${auditorsToDisplay[0].firstName} ${auditorsToDisplay[0].lastName}`
        : `${createdBy.firstName || ''} ${createdBy.lastName || ''}`.trim() || 'Auditor';
    const examinerEmail = auditorsToDisplay[0]?.email || createdBy.email || 'info@isarion.com';

    const tocHtml = buildToc(templateStructure);

    let mainHtml = '';
    templateStructure.forEach((section, sIdx) => {
        const secId = `sec-${sIdx}`;
        const sectionClass = sIdx === 0 ? 'section' : 'section section-page-break';

        mainHtml += `<div class="${sectionClass}" id="${secId}">`;
        mainHtml += `<h2 class="header-spacing">${escapeHtml(section.name || 'Unnamed Section')}</h2>`;

        if (section.description) {
            mainHtml += `<p class="section-desc">${escapeHtml(section.description)}</p>`;
        }

        (section.subSections || []).forEach((subSection, ssIdx) => {
            const subId = `sec-${sIdx}-sub-${ssIdx}`;
            mainHtml += `<div class="subsection" id="${subId}">`;
            mainHtml += `<h3 class="header-spacing">${escapeHtml(subSection.name || 'Unnamed Subsection')}</h3>`;

            if (subSection.description) {
                mainHtml += `<p class="subsection-desc">${escapeHtml(subSection.description)}</p>`;
            }

            (subSection.questions || []).forEach((question, qIdx) => {
                const resp = responses.find(r => r.questionId?.toString() === question._id?.toString()) || {};
                console.log(`[Question ${qIdx}] Found response:`, resp);

                let selectedValueDisplay = resp.selectedValue;
                if (Array.isArray(resp.selectedValue)) {
                    selectedValueDisplay = resp.selectedValue.join(', ');
                } else if (resp.selectedValue === undefined || resp.selectedValue === null || resp.selectedValue === '') {
                    selectedValueDisplay = 'N/A';
                }

                const questionType = resp.questionTypeSnapshot || question.type || 'text_input';
                const status = getStatusInfo(resp.selectedValue, questionType);

                const answerText = escapeHtml(String(selectedValueDisplay || 'N/A'));
                const answerHtml = `<span style="color: ${status.color};"><strong>${answerText}</strong></span>`;

                const commentHtml = resp.comment
                    ? `<div class="comment"><strong>Comment:</strong><div>${escapeHtml(resp.comment)}</div></div>`
                    : '';

                const evidenceHtml = (Array.isArray(resp.evidenceUrls) && resp.evidenceUrls.length > 0)
                    ? `<div class="evidence"><strong>Evidence:</strong><ul>${resp.evidenceUrls.map(u => `<li><a href="${escapeHtml(u)}">${escapeHtml(u)}</a></li>`).join('')}</ul></div>`
                    : '';

                // Fixed: Recommendations now properly displayed
                const recommendationHtml = resp.recommendation
                    ? `<div class="recommendation"><strong>Recommendation:</strong><div>${escapeHtml(resp.recommendation)}</div></div>`
                    : '';

                mainHtml += `
                    <div class="question-block">
                        <div class="question-header" style="border-left:3px solid ${status.color};">
                            <p class="question-title"><strong>${escapeHtml(question.text || 'Untitled question')}</strong></p>
                        </div>
                        <div class="answer-row"><strong>Answer:</strong> ${answerHtml}</div>
                        ${recommendationHtml}
                        ${commentHtml}
                        ${evidenceHtml}
                    </div>
                `;
            });

            mainHtml += `</div>`; // Close subsection
        });
        mainHtml += `</div>`; // Close section
    });

    const envHtml = `
        <table class="env">
            <tr><td><strong>Locations</strong></td><td>${escapeHtml(String(examinationEnvironment.locations || 'N/A'))}</td></tr>
            <tr><td><strong>Number of employees</strong></td><td>${escapeHtml(String(examinationEnvironment.employees || 'N/A'))}</td></tr>
            <tr><td><strong>Clients (total)</strong></td><td>${escapeHtml(String(examinationEnvironment.clients?.total || 'N/A'))}</td></tr>
            <tr><td><strong>Clients (managed)</strong></td><td>${escapeHtml(String(examinationEnvironment.clients?.managed || 'N/A'))}</td></tr>
            <tr><td><strong>Clients (unmanaged)</strong></td><td>${escapeHtml(String(examinationEnvironment.clients?.unmanaged || 'N/A'))}</td></tr>
            <tr><td><strong>Industry</strong></td><td>${escapeHtml(examinationEnvironment.industry || company.industry || 'N/A')}</td></tr>
            <tr><td><strong>Physical servers</strong></td><td>${escapeHtml(String(examinationEnvironment.physicalServers || 'N/A'))}</td></tr>
            <tr><td><strong>VM servers</strong></td><td>${escapeHtml(String(examinationEnvironment.vmServers || 'N/A'))}</td></tr>
            <tr><td><strong>Firewalls</strong></td><td>${escapeHtml(String(examinationEnvironment.firewalls || 'N/A'))}</td></tr>
            <tr><td><strong>Switches</strong></td><td>${escapeHtml(String(examinationEnvironment.switches || 'N/A'))}</td></tr>
            <tr><td><strong>Mobile working</strong></td><td>${examinationEnvironment.mobileWorking ? 'Yes' : 'No'}</td></tr>
            <tr><td><strong>Smartphones</strong></td><td>${examinationEnvironment.smartphones ? 'Yes' : 'No'}</td></tr>
            ${examinationEnvironment.notes ? `<tr><td><strong>Notes</strong></td><td>${escapeHtml(examinationEnvironment.notes)}</td></tr>` : ''}
        </table>
    `;

    const summariesHtml = (Array.isArray(summaries) && summaries.length > 0)
        ? summaries.map(s => `<div class="summary"><p><strong>${escapeHtml(s.auditor?.firstName || '')} ${escapeHtml(s.auditor?.lastName || '')}</strong></p><p>${escapeHtml(s.text || '')}</p></div>`).join('')
        : '<p class="justify-text">No summaries provided.</p>';

    const introductionText = `
        <p class="justify-text static-text">When we speak about Cyber, Information, and IT Security, it is important to recognize that it is not only a technical matter. Technology plays a key role, but security is always the result of three dimensions working together:</p>
        <ul style="margin-top: 5px; margin-bottom: 5px;">
            <li><strong>Technology</strong> – the tools and systems that protect our data.</li>
            <li><strong>Organization</strong> – the rules, processes, and responsibilities that guide how we work.</li>
            <li><strong>People</strong> – the awareness, behavior, and decisions of everyone involved.</li>
        </ul>
        <p class="justify-text static-text">Only when these three elements are combined can we create real protection. Focusing on technology alone is not enough. A secure company requires clear structures, well-trained employees, and a culture where security is seen as part of everyday work.</p>
        <p class="justify-text static-text">In today's ever-changing world, the importance of protecting data and systems continues to grow. New threats appear daily, and digitalization increases the complexity of our business environment. For this reason, <strong>security must be given the right priority</strong>. It should not be treated as an "add-on" or a last step, but as an <strong>integral part of every decision, process, and investment</strong>.</p>
        <p class="justify-text static-text">This assessment report is designed to make this approach practical and understandable. It gives a transparent overview of your current situation, highlights strengths and weaknesses, and provides clear guidance for next steps. The goal is not only to identify risks but also to enable your organization to <strong>build sustainable protection</strong> so that technology, organization, and people are aligned and your company can continue to operate with confidence and resilience.</p>
    `;

    const aboutCompanyHardcoded = `
        <p class="justify-text static-text">We at <strong>BKGS Consulting</strong> believe that audits and assessments should strengthen companies rather than slow them down. In a world where compliance requirements, standards, and technologies evolve faster than ever, many companies still rely on rigid tools and outdated methods to evaluate performance, security, and quality. At <strong>BKGS Consulting</strong>, we exist to change that. Our mission is to make assessments and audits simple, smart, and adaptable — transforming them from static checklists into dynamic instruments for growth, trust, and improvement. We believe that every organization, regardless of its size, sector, or country deserves access to modern, intelligent solutions that align with its specific needs, frameworks, and ambitions.</p>
        <p class="justify-text static-text" style="margin-top: 15px;">We combine <strong>technology, methodology,</strong> and <strong>human expertise</strong> to develop flexible, powerful audit and assessment solutions tailored to the individual needs of our clients. Our work combines <strong>32 years of consulting experience</strong> with state-of-the-art software platforms, ensuring that every client benefits from precision, scalability, and adaptability.</p>
        <p class="justify-text static-text" style="margin-top: 15px;">We don’t just deliver tools — we build <strong>solutions that fit your context</strong>. From defining requirements to designing dashboards, from building reporting logic to automating workflows, our team ensures that your assessment system reflects <strong>your goals, standards</strong>, and <strong>operational culture</strong>.</p>
        <p class="justify-text static-text" style="margin-top: 15px;">We envision a future where audits and assessments are not bureaucratic obligations, but <strong>strategic enablers of trust and performance</strong>. A world where organizations of any size can assess themselves <strong>continuously</strong>, adjust in real time, and make decisions with confidence.</p>
        <h3 class="slogan-local">"Securing Your Digital Horizon, Together."</h3>
    `;

    const aboutCompanyAudited = `
        <p class="justify-text static-text">As a prominent player in the <strong>${escapeHtml(company.industry || '')}</strong> industry, <strong>${escapeHtml(company.name || 'Test company')}</strong> has shown a strong commitment to maintaining a secure and reliable operational environment. Our assessment was conducted to assess their current information, IT and security posture, providing a detailed overview of their defenses and identifying key areas for continuous improvement. This assessment highlights their dedication to protecting their digital assets and fostering a resilient business infrastructure.</p>
        <p class="static-text" style="margin-top: 5px;"><strong>Contact person:</strong> ${escapeHtml(contactName || '')} — ${escapeHtml(contactEmail || '')}</p>
        ${company.generalInfo || examinationEnvironment.generalInfo ? `<p class="justify-text static-text">${escapeHtml(company.generalInfo || examinationEnvironment.generalInfo)}</p>` : ''}
    `;

    const prefaceText = `
        <p class="justify-text static-text">The <strong>ISARION (Information Security Assessment Evolution) -Report</strong> has been developed to provide organizations with a structured and independent assessment of their information security posture. The aim is not only to identify technical issues, but to create a holistic view that combines <strong>technology, organization, and people</strong>.</p>
        <p class="justify-text static-text">This report is designed as a practical tool for decision-makers at all levels. Whether you have a technical background or not, the findings and recommendations are presented in a way that allows you to clearly understand where strengths lie, where risks exist, and what steps can be taken to achieve sustainable improvement.</p>
        <p class="justify-text static-text">Our mission is to support organizations in treating cybersecurity as an integral part of their business strategy and daily operations—helping to build trust, ensure compliance, and strengthen resilience in an ever-changing digital world.</p>
    `;

    const disclaimerText = `
        <p class="justify-text static-text">This report is based on the information, data, and evidence made available during the assessment process. While every effort has been made to provide accurate and reliable findings, the results and recommendations are limited to the scope of the assessment and the time of its execution.</p>
        <p class="justify-text static-text">The report should not be considered a guarantee against future risks or incidents. Security threats evolve constantly, and continuous monitoring, improvement, and adaptation remain essential.</p>
        <p class="justify-text static-text">The assessor and assessing organization do not assume liability for direct or indirect damages that may result from the use of this report. The responsibility for implementing and maintaining effective security measures lies with the assessed organization.</p>
    `;

    const handoverText = `
        <p class="justify-text static-text">This page confirms that the assessment report titled "<strong>${escapeHtml(template.name || 'Name of the assessment')}</strong>" has been formally handed over by the assessor to the assessed company.</p>
        <p class="justify-text static-text">By signing below, both parties acknowledge the reception of the full assessment report and confirm that it has been delivered in its final version.</p>
        <div class="handover-section">
            <h3 class="handover-heading">Consultant:</h3>
            <table class="handover-table">
                <tr><td>Name:</td><td><span class="signature-input"></span></td><td>Organization:</td><td><span class="signature-input">BKGS Consulting</span></td><td>Date:</td><td><span class="signature-input"></span></td></tr>
                <tr><td colspan="6" class="signature-line-row">Signature: <span class="signature-line"></span></td></tr>
            </table>
        </div>
        <div class="handover-section" style="margin-top: 30px;">
            <h3 class="handover-heading">Company Representative:</h3>
            <table class="handover-table">
                <tr><td>Name:</td><td><span class="signature-input"></span></td><td>Organization:</td><td><span class="signature-input">${escapeHtml(company.name || '')}</span></td><td>Date:</td><td><span class="signature-input"></span></td></tr>
                <tr><td colspan="6" class="signature-line-row">Signature: <span class="signature-line"></span></td></tr>
            </table>
        </div>
    `;

    const thankYouText = `
        <div style="text-align: center;">
            <h2 style="border-bottom: none; margin-bottom: 5px; font-size: 26pt; color: #014f65; margin-top: 0; font-family: 'Lexend', sans-serif;">Thank You</h2>
            <p style="font-size: 16pt; margin-bottom: 15px; margin-top: 5px; font-weight: bold; line-height: 1.5;">for Choosing ISARION</p>
            <p class="justify-text static-text">We are committed to enhancing your organization's security posture and ensuring compliance in an ever-evolving threat landscape. This report serves as a foundational step towards a more resilient and secure future.</p>
            <p class="justify-text static-text">Our team is dedicated to supporting your journey beyond this assessment. We encourage you to review the findings and recommendations carefully and reach out to us for any clarifications or assistance in implementing the suggested improvements.</p>
            <p class="static-text" style="margin-top: 15px;">For further discussions or to schedule a follow-up consultation, please contact your examiner:</p>
            <div class="contact">
                <p class="static-text"><strong>${escapeHtml(examinerName)}</strong></p>
                <p class="static-text"><a href="mailto:${escapeHtml(examinerEmail)}">${escapeHtml(examinerEmail)}</a></p>
            </div>
            <h3 class="slogan-center"><strong>"Improvement begins with assessment and assessment begins with the right questions"</strong></h3>
        </div>
    `;

    const cyberResilienceText = `
        <h3 class="slogan-random"><strong>"Cyber resilience as part of your organization's reputation"</strong></h3>
        <p class="justify-text static-text" style="margin-top: 10px;">Cyber resilience refers to an entity's ability to continuously deliver the intended outcome, despite cyber-attacks. Resilience to cyber-attacks is essential to IT systems, critical infrastructure, business processes, organizations, societies, and nation-states.</p>
        <p class="justify-text static-text">Resilience is like juggling lots of balls: it is not enough to optimize individual points. The key to success lies in the ability to think holistically and to orchestrate several strands of action in parallel, from awareness training and technical security to clear crisis management. Resources (budget and people) alone does not lead to success. This is also evident in reality: organizations with the largest IT budgets are not automatically the best protected. The decisive factor is whether security and resilience issues are at the top of the agenda and whether processes, responsibilities and recovery concepts are regularly reviewed, tested and further developed. Cyber resilience is therefore not a project with an end date, but an ongoing management task. As with sustainability, it requires a cultural shift: away from pure compliance thinking and towards genuine risk competence at all levels.</p>
        <p class="justify-text static-text">The biggest mistake is to believe that you are not affected, or even to rely on getting help in an emergency. Because when cyber-attacks become a reality, only one thing matters: <strong>“how well prepared an organization is”</strong>. Resilience begins in the mind and unfolds its effect where technology, processes and people interact. Those who take the issue seriously not only gain security, but also the trust of customers, partners, employees and ultimately the market. Cyber resilience is not just about keeping systems running. It's about taking responsibility and maintaining trust, especially when it matters — and with this assessment, you have just taken the first step. Congratulations!</p>
    `;

    const coverQuoteText = `
        <p class="static-text"><em><strong>You can only protect what you know.</strong></em></p>
    `;

    const html = `
    <!doctype html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Assessment Report - ${escapeHtml(company.name || 'Unknown Company')}</title>
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
        <style>
            @page {
                margin: 0.35in;
                @bottom-center {
                    content: counter(page) "/" counter(pages);
                    font-family: Arial, sans-serif;
                    font-size: 10pt;
                    color: #666;
                }
            }
            body { font-family: Arial, sans-serif; font-size: 14pt; color: #2c3e50; margin: 0; -webkit-print-color-adjust: exact; }
            .container { padding: 0.35in; box-sizing: border-box; }
            .cover-page { counter-increment: page; }
            .cover-page::after { display: none; }
            h2, h3, .cover-title h1, .cover-title h2 { font-family: 'Lexend', sans-serif !important; color: #014f65; }
            h2 { font-size: 26pt !important; text-align: center; }
            h3 { font-size: 20pt !important; }
            .header-spacing { margin: 25px 0 16px !important; }
            .static-text, .justify-text { line-height: 1.5 !important; }
            .justify-text { text-align: justify; }
            .page-break { page-break-before: always; }
            .section-page-break { page-break-before: always; }
            .subsection { page-break-inside: avoid; }
            .question-block { page-break-inside: avoid; margin-bottom: 10px; padding: 10px; background: #fafafa; border: 1px solid #eee; border-radius: 4px; }
            .question-header { padding-left: 10px; border-left: 3px solid; }
            .answer-row, .comment, .recommendation, .evidence { margin: 5px 0; font-size: 11pt; }
            .recommendation { background: #f0f8ff; padding: 8px; border-left: 4px solid #014f65; }
            .comment { background: #e6f7f6; padding: 8px; border-left: 4px solid #014f65; }
            .evidence { background: #fff8e6; padding: 8px; border-left: 4px solid #014f65; }
            .cover { height: 9.3in; display: flex; flex-direction: column; justify-content: space-between; text-align: center; padding: 20px 0; }
            .logo { max-width: 350px; }
            .cover-quote { margin-top: 30px; font-size: 15pt; max-width: 700px; margin-left: auto; margin-right: auto; }
            .slogan-center { font-size: 20pt; margin-top: 30px; font-style: italic; color: #014f65; }
            .slogan-random { font-size: 18pt; text-align: center; margin: 30px 0 10px; color: #014f65; }
        </style>
    </head>
    <body>
        <div class="container cover-page">
            <div class="cover">
                <div>
                    <img class="logo" src="${LOGO_URL}" alt="Logo" />
                    <div class="cover-title">
                        <h1>${escapeHtml(template.name || 'Name of the assessment')}</h1>
                        <h2>REPORT</h2>
                    </div>
                    <div class="meta" style="margin: 20px 0; font-size: 16pt;">
                        <p><strong>Report Date:</strong> ${escapeHtml(reportDate)}</p>
                        <p><strong>Assessment Date:</strong> ${escapeHtml(auditDateRange)}</p>
                        <p><strong>Assessor:</strong><br/>${auditorLines}</p>
                    </div>
                </div>
                <div>
                    <div style="font-size: 16pt;">
                        <p><strong>FOR</strong></p>
                        <p><strong>${escapeHtml(company.name || 'Test company')}</strong></p>
                        <p>${escapeHtml(contactName)} — ${escapeHtml(contactEmail)}</p>
                    </div>
                    <div class="cover-quote">
                        ${coverQuoteText}
                    </div>
                </div>
            </div>
        </div>

        <div class="container page-break"><h2 class="header-spacing">Table of Contents</h2>${tocHtml}</div>
        <div class="container page-break"><h2 class="header-spacing">Introduction</h2>${introductionText}</div>
        <div class="container page-break"><h2 class="header-spacing">About the Consulting Company</h2>${aboutCompanyHardcoded}</div>
        
        <!-- About the Examined Company starts on new page -->
        <div class="container page-break">
            <h2 class="header-spacing">About the Examined Company</h2>
            ${aboutCompanyAudited}
        </div>

        <div class="container page-break">
            <h2 class="header-spacing">Preface</h2>${prefaceText}
            <h2 class="header-spacing" style="margin-top: 25px;">Disclaimer</h2>${disclaimerText}
        </div>

        <div class="container page-break">
            <h2 class="header-spacing">Executive Summary</h2>
            <p class="justify-text static-text">This report provides a comprehensive overview of the Information, IT, and cybersecurity posture for <strong>${escapeHtml(company.name || 'Test Company')}</strong> based on the "<strong>${escapeHtml(template.name || 'Name of the assessment')}</strong>".</p>
            <p class="justify-text static-text">Overall compliance score: <strong>${overallScore}%</strong>.</p>
            ${cyberResilienceText}
            ${summaries.length > 0 ? `<h2 class="header-spacing" style="margin-top: 25px;">Auditor Summary</h2>${summariesHtml}` : ''}
        </div>

        <div class="container page-break"><h2 class="header-spacing">Examination Environment</h2>${envHtml}</div>
        <div class="container page-break"><h2 class="header-spacing">Assessment Findings</h2>${mainHtml}</div>
        <div class="container page-break"><h2 class="header-spacing">Handover Confirmation</h2>${handoverText}</div>
        <div class="container page-break">${thankYouText}</div>
    </body>
    </html>
    `;

    console.log('[generateReportHtml] Report generated successfully.');
    return html;
};

export default generateReportHtml;