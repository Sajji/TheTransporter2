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
        type: type {
          id
          name
          publicId
          parent {
            id
            name
            publicId
          }
        }
        domain {
          id
          name
          domainId: id
          domainName: name
          domainType: type {
            id
            publicId
            name
            description
            parent {
              id
              name
              description
              publicId
            }
          }
          parent {
            id
            name
          }
        }
        attributes(limit: -1) {
          attributeId: id
          type {
            id
            name
            description
            kind
            isInteger
            stringType
            allowedValues
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
            description
            source {
              id
              name
            }
            role
            corole
            target {
              id
              name
            }
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
            description
            source {
              id
              name
            }
            role
            corole
            target {
              id
              name
            }
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

async function getGraphQLData() {
  try {
    const domainList = require('../sourceBackups/domains.json');

    for (const domainName of domainList) {
      console.log(domainName.name);
      const allData = [];
      const rawData = [];

      const responseData = await fetchGraphQLData(domainName.name);
      if (!responseData) {
        continue; // Skip to the next domain if no response data
      }

      responseData.forEach(asset => {
        rawData.push(asset);
        const attributes = asset.attributes?.map(attribute => {
          const attributeType = {
            id: attribute.type.id,
            name: attribute.type.name,
            description: attribute.type.description,
            kind: attribute.type.kind,
            isInt: attribute.type.isInteger,
            stringType: attribute.type.stringType,
          };
  
          if (attribute.type.allowedValues.length > 0) {
            attributeType.allowedValues = attribute.type.allowedValues;
          }
  
          let value;
          if (attribute.type.kind === 'BOOLEAN') {
            value = attribute.booleanValue;
          } else if (attribute.type.kind === 'STRING') {
            value = attribute.stringValue;
          } else if (attribute.type.kind === 'NUMERIC') {
            value = attribute.numericValue;
          } else if (attribute.type.kind === 'DATE') {
            value = attribute.dateValue;
          } else if (attribute.type.kind === 'MULTI_VALUE') {
            value = attribute.stringValues;
          } else if (attribute.type.kind === 'SINGLE_VALUE_LIST') {
            value = attribute.stringValue;
          }
  
          return {
            attributeId: attribute.attributeId,
            attributeType,
            value,
          };
        });
  
        const relations = [
          ...asset.outgoingRelations,
          ...asset.incomingRelations,
        ].map(relation => ({
          relationId: relation.id,
          relationType: {
            id: relation.type.id,
            sourceId: relation.type.source.id,
            sourceName: relation.type.source.name,
            role: relation.type.role,
            coRole: relation.type.corole,
            targetId: relation.type.target.id,
            targetName: relation.type.target.name,
          },
          sourceId: relation.source.id,
          sourceName: relation.source.fullName,
          targetId: relation.target.id,
          targetName: relation.target.fullName,
        }));
  
        allData.push({
          id: asset.id,
          name: asset.name,
          domainId: asset.domain.domainId,
          domainName: asset.domain.domainName,
          domainType: {
            id: asset.domain.domainType.id,
            name: asset.domain.domainType.name,
            description: asset.domain.domainType.description,
            publicId: asset.domain.domainType.publicId,
            parentId: asset.domain.domainType.parent.id,
            parentName: asset.domain.domainType.parent.name,
            parentDescription: asset.domain.domainType.parent.description,
          },
          assetType: {
            id: asset.type.id,
            name: asset.type.name,
            description: asset.type.description,
            publicId: asset.type.publicId,
            parentId: asset.type.parent.id,
            parentName: asset.type.parent.name,
          },
          communityId: asset.domain.parent.id,
          communityName: asset.domain.parent.name,
          attributes,
          relations,
          tags: asset.tags,});
        // // Process the asset data and push to allData and rawData arrays
        // // ...

        // // Release memory for the processed asset
        // asset.attributes = null;
        // asset.outgoingRelations = null;
        // asset.incomingRelations = null;
        // asset.tags = null;
      });

      // Write the data to separate files for each domain
      const domainDataPath = `./sourceBackups/gqlAssets/assets_${domainName.name}.json`;
      const rawDataPath = `./sourceBackups/gqlAssets/rawAssets_${domainName.name}.json`;
      const allDataOutput = JSON.stringify(allData, null, 2);
      const rawDataOutput = JSON.stringify(rawData, null, 2);

      fs.writeFileSync(domainDataPath, allDataOutput);
      fs.writeFileSync(rawDataPath, rawDataOutput);

      console.log(`Data saved to ${domainDataPath}. Total assets: ${allData.length}`);
      console.log(`Raw data saved to ${rawDataPath}. Total assets: ${rawData.length}`);
    }
  } catch (error) {
    console.error(error);
  }
}

// Call the function to start the processing
//getGraphQLData();
module.exports = getGraphQLData;