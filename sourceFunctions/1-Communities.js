const fs = require('fs');
const axios = require('axios');
const config = require('../config.json');

async function fetchBackupCommunities() {
  const baseURL = config.sourceSystem.baseURL;
  const communities = config.sourceSystem.communities;

  const backupData = [];

  for (const communityName of communities) {
    const endpoint = `${baseURL}communities?name=${encodeURIComponent(communityName)}&nameMatchMode=EXACT`;
    console.log(endpoint);
    try {
      const response = await axios.get(endpoint, {
        auth: {
          username: config.sourceSystem.username,
          password: config.sourceSystem.password
        }
      });

      const responseData = response.data;
      console.log(responseData);
      const community = responseData.results[0];
      console.log(community);
      // Extract the id and name mappings from the community data
      const mappings = {
        id: community.id,
        name: community.name
      };

      // Add the mappings to the backup data array
      backupData.push(mappings);
    } catch (error) {
      console.error(`GET request for community ${communityName} failed:`, error);
    }
  }

  // Write the backup data to the backupCommunities.json file
  fs.writeFileSync('./sourceBackups/backupCommunities.json', JSON.stringify(backupData, null, 2));
  console.log('Backup data has been saved to backupCommunities.json');
}

//fetchBackupCommunities();
module.exports = fetchBackupCommunities;