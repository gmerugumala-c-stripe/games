class GoGame {
    constructor(boardSize = 19) {
        this.boardSize = boardSize;
        this.canvas = document.getElementById('board-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.updateBoardMetrics();
        this.padding = 40;
        
        // Game state
        this.board = [];
        this.currentPlayer = 'black';
        this.blackCaptures = 0;
        this.whiteCaptures = 0;
        this.lastMove = null;
        this.koPoint = null;
        this.passCount = 0;
        this.gameOver = false;
        this.moveHistory = [];
        this.boardStates = [];
        this.moveLog = [];
        
        // Beginner mode
        this.showHints = true;
        this.hoveredGroup = null;
        this.currentTipIndex = 0;
        this.tips = [
            "Hover over stones to see their liberties. Groups with only 1 liberty are in danger!",
            "Try to connect your stones to make stronger groups. Connected stones share liberties.",
            "Corner positions are easiest to defend - they need fewer stones to surround.",
            "Don't be afraid to pass! Sometimes the best move is no move.",
            "Watch out for Ko situations - you can't immediately recapture after a single stone is taken.",
            "Build walls and territories in the opening, fight for boundaries in the middle game.",
            "Practice on smaller boards (9×9) to learn basic tactics before moving to 19×19."
        ];
        
        this.initializeBoard();
        this.setupCanvas();
        this.setupEventListeners();
        this.setupDifficultyButtons();
        this.setupBeginnerMode();
        this.drawBoard();
        this.updateUI();
        this.rotateTips();
    }
    
    updateBoardMetrics() {
        // Adjust cell size and stone radius based on board size
        if (this.boardSize === 9) {
            this.cellSize = 45;
            this.stoneRadius = 20;
        } else if (this.boardSize === 13) {
            this.cellSize = 35;
            this.stoneRadius = 16;
        } else {
            this.cellSize = 30;
            this.stoneRadius = 13;
        }
    }
    
    initializeBoard() {
        this.board = [];
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = null;
            }
        }
    }
    
    setupCanvas() {
        const size = this.cellSize * (this.boardSize - 1) + this.padding * 2;
        this.canvas.width = size;
        this.canvas.height = size;
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
        document.getElementById('pass-btn').addEventListener('click', () => this.pass());
        document.getElementById('undo-btn').addEventListener('click', () => this.undoMove());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
    }
    
    setupDifficultyButtons() {
        const difficultyButtons = document.querySelectorAll('.btn-difficulty');
        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const newSize = parseInt(btn.dataset.size);
                if (newSize !== this.boardSize) {
                    this.changeDifficulty(newSize);
                    
                    // Update active state
                    difficultyButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }
            });
        });
    }
    
    changeDifficulty(newSize) {
        this.boardSize = newSize;
        this.updateBoardMetrics();
        this.setupCanvas();
        this.reset();
        this.setStatus(`Difficulty changed to ${newSize}×${newSize} board!`);
    }
    
    setupBeginnerMode() {
        const hintsCheckbox = document.getElementById('beginner-hints');
        hintsCheckbox.addEventListener('change', (e) => {
            this.showHints = e.target.checked;
            this.drawBoard();
        });
    }
    
    rotateTips() {
        setInterval(() => {
            this.currentTipIndex = (this.currentTipIndex + 1) % this.tips.length;
            document.getElementById('tip-text').textContent = this.tips[this.currentTipIndex];
        }, 10000); // Change tip every 10 seconds
    }
    
    handleMouseMove(e) {
        if (!this.showHints || this.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Find nearest intersection
        const x = Math.round((mouseX - this.padding) / this.cellSize);
        const y = Math.round((mouseY - this.padding) / this.cellSize);
        
        // Check if there's a stone at this position
        if (x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize && this.board[x][y]) {
            this.hoveredGroup = this.getGroup(x, y);
            this.drawBoard();
        } else if (this.hoveredGroup) {
            this.hoveredGroup = null;
            this.drawBoard();
        }
    }
    
    handleMouseLeave() {
        if (this.hoveredGroup) {
            this.hoveredGroup = null;
            this.drawBoard();
        }
    }
    
    drawBoard() {
        // Clear canvas
        this.ctx.fillStyle = '#DCB35C';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.boardSize; i++) {
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding + i * this.cellSize, this.padding);
            this.ctx.lineTo(this.padding + i * this.cellSize, this.padding + (this.boardSize - 1) * this.cellSize);
            this.ctx.stroke();
            
            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, this.padding + i * this.cellSize);
            this.ctx.lineTo(this.padding + (this.boardSize - 1) * this.cellSize, this.padding + i * this.cellSize);
            this.ctx.stroke();
        }
        
        // Draw star points (hoshi) based on board size
        const starPoints = this.getStarPoints();
        
        if (starPoints.length > 0) {
            starPoints.forEach(([x, y]) => {
                this.ctx.beginPath();
                this.ctx.arc(
                    this.padding + x * this.cellSize,
                    this.padding + y * this.cellSize,
                    4,
                    0,
                    2 * Math.PI
                );
                this.ctx.fillStyle = '#000';
                this.ctx.fill();
            });
        }
        
        // Draw stones
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j]) {
                    this.drawStone(i, j, this.board[i][j]);
                }
            }
        }
        
        // Highlight last move
        if (this.lastMove) {
            const [x, y] = this.lastMove;
            this.ctx.strokeStyle = '#FF0000';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(
                this.padding + x * this.cellSize,
                this.padding + y * this.cellSize,
                this.stoneRadius + 3,
                0,
                2 * Math.PI
            );
            this.ctx.stroke();
        }
        
        // Show liberty count for hovered group
        if (this.showHints && this.hoveredGroup) {
            const liberties = this.countGroupLiberties(this.hoveredGroup);
            const color = this.board[this.hoveredGroup[0][0]][this.hoveredGroup[0][1]];
            
            // Highlight group
            this.hoveredGroup.forEach(([x, y]) => {
                this.ctx.strokeStyle = liberties <= 1 ? '#FF4444' : liberties <= 2 ? '#FFA500' : '#44FF44';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(
                    this.padding + x * this.cellSize,
                    this.padding + y * this.cellSize,
                    this.stoneRadius + 4,
                    0,
                    2 * Math.PI
                );
                this.ctx.stroke();
            });
            
            // Draw liberty count
            const [firstX, firstY] = this.hoveredGroup[0];
            this.ctx.fillStyle = liberties <= 1 ? '#FF0000' : liberties <= 2 ? '#FF8800' : '#00AA00';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Draw background circle for text
            this.ctx.beginPath();
            this.ctx.arc(
                this.padding + firstX * this.cellSize,
                this.padding + firstY * this.cellSize - this.stoneRadius - 15,
                12,
                0,
                2 * Math.PI
            );
            this.ctx.fillStyle = 'white';
            this.ctx.fill();
            this.ctx.strokeStyle = liberties <= 1 ? '#FF0000' : liberties <= 2 ? '#FF8800' : '#00AA00';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw liberty count text
            this.ctx.fillStyle = liberties <= 1 ? '#FF0000' : liberties <= 2 ? '#FF8800' : '#00AA00';
            this.ctx.fillText(
                liberties.toString(),
                this.padding + firstX * this.cellSize,
                this.padding + firstY * this.cellSize - this.stoneRadius - 15
            );
        }
    }
    
    countGroupLiberties(group) {
        const liberties = new Set();
        
        for (const [x, y] of group) {
            const neighbors = this.getNeighbors(x, y);
            for (const [nx, ny] of neighbors) {
                if (this.board[nx][ny] === null) {
                    liberties.add(`${nx},${ny}`);
                }
            }
        }
        
        return liberties.size;
    }
    
    getStarPoints() {
        // Return star points based on board size
        if (this.boardSize === 19) {
            return [
                [3, 3], [3, 9], [3, 15],
                [9, 3], [9, 9], [9, 15],
                [15, 3], [15, 9], [15, 15]
            ];
        } else if (this.boardSize === 13) {
            return [
                [3, 3], [3, 9],
                [6, 6],
                [9, 3], [9, 9]
            ];
        } else if (this.boardSize === 9) {
            return [
                [2, 2], [2, 6],
                [4, 4],
                [6, 2], [6, 6]
            ];
        }
        return [];
    }
    
    drawStone(x, y, color) {
        const centerX = this.padding + x * this.cellSize;
        const centerY = this.padding + y * this.cellSize;
        
        // Draw stone
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.stoneRadius, 0, 2 * Math.PI);
        
        if (color === 'black') {
            const gradient = this.ctx.createRadialGradient(
                centerX - 5, centerY - 5, 0,
                centerX, centerY, this.stoneRadius
            );
            gradient.addColorStop(0, '#444');
            gradient.addColorStop(1, '#000');
            this.ctx.fillStyle = gradient;
        } else {
            const gradient = this.ctx.createRadialGradient(
                centerX - 5, centerY - 5, 0,
                centerX, centerY, this.stoneRadius
            );
            gradient.addColorStop(0, '#FFF');
            gradient.addColorStop(1, '#DDD');
            this.ctx.fillStyle = gradient;
        }
        
        this.ctx.fill();
        this.ctx.strokeStyle = color === 'black' ? '#000' : '#AAA';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    handleClick(e) {
        if (this.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Convert to board coordinates
        const x = Math.round((clickX - this.padding) / this.cellSize);
        const y = Math.round((clickY - this.padding) / this.cellSize);
        
        // Check if click is within board
        if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) {
            return;
        }
        
        this.placeStone(x, y);
    }
    
    placeStone(x, y) {
        // Check if position is already occupied
        if (this.board[x][y] !== null) {
            this.setStatus('Position already occupied!');
            return;
        }
        
        // Check if move is valid (not suicide and not ko)
        if (!this.isValidMove(x, y)) {
            return;
        }
        
        // Save board state before move
        this.boardStates.push({
            board: this.getBoardState(),
            currentPlayer: this.currentPlayer,
            blackCaptures: this.blackCaptures,
            whiteCaptures: this.whiteCaptures,
            lastMove: this.lastMove,
            koPoint: this.koPoint
        });
        
        // Place stone
        this.board[x][y] = this.currentPlayer;
        this.lastMove = [x, y];
        
        // Capture opponent's stones
        const opponent = this.currentPlayer === 'black' ? 'white' : 'black';
        const captured = this.captureStones(opponent);
        
        // Update captures
        if (this.currentPlayer === 'black') {
            this.blackCaptures += captured;
        } else {
            this.whiteCaptures += captured;
        }
        
        // Check for ko
        this.updateKoPoint(x, y, captured);
        
        // Save board state
        this.moveHistory.push(this.getBoardState());
        
        // Log move
        this.moveLog.push({
            player: this.currentPlayer,
            position: [x, y],
            captured: captured,
            moveNumber: this.moveLog.length + 1
        });
        
        // Switch player
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.passCount = 0;
        
        this.drawBoard();
        this.updateUI();
        this.updateMoveHistory();
        this.setStatus('');
    }
    
    isValidMove(x, y) {
        // Check ko rule
        if (this.koPoint && this.koPoint[0] === x && this.koPoint[1] === y) {
            this.setStatus('Ko rule: Cannot recapture immediately!');
            return false;
        }
        
        // Temporarily place stone
        this.board[x][y] = this.currentPlayer;
        
        // Check if move captures opponent stones
        const opponent = this.currentPlayer === 'black' ? 'white' : 'black';
        const capturesOpponent = this.hasCaptures(opponent);
        
        // Check if own group has liberties
        const hasLiberties = this.groupHasLiberties(x, y);
        
        // Remove temporary stone
        this.board[x][y] = null;
        
        // Valid if: captures opponent OR has liberties (not suicide)
        if (!capturesOpponent && !hasLiberties) {
            this.setStatus('Suicide move not allowed!');
            return false;
        }
        
        return true;
    }
    
    hasCaptures(color) {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === color) {
                    if (!this.groupHasLiberties(i, j)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    groupHasLiberties(x, y) {
        const color = this.board[x][y];
        const visited = new Set();
        const queue = [[x, y]];
        
        while (queue.length > 0) {
            const [cx, cy] = queue.shift();
            const key = `${cx},${cy}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            const neighbors = this.getNeighbors(cx, cy);
            
            for (const [nx, ny] of neighbors) {
                if (this.board[nx][ny] === null) {
                    return true; // Found a liberty
                } else if (this.board[nx][ny] === color) {
                    queue.push([nx, ny]);
                }
            }
        }
        
        return false;
    }
    
    captureStones(color) {
        let totalCaptured = 0;
        const toRemove = [];
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === color && !this.groupHasLiberties(i, j)) {
                    const group = this.getGroup(i, j);
                    group.forEach(([x, y]) => toRemove.push([x, y]));
                }
            }
        }
        
        toRemove.forEach(([x, y]) => {
            this.board[x][y] = null;
            totalCaptured++;
        });
        
        return totalCaptured;
    }
    
    getGroup(x, y) {
        const color = this.board[x][y];
        const group = [];
        const visited = new Set();
        const queue = [[x, y]];
        
        while (queue.length > 0) {
            const [cx, cy] = queue.shift();
            const key = `${cx},${cy}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            group.push([cx, cy]);
            
            const neighbors = this.getNeighbors(cx, cy);
            
            for (const [nx, ny] of neighbors) {
                if (this.board[nx][ny] === color && !visited.has(`${nx},${ny}`)) {
                    queue.push([nx, ny]);
                }
            }
        }
        
        return group;
    }
    
    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize) {
                neighbors.push([nx, ny]);
            }
        }
        
        return neighbors;
    }
    
    updateKoPoint(x, y, captured) {
        // Ko applies when exactly one stone was captured
        // and the capturing group is also a single stone
        if (captured === 1) {
            const group = this.getGroup(x, y);
            if (group.length === 1) {
                // Find the captured stone's position
                const neighbors = this.getNeighbors(x, y);
                for (const [nx, ny] of neighbors) {
                    if (this.board[nx][ny] === null) {
                        // This could be where the stone was captured
                        this.koPoint = [nx, ny];
                        return;
                    }
                }
            }
        }
        this.koPoint = null;
    }
    
    pass() {
        if (this.gameOver) return;
        
        // Confirmation dialog for beginners
        if (this.showHints && this.passCount === 0) {
            if (!confirm('Are you sure you want to pass? Passing means you don\'t want to play a move this turn.')) {
                return;
            }
        }
        
        // Save board state before pass
        this.boardStates.push({
            board: this.getBoardState(),
            currentPlayer: this.currentPlayer,
            blackCaptures: this.blackCaptures,
            whiteCaptures: this.whiteCaptures,
            lastMove: this.lastMove,
            koPoint: this.koPoint
        });
        
        this.passCount++;
        this.koPoint = null;
        this.lastMove = null;
        
        // Log pass
        this.moveLog.push({
            player: this.currentPlayer,
            position: 'pass',
            captured: 0,
            moveNumber: this.moveLog.length + 1
        });
        
        if (this.passCount >= 2) {
            this.endGame();
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.setStatus(`${this.currentPlayer === 'black' ? 'White' : 'Black'} passed. Pass count: ${this.passCount}/2`);
        this.updateUI();
        this.updateMoveHistory();
    }
    
    undoMove() {
        if (this.boardStates.length === 0 || this.gameOver) {
            this.setStatus('No moves to undo!');
            return;
        }
        
        // Restore previous state
        const prevState = this.boardStates.pop();
        this.board = prevState.board;
        this.currentPlayer = prevState.currentPlayer;
        this.blackCaptures = prevState.blackCaptures;
        this.whiteCaptures = prevState.whiteCaptures;
        this.lastMove = prevState.lastMove;
        this.koPoint = prevState.koPoint;
        this.passCount = 0;
        
        // Remove from move history
        this.moveHistory.pop();
        this.moveLog.pop();
        
        this.drawBoard();
        this.updateUI();
        this.updateMoveHistory();
        this.setStatus('Move undone!');
    }
    
    endGame() {
        this.gameOver = true;
        const scores = this.calculateScore();
        
        document.getElementById('scores').style.display = 'block';
        document.getElementById('black-score').textContent = scores.black;
        document.getElementById('white-score').textContent = scores.white;
        
        const winner = scores.black > scores.white ? 'Black Wins!' : 
                       scores.white > scores.black ? 'White Wins!' : 
                       'Draw!';
        document.getElementById('winner').textContent = winner;
        
        this.setStatus('Game Over!');
    }
    
    calculateScore() {
        // Simple scoring: captured stones + territory
        // Territory is empty points surrounded by one color
        const territory = this.calculateTerritory();
        
        return {
            black: this.blackCaptures + territory.black,
            white: this.whiteCaptures + territory.white + 6.5 // Komi (compensation for going second)
        };
    }
    
    calculateTerritory() {
        const visited = new Set();
        const territory = { black: 0, white: 0 };
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null && !visited.has(`${i},${j}`)) {
                    const region = this.getEmptyRegion(i, j);
                    const owner = this.getRegionOwner(region);
                    
                    region.forEach(([x, y]) => visited.add(`${x},${y}`));
                    
                    if (owner === 'black') {
                        territory.black += region.length;
                    } else if (owner === 'white') {
                        territory.white += region.length;
                    }
                }
            }
        }
        
        return territory;
    }
    
    getEmptyRegion(x, y) {
        const region = [];
        const visited = new Set();
        const queue = [[x, y]];
        
        while (queue.length > 0) {
            const [cx, cy] = queue.shift();
            const key = `${cx},${cy}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            if (this.board[cx][cy] === null) {
                region.push([cx, cy]);
                const neighbors = this.getNeighbors(cx, cy);
                neighbors.forEach(([nx, ny]) => queue.push([nx, ny]));
            }
        }
        
        return region;
    }
    
    getRegionOwner(region) {
        const bordersBlack = new Set();
        const bordersWhite = new Set();
        
        for (const [x, y] of region) {
            const neighbors = this.getNeighbors(x, y);
            for (const [nx, ny] of neighbors) {
                if (this.board[nx][ny] === 'black') {
                    bordersBlack.add(`${nx},${ny}`);
                } else if (this.board[nx][ny] === 'white') {
                    bordersWhite.add(`${nx},${ny}`);
                }
            }
        }
        
        if (bordersBlack.size > 0 && bordersWhite.size === 0) {
            return 'black';
        } else if (bordersWhite.size > 0 && bordersBlack.size === 0) {
            return 'white';
        }
        return null; // Neutral territory
    }
    
    getBoardState() {
        return this.board.map(row => [...row]);
    }
    
    reset() {
        if (this.moveLog.length > 0) {
            if (!confirm('Are you sure you want to start a new game? Current game will be lost.')) {
                return;
            }
        }
        
        this.initializeBoard();
        this.currentPlayer = 'black';
        this.blackCaptures = 0;
        this.whiteCaptures = 0;
        this.lastMove = null;
        this.koPoint = null;
        this.passCount = 0;
        this.gameOver = false;
        this.moveHistory = [];
        this.boardStates = [];
        this.moveLog = [];
        
        document.getElementById('scores').style.display = 'none';
        
        this.drawBoard();
        this.updateUI();
        this.updateMoveHistory();
        this.setStatus('New game started!');
    }
    
    updateUI() {
        const turnText = this.currentPlayer === 'black' ? 'Black' : 'White';
        document.getElementById('current-turn').textContent = turnText;
        document.getElementById('black-captures').textContent = this.blackCaptures;
        document.getElementById('white-captures').textContent = this.whiteCaptures;
        
        // Update stone indicator
        const currentPlayerDiv = document.querySelector('.current-player');
        const stoneDiv = currentPlayerDiv.querySelector('.stone');
        stoneDiv.className = `stone ${this.currentPlayer}-stone`;
        
        // Update undo button
        const undoBtn = document.getElementById('undo-btn');
        undoBtn.disabled = this.boardStates.length === 0 || this.gameOver;
    }
    
    updateMoveHistory() {
        const historyDiv = document.getElementById('move-history');
        historyDiv.innerHTML = '';
        
        if (this.moveLog.length === 0) {
            historyDiv.innerHTML = '<p style="text-align: center; color: #999; font-size: 0.9rem;">No moves yet</p>';
            return;
        }
        
        // Show last 10 moves
        const recentMoves = this.moveLog.slice(-10).reverse();
        
        recentMoves.forEach(move => {
            const moveEntry = document.createElement('div');
            moveEntry.className = move.position === 'pass' ? 'move-entry pass' : 'move-entry';
            
            const moveNumber = document.createElement('span');
            moveNumber.className = 'move-number';
            moveNumber.textContent = `#${move.moveNumber}`;
            
            const playerStone = document.createElement('span');
            playerStone.className = `move-player ${move.player}`;
            
            const moveText = document.createElement('span');
            if (move.position === 'pass') {
                moveText.textContent = 'Pass';
            } else {
                const [x, y] = move.position;
                moveText.textContent = `(${x}, ${y})`;
                if (move.captured > 0) {
                    moveText.textContent += ` ⚔️ ${move.captured}`;
                }
            }
            
            moveEntry.appendChild(moveNumber);
            moveEntry.appendChild(playerStone);
            moveEntry.appendChild(moveText);
            
            historyDiv.appendChild(moveEntry);
        });
    }
    
    setStatus(message) {
        document.getElementById('status-message').textContent = message;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GoGame();
});

