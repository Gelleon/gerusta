Param()

$ErrorActionPreference = 'Stop'
$AdminLogin = $env:ADMIN_LOGIN
$AdminPassword = $env:ADMIN_PASSWORD

if ([string]::IsNullOrWhiteSpace($AdminLogin) -or [string]::IsNullOrWhiteSpace($AdminPassword)) {
  throw 'Set ADMIN_LOGIN and ADMIN_PASSWORD before running this script.'
}

Write-Host "Logging in..."
$LoginBody = @{
  email = $AdminLogin
  password = $AdminPassword
} | ConvertTo-Json

$login = Invoke-RestMethod `
  -Method Post `
  -Uri 'http://localhost:3001/auth/login' `
  -ContentType 'application/json' `
  -Body $LoginBody

$token = $login.access_token
Write-Host "Token acquired."

Write-Host "Requesting AI article..."
$result = Invoke-RestMethod `
  -Method Post `
  -Uri 'http://localhost:3001/ai/generate-article' `
  -ContentType 'application/json' `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body '{"topic":"Test article","keywords":"demo"}'

Write-Host "AI Response:"
Write-Output $result
