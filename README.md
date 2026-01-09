# Tillerstead.com

## Command Center

Run the interactive PowerShell command center to execute grouped maintenance tasks:

```powershell
pwsh tools/command-center.ps1
```

Select a menu option to run the associated batch (e.g., `Sync + Build`, `Backups`, or `Maintenance`). Each command is logged before execution and failures halt the batch with a non-zero exit code.
