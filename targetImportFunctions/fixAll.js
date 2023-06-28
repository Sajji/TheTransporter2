const updateAssetTypesID = require('./updateAssetTypesID');

// Call the function
updateAssetTypesID()
  .then(() => {
    console.log('Asset types ID update completed.');
  })
  .catch(error => {
    console.error('Error occurred during asset types ID update:', error);
  });
