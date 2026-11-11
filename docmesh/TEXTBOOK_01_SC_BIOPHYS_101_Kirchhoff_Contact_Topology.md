# 📘 TEXTBOOK 01: `SC-BIOPHYS-101` — Foundations of 3D Macromolecular Kirchhoff Contact Topology
### *Co-Authored by Professor Rabbit (Intuitive Topology & Whiteboard Derivations) & Gemini LLM (Deterministic Numerical Verification)*
* **Course Code:** `SC-BIOPHYS-101` (`4.0 rATTN` Competency Credits)
* **Institutional Standard:** `SPU-0011` / `SPU-0013` / `RFC-VI-0005`
* **Empirical Benchmark Anchor:** `SOV-BIOPHYS-N1040-RC1-20261018` ($N = 1,040$ Non-Redundant Structures across $130$ Taxonomic Species)

---

## Chapter 1: Three-Dimensional $\text{C}_\alpha / \text{P} / \text{C4}'$ Coarse-Grained Coordinates & Radius of Gyration ($R_g$)

### 1.1 Professor Rabbit's "Rabbit Warren" Intuition: From Atomic Clouds to Structural Chambers
Welcome to the first burrow of `SC-BIOPHYS-101`! When you open an experimental macromolecular coordinate file from the Research Collaboratory for Structural Bioinformatics Protein Data Bank (RCSB PDB)—resolved by X-ray crystallography, cryogenic electron microscopy (cryo-EM), or nuclear magnetic resonance (NMR)—you are greeted by thousands of individual atoms. A medium-sized enzyme of $400$ amino acids contains more than $3,000$ heavy atoms plus hydrogens.

If you want to understand the **slowest, global collective breathing and flexing motions** of a macromolecule, tracking every picosecond covalent bond vibration ($O\text{--}H$ or $C\text{=}O$ stretching at $\sim 30\text{--}100\;\text{THz}$) is like trying to map the structural stability of an underground **Rabbit Warren** by measuring the rustling of every single blade of grass on the ceiling. Instead, collective terahertz mechanics ($\nu_1 \sim 0.03\text{--}0.60\;\text{THz}$) are governed by the **three-dimensional architecture of the main structural chambers**:
* **Polypeptide Chains (Proteins):** Each amino acid residue $i \in \{1, \dots, N\}$ is represented by its backbone alpha-carbon atom ($\text{C}_\alpha$) at Cartesian coordinate $\mathbf{r}_i = (x_i, y_i, z_i)^\top \in \mathbb{R}^3$, with uniform effective residue mass $m_0 = 110\;\text{Da} \approx 1.8266 \times 10^{-25}\;\text{kg}$.
* **Polynucleotide Chains (RNA / DNA):** Each nucleotide unit is represented by its backbone phosphorus ($\text{P}$) and/or ribose $\text{C4}'$ atom at $\mathbf{r}_i \in \mathbb{R}^3$.

### 1.2 First-Principles Derivation of Center of Mass ($\mathbf{r}_{\text{CM}}$) and Radius of Gyration ($R_g$)
Given $N$ coarse-grained backbone nodes $\{\mathbf{r}_1, \mathbf{r}_2, \dots, \mathbf{r}_N\} \subset \mathbb{R}^3$, the unweighted geometric centroid (or uniform-mass center of mass $\mathbf{r}_{\text{CM}}$) is:

$$\mathbf{r}_{\text{CM}} = \frac{1}{N}\sum_{i=1}^{N} \mathbf{r}_i$$

Translating all coordinates into the center-of-mass frame defines the relative position vectors $\tilde{\mathbf{r}}_i = \mathbf{r}_i - \mathbf{r}_{\text{CM}}$, which satisfy $\sum_{i=1}^N \tilde{\mathbf{r}}_i = \mathbf{0}$. The **Radius of Gyration ($R_g$)** measures the root-mean-square radial dispersion of the macromolecular fold from its center of mass:

$$R_g = \sqrt{\frac{1}{N}\sum_{i=1}^{N} \|\mathbf{r}_i - \mathbf{r}_{\text{CM}}\|_2^2} = \sqrt{\frac{1}{2N^2}\sum_{i=1}^{N}\sum_{j=1}^{N} d_{ij}^2}$$

