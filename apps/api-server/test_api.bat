@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set BASE_URL=http://localhost:8080/api/v1

echo ========================================
echo SmartWardrobe API Test - Clothes CRUD
echo ========================================
echo.

REM 1. Register/Login
echo [1/6] Testing Register...
curl -s -X POST "%BASE_URL%/auth/register" -H "Content-Type: application/json" -d "{\"email\":\"test@crud.com\",\"password\":\"test123456\"}" > temp_register.json
type temp_register.json | findstr /C:"code" | findstr /C:"200" > nul
if %errorlevel%==0 (
    echo Register OK
    for /f "tokens=2 delims=:, " %%a in ('type temp_register.json ^| findstr /C:"access_token"') do set TOKEN=%%a
    set TOKEN=!TOKEN:"=!
    set TOKEN=!TOKEN:,=:!
    set TOKEN=!TOKEN: =!
) else (
    echo Register failed, trying login...
    curl -s -X POST "%BASE_URL%/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"test@crud.com\",\"password\":\"test123456\"}" > temp_login.json
    for /f "tokens=2 delims=:, " %%a in ('type temp_login.json ^| findstr /C:"access_token"') do set TOKEN=%%a
    set TOKEN=!TOKEN:"=!
    set TOKEN=!TOKEN:,=:!
    set TOKEN=!TOKEN: =!
)
del temp_register.json 2>nul
del temp_login.json 2>nul
echo Token: !TOKEN:~0,50!...
echo.

REM 2. Get Clothes List
echo [2/6] Testing Get Clothes List...
curl -s -X GET "%BASE_URL%/clothes?page=1&per_page=10" -H "Authorization: Bearer !TOKEN!" > temp_list.json
type temp_list.json | findstr /C:"code" | findstr /C:"200" > nul
if %errorlevel%==0 (
    echo GET List OK
) else (
    echo GET List FAILED
)
echo.

REM 3. Get Clothes Stats
echo [3/6] Testing Get Clothes Stats...
curl -s -X GET "%BASE_URL%/clothes/stats" -H "Authorization: Bearer !TOKEN!"
echo.
echo.

REM 4. Upload Clothing
echo [4/6] Testing Upload Clothing...
REM Create a minimal 1x1 PNG
echo iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==> temp.png.b64
certutil -decode temp.png.b64 temp_image.png >nul 2>&1
curl -s -X POST "%BASE_URL%/clothes/upload?wardrobe_type=thin" -H "Authorization: Bearer !TOKEN!" -F "images=@temp_image.png" -F "category=tops" -F "primary_color=#FF0000" -F "name=Test T-Shirt" -F "seasons[]=spring" > temp_upload.json
type temp_upload.json | findstr /C:"code" | findstr /C:"200" > nul
if %errorlevel%==0 (
    echo Upload OK
    for /f "tokens=2 delims=:, " %%a in ('type temp_upload.json ^| findstr /C:"clothing_id"') do set CLOTHING_ID=%%a
    set CLOTHING_ID=!CLOTHING_ID:"=!
    set CLOTHING_ID=!CLOTHING_ID:,=!
    set CLOTHING_ID=!CLOTHING_ID: =!
) else (
    echo Upload FAILED
    set CLOTHING_ID=
)
del temp.png.b64 2>nul
del temp_image.png 2>nul
echo Clothing ID: !CLOTHING_ID!
echo.

REM 5. Get Single Clothing
if not "!CLOTHING_ID!"=="" (
    echo [5/6] Testing Get Single Clothing...
    curl -s -X GET "%BASE_URL%/clothes/!CLOTHING_ID!" -H "Authorization: Bearer !TOKEN!"
    echo.
) else (
    echo [5/6] Skip Get Single Clothing (no ID)
)
echo.

REM 6. Delete Clothing
if not "!CLOTHING_ID!"=="" (
    echo [6/6] Testing Delete Clothing...
    curl -s -X DELETE "%BASE_URL%/clothes/!CLOTHING_ID!" -H "Authorization: Bearer !TOKEN!"
    echo.
) else (
    echo [6/6] Skip Delete Clothing (no ID)
)
echo.

del temp_list.json 2>nul
del temp_upload.json 2>nul

echo ========================================
echo Test Complete!
echo ========================================
pause
