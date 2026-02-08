
export type AspectRatio = '16:9' | '9:16';
export type BrandingPosition = 'left' | 'right';

export interface ThumbnailState {
  topic: string;
  backgroundImage: string | null;
  textStyle: 'impact'; // Fixed to classic
  aspectRatio: AspectRatio;
  primaryColor: string;
  secondaryColor: string;
  // Branding/Face-swap features
  brandingImage1: string | null;
  brandingImage2: string | null;
  brandingPosition2: BrandingPosition;
  brandingScale: number;
}

export interface SuggestionResponse {
  viralTitles: string[];
  designTips: string[];
}
