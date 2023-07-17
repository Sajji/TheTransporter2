const fs = require('fs');
const path = require('path');

async function createFolder(folderName) {
  try {
    const folderPath = path.resolve(folderName); // Resolve the folder path

    // Check if the folder already exists
    const folderExists = await fs.promises.stat(folderPath).then(stats => stats.isDirectory()).catch(() => false);

    if (!folderExists) {
      // Create the folder if it doesn't exist
      await fs.promises.mkdir(folderPath, { recursive: true });
      console.log(`Folder '${folderPath}' created successfully.`);
    } else {
      console.log(`Folder '${folderPath}' already exists.`);
    }
  } catch (error) {
    console.error(`Error creating folder '${folderName}':`, error);
  }
}

module.exports.createFolder = createFolder;

async function createExportLogFile() {
  const exportLogPath = path.join('sourceBackups', 'exportLog.json');
  const emptyArray = [];

  try {
    // Write the empty array to the exportLog.json file
    await fs.promises.writeFile(exportLogPath, JSON.stringify(emptyArray));

    console.log(`exportLog.json file created successfully.`);
  } catch (error) {
    console.error(`Error creating exportLog.json file:`, error);
  }
}

module.exports.createExportLogFile = createExportLogFile;
