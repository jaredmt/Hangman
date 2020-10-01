
const maxWrongGuessesStart=7;//starting number. goes down for higher difficulty;
var maxWrongGuesses = 7;//initialize. will update later
const imgEl = document.querySelector('img.output');
var img =num=>{
    return `img/Hangmanset2_${num}.png`
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
    //reset letters and sentence. these will be reinserted when the next game starts
    document.querySelector('.letters').innerHTML='';
    document.querySelector('.gameboard-sentence').innerHTML='';
}


/**sets up the game
 * general steps:
 * -fetches data for the category selected and picks a "sentence" at random
 * -sets the max number of tries based on difficulty selected
 * -sets up all letter buttons and the gameboard (blank letters to start with)
 * 
 * run this function once after DOM loaded. then run the newGame() method after
 * */
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
            option.innerText= decodeURI( cat.leftJustify(20).replace(/ /g, "%C2%A0"));//center text
            categoriesEl.append(option);
        });
        //document.querySelector('#categories').append("random");//add random option later
    }
    
    //get selected category
    const category = categoriesEl.options[categoriesEl.selectedIndex].text.trim()
    .split(String.fromCharCode(160)).join(" ");//(replaceAll not supported yet by some browsers)
    //note:
    /*special character was used to center text with space that HTML recognizes.
    need to replace spcial white space with standard space char
    */

    //populate difficulties
    const difficulties = document.querySelector('#difficulty');
    const difficultyOptions=["I refuse to try","challenging","I live dangerously"]
    .map(d=>decodeURI( d.leftJustify(20).replace(/ /g, "%C2%A0")));//center text
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
    //this will make sure the letter can be checked for correctness
    await document.querySelectorAll('.letter').forEach(L=>{
        
        L.addEventListener('click',async eL=>{
            await checkLetter(eL);
        });
    });
}







/**game started. user clicked a letter
 * 
 * */
async function checkLetter(e){
    //get game data including the sentence
    /*note that the actual sentence is not stored in localStorage, only
    the index. Just to make it require more effort to cheat*/
    const sessionInfo=await JSON.parse(localStorage.getItem('sessionInfo'));
    const gameData = await (await fetch('./categories/gameData.JSON')).json();
    const categories = Object.keys(gameData);
    const category=categories[sessionInfo.category];
    const sentence = gameData[category][sessionInfo.sentence].toUpperCase();


    // check if game is already over
    if (sessionInfo.wrongGuesses>=maxWrongGuesses){
        //current game is over. user lost
        return;
    }else if (!document.querySelector('.gameboard-letter-unknown')){
        //game already ended and answer was found.
        return;
    }

    
    //letter guessed by user
    const letterGuessed = e.target.innerText;
    
    
    const lettersEl = await document.querySelectorAll('.gameboard-letter');
    var guessedCorrect = false;//assume user guessed wrong unless it matches the answer
    //get only the letters of the actual answer (as an array)
    const sentenceAnswer = [...sentence.matchAll('[A-Z]')].map(x=>x[0]);

    

    //cycle through each letter of known answer and currently displayed answer
    //check if it matches the guessed letter
    sentenceAnswer.forEach((letterAnswer,i)=>{
        if (letterAnswer==letterGuessed){
            //the guessed letter matched a letter in the answer

            lettersEl[i].innerText=letterAnswer;//display correct answer
            lettersEl[i].className='gameboard-letter';//eliminate "unknown" class
            e.target.className='letter letter-pressed';//highlight letter to show it was already used
            guessedCorrect=true;//update to show user guessed correct
        }

    });

    //if no correct letter found, then mark as wrong
    if (!guessedCorrect){

        //first check if this letter had already been guessed previously
        if (e.target.className.indexOf('letter-wrong')>=0){
            //already wrongfully guessed this. no action needed
            return;
        }


        //mark the letter as wrong
        e.target.className='letter letter-wrong';

        //check if user lost the game (max guesses reached)
        sessionInfo.wrongGuesses++;
        await localStorage.setItem('sessionInfo',JSON.stringify(sessionInfo));
        imgEl.src=img(sessionInfo.wrongGuesses+1);//update output image
        if (sessionInfo.wrongGuesses>=maxWrongGuesses){
            //user has lost the game
            //show losing animation in output and set gameEnd to true
            console.log('LOSER!!!!');
            await showLosingAnimation();
            sessionInfo.gameEnd=true;
            localStorage.setItem('sessionInfo',JSON.stringify(sessionInfo));

            //reveal answer after a delay
            setTimeout(async ()=>{
                sentenceAnswer.forEach((letterAnswer,i)=>{
                    if (lettersEl[i].classList.contains('gameboard-letter-unknown')){
                        lettersEl[i].innerText=letterAnswer;
                        lettersEl[i].classList.remove('gameboard-letter-unknown');
                        lettersEl[i].classList.add('gameboard-letter-revealed');
                    }
                });
            },100);
            

            return;

        }
    }


    //check if user won the game
    if (!document.querySelector('.gameboard-letter-unknown')){
        //no unknown letters. user won the game.
        //show winning animation in output and set gameEnd to true
        console.log('win!!!!');
        await showWinningAnimation();
        sessionInfo.gameEnd=true;
        localStorage.setItem('sessionInfo',JSON.stringify(sessionInfo));
    }


}

//run this function each time the user click "new game" button
//it will clear the current game and set up the next
async function newGame(){
    await clearGame();
    await setGame();

    //scroll to game container
    document.querySelector('.game-container').scrollIntoView();
}

//display a losing animation in the output after the user has lost
async function showLosingAnimation(t=2000){
    img.src=img(8);
    await setTimeout(()=>{
        i=Math.ceil(Math.random()*8);
        imgEl.src=`img/Lose${i}.gif`;
    },t);

    await setTimeout(()=>{
        imgEl.src=img(8);
    },3*t);
    
}


//display winning animation in the output after user has won
async function showWinningAnimation(t=2000){

    imgEl.src='img/fireworks.gif';
    await setTimeout(()=>{
        i=Math.ceil(Math.random()*4);
        imgEl.src=`img/Win${i}.gif`;
    },t);

    await setTimeout(()=>{
        imgEl.src='img/fireworks.gif';
    },3*t);
    
}




//=======add all event listeners=========
document.addEventListener('DOMContentLoaded',async e=>{
    await setGame();
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

//allow user to also interact with the game via the keyboard
document.addEventListener('keydown',async e=>{
    const letter = e.key.toUpperCase();
    if(letter.length==1&&letter.match('[A-Z]')){
        //key pressed is a letter. submit this letter
        
        //find letter element in HTML file
        const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const letterEl = document.querySelectorAll('.letter')[letters.indexOf(letter)];

        //force event for this letter element
        letterEl.dispatchEvent(new Event('click'));

    }else if (e.key=="Enter"){//only make new game on enter if the game has ended
        if(JSON.parse(localStorage.getItem('sessionInfo')).gameEnd){
            await newGame();
        }
    }else if (e.key=="Escape"){//new game if user hits escape key
        await newGame();
    }
    
});