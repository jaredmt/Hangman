
const maxWrongGuessesStart=7;//starting number. goes down for higher difficulty;
var maxWrongGuesses = 7;
const imgEl = document.querySelector('img.output');
var img =num=>{
    return `/img/hangmanset3_${num}.png`
}


//===========functions============


//***general functions */
String.prototype.leftJustify = function( length, char ) {
    var fill = [];
    while ( fill.length + this.length < length ) {
      fill[fill.length] = char || " ";
    }
    return fill.join('') + this;
}

String.prototype.rightJustify = function( length, char ) {
    var fill = [];
    while ( fill.length + this.length < length ) {
      fill[fill.length] = char;
    }
    return this + fill.join('');
}



//**********game functions***************** */


//clear the game
async function clearGame(){
    document.querySelector('.letters').innerHTML='';
    document.querySelector('.gameboard-sentence').innerHTML='';
}


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

    //populate categories if not populated yet
    const categoriesEl = document.querySelector('#categories');
    if (!categoriesEl.querySelector('option')){
        categories.forEach(cat=>{
            let option = document.createElement('option');
            option.innerText= decodeURI( cat.leftJustify(20).replaceAll(" ", "%C2%A0"));//center text
            categoriesEl.append(option);
        });
        //document.querySelector('#categories').append("random");//add random option later
    }
    
    //get selected category
    const category = categoriesEl.options[categoriesEl.selectedIndex].text.trim()
    .replaceAll(String.fromCharCode(160)," ");//note below:
    /*special character was used to center text with space that HTML recognizes.
    need to replace spcial white space with standard space char
    */

    //populate difficulties
    const difficulties = document.querySelector('#difficulty');
    const difficultyOptions=["I refuse to try","challenging","I live dangerously"]
    .map(d=>decodeURI( d.leftJustify(20).replaceAll(" ", "%C2%A0")));//center text
    if (!difficulties.querySelector('option')){
        difficultyOptions.forEach(diff=>{
            let difficulty = document.createElement('option');
            difficulty.innerText=diff;
            difficulties.append(difficulty);
        });
    }
    
    //get difficulty index
    const difficulty = difficultyOptions.indexOf( difficulties.options[difficulties.selectedIndex].text);
    maxWrongGuesses=maxWrongGuessesStart-difficulty;//less guesses for higher difficulty


    //choose category index at random
    /* 
    the first items on the list are generally easier to guess.
    the easier difficulties will choose one of the first items and the harder difficulties
    may choose items from the back of the list.
    */
    const cati = Math.floor(Math.random()*(.2+0.8*difficulty/(difficultyOptions.length-1))*gameData[category].length );

    //choose sentence
    const sentence = gameData[category][cati];//for now
    /*const sentence = `here is a: sentence-words/symbols`;/* testing phrases that contain symbols*/
    //console.log(sentence);//gives answer away
    localStorage.setItem('sessionInfo',JSON.stringify({
        'category':categories.indexOf(category),
        'sentence':cati,
        'wrongGuesses':0,
        'gameEnd':false
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
    
    imgEl.src=img(1);
    

    //add events to all the letters to choose from
    await document.querySelectorAll('.letter').forEach(L=>{
        
        L.addEventListener('click',async eL=>{
            await checkLetter(eL);
        });
    });
}







//game started. user clicked a letter
async function checkLetter(e){
    //get game data
    const sessionInfo=await JSON.parse(localStorage.getItem('sessionInfo'));
    const gameData = await (await fetch('./categories/gameData.JSON')).json();
    const categories = Object.keys(gameData);
    const category=categories[sessionInfo.category];
    const sentence = gameData[category][sessionInfo.sentence].toUpperCase();

    if (sessionInfo.wrongGuesses>=maxWrongGuesses){
        //current game is over
        return;
    }

    
    //console.log(sentence);
    const letterGuessed = e.target.innerText||e;
    
    //console.log(`guessed: ${letterGuessed}, correct: ${sentence}`);
    const lettersEl = await document.querySelectorAll('.gameboard-letter');
    //console.log(lettersEl);
    var guessedCorrect = false;
    const sentenceAnswer = [...sentence.matchAll('[A-Z]')].map(x=>x[0]);

    if (!document.querySelector('.gameboard-letter-unknown')){
        //game already ended and answer was found.
        return;
    }

    //cycle through each letter of known answer and currently displayed answer
    //check if it matches the guessed letter
    sentenceAnswer.forEach((letterAnswer,i)=>{
        //console.log(letterAnswer);
        if (letterAnswer==letterGuessed){
            lettersEl[i].innerText=letterAnswer;//display correct answer
            lettersEl[i].className='gameboard-letter';
            e.target.className='letter letter-pressed';
            guessedCorrect=true;
        }

    });

    //if no correct letter found, then mark as wrong
    if (!guessedCorrect){

        if (e.target.className.indexOf('letter-wrong')>=0){
            //already wrongfully guessed this. no action needed
            return;
        }


        e.target.className='letter letter-wrong';

        //check if user lost (max guesses reached)
        sessionInfo.wrongGuesses++;
        await localStorage.setItem('sessionInfo',JSON.stringify(sessionInfo));
        imgEl.src=img(sessionInfo.wrongGuesses+1);
        if (sessionInfo.wrongGuesses>=maxWrongGuesses){
            console.log('LOSER!!!!');
            await showLosingAnimation();
            sessionInfo.gameEnd=true;
            localStorage.setItem('sessionInfo',JSON.stringify(sessionInfo));
        }
    }

    //check if user won
    if (!document.querySelector('.gameboard-letter-unknown')){
        console.log('win!!!!');
        await showWinningAnimation();
        sessionInfo.gameEnd=true;
        localStorage.setItem('sessionInfo',JSON.stringify(sessionInfo));
    }


}


async function newGame(){
    await clearGame();
    await setGame();

    //scroll to game container
    document.querySelector('.game-container').scrollIntoView();
}


async function showLosingAnimation(t){
    t=t||2000;
    img.src=img(8);
    await setTimeout(()=>{
        imgEl.src='img/KennyDies.gif';
    },t);
    
}


async function showWinningAnimation(t){
    t=t||2000;

    imgEl.src='img/fireworks.gif';
    await setTimeout(()=>{
        imgEl.src='img/KennyDancing.gif';
    },t);
    
}




//=======add all event listeners=========
document.addEventListener('DOMContentLoaded',async e=>{
    await setGame();//setGame();//start game immediately

    
});

document.querySelector('.btn').addEventListener('click',async e=>{
    await newGame();
});

document.querySelector('#categories').addEventListener('change',async e=>{
    await newGame();
});

document.querySelector('#difficulty').addEventListener('change',async e=>{
    await newGame();
});

document.addEventListener('keydown',async e=>{
    //console.log(e.key);
    const letter = e.key.toUpperCase();
    if(letter.length==1&&letter.match('[A-Z]')){
        //key pressed is a letter. submit this letter
        
        //find letter element
        const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const letterEl = document.querySelectorAll('.letter')[letters.indexOf(letter)];

        //force event for this letter
        letterEl.dispatchEvent(new Event('click'));

    }else if (e.key=="Enter"){//only make new game on enter if the has ended
        if(JSON.parse(localStorage.getItem('sessionInfo')).gameEnd){
            await newGame();
        }
    }else if (e.key=="Escape"){
        await newGame();
    }
    
});