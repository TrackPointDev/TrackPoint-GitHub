import issueHandler from './handlers/issueHandler.js';

/**
 * @param {import('probot').Probot} app
 */

export default (app) => {
    app.log("Yay! The app.log was loaded!");
    issueHandler(app);
};
