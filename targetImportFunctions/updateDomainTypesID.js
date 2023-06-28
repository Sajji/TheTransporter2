const fs = require('fs');
const path = require('path');

async function updateDomainTypesID() {
  // Read the domainTypesIDfix.json file
  const domainTypesIDFixFile = path.join('systemDelta', 'domainTypesIDfix.json');
  const domainTypesIDFixData = JSON.parse(fs.readFileSync(domainTypesIDFixFile, 'utf8'));

  // Read the domains.json file
  const domainsFile = path.join('sourceBackups', 'domains.json');
  const domainsData = JSON.parse(fs.readFileSync(domainsFile, 'utf8'));

  // Iterate through each object in domainTypesIDFixData
  for (const item of domainTypesIDFixData) {
    const { sourceId, targetId } = item;

    // Find matching domains in domainsData
    const matchingDomains = domainsData.filter(domain => domain.typeId === sourceId);

    // Update the "typeId" with the "targetId" in matching domains
    for (const domain of matchingDomains) {
      domain.typeId = targetId;
    }
  }

  // Write the updated domainsData to the domains.json file
  fs.writeFileSync(domainsFile, JSON.stringify(domainsData, null, 2));
  console.log('Domain types ID updated successfully.');
}

module.exports = updateDomainTypesID;
