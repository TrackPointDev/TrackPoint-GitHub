const { validateJsonObject } = require("../utils/jsonValidator");
const axios = require('axios');
const baseUrl = process.env.BACKEND_URL;
const customRoute = '/epic/task';

const url = baseUrl + customRoute;
//const url = "http://localhost:3000/test";

module.exports = (app) => {
    app.on("issues.opened", async (context) => {
        const { owner, repo } = context.repo();
        const issueNumber = context.payload.issue.number;
        const schemaUrl = `https://raw.githubusercontent.com/TrackPointDev/TrackPoint-json-schemas/refs/heads/main/json-schemas/task_schema.json`;

        const jsonObject = {
            "repoOwner": owner,
            "repo": repo,
            "description" : context.payload.issue.body || "",
            "issueID" : issueNumber.toString(),
            "priority" : "High",
            "story_point" : 8,
            "title" : context.payload.issue.title
        };

        const isValid = await validateJsonObject(jsonObject, schemaUrl);

        if (!isValid) {
            console.error(`Failed to validate JSON for issue #${issueNumber}`);
            return;
        }
        
        try {
            // Send the JSON object to the backend
            const response = await axios.post(url, jsonObject);
            console.info(`Successfully post data for issue #${issueNumber} to backend`, response.data);
        } catch (error) {
            console.error(`Failed to post data for issue #${issueNumber} to backend`, error);
        }
    });

    app.on("issues.edited", async (context) => {

        // Check if the event was triggered by a bot
        if (context.isBot) {
            console.info('Ignoring event triggered by a bot');
            return;
        }

        const { owner, repo } = context.repo();
        const issueNumber = context.payload.issue.number;
        const schemaUrl = `https://raw.githubusercontent.com/TrackPointDev/TrackPoint-json-schemas/refs/heads/main/json-schemas/task_schema.json`
       
        //TODO make priority and storypoint take from project
        const jsonObject = {
            "repoOwner": owner,
            "repo": repo,
            "description" : context.payload.issue.body || "",
            "issueID" : issueNumber.toString(),
            "priority" : "High",
            "story_point" : 8,
            "title" : context.payload.issue.title
        };
          
        const isValid = await validateJsonObject(jsonObject, schemaUrl);
        if (!isValid) {
            console.error(`Failed to validate JSON for issue #${issueNumber}`);
            return;
        }

        try {
            // Send the JSON object to the backend
            const response = await axios.put(url, jsonObject);
            console.info(`Successfully put data for issue #${issueNumber} to backend`, response.data);
        } catch (error) {
            console.error(`Failed to put data for issue #${issueNumber} to backend`, error);
        }
    });
};