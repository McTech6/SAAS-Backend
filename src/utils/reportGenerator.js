 

// // export default generateReportHtml;
// const LOGO_URL = 'https://res.cloudinary.com/dcviwtoog/image/upload/v1757777319/DV-Koch-Logo_0225_Logo_Farbe-rgb_bzefrw.jpg';

// /**
//  * Escapes HTML to prevent XSS vulnerabilities.
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
//     if (!d) return 'N/A';
//     try {
//         return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
//     } catch {
//         return String(d);
//     }
// };

// /**
//  * Determine status category and color from a response value.
//  */
// const getStatusInfo = (selectedValue) => {
//     const raw = (selectedValue === undefined || selectedValue === null) ? '' : String(selectedValue).trim().toLowerCase();
//     const color = '#014f65'; // Primary green color

//     // Return the raw value as the label, removing the opinionated logic
//     return { label: raw || 'N/A', color: color };
// };

// /**
//  * Build table of contents HTML from templateStructureSnapshot with numbering
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
//     console.log('[generateReportHtml] Received audit instance:', JSON.stringify({
//         company: auditInstance.company,
//         examinationEnvironment: auditInstance.examinationEnvironment
//     }, null, 2));

//     const company = auditInstance.company || {};
//     const template = auditInstance.template || {};
//     const responses = auditInstance.responses || [];
//     const templateStructure = auditInstance.templateStructureSnapshot || [];
//     const overallScore = (typeof auditInstance.overallScore === 'number') ? auditInstance.overallScore : 0;
//     const createdBy = auditInstance.createdBy || {};
//     const auditorsToDisplay = auditInstance.auditorsToDisplay || [];

//     // Get examination environment data
//     const examinationEnvironment = company.examinationEnvironment || auditInstance.examinationEnvironment || {};

//     console.log('[generateReportHtml] Final examination environment data:', JSON.stringify(examinationEnvironment, null, 2));

//     const summaries = auditInstance.summaries || [];

//     const reportDate = formatDate(new Date());
//     const auditDateRange = (auditInstance.startDate || auditInstance.endDate) ?
//         `${formatDate(auditInstance.startDate)} - ${formatDate(auditInstance.endDate)}` : 'N/A';

//     const auditorLines = auditorsToDisplay.map(u => `${escapeHtml(u.firstName || '')} ${escapeHtml(u.lastName || '')} (${escapeHtml(u.email || '')})`).join('<br/>') || `${escapeHtml(createdBy.firstName || '')} ${escapeHtml(createdBy.lastName || '')} (${escapeHtml(createdBy.email || '')})`;

//     const contactName = company.contactPerson?.name || '';
//     const contactEmail = company.contactPerson?.email || '';

//     const tocHtml = buildToc(templateStructure);

//     let mainHtml = '';
//     templateStructure.forEach((section, sIdx) => {
//         const secId = `sec-${sIdx}`;
//         mainHtml += `<div class="section" id="${secId}"><h2>${escapeHtml(section.name || 'Unnamed Section')}</h2>`;
//         if (section.description) {
//             mainHtml += `<p class="section-desc">${escapeHtml(section.description)}</p>`;
//         }

//         (section.subSections || []).forEach((subSection, ssIdx) => {
//             const subId = `sec-${sIdx}-sub-${ssIdx}`;
//             mainHtml += `<div class="subsection" id="${subId}"><h3>${escapeHtml(subSection.name || 'Unnamed Subsection')}</h3>`;
//             if (subSection.description) {
//                 mainHtml += `<p class="subsection-desc">${escapeHtml(subSection.description)}</p>`;
//             }

//             (subSection.questions || []).forEach((question, qIdx) => {
//                 const resp = responses.find(r => r.questionId?.toString() === question._id?.toString()) || {};
//                 const status = getStatusInfo(resp.selectedValue);
//                 const answerText = escapeHtml(resp.selectedValue === undefined || resp.selectedValue === null ? 'N/A' : String(resp.selectedValue));
//                 const commentHtml = resp.comment ? `<div class="comment"><strong>Comment:</strong><div>${escapeHtml(resp.comment)}</div></div>` : '';
//                 const evidenceHtml = (Array.isArray(resp.evidenceUrls) && resp.evidenceUrls.length > 0) ? `<div class="evidence"><strong>Evidence:</strong><ul>${resp.evidenceUrls.map(u => `<li><a href="${escapeHtml(u)}">${escapeHtml(u)}</a></li>`).join('')}</ul></div>` : '';
//                 const recommendationHtml = resp.recommendation ? `<div class="recommendation"><strong>Recommendation:</strong><div>${escapeHtml(resp.recommendation)}</div></div>` : '';

//                 mainHtml += `
//                     <div class="question-block">
//                         <div class="question-header" style="border-left:3px solid ${status.color};">
//                             <p class="question-title" style="color:${status.color};"><strong>${escapeHtml(question.text || 'Untitled question')}</strong></p>
                            
//                         </div>
//                         <div class="answer-row"><strong>Answer:</strong> ${answerText}</div>
//                         ${recommendationHtml}
//                         ${commentHtml}
//                         ${evidenceHtml}
//                     </div>
//                 `;
//             });

//             mainHtml += `</div>`;
//         });

//         mainHtml += `</div>`;
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
//         : '<p>No summaries provided.</p>';

//     const introductionText = `
//         <p>When we speak about Cyber, Information, and IT Security, it is important to recognize that it is not only a technical matter. Technology plays a key role, but security is always the result of three dimensions working together:</p>
//         <ul>
//             <li><strong>Technology</strong> – the tools and systems that protect our data.</li>
//             <li><strong>Organization</strong> – the rules, processes, and responsibilities that guide how we work.</li>
//             <li><strong>People</strong> – the awareness, behavior, and decisions of everyone involved.</li>
//         </ul>
//         <p>Only when these three elements are combined can we create real protection. Focusing on technology alone is not enough. A secure company requires clear structures, well-trained employees, and a culture where security is seen as part of everyday work.</p>
//         <p>In today's ever-changing world, the importance of protecting data and systems continues to grow. New threats appear daily, and digitalization increases the complexity of our business environment. For this reason, security must be given the right priority. It should not be treated as an "add-on" or a last step, but as an integral part of every decision, process, and investment.</p>
//         <p>This audit report is designed to make this approach practical and understandable. It gives a transparent overview of your current situation, highlights strengths and weaknesses, and provides clear guidance for next steps. The goal is not only to identify risks but also to enable your organization to build sustainable protection—so that technology, organization, and people are aligned and your company can continue to operate with confidence and resilience.</p>
//     `;

//     const aboutCompanyAudited = `
//         <p>As a prominent player in the <strong>${escapeHtml(company.industry || '')}</strong> industry, <strong>${escapeHtml(company.name || 'Test company')}</strong> has shown a strong commitment to maintaining a secure and reliable operational environment. Our audit was conducted to assess their current security posture, providing a detailed overview of their defenses and identifying key areas for continuous improvement. This assessment highlights their dedication to protecting their digital assets and fostering a resilient business infrastructure.</p>
//         <p><strong>Contact person:</strong> ${escapeHtml(contactName || '')} — ${escapeHtml(contactEmail || '')}</p>
//         ${company.generalInfo || company.examinationEnvironment?.generalInfo ? `<p>${escapeHtml(company.generalInfo || company.examinationEnvironment?.generalInfo)}</p>` : ''}
//     `;

//     const aboutCompanyHardcoded = `
//         <p>We, DV-Beratung Koch, are your reliable partner and system house for information technology, telecommunications and video surveillance. Since 1993, we have been successfully implementing IT projects in the areas of government, healthcare and small and medium-sized enterprises.</p>
//         <p>Over the years, our product and service portfolio has been continuously adapted and expanded in line with technological developments. Our aim is to offer you a comprehensive range of IT solutions from a single source, including perfectly coordinated hardware and software for your company.</p>
//         <p>Through continuous training of our team, we ensure that our expert knowledge is always up to date in order to guarantee you modern IT consulting and implementation. We look forward to starting a successful and cooperative partnership with you.</p>
//     `;

//     const prefaceText = `
//         <p>The CyberAudit 360 Check Report has been developed to provide organizations with a structured and independent assessment of their information security posture. The aim is not only to identify technical issues, but to create a holistic view that combines technology, organization, and people.</p>
//         <p>This report is designed as a practical tool for decision-makers at all levels. Whether you have a technical background or not, the findings and recommendations are presented in a way that allows you to clearly understand where strengths lie, where risks exist, and what steps can be taken to achieve sustainable improvement.</p>
//         <p>Our mission is to support organizations in treating cybersecurity as an integral part of their business strategy and daily operations—helping to build trust, ensure compliance, and strengthen resilience in an ever-changing digital world.</p>
//     `;

//     const disclaimerText = `
//         <p>This report is based on the information, data, and evidence made available during the audit process. While every effort has been made to provide accurate and reliable findings, the results and recommendations are limited to the scope of the audit and the time of its execution.</p>
//         <p>The report should not be considered a guarantee against future risks or incidents. Security threats evolve constantly, and continuous monitoring, improvement, and adaptation remain essential.</p>
//         <p>The auditor and auditing organization do not assume liability for direct or indirect damages that may result from the use of this report. The responsibility for implementing and maintaining effective security measures lies with the audited organization.</p>
//     `;

//     const handoverText = `
//         <p>This page confirms that the audit report titled "${escapeHtml(template.name || 'Name of the audit')}" has been formally handed over by the auditor to the audited company.</p>
//         <p>By signing below, both parties acknowledge the reception of the full audit report and confirm that it has been delivered in its final version.</p>

//         <table class="handover">
//             <tr><td><strong>Auditor:</strong></td><td></td></tr>
//             <tr><td>Name:</td><td>_________________________</td></tr>
//             <tr><td>Organization:</td><td>_________________________</td></tr>
//             <tr><td>Date:</td><td>_________________________</td></tr>
//             <tr><td>Signature:</td><td>_________________________</td></tr>
//         </table>

//         <br/>

//         <table class="handover">
//             <tr><td><strong>Audited Company Representative:</strong></td><td></td></tr>
//             <tr><td>Name:</td><td>_________________________</td></tr>
//             <tr><td>Organization:</td><td>_________________________</td></tr>
//             <tr><td>Date:</td><td>_________________________</td></tr>
//             <tr><td>Signature:</td><td>_________________________</td></tr>
//         </table>
//     `;

