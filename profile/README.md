# PowerShell profile setup

1. Copy `profile/Microsoft.PowerShell_profile.ps1` to your PowerShell profile path.
   - Find the path with `$PROFILE` (for the current user/current host) or `$PROFILE.CurrentUserAllHosts`.
2. Keep `profile.ps1` and the `functions/` folder together in the same directory as the profile file.
3. Restart PowerShell to load the profile.

The `Microsoft.PowerShell_profile.ps1` file loads `profile.ps1`, which imports all modular functions and
runs startup helpers (like system info) on session start.

## Command center

The command center reads its entries from `profile/command-database.json`. Each entry can contain:
- `name`: the command set name.
- `description`: a short explanation shown in the menu.
- `tags`: optional labels used in the menu output.
- `commands`: PowerShell commands to run in order.
- `includes`: optional list of other command set names to expand.

Run the command center with:

```powershell
command-center
```

Or execute a specific set directly:

```powershell
Invoke-CommandSet -Name "daily-core-workflow"
```

