const fs = require('fs');
const path = require('path');

async function updateRelationTypesID() {
  // Read the relationTypesIDfix.json file
  const relationTypesIDFixFile = path.join('systemDelta', 'relationTypesIDfix.json');
  const relationTypesIDFixData = JSON.parse(fs.readFileSync(relationTypesIDFixFile, 'utf8'));

  // Read the relations.json file
  const relationsFile = path.join('sourceBackups', 'relations.json');
  const relationsData = JSON.parse(fs.readFileSync(relationsFile, 'utf8'));

  // Iterate through each object in relationTypesIDFixData
  for (const item of relationTypesIDFixData) {
    const { sourceId, targetId } = item;

    // Find matching relations in relationsData
    const matchingRelations = relationsData.filter(relation => relation.type.id === sourceId);

    // Update the "type.id" with the "targetId" in matching relations
    for (const relation of matchingRelations) {
      relation.type.id = targetId;
    }
  }

  // Write the updated relationsData to the relations.json file
  fs.writeFileSync(relationsFile, JSON.stringify(relationsData, null, 2));
  console.log('Relation types ID updated successfully.');
}

module.exports = updateRelationTypesID;
