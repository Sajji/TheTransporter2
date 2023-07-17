const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Function to issue GET request and return response as JSON

async function fetchData(endpoint, configFile, sys) {
  const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  try {
    const systemConfig = config[sys]; // Access the appropriate system configuration using the `sys` parameter
    const baseURL = systemConfig.baseURL;
    const auth = {
      username: systemConfig.username,
      password: systemConfig.password
    };

    let results = [];
    let nextCursor = '';

    do {
      const params = { limit: 1000, cursor: nextCursor };
      const response = await axios.get(`${baseURL}${endpoint}`, {
        auth: auth,
        params: params
      });

      results.push(...response.data.results);
      nextCursor = response.data.nextCursor;
      console.log(`${endpoint}: Downloaded ${results.length}`);

      // Push object to exportLog.json
      const logsObject = {
        endpoint: endpoint,
        count: results.length
      };
    } while (nextCursor);

    return results;
  } catch (error) {
    console.error(`Error while fetching ${endpoint}:`, error.message);
    throw error;
  }
}

module.exports = fetchData;
