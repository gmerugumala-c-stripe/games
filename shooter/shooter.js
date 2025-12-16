// Target Blitz - Shooting Gallery Game
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game State
const game = {
    isRunning: false,
    isPaused: false,
    score: 0,
    time: 60,
    combo: 1,
    maxCombo: 1,
    shots: 0,
    hits: 0,
    targets: [],
    particles: [],
    currentWeapon: 'pistol',
    ammo: 30,
    maxAmmo: 30,
    isReloading: false,
    reloadTime: 0,
    lastShot: 0,
    canShoot: true
};

// Weapon configurations
const weapons = {
    pistol: {
        name: 'Pistol',
        damage: 1,
        fireRate: 250,
        maxAmmo: 30,
        reloadTime: 1000,
        spread: 0,
        shots: 1
    },
    shotgun: {
        name: 'Shotgun',
        damage: 3,
        fireRate: 800,
        maxAmmo: 8,
        reloadTime: 2000,
        spread: 30,
        shots: 5
    },
    rifle: {
        name: 'Rifle',
        damage: 2,
        fireRate: 400,
        maxAmmo: 20,
        reloadTime: 1500,
        spread: 0,
        shots: 1
    },
    smg: {
        name: 'SMG',
        damage: 1,
        fireRate: 100,
        maxAmmo: 50,
        reloadTime: 1800,
        spread: 8,
        shots: 1
    }
};

// Target types
const targetTypes = {
    standard: {
        color: '#4a90d9',
        glowColor: '#6ab0ff',
        points: 10,
        speed: 1,
        size: 40,
        health: 1
    },
    fast: {
        color: '#9b59b6',
        glowColor: '#bb8fce',
        points: 25,
        speed: 2.5,
        size: 30,
        health: 1
    },
    bonus: {
        color: '#f1c40f',
        glowColor: '#f9e79f',
        points: 50,
        speed: 1.5,
        size: 35,
        health: 1
    },
    danger: {
        color: '#e74c3c',
        glowColor: '#f1948a',
        points: -30,
        speed: 1.2,
        size: 45,
        health: 2
    }
};

// DOM Elements
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const ammoEl = document.getElementById('ammo');
const comboEl = document.getElementById('combo');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const reloadBtn = document.getElementById('reload-btn');
const overlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMessage = document.getElementById('overlay-message');
const finalStats = document.getElementById('final-stats');
const crosshair = document.getElementById('crosshair');
const muzzleFlash = document.getElementById('muzzle-flash');
const weaponBtns = document.querySelectorAll('.weapon-btn');

// Initialize canvas
function initCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 450;
}

// Target class
class Target {
    constructor(type) {
        const config = targetTypes[type];
        this.type = type;
        this.size = config.size;
        this.x = Math.random() * (canvas.width - this.size * 2) + this.size;
        this.y = Math.random() * (canvas.height - this.size * 2) + this.size;
        this.vx = (Math.random() - 0.5) * config.speed * 2;
        this.vy = (Math.random() - 0.5) * config.speed * 2;
        this.color = config.color;
        this.glowColor = config.glowColor;
        this.points = config.points;
        this.health = config.health;
        this.maxHealth = config.health;
        this.angle = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.isHit = false;
        this.hitTime = 0;
    }

    update(deltaTime) {
        // Movement
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x - this.size < 0 || this.x + this.size > canvas.width) {
            this.vx *= -1;
            this.x = Math.max(this.size, Math.min(canvas.width - this.size, this.x));
        }
        if (this.y - this.size < 0 || this.y + this.size > canvas.height) {
            this.vy *= -1;
            this.y = Math.max(this.size, Math.min(canvas.height - this.size, this.y));
        }

        // Rotation
        this.angle += 0.02;
        this.pulsePhase += 0.05;

        // Hit animation
        if (this.isHit && Date.now() - this.hitTime > 100) {
            this.isHit = false;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Glow effect
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.1;
        const glowSize = this.size * 1.5 * pulse;

        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = this.isHit ? 30 : 15;

        // Outer ring
        ctx.beginPath();
        ctx.arc(0, 0, this.size * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner circle
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.isHit ? '#fff' : this.glowColor);
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, this.color + '80');

        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.8 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Bullseye rings
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.25, 0, Math.PI * 2);
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // Health bar for multi-hit targets
        if (this.maxHealth > 1) {
            ctx.shadowBlur = 0;
            const healthWidth = this.size * 1.5;
            const healthHeight = 6;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(-healthWidth / 2, this.size + 10, healthWidth, healthHeight);
            ctx.fillStyle = this.health > this.maxHealth / 2 ? '#00ff88' : '#ff4d4d';
            ctx.fillRect(-healthWidth / 2, this.size + 10, healthWidth * (this.health / this.maxHealth), healthHeight);
        }

        // Bonus sparkle effect
        if (this.type === 'bonus') {
            ctx.rotate(this.angle);
            for (let i = 0; i < 4; i++) {
                ctx.rotate(Math.PI / 2);
                ctx.beginPath();
                ctx.moveTo(this.size * 1.1, 0);
                ctx.lineTo(this.size * 1.3, -5);
                ctx.lineTo(this.size * 1.5, 0);
                ctx.lineTo(this.size * 1.3, 5);
                ctx.closePath();
                ctx.fillStyle = this.glowColor;
                ctx.fill();
            }
        }

        ctx.restore();
    }

    checkHit(x, y, damage) {
        const dist = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        if (dist < this.size) {
            this.health -= damage;
            this.isHit = true;
            this.hitTime = Date.now();
            return true;
        }
        return false;
    }
}

