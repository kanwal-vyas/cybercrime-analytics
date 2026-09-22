import json
from pathlib import Path

cells = []

def make_markdown_cell(source: str):
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": source.splitlines(keepends=True)
    }

def make_code_cell(source: str):
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": source.splitlines(keepends=True)
    }

# Title & Context
cells.append(make_markdown_cell("""# Stage 5: Association Rule Mining — State-Level Syllabus Demonstration
**Project**: Cyber Crime Analytics for National Security  
**Data Source**: National Crime Records Bureau (NCRB) 2023 Master Dataset (`master_state_2023.csv`)  
**Methodological Position**: State-Level Profile Association Mining (Demonstration of Syllabus Concepts)

---

## 1. Methodological Context & Scope

### Important Clarification: Aggregate State Observations vs. Incident Transactions
This dataset is **not** an incident-level transactional database. In retail market basket analysis or cyber incident logs, a transaction represents a single event:
$$\\text{Transaction } t_i \\to \\{\\text{Item } A, \\text{Item } B, \\text{Item } C, \\dots\\}$$
In this official NCRB dataset, observations represent **aggregate annual totals for 36 Indian States and Union Territories (UTs)** ($n = 36$).

### Pedagogical & Analytical Objective
This analysis demonstrates the core concepts of Data Mining Association Analysis:
1. **Transaction Matrix Construction** from continuous regional profiles using objective percentile thresholds (median split).
2. **Itemset Identification & Support Counting** ($k / 36$ states).
3. **Apriori Algorithm Execution** to find frequent itemsets without combinatorial explosion.
4. **Association Rule Generation & Filtering** using Support, Confidence, and Lift.
5. **Academic Interpretation & Non-Causal Guardrails**.

> **Crucial Guardrail**: Association rules discovered here represent **descriptive state-level profile co-occurrences** across 36 regional observations. They **do not** prove incident-level behavioral co-occurrence and **must never be interpreted as causal relationships or population-level behavioral laws**.
"""))

# Setup and imports
cells.append(make_code_cell("""# Setup environment and imports
import os
import sys
from pathlib import Path

# Add project root to sys.path
project_root = Path.cwd().resolve()
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Import Stage 5 module
from src.association_rules import (
    build_state_transaction_matrix,
    mine_frequent_itemsets,
    mine_association_rules,
    plot_frequent_itemset_support,
    plot_association_rules_scatter,
    export_association_tables,
    ITEM_DEFINITIONS
)

print(f"Working Directory: {project_root}")
print("Association Rule Mining module loaded successfully.")
"""))

# Section B: Data Loading & Transaction Construction
cells.append(make_markdown_cell("""---
## Section B — Transaction Design & Threshold Selection

### Item Design Principles
To prevent trivial rules, structural duplication, and volume leakage:
1. **No Total Cases Item**: `total_cases` is omitted so rules do not merely reflect overall state scale.
2. **No Parent/Subtotal Categories**: Only independent leaf categories, major motives, specific subset totals, and legal shares are used.
3. **Objective Median Split Threshold**: Each continuous metric is dichotomized at its **50th percentile (median)** across all 36 States/UTs. An item is `True` if a state is in the upper 50% for that characteristic.
"""))

cells.append(make_code_cell("""# Load validated 2023 master dataset
data_path = project_root / 'data' / 'processed' / 'master_state_2023.csv'
master_df = pd.read_csv(data_path)
print(f"Loaded master dataset with shape: {master_df.shape} (36 States/UTs)")

# Build binary transaction matrix
transaction_matrix, threshold_summary = build_state_transaction_matrix(master_df, threshold_percentile=0.50)

print("\\n--- Item Threshold & Frequency Summary ---")
display(threshold_summary[['item_name', 'category', 'cutoff_value', 'active_states_count', 'active_states_pct', 'description']])
"""))

cells.append(make_code_cell("""# Inspect constructed State/UT Transaction Matrix (Sample of Top & Bottom States)
print(f"Transaction Matrix Shape: {transaction_matrix.shape} (36 Transactions x {transaction_matrix.shape[1]} Items)")
display(transaction_matrix.head(10))
"""))

# Section C: Frequent Itemsets
cells.append(make_markdown_cell("""---
## Section C — Frequent Itemset Generation (Apriori)

### Support Metric in Small Sample ($n = 36$)
Support measures the proportion of all 36 States/UTs that contain the given itemset:
$$\\text{Support}(X) = \\frac{\\sigma(X)}{N} = \\frac{\\text{Number of States with } X}{36}$$

With $n = 36$:
- $1\\text{ state} = 2.78\\%$
- $4\\text{ states} = 11.11\\%$
- $9\\text{ states} = 25.00\\%$
- $18\\text{ states} = 50.00\\%$

We establish a minimum support threshold of **$\\text{min\\_support} = 0.25$ (at least 9 States/UTs)** to identify regional profile associations while filtering out sparse combinations.
"""))

