const fetchData = require('../apiUtils.js');
const writeToFile = require('../fileUtils.js');
const fs = require('fs');

async function fetchDomains(endpoint, fileName) {
  const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
  const communitiesList = JSON.parse(fs.readFileSync('./sourceBackups/communities.json', 'utf8'));


  const communityData = [];

  for (const communityName of communitiesList) {
    const communityId = communityName.id;
    if (communityId) {
      const data = await fetchData(`${endpoint}?communityId=${communityId}`, config);
      for (const domain of data) {
        const domainMapping = {
          id: domain.id,
          name: domain.name,
          typeId: domain.type?.id,
          communityId: domain.community?.id,
          communityName: domain.community?.name,
          uniqueName: `${domain.name} ${domain.community?.name}`
        }
        communityData.push(domainMapping);
      }
    }
  }

  writeToFile(communityData, fileName);
}


module.exports = fetchDomains;
