const postData = require('../../postUtils.js');
const putData = require('../../putUtils.js');

const domainErrors = [];
const assetErrors = [];
const attributeErrors = [];
const relationErrors = [];

async function postDomains() {
    console.log('Posting domains...')
    const domainsFilePath = '../readyToPOST/post-allDomains.json';
    const domainsData = require(domainsFilePath);
    
    for (const domain of domainsData) {
        const endpoint = `domains`;
        const payload = {
        id: domain.id,
        name: domain.name,
        typeId: domain.typeId,
        communityId: domain.communityId,
        description: domain.description
        };
    
        try {
        await postData(endpoint, '../../sourceBackups/restoreConfig.json', 'targetSystem', payload);
        } catch (error) {
          console.error(`POST request failed for domain '${domain.name}':`, error.response.status);
          domainErrors.push(error.response.data);
        }
    }
}
async function postAssets() {
    
    const assetsFilePath = '../readyToPOST/post-allAssets.json';
    const payload = require(assetsFilePath);  
    console.log(`Posting ${payload.length} assets...`)
    const endpoint = `assets/bulk`;
    try {
        await postData(endpoint, '../../sourceBackups/restoreConfig.json', 'targetSystem', payload);
        } catch (error) {
          console.error(`POST request failed for asset`, error.response.status);
          assetErrors.push(error.response.data);
        }

}

async function postAttributes() {
  console.log('Posting attributes...')
  const attributesFilePath = '../readyToPOST/post-allAttributes.json';
  const attributes = require(attributesFilePath);
  const batchSize = 1000; // Number of objects in each batch
  let counter = 0;

  // Split the attributes into batches
  const batches = [];
  for (let i = 0; i < attributes.length; i += batchSize) {
    const batch = attributes.slice(i, i + batchSize);
    batches.push(batch);
  }

  for (const batch of batches) {
    counter += batch.length;
    console.log(`Posting attributes ${counter - batch.length + 1} to ${counter}`);

    const endpoint = 'attributes/bulk';
    const payload = batch.map(attribute => ({
      id: attribute.id,
      assetId: attribute.assetId,
      typeId: attribute.typeId,
      value: attribute.value
    }));

    try {
      await postData(endpoint, '../../sourceBackups/restoreConfig.json', 'targetSystem', payload);
    } catch (error) {
      attributeErrors.push(error.response.data);
    }
  }
}


async function postRelations() {
    console.log('Posting relations...')
    const relationsFilePath = '../readyToPOST/post-allRelations.json';
    const relationsData = require(relationsFilePath);
    
    for (const relation of relationsData) {
        const endpoint = `relations`;
        const payload = {
            id: relation.id,
            sourceId: relation.sourceId,
            targetId: relation.targetId,
            typeId: relation.typeId
        }; 
        try {
        await postData(endpoint, '../../sourceBackups/restoreConfig.json', 'targetSystem', payload);
        } catch (error) {
    console.error(`POST request failed for relation ':`, error.response.data);
    relationErrors.push(error.response.data);
        }
      }
}

async function postTags() {
  const tagsFilePath = '../readyToPOST/post-allTags.json';
  const tagsData = require(tagsFilePath);
  const configFile = '../../sourceBackups/restoreConfig.json';
  const sys = 'targetSystem';
  const endpoint = 'assets/{assetId}/tags';

  try {
    for (const tag of tagsData) {
      const { assetId, tagNames } = tag;
      const payload = { tagNames };
      const response = await postData(endpoint.replace('{assetId}', assetId), configFile, sys, payload);
      console.log(`POST request successful for asset ${assetId}:`, response);
    }
  } catch (error) {
    console.error('Error while posting tags:', error);
  }
}

async function putTags() {
  const tagsFilePath = '../readyToPOST/post-allTags.json';
  const tagsData = require(tagsFilePath);
  const configFile = '../../sourceBackups/restoreConfig.json';
  const sys = 'targetSystem';
  const endpoint = 'assets/{assetId}/tags';

  try {
    for (const tag of tagsData) {
      const { assetId, tagNames } = tag;
      const payload = { tagNames };
      const response = await putData(endpoint.replace('{assetId}', assetId), configFile, sys, payload);
      console.log(`PUT request successful for asset ${assetId}:`, response);
    }
  } catch (error) {
    console.error('Error while posting tags:', error);
  }
}
async function postAll() {
    await postDomains();
    await postAssets();
    await postAttributes();
    await postRelations();
    await postTags();
    await putTags();
}

module.exports = postAll;