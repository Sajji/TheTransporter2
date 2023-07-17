const fs = require('fs');
const postData = require('../../postUtils.js');
const patchData = require('../../patchUtils.js');

async function postBackupCommunities() {
  try {
    const fs = require('fs');
    const configFile = '../../sourceBackups/restoreConfig.json';
    const sys = 'targetSystem';
    const endpoint = 'communities';
    const allCommunitiesFile = '../../sourceBackups/backupCommunities.json';
    const allCommunities = JSON.parse(fs.readFileSync(allCommunitiesFile, 'utf8'));

    for (const community of allCommunities) {
      const payload = {
        id: community.id,
        name: community.name,
        parentId: community.parentId
      };
      try {
      const postResults = await postData(endpoint, configFile, sys, payload);
        console.log(`Community ${community.name} posted successfully.`);
        } catch (error) {
        console.error(`Error posting community ${community.name}:`, error.response.data.userMessage);
        }
    }
    console.log(`All communities posted successfully.`);
  } catch (error) {
    console.error(`Error posting all communities:`, error);
  }
}
async function postChildCommunities() {
  try {
    const fs = require('fs');
    const configFile = '../../sourceBackups/restoreConfig.json';
    const sys = 'targetSystem';
    const endpoint = 'communities';
    const allCommunitiesFile = '../../sourceBackups/communities.json';
    const allCommunities = JSON.parse(fs.readFileSync(allCommunitiesFile, 'utf8'));

    for (const community of allCommunities) {
      const payload = {
        id: community.id,
        name: community.name,
        parentId: community.parentId
      };
      try {
      const postResults = await postData(endpoint, configFile, sys, payload);
        console.log(`Community ${community.name} posted successfully.`);
        } catch (error) {
        console.error(`Error posting community ${community.name}:`, error.response.data.userMessage);
        }
    }
    console.log(`All communities posted successfully.`);
  } catch (error) {
    console.error(`Error posting all communities:`, error);
  }
}
async function patchAllCommunities() {
    const fs = require('fs');
    try {
        const configFile = '../../sourceBackups/restoreConfig.json';
        const sys = 'targetSystem';

        const allCommunitiesFile = '../../sourceBackups/communities.json';
        const allCommunities = JSON.parse(fs.readFileSync(allCommunitiesFile, 'utf8'));
    
        for (const community of allCommunities) {
          const payload = {
            id: community.id,
            name: community.name,
            parentId: community.parentId,
            description: community.description
          };
          try {
            const endpoint = `communities/${community.id}`;
            const patchResults = await patchData(endpoint, configFile, sys, payload);
            console.log(`Community ${community.name} patched successfully.`);
            } catch (error) {
            console.error(`Error patching community ${community.name}:`, error);
            }
        }
        console.log(`All communities patched successfully.`);
      } catch (error) {
        console.error(`Error patching all communities:`, error);
      }
}
// Call the async function
async function postAndPatchAllCommunities() {
    await postBackupCommunities();
    await postChildCommunities();
    await patchAllCommunities();
}

module.exports = postAndPatchAllCommunities;
