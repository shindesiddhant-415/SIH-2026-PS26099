"""
Ingestion coordinator: takes raw CPSE records and returns fully normalized material items.
Also parses CSV/text files uploaded by users.
"""

import csv
import io
import re
from typing import List
from src.models.material import RawMaterialRecord, NormalizedMaterial, MatchStatus, CPSEIdentifier
from src.engine.preprocessor import preprocess_material_description
from src.engine.attribute_extractor import extract_technical_attributes, build_standard_description


def ingest_and_normalize_records(raw_records: List[RawMaterialRecord]) -> List[NormalizedMaterial]:
    """
    Transforms raw incoming CPSE material records into normalized entities.
    """
    normalized_list = []
    for raw in raw_records:
        cleaned_desc, std_uom = preprocess_material_description(raw.raw_description, raw.raw_uom)
        attrs = extract_technical_attributes(cleaned_desc)
        if raw.unit_price_inr is not None:
            attrs.additional_attributes["unit_price_inr"] = raw.unit_price_inr
        if raw.stock_quantity is not None:
            attrs.additional_attributes["stock_quantity"] = raw.stock_quantity

        std_desc = build_standard_description(attrs, cleaned_desc)

        record_id = f"NORM-{raw.cpse_id.value}-{raw.local_material_code}"
        normalized = NormalizedMaterial(
            record_id=record_id,
            cpse_id=raw.cpse_id,
            local_material_code=raw.local_material_code,
            raw_description=raw.raw_description,
            cleaned_description=cleaned_desc,
            standard_description=std_desc,
            standard_uom=std_uom,
            attributes=attrs,
            match_status=MatchStatus.UNPROCESSED,
            confidence_score=0.0
        )
        normalized_list.append(normalized)

    return normalized_list


def parse_csv_catalog(file_content: str) -> List[RawMaterialRecord]:
    """
    Parses a CSV string into a list of RawMaterialRecord instances.
    Accepts standard headers: cpse_id, local_material_code, raw_description, raw_uom, unit_price_inr.
    Flexible header detection handles case-insensitive aliases.
    """
    f = io.StringIO(file_content.strip())
    # Sniff delimiter (comma, semicolon, tab)
    sample = file_content[:1024]
    delimiter = ','
    if ';' in sample and sample.count(';') > sample.count(','):
        delimiter = ';'
    elif '\t' in sample and sample.count('\t') > sample.count(','):
        delimiter = '\t'

    reader = csv.DictReader(f, delimiter=delimiter)
    records: List[RawMaterialRecord] = []

    for idx, row in enumerate(reader, start=1):
        # Normalize keys to lower-case stripped
        row_norm = {k.strip().lower().replace(' ', '_'): v.strip() for k, v in row.items() if k}

        # Resolve CPSE ID
        raw_cpse = (
            row_norm.get('cpse_id') or
            row_norm.get('cpse') or
            row_norm.get('enterprise') or
            row_norm.get('organization') or
            'IOCL'
        ).upper()

        cpse_enum = None
        for member in CPSEIdentifier:
            if member.value == raw_cpse:
                cpse_enum = member
                break
        if not cpse_enum:
            cpse_enum = CPSEIdentifier.IOCL

        # Resolve code
        code = (
            row_norm.get('local_material_code') or
            row_norm.get('material_code') or
            row_norm.get('code') or
            row_norm.get('item_code') or
            f"GEN-MTR-{idx:05d}"
        )

        # Resolve description
        desc = (
            row_norm.get('raw_description') or
            row_norm.get('description') or
            row_norm.get('item_description') or
            row_norm.get('material_description') or
            row_norm.get('item_name')
        )
        if not desc:
            continue

        # Resolve UoM
        uom = (
            row_norm.get('raw_uom') or
            row_norm.get('uom') or
            row_norm.get('unit') or
            row_norm.get('unit_of_measure') or
            'NOS'
        )

        # Resolve Price
        price_val = None
        price_str = row_norm.get('unit_price_inr') or row_norm.get('price') or row_norm.get('unit_price')
        if price_str:
            try:
                price_val = float(re.sub(r'[^\d.]', '', price_str))
            except ValueError:
                price_val = None

        record = RawMaterialRecord(
            cpse_id=cpse_enum,
            local_material_code=code,
            raw_description=desc,
            raw_uom=uom,
            unit_price_inr=price_val or 1000.0
        )
        records.append(record)

    return records