//     const thankYouText = `
//         <div style="text-align: center;">
//             <p>Thank You for Choosing Cybersecurity Audit 360</p>
//             <p>We are committed to enhancing your organization's security posture and ensuring compliance in an ever evolving threat landscape. This report serves as a foundational step towards a more resilient and secure future.</p>
//             <p>Our team is dedicated to supporting your journey beyond this audit. We encourage you to review the findings and recommendations carefully and reach out to us for any clarifications or assistance in implementing the suggested improvements.</p>
//             <div class="contact">
//                 <p>Email: <a href="mailto:info@cybersecurityaudit360.com">info@cybersecurityaudit360.com</a></p>
//                 <p>Website: <a href="https://www.cybersecurityaudit360.com">www.cybersecurityaudit360.com</a></p>
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
//         <style>
//             @page { margin: 0.6in; }
//             body { font-family: Arial, Helvetica, sans-serif; font-size: 12pt; color: #2c3e50; margin: 0; -webkit-print-color-adjust: exact; }
//             .container { padding: 0.6in; box-sizing: border-box; }
//             .cover { text-align: center; padding-top: 20px; padding-bottom: 10px; }
//             .logo { max-width: 140px; margin-bottom: 8px; }
//             h1 { margin: 0; font-size: 28pt; color: #014f65; text-align: center; }
//             h2 { margin: 40px 0 10px 0; font-size: 16pt; color: #014f65; text-align: center; padding-bottom: 5px; }
//             h3 { margin: 25px 0 8px 0; font-size: 14pt; color: #2c3e50; text-align: center; padding-bottom: 3px; }
//             p { margin: 6px 0; line-height: 1.25; }
//             .meta { margin: 12px 0 24px 0; font-size: 14pt; line-height: 1.5; }
//             .meta p { margin: 6px 0; }
//             .for-company { margin-top: 15px; line-height: 1.5; }
//             .cover-quote { margin-top: 12px; font-style: italic; color: #555; max-width: 700px; margin-left: auto; margin-right: auto; line-height: 1.5; }
//             .toc-root { counter-reset: section; }
//             .toc-root > li { counter-increment: section; margin-top: 10px; list-style: none; }
//             .toc-root > li:before { content: counter(section) ". "; font-weight: bold; }
//             .toc-root > li ul { list-style: none; padding-left: 25px; }
//             .toc-root > li li { counter-increment: subsection; }
//             .toc-root > li li:before { content: counter(section) "." counter(subsection) ". "; font-weight: normal; }
//             .toc-root a { text-decoration: none; color: #003340; }
//             .section { margin-top: 20px; }
//             .section-desc, .subsection-desc { font-size: 11pt; color: #444; margin-bottom: 8px; }
//             .question-block { margin-bottom: 12px; padding: 10px; background: #fafafa; border: 1px solid #eee; border-radius: 4px; }
//             .question-header { display: flex; align-items: flex-start; margin-bottom: 6px; }
//             .question-header .question-title { font-size: 11.5pt; margin: 0; padding-left: 10px; }
//             .question-header .line { width: 3px; height: 100%; background-color: #014f65; margin-right: 10px; }
//             .answer-row { margin: 8px 0; font-size: 11pt; }
//             .comment { margin-top: 6px; background:#e6f7f6; padding:6px; border-left:3px solid #014f65; }
//             .evidence ul { margin:4px 0 0 18px; }
//             .env { width: 100%; border-collapse: collapse; margin: 6px 0 12px 0; }
//             .env td { padding: 6px 8px; border: 1px solid #e6e6e6; font-size: 11pt; }
//             .summary { margin:6px 0; padding:8px; background:#f6f6f6; border-radius:4px; }
//             .handover { width: 100%; margin-top: 8px; border-collapse: collapse; }
//             .handover td { padding: 6px; vertical-align: top; }
//             .contact { margin-top: 10px; }
//             .contact a { text-decoration: none; color: #003340; }
//             .slogan-center { text-align: center; margin-top: 18px; font-style: italic; color: #014f65; font-size: 18pt; }
//             a { color: #003340; }
//             .page-break { page-break-before: always; }
//         </style>
//     </head>
//     <body>
//         <div class="container">
//             <div class="cover">
//                 <img class="logo" src="${LOGO_URL}" alt="Logo" />
//                 <div style="margin-top: 30px;">
//                     <h1>${escapeHtml(template.name || 'Name of the audit')}</h1>
//                     <h2>Report</h2>
//                     <div class="meta">
//                         <p><strong>Report Date:</strong> ${escapeHtml(reportDate)}</p>
//                         <p><strong>Audit Date:</strong> ${escapeHtml(auditDateRange)}</p>
//                         <p><strong>Auditor:</strong><br/>${auditorLines}</p>
//                     </div>
//                     <div class="for-company">
//                         <p><strong>For</strong></p>
//                         <p><strong>${escapeHtml(company.name || 'Test company')}</strong></p>
//                         <p>${escapeHtml(contactName || 'Test contact person')} — ${escapeHtml(contactEmail || 'Test contact person email')}</p>
//                     </div>
//                 </div>
//                 <div class="cover-quote">
//                     <p><em>The strength of your defence lies in knowing and understanding your vulnerabilities. This audit provides you with the information you need to create a secure environment in your company. "You can only protect what you know."</em></p>
//                 </div>
//             </div>
//         </div>

//         <div class="container page-break">
//             <h2>Table of Contents</h2>
//             ${tocHtml}
//         </div>

//         <div class="container page-break">
//             <h2>Introduction</h2>
//             ${introductionText}
//         </div>

//         <div class="container page-break">
//             <h2>About the Auditing Company</h2>
//             ${aboutCompanyHardcoded}
//             <h2 style="margin-top: 30px;">About the Audited Company</h2>
//             ${aboutCompanyAudited}
//         </div>

//         <div class="container page-break">
//             <h2>Preface</h2>
//             ${prefaceText}
//             <h2 style="margin-top: 30px;">Disclaimer</h2>
//             ${disclaimerText}
//         </div>

//         <div class="container page-break">
//             <h2>Executive Summary</h2>
//             <p>This report provides a comprehensive overview of the cybersecurity posture for <strong>${escapeHtml(company.name || 'Test Company')}</strong> based on the "<strong>${escapeHtml(template.name || 'Name of the audit')}</strong>".</p>
//             <p>The audit covered key areas including Information Security Policies, Access Control, and other critical domains as defined in the selected template.</p>
//             <p>Overall, the assessment indicates a compliance score of <strong>${Number(overallScore).toFixed(2)}%</strong>. Detailed findings and observations are provided in the subsequent sections, along with specific recommendations for improvement.</p>
//             <p>It is crucial to address identified areas of non-compliance and implement recommended remediation actions to strengthen the overall security posture and ensure continuous adherence to best practices.</p>
//             ${(Array.isArray(summaries) && summaries.length > 0) ? `
//             <h2 style="margin-top: 30px;">Summary</h2>
//             ${summariesHtml}
//             ` : ''}
//         </div>

//         <div class="container page-break">
//             <h2>Examination environment</h2>
//             ${envHtml}
//         </div>

//         <div class="container page-break">
//             <h2>Content</h2>
//             ${mainHtml}
//         </div>

//         <div class="container page-break">
//             <h2>Handover</h2>
//             ${handoverText}
//         </div>

//         <div class="container page-break">
//             <h2>Thank You</h2>
//             ${thankYouText}
//         </div>

//     </body>
//     </html>
//     `;

//     return html;
// };

// export default generateReportHtml;
// export default generateReportHtml; 

// // export default generateReportHtml; 
// const LOGO_URL = 'https://res.cloudinary.com/dcviwtoog/image/upload/v1757777319/DV-Koch-Logo_0225_Logo_Farbe-rgb_bzefrw.jpg';

// /**
//  * Escapes HTML to prevent XSS vulnerabilities.
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
//     if (!d) return null; // Return null if date is not available
//     try {
//         // Return null if date is not a valid date
//         if (isNaN(new Date(d).getTime())) return null;
//         return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
//     } catch {
//         return null;
//     }
// };

// /**
//  * Determine status category and color from a response value.
//  */
// const getStatusInfo = (selectedValue) => {
//     const raw = (selectedValue === undefined || selectedValue === null) ? '' : String(selectedValue).trim().toLowerCase();
//     const color = '#014f65'; // Primary green color

//     // Return the raw value as the label, removing the opinionated logic
//     return { label: raw || 'N/A', color: color };
// };

// /**
//  * Build table of contents HTML from templateStructureSnapshot with numbering
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
//     console.log('[generateReportHtml] Received audit instance:', JSON.stringify({
//         company: auditInstance.company,
//         examinationEnvironment: auditInstance.examinationEnvironment
//     }, null, 2));

//     const company = auditInstance.company || {};
//     const template = auditInstance.template || {};
//     const responses = auditInstance.responses || [];
//     const templateStructure = auditInstance.templateStructureSnapshot || [];
//     const overallScore = (typeof auditInstance.overallScore === 'number') ? auditInstance.overallScore : 0;
//     const createdBy = auditInstance.createdBy || {};
//     const auditorsToDisplay = auditInstance.auditorsToDisplay || [];

//     // Get examination environment data
//     const examinationEnvironment = company.examinationEnvironment || auditInstance.examinationEnvironment || {};

//     console.log('[generateReportHtml] Final examination environment data:', JSON.stringify(examinationEnvironment, null, 2));

//     const summaries = auditInstance.summaries || [];

//     const reportDate = formatDate(new Date());

//     // Corrected Audit Date Range Logic
//     const startDateFormatted = formatDate(auditInstance.startDate);
//     const endDateFormatted = formatDate(auditInstance.endDate);

//     let auditDateRange = 'N/A';
//     if (startDateFormatted && endDateFormatted) {
//         auditDateRange = `${startDateFormatted} - ${endDateFormatted}`;
//     } else if (startDateFormatted) {
//         auditDateRange = startDateFormatted;
//     }
//     // End of Corrected Audit Date Range Logic

//     const auditorLines = auditorsToDisplay.map(u => `${escapeHtml(u.firstName || '')} ${escapeHtml(u.lastName || '')} (${escapeHtml(u.email || '')})`).join('<br/>') || `${escapeHtml(createdBy.firstName || '')} ${escapeHtml(createdBy.lastName || '')} (${escapeHtml(createdBy.email || '')})`;

//     const contactName = company.contactPerson?.name || '';
//     const contactEmail = company.contactPerson?.email || '';

//     const tocHtml = buildToc(templateStructure);

//     let mainHtml = '';
//     templateStructure.forEach((section, sIdx) => {
//         const secId = `sec-${sIdx}`;
//         // Added 'header-spacing' class
//         mainHtml += `<div class="section" id="${secId}"><h2 class="header-spacing">${escapeHtml(section.name || 'Unnamed Section')}</h2>`;
//         if (section.description) {
//             mainHtml += `<p class="section-desc">${escapeHtml(section.description)}</p>`;
//         }

//         (section.subSections || []).forEach((subSection, ssIdx) => {
//             const subId = `sec-${sIdx}-sub-${ssIdx}`;
//             // Added 'header-spacing' class
//             mainHtml += `<div class="subsection" id="${subId}"><h3 class="header-spacing">${escapeHtml(subSection.name || 'Unnamed Subsection')}</h3>`;
//             if (subSection.description) {
//                 mainHtml += `<p class="subsection-desc">${escapeHtml(subSection.description)}</p>`;
//             }

//             (subSection.questions || []).forEach((question, qIdx) => {
//                 const resp = responses.find(r => r.questionId?.toString() === question._id?.toString()) || {};
//                 const status = getStatusInfo(resp.selectedValue);
//                 const answerText = escapeHtml(resp.selectedValue === undefined || resp.selectedValue === null ? 'N/A' : String(resp.selectedValue));
//                 const commentHtml = resp.comment ? `<div class="comment"><strong>Comment:</strong><div>${escapeHtml(resp.comment)}</div></div>` : '';
//                 const evidenceHtml = (Array.isArray(resp.evidenceUrls) && resp.evidenceUrls.length > 0) ? `<div class="evidence"><strong>Evidence:</strong><ul>${resp.evidenceUrls.map(u => `<li><a href="${escapeHtml(u)}">${escapeHtml(u)}</a></li>`).join('')}</ul></div>` : '';
//                 const recommendationHtml = resp.recommendation ? `<div class="recommendation"><strong>Recommendation:</strong><div>${escapeHtml(resp.recommendation)}</div></div>` : '';

