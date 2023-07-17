const lookupNewId = require('../../lookupUtils');
const fs = require('fs');

// Usage example
async function domainTransformer() {
const sourceArrayFile = '../../sourceBackups/domains.json' 
const sourceArray = JSON.parse(fs.readFileSync(sourceArrayFile, 'utf8'));

const mappingArrayFile = '../../operatingModelMappings/domainTypeMappings.json';
const mappingArray = JSON.parse(fs.readFileSync(mappingArrayFile, 'utf8'));

const updatedArray = await lookupNewId(sourceArray, 'typeId', mappingArray, 'targetId');
console.log(updatedArray);
await fs.promises.writeFile('../readyToPOST/post-allDomains.json', JSON.stringify(updatedArray, null, 2) );
}

module.exports = domainTransformer;