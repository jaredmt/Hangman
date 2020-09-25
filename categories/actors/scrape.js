
/*
this is used to scrape the web and extract data for hangman. It only  needs to run once to get the list and save a JSON file
*/
const puppeteer = require('puppeteer');
const fs = require('fs');

const URL = 'https://www.imdb.com/list/ls022928819/';
const saveToFileName='actorsList.JSON';


let scrapeAndSaveJSON = async ()=>{
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage();

    

    var actors=[];

    for (var i=0;i<8;i++){


        if (i===0){
            await page.goto(URL,{waitUntil:'networkidle2'});
        }else{
            //await page.click('.next-page,.lister-page-next').catch(err=>console.log(err));
            //await page.waitForNavigation();
            await page.evaluate(selector=>document.querySelector(selector).click(),'.next-page',{waitUntil:'networkidle2'});
            await page.waitForNavigation();
        }//end if

        actors = actors.concat(await page.evaluate(()=>{
            return Array.from(document.querySelectorAll('.lister-item-header a')).map(x=>x.innerText);
        }).catch(err=>console.log(err)));
    
        
        
        console.log(`page ${i+1} done`);
        

    }

    
    browser.close();
    console.log(actors.length);



    //next step: save JSON file. 
    
    await fs.writeFile(saveToFileName,JSON.stringify(actors),err=>{
        if (err) throw err;
        console.log(`file "${saveToFileName}" saved successfully`);
    });

    
};


scrapeAndSaveJSON();



