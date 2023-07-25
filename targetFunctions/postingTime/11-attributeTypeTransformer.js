const fs = require('fs');

async function createAllAttributeTypesFile() {
  try {
    const assetData = await fs.promises.readFile('../../sourceBackups/consolidatedData.json', 'utf8');
    const asset = JSON.parse(assetData);

    const attributeTypesMap = new Map();

    asset.forEach(asset => {
      asset.attributes.forEach(attribute => {
        const attributeType = attribute.name;
        const attributeTypeId = attribute.typeId;

        // Add the attribute type to the map if it doesn't exist
        if (!attributeTypesMap.has(attributeTypeId)) {
          attributeTypesMap.set(attributeTypeId, {
            id: attributeType.id,
            name: attributeType.name,
            description: attributeType.description,
            kind: attributeType.kind,
            allowedValues: attributeType.allowedValues,
            stringType: attributeType.stringType,
            isInteger: attributeType.isInteger
          });
        }
      });
    });

    const attributeTypes = Array.from(attributeTypesMap.values());

    await fs.promises.writeFile('../readyToPOST/allAttributeTypes.json', JSON.stringify(attributeTypes, null, 2));

    console.log('allAttributeTypes.json file created successfully.');
  } catch (error) {
    console.error('Error creating allAttributeTypes.json file:', error);
  }
}

//createAllAttributeTypesFile();
module.exports = createAllAttributeTypesFile;