// src/utils/reportGenerator.js

// Base64 encoded logo image (from image_43015c.png)
const LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAFwCAYAAAA7/fR2AAAACXBIWXMAAAsTAAALEwEAmpwYAAAF1mlUWHRYTUw6Yy5vbS5hZG9iZS54bXAAAAAAADx4OnZhbGlkYXRpb25zdGF0ZT5JbnZhbGlkPC94OnZhbGlkYXRpb25zdGF0ZT4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0cGs9IlhNUCBDb3JlIDYuMC4wIj4KPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgeG1sbnM6c3RSdmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcmRmLzEuMC9zVHlwZS9SZXNvdXJjZVZlcmNpZm9ybSNyZWYiCiAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgICB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iPgogICAgPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmRva3VtZW50SUQ9InhtcC5kaWQ6Q0I2N0Y2QzQxQzQ3MTFFRUI2RjFENjE4NzU3RkQ0RjgiIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Q0I2N0Y2QzMxQzQ3MTFFRUI2RjFENjE4NzU3RkQ0RjgiIHN0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpDQjY3RjZDQzFDNDcxMUVFQjZGMRFENjE4NzU3RkQ0RjgiLz4KICAgIDxkYzp0aXRsZT4KICAgICAgPHJkZjpBbHQ+CiAgICAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5DeWJlclNlY3VyaXR5PC9yZGY6bGk+CiAgICAgIDwvcmRmOkFsdD4KICAgIDw4bXA6Q3JlYXRvclRvb2w+QWRvYmUgSWxsdXN0cmF0b3IgMjUuMjwveG1wOkNyZWF0b3JUb29sPgogICAgPHBob3Rvc2hvcDpDb2xvck1vZGU+MzwvcGhvdG9zaG9wOkNvbG9yTW9kZT4KICAgIDxwaG90b3Nob3A6SUNDUHJvZmlsZT5zUkdCPjwvcGhvdG9zaG9wOklDQ1Byb2ZpbGU+CiAgICA8eG1wOk1vZGlmeURhdGU+MjAyMS0wNi0yNlQxMDoxODo1Nlo8L3htcDpNb2RpZnlEYXRlPgogICAgPHhtcDpNZXRhZGF0YURhdGU+MjAyMS0wNi0yNlQxMDoxODo1Nlo8L3htcDpNZXRhZGF0YURhdGU+CiAgICA8eG1wOlRocW1iTmFpbT5DeWJlclNlY3VyaXR5PC94bXA6VGhqbWJOYWltPgogICAgPHhtcDpUaHVtYm5haWxzPgogICAgICA8cmRmOkFsdD4KICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgIDxzdFJrZjp3aWR0aD4yNTY8L3N0UmtmOndpZHRoPgogICAgICAgICAgPHN0UmtmOmhlaWdodD4xNzA8L3N0UmtmOmhlaWdodD4KICAgICAgICAgIDxzdFJrZjpmb3JtYXQ+SlBFRzwvc3RSa2Y6Zm9ybWF0PgogICAgICAgICAgPHN0UmtmOmltYWdlLz4KICAgICAgICA8L3JkZjpsaT4KICAgICAgPC9yZGY6QWx0PgogICAgPC94bXA6VGh1bWJuYWlscz4KICA8L3JkZjpEZXNjcmlwdGlvbj4KPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxOTIwIDEwODAiPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDojMDA4MTc1O30uY2xzLTJ7ZmlsbDojMjM1ZjIwO30uY2xzLTN7Zm9udC1zaXplOjEyOHB4O2ZpbGwtcnVsZTpldmVub2RkO2ZvbnQtZmFtaWx5OiJBcmlhbEJsYWNrTUQiO30uY2xzLTR7ZmlsbDojZmZmO308L3N0eWxlPjwvZGVmcz48dGl0bGU+Q3liZXJTZWN1cml0eTwvdGl0bGU+PGcgaWQ9Ikdyb3VwXzEiIGRhdGEtnamePSJHcm91cCAxIj48cGF0aCBpZD0iUGF0aF8xIiBkYXRhLW5hbWU9IlBhdGggMSIgY2xhc3M9ImNscy0xIiBkPSJNMTI3NS4wOSw2NzkuNDdhNDc4LjUxLDQ3OC41MSwwLDAsMS00NzguNDcsNDc4LjQ4SDI4MC41NWE0NzguNTEsNDc4LjUxLDAsMCwxLTQ3OC40Ny00NzguNDhWMjgwLjU1QTQ3OC41MSw0NzguNTEsMCwwLDEyODAuNTUsLDEuMDhoNTE2LjA3YTQ3OC41MSw0NzguNTEsMCwwLDE0NzguNDcsNDc4LjQ3VjY3OS40N1oiLz48cGF0aCBpZD0iUGF0aF8yIiBkYXRhLW5hbWU9IlBhdGggMiIgY2xhc3M9ImNscy0yIiBkPSJNMTI3NS4wOSw2NzkuNDdhNDc4LjUxLDQ3OC41MSwwLDAsMS00NzguNDcsNDc4LjQ4SDI4MC41NWE0NzguNTEsNDc4LjUxLDAsMCwxLTQ3OC40Ny00NzguNDhWMjgwLjU1QTQ3OC41MSw0NzguNTEsMCwwLDEyODAuNTUsLDEuMDhoNTE2LjA3YTQ3OC41MSw0NzguNTEsMCwwLDE0NzguNDcsNDc4LjQ3VjY3OS40N1oiLz48L2c+PGcgaWQ9Ikdyb3VwXzIiIGRhdGEtbmFtZT0iR3JvdXAgMiI+PGcgaWQ9Ikdyb3VwXzMiIGRhdGEtbmFtZT0iR3JvdXAgMyI+PHBhdGggY2xhc3M9ImNscy0zIiBkPSJNMTY2Ny41Nyw2NjMuNjZsLTQxLjY0LTM4LjQ3Yy0yMy40Ny0yMS42NC01MS4yNi0zNS42OS04My40Ni00MS42NGExNzYuODQsMTc2Ljg0LDAsMCwxLTM2LjQxLTIuNjNjLTc4LjQ2LTkuNzctMTQ4LjQ0LTQ3LjI2LTE5NS44OS0xMDcuNzJhNDAwLjQ4LDQwMC40OCwwLDAsMS02Ny42Ni05OC45M0MxMTI5LjU4LDI5Mi41LDExMTUuNTMsMjY0LjcyLDExMDYuMDYsMjM1LjQ2bC0zOC40Ny00MS42NGMtMTkuNTktMjEuNjQtNDkuMjUtMjcuNjYtNzIuNzItMTQuNjRjLTIzLjQ3LDEzLTMyLjU1LDQxLjY0LTIyLjc4LDY1LjExbDM4LjQ3LDQxLjY0YzkuNzcsMjMuNDYsMjMuNDYsNDcuMjYsMzYuNDEsNjcuNjZhMzYyLjQ3LDM2Mi40NywwLDAsMCw1Mi42OSw2Ny42NmM0Ny4yNi02NS4xMSwxMDcuNzItMTEyLjU1LDE4OS43OS0xMzIuMTNhMjE0LjQ0LDIxNC40NCwwLDAsMCw0OS4yNS02LjUxYzI3LjY2LTEuOTUsNTUuMzMtNC41Niw4My40Ni0xNy41NWw0MS42NC0zOC40N2MyMy40Ny0yMS42NCw1MS4yNi0xMy42LDU1LjMzLDE0LjY0QTEwMy44OSwxMDMuODksMCwwLDE2NjcuNTcsNjYzLjY2WiIvPjxwYXRoIGNsYXNzPSJjbHMtMyIgZD0iTTE2NjcuNTcsNjYzLjY2bC00MS42NC0zOC40N2MtMjMuNDctMjEuNjQtNTEuMjYtMzUuNjktODMuNDYtNDEuNjRhMTc2Ljg0LDE3Ni44NCwwLDAsMS0zNi40MS0yLjYzYy03OC40Ni05Ljc3LTE0OC40NC00Ny4yNi0xOTUuODktMTA3LjcyYTQwMC40OCw0MC4wNDgsMCwwLDEtNjcuNjYtOTguOTNDMTEyOS41OCwyOTIuNSwxMTE1LjUzLDI2NC43MiwxMTA2LjA2LDIzNS40NmwtMzguNDctNDEuNjRjLTE5LjU5LTIxLjY0LTQ5LjI1LTI3LjY2LTcyLjcyLTE0LjY0Yy0yMy40NywxMy0zMi41NSw0MS42NC0yMi43OCw2NS4xMWwzOC40Nyw0MS42NGM5Ljc3LDIzLjQ2LDIzLjQ2LDQ3LjI2LDM2LjQxLDY3LjY2YTM2Mi40NywzNjIuNDcsMCwwLDAsNTIuNjksNjcuNjZjNDcuMjYtNjUuMTEsMTA3LjcyLTExMi41NSwxODkuNzktMTMyLjEzYy00OS4yNS02LjUxYzI3LjY2LTEuOTUsNTUuMzMtNC41Niw4My40Ni0xNy41NWw0MS42NC0zOC40N2MyMy40Ny0yMS42NCw1MS4yNi0xMy42LDU1LjMzLDE0LjY0QTEwMy44OSwxMDMuODksMCwwLDE2NjcuNTcsNjYzLjY2WiIvPjwvZz48L2c+PGcgaWQ9Ikdyb3VwXzQiIGRhdGEtbmFtZT0iR3JvdXAgNCI+PGcgaWQ9Ikdyb3VwXzUiIGRhdGEtbmFtZT0iR3JvdXAgNSI+PHBhdGggY2xhc3M9ImNscy0zIiBkPSJNMTQ1MS4yMSw0ODAuMzZhMTcwLjg5LDE3MC44OSwwLDAsMS0xNzAuODksLTE3MC44OXYtNDEuNjRjMC0xNy41NS0xNC42NC0zMi41NS0zMi41NS0zMi41NXMtMzIuNTUsMTQuNjQtMzIuNTUsMzIuNTV2NDEuNjRhMjM2LjI1LDIzNi4yNSwwLDAsMCw2NS4xMSwxNzAuODljNjUuMTEsNjUuMTEsMTcwLjg5LDY1LjExLDIzNS45OSwwYTQ1OS4xNyw0NTkuMTcsMCwwLDAsNjUuMTEtMTcwLjg5VjMyNy44M2MwLTE3LjU1LTE0LjY0LTMyLjU1LTMyLjU1LTMyLjU1cy0zMi41NSwxNC42NC0zMi41NSwzMi41NXY0MS42NEE1NS44OSw1NS44OSwwLDAsMSwxNDUxLjIxLDQ4MC4zNlpNMTI0Ny44Nyw2NzkuNDdhMTcwLjg5LDE3MC44OSwwLDAsMS0xNzAuODktMTcwLjg5VjUyNi4yNGMwLTE3LjU1LTE0LjY0LTMyLjU1LTMyLjU1LTMyLjU1cy0zMi41NSwxNC42NC0zMi41NSwzMi41NXY0MS42NGEyMzYuMjUsMjM2LjI1LDAsMCwwLDY1LjExLDE3MC44OWM2NS4xMSw2NS4xMSwxNzAuODksNjUuMTEsMjM1Ljk5LDBhNDU5LjE3LDQ1OS4xNywwLDAsMCw2NS4xMS0xNzAuODlWNTI2LjI0YzAtMTcuNTUtMTQuNjQtMzIuNTUtMzIuNTUtMzIuNTVzLTMyLjU1LDE0LjY0LTMyLjU1LDMyLjU1djQxLjY0QTE3MC44OSwxNzAuODksMCwwLDEyNDcuODcsNjc5LjQ3WiIvPjxwYXRoIGNsYXNzPSJjbHMtMyIgZD0iTTE0NTEuMjEsNDgwLjM2YTE3MC44OSwxNzAuODksMCwwLDEtMTcwLjg5LTE3MC44OXYtNDEuNjRjMC0xNy41NS0xNC42NC0zMi41NS0zMi41NS0zMi41NXMtMzIuNTUsMTQuNjQtMzIuNTUsMzIuNTV2NDEuNjRhMjM2LjI1LDIzNi4yNSwwLDAsMCw2NS4xMSwxNzAuODljNjUuMTEsNjUuMTEsMTcwLjg5LDY1LjExLDIzNS45OSwwYTQ1OS4xNyw0NTkuMTcsMCwwLDAsNjUuMTEtMTcwLjg5VjMyNy44M2MwLTE3LjU1LTE0LjY0LTMyLjU1LTMyLjU1LTMyLjU1cy0zMi41NSwxNC42NC0zMi41NSwzMi41NXY0MS42NEE1NS44OSw1NS44OSwwLDAsMSwxNDUxLjIxLDQ4MC4zNlpNMTI0Ny44Nyw2NzkuNDdhMTcwLjg5LDE3MC44OSwwLDAsMS0xNzAuODktMTcwLjg5VjUyNi4yNGMwLTE3LjU1LTE0LjY0LTMyLjU1LTMyLjU1LTMyLjU1cy0zMi41NSwxNC42NC0zMi41NSwzMi41NXY0MS42NGEyMzYuMjUsMjM2LjI1LDAsMCwwLDY1LjExLDE3MC44OWM2NS4xMSw2NS4xMSwxNzAuODksNjUuMTEsMjM1Ljk5LDBhNDU5LjE3LDQ1OS4xNywwLDAsMCw2NS4xMS0xNzAuODlWNTI2LjI0YzAtMTcuNTUtMTQuNjQtMzIuNTUtMzIuNTUtMzIuNTVzLTMyLjU1LDE0LjY0LTMyLjU1LDMyLjU1djQxLjY0QTE3MC44OSwxNzAuODksMCwwLDEyNDcuODcsNjc5LjQ3WiIvPjwvZz48L2c+PGg0IGNsYXNzPSJjbHMtNCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzQ4LjM0IDg2NS40NikiPjxzcGFuIGNsYXNzPSJjbHMtNCI+Q3liZXJTZWN1cml0eTwvc3Bhbj48L2g0Pjwvc3ZnPg==';

