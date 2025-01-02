const postHandler = require('../handlers/postHandler');
const express = require('express');

module.exports = (router) => {
    router.use(express.json());

    router.post('/submit', postHandler.submitData);
};

module.exports = (router, probot) => {
    router.use(express.json());

    router.post('/initial-setup', (req, res) => postHandler.initialSetup(req, res, probot));
};
