class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.moveHistory = [];
        this.selectedSquare = null;
        this.validMoves = [];
        this.currentPlayer = 'white';
        this.gameActive = false;
        this.lastMove = null;
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Setup white pieces (row 6-7)
        const whitePieces = [
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p']
        ];
        
        // Setup black pieces (row 0-1)
        const blackPieces = [
            ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
            ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟']
        ];
        
        // Place white pieces
        for (let i = 0; i < 8; i++) {
            board[6][i] = whitePieces[1][i];
            board[7][i] = whitePieces[0][i];
        }
        
        // Place black pieces
        for (let i = 0; i < 8; i++) {
            board[1][i] = blackPieces[1][i];
            board[0][i] = blackPieces[0][i];
        }
        
        return board;
    }

    getPieceAt(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return null;
        return this.board[row][col];
    }

    setPieceAt(row, col, piece) {
        this.board[row][col] = piece;
    }

    isWhitePiece(piece) {
        if (!piece) return false;
        return piece === piece.toLowerCase();
    }

    isBlackPiece(piece) {
        if (!piece) return false;
        return piece === piece.toUpperCase() && piece !== piece.toLowerCase();
    }

    getPieceType(piece) {
        if (!piece) return null;
        const types = { 'p': 'pawn', 'n': 'knight', 'b': 'bishop', 'r': 'rook', 'q': 'queen', 'k': 'king' };
        return types[piece.toLowerCase()];
    }

    getValidMoves(row, col) {
        const piece = this.getPieceAt(row, col);
        if (!piece) return [];

        const type = this.getPieceType(piece);
        const isWhite = this.isWhitePiece(piece);
        const moves = [];

        if (type === 'pawn') {
            const direction = isWhite ? -1 : 1;
            const startRow = isWhite ? 6 : 1;
            
            // Forward move
            const newRow = row + direction;
            if (newRow >= 0 && newRow <= 7 && !this.getPieceAt(newRow, col)) {
                moves.push([newRow, col]);
                
                // Double move from start
                if (row === startRow && !this.getPieceAt(row + 2*direction, col)) {
                    moves.push([row + 2*direction, col]);
                }
            }
            
            // Captures
            for (let newCol of [col - 1, col + 1]) {
                if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
                    const target = this.getPieceAt(newRow, newCol);
                    if (target && this.isWhitePiece(target) !== isWhite) {
                        moves.push([newRow, newCol]);
                    }
                }
            }
        } else if (type === 'knight') {
            const knightMoves = [
                [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            for (let [dr, dc] of knightMoves) {
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
                    const target = this.getPieceAt(newRow, newCol);
                    if (!target || this.isWhitePiece(target) !== isWhite) {
                        moves.push([newRow, newCol]);
                    }
                }
            }
        } else if (type === 'bishop' || type === 'rook' || type === 'queen') {
            const directions = type === 'bishop' 
                ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
                : type === 'rook'
                ? [[-1, 0], [1, 0], [0, -1], [0, 1]]
                : [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

            for (let [dr, dc] of directions) {
                for (let i = 1; i < 8; i++) {
                    const newRow = row + dr * i;
                    const newCol = col + dc * i;
                    if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) break;
                    const target = this.getPieceAt(newRow, newCol);
                    if (!target) {
                        moves.push([newRow, newCol]);
                    } else {
                        if (this.isWhitePiece(target) !== isWhite) {
                            moves.push([newRow, newCol]);
                        }
                        break;
                    }
                }
            }
        } else if (type === 'king') {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
                        const target = this.getPieceAt(newRow, newCol);
                        if (!target || this.isWhitePiece(target) !== isWhite) {
                            moves.push([newRow, newCol]);
                        }
                    }
                }
            }
        }

        return moves;
    }

    selectSquare(row, col) {
        const piece = this.getPieceAt(row, col);
        const isPlayerPiece = piece && this.isWhitePiece(piece);

        if (this.selectedSquare && this.validMoves.some(m => m[0] === row && m[1] === col)) {
            // Make move
            this.makeMove(this.selectedSquare[0], this.selectedSquare[1], row, col);
            this.selectedSquare = null;
            this.validMoves = [];
            return 'moved';
        } else if (isPlayerPiece) {
            // Select piece
            this.selectedSquare = [row, col];
            this.validMoves = this.getValidMoves(row, col);
            return 'selected';
        } else {
            // Deselect
            this.selectedSquare = null;
            this.validMoves = [];
            return 'deselected';
        }
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPieceAt(fromRow, fromCol);
        const captured = this.getPieceAt(toRow, toCol);
        
        this.setPieceAt(toRow, toCol, piece);
        this.setPieceAt(fromRow, fromCol, null);
        
        this.lastMove = { from: [fromRow, fromCol], to: [toRow, toCol] };
        this.moveHistory.push({
            piece: piece,
            from: [fromRow, fromCol],
            to: [toRow, toCol],
            captured: captured,
            player: this.currentPlayer
        });
        
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
    }

    reset() {
        this.board = this.initializeBoard();
        this.moveHistory = [];
        this.selectedSquare = null;
        this.validMoves = [];
        this.currentPlayer = 'white';
        this.lastMove = null;
    }

    getMoveNotation(move) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const from = `${files[move.from[1]]}${8 - move.from[0]}`;
        const to = `${files[move.to[1]]}${8 - move.to[0]}`;
        return `${from} → ${to}`;
    }
}