// Particle class for explosions
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.color = color;
        this.life = 1;
        this.decay = 0.02 + Math.random() * 0.02;
        this.size = 3 + Math.random() * 5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // Gravity
        this.life -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Score popup class
class ScorePopup {
    constructor(x, y, score, isHit) {
        this.x = x;
        this.y = y;
        this.score = score;
        this.life = 1;
        this.isHit = isHit;
    }

    update() {
        this.y -= 2;
        this.life -= 0.02;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.font = 'bold 24px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.score > 0 ? '#00ff88' : '#ff4d4d';
        ctx.shadowColor = this.score > 0 ? '#00ff88' : '#ff4d4d';
        ctx.shadowBlur = 10;
        ctx.fillText((this.score > 0 ? '+' : '') + this.score, this.x, this.y);
        ctx.restore();
    }
}

const scorePopups = [];

// Spawn target
function spawnTarget() {
    const types = ['standard', 'standard', 'standard', 'fast', 'fast', 'bonus', 'danger'];
    const type = types[Math.floor(Math.random() * types.length)];
    game.targets.push(new Target(type));
}

// Create explosion particles
function createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
        game.particles.push(new Particle(x, y, color));
    }
}

// Shoot
function shoot(mouseX, mouseY) {
    if (!game.isRunning || game.isPaused || game.isReloading || game.ammo <= 0) return;

    const now = Date.now();
    const weapon = weapons[game.currentWeapon];

    if (now - game.lastShot < weapon.fireRate) return;

    game.lastShot = now;
    game.ammo--;
    game.shots++;
    updateUI();

    // Muzzle flash
    muzzleFlash.style.left = mouseX + 'px';
    muzzleFlash.style.top = mouseY + 'px';
    muzzleFlash.classList.add('active');
    setTimeout(() => muzzleFlash.classList.remove('active'), 100);

    // Get canvas position
    const rect = canvas.getBoundingClientRect();
    const canvasX = mouseX - rect.left;
    const canvasY = mouseY - rect.top;

    // Fire shots (for shotgun spread)
    let hitThisShot = false;
    for (let i = 0; i < weapon.shots; i++) {
        const spreadX = (Math.random() - 0.5) * weapon.spread * 2;
        const spreadY = (Math.random() - 0.5) * weapon.spread * 2;
        const shotX = canvasX + spreadX;
        const shotY = canvasY + spreadY;

        // Check hits
        for (let j = game.targets.length - 1; j >= 0; j--) {
            const target = game.targets[j];
            if (target.checkHit(shotX, shotY, weapon.damage)) {
                hitThisShot = true;

                if (target.health <= 0) {
                    // Target destroyed
                    const points = target.points * game.combo;
                    game.score += points;
                    scorePopups.push(new ScorePopup(target.x, target.y, points, true));

                    if (target.points > 0) {
                        game.hits++;
                        game.combo = Math.min(game.combo + 1, 10);
                        if (game.combo > game.maxCombo) game.maxCombo = game.combo;
                    }

                    createExplosion(target.x, target.y, target.glowColor);
                    game.targets.splice(j, 1);
                }
                break;
            }
        }
    }

    if (!hitThisShot) {
        game.combo = 1;
    }

    updateUI();

    // Auto reload when empty
    if (game.ammo <= 0) {
        reload();
    }
}

// Reload
function reload() {
    if (game.isReloading) return;
    const weapon = weapons[game.currentWeapon];
    if (game.ammo >= weapon.maxAmmo) return;

    game.isReloading = true;
    reloadBtn.textContent = 'RELOADING...';
    reloadBtn.style.opacity = '0.5';

    setTimeout(() => {
        game.ammo = weapon.maxAmmo;
        game.isReloading = false;
        reloadBtn.textContent = 'RELOAD [R]';
        reloadBtn.style.opacity = '1';
        updateUI();
    }, weapon.reloadTime);
}

// Switch weapon
function switchWeapon(weaponKey) {
    if (game.isReloading) return;
    game.currentWeapon = weaponKey;
    const weapon = weapons[weaponKey];
    game.ammo = weapon.maxAmmo;
    game.maxAmmo = weapon.maxAmmo;

    weaponBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.weapon === weaponKey);
    });

    updateUI();
}

