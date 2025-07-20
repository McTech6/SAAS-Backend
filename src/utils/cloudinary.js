// src/utils/cloudinary.js

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Configure Cloudinary using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
   // secure: true // Use HTTPS for all URLs
});

/**
 * Uploads a file to Cloudinary.
 * @param {string} filePath - The path to the file on the local filesystem (provided by Multer).
 * @param {string} folder - The folder name in Cloudinary to upload the file to (e.g., 'audit_evidence').
 * @returns {Promise<object>} A promise that resolves with the Cloudinary upload result.
 */
const uploadToCloudinary = async (filePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder, // Specify the folder in your Cloudinary account
            resource_type: 'auto' // Automatically detect file type (image, video, raw)
            // You can add more options here, e.g., tags, transformations
        });
        return result; // Contains public_id, secure_url, etc.
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload file to Cloudinary.');
    }
};

export { uploadToCloudinary, cloudinary }; // Export cloudinary instance if needed elsewhere
