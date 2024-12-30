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
    console.log("Yay! The app was loaded!")

    // Initialize the issue handler
    issueHandler(app);
    const router = getRouter('/my-app');

    getRoutes(router);
    postRoutes(router, app);
};