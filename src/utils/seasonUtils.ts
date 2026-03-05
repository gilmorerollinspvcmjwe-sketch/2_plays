/**
 * 季节和节假日系统工具
 * 实现季节计算、节假日检测、特殊日期加成等功能
 */

// 季节类型
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

// 季节加成效果
export interface SeasonBuff {
  type: SeasonType;
  name: string;
  description: string;
  revenueMultiplier?: number;      // 收入加成
  activityMultiplier?: number;     // 活跃度加成
  paymentRateMultiplier?: number;  // 付费率加成
  studentActivityMultiplier?: number; // 学生活跃度加成
}

// 节假日类型
export type HolidayType = 
  | 'spring_festival'      // 春节
  | 'valentines_day'       // 情人节
  | 'qingming'            // 清明节
  | 'labor_day'           // 劳动节
  | 'dragon_boat'         // 端午节
  | 'mid_autumn'          // 中秋节
  | 'national_day'        // 国庆节
  | 'christmas'           // 圣诞节
  | 'new_year'            // 元旦
  | 'anniversary'         // 项目周年庆
  | 'weekend'             // 周末
  | 'winter_vacation'     // 寒假
  | 'summer_vacation';    // 暑假

// 节假日加成效果
export interface HolidayBuff {
  type: HolidayType;
  name: string;
  description: string;
  startDate?: string;      // MM-DD 格式
  endDate?: string;        // MM-DD 格式
  duration?: number;       // 持续天数（对于动态日期）
  revenueMultiplier?: number;
  activityMultiplier?: number;
  studentActivityMultiplier?: number;
  paymentRateMultiplier?: number;
  specialEffect?: string;  // 特殊效果描述
}

// 当前季节和节假日状态
export interface DateBuffStatus {
  currentSeason: SeasonType;
  seasonBuff: SeasonBuff;
  activeHolidays: HolidayBuff[];
  totalRevenueMultiplier: number;
  totalActivityMultiplier: number;
  totalStudentActivityMultiplier: number;
  totalPaymentRateMultiplier: number;
}

/**
 * 根据月份判断季节
 * @param month 月份 (1-12)
 * @returns 季节类型
 */
export function getSeasonByMonth(month: number): SeasonType {
  if (month >= 3 && month <= 5) {
    return 'spring';
  } else if (month >= 6 && month <= 8) {
    return 'summer';
  } else if (month >= 9 && month <= 11) {
    return 'autumn';
  } else {
    return 'winter';
  }
}

/**
 * 获取当前季节
 * @param date 日期对象
 * @returns 季节类型
 */
export function getCurrentSeason(date: Date = new Date()): SeasonType {
  return getSeasonByMonth(date.getMonth() + 1);
}

/**
 * 获取季节加成效果
 * @param season 季节类型
 * @returns 季节加成
 */
export function getSeasonBuff(season: SeasonType): SeasonBuff {
  const buffs: Record<SeasonType, SeasonBuff> = {
    spring: {
      type: 'spring',
      name: '春季',
      description: '春暖花开，收入增加',
      revenueMultiplier: 1.05,  // 收入 +5%
    },
    summer: {
      type: 'summer',
      name: '夏季',
      description: '夏日炎炎，学生活跃',
      studentActivityMultiplier: 1.20,  // 学生活跃 +20%
    },
    autumn: {
      type: 'autumn',
      name: '秋季',
      description: '秋高气爽，收入增加',
      revenueMultiplier: 1.05,  // 收入 +5%
    },
    winter: {
      type: 'winter',
      name: '冬季',
      description: '冬日暖阳，付费率提升',
      paymentRateMultiplier: 1.10,  // 付费率 +10%
    },
  };

  return buffs[season];
}

/**
 * 检测是否为周末
 * @param date 日期对象
 * @returns 是否为周末
 */
export function isWeekend(date: Date = new Date()): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;  // 0 = 周日，6 = 周六
}

/**
 * 获取周末加成
 * @returns 周末加成
 */
export function getWeekendBuff(): HolidayBuff {
  return {
    type: 'weekend',
    name: '周末',
    description: '周末时光，活跃度和收入提升',
    revenueMultiplier: 1.20,       // 收入 +20%
    activityMultiplier: 1.30,      // 活跃 +30%
    specialEffect: '活跃度 +30%、收入 +20%',
  };
}

/**
 * 检测是否为寒假（1 月中旬 -2 月底）
 * @param date 日期对象
 * @returns 是否为寒假
 */
export function isWinterVacation(date: Date = new Date()): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 1 月 15 日之后
  if (month === 1 && day >= 15) {
    return true;
  }
  // 整个 2 月
  if (month === 2) {
    return true;
  }
  return false;
}

/**
 * 检测是否为暑假（7 月 -8 月）
 * @param date 日期对象
 * @returns 是否为暑假
 */
export function isSummerVacation(date: Date = new Date()): boolean {
  const month = date.getMonth() + 1;
  return month === 7 || month === 8;
}

