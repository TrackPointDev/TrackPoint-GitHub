import { helloWorld, getTask } from '../handlers/getHandler.js';

export default (router, probot) => {
    router.get('/hello-world', helloWorld);

    router.get('/task/get/:id', (req, res) => getTask(req, res, probot));
};
