 

// //============================================================COMPLETE FIXED REPORT=========================//
// //____________________________________________________________
// //  1.  HAND-WRITTEN TRILINGUAL MINI-DICTIONARY
// //____________________________________________________________
// const DICT = {
//   REPORT_TITLE:  { EN: 'REPORT', FR: 'RAPPORT', DE: 'BERICHT' },
//   REPORT_DATE:   { EN: 'Report Date:', FR: 'Date du rapport :', DE: 'Berichtsdatum:' },
//   EXAM_DATE:     { EN: 'Assessment Date:', FR: "Date de l'évaluation :", DE: 'Bewertungsdatum:' },
//   EXAMINER:      { EN: 'Examiner:', FR: 'Examinateur :', DE: 'Prüfer:' },
//   EMAIL:         { EN: 'E-Mail:', FR: 'E-Mail :', DE: 'E-Mail:' },
//   FOR:           { EN: 'FOR', FR: 'POUR', DE: 'FÜR' },

//   COVER_QUOTE_1: {
//     EN: 'The strength of your defense lies in knowing and understanding your vulnerabilities. This assessment provides you with the information you need to create a secure environment in your company.',
//     FR: 'La force de votre défense réside dans la connaissance et la compréhension de vos vulnérabilités. Cette évaluation vous fournit les informations nécessaires pour créer un environnement sécurisé dans votre entreprise.',
//     DE: 'Die Stärke Ihrer Verteidigung liegt im Kennen und Verstehen Ihrer Schwachstellen. Diese Bewertung liefert Ihnen die Informationen, die Sie benötigen, um eine sichere Umgebung in Ihrem Unternehmen zu schaffen.'
//   },
//   COVER_QUOTE_2: { EN: '“You can only protect what you know.”', FR: '« Vous ne pouvez protéger que ce que vous connaissez. »', DE: '„Sie können nur schützen, was Sie kennen.“' },

//   TOC:              { EN: 'Table of Contents', FR: 'Table des matières', DE: 'Inhaltsverzeichnis' },
//   INTRO:            { EN: 'Introduction', FR: 'Introduction', DE: 'Einleitung' },
//   ABOUT_CONSULTING: { EN: 'About the Consulting Company', FR: 'À propos de la société de conseil', DE: 'Über die Beratungsfirma' },
//   ABOUT_AUDITED:    { EN: 'About the Examined Company', FR: 'À propos de la société examinée', DE: 'Über das geprüfte Unternehmen' },
//   PREFACE:          { EN: 'Preface', FR: 'Préface', DE: 'Vorwort' },
//   DISCLAIMER:       { EN: 'Disclaimer', FR: 'Avertissement', DE: 'Haftungsausschluss' },
//   EXEC_SUMMARY:     { EN: 'Executive Summary', FR: 'Résumé exécutif', DE: 'Executive Summary' },
//   EXAM_ENV:         { EN: 'Examination Environment', FR: "Environnement d'évaluation", DE: 'Prüfungsumgebung' },
//   THE_CONTENT:      { EN: 'The Content', FR: 'Le Contenu', DE: 'Der Inhalt' },
//   HANDOVER:         { EN: 'Handover', FR: 'Remise', DE: 'Übergabe' },
//   THANK_YOU:        { EN: 'Thank You', FR: 'Merci', DE: 'Vielen Dank' },

//   NO_RESPONSE: { EN: 'No response provided', FR: 'Aucune réponse fournie', DE: 'Keine Antwort gegeben' }
// };

// //____________________________________________________________
// //  2.  HELPERS
// //____________________________________________________________
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
//   if (!d) return 'N/A';
//   try {
//     const date = new Date(d);
//     if (isNaN(date.getTime())) return 'N/A';
//     return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
//   } catch {
//     return 'N/A';
//   }
// };

// const getStatusInfo = (selectedValue) => {
//   if (selectedValue === undefined || selectedValue === null || selectedValue === '') return { label: 'N/A', color: '#a3a3a3' };
//   const raw = Array.isArray(selectedValue) ? selectedValue.map(v => String(v).trim().toLowerCase()) : [String(selectedValue).trim().toLowerCase()];
//   const negative = ['not implemented', 'no', 'non-compliant', 'absent'];
//   const partial  = ['partially implemented', 'partial', 'partially'];
//   const positive = ['implemented', 'yes', 'compliant', 'fully implemented'];
//   const isNeg  = raw.some(v => negative.some(k => v.includes(k))) || raw.includes('no') || raw.includes('non-compliant');
//   const isPart = raw.some(v => partial.some(k => v.includes(k)));
//   const isPos  = raw.some(v => positive.some(k => v.includes(k))) && !isNeg && !isPart;
//   let color = '#a3a3a3';
//   if (isNeg) color = '#ef4444';
//   if (isPart) color = '#f59e0b';
//   if (isPos) color = '#16a34a';
//   return { label: raw.join(', ') || 'N/A', color };
// };

// /* --------------------------------------------------------
//    TOC – clean hierarchical numbering, no CSS counters
//    -------------------------------------------------------- */
// const buildToc = (templateStructure, lang) => {
//   const order = [
//     { key: 'intro',      label: DICT.INTRO[lang] },
//     { key: 'consulting', label: DICT.ABOUT_CONSULTING[lang] },
//     { key: 'audited',    label: DICT.ABOUT_AUDITED[lang] },
//     { key: 'preface',    label: DICT.PREFACE[lang] },
//     { key: 'disclaimer', label: DICT.DISCLAIMER[lang] },
//     { key: 'exec',       label: DICT.EXEC_SUMMARY[lang] },
//     { key: 'env',        label: DICT.EXAM_ENV[lang] },
//     { key: 'content',    label: DICT.THE_CONTENT[lang] },
//     { key: 'handover',   label: DICT.HANDOVER[lang] },
//     { key: 'thank',      label: DICT.THANK_YOU[lang] }
//   ];

//   let html = '<ul class="toc-root">';
//   order.forEach((item, topIdx) => {
//     const topId  = `sec-${topIdx}`;
//     const topNum = topIdx + 1;
//     html += `<li><a href="#${topId}">${topNum}. ${escapeHtml(item.label)}</a>`;

//     if (item.key === 'content' && Array.isArray(templateStructure)) {
//       html += '<ul>';
//       templateStructure.forEach((sec, secIdx) => {
//         const secId  = `content-sec-${secIdx}`;
//         const secNum = `${topNum}.${secIdx + 1}`;
//         html += `<li><a href="#${secId}">${secNum} ${escapeHtml(sec.name || 'Unnamed Section')}</a>`;
//         if (Array.isArray(sec.subSections)) {
//           html += '<ul>';
//           sec.subSections.forEach((sub, subIdx) => {
//             const subNum = `${secNum}.${subIdx + 1}`;
//             html += `<li><a href="#${secId}-sub-${subIdx}">${subNum} ${escapeHtml(sub.name || 'Unnamed Subsection')}</a></li>`;
//           });
//           html += '</ul>';
//         }
//         html += '</li>';
//       });
//       html += '</ul>';
//     }
//     html += '</li>';
//   });
//   html += '</ul>';
//   return html;
// };

// //____________________________________________________________
// //  4.  MAIN GENERATOR
// //____________________________________________________________
// const generateReportHtml = (auditInstance = {}, lang = 'EN') => {
//   const company   = auditInstance.company || {};
//   const template  = auditInstance.template || {};
//   const responses = auditInstance.responses || [];
//   const struct    = auditInstance.templateStructureSnapshot || [];
//   const overallScore = Math.round((typeof auditInstance.overallScore === 'number') ? auditInstance.overallScore : 0);
//   const createdBy = auditInstance.createdBy || {};
//   const auditors  = auditInstance.auditorsToDisplay || [];

//   const examEnv = { ...company.examinationEnvironment, ...auditInstance.examinationEnvironment };

//   const reportDate = formatDate(new Date());
//   const startDate  = formatDate(auditInstance.startDate);
//   const endDate    = formatDate(auditInstance.endDate);
//   let assessmentDateRange = 'N/A';
//   if (startDate && endDate && startDate !== 'N/A' && endDate !== 'N/A') assessmentDateRange = `${startDate} - ${endDate}`;
//   else if (startDate && startDate !== 'N/A') assessmentDateRange = startDate;
//   else if (endDate && endDate !== 'N/A') assessmentDateRange = endDate;

//   const examinerName  = auditors[0]?.firstName && auditors[0]?.lastName
//     ? `${auditors[0].firstName} ${auditors[0].lastName}`
//     : `${createdBy.firstName || ''} ${createdBy.lastName || ''}`.trim() || 'Examiner';
//   const examinerEmail = auditors[0]?.email || createdBy.email || 'examiner@isarion.com';

//   const contactName  = company.contactPerson?.name  || 'Test contact person';
//   const contactEmail = company.contactPerson?.email || 'test@example.com';
//   const companyName  = company.name || 'Test company';

//   const tocHtml = buildToc(struct, lang);

//   /* ---------- CONTENT – headings use identical clean numbers ---------- */
//   const contentSectionNumber = 8;
//   let contentHtml = '';
//   struct.forEach((section, sIdx) => {
//     const secId  = `content-sec-${sIdx}`;
//     const secNum = `${contentSectionNumber}.${sIdx + 1}`;
//     contentHtml += `<div id="${secId}"><h2 class="header-spacing">${secNum} ${escapeHtml(section.name || 'Unnamed Section')}</h2>`;
//     if (section.description) contentHtml += `<p class="section-desc">${escapeHtml(section.description)}</p>`;

//     (section.subSections || []).forEach((sub, ssIdx) => {
//       const subId  = `${secId}-sub-${ssIdx}`;
//       const subNum = `${secNum}.${ssIdx + 1}`;
//       contentHtml += `<div id="${subId}"><h3 class="header-spacing">${subNum} ${escapeHtml(sub.name || 'Unnamed Subsection')}</h3>`;
//       if (sub.description) contentHtml += `<p class="subsection-desc">${escapeHtml(sub.description)}</p>`;

//       (sub.questions || []).forEach((q) => {
//         const resp = responses.find(r => String(r.questionId) === String(q._id)) || {};
//         let display = resp.selectedValue;
//         if (Array.isArray(display)) display = display.join(', ');
//         else if (display === undefined || display === null || display === '') display = DICT.NO_RESPONSE[lang];

//         const status = getStatusInfo(resp.selectedValue);
//         const answerHtml = `<span style="color:${status.color};"><strong>${escapeHtml(String(display))}</strong></span>`;

//         const commentHtml = resp.comment
//           ? `<div class="comment"><strong>Comment:</strong><div>${escapeHtml(resp.comment)}</div></div>` : '';
//         const recomHtml = resp.recommendation
//           ? `<div class="recommendation"><strong>Recommendation:</strong><div>${escapeHtml(resp.recommendation)}</div></div>` : '';
//         const evidHtml = (Array.isArray(resp.evidenceUrls) && resp.evidenceUrls.length)
//           ? `<div class="evidence"><strong>Evidence:</strong><ul>${resp.evidenceUrls.map(u => `<li><a href="${escapeHtml(u)}">${escapeHtml(u)}</a></li>`).join('')}</ul></div>` : '';

