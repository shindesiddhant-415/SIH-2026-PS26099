SIH 26099 — National Material Intelligence & Harmonization Platform

Final Agent Build Specification (V3 — Research-Backed, Prototype-First)

Problem Statement: 26099
Title: AI-Driven Standardization and Harmonization of Material Codes Across CPSEs
Organization: Ministry of Petroleum & Natural Gas
Department: Chennai Petroleum Corporation Limited (CPCL)
Category: Software
Theme: Smart Automation
Purpose: Build a genuinely working SIH prototype suitable for the next/final selection stage.
Research date: 27 September 2026

0. AGENT EXECUTION INSTRUCTION

You are the lead product engineer, ML engineer, data engineer, backend engineer, frontend engineer, and QA engineer for this project.

Build a working end-to-end prototype, not a mockup and not a collection of disconnected screens.

The primary objective is to prove the hardest part of SIH 26099:

Given heterogeneous material records from multiple CPSEs, determine whether two materials are truly the same, technically equivalent, merely functionally similar, or not equivalent — using structured engineering attributes and technical constraints, not text similarity alone — and then create an auditable canonical material identity and CPSE mapping.

The system must be demoable from raw CSV/XLSX input through AI processing, review, CNMC mapping, analytics, and report/export generation.

Do not spend early development time on enterprise features that do not improve the core demonstration.

Core product principle

Similarity suggests. Technical identity and constraints decide. Humans govern uncertainty.

A high embedding similarity score must NEVER be treated as proof of technical equivalence.

The system must also distinguish missing information from negative information. If a critical attribute is unknown, the system must not invent a value and must not auto-merge the materials.

1. SOURCE-OF-TRUTH: WHAT PS 26099 REQUIRES

The supplied PS requires an AI-driven Unified Material Master capable of:

AI-based matching of material descriptions and specifications across CPSEs.

Identification of duplicate, near-duplicate, and functionally/equivalently related materials.

Automated standardization of material descriptions and technical attributes.

Intelligent classification and categorization.

Recommendation of a Common National Material Code (CNMC).

Mapping of each CPSE's legacy/native code to the common identity.

Legacy-code rationalization and migration support.

User review, validation, and approval of AI recommendations.

Material master analytics and duplicate detection.

Governance and auditability.

SAP/ERP integration capability.

National-level visibility while retaining traceability to each CPSE source code.

The PS's expected impact includes duplicate/redundant code reduction, better material-master quality, inventory visibility, demand aggregation, improved procurement, inter-CPSE material identification, faster specification finalization, and strategic sourcing.

The official PS dataset entry is explicitly listed as:

CPSE Material Master Data / Sample Material Master Dataset — To be provided by participating CPSEs

Therefore, no public community dataset may be presented as the official CPSE dataset.

Primary source: user-provided SIH PS 26099 document.

2. RESEARCH-BASED DESIGN DECISIONS

2.1 Basic fuzzy/semantic matching is not enough

Enterprise Master Data Governance systems already support standardization, duplicate checks, fuzzy matching, review workflows, validation, and governance. SAP documentation explicitly describes material master standardization, matching, duplicate checking, validation, and approval workflows.

Therefore, the project must not claim that "AI + embeddings + fuzzy matching + approval dashboard" is itself the innovation.

The differentiator is a technical-identity intelligence layer above heterogeneous CPSE data.

Sources:

SAP Master Data Governance for Material: https://help.sap.com/docs/SAP_ERP/f184745abebf416bb931952badbfa43c/c4e5d8c1a84c41a39eedde2f9c6e45aa.html

SAP MDG Consolidation/Matching: https://help.sap.com/docs/SAP_MASTER_DATA_GOVERNANCE/e605401fa254458cbe47498c514d42ce/575820575b59e974e10000000a4450e5.html

SAP matching configuration: https://help.sap.com/docs/SAP_MASTER_DATA_GOVERNANCE/6b8255b03aa44628880b5b71c16ddb91/1ecb69568fb4c359e10000000a441470.html

2.2 Engineering specifications must be normalized before semantic matching

Descriptions frequently vary by abbreviations, units, word order, standards, and engineering notation. Normalize these before embedding.

Examples:

BALL VL 2 IN CL300
BALL VALVE 2" CLASS 300
2 IN BALL VALVE CL-300

may refer to the same technical identity.

But:

GATE VALVE 4" CLASS 150
GATE VALVE 4" CLASS 300

must not automatically merge because of high semantic similarity.

2.3 The public SIH26099 dataset is suitable for prototype development

Use the following public dataset as the bootstrap/development dataset:

Hugging Face:
https://huggingface.co/datasets/sarthak20024/sih26099-cpse-material-codes

The current dataset card reports:

21,513 material/item descriptions in the main material corpus.

Public sources from Oil India, NTPC, and IOCL.

Reference tables for abbreviations, grades, pressure classes, unit normalization, and UNSPSC.

Dataset license shown as CC BY 4.0.

The repository describes itself as a data-collection stage, not as an already-trained model or a ground-truth labeled equivalence dataset.

Current main table path:

data/processed/extracted_items/material_description_corpus.csv

Current reported supporting files include:

unspsc_master.csv

unspsc_industrial_subset.csv

material_abbreviations.csv

material_grades.csv

pressure_classes.csv

unit_normalisation.csv

cppp_product_categories.csv

ntpc_locations.csv

The dataset page also reports provenance/source fields such as organization, source system, tender reference, description, unit/category, source URL, and document URL.

Dataset source: https://huggingface.co/datasets/sarthak20024/sih26099-cpse-material-codes

Dataset policy

Use this dataset.

Do NOT call it:

official CPSE master data,

official CPCL data,

ground-truth equivalence labels,

validated national material master.

Call it:

Public CPSE-related development corpus

The public dataset is a development/bootstrap source. If official CPSE sample data is later provided, it becomes the priority validation source.

3. PRODUCT DEFINITION

Product name

NMIG — National Material Intelligence Graph

Tagline:

Specification-aware AI for CPSE material harmonization.

Product thesis

