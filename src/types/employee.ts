/**
 * 员工管理系统类型定义
 * 乙游模拟器核心玩法 - 员工/团队系统
 */

// 员工职位
export type EmployeePosition = 'planning' | 'art' | 'program' | 'operation';

// 员工等级
export type EmployeeLevel = 'junior' | 'mid' | 'senior' | 'expert';

// 员工职业路径（转职系统）
export type EmployeeCareerPath = 'management' | 'technical' | 'general';

// 扩展员工接口
export interface Employee {
  planning: number;   // 策划技能 0-100
  art: number;        // 美术技能 0-100
  program: number;    // 程序技能 0-100
  operation: number;  // 运营技能 0-100
}

// 员工专长领域
export type EmployeeSpecialty = 
  | 'character_design'    // 角色设计
  | 'plot_writing'        // 剧情编写
  | 'ui_design'           // UI设计
  | 'illustration'        // 插画
  | 'frontend'            // 前端开发
  | 'backend'             // 后端开发
  | 'community'           // 社区运营
  | 'event_planning'      // 活动策划
  | 'data_analysis'       // 数据分析
  | 'none';               // 无专长

// 员工性格特质
export type EmployeeTrait =
  | 'hardworking'     // 勤奋
  | 'creative'        // 创意
  | 'detail_oriented' // 细心
  | 'team_player'     // 团队合作
  | 'leader'          // 领导力
  | 'independent'     // 独立
  | 'perfectionist'   // 完美主义
  | 'efficient';      // 高效

// 员工接口
export interface Employee {
  id: string;
  name: string;
  position: EmployeePosition;
  level: EmployeeLevel;
  
  // 技能属性
  skills: EmployeeSkills;
  
  // 状态属性
  fatigue: number;       // 疲劳度 0-100
  satisfaction: number;  // 满意度 0-100
  salary: number;        // 薪资
  
  // 特殊属性
  specialty: EmployeeSpecialty;
  trait: EmployeeTrait;
  
  // 成长属性
  experience: number;    // 经验值
  projectsCompleted: number;  // 完成项目数
  
  // 项目分配
  assignedProjectId: string | null;
  
  // 时间戳
  hiredAt: string;
  lastPromotionAt?: string;
  
  // 转职系统相关
  careerPath?: EmployeeCareerPath;  // 职业路径
  managementSkill?: number;         // 管理技能（管理岗）
  technicalDepth?: number;          // 技术深度（技术专家）
}

// 应聘者接口（招聘用）
export interface JobApplicant {
  id: string;
  name: string;
  position: EmployeePosition;
  level: EmployeeLevel;
  skills: EmployeeSkills;
  specialty: EmployeeSpecialty;
  trait: EmployeeTrait;
  expectedSalary: number;
  resume: string;
}

// 招聘信息
export interface JobPosting {
  id: string;
  position: EmployeePosition;
  level: EmployeeLevel;
  minSalary: number;
  maxSalary: number;
  requiredSkills: Partial<EmployeeSkills>;
  specialty?: EmployeeSpecialty;
  postedAt: string;
  applicants: JobApplicant[];
}

// 员工效率计算结果
export interface EmployeeEfficiency {
  baseEfficiency: number;      // 基础效率
  fatiguePenalty: number;      // 疲劳惩罚
  satisfactionBonus: number;   // 满意度加成
  specialtyBonus: number;      // 专长加成
  traitBonus: number;          // 性格加成
  finalEfficiency: number;     // 最终效率
}

// 员工创建参数
export interface CreateEmployeeParams {
  name: string;
  position: EmployeePosition;
  level: EmployeeLevel;
  skills: EmployeeSkills;
  specialty: EmployeeSpecialty;
  trait: EmployeeTrait;
  salary: number;
}

// 团队默契度
export interface TeamSynergy {
  teamId: string;
  synergy: number;  // 默契度 0-100
  members: string[];  // 成员 ID 列表
}

// 员工随机事件类型
export type EmployeeRandomEventType =
  | 'sick'      // 生病
  | 'award'     // 获奖
  | 'leave';    // 请假

