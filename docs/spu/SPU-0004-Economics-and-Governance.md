# SPU-0004: Economics & Governance
## The Three Capitals Model & Proof-of-Contribution Architecture

**Document ID:** SPU-0004  
**Status:** Public Standard  
**Institution:** Spacebook.University  
**Derived From:** RFC-0026, RFC-0027, RFC-0028, RFC-0029  
**Version:** 1.0  
**Classification:** Open Research Document  

---

## 🏛️ Disclosure Statement

> *Spacebook.University is an open research initiative exploring attention economics, decentralized governance, distributed computation, knowledge preservation, and civilizational continuity. The project is experimental. Published architectures, RFCs, simulations, governance mechanisms, and economic models are research artifacts and should not be interpreted as guarantees of future system behavior, financial performance, or governance outcomes.*

---

## 💰 1. The Three Capitals Model

Traditional blockchain protocols equate economic wealth directly with governance control:
$$\text{Tokens} \longrightarrow \text{Votes} \longrightarrow \text{Capture}$$

Spacebook.University enacts an unbreachable constitutional separation across three distinct forms of civilizational capital:

```
                  ┌───────────────────────────────┐
                  │      Demonstrated Action      │
                  └──────────────┬────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       ┌───────────────────┐           ┌───────────────────┐
       │   rATTN Capital   │           │   ATTN Capital    │
       │  (Epistemic Merit)│           │ (Economic Utility)│
       └─────────┬─────────┘           └───────────────────┘
                 │                               │
                 ▼                               ▼
       ┌───────────────────┐              Marketplaces &
       │   gATTN Capital   │             Node Settlement
       │(Soulbound Trust)  │
       └─────────┬─────────┘
                 │
                 ▼
       ┌───────────────────┐
       │Governance Chamber │
       └───────────────────┘
```

| Asset | Capital Type | Transferability | Minting Mechanism | Constitutional Rule |
| :--- | :--- | :--- | :--- | :--- |
| **`ATTN`** | **Economic Capital** | Liquid, ERC-20 transferable | Mission completion, node compute provision, merchant clearance | Marketplace utility only; **never buys votes** |
| **`rATTN`** | **Reputation Capital** | Non-transferable merit ledger | Peer-reviewed research, RFC authorship, incident RCA post-mortems | Decays with inactivity; measures epistemic output |
| **`gATTN`** | **Trust Capital** | Non-transferable Soulbound score | Multi-domain competency proofs, doctrine certification, tenure | Confers governance voting power & chamber eligibility |

---

## ⚖️ 2. The Four Constitutional Governance Chambers

To protect against systemic failure modes, governance authority is partitioned across four independent houses (RFC-0027):

1. **House I: Citizens Assembly (Quadratic Attention Voting):**
   - Represents all verified human participants.
   - Voting power scales quadratically: $\text{Votes} = \sqrt{\text{Balance}}$.
   - 5% maximum power cap per entity to eliminate whale dominance.
2. **House II: Council of Contributors (Epistemic Working Groups):**
   - Requires Contributor tier ($gATTN \ge 25.0$).
   - Authors RFCs, amends technical specs, directs grant pools.
3. **House III: High Council of Stewards (Infrastructure & Risk):**
   - Requires Steward tier ($gATTN \ge 50.0$) + Doctrine Certification.
   - Manages physical colocation nodes, cluster operators, and treasury limits.
4. **House IV: Constitutional Court (Negative Invariant Protection):**
   - Composed of Constitutional Guardians ($gATTN \ge 90.0$).
   - Possesses strictly negative veto power to halt any action violating Invariants I–LII.

---

## 📉 3. Anti-Whale & Participation Decay Formulations

### Governance Score Master Equation (RFC-0028):
$$gATTN = 100 \times [0.35C + 0.25D + 0.20S + 0.10F + 0.10T] \times A \times R$$

### Effective Governance Power with Sybil Resistance (RFC-0028-A):
$$\text{GovernancePower} = \sqrt{gATTN} \times \text{TrustScore} \times \text{Competency} \times \text{Activity} \times \text{Sovereignty}$$

### Participation Decay Engine:
$$gATTN_{\text{effective}}(t) = gATTN_0 \cdot e^{-0.028881 \cdot t}$$
*Authority is not a permanent title; it decays automatically unless maintained through ongoing stewardship.*
