// // src/models/question.model.js

// import mongoose from 'mongoose';
// import answerOptionSchema from './answerOption.model.js'; // Import the answer option schema

// // Schema for an individual audit question
// const questionSchema = new mongoose.Schema({
//     // The actual text of the audit question
//     text: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     // The type of answer expected (e.g., single_choice, multi_choice, text_input, file_upload, numeric)
//     type: {
//         type: String,
//         enum: ['single_choice', 'multi_choice', 'text_input', 'file_upload', 'numeric', 'date'],
//         required: true
//     },
//     // Array of possible answer options for 'single_choice' or 'multi_choice' questions
//     // Each option has a value and a description
//     answerOptions: {
//         type: [answerOptionSchema], // Embed the answerOptionSchema
//         default: [],
//         // Only required for specific question types
//         validate: {
//             validator: function(v) {
//                 return (this.type === 'single_choice' || this.type === 'multi_choice') ? v.length > 0 : true;
//             },
//             message: 'Answer options are required for single_choice or multi_choice questions.'
//         }
//     },
//     // Optional guidance text for the auditor when answering this question
//     guidance: {
//         type: String,
//         trim: true,
//         default: ''
//     },
//     // Does this question require a comment from the auditor?
//     commentEnabled: {
//         type: Boolean,
//         default: true
//     },
//     // Default state for the "include comment in report" flag for this question
//     includeCommentInReportDefault: {
//         type: Boolean,
//         default: false
//     },
//     // Optional: A numerical weight or maximum score for this question, for overall audit scoring
//     weight: {
//         type: Number,
//         default: 1 // Default weight of 1 if not specified
//     },
//     // Optional: Array of compliance tags (e.g., "ISO27001-A.5.1", "GDPR-Art.32")
//     complianceTags: {
//         type: [String],
//         default: []
//     }
// }, {
//     _id: true // Mongoose automatically adds _id to subdocuments, explicitly stating for clarity
// });

// // Note: This schema is intended to be embedded within other schemas (e.g., SubSection)
// // We don't export a model directly from this file.
// export default questionSchema;

// src/models/question.model.js

import mongoose from 'mongoose';
import answerOptionSchema from './answerOption.model.js';

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['single_choice', 'multi_choice', 'text_input', 'file_upload', 'numeric', 'date'],
        required: true
    },
    answerOptions: {
        type: [answerOptionSchema],
        default: [],
        validate: {
            validator: function(v) {
                return (this.type === 'single_choice' || this.type === 'multi_choice')
                    ? v.length > 0
                    : true;
            },
            message: 'Answer options are required for single_choice or multi_choice questions.'
        }
    },
    
    // ✅ New recommendation field for non-choice questions
    recommendation: {
        type: String,
        trim: true,
        default: ''
    },

    guidance: {
        type: String,
        trim: true,
        default: ''
    },
    commentEnabled: {
        type: Boolean,
        default: true
    },
    includeCommentInReportDefault: {
        type: Boolean,
        default: false
    },
    weight: {
        type: Number,
        default: 1
    },
    complianceTags: {
        type: [String],
        default: []
    }
}, {
    _id: true
});
