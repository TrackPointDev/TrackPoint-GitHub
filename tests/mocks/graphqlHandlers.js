import { graphql } from 'msw';

export const handlers = [
  // Handler for fetching repository ID
  graphql.query('GetRepoId', (req, res, ctx) => {
    const { owner, name } = req.variables;
    if (owner === 'testOwner' && name === 'testRepo') {
      return res(
        ctx.data({
          repository: {
            id: 'repo123',
          },
        })
      );
    }
    return res(
      ctx.errors([
        {
          message: 'Repository not found',
        },
      ])
    );
  }),

  // Handler for creating an issue
  graphql.mutation('CreateIssue', (req, res, ctx) => {
    const { repositoryId, title } = req.variables;
    if (repositoryId === 'repo123') {
      return res(
        ctx.data({
          createIssue: {
            issue: {
              number: 1,
              title,
            },
          },
        })
      );
    }
    return res(
      ctx.errors([
        {
          message: 'Failed to create issue',
        },
      ])
    );
  }),

  // Handler for fetching labels
  graphql.query('GetLabels', (req, res, ctx) => {
    const { repositoryId } = req.variables;
    if (repositoryId === 'repo123') {
      return res(
        ctx.data({
          node: {
            labels: {
              nodes: [
                { id: 'label123', name: 'bug' },
              ],
            },
          },
        })
      );
    }
    return res(
      ctx.errors([
        {
          message: 'Labels not found',
        },
      ])
    );
  }),

  // Handler for creating a label
  graphql.mutation('CreateLabel', (req, res, ctx) => {
    const { repositoryId, name } = req.variables;
    if (repositoryId === 'repo123') {
      return res(
        ctx.data({
          createLabel: {
            label: {
              id: 'label123',
              name,
            },
          },
        })
      );
    }
    return res(
      ctx.errors([
        {
          message: 'Failed to create label',
        },
      ])
    );
  }),

  // Handler for updating an issue
  graphql.mutation('UpdateIssue', (req, res, ctx) => {
    const { issueId, title } = req.variables;
    if (issueId === 'issue123') {
      return res(
        ctx.data({
          updateIssue: {
            issue: {
              number: 1,
              title,
            },
          },
        })
      );
    }
    return res(
      ctx.errors([
        {
          message: 'Failed to update issue',
        },
      ])
    );
  }),

  // Handler for deleting an issue
  graphql.mutation('DeleteIssue', (req, res, ctx) => {
    const { issueId } = req.variables;
    if (issueId === 'issue123') {
      return res(
        ctx.data({
          deleteIssue: {
            clientMutationId: 'delete123',
          },
        })
      );
    }
    return res(
      ctx.errors([
        {
          message: 'Failed to delete issue',
        },
      ])
    );
  }),
];
