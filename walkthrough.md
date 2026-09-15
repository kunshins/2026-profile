# Studio Ghibli 3D Modern Portfolio Demo — Walkthrough

A whimsical, modern, and high-performance 3D portfolio demo inspired by the aesthetic, heart, and atmosphere of **Studio Ghibli** (Spirited Away, Howl's Moving Castle, My Neighbor Totoro, Laputa: Castle in the Sky).

Built with **Three.js**, **Vanilla JavaScript**, and **Vanilla CSS** with zero external audio or paid dependencies.

---

## What Was Built

### 1. Hero Section (Starts with Your Name)
- **Prominent Display**: Starts boldly with **Kunshi** accompanied by Japanese calligraphy (`薫志 • Creative Technologist & 3D Engineer`).
- **Interactive Badges**: Glowing spirit aura badge indicating availability for collaborations.
- **Time-of-Day Quick Switcher**:
  - ☀️ **Day (Totoro Meadow)**: Soft azure skies, sunny meadow greens, gentle cumulus clouds, and drifting sakura petals.
  - 🌅 **Golden Sunset (Howl's Valley)**: Warm amber & violet dusk skies, deep shadows, and twilight glow.
  - 🌙 **Starlit Night (Spirited Fireflies)**: Deep midnight indigo sky, glowing yellow-green bioluminescent fireflies, and an illuminated cottage lantern.
- **Personalization Button**: Includes an interactive **Customize Profile** modal to modify your display name, titles, or contact email on the fly!

### 2. 3D WebGL World (Three.js Engine)
- **Floating Sky Island**: Low-poly lush grassy knoll with instanced blades of grass that sway organically with the wind.
- **Low-Poly Windmill**: Animated wooden windmill with rotating lattice sails and an attached glowing lantern.
- **Anime Clouds**: Volumetric stylized cumulus clouds drifting continuously across the horizon.
- **Soot Sprite Companion (Susuwatari)**: A cute, fuzzy 3D soot sprite resting on the knoll whose eyes track your mouse cursor in real-time, blinks periodically, and does a joyful hop when clicked!
- **Scrollytelling Camera**: The camera smoothly glides and re-angles between cinematic viewpoints as you scroll down the page:
  - *Hero* (0.0): Wide panoramic vista of the floating island and windmill.
  - *About* (0.33): Closer warm camera angle focused on the lantern and story parchment.
  - *Projects* (0.66): Elevated high-angle sky view overlooking the horizon.
  - *Contact* (1.0): Cliffside overlook where the paper airplane awaits dispatch.

### 3. Procedural Ghibli Sound Engine (Web Audio API)
- **100% Free & Self-Contained**: No external audio files or broken CDNs.
- **Features**:
  - Joe Hisaishi-inspired pentatonic music box bell chimes on interactions.
  - Soft procedural ambient wind noise.
  - Paper airplane flight whoosh sound effect.
  - Accessible sound toggle in the navigation bar (starts muted by default).

### 4. Chapter 01: The Explorer’s Tale (About)
- **Parchment Aesthetics**: Glassmorphic frosted cards with gold foil accents and watercolor tints.
- **Journey Milestones**: Interactive timeline highlighting career accomplishments.
- **Craft Tags**: 3D & Creative Tech (Three.js, WebGL, GLSL Shaders, Web Audio) and Web Engineering.
- **Ghibli Philosophy Quote**: Inspired by *The Cat Returns*.

### 5. Chapter 02: Curated Expeditions (Projects)
- **6 Hand-Crafted Ghibli Showcase Projects**:
  1. *Laputa Sky Citadel* — Procedural Atmospheric Cloudscape
  2. *Calcifer's Radiant Hearth* — Real-Time Ember Particle Engine
  3. *Camphor Tree Sanctuary* — Interactive Painterly Grass Shaders
  4. *Sixth Station Water Railway* — Infinite Reflective Water Vista
  5. *Koriko Coastal Aviator* — Flight Dynamics & Horizon Glider
  6. *Kodama Whispering Glade* — Procedural Spirit Generative System
- **Interactive 3D Tilt**: Cards calculate mouse position and tilt dynamically with 3D perspective depth.
- **Deep-Dive Modal**: Clicking any card opens a detailed breakdown with architecture notes, key metrics, and an interactive simulation button.

### 6. Chapter 03: Valley Dispatch (Contact)
- **Vintage Ghibli Airmail Theme**: Styled as an enchanted postal letter with airmail edges and bird stamps.
- **Interactive 3D Paper Airplane Flight**: Submitting the form folds and launches a 3D low-poly paper airplane that soars across the 3D sky into the horizon accompanied by sound effects and festive confetti!
- **Direct Signals**: One-click email copy button with tooltip and quick links to GitHub & LinkedIn.

---

## Local Verification & Access

The development server is actively running locally:

```
URL: http://127.0.0.1:5173/
```

### Git & Security Verification
- **Company GitHub**: **Not connected, not touched, and not used.**
- `git remote -v` is empty. The project runs purely on your local machine with zero credentials or remote repositories configured.
