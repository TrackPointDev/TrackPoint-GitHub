import { validateJsonObject, extractTaskID } from "../utils/jsonValidator.js";
import axios from 'axios';

const baseUrl = process.env.BACKEND_URL;
const customRoute = '/epics/tasks';

const url = baseUrl + customRoute;
//const url = "http://localhost:3000/test";

export default (app) => {
    app.on("issues.opened", async (context) => {
        const { repo } = context.repo();
        const issueNumber = context.payload.issue.number;
        const schemaUrl = `https://raw.githubusercontent.com/TrackPointDev/TrackPoint-json-schemas/refs/heads/main/json-schemas/task_schema.json`;
        
        //TODO make priority and storypoint take from project
        const taskID = extractTaskID(context.payload.issue.body);
        console.log("TaskID =" + taskID);
        // Fetch labels for the issue
        const labels = context.payload.issue.labels;

        let priority = "Must Have";
        let storyPoint = 8;

        labels.forEach(label => {
            if (label.name.startsWith("priority:")) {
                priority = label.name.split(":")[1].trim();
            } else if (label.name.startsWith("story point:")) {
                storyPoint = parseInt(label.name.split(":")[1].trim(), 10);
            }
        });

        const jsonObject = {
            "description" : context.payload.issue.body || "",
            "issueID" : issueNumber,
            "priority" : priority,
            "story_point" : storyPoint,
            "taskID" : taskID,
            "title" : context.payload.issue.title,
        };
        console.log("---------------------------------")
        console.log(jsonObject)
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
            const _url = url + "/update";
            //const _url = "http://localhost:3000/test";
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

        // Fetch labels for the issue
        const labels = context.payload.issue.labels;

        let priority = "Must Have";
        let storyPoint = 8;

        labels.forEach(label => {
            if (label.name.startsWith("priority:")) {
                priority = label.name.split(":")[1].trim();
            } else if (label.name.startsWith("story point:")) {
                storyPoint = parseInt(label.name.split(":")[1].trim(), 10);
            }
        });

        const jsonObject = {
            "description" : context.payload.issue.body || "",
            "issueID" : issueNumber,
            "priority" : priority,
            "story_point" : storyPoint,
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