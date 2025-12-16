# GO Game (Baduk/Weiqi)

A fully functional implementation of the ancient strategy board game GO, also known as Baduk (Korean) or Weiqi (Chinese).

## Features

### Beginner-Friendly Features ⭐

- **Interactive Liberty Visualization**: Hover over any stone to see:
  - Number of liberties for that group
  - Color-coded warnings (Red = 1 liberty, Orange = 2 liberties, Green = safe)
  - Highlighted group connections
- **Undo Move**: Take back moves to learn from mistakes
- **Move History**: Track last 10 moves with visual indicators
  - Shows captures with ⚔️ icon
  - Displays player color and position
  - Distinguishes passes from regular moves
- **Rotating Tips**: Educational tips change every 10 seconds
- **Beginner Hints Toggle**: Turn hints on/off as you improve
- **Confirmation Dialogs**: Prevents accidental passes and resets

### Game Difficulty

- **Three Difficulty Levels**:
  - **Easy (9×9)**: Perfect for beginners and quick games
  - **Medium (13×13)**: Intermediate level for learning strategy
  - **Hard (19×19)**: Full professional board size for advanced play
- **Dynamic Board Sizes**: Automatically adjusts cell size and stone size for optimal display
- **Full Rule Implementation**:
  - Stone placement mechanics
  - Capture rules (removing groups with no liberties)
  - Ko rule (prevents immediate recapture)
  - Suicide rule (prevents self-capture without capturing opponent)
- **Game Features**:
  - Turn-based gameplay (Black moves first)
  - Capture counting for both players
  - Pass functionality
  - Automatic game end after two consecutive passes
  - Territory and score calculation
  - Komi (6.5 points for White)
  - Visual highlighting of last move
- **Modern UI**:
  - Beautiful wooden board appearance
  - Gradient-rendered stones
  - Responsive design
  - Real-time game state display

## How to Play

1. Open `index.html` in your web browser
2. Select your difficulty level (Easy/Medium/Hard)
3. **For Beginners**: Keep "Show Beginner Hints" checked to see:
   - Liberty counts when hovering over stones
   - Rotating educational tips
   - Warning colors for groups in danger
4. Black plays first - click on any intersection to place a stone
5. Players alternate placing stones
6. **Hover over stones** to see their liberty count and group connections
7. Surround opponent's stones to capture them (remove groups with no liberties)
8. Click "**Undo Move**" if you want to take back your last move
9. Click "Pass" if you don't want to play a move
10. Game ends when both players pass consecutively
11. Score is calculated based on territory and captures

### Learning Tips

- Start with **Easy (9×9)** board to learn fundamentals
- Watch the **liberty counter** - groups with 1-2 liberties are in danger!
- Use the **Undo** feature to experiment with different moves
- Read the **rotating tips** for strategic advice
- Check the **Move History** to review the game progression

## Game Rules

### Basic Rules
- Players alternate placing stones on the intersections of the board
- Black always moves first
- Once placed, stones do not move unless captured
- A stone or group of stones is captured when it has no liberties (empty adjacent points)

### Liberty
A liberty is an empty point directly adjacent (not diagonal) to a stone or group of connected stones.

### Capturing
When a group of stones has no liberties remaining, it is captured and removed from the board.

### Ko Rule
You cannot immediately recapture a single stone if doing so would recreate the board position from your opponent's last move.

### Suicide Rule
You cannot place a stone in a position where it would have no liberties, unless that move captures opponent stones.

### Scoring
- Territory: Empty intersections surrounded by your stones
- Captures: Number of opponent stones captured
- Komi: White receives 6.5 points as compensation for playing second
- Winner: Player with the highest total score

## Technical Implementation

- Pure JavaScript (ES6+)
- HTML5 Canvas for rendering
- No external dependencies
- Object-oriented design
- Efficient algorithms for:
  - Group detection (flood fill)
  - Liberty counting
  - Capture detection
  - Territory calculation
  - Ko detection

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Opera

## Development

The game consists of three main files:
- `index.html` - Game structure and layout
- `styles.css` - Styling and responsive design
- `go.js` - Game logic and canvas rendering

## Future Enhancements

Possible additions:
- Undo/Redo functionality
- Game save/load
- Move history display
- Dead stone marking
- Analysis mode
- Online multiplayer

## Credits

GO is an ancient board game that originated in China more than 2,500 years ago. This implementation follows standard international GO rules.

Enjoy playing!

