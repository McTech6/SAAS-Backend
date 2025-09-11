// // Using the provided ISACA badge image URL for the logo
// const LOGO_URL = 'https://images.credly.com/images/9c7b4205-6582-403c-b656-be1590248fcd/ISACA_CybersecurityAudit_badge_352x352.png';

// // Array of motivational quotes
// const MOTIVATIONS = [
//     "In the digital age, security is not just a feature, it's the foundation of trust. This report reflects our commitment to empowering your organization with clarity and actionable insights, transforming vulnerabilities into strengths and ensuring a resilient future.",
//     "Cybersecurity is a journey, not a destination. This audit marks a crucial checkpoint, guiding your path towards unwavering digital resilience.",
//     "Protecting your digital assets is paramount. This report illuminates the path to a more secure and compliant future, safeguarding your innovation.",
//     "The strength of your defense lies in understanding your vulnerabilities. This audit provides the intelligence needed to build an impenetrable fortress.",
//     "In a world of evolving threats, proactive security is your greatest asset. We empower you with the insights to stay ahead, always.",
//     "This report is more than findings; it's a blueprint for digital peace of mind. Let's build a future where your data is unequivocally safe.",
//     "Security is not a cost, but an investment in your future. This audit validates that investment, ensuring every byte is protected.",
//     "Navigating the cybersecurity landscape requires precision and foresight. This report offers both, charting a clear course to enhanced protection.",
//     "Every vulnerability discovered is an opportunity for stronger defense. This audit transforms potential risks into pathways for robust security.",
//     "Your trust is our mission. This comprehensive report is a testament to our dedication to securing your digital world, one audit at a time"
// ];

// /**
//  * Escapes HTML to prevent XSS vulnerabilities.
//  * @param {string} str - The string to escape.
//  * @returns {string} The escaped string.
//  */
// const escapeHtml = (str) => {
//     if (!str) return '';
//     return str.replace(/&/g, '&amp;')
//              .replace(/</g, '&lt;')
//              .replace(/>/g, '&gt;')
//              .replace(/"/g, '&quot;')
//              .replace(/'/g, '&#039;');
// };

// /**
//  * Generates the HTML content for the audit report.
//  * @param {object} auditInstance - The audit instance object with populated data.
//  * @returns {string} The full HTML string for the PDF report.
//  */
// const generateReportHtml = (auditInstance) => {
//     const company = auditInstance.company || {};
//     const template = auditInstance.template || {};
//     const responses = auditInstance.responses || [];
//     const templateStructure = auditInstance.templateStructureSnapshot || [];
//     const overallScore = auditInstance.overallScore || 0;
//     const createdBy = auditInstance.createdBy || {};
//     const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
//     const completionDate = auditInstance.actualCompletionDate ?
//         new Date(auditInstance.actualCompletionDate).toLocaleDateString('en-US', dateOptions) :
//         'N/A';
//     const reportDate = new Date().toLocaleDateString('en-US', dateOptions);

//     // Select a random motivation
//     const randomMotivation = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];

//     let tableOfContentsHtml = '';
//     let mainContentHtml = '';

//     // Build Table of Contents and Main Content
//     templateStructure.forEach((section) => {
//         const sectionId = `section-${section._id || 'unknown'}`;
//         tableOfContentsHtml += `<li><a href="#${sectionId}">${escapeHtml(section.name || 'Unnamed Section')}</a></li><ul>`;
//         mainContentHtml += `<h2 id="${sectionId}" class="section-title">${escapeHtml(section.name || 'Unnamed Section')}</h2>`;
//         if (section.description) {
//             mainContentHtml += `<p class="section-description">${escapeHtml(section.description)}</p>`;
//         }

//         (section.subSections || []).forEach((subSection) => {
//             const subSectionId = `subsection-${subSection._id || 'unknown'}`;
//             tableOfContentsHtml += `<li><a href="#${subSectionId}">${escapeHtml(subSection.name || 'Unnamed Subsection')}</a></li>`;
//             mainContentHtml += `<h3 id="${subSectionId}" class="subsection-title">${escapeHtml(subSection.name || 'Unnamed Subsection')}</h3>`;
//             if (subSection.description) {
//                 mainContentHtml += `<p class="subsection-description">${escapeHtml(subSection.description)}</p>`;
//             }

//             (subSection.questions || []).forEach((question, qIndex) => {
//                 const response = responses.find(r => r.questionId?.toString() === question._id?.toString()) || {};
//                 const selectedValue = response.selectedValue || 'N/A';
//                 const answerDescription = response.answerOptionsSnapshot ?
//                     (response.answerOptionsSnapshot.find(opt => opt.value === selectedValue)?.description || 'No description provided.') :
//                     'N/A';
//                 const comment = response.comment || '';
//                 const includeComment = response.includeCommentInReport || false;
//                 const evidenceUrls = response.evidenceUrls || [];

//                 mainContentHtml += `
//                     <div class="question-block">
//                         <p class="question-text"><strong>Q${qIndex + 1}:</strong> ${escapeHtml(question.text || 'No question text')}</p>
//                         <p class="answer"><strong>Answer:</strong> <span class="answer-value">${escapeHtml(selectedValue)}</span></p>
//                         <p class="answer-description">${escapeHtml(answerDescription)}</p>
//                 `;

//                 if (question.type === 'numeric' && selectedValue !== 'N/A') {
//                     mainContentHtml += `<p class="numeric-value"><strong>Value:</strong> ${escapeHtml(selectedValue)}</p>`;
//                 }

//                 if (comment && includeComment) {
//                     mainContentHtml += `<div class="comment-section"><strong>Comment:</strong> <p>${escapeHtml(comment)}</p></div>`;
//                 }

//                 if (evidenceUrls.length > 0) {
//                     mainContentHtml += `<div class="evidence-section"><strong>Evidence:</strong><ul>`;
//                     evidenceUrls.forEach(url => {
//                         mainContentHtml += `<li><a href="${escapeHtml(url)}" target="_blank">${escapeHtml(url)}</a></li>`;
//                     });
//                     mainContentHtml += `</ul></div>`;
//                 }
//                 mainContentHtml += `</div>`; // Close question-block
//             });
//         });
//         tableOfContentsHtml += `</ul>`; // Close subsection list
//     });

//     return `
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Cybersecurity Audit Report - ${escapeHtml(company.name || 'Unknown Company')}</title>
//             <style>
//                 @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

//                 body {
//                     font-family: 'Inter', sans-serif;
//                     margin: 0;
//                     padding: 0;
//                     color: #333;
//                     line-height: 1.6;
//                     font-size: 11pt;
//                 }