// 员工随机事件
export interface EmployeeRandomEvent {
  id: string;
  employeeId: string;
  type: EmployeeRandomEventType;
  duration: number;  // 持续时间（天）
  startTime: string;
  endTime: string;
  effect: {
    fatigueChange?: number;      // 疲劳度变化
    satisfactionChange?: number; // 满意度变化
    efficiencyPenalty?: number;  // 效率惩罚
    experienceBonus?: number;    // 经验奖励
  };
  description: string;
  isActive: boolean;
}

// 初始化员工技能
export function initEmployeeSkills(): EmployeeSkills {
  return {
    planning: 50,
    art: 50,
    program: 50,
    operation: 50
  };
}

// 职位配置
export const EMPLOYEE_POSITION_CONFIG: Record<EmployeePosition, {
  name: string;
  icon: string;
  color: string;
  description: string;
}> = {
  planning: {
    name: '策划',
    icon: 'edit',
    color: '#1890ff',
    description: '负责游戏设计和剧情策划'
  },
  art: {
    name: '美术',
    icon: 'photo-o',
    color: '#52c41a',
    description: '负责角色设计和UI制作'
  },
  program: {
    name: '程序',
    icon: 'code-o',
    color: '#722ed1',
    description: '负责技术实现和系统开发'
  },
  operation: {
    name: '运营',
    icon: 'chart-trending-o',
    color: '#faad14',
    description: '负责活动策划和用户维护'
  }
};

// 等级配置
export const EMPLOYEE_LEVEL_CONFIG: Record<EmployeeLevel, {
  name: string;
  color: string;
  minSkill: number;
  maxSkill: number;
  baseSalary: number;
  expRequired: number;
}> = {
  junior: {
    name: '初级',
    color: '#8c8c8c',
    minSkill: 20,
    maxSkill: 50,
    baseSalary: 5000,
    expRequired: 0
  },
  mid: {
    name: '中级',
    color: '#1890ff',
    minSkill: 40,
    maxSkill: 70,
    baseSalary: 8000,
    expRequired: 1000
  },
  senior: {
    name: '高级',
    color: '#52c41a',
    minSkill: 60,
    maxSkill: 85,
    baseSalary: 12000,
    expRequired: 3000
  },
  expert: {
    name: '专家',
    color: '#faad14',
    minSkill: 80,
    maxSkill: 100,
    baseSalary: 20000,
    expRequired: 6000
  }
};

// 专长配置
export const EMPLOYEE_SPECIALTY_CONFIG: Record<EmployeeSpecialty, {
  name: string;
  description: string;
  applicablePositions: EmployeePosition[];
}> = {
  character_design: {
    name: '角色设计',
    description: '角色设计效率+20%',
    applicablePositions: ['art']
  },
  plot_writing: {
    name: '剧情编写',
    description: '剧情编写效率+20%',
    applicablePositions: ['planning']
  },
  ui_design: {
    name: 'UI设计',
    description: 'UI设计效率+20%',
    applicablePositions: ['art']
  },
  illustration: {
    name: '插画',
    description: '插画绘制效率+20%',
    applicablePositions: ['art']
  },
  frontend: {
    name: '前端开发',
    description: '前端开发效率+20%',
    applicablePositions: ['program']
  },
  backend: {
    name: '后端开发',
    description: '后端开发效率+20%',
    applicablePositions: ['program']
  },
  community: {
    name: '社区运营',
    description: '社区运营效率+20%',
    applicablePositions: ['operation']
  },
  event_planning: {
    name: '活动策划',
    description: '活动策划效率+20%',
    applicablePositions: ['operation', 'planning']
  },
  data_analysis: {
    name: '数据分析',
    description: '数据分析效率+20%',
    applicablePositions: ['operation', 'program']
  },
  none: {
    name: '无专长',
    description: '没有特殊专长',
    applicablePositions: ['planning', 'art', 'program', 'operation']
  }
};

