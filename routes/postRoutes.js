const express = require('express');
const asyncHandler = require('express-async-handler'); // Use this if you're on Express 4
const postHandler = require('../handlers/postHandler');

module.exports = (router, probot) => {
    router.use(express.json());

    // Middleware for request validation (optional)
    const validateRequest = (req, res, next) => {
        // Add validation logic here
        next();
    };

    // Dummy routes for internal test calls
    router.post('/test', validateRequest, asyncHandler(async (req, res) => {
        await postHandler.test(req, res, probot);
    }));

    router.put('/test', validateRequest, asyncHandler(async (req, res) => {
        await postHandler.test(req, res, probot);
    }));

    router.delete('/test', validateRequest, asyncHandler(async (req, res) => {
        await postHandler.test(req, res, probot);
    }));

    router.post('/task/update', validateRequest, asyncHandler(async (req, res) => {
        await postHandler.taskUpdate(req, res, probot);
    }));

    router.post('/task/add', validateRequest, asyncHandler(async (req, res) => {
        await postHandler.taskCreate(req, res, probot);
    }));

    router.post('/epic/setup', validateRequest, asyncHandler(async (req, res) => {
        await postHandler.epicSetup(req, res, probot);
    }));

    router.post('/epic/update', validateRequest, asyncHandler(async (req, res) => {
        await postHandler.epicUpdate(req, res, probot);
    }));
};
