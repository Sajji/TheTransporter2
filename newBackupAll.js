const fs = require('fs');
const path = require('path');

const comSource = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const { setupDirectories } = require('./folderUtils.js');
const fetchBackupCommunities = require('./sourceExportFunctions/xgetBackupCommunities.js');
const fetchDataAndSave = require('./sourceExportFunctions/xgetCommunities.js');
const fetchDomains = require('./sourceExportFunctions/xgetDomains.js');
const fetchAssets = require('./sourceExportFunctions/xgetAssets.js');
const fetchAttributes = require('./sourceExportFunctions/xgetAttributes.js');   
const fetchRelations = require('./sourceExportFunctions/xgetRelations.js');
const fetchHousekeeping = require('./sourceExportFunctions/fetchHousekeeping.js');
const createSummary = require('./sourceExportFunctions/summary.js');
const combineFiles = require('./sourceExportFunctions/combineFiles.js');
const getGraphQLData = require('./sourceExportFunctions/zgraph.js');

async function createCopyOfConfig() {
  const configFilePath = './config.json';
  const backupFolderPath = './sourceBackups';

  const configData = fs.readFileSync(configFilePath, 'utf8');
  const backupFilePath = path.join(backupFolderPath, 'restoreConfig.json');

  fs.writeFileSync(backupFilePath, configData);
  console.log(`Copy of config.json created at ${backupFilePath}`);
}

async function restAPIbackup() {
  await setupDirectories();
  await fetchBackupCommunities();
  await fetchDataAndSave('communities', 'communities.json', comSource.sourceSystem.communities);
  await fetchDomains('domains', 'domains.json');
  await fetchAssets('assets', 'assets.json', comSource.sourceSystem.communities);
  await fetchAttributes('attributes.json');
  await fetchRelations('relations.json');
  await fetchHousekeeping();
  await createSummary();
  await combineFiles();
  await createCopyOfConfig();
}
async function graphQLbackup() {
  await setupDirectories();
  await fetchBackupCommunities();
  await fetchDataAndSave('communities', 'communities.json', comSource.sourceSystem.communities);
  await fetchDomains('domains', 'domains.json');
  await fetchHousekeeping();
  await getGraphQLData();
  await createSummary();
  await combineFiles();
  await createCopyOfConfig();
}

if (comSource.sourceSystem.useGraphQl === true) {
  graphQLbackup();
} else {
  restAPIbackup();
}
