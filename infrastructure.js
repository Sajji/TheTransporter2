const fs = require('fs');
const axios = require('axios');
const config = require('./config.json');

async function updateCommunities() {
  const backupFilePath = './sourceBackups/backupCommunities.json';
  const communitiesFilePath = './sourceBackups/communities.json';

  try {
    // Read backupCommunities.json and communities.json files
    const backupData = require(backupFilePath);
    const communitiesData = require(communitiesFilePath);

    // Update communitiesData based on backupData
    const updatedData = communitiesData.map(community => {
      const matchingCommunity = backupData.find(
        backupCommunity => backupCommunity.name === community.name
      );

      if (matchingCommunity) {
        return {
          ...community,
          parentId: matchingCommunity.parentId,
          parentName: matchingCommunity.parentName,
          uniqueName: `${community.name} ${matchingCommunity.parentName}`
        };
      }

      return community;
    });

    // Write updated data back to communities.json file
    fs.writeFileSync(communitiesFilePath, JSON.stringify(updatedData, null, 2));
    console.log('communities.json updated successfully.');
  } catch (error) {
    console.error('Error updating communities.json:', error);
  }
}

module.exports = updateCommunities;


async function createLandingZone() {
    const baseURL = config.targetSystem.baseURL;
    const landingZone = config.targetSystem.landingZone;
  
    // Check if community already exists
    const getEndpoint = `${baseURL}communities?name=${encodeURIComponent(landingZone)}&nameMatchMode=EXACT`;
    //const endpoint = `${baseURL}communities?name=${encodeURIComponent(communityName)}&nameMatchMode=EXACT`;
    try {
      const getResponse = await axios.get(getEndpoint, {
        auth: {
          username: config.targetSystem.username,
          password: config.targetSystem.password
        }
      });
  
      const responseData = getResponse.data.results[0];
      const communityId = responseData.id;
        const communityName = responseData.name;
      console.log(`Community ${communityName} already exists with id ${communityId}.`);
      const backupFilePath = './sourceBackups/backupCommunities.json';
      const backupData = require(backupFilePath);
  
      const updatedData = backupData.map(item => ({
        ...item,
        parentId: responseData.id,
        parentName: responseData.name
      }));
  
      fs.writeFileSync(backupFilePath, JSON.stringify(updatedData, null, 2));
      console.log('backupCommunities.json updated successfully.');
    }
    catch (error) {
        console.log(`Community ${landingZone} does not exist.`);
        createCommunity();
}
}

async function createCommunity() {
  const baseURL = config.targetSystem.baseURL;
  const landingZone = config.targetSystem.landingZone;

  const endpoint = `${baseURL}communities`;

  const payload = {
    name: landingZone,
    description: landingZone
  };

  try {
    const response = await axios.post(endpoint, payload, {
      auth: {
        username: config.targetSystem.username,
        password: config.targetSystem.password
      }
    });

    const responseData = response.data;
    // Process the response data as needed
    console.log(responseData);

    // Update backupCommunities.json with parentId
    const backupFilePath = './sourceBackups/backupCommunities.json';
    const backupData = require(backupFilePath);

    const updatedData = backupData.map(item => ({
      ...item,
      parentId: responseData.id,
      parentName: responseData.name
    }));

    fs.writeFileSync(backupFilePath, JSON.stringify(updatedData, null, 2));
    console.log('backupCommunities.json updated successfully.');
  } catch (error) {
    console.error('POST request failed:', error);
  }
}
module.exports = createLandingZone;


// Step 1: POST request using backupCommunities.json
async function postBackupCommunities() {
  const backupCommunitiesFilePath = './sourceBackups/backupCommunities.json';
  const backupCommunitiesData = require(backupCommunitiesFilePath);

  for (const community of backupCommunitiesData) {
    const endpoint = `${config.targetSystem.baseURL}communities`;
    const payload = {
      id: community.id,
      name: community.name,
      description: community.description,
      parentId: community.parentId
    };

    try {
      const response = await axios.post(endpoint, payload, {
        auth: {
          username: config.targetSystem.username,
          password: config.targetSystem.password
        }
      });

      console.log(`Response code for backup community '${community.name}': ${response.status}`);
    } catch (error) {
      console.error(`POST request failed for backup community '${community.name}': `, error.response.data.userMessage);
    }
  }
}

// Step 2: POST request using communities.json
async function postCommunities() {
  const communitiesFilePath = './sourceBackups/communities.json';
  const communitiesData = require(communitiesFilePath);

  for (const community of communitiesData) {
    const endpoint = `${config.targetSystem.baseURL}communities`;
    const payload = {
      id: community.id,
      name: community.name,
      description: community.description
    };

    try {
      const response = await axios.post(endpoint, payload, {
        auth: {
          username: config.targetSystem.username,
          password: config.targetSystem.password
        }
      });

      console.log(`Response code for community '${community.name}': ${response.status}`);
    } catch (error) {
      console.error(`POST request failed for community '${community.name}':`, error.response.data.userMessage);
    }
  }
}

// Step 3: PATCH request to update communities
async function patchCommunities() {
  const communitiesFilePath = './sourceBackups/communities.json';
  const communitiesData = require(communitiesFilePath);

  for (const community of communitiesData) {
    const endpoint = `${config.targetSystem.baseURL}communities/${community.id}`;
    const payload = {
      id: community.id,
      name: community.name,
      description: community.description,
      parentId: community.parentId
    };

    try {
      const response = await axios.patch(endpoint, payload, {
        auth: {
          username: config.targetSystem.username,
          password: config.targetSystem.password
        }
      });

      console.log(`Response code for updating community '${community.name}': ${response.status}`);
    } catch (error) {
      console.error(`PATCH request failed for community '${community.name}':`, error.response.data.userMessage);
    }
  }
}

// Execute the multi-step POST request
async function createCommunities() {
  try {
    console.log('Step 1: Posting backup communities');
    await postBackupCommunities();

    console.log('Step 2: Posting communities');
    await postCommunities();

    console.log('Step 3: Patching communities');
    await patchCommunities();

    console.log('Multi-step POST request completed successfully.');
  } catch (error) {
    console.error('Multi-step POST request failed:', error);
  }
}

module.exports = createCommunities;