cells.append(make_code_cell("""# Mine frequent itemsets using Apriori
min_supp = 0.25
frequent_itemsets = mine_frequent_itemsets(transaction_matrix, min_support=min_supp)

print(f"Total Frequent Itemsets Discovered (min_support >= {min_supp:.2f} / 9 States): {len(frequent_itemsets)}")
print(f"Breakdown by Itemset Size:")
print(frequent_itemsets['itemset_size'].value_counts().sort_index().to_dict())

print("\\nTop 15 Frequent Itemsets by Support:")
display(frequent_itemsets[['itemset_str', 'itemset_size', 'support', 'support_count']].head(15))
"""))

cells.append(make_code_cell("""# Visualize Top Frequent Itemsets
fig_itemsets = plot_frequent_itemset_support(
    frequent_itemsets,
    top_n=15,
    save_path=str(project_root / 'outputs' / 'figures' / '13_apriori_itemset_support.png')
)
plt.show()
"""))

# Section D: Association Rules
cells.append(make_markdown_cell("""---
## Section D — Association Rule Generation & Filtering

### Evaluation Metrics:
1. **Support**: $\\text{Support}(A \\to B) = P(A \\cap B) = \\frac{\\text{States with both } A \\text{ and } B}{36}$
2. **Confidence**: $\\text{Confidence}(A \\to B) = P(B \\mid A) = \\frac{\\text{Support}(A \\cup B)}{\\text{Support}(A)}$
3. **Lift**: $\\text{Lift}(A \\to B) = \\frac{P(B \\mid A)}{P(B)} = \\frac{\\text{Confidence}(A \\to B)}{\\text{Support}(B)}$
   - $\\text{Lift} > 1.0$: Positive state profile association (co-occur more than random baseline).
   - $\\text{Lift} \\approx 1.0$: Statistical independence across state profiles.
   - $\\text{Lift} < 1.0$: Negative co-occurrence (characteristic of divergent state clusters).

### Filtering Criteria:
- Minimum Support: **$0.25$** ($k \\ge 9$ States/UTs)
- Minimum Confidence: **$0.60$** ($60\\%$)
- Minimum Lift: **$> 1.0$** (strictly positive association)
"""))

cells.append(make_code_cell("""# Mine and filter association rules
min_conf = 0.60
min_lift = 1.0

rules = mine_association_rules(
    frequent_itemsets,
    n_transactions=len(transaction_matrix),
    min_confidence=min_conf,
    min_lift=min_lift
)

print(f"Total Filtered Association Rules (min_conf >= {min_conf}, lift > {min_lift}): {len(rules)}")

# Separate 1-to-1 pair rules for primary interpretation
rules['ant_len'] = rules['antecedent_str'].apply(lambda s: len(s.split(' + ')))
rules['con_len'] = rules['consequent_str'].apply(lambda s: len(s.split(' + ')))

pair_rules = rules[(rules['ant_len'] == 1) & (rules['con_len'] == 1)].sort_values(
    by=['lift', 'confidence', 'support'], ascending=[False, False, False]
).reset_index(drop=True)

print(f"\\nPair Rules (1 Antecedent -> 1 Consequent): {len(pair_rules)} (used for human-readable profile analysis)")
display(pair_rules[['rule_str', 'support', 'support_count', 'confidence', 'lift']].head(15))
"""))

cells.append(make_code_cell("""# Visualize Association Rules Scatter Plot
fig_scatter = plot_association_rules_scatter(
    rules,
    save_path=str(project_root / 'outputs' / 'figures' / '14_association_rules_scatter.png')
)
plt.show()
"""))

