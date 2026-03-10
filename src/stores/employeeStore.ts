/**
 * 员工管理 Store
 * 乙游模拟器核心玩法 - 员工/团队系统
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Employee,
  EmployeePosition,
  EmployeeLevel,
  JobApplicant,
  JobPosting,
  CreateEmployeeParams,
  EmployeeEfficiency,
  EmployeeCareerPath
} from '@/types/employee';
import {
  initEmployeeSkills,
  calculateEmployeeEfficiency,
  canPromote,
  calculateTurnoverRisk,
  generateRandomApplicant,
  getExpForNextLevel,
  EMPLOYEE_LEVEL_CONFIG,
  getPositionName,
  getLevelName,
  type Employee,
  type TeamSynergy
} from '@/types/employee';
import { triggerEvents, type DailyEvent } from '@/engine/dailyEventEngine';
import { useCompanyStore } from './companyStore';

export const useEmployeeStore = defineStore('employee', () => {
  // State
  const employees = ref<Employee[]>([]);
  const jobPostings = ref<JobPosting[]>([]);
  const teamSynergies = ref<Map<string, TeamSynergy>>(new Map());
  const projectSuccessHistory = ref<Map<string, boolean[]>>(new Map());
  const dailyEvents = ref<DailyEvent[]>([]);

  // Getters
  const totalEmployees = computed(() => employees.value.length);

  const employeesByPosition = computed(() => {
    const result: Record<EmployeePosition, Employee[]> = {
      planning: [],
      art: [],
      program: [],
      operation: []
    };
    employees.value.forEach(emp => {
      result[emp.position].push(emp);
    });
    return result;
  });

  const availableEmployees = computed(() => {
    return employees.value.filter(emp => !emp.assignedProjectId);
  });

  const assignedEmployees = computed(() => {
    return employees.value.filter(emp => emp.assignedProjectId);
  });

  const highRiskEmployees = computed(() => {
    return employees.value.filter(emp => calculateTurnoverRisk(emp) > 0.5);
  });

  const totalSalary = computed(() => {
    return employees.value.reduce((sum, emp) => sum + emp.salary, 0);
  });

  const dailySalary = computed(() => {
    return Math.floor(totalSalary.value / 365);
  });

  const averageFatigue = computed(() => {
    if (employees.value.length === 0) return 0;
    return employees.value.reduce((sum, emp) => sum + emp.fatigue, 0) / employees.value.length;
  });

  const averageSatisfaction = computed(() => {
    if (employees.value.length === 0) return 0;
    return employees.value.reduce((sum, emp) => sum + emp.satisfaction, 0) / employees.value.length;
  });

  // Actions

  /**
   * 创建员工（直接雇佣）
   * 薪资范围（年薪）：
   * - 初级(level 1-2): 8-12万/年 → 日薪 220-330元
   * - 中级(level 3-4): 15-25万/年 → 日薪 410-685元
   * - 高级(level 5): 30-50万/年 → 日薪 820-1370元
   */
  function createEmployee(params: CreateEmployeeParams): Employee {
    // 如果没有提供薪资，根据等级生成默认薪资
    let salary = params.salary;
    if (!salary || salary <= 0) {
      const levelMap: Record<EmployeeLevel, number> = {
        junior: 1,
        mid: 3,
        senior: 5,
        expert: 5
      };
      const levelNum = levelMap[params.level] || 1;
      
      if (levelNum <= 2) {
        // 初级: 8-12万/年
        salary = Math.floor(Math.random() * (120000 - 80000 + 1)) + 80000;
      } else if (levelNum <= 4) {
        // 中级: 15-25万/年
        salary = Math.floor(Math.random() * (250000 - 150000 + 1)) + 150000;
      } else {
        // 高级: 30-50万/年
        salary = Math.floor(Math.random() * (500000 - 300000 + 1)) + 300000;
      }
    }

    const employee: Employee = {
      id: `emp_${Date.now()}`,
      name: params.name,
      position: params.position,
      level: params.level,
      skills: { ...params.skills },
      fatigue: 0,
      satisfaction: 70,
      salary: salary,
      specialty: params.specialty,
      trait: params.trait,
      experience: 0,
      projectsCompleted: 0,
      assignedProjectId: null,
      hiredAt: new Date().toISOString()
    };

    employees.value.push(employee);
    saveToLocal();
    return employee;
  }

  /**
   * 获取指定员工的日工资
   */
  function getEmployeeDailySalary(employeeId: string): number {
    const employee = employees.value.find(e => e.id === employeeId);
    if (!employee) return 0;
    return Math.floor(employee.salary / 365);
  }

  /**
   * 发布招聘信息
   */
  function postJob(
    position: EmployeePosition,
    level: EmployeeLevel,
    minSalary: number,
    maxSalary: number
  ): JobPosting {
    const posting: JobPosting = {
      id: `job_${Date.now()}`,
      position,
      level,
      minSalary,
      maxSalary,
      requiredSkills: {},
      postedAt: new Date().toISOString(),
      applicants: []
    };

    // 生成应聘者
    const applicantCount = Math.floor(Math.random() * 3) + 2; // 2-4个应聘者
    for (let i = 0; i < applicantCount; i++) {
      const applicant = generateRandomApplicant(position);
      // 只保留符合薪资范围的应聘者
      if (applicant.expectedSalary >= minSalary && applicant.expectedSalary <= maxSalary) {
        posting.applicants.push(applicant);
      }
    }

    jobPostings.value.push(posting);
    saveToLocal();
    return posting;
  }

  /**
   * 雇佣应聘者
   */
  function hireApplicant(postingId: string, applicantId: string): { success: boolean; message: string; employee?: Employee } {
    const posting = jobPostings.value.find(p => p.id === postingId);
    if (!posting) {
      return { success: false, message: '招聘信息不存在' };
    }

    const applicant = posting.applicants.find(a => a.id === applicantId);
    if (!applicant) {
      return { success: false, message: '应聘者不存在' };
    }

    // 获取 companyStore 检查资金
    const companyStore = useCompanyStore();
    const monthlySalary = Math.floor(applicant.expectedSalary / 12);

    // 检查资金是否足够支付一个月工资
    if (!companyStore.canSpend(monthlySalary)) {
      return { success: false, message: '资金不足以支付新员工一个月工资' };
    }

    // 扣除一个月工资
    const spendSuccess = companyStore.spendFunds(monthlySalary, '新员工预付工资');
    if (!spendSuccess) {
      return { success: false, message: '资金扣除失败，请稍后重试' };
    }

    // 创建员工
    const employee = createEmployee({
      name: applicant.name,
      position: applicant.position,
      level: applicant.level,
      skills: applicant.skills,
      specialty: applicant.specialty,
      trait: applicant.trait,
      salary: applicant.expectedSalary
    });

    // 移除招聘信息
    const postingIndex = jobPostings.value.findIndex(p => p.id === postingId);
    if (postingIndex !== -1) {
      jobPostings.value.splice(postingIndex, 1);
    }

    saveToLocal();
    return { success: true, message: `成功雇佣${applicant.name}`, employee };
  }

  /**
   * 分配员工到项目
   */
  function assignToProject(employeeId: string, projectId: string | null): boolean {
    const employee = employees.value.find(e => e.id === employeeId);
    if (!employee) return false;

    employee.assignedProjectId = projectId;
    saveToLocal();
    return true;
  }

  /**
   * 调整薪资
   */
  function adjustSalary(employeeId: string, newSalary: number): { success: boolean; message: string } {
    const employee = employees.value.find(e => e.id === employeeId);
    if (!employee) {
      return { success: false, message: '员工不存在' };
    }

    const oldSalary = employee.salary;
    employee.salary = newSalary;

    // 根据薪资调整满意度
    const expectedSalary = EMPLOYEE_LEVEL_CONFIG[employee.level].baseSalary;
    if (newSalary > oldSalary) {
      employee.satisfaction = Math.min(100, employee.satisfaction + 10);
    } else if (newSalary < expectedSalary * 0.8) {
      employee.satisfaction = Math.max(0, employee.satisfaction - 15);
    }

    saveToLocal();
    return { success: true, message: '薪资调整成功' };
  }

  /**
   * 员工升级
   */
  function promoteEmployee(employeeId: string): { success: boolean; message: string } {
    const employee = employees.value.find(e => e.id === employeeId);
    if (!employee) {
      return { success: false, message: '员工不存在' };
    }

    if (!canPromote(employee)) {
      return { success: false, message: '经验不足，无法升级' };
    }

    const levels: EmployeeLevel[] = ['junior', 'mid', 'senior', 'expert'];
    const currentIndex = levels.indexOf(employee.level);
    
    if (currentIndex >= levels.length - 1) {
      return { success: false, message: '已经是最高等级' };
    }

    const oldLevel = employee.level;
    employee.level = levels[currentIndex + 1];
    employee.lastPromotionAt = new Date().toISOString();

    // 升级后薪资调整
    const newBaseSalary = EMPLOYEE_LEVEL_CONFIG[employee.level].baseSalary;
    employee.salary = Math.max(employee.salary, newBaseSalary);

    // 升级后满意度提升
    employee.satisfaction = Math.min(100, employee.satisfaction + 20);

    saveToLocal();
    return { 
      success: true, 
      message: `${employee.name}从${getLevelName(oldLevel)}晋升为${getLevelName(employee.level)}！`
    };
  }

  /**
   * 增加经验值
   */
  function addExperience(employeeId: string, amount: number): boolean {
    const employee = employees.value.find(e => e.id === employeeId);
    if (!employee) return false;

    employee.experience += amount;

    // 检查是否可以升级
    if (canPromote(employee)) {
      // 可以升级，但不自动升级，让玩家决定
    }

    saveToLocal();
    return true;
  }

  /**
   * 增加疲劳度
   */
  function addFatigue(employeeId: string, amount: number): boolean {
    const employee = employees.value.find(e => e.id === employeeId);
    if (!employee) return false;

    employee.fatigue = Math.min(100, employee.fatigue + amount);
    saveToLocal();
    return true;
  }

  /**
   * 减少疲劳度（休息）
   */
  function restEmployee(employeeId: string): { success: boolean; message: string } {
    const employee = employees.value.find(e => e.id === employeeId);
    if (!employee) {
      return { success: false, message: '员工不存在' };
    }

    if (employee.assignedProjectId) {
      return { success: false, message: '员工正在项目中，无法休息' };
    }

    employee.fatigue = Math.max(0, employee.fatigue - 30);
    saveToLocal();
    return { success: true, message: `${employee.name}休息后恢复了精力` };
  }

  /**
   * 批量休息所有未分配员工
   */
  function restAllAvailableEmployees(): { rested: number; message: string } {
    const availableEmps = employees.value.filter(e => !e.assignedProjectId);
    let rested = 0;

    availableEmps.forEach(emp => {
      if (emp.fatigue > 0) {
        emp.fatigue = Math.max(0, emp.fatigue - 30);
        rested++;
      }
    });

    saveToLocal();
    return { 
      rested, 
      message: `${rested}名员工得到了休息` 
    };
  }

  /**
   * 解雇员工
   */
  function fireEmployee(employeeId: string): { success: boolean; message: string } {
    const index = employees.value.findIndex(e => e.id === employeeId);
    if (index === -1) {
      return { success: false, message: '员工不存在' };
    }

    const employee = employees.value[index];
    if (employee.assignedProjectId) {
      return { success: false, message: '员工正在项目中，请先移除分配' };
    }

    employees.value.splice(index, 1);
    saveToLocal();
    return { success: true, message: `已解雇${employee.name}` };
  }

  /**
   * 处理员工离职（优化版：与满意度、疲劳度挂钩）
   */
  function processTurnover(): { left: Employee[]; message: string } {
    const left: Employee[] = [];

    employees.value.forEach(employee => {
      const risk = calculateTurnoverRisk(employee);
      
      // 基础离职概率
      let turnoverChance = risk;
      
      // 疲劳度过高增加离职概率
      if (employee.fatigue >= 90) {
        turnoverChance += 0.2;
      } else if (employee.fatigue >= 70) {
        turnoverChance += 0.1;
      }
      
      // 满意度极低时大幅增加离职概率
      if (employee.satisfaction <= 10) {
        turnoverChance += 0.3;
      } else if (employee.satisfaction <= 20) {
        turnoverChance += 0.15;
      }
      
      // 长期未分配项目增加离职概率
      if (!employee.assignedProjectId && employee.hiredAt) {
        const daysSinceHired = Math.floor((Date.now() - new Date(employee.hiredAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceHired > 7) {
          turnoverChance += 0.15;
        }
      }
      
      // 性格影响离职概率
      if (employee.trait === 'independent') {
        turnoverChance += 0.05;
      } else if (employee.trait === 'team_player') {
        turnoverChance -= 0.05;
      }
      
      // 确保概率在合理范围
      turnoverChance = Math.max(0, Math.min(1, turnoverChance));
      
      if (Math.random() < turnoverChance) {
        left.push(employee);
      }
    });

    // 移除离职员工
    left.forEach(emp => {
      const index = employees.value.findIndex(e => e.id === emp.id);
      if (index !== -1) {
        employees.value.splice(index, 1);
      }
    });

    if (left.length > 0) {
      saveToLocal();
    }

    return {
      left,
      message: left.length > 0 
        ? `${left.map(e => e.name).join('、')}离开了公司`
        : '没有员工离职'
    };
  }

  /**
   * 获取可升级员工列表
   */
  function getPromotableEmployees(): Employee[] {
    return employees.value.filter(emp => canPromote(emp));
  }

  /**
   * 检查员工是否可以转职
   */
  function canChangeCareerPath(employee: Employee): boolean {
    // 只有高级及以上才能转职
    if (employee.level !== 'senior' && employee.level !== 'expert') {
      return false;
    }
    
    // 管理岗需要一定的管理技能
    if (employee.careerPath === 'management' && (employee.managementSkill || 0) < 50) {
      return false;
    }
    
    // 技术专家需要一定的技术深度
    if (employee.careerPath === 'technical' && (employee.technicalDepth || 0) < 50) {
      return false;
    }
    
    return true;
  }

  /**
   * 员工转职（管理岗/技术专家）
   */
  function changeCareerPath(employeeId: string, newCareerPath: EmployeeCareerPath): { success: boolean; message: string } {
    const employee = employees.value.find(e => e.id === employeeId);
    if (!employee) {
      return { success: false, message: '员工不存在' };
    }

    if (!canChangeCareerPath(employee)) {
      return { success: false, message: '该员工不符合转职条件（需要高级及以上，且对应技能达标）' };
    }

    const oldPath = employee.careerPath || 'general';
    employee.careerPath = newCareerPath;

    // 根据转职类型初始化技能
    if (newCareerPath === 'management') {
      employee.managementSkill = employee.managementSkill || 50;
      employee.salary = Math.floor(employee.salary * 1.2); // 管理岗薪资 +20%
    } else if (newCareerPath === 'technical') {
      employee.technicalDepth = employee.technicalDepth || 50;
      employee.salary = Math.floor(employee.salary * 1.15); // 技术专家薪资 +15%
    } else {
      // 转回普通岗
      employee.salary = Math.floor(employee.salary * 0.9);
    }

    employee.satisfaction = Math.min(100, employee.satisfaction + 10);
    
    saveToLocal();
    return { 
      success: true, 
      message: `${employee.name}从${getCareerPathName(oldPath)}转为${getCareerPathName(newCareerPath)}！`
    };
  }

  /**
   * 获取职业路径名称
   */
  function getCareerPathName(careerPath: EmployeeCareerPath | undefined): string {
    const names: Record<EmployeeCareerPath, string> = {
      management: '管理岗',
      technical: '技术专家',
      general: '普通员工'
    };
    return names[careerPath || 'general'];
  }

  /**
   * 获取员工成长提示（UI 用）
   */
  function getEmployeeGrowthTips(employeeId: string): {
    canPromote: boolean;
    canChangeCareer: boolean;
    needsRest: boolean;
    needsSalaryAdjust: boolean;
    tips: string[];
  } {
    const employee = employees.value.find(e => e.id === employeeId);
    const tips: string[] = [];

    if (!employee) {
      return { canPromote: false, canChangeCareer: false, needsRest: false, needsSalaryAdjust: false, tips };
    }

    const canProm = canPromote(employee);
    const canCareer = canChangeCareerPath(employee);
    const needsRest = employee.fatigue >= 70;
    
    const expectedSalary = EMPLOYEE_LEVEL_CONFIG[employee.level].baseSalary;
    const needsSalaryAdjust = employee.salary < expectedSalary * 0.9;

    // 生成提示
    if (canProm) {
      tips.push(`⭐ ${employee.name} 可以升级！当前经验：${employee.experience}/${getExpForNextLevel(employee.level)}`);
    }
    
    if (canCareer && !employee.careerPath) {
      tips.push(`💼 ${employee.name} 可以转职（管理岗/技术专家）`);
    }
    
    if (needsRest) {
      tips.push(`😴 ${employee.name} 疲劳度过高（${employee.fatigue}），建议休息`);
    }
    
    if (needsSalaryAdjust) {
      tips.push(`💰 ${employee.name} 薪资偏低，建议调整至${expectedSalary}`);
    }
    
    if (employee.satisfaction < 30) {
      tips.push(`😟 ${employee.name} 满意度较低（${employee.satisfaction}），需要关注`);
    }

    return {
      canPromote: canProm,
      canChangeCareer: canCareer,
      needsRest,
      needsSalaryAdjust,
      tips
    };
  }

  /**
   * 批量获取所有员工的成长提示
   */
  function getAllEmployeeGrowthTips(): Array<{
    employeeId: string;
    employeeName: string;
    tips: string[];
    hasAction: boolean;
  }> {
    const result: Array<{
      employeeId: string;
      employeeName: string;
      tips: string[];
      hasAction: boolean;
    }> = [];

    employees.value.forEach(emp => {
      const growthTips = getEmployeeGrowthTips(emp.id);
      if (growthTips.tips.length > 0) {
        result.push({
          employeeId: emp.id,
          employeeName: emp.name,
          tips: growthTips.tips,
          hasAction: growthTips.canPromote || growthTips.canChangeCareer || growthTips.needsRest || growthTips.needsSalaryAdjust
        });
      }
    });

    // 按是否有行动建议排序
    result.sort((a, b) => (b.hasAction ? 1 : 0) - (a.hasAction ? 1 : 0));
    
    return result;
  }

  /**
   * 保存项目结果（用于满意度计算）
   */
  function recordProjectResult(projectId: string, success: boolean, projectEmployees?: string[]): void {
    const history = projectSuccessHistory.value.get(projectId) || [];
    history.push(success);
    if (history.length > 10) {
      history.shift();
    }
    projectSuccessHistory.value.set(projectId, history);

    // 更新参与员工的满意度
    const employeesToUpdate = projectEmployees 
      ? employees.value.filter(e => projectEmployees.includes(e.id))
      : employees.value.filter(e => e.assignedProjectId === projectId);

    employeesToUpdate.forEach(emp => {
      if (success) {
        // 项目成功：满意度 +3
        emp.satisfaction = Math.min(100, emp.satisfaction + 3);
        // 额外经验奖励
        emp.experience += 10;
      } else {
        // 项目失败：连续失败 -5
        const recentFailures = history.filter(h => !h).length;
        if (recentFailures >= 2) {
          emp.satisfaction = Math.max(0, emp.satisfaction - 5);
        } else {
          emp.satisfaction = Math.max(0, emp.satisfaction - 2);
        }
      }
    });

    saveToLocal();
  }

  /**
   * 模拟每日更新
   */
  function simulateDailyUpdate(projectIds: string[] = [], characterNames: string[] = []): {
    fatigueIncreased: number;
    satisfactionChanged: number;
    turnover: Employee[];
    events: DailyEvent[];
    leveledUpEmployees: Employee[];
  } {
    let fatigueIncreased = 0;
    let satisfactionChanged = 0;
    const leveledUpEmployees: Employee[] = [];

    // 触发随机事件
    const eventResult = triggerEvents({
      employees: employees.value,
      projectIds,
      characterNames
    });
    dailyEvents.value = eventResult.events;

    // 处理事件影响
    eventResult.events.forEach(event => {
      if (event.affectedEmployeeId) {
        const employee = employees.value.find(e => e.id === event.affectedEmployeeId);
        if (employee) {
          if (event.impact.fatigueChange) {
            employee.fatigue = Math.max(0, Math.min(100, employee.fatigue + event.impact.fatigueChange));
          }
          if (event.impact.satisfactionChange) {
            employee.satisfaction = Math.max(0, Math.min(100, employee.satisfaction + event.impact.satisfactionChange));
          }
          if (event.impact.experienceBonus) {
            employee.experience += event.impact.experienceBonus;
          }
        }
      }
    });

    employees.value.forEach(employee => {
      // 分配了项目的员工增加疲劳
      if (employee.assignedProjectId) {
        const fatigueIncrease = employee.trait === 'hardworking' ? 12 : 10;
        employee.fatigue = Math.min(100, employee.fatigue + fatigueIncrease);
        fatigueIncreased++;

        // 增加经验（基于项目进度）
        const expGain = employee.trait === 'efficient' ? 6 : 5;
        employee.experience += expGain;
      } else {
        // 未分配项目的员工休息，减少疲劳
        employee.fatigue = Math.max(0, employee.fatigue - 30);
        // 但未分配项目的员工满意度下降
        employee.satisfaction = Math.max(0, employee.satisfaction - 2);
        satisfactionChanged++;
      }

      // 薪资满意度
      const expectedSalary = EMPLOYEE_LEVEL_CONFIG[employee.level].baseSalary;
      if (employee.salary >= expectedSalary) {
        employee.satisfaction = Math.min(100, employee.satisfaction + 1);
      } else if (employee.salary < expectedSalary * 0.8) {
        employee.satisfaction = Math.max(0, employee.satisfaction - 3);
      } else {
        employee.satisfaction = Math.max(0, employee.satisfaction - 1);
      }

      // 检查是否可以升级
      if (canPromote(employee)) {
        leveledUpEmployees.push(employee);
      }
    });

    // 处理离职（与满意度、疲劳度挂钩）
    const { left: turnover } = processTurnover();

    saveToLocal();
    return { fatigueIncreased, satisfactionChanged, turnover, events: eventResult.events, leveledUpEmployees };
  }

  /**
   * 获取员工效率
   */
  function getEmployeeEfficiency(employeeId: string, workType?: EmployeePosition): EmployeeEfficiency | null {
    const employee = employees.value.find(e => e.id === employeeId);
    if (!employee) return null;

    return calculateEmployeeEfficiency(employee, workType);
  }

  /**
   * 获取或创建团队默契度
   */
  function getTeamSynergy(teamId: string): TeamSynergy | null {
    return teamSynergies.value.get(teamId) || null;
  }

  /**
   * 创建或更新团队默契度
   */
  function updateTeamSynergy(teamId: string, memberIds: string[]): TeamSynergy {
    const existing = teamSynergies.value.get(teamId);
    
    if (existing) {
      // 更新现有团队
      existing.members = memberIds;
      // 每日增长：+1/天，7 天后开始
      if (existing.synergy < 100) {
        existing.synergy = Math.min(100, existing.synergy + 1);
      }
      return existing;
    } else {
      // 创建新团队，初始默契度为 50
      const synergy: TeamSynergy = {
        teamId,
        synergy: 50,
        members: memberIds
      };
      teamSynergies.value.set(teamId, synergy);
      return synergy;
    }
  }

  /**
   * 计算默契度加成
   */
  function getSynergyBonus(synergy: number): number {
    if (synergy >= 90) {
      return 0.15; // +15%
    } else if (synergy >= 70) {
      return 0.10; // +10%
    } else if (synergy >= 50) {
      return 0.05; // +5%
    }
    return 0;
  }

  /**
   * 获取项目团队效率（应用默契度加成）
   */
  function getProjectTeamEfficiency(projectId: string): {
    planning: number;
    art: number;
    program: number;
    operation: number;
    overall: number;
    synergyBonus: number;
  } {
    const projectEmployees = employees.value.filter(e => e.assignedProjectId === projectId);

    const byPosition: Record<EmployeePosition, number> = {
      planning: 0,
      art: 0,
      program: 0,
      operation: 0
    };

    projectEmployees.forEach(emp => {
      const efficiency = calculateEmployeeEfficiency(emp, emp.position);
      byPosition[emp.position] += efficiency.finalEfficiency;
    });

    const overall = projectEmployees.length > 0
      ? projectEmployees.reduce((sum, emp) => {
          const eff = calculateEmployeeEfficiency(emp, emp.position);
          return sum + eff.finalEfficiency;
        }, 0) / projectEmployees.length
      : 0;

    // 计算团队默契度加成
    const memberIds = projectEmployees.map(e => e.id);
    const teamSynergy = updateTeamSynergy(projectId, memberIds);
    const synergyBonus = getSynergyBonus(teamSynergy.synergy);

    // 应用默契度加成到整体效率
    const overallWithSynergy = overall * (1 + synergyBonus);

    return {
      planning: byPosition.planning,
      art: byPosition.art,
      program: byPosition.program,
      operation: byPosition.operation,
      overall: overallWithSynergy,
      synergyBonus
    };
  }

  /**
   * 获取员工信息
   */
  function getEmployee(employeeId: string): Employee | null {
    return employees.value.find(e => e.id === employeeId) || null;
  }

  /**
   * 获取项目的员工列表
   */
  function getProjectEmployees(projectId: string): Employee[] {
    return employees.value.filter(e => e.assignedProjectId === projectId);
  }

  /**
   * 初始化默认员工
   * 使用合理的年薪范围
   */
  function initDefaultEmployees(): void {
    if (employees.value.length === 0) {
      // 创建一些默认员工
      const defaultEmployees: CreateEmployeeParams[] = [
        {
          name: '李明',
          position: 'planning',
          level: 'mid',
          skills: { planning: 65, art: 40, program: 30, operation: 45 },
          specialty: 'plot_writing',
          trait: 'creative',
          salary: 180000 // 中级：约18万/年，日薪约493元
        },
        {
          name: '王芳',
          position: 'art',
          level: 'mid',
          skills: { planning: 35, art: 70, program: 25, operation: 30 },
          specialty: 'character_design',
          trait: 'creative',
          salary: 200000 // 中级：约20万/年，日薪约548元
        },
        {
          name: '张伟',
          position: 'program',
          level: 'junior',
          skills: { planning: 25, art: 20, program: 55, operation: 30 },
          specialty: 'frontend',
          trait: 'efficient',
          salary: 100000 // 初级：约10万/年，日薪约274元
        }
      ];

      defaultEmployees.forEach(params => createEmployee(params));
    }
  }

  /**
   * 保存到本地存储
   */
  function saveToLocal(): void {
    const data = {
      employees: employees.value,
      jobPostings: jobPostings.value,
      teamSynergies: Array.from(teamSynergies.value.entries()),
      projectSuccessHistory: Array.from(projectSuccessHistory.value.entries()),
      dailyEvents: dailyEvents.value
    };
    localStorage.setItem('employee_data', JSON.stringify(data));
  }

  /**
   * 从本地存储加载
   */
  function loadFromLocal(): void {
    const saved = localStorage.getItem('employee_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        employees.value = data.employees || [];
        jobPostings.value = data.jobPostings || [];
        
        // 加载团队默契度
        if (data.teamSynergies && Array.isArray(data.teamSynergies)) {
          teamSynergies.value = new Map(data.teamSynergies);
        }
        
        // 加载项目成功历史
        if (data.projectSuccessHistory && Array.isArray(data.projectSuccessHistory)) {
          projectSuccessHistory.value = new Map(data.projectSuccessHistory);
        }
        
        // 加载每日事件
        if (data.dailyEvents && Array.isArray(data.dailyEvents)) {
          dailyEvents.value = data.dailyEvents;
        }
      } catch (e) {
        console.error('加载员工数据失败:', e);
      }
    }
  }

  // 初始化时加载数据
  loadFromLocal();

  return {
    // State
    employees,
    jobPostings,
    teamSynergies,
    projectSuccessHistory,
    dailyEvents,

    // Getters
    totalEmployees,
    employeesByPosition,
    availableEmployees,
    assignedEmployees,
    highRiskEmployees,
    totalSalary,
    dailySalary,
    averageFatigue,
    averageSatisfaction,

    // Actions
    createEmployee,
    postJob,
    hireApplicant,
    assignToProject,
    adjustSalary,
    promoteEmployee,
    addExperience,
    addFatigue,
    restEmployee,
    restAllAvailableEmployees,
    fireEmployee,
    processTurnover,
    simulateDailyUpdate,
    getEmployeeEfficiency,
    getProjectTeamEfficiency,
    getEmployee,
    getProjectEmployees,
    initDefaultEmployees,
    saveToLocal,
    loadFromLocal,
    // 新增功能
    recordProjectResult,
    getTeamSynergy,
    updateTeamSynergy,
    getSynergyBonus,
    // 员工成长系统
    getPromotableEmployees,
    canChangeCareerPath,
    changeCareerPath,
    getCareerPathName,
    getEmployeeGrowthTips,
    getAllEmployeeGrowthTips,
    // 日工资计算
    getEmployeeDailySalary
  };
});
