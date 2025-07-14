// createSuperAdmin.js

import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import { hashPassword, comparePassword } from './src/utils/helpers.js';
import config from './src/config/index.js';

const createSuperAdmin = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(config.mongoURI);
        console.log('MongoDB connected successfully for Super Admin creation.');

        const email = 'tiddingramsey@gmail.com';
        const defaultPassword = 'password123';

        console.log(`Checking for existing Super Admin with email: ${email}`);
        let superAdmin = await User.findOne({ email, role: 'super_admin' });

        const hashedPassword = await hashPassword(defaultPassword); // Hash using Argon2 directly

        if (superAdmin) {
            console.log(`Super Admin with email ${email} already exists.`);
            superAdmin.password = hashedPassword; // Assign the new hash directly
            superAdmin.isVerified = true;
            superAdmin.profileCompleted = true;
            await superAdmin.save();
            console.log('Super Admin password forcibly updated to the new default (Argon2 hash).');
        } else {
            console.log('Super Admin not found. Proceeding to create a new one...');

            superAdmin = new User({
                firstName: 'Super',
                lastName: 'Admin',
                phoneNumber: '+1234567890',
                email: email,
                password: hashedPassword, // Use the pre-hashed password
                role: 'super_admin',
                isVerified: true,
                profileCompleted: true
            });

            await superAdmin.save();
            console.log(`SUCCESS: Super Admin ${email} created successfully! (Argon2 hash)`);
        }

        console.log(`Default password for login: ${defaultPassword}`);
        console.log('IMPORTANT: Please change this default password after first login for security reasons.');

        // --- Direct Argon2 comparison test ---
        console.log('\n--- Running Direct Argon2 comparison test ---');
        const directCompareResult = await comparePassword(defaultPassword, hashedPassword); // Use helper's compare
        console.log(`Direct Argon2 test: Plain password '${defaultPassword}' vs newly generated hash '${hashedPassword}'`);
        console.log(`Direct Argon2 comparison result: ${directCompareResult}`);
        if (directCompareResult) {
            console.log('Direct Argon2 test PASSED: Argon2 hash and compare work correctly in isolation.');
        } else {
            console.error('Direct Argon2 test FAILED: Argon2 hash and/or compare are failing even in isolation. This is a critical issue.');
        }
        console.log('--- End of Direct Argon2 test ---\n');


    } catch (error) {
        console.error('ERROR: Failed to create Super Admin or during self-test.');
        console.error('Details:', error.message);
        process.exit(1);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('MongoDB disconnected.');
        } else {
            console.log('MongoDB was not connected or already disconnected.');
        }
    }
};

createSuperAdmin();

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
