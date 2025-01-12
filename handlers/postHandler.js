import { validateJsonObject, ensureTaskID } from "../utils/jsonValidator.js";
import * as githubUtils from '../utils/githubUtils.js';
import axios from 'axios';
const baseUrl = process.env.BACKEND_URL;
const customRoute = '/epic/tasks';
const url = baseUrl + customRoute;
const { 
    updateIssue, 
    authenticateGitHubClient, 
    fetchRepositoryId, 
    createIssues, 
    createLabel, 
    createIssue, 
    fetchRepoAndIssueNodeIds, 
    updateIssues, 
    fetchAndCacheLabels, 
    fetchIssueNodeId,
    deleteIssueByNumber,
    deleteIssues,
    deleteAllIssues
} = githubUtils;

export const test = async (req, res) => {
    const payload = req.body;
    console.log(payload)
    res.status(200).send("request received successfully")
}


export const taskCreate = async (req, res, app) => {
    // Handle the POST request data
    const payload = req.body;
    const schemaUrl = `https://raw.githubusercontent.com/TrackPointDev/TrackPoint-json-schemas/refs/heads/main/json-schemas/task_schema.json`;
    const { repoOwner, repoName, installationID, description, priority, story_point, title, taskID } = payload;
    try {
        const isValid = await validateJsonObject(payload, schemaUrl);
        if (!isValid) {
            console.error(`Failed to validate JSON for issue #${issueNumber}`);
            return res.status(400).send('Failed to validate JSON');
        }

        const github = await authenticateGitHubClient(app, installationID);
        const repositoryId = await fetchRepositoryId(github, repoOwner, repoName);
        const labelCache = await fetchAndCacheLabels(github, repositoryId); 

        const priorityLabelName = `priority:${priority}`;
        const storyPointLabelName = `story point:${story_point}`;
        if (!labelCache[priorityLabelName]) {
            labelCache[priorityLabelName] = await createLabel(github, repositoryId, priorityLabelName, 'FF0000');
        }
        if(!labelCache[storyPointLabelName]) {
            labelCache[storyPointLabelName] = await createLabel(github, repositoryId, storyPointLabelName, 'FF0000');
        }
       
        const _description = description + '\nTaskID:' + taskID
        const issue = await createIssue(github, repositoryId, title, _description, [labelCache[priorityLabelName], labelCache[storyPointLabelName]]);

        console.log(`Issue #${issue.number} created successfully.`);
        //TODO should not be called here
        const jsonObject = {
            "repoOwner": repoOwner,
            "repo": repoName,
            "description" : _description,
            "issueID" : issue.number,
            "priority" : priorityLabelName,
            "story_point" : storyPointLabelName,
            "title" : title,
            "taskID": taskID
        };
        
        const headers = {
            'Content-Type': 'application/json',
            'epicID': repoOwner
        };

        const _url = url + "/update";
        const response = await axios.put(_url, jsonObject, {
            headers: headers
        });

        console.log("axios response for taskCreate(): " + response.data);

        return res.status(200).json({ number: issue.number });
    } catch (error) {
        console.error('Error processing request:', error);
        return (error); // Pass the error to Express error handler
    }
}

export const taskUpdate = async (req, res, app) => {
    // Handle the POST request data
    const payload = req.body;
    const schemaUrl = `https://raw.githubusercontent.com/TrackPointDev/TrackPoint-json-schemas/refs/heads/main/json-schemas/task_schema.json`
    const {repoOwner, repoName, installationID, description, issueID, priority, story_point, title, taskID} = payload

    //TODO more delicate error handling
    try {
        const isValid = await validateJsonObject(payload, schemaUrl);
        if (!isValid) {
            console.error(`Failed to validate JSON for payload ${payload}`);
            return res.status(400).send('Failed to validate JSON');
        }

        const github = await authenticateGitHubClient(app, installationID);
        const issueNodeId = await fetchIssueNodeId(github, repoOwner, repoName, issueID);
        const repositoryId = await fetchRepositoryId(github, repoOwner, repoName);
        const labelCache = await fetchAndCacheLabels(github, repositoryId);

        const priorityLabelName = `priority:${priority}`;
        const storyPointLabelName = `story point:${story_point}`;

        if (!labelCache[priorityLabelName]) {
            labelCache[priorityLabelName] = await createLabel(github, repositoryId, priorityLabelName, 'FF0000');
        }
        if(!labelCache[storyPointLabelName]) {
            labelCache[storyPointLabelName] = await createLabel(github, repositoryId, storyPointLabelName, 'FF0000');
        }

        let updatedDescription = ensureTaskID(description, taskID)
        // Construct the updateData object
        const updateData = {
            title: title, 
            body: updatedDescription, 
            labelIds: [labelCache[priorityLabelName], labelCache[storyPointLabelName]]
        };

        // Update the issue with the new labels
        const updatedIssue = await updateIssue(github, issueNodeId, updateData);

        console.log(`Issue #${updatedIssue.number} updated successfully.`);
        return res.status(200).send('Issue updated successfully');
    } catch (error) {
        console.error('Error processing request:', error);
        return (error); // Pass the error to Express error handler
    }
};

export const taskDelete = async (req, res, app) => {
    const payload = req.body;
    const {repoOwner, repoName, installationID, issueID} = payload;

    try {
        const github = await authenticateGitHubClient(app, installationID);
        const repositoryId = await fetchRepositoryId(github, repoOwner, repoName);
        const response = await deleteIssueByNumber(github, repositoryId, issueID);
        console.log('Deleting issue: ' + JSON.stringify(response, null, 2))
        res.status(200).send('Issue deleted')
    } catch (error) {
        console.error('Error Deleting issues:', error);
        res.status(500).send('Error Deleting issues');
    }
}

