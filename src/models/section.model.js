// src/models/section.model.js

import mongoose from 'mongoose';
import subSectionSchema from './subSection.model.js'; // Import the sub-section schema

// Schema for a major section within an audit template
const sectionSchema = new mongoose.Schema({
    // Name of the section (e.g., "Information Security Policies")
    name: {
        type: String,
        required: true,
        trim: true
    },
    // Optional description for the section
    description: {
        type: String,
        trim: true,
        default: ''
    },
    // Order of the section within the audit template
    order: {
        type: Number,
        required: true
    },
    // Array of sub-sections belonging to this section
    subSections: {
        type: [subSectionSchema], // Embed the subSectionSchema
        default: []
    }
}, {
    _id: true // Mongoose automatically adds _id to subdocuments
});

// Note: This schema is intended to be embedded within AuditTemplate
// We don't export a model directly from this file.
export default sectionSchema;
