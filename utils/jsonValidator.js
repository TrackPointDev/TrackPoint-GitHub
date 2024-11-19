// jsonValidator.js
const axios = require('axios');
const Ajv = require('ajv');

async function validateJsonObject(jsonObject, schemaUrl) {
    try {
        // Fetch JSON schema
        const response = await axios.get(schemaUrl);
        const schema = response.data;

        // Initialize Ajv validator
        const ajv = new Ajv();
        const validate = ajv.compile(schema);

        // Validate the JSON object
        const valid = validate(jsonObject);
        if (!valid) {
            console.error('Validation errors:', validate.errors);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error during JSON validation:', error);
        return false;
    }
}

module.exports = { validateJsonObject };
