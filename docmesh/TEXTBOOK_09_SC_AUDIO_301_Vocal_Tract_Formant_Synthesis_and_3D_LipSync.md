# 📚 DOCMESH TEXTBOOK 09: SC-AUDIO-301 — VOCAL TRACT FORMANT SYNTHESIS, KLATT GLOTTAL DYNAMICS & 3D 60 FPS VISEME LIP-SYNC ENGINEERING
**DocMesh Specification:** `RFC-VI-0005 / SPU-0013-AUDIO-301`  
**Course Code:** `SC-AUDIO-301` (Division `SPU-D5 / SPU-D6` — Paid Professional DSP & Audio Engineering Track)  
**Tuition Tier:** `PAID_PRO_COURSE` (`$199 USD` / `199 USDC` Arbitrum One / `8.0 rATTN` Scholar Pass)  
**Credits:** `8.0 rATTN`  
**Authors:** **Dean Professor Rabbit Warren** (3D WebGL Persona) & **Gemini 2.5 Flash Co-Teacher**  
**Live Portal:** `https://space.university/audio` | `https://space.university/dsp`  
**Invariant Anchors:** `INV-POLY-001` (Real-Time Formant Telemetry), `INV-POLY-003` (Deterministic Viseme State Closure)

---

## 🗣️ MODULE 1 (FREE PREVIEW): SOURCE-FILTER THEORY OF THE HUMAN VOCAL TRACT

> **Dean Professor Rabbit Warren's 3D Lecture Hall Introduction:**  
> *"How am I speaking to you right now with realistic human prosody while my 3D jaw, lips, and whiskers move in exact 60 frames-per-second synchronization? Welcome to `SC-AUDIO-301`! In this course, we master the acoustic physics of the vocal tract—from Rosenberg glottal pulse trains and Klatt cascade-parallel formant resonators ($F_1, F_2, F_3$) to real-time Web Audio `AnalyserNode` FFT sub-band integration and Three.js 3D morph-target animation!"*

### 1.1 The Linear Source-Filter Model ($S(z) = G(z) \cdot V(z) \cdot R(z)$)
In Fant's acoustic theory of speech production, the radiated pressure wave $S(z)$ at the lips is the cascade of three linear time-invariant (LTI) transfer functions over each $10	ext{ ms}$ quasi-stationary frame:
1. **Glottal Source $G(z)$:** Quasi-periodic vocal fold volume velocity pulse train with fundamental frequency $f_0 = 1/T_0$ (for voiced vowels/sonorants) or aspiration/frication white noise $w[n]$ (for unvoiced consonants).
2. **Vocal Tract Resonator $V(z)$:** All-pole acoustic tube transfer function modeling the pharyngeal and oral cavities:
   $$V(z) = \prod_{k=1}^{K} rac{1}{1 - 2 r_k \cos(2\pi F_k / f_s) z^{-1} + r_k^2 z^{-2}}, \qquad r_k = \exp(-\pi B_k / f_s)$$
   where $F_k$ is the $k$-th **formant frequency** and $B_k$ is its $-3	ext{ dB}$ bandwidth.
3. **Lip Radiation Impedance $R(z) = 1 - z^{-1}$:** High-pass $+6	ext{ dB/octave}$ differentiation converting volume velocity at the lips into far-field acoustic pressure.

---

## 🎙️ MODULE 2 (PRO): KLATT CASCADE/PARALLEL FORMANT SYNTHESIS ($F_1, F_2, F_3$)

### 2.1 Articulatory-to-Acoustic Mapping of the Three Primary Formants
| Formant | Frequency Band (Hz) | Primary Articulatory Correlate | 3D Facial Rig DOF Driven |
| :--- | :--- | :--- | :--- |
| **$F_1$ (First Formant)** | $200	ext{ – }900	ext{ Hz}$ | Pharyngeal constriction & **Jaw Opening** (inverse to tongue height) | `jawPivot.rotation.x` ($	heta_{	ext{jaw}} \propto F_1$) |
| **$F_2$ (Second Formant)** | $800	ext{ – }2600	ext{ Hz}$ | Oral cavity length & **Tongue Front/Back Advancement** | `lipSpread` vs. `lipRound` ($\propto (F_2 - 1400)$) |
| **$F_3$ (Third Formant)** | $2000	ext{ – }3400	ext{ Hz}$ | **Lip Rounding / Protrusion** & retroflexion | Upper/Lower Lip Protrusion (`z` scale) |