//                 .page {
//                     padding: 1in;
//                     box-sizing: border-box;
//                     page-break-after: always;
//                 }

//                 /* Cover Page Styling */
//                 .cover-page {
//                     display: flex;
//                     flex-direction: column;
//                     justify-content: center;
//                     align-items: center;
//                     text-align: center;
//                     height: 100vh;
//                     background-color: #f8f8f8;
//                     padding: 2in 1in;
//                 }
//                 .cover-page img {
//                     max-width: 250px;
//                     max-height: 150px;
//                     object-fit: contain;
//                     margin-bottom: 30px;
//                 }
//                 .cover-page h1 {
//                     font-size: 3em;
//                     color: #008175;
//                     margin-bottom: 10px;
//                     font-weight: 700;
//                 }
//                 .cover-page h2 {
//                     font-size: 1.8em;
//                     color: #231f20;
//                     margin-bottom: 20px;
//                     font-weight: 600;
//                 }
//                 .cover-page p {
//                     font-size: 1.1em;
//                     margin-bottom: 10px;
//                 }
//                 .cover-page .motivation {
//                     font-style: italic;
//                     color: #555;
//                     margin-top: 40px;
//                     font-size: 1.2em;
//                     max-width: 700px;
//                 }
//                 .cover-page .audit-meta {
//                     margin-top: 50px;
//                     font-size: 1em;
//                     color: #666;
//                 }

//                 /* Table of Contents Styling */
//                 .table-of-contents {
//                     page-break-before: always;
//                     padding: 1in;
//                 }
//                 .table-of-contents h2 {
//                     font-size: 2em;
//                     color: #008175;
//                     margin-bottom: 30px;
//                     text-align: center;
//                 }
//                 .table-of-contents ul {
//                     list-style: none;
//                     padding: 0;
//                 }
//                 .table-of-contents ul li {
//                     margin-bottom: 10px;
//                     font-size: 1.1em;
//                 }
//                 .table-of-contents ul ul {
//                     padding-left: 20px;
//                     margin-top: 5px;
//                 }
//                 .table-of-contents a {
//                     text-decoration: none;
//                     color: #231f20;
//                     font-weight: 400;
//                     display: block;
//                     padding: 5px 0;
//                     border-bottom: 1px dotted #ccc;
//                 }
//                 .table-of-contents a:hover {
//                     color: #008175;
//                 }

//                 /* Main Content Styling */
//                 .report-content {
//                     padding: 1in;
//                 }
//                 .section-title {
//                     font-size: 1.8em;
//                     color: #008175;
//                     margin-top: 40px;
//                     margin-bottom: 15px;
//                     padding-bottom: 5px;
//                     border-bottom: 2px solid #008175;
//                     page-break-before: always;
//                 }
//                 .subsection-title {
//                     font-size: 1.4em;
//                     color: #231f20;
//                     margin-top: 30px;
//                     margin-bottom: 10px;
//                     padding-bottom: 3px;
//                     border-bottom: 1px solid #ccc;
//                 }
//                 .section-description, .subsection-description {
//                     font-size: 0.95em;
//                     color: #555;
//                     margin-bottom: 20px;
//                 }

//                 .question-block {
//                     background-color: #f9f9f9;
//                     border: 1px solid #eee;
//                     border-left: 5px solid #008175;
//                     padding: 15px;
//                     margin-bottom: 20px;
//                     border-radius: 8px;
//                 }
//                 .question-text {
//                     font-size: 1.1em;
//                     font-weight: 600;
//                     color: #231f20;
//                     margin-bottom: 10px;
//                 }
//                 .answer {
//                     font-size: 1em;
//                     margin-bottom: 5px;
//                 }
//                 .answer-value {
//                     font-weight: 700;
//                     color: #008175;
//                 }
//                 .answer-description {
//                     font-size: 0.9em;
//                     color: #666;
//                     margin-left: 15px;
//                     margin-bottom: 10px;
//                 }
//                 .numeric-value {
//                     font-size: 1em;
//                     margin-bottom: 10px;
//                     color: #444;
//                 }
//                 .comment-section {
//                     background-color: #e6f7f6;
//                     border-left: 3px solid #008175;
//                     padding: 10px;
//                     margin-top: 15px;
//                     border-radius: 4px;
//                 }
//                 .comment-section p {
//                     font-size: 0.95em;
//                     color: #333;
//                     margin: 0;
//                 }
//                 .evidence-section {
//                     margin-top: 15px;
//                     font-size: 0.9em;
//                 }
//                 .evidence-section ul {
//                     list-style: disc;
//                     padding-left: 20px;
//                     margin: 5px 0 0 0;
//                 }
//                 .evidence-section li {
//                     margin-bottom: 3px;
//                 }
//                 .evidence-section a {
//                     color: #007bff;
//                     text-decoration: underline;
//                 }

//                 /* Final Page Styling */
//                 .final-page {
//                     page-break-before: always;
//                     display: flex;
//                     flex-direction: column;
//                     justify-content: center;
//                     align-items: center;
//                     text-align: center;
//                     height: 100vh;
//                     background: linear-gradient(135deg, #e6f7f6 0%, #d1e8e6 100%);
//                     color: #231f20;
//                     padding: 2in 1in;
//                 }
//                 .final-page h2 {
//                 }
//                 .final-page p {
//                     font-size: 1.2em;
//                     max-width: 800px;
//                     margin-bottom: 20px;
//                 }
//                 .final-page .contact-info {
//                     margin-top: 40px;
//                     font-size: 1.1em;
//                     color: #444;
//                 }
//                 .final-page .contact-info a {
//                     color: #007bff;
//                     text-decoration: none;
//                     font-weight: 600;
//                 }
//                 .final-page .slogan {
//                     margin-top: 60px;
//                     font-size: 1.5em;
//                     font-style: italic;
//                     color: #005f56;
//                     font-weight: 600;
//                 }

//                 /* Footer for page numbers (Puppeteer handles this) */
//                 .footer {
//                     font-size: 9pt;
//                     color: #777;
//                     text-align: center;
//                     width: 100%;
//                 }

