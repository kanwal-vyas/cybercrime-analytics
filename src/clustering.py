"""
Clustering Module — State-Level Cybercrime Profile Grouping
Project: Cyber Crime Analytics for National Security

IMPORTANT METHODOLOGICAL POSITION:
Clustering is applied to aggregate State/UT observations (n = 36) in the validated 2023 NCRB dataset.
To prevent total volume/scale from dominating the distance metrics, the feature space is constructed
from non-redundant composition and motive share indicators rather than raw case counts.

Clusters represent descriptive State/UT profile groups with similar cybercrime characteristics.
Clusters do not imply causality, homogeneous intra-state behavior, or value judgments.
"""

from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA


# Core feature definitions for profile clustering
CLUSTERING_FEATURES = [
    'it_act_share',
    'fraud_motive_share',
    'extortion_motive_share',
    'sexual_exploitation_motive_share'
]

FEATURE_DESCRIPTIONS = {
    'it_act_share': 'Share of cases under IT Act relative to total state cybercrimes',
    'fraud_motive_share': 'Share of financial fraud motive relative to state motive total',
    'extortion_motive_share': 'Share of extortion motive relative to state motive total',
    'sexual_exploitation_motive_share': 'Share of sexual exploitation motive relative to state motive total'
}

# Neutral descriptive names for selected K=4 clusters
CLUSTER_DESCRIPTIONS_K4 = {
    0: 'IPC-Dominant, Moderate Fraud Profile',
    1: 'IT Act-Dominant, High Fraud Profile',
    2: 'Sexual Exploitation-Dominant Micro-Profile',
    3: 'Elevated Extortion Motive Profile'
}


def load_and_prepare_features(
    data_path: str = 'data/processed/master_state_2023.csv'
) -> Tuple[pd.DataFrame, pd.DataFrame, np.ndarray, StandardScaler, List[str]]:
    """
    Loads master dataset, extracts composition features, and applies StandardScaler.
    
    Returns:
    --------
    raw_df : pd.DataFrame
        DataFrame with state_name and unscaled feature values.
    feature_summary : pd.DataFrame
        Descriptive distribution metrics for candidate features.
    X_scaled : np.ndarray
        Standardized numerical matrix.
    scaler : StandardScaler
        Fitted StandardScaler instance.
    feature_cols : List[str]
        List of selected clustering feature names.
    """
    master_df = pd.read_csv(data_path)
    state_col = 'state_name' if 'state_name' in master_df.columns else 'State/UT'
    states = master_df[state_col].values
    
    grand_col = 'cat__Total Cyber Crimes (IT Act + IPC r/w IT Act + SLL r/w IT Act)'
    it_col = 'cat__Total Offences under I.T. Act'
    m_tot = 'motive__Total'
    
    raw_df = pd.DataFrame({
        'state_name': states,
        'it_act_share': master_df[it_col] / master_df[grand_col],
        'fraud_motive_share': master_df['motive__Fraud'] / master_df[m_tot],
        'extortion_motive_share': master_df['motive__Extortion'] / master_df[m_tot],
        'sexual_exploitation_motive_share': master_df['motive__Sexual Exploitation'] / master_df[m_tot],
    })
    
    # Handle zero division if any
    raw_df[CLUSTERING_FEATURES] = raw_df[CLUSTERING_FEATURES].fillna(0.0)
    
    # Compute descriptive summary
    summary_rows = []
    for col in CLUSTERING_FEATURES:
        series = raw_df[col]
        summary_rows.append({
            'feature_name': col,
            'description': FEATURE_DESCRIPTIONS[col],
            'min': round(series.min(), 4),
            'mean': round(series.mean(), 4),
            'median': round(series.median(), 4),
            'max': round(series.max(), 4),
            'std': round(series.std(), 4),
            'skewness': round(series.skew(), 4),
            'n_unique': series.nunique()
        })
    feature_summary = pd.DataFrame(summary_rows)
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(raw_df[CLUSTERING_FEATURES])
    
    return raw_df, feature_summary, X_scaled, scaler, CLUSTERING_FEATURES


