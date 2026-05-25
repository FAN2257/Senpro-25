Recommended App Service settings for running Senpro backend (no container)

The backend uses ultralytics and may pull graphical libraries (matplotlib/Qt/OpenCV). On Azure App Service (Linux), several GUI/X11 system libraries are not present by default. To run without a custom container, do the following in the App Service configuration:

1) General settings
- Runtime stack: Python 3.11 (or compatible with your venv and requirements)
- Always On: ON
  - This keeps the app warm and reduces cold-start issues for model loading.

2) Application settings (Environment variables)
Set the following app settings (name → value). These help avoid import-time errors and configure headless backends:

- TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD = 1
- MPLBACKEND = Agg
- QT_QPA_PLATFORM = offscreen
- DISPLAY = (empty string)
- MPLCONFIGDIR = /tmp/matplotlib
- PYTHONUNBUFFERED = 1

Notes:
- `MPLBACKEND=Agg` prevents matplotlib from trying to use GUI backends that require X11.
- `MPLCONFIGDIR` should point to a writable directory (e.g. /tmp/matplotlib) so matplotlib can build its font cache there instead of a read-only system directory.
- `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1` helps deserialize older PyTorch checkpoints used by some Ultralytics model files.

3) Deployment recommendations when using Zip Deploy (Oryx)
- Ensure `backend/requirements.txt` contains `opencv-python-headless` (already included).
- Enable build during deployment by having `.deployment` with `SCM_DO_BUILD_DURING_DEPLOYMENT=true` (present).
- Check deployment logs (Kudu/Oryx) to verify that `opencv-python-headless` and `ultralytics` installed from wheels (no compilation errors).

4) Post-deploy checks
- Call `GET /api/model-status` and check `model_loaded` and `load_error` fields.
- If `load_error` shows `libxcb` or other missing system libraries after the above env vars are set, then containerless deployment may still be blocked by binary wheel linkage issues; contact me and I'll provide a step-by-step fallback (Azure VM or App Service for Containers).

5) Additional tips
- Turn on `Application logging (filesystem)` temporarily to capture pip/oryx installation output.
- If you plan to use the model heavily in production, consider provisioning a larger SKU to avoid memory/timeouts during model warm-up.


If you'd like, I can automatically create a small validation script that calls `/api/model-status` repeatedly after deploy, and a simple PowerShell snippet to upload the zip and poll readiness. Tell me if you want those artifacts added to the repo.
