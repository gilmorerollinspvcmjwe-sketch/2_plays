/**
 * 模板数据导出文件
 * 统一导出所有模板数据
 */

// 角色模板
export {
  characterTemplates,
  getCharacterTemplatesByCategory,
  getCharacterTemplateById
} from './characters';

// 剧情模板
export {
  sweetPlotTemplates,
  angstPlotTemplates,
  suspensePlotTemplates,
  allPlotTemplates,
  getAllPlotTemplates,
  getPlotTemplatesByType,
  getPlotTemplateById
} from './plots';

// 评论模板
export {
  gachaCommentTemplates,
  characterCommentTemplates,
  eventCommentTemplates,
  allCommentTemplates,
  getTotalCommentCount,
  getCommentTemplateStats,
  getRandomGachaComment,
  getGachaCommentByPlayerType,
  getRandomCharacterComment,
  getCharacterCommentByPlayerType,
  getRandomEventComment,
  getEventCommentBySatisfaction
} from './comments';

// 活动模板
export {
  festivalEventTemplates,
  birthdayEventTemplates,
  getAllFestivalEvents,
  getEventsByBudget,
  getHighImpactEvents
} from './events';

// 运营事件模板
export {
  incidentTemplates,
  getIncidentsBySeverity,
  getIncidentsByType,
  getRandomIncident,
  getIncidentSolutions
} from './incidents';
