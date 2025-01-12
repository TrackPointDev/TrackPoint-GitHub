export function helloWorld(req, res) {
    res.send('Hello World');
}

export const getTask = async (req, res, app) => {
    // Access the id parameter from the request
    const id = req.params.id;

    // For demonstration, simply send back the id
    res.send(`Task ID: ${id}`);
};