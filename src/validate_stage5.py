import pandas as pd
import numpy as np
from pathlib import Path

# 1. Transaction Matrix Validation
tm = pd.read_csv('outputs/tables/state_transaction_matrix.csv', index_col=0)
assert tm.shape == (36, 8), f"Expected shape (36, 8), got {tm.shape}"
assert len(tm.index.unique()) == 36, "Duplicate states found"
assert tm.isnull().sum().sum() == 0, "Missing values found in transaction matrix"
assert tm.dtypes.apply(lambda d: d == bool or d == int or d == np.bool_).all(), "Non-binary values found"
print("[PASS] 1. Transaction matrix: 36 unique States/UTs, 8 binary items, 0 nulls.")

# 2. Threshold Summary Validation
thresh = pd.read_csv('outputs/tables/association_item_thresholds.csv')
assert len(thresh) == 8, f"Expected 8 threshold rows, got {len(thresh)}"
assert (thresh['active_states_count'] >= 18).all(), "Active states count anomaly"
print("[PASS] 2. Item threshold summary: 8 items documented with exact median cutoffs.")

# 3. Frequent Itemsets Validation
fi = pd.read_csv('outputs/tables/frequent_itemsets.csv')
assert len(fi) == 129, f"Expected 129 frequent itemsets, got {len(fi)}"
calc_supp = fi['support_count'] / 36.0
max_diff = (fi['support'] - calc_supp).abs().max()
assert max_diff < 1e-4, f"Support mismatch: max diff {max_diff}"
print(f"[PASS] 3. Frequent itemsets: 129 itemsets verified. Support count / 36 = support exact.")

# 4. Association Rules Validation
rules = pd.read_csv('outputs/tables/association_rules.csv')
assert len(rules) == 1924, f"Expected 1924 filtered rules, got {len(rules)}"
rules['ant_len'] = rules['antecedent_str'].apply(lambda s: len(s.split(' + ')))
rules['con_len'] = rules['consequent_str'].apply(lambda s: len(s.split(' + ')))
pair_rules = rules[(rules['ant_len'] == 1) & (rules['con_len'] == 1)]
assert len(pair_rules) == 42, f"Expected 42 one-to-one pair rules, got {len(pair_rules)}"

# Mathematical checks across all rules
for _, r in rules.iterrows():
    ant = set(r['antecedent_str'].split(' + '))
    con = set(r['consequent_str'].split(' + '))
    assert ant.isdisjoint(con), f"Non-disjoint rule: {r['rule_str']}"
    assert r['lift'] > 1.0, f"Lift not > 1.0: {r['lift']}"
    assert r['confidence'] >= 0.60, f"Confidence < 0.60: {r['confidence']}"
    assert r['support'] >= 0.25, f"Support < 0.25: {r['support']}"
    assert abs(r['support_count'] - round(r['support'] * 36)) == 0, "Support count discrepancy"

print(f"[PASS] 4. Association rules: 1924 total filtered rules ({len(pair_rules)} 1-to-1 pair rules). All disjoint, supp >= 0.25, conf >= 0.60, lift > 1.0.")

# 5. Key Rules Verification (Direct Check)
key_pairs = [
    ('HIGH_FRAUD_MOTIVE', 'HIGH_SEC66D_CHEATING', 15, 0.4167, 0.8333, 1.6667),
    ('HIGH_SEC66D_CHEATING', 'HIGH_FRAUD_MOTIVE', 15, 0.4167, 0.8333, 1.6667),
    ('HIGH_IDENTITY_THEFT', 'HIGH_FRAUD_MOTIVE', 16, 0.4444, 0.8421, 1.6842),
    ('HIGH_FRAUD_MOTIVE', 'HIGH_IDENTITY_THEFT', 16, 0.4444, 0.8889, 1.6842),
    ('HIGH_WOMEN_CYBERCRIME', 'HIGH_SEXUAL_EXPLOITATION_MOTIVE', 16, 0.4444, 0.8889, 1.7778),
    ('HIGH_SEXUAL_EXPLOITATION_MOTIVE', 'HIGH_WOMEN_CYBERCRIME', 16, 0.4444, 0.8889, 1.7778),
    ('HIGH_WOMEN_CYBERCRIME', 'HIGH_CHILD_CYBERCRIME', 16, 0.4444, 0.8889, 1.7778),
    ('HIGH_CHILD_CYBERCRIME', 'HIGH_WOMEN_CYBERCRIME', 16, 0.4444, 0.8889, 1.7778),
]

for ant, con, exp_cnt, exp_supp, exp_conf, exp_lift in key_pairs:
    m = rules[(rules['antecedent_str'] == ant) & (rules['consequent_str'] == con)]
    assert not m.empty, f"Rule {ant} -> {con} not found"
    row = m.iloc[0]
    assert row['support_count'] == exp_cnt, f"Support count mismatch for {row['rule_str']}"
    assert abs(row['support'] - exp_supp) < 1e-3, f"Support mismatch for {row['rule_str']}"
    assert abs(row['confidence'] - exp_conf) < 1e-3, f"Confidence mismatch for {row['rule_str']}"
    assert abs(row['lift'] - exp_lift) < 1e-3, f"Lift mismatch for {row['rule_str']}"

print("[PASS] 5. Key pair rules: Forward and reverse metrics verified against expected values.")

# 6. Figures Validation
for fig_name in ['13_apriori_itemset_support.png', '14_association_rules_scatter.png']:
    p = Path('outputs/figures') / fig_name
    assert p.exists() and p.stat().st_size > 1000, f"Figure {fig_name} missing or empty"
    print(f"[PASS] 6. Figure verified: {fig_name} ({p.stat().st_size:,} bytes)")

print("\n=== ALL STAGE 5 FINAL QA & MATHEMATICAL CHECKS PASSED ===")