where $d_{ij} = \|\mathbf{r}_i - \mathbf{r}_j\|_2 = \sqrt{(x_i - x_j)^2 + (y_i - y_j)^2 + (z_i - z_j)^2}$ is the pairwise Euclidean distance in Angstroms ($\text{\AA}$).

> [!IMPORTANT]
> **Physical Scaling of $R_g$:** For compact globular proteins packed at near-crystalline interior density, Flory's polymer scaling law for a collapsed globule ($\nu_{\text{Flory}} \approx 1/3$) dictates $R_g \propto N^{1/3}$. However, proteins with identical $N$ can exhibit vastly different $R_g$ depending on whether they form a spherical TIM barrel ($\kappa \approx 1.29$) or an elongated coiled-coil ($\kappa > 4.0$).

---

## Chapter 2: The Distance-Weighted Kirchhoff Laplacian Matrix $\mathbf{\Gamma}$ at Cutoff $R_c = 7.5\;\text{\AA}$

### 2.1 Professor Rabbit's Intuition: Load-Bearing Tunnels in the Warren
Why does a compact globular fold vibrate at a higher fundamental frequency than a loosely packed fold of the same size? Because every non-covalent spatial contact within the first coordination shell—hydrogen bonds, salt bridges, hydrophobic van der Waals packing, and disulfide bridges—acts as a **load-bearing structural strut** connecting chamber $i$ to chamber $j$.

In standard unweighted Gaussian Network Models (GNM, Tirion 1996; Bahar, Atilgan & Erman 1997), all residue pairs within a cutoff $R_c \approx 7.0\text{--}7.5\;\text{\AA}$ receive an identical unit spring constant. In our high-precision sovereign formulation (`SC-BIOPHYS-101` / `SC-BIOPHYS-201`), we incorporate **inverse-square distance-weighted edge stiffness** at spatial cutoff $R_c = 7.5\;\text{\AA}$ normalized by the covalent $\text{C}_\alpha\text{--}\text{C}_\alpha$ virtual bond reference distance $R_0 = 3.8\;\text{\AA}$, alongside the unweighted topological degree $\langle z \rangle$ at $R_c = 7.0\text{--}7.5\;\text{\AA}$.

### 2.2 Mathematical Construction of $\mathbf{\Gamma}$ and Proof of Positive Semi-Definiteness
For any pair of distinct coarse-grained backbone nodes $(i, j)$ separated by Euclidean distance $d_{ij} = \|\mathbf{r}_i - \mathbf{r}_j\|_2$, the inverse-square harmonic contact weight $w_{ij}$ is:

$$w_{ij} = \begin{cases} \left(\dfrac{R_0}{d_{ij}}\right)^2 & \text{if } i \neq j \text{ and } d_{ij} \le R_c = 7.5\;\text{\AA}, \\[8pt] 0 & \text{if } i \neq j \text{ and } d_{ij} > R_c = 7.5\;\text{\AA}. \end{cases}$$

*(In the unweighted adjacency formulation used for integer coordination degree $z_i$, $A_{ij} = 1$ if $0 < d_{ij} \le R_c$ and $0$ otherwise.)*

The $N \times N$ symmetric **Kirchhoff Contact Laplacian Matrix** $\mathbf{\Gamma} \in \mathbb{R}^{N \times N}$ is defined element-wise as:

$$\Gamma_{ij} = \begin{cases} -w_{ij} & \text{if } i \neq j, \\[6pt] \displaystyle\sum_{k \neq i} w_{ik} = z_i & \text{if } i = j. \end{cases}$$

**Theorem 2.1 (Quadratic Form & Positive Semi-Definiteness of $\mathbf{\Gamma}$):**
For any displacement vector $\mathbf{x} = (x_1, x_2, \dots, x_N)^\top \in \mathbb{R}^N$, the quadratic form $\mathbf{x}^\top \mathbf{\Gamma} \mathbf{x}$ satisfies:

