const Gameboard = (() => {

    //array for board 
    let board = ['', '', '', '', '', '', '','', ''];

function getBoard(){
    return board;
}

//place x or o marker and returning false if the board has a marker
const placeMarker = (index, marker) => {
        if(board[index] !== ''){
            return false;
        }
            board[index] = marker;
            return true;
}

//deleting the boards content if user clicked reset button
const reset = () => {
    board = ['', '', '', '', '', '', '', '', ''];
}

//check if there is winner or tie
const checkWinner = () => {
    const winLines = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];

    for (const [a, b, c] of winLines) {
        if (board[a] !== '' && board[a] === board[b] && board[a] === board[c]) {
            return { marker: board[a], line: [a, b, c] };
        }
    } 

    
    if (board.every(cell => cell !== '')) {
        return {
             marker: 'tie', 
             line: [] 
            
            };
    }
    return null;
}

//retrun every function. IIFE is used
return {
    getBoard,
    placeMarker,
    reset,
    checkWinner
};

})();

//Uses factory function that creates player objects. Each player has a name and marker(X or O)
const Player = (name, marker) => {
    const getName = () => name;
    const getMarker = () => marker;

    return { getName, getMarker };
}

//handles whose turn it is
const GameController = (() => {
    let players = [];
    let currentIndex = 0;
    let gameOver = false;

    const startGame = (p1, p2) => {
        players = [p1, p2];
        currentIndex = 0;
        gameOver = false;
    }

    const getCurrentPlayer = () => players[currentIndex];


    //function for player's move and returning result object with string in status
    const playTurn = (index) => {
        if(gameOver === true){
            return { status: "over" }
        }

        const player = getCurrentPlayer();

        const placed = Gameboard.placeMarker(index, player.getMarker());
        if(!placed){
            return {
                 status: "invalid" 
                }
        }

        const result = Gameboard.checkWinner();
        if(result){
            gameOver = true;
            if(result.marker === 'tie') 
                return {
             status: 'tie' 
            };

            return { 
                status: 'win', player, line: result.line
             };
        }

        currentIndex = currentIndex === 0 ? 1 : 0;
        return { 
            status: "continue", player: getCurrentPlayer()
         }
    }

    return{
        startGame,
        getCurrentPlayer,
        playTurn
    };

})();


//displays user's input in the game
const DisplayController = (() => {

    const p1NameInput = document.getElementById('p1name');
    const p2NameInput = document.getElementById('p2name');
    const resultLabel = document.getElementById('result');
    const startBtn = document.getElementById('startbtn');
    const resetBtn = document.getElementById('resetBtn');
    const labelDiv = document.getElementById('turn-indicator');
    const boardDiv = document.getElementById('board');
    const fieldBtns = document.querySelectorAll('.fieldBtn');
   const p1ScoreDisplay = document.getElementById('p1score');
    const p2ScoreDisplay = document.getElementById('p2score');
    const tieScoreDisplay = document.getElementById('tieScore');

        // variable to track the scores of the players
      let scores = { p1: 0, p2: 0, ties: 0 };

      //update the players score to scoreboard
        const updateScoreboard = (p1Name, p2Name) => {
        p1ScoreDisplay.textContent = `${p1Name}: ${scores.p1}`;
        p2ScoreDisplay.textContent = `${p2Name}: ${scores.p2}`;
        tieScoreDisplay.textContent = scores.ties;
    };
    const render = () => {
        const board = Gameboard.getBoard();
        fieldBtns.forEach((btn, index) => {
            btn.textContent = board[index];
            btn.disabled = board[index] !== '';
        });

        const currentPlayer = GameController.getCurrentPlayer();
        labelDiv.textContent = `${currentPlayer.getName()}'s Turn (${currentPlayer.getMarker()})`;
    };

    const handleStartGame = () => {
        const p1Name = p1NameInput.value.trim();
        const p2Name = p2NameInput.value.trim();

        if (p1Name === '' || p2Name === '') {
            resultLabel.textContent = 'Both players must enter their names!';
            return;
        }

        const p1Turn = Player(p1Name, 'X');
        const p2Turn = Player(p2Name, 'O');

        Gameboard.reset();
        GameController.startGame(p1Turn, p2Turn);

        scores = { p1: 0, p2: 0, ties: 0 };
        updateScoreboard(p1Name, p2Name);

        resultLabel.textContent = '';
        render();
    };

    const handleResetGame = () => {
        const p1Name = p1NameInput.value || 'Player 1';
        const p2Name = p2NameInput.value || 'Player 2';

        const p1Turn = Player(p1Name, 'X');
        const p2Turn = Player(p2Name, 'O');

        Gameboard.reset();
        GameController.startGame(p1Turn, p2Turn);

         updateScoreboard(p1Name, p2Name);

        resultLabel.textContent = '';
        render();
    };

    const handleBoardClick = (e) => {
        if (!e.target.classList.contains('fieldBtn')) return;

        const index = Array.from(fieldBtns).indexOf(e.target);
        const result = GameController.playTurn(index);

        if (result.status === 'invalid') {
            resultLabel.textContent = 'Square already taken!';
            return;
        }

        if (result.status === 'over') {
            resultLabel.textContent = 'Game is over!';
            return;
        }

        //only render (update turn label) when the game continues
        if (result.status === 'continue') {
            render();
            return;
        }


        
        //update board display without overwriting result label
        const board = Gameboard.getBoard();
        fieldBtns.forEach((btn, index) => {
            btn.textContent = board[index];
            btn.disabled = true; // disable all on game end
        });

        if (result.status === 'win') {
            const winnerName = result.player.getName();
            const p1Name = p1NameInput.value || 'Player 1';
            const p2Name = p2NameInput.value || 'Player 2';

            if (winnerName === p1Name) {
                scores.p1++;
            } else {
                scores.p2++;
            }

            updateScoreboard(p1Name, p2Name);
            labelDiv.textContent = '';
            resultLabel.textContent = `${winnerName} wins!`;
            
            //auto reset the board if someone wins for next round
        setTimeout(() => {
        Gameboard.reset();
        GameController.startGame(Player(p1Name, 'X'), Player(p2Name, 'O'));
        resultLabel.textContent = '';
        render();
    }, 
    1000);
        }

        if (result.status === 'tie') {
            scores.ties++;
            const p1Name = p1NameInput.value || 'Player 1';
            const p2Name = p2NameInput.value || 'Player 2';
            updateScoreboard(p1Name, p2Name);

            labelDiv.textContent = '';
            resultLabel.textContent = "It's a tie!";

            //auto reset the board if the game is tie
                setTimeout(() => {
        Gameboard.reset();
        GameController.startGame(Player(p1Name, 'X'), Player(p2Name, 'O'));
        resultLabel.textContent = '';
        render();
    }, 
    1000);
        }
    };

    startBtn.addEventListener('click', handleStartGame);
    resetBtn.addEventListener('click', handleResetGame);
    boardDiv.addEventListener('click', handleBoardClick);

    return { render, handleStartGame, handleResetGame, handleBoardClick };

})();
