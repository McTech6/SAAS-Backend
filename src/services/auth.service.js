 

// // src/services/auth.service.js

// import User from '../models/user.model.js';
// import generateOTP from '../utils/otpGenerator.js';
// import sendEmail from '../utils/emailSender.js';
// import { hashPassword, comparePassword } from '../utils/helpers.js';
// import authConfig from '../config/auth.config.js';
// import jwt from 'jsonwebtoken';
// import crypto from 'crypto';
// import { MESSAGES } from '../utils/messages.js'; 

// class AuthService {
//     async inviteUser(email, role, frontendRegisterUrl, managerId, lang) {
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             if (existingUser.isVerified) {
//                 throw new Error(MESSAGES.USER_EXISTS.EN); 
//             } else {
//                 throw new Error(MESSAGES.USER_ALREADY_INVITED.EN);
//             }
//         }
//         // ... (user creation and token generation)
//         const inviteToken = crypto.randomBytes(32).toString('hex');
//         const inviteTokenExpires = new Date(Date.now() + authConfig.inviteTokenExpiresInHours * 60 * 60 * 1000);
//         const user = new User({ email, role, inviteToken, inviteTokenExpires, isVerified: false, profileCompleted: false, managerId: managerId });
//         await user.save();
        
//         // Email content is in English (Source)
//         const registrationLink = `${frontendRegisterUrl}?token=${inviteToken}`;
//         const emailSubject = 'Invitation to SaaS Cybersecurity Audit Platform';
//         const emailText = `You have been invited to join the SaaS Cybersecurity Audit Platform. Please complete your registration using this link: ${registrationLink}`;
//         const emailHtml = `<p>You have been invited to join the SaaS Cybersecurity Audit Platform.</p><p>Please complete your registration by clicking the link below:</p><p><a href="${registrationLink}">Complete Registration</a></p><p>This link is valid for ${authConfig.inviteTokenExpiresInHours} hours.</p>`;

//         // Pass lang for translation
//         await sendEmail(email, emailSubject, emailText, emailHtml, lang);

//         const userObject = user.toObject();
//         delete userObject.inviteToken;
//         delete userObject.inviteTokenExpires;
        
//         return { user: userObject, messageKey: 'INVITE_SUCCESS' }; 
//     }

//     async completeRegistration(inviteToken, userData, lang) {
//         const user = await User.findOne({ inviteToken, inviteTokenExpires: { $gt: Date.now() } });

//         if (!user) {
//             throw new Error(MESSAGES.INVALID_INVITE_TOKEN.EN);
//         }
        
//         // ... (profile updates)
//         user.firstName = userData.firstName;
//         user.lastName = userData.lastName;
//         user.phoneNumber = userData.phoneNumber;
//         user.password = await hashPassword(userData.password);
//         user.profileCompleted = true;
//         user.inviteToken = undefined;
//         user.inviteTokenExpires = undefined;

//         const otp = generateOTP();
//         user.otp = otp;
//         user.otpExpires = new Date(Date.now() + authConfig.otpExpiresInMinutes * 60 * 1000);

//         await user.save();

//         // Email content is in English (Source)
//         const emailSubject = 'Verify Your Email - SaaS Cybersecurity Audit Platform';
//         const emailText = `Your OTP for email verification is: ${otp}. It is valid for ${authConfig.otpExpiresInMinutes} minutes.`;
//         const emailHtml = `<p>Your One-Time Password (OTP) for email verification is: <strong>${otp}</strong></p><p>This OTP is valid for ${authConfig.otpExpiresInMinutes} minutes.</p>`;

//         // Pass lang for translation
//         await sendEmail(user.email, emailSubject, emailText, emailHtml, lang);

//         return { user, messageKey: 'OTP_SENT' };
//     }

//     async verifyEmailOtp(email, otp) {
//         const user = await User.findOne({ email }).select('+otp +otpExpires');

//         if (!user) {
//             throw new Error(MESSAGES.USER_NOT_FOUND.EN);
//         }
//         if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
//             throw new Error(MESSAGES.INVALID_OTP.EN);
//         }

//         user.isVerified = true;
//         user.otp = undefined;
//         user.otpExpires = undefined;

//         await user.save();
//         return { messageKey: 'EMAIL_VERIFIED' };
//     }

//     async login(email, password, lang) {
//         const user = await User.findOne({ email }).select('+password +isVerified +otp +otpExpires');

//         if (!user) {
//             throw new Error(MESSAGES.INVALID_USER.EN);
//         }

//         const isPasswordMatch = await comparePassword(password, user.password);

//         if (!isPasswordMatch) {
//             throw new Error(MESSAGES.INVALID_USER.EN); 
//         }
//         if (!user.isVerified) {
//             throw new Error(MESSAGES.EMAIL_NOT_VERIFIED.EN);
//         }

//         const otp = generateOTP();
//         user.otp = otp;
//         user.otpExpires = new Date(Date.now() + authConfig.otpExpiresInMinutes * 60 * 1000);

//         await user.save();

//         // Email content is in English (Source)
//         const emailSubject = 'Login Verification OTP - SaaS Cybersecurity Audit Platform';
//         const emailText = `Your OTP for login verification is: ${otp}. It is valid for ${authConfig.otpExpiresInMinutes} minutes.`;
//         const emailHtml = `<p>Your One-Time Password (OTP) for login verification is: <strong>${otp}</strong></p><p>This OTP is valid for ${authConfig.otpExpiresInMinutes} minutes.</p>`;

//         // Pass lang for translation
//         await sendEmail(user.email, emailSubject, emailText, emailHtml, lang);

//         return { messageKey: 'OTP_SENT' };
//     }

//     async verifyLoginOtp(email, otp) {
//         const user = await User.findOne({ email }).select('+otp +otpExpires');

//         if (!user) {
//             throw new Error(MESSAGES.USER_NOT_FOUND.EN);
//         }
//         if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
//             throw new Error(MESSAGES.INVALID_OTP.EN);
//         }

//         user.otp = undefined;
//         user.otpExpires = undefined;
//         await user.save();

//         const token = jwt.sign(
//             { id: user._id, role: user.role },
//             authConfig.jwtSecret,
//             { expiresIn: authConfig.jwtExpiresIn }
//         );

//         return { token, messageKey: 'LOGIN_SUCCESS' };
//     }

//     async forgotPassword(email, frontendResetUrl, lang) {
//         const user = await User.findOne({ email });

//         if (!user) {
//             throw new Error(MESSAGES.USER_NOT_FOUND.EN);
//         }

//         const resetToken = user.getResetPasswordToken();
//         await user.save();

//         // Email content is in English (Source)
//         const resetUrl = `${frontendResetUrl}?token=${resetToken}`;
//         const emailSubject = 'Password Reset Request - SaaS Cybersecurity Audit Platform';
//         const emailText = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease use this link to reset your password: ${resetUrl}\n\nThis token is valid for 10 minutes.\nIf you did not request this, please ignore this email and your password will remain unchanged.`;
//         const emailHtml = `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p><p>Please click on the link below to reset your password:</p><p><a href="${resetUrl}">Reset Password</a></p><p>This link is valid for 10 minutes.</p><p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;

//         // Pass lang for translation
//         await sendEmail(user.email, emailSubject, emailText, emailHtml, lang);

//         return { messageKey: 'PASSWORD_RESET_EMAIL_SENT' };
//     }

//     async resetPassword(token, newPassword) {
//         const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//         const user = await User.findOne({
//             passwordResetToken: hashedToken,
//             passwordResetExpires: { $gt: Date.now() }
//         }).select('+passwordResetToken +passwordResetExpires +password');

//         if (!user) {
//             throw new Error(MESSAGES.INVALID_INVITE_TOKEN.EN); 
//         }

//         user.password = await hashPassword(newPassword);
//         user.profileCompleted = true;
//         user.passwordResetToken = undefined;
//         user.passwordResetExpires = undefined;

//         await user.save();
//         return { messageKey: 'PASSWORD_RESET_SUCCESS' };
//     }

//     async updateProfile(userId, updates) {
//         const user = await User.findById(userId).select('+password');

//         if (!user) {
//             throw new Error(MESSAGES.USER_NOT_FOUND.EN);
//         }

//         if (updates.firstName) user.firstName = updates.firstName;
//         if (updates.lastName) user.lastName = updates.lastName;
//         if (updates.phoneNumber) user.phoneNumber = updates.phoneNumber;

//         if (updates.newPassword) {
//             if (!updates.currentPassword) {
//                 throw new Error(MESSAGES.PASSWORD_REQUIRED.EN);
//             }
//             if (!(await comparePassword(updates.currentPassword, user.password))) {
//                 throw new Error(MESSAGES.INVALID_PASSWORD.EN);
//             }
//             user.password = await hashPassword(updates.newPassword);
//             user.profileCompleted = true;
//         }

//         await user.save();
        
//         // Sanitize
//         user.password = undefined;
//         user.otp = undefined;
//         user.otpExpires = undefined;
//         user.passwordResetToken = undefined;
//         user.passwordResetExpires = undefined;

//         return { user: user.toObject(), messageKey: 'PROFILE_UPDATED' };
//     }

//     async resendOtp(email, lang) {
//         const user = await User.findOne({ email }).select('+isVerified +otp +otpExpires');

//         if (!user) {
//             throw new Error(MESSAGES.USER_NOT_FOUND.EN);
//         }

//         let emailSubject;
        
//         if (!user.profileCompleted) {
//              throw new Error(MESSAGES.REGISTRATION_INCOMPLETE.EN);
//         } else if (!user.isVerified) {
//             emailSubject = 'Email Verification OTP Resent - SaaS Cybersecurity Audit Platform';
//         } else {
//             emailSubject = 'Login Verification OTP Resent - SaaS Cybersecurity Audit Platform';
//         }

//         const otp = generateOTP();
//         user.otp = otp;
//         user.otpExpires = new Date(Date.now() + authConfig.otpExpiresInMinutes * 60 * 1000);

//         await user.save();

//         const emailText = `Your new One-Time Password (OTP) is: ${otp}. It is valid for ${authConfig.otpExpiresInMinutes} minutes.`;
//         const emailHtml = `<p>Your new One-Time Password (OTP) is: <strong>${otp}</strong></p><p>This OTP is valid for ${authConfig.otpExpiresInMinutes} minutes.</p>`;

//         // Pass lang for translation
//         await sendEmail(user.email, emailSubject, emailText, emailHtml, lang);

//         return { messageKey: 'NEW_OTP_SENT' };
//     }
// }

// // export default new AuthService();
// import User from '../models/user.model.js';
// import Subscription from '../models/subscription.model.js'; // <-- NEW IMPORT
// import generateOTP from '../utils/otpGenerator.js';
// import sendEmail from '../utils/emailSender.js';
// import { hashPassword, comparePassword } from '../utils/helpers.js';
// import authConfig from '../config/auth.config.js';
// import jwt from 'jsonwebtoken';
// import crypto from 'crypto';
// import { MESSAGES } from '../utils/messages.js'; 
// import userService from './user.service.js';

// // Hardcoded dummy plans for Super Admin usage.
// const DEFAULT_PLANS = {
//     Basic: { maxAdmins: 1, maxAuditors: 5, templateAccess: ['tpl-basic-1', 'tpl-basic-2'] },
//     Professional: { maxAdmins: 3, maxAuditors: 20, templateAccess: ['tpl-basic-1', 'tpl-basic-2', 'tpl-pro-3', 'tpl-pro-4'] },
//     Enterprise: { maxAdmins: 10, maxAuditors: 100, templateAccess: [] } // [] means access to all public templates
// };

// class AuthService {
//     // maxManagedAdmins, maxManagedAuditors REMOVED from signature, planName ADDED
//     // async inviteUser(email, role, frontendRegisterUrl, inviterUser, planName, lang) {
//     //     const existingUser = await User.findOne({ email });
//     //     if (existingUser) {
//     //         if (existingUser.isVerified) {
//     //             throw new Error(MESSAGES.USER_EXISTS.EN); 
//     //         } else {
//     //             throw new Error(MESSAGES.USER_ALREADY_INVITED.EN);
//     //         }
//     //     }
        
//     //     const inviterRole = inviterUser.role;
//     //     const managerId = inviterUser.id;
        
//     //     // Prepare base user data
//     //     let userData = { 
//     //         email, 
//     //         role, 
//     //         inviteToken: crypto.randomBytes(32).toString('hex'),
//     //         inviteTokenExpires: new Date(Date.now() + authConfig.inviteTokenExpiresInHours * 60 * 60 * 1000), 
//     //         isVerified: false, 
//     //         profileCompleted: false, 
//     //         managerId: managerId 
//     //     };

//     //     // --- Subscription & Quota Logic ---
//     //     if (inviterRole === 'super_admin' && role === 'admin') {
//     //         // SCENARIO 1: Super Admin invites a new Tenant Admin -> Needs new Subscription
//     //         if (!planName || !DEFAULT_PLANS[planName]) {
//     //              throw new Error(MESSAGES.INVALID_PLAN_NAME.EN);
//     //         }

//     //         const planData = DEFAULT_PLANS[planName];
            
//     //         // Create the new user first to get the Owner ID
//     //         const tempUser = new User(userData);
//     //         const newUser = await tempUser.save();
            
//     //         // Create the new Subscription instance
//     //         const newSubscription = new Subscription({
//     //             name: planName,
//     //             maxAdmins: planData.maxAdmins,
//     //             maxAuditors: planData.maxAuditors,
//     //             templateAccess: planData.templateAccess,
//     //             ownerId: newUser._id
//     //         });
//     //         await newSubscription.save();

//     //         // Update the user with their own subscription details
//     //         newUser.subscriptionId = newSubscription._id;
//     //         newUser.tenantAdminId = newUser._id;
//     //         await newUser.save();
            
//     //         const userObject = newUser.toObject();
//     //         delete userObject.inviteToken;
//     //         delete userObject.inviteTokenExpires;
//     //         return { user: userObject, messageKey: 'INVITE_SUCCESS' };

//     //     } else if (inviterRole === 'admin') {
//     //         // SCENARIO 2: Admin invites a sub-user (Admin or Auditor) -> Checks quota on existing Subscription
//     //         const subId = inviterUser.subscriptionId;
//     //         const tenantAdminId = inviterUser.tenantAdminId || inviterUser.id; // Fallback to inviter ID if missing

//     //         if (!subId) {
//     //             throw new Error(MESSAGES.ADMIN_MISSING_SUBSCRIPTION.EN);
//     //         }
            
//     //         // Quota Check
//     //         const { count, maxLimit } = await userService.checkSubscriptionQuota(tenantAdminId, role, subId);

//     //         if (count >= maxLimit) {
//     //             const messageKey = role === 'admin' ? 'MAX_ADMIN_LIMIT_REACHED' : 'MAX_AUDITOR_LIMIT_REACHED';
//     //             throw new Error(MESSAGES[messageKey].EN);
//     //         }

//     //         // Link the new user to the existing subscription
//     //         userData.subscriptionId = subId;
//     //         userData.tenantAdminId = tenantAdminId;
//     //     } else {
//     //         // SCENARIO 3: Super Admin invites non-Admin (e.g., Auditor/Super Admin) -> No subscription linkage
//     //         userData.subscriptionId = undefined;
//     //         userData.tenantAdminId = undefined;
//     //     }
        
//     //     // --- User Creation (for Scenarios 2 and 3) ---
//     //     const user = new User(userData);
//     //     await user.save();
        
//     //     // Email content is in English (Source)
//     //     const registrationLink = `${frontendRegisterUrl}?token=${userData.inviteToken}`;
//     //     const emailSubject = 'Invitation to SaaS Cybersecurity Audit Platform';
//     //     const emailText = `You have been invited to join the SaaS Cybersecurity Audit Platform. Please complete your registration using this link: ${registrationLink}`;
//     //     const emailHtml = `<p>You have been invited to join the SaaS Cybersecurity Audit Platform.</p><p>Please complete your registration by clicking the link below:</p><p><a href="${registrationLink}">Complete Registration</a></p><p>This link is valid for ${authConfig.inviteTokenExpiresInHours} hours.</p>`;

//     //     // Pass lang for translation
//     //     await sendEmail(email, emailSubject, emailText, emailHtml, lang);

//     //     const userObject = user.toObject();
//     //     delete userObject.inviteToken;
//     //     delete userObject.inviteTokenExpires;
        
//     //     return { user: userObject, messageKey: 'INVITE_SUCCESS' }; 
//     // }

//      async inviteUser(email, role, frontendRegisterUrl, inviterUser, planDetails = {}, lang) {
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             if (existingUser.isVerified) {
//                 throw new Error(MESSAGES.USER_EXISTS.EN);
//             } else {
//                 throw new Error(MESSAGES.USER_ALREADY_INVITED.EN);
//             }
//         }

//         const inviterRole = inviterUser.role;
//         const managerId = inviterUser.id;

//         let userData = {
//             email,
//             role,
//             inviteToken: crypto.randomBytes(32).toString('hex'),
//             inviteTokenExpires: new Date(Date.now() + authConfig.inviteTokenExpiresInHours * 60 * 60 * 1000),
//             isVerified: false,
//             profileCompleted: false,
//             managerId: managerId
//         };

//         // Super Admin inviting Tenant Admin -> Custom plan creation
//         if (inviterRole === 'super_admin' && role === 'admin') {
//             const { planName, maxAdmins, maxAuditors, templateAccess } = planDetails;

//             if (!planName) {
//                 throw new Error(MESSAGES.INVALID_PLAN_NAME.EN);
//             }

//             // Create user first
//             const tempUser = new User(userData);
//             const newUser = await tempUser.save();

//             const newSubscription = new Subscription({
//                 name: planName,
//                 maxAdmins: maxAdmins ?? 1,
//                 maxAuditors: maxAuditors ?? 5,
//                 templateAccess: templateAccess ?? [],
//                 ownerId: newUser._id
//             });
//             await newSubscription.save();

//             newUser.subscriptionId = newSubscription._id;
//             newUser.tenantAdminId = newUser._id;
//             await newUser.save();

//             const userObject = newUser.toObject();
//             delete userObject.inviteToken;
//             delete userObject.inviteTokenExpires;
//             return { user: userObject, messageKey: 'INVITE_SUCCESS' };

//         } else if (inviterRole === 'admin') {
//             // Admin inviting sub-user -> check quota
//             const subId = inviterUser.subscriptionId;
//             const tenantAdminId = inviterUser.tenantAdminId || inviterUser.id;

//             if (!subId) throw new Error(MESSAGES.ADMIN_MISSING_SUBSCRIPTION.EN);

//             const { count, maxLimit } = await userService.checkSubscriptionQuota(tenantAdminId, role, subId);

//             if (count >= maxLimit) {
//                 const messageKey = role === 'admin' ? 'MAX_ADMIN_LIMIT_REACHED' : 'MAX_AUDITOR_LIMIT_REACHED';
//                 throw new Error(MESSAGES[messageKey].EN);
//             }

//             userData.subscriptionId = subId;
//             userData.tenantAdminId = tenantAdminId;
//         } else {
//             // Non-admin invites
//             userData.subscriptionId = undefined;
//             userData.tenantAdminId = undefined;
//         }

//         // Create user
//         const user = new User(userData);
//         await user.save();

//         const registrationLink = `${frontendRegisterUrl}?token=${userData.inviteToken}`;
//         const emailSubject = 'Invitation to ISARION  Platform';
//         const emailText = `You have been invited. Complete registration: ${registrationLink}`;
//         const emailHtml = `<p>You have been invited.</p><p><a href="${registrationLink}">Complete Registration</a></p>`;

//         await sendEmail(email, emailSubject, emailText, emailHtml, lang);

//         const userObject = user.toObject();
//         delete userObject.inviteToken;
//         delete userObject.inviteTokenExpires;

//         return { user: userObject, messageKey: 'INVITE_SUCCESS' };
//     }

//     async completeRegistration(inviteToken, userData, lang) {
//         const user = await User.findOne({ inviteToken, inviteTokenExpires: { $gt: Date.now() } });

//         if (!user) {
//             throw new Error(MESSAGES.INVALID_INVITE_TOKEN.EN);
//         }
        
//         // ... (profile updates)
//         user.firstName = userData.firstName;
//         user.lastName = userData.lastName;
//         user.phoneNumber = userData.phoneNumber;
//         user.password = await hashPassword(userData.password);
//         user.profileCompleted = true;
//         user.inviteToken = undefined;
//         user.inviteTokenExpires = undefined;

//         const otp = generateOTP();
//         user.otp = otp;
//         user.otpExpires = new Date(Date.now() + authConfig.otpExpiresInMinutes * 60 * 1000);

//         await user.save();

//         // Email content is in English (Source)
//         const emailSubject = 'Verify Your Email - ISARION Platform';
//         const emailText = `Your OTP for email verification is: ${otp}. It is valid for ${authConfig.otpExpiresInMinutes} minutes.`;
//         const emailHtml = `<p>Your One-Time Password (OTP) for email verification is: <strong>${otp}</strong></p><p>This OTP is valid for ${authConfig.otpExpiresInMinutes} minutes.</p>`;

//         // Pass lang for translation
//         await sendEmail(user.email, emailSubject, emailText, emailHtml, lang);

//         return { user, messageKey: 'OTP_SENT' };
//     }

//     async verifyEmailOtp(email, otp) {
//         const user = await User.findOne({ email }).select('+otp +otpExpires');

//         if (!user) {
//             throw new Error(MESSAGES.USER_NOT_FOUND.EN);
//         }
//         if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
//             throw new Error(MESSAGES.INVALID_OTP.EN);
//         }

//         user.isVerified = true;
//         user.otp = undefined;
//         user.otpExpires = undefined;

//         await user.save();
//         return { messageKey: 'EMAIL_VERIFIED' };
//     }

//     async login(email, password, lang) {
//         const user = await User.findOne({ email }).select('+password +isVerified +otp +otpExpires');

//         if (!user) {
//             throw new Error(MESSAGES.INVALID_USER.EN);
//         }

//         const isPasswordMatch = await comparePassword(password, user.password);

//         if (!isPasswordMatch) {
//             throw new Error(MESSAGES.INVALID_USER.EN); 
//         }
//         if (!user.isVerified) {
//             throw new Error(MESSAGES.EMAIL_NOT_VERIFIED.EN);
//         }

//         const otp = generateOTP();
//         user.otp = otp;
//         user.otpExpires = new Date(Date.now() + authConfig.otpExpiresInMinutes * 60 * 1000);

//         await user.save();

//         // Email content is in English (Source)
//         const emailSubject = 'Login Verification OTP - ISARION Platform';
//         const emailText = `Your OTP for login verification is: ${otp}. It is valid for ${authConfig.otpExpiresInMinutes} minutes.`;
//         const emailHtml = `<p>Your One-Time Password (OTP) for login verification is: <strong>${otp}</strong></p><p>This OTP is valid for ${authConfig.otpExpiresInMinutes} minutes.</p>`;

//         // Pass lang for translation
//         await sendEmail(user.email, emailSubject, emailText, emailHtml, lang);

//         return { messageKey: 'OTP_SENT' };
//     }

//     async verifyLoginOtp(email, otp) {
//         const user = await User.findOne({ email }).select('+otp +otpExpires');

//         if (!user) {
//             throw new Error(MESSAGES.USER_NOT_FOUND.EN);
//         }
//         if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
//             throw new Error(MESSAGES.INVALID_OTP.EN);
//         }

//         user.otp = undefined;
//         user.otpExpires = undefined;
//         await user.save();

//         const token = jwt.sign(
//             { id: user._id, role: user.role, subscriptionId: user.subscriptionId, tenantAdminId: user.tenantAdminId }, // Added subscription details to token
//             authConfig.jwtSecret,
//             { expiresIn: authConfig.jwtExpiresIn }
//         );

//         return { token, messageKey: 'LOGIN_SUCCESS' };
//     }

//     async forgotPassword(email, frontendResetUrl, lang) {
//         const user = await User.findOne({ email });

//         if (!user) {
//             throw new Error(MESSAGES.USER_NOT_FOUND.EN);
//         }

//         // NOTE: getResetPasswordToken must be defined on the User model
//         const resetToken = user.getResetPasswordToken(); 
//         await user.save();

//         // Email content is in English (Source)
//         const resetUrl = `${frontendResetUrl}?token=${resetToken}`;
//         const emailSubject = 'Password Reset Request - ISARION Platform';
//         const emailText = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease use this link to reset your password: ${resetUrl}\n\nThis token is valid for 10 minutes.\nIf you did not request this, please ignore this email and your password will remain unchanged.`;
//         const emailHtml = `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p><p>Please click on the link below to reset your password:</p><p><a href="${resetUrl}">Reset Password</a></p><p>This link is valid for 10 minutes.</p><p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;

//         // Pass lang for translation
//         await sendEmail(user.email, emailSubject, emailText, emailHtml, lang);

//         return { messageKey: 'PASSWORD_RESET_EMAIL_SENT' };
//     }

//     async resetPassword(token, newPassword) {
//         const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//         const user = await User.findOne({
//             passwordResetToken: hashedToken,
//             passwordResetExpires: { $gt: Date.now() }
//         }).select('+passwordResetToken +passwordResetExpires +password');

//         if (!user) {
//             throw new Error(MESSAGES.INVALID_INVITE_TOKEN.EN); 
//         }

//         user.password = await hashPassword(newPassword);
//         user.profileCompleted = true;
//         user.passwordResetToken = undefined;
//         user.passwordResetExpires = undefined;

//         await user.save();
//         return { messageKey: 'PASSWORD_RESET_SUCCESS' };
//     }

//     async updateProfile(userId, updates) {
//         const user = await User.findById(userId).select('+password');

//         if (!user) {
//             throw new Error(MESSAGES.USER_NOT_FOUND.EN);
//         }

//         if (updates.firstName) user.firstName = updates.firstName;
//         if (updates.lastName) user.lastName = updates.lastName;
//         if (updates.phoneNumber) user.phoneNumber = updates.phoneNumber;

//         if (updates.newPassword) {
//             if (!updates.currentPassword) {
//                 throw new Error(MESSAGES.PASSWORD_REQUIRED.EN);
//             }
//             if (!(await comparePassword(updates.currentPassword, user.password))) {
//                 throw new Error(MESSAGES.INVALID_PASSWORD.EN);
//             }
//             user.password = await hashPassword(updates.newPassword);
//             user.profileCompleted = true;
//         }

//         await user.save();
        
//         // Sanitize
//         user.password = undefined;
//         user.otp = undefined;
//         user.otpExpires = undefined;
//         user.passwordResetToken = undefined;
//         user.passwordResetExpires = undefined;

//         return { user: user.toObject(), messageKey: 'PROFILE_UPDATED' };
//     }

//     async resendOtp(email, lang) {
//         const user = await User.findOne({ email }).select('+isVerified +otp +otpExpires +profileCompleted');

//         if (!user) {
//             throw new Error(MESSAGES.USER_NOT_FOUND.EN);
//         }

//         let emailSubject;
        
//         if (!user.profileCompleted) {
//              throw new Error(MESSAGES.REGISTRATION_INCOMPLETE.EN);
//         } else if (!user.isVerified) {
//             emailSubject = 'Email Verification OTP Resent - ISARION Platform';
//         } else {
//             emailSubject = 'Login Verification OTP Resent - ISARION Platform';
//         }

//         const otp = generateOTP();
//         user.otp = otp;
//         user.otpExpires = new Date(Date.now() + authConfig.otpExpiresInMinutes * 60 * 1000);

//         await user.save();

//         const emailText = `Your new One-Time Password (OTP) is: ${otp}. It is valid for ${authConfig.otpExpiresInMinutes} minutes.`;
//         const emailHtml = `<p>Your new One-Time Password (OTP) is: <strong>${otp}</strong></p><p>This OTP is valid for ${authConfig.otpExpiresInMinutes} minutes.</p>`;

//         // Pass lang for translation
//         await sendEmail(user.email, emailSubject, emailText, emailHtml, lang);

//         return { messageKey: 'NEW_OTP_SENT' };
//     }
// }

// export default new AuthService();


// // src/services/auth.service.js
// import User from '../models/user.model.js';
// import Subscription from '../models/subscription.model.js';
// import generateOTP from '../utils/otpGenerator.js';
// import sendEmail from '../utils/emailSender.js';
// import { hashPassword, comparePassword } from '../utils/helpers.js';
// import authConfig from '../config/auth.config.js';
// import jwt from 'jsonwebtoken';
// import crypto from 'crypto';
// import { MESSAGES } from '../utils/messages.js';
// import userService from './user.service.js';

// // Default plan configurations
// const DEFAULT_PLANS = {
//     Basic: { maxAdmins: 1, maxAuditors: 5, templateAccess: ['tpl-basic-1', 'tpl-basic-2'] },
//     Professional: { maxAdmins: 3, maxAuditors: 20, templateAccess: ['tpl-basic-1', 'tpl-basic-2', 'tpl-pro-3', 'tpl-pro-4'] },
//     Enterprise: { maxAdmins: 10, maxAuditors: 100, templateAccess: [] } // empty = access all public templates
// };

// class AuthService {

//     // --- INVITE USER ---
//     async inviteUser(email, role, frontendRegisterUrl, inviterUser, planDetails = {}, lang = 'EN') {
//         console.log(`[INVITE] Starting invite for ${email}, role: ${role}, inviterRole: ${inviterUser.role}`);

//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             console.log(`[INVITE] User already exists or invited: ${existingUser.email}`);
//             if (existingUser.isVerified) throw new Error(MESSAGES.USER_EXISTS[lang]);
//             else throw new Error(MESSAGES.USER_ALREADY_INVITED[lang]);
//         }

//         const inviterRole = inviterUser.role;
//         const managerId = inviterUser.id;

//         let userData = {
//             email,
//             role,
//             inviteToken: crypto.randomBytes(32).toString('hex'),
//             inviteTokenExpires: new Date(Date.now() + authConfig.inviteTokenExpiresInHours * 60 * 60 * 1000),
//             isVerified: false,
//             profileCompleted: false,
//             managerId
//         };

//         console.log(`[INVITE] User data prepared:`, userData);

//         // Super Admin inviting Admin -> create subscription
//         if (inviterRole === 'super_admin' && role === 'admin') {
//             console.log(`[INVITE] Super Admin scenario detected`);
//             const { planName, maxAdmins, maxAuditors, templateAccess } = planDetails;

//             if (!planName) {
//                 console.error(`[INVITE] Missing planName`);
//                 throw new Error(MESSAGES.INVALID_PLAN_NAME[lang]);
//             }

//             if (!DEFAULT_PLANS[planName]) {
//                 console.error(`[INVITE] Invalid planName provided: ${planName}`);
//                 throw new Error(MESSAGES.INVALID_PLAN_NAME[lang]);
//             }

//             console.log(`[INVITE] Plan validation passed: ${planName}`);

//             // Create user first
//             const tempUser = new User(userData);
//             const newUser = await tempUser.save();
//             console.log(`[INVITE] User created with ID: ${newUser._id}`);

//             const planData = DEFAULT_PLANS[planName];

//             const newSubscription = new Subscription({
//                 name: planName,
//                 maxAdmins: maxAdmins ?? planData.maxAdmins,
//                 maxAuditors: maxAuditors ?? planData.maxAuditors,
//                 templateAccess: templateAccess ?? planData.templateAccess,
//                 ownerId: newUser._id
//             });

//             console.log(`[INVITE] Subscription object:`, newSubscription);

//             await newSubscription.save();
//             console.log(`[INVITE] Subscription saved with ID: ${newSubscription._id}`);

//             newUser.subscriptionId = newSubscription._id;
//             newUser.tenantAdminId = newUser._id;
//             await newUser.save();

//             const userObject = newUser.toObject();
//             delete userObject.inviteToken;
//             delete userObject.inviteTokenExpires;

//             console.log(`[INVITE] Invite complete for Super Admin scenario`);
//             return { user: userObject, messageKey: 'INVITE_SUCCESS' };
//         } 

//         // Admin inviting sub-user -> check quota
//         else if (inviterRole === 'admin') {
//             console.log(`[INVITE] Admin scenario detected`);
//             const subId = inviterUser.subscriptionId;
//             const tenantAdminId = inviterUser.tenantAdminId || inviterUser.id;

//             if (!subId) {
//                 console.error(`[INVITE] Admin missing subscription`);
//                 throw new Error(MESSAGES.ADMIN_MISSING_SUBSCRIPTION[lang]);
//             }

//             const { count, maxLimit } = await userService.checkSubscriptionQuota(tenantAdminId, role, subId);
//             console.log(`[INVITE] Subscription quota: count=${count}, maxLimit=${maxLimit}`);

//             if (count >= maxLimit) {
//                 const messageKey = role === 'admin' ? 'MAX_ADMIN_LIMIT_REACHED' : 'MAX_AUDITOR_LIMIT_REACHED';
//                 console.error(`[INVITE] Max quota reached for role: ${role}`);
//                 throw new Error(MESSAGES[messageKey][lang]);
//             }

//             userData.subscriptionId = subId;
//             userData.tenantAdminId = tenantAdminId;
//         } else {
//             // Non-admin invites
//             console.log(`[INVITE] Non-admin scenario`);
//             userData.subscriptionId = undefined;
//             userData.tenantAdminId = undefined;
//         }

//         // Create user
//         const user = new User(userData);
//         await user.save();
//         console.log(`[INVITE] User created with ID: ${user._id}`);

//         const registrationLink = `${frontendRegisterUrl}?token=${userData.inviteToken}`;
//         const emailSubject = 'Invitation to ISARION Platform';
//         const emailText = `You have been invited. Complete registration: ${registrationLink}`;
//         const emailHtml = `<p>You have been invited.</p><p><a href="${registrationLink}">Complete Registration</a></p>`;

//         await sendEmail(email, emailSubject, emailText, emailHtml, lang);
//         console.log(`[INVITE] Invitation email sent to ${email}`);

//         const userObject = user.toObject();
//         delete userObject.inviteToken;
//         delete userObject.inviteTokenExpires;

//         console.log(`[INVITE] Invite process complete`);
//         return { user: userObject, messageKey: 'INVITE_SUCCESS' };
//     }

//     // --- COMPLETE REGISTRATION ---
//     async completeRegistration(inviteToken, userData, lang = 'EN') {
//         console.log(`[REGISTRATION] Completing registration for token: ${inviteToken}`);
//         const user = await User.findOne({ inviteToken, inviteTokenExpires: { $gt: Date.now() } });
//         if (!user) {
//             console.error(`[REGISTRATION] Invalid or expired token`);
//             throw new Error(MESSAGES.INVALID_INVITE_TOKEN[lang]);
//         }

//         user.firstName = userData.firstName;
//         user.lastName = userData.lastName;
//         user.phoneNumber = userData.phoneNumber;
//         user.password = await hashPassword(userData.password);
//         user.profileCompleted = true;
//         user.inviteToken = undefined;
//         user.inviteTokenExpires = undefined;

//         const otp = generateOTP();
//         user.otp = otp;
//         user.otpExpires = new Date(Date.now() + authConfig.otpExpiresInMinutes * 60 * 1000);

//         await user.save();
//         console.log(`[REGISTRATION] User registration completed. OTP generated: ${otp}`);

//         const emailSubject = 'Verify Your Email - ISARION Platform';
//         const emailText = `Your OTP for email verification is: ${otp}. Valid for ${authConfig.otpExpiresInMinutes} minutes.`;
//         const emailHtml = `<p>Your OTP is: <strong>${otp}</strong></p><p>Valid for ${authConfig.otpExpiresInMinutes} minutes.</p>`;
//         await sendEmail(user.email, emailSubject, emailText, emailHtml, lang);

//         console.log(`[REGISTRATION] OTP email sent to ${user.email}`);
//         return { user, messageKey: 'OTP_SENT' };
//     }

//     // --- VERIFY EMAIL OTP ---
//     async verifyEmailOtp(email, otp, lang = 'EN') {
//         console.log(`[VERIFY OTP] Verifying email OTP for ${email}`);
//         const user = await User.findOne({ email }).select('+otp +otpExpires');
//         if (!user) {
//             console.error(`[VERIFY OTP] User not found`);
//             throw new Error(MESSAGES.USER_NOT_FOUND[lang]);
//         }
//         if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
//             console.error(`[VERIFY OTP] Invalid or expired OTP`);
//             throw new Error(MESSAGES.INVALID_OTP[lang]);
//         }

//         user.isVerified = true;
//         user.otp = undefined;
//         user.otpExpires = undefined;
//         await user.save();
//         console.log(`[VERIFY OTP] Email verified for ${email}`);

//         return { messageKey: 'EMAIL_VERIFIED' };
//     }

//     // --- LOGIN ---
//     async login(email, password, lang = 'EN') {
//         console.log(`[LOGIN] User login attempt: ${email}`);
//         const user = await User.findOne({ email }).select('+password +isVerified +otp +otpExpires');
//         if (!user) throw new Error(MESSAGES.INVALID_USER[lang]);

//         const isPasswordMatch = await comparePassword(password, user.password);
//         if (!isPasswordMatch) throw new Error(MESSAGES.INVALID_USER[lang]);
//         if (!user.isVerified) throw new Error(MESSAGES.EMAIL_NOT_VERIFIED[lang]);

//         const otp = generateOTP();
//         user.otp = otp;
//         user.otpExpires = new Date(Date.now() + authConfig.otpExpiresInMinutes * 60 * 1000);
//         await user.save();

//         const registrationLink = `${authConfig.frontendUrl}/login`; // optional
//         const emailSubject = 'Login Verification OTP - ISARION Platform';
//         const emailText = `Your OTP for login verification is: ${otp}. Valid for ${authConfig.otpExpiresInMinutes} minutes.`;
//         const emailHtml = `<p>Your OTP is: <strong>${otp}</strong></p><p>Valid for ${authConfig.otpExpiresInMinutes} minutes.</p>`;
//         await sendEmail(user.email, emailSubject, emailText, emailHtml, lang);

//         console.log(`[LOGIN] OTP sent to ${email}`);
//         return { messageKey: 'OTP_SENT' };
//     }

//     // --- VERIFY LOGIN OTP ---
//     async verifyLoginOtp(email, otp, lang = 'EN') {
//         console.log(`[VERIFY LOGIN OTP] Verifying login OTP for ${email}`);
//         const user = await User.findOne({ email }).select('+otp +otpExpires');
//         if (!user) throw new Error(MESSAGES.USER_NOT_FOUND[lang]);
//         if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) throw new Error(MESSAGES.INVALID_OTP[lang]);

//         user.otp = undefined;
//         user.otpExpires = undefined;
//         await user.save();

//         const token = jwt.sign(
//             { id: user._id, role: user.role, subscriptionId: user.subscriptionId, tenantAdminId: user.tenantAdminId },
//             authConfig.jwtSecret,
//             { expiresIn: authConfig.jwtExpiresIn }
//         );

//         console.log(`[VERIFY LOGIN OTP] Login successful, token generated`);
//         return { token, messageKey: 'LOGIN_SUCCESS' };
//     }

//     // --- FORGOT PASSWORD ---
//     async forgotPassword(email, frontendResetUrl, lang = 'EN') {
//         console.log(`[FORGOT PASSWORD] Reset request for ${email}`);
//         const user = await User.findOne({ email });
//         if (!user) throw new Error(MESSAGES.USER_NOT_FOUND[lang]);

//         const resetToken = user.getResetPasswordToken();
//         await user.save();

//         const resetUrl = `${frontendResetUrl}?token=${resetToken}`;
//         const emailSubject = 'Password Reset Request - ISARION Platform';
//         const emailText = `Reset password using this link: ${resetUrl}`;
//         const emailHtml = `<p>Reset password using this link:</p><p><a href="${resetUrl}">Reset Password</a></p>`;
//         await sendEmail(user.email, emailSubject, emailText, emailHtml, lang);

//         console.log(`[FORGOT PASSWORD] Reset email sent to ${email}`);
//         return { messageKey: 'PASSWORD_RESET_EMAIL_SENT' };
//     }

//     // --- RESET PASSWORD ---
//     async resetPassword(token, newPassword, lang = 'EN') {
//         console.log(`[RESET PASSWORD] Reset attempt with token`);
//         const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
//         const user = await User.findOne({
//             passwordResetToken: hashedToken,
//             passwordResetExpires: { $gt: Date.now() }
//         }).select('+passwordResetToken +passwordResetExpires +password');

//         if (!user) throw new Error(MESSAGES.INVALID_INVITE_TOKEN[lang]);

//         user.password = await hashPassword(newPassword);
//         user.profileCompleted = true;
//         user.passwordResetToken = undefined;
//         user.passwordResetExpires = undefined;
//         await user.save();

//         console.log(`[RESET PASSWORD] Password reset successful`);
//         return { messageKey: 'PASSWORD_RESET_SUCCESS' };
//     }

//     // --- UPDATE PROFILE ---
//     async updateProfile(userId, updates, lang = 'EN') {
//         console.log(`[UPDATE PROFILE] Updating profile for ${userId}`);
//         const user = await User.findById(userId).select('+password');
//         if (!user) throw new Error(MESSAGES.USER_NOT_FOUND[lang]);

//         if (updates.firstName) user.firstName = updates.firstName;
//         if (updates.lastName) user.lastName = updates.lastName;
//         if (updates.phoneNumber) user.phoneNumber = updates.phoneNumber;

//         if (updates.newPassword) {
//             if (!updates.currentPassword) throw new Error(MESSAGES.PASSWORD_REQUIRED[lang]);
//             if (!(await comparePassword(updates.currentPassword, user.password))) throw new Error(MESSAGES.INVALID_PASSWORD[lang]);
//             user.password = await hashPassword(updates.newPassword);
//             user.profileCompleted = true;
//         }

//         await user.save();

//         user.password = undefined;
//         user.otp = undefined;
//         user.otpExpires = undefined;
//         user.passwordResetToken = undefined;
//         user.passwordResetExpires = undefined;

//         console.log(`[UPDATE PROFILE] Profile updated successfully for ${userId}`);
//         return { user: user.toObject(), messageKey: 'PROFILE_UPDATED' };
//     }

//     // --- RESEND OTP ---
//     async resendOtp(email, lang = 'EN') {
//         console.log(`[RESEND OTP] Resend OTP request for ${email}`);
//         const user = await User.findOne({ email }).select('+isVerified +otp +otpExpires +profileCompleted');
//         if (!user) throw new Error(MESSAGES.USER_NOT_FOUND[lang]);

//         let emailSubject;
//         if (!user.profileCompleted) throw new Error(MESSAGES.REGISTRATION_INCOMPLETE[lang]);
//         else if (!user.isVerified) emailSubject = 'Email Verification OTP Resent - ISARION Platform';
//         else emailSubject = 'Login Verification OTP Resent - ISARION Platform';

//         const otp = generateOTP();
//         user.otp = otp;
//         user.otpExpires = new Date(Date.now() + authConfig.otpExpiresInMinutes * 60 * 1000);
//         await user.save();

//         const emailText = `Your new OTP is: ${otp}. Valid for ${authConfig.otpExpiresInMinutes} minutes.`;
//         const emailHtml = `<p>Your new OTP is: <strong>${otp}</strong></p><p>Valid for ${authConfig.otpExpiresInMinutes} minutes.</p>`;
//         await sendEmail(user.email, emailSubject, emailText, emailHtml, lang);

//         console.log(`[RESEND OTP] OTP resent successfully to ${email}`);
//         return { messageKey: 'NEW_OTP_SENT' };
//     }
// }

// export default new AuthService();


// src/services/auth.service.js
import User from '../models/user.model.js';
import Subscription from '../models/subscription.model.js';
import generateOTP from '../utils/otpGenerator.js';
import sendEmail from '../utils/emailSender.js';
import { hashPassword, comparePassword } from '../utils/helpers.js';
import authConfig from '../config/auth.config.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { MESSAGES } from '../utils/messages.js';
import userService from './user.service.js';

// Default plan configurations
const DEFAULT_PLANS = {
    Basic: { maxAdmins: 1, maxAuditors: 5, templateAccess: ['tpl-basic-1', 'tpl-basic-2'] },
    Professional: { maxAdmins: 3, maxAuditors: 20, templateAccess: ['tpl-basic-1', 'tpl-basic-2', 'tpl-pro-3', 'tpl-pro-4'] },
    Enterprise: { maxAdmins: 10, maxAuditors: 100, templateAccess: [] } // empty = access all public templates
};

class AuthService {
    // --- INVITE USER ---
    async inviteUser(email, role, frontendRegisterUrl, inviterUser, planDetails = {}, lang = 'EN') {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.isVerified) throw new Error(MESSAGES.USER_EXISTS[lang]);
            else throw new Error(MESSAGES.USER_ALREADY_INVITED[lang]);
        }

        const inviterRole = inviterUser.role;
        const managerId = inviterUser.id;

        let userData = {
            email,
            role,
            inviteToken: crypto.randomBytes(32).toString('hex'),
            inviteTokenExpires: new Date(Date.now() + authConfig.inviteTokenExpiresInHours * 60 * 60 * 1000),
            isVerified: false,
            profileCompleted: false,
            managerId
        };

        // Super Admin inviting Admin -> create subscription
        if (inviterRole === 'super_admin' && role === 'admin') {
            const { planName, maxAdmins, maxAuditors, templateAccess } = planDetails;
            if (!planName || !DEFAULT_PLANS[planName]) throw new Error(MESSAGES.INVALID_PLAN_NAME[lang]);

            const newUser = await new User(userData).save();
            const planData = DEFAULT_PLANS[planName];

            const newSubscription = await new Subscription({
                name: planName,
                maxAdmins: maxAdmins ?? planData.maxAdmins,
                maxAuditors: maxAuditors ?? planData.maxAuditors,
                templateAccess: templateAccess ?? planData.templateAccess,
                ownerId: newUser._id
            }).save();

            newUser.subscriptionId = newSubscription._id;
            newUser.tenantAdminId = newUser._id;
            await newUser.save();

            const registrationLink = `${frontendRegisterUrl}?token=${newUser.inviteToken}`;
            await sendEmail(
                email,
                'Invitation to ISARION Platform',
                `You have been invited. Complete registration: ${registrationLink}`,
                `<p>You have been invited.</p><p><a href="${registrationLink}">Complete Registration</a></p>`,
                lang
            );

            const userObject = newUser.toObject();
            delete userObject.inviteToken;
            delete userObject.inviteTokenExpires;
            return { user: userObject, messageKey: 'INVITE_SUCCESS' };
        }

        // Admin inviting sub-user -> check quota
        if (inviterRole === 'admin') {
            const subId = inviterUser.subscriptionId;
            const tenantAdminId = inviterUser.tenantAdminId || inviterUser.id;

            if (!subId) throw new Error(MESSAGES.ADMIN_MISSING_SUBSCRIPTION[lang]);

            const { count, maxLimit } = await userService.checkSubscriptionQuota(tenantAdminId, role, subId);
            if (count >= maxLimit) {
                const messageKey = role === 'admin' ? 'MAX_ADMIN_LIMIT_REACHED' : 'MAX_AUDITOR_LIMIT_REACHED';
                throw new Error(MESSAGES[messageKey][lang]);
            }

            userData.subscriptionId = subId;
            userData.tenantAdminId = tenantAdminId;
        }

        const user = await new User(userData).save();
        const registrationLink = `${frontendRegisterUrl}?token=${user.inviteToken}`;
        await sendEmail(
            email,
            'Invitation to ISARION Platform',
            `You have been invited. Complete registration: ${registrationLink}`,
            `<p>You have been invited.</p><p><a href="${registrationLink}">Complete Registration</a></p>`,
            lang
        );

        const userObject = user.toObject();
        delete userObject.inviteToken;
        delete userObject.inviteTokenExpires;
        return { user: userObject, messageKey: 'INVITE_SUCCESS' };
    }

    // --- COMPLETE REGISTRATION ---
    async completeRegistration(inviteToken, userData, lang = 'EN') {
        const user = await User.findOne({ inviteToken, inviteTokenExpires: { $gt: Date.now() } });
        if (!user) throw new Error(MESSAGES.INVALID_INVITE_TOKEN[lang]);

        user.firstName = userData.firstName;
        user.lastName = userData.lastName;
        user.phoneNumber = userData.phoneNumber;
        user.password = await hashPassword(userData.password);
        user.profileCompleted = true;
        user.inviteToken = undefined;
        user.inviteTokenExpires = undefined;

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + authConfig.otpExpiresInMinutes * 60 * 1000);
        await user.save();

        await sendEmail(
            user.email,
            'Verify Your Email - ISARION Platform',
            `Your OTP for email verification is: ${otp}. Valid for ${authConfig.otpExpiresInMinutes} minutes.`,
            `<p>Your OTP is: <strong>${otp}</strong></p><p>Valid for ${authConfig.otpExpiresInMinutes} minutes.</p>`,
            lang
        );

        return { user, messageKey: 'OTP_SENT' };
    }

    // --- VERIFY EMAIL OTP ---
    async verifyEmailOtp(email, otp, lang = 'EN') {
        const user = await User.findOne({ email }).select('+otp +otpExpires');
        if (!user) throw new Error(MESSAGES.USER_NOT_FOUND[lang]);
        if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) throw new Error(MESSAGES.INVALID_OTP[lang]);

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        return { messageKey: 'EMAIL_VERIFIED' };
    }

    // --- LOGIN ---
    async login(email, password, lang = 'EN') {
        const user = await User.findOne({ email }).select('+password +isVerified +otp +otpExpires');
        if (!user) throw new Error(MESSAGES.INVALID_USER[lang]);
        const isPasswordMatch = await comparePassword(password, user.password);
        if (!isPasswordMatch) throw new Error(MESSAGES.INVALID_USER[lang]);
        if (!user.isVerified) throw new Error(MESSAGES.EMAIL_NOT_VERIFIED[lang]);

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + authConfig.otpExpiresInMinutes * 60 * 1000);
        await user.save();

        await sendEmail(
            user.email,
            'Login Verification OTP - ISARION Platform',
            `Your OTP for login verification is: ${otp}. Valid for ${authConfig.otpExpiresInMinutes} minutes.`,
            `<p>Your OTP is: <strong>${otp}</strong></p><p>Valid for ${authConfig.otpExpiresInMinutes} minutes.</p>`,
            lang
        );

        return { messageKey: 'OTP_SENT' };
    }

    // --- VERIFY LOGIN OTP ---
    async verifyLoginOtp(email, otp, lang = 'EN') {
        const user = await User.findOne({ email }).select('+otp +otpExpires');
        if (!user) throw new Error(MESSAGES.USER_NOT_FOUND[lang]);
        if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) throw new Error(MESSAGES.INVALID_OTP[lang]);

        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role, subscriptionId: user.subscriptionId, tenantAdminId: user.tenantAdminId },
            authConfig.jwtSecret,
            { expiresIn: authConfig.jwtExpiresIn }
        );

        return { token, messageKey: 'LOGIN_SUCCESS' };
    }

    // --- FORGOT PASSWORD ---
    async forgotPassword(email, frontendResetUrl, lang = 'EN') {
        const user = await User.findOne({ email });
        if (!user) throw new Error(MESSAGES.USER_NOT_FOUND[lang]);

        const resetToken = user.getResetPasswordToken();
        await user.save();

        const resetUrl = `${frontendResetUrl}?token=${resetToken}`;
        await sendEmail(
            user.email,
            'Password Reset Request - ISARION Platform',
            `Reset password using this link: ${resetUrl}`,
            `<p>Reset password using this link:</p><p><a href="${resetUrl}">Reset Password</a></p>`,
            lang
        );

        return { messageKey: 'PASSWORD_RESET_EMAIL_SENT' };
    }

    // --- RESET PASSWORD ---
    async resetPassword(token, newPassword, lang = 'EN') {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        }).select('+passwordResetToken +passwordResetExpires +password');

        if (!user) throw new Error(MESSAGES.INVALID_INVITE_TOKEN[lang]);

        user.password = await hashPassword(newPassword);
        user.profileCompleted = true;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        return { messageKey: 'PASSWORD_RESET_SUCCESS' };
    }

    // --- UPDATE PROFILE ---
    async updateProfile(userId, updates, lang = 'EN') {
        const user = await User.findById(userId).select('+password');
        if (!user) throw new Error(MESSAGES.USER_NOT_FOUND[lang]);

        if (updates.firstName) user.firstName = updates.firstName;
        if (updates.lastName) user.lastName = updates.lastName;
        if (updates.phoneNumber) user.phoneNumber = updates.phoneNumber;

        if (updates.newPassword) {
            if (!updates.currentPassword) throw new Error(MESSAGES.PASSWORD_REQUIRED[lang]);
            if (!(await comparePassword(updates.currentPassword, user.password))) throw new Error(MESSAGES.INVALID_PASSWORD[lang]);
            user.password = await hashPassword(updates.newPassword);
            user.profileCompleted = true;
        }

        await user.save();

        // Clean sensitive data before returning
        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.otp;
        delete userObj.otpExpires;
        delete userObj.passwordResetToken;
        delete userObj.passwordResetExpires;

        return { user: userObj, messageKey: 'PROFILE_UPDATED' };
    }

    // --- RESEND OTP ---
    async resendOtp(email, lang = 'EN') {
        const user = await User.findOne({ email }).select('+isVerified +otp +otpExpires +profileCompleted');
        if (!user) throw new Error(MESSAGES.USER_NOT_FOUND[lang]);
        if (!user.profileCompleted) throw new Error(MESSAGES.REGISTRATION_INCOMPLETE[lang]);

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + authConfig.otpExpiresInMinutes * 60 * 1000);
        await user.save();

        const emailSubject = !user.isVerified
            ? 'Email Verification OTP Resent - ISARION Platform'
            : 'Login Verification OTP Resent - ISARION Platform';

        await sendEmail(
            user.email,
            emailSubject,
            `Your new OTP is: ${otp}. Valid for ${authConfig.otpExpiresInMinutes} minutes.`,
            `<p>Your new OTP is: <strong>${otp}</strong></p><p>Valid for ${authConfig.otpExpiresInMinutes} minutes.</p>`,
            lang
        );

        return { messageKey: 'NEW_OTP_SENT' };
    }
}

export default new AuthService();

