const axios = require('axios');
const fs = require('fs');

async function postCommunities() {
  try {
    const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    const targetSystemConfig = config.targetSystem;
    const baseURL = targetSystemConfig.baseURL;
    const communitiesEndpoint = `${baseURL}communities`;
    const communitiesData = JSON.parse(fs.readFileSync('sourceBackups/communities.json', 'utf8'));
    
    const requestOptions = {
      baseURL,
      auth: {
        username: targetSystemConfig.username,
        password: targetSystemConfig.password
      }
    };
    
    // POST request
    for (const community of communitiesData) {
      try {
        const postData = {
          id: community.id,
          name: community.name
        };
        await axios.post(communitiesEndpoint, postData, requestOptions);
        console.log(`Successfully created community with id: ${community.id}`);
      } catch (error) {
        console.error(`Error creating community with id: ${community.id}: ${error.message}`);
      }
    }
    
    // PATCH request
    for (const community of communitiesData) {
      try {
        await axios.patch(`${communitiesEndpoint}/${community.id}`, community, requestOptions);
        console.log(`Successfully updated community with id: ${community.id}`);
      } catch (error) {
        console.error(`Error updating community with id: ${community.id}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Start the process
module.exports = postCommunities;
