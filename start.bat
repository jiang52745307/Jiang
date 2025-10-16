@echo off
echo 正在启动时光邮局应用...
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 错误: 未检测到Node.js
    echo 请先安装Node.js，然后再运行此脚本
    echo 您可以从 https://nodejs.org/ 下载Node.js
    pause
    exit /b
)

REM 检查是否已安装依赖
if not exist node_modules (
    echo 正在安装依赖，这可能需要几分钟时间...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo 安装依赖失败，请检查您的网络连接
        pause
        exit /b
    )
)

REM 启动应用
echo 依赖已安装，正在启动应用...
echo.
echo 应用将在 http://localhost:3000 运行
echo 请在浏览器中访问此地址
echo.
echo 按 Ctrl+C 可以停止应用
echo.
call npm start

pause 