/**
 * 公司数据管理 Store
 * 管理公司信息、团队配置
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface TeamMember {
  id: string;
  name: string;
  role: '策划' | '美术' | '程序' | '运营';
  avatar: string;
  level: number;
  skills: string[];
}

export interface FundsHistoryRecord {
  date: string;
  amount: number;
  reason: string;
  type: 'income' | 'expense';
}

export interface Company {
  name: string;
  logo: {
    emoji: string;
    text: string;
  };
  foundedAt: string;
  team: TeamMember[];
  reputation: number;
  funds: number;
  fundsHistory: FundsHistoryRecord[];
}

export const useCompanyStore = defineStore('company', () => {
  // State
  const company = ref<Company | null>(null);
  const isFirstVisit = ref(true);
  const funds = ref<number>(500000);
  const fundsHistory = ref<FundsHistoryRecord[]>([]);

  // Getters
  const hasCompany = computed(() => company.value !== null);

  const teamSize = computed(() => {
    return company.value?.team.length || 0;
  });

  const fundsStatus = computed(() => {
    if (funds.value > 300000) return 'sufficient';
    if (funds.value >= 100000) return 'tight';
    return 'depleted';
  });
  
  // Actions
  
  /**
   * 创建公司
   */
  function createCompany(name: string, logoEmoji: string, logoText: string): Company {
    funds.value = 500000;
    fundsHistory.value = [];

    const newCompany: Company = {
      name,
      logo: {
        emoji: logoEmoji,
        text: logoText
      },
      foundedAt: new Date().toISOString(),
      team: generateDefaultTeam(),
      reputation: 50,
      funds: funds.value,
      fundsHistory: fundsHistory.value
    };

    company.value = newCompany;
    isFirstVisit.value = false;
    saveToLocal();

    return newCompany;
  }
  
  /**
   * 生成默认团队
   */
  function generateDefaultTeam(): TeamMember[] {
    const defaultMembers: TeamMember[] = [
      {
        id: 'member_1',
        name: '小明',
        role: '策划',
        avatar: '👨‍💼',
        level: 1,
        skills: ['剧情设计', '活动策划']
      },
      {
        id: 'member_2',
        name: '小红',
        role: '美术',
        avatar: '👩‍🎨',
        level: 1,
        skills: ['角色设计', '场景绘制']
      },
      {
        id: 'member_3',
        name: '小华',
        role: '程序',
        avatar: '👨‍💻',
        level: 1,
        skills: ['前端开发', 'Bug修复']
      }
    ];
    
    return defaultMembers;
  }
  
  /**
   * 添加团队成员
   */
  function addTeamMember(name: string, role: TeamMember['role']): TeamMember | null {
    if (!company.value) return null;
    
    const avatars: Record<TeamMember['role'], string> = {
      '策划': '👨‍💼',
      '美术': '👩‍🎨',
      '程序': '👨‍💻',
      '运营': '👩‍💼'
    };
    
    const skills: Record<TeamMember['role'], string[]> = {
      '策划': ['剧情设计', '活动策划'],
      '美术': ['角色设计', '场景绘制'],
      '程序': ['前端开发', 'Bug修复'],
      '运营': ['社区管理', '数据分析']
    };
    
    const member: TeamMember = {
      id: `member_${Date.now()}`,
      name,
      role,
      avatar: avatars[role],
      level: 1,
      skills: skills[role]
    };
    
    company.value.team.push(member);
    saveToLocal();
    
    return member;
  }
  
  /**
   * 升级团队成员
   * @deprecated 此方法暂未在前端使用，待后续功能接入
   */
  function upgradeMember(memberId: string): boolean {
    if (!company.value) return false;
    
    const member = company.value.team.find(m => m.id === memberId);
    if (!member) return false;
    
    member.level += 1;
    saveToLocal();
    
    return true;
  }
  
  /**
   * 提升公司声誉
   * @deprecated 此方法暂未在前端使用，待后续功能接入
   */
  function increaseReputation(amount: number): void {
    if (!company.value) return;
    
    company.value.reputation = Math.min(100, company.value.reputation + amount);
    saveToLocal();
  }
  
  /**
   * 完成新手引导
   * @deprecated 此方法暂未在前端使用，待后续功能接入
   */
  function completeOnboarding(): void {
    isFirstVisit.value = false;
    localStorage.setItem('onboarding_completed', 'true');
  }
  
  /**
   * 检查是否完成新手引导
   * @deprecated 此方法暂未在前端使用，待后续功能接入
   */
  function checkOnboardingStatus(): void {
    const completed = localStorage.getItem('onboarding_completed');
    if (completed) {
      isFirstVisit.value = false;
    }
  }
  
  /**
   * 添加资金
   */
  function addFunds(amount: number, reason: string): void {
    funds.value += amount;
    const record: FundsHistoryRecord = {
      date: new Date().toISOString(),
      amount,
      reason,
      type: 'income'
    };
    fundsHistory.value.push(record);

    if (company.value) {
      company.value.funds = funds.value;
      company.value.fundsHistory = fundsHistory.value;
    }
    saveToLocal();
  }

  /**
   * 花费资金
   */
  function spendFunds(amount: number, reason: string): boolean {
    if (funds.value < amount) return false;

    funds.value -= amount;
    const record: FundsHistoryRecord = {
      date: new Date().toISOString(),
      amount,
      reason,
      type: 'expense'
    };
    fundsHistory.value.push(record);

    if (company.value) {
      company.value.funds = funds.value;
      company.value.fundsHistory = fundsHistory.value;
    }
    saveToLocal();
    return true;
  }

  /**
   * 检查资金是否足够
   */
  function canSpend(amount: number): boolean {
    return funds.value >= amount;
  }

  /**
   * 保存到本地存储
   */
  function saveToLocal(): void {
    if (company.value) {
      localStorage.setItem('company_data', JSON.stringify(company.value));
    }
    localStorage.setItem('company_funds', JSON.stringify(funds.value));
    localStorage.setItem('company_funds_history', JSON.stringify(fundsHistory.value));
  }

  /**
   * 从本地存储加载
   */
  function loadFromLocal(): void {
    const saved = localStorage.getItem('company_data');
    if (saved) {
      try {
        company.value = JSON.parse(saved);
      } catch (e) {
        console.error('加载公司数据失败:', e);
      }
    }

    const savedFunds = localStorage.getItem('company_funds');
    if (savedFunds) {
      try {
        funds.value = JSON.parse(savedFunds);
      } catch (e) {
        console.error('加载资金数据失败:', e);
      }
    }

    const savedFundsHistory = localStorage.getItem('company_funds_history');
    if (savedFundsHistory) {
      try {
        fundsHistory.value = JSON.parse(savedFundsHistory);
      } catch (e) {
        console.error('加载资金历史失败:', e);
      }
    }

    checkOnboardingStatus();
  }
  
  // 初始化时加载数据
  loadFromLocal();
  
  return {
    // State
    company,
    isFirstVisit,
    funds,
    fundsHistory,

    // Getters
    hasCompany,
    teamSize,
    fundsStatus,

    // Actions
    createCompany,
    addTeamMember,
    upgradeMember,
    increaseReputation,
    completeOnboarding,
    checkOnboardingStatus,
    addFunds,
    spendFunds,
    canSpend,
    saveToLocal,
    loadFromLocal
  };
});
