// src/services/auditInstance.service.js

import AuditInstance from '../models/auditInstance.model.js';
import AuditTemplate from '../models/auditTemplate.model.js';
import Company from '../models/company.model.js';
import User from '../models/user.model.js';
import companyService from './company.service.js'; // To reuse company creation logic

/**
 * Service for managing Audit Instances and their responses.
 */
class AuditInstanceService {
    /**
     * Creates a new audit instance. This can involve creating a new company
     * or linking to an existing one, and always involves snapshotting an audit template.
     * @param {object} data - Contains company details (if new) or existing company ID, and audit template ID.
     * @param {object} requestingUser - The authenticated user creating the audit ({ id, role }).
     * @returns {Promise<AuditInstance>} The newly created audit instance.
     * @throws {Error} If template or company not found, or other validation issues.
     */
    async createAuditInstance(data, requestingUser) {
        const { companyDetails, existingCompanyId, auditTemplateId, assignedAuditorIds, startDate, endDate } = data;

        let companyId;
        // 1. Handle Company creation or selection
        if (companyDetails) {
            // Create new company
            const newCompany = await companyService.createCompany(companyDetails, requestingUser.id);
            companyId = newCompany._id;
        } else if (existingCompanyId) {
            // Use existing company, ensure user has access to it
            const existingCompany = await companyService.getCompanyById(existingCompanyId, requestingUser.id, requestingUser.role);
            if (!existingCompany) {
                throw new Error('Existing company not found or you do not have access to it.');
            }
            companyId = existingCompany._id;
        } else {
            throw new Error('Either companyDetails or existingCompanyId must be provided.');
        }

        // 2. Fetch and Snapshot Audit Template
        const auditTemplate = await AuditTemplate.findById(auditTemplateId);
        if (!auditTemplate) {
            throw new Error('Audit Template not found.');
        }

        // Create a deep copy (snapshot) of the template's structure
        // Mongoose .toObject() creates a plain JS object, then JSON.parse/stringify for deep copy
        const templateStructureSnapshot = JSON.parse(JSON.stringify(auditTemplate.sections.toObject()));

        // 3. Prepare initial Audit Responses (stubs for each question)
        const initialResponses = [];
        templateStructureSnapshot.forEach(section => {
            section.subSections.forEach(subSection => {
                subSection.questions.forEach(question => {
                    initialResponses.push({
                        questionId: question._id, // Link to the original question ID
                        questionTextSnapshot: question.text,
                        questionTypeSnapshot: question.type,
                        answerOptionsSnapshot: question.answerOptions,
                        comment: '', // Initialize empty
                        includeCommentInReport: question.includeCommentInReportDefault, // Use default from template
                        score: 0, // Initialize score
                        auditorId: requestingUser.id, // Creator is default auditor for responses
                        lastUpdated: new Date()
                    });
                });
            });
        });

        // 4. Create Audit Instance
        const newAuditInstance = new AuditInstance({
            company: companyId,
            template: auditTemplateId,
            templateNameSnapshot: auditTemplate.name,
            templateVersionSnapshot: auditTemplate.version,
            templateStructureSnapshot: templateStructureSnapshot, // The full snapshot
            assignedAuditors: assignedAuditorIds || [requestingUser.id], // Assign creator by default if none specified
            startDate: startDate || new Date(),
            endDate: endDate,
            status: 'Draft', // Start as Draft
            responses: initialResponses,
            createdBy: requestingUser.id,
            lastModifiedBy: requestingUser.id
        });

        await newAuditInstance.save();
        // FIX: Use a single populate call with an array of paths for robustness
        return newAuditInstance
            .populate([
                { path: 'company', select: 'name industry contactPerson' },
                { path: 'template', select: 'name version' },
                { path: 'assignedAuditors', select: 'firstName lastName email' },
                { path: 'createdBy', select: 'firstName lastName email' }
            ]);
    }

