const fs = require('fs');
const path = require('path');
const JSONStream = require('JSONstream');

async function consolidateJSONData(sourceDirectory, outputFile) {
  try {
    // Read all the file names in the source directory
    const files = await fs.promises.readdir(sourceDirectory);

    // Array to store all objects from the JSON files
    let allObjects = [];

    // Iterate through each file
    for (const file of files) {
      // Read the contents of each JSON file
      const filePath = path.join(sourceDirectory, file);
      const fileContents = await fs.promises.readFile(filePath, 'utf8');

      try {
        // Parse the JSON content
        const data = JSON.parse(fileContents);

        // Ensure the data is an array
        if (Array.isArray(data)) {
          // Concatenate the array to the allObjects array
          allObjects = allObjects.concat(data);
        } else {
          console.warn(`Skipping file '${file}' - Invalid JSON format: Expected an array.`);
        }
      } catch (error) {
        console.error(`Error parsing file '${file}':`, error);
      }
    }

    // Write the consolidated objects to a single JSON file
    const outputData = JSON.stringify(allObjects, null, 2);
    await fs.promises.writeFile(outputFile, outputData);

    console.log(`Consolidated data saved to '${outputFile}'. Total objects: ${allObjects.length}`);
  } catch (error) {
    console.error('Error consolidating JSON data:', error);
  }
}

// Example usage:
const sourceDirectory = '../sourceBackups/gqlData';
const outputFile = '../sourceBackups/consolidatedData.json';

module.exports = consolidateJSONData;
