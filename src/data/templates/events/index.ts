/**
 * 活动模板导出文件
 */

export {
  festivalEventTemplates,
  birthdayEventTemplates,
  getAllFestivalEvents,
  getEventsByBudget,
  getHighImpactEvents
} from './festivalEvents';

// 导入类型
import type { EventTemplate, EventType, BudgetLevel } from '@/types/template';
import { festivalEventTemplates, birthdayEventTemplates, getAllFestivalEvents } from './festivalEvents';

/**
 * 根据类型获取活动
 * @param type 活动类型
 */
export function getEventsByType(type: EventType): EventTemplate[] {
  const allEvents = [...festivalEventTemplates, ...birthdayEventTemplates];
  return allEvents.filter(event => event.type === type);
}

/**
 * 获取随机活动
 */
export function getRandomEvent(): EventTemplate {
  const allEvents = [...festivalEventTemplates, ...birthdayEventTemplates];
  return allEvents[Math.floor(Math.random() * allEvents.length)];
}

/**
 * 根据类型获取随机活动
 * @param type 活动类型
 */
export function getRandomEventByType(type: EventType): EventTemplate {
  const events = getEventsByType(type);
  if (events.length === 0) {
    return getRandomEvent();
  }
  return events[Math.floor(Math.random() * events.length)];
}