Transform heterogeneous CPSE material records into structured Material Fingerprints, retrieve candidate matches semantically, validate them through category-specific engineering constraints, explain every recommendation with evidence, map approved equivalence groups to a governed Common National Material Code, and expose cross-CPSE procurement intelligence.

What the system is NOT

Do not build:

a generic chatbot,

a PDF-only search engine,

a pure embedding similarity tool,

a simple fuzzy duplicate finder,

an automatic system that silently changes master data.

4. FINAL CORE INNOVATIONS

Use these as the main differentiators in the PPT and demo.

Innovation 1 — Material Fingerprint

Convert free-text/material records into a structured, category-aware engineering identity.

Example:

{
  "category": "VALVE",
  "subtype": "GATE_VALVE",
  "nominal_size": {"value": 4, "unit": "IN"},
  "pressure_class": "CLASS_150",
  "body_material": "WCB",
  "end_connection": "RF",
  "standard": "API_600"
}

The fingerprint must preserve:

normalized value,

canonical unit,

source value,

confidence,

extraction method,

criticality,

evidence/provenance.

Innovation 2 — Category-Aware Attribute Intelligence

Different categories require different technical schemas.

Examples:

Valve

type

nominal size

pressure class

end connection

body material

trim

seat material

standard

Cable

voltage

conductor material

cross-sectional area

core count

insulation

armour

standard

Bearing

bearing type

bore

outer diameter

width

seal/shield

clearance

load rating

Fastener

type

material/grade

diameter

length

thread

standard

coating

The schema must be configurable and versioned.

Innovation 3 — Critical Attribute Registry

Every attribute receives a criticality class:

CRITICAL: mismatch blocks automatic technical equivalence.

IMPORTANT: significant scoring impact.

OPTIONAL: low scoring impact/data-quality only.

IDENTIFIER: traceability field; should not determine technical equivalence by itself.

Example for valves:

pressure_class      CRITICAL
nominal_size        CRITICAL
end_connection      CRITICAL
body_material       IMPORTANT/CRITICAL depending on rule
standard             IMPORTANT
trim                 IMPORTANT

Rules must be configurable, versioned, and auditable.

Innovation 4 — Constraint-Aware Hybrid Equivalence Engine

Candidate retrieval uses AI. Final classification uses a combination of semantic evidence and technical constraints.

Pipeline:

Raw records
  ↓
Normalization
  ↓
Material Fingerprint
  ↓
Candidate retrieval
  ↓
Semantic similarity
  + fuzzy similarity
  + attribute similarity
  + engineering constraints
  ↓
Decision engine

A hard critical conflict must override a high semantic score.

Innovation 5 — Four-way Technical Relationship Model

At minimum:

EXACT_DUPLICATE

TECHNICALLY_EQUIVALENT

FUNCTIONAL_ALTERNATIVE

NOT_EQUIVALENT

Additionally support:

NEAR_DUPLICATE

TECHNICAL_CONFLICT

INSUFFICIENT_DATA

MANUAL_REVIEW

NEW_MATERIAL_CANDIDATE

Do not collapse "functional alternative" into technical equivalence.

Innovation 6 — Explainable Match Evidence

For every recommendation, show:

semantic similarity,

attribute-level matches,

mismatches,

rules triggered,

critical attributes,

missing fields,

source records,

normalization rules,

model version,

rule version.

Innovation 7 — Counterfactual Explanation

For a blocked/rejected match, show what caused the block.

Example:

Candidate pair:
GATE VALVE 4 IN CLASS 150
vs
GATE VALVE 4 IN CLASS 300

Semantic similarity: HIGH

Decision: NOT EQUIVALENT

Critical conflict:
Pressure class = 150 vs 300

Counterfactual:
If pressure class were equal, the currently known remaining attributes
would satisfy the current equivalence policy.

The counterfactual must be generated from deterministic rule outputs. Do not ask an LLM to invent it.

Innovation 8 — Evidence/Provenance Graph

Every decision should be traceable:

Source record A
  ↓
Raw attribute
  ↓
Normalized attribute
  ↓
Rule/model evidence
  ↓
Decision
  ↓
Reviewer action

Use relational tables/JSONB for the MVP. A dedicated graph database is optional.

Innovation 9 — Canonical Specification Composer

Once a cluster is approved, generate a canonical, procurement-ready material description from the approved fingerprint.

Example:

HEX HEAD BOLT M10 X 50 MM, STAINLESS STEEL 304, ISO 4014

Never generate the canonical identity by blindly summarizing source text.

Innovation 10 — National Material Intelligence Graph

Represent relationships:

CPSE legacy code
   ↓
Source material
   ↓
Material Fingerprint
   ↓
Canonical material
   ↓
CNMC
   ↓
Standards / attributes / alternatives / evidence

Example:

CPCL-MAT-1234 ─┐
IOCL-MAT-7782 ─┼── CNMC-00001284
NTPC-MAT-4451 ─┘

Innovation 11 — Procurement Aggregation Intelligence

After harmonization, aggregate material demand and usage by canonical identity.

Show:

cross-CPSE demand,

volume concentration,

price variance where actual transaction data is available,

candidate common-rate-contract items,

potential procurement consolidation opportunities,

duplicate inventory exposure.

Use terms such as potential, estimated, and candidate unless actual data proves realized savings.

Innovation 12 — Human-in-the-Loop Active Learning

Reviewer decisions must be recorded and used for controlled future calibration.

Do not automatically retrain production models after every click.

Store review data first, then run versioned training/calibration jobs.

