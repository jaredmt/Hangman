/**
 * this file is for testing in nodeJS
 */


const fs = require('fs');

//get gameData
const gameData=JSON.parse(fs.readFileSync('./categories/gameData.JSON','utf8'));
const categories = Object.keys(gameData);





