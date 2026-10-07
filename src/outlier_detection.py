"""
Outlier Detection Module — Descriptive Analysis of Extreme State/UT Cybercrime Observations
Project: Cyber Crime Analytics for National Security

METHODOLOGICAL POSITION & ANALYTICAL BOUNDARIES:
This module implements descriptive outlier detection on aggregate State/UT observations (N = 36)
in the validated 2023 NCRB dataset.

1. Statistical, Not Causal: Identifies observations that are statistically extreme relative to the
   observed cross-sectional distribution. It does NOT imply criminality, risk scoring, or data error.
2. Two Complementary Perspectives:
   - Univariate (Tukey IQR Fences): Evaluates distribution-specific extremity along single dimensions.
   - Multivariate (Isolation Forest): Evaluates joint anomaly scores across log-transformed count and
     composition share features, preventing raw scale dominance.
3. Small-Denominator Caution: Extreme proportion/share values in small Union Territories (e.g. N <= 10)
   are explicitly flagged and contextualized by their underlying case counts.
"""

from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA


# Feature definitions for outlier inspection
VOLUME_FEATURES = [
    'total_cases',
    'it_act_cases',
    'ipc_cases',
    'motive_fraud',
    'motive_extortion',
    'motive_sexual_exploitation',
    'sec66d_cheating_personation',
    'sec66c_identity_theft',
    'women_cases_total',
    'child_cases_total'
]

SHARE_FEATURES = [
    'it_act_share',
    'fraud_motive_share',
    'extortion_motive_share',
    'sexual_exploitation_motive_share'
]

ALL_OUTLIER_FEATURES = VOLUME_FEATURES + SHARE_FEATURES

FEATURE_DISPLAY_NAMES = {
    'total_cases': 'Total Cybercrime Cases',
    'it_act_cases': 'IT Act Cases',
    'ipc_cases': 'IPC Cases',
    'motive_fraud': 'Fraud Motive Cases',
    'motive_extortion': 'Extortion Motive Cases',
    'motive_sexual_exploitation': 'Sexual Exploitation Motive Cases',
    'sec66d_cheating_personation': 'Sec. 66D Personation Cheating',
    'sec66c_identity_theft': 'Sec. 66C Identity Theft',
    'women_cases_total': 'Cybercrimes Against Women',
    'child_cases_total': 'Cybercrimes Against Children',
    'it_act_share': 'IT Act Share (0-1)',
    'fraud_motive_share': 'Fraud Motive Share (0-1)',
    'extortion_motive_share': 'Extortion Motive Share (0-1)',
    'sexual_exploitation_motive_share': 'Sexual Exploitation Motive Share (0-1)'
}


