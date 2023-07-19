const axios = require('axios');
const fs = require('fs');
const path = require('path');
const fetchData = require('../../getUtils');
// Read the configuration from config.json
const config = JSON.parse(fs.readFileSync('../../sourceBackups/restoreConfig.json', 'utf8'));
const targetSystemConfig = config.targetSystem;
const sourceSystemConfig = config.sourceSystem;

// Function to perform GET request for asset types
async function getTargetAssetTypes() {
  targetArray = [];
  try {
    const response = await fetchData('assetTypes', '../../sourceBackups/restoreConfig.json', 'targetSystem')

    targetArray.push(...response);

    console.log('Target System Asset Types:', targetArray.length);
  } catch (error) {
    console.error('Error fetching asset types from the target system:', error.message);
  }
}

async function compareAssetTypes() {
  const sourceArray = JSON.parse(fs.readFileSync('../../sourceBackups/assetTypes.json', 'utf8')); 

  try {
    const matchingAssetTypes = [];

    for (const sourceType of sourceArray) {
      const matchingTargetType = targetArray.find(targetType => targetType.name === sourceType.name);

      if (matchingTargetType) {
        const matchingAssetType = {
          sourceId: sourceType.id,
          sourceName: sourceType.name,
          sourceDescription: sourceType.description || '', // Set description to empty string if it is undefined
          targetId: matchingTargetType.id,
          targetName: matchingTargetType.name,
          targetDescription: matchingTargetType.description || '', // Set description to empty string if it is undefined
        };

        matchingAssetTypes.push(matchingAssetType);
      }
    }

    console.log('Matching Asset Types:', matchingAssetTypes.length);
    //console.log('Matching Asset Types:', matchingAssetTypes);

    // Create the directory structure if it doesn't exist
    const outputDir = '../../operatingModelMappings';
    fs.mkdirSync(outputDir, { recursive: true });

    // Save matchingAssetTypes to a file
    const outputFile = path.join(outputDir, 'assetTypeMapping.json');
    fs.writeFileSync(outputFile, JSON.stringify(matchingAssetTypes, null, 2));

    console.log(`Matching Asset Types saved to ${outputFile}`);
  } catch (error) {
    console.error('Error comparing asset types:', error.message);
  }
}

// Call the async function
async function createAssetTypeMappings() {
  await getTargetAssetTypes();
  await compareAssetTypes();
}

module.exports = createAssetTypeMappings;
