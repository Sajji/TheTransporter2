const fs = require('fs');
const path = require('path');
const lookupNewId = require('../../lookupUtils');

async function createAllAssetsFiles() {
  const sourceDirectory = '../../sourceBackups/gqlData';
  const mappingArrayFile = '../../operatingModelMappings/assetTypeMapping.json';
  const targetDirectory = '../readyToPOST/assetFiles';

  try {
    // Read all the file names in the source directory
    const files = await fs.promises.readdir(sourceDirectory);

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

      const sourceArray = transformedAssets;
      const mappingArray = JSON.parse(fs.readFileSync(mappingArrayFile, 'utf8'));
      const updatedArray = await lookupNewId(sourceArray, 'typeId', mappingArray, 'targetId');

      const outputFilePath = path.join(targetDirectory, file);
      await fs.promises.writeFile(outputFilePath, JSON.stringify(updatedArray, null, 2));

      console.log(`Created ${outputFilePath}`);
    }

    console.log('All assets data files created successfully.');
  } catch (error) {
    console.error('Error creating assets data files:', error);
  }
}

module.exports = createAllAssetsFiles;
