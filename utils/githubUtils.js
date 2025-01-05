
export const authenticateGitHubClient = async (app, installationID) => {
    console.log('Authenticating with installation ID:', installationID);
    return await app.auth(installationID);
};

export const fetchRepositoryId = async (github, repoOwner, repoName) => {
    const repoQuery = `
        query GetRepoId($owner: String!, $name: String!) {
            repository(owner: $owner, name: $name) {
                id
            }
        }
    `;
    console.log('Requesting repository ID with query:', repoQuery, 'and variables:', { owner: repoOwner, name: repoName });

    const repoData = await github.graphql(repoQuery, { owner: repoOwner, name: repoName });
    console.log('Repository data:', repoData);

    return repoData.repository.id;
};

export const createIssues = async (github, repositoryId, tasks) => {
    try {
        const createdIssues = [];

        // Process tasks in smaller batches
        const batchSize = 5; // Adjust batch size as needed
        for (let i = 0; i < tasks.length; i += batchSize) {
            const batchTasks = tasks.slice(i, i + batchSize);

            // Construct the mutation string dynamically for creating issues
            const mutationParts = batchTasks.map((task, index) => `
                issue${index}: createIssue(input: {
                    repositoryId: "${repositoryId}",
                    title: "${task.title}",
                    body: "${task.description}",
                    labelIds: ${JSON.stringify(task.labelIds)}
                }) {
                    issue {
                        number
                        title
                        id
                    }
                }
            `);

            const mutation = `
                mutation {
                    ${mutationParts.join('\n')}
                }
            `;

            console.log('Executing batch create mutation:', mutation);
            console.log('Number of tasks in batch:', batchTasks.length);

            try {
                const createResponse = await github.graphql(mutation);
                console.log('Batch create response:', createResponse);

                // Extract created issues from the response and format them
                batchTasks.forEach((_, index) => {
                    const issue = createResponse[`issue${index}`].issue;
                    createdIssues.push({
                        title: issue.title,
                        number: issue.number
                    });
                });
            } catch (error) {
                console.error('Error creating issues in batch:', error);
                // Implement retry logic or handle specific errors
            }
        }

        return createdIssues;
    } catch (error) {
        console.error('Error creating issues:', error);
        throw error;
    }
};



export const createIssue = async (github, repositoryId, title, body, labelIds) => {
    try {
        const mutation = `
            mutation CreateIssue($repositoryId: ID!, $title: String!, $body: String, $labelIds: [ID!]) {
                createIssue(input: {repositoryId: $repositoryId, title: $title, body: $body, labelIds: $labelIds}) {
                    issue {
                        number
                        title
                    }
                }
            }
        `;
        const variables = {
            repositoryId,
            title,
            body,
            labelIds
        };

        console.log('Creating issue with variables:', variables);

        const response = await github.graphql(mutation, variables);
        console.log('Issue creation response:', response);

        return response.createIssue.issue;
    } catch (error) {
        console.error('Error creating issue:', error);
        throw error;
    }
};

export const fetchAndCacheLabels = async (github, repositoryId) => {
    try {
        const query = `
            query GetLabels($repositoryId: ID!) {
                node(id: $repositoryId) {
                    ... on Repository {
                        labels(first: 100) {
                            nodes {
                                id
                                name
                            }
                        }
                    }
                }
            }
        `;
        const variables = { repositoryId };
    
        const response = await github.graphql(query, variables);
        const labelCache = {};
    
        response.node.labels.nodes.forEach(label => {
            labelCache[label.name] = label.id;
        });
    
        return labelCache;
    } catch (error) {
        console.error('Error retrieving labels:', error);
        throw error;
    }
};


export const createLabel = async (github, repositoryId, labelName, labelColor = 'FFFFFF') => {
    try {
        const createLabelMutation = `
            mutation CreateLabel($repositoryId: ID!, $name: String!, $color: String!) {
                createLabel(input: {repositoryId: $repositoryId, name: $name, color: $color}) {
                    label {
                        id
                        name
                    }
                }
            }
        `;
        console.log('CREATING LABEL');
        
        const response = await github.graphql(createLabelMutation, {
            repositoryId,
            name: labelName,
            color: labelColor
        });

        console.log('Label created:', response.createLabel.label);
        return response.createLabel.label.id;
    } catch (error) {
        console.error('Error creating or retrieving label:', error);
        throw error;
    }
};

export const updateIssue = async (github, issueId, updateData) => {
    try {
        const mutation = `
            mutation UpdateIssue($issueId: ID!, $title: String, $body: String, $labelIds: [ID!]) {
                updateIssue(input: {id: $issueId, title: $title, body: $body, labelIds: $labelIds}) {
                    issue {
                        number
                        title
                        body
                        labels(first: 10) {
                            nodes {
                                name
                            }
                        }
                    }
                }
            }
        `;
        const variables = {
            issueId,
            ...updateData
        };

        console.log('Updating issue with variables:', variables);

        const response = await github.graphql(mutation, variables);
        console.log('Issue update response:', response);

        return response.updateIssue.issue;
    } catch (error) {
        console.error('Error updating issue:', error);
        throw error;
    }
};

export const fetchIssueNodeId = async (github, repoOwner, repoName, issueNumber) => {
    const query = `
        query GetIssueNodeId($owner: String!, $name: String!, $number: Int!) {
            repository(owner: $owner, name: $name) {
                issue(number: $number) {
                    id
                }
            }
        }
    `;
    const variables = {
        owner: repoOwner,
        name: repoName,
        number: issueNumber
    };

    const response = await github.graphql(query, variables);
    return response.repository.issue.id;
};

export const fetchRepoAndIssueNodeIds = async (github, repoOwner, repoName, issueNumbers) => {
    const query = `
        query GetRepoAndIssueNodeIds($owner: String!, $name: String!) {
            repository(owner: $owner, name: $name) {
                id
                issues(first: 100) {
                    nodes {
                        number
                        id
                    }
                }
            }
        }
    `;
    const variables = {
        owner: repoOwner,
        name: repoName
    };

    const response = await github.graphql(query, variables);
    const repositoryId = response.repository.id;
    const issueNodeIds = response.repository.issues.nodes
        .filter(issue => issueNumbers.includes(issue.number))
        .map(issue => ({
            number: issue.number,
            id: issue.id
        }));

    return {
        repositoryId,
        issueNodeIds
    };
};

export const updateIssues = async (github, updatedTasks) => {
    try {
        // Construct the mutation string dynamically
        const mutationParts = updatedTasks.map((task, index) => `
            issue${index}: updateIssue(input: {id: "${task.issueNodeId}", title: "${task.title}", body: "${task.description}", labelIds: ${JSON.stringify(task.labelIds)}}) {
                issue {
                    number
                    title
                    body
                    labels(first: 10) {
                        nodes {
                            name
                        }
                    }
                }
            }
        `);

        const mutation = `
            mutation {
                ${mutationParts.join('\n')}
            }
        `;

        console.log('Executing bulk update mutation:', mutation);

        const updateResponse = await github.graphql(mutation);
        console.log('Bulk update response:', updateResponse);

        // Extract updated issues from the response
        const updatedIssues = updatedTasks.map((_, index) => updateResponse[`issue${index}`].issue);
        return updatedIssues;
    } catch (error) {
        console.error('Error updating issues:', error);
        throw error;
    }
};
