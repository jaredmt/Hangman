const fs = require('fs');
const path = require('path');

//collect all the .JSON files in the subfolders and combine to a single .JSON file

var gameData = {};

const curpath = process.cwd();
//console.log(fs.readdirSync(process.cwd()));
const folders = fs.readdirSync(curpath)
//.map(p=>path.join(curpath,p))//show full path (not necessary)
.filter(d=>fs.statSync(d).isDirectory());

//loop through these folders
folders.forEach(folder=>{
    //get the filename of the JSON file
    var filename = fs.readdirSync(folder).filter(j=>j.toUpperCase().endsWith('.JSON'))[0];

    //read file and get the list
    var templist = JSON.parse(fs.readFileSync(path.join(folder,filename),'utf8'));
    //console.log(templist.length);

    //add list to gameData
    gameData[folder]=templist;
});

//save gameData to JSON file
fs.writeFile("gameData.JSON",JSON.stringify(gameData),err=>{
    if(err) throw err;
    console.log('file "gameData.JSON" saved successfully!');
});