/**
 * 获取寒暑假加成
 * @param isWinter 是否为寒假
 * @returns 寒暑假加成
 */
export function getVacationBuff(isWinter: boolean): HolidayBuff {
  if (isWinter) {
    return {
      type: 'winter_vacation',
      name: '寒假',
      description: '寒假期间，学生向项目活跃度和收入大幅提升',
      studentActivityMultiplier: 1.50,  // 学生活跃 +50%
      revenueMultiplier: 1.40,          // 收入 +40%
      specialEffect: '学生向项目活跃 +50%、收入 +40%',
    };
  } else {
    return {
      type: 'summer_vacation',
      name: '暑假',
      description: '暑假期间，学生向项目活跃度和收入大幅提升',
      studentActivityMultiplier: 1.50,  // 学生活跃 +50%
      revenueMultiplier: 1.40,          // 收入 +40%
      specialEffect: '学生向项目活跃 +50%、收入 +40%',
    };
  }
}

/**
 * 获取固定日期的节假日
 * @returns 节假日配置数组
 */
export function getFixedHolidays(): HolidayBuff[] {
  return [
    {
      type: 'new_year',
      name: '元旦',
      description: '新年新气象',
      startDate: '01-01',
      endDate: '01-01',
      revenueMultiplier: 1.15,
      activityMultiplier: 1.20,
    },
    {
      type: 'valentines_day',
      name: '情人节',
      description: '浪漫情人节，情侣向项目热度上升',
      startDate: '02-14',
      endDate: '02-14',
      revenueMultiplier: 1.20,
      activityMultiplier: 1.25,
      specialEffect: '情侣向项目热度 +25%',
    },
    {
      type: 'qingming',
      name: '清明节',
      description: '清明时节',
      startDate: '04-04',
      endDate: '04-06',
      revenueMultiplier: 1.05,
    },
    {
      type: 'labor_day',
      name: '劳动节',
      description: '劳动节快乐',
      startDate: '05-01',
      endDate: '05-05',
      revenueMultiplier: 1.15,
      activityMultiplier: 1.20,
    },
    {
      type: 'dragon_boat',
      name: '端午节',
      description: '端午安康',
      startDate: '05-28',
      endDate: '05-30',
      revenueMultiplier: 1.10,
      activityMultiplier: 1.15,
    },
    {
      type: 'mid_autumn',
      name: '中秋节',
      description: '中秋团圆',
      startDate: '09-15',
      endDate: '09-17',
      revenueMultiplier: 1.15,
      activityMultiplier: 1.20,
    },
    {
      type: 'national_day',
      name: '国庆节',
      description: '国庆黄金周',
      startDate: '10-01',
      endDate: '10-07',
      revenueMultiplier: 1.25,
      activityMultiplier: 1.30,
    },
    {
      type: 'christmas',
      name: '圣诞节',
      description: '圣诞快乐',
      startDate: '12-24',
      endDate: '12-25',
      revenueMultiplier: 1.20,
      activityMultiplier: 1.25,
    },
  ];
}

/**
 * 获取春节配置（农历日期，需要特殊计算）
 * @param year 年份
 * @returns 春节加成
 */
export function getSpringFestivalBuff(year: number): HolidayBuff {
  // 简化处理：假设春节在 1 月 21 日 -2 月 20 日之间
  // 实际项目需要使用农历库来精确计算
  return {
    type: 'spring_festival',
    name: '春节',
    description: '新春佳节，全年最盛大的节日',
    startDate: '01-22',
    endDate: '01-28',
    revenueMultiplier: 1.30,
    activityMultiplier: 1.40,
    studentActivityMultiplier: 1.50,
    specialEffect: '收入 +30%、活跃 +40%、学生活跃 +50%',
  };
}

/**
 * 检测特定日期是否为节假日
 * @param date 日期对象
 * @returns 节假日加成数组
 */
export function checkHolidays(date: Date = new Date()): HolidayBuff[] {
  const holidays: HolidayBuff[] = [];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateStr = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // 检查固定节假日
  const fixedHolidays = getFixedHolidays();
  for (const holiday of fixedHolidays) {
    if (holiday.startDate && holiday.endDate) {
      const start = holiday.startDate.split('-');
      const end = holiday.endDate.split('-');
      const startMonth = parseInt(start[0]);
      const startDay = parseInt(start[1]);
      const endMonth = parseInt(end[0]);
      const endDay = parseInt(end[1]);

      const currentDate = month * 100 + day;
      const startDate = startMonth * 100 + startDay;
      const endDate = endMonth * 100 + endDay;

      if (currentDate >= startDate && currentDate <= endDate) {
        holidays.push(holiday);
      }
    }
  }

  // 检查春节（简化处理）
  if ((month === 1 && day >= 22) || (month === 2 && day <= 20)) {
    holidays.push(getSpringFestivalBuff(date.getFullYear()));
  }

  // 检查周末
  if (isWeekend(date)) {
    holidays.push(getWeekendBuff());
  }

  // 检查寒假
  if (isWinterVacation(date)) {
    holidays.push(getVacationBuff(true));
  }

  // 检查暑假
  if (isSummerVacation(date)) {
    holidays.push(getVacationBuff(false));
  }

  return holidays;
}

