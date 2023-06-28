const fs = require('fs');
const path = require('path');

const systemDeltaDir = './systemDelta';

// Function to combine "sourceType.name" and "targetType.name" keys
function combineTypeNames(sourceType, role, coRole, targetType) {
  return `${sourceType.name}${role}${coRole}${targetType.name}`;
}

// Function to create the relation type mapping array
function createRelationTypeMappingArray(data) {
  return data.map((item) => {
    const { sourceType, targetType, role, coRole } = item;
    return {
      id: item.id,
      sourceTypeId: sourceType.id,
      sourceTypeName: sourceType.name,
      targetTypeId: targetType.id,
      targetTypeName: targetType.name,
      role,
      coRole,
      compareValue: combineTypeNames(sourceType, role, coRole, targetType),
    };
  });
}

// Function to write data to a file
async function writeDataToFile(data, filename) {
  const filePath = path.join(systemDeltaDir, filename);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  console.log(`Data saved to ${filename}`);
}

// Function to compare the two relation type mapping arrays and identify missing and mismatched items
function compareRelationTypes(sourceTypes, targetTypes) {
  const missingItems = sourceTypes.filter((sourceItem) => {
    return !targetTypes.some((targetItem) => targetItem.compareValue === sourceItem.compareValue);
  });

  const mismatchedItems = [];

  for (const sourceItem of sourceTypes) {
    const matchingTargetItem = targetTypes.find((targetItem) => targetItem.compareValue === sourceItem.compareValue);
    if (matchingTargetItem && matchingTargetItem.id !== sourceItem.id) {
      mismatchedItems.push({
        compareValue: sourceItem.compareValue,
        sourceId: sourceItem.id,
        targetId: matchingTargetItem.id,
      });
    }
  }

  return {
    missingItems,
    mismatchedItems,
  };
}

// Function to compare relation types and write the comparison results to separate files
async function compareAndWriteRelationTypes() {
  try {
    const sourceFile = path.join('./sourceBackups', 'relationTypes.json');
const targetFile = path.join('./targetBackups', 'relationTypes.json');
    const [sourceData, targetData] = await Promise.all([
      fs.promises.readFile(sourceFile, 'utf8'),
      fs.promises.readFile(targetFile, 'utf8'),
    ]);

    const sourceRelationTypes = createRelationTypeMappingArray(JSON.parse(sourceData));
    const targetRelationTypes = createRelationTypeMappingArray(JSON.parse(targetData));

    const comparisonResults = compareRelationTypes(sourceRelationTypes, targetRelationTypes);

    const missingFile = 'relationTypesMissing.json';
    await writeDataToFile(comparisonResults.missingItems, missingFile);
    console.log(`Missing relation types saved to ${missingFile}`);

    const mismatchedFile = 'relationTypesIDfix.json';
    await writeDataToFile(comparisonResults.mismatchedItems, mismatchedFile);
    console.log(`Relation types with differing IDs saved to ${mismatchedFile}`);
  } catch (error) {
    console.error(`Error while comparing relation types: ${error.message}`);
  }
}

// Read relationTypes.json files from sourceBackups and targetBackups


module.exports = compareAndWriteRelationTypes;
