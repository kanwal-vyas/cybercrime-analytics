"""
Script to generate notebooks/09_advanced_olap_cube.ipynb
Stage 11: Advanced OLAP & Multidimensional Data Cube Analysis (Unit 3 of Syllabus)
"""

import json
from pathlib import Path

def create_stage11_notebook():
    nb = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "# Stage 11: Advanced OLAP & Multidimensional Data Cube Analysis\n",
                    "**Project**: Cyber Crime Analytics for National Security  \n",
                    "**Syllabus Alignment**: Unit 3 — Data Warehouse and OLAP Technology for Data Mining (Multidimensional Data Model, Data Cubes, Star Schema, OLAP Operations: Roll-Up, Drill-Down, Slice, Dice, Pivot, Data Generalization, Attribute-Oriented Induction, Efficient Cube Computation, Iceberg Cubes)  \n",
                    "**Data Source**: Relational Data Warehouse (`data/database/cybercrime.db`)  \n",
                    "**Sample Size**: $N = 36$ State/UT Observations, 40 Leaf Offense Categories, 18 Specific Motives, 5 Historical Trend Years (2018–2022)  \n",
                    "\n",
                    "---\n",
                    "\n",
                    "## 1. Objective & Methodological Scope\n",
                    "\n",
                    "### Purpose:\n",
                    "This stage implements a formal **Multidimensional Data Cube and Advanced OLAP Analysis Layer** extending the foundational warehouse created in Stage 3. It establishes the full cuboid lattice, executes core OLAP navigation operations, demonstrates semantic data generalization via Attribute-Oriented Induction (AOI), and illustrates selective cuboid materialization through Iceberg cube computation.\n",
                    "\n",
                    "### Key Curriculum Concepts Covered:\n",
                    "1. **Multidimensional Data Modeling**: Formal grain audit separating Category, Motive, and Historical Trend dimensions to prevent invalid Cartesian products.\n",
                    "2. **Lattice of Cuboids**: Construction of base cuboids ($0\\text{-D}$ to $3\\text{-D}$) spanning `State/UT`, `Act Group`, `Crime Category`, and `National Total`.\n",
                    "3. **Core OLAP Operations**: Programmatic execution of **Roll-Up**, **Drill-Down**, **Slice**, **Dice**, and **Pivot**.\n",
                    "4. **Data Generalization & Attribute-Oriented Induction (AOI)**: Transforming granular state-category facts into high-level concept tuples, achieving $99.58\\%$ tuple count reduction.\n",
                    "5. **Efficient Cube Computation & Iceberg Cuboids**: Demonstration of selective materialization filtering on high-volume analytical thresholds ($\\ge 1,000$ cases).\n",
                    "\n",
                    "### Critical Methodological Guardrails:\n",
                    "- **Strictly Descriptive & Non-Causal**: Aggregations summarize recorded volumes; they do not infer criminological causes.\n",
                    "- **Fact Grain Separation**: Category facts ($1,764$ rows) and Motive facts ($684$ rows) operate at distinct dimensional grains and are never cross-joined blindly.\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Setup paths and imports\n",
                    "import os\n",
                    "import sys\n",
                    "import sqlite3\n",
                    "from pathlib import Path\n",
                    "\n",
                    "project_root = Path.cwd().resolve()\n",
                    "if str(project_root) not in sys.path:\n",
                    "    sys.path.insert(0, str(project_root))\n",
                    "\n",
                    "import numpy as np\n",
                    "import pandas as pd\n",
                    "import matplotlib.pyplot as plt\n",
                    "import seaborn as sns\n",
                    "\n",
                    "# Import Stage 11 advanced OLAP module\n",
                    "from src.advanced_olap import (\n",
                    "    get_db_connection,\n",
                    "    compute_cuboids,\n",
                    "    compute_state_act_group_pivot,\n",
                    "    execute_slice_operation,\n",
                    "    execute_dice_operation,\n",
                    "    execute_drill_down_operation,\n",
                    "    perform_attribute_oriented_induction,\n",
                    "    compute_iceberg_cuboid,\n",
                    "    run_stage11_pipeline\n",
                    ")\n",
                    "\n",
                    "print(\"Stage 11 advanced OLAP and data cube routines loaded.\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 2. Warehouse Fact-Grain Audit & Dimensional Separation\n",
                    "\n",
                    "Before constructing cuboids, we audit the dimensional grain of the relational warehouse tables in `data/database/cybercrime.db`.\n",
                    "\n",
                    "| Fact Table | Dimensional Grain | Total Rows | Measure | Reconciled Total |\n",
                    "|---|---|---|---|---|\n",
                    "| `fact_cybercrime_category_2023` | $\\text{State} \\times \\text{Category} \\times \\text{Year (2023)}$ | $1,764$ ($36 \\times 49$) | `cases` | **$86,420$** (Leaf Sum) |\n",
                    "| `fact_cybercrime_motive_2023` | $\\text{State} \\times \\text{Motive} \\times \\text{Year (2023)}$ | $684$ ($36 \\times 19$) | `motive_count` | **$86,420$** (Specific Sum) |\n",
                    "| `fact_cybercrime_trend` | $\\text{State} \\times \\text{Year (2018–2022)}$ | $180$ ($36 \\times 5$) | `cases` | Longitudinal Panel |\n",
                    "\n",
                    "> **Critical Grain Rule**: Because NCRB does not provide cross-tabulated Category $\\times$ Motive microdata, we construct separate compatible cubes: $\\text{Cube}_{\\text{Category}}$, $\\text{Cube}_{\\text{Motive}}$, and $\\text{Cube}_{\\text{Trend}}$."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "conn = get_db_connection()\n",
                    "tables = [t[0] for t in conn.execute(\"SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';\").fetchall()]\n",
                    "table_counts = {t: conn.execute(f\"SELECT count(*) FROM {t};\").fetchone()[0] for t in tables}\n",
                    "print(\"=== WAREHOUSE TABLE ROW COUNTS ===\")\n",
                    "for t, cnt in table_counts.items():\n",
                    "    print(f\"  - {t:<32}: {cnt:>5} rows\")\n",
                    "conn.close()"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 3. Base Cuboids & Lattice Computation\n",
                    "\n",
                    "We extract the base cuboid ($\text{State} \\times \\text{Leaf Category}$, $1,440$ tuples) and pre-materialize higher-level roll-up cuboids."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "cuboids = compute_cuboids()\n",
                    "print(\"=== BASE CUBOID: STATE x LEAF CATEGORY (First 8 Rows of 1,440) ===\")\n",
                    "display(cuboids[\"state_category\"].head(8))\n",
                    "\n",
                    "print(\"\\n=== ROLL-UP CUBOID: NATIONAL x ACT GROUP (3 Tuples) ===\")\n",
                    "display(cuboids[\"national_act_group\"])"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 4. OLAP Operations: Roll-Up & Drill-Down\n",
                    "\n",
                    "### 4.1 Roll-Up\n",
                    "Aggregating from 40 specific leaf offenses $\\rightarrow$ 3 Act Groups $\\rightarrow$ National Grand Total ($86,420$ cases):\n",
                    "- **IT Act**: $44,237$ cases ($51.19\\%$)\n",
                    "- **IPC Crimes r/w IT Act**: $41,849$ cases ($48.43\\%$)\n",
                    "- **SLL Crimes r/w IT Act**: $334$ cases ($0.39\\%$)"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "print(\"=== ROLL-UP CUBOID: ADMIN TYPE x ACT GROUP (6 Tuples) ===\")\n",
                    "display(cuboids[\"admin_act_group\"])"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "### 4.2 Drill-Down\n",
                    "Decomposing the highest volume IT Act offense (**Section 66D Personation**, $24,028$ cases) down to individual State/UT jurisdictions."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "drill_df = execute_drill_down_operation()\n",
                    "print(\"=== DRILL-DOWN: SECTION 66D CHEATING BY PERSONATION (Top 8 States) ===\")\n",
                    "display(drill_df.head(8))"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 5. OLAP Operations: Slice, Dice & Pivot\n",
                    "\n",
                    "### 5.1 Slice (Single-Dimension Filtering)\n",
                    "Isolating the `IT Act` slice across all 36 jurisdictions ($44,237$ total cases)."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "slice_df = execute_slice_operation(act_group_filter=\"IT Act\")\n",
                    "print(\"=== SLICE: ACT GROUP = 'IT Act' (Top 8 States) ===\")\n",
                    "display(slice_df.head(8))"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "### 5.2 Dice (Multi-Dimensional Sub-Cube Extraction)\n",
                    "Extracting a sub-cube defined by $\\{\\text{Top 5 Volume States}\\} \\times \\{\\text{IT Act}, \\text{IPC}\\}$."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "dice_df = execute_dice_operation(top_n_states=5)\n",
                    "print(\"=== DICE: TOP 5 STATES x {IT Act, IPC} (10 Sub-Cube Cells) ===\")\n",
                    "display(dice_df)"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "### 5.3 Pivot (Cross-Tabulation Matrix)\n",
                    "Reorienting dimensions: Rows = State/UT, Columns = Act Groups, Values = Cases & Shares."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "pivot_df = compute_state_act_group_pivot()\n",
                    "print(\"=== PIVOT TABLE: STATE x ACT GROUP (Top 10 States by Volume) ===\")\n",
                    "display(pivot_df.head(10))"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 6. Data Generalization & Attribute-Oriented Induction (AOI)\n",
                    "\n",
                    "Attribute-Oriented Induction (AOI) compresses low-level attribute values into generalized concept descriptions using concept hierarchies:\n",
                    "- $\\text{State/UT} \\rightarrow \\text{Administrative Type (State vs Union Territory)}$\n",
                    "- $\\text{Crime Category (40 leaves)} \\rightarrow \\text{Statutory Act Group (IT Act, IPC, SLL)}$\n",
                    "\n",
                    "**Result**: Compresses $1,440$ base tuples into **6 generalized concept tuples** ($99.58\\%$ reduction in tuple cardinality)."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "aoi_df = perform_attribute_oriented_induction()\n",
                    "print(\"=== ATTRIBUTE-ORIENTED INDUCTION (AOI): GENERALIZED RELATION ===\")\n",
                    "display(aoi_df)"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "### AOI vs OLAP Comparison:\n",
                    "- **OLAP**: Focuses on multidimensional data cube navigation (slice/dice/drill-down/roll-up) for interactive user exploration.\n",
                    "- **AOI**: Focuses on automated data generalization by replacing specific attribute values with higher-level semantic concepts, creating compact prime relations for rule discovery."
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 7. Efficient Cube Computation & Iceberg Cuboids\n",
                    "\n",
                    "In high-dimensional warehouses, materializing the full power set of cuboids ($2^d$) creates explosive storage and computational overhead. **Iceberg Cubes** selectively materialize only cells satisfying an analytical condition $\\text{Measure} \\ge T$.\n",
                    "\n",
                    "We evaluate an Iceberg Cuboid on the Base State $\\times$ Category table with threshold $T = 1,000$ cases."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "iceberg_df = compute_iceberg_cuboid(threshold_cases=1000)\n",
                    "print(f\"=== ICEBERG CUBOID (SUM(cases) >= 1,000): {len(iceberg_df)} Tuples Retained ===\")\n",
                    "print(f\"Total cases captured: {iceberg_df['cases'].sum():,} ({iceberg_df['cases'].sum()/86420*100:.2f}% of national total)\")\n",
                    "display(iceberg_df)"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "### Iceberg Pruning Efficiency:\n",
                    "- **Full Base Cuboid**: $1,440$ tuples ($86,420$ cases).\n",
                    "- **Iceberg Cuboid ($T \\ge 1,000$)**: **16 tuples** ($54,848$ cases).\n",
                    "- **Efficiency**: Retaining just **$1.11\\%$ of tuples** captures **$63.47\\%$ of national cybercrime volume**."
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 8. Visualizations & Pipeline Execution (Figures 33 to 35)\n",
                    "\n",
                    "We execute the full Stage 11 pipeline to generate and export all analytical artifacts."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "pipeline_outputs = run_stage11_pipeline()\n",
                    "print(\"=== GENERATED STAGE 11 ARTIFACTS ===\")\n",
                    "for k, v in pipeline_outputs.items():\n",
                    "    p = Path(v)\n",
                    "    print(f\"  - {k:<25}: {p.name} ({p.stat().st_size:,} bytes)\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 9. Methodological Synthesis & Reconciliations\n",
                    "\n",
                    "### Authoritative Reconciliations:\n",
                    "1. **National Total Cases**: Sum of all 40 leaf categories across 36 jurisdictions $= 86,420$ cases ($100.0\\%$).\n",
                    "2. **Act Group Decomposition**: IT Act ($44,237$, $51.19\\%$) + IPC ($41,849$, $48.43\\%$) + SLL ($334$, $0.39\\%$) $= 86,420$.\n",
                    "3. **Motive Reconciliation**: Sum of 18 specific motives across 36 jurisdictions $= 86,420$ motives ($100.0\\%$).\n",
                    "4. **Pivot Total Reconciliations**: All row totals and column totals in `stage11_pivot_state_act_group.csv` match base facts with zero error.\n",
                    "\n",
                    "### Small-N & Dimensional Limitations ($N = 36$):\n",
                    "- **Observational Unit**: Data represent aggregate State/UT jurisdictions, not individual crime incidents.\n",
                    "- **Separate Dimensional Spaces**: Categories and Motives cannot be cross-tabulated without raw incident microdata.\n",
                    "- **Descriptive Non-Causal Nature**: Cube roll-ups summarize observed reporting volumes without attributing causation.\n"
                ]
            }
        ],
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
    
    out_path = Path("notebooks/09_advanced_olap_cube.ipynb")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)
    print(f"Generated notebook: {out_path}")

if __name__ == "__main__":
    create_stage11_notebook()
