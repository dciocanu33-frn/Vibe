
export type AspectRatio = '16:9' | '9:16';
export type BrandingPosition = 'left' | 'right';
export type AppView = 'thumbnail' | 'video';

export interface ThumbnailState {
  topic: string;
  backgroundImage: string | null;
  textStyle: 'impact';
  aspectRatio: AspectRatio;
  primaryColor: string;
  secondaryColor: string;
  brandingImage1: string | null;
  brandingImage2: string | null;
  brandingPosition2: BrandingPosition;
  brandingScale: number;
}

export interface VideoState {
  prompt: string;
  startImage: string | null;
  endImage: string | null;
  aspectRatio: AspectRatio;
  resolution: '720p' | '1080p';
  videoUrl: string | null;
  status: 'idle' | 'generating' | 'polling' | 'fetching' | 'error';
  progressMessage: string;
}

export interface SuggestionResponse {
  viralTitles: string[];
  designTips: string[];
}
