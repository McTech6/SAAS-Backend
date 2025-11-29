// src/routes/contact.routes.js

import express from 'express';
import { submitContactForm } from '../controllers/contact.controller.js';

const router = express.Router();

// POST / (which will be /api/contact/ when mounted in server.js)
router.post('/', submitContactForm);

export default router;