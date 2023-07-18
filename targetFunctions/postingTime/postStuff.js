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


 // Assuming you have the assetErrors array defined globally

 async function postAssets() {
  const assetErrors = [];
  const sourceDirectory = '../readyToPOST/assetFiles';
  const endpoint = 'assets/bulk';
  const batchSize = 1000; // Number of assets in each batch
  let counter = 0;

  try {
    // Read all the file names in the source directory
    const files = await fs.promises.readdir(sourceDirectory);

    // Iterate through each file
    for (const file of files) {
      // Skip files that are not JSON
      if (!file.endsWith('.json')) {
        continue;
      }

      // Read the contents of each JSON file
      const filePath = path.join(sourceDirectory, file);
      const payload = require(filePath);

      console.log(`Posting ${payload.length} assets from ${file}...`);

      // Split the assets into batches
      const batches = [];
      for (let i = 0; i < payload.length; i += batchSize) {
        const batch = payload.slice(i, i + batchSize);
        batches.push(batch);
      }

      for (const batch of batches) {
        counter += batch.length;
        console.log(`Posting assets ${counter - batch.length + 1} to ${counter}`);

        try {
          await postData(endpoint, '../../sourceBackups/restoreConfig.json', 'targetSystem', batch);
        } catch (error) {
          console.error('POST request failed for assets:', error.response.status);
          assetErrors.push(error.response.data);
        }
      }
    }

    console.log('All assets posted successfully.');
  } catch (error) {
    console.error('Error posting assets:', error);
  }
}




async function postAttributes() {
  const attributeErrors = [];
  const sourceDirectory = '../readyToPOST/attributeFiles';
  const endpoint = 'attributes/bulk';
  const batchSize = 1000; // Number of objects in each batch
  let counter = 0;

  try {
    // Read all the file names in the source directory
    const files = await fs.promises.readdir(sourceDirectory);

    // Iterate through each file
    for (const file of files) {
      // Skip files that are not JSON
      if (!file.endsWith('.json')) {
        continue;
      }

      // Read the contents of each JSON file
      const filePath = path.join(sourceDirectory, file);
      const payload = require(filePath);

      console.log(`Posting ${payload.length} attributes from ${file}...`);

      // Split the attributes into batches
      const batches = [];
      for (let i = 0; i < payload.length; i += batchSize) {
        const batch = payload.slice(i, i + batchSize);
        batches.push(batch);
      }

      for (const batch of batches) {
        counter += batch.length;
        console.log(`Posting attributes ${counter - batch.length + 1} to ${counter}`);

        const attributePayload = batch.map(attribute => ({
          id: attribute.id,
          assetId: attribute.assetId,
          typeId: attribute.typeId,
          value: attribute.value
        }));

        try {
          await postData(endpoint, '../../sourceBackups/restoreConfig.json', 'targetSystem', attributePayload);
        } catch (error) {
          console.error('POST request failed for attributes:', error.response.status);
          attributeErrors.push(error.response.data);
        }
      }
    }

    console.log('All attributes posted successfully.');
  } catch (error) {
    console.error('Error posting attributes:', error);
  }
}



async function postRelations() {
  const relationErrors = [];
  const sourceDirectory = '../readyToPOST/relationFiles';
  const endpoint = 'relations';
  let counter = 0;

  try {
    // Read all the file names in the source directory
    const files = await fs.promises.readdir(sourceDirectory);

    // Iterate through each file
    for (const file of files) {
      // Skip files that are not JSON
      if (!file.endsWith('.json')) {
        continue;
      }

      // Read the contents of each JSON file
      const filePath = path.join(sourceDirectory, file);
      const payload = require(filePath);

      console.log(`Posting ${payload.length} relations from ${file}...`);

      for (const relation of payload) {
        counter++;
        console.log(`Posting relation ${counter}`);

        const relationPayload = {
          id: relation.id,
          sourceId: relation.sourceId,
          targetId: relation.targetId,
          typeId: relation.typeId
        };

        try {
          await postData(endpoint, '../../sourceBackups/restoreConfig.json', 'targetSystem', relationPayload);
        } catch (error) {
          console.error('POST request failed for relation:', error.response.data);
          relationErrors.push(error.response.data);
        }
      }
    }

    console.log('All relations posted successfully.');
  } catch (error) {
    console.error('Error posting relations:', error);
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