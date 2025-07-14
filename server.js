// server.js

import app from './src/app.js'; // Import the Express application instance
import connectDB from './src/config/db.config.js'; // Import the database connection function
import config from './src/config/index.js'; // Import the main configuration file

/**
 * @function startServer
 * @description Connects to the database and starts the Express server.
 */
const startServer = async () => {
    // First, connect to the MongoDB database
    await connectDB();

    // Get the port number from the configuration
    const PORT = config.port;

    // Start the Express server and listen for incoming requests on the specified port
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`); // Log a message indicating the server has started
        console.log(`Access the API at: http://localhost:${PORT}`); // Provide the URL for easy access
    });
};

// Call the function to start the server
startServer();
