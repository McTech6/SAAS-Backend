// src/services/upload.service.js

import { uploadToCloudinary } from '../utils/cloudinary.js';
import fs from 'fs/promises'; // For async file system operations (e.g., deleting temp file)

/**
 * Service for handling file uploads.
 */
class UploadService {
    /**
     * Uploads a single file to Cloudinary.
     * @param {object} file - The file object provided by Multer (req.file).
     * @param {string} folder - The Cloudinary folder to upload to (e.g., 'audit_evidence').
     * @returns {Promise<string>} The secure URL of the uploaded file.
     * @throws {Error} If upload fails.
     */
    async uploadSingleFile(file, folder = 'audit_evidence') {
        if (!file) {
            throw new Error('No file provided for upload.');
        }

        try {
            // Upload the file to Cloudinary
            const uploadResult = await uploadToCloudinary(file.path, folder);

            // After successful upload, delete the temporary file from local storage
            await fs.unlink(file.path);

            // Return the secure URL from Cloudinary
            return uploadResult.secure_url;
        } catch (error) {
            // Ensure temporary file is deleted even if Cloudinary upload fails
            if (file && file.path) {
                await fs.unlink(file.path).catch(err => console.error('Failed to delete temp file:', err));
            }
            throw error; // Re-throw the original error
        }
    }
}

export default new UploadService();
