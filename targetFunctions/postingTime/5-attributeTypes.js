const axios = require('axios');
const fs = require('fs');

async function postAttributeTypes() {
  const attributeLog = []; // Array to store the error messages

  try {
    const config = JSON.parse(fs.readFileSync('../../sourceBackups/restoreConfig.json', 'utf8'));
    const targetSystemConfig = config.targetSystem;
    const baseURL = targetSystemConfig.baseURL;
    const endpoint = 'attributeTypes';

    const attributeTypesFile = '../../sourceBackups/attributeTypes.json';
    const attributeTypesData = JSON.parse(fs.readFileSync(attributeTypesFile, 'utf8'));

    for (const attributeType of attributeTypesData) {
      const { name, description, kind, isInteger, allowedValues, stringType, statisticsEnabled } = attributeType;
      const payload = {
        name,
        description,
        kind,
        isInteger,
        allowedValues,
        stringType,
        statisticsEnabled
      };

      try {
        const response = await axios.post(`${baseURL}${endpoint}`, payload, {
          auth: {
            username: targetSystemConfig.username,
            password: targetSystemConfig.password,
          },
        });

        console.log(`Attribute type created: ${name}`, response.status);
      } catch (error) {
        //console.error(`Error creating attribute type:${payload.name}`, error.response.status, error.response.data.userMessage);
        attributeLog.push(error.response.status, error.response.data.userMessage); // Add the error message to the error log array
      }
    }
  } catch (error) {
    console.error(`Error during attribute type creation:`, error.response.status, error.response.data.userMessage);
    attributeLog.push(error.response.status, error.response.data.userMessage); // Add the error message to the error log array
  }

  // Save the error log to a file
  const attributeLogFile = './tempFiles/attributeLog.txt';
  fs.writeFileSync(attributeLogFile, attributeLog.join('\n'));
  console.log(`Attribute log saved to: ${attributeLogFile}`);
}

// Call the async function
module.exports = postAttributeTypes;