//                 mainHtml += `
//                     <div class="question-block">
//                         <div class="question-header" style="border-left:3px solid ${status.color};">
//                             <p class="question-title" style="color:${status.color};"><strong>${escapeHtml(question.text || 'Untitled question')}</strong></p>
                            
//                         </div>
//                         <div class="answer-row"><strong>Answer:</strong> ${answerText}</div>
//                         ${recommendationHtml}
//                         ${commentHtml}
//                         ${evidenceHtml}
//                     </div>
//                 `;
//             });

//             mainHtml += `</div>`;
//         });

//         mainHtml += `</div>`;
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
//         <p class="justify-text static-text">The CyberAudit 360 Check Report has been developed to provide organizations with a structured and independent assessment of their information security posture. The aim is not only to identify technical issues, but to create a holistic view that combines technology, organization, and people.</p>
//         <p class="justify-text static-text">This report is designed as a practical tool for decision-makers at all levels. Whether you have a technical background or not, the findings and recommendations are presented in a way that allows you to clearly understand where strengths lie, where risks exist, and what steps can be taken to achieve sustainable improvement.</p>
//         <p class="justify-text static-text">Our mission is to support organizations in treating cybersecurity as an integral part of their business strategy and daily operations—helping to build trust, ensure compliance, and strengthen resilience in an ever-changing digital world.</p>
//     `;

//     const disclaimerText = `
//         <p class="justify-text static-text">This report is based on the information, data, and evidence made available during the audit process. While every effort has been made to provide accurate and reliable findings, the results and recommendations are limited to the scope of the audit and the time of its execution.</p>
//         <p class="justify-text static-text">The report should not be considered a guarantee against future risks or incidents. Security threats evolve constantly, and continuous monitoring, improvement, and adaptation remain essential.</p>
//         <p class="justify-text static-text">The auditor and auditing organization do not assume liability for direct or indirect damages that may result from the use of this report. The responsibility for implementing and maintaining effective security measures lies with the audited organization.</p>
//     `;

//     const handoverText = `
//         <p class="justify-text static-text">This page confirms that the audit report titled "<strong>${escapeHtml(template.name || 'Name of the audit')}</strong>" has been formally handed over by the auditor to the audited company.</p>
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
//             @page { margin: 0.35in; } /* Slightly reduced margin */
//             body { 
//                 font-family: 'Arial', Helvetica, sans-serif; 
//                 font-size: 14pt; /* Base font size for general content */
//                 color: #2c3e50; 
//                 margin: 0; 
//                 -webkit-print-color-adjust: exact; 
//             } 
//             .container { padding: 0.35in; box-sizing: border-box; }

//             /* ========================================================= */
//             /* Global Styles: Headers and Static Text */
//             /* ========================================================= */

//             /* Lexend Font and 26pt for Headers */
//             h2, .cover-title h1, .cover-title h2 { 
//                 font-family: 'Lexend', sans-serif !important; 
//                 font-size: 26pt !important;
//                 color: #014f65;
//                 text-align: center; 
//             }
//             h3 { 
//                 font-family: 'Lexend', sans-serif !important; 
//                 font-size: 20pt !important; /* Slightly smaller for subsections */
//                 color: #2c3e50;
//                 text-align: left;
//             }

//             /* 16pt Spacing Below Headers */
//             .header-spacing { 
//                 margin-top: 25px !important; /* Ensure separation from preceding content */
//                 margin-bottom: 16px !important; /* 16pts space between header and text */
//                 padding-bottom: 0 !important;
//             }
            
//             /* Line Height 1.5 for all static text */
//             .static-text, .static-text > *, ul li, .justify-text, .cover-quote p { 
//                 line-height: 1.5 !important; 
//             }
//             .justify-text { text-align: justify; }

//             p { margin: 3px 0; line-height: 1.4; } /* Default is tighter, overridden by .static-text */

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

//             /* Cover Meta (First Page Content) - 16pt and 16pt space */
//             .meta { 
//                 margin: 20px 0 30px 0; 
//                 font-size: 16pt; /* 16pt font size */
//                 line-height: 1.5;
//             }
//             .meta p { margin: 16px 0; } /* 16pts space between meta lines */
//             .for-company { 
//                 margin-top: 15px; 
//                 line-height: 1.5; 
//                 font-size: 16pt; /* 16pt font size */
//             }
//             .cover-quote { margin-top: 20px; font-style: italic; color: #555; max-width: 700px; margin-left: auto; margin-right: auto; line-height: 1.5; font-size: 14pt; }


//             /* ========================================================= */
//             /* Content Section Styles (where smaller font is requested) */
//             /* ========================================================= */
            
//             /* TOC Styling */
//             .toc-root { counter-reset: section; padding-left: 0; margin-top: 8px; font-size: 14pt; }
//             .toc-root > li { counter-increment: section; margin-top: 4px; list-style: none; } 
//             .toc-root > li:before { content: counter(section) ". "; font-weight: bold; }
//             .toc-root > li ul { list-style: none; padding-left: 30px; margin-top: 2px; }
//             .toc-root > li li { counter-increment: subsection; margin-top: 2px; }
//             .toc-root > li li:before { content: counter(section) "." counter(subsection) ". "; font-weight: normal; }
//             .toc-root a { text-decoration: none; color: #003340; }
            
//             /* Question/Answer blocks retain original (smaller) font size as requested */
//             .question-block { margin-bottom: 6px; padding: 6px 10px; background: #fafafa; border: 1px solid #eee; border-radius: 4px; }
//             .question-header { display: flex; align-items: flex-start; margin-bottom: 2px; border-left: 3px solid; padding-left: 10px; }
//             .question-header .question-title { font-size: 11pt; margin: 0; font-family: 'Arial', Helvetica, sans-serif !important; }
//             .answer-row { margin: 3px 0; font-size: 11pt; }
//             .comment, .recommendation, .evidence { margin-top: 4px; padding: 5px; border-left: 3px solid #014f65; font-size: 11pt; }
//             .comment { background:#e6f7f6; }
//             .recommendation { background: #f0f8ff; }
//             .evidence { background: #fff8e6; }
//             .evidence ul { margin:3px 0 0 18px; font-size: 11pt; }
//             .section-desc, .subsection-desc { font-size: 12pt; color: #444; margin-bottom: 5px; text-align: justify; }

//             /* Environment Table (smaller font) */
//             .env { width: 100%; border-collapse: collapse; margin: 8px 0 15px 0; table-layout: fixed; }
//             .env td { padding: 5px 8px; border: 1px solid #e6e6e6; font-size: 12pt; } 
//             .env td:first-child { width: 30%; font-weight: bold; background: #f5f5f5; }

//             /* Summary & Handover (smaller font) */
//             .summary { margin:5px 0; padding:8px; background:#f6f6f6; border-radius:4px; font-size: 12pt; } 
//             .handover-heading { margin-bottom: 5px; font-size: 14pt; color: #014f65; text-align: left; font-weight: bold; font-family: 'Arial', Helvetica, sans-serif !important;}
//             .handover-table { width: 100%; margin-top: 5px; border-collapse: collapse; font-size: 12pt; } 
//             .handover-table td { padding: 2px 0; vertical-align: top; width: 16%; }
//             .handover-table td:nth-child(2), .handover-table td:nth-child(4), .handover-table td:nth-child(6) { padding-left: 5px; }
//             .signature-input { display: inline-block; border-bottom: 1px solid #000; width: 85%; height: 1em; } 
//             .signature-line-row { padding-top: 15px !important; }
//             .signature-line { display: inline-block; border-bottom: 1px solid #000; width: 250px; height: 1em; margin-left: 5px;}
//             .handover-section { margin-bottom: 25px; }
            
//             /* Footer/Thank You */
//             .contact { margin-top: 12px; font-size: 14pt; } 
//             .contact a { text-decoration: none; color: #003340; }
//             .slogan-center { text-align: center; margin-top: 25px; font-style: italic; color: #014f65; font-size: 20pt; font-family: 'Lexend', sans-serif !important;}
            
//             /* Utilities */
//             a { color: #003340; }
//             .page-break { page-break-before: always; }
//         </style>
//     </head>
//     <body>
//         <div class="container">
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
//             <p class="justify-text static-text">Overall, the assessment indicates a compliance score of <strong>${Number(overallScore).toFixed(2)}%</strong>. Detailed findings and observations are provided in the subsequent sections, along with specific recommendations for improvement.</p>
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
//             <h2 class="header-spacing">Thank You</h2>
//             ${thankYouText}
//         </div>

//     </body>
//     </html>
//     `;

//     return html;
// };

// export default generateReportHtml; 

// const LOGO_URL = 'https://res.cloudinary.com/dcviwtoog/image/upload/v1757777319/DV-Koch-Logo_0225_Logo_Farbe-rgb_bzefrw.jpg';

// /**
//  * Escapes HTML to prevent XSS vulnerabilities.
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
//     if (!d) return 'N/A';
//     try {
//         return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
//     } catch {
//         return String(d);
//     }
// };

// /**
//  * Determine status category and color from a response value.
//  */
// const getStatusInfo = (selectedValue) => {
//     const raw = (selectedValue === undefined || selectedValue === null) ? '' : String(selectedValue).trim().toLowerCase();
//     const color = '#014f65'; // Primary green color

//     // Return the raw value as the label, removing the opinionated logic
//     return { label: raw || 'N/A', color: color };
// };

// /**
//  * Build table of contents HTML from templateStructureSnapshot with numbering
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
//     console.log('[generateReportHtml] Received audit instance:', JSON.stringify({
//         company: auditInstance.company,
//         examinationEnvironment: auditInstance.examinationEnvironment
//     }, null, 2));

//     const company = auditInstance.company || {};
//     const template = auditInstance.template || {};
//     const responses = auditInstance.responses || [];
//     const templateStructure = auditInstance.templateStructureSnapshot || [];
//     const overallScore = (typeof auditInstance.overallScore === 'number') ? auditInstance.overallScore : 0;
//     const createdBy = auditInstance.createdBy || {};
//     const auditorsToDisplay = auditInstance.auditorsToDisplay || [];

//     // Get examination environment data
//     const examinationEnvironment = company.examinationEnvironment || auditInstance.examinationEnvironment || {};

//     console.log('[generateReportHtml] Final examination environment data:', JSON.stringify(examinationEnvironment, null, 2));

//     const summaries = auditInstance.summaries || [];

//     const reportDate = formatDate(new Date());
//     const auditDateRange = (auditInstance.startDate || auditInstance.endDate) ?
//         `${formatDate(auditInstance.startDate)} - ${formatDate(auditInstance.endDate)}` : 'N/A';

//     const auditorLines = auditorsToDisplay.map(u => `${escapeHtml(u.firstName || '')} ${escapeHtml(u.lastName || '')} (${escapeHtml(u.email || '')})`).join('<br/>') || `${escapeHtml(createdBy.firstName || '')} ${escapeHtml(createdBy.lastName || '')} (${escapeHtml(createdBy.email || '')})`;

//     const contactName = company.contactPerson?.name || '';
//     const contactEmail = company.contactPerson?.email || '';

//     const tocHtml = buildToc(templateStructure);

//     let mainHtml = '';
//     templateStructure.forEach((section, sIdx) => {
//         const secId = `sec-${sIdx}`;
//         mainHtml += `<div class="section" id="${secId}"><h2>${escapeHtml(section.name || 'Unnamed Section')}</h2>`;
//         if (section.description) {
//             mainHtml += `<p class="section-desc">${escapeHtml(section.description)}</p>`;
//         }

