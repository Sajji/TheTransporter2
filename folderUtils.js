const fs = require('fs');
const path = require('path');

async function setupDirectories() {
  const sourceBackupsDir = path.join(__dirname, 'sourceBackups');
  const logsFilePath = path.join(__dirname, 'sourceBackups', 'exportLog.json');

  // Create the sourceBackups directory if it doesn't exist
  if (!fs.existsSync(sourceBackupsDir)) {
    fs.mkdirSync(sourceBackupsDir);
  } else {
    // Delete existing data in the sourceBackups directory
    const files = fs.readdirSync(sourceBackupsDir);
    for (const file of files) {
      const filePath = path.join(sourceBackupsDir, file);
      fs.unlinkSync(filePath);
    }
  }

  // Create the sourceBackups directory if it doesn't exist
  const logsDirPath = path.dirname(logsFilePath);
  if (!fs.existsSync(logsDirPath)) {
    fs.mkdirSync(logsDirPath);
  }

  // Check if exportLog.json file exists
  if (fs.existsSync(logsFilePath)) {
    // Overwrite the file with an empty array
    fs.writeFileSync(logsFilePath, '[]');
  } else {
    // Create exportLog.json file with an empty array if it doesn't exist
    fs.writeFileSync(logsFilePath, '[]');
  }
}

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


module.exports = { setupDirectories, createFolder };
