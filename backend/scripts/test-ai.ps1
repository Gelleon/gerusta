Param()

$ErrorActionPreference = 'Stop'

Write-Host "Logging in..."
$login = Invoke-RestMethod `
  -Method Post `
  -Uri 'http://localhost:3001/auth/login' `
  -ContentType 'application/json' `
  -Body '{"email":"admin@example.com","password":"admin123"}'

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
