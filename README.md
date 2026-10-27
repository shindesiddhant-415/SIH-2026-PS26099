# NMIG — National Material Intelligence Grid
### AI-Driven Standardization and Harmonization of Material Codes Across CPSEs

**Smart India Hackathon 2026**  
- **Problem Statement ID:** SIH26099  
- **Problem Statement Title:** AI-Driven Standardization and Harmonization of Material Codes Across CPSEs  
- **Theme:** Smart Automation  
- **Category:** Software  
- **Team Name:** Spartans_1  
- **Team ID:** 137862  

---

## 🌐 Overview & Executive Summary

Central Public Sector Enterprises (CPSEs) across India (such as **IOCL, NTPC, SAIL, BHEL, GAIL, and ONGC**) procure and manage millions of materials. However, identical or technically equivalent items are cataloged under divergent legacy numbering conventions, inconsistent abbreviations, conflicting units of measure (UoM), and isolated SAP/ERP systems.

**NMIG (National Material Intelligence Grid)** is a sovereign, enterprise-grade AI harmonization platform that:
1. **Multi-CPSE Ingestion & Normalization:** Resolves legacy shorthand, abbreviations, and disparate UoMs across industrial catalogs.
2. **Hybrid AI Matching Engine:** Integrates neural dense embeddings (Sentence-BERT / `all-MiniLM-L6-v2`), lexical token matching, and physical engineering constraint checks (rejecting incompatible pressure ratings or material grades).
3. **4-Way Equivalence Decision Matrix:** Categorizes matches into:
   - 🟢 **Exact Duplicate** (100% attribute alignment)
   - 🟡 **Technically Equivalent** (Interchangeable engineering specifications)
   - 🔵 **Functionally Alternative** (Compatible core item with minor variations)
   - 🔴 **Conflict / Not Equivalent** (Metallurgical or pressure constraint violation)
4. **Deterministic CNMC Codification:** Generates collision-resistant **Common National Material Codes (CNMC)** based on normalized technical parameters and UNSPSC 4-tier taxonomy.
5. **Interactive Resolution Workbench:** Allows Data Stewards, Technical Reviewers, and Procurement Directors to inspect side-by-side spec diffs and approve harmonizations.
6. **ERP Interception & Audit Ledger:** Features simulated SAP RFC/BAPI connectors (`BAPI_MATERIAL_GET_DETAIL`, `MARA-ZZ_CNMC`) for pre-procurement duplicate warnings, backed by a cryptographically chained **SHA-256 tamper-evident audit ledger**.
7. **Live Catalog Upload:** Drag-and-drop CSV catalog upload for immediate on-the-fly normalization, attribute extraction, and clustering.

---

## 🏛️ Platform Architecture

```
cpse-material-harmonizer/
├── src/
│   ├── models/
│   │   └── material.py            # Pydantic schemas (Raw, Normalized, TechnicalAttributes, CoreAIOutputTuple)
│   ├── data/
│   │   └── sample_cpse_catalogs.py # Multi-CPSE industrial datasets (IOCL, NTPC, SAIL, BHEL, GAIL)
│   ├── engine/
│   │   ├── preprocessor.py        # Abbreviation expansion & UoM normalization
│   │   ├── attribute_extractor.py # Regex & rule-based physical attribute extractor
│   │   ├── matcher.py             # Sentence-BERT semantic similarity & engineering constraint checks
│   │   ├── clusterer.py           # Duplicate clusterer & collaborative savings calculator
│   │   ├── code_generator.py      # Deterministic Common National Material Code (CNMC) generator
│   │   ├── mapping_registry.py    # Bidirectional CPSE <-> CNMC mapping & CSV export
│   │   ├── pipeline_output.py     # Canonical 8-tuple transformation engine
│   │   └── ingestion.py           # Ingestion coordinator & CSV catalog parser
│   ├── taxonomy/
│   │   └── unspcs_rules.py        # 4-tier UNSPSC taxonomy classifier
│   ├── connectors/
│   │   └── sap_mock_connector.py  # SAP BAPI integration & pre-procurement interception
│   ├── governance/
│   │   └── audit_ledger.py        # Cryptographically chained SHA-256 audit ledger
│   └── web/
│       ├── app.py                 # FastAPI REST API backend (Analytics, Upload, Review, Mappings)
│       └── static/
│           ├── index.html         # Executive command portal with light/dark theme
│           ├── style.css          # Bharat Codex sovereign design system
│           └── app.js             # Client application with live CSV ingestion & workbench
├── tests/                         # Automated test suite (27 passing test suites)
├── Dockerfile                     # Production-ready slim container
├── docker-compose.yml             # Single-command local containerization
├── render.yaml                    # One-click cloud deployment blueprint
├── requirements.txt               # Python package dependencies
└── README.md
```

