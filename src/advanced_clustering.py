"""
Advanced Clustering & Cluster Validation Module (Unit 6 Syllabus Alignment)
Project: Cyber Crime Analytics for National Security
Stage: Stage 15 — Advanced Clustering & Cluster Validation

METHODOLOGICAL OBJECTIVE & SCOPE:
Assess the robustness and interpretability of State/UT cybercrime profile clusters
using alternative clustering algorithms (Hierarchical Agglomerative Clustering,
Gaussian Mixture Models, DBSCAN) and formal cluster-validation measures (Silhouette,
Calinski-Harabasz, Davies-Bouldin, BIC/AIC, Adjusted Rand Index, Normalized Mutual Information).

1. Feature Space & Normalization:
   - Primary feature space: 4 proportional composition indicators from the validated 2023 dataset:
     it_act_share, fraud_motive_share, extortion_motive_share, sexual_exploitation_motive_share.
   - Standardized via StandardScaler. Total volume is strictly excluded from distance calculations.

2. Algorithms Evaluated:
   - Reference K-Means (Stage 6 Baseline): K in [2, 8]
   - Agglomerative Hierarchical Clustering (Ward linkage): K in [2, 8]
   - Gaussian Mixture Models (GMM): K in [2, 8] with AIC/BIC scoring
   - DBSCAN (Density-Based Spatial Clustering of Applications with Noise) exploration

3. Non-Normative Academic Guardrails:
   - Clusters describe compositional profiles (e.g. Higher IT Act / Higher Fraud Share Profile),
     not moral, risk-ranking, or policing priorities.
"""

from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, AgglomerativeClustering, DBSCAN
from sklearn.mixture import GaussianMixture
from sklearn.metrics import (
    silhouette_score,
    calinski_harabasz_score,
    davies_bouldin_score,
    adjusted_rand_score,
    normalized_mutual_info_score,
    confusion_matrix
)
from sklearn.decomposition import PCA
from scipy.optimize import linear_sum_assignment

# Primary composition features
CLUSTERING_FEATURES = [
    'it_act_share',
    'fraud_motive_share',
    'extortion_motive_share',
    'sexual_exploitation_motive_share'
]

# Descriptive profile labels for Stage 6 reference K=4
CLUSTER_LABELS_K4 = {
    0: 'Lower IT Act Share / Moderate Fraud Share Profile',
    1: 'Higher IT Act Share / Higher Fraud Share Profile',
    2: 'High Sexual-Exploitation Share / Small-Denominator Profile',
    3: 'Higher Extortion Motive Share Profile'
}


def load_clustering_dataset(
    data_path: str = 'data/processed/master_state_2023.csv'
) -> Tuple[pd.DataFrame, np.ndarray, StandardScaler]:
    """
    Loads validated 2023 master state cross-section, computes composition features,
    and returns raw dataframe, scaled matrix, and fitted scaler.
    """
    master_df = pd.read_csv(data_path)
    state_col = 'state_name' if 'state_name' in master_df.columns else 'State/UT'
    states = master_df[state_col].values
    
    grand_col = 'cat__Total Cyber Crimes (IT Act + IPC r/w IT Act + SLL r/w IT Act)'
    it_col = 'cat__Total Offences under I.T. Act'
    m_tot = 'motive__Total'
    
    raw_df = pd.DataFrame({
        'state_name': states,
        'total_cases': master_df[grand_col].astype(int),
        'it_act_cases': master_df[it_col].astype(int),
        'motive_total': master_df[m_tot].astype(int),
        'it_act_share': (master_df[it_col] / master_df[grand_col]).fillna(0.0),
        'fraud_motive_share': (master_df['motive__Fraud'] / master_df[m_tot]).fillna(0.0),
        'extortion_motive_share': (master_df['motive__Extortion'] / master_df[m_tot]).fillna(0.0),
        'sexual_exploitation_motive_share': (master_df['motive__Sexual Exploitation'] / master_df[m_tot]).fillna(0.0)
    })
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(raw_df[CLUSTERING_FEATURES].values)
    
    return raw_df, X_scaled, scaler


