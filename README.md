# JavaScript Comet

A lightweight JavaScript & HTML5 canvas demo that renders a glowing comet head with a particle‑based tail. The comet arcs across the screen, fades out before the edge, and respawns. A small control panel lets you tune emission, speed, arc height, particle lifetime, and more in real time.

## Features
- Glowing comet head with soft radial bloom
- Particle tail with randomized speed, spread, and lifetime
- Smooth arc trajectory across the viewport
- Head fade‑out before exiting the canvas
- Live control panel for quick tweaking

## Live Demo
- On CodePen: [https://codepen.io/melliatto/pen/VYjXjbV](https://codepen.io/melliatto/pen/VYjXjbV)
- You can also view a variation of this Comet integrated into the top Hero section of my [dev portfolio website](https://elliottprogrammer.com): [https://elliottprogrammer.com](https://elliottprogrammer.com)

## Getting Started
1. Clone the repo
2. Open `index.html` in your browser

That’s it! No build step required.

## Files
- `index.html` — full‑screen canvas and script included
- `style.css` — canvas + control panel css styling
- `main.js` — comet animation logic and control panel logic

## Customize
Adjust the sliders in the control panel to change:
- Head speed (px/sec)
- Head radius (px)
- Head glow (px)
- Arc height (screen frac)
- Emission rate (particles/sec)
- Tail spread (radians)
- Particle radius min (px)
- Particle radius max (px)
- Particle life min (sec)
- Particle life max (sec)
- Head fade start (progress)

### Author

[Bryan Elliott, AKA @elliottprogrammer](https://elliottprogrammer.com)

## License
MIT

**! Important !** - If you found this useful, please git it a Github Star! ⭐️
