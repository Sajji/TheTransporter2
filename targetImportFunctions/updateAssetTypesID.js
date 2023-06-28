const fs = require('fs');
const path = require('path');

async function updateAssetTypesID() {
  // Read the assetTypesIDfix.json file
  const assetTypesIDFixFile = path.join('systemDelta', 'assetTypesIDfix.json');
  const assetTypesIDFixData = JSON.parse(fs.readFileSync(assetTypesIDFixFile, 'utf8'));

  // Read the assets.json file
  const assetsFile = path.join('sourceBackups', 'assets.json');
  const assetsData = JSON.parse(fs.readFileSync(assetsFile, 'utf8'));

  // Iterate through each object in assetTypesIDFixData
  for (const item of assetTypesIDFixData) {
    const { sourceId, targetId } = item;

    // Find matching assets in assetsData
    const matchingAssets = assetsData.filter(asset => asset.type.id === sourceId);

    // Update the "type.id" with the "targetId" in matching assets
    for (const asset of matchingAssets) {
      asset.type.id = targetId;
    }
  }

  // Write the updated assetsData to the assets.json file
  fs.writeFileSync(assetsFile, JSON.stringify(assetsData, null, 2));
  console.log('Asset types ID updated successfully.');
}

module.exports = updateAssetTypesID;
