// src/app.js

import express from 'express';
import cors from 'cors'; // Import the cors middleware
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import companyRoutes from './routes/company.routes.js';
import auditTemplateRoutes from './routes/auditTemplate.routes.js';
import auditInstanceRoutes from './routes/auditInstance.routes.js'; 
import uploadRoutes from './routes/upload.routes.js'

const app = express();

// === CORS Configuration ===

// Allow all origins during development
app.use(cors());

// Uncomment the below for production and replace domains as needed
/*
const corsOptions = {
    origin: ['http://localhost:3000', 'https://your-frontend-domain.com'], // Replace with your actual frontend domain(s)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies to be sent with requests
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
*/

// Middleware to parse JSON bodies from incoming requests
app.use(express.json({ limit: '50mb' }));

app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Basic route for the root URL to confirm the server is running
app.get('/', (req, res) => {
    res.send('SaaS Cybersecurity Audit Platform Backend is running!');
});

// Use authentication routes with the /api/v1/auth prefix
app.use('/api/v1/auth', authRoutes);

// Use user management routes with the /api/v1/users prefix
app.use('/api/v1/users', userRoutes);

// Use company management routes with the /api/v1/companies prefix
app.use('/api/v1/companies', companyRoutes);

// Use audit template management routes with the /api/v1/audit-templates prefix
app.use('/api/v1/audit-templates', auditTemplateRoutes);

// Use audit instance management routes with the /api/v1/audit-instances prefix
app.use('/api/v1/audit-instances', auditInstanceRoutes);

// Use upload routes with the /api/v1/uploads prefix
app.use('/api/v1/uploads', uploadRoutes);

// Export the Express app instance
export default app;
