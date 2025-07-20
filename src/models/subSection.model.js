// src/models/subSection.model.js

import mongoose from 'mongoose';
import questionSchema from './question.model.js'; // Import the question schema

// Schema for a sub-section within an audit section
const subSectionSchema = new mongoose.Schema({
    // Name of the sub-section (e.g., "User Access Provisioning")
    name: {
        type: String,
        required: true,
        trim: true
    },
    // Optional description for the sub-section
    description: {
        type: String,
        trim: true,
        default: ''
    },
    // Order of the sub-section within its parent section
    order: {
        type: Number,
        required: true
    },
    // Array of questions belonging to this sub-section
    questions: {
        type: [questionSchema], // Embed the questionSchema
        default: []
    }
}, {
    _id: true // Mongoose automatically adds _id to subdocuments
});

// Note: This schema is intended to be embedded within other schemas (e.g., Section)
// We don't export a model directly from this file.
export default subSectionSchema;
