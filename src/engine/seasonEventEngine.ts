/**
 * 季节和节假日事件引擎
 * 整合季节系统、节假日系统，提供事件触发和状态管理
 */

import { ref, reactive, computed } from 'vue';
import {
  SeasonType,
  SeasonBuff,
  HolidayBuff,
  HolidayType,
  getSeasonBuff,
  getCurrentSeason,
  checkHolidays,
  checkAnniversary,
  getDateBuffStatus,
  getBuffDescription,
  formatMultiplier,
} from '../utils/seasonUtils';

// 季节事件类型
export interface SeasonEvent {
  id: string;
  type: 'season_change' | 'holiday_start' | 'holiday_end' | 'anniversary';
  title: string;
  description: string;
  timestamp: number;
  data?: {
    season?: SeasonType;
    holiday?: HolidayBuff;
    anniversaryYear?: number;
  };
}

// 季节和节假日状态
export interface SeasonState {
  currentDate: Date;
  currentSeason: SeasonType;
  seasonBuff: SeasonBuff;
  activeHolidays: HolidayBuff[];
  isWeekend: boolean;
  isVacation: boolean;
  vacationType?: 'winter' | 'summer';
  anniversaryInfo: {
    isAnniversary: boolean;
    years: number;
    buff?: HolidayBuff;
  };
  multipliers: {
    revenue: number;
    activity: number;
    studentActivity: number;
    paymentRate: number;
  };
}

export class SeasonEventEngine {
  private state = reactive<SeasonState>({
    currentDate: new Date(),
    currentSeason: 'spring',
    seasonBuff: getSeasonBuff('spring'),
    activeHolidays: [],
    isWeekend: false,
    isVacation: false,
    anniversaryInfo: {
      isAnniversary: false,
      years: 0,
    },
    multipliers: {
      revenue: 1,
      activity: 1,
      studentActivity: 1,
      paymentRate: 1,
    },
  });

  private eventHistory = ref<SeasonEvent[]>([]);
  private projectStartDate: Date | null = null;

  /**
   * 初始化引擎
   * @param projectStartDate 项目上线日期
   */
  init(projectStartDate?: Date): void {
    if (projectStartDate) {
      this.projectStartDate = projectStartDate;
    }
    this.update();
  }

  /**
   * 获取当前状态
   */
  getState(): SeasonState {
    return this.state;
  }

  /**
   * 获取当前季节
   */
  getCurrentSeason(): SeasonType {
    return this.state.currentSeason;
  }

  /**
   * 获取当前季节加成
   */
  getSeasonBuff(): SeasonBuff {
    return this.state.seasonBuff;
  }

  /**
   * 获取当前节假日
   */
  getActiveHolidays(): HolidayBuff[] {
    return this.state.activeHolidays;
  }

  /**
   * 获取所有加成倍率
   */
  getMultipliers(): { revenue: number; activity: number; studentActivity: number; paymentRate: number } {
    return this.state.multipliers;
  }

  /**
   * 获取收益加成倍率
   */
  getRevenueMultiplier(): number {
    return this.state.multipliers.revenue;
  }

  /**
   * 获取活跃度加成倍率
   */
  getActivityMultiplier(): number {
    return this.state.multipliers.activity;
  }

  /**
   * 获取学生活跃度加成倍率
   */
  getStudentActivityMultiplier(): number {
    return this.state.multipliers.studentActivity;
  }

  /**
   * 获取付费率加成倍率
   */
  getPaymentRateMultiplier(): number {
    return this.state.multipliers.paymentRate;
  }

