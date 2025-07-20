// src/models/auditTemplate.model.js

import mongoose from 'mongoose';
import sectionSchema from './section.model.js'; // Import the section schema

// Main schema for an Audit Template
const auditTemplateSchema = new mongoose.Schema({
    // Name of the audit template (e.g., "ISO 27001 Compliance Audit")
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true // Template names should be unique
    },
    // Optional description for the template
    description: {
        type: String,
        trim: true,
        default: ''
    },
    // Current version of the template (e.g., "1.0", "2.1")
    version: {
        type: String,
        required: true,
        trim: true,
        default: '1.0'
    },
    // Status of the template (e.g., Draft, Published, Archived)
    status: {
        type: String,
        enum: ['Draft', 'Published', 'Archived'],
        default: 'Draft'
    },
    // Array of sections that make up this audit template
    sections: {
        type: [sectionSchema], // Embed the sectionSchema
        default: []
    },
    // Reference to the user who created this template (Super Admin)
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // Reference to the user who last modified this template
    lastModifiedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

const AuditTemplate = mongoose.model('AuditTemplate', auditTemplateSchema);

export default AuditTemplate;