//                 /* Print specific styles */
//                 @page {
//                     margin: 1in;
//                 }
//                 body {
//                     -webkit-print-color-adjust: exact;
//                 }
//                 @media print {
//                     .evidence-section a:after {
//                         content: " (" attr(href) ")";
//                         font-size: 0.8em;
//                         color: #555;
//                     }
//                     .contact-info a:after {
//                         content: " (" attr(href) ")";
//                         font-size: 0.8em;
//                         color: #555;
//                     }
//                 }
//             </style>
//         </head>
//         <body>
//             <!-- Cover Page -->
//             <div class="page cover-page">
//                 <img src="${LOGO_URL}" alt="CyberSecurity Audit 360 Logo">
//                 <h1>Cybersecurity Audit 360</h1>
//                 <h2>Comprehensive Audit Report</h2>
//                 <p>For: <strong>${escapeHtml(company.name || 'Unknown Company')}</strong></p>
//                 <p>Audit Template: <strong>${escapeHtml(template.name || 'Unknown Template')} (v${escapeHtml(template.version || 'N/A')})</strong></p>
//                 <p>Report Date: <strong>${reportDate}</strong></p>
//                 <p>Completion Date: <strong>${completionDate}</strong></p>
//                 <div class="audit-meta">
//                     <p>Prepared by: ${escapeHtml(createdBy.firstName || 'Unknown')} ${escapeHtml(createdBy.lastName || 'User')} (${escapeHtml(createdBy.email || 'N/A')})</p>
//                 </div>
//                 <p class="motivation">
//                     "${escapeHtml(randomMotivation)}"
//                 </p>
//             </div>

//             <!-- Table of Contents Page -->
//             <div class="page table-of-contents">
//                 <h2>Table of Contents</h2>
//                 <ul>
//                     ${tableOfContentsHtml}
//                 </ul>
//             </div>

//             <!-- Overall Summary -->
//             <div class="page report-content">
//                 <h2 class="section-title">Executive Summary</h2>
//                 <p>This report provides a comprehensive overview of the cybersecurity posture for <strong>${escapeHtml(company.name || 'Unknown Company')}</strong> based on the <strong>"${escapeHtml(template.name || 'Unknown Template')}"</strong> audit template (version ${escapeHtml(template.version || 'N/A')}).</p>
//                 <p>The audit covered key areas including Information Security Policies, Access Control, and other critical domains as defined in the selected template.</p>
//                 <p>Overall, the assessment indicates a compliance score of <strong>${overallScore.toFixed(2)}%</strong>. Detailed findings and observations are provided in the subsequent sections, along with specific recommendations for improvement.</p>
//                 <p>It is crucial to address identified areas of non-compliance and implement recommended remediation actions to strengthen the overall security framework and ensure continuous adherence to best practices.</p>
//             </div>

//             <!-- Main Report Content -->
//             <div class="report-content">
//                 ${mainContentHtml}
//             </div>

//             <!-- Final Page -->
//             <div class="page final-page">
//                 <h2>Thank You for Choosing Cybersecurity Audit 360</h2>
//                 <p>We are committed to enhancing your organization's security posture and ensuring compliance in an ever-evolving threat landscape. This report serves as a foundational step towards a more resilient and secure future.</p>
//                 <p>Our team is dedicated to supporting your journey beyond this audit. We encourage you to review the findings and recommendations carefully and reach out to us for any clarifications or assistance in implementing the suggested improvements.</p>
//                 <div class="contact-info">
//                     <p>For further discussions or to schedule a follow-up consultation, please contact us:</p>
//                     <p>Email: <a href="mailto:taudit098@gmail.com">info@cybersecurityaudit360.com</a></p>
//                     <p>Website: <a href="https://www.cybersecurityaudit360.com" target="_blank">www.cybersecurityaudit360.com</a></p>
//                 </div>
//                 <p class="slogan">"Securing Your Digital Horizon, Together."</p>
//             </div>
//         </body>
//         </html>
//     `;
// };

// export default generateReportHtml;
 

// src/utils/reportGenerator.js
// Generates HTML for the audit PDF report (compact, 12pt, color-coded)

// const LOGO_URL = 'https://images.credly.com/images/9c7b4205-6582-403c-b656-be1590248fcd/ISACA_CybersecurityAudit_badge_352x352.png';

// const escapeHtml = (str = '') => {
//   if (typeof str !== 'string') return str || '';
//   return str.replace(/&/g, '&amp;')
//             .replace(/</g, '&lt;')
//             .replace(/>/g, '&gt;')
//             .replace(/"/g, '&quot;')
//             .replace(/'/g, '&#039;');
// };

// const formatDate = (d) => {
//   if (!d) return 'N/A';
//   try {
//     return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
//   } catch {
//     return String(d);
//   }
// };

// /**
//  * Determine status category and color from a response value.
//  * Accepts many variants (e.g., "Implemented", "Yes", "Partial", "Not Implemented", etc.).
//  */
// const getStatusInfo = (selectedValue) => {
//   const raw = (selectedValue === undefined || selectedValue === null) ? '' : String(selectedValue).trim().toLowerCase();
//   if (!raw) return { label: 'N/A', color: '#222' };

//   if (raw.includes('implemented') || raw === 'yes' || raw === 'true' || raw === 'ok') {
//     return { label: 'Implemented', color: '#2ecc71' }; // green
//   }
//   if (raw.includes('part') || raw === 'partial' || raw === 'partially implemented') {
//     return { label: 'Partially Implemented', color: '#f39c12' }; // orange
//   }
//   if (raw.includes('not') || raw === 'no' || raw === 'not implemented' || raw === 'false') {
//     return { label: 'Not Implemented', color: '#e74c3c' }; // red
//   }
//   // fallback: attempt numeric thresholds (0 fail, 100 pass)
//   const asNum = Number(raw);
//   if (!Number.isNaN(asNum)) {
//     if (asNum >= 80) return { label: 'Implemented', color: '#2ecc71' };
//     if (asNum >= 40) return { label: 'Partially Implemented', color: '#f39c12' };
//     return { label: 'Not Implemented', color: '#e74c3c' };
//   }

//   return { label: selectedValue, color: '#222' };
// };

// /**
//  * Build table of contents HTML from templateStructureSnapshot
//  */
// const buildToc = (templateStructure) => {
//   if (!Array.isArray(templateStructure) || templateStructure.length === 0) return '<p>(No content)</p>';
//   let tocHtml = '<ol class="toc-root">';
//   templateStructure.forEach((section, sIdx) => {
//     const secId = `sec-${sIdx}`;
//     tocHtml += `<li><a href="#${secId}">${escapeHtml(section.name || 'Unnamed Section')}</a>`;
//     if (Array.isArray(section.subSections) && section.subSections.length > 0) {
//       tocHtml += '<ol>';
//       section.subSections.forEach((ss, ssIdx) => {
//         const subId = `sec-${sIdx}-sub-${ssIdx}`;
//         tocHtml += `<li><a href="#${subId}">${escapeHtml(ss.name || 'Unnamed Subsection')}</a></li>`;
//       });
//       tocHtml += '</ol>';
//     }
//     tocHtml += '</li>';
//   });
//   tocHtml += '</ol>';
//   return tocHtml;
// };

