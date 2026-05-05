$ErrorActionPreference = "Continue"
$BASE_URL = "http://localhost:8080/v1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SmartWardrobe API Test - Clothes CRUD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$tempDir = $env:TEMP

# 1. Register/Login
Write-Host "[1/6] Testing Register..." -ForegroundColor Yellow
$regResult = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method POST -ContentType "application/json" -Body '{"email":"testcrud@api.com","password":"test123456"}' -UseBasicParsing
if ($regResult.code -eq 200) {
    Write-Host "Register OK" -ForegroundColor Green
    $token = $regResult.data.access_token
} else {
    Write-Host "Register failed, trying login..." -ForegroundColor Yellow
    $loginResult = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"testcrud@api.com","password":"test123456"}' -UseBasicParsing
    if ($loginResult.code -eq 200) {
        Write-Host "Login OK" -ForegroundColor Green
        $token = $loginResult.data.access_token
    } else {
        Write-Host "Login FAILED: $($loginResult.message)" -ForegroundColor Red
        exit 1
    }
}
Write-Host "Token obtained" -ForegroundColor Gray
Write-Host ""

# 2. Get Clothes List
Write-Host "[2/6] Testing Get Clothes List..." -ForegroundColor Yellow
$headers = @{ "Authorization" = "Bearer $token" }
$listResult = Invoke-RestMethod -Uri "$BASE_URL/clothes?page=1&per_page=10" -Method GET -Headers $headers -UseBasicParsing
if ($listResult.code -eq 200) {
    Write-Host "Get List OK - Total: $($listResult.data.pagination.total_items)" -ForegroundColor Green
} else {
    Write-Host "Get List FAILED" -ForegroundColor Red
}
Write-Host ""

# 3. Get Clothes Stats
Write-Host "[3/6] Testing Get Clothes Stats..." -ForegroundColor Yellow
$statsResult = Invoke-RestMethod -Uri "$BASE_URL/clothes/stats" -Method GET -Headers $headers -UseBasicParsing
if ($statsResult.code -eq 200) {
    Write-Host "Stats: Total=$($statsResult.data.total), Thin=$($statsResult.data.thin_wardrobe), Thick=$($statsResult.data.thick_wardrobe)" -ForegroundColor Green
} else {
    Write-Host "Get Stats FAILED" -ForegroundColor Red
}
Write-Host ""

# 4. Upload Clothing (using curl for multipart)
Write-Host "[4/6] Testing Upload Clothing..." -ForegroundColor Yellow
$bytes = [Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")
$imgPath = "$tempDir\test_img.png"
[IO.File]::WriteAllBytes($imgPath, $bytes)

$uploadJson = curl.exe -s -X POST "$BASE_URL/clothes/upload?wardrobe_type=thin" `
    -H "Authorization: Bearer $token" `
    -F "images=@$imgPath" `
    -F "category=tops" `
    -F "primary_color=#FF0000" `
    -F "name=Test T-Shirt" `
    -F "seasons[]=spring" `
    -F "seasons[]=summer"

$uploadResult = $uploadJson | ConvertFrom-Json
if ($uploadResult.code -eq 200) {
    Write-Host "Upload OK - ID: $($uploadResult.data.clothing_id)" -ForegroundColor Green
    $clothingId = $uploadResult.data.clothing_id
} else {
    Write-Host "Upload FAILED: $($uploadResult.message)" -ForegroundColor Red
    $clothingId = $null
}

Remove-Item $imgPath -Force -ErrorAction SilentlyContinue
Write-Host ""

# 5. Get Single Clothing
if ($clothingId) {
    Write-Host "[5/6] Testing Get Single Clothing..." -ForegroundColor Yellow
    $detailJson = curl.exe -s -X GET "$BASE_URL/clothes/$clothingId" -H "Authorization: Bearer $token"
    $detailResult = $detailJson | ConvertFrom-Json
    if ($detailResult.code -eq 200) {
        Write-Host "Get Detail OK - Name: $($detailResult.data.name)" -ForegroundColor Green
    } else {
        Write-Host "Get Detail FAILED" -ForegroundColor Red
    }
} else {
    Write-Host "[5/6] Skip Get Single Clothing" -ForegroundColor Gray
}
Write-Host ""

# 6. Delete Clothing
if ($clothingId) {
    Write-Host "[6/6] Testing Delete Clothing..." -ForegroundColor Yellow
    $deleteJson = curl.exe -s -X DELETE "$BASE_URL/clothes/$clothingId" -H "Authorization: Bearer $token"
    $deleteResult = $deleteJson | ConvertFrom-Json
    if ($deleteResult.code -eq 200) {
        Write-Host "Delete OK" -ForegroundColor Green
    } else {
        Write-Host "Delete FAILED: $($deleteResult.message)" -ForegroundColor Red
    }
} else {
    Write-Host "[6/6] Skip Delete Clothing" -ForegroundColor Gray
}
Write-Host ""

# Final Stats Check
Write-Host "Final Stats Check..." -ForegroundColor Yellow
$finalStats = Invoke-RestMethod -Uri "$BASE_URL/clothes/stats" -Method GET -Headers $headers -UseBasicParsing
Write-Host "Final: Total=$($finalStats.data.total), Thin=$($finalStats.data.thin_wardrobe), Thick=$($finalStats.data.thick_wardrobe)" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
