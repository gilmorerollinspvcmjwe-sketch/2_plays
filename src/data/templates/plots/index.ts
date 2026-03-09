/**
 * 剧情模板导出文件
 */

export { sweetPlotTemplates } from './sweetPlots';
export { angstPlotTemplates } from './angstPlots';
export { suspensePlotTemplates } from './suspensePlots';

// 合并所有剧情模板
import { sweetPlotTemplates } from './sweetPlots';
import { angstPlotTemplates } from './angstPlots';
import { suspensePlotTemplates } from './suspensePlots';

export const allPlotTemplates = {
  sweet: sweetPlotTemplates,
  angst: angstPlotTemplates,
  suspense: suspensePlotTemplates
};

// 获取所有剧情模板数组
export const getAllPlotTemplates = () => {
  return [
    ...sweetPlotTemplates,
    ...angstPlotTemplates,
    ...suspensePlotTemplates
  ];
};

// 根据类型获取剧情模板
export const getPlotTemplatesByType = (type: 'sweet' | 'angst' | 'suspense') => {
  return allPlotTemplates[type] || [];
};

// 根据ID获取剧情模板
export const getPlotTemplateById = (id: string) => {
  return getAllPlotTemplates().find(template => template.id === id);
};
