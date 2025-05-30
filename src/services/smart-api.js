import httpApiService from './api.js'
import electronApiService from './electron-api.js'

// 智能 API 服务 - 自动选择最优通信方式
class SmartApiService {
  constructor() {
    // 检测运行环境
    this.isElectron = typeof window !== 'undefined' && window.vhalAPI && window.vhalAPI.isElectron
    this.apiService = this.isElectron ? electronApiService : httpApiService
    
    console.log(`🚀 [SmartAPI] 初始化完成`)
    console.log(`📡 [SelectronmartAPI] 通信方式: ${this.isElectron ? 'Electron IPC (超快速)' : 'HTTP (标准)'}`)
    console.log(`⚡ [SmartAPI] 预期延迟: ${this.isElectron ? '<1ms' : '10-50ms'}`)
  }

  // 获取当前使用的 API 类型
  getApiType() {
    return this.isElectron ? 'electron' : 'http'
  }

  // 获取服务状态
  async getStatus() {
    console.log(`🔍 [SmartAPI] 获取服务状态 (${this.getApiType()})`)
    return await this.apiService.getStatus()
  }

  // 连接 ADB 设备
  async connectAdb() {
    console.log(`🔗 [SmartAPI] 连接 ADB 设备 (${this.getApiType()})`)
    return await this.apiService.connectAdb()
  }

  // 断开 ADB 连接
  async disconnectAdb() {
    console.log(`🔌 [SmartAPI] 断开 ADB 连接 (${this.getApiType()})`)
    return await this.apiService.disconnectAdb()
  }

  // 启用测试模式
  async enableTestMode() {
    console.log(`🧪 [SmartAPI] 启用测试模式 (${this.getApiType()})`)
    return await this.apiService.enableTestMode()
  }

  // 执行车辆信号命令
  async executeVehicleCommand(signal, value) {
    console.log(`🚗 [SmartAPI] 执行车辆命令: ${signal}=${value} (${this.getApiType()})`)
    const startTime = performance.now()
    
    try {
      const result = await this.apiService.executeVehicleCommand(signal, value)
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)
      
      console.log(`⚡ [SmartAPI] 命令执行完成，耗时: ${duration}ms`)
      return result
    } catch (error) {
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)
      console.error(`❌ [SmartAPI] 命令执行失败，耗时: ${duration}ms`, error)
      throw error
    }
  }

  // 执行自定义 ADB 命令
  async executeCustomCommand(command) {
    console.log(`⚙️ [SmartAPI] 执行自定义命令: ${command} (${this.getApiType()})`)
    return await this.apiService.executeCustomCommand(command)
  }

  // 获取性能统计
  getPerformanceInfo() {
    return {
      apiType: this.getApiType(),
      isElectron: this.isElectron,
      expectedLatency: this.isElectron ? '<1ms' : '10-50ms',
      communicationMethod: this.isElectron ? 'IPC (进程间通信)' : 'HTTP (网络请求)',
      advantages: this.isElectron 
        ? ['零网络延迟', '直接内存通信', '更好的错误处理', '更快的响应速度']
        : ['跨平台兼容', '标准 Web 技术', '易于调试', '支持远程访问']
    }
  }
}

// 创建单例实例
const smartApiService = new SmartApiService()

export default smartApiService 