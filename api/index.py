"""
Vercel Serverless Entrypoint for MatSync AI.
Exposes the FastAPI application to Vercel Python runtime.
"""
import sys
from pathlib import Path

# Add project root to sys.path so 'src' imports resolve cleanly
root_path = Path(__file__).resolve().parent.parent
if str(root_path) not in sys.path:
    sys.path.insert(0, str(root_path))

from src.web.app import app
