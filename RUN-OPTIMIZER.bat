@echo off
REM Quick launcher for deep overnight optimizer
cd /d C:\web-dev\github-repos\Tillerstead.com
echo.
echo ═══════════════════════════════════════════════
echo   DEEP OVERNIGHT OPTIMIZER
echo   Starting 8-hour optimization run...
echo ═══════════════════════════════════════════════
echo.
timeout /t 2 /nobreak >nul
powershell.exe -ExecutionPolicy Bypass -File ".\scripts\deep-overnight.ps1" -MaxHours 8
pause
