class ChessBot {
    constructor(skillLevel) {
        this.skillLevel = skillLevel; // 0-4 (Rookie to Legend)
        this.pieceValues = {
            'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
        };
    }

    getMove(game) {
        const possibleMoves = this.getAllValidMoves(game);
        if (possibleMoves.length === 0) return null;

        switch(this.skillLevel) {
            case 0: // Rookie - random moves
                return this.randomMove(possibleMoves);
            case 1: // Novice - slightly strategic
                return this.simpleEval(game, possibleMoves);
            case 2: // Intermediate - capture threats
                return this.mediumEval(game, possibleMoves);
            case 3: // Expert - lookahead
                return this.hardEval(game, possibleMoves);
            case 4: // Legend - deep analysis
                return this.legendEval(game, possibleMoves);
            default:
                return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }
    }

    getAllValidMoves(game) {
        const moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = game.getPieceAt(row, col);
                if (piece && game.isBlackPiece(piece)) {
                    const validMoves = game.getValidMoves(row, col);
                    for (let move of validMoves) {
                        moves.push({ from: [row, col], to: move });
                    }
                }
            }
        }
        return moves;
    }

    randomMove(moves) {
        return moves[Math.floor(Math.random() * moves.length)];
    }

    evaluateBoard(game, move) {
        let score = 0;
        const piece = game.getPieceAt(move.from[0], move.from[1]);
        const target = game.getPieceAt(move.to[0], move.to[1]);

        // Capture value
        if (target) {
            const targetValue = this.pieceValues[target.toLowerCase()];
            const pieceValue = this.pieceValues[piece.toLowerCase()];
            score += targetValue * 10 - pieceValue;
        }

        // Center control
        const toRow = move.to[0];
        const toCol = move.to[1];
        const distToCenter = Math.abs(toRow - 3.5) + Math.abs(toCol - 3.5);
        score += (7 - distToCenter);

        // Piece safety
        if (target) score += 5;

        return score;
    }

    simpleEval(game, moves) {
        let bestMove = moves[0];
        let bestScore = -Infinity;

        for (let move of moves) {
            const score = this.evaluateBoard(game, move);
            const random = Math.random() * 10;
            if (score + random > bestScore) {
                bestScore = score + random;
                bestMove = move;
            }
        }
        return bestMove;
    }

    mediumEval(game, moves) {
        let bestMove = moves[0];
        let bestScore = -Infinity;

        for (let move of moves) {
            const target = game.getPieceAt(move.to[0], move.to[1]);
            let score = this.evaluateBoard(game, move);
            
            // Prioritize captures
            if (target) score *= 1.5;
            
            // Avoid losing pieces
            const fromRow = move.from[0];
            const fromCol = move.from[1];
            const piece = game.getPieceAt(fromRow, fromCol);
            const pieceValue = this.pieceValues[piece.toLowerCase()];
            
            // Check if piece is under attack (simple check)
            score -= (pieceValue * 2);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }

    hardEval(game, moves) {
        let bestMove = moves[0];
        let bestScore = -Infinity;

        for (let move of moves) {
            let score = this.evaluateBoard(game, move);
            const target = game.getPieceAt(move.to[0], move.to[1]);
            
            // Heavy weight on captures
            if (target) {
                const captureValue = this.pieceValues[target.toLowerCase()];
                score += captureValue * 50;
            }
            
            // Piece development
            const toRow = move.to[0];
            if ((toRow >= 2 && toRow <= 5)) score += 10;
            
            // Forward progress for pieces
            if (toRow < move.from[0]) score += 5;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }

    legendEval(game, moves) {
        let bestMove = moves[0];
        let bestScore = -Infinity;

        for (let move of moves) {
            let score = this.evaluateBoard(game, move);
            const target = game.getPieceAt(move.to[0], move.to[1]);
            
            // Maximum weight on captures
            if (target) {
                const captureValue = this.pieceValues[target.toLowerCase()];
                score += captureValue * 100;
            }
            
            // Aggressive positioning
            const toRow = move.to[0];
            const toCol = move.to[1];
            
            // Center control is critical
            const distToCenter = Math.abs(toRow - 3.5) + Math.abs(toCol - 3.5);
            score += (8 - distToCenter) * 3;
            
            // Forward aggression
            if (toRow < move.from[0]) score += 15;
            
            // Piece type bonuses
            const piece = game.getPieceAt(move.from[0], move.from[1]);
            if (piece.toLowerCase() === 'q') score += 20;
            if (piece.toLowerCase() === 'r') score += 15;
            if (piece.toLowerCase() === 'b' || piece.toLowerCase() === 'n') score += 10;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }
}