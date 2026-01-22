# Daily Backup System - Quick Reference

## 📍 Backup Location
**Industry Standard:** `C:\web-dev\github-repos\tillerstead-backups\`

✅ **Outside repository** (best practice)  
✅ **Clean git workspace** (no backups in working tree)  
✅ **Automatic cleanup** (keeps last 7 days)

---

## ⚡ Quick Commands

### Setup (One Time)
```powershell
# Auto-elevates to Administrator
.\scripts\setup-daily-backup-task.ps1
```

### Manual Backup
```powershell
# Only if changes detected
.\scripts\auto-backup-daily.ps1

# Force backup anyway
.\scripts\auto-backup-daily.ps1 -Force
```

### List Backups
```powershell
Get-ChildItem ..\tillerstead-backups\
```

### View Backup Size
```powershell
Get-ChildItem ..\tillerstead-backups\ | 
    Select-Object Name, @{N='Size (MB)';E={
        [math]::Round((gci $_.FullName -Recurse -File | 
        Measure-Object Length -Sum).Sum / 1MB, 2)
    }}
```

---

## 🔄 Restore Operations

### Restore Single File
```powershell
Copy-Item ..\tillerstead-backups\2026-01-21\path\to\file.html .
```

### Restore Entire Folder
```powershell
Copy-Item ..\tillerstead-backups\2026-01-21\_includes . -Recurse -Force
```

### Compare Current vs Backup
```powershell
code --diff ..\tillerstead-backups\2026-01-21\file.html .\file.html
```

### Find Deleted File
```powershell
Get-ChildItem ..\tillerstead-backups -Recurse -Filter "filename.html" |
    Sort-Object DirectoryName -Descending | 
    Select-Object -First 1 | 
    Copy-Item -Destination .
```

---

## 📅 Backup Schedule

**Daily:** 11:59 PM (via Task Scheduler)  
**Retention:** Last 7 days  
**Trigger:** Only if git changes detected  

---

## 🗂️ Directory Structure

```
github-repos/
├── Tillerstead.com/      ← Your working repo
└── tillerstead-backups/  ← Backups (outside repo)
    ├── 2026-01-15/
    ├── 2026-01-16/
    ├── 2026-01-17/
    ├── 2026-01-18/
    ├── 2026-01-19/
    ├── 2026-01-20/
    └── 2026-01-21/       ← Latest
```

---

## 🛠️ Maintenance

### Check Task Scheduler
```powershell
Get-ScheduledTask -TaskName "Tillerstead Daily Git Backup"
```

### View Last Backup
```powershell
Get-Content ..\tillerstead-backups\2026-01-21\_BACKUP_INFO.json | ConvertFrom-Json
```

### Manual Cleanup (Remove Old Backups)
```powershell
Get-ChildItem ..\tillerstead-backups -Directory | 
    Sort-Object Name -Descending | 
    Select-Object -Skip 7 | 
    Remove-Item -Recurse -Force
```

---

## 📊 Backup Info

Each backup contains `_BACKUP_INFO.json`:
- Backup date/time
- Git branch & commit hash
- Changed files list
- Backup reason

---

**Created:** January 21, 2026  
**Tillerstead LLC** - NJ HIC #13VH10808800
