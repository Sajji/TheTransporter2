const fs = require('fs');
const path = require('path');

async function setupDirectories() {
  const sourceBackupsDir = path.join(__dirname, 'sourceBackups');
  const logsFilePath = path.join(__dirname, 'exportData', 'exportLog.json');

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

  // Create the exportData directory if it doesn't exist
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

module.exports = { setupDirectories };
