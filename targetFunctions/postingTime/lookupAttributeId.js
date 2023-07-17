async function lookupAttributeIds(sourceArray, lookupId, mappingArray, mappingId) {
    try {
      const updatedArray = sourceArray.map((item) => {
        const attributeType = item.attributeType;
        const mapping = mappingArray.find((mappingItem) => mappingItem.sourceId === attributeType[lookupId]);
  
        if (mapping) {
          const newId = mapping[mappingId];
          return { ...item, attributeType: { ...attributeType, [lookupId]: newId } };
        }
  
        return item;
      });
  
      return updatedArray;
    } catch (error) {
      console.error('Error during ID lookup:', error.message);
      throw error;
    }
  }
  
  module.exports = lookupAttributeIds;
  