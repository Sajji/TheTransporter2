const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function postRelations() {
  const sourceBackupsDir = 'sourceBackups';
  const targetBackupsDir = 'targetBackups';
  const resultDir = 'missingRelation';
  const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

  // Create the result directory if it doesn't exist
  if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir);
  }

  // Function to compare the relations based on unique keys
  function compareRelations() {
    const sourceRelationsFile = path.join(sourceBackupsDir, 'relations.json');
    const targetRelationsFile = path.join(targetBackupsDir, 'relations.json');

    const sourceRelations = JSON.parse(fs.readFileSync(sourceRelationsFile, 'utf8'));
    const targetRelations = JSON.parse(fs.readFileSync(targetRelationsFile, 'utf8'));

    const missingRelations = [];

    for (const sourceRelation of sourceRelations) {
      let isMatching = false;

      for (const targetRelation of targetRelations) {
        if (
          sourceRelation.resourceType === targetRelation.resourceType &&
          sourceRelation.source.name === targetRelation.source.name &&
          sourceRelation.target.name === targetRelation.target.name
        ) {
          isMatching = true;
          break;
        }
      }

      if (!isMatching) {
        missingRelations.push({
          id: sourceRelation.id,
          typeId: sourceRelation.type.id,
          sourceId: sourceRelation.source.id,
          targetId: sourceRelation.target.id
        });
      }
    }

    return missingRelations;
  }

  // Compare the relations and get the missing relations
  const missingRelations = compareRelations();

  // Save the missing relations to a file
  const missingRelationsFile = path.join(resultDir, 'missingRelations.json');
  fs.writeFileSync(missingRelationsFile, JSON.stringify(missingRelations, null, 2));
  console.log(`Missing relations saved to ${missingRelationsFile}`);

  // Function to chunk the missing relations into smaller arrays
  function chunkRelations(relations, chunkSize) {
    const chunks = [];
    for (let i = 0; i < relations.length; i += chunkSize) {
      chunks.push(relations.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Function to post relations in bulk
  async function postRelationsChunk(chunk) {
    const targetEndpoint = `${config.targetSystem.baseURL}/relations/bulk`;

    try {
      const response = await axios.post(targetEndpoint, chunk, {
        auth: {
          username: config.targetSystem.username,
          password: config.targetSystem.password
        }
      });
      console.log(`Posted ${chunk.length} relations successfully.`);
      //console.log(response.data);
      // Call the PATCH command here using the response data
    } catch (error) {
      console.error(`Error while posting relations: ${error.message}`);
    }
  }

  // Post missing relations in chunks of 1000
  const chunkSize = 10000;
  const relationChunks = chunkRelations(missingRelations, chunkSize);

  for (const chunk of relationChunks) {
    await postRelationsChunk(chunk);
  }
}

// Call the async function
module.exports = postRelations;
