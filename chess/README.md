# ♔ Chess Game ♚

A fully functional chess game built with vanilla JavaScript, HTML, and CSS. Features a beautiful modern UI with complete chess rules implementation.

## Features

### Game Features
- ✅ Full chess rules implementation
- ✅ All piece movements (Pawn, Rook, Knight, Bishop, Queen, King)
- ✅ Special moves:
  - Castling (King-side and Queen-side)
  - En passant capture
  - Pawn promotion
- ✅ Check and checkmate detection
- ✅ Stalemate detection
- ✅ Move validation (prevents illegal moves)
- ✅ King safety (cannot move into check)

### UI Features
- 🎨 Beautiful gradient background
- 🎯 Interactive board with piece highlighting
- 📝 Move history tracker
- 👁️ Captured pieces display
- 🔄 Undo move functionality
- 🎵 Sound effects toggle
- 📱 Responsive design (mobile-friendly)
- ✨ Smooth animations and transitions

### Visual Feedback
- Selected piece highlighting
- Valid move indicators
- Last move highlighting
- King in check animation
- Capture indicators

## How to Play

1. **Starting a Game**
   - Open `index.html` in a web browser
   - White always moves first

2. **Making Moves**
   - Click on a piece to select it
   - Valid moves will be highlighted in blue
   - Click on a highlighted square to move
   - Captures are shown with a red circle indicator

3. **Special Moves**
   - **Castling**: Move the king two squares toward a rook (if conditions are met)
   - **En Passant**: Capture an opponent's pawn that just moved two squares
   - **Pawn Promotion**: When a pawn reaches the opposite end, choose a piece to promote to

4. **Game Controls**
   - **New Game**: Start a fresh game
   - **Undo Move**: Take back the last move
   - **Sound Toggle**: Enable/disable move sounds

## Chess Rules Implemented

### Piece Movements
- **Pawn**: Moves forward one square, two squares from starting position, captures diagonally
- **Rook**: Moves horizontally or vertically any number of squares
- **Knight**: Moves in an L-shape (2 squares in one direction, 1 square perpendicular)
- **Bishop**: Moves diagonally any number of squares
- **Queen**: Combines rook and bishop movements
- **King**: Moves one square in any direction

### Special Rules
- **Check**: When a king is under attack, the player must move out of check
- **Checkmate**: When a king is in check and has no legal moves to escape
- **Stalemate**: When a player has no legal moves but is not in check
- **Castling**: King and rook special move (both pieces must not have moved, no pieces between them, king not in check)
- **En Passant**: Special pawn capture move
- **Pawn Promotion**: Pawn becomes a queen, rook, bishop, or knight when reaching the opposite end

## Technical Details

### Files
- `index.html` - Game structure and layout
- `styles.css` - Styling and animations
- `chess.js` - Game logic and rules
- `README.md` - Documentation

### Technologies Used
- HTML5
- CSS3 (Flexbox, Grid, Animations)
- Vanilla JavaScript (ES6+)
- Web Audio API (for sound effects)

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Customization

### Changing Colors
Edit `styles.css` to customize:
- Board colors: `.square.light` and `.square.dark`
- Background gradient: `body` background
- Highlight colors: `.square.selected`, `.square.valid-move`

### Modifying Pieces
Edit `chess.js` to change:
- Piece symbols in the `PIECES` object
- Movement rules in various `get*Moves()` methods

## Future Enhancements

Possible additions:
- AI opponent (computer player)
- Timer/clock
- Game save/load
- Different board themes
- Multiplayer over network
- Chess notation export (PGN format)
- Opening book
- Move suggestions
- Game analysis

## License

Free to use and modify for personal and educational purposes.

## Credits

Created with ❤️ using modern web technologies.

---

Enjoy playing chess! ♟️

