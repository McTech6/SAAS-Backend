// 

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
    infrastructure: {
        servers: {
            type: [String], // Array of server names/IPs
            default: []
        },
        virtualEnvironments: {
            type: [String], // Array of virtual environment names
            default: []
        },
        substitutes: {
            type: [String], // Array of substitute servers or backup systems
            default: []
        },
        totalServers: {
            type: Number, // Optional: Total number of servers
            default: 0
        },
        totalVirtualEnvironments: {
            type: Number, // Optional: Total number of virtual environments
            default: 0
        },
        totalSubstitutes: {
            type: Number, // Optional: Total number of substitute servers
            default: 0
        },
        notes: {
            type: String,
            trim: true
        },
        generalInfo: { // General optional information about the company
            type: String,
            trim: true
        }
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
    timestamps: true
});

const Company = mongoose.model('Company', companySchema);

export default Company;
