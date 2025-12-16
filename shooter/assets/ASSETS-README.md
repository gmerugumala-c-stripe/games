# Custom Assets Guide

This folder contains custom icons, images, and assets for Target Blitz ULTRA.

## Folder Structure

```
assets/
├── icons/          # Weapon icons, UI icons
│   ├── pistol.png
│   ├── shotgun.png
│   ├── rifle.png
│   ├── smg.png
│   └── ...
├── targets/        # Custom target skins
│   ├── standard.png
│   ├── bonus.png
│   └── ...
└── ASSETS-README.md
```

## How to Use Custom Weapon Icons

### Step 1: Add your images
Place your icon images (PNG, SVG, or WebP recommended) in the `assets/icons/` folder.
- Recommended size: 48x48 pixels or larger
- Transparent background works best

### Step 2: Update index.html
Replace the emoji in the weapon button with an `<img>` tag:

**Before (emoji):**
```html
<div class="weapon-icon">💥</div>
```

**After (custom image):**
```html
<div class="weapon-icon">
    <img src="assets/icons/shotgun.png" alt="Shotgun">
</div>
```

### Step 3: Update styles.css (if needed)
Add these styles to ensure images display correctly:

```css
.weapon-icon img {
    width: 32px;
    height: 32px;
    object-fit: contain;
}
```

---

## Current Icon Locations in Code

### Weapon Icons (index.html)
| Weapon   | Line | Current Emoji |
|----------|------|---------------|
| Pistol   | 95   | 🔫            |
| Shotgun  | 103  | 💥            |
| Rifle    | 111  | 🎯            |
| SMG      | 119  | ⚡            |

### Target Legend Icons (index.html)
| Target    | Lines    | Description |
|-----------|----------|-------------|
| Standard  | 150-152  | CSS styled  |
| Fast      | 153-155  | CSS styled  |
| Bonus     | 156-158  | CSS styled  |
| Danger    | 159-161  | CSS styled  |
| Explosive | 162-164  | CSS styled  |
| Ghost     | 165-167  | CSS styled  |
| Split     | 168-170  | CSS styled  |
| Armored   | 171-173  | CSS styled  |

### Power-up Icons (index.html)
| Power-up    | Line | Current Emoji |
|-------------|------|---------------|
| Multi-shot  | 178  | ⚡            |
| Slow-mo     | 181  | ⏱️            |
| Rapid Fire  | 184  | 🔥            |
| 2X Points   | 187  | 💎            |
| Nuke        | 190  | 💥            |

### In-Game Rendered Icons (shooter.js)
These are rendered on the canvas and defined in JavaScript:

| Element        | Location (approx line) | How to Change |
|----------------|------------------------|---------------|
| Target visuals | 440-520                | Modify `draw()` method in Target class |
| Power-up icons | 850-900                | Modify `powerupTypes` object |
| Boss visuals   | 720-800                | Modify `draw()` method in Boss class |

---

## Emoji Alternatives

### Weapon Icons
| Weapon   | Option 1 | Option 2 | Option 3 | Option 4 |
|----------|----------|----------|----------|----------|
| Pistol   | 🔫       | 🎯       | 💢       | ⚫       |
| Shotgun  | 💥       | 🔥       | 💣       | ☄️       |
| Rifle    | 🎯       | 🏹       | ⭐       | 🔭       |
| SMG      | ⚡       | 💨       | 🌀       | ✨       |

### Stat Icons
| Stat     | Option 1 | Option 2 | Option 3 |
|----------|----------|----------|----------|
| Score    | 🎯       | 💰       | ⭐       |
| Time     | ⏱️       | ⌛       | 🕐       |
| Ammo     | 🔫       | 💊       | 🎱       |
| Combo    | 🔥       | 💥       | ⚡       |
| Wave     | 🌊       | 📊       | 📈       |
| Lives    | ❤️       | 💖       | 🩷       |

---

## Free Icon Resources

- [Game-icons.net](https://game-icons.net/) - Free game icons (CC BY 3.0)
- [Kenney.nl](https://kenney.nl/assets) - Free game assets
- [OpenGameArt.org](https://opengameart.org/) - Community game art
- [Flaticon](https://www.flaticon.com/) - Icons (attribution required)
- [Icons8](https://icons8.com/) - Icons (attribution required)

---

*Add your custom assets to make the game your own!*