//         (section.subSections || []).forEach((subSection, ssIdx) => {
//             const subId = `sec-${sIdx}-sub-${ssIdx}`;
//             mainHtml += `<div class="subsection" id="${subId}"><h3>${escapeHtml(subSection.name || 'Unnamed Subsection')}</h3>`;
//             if (subSection.description) {
//                 mainHtml += `<p class="subsection-desc">${escapeHtml(subSection.description)}</p>`;
//             }

//             (subSection.questions || []).forEach((question, qIdx) => {
//                 const resp = responses.find(r => r.questionId?.toString() === question._id?.toString()) || {};
//                 const status = getStatusInfo(resp.selectedValue);
//                 const answerText = escapeHtml(resp.selectedValue === undefined || resp.selectedValue === null ? 'N/A' : String(resp.selectedValue));
//                 const commentHtml = resp.comment ? `<div class="comment"><strong>Comment:</strong><div>${escapeHtml(resp.comment)}</div></div>` : '';
//                 const evidenceHtml = (Array.isArray(resp.evidenceUrls) && resp.evidenceUrls.length > 0) ? `<div class="evidence"><strong>Evidence:</strong><ul>${resp.evidenceUrls.map(u => `<li><a href="${escapeHtml(u)}">${escapeHtml(u)}</a></li>`).join('')}</ul></div>` : '';
//                 const recommendationHtml = resp.recommendation ? `<div class="recommendation"><strong>Recommendation:</strong><div>${escapeHtml(resp.recommendation)}</div></div>` : '';

//                 mainHtml += `
//                     <div class="question-block">
//                         <div class="question-header" style="border-left:3px solid ${status.color};">
//                             <p class="question-title" style="color:${status.color};"><strong>${escapeHtml(question.text || 'Untitled question')}</strong></p>
                            
//                         </div>
//                         <div class="answer-row"><strong>Answer:</strong> ${answerText}</div>
//                         ${recommendationHtml}
//                         ${commentHtml}
//                         ${evidenceHtml}
//                     </div>
//                 `;
//             });

//             mainHtml += `</div>`;
//         });

//         mainHtml += `</div>`;
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
//         : '<p>No summaries provided.</p>';

//     const introductionText = `
//         <p>When we speak about Cyber, Information, and IT Security, it is important to recognize that it is not only a technical matter. Technology plays a key role, but security is always the result of three dimensions working together:</p>
//         <ul>
//             <li><strong>Technology</strong> – the tools and systems that protect our data.</li>
//             <li><strong>Organization</strong> – the rules, processes, and responsibilities that guide how we work.</li>
//             <li><strong>People</strong> – the awareness, behavior, and decisions of everyone involved.</li>
//         </ul>
//         <p>Only when these three elements are combined can we create real protection. Focusing on technology alone is not enough. A secure company requires clear structures, well-trained employees, and a culture where security is seen as part of everyday work.</p>
//         <p>In today's ever-changing world, the importance of protecting data and systems continues to grow. New threats appear daily, and digitalization increases the complexity of our business environment. For this reason, security must be given the right priority. It should not be treated as an "add-on" or a last step, but as an integral part of every decision, process, and investment.</p>
//         <p>This audit report is designed to make this approach practical and understandable. It gives a transparent overview of your current situation, highlights strengths and weaknesses, and provides clear guidance for next steps. The goal is not only to identify risks but also to enable your organization to build sustainable protection—so that technology, organization, and people are aligned and your company can continue to operate with confidence and resilience.</p>
//     `;

//     const aboutCompanyAudited = `
//         <p>As a prominent player in the <strong>${escapeHtml(company.industry || '')}</strong> industry, <strong>${escapeHtml(company.name || 'Test company')}</strong> has shown a strong commitment to maintaining a secure and reliable operational environment. Our audit was conducted to assess their current security posture, providing a detailed overview of their defenses and identifying key areas for continuous improvement. This assessment highlights their dedication to protecting their digital assets and fostering a resilient business infrastructure.</p>
//         <p><strong>Contact person:</strong> ${escapeHtml(contactName || '')} — ${escapeHtml(contactEmail || '')}</p>
//         ${company.generalInfo || company.examinationEnvironment?.generalInfo ? `<p>${escapeHtml(company.generalInfo || company.examinationEnvironment?.generalInfo)}</p>` : ''}
//     `;

//     const aboutCompanyHardcoded = `
//         <p>We, DV-Beratung Koch, are your reliable partner and system house for information technology, telecommunications and video surveillance. Since 1993, we have been successfully implementing IT projects in the areas of government, healthcare and small and medium-sized enterprises.</p>
//         <p>Over the years, our product and service portfolio has been continuously adapted and expanded in line with technological developments. Our aim is to offer you a comprehensive range of IT solutions from a single source, including perfectly coordinated hardware and software for your company.</p>
//         <p>Through continuous training of our team, we ensure that our expert knowledge is always up to date in order to guarantee you modern IT consulting and implementation. We look forward to starting a successful and cooperative partnership with you.</p>
//     `;

//     const prefaceText = `
//         <p>The CyberAudit 360 Check Report has been developed to provide organizations with a structured and independent assessment of their information security posture. The aim is not only to identify technical issues, but to create a holistic view that combines technology, organization, and people.</p>
//         <p>This report is designed as a practical tool for decision-makers at all levels. Whether you have a technical background or not, the findings and recommendations are presented in a way that allows you to clearly understand where strengths lie, where risks exist, and what steps can be taken to achieve sustainable improvement.</p>
//         <p>Our mission is to support organizations in treating cybersecurity as an integral part of their business strategy and daily operations—helping to build trust, ensure compliance, and strengthen resilience in an ever-changing digital world.</p>
//     `;

//     const disclaimerText = `
//         <p>This report is based on the information, data, and evidence made available during the audit process. While every effort has been made to provide accurate and reliable findings, the results and recommendations are limited to the scope of the audit and the time of its execution.</p>
//         <p>The report should not be considered a guarantee against future risks or incidents. Security threats evolve constantly, and continuous monitoring, improvement, and adaptation remain essential.</p>
//         <p>The auditor and auditing organization do not assume liability for direct or indirect damages that may result from the use of this report. The responsibility for implementing and maintaining effective security measures lies with the audited organization.</p>
//     `;

//     const handoverText = `
//         <p>This page confirms that the audit report titled "${escapeHtml(template.name || 'Name of the audit')}" has been formally handed over by the auditor to the audited company.</p>
//         <p>By signing below, both parties acknowledge the reception of the full audit report and confirm that it has been delivered in its final version.</p>

//         <table class="handover">
//             <tr><td><strong>Auditor:</strong></td><td></td></tr>
//             <tr><td>Name:</td><td>_________________________</td></tr>
//             <tr><td>Organization:</td><td>_________________________</td></tr>
//             <tr><td>Date:</td><td>_________________________</td></tr>
//             <tr><td>Signature:</td><td>_________________________</td></tr>
//         </table>

//         <br/>

//         <table class="handover">
//             <tr><td><strong>Audited Company Representative:</strong></td><td></td></tr>
//             <tr><td>Name:</td><td>_________________________</td></tr>
//             <tr><td>Organization:</td><td>_________________________</td></tr>
//             <tr><td>Date:</td><td>_________________________</td></tr>
//             <tr><td>Signature:</td><td>_________________________</td></tr>
//         </table>
//     `;

//     const thankYouText = `
//         <div style="text-align: center;">
//             <p>Thank You for Choosing Cybersecurity Audit 360</p>
//             <p>We are committed to enhancing your organization's security posture and ensuring compliance in an ever evolving threat landscape. This report serves as a foundational step towards a more resilient and secure future.</p>
//             <p>Our team is dedicated to supporting your journey beyond this audit. We encourage you to review the findings and recommendations carefully and reach out to us for any clarifications or assistance in implementing the suggested improvements.</p>
//             <div class="contact">
//                 <p>Email: <a href="mailto:info@cybersecurityaudit360.com">info@cybersecurityaudit360.com</a></p>
//                 <p>Website: <a href="https://www.cybersecurityaudit360.com">www.cybersecurityaudit360.com</a></p>
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
//         <style>
//             @page { margin: 0.6in; }
//             body { font-family: Arial, Helvetica, sans-serif; font-size: 12pt; color: #2c3e50; margin: 0; -webkit-print-color-adjust: exact; }
//             .container { padding: 0.6in; box-sizing: border-box; }
//             .cover { text-align: center; padding-top: 20px; padding-bottom: 10px; }
//             .logo { max-width: 140px; margin-bottom: 8px; }
//             h1 { margin: 0; font-size: 28pt; color: #014f65; text-align: center; }
//             h2 { margin: 40px 0 10px 0; font-size: 16pt; color: #014f65; text-align: center; padding-bottom: 5px; }
//             h3 { margin: 25px 0 8px 0; font-size: 14pt; color: #2c3e50; text-align: center; padding-bottom: 3px; }
//             p { margin: 6px 0; line-height: 1.25; }
//             .meta { margin: 12px 0 24px 0; font-size: 14pt; line-height: 1.5; }
//             .meta p { margin: 6px 0; }
//             .for-company { margin-top: 15px; line-height: 1.5; }
//             .cover-quote { margin-top: 12px; font-style: italic; color: #555; max-width: 700px; margin-left: auto; margin-right: auto; line-height: 1.5; }
//             .toc-root { counter-reset: section; }
//             .toc-root > li { counter-increment: section; margin-top: 10px; list-style: none; }
//             .toc-root > li:before { content: counter(section) ". "; font-weight: bold; }
//             .toc-root > li ul { list-style: none; padding-left: 25px; }
//             .toc-root > li li { counter-increment: subsection; }
//             .toc-root > li li:before { content: counter(section) "." counter(subsection) ". "; font-weight: normal; }
//             .toc-root a { text-decoration: none; color: #003340; }
//             .section { margin-top: 20px; }
//             .section-desc, .subsection-desc { font-size: 11pt; color: #444; margin-bottom: 8px; }
//             .question-block { margin-bottom: 12px; padding: 10px; background: #fafafa; border: 1px solid #eee; border-radius: 4px; }
//             .question-header { display: flex; align-items: flex-start; margin-bottom: 6px; }
//             .question-header .question-title { font-size: 11.5pt; margin: 0; padding-left: 10px; }
//             .question-header .line { width: 3px; height: 100%; background-color: #014f65; margin-right: 10px; }
//             .answer-row { margin: 8px 0; font-size: 11pt; }
//             .comment { margin-top: 6px; background:#e6f7f6; padding:6px; border-left:3px solid #014f65; }
//             .evidence ul { margin:4px 0 0 18px; }
//             .env { width: 100%; border-collapse: collapse; margin: 6px 0 12px 0; }
//             .env td { padding: 6px 8px; border: 1px solid #e6e6e6; font-size: 11pt; }
//             .summary { margin:6px 0; padding:8px; background:#f6f6f6; border-radius:4px; }
//             .handover { width: 100%; margin-top: 8px; border-collapse: collapse; }
//             .handover td { padding: 6px; vertical-align: top; }
//             .contact { margin-top: 10px; }
//             .contact a { text-decoration: none; color: #003340; }
//             .slogan-center { text-align: center; margin-top: 18px; font-style: italic; color: #014f65; font-size: 18pt; }
//             a { color: #003340; }
//             .page-break { page-break-before: always; }
//         </style>
//     </head>
//     <body>
//         <div class="container">
//             <div class="cover">
//                 <img class="logo" src="${LOGO_URL}" alt="Logo" />
//                 <div style="margin-top: 30px;">
//                     <h1>${escapeHtml(template.name || 'Name of the audit')}</h1>
//                     <h2>Report</h2>
//                     <div class="meta">
//                         <p><strong>Report Date:</strong> ${escapeHtml(reportDate)}</p>
//                         <p><strong>Audit Date:</strong> ${escapeHtml(auditDateRange)}</p>
//                         <p><strong>Auditor:</strong><br/>${auditorLines}</p>
//                     </div>
//                     <div class="for-company">
//                         <p><strong>For</strong></p>
//                         <p><strong>${escapeHtml(company.name || 'Test company')}</strong></p>
//                         <p>${escapeHtml(contactName || 'Test contact person')} — ${escapeHtml(contactEmail || 'Test contact person email')}</p>
//                     </div>
//                 </div>
//                 <div class="cover-quote">
//                     <p><em>The strength of your defence lies in knowing and understanding your vulnerabilities. This audit provides you with the information you need to create a secure environment in your company. "You can only protect what you know."</em></p>
//                 </div>
//             </div>
//         </div>

