param(
    [string]$FoundryModulesPath
)

$projectRoot = Split-Path -Parent $PSScriptRoot
$moduleName = "token-action-hud-d35e"

$candidatePaths = @(
    $FoundryModulesPath,
    "E:\foundry-v14\foundrydata\Data\modules",
    (Join-Path $env:LOCALAPPDATA "FoundryVTT\Data\modules")
) | Where-Object { $_ -and $_.Trim() -ne "" } | Select-Object -Unique

$resolvedModulesPath = $null
foreach ($candidate in $candidatePaths) {
    if (Test-Path $candidate) {
        $resolvedModulesPath = $candidate
        break
    }
}

if (-not $resolvedModulesPath) {
    Write-Host "Error: Foundry modules directory not found." -ForegroundColor Red
    Write-Host "Provide a path via .\tools\deploy.ps1 -FoundryModulesPath <path>" -ForegroundColor Yellow
    exit 1
}

$targetPath = Join-Path $resolvedModulesPath $moduleName

Write-Host "Deploying $moduleName to $targetPath" -ForegroundColor Cyan

if (-not (Test-Path $targetPath)) {
    New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
}

Copy-Item (Join-Path $projectRoot "module.json") $targetPath -Force
Copy-Item (Join-Path $projectRoot "README.md") $targetPath -Force
if (Test-Path (Join-Path $projectRoot "LICENSE")) {
    Copy-Item (Join-Path $projectRoot "LICENSE") $targetPath -Force
}
if (Test-Path (Join-Path $projectRoot "CHANGELOG.md")) {
    Copy-Item (Join-Path $projectRoot "CHANGELOG.md") $targetPath -Force
}

foreach ($dirName in @("scripts", "languages")) {
    $sourceDir = Join-Path $projectRoot $dirName
    $targetDir = Join-Path $targetPath $dirName
    if (Test-Path $targetDir) {
        Remove-Item $targetDir -Recurse -Force
    }
    Copy-Item $sourceDir $targetDir -Recurse -Force
}

Write-Host "Deployment complete." -ForegroundColor Green