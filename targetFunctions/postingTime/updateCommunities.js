const fs = require('fs');

async function updateCommunities() {
  try {
    const backupFilePath = '../../sourceBackups/backupCommunities.json';
    const communitiesFilePath = '../../sourceBackups/communities.json';

    const backupData = require(`${backupFilePath}`);
    const communitiesData = require(`${communitiesFilePath}`);

    const updatedCommunities = communitiesData.filter((community) => {
      const matchingBackupCommunity = backupData.find((backupCommunity) => backupCommunity.name === community.name);

      return !matchingBackupCommunity;
    });

    fs.writeFileSync(communitiesFilePath, JSON.stringify(updatedCommunities, null, 2));
    console.log(`Updated communities saved to: ${communitiesFilePath}`);
  } catch (error) {
    console.error('Error updating communities:', error.message);
  }
}

// Call the async function
module.exports = updateCommunities;