//         <div class="container page-break">
//             <h2>Table of Contents</h2>
//             ${tocHtml}
//         </div>

//         <div class="container page-break">
//             <h2>Introduction</h2>
//             ${introductionText}
//         </div>

//         <div class="container page-break">
//             <h2>About the Auditing Company</h2>
//             ${aboutCompanyHardcoded}
//             <h2 style="margin-top: 30px;">About the Audited Company</h2>
//             ${aboutCompanyAudited}
//         </div>

//         <div class="container page-break">
//             <h2>Preface</h2>
//             ${prefaceText}
//             <h2 style="margin-top: 30px;">Disclaimer</h2>
//             ${disclaimerText}
//         </div>

//         <div class="container page-break">
//             <h2>Executive Summary</h2>
//             <p>This report provides a comprehensive overview of the cybersecurity posture for <strong>${escapeHtml(company.name || 'Test Company')}</strong> based on the "<strong>${escapeHtml(template.name || 'Name of the audit')}</strong>".</p>
//             <p>The audit covered key areas including Information Security Policies, Access Control, and other critical domains as defined in the selected template.</p>
//             <p>Overall, the assessment indicates a compliance score of <strong>${Number(overallScore).toFixed(2)}%</strong>. Detailed findings and observations are provided in the subsequent sections, along with specific recommendations for improvement.</p>
//             <p>It is crucial to address identified areas of non-compliance and implement recommended remediation actions to strengthen the overall security posture and ensure continuous adherence to best practices.</p>
//             ${(Array.isArray(summaries) && summaries.length > 0) ? `
//             <h2 style="margin-top: 30px;">Summary</h2>
//             ${summariesHtml}
//             ` : ''}
//         </div>

//         <div class="container page-break">
//             <h2>Examination environment</h2>
//             ${envHtml}
//         </div>

//         <div class="container page-break">
//             <h2>Content</h2>
//             ${mainHtml}
//         </div>

//         <div class="container page-break">
//             <h2>Handover</h2>
//             ${handoverText}
//         </div>

//         <div class="container page-break">
//             <h2>Thank You</h2>
//             ${thankYouText}
//         </div>

//     </body>
//     </html>
//     `;

//     return html;
// };

// // export default generateReportHtml;
 
// const LOGO_URL = 'https://res.cloudinary.com/dcviwtoog/image/upload/v1757777319/DV-Koch-Logo_0225_Logo_Farbe-rgb_bzefrw.jpg';

// /**
//  * Escapes HTML to prevent XSS vulnerabilities.
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
//     if (!d) return 'N/A';
//     try {
//         return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
//     } catch {
//         return String(d);
//     }
// };

// /**
//  * Determine status category and color from a response value.
//  */
// const getStatusInfo = (selectedValue) => {
//     const raw = (selectedValue === undefined || selectedValue === null) ? '' : String(selectedValue).trim().toLowerCase();
//     const color = '#014f65'; // Primary green color
//     return { label: raw || 'N/A', color: color };
// };

// /**
//  * Build table of contents HTML from templateStructureSnapshot without custom numbering
//  */
// const buildToc = (templateStructure) => {
//     if (!Array.isArray(templateStructure) || templateStructure.length === 0) return '<p>(No content)</p>';
//     let tocHtml = '<ul class="toc-root">';
//     templateStructure.forEach((section, sIdx) => {
//         const secId = `sec-${sIdx}`;
//         // Removed underline via CSS change to 'a' tag
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
//     const company = auditInstance.company || {};
//     const template = auditInstance.template || {};
//     const responses = auditInstance.responses || [];
//     const templateStructure = auditInstance.templateStructureSnapshot || [];
//     const overallScore = (typeof auditInstance.overallScore === 'number') ? auditInstance.overallScore : 0;
//     const createdBy = auditInstance.createdBy || {};
//     const auditorsToDisplay = auditInstance.auditorsToDisplay || [];

//     // 1. Overall Score Fix: Round to nearest whole number
//     const roundedOverallScore = Math.round(overallScore); 

//     // Get examination environment data
//     const examinationEnvironment = company.examinationEnvironment || auditInstance.examinationEnvironment || {};

//     const summaries = auditInstance.summaries || [];

//     const reportDate = formatDate(new Date());

//     // 2. Audit Date Range Fix: Handle missing end date gracefully
//     let auditDateRange;
//     const start = auditInstance.startDate;
//     const end = auditInstance.endDate;

//     if (start && end) {
//         auditDateRange = `${formatDate(start)} - ${formatDate(end)}`;
//     } else if (start) {
//         auditDateRange = formatDate(start);
//     } else if (end) {
//         auditDateRange = formatDate(end);
//     } else {
//         auditDateRange = 'N/A';
//     }


//     const auditorLines = auditorsToDisplay.map(u => `${escapeHtml(u.firstName || '')} ${escapeHtml(u.lastName || '')} (${escapeHtml(u.email || '')})`).join('<br/>') || `${escapeHtml(createdBy.firstName || '')} ${escapeHtml(createdBy.lastName || '')} (${escapeHtml(createdBy.email || '')})`;

//     const contactName = company.contactPerson?.name || '';
//     const contactEmail = company.contactPerson?.email || '';

//     const tocHtml = buildToc(templateStructure);

//     let mainHtml = '';
//     templateStructure.forEach((section, sIdx) => {
//         const secId = `sec-${sIdx}`;
//         // Use H2 for main section headers, using .content-header which now lacks a border
//         mainHtml += `<div class="section" id="${secId}"><h2 class="content-header">${escapeHtml(section.name || 'Unnamed Section')}</h2>`;
//         if (section.description) {
//             mainHtml += `<p class="section-desc">${escapeHtml(section.description)}</p>`;
//         }

//         (section.subSections || []).forEach((subSection, ssIdx) => {
//             const subId = `sec-${sIdx}-sub-${ssIdx}`;
//             // Use H3 for sub-section headers
//             mainHtml += `<div class="subsection" id="${subId}"><h3>${escapeHtml(subSection.name || 'Unnamed Subsection')}</h3>`;
//             if (subSection.description) {
//                 mainHtml += `<p class="subsection-desc">${escapeHtml(subSection.description)}</p>`;
//             }

//             (subSection.questions || []).forEach((question, qIdx) => {
//                 const resp = responses.find(r => r.questionId?.toString() === question._id?.toString()) || {};
//                 const status = getStatusInfo(resp.selectedValue);
//                 const answerText = escapeHtml(resp.selectedValue === undefined || resp.selectedValue === null ? 'N/A' : String(resp.selectedValue));
//                 const commentHtml = resp.comment ? `<div class="comment"><strong>Comment:</strong><div>${escapeHtml(resp.comment)}</div></div>` : '';
//                 const evidenceHtml = (Array.isArray(resp.evidenceUrls) && resp.evidenceUrls.length > 0) ? `<div class="evidence"><strong>Evidence:</strong><ul>${resp.evidenceUrls.map(u => `<li><a href="${escapeHtml(u)}">${escapeHtml(u)}</a></li>`).join('')}</ul></div>` : '';
//                 const recommendationHtml = resp.recommendation ? `<div class="recommendation"><strong>Recommendation:</strong><div>${escapeHtml(resp.recommendation)}</div></div>` : '';

//                 mainHtml += `
//                     <div class="question-block">
//                         <div class="question-header" style="border-left:3px solid ${status.color};">
//                             <p class="question-title" style="color:${status.color};"><strong>${escapeHtml(question.text || 'Untitled question')}</strong></p>
                            
//                         </div>
//                         <div class="answer-row"><strong>Answer:</strong> ${answerText}</div>
//                         ${recommendationHtml}
//                         ${commentHtml}
//                         ${evidenceHtml}
//                     </div>
//                 `;
//             });

//             mainHtml += `</div>`;
//         });

//         mainHtml += `</div>`;
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
//         : ''; // No HTML if no summaries

//     const introductionText = `
//         <p>When we speak about Cyber, Information, and IT Security, it is important to recognize that it is not only a technical matter. Technology plays a key role, but security is always the result of three dimensions working together:</p>
//         <ul>
//             <li><strong>Technology</strong> – the tools and systems that protect our data.</li>
//             <li><strong>Organization</strong> – the rules, processes, and responsibilities that guide how we work.</li>
//             <li><strong>People</strong> – the awareness, behavior, and decisions of everyone involved.</li>
//         </ul>
//         <p>Only when these three elements are combined can we create real protection. Focusing on technology alone is not enough. A secure company requires clear structures, well-trained employees, and a culture where security is seen as part of everyday work.</p>
//         <p>In today's ever-changing world, the importance of protecting data and systems continues to grow. New threats appear daily, and digitalization increases the complexity of our business environment. For this reason, security must be given the right priority. It should not be treated as an "add-on" or a last step, but as an integral part of every decision, process, and investment.</p>
//         <p>This audit report is designed to make this approach practical and understandable. It gives a transparent overview of your current situation, highlights strengths and weaknesses, and provides clear guidance for next steps. The goal is not only to identify risks but also to enable your organization to build sustainable protection—so that technology, organization, and people are aligned and your company can continue to operate with confidence and resilience.</p>
//     `;

//     const aboutCompanyAudited = `
//         <p>As a prominent player in the <strong>${escapeHtml(company.industry || '')}</strong> industry, <strong>${escapeHtml(company.name || 'Test company')}</strong> has shown a strong commitment to maintaining a secure and reliable operational environment. Our audit was conducted to assess their current security posture, providing a detailed overview of their defenses and identifying key areas for continuous improvement. This assessment highlights their dedication to protecting their digital assets and fostering a resilient business infrastructure.</p>
//         <p><strong>Contact person:</strong> ${escapeHtml(contactName || '')} — ${escapeHtml(contactEmail || '')}</p>
//         ${company.generalInfo || company.examinationEnvironment?.generalInfo ? `<p>${escapeHtml(company.generalInfo || company.examinationEnvironment?.generalInfo)}</p>` : ''}
//     `;

//     const aboutCompanyHardcoded = `
//         <p>We, DV-Beratung Koch, are your reliable partner and system house for information technology, telecommunications and video surveillance. Since 1993, we have been successfully implementing IT projects in the areas of government, healthcare and small and medium-sized enterprises.</p>
//         <p>Over the years, our product and service portfolio has been continuously adapted and expanded in line with technological developments. Our aim is to offer you a comprehensive range of IT solutions from a single source, including perfectly coordinated hardware and software for your company.</p>
//         <p>Through continuous training of our team, we ensure that our expert knowledge is always up to date in order to guarantee you modern IT consulting and implementation. We look forward to starting a successful and cooperative partnership with you.</p>
//     `;

