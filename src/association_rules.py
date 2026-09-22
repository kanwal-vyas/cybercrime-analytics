"""
Association Rule Mining Module — State-Level Syllabus Demonstration
Project: Cyber Crime Analytics for National Security

IMPORTANT METHODOLOGICAL POSITION:
This dataset is NOT an incident-level transactional dataset. We do not have individual
crime incident records with co-occurring features. Instead, observations are aggregate
State/UT profiles (n = 36).

This module demonstrates association rule mining concepts (transaction representation,
frequent itemsets, support, confidence, lift, and Apriori) applied to State/UT crime profiles.
Rules describe state-level co-occurrence patterns, NOT incident-level behavioral laws or causation.
"""

from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from mlxtend.frequent_patterns import apriori, association_rules


# Item definition registry with semantic mapping to underlying columns
ITEM_DEFINITIONS = {
    'HIGH_FRAUD_MOTIVE': {
        'col_pattern': 'motive__Fraud',
        'fallback_col': 'motive_fraud',
        'desc': 'Fraud motive count >= median threshold across States/UTs',
        'category': 'Motive'
    },
    'HIGH_SEC66D_CHEATING': {
        'col_pattern': 'Sec.66D',
        'fallback_col': 'sec66d_cheating_personation',
        'desc': 'Sec. 66D Personation Cheating count >= median threshold',
        'category': 'IT Act Category'
    },
    'HIGH_IDENTITY_THEFT': {
        'col_pattern': 'Sec.66C',
        'fallback_col': 'sec66c_identity_theft',
        'desc': 'Sec. 66C Identity Theft count >= median threshold',
        'category': 'IT Act Category'
    },
    'HIGH_IT_ACT_SHARE': {
        'col_pattern': 'it_act_share',
        'fallback_col': 'it_act_share',
        'desc': 'Share of cases under IT Act >= median threshold',
        'category': 'Legal Composition'
    },
    'HIGH_EXTORTION_MOTIVE': {
        'col_pattern': 'motive__Extortion',
        'fallback_col': 'motive_extortion',
        'desc': 'Extortion motive count >= median threshold',
        'category': 'Motive'
    },
    'HIGH_SEXUAL_EXPLOITATION_MOTIVE': {
        'col_pattern': 'motive__Sexual Exploitation',
        'fallback_col': 'motive_sexual_exploitation',
        'desc': 'Sexual Exploitation motive count >= median threshold',
        'category': 'Motive'
    },
    'HIGH_WOMEN_CYBERCRIME': {
        'col_pattern': 'women__Total Cyber Crimes against Women',
        'fallback_col': 'women_cases_total',
        'desc': 'Total cybercrimes against women >= median threshold',
        'category': 'Vulnerable Groups'
    },
    'HIGH_CHILD_CYBERCRIME': {
        'col_pattern': 'child__Total Cyber Crimes against Children',
        'fallback_col': 'child_cases_total',
        'desc': 'Total cybercrimes against children >= median threshold',
        'category': 'Vulnerable Groups'
    },
}


def _find_column(df: pd.DataFrame, pattern: str, fallback: str) -> str:
    """Helper to locate exact or substring column match in DataFrame."""
    if pattern in df.columns:
        return pattern
    if fallback in df.columns:
        return fallback
    # Match by substring
    matches = [c for c in df.columns if pattern.lower() in c.lower()]
    if matches:
        return matches[0]
    raise KeyError(f"Could not find column matching pattern '{pattern}' or fallback '{fallback}'.")


