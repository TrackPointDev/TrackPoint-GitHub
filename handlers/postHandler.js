const { validateJsonObject } = require("../utils/jsonValidator");

exports.test = async (req, res, app) => {
    const payload = req.body;
    console.log(payload)
    res.status(200).send("request received successfully")
}

exports.taskCreate = async (req, res, app) => {
    // Handle the POST request data
    const payload = req.body;
    const schemaUrl = `https://raw.githubusercontent.com/TrackPointDev/TrackPoint-json-schemas/refs/heads/main/json-schemas/task_schema.json`
    console.log('Recieved payload', payload)
    
    try {
        const isValid = await validateJsonObject(payload, schemaUrl);
        if (!isValid) {
            console.error(`Failed to validate JSON for issue #${issueNumber}`);
            return res.status(400).send('Failed to validate JSON');
        }

        const {repoOwner, repoName, installationID, description, issueID, priority, story_point, title} = payload
        const github = await app.auth(installationID)

        const response = await github.issues.create({
            owner: repoOwner,
            repo: repoName,
            title: title,
            body: description,
            labels: ['priority:' + priority, 'story point:' + story_point]
        });

        if (response.status === 201) {
            const issueID = response.data.number;
            console.log(`Issue #${issueID} created successfully.`);
            return res.json({ number: issueID });
        } else {
            console.error('Failed to create issue:', response);
            return res.status(response.status).send('Failed to create issue');
        }

    } catch (error) {
        console.error('Error processing request:', error);
        return (error); // Pass the error to Express error handler
    }
}

exports.taskUpdate = async (req, res, app) => {
    // Handle the POST request data
    const payload = req.body;
    const schemaUrl = `https://raw.githubusercontent.com/TrackPointDev/TrackPoint-json-schemas/refs/heads/main/json-schemas/task_schema.json`
    console.log('Recieved payload', payload)

    //TODO more delicate error handling
    try {
        const isValid = await validateJsonObject(payload, schemaUrl);
        if (!isValid) {
            console.error(`Failed to validate JSON for issue #${issueNumber}`);
            return res.status(400).send('Failed to validate JSON');
        }
        const {repoOwner, repoName, installationID, description, issueID, priority, story_point, title} = payload
        const github = await app.auth(installationID)

        const response = await github.issues.update({
            owner: repoOwner,
            repo: repoName,
            issue_number: issueID,
            title: title,
            body: description,
            labels: ['priority:' + priority, 'story point:' + story_point]
        });

        if (response.status === 200) {
            console.log(`Issue #${issueID} updated successfully.`);
            return res.send('Issue updated successfully');
        } else {
            console.error(`Failed to update issue #${issueID}:`, response);
            return res.status(response.status).send('Failed to update issue');
        }

    } catch (error) {
        console.error('Error processing request:', error);
        return (error); // Pass the error to Express error handler
    }
};

exports.epicSetup = async (req, res, app) => {
    const payload = req.body;
    const {repoOwner, repoName, secret, installationID, tasks } = payload;

    if (secret !== process.env.WEBHOOK_SECRET) {
        return res.status(403).send('Forbidden');
    }

    try {
        // Use the Probot app instance to authenticate
        const github = await app.auth(installationID);
        
        const issueList = [];

        for (const task of tasks) {
            const issueTitle = `${task.title}`
            const issueBody = `${task.description}`
            const priority = `${task.priority}`
            const story_point = `${task.story_point}`
            // Create an issue using the authenticated installation
            const response = await github.issues.create({
                owner: repoOwner,
                repo: repoName,
                title: issueTitle,
                body: issueBody,
                labels: ['priority:' + priority, 'story point:' + story_point]
            });

            issueList.push({ title: issueTitle, number: response.data.number });
        }
        
        res.status(200).send(issueList);
    } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).send('Error creating issue');
    }
};

exports.epicUpdate = async (req, res, app) => {
    const payload = req.body;
    const {repoOwner, repoName, secret, installationID, tasks } = payload;

    if (secret !== process.env.WEBHOOK_SECRET) {
        return res.status(403).send('Forbidden');
    }

    try {
        // Use the Probot app instance to authenticate
        const github = await app.auth(installationID);

        for (const task of tasks) {
            const issueTitle = `${task.title}`
            const issueBody = `${task.description}`
            const priority = `${task.priority}`
            const story_point = `${task.story_point}`
            // Update an existing issue using the authenticated installation
            const response = await github.issues.update({
                owner: repoOwner,
                repo: repoName,
                issue_number: task.issueID, // Use the existing issue ID
                title: issueTitle,
                body: issueBody,
                labels: ['priority:' + priority, 'story point:' + story_point]
            });
        }
        
        res.status(200).send(`${tasks.length} issues updated successfully.`);

    } catch (error) {
        console.error('Error updating issues:', error);
        res.status(500).send('Error updating issues');
    }
};