// Update UI
function updateUI() {
    scoreEl.textContent = Math.max(0, game.score);
    timerEl.textContent = game.time;
    ammoEl.textContent = game.ammo;
    comboEl.textContent = 'x' + game.combo;

    // Animate score changes
    scoreEl.style.transform = 'scale(1.2)';
    setTimeout(() => scoreEl.style.transform = 'scale(1)', 150);
}

// Game loop
let lastTime = 0;
let spawnTimer = 0;

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    if (game.isRunning && !game.isPaused) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background grid
        drawBackground();

        // Spawn targets
        spawnTimer += deltaTime;
        if (spawnTimer > 1000 && game.targets.length < 8) {
            spawnTarget();
            spawnTimer = 0;
        }

        // Update and draw targets
        game.targets.forEach(target => {
            target.update(deltaTime);
            target.draw();
        });

        // Update and draw particles
        for (let i = game.particles.length - 1; i >= 0; i--) {
            game.particles[i].update();
            game.particles[i].draw();
            if (game.particles[i].life <= 0) {
                game.particles.splice(i, 1);
            }
        }

        // Update and draw score popups
        for (let i = scorePopups.length - 1; i >= 0; i--) {
            scorePopups[i].update();
            scorePopups[i].draw();
            if (scorePopups[i].life <= 0) {
                scorePopups.splice(i, 1);
            }
        }
    }

    requestAnimationFrame(gameLoop);
}

// Draw background
function drawBackground() {
    // Grid pattern
    ctx.strokeStyle = 'rgba(255, 77, 77, 0.1)';
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Vignette effect
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 1.5
    );
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Timer
let timerInterval;

function startTimer() {
    timerInterval = setInterval(() => {
        if (!game.isPaused) {
            game.time--;
            timerEl.textContent = game.time;

            // Warning effect at low time
            if (game.time <= 10) {
                timerEl.style.color = '#ff4d4d';
                timerEl.style.animation = 'pulseText 0.5s ease infinite';
            }

            if (game.time <= 0) {
                endGame();
            }
        }
    }, 1000);
}

// Start game
function startGame() {
    game.isRunning = true;
    game.isPaused = false;
    game.score = 0;
    game.time = 60;
    game.combo = 1;
    game.maxCombo = 1;
    game.shots = 0;
    game.hits = 0;
    game.targets = [];
    game.particles = [];
    scorePopups.length = 0;

    const weapon = weapons[game.currentWeapon];
    game.ammo = weapon.maxAmmo;

    overlay.classList.add('hidden');
    pauseBtn.disabled = false;
    startBtn.textContent = 'RESTART';

    timerEl.style.color = '';
    timerEl.style.animation = '';

    updateUI();
    startTimer();

    // Spawn initial targets
    for (let i = 0; i < 3; i++) {
        setTimeout(() => spawnTarget(), i * 300);
    }
}

// Pause game
function pauseGame() {
    game.isPaused = !game.isPaused;
    pauseBtn.textContent = game.isPaused ? 'RESUME' : 'PAUSE';

    if (game.isPaused) {
        overlay.classList.remove('hidden');
        overlayTitle.textContent = 'PAUSED';
        overlayMessage.textContent = 'Press SPACE or click RESUME to continue';
        finalStats.style.display = 'none';
    } else {
        overlay.classList.add('hidden');
    }
}

// End game
function endGame() {
    game.isRunning = false;
    clearInterval(timerInterval);

    overlay.classList.remove('hidden');
    overlayTitle.textContent = 'MISSION COMPLETE';
    overlayMessage.textContent = 'Final Results:';

    const accuracy = game.shots > 0 ? Math.round((game.hits / game.shots) * 100) : 0;

    document.getElementById('final-score').textContent = Math.max(0, game.score);
    document.getElementById('final-accuracy').textContent = accuracy + '%';
    document.getElementById('final-combo').textContent = 'x' + game.maxCombo;

    finalStats.style.display = 'flex';
    pauseBtn.disabled = true;
    startBtn.textContent = 'PLAY AGAIN';
}

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
reloadBtn.addEventListener('click', reload);

weaponBtns.forEach(btn => {
    btn.addEventListener('click', () => switchWeapon(btn.dataset.weapon));
});

// Mouse tracking for crosshair
document.addEventListener('mousemove', (e) => {
    crosshair.style.left = e.clientX + 'px';
    crosshair.style.top = e.clientY + 'px';
});

// Shooting
canvas.addEventListener('click', (e) => {
    shoot(e.clientX, e.clientY);
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case '1':
            switchWeapon('pistol');
            break;
        case '2':
            switchWeapon('shotgun');
            break;
        case '3':
            switchWeapon('rifle');
            break;
        case '4':
            switchWeapon('smg');
            break;
        case 'r':
        case 'R':
            reload();
            break;
        case ' ':
            e.preventDefault();
            if (!game.isRunning) {
                startGame();
            } else {
                pauseGame();
            }
            break;
    }
});

// Initialize
window.addEventListener('load', () => {
    initCanvas();
    gameLoop(0);
});

window.addEventListener('resize', initCanvas);

