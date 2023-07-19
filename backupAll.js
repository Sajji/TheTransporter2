const fs = require('fs');
const path = require('path');
const createFolder = require('./makeFoldersUtils');
const doesItExist = require('./doesItExist.js');


const comSource = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const { setupDirectories } = require('./folderUtils.js');
const { createExportLogFile } = require('./sourceFunctions/makeFoldersUtils');
const fetchBackupCommunities = require('./sourceFunctions/1-Communities.js');
const updateCommunities = require('./sourceFunctions/2-Communities.js');
const fetchDomains = require('./sourceFunctions/3-Domains.js');
const fetchHousekeeping = require('./sourceFunctions/4-Housekeeping.js');
const getGraphQLData = require('./sourceFunctions/5-GraphData.js');



async function graphQLbackup() {
  const sourceDirectory = './sourceBackups/gqlData';
  const outputFile = './sourceBackups/consolidatedData.json';
  await createFolder('./sourceBackups/');
  await createFolder('./sourceBackups/');
  await createFolder('./sourceBackups/');
  await createFolder('./sourceBackups/gqlData/');
  await createExportLogFile();
  await fetchBackupCommunities();
  await updateCommunities('communities', 'communities.json', comSource.sourceSystem.communities);
  await fetchDomains('domains', 'domains.json');
  await fetchHousekeeping();
  await getGraphQLData('./sourceBackups/gqlData');
  await createCopyOfConfig();
}

async function backupAll() {
  const communities = comSource.sourceSystem.communities;
  let allCommunitiesExist = true; // Flag variable

  for (const communityName of communities) {
    const community = await doesItExist('sourceSystem', 'communities', communityName, './config.json');
    if (community === 0) {
      console.log(`Community ${communityName} does not exist in the source system.`);
      allCommunitiesExist = false; // Set flag variable to false
      break;
    } else {
      console.log(`Community ${communityName} exists in the source system.`);
    }
  }

  if (!allCommunitiesExist) {
    console.log('Not all communities exist. Stopping the process.');
    return; // Stop the execution of the function
  }

  graphQLbackup(); // Execute the backup function if all communities exist
}

async function createCopyOfConfig() {
  const configFilePath = './config.json';
  const backupFolderPath = './sourceBackups';

  const configData = fs.readFileSync(configFilePath, 'utf8');
  const backupFilePath = path.join(backupFolderPath, 'restoreConfig.json');

  fs.writeFileSync(backupFilePath, configData);
  console.log(`Copy of config.json created at ${backupFilePath}`);
}

backupAll();