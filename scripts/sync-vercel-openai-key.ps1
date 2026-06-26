param(
  [string]$BaseUrl = "https://api.x.ai/v1",
  [string]$Model = "grok-4.3",
  [string]$Provider = "compatible",
  [switch]$SkipDeploy
)

$argsForGeneric = @{
  BaseUrl = $BaseUrl
  Model = $Model
  Provider = $Provider
}
if ($SkipDeploy) {
  $argsForGeneric.SkipDeploy = $true
}

& (Join-Path $PSScriptRoot "sync-vercel-api-settings.ps1") @argsForGeneric