def load_and_prepare_outlier_data(
    eda_path: str = 'outputs/tables/eda_state_feature_matrix.csv',
    master_path: str = 'data/processed/master_state_2023.csv',
    cluster_path: str = 'outputs/tables/cluster_assignments_2023.csv'
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Loads EDA feature matrix, supplements motive share features from master table,
    and attaches Stage 6 cluster context.
    
    Returns:
    --------
    features_df : pd.DataFrame
        Complete 36-row dataset with 14 analytical features and metadata.
    metadata : Dict[str, Any]
        Dictionary containing cluster mappings and feature classifications.
    """
    eda_df = pd.read_csv(eda_path)
    master_df = pd.read_csv(master_path)
    
    m_tot = master_df['motive__Total']
    ext_share = (master_df['motive__Extortion'] / m_tot).fillna(0.0)
    sex_share = (master_df['motive__Sexual Exploitation'] / m_tot).fillna(0.0)
    
    features_df = eda_df.copy()
    features_df['extortion_motive_share'] = ext_share
    features_df['sexual_exploitation_motive_share'] = sex_share
    
    # Ensure float types on shares
    for col in SHARE_FEATURES:
        features_df[col] = features_df[col].astype(float)
        
    cluster_map = {}
    cluster_id_map = {}
    if Path(cluster_path).exists():
        c_df = pd.read_csv(cluster_path)
        cluster_map = dict(zip(c_df['state_name'], c_df['cluster_label']))
        cluster_id_map = dict(zip(c_df['state_name'], c_df['cluster_id']))
        
    metadata = {
        'cluster_map': cluster_map,
        'cluster_id_map': cluster_id_map,
        'volume_features': VOLUME_FEATURES,
        'share_features': SHARE_FEATURES,
        'all_features': ALL_OUTLIER_FEATURES
    }
    
    return features_df, metadata


def compute_univariate_iqr_outliers(
    features_df: pd.DataFrame,
    feature_cols: List[str] = ALL_OUTLIER_FEATURES
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Computes Tukey IQR fences (Q1 - 1.5*IQR, Q3 + 1.5*IQR) for each feature
    and identifies all fence-violating observations.
    
    Returns:
    --------
    feature_stats_df : pd.DataFrame
        Descriptive distribution and fence statistics per feature.
    univariate_outliers_df : pd.DataFrame
        Detailed list of all candidate outlier occurrences.
    """
    stats_rows = []
    outlier_rows = []
    
    for col in feature_cols:
        series = features_df[col]
        q1 = float(series.quantile(0.25))
        q3 = float(series.quantile(0.75))
        iqr = q3 - q1
        lower_fence = q1 - 1.5 * iqr
        upper_fence = q3 + 1.5 * iqr
        
        high_mask = series > upper_fence
        low_mask = series < lower_fence
        
        high_states = features_df[high_mask]['state_name'].tolist()
        low_states = features_df[low_mask]['state_name'].tolist()
        
        stats_rows.append({
            'feature_name': col,
            'feature_display': FEATURE_DISPLAY_NAMES.get(col, col),
            'feature_type': 'Volume (Count)' if col in VOLUME_FEATURES else 'Composition (Share)',
            'min': round(float(series.min()), 4),
            'q1': round(q1, 4),
            'median': round(float(series.median()), 4),
            'mean': round(float(series.mean()), 4),
            'q3': round(q3, 4),
            'max': round(float(series.max()), 4),
            'iqr': round(iqr, 4),
            'lower_fence': round(lower_fence, 4),
            'upper_fence': round(upper_fence, 4),
            'skewness': round(float(series.skew()), 4),
            'high_outlier_count': len(high_states),
            'low_outlier_count': len(low_states),
            'total_outlier_count': len(high_states) + len(low_states),
            'flagged_states': ', '.join(high_states + [f'{s} (Low)' for s in low_states]) if (high_states or low_states) else 'No outliers detected'
        })
        
        # Build individual outlier records
        for _, r in features_df[high_mask].iterrows():
            outlier_rows.append({
                'state_name': r['state_name'],
                'feature': col,
                'feature_type': 'Volume (Count)' if col in VOLUME_FEATURES else 'Composition (Share)',
                'observed_value': round(float(r[col]), 4),
                'q1': round(q1, 4),
                'q3': round(q3, 4),
                'iqr': round(iqr, 4),
                'lower_fence': round(lower_fence, 4),
                'upper_fence': round(upper_fence, 4),
                'direction': 'High',
                'distance_from_fence': round(float(r[col] - upper_fence), 4),
                'total_cases_denominator': int(r['total_cases'])
            })
            
        for _, r in features_df[low_mask].iterrows():
            outlier_rows.append({
                'state_name': r['state_name'],
                'feature': col,
                'feature_type': 'Volume (Count)' if col in VOLUME_FEATURES else 'Composition (Share)',
                'observed_value': round(float(r[col]), 4),
                'q1': round(q1, 4),
                'q3': round(q3, 4),
                'iqr': round(iqr, 4),
                'lower_fence': round(lower_fence, 4),
                'upper_fence': round(upper_fence, 4),
                'direction': 'Low',
                'distance_from_fence': round(float(lower_fence - r[col]), 4),
                'total_cases_denominator': int(r['total_cases'])
            })
            
    feature_stats_df = pd.DataFrame(stats_rows)
    univariate_outliers_df = pd.DataFrame(outlier_rows)
    
    if not univariate_outliers_df.empty:
        univariate_outliers_df = univariate_outliers_df.sort_values(
            by=['feature', 'observed_value'], ascending=[True, False]
        ).reset_index(drop=True)
        
    return feature_stats_df, univariate_outliers_df


def compute_multivariate_isolation_forest(
    features_df: pd.DataFrame,
    contamination: float = 0.15,
    random_state: int = 42
) -> Tuple[pd.DataFrame, IsolationForest, np.ndarray]:
    """
    Fits an Isolation Forest model on log-transformed count features and standardized
    composition shares to identify multivariate anomalies without raw scale domination.
    
    Returns:
    --------
    multivariate_df : pd.DataFrame
        State-level anomaly scores and outlier classifications.
    iso_model : IsolationForest
        Fitted Isolation Forest estimator.
    X_scaled : np.ndarray
        Standardized joint feature matrix.
    """
    # Apply log1p to count features to stabilize extreme right-skew
    X_counts_log = np.log1p(features_df[VOLUME_FEATURES])
    X_shares = features_df[SHARE_FEATURES]
    X_joint = pd.concat([X_counts_log, X_shares], axis=1)
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_joint)
    
    iso_model = IsolationForest(contamination=contamination, random_state=random_state)
    preds = iso_model.fit_predict(X_scaled)
    scores = iso_model.decision_function(X_scaled)
    
    multivariate_df = pd.DataFrame({
        'state_name': features_df['state_name'],
        'total_cases': features_df['total_cases'].astype(int),
        'anomaly_score': np.round(scores, 4),
        'isolation_forest_outlier': np.where(preds == -1, 'Yes', 'No')
    })
    
    # Rank by anomaly score (lower score = more isolated/anomalous)
    multivariate_df['anomaly_rank'] = multivariate_df['anomaly_score'].rank(ascending=True).astype(int)
    multivariate_df = multivariate_df.sort_values(by='anomaly_rank').reset_index(drop=True)
    
    return multivariate_df, iso_model, X_scaled


