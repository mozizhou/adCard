@echo off
echo 🎬 APNG 动图处理器 - Windows 版
echo ================================

REM 检查 Python 是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python 未安装，请先安装 Python 3.8+
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python 已安装

REM 检查是否在正确目录
if not exist "requirements.txt" (
    echo ❌ 请在 apng-processor 目录中运行此脚本
    pause
    exit /b 1
)

echo 📦 安装 Python 依赖...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败，尝试使用 --user 参数
    pip install -r requirements.txt --user
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败，请手动安装
        pause
        exit /b 1
    )
)

echo ✅ 依赖安装完成

REM 检查输入文件
set INPUT_FILE=..\out\index\images\index\u1_original.png
if not exist "%INPUT_FILE%" (
    echo ❌ 未找到输入文件: %INPUT_FILE%
    echo 请确保 u1_original.png 文件存在
    pause
    exit /b 1
)

echo 🔍 找到输入文件: %INPUT_FILE%

REM 显示文件大小
for %%A in ("%INPUT_FILE%") do (
    set /a SIZE_MB=%%~zA/1024/1024
    echo 📊 文件大小: !SIZE_MB! MB
)

echo.
echo 🚀 开始处理 APNG 动图...
echo 这可能需要几分钟时间，请耐心等待...
echo.

REM 运行处理脚本
python process_u1.py
if %errorlevel% neq 0 (
    echo ❌ 处理失败
    pause
    exit /b 1
)

echo.
echo 🎉 处理完成！
echo.
echo 📁 输出文件位置: u1_compressed\
echo 📋 详细报告: u1_compressed\compression_report.txt
echo.

REM 显示输出文件
if exist "u1_compressed" (
    echo 📊 生成的文件:
    for %%f in (u1_compressed\compressed.*) do (
        for %%A in ("%%f") do (
            set /a SIZE_MB=%%~zA/1024/1024
            echo   %%~nxf: !SIZE_MB! MB
        )
    )
)

echo.
echo 💡 推荐使用 compressed.webp 文件（质量好，文件小）
echo.
echo 按任意键退出...
pause >nul
