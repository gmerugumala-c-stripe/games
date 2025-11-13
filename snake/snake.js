// Snake Game JavaScript
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;

        // Game state
        this.snake = [{x: 10, y: 10}];
        this.foods = [];
        this.maxFoods = 2; // Maximum number of foods on screen at once
        // Food colors (excluding green)
        this.foodColors = ['#ff4444', '#ff8800', '#ffaa00', '#ff00ff', '#aa00ff', '#0088ff', '#00ffff', '#ffff00', '#ff0088'];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;

        // DOM elements
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');

        this.init();
        this.setupEventListeners();
    }

    init() {
        // Ensure canvas maintains exact dimensions (including border)
        this.canvas.width = 400;
        this.canvas.height = 400;

        this.highScoreElement.textContent = this.highScore;
        this.generateFoods();
        this.draw();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        // Button controls
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.resetGame());
    }

    handleKeyPress(e) {
        if (this.gameOver) return;

        const key = e.key.toLowerCase();

        // Handle Enter key to start game
        if (key === 'enter' && (!this.gameRunning || this.gameOver)) {
            this.startGame();
            e.preventDefault();
            return;
        }

        // Prevent reverse direction
        if (key === 'arrowleft' || key === 'a') {
            if (this.dx === 0) {
                this.dx = -1;
                this.dy = 0;
            }
            e.preventDefault();
        } else if (key === 'arrowup' || key === 'w') {
            if (this.dy === 0) {
                this.dx = 0;
                this.dy = -1;
            }
            e.preventDefault();
        } else if (key === 'arrowright' || key === 'd') {
            if (this.dx === 0) {
                this.dx = 1;
                this.dy = 0;
            }
            e.preventDefault();
        } else if (key === 'arrowdown' || key === 's') {
            if (this.dy === 0) {
                this.dx = 0;
                this.dy = 1;
            }
            e.preventDefault();
        } else if (key === ' ') {
            this.togglePause();
            e.preventDefault();
        }
    }

    startGame() {
        // Only reset if game is over, otherwise just start/resume
        if (this.gameOver) {
            this.resetGame();
        }
        
        // If game hasn't started yet and no foods exist, generate them
        if (this.foods.length === 0) {
            this.generateFoods();
        }
        
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameOver = false;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        // Draw immediately so game appears to start right away
        this.draw();
        
        // Start game loop
        this.gameLoop();
    }

    togglePause() {
        if (this.gameRunning && !this.gameOver) {
            this.gamePaused = !this.gamePaused;
            this.pauseBtn.textContent = this.gamePaused ? 'Resume' : 'Pause';

            // Redraw immediately to maintain canvas appearance
            this.draw();
            if (!this.gamePaused) {
                this.gameLoop();
            }
        }
    }

    resetGame() {
        this.snake = [{x: 10, y: 10}];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'Pause';
        this.foods = [];
        this.generateFoods();
        this.draw();

        // Remove game over overlay if it exists
        const gameOverOverlay = document.querySelector('.game-over');
        if (gameOverOverlay) {
            gameOverOverlay.remove();
        }
    }

    generateFoods() {
        // Generate foods until we reach maxFoods
        while (this.foods.length < this.maxFoods) {
            this.addFood();
        }
    }

    addFood() {
        let food;
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loop
        
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            attempts++;
        } while (
            attempts < maxAttempts && (
                // Check if food overlaps with snake
                this.snake.some(segment => segment.x === food.x && segment.y === food.y) ||
                // Check if food overlaps with existing foods
                this.foods.some(f => f.x === food.x && f.y === food.y)
            )
        );
        
        // Only add food if we found a valid position
        if (attempts < maxAttempts) {
            // Assign a random color to the food
            food.color = this.foodColors[Math.floor(Math.random() * this.foodColors.length)];
            this.foods.push(food);
        }
    }

    moveSnake() {
        // Don't move if no direction is set
        if (this.dx === 0 && this.dy === 0) {
            return;
        }

        let head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};

        // Wrap around walls instead of ending game
        if (head.x < 0) {
            head.x = this.tileCount - 1;
        } else if (head.x >= this.tileCount) {
            head.x = 0;
        }
        
        if (head.y < 0) {
            head.y = this.tileCount - 1;
        } else if (head.y >= this.tileCount) {
            head.y = 0;
        }

        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver = true;
            return;
        }

        this.snake.unshift(head);

        // Check food collision with all foods
        const foodIndex = this.foods.findIndex(food => head.x === food.x && head.y === food.y);
        
        if (foodIndex !== -1) {
            // Remove the eaten food
            this.foods.splice(foodIndex, 1);
            
            // Add score
            this.score += 10;
            this.scoreElement.textContent = this.score;
            
            // Generate a new food to maintain maxFoods count
            this.addFood();

            // Update high score
            if (this.score > this.highScore) {
                this.highScore = this.score;
                this.highScoreElement.textContent = this.highScore;
                localStorage.setItem('snakeHighScore', this.highScore);
            }
        } else {
            this.snake.pop();
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake body as circles
        this.ctx.fillStyle = '#00ff88';
        for (let segment of this.snake) {
            const centerX = segment.x * this.gridSize + this.gridSize / 2;
            const centerY = segment.y * this.gridSize + this.gridSize / 2;
            const radius = (this.gridSize - 2) / 2;
            
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw snake head as circle with different color
        this.ctx.fillStyle = '#00cc66';
        const headCenterX = this.snake[0].x * this.gridSize + this.gridSize / 2;
        const headCenterY = this.snake[0].y * this.gridSize + this.gridSize / 2;
        const headRadius = (this.gridSize - 2) / 2;
        
        this.ctx.beginPath();
        this.ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw foods with different colors
        for (let food of this.foods) {
            this.ctx.fillStyle = food.color || '#ff4444'; // Fallback to red if no color
            this.ctx.fillRect(
                food.x * this.gridSize,
                food.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        }

        // Draw grid (optional, for better visibility)
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();

            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }

    showGameOver() {
        const gameOverOverlay = document.createElement('div');
        gameOverOverlay.className = 'game-over';
        gameOverOverlay.innerHTML = `
            <div class="game-over-content">
                <h2>Game Over!</h2>
                <p>Final Score: ${this.score}</p>
                <button onclick="location.reload()">Play Again</button>
                <button onclick="game.resetGame()">Try Again</button>
            </div>
        `;
        document.body.appendChild(gameOverOverlay);
    }

    gameLoop() {
        if (!this.gameRunning || this.gamePaused || this.gameOver) {
            if (this.gameOver) {
                this.showGameOver();
                this.startBtn.disabled = false;
                this.pauseBtn.disabled = true;
            }
            return;
        }

        this.moveSnake();
        this.draw();

        // Increase speed as score increases (minimum 80ms delay)
        const speed = Math.max(80, 200 - Math.floor(this.score / 50) * 15);
        setTimeout(() => this.gameLoop(), speed);
    }
}

// Initialize the game
const game = new SnakeGame();
