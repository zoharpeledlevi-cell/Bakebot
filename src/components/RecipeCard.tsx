import { useState, useRef, useEffect } from 'react';
import { CookingPot, UtensilsCrossed, X, Pencil } from 'lucide-react';
import type { Recipe, Ingredient } from '../types/recipe';
import type { TranslationKey } from '../i18n/translations';
import { IngredientRow } from './IngredientRow';
import { useLang } from '../contexts/LanguageContext';

// Value is always the English canonical name (stored in recipe.category)
// labelKey maps to the translated display label
const CATEGORIES: { value: string; labelKey: TranslationKey }[] = [
  { value: 'Cookies', labelKey: 'catCookies' },
  { value: 'Cake',    labelKey: 'catCake' },
  { value: 'Bread',   labelKey: 'catBread' },
  { value: 'Pastry',  labelKey: 'catPastry' },
  { value: 'Savory',  labelKey: 'catSavory' },
  { value: 'Drinks',  labelKey: 'catDrinks' },
  { value: 'Other',   labelKey: 'catOther' },
];

interface Props {
  recipe: Recipe;
  onToggleChecked: (id: string) => void;
  onSubstitute: (id: string, name: string) => void;
  onUpdateIngredient: (id: string, changes: Partial<Ingredient>) => void;
  onUpdateTitle: (title: string) => void;
  onUpdateCategory: (category: string) => void;
}

export function RecipeCard({
  recipe,
  onToggleChecked,
  onSubstitute,
  onUpdateIngredient,
  onUpdateTitle,
  onUpdateCategory,
}: Props) {
  const { t } = useLang();
  const [kitchenMode, setKitchenMode] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(recipe.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const checkedCount = recipe.ingredients.filter((i) => i.checked).length;
  const total = recipe.ingredients.length;
  const hasIngredients = total > 0;

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed) onUpdateTitle(trimmed);
    else setTitleDraft(recipe.title);
    setEditingTitle(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
      {/* ── Header ── */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-50">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          {/* Title + category */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <CookingPot className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              {/* Inline-editable title */}
              {editingTitle ? (
                <input
                  ref={titleInputRef}
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={commitTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitTitle();
                    if (e.key === 'Escape') { setTitleDraft(recipe.title); setEditingTitle(false); }
                  }}
                  className="font-bold text-gray-800 text-lg leading-tight w-full border-b-2 border-amber-400 bg-transparent outline-none pb-0.5"
                />
              ) : (
                <button
                  onClick={() => { setTitleDraft(recipe.title); setEditingTitle(true); }}
                  className="group flex items-center gap-1.5 text-left"
                >
                  <h2 className="font-bold text-gray-800 text-lg leading-tight">{recipe.title}</h2>
                  <Pencil className="w-3.5 h-3.5 text-gray-300 group-hover:text-amber-400 transition flex-shrink-0" />
                </button>
              )}

              {/* Category pills */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {CATEGORIES.map(({ value, labelKey }) => (
                  <button
                    key={value}
                    onClick={() => onUpdateCategory(recipe.category === value ? '' : value)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all duration-150 ${
                      recipe.category === value
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-amber-300 hover:text-amber-600'
                    }`}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Kitchen mode button */}
          <button
            onClick={() => setKitchenMode((k) => !k)}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150 flex-shrink-0 ${
              kitchenMode
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600'
            }`}
          >
            {kitchenMode ? <X className="w-4 h-4" /> : <UtensilsCrossed className="w-4 h-4" />}
            {kitchenMode ? t('exitKitchenMode') : t('kitchenMode')}
          </button>
        </div>

        {/* Ingredient count */}
        <p className="text-xs text-gray-400 mt-2 ps-[44px] sm:ps-[52px]">{total} {t('ingredientsLabel')}</p>
      </div>

      {/* ── Kitchen mode: progress + hint ── */}
      {kitchenMode && total > 0 && (
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 space-y-2">
          <p className="text-xs text-amber-700">{t('kitchenHint')}</p>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-amber-700">{t('progress')}</span>
            <span className="text-xs font-bold text-amber-700">{checkedCount}/{total}</span>
          </div>
          <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${(checkedCount / total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Column headers (shown only when there are ingredients) ── */}
      {hasIngredients && (
        <div className="flex items-center gap-3 px-3 sm:px-4 pt-3 pb-1">
          {kitchenMode && <div className="w-5 flex-shrink-0" />}
          <span className="w-14 text-end text-xs font-medium text-gray-400 uppercase tracking-wider">{t('colQty')}</span>
          <span className="w-16 text-xs font-medium text-gray-400 uppercase tracking-wider">{t('colUnit')}</span>
          <span className="flex-1 text-xs font-medium text-gray-400 uppercase tracking-wider">{t('colIngredient')}</span>
          <span className="w-7 flex-shrink-0" />
        </div>
      )}

      {/* ── Mixed rows: ingredients and instructions interleaved ── */}
      <div className="px-3 pb-4 sm:px-4">
        {recipe.rows.map((row) => {
          if (row.kind === 'ingredient') {
            const ing = recipe.ingredients.find((i) => i.id === row.ingredientId);
            if (!ing) return null;
            return (
              <IngredientRow
                key={ing.id}
                ingredient={ing}
                kitchenMode={kitchenMode}
                onToggle={onToggleChecked}
                onSubstitute={onSubstitute}
                onUpdateUnit={(id, unit) => onUpdateIngredient(id, { unit })}
              />
            );
          }

          return (
            <div
              key={row.id}
              className="flex items-center gap-3 py-2 px-1 border-b border-gray-50 last:border-0"
            >
              {kitchenMode && <div className="w-5 h-5 flex-shrink-0" />}
              <p className="flex-1 text-sm text-gray-500 leading-relaxed border-s-2 border-amber-200 ps-3 py-0.5 font-medium">
                {row.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
