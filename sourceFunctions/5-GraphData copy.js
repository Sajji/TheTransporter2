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
      assets(where: { domain: { name: { eq: "${domainName}" } } }, limit: -1) 
      {
        id: id
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
          domainType: type{
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
}  }
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
      const allData = [];
      const rawData = [];
      const domainList = require('../sourceBackups/domains.json');
      const domainTypes = new Set();
      const assetTypes = new Set();
      const attributeTypes = new Set();
      const relationTypes = [];
  
      for (const domainName of domainList) {
        console.log(domainName.name);
        const responseData = await fetchGraphQLData(domainName.name);
        if (responseData) {
          
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
              tags: asset.tags,
            });
      
            domainTypes.add(JSON.stringify(asset.domain.domainType));
            assetTypes.add(JSON.stringify(asset.type));
      
            // Collect relation types in an array
            relations.forEach(relation => relationTypes.push(JSON.stringify(relation.relationType)));
            attributes.forEach(attribute => attributeTypes.add(JSON.stringify(attribute.attributeType)));
          });
        }
      }
      
  
      // const uniqueDomainTypes = Array.from(domainTypes).map(type => JSON.parse(type));
      // const uniqueAssetTypes = Array.from(assetTypes).map(type => JSON.parse(type));
      // const uniqueAttributeTypes = Array.from(attributeTypes).map(types => JSON.parse(types));
  
      // // Convert the relation types array to a set to get unique values
      // const uniqueRelationTypes = Array.from(new Set(relationTypes)).map(type => JSON.parse(type));
  
      const jsonOutput = JSON.stringify(allData, null, 2);
      fs.writeFileSync('./sourceBackups/assets.json', jsonOutput);
      console.log(`Data saved to assets.json. Total assets: ${allData.length}`);

      const rawOutput = JSON.stringify(rawData, null, 2);
      fs.writeFileSync('./sourceBackups/rawAssets.json', rawOutput);
      console.log(`Data saved to rawAssets.json. Total assets: ${rawData.length}`);
  
      //const domainTypesOutput = JSON.stringify(uniqueDomainTypes, null, 2);
      //fs.writeFileSync('./sourceBackups/domainTypes.json', domainTypesOutput);
      //console.log(`Unique domain types saved to domainTypes.json. Total types: ${uniqueDomainTypes.length}`);
  
      // const assetTypesOutput = JSON.stringify(uniqueAssetTypes, null, 2);
      // fs.writeFileSync('./sourceBackups/assetTypes.json', assetTypesOutput);
      // console.log(`Unique asset types saved to assetTypes.json. Total types: ${uniqueAssetTypes.length}`);
  
      // const attributeTypesOutput = JSON.stringify(uniqueAttributeTypes, null, 2);
      // fs.writeFileSync('./sourceBackups/attributeTypes.json', attributeTypesOutput);
      // console.log(`Unique attribute types saved to attributeTypes.json. Total types: ${uniqueAttributeTypes.length}`);
  
      // const relationTypesOutput = JSON.stringify(uniqueRelationTypes, null, 2);
      // fs.writeFileSync('./sourceBackups/relationTypes.json', relationTypesOutput);
      // console.log(`Unique relation types saved to relationTypes.json. Total types: ${uniqueRelationTypes.length}`);
    } catch (error) {
      console.error(error);
    }
  }
  
  // Call the function to start the processing
  module.exports = getGraphQLData;
  