//         contentHtml += `
//           <div class="question-block">
//             <div class="question-header" style="border-left:3px solid ${status.color};">
//               <p class="question-title"><strong>${escapeHtml(q.text || 'Untitled question')}</strong></p>
//             </div>
//             <div class="answer-row"><strong>Answer:</strong> ${answerHtml}</div>
//             ${recomHtml}${commentHtml}${evidHtml}
//           </div>`;
//       });
//       contentHtml += '</div>';
//     });
//     contentHtml += '</div>';
//   });

//   /* ---------- static texts ---------- */
//   const introText = `
// <p>When we speak about Cyber, Information, and IT Security, it is important to recognize that it is not only a technical matter. Technology plays a key role, but security is always the result of three dimensions working together:
// <ul>
//   <li><strong>Technology</strong> – the tools and systems that protect our data.</li>
//   <li><strong>Organization</strong> – the rules, processes, and responsibilities that guide how we work.</li>
//   <li><strong>People</strong> – the awareness, behavior, and decisions of everyone involved.</li>
// </ul>
// Only when these three elements are combined can we create real protection. Focusing on technology alone is not enough. A secure company requires clear structures, well-trained employees, and a culture where security is seen as part of everyday work.
// <p>In today's ever-changing world, the importance of protecting data and systems continues to grow. New threats appear daily, and digitalization increases the complexity of our business environment. For this reason, <strong>security must be given the right priority</strong>. It should not be treated as an "add-on" or a last step, but as an <strong>integral part of every decision, process, and investment</strong>.
// <p>This assessment report is designed to make this approach practical and understandable. It gives a transparent overview of your current situation, highlights strengths and weaknesses, and provides clear guidance for next steps. The goal is not only to identify risks but also to enable your organization to <strong>build sustainable protection</strong> so that technology, organization, and people are aligned and your company can continue to operate with confidence and resilience.</p>`;

//   const aboutConsulting = `
// <p>We at <strong>BKGS Consulting</strong> believe that audits and assessments should strengthen companies rather than slow them down. In a world where compliance requirements, standards, and technologies evolve faster than ever, many companies still rely on rigid tools and outdated methods to evaluate performance, security, and quality. At <strong>BKGS Consulting</strong>, we exist to change that. Our mission is to make assessments and audits simple, smart, and adaptable, transforming them from static checklists into dynamic instruments for growth, trust, and improvement. We believe that every organization, regardless of its size, sector, or country deserves access to modern, intelligent solutions that align with its specific needs, frameworks, and ambitions.
// <p>We combine <strong>technology, methodology,</strong> and <strong>human expertise</strong> to develop flexible, powerful audit and assessment solutions tailored to the individual needs of our clients. Our work combines <strong>32 years of consulting experience</strong> with state-of-the-art software platforms, ensuring that every client benefits from precision, scalability, and adaptability.
// <p>We don't just deliver tools, we build <strong>solutions that fit your context</strong>. From defining requirements to designing dashboards, from building reporting logic to automating workflows, our team ensures that your assessment system reflects <strong>your goals, standards</strong>, and <strong>operational culture</strong>.
// <p>We envision a future where audits and assessments are not bureaucratic obligations, but <strong>strategic enablers of trust and performance</strong>. A world where organizations of any size can assess themselves <strong>continuously</strong>, adjust in real time, and make decisions with confidence.
// <h3 class="slogan-local">"Improvement begins with assessment and assessment begins with the right questions"</h3>`;

//   const aboutAudited = `
// <p>As a prominent player in the <strong>${escapeHtml(company.industry || '')}</strong> industry, <strong>${escapeHtml(companyName)}</strong> has shown a strong commitment to maintaining a secure and reliable operational environment. Our assessment was conducted to evaluate their current information, IT and security posture, providing a detailed overview of their defenses and identifying key areas for continuous improvement. This assessment highlights their dedication to protecting their digital assets and fostering a resilient business infrastructure.
// <p style="margin-top:5px;"><strong>Contact person:</strong> ${escapeHtml(contactName)} ${escapeHtml(contactEmail)}</p>
// ${company.generalInfo ? `<p class="justify-text">${escapeHtml(company.generalInfo)}</p>` : ''}`;

//   const prefaceText = `
// <p>The <strong>ISARION (Information Security Assessment Evolution) - Report</strong> has been developed to provide organizations with a structured and independent assessment of their information security posture. The aim is not only to identify technical issues, but to create a holistic view that combines <strong>technology, organization, and people</strong>.
// <p>This report is designed as a practical tool for decision-makers at all levels. Whether you have a technical background or not, the findings and recommendations are presented in a way that allows you to clearly understand where strengths lie, where risks exist, and what steps can be taken to achieve sustainable improvement.
// <p>Our mission is to support organizations in treating cybersecurity as an integral part of their business strategy and daily operations, helping to build trust, ensure compliance, and strengthen resilience in an ever-changing digital world.`;

//   const disclaimerText = `
// <p>This report is based on the information, data, and evidence made available during the assessment process. While every effort has been made to provide accurate and reliable findings, the results and recommendations are limited to the scope of the assessment and the time of its execution.
// <p>The report should not be considered a guarantee against future risks or incidents. Security threats evolve constantly, and continuous monitoring, improvement, and adaptation remain essential.
// <p>The assessor and assessing organization do not assume liability for direct or indirect damages that may result from the use of this report. The responsibility for implementing and maintaining effective security measures lies with the assessed organization.`;

//   const execSummaryText = `
// <p>This report provides a comprehensive overview of the Information, IT and cybersecurity posture for <strong>${escapeHtml(companyName)}</strong> based on the "<strong>${escapeHtml(template.name || '')}</strong>".
// <p>The assessment covered key areas including Information Security Policies, Access Control, Physical Security, Mobile & Remote Working, Awareness, Compliance & Legal Requirements and other critical domains as defined in the selected template.
// <p>Overall, the assessment indicates a compliance score of <strong>${Math.round(overallScore)}%</strong>. Detailed findings and observations are provided in the subsequent sections, along with specific recommendations for improvement.
// <p>It is crucial to address identified areas of non-compliance and implement recommended remediation actions to strengthen the overall security posture and ensure continuous adherence to best practices.

// <h3 class="slogan-local" style="text-align:center;margin-top:25px;">"Cyber resilience as part of your organization's reputation"</h3>
// <p>Cyber resilience refers to an entity's ability to continuously deliver the intended outcome, despite cyber-attacks. Resilience to cyber-attacks is essential to IT systems, critical infrastructure, business processes, organizations, societies, and nation-states.
// <p>Resilience is like juggling lots of balls: it is not enough to optimize individual points. The key to success lies in the ability to think holistically and to orchestrate several strands of action in parallel, from awareness training and technical security to clear crisis management. Resources (budget and people) alone does not lead to success. This is also evident in reality: organizations with the largest IT budgets are not automatically the best protected. The decisive factor is whether security and resilience issues are at the top of the agenda and whether processes, responsibilities and recovery concepts are regularly reviewed, tested and further developed. Cyber resilience is therefore not a project with an end date, but an ongoing management task. As with sustainability, it requires a cultural shift: away from pure compliance thinking and towards genuine risk competence at all levels.
// <p>The biggest mistake is to believe that you are not affected, or even to rely on getting help in an emergency. Because when cyber-attacks become a reality, only one thing matters: <strong>"how well prepared an organization is"</strong>. Resilience begins in the mind and unfolds its effect where technology, processes and people interact. Those who take the issue seriously not only gain security, but also the trust of customers, partners, employees and ultimately the market. Cyber resilience is not just about keeping systems running. It's about taking responsibility and maintaining trust, especially when it matters, and with this assessment, you have just taken the first step. Congratulations!</p>`;

//   const handoverHtml = `
// <p class="justify-text static-text">This page confirms that the assessment report titled "<strong>${escapeHtml(template.name || '')}</strong>" has been formally handed over by the assessor to the assessed company.
// <p class="justify-text static-text">By signing below, both parties acknowledge the reception of the full assessment report and confirm that it has been delivered in its final version.

// <div class="handover-section">
//   <h3 class="handover-heading">Consultant</h3>
//   <table class="handover-table">
//     <tr><td>Name:</td><td><span class="signature-input"></span></td><td>Organization:</td><td><span class="signature-input"></span></td><td>Date:</td><td><span class="signature-input"></span></td></tr>
//     <tr><td colspan="6" class="signature-line-row">Signature: <span class="signature-line"></span></td></tr>
//   </table>
// </div>

// <div class="handover-section" style="margin-top:30px;">
//   <h3 class="handover-heading">Consulted Company Representative</h3>
//   <table class="handover-table">
//     <tr><td>Name:</td><td><span class="signature-input"></span></td><td>Organization:</td><td><span class="signature-input"></span></td><td>Date:</td><td><span class="signature-input"></span></td></tr>
//     <tr><td colspan="6" class="signature-line-row">Signature: <span class="signature-line"></span></td></tr>
//   </table>
// </div>`;

// /*  “Thank You” – new paragraph placed BEFORE contact/slogan  */
// const thankYouHtml = `
// <div style="text-align:center;">
//   <h2 style="border-bottom:none;margin-bottom:5px;font-size:26pt;color:#014f65;margin-top:0;font-family:'Lexend',sans-serif;">${DICT.THANK_YOU[lang]}</h2>
//   <p style="font-size:16pt;margin-bottom:15px;margin-top:5px;font-weight:bold;line-height:1.5;">for choosing ISARION</p>
//   <p class="justify-text static-text">We are committed to enhancing your organisation's security posture and ensuring compliance in an ever-evolving threat landscape. This report serves as a foundational step towards a more resilient and secure future.</p>
  
//   <!-- NEW PARAGRAPH STARTS HERE -->
//   <p class="justify-text static-text" style="margin-top:25px;">
//     Our team is dedicated to supporting your journey beyond this assessment. We encourage you to review the findings and recommendations carefully and reach out to us for any clarifications or assistance in implementing the suggested improvements.
//   </p>

//   <p class="justify-text static-text">For further discussions or to schedule a follow-up consultation, please contact your partner:</p>
//   <div class="contact">
//     <p class="static-text"><strong>${escapeHtml(examinerName)} – <a href="mailto:${escapeHtml(examinerEmail)}" class="no-style-link">${escapeHtml(examinerEmail)}</a></strong></p>
//   </div>
//   <h3 class="slogan-center" style="font-size:14pt;margin-top:20px;"><strong>"Improvement begins with assessment and assessment begins with the right questions"</strong></h3>
// </div>`;