  /**
   * 更新状态
   * @param date 指定日期（用于测试）
   */
  update(date?: Date): void {
    const currentDate = date || new Date();
    this.state.currentDate = currentDate;

    // 更新季节
    const newSeason = getCurrentSeason(currentDate);
    const seasonChanged = newSeason !== this.state.currentSeason;
    
    if (seasonChanged) {
      this.state.currentSeason = newSeason;
      this.state.seasonBuff = getSeasonBuff(newSeason);
      this.addEvent({
        id: `season_${Date.now()}`,
        type: 'season_change',
        title: '季节变更',
        description: `进入${this.state.seasonBuff.name}：${this.state.seasonBuff.description}`,
        timestamp: Date.now(),
        data: { season: newSeason },
      });
    }

    // 更新节假日
    const newHolidays = checkHolidays(currentDate);
    const holidayChanged = this.holidaysChanged(newHolidays);
    
    if (holidayChanged) {
      // 检测新开始的节假日
      const oldHolidayIds = this.state.activeHolidays.map(h => h.type);
      const newHolidayIds = newHolidays.map(h => h.type);
      
      newHolidays.forEach(holiday => {
        if (!oldHolidayIds.includes(holiday.type)) {
          this.addEvent({
            id: `holiday_start_${Date.now()}_${holiday.type}`,
            type: 'holiday_start',
            title: `节假日开始：${holiday.name}`,
            description: holiday.specialEffect || holiday.description,
            timestamp: Date.now(),
            data: { holiday },
          });
        }
      });

      // 检测结束的节假日
      this.state.activeHolidays.forEach(holiday => {
        if (!newHolidayIds.includes(holiday.type)) {
          this.addEvent({
            id: `holiday_end_${Date.now()}_${holiday.type}`,
            type: 'holiday_end',
            title: `节假日结束：${holiday.name}`,
            description: `${holiday.name}活动已结束`,
            timestamp: Date.now(),
            data: { holiday },
          });
        }
      });

      this.state.activeHolidays = newHolidays;
    }

    // 更新周末状态
    const day = currentDate.getDay();
    this.state.isWeekend = day === 0 || day === 6;

    // 更新寒暑假状态
    const month = currentDate.getMonth() + 1;
    if ((month === 1 && currentDate.getDate() >= 15) || month === 2) {
      this.state.isVacation = true;
      this.state.vacationType = 'winter';
    } else if (month === 7 || month === 8) {
      this.state.isVacation = true;
      this.state.vacationType = 'summer';
    } else {
      this.state.isVacation = false;
      this.state.vacationType = undefined;
    }

    // 更新周年庆状态
    if (this.projectStartDate) {
      const anniversary = checkAnniversary(this.projectStartDate, currentDate);
      this.state.anniversaryInfo = anniversary;
      
      if (anniversary.isAnniversary && anniversary.buff) {
        // 检查是否已经添加过周年庆事件
        const hasAnniversaryEvent = this.eventHistory.value.some(
          e => e.type === 'anniversary' && 
               e.data?.anniversaryYear === anniversary.years &&
               Math.abs(Date.now() - e.timestamp) < 24 * 60 * 60 * 1000
        );
        
        if (!hasAnniversaryEvent) {
          this.addEvent({
            id: `anniversary_${Date.now()}`,
            type: 'anniversary',
            title: `${anniversary.years}周年庆快乐！`,
            description: `感谢玩家陪伴${anniversary.years}周年，${anniversary.buff.specialEffect}`,
            timestamp: Date.now(),
            data: { anniversaryYear: anniversary.years },
          });
        }
      }
    }

    // 计算总加成倍率
    this.calculateMultipliers();
  }

  /**
   * 检测节假日是否变化
   */
  private holidaysChanged(newHolidays: HolidayBuff[]): boolean {
    if (newHolidays.length !== this.state.activeHolidays.length) {
      return true;
    }
    
    const oldTypes = this.state.activeHolidays.map(h => h.type).sort().join(',');
    const newTypes = newHolidays.map(h => h.type).sort().join(',');
    
    return oldTypes !== newTypes;
  }

  /**
   * 计算总加成倍率
   */
  private calculateMultipliers(): void {
    let revenue = 1;
    let activity = 1;
    let studentActivity = 1;
    let paymentRate = 1;

    // 应用季节加成
    const seasonBuff = this.state.seasonBuff;
    if (seasonBuff.revenueMultiplier) revenue *= seasonBuff.revenueMultiplier;
    if (seasonBuff.activityMultiplier) activity *= seasonBuff.activityMultiplier;
    if (seasonBuff.studentActivityMultiplier) studentActivity *= seasonBuff.studentActivityMultiplier;
    if (seasonBuff.paymentRateMultiplier) paymentRate *= seasonBuff.paymentRateMultiplier;

    // 应用节假日加成
    this.state.activeHolidays.forEach(holiday => {
      if (holiday.revenueMultiplier) revenue *= holiday.revenueMultiplier;
      if (holiday.activityMultiplier) activity *= holiday.activityMultiplier;
      if (holiday.studentActivityMultiplier) studentActivity *= holiday.studentActivityMultiplier;
      if (holiday.paymentRateMultiplier) paymentRate *= holiday.paymentRateMultiplier;
    });

    this.state.multipliers = {
      revenue: Math.round(revenue * 100) / 100,
      activity: Math.round(activity * 100) / 100,
      studentActivity: Math.round(studentActivity * 100) / 100,
      paymentRate: Math.round(paymentRate * 100) / 100,
    };
  }

