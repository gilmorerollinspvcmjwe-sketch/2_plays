export function getStatusType(status: string): string {
  const map: Record<string, string> = {
    ongoing: 'success',
    upcoming: 'warning',
    ended: 'default',
    pending: 'danger',
    resolved: 'success'
  };
  return map[status] || 'default';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    ongoing: '进行中',
    upcoming: '即将开始',
    ended: '已结束',
    pending: '待处理',
    resolved: '已解决'
  };
  return map[status] || status;
}

export function getEventIcon(type: string): string {
  const map: Record<string, string> = {
    festival: '🎉',
    birthday: '🎂',
    collaboration: '🤝'
  };
  return map[type] || '📅';
}

export function getMetricLabel(metric: string): string {
  const labels: Record<string, string> = {
    'satisfaction': '玩家满意度',
    'dailyRevenue': '日收入',
    'retention': '留存率',
    'marketShare': '市场份额',
    'reputation': '声誉',
    'negativeSentiment': '负面情绪',
    'incident_trigger': '事件触发',
    'activePlayers': '活跃玩家',
    'totalDraws': '抽卡次数'
  };
  return labels[metric] || metric;
}

export function getPopularityColor(popularity: number): string {
  if (popularity >= 80) return '#52c41a';
  if (popularity >= 60) return '#1890ff';
  if (popularity >= 40) return '#faad14';
  return '#ff4d4f';
}

export function getHeatColor(heat: number): string {
  if (heat >= 80) return '#ff4d4f';
  if (heat >= 50) return '#fa8c16';
  return '#52c41a';
}

export function getSentimentClass(sentiment: number): string {
  if (sentiment > 0) return 'positive';
  if (sentiment < 0) return 'negative';
  return 'neutral';
}
