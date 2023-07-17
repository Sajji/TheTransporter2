async function createMappingArray(sourceArray, targetArray, matchingKey, mappings) {
  const mappedArray = sourceArray.map(source => {
    const targetMatch = targetArray.find(target => target[matchingKey] === source[matchingKey]);

    if (targetMatch) {
      const mapping = { ...mappings };

      for (const key in mapping) {
        if (key.startsWith('source')) {
          mapping[key] = source[mapping[key]];
        } else if (key.startsWith('target')) {
          mapping[key] = targetMatch[mapping[key]];
        }
      }

      return mapping;
    }

    return null;
  }).filter(mapping => mapping !== null);

  return mappedArray;
}
module.exports = { createMappingArray };