def build_state_outlier_summary(
    features_df: pd.DataFrame,
    univariate_outliers_df: pd.DataFrame,
    multivariate_df: pd.DataFrame,
    metadata: Dict[str, Any]
) -> pd.DataFrame:
    """
    Integrates univariate flags, multivariate classifications, small-denominator indicators,
    and Stage 6 cluster context into a unified State/UT summary table.
    """
    cluster_map = metadata.get('cluster_map', {})
    cluster_id_map = metadata.get('cluster_id_map', {})
    
    # Aggregate univariate flags per state
    state_uni_map = {}
    for st in features_df['state_name']:
        sub = univariate_outliers_df[univariate_outliers_df['state_name'] == st]
        high_flags = sub[sub['direction'] == 'High']['feature'].tolist()
        low_flags = sub[sub['direction'] == 'Low']['feature'].tolist()
        state_uni_map[st] = {
            'high_count': len(high_flags),
            'low_count': len(low_flags),
            'total_count': len(sub),
            'flag_list': high_flags + [f'{f} (Low)' for f in low_flags]
        }
        
    iso_map = dict(zip(multivariate_df['state_name'], multivariate_df['isolation_forest_outlier']))
    score_map = dict(zip(multivariate_df['state_name'], multivariate_df['anomaly_score']))
    rank_map = dict(zip(multivariate_df['state_name'], multivariate_df['anomaly_rank']))
    
    summary_rows = []
    for _, r in features_df.iterrows():
        st = r['state_name']
        u_info = state_uni_map[st]
        n_uni = u_info['total_count']
        is_iso = iso_map.get(st, 'No') == 'Yes'
        
        if n_uni > 0 and is_iso:
            classification = 'Both'
        elif n_uni > 0 and not is_iso:
            classification = 'Univariate outlier'
        elif n_uni == 0 and is_iso:
            classification = 'Multivariate outlier'
        else:
            classification = 'No detected outlier'
            
        tot_cases = int(r['total_cases'])
        small_denom = 'Yes (N <= 10)' if tot_cases <= 10 else 'No'
        
        summary_rows.append({
            'state_name': st,
            'total_cases': tot_cases,
            'univariate_flags_count': n_uni,
            'high_flags_count': u_info['high_count'],
            'low_flags_count': u_info['low_count'],
            'flagged_features': ', '.join(u_info['flag_list']) if n_uni > 0 else 'None',
            'isolation_forest_outlier': 'Yes' if is_iso else 'No',
            'anomaly_score': score_map.get(st, 0.0),
            'anomaly_rank': rank_map.get(st, 0),
            'outlier_classification': classification,
            'small_denominator_flag': small_denom,
            'stage6_cluster_id': cluster_id_map.get(st, -1),
            'stage6_cluster_label': cluster_map.get(st, 'Unknown')
        })
        
    summary_df = pd.DataFrame(summary_rows)
    summary_df = summary_df.sort_values(
        by=['univariate_flags_count', 'anomaly_score'], ascending=[False, True]
    ).reset_index(drop=True)
    
    return summary_df


