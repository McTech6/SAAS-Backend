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

 
// src/controllers/company.controller.js (REVISED to use MESSAGE KEYS)
 
import companyService from '../services/company.service.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { getLangFromReq } from '../utils/langHelper.js';

class CompanyController {
    async createCompany(req, res) {
        const lang = getLangFromReq(req);
        try {
            const newCompany = await companyService.createCompany(req.body, req.user.id);
            sendSuccessResponse(res, 201, 'COMPANY_CREATED', newCompany, lang); // Using Key
        } catch (error) {
            // Service throws raw strings like 'Company not found.', which langHelper maps/uses as fallback
            sendErrorResponse(res, 400, error.message, lang); 
        }
    }

    async getAllCompanies(req, res) {
        const lang = getLangFromReq(req);
        try {
            const companies = await companyService.getAllCompanies(req.user.id, req.user.role, lang);
            sendSuccessResponse(res, 200, 'COMPANIES_RETRIEVED', companies, lang); // Using Key
        } catch (error) {
            sendErrorResponse(res, 500, error.message, lang);
        }
    }

    async getCompanyById(req, res) {
        const lang = getLangFromReq(req);
        try {
            const company = await companyService.getCompanyById(req.params.id, req.user.id, req.user.role, lang);
            sendSuccessResponse(res, 200, 'COMPANY_RETRIEVED', company, lang); // Using Key
        } catch (error) {
            sendErrorResponse(res, 404, error.message, lang);
        }
    }

    async updateCompany(req, res) {
        const lang = getLangFromReq(req);
        try {
            const updatedCompany = await companyService.updateCompany(req.params.id, req.body, req.user.id);
            sendSuccessResponse(res, 200, 'COMPANY_UPDATED', updatedCompany, lang); // Using Key
        } catch (error) {
            sendErrorResponse(res, 400, error.message, lang);
        }
    }

    async deleteCompany(req, res) {
        const lang = getLangFromReq(req);
        try {
            await companyService.deleteCompany(req.params.id, req.user.id);
            sendSuccessResponse(res, 200, 'COMPANY_DELETED', null, lang); // Using Key
        } catch (error) {
            sendErrorResponse(res, 400, error.message, lang);
        }
    }
}

export default new CompanyController();