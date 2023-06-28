const axios = require('axios');
const fs = require('fs');

// Read the configuration from config.json
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// Function to perform bulk POST and PATCH using the target system configuration
async function postAssetTypes() {
  try {
    const targetSystemConfig = config.targetSystem;
    const baseURL = targetSystemConfig.baseURL;
    const assetTypesMissingFile = './systemDelta/assetTypesMissing.json';
    const data = JSON.parse(fs.readFileSync(assetTypesMissingFile, 'utf8'));
    const endpoint = 'assetTypes/bulk';
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

// Read assetTypesMissing.json file
// const assetTypesMissingFile = '../systemDelta/assetTypesMissing.json';
// const assetTypesMissingData = JSON.parse(fs.readFileSync(assetTypesMissingFile, 'utf8'));

// // Perform bulk POST and PATCH to assetTypes/bulk endpoint
// const endpoint = 'assetTypes/bulk';
module.exports = postAssetTypes;
