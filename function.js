const { createNodeMiddleware, createProbot } = require("probot");
const app = require("./app");

// Create the Probot middleware
exports.probotApp = createNodeMiddleware(app, {
  probot: createProbot(),
  webhooksPath: "/my-app", // Ensure this matches your base path
});
