import axios from 'axios';
import Ajv from 'ajv';

export const validateJsonObject = async(jsonObject, schemaUrl) => {
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

export function extractTaskID(str) {
    // Define the regular expression pattern
    const regex = /TaskID:(\d+)/;
    
    // Use match to find the pattern in the string
    const match = str.match(regex);
    
    // If a match is found, return the first capturing group (the digits)
    if (match) {
        return match[1];
    } else {
        // Return null or an appropriate message if no match is found
        return null;
    }
}

export function ensureTaskID(description, taskID) {
    let _description = description;
    if (extractTaskID(description) === null) {
        _description = `${description}\nTaskID:${taskID}`;
    }
    return _description;
}