//   /* =========================================================
//    *  HTML SHELL – CSS counters removed, clean TOC
//    * ========================================================= */
//   const html = `<!doctype html>
// <html>
// <head>
//   <meta charset="utf-8">
//   <title>${escapeHtml(template.name || 'Assessment Report')} – ${escapeHtml(companyName)}</title>
//   <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400 ;700&display=swap" rel="stylesheet">
//   <style>
//     @page{margin:0.35in; @bottom-center{content:counter(page)"/"counter(pages); font-family:Arial,sans-serif; font-size:10pt; color:#666;}}
//     body{font-family:Arial,sans-serif; font-size:14pt; color:#2c3e50; margin:0; -webkit-print-color-adjust:exact;text-align:justify;}
//     .container{padding:0.35in; box-sizing:border-box;}
//     .cover-page{height:9.3in; display:flex; flex-direction:column; justify-content:space-between; text-align:center; padding:20px 0;}
//     .logo{max-width:350px;}
//     .cover-quote{margin-top:30px; font-size:15pt; max-width:700px; margin-left:auto; margin-right:auto;}
//     .slogan-center{font-size:14pt; margin-top:20px; font-style:italic; color:#014f65; text-align:center;}
//     .slogan-local{text-align:center; font-style:italic; color:#014f65; margin-top:20px; font-size:16pt;}
//     .no-style-link{color:#000 !important; text-decoration:none !important;}
//     h2,h3,.cover-title h1,.cover-title h2{font-family:'Lexend',sans-serif !important; color:#014f65;}
//     h2{font-size:26pt !important; text-align:center;} h3{font-size:20pt !important;}
//     .header-spacing{margin:25px 0 16px !important;}
//     .static-text,.justify-text{line-height:1.5 !important;}
//     .page-break{page-break-before:always;} .section-page-break{page-break-before:always;}
//     .subsection{page-break-inside:avoid;}
//     .question-block{page-break-inside:avoid; margin-bottom:10px; padding:10px; background:#fafafa; border:1px solid #eee; border-radius:4px;}
//     .question-header{padding-left:10px; border-left:3px solid;}
//     .answer-row,.comment,.recommendation,.evidence{margin:5px 0; font-size:11pt;}
//     .recommendation{background:#f0f8ff; padding:8px; border-left:4px solid #014f65;}
//     .comment{background:#e6f7f6; padding:8px; border-left:4px solid #014f65;}
//     .evidence{background:#fff8e6; padding:8px; border-left:4px solid #014f65;}

//     /* --- TOC – no counters, clean list --- */
//     .toc-root{list-style:none; padding-left:0; margin-top:8px; font-size:14pt;}
//     .toc-root ul{list-style:none; padding-left:30px; margin-top:2px;}
//     .toc-root li{margin-top:4px;}
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
//         <img class="logo" src="https://res.cloudinary.com/dcviwtoog/image/upload/v1765422490/1_BKGS_Consulting_boqy3g.png " alt="Logo" />
//         <div class="cover-title">
//           <h1>${escapeHtml(template.name || 'Assessment Report')}</h1>
//           <h2>${DICT.REPORT_TITLE[lang]}</h2>
//         </div>
//         <div class="meta" style="margin:20px 0; font-size:16pt;">
//           <p><strong>${DICT.REPORT_DATE[lang]}</strong> ${escapeHtml(reportDate)}</p>
//           <p><strong>${DICT.EXAM_DATE[lang]}</strong> ${escapeHtml(assessmentDateRange)}</p>
//           <p><strong>${DICT.EXAMINER[lang]}</strong> ${escapeHtml(examinerName)}</p>
//           <p><strong>${DICT.EMAIL[lang]}</strong> <a href="mailto:${escapeHtml(examinerEmail)}" class="no-style-link">${escapeHtml(examinerEmail)}</a></p>
//         </div>
//       </div>
//       <div>
//         <div style="font-size:16pt;">
//           <p><strong>${DICT.FOR[lang]}</strong></p>
//           <p><strong>${escapeHtml(companyName)}</strong></p>
//           <p>${escapeHtml(contactName)} ${escapeHtml(contactEmail)}</p>
//         </div>
//         <div class="cover-quote">
//           <p class="static-text"><strong>${DICT.COVER_QUOTE_1[lang]}</strong></p>
//           <p class="static-text"><em><strong>${DICT.COVER_QUOTE_2[lang]}</strong></em></p>
//         </div>
//       </div>
//     </div>
//   </div>

//   <!-- ===========================  TOC  =========================== -->
//   <div class="container page-break"><h2 class="header-spacing">${DICT.TOC[lang]}</h2>${tocHtml}</div>

//   <!-- ===========================  1. INTRODUCTION  =========================== -->
//   <div class="container page-break" id="sec-0"><h2 class="header-spacing">1. ${DICT.INTRO[lang]}</h2>${introText}</div>

//   <!-- ===========================  2. ABOUT CONSULTING  =========================== -->
//   <div class="container page-break" id="sec-1"><h2 class="header-spacing">2. ${DICT.ABOUT_CONSULTING[lang]}</h2>${aboutConsulting}</div>

//   <!-- ===========================  3. ABOUT AUDITED  =========================== -->
//   <div class="container page-break" id="sec-2"><h2 class="header-spacing">3. ${DICT.ABOUT_AUDITED[lang]}</h2>${aboutAudited}</div>

//   <!-- ===========================  4. PREFACE  =========================== -->
//   <div class="container page-break" id="sec-3"><h2 class="header-spacing">4. ${DICT.PREFACE[lang]}</h2>${prefaceText}</div>

//   <!-- ===========================  5. DISCLAIMER  =========================== -->
//   <div class="container page-break" id="sec-4"><h2 class="header-spacing">5. ${DICT.DISCLAIMER[lang]}</h2>${disclaimerText}</div>

//   <!-- ===========================  6. EXECUTIVE SUMMARY  =========================== -->
//   <div class="container page-break" id="sec-5"><h2 class="header-spacing">6. ${DICT.EXEC_SUMMARY[lang]}</h2>${execSummaryText}</div>

//   <!-- ===========================  7. EXAMINATION ENVIRONMENT  =========================== -->
//   <div class="container page-break" id="sec-6"><h2 class="header-spacing">7. ${DICT.EXAM_ENV[lang]}</h2>
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
//     </table>
//   </div>

//   <!-- ===========================  8. THE CONTENT  =========================== -->
//   <div class="container page-break" id="sec-7"><h2 class="header-spacing">8. ${DICT.THE_CONTENT[lang]}</h2>${contentHtml}</div>

//   <!-- ===========================  9. HANDOVER  =========================== -->
//   <div class="container page-break" id="sec-8"><h2 class="header-spacing">9. ${DICT.HANDOVER[lang]}</h2>${handoverHtml}</div>

//   <!-- ===========================  10. THANK YOU  =========================== -->
//   <div class="container page-break" id="sec-9"><h2 class="header-spacing">10. ${DICT.THANK_YOU[lang]}</h2>${thankYouHtml}</div>

// </body>
// </html>`;

//   return html;
// };

// export default generateReportHtml;





