/**
 * 事件总线 - 用于解耦 Store 之间的通信
 * 避免循环依赖问题
 */

type EventCallback = (data: any) => void;

class EventBus {
  private events: Map<string, Set<EventCallback>> = new Map();

  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  emit(event: string, data?: any): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`EventBus error on ${event}:`, error);
        }
      });
    }
  }

  once(event: string, callback: EventCallback): void {
    const wrapper = (data: any) => {
      callback(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  clear(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

export const eventBus = new EventBus();

export const Events = {
  // 积分相关
  POINTS_EARN: 'points:earn',
  POINTS_SPEND: 'points:spend',
  POINTS_CHECKIN: 'points:checkin',
  
  // 游戏相关
  GAME_UPDATE: 'game:update',
  GAME_CREATE: 'game:create',
  GAME_DELETE: 'game:delete',
  GAME_PUBLISH: 'game:publish',
  
  // 角色相关
  CHARACTER_CREATE: 'character:create',
  CHARACTER_UPDATE: 'character:update',
  CHARACTER_INTIMACY_UPDATE: 'character:intimacy:update',
  CHARACTER_FROM_COMMENT: 'character:from:comment',
  
  // 剧情相关
  PLOT_CREATE: 'plot:create',
  PLOT_UPDATE: 'plot:update',
  
  // 评论相关
  COMMENT_GENERATE: 'comment:generate',
  COMMENT_UPDATE: 'comment:update',
  
  // 成就相关
  ACHIEVEMENT_UNLOCK: 'achievement:unlock',
  
  // 运营相关
  OPERATION_EVENT: 'operation:event',
  OPERATION_INCIDENT: 'operation:incident',
};