def evaluate_k_range(
    X_scaled: np.ndarray,
    k_range: range = range(2, 9),
    random_state: int = 42
) -> pd.DataFrame:
    """
    Evaluates a range of candidate K values using Inertia (Elbow) and Silhouette Scores.
    """
    eval_rows = []
    for k in k_range:
        km = KMeans(n_clusters=k, random_state=random_state, n_init=10)
        labels = km.fit_predict(X_scaled)
        sil = silhouette_score(X_scaled, labels)
        
        # Calculate cluster sizes dictionary string
        sizes = pd.Series(labels).value_counts().sort_index().to_dict()
        sizes_str = str(sizes)
        
        eval_rows.append({
            'K': k,
            'inertia': round(km.inertia_, 4),
            'silhouette_score': round(sil, 4),
            'cluster_sizes': sizes_str
        })
        
    return pd.DataFrame(eval_rows)


def fit_final_kmeans(
    X_scaled: np.ndarray,
    n_clusters: int = 4,
    random_state: int = 42
) -> Tuple[KMeans, np.ndarray]:
    """
    Fits the final KMeans model with the selected number of clusters.
    """
    km = KMeans(n_clusters=n_clusters, random_state=random_state, n_init=10)
    labels = km.fit_predict(X_scaled)
    return km, labels


def generate_cluster_assignments(
    raw_df: pd.DataFrame,
    X_scaled: np.ndarray,
    labels: np.ndarray,
    feature_cols: List[str],
    cluster_names: Optional[Dict[int, str]] = None
) -> pd.DataFrame:
    """
    Combines raw features, standardized features, and assigned cluster labels.
    """
    assignments = raw_df[['state_name']].copy()
    assignments['cluster_id'] = labels
    
    if cluster_names:
        assignments['cluster_label'] = assignments['cluster_id'].map(cluster_names)
        
    for col in feature_cols:
        assignments[col] = raw_df[col]
        
    # Standardized feature columns
    for idx, col in enumerate(feature_cols):
        assignments[f'std_{col}'] = np.round(X_scaled[:, idx], 4)
        
    assignments = assignments.sort_values(by=['cluster_id', 'state_name']).reset_index(drop=True)
    return assignments


def generate_cluster_profiles(
    raw_df: pd.DataFrame,
    labels: np.ndarray,
    feature_cols: List[str],
    cluster_names: Optional[Dict[int, str]] = None
) -> pd.DataFrame:
    """
    Calculates summary statistics (size, percentage, mean, median) for each cluster.
    """
    df = raw_df[feature_cols].copy()
    df['cluster_id'] = labels
    n_total = len(df)
    
    profile_rows = []
    for cid in sorted(df['cluster_id'].unique()):
        sub = df[df['cluster_id'] == cid]
        size = len(sub)
        pct = round((size / n_total) * 100, 2)
        
        row = {
            'cluster_id': cid,
            'cluster_label': cluster_names.get(cid, f'Cluster {cid}') if cluster_names else f'Cluster {cid}',
            'state_count': size,
            'state_pct': pct
        }
        
        for col in feature_cols:
            row[f'{col}_mean'] = round(sub[col].mean(), 4)
            row[f'{col}_median'] = round(sub[col].median(), 4)
            row[f'{col}_std'] = round(sub[col].std(), 4)
            
        profile_rows.append(row)
        
    return pd.DataFrame(profile_rows)


def plot_clustering_elbow(
    eval_df: pd.DataFrame,
    selected_k: int = 4,
    save_path: Optional[str] = 'outputs/figures/15_clustering_elbow.png'
) -> plt.Figure:
    """Plots K vs. Inertia (Elbow Curve)."""
    plt.style.use('seaborn-v0_8-whitegrid')
    fig, ax = plt.subplots(figsize=(8, 5))
    
    ax.plot(eval_df['K'], eval_df['inertia'], marker='o', color='#2b5c8f', linewidth=2.2, markersize=7)
    
    # Highlight selected K
    sel_row = eval_df[eval_df['K'] == selected_k]
    if not sel_row.empty:
        ax.plot(selected_k, sel_row['inertia'].values[0], marker='o', markersize=11, color='#d9534f', label=f'Selected K = {selected_k}')
        ax.axvline(selected_k, color='#d9534f', linestyle='--', alpha=0.5)
        
    ax.set_title('K-Means Inertia vs. Number of Clusters (Elbow Method)', fontsize=13, fontweight='bold', pad=12)
    ax.set_xlabel('Number of Clusters (K)', fontsize=11, fontweight='bold')
    ax.set_ylabel('Inertia (Within-Cluster Sum of Squares)', fontsize=11, fontweight='bold')
    ax.set_xticks(eval_df['K'].tolist())
    ax.legend(loc='upper right', frameon=True)
    
    plt.tight_layout()
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    return fig


