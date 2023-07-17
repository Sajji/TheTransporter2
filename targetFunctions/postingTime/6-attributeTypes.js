const axios = require('axios');
const fs = require('fs');

async function getSourceAttributeTypes() {
  try {
    const config = JSON.parse(fs.readFileSync('../../sourceBackups/restoreConfig.json', 'utf8'));
    const sourceSystemConfig = config.sourceSystem;
    const sourceURL = `${sourceSystemConfig.baseURL}attributeTypes`;
console.log(sourceURL);
    const sourceResponse = await axios.get(sourceURL, {
      auth: {
        username: sourceSystemConfig.username,
        password: sourceSystemConfig.password,
      },
    });

    const sourceAttributeTypes = sourceResponse.data.results;
    console.log('Source System Attribute Types:', sourceAttributeTypes.length);

    return sourceAttributeTypes;
  } catch (error) {
    console.error('Error fetching attribute types from the source system:', error.message);
    throw error;
  }
}

async function getTargetAttributeTypes() {
  try {

    const config = JSON.parse(fs.readFileSync('../../sourceBackups/restoreConfig.json', 'utf8'));
    const targetSystemConfig = config.targetSystem;
    const targetURL = `${targetSystemConfig.baseURL}attributeTypes`;
console.log(targetURL);
    const targetResponse = await axios.get(targetURL, {
      auth: {
        username: targetSystemConfig.username,
        password: targetSystemConfig.password,
      },
    });

    const targetAttributeTypes = targetResponse.data.results;
    console.log('Target System Attribute Types:', targetAttributeTypes.length);

    return targetAttributeTypes;
  } catch (error) {
    console.error('Error fetching attribute types from the target system:', error.message);
    throw error;
  }
}

// Call the async functions
async function createAttributeTypesMappings() {
  try {
    //const sourceAttributeTypes = await getSourceAttributeTypes();
    const sourceAttributeTypes = JSON.parse(fs.readFileSync('../../sourceBackups/attributeTypes.json', 'utf8'));
    const targetAttributeTypes = await getTargetAttributeTypes();

    // Create mappings based on matching objects using the "name" key
    const mappings = sourceAttributeTypes.map((sourceType) => {
      const matchingTargetType = targetAttributeTypes.find((targetType) => targetType.name === sourceType.name);

      return {
        sourceId: sourceType.id,
        sourceName: sourceType.name,
        targetId: matchingTargetType ? matchingTargetType.id : '',
        targetName: matchingTargetType ? matchingTargetType.name : '',
      };
    });

    // Save the mappings to a file
    const mappingsFile = '../../operatingModelMappings/attributeTypeMappings.json';
    fs.writeFileSync(mappingsFile, JSON.stringify(mappings, null, 2));
    console.log(`Attribute Type Mappings saved to: ${mappingsFile}`);
  } catch (error) {
    console.error('Error comparing attribute types:', error.message);
  }
}

module.exports = createAttributeTypesMappings;