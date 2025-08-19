// src/services/company.service.js
import Company from '../models/company.model.js';
import AuditInstance from '../models/auditInstance.model.js';

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

    if (requestingUserRole === 'super_admin' || requestingUserRole === 'admin') {
      query = { createdBy: requestingUserId };
    } else if (requestingUserRole === 'auditor') {
      // Auditors: created by me OR any company that has an audit in which I’m assigned
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
   * Single company view:
   * – super_admin / admin → must be the creator
   * – auditor → must be the creator OR must have at least one assigned audit for this company
   */
  async getCompanyById(companyId, requestingUserId, requestingUserRole) {
    const company = await Company.findById(companyId)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!company) throw new Error('Company not found.');

    if (requestingUserRole === 'super_admin' || requestingUserRole === 'admin') {
      if (company.createdBy.toString() !== requestingUserId) {
        throw new Error('You are not authorized to view this company.');
      }
    } else if (requestingUserRole === 'auditor') {
      const isCreator = company.createdBy.toString() === requestingUserId;
      const hasAssignedAudit = await AuditInstance.countDocuments({
        company: companyId,
        assignedAuditors: requestingUserId
      });
      if (!isCreator && hasAssignedAudit === 0) {
        throw new Error('You are not authorized to view this company.');
      }
    } else {
      throw new Error('Unauthorized role to view this company.');
    }

    return company;
  }

  /**
   * Update company → only the creator may update
   */
  async updateCompany(companyId, updates, requestingUserId) {
    const company = await Company.findById(companyId);
    if (!company) throw new Error('Company not found.');
    if (company.createdBy.toString() !== requestingUserId) {
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
/**
 * Deletes a company permanently.
 * Only the user who created the company (creator) can delete it.
 * @param {string} companyId - The ID of the company to delete.
 * @param {string} requestingUserId - The ID of the user making the request.
 * @param {string} requestingUserRole - The role of the user making the request.
 * @returns {Promise<void>}
 * @throws {Error} If company not found or user is not the creator.
 */
async deleteCompany(companyId, requestingUserId, requestingUserRole) {
  console.log(`[DELETE COMPANY] START → companyId=${companyId} | userId=${requestingUserId} | role=${requestingUserRole}`);

  const company = await Company.findById(companyId);
  if (!company) {
    console.error(`[DELETE COMPANY] 404 → Company not found`);
    throw new Error('Company not found.');
  }

  console.log(`[DELETE COMPANY] FOUND → company.createdBy=${company.createdBy}`);

  if (company.createdBy.toString() !== requestingUserId) {
    console.warn(`[DELETE COMPANY] 403 → User ${requestingUserId} is NOT the creator`);
    throw new Error('You can only delete companies you created.');
  }

  console.log(`[DELETE COMPANY] ALLOWED → User ${requestingUserId} is creator`);

  await Company.findByIdAndDelete(companyId);
  console.log(`[DELETE COMPANY] SUCCESS → Company ${companyId} deleted`);
}
}

export default new CompanyService();