export const epicSetup = async (req, res, app) => {
    const payload = req.body;
    const { repoOwner, repoName, secret, installationID, tasks } = payload;

    if (secret !== process.env.WEBHOOK_SECRET) {
        console.warn('Invalid secret:', secret);
        return res.status(403).send('Forbidden');
    }

    try {
        const github = await authenticateGitHubClient(app, installationID);
        const repositoryId = await fetchRepositoryId(github, repoOwner, repoName);
        const labelCache = await fetchAndCacheLabels(github, repositoryId); 

        //TODO dynamic lookup of labels
        for (const task of tasks) {
            const priorityLabelName = `priority:${task.priority}`;
            const storyPointLabelName = `story point:${task.story_point}`;
            // Check and create priority label if it doesn't exist
            if (!labelCache[priorityLabelName]) {
                labelCache[priorityLabelName] = await createLabel(github, repositoryId, priorityLabelName, 'FF0000');
            }
            if(!labelCache[storyPointLabelName]) {
                labelCache[storyPointLabelName] = await createLabel(github, repositoryId, storyPointLabelName, 'FF0000');
            }
            // Preserve the original string
            task._priorityLabelId = labelCache[priorityLabelName];
            task._storyPointLabelId = labelCache[storyPointLabelName];
            task._description = ensureTaskID(task.description, task.taskID);
        }
        // Update tasks with label IDs
        const updatedTasks = tasks.map(task => {
            return {
                ...task,
                description: task._description,
                labelIds: [
                    task._priorityLabelId,
                    task._storyPointLabelId
                ]
            };
        });
        // Create issues
        const issueList = await createIssues(github, repositoryId, updatedTasks);
        console.log('All issues created:', issueList);
        res.status(200).send(issueList);
    } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).send('Error creating issue');
    }
};

export const epicUpdate = async (req, res, app) => {
    const payload = req.body;
    const {repoOwner, repoName, secret, installationID, tasks } = payload;

    if (secret !== process.env.WEBHOOK_SECRET) {
        console.warn('Invalid secret:', secret);
        return res.status(403).send('Forbidden');
    }
    
    try {
        const github = await authenticateGitHubClient(app, installationID);
        const {repositoryId, issueNodeIds } = await fetchRepoAndIssueNodeIds(github, repoOwner, repoName, tasks.map(task => task.issueID));
        const labelCache = await fetchAndCacheLabels(github, repositoryId);
        //TODO dynamic lookup of labels
        for (const task of tasks) {
            const priorityLabelName = `priority:${task.priority}`;
            const storyPointLabelName = `story point:${task.story_point}`;
            // Check and create priority label if it doesn't exist
            if (!labelCache[priorityLabelName]) {
                labelCache[priorityLabelName] = await createLabel(github, repositoryId, priorityLabelName, 'FF0000');
            }
            if(!labelCache[storyPointLabelName]) {
                labelCache[storyPointLabelName] = await createLabel(github, repositoryId, storyPointLabelName, 'FF0000');
            }
            // Preserve the original string
            task._priority = labelCache[priorityLabelName]
            task._story_point = labelCache[storyPointLabelName]
            task._description = ensureTaskID(task.description, task.taskID);
        }

        // Update tasks with node IDs
        const updatedTasks = tasks.map(task => {
            const nodeId = issueNodeIds.find(issue => issue.number === task.issueID)?.id;
            return {
                ...task,
                issueNodeId: nodeId,
                description: task._description,
                labelIds: [
                    task._priority,
                    task._story_point
                ]
            };
        });

        const updatedIssues = await updateIssues(github, updatedTasks);
        console.log('Updated issues: ' + JSON.stringify(updatedIssues, null, 2));
        res.status(200).send(`Issues updated successfully.`);
    } catch (error) {
        console.error('Error updating issues:', error);
        res.status(500).send('Error updating issues');
    }
};

export const epicDelete = async (req, res, app) => {
    const payload = req.body;
    const {repoOwner, repoName, secret, installationID, tasks } = payload;

    if (secret !== process.env.WEBHOOK_SECRET) {
        console.warn('Invalid secret:', secret);
        return res.status(403).send('Forbidden');
    }

    try {
        const github = await authenticateGitHubClient(app, installationID);
        const {issueNodeIds } = await fetchRepoAndIssueNodeIds(github, repoOwner, repoName, tasks.map(task => task.issueID));
        // Update tasks with node IDs
        const updatedTasks = tasks.map(task => {
            const nodeId = issueNodeIds.find(issue => issue.number === task.issueID)?.id;
            return {
                ...task,
                issueNodeId: nodeId,
                labelIds: [
                    task._priority,
                    task._story_point
                ]
            };
        });

        const response = await deleteIssues(github, updatedTasks);
        res.status(200).send('Epic deleted')
    } catch (error) {
        console.error('Error Deleting issues:', error);
        res.status(500).send('Error Deleting issues');
    }
}

export const deleteAllIssuesInRepo = async (req, res, app) => {
    const payload = req.body;
    const {repoOwner, repoName, secret, installationID} = payload;

    if (secret !== process.env.WEBHOOK_SECRET) {
        console.warn('Invalid secret:', secret);
        return res.status(403).send('Forbidden');
    }

    try {
        const github = await authenticateGitHubClient(app, installationID);
        const repositoryId = await fetchRepositoryId(github, repoOwner, repoName);

        const response = await deleteAllIssues(github, repositoryId);
        console.log('Deleted all issues:', response);
        res.status(200).send('Issues deleted');
    } catch (error) {
        console.error('Error Deleting issues:', error);
        res.status(500).send('Error Deleting issues');
    }
}