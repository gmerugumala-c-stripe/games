# Snake Game

A classic Snake game implemented with HTML5 Canvas, CSS3, and vanilla JavaScript.

## Features

- **Classic Snake Gameplay**: Control the snake to eat food and grow longer
- **Modern UI**: Beautiful gradient design with responsive layout
- **Score Tracking**: Real-time score display with persistent high score
- **Game Controls**: Multiple control options (arrow keys, WASD, spacebar)
- **Pause/Resume**: Pause and resume gameplay anytime
- **Responsive Design**: Works on desktop and mobile devices

## How to Play

1. Click "Start Game" to begin
2. Use arrow keys or WASD to control the snake:
   - ↑/W: Move Up
   - ↓/S: Move Down
   - ←/A: Move Left
   - →/D: Move Right
3. Eat the red food squares to grow and increase your score
4. Avoid hitting the walls or yourself
5. Press Spacebar to pause/unpause during gameplay

## Controls

- **Enter**: Start a new game
- **Arrow Keys** or **WASD**: Move the snake
- **Spacebar**: Pause/Resume game
- **Start Button**: Begin a new game
- **Pause Button**: Pause/Resume current game
- **Reset Button**: Reset the game to initial state

## Scoring

- Each food item eaten: +10 points
- High score is saved in your browser's local storage
- Game speed increases as your score grows

## Game Features

- **Collision Detection**: Walls and self-collision end the game
- **Dynamic Speed**: Game gets faster as you score more points
- **Visual Feedback**: Different colors for snake head, body, and food
- **Game Over Screen**: Shows final score with restart options

## Files Structure

```
snake/
├── index.html      # Main HTML file
├── styles.css      # Game styling and layout
├── snake.js        # Game logic and mechanics
└── README.md       # This file
```

## Browser Compatibility

Works in all modern browsers that support HTML5 Canvas:
- Chrome 20+
- Firefox 15+
- Safari 9+
- Edge 12+

## Technical Details

- **Canvas Size**: 400x400 pixels (20x20 grid)
- **Grid Size**: 20x20 pixels per tile
- **Initial Speed**: 200ms per frame
- **Speed Increase**: 15ms faster every 50 points
- **Minimum Speed**: 80ms per frame

## Future Enhancements

Potential features that could be added:
- Sound effects
- Multiple difficulty levels
- Power-ups and special food
- Multiplayer mode
- Different themes
- Mobile touch controls

## Running the Game

Simply open `index.html` in any modern web browser. No server required!