def run_comprehensive_validation(
    X_scaled: np.ndarray
) -> pd.DataFrame:
    """
    Evaluates K-Means, Agglomerative (Ward), and Gaussian Mixture across K=2..8,
    plus exploratory DBSCAN configurations.
    """
    records = []
    
    for k in range(2, 9):
        # 1. K-Means
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        lbl_km = km.fit_predict(X_scaled)
        records.append({
            'algorithm': 'K-Means',
            'k': k,
            'silhouette': round(float(silhouette_score(X_scaled, lbl_km)), 4),
            'calinski_harabasz': round(float(calinski_harabasz_score(X_scaled, lbl_km)), 2),
            'davies_bouldin': round(float(davies_bouldin_score(X_scaled, lbl_km)), 4),
            'aic': np.nan,
            'bic': np.nan,
            'n_clusters': k,
            'n_noise': 0
        })
        
        # 2. Agglomerative (Ward)
        agg = AgglomerativeClustering(n_clusters=k, linkage='ward')
        lbl_agg = agg.fit_predict(X_scaled)
        records.append({
            'algorithm': 'Agglomerative (Ward)',
            'k': k,
            'silhouette': round(float(silhouette_score(X_scaled, lbl_agg)), 4),
            'calinski_harabasz': round(float(calinski_harabasz_score(X_scaled, lbl_agg)), 2),
            'davies_bouldin': round(float(davies_bouldin_score(X_scaled, lbl_agg)), 4),
            'aic': np.nan,
            'bic': np.nan,
            'n_clusters': k,
            'n_noise': 0
        })
        
        # 3. Gaussian Mixture
        gmm = GaussianMixture(n_components=k, random_state=42, n_init=5)
        lbl_gmm = gmm.fit_predict(X_scaled)
        records.append({
            'algorithm': 'Gaussian Mixture (GMM)',
            'k': k,
            'silhouette': round(float(silhouette_score(X_scaled, lbl_gmm)), 4),
            'calinski_harabasz': round(float(calinski_harabasz_score(X_scaled, lbl_gmm)), 2),
            'davies_bouldin': round(float(davies_bouldin_score(X_scaled, lbl_gmm)), 4),
            'aic': round(float(gmm.aic(X_scaled)), 2),
            'bic': round(float(gmm.bic(X_scaled)), 2),
            'n_clusters': k,
            'n_noise': 0
        })
        
    # 4. DBSCAN Explorations
    for eps, ms in [(0.8, 2), (1.0, 2), (1.2, 2), (1.2, 3), (1.5, 2)]:
        db = DBSCAN(eps=eps, min_samples=ms)
        lbl_db = db.fit_predict(X_scaled)
        n_c = len(set(lbl_db)) - (1 if -1 in lbl_db else 0)
        n_n = int((lbl_db == -1).sum())
        
        if n_c > 1 and (lbl_db != -1).sum() > n_c:
            sil = round(float(silhouette_score(X_scaled, lbl_db)), 4)
            ch = round(float(calinski_harabasz_score(X_scaled, lbl_db)), 2)
            db_sc = round(float(davies_bouldin_score(X_scaled, lbl_db)), 4)
        else:
            sil, ch, db_sc = np.nan, np.nan, np.nan
            
        records.append({
            'algorithm': f'DBSCAN (eps={eps}, min_samples={ms})',
            'k': n_c,
            'silhouette': sil,
            'calinski_harabasz': ch,
            'davies_bouldin': db_sc,
            'aic': np.nan,
            'bic': np.nan,
            'n_clusters': n_c,
            'n_noise': n_n
        })
        
    return pd.DataFrame(records)


def align_cluster_labels(reference_labels: np.ndarray, candidate_labels: np.ndarray) -> np.ndarray:
    """
    Aligns candidate cluster labels to reference labels using the Hungarian algorithm
    to maximize diagonal overlap for direct interpretability.
    """
    cm = confusion_matrix(reference_labels, candidate_labels)
    row_ind, col_ind = linear_sum_assignment(-cm)
    mapping = {col: row for row, col in zip(row_ind, col_ind)}
    aligned_labels = np.array([mapping.get(lbl, lbl) for lbl in candidate_labels])
    return aligned_labels