// 性格特质配置
export const EMPLOYEE_TRAIT_CONFIG: Record<EmployeeTrait, {
  name: string;
  description: string;
  effect: string;
}> = {
  hardworking: {
    name: '勤奋',
    description: '工作更加努力',
    effect: '基础效率+10%，疲劳积累+10%'
  },
  creative: {
    name: '创意',
    description: '富有创造力',
    effect: '创意工作+15%效率'
  },
  detail_oriented: {
    name: '细心',
    description: '注重细节',
    effect: '质量+10%，速度-5%'
  },
  team_player: {
    name: '团队合作',
    description: '善于协作',
    effect: '团队整体+5%效率'
  },
  leader: {
    name: '领导力',
    description: '具有领导才能',
    effect: '团队整体+10%效率（仅限高级以上）'
  },
  independent: {
    name: '独立',
    description: '独立工作能力强',
    effect: '单独工作时+15%效率'
  },
  perfectionist: {
    name: '完美主义',
    description: '追求完美',
    effect: '质量+20%，速度-10%'
  },
  efficient: {
    name: '高效',
    description: '工作效率高',
    effect: '速度+15%'
  }
};

// 获取职位名称
export function getPositionName(position: EmployeePosition): string {
  return EMPLOYEE_POSITION_CONFIG[position]?.name || position;
}

// 获取等级名称
export function getLevelName(level: EmployeeLevel): string {
  return EMPLOYEE_LEVEL_CONFIG[level]?.name || level;
}

// 获取专长名称
export function getSpecialtyName(specialty: EmployeeSpecialty): string {
  return EMPLOYEE_SPECIALTY_CONFIG[specialty]?.name || specialty;
}

// 获取性格名称
export function getTraitName(trait: EmployeeTrait): string {
  return EMPLOYEE_TRAIT_CONFIG[trait]?.name || trait;
}

// 计算员工效率
export function calculateEmployeeEfficiency(
  employee: Employee,
  workType?: EmployeePosition
): EmployeeEfficiency {
  // 基础效率（基于对应技能）
  const skillValue = employee.skills[employee.position];
  const baseEfficiency = skillValue / 100;

  // 疲劳惩罚（疲劳度越高效率越低）
  const fatiguePenalty = employee.fatigue > 50 
    ? (employee.fatigue - 50) / 100 
    : 0;

  // 满意度加成（满意度越高效率越高）
  const satisfactionBonus = employee.satisfaction > 50 
    ? (employee.satisfaction - 50) / 200 
    : 0;

  // 专长加成
  let specialtyBonus = 0;
  if (workType && employee.specialty !== 'none') {
    const specialtyConfig = EMPLOYEE_SPECIALTY_CONFIG[employee.specialty];
    if (specialtyConfig.applicablePositions.includes(workType)) {
      specialtyBonus = 0.2;
    }
  }

  // 性格加成
  let traitBonus = 0;
  switch (employee.trait) {
    case 'hardworking':
      traitBonus = 0.1;
      break;
    case 'creative':
      if (employee.position === 'planning' || employee.position === 'art') {
        traitBonus = 0.15;
      }
      break;
    case 'efficient':
      traitBonus = 0.15;
      break;
    case 'detail_oriented':
    case 'perfectionist':
      traitBonus = 0.1;
      break;
  }

  // 计算最终效率
  const finalEfficiency = Math.max(0.1, 
    baseEfficiency - fatiguePenalty + satisfactionBonus + specialtyBonus + traitBonus
  );

  return {
    baseEfficiency,
    fatiguePenalty,
    satisfactionBonus,
    specialtyBonus,
    traitBonus,
    finalEfficiency
  };
}

// 计算升级所需经验
export function getExpForNextLevel(currentLevel: EmployeeLevel): number {
  const levels: EmployeeLevel[] = ['junior', 'mid', 'senior', 'expert'];
  const currentIndex = levels.indexOf(currentLevel);
  
  if (currentIndex >= levels.length - 1) {
    return 0; // 已经是最高级
  }
  
  const nextLevel = levels[currentIndex + 1];
  return EMPLOYEE_LEVEL_CONFIG[nextLevel].expRequired;
}

// 检查是否可以升级
export function canPromote(employee: Employee): boolean {
  const expRequired = getExpForNextLevel(employee.level);
  if (expRequired === 0) return false; // 已经是最高级
  
  return employee.experience >= expRequired;
}

