/**
 * 图片管理工具
 * 管理默认图片资源，支持按类型、风格获取图片
 * 预留 AI 图片生成接口
 */

import type { ArtStyle } from '@/stores/gameStore';

export type ImageType = 'avatar' | 'cg' | 'scene';

export interface ImageResource {
  id: string;
  type: ImageType;
  style: ArtStyle;
  url: string;
  description?: string;
}

const DEFAULT_AVATARS: Record<ArtStyle, string[]> = {
  japanese: [
    'https://picsum.photos/seed/jp1/400/400',
    'https://picsum.photos/seed/jp2/400/400',
    'https://picsum.photos/seed/jp3/400/400',
    'https://picsum.photos/seed/jp4/400/400',
    'https://picsum.photos/seed/jp5/400/400',
  ],
  korean: [
    'https://picsum.photos/seed/kr1/400/400',
    'https://picsum.photos/seed/kr2/400/400',
    'https://picsum.photos/seed/kr3/400/400',
    'https://picsum.photos/seed/kr4/400/400',
    'https://picsum.photos/seed/kr5/400/400',
  ],
  chinese: [
    'https://picsum.photos/seed/cn1/400/400',
    'https://picsum.photos/seed/cn2/400/400',
    'https://picsum.photos/seed/cn3/400/400',
    'https://picsum.photos/seed/cn4/400/400',
    'https://picsum.photos/seed/cn5/400/400',
  ],
  realistic: [
    'https://picsum.photos/seed/rs1/400/400',
    'https://picsum.photos/seed/rs2/400/400',
    'https://picsum.photos/seed/rs3/400/400',
    'https://picsum.photos/seed/rs4/400/400',
    'https://picsum.photos/seed/rs5/400/400',
  ],
  chibi: [
    'https://picsum.photos/seed/cb1/400/400',
    'https://picsum.photos/seed/cb2/400/400',
    'https://picsum.photos/seed/cb3/400/400',
    'https://picsum.photos/seed/cb4/400/400',
    'https://picsum.photos/seed/cb5/400/400',
  ]
};

const DEFAULT_CGS: string[] = [
  'https://picsum.photos/seed/cg1/800/600',
  'https://picsum.photos/seed/cg2/800/600',
  'https://picsum.photos/seed/cg3/800/600',
  'https://picsum.photos/seed/cg4/800/600',
  'https://picsum.photos/seed/cg5/800/600',
  'https://picsum.photos/seed/cg6/800/600',
  'https://picsum.photos/seed/cg7/800/600',
  'https://picsum.photos/seed/cg8/800/600',
];

const DEFAULT_SCENES: string[] = [
  'https://picsum.photos/seed/scene1/800/450',
  'https://picsum.photos/seed/scene2/800/450',
  'https://picsum.photos/seed/scene3/800/450',
  'https://picsum.photos/seed/scene4/800/450',
  'https://picsum.photos/seed/scene5/800/450',
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getDefaultAvatar(style?: ArtStyle): string {
  const targetStyle = style || 'japanese';
  const avatars = DEFAULT_AVATARS[targetStyle] || DEFAULT_AVATARS.japanese;
  return getRandomItem(avatars);
}

export function getDefaultCG(): string {
  return getRandomItem(DEFAULT_CGS);
}

export function getDefaultScene(): string {
  return getRandomItem(DEFAULT_SCENES);
}

export function getAllAvatars(style?: ArtStyle): string[] {
  if (style) {
    return DEFAULT_AVATARS[style] || DEFAULT_AVATARS.japanese;
  }
  return Object.values(DEFAULT_AVATARS).flat();
}

export function getAllCGs(): string[] {
  return [...DEFAULT_CGS];
}

export function getAllScenes(): string[] {
  return [...DEFAULT_SCENES];
}

export function getImageCount(): { avatars: number; cgs: number; scenes: number } {
  return {
    avatars: Object.values(DEFAULT_AVATARS).flat().length,
    cgs: DEFAULT_CGS.length,
    scenes: DEFAULT_SCENES.length
  };
}

export async function generateImageWithAI(
  prompt: string, 
  type: ImageType,
  style?: ArtStyle
): Promise<string> {
  console.log(`[ImageManager] AI 图片生成请求:`, { prompt, type, style });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  switch (type) {
    case 'avatar':
      return getDefaultAvatar(style);
    case 'cg':
      return getDefaultCG();
    case 'scene':
      return getDefaultScene();
    default:
      return getDefaultAvatar(style);
  }
}

export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load: ${url}`));
        img.src = url;
      });
    })
  );
}

export const ImageManager = {
  getDefaultAvatar,
  getDefaultCG,
  getDefaultScene,
  getAllAvatars,
  getAllCGs,
  getAllScenes,
  getImageCount,
  generateImageWithAI,
  preloadImages
};

export default ImageManager;
