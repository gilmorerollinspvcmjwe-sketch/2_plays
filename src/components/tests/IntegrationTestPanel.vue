<template>
  <div class="integration-test-panel">
    <h2>Phase 6 集成测试面板</h2>
    
    <div class="test-section">
      <h3>系统状态</h3>
      <div class="status-grid">
        <div class="status-item">
          <span class="label">当前天数:</span>
          <span class="value">{{ simulationStore.currentDay }}</span>
        </div>
        <div class="status-item">
          <span class="label">模拟引擎:</span>
          <span :class="['value', simulationStore.isInitialized ? 'success' : 'error']">
            {{ simulationStore.isInitialized ? '已初始化' : '未初始化' }}
          </span>
        </div>
        <div class="status-item">
          <span class="label">员工数量:</span>
          <span class="value">{{ employeeStore.employees.length }}</span>
        </div>
        <div class="status-item">
          <span class="label">运营项目:</span>
          <span class="value">{{ projectStore.operatingProjects.length }}</span>
        </div>
        <div class="status-item">
          <span class="label">角色数量:</span>
          <span class="value">{{ gameStore.characters.length }}</span>
        </div>
        <div class="status-item">
          <span class="label">季节:</span>
          <span class="value">{{ currentSeason }}</span>
        </div>
      </div>
    </div>

    <div class="test-section">
      <h3>快速测试</h3>
      <div class="button-group">
        <button @click="runSingleTick" :disabled="running">
          运行单日模拟
        </button>
        <button @click="runMultiDaySimulation(7)" :disabled="running">
          运行 7 天模拟
        </button>
        <button @click="runMultiDaySimulation(30)" :disabled="running">
          运行 30 天模拟
        </button>
        <button @click="runFullIntegrationTest" :disabled="running">
          运行完整集成测试
        </button>
      </div>
    </div>

    <div class="test-section" v-if="testResults.length > 0">
      <h3>测试结果</h3>
      <div class="test-summary">
        <div class="summary-item success">
          通过：{{ passedCount }}
        </div>
        <div class="summary-item failed">
          失败：{{ failedCount }}
        </div>
        <div class="summary-item">
          总数：{{ testResults.length }}
        </div>
      </div>
      
      <div class="test-results">
        <div 
          v-for="(result, index) in testResults" 
          :key="index"
          :class="['test-result', result.passed ? 'passed' : 'failed']"
        >
          <div class="test-header">
            <span class="test-icon">{{ result.passed ? '✅' : '❌' }}</span>
            <span class="test-name">{{ result.testName }}</span>
          </div>
          <div class="test-message">{{ result.message }}</div>
          <div class="test-duration">{{ result.duration }}ms</div>
        </div>
      </div>
    </div>

    <div class="test-section">
      <h3>详细日志</h3>
      <div class="log-container">
        <div v-for="(log, index) in logs" :key="index" :class="['log-entry', log.level]">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSimulationStore } from '@/stores/simulationStore';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useGameStore } from '@/stores/gameStore';
import { useProjectStore } from '@/stores/projectStore';
import { seasonEventEngine } from '@/engine/seasonEventEngine';
import type { TestResult } from '@/tests/integrationTest';

const simulationStore = useSimulationStore();
const employeeStore = useEmployeeStore();
const gameStore = useGameStore();
const projectStore = useProjectStore();

const running = ref(false);
const testResults = ref<TestResult[]>([]);
const logs = ref<Array<{ time: string; level: 'info' | 'warn' | 'error'; message: string }>>([]);

const currentSeason = computed(() => {
  try {
    const state = seasonEventEngine.getState();
    return state.currentSeason;
  } catch {
    return '未知';
  }
});

const passedCount = computed(() => testResults.value.filter(r => r.passed).length);
const failedCount = computed(() => testResults.value.filter(r => !r.passed).length);

function addLog(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  const now = new Date();
  const time = now.toLocaleTimeString();
  logs.value.unshift({ time, level, message });
  
  // 限制日志数量
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(0, 100);
  }
}

async function runSingleTick() {
  if (running.value) return;
  
  running.value = true;
  addLog('开始运行单日模拟...');
  
  try {
    const result = await simulationStore.tick();
    
    if (result) {
      addLog(`第 ${result.day} 天模拟完成`, 'info');
      addLog(`全局指标：收入￥${result.globalMetrics.totalRevenue}, 活跃玩家${result.globalMetrics.totalActivePlayers}`, 'info');
    } else {
      addLog('模拟返回空结果', 'warn');
    }
  } catch (error) {
    addLog(`模拟失败：${(error as Error).message}`, 'error');
  } finally {
    running.value = false;
  }
}

async function runMultiDaySimulation(days: number) {
  if (running.value) return;
  
  running.value = true;
  addLog(`开始运行${days}天模拟...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  try {
    for (let i = 0; i < days; i++) {
      try {
        const result = await simulationStore.tick();
        if (result) {
          successCount++;
          if ((i + 1) % 10 === 0) {
            addLog(`已模拟 ${i + 1}/${days} 天`, 'info');
          }
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
        addLog(`第 ${i + 1} 天模拟失败：${(error as Error).message}`, 'error');
      }
    }
    
    addLog(`${days}天模拟完成：成功${successCount}次，失败${errorCount}次`, 
      errorCount > 0 ? 'warn' : 'info');
  } finally {
    running.value = false;
  }
}

async function runFullIntegrationTest() {
  if (running.value) return;
  
  running.value = true;
  testResults.value = [];
  addLog('开始运行完整集成测试...');
  
  try {
    // 动态导入测试模块
    const { runIntegrationTest } = await import('@/tests/integrationTest');
    const report = await runIntegrationTest();
    
    testResults.value = report.results;
    addLog(`集成测试完成：通过${report.passedTests}/${report.totalTests}`, 
      report.failedTests > 0 ? 'warn' : 'info');
  } catch (error) {
    addLog(`集成测试失败：${(error as Error).message}`, 'error');
  } finally {
    running.value = false;
  }
}

onMounted(() => {
  addLog('测试面板已加载');
  addLog(`当前系统时间：${new Date().toLocaleString()}`);
});
</script>

<style scoped>
.integration-test-panel {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

h3 {
  margin: 15px 0 10px;
  color: #555;
  font-size: 16px;
}

.test-section {
  background: white;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 4px;
}

.label {
  color: #666;
  font-size: 14px;
}

.value {
  color: #333;
  font-weight: bold;
}

.value.success {
  color: #52c41a;
}

.value.error {
  color: #ff4d4f;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

button {
  padding: 10px 20px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #40a9ff;
}

button:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.test-summary {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.summary-item {
  padding: 8px 15px;
  border-radius: 4px;
  font-weight: bold;
}

.summary-item.success {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.summary-item.failed {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.test-results {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.test-result {
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid;
  background: #fafafa;
}

.test-result.passed {
  border-left-color: #52c41a;
  background: #f6ffed;
}

.test-result.failed {
  border-left-color: #ff4d4f;
  background: #fff2f0;
}

.test-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.test-icon {
  font-size: 18px;
}

.test-name {
  font-weight: bold;
  color: #333;
}

.test-message {
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.test-duration {
  color: #999;
  font-size: 12px;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 4px;
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-entry {
  display: flex;
  gap: 10px;
  padding: 4px 0;
  border-bottom: 1px solid #333;
}

.log-time {
  color: #858585;
  white-space: nowrap;
}

.log-message {
  flex: 1;
}

.log-entry.info .log-message {
  color: #d4d4d4;
}

.log-entry.warn .log-message {
  color: #cca700;
}

.log-entry.error .log-message {
  color: #f48771;
}
</style>
