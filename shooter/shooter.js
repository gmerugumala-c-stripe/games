// Target Blitz ULTRA - Enhanced Shooting Gallery Game
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Sound System using Web Audio API
const AudioSystem = {
    ctx: null,
    initialized: false,
    
    init() {
        if (this.initialized) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.initialized = true;
    },
    
    play(type, volume = 0.3) {
        if (!this.initialized) this.init();
        if (!this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        const now = this.ctx.currentTime;
        gain.gain.setValueAtTime(volume, now);
        
        switch(type) {
            case 'shoot':
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'hit':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;
            case 'explosion':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(20, now + 0.3);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            case 'powerup':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            case 'critical':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
                gain.gain.setValueAtTime(0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'boss':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(80, now);
                gain.gain.setValueAtTime(0.3, now);
                for (let i = 0; i < 4; i++) {
                    osc.frequency.setValueAtTime(80, now + i * 0.15);
                    osc.frequency.exponentialRampToValueAtTime(40, now + i * 0.15 + 0.1);
                }
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                osc.start(now);
                osc.stop(now + 0.6);
                break;
            case 'achievement':
                osc.type = 'sine';
                const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
                notes.forEach((freq, i) => {
                    setTimeout(() => {
                        const o = this.ctx.createOscillator();
                        const g = this.ctx.createGain();
                        o.connect(g);
                        g.connect(this.ctx.destination);
                        o.type = 'sine';
                        o.frequency.setValueAtTime(freq, this.ctx.currentTime);
                        g.gain.setValueAtTime(0.2, this.ctx.currentTime);
                        g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
                        o.start();
                        o.stop(this.ctx.currentTime + 0.2);
                    }, i * 100);
                });
                return;
            case 'gameover':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
        }
    }
};

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
    criticalHits: 0,
    targets: [],
    particles: [],
    powerups: [],
    projectiles: [],
    currentWeapon: 'pistol',
    ammo: 30,
    maxAmmo: 30,
    isReloading: false,
    reloadTime: 0,
    lastShot: 0,
    canShoot: true,
    
    // New features
    wave: 1,
    waveTimer: 0,
    waveDuration: 15000,
    bossActive: false,
    boss: null,
    
    // Power-up states
    activePowerups: {
        multishot: { active: false, duration: 0 },
        slowmo: { active: false, duration: 0 },
        rapidfire: { active: false, duration: 0 },
        shield: { active: false, duration: 0 },
        doublePoints: { active: false, duration: 0 }
    },
    
    // Screen effects
    screenShake: 0,
    flashEffect: 0,
    slowmoFactor: 1,
    
    // Game mode
    mode: 'classic', // classic, endless, survival
    lives: 3,
    
    // Achievements
    achievements: [],
    achievementQueue: [],
    
    // Stats
    totalKills: 0,
    bossesKilled: 0,
    powerupsCollected: 0,
    
    // High scores
    highScores: JSON.parse(localStorage.getItem('targetBlitzHighScores')) || {
        classic: 0,
        endless: 0,
        survival: 0
    }
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
        shots: 1,
        shake: 2
    },
    shotgun: {
        name: 'Shotgun',
        damage: 2,
        fireRate: 800,
        maxAmmo: 8,
        reloadTime: 2000,
        spread: 40,
        shots: 8,
        shake: 8
    },
    rifle: {
        name: 'Rifle',
        damage: 3,
        fireRate: 500,
        maxAmmo: 15,
        reloadTime: 1500,
        spread: 0,
        shots: 1,
        shake: 4
    },
    smg: {
        name: 'SMG',
        damage: 1,
        fireRate: 80,
        maxAmmo: 50,
        reloadTime: 1800,
        spread: 12,
        shots: 1,
        shake: 1
    }
};

// Target types - Enhanced
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
        speed: 3,
        size: 28,
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
    },
    explosive: {
        color: '#ff6b35',
        glowColor: '#ff9f1c',
        points: 15,
        speed: 0.8,
        size: 50,
        health: 1
    },
    ghost: {
        color: '#00d4ff',
        glowColor: '#7fefff',
        points: 40,
        speed: 2,
        size: 35,
        health: 1
    },
    split: {
        color: '#2ecc71',
        glowColor: '#58d68d',
        points: 20,
        speed: 1.3,
        size: 45,
        health: 1
    },
    armored: {
        color: '#7f8c8d',
        glowColor: '#bdc3c7',
        points: 35,
        speed: 0.6,
        size: 55,
        health: 4
    }
};

// Power-up types
const powerupTypes = {
    multishot: {
        color: '#e74c3c',
        icon: '⚡',
        name: 'MULTI-SHOT',
        duration: 8000
    },
    slowmo: {
        color: '#3498db',
        icon: '⏱️',
        name: 'SLOW-MO',
        duration: 5000
    },
    rapidfire: {
        color: '#f39c12',
        icon: '🔥',
        name: 'RAPID FIRE',
        duration: 6000
    },
    shield: {
        color: '#9b59b6',
        icon: '🛡️',
        name: 'SHIELD',
        duration: 10000
    },
    doublePoints: {
        color: '#2ecc71',
        icon: '💎',
        name: '2X POINTS',
        duration: 10000
    },
    extraTime: {
        color: '#1abc9c',
        icon: '⏰',
        name: '+10 SECONDS',
        duration: 0
    },
    nuke: {
        color: '#e91e63',
        icon: '💥',
        name: 'NUKE',
        duration: 0
    }
};

