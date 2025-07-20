// Using the provided ISACA badge image URL for the logo
const LOGO_URL = 'https://images.credly.com/images/9c7b4205-6582-403c-b656-be1590248fcd/ISACA_CybersecurityAudit_badge_352x352.png';

// Array of motivational quotes
const MOTIVATIONS = [
    "In the digital age, security is not just a feature, it's the foundation of trust. This report reflects our commitment to empowering your organization with clarity and actionable insights, transforming vulnerabilities into strengths and ensuring a resilient future.",
    "Cybersecurity is a journey, not a destination. This audit marks a crucial checkpoint, guiding your path towards unwavering digital resilience.",
    "Protecting your digital assets is paramount. This report illuminates the path to a more secure and compliant future, safeguarding your innovation.",
    "The strength of your defense lies in understanding your vulnerabilities. This audit provides the intelligence needed to build an impenetrable fortress.",
    "In a world of evolving threats, proactive security is your greatest asset. We empower you with the insights to stay ahead, always.",
    "This report is more than findings; it's a blueprint for digital peace of mind. Let's build a future where your data is unequivocally safe.",
    "Security is not a cost, but an investment in your future. This audit validates that investment, ensuring every byte is protected.",
    "Navigating the cybersecurity landscape requires precision and foresight. This report offers both, charting a clear course to enhanced protection.",
    "Every vulnerability discovered is an opportunity for stronger defense. This audit transforms potential risks into pathways for robust security.",
    "Your trust is our mission. This comprehensive report is a testament to our dedication to securing your digital world, one audit at a time"
];

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

/**
 * Generates the HTML content for the audit report.
 * @param {object} auditInstance - The audit instance object with populated data.
 * @returns {string} The full HTML string for the PDF report.
 */
