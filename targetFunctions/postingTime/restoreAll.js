const fs = require('fs');

async function gqlRestore() {

  const createFolder = require('../../makeFoldersUtils');
  await createFolder('../readyToPOST');
  await createFolder('../readyToPOST/assetFiles');
  await createFolder('../readyToPOST/attributeFiles');
  await createFolder('../readyToPOST/relationFiles');
  await createFolder('./errorFiles');
  await createFolder('./tempFiles');

  const createLandingZone = require('./landingZone.js');
  await createLandingZone();

  const updateCommunities = require('./updateCommunities.js');
  await updateCommunities();

  const postAndPatchAllCommunities = require('./a-communitiesPost.js');
  await postAndPatchAllCommunities();

  const operatingModel = require('./operatingModel.js');
  await operatingModel();

  const createAllAssetsFiles = require('./9-5assetSeparates.js');
  await createAllAssetsFiles();

  const createAllAttributesFiles = require('./10-attributeSeparates.js');
  await createAllAttributesFiles();

  const domainTransformer = require('./12-domainsTransformer.js');
  await domainTransformer();

  const createAllRelationsFiles = require('./13-relationSeparates.js');
  await createAllRelationsFiles();

  const createallTagsFile = require('./14-tags.js');
  await createallTagsFile();

  const postAll = require('./postStuff.js'); // Replace './your-module' with the actual path to your module file
  await postAll();

}

async function goNoGo () {
  const checkApi = require('./checkConfig.js');
  const checkTarget = await checkApi();
  if (checkTarget !== 0) {
    
    console.log(checkTarget)
    gqlRestore();
  } else {
    console.log('API is not reachable.');
  }
}

goNoGo();