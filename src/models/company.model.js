// src/models/company.model.js

import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true // Company names should be unique
    },
    industry: {
        type: String,
        trim: true
    },
    contactPerson: {
        name: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid contact email address']
        },
        phone: {
            type: String,
            trim: true
        }
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        zipCode: { type: String, trim: true },
        country: { type: String, trim: true }
    },
    website: {
        type: String,
        trim: true,
        match: [/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/, 'Please enter a valid website URL']
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Onboarding', 'Archived'],
        default: 'Active'
    },
    // Reference to the user who created this company
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // Reference to the user who last modified this company
    lastModifiedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

const Company = mongoose.model('Company', companySchema);

export default Company;