// Achievement definitions
const achievementDefs = {
    firstBlood: { name: 'First Blood', desc: 'Get your first kill', icon: '🎯' },
    combo5: { name: 'Combo Master', desc: 'Reach 5x combo', icon: '🔥' },
    combo10: { name: 'Unstoppable', desc: 'Reach 10x combo', icon: '💥' },
    accuracy80: { name: 'Sharpshooter', desc: '80% accuracy', icon: '🎖️' },
    bossSlayer: { name: 'Boss Slayer', desc: 'Defeat a boss', icon: '👑' },
    powerCollector: { name: 'Collector', desc: 'Collect 5 power-ups', icon: '⭐' },
    score1000: { name: 'Point Hunter', desc: 'Score 1000 points', icon: '💰' },
    score5000: { name: 'Point Master', desc: 'Score 5000 points', icon: '💎' },
    survivor: { name: 'Survivor', desc: 'Reach wave 5', icon: '🏆' },
    critical10: { name: 'Precision', desc: '10 critical hits', icon: '🎯' }
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
const waveEl = document.getElementById('wave');
const livesEl = document.getElementById('lives');
const powerupBar = document.getElementById('powerup-bar');
const achievementPopup = document.getElementById('achievement-popup');
const modeBtns = document.querySelectorAll('.mode-btn');
const highScoreEl = document.getElementById('high-score');

// Initialize canvas
function initCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 450;
}

// Helper function
function ensurePositiveRadius(value, defaultValue = 1) {
    const num = Number(value);
    if (!isFinite(num) || num <= 0 || isNaN(num)) {
        return Math.max(1, defaultValue);
    }
    return Math.max(0.1, num);
}

// Target class - Enhanced
class Target {
    constructor(type, x = null, y = null, size = null) {
        const config = targetTypes[type];
        this.type = type;
        this.size = size || ensurePositiveRadius(config.size || 40, 40);
        this.x = x !== null ? x : Math.random() * (canvas.width - this.size * 2) + this.size;
        this.y = y !== null ? y : Math.random() * (canvas.height - this.size * 2) + this.size;
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
        
        // Special properties
        this.ghostPhase = 0;
        this.isVisible = true;
        this.trail = [];
        this.spawnTime = Date.now();
    }

    update(deltaTime) {
        this.size = ensurePositiveRadius(this.size, 40);
        const cappedDelta = Math.min(deltaTime || 16, 100);
        const moveFactor = (cappedDelta / 16) * game.slowmoFactor;

        // Ghost target visibility
        if (this.type === 'ghost') {
            this.ghostPhase += 0.03 * moveFactor;
            this.isVisible = Math.sin(this.ghostPhase) > -0.3;
        }

        // Trail effect for fast targets
        if (this.type === 'fast' || this.type === 'ghost') {
            this.trail.push({ x: this.x, y: this.y, alpha: 1 });
            if (this.trail.length > 10) this.trail.shift();
            this.trail.forEach(t => t.alpha -= 0.1);
        }

        // Movement
        this.x += this.vx * moveFactor;
        this.y += this.vy * moveFactor;

        // Bounce off walls
        const safeSize = Math.max(1, this.size);
        if (this.x - safeSize < 0 || this.x + safeSize > canvas.width) {
            this.vx *= -1;
            this.x = Math.max(safeSize, Math.min(canvas.width - safeSize, this.x));
        }
        if (this.y - safeSize < 0 || this.y + safeSize > canvas.height) {
            this.vy *= -1;
            this.y = Math.max(safeSize, Math.min(canvas.height - safeSize, this.y));
        }

        this.angle += 0.02 * moveFactor;
        this.pulsePhase += 0.05 * moveFactor;

        if (this.isHit && Date.now() - this.hitTime > 100) {
            this.isHit = false;
        }
    }

