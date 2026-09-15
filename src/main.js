import './style.css';
import { GhibliWorld } from './three/scene.js';
import { soundEngine } from './audio/ghibliSound.js';
import confetti from 'canvas-confetti';

// Project showcase data with Ghibli themes and tech depth
const projects = [
  {
    id: 'laputa-island',
    title: 'Laputa Sky Citadel',
    subtitle: 'Procedural Atmospheric Cloudscape',
    category: '3D Simulation',
    tags: ['Three.js', 'GLSL Shaders', 'WebAudio'],
    summary: 'An interactive floating fortress suspended inside an animated volumetric cloud blanket with dynamic weather shifts and physics.',
    fullDescription: 'Inspired by Laputa: Castle in the Sky, this project implements volumetric cloud ray-marching rendered in real-time at 60 FPS in WebGL. Includes dynamic lightning flashes during rain mode, procedural stone ruins covered in vegetation, and spatial wind sound synthesized through the Web Audio API.',
    previewGradient: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
    icon: '🏰',
    metrics: ['60 FPS', 'Zero textures', 'Raymarched clouds']
  },
  {
    id: 'howls-hearth',
    title: "Calcifer's Radiant Hearth",
    subtitle: 'Real-Time Ember Particle Engine',
    category: 'Interactive Shader',
    tags: ['WebGL', 'Particle Physics', 'Canvas'],
    summary: 'A warm, crackling interactive fire spirit simulation that responds to cursor velocity, microphone breathing, and mouse clicks.',
    fullDescription: "A loving homage to Howl's Moving Castle. Built using a custom GPU particle system simulating over 30,000 embers, dynamic flame turbulence using curl noise, and interactive flame morphing that blinks and expresses playful emotions when fed bacon and egg snacks.",
    previewGradient: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)',
    icon: '🔥',
    metrics: ['30,000 particles', 'Curl Noise', 'Audio reactive']
  },
  {
    id: 'totoro-meadow',
    title: "Camphor Tree Sanctuary",
    subtitle: 'Interactive Painterly Grass Shaders',
    category: 'Procedural Nature',
    tags: ['Three.js', 'Vertex Animation', 'Post-FX'],
    summary: 'Dense swaying meadow grass and lush giant forest canopy with painterly cel-shading reminiscent of Hayao Miyazaki backgrounds.',
    fullDescription: 'Features instanced blade rendering of 50,000 grass blades with wind distortion maps, custom toon shaders with hand-drawn ink contours, and nocturnal glowing firefly particles with soft depth of field effects.',
    previewGradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    icon: '🌿',
    metrics: ['50k blades', 'Cel-shaded', 'Custom Bloom']
  },
  {
    id: 'spirited-train',
    title: 'Sixth Station Water Railway',
    subtitle: 'Infinite Reflective Water Vista',
    category: 'Cinematic Experience',
    tags: ['Three.js', 'PBR Water', 'Audio Ambience'],
    summary: 'A contemplative voyage over endless mirror-like flooded railway tracks beneath a dreamy watercolor twilight sky.',
    fullDescription: 'Recreates the iconic flooded railway sequence from Spirited Away. Uses custom Fresnel reflection algorithms, animated low-amplitude water ripples, an antique steam locomotive model, and procedural train click-clack rhythms synchronized with ambient sea waves.',
    previewGradient: 'linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)',
    icon: '🚂',
    metrics: ['Fresnel Water', 'Cinematic Cam', 'Procedural Audio']
  },
  {
    id: 'kikis-delivery',
    title: 'Koriko Coastal Aviator',
    subtitle: 'Flight Dynamics & Horizon Flight',
    category: 'Mini 3D Game',
    tags: ['Physics', 'Game Loop', 'Three.js'],
    summary: 'Glide over a sun-drenched Mediterranean-style seaside town delivering packages while steering through gentle sea drafts.',
    fullDescription: 'A smooth gliding experience with realistic lift/drag flight aerodynamics, low-poly coastal architecture, procedural chimney smoke, and a loyal black cat companion riding along in the delivery basket.',
    previewGradient: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)',
    icon: '🧹',
    metrics: ['Aerodynamics', 'Collision system', 'Interactive Quest']
  },
  {
    id: 'mononoke-forest',
    title: 'Kodama Whispering Glade',
    subtitle: 'Procedural Spirit Generative System',
    category: 'Generative Art',
    tags: ['Audio Synthesis', 'WebGL', 'Animation'],
    summary: 'Enchanted ancient moss grove populated by bobble-headed tree spirits clicking and echoing in harmonic polyphony.',
    fullDescription: 'Explore an ancient cedar forest where procedural Kodama spirits peek out from behind mossy stones. Clicking on any spirit makes its head rattle with organic wood-block percussive resonance generated mathematically via the Web Audio synthesizer.',
    previewGradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    icon: '🪵',
    metrics: ['Polyphonic click', 'Subsurface scatter', 'Procedural foliage']
  }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D World Canvas
  const canvasContainer = document.getElementById('canvas-container');
  const world = new GhibliWorld(canvasContainer);

  // 2. Custom Cursor Tracking
  const cursor = document.getElementById('custom-cursor');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  const addHoverEffects = () => {
    const interactiveEls = document.querySelectorAll('button, a, input, textarea, .project-card, .milestone-item');
    interactiveEls.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovering');
        soundEngine.playChime(null, 0.4);
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovering');
      });
    });
  };

  // 3. Populate Project Cards
  const projectsContainer = document.getElementById('projects-container');
  projects.forEach((proj) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.id = proj.id;

    card.innerHTML = `
      <div class="project-visual" style="background: ${proj.previewGradient};">
        <div style="font-size: 3.6rem; transform: translateY(-5px);">${proj.icon}</div>
        <div class="project-visual-overlay">
          <span class="project-category-badge">${proj.category}</span>
        </div>
      </div>
      <div class="project-details">
        <h3 class="project-title">${proj.title}</h3>
        <p class="project-desc">${proj.summary}</p>
        <div class="project-footer">
          <div class="project-tags">
            ${proj.tags.map((t) => `<span class="tech-tag">${t}</span>`).join('')}
          </div>
          <button class="project-explore-btn" type="button">
            <span>Inspect</span>
            <span>→</span>
          </button>
        </div>
      </div>
    `;

    // 3D Tilt Effect on mousemove over card
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = -(y / (rect.height / 2)) * 6;
      const rotateY = (x / (rect.width / 2)) * 6;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });

    card.addEventListener('click', () => {
      openProjectModal(proj);
    });

    projectsContainer.appendChild(card);
  });

  addHoverEffects();

  // 4. Modal Interactions
  const projectModal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalContent = document.getElementById('modal-content');

  function openProjectModal(p) {
    soundEngine.playChime(659.25, 0.8);
    modalContent.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
        <span style="font-size: 2.8rem;">${p.icon}</span>
        <div>
          <span class="section-label">${p.category}</span>
          <h2 style="font-family: var(--font-display); font-size: 1.8rem; line-height: 1.2;">${p.title}</h2>
          <p style="color: var(--text-accent); font-family: var(--font-serif); font-size: 1.1rem; font-style: italic;">${p.subtitle}</p>
        </div>
      </div>

      <div style="background: ${p.previewGradient}; border-radius: 20px; height: 180px; display: flex; align-items: center; justify-content: center; color: white; margin-bottom: 1.5rem; font-size: 4rem; box-shadow: inset 0 0 30px rgba(0,0,0,0.2);">
        ${p.icon}
      </div>

      <h4 style="font-size: 1.1rem; margin-bottom: 0.6rem; color: var(--text-main);">Architecture & Technical Feat</h4>
      <p style="color: var(--text-muted); line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.02rem;">
        ${p.fullDescription}
      </p>

      <div style="display: flex; gap: 0.8rem; margin-bottom: 1.8rem; flex-wrap: wrap;">
        ${p.metrics.map(m => `
          <div style="background: var(--badge-bg); border: 1px solid var(--badge-border); padding: 0.5rem 1rem; border-radius: 12px; font-weight: 600; font-size: 0.88rem; color: var(--badge-text);">
            ⚡ ${m}
          </div>
        `).join('')}
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 1.5rem;">
        <div class="project-tags">
          ${p.tags.map(t => `<span class="tech-tag">${t}</span>`).join('')}
        </div>
        <button class="btn-primary" id="modal-interactive-action">
          <span>Explore Source Simulation</span>
          <span>⚡</span>
        </button>
      </div>
    `;

    projectModal.classList.add('open');

    document.getElementById('modal-interactive-action')?.addEventListener('click', () => {
      soundEngine.playChime(783.99, 1.2);
      showToast('Simulation loaded into workspace memory! 🌿');
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    });
  }

  function closeProjectModal() {
    projectModal.classList.remove('open');
  }

  modalCloseBtn.addEventListener('click', closeProjectModal);
  projectModal.addEventListener('click', (e) => {
    if (e.target === projectModal) closeProjectModal();
  });

  // 5. Scroll Timeline Sync with Three.js Camera
  function onScrollProgress() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollY / docHeight : 0;
    world.updateScroll(progress);

    // Active nav link highlight
    const sections = ['hero', 'about', 'projects', 'contact'];
    sections.forEach((secId) => {
      const el = document.getElementById(secId);
      const link = document.querySelector(`.nav-link[href="#${secId}"]`);
      if (el && link) {
        const top = el.offsetTop - 140;
        const bottom = top + el.offsetHeight;
        if (scrollY >= top && scrollY < bottom) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }

  window.addEventListener('scroll', onScrollProgress, { passive: true });
  onScrollProgress();

  // 6. Time of Day Switcher
  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedTheme = btn.dataset.time;
      themeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      document.body.setAttribute('data-theme', selectedTheme);
      world.setTheme(selectedTheme);
      soundEngine.playChime(523.25, 0.9);

      const themeNames = {
        day: 'Meadow Daybreak (Totoro)',
        sunset: "Golden Sunset (Howl's Valley)",
        night: 'Starlit Night (Spirited Fireflies)'
      };
      showToast(`Shifted to ${themeNames[selectedTheme]}`);
    });
  });

  // 7. Audio Toggle Engine
  const audioBtn = document.getElementById('audio-toggle-btn');
  const audioLabel = document.getElementById('audio-status-label');

  audioBtn.addEventListener('click', () => {
    const isPlaying = soundEngine.toggleMute();
    if (isPlaying) {
      audioBtn.classList.add('playing');
      audioLabel.textContent = 'Music Box On';
      showToast('Ghibli chimes & gentle wind enabled 🍃');
    } else {
      audioBtn.classList.remove('playing');
      audioLabel.textContent = 'Chimes Off';
      showToast('Sound muted');
    }
  });

  // 8. Contact Form Dispatch & 3D Airplane Flight
  const contactForm = document.getElementById('contact-form');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('sender-name');
    const senderName = nameInput.value.trim() || 'Fellow Traveler';

    // Play whoosh audio
    soundEngine.playWhoosh();

    // Trigger 3D Airplane
    world.launchPaperAirplane();

    // Launch celebratory sakura confetti
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.65 },
      colors: ['#ffb7b2', '#ffdac1', '#e2f0cb', '#b5ead7', '#c7ceea']
    });

    showToast(`Spirit letter sent! Safe voyage, ${senderName}! 🕊️✈️`);
    contactForm.reset();
  });

  // 9. Direct Email Copy Helper
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const displayEmail = document.getElementById('display-email');
  copyEmailBtn.addEventListener('click', () => {
    const email = displayEmail.textContent.trim();
    navigator.clipboard.writeText(email).then(() => {
      soundEngine.playChime(659.25, 0.6);
      showToast(`Copied ${email} to clipboard! 📋`);
    });
  });

  // 10. Profile Quick Personalization Modal
  const editProfileBtn = document.getElementById('edit-profile-btn');
  const profileModal = document.getElementById('profile-modal');
  const profileModalClose = document.getElementById('profile-modal-close');
  const profileCustomizerForm = document.getElementById('profile-customizer-form');
  const heroNameDisplay = document.getElementById('hero-name-display');
  const navBrandLink = document.querySelector('.brand-name');
  const inputCustomName = document.getElementById('input-custom-name');
  const inputCustomTitle = document.getElementById('input-custom-title');
  const inputCustomEmail = document.getElementById('input-custom-email');

  editProfileBtn.addEventListener('click', () => {
    profileModal.classList.add('open');
    soundEngine.playChime(587.33, 0.6);
  });

  profileModalClose.addEventListener('click', () => {
    profileModal.classList.remove('open');
  });

  profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) profileModal.classList.remove('open');
  });

  profileCustomizerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newName = inputCustomName.value.trim();
    const newTitle = inputCustomTitle.value.trim();
    const newEmail = inputCustomEmail.value.trim();

    if (newName) {
      heroNameDisplay.textContent = newName;
      if (navBrandLink) navBrandLink.textContent = newName;
      document.title = `${newName} — 3D Portfolio & Creative Realm`;
    }
    if (newTitle) {
      document.querySelector('.hero-kanji-sub').textContent = newTitle;
    }
    if (newEmail) {
      displayEmail.textContent = newEmail;
    }

    profileModal.classList.remove('open');
    soundEngine.playChimeSequence();
    showToast('Portfolio details updated gracefully! ✨');
  });

  // 11. Toast System
  const toastEl = document.getElementById('toast-message');
  const toastText = document.getElementById('toast-text');
  let toastTimer = null;

  function showToast(msg) {
    if (!toastEl) return;
    toastText.textContent = msg;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3600);
  }
});
