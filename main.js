
const maxWrongGuesses = 6;






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

    //choose category index at random
    //const cati = Math.floor(Math.random()*gameData[category].length);
    const cati = Math.floor(Math.random()*100);

    //choose sentence
    const sentence = gameData[category][cati];//for now
    /*const sentence = `here is a: sentence-words/symbols`;/* testing phrases that contain symbols*/
    //console.log(sentence);//gives answer away
    localStorage.setItem('sessionInfo',JSON.stringify({
        'category':0,
        'sentence':cati,
        'wrongGuesses':0
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
    const letterGuessed = e.target.innerText;
    
    //console.log(`guessed: ${letterGuessed}, correct: ${sentence}`);
    const lettersEl = document.querySelectorAll('.gameboard-letter');
    //console.log(Array.from(lettersEl).map(x=>x.innerText));//all current letters
    var guessedCorrect = false;
    const sentenceAnswer = [...sentence.matchAll('[A-Z]')].map(x=>x[0]);

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

        //check if max guesses reached
        sessionInfo.wrongGuesses++;
        await localStorage.setItem('sessionInfo',JSON.stringify(sessionInfo));
        if (sessionInfo.wrongGuesses>=maxWrongGuesses){
            console.log('LOSER!!!!');
        }
    }

    //check if user won
    if (!document.querySelector('.gameboard-letter-unknown')){
        console.log('win!!!!');
    }


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