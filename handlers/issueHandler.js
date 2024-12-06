const { validateJsonObject } = require("../utils/jsonValidator");

module.exports = (app) => {
    app.on("issues.opened", async (context) => {
        const { owner, repo } = context.repo();
        const issueNumber = context.payload.issue.number;
        const schemaUrl = `https://raw.githubusercontent.com/TrackPointDev/TrackPoint-json-schemas/refs/heads/main/json-schemas/task_schema.json`

        //TODO make priority and storypoint take from project
        const jsonObject = {
            "comments" : "Comments on the task not on GitHub",
            "description" : context.payload.issue.body || "",
            "issueID" : issueNumber.toString(),
            "priority" : "High",
            "story_point" : 8,
            "title" : context.payload.issue.title
        };

        const isValid = await validateJsonObject(jsonObject, schemaUrl);
        if (!isValid) {
            app.log.error(`Failed to validate JSON for issue #${issueNumber}`);
            return;
        }
        
        //TODO send to backend
        try {
            const createComment = await context.octokit.issues.createComment({
                owner,
                repo,
                issue_number: issueNumber,
                body: JSON.stringify(jsonObject, null, 2)
            });
            
            app.log.info(`Issue #${issueNumber} updated`, createComment.data );
        } catch (error) {
            app.log.error(`Failed to update issue #${issueNumber}`, error);
        }
    });

    app.on("issues.edited", async (context) => {
        // Check if the event was triggered by a bot
        if (context.isBot) {
            app.log.info('Ignoring event triggered by a bot');
            return;
        }

        const { owner, repo } = context.repo();
        const issueNumber = context.payload.issue.number;
        const schemaUrl = `https://raw.githubusercontent.com/TrackPointDev/TrackPoint-json-schemas/refs/heads/main/json-schemas/task_schema.json`
       
        //TODO make priority and storypoint take from project
        const jsonObject = {
            "comments" : "Comments on the task not on GitHub",
            "description" : context.payload.issue.body || "",
            "issueID" : issueNumber.toString(),
            "priority" : "High",
            "story_point" : 8,
            "title" : context.payload.issue.title
        };

        const isValid = await validateJsonObject(jsonObject, schemaUrl);
        if (!isValid) {
            app.log.error(`Failed to validate JSON for issue #${issueNumber}`);
            return;
        }

        //TODO send to backend
        try {
            const createComment = await context.octokit.issues.createComment({
                owner,
                repo,
                issue_number: issueNumber,
                body: JSON.stringify(jsonObject, null, 2)
            });
            
            app.log.info(`Issue #${issueNumber} updated`, createComment.data );
        } catch (error) {
            app.log.error(`Failed to update issue #${issueNumber}`, error);
        }
    });


};