$$\mathbf{x}^\top \mathbf{\Gamma} \mathbf{x} = \sum_{i=1}^{N} z_i x_i^2 - \sum_{i=1}^{N}\sum_{j \neq i} w_{ij} x_i x_j = \frac{1}{2}\sum_{i=1}^{N}\sum_{j=1}^{N} w_{ij} (x_i - x_j)^2 \ge 0$$

*Proof:* Since $w_{ij} = w_{ji} \ge 0$ and $(x_i - x_j)^2 \ge 0$ for all $(i,j)$, $\mathbf{x}^\top \mathbf{\Gamma} \mathbf{x} \ge 0$ for all $\mathbf{x} \in \mathbb{R}^N$. Furthermore, choosing the uniform translation vector $\mathbf{1} = (1, 1, \dots, 1)^\top$ gives $x_i - x_j = 0$ for all $(i,j)$, so $\mathbf{\Gamma}\mathbf{1} = \mathbf{0}$ and $\lambda_0 = 0$. $\blacksquare$

---

## Chapter 3: Fiedler Algebraic Connectivity $\lambda_1$, Fundamental Frequency $\nu_1(\text{THz})$, and Debye-Waller $B$-Factors

### 3.1 Spectral Decomposition and the Fiedler Mode ($\lambda_1, \mathbf{u}_1$)
Because $\mathbf{\Gamma}$ is real and symmetric ($\mathbf{\Gamma} = \mathbf{\Gamma}^\top$), the spectral theorem guarantees an orthonormal eigenbasis $\mathbf{U} = [\mathbf{u}_0, \mathbf{u}_1, \dots, \mathbf{u}_{N-1}]$ ($\mathbf{U}^\top \mathbf{U} = \mathbf{I}_N$) with real non-negative eigenvalues ordered as:

$$0 = \lambda_0 \le \lambda_1 \le \lambda_2 \le \dots \le \lambda_{N-1}$$

By Fiedler's Theorem of Algebraic Connectivity (1973), $\lambda_1 > 0$ **if and only if** the macromolecular contact graph $G = (V, E)$ is a single connected component.
* **Eigenvalue $\lambda_1$ (Algebraic Connectivity):** Measures the global elastic stiffness across the weakest mechanical bottleneck of the fold.
* **Eigenvector $\mathbf{u}_1$ (Fiedler Vector):** Partitions the macromolecule into two dynamically opposing lobes according to the sign of its components ($u_{1,i} > 0$ vs. $u_{1,i} < 0$). Zero-crossings ($u_{1,i} \approx 0$) pinpoint inter-domain mechanical hinges!

### 3.2 Physical Conversion to Fundamental Collective Frequency $\nu_1(\text{THz})$
Under the harmonic potential $V(\Delta\mathbf{r}) = \frac{1}{2}\gamma_{\text{eff}}\sum_{i,j} \Gamma_{ij} (\Delta\mathbf{r}_i \cdot \Delta\mathbf{r}_j)$ with effective force constant $\gamma_{\text{eff}} = 1.0\;\text{N/m}$ and residue mass $m_0 = 110\;\text{Da} = 1.82659 \times 10^{-25}\;\text{kg}$, the angular frequency of mode $k \ge 1$ is $\omega_k = \sqrt{\gamma_{\text{eff}}\lambda_k / m_0}$, yielding the fundamental cyclical frequency in terahertz ($10^{12}\;\text{Hz}$):

$$\nu_1(\text{THz}) = \frac{1}{2\pi}\sqrt{\frac{\gamma_{\text{eff}}\,\lambda_1}{m_0}} \times 10^{-12}$$

### 3.3 The Moore-Penrose Pseudoinverse $\mathbf{\Gamma}^+$ and Crystallographic Debye-Waller $B$-Factors
Because $\lambda_0 = 0$, $\mathbf{\Gamma}$ is singular and non-invertible on the full space $\mathbb{R}^N$. Projecting out the trivial rigid-body translational subspace $\text{span}(\mathbf{u}_0)$ defines the **Moore-Penrose Pseudoinverse** $\mathbf{\Gamma}^+$:

