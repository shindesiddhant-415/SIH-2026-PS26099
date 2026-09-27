# NMIG - National Material Intelligence & Harmonization Platform

## Overview
NMIG is an AI-powered platform designed to standardize and harmonize material codes across Central Public Sector Enterprises (CPSEs). The platform addresses the challenge of inconsistent material master data by providing intelligent matching, duplicate detection, and material clustering capabilities.

This repository contains the backend API (FastAPI) and frontend (React + Vite) implementations, chosen for rapid prototyping to focus on validating the core AI innovation for SIH 26099.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Frontend Guide](#frontend-guide)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Functionality
- **Material Fingerprinting**: Convert free-text material descriptions into structured engineering identities
- **Intelligent Matching**: Hybrid AI approach (70% technical identity + 30% semantic similarity) to determine material equivalence
- **Duplicate Detection**: Identify duplicate, near-duplicate, and functionally similar materials in bulk datasets
- **Material Clustering**: Group similar materials for efficient review and standardization initiatives
- **CPSE Mapping**: Map legacy CPSE material codes to a Common National Material Code (CNMC)
- **Audit Trail**: Track all decisions and changes for governance and compliance
- **Analytics Dashboard**: Visualize matching results, duplication rates, and standardization progress

### User Experience
- Clean, light-themed interface designed for professional use (React + Vite-based)
- Responsive layout suitable for various screen sizes
- Intuitive workflow from data input to results analysis
- Interactive visualizations and detailed result explanations
- Export capabilities for reports and processed data

### Technical Capabilities
- RESTful API backend built with FastAPI for high performance
- React + Vite frontend for modern, responsive user interface
- Docker-ready for easy deployment and scaling
- Comprehensive test coverage planned for production
- Secure by design with authentication hooks ready for implementation

## Architecture

### System Overview
```
┌─────────────────┐    ┌──────────────┐    ┌──────────────────────┐
│   Frontend      │◄──►│   API Layer  │◄──►│   AI Matching Engine   │
│  (React + Vite) │    │  (FastAPI)   │    │  (Python/ML)           │
└─────────────────┘    └──────────────┘    └──────────────────────┘
        │                         │                         │
        ▼                         ▼                         ▼
┌─────────────────┐    ┌──────────────┐    ┌──────────────────────┐
│   User Interface│    │  Request/    │    │  Material Fingerprint  │
│    Components   │    │   Response   │    │  Generation            │
└─────────────────┘    └──────────────┘    └──────────────────────┘
        │                         │                         │
        ▼                         ▼                         ▼
┌─────────────────┐    ┌──────────────┐    ┌──────────────────────┐
│   State Mgmt    │    │  Validation  │    │  Similarity Scoring    │
│   (React)       │    │  & Parsing   │    │  (Technical + Semantic)│
└─────────────────┘    └──────────────┘    └──────────────────────┘
```

### Data Flow
1. **Input**: User uploads CSV/XLSX or enters material descriptions manually via React + Vite interface
2. **Preprocessing**: Frontend validates and formats data for API consumption
3. **API Request**: Requests sent to backend endpoints (`/fingerprint`, `/match`, etc.)
4. **Processing**: 
   - Material Fingerprint generation from descriptions
   - Technical attribute extraction and normalization
   - Semantic embedding using sentence-transformers
   - Hybrid scoring calculation (70% technical weight, 30% semantic weight)
5. **Response**: API returns detailed match results with explanations
6. **Presentation**: React + Vite visualizes results with clear classifications and actionable insights

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **AI/ML**: 
  - Sentence-Transformers (all-MiniLM-L6-v2) for semantic understanding
  - Scikit-learn for utility functions
  - Custom rule-based technical attribute parser
- **Data Processing**: Pandas for data manipulation
- **API**: RESTful with OpenAPI/Swagger documentation
- **Other**: Uvicorn (ASGI server), Python-dotenv for configuration

### Frontend
- **Framework**: React 18 with Vite build tool
- **Styling**: Custom CSS with CSS variables defining a professional light theme
- **Components**: Custom React components with functional programming approach
- **State Management**: React Hooks (useState, useEffect) for component state
- **Routing**: React Router v6 for client-side navigation
- **HTTP Client**: Fetch API for communication with backend services
- **Data Visualization**: Customizable chart components (optional enhancement)
- **Utilities**: Date formatting, number formatting, string utilities

### Development Tools
- **Package Manager**: pip (Python) and npm/yarn/pnpm (JavaScript/TypeScript)
- **Development Server**: 
  - Backend: Uvicorn with hot reload
  - Frontend: Vite dev server with hot module replacement
- **Linting**: 
  - Backend: Flake8 (planned)
  - Frontend: ESLint (planned)
- **Formatting**: 
  - Backend: Black (planned)
  - Frontend: Prettier (planned)
- **Testing**: 
  - Backend: Pytest
  - Frontend: Jest + React Testing Library (planned)

## Installation

### Prerequisites
- Python (v3.8 or higher)
- Git
- pip (comes with Python)

### Backend Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nmig-prototype
   ```

2. Create and activate a virtual environment (recommended):
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # Linux/MacOS
   python -m venv venv
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. Set up environment variables (create `.env` file in backend directory):
   ```env
   # Backend Configuration
   API_HOST=0.0.0.0
   API_PORT=8000
   DEBUG=True
   
   # Optional: Hugging Face Hub token for model downloads (if needed in restricted networks)
   # HF_TOKEN=your_token_here
   ```

### Frontend Setup
1. The frontend uses the same Python environment as the backend for API communication
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
   (or `yarn install` or `pnpm install` if preferred)
3. Set up environment variables (create `.env` file in frontend directory if needed):
   ```env
   # Frontend Configuration
   VITE_API_URL=http://localhost:8000
   ```

### Environment Variables
Both backend and frontend automatically detect configuration from the `.env` file in the backend directory or system environment variables.

## Usage

### Development Mode
1. Start the backend API server:
   ```bash
   # From the project root
   cd backend
   uvicorn api.main:app --reload --port 8000
   ```
   The API will be available at `http://localhost:8000`

2. Start the React + Vite frontend:
   ```bash
   # From the project root
   cd frontend
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173` (or another port if 5173 is in use)

### Production Build
1. For production deployment, you can:
   - Run both services with a process manager like supervisord or Docker
   - Or bundle them together in a single deployment unit
   
2. To build the frontend for production:
   ```bash
   # From the frontend directory
   npm run build
   ```
   This will create optimized production assets in the `dist` directory
   
3. Example Docker deployment:
   ```bash
   # Build the Docker image
   docker build -t nmig-platform .
   
   # Run the container
   docker run -p 8000:8000 -p 5173:5173 nmig-platform
   ```

4. Access the application:
   - API: `http://localhost:8000`
   - Frontend: `http://localhost:5173`

## API Documentation

Once the backend is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Key Endpoints

#### Material Fingerprinting
- **POST** `/fingerprint`
  - Generate a Material Fingerprint from a description
  - Request: `{"description": "BALL VL 2 IN CL300"}`
  - Response: Fingerprint object with technical attributes

#### Material Matching
- **POST** `/match`
  - Compare two materials for similarity and technical identity
  - Request: `{"description_1": "...", "description_2": "..."}`
  - Response: Detailed match analysis with scores and classification

#### Duplicate Detection
- **POST** `/duplicates`
  - Find duplicate materials in a list
  - Request: `[{"description": "..."}, {"description": "..."}]`
  - Response: List of duplicate pairs with scores and metadata

#### Material Clustering
- **POST** `/cluster`
  - Cluster similar materials into groups
  - Request: `[{"description": "..."}, {"description": "..."}]`
  - Response: Clustered groups with representative materials

#### System
- **GET** `/health` - Health check
- **GET** `/stats` - API usage statistics

## Frontend Guide

### Navigation
The frontend consists of six main sections accessible via the sidebar:
1. **Dashboard** - Overview of system status and key metrics
2. **Material Matching** - Compare two materials side-by-side
3. **Duplicate Detection** - Find duplicates in bulk datasets
4. **Material Clustering** - Group similar materials for standardization
5. **API Explorer** - Test and examine API endpoints directly
6. **Documentation** - User guide, API reference, and FAQ

### Light Theme Design
The frontend features a custom light theme designed specifically for professional enterprise use:

#### Color Palette
- **Primary**: #1f77b4 (a professional blue that conveys trust and stability)
- **Secondary**: #ff7f0e (orange for highlights and calls-to-action)
- **Background**: #ffffff (clean white for maximum readability)
- **Surface**: #f8f9fa (light gray for cards and containers)
- **Text**: 
  - Primary: #212529 (dark gray for body text)
  - Secondary: #6c757d (muted gray for supplementary text)
  - Success: #28a745 (green for positive actions)
  - Warning: #ffc107 (yellow for cautionary notes)
  - Info: #17a2b8 (cyan for informational content)
  - Danger: #dc3545 (red for errors and critical alerts)

#### Typography
- **Font Family**: System UI font stack for native rendering and performance
- **Heading Weights**: Bold for hierarchy and emphasis
- **Body Text**: Optimized line height and letter spacing for readability
- **Responsive Scaling**: Fluid type scaling based on viewport size

#### Components
- **Cards**: Elevated containers with subtle shadows and borders
- **Buttons**: 
  - Primary: Solid background with hover/lift effects
  - Secondary: Outline style for less prominent actions
  - Icon-only: For toolbar actions and toggles
- **Forms**: 
  - Input fields with clear focus states
  - Validation states (success/error) with inline messaging
  - Grouped fields with logical spacing
- **Tables**: 
  - Striped rows for readability
  - Hover states for interactivity
  - Sorting indicators and pagination controls
- **Charts and Visualizations**: 
  - Custom-built for brand consistency
  - Tooltips with detailed information on hover
  - Responsive containers that adapt to available space

#### Layout Principles
- **Whitespace**: Generous padding and margins for visual breathing room
- **Alignment**: Consistent grid-based alignment throughout
- **Hierarchy**: Clear visual hierarchy guiding user attention to primary actions
- **Feedback**: Immediate visual feedback for all interactive elements
- **Accessibility**: 
  - Sufficient color contrast (WCAG AA compliant)
  - Keyboard navigable interface
  - ARIA labels where native semantics are insufficient
  - Focus outlines visible for keyboard users

### User Workflows

#### Material Matching Workflow
1. Navigate to "Material Matching" from sidebar
2. Enter first material description in the left textarea
3. Enter second material description in the right textarea
4. Click "Analyze Match" button
5. View results:
   - Score breakdown (technical, semantic, combined)
   - Match classification with color-coded confidence indicator
   - Detailed fingerprint comparison for both materials
   - Plain-language explanation of the matching decision
   - Suggested actions based on result (approve, review, etc.)

#### Duplicate Detection Workflow
1. Navigate to "Duplicate Detection" from sidebar
2. Choose input method: Text Area or CSV Upload
3. For Text Area: Enter descriptions (one per line)
4. For CSV Upload: 
   - Select CSV file
   - Choose column containing descriptions
   - Preview data before processing
5. Adjust similarity threshold slider if needed (default: 0.8)
6. Click "Find Duplicates" button
7. View results:
   - Summary statistics (total pairs analyzed, duplicates found, duplication rate)
   - Interactive table of duplicate pairs with scores and match types
   - Detailed analysis view for selected pairs
   - Review workflow simulation (auto-approved vs. requires human review)
   - Export options for results

#### Material Clustering Workflow
1. Navigate to "Material Clustering" from sidebar
2. Choose input method: Text Area or CSV Upload (same as Duplicate Detection)
3. Optionally adjust clustering parameters:
   - Minimum cluster size (default: 2)
   - Similarity method (Hybrid/Technical/Semantic)
4. Click "Perform Clustering" button
5. View results:
   - Summary statistics (total materials, clusters formed, average cluster size)
   - Expandable cluster cards sorted by size (largest first)
   - For each cluster:
     - List of materials with original indices
     - Suggested common characteristics
     - Action buttons (Review, Assign CNMC, Export Cluster)
6. Identify and handle singleton items (potential outliers or unique materials)

#### API Explorer Workflow
1. Navigate to "API Explorer" from sidebar
2. Select an endpoint from the dropdown menu
3. Fill in required parameters based on endpoint selection:
   - Fingerprint: Single material description
   - Match: Two material descriptions
   - Duplicates/Cluster: List of descriptions (one per line)
   - Stats/Health: No parameters required
4. Click "Execute Request" button
5. View response:
   - Formatted JSON response with syntax highlighting
   - Timestamp of request execution
   - Options to copy or download the response
   - Button to retry the request

### Customization and Extension
The frontend is designed for easy customization and extension:

#### Styling
- All colors defined as CSS variables in `frontend/src/styles/index.css`
- To change the theme, modify the CSS variables
- Component-specific styles are scoped to prevent leakage

#### Component Library
- UI elements are organized logically in the React component hierarchy
- Reusable components can be extracted to shared components
- Each component follows consistent naming and parameter patterns

#### State Management
- Uses React's useState and useContext hooks for component state
- For complex state sharing, consider using React Context or state management libraries
- As the application grows, evaluate advanced state management solutions like Redux or Zustand

#### API Integration
- All API calls are centralized in helper functions
- Easy to modify base URL or add interceptors for authentication/auth
- Consistent error handling and loading states across all service calls

## Project Structure
```
nmig-prototype/
├── backend/
│   ├── api/
│   │   ├── main.py           # FastAPI application entry point
│   │   └── ...               # Other API modules (routers, dependencies, etc.)
│   ├── models/
│   │   ├── material_fingerprint.py   # Material Fingerprint class and normalizer
│   │   └── ...               # Other data models
│   ├── services/
│   │   ├── matching_engine.py  # Core AI matching logic
│   │   └── ...               # Other business logic services
│   ├── utils/
│   │   ├── download_dataset.py # Utility for downloading sample datasets
│   │   └── ...               # Other utility functions
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── src/
│   │   ├── App.jsx           # Main React application
│   │   ├── main.jsx          # React entry point
│   │   ├── components/       # React components
│   │   │   ├── APIExplorer.jsx
│   │   │   ├── Clustering.jsx
│   │   │   ├── Documentation.jsx
│   │   │   ├── DuplicateDetection.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── Matching.jsx
│   │   ├── services/         # Service layers
│   │   │   └── api.js        # API service
│   │   └── styles/           # CSS styles
│   │       └── index.css     # Main stylesheet with CSS variables
│   ├── package.json          # Frontend dependencies and scripts
│   └── vite.config.js        # Vite configuration
├── README.md                 # This file
└── ...                       # Other configuration files
```

## API Endpoint Details

### POST /fingerprint
Generate a Material Fingerprint from a free-text description.

**Request Body:**
```json
{
  "description": "string (required)"
}
```

**Response Body:**
```json
{
  "description": "string (echoed input)",
  "fingerprint": {
    "category": "string or null",
    "subtype": "string or null",
    "nominal_size": "string or null",
    "size_unit": "string or null",
    "pressure_class": "string or null",
    "pressure_unit": "string or null",
    "material_grade": "string or null",
    "material_type": "string or null",
    "end_connection": "string or null",
    "facing_type": "string or null",
    "schedule": "string or null",
    "standard": "string or null",
    "description_original": "string (echoed input)"
  }
}
```

### POST /match
Compare two materials for similarity and technical identity.

**Request Body:**
```json
{
  "description_1": "string (required)",
  "description_2": "string (required)"
}
```

**Response Body:**
```json
{
  "description_1": "string",
  "description_2": "string",
  "fingerprint_1": { /* Fingerprint object */ },
  "fingerprint_2": { /* Fingerprint object */ },
  "technical_score": "number (0-1)",
  "semantic_score": "number (0-1)",
  "combined_score": "number (0-1)",
  "match_type": "string (one of: TECHNICAL_IDENTICAL, TECHNICAL_EQUIVALENT, FUNCTIONALLY_SIMILAR, SEMANTICALLY_RELATED, NOT_MATCH)",
  "confidence": "string (one of: HIGH, MEDIUM_HIGH, MEDIUM, LOW_MEDIUM, LOW)",
  "is_match": "boolean",
  "technical_identity": "boolean",
  "requires_human_review": "boolean"
}
```

### POST /duplicates
Find duplicate materials in a list of descriptions.

**Request Body:**
```json
[
  {
    "description": "string (required)"
  },
  ...
]
```

**Response Body:**
```json
{
  "duplicates": [
    {
      "index_1": "integer",
      "index_2": "integer",
      "description_1": "string",
      "description_2": "string",
      "combined_score": "number (0-1)",
      "match_type": "string (same as above)",
      "confidence": "string (same as above)"
    }
  ],
  "total_pairs_checked": "integer"
}
```

### POST /cluster
Cluster similar materials into groups.

**Request Body:** Same as `/duplicates`

**Response Body:**
```json
{
  "clusters": {
    "integer (cluster ID)": [
      "string (material description)",
      ...
    ],
    ...
  },
  "total_clusters": "integer"
}
```

### GET /health
Check API health status.

**Response Body:**
```json
{
  "status": "string (healthy/unhealthy)",
  "service": "string",
  "version": "string"
}
```

### GET /stats
Get API usage statistics.

**Response Body:**
```json
{
  "matcher_initialized": "boolean",
  "technical_weight": "number (0-1)",
  "semantic_weight": "number (0-1)",
  "similarity_threshold": "number (0-1)",
  "cached_fingerprints": "integer",
  "cached_embeddings": "integer"
}
```

## Data Models

### Material Fingerprint
A structured representation of a material's engineering identity, containing:
- **category**: Primary material type (VALVE, PIPE, FLANGE, etc.)
- **subtype**: Specific type within category (GATE_VALVE, BALL_VALVE, etc.)
- **nominal_size**: Size dimension value
- **size_unit**: Unit of size measurement (INCH, MM, NB, etc.)
- **pressure_class**: Pressure rating value
- **pressure_unit**: Unit of pressure measurement (PSI, BAR, etc.)
- **material_grade**: Specific material grade/alloy
- **material_type**: Base material type (CS, SS, etc.)
- **end_connection**: Connection type (WELD_NECK, THREADED, etc.)
- **facing_type**: Flange facing type (RF, FF, RTJ, etc.)
- **schedule**: Pipe schedule number (for pipes)
- **standard**: Applicable standard (ANSI, ASME, ISO, etc.)
- **description_original**: Original input description

### Match Result
Result of comparing two materials:
- **technical_score**: Similarity based on technical attributes (0-1)
- **semantic_score**: Similarity based on meaning/description (0-1)
- **combined_score**: Weighted combination (default 0.7*technical + 0.3*semantic)
- **match_type**: Categorization of the relationship
- **confidence**: qualitative assessment of result reliability
- **is_match**: Boolean indicating if materials are considered a match
- **technical_identity**: Boolean indicating if technical specs are identical
- **requires_human_review**: Flag indicating if expert review is recommended

## Contributing

### Reporting Issues
Please use the GitHub Issues tracker to report bugs or suggest features. When reporting issues, include:
- Clear description of the problem
- Steps to reproduce (if applicable)
- Expected vs. actual behavior
- Screenshots or logs if relevant
- Environment information (Python version, etc.)

### Development Guidelines
1. Fork the repository and create a new branch for your feature/bugfix
2. Follow the existing code style and conventions
3. Write clear, descriptive commit messages
4. Update documentation as needed
5. Submit a pull request with a detailed description of changes

### Coding Standards
- **Backend (Python)**:
  - Follow PEP 8 style guide
  - Use type hints for function signatures
  - Write docstrings for all public functions and classes
  - Keep functions focused and under 50 lines when possible
- **Frontend (JavaScript/React)**:
  - Follow ESLint and Prettier guidelines
  - Use clear, descriptive function and variable names
  - Keep functions focused and under 50 lines when possible
  - Comment complex logic but avoid over-commenting obvious code
  - Follow React best practices for component design and state management

### Pull Request Process
1. Ensure your code passes any existing tests
2. Update documentation to reflect changes
3. Describe the changes in detail in the pull request
4. Reference any related issues
5. Await review from maintainers
6. Address review feedback promptly
7. Maintainers will merge approved changes

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Central Public Sector Enterprises (CPSEs) for providing the problem domain and use cases
- Ministry of Petroleum & Natural Gas (MoPNG) for sponsorship and guidance
- Chennai Petroleum Corporation Limited (CPCL) for domain expertise and data sources
- The open-source community for the fantastic tools and libraries that made this possible:
  - FastAPI team for the excellent API framework
  - React team for the powerful UI library
  - Vite team for the lightning-fast build tool
  - Hugging Face for state-of-the-art NLP models
  - Scikit-learn and Pandas teams for data science utilities
  - countless other open-source contributors

## Contact
For questions, support, or collaboration opportunities related to the NMIG Platform:
- Email: support@nmig.platform
- Website: https://nmig.platform
- Documentation: https://docs.nmig.platform
- Issue Tracker: https://github.com/yourorg/nmig/issues

---
*Documentation last updated: September 27, 2026*
*Platform Version: 1.0.0*
*Frontend: React + Vite (chosen for modern, responsive user interface)*