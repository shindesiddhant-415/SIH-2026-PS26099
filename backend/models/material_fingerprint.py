"""
Material Fingerprint Model
Converts free-text/material records into structured, category-aware engineering identities.
"""

import pandas as pd
import re
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict, fields
import logging
from enum import Enum

logger = logging.getLogger(__name__)

class MaterialCategory(Enum):
    """Supported material categories."""
    VALVE = "VALVE"
    PIPE = "PIPE"
    FLANGE = "FLANGE"
    CABLE = "CABLE"
    BEARING = "BEARING"
    GASKET = "GASKET"
    BOLT = "BOLT"
    NUT = "NUT"
    WASHER = "WASHER"
    ELBOW = "ELBOW"
    TEE = "TEE"
    REDUCER = "REDUCER"
    CAP = "CAP"
    PLUG = "PLUG"
    UNKNOWN = "UNKNOWN"

@dataclass
class MaterialFingerprint:
    """Structured representation of a material's engineering identity."""
    # Core identification fields
    category: str
    description_original: str = ""

    # Common technical fields (used across multiple categories)
    subtype: Optional[str] = None
    nominal_size: Optional[str] = None
    size_unit: Optional[str] = None
    pressure_class: Optional[str] = None
    pressure_unit: Optional[str] = None
    material_grade: Optional[str] = None
    material_type: Optional[str] = None
    end_connection: Optional[str] = None
    facing_type: Optional[str] = None
    schedule: Optional[str] = None
    standard: Optional[str] = None

    # Category-specific fields
    # Valve-specific
    actuation: Optional[str] = None
    trim: Optional[str] = None
    body_material: Optional[str] = None

    # Pipe-specific
    coating: Optional[str] = None
    lining: Optional[str] = None

    # Cable-specific
    voltage: Optional[str] = None
    conductor_material: Optional[str] = None
    core_count: Optional[str] = None
    cross_section: Optional[str] = None
    insulation: Optional[str] = None
    sheath: Optional[str] = None
    application: Optional[str] = None

    # Bearing-specific
    bore: Optional[str] = None
    outer_diameter: Optional[str] = None
    width: Optional[str] = None
    bearing_type: Optional[str] = None
    seal_type: Optional[str] = None
    clearance: Optional[str] = None
    lubrication: Optional[str] = None

    # Gasket-specific
    inner_diameter: Optional[str] = None
    outer_diameter: Optional[str] = None
    thickness: Optional[str] = None
    gasket_material: Optional[str] = None
    pressure_rating: Optional[str] = None
    temperature_rating: Optional[str] = None

    # Bolt/Nut/Washer/Welding specific
    diameter: Optional[str] = None
    length: Optional[str] = None
    thread_pitch: Optional[str] = None
    strength_grade: Optional[str] = None
    finish: Optional[str] = None
    head_type: Optional[str] = None
    nut_type: Optional[str] = None
    washer_type: Optional[str] = None

    # Elbow/Tee/Reducer/Cap/Plug specific
    angle: Optional[str] = None
    radius: Optional[str] = None
    branch_size: Optional[str] = None
    reduction: Optional[str] = None
    plug_type: Optional[str] = None
    cap_type: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary, excluding None values."""
        return {k: v for k, v in asdict(self).items() if v is not None}

    def to_comparison_dict(self) -> Dict[str, Any]:
        """Get dict for comparison purposes - only technical fields that matter for equivalence."""
        # These are the fields that determine technical equivalence
        comparison_fields = [
            'category', 'subtype', 'nominal_size', 'size_unit', 'pressure_class',
            'pressure_unit', 'material_grade', 'material_type', 'end_connection',
            'facing_type', 'schedule', 'standard', 'actuation', 'trim', 'body_material',
            'coating', 'lining', 'voltage', 'conductor_material', 'core_count',
            'cross_section', 'insulation', 'sheath', 'application', 'bore',
            'outer_diameter', 'width', 'bearing_type', 'seal_type', 'clearance',
            'lubrication', 'inner_diameter', 'outer_diameter', 'thickness',
            'gasket_material', 'pressure_rating', 'temperature_rating',
            'diameter', 'length', 'thread_pitch', 'strength_grade', 'finish',
            'head_type', 'nut_type', 'washer_type', 'angle', 'radius',
            'branch_size', 'reduction', 'plug_type', 'cap_type'
        ]
        return {k: self.to_dict()[k] for k in comparison_fields if k in self.to_dict() and self.to_dict()[k] is not None}

    def get_category_enum(self) -> MaterialCategory:
        """Get the MaterialCategory enum for this fingerprint."""
        try:
            return MaterialCategory(self.category.upper())
        except ValueError:
            return MaterialCategory.UNKNOWN

class MaterialNormalizer:
    """Normalizes material descriptions using reference tables."""

    def __init__(self, reference_data_path: str = "data/processed/extracted_items/"):
        self.reference_data_path = reference_data_path
        self.abbreviations = {}
        self.grades = {}
        self.pressure_classes = {}
        self.unit_normalization = {}
        self.material_categories = {}
        self.category_patterns = {}
        self._load_reference_data()
        self._build_category_patterns()

    def _load_reference_data(self):
        """Load all reference CSV files."""
        try:
            # Load abbreviations
            abbrev_df = pd.read_csv(f"{self.reference_data_path}material_abbreviations.csv")
            for _, row in abbrev_df.iterrows():
                self.abbreviations[row['abbreviation'].upper()] = {
                    'full_form': row['full_form'],
                    'category': row['category']
                }

            # Load grades
            grades_df = pd.read_csv(f"{self.reference_data_path}material_grades.csv")
            for _, row in grades_df.iterrows():
                self.grades[row['grade'].upper()] = row['description']

            # Load pressure classes
            pressure_df = pd.read_csv(f"{self.reference_data_path}pressure_classes.csv")
            for _, row in pressure_df.iterrows():
                self.pressure_classes[str(row['pressure_class'])] = row['description']

            # Load unit normalization
            unit_df = pd.read_csv(f"{self.reference_data_path}unit_normalisation.csv")
            for _, row in unit_df.iterrows():
                self.unit_normalization[row['unit'].upper()] = {
                    'standard_unit': row['standard_unit'],
                    'conversion_factor': float(row['conversion_factor']) if 'conversion_factor' in row else 1.0
                }

            # Load material categories
            categories_df = pd.read_csv(f"{self.reference_data_path}material_categories.csv")
            for _, row in categories_df.iterrows():
                self.material_categories[row['category'].upper()] = {
                    'description': row['description'],
                    'attributes': row['attributes'].split('|')
                }

            logger.info("Reference data loaded successfully")
        except Exception as e:
            logger.warning(f"Could not load reference data: {e}. Using empty dictionaries.")
            self.abbreviations = {}
            self.grades = {}
            self.pressure_classes = {}
            self.unit_normalization = {}
            self.material_categories = {}

    def _build_category_patterns(self):
        """Build regex patterns for category detection."""
        # Define keywords that strongly indicate each category
        self.category_patterns = {
            MaterialCategory.VALVE: [
                r'\bVALVE\b', r'\bVLV\b', r'\bVL\b', r'\bGATE\b', r'\bBALL\b', r'\bGLobe\b',
                r'\bCHECK\b', r'\bBUTTERFLY\b', r'\bDIAPHRAGM\b', r'\bPLUG\b', r'\bNEEDLE\b'
            ],
            MaterialCategory.PIPE: [
                r'\bPIPE\b', r'\bTUBE\b', r'\bPIPING\b'
            ],
            MaterialCategory.FLANGE: [
                r'\bFLANGE\b', r'\bFLG\b'
            ],
            MaterialCategory.CABLE: [
                r'\bCABLE\b', r'\bWIRE\b', r'\bCONDUCTOR\b'
            ],
            MaterialCategory.BEARING: [
                r'\bBEARING\b', r'\bBRG\b'
            ],
            MaterialCategory.GASKET: [
                r'\bGASKET\b', r'\bGSKT\b'
            ],
            MaterialCategory.BOLT: [
                r'\bBOLT\b', r'\bBLT\b'
            ],
            MaterialCategory.NUT: [
                r'\bNUT\b'
            ],
            MaterialCategory.WASHER: [
                r'\bWASHER\b', r'\bWSHR\b'
            ],
            MaterialCategory.ELBOW: [
                r'\bELBOW\b', r'\bELL\b', r'\bEL\b'
            ],
            MaterialCategory.TEE: [
                r'\bTEE\b', r'\bT\b'
            ],
            MaterialCategory.REDUCER: [
                r'\bREDUCER\b', r'\bRED\b'
            ],
            MaterialCategory.CAP: [
                r'\bCAP\b'
            ],
            MaterialCategory.PLUG: [
                r'\bPLUG\b'
            ]
        }

    def normalize_description(self, description: str) -> str:
        """Normalize a material description by expanding abbreviations and standardizing format."""
        if not description or not isinstance(description, str):
            return ""

        # Convert to uppercase for processing
        normalized = description.upper().strip()
        # Replace double quotes with " IN " to handle inch symbols
        normalized = normalized.replace('"', ' IN ')

        # Expand known abbreviations
        for abbrev, info in self.abbreviations.items():
            # Use lookarounds to ensure we match whole words, allowing digits after
            pattern = r'(?<![a-zA-Z])' + re.escape(abbrev) + r'(?![a-zA-Z])'
            normalized = re.sub(pattern, info['full_form'], normalized)
        return normalized.strip()
        for abbrev, info in self.abbreviations.items():
            # Use word boundaries to avoid partial replacements
            pattern = r'\b' + re.escape(abbrev) + r'\b'
            normalized = re.sub(pattern, info['full_form'], normalized)

        # Normalize units and spacing
        normalized = re.sub(r'\s+', ' ', normalized)  # Multiple spaces to single
        normalized = re.sub(r'[^\w\s\-/"]', '', normalized)  # Remove special chars except useful ones

        return normalized.strip()

    def detect_category(self, description: str) -> MaterialCategory:
        """Detect the material category from description."""
        if not description:
            return MaterialCategory.UNKNOWN

        desc_upper = description.upper()

        # Check each category's patterns
        for category, patterns in self.category_patterns.items():
            for pattern in patterns:
                if re.search(pattern, desc_upper):
                    return category

        # Fallback: try to extract first word as category
        words = description.split()
        if words:
            first_word = words[0].upper()
            try:
                return MaterialCategory(first_word)
            except ValueError:
                pass

        return MaterialCategory.UNKNOWN

    def parse_technical_attributes(self, description: str) -> Dict[str, Optional[str]]:
        """Parse technical attributes from a normalized description."""
        # Start with all attributes as None
        attrs = {f.name: None for f in fields(MaterialFingerprint) if f.name not in ['category', 'description_original']}

        if not description:
            return attrs

        # Extract nominal size and unit (patterns like "2 INCH", "2\"", "50 NB")
        size_patterns = [
            r'(\d+(?:\.\d+)?)\s*(INCH|\")',  # 2 INCH or 2"
            r'(\d+(?:\.\d+)?)\s*(MM|MILLIMETERS?)',  # 50 MM
            r'(\d+(?:\.\d+)?)\s*(NB|NOMINAL\s+BORE)',  # 20 NB
            r'(\d+(?:\.\d+)?)\s*(DN|DIAMETRE\s+NOMINAL)',  # DN50
        ]

        for pattern in size_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['nominal_size'] = match.group(1)
                attrs['size_unit'] = match.group(2)
                break

        # Extract pressure class (patterns like "CL 150", "CLASS 300", "PN 16")
        pressure_patterns = [
            r'(?:CL|CLASS)\s*(\d+)',  # CL 150, CLASS 300
            r'(?:PN)\s*(\d+)',       # PN 16
            r'(?:#)\s*(\d+)',        # #150
        ]

        for pattern in pressure_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['pressure_class'] = match.group(1)
                # Try to determine unit
                if 'PN' in pattern:
                    attrs['pressure_unit'] = 'BAR'
                elif '#' in pattern:
                    attrs['pressure_unit'] = 'PSI'
                else:
                    attrs['pressure_unit'] = 'PSI'  # Default for CLASS
                break

        # Extract schedule (for pipes)
        schedule_match = re.search(r'(?:SCH|SCHEDULE)\s*(\d+)', description)
        if schedule_match:
            attrs['schedule'] = schedule_match.group(1)

        # Extract material grade/type
        grade_patterns = [
            r'\b(SS|STAINLESS\s+STEEL)\s*(\d+(?:\.\d+)?)\b',  # SS 304, SS 316L
            r'\b(CS|CARBON\s+STEEL)\b',  # CS
            r'\b(GI|GALVANIZED\s+IRON)\b',  # GI
            r'\b(CI|CAST\s+IRON)\b',  # CI
            r'\b(WCB|WROUGHT\s+CARBON\s+STEEL)\b',  # WCB
            r'\b(LCB|LOW\s+CARBON\s+BRONZE)\b',  # LCB
            r'\b(CF8|STAINLESS\s+STEEL\s+GRADE\s+8)\b',  # CF8
            r'\b(CF8M|STAINLESS\s+STEEL\s+GRADE\s+8M)\b',  # CF8M
            r'\b(BR|BRASS)\b',  # Brass
            r'\b(BRZ|BRONZE)\b',  # Bronze
            r'\b(AL|ALUMINUM)\b',  # Aluminum
            r'\b(CU|COPPER)\b',  # Copper
            r'\b(TI|TITANIUM)\b',  # Titanium
        ]

        for pattern in grade_patterns:
            match = re.search(pattern, description)
            if match:
                if len(match.groups()) == 2:
                    attrs['material_type'] = match.group(1)
                    attrs['material_grade'] = match.group(2)
                else:
                    attrs['material_type'] = match.group(1)
                break

        # Extract end connection/type
        connection_patterns = [
            r'(WELD\s+NECK|WN)',  # Welding Neck
            r'(SLIP\s+ON|SO)',    # Slip On
            r'(THREADED|THD)',    # Threaded
            r'(SOCKET\s+WELD|SW)', # Socket Weld
            r'(LAP\s+JOINT|LJ)',   # Lap Joint
            r'(BLIND|BL)',         # Blind
            r'(THREADED\s+PIPE|TP)', # Threaded Pipe
            r'(GROOVED|GRV)',      # Grooved
        ]

        for pattern in connection_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['end_connection'] = match.group(1)
                break

        # Extract facing type
        facing_patterns = [
            r'(RF|RAISED\s+FACE)',      # Raised Face
            r'(FF|FLAT\s+FACE)',        # Flat Face
            r'(RTJ|RING\s+TYPE\s+JOINT)', # Ring Type Joint
        ]

        for pattern in facing_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['facing_type'] = match.group(1)
                break

        # Extract actuation method (for valves)
        actuation_patterns = [
            r'(MANUAL|MAN)',         # Manual
            r'(GEAR\s+OPERATED|GO)', # Gear Operated
            r'(ELECTRIC|ELEC)',      # Electric
            r'(PNEUMATIC|PNEU)',     # Pneumatic
            r'(HYDRAULIC|HYD)',      # Hydraulic
            r'(GAS\s+OVER\s+OIL|GOO)', # Gas over Oil
        ]

        for pattern in actuation_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['actuation'] = match.group(1)
                break

        # Extract trim material (for valves)
        trim_patterns = [
            r'(SS|STAINLESS\s+STEEL)\s*(TRIM)?',  # SS Trim
            r'(STELLITE)',                         # Stellite
            r'(HF|HARD\s+FACING)',                 # Hard Facing
            r'(LF|LOW\s+FACING)',                  # Low Facing
            r'(BR|BRASS)',                         # Brass Trim
            r'(BRZ|BRONZE)',                       # Bronze Trim
        ]

        for pattern in trim_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['trim'] = match.group(1)
                break

        # Extract body material (for valves)
        body_patterns = [
            r'(WCB|WROUGHT\s+CARBON\s+STEEL)',      # WCB
            r'(LCB|LOW\s+CARBON\s+BRONZE)',         # LCB
            r'(CF8|STAINLESS\s+STEEL\s+GRADE\s+8)', # CF8
            r'(CF8M|STAINLESS\s+STEEL\s+GRADE\s+8M)', # CF8M
            r'(LCC|LOW\s+CARBON\s+STEEL)',          # LCC
            r'(LC3|LOW\s+CARBON\s+3% NI)',          # LC3
        ]

        for pattern in body_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['body_material'] = match.group(1)
                break

        # Extract coating/lining (for pipes)
        coating_patterns = [
            r'(FBE|FUSION\s+BONDED\s+EPOXY)',    # FBE Coating
            r'(EP|EPOXY\s+LINING)',              # Epoxy Lining
            r'(CEM|CEMENT\s+LINING)',            # Cement Lining
            r'(BTU|BUTYL\s+RUBBER)',             # Butyl Rubber
        ]

        for pattern in coating_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['coating'] = match.group(1)
                break

        # Extract voltage (for cables)
        voltage_patterns = [
            r'(\d+(?:\.\d+)?)\s*(KV|KILOVOLTS?)',   # 11 KV
            r'(\d+(?:\.\d+)?)\s*(V|VOLTS?)',        # 415 V
            r'(\d+(?:\.\d+)?)\s*(MV|MEGAVOLTS?)',   # 110 MV
        ]

        for pattern in voltage_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['voltage'] = f"{match.group(1)} {match.group(2)}"
                break

        # Extract conductor material (for cables)
        conductor_patterns = [
            r'\b(CU|COPPER)\b',              # Copper
            r'\b(AL|ALUMINUM)\b',            # Aluminum
            r'\b(GS|GALVANIZED\s+STEEL)\b',  # Galvanized Steel
            r'\b(ACSR|ALUMINUM\s+CONDUCTOR\s+STEEL\s+REINFORCED)\b', # ACSR
        ]

        for pattern in conductor_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['conductor_material'] = match.group(1)
                break

        # Extract core count (for cables)
        core_patterns = [
            r'(\d+)\s*(CORE|COREx?)',    # 3 Core
            r'(\d+)\s*Px?\s*x?',         # 3x (3 core)
        ]

        for pattern in core_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['core_count'] = match.group(1)
                break

        # Extract cross-section (for cables)
        cross_section_patterns = [
            r'(\d+(?:\.\d+)?)\s*(MM\^2|SQ\.?MM)',   # 4 mm²
            r'(\d+(?:\.\d+)?)\s*(AWG\s+\d+)',       # 12 AWG
        ]

        for pattern in cross_section_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['cross_section'] = f"{match.group(1)} {match.group(2)}"
                break

        # Extract insulation (for cables)
        insulation_patterns = [
            r'(XLPE|CROSS-LINKED\s+POLYETHYLENE)',  # XLPE
            r'(PVC|POLYVINYL\s+CHLORIDE)',          # PVC
            r'(EPR|ETHYLENE\s+PROPYLENE\s+RUBBER)', # EPR
            r'(HPDE|HIGH\s+DENSITY\s+POLYETHYLENE)', # HDPE
        ]

        for pattern in insulation_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['insulation'] = match.group(1)
                break

        # Extract sheath (for cables)
        sheath_patterns = [
            r'(PVC|POLYVINYL\s+CHLORIDE)',          # PVC Sheath
            r'(HDPE|HIGH\s+DENSITY\s+POLYETHYLENE)', # HDPE Sheath
            r'(N|Nylon)',                           # Nylon Sheath
            r'(LSZH|LOW\s+SMOKE\s+ZERO\s+HALOGEN)', # LSZH Sheath
        ]

        for pattern in sheath_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['sheath'] = match.group(1)
                break

        # Extract application (for cables)
        application_patterns = [
            r'(POWER|PWR)',                    # Power Cable
            r'(CONTROL|CNTL)',                 # Control Cable
            r'(COMMUNICATION|COMM)',           # Communication Cable
            r'(INSTRUMENTATION|INST)',         # Instrumentation Cable
            r'(MINING|MINE)',                  # Mining Cable
            r'(ARMORED|ARM)',                  # Armored Cable
            r'(UNARMORED|UNARM)',              # Unarmored Cable
        ]

        for pattern in application_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['application'] = match.group(1)
                break

        # Extract bearing dimensions
        bearing_patterns = [
            r'(\d+(?:\.\d+)?)\s*(MM)?\s*(?:BORE|B)',        # 25mm Bore
            r'(\d+(?:\.\d+)?)\s*(MM)?\s*(?:OD|OUTER\s+DIAMETER)', # 52mm OD
            r'(\d+(?:\.\d+)?)\s*(MM)?\s*(?:W|WIDTH|WIDTH)', # 15mm Width
        ]

        for pattern in bearing_patterns:
            match = re.search(pattern, description)
            if match:
                if 'BORE' in pattern or 'B' in pattern:
                    attrs['bore'] = f"{match.group(1)} {match.group(2) if match.lastindex >= 2 and match.group(2) else ''}"
                elif 'OD' in pattern or 'OUTER' in pattern:
                    attrs['outer_diameter'] = f"{match.group(1)} {match.group(2) if match.lastindex >= 2 and match.group(2) else ''}"
                elif 'W' in pattern or 'WIDTH' in pattern:
                    attrs['width'] = f"{match.group(1)} {match.group(2) if match.lastindex >= 2 and match.group(2) else ''}"
                break

        # Extract bearing type
        bearing_type_patterns = [
            r'(DEEP\s+GROOVE|DG)',         # Deep Groove Ball Bearing
            r'(ANGULAR\s+CONTACT|AC)',     # Angular Contact Ball Bearing
            r'(SELF\s+ALIGNING|SA)',       # Self Aligning Ball Bearing
            r'(THRUST\s+BEARING|TB)',      # Thrust Bearing
            r'(ROLLER\s+BEARING|RB)',      # Roller Bearing
            r'(NEEDLE\s+BEARING|NB)',      # Needle Bearing
        ]

        for pattern in bearing_type_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['bearing_type'] = match.group(1)
                break

        # Extract seal type
        seal_patterns = [
            r'(ZZ|DUAL\s+SHIELD)',         # Dual Shield
            r'(2RS|DUAL\s+RUBBER\s+SEAL)', # Dual Rubber Seal
            r'(RS|RUBBER\s+SEAL)',         # Rubber Seal
            r'(OPEN|OPEN)',                # Open
            r'(SHIELD|SHIELD)',            # Shield
        ]

        for pattern in seal_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['seal_type'] = match.group(1)
                break

        # Extract clearance
        clearance_patterns = [
            r'(C2|CLEARANCE\s+C2)',        # C2 Clearance
            r'(CN|NORMAL\s+CLEARANCE)',    # CN Clearance
            r'(C3|CLEARANCE\s+C3)',        # C3 Clearance
            r'(C4|CLEARANCE\s+C4)',        # C4 Clearance
        ]

        for pattern in clearance_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['clearance'] = match.group(1)
                break

        # Extract lubrication
        lubrication_patterns = [
            r'(GREASE|GREASE\s+LUBRICATED)',  # Grease Lubricated
            r'(OIL|OIL\s+LUBRICATED)',        # Oil Lubricated
            r'(DRY|DRY\s+LUBRICATION)',       # Dry Lubrication
        ]

        for pattern in lubrication_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['lubrication'] = match.group(1)
                break

        # Extract gasket dimensions
        gasket_patterns = [
            r'(\d+(?:\.\d+)?)\s*(MM)?\s*(?:ID|INNER\s+DIAMETER)', # 50mm ID
            r'(\d+(?:\.\d+)?)\s*(MM)?\s*(?:OD|OUTER\s+DIAMETER)', # 70mm OD
            r'(\d+(?:\.\d+)?)\s*(MM)?\s*(?:THK|THICKNESS)',       # 3mm Thickness
        ]

        for pattern in gasket_patterns:
            match = re.search(pattern, description)
            if match:
                if 'ID' in pattern or 'INNER' in pattern:
                    attrs['inner_diameter'] = f"{match.group(1)} {match.group(2) if match.lastindex >= 2 and match.group(2) else ''}"
                elif 'OD' in pattern or 'OUTER' in pattern:
                    attrs['outer_diameter'] = f"{match.group(1)} {match.group(2) if match.lastindex >= 2 and match.group(2) else ''}"
                elif 'THK' in pattern or 'THICKNESS' in pattern:
                    attrs['thickness'] = f"{match.group(1)} {match.group(2) if match.lastindex >= 2 and match.group(2) else ''}"
                break

        # Extract gasket material
        gasket_material_patterns = [
            r'(SS|STAINLESS\s+STEEL)',          # SS Gasket
            r'(GR|GRAPHITE)',                   # Graphite
            r'(PTFE|POLytetraFLUOROETHYLENE)',   # PTFE/Teflon
            r'(NR|NATURAL\s+RUBBER)',           # Natural Rubber
            r'(SBR|STYRENE\s+BUTADIENE\s+RUBBER)', # SBR
            r'(EPDM|ETHYLENE\s+PROPYLENE\s+DIENE\s+MONOMER)', # EPDM
            r'(NON\s+ASBESTOS|NAF)',            # Non-Asbestos Fibre
        ]

        for pattern in gasket_material_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['gasket_material'] = match.group(1)
                break

        # Extract pressure/temperature ratings
        rating_patterns = [
            r'(\d+(?:\.\d+)?)\s*(PSI|POUNDS\s+PER\s+SQUARE\s+INCH)',   # 150 PSI
            r'(\d+(?:\.\d+)?)\s*(BAR|BARS)',                           # 10 Bar
            r'(\d+(?:\.\d+)?)\s*(deg?C|DEGREES?\s+CELSIUS)',          # 200°C
            r'(\d+(?:\.\d+)?)\s*(deg?F|DEGREES?\s+FAHRENHEIT)',       # 400°F
        ]

        for pattern in rating_patterns:
            match = re.search(pattern, description)
            if match:
                if 'PSI' in pattern or 'POUNDS' in pattern:
                    attrs['pressure_rating'] = f"{match.group(1)} {match.group(2)}"
                elif 'BAR' in pattern:
                    attrs['pressure_rating'] = f"{match.group(1)} {match.group(2)}"
                elif 'C' in pattern or 'CELSIUS' in pattern:
                    attrs['temperature_rating'] = f"{match.group(1)} {match.group(2)}"
                elif 'F' in pattern or 'FAHRENHEIT' in pattern:
                    attrs['temperature_rating'] = f"{match.group(1)} {match.group(2)}"
                break

        # Extract bolt/nut dimensions
        fastener_patterns = [
            r'(\d+(?:\.\d+)?)\s*(MM)?\s*(?:D|DIAMETER)',      # 12mm Diameter
            r'(\d+(?:\.\d+)?)\s*(MM)?\s*(?:L|LENGTH)',        # 50mm Length
            r'(\d+(?:\.\d+)?)\s*(MM)?\s*(?:PITCH|THREAD\s+PITCH)', # 1.75mm Pitch
        ]

        for pattern in fastener_patterns:
            match = re.search(pattern, description)
            if match:
                if 'D' in pattern or 'DIAMETER' in pattern:
                    attrs['diameter'] = f"{match.group(1)} {match.group(2) if match.lastindex >= 2 and match.group(2) else ''}"
                elif 'L' in pattern or 'LENGTH' in pattern:
                    attrs['length'] = f"{match.group(1)} {match.group(2) if match.lastindex >= 2 and match.group(2) else ''}"
                elif 'PITCH' in pattern or 'THREAD' in pattern:
                    attrs['thread_pitch'] = f"{match.group(1)} {match.group(2) if match.lastindex >= 2 and match.group(2) else ''}"
                break

        # Extract strength grade
        strength_patterns = [
            r'(4\.6|GRADE\s+4\.6)',       # Grade 4.6
            r'(8\.8|GRADE\s+8\.8)',       # Grade 8.8
            r'(10\.9|GRADE\s+10\.9)',     # Grade 10.9
            r'(12\.9|GRADE\s+12\.9)',     # Grade 12.9
            r'(A2|STAINLESS\s+STEEL\s+A2)', # A2 Stainless
            r'(A4|STAINLESS\s+STEEL\s+A4)', # A4 Stainless
        ]

        for pattern in strength_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['strength_grade'] = match.group(1)
                break

        # Extract finish
        finish_patterns = [
            r'(ZP|ZINC\s+PLATED)',        # Zinc Plated
            r'(HDG|HOT\s+DIP\s+GALVANIZED)', # Hot Dip Galvanized
            r'(PL|PLAIN)',                # Plain Finish
            r'(BLACK|BLACK\s+OXIDE)',     # Black Oxide
            r'(PHOSPHATE|PHOSPHATE\s+COATED)', # Phosphate Coated
        ]

        for pattern in finish_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['finish'] = match.group(1)
                break

        # Extract head type
        head_patterns = [
            r'(HEX\s+HEAD|HH)',           # Hex Head
            r'(SOCKET\s+HEAD|SH)',        # Socket Head
            r'(COUNTERSUNK\s+HEAD|CSK)',  # Countersunk Head
            r'(ROUND\s+HEAD|RH)',         # Round Head
            r'(FLAT\s+HEAD|FH)',          # Flat Head
            r'(TRUSS\s+HEAD|TH)',         # Truss Head
            r'(PAN\s+HEAD|PH)',           # Pan Head
            r'(FLANGE\s+HEAD|FH)',        # Flange Head
        ]

        for pattern in head_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['head_type'] = match.group(1)
                break

        # Extract nut type
        nut_patterns = [
            r'(HEX\s+NUT|HN)',            # Hex Nut
            r'(LOCK\s+NUT|LN)',           # Lock Nut
            r'(NYLON\s+INSERT\s+LOCK\s+NUT|NL)', # Nylon Insert Lock Nut
            r'(CAP\s+NUT|CN)',            # Cap Nut
            r'(WING\s+NUT|WN)',           # Wing Nut
            r'(SQUARE\s+NUT|SN)',         # Square Nut
        ]

        for pattern in nut_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['nut_type'] = match.group(1)
                break

        # Extract washer type
        washer_patterns = [
            r'(PLAIN\s+WASHER|PW)',       # Plain Washer
            r'(SPRING\s+WASHER|SW)',      # Spring Washer
            r'(LOCK\s+WASHER|LW)',        # Lock Washer
            r'(TOOTHED\s+WASHER|TW)',     # Toothed Washer
            r'(BEVELED\s+WASHER|BW)',     # Beveled Washer
            r'(FENDER\s+WASHER|FW)',      # Fender Washer
        ]

        for pattern in washer_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['washer_type'] = match.group(1)
                break

        # Extract angle (for elbows)
        angle_patterns = [
            r'(\d+(?:\.\d+)?)\s*(deg?|DEGREES?)',   # 90 deg
            r'(\d+(?:\.\d+)?)\s*(°|DEGREE\s+SIGN)', # 45°
        ]

        for pattern in angle_patterns:
            match = re.search(pattern, description)
            if match:
                attrs['angle'] = f"{match.group(1)} {match.group(2)}"
                break

        # Extract radius (for elbows)
        radius_patterns = [
            r'(\d+(?:\.\d+)?)\s*(MM)?\s*(?:R|RADIUS)',    # 1.5D Radius
            r'(\d+(?:\.\d+)?)\s*(?:D|DIAMETER)',          # 1.5D (implicit radius)
        ]

        for pattern in radius_patterns:
            match = re.search(pattern, description)
            if match:
                if 'MM' in pattern:
                    attrs['radius'] = f"{match.group(1)} {match.group(2) if match.lastindex >= 2 and match.group(2) else ''}"
                elif 'D' in pattern or 'DIAMETER' in pattern:
                    attrs['radius'] = f"{match.group(1)} {match.group(2) if match.lastindex >= 2 and match.group(2) else ''} D"
                break

        # Extract branch size (for tees)
        branch_patterns = [
            r'(\d+(?:\.\d+)?)\s*(INCH|\"|MM)?\s*(?:BRANCH|BR)',   # 2" Branch
        ]

        for pattern in branch_patterns:
            match = re.search(pattern, description)
            if match:
                unit = match.group(2) if match.lastindex >= 2 and match.group(2) else ""
                attrs['branch_size'] = f"{match.group(1)} {unit}".strip()
                break

        # Extract reduction (for reducers)
        reduction_patterns = [
            r'(\d+(?:\.\d+)?)\s*(INCH|\"|MM)?\s*(?:TO|->)',    # 4" to 2"
        ]

        for pattern in reduction_patterns:
            match = re.search(pattern, description)
            if match:
                from_size = match.group(1)
                unit = match.group(2) if match.lastindex >= 2 and match.group(2) else ""
                # We'd need to parse the "to" part separately, but for now just capture the from size
                attrs['reduction'] = f"{from_size} {unit}".strip()
                break

        # Extract plug/cap type
        plug_cap_patterns = [
            r'(THREADED|THD)',            # Threaded Plug/Cap
            r'(WELD\s+NECK|WN)',          # Welding Neck Plug/Cap
            r'(SOCKET\s+WELD|SW)',        # Socket Weld Plug/Cap
            r'(FLUSH\s+FLUSH|FF)',        # Flush Plug/Cap
            r'(HEX\s+HEAD|HH)',           # Hex Head Plug
        ]

        for pattern in plug_cap_patterns:
            match = re.search(pattern, description)
            if match:
                # Determine if it's a plug or cap based on context
                if 'PLUG' in description.upper():
                    attrs['plug_type'] = match.group(1)
                elif 'CAP' in description.upper():
                    attrs['cap_type'] = match.group(1)
                break

        return attrs

    def create_fingerprint(self, description: str, original_description: str = "") -> MaterialFingerprint:
        """Create a Material Fingerprint from a description."""
        if not original_description:
            original_description = description

        # Detect category
        category = self.detect_category(description)

        # Normalize the description
        normalized = self.normalize_description(description)

        # Parse technical attributes
        attrs = self.parse_technical_attributes(normalized)

        # Create fingerprint
        fingerprint = MaterialFingerprint(
            category=category.value,
            description_original=original_description,
            **attrs
        )

        return fingerprint

def create_material_fingerprint(description: str,
                              reference_data_path: str = "data/processed/extracted_items/") -> MaterialFingerprint:
    """
    Convenience function to create a Material Fingerprint.

    Args:
        description: Raw material description
        reference_data_path: Path to reference data files

    Returns:
        MaterialFingerprint object
    """
    normalizer = MaterialNormalizer(reference_data_path)
    return normalizer.create_fingerprint(description)

if __name__ == "__main__":
    # Example usage and testing
    logging.basicConfig(level=logging.INFO)

    # Test cases from the document
    test_descriptions = [
        "BALL VL 2 IN CL300",
        "BALL VALVE 2\" CLASS 300",
        "2 IN BALL VALVE CL-300",
        "GATE VALVE 4\" CLASS 150",
        "GATE VALVE 4\" CLASS 300",
        "CS PIPE 8 INCH SCH 40",
        "8\" CARBON STEEL PIPE SCHEDULE 40",
        "PIPE CS 8NB SCH40",
        "FLANGE SS 304 2IN CL150",
        "2 INCH SS304 FLANGE CLASS 150",
        "FLANGE 2NB SS304 CL150",
        "CU CABLE 11KV 3CX4MM2 XLPE",
        "ALUMINUM CABLE 415V 4CX2.5MM2 PVC",
        "BEARING 6205 25X52X15 MM",
        "GASKET SS 304 50X70X3 MM",
        "BOLT M12X50 GR8.8",
        "NUT M12 HEX",
        "WASHER M12 SPRING",
        "ELBOW CS 4\" 90deg LR",
        "TEE CS 4\" REDUCING",
        "REDUCER CS 6\"x4\" CONC",
        "CAP CS 2\" THREADED",
        "PLUG CS 1.5\" SOCKET"
    ]

    print("Enhanced Material Fingerprint Examples:")
    print("=" * 50)

    for desc in test_descriptions:
        fp = create_material_fingerprint(desc)
        print(f"Original: {desc}")
        print(f"Category: {fp.category}")
        print(f"Fingerprint: {fp.to_dict()}")
        print("-" * 30)