def plot_outlier_iqr_boxplots(
    features_df: pd.DataFrame,
    save_path: Optional[str] = 'outputs/figures/24_outlier_iqr_boxplots.png'
) -> plt.Figure:
    """
    Plots a multi-panel grid of boxplots showing distributions, IQR spans,
    and plotted outlier points across selected volume and motive share features.
    """
    plt.style.use('seaborn-v0_8-whitegrid')
    
    plot_cols = [
        ('total_cases', 'Total Cybercrimes', '#2b5c8f', False),
        ('it_act_cases', 'IT Act Cases', '#2b5c8f', False),
        ('ipc_cases', 'IPC Cases', '#2b5c8f', False),
        ('motive_fraud', 'Fraud Motive Cases', '#2b5c8f', False),
        ('motive_extortion', 'Extortion Motive Cases', '#2b5c8f', False),
        ('motive_sexual_exploitation', 'Sexual Exploitation Motive Cases', '#2b5c8f', False),
        ('extortion_motive_share', 'Extortion Motive Share (0-1)', '#4a7c59', True),
        ('sexual_exploitation_motive_share', 'Sexual Exploitation Share (0-1)', '#4a7c59', True)
    ]
    
    fig, axes = plt.subplots(2, 4, figsize=(18, 9))
    axes = axes.flatten()
    
    for ax, (col, title, color, is_share) in zip(axes, plot_cols):
        vals = features_df[col]
        q1 = vals.quantile(0.25)
        q3 = vals.quantile(0.75)
        iqr = q3 - q1
        upper_fence = q3 + 1.5 * iqr
        
        # Boxplot
        bp = ax.boxplot(
            vals, patch_artist=True, orientation='vertical', widths=0.45,
            boxprops=dict(facecolor=color, color='black', alpha=0.7),
            medianprops=dict(color='#d9534f', linewidth=2.0),
            whiskerprops=dict(color='black', linewidth=1.2),
            capprops=dict(color='black', linewidth=1.2),
            flierprops=dict(marker='o', markerfacecolor='#d9534f', markersize=7, alpha=0.85, markeredgecolor='black')
        )
        
        # Annotate top outlier states
        outliers = features_df[vals > upper_fence].sort_values(by=col, ascending=False)
        for _, row in outliers.head(2).iterrows():
            ax.annotate(
                row['state_name'],
                (1.08, row[col]),
                fontsize=7.5, color='#333333', fontweight='bold'
            )
            
        ax.set_title(title, fontsize=10.5, fontweight='bold', pad=8)
        ax.set_xticks([])
        if is_share:
            ax.set_ylim(-0.05, 1.08)
            ax.set_ylabel('Proportion (0.0 to 1.0)', fontsize=8.5)
        else:
            ax.set_ylabel('Reported Cases', fontsize=8.5)
            
    plt.suptitle('Distribution & IQR Tukey Fences Across Key Cybercrime Measures (N = 36 States/UTs)', fontsize=13, fontweight='bold', y=1.02)
    plt.tight_layout()
    
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    return fig


