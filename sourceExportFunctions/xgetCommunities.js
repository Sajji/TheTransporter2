const fetchData = require('../apiUtils.js');
const writeToFile = require('../fileUtils.js');
const fs = require('fs');

async function fetchDataAndSave(endpoint, fileName, parentCommunities) {
  const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

  const allCommunities = await fetchData(endpoint, config);
  const filteredCommunities = allCommunities.filter(community => parentCommunities.includes(community.name));
  
  const communityData = [];
  
  for (const community of filteredCommunities) {
    const communityMapping = {
      id: community.id,
      name: community.name,
      parentId: community.parent?.id,
      parentName: community.parent?.name,
      uniqueName: `${community.name} ${community.parent?.name}`
    }
    communityData.push(communityMapping);
    await findChildCommunities(communityMapping, allCommunities, communityData);
  }
  
  writeToFile(communityData, fileName);
}

async function findChildCommunities(parentCommunity, allCommunities, communityData) {
  const childCommunities = allCommunities.filter(community => community.parent?.id === parentCommunity.id);
  
  for (const childCommunity of childCommunities) {
    const childCommunityMapping = {
      id: childCommunity.id,
      name: childCommunity.name,
      parentId: childCommunity.parent?.id,
      parentName: childCommunity.parent?.name,
      uniqueName: `${childCommunity.name} ${childCommunity.parent?.name}`
    }
    communityData.push(childCommunityMapping);
    await findChildCommunities(childCommunityMapping, allCommunities, communityData);
  }
}

module.exports = fetchDataAndSave;
