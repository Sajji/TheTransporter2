const postData = require('../../postUtils.js');
const restoreConfigFile = require('../../sourceBackups/restoreConfig.json');

async function checkApi() {
  const endpoint = 'auth/sessions';
  const payload = {
    "username": restoreConfigFile.targetSystem.username,
    "password": restoreConfigFile.targetSystem.password
  };

  try {
    const checkApi = await postData(endpoint, '../../sourceBackups/restoreConfig.json', 'targetSystem', payload);
    console.log('API is reachable.', checkApi.csrfToken);
    return checkApi.csrfToken;
  } catch (error) {
    return 0
  }
}

module.exports = checkApi;
