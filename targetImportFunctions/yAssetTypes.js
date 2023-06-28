const fs = require('fs');
const path = require('path');

const sourceSystemDir = './sourceBackups';
const targetSystemDir = './targetBackups';
const systemDeltaDir = './systemDelta';

if (!fs.existsSync(systemDeltaDir)) {
  fs.mkdirSync(systemDeltaDir);
}

// Function to compare two JSON files based on the "name" key
async function compareAssetTypes(sourceFile, targetFile) {
  try {
    const sourceData = JSON.parse(await fs.promises.readFile(sourceFile, 'utf8'));
    const targetData = JSON.parse(await fs.promises.readFile(targetFile, 'utf8'));

    const missing = sourceData.filter((sourceItem) => {
      return !targetData.some((targetItem) => targetItem.name === sourceItem.name);
    });

    const differingIds = [];

    for (const sourceItem of sourceData) {
      const matchingTargetItem = targetData.find((targetItem) => targetItem.name === sourceItem.name);
      if (matchingTargetItem && matchingTargetItem.id !== sourceItem.id) {
        differingIds.push({
          name: sourceItem.name,
          sourceId: sourceItem.id,
          targetId: matchingTargetItem.id
        });
      }
    }

    return { missing, differingIds };
  } catch (error) {
    console.error(`Error while comparing asset types: ${error.message}`);
    return { missing: [], differingIds: [] };
  }
}

// Compare the assetTypes.json files in sourceBackups and targetBackups
async function compareAssetTypesData() {
  const sourceFile = path.join(sourceSystemDir, 'assetTypes.json');
  const targetFile = path.join(targetSystemDir, 'assetTypes.json');
  const missingFile = path.join(systemDeltaDir, 'assetTypesMissing.json');
  const differingIdsFile = path.join(systemDeltaDir, 'assetTypesIDfix.json');

  try {
    const { missing, differingIds } = await compareAssetTypes(sourceFile, targetFile);

    await fs.promises.writeFile(missingFile, JSON.stringify(missing, null, 2));
    console.log(`Missing asset types saved to ${missingFile}`);

    await fs.promises.writeFile(differingIdsFile, JSON.stringify(differingIds, null, 2));
    console.log(`Asset types with differing IDs saved to ${differingIdsFile}`);
  } catch (error) {
    console.error(`Error while comparing asset types: ${error.message}`);
  }
}

module.exports = compareAssetTypesData;
