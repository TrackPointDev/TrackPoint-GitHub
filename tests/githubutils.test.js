import { describe, it, expect, vi } from 'vitest';
import {
  authenticateGitHubClient,
  createIssues,
  createIssue,
  fetchAndCacheLabels,
  createLabel,
  updateIssue,
  fetchIssueNodeId,
  fetchRepoAndIssueNodeIds,
  updateIssues,
  deleteIssues,
  deleteIssueByNumber,
  deleteAllIssues
} from '../utils/githubUtils.js';

// Mock implementation of the GitHub GraphQL client
const mockGithub = {
  graphql: vi.fn(async (query, variables) => {
    if (query.includes('GetRepoId')) {
      if (variables.owner === 'testOwner' && variables.name === 'testRepo') {
        return { repository: { id: 'repo123' } };
      }
      throw new Error('Repository not found');
    }
    if (query.includes('CreateIssues')) {
      // Simulate creating multiple issues by returning different results for each call
      return {
        
        createIssues: [{
          issue: {
            number: Math.floor(Math.random() * 1000), // Simulate unique issue numbers
            title: variables.title,
          },
          issue: {
            number: Math.floor(Math.random() * 1000), // Simulate unique issue numbers
            title: variables.title,
          },
        }],
      };
    }
    if (query.includes('CreateIssue')) {
      return { createIssue: { issue: { number: 1, title: variables.title } } };
    }
    if (query.includes('GetLabels')) {
      return { node: { labels: { nodes: [{ id: 'label123', name: 'bug' }] } } };
    }
    if (query.includes('CreateLabel')) {
      return { createLabel: { label: { id: 'label123', name: variables.name } } };
    }
    if (query.includes('UpdateIssue')) {
      return { updateIssue: { issue: { number: 1, title: variables.title } } };
    }
    if (query.includes('GetIssueNodeId')) {
      return { repository: { issue: { id: 'issue123' } } };
    }
    if (query.includes('GetRepoAndIssueNodeIds')) {
      return {
        repository: {
          id: 'repo123',
          issues: { nodes: [{ number: 1, id: 'issue123' }] }
        }
      };
    }
    if (query.includes('DeleteIssue')) {
      return { clientMutationId: 'delete123' };
    }
    if (query.includes('UpdateIssues')) {
      return { updateIssues: { issues: [{ number: 1, title: variables.title }] } };
    }
    if (query.includes('DeleteIssues')) {
      return { deleteIssues: { issueNumbers: [1] } };
    }
    if (query.includes('DeleteAllIssues')) {
      return { deleteAllIssues: { issueNumbers: [1] } };
    }
    throw new Error('Query not handled in mock');
  }) 
};

describe('GitHub Utils Tests', () => {
  it('should authenticate GitHub client', async () => {
    const app = { auth: async (installationID) => `token-${installationID}` };
    const token = await authenticateGitHubClient(app, 123);
    expect(token).toBe('token-123');
  });

  it('should create issues', async () => {
    const tasks = [
      { title: 'Test Issue 1', description: 'Description 1', labelIds: ['label123'] },
      { title: 'Test Issue 2', description: 'Description 2', labelIds: ['label123'] }
    ];
    const issues = await createIssues(mockGithub, 'repo123', tasks);
    expect(issues).toEqual([
      { title: 'Test Issue 1', number: expect.any(Number) },
      { title: 'Test Issue 2', number: expect.any(Number) }
    ]);
  });

  it('should create a single issue', async () => {
    const issue = await createIssue(mockGithub, 'repo123', 'Test Issue', 'Description', ['label123']);
    expect(issue).toEqual({ number: 1, title: 'Test Issue' });
  });

  it('should fetch and cache labels', async () => {
    const labels = await fetchAndCacheLabels(mockGithub, 'repo123');
    expect(labels).toEqual({ bug: 'label123' });
  });

  it('should create a label', async () => {
    const labelId = await createLabel(mockGithub, 'repo123', 'bug', 'FFFFFF');
    expect(labelId).toBe('label123');
  });

  it('should update an issue', async () => {
    const updatedIssue = await updateIssue(mockGithub, 'issue123', { title: 'Updated Title' });
    expect(updatedIssue).toEqual({ number: 1, title: 'Updated Title' });
  });

  it('should fetch issue node ID', async () => {
    const issueId = await fetchIssueNodeId(mockGithub, 'testOwner', 'testRepo', 1);
    expect(issueId).toBe('issue123');
  });

  it('should fetch repo and issue node IDs', async () => {
    const { repositoryId, issueNodeIds } = await fetchRepoAndIssueNodeIds(mockGithub, 'testOwner', 'testRepo', [1]);
    expect(repositoryId).toBe('repo123');
    expect(issueNodeIds).toEqual([{ number: 1, id: 'issue123' }]);
  });

  it('should update issues', async () => {
    const updatedTasks = [{ issueNodeId: 'issue123', title: 'Updated Title', description: 'Updated Description', labelIds: ['label123'] }];
    const updatedIssues = await updateIssues(mockGithub, updatedTasks);
    expect(updatedIssues).toEqual([{ number: 1, title: 'Updated Title', body: 'Updated Description', labels: { nodes: [{ name: 'bug' }] } }]);
  });

  it('should delete issues', async () => {
    const tasks = [{ issueNodeId: 'issue123', issueNumber: 1 }];
    const deletedIssueNumbers = await deleteIssues(mockGithub, tasks);
    expect(deletedIssueNumbers).toEqual([1]);
  });

  it('should delete issue by number', async () => {
    const response = await deleteIssueByNumber(mockGithub, 'repo123', 1);
    expect(response).toEqual({ clientMutationId: 'delete123' });
  });

  it('should delete all issues', async () => {
    const deletedIssueNumbers = await deleteAllIssues(mockGithub, 'repo123');
    expect(deletedIssueNumbers).toEqual([1]);
  });
});
