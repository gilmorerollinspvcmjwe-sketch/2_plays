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
  EmployeeEfficiency
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
  getLevelName
} from '@/types/employee';

export const useEmployeeStore = defineStore('employee', () => {
  // State
  const employees = ref<Employee[]>([]);
  const jobPostings = ref<JobPosting[]>([]);

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
   */
  function createEmployee(params: CreateEmployeeParams): Employee {
    const employee: Employee = {
      id: `emp_${Date.now()}`,
      name: params.name,
      position: params.position,
      level: params.level,
      skills: { ...params.skills },
      fatigue: 0,
      satisfaction: 70,
      salary: params.salary,
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
   * 处理员工离职
   */
  function processTurnover(): { left: Employee[]; message: string } {
    const left: Employee[] = [];

    employees.value.forEach(employee => {
      const risk = calculateTurnoverRisk(employee);
      if (Math.random() < risk) {
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
   * 模拟每日更新
   */
  function simulateDailyUpdate(): {
    fatigueIncreased: number;
    satisfactionChanged: number;
    turnover: Employee[];
  } {
    let fatigueIncreased = 0;
    let satisfactionChanged = 0;

    employees.value.forEach(employee => {
      // 分配了项目的员工增加疲劳
      if (employee.assignedProjectId) {
        const fatigueIncrease = employee.trait === 'hardworking' ? 12 : 10;
        employee.fatigue = Math.min(100, employee.fatigue + fatigueIncrease);
        fatigueIncreased++;

        // 增加经验
        employee.experience += 5;
      } else {
        // 未分配项目的员工满意度下降
        employee.satisfaction = Math.max(0, employee.satisfaction - 2);
        satisfactionChanged++;
      }

      // 薪资满意度
      const expectedSalary = EMPLOYEE_LEVEL_CONFIG[employee.level].baseSalary;
      if (employee.salary >= expectedSalary) {
        employee.satisfaction = Math.min(100, employee.satisfaction + 1);
      } else {
        employee.satisfaction = Math.max(0, employee.satisfaction - 1);
      }
    });

    // 处理离职
    const { left: turnover } = processTurnover();

    saveToLocal();
    return { fatigueIncreased, satisfactionChanged, turnover };
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
   * 获取项目团队效率
   */
  function getProjectTeamEfficiency(projectId: string): {
    planning: number;
    art: number;
    program: number;
    operation: number;
    overall: number;
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

    return {
      planning: byPosition.planning,
      art: byPosition.art,
      program: byPosition.program,
      operation: byPosition.operation,
      overall
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
          salary: 8000
        },
        {
          name: '王芳',
          position: 'art',
          level: 'mid',
          skills: { planning: 35, art: 70, program: 25, operation: 30 },
          specialty: 'character_design',
          trait: 'creative',
          salary: 8500
        },
        {
          name: '张伟',
          position: 'program',
          level: 'junior',
          skills: { planning: 25, art: 20, program: 55, operation: 30 },
          specialty: 'frontend',
          trait: 'efficient',
          salary: 6000
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
      jobPostings: jobPostings.value
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

    // Getters
    totalEmployees,
    employeesByPosition,
    availableEmployees,
    assignedEmployees,
    highRiskEmployees,
    totalSalary,
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
    loadFromLocal
  };
});
