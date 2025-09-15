// // src/models/auditResponse.model.js

// import mongoose from 'mongoose';
// import answerOptionSchema from './answerOption.model.js'; // Import answer option schema
// import questionSchema from './question.model.js'; // Import question schema (for snapshot)

// // Schema for an individual audit response to a question
// const auditResponseSchema = new mongoose.Schema({
//     // Reference to the original question from the template
//     // This is for linking back to the master template question if needed, but the snapshot is primary
//     questionId: {
//         type: mongoose.Schema.ObjectId,
//         ref: 'Question', // Refers to a question within an AuditTemplate's structure
//         required: true
//     },
//     // Snapshot of the question text at the time the audit instance was created
//     // This ensures consistency even if the master template question changes later
//     questionTextSnapshot: {
//         type: String,
//         required: true
//     },
//     // Snapshot of the question type (e.g., 'single_choice', 'text_input')
//     questionTypeSnapshot: {
//         type: String,
//         enum: ['single_choice', 'multi_choice', 'text_input', 'file_upload', 'numeric', 'date'],
//         required: true
//     },
//     // Snapshot of the answer options for choice-based questions
//     answerOptionsSnapshot: {
//         type: [answerOptionSchema],
//         default: []
//     },
//     // The value selected/entered by the auditor for this question
//     selectedValue: {
//         type: mongoose.Schema.Types.Mixed, // Can be String, Number, Boolean, Array (for multi_choice)
//         default: null
//     },
//     // The detailed comment provided by the auditor for this question
//     comment: {
//         type: String,
//         trim: true,
//         default: ''
//     },
//     // Flag indicating if the comment should be included in the final report
//     includeCommentInReport: {
//         type: Boolean,
//         default: false // Default to false, can be set by the auditor
//     },
//     // Array of URLs/paths to uploaded evidence files for this response (Future: dedicated File Management module)
//     evidenceUrls: {
//         type: [String],
//         default: []
//     },
//     // Optional: The score given for this specific response (e.g., if 'No' answer gets 0 points)
//     score: {
//         type: Number,
//         default: 0
//     },
//     // Reference to the user who provided this response
//     auditorId: {
//         type: mongoose.Schema.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     // Timestamp of when this response was last updated
//     lastUpdated: {
//         type: Date,
//         default: Date.now
//     }
// }, {
//     _id: true // Ensure subdocuments get their own _id
// });

// // Note: This schema is intended to be embedded within AuditInstance
// // We don't export a model directly from this file.
// export default auditResponseSchema;

// src/models/auditResponse.model.js

import mongoose from 'mongoose';
import answerOptionSchema from './answerOption.model.js'; // Import answer option schema
import questionSchema from './question.model.js'; // Import question schema (for snapshot)

// Schema for an individual audit response to a question
const auditResponseSchema = new mongoose.Schema({
    // Reference to the original question from the template
    // This is for linking back to the master template question if needed, but the snapshot is primary
    questionId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Question', // Refers to a question within an AuditTemplate's structure
        required: true
    },
    // Snapshot of the question text at the time the audit instance was created
    // This ensures consistency even if the master template question changes later
    questionTextSnapshot: {
        type: String,
        required: true
    },
    // Snapshot of the question type (e.g., 'single_choice', 'text_input')
    questionTypeSnapshot: {
        type: String,
        enum: ['single_choice', 'multi_choice', 'text_input', 'file_upload', 'numeric', 'date'],
        required: true
    },
    // Snapshot of the answer options for choice-based questions
    answerOptionsSnapshot: {
        type: [answerOptionSchema],
        default: []
    },
    // The value selected/entered by the auditor for this question
    selectedValue: {
        type: mongoose.Schema.Types.Mixed, // Can be String, Number, Boolean, Array (for multi_choice)
        default: null
    },
    // The detailed comment provided by the auditor for this question
    comment: {
        type: String,
        trim: true,
        default: ''
    },
    // NEW: Recommendation provided by the auditor for this question
    recommendation: {
        type: String,
        trim: true,
        default: ''
    },
    // Flag indicating if the comment should be included in the final report
    includeCommentInReport: {
        type: Boolean,
        default: false // Default to false, can be set by the auditor
    },
    // Array of URLs/paths to uploaded evidence files for this response (Future: dedicated File Management module)
    evidenceUrls: {
        type: [String],
        default: []
    },
    // Optional: The score given for this specific response (e.g., if 'No' answer gets 0 points)
    score: {
        type: Number,
        default: 0
    },
    // Reference to the user who provided this response
    auditorId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // Timestamp of when this response was last updated
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    _id: true // Ensure subdocuments get their own _id
});

// Note: This schema is intended to be embedded within the AuditInstance schema.
export default auditResponseSchema;