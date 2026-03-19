import { ArrowLeftRight, Check } from 'lucide-react';
import * as Checkbox from '@radix-ui/react-checkbox';
import type { Ingredient } from '../types/recipe';
import type { TranslationKey } from '../i18n/translations';
import { formatQuantity } from '../utils/fractions';
import { useLang } from '../contexts/LanguageContext';

// value is the canonical English unit stored in recipe data
// labelKey points to the translated label in the current language
const UNIT_DEFS: { value: string; labelKey: TranslationKey }[] = [
  { value: '',      labelKey: 'unitNone'  },
  { value: 'cup',   labelKey: 'unitCup'   },
  { value: 'tbsp',  labelKey: 'unitTbsp'  },
  { value: 'tsp',   labelKey: 'unitTsp'   },
  { value: 'g',     labelKey: 'unitG'     },
  { value: 'kg',    labelKey: 'unitKg'    },
  { value: 'oz',    labelKey: 'unitOz'    },
  { value: 'lb',    labelKey: 'unitLb'    },
  { value: 'ml',    labelKey: 'unitMl'    },
  { value: 'l',     labelKey: 'unitL'     },
  { value: 'piece', labelKey: 'unitPiece' },
  { value: 'clove', labelKey: 'unitClove' },
  { value: 'slice', labelKey: 'unitSlice' },
  { value: 'pinch', labelKey: 'unitPinch' },
  { value: 'whole', labelKey: 'unitWhole' },
];

interface Props {
  ingredient: Ingredient;
  kitchenMode: boolean;
  onToggle: (id: string) => void;
  onSubstitute: (id: string, name: string) => void;
  onUpdateUnit: (id: string, unit: string) => void;
}

export function IngredientRow({ ingredient, kitchenMode, onToggle, onSubstitute, onUpdateUnit }: Props) {
  const { t } = useLang();
  const { id, name, quantity, unit, checked } = ingredient;
  const qtyDisplay = quantity !== null ? formatQuantity(quantity) : '';

  return (
    <div
      className={`flex items-center gap-3 py-3 px-1 border-b border-gray-50 last:border-0 transition-opacity ${
        kitchenMode && checked ? 'opacity-40' : 'opacity-100'
      }`}
    >
      {/* Checkbox (kitchen mode) */}
      {kitchenMode && (
        <Checkbox.Root
          checked={checked}
          onCheckedChange={() => onToggle(id)}
          className="w-5 h-5 rounded-md border-2 border-gray-300 data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-500 flex items-center justify-center flex-shrink-0 transition-colors"
        >
          <Checkbox.Indicator>
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </Checkbox.Indicator>
        </Checkbox.Root>
      )}

      {/* Quantity */}
      <span className="w-14 text-end font-bold text-gray-800 text-base flex-shrink-0 tabular-nums">
        {qtyDisplay}
      </span>

      {/* Unit — always-editable dropdown, labels in current language */}
      <div className="w-16 flex-shrink-0">
        <select
          value={unit}
          onChange={(e) => onUpdateUnit(id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className={`text-xs rounded-lg px-1 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 w-full ${
            unit
              ? 'border border-gray-200 text-gray-600 bg-white font-medium hover:border-amber-300 transition-colors'
              : 'border border-dashed border-amber-300 text-amber-600 bg-amber-50'
          }`}
          title="Change unit"
        >
          {UNIT_DEFS.map((def) => (
            <option key={def.value} value={def.value}>
              {t(def.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {/* Ingredient name */}
      <span
        className={`flex-1 text-sm text-gray-700 capitalize ${
          kitchenMode && checked ? 'line-through text-gray-400' : ''
        }`}
      >
        {name}
        {ingredient.notes && (
          <span className="text-gray-400 text-xs ms-1">, {ingredient.notes}</span>
        )}
      </span>

      {/* Substitute button — always visible */}
      <button
        onClick={() => onSubstitute(id, name)}
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
        title={`Find substitutes for ${name}`}
      >
        <ArrowLeftRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
