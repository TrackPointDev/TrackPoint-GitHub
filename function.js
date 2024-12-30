const { createNodeMiddleware, createProbot } = require("probot");
const app = require("./app");

// Create the Probot middleware
exports.probotApp = createNodeMiddleware(app, {
  probot: createProbot(),
  webhooksPath: "/my-app", // Ensure this matches your base path
  onUnhandledRequest: (req, res) => {
    console.log(`Unhandled request: ${req.method} ${req.url}`);
    res.status(404).send('Not Found');
  }
});

console.log("Probot middleware initialized");