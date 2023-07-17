async function compareArrays(sourceArray, targetArray, compareKey) {
    try {
      const sourceKeys = new Set(sourceArray.map(item => item[compareKey]));
      const missingObjects = sourceArray.filter(item => !sourceKeys.has(item[compareKey]) || !targetArray.find(obj => obj[compareKey] === item[compareKey]));
      return missingObjects;
    } catch (error) {
      console.error('Error comparing arrays:', error.message);
      throw error;
    }
  }
  
  module.exports = { compareArrays };
  