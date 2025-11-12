// Tetris Game with Beautiful Animations
class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('tetris-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.holdCanvas = document.getElementById('hold-canvas');
        this.holdCtx = this.holdCanvas.getContext('2d');

        // Game state
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.holdPiece = null;
        this.canHold = true;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameRunning = false;
        this.paused = false;
        this.dropTime = 0;
        this.dropInterval = 1000;

        // Animation state
        this.animations = [];
        this.particles = [];
        this.confetti = [];
        this.blastBubbles = [];

        // Colors for pieces
        this.colors = {
            I: '#11998e', // Teal
            O: '#ffe66d', // Yellow
            T: '#ff6e9f', // Pink
            S: '#38ef7d', // Green
            Z: '#ff416c', // Red-Pink
            J: '#2d1b69', // Dark Purple
            L: '#ff8c42'  // Orange
        };

        // Initialize game
        this.init();
        this.setupEventListeners();
    }

    // Define all Tetris pieces (tetrominoes) and their rotations
    getPieces() {
        return {
            I: {
                color: this.colors.I,
                shapes: [
                    // Horizontal
                    [
                        [0, 0, 0, 0],
                        [1, 1, 1, 1],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0]
                    ],
                    // Vertical
                    [
                        [0, 0, 1, 0],
                        [0, 0, 1, 0],
                        [0, 0, 1, 0],
                        [0, 0, 1, 0]
                    ],
                    // Horizontal (same as first)
                    [
                        [0, 0, 0, 0],
                        [1, 1, 1, 1],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0]
                    ],
                    // Vertical (same as second)
                    [
                        [0, 0, 1, 0],
                        [0, 0, 1, 0],
                        [0, 0, 1, 0],
                        [0, 0, 1, 0]
                    ]
                ]
            },
            O: {
                color: this.colors.O,
                shapes: [
                    // Square - same in all rotations
                    [
                        [0, 1, 1, 0],
                        [0, 1, 1, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0]
                    ],
                    [
                        [0, 1, 1, 0],
                        [0, 1, 1, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0]
                    ],
                    [
                        [0, 1, 1, 0],
                        [0, 1, 1, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0]
                    ],
                    [
                        [0, 1, 1, 0],
                        [0, 1, 1, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0]
                    ]
                ]
            },
            T: {
                color: this.colors.T,
                shapes: [
                    // Up
                    [
                        [0, 1, 0, 0],
                        [1, 1, 1, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0]
                    ],
                    // Right
                    [
                        [0, 1, 0, 0],
                        [0, 1, 1, 0],
                        [0, 1, 0, 0],
                        [0, 0, 0, 0]
                    ],
                    // Down
                    [
                        [0, 0, 0, 0],
                        [1, 1, 1, 0],
                        [0, 1, 0, 0],
                        [0, 0, 0, 0]
                    ],
                    // Left
                    [
                        [0, 1, 0, 0],
                        [1, 1, 0, 0],
                        [0, 1, 0, 0],
                        [0, 0, 0, 0]
                    ]
                ]
            },
            S: {
                color: this.colors.S,
                shapes: [
                    // Horizontal
                    [
                        [0, 1, 1, 0],
                        [1, 1, 0, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0]
                    ],
                    // Vertical
                    [
                        [0, 1, 0, 0],
                        [0, 1, 1, 0],
                        [0, 0, 1, 0],
                        [0, 0, 0, 0]
                    ],
                    // Horizontal (same as first)
                    [
                        [0, 1, 1, 0],
                        [1, 1, 0, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0]
                    ],
                    // Vertical (same as second)
                    [
                        [0, 1, 0, 0],
                        [0, 1, 1, 0],
                        [0, 0, 1, 0],
                        [0, 0, 0, 0]
                    ]
                ]
            },
            Z: {
                color: this.colors.Z,
                shapes: [
                    // Horizontal
                    [
                        [1, 1, 0, 0],
                        [0, 1, 1, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0]
                    ],
                    // Vertical
                    [
                        [0, 0, 1, 0],
                        [0, 1, 1, 0],
                        [0, 1, 0, 0],
                        [0, 0, 0, 0]
                    ],
                    // Horizontal (same as first)
                    [
                        [1, 1, 0, 0],
                        [0, 1, 1, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0]
                    ],
                    // Vertical (same as second)
                    [
                        [0, 0, 1, 0],
                        [0, 1, 1, 0],
                        [0, 1, 0, 0],
                        [0, 0, 0, 0]
                    ]
                ]
            },
            J: {
                color: this.colors.J,
                shapes: [
                    // Up
                    [
                        [1, 0, 0, 0],
                        [1, 1, 1, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0]
                    ],
                    // Right
                    [
                        [0, 1, 1, 0],
                        [0, 1, 0, 0],
                        [0, 1, 0, 0],
                        [0, 0, 0, 0]
                    ],
                    // Down
                    [
                        [0, 0, 0, 0],
                        [1, 1, 1, 0],
                        [0, 0, 1, 0],
                        [0, 0, 0, 0]
                    ],
                    // Left
                    [
                        [0, 1, 0, 0],
                        [0, 1, 0, 0],
                        [1, 1, 0, 0],
                        [0, 0, 0, 0]
                    ]
                ]
            },
            L: {
                color: this.colors.L,
                shapes: [
                    // Up
                    [
                        [0, 0, 1, 0],
                        [1, 1, 1, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0]
                    ],
                    // Right
                    [
                        [0, 1, 0, 0],
                        [0, 1, 0, 0],
                        [0, 1, 1, 0],
                        [0, 0, 0, 0]
                    ],
                    // Down
                    [
                        [0, 0, 0, 0],
                        [1, 1, 1, 0],
                        [1, 0, 0, 0],
                        [0, 0, 0, 0]
                    ],
                    // Left
                    [
                        [1, 1, 0, 0],
                        [0, 1, 0, 0],
                        [0, 1, 0, 0],
                        [0, 0, 0, 0]
                    ]
                ]
            }
        };
    }

    init() {
        // Initialize empty board (10 columns x 20 rows)
        this.board = Array(20).fill().map(() => Array(10).fill(0));

        // Get piece definitions
        this.pieces = this.getPieces();

        // Generate first pieces
        this.generateNewPiece();
        this.generateNextPiece();

        // Draw initial state
        this.draw();
        this.drawNextPiece();
        this.drawHoldPiece();
    }

    generateNewPiece() {
        const pieceTypes = Object.keys(this.pieces);
        const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];

        this.currentPiece = {
            type: randomType,
            shape: this.pieces[randomType].shapes[0],
            color: this.pieces[randomType].color,
            x: 3, // Center horizontally
            y: 0,
            rotation: 0
        };
    }

    generateNextPiece() {
        const pieceTypes = Object.keys(this.pieces);
        const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];

        this.nextPiece = {
            type: randomType,
            shape: this.pieces[randomType].shapes[0],
            color: this.pieces[randomType].color
        };
    }

    performHold() {

        // Allow holding even when game is not running for testing
        if (!this.currentPiece) {
            return;
        }

        // If there's no held piece, swap current with next
        if (!this.holdPiece) {
            this.holdPiece = {
                type: this.currentPiece.type,
                shape: this.pieces[this.currentPiece.type].shapes[0],
                color: this.currentPiece.color
            };
            this.currentPiece = this.nextPiece;
            this.generateNextPiece();
        } else {
            // Swap current piece with held piece
            const temp = {
                type: this.currentPiece.type,
                shape: this.pieces[this.currentPiece.type].shapes[0],
                color: this.currentPiece.color
            };

            this.currentPiece = {
                type: this.holdPiece.type,
                shape: this.holdPiece.shape,
                color: this.holdPiece.color,
                x: 3,
                y: 0,
                rotation: 0
            };

            this.holdPiece = temp;
        }

        // Reset piece position and rotation
        this.currentPiece.x = 3;
        this.currentPiece.y = 0;
        this.currentPiece.rotation = 0;

        // Prevent holding again until next piece (only during gameplay)
        if (this.gameRunning) {
            this.canHold = false;
        }

        // Add visual feedback - flash the hold canvas
        this.addHoldFlashAnimation();

        // Update displays
        this.drawHoldPiece();
        this.drawNextPiece();
    }

    setupEventListeners() {

        const self = this; // Store reference to TetrisGame instance
        document.addEventListener('keydown', (e) => {
            // Allow hold functionality even when game is not running (for testing)
            if (e.key === 'c' || e.key === 'C' || e.keyCode === 67 || e.code === 'KeyC') {
                e.preventDefault();
                self.performHold();
                return;
            }

            if (!this.gameRunning || this.paused) return;

            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.rotatePiece();
                    break;
                case ' ':
                    e.preventDefault();
                    this.hardDrop();
                    break;
            }
        });

        // Button controls
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const restartBtn = document.getElementById('restart-btn');

        if (startBtn) startBtn.addEventListener('click', () => self.startGame());
        if (pauseBtn) pauseBtn.addEventListener('click', () => self.pauseGame());
        if (restartBtn) restartBtn.addEventListener('click', () => self.restartGame());

        // Global pause key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                if (self.gameRunning) {
                    self.pauseGame();
                }
            }
        });
    }

    startGame() {
        if (this.gameRunning) return;

        this.gameRunning = true;
        this.paused = false;
        this.lastTime = 0;

        document.getElementById('start-btn').disabled = true;
        document.getElementById('pause-btn').disabled = false;
        document.getElementById('restart-btn').disabled = false;

        this.gameLoop(0);
    }

    pauseGame() {
        this.paused = !this.paused;
        document.getElementById('pause-btn').textContent = this.paused ? 'Resume' : 'Pause';
    }

    restartGame() {
        this.gameRunning = false;
        this.paused = false;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropInterval = 1000;
        this.animations = [];
        this.particles = [];
        this.confetti = [];
        this.blastBubbles = [];
        this.holdPiece = null;
        this.canHold = true;

        this.init();

        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        document.getElementById('pause-btn').textContent = 'Pause';
        document.getElementById('restart-btn').disabled = true;

        this.updateUI();
        this.drawHoldPiece();
    }

    gameLoop(currentTime) {
        if (!this.gameRunning) return;

        if (this.paused) {
            requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.dropTime += deltaTime;
        if (this.dropTime >= this.dropInterval) {
            this.dropTime = 0;
            this.movePieceSmooth(0, 1); // Use smooth movement for automatic falling
        }

        this.updateAnimations(deltaTime);
        this.draw();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    movePiece(dx, dy) {
        if (!this.currentPiece) return;

        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;

        if (this.isValidPosition(this.currentPiece.shape, newX, newY)) {
            // Cancel any existing movement animation before starting a new one
            this.animations = this.animations.filter(a => a.type !== 'movement');

            this.currentPiece.x = newX;
            this.currentPiece.y = newY;

            // Add smooth movement animation
            this.addMovementAnimation(dx, dy);
            return true;
        } else if (dy > 0) {
            // Piece can't move down, lock it in place
            this.lockPiece();
            return false;
        }
        return false;
    }

    movePieceSmooth(dx, dy) {
        // Instant movement without animation for automatic falling
        if (!this.currentPiece) return;

        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;

        if (this.isValidPosition(this.currentPiece.shape, newX, newY)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            return true;
        } else if (dy > 0) {
            // Piece can't move down, lock it in place
            this.lockPiece();
            return false;
        }
        return false;
    }

    rotatePiece() {
        if (!this.currentPiece) return;

        const newRotation = (this.currentPiece.rotation + 1) % 4;
        const newShape = this.pieces[this.currentPiece.type].shapes[newRotation];

        if (this.isValidPosition(newShape, this.currentPiece.x, this.currentPiece.y)) {
            this.currentPiece.rotation = newRotation;
            this.currentPiece.shape = newShape;

            // Add rotation animation
            this.addRotationAnimation();
        }
    }

    hardDrop() {
        if (!this.currentPiece) return;

        let dropDistance = 0;
        while (this.movePiece(0, 1)) {
            dropDistance++;
        }

        // Bonus points for hard drop
        this.score += dropDistance * 2;
        this.updateUI();
    }

    isValidPosition(shape, x, y) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const boardX = x + col;
                    const boardY = y + row;

                    // Check boundaries
                    if (boardX < 0 || boardX >= 10 || boardY >= 20) {
                        return false;
                    }

                    // Check collision with existing pieces (but allow negative Y for spawning)
                    if (boardY >= 0 && this.board[boardY][boardX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    lockPiece() {
        // Place piece on board
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const boardY = this.currentPiece.y + row;
                    const boardX = this.currentPiece.x + col;

                    if (boardY >= 0) {
                        this.board[boardY][boardX] = {
                            color: this.currentPiece.color,
                            type: this.currentPiece.type
                        };
                    }
                }
            }
        }

        // Check for completed lines
        this.checkLines();

        // Generate new piece
        this.currentPiece = this.nextPiece;
        this.currentPiece.x = 3;
        this.currentPiece.y = 0;
        this.currentPiece.rotation = 0;

        this.generateNextPiece();

        // Allow holding again for the new piece
        this.canHold = true;

        // Check game over
        if (!this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
            this.gameOver();
        }

        this.drawNextPiece();
    }

    checkLines() {
        let linesCleared = 0;

        for (let row = this.board.length - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                // Line is complete
                linesCleared++;

                // Add line clearing animation
                this.addLineClearAnimation(row);

                // Remove the line
                this.board.splice(row, 1);
                // Add new empty line at top
                this.board.unshift(Array(10).fill(0));

                // Check the same row again (since we removed one)
                row++;
            }
        }

        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += this.calculateScore(linesCleared);
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);

            // Add confetti celebration!
            this.addConfetti(linesCleared);

            // Add floating bubble with "# X blast"
            this.addBlastBubble(linesCleared);

            this.updateUI();
        }
    }

    calculateScore(lines) {
        const baseScores = [0, 40, 100, 300, 1200]; // 0, 1, 2, 3, 4 lines
        return baseScores[lines] * this.level;
    }

    gameOver() {
        this.gameRunning = false;
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        document.getElementById('restart-btn').disabled = true;

        // Add game over animation
        this.addGameOverAnimation();
    }

    updateUI() {
        const scoreElement = document.getElementById('score');
        const linesElement = document.getElementById('lines');
        const levelElement = document.getElementById('level');

        // Animate score changes
        if (scoreElement.textContent !== this.score.toLocaleString()) {
            scoreElement.classList.add('updating');
            scoreElement.textContent = this.score.toLocaleString();
            setTimeout(() => scoreElement.classList.remove('updating'), 500);
        } else {
            scoreElement.textContent = this.score.toLocaleString();
        }

        linesElement.textContent = this.lines;
        levelElement.textContent = this.level;

        // Add glow effect to canvas when playing
        const canvas = document.getElementById('tetris-canvas');
        if (this.gameRunning && !this.paused) {
            canvas.classList.add('glow');
        } else {
            canvas.classList.remove('glow');
        }
    }

    // Animation methods
    addMovementAnimation(dx, dy) {
        // Add smooth sliding animation
        this.animations.push({
            type: 'movement',
            startX: this.currentPiece.x - dx,
            startY: this.currentPiece.y - dy,
            endX: this.currentPiece.x,
            endY: this.currentPiece.y,
            duration: 80, // milliseconds - faster for smoother feel
            elapsed: 0,
            easing: 'easeOutQuad' // Smoother easing
        });
    }

    addRotationAnimation() {
        // Add rotation animation with visual feedback
        this.animations.push({
            type: 'rotation',
            centerX: this.currentPiece.x + 1.5, // Center of rotation
            centerY: this.currentPiece.y + 1.5,
            startAngle: (this.currentPiece.rotation - 1) * (Math.PI / 2),
            endAngle: this.currentPiece.rotation * (Math.PI / 2),
            duration: 150,
            elapsed: 0,
            easing: 'easeOutBack'
        });
    }

    addLineClearAnimation(row) {
        // Create spectacular line clearing effect
        const blockSize = 30;
        const particles = [];

        // Create particles from the cleared line
        for (let col = 0; col < 10; col++) {
            if (this.board[row][col]) {
                const centerX = col * blockSize + blockSize / 2;
                const centerY = row * blockSize + blockSize / 2;

                // Create multiple particles per block
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const speed = 2 + Math.random() * 3;
                    const life = 500 + Math.random() * 500;

                    particles.push({
                        x: centerX,
                        y: centerY,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        color: this.board[row][col].color,
                        life: life,
                        maxLife: life,
                        size: 3 + Math.random() * 4
                    });
                }
            }
        }

        // Add flash effect
        this.animations.push({
            type: 'lineFlash',
            row: row,
            duration: 200,
            elapsed: 0
        });

        // Add particles to global particles array
        this.particles.push(...particles);

        // Add screen shake effect
        this.animations.push({
            type: 'screenShake',
            intensity: 5,
            duration: 300,
            elapsed: 0
        });
    }

    addHoldFlashAnimation() {
        // Flash effect for hold canvas
        this.animations.push({
            type: 'holdFlash',
            duration: 200,
            elapsed: 0
        });
    }

    addGameOverAnimation() {
        // Game over screen fade effect
        this.animations.push({
            type: 'gameOver',
            duration: 2000,
            elapsed: 0
        });
    }

    addConfetti(linesCleared) {
        // Create confetti particles based on number of lines cleared
        const confettiCount = 50 + (linesCleared * 30); // More confetti for more lines
        const canvasCenterX = this.canvas.width / 2;

        // Confetti colors - vibrant and festive!
        const confettiColors = [
            '#ff6e9f', '#11998e', '#38ef7d', '#ffe66d',
            '#ff416c', '#2d1b69', '#ff8c42', '#0d7a6e',
            '#ff6e9f', '#38ef7d', '#ffe66d', '#11998e',
            '#ff416c', '#2d1b69', '#ff8c42', '#0d7a6e'
        ];

        for (let i = 0; i < confettiCount; i++) {
            // Spawn confetti from the center-top area
            const spawnX = canvasCenterX + (Math.random() - 0.5) * 200;
            const spawnY = Math.random() * 200; // Top portion of canvas

            // Random velocity - spread outward
            const angle = (Math.random() - 0.5) * Math.PI * 1.5; // Spread mostly downward
            const speed = 2 + Math.random() * 5;
            const vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 2;
            const vy = Math.sin(angle) * speed + Math.random() * 2;

            // Random confetti properties
            const size = 4 + Math.random() * 6;
            const isRectangle = Math.random() > 0.5; // Mix of rectangles and squares
            const width = isRectangle ? size * (1.5 + Math.random()) : size;
            const height = isRectangle ? size * (0.5 + Math.random() * 0.5) : size;

            this.confetti.push({
                x: spawnX,
                y: spawnY,
                vx: vx,
                vy: vy,
                color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                width: width,
                height: height,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                life: 3000 + Math.random() * 2000, // 3-5 seconds
                maxLife: 3000 + Math.random() * 2000
            });
        }
    }

    addBlastBubble(linesCleared) {
        // Create a floating bubble with "X Row/Rows" text
        const canvasCenterX = this.canvas.width / 2;
        const startY = this.canvas.height * 0.7; // Start at 70% from top (near bottom)

        // Color based on number of lines cleared
        const colors = {
            1: '#38ef7d', // Green for 1 line
            2: '#ffe66d', // Yellow for 2 lines
            3: '#ff8c42', // Orange for 3 lines
            4: '#ff416c'  // Red for 4 lines (Tetris!)
        };

        // Use singular "Row" for 1, plural "Rows" for 2+
        const rowText = linesCleared === 1 ? 'Row' : 'Rows';

        this.blastBubbles.push({
            x: canvasCenterX,
            y: startY,
            text: `${linesCleared} ${rowText}`,
            color: colors[linesCleared] || '#ff6e9f',
            life: 2000, // 2 seconds
            maxLife: 2000,
            scale: 0.8, // Start at 80% scale for better visibility
            rotation: (Math.random() - 0.5) * 0.1 // Slight rotation
        });
    }

    drawConfetti() {
        for (const confettiPiece of this.confetti) {
            const alpha = Math.min(1, confettiPiece.life / confettiPiece.maxLife);
            const alphaFade = confettiPiece.life / confettiPiece.maxLife;

            this.ctx.save();
            this.ctx.globalAlpha = alpha * alphaFade;
            this.ctx.fillStyle = confettiPiece.color;

            // Apply rotation
            this.ctx.translate(confettiPiece.x, confettiPiece.y);
            this.ctx.rotate(confettiPiece.rotation);

            // Draw confetti shape (rectangle or square)
            this.ctx.fillRect(-confettiPiece.width / 2, -confettiPiece.height / 2, confettiPiece.width, confettiPiece.height);

            // Add a subtle border for definition
            this.ctx.strokeStyle = this.lightenColor(confettiPiece.color, 0.3);
            this.ctx.lineWidth = 0.5;
            this.ctx.strokeRect(-confettiPiece.width / 2, -confettiPiece.height / 2, confettiPiece.width, confettiPiece.height);

            this.ctx.restore();
        }
    }

    updateAnimations(deltaTime) {
        // Update animation states
        this.animations = this.animations.filter(animation => {
            animation.elapsed += deltaTime;

            if (animation.elapsed >= animation.duration) {
                // Animation completed
                if (animation.type === 'lineFlash') {
                    // Ensure particles are created when flash ends
                    return false;
                }
                if (animation.type === 'holdFlash') {
                    // Redraw hold piece to clear the flash
                    this.drawHoldPiece();
                    return false;
                }
                return false;
            }
            return true;
        });

        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            particle.life -= deltaTime;

            return particle.life > 0;
        });

        // Update confetti
        this.confetti = this.confetti.filter(confettiPiece => {
            confettiPiece.x += confettiPiece.vx;
            confettiPiece.y += confettiPiece.vy;
            confettiPiece.vy += 0.15; // gravity
            confettiPiece.rotation += confettiPiece.rotationSpeed;
            confettiPiece.life -= deltaTime;

            return confettiPiece.life > 0 && confettiPiece.y < this.canvas.height + 50;
        });

        // Update blast bubbles
        this.blastBubbles = this.blastBubbles.filter(bubble => {
            // Move bubble upward (time-based movement)
            bubble.y -= 60 * (deltaTime / 1000); // 60 pixels per second
            
            // Update life
            bubble.life -= deltaTime;
            
            // Animate scale (pop in, then fade out)
            const progress = 1 - (bubble.life / bubble.maxLife);
            if (progress < 0.2) {
                // Pop in quickly
                bubble.scale = 0.8 + (progress / 0.2) * 0.2; // 0.8 to 1.0
            } else {
                // Fade out slowly
                bubble.scale = 1.0 - ((progress - 0.2) / 0.8) * 0.2; // 1.0 to 0.8
            }
            
            // Add slight wobble
            bubble.rotation += (Math.random() - 0.5) * 0.02;

            return bubble.life > 0 && bubble.y > -50;
        });
    }

    // Easing functions
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    easeOutQuad(t) {
        return 1 - (1 - t) * (1 - t);
    }

    easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    draw() {
        // Handle screen shake
        let shakeX = 0;
        let shakeY = 0;

        const shakeAnimation = this.animations.find(a => a.type === 'screenShake');
        if (shakeAnimation) {
            const progress = shakeAnimation.elapsed / shakeAnimation.duration;
            const intensity = shakeAnimation.intensity * (1 - this.easeInOutQuad(progress));
            shakeX = (Math.random() - 0.5) * intensity * 2;
            shakeY = (Math.random() - 0.5) * intensity * 2;
        }

        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context for shake effect
        this.ctx.save();
        this.ctx.translate(shakeX, shakeY);

        // Draw grid
        this.drawGrid();

        // Draw board
        this.drawBoard();

        // Draw line flash effect
        const flashAnimation = this.animations.find(a => a.type === 'lineFlash');
        if (flashAnimation) {
            this.drawLineFlash(flashAnimation);
        }

        // Draw hold flash effect
        const holdFlashAnimation = this.animations.find(a => a.type === 'holdFlash');
        if (holdFlashAnimation) {
            this.drawHoldFlash(holdFlashAnimation);
        }

        // Draw current piece with animations
        if (this.currentPiece) {
            this.drawCurrentPieceWithAnimations();
        }

        // Draw particles
        this.drawParticles();

        // Draw confetti
        this.drawConfetti();

        // Restore context (end shake effect)
        this.ctx.restore();

        // Draw blast bubbles (outside shake context so they don't shake)
        this.drawBlastBubbles();

        // Draw game over overlay
        const gameOverAnimation = this.animations.find(a => a.type === 'gameOver');
        if (gameOverAnimation) {
            this.drawGameOverOverlay(gameOverAnimation);
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;

        const blockSize = 30;

        for (let x = 0; x <= 10; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * blockSize, 0);
            this.ctx.lineTo(x * blockSize, 600);
            this.ctx.stroke();
        }

        for (let y = 0; y <= 20; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * blockSize);
            this.ctx.lineTo(300, y * blockSize);
            this.ctx.stroke();
        }
    }

    drawBoard() {
        const blockSize = 30;

        for (let row = 0; row < this.board.length; row++) {
            for (let col = 0; col < this.board[row].length; col++) {
                if (this.board[row][col]) {
                    this.ctx.fillStyle = this.board[row][col].color;
                    this.ctx.fillRect(col * blockSize, row * blockSize, blockSize - 1, blockSize - 1);

                    // Add 3D effect
                    this.ctx.fillStyle = this.lightenColor(this.board[row][col].color, 0.3);
                    this.ctx.fillRect(col * blockSize, row * blockSize, blockSize - 1, 2);

                    this.ctx.fillStyle = this.darkenColor(this.board[row][col].color, 0.3);
                    this.ctx.fillRect(col * blockSize, row * blockSize + blockSize - 3, blockSize - 1, 2);
                }
            }
        }
    }

    drawPiece(piece, ctx, offsetX, offsetY) {
        const blockSize = 30;

        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col]) {
                    const x = (piece.x + col) * blockSize + offsetX;
                    const y = (piece.y + row) * blockSize + offsetY;

                    ctx.fillStyle = piece.color;
                    ctx.fillRect(x, y, blockSize - 1, blockSize - 1);

                    // Add 3D effect
                    ctx.fillStyle = this.lightenColor(piece.color, 0.3);
                    ctx.fillRect(x, y, blockSize - 1, 2);

                    ctx.fillStyle = this.darkenColor(piece.color, 0.3);
                    ctx.fillRect(x, y + blockSize - 3, blockSize - 1, 2);
                }
            }
        }
    }

    drawHoldPiece() {
        // Clear hold piece canvas
        this.holdCtx.fillStyle = '#1a1a1a';
        this.holdCtx.fillRect(0, 0, 120, 120);

        if (this.holdPiece) {
            // Center the piece in the canvas
            const blockSize = 20;
            const pieceWidth = this.getPieceWidth(this.holdPiece.shape);
            const pieceHeight = this.getPieceHeight(this.holdPiece.shape);
            const offsetX = (120 - pieceWidth * blockSize) / 2;
            const offsetY = (120 - pieceHeight * blockSize) / 2;

            for (let row = 0; row < this.holdPiece.shape.length; row++) {
                for (let col = 0; col < this.holdPiece.shape[row].length; col++) {
                    if (this.holdPiece.shape[row][col]) {
                        this.holdCtx.fillStyle = this.holdPiece.color;
                        this.holdCtx.fillRect(
                            offsetX + col * blockSize,
                            offsetY + row * blockSize,
                            blockSize - 1,
                            blockSize - 1
                        );

                        // Add 3D effect
                        this.holdCtx.fillStyle = this.lightenColor(this.holdPiece.color, 0.3);
                        this.holdCtx.fillRect(offsetX + col * blockSize, offsetY + row * blockSize, blockSize - 1, 2);

                        this.holdCtx.fillStyle = this.darkenColor(this.holdPiece.color, 0.3);
                        this.holdCtx.fillRect(offsetX + col * blockSize, offsetY + row * blockSize + blockSize - 3, blockSize - 1, 2);
                    }
                }
            }
        }
    }

    drawNextPiece() {
        // Clear next piece canvas
        this.nextCtx.fillStyle = '#1a1a1a';
        this.nextCtx.fillRect(0, 0, 120, 120);

        if (this.nextPiece) {
            // Center the piece in the canvas
            const blockSize = 20;
            const pieceWidth = this.getPieceWidth(this.nextPiece.shape);
            const pieceHeight = this.getPieceHeight(this.nextPiece.shape);
            const offsetX = (120 - pieceWidth * blockSize) / 2;
            const offsetY = (120 - pieceHeight * blockSize) / 2;

            for (let row = 0; row < this.nextPiece.shape.length; row++) {
                for (let col = 0; col < this.nextPiece.shape[row].length; col++) {
                    if (this.nextPiece.shape[row][col]) {
                        this.nextCtx.fillStyle = this.nextPiece.color;
                        this.nextCtx.fillRect(
                            offsetX + col * blockSize,
                            offsetY + row * blockSize,
                            blockSize - 1,
                            blockSize - 1
                        );

                        // Add 3D effect
                        this.nextCtx.fillStyle = this.lightenColor(this.nextPiece.color, 0.3);
                        this.nextCtx.fillRect(offsetX + col * blockSize, offsetY + row * blockSize, blockSize - 1, 2);

                        this.nextCtx.fillStyle = this.darkenColor(this.nextPiece.color, 0.3);
                        this.nextCtx.fillRect(offsetX + col * blockSize, offsetY + row * blockSize + blockSize - 3, blockSize - 1, 2);
                    }
                }
            }
        }
    }

    getPieceWidth(shape) {
        let maxWidth = 0;
        for (let row of shape) {
            const width = row.lastIndexOf(1) - row.indexOf(1) + 1;
            maxWidth = Math.max(maxWidth, width);
        }
        return maxWidth;
    }

    getPieceHeight(shape) {
        let height = 0;
        for (let row of shape) {
            if (row.some(cell => cell === 1)) height++;
        }
        return height;
    }

    lightenColor(color, percent) {
        // Simple color lightening function
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent * 100);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent * 100);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }

    drawCurrentPieceWithAnimations() {
        const blockSize = 30;
        let offsetX = 0;
        let offsetY = 0;
        let rotationAngle = 0;

        // Apply movement animation
        const movementAnimation = this.animations.find(a => a.type === 'movement');
        if (movementAnimation) {
            const progress = movementAnimation.elapsed / movementAnimation.duration;
            const easedProgress = this[movementAnimation.easing](progress);

            // Calculate offset to smoothly move from start position to end position
            // At progress 0: offset = 0 (piece at start position)
            // At progress 1: offset = (end - start) (piece at end position)
            offsetX = (movementAnimation.startX - movementAnimation.endX) * blockSize * (1 - easedProgress);
            offsetY = (movementAnimation.startY - movementAnimation.endY) * blockSize * (1 - easedProgress);
        }

        // Apply rotation animation
        const rotationAnimation = this.animations.find(a => a.type === 'rotation');
        if (rotationAnimation) {
            const progress = rotationAnimation.elapsed / rotationAnimation.duration;
            const easedProgress = this[rotationAnimation.easing](progress);

            rotationAngle = rotationAnimation.startAngle +
                (rotationAnimation.endAngle - rotationAnimation.startAngle) * easedProgress;
        }

        // Save context for transformations
        this.ctx.save();

        if (rotationAnimation) {
            // Translate to center of rotation, rotate, then translate back
            const centerX = (rotationAnimation.centerX) * blockSize;
            const centerY = (rotationAnimation.centerY) * blockSize;

            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(rotationAngle);
            this.ctx.translate(-centerX, -centerY);
        }

        // Draw the piece with offsets
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const x = (this.currentPiece.x + col) * blockSize + offsetX;
                    const y = (this.currentPiece.y + row) * blockSize + offsetY;

                    this.ctx.fillStyle = this.currentPiece.color;
                    this.ctx.fillRect(x, y, blockSize - 1, blockSize - 1);

                    // Add 3D effect
                    this.ctx.fillStyle = this.lightenColor(this.currentPiece.color, 0.3);
                    this.ctx.fillRect(x, y, blockSize - 1, 2);

                    this.ctx.fillStyle = this.darkenColor(this.currentPiece.color, 0.3);
                    this.ctx.fillRect(x, y + blockSize - 3, blockSize - 1, 2);
                }
            }
        }

        this.ctx.restore();
    }

    drawLineFlash(animation) {
        const progress = animation.elapsed / animation.duration;
        const alpha = Math.sin(progress * Math.PI) * 0.8;

        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        this.ctx.fillRect(0, animation.row * 30, 300, 30);
    }

    drawHoldFlash(animation) {
        const progress = animation.elapsed / animation.duration;
        const alpha = Math.sin(progress * Math.PI) * 0.6;

        // Flash the hold canvas
        this.holdCtx.save();
        this.holdCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        this.holdCtx.fillRect(0, 0, 120, 120);
        this.holdCtx.restore();

        // Redraw the hold piece on top of the flash
        if (this.holdPiece) {
            const blockSize = 20;
            const pieceWidth = this.getPieceWidth(this.holdPiece.shape);
            const pieceHeight = this.getPieceHeight(this.holdPiece.shape);
            const offsetX = (120 - pieceWidth * blockSize) / 2;
            const offsetY = (120 - pieceHeight * blockSize) / 2;

            for (let row = 0; row < this.holdPiece.shape.length; row++) {
                for (let col = 0; col < this.holdPiece.shape[row].length; col++) {
                    if (this.holdPiece.shape[row][col]) {
                        this.holdCtx.fillStyle = this.holdPiece.color;
                        this.holdCtx.fillRect(
                            offsetX + col * blockSize,
                            offsetY + row * blockSize,
                            blockSize - 1,
                            blockSize - 1
                        );

                        // Add 3D effect
                        this.holdCtx.fillStyle = this.lightenColor(this.holdPiece.color, 0.3);
                        this.holdCtx.fillRect(offsetX + col * blockSize, offsetY + row * blockSize, blockSize - 1, 2);

                        this.holdCtx.fillStyle = this.darkenColor(this.holdPiece.color, 0.3);
                        this.holdCtx.fillRect(offsetX + col * blockSize, offsetY + row * blockSize + blockSize - 3, blockSize - 1, 2);
                    }
                }
            }
        }
    }

    drawParticles() {
        for (const particle of this.particles) {
            const alpha = particle.life / particle.maxLife;

            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    drawBlastBubbles() {
        for (const bubble of this.blastBubbles) {
            const alpha = Math.min(1, bubble.life / bubble.maxLife);
            const progress = 1 - (bubble.life / bubble.maxLife);
            
            // Fade out at the end
            const finalAlpha = Math.max(0, alpha * (1 - Math.max(0, (progress - 0.7) / 0.3)));

            // Skip if completely transparent
            if (finalAlpha <= 0) continue;

            this.ctx.save();
            this.ctx.globalAlpha = finalAlpha;
            
            // Translate to bubble position and apply rotation
            this.ctx.translate(bubble.x, bubble.y);
            this.ctx.rotate(bubble.rotation);
            
            // Draw bubble background (rounded rectangle)
            const padding = 15;
            const fontSize = Math.floor(28 * bubble.scale);
            this.ctx.font = `bold ${fontSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Measure text
            const metrics = this.ctx.measureText(bubble.text);
            const textWidth = metrics.width;
            const textHeight = fontSize;
            const bubbleWidth = textWidth + padding * 2;
            const bubbleHeight = textHeight + padding * 2;
            
            // Helper function to draw rounded rectangle
            const drawRoundedRect = (x, y, width, height, radius) => {
                this.ctx.beginPath();
                this.ctx.moveTo(x + radius, y);
                this.ctx.lineTo(x + width - radius, y);
                this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                this.ctx.lineTo(x + width, y + height - radius);
                this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                this.ctx.lineTo(x + radius, y + height);
                this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                this.ctx.lineTo(x, y + radius);
                this.ctx.quadraticCurveTo(x, y, x + radius, y);
                this.ctx.closePath();
            };
            
            // Draw bubble shadow
            this.ctx.save();
            this.ctx.globalAlpha = finalAlpha * 0.3;
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            drawRoundedRect(-bubbleWidth / 2 + 3, -bubbleHeight / 2 + 3, bubbleWidth, bubbleHeight, 20);
            this.ctx.fill();
            this.ctx.restore();
            
            // Draw bubble with gradient
            const gradient = this.ctx.createLinearGradient(
                -bubbleWidth / 2, -bubbleHeight / 2,
                bubbleWidth / 2, bubbleHeight / 2
            );
            const baseColor = bubble.color;
            gradient.addColorStop(0, this.lightenColor(baseColor, 0.2));
            gradient.addColorStop(1, baseColor);
            
            this.ctx.fillStyle = gradient;
            drawRoundedRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 20);
            this.ctx.fill();
            
            // Draw bubble border
            this.ctx.strokeStyle = this.lightenColor(baseColor, 0.4);
            this.ctx.lineWidth = 2;
            drawRoundedRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 20);
            this.ctx.stroke();
            
            // Draw text
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = `bold ${fontSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Add text shadow
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            this.ctx.shadowBlur = 4;
            this.ctx.shadowOffsetX = 1;
            this.ctx.shadowOffsetY = 1;
            
            this.ctx.fillText(bubble.text, 0, 0);
            
            // Reset shadow
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            this.ctx.restore();
        }
    }

    drawGameOverOverlay(animation) {
        const progress = animation.elapsed / animation.duration;
        const alpha = Math.min(progress * 2, 0.8);

        // Semi-transparent overlay
        this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Game Over text
        if (progress > 0.5) {
            const textProgress = (progress - 0.5) / 0.5;
            const textAlpha = textProgress;

            this.ctx.save();
            this.ctx.globalAlpha = textAlpha;
            this.ctx.fillStyle = '#ff6e9f';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Add glow effect
            this.ctx.shadowColor = '#ff6e9f';
            this.ctx.shadowBlur = 20;

            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);

            this.ctx.font = '24px Arial';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.shadowColor = '#ffffff';
            this.ctx.shadowBlur = 10;
            this.ctx.fillText(`Final Score: ${this.score.toLocaleString()}`, this.canvas.width / 2, this.canvas.height / 2 + 30);

            this.ctx.restore();
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new TetrisGame();
});
