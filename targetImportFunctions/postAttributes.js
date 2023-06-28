const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function postAttributes() {
  const sourceBackupsDir = 'sourceBackups';
  const targetBackupsDir = 'targetBackups';
  const resultDir = 'missingAttribute';
  const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

  // Create the result directory if it doesn't exist
  if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir);
  }

  // Function to compare the attributes based on unique keys
  function compareAttributes() {
    const sourceAttributesFile = path.join(sourceBackupsDir, 'attributes.json');
    const targetAttributesFile = path.join(targetBackupsDir, 'attributes.json');

    const sourceAttributes = JSON.parse(fs.readFileSync(sourceAttributesFile, 'utf8'));
    const targetAttributes = JSON.parse(fs.readFileSync(targetAttributesFile, 'utf8'));

    const missingAttributes = [];

    for (const sourceAttribute of sourceAttributes) {
      let isMatching = false;

      for (const targetAttribute of targetAttributes) {
        if (
          sourceAttribute.resourceType === targetAttribute.resourceType &&
          sourceAttribute.type.name === targetAttribute.type.name &&
          sourceAttribute.asset.name === targetAttribute.asset.name
        ) {
          isMatching = true;
          break;
        }
      }

      if (!isMatching) {
        missingAttributes.push({
          id: sourceAttribute.id,
          typeId: sourceAttribute.type.id,
          assetId: sourceAttribute.asset.id,
          value: sourceAttribute.value
        });
      }
    }

    return missingAttributes;
  }

  // Compare the attributes and get the missing attributes
  const missingAttributes = compareAttributes();

  // Save the missing attributes to a file
  const missingAttributesFile = path.join(resultDir, 'missingAttributes.json');
  fs.writeFileSync(missingAttributesFile, JSON.stringify(missingAttributes, null, 2));
  console.log(`Missing attributes saved to ${missingAttributesFile}`);

  // Function to chunk the missing attributes into smaller arrays
  function chunkAttributes(attributes, chunkSize) {
    const chunks = [];
    for (let i = 0; i < attributes.length; i += chunkSize) {
      chunks.push(attributes.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Function to post attributes in bulk
  async function postAttributesChunk(chunk) {
    const targetEndpoint = `${config.targetSystem.baseURL}/attributes/bulk`;

    try {
      const response = await axios.post(targetEndpoint, chunk, {
        auth: {
          username: config.targetSystem.username,
          password: config.targetSystem.password
        }
      });
      console.log(`Posted ${chunk.length} attributes successfully.`);
      //console.log(response.data);
      // Call the PATCH command here using the response data
    } catch (error) {
      console.error(`Error while posting attributes: ${error.message}`);
    }
  }

  // Post missing attributes in chunks of 1000
  const chunkSize = 10000;
  const attributeChunks = chunkAttributes(missingAttributes, chunkSize);

  for (const chunk of attributeChunks) {
    await postAttributesChunk(chunk);
  }
}

// Call the async function
module.exports = postAttributes;
