// // src/models/answerOption.model.js

// import mongoose from 'mongoose';

// // Schema for individual answer options within a question
// const answerOptionSchema = new mongoose.Schema({
//     // The actual value of the answer (e.g., "Compliant", "Yes", "N/A", "High")
//     value: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     // A detailed description or explanation of what selecting this answer means
//     description: {
//         type: String,
//         trim: true,
//         default: '' // Can be empty if no specific description is needed
//     },
//     // Optional: A numerical score associated with this answer, for automated scoring
//     score: {
//         type: Number,
//         default: 0
//     }
// }, {
//     _id: true // Mongoose automatically adds _id to subdocuments, explicitly stating for clarity
// });

// // Note: This schema is intended to be embedded within other schemas (e.g., Question)
// // We don't export a model directly from this file.
// export default answerOptionSchema;

// src/models/answerOption.model.js

import mongoose from 'mongoose';

// Schema for individual answer options within a question
const answerOptionSchema = new mongoose.Schema({
    // The actual value of the answer (e.g., "Compliant", "Yes", "N/A", "High")
    value: {
        type: String,
        required: true,
        trim: true
    },
    // A detailed description or explanation of what selecting this answer means
    description: {
        type: String,
        trim: true,
        default: '' // Can be empty if no specific description is needed
    },
    // NEW: Recommended action or note for this specific answer choice
    recommendation: {
        type: String,
        trim: true,
        default: ''
    },
    // Optional: A numerical score associated with this answer, for automated scoring
    score: {
        type: Number,
        default: 0
    }
}, {
    _id: true // Mongoose automatically adds _id to subdocuments, explicitly stating for clarity
});

// Note: This schema is intended to be embedded within other schemas (e.g., Question)
// We don't export a model directly from this file.
export default answerOptionSchema;