/**
 * Generates the HTML content for the audit report.
 * @param {object} auditInstance - The audit instance object with populated data.
 * @returns {string} The full HTML string for the PDF report.
 */
const generateReportHtml = (auditInstance) => {
    const company = auditInstance.company;
    const template = auditInstance.template;
    const responses = auditInstance.responses;
    const templateStructure = auditInstance.templateStructureSnapshot;
    const overallScore = auditInstance.overallScore;
    const createdBy = auditInstance.createdBy;
    const completionDate = auditInstance.actualCompletionDate ?
        new Date(auditInstance.actualCompletionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) :
        'N/A';

    let tableOfContentsHtml = '';
    let mainContentHtml = '';
    let sectionCounter = 0;
    let subsectionCounter = 0;

    // Build Table of Contents and Main Content
    templateStructure.forEach((section, secIndex) => {
        sectionCounter++;
        subsectionCounter = 0; // Reset subsection counter for each new section

        const sectionId = `section-${section._id}`;
        tableOfContentsHtml += `<li><a href="#${sectionId}">${sectionCounter}. ${section.name}</a></li><ul>`;
        mainContentHtml += `<h2 id="${sectionId}" class="section-title">${sectionCounter}. ${section.name}</h2>`;
        if (section.description) {
            mainContentHtml += `<p class="section-description">${section.description}</p>`;
        }

        section.subSections.forEach((subSection, subSecIndex) => {
            subsectionCounter++;
            const subSectionId = `subsection-${subSection._id}`;
            tableOfContentsHtml += `<li><a href="#${subSectionId}">${sectionCounter}.${subsectionCounter}. ${subSection.name}</a></li>`;
            mainContentHtml += `<h3 id="${subSectionId}" class="subsection-title">${sectionCounter}.${subsectionCounter}. ${subSection.name}</h3>`;
            if (subSection.description) {
                mainContentHtml += `<p class="subsection-description">${subSection.description}</p>`;
            }

            subSection.questions.forEach((question, qIndex) => {
                const response = responses.find(r => r.questionId.toString() === question._id.toString());
                const selectedValue = response ? response.selectedValue : 'N/A';
                const answerDescription = response && response.answerOptionsSnapshot ?
                    response.answerOptionsSnapshot.find(opt => opt.value === selectedValue)?.description || 'No description provided.' :
                    'N/A';
                const comment = response && response.comment ? response.comment : '';
                const includeComment = response ? response.includeCommentInReport : false;
                const evidenceUrls = response && response.evidenceUrls ? response.evidenceUrls : [];

                mainContentHtml += `
                    <div class="question-block">
                        <p class="question-text"><strong>Q${qIndex + 1}:</strong> ${question.text}</p>
                        <p class="answer"><strong>Answer:</strong> <span class="answer-value">${selectedValue}</span></p>
                        <p class="answer-description">${answerDescription}</p>
                `;

                if (question.type === 'numeric' && selectedValue !== 'N/A') {
                    mainContentHtml += `<p class="numeric-value"><strong>Value:</strong> ${selectedValue}</p>`;
                }

                if (comment && includeComment) {
                    mainContentHtml += `<div class="comment-section"><strong>Comment:</strong> <p>${comment}</p></div>`;
                } else if (comment && !includeComment) {
                    // Optionally, you could add a note here that comment was not included if desired for debugging
                    // mainContentHtml += `<div class="comment-section not-included"><strong>Comment (Not included in report):</strong> <p>${comment}</p></div>`;
                }

                if (evidenceUrls.length > 0) {
                    mainContentHtml += `<div class="evidence-section"><strong>Evidence:</strong><ul>`;
                    evidenceUrls.forEach(url => {
                        mainContentHtml += `<li><a href="${url}" target="_blank">${url}</a></li>`;
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
            <title>Cybersecurity Audit Report - ${company.name}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

                body {
                    font-family: 'Inter', sans-serif;
                    margin: 0;
                    padding: 0;
                    color: #333;
                    line-height: 1.6;
                    font-size: 11pt; /* Base font size for readability */
                }

                .page {
                    padding: 1in; /* Standard margins */
                    box-sizing: border-box;
                    page-break-after: always; /* Ensure each major section starts on a new page */
                }

                /* Cover Page Styling */
                .cover-page {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    height: 100vh; /* Full viewport height */
                    background-color: #f8f8f8;
                    padding: 2in 1in;
                }
                .cover-page img {
                    max-width: 250px;
                    height: auto;
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
                    page-break-before: always; /* New section starts on new page */
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
                    background-color: #e6f7f6; /* Light teal background */
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
                    -webkit-print-color-adjust: exact; /* Ensures background colors are printed */
                }
            </style>
        </head>
        <body>
            <!-- Cover Page -->
            <div class="page cover-page">
                <img src="${LOGO_BASE64}" alt="CyberSecurity Logo">
                <h1>Cybersecurity Audit 360</h1>
                <h2>Comprehensive Audit Report</h2>
                <p>For: <strong>${company.name}</strong></p>
                <p>Audit Template: <strong>${template.name} (v${template.version})</strong></p>
                <p>Report Date: <strong>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
                <p>Completion Date: <strong>${completionDate}</strong></p>
                <div class="audit-meta">
                    <p>Prepared by: ${createdBy.firstName} ${createdBy.lastName} (${createdBy.email})</p>
                </div>
                <p class="motivation">
                    "In the digital age, security is not just a feature, it's the foundation of trust.
                    This report reflects our commitment to empowering your organization with clarity and actionable insights,
                    transforming vulnerabilities into strengths and ensuring a resilient future."
                </p>
            </div>

            <!-- Table of Contents Page -->
            <div class="page table-of-contents">
                <h2>Table of Contents</h2>
                <ul>
                    ${tableOfContentsHtml}
                </ul>
            </div>

            <!-- Overall Summary (Optional, can be expanded) -->
            <div class="page report-content">
                <h2 class="section-title">Executive Summary</h2>
                <p>This report provides a comprehensive overview of the cybersecurity posture for <strong>${company.name}</strong> based on the <strong>"${template.name}"</strong> audit template (version ${template.version}).</p>
                <p>The audit covered key areas including Information Security Policies, Access Control, and other critical domains as defined in the selected template.</p>
                <p>Overall, the assessment indicates a compliance score of <strong>${overallScore.toFixed(2)}%</strong>. Detailed findings and observations are provided in the subsequent sections, along with specific recommendations for improvement.</p>
                <p>It is crucial to address identified areas of non-compliance and implement recommended remediation actions to strengthen the overall security framework and ensure continuous adherence to best practices.</p>
            </div>

            <!-- Main Report Content -->
            <div class="report-content">
                ${mainContentHtml}
            </div>
        </body>
        </html>
    `;
};

export default generateReportHtml;
