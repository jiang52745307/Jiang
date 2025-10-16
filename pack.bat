@echo off
echo 正在准备打包时光邮局应用...
echo.

REM 创建临时文件夹
mkdir temp_package 2>nul

REM 复制必要文件
echo 复制必要文件...
copy index.html temp_package\
copy styles.css temp_package\
copy script.js temp_package\
copy server.js temp_package\
copy package.json temp_package\
copy package-lock.json temp_package\
copy README.md temp_package\
copy DEPLOY.md temp_package\
copy EMAIL_SETUP.md temp_package\
copy Dockerfile temp_package\
copy start.bat temp_package\

REM 创建默认配置文件
echo 创建默认配置文件...
copy .env.example temp_package\.env

REM 创建logs目录
echo 创建日志目录...
mkdir temp_package\logs

REM 创建README说明
echo 创建部署说明...
echo 请在使用前修改.env文件中的邮箱配置！ > temp_package\README.txt
echo 详细配置说明请参阅EMAIL_SETUP.md文件 >> temp_package\README.txt
echo. >> temp_package\README.txt
echo 测试邮件功能: http://您的域名或IP:3000/test-mail >> temp_package\README.txt
echo 查看系统状态: http://您的域名或IP:3000/mail-status >> temp_package\README.txt

REM 创建zip文件
echo 创建zip文件...

REM 检查是否有7-Zip
where 7z >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo 使用7-Zip创建归档...
    7z a -tzip future-letter.zip .\temp_package\*
) else (
    echo 使用PowerShell创建归档...
    powershell -command "Compress-Archive -Path .\temp_package\* -DestinationPath future-letter.zip -Force"
)

REM 清理临时文件
echo 清理临时文件...
rmdir /s /q temp_package

echo.
echo 打包完成！文件已保存为 future-letter.zip
echo.

pause 