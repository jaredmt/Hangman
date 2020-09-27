
/*
this is used to scrape the web and extract data for hangman. It only  needs to run once to get the list and save a JSON file
*/
const puppeteer = require('puppeteer');
const fs = require('fs');

const URL = 'https://rateyourmusic.com/list/noname219/top_1000_rock_artists/1/';
const saveToFileName='rock bandsList.JSON';


let scrapeAndSaveJSON = async ()=>{
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage();

    

    var bands=[];

    for (var i=0;i<10;i++){


        if (i===0){
            await page.goto(URL,{waitUntil:'networkidle2'});
        }else{
            //await page.click('.next-page,.lister-page-next').catch(err=>console.log(err));
            //await page.waitForNavigation();
            await page.evaluate(selector=>document.querySelector(selector).click(),'.navlinknext',{waitUntil:'networkidle2'});
            await page.waitForNavigation();
        }//end if

        bands = bands.concat(await page.evaluate(()=>{
            return Array.from(document.querySelectorAll('a.list_artist')).map(x=>x.innerText);
        }).catch(err=>console.log(err)));
    
        
        
        console.log(`page ${i+1} done`);
        

    }

    
    browser.close();
    console.log(bands.length);



    //next step: save JSON file. 
    
    await fs.writeFile(saveToFileName,JSON.stringify(bands),err=>{
        if (err) throw err;
        console.log(`file "${saveToFileName}" saved successfully`);
    });

    
};


scrapeAndSaveJSON();



