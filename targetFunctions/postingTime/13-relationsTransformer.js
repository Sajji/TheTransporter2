const fs = require('fs');
const path = require('path');
const lookupNewId = require('../../lookupUtils');

async function createAllRelationsFile() {
  const sourceDirectory = '../../sourceBackups/gqlData';
  const targetFile = '../readyTopost/post-allRelations.json';
  const mappingArrayFile = '../../operatingModelMappings/relationTypeMappings.json';

  try {
    // Read all the file names in the source directory
    const files = await fs.promises.readdir(sourceDirectory);

    const allRelations = [];

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
      for (const asset of assets) {
        const assetId = asset.id;

          for(const relation of asset.relations) {    
            const relationData = {
            id: relation.relationId,
            sourceId: relation.sourceId,
            targetId: relation.targetId,
            typeId: relation.relationType
            } 
            allRelations.push(relationData);
          };

          
    }}

    console.log(allRelations);
    const sourceArray = allRelations;
    const mappingArray = JSON.parse(fs.readFileSync(mappingArrayFile, 'utf8'));
    const updatedArray = await lookupNewId(sourceArray, 'typeId', mappingArray, 'targetId');

    // Write the updated array to the target file
    await fs.promises.writeFile(targetFile, JSON.stringify(updatedArray, null, 2));

    console.log(`Created ${targetFile}`);
    console.log('allRelations.json file created successfully.');
  } catch (error) {
    console.error('Error creating allRelations.json file:', error);
  }
}

module.exports = createAllRelationsFile;
