# 📚 DOCMESH TEXTBOOK 11: SC-GRANT-201 — SOVEREIGN SCIENTIFIC, FEDERAL SBIR/STTR, NIH/NSF & ENDOWMENT GRANTWRITING STUDIO
**DocMesh Specification:** `RFC-VI-0005 / SPU-0013-GRANT-201`  
**Course Code:** `SC-GRANT-201` (Division `SPU-D1 / SPU-D5 / SPU-D6` — Paid Professional Research Funding & Grantwriting Track)  
**Tuition Tier:** `PAID_PRO_COURSE` (`$179 USD` / `179 USDC` Arbitrum One / `8.0 rATTN` Scholar Pass)  
**Credits:** `8.0 rATTN`  
**Authors:** **Dean Professor Rabbit Warren** (3D WebGL Persona) & **Gemini 2.5 Flash Co-Teacher**  
**Live Portal:** `https://space.university/grants` | `https://space.university/grantwriting`  
**Invariant Anchors:** `INV-POLY-001` (Empirical Power & Null Control Rigor), `INV-POLY-003` (SHA-256 Grant Milestone Provenance)

---

## 🏛️ MODULE 1 (FREE PREVIEW): THE ANATOMY OF A WINNING SPECIFIC AIMS PAGE (NIH R01/R21 & NSF PITCH)

> **Dean Professor Rabbit Warren's 3D Lecture Hall Introduction:**  
> *"Welcome to `SC-GRANT-201`: The Space.University Paid Professional Grantwriting Studio! Whether you are applying for a $305,000 NSF/NIH SBIR Phase I award, a $2.5 million NIH R01 research grant, or a private philanthropic endowment, 85% of your funding fate is decided on a single page: the **Specific Aims Page**! On my 3D chalkboard, we structure every Specific Aims page as a four-paragraph logical proof: (1) The Opening Hook & Unmet Need, (2) The Critical Knowledge Gap & Preliminary Data, (3) The Central Hypothesis & Three Orthogonal Aims, and (4) The Transformative Payoff & Field Impact!"*

### 1.1 The Golden Rule of Orthogonal Specific Aims
Never make Aim 2 depend on the success of Aim 1! If Aim 1 is a risky biological or hardware build and Aim 2 requires the output of Aim 1, a Study Section reviewer will write: *"Fatal dependency: if Aim 1 fails, Aims 2 and 3 collapse."*
Instead, design **Orthogonal Aims** ($A_1 \perp A_2 \perp A_3$) that test independent facets of the Central Hypothesis $\mathcal{H}_0$:
$$	ext{Success}(A_i \mid 
eg 	ext{Success}(A_j)) = 	ext{ independent}, \quad orall i 
eq j \in \{1, 2, 3\}$$

---

## 🚀 MODULE 2 (PRO): FEDERAL SBIR/STTR PHASE I ($305K) & PHASE II ($2.0M) ARCHITECTURE
1. **SBIR vs. STTR Statutory Distinctions:**
   - **SBIR (Small Business Innovation Research):** Principal Investigator (PI) must be primarily employed ($>50\%$) by the small business concern (SBC); up to $33\%$ (Phase I) or $50\%$ (Phase II) may be subcontracted to a university research institution.
   - **STTR (Small Business Technology Transfer):** Requires formal cooperative R&D with a non-profit research institution (university/national lab), with $\ge 40\%$ of work performed by the SBC and $\ge 30\%$ by the research institution.
2. **Quantitative Go/No-Go Technical Milestones:** Every Phase I Specific Aim must conclude with a falsifiable quantitative acceptance metric (e.g., *"Achieve $R^2 \ge 0.80$ across $N \ge 1,000$ non-homologous PDB structures with $\Delta f = 0.000000	ext{ Hz}$ cross-runtime parity"*).

---

## 📊 MODULE 3 (PRO): STATISTICAL POWER, RIGOR & REPRODUCIBILITY, AND PRE-REGISTERED NULL CONTROLS
Under NIH *Rigor and Reproducibility* guidelines, proposals must state exact sample-size power equations:
$$N = \left(rac{(z_{1-lpha/2} + z_{1-eta})\,\sigma}{\delta}ight)^2$$
and define **Explicit Negative Controls** (such as our Modulo-2 scale-erasure control showing $R^2 = 80.48\% 	o 0.06\%$ when octave scale is discarded) so reviewers see unassailable scientific honesty.

---

## 💰 MODULE 4 (PRO): SF-424 (R&R) FEDERAL BUDGET ENGINEERING & MTDC F&A CALCULATIONS
Given Direct Personnel + Fringe ($D_{	ext{pers}}$), Materials & Supplies ($D_{	ext{mat}}$), Travel ($D_{	ext{trv}}$), Capital Equipment $> \$5,000$ ($E_{	ext{cap}}$), and Subawards ($S_k$), the **Modified Total Direct Cost (MTDC)** base excludes capital equipment and subaward costs exceeding the first $\$25,000$ of each subaward:
$$	ext{MTDC} = D_{	ext{pers}} + D_{	ext{mat}} + D_{	ext{trv}} + \sum_k \min(S_k, \$25,000)$$
$$	ext{Total Federal Request} = 	ext{Total Direct Costs} + r_{	ext{F\&A}} \cdot 	ext{MTDC}$$

---

## 🌐 MODULE 5 & 6 (PRO CAPSTONE): NIH 1–9 STUDY SECTION SIMULATOR & ISO 32000-1 GRANT PDF COMPILER
Students draft their Specific Aims and SF-424 budget in the live `/grants` studio, run automated NIH 1–9 Study Section scoring (Significance, Investigator, Innovation, Approach, Environment), and compile an ISO 32000-1 Vector PDF Grant Package with a SHA-256 receipt.
