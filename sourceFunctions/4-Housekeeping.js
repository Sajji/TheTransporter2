const fs = require('fs');
const axios = require('axios');
const path = require('path');

async function fetchHousekeeping() {
  const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

  try {
    const endpoints = [
      { endpoint: 'assetTypes'},
      { endpoint: 'attributeTypes'},
      { endpoint: 'domainTypes'},
      { endpoint: 'relationTypes'}
    ];

    for (const { endpoint} of endpoints) {
      const data = await fetchData(endpoint, config);

      const endpointFileName = `./sourceBackups/${endpoint}.json`;
      fs.writeFileSync(endpointFileName, JSON.stringify(data, null, 2));
      console.log(`Filtered ${endpoint} saved to ${endpointFileName}`);

    }
  } catch (error) {
    console.error(`Error while fetching or comparing data: ${error.message}`);
  }
}

async function fetchData(endpoint, config) {
  try {
    const sourceSystemConfig = config.sourceSystem;
    const baseURL = sourceSystemConfig.baseURL;
    const auth = {
      username: sourceSystemConfig.username,
      password: sourceSystemConfig.password
    };
    let results = [];

    if (endpoint === 'relationTypes') {
      const response = await axios.get(`${baseURL}${endpoint}`, {
        auth: auth
      });

      results = response.data.results.map(relationType => ({
        id: relationType.id,
        sourceTypeId: relationType.sourceType.id,
        sourceTypeName: relationType.sourceType.name,
        targetTypeId: relationType.targetType.id,
        targetTypeName: relationType.targetType.name,
        role: relationType.role,
        coRole: relationType.coRole,
        description: relationType.description || '',
        uniqueKey: `${relationType.sourceType.name}${relationType.targetType.name}${relationType.role}${relationType.coRole}`
      }));

      console.log(`${endpoint}: Downloaded ${results.length}`);
    } else if (endpoint === 'assetTypes') {
      const response = await axios.get(`${baseURL}${endpoint}`, {
        auth: auth
      });

      results = response.data.results.map(assetType => ({
        id: assetType.id,
        name: assetType.name,
        description: assetType.description || '',
        parentId: assetType.parent.id,
        parentName: assetType.parent.name
      }));

      console.log(`${endpoint}: Downloaded ${results.length}`);
    } else if (endpoint === 'domainTypes') {
      const response = await axios.get(`${baseURL}${endpoint}`, {
        auth: auth
      });

      results = response.data.results.map(domainType => ({
        id: domainType.id,
        name: domainType.name,
        description: domainType.description || '',
        parentId: domainType.parent.id,
        parentName: domainType.parent.name
      }));

      console.log(`${endpoint}: Downloaded ${results.length}`);
    } else if (endpoint === 'attributeTypes') {
      const response = await axios.get(`${baseURL}${endpoint}`, {
        auth: auth
      });

      const resourceTypeToKind = {
        BooleanAttributeType: 'BOOLEAN',
        DateAttributeType: 'DATE',
        DateTimeAttributeType: 'DATE',
        MultiValueListAttributeType: 'MULTI_VALUE_LIST',
        NumericAttributeType: 'NUMERIC',
        ScriptAttributeType: 'SCRIPT',
        SingleValueListAttributeType: 'SINGLE_VALUE_LIST',
        StringAttributeType: 'STRING'
      };

      results = response.data.results.map(attributeType => {
        const { resourceType, ...rest } = attributeType;
        const kind = resourceTypeToKind[resourceType];
        return { kind, ...rest };
      });

      console.log(`${endpoint}: Downloaded ${results.length}`);
    }

    // Push object to exportLog.json
    const logsObject = {
      endpoint: endpoint,
      count: results.length
    };

    return results;
  } catch (error) {
    console.error(`Error while fetching ${endpoint}:`, error.message);
    throw error;
  }
}





module.exports = fetchHousekeeping;