const fs = require('fs');
const postData = require('../../postUtils');
const fetchData = require('../../getUtils');
const { createMappingArray } = require('../../mappingUtils.js');

async function updateRelationTypes() {
  try {
    const relationTypesFile = '../../sourceBackups/relationTypes.json';
    const mappingFile = '../../operatingModelMappings/assetTypeMapping.json';

    const relationTypes = JSON.parse(fs.readFileSync(relationTypesFile, 'utf8'));
    const mappings = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));

    const updatedRelationTypes = relationTypes.map((relationType) => {
      const matchingMapping = mappings.find(
        (mapping) => mapping.sourceName === relationType.sourceTypeName
      );

      if (matchingMapping) {
        relationType.sourceTypeId = matchingMapping.targetId;
      }

      const matchingTargetMapping = mappings.find(
        (mapping) => mapping.sourceName === relationType.targetTypeName
      );

      if (matchingTargetMapping) {
        relationType.targetTypeId = matchingTargetMapping.targetId;
      }

      return relationType;
    });

    const updatedRelationTypesFile = './tempFiles/updatedRelationTypes.json';
    fs.writeFileSync(updatedRelationTypesFile, JSON.stringify(updatedRelationTypes, null, 2));

    console.log(`Updated relation types saved to: ${updatedRelationTypesFile}`);
  } catch (error) {
    console.error('Error updating relation types:', error.message);
  }
}



async function postRelationTypes() {
  const relationTypesFile = './tempFiles/updatedRelationTypes.json';
  const endpoint = 'relationTypes';
  const configFile = '../../sourceBackups/restoreConfig.json';
  const sys = 'targetSystem';

  const relationTypes = JSON.parse(fs.readFileSync(relationTypesFile, 'utf8'));
  for (const relationType of relationTypes) {
    const { id, sourceTypeId, targetTypeId, role, coRole } = relationType;
    const payload = {
      sourceTypeId,
      targetTypeId,
      role,
      coRole
    };
    try {
      const resp = await postData(endpoint, configFile, sys, payload);
      console.log(`POST request successful for ${endpoint}:`, resp.data);
    } catch (error) {
      console.error(`Error while performing POST request for ${endpoint}:`, error.message);
    }
  }
}

async function getRelationTypesList() {
  try {
      const relationTypeIdFile = './tempFiles/newRelationTypeIds.json';
      const targetResponse = await fetchData('relationTypes', '../../sourceBackups/restoreConfig.json' ,'targetSystem');
      const relationIds = targetResponse.map((relation) => {
          return {
              id: relation.id,
              sourceTypeId: relation.sourceType.id,
              targetTypeId: relation.targetType.id,
              role: relation.role,
              coRole: relation.coRole,
              description: relation.description || '',
              uniqueKey: `${relation.sourceType.name}${relation.targetType.name}${relation.role}${relation.coRole}`
          }
      })
      fs.writeFileSync(relationTypeIdFile, JSON.stringify(relationIds, null, 2));
  }
  catch (error) {
      console.error(`Error getting relation type ids:`, error.message);
  }
}

async function createRelationTypeMappings() {
  const { createMappingArray } = require('../../mappingUtils.js');
  try {
    const sourceRelationTypes = JSON.parse(fs.readFileSync('../../sourceBackups/relationTypes.json', 'utf8'));
    const targetRelationTypes = JSON.parse(fs.readFileSync('./tempFiles/newRelationTypeIds.json', 'utf8'));

    const mappings = await createMappingArray(
      sourceRelationTypes,
      targetRelationTypes,
      'uniqueKey',
      {
        sourceId: 'id',
        sourceName: 'uniqueKey',
        targetId: 'id',
        targetName: 'uniqueKey',
      }
    );

    const mappingsFile = '../../operatingModelMappings/relationTypeMappings.json';
    fs.writeFileSync(mappingsFile, JSON.stringify(mappings, null, 2));
    console.log(`Relation type mappings saved to: ${mappingsFile}`);
  } catch (error) {
    console.error('Error creating relation type mappings:', error.message);
  }
}

async function addRelationTypes() {

await updateRelationTypes();
await postRelationTypes();
await getRelationTypesList();
await createRelationTypeMappings();

}

module.exports = addRelationTypes;