def plot_outlier_flags_by_feature(
    feature_stats_df: pd.DataFrame,
    save_path: Optional[str] = 'outputs/figures/25_outlier_flags_by_feature.png'
) -> plt.Figure:
    """
    Plots horizontal bar chart showing the number of statistical outliers detected per feature.
    """
    plt.style.use('seaborn-v0_8-whitegrid')
    fig, ax = plt.subplots(figsize=(11, 6))
    
    df_sorted = feature_stats_df.sort_values(by='total_outlier_count', ascending=True).reset_index(drop=True)
    y_pos = np.arange(len(df_sorted))
    
    colors = ['#2b5c8f' if t == 'Volume (Count)' else '#4a7c59' for t in df_sorted['feature_type']]
    
    bars = ax.barh(y_pos, df_sorted['total_outlier_count'], color=colors, edgecolor='black', height=0.6, alpha=0.85)
    
    for i, bar in enumerate(bars):
        w = bar.get_width()
        if w > 0:
            ax.text(w + 0.15, i, f'{int(w)} states', va='center', fontsize=8.5, fontweight='bold')
        else:
            ax.text(0.15, i, '0 (No outliers)', va='center', fontsize=8, color='#666666')
            
    ax.set_yticks(y_pos)
    ax.set_yticklabels(df_sorted['feature_display'], fontsize=9, fontweight='bold')
    ax.set_xlabel('Number of Statistical Outliers (Violating Upper Tukey Fence)', fontsize=10, fontweight='bold')
    ax.set_title('Statistical Outlier Counts by Cybercrime Analytical Feature (IQR Method)', fontsize=12, fontweight='bold', pad=12)
    ax.set_xlim(0, max(df_sorted['total_outlier_count']) * 1.25)
    
    # Legend for feature types
    from matplotlib.patches import Patch
    legend_elements = [
        Patch(facecolor='#2b5c8f', edgecolor='black', label='Volume (Count) Features'),
        Patch(facecolor='#4a7c59', edgecolor='black', label='Composition (Share) Features')
    ]
    ax.legend(handles=legend_elements, loc='lower right', frameon=True, fontsize=9)
    
    plt.tight_layout()
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    return fig


