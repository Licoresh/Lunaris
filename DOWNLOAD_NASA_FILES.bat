@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\nasa-download-kit\Download_NASA_Data.ps1"
echo.
pause
