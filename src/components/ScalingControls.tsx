import { RotateCcw } from 'lucide-react';
import type { ScalePreset } from '../hooks/useScaling';
import { useLang } from '../contexts/LanguageContext';

interface Props {
  currentFactor: number;
  onScale: (factor: ScalePreset) => void;
  onReset: () => void;
}

const FRACTIONS: ScalePreset[] = ['1/4', '1/3', '1/2', '2/3', '3/4'];
const MULTIPLIERS: ScalePreset[] = [2, 3, 4, 5];

function factorLabel(f: ScalePreset): string {
  return typeof f === 'string' ? f : `×${f}`;
}

function factorDecimal(f: ScalePreset): number {
  if (typeof f === 'number') return f;
  const [n, d] = f.split('/').map(Number);
  return n / d;
}

export function ScalingControls({ currentFactor, onScale, onReset }: Props) {
  const { t } = useLang();
  const isActive = (f: ScalePreset) => Math.abs(factorDecimal(f) - currentFactor) < 0.001;

  return (
    <div className="bg-white rounded-2xl shadow-soft p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800">{t('scaleRecipe')}</h3>
        {currentFactor !== 1 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-amber-500 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('resetScale')}
          </button>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('fractions')}</p>
        <div className="flex gap-2 flex-wrap">
          {FRACTIONS.map((f) => (
            <button
              key={String(f)}
              onClick={() => onScale(f)}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive(f)
                  ? 'bg-amber-500 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600'
              }`}
            >
              {factorLabel(f)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('multipliers')}</p>
        <div className="flex gap-2 flex-wrap">
          {MULTIPLIERS.map((f) => (
            <button
              key={String(f)}
              onClick={() => onScale(f)}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive(f)
                  ? 'bg-amber-500 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600'
              }`}
            >
              {factorLabel(f)}
            </button>
          ))}
        </div>
      </div>

      {currentFactor !== 1 && (
        <div className="bg-amber-50 rounded-xl px-4 py-2 text-center">
          <span className="text-amber-700 font-bold text-sm">
            {t('scaledTo')}{' '}
            {currentFactor < 1
              ? `${Math.round(currentFactor * 100)}%`
              : `×${parseFloat(currentFactor.toFixed(2))}`}{' '}
            {t('ofOriginal')}
          </span>
        </div>
      )}
    </div>
  );
}
