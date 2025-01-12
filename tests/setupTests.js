// tests/setupTests.js
import 'whatwg-fetch'; // Ensure fetch is polyfilled
import { setupServer } from 'msw/node';
import { handlers } from './mocks/graphqlHandlers.js';
import { beforeAll, afterAll, afterEach} from 'vitest';

// Setup the server with the handlers
const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

