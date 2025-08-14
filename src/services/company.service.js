// src/services/company.service.js

import Company from '../models/company.model.js';
import User from '../models/user.model.js'; // Needed to check manager hierarchy for Admins

/**
 * Service for managing client companies.
 */
class CompanyService {
    /**
     * Creates a new company.
     * @param {object} companyData - Data for the new company.
     * @param {string} createdByUserId - The ID of the user creating the company.
     * @returns {Promise<Company>} The newly created company object.
     */
    async createCompany(companyData, createdByUserId) {
        const newCompany = new Company({
            ...companyData,
            createdBy: createdByUserId,
            lastModifiedBy: createdByUserId // Initial creator is also the last modifier
        });
        await newCompany.save();
        return newCompany;
    }

    /**
     * Retrieves all companies based on the requesting user's role and hierarchy.
     * @param {string} requestingUserId - The ID of the user making the request.
     * @param {string} requestingUserRole - The role of the user making the request.
     * @returns {Promise<Array<Company>>} A list of companies accessible to the user.
     */
    async getAllCompanies(requestingUserId, requestingUserRole) {
        let query = {};

        // All users (super_admin, admin, auditor) can only see companies they created
        if (requestingUserRole === 'super_admin' || requestingUserRole === 'admin' || requestingUserRole === 'auditor') {
            query = { createdBy: requestingUserId };
        } else {
            // Should not happen if authorize middleware is correctly applied
            throw new Error('Unauthorized role to view companies.');
        }

        // Populate createdBy and lastModifiedBy fields to show user names if needed in future
        return Company.find(query)
                      .populate('createdBy', 'firstName lastName email')
                      .populate('lastModifiedBy', 'firstName lastName email');
    }

    /**
     * Retrieves a single company by ID, with access control.
     * @param {string} companyId - The ID of the company to retrieve.
     * @param {string} requestingUserId - The ID of the user making the request.
     * @param {string} requestingUserRole - The role of the user making the request.
     * @returns {Promise<Company>} The company object.
     * @throws {Error} If company not found or user unauthorized.
     */
    async getCompanyById(companyId, requestingUserId, requestingUserRole) {
        const company = await Company.findById(companyId)
                                     .populate('createdBy', 'firstName lastName email')
                                     .populate('lastModifiedBy', 'firstName lastName email');

        if (!company) {
            throw new Error('Company not found.');
        }

        // All users can only see companies they created
        if (requestingUserRole === 'super_admin' || requestingUserRole === 'admin' || requestingUserRole === 'auditor') {
            if (company.createdBy.toString() === requestingUserId) {
                return company;
            } else {
                throw new Error('You are not authorized to view this company.');
            }
        } else {
            throw new Error('Unauthorized role to view this company.');
        }
    }

    /**
     * Updates an existing company.
     * @param {string} companyId - The ID of the company to update.
     * @param {object} updates - Fields to update.
     * @param {string} requestingUserId - The ID of the user making the request.
     * @param {string} requestingUserRole - The role of the user making the request.
     * @returns {Promise<Company>} The updated company object.
     * @throws {Error} If company not found or user unauthorized.
     */
    async updateCompany(companyId, updates, requestingUserId, requestingUserRole) {
        const company = await Company.findById(companyId);

        if (!company) {
            throw new Error('Company not found.');
        }

        // --- SIMPLIFIED AUTHORIZATION LOGIC ---
        // All users can only update companies they created
        const createdByIdString = company.createdBy.toString();
        const requestingUserIdString = requestingUserId.toString();

        if (createdByIdString !== requestingUserIdString) {
            throw new Error('You are not authorized to update this company.');
        }

        // Update the company
        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            { ...updates, lastModifiedBy: requestingUserId },
            { new: true, runValidators: true }
        ).populate('createdBy', 'firstName lastName email')
         .populate('lastModifiedBy', 'firstName lastName email');

        if (!updatedCompany) {
            throw new Error('Company not found after update.');
        }

        return updatedCompany;
    }

    /**
     * Deletes a company permanently.
     * @param {string} companyId - The ID of the company to delete.
     * @param {string} requestingUserId - The ID of the user making the request.
     * @param {string} requestingUserRole - The role of the user making the request.
     * @returns {Promise<void>}
     * @throws {Error} If company not found or user unauthorized.
     */
    async deleteCompany(companyId, requestingUserId, requestingUserRole) {
        const company = await Company.findById(companyId);
        if (!company) {
            throw new Error('Company not found.');
        }

        // All users can only delete companies they created
        if (company.createdBy.toString() !== requestingUserId) {
            throw new Error('You are not authorized to delete this company.');
        }

        await Company.findByIdAndDelete(companyId);
    }
}

// Helper array to ensure only valid fields are updated
const companyDataFields = ['name', 'industry', 'contactPerson', 'address', 'website', 'status'];

export default new CompanyService();