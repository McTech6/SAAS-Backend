 

// export default new CompanyService();import Company from '../models/company.model.js';
import Company from '../models/company.model.js';
import AuditInstance from '../models/auditInstance.model.js';
import User from '../models/user.model.js';

class CompanyService {
    // async createCompany(companyData, createdByUserId) {
    //     const newCompany = new Company({
    //         ...companyData,
    //         createdBy: createdByUserId,
    //         lastModifiedBy: createdByUserId
    //     });
    //     await newCompany.save();
    //     return newCompany;
    // }

    async createCompany(companyData, userId) {
    console.log('[createCompany] START - Company data received:', JSON.stringify(companyData, null, 2));
    
    try {
        // Ensure all required fields are present
        const companyToCreate = {
            name: companyData.name,
            industry: companyData.industry,
            contactPerson: {
                name: companyData.contactPerson?.name || '',
                email: companyData.contactPerson?.email || '',
                phone: companyData.contactPerson?.phone || ''
            },
            createdBy: userId,
            lastModifiedBy: userId
        };

        // Add examination environment if provided
        if (companyData.examinationEnvironment) {
            companyToCreate.examinationEnvironment = {
                locations: companyData.examinationEnvironment.locations || 0,
                employees: companyData.examinationEnvironment.employees || 0,
                clients: {
                    total: companyData.examinationEnvironment.clients?.total || 0,
                    managed: companyData.examinationEnvironment.clients?.managed || 0,
                    unmanaged: companyData.examinationEnvironment.clients?.unmanaged || 0
                },
                industry: companyData.examinationEnvironment.industry || companyData.industry || '',
                physicalServers: companyData.examinationEnvironment.physicalServers || 0,
                vmServers: companyData.examinationEnvironment.vmServers || 0,
                firewalls: companyData.examinationEnvironment.firewalls || 0,
                switches: companyData.examinationEnvironment.switches || 0,
                mobileWorking: Boolean(companyData.examinationEnvironment.mobileWorking),
                smartphones: Boolean(companyData.examinationEnvironment.smartphones),
                notes: companyData.examinationEnvironment.notes || '',
                generalInfo: companyData.examinationEnvironment.generalInfo || companyData.generalInfo || ''
            };
            
            console.log('[createCompany] Added examination environment:', JSON.stringify(companyToCreate.examinationEnvironment, null, 2));
        }

        // Add general info if provided at top level
        if (companyData.generalInfo) {
            companyToCreate.generalInfo = companyData.generalInfo;
        }

        const newCompany = new Company(companyToCreate);
        await newCompany.save();
        
        console.log('[createCompany] SUCCESS - Company created with ID:', newCompany._id);
        console.log('[createCompany] Company examination environment saved:', JSON.stringify(newCompany.examinationEnvironment, null, 2));
        
        return newCompany;
    } catch (error) {
        console.error('[createCompany] ERROR:', error.message);
        throw error;
    }
}

    async getAllCompanies(requestingUserId, requestingUserRole) {
        let query = {};

        if (requestingUserRole === 'super_admin') query = {};
        else if (requestingUserRole === 'admin') query = { createdBy: requestingUserId };
        else if (requestingUserRole === 'auditor') {
            const companyIds = await AuditInstance.find({ assignedAuditors: requestingUserId })
                                                 .distinct('company');
            query = { $or: [{ createdBy: requestingUserId }, { _id: { $in: companyIds } }] };
        } else throw new Error('You are not authorized to view companies.');

        return Company.find(query)
            .populate('createdBy', 'firstName lastName email')
            .populate('lastModifiedBy', 'firstName lastName email');  // works now
    }