//     const prefaceText = `
//         <p>The CyberAudit 360 Check Report has been developed to provide organizations with a structured and independent assessment of their information security posture. The aim is not only to identify technical issues, but to create a holistic view that combines technology, organization, and people.</p>
//         <p>This report is designed as a practical tool for decision-makers at all levels. Whether you have a technical background or not, the findings and recommendations are presented in a way that allows you to clearly understand where strengths lie, where risks exist, and what steps can be taken to achieve sustainable improvement.</p>
//         <p>Our mission is to support organizations in treating cybersecurity as an integral part of their business strategy and daily operations—helping to build trust, ensure compliance, and strengthen resilience in an ever-changing digital world.</p>
//     `;

//     const disclaimerText = `
//         <p>This report is based on the information, data, and evidence made available during the audit process. While every effort has been made to provide accurate and reliable findings, the results and recommendations are limited to the scope of the audit and the time of its execution.</p>
//         <p>The report should not be considered a guarantee against future risks or incidents. Security threats evolve constantly, and continuous monitoring, improvement, and adaptation remain essential.</p>
//         <p>The auditor and auditing organization do not assume liability for direct or indirect damages that may result from the use of this report. The responsibility for implementing and maintaining effective security measures lies with the audited organization.</p>
//     `;

//     const executiveSummaryContent = `
//         <p>This report provides a comprehensive overview of the cybersecurity posture for <strong>${escapeHtml(company.name || 'Test Company')}</strong> based on the "<strong>${escapeHtml(template.name || 'Name of the audit')}</strong>".</p>
//         <p>The audit covered key areas including Information Security Policies, Access Control, and other critical domains as defined in the selected template.</p>
//         <p>Overall, the assessment indicates a compliance score of <strong>${roundedOverallScore}%</strong>. Detailed findings and observations are provided in the subsequent sections, along with specific recommendations for improvement.</p>
//         <p>It is crucial to address identified areas of non-compliance and implement recommended remediation actions to strengthen the overall security posture and ensure continuous adherence to best practices.</p>
        
//         ${summariesHtml ? `<h2 style="margin-top: 30px;">Summary</h2>${summariesHtml}` : ''}
//     `;

//     const handoverText = `
//         <p>This page confirms that the audit report titled "${escapeHtml(template.name || 'Name of the audit')}" has been formally handed over by the auditor to the audited company.</p>
//         <p>By signing below, both parties acknowledge the reception of the full audit report and confirm that it has been delivered in its final version.</p>

//         <table class="handover">
//             <tr><td><strong>Auditor:</strong></td><td></td></tr>
//             <tr><td>Name:</td><td>_________________________</td></tr>
//             <tr><td>Organization:</td><td>_________________________</td></tr>
//             <tr><td>Date:</td><td>_________________________</td></tr>
//             <tr><td>Signature:</td><td>_________________________</td></tr>
//         </table>

//         <br/>

//         <table class="handover">
//             <tr><td><strong>Audited Company Representative:</strong></td><td></td></tr>
//             <tr><td>Name:</td><td>_________________________</td></tr>
//             <tr><td>Organization:</td><td>_________________________</td></tr>
//             <tr><td>Date:</td><td>_________________________</td></tr>
//             <tr><td>Signature:</td><td>_________________________</td></tr>
//         </table>
//     `;

//     const thankYouText = `
//         <div style="text-align: center;">
//             <p>Thank You for Choosing Cybersecurity Audit 360</p>
//             <p>We are committed to enhancing your organization's security posture and ensuring compliance in an ever evolving threat landscape. This report serves as a foundational step towards a more resilient and secure future.</p>
//             <p>Our team is dedicated to supporting your journey beyond this audit. We encourage you to review the findings and recommendations carefully and reach out to us for any clarifications or assistance in implementing the suggested improvements.</p>
//             <div class="contact">
//                 <p>Email: <a href="mailto:info@cybersecurityaudit360.com">info@cybersecurityaudit360.com</a></p>
//                 <p>Website: <a href="https://www.cybersecurityaudit360.com">www.cybersecurityaudit360.com</a></p>
//             </div>
//             <h3 class="slogan-center">"Securing Your Digital Horizon, Together."</h3>
//         </div>
//     `;

//     // HTML Structure and Styles
//     const html = `
//     <!doctype html>
//     <html>
//     <head>
//         <meta charset="utf-8">
//         <title>Audit Report - ${escapeHtml(company.name || 'Unknown Company')}</title>
//         <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
//         <style>
//             /* Printing and Layout Adjustments */
//             @page { 
//                 margin: 0.6in; 
//                 size: A4;
//             }
//             html, body { 
//                 margin: 0; 
//                 padding: 0; 
//                 width: 100%; 
//                 box-sizing: border-box; 
//             }
//             body { 
//                 font-family: 'Lexend', Arial, Helvetica, sans-serif; 
//                 font-size: 12pt; 
//                 color: #2c3e50; 
//                 -webkit-print-color-adjust: exact; 
//                 padding-top: 0; 
//             }
            
//             /* Container for page content and footer */
//             .page-wrapper {
//                 min-height: 100vh; 
//                 height: 100%; 
//                 position: relative;
//                 padding-bottom: 0.4in; 
//             }

//             .container { 
//                 padding: 0.6in; 
//                 box-sizing: border-box;
//                 padding-bottom: 0.8in; 
//             }

//             /* Cover Page Styles */
//             .cover { 
//                 text-align: center; 
//                 padding-top: 20px; 
//                 padding-bottom: 10px; 
//                 height: 100%; 
//                 display: flex;
//                 flex-direction: column;
//                 justify-content: center; 
//             }
//             .logo { 
//                 max-width: 300px; /* INCREASED logo size and centered */
//                 margin: 0 auto 15px auto; 
//                 display: block;
//             }
            
//             /* Headers */
//             h1 { 
//                 margin: 0; 
//                 font-size: 40pt; 
//                 color: #014f65; 
//                 text-align: center; 
//                 font-weight: 700; 
//             }
//             h2 { 
//                 margin: 40px 0 10px 0; 
//                 font-size: 20pt; 
//                 color: #014f65; 
//                 text-align: center; 
//                 padding-bottom: 5px; 
//                 font-weight: 700;
//             }
//             /* Content H2 - Main Section Headers - LINE REMOVED */
//             .content-header { 
//                 margin: 0; 
//                 font-size: 20pt; 
//                 color: #014f65; 
//                 text-align: center; 
//                 padding-bottom: 5px; 
//                 font-weight: 700;
//                 /* line removed: border-bottom: none; */
//             }
//             h3 { 
//                 margin: 25px 0 8px 0; 
//                 font-size: 16pt; 
//                 color: #2c3e50; 
//                 text-align: left; 
//                 padding-bottom: 3px; 
//                 font-weight: 700;
//             }
//             p { 
//                 margin: 8px 0; 
//                 line-height: 1.4; 
//             }
            
//             /* Cover Metadata */
//             .meta { 
//                 margin: 15px 0 30px 0; 
//                 font-size: 16pt; 
//                 line-height: 1.6; 
//             }
//             .meta p { margin: 8px 0; }
//             .for-company { margin-top: 20px; line-height: 1.6; }
//             .cover-quote { margin-top: 15px; font-style: italic; color: #555; max-width: 700px; margin-left: auto; margin-right: auto; line-height: 1.5; font-size: 14pt; } /* Maintained size for impact */

//             /* Table of Contents - Remove automatic numbering and link underlines */
//             ul { margin: 10px 0 20px 0; padding-left: 0; }
//             ul li { list-style-type: none; margin-left: 0; }
//             .toc-root { counter-reset: none; list-style-type: none; padding-left: 0; }
//             .toc-root > li { margin-top: 8px; list-style: none; padding-left: 0; font-size: 14pt; }
//             .toc-root > li:before { content: none; } 
//             .toc-root > li ul { list-style: none; padding-left: 20px; }
//             .toc-root > li li { counter-increment: none; font-size: 12pt; margin-top: 4px; }
//             .toc-root > li li:before { content: none; } 
//             .toc-root a { text-decoration: none; color: #003340; } /* Specific TOC link styling */

//             /* Content Sections */
//             .section { margin-top: 40px; }
//             .subsection { margin-top: 25px; }
//             .section-desc, .subsection-desc { font-size: 11pt; color: #444; margin-bottom: 8px; }
//             .question-block { margin-bottom: 15px; padding: 12px; background: #fafafa; border: 1px solid #eee; border-radius: 4px; }
//             .question-header { display: flex; align-items: flex-start; margin-bottom: 6px; }
//             .question-header .question-title { font-size: 12pt; margin: 0; padding-left: 10px; line-height: 1.3; }
//             .answer-row { margin: 8px 0; font-size: 11.5pt; }
//             .comment, .recommendation { margin-top: 8px; background:#e6f7f6; padding:8px; border-left:3px solid #014f65; font-size: 11pt; }
//             .evidence { margin-top: 8px; font-size: 11pt; }
//             .evidence ul { margin:4px 0 0 18px; }
//             .env { width: 100%; border-collapse: collapse; margin: 10px 0 15px 0; }
//             .env td { padding: 8px 10px; border: 1px solid #e6e6e6; font-size: 11.5pt; }
//             .summary { margin:8px 0; padding:10px; background:#f6f6f6; border-radius:4px; font-size: 11.5pt; }
//             .handover { width: 100%; margin-top: 15px; border-collapse: collapse; }
//             .handover td { padding: 8px; vertical-align: top; }
//             .contact { margin-top: 15px; font-size: 14pt; }
            
//             /* Global link styling: Removed underline */
//             a { text-decoration: none; color: #003340; }

//             .slogan-center { text-align: center; margin-top: 25px; font-style: italic; color: #014f65; font-size: 20pt; }

//             /* Page Break and Alignment */
//             .page-break { 
//                 page-break-before: always; 
//                 margin: 0;
//             }
//             .page-break:first-child { 
//                 page-break-before: auto; 
//             }
            
//             /* Static Content Text Font Size Reduced */
//             .static-content-page p, .static-content-page ul li {
//                 font-size: 12pt; /* Reduced font size for static text */
//                 line-height: 1.5;
//             }

//             /* Page Numbering Footer */
//             @page {
//                 @bottom-center {
//                     content: counter(page) "/" counter(pages);
//                     font-family: 'Lexend', Arial, Helvetica, sans-serif;
//                     font-size: 10pt;
//                     color: #555;
//                 }
//             }
//         </style>
//     </head>
//     <body>
//         <div class="page-wrapper">
//             <div class="container cover">
//                 <img class="logo" src="${LOGO_URL}" alt="Logo" />
//                 <div style="margin-top: 30px;">
//                     <h1>${escapeHtml(template.name || 'Name of the audit')}</h1>
//                     <h2>Report</h2>
//                     <div class="meta">
//                         <p><strong>Report Date:</strong> ${escapeHtml(reportDate)}</p>
//                         <p><strong>Audit Date:</strong> ${escapeHtml(auditDateRange)}</p>
//                         <p><strong>Auditor:</strong><br/>${auditorLines}</p>
//                     </div>
//                     <div class="for-company">
//                         <p><strong>For</strong></p>
//                         <p><strong>${escapeHtml(company.name || 'Test company')}</strong></p>
//                         <p>${escapeHtml(contactName || 'Test contact person')} — ${escapeHtml(contactEmail || 'Test contact person email')}</p>
//                     </div>
//                 </div>
//                 <div class="cover-quote">
//                     <p><em>The strength of your defence lies in knowing and understanding your vulnerabilities. This audit provides you with the information you need to create a secure environment in your company. "You can only protect what you know."</em></p>
//                 </div>
//             </div>
//         </div>

