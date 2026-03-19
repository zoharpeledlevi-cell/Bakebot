import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Target, X } from 'lucide-react';
import type { Ingredient } from '../types/recipe';
import { displayUnit } from '../utils/unitConverter';
import { useLang } from '../contexts/LanguageContext';

interface Props {
  ingredients: Ingredient[];
  onScale: (id: string, qty: number) => void;
}

export function ScaleByIngredient({ ingredients, onScale }: Props) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [inputQty, setInputQty] = useState('');

  const selected = ingredients.find((i) => i.id === selectedId);

  const handleApply = () => {
    const qty = parseFloat(inputQty);
    if (!selectedId || isNaN(qty) || qty <= 0) return;
    onScale(selectedId, qty);
    setOpen(false);
    setInputQty('');
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-amber-50 hover:text-amber-600 text-gray-600 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-150">
          <Target className="w-4 h-4" />
          {t('scaleByIng')}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-5">
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-bold text-gray-800 text-lg">{t('scaleByIngTitle')}</Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-sm text-gray-500">
            {t('scaleByIngDesc')}
          </Dialog.Description>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">{t('chooseIngredient')}</label>
            <select
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={selectedId}
              onChange={(e) => { setSelectedId(e.target.value); setInputQty(''); }}
            >
              <option value="">{t('selectIngredient')}</option>
              {ingredients
                .filter((i) => i.originalQuantity !== null)
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({t('original')}: {i.originalQuantity} {displayUnit(i.unit, i.originalQuantity)})
                  </option>
                ))}
            </select>

            {selected && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('howMuch')} {selected.name} {t('doYouHave')}
                  {selected.unit && (
                    <span className="ml-1 text-gray-400">({displayUnit(selected.unit, null)})</span>
                  )}
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  placeholder={`e.g. ${selected.originalQuantity}`}
                  value={inputQty}
                  onChange={(e) => setInputQty(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                {inputQty && !isNaN(parseFloat(inputQty)) && selected.originalQuantity && (
                  <p className="text-xs text-amber-600 font-medium">
                    {t('scaleFactor')}: ×{parseFloat((parseFloat(inputQty) / selected.originalQuantity).toFixed(3))}
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleApply}
            disabled={!selectedId || !inputQty || parseFloat(inputQty) <= 0}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-all duration-150"
          >
            {t('applyScale')}
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