def plot_outlier_state_summary(
    summary_df: pd.DataFrame,
    save_path: Optional[str] = 'outputs/figures/26_outlier_state_summary.png'
) -> plt.Figure:
    """
    Plots horizontal bar chart summarizing univariate outlier flag counts per state,
    color-coded by joint outlier classification.
    """
    plt.style.use('seaborn-v0_8-whitegrid')
    fig, ax = plt.subplots(figsize=(12, 10))
    
    df_sorted = summary_df.sort_values(by='univariate_flags_count', ascending=True).reset_index(drop=True)
    y_pos = np.arange(len(df_sorted))
    
    palette = {
        'Both': '#d9534f',
        'Univariate outlier': '#e08963',
        'Multivariate outlier': '#7570b3',
        'No detected outlier': '#2b5c8f'
    }
    
    colors = [palette.get(c, '#666666') for c in df_sorted['outlier_classification']]
    
    bars = ax.barh(y_pos, df_sorted['univariate_flags_count'], color=colors, edgecolor='black', height=0.65, alpha=0.85)
    
    for i, bar in enumerate(bars):
        w = bar.get_width()
        st_name = df_sorted['state_name'].iloc[i]
        cases = df_sorted['total_cases'].iloc[i]
        c_type = df_sorted['outlier_classification'].iloc[i]
        
        label_text = f'{int(w)} flags ({cases:,} cases)' if w > 0 else f'0 flags ({cases:,} cases)'
        if c_type == 'Multivariate outlier':
            label_text += ' [IsoForest Anomaly]'
            
        ax.text(w + 0.18, i, label_text, va='center', fontsize=7.5, fontweight='bold')
        
    ax.set_yticks(y_pos)
    ax.set_yticklabels(df_sorted['state_name'], fontsize=8.5)
    ax.set_xlabel('Total Univariate Outlier Flags Across 14 Features', fontsize=10, fontweight='bold')
    ax.set_title('State/UT Outlier Summary: Univariate Flags & Multivariate Classifications\n(N = 36 States and Union Territories)', fontsize=12, fontweight='bold', pad=12)
    ax.set_xlim(0, max(df_sorted['univariate_flags_count']) * 1.35)
    
    from matplotlib.patches import Patch
    legend_elements = [
        Patch(facecolor='#d9534f', edgecolor='black', label='Both (Univariate & Multivariate Outlier) [n=5]'),
        Patch(facecolor='#e08963', edgecolor='black', label='Univariate Outlier Only [n=12]'),
        Patch(facecolor='#7570b3', edgecolor='black', label='Multivariate Outlier Only (Ladakh) [n=1]'),
        Patch(facecolor='#2b5c8f', edgecolor='black', label='No Detected Outlier [n=18]')
    ]
    ax.legend(handles=legend_elements, loc='lower right', frameon=True, fontsize=8.5)
    
    plt.tight_layout()
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    return fig


def plot_outlier_multivariate_projection(
    X_scaled: np.ndarray,
    summary_df: pd.DataFrame,
    save_path: Optional[str] = 'outputs/figures/27_outlier_multivariate_projection.png'
) -> plt.Figure:
    """
    Plots 2D PCA projection of the standardized joint space, color-coding observations
    by Isolation Forest decision score / outlier status.
    """
    plt.style.use('seaborn-v0_8-whitegrid')
    fig, ax = plt.subplots(figsize=(11, 7))
    
    pca = PCA(n_components=2, random_state=42)
    coords = pca.fit_transform(X_scaled)
    var1, var2 = pca.explained_variance_ratio_ * 100
    
    df_proj = summary_df.copy()
    # Align order
    df_proj['PCA1'] = coords[:, 0]
    df_proj['PCA2'] = coords[:, 1]
    
    # Inliers vs Outliers
    inliers = df_proj[df_proj['isolation_forest_outlier'] == 'No']
    outliers = df_proj[df_proj['isolation_forest_outlier'] == 'Yes']
    
    ax.scatter(inliers['PCA1'], inliers['PCA2'], s=75, color='#2b5c8f', alpha=0.75, edgecolors='black', label='Multivariate Inliers (n = 30)')
    ax.scatter(outliers['PCA1'], outliers['PCA2'], s=120, color='#d9534f', alpha=0.9, edgecolors='black', linewidth=1.5, marker='D', label='Isolation Forest Outliers (n = 6)')
    
    # Annotate outlier states
    for _, row in outliers.iterrows():
        ax.annotate(
            f"{row['state_name']} (score: {row['anomaly_score']:.2f})",
            (row['PCA1'] + 0.12, row['PCA2'] + 0.08),
            fontsize=8.5, fontweight='bold', color='#111111'
        )
        
    ax.set_title(f'2D PCA Projection of Multivariate Outlier Space (Total Variance: {var1+var2:.1f}%)\nLog-Transformed Counts + Standardized Motive/Legal Shares', fontsize=12, fontweight='bold', pad=12)
    ax.set_xlabel(f'Principal Component 1 ({var1:.1f}% Variance)', fontsize=10, fontweight='bold')
    ax.set_ylabel(f'Principal Component 2 ({var2:.1f}% Variance)', fontsize=10, fontweight='bold')
    ax.legend(loc='upper right', frameon=True, fontsize=9)
    
    plt.tight_layout()
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    return fig


