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
    const { repoOwner, repoName, issueTitle, issueBody, secret } = payload;

    if (secret !== process.env.SECRET_TOKEN) {
        return res.status(403).send('Forbidden');
    }

    try {
        // Use the Probot app instance to authenticate
        const github = await app.auth();
        
        // Retrieve the installation ID
        const installationId = await getInstallationId(github, repoOwner, repoName);
        if (!installationId) {
            throw new Error('Installation ID not found for the specified repository owner.');
        }
        
        app.log("HELLO ID:", installationId)

        // Authenticate as the installation
        const installationGithub = await app.auth(installationId);

        // Create an issue using the authenticated installation
        await installationGithub.issues.create({
            owner: repoOwner,
            repo: repoName,
            title: issueTitle,
            body: issueBody,
        });

        res.status(200).send('Issue created!');
    } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).send('Error creating issue');
    }
};

const getInstallationId = async (github, repoOwner, repoName) => {
    try {
        // List all installations for the authenticated app
        const installations = await github.apps.listInstallationsForAuthenticatedUser();

        // Iterate through installations to find the matching one
        for (const installation of installations.data) {
            // List repositories for each installation
            const repos = await github.apps.listReposAccessibleToInstallation({
                installation_id: installation.id
            });

            // Check if the specified repository is in the list
            for (const repo of repos.data.repositories) {
                if (repo.owner.login === repoOwner && repo.name === repoName) {
                    return installation.id;
                }
            }
        }

        // If no matching installation is found, return null or throw an error
        return null;
    } catch (error) {
        console.error('Error retrieving installation ID:', error);
        throw error;
    }
};
