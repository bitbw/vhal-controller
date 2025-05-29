const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动 VHAL Controller 开发环境\n');

// 启动后端服务
console.log('🔧 启动后端服务...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// 等待 3 秒后启动前端
setTimeout(() => {
  console.log('\n🎨 启动前端服务...');
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  frontend.on('close', (code) => {
    console.log(`前端服务退出，代码: ${code}`);
    backend.kill();
  });
}, 3000);

backend.on('close', (code) => {
  console.log(`后端服务退出，代码: ${code}`);
});

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\n正在关闭服务...');
  backend.kill();
  process.exit();
});

console.log('\n✅ 开发环境启动完成！');
console.log('\n📡 后端服务: http://localhost:3001');
console.log('🌐 前端应用: http://localhost:8080');
console.log('\n💡 提示:');
console.log('  1. 确保 Android SDK 已安装并添加到 PATH');
console.log('  2. 确保设备已连接并启用 USB 调试');
console.log('  3. 按 Ctrl+C 停止所有服务\n'); 