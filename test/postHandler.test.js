import { taskCreate } from '../handlers/postHandler.js';
import { mockRequest, mockResponse } from './mockRequestResponse.js';
import nock, { enableNetConnect, cleanAll, disableNetConnect } from 'nock';

describe('PostHandler Tests', () => {
  beforeEach(() => {
    // Allow connections to localhost
    enableNetConnect('127.0.0.1');
  });

  afterEach(() => {
    cleanAll();
    disableNetConnect();
  });

  test('taskCreate should create a GitHub issue', async () => {
    const req = mockRequest({
      repoOwner: 'owner',
      repoName: 'repo',
      installationID: 123,
      title: 'Test Task',
      description: 'This is a test task',
      priority: 'high',
      story_point: 5,
    });

    const res = mockResponse();

    // Mock the JSON schema request
    nock('https://raw.githubusercontent.com')
      .get('/TrackPointDev/TrackPoint-json-schemas/refs/heads/main/json-schemas/task_schema.json')
      .reply(200, { /* Mock schema content */ });

    // Mock GitHub API requests
    nock('https://api.github.com')
      .post('/app/installations/123/access_tokens')
      .reply(200, { token: 'test' });

    nock('https://api.github.com')
      .post('/repos/owner/repo/issues')
      .reply(201, { number: 1 });

    await taskCreate(req, res, { auth: jest.fn().mockResolvedValue({ issues: { create: jest.fn().mockResolvedValue({ data: { number: 1 } }) } }) });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ number: 1 });
  });
});
