const fs = require('fs');
const axios = require('axios');

const sourceSystem = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const baseGraphql = sourceSystem.baseGraphql;

async function fetchGraphQLData(domainName) {
  const domainList = require('../sourceBackups/domains.json');
  const endpoint = sourceSystem.sourceSystem.baseGraphql;
  const username = sourceSystem.sourceSystem.username;
  const password = sourceSystem.sourceSystem.password;

  const query = `
    query {
      assets(where: { domain: { name: { eq: "${domainName}" } } }, limit: -1) 
      {
        id: id
        name: fullName
        type: type {
          id
          name
        }
        domain {
          domainId: id
          domainName: name
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
            source{
              id
              name
            }
            role
            corole
            target{
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
            source{
              id
              name
            }
            role
            corole
            target{
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

async function processDomains() {
  try {
    const allData = [];
    const domainList = require('../sourceBackups/domains.json');
    for (const domainName of domainList) {
      console.log(domainName.name);
      const responseData = await fetchGraphQLData(domainName.name);
      if (responseData) {
        // Map the attributes to the desired structure
        const mappedData = responseData.map(asset => {
          const attributes = asset.attributes.map(attribute => {
            const value =
              attribute.stringValue ||
              attribute.booleanValue ||
              attribute.numericValue ||
              attribute.dateValue ||
              attribute.stringValues;
            return {
              attributeId: attribute.attributeId,
              typeId: attribute.type.id,
              typeName: attribute.type.name,
              typeDesc: attribute.type.description,
              typeKind: attribute.type.kind,
              typeIsInt: attribute.type.isInteger,
              typeStringType: attribute.type.stringType,
              typeAllowedValues: attribute.type.allowedValues,
              value,
            };
          });

          // Combine outgoingRelations and incomingRelations into a single array called relations
          const relations = [
            ...asset.outgoingRelations,
            ...asset.incomingRelations,
          ].map(relation => ({
            relationId: relation.id,
            typeId: relation.type.id,
            typeSourceId: relation.type.source.id,
            typeSourceName: relation.type.source.name,
            typeRole: relation.type.role,
            typeCoRole: relation.type.corole,
            typeTargetId: relation.type.target.id,
            typeTargetName: relation.type.target.name,
            sourceId: relation.source.id,
            sourceName: relation.source.fullName,
            targetId: relation.target.id,
            targetName: relation.target.fullName,
          }));

          return {
            id: asset.id,
            name: asset.name,
            domainId: asset.domain.domainId,
            domainName: asset.domain.domainName,
            typeId: asset.type.id,
            typeName: asset.type.name,
            communityId: asset.domain.parent.id,
            communityName: asset.domain.parent.name,
            attributes,
            relations,
            tags: asset.tags,
          };
        });

        allData.push(mappedData);
      }
    }

    // Flatten the array of mapped data
    const flattenedData = allData.flat();

    // Write the flattened data to assets.json
    const jsonOutput = JSON.stringify(flattenedData, null, 2);
    fs.writeFileSync('sourceBackups/assets.json', jsonOutput);
    console.log(`Data saved to assets.json. Total assets: ${flattenedData.length}`);
  } catch (error) {
    console.error(error);
  }
}

// Usage example:
//processDomains().catch(error => console.error(error));
module.exports = processDomains;