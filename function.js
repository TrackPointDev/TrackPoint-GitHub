const { createNodeMiddleware, createProbot } = require("probot");
const appFunction  = require("./app");
const getRoutes = require('./routes/getRoutes');
const postRoutes = require('./routes/postRoutes');
const express = require("express");
require('dotenv').config();

// Create an Express app
const app = express();
const probot = createProbot();

// Use Probot's middleware for GitHub webhooks
app.use('/', createNodeMiddleware(appFunction, { probot }));

// Define custom routes
getRoutes(app)
postRoutes(app, probot)

// Export the Express app for deployment as a Google Cloud Function entry point
exports.probotApp = app;

// LOCAL DEV ONLY dont deploy this
/*
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
*/

console.log("Probot middleware initialized");