# Section E: Substantive Interpretation
cells.append(make_markdown_cell("""---
## Section E — Substantive Profile Interpretation

### Analytical Question 1: Do states with High Fraud Motive frequently exhibit High Sec. 66D Activity?
- **Forward Rule**: `HIGH_FRAUD_MOTIVE -> HIGH_SEC66D_CHEATING`
  - Support: **$41.67\\%$** ($15 / 36$ State/UT profiles)
  - Confidence: **$83.33\\%$** ($15 / 18$ states with high fraud motive)
  - Lift: **$1.67$** relative to independence baseline
- **Reverse Rule**: `HIGH_SEC66D_CHEATING -> HIGH_FRAUD_MOTIVE`
  - Support: **$41.67\\%$** ($15 / 36$ State/UT profiles)
  - Confidence: **$83.33\\%$** ($15 / 18$ states with high Sec. 66D activity)
  - Lift: **$1.67$**
- **Finding**: High fraud motive is associated with high Sec. 66D personation cheating across 15 of 36 State/UT profiles, showing a confidence of $83.33\\%$ and a lift of $1.67$.

---

### Analytical Question 2: Does High Identity Theft Co-Occur with High Fraud Motive?
- **Forward Rule**: `HIGH_IDENTITY_THEFT -> HIGH_FRAUD_MOTIVE`
  - Support: **$44.44\\%$** ($16 / 36$ State/UT profiles)
  - Confidence: **$84.21\\%$** ($16 / 19$ states with high identity theft)
  - Lift: **$1.68$**
- **Reverse Rule**: `HIGH_FRAUD_MOTIVE -> HIGH_IDENTITY_THEFT`
  - Support: **$44.44\\%$** ($16 / 36$ State/UT profiles)
  - Confidence: **$88.89\\%$** ($16 / 18$ states with high fraud motive)
  - Lift: **$1.68$**
- **Finding**: States with above-median identity theft (Sec. 66C) co-occur with high fraud motive in 16 of 36 State/UT profiles (confidence $84.21\\%$, lift $1.68$).

---

### Analytical Question 3: Does High IT Act Share Co-Occur with Specific Motive Profiles?
- **Finding**: Under the selected median thresholds, `HIGH_IT_ACT_SHARE` does not produce a positive-lift association ($\\text{Lift} > 1.0$) with the examined raw motive-count indicators.
- **Explanation**: In the observed transaction matrix, states with above-median IT Act shares ($>68.75\\%$) do not exhibit above-median counts for raw fraud, extortion, or sexual exploitation motives at rates exceeding the random baseline (Lift $\\le 1.0$).

---

### Analytical Question 4: Are Women and Children Subset Concentrations Associated with Specific Profiles?
- **Forward Rule**: `HIGH_WOMEN_CYBERCRIME -> HIGH_SEXUAL_EXPLOITATION_MOTIVE`
  - Support: **$44.44\\%$** ($16 / 36$ State/UT profiles)
  - Confidence: **$88.89\\%$** ($16 / 18$ states)
  - Lift: **$1.78$**
- **Reverse Rule**: `HIGH_SEXUAL_EXPLOITATION_MOTIVE -> HIGH_WOMEN_CYBERCRIME`
  - Support: **$44.44\\%$** ($16 / 36$ State/UT profiles)
  - Confidence: **$88.89\\%$** ($16 / 18$ states)
  - Lift: **$1.78$**
- **Subset Co-occurrence**: `HIGH_WOMEN_CYBERCRIME -> HIGH_CHILD_CYBERCRIME`
  - Support: **$44.44\\%$** ($16 / 36$ State/UT profiles)
  - Confidence: **$88.89\\%$** ($16 / 18$ states)
  - Lift: **$1.78$**
- **Finding**: Above-median cybercrimes against women co-occur with above-median cybercrimes against children and above-median sexual exploitation motives across 16 of 36 State/UT profiles (confidence $88.89\\%$, lift $1.78$).
"""))

# Section F: Export & Validation
cells.append(make_code_cell("""# Export Tables and Verify Output Files
exported_paths = export_association_tables(
    transaction_matrix=transaction_matrix,
    threshold_summary=threshold_summary,
    frequent_itemsets=frequent_itemsets,
    rules=rules,
    output_dir=str(project_root / 'outputs' / 'tables')
)

print("Exported Association Rule Mining Tables:")
for k, v in exported_paths.items():
    p = Path(v)
    print(f"  - {k:<20}: {p.name} ({p.stat().st_size:,} bytes)")
"""))

cells.append(make_markdown_cell("""---
## Section F — Methodological Limitations & Verification

### Explicit Analytical Boundaries:
1. **Small Sample Size ($n = 36$)**: Support is discretized in increments of $1/36 \\approx 2.78\\%$. Small shifts in state classification can alter support counts.
2. **Threshold Sensitivity**: The median split was selected for mathematical symmetry ($50\\%$ marginal support per item). Alternative cutoffs alter itemset density.
3. **No Incident-Level Inference**: A rule such as $\\text{Fraud} \\to \\text{Identity Theft}$ indicates that State/UT profiles with above-median fraud also tend to have above-median identity theft; it does **not** prove that individual fraud incidents involve identity theft.
4. **Non-Causal Nature**: These patterns describe statistical co-occurrence among the selected State/UT-level indicators in the observed dataset. The analysis does not test causal mechanisms or external explanatory factors.
"""))

nb_dict = {
    "cells": cells,
    "metadata": {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3"
        },
        "language_info": {
            "name": "python",
            "version": "3.13.0"
        }
    },
    "nbformat": 4,
    "nbformat_minor": 5
}

nb_path = Path('notebooks/04_association_rules.ipynb')
nb_path.parent.mkdir(parents=True, exist_ok=True)
with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb_dict, f, indent=2)

print(f'Wrote notebook to {nb_path}')
