# PowerShell automation setup

## Version pins

| Tool | Version pin | Notes |
| --- | --- | --- |
| GitHub CLI (gh) | 2.63.1 | Installed via `winget` in `tools/setup-github-cli.ps1`. |
| oh-my-posh | 18.6.0 | Installed via PowerShell module in `tools/setup-oh-my-posh.ps1`. |

## Installation steps (pinned)

1. Install GitHub CLI at the pinned version.

   ```powershell
   .\tools\setup-github-cli.ps1 -Version 2.63.1
   ```

2. Install oh-my-posh at the pinned version and stage the Tillerstead prompt theme.

   ```powershell
   .\tools\setup-oh-my-posh.ps1 -Version 18.6.0
   ```

3. Initialize the CLI profile (prompt theme + GitHub CLI completion).

   ```powershell
   .\tools\setup-pwsh-profile.ps1
   ```

## Scheduled daily backup task

1. Register the scheduled task (defaults to 2:00 AM daily).

   ```powershell
   .\tools\register-scheduled-task.ps1 -TaskName "DailyBackup"
   ```

2. Validate task creation with a test run and logging output.

   ```powershell
   .\tools\register-scheduled-task.ps1 -TaskName "DailyBackup" -TestRun
   Get-Content .\tools\logs\daily-backup.log -Tail 20
   ```

## Notes

- The prompt theme is stored at `tools/posh/tillerstead.omp.json` and copied to
  `$HOME\.config\oh-my-posh\tillerstead.omp.json` during setup.
- The backup script stub lives at `tools/daily-backup.ps1` and writes to
  `tools/logs/daily-backup.log` by default. Replace its placeholder steps with the
  actual backup logic for your environment.
