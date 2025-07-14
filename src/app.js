// src/app.js

import express from 'express';
import cors from 'cors'; // Import the cors middleware
import authRoutes from './routes/auth.routes.js';

const app = express();

// Configure CORS
// For development, you can allow all origins:
// app.use(cors());
// For production, it's best to specify allowed origins:
const corsOptions = {
    origin: ['http://localhost:3000', 'https://your-frontend-domain.com'], // Replace with your actual frontend domain(s)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies to be sent with requests
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));


// Middleware to parse JSON bodies from incoming requests
app.use(express.json());

// Basic route for the root URL to confirm the server is running
app.get('/', (req, res) => {
    res.send('SaaS Cybersecurity Audit Platform Backend is running!');
});

// Use authentication routes with the /api/v1/auth prefix
app.use('/api/v1/auth', authRoutes);

// Export the Express app instance
export default app;