$$\mathbf{\Gamma}^+ = \sum_{k=1}^{N-1} \frac{1}{\lambda_k}\,\mathbf{u}_k \mathbf{u}_k^\top$$

Applying the classical equipartition theorem at absolute temperature $T$ with Boltzmann constant $k_B = 1.380649 \times 10^{-23}\;\text{J/K}$, the equilibrium isotropic mean-square fluctuation of residue $i$ is $\langle (\Delta\mathbf{r}_i)^2 \rangle = \frac{3 k_B T}{\gamma_{\text{eff}}} (\mathbf{\Gamma}^+)_{ii}$. Consequently, the theoretical **Debye-Waller Crystallographic Temperature Factor ($B_i$)** is:

$$B_i = \frac{8\pi^2}{3}\langle (\Delta\mathbf{r}_i)^2 \rangle = \frac{8\pi^2 k_B T}{\gamma_{\text{eff}}}\,\left(\mathbf{\Gamma}^+\right)_{ii} = \frac{8\pi^2 k_B T}{\gamma_{\text{eff}}}\sum_{k=1}^{N-1} \frac{u_{k,i}^2}{\lambda_k}$$

Notice that the $k=1$ Fiedler mode carries the largest weight $1/\lambda_1$, meaning global topological connectivity dominates thermal atomic displacement profiles.

---

## Chapter 4: The $N = 1,040$ Collective THz Scaling Law vs. 1D Sequence Length

### 4.1 Derivation of the Topological Packing Density Predictor ($\langle z \rangle / R_g$)
How can we predict $\nu_1(\text{THz})$ directly from macroscopic geometric invariants of the fold?
1. Increasing the **mean coordination degree** $\langle z \rangle = \frac{1}{N}\sum_{i=1}^N z_i$ stiffens the local contact network, raising $\lambda_1$ and $\nu_1$.
2. Increasing the **radius of gyration** $R_g$ lengthens the acoustic propagation path across the globule, lowering $\nu_1 \propto R_g^{-1}$.

Combining these two opposing physical mechanisms defines the **3D Contact Packing Density Predictor**:

$$\xi_{3\text{D}} = \frac{\langle z \rangle}{R_g} \quad \left[\text{units: contacts}\cdot\text{\AA}^{-1}\right]$$

### 4.2 Empirical Validation Across $N = 1,040$ Non-Redundant PDB Structures
Across the primary non-redundant benchmark of **$N = 1,040$ experimentally resolved PDB structures** ($30 \le N_{\text{C}_\alpha} \le 994$, spanning $130$ taxonomic species), nonlinear power-law and log-log ordinary least squares regression establish the governing law (`SPU-0011` / `SOV-BIOPHYS-N1040-RC1-20261018`):

$$\boxed{\nu_1(\text{THz}) = 0.42338\,\left(\frac{\langle z \rangle}{R_g}\right)^{1.1194}}$$

| Validation Regime / Predictor | Cohort Size ($N$) | Coefficient of Determination ($R^2$) | Correlation & Error Metrics | Physical Interpretation |
| :--- | :---: | :---: | :--- | :--- |
| **3D Contact Topology ($\langle z \rangle / R_g$)** | $1,040$ | **$R^2 = 0.8048$ ($80.48\%$)** | $r = 0.8971$ ($p = 1.98 \times 10^{-369}$), $\rho = 0.9035$ | Primary super-linear scaling law ($\beta = 1.1194$) |
| **10-Fold Cross-Validation** | $1,040$ | **$R^2_{\text{CV}} = 0.8039$ ($80.39\%$)** | $\text{RMSE}_{\text{CV}} = 0.0363\;\text{THz}$ | Zero overfitting across 10 stratified folds |
| **80/20 Out-of-Sample Holdout** | $832 \to 208$ | **$R^2_{\text{test}} = 0.8027$ ($80.27\%$)** | $\text{RMSE}_{\text{test}} = 0.0369\;\text{THz}$ | High out-of-sample predictive stability |
| **Curated High-Diversity Anchor** | $115$ | **$R^2 = 0.8115$ ($81.15\%$)** | $r = 0.9008$ | Canonical structural bioinformatics subset |
| **Radius of Gyration Alone ($1 / R_g$)** | $1,040$ | $R^2 = 0.6626$ ($66.26\%$) | $\Delta R^2 = -0.1422$ vs. $\langle z \rangle / R_g$ | Local coordination $\langle z \rangle$ adds $+14.22\%$ variance explained |
| **1D Sequence Length ($1 / \sqrt{N_{\text{C}_\alpha}}$)** | $1,040$ | **$R^2 = 0.1602$ ($16.02\%$)** | $5.02\times$ weaker than 3D contact law | 1D chain length fails to capture 3D fold compactness |

