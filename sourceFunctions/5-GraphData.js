const fs = require('fs');
const axios = require('axios');

const sourceSystem = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const baseGraphql = sourceSystem.baseGraphql;

async function fetchGraphQLData(domainId) {
  const endpoint = sourceSystem.sourceSystem.baseGraphql;
  const username = sourceSystem.sourceSystem.username;
  const password = sourceSystem.sourceSystem.password;

  const query = `
  query {
    assets(
      where: { domain: { id: { eq: "${domainId}" } } }
      limit: -1
    ) {
      id
      name: fullName
      type {
        id
        name
      }
      domain {
        id
        name
        parent {
          id
          name
        }
      }
      stringAttributes(limit: -1) {
        id
        type {
          id
          name
        }
        stringValue
      }
      numericAttributes(limit: -1) {
        id
        type {
          id
          name
        }
        numericValue
      }
      multiValueAttributes(limit: -1) {
        id
        type {
          id
          name
        }
        stringValues
      }
      dateAttributes(limit: -1) {
        id
        type {
          id
          name
        }
        dateValue
      }
      booleanAttributes(limit: -1) {
        id
        type {
          id
          name
        }
        booleanValue
      }
  
      outgoingRelations(limit: -1) {
        id
        type {
          id
        }
        source {
          id
          fullName
        }
        target {
          id
          fullName
        }
      }
      incomingRelations(limit: -1) {
        id
        type {
          id
        }
        source {
          id
          fullName
        }
        target {
          id
          fullName
        }
      }
      tags(limit: -1) {
        id
        name
      }
    }
  }
  
  `;

  try {
    const response = await axios.post(endpoint, { query }, {
      auth: {
        username,
        password
      }
    });

    const responseData = response.data.data.assets;
    return responseData;
  } catch (error) {
    console.error('GraphQL request failed:', error);
    return null;
  }
}

async function getGraphQLData(folderName) {
  try {
    const domainList = require('../sourceBackups/domains.json');

    for (const domain of domainList) {
      console.log(domain.name);
      const allData = [];
      const responseData = await fetchGraphQLData(domain.id);
      if (!responseData) {
        continue; // Skip to the next domain if no response data
      }

      responseData.forEach(asset => {
        const assetData = {
          id: asset.id,
          name: asset.name,
          domainId: asset.domain.id,
          domainName: asset.domain.name,
          typeId: asset.type.id,
          typeName: asset.type.name
        };

        const processAttributes = (attributes, valueType) => {
          return attributes.map(attribute => {
            return {
              assetId: asset.id,
              id: attribute.id,
              typeId: attribute.type.id,
              name: attribute.type.name,
              [valueType]: attribute[valueType]
            };
          });
        };

        const attributes = [
          ...processAttributes(asset.stringAttributes, 'stringValue'),
          ...processAttributes(asset.numericAttributes, 'numericValue'),
          ...processAttributes(asset.multiValueAttributes, 'stringValues'),
          ...processAttributes(asset.dateAttributes, 'dateValue'),
          ...processAttributes(asset.booleanAttributes, 'booleanValue')
        ];
  
        const relations = [
          ...asset.outgoingRelations,
          ...asset.incomingRelations,
        ].map(relation => ({
          relationId: relation.id,
          relationType: relation.type.id,
          sourceId: relation.source.id,
          sourceName: relation.source.fullName,
          targetId: relation.target.id,
          targetName: relation.target.fullName,
        }));
  
        allData.push({
          ...assetData,
          attributes,
          relations,
          tags: asset.tags,});
      });

      // Write the data to separate files for each domain
      const domainDataPath = `./${folderName}/assets_${domain.name}.json`;
      const allDataOutput = JSON.stringify(allData, null, 2);

      fs.writeFileSync(domainDataPath, allDataOutput);

      console.log(`Data saved to ${domainDataPath}. Total assets: ${allData.length}`);
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = getGraphQLData;