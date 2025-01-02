const { createNodeMiddleware, createProbot } = require("probot");
const appFunction  = require("./app");
const getRoutes = require('./routes/getRoutes');
const postRoutes = require('./routes/postRoutes');
const express = require("express");
require('dotenv').config();

// Create an Express app
const app = express();
const probot = createProbot();
//getRoutes(expressApp)
//postRoutes(app, middleware)

// Use Probot's middleware for GitHub webhooks
app.use('/', createNodeMiddleware(appFunction, { probot }));

// Define custom routes
getRoutes(app)
postRoutes(app, probot)

exports.probotApp = app;
// Start the server LOCAL DEV ONLY dont deploy this
/*
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
*/

console.log("Probot middleware initialized");