    draw() {
        // Draw trail
        if (this.trail.length > 0) {
            this.trail.forEach((t, i) => {
                if (t.alpha > 0) {
                    ctx.save();
                    ctx.globalAlpha = t.alpha * 0.3;
                    ctx.fillStyle = this.glowColor;
                    ctx.beginPath();
                    ctx.arc(t.x, t.y, this.size * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            });
        }

        // Ghost visibility
        if (this.type === 'ghost' && !this.isVisible) {
            ctx.save();
            ctx.globalAlpha = 0.2;
        }

        const safeSize = ensurePositiveRadius(this.size, 40);
        if (safeSize <= 0) return;

        const pulseValue = 1 + Math.sin(this.pulsePhase) * 0.1;
        const pulse = ensurePositiveRadius(pulseValue, 1);

        ctx.save();
        ctx.translate(this.x, this.y);

        // Glow effect
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = this.isHit ? 40 : 20;

        // Outer ring
        const outerRadius = ensurePositiveRadius(safeSize * pulse, safeSize);
        ctx.beginPath();
        ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner circle with gradient
        const innerRadius = ensurePositiveRadius(safeSize * 0.8 * pulse, safeSize * 0.8);
        const gradientRadius = ensurePositiveRadius(safeSize, safeSize);
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, gradientRadius);
        gradient.addColorStop(0, this.isHit ? '#fff' : this.glowColor);
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, this.color + '80');

        ctx.beginPath();
        ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Bullseye rings
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 2;

        const ring1Radius = ensurePositiveRadius(safeSize * 0.5, safeSize * 0.5);
        ctx.beginPath();
        ctx.arc(0, 0, ring1Radius, 0, Math.PI * 2);
        ctx.stroke();

        const ring2Radius = ensurePositiveRadius(safeSize * 0.25, safeSize * 0.25);
        ctx.beginPath();
        ctx.arc(0, 0, ring2Radius, 0, Math.PI * 2);
        ctx.stroke();

        // Center dot (critical hit zone)
        const dotRadius = ensurePositiveRadius(safeSize * 0.12, safeSize * 0.12);
        ctx.beginPath();
        ctx.arc(0, 0, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // Health bar for multi-hit targets
        if (this.maxHealth > 1) {
            ctx.shadowBlur = 0;
            const healthWidth = safeSize * 1.5;
            const healthHeight = 6;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(-healthWidth / 2, safeSize + 10, healthWidth, healthHeight);
            ctx.fillStyle = this.health > this.maxHealth / 2 ? '#00ff88' : '#ff4d4d';
            ctx.fillRect(-healthWidth / 2, safeSize + 10, healthWidth * (this.health / this.maxHealth), healthHeight);
        }

        // Type-specific effects
        if (this.type === 'bonus') {
            ctx.rotate(this.angle);
            for (let i = 0; i < 4; i++) {
                ctx.rotate(Math.PI / 2);
                ctx.beginPath();
                ctx.moveTo(safeSize * 1.1, 0);
                ctx.lineTo(safeSize * 1.3, -5);
                ctx.lineTo(safeSize * 1.5, 0);
                ctx.lineTo(safeSize * 1.3, 5);
                ctx.closePath();
                ctx.fillStyle = this.glowColor;
                ctx.fill();
            }
        }

        if (this.type === 'explosive') {
            // Danger symbol
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💣', 0, 0);
        }

        if (this.type === 'split') {
            // Split indicator
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-safeSize * 0.3, 0);
            ctx.lineTo(safeSize * 0.3, 0);
            ctx.stroke();
        }

        if (this.type === 'armored') {
            // Armor plates
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            for (let i = 0; i < 6; i++) {
                ctx.save();
                ctx.rotate(i * Math.PI / 3 + this.angle);
                ctx.beginPath();
                ctx.arc(0, 0, safeSize * 0.7, -0.3, 0.3);
                ctx.stroke();
                ctx.restore();
            }
        }

        ctx.restore();

        if (this.type === 'ghost' && !this.isVisible) {
            ctx.restore();
        }
    }

    checkHit(x, y, damage) {
        if (this.type === 'ghost' && !this.isVisible) return false;

        const safeSize = ensurePositiveRadius(this.size, 40);
        const dist = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);

        // Critical hit zone (center)
        const criticalZone = safeSize * 0.15;
        const isCritical = dist < criticalZone;

        if (dist < safeSize) {
            const actualDamage = isCritical ? damage * 2 : damage;
            this.health -= actualDamage;
            this.isHit = true;
            this.hitTime = Date.now();
            return { hit: true, critical: isCritical };
        }
        return { hit: false, critical: false };
    }
}

// Boss class
class Boss {
    constructor(wave) {
        this.x = canvas.width / 2;
        this.y = -100;
        this.targetY = 100;
        this.size = 80 + wave * 10;
        this.health = 20 + wave * 10;
        this.maxHealth = this.health;
        this.phase = 0;
        this.attackTimer = 0;
        this.pattern = 0;
        this.entering = true;
        this.angle = 0;
        this.color = '#ff1744';
        this.glowColor = '#ff6b6b';
        this.projectiles = [];
    }

    update(deltaTime) {
        const cappedDelta = Math.min(deltaTime || 16, 100);
        const moveFactor = (cappedDelta / 16) * game.slowmoFactor;

        if (this.entering) {
            this.y += 2 * moveFactor;
            if (this.y >= this.targetY) {
                this.entering = false;
            }
            return;
        }

        // Movement pattern
        this.phase += 0.02 * moveFactor;
        this.x = canvas.width / 2 + Math.sin(this.phase) * 200;
        this.angle += 0.03 * moveFactor;

        // Attack
        this.attackTimer += cappedDelta;
        if (this.attackTimer > 2000) {
            this.attack();
            this.attackTimer = 0;
        }

        // Update projectiles
        this.projectiles.forEach(p => {
            p.x += p.vx * moveFactor;
            p.y += p.vy * moveFactor;
            p.life -= 0.01;
        });
        this.projectiles = this.projectiles.filter(p => p.life > 0 && p.y < canvas.height + 50);
    }

