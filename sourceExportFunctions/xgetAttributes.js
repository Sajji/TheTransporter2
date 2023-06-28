const fetchData = require('../apiUtils.js');
const writeToFile = require('../fileUtils.js');
const fs = require('fs');

async function fetchAttributes(fileName) {
  const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
  const assetsFile = './sourceBackups/assets.json';
  const assetData = JSON.parse(fs.readFileSync(assetsFile, 'utf8'));

  const allAttributes = await fetchAllAttributes(config);

  const assetIds = assetData.map(asset => asset.id);
  const filteredAttributes = allAttributes.filter(attribute =>
    assetIds.includes(attribute.asset.id)
  );

  // Add uniqueName property to each attribute object
  filteredAttributes.forEach(attribute => {
    attribute.uniqueName = `${attribute.resourceType} ${attribute.type.name} ${attribute.asset.name}`;
  });

  writeToFile(filteredAttributes, fileName);
}


async function fetchAllAttributes(config) {
  const attributesEndpoint = 'attributes';
  const allAttributes = await fetchData(attributesEndpoint, config);
  return allAttributes;
}

module.exports = fetchAttributes;
