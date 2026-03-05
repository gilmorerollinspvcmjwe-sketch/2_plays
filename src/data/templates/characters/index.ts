/**
 * 角色模板导出文件
 */

export { presidentTemplates } from './president';
export { seniorTemplates } from './senior';
export { youngerBrotherTemplates } from './youngerBrother';
export { coldGodTemplates } from './coldGod';
export { sunshineSportsTemplates } from './sunshineSports';
export { mysteriousTransferTemplates } from './mysteriousTransfer';
export { childhoodSweetheartTemplates } from './childhoodSweetheart';
export { yandereArtistTemplates } from './yandereArtist';

// 合并所有角色模板
import { presidentTemplates } from './president';
import { seniorTemplates } from './senior';
import { youngerBrotherTemplates } from './youngerBrother';
import { coldGodTemplates } from './coldGod';
import { sunshineSportsTemplates } from './sunshineSports';
import { mysteriousTransferTemplates } from './mysteriousTransfer';
import { childhoodSweetheartTemplates } from './childhoodSweetheart';
import { yandereArtistTemplates } from './yandereArtist';

export const characterTemplates = [
  ...presidentTemplates,
  ...seniorTemplates,
  ...youngerBrotherTemplates,
  ...coldGodTemplates,
  ...sunshineSportsTemplates,
  ...mysteriousTransferTemplates,
  ...childhoodSweetheartTemplates,
  ...yandereArtistTemplates
];
