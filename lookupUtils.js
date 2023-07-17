async function lookupNewId(sourceArray, lookupId, mappingArray, mappingId) {
  try {
    const updatedArray = sourceArray.map((item) => {
      const mapping = mappingArray.find((mappingItem) => mappingItem.sourceId === item[lookupId]);

      if (mapping) {
        const newId = mapping[mappingId];
        return { ...item, [lookupId]: newId };
      }
      
      return item;
    });

    return updatedArray;
  } catch (error) {
    console.error('Error during ID lookup:', error.message);
    throw error;
  }
}

module.exports = lookupNewId;
