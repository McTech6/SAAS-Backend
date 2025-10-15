// // // src/controllers/company.controller.js
 
//  import companyService from '../services/company.service.js';
// import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

// class CompanyController {
//     async createCompany(req, res) {
//         try {
//             const newCompany = await companyService.createCompany(req.body, req.user.id);
//             sendSuccessResponse(res, 201, 'Company created successfully.', newCompany);
//         } catch (error) {
//             sendErrorResponse(res, 400, error.message);
//         }
//     }

//     async getAllCompanies(req, res) {
//         try {
//             const companies = await companyService.getAllCompanies(req.user.id, req.user.role);
//             sendSuccessResponse(res, 200, 'Companies retrieved successfully.', companies);
//         } catch (error) {
//             sendErrorResponse(res, 500, error.message);
//         }
//     }

//     async getCompanyById(req, res) {
//         try {
//             const company = await companyService.getCompanyById(req.params.id, req.user.id, req.user.role);
//             sendSuccessResponse(res, 200, 'Company retrieved successfully.', company);
//         } catch (error) {
//             sendErrorResponse(res, 404, error.message);
//         }
//     }

//     async updateCompany(req, res) {
//         try {
//             const updatedCompany = await companyService.updateCompany(req.params.id, req.body, req.user.id);
//             sendSuccessResponse(res, 200, 'Company updated successfully.', updatedCompany);
//         } catch (error) {
//             sendErrorResponse(res, 400, error.message);
//         }
//     }

//     async deleteCompany(req, res) {
//         try {
//             await companyService.deleteCompany(req.params.id, req.user.id);
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
import { getMessage, getLangFromReq } from '../utils/langHelper.js'; // <-- NEW/REQUIRED IMPORTS

class CompanyController {
    async createCompany(req, res) {
        const lang = getLangFromReq(req);
        try {
            // Service returns { newCompany, messageKey }
            const { newCompany, messageKey } = await companyService.createCompany(req.body, req.user.id);
            sendSuccessResponse(res, 201, getMessage(messageKey, lang), newCompany);
        } catch (error) {
            sendErrorResponse(res, 400, getMessage(error.message, lang));
        }
    }

    async getAllCompanies(req, res) {
        const lang = getLangFromReq(req); // <-- EXTRACT LANGUAGE
        try {
            // Pass lang down to service. Service returns { companies, messageKey }
            const { companies, messageKey } = await companyService.getAllCompanies(req.user.id, req.user.role, lang); // <-- PASS LANG
            sendSuccessResponse(res, 200, getMessage(messageKey, lang), companies);
        } catch (error) {
            sendErrorResponse(res, 500, getMessage(error.message, lang));
        }
    }

    async getCompanyById(req, res) {
        const lang = getLangFromReq(req); // <-- EXTRACT LANGUAGE
        try {
            // Pass lang down to service. Service returns { company, messageKey }
            const { company, messageKey } = await companyService.getCompanyById(req.params.id, req.user.id, req.user.role, lang); // <-- PASS LANG
            sendSuccessResponse(res, 200, getMessage(messageKey, lang), company);
        } catch (error) {
            // Note: Service throws 'COMPANY_NOT_FOUND' or 'UNAUTHORIZED...', which the message handler will localize.
            sendErrorResponse(res, 404, getMessage(error.message, lang));
        }
    }

    async updateCompany(req, res) {
        const lang = getLangFromReq(req);
        try {
            // Service returns { updatedCompany, messageKey }
            const { updatedCompany, messageKey } = await companyService.updateCompany(req.params.id, req.body, req.user.id);
            sendSuccessResponse(res, 200, getMessage(messageKey, lang), updatedCompany);
        } catch (error) {
            sendErrorResponse(res, 400, getMessage(error.message, lang));
        }
    }

    async deleteCompany(req, res) {
        const lang = getLangFromReq(req);
        try {
            // Service returns { messageKey }
            const { messageKey } = await companyService.deleteCompany(req.params.id, req.user.id);
            sendSuccessResponse(res, 200, getMessage(messageKey, lang));
        } catch (error) {
            sendErrorResponse(res, 400, getMessage(error.message, lang));
        }
    }
}

export default new CompanyController();