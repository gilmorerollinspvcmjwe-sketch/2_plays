/**
 * 静态数据加载器
 * 用于加载配置数据和模板数据
 */

export class DataLoader {
  private static cache: Record<string, any> = {};

  /**
   * 加载 JSON 数据
   * @param path 相对于 src/data 的路径（不含扩展名）
   */
  static async load<T>(path: string): Promise<T> {
    // 检查缓存
    if (this.cache[path]) {
      return this.cache[path];
    }

    try {
      // 动态导入 JSON 文件
      const module = await import(`@/data/${path}.json`);
      this.cache[path] = module.default;
      return module.default;
    } catch (error) {
      console.error(`Failed to load data: ${path}`, error);
      throw new Error(`数据加载失败：${path}`);
    }
  }

  /**
   * 获取配置
   * @param name 配置文件名（不含扩展名）
   */
  static async getConfig<T>(name: string): Promise<T> {
    return this.load<T>(`config/${name}`);
  }

  /**
   * 获取特定配置项
   * @param name 配置文件名
   * @param key 配置项键名
   */
  static async getConfigItem<T>(name: string, key: string): Promise<T> {
    const config = await this.getConfig<any>(name);
    return config[key];
  }

  /**
   * 获取模板（用于 TypeScript 模板文件）
   * @param type 模板类型
   */
  static async getTemplate<T>(type: string): Promise<T> {
    try {
      const module = await import(`@/data/templates/${type}/index.ts`);
      return module;
    } catch (error) {
      console.error(`Failed to load template: ${type}`, error);
      throw new Error(`模板加载失败：${type}`);
    }
  }

  /**
   * 清除缓存
   */
  static clearCache(): void {
    this.cache = {};
  }

  /**
   * 清除特定缓存
   */
  static clearCacheItem(path: string): void {
    delete this.cache[path];
  }
}
