@echo off
setlocal
title Portfolio - local dev server  (Ctrl+C or close this window to stop)

rem --- project root = two levels up from this script (tools\local-launcher\) ---
pushd "%~dp0..\.."
set "ROOT=%CD%"
echo Project : %ROOT%

rem --- already serving? then just open the browser, do not start a second server ---
powershell -NoProfile -Command "try { $c = New-Object System.Net.Sockets.TcpClient; $ok = $c.ConnectAsync('127.0.0.1',3000).Wait(800); $c.Close(); exit ([int](-not $ok)) } catch { exit 1 }" >nul 2>&1
if %errorlevel%==0 (
  echo Port 3000 is already serving - opening Edge only.
  start "" /b powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0open-when-ready.ps1" -SkipWait
  timeout /t 1 >nul
  popd
  exit /b 0
)

rem --- dependencies must exist in THIS folder (never copy node_modules across drives) ---
if not exist "node_modules" (
  echo node_modules is missing here - running pnpm install first, this can take a minute...
  call pnpm install
  if errorlevel 1 goto fail
)

rem --- open Edge as soon as the server answers, then run the server in this window ---
echo Starting dev server, Edge will open at http://localhost:3000 ...
start "" /b powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0open-when-ready.ps1"
call pnpm dev

popd
exit /b 0

:fail
echo.
echo Could not install dependencies. Is pnpm available in this shell?
echo   pnpm -v                      (check)
echo   npm install -g pnpm@11       (install if missing)
pause
popd
exit /b 1