def build_state_transaction_matrix(
    df: pd.DataFrame,
    threshold_percentile: float = 0.50
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Constructs a transparent binary transaction matrix where each State/UT is one transaction.
    
    Parameters:
    -----------
    df : pd.DataFrame
        Master state-level dataset or EDA feature matrix (must contain 36 State/UT records).
    threshold_percentile : float
        Percentile cutoff to define HIGH items (default 0.50 = median split).
        
    Returns:
    --------
    transaction_matrix : pd.DataFrame
        Binary/boolean DataFrame of shape (36, n_items) indexed by state_name.
    threshold_summary : pd.DataFrame
        Summary table detailing feature names, exact cutoff values, and item counts.
    """
    state_col = 'state_name' if 'state_name' in df.columns else 'State/UT'
    states = df[state_col].values
    
    matrix_dict = {}
    summary_rows = []
    
    # Check if it_act_share exists or compute it if needed
    working_df = df.copy()
    if 'it_act_share' not in working_df.columns:
        it_col = 'cat__Total Offences under I.T. Act'
        grand_col = 'cat__Total Cyber Crimes (IT Act + IPC r/w IT Act + SLL r/w IT Act)'
        if it_col in working_df.columns and grand_col in working_df.columns:
            working_df['it_act_share'] = working_df[it_col] / working_df[grand_col]
        else:
            # Fallback search
            it_matches = [c for c in working_df.columns if 'total offences under i.t. act' in c.lower()]
            tot_matches = [c for c in working_df.columns if 'total cyber crimes (' in c.lower()]
            if it_matches and tot_matches:
                working_df['it_act_share'] = working_df[it_matches[0]] / working_df[tot_matches[0]]
            else:
                raise KeyError("Could not calculate 'it_act_share' from dataset.")
            
    for item_name, meta in ITEM_DEFINITIONS.items():
        matched_col = _find_column(working_df, meta['col_pattern'], meta['fallback_col'])
        series = working_df[matched_col].astype(float)
        
        cutoff_val = float(series.quantile(threshold_percentile))
        binary_series = (series >= cutoff_val).astype(bool)
        matrix_dict[item_name] = binary_series.values
        
        active_count = int(binary_series.sum())
        summary_rows.append({
            'item_name': item_name,
            'source_column': matched_col,
            'category': meta['category'],
            'threshold_type': f'{int(threshold_percentile*100)}th Percentile (Median)' if threshold_percentile == 0.50 else f'{int(threshold_percentile*100)}th Percentile',
            'cutoff_value': round(cutoff_val, 4),
            'active_states_count': active_count,
            'active_states_pct': round((active_count / len(states)) * 100, 2),
            'description': meta['desc']
        })
        
    transaction_matrix = pd.DataFrame(matrix_dict, index=states)
    transaction_matrix.index.name = 'state_name'
    threshold_summary = pd.DataFrame(summary_rows)
    
    return transaction_matrix, threshold_summary


def mine_frequent_itemsets(
    transaction_matrix: pd.DataFrame,
    min_support: float = 0.25
) -> pd.DataFrame:
    """
    Generates frequent itemsets using the Apriori algorithm.
    
    Parameters:
    -----------
    transaction_matrix : pd.DataFrame
        Boolean transaction matrix (n_transactions x n_items).
    min_support : float
        Minimum support threshold (e.g. 0.25 = 9 of 36 states).
        
    Returns:
    --------
    frequent_itemsets : pd.DataFrame
        DataFrame with columns: ['support', 'itemsets', 'itemset_size', 'support_count', 'itemset_str']
    """
    n_transactions = len(transaction_matrix)
    freq = apriori(transaction_matrix, min_support=min_support, use_colnames=True)
    
    if freq.empty:
        return pd.DataFrame(columns=['support', 'itemsets', 'itemset_size', 'support_count', 'itemset_str'])
        
    freq['support_count'] = (freq['support'] * n_transactions).round().astype(int)
    freq['itemset_size'] = freq['itemsets'].apply(lambda x: len(x))
    freq['itemset_str'] = freq['itemsets'].apply(lambda x: ' + '.join(sorted(list(x))))
    
    # Sort descending by support, then by itemset_size
    freq = freq.sort_values(by=['support', 'itemset_size'], ascending=[False, False]).reset_index(drop=True)
    return freq


def mine_association_rules(
    frequent_itemsets: pd.DataFrame,
    n_transactions: int = 36,
    min_confidence: float = 0.60,
    min_lift: float = 1.0
) -> pd.DataFrame:
    """
    Generates association rules from frequent itemsets and filters by confidence and lift.
    
    Parameters:
    -----------
    frequent_itemsets : pd.DataFrame
        Frequent itemsets DataFrame from mine_frequent_itemsets.
    n_transactions : int
        Total number of state transactions (default 36).
    min_confidence : float
        Minimum confidence threshold (e.g., 0.60 = 60%).
    min_lift : float
        Minimum lift threshold (default 1.0, strictly positive association).
        
    Returns:
    --------
    rules : pd.DataFrame
        Cleaned and filtered rules DataFrame.
    """
    if frequent_itemsets.empty:
        return pd.DataFrame()
        
    rules = association_rules(
        frequent_itemsets[['support', 'itemsets']],
        metric='confidence',
        min_threshold=min_confidence
    )
    
    if rules.empty:
        return pd.DataFrame()
        
    # Filter strictly for positive association (lift > min_lift)
    rules = rules[rules['lift'] > min_lift].copy()
    
    # Calculate exact support counts
    rules['support_count'] = (rules['support'] * n_transactions).round().astype(int)
    rules['antecedent_count'] = (rules['antecedent support'] * n_transactions).round().astype(int)
    rules['consequent_count'] = (rules['consequent support'] * n_transactions).round().astype(int)
    
    # Format readable string representations
    rules['antecedent_str'] = rules['antecedents'].apply(lambda x: ' + '.join(sorted(list(x))))
    rules['consequent_str'] = rules['consequents'].apply(lambda x: ' + '.join(sorted(list(x))))
    rules['rule_str'] = rules['antecedent_str'] + ' -> ' + rules['consequent_str']
    
    # Sort by confidence descending, then lift descending, then support descending
    rules = rules.sort_values(by=['confidence', 'lift', 'support'], ascending=[False, False, False]).reset_index(drop=True)
    return rules


def plot_frequent_itemset_support(
    frequent_itemsets: pd.DataFrame,
    top_n: int = 15,
    save_path: Optional[str] = 'outputs/figures/13_apriori_itemset_support.png'
) -> plt.Figure:
    """
    Plots a clear horizontal bar chart of the top frequent itemsets by support.
    """
    plt.style.use('seaborn-v0_8-whitegrid')
    fig, ax = plt.subplots(figsize=(12, 7))
    
    top_df = frequent_itemsets.head(top_n).copy()
    # Reverse order so top item is at the top of the horizontal bar chart
    top_df = top_df.iloc[::-1]
    
    # Color bars by itemset size
    colors = ['#2b5c8f' if sz == 1 else '#d95f02' if sz == 2 else '#7570b3' for sz in top_df['itemset_size']]
    bars = ax.barh(top_df['itemset_str'], top_df['support'], color=colors, alpha=0.85, edgecolor='black', height=0.65)
    
    ax.set_xlabel('Support (Proportion of States/UTs)', fontsize=12, fontweight='bold', labelpad=10)
    ax.set_title(f'Top {min(top_n, len(top_df))} Frequent Itemsets (Min Support = 0.25 / 9 States)', fontsize=14, fontweight='bold', pad=15)
    ax.set_xlim(0, max(top_df['support']) * 1.25)
    
    # Add data labels
    for bar, (_, row) in zip(bars, top_df.iterrows()):
        w = bar.get_width()
        cnt = int(row['support_count'])
        ax.text(w + 0.01, bar.get_y() + bar.get_height()/2, f'{w:.1%} ({cnt}/36 states)',
                va='center', ha='left', fontsize=10, fontweight='bold', color='#333333')
                
    # Custom legend for itemset sizes
    from matplotlib.patches import Patch
    legend_elements = [
        Patch(facecolor='#2b5c8f', edgecolor='black', label='1-Itemset (Single Characteristic)'),
        Patch(facecolor='#d95f02', edgecolor='black', label='2-Itemset (Pair Profile)'),
        Patch(facecolor='#7570b3', edgecolor='black', label='3-Itemset (Trio Profile)')
    ]
    ax.legend(handles=legend_elements, loc='lower right', frameon=True, fontsize=10)
    
    plt.tight_layout()
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    return fig


def plot_association_rules_scatter(
    rules: pd.DataFrame,
    save_path: Optional[str] = 'outputs/figures/14_association_rules_scatter.png'
) -> plt.Figure:
    """
    Plots a scatter plot of Association Rules (Support vs Confidence with Lift as color/size).
    """
    plt.style.use('seaborn-v0_8-whitegrid')
    fig, ax = plt.subplots(figsize=(11, 7))
    
    if rules.empty:
        ax.text(0.5, 0.5, 'No rules generated with selected criteria', ha='center', va='center')
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        return fig
        
    scatter = ax.scatter(
        rules['support'],
        rules['confidence'],
        c=rules['lift'],
        s=rules['lift'] * 120,
        cmap='viridis',
        alpha=0.85,
        edgecolors='black',
        linewidth=1.2
    )
    
    cbar = plt.colorbar(scatter, ax=ax)
    cbar.set_label('Lift Ratio (Expected Independence Baseline = 1.0)', fontsize=11, fontweight='bold', labelpad=10)
    
    ax.set_xlabel('Rule Support (Proportion of States/UTs with both A and B)', fontsize=12, fontweight='bold', labelpad=10)
    ax.set_ylabel('Rule Confidence P(B | A)', fontsize=12, fontweight='bold', labelpad=10)
    ax.set_title('Association Rules: Support vs. Confidence (Colored by Lift)', fontsize=14, fontweight='bold', pad=15)
    
    # Reference lines
    ax.axhline(0.60, color='gray', linestyle='--', alpha=0.6, label='Min Confidence (0.60)')
    ax.axvline(0.25, color='gray', linestyle=':', alpha=0.6, label='Min Support (0.25 = 9 States)')
    
    # Annotate top 4 rules with highest lift and confidence
    top_annot = rules.nlargest(4, 'lift')
    for _, row in top_annot.iterrows():
        ant_short = row['antecedent_str'].replace('HIGH_', '')
        con_short = row['consequent_str'].replace('HIGH_', '')
        label = f"{ant_short}\n→ {con_short}\n(Lift: {row['lift']:.2f})"
        ax.annotate(
            label,
            xy=(row['support'], row['confidence']),
            xytext=(row['support'] + 0.015, row['confidence'] - 0.02),
            fontsize=8,
            fontweight='bold',
            bbox=dict(boxstyle="round,pad=0.3", fc="#fdfefe", ec="#2b5c8f", alpha=0.9),
            arrowprops=dict(arrowstyle="->", connectionstyle="arc3,rad=0.2", color="#2b5c8f", lw=1.2)
        )
        
    ax.set_ylim(0.55, 1.05)
    ax.set_xlim(0.20, max(rules['support'].max() + 0.08, 0.55))
    ax.legend(loc='lower left', frameon=True, fontsize=10)
    
    plt.tight_layout()
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    return fig


def export_association_tables(
    transaction_matrix: pd.DataFrame,
    threshold_summary: pd.DataFrame,
    frequent_itemsets: pd.DataFrame,
    rules: pd.DataFrame,
    output_dir: str = 'outputs/tables'
) -> Dict[str, str]:
    """
    Exports all generated association rule mining tables for reproducibility.
    """
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    
    paths = {}
    
    # 1. State Transaction Matrix
    tm_path = out_path / 'state_transaction_matrix.csv'
    transaction_matrix.to_csv(tm_path)
    paths['transaction_matrix'] = str(tm_path)
    
    # 2. Item Threshold Summary
    thresh_path = out_path / 'association_item_thresholds.csv'
    threshold_summary.to_csv(thresh_path, index=False)
    paths['item_thresholds'] = str(thresh_path)
    
    # 3. Frequent Itemsets
    fi_export = frequent_itemsets.drop(columns=['itemsets']) if 'itemsets' in frequent_itemsets.columns else frequent_itemsets
    fi_path = out_path / 'frequent_itemsets.csv'
    fi_export.to_csv(fi_path, index=False)
    paths['frequent_itemsets'] = str(fi_path)
    
    # 4. Association Rules
    r_export = rules.drop(columns=['antecedents', 'consequents']) if 'antecedents' in rules.columns else rules
    r_path = out_path / 'association_rules.csv'
    r_export.to_csv(r_path, index=False)
    paths['association_rules'] = str(r_path)
    
    return paths
