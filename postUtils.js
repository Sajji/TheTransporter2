const fs = require('fs');
const axios = require('axios');

async function postData(endpoint, configFile, sys, payload) {
  const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  try {
    const systemConfig = config[sys];
    const baseURL = systemConfig.baseURL;
    const auth = {
      username: systemConfig.username,
      password: systemConfig.password,
    };

    const response = await axios.post(`${baseURL}${endpoint}`, payload, {
      auth: auth,
    });

    //console.log(`POST request successful for ${endpoint}:`, response.status);
    return response.data;
  } catch (error) {
    //console.error(`Error while performing POST request for ${payload}:`, error.response.data.userMessage);
    throw error;
  }
}

module.exports = postData;

