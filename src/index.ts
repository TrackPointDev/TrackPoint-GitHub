import { Probot } from "probot";
import express from "express";

const app = express();
const probot = new Probot();

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

probot.load((app) => {
    app.on("issues.opened", async (context) => {
        const issueComment = context.issue({
            body: "Thanks for opening this issue!",
        });
        await context.octokit.issues.createComment(issueComment);
    });

    app.on("issues.edited", async (context) => {
        const owner = context.payload.repository.owner.login;
        const repo = context.payload.repository.name;
        const issueNumber = context.payload.issue.number;

        context.log.info("Issue edited event received");
        context.log.info(`Repository: ${owner}/${repo}`);
        context.log.info(`Issue Number: ${issueNumber}`);

        try {
            const query = `
        query ($owner: String!, $repo: String!) {
          repository(owner: $owner, name: $repo) {
            projectsV2(first: 10) {
              nodes {
                title
                number
              }
            }
          }
        }
      `;
            //TODO fix any
            const result: any = await context.octokit.graphql(query, {
                owner,
                repo,
            });

            const projects = result.repository.projectsV2.nodes;
            context.log.info(`Found ${projects.length} projects in the repository`);

            if (projects.length > 0) {
                const projectTitles = projects.map((project: { title: any; }) => project.title).join(", ");
                context.log.info(`Projects: ${projectTitles}`);

                const commentBody = `This issue is part of the following projects: ${projectTitles}`;
                const issueComment = context.issue({ body: commentBody });
                await context.octokit.issues.createComment(issueComment);
            } else {
                context.log.info(`Issue #${issueNumber} is not part of any project`);
                const issueComment = context.issue({
                    body: "This issue is not part of any project.",
                });
                await context.octokit.issues.createComment(issueComment);
            }
        } catch (error) {
            context.log.error(error, "An error occurred while checking projects");
        }
    });
});

