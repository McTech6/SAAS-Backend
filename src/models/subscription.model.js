// import mongoose from 'mongoose';

// const subscriptionSchema = new mongoose.Schema({
//     // Name of the subscription plan (e.g., Basic, Professional, Enterprise)
//     name: {
//         type: String,
//         enum: ['Basic', 'Professional', 'Enterprise'],
//         required: true,
//         unique: false // Multiple active subscriptions can exist, but only one per owner
//     },
//     // The maximum number of 'admin' users allowed under this subscription (excluding the owner)
//     maxAdmins: {
//         type: Number,
//         required: true,
//         min: 0
//     },
//     // The maximum number of 'auditor' users allowed under this subscription
//     maxAuditors: {
//         type: Number,
//         required: true,
//         min: 0
//     },
//     // Array of AuditTemplate IDs that users under this plan are allowed to access
//     templateAccess: {
//         type: [mongoose.Schema.ObjectId],
//         ref: 'AuditTemplate',
//         default: []
//     },
//     // Reference to the main 'admin' user who owns this subscription (the Tenant Admin).
//     ownerId: {
//         type: mongoose.Schema.ObjectId,
//         ref: 'User',
//         required: true,
//         unique: true // A subscription should only have one owner
//     },
//     // Status of the subscription
//     status: {
//         type: String,
//         enum: ['Active', 'Trial', 'Suspended', 'Expired'],
//         default: 'Active'
//     }
// }, {
//     timestamps: true 
// });

// const Subscription = mongoose.model('Subscription', subscriptionSchema);

// export default Subscription;


// import mongoose from 'mongoose';

// // Predefined plans with default maxAdmins and maxAuditors
// const predefinedPlans = {
//     Basic: { maxAdmins: 0, maxAuditors: 1 },
//     Professional: { maxAdmins: 0, maxAuditors: 5 },
//     Enterprise: { maxAdmins: null, maxAuditors: null } // Flexible, super admin can define
// };

// const subscriptionSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         enum: ['Basic', 'Professional', 'Enterprise'],
//         required: true
//     },
//     maxAdmins: {
//         type: Number,
//         min: 0
//     },
//     maxAuditors: {
//         type: Number,
//         min: 0
//     },
//     templateAccess: {
//         type: [mongoose.Schema.ObjectId],
//         ref: 'AuditTemplate',
//         default: []
//     },
//     ownerId: {
//         type: mongoose.Schema.ObjectId,
//         ref: 'User',
//         required: true,
//         unique: true
//     },
//     status: {
//         type: String,
//         enum: ['Active', 'Trial', 'Suspended', 'Expired'],
//         default: 'Active'
//     }
// }, {
//     timestamps: true
// });

// // Pre-save hook to assign default maxAdmins and maxAuditors based on plan
// subscriptionSchema.pre('save', function(next) {
//     const plan = predefinedPlans[this.name];
//     if (plan) {
//         if (this.maxAdmins === undefined || this.maxAdmins === null) {
//             this.maxAdmins = plan.maxAdmins;
//         }
//         if (this.maxAuditors === undefined || this.maxAuditors === null) {
//             this.maxAuditors = plan.maxAuditors;
//         }
//     }
//     next();
// });

// // Validation to ensure plan limits are respected for Basic and Professional
// subscriptionSchema.pre('save', function(next) {
//     const plan = predefinedPlans[this.name];
//     if (plan) {
//         if (plan.maxAdmins !== null && this.maxAdmins > plan.maxAdmins) {
//             return next(new Error(`Max admins for ${this.name} plan is ${plan.maxAdmins}`));
//         }
//         if (plan.maxAuditors !== null && this.maxAuditors > plan.maxAuditors) {
//             return next(new Error(`Max auditors for ${this.name} plan is ${plan.maxAuditors}`));
//         }
//     }
//     next();
// });

// const Subscription = mongoose.model('Subscription', subscriptionSchema);

// export default Subscription;



// import mongoose from 'mongoose';

// // Default plan rules
// const predefinedPlans = {
//     Basic: { maxAdmins: 0, maxAuditors: 1 },
//     Professional: { maxAdmins: 0, maxAuditors: 5 },
//     Enterprise: { maxAdmins: null, maxAuditors: null } // Enterprise is flexible
// };

