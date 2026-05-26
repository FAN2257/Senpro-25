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

SQLAlchemy/PyODBC database access uses SQL authentication. Set one of these formats:

- `AZURE_SQL_CONNECTION_STRING = Driver={ODBC Driver 18 for SQL Server};Server=tcp:snapeats-sql-server.database.windows.net,1433;Database=snapeatsdb;Uid=adminsenpro25;Pwd=<password>;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;`
- or the split values: `AZURE_SQL_SERVER`, `AZURE_SQL_DATABASE`, `AZURE_SQL_USERNAME`, `AZURE_SQL_PASSWORD`, `AZURE_SQL_DRIVER`

Recommended "always works" setting for this app:

- Use a single `AZURE_SQL_CONNECTION_STRING` with `ODBC Driver 18 for SQL Server`
- Keep `Encrypt=yes` and `TrustServerCertificate=no`
- Use the SQL login user, not `Authentication="Active Directory Default"`
- Do not mix ADO.NET/JDBC strings into App Service settings; the backend reads the ODBC connection string only

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
- Call `GET /api/db-status` and check `db_ready`, `connection_configured`, and `meal_history_table_ready` fields.
- If the SQL Database resource is Paused, Resume it first. A paused database will not accept app connections.
- To resume: Azure Portal > SQL databases > `snapeatsdb` > Overview > click `Resume`.
- If you prefer CLI: `az sql db resume --resource-group <rg> --server snapeats-sql-server --name snapeatsdb`.
- If `load_error` shows `libxcb` or other missing system libraries after the above env vars are set, then containerless deployment may still be blocked by binary wheel linkage issues; contact me and I'll provide a step-by-step fallback (Azure VM or App Service for Containers).

5) Additional tips
- Turn on `Application logging (filesystem)` temporarily to capture pip/oryx installation output.
- If you plan to use the model heavily in production, consider provisioning a larger SKU to avoid memory/timeouts during model warm-up.


If you'd like, I can automatically create a small validation script that calls `/api/model-status` repeatedly after deploy, and a simple PowerShell snippet to upload the zip and poll readiness. Tell me if you want those artifacts added to the repo.
