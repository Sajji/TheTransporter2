const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function postAssets() {
  const sourceBackupsDir = 'sourceBackups';
  const targetBackupsDir = 'targetBackups';
  const resultDir = 'missingAssets';
  const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

  // Create the result directory if it doesn't exist
  if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir);
  }

  // Function to compare the assets based on unique keys
  function compareAssets() {
    const sourceAssetsFile = path.join(sourceBackupsDir, 'assets.json');
    const targetAssetsFile = path.join(targetBackupsDir, 'assets.json');

    const sourceAssets = JSON.parse(fs.readFileSync(sourceAssetsFile, 'utf8'));
    const targetAssets = JSON.parse(fs.readFileSync(targetAssetsFile, 'utf8'));

    const missingAssets = [];

    for (const sourceAsset of sourceAssets) {
      let isMatching = false;

      for (const targetAsset of targetAssets) {
        if (
          sourceAsset.name === targetAsset.name &&
          sourceAsset.domain.name === targetAsset.domain.name &&
          sourceAsset.type.name === targetAsset.type.name
        ) {
          isMatching = true;
          break;
        }
      }

      if (!isMatching) {
        missingAssets.push({
          id: sourceAsset.id,
          name: sourceAsset.name,
          displayName: sourceAsset.displayName,
          domainId: sourceAsset.domain.id,
          typeId: sourceAsset.type.id
        });
      }
    }

    return missingAssets;
  }

  // Compare the assets and get the missing assets
  const missingAssets = compareAssets();

  // Save the missing assets to a file
  const missingAssetsFile = path.join(resultDir, 'missingAssets.json');
  fs.writeFileSync(missingAssetsFile, JSON.stringify(missingAssets, null, 2));
  console.log(`Missing assets saved to ${missingAssetsFile}`);

  // Function to chunk the missing assets into smaller arrays
  function chunkAssets(assets, chunkSize) {
    const chunks = [];
    for (let i = 0; i < assets.length; i += chunkSize) {
      chunks.push(assets.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Function to post assets in bulk
  async function postAssetsChunk(chunk) {
    const targetEndpoint = `${config.targetSystem.baseURL}/assets/bulk`;

    try {
      const response = await axios.post(targetEndpoint, chunk, {
        auth: {
          username: config.targetSystem.username,
          password: config.targetSystem.password
        }
      });
      console.log(`Posted ${chunk.length} assets successfully.`);
      //console.log(response.data);
      // Call the PATCH command here using the response data
    } catch (error) {
      console.error(`Error while posting assets: ${error.message}`);
    }
  }

  // Post missing assets in chunks of 1000
  const chunkSize = 10000;
  const assetChunks = chunkAssets(missingAssets, chunkSize);

  for (const chunk of assetChunks) {
    await postAssetsChunk(chunk);
  }
}

// Call the async function
module.exports = postAssets;