// const generateReportHtml = (auditInstance = {}) => {
//   const company = auditInstance.company || {};
//   const template = auditInstance.template || {};
//   const responses = auditInstance.responses || [];
//   const templateStructure = auditInstance.templateStructureSnapshot || [];
//   const overallScore = (typeof auditInstance.overallScore === 'number') ? auditInstance.overallScore : 0;
//   const createdBy = auditInstance.createdBy || {};
//   const auditorsToDisplay = auditInstance.auditorsToDisplay || [];
//   const examinationEnvironment = auditInstance.examinationEnvironment || {};
//   const summaries = auditInstance.summaries || [];

//   const reportDate = formatDate(new Date());
//   const auditDateRange = (auditInstance.startDate || auditInstance.endDate) ?
//     `${formatDate(auditInstance.startDate)} - ${formatDate(auditInstance.endDate)}` : 'N/A';

//   // Auditor display string: either assigned auditors or creator (already passed in auditorsToDisplay)
//   const auditorLines = auditorsToDisplay.map(u => `${escapeHtml(u.firstName || '')} ${escapeHtml(u.lastName || '')} (${escapeHtml(u.email || '')})`).join('<br/>') || `${escapeHtml(createdBy.firstName || '')} ${escapeHtml(createdBy.lastName || '')} (${escapeHtml(createdBy.email || '')})`;

//   // Company contact person
//   const contactName = company.contactPerson?.name || '';
//   const contactEmail = company.contactPerson?.email || '';

//   // Build Table of Contents
//   const tocHtml = buildToc(templateStructure);

//   // Build main content (sections, subsections, questions)
//   let mainHtml = '';
//   templateStructure.forEach((section, sIdx) => {
//     const secId = `sec-${sIdx}`;
//     mainHtml += `<div class="section" id="${secId}"><h2 class="section-title">${escapeHtml(section.name || 'Unnamed Section')}</h2>`;
//     if (section.description) {
//       mainHtml += `<p class="section-desc">${escapeHtml(section.description)}</p>`;
//     }

//     (section.subSections || []).forEach((subSection, ssIdx) => {
//       const subId = `sec-${sIdx}-sub-${ssIdx}`;
//       mainHtml += `<div class="subsection" id="${subId}"><h3 class="subsection-title">${escapeHtml(subSection.name || 'Unnamed Subsection')}</h3>`;
//       if (subSection.description) {
//         mainHtml += `<p class="subsection-desc">${escapeHtml(subSection.description)}</p>`;
//       }

//       (subSection.questions || []).forEach((question, qIdx) => {
//         const resp = responses.find(r => r.questionId?.toString() === question._id?.toString()) || {};
//         const status = getStatusInfo(resp.selectedValue);
//         const answerText = escapeHtml(resp.selectedValue === undefined || resp.selectedValue === null ? 'N/A' : String(resp.selectedValue));
//         const commentHtml = resp.comment ? `<div class="comment"><strong>Comment:</strong><div>${escapeHtml(resp.comment)}</div></div>` : '';
//         const evidenceHtml = (Array.isArray(resp.evidenceUrls) && resp.evidenceUrls.length > 0) ? `<div class="evidence"><strong>Evidence:</strong><ul>${resp.evidenceUrls.map(u => `<li><a href="${escapeHtml(u)}">${escapeHtml(u)}</a></li>`).join('')}</ul></div>` : '';

//         mainHtml += `
//           <div class="question-block">
//             <div class="question-header" style="border-left:6px solid ${status.color};">
//               <p class="question-title" style="color:${status.color};"><strong>${escapeHtml(question.text || 'Untitled question')}</strong></p>
//               <p class="status-label" style="color:${status.color};"><em>${escapeHtml(status.label)}</em></p>
//             </div>
//             <div class="answer-row"><strong>Answer:</strong> ${answerText}</div>
//             ${commentHtml}
//             ${evidenceHtml}
//           </div>
//         `;
//       });

//       mainHtml += `</div>`; // subsection
//     });

//     mainHtml += `</div>`; // section
//   });

//   // Build examination environment HTML (compact table)
//   const envHtml = `
//     <table class="env">
//       <tr><td><strong>Locations</strong></td><td>${escapeHtml(String(examinationEnvironment.locations || 0))}</td></tr>
//       <tr><td><strong>Number of employees</strong></td><td>${escapeHtml(String(examinationEnvironment.employees || 0))}</td></tr>
//       <tr><td><strong>Clients (total)</strong></td><td>${escapeHtml(String(examinationEnvironment.clients?.total || 0))}</td></tr>
//       <tr><td><strong>Clients (managed)</strong></td><td>${escapeHtml(String(examinationEnvironment.clients?.managed || 0))}</td></tr>
//       <tr><td><strong>Clients (unmanaged)</strong></td><td>${escapeHtml(String(examinationEnvironment.clients?.unmanaged || 0))}</td></tr>
//       <tr><td><strong>Industry</strong></td><td>${escapeHtml(examinationEnvironment.industry || company.industry || '')}</td></tr>
//       <tr><td><strong>Physical servers</strong></td><td>${escapeHtml(String(examinationEnvironment.physicalServers || 0))}</td></tr>
//       <tr><td><strong>VM servers</strong></td><td>${escapeHtml(String(examinationEnvironment.vmServers || 0))}</td></tr>
//       <tr><td><strong>Firewalls</strong></td><td>${escapeHtml(String(examinationEnvironment.firewalls || 0))}</td></tr>
//       <tr><td><strong>Switches</strong></td><td>${escapeHtml(String(examinationEnvironment.switches || 0))}</td></tr>
//       <tr><td><strong>Mobile working</strong></td><td>${examinationEnvironment.mobileWorking ? 'Yes' : 'No'}</td></tr>
//       <tr><td><strong>Smartphones</strong></td><td>${examinationEnvironment.smartphones ? 'Yes' : 'No'}</td></tr>
//     </table>
//   `;

//   // Summaries HTML
//   const summariesHtml = (Array.isArray(summaries) && summaries.length > 0)
//     ? summaries.map(s => `<div class="summary"><p><strong>${escapeHtml(s.auditor?.firstName || '')} ${escapeHtml(s.auditor?.lastName || '')}</strong></p><p>${escapeHtml(s.text || '')}</p></div>`).join('')
//     : '<p>No summaries provided.</p>';

