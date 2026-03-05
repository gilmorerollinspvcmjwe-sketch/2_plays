/**
 * Phase 6 集成测试脚本
 * 测试所有模块的集成和系统功能
 * 
 * 使用方法：
 * 在浏览器控制台运行：window.runIntegrationTest()
 */

import { useSimulationStore } from '@/stores/simulationStore';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useGameStore } from '@/stores/gameStore';
import { useProjectStore } from '@/stores/projectStore';
import { useOperationStore } from '@/stores/operationStore';

export interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  duration?: number;
  error?: Error;
}

export interface TestReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
  totalDuration: number;
}

/**
 * 测试 1: 员工系统每日更新
 */
function testEmployeeDailyUpdate(): TestResult {
  const startTime = Date.now();
  try {
    const employeeStore = useEmployeeStore();
    
    // 检查员工数据
    if (employeeStore.employees.length === 0) {
      return {
        testName: '员工系统每日更新',
        passed: false,
        message: '没有员工数据，测试跳过',
        duration: Date.now() - startTime
      };
    }
    
    // 模拟每日更新
    const projectIds = ['test_project_1', 'test_project_2'];
    const characterNames = ['角色 1', '角色 2'];
    
    const result = employeeStore.simulateDailyUpdate(projectIds, characterNames);
    
    // 验证结果
    const passed = 
      typeof result.fatigueIncreased === 'number' &&
      typeof result.satisfactionChanged === 'number' &&
      Array.isArray(result.turnover) &&
      Array.isArray(result.events) &&
      Array.isArray(result.leveledUpEmployees);
    
    return {
      testName: '员工系统每日更新',
      passed,
      message: passed 
        ? `测试通过：疲劳增加${result.fatigueIncreased}人，满意度变化${result.satisfactionChanged}人，离职${result.turnover.length}人，事件${result.events.length}个，可升级${result.leveledUpEmployees.length}人`
        : '测试结果格式不正确',
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      testName: '员工系统每日更新',
      passed: false,
      message: '测试异常',
      error: error as Error,
      duration: Date.now() - startTime
    };
  }
}

/**
 * 测试 2: 角色系统每日更新
 */
async function testCharacterDailyUpdate(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const gameStore = useGameStore();
    
    // 检查是否有游戏数据
    if (!gameStore.currentGameId) {
      return {
        testName: '角色系统每日更新',
        passed: false,
        message: '没有当前游戏，测试跳过',
        duration: Date.now() - startTime
      };
    }
    
    // 执行每日更新
    const result = await gameStore.updateCharacterDaily();
    
    return {
      testName: '角色系统每日更新',
      passed: result.success,
      message: result.message + 
        (result.popularityChanges ? `, 人气变化${result.popularityChanges.length}个` : '') +
        (result.birthdayEvents ? `, 生日事件${result.birthdayEvents.length}个` : '') +
        (result.intimacyUpdates ? `, 亲密度更新${result.intimacyUpdates.length}个` : ''),
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      testName: '角色系统每日更新',
      passed: false,
      message: '测试异常',
      error: error as Error,
      duration: Date.now() - startTime
    };
  }
}

/**
 * 测试 3: 季节和节假日系统
 */
function testSeasonEventSystem(): TestResult {
  const startTime = Date.now();
  try {
    // 这个测试在 simulationStore.tick() 中已经集成
    // 这里只验证季节引擎是否正常工作
    const { seasonEventEngine } = require('@/engine/seasonEventEngine');
    
    if (!seasonEventEngine) {
      return {
        testName: '季节和节假日系统',
        passed: false,
        message: '季节事件引擎未初始化',
        duration: Date.now() - startTime
      };
    }
    
    // 更新状态
    seasonEventEngine.update();
    
    const state = seasonEventEngine.getState();
    
    return {
      testName: '季节和节假日系统',
      passed: true,
      message: `当前季节：${state.currentSeason}, 节假日：${state.activeHolidays.length}个, 周末：${state.isWeekend}, 寒暑假：${state.isVacation ? state.vacationType : '否'}`,
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      testName: '季节和节假日系统',
      passed: false,
      message: '测试异常',
      error: error as Error,
      duration: Date.now() - startTime
    };
  }
}

/**
 * 测试 4: 随机事件触发
 */
async function testRandomEventTrigger(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const simulationStore = useSimulationStore();
    
    // 检查事件引擎
    if (!simulationStore.dailyEventEngine) {
      return {
        testName: '随机事件触发',
        passed: false,
        message: '每日事件引擎未初始化',
        duration: Date.now() - startTime
      };
    }
    
    // 触发事件
    await simulationStore.triggerDailyEvents();
    
    const events = simulationStore.triggeredEvents;
    
    // 统计事件类型
    const eventStats = {
      positive: events.filter(e => e.category === 'positive').length,
      negative: events.filter(e => e.category === 'negative').length,
      neutral: events.filter(e => e.category === 'neutral').length,
      employee: events.filter(e => e.category === 'employee').length
    };
    
    return {
      testName: '随机事件触发',
      passed: true,
      message: `触发${events.length}个事件：正面${eventStats.positive}个，负面${eventStats.negative}个，中性${eventStats.neutral}个，员工${eventStats.employee}个`,
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      testName: '随机事件触发',
      passed: false,
      message: '测试异常',
      error: error as Error,
      duration: Date.now() - startTime
    };
  }
}

/**
 * 测试 5: 性能测试 - 连续模拟 100 天
 */