// 计算离职风险
export function calculateTurnoverRisk(employee: Employee): number {
  let risk = 0;
  
  // 疲劳度过高
  if (employee.fatigue > 80) {
    risk += 0.3;
  } else if (employee.fatigue > 60) {
    risk += 0.15;
  }
  
  // 满意度低
  if (employee.satisfaction < 20) {
    risk += 0.4;
  } else if (employee.satisfaction < 40) {
    risk += 0.2;
  }
  
  // 薪资低于期望
  const expectedSalary = EMPLOYEE_LEVEL_CONFIG[employee.level].baseSalary;
  if (employee.salary < expectedSalary * 0.8) {
    risk += 0.2;
  }
  
  // 长期未分配项目
  if (!employee.assignedProjectId) {
    risk += 0.1;
  }
  
  return Math.min(1, risk);
}

// 生成随机应聘者
export function generateRandomApplicant(position: EmployeePosition): JobApplicant {
  const levels: EmployeeLevel[] = ['junior', 'mid', 'senior', 'expert'];
  const levelWeights = [0.5, 0.3, 0.15, 0.05];
  
  // 根据权重随机选择等级
  const random = Math.random();
  let cumulativeWeight = 0;
  let selectedLevel: EmployeeLevel = 'junior';
  
  for (let i = 0; i < levels.length; i++) {
    cumulativeWeight += levelWeights[i];
    if (random <= cumulativeWeight) {
      selectedLevel = levels[i];
      break;
    }
  }
  
  const levelConfig = EMPLOYEE_LEVEL_CONFIG[selectedLevel];
  
  // 生成技能值
  const skills: EmployeeSkills = {
    planning: Math.floor(Math.random() * (levelConfig.maxSkill - levelConfig.minSkill) + levelConfig.minSkill),
    art: Math.floor(Math.random() * (levelConfig.maxSkill - levelConfig.minSkill) + levelConfig.minSkill),
    program: Math.floor(Math.random() * (levelConfig.maxSkill - levelConfig.minSkill) + levelConfig.minSkill),
    operation: Math.floor(Math.random() * (levelConfig.maxSkill - levelConfig.minSkill) + levelConfig.minSkill)
  };
  
  // 确保对应职位技能较高
  skills[position] = Math.min(100, skills[position] + 10);
  
  // 随机专长
  const specialties = Object.keys(EMPLOYEE_SPECIALTY_CONFIG) as EmployeeSpecialty[];
  const applicableSpecialties = specialties.filter(s => 
    EMPLOYEE_SPECIALTY_CONFIG[s].applicablePositions.includes(position)
  );
  const specialty = applicableSpecialties[Math.floor(Math.random() * applicableSpecialties.length)] || 'none';
  
  // 随机性格
  const traits = Object.keys(EMPLOYEE_TRAIT_CONFIG) as EmployeeTrait[];
  const trait = traits[Math.floor(Math.random() * traits.length)];
  
  // 生成名字
  const surnames = ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴'];
  const names = ['明', '华', '强', '伟', '磊', '静', '敏', '丽', '婷', '娜', '涛', '杰', '浩', '鹏', '宇'];
  const name = surnames[Math.floor(Math.random() * surnames.length)] + 
               names[Math.floor(Math.random() * names.length)];
  
  // 计算期望薪资（有一定浮动）
  const salaryVariation = 0.8 + Math.random() * 0.4; // 0.8 - 1.2
  const expectedSalary = Math.floor(levelConfig.baseSalary * salaryVariation);
  
  return {
    id: `applicant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    position,
    level: selectedLevel,
    skills,
    specialty,
    trait,
    expectedSalary,
    resume: generateResume(name, position, selectedLevel, specialty, trait)
  };
}

// 生成简历
function generateResume(
  name: string,
  position: EmployeePosition,
  level: EmployeeLevel,
  specialty: EmployeeSpecialty,
  trait: EmployeeTrait
): string {
  const positionName = getPositionName(position);
  const levelName = getLevelName(level);
  const specialtyName = getSpecialtyName(specialty);
  const traitName = getTraitName(trait);
  
  const templates = [
    `${name}是一名${levelName}${positionName}，擅长${specialtyName}。性格${traitName}，工作认真负责。`,
    `拥有多年${positionName}经验的${name}，在${specialtyName}方面有独特见解。为人${traitName}，深受团队喜爱。`,
    `${name}毕业于知名院校，专攻${positionName}方向。${traitName}的工作态度使其在${specialtyName}领域取得了不错的成绩。`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}
