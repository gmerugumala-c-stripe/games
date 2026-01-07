# Pixel Falling Sand

A real-time pixel sandbox simulation with multiple interactive elements.

## Features

- **Multiple Elements**: Sand, Water, Stone, Acid, Fire, Wood, and Oil
- **Realistic Physics**: Each element has unique behaviors and interactions
- **Smooth Performance**: Optimized for thousands of particles
- **Interactive Painting**: Click and drag to spawn elements
- **Adjustable Brush Size**: From precise pixels to broad strokes

## Element Interactions

| Element | Behavior |
|---------|----------|
| **Sand** | Falls and piles up, displaces liquids |
| **Water** | Flows and spreads horizontally, extinguishes fire |
| **Stone** | Static, blocks movement |
| **Acid** | Dissolves stone and wood, flows like water |
| **Fire** | Rises, burns wood and oil, extinguished by water |
| **Wood** | Static, burns when touched by fire |
| **Oil** | Floats on water, highly flammable |

## Controls

- **Click & Drag**: Paint selected element
- **1-7 Keys**: Quick select elements
- **8 Key**: Eraser
- **Space**: Pause/Resume simulation
- **Brush Slider**: Adjust brush size

## How to Run

Simply open `index.html` in a modern web browser.

## Technical Details

- Pure JavaScript with HTML5 Canvas
- Uses direct pixel manipulation via ImageData for performance
- Alternating scan directions prevent directional bias
- Cellular automata approach for element physics

## Browser Support

Works best in modern browsers (Chrome, Firefox, Safari, Edge).

