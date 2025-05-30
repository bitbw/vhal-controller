<template>
  <q-page class="row items-center justify-evenly">
    <div class="q-pa-md" style="max-width: 600px; width: 100%;">
      <div class="text-h4 q-mb-md text-center">车辆速度控制</div>
      
      <!-- 服务状态 -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">服务状态</div>
          <div class="row items-center q-mt-sm q-gutter-md">
            <div class="row items-center">
              <q-icon 
                :name="serverStatus.adbAvailable ? 'check_circle' : 'error'" 
                :color="serverStatus.adbAvailable ? 'green' : 'red'" 
                size="sm" 
                class="q-mr-sm"
              />
              <span>ADB: {{ serverStatus.adbAvailable ? '可用' : '不可用' }}</span>
            </div>
            <div class="row items-center">
              <q-icon 
                :name="serverStatus.deviceConnected ? 'check_circle' : 'error'" 
                :color="serverStatus.deviceConnected ? 'green' : 'red'" 
                size="sm" 
                class="q-mr-sm"
              />
              <span>设备: {{ serverStatus.deviceConnected ? '已连接' : '未连接' }}</span>
            </div>
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn 
            label="刷新状态" 
            color="info"
            @click="refreshStatus"
            :loading="refreshingStatus"
            size="sm"
          />
        </q-card-actions>
      </q-card>
      
      <!-- 性能监控 -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">性能监控</div>
          <div class="row items-center q-mt-sm q-gutter-md">
            <div class="row items-center">
              <q-icon 
                :name="performanceInfo.isElectron ? 'flash_on' : 'wifi'" 
                :color="performanceInfo.isElectron ? 'orange' : 'blue'" 
                size="sm" 
                class="q-mr-sm"
              />
              <span>通信: {{ performanceInfo.communicationMethod }}</span>
            </div>
            <div class="row items-center">
              <q-icon 
                name="speed" 
                color="green" 
                size="sm" 
                class="q-mr-sm"
              />
              <span>延迟: {{ performanceInfo.expectedLatency }}</span>
            </div>
            <div v-if="averageResponseTime > 0" class="row items-center">
              <q-icon 
                name="timer" 
                color="purple" 
                size="sm" 
                class="q-mr-sm"
              />
              <span>平均响应: {{ averageResponseTime }}ms</span>
            </div>
          </div>
          <div class="q-mt-sm">
            <q-chip 
              v-for="advantage in performanceInfo.advantages" 
              :key="advantage"
              :color="performanceInfo.isElectron ? 'orange' : 'blue'"
              text-color="white"
              size="sm"
              class="q-mr-xs q-mb-xs"
            >
              {{ advantage }}
            </q-chip>
          </div>
        </q-card-section>
      </q-card>
      
      <!-- 连接状态 -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">连接状态</div>
          <div class="row items-center q-mt-sm q-gutter-md">
            <div class="row items-center">
              <q-icon 
                :name="isConnected ? 'check_circle' : 'error'" 
                :color="isConnected ? 'green' : 'red'" 
                size="sm" 
                class="q-mr-sm"
              />
              <span>ADB: {{ isConnected ? '已连接' : '未连接' }}</span>
            </div>
            <div class="row items-center">
              <q-icon 
                :name="isTestModeEnabled ? 'check_circle' : 'error'" 
                :color="isTestModeEnabled ? 'green' : 'red'" 
                size="sm" 
                class="q-mr-sm"
              />
              <span>测试模式: {{ isTestModeEnabled ? '已启用' : '未启用' }}</span>
            </div>
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn 
            :label="isConnected ? '断开连接' : '连接设备'" 
            :color="isConnected ? 'negative' : 'primary'"
            @click="toggleConnection"
            :loading="connecting"
          />
          <q-btn 
            label="启用测试模式" 
            color="orange"
            @click="enableTestMode"
            :disable="!isConnected"
            :loading="enablingTestMode"
          />
        </q-card-actions>
      </q-card>

      <!-- 车速控制 -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">车辆速度 (VehSpd)</div>
          
          <!-- 当前速度显示 -->
          <div class="text-center q-mb-lg">
            <div class="text-h2 text-primary">{{ vehSpd }}</div>
            <div class="text-subtitle1 text-grey-6">km/h</div>
          </div>

          <!-- 速度滑块 -->
          <div class="q-mb-md">
            <q-slider
              v-model="vehSpd"
              :min="0"
              :max="300"
              :step="1"
              label
              :label-value="`${vehSpd} km/h`"
              label-always
              color="primary"
              track-color="grey-3"
              thumb-color="primary"
              :markers="50"
              snap
              @update:model-value="onSpeedChange"
              :disable="!canControlSpeed"
              class="q-mt-lg"
            />
          </div>

          <!-- 预设速度按钮 -->
          <div class="text-subtitle2 q-mb-sm">快速设置:</div>
          <div class="row q-gutter-sm q-mb-md">
            <q-btn 
              v-for="preset in speedPresets" 
              :key="preset"
              :label="`${preset}`"
              size="sm"
              outline
              color="primary"
              @click="setSpeedImmediately(preset)"
              :disable="!canControlSpeed"
            />
          </div>

          <!-- 手动输入 -->
          <div class="row q-gutter-md items-end">
            <q-input
              v-model.number="manualSpeed"
              type="number"
              label="手动输入速度"
              suffix="km/h"
              :min="0"
              :max="300"
              style="flex: 1"
              outlined
              dense
              :disable="!canControlSpeed"
            />
            <q-btn 
              label="设置" 
              color="primary"
              @click="setSpeedImmediately(manualSpeed)"
              :disable="!canControlSpeed || !isValidSpeed(manualSpeed)"
            />
          </div>

          <!-- 状态提示 -->
          <div v-if="!canControlSpeed" class="q-mt-md">
            <q-banner class="bg-orange-1 text-orange-8">
              <template v-slot:avatar>
                <q-icon name="warning" color="orange" />
              </template>
              请先连接设备并启用测试模式才能控制车速
            </q-banner>
          </div>
        </q-card-section>
      </q-card>

      <!-- 命令历史 -->
      <q-card class="q-mt-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">命令历史</div>
          <q-scroll-area style="height: 200px;">
            <div v-if="commandHistory.length === 0" class="text-center text-grey-6 q-pa-md">
              暂无命令历史
            </div>
            <div v-for="(cmd, index) in commandHistory" :key="index" class="q-mb-sm">
              <q-chip 
                :color="cmd.success ? 'green' : 'red'" 
                text-color="white" 
                size="sm"
                class="q-mr-sm"
              >
                {{ cmd.success ? '成功' : '失败' }}
              </q-chip>
              <code class="text-caption">{{ cmd.command }}</code>
              <div class="text-caption text-grey-6">{{ cmd.timestamp }}</div>
              <div v-if="cmd.output" class="text-caption text-grey-7 q-ml-md">
                输出: {{ cmd.output }}
              </div>
              <div v-if="cmd.error" class="text-caption text-red-7 q-ml-md">
                错误: {{ cmd.error }}
              </div>
            </div>
          </q-scroll-area>
        </q-card-section>
        <q-card-actions>
          <q-btn 
            label="清空历史" 
            color="grey"
            size="sm"
            @click="clearHistory"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import smartApiService from '../services/smart-api.js'

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const $q = useQuasar()
    
    // 响应式数据
    const vehSpd = ref(0)
    const manualSpeed = ref(0)
    const isConnected = ref(false)
    const isTestModeEnabled = ref(false)
    const connecting = ref(false)
    const enablingTestMode = ref(false)
    const refreshingStatus = ref(false)
    const commandHistory = ref([])
    const serverStatus = ref({
      adbAvailable: false,
      deviceConnected: false
    })
    
    // 性能监控
    const performanceInfo = ref(smartApiService.getPerformanceInfo())
    const commandTimes = ref([])
    
    // 预设速度
    const speedPresets = [0, 30, 60, 80, 100, 120, 150]
    
    // 计算属性
    const canControlSpeed = computed(() => {
      return isConnected.value && isTestModeEnabled.value
    })
    
    // 平均响应时间
    const averageResponseTime = computed(() => {
      if (commandTimes.value.length === 0) return 0
      const sum = commandTimes.value.reduce((a, b) => a + b, 0)
      return Math.round(sum / commandTimes.value.length)
    })
    
    // 检查速度是否有效
    const isValidSpeed = (speed) => {
      return speed >= 0 && speed <= 300 && !isNaN(speed)
    }
    
    // 添加命令到历史记录
    const addToHistory = (command, success = true, output = '', error = '', duration = 0) => {
      commandHistory.value.unshift({
        command,
        success,
        output,
        error,
        duration,
        timestamp: new Date().toLocaleTimeString()
      })
      
      // 记录响应时间
      if (success && duration > 0) {
        commandTimes.value.unshift(duration)
        if (commandTimes.value.length > 20) {
          commandTimes.value.pop()
        }
      }
      
      // 限制历史记录数量
      if (commandHistory.value.length > 50) {
        commandHistory.value.pop()
      }
    }
    
    // 速度改变时的处理 - 立即执行
    const onSpeedChange = async (value) => {
      console.log(`[BOWEN_LOG] 🎯 速度改变: ${value}`);
      
      if (!canControlSpeed.value) {
        $q.notify({
          type: 'warning',
          message: '请先连接设备并启用测试模式'
        })
        return
      }
      
      try {
        console.log(`[BOWEN_LOG] 🚀 执行速度命令: ${value}`);
        const startTime = performance.now()
        const response = await smartApiService.executeVehicleCommand('VehSpd', value)
        const endTime = performance.now()
        const duration = Math.round(endTime - startTime)
        
        if (response.success) {
          addToHistory(response.data.command, true, response.data.output, '', duration)
          // 只在控制台记录成功，不显示通知避免过多提示
          console.log(`[BOWEN_LOG] ✅ 车速设置成功: ${value} km/h (${duration}ms)`);
        } else {
          addToHistory(response.data?.command || `VehSpd:${value}`, false, '', response.message, duration)
          $q.notify({
            type: 'negative',
            message: response.message
          })
        }
      } catch (error) {
        // 忽略 AbortError，这是正常的请求中断
        if (error.message.includes('AbortError') || error.message.includes('aborted')) {
          console.log(`[BOWEN_LOG] 请求被中断 (正常): ${value}`);
          return
        }
        
        addToHistory(`vehicle_tool -s VehSpd:${value}`, false, '', error.message)
        console.error(`[BOWEN_LOG] ❌ 设置车速失败: ${error.message}`);
        // 只在控制台记录错误，避免频繁的错误通知
      }
    }
    
    // 立即执行版本（用于预设按钮和手动输入）
    const setSpeedImmediately = async (value) => {
      // 如果是手动输入，需要验证并设置滑块值
      if (!isValidSpeed(value)) {
        $q.notify({
          type: 'warning',
          message: '请输入有效的速度值 (0-300)'
        })
        return
      }
      
      // 更新滑块值
      vehSpd.value = value
      
      // 立即执行，这里显示成功通知
      if (!canControlSpeed.value) {
        $q.notify({
          type: 'warning',
          message: '请先连接设备并启用测试模式'
        })
        return
      }
      
      try {
        console.log(`[BOWEN_LOG] 🚀 立即执行速度命令: ${value}`);
        const startTime = performance.now()
        const response = await smartApiService.executeVehicleCommand('VehSpd', value)
        const endTime = performance.now()
        const duration = Math.round(endTime - startTime)
        
        if (response.success) {
          addToHistory(response.data.command, true, response.data.output, '', duration)
          $q.notify({
            type: 'positive',
            message: `车速已设置为 ${value} km/h (${duration}ms)`,
            timeout: 1000
          })
        } else {
          addToHistory(response.data?.command || `VehSpd:${value}`, false, '', response.message, duration)
          $q.notify({
            type: 'negative',
            message: response.message
          })
        }
      } catch (error) {
        // 忽略 AbortError
        if (error.message.includes('AbortError') || error.message.includes('aborted')) {
          console.log(`[BOWEN_LOG] 请求被中断 (正常): ${value}`);
          return
        }
        
        addToHistory(`vehicle_tool -s VehSpd:${value}`, false, '', error.message)
        $q.notify({
          type: 'negative',
          message: '设置车速失败',
          caption: error.message
        })
      }
    }
    
    // 刷新服务状态
    const refreshStatus = async () => {
      refreshingStatus.value = true
      try {
        const response = await smartApiService.getStatus()
        if (response.success) {
          serverStatus.value = response.data
          isConnected.value = response.data.isAdbConnected
          isTestModeEnabled.value = response.data.isTestModeEnabled
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: '获取服务状态失败',
          caption: error.message
        })
      } finally {
        refreshingStatus.value = false
      }
    }
    
    // 连接/断开设备
    const toggleConnection = async () => {
      connecting.value = true
      
      try {
        if (isConnected.value) {
          // 断开连接
          const response = await smartApiService.disconnectAdb()
          if (response.success) {
            isConnected.value = false
            isTestModeEnabled.value = false
            addToHistory('adb disconnect', true, response.message)
            $q.notify({
              type: 'info',
              message: response.message
            })
          }
        } else {
          // 连接设备
          const response = await smartApiService.connectAdb()
          if (response.success) {
            isConnected.value = true
            addToHistory(response.data.command, true, response.message)
            $q.notify({
              type: 'positive',
              message: response.message
            })
          }
        }
      } catch (error) {
        addToHistory(isConnected.value ? 'adb disconnect' : 'adb root && adb shell', false, '', error.message)
        $q.notify({
          type: 'negative',
          message: '操作失败',
          caption: error.message
        })
      } finally {
        connecting.value = false
        // 刷新状态
        await refreshStatus()
      }
    }
    
    // 启用测试模式
    const enableTestMode = async () => {
      enablingTestMode.value = true
      
      try {
        const response = await smartApiService.enableTestMode()
        if (response.success) {
          isTestModeEnabled.value = true
          addToHistory(response.data.command, true, response.data.output)
          $q.notify({
            type: 'positive',
            message: response.message
          })
        } else {
          addToHistory(response.data?.command || 'enable test mode', false, '', response.message)
          $q.notify({
            type: 'negative',
            message: response.message
          })
        }
      } catch (error) {
        addToHistory('vehicle_tool -s DEBUG_COMMAND:enable_test_mode=1', false, '', error.message)
        $q.notify({
          type: 'negative',
          message: '启用测试模式失败',
          caption: error.message
        })
      } finally {
        enablingTestMode.value = false
      }
    }
    
    // 清空历史记录
    const clearHistory = () => {
      commandHistory.value = []
      $q.notify({
        type: 'info',
        message: '历史记录已清空'
      })
    }
    
    // 组件挂载时的初始化
    onMounted(async () => {
      $q.notify({
        type: 'info',
        message: '欢迎使用 VHAL 控制器',
        caption: '正在检查服务状态...'
      })
      
      // 初始化时刷新状态
      await refreshStatus()
      
      // 定期刷新状态（每30秒）
      setInterval(refreshStatus, 60000)
    })
    
    return {
      vehSpd,
      manualSpeed,
      isConnected,
      isTestModeEnabled,
      connecting,
      enablingTestMode,
      refreshingStatus,
      commandHistory,
      serverStatus,
      speedPresets,
      canControlSpeed,
      isValidSpeed,
      refreshStatus,
      toggleConnection,
      enableTestMode,
      onSpeedChange,
      setSpeedImmediately,
      clearHistory,
      performanceInfo,
      averageResponseTime
    }
  }
})
</script>

<style scoped>
.q-slider {
  margin: 20px 0;
}

code {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}
</style> 