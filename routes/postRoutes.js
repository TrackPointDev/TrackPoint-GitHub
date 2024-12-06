const postHandler = require('../handlers/postHandler');

module.exports = (router) => {
    router.post('/submit', postHandler.submitData);
};
