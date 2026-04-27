param()

$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot

try {
    $module = Get-Content "module.json" -Raw | ConvertFrom-Json
    $moduleId = $module.id
    $version = $module.version
    $packageDir = "packages"
    $packagePath = Join-Path $packageDir "$moduleId-$version.zip"
    $stagingDir = Join-Path $projectRoot "dist-release"

    Write-Host "Packaging $moduleId v$version..." -ForegroundColor Cyan

    if (Test-Path $stagingDir) {
        Remove-Item $stagingDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $stagingDir | Out-Null

    if (-not (Test-Path $packageDir)) {
        New-Item -ItemType Directory -Path $packageDir | Out-Null
    }

    Copy-Item "module.json" (Join-Path $stagingDir "module.json") -Force
    Copy-Item "README.md" (Join-Path $stagingDir "README.md") -Force
    if (Test-Path "LICENSE") {
        Copy-Item "LICENSE" (Join-Path $stagingDir "LICENSE") -Force
    }
    if (Test-Path "CHANGELOG.md") {
        Copy-Item "CHANGELOG.md" (Join-Path $stagingDir "CHANGELOG.md") -Force
    }
    Copy-Item "scripts" (Join-Path $stagingDir "scripts") -Recurse -Force
    Copy-Item "languages" (Join-Path $stagingDir "languages") -Recurse -Force

    if (Test-Path $packagePath) {
        Remove-Item $packagePath -Force
    }

    Compress-Archive -Path (Join-Path $stagingDir "*") -DestinationPath $packagePath -Force

    Write-Host "Package created: $packagePath" -ForegroundColor Green
}
finally {
    Pop-Location
}