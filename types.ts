
export type TextStyle = 'clean' | 'impact' | 'comic' | 'gradient';
export type AspectRatio = '16:9' | '9:16';
export type BrandingPosition = 'left' | 'right';

export interface ThumbnailState {
  title: string;
  subtitle: string;
  backgroundImage: string | null;
  textStyle: TextStyle;
  aspectRatio: AspectRatio;
  primaryColor: string;
  secondaryColor: string;
  showOverlay: boolean;
  overlayOpacity: number;
  // Branding features
  brandingImage1: string | null;
  brandingImage2: string | null;
  brandingPosition2: BrandingPosition;
  brandingScale: number;
}

export interface SuggestionResponse {
  viralTitles: string[];
  designTips: string[];
}
