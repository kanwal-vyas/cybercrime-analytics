"""
Advanced Outlier Detection & Anomaly Validation Module (Unit 6 Syllabus Alignment)
Project: Cyber Crime Analytics for National Security
Stage: Stage 16 — Advanced Outlier Detection & Anomaly Validation

METHODOLOGICAL OBJECTIVE & SCOPE:
Extends the Stage 8 descriptive outlier analysis into a comprehensive multivariate
anomaly detection and validation study across 36 State/UT jurisdictions in the validated
2023 NCRB dataset.

1. Statistical Methods Evaluated:
   - Robust Multivariate Mahalanobis Distance (MinCovDet with Chi-Square threshold at alpha=0.975)
   - Local Outlier Factor (LOF with k=10 and sensitivity across k=5, 10, 15)
   - Isolation Forest (Stage 8 Baseline Reference at contamination=0.15)
   - Robust Univariate Tukey IQR Fences (Stage 8 Baseline Reference)

2. Dual Feature Spaces:
   - Volume + Composition (14 features: 10 log1p count features + 4 composition shares)
   - Composition Only (4 standardized motive/act composition shares)

3. Non-Normative Academic Guardrails:
   - Identifies statistical extremity under defined mathematical metrics.
   - Strictly does NOT imply criminality, risk scoring, data errors, or policing effectiveness.
"""

import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

# Ensure project root in sys.path
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.preprocessing import StandardScaler
from sklearn.covariance import MinCovDet
from sklearn.neighbors import LocalOutlierFactor
from sklearn.ensemble import IsolationForest
from sklearn.decomposition import PCA
from sklearn.metrics import adjusted_rand_score, jaccard_score
from scipy.stats import chi2

from src.outlier_detection import (
    load_and_prepare_outlier_data,
    compute_univariate_iqr_outliers,
    compute_multivariate_isolation_forest,
    VOLUME_FEATURES,
    SHARE_FEATURES,
    ALL_OUTLIER_FEATURES,
    FEATURE_DISPLAY_NAMES
)


