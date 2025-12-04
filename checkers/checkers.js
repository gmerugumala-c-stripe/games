class CheckersGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'red'; // Red always moves first
        this.selectedPiece = null;
        this.validMoves = [];
        this.mustJump = false;
        this.multiJumpPiece = null;
        this.moveHistory = [];
        this.capturedPieces = { red: 0, black: 0 };
        this.lastMove = null;
        this.gameOver = false;
        this.soundEnabled = true;
        this.aiEnabled = true; // AI controls black pieces
        this.aiThinking = false;
        this.aiDifficulty = 'medium'; // easy, medium, hard
        
        this.initBoard();
        this.renderBoard();
        this.attachEventListeners();
        this.updateStats();
        this.updateTurnIndicator();
        this.updateAIButton();
    }
    
    initBoard() {
        // Initialize empty 8x8 board
        for (let row = 0; row < 8; row++) {
            this.board[row] = [];
            for (let col = 0; col < 8; col++) {
                this.board[row][col] = null;
            }
        }
        
        // Place black pieces (top 3 rows)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                // Only place on dark squares
                if ((row + col) % 2 === 1) {
                    this.board[row][col] = { color: 'black', isKing: false };
                }
            }
        }
        
        // Place red pieces (bottom 3 rows)
        for (let row = 5; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                // Only place on dark squares
                if ((row + col) % 2 === 1) {
                    this.board[row][col] = { color: 'red', isKing: false };
                }
            }
        }
    }
    
    renderBoard() {
        const boardElement = document.getElementById('checkerboard');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Highlight last move
                if (this.lastMove) {
                    if ((this.lastMove.from.row === row && this.lastMove.from.col === col) ||
                        (this.lastMove.to.row === row && this.lastMove.to.col === col)) {
                        square.classList.add('last-move');
                    }
                }
                
                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `piece ${piece.color}`;
                    if (piece.isKing) {
                        pieceElement.classList.add('king');
                    }
                    pieceElement.dataset.row = row;
                    pieceElement.dataset.col = col;
                    
                    if (this.selectedPiece && 
                        this.selectedPiece.row === row && 
                        this.selectedPiece.col === col) {
                        pieceElement.classList.add('selected');
                        square.classList.add('selected');
                    }
                    
                    square.appendChild(pieceElement);
                }
                
                // Show valid moves
                if (this.validMoves.some(move => move.row === row && move.col === col)) {
                    square.classList.add('valid-move');
                    if (this.board[row][col]) {
                        square.classList.add('has-piece');
                    }
                }
                
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                boardElement.appendChild(square);
            }
        }
    }
    
    handleSquareClick(row, col) {
        if (this.gameOver) return;
        
        // Block clicks during AI turn
        if (this.aiEnabled && this.currentPlayer === 'black') return;
        if (this.aiThinking) return;
        
        const piece = this.board[row][col];
        
        // Check if clicking on a valid move
        const isValidMove = this.validMoves.some(move => move.row === row && move.col === col);
        
        if (isValidMove && this.selectedPiece) {
            this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
            return;
        }
        
        // If in multi-jump, can only continue with same piece or pass (by clicking elsewhere)
        if (this.multiJumpPiece) {
            if (piece && piece.color === this.currentPlayer &&
                row === this.multiJumpPiece.row && col === this.multiJumpPiece.col) {
                // Already selected
                return;
            }
            return; // Must continue jumping or click the piece
        }
        
        // Select a piece
        if (piece && piece.color === this.currentPlayer) {
            // Check if this piece can move (respecting mandatory jumps)
            const moves = this.getValidMoves(row, col);
            const hasJumps = this.playerHasJumps(this.currentPlayer);
            
            // If there are jumps available, only allow selecting pieces that can jump
            if (hasJumps) {
                const pieceCanJump = moves.some(move => move.isJump);
                if (!pieceCanJump) {
                    this.showStatus('You must make a jump!');
                    return;
                }
            }
            
            this.selectedPiece = { row, col };
            // Filter to only jumps if jumps are available
            this.validMoves = hasJumps ? moves.filter(m => m.isJump) : moves;
            this.renderBoard();
        } else {
            // Deselect
            this.selectedPiece = null;
            this.validMoves = [];
            this.renderBoard();
        }
    }
    
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const moves = [];
        const directions = this.getMoveDirections(piece);
        
        // Check regular moves and jumps
        for (const dir of directions) {
            const newRow = row + dir.dr;
            const newCol = col + dir.dc;
            
            // Regular move (one diagonal)
            if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
                moves.push({ row: newRow, col: newCol, isJump: false });
            }
            
            // Jump move (two diagonals over enemy piece)
            const jumpRow = row + dir.dr * 2;
            const jumpCol = col + dir.dc * 2;
            
            if (this.isValidPosition(jumpRow, jumpCol) && 
                !this.board[jumpRow][jumpCol] &&
                this.board[newRow] && this.board[newRow][newCol] &&
                this.board[newRow][newCol].color !== piece.color) {
                moves.push({ 
                    row: jumpRow, 
                    col: jumpCol, 
                    isJump: true,
                    capturedRow: newRow,
                    capturedCol: newCol
                });
            }
        }
        
        return moves;
    }
    
    getMoveDirections(piece) {
        // Kings can move in all 4 diagonal directions
        if (piece.isKing) {
            return [
                { dr: -1, dc: -1 }, { dr: -1, dc: 1 },
                { dr: 1, dc: -1 }, { dr: 1, dc: 1 }
            ];
        }
        
        // Regular pieces: red moves up (negative row), black moves down (positive row)
        if (piece.color === 'red') {
            return [{ dr: -1, dc: -1 }, { dr: -1, dc: 1 }];
        } else {
            return [{ dr: 1, dc: -1 }, { dr: 1, dc: 1 }];
        }
    }
    
    playerHasJumps(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.some(move => move.isJump)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const moveData = this.validMoves.find(m => m.row === toRow && m.col === toCol);
        
        // Save state for undo
        const moveRecord = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: { ...piece },
            boardState: this.board.map(row => row.map(cell => cell ? { ...cell } : null)),
            capturedPieces: { ...this.capturedPieces },
            wasJump: moveData.isJump,
            currentPlayer: this.currentPlayer
        };
        
        // Move the piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Handle capture
        let madeCapture = false;
        if (moveData.isJump) {
            const captured = this.board[moveData.capturedRow][moveData.capturedCol];
            this.board[moveData.capturedRow][moveData.capturedCol] = null;
            this.capturedPieces[this.currentPlayer]++;
            moveRecord.captured = { 
                row: moveData.capturedRow, 
                col: moveData.capturedCol, 
                piece: captured 
            };
            madeCapture = true;
        }
        
        // Check for king promotion
        let wasPromoted = false;
        if (!piece.isKing) {
            if ((piece.color === 'red' && toRow === 0) ||
                (piece.color === 'black' && toRow === 7)) {
                piece.isKing = true;
                wasPromoted = true;
                moveRecord.promoted = true;
                this.showKingAnimation(piece.color);
            }
        }
        
        this.moveHistory.push(moveRecord);
        this.lastMove = { from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };
        
        // Check for multi-jump
        if (madeCapture && !wasPromoted) {
            const furtherJumps = this.getValidMoves(toRow, toCol).filter(m => m.isJump);
            if (furtherJumps.length > 0) {
                // Multi-jump available
                this.multiJumpPiece = { row: toRow, col: toCol };
                this.selectedPiece = { row: toRow, col: toCol };
                this.validMoves = furtherJumps;
                this.renderBoard();
                this.updateStats();
                this.playSound('capture');
                this.showStatus('Continue jumping!');
                return;
            }
        }
        
        // End turn
        this.endTurn(madeCapture);
    }
    
    endTurn(madeCapture) {
        this.selectedPiece = null;
        this.validMoves = [];
        this.multiJumpPiece = null;
        
        // Switch players
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        
        this.renderBoard();
        this.updateStats();
        this.updateTurnIndicator();
        this.addMoveToHistory();
        
        this.playSound(madeCapture ? 'capture' : 'move');
        
        // Check for game over
        this.checkGameOver();
        
        // Trigger AI if it's black's turn and AI is enabled
        if (!this.gameOver && this.aiEnabled && this.currentPlayer === 'black') {
            this.scheduleAIMove();
        }
    }
    
    checkGameOver() {
        // Count pieces
        let redPieces = 0, blackPieces = 0;
        let redHasMoves = false, blackHasMoves = false;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    if (piece.color === 'red') {
                        redPieces++;
                        if (!redHasMoves && this.getValidMoves(row, col).length > 0) {
                            redHasMoves = true;
                        }
                    } else {
                        blackPieces++;
                        if (!blackHasMoves && this.getValidMoves(row, col).length > 0) {
                            blackHasMoves = true;
                        }
                    }
                }
            }
        }
        
        // Check win conditions
        if (redPieces === 0) {
            this.gameOver = true;
            this.showGameOver('Black Wins!', 'All red pieces have been captured.');
            return;
        }
        
        if (blackPieces === 0) {
            this.gameOver = true;
            this.showGameOver('Red Wins!', 'All black pieces have been captured.');
            return;
        }
        
        // Check if current player has any moves
        const currentHasMoves = this.currentPlayer === 'red' ? redHasMoves : blackHasMoves;
        if (!currentHasMoves) {
            this.gameOver = true;
            const winner = this.currentPlayer === 'red' ? 'Black' : 'Red';
            this.showGameOver(`${winner} Wins!`, `${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)} has no valid moves.`);
        }
        
        this.showStatus('');
    }
    
    showGameOver(title, message) {
        const modal = document.getElementById('gameOverModal');
        document.getElementById('gameOverTitle').textContent = title;
        document.getElementById('gameOverMessage').textContent = message;
        modal.classList.add('active');
        this.playSound('gameOver');
    }
    
    showKingAnimation(color) {
        const modal = document.getElementById('kingModal');
        const titleEl = document.getElementById('kingModalTitle');
        const messageEl = document.getElementById('kingModalMessage');
        
        if (color === 'red') {
            titleEl.textContent = 'Crowned!';
            messageEl.textContent = 'Your piece has become a King!';
        } else {
            titleEl.textContent = 'Opponent Crowned!';
            messageEl.textContent = "Computer's piece has become a King!";
        }
        
        modal.classList.add('active');
        this.playSound('king');
        
        setTimeout(() => {
            modal.classList.remove('active');
        }, 1500);
    }
    
    showStatus(message) {
        const statusElement = document.getElementById('gameStatus');
        statusElement.textContent = message;
    }
    
    updateStats() {
        // Count pieces and kings
        let redCount = 0, blackCount = 0;
        let redKings = 0, blackKings = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    if (piece.color === 'red') {
                        redCount++;
                        if (piece.isKing) redKings++;
                    } else {
                        blackCount++;
                        if (piece.isKing) blackKings++;
                    }
                }
            }
        }
        
        document.getElementById('redPieces').textContent = redCount;
        document.getElementById('blackPieces').textContent = blackCount;
        document.getElementById('redKings').textContent = redKings;
        document.getElementById('blackKings').textContent = blackKings;
        document.getElementById('redCaptured').textContent = this.capturedPieces.red;
        document.getElementById('blackCaptured').textContent = this.capturedPieces.black;
    }
    
    updateTurnIndicator() {
        const redTurn = document.getElementById('redTurn');
        const blackTurn = document.getElementById('blackTurn');
        
        if (this.currentPlayer === 'red') {
            redTurn.classList.add('active');
            blackTurn.classList.remove('active');
        } else {
            blackTurn.classList.add('active');
            redTurn.classList.remove('active');
        }
    }
    
    addMoveToHistory() {
        if (this.moveHistory.length === 0) return;
        
        const lastMove = this.moveHistory[this.moveHistory.length - 1];
        const historyElement = document.getElementById('moveHistory');
        const moveEntry = document.createElement('div');
        moveEntry.className = 'move-entry';
        
        const fromSquare = this.getSquareName(lastMove.from.row, lastMove.from.col);
        const toSquare = this.getSquareName(lastMove.to.row, lastMove.to.col);
        const moveNum = this.moveHistory.length;
        
        let moveText = `${fromSquare} → ${toSquare}`;
        if (lastMove.wasJump) moveText += ' ✕';
        if (lastMove.promoted) moveText += ' 👑';
        
        moveEntry.innerHTML = `
            <span class="move-number">${moveNum}.</span>
            <span class="move-piece ${lastMove.piece.color}"></span>
            <span>${moveText}</span>
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
        if (this.moveHistory.length === 0 || this.gameOver || this.aiThinking) return;
        
        // If playing against AI and it's red's turn, undo both AI's move and player's move
        if (this.aiEnabled && this.currentPlayer === 'red' && this.moveHistory.length >= 2) {
            // Undo AI's move first
            this.undoSingleMove();
            // Then undo player's move
            this.undoSingleMove();
        } else {
            this.undoSingleMove();
        }
        
        this.renderBoard();
        this.updateStats();
        this.updateTurnIndicator();
        this.showStatus('');
    }
    
    undoSingleMove() {
        if (this.moveHistory.length === 0) return;
        
        const lastMove = this.moveHistory.pop();
        
        // Restore board state
        this.board = lastMove.boardState;
        this.capturedPieces = lastMove.capturedPieces;
        this.currentPlayer = lastMove.currentPlayer;
        
        // Update last move display
        if (this.moveHistory.length > 0) {
            const prevMove = this.moveHistory[this.moveHistory.length - 1];
            this.lastMove = { from: prevMove.from, to: prevMove.to };
        } else {
            this.lastMove = null;
        }
        
        this.selectedPiece = null;
        this.validMoves = [];
        this.multiJumpPiece = null;
        
        // Remove last move from history display
        const historyElement = document.getElementById('moveHistory');
        if (historyElement.lastChild) {
            historyElement.removeChild(historyElement.lastChild);
        }
    }
    
    newGame() {
        this.board = [];
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.validMoves = [];
        this.mustJump = false;
        this.multiJumpPiece = null;
        this.moveHistory = [];
        this.capturedPieces = { red: 0, black: 0 };
        this.lastMove = null;
        this.gameOver = false;
        
        document.getElementById('moveHistory').innerHTML = '';
        document.getElementById('gameOverModal').classList.remove('active');
        
        this.initBoard();
        this.renderBoard();
        this.updateStats();
        this.updateTurnIndicator();
        this.showStatus('');
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const btn = document.getElementById('toggleSoundBtn');
        const icon = this.soundEnabled ? '🔊' : '🔇';
        btn.innerHTML = `<span class="btn-icon">${icon}</span> Sound`;
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch (type) {
            case 'move':
                oscillator.frequency.value = 600;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
                
            case 'capture':
                oscillator.frequency.value = 400;
                oscillator.type = 'square';
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.15);
                break;
                
            case 'king':
                // Play a little fanfare
                const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
                notes.forEach((freq, i) => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.value = freq;
                    osc.type = 'sine';
                    gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.2);
                    osc.start(audioContext.currentTime + i * 0.1);
                    osc.stop(audioContext.currentTime + i * 0.1 + 0.2);
                });
                return;
                
            case 'gameOver':
                oscillator.frequency.value = 300;
                oscillator.type = 'triangle';
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
        }
    }
    
    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    
    // ==================== AI METHODS ====================
    
    scheduleAIMove() {
        this.aiThinking = true;
        this.showStatus('Computer is thinking...');
        
        // Add delay for more natural feel
        const delay = this.aiDifficulty === 'easy' ? 500 : 
                      this.aiDifficulty === 'medium' ? 800 : 1200;
        
        setTimeout(() => {
            this.makeAIMove();
        }, delay);
    }
    
    makeAIMove() {
        if (this.gameOver || this.currentPlayer !== 'black') {
            this.aiThinking = false;
            return;
        }
        
        const bestMove = this.findBestMove();
        
        if (!bestMove) {
            this.aiThinking = false;
            return;
        }
        
        // Execute the move
        this.selectedPiece = { row: bestMove.fromRow, col: bestMove.fromCol };
        this.validMoves = this.getValidMovesForAI(bestMove.fromRow, bestMove.fromCol);
        
        // Small delay before making the move for visual effect
        setTimeout(() => {
            this.makeMove(bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol);
            this.aiThinking = false;
            
            // Handle multi-jump for AI
            if (this.multiJumpPiece && this.currentPlayer === 'black') {
                this.scheduleAIMove();
            }
        }, 200);
    }
    
    getValidMovesForAI(row, col) {
        const moves = this.getValidMoves(row, col);
        const hasJumps = this.playerHasJumps('black');
        return hasJumps ? moves.filter(m => m.isJump) : moves;
    }
    
    findBestMove() {
        const allMoves = this.getAllPossibleMoves('black');
        
        if (allMoves.length === 0) return null;
        
        // Score each move
        const scoredMoves = allMoves.map(move => ({
            ...move,
            score: this.evaluateMove(move)
        }));
        
        // Sort by score (highest first)
        scoredMoves.sort((a, b) => b.score - a.score);
        
        // Add randomness based on difficulty
        let selectedMove;
        if (this.aiDifficulty === 'easy') {
            // Pick from top 50% of moves randomly
            const topMoves = scoredMoves.slice(0, Math.max(1, Math.ceil(scoredMoves.length * 0.5)));
            selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];
        } else if (this.aiDifficulty === 'medium') {
            // Pick from top 3 moves with weighted randomness
            const topMoves = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
            const weights = [0.6, 0.3, 0.1];
            const rand = Math.random();
            let cumulative = 0;
            for (let i = 0; i < topMoves.length; i++) {
                cumulative += weights[i] || 0.1;
                if (rand < cumulative) {
                    selectedMove = topMoves[i];
                    break;
                }
            }
            if (!selectedMove) selectedMove = topMoves[0];
        } else {
            // Hard: always pick best move (with tiny randomness for equal scores)
            const bestScore = scoredMoves[0].score;
            const bestMoves = scoredMoves.filter(m => m.score === bestScore);
            selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        }
        
        return selectedMove;
    }
    
    getAllPossibleMoves(color) {
        const moves = [];
        const hasJumps = this.playerHasJumps(color);
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    let pieceMoves = this.getValidMoves(row, col);
                    
                    // If jumps available, only consider jumps
                    if (hasJumps) {
                        pieceMoves = pieceMoves.filter(m => m.isJump);
                    }
                    
                    pieceMoves.forEach(move => {
                        moves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: move.row,
                            toCol: move.col,
                            isJump: move.isJump,
                            capturedRow: move.capturedRow,
                            capturedCol: move.capturedCol,
                            piece: piece
                        });
                    });
                }
            }
        }
        
        return moves;
    }
    
    evaluateMove(move) {
        let score = 0;
        const piece = this.board[move.fromRow][move.fromCol];
        
        // === CAPTURES ARE MANDATORY AND HIGH VALUE ===
        if (move.isJump) {
            score += 50;
            
            // Check for multi-jump potential
            const multiJumpCount = this.countPotentialMultiJumps(move);
            score += multiJumpCount * 30;
            
            // Capturing a king is more valuable
            const captured = this.board[move.capturedRow][move.capturedCol];
            if (captured && captured.isKing) {
                score += 25;
            }
        }
        
        // === KING PROMOTION ===
        if (!piece.isKing && move.toRow === 7) {
            score += 40;
        }
        
        // === PROTECT PIECES FROM CAPTURE ===
        // Check if piece is currently under threat
        const currentlyThreatened = this.isPieceThreatened(move.fromRow, move.fromCol);
        if (currentlyThreatened) {
            score += 15; // Bonus for moving a threatened piece
        }
        
        // Check if destination is safe
        const willBeThreatened = this.willBeThreatened(move);
        if (willBeThreatened) {
            score -= 35; // Penalty for moving into danger
            if (piece.isKing) {
                score -= 20; // Extra penalty for risking a king
            }
        }
        
        // === POSITIONAL ADVANTAGES ===
        
        // Prefer center control (columns 2-5 are more central)
        const centerBonus = 4 - Math.abs(3.5 - move.toCol);
        score += centerBonus * 2;
        
        // Advance pieces (black wants higher row numbers)
        if (!piece.isKing) {
            score += move.toRow * 1.5;
        }
        
        // Kings prefer central rows for mobility
        if (piece.isKing) {
            const rowCenter = 4 - Math.abs(3.5 - move.toRow);
            score += rowCenter * 1.5;
        }
        
        // Protect the back row (don't move last defenders too early)
        if (move.fromRow === 0 && !piece.isKing) {
            const piecesInBackRows = this.countPiecesInRows('black', 0, 2);
            if (piecesInBackRows <= 2) {
                score -= 5;
            }
        }
        
        // Edge pieces are slightly less flexible
        if (move.toCol === 0 || move.toCol === 7) {
            score -= 2;
        }
        
        // Add small random factor for variety
        score += Math.random() * 3;
        
        return score;
    }
    
    countPotentialMultiJumps(move) {
        // Simulate the move and count further jumps
        const originalBoard = this.board.map(row => row.map(cell => cell ? { ...cell } : null));
        
        // Make the move
        const piece = this.board[move.fromRow][move.fromCol];
        this.board[move.toRow][move.toCol] = piece;
        this.board[move.fromRow][move.fromCol] = null;
        this.board[move.capturedRow][move.capturedCol] = null;
        
        // Check for promotion
        let wasPromoted = false;
        if (!piece.isKing && move.toRow === 7) {
            piece.isKing = true;
            wasPromoted = true;
        }
        
        // Count further jumps (only if not promoted)
        let jumpCount = 0;
        if (!wasPromoted) {
            const furtherJumps = this.getValidMoves(move.toRow, move.toCol).filter(m => m.isJump);
            jumpCount = furtherJumps.length;
        }
        
        // Restore original board
        this.board = originalBoard;
        
        return jumpCount;
    }
    
    isPieceThreatened(row, col) {
        const piece = this.board[row][col];
        if (!piece) return false;
        
        // Check if any opponent piece can capture this piece
        const opponentColor = piece.color === 'red' ? 'black' : 'red';
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const enemyPiece = this.board[r][c];
                if (enemyPiece && enemyPiece.color === opponentColor) {
                    const moves = this.getValidMoves(r, c);
                    for (const move of moves) {
                        if (move.isJump && 
                            move.capturedRow === row && 
                            move.capturedCol === col) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    
    willBeThreatened(move) {
        // Simulate the move
        const originalBoard = this.board.map(row => row.map(cell => cell ? { ...cell } : null));
        
        const piece = this.board[move.fromRow][move.fromCol];
        this.board[move.toRow][move.toCol] = { ...piece };
        this.board[move.fromRow][move.fromCol] = null;
        if (move.isJump) {
            this.board[move.capturedRow][move.capturedCol] = null;
        }
        
        // Check if new position is threatened
        const threatened = this.isPieceThreatened(move.toRow, move.toCol);
        
        // Restore board
        this.board = originalBoard;
        
        return threatened;
    }
    
    countPiecesInRows(color, startRow, endRow) {
        let count = 0;
        for (let row = startRow; row <= endRow; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    count++;
                }
            }
        }
        return count;
    }
    
    toggleAI() {
        this.aiEnabled = !this.aiEnabled;
        this.updateAIButton();
        this.updateDifficultySelector();
        
        // If AI just enabled and it's black's turn, make a move
        if (this.aiEnabled && this.currentPlayer === 'black' && !this.gameOver) {
            this.scheduleAIMove();
        }
    }
    
    updateAIButton() {
        const btn = document.getElementById('toggleAIBtn');
        if (btn) {
            const icon = this.aiEnabled ? '🤖' : '👤';
            const text = this.aiEnabled ? 'vs Computer' : 'vs Human';
            btn.innerHTML = `<span class="btn-icon">${icon}</span> ${text}`;
            btn.classList.toggle('ai-on', this.aiEnabled);
        }
    }
    
    updateDifficultySelector() {
        const selector = document.getElementById('difficultySelector');
        if (selector) {
            selector.classList.toggle('hidden', !this.aiEnabled);
        }
    }
    
    setDifficulty(difficulty) {
        this.aiDifficulty = difficulty;
        // Update the select element to reflect the change
        const select = document.getElementById('difficultySelect');
        if (select) {
            select.value = difficulty;
        }
    }
    
    // ==================== END AI METHODS ====================
    
    attachEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('undoBtn').addEventListener('click', () => this.undoMove());
        document.getElementById('toggleSoundBtn').addEventListener('click', () => this.toggleSound());
        document.getElementById('toggleAIBtn').addEventListener('click', () => this.toggleAI());
        document.getElementById('difficultySelect').addEventListener('change', (e) => this.setDifficulty(e.target.value));
        document.getElementById('newGameFromModal').addEventListener('click', () => this.newGame());
    }
}

// Initialize the game when the page loads
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new CheckersGame();
});

