const fs = require('fs');
const path = require('path');
const lookupNewId = require('../../lookupUtils');

async function createAllAttributesFiles() {
  const sourceDirectory = '../../sourceBackups/gqlData';
  const targetDirectory = '../readyToPOST/attributeFiles';
  const mappingArrayFile = '../../operatingModelMappings/attributeTypeMappings.json';

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

      const allAttributes = [];

      // Iterate through each asset
      for (const asset of assets) {
        const assetId = asset.id;

        // Iterate through each attribute of the asset
        for (const attribute of asset.attributes) {
          const attributeType = {
            id: attribute.id,
            name: attribute.name,
            assetId: attribute.assetId,
            typeId: attribute.typeId,
            typeName: attribute.typeName,
            value: attribute.booleanValue || attribute.stringValue || attribute.numericValue || attribute.dateValue || attribute.stringValues
          };

          // Include numericValue in the value property
          if (attributeType.value === undefined && attribute.numericValue !== undefined) {
            attributeType.value = attribute.numericValue;
          }

          if (attributeType.value === undefined && attribute.booleanValue !== undefined) {
            attributeType.value = attribute.booleanValue;
          }

          allAttributes.push(attributeType);
        }
      }

      const sourceArray = allAttributes;
      const mappingArray = JSON.parse(fs.readFileSync(mappingArrayFile, 'utf8'));
      const updatedArray = await lookupNewId(sourceArray, 'typeId', mappingArray, 'targetId');

      // Generate the output file name
      const outputFileName = file;

      // Write the updated array to the target directory
      const outputFile = path.join(targetDirectory, outputFileName);
      await fs.promises.writeFile(outputFile, JSON.stringify(updatedArray, null, 2));

      console.log(`Created ${outputFile}`);
    }

    console.log('All attributes files created successfully.');
  } catch (error) {
    console.error('Error creating attributes files:', error);
  }
}

module.exports = createAllAttributesFiles;
