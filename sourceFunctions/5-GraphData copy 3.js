const fs = require('fs');
const path = require('path');
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
        }
    
        attributes(limit: -1) {
          attributeId: id
          type {
            id
            name
            kind
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
      const responseData = await fetchGraphQLData(domainName.name);
      if (!responseData) {
        continue; // Skip to the next domain if no response data
      }

      const combinedAssetsPath = path.join(folderName, 'combined_assets.json');
      const combinedAttributesPath = path.join(folderName, 'combined_attributes.json');
      const combinedRelationsPath = path.join(folderName, 'combined_relations.json');
      const combinedTagsPath = path.join(folderName, 'combined_tags.json');

      for (const asset of responseData) {
        const assetData = {
          id: asset.id,
          name: asset.name,
          domainId: asset.domain.id,
          domainName: asset.domain.name,
          typeId: asset.type.id,
          typeName: asset.type.name
        };

        const importAssetData = `
        "resourceType": "Asset",
        "identifier": {
          "name": "${asset.name}",
          "domain": {
            "name": "${asset.domain.name}",
            "community": {
              "name": "${asset.domain.parent.name}"
            }
          }
        },
        "type": {
          "name": "${asset.type.name}"
        }`

        const attributes = asset.attributes?.map(attribute => {
          const attributeType = {
            id: attribute.type.id,
            name: attribute.type.name
          };

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
            assetId: asset.id,
            id: attribute.id,
            typeId: attributeType.id,
            value,
          };
        });

        const relations = [
          ...asset.outgoingRelations,
          ...asset.incomingRelations,
        ].map(relation => ({
          id: relation.id,
          typeId: relation.type.id,
          sourceId: relation.source.id,
          sourceName: relation.source.fullName,
          targetId: relation.target.id,
          targetName: relation.target.fullName,
        }));

        const tags = asset.tags;

        // Append each object to its respective file
        appendObjectToFile(combinedAssetsPath, assetData);
        appendObjectsToFile(combinedAttributesPath, attributes);
        appendObjectsToFile(combinedRelationsPath, relations);
        appendObjectToFile(combinedTagsPath, tags);
      }

      console.log(`Data saved for domain: ${domainName.name}`);
    }
  } catch (error) {
    console.error(error);
  }
}

function appendObjectToFile(filePath, object) {
  try {
    const existingData = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
    const newData = existingData ? ',' + JSON.stringify(object, null, 2) : JSON.stringify([object], null, 2);
    fs.writeFileSync(filePath, existingData + newData);
    console.log(`Object appended to ${filePath}`);
  } catch (error) {
    console.error(error);
  }
}

function appendObjectsToFile(filePath, objects) {
  try {
    if (objects.length === 0) {
      return; // Skip if the array is empty
    }

    const existingData = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
    const newData = existingData ? ',' + objects.map(object => JSON.stringify(object, null, 2)).join(',') : objects.map(object => JSON.stringify(object, null, 2)).join(',');
    fs.writeFileSync(filePath, existingData + newData);
    console.log(`Objects appended to ${filePath}`);
  } catch (error) {
    console.error(error);
  }
}

module.exports = getGraphQLData;

// Call the function to start fetching and updating the JSON files
getGraphQLData('./sourceBackups/gqlData');
