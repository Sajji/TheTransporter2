const axios = require('axios');
const fs = require('fs');

// Read the configuration from config.json
const config = JSON.parse(fs.readFileSync('../../sourceBackups/restoreConfig.json', 'utf8'));
const targetSystemConfig = config.targetSystem;
const baseURL = targetSystemConfig.baseURL;
const endpoint = 'assetTypes';

// Read the updatedAssetTypes.json file



// Function to perform PATCH request for asset types
async function patchAssetTypes() {
  const updatedAssetTypesFile = './tempFiles/updatedAssetTypes.json';
  const updatedAssetTypes = JSON.parse(fs.readFileSync(updatedAssetTypesFile, 'utf8'));
  try {
    for (const assetType of updatedAssetTypes) {
      const { id, name, parentId } = assetType;

      try {
        const patchResponse = await axios.patch(`${baseURL}${endpoint}/${id}`, {
          id,
          name,
          parentId,
        }, {
          auth: {
            username: targetSystemConfig.username,
            password: targetSystemConfig.password,
          },
        });

        console.log(`Asset type updated: ${name}`, patchResponse.status);
      } catch (error) {
        console.error(`Error updating asset type:`, error.message);
      }
    }
  } catch (error) {
    console.error(`Error during asset type update:`, error.message);
  }
}

// Call the async function to perform the PATCH requests
module.exports = patchAssetTypes;
