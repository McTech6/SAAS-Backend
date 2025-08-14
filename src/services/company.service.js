// // src/services/company.service.js

// import Company from '../models/company.model.js';
// import User from '../models/user.model.js'; // Needed to check manager hierarchy for Admins

// /**
//  * Service for managing client companies.
//  */
// class CompanyService {
//     /**
//      * Creates a new company.
//      * @param {object} companyData - Data for the new company.
//      * @param {string} createdByUserId - The ID of the user creating the company.
//      * @returns {Promise<Company>} The newly created company object.
//      */
//     async createCompany(companyData, createdByUserId) {
//         const newCompany = new Company({
//             ...companyData,
//             createdBy: createdByUserId,
//             lastModifiedBy: createdByUserId // Initial creator is also the last modifier
//         });
//         await newCompany.save();
//         return newCompany;
//     }

//     /**
//      * Retrieves all companies based on the requesting user's role and hierarchy.
//      * @param {string} requestingUserId - The ID of the user making the request.
//      * @param {string} requestingUserRole - The role of the user making the request.
//      * @returns {Promise<Array<Company>>} A list of companies accessible to the user.
//      */
//     async getAllCompanies(requestingUserId, requestingUserRole) {
//         let query = {};

//         if (requestingUserRole === 'super_admin') {
//             // Super Admin sees all companies
//             query = {};
//         } else if (requestingUserRole === 'admin') {
//             // Admin sees companies they created, and companies created by auditors they manage.
//             const managedAuditors = await User.find({ managerId: requestingUserId }).select('_id');
//             const managedAuditorIds = managedAuditors.map(auditor => auditor._id);

//             query = {
//                 $or: [
//                     { createdBy: requestingUserId }, // Companies created by this admin
//                     { createdBy: { $in: managedAuditorIds } } // Companies created by auditors managed by this admin
//                 ]
//             };
//         } else if (requestingUserRole === 'auditor') {
//             // Auditor sees companies they created.
//             // (Companies assigned to them via AuditInstance will be handled when AuditInstance is built)
//             query = { createdBy: requestingUserId };
//         } else {
//             // Should not happen if authorize middleware is correctly applied
//             throw new Error('Unauthorized role to view companies.');
//         }

//         // Populate createdBy and lastModifiedBy fields to show user names if needed in future
//         return Company.find(query)
//                       .populate('createdBy', 'firstName lastName email')
//                       .populate('lastModifiedBy', 'firstName lastName email');
//     }

//     /**
//      * Retrieves a single company by ID, with access control.
//      * @param {string} companyId - The ID of the company to retrieve.
//      * @param {string} requestingUserId - The ID of the user making the request.
//      * @param {string} requestingUserRole - The role of the user making the request.
//      * @returns {Promise<Company>} The company object.
//      * @throws {Error} If company not found or user unauthorized.
//      */
//     async getCompanyById(companyId, requestingUserId, requestingUserRole) {
//         const company = await Company.findById(companyId)
//                                      .populate('createdBy', 'firstName lastName email')
//                                      .populate('lastModifiedBy', 'firstName lastName email');

//         if (!company) {
//             throw new Error('Company not found.');
//         }

//         // Implement access control for single company retrieval
//         if (requestingUserRole === 'super_admin') {
//             return company; // Super Admin can see any company
//         } else if (requestingUserRole === 'admin') {
//             const managedAuditors = await User.find({ managerId: requestingUserId }).select('_id');
//             const managedAuditorIds = managedAuditors.map(auditor => auditor._id.toString());

//             // Admin can see companies they created or companies created by auditors they manage
//             if (company.createdBy.toString() === requestingUserId || managedAuditorIds.includes(company.createdBy.toString())) {
//                 return company;
//             } else {
//                 throw new Error('You are not authorized to view this company.');
//             }
//         } else if (requestingUserRole === 'auditor') {
//             // Auditor can only see companies they created.
//             // (Access to companies assigned via AuditInstance will be added later)
//             if (company.createdBy.toString() === requestingUserId) {
//                 return company;
//             } else {
//                 throw new Error('You are not authorized to view this company.');
//             }
//         } else {
//             throw new Error('Unauthorized role to view this company.');
//         }
//     }

