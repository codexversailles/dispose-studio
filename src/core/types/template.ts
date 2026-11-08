export type AspectRatio = '9:16' | '4:5' | '1:1';

export type FrameStyle = 'photo' | 'empty-bordered' | 'hidden';

export interface SlotState {
  id: string;
  imageUrl?: string | null;
  scale: number; // 1.0 to 4.0
  x: number; // pan x in percentage (-100 to 100)
  y: number; // pan y in percentage (-100 to 100)
  frameStyle: FrameStyle;
  hasBorder: boolean;
  borderWidth?: number; // in pixels
  borderColor?: string;
  borderRadius?: number;
  label?: string; // day number (e.g., '1', '2'...)
  aspectRatio?: '1:1' | '4:5' | '16:9' | 'custom';
}

export interface TextPosition {
  x?: number; // Canva-style absolute canvas X (0 to 360)
  y?: number; // Canva-style absolute canvas Y (0 to 640)
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  transform?: string;
}

export type AvailableFontFamily =
  | 'Arial Light'
  | 'Arial'
  | 'Ralphi Sans'
  | 'Helvetica Neue'
  | 'Instagram Sans'
  | 'SF Pro Display'
  | 'Inter'
  | 'JetBrains Mono';

export interface TextLayerState {
  id: string;
  content: string;
  fontFamily: AvailableFontFamily;
  fontSize: number; // in px on 360x640 canvas
  fontWeight: number | string;
  color: string;
  align: 'left' | 'center' | 'right';
  letterSpacing: number; // in px
  lineHeight?: number;
  italic?: boolean;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  shadow?: {
    enabled: boolean;
    blur: number;
    color: string;
    offsetX: number;
    offsetY: number;
  };
  position: TextPosition;
  maxWidth?: string | number;
  width?: number;
  height?: number;
}

export interface BackgroundConfig {
  imageUrl?: string;
  scale: number; // 1.0 to 3.0
  position: { x: number; y: number }; // pan offsets
  dimOpacity: number; // 0.0 to 0.9 overlay
  grainOpacity: number; // 0.0 to 0.4 film grain
  blur: number; // 0 to 20px
  fallbackColor: string;
}

export interface GridConfig {
  columns: number;
  rows: number;
  gap: number; // in px
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  padding: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  // Canva-style draggable position for the entire grid
  x?: number; // canvas X center or offset
  y?: number; // canvas Y center or offset
}

export interface CalendarConfig {
  enabled: boolean;
  year: number;
  month: number; // 1 to 12
  monthName: string;
  startDay: 'sun' | 'mon';
  rowCount: 5 | 6;
  showWeekdayHeader: boolean;
  showDateNumbers: boolean; // Toggle button to show numbers on the date
  weekdays: string[];
  // Weekday Header Typography
  weekdayFontFamily?: AvailableFontFamily;
  weekdayFontWeight?: number;
  weekdayFontSize?: number;
  weekdayColor?: string;
  weekdayLetterSpacing?: number;
  weekdayTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  weekdayItalic?: boolean;
}

export interface SnapGuide {
  type: 'x-center' | 'y-center';
  position: number; // 180 for x-center, 320 for y-center
}

export interface TemplateSchema {
  id: string;
  name: string;
  description: string;
  category: 'calendar' | 'editorial' | 'film' | 'collage';
  aspectRatio: AspectRatio;
  canvasWidth: number; // 360
  canvasHeight: number; // 640
  defaultBackground: BackgroundConfig;
  gridConfig: GridConfig;
  defaultSlots: SlotState[];
  textLayers: Record<string, TextLayerState>;
  calendarConfig?: CalendarConfig;
  tags?: string[];
  thumbnailUrl?: string;
}
