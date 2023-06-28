const fetchData = require('../apiUtils.js');
const writeToFile = require('../fileUtils.js');
const fs = require('fs');

async function fetchAssets(endpoint, fileName, communityNames) {
  const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
  const communities = config.sourceSystem.communities;

  const communityData = [];

  for (const communityName of communityNames) {
    const communityId = await fetchCommunityId(communityName, config);
    if (communityId) {
      const data = await fetchData(`${endpoint}?communityId=${communityId}`, config);
      
      // Add uniqueName property to each asset object
      data.forEach(asset => {
        asset.uniqueName = `${asset.name} ${asset.domain.name}`;
      });

      communityData.push(...data);
    }
  }

  writeToFile(communityData, fileName);
}


async function fetchCommunityId(communityName, config) {
  const communitiesEndpoint = 'communities';
  const data = await fetchData(`${communitiesEndpoint}?name=${encodeURIComponent(communityName)}&nameMatchMode=EXACT`, config);
  const community = data.find(community => community.name === communityName);
  return community ? community.id : null;
}

module.exports = fetchAssets;
