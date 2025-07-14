// src/config/index.js

import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    mongoURI: process.env.MONGODB_URI,
};

export default config;
