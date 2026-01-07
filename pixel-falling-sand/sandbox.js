/**
 * PIXEL FALLING SAND SIMULATION
 * A performant cellular automata sandbox with multiple element types
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    // Canvas dimensions (in simulation pixels)
    WIDTH: 300,
    HEIGHT: 200,
    
    // Display scale
    SCALE: 3,
    
    // Simulation speed
    TARGET_FPS: 60,
    
    // Element types
    ELEMENTS: {
        EMPTY: 0,
        SAND: 1,
        WATER: 2,
        STONE: 3,
        ACID: 4,
        FIRE: 5,
        WOOD: 6,
        OIL: 7
    }
};

// ============================================
// ELEMENT COLORS (with slight variations for visual interest)
// ============================================

const ELEMENT_COLORS = {
    [CONFIG.ELEMENTS.EMPTY]: null,
    [CONFIG.ELEMENTS.SAND]: [
        [230, 200, 110],
        [225, 190, 100],
        [235, 210, 120],
        [220, 185, 95],
        [240, 205, 115]
    ],
    [CONFIG.ELEMENTS.WATER]: [
        [74, 158, 255],
        [64, 148, 245],
        [84, 168, 255],
        [54, 138, 235],
        [94, 178, 255]
    ],
    [CONFIG.ELEMENTS.STONE]: [
        [122, 122, 138],
        [112, 112, 128],
        [132, 132, 148],
        [100, 100, 116],
        [140, 140, 156]
    ],
    [CONFIG.ELEMENTS.ACID]: [
        [180, 255, 57],
        [170, 245, 47],
        [190, 255, 67],
        [160, 235, 37],
        [200, 255, 77]
    ],
    [CONFIG.ELEMENTS.FIRE]: [
        [255, 107, 53],
        [255, 160, 50],
        [255, 80, 30],
        [255, 200, 80],
        [255, 50, 20]
    ],
    [CONFIG.ELEMENTS.WOOD]: [
        [139, 90, 43],
        [129, 80, 33],
        [149, 100, 53],
        [119, 70, 23],
        [159, 110, 63]
    ],
    [CONFIG.ELEMENTS.OIL]: [
        [58, 42, 26],
        [48, 32, 16],
        [68, 52, 36],
        [38, 22, 6],
        [78, 62, 46]
    ]
};

// ============================================
// SIMULATION CLASS
// ============================================

class FallingSandSimulation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas dimensions
        this.width = CONFIG.WIDTH;
        this.height = CONFIG.HEIGHT;
        this.canvas.width = this.width * CONFIG.SCALE;
        this.canvas.height = this.height * CONFIG.SCALE;
        
        // Disable image smoothing for crisp pixels
        this.ctx.imageSmoothingEnabled = false;
        
        // Create off-screen canvas for pixel manipulation
        this.offCanvas = document.createElement('canvas');
        this.offCanvas.width = this.width;
        this.offCanvas.height = this.height;
        this.offCtx = this.offCanvas.getContext('2d');
        
        // Create ImageData for direct pixel manipulation
        this.imageData = this.offCtx.createImageData(this.width, this.height);
        
        // Grid stores element types
        this.grid = new Uint8Array(this.width * this.height);
        
        // Color grid stores the specific color index for each particle
        this.colorGrid = new Uint8Array(this.width * this.height);
        
        // Track which cells were updated this frame (for optimization)
        this.updated = new Uint8Array(this.width * this.height);
        
        // Alternating scan direction for more natural behavior
        this.scanDirection = 1;
        
        // Current element to paint
        this.currentElement = CONFIG.ELEMENTS.SAND;
        
        // Brush size
        this.brushSize = 5;
        
        // Mouse state
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Simulation state
        this.isPaused = false;
        this.particleCount = 0;
        
        // FPS tracking
        this.fps = 60;
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
        
        // Initialize
        this.setupEventListeners();
        this.startSimulation();
    }
    
    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.isMouseDown = false);
        this.canvas.addEventListener('mouseleave', () => this.isMouseDown = false);
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.isMouseDown = false);
        
        // Element buttons
        document.querySelectorAll('.element-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.element-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const element = btn.dataset.element;
                if (element === 'erase') {
                    this.currentElement = CONFIG.ELEMENTS.EMPTY;
                } else {
                    this.currentElement = CONFIG.ELEMENTS[element.toUpperCase()];
                }
            });
        });
        
        // Brush size slider
        const brushSlider = document.getElementById('brush-size');
        const brushValue = document.getElementById('brush-value');
        brushSlider.addEventListener('input', () => {
            this.brushSize = parseInt(brushSlider.value);
            brushValue.textContent = this.brushSize;
        });
        
        // Clear button
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clear();
        });
        
        // Pause button
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            document.getElementById('pause-btn').textContent = this.isPaused ? 'RESUME' : 'PAUSE';
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            const keyMap = {
                '1': 'sand', '2': 'water', '3': 'stone', '4': 'acid',
                '5': 'fire', '6': 'wood', '7': 'oil', '8': 'erase'
            };
            
            if (keyMap[e.key]) {
                document.querySelectorAll('.element-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.element === keyMap[e.key]) {
                        btn.classList.add('active');
                    }
                });
                
                if (keyMap[e.key] === 'erase') {
                    this.currentElement = CONFIG.ELEMENTS.EMPTY;
                } else {
                    this.currentElement = CONFIG.ELEMENTS[keyMap[e.key].toUpperCase()];
                }
            }
            
            // Space to pause
            if (e.key === ' ') {
                e.preventDefault();
                this.isPaused = !this.isPaused;
                document.getElementById('pause-btn').textContent = this.isPaused ? 'RESUME' : 'PAUSE';
            }
        });
    }
    
    handleMouseDown(e) {
        this.isMouseDown = true;
        this.updateMousePosition(e);
        this.paint();
    }
    
    handleMouseMove(e) {
        this.updateMousePosition(e);
        if (this.isMouseDown) {
            this.paint();
        }
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        this.isMouseDown = true;
        this.updateTouchPosition(e);
        this.paint();
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        this.updateTouchPosition(e);
        if (this.isMouseDown) {
            this.paint();
        }
    }
    
    updateMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = Math.floor((e.clientX - rect.left) / CONFIG.SCALE);
        this.mouseY = Math.floor((e.clientY - rect.top) / CONFIG.SCALE);
    }
    
    updateTouchPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        this.mouseX = Math.floor((touch.clientX - rect.left) / CONFIG.SCALE);
        this.mouseY = Math.floor((touch.clientY - rect.top) / CONFIG.SCALE);
    }
    
    // ============================================
    // PAINTING
    // ============================================
    
    paint() {
        const radius = Math.floor(this.brushSize / 2);
        
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                // Circular brush
                if (dx * dx + dy * dy <= radius * radius) {
                    const x = this.mouseX + dx;
                    const y = this.mouseY + dy;
                    
                    if (this.isInBounds(x, y)) {
                        // Add some randomness for more natural painting
                        if (this.currentElement === CONFIG.ELEMENTS.EMPTY || Math.random() > 0.3) {
                            this.setCell(x, y, this.currentElement);
                        }
                    }
                }
            }
        }
    }
    
    // ============================================
    // GRID OPERATIONS
    // ============================================
    
    getIndex(x, y) {
        return y * this.width + x;
    }
    
    isInBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    getCell(x, y) {
        if (!this.isInBounds(x, y)) return CONFIG.ELEMENTS.STONE; // Treat out of bounds as solid
        return this.grid[this.getIndex(x, y)];
    }
    
    setCell(x, y, element) {
        if (!this.isInBounds(x, y)) return;
        const idx = this.getIndex(x, y);
        this.grid[idx] = element;
        // Assign random color variant
        this.colorGrid[idx] = Math.floor(Math.random() * 5);
    }
    
    swapCells(x1, y1, x2, y2) {
        const idx1 = this.getIndex(x1, y1);
        const idx2 = this.getIndex(x2, y2);
        
        const tempElement = this.grid[idx1];
        const tempColor = this.colorGrid[idx1];
        
        this.grid[idx1] = this.grid[idx2];
        this.colorGrid[idx1] = this.colorGrid[idx2];
        
        this.grid[idx2] = tempElement;
        this.colorGrid[idx2] = tempColor;
        
        this.updated[idx1] = 1;
        this.updated[idx2] = 1;
    }
    
    clear() {
        this.grid.fill(0);
        this.colorGrid.fill(0);
    }
    
    // ============================================
    // ELEMENT BEHAVIORS
    // ============================================
    
    isEmpty(x, y) {
        return this.getCell(x, y) === CONFIG.ELEMENTS.EMPTY;
    }
    
    isLiquid(x, y) {
        const cell = this.getCell(x, y);
        return cell === CONFIG.ELEMENTS.WATER || 
               cell === CONFIG.ELEMENTS.ACID || 
               cell === CONFIG.ELEMENTS.OIL;
    }
    
    canDisplace(x, y, element) {
        const target = this.getCell(x, y);
        if (target === CONFIG.ELEMENTS.EMPTY) return true;
        
        // Sand can displace liquids
        if (element === CONFIG.ELEMENTS.SAND && this.isLiquid(x, y)) return true;
        
        return false;
    }
    
    updateSand(x, y) {
        // Try to fall down
        if (this.canDisplace(x, y + 1, CONFIG.ELEMENTS.SAND)) {
            this.swapCells(x, y, x, y + 1);
            return;
        }
        
        // Try to fall diagonally
        const dir = Math.random() < 0.5 ? -1 : 1;
        
        if (this.canDisplace(x + dir, y + 1, CONFIG.ELEMENTS.SAND)) {
            this.swapCells(x, y, x + dir, y + 1);
            return;
        }
        
        if (this.canDisplace(x - dir, y + 1, CONFIG.ELEMENTS.SAND)) {
            this.swapCells(x, y, x - dir, y + 1);
            return;
        }
    }
    
    updateWater(x, y) {
        // Try to fall down
        if (this.isEmpty(x, y + 1)) {
            this.swapCells(x, y, x, y + 1);
            return;
        }
        
        // Try to fall diagonally
        const dir = Math.random() < 0.5 ? -1 : 1;
        
        if (this.isEmpty(x + dir, y + 1)) {
            this.swapCells(x, y, x + dir, y + 1);
            return;
        }
        
        if (this.isEmpty(x - dir, y + 1)) {
            this.swapCells(x, y, x - dir, y + 1);
            return;
        }
        
        // Flow horizontally
        const flowDir = this.scanDirection * (Math.random() < 0.5 ? -1 : 1);
        
        if (this.isEmpty(x + flowDir, y)) {
            this.swapCells(x, y, x + flowDir, y);
            return;
        }
        
        if (this.isEmpty(x - flowDir, y)) {
            this.swapCells(x, y, x - flowDir, y);
            return;
        }
    }
    
    updateAcid(x, y) {
        // Check for things to dissolve (neighbors)
        const neighbors = [
            [x, y + 1], [x, y - 1], [x - 1, y], [x + 1, y]
        ];
        
        for (const [nx, ny] of neighbors) {
            const neighbor = this.getCell(nx, ny);
            if (neighbor === CONFIG.ELEMENTS.STONE || neighbor === CONFIG.ELEMENTS.WOOD) {
                // Dissolve the neighbor and sometimes the acid too
                if (Math.random() < 0.3) {
                    this.setCell(x, y, CONFIG.ELEMENTS.EMPTY);
                }
                this.setCell(nx, ny, CONFIG.ELEMENTS.EMPTY);
                return;
            }
        }
        
        // Otherwise flow like water
        if (this.isEmpty(x, y + 1)) {
            this.swapCells(x, y, x, y + 1);
            return;
        }
        
        const dir = Math.random() < 0.5 ? -1 : 1;
        
        if (this.isEmpty(x + dir, y + 1)) {
            this.swapCells(x, y, x + dir, y + 1);
            return;
        }
        
        if (this.isEmpty(x - dir, y + 1)) {
            this.swapCells(x, y, x - dir, y + 1);
            return;
        }
        
        // Horizontal flow
        if (this.isEmpty(x + dir, y)) {
            this.swapCells(x, y, x + dir, y);
            return;
        }
        
        if (this.isEmpty(x - dir, y)) {
            this.swapCells(x, y, x - dir, y);
            return;
        }
    }
    
    updateFire(x, y) {
        // Fire rises and has a chance to die
        if (Math.random() < 0.05) {
            this.setCell(x, y, CONFIG.ELEMENTS.EMPTY);
            return;
        }
        
        // Check for water (extinguish)
        const neighbors = [
            [x, y + 1], [x, y - 1], [x - 1, y], [x + 1, y],
            [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1]
        ];
        
        for (const [nx, ny] of neighbors) {
            if (this.getCell(nx, ny) === CONFIG.ELEMENTS.WATER) {
                this.setCell(x, y, CONFIG.ELEMENTS.EMPTY);
                // Sometimes water evaporates
                if (Math.random() < 0.5) {
                    this.setCell(nx, ny, CONFIG.ELEMENTS.EMPTY);
                }
                return;
            }
        }
        
        // Burn adjacent wood or oil
        for (const [nx, ny] of neighbors) {
            const neighbor = this.getCell(nx, ny);
            if (neighbor === CONFIG.ELEMENTS.WOOD || neighbor === CONFIG.ELEMENTS.OIL) {
                if (Math.random() < 0.1) {
                    this.setCell(nx, ny, CONFIG.ELEMENTS.FIRE);
                }
            }
        }
        
        // Fire rises
        if (this.isEmpty(x, y - 1) && Math.random() < 0.6) {
            this.swapCells(x, y, x, y - 1);
            return;
        }
        
        // Spread sideways and up
        const dir = Math.random() < 0.5 ? -1 : 1;
        if (this.isEmpty(x + dir, y - 1)) {
            this.swapCells(x, y, x + dir, y - 1);
            return;
        }
    }
    
    updateOil(x, y) {
        // Oil is less dense than water - rises through it
        if (this.getCell(x, y - 1) === CONFIG.ELEMENTS.WATER) {
            this.swapCells(x, y, x, y - 1);
            return;
        }
        
        // Otherwise behave like water (but sits on top)
        if (this.isEmpty(x, y + 1)) {
            this.swapCells(x, y, x, y + 1);
            return;
        }
        
        const dir = Math.random() < 0.5 ? -1 : 1;
        
        if (this.isEmpty(x + dir, y + 1)) {
            this.swapCells(x, y, x + dir, y + 1);
            return;
        }
        
        if (this.isEmpty(x - dir, y + 1)) {
            this.swapCells(x, y, x - dir, y + 1);
            return;
        }
        
        // Horizontal flow
        if (this.isEmpty(x + dir, y)) {
            this.swapCells(x, y, x + dir, y);
            return;
        }
        
        if (this.isEmpty(x - dir, y)) {
            this.swapCells(x, y, x - dir, y);
            return;
        }
    }
    
    // ============================================
    // SIMULATION LOOP
    // ============================================
    
    update() {
        if (this.isPaused) return;
        
        // Clear update tracking
        this.updated.fill(0);
        
        // Alternate scan direction for more natural behavior
        this.scanDirection *= -1;
        
        // Update from bottom to top (so gravity works correctly)
        for (let y = this.height - 1; y >= 0; y--) {
            // Alternate horizontal scan direction
            const startX = this.scanDirection === 1 ? 0 : this.width - 1;
            const endX = this.scanDirection === 1 ? this.width : -1;
            
            for (let x = startX; x !== endX; x += this.scanDirection) {
                const idx = this.getIndex(x, y);
                
                // Skip if already updated this frame
                if (this.updated[idx]) continue;
                
                const element = this.grid[idx];
                
                switch (element) {
                    case CONFIG.ELEMENTS.SAND:
                        this.updateSand(x, y);
                        break;
                    case CONFIG.ELEMENTS.WATER:
                        this.updateWater(x, y);
                        break;
                    case CONFIG.ELEMENTS.ACID:
                        this.updateAcid(x, y);
                        break;
                    case CONFIG.ELEMENTS.FIRE:
                        this.updateFire(x, y);
                        break;
                    case CONFIG.ELEMENTS.OIL:
                        this.updateOil(x, y);
                        break;
                    // Stone and Wood don't move
                }
            }
        }
    }
    
    render() {
        const data = this.imageData.data;
        let particleCount = 0;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const idx = this.getIndex(x, y);
                const element = this.grid[idx];
                const pixelIdx = idx * 4;
                
                if (element === CONFIG.ELEMENTS.EMPTY) {
                    // Dark background with slight noise
                    const noise = Math.random() * 3;
                    data[pixelIdx] = 8 + noise;
                    data[pixelIdx + 1] = 8 + noise;
                    data[pixelIdx + 2] = 12 + noise;
                    data[pixelIdx + 3] = 255;
                } else {
                    particleCount++;
                    const colorVariant = this.colorGrid[idx];
                    const color = ELEMENT_COLORS[element][colorVariant];
                    
                    data[pixelIdx] = color[0];
                    data[pixelIdx + 1] = color[1];
                    data[pixelIdx + 2] = color[2];
                    data[pixelIdx + 3] = 255;
                }
            }
        }
        
        this.particleCount = particleCount;
        
        // Draw to off-screen canvas
        this.offCtx.putImageData(this.imageData, 0, 0);
        
        // Scale up to main canvas
        this.ctx.drawImage(
            this.offCanvas,
            0, 0, this.width, this.height,
            0, 0, this.canvas.width, this.canvas.height
        );
    }
    
    updateStats() {
        this.frameCount++;
        const now = performance.now();
        
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            
            document.getElementById('fps').textContent = this.fps;
        }
        
        document.getElementById('particle-count').textContent = this.particleCount.toLocaleString();
    }
    
    gameLoop() {
        this.update();
        this.render();
        this.updateStats();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    startSimulation() {
        this.gameLoop();
    }
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    new FallingSandSimulation('sandbox');
});

