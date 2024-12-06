const issueHandler = require('./handlers/issueHandler');
const getRoutes = require('./routes/getRoutes');
const postRoutes = require('./routes/postRoutes');

/**
 * @param {import('probot').Probot} app
 * @param {Object} options
 * @param {Function} options.getRouter
 */
module.exports = (app, { getRouter }) => {
    app.log("Yay! The app was loaded!");

    // Initialize the issue handler
    issueHandler(app);

    // Check if getRouter is available
    if (getRouter) {
        // Create a router with a base path
        app.log("Router findss");

        const router = getRouter('/my-app');
        getRoutes(router);
        postRoutes(router);

    } else {
      app.log("NO ROUTER LALA");
    }
};