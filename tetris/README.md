# 🎮 Beautiful Animated Tetris Game

A modern, fully-featured Tetris game built with HTML5 Canvas, featuring stunning animations, smooth gameplay, and beautiful visual effects.

## ✨ Features

- **Beautiful Animations**: Smooth piece movement, rotation with easing, particle effects for line clearing, and screen shake
- **Classic Gameplay**: All 7 standard Tetris pieces (I, O, T, S, Z, J, L) with proper rotation
- **Hold Feature**: Press 'C' to swap current piece with a held piece for strategic play
- **Modern UI**: Gradient backgrounds, 3D block effects, responsive design
- **Scoring System**: Traditional Tetris scoring with level progression
- **Visual Effects**:
  - Smooth piece sliding and rotation animations
  - Spectacular line clearing with particle explosions
  - Screen shake effects
  - Glowing canvas during gameplay
  - Animated score updates
  - Game over screen with fade effects

## 🎯 How to Play

### Controls
- **← →** Arrow Keys: Move piece left/right
- **↓** Arrow Key: Soft drop (faster fall)
- **↑** Arrow Key: Rotate piece
- **Spacebar**: Hard drop (instant fall)
- **C**: Hold piece (swap with held piece)
- **P**: Pause/Resume game

### Objective
- Complete horizontal lines by filling all 10 columns
- Clear multiple lines at once for bonus points
- Game speeds up as you level up
- Try to achieve the highest score possible!

### Scoring
- Single line: 40 × level
- Double line: 100 × level
- Triple line: 300 × level
- Tetris (4 lines): 1200 × level

## 🚀 Running the Game

### Method 1: Local Web Server (Recommended)
```bash
# Navigate to the game directory
cd path/to/tetris-game

# Start a local web server (Python 3)
python3 -m http.server 8000

# Or using Node.js
npx http-server

# Open your browser and go to:
# http://localhost:8000
```

### Method 2: Direct File Opening
Simply open `index.html` in your web browser. Note that some features might not work properly due to browser security restrictions when opening HTML files directly.

## 📁 Files

- `index.html` - Main HTML structure
- `styles.css` - Beautiful CSS styling with animations
- `tetris.js` - Complete game logic and animation system
- `README.md` - This file

## 🎨 Technical Details

### Animations
- **Movement**: Cubic easing for smooth sliding
- **Rotation**: Back easing with center-point rotation
- **Line Clearing**: White flash + particle explosion effects
- **Particles**: Physics-based particle system with gravity
- **Screen Effects**: Shake, glow, and fade transitions

### Game Mechanics
- **Board**: 10×20 grid (standard Tetris dimensions)
- **Piece Generation**: Random tetromino spawning
- **Collision Detection**: Comprehensive boundary and piece collision
- **Line Clearing**: Instant line removal with visual effects
- **Level Progression**: Speed increases every 10 lines cleared

### Visual Design
- **Color Palette**: Vibrant, contrasting colors for each piece type
- **3D Effects**: Highlight and shadow effects on blocks
- **Responsive**: Works on desktop and mobile devices
- **Modern UI**: Glass-morphism design with gradients and shadows

## 🛠️ Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas
- ES6+ JavaScript features
- CSS Grid and Flexbox
- CSS Animations and Transitions

## 🎮 Enjoy!

This Tetris game combines classic gameplay with modern web technologies to create a visually stunning and smooth gaming experience. The animations make every move feel satisfying, and the particle effects during line clears are particularly spectacular!

Have fun playing! 🚀