//============================================================COMPLETE FIXED REPORT=========================//
//____________________________________________________________
//  1.  HAND-WRITTEN TRILINGUAL MINI-DICTIONARY
//____________________________________________________________
const DICT = {
  REPORT_TITLE:  { EN: 'REPORT', FR: 'RAPPORT', DE: 'BERICHT' },
  REPORT_DATE:   { EN: 'Report Date:', FR: 'Date du rapport :', DE: 'Berichtsdatum:' },
  EXAM_DATE:     { EN: 'Assessment Date:', FR: "Date de l'évaluation :", DE: 'Bewertungsdatum:' },
  EXAMINER:      { EN: 'Examiner:', FR: 'Examinateur :', DE: 'Prüfer:' },
  EMAIL:         { EN: 'E-Mail:', FR: 'E-Mail :', DE: 'E-Mail:' },
  FOR:           { EN: 'FOR', FR: 'POUR', DE: 'FÜR' },

  COVER_QUOTE_1: {
    EN: 'The strength of your defense lies in knowing and understanding your vulnerabilities. This assessment provides you with the information you need to create a secure environment in your company.',
    FR: 'La force de votre défense réside dans la connaissance et la compréhension de vos vulnérabilités. Cette évaluation vous fournit les informations nécessaires pour créer un environnement sécurisé dans votre entreprise.',
    DE: 'Die Stärke Ihrer Verteidigung liegt im Kennen und Verstehen Ihrer Schwachstellen. Diese Bewertung liefert Ihnen die Informationen, die Sie benötigen, um eine sichere Umgebung in Ihrem Unternehmen zu schaffen.'
  },
  COVER_QUOTE_2: { EN: '“You can only protect what you know.”', FR: '« Vous ne pouvez protéger que ce que vous connaissez. »', DE: '„Sie können nur schützen, was Sie kennen.“' },

  TOC:              { EN: 'Table of Contents', FR: 'Table des matières', DE: 'Inhaltsverzeichnis' },
  INTRO:            { EN: 'Introduction', FR: 'Introduction', DE: 'Einleitung' },
  ABOUT_CONSULTING: { EN: 'About the Consulting Company', FR: 'À propos de la société de conseil', DE: 'Über die Beratungsfirma' },
  ABOUT_AUDITED:    { EN: 'About the Examined Company', FR: 'À propos de la société examinée', DE: 'Über das geprüfte Unternehmen' },
  PREFACE:          { EN: 'Preface', FR: 'Préface', DE: 'Vorwort' },
  DISCLAIMER:       { EN: 'Disclaimer', FR: 'Avertissement', DE: 'Haftungsausschluss' },
  EXEC_SUMMARY:     { EN: 'Executive Summary', FR: 'Résumé exécutif', DE: 'Executive Summary' },
  EXAM_ENV:         { EN: 'Examination Environment', FR: "Environnement d'évaluation", DE: 'Prüfungsumgebung' },
  THE_CONTENT:      { EN: 'The Content', FR: 'Le Contenu', DE: 'Der Inhalt' },
  HANDOVER:         { EN: 'Handover', FR: 'Remise', DE: 'Übergabe' },
  THANK_YOU:        { EN: 'Thank You', FR: 'Merci', DE: 'Vielen Dank' },

  NO_RESPONSE: { EN: 'No response provided', FR: 'Aucune réponse fournie', DE: 'Keine Antwort gegeben' },

  // -----  NEW KEYS FOR FULL TRANSLATION  -----
  INTRO_TEXT: {
    EN: `<p>When we speak about Cyber, Information, and IT Security, it is important to recognize that it is not only a technical matter. Technology plays a key role, but security is always the result of three dimensions working together:
<ul>
  <li><strong>Technology</strong> – the tools and systems that protect our data.</li>
  <li><strong>Organization</strong> – the rules, processes, and responsibilities that guide how we work.</li>
  <li><strong>People</strong> – the awareness, behavior, and decisions of everyone involved.</li>
</ul>
Only when these three elements are combined can we create real protection. Focusing on technology alone is not enough. A secure company requires clear structures, well-trained employees, and a culture where security is seen as part of everyday work.
<p>In today's ever-changing world, the importance of protecting data and systems continues to grow. New threats appear daily, and digitalization increases the complexity of our business environment. For this reason, <strong>security must be given the right priority</strong>. It should not be treated as an "add-on" or a last step, but as an <strong>integral part of every decision, process, and investment</strong>.
<p>This assessment report is designed to make this approach practical and understandable. It gives a transparent overview of your current situation, highlights strengths and weaknesses, and provides clear guidance for next steps. The goal is not only to identify risks but also to enable your organization to <strong>build sustainable protection</strong> so that technology, organization, and people are aligned and your company can continue to operate with confidence and resilience.</p>`,
    FR: `<p>Lorsque nous parlons de cybersécurité, de sécurité de l'information et des systèmes d'information, il est important de reconnaître qu'il ne s'agit pas seulement d'une question technique. La technologie joue un rôle clé, mais la sécurité est toujours le résultat de trois dimensions travaillant ensemble :
<ul>
  <li><strong>Technologie</strong> – les outils et systèmes qui protègent nos données.</li>
  <li><strong>Organisation</strong> – les règles, processus et responsabilités qui guident notre travail.</li>
  <li><strong>Personnes</strong> – la sensibilisation, le comportement et les décisions de chacun.</li>
</ul>
Ce n'est que lorsque ces trois éléments sont combinés que nous pouvons créer une protection réelle. Se concentrer uniquement sur la technologie ne suffit pas. Une entreprise sécurisée nécessite des structures claires, des employés bien formés et une culture où la sécurité fait partie du quotidien.
<p>Dans le monde en constante évolution d'aujourd'hui, l'importance de protéger les données et les systèmes ne cesse de croître. De nouvelles menaces apparaissent quotidiennement et la numérisation augmente la complexité de notre environnement professionnel. Pour cette raison, <strong>la sécurité doit être prioritaire</strong>. Elle ne doit pas être considérée comme un « ajout » ou une dernière étape, mais comme <strong>une partie intégrante de chaque décision, processus et investissement</strong>.
<p>Ce rapport d'évaluation est conçu pour rendre cette approche pratique et compréhensible. Il fournit une vue transparente de votre situation actuelle, met en évidence les forces et les faiblesses, et offre des orientations claires pour les prochaines étapes. L'objectif n'est pas seulement d'identifier les risques, mais aussi de permettre à votre organisation de <strong>construire une protection durable</strong> afin que la technologie, l'organisation et les personnes soient alignées et que votre entreprise puisse continuer à opérer avec confiance et résilience.</p>`,
    DE: `<p>Wenn wir über Cyber-, Informations- und IT-Sicherheit sprechen, ist es wichtig zu erkennen, dass es sich nicht nur um eine technische Angelegenheit handelt. Die Technologie spielt eine Schlüsselrolle, aber Sicherheit ist immer das Ergebnis von drei Dimensionen, die zusammenarbeiten:
<ul>
  <li><strong>Technologie</strong> – die Werkzeuge und Systeme, die unsere Daten schützen.</li>
  <li><strong>Organisation</strong> – die Regeln, Prozesse und Verantwortlichkeiten, die unsere Arbeit leiten.</li>
  <li><strong>Menschen</strong> – das Bewusstsein, das Verhalten und die Entscheidungen aller Beteiligten.</li>
</ul>
Nur wenn diese drei Elemente kombiniert werden, können wir echten Schutz schaffen. Sich allein auf die Technologie zu konzentrieren, reicht nicht aus. Ein sicheres Unternehmen erfordert klare Strukturen, gut ausgebildete Mitarbeiter und eine Kultur, in der Sicherheit zum Alltag gehört.
<p>In der sich ständig verändernden Welt von heute wächst die Bedeutung des Schutzes von Daten und Systemen kontinuierlich. Neue Bedrohungen tauchen täglich auf, und die Digitalisierung erhöht die Komplexität unserer Geschäftsumgebung. Aus diesem Grund muss <strong>Sicherheit die richtige Priorität erhalten</strong>. Sie sollte nicht als „Nice-to-have“ oder letzter Schritt behandelt werden, sondern als <strong>integraler Bestandteil jeder Entscheidung, jedes Prozesses und jeder Investition</strong>.
<p>Dieser Bewertungsbericht wurde entwickelt, um diesen Ansatz praktisch und verständlich zu machen. Er gibt einen transparenten Überblick über Ihre aktuelle Situation, hebt Stärken und Schwächen hervor und bietet klare Hinweise für die nächsten Schritte. Ziel ist es nicht nur, Risiken zu identifizieren, sondern auch Ihre Organisation zu befähigen, <strong>nachhaltigen Schutz aufzubauen</strong>, damit Technologie, Organisation und Menschen in Einklang stehen und Ihr Unternehmen weiterhin mit Vertrauen und Resilienz operieren kann.</p>`
  },

  ABOUT_CONSULTING_TEXT: {
    EN: `<p>We at <strong>BKGS Consulting</strong> believe that audits and assessments should strengthen companies rather than slow them down. In a world where compliance requirements, standards, and technologies evolve faster than ever, many companies still rely on rigid tools and outdated methods to evaluate performance, security, and quality. At <strong>BKGS Consulting</strong>, we exist to change that. Our mission is to make assessments and audits simple, smart, and adaptable, transforming them from static checklists into dynamic instruments for growth, trust, and improvement. We believe that every organization, regardless of its size, sector, or country deserves access to modern, intelligent solutions that align with its specific needs, frameworks, and ambitions.
<p>We combine <strong>technology, methodology,</strong> and <strong>human expertise</strong> to develop flexible, powerful audit and assessment solutions tailored to the individual needs of our clients. Our work combines <strong>32 years of consulting experience</strong> with state-of-the-art software platforms, ensuring that every client benefits from precision, scalability, and adaptability.
<p>We don't just deliver tools, we build <strong>solutions that fit your context</strong>. From defining requirements to designing dashboards, from building reporting logic to automating workflows, our team ensures that your assessment system reflects <strong>your goals, standards</strong>, and <strong>operational culture</strong>.
<p>We envision a future where audits and assessments are not bureaucratic obligations, but <strong>strategic enablers of trust and performance</strong>. A world where organizations of any size can assess themselves <strong>continuously</strong>, adjust in real time, and make decisions with confidence.
<h3 class="slogan-local">"Improvement begins with assessment and assessment begins with the right questions"</h3>`,
    FR: `<p>Chez <strong>BKGS Consulting</strong>, nous pensons que les audits et les évaluations doivent renforcer les entreprises plutôt que de les ralentir. Dans un monde où les exigences de conformité, les normes et les technologies évoluent plus rapidement que jamais, de nombreuses entreprises s'appuient encore sur des outils rigides et des méthodes dépassées pour évaluer la performance, la sécurité et la qualité. Chez <strong>BKGS Consulting</strong>, nous existons pour changer cela. Notre mission est de rendre les évaluations et les audits simples, intelligents et adaptables, les transformant de listes de contrôle statiques en instruments dynamiques de croissance, de confiance et d'amélioration. Nous croyons que chaque organisation, quels que soient sa taille, son secteur ou son pays, mérite d'avoir accès à des solutions modernes et intelligentes qui s'alignent sur ses besoins, cadres et ambitions spécifiques.
<p>Nous combinons <strong>technologie, méthodologie</strong> et <strong>expertise humaine</strong> pour développer des solutions d'audit et d'évaluation flexibles et puissantes, adaptées aux besoins individuels de nos clients. Notre travail combine <strong>32 ans d'expérience en conseil</strong> avec des plateformes logicielles de pointe, garantissant que chaque client bénéficie de précision, d'évolutivité et d'adaptabilité.
<p>Nous ne livrons pas seulement des outils, nous construisons <strong>des solutions qui s'adaptent à votre contexte</strong>. De la définition des exigences à la conception des tableaux de bord, de la construction de la logique de reporting à l'automatisation des flux de travail, notre équipe veille à ce que votre système d'évaluation reflète <strong>vos objectifs, normes</strong> et <strong>culture opérationnelle</strong>.
<p>Nous envisageons un avenir où les audits et les évaluations ne sont pas des obligations bureaucratiques, mais <strong>des leviers stratégiques de confiance et de performance</strong>. Un monde où les organisations de toute taille peuvent s'évaluer <strong>en continu</strong>, ajuster en temps réel et prendre des décisions en toute confiance.
<h3 class="slogan-local">"L'amélioration commence par l'évaluation et l'évaluation commence par les bonnes questions"</h3>`,
    DE: `<p>Wir bei <strong>BKGS Consulting</strong> glauben, dass Audits und Bewertungen Unternehmen stärken sollten, anstatt sie zu verlangsamen. In einer Welt, in der Compliance-Anforderungen, Standards und Technologien schneller denn je evolutionieren, verlassen sich viele Unternehmen noch immer auf starre Werkzeuge und veraltete Methoden, um Leistung, Sicherheit und Qualität zu bewerten. Bei <strong>BKGS Consulting</strong> existieren wir, um das zu ändern. Unsere Mission ist es, Bewertungen und Audits einfach, intelligent und anpassungsfähig zu machen, um sie von statischen Checklisten in dynamische Instrumente für Wachstum, Vertrauen und Verbesserung zu verwandeln. Wir glauben, dass jede Organisation – unabhängig von Größe, Sektor oder Land – Zugang zu modernen, intelligenten Lösungen verdient, die auf ihre spezifischen Bedürfnisse, Rahmen und Ambitionen abgestimmt sind.
<p>Wir kombinieren <strong>Technologie, Methodik</strong> und <strong>menschliche Expertise</strong>, um flexible, leistungsfähige Audit- und Bewertungslösungen zu entwickeln, die auf die individuellen Bedürfnisse unserer Kunden zugeschnitten sind. Unsere Arbeit verbindet <strong>32 Jahre Beratungserfahrung</strong> mit modernsten Software-Plattformen und stellt sicher, dass jeder Kunde von Präzision, Skalierbarkeit und Anpassungsfähigkeit profitiert.
<p>Wir liefern nicht nur Werkzeuge, wir bauen <strong>Lösungen, die in Ihren Kontext passen</strong>. Von der Definition der Anforderungen bis zum Design von Dashboards, vom Aufbau der Reporting-Logik bis zur Automatisierung von Workflows – unser Team stellt sicher, dass Ihr Bewertungssystem <strong>Ihre Ziele, Standards</strong> und <strong>Betriebskultur</strong> widerspiegelt.
<p>Wir visionieren eine Zukunft, in der Audits und Bewertungen nicht bürokratische Pflichten sind, sondern <strong>strategische Hebel für Vertrauen und Leistung</strong>. Eine Welt, in der Organisationen jeder Größe sich <strong>kontinuierlich</strong> bewerten, in Echtzeit anpassen und mit Zuversicht Entscheidungen treffen können.
<h3 class="slogan-local">„Verbesserung beginnt mit Bewertung und Bewertung beginnt mit den richtigen Fragen“</h3>`
  },

  ABOUT_AUDITED_TEXT: {
    EN: (companyName, industry, contactName, contactEmail, generalInfo) =>
      `<p>As a prominent player in the <strong>${escapeHtml(industry || '')}</strong> industry, <strong>${escapeHtml(companyName)}</strong> has shown a strong commitment to maintaining a secure and reliable operational environment. Our assessment was conducted to evaluate their current information, IT and security posture, providing a detailed overview of their defenses and identifying key areas for continuous improvement. This assessment highlights their dedication to protecting their digital assets and fostering a resilient business infrastructure.
<p style="margin-top:5px;"><strong>Contact person:</strong> ${escapeHtml(contactName)} ${escapeHtml(contactEmail)}</p>
${generalInfo ? `<p class="justify-text">${escapeHtml(generalInfo)}</p>` : ''}`,
    FR: (companyName, industry, contactName, contactEmail, generalInfo) =>
      `<p>En tant qu'acteur de premier plan dans le secteur <strong>${escapeHtml(industry || '')}</strong>, <strong>${escapeHtml(companyName)}</strong> a démontré un engagement fort à maintenir un environnement opérationnel sûr et fiable. Notre évaluation a été menée pour évaluer leur posture actuelle en matière d'information, de sécurité IT et de cybersécurité, en fournissant un aperçu détaillé de leurs défenses et en identifiant les domaines clés d'amélioration continue. Cette évaluation met en évidence leur dévouement à protéger leurs actifs numériques et à favoriser une infrastructure commerciale résiliente.
<p style="margin-top:5px;"><strong>Personne de contact :</strong> ${escapeHtml(contactName)} ${escapeHtml(contactEmail)}</p>
${generalInfo ? `<p class="justify-text">${escapeHtml(generalInfo)}</p>` : ''}`,
    DE: (companyName, industry, contactName, contactEmail, generalInfo) =>
      `<p>Al prominenter Akteur in der Branche <strong>${escapeHtml(industry || '')}</strong> hat <strong>${escapeHtml(companyName)}</strong> ein starkes Engagement für die Aufrechterhaltung einer sicheren und zuverlässigen Betriebsumgebung gezeigt. Unsere Bewertung wurde durchgeführt, um ihre aktuelle Informations-, IT- und Cybersicherheitslage zu bewerten, einen detaillierten Überblick über ihre Verteidigungsmaßnahmen zu geben und wichtige Bereiche für kontinuierliche Verbesserungen zu identifizieren. Diese Bewertung hebt ihre Hingabe hervor, ihre digitalen Vermögenswerte zu schützen und eine resiliente Geschäftsinfrastruktur zu fördern.
<p style="margin-top:5px;"><strong>Ansprechpartner:</strong> ${escapeHtml(contactName)} ${escapeHtml(contactEmail)}</p>
${generalInfo ? `<p class="justify-text">${escapeHtml(generalInfo)}</p>` : ''}`
  },

  PREFACE_TEXT: {
    EN: `<p>The <strong>ISARION (Information Security Assessment Evolution) - Report</strong> has been developed to provide organizations with a structured and independent assessment of their information security posture. The aim is not only to identify technical issues, but to create a holistic view that combines <strong>technology, organization, and people</strong>.
<p>This report is designed as a practical tool for decision-makers at all levels. Whether you have a technical background or not, the findings and recommendations are presented in a way that allows you to clearly understand where strengths lie, where risks exist, and what steps can be taken to achieve sustainable improvement.
<p>Our mission is to support organizations in treating cybersecurity as an integral part of their business strategy and daily operations—helping to build trust, ensure compliance, and strengthen resilience in an ever-changing digital world.`,
    FR: `<p>Le <strong>rapport ISARION (Information Security Assessment Evolution)</strong> a été développé pour fournir aux organisations une évaluation structurée et indépendante de leur posture de sécurité de l'information. L'objectif n'est pas seulement d'identifier les problèmes techniques, mais de créer une vue d'ensemble qui combine <strong>technologie, organisation et personnes</strong>.
<p>Ce rapport est conçu comme un outil pratique pour les décideurs de tous niveaux. Que vous ayez ou non un background technique, les constats et recommandations sont présentés de manière à vous permettre de comprendre clairement où se situent les forces, où existent les risques et quelles étapes peuvent être entreprises pour atteindre une amélioration durable.
<p>Notre mission est de soutenir les organisations pour faire de la cybersécurité une partie intégrante de leur stratégie d'affaires et de leurs opérations quotidiennes—afin de bâtir la confiance, garantir la conformité et renforcer la résilience dans un monde numérique en perpétuelle évolution.`,
    DE: `<p>Der <strong>ISARION (Information Security Assessment Evolution) - Bericht</strong> wurde entwickelt, um Organisationen eine strukturierte und unabhängige Bewertung ihrer Informationssicherheitslage zu bieten. Ziel ist es nicht nur, technische Probleme zu identifizieren, sondern einen ganzheitlichen Blickwinkel zu schaffen, der <strong>Technologie, Organisation und Menschen</strong> vereint.
<p>Dieser Bericht ist als praktisches Werkzeug für Entscheidungsträger auf allen Ebenen konzipiert. Ob Sie nun technische Kenntnisse haben oder nicht – die Erkenntnisse und Empfehlungen werden so dargestellt, dass Sie klar verstehen können, wo Stärken liegen, wo Risiken bestehen und welche Schritte für eine nachhaltige Verbesserung unternommen werden können.
<p>Unsere Mission ist es, Organisationen dabei zu unterstützen, Cybersicherheit als integralen Bestandteil ihrer Geschäftsstrategie und ihres täglichen Betriebs zu behandeln – um Vertrauen aufzubauen, Compliance sicherzustellen und Resilienz in einer sich ständig wandelnden digitalen Welt zu stärken.`
  },

  DISCLAIMER_TEXT: {
    EN: `<p>This report is based on the information, data, and evidence made available during the assessment process. While every effort has been made to provide accurate and reliable findings, the results and recommendations are limited to the scope of the assessment and the time of its execution.
<p>The report should not be considered a guarantee against future risks or incidents. Security threats evolve constantly, and continuous monitoring, improvement, and adaptation remain essential.
<p>The assessor and assessing organization do not assume liability for direct or indirect damages that may result from the use of this report. The responsibility for implementing and maintaining effective security measures lies with the assessed organization.`,
    FR: `<p>Ce rapport est basé sur les informations, données et preuves rendues disponibles pendant le processus d'évaluation. Bien que tous les efforts aient été faits pour fournir des résultats exacts et fiables, les résultats et recommandations sont limités au périmètre de l'évaluation et au moment de son exécution.
<p>Le rapport ne doit pas être considéré comme une garantie contre les risques ou incidents futurs. Les menaces de sécurité évoluent constamment et une surveillance, amélioration et adaptation continues demeurent essentielles.
<p>L'évaluateur et l'organisation d'évaluation n'assument aucune responsabilité pour les dommages directs ou indirects pouvant résulter de l'utilisation de ce rapport. La responsabilité de mettre en œuvre et de maintenir des mesures de sécurité efficaces incombe à l'organisation évaluée.`,
    DE: `<p>Dieser Bericht basiert auf den während des Bewertungsprozesses verfügbaren Informationen, Daten und Beweisen. Obwohl alle Anstrengungen unternommen wurden, genaue und zuverlässige Erkenntnisse zu liefern, sind die Ergebnisse und Empfehlungen auf den Umfang der Bewertung und den Zeitpunkt ihrer Durchführung beschränkt.
<p>Der Bericht sollte nicht als Garantie gegen zukünftige Risiken oder Vorfälle betrachtet werden. Sicherheitsbedrohungen entwickeln sich ständig weiter, und kontinuierliche Überwachung, Verbesserung und Anpassung bleiben unerlässlich.
<p>Der Prüfer und die prüfende Organisation übernehmen keine Haftung für direkte oder indirekte Schäden, die aus der Verwendung dieses Berichts resultieren können. Die Verantwortung für die Umsetzung und Aufrechterhaltung wirksamer Sicherheitsmaßnahmen liegt bei der bewerteten Organisation.`
  },

  EXEC_SUMMARY_TEXT: {
    EN: (companyName, templateName, overallScore) =>
      `<p>This report provides a comprehensive overview of the Information, IT and cybersecurity posture for <strong>${escapeHtml(companyName)}</strong> based on the "<strong>${escapeHtml(templateName)}</strong>".
<p>The assessment covered key areas including Information Security Policies, Access Control, Physical Security, Mobile & Remote Working, Awareness, Compliance & Legal Requirements and other critical domains as defined in the selected template.
<p>Overall, the assessment indicates a compliance score of <strong>${Math.round(overallScore)}%</strong>. Detailed findings and observations are provided in the subsequent sections, along with specific recommendations for improvement.
<p>It is crucial to address identified areas of non-compliance and implement recommended remediation actions to strengthen the overall security posture and ensure continuous adherence to best practices.

<h3 class="slogan-local" style="text-align:center;margin-top:25px;">"Cyber resilience as part of your organization's reputation"</h3>
<p>Cyber resilience refers to an entity's ability to continuously deliver the intended outcome, despite cyber-attacks. Resilience to cyber-attacks is essential to IT systems, critical infrastructure, business processes, organizations, societies, and nation-states.
<p>Resilience is like juggling lots of balls: it is not enough to optimize individual points. The key to success lies in the ability to think holistically and to orchestrate several strands of action in parallel, from awareness training and technical security to clear crisis management. Resources (budget and people) alone does not lead to success. This is also evident in reality: organizations with the largest IT budgets are not automatically the best protected. The decisive factor is whether security and resilience issues are at the top of the agenda and whether processes, responsibilities and recovery concepts are regularly reviewed, tested and further developed. Cyber resilience is therefore not a project with an end date, but an ongoing management task. As with sustainability, it requires a cultural shift: away from pure compliance thinking and towards genuine risk competence at all levels.
<p>The biggest mistake is to believe that you are not affected, or even to rely on getting help in an emergency. Because when cyber-attacks become a reality, only one thing matters: <strong>"how well prepared an organization is"</strong>. Resilience begins in the mind and unfolds its effect where technology, processes and people interact. Those who take the issue seriously not only gain security, but also the trust of customers, partners, employees and ultimately the market. Cyber resilience is not just about keeping systems running. It's about taking responsibility and maintaining trust, especially when it matters, and with this assessment, you have just taken the first step. Congratulations!</p>`,
    FR: (companyName, templateName, overallScore) =>
      `<p>Ce rapport fournit une vue d'ensemble complète de la posture de sécurité de l'information, IT et cybersécurité pour <strong>${escapeHtml(companyName)}</strong> sur la base du « <strong>${escapeHtml(templateName)}</strong> ».
<p>L'évaluation a porté sur des domaines clés incluant les politiques de sécurité de l'information, le contrôle d'accès, la sécurité physique, le travail mobile et à distance, la sensibilisation, les exigences légales et de conformité ainsi que d'autres domaines critiques définis dans le modèle sélectionné.
<p>Globalement, l'évaluation indique un score de conformité de <strong>${Math.round(overallScore)} %</strong>. Des constats et observations détaillés sont fournis dans les sections suivantes, ainsi que des recommandations spécifiques d'amélioration.
<p>Il est crucial de s'attaquer aux zones de non-conformité identifiées et de mettre en œuvre les actions de remédiation recommandées pour renforcer la posture de sécurité globale et garantir une adhésion continue aux meilleures pratiques.

<h3 class="slogan-local" style="text-align:center;margin-top:25px;">« La cyber-résilience comme partie de la réputation de votre organisation »</h3>
<p>La cyber-résilience fait référence à la capacité d'une entité à délivrer en continu le résultat escompté, malgré des cyber-attaques. La résilience aux cyber-attaques est essentielle pour les systèmes IT, les infrastructures critiques, les processus métiers, les organisations, les sociétés et les États.
<p>La résilience, c'est comme jongler avec de nombreuses boules : il ne suffit pas d'optimiser des points individuels. La clé du succès réside dans la capacité de penser de manière holistique et d'orchestrer plusieurs axes d'action en parallèle, de la sensibilisation et de la sécurité technique à une gestion de crise claire. Les ressources seules (budget et personnel) ne mènent pas au succès. Cela est également évident dans la réalité : les organisations aux budgets IT les plus importants ne sont pas automatiquement les mieux protégées. Le facteur décisif est de savoir si les questions de sécurité et de résilience sont en tête de l'agenda et si les processus, responsabilités et concepts de récupération sont régulièrement revus, testés et développés. La cyber-résilience n'est donc pas un projet avec une date de fin, mais une tâche de gestion continue. Comme pour la durabilité, cela exige un changement culturel : passer d'une simple pensée de conformité à une véritable compétence en matière de risque à tous les niveaux.
<p>La plus grande erreur est de croire que l'on n'est pas concerné, ou de compter sur une aide en cas d'urgence. Car lorsque les cyber-attaques deviennent réalité, une seule chose compte : « <strong>la préparation de l'organisation</strong> ». La résilience commence dans l'esprit et déploie son effet là où technologie, processus et personnes interagissent. Ceux qui prennent le sujet au sérieux gagnent non seulement en sécurité, mais aussi en confiance de la part des clients, partenaires, employés et finalement du marché. La cyber-résilience ne consiste pas seulement à maintenir les systèmes en marche. Il s'agit d'assumer ses responsabilités et de maintenir la confiance, surtout quand cela compte, et avec cette évaluation, vous venez de faire le premier pas. Félicitations !</p>`,
    DE: (companyName, templateName, overallScore) =>
      `<p>Dieser Bericht bietet einen umfassenden Überblick über die Informations-, IT- und Cybersicherheitslage von <strong>${escapeHtml(companyName)}</strong> auf Basis der „<strong>${escapeHtml(templateName)}</strong>“.
<p>Die Bewertung deckte wichtige Bereiche ab, darunter Informationssicherheitsrichtlinien, Zugangskontrolle, physische Sicherheit, mobiles & Remote-Arbeit, Awareness, Compliance- und Rechtsanforderungen sowie andere kritische Domänen, wie im ausgewählten Template definiert.
<p>Insgesamt zeigt die Bewertung eine Compliance-Rate von <strong>${Math.round(overallScore)} %</strong>. Detaillierte Erkenntnisse und Beobachtungen werden in den folgenden Abschnitten bereitgestellt, zusammen mit konkreten Verbesserungsempfehlungen.
<p>Es ist entscheidend, identifizierte Nichtkonformitätsbereiche anzugehen und empfohlene Remedierungsmaßnahmen umzusetzen, um die Gesamtsicherheitslage zu stärken und eine kontinuierliche Einhaltung bewährter Verfahren sicherzustellen.

<h3 class="slogan-local" style="text-align:center;margin-top:25px;">„Cyber-Resilienz als Teil der Reputation Ihrer Organisation“</h3>
<p>Cyber-Resilienz bezieht sich auf die Fähigkeit einer Einheit, die beabsichtigten Ergebnisse kontinuierlich zu liefern, trotz Cyber-Attacken. Resilienz gegen Cyber-Attacken ist essentiell für IT-Systeme, kritische Infrastrukturen, Geschäftsprozesse, Organisationen, Gesellschaften und Staaten.
<p>Resilienz ist wie das Jonglieren mit vielen Bällen: Es reicht nicht aus, einzelne Punkte zu optimieren. Der Schlüssel zum Erfolg liegt in der Fähigkeit, ganzheitlich zu denken und mehrere Handlungsstränge parallel zu orchestrieren – von Awareness-Training und technischer Sicherheit bis hin zu klarem Krisenmanagement. Ressourcen (Budget und Personal) allein führen nicht zum Erfolg. Das zeigt sich auch in der Realität: Organisationen mit den größten IT-Budgets sind nicht automatisch die besten geschützt. Entscheidend ist, ob Sicherheits- und Resilienzthemen ganz oben auf der Agenda stehen und ob Prozesse, Verantwortlichkeiten und Wiederherstellungskonzepte regelmäßig überprüft, getestet und weiterentwickelt werden. Cyber-Resilienz ist daher kein Projekt mit einem Enddatum, sondern eine laufende Managementaufgabe. Wie bei Nachhaltigkeit erfordert sie einen kulturellen Wandel: weg vom reinen Compliance-Denken und hin zu echter Risikokompetenz auf allen Ebenen.
<p>Der größte Fehler ist es, zu glauben, dass man nicht betroffen ist, oder sich sogar darauf zu verlassen, im Notfall Hilfe zu erhalten. Denn wenn Cyber-Attacken Realität werden, zählt nur eines: „<strong>wie gut eine Organisation vorbereitet ist</strong>“. Resilienz beginnt im Kopf und entfaltet ihre Wirkung dort, wo Technologie, Prozesse und Menschen interagieren. Wer das Thema ernst nimmt, gewinnt nicht nur Sicherheit, sondern auch das Vertrauen von Kunden, Partnern, Mitarbeitern und letztlich des Marktes. Cyber-Resilienz geht nicht nur darum, Systeme am Laufen zu halten. Es geht darum, Verantwortung zu übernehmen und Vertrauen – besonders wenn es darauf ankommt – zu bewahren. Mit dieser Bewertung haben Sie gerade den ersten Schritt getan. Herzlichen Glückwunsch!</p>`
  },

  HANDOVER_TEXT: {
    EN: (templateName) =>
      `<p class="justify-text static-text">This page confirms that the assessment report titled "<strong>${escapeHtml(templateName)}</strong>" has been formally handed over by the assessor to the assessed company.
<p class="justify-text static-text">By signing below, both parties acknowledge the reception of the full assessment report and confirm that it has been delivered in its final version.

<div class="handover-section">
  <h3 class="handover-heading">Consultant</h3>
  <table class="handover-table">
    <tr><td>Name:</td><td><span class="signature-input"></span></td><td>Organization:</td><td><span class="signature-input"></span></td><td>Date:</td><td><span class="signature-input"></span></td></tr>
    <tr><td colspan="6" class="signature-line-row">Signature: <span class="signature-line"></span></td></tr>
  </table>
</div>

<div class="handover-section" style="margin-top:30px;">
  <h3 class="handover-heading">Consulted Company Representative</h3>
  <table class="handover-table">
    <tr><td>Name:</td><td><span class="signature-input"></span></td><td>Organization:</td><td><span class="signature-input"></span></td><td>Date:</td><td><span class="signature-input"></span></td></tr>
    <tr><td colspan="6" class="signature-line-row">Signature: <span class="signature-line"></span></td></tr>
  </table>
</div>`,
    FR: (templateName) =>
      `<p class="justify-text static-text">Cette page confirme que le rapport d'évaluation intitulé « <strong>${escapeHtml(templateName)}</strong> » a été officiellement remis par l'évaluateur à l'entreprise évaluée.
<p class="justify-text static-text">En signant ci-dessous, les deux parties reconnaissent la réception du rapport d'évaluation complet et confirment qu'il a été livré dans sa version finale.

<div class="handover-section">
  <h3 class="handover-heading">Consultant</h3>
  <table class="handover-table">
    <tr><td>Nom :</td><td><span class="signature-input"></span></td><td>Organisation :</td><td><span class="signature-input"></span></td><td>Date :</td><td><span class="signature-input"></span></td></tr>
    <tr><td colspan="6" class="signature-line-row">Signature : <span class="signature-line"></span></td></tr>
  </table>
</div>

<div class="handover-section" style="margin-top:30px;">
  <h3 class="handover-heading">Représentant de l'entreprise consultée</h3>
  <table class="handover-table">
    <tr><td>Nom :</td><td><span class="signature-input"></span></td><td>Organisation :</td><td><span class="signature-input"></span></td><td>Date :</td><td><span class="signature-input"></span></td></tr>
    <tr><td colspan="6" class="signature-line-row">Signature : <span class="signature-line"></span></td></tr>
  </table>
</div>`,
    DE: (templateName) =>
      `<p class="justify-text static-text">Diese Seite bestätigt, dass der Bewertungsbericht mit dem Titel „<strong>${escapeHtml(templateName)}</strong>“ formell von dem Prüfer an das geprüfte Unternehmen übergeben wurde.
<p class="justify-text static-text">Durch die unten stehende Unterschrift erkennen beide Parteien den Empfang des vollständigen Bewertungsberichts an und bestätigen, dass er in seiner endgültigen Version übergeben wurde.

<div class="handover-section">
  <h3 class="handover-heading">Berater</h3>
  <table class="handover-table">
    <tr><td>Name:</td><td><span class="signature-input"></span></td><td>Organisation:</td><td><span class="signature-input"></span></td><td>Datum:</td><td><span class="signature-input"></span></td></tr>
    <tr><td colspan="6" class="signature-line-row">Unterschrift: <span class="signature-line"></span></td></tr>
  </table>
</div>

<div class="handover-section" style="margin-top:30px;">
  <h3 class="handover-heading">Vertreter des beratenen Unternehmens</h3>
  <table class="handover-table">
    <tr><td>Name:</td><td><span class="signature-input"></span></td><td>Organisation:</td><td><span class="signature-input"></span></td><td>Datum:</td><td><span class="signature-input"></span></td></tr>
    <tr><td colspan="6" class="signature-line-row">Unterschrift: <span class="signature-line"></span></td></tr>
  </table>
</div>`
  },

  THANK_YOU_TEXT: {
    EN: (examinerName, examinerEmail) =>
      `<div style="text-align:center;">
        <h2 style="border-bottom:none;margin-bottom:5px;font-size:26pt;color:#014f65;margin-top:0;font-family:'Lexend',sans-serif;">Thank You</h2>
        <p style="font-size:16pt;margin-bottom:15px;margin-top:5px;font-weight:bold;line-height:1.5;">for choosing ISARION</p>
        <p class="justify-text static-text">We are committed to enhancing your organisation's security posture and ensuring compliance in an ever-evolving threat landscape. This report serves as a foundational step towards a more resilient and secure future.</p>
        <p class="justify-text static-text" style="margin-top:25px;">Our team is dedicated to supporting your journey beyond this assessment. We encourage you to review the findings and recommendations carefully and reach out to us for any clarifications or assistance in implementing the suggested improvements.</p>
        <p class="justify-text static-text">For further discussions or to schedule a follow-up consultation, please contact your partner:</p>
        <div class="contact">
          <p class="static-text"><strong>${escapeHtml(examinerName)} – <a href="mailto:${escapeHtml(examinerEmail)}" class="no-style-link">${escapeHtml(examinerEmail)}</a></strong></p>
        </div>
        <h3 class="slogan-center" style="font-size:14pt;margin-top:20px;"><strong>"Improvement begins with assessment and assessment begins with the right questions"</strong></h3>
      </div>`,
    FR: (examinerName, examinerEmail) =>
      `<div style="text-align:center;">
        <h2 style="border-bottom:none;margin-bottom:5px;font-size:26pt;color:#014f65;margin-top:0;font-family:'Lexend',sans-serif;">Merci</h2>
        <p style="font-size:16pt;margin-bottom:15px;margin-top:5px;font-weight:bold;line-height:1.5;">pour avoir choisi ISARION</p>
        <p class="justify-text static-text">Nous nous engageons à renforcer la posture de sécurité de votre organisation et à garantir la conformité dans un paysage des menaces en constante évolution. Ce rapport constitue une étape fondamentale vers un avenir plus résilient et plus sûr.</p>
        <p class="justify-text static-text" style="margin-top:25px;">Notre équipe est dédiée à vous accompagner au-delà de cette évaluation. Nous vous encourageons à examiner attentivement les constats et recommandations et à nous contacter pour toute clarification ou assistance dans la mise en œuvre des améliorations suggérées.</p>
        <p class="justify-text static-text">Pour des discussions ultérieures ou pour planifier une consultation de suivi, veuillez contacter votre partenaire :</p>
        <div class="contact">
          <p class="static-text"><strong>${escapeHtml(examinerName)} – <a href="mailto:${escapeHtml(examinerEmail)}" class="no-style-link">${escapeHtml(examinerEmail)}</a></strong></p>
        </div>
        <h3 class="slogan-center" style="font-size:14pt;margin-top:20px;"><strong>« L'amélioration commence par l'évaluation et l'évaluation commence par les bonnes questions »</strong></h3>
      </div>`,
    DE: (examinerName, examinerEmail) =>
      `<div style="text-align:center;">
        <h2 style="border-bottom:none;margin-bottom:5px;font-size:26pt;color:#014f65;margin-top:0;font-family:'Lexend',sans-serif;">Vielen Dank</h2>
        <p style="font-size:16pt;margin-bottom:15px;margin-top:5px;font-weight:bold;line-height:1.5;">für die Wahl von ISARION</p>
        <p class="justify-text static-text">Wir setzen uns dafür ein, die Sicherheitslage Ihrer Organisation zu verbessern und Compliance in einer sich ständig weiterentwickelnden Bedrohungslandschaft sicherzustellen. Dieser Bericht ist ein grundlegender Schritt hin zu einer widerstandsfähigeren und sichereren Zukunft.</p>
        <p class="justify-text static-text" style="margin-top:25px;">Unser Team ist darauf spezialisiert, Sie über diese Bewertung hinaus zu begleiten. Wir empfehlen Ihnen, die Erkenntnisse und Empfehlungen sorgfältig zu prüfen und uns bei Unklarheiten oder für Unterstützung bei der Umsetzung der vorgeschlagenen Verbesserungen zu kontaktieren.</p>
        <p class="justify-text static-text">Für weitere Diskussionen oder zur Vereinbarung eines Folgegesprächs wenden Sie sich bitte an Ihren Partner:</p>
        <div class="contact">
          <p class="static-text"><strong>${escapeHtml(examinerName)} – <a href="mailto:${escapeHtml(examinerEmail)}" class="no-style-link">${escapeHtml(examinerEmail)}</a></strong></p>
        </div>
        <h3 class="slogan-center" style="font-size:14pt;margin-top:20px;"><strong>„Verbesserung beginnt mit Bewertung und Bewertung beginnt mit den richtigen Fragen“</strong></h3>
      </div>`
  }
};

