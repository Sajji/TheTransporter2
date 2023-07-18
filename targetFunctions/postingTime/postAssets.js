const fs = require('fs');
const path = require('path');
const postData = require('../../postUtils'); // Assuming you have the postData function implemented
const assetErrors = []; // Assuming you have the assetErrors array defined globally

async function postAssets() {
  const sourceDirectory = '../readyToPOST/assetFiles';
  const endpoint = 'assets/bulk';
  const batchSize = 1000; // Number of assets in each batch
  let counter = 0;

  try {
    // Read all the file names in the source directory
    const files = await fs.promises.readdir(sourceDirectory);

    // Iterate through each file
    for (const file of files) {
      // Skip files that are not JSON
      if (!file.endsWith('.json')) {
        continue;
      }

      // Read the contents of each JSON file
      const filePath = path.join(sourceDirectory, file);
      const payload = require(filePath);

      console.log(`Posting ${payload.length} assets from ${file}...`);

      // Split the assets into batches
      const batches = [];
      for (let i = 0; i < payload.length; i += batchSize) {
        const batch = payload.slice(i, i + batchSize);
        batches.push(batch);
      }

      for (const batch of batches) {
        counter += batch.length;
        console.log(`Posting assets ${counter - batch.length + 1} to ${counter}`);

        try {
          await postData(endpoint, '../../sourceBackups/restoreConfig.json', 'targetSystem', batch);
        } catch (error) {
          console.error('POST request failed for assets:', error.response.status);
          assetErrors.push(error.response.data);
        }
      }
    }

    console.log('All assets posted successfully.');
  } catch (error) {
    console.error('Error posting assets:', error);
  }
}

//module.exports = postAssets;
postAssets();