// src/services/company.service.js

import Company from '../models/company.model.js';
import User from '../models/user.model.js';

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
     * Retrieves all companies created by the requesting user.
     * @param {string} requestingUserId - The ID of the user making the request.
     * @returns {Promise<Array<Company>>} A list of companies created by the user.
     */
    async getAllCompanies(requestingUserId) {
        const query = { createdBy: requestingUserId };

        return Company.find(query)
            .populate('createdBy', 'firstName lastName email')
            .populate('lastModifiedBy', 'firstName lastName email');
    }

    /**
     * Retrieves a single company by ID, ensuring it belongs to the requesting user.
     * @param {string} companyId - The ID of the company to retrieve.
     * @param {string} requestingUserId - The ID of the user making the request.
     * @returns {Promise<Company>} The company object.
     * @throws {Error} If company not found or user unauthorized.
     */
    async getCompanyById(companyId, requestingUserId) {
        const company = await Company.findById(companyId)
            .populate('createdBy', 'firstName lastName email')
            .populate('lastModifiedBy', 'firstName lastName email');

        if (!company) {
            throw new Error('Company not found.');
        }

        if (company.createdBy._id.toString() !== requestingUserId.toString()) {
            throw new Error('You are not authorized to view this company.');
        }

        return company;
    }

    /**
     * Updates an existing company if it belongs to the requesting user.
     * @param {string} companyId - The ID of the company to update.
     * @param {object} updates - Fields to update.
     * @param {string} requestingUserId - The ID of the user making the request.
     * @returns {Promise<Company>} The updated company object.
     * @throws {Error} If company not found or user unauthorized.
     */
    async updateCompany(companyId, updates, requestingUserId) {
        const company = await Company.findById(companyId);

        if (!company) {
            throw new Error('Company not found.');
        }

        if (company.createdBy.toString() !== requestingUserId.toString()) {
            throw new Error('You are not authorized to update this company.');
        }

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            { ...updates, lastModifiedBy: requestingUserId },
            { new: true, runValidators: true }
        )
            .populate('createdBy', 'firstName lastName email')
            .populate('lastModifiedBy', 'firstName lastName email');

        if (!updatedCompany) {
            throw new Error('Company not found after update.');
        }

        return updatedCompany;
    }

    /**
     * Deletes a company permanently if it belongs to the requesting user.
     * @param {string} companyId - The ID of the company to delete.
     * @param {string} requestingUserId - The ID of the user making the request.
     * @returns {Promise<void>}
     * @throws {Error} If company not found or user unauthorized.
     */
    async deleteCompany(companyId, requestingUserId) {
        const company = await Company.findById(companyId);
        if (!company) {
            throw new Error('Company not found.');
        }

        if (company.createdBy.toString() !== requestingUserId.toString()) {
            throw new Error('You are not authorized to delete this company.');
        }

        await Company.findByIdAndDelete(companyId);
    }
}

// Helper array to ensure only valid fields are updated
const companyDataFields = ['name', 'industry', 'contactPerson', 'address', 'website', 'status'];

export default new CompanyService();
