const axios = require('axios');
const fs = require('fs');


// Read the configuration from config.json
const config = JSON.parse(fs.readFileSync('../../sourceBackups/restoreConfig.json', 'utf8'));

// Function to perform POST using the target system configuration
async function postDomainTypes() {
  try {
    const targetSystemConfig = config.targetSystem;
    const baseURL = targetSystemConfig.baseURL;
    const sourceDomainTypesFile = '../../sourceBackups/domainTypes.json';
    const sourceDomainTypes = JSON.parse(fs.readFileSync(sourceDomainTypesFile, 'utf8'));
    const endpoint = 'domainTypes';

    for (const sourceType of sourceDomainTypes) {
      const { name, description } = sourceType;
      const parentId = '00000000-0000-0000-0000-000000030002';

      try {
        
        const postResponse = await axios.post(`${baseURL}${endpoint}`, {
          name,
          description,
          parentId,
        }, {
          auth: {
            username: targetSystemConfig.username,
            password: targetSystemConfig.password,
          },
        });

        console.log(`Domain type created:`, postResponse.data);
      } catch (error) {
        console.error(`Error creating domain type:`, error.message);
      }
    }
  } catch (error) {
    console.error(`Error during domain type creation:`, error.message);
  }
}

async function getDomainIds() {
    const fetchData = require('../../getUtils');
    try {
        const domainTypeIdFile = './tempFiles/domainTypeIds.json';
        const targetResponse = await fetchData('domainTypes', '../../sourceBackups/restoreConfig.json' ,'targetSystem');
        const domainIds = targetResponse.map((domain) => {
            return {
                id: domain.id,
                name: domain.name,
            }
        })
        fs.writeFileSync(domainTypeIdFile, JSON.stringify(domainIds, null, 2));
    }
    catch (error) {
        console.error(`Error getting domain type ids:`, error.message);
    }
}

async function updateDomainTypes() {
    try {
      const sourceDomainTypesFile = '../../sourceBackups/domainTypes.json';
      const domainTypeIdsFile = './tempFiles/domainTypeIds.json';
      const updatedDomainTypesFile = './tempFiles/updatedDomainTypes.json';
  
      const sourceDomainTypes = JSON.parse(fs.readFileSync(sourceDomainTypesFile, 'utf8'));
      const domainTypeIds = JSON.parse(fs.readFileSync(domainTypeIdsFile, 'utf8'));
  
      const updatedDomainTypes = sourceDomainTypes.map((domainType) => {
        const matchingId = domainTypeIds.find((item) => item.name === domainType.name);
        const matchingParentId = domainTypeIds.find((item) => item.name === domainType.parentName);
  
        if (matchingId) {
          domainType.id = matchingId.id;
        }
  
        if (matchingParentId) {
          domainType.parentId = matchingParentId.id;
        }
  
        return domainType;
      });
  
      fs.writeFileSync(updatedDomainTypesFile, JSON.stringify(updatedDomainTypes, null, 2));
      console.log(`Updated domain types saved to: ${updatedDomainTypesFile}`);
    } catch (error) {
      console.error('Error updating domain types:', error.message);
    }
  }
  
  async function performPatchRequests() {
    try {
      const targetSystemConfig = config.targetSystem;
      const baseURL = targetSystemConfig.baseURL;
      const domainTypesFile = './tempFiles/updatedDomainTypes.json';
  
      const domainTypes = JSON.parse(fs.readFileSync(domainTypesFile, 'utf8'));

  
      for (const domainType of domainTypes) {
          const endpoint = `domainTypes/${domainType.id}`;
  
          try {
            const patchResponse = await axios.patch(`${baseURL}${endpoint}`, domainType, {
              auth: {
                username: targetSystemConfig.username,
                password: targetSystemConfig.password,
              },
            });
  
            console.log(`Domain type patched:`, patchResponse.data);
          } catch (error) {
            console.error(`Error patching domain type:`, error.message);
          }
      }
  
      console.log(`PATCH requests completed.`);
    } catch (error) {
      console.error(`Error performing PATCH requests:`, error.message);
    }
  }
  async function compareDomainTypes() {
    try {
      //const sourceDomainTypes = await getSourceDomainTypes();
      const sourceDomainTypes = JSON.parse(fs.readFileSync('../../sourceBackups/domainTypes.json', 'utf8'));
      const targetDomainTypes = JSON.parse(fs.readFileSync('./tmpFiles/updatedDomainTypes.json', 'utf8'));
  
      // Create mappings based on matching objects using the "name" key
      const mappings = sourceDomainTypes.map((sourceType) => {
        const matchingTargetType = targetDomainTypes.find((targetType) => targetType.name === sourceType.name);
  
        return {
          sourceId: sourceType.id,
          sourceName: sourceType.name,
          targetId: matchingTargetType ? matchingTargetType.id : '',
          targetName: matchingTargetType ? matchingTargetType.name : '',
        };
      });
  
      // Save the mappings to a file
      const mappingsFile = '../../operatingModelMappings/domainTypeMappings.json';
      fs.writeFileSync(mappingsFile, JSON.stringify(mappings, null, 2));
      console.log(`Attribute Type Mappings saved to: ${mappingsFile}`);
    } catch (error) {
      console.error('Error comparing attribute types:', error.message);
    }
  }

  async function createDomainTypeMappings() {
    const { createMappingArray } = require('../../mappingUtils.js');
    try {
      const sourceDomainTypes = JSON.parse(fs.readFileSync('../../sourceBackups/domainTypes.json', 'utf8'));
      const targetDomainTypes = JSON.parse(fs.readFileSync('./tempFiles/updatedDomainTypes.json', 'utf8'));
  
      const mappings = await createMappingArray(
        sourceDomainTypes,
        targetDomainTypes,
        'name',
        {
          sourceId: 'id',
          sourceName: 'name',
          targetId: 'id',
          targetName: 'name',
        }
      );
  
      const mappingsFile = '../../operatingModelMappings/domainTypeMappings.json';
      fs.writeFileSync(mappingsFile, JSON.stringify(mappings, null, 2));
      console.log(`Domain type mappings saved to: ${mappingsFile}`);
    } catch (error) {
      console.error('Error creating domain type mappings:', error.message);
    }
  }
// Call the async functions
async function addDomainTypes() {
await postDomainTypes();
await getDomainIds();
await updateDomainTypes();
await performPatchRequests();
await createDomainTypeMappings();
}

module.exports = addDomainTypes;