> [!TIP]
> **Why 1D Sequence Length Fails ($16.02\%$ vs. $80.48\%$):** Two proteins of identical chain length $N = 300$ can fold into a compact $\alpha/\beta$ barrel ($R_g \approx 17.5\;\text{\AA}$, high $\langle z \rangle$) or an open horseshoe repeat ($R_g \approx 28.0\;\text{\AA}$, low $\langle z \rangle$). Relying on 1D sequence length or molecular weight alone misses **$64.46$ percentage points** of physical variance—a **$5.02\times$ explanatory advantage** for 3D contact topology.

---

## Chapter 5: Cross-Kingdom Universality ($R^2_{\text{OOS}} = 0.8612$), Worked Problems & Executable Code

### 5.1 Cross-Kingdom Taxonomic Generalization ($619 \to 421$)
Does the scaling law $\nu_1 = 0.42338\,(\langle z \rangle / R_g)^{1.1194}$ reflect an evolutionary quirk of mammalian proteins, or is it a universal physical law of three-dimensional polypeptide packing?

To test this rigorously, the $N = 1,040$ benchmark was partitioned by taxonomic lineage:
* **Training Set ($N_{\text{train}} = 619$):** Exclusively mammalian structures (*Homo sapiens*, *Bos taurus*, *Mus musculus*, *Sus scrofa*, *Oryctolagus cuniculus*).
* **Zero-Shot Out-of-Sample Test Set ($N_{\text{OOS}} = 421$):** Exclusively non-mammalian kingdoms—Bacteria (*Escherichia coli*, *Bacillus subtilis*, *Thermotoga maritima*), Archaea (*Pyrococcus furiosus*, *Sulfolobus solfataricus*), Viruses (Bacteriophage T4, HIV-1, Influenza), Fungi (*Saccharomyces cerevisiae*), and Viridiplantae (*Spinacia oleracea*, *Arabidopsis thaliana*).

Evaluating the mammalian-calibrated parameters $(a = 0.42338, \beta = 1.1194)$ directly on the $N_{\text{OOS}} = 421$ non-mammalian cohort with zero parameter re-fitting yields:

$$R^2_{\text{OOS}} = 0.8612 \quad (86.12\% \text{ variance explained})$$

Furthermore, stratifying by biomechanical class across the full $N = 1,040$ dataset reveals:
* **Catalytic Enzymes ($N = 776$):** $R^2 = 0.8087$ with super-linear exponent $\beta = 1.1602$ (high interior coordination stiffness required to pre-organize catalytic triads).
* **Structural & Fibrillar Proteins ($N = 264$):** $R^2 = 0.7859$ with sub-linear exponent $\beta = 0.9036$ (reflecting anisotropic elongation explored in `SC-BIOPHYS-201`).

---

### 5.2 Gemini LLM Deterministic Python Reference Implementation (`LAB-101`)

