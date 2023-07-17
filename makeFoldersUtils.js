const fs = require('fs').promises;
const path = require('path');

async function createFolder(folderName) {
  try {
    const folderPath = path.resolve(folderName); // Resolve the folder path

    // Check if the folder already exists
    const folderExists = await fs.stat(folderPath).then(stats => stats.isDirectory()).catch(() => false);

    if (!folderExists) {
      // Create the folder if it doesn't exist
      await fs.mkdir(folderPath, { recursive: true });
      console.log(`Folder '${folderPath}' created successfully.`);
    } else {
      console.log(`Folder '${folderPath}' already exists.`);
    }
  } catch (error) {
    console.error(`Error creating folder '${folderName}':`, error);
  }
}

module.exports = createFolder;