//____________________________________________________________
//  2.  HELPERS
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
  if (!d) return 'N/A';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return 'N/A';
  }
};

const getStatusInfo = (selectedValue) => {
  if (selectedValue === undefined || selectedValue === null || selectedValue === '') return { label: 'N/A', color: '#a3a3a3' };
  const raw = Array.isArray(selectedValue) ? selectedValue.map(v => String(v).trim().toLowerCase()) : [String(selectedValue).trim().toLowerCase()];
  const negative = ['not implemented', 'no', 'non-compliant', 'absent'];
  const partial  = ['partially implemented', 'partial', 'partially'];
  const positive = ['implemented', 'yes', 'compliant', 'fully implemented'];
  const isNeg  = raw.some(v => negative.some(k => v.includes(k))) || raw.includes('no') || raw.includes('non-compliant');
  const isPart = raw.some(v => partial.some(k => v.includes(k)));
  const isPos  = raw.some(v => positive.some(k => v.includes(k))) && !isNeg && !isPart;
  let color = '#a3a3a3';
  if (isNeg) color = '#ef4444';
  if (isPart) color = '#f59e0b';
  if (isPos) color = '#16a34a';
  return { label: raw.join(', ') || 'N/A', color };
};

/* --------------------------------------------------------
   TOC – clean hierarchical numbering, no CSS counters
   -------------------------------------------------------- */