    async getCompanyById(companyId, requestingUserId, requestingUserRole) {
        const company = await Company.findById(companyId)
            .populate('createdBy', 'firstName lastName email')
            .populate('lastModifiedBy', 'firstName lastName email');

        if (!company) throw new Error('Company not found.');
        const isCreator = company.createdBy._id.equals(requestingUserId);

        if (requestingUserRole === 'super_admin') return company;
        if (requestingUserRole === 'admin') {
            if (isCreator) return company;
            const managedAuditors = await User.find({ managerId: requestingUserId, role: 'auditor' }).select('_id');
            if (managedAuditors.map(a => a._id.toString()).includes(company.createdBy._id.toString())) return company;
        }
        if (requestingUserRole === 'auditor') {
            if (isCreator) return company;
            const isAssigned = await AuditInstance.exists({ company: companyId, assignedAuditors: requestingUserId });
            if (isAssigned) return company;
        }

        throw new Error('You are not authorized to view this company.');
    }

    async updateCompany(companyId, updates, requestingUserId) {
        const company = await Company.findById(companyId);
        if (!company) throw new Error('Company not found.');
        if (!company.createdBy.equals(requestingUserId)) throw new Error('You are not authorized to update this company.');

        const updated = await Company.findByIdAndUpdate(
            companyId,
            { ...updates, lastModifiedBy: requestingUserId },
            { new: true, runValidators: true }
        )
        .populate('createdBy', 'firstName lastName email')
        .populate('lastModifiedBy', 'firstName lastName email');

        return updated;
    }

    async deleteCompany(companyId, requestingUserId) {
        const company = await Company.findById(companyId);
        if (!company) throw new Error('Company not found.');
        if (!company.createdBy.equals(requestingUserId)) throw new Error('You can only delete companies you created.');
        await Company.findByIdAndDelete(companyId);
        return true;
    }
}

export default new CompanyService();

// // src/services/company.service.js
// import Company from '../models/company.model.js';
// import AuditInstance from '../models/auditInstance.model.js';
// import User from '../models/user.model.js';
// import { translateCompany } from '../utils/dataTranslator.js'; // <-- IMPORTED

// class CompanyService {
//     async createCompany(companyData, userId) {
//         // Check if company name already exists
//         const existingCompany = await Company.findOne({ name: companyData.name });
//         if (existingCompany) {
//             throw new Error('COMPANY_NAME_EXISTS'); // <-- RETURN MESSAGE KEY
//         }

//         const companyToCreate = {
//             name: companyData.name,
//             industry: companyData.industry,
//             contactPerson: {
//                 name: companyData.contactPerson?.name || '',
//                 email: companyData.contactPerson?.email || '',
//                 phone: companyData.contactPerson?.phone || ''
//             },
//             examinationEnvironment: companyData.examinationEnvironment,
//             createdBy: userId,
//             lastModifiedBy: userId
//         };

//         const newCompany = new Company(companyToCreate);
//         await newCompany.save();

//         return { newCompany, messageKey: 'COMPANY_CREATED' }; // <-- RETURN MESSAGE KEY
//     }

//     async getAllCompanies(requestingUserId, requestingUserRole, lang) { // <-- ACCEPTED LANG
//         let query = {};

//         if (requestingUserRole === 'super_admin') query = {};
//         else if (requestingUserRole === 'admin') query = { createdBy: requestingUserId };
//         else if (requestingUserRole === 'auditor') {
//             const companyIds = await AuditInstance.find({ assignedAuditors: requestingUserId })
//                 .distinct('company');
//             query = { $or: [{ createdBy: requestingUserId }, { _id: { $in: companyIds } }] };
//         } else {
//             throw new Error('UNAUTHORIZED_ROLE_COMPANY_VIEW'); // <-- RETURN MESSAGE KEY
//         }

//         const companies = await Company.find(query)
//             .populate('createdBy', 'firstName lastName email')
//             .populate('lastModifiedBy', 'firstName lastName email')
//             .lean();

//         // Translate descriptive fields for all companies concurrently
//         const translatedCompanies = await Promise.all(
//             companies.map(company => translateCompany(company, lang)) // <-- APPLY TRANSLATION
//         );
            