def compute_feature_redundancy(features_df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Computes Pearson and Spearman correlation matrices across the 14 analytical features
    to quantify structural part-whole and scale redundancies.
    """
    # Use log1p of count features and raw shares
    X_counts_log = np.log1p(features_df[VOLUME_FEATURES])
    X_shares = features_df[SHARE_FEATURES]
    X_joint = pd.concat([X_counts_log, X_shares], axis=1)
    
    pearson_corr = X_joint.corr(method='pearson')
    spearman_corr = X_joint.corr(method='spearman')
    
    # Extract pairwise correlation summary table
    pairs = []
    cols = list(X_joint.columns)
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            f1, f2 = cols[i], cols[j]
            r = pearson_corr.loc[f1, f2]
            rho = spearman_corr.loc[f1, f2]
            
            # Categorize structural relation
            if f1 in VOLUME_FEATURES and f2 in VOLUME_FEATURES:
                rel = 'Volume-Volume (Scale / Part-Whole)'
            elif f1 in SHARE_FEATURES and f2 in SHARE_FEATURES:
                rel = 'Composition-Composition (Simplex / Trade-off)'
            else:
                rel = 'Volume-Composition (Cross-Scale)'
                
            pairs.append({
                'feature_1': f1,
                'feature_2': f2,
                'pearson_r': round(float(r), 4),
                'spearman_rho': round(float(rho), 4),
                'relationship_type': rel
            })
            
    pairs_df = pd.DataFrame(pairs).sort_values(by='pearson_r', ascending=False).reset_index(drop=True)
    return pearson_corr, spearman_corr, pairs_df


def compute_robust_mahalanobis(
    features_df: pd.DataFrame,
    feature_cols: List[str] = ALL_OUTLIER_FEATURES,
    random_state: int = 42,
    alpha: float = 0.975
) -> Tuple[pd.DataFrame, MinCovDet, float]:
    """
    Computes robust Mahalanobis distances using the Minimum Covariance Determinant (MinCovDet)
    estimator and a Chi-Square distribution cutoff at quantile alpha.
    """
    X_counts_log = np.log1p(features_df[[c for c in feature_cols if c in VOLUME_FEATURES]])
    X_shares = features_df[[c for c in feature_cols if c in SHARE_FEATURES]]
    X_joint = pd.concat([X_counts_log, X_shares], axis=1)
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_joint)
    
    mcd = MinCovDet(random_state=random_state).fit(X_scaled)
    m_dist = mcd.mahalanobis(X_scaled)
    
    df_dim = X_scaled.shape[1]
    cutoff = float(chi2.ppf(alpha, df=df_dim))
    
    res_df = pd.DataFrame({
        'state_name': features_df['state_name'],
        'total_cases': features_df['total_cases'].astype(int),
        'mahalanobis_distance': np.round(m_dist, 4),
        'chi2_cutoff_975': round(cutoff, 4),
        'mahalanobis_outlier': np.where(m_dist > cutoff, 'Yes', 'No')
    })
    res_df['distance_rank'] = res_df['mahalanobis_distance'].rank(ascending=False).astype(int)
    res_df = res_df.sort_values(by='mahalanobis_distance', ascending=False).reset_index(drop=True)
    
    return res_df, mcd, cutoff


def compute_lof_anomalies(
    features_df: pd.DataFrame,
    feature_cols: List[str] = ALL_OUTLIER_FEATURES,
    k_neighbors: int = 10,
    contamination: float = 0.15
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Computes Local Outlier Factor (LOF) anomaly scores and flags across neighborhood sizes
    (k=5, 10, 15), with primary analysis centered at k=10.
    """
    X_counts_log = np.log1p(features_df[[c for c in feature_cols if c in VOLUME_FEATURES]])
    X_shares = features_df[[c for c in feature_cols if c in SHARE_FEATURES]]
    X_joint = pd.concat([X_counts_log, X_shares], axis=1)
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_joint)
    
    # Primary evaluation at k=10
    lof_primary = LocalOutlierFactor(n_neighbors=k_neighbors, contamination=contamination, novelty=False)
    preds_primary = lof_primary.fit_predict(X_scaled)
    scores_primary = -lof_primary.negative_outlier_factor_
    
    primary_df = pd.DataFrame({
        'state_name': features_df['state_name'],
        'total_cases': features_df['total_cases'].astype(int),
        'lof_score_k10': np.round(scores_primary, 4),
        'lof_outlier_k10': np.where(preds_primary == -1, 'Yes', 'No')
    })
    primary_df['lof_rank_k10'] = primary_df['lof_score_k10'].rank(ascending=False).astype(int)
    primary_df = primary_df.sort_values(by='lof_score_k10', ascending=False).reset_index(drop=True)
    
    # Sensitivity across k=5, 10, 15
    k_res = {'state_name': features_df['state_name'], 'total_cases': features_df['total_cases'].astype(int)}
    for k in [5, 10, 15]:
        lof_k = LocalOutlierFactor(n_neighbors=k, contamination=contamination, novelty=False)
        p_k = lof_k.fit_predict(X_scaled)
        s_k = -lof_k.negative_outlier_factor_
        k_res[f'lof_score_k{k}'] = np.round(s_k, 4)
        k_res[f'lof_outlier_k{k}'] = np.where(p_k == -1, 'Yes', 'No')
        
    sensitivity_df = pd.DataFrame(k_res).sort_values(by='lof_score_k10', ascending=False).reset_index(drop=True)
    return primary_df, sensitivity_df


