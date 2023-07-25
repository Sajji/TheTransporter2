const fs = require('fs');
const lookupNewId = require('../../lookupUtils');

async function updateAttributeTypeIds() {
  try {
    const attributesData = await fs.promises.readFile('../../targetFunctions/readyToPOST/attributeFiles/post-allAttributes.json', 'utf8');
    const attributes = JSON.parse(attributesData);

    const allAttributes = attributes.map(attribute => {
      const { id, value, asset, type } = attribute;

      return {
        id: attribute.id,
        name: attribute.name,
        assetId: attribute.assetId,
        typeId: attribute.typeId,
        booleanValue: attribute.booleanValue,
        stringValue: attribute.stringValue,
        numericValue: attribute.numericValue,
        dateValue: attribute.dateValue,
        stringValues: attribute.stringValues
      };
    });

    const sourceArray = allAttributes;
    const mappingArrayFile = '../../operatingModelMappings/attributeTypeMappings.json';
    const mappingArray = JSON.parse(fs.readFileSync(mappingArrayFile, 'utf8'));
    const updatedArray = await lookupNewId(sourceArray, 'typeId', mappingArray, 'targetId');

    await fs.promises.writeFile('../readyToPOST/allAttributes.json', JSON.stringify(updatedArray, null, 2));

    console.log('allAttributes.json file created successfully.');
  } catch (error) {
    console.error('Error creating allAttributes.json file:', error);
  }
}

module.exports = updateAttributeTypeIds;
