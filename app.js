let game = new ChessGame();
let bot = null;
let boardElement = null;
let botLevel = 0;
let gameActive = false;
let thinking = false;

const botNames = ['🤖 ROOKIE', '👾 NOVICE', '🎮 INTERMEDIATE', '💀 EXPERT', '🔥 LEGEND'];

function initializeBoard() {
    boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            
            const piece = game.getPieceAt(row, col);
            if (piece) {
                square.textContent = piece;
            }
            
            square.dataset.row = row;
            square.dataset.col = col;
            square.addEventListener('click', () => handleSquareClick(row, col));
            boardElement.appendChild(square);
        }
    }
}

function updateBoard() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = game.getPieceAt(row, col);
        
        // Clear content and classes
        square.textContent = piece || '';
        square.classList.remove('selected', 'valid-move', 'last-move');
        
        // Add selected class
        if (game.selectedSquare && game.selectedSquare[0] === row && game.selectedSquare[1] === col) {
            square.classList.add('selected');
        }
        
        // Add valid move indicators
        if (game.validMoves.some(m => m[0] === row && m[1] === col)) {
            square.classList.add('valid-move');
        }
        
        // Add last move highlight
        if (game.lastMove) {
            if ((game.lastMove.from[0] === row && game.lastMove.from[1] === col) ||
                (game.lastMove.to[0] === row && game.lastMove.to[1] === col)) {
                square.classList.add('last-move');
            }
        }
    });
}

function handleSquareClick(row, col) {
    if (!gameActive || game.currentPlayer !== 'white' || thinking) return;
    
    const result = game.selectSquare(row, col);
    updateBoard();
    
    if (result === 'moved') {
        updateMoveLog();
        updateStatus();
        setTimeout(makeBotMove, 800);
    }
}

function makeBotMove() {
    if (!gameActive || game.currentPlayer !== 'black') return;
    
    thinking = true;
    document.getElementById('botStatus').textContent = 'THINKING...';
    
    setTimeout(() => {
        const move = bot.getMove(game);
        if (move) {
            game.makeMove(move.from[0], move.from[1], move.to[0], move.to[1]);
            updateBoard();
            updateMoveLog();
            updateStatus();
        }
        thinking = false;
    }, 500 + Math.random() * 1500);
}

function updateMoveLog() {
    const movesDiv = document.getElementById('moves');
    movesDiv.innerHTML = '';
    
    game.moveHistory.forEach((move, index) => {
        const moveEl = document.createElement('div');
        moveEl.className = 'move';
        if (move.player === 'black') {
            moveEl.classList.add('bot-move');
        }
        
        const notation = game.getMoveNotation(move);
        const capture = move.captured ? ` ⚔️` : '';
        moveEl.textContent = `${index + 1}. ${notation}${capture}`;
        movesDiv.appendChild(moveEl);
    });
    
    // Scroll to bottom
    movesDiv.parentElement.scrollTop = movesDiv.parentElement.scrollHeight;
}

function updateStatus() {
    if (game.currentPlayer === 'white') {
        document.getElementById('playerStatus').textContent = '✓ YOUR TURN';
        document.getElementById('botStatus').textContent = 'WAITING...';
    } else {
        document.getElementById('playerStatus').textContent = 'WAITING...';
        document.getElementById('botStatus').textContent = 'ANALYZING...';
    }
}

function startGame() {
    botLevel = parseInt(document.getElementById('botSelect').value);
    bot = new ChessBot(botLevel);
    game = new ChessGame();
    gameActive = true;
    game.currentPlayer = 'white';
    game.gameActive = true;
    
    document.getElementById('botName').textContent = botNames[botLevel];
    document.getElementById('playerStatus').textContent = '✓ YOUR TURN';
    document.getElementById('botStatus').textContent = 'READY';
    
    initializeBoard();
    updateBoard();
    updateMoveLog();
}

function resetGame() {
    gameActive = false;
    thinking = false;
    game.reset();
    bot = null;
    
    document.getElementById('playerStatus').textContent = 'Waiting to start...';
    document.getElementById('botStatus').textContent = 'Ready to compete...';
    
    initializeBoard();
    updateBoard();
    const movesDiv = document.getElementById('moves');
    movesDiv.innerHTML = '';
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Initialize empty board
initializeBoard();