const puppeteer = require('puppeteer');
const fs = require('fs');

const URL = 'https://bleacherreport.com/articles/741676-the-100-most-beloved-athletes-in-sports-history';
const saveToFileName='athletesList.JSON';


let scrapeAndSaveJSON = async ()=>{
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage();

    

    var athletes=[];

    for (var i=0;i<1;i++){


        if (i===0){
            await page.goto(URL,{waitUntil:'networkidle2'});
        }else{
            //await page.click('.next-page,.lister-page-next').catch(err=>console.log(err));
            //await page.waitForNavigation();
            await page.evaluate(selector=>document.querySelector(selector).click(),'.next-page',{waitUntil:'networkidle2'});
            await page.waitForNavigation();
        }//end if

        athletes = athletes.concat(await page.evaluate(()=>{
            return Array.from(document.querySelectorAll('.contentStream h1'))
            .map(x=>x.innerText.slice(3)
            .replaceAll(".","")
            .trim())
            .slice(2)//ignore first 2 (not names)
            .reverse();//reverse (since list was set in reverse order)
        }).catch(err=>console.log(err)));
    
        
        
        console.log(`page ${i+1} done`);
        

    }

    
    browser.close();
    console.log(athletes.length);



    //next step: save JSON file. 
    
    await fs.writeFile(saveToFileName,JSON.stringify(athletes),err=>{
        if (err) throw err;
        console.log(`file "${saveToFileName}" saved successfully`);
    });

    
};


scrapeAndSaveJSON();



