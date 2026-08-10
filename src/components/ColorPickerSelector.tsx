import React from 'react';
import { CARD_COLOR_PRESETS } from '../utils/cardColors';
import { Palette, Check } from 'lucide-react';

interface ColorPickerSelectorProps {
  selectedColor: string | undefined;
  onChangeColor: (color: string) => void;
  label?: string;
  isDarkMode?: boolean;
}

export const ColorPickerSelector: React.FC<ColorPickerSelectorProps> = ({
  selectedColor = 'default',
  onChangeColor,
  label = 'رنگ کارت درس (مات و شیشه‌ای):',
  isDarkMode = false,
}) => {
  const isCustomHex =
    selectedColor &&
    selectedColor !== 'default' &&
    !CARD_COLOR_PRESETS.some((p) => p.id === selectedColor);

  return (
    <div className="space-y-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
      <div className="flex items-center justify-between">
        <label className="font-bold text-xs flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
          <Palette className="w-3.5 h-3.5 text-indigo-500 dark:text-teal-400" />
          <span>{label}</span>
        </label>
        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-normal">
          {CARD_COLOR_PRESETS.find((p) => p.id === selectedColor)?.name || (isCustomHex ? 'سفارشی' : 'اصلی تم')}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap pt-0.5">
        {CARD_COLOR_PRESETS.map((preset) => {
          const isSelected = selectedColor === preset.id || (!selectedColor && preset.id === 'default');

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChangeColor(preset.id)}
              title={preset.name}
              className={`relative w-6 h-6 rounded-full transition-all flex items-center justify-center cursor-pointer border-2 shadow-2xs ${
                isSelected
                  ? 'scale-110 border-indigo-600 dark:border-teal-400 ring-2 ring-indigo-300 dark:ring-teal-500/50'
                  : 'border-slate-300/80 dark:border-slate-600 hover:scale-105 opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: preset.previewHex }}
            >
              {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-md stroke-[3]" />}
            </button>
          );
        })}

        {/* Custom Hex Color Picker */}
        <label
          title="رنگ دلخواه (سفارشی)"
          className={`relative w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer overflow-hidden shadow-2xs ${
            isCustomHex
              ? 'scale-110 border-indigo-600 dark:border-teal-400 ring-2 ring-indigo-300 dark:ring-teal-500/50'
              : 'border-slate-300/80 dark:border-slate-600 hover:scale-105 opacity-80 hover:opacity-100'
          }`}
          style={{
            backgroundColor: isCustomHex ? selectedColor : 'transparent',
            backgroundImage: !isCustomHex
              ? 'conic-gradient(from 0deg, #f43f5e, #f59e0b, #10b981, #0ea5e9, #a855f7, #f43f5e)'
              : undefined,
          }}
        >
          <input
            type="color"
            value={isCustomHex ? selectedColor : '#6366f1'}
            onChange={(e) => onChangeColor(e.target.value)}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          />
          {isCustomHex && <Check className="w-3.5 h-3.5 text-white drop-shadow-md stroke-[3]" />}
        </label>
      </div>
    </div>
  );
};
