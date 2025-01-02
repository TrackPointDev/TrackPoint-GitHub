const { createNodeMiddleware, createProbot } = require("probot");
const app = require('./app');
require('dotenv').config();

// Create the Probot middleware
exports.probotApp = createNodeMiddleware(app, {
    probot: createProbot({
        appId: process.env.APP_ID,
        privateKey: process.env.PRIVATE_KEY,
        secret: process.env.WEBHOOK_SECRET,
    }),
    webhooksPath: "/my-app",
});

console.log("Probot middleware initialized");