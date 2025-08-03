// src/services/audit.service.js
// This is a hypothetical file. Find the one that handles your audit creation/company retrieval.

import AuditInstance from '../models/auditInstance.model.js';
import Company from '../models/company.model.js';

// ... other imports

class AuditService {

    /**
     * Retrieves companies that a user is authorized to perform audits on.
     * This is the function that is likely failing for your admin user.
     * @param {string} requestingUserId - The ID of the user making the request.
     * @param {string} requestingUserRole - The role of the user making the request.
     * @returns {Promise<Array<Company>>} A list of companies available for audit.
     */
    async getAvailableCompaniesForAudit(requestingUserId, requestingUserRole) {
        let query = {};

        if (requestingUserRole === 'super_admin') {
            // Super Admin can audit all companies.
            query = {};
        } else if (requestingUserRole === 'admin') {
            // Admin can audit companies they created.
            // (You may also want to add logic for companies created by auditors they manage)
            query = { createdBy: requestingUserId };
        } else {
            // Auditors and other roles are not authorized to pick companies for an audit.
            throw new Error('You are not authorized to list companies for an audit.');
        }

        // Find the companies and return them.
        const companies = await Company.find(query)
                                     .select('name'); // Select only the name, or other minimal fields

        return companies;
    }

    /**
     * Creates a new audit instance for a company.
     * The permission check should be here as well.
     * @param {string} companyId - The ID of the company.
     * @param {string} templateId - The ID of the audit template.
     * @param {string} createdByUserId - The user creating the audit instance.
     * @param {string} createdByUserRole - The role of the user.
     * @returns {Promise<AuditInstance>} The new audit instance.
     */
    async createAuditInstance(companyId, templateId, createdByUserId, createdByUserRole) {
        // First, check if the user is authorized to create an audit for this company.
        const company = await Company.findById(companyId);

        if (!company) {
            throw new Error('Company not found.');
        }

        // The key permission check!
        if (createdByUserRole === 'super_admin') {
            // Super Admin has full access.
            // Do nothing, they are authorized.
        } else if (createdByUserRole === 'admin') {
            // Admin can only create audits for companies they created.
            if (company.createdBy.toString() !== createdByUserId) {
                throw new Error('You are not authorized to create an audit for this company.');
            }
        } else {
            // Any other role is not authorized.
            throw new Error('You are not authorized to create an audit.');
        }

        // If the user is authorized, proceed with creating the audit instance.
        const newAuditInstance = new AuditInstance({
            company: companyId,
            template: templateId,
            createdBy: createdByUserId,
            status: 'draft'
        });

        await newAuditInstance.save();
        return newAuditInstance;
    }
}

export default new AuditService();
