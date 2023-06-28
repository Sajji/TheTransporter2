const fs = require('fs');
const path = require('path');

async function createSummary() {
  const sourceBackupsDir = path.join(__dirname, '../sourceBackups');
  const summaryFilePath = path.join(__dirname, '../exportData', 'summary.json');

  try {
    // Read all JSON files in the sourceBackups directory
    const files = fs.readdirSync(sourceBackupsDir);
    const summary = {};

    // Iterate through each file
    for (const file of files) {
      const filePath = path.join(sourceBackupsDir, file);

      // Check if the file is a JSON file
      if (path.extname(file) === '.json') {
        // Read the JSON file and count the number of objects
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const objectCount = Array.isArray(jsonData) ? jsonData.length : 0;

        // Store the count in the summary object
        summary[file] = objectCount;
      }
    }

    // Write the summary object to the summary.json file
    fs.writeFileSync(summaryFilePath, JSON.stringify(summary, null, 2));
    console.log('Summary created successfully.');
  } catch (error) {
    console.error('Error while creating the summary:', error.message);
    throw error;
  }
}

module.exports = createSummary;
