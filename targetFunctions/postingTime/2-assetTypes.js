const fs = require('fs');

async function updateAssetTypes() {
  return new Promise((resolve, reject) => {
    try {
      // Read assetTypes.json file
      const assetTypesFile = '../../sourceBackups/assetTypes.json';
      const assetTypes = JSON.parse(fs.readFileSync(assetTypesFile, 'utf8'));

      // Read assetTypeMapping.json file
      const mappingFile = './tempFiles/assetTypeMapping.json';
      const mappings = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));

      // Temporary array for id substitution
      const updatedAssetTypesId = assetTypes.map((assetType) => {
        const matchingMapping = mappings.find((mapping) => mapping.targetName === assetType.name);

        if (matchingMapping) {
          const { targetId, ...rest } = matchingMapping;
          return {
            ...assetType,
            id: targetId,
            ...rest,
          };
        }

        return assetType;
      });

      // Temporary array for parentId substitution
      const updatedAssetTypesIdParent = updatedAssetTypesId.map((assetType) => {
        const matchingMapping = mappings.find((mapping) => mapping.targetName === assetType.parentName);

        if (matchingMapping) {
          return {
            ...assetType,
            parentId: matchingMapping.targetId,
          };
        }

        return assetType;
      });

      // Save the updated asset types to a new file
      const updatedAssetTypesFile = './tempFiles/updatedAssetTypes.json';
      fs.writeFileSync(updatedAssetTypesFile, JSON.stringify(updatedAssetTypesIdParent, null, 2));

      console.log(`Updated asset types saved to: ${updatedAssetTypesFile}`);
      resolve();
    } catch (error) {
      console.error('Error updating asset types:', error.message);
      reject(error);
    }
  });
}
//updateAssetTypes();
module.exports = updateAssetTypes;
