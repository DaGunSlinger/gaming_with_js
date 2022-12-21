//pantallas
const divEntireGame = document.querySelector('.game');
const finish = document.querySelector(".finish")
//CANVAS
const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
//BOTONES
const up = document.querySelector('#up');
const right = document.querySelector('#right');
const left = document.querySelector('#left');
const down = document.querySelector('#down');

const buttonRestart = document.querySelector('.button--go');
const buttonCancel = document.querySelector('.button--cancel');
//Textos
const spanLives = document.querySelector('.lives')
const spanCoins = document.querySelector('.coins')
const spanTime = document.querySelector('.time')
const spanRecord = document.querySelector('.best')
const pResult = document.querySelector(".result")



window.addEventListener('keydown',keysMove)

up.addEventListener('click',moveUp)
right.addEventListener('click',moveRight)
left.addEventListener('click',moveLeft)
down.addEventListener('click',moveDown)

let canvasSize;
let elementSize;
let antx;
let anty;
let movimientos = -1;
let level = 0;
let lives = 3;

let timeStart;
let timeInterval;

const giftPosition = {x: undefined, y: undefined}

let flag=true;
let bombs = []
let walls = []
let coinsList = []
let changes = [[],[]] ///Bombs, coins
let coins = 0
let coinFlag = false;



//-----------------------Define el tamaño del canvas y renderiza---------------------//

window.addEventListener('load',setCanvasSize)
window.addEventListener('resize', setCanvasSize)
function setCanvasSize(){
    if(window.innerHeight > window.innerWidth){
        canvasSize = window.innerWidth * 0.7
    } else {
        canvasSize = window.innerHeight * 0.7
    }
    elementSize = canvasSize / 10

    canvas.setAttribute('width', canvasSize + 10)
    canvas.setAttribute('height', canvasSize + 10)

    playerPosition.x = undefined
    playerPosition.y = undefined
    
    startGame()

}
//----------------------------------Dibujo del juego-------------------------//

function startGame(){
    //game.fillRect(0,0,100,100);
    //game.clearRect(50,50,100,100);

    //setInterval(f, 1000) -> ejecuta la función cada segundo
    //setTimeout(f, 1000)   -> ejecuta la función en un segundo

    game.font = elementSize + 'px Arial';
    game.textAlign = 'end';

    if(!timeStart){
        timeStart = Date.now()
        timeInterval = setInterval(drawTime,100);
        drawRecord()
    }

    if(!localStorage.record){
        localStorage.setItem('record', 0)
        drawRecord()
    }

    const map = maps[level]

    if(!map){
        gameWin()
        return;
    }
    const mapa = map.trimStart().trimEnd()
    const mapRows = mapa.split('\n');
    const rowsCols = mapRows.map(a => a.trim('\n'))
    game.clearRect(0,0,canvasSize,canvasSize)

    for (let x = 1; x <= 10; x++){
        for (let y = 1; y <= 10; y++){
            const emojiRef = rowsCols[x-1][y-1]
            const coordX = (elementSize * y) + 5
            const coordY = elementSize * x
            
            if(emojiRef == 'B'){
                drawChance(coordX, coordY, emojiRef)
                
            } 
            else if(emojiRef == 'P'){
                drawChance(coordX, coordY, emojiRef)
                
            } else {
                game.fillText(emojis[emojiRef], coordX, coordY)  //Dibuja cada cosa
            }
            
            if(!(playerPosition.x)){
                if (emojiRef == 'O'){
                    playerPosition.x = coordX;
                    playerPosition.y = coordY;
                    game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y)
                }
            }

            if (emojiRef == 'G'){
                giftPosition.x = coordX;
                giftPosition.y = coordY;
            } else if (emojiRef == 'B' && flag){
                bombs.push({x: coordX.toFixed(3),y: coordY.toFixed(3)});
            }else if (emojiRef == 'X' && flag){
                walls.push({x: coordX.toFixed(3),y: coordY.toFixed(3)});
            } else if (emojiRef == 'P' && flag || coinFlag){
                coinsList.push({x: coordX.toFixed(3),y: coordY.toFixed(3)});
            }
        }
    }

    drawHearts()

    drawCoins()

    flag=false;
    
    movePlayer()

    
}

//----------------------------------Movimiento del jugador-------------------------//

const playerPosition = {x: undefined, y: undefined}


function keysMove(event){
    if(event.key == 'ArrowUp' || event.key == 'w') moveUp();
    else if(event.key == 'ArrowRight' || event.key == 'd') moveRight();
    else if(event.key == 'a' || event.key == 'ArrowLeft') moveLeft();
    else if(event.key == 's' || event.key == 'ArrowDown') moveDown();

}

function moveUp(){
    playerPosition.y -= elementSize;
    startGame()
}
function moveRight(){
    playerPosition.x += elementSize;
    startGame()
}
function moveLeft(){
    playerPosition.x -= elementSize;
    startGame()
}
function moveDown(){
    playerPosition.y += elementSize;
    startGame()
}