```python
"""
SC-BIOPHYS-101 Reference Engine: 3D Kirchhoff Contact Laplacian, Moore-Penrose
Pseudoinverse B-Factor Predictor, and N=1,040 Collective THz Scaling Law.
Complies with RULE-VI-26 (IEEE-754 float64 determinism, residual <= 1e-12).
"""
import numpy as np
from typing import Dict, Any, Tuple

# Physical Constants (SI / Biophysical Standard)
GAMMA_EFF_N_PER_M: float = 1.0                   # Effective spring constant (1.0 N/m)
MASS_CA_KG: float = 110.0 * 1.66053906660e-27    # 110 Da in kg (1.826593e-25 kg)
K_BOLTZMANN: float = 1.380649e-23                # J/K
TEMP_KELVIN: float = 300.0                       # 300 K
R0_REF_ANGSTROM: float = 3.8                     # Virtual C-alpha bond length (A)
RC_CUTOFF_ANGSTROM: float = 7.5                  # Spatial cutoff (A)


def compute_radius_of_gyration(coords: np.ndarray) -> float:
    """Computes Radius of Gyration R_g (in Angstroms) from (N, 3) coordinate array."""
    coords_f64 = np.asarray(coords, dtype=np.float64)
    centroid = np.mean(coords_f64, axis=0, keepdims=True)
    rel = coords_f64 - centroid
    rg_sq = np.mean(np.sum(rel ** 2, axis=1))
    return float(np.sqrt(rg_sq))


def assemble_kirchhoff_laplacian(
    coords: np.ndarray,
    r_cutoff: float = RC_CUTOFF_ANGSTROM,
    r0_ref: float = R0_REF_ANGSTROM,
    distance_weighted: bool = True
) -> Tuple[np.ndarray, float]:
    """
    Assembles the symmetric N x N Kirchhoff Laplacian matrix Gamma and computes
    the mean unweighted topological coordination degree <z>.
    """
    coords_f64 = np.asarray(coords, dtype=np.float64)
    n_res = coords_f64.shape[0]
    diff = coords_f64[:, None, :] - coords_f64[None, :, :]
    dist_mat = np.sqrt(np.sum(diff ** 2, axis=-1))

    contact_mask = (dist_mat > 1e-12) & (dist_mat <= r_cutoff)
    mean_unweighted_degree = float(np.mean(np.sum(contact_mask, axis=1)))

    if distance_weighted:
        weights = np.where(contact_mask, (r0_ref / np.maximum(dist_mat, 1e-12)) ** 2, 0.0)
    else:
        weights = contact_mask.astype(np.float64)

    gamma = -weights
    np.fill_diagonal(gamma, np.sum(weights, axis=1))
    return gamma, mean_unweighted_degree


def solve_kirchhoff_spectrum_and_bfactors(
    coords: np.ndarray,
    exp_b_factors: np.ndarray | None = None
) -> Dict[str, Any]:
    """
    Diagonalizes Gamma, verifies translational zero-mode invariance (lambda_0 <= 1e-12),
    extracts Fiedler mode lambda_1 and nu_1 (THz), computes Moore-Penrose pseudoinverse
    Gamma^+, and evaluates theoretical Debye-Waller B-factors.
    """
    rg = compute_radius_of_gyration(coords)
    gamma, mean_z = assemble_kirchhoff_laplacian(coords, distance_weighted=False)
    evals, evecs = np.linalg.eigh(gamma)

    lambda_0 = float(abs(evals[0]))
    assert lambda_0 <= 1e-12, f"Translational invariance violated: lambda_0 = {lambda_0}"

    lambda_1 = float(evals[1])
    fiedler_vec = evecs[:, 1]

    # Exact analytical THz frequency from lambda_1
    omega_1 = np.sqrt((GAMMA_EFF_N_PER_M * max(lambda_1, 0.0)) / MASS_CA_KG)
    nu_1_thz = float((omega_1 / (2.0 * np.pi)) * 1e-12)

    # N=1,040 empirical scaling law prediction
    xi_3d = mean_z / rg
    nu_1_scaling_thz = float(0.42338 * (xi_3d ** 1.1194))

    # Moore-Penrose pseudoinverse stripping zero mode k=0
    inv_pos_evals = np.where(evals[1:] > 1e-10, 1.0 / evals[1:], 0.0)
    gamma_pinv_diag = np.sum((evecs[:, 1:] ** 2) * inv_pos_evals[None, :], axis=1)

    prefactor = (8.0 * (np.pi ** 2) * K_BOLTZMANN * TEMP_KELVIN / GAMMA_EFF_N_PER_M) * 1e20
    theo_b_factors = prefactor * gamma_pinv_diag

    r_b_corr = None
    if exp_b_factors is not None and len(exp_b_factors) == len(theo_b_factors):
        r_b_corr = float(np.corrcoef(theo_b_factors, exp_b_factors)[0, 1])

    return {
        "n_residues": int(coords.shape[0]),
        "rg_angstrom": round(rg, 4),
        "mean_coordination_z": round(mean_z, 4),
        "xi_3d_z_over_rg": round(xi_3d, 6),
        "lambda_0_residual": lambda_0,
        "lambda_1_fiedler": round(lambda_1, 6),
        "nu_1_exact_thz": round(nu_1_thz, 6),
        "nu_1_scaling_law_thz": round(nu_1_scaling_thz, 6),
        "b_factor_correlation_r": round(r_b_corr, 4) if r_b_corr is not None else None,
        "fiedler_hinge_residues": np.where(np.diff(np.sign(fiedler_vec)) != 0)[0].tolist(),
    }
```