//     /**
//      * Updates an existing company.
//      * @param {string} companyId - The ID of the company to update.
//      * @param {object} updates - Fields to update.
//      * @param {string} requestingUserId - The ID of the user making the request.
//      * @param {string} requestingUserRole - The role of the user making the request.
//      * @returns {Promise<Company>} The updated company object.
//      * @throws {Error} If company not found or user unauthorized.
//      */
    
//     async updateCompany(companyId, updates, requestingUserId, requestingUserRole) {
//         const company = await Company.findById(companyId);

//         if (!company) {
//             throw new Error('Company not found.');
//         }

//         // --- REFACTORED AUTHORIZATION LOGIC ---
//         // Convert IDs to strings for a reliable comparison
//         const createdByIdString = company.createdBy.toString();
//         const requestingUserIdString = requestingUserId.toString();

//         // Check if the requesting user created this company
//         const didCreateCompany = createdByIdString === requestingUserIdString;
        
//         // Authorization flags
//         let isAuthorized = false;

//         // A super admin or admin is authorized if they created the company
//         if ((requestingUserRole === 'super_admin' || requestingUserRole === 'admin') && didCreateCompany) {
//             isAuthorized = true;
//         }
        
//         // Special case: An admin can also update companies created by their managed auditors
//         if (requestingUserRole === 'admin' && !didCreateCompany) {
//             const managedAuditors = await User.find({ managerId: requestingUserId }).select('_id');
//             const managedAuditorIds = managedAuditors.map(auditor => auditor._id.toString());
//             if (managedAuditorIds.includes(createdByIdString)) {
//                 isAuthorized = true;
//             }
//         }
        
//         // If none of the above conditions were met, the user is not authorized
//         if (!isAuthorized) {
//             throw new Error('You are not authorized to update this company.');
//         }

//         // ... (the rest of the function remains the same)
//         const updatedCompany = await Company.findByIdAndUpdate(
//             companyId,
//             { ...updates, lastModifiedBy: requestingUserId },
//             { new: true, runValidators: true }
//         ).populate('createdBy', 'firstName lastName email')
//          .populate('lastModifiedBy', 'firstName lastName email');

//         if (!updatedCompany) {
//             throw new Error('Company not found after update.');
//         }

//         return updatedCompany;
//     }


//     /**
//      * Deletes a company permanently.
//      * @param {string} companyId - The ID of the company to delete.
//      * @param {string} requestingUserRole - The role of the user making the request.
//      * @returns {Promise<void>}
//      * @throws {Error} If company not found or user unauthorized.
//      */
//     async deleteCompany(companyId, requestingUserRole) {
//         // Only Super Admin and Admin can delete companies.
//         // Admin can only delete companies they created or those created by their managed auditors.
//         if (requestingUserRole === 'auditor') {
//             throw new Error('Unauthorized role to delete companies.');
//         }

//         const company = await Company.findById(companyId);
//         if (!company) {
//             throw new Error('Company not found.');
//         }

//         if (requestingUserRole === 'admin') {
//             const managedAuditors = await User.find({ managerId: requestingUserId }).select('_id');
//             const managedAuditorIds = managedAuditors.map(auditor => auditor._id.toString());
//             if (company.createdBy.toString() !== requestingUserId && !managedAuditorIds.includes(company.createdBy.toString())) {
//                 throw new Error('You are not authorized to delete this company.');
//             }
//         }

//         await Company.findByIdAndDelete(companyId);
//     }
// }

// // Helper array to ensure only valid fields are updated
// const companyDataFields = ['name', 'industry', 'contactPerson', 'address', 'website', 'status'];

// export default new CompanyService();

// src/services/company.service.js

import Company from '../models/company.model.js';
import User from '../models/user.model.js'; // Needed to check manager hierarchy for Admins

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
        // All users, including Super Admins, can only see companies they created
        const query = { createdBy: requestingUserId };

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

        // Implement access control for single company retrieval
        if (company.createdBy.toString() !== requestingUserId) {
            throw new Error('You are not authorized to view this company.');
        }

        return company;
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

        // Check if the requesting user created this company
        if (company.createdBy.toString() !== requestingUserId) {
            throw new Error('You are not authorized to update this company.');
        }

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

        // Check if the requesting user created this company
        if (company.createdBy.toString() !== requestingUserId) {
            throw new Error('You are not authorized to delete this company.');
        }

        await Company.findByIdAndDelete(companyId);
    }
}

export default new CompanyService();
