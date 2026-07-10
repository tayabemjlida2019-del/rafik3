$oldShortcuts = @(
    "C:\Users\hp\Desktop\Rafiq System Portal.url",
    "C:\Users\hp\Desktop\Rafiq.bat"
)

foreach ($old in $oldShortcuts) {
    if (Test-Path $old) {
        Remove-Item $old -Force
        Write-Host "Removed old shortcut: $old"
    }
}

$WshShell = New-Object -ComObject WScript.Shell
$ShortcutPath = "C:\Users\hp\Desktop\الـرفـيـق — Rafiik Platform.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "C:\Users\hp\Desktop\rafik 3\rafiq.bat"
$Shortcut.WorkingDirectory = "C:\Users\hp\Desktop\rafik 3"
$IconPath = "C:\Users\hp\Desktop\rafik 3\apps\rafiq-frontend\src\app\favicon.ico"
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = $IconPath
}
$Shortcut.Save()
Write-Host "Created new shortcut: $ShortcutPath"