const generateReportHtml = (auditInstance) => {
    const company = auditInstance.company || {};
    const template = auditInstance.template || {};
    const responses = auditInstance.responses || [];
    const templateStructure = auditInstance.templateStructureSnapshot || [];
    const overallScore = auditInstance.overallScore || 0;
    const createdBy = auditInstance.createdBy || {};
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const completionDate = auditInstance.actualCompletionDate ?
        new Date(auditInstance.actualCompletionDate).toLocaleDateString('en-US', dateOptions) :
        'N/A';
    const reportDate = new Date().toLocaleDateString('en-US', dateOptions);

    // Select a random motivation
    const randomMotivation = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];

    let tableOfContentsHtml = '';
    let mainContentHtml = '';

    // Build Table of Contents and Main Content
    templateStructure.forEach((section) => {
        const sectionId = `section-${section._id || 'unknown'}`;
        tableOfContentsHtml += `<li><a href="#${sectionId}">${escapeHtml(section.name || 'Unnamed Section')}</a></li><ul>`;
        mainContentHtml += `<h2 id="${sectionId}" class="section-title">${escapeHtml(section.name || 'Unnamed Section')}</h2>`;
        if (section.description) {
            mainContentHtml += `<p class="section-description">${escapeHtml(section.description)}</p>`;
        }

        (section.subSections || []).forEach((subSection) => {
            const subSectionId = `subsection-${subSection._id || 'unknown'}`;
            tableOfContentsHtml += `<li><a href="#${subSectionId}">${escapeHtml(subSection.name || 'Unnamed Subsection')}</a></li>`;
            mainContentHtml += `<h3 id="${subSectionId}" class="subsection-title">${escapeHtml(subSection.name || 'Unnamed Subsection')}</h3>`;
            if (subSection.description) {
                mainContentHtml += `<p class="subsection-description">${escapeHtml(subSection.description)}</p>`;
            }

            (subSection.questions || []).forEach((question, qIndex) => {
                const response = responses.find(r => r.questionId?.toString() === question._id?.toString()) || {};
                const selectedValue = response.selectedValue || 'N/A';
                const answerDescription = response.answerOptionsSnapshot ?
                    (response.answerOptionsSnapshot.find(opt => opt.value === selectedValue)?.description || 'No description provided.') :
                    'N/A';
                const comment = response.comment || '';
                const includeComment = response.includeCommentInReport || false;
                const evidenceUrls = response.evidenceUrls || [];

                mainContentHtml += `
                    <div class="question-block">
                        <p class="question-text"><strong>Q${qIndex + 1}:</strong> ${escapeHtml(question.text || 'No question text')}</p>
                        <p class="answer"><strong>Answer:</strong> <span class="answer-value">${escapeHtml(selectedValue)}</span></p>
                        <p class="answer-description">${escapeHtml(answerDescription)}</p>
                `;

                if (question.type === 'numeric' && selectedValue !== 'N/A') {
                    mainContentHtml += `<p class="numeric-value"><strong>Value:</strong> ${escapeHtml(selectedValue)}</p>`;
                }

                if (comment && includeComment) {
                    mainContentHtml += `<div class="comment-section"><strong>Comment:</strong> <p>${escapeHtml(comment)}</p></div>`;
                }

                if (evidenceUrls.length > 0) {
                    mainContentHtml += `<div class="evidence-section"><strong>Evidence:</strong><ul>`;
                    evidenceUrls.forEach(url => {
                        mainContentHtml += `<li><a href="${escapeHtml(url)}" target="_blank">${escapeHtml(url)}</a></li>`;
                    });
                    mainContentHtml += `</ul></div>`;
                }
                mainContentHtml += `</div>`; // Close question-block
            });
        });
        tableOfContentsHtml += `</ul>`; // Close subsection list
    });

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cybersecurity Audit Report - ${escapeHtml(company.name || 'Unknown Company')}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

                body {
                    font-family: 'Inter', sans-serif;
                    margin: 0;
                    padding: 0;
                    color: #333;
                    line-height: 1.6;
                    font-size: 11pt;
                }

                .page {
                    padding: 1in;
                    box-sizing: border-box;
                    page-break-after: always;
                }

                /* Cover Page Styling */
                .cover-page {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    height: 100vh;
                    background-color: #f8f8f8;
                    padding: 2in 1in;
                }
                .cover-page img {
                    max-width: 250px;
                    max-height: 150px;
                    object-fit: contain;
                    margin-bottom: 30px;
                }
                .cover-page h1 {
                    font-size: 3em;
                    color: #008175;
                    margin-bottom: 10px;
                    font-weight: 700;
                }
                .cover-page h2 {
                    font-size: 1.8em;
                    color: #231f20;
                    margin-bottom: 20px;
                    font-weight: 600;
                }
                .cover-page p {
                    font-size: 1.1em;
                    margin-bottom: 10px;
                }
                .cover-page .motivation {
                    font-style: italic;
                    color: #555;
                    margin-top: 40px;
                    font-size: 1.2em;
                    max-width: 700px;
                }
                .cover-page .audit-meta {
                    margin-top: 50px;
                    font-size: 1em;
                    color: #666;
                }

                /* Table of Contents Styling */
                .table-of-contents {
                    page-break-before: always;
                    padding: 1in;
                }
                .table-of-contents h2 {
                    font-size: 2em;
                    color: #008175;
                    margin-bottom: 30px;
                    text-align: center;
                }
                .table-of-contents ul {
                    list-style: none;
                    padding: 0;
                }
                .table-of-contents ul li {
                    margin-bottom: 10px;
                    font-size: 1.1em;
                }
                .table-of-contents ul ul {
                    padding-left: 20px;
                    margin-top: 5px;
                }
                .table-of-contents a {
                    text-decoration: none;
                    color: #231f20;
                    font-weight: 400;
                    display: block;
                    padding: 5px 0;
                    border-bottom: 1px dotted #ccc;
                }
                .table-of-contents a:hover {
                    color: #008175;
                }

                /* Main Content Styling */
                .report-content {
                    padding: 1in;
                }
                .section-title {
                    font-size: 1.8em;
                    color: #008175;
                    margin-top: 40px;
                    margin-bottom: 15px;
                    padding-bottom: 5px;
                    border-bottom: 2px solid #008175;
                    page-break-before: always;
                }
                .subsection-title {
                    font-size: 1.4em;
                    color: #231f20;
                    margin-top: 30px;
                    margin-bottom: 10px;
                    padding-bottom: 3px;
                    border-bottom: 1px solid #ccc;
                }
                .section-description, .subsection-description {
                    font-size: 0.95em;
                    color: #555;
                    margin-bottom: 20px;
                }

                .question-block {
                    background-color: #f9f9f9;
                    border: 1px solid #eee;
                    border-left: 5px solid #008175;
                    padding: 15px;
                    margin-bottom: 20px;
                    border-radius: 8px;
                }
                .question-text {
                    font-size: 1.1em;
                    font-weight: 600;
                    color: #231f20;
                    margin-bottom: 10px;
                }
                .answer {
                    font-size: 1em;
                    margin-bottom: 5px;
                }
                .answer-value {
                    font-weight: 700;
                    color: #008175;
                }
                .answer-description {
                    font-size: 0.9em;
                    color: #666;
                    margin-left: 15px;
                    margin-bottom: 10px;
                }
                .numeric-value {
                    font-size: 1em;
                    margin-bottom: 10px;
                    color: #444;
                }
                .comment-section {
                    background-color: #e6f7f6;
                    border-left: 3px solid #008175;
                    padding: 10px;
                    margin-top: 15px;
                    border-radius: 4px;
                }
                .comment-section p {
                    font-size: 0.95em;
                    color: #333;
                    margin: 0;
                }
                .evidence-section {
                    margin-top: 15px;
                    font-size: 0.9em;
                }
                .evidence-section ul {
                    list-style: disc;
                    padding-left: 20px;
                    margin: 5px 0 0 0;
                }
                .evidence-section li {
                    margin-bottom: 3px;
                }
                .evidence-section a {
                    color: #007bff;
                    text-decoration: underline;
                }

                /* Final Page Styling */
                .final-page {
                    page-break-before: always;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    height: 100vh;
                    background: linear-gradient(135deg, #e6f7f6 0%, #d1e8e6 100%);
                    color: #231f20;
                    padding: 2in 1in;
                }
                .final-page h2 {
                }
                .final-page p {
                    font-size: 1.2em;
                    max-width: 800px;
                    margin-bottom: 20px;
                }
                .final-page .contact-info {
                    margin-top: 40px;
                    font-size: 1.1em;
                    color: #444;
                }
                .final-page .contact-info a {
                    color: #007bff;
                    text-decoration: none;
                    font-weight: 600;
                }
                .final-page .slogan {
                    margin-top: 60px;
                    font-size: 1.5em;
                    font-style: italic;
                    color: #005f56;
                    font-weight: 600;
                }

                /* Footer for page numbers (Puppeteer handles this) */
                .footer {
                    font-size: 9pt;
                    color: #777;
                    text-align: center;
                    width: 100%;
                }

                /* Print specific styles */
                @page {
                    margin: 1in;
                }
                body {
                    -webkit-print-color-adjust: exact;
                }
                @media print {
                    .evidence-section a:after {
                        content: " (" attr(href) ")";
                        font-size: 0.8em;
                        color: #555;
                    }
                    .contact-info a:after {
                        content: " (" attr(href) ")";
                        font-size: 0.8em;
                        color: #555;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Cover Page -->
            <div class="page cover-page">
                <img src="${LOGO_URL}" alt="CyberSecurity Audit 360 Logo">
                <h1>Cybersecurity Audit 360</h1>
                <h2>Comprehensive Audit Report</h2>
                <p>For: <strong>${escapeHtml(company.name || 'Unknown Company')}</strong></p>
                <p>Audit Template: <strong>${escapeHtml(template.name || 'Unknown Template')} (v${escapeHtml(template.version || 'N/A')})</strong></p>
                <p>Report Date: <strong>${reportDate}</strong></p>
                <p>Completion Date: <strong>${completionDate}</strong></p>
                <div class="audit-meta">
                    <p>Prepared by: ${escapeHtml(createdBy.firstName || 'Unknown')} ${escapeHtml(createdBy.lastName || 'User')} (${escapeHtml(createdBy.email || 'N/A')})</p>
                </div>
                <p class="motivation">
                    "${escapeHtml(randomMotivation)}"
                </p>
            </div>

            <!-- Table of Contents Page -->
            <div class="page table-of-contents">
                <h2>Table of Contents</h2>
                <ul>
                    ${tableOfContentsHtml}
                </ul>
            </div>

            <!-- Overall Summary -->
            <div class="page report-content">
                <h2 class="section-title">Executive Summary</h2>
                <p>This report provides a comprehensive overview of the cybersecurity posture for <strong>${escapeHtml(company.name || 'Unknown Company')}</strong> based on the <strong>"${escapeHtml(template.name || 'Unknown Template')}"</strong> audit template (version ${escapeHtml(template.version || 'N/A')}).</p>
                <p>The audit covered key areas including Information Security Policies, Access Control, and other critical domains as defined in the selected template.</p>
                <p>Overall, the assessment indicates a compliance score of <strong>${overallScore.toFixed(2)}%</strong>. Detailed findings and observations are provided in the subsequent sections, along with specific recommendations for improvement.</p>
                <p>It is crucial to address identified areas of non-compliance and implement recommended remediation actions to strengthen the overall security framework and ensure continuous adherence to best practices.</p>
            </div>

            <!-- Main Report Content -->
            <div class="report-content">
                ${mainContentHtml}
            </div>

            <!-- Final Page -->
            <div class="page final-page">
                <h2>Thank You for Choosing Cybersecurity Audit 360</h2>
                <p>We are committed to enhancing your organization's security posture and ensuring compliance in an ever-evolving threat landscape. This report serves as a foundational step towards a more resilient and secure future.</p>
                <p>Our team is dedicated to supporting your journey beyond this audit. We encourage you to review the findings and recommendations carefully and reach out to us for any clarifications or assistance in implementing the suggested improvements.</p>
                <div class="contact-info">
                    <p>For further discussions or to schedule a follow-up consultation, please contact us:</p>
                    <p>Email: <a href="mailto:taudit098@gmail.com">info@cybersecurityaudit360.com</a></p>
                    <p>Website: <a href="https://www.cybersecurityaudit360.com" target="_blank">www.cybersecurityaudit360.com</a></p>
                </div>
                <p class="slogan">"Securing Your Digital Horizon, Together."</p>
            </div>
        </body>
        </html>
    `;
};

export default generateReportHtml;