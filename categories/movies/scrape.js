const puppeteer = require('puppeteer');
const fs = require('fs');

const URL = 'https://www.imdb.com/search/title/?count=100&groups=top_1000&sort=user_rating';
const saveToFileName='moviesList.JSON';


let scrapeAndSaveJSON = async ()=>{
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage();

    

    var movies=[];

    for (var i=0;i<10;i++){


        if (i===0){
            await page.goto(URL,{waitUntil:'networkidle2'});
        }else{
            //await page.click('.next-page,.lister-page-next').catch(err=>console.log(err));
            //await page.waitForNavigation();
            await page.evaluate(selector=>document.querySelector(selector).click(),'.next-page',{waitUntil:'networkidle2'});
            await page.waitForNavigation();
        }//end if

        movies = movies.concat(await page.evaluate(()=>{
            return Array.from(document.querySelectorAll('.lister-item-header a')).map(x=>x.innerText);
        }).catch(err=>console.log(err)));
    
        
        
        console.log(`page ${i+1} done`);
        

    }

    
    browser.close();
    console.log(movies.length);



    //next step: save JSON file. 
    
    await fs.writeFile(saveToFileName,JSON.stringify(movies),err=>{
        if (err) throw err;
        console.log(`file "${saveToFileName}" saved successfully`);
    });

    
};


scrapeAndSaveJSON();