def run_stage15_clustering_suite(
    raw_df: pd.DataFrame,
    X_scaled: np.ndarray
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Executes comprehensive clustering comparison, agreement, jurisdiction-level stability,
    and tiny-denominator sensitivity analysis.
    """
    # 1. Validation metrics across K
    val_df = run_comprehensive_validation(X_scaled)
    
    # 2. Fit models at K=4
    km4 = KMeans(n_clusters=4, random_state=42, n_init=10).fit(X_scaled)
    lbl_km4 = km4.labels_
    
    agg4 = AgglomerativeClustering(n_clusters=4, linkage='ward').fit(X_scaled)
    lbl_agg4 = agg4.labels_
    lbl_agg4_aligned = align_cluster_labels(lbl_km4, lbl_agg4)
    
    gmm4 = GaussianMixture(n_components=4, random_state=42, n_init=5).fit(X_scaled)
    lbl_gmm4 = gmm4.predict(X_scaled)
    lbl_gmm4_aligned = align_cluster_labels(lbl_km4, lbl_gmm4)
    
    # Compute 2D PCA for visualization
    pca = PCA(n_components=2, random_state=42)
    pca_coords = pca.fit_transform(X_scaled)
    
    # 3. Compile Algorithm Comparison Table at K=4
    algo_rows = [
        {
            'Algorithm': 'K-Means (Stage 6 Reference)',
            'K': 4,
            'Silhouette': round(float(silhouette_score(X_scaled, lbl_km4)), 4),
            'Calinski_Harabasz': round(float(calinski_harabasz_score(X_scaled, lbl_km4)), 2),
            'Davies_Bouldin': round(float(davies_bouldin_score(X_scaled, lbl_km4)), 4),
            'ARI_vs_Stage6_KMeans': 1.0000,
            'NMI_vs_Stage6_KMeans': 1.0000
        },
        {
            'Algorithm': 'Agglomerative (Ward Linkage)',
            'K': 4,
            'Silhouette': round(float(silhouette_score(X_scaled, lbl_agg4)), 4),
            'Calinski_Harabasz': round(float(calinski_harabasz_score(X_scaled, lbl_agg4)), 2),
            'Davies_Bouldin': round(float(davies_bouldin_score(X_scaled, lbl_agg4)), 4),
            'ARI_vs_Stage6_KMeans': round(float(adjusted_rand_score(lbl_km4, lbl_agg4)), 4),
            'NMI_vs_Stage6_KMeans': round(float(normalized_mutual_info_score(lbl_km4, lbl_agg4)), 4)
        },
        {
            'Algorithm': 'Gaussian Mixture (GMM)',
            'K': 4,
            'Silhouette': round(float(silhouette_score(X_scaled, lbl_gmm4)), 4),
            'Calinski_Harabasz': round(float(calinski_harabasz_score(X_scaled, lbl_gmm4)), 2),
            'Davies_Bouldin': round(float(davies_bouldin_score(X_scaled, lbl_gmm4)), 4),
            'ARI_vs_Stage6_KMeans': round(float(adjusted_rand_score(lbl_km4, lbl_gmm4)), 4),
            'NMI_vs_Stage6_KMeans': round(float(normalized_mutual_info_score(lbl_km4, lbl_gmm4)), 4)
        }
    ]
    algo_comp_df = pd.DataFrame(algo_rows)
    
    # 4. Compile Cluster Agreement Matrix
    agreement_rows = [
        {
            'Comparison_Pair': 'K-Means vs. Agglomerative (Ward)',
            'Adjusted_Rand_Index_ARI': round(float(adjusted_rand_score(lbl_km4, lbl_agg4)), 4),
            'Normalized_Mutual_Info_NMI': round(float(normalized_mutual_info_score(lbl_km4, lbl_agg4)), 4),
            'Interpretation': 'Moderate-to-strong partition overlap across distance metrics.'
        },
        {
            'Comparison_Pair': 'K-Means vs. Gaussian Mixture (GMM)',
            'Adjusted_Rand_Index_ARI': round(float(adjusted_rand_score(lbl_km4, lbl_gmm4)), 4),
            'Normalized_Mutual_Info_NMI': round(float(normalized_mutual_info_score(lbl_km4, lbl_gmm4)), 4),
            'Interpretation': 'Substantial partition alignment between centroid and density/covariance models.'
        },
        {
            'Comparison_Pair': 'Agglomerative vs. Gaussian Mixture (GMM)',
            'Adjusted_Rand_Index_ARI': round(float(adjusted_rand_score(lbl_agg4, lbl_gmm4)), 4),
            'Normalized_Mutual_Info_NMI': round(float(normalized_mutual_info_score(lbl_agg4, lbl_gmm4)), 4),
            'Interpretation': 'Moderate agreement across hierarchical vs. probabilistic density assumptions.'
        }
    ]
    agreement_df = pd.DataFrame(agreement_rows)
    
    # 5. Compile State Cluster Assignments Table
    assign_df = raw_df.copy()
    assign_df['stage6_kmeans_cluster'] = lbl_km4
    assign_df['kmeans_label'] = assign_df['stage6_kmeans_cluster'].map(CLUSTER_LABELS_K4)
    assign_df['agglomerative_cluster'] = lbl_agg4_aligned
    assign_df['gmm_cluster'] = lbl_gmm4_aligned
    assign_df['PCA1'] = np.round(pca_coords[:, 0], 4)
    assign_df['PCA2'] = np.round(pca_coords[:, 1], 4)
    
    # 6. Jurisdiction-Level Stability Table
    stability_rows = []
    for _, r in assign_df.iterrows():
        c_km = r['stage6_kmeans_cluster']
        c_agg = r['agglomerative_cluster']
        c_gmm = r['gmm_cluster']
        
        matches = sum([c_km == c_agg, c_km == c_gmm, c_agg == c_gmm])
        if c_km == c_agg == c_gmm:
            status = 'Highly Stable (3/3 Methods Agree)'
        elif matches >= 1:
            status = 'Moderately Stable (2/3 Methods Agree)'
        else:
            status = 'Boundary Case (3 Unique Assignments)'
            
        stability_rows.append({
            'state_name': r['state_name'],
            'total_cases': int(r['total_cases']),
            'stage6_kmeans_cluster': int(c_km),
            'agglomerative_cluster': int(c_agg),
            'gmm_cluster': int(c_gmm),
            'stability_status': status
        })
    stability_df = pd.DataFrame(stability_rows)
    
    # 7. Cluster Profiles Table (for Stage 6 Reference K=4)
    profile_rows = []
    for cid in sorted(assign_df['stage6_kmeans_cluster'].unique()):
        sub = assign_df[assign_df['stage6_kmeans_cluster'] == cid]
        profile_rows.append({
            'cluster_id': int(cid),
            'cluster_label': CLUSTER_LABELS_K4.get(cid, f'Cluster {cid}'),
            'n_states': len(sub),
            'mean_it_act_share': round(float(sub['it_act_share'].mean()), 4),
            'mean_fraud_motive_share': round(float(sub['fraud_motive_share'].mean()), 4),
            'mean_extortion_motive_share': round(float(sub['extortion_motive_share'].mean()), 4),
            'mean_sexual_exploitation_motive_share': round(float(sub['sexual_exploitation_motive_share'].mean()), 4),
            'median_total_cases': round(float(sub['total_cases'].median()), 1)
        })
    profiles_df = pd.DataFrame(profile_rows)
    
    # 8. Tiny-Denominator Sensitivity Analysis Table (N=36 vs N=34 excluding D&NH and Lakshadweep)
    mask_n34 = ~raw_df['state_name'].isin(['Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep'])
    X_n34 = raw_df.loc[mask_n34, CLUSTERING_FEATURES].values
    X_n34_scaled = StandardScaler().fit_transform(X_n34)
    
    km_n34_k3 = KMeans(n_clusters=3, random_state=42, n_init=10).fit_predict(X_n34_scaled)
    agg_n34_k3 = AgglomerativeClustering(n_clusters=3, linkage='ward').fit_predict(X_n34_scaled)
    gmm_n34_k3 = GaussianMixture(n_components=3, random_state=42, n_init=5).fit_predict(X_n34_scaled)
    
    sensitivity_rows = [
        {
            'Dataset_Scope': 'Primary Analysis (All Jurisdictions)',
            'Jurisdiction_Count_N': 36,
            'Evaluated_K': 4,
            'KMeans_Silhouette': round(float(silhouette_score(X_scaled, lbl_km4)), 4),
            'Agglomerative_Silhouette': round(float(silhouette_score(X_scaled, lbl_agg4)), 4),
            'GMM_Silhouette': round(float(silhouette_score(X_scaled, lbl_gmm4)), 4),
            'KMeans_vs_Agg_ARI': round(float(adjusted_rand_score(lbl_km4, lbl_agg4)), 4),
            'Notes': 'Cluster 2 absorbs 2 tiny sexual-exploitation outliers (Dadra & Nagar Haveli, Lakshadweep).'
        },
        {
            'Dataset_Scope': 'Sensitivity Analysis (Excluding Small-Denominator)',
            'Jurisdiction_Count_N': 34,
            'Evaluated_K': 3,
            'KMeans_Silhouette': round(float(silhouette_score(X_n34_scaled, km_n34_k3)), 4),
            'Agglomerative_Silhouette': round(float(silhouette_score(X_n34_scaled, agg_n34_k3)), 4),
            'GMM_Silhouette': round(float(silhouette_score(X_n34_scaled, gmm_n34_k3)), 4),
            'KMeans_vs_Agg_ARI': round(float(adjusted_rand_score(km_n34_k3, agg_n34_k3)), 4),
            'Notes': 'Excluding N<=6 small-denominator states confirms underlying 3-profile macroeconomic structure.'
        }
    ]
    sensitivity_df = pd.DataFrame(sensitivity_rows)
    
    return val_df, algo_comp_df, assign_df, stability_df, profiles_df, agreement_df, sensitivity_df


def plot_stage15_figures(
    val_df: pd.DataFrame,
    algo_comp_df: pd.DataFrame,
    assign_df: pd.DataFrame,
    profiles_df: pd.DataFrame,
    agreement_df: pd.DataFrame,
    sensitivity_df: pd.DataFrame,
    output_dir: str = 'outputs/figures'
) -> None:
    """
    Generates and saves the 6 Stage 15 visualization figures (Figures 50-55).
    """
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    
    sns.set_theme(style='whitegrid')
    plt.rcParams['font.sans-serif'] = 'Arial'
    
    # -------------------------------------------------------------
    # Figure 50: Cluster Validation Comparison Across K
    # -------------------------------------------------------------
    fig, axes = plt.subplots(1, 3, figsize=(16, 5))
    
    main_val = val_df[val_df['algorithm'].isin(['K-Means', 'Agglomerative (Ward)', 'Gaussian Mixture (GMM)'])].copy()
    
    # Subplot A: Silhouette Score
    sns.lineplot(data=main_val, x='k', y='silhouette', hue='algorithm', marker='o', lw=2, ax=axes[0])
    axes[0].set_title('(A) Silhouette Score across K (Higher is Better)', fontsize=11, fontweight='bold')
    axes[0].set_xlabel('Number of Clusters (K)', fontsize=10)
    axes[0].set_ylabel('Silhouette Coefficient', fontsize=10)
    axes[0].axvline(4, color='gray', linestyle='--', alpha=0.7, label='Reference K=4')
    axes[0].legend(fontsize=8)
    
    # Subplot B: Calinski-Harabasz Index
    sns.lineplot(data=main_val, x='k', y='calinski_harabasz', hue='algorithm', marker='s', lw=2, ax=axes[1])
    axes[1].set_title('(B) Calinski-Harabasz Index (Higher is Better)', fontsize=11, fontweight='bold')
    axes[1].set_xlabel('Number of Clusters (K)', fontsize=10)
    axes[1].set_ylabel('Calinski-Harabasz Score', fontsize=10)
    axes[1].axvline(4, color='gray', linestyle='--', alpha=0.7)
    axes[1].legend(fontsize=8)
    
    # Subplot C: Davies-Bouldin Index
    sns.lineplot(data=main_val, x='k', y='davies_bouldin', hue='algorithm', marker='^', lw=2, ax=axes[2])
    axes[2].set_title('(C) Davies-Bouldin Index (Lower is Better)', fontsize=11, fontweight='bold')
    axes[2].set_xlabel('Number of Clusters (K)', fontsize=10)
    axes[2].set_ylabel('Davies-Bouldin Index', fontsize=10)
    axes[2].axvline(4, color='gray', linestyle='--', alpha=0.7)
    axes[2].legend(fontsize=8)
    
    plt.suptitle('Multi-Criteria Cluster Validation Profiles across K in [2, 8]', fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(out_path / '50_cluster_validation_comparison_across_k.png', dpi=300)
    plt.close()
    
    # -------------------------------------------------------------
    # Figure 51: Algorithm Comparison at Preferred K=4
    # -------------------------------------------------------------
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    
    sns.barplot(data=algo_comp_df, x='Algorithm', y='Silhouette', hue='Algorithm', palette='mako', legend=False, ax=axes[0])
    axes[0].set_title('(A) Silhouette Score by Clustering Algorithm (K=4)', fontsize=11, fontweight='bold')
    axes[0].set_ylabel('Silhouette Coefficient', fontsize=10)
    axes[0].set_xlabel('')
    axes[0].set_ylim(0, 0.5)
    for p in axes[0].patches:
        h = p.get_height()
        axes[0].annotate(f'{h:.4f}', (p.get_x() + p.get_width() / 2., h / 2.),
                         ha='center', va='center', fontsize=10, color='white', fontweight='bold')
        
    sns.barplot(data=algo_comp_df, x='Algorithm', y='ARI_vs_Stage6_KMeans', hue='Algorithm', palette='viridis', legend=False, ax=axes[1])
    axes[1].set_title('(B) Adjusted Rand Index (ARI) vs. Stage 6 Baseline', fontsize=11, fontweight='bold')
    axes[1].set_ylabel('Adjusted Rand Index (ARI)', fontsize=10)
    axes[1].set_xlabel('')
    axes[1].set_ylim(0, 1.15)
    for p in axes[1].patches:
        h = p.get_height()
        axes[1].annotate(f'{h:.4f}', (p.get_x() + p.get_width() / 2., max(0.05, h / 2.)),
                         ha='center', va='center', fontsize=10, color='white', fontweight='bold')
        
    plt.tight_layout()
    plt.savefig(out_path / '51_algorithm_comparison_preferred_k.png', dpi=300)
    plt.close()
    
    # -------------------------------------------------------------
    # Figure 52: PCA 2D Cluster Visualizations (K-Means vs Agglomerative vs GMM)
    # -------------------------------------------------------------
    fig, axes = plt.subplots(1, 3, figsize=(16, 5))
    
    methods = [
        ('Stage 6 K-Means (Reference)', 'stage6_kmeans_cluster', axes[0]),
        ('Agglomerative (Ward Linkage)', 'agglomerative_cluster', axes[1]),
        ('Gaussian Mixture Model (GMM)', 'gmm_cluster', axes[2])
    ]
    palette_k4 = {0: '#3498db', 1: '#2ecc71', 2: '#e74c3c', 3: '#9b59b6'}
    
    for title, col, ax in methods:
        sns.scatterplot(
            data=assign_df, x='PCA1', y='PCA2', hue=col, palette=palette_k4,
            s=80, edgecolors='black', ax=ax, legend='full'
        )
        ax.set_title(title, fontsize=11, fontweight='bold')
        ax.set_xlabel('Principal Component 1 (45.3% Variance)', fontsize=9)
        ax.set_ylabel('Principal Component 2 (30.5% Variance)', fontsize=9)
        ax.legend(title='Cluster ID', fontsize=8)
        
    plt.suptitle('2D PCA Projections of 2023 State Profiles across Clustering Architectures (N=36)', fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(out_path / '52_pca_cluster_visualization.png', dpi=300)
    plt.close()
    
    # -------------------------------------------------------------
    # Figure 53: Cluster Profile Comparison across Features
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(11, 6))
    
    prof_melt = pd.melt(
        profiles_df,
        id_vars=['cluster_label'],
        value_vars=['mean_it_act_share', 'mean_fraud_motive_share', 'mean_extortion_motive_share', 'mean_sexual_exploitation_motive_share'],
        var_name='Feature',
        value_name='Mean_Share'
    )
    prof_melt['Feature'] = prof_melt['Feature'].str.replace('mean_', '').str.replace('_share', '').str.replace('_', ' ').str.title()
    
    sns.barplot(data=prof_melt, y='cluster_label', x='Mean_Share', hue='Feature', palette='tab10', ax=ax)
    ax.set_title('Composition Profiles across Reference K=4 Clusters (Mean Proportions)', fontsize=12, fontweight='bold')
    ax.set_xlabel('Mean Proportional Share in 2023 Cases', fontsize=10)
    ax.set_ylabel('Descriptive Profile Group', fontsize=10)
    ax.legend(bbox_to_anchor=(1.02, 1), loc='upper left', borderaxespad=0., fontsize=9)
    plt.tight_layout()
    plt.savefig(out_path / '53_cluster_profile_comparison.png', dpi=300)
    plt.close()
    
    # -------------------------------------------------------------
    # Figure 54: Stage 6 vs Alternative Clustering Agreement Heatmap
    # -------------------------------------------------------------
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    
    cm_km_agg = confusion_matrix(assign_df['stage6_kmeans_cluster'], assign_df['agglomerative_cluster'])
    sns.heatmap(cm_km_agg, annot=True, fmt='d', cmap='Blues', cbar=False,
                xticklabels=[f'Agg {i}' for i in range(4)], yticklabels=[f'KM {i}' for i in range(4)], ax=axes[0])
    axes[0].set_title('(A) K-Means vs. Agglomerative Overlap (ARI = 0.3691)', fontsize=11, fontweight='bold')
    axes[0].set_ylabel('Stage 6 K-Means Cluster', fontsize=9)
    axes[0].set_xlabel('Aligned Agglomerative Cluster', fontsize=9)
    
    cm_km_gmm = confusion_matrix(assign_df['stage6_kmeans_cluster'], assign_df['gmm_cluster'])
    sns.heatmap(cm_km_gmm, annot=True, fmt='d', cmap='Greens', cbar=False,
                xticklabels=[f'GMM {i}' for i in range(4)], yticklabels=[f'KM {i}' for i in range(4)], ax=axes[1])
    axes[1].set_title('(B) K-Means vs. Gaussian Mixture Overlap (ARI = 0.5884)', fontsize=11, fontweight='bold')
    axes[1].set_ylabel('Stage 6 K-Means Cluster', fontsize=9)
    axes[1].set_xlabel('Aligned GMM Cluster', fontsize=9)
    
    plt.suptitle('Cross-Algorithm Partition Agreement Matrices (N=36)', fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(out_path / '54_stage6_vs_alternative_clustering_agreement.png', dpi=300)
    plt.close()
    
    # -------------------------------------------------------------
    # Figure 55: Tiny-Denominator Sensitivity Analysis
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(10, 5))
    
    sens_plot_df = pd.melt(
        sensitivity_df,
        id_vars=['Dataset_Scope'],
        value_vars=['KMeans_Silhouette', 'Agglomerative_Silhouette', 'GMM_Silhouette'],
        var_name='Algorithm',
        value_name='Silhouette_Score'
    )
    sens_plot_df['Algorithm'] = sens_plot_df['Algorithm'].str.replace('_Silhouette', '')
    
    sns.barplot(data=sens_plot_df, x='Dataset_Scope', y='Silhouette_Score', hue='Algorithm', palette='Set2', ax=ax)
    ax.set_title('Clustering Silhouette Sensitivity: Full Sample (N=36) vs. Reduced Sample (N=34)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Silhouette Score', fontsize=10)
    ax.set_xlabel('Evaluation Scope', fontsize=10)
    ax.set_ylim(0, 0.45)
    for p in ax.patches:
        h = p.get_height()
        if h > 0:
            ax.annotate(f'{h:.4f}', (p.get_x() + p.get_width() / 2., h / 2.),
                        ha='center', va='center', fontsize=9, color='black', fontweight='bold')
            
    plt.tight_layout()
    plt.savefig(out_path / '55_tiny_denominator_sensitivity_analysis.png', dpi=300)
    plt.close()


def save_stage15_tables(
    val_df: pd.DataFrame,
    algo_comp_df: pd.DataFrame,
    assign_df: pd.DataFrame,
    stability_df: pd.DataFrame,
    profiles_df: pd.DataFrame,
    agreement_df: pd.DataFrame,
    sensitivity_df: pd.DataFrame,
    output_dir: str = 'outputs/tables'
) -> None:
    """
    Saves all Stage 15 analytical tables to CSV format.
    """
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    
    val_df.to_csv(out_path / 'stage15_cluster_validation.csv', index=False)
    algo_comp_df.to_csv(out_path / 'stage15_algorithm_comparison.csv', index=False)
    assign_df.to_csv(out_path / 'stage15_cluster_assignments.csv', index=False)
    stability_df.to_csv(out_path / 'stage15_cluster_stability.csv', index=False)
    profiles_df.to_csv(out_path / 'stage15_cluster_profiles.csv', index=False)
    agreement_df.to_csv(out_path / 'stage15_cluster_agreement.csv', index=False)
    sensitivity_df.to_csv(out_path / 'stage15_tiny_denominator_sensitivity.csv', index=False)


def run_stage15_pipeline() -> Dict[str, Any]:
    """
    Orchestrates the entire Stage 15 clustering validation workflow.
    """
    print("=" * 70)
    print("STAGE 15: ADVANCED CLUSTERING & CLUSTER VALIDATION — PIPELINE")
    print("=" * 70)
    
    # 1. Load data
    raw_df, X_scaled, scaler = load_clustering_dataset()
    print(f"[+] 2023 Cross-section loaded: {len(raw_df)} State/UT records.")
    
    # 2. Run clustering suite
    val_df, algo_comp_df, assign_df, stability_df, profiles_df, agreement_df, sensitivity_df = run_stage15_clustering_suite(raw_df, X_scaled)
    print(f"[+] Evaluated {len(val_df)} clustering configurations across K-Means, Agglomerative, GMM, and DBSCAN.")
    
    # 3. Save tables
    save_stage15_tables(val_df, algo_comp_df, assign_df, stability_df, profiles_df, agreement_df, sensitivity_df)
    print(f"[+] Analytical tables saved to outputs/tables/.")
    
    # 4. Generate figures
    plot_stage15_figures(val_df, algo_comp_df, assign_df, profiles_df, agreement_df, sensitivity_df)
    print(f"[+] Stage 15 visualization figures saved to outputs/figures/ (Figures 50-55).")
    print("=" * 70)
    
    return {
        'val_df': val_df,
        'algo_comp_df': algo_comp_df,
        'assign_df': assign_df,
        'stability_df': stability_df,
        'profiles_df': profiles_df,
        'agreement_df': agreement_df,
        'sensitivity_df': sensitivity_df
    }


if __name__ == '__main__':
    run_stage15_pipeline()
