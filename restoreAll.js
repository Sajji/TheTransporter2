const fs = require('fs');

const extractConsolidatedData = require('./targetImportFunctions/extractConsolidatedData.js');
const getTargetData = require('./targetImportFunctions/getTargetData.js');
const compareAssetTypesData = require('./targetImportFunctions/yAssetTypes.js');
const comparedomainTypesData = require('./targetImportFunctions/yDomainTypes.js');
const compareattributeTypesData = require('./targetImportFunctions/yAttributeTypes.js');
const compareAndWriteRelationTypes = require('./targetImportFunctions/yRelationTypes.js');
const convertData = require('./targetImportFunctions/attributeTypeConversion.js');
const postAssetTypes = require('./targetImportFunctions/postAssetTypes.js');
const postAttributeTypes = require('./targetImportFunctions/postAttributeTypes.js');
const postDomainTypes = require('./targetImportFunctions/postDomainTypes.js');
const postRelationTypes = require('./targetImportFunctions/postRelationTypes.js');
const fixAll = require('./fixAll.js');
const postCommunities = require('./targetImportFunctions/postCommunities.js');
const postDomains = require('./targetImportFunctions/postDomains.js');
const postAssets = require('./targetImportFunctions/postAssets.js');
const postAttributes = require('./targetImportFunctions/postAttributes.js');
const postRelations = require('./targetImportFunctions/postRelations.js');


async function postAll() {
    await extractConsolidatedData();
    await getTargetData();
    await compareattributeTypesData();
    await convertData();
    await comparedomainTypesData();
    await compareAssetTypesData();
    await compareAndWriteRelationTypes();
    await fixAll();
    await postAssetTypes();
    await postAttributeTypes();
    await postDomainTypes();
    await postRelationTypes();
    await postCommunities();
    await postDomains();
    await postAssets();
    await postAttributes();
    await postRelations();
}

postAll();

