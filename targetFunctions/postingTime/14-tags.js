const fs = require('fs');
const path = require('path');

async function createallTagsFile() {
    const sourceDirectory = '../../sourceBackups/gqlData';
  
    try {
      // Read all the file names in the source directory
      const files = await fs.promises.readdir(sourceDirectory);
  
      // Array to store all tags
      const allTags = [];
  
      // Iterate through each file
      for (const file of files) {
        // Skip files that are not JSON
        if (!file.endsWith('.json')) {
          continue;
        }
  
        // Read the contents of each JSON file
        const filePath = path.join(sourceDirectory, file);
        const assetData = await fs.promises.readFile(filePath, 'utf8');
        const asset = JSON.parse(assetData);
  
        const transformedTags = asset
          .filter(asset => asset.tags && asset.tags.length > 0) // Filter out assets with empty tags array
          .map(asset => ({
            assetId: asset.id,
            tagNames: asset.tags.map(tag => tag.name) 
          }));
  
        allTags.push(...transformedTags);
      }
  
      const sourceArray = allTags;
  
      const outputFile = '../readyTopost/post-allTags.json';
      await fs.promises.writeFile(outputFile, JSON.stringify(sourceArray, null, 2));
  
      console.log(`Created ${outputFile}`);
      console.log('All tags data created successfully.');
    } catch (error) {
      console.error('Error creating tags data:', error);
    }
  }
  
  // Example usage:
  module.exports = createallTagsFile;