//   // Hardcoded long paragraphs exactly as supplied (Introduction, About the Company, Preface, Disclaimer, Handover, Thank You)
//   const introductionText = `
//     <p>When we speak about Cyber, Information, and IT Security, it is important to recognize that it is not only a technical matter. Technology plays a key role, but security is always the result of three dimensions working together:</p>
//     <ul>
//       <li><strong>Technology</strong> – the tools and systems that protect our data.</li>
//       <li><strong>Organization</strong> – the rules, processes, and responsibilities that guide how we work.</li>
//       <li><strong>People</strong> – the awareness, behavior, and decisions of everyone involved.</li>
//     </ul>
//     <p>Only when these three elements are combined can we create real protection. Focusing on technology alone is not enough. A secure company requires clear structures, well-trained employees, and a culture where security is seen as part of everyday work.</p>
//     <p>In today’s ever-changing world, the importance of protecting data and systems continues to grow. New threats appear daily, and digitalization increases the complexity of our business environment. For this reason, security must be given the right priority. It should not be treated as an “add-on” or a last step, but as an integral part of every decision, process, and investment.</p>
//     <p>This audit report is designed to make this approach practical and understandable. It gives a transparent overview of your current situation, highlights strengths and weaknesses, and provides clear guidance for next steps. The goal is not only to identify risks but also to enable your organization to build sustainable protection—so that technology, organization, and people are aligned and your company can continue to operate with confidence and resilience.</p>
//   `;

//   const aboutCompanyHardcoded = `
//     <p>We, DV-Beratung Koch, are your reliable partner and system house for information technology, telecommunications and video surveillance. Since 1993, we have been successfully implementing IT projects in the areas of government, healthcare and small and medium-sized enterprises.</p>
//     <p>Over the years, our product and service portfolio has been continuously adapted and expanded in line with technological developments. Our aim is to offer you a comprehensive range of IT solutions from a single source, including perfectly coordinated hardware and software for your company.</p>
//     <p>Through continuous training of our team, we ensure that our expert knowledge is always up to date in order to guarantee you modern IT consulting and implementation. We look forward to starting a successful and cooperative partnership with you.</p>
//   `;

//   const prefaceText = `
//     <p>The CyberAudit 360 Check Report has been developed to provide organizations with a structured and independent assessment of their information security posture. The aim is not only to identify technical issues, but to create a holistic view that combines technology, organization, and people.</p>
//     <p>This report is designed as a practical tool for decision-makers at all levels. Whether you have a technical background or not, the findings and recommendations are presented in a way that allows you to clearly understand where strengths lie, where risks exist, and what steps can be taken to achieve sustainable improvement.</p>
//     <p>Our mission is to support organizations in treating cybersecurity as an integral part of their business strategy and daily operations—helping to build trust, ensure compliance, and strengthen resilience in an ever-changing digital world.</p>
//   `;

//   const disclaimerText = `
//     <p>This report is based on the information, data, and evidence made available during the audit process. While every effort has been made to provide accurate and reliable findings, the results and recommendations are limited to the scope of the audit and the time of its execution.</p>
//     <p>The report should not be considered a guarantee against future risks or incidents. Security threats evolve constantly, and continuous monitoring, improvement, and adaptation remain essential.</p>
//     <p>The auditor and auditing organization do not assume liability for direct or indirect damages that may result from the use of this report. The responsibility for implementing and maintaining effective security measures lies with the audited organization.</p>
//   `;

//   const handoverText = `
//     <p>This page confirms that the audit report titled “Name of the audit performed for example ISO-2007 check” has been formally handed over by the auditor to the audited company.</p>
//     <p>By signing below, both parties acknowledge the reception of the full audit report and confirm that it has been delivered in its final version.</p>

//     <table class="handover">
//       <tr><td><strong>Auditor:</strong></td><td></td></tr>
//       <tr><td>Name:</td><td>_________________________</td></tr>
//       <tr><td>Organization:</td><td>_________________________</td></tr>
//       <tr><td>Date:</td><td>_________________________</td></tr>
//       <tr><td>Signature:</td><td>_________________________</td></tr>
//     </table>

//     <br/>

//     <table class="handover">
//       <tr><td><strong>Audited Company Representative:</strong></td><td></td></tr>
//       <tr><td>Name:</td><td>_________________________</td></tr>
//       <tr><td>Organization:</td><td>_________________________</td></tr>
//       <tr><td>Date:</td><td>_________________________</td></tr>
//       <tr><td>Signature:</td><td>_________________________</td></tr>
//     </table>
//   `;

//   const thankYouText = `
//     <p>Thank You for Choosing Cybersecurity Audit 360</p>
//     <p>We are committed to enhancing your organization's security posture and ensuring compliance in an ever evolving threat landscape. This report serves as a foundational step towards a more resilient and secure future.</p>
//     <p>Our team is dedicated to supporting your journey beyond this audit. We encourage you to review the findings and recommendations carefully and reach out to us for any clarifications or assistance in implementing the suggested improvements.</p>
//     <div class="contact">
//       <p>Email: <a href="mailto:info@cybersecurityaudit360.com">info@cybersecurityaudit360.com</a></p>
//       <p>Website: <a href="https://www.cybersecurityaudit360.com">www.cybersecurityaudit360.com</a></p>
//       <p><em>(for standard reports, we can customize this contact info per reseller)</em></p>
//     </div>
//     <p class="slogan">"Securing Your Digital Horizon, Together."</p>
//   `;

//   // Build full HTML (compact, 12pt)
//   const html = `
//   <!doctype html>
//   <html>
//   <head>
//     <meta charset="utf-8">
//     <title>Audit Report - ${escapeHtml(company.name || 'Unknown Company')}</title>
//     <style>
//       @page { margin: 0.6in; }
//       body { font-family: Arial, Helvetica, sans-serif; font-size: 12pt; color: #222; margin: 0; -webkit-print-color-adjust: exact; }
//       .container { padding: 0.6in; box-sizing: border-box; }
//       .cover { text-align: center; padding-top: 20px; padding-bottom: 10px; }
//       .logo { max-width: 140px; margin-bottom: 8px; }
//       h1 { margin: 0; font-size: 20pt; color: #0b615b; }
//       h2 { margin: 8px 0 6px 0; font-size: 14pt; color: #0b615b; }
//       h3 { margin: 6px 0 4px 0; font-size: 13pt; color: #333; }
//       p { margin: 6px 0; line-height: 1.25; }
//       .meta { margin: 8px 0 16px 0; }
//       .meta p { margin: 3px 0; }
//       .toc-root { margin: 6px 0 12px 0; padding-left: 18px; }
//       .section { margin-top: 8px; }
//       .section-title { font-size: 13pt; margin-bottom: 4px; }
//       .section-desc, .subsection-desc { font-size: 11pt; color: #444; margin-bottom: 8px; }
//       .subsection-title { font-size: 12pt; margin-bottom: 6px; }
//       .question-block { margin-bottom: 8px; padding: 8px; background: #fafafa; border: 1px solid #eee; border-radius: 4px; }
//       .question-title { font-size: 11.5pt; margin: 0 0 4px 0; }
//       .status-label { font-size: 10.5pt; margin: 0; }
//       .answer-row { margin: 6px 0; font-size: 11pt; }
//       .comment { margin-top: 6px; background:#f4f8f8; padding:6px; border-left:3px solid #0b615b; }
//       .evidence ul { margin:4px 0 0 18px; }
//       .env { width: 100%; border-collapse: collapse; margin: 6px 0 12px 0; }
//       .env td { padding: 6px 8px; border: 1px solid #e6e6e6; font-size: 11pt; }
//       .summary { margin:6px 0; padding:8px; background:#f6f6f6; border-radius:4px; }
//       .handover { width: 100%; margin-top: 8px; border-collapse: collapse; }
//       .handover td { padding: 6px; vertical-align: top; }
//       .contact { margin-top: 10px; }
//       .slogan { margin-top: 18px; font-style: italic; color: #0a4f4a; }
//       .small { font-size: 10pt; color: #555; }
//       a { color: #0b615b; }
//       .cover-quote { margin-top: 10px; font-style: italic; color: #555; max-width: 700px; margin-left: auto; margin-right: auto; }
//       /* minimize large breaks */
//       .page-break { page-break-after: avoid; }
//     </style>
//   </head>
//   <body>
//     <div class="container">

