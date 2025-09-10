// // src/controllers/company.controller.js

// import companyService from '../services/company.service.js';
// import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

// /**
//  * Controller for company management operations.
//  * These routes will be protected by authentication and authorization middleware.
//  */
// class CompanyController {
//     /**
//      * Creates a new company.
//      * Accessible by Super Admin, Admin, and Auditor.
//      * @param {object} req - Express request object.
//      * @param {object} res - Express response object.
//      */
//     async createCompany(req, res) {
//         try {
//             const companyData = req.body;
//             const createdByUserId = req.user.id; // Get ID of the authenticated user
//             const newCompany = await companyService.createCompany(companyData, createdByUserId);
//             sendSuccessResponse(res, 201, 'Company created successfully.', newCompany);
//         } catch (error) {
//             sendErrorResponse(res, 400, error.message);
//         }
//     }

//     /**
//      * Retrieves all companies accessible to the requesting user.
//      * Accessible by Super Admin, Admin, and Auditor.
//      * @param {object} req - Express request object.
//      * @param {object} res - Express response object.
//      */
//     async getAllCompanies(req, res) {
//         try {
//             const requestingUserId = req.user.id;
//             const requestingUserRole = req.user.role;
//             const companies = await companyService.getAllCompanies(requestingUserId, requestingUserRole);
//             sendSuccessResponse(res, 200, 'Companies retrieved successfully.', companies);
//         } catch (error) {
//             sendErrorResponse(res, 500, error.message);
//         }
//     }

//     /**
//      * Retrieves a single company by ID, with access control.
//      * Accessible by Super Admin, Admin, and Auditor.
//      * @param {object} req - Express request object.
//      * @param {object} res - Express response object.
//      */
//     async getCompanyById(req, res) {
//         try {
//             const { id } = req.params;
//             const requestingUserId = req.user.id;
//             const requestingUserRole = req.user.role;
//             const company = await companyService.getCompanyById(id, requestingUserId, requestingUserRole);
//             sendSuccessResponse(res, 200, 'Company retrieved successfully.', company);
//         } catch (error) {
//             sendErrorResponse(res, 404, error.message);
//         }
//     }

//     /**
//      * Updates an existing company.
//      * Accessible by Super Admin and Admin.
//      * @param {object} req - Express request object.
//      * @param {object} res - Express response object.
//      */
//     async updateCompany(req, res) {
//         try {
//             const { id } = req.params;
//             const updates = req.body;
//             const requestingUserId = req.user.id;
//             const requestingUserRole = req.user.role;
//             const updatedCompany = await companyService.updateCompany(id, updates, requestingUserId, requestingUserRole);
//             sendSuccessResponse(res, 200, 'Company updated successfully.', updatedCompany);
//         } catch (error) {
//             sendErrorResponse(res, 400, error.message);
//         }
//     }

//     /**
//      * Deletes a company permanently.
//      * Accessible by Super Admin and Admin.
//      * @param {object} req - Express request object.
//      * @param {object} res - Express response object.
//      */
//     async deleteCompany(req, res) {
//         try {
//             const { id } = req.params;
//             const requestingUserId = req.user.id; // Needed for admin/auditor check in service
//             const requestingUserRole = req.user.role;
//             await companyService.deleteCompany(id, requestingUserId, requestingUserRole);
//             sendSuccessResponse(res, 200, 'Company deleted successfully.');
//         } catch (error) {
//             sendErrorResponse(res, 400, error.message);
//         }
//     }
// }

// export default new CompanyController();


// src/controllers/company.controller.js

import companyService from '../services/company.service.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

/**
 * Controller for company management operations.
 * These routes will be protected by authentication and authorization middleware.
 */
class CompanyController {
    /**
     * Creates a new company.
     * Accessible by Super Admin, Admin, and Auditor.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async createCompany(req, res) {
        try {
            const companyData = req.body;
            const createdByUserId = req.user.id; // Get ID of the authenticated user
            const newCompany = await companyService.createCompany(companyData, createdByUserId);
            sendSuccessResponse(res, 201, 'Company created successfully.', newCompany);
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    /**
     * Retrieves all companies accessible to the requesting user.
     * Accessible by Super Admin, Admin, and Auditor.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async getAllCompanies(req, res) {
        try {
            const requestingUserId = req.user.id;
            const requestingUserRole = req.user.role;
            const companies = await companyService.getAllCompanies(requestingUserId, requestingUserRole);
            sendSuccessResponse(res, 200, 'Companies retrieved successfully.', companies);
        } catch (error) {
            sendErrorResponse(res, 500, error.message);
        }
    }

    /**
     * Retrieves a single company by ID.
     * Accessible by Super Admin, Admin, and Auditor.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async getCompanyById(req, res) {
        try {
            const { id } = req.params;
            const requestingUserId = req.user.id;
            const requestingUserRole = req.user.role;
            const company = await companyService.getCompanyById(id, requestingUserId, requestingUserRole);
            sendSuccessResponse(res, 200, 'Company retrieved successfully.', company);
        } catch (error) {
            sendErrorResponse(res, 404, error.message);
        }
    }

    /**
     * Updates an existing company.
     * Accessible by Super Admin and Admin.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async updateCompany(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const requestingUserId = req.user.id;
            const requestingUserRole = req.user.role;
            const updatedCompany = await companyService.updateCompany(id, updates, requestingUserId, requestingUserRole);
            sendSuccessResponse(res, 200, 'Company updated successfully.', updatedCompany);
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    /**
     * Deletes a company permanently.
     * Accessible by Super Admin and Admin.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async deleteCompany(req, res) {
        try {
            const { id } = req.params;
            const requestingUserId = req.user.id; // Needed for admin/auditor check in service
            const requestingUserRole = req.user.role;
            await companyService.deleteCompany(id, requestingUserId, requestingUserRole);
            sendSuccessResponse(res, 200, 'Company deleted successfully.');
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }
}

export default new CompanyController();