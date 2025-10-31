// src/models/subscription.model.js

import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    // Name of the subscription plan (e.g., Basic, Professional)
    name: {
        type: String,
        enum: ['Basic', 'Professional', 'Enterprise'],
        required: true,
        unique: true
    },
    // The maximum number of 'admin' users allowed under this subscription
    maxAdmins: {
        type: Number,
        required: true,
        min: 0
    },
    // The maximum number of 'auditor' users allowed under this subscription
    maxAuditors: {
        type: Number,
        required: true,
        min: 0
    },
    // Array of AuditTemplate IDs that users under this plan are allowed to access
    templateAccess: {
        type: [mongoose.Schema.ObjectId],
        ref: 'AuditTemplate',
        default: []
    },
    // Reference to the main 'admin' user who owns this subscription.
    ownerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true // A subscription should only have one owner
    },
    // Status of the subscription
    status: {
        type: String,
        enum: ['Active', 'Trial', 'Suspended', 'Expired'],
        default: 'Active'
    }
}, {
    timestamps: true 
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;