//         return { companies: translatedCompanies, messageKey: 'COMPANIES_RETRIEVED' }; // <-- RETURN MESSAGE KEY
//     }

//     async getCompanyById(companyId, requestingUserId, requestingUserRole, lang) { // <-- ACCEPTED LANG
//         const company = await Company.findById(companyId)
//             .populate('createdBy', 'firstName lastName email')
//             .populate('lastModifiedBy', 'firstName lastName email')
//             .lean();

//         if (!company) throw new Error('COMPANY_NOT_FOUND'); // <-- RETURN MESSAGE KEY
        
//         const isCreator = company.createdBy._id.equals(requestingUserId);

//         // Authorization checks (no change, just use message keys)
//         if (requestingUserRole === 'super_admin') {
//             const translatedCompany = await translateCompany(company, lang); // <-- APPLY TRANSLATION
//             return { company: translatedCompany, messageKey: 'COMPANY_RETRIEVED' }; // <-- RETURN MESSAGE KEY
//         }
        
//         if (requestingUserRole === 'admin') {
//             if (isCreator) {
//                 const translatedCompany = await translateCompany(company, lang); // <-- APPLY TRANSLATION
//                 return { company: translatedCompany, messageKey: 'COMPANY_RETRIEVED' };
//             }
//             const managedAuditors = await User.find({ managerId: requestingUserId, role: 'auditor' }).select('_id');
//             if (managedAuditors.map(a => a._id.toString()).includes(company.createdBy._id.toString())) {
//                 const translatedCompany = await translateCompany(company, lang); // <-- APPLY TRANSLATION
//                 return { company: translatedCompany, messageKey: 'COMPANY_RETRIEVED' };
//             }
//         }
        
//         if (requestingUserRole === 'auditor') {
//             if (isCreator) {
//                 const translatedCompany = await translateCompany(company, lang); // <-- APPLY TRANSLATION
//                 return { company: translatedCompany, messageKey: 'COMPANY_RETRIEVED' };
//             }
//             const isAssigned = await AuditInstance.exists({ company: companyId, assignedAuditors: requestingUserId });
//             if (isAssigned) {
//                 const translatedCompany = await translateCompany(company, lang); // <-- APPLY TRANSLATION
//                 return { company: translatedCompany, messageKey: 'COMPANY_RETRIEVED' };
//             }
//         }

//         throw new Error('UNAUTHORIZED_COMPANY_VIEW'); // <-- RETURN MESSAGE KEY
//     }

//     async updateCompany(companyId, updates, requestingUserId) {
//         const company = await Company.findById(companyId);
//         if (!company) throw new Error('COMPANY_NOT_FOUND'); // <-- RETURN MESSAGE KEY
//         if (!company.createdBy.equals(requestingUserId)) throw new Error('UNAUTHORIZED_COMPANY_UPDATE'); // <-- RETURN MESSAGE KEY

//         const updated = await Company.findByIdAndUpdate(
//             companyId,
//             { ...updates, lastModifiedBy: requestingUserId },
//             { new: true, runValidators: true }
//         )
//             .populate('createdBy', 'firstName lastName email')
//             .populate('lastModifiedBy', 'firstName lastName email');

//         return { updatedCompany: updated, messageKey: 'COMPANY_UPDATED' }; // <-- RETURN MESSAGE KEY
//     }

//     async deleteCompany(companyId, requestingUserId) {
//         const company = await Company.findById(companyId);
//         if (!company) throw new Error('COMPANY_NOT_FOUND'); // <-- RETURN MESSAGE KEY
//         if (!company.createdBy.equals(requestingUserId)) throw new Error('UNAUTHORIZED_COMPANY_DELETE'); // <-- RETURN MESSAGE KEY
        
//         await Company.findByIdAndDelete(companyId);
        
//         return { messageKey: 'COMPANY_DELETED' }; // <-- RETURN MESSAGE KEY
//     }
// }

// export default new CompanyService();