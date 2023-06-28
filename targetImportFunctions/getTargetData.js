const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Function to create a directory if it doesn't exist
function createDirectoryIfNotExists(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }
}

// Function to issue GET request and save response as JSON
async function fetchAndSave(endpoint, baseURL, auth, cursor) {
  try {
    let results = [];
    let nextCursor = cursor || '';

    do {
      const params = { limit: 1000, cursor: nextCursor };
      const response = await axios.get(`${baseURL}${endpoint}`, {
        auth: auth,
        params: params
      });

      results.push(...response.data.results);
      nextCursor = response.data.nextCursor;
      console.log(`Downloaded ${results.length}`);
    } while (nextCursor);

    const directoryPath = './targetBackups';
    createDirectoryIfNotExists(directoryPath);

    const fileName = path.join(directoryPath, `${endpoint.replace(/\//g, '_')}.json`); // Generate a filename based on the endpoint

    fs.writeFileSync(fileName, JSON.stringify(results));
    console.log(`Saved response from ${endpoint} to ${fileName}`);
  } catch (error) {
    console.error(`Error while fetching ${endpoint}:`, error.message);
  }
}

// Function to issue GET requests for the targetSystem endpoints
async function getTargetData() {
  const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
  const { baseURL, username, password, endpoints } = config.targetSystem;

  // Set up authentication
  const auth = {
    username: username,
    password: password
  };

  for (const endpoint of endpoints) {
    await fetchAndSave(endpoint, baseURL, auth, null); // Pass null as the cursor argument
  }
}

module.exports = getTargetData;
