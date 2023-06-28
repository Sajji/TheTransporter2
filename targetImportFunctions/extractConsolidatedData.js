const fs = require('fs');
const path = require('path');

async function extractConsolidatedData() {
  try {
    const consolidatedFilePath = './exportData/consolidated.json';
    const sourceBackupsDir = './sourceBackups';

    // Create the sourceBackups directory if it doesn't exist
    if (!fs.existsSync(sourceBackupsDir)) {
      fs.mkdirSync(sourceBackupsDir);
    }

    // Read the consolidated.json file
    const consolidatedData = JSON.parse(await fs.promises.readFile(consolidatedFilePath, 'utf8'));

    // Extract each array from the consolidated data and write them into separate files
    for (const [key, value] of Object.entries(consolidatedData)) {
      const arrayName = `${key}.json`;
      const filePath = path.join(sourceBackupsDir, arrayName);

      // Overwrite the file if it already exists
      await fs.promises.writeFile(filePath, JSON.stringify(value, null, 2));

      console.log(`Extracted ${arrayName} to ${filePath}`);
    }

    console.log('Extraction completed successfully.');
  } catch (error) {
    console.error('Error while extracting consolidated data:', error.message);
    throw error;
  }
}

module.exports = extractConsolidatedData;