5. END-TO-END SYSTEM ARCHITECTURE

                    CPSE MATERIAL DATA
                           │
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
        SAP/ERP          CSV/XLSX          API
          └────────────────┼────────────────┘
                           ↓
                    INGESTION LAYER
                           ↓
                  DATA QUALITY LAYER
                           ↓
             TEXT / UNIT / STANDARD NORMALIZATION
                           ↓
                   CATEGORY CLASSIFIER
                           ↓
            CATEGORY-SPECIFIC ATTRIBUTE EXTRACTOR
                           ↓
                 MATERIAL FINGERPRINT ENGINE
                           ↓
                 VECTOR CANDIDATE RETRIEVAL
                           ↓
             ┌─────────────┼──────────────┐
             ↓             ↓              ↓
          Embedding     Fuzzy          Rule/Constraint
          Similarity    Similarity      Engine
             └─────────────┼──────────────┘
                           ↓
                  HYBRID DECISION ENGINE
                           ↓
           ┌───────────────┼────────────────┐
           ↓               ↓                ↓
      Exact Duplicate  Technical       Functional
                       Equivalent       Alternative
           │               │                │
           └───────────────┼────────────────┘
                           ↓
                     Conflict Check
                           ↓
                 Explainable Decision
                           ↓
                    Evidence Graph
                           ↓
                    Human Review
                           ↓
                 Canonical Material
                           ↓
                     CNMC Registry
                           ↓
                  Legacy Code Mapping
                           ↓
          ┌────────────────┴────────────────┐
          ↓                                 ↓
 Material Intelligence Dashboard     Procurement Intelligence
          ↓                                 ↓
          └────────────────┬────────────────┘
                           ↓
                     REST API / ERP

6. TECHNOLOGY STACK

Use a simple, production-like stack.

Frontend

React

Vite

TypeScript preferred

Tailwind CSS or another clean component system

Recharts/ECharts for analytics

Backend

Python

FastAPI

Pydantic

SQLAlchemy

Alembic

Data / Database

PostgreSQL

pgvector

JSONB for flexible fingerprint/attribute storage

AI/ML

Python

pandas

NumPy

scikit-learn

sentence-transformers

optional BERT-family model

rule/constraint engine implemented in Python

LLM

Use an LLM only where it adds value:

attribute extraction,

abbreviation interpretation,

canonical description generation,

explanation phrasing.

The LLM is NOT the final technical-equivalence authority.

A local Ollama model may be used to support offline/privacy-friendly operation during development.

Deployment

Docker

Docker Compose

Nginx optional

Linux-compatible containers

Optional graph layer

Do not require Neo4j for the MVP. Implement the national relationship graph in PostgreSQL first. Add Neo4j later only if a real graph workload justifies it.

7. DATASET STRATEGY

7.1 Primary development dataset

Use:

https://huggingface.co/datasets/sarthak20024/sih26099-cpse-material-codes

Main working file:

data/processed/extracted_items/material_description_corpus.csv

Preserve raw data unchanged under:

data/raw/public_sih26099/

Keep a data/MANIFEST.json containing:

source URL,

resolved dataset revision/commit if available,

download date,

file hashes,

local file paths,

license,

source type.

7.2 Data source labels

Every record must carry one of:

OFFICIAL_CPSE
PUBLIC_DEVELOPMENT
SYNTHETIC
USER_UPLOADED

7.3 Official CPSE override

When CPSE data is supplied, import it through the same ingestion contract.

Official data becomes the highest-priority validation source.

The public dataset remains useful for vocabulary/normalization augmentation and development experiments.

7.4 Synthetic demo dataset

Create a curated synthetic set so the SIH demo reliably demonstrates:

Exact duplicate.

Technical equivalence.

Near duplicate.

Critical technical conflict.

Functional alternative.

Insufficient data.

Category-specific matching.

Multiple CPSE codes mapping to one canonical material.

Cross-CPSE procurement aggregation.

7.5 Labeled pair dataset

Create:

pair_id
material_a_id
material_b_id
label
reason
reviewer_id
review_timestamp
rule_version

Labels:

EXACT_DUPLICATE
TECHNICALLY_EQUIVALENT
FUNCTIONAL_ALTERNATIVE
NOT_EQUIVALENT
INSUFFICIENT_DATA

Start with approximately 2,000–5,000 carefully curated pairs for the prototype.

7.6 Avoid data leakage

Do not randomly split highly similar rows across train and test.

Split at the material/entity/cluster level so near-duplicate descriptions do not appear in both training and evaluation.

Suggested initial split:

70% train

15% validation

15% test

If supervised training is not justified by the labels, use retrieval + deterministic rules + calibration and report honest evaluation metrics.

8. DATA PREPROCESSING PIPELINE

Step 1 — Ingestion

Accept:

CSV

XLSX

JSON

Map columns into a standard ingestion contract.

Step 2 — Preserve raw source

Never overwrite raw descriptions.

Keep source file and source-row provenance.

Step 3 — Text normalization

Perform:

Unicode normalization.

whitespace cleanup.

punctuation normalization.

case normalization.

delimiter normalization.

engineering abbreviation expansion.

synonym mapping.

safe token ordering/segmentation where applicable.

Example:

SS304
SS 304
STAINLESS STEEL 304

should normalize to one canonical representation where rules support it.

Step 4 — Unit normalization

Convert supported quantities into canonical units.

Examples:

10 MM
1 CM
0.3937 IN

Do not convert units without recording the original value and conversion rule.

Step 5 — Standard normalization

Normalize standards and grades through a versioned dictionary.

Do not assume two standards are equivalent unless an explicit trusted rule exists.

Step 6 — Attribute extraction

Use category-specific patterns, deterministic regex/parsers, and optional LLM extraction.

Store confidence and evidence.

Step 7 — Category classification

Assign hierarchical taxonomy.

Use UNSPSC as a reference/interoperability taxonomy, not as the only source of engineering meaning.

9. MATERIAL FINGERPRINT DATA MODEL

Example:

{
  "category": "PIPE",
  "subclass": "LINE_PIPE",
  "attributes": {
    "nominal_size": {
      "value": 2,
      "unit": "IN",
      "criticality": "CRITICAL"
    },
    "material_grade": {
      "value": "API_5L_X52",
      "criticality": "CRITICAL"
    },
    "manufacturing_process": {
      "value": "ERW",
      "criticality": "IMPORTANT"
    },
    "wall_thickness": {
      "value": 3.91,
      "unit": "MM",
      "criticality": "IMPORTANT"
    }
  },
  "quality": {
    "completeness": 0.91,
    "attribute_confidence": 0.94
  }
}

Every extracted attribute should retain:

raw_value
normalized_value
unit
source_field/source_text
confidence
criticality
extraction_method
normalization_rule_version

