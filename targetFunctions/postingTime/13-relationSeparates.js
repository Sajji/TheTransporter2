const fs = require('fs');
const path = require('path');
const lookupNewId = require('../../lookupUtils');

async function createAllRelationsFiles() {
  const sourceDirectory = '../../sourceBackups/gqlData';
  const targetDirectory = '../readyTopost/relationFiles';
  const mappingArrayFile = '../../operatingModelMappings/relationTypeMappings.json';

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
      const assets = JSON.parse(assetData);

      const allRelations = [];

      // Iterate through each asset
      for (const asset of assets) {
        const assetId = asset.id;

        // Iterate through each relation of the asset
        for (const relation of asset.relations) {
          const relationData = {
            id: relation.relationId,
            sourceId: relation.sourceId,
            targetId: relation.targetId,
            typeId: relation.relationType
          };

          allRelations.push(relationData);
        }
      }

      const sourceArray = allRelations;
      const mappingArray = JSON.parse(fs.readFileSync(mappingArrayFile, 'utf8'));
      const updatedArray = await lookupNewId(sourceArray, 'typeId', mappingArray, 'targetId');

      // Generate the output file name
      const outputFileName = file;

      // Write the updated array to the target directory
      const outputFile = path.join(targetDirectory, outputFileName);
      await fs.promises.writeFile(outputFile, JSON.stringify(updatedArray, null, 2));

      console.log(`Created ${outputFile}`);
    }

    console.log('All relations files created successfully.');
  } catch (error) {
    console.error('Error creating relations files:', error);
  }
}

module.exports = createAllRelationsFiles;