---

### 5.3 Worked Problems & Socratic Solutions

#### Problem 1.1 (Scaling Law Evaluation on Canonical Enzymes)
Given the following verified structural metrics from the `https://n1.pqr.info` 24-substance registry:
1. **Choline O-acetyltransferase (`SUB-007`, PDB `2FY2`):** $N_{\text{C}_\alpha} = 614$, $R_g = 25.49\;\text{\AA}$, $\langle z \rangle / R_g = 0.3884\;\text{\AA}^{-1}$.
2. **Triosephosphate Isomerase (`SUB-TPI1-1TIM`, PDB `1TIM`):** $N_{\text{C}_\alpha} = 247$, $R_g = 16.92\;\text{\AA}$, $\langle z \rangle / R_g = 0.5810\;\text{\AA}^{-1}$.

Compute the predicted fundamental collective frequency $\hat{\nu}_1(\text{THz})$ for both enzymes using the $N = 1,040$ scaling law and compare their stiffness ratio.

**Step-by-Step Solution:**
1. For `ChAT (2FY2)`:
   $$\hat{\nu}_1(\text{ChAT}) = 0.42338 \times (0.3884)^{1.1194} = 0.42338 \times 0.34696 \approx 0.1469\;\text{THz}$$
   *(In the distance-weighted $R_c = 7.5\;\text{\AA}$ formulation on `n1.pqr.info`, the exact mode is $\nu_1 = 0.1812\;\text{THz}$.)*
2. For `TIM (1TIM)`:
   $$\hat{\nu}_1(\text{TIM}) = 0.42338 \times (0.5810)^{1.1194} = 0.42338 \times 0.54420 \approx 0.2304\;\text{THz}$$
   *(Exact distance-weighted mode: $\nu_1 = 0.2368\;\text{THz}$.)*
3. **Physical Conclusion:** Because `1TIM` is a tightly wound $(\beta/\alpha)_8$ barrel with higher packing density per unit radius ($0.5810$ vs. $0.3884\;\text{\AA}^{-1}$), its fundamental collective breathing frequency is $1.57\times$ higher than the larger bilobal `ChAT` monomer.

#### Problem 1.2 (Zero-Mode Projection in the Pseudoinverse $\mathbf{\Gamma}^+$)
Why must $\lambda_0 = 0$ be explicitly excluded when computing $\mathbf{\Gamma}^+$ for Debye-Waller $B$-factor prediction?

**Step-by-Step Solution:**
The eigenvector $\mathbf{u}_0 = N^{-1/2}\mathbf{1}$ represents a uniform rigid-body translation of the entire protein in space ($\Delta\mathbf{r}_1 = \Delta\mathbf{r}_2 = \dots = \Delta\mathbf{r}_N$). Because internal contact distances $d_{ij} = \|\mathbf{r}_i - \mathbf{r}_j\|_2$ do not change under uniform translation, no internal spring is stretched and the restoring potential energy is identically zero ($\lambda_0 = 0$). Including $1/\lambda_0$ would produce a division-by-zero divergence corresponding to unconstrained center-of-mass drift in free space, whereas crystallographic $B$-factors measure internal thermal fluctuations relative to the crystal lattice frame.