10. AI MATCHING ENGINE

Stage A — Candidate retrieval

Goal: reduce comparisons from all-pairs to a small candidate set.

Use:

category filtering,

vector similarity,

lexical/fuzzy retrieval,

optional key-attribute blocking.

Return top K candidates, e.g. K = 20–50.

Stage B — Pair feature computation

For each candidate pair calculate:

semantic_similarity
lexical_similarity
attribute_match_score
critical_attribute_match
important_attribute_match
missing_critical_count
conflicting_critical_count
unit_compatibility
standard_compatibility
category_compatibility

Stage C — Decision rules

Recommended logic:

If category fundamentally conflicts → NOT_EQUIVALENT.

If a critical attribute conflicts → NOT_EQUIVALENT unless a category rule explicitly allows a conversion/equivalence.

If required critical attributes are missing → INSUFFICIENT_DATA / MANUAL_REVIEW.

If all required critical attributes agree and semantic evidence is strong → TECHNICALLY_EQUIVALENT.

If descriptions are nearly identical but provenance/identity indicates same source identity → EXACT_DUPLICATE.

If function is similar but interchangeability is not proven → FUNCTIONAL_ALTERNATIVE.

If similarity is moderate and evidence incomplete → NEAR_DUPLICATE / MANUAL_REVIEW.

Stage D — Confidence

Expose separate scores:

Semantic Score
Technical Attribute Score
Constraint Compatibility
Overall Recommendation Confidence

Do not display only one opaque score.

11. CATEGORY-SPECIFIC CONSTRAINT ENGINE

Implement a configurable rule registry.

Example:

VALVE:
  critical:
    - valve_type
    - nominal_size
    - pressure_class
    - end_connection
  important:
    - body_material
    - trim
    - standard

CABLE:
  critical:
    - voltage_rating
    - conductor_material
    - cross_section
    - core_count
  important:
    - insulation
    - armour
    - standard

Rules must be stored/versioned rather than hard-coded across dozens of modules.

Provide unit tests for every critical rule.

12. RELATIONSHIP/DECISION ENGINE

Exact duplicate

Use when source records describe the same technical identity with no material technical conflict and sufficiently strong identity evidence.

Technically equivalent

Use when descriptions differ but normalized technical fingerprints satisfy the equivalence policy.

Functional alternative

Use when two items serve the same or similar purpose but are not proven interchangeable.

Not equivalent

Use when technical identity differs or critical constraints conflict.

Insufficient data

Use when the system lacks sufficient evidence to make a safe equivalence decision.

Never force a binary answer when evidence is incomplete.

13. EXPLAINABILITY UX

For every pair, render:

MATERIAL MATCH ANALYSIS

Material A
CPCL-MAT-10291
HEX BOLT M10 X 50 SS304

Material B
IOCL-MAT-72831
SS304 HEXAGON BOLT 10MM X 50

DECISION
TECHNICALLY EQUIVALENT

Semantic similarity        0.96
Technical compatibility    1.00
Overall confidence         0.968

ATTRIBUTES
✓ Category
✓ Type
✓ Grade
✓ Diameter
✓ Length
✓ UOM

EVIDENCE
• Abbreviation rule SS → Stainless Steel
• Grade normalization SS304
• Unit normalization inch/mm if applied
• Source row/file references
• Rule version
• Model version

[APPROVE] [REJECT] [EDIT] [SEND TO REVIEW]

For conflicts:

DECISION
NOT_EQUIVALENT

CRITICAL CONFLICTS
❌ Pressure Class: 150 vs 300
❌ End Connection: RF vs RTJ

WHY NOT?
Critical attributes do not satisfy the equivalence policy.

14. CNMC GOVERNANCE

Do not make the AI the final authority for the code

The AI should recommend a canonical material identity.

A governed registry assigns the final CNMC after review/approval.

Preferred design:

AI equivalence recommendation
        ↓
Canonical material proposal
        ↓
Human/authorized approval
        ↓
CNMC registry

CNMC design

Use a stable opaque identifier such as:

CNMC-00001284

Do not pack too much semantic meaning into the ID itself.

Taxonomy/classification should be stored as mutable metadata attached to the stable CNMC.

This avoids identity instability if taxonomy rules change.

Canonical record

A canonical material should store:

CNMC

canonical description

category/taxonomy

approved fingerprint

standards

required attributes

equivalent CPSE records

alternatives

evidence

creation date/version

approval history

status

15. NATIONAL MATERIAL INTELLIGENCE GRAPH

The system must make these relationships queryable:

CPSE
  ↓
Legacy Material Code
  ↓
Source Record
  ↓
Normalized Record
  ↓
Material Fingerprint
  ↓
Canonical Material
  ↓
CNMC
  ↓
Standards / Categories / Alternatives / Evidence

For the MVP, use relational tables plus JSONB.

Do not introduce a separate graph database until the relational version is working.

16. PROCUREMENT INTELLIGENCE MODULE

Create a synthetic procurement-transaction dataset for the demo if official transactions are unavailable.

Schema:

transaction_id
cpse_id
material_code
transaction_date
quantity
uom
unit_price
currency
supplier_id
plant/location

After mapping to CNMC, calculate:

aggregated quantity by CNMC,

number of CPSEs purchasing the item,

number of legacy codes representing the identity,

price variance where valid prices exist,

supplier concentration,

potential aggregation candidates.

Example

Before harmonization:
CPCL  5 codes
IOCL  4 codes
NTPC  6 codes

After:
3 canonical material identities

Cross-CPSE demand:
4,400 units

Potential action:
Candidate for common procurement / rate contract

Never fabricate realized savings.

Use:

Potential procurement consolidation opportunity

unless actual transaction evidence supports a stronger conclusion.

17. HUMAN-IN-THE-LOOP WORKFLOW

Workflow states:

NEW
→ AI_ANALYZED
→ PENDING_REVIEW
→ APPROVED
→ REJECTED
→ OVERRIDDEN
→ CANONICALIZED

Every action must store:

user
role
old_state
new_state
reason
created_at
model_version
rule_version

