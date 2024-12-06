const getHandler = require('../handlers/getHandler');

module.exports = (router) => {
    router.get('/hello-world', getHandler.helloWorld);
};
