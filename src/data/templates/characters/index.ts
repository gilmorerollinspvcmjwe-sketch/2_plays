/**
 * 角色模板导出文件
 */

export { presidentTemplates } from './president';
export { seniorTemplates } from './senior';
// 其他类型将在后续创建

// 合并所有角色模板
import { presidentTemplates } from './president';
import { seniorTemplates } from './senior';

export const characterTemplates = [
  ...presidentTemplates,
  ...seniorTemplates
  // 其他类型将在后续添加
];