/**
 * 检测项目周年庆
 * @param projectStartDate 项目上线日期
 * @param currentDate 当前日期
 * @returns 是否为周年庆及周年数
 */
export function checkAnniversary(projectStartDate: Date, currentDate: Date = new Date()): { 
  isAnniversary: boolean;
  years: number;
  buff?: HolidayBuff 
} {
  const projectMonth = projectStartDate.getMonth();
  const projectDay = projectStartDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();

  // 计算周年数
  let years = currentDate.getFullYear() - projectStartDate.getFullYear();
  
  // 如果还没到今年的周年日，减 1 年
  if (currentMonth < projectMonth || (currentMonth === projectMonth && currentDay < projectDay)) {
    years--;
  }

  // 检查是否为周年当天（前后 3 天内）
  const isAnniversary = 
    currentMonth === projectMonth && 
    Math.abs(currentDay - projectDay) <= 3;

  if (isAnniversary && years > 0) {
    return {
      isAnniversary: true,
      years,
      buff: {
        type: 'anniversary',
        name: `${years}周年庆`,
        description: `项目上线${years}周年纪念`,
        revenueMultiplier: 1.20 + (years * 0.05),  // 每周年增加 5% 加成
        activityMultiplier: 1.25 + (years * 0.05),
        specialEffect: `庆典期间收入 +${20 + years * 5}%、活跃 +${25 + years * 5}%`,
      },
    };
  }

  return {
    isAnniversary: false,
    years: Math.max(0, years),
  };
}

/**
 * 获取当前日期所有加成状态
 * @param date 日期对象
 * @param projectStartDate 项目上线日期（可选）
 * @returns 加成状态
 */
export function getDateBuffStatus(
  date: Date = new Date(),
  projectStartDate?: Date
): DateBuffStatus {
  const currentSeason = getCurrentSeason(date);
  const seasonBuff = getSeasonBuff(currentSeason);
  const activeHolidays = checkHolidays(date);

  // 检查周年庆
  if (projectStartDate) {
    const anniversary = checkAnniversary(projectStartDate, date);
    if (anniversary.isAnniversary && anniversary.buff) {
      activeHolidays.push(anniversary.buff);
    }
  }

  // 计算总加成（乘法叠加）
  let totalRevenueMultiplier = 1;
  let totalActivityMultiplier = 1;
  let totalStudentActivityMultiplier = 1;
  let totalPaymentRateMultiplier = 1;

  // 应用季节加成
  if (seasonBuff.revenueMultiplier) {
    totalRevenueMultiplier *= seasonBuff.revenueMultiplier;
  }
  if (seasonBuff.activityMultiplier) {
    totalActivityMultiplier *= seasonBuff.activityMultiplier;
  }
  if (seasonBuff.studentActivityMultiplier) {
    totalStudentActivityMultiplier *= seasonBuff.studentActivityMultiplier;
  }
  if (seasonBuff.paymentRateMultiplier) {
    totalPaymentRateMultiplier *= seasonBuff.paymentRateMultiplier;
  }

  // 应用节假日加成
  activeHolidays.forEach(holiday => {
    if (holiday.revenueMultiplier) {
      totalRevenueMultiplier *= holiday.revenueMultiplier;
    }
    if (holiday.activityMultiplier) {
      totalActivityMultiplier *= holiday.activityMultiplier;
    }
    if (holiday.studentActivityMultiplier) {
      totalStudentActivityMultiplier *= holiday.studentActivityMultiplier;
    }
    if (holiday.paymentRateMultiplier) {
      totalPaymentRateMultiplier *= holiday.paymentRateMultiplier;
    }
  });

  return {
    currentSeason,
    seasonBuff,
    activeHolidays,
    totalRevenueMultiplier,
    totalActivityMultiplier,
    totalStudentActivityMultiplier,
    totalPaymentRateMultiplier,
  };
}

/**
 * 获取加成描述文本
 * @param status 加成状态
 * @returns 描述文本数组
 */
export function getBuffDescription(status: DateBuffStatus): string[] {
  const descriptions: string[] = [];

  // 季节描述
  descriptions.push(`${status.seasonBuff.name}：${status.seasonBuff.description}`);

  // 节假日描述
  status.activeHolidays.forEach(holiday => {
    if (holiday.specialEffect) {
      descriptions.push(`${holiday.name}：${holiday.specialEffect}`);
    } else {
      descriptions.push(`${holiday.name}：${holiday.description}`);
    }
  });

  return descriptions;
}

/**
 * 格式化加成倍率
 * @param multiplier 倍率
 * @returns 格式化字符串（如 +20%）
 */
export function formatMultiplier(multiplier: number): string {
  const percent = Math.round((multiplier - 1) * 100);
  return percent >= 0 ? `+${percent}%` : `${percent}%`;
}
