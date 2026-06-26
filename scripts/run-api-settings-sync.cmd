@echo off
cd /d "%~dp0.."
powershell -NoProfile -ExecutionPolicy Bypass -NoExit -File "%~dp0sync-vercel-api-settings.ps1" %*
