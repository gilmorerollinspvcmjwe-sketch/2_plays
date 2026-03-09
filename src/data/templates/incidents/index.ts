/**
 * 运营事件模板导出文件
 */

export {
  incidentTemplates,
  getIncidentsBySeverity,
  getIncidentsByType,
  getRandomIncident,
  getIncidentSolutions
} from './incidentTemplates';

// 导入类型
import type { IncidentTemplate, IncidentType, IncidentSeverity, IncidentSolution } from '@/types/template';
import { incidentTemplates, getRandomIncident } from './incidentTemplates';

/**
 * 获取事件类型名称
 * @param type 事件类型
 */
export function getIncidentTypeName(type: IncidentType | string): string {
  const typeNames: Record<string, string> = {
    'dropRate': '爆率争议',
    'plotIssue': '剧情问题',
    'welfare': '福利争议',
    'bug': 'BUG问题',
    'scandal': '声优丑闻',
    'competition': '竞品冲击',
    'eventIssue': '活动事故',
    'chargeback': '退款潮',
    'other': '其他事件'
  };
  return typeNames[type] || '未知事件';
}

/**
 * 获取严重程度类型（用于UI样式）
 * @param severity 严重程度
 */
export function getSeverityType(severity: IncidentSeverity): 'success' | 'warning' | 'danger' {
  switch (severity) {
    case '低':
      return 'success';
    case '中':
      return 'warning';
    case '高':
      return 'danger';
    default:
      return 'warning';
  }
}

/**
 * 生成随机运营事件
 * 用于模拟每日可能发生的运营事件
 */
export function generateRandomIncident(): IncidentTemplate & { status: 'pending'; createdAt: string } {
  const template = getRandomIncident();
  
  return {
    ...template,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
}

/**
 * 根据类型生成随机事件
 * @param type 事件类型
 */
export function generateRandomIncidentByType(type: IncidentType): IncidentTemplate & { status: 'pending'; createdAt: string } {
  const filtered = incidentTemplates.filter(i => i.type === type);
  const template = filtered.length > 0 
    ? filtered[Math.floor(Math.random() * filtered.length)]
    : getRandomIncident();
  
  return {
    ...template,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
}

/**
 * 根据严重程度生成随机事件
 * @param severity 严重程度
 */
export function generateRandomIncidentBySeverity(severity: IncidentSeverity): IncidentTemplate & { status: 'pending'; createdAt: string } {
  const filtered = incidentTemplates.filter(i => i.severity === severity);
  const template = filtered.length > 0 
    ? filtered[Math.floor(Math.random() * filtered.length)]
    : getRandomIncident();
  
  return {
    ...template,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
}