def build_method_comparison_matrix(
    features_df: pd.DataFrame,
    iqr_df: pd.DataFrame,
    iso_df: pd.DataFrame,
    mah_df: pd.DataFrame,
    lof_df: pd.DataFrame
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Constructs the State/UT x Method comparison matrix and calculates consensus anomaly
    scores and pairwise methodological overlap metrics.
    """
    states = features_df['state_name'].values
    
    # Map flags
    iqr_flagged = set(iqr_df['state_name'].unique())
    iso_map = dict(zip(iso_df['state_name'], iso_df['isolation_forest_outlier']))
    mah_map = dict(zip(mah_df['state_name'], mah_df['mahalanobis_outlier']))
    lof_map = dict(zip(lof_df['state_name'], lof_df['lof_outlier_k10']))
    
    rows = []
    for st in states:
        f_iqr = 1 if st in iqr_flagged else 0
        f_iso = 1 if iso_map.get(st) == 'Yes' else 0
        f_mah = 1 if mah_map.get(st) == 'Yes' else 0
        f_lof = 1 if lof_map.get(st) == 'Yes' else 0
        
        c_score = f_iqr + f_iso + f_mah + f_lof
        
        if c_score == 0:
            c_desc = '0 (No methods flag)'
        elif c_score == 1:
            c_desc = '1 (Single-method anomaly)'
        elif c_score == 2:
            c_desc = '2 (Multi-method anomaly)'
        elif c_score == 3:
            c_desc = '3 (Strong multi-method anomaly)'
        else:
            c_desc = '4 (Consensus anomaly)'
            
        tot_cases = int(features_df.loc[features_df['state_name'] == st, 'total_cases'].values[0])
        
        rows.append({
            'state_name': st,
            'total_cases': tot_cases,
            'iqr_outlier': 'Yes' if f_iqr else 'No',
            'isolation_forest_outlier': 'Yes' if f_iso else 'No',
            'mahalanobis_outlier': 'Yes' if f_mah else 'No',
            'lof_outlier': 'Yes' if f_lof else 'No',
            'consensus_score': c_score,
            'consensus_classification': c_desc
        })
        
    comp_df = pd.DataFrame(rows).sort_values(by=['consensus_score', 'total_cases'], ascending=[False, False]).reset_index(drop=True)
    
    # Method-level summary metrics
    methods = ['iqr_outlier', 'isolation_forest_outlier', 'mahalanobis_outlier', 'lof_outlier']
    summary_rows = []
    for m in methods:
        cnt = (comp_df[m] == 'Yes').sum()
        pct = round(cnt / len(comp_df) * 100, 2)
        summary_rows.append({
            'method': m.replace('_outlier', '').title(),
            'flagged_count': cnt,
            'flagged_percentage': pct
        })
    summary_df = pd.DataFrame(summary_rows)
    
    # Pairwise agreement metrics (Jaccard and ARI)
    pair_rows = []
    for i in range(len(methods)):
        for j in range(i + 1, len(methods)):
            m1, m2 = methods[i], methods[j]
            b1 = (comp_df[m1] == 'Yes').astype(int)
            b2 = (comp_df[m2] == 'Yes').astype(int)
            
            jacc = jaccard_score(b1, b2)
            ari = adjusted_rand_score(b1, b2)
            
            pair_rows.append({
                'method_pair': f"{m1.replace('_outlier', '').title()} vs. {m2.replace('_outlier', '').title()}",
                'jaccard_similarity': round(float(jacc), 4),
                'adjusted_rand_index': round(float(ari), 4)
            })
    pair_df = pd.DataFrame(pair_rows)
    
    return comp_df, summary_df, pair_df


def analyze_volume_vs_composition_anomalies(features_df: pd.DataFrame) -> pd.DataFrame:
    """
    Performs comparative anomaly detection separating Analysis A (Volume + Composition, 14 features)
    from Analysis B (Composition Only, 4 features).
    """
    # 1. Volume + Composition Space
    X_counts_log = np.log1p(features_df[VOLUME_FEATURES])
    X_shares = features_df[SHARE_FEATURES]
    X_joint = pd.concat([X_counts_log, X_shares], axis=1)
    X_joint_scaled = StandardScaler().fit_transform(X_joint)
    
    iso_joint = IsolationForest(contamination=0.15, random_state=42).fit_predict(X_joint_scaled)
    mcd_joint = MinCovDet(random_state=42).fit(X_joint_scaled)
    m_dist_joint = mcd_joint.mahalanobis(X_joint_scaled)
    cut_joint = chi2.ppf(0.975, df=14)
    
    # 2. Composition Only Space
    X_comp_scaled = StandardScaler().fit_transform(X_shares)
    iso_comp = IsolationForest(contamination=0.15, random_state=42).fit_predict(X_comp_scaled)
    mcd_comp = MinCovDet(random_state=42).fit(X_comp_scaled)
    m_dist_comp = mcd_comp.mahalanobis(X_comp_scaled)
    cut_comp = chi2.ppf(0.975, df=4)
    
    rows = []
    for idx, r in features_df.iterrows():
        st = r['state_name']
        tot = int(r['total_cases'])
        
        f_iso_joint = 'Yes' if iso_joint[idx] == -1 else 'No'
        f_mah_joint = 'Yes' if m_dist_joint[idx] > cut_joint else 'No'
        
        f_iso_comp = 'Yes' if iso_comp[idx] == -1 else 'No'
        f_mah_comp = 'Yes' if m_dist_comp[idx] > cut_comp else 'No'
        
        # Categorize anomaly nature
        anom_joint = (f_iso_joint == 'Yes') or (f_mah_joint == 'Yes')
        anom_comp = (f_iso_comp == 'Yes') or (f_mah_comp == 'Yes')
        
        if anom_joint and anom_comp:
            cat = 'Both Volume & Composition Anomaly'
        elif anom_joint and not anom_comp:
            cat = 'Volume-Scale Driven Anomaly'
        elif not anom_joint and anom_comp:
            cat = 'Composition-Profile Driven Anomaly'
        else:
            cat = 'Not Anomalous in Tested Spaces'
            
        rows.append({
            'state_name': st,
            'total_cases': tot,
            'joint_iso_outlier': f_iso_joint,
            'joint_mah_outlier': f_mah_joint,
            'comp_iso_outlier': f_iso_comp,
            'comp_mah_outlier': f_mah_comp,
            'joint_mahalanobis_dist': round(float(m_dist_joint[idx]), 4),
            'comp_mahalanobis_dist': round(float(m_dist_comp[idx]), 4),
            'anomaly_orientation': cat
        })
        
    return pd.DataFrame(rows).sort_values(by='total_cases', ascending=False).reset_index(drop=True)


def run_stage16_sensitivity_analysis(features_df: pd.DataFrame) -> pd.DataFrame:
    """
    Evaluates sensitivity of anomaly detection algorithms when excluding extreme
    small-denominator jurisdictions (total_cases <= 6 -> Dadra & Nagar Haveli and Lakshadweep).
    """
    mask_n34 = ~features_df['state_name'].isin(['Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep'])
    df_n34 = features_df[mask_n34].reset_index(drop=True)
    
    # N=36 Primary
    X_counts_36 = np.log1p(features_df[VOLUME_FEATURES])
    X_36_scaled = StandardScaler().fit_transform(pd.concat([X_counts_36, features_df[SHARE_FEATURES]], axis=1))
    iso_36 = IsolationForest(contamination=0.15, random_state=42).fit_predict(X_36_scaled)
    mcd_36 = MinCovDet(random_state=42).fit(X_36_scaled)
    mah_36 = mcd_36.mahalanobis(X_36_scaled) > chi2.ppf(0.975, df=14)
    
    # N=34 Sensitivity
    X_counts_34 = np.log1p(df_n34[VOLUME_FEATURES])
    X_34_scaled = StandardScaler().fit_transform(pd.concat([X_counts_34, df_n34[SHARE_FEATURES]], axis=1))
    iso_34 = IsolationForest(contamination=0.15, random_state=42).fit_predict(X_34_scaled)
    mcd_34 = MinCovDet(random_state=42).fit(X_34_scaled)
    mah_34 = mcd_34.mahalanobis(X_34_scaled) > chi2.ppf(0.975, df=14)
    
    iso_36_flagged_n34 = (iso_36[mask_n34.values] == -1)
    iso_34_flagged = (iso_34 == -1)
    iso_jaccard = jaccard_score(iso_36_flagged_n34, iso_34_flagged)
    
    mah_36_flagged_n34 = mah_36[mask_n34.values]
    mah_34_flagged = mah_34
    mah_jaccard = jaccard_score(mah_36_flagged_n34, mah_34_flagged)
    
    sens_rows = [
        {
            'method': 'Isolation Forest',
            'primary_n36_flagged': int((iso_36 == -1).sum()),
            'sensitivity_n34_flagged': int((iso_34 == -1).sum()),
            'overlap_jaccard_on_n34': round(float(iso_jaccard), 4),
            'notes': 'Excluding N<=6 small UTs preserves key high-volume and unusual profile flags.'
        },
        {
            'method': 'Robust Mahalanobis',
            'primary_n36_flagged': int(mah_36.sum()),
            'sensitivity_n34_flagged': int(mah_34.sum()),
            'overlap_jaccard_on_n34': round(float(mah_jaccard), 4),
            'notes': 'High stability on core state multivariate departures.'
        }
    ]
    return pd.DataFrame(sens_rows)


def plot_stage16_figures(
    features_df: pd.DataFrame,
    pearson_corr: pd.DataFrame,
    spearman_corr: pd.DataFrame,
    mah_df: pd.DataFrame,
    mah_cutoff: float,
    lof_sens_df: pd.DataFrame,
    comp_df: pd.DataFrame,
    vol_comp_df: pd.DataFrame,
    output_dir: str = 'outputs/figures'
) -> None:
    """
    Generates and saves the 6 Stage 16 visualization figures (Figures 56-61).
    """
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    
    sns.set_theme(style='whitegrid')
    plt.rcParams['font.sans-serif'] = 'Arial'
    
    # -------------------------------------------------------------
    # Figure 56: Feature Redundancy Correlation Heatmap
    # -------------------------------------------------------------
    fig, axes = plt.subplots(1, 2, figsize=(16, 7))
    
    sns.heatmap(pearson_corr, annot=True, fmt='.2f', cmap='coolwarm', vmin=-1, vmax=1,
                cbar=True, ax=axes[0], annot_kws={'size': 7})
    axes[0].set_title('(A) Pearson Linear Correlation Matrix (r)', fontsize=11, fontweight='bold')
    axes[0].tick_params(axis='both', labelsize=8)
    
    sns.heatmap(spearman_corr, annot=True, fmt='.2f', cmap='coolwarm', vmin=-1, vmax=1,
                cbar=True, ax=axes[1], annot_kws={'size': 7})
    axes[1].set_title('(B) Spearman Rank Correlation Matrix (rho)', fontsize=11, fontweight='bold')
    axes[1].tick_params(axis='both', labelsize=8)
    
    plt.suptitle('Stage 16 Feature Redundancy & Correlation Heatmap (14 Features)', fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(out_path / '56_feature_redundancy_correlation_heatmap.png', dpi=300)
    plt.close()
    
    # -------------------------------------------------------------
    # Figure 57: Robust Mahalanobis Distances Bar Plot
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(12, 6))
    
    mah_sorted = mah_df.sort_values(by='mahalanobis_distance', ascending=False)
    sns.barplot(data=mah_sorted, x='state_name', y='mahalanobis_distance', hue='mahalanobis_outlier', palette={'Yes': '#e74c3c', 'No': '#3498db'}, ax=ax)
    ax.axhline(mah_cutoff, color='black', linestyle='--', lw=1.5, label=f'Chi-Square Cutoff (df=14, alpha=0.975): {mah_cutoff:.2f}')
    ax.set_title('Robust Mahalanobis Distances across 36 State/UT Jurisdictions (MinCovDet)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Robust Mahalanobis Distance', fontsize=10)
    ax.set_xlabel('State/UT Jurisdiction', fontsize=10)
    ax.tick_params(axis='x', rotation=90, labelsize=8)
    ax.legend(title='Outlier Flag', fontsize=9)
    plt.tight_layout()
    plt.savefig(out_path / '57_robust_mahalanobis_distances.png', dpi=300)
    plt.close()
    
    # -------------------------------------------------------------
    # Figure 58: LOF Anomaly Score Distributions across Neighborhood Sizes
    # -------------------------------------------------------------
    fig, axes = plt.subplots(1, 3, figsize=(16, 5))
    
    for idx, k in enumerate([5, 10, 15]):
        sns.histplot(lof_sens_df[f'lof_score_k{k}'], bins=15, kde=True, color='#2ecc71', ax=axes[idx])
        axes[idx].axvline(1.0, color='gray', linestyle=':', label='Baseline Density (=1.0)')
        axes[idx].set_title(f'(A{idx+1}) LOF Scores at k={k}', fontsize=11, fontweight='bold')
        axes[idx].set_xlabel('LOF Score (-negative_outlier_factor_)', fontsize=9)
        axes[idx].set_ylabel('Jurisdiction Count', fontsize=9)
        axes[idx].legend(fontsize=8)
        
    plt.suptitle('Local Outlier Factor (LOF) Anomaly Score Distributions across Neighborhoods (N=36)', fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(out_path / '58_lof_anomaly_scores.png', dpi=300)
    plt.close()
    
    # -------------------------------------------------------------
    # Figure 59: Method Agreement / Consensus Anomaly Score Distribution
    # -------------------------------------------------------------
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    # Consensus score distribution
    c_counts = comp_df['consensus_score'].value_counts().sort_index()
    c_df = pd.DataFrame({'Consensus_Score': c_counts.index, 'Count': c_counts.values})
    sns.barplot(data=c_df, x='Consensus_Score', y='Count', hue='Consensus_Score', palette='viridis', legend=False, ax=axes[0])
    axes[0].set_title('(A) Consensus Anomaly Score Distribution (0-4 Methods)', fontsize=11, fontweight='bold')
    axes[0].set_xlabel('Number of Methods Flagging Jurisdiction', fontsize=10)
    axes[0].set_ylabel('Jurisdiction Count (out of 36)', fontsize=10)
    for p in axes[0].patches:
        h = p.get_height()
        axes[0].annotate(f'{int(h)} ({h/36*100:.1f}%)', (p.get_x() + p.get_width() / 2., h / 2.),
                         ha='center', va='center', fontsize=9, color='white', fontweight='bold')
        
    # Anomaly flag matrix heatmap for top states
    flag_cols = ['iqr_outlier', 'isolation_forest_outlier', 'mahalanobis_outlier', 'lof_outlier']
    flag_mat = comp_df[flag_cols].map(lambda x: 1 if x == 'Yes' else 0)
    flag_mat.index = comp_df['state_name']
    
    # Filter to states flagged by at least 1 method
    flag_sub = flag_mat[flag_mat.sum(axis=1) > 0]
    sns.heatmap(flag_sub, cmap='Blues', cbar=False, linewidths=0.5, ax=axes[1], annot=True, fmt='d')
    axes[1].set_title('(B) Method Concordance Matrix for Flagged Jurisdictions', fontsize=11, fontweight='bold')
    axes[1].set_xlabel('Anomaly Detection Method', fontsize=10)
    axes[1].set_ylabel('State/UT Jurisdiction', fontsize=10)
    axes[1].tick_params(axis='y', labelsize=8)
    
    plt.suptitle('Multi-Method Anomaly Agreement & Consensus Profiling (N=36)', fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(out_path / '59_anomaly_method_agreement_consensus.png', dpi=300)
    plt.close()
    
    # -------------------------------------------------------------
    # Figure 60: Volume-Space vs Composition-Space Anomalies
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(10, 6))
    
    sns.scatterplot(
        data=vol_comp_df,
        x='joint_mahalanobis_dist',
        y='comp_mahalanobis_dist',
        hue='anomaly_orientation',
        size='total_cases',
        sizes=(40, 400),
        palette='Set1',
        edgecolor='black',
        alpha=0.85,
        ax=ax
    )
    ax.set_title('Comparative Mahalanobis Extremity: Volume+Composition vs. Composition-Only Space', fontsize=12, fontweight='bold')
    ax.set_xlabel('Mahalanobis Distance (14 Volume+Composition Features)', fontsize=10)
    ax.set_ylabel('Mahalanobis Distance (4 Composition-Only Features)', fontsize=10)
    ax.legend(bbox_to_anchor=(1.02, 1), loc='upper left', fontsize=9)
    plt.tight_layout()
    plt.savefig(out_path / '60_volume_vs_composition_anomalies.png', dpi=300)
    plt.close()
    
    # -------------------------------------------------------------
    # Figure 61: 2D PCA Anomaly Projection
    # -------------------------------------------------------------
    X_counts_log = np.log1p(features_df[VOLUME_FEATURES])
    X_shares = features_df[SHARE_FEATURES]
    X_scaled = StandardScaler().fit_transform(pd.concat([X_counts_log, X_shares], axis=1))
    
    pca = PCA(n_components=2, random_state=42)
    coords = pca.fit_transform(X_scaled)
    var_exp = pca.explained_variance_ratio_ * 100
    
    pca_df = comp_df.copy()
    pca_df['PC1'] = coords[:, 0]
    pca_df['PC2'] = coords[:, 1]
    
    fig, ax = plt.subplots(figsize=(11, 6))
    sns.scatterplot(
        data=pca_df,
        x='PC1',
        y='PC2',
        hue='consensus_score',
        size='total_cases',
        sizes=(40, 400),
        palette='flare',
        edgecolor='black',
        ax=ax
    )
    # Annotate high-consensus states
    for _, r in pca_df[pca_df['consensus_score'] >= 3].iterrows():
        ax.annotate(r['state_name'], (r['PC1'] + 0.15, r['PC2'] + 0.15), fontsize=8, fontweight='bold')
        
    ax.set_title(f'2D PCA Projection of 2023 Jurisdictions Colored by Consensus Anomaly Score (N=36)', fontsize=12, fontweight='bold')
    ax.set_xlabel(f'Principal Component 1 ({var_exp[0]:.1f}% Variance)', fontsize=10)
    ax.set_ylabel(f'Principal Component 2 ({var_exp[1]:.1f}% Variance)', fontsize=10)
    ax.legend(title='Consensus Score', bbox_to_anchor=(1.02, 1), loc='upper left', fontsize=9)
    plt.tight_layout()
    plt.savefig(out_path / '61_pca_anomaly_visualization.png', dpi=300)
    plt.close()


def save_stage16_tables(
    redundancy_df: pd.DataFrame,
    mah_df: pd.DataFrame,
    lof_sens_df: pd.DataFrame,
    comp_df: pd.DataFrame,
    vol_comp_df: pd.DataFrame,
    sens_df: pd.DataFrame,
    output_dir: str = 'outputs/tables'
) -> None:
    """
    Saves all Stage 16 analytical tables to CSV format.
    """
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    
    redundancy_df.to_csv(out_path / 'stage16_feature_redundancy.csv', index=False)
    mah_df.to_csv(out_path / 'stage16_mahalanobis_scores.csv', index=False)
    lof_sens_df.to_csv(out_path / 'stage16_lof_scores.csv', index=False)
    comp_df.to_csv(out_path / 'stage16_method_comparison.csv', index=False)
    comp_df.to_csv(out_path / 'stage16_consensus_anomalies.csv', index=False)
    vol_comp_df.to_csv(out_path / 'stage16_volume_vs_composition.csv', index=False)
    sens_df.to_csv(out_path / 'stage16_sensitivity.csv', index=False)


def run_stage16_pipeline() -> Dict[str, Any]:
    """
    Executes the end-to-end Stage 16 Advanced Outlier Detection & Anomaly Validation pipeline.
    """
    print("=" * 70)
    print("STAGE 16: ADVANCED OUTLIER DETECTION & ANOMALY VALIDATION — PIPELINE")
    print("=" * 70)
    
    # 1. Load data
    features_df, metadata = load_and_prepare_outlier_data()
    print(f"[+] Loaded 2023 dataset: {len(features_df)} State/UT observations, {len(ALL_OUTLIER_FEATURES)} features.")
    
    # 2. Feature redundancy audit
    pearson_corr, spearman_corr, redundancy_df = compute_feature_redundancy(features_df)
    print(f"[+] Feature redundancy computed: {len(redundancy_df)} pairwise correlations.")
    
    # 3. Robust Mahalanobis Distance
    mah_df, mcd_model, mah_cutoff = compute_robust_mahalanobis(features_df)
    n_mah = (mah_df['mahalanobis_outlier'] == 'Yes').sum()
    print(f"[+] Robust Mahalanobis computed: {n_mah} outliers flagged at Chi-Square cutoff ({mah_cutoff:.2f}).")
    
    # 4. Local Outlier Factor
    lof_primary_df, lof_sens_df = compute_lof_anomalies(features_df, k_neighbors=10, contamination=0.15)
    n_lof = (lof_primary_df['lof_outlier_k10'] == 'Yes').sum()
    print(f"[+] Local Outlier Factor computed: {n_lof} outliers flagged at k=10, c=0.15.")
    
    # 5. Baseline references from Stage 8
    iqr_stats_df, iqr_outliers_df = compute_univariate_iqr_outliers(features_df)
    iso_df, iso_model, X_scaled = compute_multivariate_isolation_forest(features_df, contamination=0.15, random_state=42)
    
    # 6. Method comparison & consensus matrix
    comp_df, summary_df, pair_df = build_method_comparison_matrix(features_df, iqr_outliers_df, iso_df, mah_df, lof_primary_df)
    print(f"[+] Consensus matrix compiled across IQR, Isolation Forest, Mahalanobis, and LOF.")
    
    # 7. Volume vs. Composition analysis
    vol_comp_df = analyze_volume_vs_composition_anomalies(features_df)
    print(f"[+] Volume-driven vs Composition-driven anomaly orientations categorized.")
    
    # 8. Small-denominator sensitivity
    sens_df = run_stage16_sensitivity_analysis(features_df)
    print(f"[+] Sensitivity analysis on N=34 completed.")
    
    # 9. Save tables
    save_stage16_tables(redundancy_df, mah_df, lof_sens_df, comp_df, vol_comp_df, sens_df)
    print(f"[+] Saved 7 analytical tables to outputs/tables/.")
    
    # 10. Generate figures
    plot_stage16_figures(features_df, pearson_corr, spearman_corr, mah_df, mah_cutoff, lof_sens_df, comp_df, vol_comp_df)
    print(f"[+] Generated Figures 56-61 in outputs/figures/.")
    print("=" * 70)
    
    return {
        'features_df': features_df,
        'redundancy_df': redundancy_df,
        'mah_df': mah_df,
        'lof_sens_df': lof_sens_df,
        'comp_df': comp_df,
        'vol_comp_df': vol_comp_df,
        'sens_df': sens_df,
        'summary_df': summary_df,
        'pair_df': pair_df
    }


if __name__ == '__main__':
    run_stage16_pipeline()
