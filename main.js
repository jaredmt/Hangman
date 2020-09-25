

//sets up the game
async function setGame(){
    const gameData = await (await fetch('./categories/gameData.JSON')).json();
    const categories = Object.keys(gameData);
    const letters = document.querySelector('.letters');

    //set up letter choices
    const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for(letter of abc){
        let newletter = document.createElement('div');
        newletter.className='letter';
        newletter.innerText=letter;
        letters.append(newletter);
    }

    //choose category
    const category = categories[0];//for now

    //choose sentence
    const sentence = gameData[category][0];//for now
    /*const sentence = `here is a: sentence-words/symbols`;/* testing phrases that contain symbols*/
    console.log(sentence);
    localStorage.setItem('sessionInfo',JSON.stringify({
        'category':0,
        'sentence':0
    }));//save the phrase of this current session to local storage
    const words = sentence.split(" ");

    //display sentence
    const sentenceEl = document.querySelector('.gameboard-sentence');
    
    //cycle through words to set up the game board
    for (word of words){
        var space = document.createElement('div');
        space.className='gameboard-nonletter';
        space.innerText=' ';
        
        let newword = document.createElement('div');
        newword.className='gameboard-word';
        for(letter of word){
            let newletter = document.createElement('div');
            

            if (letter.toUpperCase().match('[A-Z]')){
                newletter.className='gameboard-letter gameboard-letter-unknown';
                newletter.innerText=letter.toUpperCase();//actual letter
                newletter.innerText='_';
            }else{
                newletter.className='gameboard-nonletter';
                newletter.innerHTML=letter;
            }
            
            newword.append(newletter);
        }
        sentenceEl.append(newword);
        sentenceEl.append(space);
        
    }
    sentenceEl.removeChild(space);//no space at the end of the sentence
    
    
}


//add all event listeners
document.addEventListener('DOMContentLoaded',async e=>{
    await setGame();//setGame();//start game immediately


    //add events to all the letters to choose from
    await document.querySelectorAll('.letter').forEach(L=>{
        
        L.addEventListener('click',async eL=>{
            await checkLetter(eL);
        });
    });




});




//game started. user clicked a letter
async function checkLetter(e){
    //get game data
    const sessionInfo=await JSON.parse(localStorage.getItem('sessionInfo'));
    const gameData = await (await fetch('./categories/gameData.JSON')).json();
    const categories = Object.keys(gameData);
    const category=categories[sessionInfo.category];
    const sentence = gameData[category][sessionInfo.sentence];
    //console.log(sentence);
    const letterGuessed = e.target.innerText;
    console.log(letterGuessed);
}