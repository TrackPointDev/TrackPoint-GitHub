import { 
    test, 
    taskUpdate, 
    taskCreate, 
    epicSetup, 
    epicUpdate, 
    epicDelete, 
    taskDelete,
    deleteAllIssuesInRepo
} from '../handlers/postHandler.js';

import { json } from 'express';

export default (router, probot) => {
    router.use(json());
    // Middleware for request validation (optional)
    const validateRequest = (req, res, next) => {
        // Add validation logic here
        next();
    };

    //Dummy routes for internal test calls
    router.post('/test', validateRequest, async(req, res) => {
        try {
            test(req, res, probot);
        } catch (error) {
            console.error('Error handling /test', error);
            res.status(500).send('Internal Server Error');
        }
    });
    router.put('/test', validateRequest, async(req, res) => {
        try {
            test(req, res, probot);
        } catch (error) {
            console.error('Error handling /test', error);
            res.status(500).send('Internal Server Error');
        }
    });
    router.delete('/test', validateRequest, async(req, res) => {
        try {
            test(req, res, probot);
        } catch (error) {
            console.error('Error handling /test', error);
            res.status(500).send('Internal Server Error');
        }
    });

    router.post('/task/update', validateRequest, async(req, res) => {
        try {
            await taskUpdate(req, res, probot);
        } catch (error) {
            console.error('Error handling /task/update:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    router.post('/task/add', validateRequest, async(req, res) => {
        try {
            await taskCreate(req, res, probot);
        } catch (error) {
            console.error('Error handling /task/add:', error);
            res.status(500).send('Internal Server Error');
        }
    })

    router.post('/epic/setup', validateRequest, async(req, res) => {
        try {
            console.log("EPICSETUP CALLED");
            await epicSetup(req, res, probot);
        } catch (error) {
            console.error('Error handling /epic/setup:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    router.post('/epic/update', validateRequest, async(req, res) => {
        try {
            await epicUpdate(req, res, probot);
        } catch (error) {
            console.error('Error handling /epic/update', error);
            res.status(500).send('Internal Server Error');
        }
    });

    router.post('/epic/delete', validateRequest, async(req, res) => {
        try {
            await epicDelete(req, res, probot);
        } catch (error) {
            console.error('Error handling /epic/delete', error);
            res.status(500).send('Internal Server Error');
        }
    });
    

    router.post('/task/delete', validateRequest, async(req, res) => {
        try {
            await taskDelete(req, res, probot);
        } catch (error) {
            console.error('Error handling /task/delete', error);
            res.status(500).send('Internal Server Error');
        }
    });

    router.post('/delete-all-issues', validateRequest, async(req, res) => {
        try {
            await deleteAllIssuesInRepo(req, res, probot);
        } catch (error) {
            console.error('Error handling /delete-all-issues', error);
            res.status(500).send('Internal Server Error');
        }
    });
};