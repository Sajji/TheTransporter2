const axios = require('axios');
const fs = require('fs');

// Read the configuration from config.json
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Function to perform bulk POST and PATCH using the target system configuration
async function postAttributeTypes() {
  try {
    const attributeTypesMissingFile = './systemDelta/attributeTypesBulk.json';
    const data = JSON.parse(fs.readFileSync(attributeTypesMissingFile, 'utf8'));

    // Perform bulk POST and PATCH to attributeTypes/bulk endpoint
    const endpoint = 'attributeTypes/bulk';
    const targetSystemConfig = config.targetSystem;
    const baseURL = targetSystemConfig.baseURL;
    const auth = {
      username: targetSystemConfig.username,
      password: targetSystemConfig.password,
    };

    try {
      const postResponse = await axios.post(`${baseURL}${endpoint}`, data, {
        auth: auth,
      });

      console.log(`Bulk POST response:`, postResponse.data);
    } catch (postError) {
      console.error(`Error during bulk POST:`, postError.message);
    }

    // Perform the PATCH regardless of the POST result
    const patchResponse = await axios.patch(`${baseURL}${endpoint}`, data, {
      auth: auth,
    });

    console.log(`Bulk PATCH response:`, patchResponse.data);
  } catch (error) {
    console.error(`Error during bulk operations:`, error.message);
  }
}

// Read attributeTypesMissing.json file

module.exports = postAttributeTypes;
