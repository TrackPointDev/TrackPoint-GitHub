const { validateJsonObject } = require("../utils/jsonValidator");
const { Probot } = require('probot');

exports.submitData = async (req, res) => {
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
        return res.send('Data submitted successfully');
    } catch (error) {
        console.error('Error processing request:', error);
        return (error); // Pass the error to Express error handler
    }
};

exports.initialSetup = async (req, res, app) => {
    const payload = req.body;
    const {repoOwner, repoName, tempPW, installationID, tasks } = payload;

    if (tempPW !== process.env.TEMPPW) {
        return res.status(403).send('Forbidden');
    }

    try {
        // Use the Probot app instance to authenticate
        const github = await app.auth(installationID);
        
        const issueList = [];

        for (const task of tasks) {
            const issueTitle = `${task.title}`
            const issueBody = `${task.description}`
            // Create an issue using the authenticated installation
            const response = await github.issues.create({
                owner: repoOwner,
                repo: repoName,
                title: issueTitle,
                body: issueBody,
            });

            issueList.push({ title: issueTitle, number: response.data.number });
        }
        
        res.status(200).send(issueList);
    } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).send('Error creating issue');
    }
};