    attack() {
        const patterns = [
            // Spread shot
            () => {
                for (let i = -2; i <= 2; i++) {
                    this.projectiles.push({
                        x: this.x,
                        y: this.y + this.size,
                        vx: i * 2,
                        vy: 5,
                        size: 10,
                        life: 1
                    });
                }
            },
            // Spiral
            () => {
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    this.projectiles.push({
                        x: this.x,
                        y: this.y + this.size,
                        vx: Math.cos(angle) * 4,
                        vy: Math.sin(angle) * 4 + 2,
                        size: 8,
                        life: 1
                    });
                }
            }
        ];

        this.pattern = (this.pattern + 1) % patterns.length;
        patterns[this.pattern]();
        AudioSystem.play('shoot', 0.2);
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Glow
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 30;

        // Main body
        ctx.rotate(this.angle);
        
        // Outer hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const px = Math.cos(angle) * this.size;
            const py = Math.sin(angle) * this.size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, '#8b0000');
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner details
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = this.glowColor;
        ctx.stroke();

        // Eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Health bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        const barWidth = 200;
        const barHeight = 12;
        ctx.fillRect(this.x - barWidth / 2, 20, barWidth, barHeight);
        
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff88' : healthPercent > 0.25 ? '#ffd700' : '#ff4d4d';
        ctx.fillRect(this.x - barWidth / 2, 20, barWidth * healthPercent, barHeight);
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - barWidth / 2, 20, barWidth, barHeight);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('BOSS', this.x, 15);

        // Draw projectiles
        this.projectiles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = '#ff4d4d';
            ctx.shadowColor = '#ff4d4d';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    checkHit(x, y, damage) {
        if (this.entering) return false;
        const dist = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        if (dist < this.size) {
            this.health -= damage;
            game.screenShake = 5;
            return true;
        }
        return false;
    }

    checkPlayerHit(playerX, playerY) {
        // Check if any projectile hits the center of the screen (player area)
        for (const p of this.projectiles) {
            const dist = Math.sqrt((p.x - canvas.width / 2) ** 2 + (p.y - canvas.height) ** 2);
            if (dist < 50) {
                return true;
            }
        }
        return false;
    }
}

// Power-up class
class Powerup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        const types = Object.keys(powerupTypes);
        this.type = types[Math.floor(Math.random() * types.length)];
        const config = powerupTypes[this.type];
        this.color = config.color;
        this.icon = config.icon;
        this.name = config.name;
        this.duration = config.duration;
        this.size = 25;
        this.vy = 1;
        this.angle = 0;
        this.pulsePhase = 0;
    }

    update(deltaTime) {
        const cappedDelta = Math.min(deltaTime || 16, 100);
        const moveFactor = (cappedDelta / 16) * game.slowmoFactor;
        
        this.y += this.vy * moveFactor;
        this.angle += 0.05 * moveFactor;
        this.pulsePhase += 0.1 * moveFactor;
    }

    draw() {
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.2;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;

        // Rotating outer ring
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.arc(0, 0, this.size * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Spinning triangles
        for (let i = 0; i < 3; i++) {
            ctx.rotate(Math.PI * 2 / 3);
            ctx.beginPath();
            ctx.moveTo(this.size * 1.3, 0);
            ctx.lineTo(this.size * 1.1, -8);
            ctx.lineTo(this.size * 1.1, 8);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        ctx.rotate(-this.angle);

        // Inner circle
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 0.7);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, this.color + '80');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Icon
        ctx.shadowBlur = 0;
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);

        ctx.restore();
    }

    checkCollision(x, y) {
        const dist = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        return dist < this.size * 2;
    }
}

// Particle class - Enhanced
class Particle {
    constructor(x, y, color, type = 'normal') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.color = color;
        this.life = 1;

