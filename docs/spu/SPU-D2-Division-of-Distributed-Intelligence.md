# SPU-D2: Division of Distributed Intelligence
### Edge Compute, Federated Cognition & Useful Work Systems

- **Division ID:** SPU-D2
- **Status:** Active Research Division
- **Program:** SPU Phase I
- **Parent Institution:** Spacebook.University

---

## 🎯 Mission

The Division of Distributed Intelligence investigates whether large populations of participant-owned devices can cooperatively produce useful computation while preserving:
* Personal sovereignty
* Privacy
* Consent
* Device health
* Economic fairness
* Verifiable scientific utility

The division explicitly rejects computation performed solely to create artificial scarcity or speculative value.

The guiding principle is:
> **Computation should generate measurable public utility.**

---

## 🔬 Research Domains

### D2.1 Edge Neural Inference
* **Research Focus:** Consumer NPUs, NNAPI, Qualcomm QNN, MediaTek APU, Tensor acceleration, Quantized inference.
* **Primary Objective:** Determine whether participant-owned devices can provide economically useful inference capacity.

### D2.2 Distributed Graph Verification
* **Research Focus:** Neo4j verification, Graph integrity, Fact consistency, Lineage validation, Graph Drift detection.
* **Primary Objective:** Determine whether edge devices can continuously validate graph reality without centralizing trust.

### D2.3 Federated Learning
* **Research Focus:** Differential privacy, Federated averaging, DP-SGD, Local model updates, Privacy-preserving learning.
* **Primary Objective:** Determine whether distributed model improvement can occur without centralized collection of participant data.

### D2.4 Stratum-5D Compute Network
* **Research Focus:** Proof-of-Useful-Work, Job distribution, Share verification, Attested computation, Settlement systems.
* **Primary Objective:** Determine whether useful computation can replace arbitrary cryptographic work.

---

## ⚖️ Constitutional Constraints

All D2 experiments are subject to:
* **RFC-0025:** Privacy & Consent
* **RFC-0029:** Reputation & Trust
* **RFC-0030:** Attention Sovereignty

The following principles are mandatory:
* **Principle D2-A:** Participation is voluntary.
* **Principle D2-B:** Compute may be disabled instantly.
* **Principle D2-C:** Device owners remain sovereign.
* **Principle D2-D:** No useful work system may degrade device safety.
* **Principle D2-E:** Economic rewards must not override consent.

---

## 🏆 Success Criteria

Distributed intelligence is considered successful if:
1. Useful computation is produced.
2. Participants remain willing to participate.
3. Privacy remains preserved.
4. Device safety remains preserved.
5. Economics remain sustainable.

---

## 🧪 Experimental Hypotheses & Longitudinal Metrics

### 🛡️ Gatekeeper Doctrine: H-005 as Division Prerequisite
Participant Experience (H-005) is the **Gatekeeper Hypothesis** for the entire Division of Distributed Intelligence. An edge node architecture can be technically sound and mathematically complete, yet completely fail if participants perceive battery drain, device warming, unclear incentives, or excessive permissions. If H-005 fails ($WSR < 50\%$), the entire edge compute pool collapses, rendering H-006 and H-007 unviable.

---

### H-005: Useful Edge Compute Hypothesis (Gatekeeper)
* **Research Question:** Can participant-owned mobile devices contribute economically useful computation without materially degrading the participant experience?
* **Hypothesis Statement:** Consumer mobile devices can perform useful neural and verification workloads while maintaining acceptable battery, thermal, and usability characteristics.
* **Core Metrics:**
  * **DIM-1: Useful Work Completion Rate ($UWCR$):**
    $$UWCR = \frac{\text{CompletedUsefulJobs}}{\text{AssignedUsefulJobs}} \ge 90.0\%$$
  * **DIM-2: Worker Survival Rate ($WSR$ — Gatekeeper Metric):**
    $$WSR = \frac{\text{ActiveWorkers}(30d)}{\text{NewWorkers}} \ge 60.0\%$$
    *Falsification Threshold:* $WSR < 40.0\%$ (participants leaving faster than joining).
  * **M5.1: Device Opt-Out Rate ($R_{opt}$):** Target $R_{opt} < 20\%$ (Nominal Governor Threshold: $< 5.0\%$).
  * **M5.2: Average Battery Impact ($\Delta\text{Battery}$):** Target $< 10\%$ daily impact ($\le 3.5\%/\text{hr}$ compute burn).
  * **M5.3: Thermal Safety ($T_{safe}$):** Target $95\%$ of execution time below thermal throttling ($T_{skin} \le 38.0^\circ\text{C}$).
  * **M5.4: Participant Satisfaction ($S_{user}$):** Target $\ge 4.0 / 5.0$.
