const postHandler = require('../handlers/postHandler');
const express = require('express');

module.exports = (router, probot) => {
    router.use(express.json());
    // Middleware for request validation (optional)
    const validateRequest = (req, res, next) => {
        // Add validation logic here
        next();
    };

    //Dummy routes for internal test calls
    router.post('/test', validateRequest, (req, res) => {
        try {
            postHandler.test(req, res, probot);
        } catch (error) {
            console.error('Error handling /test', error);
            res.status(500).send('Internal Server Error');
        }
    });
    router.put('/test', validateRequest, (req, res) => {
        try {
            postHandler.test(req, res, probot);
        } catch (error) {
            console.error('Error handling /test', error);
            res.status(500).send('Internal Server Error');
        }
    });
    router.delete('/test', validateRequest, (req, res) => {
        try {
            postHandler.test(req, res, probot);
        } catch (error) {
            console.error('Error handling /test', error);
            res.status(500).send('Internal Server Error');
        }
    });

    router.post('/task/update', validateRequest, (req, res) => {
        try {
            postHandler.taskUpdate(req, res, probot);
        } catch (error) {
            console.error('Error handling /task/update:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    router.post('/task/add', validateRequest, (req, res) => {
        try {
            postHandler.taskCreate(req, res, probot);
        } catch (error) {
            console.error('Error handling /task/add:', error);
            res.status(500).send('Internal Server Error');
        }
    })

    router.post('/epic/setup', validateRequest, (req, res) => {
        try {
            postHandler.epicSetup(req, res, probot);
        } catch (error) {
            console.error('Error handling /epic/setup:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    router.post('/epic/update', validateRequest, (req, res) => {
        try {
            postHandler.epicUpdate(req, res, probot);
        } catch (error) {
            console.error('Error handling /epic/update', error);
            res.status(500).send('Internal Server Error');
        }
    });
};