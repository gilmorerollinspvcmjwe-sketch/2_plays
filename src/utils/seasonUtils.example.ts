/**
 * 季节和节假日系统使用示例
 * 
 * 此文件展示如何在项目中使用季节和节假日系统
 */

import { 
  // 工具函数
  getCurrentSeason,
  getSeasonBuff,
  checkHolidays,
  checkAnniversary,
  getDateBuffStatus,
  isWeekend,
  isWinterVacation,
  isSummerVacation,
  
  // 引擎
  seasonEventEngine,
} from '@/engine';

/**
 * 示例 1: 基础使用 - 获取当前季节和节假日
 */
export function example1_BasicUsage() {
  // 获取当前季节
  const currentSeason = getCurrentSeason();
  console.log('当前季节:', currentSeason); // 'spring', 'summer', 'autumn', 或 'winter'
  
  // 获取季节加成
  const seasonBuff = getSeasonBuff(currentSeason);
  console.log('季节加成:', seasonBuff);
  // 输出示例：
  // {
  //   type: 'spring',
  //   name: '春季',
  //   description: '春暖花开，收入增加',
  //   revenueMultiplier: 1.05
  // }
  
  // 获取当前节假日
  const todayHolidays = checkHolidays();
  console.log('今日节假日:', todayHolidays);
  // 如果是周末，会包含周末加成
  // 如果是节假日期间，会包含相应节假日加成
}

/**
 * 示例 2: 计算收益加成
 */
export function example2_CalculateRevenue() {
  const baseRevenue = 1000;  // 基础收益
  
  // 获取完整加成状态
  const buffStatus = getDateBuffStatus();
  
  // 应用收益加成
  const finalRevenue = baseRevenue * buffStatus.totalRevenueMultiplier;
  
  console.log(`基础收益：${baseRevenue}`);
  console.log(`总收益倍率：${buffStatus.totalRevenueMultiplier}`);
  console.log(`最终收益：${finalRevenue}`);
  
  // 如果是春季的周末，收益计算：
  // 基础 1000 * 1.05(春季) * 1.20(周末) = 1260
}

/**
 * 示例 3: 使用季节事件引擎（推荐方式）
 */
export function example3_SeasonEventEngine() {
  // 初始化引擎（传入项目上线日期）
  const projectLaunchDate = new Date('2024-01-15');
  seasonEventEngine.init(projectLaunchDate);
  
  // 获取当前状态
  const state = seasonEventEngine.getState();
  console.log('当前状态:', state);
  
  // 获取收益倍率
  const revenueMultiplier = seasonEventEngine.getRevenueMultiplier();
  
  // 获取活跃度倍率
  const activityMultiplier = seasonEventEngine.getActivityMultiplier();
  
  // 获取学生活跃度倍率（针对学生向项目）
  const studentActivityMultiplier = seasonEventEngine.getStudentActivityMultiplier();
  
  // 应用加成到实际计算
  const baseRevenue = 1000;
  const baseActivity = 500;
  
  const finalRevenue = seasonEventEngine.applyRevenueBuff(baseRevenue);
  const finalActivity = seasonEventEngine.applyActivityBuff(baseActivity);
  const finalStudentActivity = seasonEventEngine.applyStudentActivityBuff(baseActivity);
  
  console.log(`最终收益：${finalRevenue}`);
  console.log(`最终活跃度：${finalActivity}`);
  console.log(`学生活跃度：${finalStudentActivity}`);
}

/**
 * 示例 4: 检测特殊日期
 */
export function example4_SpecialDates() {
  const today = new Date();
  
  // 检测是否为周末
  if (isWeekend(today)) {
    console.log('今天是周末，活跃度 +30%、收入 +20%');
  }
  
  // 检测是否在寒假期间
  if (isWinterVacation(today)) {
    console.log('寒假期间，学生向项目活跃 +50%、收入 +40%');
  }
  
  // 检测是否在暑假期间
  if (isSummerVacation(today)) {
    console.log('暑假期间，学生向项目活跃 +50%、收入 +40%');
  }
  
  // 检测周年庆
  const projectLaunchDate = new Date('2024-01-15');
  const anniversary = checkAnniversary(projectLaunchDate, today);
  
  if (anniversary.isAnniversary) {
    console.log(`今天是${anniversary.years}周年庆！`);
    console.log(anniversary.buff?.specialEffect);
  }
}

/**
 * 示例 5: 在游戏主循环中使用
 */
export function example5_GameLoop() {
  // 在项目上线时初始化
  const projectLaunchDate = new Date('2024-01-15');
  seasonEventEngine.init(projectLaunchDate);
  
  // 每日更新（在游戏的主循环中调用）
  function dailyUpdate() {
    seasonEventEngine.update();
    
    // 获取最近事件
    const recentEvents = seasonEventEngine.getRecentEvents(5);
    recentEvents.forEach(event => {
      console.log(`[${event.type}] ${event.title}: ${event.description}`);
    });
    
    // 获取加成提示
    const tip = seasonEventEngine.getUITip();
    console.log('当前加成提示:', tip);
  }
  
  // 模拟每日更新
  dailyUpdate();
}

