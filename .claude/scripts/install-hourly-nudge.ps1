# BhavX hourly push notification — Windows Task Scheduler installer
# Run once: right-click → Run with PowerShell (or run from elevated PowerShell)
# To uninstall: Unregister-ScheduledTask -TaskName "BhavX-Hourly-Nudge" -Confirm:$false

$taskName    = "BhavX-Hourly-Nudge"
$scriptPath  = "C:\Users\Lenovo\Downloads\MetalXpress\.claude\worktrees\great-goldwasser\.claude\scripts\session-brief.js"
$workingDir  = "C:\Users\Lenovo\Downloads\MetalXpress\.claude\worktrees\great-goldwasser"

# Resolve node path (PATH may not be inherited by Task Scheduler)
$nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodePath) { $nodePath = "C:\Program Files\nodejs\node.exe" }

Write-Host "Using node at: $nodePath"
Write-Host "Script: $scriptPath"

# Action: run node with --notify-only flag
$action = New-ScheduledTaskAction `
    -Execute $nodePath `
    -Argument "`"$scriptPath`" --notify-only" `
    -WorkingDirectory $workingDir

# Trigger: every hour, between 9 AM and 10 PM (no buzzing at night)
$trigger = New-ScheduledTaskTrigger `
    -Once `
    -At (Get-Date "09:00") `
    -RepetitionInterval (New-TimeSpan -Hours 1) `
    -RepetitionDuration (New-TimeSpan -Hours 13)

# Settings: don't run if on battery saver, allow on AC + battery, run hidden
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -Hidden `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 2)

# Principal: run as current user, only when logged on
$principal = New-ScheduledTaskPrincipal `
    -UserId (whoami) `
    -LogonType Interactive `
    -RunLevel Limited

# Remove if exists, then register
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "BhavX session brief — sends ntfy push notification every hour 9 AM - 10 PM. Topic: bhavx-mridul-alerts"

Write-Host ""
Write-Host "✅ Installed: $taskName" -ForegroundColor Green
Write-Host "   Schedule: every hour, 9 AM - 10 PM"
Write-Host "   Topic: bhavx-mridul-alerts"
Write-Host ""
Write-Host "To test now (without waiting for the hour):"
Write-Host "   Start-ScheduledTask -TaskName '$taskName'"
Write-Host ""
Write-Host "To uninstall: Unregister-ScheduledTask -TaskName BhavX-Hourly-Nudge -Confirm:0"
