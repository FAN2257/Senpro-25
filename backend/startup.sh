#!/bin/bash
set -euo pipefail

python -m pip uninstall -y opencv-python opencv-contrib-python >/tmp/opencv-uninstall.log 2>&1 || true

if ! python -m pip show opencv-python-headless >/dev/null 2>&1; then
  python -m pip install --no-cache-dir opencv-python-headless==4.13.0.92
fi

exec python -m uvicorn api:app --host 0.0.0.0 --port "${PORT:-8000}"