// src/services/company.service.js
import Company from '../models/company.model.js';
import AuditInstance from '../models/auditInstance.model.js';
import User from '../models/user.model.js'; // ✅ FIXED: missing import

class CompanyService {
  /**
   * Creates a new company.
   */
  async createCompany(companyData, createdByUserId) {
    const newCompany = new Company({
      ...companyData,
      createdBy: createdByUserId,
      lastModifiedBy: createdByUserId
    });
    await newCompany.save();
    return newCompany;
  }

  /**
   * List companies:
   * – super_admin / admin → only the ones they created
   * – auditor → the ones they created OR companies with audits assigned to them
   */
  async getAllCompanies(requestingUserId, requestingUserRole) {
    let query = {};

    if (['super_admin', 'admin'].includes(requestingUserRole)) {
      query = { createdBy: requestingUserId };
    } else if (requestingUserRole === 'auditor') {
      const companyIdsWithAssignedAudit = await AuditInstance.find(
        { assignedAuditors: requestingUserId }
      ).distinct('company');

      query = {
        $or: [
          { createdBy: requestingUserId },
          { _id: { $in: companyIdsWithAssignedAudit } }
        ]
      };
    } else {
      throw new Error('Unauthorized role to view companies.');
    }

    return Company.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');
  }

  /**
   * Single company view with access rules:
   * – super_admin / admin → companies they created OR created by auditors they manage
   * – auditor → companies they created OR are assigned audits for
   */
  async getCompanyById(companyId, requestingUserId, requestingUserRole) {
    const company = await Company.findById(companyId)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!company) {
      throw new Error('Company not found.');
    }

    const isCreator = company.createdBy._id.equals(requestingUserId);

    // Super Admin / Admin
    if (['super_admin', 'admin'].includes(requestingUserRole)) {
      if (isCreator) return company;

      // check if company creator is one of my managed auditors
      const managedAuditors = await User.find({
        managerId: requestingUserId,
        role: 'auditor'
      }).select('_id');

      const managedAuditorIds = managedAuditors.map(a => a._id.toString());
      if (managedAuditorIds.includes(company.createdBy._id.toString())) {
        return company;
      }
    }

    // Auditor
    if (requestingUserRole === 'auditor') {
      if (isCreator) return company;

      const isAssigned = await AuditInstance.exists({
        company: companyId,
        assignedAuditors: requestingUserId
      });

      if (isAssigned) return company;
    }

    throw new Error('You are not authorized to view this company.');
  }

  /**
   * Update company → only the creator may update
   */
  async updateCompany(companyId, updates, requestingUserId) {
    const company = await Company.findById(companyId);
    if (!company) throw new Error('Company not found.');
    if (!company.createdBy.equals(requestingUserId)) {
      throw new Error('You are not authorized to update this company.');
    }

    const updated = await Company.findByIdAndUpdate(
      companyId,
      { ...updates, lastModifiedBy: requestingUserId },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    return updated;
  }

  /**
   * Delete company → only the creator may delete
   */
  async deleteCompany(companyId, requestingUserId, requestingUserRole) {
    console.log(`[DELETE COMPANY] START → companyId=${companyId} | userId=${requestingUserId} | role=${requestingUserRole}`);

    const company = await Company.findById(companyId);
    if (!company) {
      console.error(`[DELETE COMPANY] 404 → Company not found`);
      throw new Error('Company not found.');
    }

    if (!company.createdBy.equals(requestingUserId)) {
      console.warn(`[DELETE COMPANY] 403 → User ${requestingUserId} is NOT the creator`);
      throw new Error('You can only delete companies you created.');
    }

    await Company.findByIdAndDelete(companyId);
    console.log(`[DELETE COMPANY] SUCCESS → Company ${companyId} deleted`);
  }
}

export default new CompanyService();
