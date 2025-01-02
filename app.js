const issueHandler = require('./handlers/issueHandler');

/**
 * @param {import('probot').Probot} app
 * @param {Object} options
 * @param {Function} options.getRouter
 */

module.exports = (app, { getRouter }) => {
    app.log("Yay! The app.log was loaded!");
    console.log("Yay! The app.console was loaded!")
    issueHandler(app);
};
