const fetchData = require('../apiUtils.js');
const fs = require('fs');

async function fetchHousekeeping() {
  const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

  try {
    const endpoints = [
      { endpoint: 'assetTypes'},
      { endpoint: 'attributeTypes'},
      { endpoint: 'domainTypes'},
      { endpoint: 'relationTypes'}
    ];

    for (const { endpoint} of endpoints) {
      const data = await fetchData(endpoint, config);

      const endpointFileName = `./sourceBackups/${endpoint}.json`;
      fs.writeFileSync(endpointFileName, JSON.stringify(data, null, 2));
      console.log(`Filtered ${endpoint} saved to ${endpointFileName}`);

    }
  } catch (error) {
    console.error(`Error while fetching or comparing data: ${error.message}`);
  }
}

module.exports = fetchHousekeeping;