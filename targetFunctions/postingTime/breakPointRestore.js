const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function gqlRestore() {
  // Function to create a folder with await
  async function createFolderAsync(folderPath) {
    const createFolder = require('../../makeFoldersUtils');
    await createFolder(folderPath);
  }

  async function promptAndWait() {
    return new Promise((resolve) => {
      rl.question('Press enter to continue or type "x" and press enter to stop: ', (answer) => {
        if (answer.trim().toLowerCase() === 'x') {
          console.log('Stopping the process.');
          rl.close();
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  try {
    await createFolderAsync('../readyToPOST');
    if (!(await promptAndWait())) return;

    await createFolderAsync('../readyToPOST/assetFiles');
    if (!(await promptAndWait())) return;

    await createFolderAsync('../readyToPOST/attributeFiles');
    if (!(await promptAndWait())) return;

    await createFolderAsync('../readyToPOST/relationFiles');
    if (!(await promptAndWait())) return;

    await createFolderAsync('./errorFiles');
    if (!(await promptAndWait())) return;

    await createFolderAsync('./tempFiles');
    if (!(await promptAndWait())) return;

    const createLandingZone = require('./landingZone.js');
    await createLandingZone();
    if (!(await promptAndWait())) return;

    const updateCommunities = require('./updateCommunities.js');
    await updateCommunities();
    if (!(await promptAndWait())) return;

    const postAndPatchAllCommunities = require('./a-communitiesPost.js');
    await postAndPatchAllCommunities();
    if (!(await promptAndWait())) return;

    const operatingModel = require('./operatingModel.js');
    await operatingModel();
    if (!(await promptAndWait())) return;

    const createAllAssetsFiles = require('./9-5assetSeparates.js');
    await createAllAssetsFiles();
    if (!(await promptAndWait())) return;

    const createAllAttributesFiles = require('./10-attributeSeparates.js');
    await createAllAttributesFiles();
    if (!(await promptAndWait())) return;

    const domainTransformer = require('./12-domainsTransformer.js');
    await domainTransformer();
    if (!(await promptAndWait())) return;

    const createAllRelationsFiles = require('./13-relationSeparates.js');
    await createAllRelationsFiles();
    if (!(await promptAndWait())) return;

    const createallTagsFile = require('./14-tags.js');
    await createallTagsFile();
    if (!(await promptAndWait())) return;

    const postAll = require('./postStuff.js'); // Replace './your-module' with the actual path to your module file
    await postAll();
  } catch (error) {
    console.error(error);
  } finally {
    rl.close();
  }
}

gqlRestore().catch(error => console.error(error));
