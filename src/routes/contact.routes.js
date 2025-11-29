// src/routes/contact.routes.js

import express from "express";
import { submitContactForm, submitSubscriptionForm } from "../controllers/contact.controller.js";

const router = express.Router();

// POST /api/contact
router.post("/", submitContactForm);

// POST /api/contact/subscribe
router.post("/subscribe", submitSubscriptionForm);

export default router;
