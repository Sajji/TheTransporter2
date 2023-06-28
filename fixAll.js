const updateAssetTypesID = require('./targetImportFunctions/updateAssetTypesID');
const updateattributeTypesID = require('./targetImportFunctions/updateAttributeTypesID');
const updateDomainTypesID = require('./targetImportFunctions/updateDomainTypesID');
const updateRelationTypesID = require('./targetImportFunctions/updateRelationTypesID');

async function fixAll() {
    await updateAssetTypesID();
    await updateattributeTypesID();
    await updateDomainTypesID();
    await updateRelationTypesID();
}

module.exports = fixAll;
