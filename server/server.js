const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ADB 连接状态
let isAdbConnected = false;
let isTestModeEnabled = false;

// 执行 ADB 命令的通用函数
function executeCommand(command, timeout = 15000) {
  return new Promise((resolve, reject) => {
    console.log(`执行命令: ${command}`);
    
    const child = exec(command, { timeout }, (error, stdout, stderr) => {
      if (error) {
        console.error(`命令执行错误: ${error.message}`);
        reject({
          success: false,
          error: error.message,
          stderr: stderr,
          command: command
        });
        return;
      }
      
      if (stderr && stderr.trim() !== '') {
        console.warn(`命令警告: ${stderr}`);
      }
      
      console.log(`命令输出: ${stdout}`);
      resolve({
        success: true,
        stdout: stdout,
        stderr: stderr,
        command: command
      });
    });
    
    // 设置超时处理
    setTimeout(() => {
      child.kill('SIGTERM');
      reject({
        success: false,
        error: '命令执行超时',
        command: command
      });
    }, timeout);
  });
}

// 检查 ADB 是否可用
async function checkAdbAvailable() {
  try {
    const result = await executeCommand('adb version', 5000);
    return result.success;
  } catch (error) {
    return false;
  }
}

// 检查设备连接状态
async function checkDeviceConnection() {
  try {
    const result = await executeCommand('adb devices', 5000);
    if (result.success) {
      const devices = result.stdout.split('\n')
        .filter(line => line.includes('\tdevice'))
        .length;
      return devices > 0;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// API 路由

// 获取服务状态
app.get('/api/status', async (req, res) => {
  try {
    const adbAvailable = await checkAdbAvailable();
    const deviceConnected = adbAvailable ? await checkDeviceConnection() : false;
    
    res.json({
      success: true,
      data: {
        adbAvailable,
        deviceConnected,
        isAdbConnected,
        isTestModeEnabled,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 连接 ADB 设备
app.post('/api/adb/connect', async (req, res) => {
  try {
    // 首先检查 ADB 是否可用
    const adbAvailable = await checkAdbAvailable();
    if (!adbAvailable) {
      return res.status(400).json({
        success: false,
        error: 'ADB 不可用，请确保 Android SDK 已安装并添加到 PATH'
      });
    }
    
    // 获取 root 权限并进入 shell
    const rootResult = await executeCommand('adb root');
    console.log('Root 结果:', rootResult);
    
    // 等待一下让设备重新连接
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 检查设备连接
    const deviceConnected = await checkDeviceConnection();
    if (!deviceConnected) {
      return res.status(400).json({
        success: false,
        error: '未找到连接的设备，请确保设备已连接并启用 USB 调试'
      });
    }
    
    isAdbConnected = true;
    
    res.json({
      success: true,
      message: '设备连接成功',
      data: {
        isAdbConnected: true,
        command: 'adb root && adb shell'
      }
    });
    
  } catch (error) {
    isAdbConnected = false;
    res.status(500).json({
      success: false,
      error: error.message || error.error
    });
  }
});

// 断开 ADB 连接
app.post('/api/adb/disconnect', async (req, res) => {
  try {
    await executeCommand('adb disconnect');
    isAdbConnected = false;
    isTestModeEnabled = false;
    
    res.json({
      success: true,
      message: '设备已断开连接',
      data: {
        isAdbConnected: false,
        isTestModeEnabled: false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || error.error
    });
  }
});

// 启用测试模式
app.post('/api/adb/enable-test-mode', async (req, res) => {
  try {
    if (!isAdbConnected) {
      return res.status(400).json({
        success: false,
        error: '请先连接设备'
      });
    }
    
    const command = 'adb shell "vehicle_tool -s DEBUG_COMMAND:enable_test_mode=1"';
    const result = await executeCommand(command);
    
    if (result.success) {
      isTestModeEnabled = true;
    }
    
    res.json({
      success: result.success,
      message: result.success ? '测试模式已启用' : '测试模式启用失败',
      data: {
        isTestModeEnabled: result.success,
        command: command,
        output: result.stdout
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || error.error
    });
  }
});

// 执行车辆信号命令
app.post('/api/adb/vehicle-command', async (req, res) => {
  try {
    const { signal, value } = req.body;
    
    if (!signal || value === undefined) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数: signal 和 value'
      });
    }
    
    if (!isAdbConnected) {
      return res.status(400).json({
        success: false,
        error: '请先连接设备'
      });
    }
    
    if (!isTestModeEnabled) {
      return res.status(400).json({
        success: false,
        error: '请先启用测试模式'
      });
    }
    
    const command = `adb shell "vehicle_tool -s ${signal}:${value}"`;
    
    // 为车速命令使用较短的超时时间
    const timeout = signal === 'VehSpd' ? 3000 : 10000;
    const result = await executeCommand(command, timeout);
    
    res.json({
      success: result.success,
      message: result.success ? `${signal} 设置为 ${value} 成功` : `${signal} 设置失败`,
      data: {
        signal,
        value,
        command: command,
        output: result.stdout,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || error.error
    });
  }
});

// 执行自定义 ADB 命令
app.post('/api/adb/custom-command', async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({
        success: false,
        error: '缺少命令参数'
      });
    }
    
    // 安全检查：只允许 adb 相关命令
    if (!command.startsWith('adb')) {
      return res.status(400).json({
        success: false,
        error: '只允许执行 ADB 命令'
      });
    }
    
    const result = await executeCommand(command);
    
    res.json({
      success: result.success,
      message: result.success ? '命令执行成功' : '命令执行失败',
      data: {
        command: command,
        output: result.stdout,
        error: result.stderr,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || error.error
    });
  }
});

// 错误处理中间件
app.use((error, req, res) => {
  console.error('服务器错误:', error);
  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 VHAL Controller 后端服务已启动`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`📋 API 文档:`);
  console.log(`   GET  /api/status - 获取服务状态`);
  console.log(`   POST /api/adb/connect - 连接 ADB 设备`);
  console.log(`   POST /api/adb/disconnect - 断开 ADB 连接`);
  console.log(`   POST /api/adb/enable-test-mode - 启用测试模式`);
  console.log(`   POST /api/adb/vehicle-command - 执行车辆信号命令`);
  console.log(`   POST /api/adb/custom-command - 执行自定义 ADB 命令`);
  console.log(`\n⚠️  请确保:`);
  console.log(`   1. Android SDK 已安装并添加到 PATH`);
  console.log(`   2. 设备已连接并启用 USB 调试`);
  console.log(`   3. 设备支持 vehicle_tool 命令\n`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭服务器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 正在关闭服务器...');
  process.exit(0);
}); 