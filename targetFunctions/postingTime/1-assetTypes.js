const axios = require('axios');
const fs = require('fs');


// Read the configuration from config.json
const config = JSON.parse(fs.readFileSync('../../sourceBackups/restoreConfig.json', 'utf8'));

// Function to perform POST using the target system configuration
async function postAssetTypes() {
  try {
    const targetSystemConfig = config.targetSystem;
    const baseURL = targetSystemConfig.baseURL;
    const sourceAssetTypesFile = '../../sourceBackups/assetTypes.json';
    const sourceAssetTypes = JSON.parse(fs.readFileSync(sourceAssetTypesFile, 'utf8'));
    const endpoint = 'assetTypes';

    for (const sourceType of sourceAssetTypes) {
      const { name, description } = sourceType;
      const parentId = '00000000-0000-0000-0000-000000031101';

      try {
        const postResponse = await axios.post(`${baseURL}${endpoint}`, {
          name,
          description,
          parentId,
        }, {
          auth: {
            username: targetSystemConfig.username,
            password: targetSystemConfig.password,
          },
        });

        console.log(`Asset type created: ${name}`, postResponse.status);
      } catch (error) {
        console.error(`Error creating asset type:`, error.message);
      }
    }
  } catch (error) {
    console.error(`Error during asset type creation:`, error.message);
  }
}

// Function to create mappings file based on asset types
async function createMappings() {
  const fetchData = require('../../getUtils');
  try {
    const mappingsFile = './tempFiles/assetTypeMapping.json';
    const targetResponse = await fetchData('assetTypes', '../../sourceBackups/restoreConfig.json' ,'targetSystem');
    const sourceData = JSON.parse(fs.readFileSync('../../sourceBackups/assetTypes.json', 'utf8'));
    const sourceAssetTypes = sourceData;
    const targetAssetTypes = targetResponse;

    // Create the mappings based on matching objects using the "name" key
    const mappings = sourceAssetTypes.map((source) => {
      const targetMatch = targetAssetTypes.find((target) => target.name === source.name);

      return {
        sourceId: source.id,
        sourceName: source.name,
        sourceDescription: source.description,
        targetId: targetMatch ? targetMatch.id : '',
        targetName: targetMatch ? targetMatch.name : '',
        targetDescription: targetMatch ? targetMatch.description : '',
      };
    });

    // Save the mappings to the file
    fs.writeFileSync(mappingsFile, JSON.stringify(mappings, null, 2));
    //console.log(mappings);
    console.log(`Asset type mappings saved to: ${mappingsFile}`);
  } catch (error) {
    console.error(`Error creating asset type mappings:`, error.message);
  }
}

async function performPatchRequests() {
    try {
      const targetSystemConfig = config.targetSystem;
      const baseURL = targetSystemConfig.baseURL;
      const assetTypesFile = '../../sourceBackups/assetTypes.json';
      const mappingsFile = './tempFiles/assetTypeMapping.json';
  
      const assetTypes = JSON.parse(fs.readFileSync(assetTypesFile, 'utf8'));
      const mappings = JSON.parse(fs.readFileSync(mappingsFile, 'utf8'));
  
      for (const assetType of assetTypes) {
        const matchingMapping = mappings.find(
          (mapping) => mapping.sourceName === assetType.name && mapping.parentName === assetType.parentName
        );
  
        if (matchingMapping) {
          const endpoint = `assetTypes/${matchingMapping.targetId}`;
  
          try {
            const patchResponse = await axios.patch(`${baseURL}${endpoint}`, assetType, {
              auth: {
                username: targetSystemConfig.username,
                password: targetSystemConfig.password,
              },
            });
  
            console.log(`Asset type patched: ${assetType.name}`);
          } catch (error) {
            console.error(`Error patching asset type:`, error.message);
          }
        }
      }
  
      console.log(`PATCH requests completed.`);
    } catch (error) {
      console.error(`Error performing PATCH requests:`, error.message);
    }
  }
  
// Call the async functions
async function addAssetTypes() {
await postAssetTypes();
await createMappings();
await performPatchRequests();
}

module.exports = addAssetTypes;
//addAssetTypes();