//       <!-- COVER -->
//       <div class="cover">
//         <img class="logo" src="${LOGO_URL}" alt="Logo" />
//         <h1>“Name of the audit”</h1>
//         <h2>Report</h2>

//         <div class="meta">
//           <p><strong>Report Date:</strong> ${escapeHtml(reportDate)}</p>
//           <p><strong>Audit Date:</strong> ${escapeHtml(auditDateRange)}</p>
//           <p><strong>Auditor:</strong><br/>${auditorLines}</p>
//         </div>

//         <div style="margin-top:8px;">
//           <p><strong>For</strong></p>
//           <p><strong>${escapeHtml(company.name || 'Test company (Company name)')}</strong></p>
//           <p>${escapeHtml(contactName || 'Test contact person (Company contact person)')} — ${escapeHtml(contactEmail || 'Test contact person email')}</p>
//         </div>

//         <div class="cover-quote">
//           <p><em>The strength of your defence lies in knowing and understanding your vulnerabilities. This audit provides you with the information you need to create a secure environment in your company. “You can only protect what you know.”</em></p>
//         </div>
//       </div>

//       <!-- TABLE OF CONTENTS -->
//       <div class="page-break">
//         <h2>Table of contents</h2>
//         <p class="small">(Coming from the Audit Template)</p>
//         ${tocHtml}
//       </div>

//       <!-- INTRODUCTION (Hard coded) -->
//       <div class="page-break">
//         <h2>Introduction</h2>
//         <p class="small">(Hard coded)</p>
//         ${introductionText}
//       </div>

//       <!-- ABOUT THE COMPANY (Hard coded + partner info dynamic) -->
//       <div class="page-break">
//         <h2>About the Company</h2>
//         <p class="small">(Hard coded)</p>
//         ${aboutCompanyHardcoded}

//         <p class="small">(Coming from the Partner company information)</p>
//         <p><strong>Partner / Audited company:</strong> ${escapeHtml(company.name || '')}</p>
//         <p><strong>Contact person:</strong> ${escapeHtml(contactName || '')} — ${escapeHtml(contactEmail || '')}</p>
//       </div>

//       <!-- PREFACE -->
//       <div class="page-break">
//         <h2>Preface</h2>
//         <p class="small">(Hard coded)</p>
//         ${prefaceText}
//       </div>

//       <!-- DISCLAIMER -->
//       <div class="page-break">
//         <h2>Disclaimer</h2>
//         <p class="small">(Hard coded)</p>
//         ${disclaimerText}
//       </div>

//       <!-- EXECUTIVE SUMMARY -->
//       <div class="page-break">
//         <h2>Executive Summary</h2>
//         <p class="small">(Combination of hard-coded and data from the audit)</p>
//         <p>This report provides a comprehensive overview of the cybersecurity posture for <strong>${escapeHtml(company.name || 'Test Company')}</strong> based on the "<strong>${escapeHtml(template.name || 'Name of the audit')}</strong>".</p>
//         <p>The audit covered key areas including Information Security Policies, Access Control, and other critical domains as defined in the selected template.</p>
//         <p>Overall, the assessment indicates a compliance score of <strong>${Number(overallScore).toFixed(2)}%</strong>. Detailed findings and observations are provided in the subsequent sections, along with specific recommendations for improvement.</p>
//         <p>It is crucial to address identified areas of non-compliance and implement recommended remediation actions to strengthen the overall security posture and ensure continuous adherence to best practices.</p>
//       </div>

//       <!-- SUMMARY (from template / auditors) -->
//       <div class="page-break">
//         <h2>Summary</h2>
//         <p class="small">(Coming from the Audit Template — auditor summary)</p>
//         ${summariesHtml}
//       </div>

//       <!-- EXAMINATION ENVIRONMENT -->
//       <div class="page-break">
//         <h2>Examination environment</h2>
//         <p class="small">(Coming from the Audit Template)</p>
//         <p>Example summary (the auditor should summarise the examination):</p>
//         ${envHtml}
//         <p class="small">“The question must be predetermined, and the examiner must simply ask it and attempt to summarise these points based on the answer.”</p>
//       </div>

//       <!-- MAIN CONTENT (Findings) -->
//       <div class="page-break">
//         <h2>Content</h2>
//         <p class="small">(Coming from the Audit Template)</p>
//         ${mainHtml}
//       </div>

//       <!-- HANDOVER -->
//       <div class="page-break">
//         <h2>Handover</h2>
//         <p class="small">(Combination of hard-coded and audit output/input)</p>
//         ${handoverText}
//       </div>

//       <!-- THANK YOU -->
//       <div class="page-break">
//         <h2>Thank You</h2>
//         <p class="small">(Combination of hard-coded and audit output/input)</p>
//         ${thankYouText}
//       </div>

//     </div> <!-- container -->
//   </body>
//   </html>
//   `;

//   return html;
// };

// export default generateReportHtml;


