import type { CSSProperties } from 'react';

export interface ColorPreset {
  id: string;
  name: string;
  bgLight: string;
  borderLight: string;
  textLight: string;
  bgDark: string;
  borderDark: string;
  textDark: string;
  previewHex: string;
}

export const CARD_COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'default',
    name: 'اصلی تم',
    bgLight: 'bg-white/90 backdrop-blur-md',
    borderLight: 'border-slate-200/80',
    textLight: 'text-slate-800',
    bgDark: 'bg-[#143242]/90 backdrop-blur-md',
    borderDark: 'border-slate-700/80',
    textDark: 'text-white',
    previewHex: '#6366f1',
  },
  {
    id: 'blue',
    name: 'آبی شیشه‌ای',
    bgLight: 'bg-blue-50/80 backdrop-blur-md',
    borderLight: 'border-blue-200/90',
    textLight: 'text-blue-900',
    bgDark: 'bg-blue-950/40 backdrop-blur-md',
    borderDark: 'border-blue-500/30',
    textDark: 'text-blue-100',
    previewHex: '#3b82f6',
  },
  {
    id: 'emerald',
    name: 'زمردی شیشه‌ای',
    bgLight: 'bg-emerald-50/80 backdrop-blur-md',
    borderLight: 'border-emerald-200/90',
    textLight: 'text-emerald-900',
    bgDark: 'bg-emerald-950/40 backdrop-blur-md',
    borderDark: 'border-emerald-500/30',
    textDark: 'text-emerald-100',
    previewHex: '#10b981',
  },
  {
    id: 'amber',
    name: 'کهربایی شیشه‌ای',
    bgLight: 'bg-amber-50/80 backdrop-blur-md',
    borderLight: 'border-amber-200/90',
    textLight: 'text-amber-900',
    bgDark: 'bg-amber-950/40 backdrop-blur-md',
    borderDark: 'border-amber-500/30',
    textDark: 'text-amber-100',
    previewHex: '#f59e0b',
  },
  {
    id: 'rose',
    name: 'سرخ شیشه‌ای',
    bgLight: 'bg-rose-50/80 backdrop-blur-md',
    borderLight: 'border-rose-200/90',
    textLight: 'text-rose-900',
    bgDark: 'bg-rose-950/40 backdrop-blur-md',
    borderDark: 'border-rose-500/30',
    textDark: 'text-rose-100',
    previewHex: '#f43f5e',
  },
  {
    id: 'purple',
    name: 'بنفش شیشه‌ای',
    bgLight: 'bg-purple-50/80 backdrop-blur-md',
    borderLight: 'border-purple-200/90',
    textLight: 'text-purple-900',
    bgDark: 'bg-purple-950/40 backdrop-blur-md',
    borderDark: 'border-purple-500/30',
    textDark: 'text-purple-100',
    previewHex: '#a855f7',
  },
  {
    id: 'teal',
    name: 'فیروزه‌ای شیشه‌ای',
    bgLight: 'bg-teal-50/80 backdrop-blur-md',
    borderLight: 'border-teal-200/90',
    textLight: 'text-teal-900',
    bgDark: 'bg-teal-950/40 backdrop-blur-md',
    borderDark: 'border-teal-500/30',
    textDark: 'text-teal-100',
    previewHex: '#14b8a6',
  },
  {
    id: 'sky',
    name: 'آسمانی شیشه‌ای',
    bgLight: 'bg-sky-50/80 backdrop-blur-md',
    borderLight: 'border-sky-200/90',
    textLight: 'text-sky-900',
    bgDark: 'bg-sky-950/40 backdrop-blur-md',
    borderDark: 'border-sky-500/30',
    textDark: 'text-sky-100',
    previewHex: '#0ea5e9',
  },
  {
    id: 'slate',
    name: 'دودی شیشه‌ای',
    bgLight: 'bg-slate-100/80 backdrop-blur-md',
    borderLight: 'border-slate-300',
    textLight: 'text-slate-900',
    bgDark: 'bg-slate-800/50 backdrop-blur-md',
    borderDark: 'border-slate-600/40',
    textDark: 'text-slate-100',
    previewHex: '#64748b',
  },
];

function hexToRgba(hex: string, alpha: number): string {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((char) => char + char)
      .join('');
  }
  if (cleanHex.length !== 6) {
    return `rgba(99, 102, 241, ${alpha})`;
  }
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getCardColorClasses(colorValue: string | undefined, isDarkMode: boolean) {
  if (!colorValue || colorValue === 'default') {
    return isDarkMode
      ? 'bg-[#143242]/90 backdrop-blur-md border-slate-700/80 text-white'
      : 'bg-white/90 backdrop-blur-md border-slate-200/80 text-slate-800';
  }

  const preset = CARD_COLOR_PRESETS.find((p) => p.id === colorValue);
  if (preset) {
    return isDarkMode
      ? `${preset.bgDark} ${preset.borderDark} ${preset.textDark}`
      : `${preset.bgLight} ${preset.borderLight} ${preset.textLight}`;
  }

  return '';
}

export function getCardColorStyle(colorValue: string | undefined, isDarkMode: boolean): CSSProperties {
  if (!colorValue || colorValue === 'default' || CARD_COLOR_PRESETS.some((p) => p.id === colorValue)) {
    return {};
  }

  // Convert custom hex to frosted glass effect matching theme
  if (isDarkMode) {
    return {
      backgroundColor: hexToRgba(colorValue, 0.22),
      borderColor: hexToRgba(colorValue, 0.45),
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: '#ffffff',
    };
  }

  return {
    backgroundColor: hexToRgba(colorValue, 0.12),
    borderColor: hexToRgba(colorValue, 0.35),
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  };
}
