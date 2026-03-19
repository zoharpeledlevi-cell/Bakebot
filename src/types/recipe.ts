export interface Ingredient {
  id: string;
  name: string;
  quantity: number | null;
  unit: string;
  originalQuantity: number | null;
  checked: boolean;
  notes?: string;
}

/**
 * A single row in the unified mixed-list view.
 * Ingredient rows reference an ingredient by ID (single source of truth is recipe.ingredients).
 * Instruction rows store their text directly.
 */
export type MixedRow =
  | { kind: 'ingredient'; ingredientId: string }
  | { kind: 'instruction'; text: string; id: string };

export interface Recipe {
  title: string;
  category?: string;
  ingredients: Ingredient[];
  /** Display order — mix of ingredient refs and instruction text */
  rows: MixedRow[];
  instructions: string[];   // kept for backward compat; derived from rows if needed
  rawText: string;
}

export interface SubstituteOption {
  name: string;
  ratio: string;          // e.g. "1:1" or "3/4 cup per 1 cup"
  category: 'perfect' | 'vegan' | 'healthier' | 'pantry';
  effect: string;         // texture/flavor explanation
  unit?: string;
}

export type ScaleFraction = '1/4' | '1/3' | '1/2' | '2/3' | '3/4';
export type ScaleMultiplier = 2 | 3 | 4 | 5;
export type ScaleFactor = ScaleFraction | ScaleMultiplier | number;