const buildToc = (templateStructure, lang) => {
  const order = [
    { key: 'intro',      label: DICT.INTRO[lang] },
    { key: 'consulting', label: DICT.ABOUT_CONSULTING[lang] },
    { key: 'audited',    label: DICT.ABOUT_AUDITED[lang] },
    { key: 'preface',    label: DICT.PREFACE[lang] },
    { key: 'disclaimer', label: DICT.DISCLAIMER[lang] },
    { key: 'exec',       label: DICT.EXEC_SUMMARY[lang] },
    { key: 'env',        label: DICT.EXAM_ENV[lang] },
    { key: 'content',    label: DICT.THE_CONTENT[lang] },
    { key: 'handover',   label: DICT.HANDOVER[lang] },
    { key: 'thank',      label: DICT.THANK_YOU[lang] }
  ];

  let html = '<ul class="toc-root">';
  order.forEach((item, topIdx) => {
    const topId  = `sec-${topIdx}`;
    const topNum = topIdx + 1;
    html += `<li><a href="#${topId}">${topNum}. ${escapeHtml(item.label)}</a>`;

    if (item.key === 'content' && Array.isArray(templateStructure)) {
      html += '<ul>';
      templateStructure.forEach((sec, secIdx) => {
        const secId  = `content-sec-${secIdx}`;
        const secNum = `${topNum}.${secIdx + 1}`;
        html += `<li><a href="#${secId}">${secNum} ${escapeHtml(sec.name || 'Unnamed Section')}</a>`;
        if (Array.isArray(sec.subSections)) {
          html += '<ul>';
          sec.subSections.forEach((sub, subIdx) => {
            const subNum = `${secNum}.${subIdx + 1}`;
            html += `<li><a href="#${secId}-sub-${subIdx}">${subNum} ${escapeHtml(sub.name || 'Unnamed Subsection')}</a></li>`;
          });
          html += '</ul>';
        }
        html += '</li>';
      });
      html += '</ul>';
    }
    html += '</li>';
  });
  html += '</ul>';
  return html;
};