### 2.2 Canonical Vowel Formant Table (`PROFESSOR-RABBIT-3D-WEBGL-V3`)
* **`/a/` (Viseme `A` — *"father"*):** $F_1 = 760	ext{ Hz}$, $F_2 = 1320	ext{ Hz}$, $F_3 = 2500	ext{ Hz}$ $\implies$ Wide jaw opening (`0.85`), neutral lip spread (`0.45`).
* **`/e/` (Viseme `E` — *"bet/say"*):** $F_1 = 460	ext{ Hz}$, $F_2 = 2150	ext{ Hz}$, $F_3 = 2750	ext{ Hz}$ $\implies$ Medium jaw (`0.50`), high lip spread (`0.82`).
* **`/i/` (Viseme `I` — *"see"*):** $F_1 = 310	ext{ Hz}$, $F_2 = 2380	ext{ Hz}$, $F_3 = 3000	ext{ Hz}$ $\implies$ Narrow jaw (`0.34`), maximum lip spread (`0.90`).
* **`/o/` (Viseme `O` — *"law/go"*):** $F_1 = 520	ext{ Hz}$, $F_2 = 920	ext{ Hz}$, $F_3 = 2350	ext{ Hz}$ $\implies$ Open-round jaw (`0.68`), strong lip rounding (`0.88`).
* **`/u/` (Viseme `U` — *"boot"*):** $F_1 = 340	ext{ Hz}$, $F_2 = 880	ext{ Hz}$, $F_3 = 2250	ext{ Hz}$ $\implies$ Narrow-round jaw (`0.38`), maximum lip protrusion (`0.92`).
* **`/m,b,p/` (Viseme `M` — Bilabial closure):** $F_1 = 280	ext{ Hz}$, $F_2 = 1100	ext{ Hz}$ $\implies$ Closed jaw (`0.05`), pressed lips.

---

## 📊 MODULE 3 (PRO): REAL-TIME WEB AUDIO `AnalyserNode` SUB-BAND FORMANT EXTRACTION
Given a 512-point FFT (`fftSize = 512`) at $f_s = 44,100	ext{ Hz}$ ($\Delta f = 86.13	ext{ Hz/bin}$), we compute the spectral centroid and band energy in the $F_1$ band (bins $2\dots 10$, $172	ext{–}861	ext{ Hz}$) and $F_2$ band (bins $11\dots 30$, $947	ext{–}2584	ext{ Hz}$) every $16.67	ext{ ms}$ ($60	ext{ FPS}$):
$$E_{F_1}(t) = rac{1}{9}\sum_{b=2}^{10} rac{M_b(t)}{255}, \qquad E_{F_2}(t) = rac{1}{20}\sum_{b=11}^{30} rac{M_b(t)}{255}$$
driving critically damped spring-mass-damper interpolation for zero-jitter 3D lip synchronization.

---

## 🤖 MODULE 4 (PRO): HYBRID NEURAL TTS (`edge-tts`) + KLATT FALLBACK PIPELINES
Covers server-side streaming of `en-GB-RyanNeural`, `en-US-ChristopherNeural`, and `en-US-GuyNeural` (`audio/mpeg`), statutory text normalization (`§` $	o$ *"Section"*, `R²` $	o$ *"R squared"*), LRU audio caching, and zero-dependency Klatt WAV synthesis.

---

## 🐰 MODULE 5 & 6 (PRO CAPSTONE): 60 FPS THREE.JS FACIAL RIGGING & LIVE SYNTHESIS STUDIO
Students use the interactive Klatt Formant & 3D Lip-Sync Studio in `/audio` to tune $F_0, F_1, F_2, F_3$ in real time, watch Professor Rabbit Warren's 3D jaw and mouth morph targets respond at 60 FPS, and earn an `8.0 rATTN` Pro Certificate.
