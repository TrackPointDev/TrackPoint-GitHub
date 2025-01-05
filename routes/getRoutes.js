import { helloWorld } from '../handlers/getHandler.js';

export default (router) => {
    router.get('/hello-world', helloWorld);
};
