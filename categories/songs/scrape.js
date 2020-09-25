
/*
this is used to scrape the web and extract data for hangman. It only  needs to run once to get the list and save a JSON file
*/
const puppeteer = require('puppeteer');
const fs = require('fs');

const URL = 'https://www.rocknrollamerica.net/Top1000.html';
const saveToFileName='songsList.JSON';


let scrapeAndSaveJSON = async ()=>{
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage();

    

    var songs=[];

    for (var i=0;i<1;i++){


        if (i===0){
            await page.goto(URL,{waitUntil:'networkidle2'});
        }else{
            //await page.click('.next-page,.lister-page-next').catch(err=>console.log(err));
            //await page.waitForNavigation();
            await page.evaluate(selector=>document.querySelector(selector).click(),'.next-page',{waitUntil:'networkidle2'});
            await page.waitForNavigation();
        }//end if

        songs = songs.concat(await page.evaluate(()=>{
            return Array.from(document.querySelectorAll('table tbody tr td:nth-of-type(2)')).map(x=>x.innerText);
        }).catch(err=>console.log(err)));
    
        
        
        console.log(`page ${i+1} done`);
        

    }

    
    browser.close();
    songs.shift();//remove first element
    console.log(songs.length);



    //next step: save JSON file. 
    
    await fs.writeFile(saveToFileName,JSON.stringify(songs),err=>{
        if (err) throw err;
        console.log(`file "${saveToFileName}" saved successfully`);
    });

    
};


scrapeAndSaveJSON();

// let mylist=[1,2,3,4,5,6];
// mylist.shift();
// console.log(mylist);



