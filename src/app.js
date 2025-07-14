// src/app.js

import express from 'express';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('SaaS Cybersecurity Audit Platform Backend is running!');
});

// Use authentication routes with the /api/v1/auth prefix
app.use('/api/v1/auth', authRoutes);

export default app;