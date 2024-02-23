@echo off
setlocal enabledelayedexpansion

rem Get the current directory of the batch file
set "CURRENT_DIR=%~dp0"

rem Get the parent directory of the current directory
for %%I in ("%CURRENT_DIR%\.") do set "PARENT_DIR=%%~fI"

rem Move the contents of the current directory to the parent directory
move "%CURRENT_DIR%*" "%PARENT_DIR%\" > nul

rem Remove the empty current directory
rmdir "%CURRENT_DIR%"

echo Folder moved up one level.
pause
