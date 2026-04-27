param(
    [string]$Tag,
    [string]$Repository = "Xombit/fvtt-token-action-hud-d35e",
    [string]$OutputZipPath,
    [string]$PackagePath
)

$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot

try {
    $modulePath = Join-Path $projectRoot "module.json"
    $module = Get-Content $modulePath -Raw | ConvertFrom-Json
    $moduleId = $module.id

    if ([string]::IsNullOrWhiteSpace($Tag)) {
        $Tag = "v$($module.version)"
    }

    $version = if ($Tag.StartsWith("v")) { $Tag.Substring(1) } else { $Tag }
    $repoUrl = "https://github.com/$Repository"
    $manifestUrl = "$repoUrl/releases/latest/download/module.json"
    $downloadUrl = "$repoUrl/releases/download/$Tag/module.zip"

    $stagingDir = Join-Path $projectRoot "dist-release"
    $packageDir = Join-Path $projectRoot "packages"

    if ([string]::IsNullOrWhiteSpace($OutputZipPath)) {
        $OutputZipPath = Join-Path $projectRoot "module.zip"
    }

    if ([string]::IsNullOrWhiteSpace($PackagePath)) {
        $PackagePath = Join-Path $packageDir "$moduleId-$version.zip"
    }

    Write-Host "Building release assets for $moduleId $Tag..." -ForegroundColor Cyan

    if (Test-Path $stagingDir) {
        Remove-Item $stagingDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $stagingDir | Out-Null

    if (-not (Test-Path $packageDir)) {
        New-Item -ItemType Directory -Path $packageDir | Out-Null
    }

    $releaseModule = Get-Content $modulePath -Raw | ConvertFrom-Json
    $releaseModule.version = $version
    $releaseModule.url = $repoUrl
    $releaseModule.manifest = $manifestUrl
    $releaseModule.download = $downloadUrl

    $releaseModule | ConvertTo-Json -Depth 100 | Set-Content (Join-Path $stagingDir "module.json") -Encoding UTF8

    $stagedManifest = Get-Content (Join-Path $stagingDir "module.json") -Raw | ConvertFrom-Json
    foreach ($requiredField in @("id", "version", "manifest", "download")) {
        $value = $stagedManifest.$requiredField
        if ([string]::IsNullOrWhiteSpace($value)) {
            throw "Staged module.json missing required field: $requiredField"
        }
    }

    Copy-Item "README.md" (Join-Path $stagingDir "README.md") -Force
    Copy-Item "scripts" (Join-Path $stagingDir "scripts") -Recurse -Force
    Copy-Item "languages" (Join-Path $stagingDir "languages") -Recurse -Force

    if (Test-Path "LICENSE") {
        Copy-Item "LICENSE" (Join-Path $stagingDir "LICENSE") -Force
    }
    if (Test-Path "CHANGELOG.md") {
        Copy-Item "CHANGELOG.md" (Join-Path $stagingDir "CHANGELOG.md") -Force
    }

    foreach ($path in @($OutputZipPath, $PackagePath)) {
        if (Test-Path $path) {
            Remove-Item $path -Force
        }
    }

    Compress-Archive -Path (Join-Path $stagingDir "*") -DestinationPath $OutputZipPath -Force
    Copy-Item $OutputZipPath $PackagePath -Force

    Write-Host "Release manifest: $(Join-Path $stagingDir 'module.json')" -ForegroundColor Green
    Write-Host "Release archive: $OutputZipPath" -ForegroundColor Green
    Write-Host "Versioned archive: $PackagePath" -ForegroundColor Green
}
finally {
    Pop-Location
}