/**
 * 示例 6: 在 Vue 组件中使用
 */
export function example6_VueComponent() {
  // 在 Vue 组件的 setup 中：
  /*
  import { ref, onMounted, computed } from 'vue';
  import { seasonEventEngine } from '@/engine';
  
  export default {
    setup() {
      const revenueMultiplier = ref(1);
      const activityMultiplier = ref(1);
      
      onMounted(() => {
        // 初始化引擎
        seasonEventEngine.init(new Date('2024-01-15'));
        
        // 获取当前倍率
        const multipliers = seasonEventEngine.getMultipliers();
        revenueMultiplier.value = multipliers.revenue;
        activityMultiplier.value = multipliers.activity;
      });
      
      // 计算收益
      const calculateRevenue = (baseRevenue: number) => {
        return seasonEventEngine.applyRevenueBuff(baseRevenue);
      };
      
      // 计算活跃度
      const calculateActivity = (baseActivity: number) => {
        return seasonEventEngine.applyActivityBuff(baseActivity);
      };
      
      return {
        revenueMultiplier,
        activityMultiplier,
        calculateRevenue,
        calculateActivity,
      };
    }
  }
  */
}

/**
 * 示例 7: 季节加成详情
 */
export function example7_SeasonDetails() {
  const seasons: Array<'spring' | 'summer' | 'autumn' | 'winter'> = ['spring', 'summer', 'autumn', 'winter'];
  
  seasons.forEach(season => {
    const buff = getSeasonBuff(season);
    console.log(`\n${buff.name} (${season}):`);
    console.log(`  描述：${buff.description}`);
    console.log(`  收益加成：${buff.revenueMultiplier ? `+${(buff.revenueMultiplier - 1) * 100}%` : '无'}`);
    console.log(`  活跃加成：${buff.activityMultiplier ? `+${(buff.activityMultiplier - 1) * 100}%` : '无'}`);
    console.log(`  学生活跃：${buff.studentActivityMultiplier ? `+${(buff.studentActivityMultiplier - 1) * 100}%` : '无'}`);
    console.log(`  付费率加成：${buff.paymentRateMultiplier ? `+${(buff.paymentRateMultiplier - 1) * 100}%` : '无'}`);
  });
  
  // 输出：
  // 春季 (spring):
  //   描述：春暖花开，收入增加
  //   收益加成：+5%
  //
  // 夏季 (summer):
  //   描述：夏日炎炎，学生活跃
  //   学生活跃：+20%
  //
  // 秋季 (autumn):
  //   描述：秋高气爽，收入增加
  //   收益加成：+5%
  //
  // 冬季 (winter):
  //   描述：冬日暖阳，付费率提升
  //   付费率加成：+10%
}

/**
 * 示例 8: 节假日加成详情
 */
export function example8_HolidayDetails() {
  // 检测特定日期的节假日
  const date = new Date('2024-02-14'); // 情人节
  const holidays = checkHolidays(date);
  
  console.log('情人节当天节假日:');
  holidays.forEach(holiday => {
    console.log(`  - ${holiday.name}: ${holiday.specialEffect || holiday.description}`);
  });
  
  // 输出：
  // 情人节当天节假日:
  //   - 情人节：情侣向项目热度 +25%
  //   - 周末：活跃度 +30%、收入 +20%（如果 2 月 14 日是周末）
}

/**
 * 示例 9: 测试不同日期的加成
 */
export function example9_TestingDifferentDates() {
  const testDates = [
    new Date('2024-03-15'), // 春季普通日
    new Date('2024-07-20'), // 夏季 + 暑假
    new Date('2024-10-03'), // 秋季 + 国庆节
    new Date('2024-01-25'), // 冬季 + 寒假 + 春节
    new Date('2024-12-25'), // 冬季 + 圣诞节
  ];
  
  testDates.forEach(date => {
    const status = getDateBuffStatus(date);
    console.log(`\n${date.toDateString()}:`);
    console.log(`  季节：${status.seasonBuff.name}`);
    console.log(`  节假日：${status.activeHolidays.map(h => h.name).join(', ') || '无'}`);
    console.log(`  总收益加成：${(status.totalRevenueMultiplier - 1) * 100}%`);
    console.log(`  总活跃加成：${(status.totalActivityMultiplier - 1) * 100}%`);
  });
}

// 运行示例
console.log('=== 季节和节假日系统示例 ===\n');
example1_BasicUsage();
example2_CalculateRevenue();
example3_SeasonEventEngine();
example7_SeasonDetails();
