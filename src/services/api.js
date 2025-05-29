// API 服务类
class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:3001/api';
    this.timeout = 600000; // 增加到600秒超时
    this.pendingRequests = new Map(); // 跟踪待处理的请求
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: this.timeout,
      ...options,
    };

    try {
      console.log(`🌐 API 请求: ${config.method} ${url}`);
      
      const controller = new AbortController();
      // const timeoutId = setTimeout(() => {
      //   console.log(`⏰ 请求超时: ${config.method} ${url}`);
      //   controller.abort();
      // }, this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      // clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ API 响应:`, data);
      return data;
      
    } catch (error) {
      console.error(`❌ API 错误:`, error);
      
      if (error.name === 'AbortError') {
        // 区分是超时还是主动中断
        throw new Error('请求被中断或超时');
      }
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('无法连接到服务器，请确保后端服务已启动');
      }
      
      throw error;
    }
  }

  // GET 请求
  async get(endpoint) {
    return this.request(endpoint);
  }

  // POST 请求
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 获取服务状态
  async getStatus() {
    return this.get('/status');
  }

  // 连接 ADB 设备
  async connectAdb() {
    return this.post('/adb/connect');
  }

  // 断开 ADB 连接
  async disconnectAdb() {
    return this.post('/adb/disconnect');
  }

  // 启用测试模式
  async enableTestMode() {
    return this.post('/adb/enable-test-mode');
  }

  // 执行车辆信号命令 - 优化版本
  async executeVehicleCommand(signal, value) {
    // 为频繁的车速命令使用较短的超时时间
    const originalTimeout = this.timeout;
    if (signal === 'VehSpd') {
      this.timeout = 5000; // 车速命令使用5秒超时
    }
    
    try {
      const result = await this.post('/adb/vehicle-command', { signal, value });
      return result;
    } finally {
      this.timeout = originalTimeout; // 恢复原始超时时间
    }
  }

  // 执行自定义 ADB 命令
  async executeCustomCommand(command) {
    return this.post('/adb/custom-command', { command });
  }
}

// 创建单例实例
const apiService = new ApiService();

export default apiService; 