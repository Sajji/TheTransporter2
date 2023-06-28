const fs = require('fs');
const path = require('path');

const comSource = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const { setupDirectories } = require('./folderUtils.js');
const fetchDataAndSave = require('./sourceExportFunctions/xgetCommunities.js');
const fetchDomains = require('./sourceExportFunctions/xgetDomains.js');
const fetchAssets = require('./sourceExportFunctions/xgetAssets.js');
const fetchAttributes = require('./sourceExportFunctions/xgetAttributes.js');   
const fetchRelations = require('./sourceExportFunctions/xgetRelations.js');
const fetchHousekeeping = require('./sourceExportFunctions/fetchHousekeeping.js');
const createSummary = require('./sourceExportFunctions/summary.js');
const combineFiles = require('./sourceExportFunctions/combineFiles.js');
const processDomains = require('./sourceExportFunctions/xgetGraphQL.js');

async function restAPIbackup() {
  await setupDirectories();
  await fetchDataAndSave('communities', 'communities.json', comSource.sourceSystem.communities);
  await fetchDomains('domains', 'domains.json');
  await fetchAssets('assets', 'assets.json', comSource.sourceSystem.communities);
  await fetchAttributes('attributes.json');
  await fetchRelations('relations.json');
  await fetchHousekeeping();
  await createSummary();
  await combineFiles();
}
async function graphQLbackup() {
  await setupDirectories();
  await fetchDataAndSave('communities', 'communities.json', comSource.sourceSystem.communities);
  await fetchDomains('domains', 'domains.json');
  await processDomains();
  await fetchHousekeeping();
  await createSummary();
  await combineFiles();
}

if (comSource.sourceSystem.useGraphQl === true) {
  graphQLbackup();
} else {
  restAPIbackup();
}
