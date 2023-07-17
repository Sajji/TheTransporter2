const postData = require('../../postUtils.js');

// Define arrays to store errors
const domainErrors = [];
const assetErrors = [];
const attributeErrors = [];
const relationErrors = [];

async function postDomains() {
  try {
    // Function code...

  } catch (error) {
    console.error(`POST request failed for domain '${domain.name}':`, error.response.status);
    domainErrors.push(error.response.data);
  }
}

async function postAssets() {
  try {
    // Function code...

  } catch (error) {
    console.error(`POST request failed for asset`, error.response.status);
    assetErrors.push(error.response.data);
  }
}

async function postAttributes() {
  try {
    // Function code...

  } catch (error) {
    // Handle error
    attributeErrors.push(error.response.data);
  }
}

async function postRelations() {
  try {
    // Function code...

  } catch (error) {
    console.error(`POST request failed for relation ':`, error.response.data);
    relationErrors.push(error.response.data);
  }
}

async function postAll() {
  await postDomains();
  await postAssets();
  await postAttributes();
  await postRelations();
}

module.exports = {
  postAll,
  domainErrors,
  assetErrors,
  attributeErrors,
  relationErrors
};
