const axios = require('axios');
const fs = require('fs');

async function doesItExist(sys, endpoint, searchTerm, configFileLocation) {
  try {
    const configFile = configFileLocation;
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    const systemConfig = config[sys];
    const baseURL = systemConfig.baseURL;
    const auth = {
      username: systemConfig.username,
      password: systemConfig.password
    };

    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const searchURL = `${baseURL}${endpoint}?name=${encodedSearchTerm}&nameMatchMode=EXACT`;
    const response = await axios.get(searchURL, {
      auth: auth
    });

    if (response.data.total > 0) {
      return response.data.results[0];
    } else {
      return 0;
    }
  } catch (error) {
    console.error(`Error while checking if object exists at ${endpoint}:`, error.message);
    throw error;
  }
}

module.exports = doesItExist;