//         <div class="page-break page-wrapper">
//             <div class="container">
//                 <h2>Table of Contents</h2>
//                 <div class="static-content-page">
//                     ${tocHtml}
//                 </div>
//             </div>
//         </div>

//         <!-- Combined Page: Introduction and About Companies -->
//         <div class="page-break page-wrapper">
//             <div class="container">
//                 <h2>Introduction</h2>
//                 <div class="static-content-page">
//                     ${introductionText}
//                 </div>
//                 <h2 style="margin-top: 30px;">About the Auditing Company</h2>
//                 <div class="static-content-page">
//                     ${aboutCompanyHardcoded}
//                 </div>
//                 <h2 style="margin-top: 30px;">About the Audited Company</h2>
//                 <div class="static-content-page">
//                     ${aboutCompanyAudited}
//                 </div>
//             </div>
//         </div>

//         <!-- Combined Page: Preface, Disclaimer, and Environment -->
//         <div class="page-break page-wrapper">
//             <div class="container">
//                 <h2>Preface</h2>
//                 <div class="static-content-page">
//                     ${prefaceText}
//                 </div>
//                 <h2 style="margin-top: 30px;">Disclaimer</h2>
//                 <div class="static-content-page">
//                     ${disclaimerText}
//                 </div>
//                 <h2 style="margin-top: 30px;">Examination environment</h2>
//                 <div class="static-content-page">
//                     ${envHtml}
//                 </div>
//             </div>
//         </div>

//         <!-- Conditional Page: Executive Summary & Summaries -->
//         ${(roundedOverallScore > 0 || summaries.length > 0) ? `
//         <div class="page-break page-wrapper">
//             <div class="container">
//                 <h2>Executive Summary</h2>
//                 <div class="static-content-page">
//                     ${executiveSummaryContent}
//                 </div>
//             </div>
//         </div>
//         ` : ''}

//         <!-- Main Content Section -->
//         <div class="page-break page-wrapper">
//             <div class="container">
//                 <h2 class="content-header">Content</h2>
//                 ${mainHtml}
//             </div>
//         </div>

//         <!-- Final Pages -->
//         <div class="page-break page-wrapper">
//             <div class="container">
//                 <h2>Handover</h2>
//                 ${handoverText}
//             </div>
//         </div>

//         <div class="page-break page-wrapper">
//             <div class="container">
//                 <h2>Thank You</h2>
//                 ${thankYouText}
//             </div>
//         </div>

//     </body>
//     </html>
//     `;

//     return html;
// };

// export default generateReportHtml;



const LOGO_URL = 'https://res.cloudinary.com/dcviwtoog/image/upload/v1757777319/DV-Koch-Logo_0225_Logo_Farbe-rgb_bzefrw.jpg';

/**
 * Escapes HTML to prevent XSS vulnerabilities.
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string.
 */
