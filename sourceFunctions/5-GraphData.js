const fs = require('fs');
const axios = require('axios');

const sourceSystem = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const baseGraphql = sourceSystem.baseGraphql;

async function fetchGraphQLData(domainName) {
  const endpoint = sourceSystem.sourceSystem.baseGraphql;
  const username = sourceSystem.sourceSystem.username;
  const password = sourceSystem.sourceSystem.password;

  const query = `
  query {
    assets(where: { domain: { name: { eq: "${domainName}" } } }, limit: -1) {
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
  
      attributes(limit: -1) {
        id
        type {
          id
          name
        }
        ... on StringAttribute {
          stringValue
        }
        ... on BooleanAttribute {
          booleanValue
        }
        ... on NumericAttribute {
          numericValue
        }
        ... on DateAttribute {
          dateValue
        }
        ... on MultiValueAttribute {
          stringValues
        }
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

    for (const domainName of domainList) {
      console.log(domainName.name);
      const allData = [];
      const responseData = await fetchGraphQLData(domainName.name);
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

        const attributes = asset.attributes?.map(attribute => {

          const attributeType = {
            id: attribute.type.id,
            name: attribute.type.name,

          };


          return {
            assetId: asset.id,
            id: attribute.id,
            typeId: attributeType.id,
            name: attributeType.name,
            booleanValue: attribute.booleanValue,
            stringValue: attribute.stringValue,
            numericValue: attribute.numericValue,
            dateValue: attribute.dateValue,
            stringValues: attribute.stringValues
          };
        });
  
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
      const domainDataPath = `./${folderName}/assets_${domainName.name}.json`;
      const allDataOutput = JSON.stringify(allData, null, 2);

      fs.writeFileSync(domainDataPath, allDataOutput);

      console.log(`Data saved to ${domainDataPath}. Total assets: ${allData.length}`);
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = getGraphQLData;