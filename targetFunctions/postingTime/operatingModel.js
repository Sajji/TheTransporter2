async function operatingModel() {
  const addAssetTypes = require('./1-assetTypes.js');
  await addAssetTypes();
  const updateAssetTypes = require('./2-assetTypes.js');
  await updateAssetTypes();
  const patchAssetTypes = require('./3-assetTypes.js');
  await patchAssetTypes();
  const createAssetTypeMappings = require('./4-assetTypes.js');
  await createAssetTypeMappings();
  const postAttributeTypes = require('./5-attributeTypes.js');
  await postAttributeTypes();
  const createAttributeTypesMappings = require('./6-attributeTypes.js');
  await createAttributeTypesMappings();
  const addDomainTypes = require('./7-domainTypes.js');
  await addDomainTypes();
  const addRelationTypes = require('./8-relationTypes.js');
  await addRelationTypes();
}

module.exports = operatingModel;
