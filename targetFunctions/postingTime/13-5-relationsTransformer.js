const fs = require('fs');
const lookupNewId = require('../../lookupUtils');

async function createAllRelationsFileNonGQL() {
  try {
    const relationsData = await fs.promises.readFile('../../sourceBackups/relations.json', 'utf8');
    const relations = JSON.parse(relationsData);

    const allRelations = [];

    relations.forEach(relation => {
        const { id, source, target, type } = relation;
        allRelations.push({
          id,
          sourceId: source.id,
          targetId: target.id,
          typeId: type.id
        });
      });

    const sourceArray = allRelations;
    const mappingArrayFile = '../../operatingModelMappings/assetTypeMapping.json';
    const mappingArray = JSON.parse(fs.readFileSync(mappingArrayFile, 'utf8'));
    const updatedArray = await lookupNewId(sourceArray, 'typeId', mappingArray, 'targetId');
    await fs.promises.writeFile('../readyToPOST/allRelations.json', JSON.stringify(updatedArray, null, 2));

    console.log('allRelations.json file created successfully.');
  } catch (error) {
    console.error('Error creating allRelations.json file:', error);
  }
}

//createAllRelationsFile();
module.exports = createAllRelationsFileNonGQL;