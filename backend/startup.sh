#!/bin/bash
set -euo pipefail

# Ensure cv2 comes from the headless wheel. Do not uninstall other OpenCV
# packages here because they overlap files and can leave cv2 missing.
python -m pip install --no-cache-dir --force-reinstall --no-deps opencv-python-headless==4.13.0.92

exec python -m uvicorn api:app --host 0.0.0.0 --port "${PORT:-8000}"