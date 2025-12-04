 

// // export default new CompanyService();import Company from '../models/company.model.js';
// import Company from '../models/company.model.js';
// import AuditInstance from '../models/auditInstance.model.js';
// import User from '../models/user.model.js';

// class CompanyService {
//     // async createCompany(companyData, createdByUserId) {
//     //     const newCompany = new Company({
//     //         ...companyData,
//     //         createdBy: createdByUserId,
//     //         lastModifiedBy: createdByUserId
//     //     });
//     //     await newCompany.save();
//     //     return newCompany;
//     // }

//     async createCompany(companyData, userId) {
//     console.log('[createCompany] START - Company data received:', JSON.stringify(companyData, null, 2));
    
//     try {
//         // Ensure all required fields are present
//         const companyToCreate = {
//             name: companyData.name,
//             industry: companyData.industry,
//             contactPerson: {
//                 name: companyData.contactPerson?.name || '',
//                 email: companyData.contactPerson?.email || '',
//                 phone: companyData.contactPerson?.phone || ''
//             },
//             createdBy: userId,
//             lastModifiedBy: userId
//         };

//         // Add examination environment if provided
//         if (companyData.examinationEnvironment) {
//             companyToCreate.examinationEnvironment = {
//                 locations: companyData.examinationEnvironment.locations || 0,
//                 employees: companyData.examinationEnvironment.employees || 0,
//                 clients: {
//                     total: companyData.examinationEnvironment.clients?.total || 0,
//                     managed: companyData.examinationEnvironment.clients?.managed || 0,
//                     unmanaged: companyData.examinationEnvironment.clients?.unmanaged || 0
//                 },
//                 industry: companyData.examinationEnvironment.industry || companyData.industry || '',
//                 physicalServers: companyData.examinationEnvironment.physicalServers || 0,
//                 vmServers: companyData.examinationEnvironment.vmServers || 0,
//                 firewalls: companyData.examinationEnvironment.firewalls || 0,
//                 switches: companyData.examinationEnvironment.switches || 0,
//                 mobileWorking: Boolean(companyData.examinationEnvironment.mobileWorking),
//                 smartphones: Boolean(companyData.examinationEnvironment.smartphones),
//                 notes: companyData.examinationEnvironment.notes || '',
//                 generalInfo: companyData.examinationEnvironment.generalInfo || companyData.generalInfo || ''
//             };
            
//             console.log('[createCompany] Added examination environment:', JSON.stringify(companyToCreate.examinationEnvironment, null, 2));
//         }

//         // Add general info if provided at top level
//         if (companyData.generalInfo) {
//             companyToCreate.generalInfo = companyData.generalInfo;
//         }

//         const newCompany = new Company(companyToCreate);
//         await newCompany.save();
        
//         console.log('[createCompany] SUCCESS - Company created with ID:', newCompany._id);
//         console.log('[createCompany] Company examination environment saved:', JSON.stringify(newCompany.examinationEnvironment, null, 2));
        
//         return newCompany;
//     } catch (error) {
//         console.error('[createCompany] ERROR:', error.message);
//         throw error;
//     }
// }

//     async getAllCompanies(requestingUserId, requestingUserRole) {
//         let query = {};

//         if (requestingUserRole === 'super_admin') query = {};
//         else if (requestingUserRole === 'admin') query = { createdBy: requestingUserId };
//         else if (requestingUserRole === 'auditor') {
//             const companyIds = await AuditInstance.find({ assignedAuditors: requestingUserId })
//                                                  .distinct('company');
//             query = { $or: [{ createdBy: requestingUserId }, { _id: { $in: companyIds } }] };
//         } else throw new Error('You are not authorized to view companies.');

//         return Company.find(query)
//             .populate('createdBy', 'firstName lastName email')
//             .populate('lastModifiedBy', 'firstName lastName email');  // works now
//     }

//     async getCompanyById(companyId, requestingUserId, requestingUserRole) {
//         const company = await Company.findById(companyId)
//             .populate('createdBy', 'firstName lastName email')
//             .populate('lastModifiedBy', 'firstName lastName email');

//         if (!company) throw new Error('Company not found.');
//         const isCreator = company.createdBy._id.equals(requestingUserId);

//         if (requestingUserRole === 'super_admin') return company;
//         if (requestingUserRole === 'admin') {
//             if (isCreator) return company;
//             const managedAuditors = await User.find({ managerId: requestingUserId, role: 'auditor' }).select('_id');
//             if (managedAuditors.map(a => a._id.toString()).includes(company.createdBy._id.toString())) return company;
//         }
//         if (requestingUserRole === 'auditor') {
//             if (isCreator) return company;
//             const isAssigned = await AuditInstance.exists({ company: companyId, assignedAuditors: requestingUserId });
//             if (isAssigned) return company;
//         }