Reviewer corrections become active-learning feedback.

18. ACTIVE LEARNING

The system must store:

prediction
confidence
reviewer decision
reviewer correction
reason code
category
rule version
model version

Use feedback to:

recalibrate thresholds,

improve category-specific rules,

expand abbreviation dictionaries,

improve candidate retrieval,

create new training pairs.

Do not automatically retrain after every decision.

Create versioned datasets/models:

model_v1
model_v2
rules_v1
rules_v2

19. CLASSIFICATION / UNSPSC ALIGNMENT

Use the UNSPSC reference data from the public development dataset to seed the taxonomy/interoperability layer.

The system should maintain:

CPSE category
   ↕
Internal category taxonomy
   ↕
UNSPSC mapping

Do not claim automatic GeM/UNSPSC compliance unless actually implemented and verified.

This feature is an interoperability/standardization layer, not the core intelligence engine.

20. OCR / LEGACY CATALOG INGESTION

Make OCR a P1/P2 feature unless the team already has it working.

When implemented, support:

PDF
Scanned PDF
Image catalog
Excel
CSV

Pipeline:

Document
 ↓
OCR / text extraction
 ↓
Material line detection
 ↓
Attribute extraction
 ↓
Material Fingerprint

Retain document/page/line provenance.

Multilingual handling should be considered an extension; do not claim production multilingual coverage without evaluation data.

21. SECURITY AND DATA GOVERNANCE

MVP requirements

Implement:

authentication,

role-based access control,

CPSE-scoped access,

encryption in transit,

safe secrets handling,

audit trail,

source/data provenance,

versioning.

Audit trail

Implement an append-only, tamper-evident audit log.

A simple hash chain is acceptable for the prototype:

record_hash = SHA256(previous_hash + canonical_record_json)

Store previous hash and current hash.

Provide a verification function.

Do not market this as blockchain.

Privacy architecture

Production architecture may support CPSE-isolated deployment and privacy-preserving learning/sharing.

Do NOT make full federated learning a P0 requirement.

“Embeddings-only” must not be presented as a complete privacy guarantee.

22. DATABASE SCHEMA

Use PostgreSQL + pgvector.

cpse

id UUID PK
code VARCHAR UNIQUE
name VARCHAR
sector VARCHAR
status VARCHAR
created_at TIMESTAMP
updated_at TIMESTAMP

source_material

id UUID PK
cpse_id UUID FK
source_code VARCHAR
raw_description TEXT
raw_uom VARCHAR
raw_category VARCHAR NULL
raw_specification JSONB NULL
source_payload JSONB NULL
source_type VARCHAR
source_file VARCHAR NULL
source_row_number INT NULL
source_hash VARCHAR
created_at TIMESTAMP
updated_at TIMESTAMP

material_normalized

material_id UUID PK/FK
normalized_description TEXT
normalized_uom VARCHAR NULL
category_code VARCHAR
sub_category_code VARCHAR NULL
fingerprint JSONB
normalization_version VARCHAR
quality_score NUMERIC
attribute_confidence JSONB
embedding vector
normalized_at TIMESTAMP

material_attribute

id UUID PK
material_id UUID FK
attribute_name VARCHAR
raw_value TEXT
normalized_value JSONB
unit VARCHAR NULL
criticality VARCHAR
confidence NUMERIC
extraction_method VARCHAR
source_evidence JSONB
rule_version VARCHAR

category

id UUID PK
parent_id UUID NULL
code VARCHAR UNIQUE
name VARCHAR
source_taxonomy VARCHAR
version VARCHAR

category_attribute_rule

id UUID PK
category_code VARCHAR
attribute_name VARCHAR
criticality VARCHAR
required_for_equivalence BOOLEAN
normalization_rule VARCHAR NULL
rule_definition JSONB
version VARCHAR
active BOOLEAN

material_relationship

id UUID PK
material_a_id UUID
material_b_id UUID
relationship_type VARCHAR
semantic_score NUMERIC
attribute_score NUMERIC
constraint_score NUMERIC
confidence NUMERIC
status VARCHAR
reason_code VARCHAR NULL
created_at TIMESTAMP
model_version VARCHAR
rule_version VARCHAR

canonical_material

id UUID PK
cnmc VARCHAR UNIQUE
canonical_description TEXT
category_code VARCHAR
fingerprint JSONB
status VARCHAR
version INT
created_at TIMESTAMP
updated_at TIMESTAMP

cpse_material_mapping

id UUID PK
source_material_id UUID FK
canonical_material_id UUID FK
mapping_status VARCHAR
confidence NUMERIC
approved_by UUID NULL
approved_at TIMESTAMP NULL

evidence

id UUID PK
relationship_id UUID
material_id UUID NULL
source_type VARCHAR
source_reference VARCHAR
claim VARCHAR
value JSONB
rule_or_model VARCHAR
created_at TIMESTAMP

review_action

id UUID PK
relationship_id UUID
user_id UUID
action VARCHAR
reason_code VARCHAR
comment TEXT
before JSONB
submitted_at TIMESTAMP

audit_log

id BIGSERIAL PK
entity_type VARCHAR
entity_id UUID
action VARCHAR
actor_id UUID
payload JSONB
previous_hash VARCHAR
record_hash VARCHAR
created_at TIMESTAMP

procurement_transaction

id UUID PK
cpse_id UUID
material_code VARCHAR
canonical_material_id UUID NULL
transaction_date DATE
quantity NUMERIC
uom VARCHAR
unit_price NUMERIC NULL
currency VARCHAR NULL
supplier_id VARCHAR NULL
location VARCHAR NULL
source_type VARCHAR

23. API CONTRACT

Use FastAPI.

Data

POST /api/v1/import/materials
GET  /api/v1/materials
GET  /api/v1/materials/{id}

Matching

POST /api/v1/match/candidates
POST /api/v1/match/evaluate
GET  /api/v1/matches
GET  /api/v1/matches/{id}

Canonicalization

POST /api/v1/canonical/propose
POST /api/v1/canonical/{id}/approve
GET  /api/v1/canonical
GET  /api/v1/canonical/{id}