---

## 🚀 Quickstart & Running Locally

### 1. Prerequisites
- Python 3.10+ (tested and verified on Python 3.11, 3.12, 3.14)
- `pip`

### 2. Setup Environment
```bash
pip install -r requirements.txt
```

### 3. Launch Development Server
```bash
python -m uvicorn src.web.app:app --host 127.0.0.1 --port 8000 --reload
```
Open your browser and navigate to: **`http://127.0.0.1:8000`**

---

## 🧪 Running Automated Tests

Run the full pytest suite:
```bash
python -m pytest tests/ -v
```

All **27 test suites validate**:
- Multi-CPSE ingestion and abbreviation normalization
- Exact and near-duplicate cluster detection
- Rejection of incompatible engineering specifications
- Deterministic CNMC code generation
- REST API analytics, approval workflows, and CSV export
- CSV catalog drag-and-drop live file upload
- Tamper-evident cryptographic ledger verification
- SAP RFC/BAPI pre-procurement duplicate alert interception
- Canonical 8-tuple pipeline output integrity

---

## 🐳 Docker Deployment

### Run with Docker Compose (Local & Production VMs)
```bash
docker-compose up --build
```
Access the application at `http://localhost:8000`.

### Standalone Docker Build & Run
```bash
docker build -t matsync-ai .
docker run -p 8000:8000 -e PORT=8000 matsync-ai
```

---

## ☁️ Cloud Deployment Options

### Option 1: 1-Click Vercel Deployment (Recommended for Instant Live Demo)
This repository includes native [`vercel.json`](file:///d:/sih-ps-2/vercel.json) and [`api/index.py`](file:///d:/sih-ps-2/api/index.py) configuration:
1. Push your repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repo: `SIH-2026-PSS26263-`.
3. Vercel automatically detects the Python runtime and `requirements.txt`.
4. Click **Deploy**. Your live sovereign platform URL is generated in under 30 seconds!

### Option 2: Render.com (Blueprint & Web Service)
This repository includes a [`render.yaml`](file:///d:/sih-ps-2/render.yaml) blueprint:
1. Connect this GitHub repository to [Render](https://render.com).
2. Create a **New Web Service** (or use Blueprints).
3. Runtime: **Python 3**
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `python -m uvicorn src.web.app:app --host 0.0.0.0 --port $PORT`
6. Click **Deploy Web Service**.

### Option 3: Railway / Koyeb / Fly.io / Heroku
The included [`Procfile`](file:///d:/sih-ps-2/Procfile) and [`Dockerfile`](file:///d:/sih-ps-2/Dockerfile) are standard compliant:
```bash
# Railway CLI
railway up

# Fly.io CLI
fly launch
```

### Option 4: AWS App Runner / Google Cloud Run / Azure Container Apps
Deploy the Docker container image directly. The container exposes port `8000` (or dynamic `${PORT}`), runs as non-root user `appuser`, and includes built-in container health checks:
```bash
# Verify health check endpoint
curl -f http://<your-deployment-domain>/api/health
```

---

## ⚙️ Environment Variables Reference

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `8000` | Dynamic binding port for cloud providers (Render, Heroku, Cloud Run) |
| `ENABLE_NEURAL_EMBEDDINGS` | `0` | Set `1` to activate Sentence-BERT transformer embeddings (`requirements-ml.txt`) |
| `PYTHONUNBUFFERED` | `1` | Ensures real-time container log output streaming |

---

## 👥 Hackathon Team Credentials
- **Team Name:** Spartans_1
- **Team ID:** 137862
- **Problem Statement ID:** SIH26099 (AI-Driven Standardization and Harmonization of Material Codes Across CPSEs)
- **Theme:** Smart Automation (Software)
- **Official GitHub:** [github.com/shindesiddhant-415/SIH-2026-PSS26263-](https://github.com/shindesiddhant-415/SIH-2026-PSS26263-)