//         throw new Error('You are not authorized to view this company.');
//     }

//     async updateCompany(companyId, updates, requestingUserId) {
//         const company = await Company.findById(companyId);
//         if (!company) throw new Error('Company not found.');
//         if (!company.createdBy.equals(requestingUserId)) throw new Error('You are not authorized to update this company.');

//         const updated = await Company.findByIdAndUpdate(
//             companyId,
//             { ...updates, lastModifiedBy: requestingUserId },
//             { new: true, runValidators: true }
//         )
//         .populate('createdBy', 'firstName lastName email')
//         .populate('lastModifiedBy', 'firstName lastName email');

//         return updated;
//     }

//     async deleteCompany(companyId, requestingUserId) {
//         const company = await Company.findById(companyId);
//         if (!company) throw new Error('Company not found.');
//         if (!company.createdBy.equals(requestingUserId)) throw new Error('You can only delete companies you created.');
//         await Company.findByIdAndDelete(companyId);
//         return true;
//     }
// }

// export default new CompanyService(); 


// src/services/company.service.js
import Company from '../models/company.model.js';
import AuditInstance from '../models/auditInstance.model.js';
import User from '../models/user.model.js';
import { translateCompany } from '../utils/dataTranslator.js'; // Import translator

class CompanyService {
    
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

    async getAllCompanies(requestingUserId, requestingUserRole, lang) { // Added 'lang'
        let query = {};

        if (requestingUserRole === 'super_admin') query = {};
        else if (requestingUserRole === 'admin') query = { createdBy: requestingUserId };
        else if (requestingUserRole === 'auditor') {
            const companyIds = await AuditInstance.find({ assignedAuditors: requestingUserId })
                                                 .distinct('company');
            query = { $or: [{ createdBy: requestingUserId }, { _id: { $in: companyIds } }] };
        } else throw new Error('You are not authorized to view companies.');

        const companies = await Company.find(query)
            .populate('createdBy', 'firstName lastName email')
            .populate('lastModifiedBy', 'firstName lastName email')
            .lean(); // Use .lean() to get plain JavaScript objects for translation

        // Translate each company's descriptive fields
        const translatedCompanies = await Promise.all(
            companies.map(company => translateCompany(company, lang))
        );

        return translatedCompanies; // Return translated array
    }

    async getCompanyById(companyId, requestingUserId, requestingUserRole, lang) { // Added 'lang'
        const company = await Company.findById(companyId)
            .populate('createdBy', 'firstName lastName email')
            .populate('lastModifiedBy', 'firstName lastName email')
            .lean(); // Use .lean() to get a plain JavaScript object for translation

        if (!company) throw new Error('Company not found.');
        const isCreator = company.createdBy._id.equals(requestingUserId);

        // Authorization Logic (Unchanged)
        if (requestingUserRole === 'super_admin') {
            return translateCompany(company, lang); // Translate before return
        }
        if (requestingUserRole === 'admin') {
            if (isCreator) {
                return translateCompany(company, lang); // Translate before return
            }
            const managedAuditors = await User.find({ managerId: requestingUserId, role: 'auditor' }).select('_id');
            if (managedAuditors.map(a => a._id.toString()).includes(company.createdBy._id.toString())) {
                return translateCompany(company, lang); // Translate before return
            }
        }
        if (requestingUserRole === 'auditor') {
            if (isCreator) {
                return translateCompany(company, lang); // Translate before return
            }
            const isAssigned = await AuditInstance.exists({ company: companyId, assignedAuditors: requestingUserId });
            if (isAssigned) {
                return translateCompany(company, lang); // Translate before return
            }
        }

        throw new Error('You are not authorized to view this company.');
    }

async updateCompany(companyId, updates, requestingUserId, requestingUserRole) {
        const company = await Company.findById(companyId);
        if (!company) throw new Error('Company not found.');
        
        // --- START OF REQUIRED CHANGE ---
        const isSuperAdmin = requestingUserRole === 'super_admin';
        const isCreator = company.createdBy.equals(requestingUserId);

        // Allow update if Super-Admin OR if the user is the original creator
        if (!isSuperAdmin && !isCreator) {
             throw new Error('You are not authorized to update this company.');
        }
        // --- END OF REQUIRED CHANGE ---

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