import { validateJsonObject, extractTaskID } from "../utils/jsonValidator.js";
import axios from 'axios';

const baseUrl = process.env.BACKEND_URL;
const customRoute = '/epics/tasks';

const url = baseUrl + customRoute;
//const url = "http://localhost:3000/test";

export default (app) => {
    app.on("issues.opened", async (context) => {
        const { owner, repo } = context.repo();
        const issueNumber = context.payload.issue.number;
        const schemaUrl = `https://raw.githubusercontent.com/TrackPointDev/TrackPoint-json-schemas/refs/heads/main/json-schemas/task_schema.json`;
        
        //TODO make priority and storypoint take from project
        const taskID = extractTaskID(context.payload.issue.body);
        console.log("TaskID =" + taskID);

        const jsonObject = {
            "description" : context.payload.issue.body || "",
            "issueID" : issueNumber,
            "priority" : "High",
            "story_point" : 8,
            "taskID" : taskID,
            "title" : context.payload.issue.title,
        };
        
        const isValid = await validateJsonObject(jsonObject, schemaUrl);

        if (!isValid) {
            console.error(`Failed to validate JSON for issue #${issueNumber}`);
            return;
        };    
        
        try {
            // Send the JSON object to the backend
            const headers = {
                'Content-Type': 'application/json',
                'epicID': repo
            };
            const _url = url + "/update"
            const response = await axios.put(_url, jsonObject, {
                headers: headers
            });
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
        const schemaUrl = `https://raw.githubusercontent.com/TrackPointDev/TrackPoint-json-schemas/refs/heads/main/json-schemas/task_schema.json`;
        
        const taskID = extractTaskID(context.payload.issue.body);
        console.log("TaskID =" + taskID);
        //TODO make priority and storypoint take from project
        const jsonObject = {
            "description" : context.payload.issue.body || "",
            "issueID" : issueNumber,
            "priority" : "High",
            "story_point" : 8,
            "taskID" : taskID,
            "title" : context.payload.issue.title,
        };
          
        const isValid = await validateJsonObject(jsonObject, schemaUrl);
        if (!isValid) {
            console.error(`Failed to validate JSON for issue #${issueNumber}`);
            return;
        }

        try {
            // Send the JSON object to the backend
            const headers = {
                'Content-Type': 'application/json',
                'epicID': repo
            };

            const _url = url + "/update";
            const response = await axios.put(_url, jsonObject, {
                headers: headers
            });

            console.info(`Successfully put data for issue #${issueNumber} to backend`, response.data);
        } catch (error) {
            console.error(`Failed to put data for issue #${issueNumber} to backend`, error);
        } 
    });
};