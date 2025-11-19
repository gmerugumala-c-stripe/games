// Chess piece Unicode characters
const PIECES = {
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
    },
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
    }
};

class ChessGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.lastMove = null;
        this.gameOver = false;
        this.soundEnabled = true;
        this.coordinatesVisible = true;
        
        this.initBoard();
        this.renderBoard();
        this.attachEventListeners();
        this.updateTurnIndicator();
    }
    
    initBoard() {
        // Initialize empty board
        for (let row = 0; row < 8; row++) {
            this.board[row] = [];
            for (let col = 0; col < 8; col++) {
                this.board[row][col] = null;
            }
        }
        
        // Setup black pieces (row 0 and 1)
        this.board[0][0] = { type: 'rook', color: 'black' };
        this.board[0][1] = { type: 'knight', color: 'black' };
        this.board[0][2] = { type: 'bishop', color: 'black' };
        this.board[0][3] = { type: 'queen', color: 'black' };
        this.board[0][4] = { type: 'king', color: 'black' };
        this.board[0][5] = { type: 'bishop', color: 'black' };
        this.board[0][6] = { type: 'knight', color: 'black' };
        this.board[0][7] = { type: 'rook', color: 'black' };
        
        for (let col = 0; col < 8; col++) {
            this.board[1][col] = { type: 'pawn', color: 'black' };
        }
        
        // Setup white pieces (row 6 and 7)
        for (let col = 0; col < 8; col++) {
            this.board[6][col] = { type: 'pawn', color: 'white' };
        }
        
        this.board[7][0] = { type: 'rook', color: 'white' };
        this.board[7][1] = { type: 'knight', color: 'white' };
        this.board[7][2] = { type: 'bishop', color: 'white' };
        this.board[7][3] = { type: 'queen', color: 'white' };
        this.board[7][4] = { type: 'king', color: 'white' };
        this.board[7][5] = { type: 'bishop', color: 'white' };
        this.board[7][6] = { type: 'knight', color: 'white' };
        this.board[7][7] = { type: 'rook', color: 'white' };
        
        // Add moved flag for castling and en passant
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col]) {
                    this.board[row][col].moved = false;
                }
            }
        }
    }
    
    renderBoard() {
        const boardElement = document.getElementById('chessboard');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                const piece = this.board[row][col];
                if (piece) {
                    square.textContent = PIECES[piece.color][piece.type];
                    square.classList.add('has-piece');
                }
                
                // Highlight last move
                if (this.lastMove && 
                    ((this.lastMove.from.row === row && this.lastMove.from.col === col) ||
                     (this.lastMove.to.row === row && this.lastMove.to.col === col))) {
                    square.classList.add('last-move');
                }
                
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                boardElement.appendChild(square);
            }
        }
        
        this.updateCapturedPieces();
    }
    
    handleSquareClick(row, col) {
        if (this.gameOver) return;
        
        const square = this.board[row][col];
        
        if (this.selectedSquare) {
            const validMoves = this.getValidMoves(
                this.selectedSquare.row,
                this.selectedSquare.col
            );
            
            const isValidMove = validMoves.some(
                move => move.row === row && move.col === col
            );
            
            if (isValidMove) {
                this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
                this.selectedSquare = null;
                this.clearHighlights();
            } else if (square && square.color === this.currentPlayer) {
                this.selectSquare(row, col);
            } else {
                this.selectedSquare = null;
                this.clearHighlights();
            }
        } else if (square && square.color === this.currentPlayer) {
            this.selectSquare(row, col);
        }
    }
    
    selectSquare(row, col) {
        this.selectedSquare = { row, col };
        this.clearHighlights();
        
        const squares = document.querySelectorAll('.square');
        squares[row * 8 + col].classList.add('selected');
        
        const validMoves = this.getValidMoves(row, col);
        validMoves.forEach(move => {
            const square = squares[move.row * 8 + move.col];
            square.classList.add('valid-move');
        });
    }
    
    clearHighlights() {
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('selected', 'valid-move');
        });
    }
    
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        // Save move for history
        const move = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: { ...piece },
            captured: capturedPiece ? { ...capturedPiece } : null,
            boardState: this.board.map(row => row.map(cell => cell ? { ...cell } : null))
        };
        
        // Handle en passant capture
        if (piece.type === 'pawn' && fromCol !== toCol && !capturedPiece) {
            const captureRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
            move.enPassantCapture = { ...this.board[captureRow][toCol] };
            this.capturedPieces[piece.color].push(this.board[captureRow][toCol]);
            this.board[captureRow][toCol] = null;
        }
        
        // Capture piece
        if (capturedPiece) {
            this.capturedPieces[piece.color].push(capturedPiece);
        }
        
        // Move piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        piece.moved = true;
        
        // Handle castling
        if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
            // King-side castling
            if (toCol === 6) {
                this.board[toRow][5] = this.board[toRow][7];
                this.board[toRow][7] = null;
                this.board[toRow][5].moved = true;
            }
            // Queen-side castling
            else if (toCol === 2) {
                this.board[toRow][3] = this.board[toRow][0];
                this.board[toRow][0] = null;
                this.board[toRow][3].moved = true;
            }
        }
        
        // Handle pawn promotion
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            this.showPromotionModal(toRow, toCol);
        }
        
        this.moveHistory.push(move);
        this.lastMove = { from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };
        
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.renderBoard();
        this.updateTurnIndicator();
        this.addMoveToHistory(move);
        this.checkGameStatus();
        
        if (this.soundEnabled) {
            this.playMoveSound();
        }
    }
    
    showPromotionModal(row, col) {
        const modal = document.getElementById('promotionModal');
        const piecesContainer = document.getElementById('promotionPieces');
        piecesContainer.innerHTML = '';
        
        const promotionOptions = ['queen', 'rook', 'bishop', 'knight'];
        const color = this.board[row][col].color;
        
        promotionOptions.forEach(pieceType => {
            const piece = document.createElement('div');
            piece.className = 'promotion-piece';
            piece.textContent = PIECES[color][pieceType];
            piece.addEventListener('click', () => {
                this.board[row][col].type = pieceType;
                modal.classList.remove('active');
                this.renderBoard();
            });
            piecesContainer.appendChild(piece);
        });
        
        modal.classList.add('active');
    }
    
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        let moves = [];
        
        switch (piece.type) {
            case 'pawn':
                moves = this.getPawnMoves(row, col, piece.color);
                break;
            case 'rook':
                moves = this.getRookMoves(row, col, piece.color);
                break;
            case 'knight':
                moves = this.getKnightMoves(row, col, piece.color);
                break;
            case 'bishop':
                moves = this.getBishopMoves(row, col, piece.color);
                break;
            case 'queen':
                moves = this.getQueenMoves(row, col, piece.color);
                break;
            case 'king':
                moves = this.getKingMoves(row, col, piece.color);
                break;
        }
        
        // Filter out moves that would put own king in check
        moves = moves.filter(move => {
            return !this.wouldBeInCheck(row, col, move.row, move.col, piece.color);
        });
        
        return moves;
    }
    
    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        
        // Move forward one square
        if (this.isValidPosition(row + direction, col) && 
            !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col });
            
            // Move forward two squares from starting position
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }
        
        // Capture diagonally
        for (const dcol of [-1, 1]) {
            const newRow = row + direction;
            const newCol = col + dcol;
            if (this.isValidPosition(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (target && target.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
                
                // En passant
                if (this.lastMove && this.board[row][newCol]) {
                    const lastMovePiece = this.board[row][newCol];
                    if (lastMovePiece.type === 'pawn' && 
                        lastMovePiece.color !== color &&
                        this.lastMove.from.row === (color === 'white' ? 1 : 6) &&
                        this.lastMove.to.row === row &&
                        this.lastMove.to.col === newCol &&
                        Math.abs(this.lastMove.from.row - this.lastMove.to.row) === 2) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            }
        }
        
        return moves;
    }
    
    getRookMoves(row, col, color) {
        return this.getLinearMoves(row, col, color, [
            { dr: 0, dc: 1 },  // right
            { dr: 0, dc: -1 }, // left
            { dr: 1, dc: 0 },  // down
            { dr: -1, dc: 0 }  // up
        ]);
    }
    
    getBishopMoves(row, col, color) {
        return this.getLinearMoves(row, col, color, [
            { dr: 1, dc: 1 },   // down-right
            { dr: 1, dc: -1 },  // down-left
            { dr: -1, dc: 1 },  // up-right
            { dr: -1, dc: -1 }  // up-left
        ]);
    }
    
    getQueenMoves(row, col, color) {
        return [
            ...this.getRookMoves(row, col, color),
            ...this.getBishopMoves(row, col, color)
        ];
    }
    
    getLinearMoves(row, col, color, directions) {
        const moves = [];
        
        for (const { dr, dc } of directions) {
            let newRow = row + dr;
            let newCol = col + dc;
            
            while (this.isValidPosition(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                
                newRow += dr;
                newCol += dc;
            }
        }
        
        return moves;
    }
    
    getKnightMoves(row, col, color) {
        const moves = [];
        const knightMoves = [
            { dr: -2, dc: -1 }, { dr: -2, dc: 1 },
            { dr: -1, dc: -2 }, { dr: -1, dc: 2 },
            { dr: 1, dc: -2 },  { dr: 1, dc: 2 },
            { dr: 2, dc: -1 },  { dr: 2, dc: 1 }
        ];
        
        for (const { dr, dc } of knightMoves) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isValidPosition(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        return moves;
    }
    
    getKingMoves(row, col, color) {
        const moves = [];
        const kingMoves = [
            { dr: -1, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: 1 },
            { dr: 0, dc: -1 },                      { dr: 0, dc: 1 },
            { dr: 1, dc: -1 },  { dr: 1, dc: 0 },  { dr: 1, dc: 1 }
        ];
        
        for (const { dr, dc } of kingMoves) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isValidPosition(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        // Castling
        if (!this.board[row][col].moved && !this.isInCheck(color)) {
            // King-side castling
            if (this.board[row][7] && 
                !this.board[row][7].moved &&
                !this.board[row][5] && 
                !this.board[row][6] &&
                !this.wouldBeInCheck(row, col, row, 5, color) &&
                !this.wouldBeInCheck(row, col, row, 6, color)) {
                moves.push({ row, col: 6 });
            }
            
            // Queen-side castling
            if (this.board[row][0] && 
                !this.board[row][0].moved &&
                !this.board[row][1] && 
                !this.board[row][2] && 
                !this.board[row][3] &&
                !this.wouldBeInCheck(row, col, row, 3, color) &&
                !this.wouldBeInCheck(row, col, row, 2, color)) {
                moves.push({ row, col: 2 });
            }
        }
        
        return moves;
    }
    
    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    
    wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
        // Simulate the move
        const originalPiece = this.board[toRow][toCol];
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
        
        const inCheck = this.isInCheck(color);
        
        // Undo the move
        this.board[fromRow][fromCol] = this.board[toRow][toCol];
        this.board[toRow][toCol] = originalPiece;
        
        return inCheck;
    }
    
    isInCheck(color) {
        // Find king position
        let kingPos = null;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    kingPos = { row, col };
                    break;
                }
            }
            if (kingPos) break;
        }
        
        if (!kingPos) return false;
        
        // Check if any opponent piece can attack the king
        const opponentColor = color === 'white' ? 'black' : 'white';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === opponentColor) {
                    const moves = this.getPieceMoves(row, col);
                    if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    getPieceMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        switch (piece.type) {
            case 'pawn':
                return this.getPawnMoves(row, col, piece.color);
            case 'rook':
                return this.getRookMoves(row, col, piece.color);
            case 'knight':
                return this.getKnightMoves(row, col, piece.color);
            case 'bishop':
                return this.getBishopMoves(row, col, piece.color);
            case 'queen':
                return this.getQueenMoves(row, col, piece.color);
            case 'king':
                const kingMoves = [
                    { dr: -1, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: 1 },
                    { dr: 0, dc: -1 },                      { dr: 0, dc: 1 },
                    { dr: 1, dc: -1 },  { dr: 1, dc: 0 },  { dr: 1, dc: 1 }
                ];
                return kingMoves
                    .map(({ dr, dc }) => ({ row: row + dr, col: col + dc }))
                    .filter(pos => this.isValidPosition(pos.row, pos.col));
            default:
                return [];
        }
    }
    
    checkGameStatus() {
        const inCheck = this.isInCheck(this.currentPlayer);
        
        // Check if current player has any valid moves
        let hasValidMoves = false;
        for (let row = 0; row < 8 && !hasValidMoves; row++) {
            for (let col = 0; col < 8 && !hasValidMoves; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.currentPlayer) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) {
                        hasValidMoves = true;
                    }
                }
            }
        }
        
        if (!hasValidMoves) {
            this.gameOver = true;
            if (inCheck) {
                this.showGameOver(`Checkmate! ${this.currentPlayer === 'white' ? 'Black' : 'White'} wins!`);
            } else {
                this.showGameOver('Stalemate! Game is a draw.');
            }
        } else if (inCheck) {
            this.showStatus('Check!');
            this.highlightKingInCheck();
        } else {
            this.showStatus('');
        }
    }
    
    highlightKingInCheck() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === this.currentPlayer) {
                    const squares = document.querySelectorAll('.square');
                    squares[row * 8 + col].classList.add('in-check');
                }
            }
        }
    }
    
    showStatus(message) {
        const statusElement = document.getElementById('gameStatus');
        statusElement.textContent = message;
    }
    
    showGameOver(message) {
        const modal = document.getElementById('gameOverModal');
        document.getElementById('gameOverTitle').textContent = 'Game Over';
        document.getElementById('gameOverMessage').textContent = message;
        modal.classList.add('active');
    }
    
    updateTurnIndicator() {
        const turnElement = document.getElementById('currentTurn');
        turnElement.textContent = this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1);
        turnElement.className = `turn-color ${this.currentPlayer}`;
    }
    
    updateCapturedPieces() {
        const capturedWhiteElement = document.getElementById('capturedWhite');
        const capturedBlackElement = document.getElementById('capturedBlack');
        
        capturedWhiteElement.innerHTML = this.capturedPieces.white
            .map(piece => PIECES[piece.color][piece.type])
            .join(' ');
        
        capturedBlackElement.innerHTML = this.capturedPieces.black
            .map(piece => PIECES[piece.color][piece.type])
            .join(' ');
    }
    
    addMoveToHistory(move) {
        const historyElement = document.getElementById('moveHistory');
        const moveNumber = Math.floor(this.moveHistory.length / 2) + 1;
        const moveEntry = document.createElement('div');
        moveEntry.className = 'move-entry';
        
        const fromSquare = this.getSquareName(move.from.row, move.from.col);
        const toSquare = this.getSquareName(move.to.row, move.to.col);
        const pieceSymbol = PIECES[move.piece.color][move.piece.type];
        const captureSymbol = move.captured ? 'x' : '-';
        
        moveEntry.innerHTML = `
            <span class="move-number">${moveNumber}.</span>
            ${pieceSymbol} ${fromSquare} ${captureSymbol} ${toSquare}
        `;
        
        historyElement.appendChild(moveEntry);
        historyElement.scrollTop = historyElement.scrollHeight;
    }
    
    getSquareName(row, col) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const rank = 8 - row;
        return files[col] + rank;
    }
    
    undoMove() {
        if (this.moveHistory.length === 0 || this.gameOver) return;
        
        const lastMove = this.moveHistory.pop();
        this.board = lastMove.boardState;
        
        // Remove captured piece from captured pieces array
        if (lastMove.captured) {
            const capturedArray = this.capturedPieces[lastMove.piece.color];
            capturedArray.pop();
        }
        
        if (lastMove.enPassantCapture) {
            const capturedArray = this.capturedPieces[lastMove.piece.color];
            capturedArray.pop();
        }
        
        // Update last move
        if (this.moveHistory.length > 0) {
            const prevMove = this.moveHistory[this.moveHistory.length - 1];
            this.lastMove = { from: prevMove.from, to: prevMove.to };
        } else {
            this.lastMove = null;
        }
        
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.selectedSquare = null;
        
        // Remove last move from history display
        const historyElement = document.getElementById('moveHistory');
        if (historyElement.lastChild) {
            historyElement.removeChild(historyElement.lastChild);
        }
        
        this.renderBoard();
        this.updateTurnIndicator();
        this.showStatus('');
    }
    
    newGame() {
        this.board = [];
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.lastMove = null;
        this.gameOver = false;
        
        document.getElementById('moveHistory').innerHTML = '';
        document.getElementById('gameOverModal').classList.remove('active');
        
        this.initBoard();
        this.renderBoard();
        this.updateTurnIndicator();
        this.showStatus('');
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const btn = document.getElementById('toggleSoundBtn');
        btn.textContent = this.soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    }
    
    toggleCoordinates() {
        this.coordinatesVisible = !this.coordinatesVisible;
        const rankLabels = document.querySelector('.rank-labels');
        const fileLabels = document.querySelector('.file-labels');
        const btn = document.getElementById('toggleCoordsBtn');
        
        if (this.coordinatesVisible) {
            rankLabels.style.display = 'flex';
            fileLabels.style.display = 'flex';
            btn.textContent = '📍 Coordinates: ON';
        } else {
            rankLabels.style.display = 'none';
            fileLabels.style.display = 'none';
            btn.textContent = '📍 Coordinates: OFF';
        }
    }
    
    playMoveSound() {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    attachEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('undoBtn').addEventListener('click', () => this.undoMove());
        document.getElementById('toggleSoundBtn').addEventListener('click', () => this.toggleSound());
        document.getElementById('toggleCoordsBtn').addEventListener('click', () => this.toggleCoordinates());
        document.getElementById('newGameFromModal').addEventListener('click', () => this.newGame());
    }
}

// Initialize the game when the page loads
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new ChessGame();
});