// const subscriptionSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         enum: ['Basic', 'Professional', 'Enterprise'],
//         required: true
//     },
//     maxAdmins: {
//         type: Number,
//         min: 0
//     },
//     maxAuditors: {
//         type: Number,
//         min: 0
//     },
//     templateAccess: {
//         type: [mongoose.Schema.ObjectId],
//         ref: 'AuditTemplate',
//         default: []
//     },
//     ownerId: {
//         type: mongoose.Schema.ObjectId,
//         ref: 'User',
//         required: true,
//         unique: true // one subscription per tenant admin
//     },
//     status: {
//         type: String,
//         enum: ['Active', 'Trial', 'Suspended', 'Expired'],
//         default: 'Active'
//     }
// }, {
//     timestamps: true
// });


// /* ---------------------------------------------
//    FIX #1 – ASSIGN DEFAULTS ONLY FOR NON-ENTERPRISE
// ------------------------------------------------- */
// subscriptionSchema.pre('validate', function (next) {
//     const plan = predefinedPlans[this.name];

//     if (!plan) return next();

//     // BASIC & PROFESSIONAL → always use predefined defaults
//     if (this.name !== 'Enterprise') {
//         this.maxAdmins = plan.maxAdmins;
//         this.maxAuditors = plan.maxAuditors;
//     }

//     // ENTERPRISE → do NOT override manual values
//     if (this.name === 'Enterprise') {
//         if (this.maxAdmins === undefined || this.maxAdmins === null) {
//             this.maxAdmins = 0; // fallback sensible default
//         }
//         if (this.maxAuditors === undefined || this.maxAuditors === null) {
//             this.maxAuditors = 0; // fallback sensible default
//         }
//     }

//     next();
// });


// /* ---------------------------------------------
//    FIX #2 – VALIDATION FOR BASIC & PROFESSIONAL
// ------------------------------------------------- */
// subscriptionSchema.pre('validate', function (next) {
//     const plan = predefinedPlans[this.name];

//     if (!plan) return next();

//     if (this.name !== 'Enterprise') {
//         if (this.maxAdmins > plan.maxAdmins) {
//             return next(new Error(`Max admins for ${this.name} is ${plan.maxAdmins}`));
//         }
//         if (this.maxAuditors > plan.maxAuditors) {
//             return next(new Error(`Max auditors for ${this.name} is ${plan.maxAuditors}`));
//         }
//     }

//     next();
// });


// const Subscription = mongoose.model('Subscription', subscriptionSchema);
// export default Subscription;


import mongoose from 'mongoose';

const predefinedPlans = {
  Basic: { maxAdmins: 0, maxAuditors: 1, maxAuditInstances: 1 },
  Professional: { maxAdmins: 0, maxAuditors: 5, maxAuditInstances: 5 },
  // Enterprise has no fixed limits
  Enterprise: { maxAdmins: null, maxAuditors: null, maxAuditInstances: null } 
};

const subscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['Basic', 'Professional', 'Enterprise'],
    required: true
  },
  maxAdmins: { type: Number, min: 0 },
  maxAuditors: { type: Number, min: 0 },
  maxAuditInstances: { type: Number, min: 0 },
  templateAccess: [{
    type: mongoose.Schema.ObjectId,
    ref: 'AuditTemplate'
  }],
  ownerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true 
  },
  status: {
    type: String,
    enum: ['Active', 'Trial', 'Suspended', 'Expired'],
    default: 'Active'
  }
}, { timestamps: true });

/* Logic to assign defaults and enforce plan caps */
subscriptionSchema.pre('validate', function (next) {
  const plan = predefinedPlans[this.name];
  if (!plan) return next();

  if (this.name !== 'Enterprise') {
    this.maxAdmins = plan.maxAdmins;
    this.maxAuditors = plan.maxAuditors;
    this.maxAuditInstances = plan.maxAuditInstances;
  } else {
    // Enterprise defaults if not set
    if (this.maxAdmins == null) this.maxAdmins = 0;
    if (this.maxAuditors == null) this.maxAuditors = 0;
    if (this.maxAuditInstances == null) this.maxAuditInstances = 99999;
  }
  next();
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;