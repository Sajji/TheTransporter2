const fs = require('fs');
const path = require('path');

async function convertData() {
  // Read the original JSON file
  const originalDataPath = path.join(__dirname, '../systemDelta/attributeTypesMissing.json');
  const originalData = JSON.parse(await fs.promises.readFile(originalDataPath, 'utf8'));

  // Mapping of resourceType to kind
  const resourceTypeToKind = {
    BooleanAttributeType: 'BOOLEAN',
    DateAttributeType: 'DATE',
    DateTimeAttributeType: 'DATE',
    MultiValueListAttributeType: 'MULTI_VALUE_LIST',
    NumericAttributeType: 'NUMERIC',
    ScriptAttributeType: 'SCRIPT',
    SingleValueListAttributeType: 'SINGLE_VALUE_LIST',
    StringAttributeType: 'STRING'
  };

  // Convert the data to the desired format
  const convertedData = originalData.map((item) => {
    const { resourceType, ...rest } = item;
    const kind = resourceTypeToKind[resourceType];
    return { kind, ...rest };
  });

  // Write the converted data to a new JSON file
  const convertedDataPath = path.join(__dirname, '../systemDelta/attributeTypesBulk.json');
  await fs.promises.writeFile(convertedDataPath, JSON.stringify(convertedData, null, 2));
  console.log('Converted data saved to systemDelta/attributeTypesBulk.json');
}

// Call the async function
module.exports = convertData;
//convertData();