const LOGO_URL = 'https://images.credly.com/images/9c7b4205-6582-403c-b656-be1590248fcd/ISACA_CybersecurityAudit_badge_352x352.png';

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
    if (!raw) return { label: 'N/A', color: '#2c3e50' }; // Dark gray for N/A

    // Use a single, consistent color for all status labels to match the new design
    const color = '#3f51b5'; // Primary blue color

    if (raw.includes('implemented') || raw === 'yes' || raw === 'true' || raw === 'ok') {
        return { label: 'Implemented', color: color };
    }
    if (raw.includes('part') || raw === 'partial' || raw.includes('partially implemented')) {
        return { label: 'Partially Implemented', color: color };
    }
    if (raw.includes('not') || raw === 'no' || raw.includes('not implemented') || raw === 'false') {
        return { label: 'Not Implemented', color: color };
    }
    const asNum = Number(raw);
    if (!Number.isNaN(asNum)) {
        if (asNum >= 80) return { label: 'Implemented', color: color };
        if (asNum >= 40) return { label: 'Partially Implemented', color: color };
        return { label: 'Not Implemented', color: color };
    }

    return { label: selectedValue, color: color };
};

/**
 * Build table of contents HTML from templateStructureSnapshot
 */
const buildToc = (templateStructure) => {
    if (!Array.isArray(templateStructure) || templateStructure.length === 0) return '<p>(No content)</p>';
    let tocHtml = '<ul>';
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
    const examinationEnvironment = auditInstance.examinationEnvironment || {};
    const summaries = auditInstance.summaries || [];

    const reportDate = formatDate(new Date());
    const auditDateRange = (auditInstance.startDate || auditInstance.endDate) ?
        `${formatDate(auditInstance.startDate)} - ${formatDate(auditInstance.endDate)}` : 'N/A';

    const auditorLines = auditorsToDisplay.map(u => `${escapeHtml(u.firstName || '')} ${escapeHtml(u.lastName || '')} (${escapeHtml(u.email || '')})`).join('<br/>') || `${escapeHtml(createdBy.firstName || '')} ${escapeHtml(createdBy.lastName || '')} (${escapeHtml(createdBy.email || '')})`;

    const contactName = company.contactPerson?.name || '';
    const contactEmail = company.contactPerson?.email || '';

    const tocHtml = buildToc(templateStructure);

    let mainHtml = '';
    templateStructure.forEach((section, sIdx) => {
        const secId = `sec-${sIdx}`;
        mainHtml += `<div class="section" id="${secId}"><h2>${escapeHtml(section.name || 'Unnamed Section')}</h2>`;
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

                mainHtml += `
                    <div class="question-block">
                        <div class="question-header" style="border-left:6px solid ${status.color};">
                            <p class="question-title" style="color:${status.color};"><strong>${escapeHtml(question.text || 'Untitled question')}</strong></p>
                            <p class="status-label" style="color:${status.color};"><em>${escapeHtml(status.label)}</em></p>
                        </div>
                        <div class="answer-row"><strong>Answer:</strong> ${answerText}</div>
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
            <tr><td><strong>Locations</strong></td><td>${escapeHtml(String(examinationEnvironment.locations || 0))}</td></tr>
            <tr><td><strong>Number of employees</strong></td><td>${escapeHtml(String(examinationEnvironment.employees || 0))}</td></tr>
            <tr><td><strong>Clients (total)</strong></td><td>${escapeHtml(String(examinationEnvironment.clients?.total || 0))}</td></tr>
            <tr><td><strong>Clients (managed)</strong></td><td>${escapeHtml(String(examinationEnvironment.clients?.managed || 0))}</td></tr>
            <tr><td><strong>Clients (unmanaged)</strong></td><td>${escapeHtml(String(examinationEnvironment.clients?.unmanaged || 0))}</td></tr>
            <tr><td><strong>Industry</strong></td><td>${escapeHtml(examinationEnvironment.industry || company.industry || '')}</td></tr>
            <tr><td><strong>Physical servers</strong></td><td>${escapeHtml(String(examinationEnvironment.physicalServers || 0))}</td></tr>
            <tr><td><strong>VM servers</strong></td><td>${escapeHtml(String(examinationEnvironment.vmServers || 0))}</td></tr>
            <tr><td><strong>Firewalls</strong></td><td>${escapeHtml(String(examinationEnvironment.firewalls || 0))}</td></tr>
            <tr><td><strong>Switches</strong></td><td>${escapeHtml(String(examinationEnvironment.switches || 0))}</td></tr>
            <tr><td><strong>Mobile working</strong></td><td>${examinationEnvironment.mobileWorking ? 'Yes' : 'No'}</td></tr>
            <tr><td><strong>Smartphones</strong></td><td>${examinationEnvironment.smartphones ? 'Yes' : 'No'}</td></tr>
        </table>
    `;

    const summariesHtml = (Array.isArray(summaries) && summaries.length > 0)
        ? summaries.map(s => `<div class="summary"><p><strong>${escapeHtml(s.auditor?.firstName || '')} ${escapeHtml(s.auditor?.lastName || '')}</strong></p><p>${escapeHtml(s.text || '')}</p></div>`).join('')
        : '<p>No summaries provided.</p>';

    const introductionText = `
        <p>When we speak about Cyber, Information, and IT Security, it is important to recognize that it is not only a technical matter. Technology plays a key role, but security is always the result of three dimensions working together:</p>
        <ul>
            <li><strong>Technology</strong> – the tools and systems that protect our data.</li>
            <li><strong>Organization</strong> – the rules, processes, and responsibilities that guide how we work.</li>
            <li><strong>People</strong> – the awareness, behavior, and decisions of everyone involved.</li>
        </ul>
        <p>Only when these three elements are combined can we create real protection. Focusing on technology alone is not enough. A secure company requires clear structures, well-trained employees, and a culture where security is seen as part of everyday work.</p>
        <p>In today’s ever-changing world, the importance of protecting data and systems continues to grow. New threats appear daily, and digitalization increases the complexity of our business environment. For this reason, security must be given the right priority. It should not be treated as an “add-on” or a last step, but as an integral part of every decision, process, and investment.</p>
        <p>This audit report is designed to make this approach practical and understandable. It gives a transparent overview of your current situation, highlights strengths and weaknesses, and provides clear guidance for next steps. The goal is not only to identify risks but also to enable your organization to build sustainable protection—so that technology, organization, and people are aligned and your company can continue to operate with confidence and resilience.</p>
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

    const handoverText = `
        <p>This page confirms that the audit report titled “Name of the audit performed for example ISO-2007 check” has been formally handed over by the auditor to the audited company.</p>
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
        <p>Thank You for Choosing Cybersecurity Audit 360</p>
        <p>We are committed to enhancing your organization's security posture and ensuring compliance in an ever evolving threat landscape. This report serves as a foundational step towards a more resilient and secure future.</p>
        <p>Our team is dedicated to supporting your journey beyond this audit. We encourage you to review the findings and recommendations carefully and reach out to us for any clarifications or assistance in implementing the suggested improvements.</p>
        <div class="contact">
            <p>Email: <a href="mailto:info@cybersecurityaudit360.com">info@cybersecurityaudit360.com</a></p>
            <p>Website: <a href="https://www.cybersecurityaudit360.com">www.cybersecurityaudit360.com</a></p>
        </div>
        <p class="slogan">"Securing Your Digital Horizon, Together."</p>
    `;

    const html = `
    <!doctype html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Audit Report - ${escapeHtml(company.name || 'Unknown Company')}</title>
        <style>
            @page { margin: 0.6in; }
            body { font-family: Arial, Helvetica, sans-serif; font-size: 12pt; color: #2c3e50; margin: 0; -webkit-print-color-adjust: exact; }
            .container { padding: 0.6in; box-sizing: border-box; }
            .cover { text-align: center; padding-top: 20px; padding-bottom: 10px; }
            .logo { max-width: 140px; margin-bottom: 8px; }
            h1 { margin: 0; font-size: 20pt; color: #3f51b5; text-align: center; }
            h2 { margin: 40px 0 10px 0; font-size: 16pt; color: #3f51b5; text-align: center; border-bottom: 2px solid #3f51b5; padding-bottom: 5px; }
            h3 { margin: 25px 0 8px 0; font-size: 14pt; color: #2c3e50; text-align: center; border-bottom: 1px solid #e0e0e0; padding-bottom: 3px; }
            p { margin: 6px 0; line-height: 1.25; }
            .meta { margin: 8px 0 16px 0; }
            .meta p { margin: 3px 0; }
            .toc-root { margin: 6px 0 12px 0; padding-left: 18px; }
            .section { margin-top: 20px; }
            .section-desc, .subsection-desc { font-size: 11pt; color: #444; margin-bottom: 8px; }
            .question-block { margin-bottom: 8px; padding: 8px; background: #fafafa; border: 1px solid #eee; border-radius: 4px; }
            .question-title { font-size: 11.5pt; margin: 0 0 4px 0; }
            .status-label { font-size: 10.5pt; margin: 0; }
            .answer-row { margin: 6px 0; font-size: 11pt; }
            .comment { margin-top: 6px; background:#e6f7f6; padding:6px; border-left:3px solid #3f51b5; }
            .evidence ul { margin:4px 0 0 18px; }
            .env { width: 100%; border-collapse: collapse; margin: 6px 0 12px 0; }
            .env td { padding: 6px 8px; border: 1px solid #e6e6e6; font-size: 11pt; }
            .summary { margin:6px 0; padding:8px; background:#f6f6f6; border-radius:4px; }
            .handover { width: 100%; margin-top: 8px; border-collapse: collapse; }
            .handover td { padding: 6px; vertical-align: top; }
            .contact { margin-top: 10px; }
            .slogan { margin-top: 18px; font-style: italic; color: #3f51b5; }
            a { color: #3f51b5; }
            .cover-quote { margin-top: 10px; font-style: italic; color: #555; max-width: 700px; margin-left: auto; margin-right: auto; }
            .page-break { page-break-before: always; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="cover">
                <img class="logo" src="${LOGO_URL}" alt="Logo" />
                <h1>${escapeHtml(template.name || 'Name of the audit')}</h1>
                <h2>Report</h2>
                <div class="meta">
                    <p><strong>Report Date:</strong> ${escapeHtml(reportDate)}</p>
                    <p><strong>Audit Date:</strong> ${escapeHtml(auditDateRange)}</p>
                    <p><strong>Auditor:</strong><br/>${auditorLines}</p>
                </div>
                <div style="margin-top:8px;">
                    <p><strong>For</strong></p>
                    <p><strong>${escapeHtml(company.name || 'Test company')}</strong></p>
                    <p>${escapeHtml(contactName || 'Test contact person')} — ${escapeHtml(contactEmail || 'Test contact person email')}</p>
                </div>
                <div class="cover-quote">
                    <p><em>The strength of your defence lies in knowing and understanding your vulnerabilities. This audit provides you with the information you need to create a secure environment in your company. “You can only protect what you know.”</em></p>
                </div>
            </div>
        </div>

        <div class="container page-break">
            <h2>Table of Contents</h2>
            ${tocHtml}
        </div>

        <div class="container">
            <h2>Introduction</h2>
            ${introductionText}
        </div>

        <div class="container">
            <h2>About the Company</h2>
            <p><strong>${escapeHtml(company.name || 'Test company')}</strong> is a prominent player in the **${escapeHtml(company.industry || '')}** industry. This audit was conducted to assess the security posture of their operational environment, providing a detailed overview of their current defenses and identifying key areas for improvement.</p>
            <p><strong>Contact person:</strong> ${escapeHtml(contactName || '')} — ${escapeHtml(contactEmail || '')}</p>
            <p>${aboutCompanyHardcoded}</p>
        </div>

        <div class="container">
            <h2>Preface</h2>
            ${prefaceText}
        </div>

        <div class="container">
            <h2>Disclaimer</h2>
            ${disclaimerText}
        </div>

        <div class="container">
            <h2>Executive Summary</h2>
            <p>This report provides a comprehensive overview of the cybersecurity posture for <strong>${escapeHtml(company.name || 'Test Company')}</strong> based on the "<strong>${escapeHtml(template.name || 'Name of the audit')}</strong>".</p>
            <p>The audit covered key areas including Information Security Policies, Access Control, and other critical domains as defined in the selected template.</p>
            <p>Overall, the assessment indicates a compliance score of <strong>${Number(overallScore).toFixed(2)}%</strong>. Detailed findings and observations are provided in the subsequent sections, along with specific recommendations for improvement.</p>
            <p>It is crucial to address identified areas of non-compliance and implement recommended remediation actions to strengthen the overall security posture and ensure continuous adherence to best practices.</p>
        </div>

        <div class="container">
            <h2>Summary</h2>
            ${summariesHtml}
        </div>

        <div class="container">
            <h2>Examination environment</h2>
            <p>Example summary (the auditor should summarise the examination):</p>
            ${envHtml}
            <p>“The question must be predetermined, and the examiner must simply ask it and attempt to summarise these points based on the answer.”</p>
        </div>

        <div class="container">
            <h2>Content</h2>
            ${mainHtml}
        </div>

        <div class="container page-break">
            <h2>Handover</h2>
            ${handoverText}
        </div>

        <div class="container page-break">
            <h2>Thank You</h2>
            ${thankYouText}
        </div>

    </body>
    </html>
    `;

    return html;
};

export default generateReportHtml;