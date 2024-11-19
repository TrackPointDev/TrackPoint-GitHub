const issueHandler = require('./handlers/issueHandler');

/**
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
    app.log("Yay! The app was loaded!");
    
    issueHandler(app);
  };
  