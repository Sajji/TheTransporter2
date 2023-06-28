const fs = require('fs');
const path = require('path');

async function combineFiles() {
  const sourceBackupsDir = path.join(__dirname, '../sourceBackups');
  const logDir = path.join(__dirname, '../exportData');
  const consolidatedFilePath = path.join(logDir, 'consolidated.json');

  try {
    // Read all JSON files in the sourceBackups directory
    const files = fs.readdirSync(sourceBackupsDir);
    const consolidatedData = {};

    // Iterate through each file
    for (const file of files) {
      const filePath = path.join(sourceBackupsDir, file);

      // Check if the file is a JSON file
      if (path.extname(file) === '.json') {
        // Read the JSON file
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Use the file name as the key and store the data array
        const key = path.parse(file).name;
        consolidatedData[key] = jsonData;
      }
    }

    // Write the consolidated data to the consolidated.json file
    fs.writeFileSync(consolidatedFilePath, JSON.stringify(consolidatedData, null, 2));
    console.log('Files consolidated successfully.');
  } catch (error) {
    console.error('Error while consolidating files:', error.message);
    throw error;
  }
}

module.exports = combineFiles;