function movePlayer(){
    if (giftPosition.x != undefined){
        /*
        const giftX = (giftPosition.x).toFixed(3);
        const giftY = (giftPosition.y).toFixed(3)
        const playerX = (playerPosition.x).toFixed(3);
        const playerY = (playerPosition.y).toFixed(3);
        const horizontal = giftX == playerX;;
        const vertical = giftY == playerY;
        */
       /*-------------------------LLEGAR A REGALO----------------*/ 
        const horizontal = (giftPosition.x).toFixed(3) == (playerPosition.x).toFixed(3);
        const vertical = (giftPosition.y).toFixed(3) == (playerPosition.y).toFixed(3);
        const won = horizontal && vertical;
    
        if(won){
            levelUp()
        } 
        /*---------------------------LLEGAR A BOMBA-----------------*/ 
        const overBomb = bombs.find(bomb => {
            const expx = bomb.x == (playerPosition.x).toFixed(3);
            const expy = bomb.y == (playerPosition.y).toFixed(3);
            return (expx && expy)
        });
                    
        if(overBomb) {
            const dieLater = changes[0].find(chg => {
                const expx = chg.x == (playerPosition.x).toFixed(3)
                const expy = chg.y == (playerPosition.y).toFixed(3)
                return (expx && expy)
            });
            if(!dieLater){
                changes[0].push({x:(playerPosition.x).toFixed(3),y: (playerPosition.y).toFixed(3)})
                console.log(changes);
                levelFail()
            }

        }
        /*-------------------------SALIRSE DE LOS LÍMITES--------------------*/ 

        if (playerPosition.x < 10 || playerPosition.y < 10 || playerPosition.x > (canvasSize + elementSize * 0.5) || playerPosition.y > (canvasSize + elementSize * 0.5) ){
        
            playerPosition.x = antx
            playerPosition.y = anty
            game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y)
            //console.log(playerPosition.x, playerPosition.y);
        }    
        /*----------------------------ESTRELLARSE CON MURALLA-----------------*/ 
        const blocked = walls.find(wall => {
            const wallx = wall.x == (playerPosition.x).toFixed(3);
            const wally = wall.y == (playerPosition.y).toFixed(3);
            //console.log('X',bombs.x, ',', (playerPosition.x).toFixed(3));
            //console.log('Y',bombs.y, ',', (playerPosition.y).toFixed(3));
            return (wallx && wally)
        });
        if (blocked){
            playerPosition.x = antx
            playerPosition.y = anty
            game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y)
        }

        /*----------------------------TOMAR COIN-----------------*/ 
        const overCoin = coinsList.find(coin => {
            const expx = coin.x == (playerPosition.x).toFixed(3);
            const expy = coin.y == (playerPosition.y).toFixed(3);
            return (expx && expy)
        });
                    
        if(overCoin) {
            const taked = changes[1].find(chg => {
                const expx = chg.x == (playerPosition.x).toFixed(3)
                const expy = chg.y == (playerPosition.y).toFixed(3)
                return (expx && expy)
            })

            if(!taked){
                changes[1].push({x:(playerPosition.x).toFixed(3),y: (playerPosition.y).toFixed(3)})
                coinPlus()
                }
            }
            

        antx = playerPosition.x
        anty = playerPosition.y

        game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y)

    }
    
    //game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y)

}

function levelUp(){
    level++
    flag = true
    walls.length = 0
    bombs.length = 0
    coinsList.length = 0
    changes[0].length = 0
    changes[1].length = 0
    startGame()
}

function gameWin(){
    console.log('GANASTE');
    const recordTime = localStorage.getItem('record')
    const playerTime = Math.floor((Date.now() - timeStart)/1000)
    if(recordTime){
        if(recordTime > playerTime || recordTime == 0) {
            localStorage.setItem('record', playerTime)
            drawRecord()
            pResult.innerHTML = "Superaste el record!"
        } else pResult.innerHTML = "Puntaje máximo:"
    }
    clearInterval(timeInterval)
    divEntireGame.classList.toggle('inactive')
    finish.classList.toggle('inactive')
}

function levelFail(){
    playerPosition.x = undefined;
    playerPosition.y = undefined;
    lives--
    if (!(lives > 0)){
        lives = 3
        level = 0
        flag = true
        walls.length = 0
        bombs.length = 0
        changes.length = 0
        timeStart = undefined;
    }
    startGame()
}

function coinPlus(){
    coins++
    startGame()
}

function drawHearts(){
    const livesList = Array(lives).fill(emojis['H']) //[,,,] crea un array con n posiciones (vidas)
    spanLives.innerHTML = ""
    for(heart in livesList){
        spanLives.append(emojis['H'])
    }
}

function drawCoins(){
    spanCoins.innerHTML = emojis['P'] + "x" + coins 
}

function drawTime(){
    spanTime.innerHTML = emojis['CLOCK'] + "  " + Math.floor((Date.now() - timeStart)/1000) + " s";
}

function drawRecord(){
    spanRecord.innerHTML = emojis['WIN'] + "  "  + localStorage.getItem('record')
}

function drawChance(coordX, coordY, emojiRef){
    if(emojiRef === 'B'){
        const die = changes[0].find(chg => {
            const expx = chg.x == (coordX).toFixed(3);
            const expy = chg.y == (coordY).toFixed(3);
            return (expx && expy)
        });
        if(die){
            //game.fillText(emojis['FIRE'], coordX, coordY)
    
        } else {
            game.fillText(emojis[emojiRef], coordX, coordY)  //Dibuja cada cosa
        }
    } else {
        const taked = changes[1].find(chg => {
            const expx = chg.x == (coordX).toFixed(3);
            const expy = chg.y == (coordY).toFixed(3);
            return (expx && expy)
        });
        if(taked){
            //game.fillText(emojis['FIRE'], coordX, coordY)
    
        } else {
            game.fillText(emojis[emojiRef], coordX, coordY)  //Dibuja cada cosa
        }
    }
}

buttonRestart.addEventListener('click', restart)

function restart(){
    console.log('ME EJECUTO');
    finish.classList.toggle('inactive')
    divEntireGame.classList.toggle('inactive')
    level = 0
    timeStart = undefined
    playerPosition.x = undefined
    playerPosition.y = undefined
    startGame()
}



