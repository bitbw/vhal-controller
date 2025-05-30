@echo off
echo 🚀 启动 VHAL Controller Electron 应用
echo.

echo 📦 检查依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo.
echo ⚡ 启动 Electron 应用...
echo.
echo 💡 提示:
echo   1. Electron 版本使用 IPC 通信，性能更佳
echo   2. 确保 Android SDK 已安装并添加到 PATH
echo   3. 确保设备已连接并启用 USB 调试
echo.

call npm run electron:dev

pause 