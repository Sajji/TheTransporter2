const fs = require('fs');
const path = require('path');
const lookupNewId = require('../../lookupUtils');

async function createAllAssetsFile() {
  const sourceDirectory = '../../sourceBackups/gqlData';
  const mappingArrayFile = '../../operatingModelMappings/assetTypeMapping.json';

  try {
    // Read all the file names in the source directory
    const files = await fs.promises.readdir(sourceDirectory);

    // Array to store all assets
    const allAssets = [];

    // Iterate through each file
    for (const file of files) {
      // Skip files that are not JSON
      if (!file.endsWith('.json')) {
        continue;
      }

      // Read the contents of each JSON file
      const filePath = path.join(sourceDirectory, file);
      const assetData = await fs.promises.readFile(filePath, 'utf8');
      const asset = JSON.parse(assetData);

      const transformedAssets = asset.map(asset => ({
        id: asset.id,
        name: asset.name,
        domainId: asset.domainId,
        typeId: asset.typeId
      }));

      allAssets.push(...transformedAssets);
    }

    const sourceArray = allAssets;
    const mappingArray = JSON.parse(fs.readFileSync(mappingArrayFile, 'utf8'));
    const updatedArray = await lookupNewId(sourceArray, 'typeId', mappingArray, 'targetId');

    const outputFile = '../readyTopost/post-allAssets.json';
    await fs.promises.writeFile(outputFile, JSON.stringify(updatedArray, null, 2));

    console.log(`Created ${outputFile}`);
    console.log('All assets data created successfully.');
  } catch (error) {
    console.error('Error creating assets data:', error);
  }
}

// Example usage:
module.exports = createAllAssetsFile;