Mapping

POST /api/v1/mappings
GET  /api/v1/mappings

Review

GET  /api/v1/review/queue
POST /api/v1/review/{relationship_id}/approve
POST /api/v1/review/{relationship_id}/reject
POST /api/v1/review/{relationship_id}/override

Analytics

GET /api/v1/analytics/overview
GET /api/v1/analytics/duplicates
GET /api/v1/analytics/harmonization
GET /api/v1/analytics/procurement

Audit

GET /api/v1/audit/{entity_type}/{entity_id}
POST /api/v1/audit/verify-chain

Export

GET /api/v1/export/mappings
GET /api/v1/export/cnmc
GET /api/v1/export/report

24. FRONTEND SCREENS

Build only the screens that demonstrate the PS clearly.

24.1 National Overview Dashboard

Show:

total materials ingested,

total CPSEs,

candidate duplicates,

technical equivalence groups,

conflicts,

pending reviews,

CNMCs created,

potential procurement consolidation opportunities.

24.2 Material Match Center

Side-by-side comparison:

raw descriptions,

normalized descriptions,

fingerprints,

attribute comparison,

semantic score,

technical score,

conflicts,

evidence,

counterfactual explanation,

action buttons.

24.3 Material 360

Show for one material:

source CPSE codes,

canonical identity,

technical fingerprint,

classification,

equivalents,

alternatives,

evidence,

review history,

audit trail.

24.4 Review Queue

Prioritize:

high-confidence approvals,

medium-confidence reviews,

critical conflicts,

insufficient-data cases.

24.5 Procurement Intelligence

Show:

demand by CNMC,

cross-CPSE demand,

legacy-code count,

price variance where available,

consolidation candidates.

25. MVP PRIORITY MODEL

P0 — MUST WORK BEFORE SIH DEMO

CSV/XLSX upload.

Three demo CPSEs.

Raw-data preservation.

Normalization.

Category classification.

Attribute extraction.

Material Fingerprint.

Embedding candidate retrieval.

Fuzzy/lexical candidate retrieval.

Constraint engine.

Four-way decision model.

Critical conflict detection.

Explainable match result.

Counterfactual explanation.

Canonical material proposal.

CNMC registry.

CPSE-to-CNMC mapping.

Human approve/reject/override.

Audit trail.

Dashboard.

Procurement demo analytics.

REST API.

Docker Compose.

Automated tests.

P1 — ADD AFTER CORE IS STABLE

Better category coverage.

Additional taxonomy mapping.

ERP import/export adapters.

Role/permission refinement.

OCR for legacy catalogs.

Multilingual abbreviation handling.

Advanced model calibration.

Background job processing.

P2 — FUTURE/PRODUCTION

Actual SAP adapters.

SSO.

Enterprise message bus.

CPSE-isolated deployment at scale.

Federated/privacy-preserving ML.

Full GeM integration.

Dedicated graph database.

Large-scale distributed inference.

Never allow P2 features to block the P0 prototype.

26. IMPLEMENTATION ROADMAP — PROTOTYPE-FIRST

Week 1 — Data Foundation

Download and version the Hugging Face dataset.

Inspect all fields.

Build PostgreSQL schema.

Build ingestion API.

Preserve provenance.

Create CPSE records.

Deliverable:

Raw dataset can be loaded and queried.

Week 2 — Normalization

Text normalization.

Abbreviation expansion.

Unit normalization.

Grade/standard normalization.

Normalization tests.

Deliverable:

Raw descriptions become stable normalized records.

Week 3 — Classification + Fingerprint

Hierarchical category classification.

Category-specific schemas.

Attribute extraction.

Material Fingerprint generation.

Quality scoring.

Deliverable:

Any material row produces a structured fingerprint.

Week 4 — Retrieval Engine

Embeddings.

pgvector index.

Candidate generation.

Fuzzy retrieval.

Category blocking.

Deliverable:

Given a material, retrieve top relevant cross-CPSE candidates.

Weeks 5–6 — Constraint-Aware Matching

Pair-feature computation.

Critical attribute registry.

Technical rule engine.

Four-way relationship decisioning.

Explainable scoring.

Counterfactual explanations.

Deliverable:

The core AI decision engine works.

This is the most important milestone.

Week 7 — Canonicalization + CNMC

Equivalence clustering.

Canonical fingerprint.

Canonical description composer.

CNMC registry.

Legacy mappings.

Deliverable:

Multiple CPSE materials can become one governed identity.

Week 8 — Human Review + Governance

Review queue.

Approve/reject/edit.

Reason codes.

Versioning.

Audit log.

Hash-chain verification.

Deliverable:

AI output becomes controlled master-data change.

Week 9 — Procurement Intelligence

Synthetic procurement transactions.

CNMC-level aggregation.

Cross-CPSE demand.

Price variance where available.

Consolidation opportunities.

Deliverable:

The system demonstrates the PS's business impact.

Week 10 — Dashboard

Overview.

Match Center.

Material 360.

Review queue.

Procurement Intelligence.

Deliverable:

One polished end-to-end UI.

Week 11 — API + Deployment

API documentation.

Docker Compose.

Seed/demo data.

Health checks.

Logging.

Error handling.

Deliverable:

Reproducible one-command demo environment.

Week 12 — SIH Hardening

Test critical cases.

Benchmark matching.

Analyze false positives.

Prepare demo script.

Prepare PPT screenshots.

Prepare architecture diagram.

Prepare technical documentation.

Deliverable:

Stable SIH demonstration build.

27. MATCHING EXAMPLES THE AGENT MUST SUPPORT

Example 1 — technical equivalence

A: SS HEX BOLT M10 X 50
B: STAINLESS STEEL 304 HEXAGON BOLT 10MM X 50

Expected:

TECHNICALLY_EQUIVALENT

provided required technical fields are confirmed.

Example 2 — critical conflict

A: GATE VALVE 4 IN CLASS 150
B: GATE VALVE 4 IN CLASS 300

Expected:

NOT_EQUIVALENT

Reason:

PRESSURE_CLASS_CONFLICT