def plot_clustering_silhouette(
    eval_df: pd.DataFrame,
    selected_k: int = 4,
    save_path: Optional[str] = 'outputs/figures/16_clustering_silhouette.png'
) -> plt.Figure:
    """Plots K vs. Silhouette Score."""
    plt.style.use('seaborn-v0_8-whitegrid')
    fig, ax = plt.subplots(figsize=(8, 5))
    
    colors = ['#2b5c8f' if k != selected_k else '#d9534f' for k in eval_df['K']]
    bars = ax.bar(eval_df['K'], eval_df['silhouette_score'], color=colors, alpha=0.85, edgecolor='black', width=0.55)
    
    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2, h + 0.008, f'{h:.3f}', ha='center', va='bottom', fontsize=9, fontweight='bold')
        
    ax.set_title('K-Means Silhouette Score vs. Number of Clusters (K)', fontsize=13, fontweight='bold', pad=12)
    ax.set_xlabel('Number of Clusters (K)', fontsize=11, fontweight='bold')
    ax.set_ylabel('Mean Silhouette Coefficient', fontsize=11, fontweight='bold')
    ax.set_ylim(0, max(eval_df['silhouette_score']) * 1.22)
    ax.set_xticks(eval_df['K'].tolist())
    
    plt.tight_layout()
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    return fig


def plot_cluster_sizes(
    assignments_df: pd.DataFrame,
    cluster_names: Optional[Dict[int, str]] = None,
    save_path: Optional[str] = 'outputs/figures/17_cluster_sizes.png'
) -> plt.Figure:
    """Plots cluster membership counts and proportions."""
    plt.style.use('seaborn-v0_8-whitegrid')
    fig, ax = plt.subplots(figsize=(9, 5))
    
    counts = assignments_df['cluster_id'].value_counts().sort_index()
    palette = ['#2b5c8f', '#4a7c59', '#e08963', '#7570b3', '#d9534f']
    colors = [palette[i % len(palette)] for i in counts.index]
    
    labels = [cluster_names.get(i, f'Cluster {i}') if cluster_names else f'Cluster {i}' for i in counts.index]
    
    bars = ax.bar(labels, counts.values, color=colors, alpha=0.85, edgecolor='black', width=0.55)
    n_total = len(assignments_df)
    
    for bar in bars:
        h = bar.get_height()
        pct = (h / n_total) * 100
        ax.text(bar.get_x() + bar.get_width()/2, h + 0.3, f'{int(h)} ({pct:.1f}%)', ha='center', va='bottom', fontsize=10, fontweight='bold')
        
    ax.set_title('Cluster Membership Counts (N = 36 States/UTs)', fontsize=13, fontweight='bold', pad=12)
    ax.set_ylabel('Number of States/UTs', fontsize=11, fontweight='bold')
    ax.set_ylim(0, max(counts.values) * 1.25)
    plt.xticks(rotation=15, ha='right', fontsize=9, fontweight='bold')
    
    plt.tight_layout()
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    return fig


