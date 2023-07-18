const fs = require('fs');
const path = require('path');
const JSONStream = require('JSONStream');

async function consolidateJSONData() {
  const sourceDirectory = './sourceBackups/gqlData';
  const outputFile = './sourceBackups/consolidatedData.json';

  try {
    if (!fs.existsSync(sourceDirectory)) {
      console.error('Source directory does not exist:', sourceDirectory);
      return;
    }

    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log('Output directory created:', outputDir);
    }

    // Create a writable stream to the output file
    const outputStream = fs.createWriteStream(outputFile);

    // Iterate through each file
    const files = await fs.promises.readdir(sourceDirectory);
    for (const file of files) {
      // Read the contents of each JSON file as a readable stream
      const filePath = path.join(sourceDirectory, file);
      const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });

      try {
        // Create a JSON parser stream
        const jsonStream = JSONStream.parse('*');

        // Pipe the readable stream through the JSON parser to extract objects
        fileStream.pipe(jsonStream);

        // Pipe the extracted objects to the writable stream
        jsonStream.on('data', data => {
          const jsonData = JSON.stringify(data); // Convert object to string
          outputStream.write(jsonData);
        });

        // Wait for the stream to finish processing
        await new Promise((resolve, reject) => {
          jsonStream.on('end', resolve);
          jsonStream.on('error', reject);
        });
      } catch (error) {
        console.error(`Error parsing file '${file}':`, error);
      }
    }

    // Close the output stream
    outputStream.end();

    console.log(`Consolidated data saved to '${outputFile}'.`);
  } catch (error) {
    console.error('Error consolidating JSON data:', error);
  }
}

// Example usage:
consolidateJSONData()
  .catch(error => {
    console.error('Error in example usage:', error);
  });

module.exports = consolidateJSONData;