  /**
   * 添加事件到历史记录
   */
  private addEvent(event: SeasonEvent): void {
    this.eventHistory.value.unshift(event);
    
    // 限制历史记录数量
    if (this.eventHistory.value.length > 100) {
      this.eventHistory.value = this.eventHistory.value.slice(0, 100);
    }
  }

  /**
   * 获取事件历史
   */
  getEventHistory(): SeasonEvent[] {
    return this.eventHistory.value;
  }

  /**
   * 获取最近的季节/节假日变更事件
   */
  getRecentEvents(limit: number = 10): SeasonEvent[] {
    return this.eventHistory.value.slice(0, limit);
  }

  /**
   * 获取当前所有加成的描述
   */
  getBuffDescriptions(): string[] {
    const descriptions: string[] = [];
    
    // 季节描述
    descriptions.push(`当前季节：${this.state.seasonBuff.name} - ${this.state.seasonBuff.description}`);
    
    // 节假日描述
    this.state.activeHolidays.forEach(holiday => {
      descriptions.push(`${holiday.name}: ${holiday.specialEffect || holiday.description}`);
    });

    // 周末描述
    if (this.state.isWeekend) {
      descriptions.push('周末：活跃度 +30%、收入 +20%');
    }

    // 寒暑假描述
    if (this.state.isVacation && this.state.vacationType) {
      descriptions.push(`${this.state.vacationType === 'winter' ? '寒假' : '暑假'}: 学生向项目活跃 +50%、收入 +40%`);
    }

    // 周年庆描述
    if (this.state.anniversaryInfo.isAnniversary && this.state.anniversaryInfo.buff) {
      descriptions.push(this.state.anniversaryInfo.buff.description);
    }

    return descriptions;
  }

  /**
   * 获取 UI 提示文本
   */
  getUITip(): string {
    const tips: string[] = [];
    
    // 季节提示
    tips.push(`${this.state.seasonBuff.name}加成：${formatMultiplier(this.state.multipliers.revenue)} 收益`);
    
    // 节假日提示
    this.state.activeHolidays.forEach(holiday => {
      if (holiday.specialEffect) {
        tips.push(`${holiday.name}: ${holiday.specialEffect}`);
      }
    });

    // 总加成提示
    const totalRevenueBonus = Math.round((this.state.multipliers.revenue - 1) * 100);
    if (totalRevenueBonus > 0) {
      tips.push(`总收益加成：+${totalRevenueBonus}%`);
    }

    return tips.join(' | ');
  }

  /**
   * 应用收益加成
   * @param baseRevenue 基础收益
   * @returns 加成后收益
   */
  applyRevenueBuff(baseRevenue: number): number {
    return Math.round(baseRevenue * this.state.multipliers.revenue);
  }

  /**
   * 应用活跃度加成
   * @param baseActivity 基础活跃度
   * @returns 加成后活跃度
   */
  applyActivityBuff(baseActivity: number): number {
    return Math.round(baseActivity * this.state.multipliers.activity);
  }

  /**
   * 应用学生活跃度加成
   * @param baseActivity 基础活跃度
   * @returns 加成后活跃度
   */
  applyStudentActivityBuff(baseActivity: number): number {
    return Math.round(baseActivity * this.state.multipliers.studentActivity);
  }

  /**
   * 应用付费率加成
   * @param baseRate 基础付费率
   * @returns 加成后付费率
   */
  applyPaymentRateBuff(baseRate: number): number {
    return Math.round(baseRate * this.state.multipliers.paymentRate * 100) / 100;
  }
}

// 单例导出
export const seasonEventEngine = new SeasonEventEngine();
