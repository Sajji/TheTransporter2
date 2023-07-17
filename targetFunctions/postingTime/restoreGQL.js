const fs = require('fs');

async function gqlRestore() {
  const createLandingZone = require('./landingZone.js');
  await createLandingZone();

  const updateCommunities = require('./updateCommunities.js');
  await updateCommunities();

  const postAndPatchAllCommunities = require('./a-communitiesPost.js');
  await postAndPatchAllCommunities();

  const operatingModel = require('./operatingModel.js');
  await operatingModel();

  const createAllAssetsFile = require('./9-assetTransformer.js');
  await createAllAssetsFile();

  const createAllAttributesFiles = require('./10-attributesTransformer.js');
  await createAllAttributesFiles();

  const domainTransformer = require('./12-domainsTransformer.js');
  await domainTransformer();

  const createAllRelationsFile = require('./13-relationsTransformer.js');
  await createAllRelationsFile();

  const createallTagsFile = require('./14-tags.js');
  await createallTagsFile();

  const postAll = require('./postStuff.js'); // Replace './your-module' with the actual path to your module file
  await postAll();
}

gqlRestore();
