    const Gameboard = (() => {

        let board = ['', '', '', '', '', '', '','', ''];

        
    function getBoard (){
        return board;
    }


    const placeMarker = (index, marker) => {
            if(board[index] !== ''){
                return false;
            }

                board[index] = marker;
                return true;
    }

    const  reset = () => {
        board = ['', '', '', '', '', '', '', '', ''];
    }





    return { 
        getBoard,
        placeMarker,
        reset
    };


    })();

    const Player = (name, marker) => {
        const getName = () => name;
        const getMarker = () => marker;

        return {
            getName,
            getMarker
        };

    }


    const GameController = (() => {
        let players = [];
        let currentIndex = 0;
        let gameOver = false;

    


        const startGame = (p1, p2) =>  {
                players = [p1, p2];
                currentIndex = 0;
                gameOver = false;

            
        }

        const getCurrentPlayer  = () => players [currentIndex];


        return{
            startGame,
            getCurrentPlayer
        };


    })();

    const p1 = Player('Alice', 'X');
    const p2 = Player('Bob', 'O');
    GameController.startGame(p1, p2);
    console.log(GameController.getCurrentPlayer().getName()); // 'Alice'