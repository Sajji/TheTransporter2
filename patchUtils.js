const axios = require('axios');
const fs = require('fs');

async function patchData(endpoint, configFile, sys, payload) {
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    try {
      const systemConfig = config[sys];
      const baseURL = systemConfig.baseURL;
      const auth = {
        username: systemConfig.username,
        password: systemConfig.password,
      };
  
      const response = await axios.patch(`${baseURL}${endpoint}`, payload, {
        auth: auth,
      });
  
      console.log(`POST request successful for ${endpoint}:`);
      return response.data;
    } catch (error) {
      console.error(`Error while performing POST request for ${endpoint}:`, error.message);
      throw error;
    }
  }

    module.exports = patchData;