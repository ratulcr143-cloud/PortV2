@echo off
cd /d "%~dp0"
echo Starting portfolio at http://localhost:3000
echo Press Ctrl+C to stop.
npx --yes serve . -l 3000
