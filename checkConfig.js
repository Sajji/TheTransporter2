const postData = require('./postUtils.js');
const configFile = require('./config.json');

async function checkApi() {
  const endpoint = 'auth/sessions';
  const payload = {
    "username": configFile.sourceSystem.username,
    "password": configFile.sourceSystem.password
  };

  try {
    const checkApi = await postData(endpoint, './config.json', 'sourceSystem', payload);
    console.log('API is reachable.', checkApi.csrfToken);
    return checkApi.csrfToken;
  } catch (error) {
    console.log(endpoint, payload);
    return 0
  }
}

module.exports = checkApi;
