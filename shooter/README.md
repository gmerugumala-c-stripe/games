# Target Blitz ULTRA - Shooting Gallery Game

A fast-paced, action-packed shooting gallery game with multiple weapons, power-ups, boss battles, and progressive difficulty!

## How to Play

1. Open `index.html` in a web browser
2. Select a game mode (Classic, Endless, or Survival)
3. Click "START MISSION" to begin
4. Shoot targets by clicking on them
5. Collect power-ups for special abilities
6. Defeat bosses every 2 waves
7. Aim for the center bullseye for critical hits!

## Game Modes

| Mode | Description |
|------|-------------|
| **Classic** | 60 seconds to get the highest score |
| **Endless** | No time limit - play until you want to stop |
| **Survival** | 3 lives - dodge boss projectiles to survive |

## Weapons

| Weapon | Damage | Fire Rate | Ammo | Special |
|--------|--------|-----------|------|---------|
| **Pistol** | 1 | Fast | 30 | Reliable all-rounder |
| **Shotgun** | 2 | Slow | 8 | 8-pellet spread pattern |
| **Rifle** | 3 | Medium | 15 | High precision, high damage |
| **SMG** | 1 | Rapid | 50 | Slight spread, fastest fire rate |

## Target Types

| Target | Points | Special |
|--------|--------|---------|
| **Standard (Blue)** | +10 | Basic target |
| **Fast (Purple)** | +25 | Moves faster, leaves trail |
| **Bonus (Gold)** | +50 | Sparkles, higher value |
| **Danger (Red)** | -30 | AVOID! 2 hits to destroy |
| **Explosive (Orange)** | +15 | Chain reaction explosions |
| **Ghost (Cyan)** | +40 | Phases in/out - only hittable when visible |
| **Split (Green)** | +20 | Splits into 2 smaller targets |
| **Armored (Gray)** | +35 | 4 health, takes multiple hits |

## Power-Ups

Power-ups drop randomly when destroying targets (15% chance).

| Power-Up | Icon | Effect | Duration |
|----------|------|--------|----------|
| **Multi-shot** | ⚡ | Fire 3x projectiles | 8 seconds |
| **Slow-mo** | ⏱️ | Slows down time | 5 seconds |
| **Rapid Fire** | 🔥 | 60% faster fire rate | 6 seconds |
| **Shield** | 🛡️ | Protection from boss attacks | 10 seconds |
| **2X Points** | 💎 | Double all points earned | 10 seconds |
| **Extra Time** | ⏰ | +10 seconds to clock | Instant |
| **Nuke** | 💥 | Destroys all positive targets | Instant |

## Boss Battles

- **Bosses appear every 2 waves** with increasing difficulty
- Feature a large health bar at the top of the screen
- Fire projectile patterns:
  - **Spread Shot** - 5 projectiles in a fan pattern
  - **Spiral** - 8 projectiles in a circular pattern
- Worth **500 × wave number** points when defeated
- Trigger screen shake and epic explosions on death

## Critical Hits

- Hit the **center bullseye** of any target for a critical hit!
- Critical hits deal **2x damage**
- Critical hits award **2x points**
- Special golden "CRITICAL!" popup appears
- Unique sound effect and particle explosion

## Wave System

- Game progresses through waves every 15 seconds
- Each wave increases:
  - Target speed (+20% per wave)
  - Spawn rate
  - Target variety (new types unlock at higher waves)
- Wave progress shown at bottom of arena
- Boss spawns at waves 2, 4, 6, etc.

## Controls

| Key | Action |
|-----|--------|
| **Click** | Shoot |
| **1** | Pistol |
| **2** | Shotgun |
| **3** | Rifle |
| **4** | SMG |
| **R** | Reload |
| **Space** | Start/Pause |

## Scoring System

- Base points depend on target type
- Combo multiplier increases with consecutive hits (max x15)
- Missing a shot resets your combo to x1
- Critical hits multiply points by 2x
- 2X Points power-up stacks with combo and critical
- High scores saved per game mode (local storage)

## Achievements

| Achievement | Requirement | Icon |
|-------------|-------------|------|
| First Blood | Get your first kill | 🎯 |
| Combo Master | Reach 5x combo | 🔥 |
| Unstoppable | Reach 10x combo | 💥 |
| Sharpshooter | 80% accuracy | 🎖️ |
| Boss Slayer | Defeat a boss | 👑 |
| Collector | Collect 5 power-ups | ⭐ |
| Point Hunter | Score 1000 points | 💰 |
| Point Master | Score 5000 points | 💎 |
| Survivor | Reach wave 5 | 🏆 |
| Precision | 10 critical hits | 🎯 |

## Visual Effects

- **Screen shake** on hits and explosions
- **Animated particles** in background
- **Trail effects** on fast and ghost targets
- **Pulsing crosshair** animation
- **Combo glow** effect at high combos
- **Slow-mo visual** border when active
- **Shield visual** dashed border protection
- **Muzzle flash** on every shot
- **Achievement popups** with animations

## Sound Effects

All sounds generated using Web Audio API:
- Shooting (per weapon)
- Hit confirmation
- Critical hit
- Explosions
- Power-up collection
- Boss entrance
- Achievement unlock
- Game over

## Tips & Strategy

- 🎯 **Aim for centers** - Critical hits are worth it!
- 💥 **Chain explosives** - Position shots to hit explosive targets near others
- 👻 **Time ghost shots** - Wait for them to become visible
- 🛡️ **Save shield for bosses** - Essential in Survival mode
- ⏱️ **Use slow-mo wisely** - Great for boss fights or tight situations
- 🔫 **Match weapons to targets**:
  - SMG for fast targets
  - Shotgun for clustered targets
  - Rifle for armored targets
- 💎 **Stack multipliers** - 2X Points + high combo + critical = massive scores!

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge).

---

Built with vanilla HTML5 Canvas, CSS3, JavaScript, and Web Audio API.
