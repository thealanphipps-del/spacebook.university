/**
 * ============================================================================
 * SPACE.UNIVERSITY — PROFESSOR RABBIT WARREN 3D WEBGL & NEURAL LIP-SYNC ENGINE
 * Engine ID: PROFESSOR-RABBIT-3D-WEBGL-V3 (Three.js r128 + WebAudio Formant DSP)
 * ============================================================================
 * Features:
 *  1. Dynamic Three.js r128 Loader with automatic 3D Perspective Canvas2D
 *     Software Projection Fallback if CDN is unreachable.
 *  2. Full 3D Articulated Professor Rabbit Warren Character (THREE.Group):
 *     - Sculpted lagomorph head, plush silver-white fur, 3 Hz twitching pink nose,
 *       whiskers, 3D cheeks, articulated lower jaw (jawPivot) & 7-viseme mouth
 *       morphs (REST, A, E, I, O, U, M), blinking eyes with corneal glint,
 *       expressive eyebrows, and gold-rimmed academic spectacles.
 *     - Spring-damper articulated 3D rabbit ears (leftEarPivot, rightEarPivot).
 *     - Emerald-and-charcoal tweed professorial jacket, gold-buttoned waistcoat,
 *       crimson bow tie, mortarboard cap with gold tassel, articulated shoulders,
 *       elbows, paws, and glowing cyan/emerald 3D laser-chalk pointer wand.
 *     - 3D Lecture Amphitheater: mahogany/obsidian podium with Space.University
 *       seal, 3D framed chalkboard with dynamic CanvasTexture, floating dust
 *       motes, and 3D Hologram Pedestal.
 *  3. Real-Time Neural Human Voice Synthesis + 60 FPS Formant Lip-Sync:
 *     - Primary: GET /api/v1/professor-rabbit/tts?text=...&voice=... wired into
 *       WebAudio AudioContext + AnalyserNode (fftSize=512) extracting F1 (200-900Hz
 *       jaw opening), F2 (900-2800Hz lip spread/round), and RMS volume at 60 FPS.
 *     - Secondary Fallback: Highest-quality Natural/Neural window.speechSynthesis
 *       voices (Microsoft Ryan/Guy/Christopher Online Natural, Google UK Male,
 *       Daniel) with boundary phoneme/viseme timeline synchronization.
 * ============================================================================
 */