Example 3 — functional alternative

Two materials can serve similar operating purposes but have incompatible technology/specification requirements.

Expected:

FUNCTIONAL_ALTERNATIVE

They must NOT automatically receive the same CNMC.

Example 4 — insufficient data

A: GATE VALVE 4 IN
B: GATE VALVE 4 IN

If critical pressure class/end connection data is absent:

INSUFFICIENT_DATA

Do not infer missing specifications from an LLM.

28. MODEL STRATEGY

Initial baseline

Implement these baselines first:

Exact normalized string match.

Token/fuzzy similarity.

Embedding similarity.

Hybrid rules + embedding.

Benchmark them.

Production-like prototype model

Recommended pipeline:

Category blocking
→ Embedding retrieval
→ Pair features
→ Constraint checks
→ Calibrated classifier / score
→ Decision policy

Start with a simple model such as logistic regression, gradient boosting, or a small neural classifier over pair features. Use a larger transformer only if it demonstrates a measurable improvement.

Do not train a huge model merely to claim AI.

29. EVALUATION FRAMEWORK

Report:

Precision.

Recall.

F1.

Top-K candidate recall.

Attribute extraction accuracy.

Category classification accuracy.

False positive rate.

Critical-spec false positive rate.

Review rate.

Coverage of auto-resolvable cases.

Canonical-cluster quality.

Most important metric

Critical-Spec False Positive Rate

Measure how often the system incorrectly declares materials equivalent despite critical technical conflicts.

This is more meaningful for an engineering master-data system than raw semantic accuracy alone.

Benchmark cases

Create a golden test set containing:

exact duplicates,

true equivalents,

critical conflicts,

functional alternatives,

missing-data cases,

abbreviation-heavy cases,

unit-conversion cases,

standard/grade cases.

30. DATA QUALITY SCORE

Create a separate Material Quality Score.

Example dimensions:

Completeness
Normalization coverage
Critical-field coverage
Attribute extraction confidence
Provenance completeness
Consistency checks

Do not merge data quality into equivalence confidence.

Example:

Material Quality: 82%
Equivalence Confidence: 96%

These are different concepts.

31. ERROR HANDLING / GUARDRAILS

The system must:

preserve raw source text,

never silently overwrite raw fields,

never invent missing technical attributes,

fail closed on critical conflicts,

route uncertain cases to review,

expose evidence,

version rules and models,

log all human decisions,

validate units before conversion,

reject invalid numeric specifications cleanly.

LLM extraction must return structured JSON validated against Pydantic schemas.

If the LLM produces invalid/unparseable output, fall back to deterministic extraction or mark the attribute unresolved.

32. REPOSITORY STRUCTURE

Use a clean monorepo:

sih26099/
├── apps/
│   ├── frontend/
│   └── backend/
├── ml/
│   ├── retrieval/
│   ├── extraction/
│   ├── classification/
│   ├── matching/
│   ├── calibration/
│   └── rules/
├── data/
│   ├── raw/
│   │   ├── public_sih26099/
│   │   ├── official_cpse/
│   │   └── synthetic/
│   ├── processed/
│   ├── labels/
│   ├── reference/
│   └── MANIFEST.json
├── database/
│   ├── migrations/
│   └── seed/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── golden_cases/
├── scripts/
├── docs/
├── docker/
├── docker-compose.yml
├── README.md
└── .env.example

33. BUILD ORDER FOR THE AI AGENT

The agent must follow this exact order and should not jump ahead:

1. Repository bootstrap
2. Dataset download + manifest
3. Database schema
4. Ingestion API
5. Data normalization
6. Reference dictionaries
7. Category classifier
8. Attribute extraction
9. Material Fingerprint
10. Vector indexing
11. Candidate retrieval
12. Constraint engine
13. Relationship classifier
14. Explainability/evidence
15. Canonicalization
16. CNMC registry
17. Review workflow
18. Audit trail
19. Procurement analytics
20. Dashboard
21. Export/API hardening
22. Test suite
23. Docker deployment
24. Demo data
25. Final SIH demo flow

At every step, run tests before moving forward.

34. SIH DEMO FLOW — TARGET 5 MINUTES

The live demo should tell a clear story.

Scene 1 — Upload

Upload three datasets:

CPCL.csv
IOCL.csv
NTPC.csv

Scene 2 — AI processing

Show:

Materials ingested
Normalization completed
Fingerprints generated
Candidates retrieved
Matches analyzed

Scene 3 — True equivalent

Show two differently written records that become:

TECHNICALLY_EQUIVALENT

with matched attributes.

Scene 4 — Dangerous false similarity

Show:

GATE VALVE 4 CLASS 150
vs
GATE VALVE 4 CLASS 300

Then show:

Semantic similarity: HIGH
Critical constraint: FAILED
Final: NOT_EQUIVALENT

This is one of the most important demo scenes.

Scene 5 — National mapping

Show:

CPCL-MAT-001
IOCL-MAT-877
NTPC-MAT-991
       ↓
CNMC-00001284

Scene 6 — Human governance

Approve one recommendation and show the audit record.

Scene 7 — Procurement intelligence

Show aggregated demand by CNMC and a potential cross-CPSE consolidation candidate.

35. PPT MESSAGING

Problem

CPSEs may maintain different material codes, descriptions, technical specifications, units, and classifications for identical or equivalent materials, creating duplication, fragmentation, and procurement inefficiency.

Solution

NMIG converts heterogeneous material records into engineering-aware Material Fingerprints, performs semantic + technical-constraint matching, explains each result, and creates a governed common material identity with traceable CPSE mappings.

Key innovation slide

Show only these four:

1. Material Fingerprint

Category-specific technical identity.

2. Constraint-Aware AI Matching

Technical rules override misleading text similarity.

3. Evidence + Counterfactual Explainability

The reviewer can see why a match was accepted or blocked.

4. National Material Intelligence + Procurement Graph

One canonical identity connects legacy codes, specifications, evidence, demand, and procurement opportunities.

Dataset slide

State accurately:

Development dataset: Public CPSE-related material-description corpus from Hugging Face, 21,513 reported main-table records from Oil India, NTPC and IOCL, with supporting normalization/reference tables. Used for development/bootstrap and not represented as official CPSE master data.

Dataset:
https://huggingface.co/datasets/sarthak20024/sih26099-cpse-material-codes

Then state:

Production/validation dataset: Official CPSE Material Master sample to be provided by participating CPSEs.

36. SUCCESS CRITERIA

For the prototype, target measurable technical outcomes rather than arbitrary business claims.

Technical

Material ingestion succeeds on public demo corpus.

Fingerprint generated for the targeted categories.

Candidate retrieval meets target recall on golden dataset.

Pair classification reaches target precision/recall on the labeled evaluation set.

Critical-spec false positive rate is very low and explicitly reported.

Every decision is explainable.

Every approved mapping is auditable.

CNMC mappings are reproducible.

Product

A reviewer can approve/reject an AI recommendation.

A user can inspect the evidence for a decision.

A user can view all CPSE codes mapped to one canonical identity.

A user can export mappings.

Procurement analytics are reproducible from demo transaction data.

SIH demo

The demo must successfully show all of:

Ingest
→ Normalize
→ Fingerprint
→ Retrieve
→ Compare
→ Detect conflict/equivalence
→ Explain
→ Review
→ CNMC
→ Legacy mapping
→ Procurement insight

37. WHAT NOT TO CLAIM

Do not claim:

official CPSE data when using public data,

production SAP integration without access/testing,

actual procurement savings without real transactions,

universal equivalence across all engineering categories without evaluation,

full legal/regulatory compliance without assessment,

privacy guarantees merely because embeddings are used,

that an LLM alone determines engineering interchangeability.

38. OPTIONAL FUTURE EXTENSIONS

Only after P0 is stable:

Federated/private CPSE deployment.

OCR for scanned legacy catalogs.

Multilingual material descriptions.

Enterprise SSO.

SAP/ERP real connectors.

GeM integration.

Standards dictionary integration.

Dedicated graph database.

Active-learning model retraining pipeline.

Enterprise-scale distributed inference.

39. FINAL DIFFERENTIATION STATEMENT

Use this as the canonical project description:

NMIG is a specification-aware National Material Intelligence Platform that transforms heterogeneous CPSE material records into category-specific Material Fingerprints and uses a hybrid semantic + engineering-constraint engine to distinguish true technical equivalence from superficial textual similarity. Every decision is supported by attribute-level evidence and counterfactual explanations, uncertain cases are routed to human review, approved equivalence groups receive a governed Common National Material Code with full legacy traceability, and the resulting national material graph powers cross-CPSE procurement aggregation and rationalization intelligence.

40. FINAL ACCEPTANCE CHECKLIST

The implementation is ready for SIH demo only when all mandatory boxes are true:

Data

Public Hugging Face dataset downloaded.

Dataset revision/hash recorded.

Raw data preserved.

Source provenance retained.

Official-data override path exists.

Synthetic demo dataset exists.

Labeled evaluation pairs exist.

AI

Normalization works.

Category classification works.

Fingerprint extraction works.

Embedding retrieval works.

Fuzzy retrieval works.

Critical constraint engine works.

Four-way decision model works.

Missing-data handling works.

Explainability works.

Counterfactual explanation works.

Governance

CNMC proposal works.

Human review works.

Mapping works.

Audit trail works.

Hash-chain verification works.

Product

Dashboard works.

Match Center works.

Material 360 works.

Procurement Intelligence works.

Export works.

API works.

Engineering

Unit tests pass.

Integration tests pass.

Golden match cases pass.

Critical-conflict cases pass.

Docker Compose launches the complete system.

.env.example exists.

README contains setup and demo instructions.

SIH demo

True equivalence example works.

Critical-conflict example works.

Functional-alternative example works.

Insufficient-data example works.

Multiple CPSE codes map to one CNMC.

Procurement aggregation example works.

Every PPT claim can be demonstrated from the running system.

41. RESEARCH SOURCES

Official / primary problem context

SIH Problem Statement 26099: use the official SIH/CPCL problem statement supplied with the project.

Public development dataset

Hugging Face: https://huggingface.co/datasets/sarthak20024/sih26099-cpse-material-codes

Enterprise MDM benchmark/context

SAP MDG Material Governance: https://help.sap.com/docs/SAP_ERP/f184745abebf416bb931952badbfa43c/c4e5d8c1a84c41a39eedde2f9c6e45aa.html

SAP MDG Consolidation/Matching: https://help.sap.com/docs/SAP_MASTER_DATA_GOVERNANCE/e605401fa254458cbe47498c514d42ce/575820575b59e974e10000000a4450e5.html

SAP Configure Matching: https://help.sap.com/docs/SAP_MASTER_DATA_GOVERNANCE/6b8255b03aa44628880b5b71c16ddb91/1ecb69568fb4c359e10000000a441470.html

Public SIH project references reviewed for competitive context

https://github.com/rohinish-singh/OneMate

https://github.com/kousikan17/material-harmonization

These references are for competitive/architecture awareness only. Do not copy implementations, claims, or branding.

42. FINAL INSTRUCTION TO THE BUILD AGENT

Build the solution in this order:

DATA FOUNDATION
→ MATERIAL FINGERPRINT
→ CATEGORY-AWARE EXTRACTION
→ VECTOR CANDIDATE RETRIEVAL
→ TECHNICAL CONSTRAINT ENGINE
→ EXPLAINABLE EQUIVALENCE DECISION
→ CANONICAL MATERIAL + CNMC
→ HUMAN REVIEW + AUDIT
→ PROCUREMENT INTELLIGENCE
→ DASHBOARD/API
→ TESTING/DOCKER

Do not begin with a chatbot.

Do not begin with a large model.

Do not begin with SAP integration.

Do not begin with federated learning.

First make this workflow work:

CSV → normalized material → fingerprint → candidate → technical decision → explanation → human approval → canonical material → CNMC → legacy mapping.

Only after that workflow is stable should optional enterprise features be added.

The final product must feel like a material-intelligence and governance system, not an AI demo wrapped in a dashboard.