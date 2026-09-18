$ErrorActionPreference = 'Stop'
$status = 'D:\projects\opencode\hinglish-tool\.opencode-server\status'
$pidfile = 'D:\projects\opencode\hinglish-tool\.opencode-server\pid'
$logfile = 'D:\projects\opencode\hinglish-tool\.opencode-server\server.log'
$cooldownfile = 'D:\projects\opencode\hinglish-tool\.opencode-server\cooldown'
$workdir = 'D:\projects\opencode\hinglish-tool'

Set-Content -Path $status -Value 'STARTING' -Encoding UTF8
Set-Content -Path $pidfile -Value $PID -Encoding UTF8
cd $workdir

try {
  Set-Content -Path $status -Value 'RUNNING' -Encoding UTF8
  & { npm show astro version 2>&1; npm show @astrojs/sitemap version 2>&1; npm show @tailwindcss/vite version 2>&1 } 2>&1 | Tee-Object -FilePath $logfile
  $exitCode = $LASTEXITCODE
  if ($null -eq $exitCode) { $exitCode = 0 }
} catch {
  Write-Host "[Opencode] Exception: $($_.Exception.Message)" -ForegroundColor Red
  Set-Content -Path $status -Value 'FAILED' -Encoding UTF8
  Set-Content -Path $pidfile -Value '' -Encoding UTF8
  Set-Content -Path $cooldownfile -Value ([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) -Encoding UTF8
  Start-Sleep -Seconds 5
  exit 1
}

if ($exitCode -ne 0) {
  Write-Host "[Opencode] Process exited with code $exitCode. Closing in 5s..." -ForegroundColor Red
  Set-Content -Path $status -Value 'FAILED' -Encoding UTF8
  Set-Content -Path $pidfile -Value '' -Encoding UTF8
  Set-Content -Path $cooldownfile -Value ([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) -Encoding UTF8
  Start-Sleep -Seconds 5
  exit $exitCode
}

# Command finished with exit 0 WITHOUT a confinement flag: it has stopped,
# so it is NOT a live server anymore. Mark DONE (no cooldown for a clean stop)
# and let the window close itself.
Write-Host "[Opencode] Process finished (exit 0). Closing window." -ForegroundColor Green
Set-Content -Path $status -Value 'DONE' -Encoding UTF8
Set-Content -Path $pidfile -Value '' -Encoding UTF8
Start-Sleep -Seconds 3