    /**
     * Retrieves all audit instances accessible to the requesting user.
     * @param {object} requestingUser - The authenticated user ({ id, role }).
     * @returns {Promise<Array<AuditInstance>>} A list of audit instances.
     */
    async getAllAuditInstances(requestingUser) {
        let query = {};

        if (requestingUser.role === 'super_admin') {
            // Super Admin sees all audit instances
            query = {};
        } else if (requestingUser.role === 'admin') {
            // Admin sees audits they created, and audits created by auditors they manage.
            const managedAuditors = await User.find({ managerId: requestingUser.id }).select('_id');
            const managedAuditorIds = managedAuditors.map(auditor => auditor._id);

            query = {
                $or: [
                    { createdBy: requestingUser.id }, // Audits created by this admin
                    { createdBy: { $in: managedAuditorIds } }, // Audits created by auditors managed by this admin
                    { assignedAuditors: requestingUser.id } // Audits explicitly assigned to this admin
                ]
            };
        } else if (requestingUser.role === 'auditor') {
            // Auditor sees audits they created or are assigned to.
            query = {
                $or: [
                    { createdBy: requestingUser.id }, // Audits created by this auditor
                    { assignedAuditors: requestingUser.id } // Audits explicitly assigned to this auditor
                ]
            };
        } else {
            throw new Error('Unauthorized role to view audit instances.');
        }

        return AuditInstance.find(query)
            .populate('company', 'name industry')
            .populate('template', 'name version')
            .populate('assignedAuditors', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email')
            .populate('lastModifiedBy', 'firstName lastName email');
    }

    /**
     * Retrieves a single audit instance by ID, with access control.
     * @param {string} auditInstanceId - The ID of the audit instance to retrieve.
     * @param {object} requestingUser - The authenticated user ({ id, role }).
     * @returns {Promise<AuditInstance>} The audit instance object.
     * @throws {Error} If audit instance not found or user unauthorized.
     */
    async getAuditInstanceById(auditInstanceId, requestingUser) {
        const auditInstance = await AuditInstance.findById(auditInstanceId)
            .populate('company', 'name industry contactPerson address website')
            .populate('template', 'name version')
            .populate('assignedAuditors', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email')
            .populate('lastModifiedBy', 'firstName lastName email');

        if (!auditInstance) {
            throw new Error('Audit Instance not found.');
        }

        // Implement access control
        if (requestingUser.role === 'super_admin') {
            return auditInstance;
        } else if (requestingUser.role === 'admin') {
            const managedAuditors = await User.find({ managerId: requestingUser.id }).select('_id');
            const managedAuditorIds = managedAuditors.map(auditor => auditor._id.toString());

            const isCreator = auditInstance.createdBy.toString() === requestingUser.id;
            const isAssigned = auditInstance.assignedAuditors.some(auditor => auditor._id.toString() === requestingUser.id);
            const isCreatedByManagedAuditor = managedAuditorIds.includes(auditInstance.createdBy.toString());

            if (isCreator || isAssigned || isCreatedByManagedAuditor) {
                return auditInstance;
            } else {
                throw new Error('You are not authorized to view this audit instance.');
            }
        } else if (requestingUser.role === 'auditor') {
            const isCreator = auditInstance.createdBy.toString() === requestingUser.id;
            const isAssigned = auditInstance.assignedAuditors.some(auditor => auditor._id.toString() === requestingUser.id);

            if (isCreator || isAssigned) {
                return auditInstance;
            } else {
                throw new Error('You are not authorized to view this audit instance.');
            }
        } else {
            throw new Error('Unauthorized role to view this audit instance.');
        }
    }


    /**
     * Submits or updates responses for specific questions within an audit instance.
     * Automatically transitions status from 'Draft' to 'In Progress' on first response.
     * @param {string} auditInstanceId - The ID of the audit instance.
     * @param {Array<object>} responsesData - Array of response objects ({ questionId, selectedValue, comment, includeCommentInReport, evidenceUrls }).
     * @param {object} requestingUser - The authenticated user submitting responses ({ id, role }).
     * @returns {Promise<AuditInstance>} The updated audit instance.
     * @throws {Error} If audit instance not found, not authorized, or audit is completed/archived.
     */
    async submitResponses(auditInstanceId, responsesData, requestingUser) {
        const auditInstance = await AuditInstance.findById(auditInstanceId);

        if (!auditInstance) {
            throw new Error('Audit Instance not found.');
        }

        // Ensure user is authorized to submit responses for this audit
        const isAssignedOrCreator = auditInstance.assignedAuditors.some(auditor => auditor.toString() === requestingUser.id) || auditInstance.createdBy.toString() === requestingUser.id;
        if (requestingUser.role === 'auditor' && !isAssignedOrCreator) {
            throw new Error('You are not authorized to submit responses for this audit.');
        }
        // Admins and Super Admins can always submit if they have access to the audit
        if (requestingUser.role === 'admin') {
            const adminAccess = await this.getAuditInstanceById(auditInstanceId, requestingUser); // Use the access logic
            if (!adminAccess) throw new Error('You are not authorized to submit responses for this audit.');
        }


        // Prevent updates if audit is Completed or Archived
        if (auditInstance.status === 'Completed' || auditInstance.status === 'Archived') {
            throw new Error(`Cannot submit responses. Audit is already ${auditInstance.status}.`);
        }

        // Transition from Draft to In Progress on first response submission
        if (auditInstance.status === 'Draft' && responsesData && responsesData.length > 0) {
            auditInstance.status = 'In Progress';
        }

        for (const newResponseData of responsesData) {
            const { questionId, selectedValue, comment, includeCommentInReport, evidenceUrls } = newResponseData;

            // Find the existing response for this question, or create a new one if it's somehow missing (shouldn't be if stubs are created correctly)
            let existingResponse = auditInstance.responses.find(r => r.questionId.toString() === questionId);

            if (existingResponse) {
                // Update existing response
                existingResponse.selectedValue = selectedValue;
                existingResponse.comment = comment;
                existingResponse.includeCommentInReport = includeCommentInReport;
                existingResponse.evidenceUrls = evidenceUrls || []; // Ensure evidenceUrls is an array
                existingResponse.auditorId = requestingUser.id; // Update auditor who last responded
                existingResponse.lastUpdated = new Date();

                // Calculate score based on selectedValue if question has weight and answerOptions have scores
                const questionInSnapshot = auditInstance.templateStructureSnapshot
                    .flatMap(s => s.subSections)
                    .flatMap(ss => ss.questions)
                    .find(q => q._id.toString() === questionId);

                if (questionInSnapshot && questionInSnapshot.type === 'single_choice' || questionInSnapshot.type === 'multi_choice') {
                    const selectedOption = questionInSnapshot.answerOptions.find(opt => opt.value === selectedValue);
                    existingResponse.score = selectedOption ? selectedOption.score : 0;
                } else if (questionInSnapshot && questionInSnapshot.type === 'numeric' && typeof selectedValue === 'number') {
                    // For numeric questions, score could be based on a range or direct value
                    // For now, let's assume direct value contributes to score if applicable, or 0
                    existingResponse.score = selectedValue; // Placeholder logic, refine as needed
                } else {
                    existingResponse.score = 0; // Default score for other types
                }

            } else {
                // This case should ideally not happen if initial stubs are created correctly,
                // but as a fallback, add a new response.
                const questionInSnapshot = auditInstance.templateStructureSnapshot
                    .flatMap(s => s.subSections)
                    .flatMap(ss => ss.questions)
                    .find(q => q._id.toString() === questionId);

                if (!questionInSnapshot) {
                    console.warn(`Question with ID ${questionId} not found in template snapshot for audit ${auditInstanceId}. Skipping response.`);
                    continue;
                }

                const newResponse = {
                    questionId: questionId,
                    questionTextSnapshot: questionInSnapshot.text,
                    questionTypeSnapshot: questionInSnapshot.type,
                    answerOptionsSnapshot: questionInSnapshot.answerOptions,
                    selectedValue: selectedValue,
                    comment: comment,
                    includeCommentInReport: includeCommentInReport,
                    evidenceUrls: evidenceUrls || [],
                    auditorId: requestingUser.id,
                    lastUpdated: new Date()
                };
                 // Calculate score for new response
                if (questionInSnapshot.type === 'single_choice' || questionInSnapshot.type === 'multi_choice') {
                    const selectedOption = questionInSnapshot.answerOptions.find(opt => opt.value === selectedValue);
                    newResponse.score = selectedOption ? selectedOption.score : 0;
                } else if (questionInSnapshot.type === 'numeric' && typeof selectedValue === 'number') {
                    newResponse.score = selectedValue;
                } else {
                    newResponse.score = 0;
                }

                auditInstance.responses.push(newResponse);
            }
        }

        // Recalculate overall score
        auditInstance.overallScore = this._calculateOverallScore(auditInstance);
        auditInstance.lastModifiedBy = requestingUser.id;
        auditInstance.updatedAt = new Date(); // Explicitly update updatedAt

        await auditInstance.save();
        return auditInstance;
    }

    /**
     * Updates the status of an audit instance.
     * @param {string} auditInstanceId - The ID of the audit instance.
     * @param {string} newStatus - The new status (e.g., 'In Review', 'Completed', 'Archived').
     * @param {object} requestingUser - The authenticated user updating the status.
     * @returns {Promise<AuditInstance>} The updated audit instance.
     * @throws {Error} If audit instance not found, unauthorized, or invalid status transition.
     */
    async updateAuditStatus(auditInstanceId, newStatus, requestingUser) {
        const auditInstance = await AuditInstance.findById(auditInstanceId);

        if (!auditInstance) {
            throw new Error('Audit Instance not found.');
        }

        // Basic authorization: Super Admin can change any status.
        // Admin/Auditor can transition to 'In Review' or 'Completed' from 'In Progress'.
        // More granular rules can be added (e.g., only assigned auditor can mark 'In Review').
        if (requestingUser.role === 'auditor' && !['In Review', 'Completed'].includes(newStatus)) {
            throw new Error('Auditors can only mark audits as "In Review" or "Completed".');
        }
        if (requestingUser.role === 'admin' && !['In Review', 'Completed', 'Archived'].includes(newStatus) && newStatus !== 'Draft' && newStatus !== 'In Progress') {
             // Admins can set to In Review, Completed, Archived, and can revert to Draft/In Progress if needed for review feedback
            throw new Error('Admins can only transition to "In Review", "Completed", "Archived", "Draft", or "In Progress".');
        }
        if (requestingUser.role === 'super_admin' && !['Draft', 'In Progress', 'In Review', 'Completed', 'Archived'].includes(newStatus)) {
            throw new Error('Invalid status provided.');
        }

        // Enforce status transitions
        const currentStatus = auditInstance.status;
        if (currentStatus === 'Completed' && newStatus !== 'Archived') {
            throw new Error('Completed audits can only be archived.');
        }
        if (currentStatus === 'Archived' && newStatus !== 'Archived') { // Archived audits cannot be changed
            throw new Error('Archived audits cannot be modified.');
        }
        if (currentStatus === 'Draft' && !['In Progress', 'In Review', 'Completed'].includes(newStatus)) {
            throw new Error('Draft audits can only transition to In Progress, In Review, or Completed.');
        }
        if (currentStatus === 'In Progress' && !['In Review', 'Completed'].includes(newStatus)) {
            throw new Error('In Progress audits can only transition to In Review or Completed.');
        }
        if (currentStatus === 'In Review' && !['In Progress', 'Completed', 'Archived'].includes(newStatus)) {
            throw new Error('In Review audits can only transition to In Progress, Completed, or Archived.');
        }


        auditInstance.status = newStatus;
        auditInstance.lastModifiedBy = requestingUser.id;

        // Set actualCompletionDate if status becomes 'Completed'
        if (newStatus === 'Completed' && !auditInstance.actualCompletionDate) {
            auditInstance.actualCompletionDate = new Date();
        } else if (newStatus !== 'Completed' && auditInstance.actualCompletionDate) {
            // Clear completion date if reverted from completed
            auditInstance.actualCompletionDate = undefined;
        }

        await auditInstance.save();
        return auditInstance;
    }

    /**
     * Deletes an audit instance permanently.
     * @param {string} auditInstanceId - The ID of the audit instance to delete.
     * @param {object} requestingUser - The authenticated user deleting the instance.
     * @returns {Promise<void>}
     * @throws {Error} If audit instance not found or user unauthorized.
     */
    async deleteAuditInstance(auditInstanceId, requestingUser) {
        const auditInstance = await AuditInstance.findById(auditInstanceId);

        if (!auditInstance) {
            throw new Error('Audit Instance not found.');
        }

        // Only Super Admins can delete any audit. Admins can delete audits they created
        // or those created by auditors they manage, if the audit is not 'Completed' or 'Archived'.
        if (requestingUser.role === 'auditor') {
            throw new Error('Auditors are not authorized to delete audit instances.');
        }

        if (requestingUser.role === 'admin') {
            const managedAuditors = await User.find({ managerId: requestingUser.id }).select('_id');
            const managedAuditorIds = managedAuditors.map(auditor => auditor._id.toString());

            const isCreator = auditInstance.createdBy.toString() === requestingUser.id;
            const isCreatedByManagedAuditor = managedAuditorIds.includes(auditInstance.createdBy.toString());

            if (!isCreator && !isCreatedByManagedAuditor) {
                throw new Error('You are not authorized to delete this audit instance.');
            }

            // Admins cannot delete completed or archived audits
            if (auditInstance.status === 'Completed' || auditInstance.status === 'Archived') {
                throw new Error('Admins cannot delete completed or archived audit instances.');
            }
        }

        await AuditInstance.findByIdAndDelete(auditInstanceId);
    }

    /**
     * Helper function to calculate the overall score of an audit instance.
     * This can be expanded based on scoring methodology (e.g., weighted average).
     * For now, a simple sum of response scores.
     * @param {AuditInstance} auditInstance - The audit instance object.
     * @returns {number} The calculated overall score.
     */
    _calculateOverallScore(auditInstance) {
        if (!auditInstance.responses || auditInstance.responses.length === 0) {
            return 0;
        }

        let totalScore = 0;
        let maxPossibleScore = 0;

        auditInstance.responses.forEach(response => {
            const questionInSnapshot = auditInstance.templateStructureSnapshot
                .flatMap(s => s.subSections)
                .flatMap(ss => ss.questions)
                .find(q => q._id.toString() === response.questionId.toString());

            if (questionInSnapshot) {
                totalScore += response.score;
                // Assuming max possible score is sum of weights if all questions are answered perfectly
                // Or sum of max scores from answer options
                maxPossibleScore += questionInSnapshot.weight; // Simple example: max score for a question is its weight
            }
        });

        if (maxPossibleScore === 0) return 0; // Avoid division by zero

        // Return as a percentage
        return (totalScore / maxPossibleScore) * 100;
    }

    /**
     * Generates a report for an audit instance.
     * (Placeholder for actual report generation logic, which will be complex)
     * @param {string} auditInstanceId - The ID of the audit instance.
     * @param {object} requestingUser - The authenticated user generating the report.
     * @returns {Promise<object>} A simple confirmation for now.
     * @throws {Error} If audit instance not found, not authorized, or not completed.
     */
    async generateReport(auditInstanceId, requestingUser) {
        const auditInstance = await this.getAuditInstanceById(auditInstanceId, requestingUser); // Use access control

        if (!auditInstance) {
            throw new Error('Audit Instance not found.');
        }

        if (auditInstance.status !== 'Completed') {
            throw new Error(`Report can only be generated for completed audits. Current status: ${auditInstance.status}.`);
        }

        // --- Placeholder for actual report generation logic ---
        // In a real application, this would involve:
        // 1. Fetching all detailed data for the audit instance (company, template snapshot, responses).
        // 2. Using a reporting library (e.g., pdfkit, puppeteer for HTML-to-PDF, jasper reports, etc.)
        // 3. Filtering responses to include only comments where 'includeCommentInReport' is true.
        // 4. Formatting findings, scores, and recommendations.
        // 5. Returning a file stream or a URL to the generated report.
        // ---------------------------------------------------

        return { message: `Report generation initiated for Audit Instance ${auditInstanceId}. (Actual report file will be generated by a dedicated reporting module)` };
    }
}

export default new AuditInstanceService();