//____________________________________________________________
//  4.  MAIN GENERATOR
//____________________________________________________________
const generateReportHtml = (auditInstance = {}, lang = 'EN') => {
  const company   = auditInstance.company || {};
  const template  = auditInstance.template || {};
  const responses = auditInstance.responses || [];
  const struct    = auditInstance.templateStructureSnapshot || [];
  const overallScore = Math.round((typeof auditInstance.overallScore === 'number') ? auditInstance.overallScore : 0);
  const createdBy = auditInstance.createdBy || {};
  const auditors  = auditInstance.auditorsToDisplay || [];

  const examEnv = { ...company.examinationEnvironment, ...auditInstance.examinationEnvironment };

  const reportDate = formatDate(new Date());
  const startDate  = formatDate(auditInstance.startDate);
  const endDate    = formatDate(auditInstance.endDate);
  let assessmentDateRange = 'N/A';
  if (startDate && endDate && startDate !== 'N/A' && endDate !== 'N/A') assessmentDateRange = `${startDate} - ${endDate}`;
  else if (startDate && startDate !== 'N/A') assessmentDateRange = startDate;
  else if (endDate && endDate !== 'N/A') assessmentDateRange = endDate;

  const examinerName  = auditors[0]?.firstName && auditors[0]?.lastName
    ? `${auditors[0].firstName} ${auditors[0].lastName}`
    : `${createdBy.firstName || ''} ${createdBy.lastName || ''}`.trim() || 'Examiner';
  const examinerEmail = auditors[0]?.email || createdBy.email || 'examiner@isarion.com';

  const contactName  = company.contactPerson?.name  || 'Test contact person';
  const contactEmail = company.contactPerson?.email || 'test@example.com';
  const companyName  = company.name || 'Test company';

  const tocHtml = buildToc(struct, lang);

  /* ---------- CONTENT – headings use identical clean numbers ---------- */
  const contentSectionNumber = 8;
  let contentHtml = '';
  struct.forEach((section, sIdx) => {
    const secId  = `content-sec-${sIdx}`;
    const secNum = `${contentSectionNumber}.${sIdx + 1}`;
    contentHtml += `<div id="${secId}"><h2 class="header-spacing">${secNum} ${escapeHtml(section.name || 'Unnamed Section')}</h2>`;
    if (section.description) contentHtml += `<p class="section-desc">${escapeHtml(section.description)}</p>`;

    (section.subSections || []).forEach((sub, ssIdx) => {
      const subId  = `${secId}-sub-${ssIdx}`;
      const subNum = `${secNum}.${ssIdx + 1}`;
      contentHtml += `<div id="${subId}"><h3 class="header-spacing">${subNum} ${escapeHtml(sub.name || 'Unnamed Subsection')}</h3>`;
      if (sub.description) contentHtml += `<p class="subsection-desc">${escapeHtml(sub.description)}</p>`;

      (sub.questions || []).forEach((q) => {
        const resp = responses.find(r => String(r.questionId) === String(q._id)) || {};
        let display = resp.selectedValue;
        if (Array.isArray(display)) display = display.join(', ');
        else if (display === undefined || display === null || display === '') display = DICT.NO_RESPONSE[lang];

        const status = getStatusInfo(resp.selectedValue);
        const answerHtml = `<span style="color:${status.color};"><strong>${escapeHtml(String(display))}</strong></span>`;

        const commentHtml = resp.comment
          ? `<div class="comment"><strong>Comment:</strong><div>${escapeHtml(resp.comment)}</div></div>` : '';
        const recomHtml = resp.recommendation
          ? `<div class="recommendation"><strong>Recommendation:</strong><div>${escapeHtml(resp.recommendation)}</div></div>` : '';
        const evidHtml = (Array.isArray(resp.evidenceUrls) && resp.evidenceUrls.length)
          ? `<div class="evidence"><strong>Evidence:</strong><ul>${resp.evidenceUrls.map(u => `<li><a href="${escapeHtml(u)}">${escapeHtml(u)}</a></li>`).join('')}</ul></div>` : '';

        contentHtml += `
          <div class="question-block">
            <div class="question-header" style="border-left:3px solid ${status.color};">
              <p class="question-title"><strong>${escapeHtml(q.text || 'Untitled question')}</strong></p>
            </div>
            <div class="answer-row"><strong>Answer:</strong> ${answerHtml}</div>
            ${recomHtml}${commentHtml}${evidHtml}
          </div>`;
      });
      contentHtml += '</div>';
    });
    contentHtml += '</div>';
  });

  /* ---------- static texts ---------- */
  const introText              = DICT.INTRO_TEXT[lang];
  const aboutConsultingText    = DICT.ABOUT_CONSULTING_TEXT[lang];
  const aboutAuditedText       = DICT.ABOUT_AUDITED_TEXT[lang](companyName, company.industry, contactName, contactEmail, company.generalInfo);
  const prefaceText            = DICT.PREFACE_TEXT[lang];
  const disclaimerText         = DICT.DISCLAIMER_TEXT[lang];
  const execSummaryText        = DICT.EXEC_SUMMARY_TEXT[lang](companyName, template.name, overallScore);
  const handoverHtml           = DICT.HANDOVER_TEXT[lang](template.name);
  const thankYouHtml           = DICT.THANK_YOU_TEXT[lang](examinerName, examinerEmail);

  /* ---------- examination environment table ---------- */
  const envHtml = `
    <table class="env">
      <tr><td><strong>Locations</strong></td><td>${escapeHtml(String(examEnv.locations ?? 'N/A'))}</td></tr>
      <tr><td><strong>Number of employees</strong></td><td>${escapeHtml(String(examEnv.employees ?? 'N/A'))}</td></tr>
      <tr><td><strong>Clients (total)</strong></td><td>${escapeHtml(String(examEnv.clients?.total ?? 'N/A'))}</td></tr>
      <tr><td><strong>Clients (managed)</strong></td><td>${escapeHtml(String(examEnv.clients?.managed ?? 'N/A'))}</td></tr>
      <tr><td><strong>Clients (unmanaged)</strong></td><td>${escapeHtml(String(examEnv.clients?.unmanaged ?? 'N/A'))}</td></tr>
      <tr><td><strong>Industry</strong></td><td>${escapeHtml(examEnv.industry || company.industry || 'N/A')}</td></tr>
      <tr><td><strong>Physical servers</strong></td><td>${escapeHtml(String(examEnv.physicalServers ?? 'N/A'))}</td></tr>
      <tr><td><strong>VM servers</strong></td><td>${escapeHtml(String(examEnv.vmServers ?? 'N/A'))}</td></tr>
      <tr><td><strong>Firewalls</strong></td><td>${escapeHtml(String(examEnv.firewalls ?? 'N/A'))}</td></tr>
      <tr><td><strong>Switches</strong></td><td>${escapeHtml(String(examEnv.switches ?? 'N/A'))}</td></tr>
      <tr><td><strong>Mobile working</strong></td><td>${examEnv.mobileWorking ? 'Yes' : 'No'}</td></tr>
      <tr><td><strong>Smartphones</strong></td><td>${examEnv.smartphones ? 'Yes' : 'No'}</td></tr>
      ${examEnv.notes ? `<tr><td><strong>Notes</strong></td><td>${escapeHtml(examEnv.notes)}</td></tr>` : ''}
    </table>`;

  /* =========================================================
   *  HTML SHELL – CSS counters removed, clean TOC
   * ========================================================= */
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(template.name || 'Assessment Report')} – ${escapeHtml(companyName)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400 ;700&display=swap" rel="stylesheet">
  <style>
    @page{margin:0.35in; @bottom-center{content:counter(page)"/"counter(pages); font-family:Arial,sans-serif; font-size:10pt; color:#666;}}
    body{font-family:Arial,sans-serif; font-size:14pt; color:#2c3e50; margin:0; -webkit-print-color-adjust:exact;text-align:justify;}
    .container{padding:0.35in; box-sizing:border-box;}
    .cover-page{height:9.3in; display:flex; flex-direction:column; justify-content:space-between; text-align:center; padding:20px 0;}
    .logo{max-width:350px;}
    .cover-quote{margin-top:30px; font-size:15pt; max-width:700px; margin-left:auto; margin-right:auto;}
    .slogan-center{font-size:14pt; margin-top:20px; font-style:italic; color:#014f65; text-align:center;}
    .slogan-local{text-align:center; font-style:italic; color:#014f65; margin-top:20px; font-size:16pt;}
    .no-style-link{color:#000 !important; text-decoration:none !important;}
    h2,h3,.cover-title h1,.cover-title h2{font-family:'Lexend',sans-serif !important; color:#014f65;}
    h2{font-size:26pt !important; text-align:center;} h3{font-size:20pt !important;}
    .header-spacing{margin:25px 0 16px !important;}
    .static-text,.justify-text{line-height:1.5 !important;}
    .page-break{page-break-before:always;} .section-page-break{page-break-before:always;}
    .subsection{page-break-inside:avoid;}
    .question-block{page-break-inside:avoid; margin-bottom:10px; padding:10px; background:#fafafa; border:1px solid #eee; border-radius:4px;}
    .question-header{padding-left:10px; border-left:3px solid;}
    .answer-row,.comment,.recommendation,.evidence{margin:5px 0; font-size:11pt;}
    .recommendation{background:#f0f8ff; padding:8px; border-left:4px solid #014f65;}
    .comment{background:#e6f7f6; padding:8px; border-left:4px solid #014f65;}
    .evidence{background:#fff8e6; padding:8px; border-left:4px solid #014f65;}

    /* --- TOC – no counters, clean list --- */
    .toc-root{list-style:none; padding-left:0; margin-top:8px; font-size:14pt;}
    .toc-root ul{list-style:none; padding-left:30px; margin-top:2px;}
    .toc-root li{margin-top:4px;}
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
        <img class="logo" src="https://res.cloudinary.com/dcviwtoog/image/upload/v1765422490/1_BKGS_Consulting_boqy3g.png " alt="Logo" />
        <div class="cover-title">
          <h1>${escapeHtml(template.name || 'Assessment Report')}</h1>
          <h2>${DICT.REPORT_TITLE[lang]}</h2>
        </div>
        <div class="meta" style="margin:20px 0; font-size:16pt;">
          <p><strong>${DICT.REPORT_DATE[lang]}</strong> ${escapeHtml(reportDate)}</p>
          <p><strong>${DICT.EXAM_DATE[lang]}</strong> ${escapeHtml(assessmentDateRange)}</p>
          <p><strong>${DICT.EXAMINER[lang]}</strong> ${escapeHtml(examinerName)}</p>
          <p><strong>${DICT.EMAIL[lang]}</strong> <a href="mailto:${escapeHtml(examinerEmail)}" class="no-style-link">${escapeHtml(examinerEmail)}</a></p>
        </div>
      </div>
      <div>
        <div style="font-size:16pt;">
          <p><strong>${DICT.FOR[lang]}</strong></p>
          <p><strong>${escapeHtml(companyName)}</strong></p>
          <p>${escapeHtml(contactName)} ${escapeHtml(contactEmail)}</p>
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

  <!-- ===========================  1. INTRODUCTION  =========================== -->
  <div class="container page-break" id="sec-0"><h2 class="header-spacing">1. ${DICT.INTRO[lang]}</h2>${introText}</div>

  <!-- ===========================  2. ABOUT CONSULTING  =========================== -->
  <div class="container page-break" id="sec-1"><h2 class="header-spacing">2. ${DICT.ABOUT_CONSULTING[lang]}</h2>${aboutConsultingText}</div>

  <!-- ===========================  3. ABOUT AUDITED  =========================== -->
  <div class="container page-break" id="sec-2"><h2 class="header-spacing">3. ${DICT.ABOUT_AUDITED[lang]}</h2>${aboutAuditedText}</div>

  <!-- ===========================  4. PREFACE  =========================== -->
  <div class="container page-break" id="sec-3"><h2 class="header-spacing">4. ${DICT.PREFACE[lang]}</h2>${prefaceText}</div>

  <!-- ===========================  5. DISCLAIMER  =========================== -->
  <div class="container page-break" id="sec-4"><h2 class="header-spacing">5. ${DICT.DISCLAIMER[lang]}</h2>${disclaimerText}</div>

  <!-- ===========================  6. EXECUTIVE SUMMARY  =========================== -->
  <div class="container page-break" id="sec-5"><h2 class="header-spacing">6. ${DICT.EXEC_SUMMARY[lang]}</h2>${execSummaryText}</div>

  <!-- ===========================  7. EXAMINATION ENVIRONMENT  =========================== -->
  <div class="container page-break" id="sec-6"><h2 class="header-spacing">7. ${DICT.EXAM_ENV[lang]}</h2>${envHtml}</div>

  <!-- ===========================  8. THE CONTENT  =========================== -->
  <div class="container page-break" id="sec-7"><h2 class="header-spacing">8. ${DICT.THE_CONTENT[lang]}</h2>${contentHtml}</div>

  <!-- ===========================  9. HANDOVER  =========================== -->
  <div class="container page-break" id="sec-8"><h2 class="header-spacing">9. ${DICT.HANDOVER[lang]}</h2>${handoverHtml}</div>

  <!-- ===========================  10. THANK YOU  =========================== -->
  <div class="container page-break" id="sec-9"><h2 class="header-spacing">10. ${DICT.THANK_YOU[lang]}</h2>${thankYouHtml}</div>

</body>
</html>`;

  return html;
};

export default generateReportHtml;