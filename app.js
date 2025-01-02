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

    issueHandler(app);
    
    // Check if getRouter is available
    if (typeof app.getRouter === 'function') {
      app.log("Router found");
      console.log("Router found");

      const router = getRouter('/my-app');

      getRoutes(router);
      postRoutes(router, app);

  } else {
      app.log("No router found, ensure your environment supports HTTP routing.");
      console.log("No router found, ensure your environment supports HTTP routing.");
  }

};