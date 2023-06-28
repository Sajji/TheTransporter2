const axios = require('axios');
const fs = require('fs');

async function postDomains() {
  try {
    const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    const targetSystemConfig = config.targetSystem;
    const baseURL = targetSystemConfig.baseURL;
    const domainsEndpoint = `${baseURL}domains`;
    const domainsData = JSON.parse(fs.readFileSync('sourceBackups/domains.json', 'utf8'));
    
    const requestOptions = {
      baseURL,
      auth: {
        username: targetSystemConfig.username,
        password: targetSystemConfig.password
      }
    };
    
    // POST request
    for (const domain of domainsData) {
      try {
        const postData = {
          id: domain.id,
          name: domain.name,
          typeId: domain.typeId,
          communityId: domain.communityId
        };
        await axios.post(domainsEndpoint, postData, requestOptions);
        console.log(`Successfully created domain with id: ${domain.id}`);
      } catch (error) {
        console.error(`Error creating domain with id: ${domain.id}: ${error.message}`);
      }
    }
    
    // PATCH request
    for (const domain of domainsData) {
      try {
        await axios.patch(`${domainsEndpoint}/${domain.id}`, domain, requestOptions);
        console.log(`Successfully updated domain with id: ${domain.id}`);
      } catch (error) {
        console.error(`Error updating domain with id: ${domain.id}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Start the process
module.exports = postDomains;
