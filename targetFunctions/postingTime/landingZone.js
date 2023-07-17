const fs = require('fs');
const doesItExist = require('../../doesItExist');
const postData = require('../../postUtils');

async function createCommunity() {
  const configFile = '../../sourceBackups/restoreConfig.json';
  const configData = fs.readFileSync(configFile, 'utf8');
  const config = JSON.parse(configData);

  const targetSystem = config.targetSystem;
  const endpoint = 'communities';
  const communityName = targetSystem.landingZone;

  try {
    const existingCommunity = await doesItExist('targetSystem', endpoint, communityName, configFile);

    if (existingCommunity) {
      const communityId = existingCommunity.id;
      console.log(`Community ${communityName} already exists with ID: ${communityId}`);
      return communityId;
      // Use the communityId for further processing if needed
    } else {
      // Community doesn't exist, proceed with creating a new one
      const payload = {
        name: communityName,
        description: communityName
      };

      const response = await postData(endpoint, configFile, 'targetSystem', payload);
      const communityId = response.id;

      console.log(`Community ${communityName} created with ID: ${communityId}`);
      return communityId;
      // Use the communityId for further processing if needed
    }
  } catch (error) {
    console.error('Error creating/checking community:', error);
    throw error;
  }
}

async function updateBackupCommunities(communityId) {
  const backupFilePath = '../../sourceBackups/backupCommunities.json';
  const backupData = require(backupFilePath);

  const updatedData = backupData.map(item => ({
    ...item,
    parentId: communityId
  }));

  fs.writeFileSync(backupFilePath, JSON.stringify(updatedData, null, 2));
  console.log('backupCommunities.json updated successfully.');
}



// Call the async function


async function createLandingZone() {
  try {
    const communityId = await createCommunity();
    await updateBackupCommunities(communityId);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Execute the functions in order
module.exports = createLandingZone;
