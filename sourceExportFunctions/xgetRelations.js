const fetchData = require('../apiUtils.js');
const writeToFile = require('../fileUtils.js');
const fs = require('fs');

async function fetchRelations(fileName) {
  const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
  const allRelations = await fetchAllRelations(config);
  const assetsFile = './sourceBackups/assets.json';
  const assetData = JSON.parse(fs.readFileSync(assetsFile, 'utf8'));

  const assetIds = assetData.map(asset => asset.id);
  const filteredRelations = allRelations.filter(relation =>
    assetIds.includes(relation.source.id) && assetIds.includes(relation.target.id)
  );

  // Add uniqueName property to each relation object
  filteredRelations.forEach(relation => {
    relation.uniqueName = `${relation.resourceType} ${relation.source.name} ${relation.target.name}`;
  });

  writeToFile(filteredRelations, fileName);
}


async function fetchAllRelations(config) {
  const relationsEndpoint = 'relations';
  const allRelations = await fetchData(relationsEndpoint, config);
  return allRelations;
}

module.exports = fetchRelations;