        if (type === 'explosion') {
            this.vx = (Math.random() - 0.5) * 20;
            this.vy = (Math.random() - 0.5) * 20;
            this.size = 5 + Math.random() * 10;
            this.decay = 0.03;
        } else if (type === 'critical') {
            this.vx = (Math.random() - 0.5) * 15;
            this.vy = -5 - Math.random() * 10;
            this.size = 4 + Math.random() * 6;
            this.decay = 0.02;
        } else {
            this.vx = (Math.random() - 0.5) * 10;
            this.vy = (Math.random() - 0.5) * 10;
            this.size = 3 + Math.random() * 5;
            this.decay = 0.02 + Math.random() * 0.02;
        }
    }

    update() {
        const moveFactor = game.slowmoFactor;
        this.x += this.vx * moveFactor;
        this.y += this.vy * moveFactor;
        this.vy += 0.3 * moveFactor;
        this.life -= this.decay * moveFactor;
    }

    draw() {
        if (this.life <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        const radius = Math.max(0.1, this.size * this.life);
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Score popup class
class ScorePopup {
    constructor(x, y, score, isCritical = false) {
        this.x = x;
        this.y = y;
        this.score = score;
        this.life = 1;
        this.isCritical = isCritical;
    }

    update() {
        this.y -= 2;
        this.life -= 0.02;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        
        const size = this.isCritical ? 32 : 24;
        ctx.font = `bold ${size}px Orbitron`;
        ctx.textAlign = 'center';
        
        if (this.isCritical) {
            ctx.fillStyle = '#ffd700';
            ctx.shadowColor = '#ffd700';
            ctx.fillText('CRITICAL!', this.x, this.y - 20);
        }
        
        ctx.fillStyle = this.score > 0 ? '#00ff88' : '#ff4d4d';
        ctx.shadowColor = this.score > 0 ? '#00ff88' : '#ff4d4d';
        ctx.shadowBlur = 10;
        ctx.fillText((this.score > 0 ? '+' : '') + this.score, this.x, this.y);
        ctx.restore();
    }
}

const scorePopups = [];

// Spawn functions
function spawnTarget() {
    if (!canvas.width || !canvas.height || canvas.width <= 0 || canvas.height <= 0) {
        initCanvas();
    }

    // More variety based on wave
    const baseTypes = ['standard', 'standard', 'fast', 'bonus', 'danger'];
    const advancedTypes = ['ghost', 'split', 'explosive', 'armored'];
    
    let types = [...baseTypes];
    if (game.wave >= 2) types.push(...advancedTypes.slice(0, 2));
    if (game.wave >= 3) types.push(...advancedTypes.slice(2));
    if (game.wave >= 4) types.push('armored', 'armored');

    const type = types[Math.floor(Math.random() * types.length)];
    const target = new Target(type);
    
    // Increase speed based on wave
    const waveMultiplier = 1 + (game.wave - 1) * 0.2;
    target.vx *= waveMultiplier;
    target.vy *= waveMultiplier;

    if (target.size && target.size > 0 && isFinite(target.size)) {
        game.targets.push(target);
    }
}

function spawnPowerup(x, y) {
    if (Math.random() < 0.15) { // 15% chance
        game.powerups.push(new Powerup(x, y));
    }
}

function spawnBoss() {
    game.boss = new Boss(game.wave);
    game.bossActive = true;
    AudioSystem.play('boss');
    showAchievementPopup('⚠️ BOSS INCOMING!', '#ff1744');
}

function createExplosion(x, y, color, type = 'normal') {
    const count = type === 'critical' ? 25 : type === 'explosion' ? 40 : 15;
    for (let i = 0; i < count; i++) {
        game.particles.push(new Particle(x, y, color, type));
    }
}

// Chain explosion for explosive targets
function chainExplosion(x, y) {
    const explosionRadius = 100;
    game.screenShake = 15;
    AudioSystem.play('explosion');
    
    // Create big explosion
    createExplosion(x, y, '#ff6b35', 'explosion');
    
    // Damage nearby targets
    for (let i = game.targets.length - 1; i >= 0; i--) {
        const target = game.targets[i];
        const dist = Math.sqrt((target.x - x) ** 2 + (target.y - y) ** 2);
        if (dist < explosionRadius) {
            target.health -= 3;
            if (target.health <= 0) {
                const points = target.points * game.combo;
                game.score += points;
                scorePopups.push(new ScorePopup(target.x, target.y, points));
                createExplosion(target.x, target.y, target.glowColor);
                
                if (target.type === 'explosive' && target !== game.targets[i]) {
                    setTimeout(() => chainExplosion(target.x, target.y), 100);
                }
                
                game.targets.splice(i, 1);
                game.totalKills++;
            }
        }
    }
}

// Activate power-up
function activatePowerup(powerup) {
    AudioSystem.play('powerup');
    game.powerupsCollected++;
    checkAchievement('powerCollector', game.powerupsCollected >= 5);
    
    showAchievementPopup(powerup.name, powerup.color);

    switch (powerup.type) {
        case 'multishot':
            game.activePowerups.multishot = { active: true, duration: powerup.duration };
            break;
        case 'slowmo':
            game.activePowerups.slowmo = { active: true, duration: powerup.duration };
            game.slowmoFactor = 0.3;
            break;
        case 'rapidfire':
            game.activePowerups.rapidfire = { active: true, duration: powerup.duration };
            break;
        case 'shield':
            game.activePowerups.shield = { active: true, duration: powerup.duration };
            break;
        case 'doublePoints':
            game.activePowerups.doublePoints = { active: true, duration: powerup.duration };
            break;
        case 'extraTime':
            game.time += 10;
            break;
        case 'nuke':
            nukeAllTargets();
            break;
    }
    
    updatePowerupUI();
}

function nukeAllTargets() {
    game.screenShake = 20;
    game.flashEffect = 1;
    AudioSystem.play('explosion');
    
    game.targets.forEach(target => {
        if (target.points > 0) {
            const points = target.points;
            game.score += points;
            scorePopups.push(new ScorePopup(target.x, target.y, points));
            createExplosion(target.x, target.y, target.glowColor, 'explosion');
            game.totalKills++;
        }
    });
    
    game.targets = game.targets.filter(t => t.points < 0);
}

// Update power-ups
function updatePowerups(deltaTime) {
    Object.keys(game.activePowerups).forEach(key => {
        const pu = game.activePowerups[key];
        if (pu.active) {
            pu.duration -= deltaTime;
            if (pu.duration <= 0) {
                pu.active = false;
                if (key === 'slowmo') {
                    game.slowmoFactor = 1;
                }
            }
        }
    });
    updatePowerupUI();
}

function updatePowerupUI() {
    if (!powerupBar) return;
    powerupBar.innerHTML = '';
    
    Object.keys(game.activePowerups).forEach(key => {
        const pu = game.activePowerups[key];
        if (pu.active) {
            const config = powerupTypes[key];
            const div = document.createElement('div');
            div.className = 'active-powerup';
            div.style.borderColor = config.color;
            div.innerHTML = `${config.icon} ${Math.ceil(pu.duration / 1000)}s`;
            powerupBar.appendChild(div);
        }
    });
}

// Shoot function - Enhanced
function shoot(mouseX, mouseY) {
    if (!game.isRunning || game.isPaused || game.isReloading || game.ammo <= 0) return;

    const now = Date.now();
    const weapon = weapons[game.currentWeapon];
    const fireRate = game.activePowerups.rapidfire.active ? weapon.fireRate * 0.4 : weapon.fireRate;

    if (now - game.lastShot < fireRate) return;

    game.lastShot = now;
    game.ammo--;
    game.shots++;
    
    // Screen shake
    game.screenShake = weapon.shake;
    
    AudioSystem.play('shoot');
    updateUI();

    // Muzzle flash
    muzzleFlash.style.left = mouseX + 'px';
    muzzleFlash.style.top = mouseY + 'px';
    muzzleFlash.classList.add('active');
    setTimeout(() => muzzleFlash.classList.remove('active'), 100);

    const rect = canvas.getBoundingClientRect();
    const canvasX = mouseX - rect.left;
    const canvasY = mouseY - rect.top;

    // Multi-shot power-up
    const shotMultiplier = game.activePowerups.multishot.active ? 3 : 1;
    const totalShots = weapon.shots * shotMultiplier;

    let hitThisShot = false;
    let anyCritical = false;

    for (let i = 0; i < totalShots; i++) {
        const spreadX = (Math.random() - 0.5) * weapon.spread * 2;
        const spreadY = (Math.random() - 0.5) * weapon.spread * 2;
        const shotX = canvasX + spreadX;
        const shotY = canvasY + spreadY;

        // Check boss hit
        if (game.boss && game.bossActive) {
            if (game.boss.checkHit(shotX, shotY, weapon.damage)) {
                hitThisShot = true;
                AudioSystem.play('hit');
                
                if (game.boss.health <= 0) {
                    // Boss defeated!
                    game.bossActive = false;
                    const bossPoints = 500 * game.wave;
                    game.score += bossPoints;
                    game.bossesKilled++;
                    scorePopups.push(new ScorePopup(game.boss.x, game.boss.y, bossPoints));
                    createExplosion(game.boss.x, game.boss.y, '#ff1744', 'explosion');
                    game.screenShake = 30;
                    AudioSystem.play('explosion');
                    checkAchievement('bossSlayer', true);
                    game.boss = null;
                }
            }
        }

        // Check power-up collection
        for (let p = game.powerups.length - 1; p >= 0; p--) {
            if (game.powerups[p].checkCollision(shotX, shotY)) {
                activatePowerup(game.powerups[p]);
                game.powerups.splice(p, 1);
            }
        }

        // Check target hits
        for (let j = game.targets.length - 1; j >= 0; j--) {
            const target = game.targets[j];
            const result = target.checkHit(shotX, shotY, weapon.damage);
            
            if (result.hit) {
                hitThisShot = true;
                
                if (result.critical) {
                    anyCritical = true;
                    game.criticalHits++;
                    AudioSystem.play('critical');
                    checkAchievement('critical10', game.criticalHits >= 10);
                } else {
                    AudioSystem.play('hit');
                }

                if (target.health <= 0) {
                    // Target destroyed
                    let points = target.points * game.combo;
                    if (result.critical) points *= 2;
                    if (game.activePowerups.doublePoints.active) points *= 2;
                    
                    game.score += points;
                    scorePopups.push(new ScorePopup(target.x, target.y, points, result.critical));

                    if (target.points > 0) {
                        game.hits++;
                        game.totalKills++;
                        game.combo = Math.min(game.combo + 1, 15);
                        if (game.combo > game.maxCombo) game.maxCombo = game.combo;
                        
                        checkAchievement('firstBlood', true);
                        checkAchievement('combo5', game.combo >= 5);
                        checkAchievement('combo10', game.combo >= 10);
                    }

                    // Special target effects
                    if (target.type === 'explosive') {
                        chainExplosion(target.x, target.y);
                    } else if (target.type === 'split') {
                        // Split into two smaller targets
                        const newSize = target.size * 0.6;
                        for (let s = 0; s < 2; s++) {
                            const newTarget = new Target('fast', 
                                target.x + (s === 0 ? -30 : 30), 
                                target.y,
                                newSize
                            );
                            game.targets.push(newTarget);
                        }
                    }

                    createExplosion(target.x, target.y, target.glowColor, result.critical ? 'critical' : 'normal');
                    spawnPowerup(target.x, target.y);
                    game.targets.splice(j, 1);
                }
                break;
            }
        }
    }

    if (!hitThisShot) {
        game.combo = 1;
        
        // Survival mode - lose life on miss
        if (game.mode === 'survival' && !game.activePowerups.shield.active) {
            // Don't lose life on every miss, only sometimes
        }
    }

    // Check score achievements
    checkAchievement('score1000', game.score >= 1000);
    checkAchievement('score5000', game.score >= 5000);

    updateUI();

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

// Achievement system
function checkAchievement(id, condition) {
    if (!condition || game.achievements.includes(id)) return;
    
    game.achievements.push(id);
    const achievement = achievementDefs[id];
    if (achievement) {
        AudioSystem.play('achievement');
        showAchievementPopup(`${achievement.icon} ${achievement.name}`, '#ffd700');
    }
}

function showAchievementPopup(text, color) {
    if (!achievementPopup) return;
    
    game.achievementQueue.push({ text, color });
    
    if (game.achievementQueue.length === 1) {
        displayNextAchievement();
    }
}

function displayNextAchievement() {
    if (game.achievementQueue.length === 0) return;
    
    const { text, color } = game.achievementQueue[0];
    
    achievementPopup.textContent = text;
    achievementPopup.style.borderColor = color;
    achievementPopup.style.color = color;
    achievementPopup.classList.add('show');
    
    setTimeout(() => {
        achievementPopup.classList.remove('show');
        game.achievementQueue.shift();
        
        setTimeout(() => {
            displayNextAchievement();
        }, 300);
    }, 2000);
}

// Update UI
function updateUI() {
    scoreEl.textContent = Math.max(0, game.score);
    timerEl.textContent = game.time;
    ammoEl.textContent = game.ammo;
    comboEl.textContent = 'x' + game.combo;
    
    if (waveEl) waveEl.textContent = game.wave;
    if (livesEl) livesEl.textContent = '❤️'.repeat(game.lives);
    if (highScoreEl) highScoreEl.textContent = game.highScores[game.mode];

    scoreEl.style.transform = 'scale(1.2)';
    setTimeout(() => scoreEl.style.transform = 'scale(1)', 150);
    
    // Combo glow effect
    if (game.combo >= 5) {
        comboEl.style.textShadow = `0 0 20px ${game.combo >= 10 ? '#ff4d4d' : '#ffd700'}`;
    } else {
        comboEl.style.textShadow = '';
    }
}

// Game loop
let lastTime = 0;
let spawnTimer = 0;

function gameLoop(currentTime) {
    if (lastTime === 0) {
        lastTime = currentTime;
    }
    const deltaTime = Math.max(0, currentTime - lastTime);
    lastTime = currentTime;

    if (game.isRunning && !game.isPaused) {
        // Apply screen shake
        if (game.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * game.screenShake;
            const shakeY = (Math.random() - 0.5) * game.screenShake;
            canvas.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
            game.screenShake *= 0.9;
            if (game.screenShake < 0.5) {
                game.screenShake = 0;
                canvas.style.transform = '';
            }
        }

        // Flash effect
        if (game.flashEffect > 0) {
            game.flashEffect -= 0.05;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();

        // Update wave
        game.waveTimer += deltaTime;
        if (game.waveTimer >= game.waveDuration && !game.bossActive) {
            game.wave++;
            game.waveTimer = 0;
            checkAchievement('survivor', game.wave >= 5);
            
            // Spawn boss every 2 waves
            if (game.wave % 2 === 0) {
                spawnBoss();
            } else {
                showAchievementPopup(`WAVE ${game.wave}`, '#00ff88');
            }
        }

        // Spawn targets
        if (deltaTime > 0 && !game.bossActive) {
            spawnTimer += deltaTime;
            const spawnRate = Math.max(400, 1000 - game.wave * 100);
            const maxTargets = 6 + game.wave;
            
            if (spawnTimer > spawnRate && game.targets.length < maxTargets) {
                spawnTarget();
                spawnTimer = 0;
            }
        }

        // Update power-ups
        updatePowerups(deltaTime);

        // Update and draw targets
        for (let i = game.targets.length - 1; i >= 0; i--) {
            const target = game.targets[i];
            if (!target.size || target.size <= 0 || !isFinite(target.size)) {
                game.targets.splice(i, 1);
                continue;
            }
            if (deltaTime > 0) {
                target.update(deltaTime);
            }
            target.draw();
        }

        // Update and draw power-ups
        for (let i = game.powerups.length - 1; i >= 0; i--) {
            game.powerups[i].update(deltaTime);
            game.powerups[i].draw();
            
            if (game.powerups[i].y > canvas.height + 50) {
                game.powerups.splice(i, 1);
            }
        }

        // Update and draw boss
        if (game.boss && game.bossActive) {
            game.boss.update(deltaTime);
            game.boss.draw();
            
            // Check if player is hit by boss projectiles
            if (game.mode === 'survival' && game.boss.checkPlayerHit() && !game.activePowerups.shield.active) {
                game.lives--;
                game.boss.projectiles = [];
                game.screenShake = 15;
                
                if (game.lives <= 0) {
                    endGame();
                }
            }
        }

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

        // Draw flash effect
        if (game.flashEffect > 0) {
            ctx.save();
            ctx.globalAlpha = game.flashEffect;
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }

        // Draw slow-mo effect
        if (game.activePowerups.slowmo.active) {
            ctx.save();
            ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
            ctx.lineWidth = 20;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }

        // Draw shield effect
        if (game.activePowerups.shield.active) {
            ctx.save();
            ctx.strokeStyle = 'rgba(155, 89, 182, 0.5)';
            ctx.lineWidth = 5;
            ctx.setLineDash([10, 10]);
            ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
            ctx.restore();
        }
    }

    requestAnimationFrame(gameLoop);
}

// Draw background - Enhanced
function drawBackground() {
    // Animated grid pattern
    const time = Date.now() * 0.001;
    ctx.strokeStyle = `rgba(255, 77, 77, ${0.05 + Math.sin(time) * 0.03})`;
    ctx.lineWidth = 1;

    const gridSize = 50;
    const offset = (time * 10) % gridSize;

    for (let x = -offset; x < canvas.width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
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
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Wave indicator
    if (game.isRunning && !game.bossActive) {
        const waveProgress = game.waveTimer / game.waveDuration;
        ctx.fillStyle = 'rgba(255, 77, 77, 0.3)';
        ctx.fillRect(0, canvas.height - 5, canvas.width * waveProgress, 5);
    }
}

// Timer
let timerInterval;

function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        if (game.isRunning && !game.isPaused) {
            if (game.mode !== 'endless') {
                game.time--;
                timerEl.textContent = game.time;

                if (game.time <= 10) {
                    timerEl.style.color = '#ff4d4d';
                    timerEl.style.animation = 'pulseText 0.5s ease infinite';
                }

                if (game.time <= 0) {
                    endGame();
                }
            }
        }
    }, 1000);
}

// Start game
function startGame() {
    AudioSystem.init();
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    game.isRunning = true;
    game.isPaused = false;
    game.score = 0;
    game.time = game.mode === 'endless' ? 999 : 60;
    game.combo = 1;
    game.maxCombo = 1;
    game.shots = 0;
    game.hits = 0;
    game.criticalHits = 0;
    game.targets = [];
    game.particles = [];
    game.powerups = [];
    game.achievements = [];
    game.achievementQueue = [];
    scorePopups.length = 0;
    spawnTimer = 0;
    
    game.wave = 1;
    game.waveTimer = 0;
    game.bossActive = false;
    game.boss = null;
    game.lives = game.mode === 'survival' ? 3 : 1;
    game.totalKills = 0;
    game.bossesKilled = 0;
    game.powerupsCollected = 0;
    
    game.screenShake = 0;
    game.flashEffect = 0;
    game.slowmoFactor = 1;
    
    // Reset power-ups
    Object.keys(game.activePowerups).forEach(key => {
        game.activePowerups[key] = { active: false, duration: 0 };
    });

    const weapon = weapons[game.currentWeapon];
    game.ammo = weapon.maxAmmo;

    overlay.classList.add('hidden');
    pauseBtn.disabled = false;
    startBtn.textContent = 'RESTART';

    timerEl.style.color = '';
    timerEl.style.animation = '';

    updateUI();
    updatePowerupUI();
    
    if (game.mode !== 'endless') {
        startTimer();
    }

    for (let i = 0; i < 3; i++) {
        setTimeout(() => spawnTarget(), i * 300);
    }
    
    showAchievementPopup(`${game.mode.toUpperCase()} MODE - WAVE 1`, '#00ff88');
}

// Pause game
function pauseGame() {
    if (!game.isRunning) return;

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
    AudioSystem.play('gameover');

    // Update high score
    if (game.score > game.highScores[game.mode]) {
        game.highScores[game.mode] = game.score;
        localStorage.setItem('targetBlitzHighScores', JSON.stringify(game.highScores));
    }

    overlay.classList.remove('hidden');
    overlayTitle.textContent = game.mode === 'survival' && game.lives <= 0 ? 'GAME OVER' : 'MISSION COMPLETE';
    overlayMessage.textContent = 'Final Results:';

    const accuracy = game.shots > 0 ? Math.round((game.hits / game.shots) * 100) : 0;
    checkAchievement('accuracy80', accuracy >= 80);

    document.getElementById('final-score').textContent = Math.max(0, game.score);
    document.getElementById('final-accuracy').textContent = accuracy + '%';
    document.getElementById('final-combo').textContent = 'x' + game.maxCombo;
    
    // Additional stats
    const extraStats = document.getElementById('extra-stats');
    if (extraStats) {
        extraStats.innerHTML = `
            <div class="final-stat">
                <span class="final-label">Wave</span>
                <span class="final-value">${game.wave}</span>
            </div>
            <div class="final-stat">
                <span class="final-label">Kills</span>
                <span class="final-value">${game.totalKills}</span>
            </div>
            <div class="final-stat">
                <span class="final-label">Critical</span>
                <span class="final-value">${game.criticalHits}</span>
            </div>
        `;
    }

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

// Game mode selection
if (modeBtns) {
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            game.mode = btn.dataset.mode;
            if (highScoreEl) highScoreEl.textContent = game.highScores[game.mode];
        });
    });
}

// Mouse tracking
document.addEventListener('mousemove', (e) => {
    crosshair.style.left = e.clientX + 'px';
    crosshair.style.top = e.clientY + 'px';
});

// Shooting
canvas.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (game.isRunning && !game.isPaused) {
        try {
            shoot(e.clientX, e.clientY);
        } catch (error) {
            console.error('Error in shoot function:', error);
        }
    }
}, true);

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
    if (highScoreEl) highScoreEl.textContent = game.highScores[game.mode];
});

window.addEventListener('resize', initCanvas);
