const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Function to issue GET request and return response as JSON
async function fetchData(endpoint, config) {
  try {
    const sourceSystemConfig = config.sourceSystem;
    const baseURL = sourceSystemConfig.baseURL;
    const auth = {
      username: sourceSystemConfig.username,
      password: sourceSystemConfig.password
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
      pushToLogs(logsObject);
    } while (nextCursor);

    return results;
  } catch (error) {
    console.error(`Error while fetching ${endpoint}:`, error.message);
    throw error;
  }
}

// Function to push object to exportLog.json file
function pushToLogs(logsObject) {
  const logsFilePath = path.join(__dirname, 'exportData', 'exportLog.json');

  try {
    const logsData = JSON.parse(fs.readFileSync(logsFilePath, 'utf8'));
    logsData.push(logsObject);
    fs.writeFileSync(logsFilePath, JSON.stringify(logsData, null, 2));
    //console.log(`Pushed object to exportLog.json`);
  } catch (error) {
    console.error(`Error while pushing object to exportLog.json:`, error.message);
    throw error;
  }
}

module.exports = fetchData;