def plot_cluster_feature_profiles(
    profiles_df: pd.DataFrame,
    feature_cols: List[str],
    save_path: Optional[str] = 'outputs/figures/18_cluster_feature_profiles.png'
) -> plt.Figure:
    """Plots comparative feature means across clusters as a grouped bar chart."""
    plt.style.use('seaborn-v0_8-whitegrid')
    fig, ax = plt.subplots(figsize=(12, 6))
    
    mean_cols = [f'{c}_mean' for c in feature_cols]
    plot_data = profiles_df.set_index('cluster_label')[mean_cols]
    plot_data.columns = [c.replace('_mean', '').replace('_', ' ').title() for c in mean_cols]
    
    plot_data.plot(kind='bar', ax=ax, width=0.75, colormap='Set2', edgecolor='black', alpha=0.9)
    
    ax.set_title('Comparative Mean Feature Values Across Clusters (K = 4)', fontsize=13, fontweight='bold', pad=15)
    ax.set_ylabel('Mean Proportion / Share (0.0 to 1.0)', fontsize=11, fontweight='bold')
    ax.set_xlabel('Cluster Profile Label', fontsize=11, fontweight='bold')
    ax.legend(title='Cybercrime Feature', bbox_to_anchor=(1.02, 1), loc='upper left', frameon=True)
    plt.xticks(rotation=12, ha='right', fontsize=9, fontweight='bold')
    
    plt.tight_layout()
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    return fig


def plot_cluster_projection(
    X_scaled: np.ndarray,
    assignments_df: pd.DataFrame,
    cluster_names: Optional[Dict[int, str]] = None,
    save_path: Optional[str] = 'outputs/figures/19_cluster_projection.png'
) -> plt.Figure:
    """
    Plots 2D PCA projection of standardized cluster feature space for visualization.
    """
    plt.style.use('seaborn-v0_8-whitegrid')
    fig, ax = plt.subplots(figsize=(10, 7))
    
    pca = PCA(n_components=2, random_state=42)
    coords = pca.fit_transform(X_scaled)
    var1, var2 = pca.explained_variance_ratio_ * 100
    
    assignments_df['PCA1'] = coords[:, 0]
    assignments_df['PCA2'] = coords[:, 1]
    
    palette = ['#2b5c8f', '#4a7c59', '#e08963', '#7570b3', '#d9534f']
    
    for cid in sorted(assignments_df['cluster_id'].unique()):
        sub = assignments_df[assignments_df['cluster_id'] == cid]
        label = cluster_names.get(cid, f'Cluster {cid}') if cluster_names else f'Cluster {cid}'
        color = palette[cid % len(palette)]
        ax.scatter(sub['PCA1'], sub['PCA2'], s=90, color=color, label=f'Cluster {cid}: {label}', edgecolors='black', linewidth=1.1, alpha=0.85)
        
        # Annotate a few sample states per cluster
        for _, row in sub.head(3).iterrows():
            ax.annotate(row['state_name'], (row['PCA1'] + 0.08, row['PCA2'] + 0.06), fontsize=8, color='#333333')
            
    ax.set_title(f'2D PCA Projection of Cluster Space (Explained Variance: {var1+var2:.1f}%)', fontsize=13, fontweight='bold', pad=15)
    ax.set_xlabel(f'Principal Component 1 ({var1:.1f}% Variance)', fontsize=11, fontweight='bold')
    ax.set_ylabel(f'Principal Component 2 ({var2:.1f}% Variance)', fontsize=11, fontweight='bold')
    ax.legend(title='Clusters', loc='upper right', frameon=True, fontsize=9)
    
    plt.tight_layout()
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    return fig


def export_clustering_outputs(
    eval_df: pd.DataFrame,
    assignments_df: pd.DataFrame,
    profiles_df: pd.DataFrame,
    output_dir: str = 'outputs/tables'
) -> Dict[str, str]:
    """Exports all generated clustering tables for downstream analysis and reproducibility."""
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    
    paths = {}
    
    eval_path = out_path / 'clustering_evaluation.csv'
    eval_df.to_csv(eval_path, index=False)
    paths['evaluation'] = str(eval_path)
    
    assign_path = out_path / 'cluster_assignments_2023.csv'
    assignments_df.to_csv(assign_path, index=False)
    paths['assignments'] = str(assign_path)
    
    prof_path = out_path / 'cluster_profiles_2023.csv'
    profiles_df.to_csv(prof_path, index=False)
    paths['profiles'] = str(prof_path)
    
    return paths
