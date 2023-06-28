const axios = require('axios');
const fs = require('fs');

// Read the configuration from config.json
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Function to perform bulk POST and PATCH using the target system configuration
async function postDomainTypes() {
  try {
    const domainTypesMissingFile = './systemDelta/domainTypesMissing.json';
    const data = JSON.parse(fs.readFileSync(domainTypesMissingFile, 'utf8'));

    // Perform bulk POST and PATCH to domainTypes/bulk endpoint
    const endpoint = 'domainTypes/bulk';
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

// Read domainTypesMissing.json file

module.exports = postDomainTypes;