async function testPerformance100Days(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const simulationStore = useSimulationStore();
    
    // 检查是否初始化
    if (!simulationStore.isInitialized) {
      await simulationStore.initialize();
    }
    
    const startDay = simulationStore.currentDay;
    const daysToSimulate = 100;
    let successCount = 0;
    let errorCount = 0;
    
    console.log(`开始性能测试：连续模拟${daysToSimulate}天`);
    
    for (let i = 0; i < daysToSimulate; i++) {
      try {
        const result = await simulationStore.tick();
        if (result) {
          successCount++;
        } else {
          errorCount++;
        }
        
        // 每 10 天输出一次进度
        if ((i + 1) % 10 === 0) {
          console.log(`已模拟 ${i + 1}/${daysToSimulate} 天，成功${successCount}次，失败${errorCount}次`);
        }
      } catch (error) {
        errorCount++;
        console.error(`第 ${i + 1} 天模拟失败:`, error);
      }
    }
    
    const totalDuration = Date.now() - startTime;
    const avgTimePerDay = totalDuration / daysToSimulate;
    
    const passed = successCount >= daysToSimulate * 0.9; // 90% 成功率
    
    return {
      testName: '性能测试 - 连续模拟 100 天',
      passed,
      message: passed
        ? `测试通过：成功${successCount}/${daysToSimulate}天，总耗时${(totalDuration / 1000).toFixed(2)}秒，平均${avgTimePerDay.toFixed(2)}毫秒/天`
        : `测试失败：成功${successCount}/${daysToSimulate}天，成功率不足 90%`,
      duration: totalDuration
    };
  } catch (error) {
    return {
      testName: '性能测试 - 连续模拟 100 天',
      passed: false,
      message: '测试异常',
      error: error as Error,
      duration: Date.now() - startTime
    };
  }
}

/**
 * 测试 6: 数据持久化
 */
function testDataPersistence(): TestResult {
  const startTime = Date.now();
  try {
    const simulationStore = useSimulationStore();
    
    // 保存数据
    simulationStore.saveToLocal();
    
    // 验证数据是否存在
    const savedData = localStorage.getItem('simulation_data');
    
    if (!savedData) {
      return {
        testName: '数据持久化',
        passed: false,
        message: '保存的数据为空',
        duration: Date.now() - startTime
      };
    }
    
    // 解析数据并验证结构
    const parsed = JSON.parse(savedData);
    
    const hasCurrentDay = typeof parsed.currentDay === 'number';
    const hasGlobalMetrics = typeof parsed.globalMetrics === 'object';
    const hasLastSaveTime = typeof parsed.lastSaveTime === 'number';
    
    const passed = hasCurrentDay && hasGlobalMetrics && hasLastSaveTime;
    
    return {
      testName: '数据持久化',
      passed,
      message: passed
        ? `测试通过：当前天数${parsed.currentDay}, 最后保存时间${new Date(parsed.lastSaveTime).toLocaleString()}`
        : '测试失败：数据结构不完整',
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      testName: '数据持久化',
      passed: false,
      message: '测试异常',
      error: error as Error,
      duration: Date.now() - startTime
    };
  }
}

/**
 * 运行所有集成测试
 */
export async function runIntegrationTest(): Promise<TestReport> {
  console.log('========================================');
  console.log('开始 Phase 6 集成测试');
  console.log('========================================');
  
  const totalStartTime = Date.now();
  const results: TestResult[] = [];
  
  // 测试 1: 员工系统
  console.log('\n[测试 1/6] 员工系统每日更新');
  results.push(testEmployeeDailyUpdate());
  
  // 测试 2: 角色系统
  console.log('\n[测试 2/6] 角色系统每日更新');
  results.push(await testCharacterDailyUpdate());
  
  // 测试 3: 季节系统
  console.log('\n[测试 3/6] 季节和节假日系统');
  results.push(testSeasonEventSystem());
  
  // 测试 4: 随机事件
  console.log('\n[测试 4/6] 随机事件触发');
  results.push(await testRandomEventTrigger());
  
  // 测试 5: 性能测试
  console.log('\n[测试 5/6] 性能测试 - 连续模拟 100 天');
  results.push(await testPerformance100Days());
  
  // 测试 6: 数据持久化
  console.log('\n[测试 6/6] 数据持久化');
  results.push(testDataPersistence());
  
  // 生成报告
  const totalDuration = Date.now() - totalStartTime;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = results.filter(r => !r.passed).length;
  
  console.log('\n========================================');
  console.log('测试报告');
  console.log('========================================');
  console.log(`总测试数：${results.length}`);
  console.log(`通过：${passedTests}`);
  console.log(`失败：${failedTests}`);
  console.log(`总耗时：${(totalDuration / 1000).toFixed(2)}秒`);
  console.log('========================================');
  
  results.forEach(result => {
    console.log(`\n${result.passed ? '✅' : '❌'} ${result.testName}`);
    console.log(`   ${result.message}`);
    if (result.error) {
      console.log(`   错误：${result.error.message}`);
    }
    if (result.duration) {
      console.log(`   耗时：${result.duration}ms`);
    }
  });
  
  console.log('\n========================================');
  if (failedTests === 0) {
    console.log('🎉 所有测试通过！');
  } else {
    console.log(`⚠️  ${failedTests}个测试失败，请检查错误信息`);
  }
  console.log('========================================');
  
  return {
    totalTests: results.length,
    passedTests,
    failedTests,
    results,
    totalDuration
  };
}

// 导出到全局对象，方便在浏览器控制台调用
if (typeof window !== 'undefined') {
  (window as any).runIntegrationTest = runIntegrationTest;
}