(function (global) {
  'use strict';

  var THREE_CDN_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  var threeLoadPromise = null;

  var VISEME_TABLE = {
    REST: { jawOpen: 0.04, lipWidth: 0.52, lipRound: 0.10, tongueLift: 0.10, whiskerFlare: 0.02, f1Hz: 300, f2Hz: 1000 },
    A:    { jawOpen: 0.88, lipWidth: 0.78, lipRound: 0.18, tongueLift: 0.22, whiskerFlare: 0.65, f1Hz: 750, f2Hz: 1200 },
    E:    { jawOpen: 0.52, lipWidth: 0.92, lipRound: 0.12, tongueLift: 0.55, whiskerFlare: 0.45, f1Hz: 530, f2Hz: 1850 },
    I:    { jawOpen: 0.34, lipWidth: 0.98, lipRound: 0.08, tongueLift: 0.78, whiskerFlare: 0.32, f1Hz: 270, f2Hz: 2300 },
    O:    { jawOpen: 0.76, lipWidth: 0.40, lipRound: 0.88, tongueLift: 0.30, whiskerFlare: 0.80, f1Hz: 570, f2Hz: 840  },
    U:    { jawOpen: 0.44, lipWidth: 0.32, lipRound: 0.95, tongueLift: 0.45, whiskerFlare: 0.55, f1Hz: 300, f2Hz: 870  },
    M:    { jawOpen: 0.01, lipWidth: 0.60, lipRound: 0.25, tongueLift: 0.15, whiskerFlare: 0.18, f1Hz: 250, f2Hz: 900  }
  };

  var POSE_PRESETS = {
    CHALKBOARD_WRITING: {
      label: 'Chalkboard Derivation',
      earLeftDeg: -8,
      earRightDeg: 12,
      headPitch: -0.06,
      headYaw: -0.22,
      headRoll: 0.03,
      rightShoulderPitch: -0.78,
      rightShoulderYaw: -0.45,
      rightElbowBend: 0.95,
      leftShoulderPitch: -0.22,
      leftShoulderYaw: 0.18,
      leftElbowBend: 0.55,
      browLift: 0.25,
      wandColor: 0x22d3ee,
      wandHex: '#22d3ee'
    },
    EUREKA_POINTER: {
      label: 'Eureka Laser Pointer',
      earLeftDeg: -2,
      earRightDeg: 2,
      headPitch: -0.10,
      headYaw: 0.20,
      headRoll: -0.04,
      rightShoulderPitch: -1.05,
      rightShoulderYaw: 0.42,
      rightElbowBend: 0.35,
      leftShoulderPitch: -0.35,
      leftShoulderYaw: -0.15,
      leftElbowBend: 0.75,
      browLift: 0.68,
      wandColor: 0xfde047,
      wandHex: '#fde047'
    },
    SOCRATIC_THINKING: {
      label: 'Socratic Spectacle Adjust',
      earLeftDeg: -15,
      earRightDeg: 6,
      headPitch: 0.08,
      headYaw: 0.08,
      headRoll: 0.10,
      rightShoulderPitch: -0.42,
      rightShoulderYaw: 0.15,
      rightElbowBend: 0.85,
      leftShoulderPitch: -0.95,
      leftShoulderYaw: -0.35,
      leftElbowBend: 1.28,
      browLift: 0.42,
      wandColor: 0xd8b4fe,
      wandHex: '#d8b4fe'
    },
    QUARANTINE_WARNING: {
      label: 'Gate G3 / § 9-108(c) Alert',
      earLeftDeg: 4,
      earRightDeg: -4,
      headPitch: -0.02,
      headYaw: 0.0,
      headRoll: 0.0,
      rightShoulderPitch: -0.88,
      rightShoulderYaw: -0.10,
      rightElbowBend: 0.60,
      leftShoulderPitch: -0.85,
      leftShoulderYaw: 0.15,
      leftElbowBend: 0.65,
      browLift: 0.88,
      wandColor: 0xf43f5e,
      wandHex: '#f43f5e'
    },
    UCC_JURISPRUDENCE: {
      label: 'UCC Article 9 Statutory Triad',
      earLeftDeg: -5,
      earRightDeg: 7,
      headPitch: -0.04,
      headYaw: 0.28,
      headRoll: -0.03,
      rightShoulderPitch: -0.92,
      rightShoulderYaw: 0.52,
      rightElbowBend: 0.42,
      leftShoulderPitch: -0.48,
      leftShoulderYaw: 0.22,
      leftElbowBend: 0.88,
      browLift: 0.55,
      wandColor: 0x34d399,
      wandHex: '#34d399'
    }
  };

  var CAMERA_PRESETS = {
    FRONT_LECTURE:    { pos: [0.0, 1.45, 4.35], target: [0.0, 1.15, 0.0], fov: 42, label: 'Front Lecture' },
    CLOSEUP_PORTRAIT: { pos: [-0.25, 1.68, 2.35], target: [-0.30, 1.52, 0.0], fov: 36, label: 'Closeup Portrait' },
    CHALKBOARD_FOCUS: { pos: [-0.45, 1.62, 3.65], target: [-0.65, 1.55, -1.25], fov: 40, label: 'Chalkboard Focus' },
    HOLOGRAM_FOCUS:   { pos: [1.15, 1.50, 3.10], target: [1.35, 1.25, 0.15], fov: 38, label: 'Hologram Focus' },
    ORBIT_FREE:       { pos: [0.65, 1.65, 4.20], target: [0.0, 1.20, -0.20], fov: 44, label: '3D Orbit Free' }
  };

  var NEURAL_VOICES = [
    { id: 'en-GB-RyanNeural',        label: 'Prof. Ryan Neural (UK Dean)' },
    { id: 'en-US-ChristopherNeural', label: 'Prof. Christopher Neural (US Jurisprudence)' },
    { id: 'en-US-GuyNeural',         label: 'Prof. Guy Neural (US Biophysics)' }
  ];

  var LATTICE_DATA = {
    KIRCHHOFF_1AKI: {
      title: 'Hen Egg-White Lysozyme (1AKI • Tier A κ=1.45)',
      subtitle: 'ν₁ = 0.184 THz • R² = 0.8199 • Globular Isotropic',
      nodes: [
        [-0.65, -0.30, -0.20, 0.20, 'K1'],
        [-0.45,  0.40, -0.10, 0.40, 'E35'],
        [-0.20,  0.65,  0.25, 0.70, 'D52'],
        [ 0.10,  0.50,  0.45, 0.50, 'W62'],
        [ 0.45,  0.35,  0.15, 0.30, 'C76'],
        [ 0.65, -0.10, -0.25, 0.60, 'D87'],
        [ 0.40, -0.55, -0.35, 0.80, 'N103'],
        [ 0.05, -0.65,  0.10, 0.40, 'A110'],
        [-0.35, -0.50,  0.30, 0.30, 'W123'],
        [ 0.00,  0.05,  0.00, 0.10, 'CORE']
      ],
      edges: [
        [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,0],
        [0,9],[2,9],[4,9],[6,9],[8,9],[1,8],[3,6]
      ]
    },
    KIRCHHOFF_4AKE: {
      title: 'Adenylate Kinase Open Apo (4AKE • Tier B κ=2.85)',
      subtitle: 'Apo→Holo Δλ₁ = +49.02% (p=4.88×10⁻⁴) • ANM r=0.9418',
      nodes: [
        [-0.85,  0.55, -0.15, 0.95, 'LID-128'],
        [-0.65,  0.20,  0.20, 0.75, 'LID-142'],
        [-0.40, -0.15, -0.10, 0.40, 'HNG-115'],
        [-0.10, -0.45,  0.05, 0.15, 'CORE-15'],
        [ 0.00, -0.55,  0.00, 0.10, 'PLP-18'],
        [ 0.15, -0.40, -0.05, 0.20, 'CORE-82'],
        [ 0.40, -0.10,  0.15, 0.45, 'HNG-58'],
        [ 0.65,  0.25, -0.20, 0.80, 'NMP-42'],
        [ 0.85,  0.60,  0.10, 0.98, 'NMP-50'],
        [ 0.00,  0.10,  0.00, 0.30, 'CAT-R88']
      ],
      edges: [
        [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],
        [2,9],[6,9],[3,5],[0,2],[6,8]
      ]
    },
    KIRCHHOFF_5O3L: {
      title: 'Alzheimer\'s Tau PHF Fibril (5O3L • Tier C κ=5.40)',
      subtitle: 'Cross-Beta Fibrillar Stack • Gate 3 Boundary κ > 4.0',
      nodes: [
        [-0.90, -0.15, -0.20, 0.90, 'V306'],
        [-0.65,  0.18, -0.15, 0.75, 'I308'],
        [-0.40, -0.18, -0.10, 0.60, 'Y310'],
        [-0.15,  0.18, -0.05, 0.45, 'K317'],
        [ 0.10, -0.18,  0.00, 0.40, 'S324'],
        [ 0.35,  0.18,  0.05, 0.55, 'H330'],
        [ 0.60, -0.18,  0.10, 0.70, 'V339'],
        [ 0.85,  0.18,  0.15, 0.88, 'F346'],
        [-0.52,  0.00,  0.25, 0.65, 'R349'],
        [ 0.48,  0.00, -0.25, 0.65, 'K375']
      ],
      edges: [
        [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],
        [1,8],[2,8],[5,9],[6,9],[0,2],[2,4],[4,6],[1,3],[3,5],[5,7]
      ]
    },
    UCC_ARTICLE_9: {
      title: 'UCC Article 9 Statutory Triad & Priority Hypergraph',
      subtitle: '§ 9-203 Attachment ∧ § 9-310 Perfection ⟹ § 9-322 / § 9-324 Priority',
      nodes: [
        [ 0.00,  0.68,  0.00, 0.15, 'Attachment § 9-203'],
        [-0.68, -0.18,  0.22, 0.45, 'Perfection § 9-310'],
        [ 0.68, -0.18,  0.22, 0.82, 'Priority § 9-322'],
        [ 0.58,  0.48, -0.28, 0.95, 'PMSI Superpriority § 9-324'],
        [-0.62,  0.48, -0.25, 0.32, 'Debtor Location § 9-307'],
        [-0.38, -0.68, -0.12, 0.60, 'SSL Search Logic § 9-506'],
        [ 0.38, -0.68, -0.12, 0.72, 'MTSTA Sovereign Compact']
      ],
      edges: [
        [0,1],[1,2],[2,0],
        [0,4],[1,4],[1,5],[5,2],
        [2,3],[1,3],[0,3],
        [2,6],[1,6],[5,6]
      ]
    },
    JACOBS_LADDER_5D: {
      title: 'Sovereign 49×49×6 Context Cube • 10 Polymorph Roots',
      subtitle: 'Lemma 4.1: 27²⁷ = (27⁹)³ • 66 Leaves → 7 Trunks → 10 Roots',
      nodes: [
        [ 0.00,  0.00,  0.00, 0.98, 'INV-POLY-001 Provenance'],
        [ 0.55,  0.00,  0.00, 0.20, 'F0: Core Infra'],
        [-0.55,  0.00,  0.00, 0.40, 'F1: Telemetry'],
        [ 0.00,  0.55,  0.00, 0.60, 'F2: Settlement'],
        [ 0.00, -0.55,  0.00, 0.75, 'F3: Neural ML'],
        [ 0.00,  0.00,  0.55, 0.90, 'F4: Risk Guard'],
        [ 0.00,  0.00, -0.55, 0.35, 'F5: Observatory HUD'],
        [ 0.42,  0.42,  0.42, 0.50, 'INV-BIOPHYS-001'],
        [-0.42,  0.42, -0.42, 0.65, 'RULE-VI-26 Parity'],
        [ 0.42, -0.42, -0.42, 0.85, 'RFC-8785 Merkle']
      ],
      edges: [
        [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],
        [1,3],[3,2],[2,4],[4,1],
        [1,5],[5,2],[2,6],[6,1],
        [3,5],[5,4],[4,6],[6,3],
        [0,7],[0,8],[0,9],[7,3],[8,2],[9,6]
      ]
    }
  };

  function ensureThreeLoaded() {
    if (global.THREE && global.THREE.WebGLRenderer) {
      return Promise.resolve(global.THREE);
    }
    if (threeLoadPromise) {
      return threeLoadPromise;
    }
    threeLoadPromise = new Promise(function (resolve) {
      if (typeof document === 'undefined') {
        resolve(null);
        return;
      }
      var existing = document.querySelector('script[data-professor-rabbit-three="r128"]');
      if (existing) {
        existing.addEventListener('load', function () { resolve(global.THREE || null); });
        existing.addEventListener('error', function () { resolve(null); });
        return;
      }
      var script = document.createElement('script');
      script.src = THREE_CDN_URL;
      script.async = true;
      script.setAttribute('data-professor-rabbit-three', 'r128');
      var timeoutId = setTimeout(function () {
        resolve(global.THREE || null);
      }, 4500);
      script.onload = function () {
        clearTimeout(timeoutId);
        resolve(global.THREE || null);
      };
      script.onerror = function () {
        clearTimeout(timeoutId);
        resolve(null);
      };
      document.head.appendChild(script);
    });
    return threeLoadPromise;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function charToViseme(ch) {
    var c = (ch || '').toUpperCase();
    if ('AAÁÀÂÄ'.indexOf(c) !== -1) return 'A';
    if ('EÉÈÊËY'.indexOf(c) !== -1) return 'E';
    if ('IÍÌÎÏ'.indexOf(c) !== -1) return 'I';
    if ('OÓÒÔÖ'.indexOf(c) !== -1) return 'O';
    if ('UÚÙÛÜW'.indexOf(c) !== -1) return 'U';
    if ('MBPFV'.indexOf(c) !== -1) return 'M';
    if ('CDGJKNSXZ'.indexOf(c) !== -1) return 'I';
    if ('LRT'.indexOf(c) !== -1) return 'E';
    if ('HQ'.indexOf(c) !== -1) return 'O';
    return 'REST';
  }

  function textToVisemeTimeline(text) {
    var clean = String(text || '').replace(/\s+/g, ' ').trim();
    var timeline = [];
    var tMs = 0;
    for (var i = 0; i < clean.length; i++) {
      var ch = clean[i];
      if (ch === ' ' || ch === ',' || ch === ';' || ch === ':' || ch === '.' || ch === '!' || ch === '?') {
        var pauseDur = (ch === '.' || ch === '!' || ch === '?') ? 160 : (ch === ' ' ? 42 : 95);
        timeline.push({ tMs: tMs, durMs: pauseDur, viseme: 'REST', charIndex: i });
        tMs += pauseDur;
      } else {
        var v = charToViseme(ch);
        var dur = ('AEIOU'.indexOf(v) !== -1) ? 62 : 48;
        timeline.push({ tMs: tMs, durMs: dur, viseme: v, charIndex: i });
        tMs += dur;
      }
    }
    timeline.push({ tMs: tMs, durMs: 120, viseme: 'REST', charIndex: clean.length });
    return timeline;
  }

  function classifyFormantViseme(f1Hz, f2Hz, rms) {
    if (rms < 0.018) {
      return 'REST';
    }
    if (rms < 0.042 && f1Hz < 310) {
      return 'M';
    }
    if (f1Hz > 600) {
      return f2Hz < 1050 ? 'O' : 'A';
    }
    if (f1Hz >= 430 && f1Hz <= 600) {
      return f2Hz > 1400 ? 'E' : 'O';
    }
    if (f2Hz > 1800) {
      return 'I';
    }
    if (f2Hz < 1050) {
      return 'U';
    }
    return 'E';
  }

  function fiedlerColorHex(u1) {
    var t = clamp(u1, 0, 1);
    if (t < 0.45) {
      return 0x22d3ee; // Cyan
    } else if (t < 0.75) {
      return 0x34d399; // Emerald
    } else if (t < 0.90) {
      return 0xfbbf24; // Amber
    }
    return 0xf43f5e;   // Rose
  }

  function fiedlerColorCss(u1) {
    var t = clamp(u1, 0, 1);
    if (t < 0.45) return '#22d3ee';
    if (t < 0.75) return '#34d399';
    if (t < 0.90) return '#fbbf24';
    return '#f43f5e';
  }

  function makeTextSprite(THREE, text, colorCss) {
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 96;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(7, 13, 25, 0.84)';
    ctx.strokeStyle = colorCss || '#22d3ee';
    ctx.lineWidth = 3;
    var r = 16;
    var x = 12, y = 12, w = 488, h = 72;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 26px "JetBrains Mono", "Segoe UI", monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(text || '').slice(0, 32), 256, 48);

    var tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    var sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.85, 0.16, 1);
    return sprite;
  }

  /**
   * ==========================================================================
   * PROFESSOR RABBIT 3D INSTANCE CLASS
   * ==========================================================================
   */
  function ProfessorRabbitInstance(container, options) {
    this.container = container;
    this.options = Object.assign({
      initialPose: 'UCC_JURISPRUDENCE',
      initialHologram: 'UCC_ARTICLE_9',
      initialCamera: 'FRONT_LECTURE',
      initialVoice: 'en-GB-RyanNeural',
      showHUD: true,
      chalkboardTitle: 'SC-COMM-301 • UCC ARTICLE 9 & KIRCHHOFF BIOPHYSICS',
      chalkboardEquation: '§ 9-203 Attachment ∧ § 9-310 Perfection ⟹ § 9-322 / § 9-324 Priority',
      chalkboardBullets: [
        '1. Attachment (§ 9-203): Value + Debtor Rights + Authenticated Security Agreement (§ 9-108)',
        '2. Perfection (§ 9-310 / § 9-503): Exact Public Organic Record Name (Standard Search Logic § 9-506)',
        '3. Biophysics Scaling Law (N=1,040): ν₁(THz) = 0.42338·(⟨z⟩/R_g)^1.1194 [R² = 0.8048]',
        '4. Epistemic Governance (RULE-VI-27): Octave-Folded R² = 0.06% Null Control Disclosed'
      ]
    }, options || {});

    this.poseName = this.options.initialPose;
    this.hologramMode = this.options.initialHologram;
    this.cameraPreset = this.options.initialCamera;
    this.voiceId = this.options.initialVoice;

    this.chalkboardState = {
      title: this.options.chalkboardTitle,
      equation: this.options.chalkboardEquation,
      bullets: this.options.chalkboardBullets.slice()
    };

    // Lip-sync & formant state
    this.currentViseme = 'REST';
    this.jawOpen = 0.04;
    this.lipWidth = 0.52;
    this.lipRound = 0.10;
    this.tongueLift = 0.10;
    this.whiskerFlare = 0.02;
    this.f1Hz = 300;
    this.f2Hz = 1000;
    this.rmsVolume = 0.0;
    this.isSpeaking = false;
    this.isPaused = false;
    this.speechEngineLabel = 'READY (Neural TTS + WebAudio)';

    // Spring-damper ear physics
    this.earPhysics = {
      leftAngle: 0,
      leftVel: 0,
      rightAngle: 0,
      rightVel: 0
    };

    // Orbit camera spherical state
    this.orbit = {
      isDragging: false,
      lastX: 0,
      lastY: 0,
      theta: 0.0,
      phi: 0.18,
      radius: 4.35,
      targetX: 0.0,
      targetY: 1.15,
      targetZ: 0.0,
      camX: 0.0,
      camY: 1.45,
      camZ: 4.35
    };

    // FPS tracking
    this.fps = 60;
    this._frameCount = 0;
    this._lastFpsTime = performance.now();
    this._startTime = performance.now();
    this._destroyed = false;

    // Audio / TTS state
    this.audioCtx = null;
    this.analyser = null;
    this.freqData = null;
    this.timeData = null;
    this.audioEl = null;
    this.mediaSource = null;
    this.activeVisemeTimeline = [];
    this.speechStartPerf = 0;
    this.activeUtterance = null;
    this.speechCallbacks = {};

    this._initDOM();
    this._initThreeOrFallback();
  }

  ProfessorRabbitInstance.prototype._initDOM = function () {
    this.container.innerHTML = '';
    var computedPos = global.getComputedStyle(this.container).position;
    if (!computedPos || computedPos === 'static') {
      this.container.style.position = 'relative';
    }
    this.container.style.overflow = 'hidden';
    if (!this.container.style.minHeight && this.container.clientHeight < 120) {
      this.container.style.minHeight = '440px';
    }

    this.viewportWrap = document.createElement('div');
    this.viewportWrap.style.cssText = 'position:relative;width:100%;height:100%;min-height:inherit;background:radial-gradient(circle at 50% 28%, #132238 0%, #070d19 72%, #040811 100%);user-select:none;';
    this.container.appendChild(this.viewportWrap);

    this.canvasMount = document.createElement('div');
    this.canvasMount.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;cursor:grab;';
    this.viewportWrap.appendChild(this.canvasMount);

    // Chalkboard offscreen canvas (used both for Three.js CanvasTexture & fallback)
    this.chalkboardCanvas = document.createElement('canvas');
    this.chalkboardCanvas.width = 1024;
    this.chalkboardCanvas.height = 512;
    this._renderChalkboardCanvas();

    if (this.options.showHUD !== false) {
      this._buildOverlayHUD();
    }

    this._bindPointerOrbit();

    var self = this;
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(function () {
        self._onResize();
      });
      this.resizeObserver.observe(this.viewportWrap);
    }
    this._boundWinResize = function () { self._onResize(); };
    global.addEventListener('resize', this._boundWinResize);
  };

  ProfessorRabbitInstance.prototype._buildOverlayHUD = function () {
    var self = this;

    // Top telemetry badge bar
    this.topHud = document.createElement('div');
    this.topHud.style.cssText = [
      'position:absolute;top:10px;left:12px;right:12px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;',
      'pointer-events:none;z-index:12;font-family:"JetBrains Mono","Inter",monospace;font-size:11px;color:#e2e8f0;'
    ].join('');

    this.telemetryBadge = document.createElement('div');
    this.telemetryBadge.style.cssText = [
      'display:flex;align-items:center;gap:10px;padding:5px 10px;border-radius:8px;',
      'background:rgba(7,13,25,0.82);border:1px solid rgba(34,211,238,0.35);backdrop-filter:blur(6px);pointer-events:auto;'
    ].join('');
    this.telemetryBadge.innerHTML = [
      '<span style="display:inline-flex;align-items:center;gap:5px;color:#34d399;font-weight:700;">',
      '  <span class="pr3d-dot" style="width:8px;height:8px;border-radius:50%;background:#34d399;box-shadow:0 0 8px #34d399;display:inline-block;"></span>',
      '  <span class="pr3d-fps">60 FPS</span>',
      '</span>',
      '<span style="color:#64748b;">|</span>',
      '<span>VISEME: <strong class="pr3d-viseme" style="color:#22d3ee;">REST</strong></span>',
      '<span style="color:#64748b;">|</span>',
      '<span class="pr3d-formants" style="color:#cbd5e1;">F1: 300Hz • F2: 1000Hz • RMS: 0.00</span>',
      '<span style="color:#64748b;">|</span>',
      '<span class="pr3d-engine-status" style="color:#fde047;">3D WebGL r128</span>'
    ].join('');
    this.topHud.appendChild(this.telemetryBadge);

    // Quick audio control pill on top-right
    this.voiceStatusPill = document.createElement('div');
    this.voiceStatusPill.style.cssText = [
      'display:flex;align-items:center;gap:6px;padding:4px 9px;border-radius:8px;',
      'background:rgba(7,13,25,0.82);border:1px solid rgba(168,85,247,0.38);backdrop-filter:blur(6px);pointer-events:auto;'
    ].join('');

    var btnDemoSpeak = document.createElement('button');
    btnDemoSpeak.type = 'button';
    btnDemoSpeak.textContent = '🔊 Lecture Brief';
    btnDemoSpeak.style.cssText = 'background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border:none;border-radius:5px;padding:3px 8px;font-size:11px;font-weight:600;cursor:pointer;';
    btnDemoSpeak.onclick = function () {
      self.speak(
        'Welcome to Space University! I am Dean Professor Rabbit Warren. Observe my 3D holographic triad and chalkboard: under Uniform Commercial Code Article 9, Attachment under Section 9-203, Perfection under Section 9-310 with Standard Search Logic under Section 9-506, and Purchase-Money Priority under Section 9-324 govern commercial security interests, while our 3D Kirchhoff Laplacian governs macromolecular vibrations!',
        { pose: 'UCC_JURISPRUDENCE' }
      );
    };

    var btnStopSpeak = document.createElement('button');
    btnStopSpeak.type = 'button';
    btnStopSpeak.textContent = '⏹ Stop';
    btnStopSpeak.style.cssText = 'background:rgba(244,63,94,0.2);color:#fda4af;border:1px solid rgba(244,63,94,0.45);border-radius:5px;padding:3px 7px;font-size:11px;cursor:pointer;';
    btnStopSpeak.onclick = function () {
      self.stop();
    };

    this.voiceStatusPill.appendChild(btnDemoSpeak);
    this.voiceStatusPill.appendChild(btnStopSpeak);
    this.topHud.appendChild(this.voiceStatusPill);
    this.viewportWrap.appendChild(this.topHud);

    // Bottom interactive control strip
    this.bottomHud = document.createElement('div');
    this.bottomHud.style.cssText = [
      'position:absolute;bottom:10px;left:12px;right:12px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;',
      'padding:7px 10px;border-radius:10px;background:rgba(7,13,25,0.84);border:1px solid rgba(56,189,248,0.28);',
      'backdrop-filter:blur(8px);z-index:12;font-family:"Inter","Segoe UI",sans-serif;font-size:11px;color:#e2e8f0;'
    ].join('');

    var selectStyle = 'background:#0f172a;color:#38bdf8;border:1px solid rgba(56,189,248,0.35);border-radius:5px;padding:3px 6px;font-size:11px;outline:none;cursor:pointer;';

    // Camera Preset Selector
    var camWrap = document.createElement('label');
    camWrap.style.cssText = 'display:inline-flex;align-items:center;gap:5px;';
    camWrap.innerHTML = '<span style="color:#94a3b8;font-weight:600;">🎥 Camera:</span>';
    this.camSelect = document.createElement('select');
    this.camSelect.style.cssText = selectStyle;
    Object.keys(CAMERA_PRESETS).forEach(function (k) {
      var opt = document.createElement('option');
      opt.value = k;
      opt.textContent = CAMERA_PRESETS[k].label;
      if (k === self.cameraPreset) opt.selected = true;
      self.camSelect.appendChild(opt);
    });
    this.camSelect.onchange = function () {
      self.setCameraPreset(self.camSelect.value);
    };
    camWrap.appendChild(this.camSelect);

    // Hologram Mode Selector
    var holoWrap = document.createElement('label');
    holoWrap.style.cssText = 'display:inline-flex;align-items:center;gap:5px;';
    holoWrap.innerHTML = '<span style="color:#94a3b8;font-weight:600;">🔮 Hologram:</span>';
    this.holoSelect = document.createElement('select');
    this.holoSelect.style.cssText = selectStyle;
    [
      { id: 'UCC_ARTICLE_9',    label: 'UCC Art. 9 Statutory Triad' },
      { id: 'KIRCHHOFF_1AKI',   label: 'Kirchhoff 1AKI (Lysozyme Tier A)' },
      { id: 'KIRCHHOFF_4AKE',   label: 'Kirchhoff 4AKE (AdK Hinge Tier B)' },
      { id: 'KIRCHHOFF_5O3L',   label: 'Kirchhoff 5O3L (Tau PHF Tier C)' },
      { id: 'JACOBS_LADDER_5D', label: 'Jacob\'s Ladder 5D Context Cube' }
    ].forEach(function (item) {
      var opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.label;
      if (item.id === self.hologramMode) opt.selected = true;
      self.holoSelect.appendChild(opt);
    });
    this.holoSelect.onchange = function () {
      self.setHologramMode(self.holoSelect.value);
    };
    holoWrap.appendChild(this.holoSelect);

    // Pose Selector
    var poseWrap = document.createElement('label');
    poseWrap.style.cssText = 'display:inline-flex;align-items:center;gap:5px;';
    poseWrap.innerHTML = '<span style="color:#94a3b8;font-weight:600;">🎩 Pose:</span>';
    this.poseSelect = document.createElement('select');
    this.poseSelect.style.cssText = selectStyle;
    Object.keys(POSE_PRESETS).forEach(function (k) {
      var opt = document.createElement('option');
      opt.value = k;
      opt.textContent = POSE_PRESETS[k].label;
      if (k === self.poseName) opt.selected = true;
      self.poseSelect.appendChild(opt);
    });
    this.poseSelect.onchange = function () {
      self.setPose(self.poseSelect.value);
    };
    poseWrap.appendChild(this.poseSelect);

    // Voice Selector
    var voiceWrap = document.createElement('label');
    voiceWrap.style.cssText = 'display:inline-flex;align-items:center;gap:5px;';
    voiceWrap.innerHTML = '<span style="color:#94a3b8;font-weight:600;">🎙️ Voice:</span>';
    this.voiceSelect = document.createElement('select');
    this.voiceSelect.style.cssText = selectStyle;
    NEURAL_VOICES.forEach(function (v) {
      var opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = v.label;
      if (v.id === self.voiceId) opt.selected = true;
      self.voiceSelect.appendChild(opt);
    });
    this.voiceSelect.onchange = function () {
      self.voiceId = self.voiceSelect.value;
    };
    voiceWrap.appendChild(this.voiceSelect);

    this.bottomHud.appendChild(camWrap);
    this.bottomHud.appendChild(holoWrap);
    this.bottomHud.appendChild(poseWrap);
    this.bottomHud.appendChild(voiceWrap);
    this.viewportWrap.appendChild(this.bottomHud);
  };

  ProfessorRabbitInstance.prototype._bindPointerOrbit = function () {
    var self = this;
    var el = this.canvasMount;

    el.addEventListener('pointerdown', function (e) {
      self.orbit.isDragging = true;
      self.orbit.lastX = e.clientX;
      self.orbit.lastY = e.clientY;
      el.style.cursor = 'grabbing';
    });

    global.addEventListener('pointermove', function (e) {
      if (!self.orbit.isDragging) return;
      var dx = e.clientX - self.orbit.lastX;
      var dy = e.clientY - self.orbit.lastY;
      self.orbit.lastX = e.clientX;
      self.orbit.lastY = e.clientY;

      self.cameraPreset = 'ORBIT_FREE';
      if (self.camSelect) self.camSelect.value = 'ORBIT_FREE';
      self.orbit.theta -= dx * 0.0065;
      self.orbit.phi = clamp(self.orbit.phi + dy * 0.0055, -0.25, 0.85);
    });

    global.addEventListener('pointerup', function () {
      if (self.orbit.isDragging) {
        self.orbit.isDragging = false;
        el.style.cursor = 'grab';
      }
    });

    el.addEventListener('wheel', function (e) {
      e.preventDefault();
      self.cameraPreset = 'ORBIT_FREE';
      if (self.camSelect) self.camSelect.value = 'ORBIT_FREE';
      self.orbit.radius = clamp(self.orbit.radius + e.deltaY * 0.0025, 1.85, 6.80);
    }, { passive: false });
  };

  ProfessorRabbitInstance.prototype._renderChalkboardCanvas = function () {
    var canvas = this.chalkboardCanvas;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width;
    var H = canvas.height;

    // Deep slate-emerald blackboard texture
    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#071f18');
    grad.addColorStop(0.5, '#0a2920');
    grad.addColorStop(1, '#061914');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle chalk grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < W; gx += 64) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, H);
      ctx.stroke();
    }
    for (var gy = 0; gy < H; gy += 64) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(W, gy);
      ctx.stroke();
    }

    // Inner gold/cyan academic border
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, W - 36, H - 36);

    // Header bar
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 28px "JetBrains Mono", "Segoe UI", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(String(this.chalkboardState.title || 'SPACE.UNIVERSITY AMPHITHEATER').slice(0, 56), 42, 66);

    // Divider line
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(42, 84);
    ctx.lineTo(W - 42, 84);
    ctx.stroke();

    // Primary Equation / Statutory Citation Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.62)';
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.65)';
    ctx.lineWidth = 2;
    ctx.fillRect(42, 102, W - 84, 74);
    ctx.strokeRect(42, 102, W - 84, 74);

    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 23px "JetBrains Mono", "Segoe UI", monospace';
    var eqStr = String(this.chalkboardState.equation || '');
    ctx.fillText(eqStr.slice(0, 68), 60, 147);

    // Bullet Points
    var bullets = Array.isArray(this.chalkboardState.bullets) ? this.chalkboardState.bullets : [];
    ctx.font = '21px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#f1f5f9';
    var y = 224;
    for (var i = 0; i < Math.min(bullets.length, 5); i++) {
      var line = String(bullets[i] || '');
      ctx.fillStyle = i % 2 === 0 ? '#e2e8f0' : '#a7f3d0';
      ctx.fillText(line.slice(0, 76), 48, y);
      y += 54;
    }

    // Footer watermark
    ctx.fillStyle = 'rgba(148, 163, 184, 0.65)';
    ctx.font = 'italic 17px "JetBrains Mono", monospace';
    ctx.fillText('Dean Prof. Rabbit Warren & Gemini 2.5 Flash Co-Teacher • DocMesh IN_SYNC (Δ=0.0)', 42, H - 34);

    if (this.chalkboardTexture) {
      this.chalkboardTexture.needsUpdate = true;
    }
  };

  ProfessorRabbitInstance.prototype._initThreeOrFallback = function () {
    var self = this;
    ensureThreeLoaded().then(function (THREE) {
      if (self._destroyed) return;
      if (THREE && THREE.WebGLRenderer) {
        try {
          self._buildThreeScene(THREE);
          self._startLoop();
          return;
        } catch (err) {
          console.warn('[ProfessorRabbit3D] WebGL init fallback triggered:', err);
        }
      }
      self._buildFallbackCanvas();
      self._startLoop();
    });
  };

  /**
   * ==========================================================================
   * FULL THREE.JS r128 3D SCENE & ARTICULATED PROFESSOR RABBIT RIG
   * ==========================================================================
   */
  ProfessorRabbitInstance.prototype._buildThreeScene = function (THREE) {
    this.THREE = THREE;
    this.isWebGL = true;

    var w = Math.max(320, this.viewportWrap.clientWidth || 720);
    var h = Math.max(300, this.viewportWrap.clientHeight || 440);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070d19, 0.065);

    this.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 60);
    var preset = CAMERA_PRESETS[this.cameraPreset] || CAMERA_PRESETS.FRONT_LECTURE;
    this.camera.position.set(preset.pos[0], preset.pos[1], preset.pos[2]);
    this.camera.lookAt(preset.target[0], preset.target[1], preset.target[2]);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    if (THREE.PCFSoftShadowMap) {
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    if (THREE.sRGBEncoding) {
      this.renderer.outputEncoding = THREE.sRGBEncoding;
    }
    if (THREE.ACESFilmicToneMapping) {
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.12;
    }

    this.canvasMount.innerHTML = '';
    this.canvasMount.appendChild(this.renderer.domElement);

    // Studio Lighting Rig
    var hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 0.72);
    hemiLight.position.set(0, 6, 0);
    this.scene.add(hemiLight);

    // Warm Studio Key Light
    this.keyLight = new THREE.DirectionalLight(0xfff7ed, 1.35);
    this.keyLight.position.set(2.8, 4.4, 3.8);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.scene.add(this.keyLight);

    // Cyan Rim Light
    this.rimLight = new THREE.PointLight(0x22d3ee, 1.45, 9.0);
    this.rimLight.position.set(-2.6, 2.8, -1.2);
    this.scene.add(this.rimLight);

    // Emerald Chalkboard Bounce Light
    this.bounceLight = new THREE.PointLight(0x10b981, 0.95, 7.5);
    this.bounceLight.position.set(-0.6, 1.8, -0.8);
    this.scene.add(this.bounceLight);

    // Hologram Accent Light
    this.holoLight = new THREE.PointLight(0xa855f7, 1.15, 6.0);
    this.holoLight.position.set(1.35, 1.35, 0.45);
    this.scene.add(this.holoLight);

    this._buildAmphitheaterEnvironment(THREE);
    this._buildArticulatedRabbit(THREE);
    this._buildHologramGroup(THREE);
    this._rebuildHologramContent();
  };

  ProfessorRabbitInstance.prototype._buildAmphitheaterEnvironment = function (THREE) {
    this.envGroup = new THREE.Group();
    this.scene.add(this.envGroup);

    // Amphitheater Stage Floor
    var floorGeo = new THREE.CylinderGeometry(5.5, 5.8, 0.16, 48);
    var floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.45
    });
    var floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, -0.08, 0);
    floorMesh.receiveShadow = true;
    this.envGroup.add(floorMesh);

    // Glowing Stage Ring
    var ringGeo = new THREE.RingGeometry(2.85, 2.92, 64);
    var ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.45 });
    var ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.005;
    this.envGroup.add(ringMesh);

    // 3D Framed Amphitheater Chalkboard behind Professor Rabbit
    this.chalkboardGroup = new THREE.Group();
    this.chalkboardGroup.position.set(-0.55, 1.68, -1.35);
    this.chalkboardGroup.rotation.y = 0.08;
    this.envGroup.add(this.chalkboardGroup);

    // Mahogany Outer Frame
    var frameGeo = new THREE.BoxGeometry(3.56, 1.88, 0.10);
    var frameMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.45, metalness: 0.25 });
    var frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.castShadow = true;
    frameMesh.receiveShadow = true;
    this.chalkboardGroup.add(frameMesh);

    // Gold Trim Bezel
    var bezelGeo = new THREE.BoxGeometry(3.44, 1.76, 0.11);
    var bezelMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.8 });
    var bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
    this.chalkboardGroup.add(bezelMesh);

    // Dynamic Chalkboard CanvasTexture Surface
    this.chalkboardTexture = new THREE.CanvasTexture(this.chalkboardCanvas);
    var boardGeo = new THREE.PlaneGeometry(3.36, 1.68);
    var boardMat = new THREE.MeshStandardMaterial({
      map: this.chalkboardTexture,
      roughness: 0.65,
      metalness: 0.05
    });
    var boardMesh = new THREE.Mesh(boardGeo, boardMat);
    boardMesh.position.z = 0.06;
    this.chalkboardGroup.add(boardMesh);

    // Chalk Tray & Colored Chalk Sticks
    var trayGeo = new THREE.BoxGeometry(3.48, 0.06, 0.18);
    var trayMesh = new THREE.Mesh(trayGeo, frameMat);
    trayMesh.position.set(0, -0.92, 0.08);
    this.chalkboardGroup.add(trayMesh);

    var chalkColors = [0xf8fafc, 0x22d3ee, 0xfde047, 0xf43f5e, 0x34d399];
    for (var c = 0; c < chalkColors.length; c++) {
      var cGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.14, 12);
      var cMat = new THREE.MeshStandardMaterial({ color: chalkColors[c], roughness: 0.8 });
      var cMesh = new THREE.Mesh(cGeo, cMat);
      cMesh.rotation.z = Math.PI / 2;
      cMesh.position.set(-0.9 + c * 0.42, -0.87, 0.11);
      this.chalkboardGroup.add(cMesh);
    }

    // Mahogany & Obsidian Lecture Podium (in front-left of Rabbit)
    this.podiumGroup = new THREE.Group();
    this.podiumGroup.position.set(-0.30, 0.0, 0.72);
    this.envGroup.add(this.podiumGroup);

    var podBaseGeo = new THREE.BoxGeometry(0.88, 0.78, 0.52);
    var podMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.35, metalness: 0.4 });
    var podBase = new THREE.Mesh(podBaseGeo, podMat);
    podBase.position.y = 0.39;
    podBase.castShadow = true;
    podBase.receiveShadow = true;
    this.podiumGroup.add(podBase);

    var podTopGeo = new THREE.BoxGeometry(0.98, 0.08, 0.62);
    var podTop = new THREE.Mesh(podTopGeo, frameMat);
    podTop.position.set(0, 0.80, 0);
    podTop.rotation.x = 0.18;
    this.podiumGroup.add(podTop);

    // Space.University Gold Seal on Podium Front
    var sealGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.03, 28);
    var sealMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.25, metalness: 0.85, emissive: 0x78350f, emissiveIntensity: 0.35 });
    var sealMesh = new THREE.Mesh(sealGeo, sealMat);
    sealMesh.rotation.x = Math.PI / 2;
    sealMesh.position.set(0, 0.48, 0.27);
    this.podiumGroup.add(sealMesh);

    // Floating Ambient Dust Motes / Quantum Particles
    var particleCount = 90;
    var pGeo = new THREE.BufferGeometry();
    var positions = new Float32Array(particleCount * 3);
    for (var i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 6.5;
      positions[i * 3 + 1] = 0.3 + Math.random() * 3.0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4.0;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var pMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.035, transparent: true, opacity: 0.55 });
    this.dustParticles = new THREE.Points(pGeo, pMat);
    this.envGroup.add(this.dustParticles);
  };

  ProfessorRabbitInstance.prototype._buildArticulatedRabbit = function (THREE) {
    this.rabbitGroup = new THREE.Group();
    this.rabbitGroup.position.set(-0.30, 0.0, 0.0);
    this.scene.add(this.rabbitGroup);

    // Shared Materials
    var furMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.62, metalness: 0.06 });
    var furCreamMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.68, metalness: 0.04 });
    var pinkMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.42, metalness: 0.08, emissive: 0x831843, emissiveIntensity: 0.12 });
    var innerEarMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.55, metalness: 0.05 });
    var tweedMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.72, metalness: 0.12 });
    var lapelMat = new THREE.MeshStandardMaterial({ color: 0x022c22, roughness: 0.60, metalness: 0.18 });
    var vestMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55, metalness: 0.22 });
    var goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.22, metalness: 0.88 });
    var crimsonMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.40, metalness: 0.15 });
    var darkEyeMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.12, metalness: 0.35 });
    var glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    var mouthCavityMat = new THREE.MeshStandardMaterial({ color: 0x4c0519, roughness: 0.85 });

    // 1. Legs / Lower Base behind Podium
    var legGeo = new THREE.CylinderGeometry(0.11, 0.10, 0.58, 16);
    var leftLeg = new THREE.Mesh(legGeo, vestMat);
    leftLeg.position.set(-0.14, 0.29, 0);
    var rightLeg = new THREE.Mesh(legGeo, vestMat);
    rightLeg.position.set(0.14, 0.29, 0);
    this.rabbitGroup.add(leftLeg, rightLeg);

    // 2. Torso & Academic Attire (Breathing Pivot)
    this.torsoPivot = new THREE.Group();
    this.torsoPivot.position.set(0, 0.58, 0);
    this.rabbitGroup.add(this.torsoPivot);

    // Emerald-and-Charcoal Tweed Professorial Jacket
    var torsoGeo = new THREE.CylinderGeometry(0.27, 0.31, 0.68, 24);
    var torsoMesh = new THREE.Mesh(torsoGeo, tweedMat);
    torsoMesh.position.y = 0.34;
    torsoMesh.castShadow = true;
    this.torsoPivot.add(torsoMesh);

    // Waistcoat Front Panel
    var vestGeo = new THREE.CylinderGeometry(0.24, 0.27, 0.62, 20, 1, false, -0.7, 1.4);
    var vestMesh = new THREE.Mesh(vestGeo, vestMat);
    vestMesh.position.set(0, 0.34, 0.035);
    this.torsoPivot.add(vestMesh);

    // White Dress Shirt Collar V
    var shirtGeo = new THREE.ConeGeometry(0.14, 0.24, 16);
    var shirtMesh = new THREE.Mesh(shirtGeo, furMat);
    shirtMesh.rotation.x = Math.PI;
    shirtMesh.position.set(0, 0.58, 0.16);
    this.torsoPivot.add(shirtMesh);

    // Jacket Lapels
    var lapelGeo = new THREE.BoxGeometry(0.08, 0.42, 0.04);
    var leftLapel = new THREE.Mesh(lapelGeo, lapelMat);
    leftLapel.position.set(-0.13, 0.45, 0.24);
    leftLapel.rotation.z = -0.22;
    var rightLapel = new THREE.Mesh(lapelGeo, lapelMat);
    rightLapel.position.set(0.13, 0.45, 0.24);
    rightLapel.rotation.z = 0.22;
    this.torsoPivot.add(leftLapel, rightLapel);

    // Gold Waistcoat Buttons
    for (var b = 0; b < 3; b++) {
      var btnGeo = new THREE.SphereGeometry(0.018, 12, 12);
      var btnMesh = new THREE.Mesh(btnGeo, goldMat);
      btnMesh.position.set(0, 0.24 + b * 0.10, 0.29);
      this.torsoPivot.add(btnMesh);
    }

    // Crimson Academic Bow Tie
    this.bowtieGroup = new THREE.Group();
    this.bowtieGroup.position.set(0, 0.64, 0.26);
    this.torsoPivot.add(this.bowtieGroup);

    var bowKnot = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), crimsonMat);
    var bowWingGeo = new THREE.ConeGeometry(0.055, 0.11, 12);
    var bowLeft = new THREE.Mesh(bowWingGeo, crimsonMat);
    bowLeft.rotation.z = -Math.PI / 2;
    bowLeft.position.x = -0.055;
    var bowRight = new THREE.Mesh(bowWingGeo, crimsonMat);
    bowRight.rotation.z = Math.PI / 2;
    bowRight.position.x = 0.055;
    this.bowtieGroup.add(bowKnot, bowLeft, bowRight);

    // 3. Articulated Left & Right Arms + Paws + Laser-Chalk Pointer Wand
    this.leftShoulderPivot = new THREE.Group();
    this.leftShoulderPivot.position.set(-0.31, 0.60, 0.0);
    this.torsoPivot.add(this.leftShoulderPivot);

    var upperArmGeo = new THREE.CylinderGeometry(0.075, 0.068, 0.34, 16);
    var leftUpperArm = new THREE.Mesh(upperArmGeo, tweedMat);
    leftUpperArm.position.y = -0.15;
    this.leftShoulderPivot.add(leftUpperArm);

    this.leftElbowPivot = new THREE.Group();
    this.leftElbowPivot.position.set(0, -0.32, 0);
    this.leftShoulderPivot.add(this.leftElbowPivot);

    var foreArmGeo = new THREE.CylinderGeometry(0.065, 0.058, 0.30, 16);
    var leftForeArm = new THREE.Mesh(foreArmGeo, tweedMat);
    leftForeArm.position.y = -0.14;
    this.leftElbowPivot.add(leftForeArm);

    var pawGeo = new THREE.SphereGeometry(0.072, 16, 16);
    var leftPaw = new THREE.Mesh(pawGeo, furMat);
    leftPaw.position.set(0, -0.30, 0.02);
    this.leftElbowPivot.add(leftPaw);

    // Right Arm (Holds Laser-Chalk Wand)
    this.rightShoulderPivot = new THREE.Group();
    this.rightShoulderPivot.position.set(0.31, 0.60, 0.0);
    this.torsoPivot.add(this.rightShoulderPivot);

    var rightUpperArm = new THREE.Mesh(upperArmGeo, tweedMat);
    rightUpperArm.position.y = -0.15;
    this.rightShoulderPivot.add(rightUpperArm);

    this.rightElbowPivot = new THREE.Group();
    this.rightElbowPivot.position.set(0, -0.32, 0);
    this.rightShoulderPivot.add(this.rightElbowPivot);

    var rightForeArm = new THREE.Mesh(foreArmGeo, tweedMat);
    rightForeArm.position.y = -0.14;
    this.rightElbowPivot.add(rightForeArm);

    var rightPaw = new THREE.Mesh(pawGeo, furMat);
    rightPaw.position.set(0, -0.30, 0.02);
    this.rightElbowPivot.add(rightPaw);

    // Glowing Laser-Chalk Pointer Wand in Right Paw
    this.wandGroup = new THREE.Group();
    this.wandGroup.position.set(0, -0.32, 0.05);
    this.wandGroup.rotation.x = Math.PI / 2.2;
    this.rightElbowPivot.add(this.wandGroup);

    var wandShaftGeo = new THREE.CylinderGeometry(0.012, 0.016, 0.56, 12);
    var wandShaftMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7, roughness: 0.2 });
    var wandShaft = new THREE.Mesh(wandShaftGeo, wandShaftMat);
    wandShaft.position.y = 0.28;
    this.wandGroup.add(wandShaft);

    var wandTipGeo = new THREE.SphereGeometry(0.032, 16, 16);
    this.wandTipMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    this.wandTip = new THREE.Mesh(wandTipGeo, this.wandTipMat);
    this.wandTip.position.y = 0.58;
    this.wandGroup.add(this.wandTip);

    // Glowing Laser Beam Extension
    var beamGeo = new THREE.CylinderGeometry(0.004, 0.008, 0.65, 8);
    this.wandBeamMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.65 });
    this.wandBeam = new THREE.Mesh(beamGeo, this.wandBeamMat);
    this.wandBeam.position.y = 0.90;
    this.wandGroup.add(this.wandBeam);

    // 4. Head & Facial Rig (Mounted on Neck Pivot)
    this.headPivot = new THREE.Group();
    this.headPivot.position.set(0, 0.72, 0.02);
    this.torsoPivot.add(this.headPivot);

    // Cranium Sphere
    var headGeo = new THREE.SphereGeometry(0.285, 32, 32);
    var headMesh = new THREE.Mesh(headGeo, furMat);
    headMesh.position.y = 0.22;
    headMesh.scale.set(1.02, 0.98, 1.05);
    headMesh.castShadow = true;
    this.headPivot.add(headMesh);

    // 3D Plush Cheeks (Left & Right)
    var cheekGeo = new THREE.SphereGeometry(0.135, 24, 24);
    this.leftCheek = new THREE.Mesh(cheekGeo, furCreamMat);
    this.leftCheek.position.set(-0.165, 0.14, 0.18);
    this.leftCheek.scale.set(1.1, 0.85, 0.95);
    this.rightCheek = new THREE.Mesh(cheekGeo, furCreamMat);
    this.rightCheek.position.set(0.165, 0.14, 0.18);
    this.rightCheek.scale.set(1.1, 0.85, 0.95);
    this.headPivot.add(this.leftCheek, this.rightCheek);

    // Upper Snout / Muzzle Bridge
    var snoutGeo = new THREE.SphereGeometry(0.13, 24, 24);
    var snoutMesh = new THREE.Mesh(snoutGeo, furMat);
    snoutMesh.position.set(0, 0.17, 0.25);
    snoutMesh.scale.set(1.15, 0.78, 1.15);
    this.headPivot.add(snoutMesh);

    // Pink Nose (Twitches at 3 Hz!)
    this.nosePivot = new THREE.Group();
    this.nosePivot.position.set(0, 0.20, 0.385);
    this.headPivot.add(this.nosePivot);

    var noseGeo = new THREE.SphereGeometry(0.042, 16, 16);
    var noseMesh = new THREE.Mesh(noseGeo, pinkMat);
    noseMesh.scale.set(1.25, 0.85, 0.90);
    this.nosePivot.add(noseMesh);

    // Whiskers (3 Left, 3 Right)
    this.leftWhiskerGroup = new THREE.Group();
    this.leftWhiskerGroup.position.set(-0.18, 0.15, 0.28);
    this.rightWhiskerGroup = new THREE.Group();
    this.rightWhiskerGroup.position.set(0.18, 0.15, 0.28);
    this.headPivot.add(this.leftWhiskerGroup, this.rightWhiskerGroup);

    var whiskerMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.82 });
    for (var wIdx = -1; wIdx <= 1; wIdx++) {
      var wGeo = new THREE.CylinderGeometry(0.0025, 0.001, 0.26, 6);
      var wl = new THREE.Mesh(wGeo, whiskerMat);
      wl.rotation.z = Math.PI / 2 + wIdx * 0.16;
      wl.rotation.y = -0.22;
      wl.position.set(-0.11, wIdx * 0.025, 0);
      this.leftWhiskerGroup.add(wl);

      var wr = new THREE.Mesh(wGeo, whiskerMat);
      wr.rotation.z = -Math.PI / 2 - wIdx * 0.16;
      wr.rotation.y = 0.22;
      wr.position.set(0.11, wIdx * 0.025, 0);
      this.rightWhiskerGroup.add(wr);
    }

    // 5. Articulated Lower Jaw & 7-Viseme Mouth Cavity + Tongue + Lips
    this.mouthGroup = new THREE.Group();
    this.mouthGroup.position.set(0, 0.10, 0.28);
    this.headPivot.add(this.mouthGroup);

    // Inner Dark Mouth Cavity (scales with jawOpen & lipWidth/lipRound)
    var cavityGeo = new THREE.SphereGeometry(0.075, 20, 20);
    this.mouthCavity = new THREE.Mesh(cavityGeo, mouthCavityMat);
    this.mouthCavity.position.set(0, 0.0, 0.02);
    this.mouthCavity.scale.set(0.8, 0.15, 0.5);
    this.mouthGroup.add(this.mouthCavity);

    // Rabbit Buck Teeth (Upper Incisors)
    var toothGeo = new THREE.BoxGeometry(0.028, 0.036, 0.014);
    var toothMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    this.leftTooth = new THREE.Mesh(toothGeo, toothMat);
    this.leftTooth.position.set(-0.016, 0.022, 0.068);
    this.rightTooth = new THREE.Mesh(toothGeo, toothMat);
    this.rightTooth.position.set(0.016, 0.022, 0.068);
    this.mouthGroup.add(this.leftTooth, this.rightTooth);

    // Articulated Tongue
    var tongueGeo = new THREE.SphereGeometry(0.042, 16, 16);
    this.tongueMesh = new THREE.Mesh(tongueGeo, pinkMat);
    this.tongueMesh.position.set(0, -0.018, 0.035);
    this.tongueMesh.scale.set(0.9, 0.35, 0.8);
    this.mouthGroup.add(this.tongueMesh);

    // Lower Jaw Pivot
    this.jawPivot = new THREE.Group();
    this.jawPivot.position.set(0, 0.09, 0.16);
    this.headPivot.add(this.jawPivot);

    var chinGeo = new THREE.SphereGeometry(0.105, 20, 20);
    this.chinMesh = new THREE.Mesh(chinGeo, furCreamMat);
    this.chinMesh.position.set(0, -0.035, 0.11);
    this.chinMesh.scale.set(0.95, 0.62, 1.08);
    this.jawPivot.add(this.chinMesh);

    // Lower Lip Rim
    var lipGeo = new THREE.TorusGeometry(0.052, 0.012, 10, 24);
    this.lipRing = new THREE.Mesh(lipGeo, pinkMat);
    this.lipRing.position.set(0, 0.0, 0.062);
    this.mouthGroup.add(this.lipRing);

    // 6. 3D Eyes, Pupils, Corneal Glint, Blinking Eyelids & Expressive Eyebrows
    this.leftEyeGroup = new THREE.Group();
    this.leftEyeGroup.position.set(-0.105, 0.275, 0.255);
    this.rightEyeGroup = new THREE.Group();
    this.rightEyeGroup.position.set(0.105, 0.275, 0.255);
    this.headPivot.add(this.leftEyeGroup, this.rightEyeGroup);

    var scleraGeo = new THREE.SphereGeometry(0.048, 20, 20);
    var scleraMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 });
    var pupilGeo = new THREE.SphereGeometry(0.028, 16, 16);
    var glintGeo = new THREE.SphereGeometry(0.009, 10, 10);
    var eyelidGeo = new THREE.SphereGeometry(0.051, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);

    var self = this;
    this.eyelids = [];
    [this.leftEyeGroup, this.rightEyeGroup].forEach(function (eyeGrp) {
      var sclera = new THREE.Mesh(scleraGeo, scleraMat);
      var pupil = new THREE.Mesh(pupilGeo, darkEyeMat);
      pupil.position.set(0, 0, 0.026);
      var glint = new THREE.Mesh(glintGeo, glintMat);
      glint.position.set(0.012, 0.014, 0.048);

      var eyelid = new THREE.Mesh(eyelidGeo, furCreamMat);
      eyelid.rotation.x = -Math.PI * 0.42; // Open by default
      self.eyelids.push(eyelid);

      eyeGrp.add(sclera, pupil, glint, eyelid);
    });

    // Expressive Eyebrows
    var browGeo = new THREE.BoxGeometry(0.088, 0.018, 0.022);
    var browMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.5 });
    this.leftBrow = new THREE.Mesh(browGeo, browMat);
    this.leftBrow.position.set(-0.108, 0.345, 0.275);
    this.rightBrow = new THREE.Mesh(browGeo, browMat);
    this.rightBrow.position.set(0.108, 0.345, 0.275);
    this.headPivot.add(this.leftBrow, this.rightBrow);

    // 7. Gold-Rimmed Academic Spectacles resting on Snout!
    this.glassesGroup = new THREE.Group();
    this.glassesGroup.position.set(0, 0.265, 0.315);
    this.headPivot.add(this.glassesGroup);

    var rimGeo = new THREE.TorusGeometry(0.062, 0.007, 12, 28);
    var leftRim = new THREE.Mesh(rimGeo, goldMat);
    leftRim.position.x = -0.102;
    var rightRim = new THREE.Mesh(rimGeo, goldMat);
    rightRim.position.x = 0.102;

    var lensGeo = new THREE.CircleGeometry(0.058, 24);
    var lensMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.16, side: THREE.DoubleSide });
    var leftLens = new THREE.Mesh(lensGeo, lensMat);
    leftLens.position.set(-0.102, 0, 0.002);
    var rightLens = new THREE.Mesh(lensGeo, lensMat);
    rightLens.position.set(0.102, 0, 0.002);

    var bridgeGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.082, 8);
    var bridgeMesh = new THREE.Mesh(bridgeGeo, goldMat);
    bridgeMesh.rotation.z = Math.PI / 2;
    bridgeMesh.position.set(0, 0.01, 0);

    this.glassesGroup.add(leftRim, rightRim, leftLens, rightLens, bridgeMesh);

    // 8. Articulated 3D Rabbit Ears (leftEarPivot, rightEarPivot)
    this.leftEarPivot = new THREE.Group();
    this.leftEarPivot.position.set(-0.125, 0.46, -0.02);
    this.rightEarPivot = new THREE.Group();
    this.rightEarPivot.position.set(0.125, 0.46, -0.02);
    this.headPivot.add(this.leftEarPivot, this.rightEarPivot);

    var outerEarGeo = new THREE.CylinderGeometry(0.052, 0.068, 0.56, 20);
    var innerEarGeo = new THREE.CylinderGeometry(0.032, 0.044, 0.48, 16);
    var earTipGeo = new THREE.SphereGeometry(0.052, 16, 16);

    [this.leftEarPivot, this.rightEarPivot].forEach(function (earPiv) {
      var outer = new THREE.Mesh(outerEarGeo, furMat);
      outer.position.y = 0.28;
      outer.scale.set(1.0, 1.0, 0.55);
      outer.castShadow = true;

      var inner = new THREE.Mesh(innerEarGeo, innerEarMat);
      inner.position.set(0, 0.27, 0.022);
      inner.scale.set(1.0, 1.0, 0.35);

      var tip = new THREE.Mesh(earTipGeo, furMat);
      tip.position.set(0, 0.56, 0);
      tip.scale.set(1.0, 1.15, 0.55);

      earPiv.add(outer, inner, tip);
    });

    // 9. Academic Mortarboard Cap & Gold Tassel
    this.capGroup = new THREE.Group();
    this.capGroup.position.set(0, 0.49, 0.01);
    this.capGroup.rotation.x = -0.08;
    this.headPivot.add(this.capGroup);

    var skullCapGeo = new THREE.CylinderGeometry(0.18, 0.20, 0.08, 24);
    var capMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.3 });
    var skullCap = new THREE.Mesh(skullCapGeo, capMat);
    this.capGroup.add(skullCap);

    var boardTopGeo = new THREE.BoxGeometry(0.54, 0.022, 0.54);
    var boardTop = new THREE.Mesh(boardTopGeo, capMat);
    boardTop.position.y = 0.05;
    boardTop.rotation.y = Math.PI / 4;
    this.capGroup.add(boardTop);

    var capButton = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), goldMat);
    capButton.position.y = 0.065;
    this.capGroup.add(capButton);

    this.tasselPivot = new THREE.Group();
    this.tasselPivot.position.set(0.22, 0.05, 0.16);
    this.capGroup.add(this.tasselPivot);

    var tasselCordGeo = new THREE.CylinderGeometry(0.008, 0.016, 0.18, 10);
    var tasselMesh = new THREE.Mesh(tasselCordGeo, goldMat);
    tasselMesh.position.y = -0.09;
    this.tasselPivot.add(tasselMesh);
  };

  /**
   * ==========================================================================
   * 3D HOLOGRAM PEDESTAL & DYNAMIC MODES (UCC ART. 9, KIRCHHOFF, 5D CUBE)
   * ==========================================================================
   */
  ProfessorRabbitInstance.prototype._buildHologramGroup = function (THREE) {
    this.hologramRoot = new THREE.Group();
    this.hologramRoot.position.set(1.32, 0.0, 0.15);
    this.scene.add(this.hologramRoot);

    // Emitter Base Pedestal
    var pedGeo = new THREE.CylinderGeometry(0.52, 0.64, 0.18, 32);
    var pedMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.75 });
    var pedMesh = new THREE.Mesh(pedGeo, pedMat);
    pedMesh.position.y = 0.09;
    this.hologramRoot.add(pedMesh);

    var emitterRingGeo = new THREE.TorusGeometry(0.48, 0.018, 12, 48);
    var emitterRingMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    this.emitterRing = new THREE.Mesh(emitterRingGeo, emitterRingMat);
    this.emitterRing.rotation.x = Math.PI / 2;
    this.emitterRing.position.y = 0.19;
    this.hologramRoot.add(this.emitterRing);

    // Rotating 3D Lattice Container
    this.hologramSpinGroup = new THREE.Group();
    this.hologramSpinGroup.position.set(0, 1.28, 0);
    this.hologramRoot.add(this.hologramSpinGroup);
  };

  ProfessorRabbitInstance.prototype._rebuildHologramContent = function () {
    if (!this.isWebGL || !this.THREE || !this.hologramSpinGroup) return;
    var THREE = this.THREE;

    while (this.hologramSpinGroup.children.length > 0) {
      this.hologramSpinGroup.remove(this.hologramSpinGroup.children[0]);
    }

    var data = LATTICE_DATA[this.hologramMode] || LATTICE_DATA.UCC_ARTICLE_9;
    var scale = 0.78;

    // Outer Wireframe Containment Sphere / Cube
    if (this.hologramMode === 'JACOBS_LADDER_5D') {
      var cubeGeo = new THREE.BoxGeometry(1.22, 1.22, 1.22);
      var cubeEdges = new THREE.EdgesGeometry(cubeGeo);
      var cubeLine = new THREE.LineSegments(cubeEdges, new THREE.LineBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.55 }));
      this.hologramSpinGroup.add(cubeLine);
    } else {
      var orbGeo = new THREE.TorusGeometry(0.82, 0.006, 8, 64);
      var orbMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.32 });
      var orb1 = new THREE.Mesh(orbGeo, orbMat);
      var orb2 = new THREE.Mesh(orbGeo, orbMat);
      orb2.rotation.x = Math.PI / 2;
      this.hologramSpinGroup.add(orb1, orb2);
    }

    // Edges
    var nodes = data.nodes || [];
    var edges = data.edges || [];
    for (var e = 0; e < edges.length; e++) {
      var pair = edges[e];
      var nA = nodes[pair[0]];
      var nB = nodes[pair[1]];
      if (!nA || !nB) continue;

      var pA = new THREE.Vector3(nA[0] * scale, nA[1] * scale, nA[2] * scale);
      var pB = new THREE.Vector3(nB[0] * scale, nB[1] * scale, nB[2] * scale);
      var dist = pA.distanceTo(pB);
      var mid = pA.clone().add(pB).multiplyScalar(0.5);

      var edgeGeo = new THREE.CylinderGeometry(0.010, 0.010, dist, 8);
      var edgeColor = this.hologramMode === 'UCC_ARTICLE_9' ? 0x34d399 : 0x38bdf8;
      var edgeMat = new THREE.MeshBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.68 });
      var edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
      edgeMesh.position.copy(mid);
      edgeMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pB.clone().sub(pA).normalize());
      this.hologramSpinGroup.add(edgeMesh);
    }

    // Nodes + Floating 3D Text Labels
    for (var i = 0; i < nodes.length; i++) {
      var nd = nodes[i];
      var nx = nd[0] * scale;
      var ny = nd[1] * scale;
      var nz = nd[2] * scale;
      var u1 = nd[3];
      var label = nd[4] || ('N' + i);

      var colHex = fiedlerColorHex(u1);
      var colCss = fiedlerColorCss(u1);

      var nGeo = new THREE.SphereGeometry(this.hologramMode === 'UCC_ARTICLE_9' ? 0.068 : 0.055, 20, 20);
      var nMat = new THREE.MeshStandardMaterial({
        color: colHex,
        emissive: colHex,
        emissiveIntensity: 0.55,
        roughness: 0.2,
        metalness: 0.5
      });
      var nMesh = new THREE.Mesh(nGeo, nMat);
      nMesh.position.set(nx, ny, nz);
      this.hologramSpinGroup.add(nMesh);

      var sprite = makeTextSprite(THREE, label, colCss);
      sprite.position.set(nx, ny + 0.12, nz);
      this.hologramSpinGroup.add(sprite);
    }
  };

  /**
   * ==========================================================================
   * BUILT-IN 3D PERSPECTIVE PROJECTION CANVAS2D FALLBACK (IF CDN BLOCKED)
   * ==========================================================================
   */
  ProfessorRabbitInstance.prototype._buildFallbackCanvas = function () {
    this.isWebGL = false;
    this.fallbackCanvas = document.createElement('canvas');
    this.fallbackCanvas.style.cssText = 'width:100%;height:100%;display:block;';
    this.canvasMount.innerHTML = '';
    this.canvasMount.appendChild(this.fallbackCanvas);
    this._onResize();
  };

  ProfessorRabbitInstance.prototype._renderFallbackFrame = function (tSec) {
    var canvas = this.fallbackCanvas;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width;
    var H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // 1. Draw 3D Perspective Chalkboard on Left-Center
    if (this.chalkboardCanvas) {
      ctx.save();
      ctx.shadowColor = 'rgba(34, 211, 238, 0.25)';
      ctx.shadowBlur = 18;
      var bw = Math.min(W * 0.52, 460);
      var bh = bw * 0.5;
      var bx = W * 0.05;
      var by = H * 0.14;
      ctx.drawImage(this.chalkboardCanvas, bx, by, bw, bh);
      ctx.restore();
    }

    // 2. Draw 3D Perspective Rotating Hologram on Right
    var data = LATTICE_DATA[this.hologramMode] || LATTICE_DATA.UCC_ARTICLE_9;
    var holoCx = W * 0.78;
    var holoCy = H * 0.46;
    var holoScale = Math.min(W, H) * 0.22;
    var rotY = tSec * 0.65 + this.orbit.theta;
    var rotX = 0.25 + this.orbit.phi * 0.5;

    var projected = (data.nodes || []).map(function (nd) {
      var x = nd[0], y = nd[1], z = nd[2];
      var x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
      var z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
      var y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
      var z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
      var p = 2.6 / (2.6 - z2 * 0.6);
      return {
        sx: holoCx + x1 * holoScale * p,
        sy: holoCy - y2 * holoScale * p,
        p: p,
        u1: nd[3],
        label: nd[4]
      };
    });

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 2;
    (data.edges || []).forEach(function (e) {
      var a = projected[e[0]], b = projected[e[1]];
      if (!a || !b) return;
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.sx, b.sy);
      ctx.stroke();
    });

    projected.forEach(function (pt) {
      ctx.fillStyle = fiedlerColorCss(pt.u1);
      ctx.beginPath();
      ctx.arc(pt.sx, pt.sy, 6 * pt.p, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(pt.label || '', pt.sx + 8, pt.sy + 3);
    });

    // 3. Draw Articulated Professor Rabbit in Foreground Center-Left
    var rx = W * 0.42;
    var ry = H * 0.62;
    var s = Math.min(W, H) / 420;
    ctx.save();
    ctx.translate(rx, ry);
    ctx.scale(s, s);

    // Ears
    ctx.save();
    ctx.translate(-26, -110);
    ctx.rotate(this.earPhysics.leftAngle);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(0, -45, 16, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.ellipse(0, -42, 9, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(26, -110);
    ctx.rotate(this.earPhysics.rightAngle);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(0, -45, 16, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.ellipse(0, -42, 9, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Tweed Jacket
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.ellipse(0, 45, 62, 68, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crimson Bow Tie
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(-22, -22);
    ctx.lineTo(-22, -2);
    ctx.closePath();
    ctx.moveTo(0, -12);
    ctx.lineTo(22, -22);
    ctx.lineTo(22, -2);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(0, -68, 52, 46, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spectacles
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-20, -74, 15, 0, Math.PI * 2);
    ctx.arc(20, -74, 15, 0, Math.PI * 2);
    ctx.stroke();

    // Nose
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(0, -56 + Math.sin(tSec * 18.8) * 1.5, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Articulated Mouth (7-Viseme driven)
    var mw = 14 + this.lipWidth * 18;
    var mh = 3 + this.jawOpen * 22;
    ctx.fillStyle = '#4c0519';
    ctx.beginPath();
    ctx.ellipse(0, -36, mw * 0.5, mh * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  /**
   * ==========================================================================
   * REAL-TIME 60 FPS ANIMATION, AUDIO SPECTRUM FORMANT DSP & SPRING PHYSICS
   * ==========================================================================
   */
  ProfessorRabbitInstance.prototype._startLoop = function () {
    var self = this;
    function frame(now) {
      if (self._destroyed) return;
      self._rafId = requestAnimationFrame(frame);
      self._step(now);
    }
    this._rafId = requestAnimationFrame(frame);
  };

  ProfessorRabbitInstance.prototype._step = function (now) {
    this._frameCount++;
    if (now - this._lastFpsTime >= 500) {
      this.fps = Math.min(60, Math.round((this._frameCount * 1000) / (now - this._lastFpsTime)));
      this._frameCount = 0;
      this._lastFpsTime = now;
      this._updateHUDText();
    }

    var tSec = (now - this._startTime) * 0.001;
    var dt = 0.016;

    // 1. Update Formant / Viseme Lip-Sync Envelope
    this._updateLipSyncEnvelope(now, tSec);

    // 2. Update Spring-Damper Ear Physics & Character Articulation
    var pose = POSE_PRESETS[this.poseName] || POSE_PRESETS.UCC_JURISPRUDENCE;
    var targetLeftEar = (pose.earLeftDeg * Math.PI) / 180 + Math.sin(tSec * 2.4) * 0.04 + this.jawOpen * 0.14;
    var targetRightEar = (pose.earRightDeg * Math.PI) / 180 - Math.sin(tSec * 2.7) * 0.04 - this.jawOpen * 0.14;

    var kSpring = 18.0;
    var damping = 0.82;
    this.earPhysics.leftVel = (this.earPhysics.leftVel + (targetLeftEar - this.earPhysics.leftAngle) * kSpring * dt) * damping;
    this.earPhysics.leftAngle += this.earPhysics.leftVel;
    this.earPhysics.rightVel = (this.earPhysics.rightVel + (targetRightEar - this.earPhysics.rightAngle) * kSpring * dt) * damping;
    this.earPhysics.rightAngle += this.earPhysics.rightVel;

    if (this.isWebGL && this.THREE) {
      this._updateThreeCharacter(tSec, pose);
      this._updateThreeCamera();
      this.renderer.render(this.scene, this.camera);
    } else {
      this._renderFallbackFrame(tSec);
    }
  };

  ProfessorRabbitInstance.prototype._updateLipSyncEnvelope = function (now, tSec) {
    var targetViseme = 'REST';
    var targetJaw = 0.04;
    var targetWidth = 0.52;
    var targetRound = 0.10;
    var targetTongue = 0.10;
    var targetWhisker = 0.02;

    if (this.isSpeaking && !this.isPaused) {
      // Check if live WebAudio AnalyserNode has active frequency spectrum energy
      var hasSpectrumSignal = false;
      if (this.analyser && this.freqData && this.audioCtx && this.audioCtx.state === 'running') {
        this.analyser.getByteFrequencyData(this.freqData);
        var sr = this.audioCtx.sampleRate || 44100;
        var binHz = sr / this.analyser.fftSize;

        // Compute RMS from spectrum bins
        var sumSq = 0;
        var f1PeakVal = 0, f1PeakBin = 3;
        var f2PeakVal = 0, f2PeakBin = 12;

        var maxBin = Math.min(this.freqData.length, Math.floor(3400 / binHz));
        for (var b = 1; b < maxBin; b++) {
          var v = this.freqData[b] / 255.0;
          sumSq += v * v;
          var hz = b * binHz;
          if (hz >= 200 && hz <= 900 && v > f1PeakVal) {
            f1PeakVal = v;
            f1PeakBin = b;
          }
          if (hz > 900 && hz <= 2800 && v > f2PeakVal) {
            f2PeakVal = v;
            f2PeakBin = b;
          }
        }
        var rms = Math.sqrt(sumSq / Math.max(1, maxBin));
        if (rms > 0.015) {
          hasSpectrumSignal = true;
          this.rmsVolume = rms;
          this.f1Hz = Math.round(f1PeakBin * binHz);
          this.f2Hz = Math.round(f2PeakBin * binHz);
          targetViseme = classifyFormantViseme(this.f1Hz, this.f2Hz, rms);

          var vt = VISEME_TABLE[targetViseme] || VISEME_TABLE.REST;
          targetJaw = clamp((this.f1Hz - 200) / 680, 0.08, 0.95) * clamp(rms * 2.4, 0.35, 1.15);
          targetWidth = lerp(vt.lipWidth, clamp((this.f2Hz - 800) / 1800, 0.30, 0.98), 0.5);
          targetRound = vt.lipRound;
          targetTongue = vt.tongueLift;
          targetWhisker = vt.whiskerFlare;
        }
      }

      // Fallback / Hybrid: Phoneme-Viseme Timeline Envelope
      if (!hasSpectrumSignal && this.activeVisemeTimeline && this.activeVisemeTimeline.length > 0) {
        var elapsedMs = now - this.speechStartPerf;
        var totalDur = this.activeVisemeTimeline[this.activeVisemeTimeline.length - 1].tMs + 120;
        var lookupMs = elapsedMs % Math.max(200, totalDur);

        for (var i = 0; i < this.activeVisemeTimeline.length; i++) {
          var seg = this.activeVisemeTimeline[i];
          if (lookupMs >= seg.tMs && lookupMs <= seg.tMs + seg.durMs) {
            targetViseme = seg.viseme;
            break;
          }
        }
        var vEntry = VISEME_TABLE[targetViseme] || VISEME_TABLE.REST;
        var mod = 0.85 + 0.15 * Math.sin(tSec * 24.0);
        targetJaw = vEntry.jawOpen * mod;
        targetWidth = vEntry.lipWidth;
        targetRound = vEntry.lipRound;
        targetTongue = vEntry.tongueLift;
        targetWhisker = vEntry.whiskerFlare;
        this.f1Hz = vEntry.f1Hz;
        this.f2Hz = vEntry.f2Hz;
        this.rmsVolume = targetViseme === 'REST' ? 0.01 : 0.24 * mod;
      }
    } else {
      this.rmsVolume = lerp(this.rmsVolume, 0.0, 0.2);
      this.f1Hz = 300;
      this.f2Hz = 1000;
    }

    this.currentViseme = targetViseme;
    var smooth = 0.32;
    this.jawOpen = lerp(this.jawOpen, targetJaw, smooth);
    this.lipWidth = lerp(this.lipWidth, targetWidth, smooth);
    this.lipRound = lerp(this.lipRound, targetRound, smooth);
    this.tongueLift = lerp(this.tongueLift, targetTongue, smooth);
    this.whiskerFlare = lerp(this.whiskerFlare, targetWhisker, smooth);
  };

  ProfessorRabbitInstance.prototype._updateThreeCharacter = function (tSec, pose) {
    // 1. Breathing Torso & Bowtie
    if (this.torsoPivot) {
      this.torsoPivot.position.y = 0.58 + Math.sin(tSec * 2.1) * 0.008;
      this.torsoPivot.rotation.z = Math.sin(tSec * 1.1) * 0.015;
    }

    // 2. Head Orientation + Speech Cadence Nodding
    if (this.headPivot) {
      var speechNod = this.isSpeaking ? Math.sin(tSec * 9.5) * 0.045 * this.jawOpen : 0;
      var targetPitch = pose.headPitch + speechNod;
      var targetYaw = pose.headYaw + Math.sin(tSec * 0.85) * 0.06;
      var targetRoll = pose.headRoll + Math.cos(tSec * 1.2) * 0.025;

      this.headPivot.rotation.x = lerp(this.headPivot.rotation.x, targetPitch, 0.12);
      this.headPivot.rotation.y = lerp(this.headPivot.rotation.y, targetYaw, 0.12);
      this.headPivot.rotation.z = lerp(this.headPivot.rotation.z, targetRoll, 0.12);
    }

    // 3. 3 Hz Nose Twitch
    if (this.nosePivot) {
      var twitchFreq = Math.PI * 2 * 3.0; // 3 Hz
      this.nosePivot.position.y = 0.20 + Math.sin(tSec * twitchFreq) * 0.0065;
      this.nosePivot.rotation.z = Math.cos(tSec * twitchFreq * 0.5) * 0.05;
    }

    // 4. Whiskers Flare with Viseme
    if (this.leftWhiskerGroup && this.rightWhiskerGroup) {
      this.leftWhiskerGroup.rotation.z = -this.whiskerFlare * 0.18;
      this.rightWhiskerGroup.rotation.z = this.whiskerFlare * 0.18;
    }

    // 5. Articulated Jaw & 7-Viseme Mouth Geometry
    if (this.jawPivot) {
      this.jawPivot.rotation.x = this.jawOpen * 0.46;
      this.jawPivot.position.y = 0.09 - this.jawOpen * 0.028;
    }
    if (this.mouthCavity) {
      var sx = clamp(this.lipWidth * (1.15 - this.lipRound * 0.45), 0.35, 1.35);
      var sy = clamp(0.12 + this.jawOpen * 1.15, 0.08, 1.35);
      this.mouthCavity.scale.set(sx, sy, 0.55);
    }
    if (this.lipRing) {
      var lx = clamp(this.lipWidth * (1.20 - this.lipRound * 0.42), 0.42, 1.38);
      var ly = clamp(0.22 + this.jawOpen * 1.05, 0.18, 1.28);
      this.lipRing.scale.set(lx, ly, 1.0 + this.lipRound * 0.5);
    }
    if (this.tongueMesh) {
      this.tongueMesh.position.y = -0.022 + this.tongueLift * 0.022 - this.jawOpen * 0.015;
    }
    if (this.leftCheek && this.rightCheek) {
      var cheekPuff = 1.0 + this.lipWidth * 0.12;
      this.leftCheek.scale.set(1.1 * cheekPuff, 0.85, 0.95);
      this.rightCheek.scale.set(1.1 * cheekPuff, 0.85, 0.95);
    }

    // 6. Natural Eye Blinking (every ~3.8 seconds)
    if (this.eyelids && this.eyelids.length === 2) {
      var blinkCycle = tSec % 3.8;
      var blinkAmt = (blinkCycle > 3.62 && blinkCycle < 3.78) ? Math.sin(((blinkCycle - 3.62) / 0.16) * Math.PI) : 0;
      var lidRot = lerp(-Math.PI * 0.44, 0.08, blinkAmt);
      this.eyelids[0].rotation.x = lidRot;
      this.eyelids[1].rotation.x = lidRot;
    }

    // 7. Expressive Eyebrows
    if (this.leftBrow && this.rightBrow) {
      var browY = 0.342 + pose.browLift * 0.025 + this.jawOpen * 0.012;
      this.leftBrow.position.y = browY;
      this.rightBrow.position.y = browY;
      this.leftBrow.rotation.z = pose.browLift * 0.18;
      this.rightBrow.rotation.z = -pose.browLift * 0.18;
    }

    // 8. Spring-Damper Ears
    if (this.leftEarPivot && this.rightEarPivot) {
      this.leftEarPivot.rotation.z = 0.12 + this.earPhysics.leftAngle;
      this.leftEarPivot.rotation.x = Math.sin(tSec * 1.8) * 0.05;
      this.rightEarPivot.rotation.z = -0.12 + this.earPhysics.rightAngle;
      this.rightEarPivot.rotation.x = Math.cos(tSec * 1.9) * 0.05;
    }

    // 9. Academic Arms & Laser-Chalk Pointer Gesture
    if (this.rightShoulderPivot && this.rightElbowPivot && this.leftShoulderPivot && this.leftElbowPivot) {
      var gestureWave = this.isSpeaking ? Math.sin(tSec * 6.2) * 0.14 : Math.sin(tSec * 2.0) * 0.04;
      this.rightShoulderPivot.rotation.x = lerp(this.rightShoulderPivot.rotation.x, pose.rightShoulderPitch + gestureWave, 0.12);
      this.rightShoulderPivot.rotation.z = lerp(this.rightShoulderPivot.rotation.z, pose.rightShoulderYaw, 0.12);
      this.rightElbowPivot.rotation.x = lerp(this.rightElbowPivot.rotation.x, -pose.rightElbowBend + gestureWave * 0.5, 0.12);

      this.leftShoulderPivot.rotation.x = lerp(this.leftShoulderPivot.rotation.x, pose.leftShoulderPitch, 0.12);
      this.leftShoulderPivot.rotation.z = lerp(this.leftShoulderPivot.rotation.z, pose.leftShoulderYaw, 0.12);
      this.leftElbowPivot.rotation.x = lerp(this.leftElbowPivot.rotation.x, -pose.leftElbowBend, 0.12);
    }

    if (this.wandTipMat && this.wandBeamMat) {
      this.wandTipMat.color.setHex(pose.wandColor || 0x34d399);
      this.wandBeamMat.color.setHex(pose.wandColor || 0x22d3ee);
      this.wandBeamMat.opacity = 0.45 + 0.35 * Math.sin(tSec * 8.0);
    }

    // 10. Rotate 3D Hologram & Dust Motes
    if (this.hologramSpinGroup) {
      this.hologramSpinGroup.rotation.y = tSec * 0.52;
      this.hologramSpinGroup.position.y = 1.28 + Math.sin(tSec * 1.8) * 0.04;
    }
    if (this.dustParticles) {
      this.dustParticles.rotation.y = tSec * 0.04;
    }
  };

  ProfessorRabbitInstance.prototype._updateThreeCamera = function () {
    if (!this.camera) return;
    if (this.cameraPreset === 'ORBIT_FREE') {
      var tx = 0.0, ty = 1.22, tz = -0.15;
      var cx = tx + this.orbit.radius * Math.sin(this.orbit.theta) * Math.cos(this.orbit.phi);
      var cy = ty + this.orbit.radius * Math.sin(this.orbit.phi);
      var cz = tz + this.orbit.radius * Math.cos(this.orbit.theta) * Math.cos(this.orbit.phi);
      this.camera.position.set(lerp(this.camera.position.x, cx, 0.18), lerp(this.camera.position.y, cy, 0.18), lerp(this.camera.position.z, cz, 0.18));
      this.camera.lookAt(tx, ty, tz);
    } else {
      var preset = CAMERA_PRESETS[this.cameraPreset] || CAMERA_PRESETS.FRONT_LECTURE;
      this.camera.position.set(
        lerp(this.camera.position.x, preset.pos[0], 0.10),
        lerp(this.camera.position.y, preset.pos[1], 0.10),
        lerp(this.camera.position.z, preset.pos[2], 0.10)
      );
      this.orbit.targetX = lerp(this.orbit.targetX, preset.target[0], 0.10);
      this.orbit.targetY = lerp(this.orbit.targetY, preset.target[1], 0.10);
      this.orbit.targetZ = lerp(this.orbit.targetZ, preset.target[2], 0.10);
      this.camera.lookAt(this.orbit.targetX, this.orbit.targetY, this.orbit.targetZ);
    }
  };

  ProfessorRabbitInstance.prototype._updateHUDText = function () {
    if (!this.telemetryBadge) return;
    var fpsEl = this.telemetryBadge.querySelector('.pr3d-fps');
    var visEl = this.telemetryBadge.querySelector('.pr3d-viseme');
    var formEl = this.telemetryBadge.querySelector('.pr3d-formants');
    var engEl = this.telemetryBadge.querySelector('.pr3d-engine-status');

    if (fpsEl) fpsEl.textContent = this.fps + ' FPS';
    if (visEl) visEl.textContent = this.currentViseme;
    if (formEl) {
      formEl.textContent = 'F1: ' + this.f1Hz + 'Hz • F2: ' + this.f2Hz + 'Hz • RMS: ' + this.rmsVolume.toFixed(2);
    }
    if (engEl) {
      engEl.textContent = this.isSpeaking ? ('SPEAKING • ' + this.speechEngineLabel) : (this.isWebGL ? '3D WebGL r128 READY' : '3D Projection READY');
    }
  };

  ProfessorRabbitInstance.prototype._onResize = function () {
    if (!this.viewportWrap) return;
    var w = Math.max(280, this.viewportWrap.clientWidth || 640);
    var h = Math.max(260, this.viewportWrap.clientHeight || 420);

    if (this.isWebGL && this.renderer && this.camera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    } else if (this.fallbackCanvas) {
      this.fallbackCanvas.width = w;
      this.fallbackCanvas.height = h;
    }
  };

  /**
   * ==========================================================================
   * PUBLIC INSTANCE CONTROLS (POSE, HOLOGRAM, CAMERA, CHALKBOARD, SPEAK)
   * ==========================================================================
   */
  ProfessorRabbitInstance.prototype.setPose = function (poseName) {
    if (POSE_PRESETS[poseName]) {
      this.poseName = poseName;
      if (this.poseSelect) this.poseSelect.value = poseName;
    }
    return this;
  };

  ProfessorRabbitInstance.prototype.setHologramMode = function (mode) {
    if (LATTICE_DATA[mode]) {
      this.hologramMode = mode;
      if (this.holoSelect) this.holoSelect.value = mode;
      this._rebuildHologramContent();
    }
    return this;
  };

  ProfessorRabbitInstance.prototype.setCameraPreset = function (preset) {
    if (CAMERA_PRESETS[preset]) {
      this.cameraPreset = preset;
      if (this.camSelect) this.camSelect.value = preset;
    }
    return this;
  };

  ProfessorRabbitInstance.prototype.setChalkboardText = function (title, equationOrCitation, bullets) {
    if (title !== undefined && title !== null) {
      this.chalkboardState.title = String(title);
    }
    if (equationOrCitation !== undefined && equationOrCitation !== null) {
      this.chalkboardState.equation = String(equationOrCitation);
    }
    if (Array.isArray(bullets)) {
      this.chalkboardState.bullets = bullets.map(function (b) { return String(b); });
    } else if (typeof bullets === 'string' && bullets.trim()) {
      this.chalkboardState.bullets = bullets.split('\n').filter(Boolean);
    }
    this._renderChalkboardCanvas();
    return this;
  };

  ProfessorRabbitInstance.prototype._ensureAudioContext = function () {
    if (!this.audioCtx) {
      var AudioCtx = global.AudioContext || global.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 512;
        this.analyser.smoothingTimeConstant = 0.65;
        this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(function () {});
    }
  };

  ProfessorRabbitInstance.prototype.speak = function (text, options) {
    var self = this;
    var opts = options || {};
    var cleanText = String(text || '').trim();
    if (!cleanText) return Promise.resolve();

    this.stop();

    if (opts.pose) this.setPose(opts.pose);
    if (opts.hologramMode) this.setHologramMode(opts.hologramMode);
    if (opts.chalkboard) {
      this.setChalkboardText(opts.chalkboard.title, opts.chalkboard.equation, opts.chalkboard.bullets);
    }

    var voiceId = opts.voice || this.voiceId || 'en-GB-RyanNeural';
    this.activeVisemeTimeline = textToVisemeTimeline(cleanText);
    this.speechStartPerf = performance.now();
    this.isSpeaking = true;
    this.isPaused = false;
    this.speechEngineLabel = 'Neural TTS (' + voiceId + ')';
    this._updateHUDText();

    if (typeof opts.onStart === 'function') {
      try { opts.onStart(); } catch (e) {}
    }

    return new Promise(function (resolve) {
      var ttsUrl = '/api/v1/professor-rabbit/tts?voice=' + encodeURIComponent(voiceId) + '&text=' + encodeURIComponent(cleanText.slice(0, 950));
      var audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';
      self.audioEl = audio;

      var fallbackTriggered = false;
      function triggerWebSpeechFallback() {
        if (fallbackTriggered) return;
        fallbackTriggered = true;
        self._speakWithWebSpeechFallback(cleanText, voiceId, opts, resolve);
      }

      audio.onplay = function () {
        self.speechStartPerf = performance.now();
        self.isSpeaking = true;
        self.isPaused = false;
        try {
          self._ensureAudioContext();
          if (self.audioCtx && self.analyser && !audio._sourceConnected) {
            var src = self.audioCtx.createMediaElementSource(audio);
            src.connect(self.analyser);
            self.analyser.connect(self.audioCtx.destination);
            audio._sourceConnected = true;
          }
        } catch (err) {
          // Proceed with timeline envelope if AudioContext attach fails
        }
      };

      audio.onended = function () {
        if (fallbackTriggered) return;
        self.isSpeaking = false;
        self.isPaused = false;
        self.currentViseme = 'REST';
        self._updateHUDText();
        if (typeof opts.onEnd === 'function') {
          try { opts.onEnd(); } catch (e) {}
        }
        resolve();
      };

      audio.onerror = function () {
        triggerWebSpeechFallback();
      };

      audio.src = ttsUrl;
      var playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          triggerWebSpeechFallback();
        });
      }
    });
  };

  ProfessorRabbitInstance.prototype._speakWithWebSpeechFallback = function (text, voiceId, opts, resolve) {
    var self = this;
    this.speechEngineLabel = 'Natural WebSpeech Synthesis';
    this.speechStartPerf = performance.now();
    this.isSpeaking = true;
    this._updateHUDText();

    if (!('speechSynthesis' in global) || typeof global.SpeechSynthesisUtterance === 'undefined') {
      // Pure visual viseme playback if headless browser lacks speechSynthesis
      var estMs = Math.min(18000, Math.max(2200, text.length * 52));
      this._fallbackTimer = setTimeout(function () {
        self.isSpeaking = false;
        self.currentViseme = 'REST';
        self._updateHUDText();
        if (typeof opts.onEnd === 'function') {
          try { opts.onEnd(); } catch (e) {}
        }
        resolve();
      }, estMs);
      return;
    }

    try {
      global.speechSynthesis.cancel();
    } catch (e) {}

    var utter = new global.SpeechSynthesisUtterance(text);
    this.activeUtterance = utter;

    var voices = global.speechSynthesis.getVoices() || [];
    var preferredNames = [
      'Microsoft Ryan Online (Natural)',
      'Microsoft Christopher Online (Natural)',
      'Microsoft Guy Online (Natural)',
      'Google UK English Male',
      'Daniel',
      'Arthur',
      'Google US English'
    ];
    var chosen = null;
    for (var p = 0; p < preferredNames.length && !chosen; p++) {
      var targetName = preferredNames[p].toLowerCase();
      for (var v = 0; v < voices.length; v++) {
        if ((voices[v].name || '').toLowerCase().indexOf(targetName) !== -1) {
          chosen = voices[v];
          break;
        }
      }
    }
    if (!chosen && voices.length > 0) {
      chosen = voices.find(function (vc) { return /^en/i.test(vc.lang || ''); }) || voices[0];
    }
    if (chosen) {
      utter.voice = chosen;
      this.speechEngineLabel = chosen.name.slice(0, 28);
    }

    utter.rate = opts.rate || 1.02;
    utter.pitch = opts.pitch || 0.98;

    utter.onboundary = function (ev) {
      if (typeof ev.charIndex === 'number') {
        var ch = text.charAt(ev.charIndex);
        self.currentViseme = charToViseme(ch);
      }
    };

    utter.onend = function () {
      self.isSpeaking = false;
      self.isPaused = false;
      self.currentViseme = 'REST';
      self._updateHUDText();
      if (typeof opts.onEnd === 'function') {
        try { opts.onEnd(); } catch (e) {}
      }
      resolve();
    };

    utter.onerror = function () {
      self.isSpeaking = false;
      self.currentViseme = 'REST';
      self._updateHUDText();
      resolve();
    };

    global.speechSynthesis.speak(utter);
  };

  ProfessorRabbitInstance.prototype.pause = function () {
    this.isPaused = true;
    if (this.audioEl && !this.audioEl.paused) {
      try { this.audioEl.pause(); } catch (e) {}
    }
    if ('speechSynthesis' in global && global.speechSynthesis.speaking) {
      try { global.speechSynthesis.pause(); } catch (e) {}
    }
    return this;
  };

  ProfessorRabbitInstance.prototype.resume = function () {
    this.isPaused = false;
    if (this.audioEl && this.audioEl.paused && this.isSpeaking) {
      try { this.audioEl.play(); } catch (e) {}
    }
    if ('speechSynthesis' in global && global.speechSynthesis.paused) {
      try { global.speechSynthesis.resume(); } catch (e) {}
    }
    return this;
  };

  ProfessorRabbitInstance.prototype.stop = function () {
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentViseme = 'REST';
    if (this._fallbackTimer) {
      clearTimeout(this._fallbackTimer);
      this._fallbackTimer = null;
    }
    if (this.audioEl) {
      try {
        this.audioEl.pause();
        this.audioEl.currentTime = 0;
      } catch (e) {}
      this.audioEl = null;
    }
    if ('speechSynthesis' in global) {
      try { global.speechSynthesis.cancel(); } catch (e) {}
    }
    this._updateHUDText();
    return this;
  };

  /**
   * ==========================================================================
   * GLOBAL SINGLETON & MULTI-INSTANCE ORCHESTRATOR: window.ProfessorRabbit3D
   * ==========================================================================
   */
  var instancesById = {};
  var primaryInstance = null;

  var ProfessorRabbit3D = {
    version: '3.0.0-THREE-R128-NEURAL-TTS',
    instances: instancesById,
    VISEME_TABLE: VISEME_TABLE,
    POSE_PRESETS: POSE_PRESETS,
    CAMERA_PRESETS: CAMERA_PRESETS,
    LATTICE_DATA: LATTICE_DATA,
    NEURAL_VOICES: NEURAL_VOICES,

    mount: function (containerIdOrEl, options) {
      var el = null;
      var key = 'default';
      if (typeof containerIdOrEl === 'string') {
        var cleanId = containerIdOrEl.replace(/^#/, '');
        key = cleanId;
        el = document.getElementById(cleanId) || document.querySelector(containerIdOrEl);
      } else if (containerIdOrEl && containerIdOrEl.nodeType === 1) {
        el = containerIdOrEl;
        key = el.id || ('pr3d_' + Object.keys(instancesById).length);
      }
      if (!el) {
        console.warn('[ProfessorRabbit3D.mount] Container not found:', containerIdOrEl);
        return null;
      }
      if (instancesById[key]) {
        instancesById[key].stop();
        instancesById[key]._destroyed = true;
      }
      var inst = new ProfessorRabbitInstance(el, options);
      instancesById[key] = inst;
      primaryInstance = inst;
      return inst;
    },

    getActiveInstance: function (containerId) {
      if (containerId && instancesById[containerId.replace(/^#/, '')]) {
        return instancesById[containerId.replace(/^#/, '')];
      }
      return primaryInstance || Object.values(instancesById)[0] || null;
    },

    speak: function (text, options) {
      var inst = this.getActiveInstance(options && options.containerId);
      if (!inst) return Promise.resolve();
      return inst.speak(text, options);
    },

    pause: function () {
      Object.values(instancesById).forEach(function (inst) { inst.pause(); });
    },

    resume: function () {
      Object.values(instancesById).forEach(function (inst) { inst.resume(); });
    },

    stop: function () {
      Object.values(instancesById).forEach(function (inst) { inst.stop(); });
    },

    setPose: function (poseName) {
      Object.values(instancesById).forEach(function (inst) { inst.setPose(poseName); });
    },

    setHologramMode: function (mode) {
      Object.values(instancesById).forEach(function (inst) { inst.setHologramMode(mode); });
    },

    setCameraPreset: function (preset) {
      Object.values(instancesById).forEach(function (inst) { inst.setCameraPreset(preset); });
    },

    setChalkboardText: function (title, equationOrCitation, bullets) {
      Object.values(instancesById).forEach(function (inst) {
        inst.setChalkboardText(title, equationOrCitation, bullets);
      });
    },

    setVoice: function (voiceId) {
      Object.values(instancesById).forEach(function (inst) {
        inst.voiceId = voiceId;
        if (inst.voiceSelect) inst.voiceSelect.value = voiceId;
      });
    },

    textToVisemeTimeline: textToVisemeTimeline
  };

  global.ProfessorRabbit3D = ProfessorRabbit3D;
})(typeof window !== 'undefined' ? window : this);