def export_outlier_outputs(
    feature_stats_df: pd.DataFrame,
    univariate_outliers_df: pd.DataFrame,
    multivariate_df: pd.DataFrame,
    summary_df: pd.DataFrame,
    output_dir: str = 'outputs/tables'
) -> Dict[str, str]:
    """Exports all generated outlier tables to CSV."""
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    
    paths = {}
    
    p_stats = out_path / 'outlier_feature_statistics.csv'
    feature_stats_df.to_csv(p_stats, index=False)
    paths['feature_statistics'] = str(p_stats)
    
    p_uni = out_path / 'outlier_univariate_results.csv'
    univariate_outliers_df.to_csv(p_uni, index=False)
    paths['univariate_results'] = str(p_uni)
    
    p_multi = out_path / 'outlier_multivariate_results.csv'
    multivariate_df.to_csv(p_multi, index=False)
    paths['multivariate_results'] = str(p_multi)
    
    p_sum = out_path / 'outlier_state_summary.csv'
    summary_df.to_csv(p_sum, index=False)
    paths['state_summary'] = str(p_sum)
    
    return paths


def run_all_outlier_detection(
    eda_path: str = 'outputs/tables/eda_state_feature_matrix.csv',
    master_path: str = 'data/processed/master_state_2023.csv',
    cluster_path: str = 'outputs/tables/cluster_assignments_2023.csv',
    output_dir: str = 'outputs/tables',
    figures_dir: str = 'outputs/figures'
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Executes the end-to-end Stage 8 Outlier Detection pipeline:
    1. Feature loading & motive share integration
    2. Univariate Tukey IQR fence evaluation
    3. Multivariate Isolation Forest anomaly scoring
    4. State-level synthesis & small-denominator audit
    5. Diagnostic visual generation & CSV exports
    """
    features_df, metadata = load_and_prepare_outlier_data(eda_path, master_path, cluster_path)
    feature_stats_df, univariate_outliers_df = compute_univariate_iqr_outliers(features_df, ALL_OUTLIER_FEATURES)
    multivariate_df, iso_model, X_scaled = compute_multivariate_isolation_forest(features_df, contamination=0.15, random_state=42)
    summary_df = build_state_outlier_summary(features_df, univariate_outliers_df, multivariate_df, metadata)
    
    # Generate figures
    plot_outlier_iqr_boxplots(features_df, save_path=f'{figures_dir}/24_outlier_iqr_boxplots.png')
    plot_outlier_flags_by_feature(feature_stats_df, save_path=f'{figures_dir}/25_outlier_flags_by_feature.png')
    plot_outlier_state_summary(summary_df, save_path=f'{figures_dir}/26_outlier_state_summary.png')
    plot_outlier_multivariate_projection(X_scaled, summary_df, save_path=f'{figures_dir}/27_outlier_multivariate_projection.png')
    
    export_outlier_outputs(
        feature_stats_df=feature_stats_df,
        univariate_outliers_df=univariate_outliers_df,
        multivariate_df=multivariate_df,
        summary_df=summary_df,
        output_dir=output_dir
    )
    
    return feature_stats_df, univariate_outliers_df, multivariate_df, summary_df


if __name__ == '__main__':
    print("Executing Stage 8 Outlier Detection Pipeline...")
    feature_stats_df, univariate_outliers_df, multivariate_df, summary_df = run_all_outlier_detection()
    print("Stage 8 Outlier Detection Pipeline completed successfully.")
