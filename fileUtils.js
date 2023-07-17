const fs = require('fs');
const path = require('path');

// Function to write data to a file
function writeToFile(data, fileName) {
  const directoryPath = './sourceBackups/';
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  const filePath = path.join(directoryPath, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Saved data to ${filePath}`);
}

module.exports = writeToFile;
