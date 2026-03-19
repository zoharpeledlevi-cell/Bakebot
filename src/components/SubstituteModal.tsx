import * as Dialog from '@radix-ui/react-dialog';
import { X, ThumbsDown, Leaf, Heart, ShoppingBag, Zap, Sparkles, ChefHat } from 'lucide-react';
import type { SubstituteOption } from '../types/recipe';
import type { TranslationKey } from '../i18n/translations';
import { useLang } from '../contexts/LanguageContext';

interface Props {
  isOpen: boolean;
  ingredientName: string;
  /** Full unfiltered list — modal filters by rejectedIndices internally */
  substitutes: SubstituteOption[];
  chefNote: string;
  rejectedIndices: Set<number>;
  isLoading: boolean;
  onClose: () => void;
  /** Called with the ORIGINAL index in `substitutes` */
  onReject: (originalIndex: number) => void;
}

const CATEGORY_CONFIG: Record<
  SubstituteOption['category'],
  { labelKey: TranslationKey; icon: React.ElementType; color: string }
> = {
  perfect:   { labelKey: 'catPerfect',   icon: Zap,         color: 'text-amber-600 bg-amber-50 border-amber-200' },
  vegan:     { labelKey: 'catVegan',     icon: Leaf,        color: 'text-green-600 bg-green-50 border-green-200' },
  healthier: { labelKey: 'catHealthier', icon: Heart,       color: 'text-rose-500 bg-rose-50 border-rose-200' },
  pantry:    { labelKey: 'catPantry',    icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 border-blue-200' },
};

/** Render **bold** markdown in chef note text */
function renderChefNote(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-amber-700">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function SubstituteModal({
  isOpen, ingredientName, substitutes, chefNote, rejectedIndices,
  isLoading, onClose, onReject,
}: Props) {
  const { t } = useLang();
  const visibleCount = substitutes.filter((_, i) => !rejectedIndices.has(i)).length;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed end-0 top-0 bottom-0 z-50 bg-white w-full max-w-sm shadow-2xl overflow-y-auto flex flex-col">

          {/* ── Header ── */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div>
              <Dialog.Title className="font-bold text-gray-800">{t('substitutesFor')}</Dialog.Title>
              <p className="text-amber-600 font-semibold capitalize">{ingredientName}</p>
            </div>
            <Dialog.Close onClick={onClose} className="text-gray-400 hover:text-gray-600 transition rounded-lg p-1">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 p-5 space-y-4">

            {/* Loading sparkle */}
            {isLoading && (
              <div className="flex flex-col items-center gap-4 py-16">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-14 h-14 rounded-full border-2 border-amber-200 border-t-amber-500 animate-spin" />
                  <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700">{t('analyzingRecipe')}</p>
                  <p className="text-xs text-gray-400 mt-1">{t('findingBest')}</p>
                </div>
              </div>
            )}

            {/* Chef's Analysis — shown after loading */}
            {!isLoading && chefNote && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ChefHat className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">{t('chefsAnalysis')}</span>
                </div>
                <p className="text-sm text-amber-900 leading-relaxed">
                  {renderChefNote(chefNote)}
                </p>
              </div>
            )}

            {/* Empty state — all rejected */}
            {!isLoading && visibleCount === 0 && substitutes.length > 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">{t('allRejected')}</p>
                <p className="text-gray-400 text-xs mt-1">{t('trySearching')}</p>
              </div>
            )}

            {/* Substitute cards — filtered by original index */}
            {!isLoading && substitutes.map((sub, originalIndex) => {
              if (rejectedIndices.has(originalIndex)) return null;
              const config = CATEGORY_CONFIG[sub.category];
              const Icon = config.icon;
              return (
                <div
                  key={originalIndex}
                  className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 shadow-soft"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${config.color}`}
                    >
                      <Icon className="w-3 h-3" />
                      {t(config.labelKey)}
                    </span>
                    <button
                      onClick={() => onReject(originalIndex)}
                      className="text-gray-300 hover:text-red-400 transition"
                      title="Reject this suggestion"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="font-bold text-gray-800">{sub.name}</p>

                  {sub.ratio && sub.ratio !== '—' && sub.ratio !== '-' && (
                    <div className="bg-gray-50 rounded-xl px-3 py-2">
                      <span className="text-xs text-gray-500 font-medium">{t('ratio')}: </span>
                      <span className="text-xs text-gray-700 font-semibold">{sub.ratio}</span>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 leading-relaxed">{sub.effect}</p>
                </div>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
