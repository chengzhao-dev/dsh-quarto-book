#Requires -Version 7.0
<#
.SYNOPSIS
    Copy this bundle's skill trees into another repository's .agents layout.

.DESCRIPTION
    The plugin package and an embedded .agents copy have different jobs. This
    script copies only the skill payload, never the bundle manifests or runtime
    directories, so the target repository stays a plain Quarto book.

    Default layout:
      <target>/.agents/skills/writing-quarto/
      <target>/.agents/skills/designing-theme/

    Split layout (for repositories that keep context and knowledge separately,
    such as a book repository that keeps shared conventions under .agents/context):
      <target>/.agents/skills/quarto-writing/writing-quarto/
      <target>/.agents/context/conventions/quarto-writing/
      <target>/.agents/knowledge/quarto-writing/
      <target>/.agents/skills/visual-theme/designing-theme/

.PARAMETER Target
    Repository root that receives the .agents tree.

.PARAMETER Source
    Bundle root. Defaults to the parent of this script.

.PARAMETER SplitLayout
    Use the split context/knowledge layout instead of the default two-skill layout.

.PARAMETER Force
    Replace existing destination directories.

.EXAMPLE
    pwsh -File scripts/embedding-agents.ps1 -Target D:\Github\my-book

.EXAMPLE
    pwsh -File scripts/embedding-agents.ps1 -Target D:\Github\my-book -SplitLayout
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Target,

    [string]$Source = (Split-Path -Parent $PSScriptRoot),

    [switch]$SplitLayout,

    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$forbiddenNames = @('package.json', 'cordis.patch.yml', 'icon.svg')
$forbiddenDirs = @('lib', 'locale')
$excludedDirs = @('__pycache__', '.pytest_cache')

function Resolve-FullPath {
    param([string]$Path, [string]$Label)
    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        throw "$Label does not exist or is not a directory: $Path"
    }
    return (Resolve-Path -LiteralPath $Path).Path
}

function Assert-NoBundleFiles {
    param([string]$Path, [string]$Label)
    foreach ($name in $forbiddenNames) {
        if (Test-Path -LiteralPath (Join-Path $Path $name)) {
            throw "$Label contains bundle file '$name'; refusing to embed: $Path"
        }
    }
    foreach ($name in $forbiddenDirs) {
        if (Test-Path -LiteralPath (Join-Path $Path $name) -PathType Container) {
            throw "$Label contains bundle directory '$name/'; refusing to embed: $Path"
        }
    }
}

function Assert-SkillSource {
    param([string]$Path, [string]$Label)
    $skillFile = Join-Path $Path 'SKILL.md'
    if (-not (Test-Path -LiteralPath $skillFile -PathType Leaf)) {
        throw "$Label has no SKILL.md: $Path"
    }
    Assert-NoBundleFiles -Path $Path -Label $Label
}

function Copy-SkillTree {
    param([string]$From, [string]$To)

    Assert-SkillSource -Path $From -Label 'source skill'
    if (Test-Path -LiteralPath $To) {
        if (-not $Force) {
            throw "destination exists; pass -Force to replace: $To"
        }
        Remove-Item -LiteralPath $To -Recurse -Force
    }
    New-Item -ItemType Directory -Path $To -Force | Out-Null
    Copy-Item -Path (Join-Path $From '*') -Destination $To -Recurse -Force

    foreach ($name in $excludedDirs) {
        Get-ChildItem -LiteralPath $To -Directory -Recurse -Filter $name -ErrorAction SilentlyContinue |
            Remove-Item -Recurse -Force
    }
    Get-ChildItem -LiteralPath $To -File -Recurse -Include '*.pyc', '*.pyo' -ErrorAction SilentlyContinue |
        Remove-Item -Force

    Assert-SkillSource -Path $To -Label 'copied skill'
}

$sourceRoot = Resolve-FullPath -Path $Source -Label 'source'
$targetRoot = Resolve-FullPath -Path $Target -Label 'target'

$writing = Join-Path $sourceRoot 'skills/writing-quarto'
$theme = Join-Path $sourceRoot 'skills/designing-theme'

if ($SplitLayout) {
    $writingDestination = Join-Path $targetRoot '.agents/skills/quarto-writing/writing-quarto'
    $conventionsDestination = Join-Path $targetRoot '.agents/context/conventions/quarto-writing'
    $knowledgeDestination = Join-Path $targetRoot '.agents/knowledge/quarto-writing'
    $themeDestination = Join-Path $targetRoot '.agents/skills/visual-theme/designing-theme'

    $conventions = Join-Path $writing 'conventions'
    $knowledge = Join-Path $writing 'knowledge'
    Assert-NoBundleFiles -Path $conventions -Label 'conventions tree'
    Assert-NoBundleFiles -Path $knowledge -Label 'knowledge tree'

    Copy-SkillTree -From $writing -To $writingDestination
    Remove-Item -LiteralPath (Join-Path $writingDestination 'conventions') -Recurse -Force
    Remove-Item -LiteralPath (Join-Path $writingDestination 'knowledge') -Recurse -Force

    if (Test-Path -LiteralPath $conventionsDestination) {
        if (-not $Force) { throw "destination exists; pass -Force to replace: $conventionsDestination" }
        Remove-Item -LiteralPath $conventionsDestination -Recurse -Force
    }
    New-Item -ItemType Directory -Path $conventionsDestination -Force | Out-Null
    Copy-Item -Path (Join-Path $conventions '*') -Destination $conventionsDestination -Recurse -Force

    if (Test-Path -LiteralPath $knowledgeDestination) {
        if (-not $Force) { throw "destination exists; pass -Force to replace: $knowledgeDestination" }
        Remove-Item -LiteralPath $knowledgeDestination -Recurse -Force
    }
    New-Item -ItemType Directory -Path $knowledgeDestination -Force | Out-Null
    Copy-Item -Path (Join-Path $knowledge '*') -Destination $knowledgeDestination -Recurse -Force
}
else {
    $writingDestination = Join-Path $targetRoot '.agents/skills/writing-quarto'
    $themeDestination = Join-Path $targetRoot '.agents/skills/designing-theme'

    Copy-SkillTree -From $writing -To $writingDestination
}

Copy-SkillTree -From $theme -To $themeDestination

Write-Host "Embedded skills into $targetRoot"
Write-Host "  writing-quarto   -> $writingDestination"
Write-Host "  designing-theme  -> $themeDestination"
if ($SplitLayout) {
    Write-Host "  conventions      -> $conventionsDestination"
    Write-Host "  knowledge        -> $knowledgeDestination"
}
