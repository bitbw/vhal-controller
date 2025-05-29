@echo off
echo 🚀 启动 VHAL Controller 开发环境
echo.

echo 📦 安装后端依赖...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ 后端依赖安装失败
    pause
    exit /b 1
)

echo.
echo 🔧 启动后端服务...
start "VHAL Controller Backend" cmd /k "npm run dev"

echo.
echo ⏳ 等待后端服务启动...
timeout /t 3 /nobreak > nul

echo.
echo 🎨 启动前端服务...
cd ..
start "VHAL Controller Frontend" cmd /k "npm run dev"

echo.
echo ✅ 开发环境启动完成！
echo.
echo 📡 后端服务: http://localhost:3001
echo 🌐 前端应用: http://localhost:8080
echo.
echo 💡 提示:
echo   1. 确保 Android SDK 已安装并添加到 PATH
echo   2. 确保设备已连接并启用 USB 调试
echo   3. 两个命令行窗口将保持打开状态
echo.
pause 