const escapeHtml = (str) => {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const formatDate = (d) => {
    if (!d) return 'N/A';
    try {
        return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return String(d);
    }
};

/**
 * Determine status category and color from a response value.
 */
const getStatusInfo = (selectedValue) => {
    const raw = (selectedValue === undefined || selectedValue === null) ? '' : String(selectedValue).trim().toLowerCase();
    const color = '#014f65'; // Primary green color
    return { label: raw || 'N/A', color: color };
};

/**
 * Build table of contents HTML from templateStructureSnapshot without custom numbering
 */
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
    const company = auditInstance.company || {};
    const template = auditInstance.template || {};
    const responses = auditInstance.responses || [];
    const templateStructure = auditInstance.templateStructureSnapshot || [];
    const overallScore = (typeof auditInstance.overallScore === 'number') ? auditInstance.overallScore : 0;
    const createdBy = auditInstance.createdBy || {};
    const auditorsToDisplay = auditInstance.auditorsToDisplay || [];

    const roundedOverallScore = Math.round(overallScore);

    // Get examination environment data
    const examinationEnvironment = company.examinationEnvironment || auditInstance.examinationEnvironment || {};

    const summaries = auditInstance.summaries || [];

    const reportDate = formatDate(new Date());

    let auditDateRange;
    const start = auditInstance.startDate;
    const end = auditInstance.endDate;

    if (start && end) {
        auditDateRange = `${formatDate(start)} - ${formatDate(end)}`;
    } else if (start) {
        auditDateRange = formatDate(start);
    } else if (end) {
        auditDateRange = formatDate(end);
    } else {
        auditDateRange = 'N/A';
    }

    const auditorLines = auditorsToDisplay.map(u => `${escapeHtml(u.firstName || '')} ${escapeHtml(u.lastName || '')} (${escapeHtml(u.email || '')})`).join('<br/>') || `${escapeHtml(createdBy.firstName || '')} ${escapeHtml(createdBy.lastName || '')} (${escapeHtml(createdBy.email || '')})`;

    const contactName = company.contactPerson?.name || '';
    const contactEmail = company.contactPerson?.email || '';

    const tocHtml = buildToc(templateStructure);

    let mainHtml = '';
    templateStructure.forEach((section, sIdx) => {
        const secId = `sec-${sIdx}`;
        mainHtml += `<div class="section" id="${secId}"><h2 class="content-header">${escapeHtml(section.name || 'Unnamed Section')}</h2>`;
        if (section.description) {
            mainHtml += `<p class="section-desc">${escapeHtml(section.description)}</p>`;
        }

        (section.subSections || []).forEach((subSection, ssIdx) => {
            const subId = `sec-${sIdx}-sub-${ssIdx}`;
            mainHtml += `<div class="subsection" id="${subId}"><h3>${escapeHtml(subSection.name || 'Unnamed Subsection')}</h3>`;
            if (subSection.description) {
                mainHtml += `<p class="subsection-desc">${escapeHtml(subSection.description)}</p>`;
            }

            (subSection.questions || []).forEach((question, qIdx) => {
                const resp = responses.find(r => r.questionId?.toString() === question._id?.toString()) || {};
                const status = getStatusInfo(resp.selectedValue);
                const answerText = escapeHtml(resp.selectedValue === undefined || resp.selectedValue === null ? 'N/A' : String(resp.selectedValue));
                const commentHtml = resp.comment ? `<div class="comment"><strong>Comment:</strong><div>${escapeHtml(resp.comment)}</div></div>` : '';
                const evidenceHtml = (Array.isArray(resp.evidenceUrls) && resp.evidenceUrls.length > 0) ? `<div class="evidence"><strong>Evidence:</strong><ul>${resp.evidenceUrls.map(u => `<li><a href="${escapeHtml(u)}">${escapeHtml(u)}</a></li>`).join('')}</ul></div>` : '';
                const recommendationHtml = resp.recommendation ? `<div class="recommendation"><strong>Recommendation:</strong><div>${escapeHtml(resp.recommendation)}</div></div>` : '';

                mainHtml += `
                    <div class="question-block">
                        <div class="question-header" style="border-left:3px solid ${status.color};">
                            <p class="question-title" style="color:${status.color};"><strong>${escapeHtml(question.text || 'Untitled question')}</strong></p>
                        </div>
                        <div class="answer-row"><strong>Answer:</strong> ${answerText}</div>
                        ${recommendationHtml}
                        ${commentHtml}
                        ${evidenceHtml}
                    </div>
                `;
            });

            mainHtml += `</div>`;
        });

        mainHtml += `</div>`;
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
        : '';

    const introductionText = `
        <p>When we speak about Cyber, Information, and IT Security, it is important to recognize that it is not only a technical matter. Technology plays a key role, but security is always the result of three dimensions working together:</p>
        <ul>
            <li><strong>Technology</strong> – the tools and systems that protect our data.</li>
            <li><strong>Organization</strong> – the rules, processes, and responsibilities that guide how we work.</li>
            <li><strong>People</strong> – the awareness, behavior, and decisions of everyone involved.</li>
        </ul>
        <p>Only when these three elements are combined can we create real protection. Focusing on technology alone is not enough. A secure company requires clear structures, well-trained employees, and a culture where security is seen as part of everyday work.</p>
        <p>In today's ever-changing world, the importance of protecting data and systems continues to grow. New threats appear daily, and digitalization increases the complexity of our business environment. For this reason, security must be given the right priority. It should not be treated as an "add-on" or a last step, but as an integral part of every decision, process, and investment.</p>
        <p>This audit report is designed to make this approach practical and understandable. It gives a transparent overview of your current situation, highlights strengths and weaknesses, and provides clear guidance for next steps. The goal is not only to identify risks but also to enable your organization to build sustainable protection—so that technology, organization, and people are aligned and your company can continue to operate with confidence and resilience.</p>
    `;

    const aboutCompanyAudited = `
        <p>As a prominent player in the <strong>${escapeHtml(company.industry || '')}</strong> industry, <strong>${escapeHtml(company.name || 'Test company')}</strong> has shown a strong commitment to maintaining a secure and reliable operational environment. Our audit was conducted to assess their current security posture, providing a detailed overview of their defenses and identifying key areas for continuous improvement. This assessment highlights their dedication to protecting their digital assets and fostering a resilient business infrastructure.</p>
        <p><strong>Contact person:</strong> ${escapeHtml(contactName || '')} — ${escapeHtml(contactEmail || '')}</p>
        ${company.generalInfo || company.examinationEnvironment?.generalInfo ? `<p>${escapeHtml(company.generalInfo || company.examinationEnvironment?.generalInfo)}</p>` : ''}
    `;

    const aboutCompanyHardcoded = `
        <p>We, DV-Beratung Koch, are your reliable partner and system house for information technology, telecommunications and video surveillance. Since 1993, we have been successfully implementing IT projects in the areas of government, healthcare and small and medium-sized enterprises.</p>
        <p>Over the years, our product and service portfolio has been continuously adapted and expanded in line with technological developments. Our aim is to offer you a comprehensive range of IT solutions from a single source, including perfectly coordinated hardware and software for your company.</p>
        <p>Through continuous training of our team, we ensure that our expert knowledge is always up to date in order to guarantee you modern IT consulting and implementation. We look forward to starting a successful and cooperative partnership with you.</p>
    `;

    const prefaceText = `
        <p>The CyberAudit 360 Check Report has been developed to provide organizations with a structured and independent assessment of their information security posture. The aim is not only to identify technical issues, but to create a holistic view that combines technology, organization, and people.</p>
        <p>This report is designed as a practical tool for decision-makers at all levels. Whether you have a technical background or not, the findings and recommendations are presented in a way that allows you to clearly understand where strengths lie, where risks exist, and what steps can be taken to achieve sustainable improvement.</p>
        <p>Our mission is to support organizations in treating cybersecurity as an integral part of their business strategy and daily operations—helping to build trust, ensure compliance, and strengthen resilience in an ever-changing digital world.</p>
    `;

    const disclaimerText = `
        <p>This report is based on the information, data, and evidence made available during the audit process. While every effort has been made to provide accurate and reliable findings, the results and recommendations are limited to the scope of the audit and the time of its execution.</p>
        <p>The report should not be considered a guarantee against future risks or incidents. Security threats evolve constantly, and continuous monitoring, improvement, and adaptation remain essential.</p>
        <p>The auditor and auditing organization do not assume liability for direct or indirect damages that may result from the use of this report. The responsibility for implementing and maintaining effective security measures lies with the audited organization.</p>
    `;

    const executiveSummaryContent = `
        <p>This report provides a comprehensive overview of the cybersecurity posture for <strong>${escapeHtml(company.name || 'Test Company')}</strong> based on the "<strong>${escapeHtml(template.name || 'Name of the audit')}</strong>".</p>
        <p>The audit covered key areas including Information Security Policies, Access Control, and other critical domains as defined in the selected template.</p>
        <p>Overall, the assessment indicates a compliance score of <strong>${roundedOverallScore}%</strong>. Detailed findings and observations are provided in the subsequent sections, along with specific recommendations for improvement.</p>
        <p>It is crucial to address identified areas of non-compliance and implement recommended remediation actions to strengthen the overall security posture and ensure continuous adherence to best practices.</p>
        
        ${summariesHtml ? `<h2 style="margin-top: 20px;">Summary</h2>${summariesHtml}` : ''}
    `;

    const handoverText = `
        <p>This page confirms that the audit report titled "${escapeHtml(template.name || 'Name of the audit')}" has been formally handed over by the auditor to the audited company.</p>
        <p>By signing below, both parties acknowledge the reception of the full audit report and confirm that it has been delivered in its final version.</p>

        <table class="handover">
            <tr><td><strong>Auditor:</strong></td><td></td></tr>
            <tr><td>Name:</td><td>_________________________</td></tr>
            <tr><td>Organization:</td><td>_________________________</td></tr>
            <tr><td>Date:</td><td>_________________________</td></tr>
            <tr><td>Signature:</td><td>_________________________</td></tr>
        </table>

        <br/>

        <table class="handover">
            <tr><td><strong>Audited Company Representative:</strong></td><td></td></tr>
            <tr><td>Name:</td><td>_________________________</td></tr>
            <tr><td>Organization:</td><td>_________________________</td></tr>
            <tr><td>Date:</td><td>_________________________</td></tr>
            <tr><td>Signature:</td><td>_________________________</td></tr>
        </table>
    `;

    const thankYouText = `
        <div style="text-align: center;">
            <p>Thank You for Choosing Cybersecurity Audit 360</p>
            <p>We are committed to enhancing your organization's security posture and ensuring compliance in an ever evolving threat landscape. This report serves as a foundational step towards a more resilient and secure future.</p>
            <p>Our team is dedicated to supporting your journey beyond this audit. We encourage you to review the findings and recommendations carefully and reach out to us for any clarifications or assistance in implementing the suggested improvements.</p>
            <div class="contact">
                <p>Email: <a href="mailto:info@cybersecurityaudit360.com">info@cybersecurityaudit360.com</a></p>
                <p>Website: <a href="https://www.cybersecurityaudit360.com">www.cybersecurityaudit360.com</a></p>
            </div>
            <h3 class="slogan-center">"Securing Your Digital Horizon, Together."</h3>
        </div>
    `;

    // HTML Structure and Styles
    const html = `
    <!doctype html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Audit Report - ${escapeHtml(company.name || 'Unknown Company')}</title>
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
        <style>
            /* Printing and Layout Adjustments */
            @page { 
                margin: 0.6in; 
                size: A4;
            }
            html, body { 
                margin: 0; 
                padding: 0; 
                width: 100%; 
                box-sizing: border-box; 
            }
            body { 
                font-family: 'Lexend', Arial, Helvetica, sans-serif; 
                font-size: 11pt; 
                color: #2c3e50; 
                -webkit-print-color-adjust: exact; 
                padding-top: 0; 
            }
            
            /* Container for page content */
            .page-wrapper {
                min-height: 100vh; 
                height: 100%; 
                position: relative;
            }

            .container { 
                padding: 0.5in; 
                box-sizing: border-box;
            }

            /* Cover Page Styles */
            .cover { 
                text-align: center; 
                padding-top: 15px; 
                padding-bottom: 10px; 
                height: 100%; 
                display: flex;
                flex-direction: column;
                justify-content: center; 
            }
            .logo { 
                max-width: 280px;
                margin: 0 auto 12px auto; 
                display: block;
            }
            
            /* Headers - Reduced sizes */
            h1 { 
                margin: 0; 
                font-size: 32pt; 
                color: #014f65; 
                text-align: center; 
                font-weight: 700; 
            }
            h2 { 
                margin: 25px 0 8px 0; 
                font-size: 16pt; 
                color: #014f65; 
                text-align: center; 
                padding-bottom: 4px; 
                font-weight: 700;
            }
            /* Content H2 - Main Section Headers */
            .content-header { 
                margin: 0; 
                font-size: 16pt; 
                color: #014f65; 
                text-align: center; 
                padding-bottom: 4px; 
                font-weight: 700;
            }
            h3 { 
                margin: 18px 0 6px 0; 
                font-size: 13pt; 
                color: #2c3e50; 
                text-align: left; 
                padding-bottom: 2px; 
                font-weight: 700;
            }
            p { 
                margin: 6px 0; 
                line-height: 1.35; 
            }
            
            /* Cover Metadata - Reduced sizes */
            .meta { 
                margin: 12px 0 20px 0; 
                font-size: 13pt; 
                line-height: 1.5; 
            }
            .meta p { margin: 6px 0; }
            .for-company { margin-top: 15px; line-height: 1.5; font-size: 12pt; }
            .cover-quote { margin-top: 12px; font-style: italic; color: #555; max-width: 700px; margin-left: auto; margin-right: auto; line-height: 1.4; font-size: 11pt; }

            /* Table of Contents */
            ul { margin: 8px 0 15px 0; padding-left: 0; }
            ul li { list-style-type: none; margin-left: 0; }
            .toc-root { list-style-type: none; padding-left: 0; }
            .toc-root > li { margin-top: 6px; list-style: none; padding-left: 0; font-size: 11pt; }
            .toc-root > li ul { list-style: none; padding-left: 20px; }
            .toc-root > li li { font-size: 10pt; margin-top: 3px; }
            .toc-root a { text-decoration: none; color: #003340; }

            /* Content Sections */
            .section { margin-top: 25px; }
            .subsection { margin-top: 18px; }
            .section-desc, .subsection-desc { font-size: 10pt; color: #444; margin-bottom: 6px; }
            .question-block { margin-bottom: 12px; padding: 10px; background: #fafafa; border: 1px solid #eee; border-radius: 4px; }
            .question-header { display: flex; align-items: flex-start; margin-bottom: 5px; }
            .question-header .question-title { font-size: 11pt; margin: 0; padding-left: 10px; line-height: 1.25; }
            .answer-row { margin: 6px 0; font-size: 10.5pt; }
            .comment, .recommendation { margin-top: 6px; background:#e6f7f6; padding:7px; border-left:3px solid #014f65; font-size: 10pt; }
            .evidence { margin-top: 6px; font-size: 10pt; }
            .evidence ul { margin:3px 0 0 16px; }
            .env { width: 100%; border-collapse: collapse; margin: 8px 0 12px 0; }
            .env td { padding: 6px 8px; border: 1px solid #e6e6e6; font-size: 10pt; }
            .summary { margin:6px 0; padding:8px; background:#f6f6f6; border-radius:4px; font-size: 10pt; }
            .handover { width: 100%; margin-top: 12px; border-collapse: collapse; }
            .handover td { padding: 6px; vertical-align: top; font-size: 10pt; }
            .contact { margin-top: 12px; font-size: 11pt; }
            
            /* Global link styling */
            a { text-decoration: none; color: #003340; }

            .slogan-center { text-align: center; margin-top: 18px; font-style: italic; color: #014f65; font-size: 15pt; }

            /* Page Break and Alignment */
            .page-break { 
                page-break-before: always; 
                margin: 0;
            }
            .page-break:first-child { 
                page-break-before: auto; 
            }
            
            /* Static Content Text Font Size */
            .static-content-page p, .static-content-page ul li {
                font-size: 10pt;
                line-height: 1.4;
            }

            /* Page Numbering Footer */
            @page {
                @bottom-center {
                    content: counter(page) "/" counter(pages);
                    font-family: 'Lexend', Arial, Helvetica, sans-serif;
                    font-size: 9pt;
                    color: #555;
                }
            }
        </style>
    </head>
    <body>
        <div class="page-wrapper">
            <div class="container cover">
                <img class="logo" src="${LOGO_URL}" alt="Logo" />
                <div style="margin-top: 20px;">
                    <h1>${escapeHtml(template.name || 'Name of the audit')}</h1>
                    <h2>Report</h2>
                    <div class="meta">
                        <p><strong>Report Date:</strong> ${escapeHtml(reportDate)}</p>
                        <p><strong>Audit Date:</strong> ${escapeHtml(auditDateRange)}</p>
                        <p><strong>Auditor:</strong><br/>${auditorLines}</p>
                    </div>
                    <div class="for-company">
                        <p><strong>For</strong></p>
                        <p><strong>${escapeHtml(company.name || 'Test company')}</strong></p>
                        <p>${escapeHtml(contactName || 'Test contact person')} — ${escapeHtml(contactEmail || 'Test contact person email')}</p>
                    </div>
                </div>
                <div class="cover-quote">
                    <p><em>The strength of your defence lies in knowing and understanding your vulnerabilities. This audit provides you with the information you need to create a secure environment in your company. "You can only protect what you know."</em></p>
                </div>
            </div>
        </div>

        <div class="page-break page-wrapper">
            <div class="container">
                <h2>Table of Contents</h2>
                <div class="static-content-page">
                    ${tocHtml}
                </div>
            </div>
        </div>

        <div class="page-break page-wrapper">
            <div class="container">
                <h2>Introduction</h2>
                <div class="static-content-page">
                    ${introductionText}
                </div>
                <h2 style="margin-top: 20px;">About the Auditing Company</h2>
                <div class="static-content-page">
                    ${aboutCompanyHardcoded}
                </div>
                <h2 style="margin-top: 20px;">About the Audited Company</h2>
                <div class="static-content-page">
                    ${aboutCompanyAudited}
                </div>
            </div>
        </div>

        <div class="page-break page-wrapper">
            <div class="container">
                <h2>Preface</h2>
                <div class="static-content-page">
                    ${prefaceText}
                </div>
                <h2 style="margin-top: 20px;">Disclaimer</h2>
                <div class="static-content-page">
                    ${disclaimerText}
                </div>
                <h2 style="margin-top: 20px;">Examination environment</h2>
                <div class="static-content-page">
                    ${envHtml}
                </div>
            </div>
        </div>

        ${(roundedOverallScore > 0 || summaries.length > 0) ? `
        <div class="page-break page-wrapper">
            <div class="container">
                <h2>Executive Summary</h2>
                <div class="static-content-page">
                    ${executiveSummaryContent}
                </div>
            </div>
        </div>
        ` : ''}

        <div class="page-break page-wrapper">
            <div class="container">
                <h2 class="content-header">Content</h2>
                ${mainHtml}
            </div>
        </div>

        <div class="page-break page-wrapper">
            <div class="container">
                <h2>Handover</h2>
                <div class="static-content-page">
                    ${handoverText}
                </div>
            </div>
        </div>

        <div class="page-break page-wrapper">
            <div class="container">
                <h2>Thank You</h2>
                <div class="static-content-page">
                    ${thankYouText}
                </div>
            </div>
        </div>

    </body>
    </html>
    `;

    return html;
};

export default generateReportHtml;