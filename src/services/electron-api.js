// Electron IPC API 服务类
class ElectronApiService {
  constructor() {
    // 检查是否在 Electron 环境中
    this.isElectron = typeof window !== 'undefined' && window.vhalAPI && window.vhalAPI.isElectron
    console.log(`[ElectronAPI] 运行环境: ${this.isElectron ? 'Electron' : 'Browser'}`)
  }

  // 检查 Electron 环境
  checkElectronEnvironment() {
    if (!this.isElectron) {
      throw new Error('此功能仅在 Electron 环境中可用')
    }
  }

  // 获取服务状态
  async getStatus() {
    this.checkElectronEnvironment()
    console.log(`🌐 [ElectronAPI] 获取服务状态`)
    
    try {
      const result = await window.vhalAPI.getStatus()
      console.log(`✅ [ElectronAPI] 状态响应:`, result)
      return result
    } catch (error) {
      console.error(`❌ [ElectronAPI] 状态错误:`, error)
      throw error
    }
  }

  // 连接 ADB 设备
  async connectAdb() {
    this.checkElectronEnvironment()
    console.log(`🌐 [ElectronAPI] 连接 ADB 设备`)
    
    try {
      const result = await window.vhalAPI.connectAdb()
      console.log(`✅ [ElectronAPI] 连接响应:`, result)
      return result
    } catch (error) {
      console.error(`❌ [ElectronAPI] 连接错误:`, error)
      throw error
    }
  }

  // 断开 ADB 连接
  async disconnectAdb() {
    this.checkElectronEnvironment()
    console.log(`🌐 [ElectronAPI] 断开 ADB 连接`)
    
    try {
      const result = await window.vhalAPI.disconnectAdb()
      console.log(`✅ [ElectronAPI] 断开响应:`, result)
      return result
    } catch (error) {
      console.error(`❌ [ElectronAPI] 断开错误:`, error)
      throw error
    }
  }

  // 启用测试模式
  async enableTestMode() {
    this.checkElectronEnvironment()
    console.log(`🌐 [ElectronAPI] 启用测试模式`)
    
    try {
      const result = await window.vhalAPI.enableTestMode()
      console.log(`✅ [ElectronAPI] 测试模式响应:`, result)
      return result
    } catch (error) {
      console.error(`❌ [ElectronAPI] 测试模式错误:`, error)
      throw error
    }
  }

  // 执行车辆信号命令
  async executeVehicleCommand(signal, value) {
    this.checkElectronEnvironment()
    console.log(`🌐 [ElectronAPI] 执行车辆命令: ${signal}=${value}`)
    
    try {
      const result = await window.vhalAPI.executeVehicleCommand(signal, value)
      console.log(`✅ [ElectronAPI] 车辆命令响应:`, result)
      return result
    } catch (error) {
      console.error(`❌ [ElectronAPI] 车辆命令错误:`, error)
      throw error
    }
  }

  // 执行自定义 ADB 命令
  async executeCustomCommand(command) {
    this.checkElectronEnvironment()
    console.log(`🌐 [ElectronAPI] 执行自定义命令: ${command}`)
    
    try {
      const result = await window.vhalAPI.executeCustomCommand(command)
      console.log(`✅ [ElectronAPI] 自定义命令响应:`, result)
      return result
    } catch (error) {
      console.error(`❌ [ElectronAPI] 自定义命令错误:`, error)
      throw error
    }
  }
}

// 创建单例实例
const electronApiService = new ElectronApiService()

export default electronApiService 