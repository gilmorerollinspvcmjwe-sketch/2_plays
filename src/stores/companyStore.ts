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

export interface Company {
  name: string;
  logo: {
    emoji: string;
    text: string;
  };
  foundedAt: string;
  team: TeamMember[];
  reputation: number;
}

export const useCompanyStore = defineStore('company', () => {
  // State
  const company = ref<Company | null>(null);
  const isFirstVisit = ref(true);
  
  // Getters
  const hasCompany = computed(() => company.value !== null);
  
  const teamSize = computed(() => {
    return company.value?.team.length || 0;
  });
  
  // Actions
  
  /**
   * 创建公司
   */
  function createCompany(name: string, logoEmoji: string, logoText: string): Company {
    const newCompany: Company = {
      name,
      logo: {
        emoji: logoEmoji,
        text: logoText
      },
      foundedAt: new Date().toISOString(),
      team: generateDefaultTeam(),
      reputation: 50
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
   */
  function increaseReputation(amount: number): void {
    if (!company.value) return;
    
    company.value.reputation = Math.min(100, company.value.reputation + amount);
    saveToLocal();
  }
  
  /**
   * 完成新手引导
   */
  function completeOnboarding(): void {
    isFirstVisit.value = false;
    localStorage.setItem('onboarding_completed', 'true');
  }
  
  /**
   * 检查是否完成新手引导
   */
  function checkOnboardingStatus(): void {
    const completed = localStorage.getItem('onboarding_completed');
    if (completed) {
      isFirstVisit.value = false;
    }
  }
  
  /**
   * 保存到本地存储
   */
  function saveToLocal(): void {
    if (company.value) {
      localStorage.setItem('company_data', JSON.stringify(company.value));
    }
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
    checkOnboardingStatus();
  }
  
  // 初始化时加载数据
  loadFromLocal();
  
  return {
    // State
    company,
    isFirstVisit,
    
    // Getters
    hasCompany,
    teamSize,
    
    // Actions
    createCompany,
    addTeamMember,
    upgradeMember,
    increaseReputation,
    completeOnboarding,
    checkOnboardingStatus,
    saveToLocal,
    loadFromLocal
  };
});
