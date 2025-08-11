@echo off
REM Windows batch script to show project structure
REM Alternative to pnpm command for users with PowerShell execution policy issues

if "%1"=="--full" (
    node "%~dp0list-structure.js" --full
) else (
    node "%~dp0list-structure.js"
)
