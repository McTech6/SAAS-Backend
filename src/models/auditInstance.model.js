// // src/models/auditInstance.model.js

// import mongoose from 'mongoose';
// import auditResponseSchema from './auditResponse.model.js'; // Import audit response schema
// import sectionSchema from './section.model.js'; // Import section schema (for template snapshot)

// // Main schema for an Audit Instance
// const auditInstanceSchema = new mongoose.Schema({
//     // Reference to the Company being audited
//     company: {
//         type: mongoose.Schema.ObjectId,
//         ref: 'Company',
//         required: true
//     },
//     // Reference to the AuditTemplate used to create this instance
//     template: {
//         type: mongoose.Schema.ObjectId,
//         ref: 'AuditTemplate',
//         required: true
//     },
//     // Snapshot of the template's name and version at the time of instance creation
//     templateNameSnapshot: {
//         type: String,
//         required: true
//     },
//     templateVersionSnapshot: {
//         type: String,
//         required: true
//     },
//     // FULL SNAPSHOT of the template's sections, subsections, and questions.
//     // This ensures the audit remains consistent even if the master template changes.
//     templateStructureSnapshot: {
//         type: [sectionSchema], // Embed the sectionSchema (which nests subSections and questions)
//         required: true,
//         default: []
//     },
//     // Users assigned to perform this specific audit instance
//     assignedAuditors: [{
//         type: mongoose.Schema.ObjectId,
//         ref: 'User'
//     }],
//     // Current status of the audit instance
//     status: {
//         type: String,
//         enum: ['Draft', 'In Progress', 'In Review', 'Completed', 'Archived'],
//         default: 'Draft'
//     },
//     // Scheduled start and end dates for the audit
//     startDate: {
//         type: Date,
//         default: Date.now
//     },
//     endDate: {
//         type: Date
//     },
//     // Actual date when the audit was marked as 'Completed'
//     actualCompletionDate: {
//         type: Date
//     },
//     // Overall calculated score for the audit (e.g., compliance percentage)
//     overallScore: {
//         type: Number,
//         default: 0
//     },
//     // Array of responses for each question in the audit instance
//     responses: {
//         type: [auditResponseSchema], // Embed the auditResponseSchema
//         default: []
//     },
//     // User who initiated/created this audit instance
//     createdBy: {
//         type: mongoose.Schema.ObjectId,
//         ref: 'User',
//         required: true
//     },
    
//     // User who last modified this audit instance
//     lastModifiedBy: {
//         type: mongoose.Schema.ObjectId,
//         ref: 'User'
//     }
// }, {
//     timestamps: true  
// });

// const AuditInstance = mongoose.model('AuditInstance', auditInstanceSchema);

// export default AuditInstance;


import mongoose from 'mongoose';
import auditResponseSchema from './auditResponse.model.js'; // existing
import sectionSchema from './section.model.js'; // existing

// Main schema for an Audit Instance
const auditInstanceSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  template: {
    type: mongoose.Schema.ObjectId,
    ref: 'AuditTemplate',
    required: true
  },
  templateNameSnapshot: {
    type: String,
    required: true
  },
  templateVersionSnapshot: {
    type: String,
    required: true
  },
  templateStructureSnapshot: {
    type: [sectionSchema],
    required: true,
    default: []
  },
  assignedAuditors: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['Draft', 'In Progress', 'In Review', 'Completed', 'Archived'],
    default: 'Draft'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  actualCompletionDate: {
    type: Date
  },
  overallScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  responses: {
    type: [auditResponseSchema],
    default: []
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },

  /**
   * NEW: Examination environment (audit-specific snapshot)
   * This stores the environment summary that the auditor records for the audit.
   */
  examinationEnvironment: {
    locations: { type: Number, default: 0 },
    employees: { type: Number, default: 0 },
    clients: {
      total: { type: Number, default: 0 },
      managed: { type: Number, default: 0 },
      unmanaged: { type: Number, default: 0 }
    },
    industry: { type: String, trim: true }, // e.g., Healthcare
    physicalServers: { type: Number, default: 0 },
    vmServers: { type: Number, default: 0 },
    firewalls: { type: Number, default: 0 },
    switches: { type: Number, default: 0 },
    mobileWorking: { type: Boolean, default: false },
    smartphones: { type: Boolean, default: false }
  },

  /**
   * NEW: Summaries provided by auditors
   * Each assigned auditor can add a short summary to be included in the report.
   */
  summaries: [{
    auditor: { type: mongoose.Schema.ObjectId, ref: 'User' },
    text: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes (helpful for queries)
auditInstanceSchema.index({ company: 1 });
auditInstanceSchema.index({ status: 1 });
auditInstanceSchema.index({ createdBy: 1 });

const AuditInstance = mongoose.model('AuditInstance', auditInstanceSchema);

export default AuditInstance;