* **Longitudinal Observation Deltas ($E_t - E_0$):**
  * $\Delta R_{opt} = R_{opt}(t) - R_{opt}(E_0)$
  * $\Delta\text{Battery} = \text{BatteryDrain}(t) - \text{BatteryDrain}(E_0)$
  * $\Delta\text{Thermal} = T_{peak}(t) - T_{peak}(E_0)$
* **Invalidation Criteria:** Falsified if opt-out exceeds $50\%$, or thermal throttling becomes common, or battery impact exceeds participant tolerance.

---

### H-006: Distributed Graph Verification Hypothesis
* **Research Question:** Can distributed verification preserve graph reality at scale?
* **Hypothesis Statement:** Edge workers can continuously verify graph reality and maintain a low Graph Drift Index without centralized inspection.
* **Core Metrics:**
  * **DIM-3: Verification Efficiency ($VE$):**
    $$VE = \frac{\text{VerifiedGraphFacts}}{\text{EnergyConsumed (Watt-Hours)}} \ge 1,000 \text{ facts/Wh}$$
  * **M6.1: Graph Drift Index ($\text{GDI}$):** Target $\text{GDI} < 0.01$.
  * **M6.2: Verification Coverage ($C_{verify}$):** Target $> 95\%$.
  * **M6.3: Verification Latency ($\tau_{verify}$):** Target $< 250\text{ ms}$.
  * **M6.4: Verification Cost ($\text{Cost}_{verify}$):** Target declining over time relative to centralized infrastructure.
* **Longitudinal Observation Deltas ($E_t - E_0$):**
  * $\Delta\text{GDI} = \text{GDI}(t) - \text{GDI}(E_0)$
  * $\Delta C_{verify} = C_{verify}(t) - C_{verify}(E_0)$
  * $\Delta\tau_{verify} = \tau_{verify}(t) - \tau_{verify}(E_0)$
* **Invalidation Criteria:** Falsified if $\text{GDI} \ge 0.01$, or coverage falls below $80\%$, or verification costs exceed centralized alternatives.

---

### H-007: Federated Learning Viability Hypothesis
* **Research Question:** Can distributed privacy-preserving learning improve model performance without exposing participant data?
* **Hypothesis Statement:** Federated training using differential privacy can improve model quality while preserving participant sovereignty.
* **Core Metrics:**
  * **DIM-4: Federated Learning Gain ($FLG$):**
    $$FLG = \text{ModelAccuracy}_t - \text{ModelAccuracy}_{E_0} > 0.0\%$$
    Measures sustained net generalization accuracy uplift under strict $(\varepsilon, \delta)$ bounds.
  * **M7.2: Privacy Budget ($\varepsilon$):** Target $\varepsilon \le 1.0, \delta \le 10^{-5}$.
  * **M7.3: Communication Efficiency ($\eta_{comm}$):** Target payload $\le 250\text{ KB}$ per round, stable under growth.
  * **M7.4: Energy Efficiency ($\eta_{energy}$):** Target improves across epochs ($\ge 12.0\text{ tok/W}$).
* **Longitudinal Observation Deltas ($E_t - E_0$):**
  * $\Delta\text{Accuracy} = \text{Accuracy}(t) - \text{Accuracy}(E_0)$
  * $\Delta\varepsilon = \varepsilon(t) - \varepsilon(E_0)$
  * $\Delta\eta_{comm} = \eta_{comm}(t) - \eta_{comm}(E_0)$
* **Invalidation Criteria:** Falsified if model quality does not improve, or privacy guarantees cannot be maintained, or communication costs dominate value produced.

---

## 🔗 Institutional Dependency Structure

The formal epistemic hierarchy across Spacebook.University:

```
SPU-D1: Attention Science
   │
   ▼
H-000: Reality Alignment (GDI Anchor)
   │
   ▼
H-006: Distributed Graph Verification (DIM-3)
   │
   ▼
H-002: Trust Predictability (TAI)
   │
   ▼
H-001: Governance Efficacy (rATTN / gATTN)
   │
   ▼
SPU-D3: Governance Science ──► SPU-D4: Civilization Engineering

Parallel Compute Dependency:

H-005: Useful Edge Compute (DIM-1, DIM-2 Gatekeeper)
   │
   ▼
H-007: Federated Learning (DIM-4)
   │
   ▼
H-004: Distributed Compute Viability
```

---

## 🚪 Division Exit Condition

SPU-D2 graduates from experimental status to constitutional consideration only when:
1. **H-005 confirmed (Participant retention sustained over 90 days).**
2. **H-006 confirmed (Graph drift validated at $< 0.01$).**
3. **H-007 confirmed (Positive FLG under $\varepsilon \le 1.0$).**
4. **Zero constitutional violations observed during Phase I.**

---

## 📢 Publication Principle

SPU-D2 is a scientific research division, not a product release or marketing claim. All distributed compute architectures, Stratum-5D protocols, federated learning systems, and Proof-of-Useful-Work (PoUW) mechanisms remain strictly experimental until validated through publicly observable evidence on the Spacebook.University Observatory.
