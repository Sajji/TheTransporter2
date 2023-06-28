const fs = require('fs');
const path = require('path');

async function updateAttributeTypesID() {
  // Read the attributeTypesIDfix.json file
  const attributeTypesIDFixFile = path.join('systemDelta', 'attributeTypesIDfix.json');
  const attributeTypesIDFixData = JSON.parse(fs.readFileSync(attributeTypesIDFixFile, 'utf8'));

  // Read the attributes.json file
  const attributesFile = path.join('sourceBackups', 'attributes.json');
  const attributesData = JSON.parse(fs.readFileSync(attributesFile, 'utf8'));

  // Iterate through each object in attributeTypesIDFixData
  for (const item of attributeTypesIDFixData) {
    const { sourceId, targetId } = item;

    // Find matching attributes in attributesData
    const matchingAttributes = attributesData.filter(attribute => attribute.type.id === sourceId);

    // Update the "type.id" with the "targetId" in matching attributes
    for (const attribute of matchingAttributes) {
      attribute.type.id = targetId;
    }
  }

  // Write the updated attributesData to the attributes.json file
  fs.writeFileSync(attributesFile, JSON.stringify(attributesData, null, 2));
  console.log('Attribute types ID updated successfully.');
}

module.exports = updateAttributeTypesID;
