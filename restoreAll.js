const fs = require('fs');
const path = require('path');

const comSource = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const updateCommunities = require('./infrastructure.js');
const createLandingZone = require('./infrastructure.js');
const createCommunities = require('./infrastructure.js');

async function restoreAll(){
    await updateCommunities();
    await createLandingZone();
    await createCommunities();
}

restoreAll();