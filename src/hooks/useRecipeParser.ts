import { useState, useCallback } from 'react';
import type { Ingredient, MixedRow, Recipe } from '../types/recipe';
import { normaliseUnit } from '../utils/unitConverter';

let idCounter = 0;
const uid = () => `ing-${++idCounter}`;

// ─── Patterns ─────────────────────────────────────────────────────────────────

/** Leading quantity: integer, decimal, fraction, or unicode fraction */
const QUANTITY_PATTERN = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.?\d+|[¼½¾⅓⅔⅛⅜⅝⅞])/;

/** Unit words */
const UNIT_WORDS = [
  'cups?', 'tbsp?', 'tsp?', 'tablespoons?', 'teaspoons?',
  'oz', 'ounces?', 'lbs?', 'pounds?', 'grams?', 'g', 'kg', 'kilograms?',
  'ml', 'milliliters?', 'millilitres?', 'liters?', 'litres?', 'l',
  'pieces?', 'pcs?', 'slices?', 'cloves?', 'pinch(?:es)?', 'dashes?',
  'cans?', 'large', 'medium', 'small', 'whole', 'handful', 'bunch',
];
const UNIT_PATTERN = new RegExp(`^(${UNIT_WORDS.join('|')})\\b`, 'i');

/** Hebrew unit map — plural forms listed before singular so they match first */
const HEBREW_UNITS: { pattern: RegExp; canonical: string }[] = [
  { pattern: /^כוסות/, canonical: 'cup' },
  { pattern: /^כוס/, canonical: 'cup' },
  { pattern: /^כפות/, canonical: 'tbsp' },
  { pattern: /^כף/, canonical: 'tbsp' },
  { pattern: /^כפיות/, canonical: 'tsp' },
  { pattern: /^כפית/, canonical: 'tsp' },
  { pattern: /^גרמים/, canonical: 'g' },
  { pattern: /^גרם/, canonical: 'g' },
  { pattern: /^קילוגרמים|^קילוגרם|^קילו/, canonical: 'kg' },
  { pattern: /^מיליליטרים|^מיליליטר|^מ"ל/, canonical: 'ml' },
  { pattern: /^ליטרים|^ליטר/, canonical: 'l' },
  { pattern: /^יחידות|^יחידה|^חתיכות|^חתיכה/, canonical: 'piece' },
  { pattern: /^שיני|^שן/, canonical: 'clove' },
  { pattern: /^פרוסות|^פרוסה/, canonical: 'slice' },
  { pattern: /^קמצוץ/, canonical: 'pinch' },
];

function matchHebrewUnit(text: string): { canonical: string; length: number } | null {
  for (const { pattern, canonical } of HEBREW_UNITS) {
    const m = text.match(pattern);
    if (m) return { canonical, length: m[0].length };
  }
  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseFraction(raw: string): number {
  const unicodeFractions: Record<string, number> = {
    '¼': 0.25, '½': 0.5, '¾': 0.75,
    '⅓': 0.333, '⅔': 0.667,
    '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
  };
  if (unicodeFractions[raw]) return unicodeFractions[raw];
  if (raw.includes('/')) {
    const parts = raw.split('/');
    return parseFloat(parts[0]) / parseFloat(parts[1]);
  }
  if (raw.includes(' ')) {
    const [whole, frac] = raw.trim().split(' ');
    return parseFloat(whole) + parseFraction(frac);
  }
  return parseFloat(raw);
}

/**
 * Try to parse a line as an ingredient.
 * Returns null if the line has no quantity/unit marker (→ treat as instruction).
 * Supports English (qty + unit) and Hebrew (unit-first or qty + Hebrew unit).
 */
function parseIngredientLine(line: string): Ingredient | null {
  const trimmed = line.trim().replace(/^[-•*]\s*/, '');
  if (!trimmed) return null;

  let rest = trimmed;
  let quantity: number | null = null;
  let unit = '';

  // Optional leading quantity (English/numeric)
  const qMatch = rest.match(QUANTITY_PATTERN);
  if (qMatch) {
    quantity = parseFraction(qMatch[1].trim());
    rest = rest.slice(qMatch[0].length).trim();
  }

  // Try English unit first
  const uMatch = rest.match(UNIT_PATTERN);
  if (uMatch) {
    unit = normaliseUnit(uMatch[1]);
    rest = rest.slice(uMatch[0].length).trim();
  }

  // If no English unit found, try Hebrew unit
  if (!unit) {
    const hMatch = matchHebrewUnit(rest);
    if (hMatch) {
      unit = hMatch.canonical;
      rest = rest.slice(hMatch.length).trim();
      // "כוס מים" — Hebrew unit with no preceding digit → implicit quantity 1
      if (quantity === null) quantity = 1;
    }
  }

  // Must have a quantity to be an ingredient (pure-text lines → instruction)
  if (quantity === null) return null;

  rest = rest.replace(/^of\s+/i, '').trim();
  const name = rest.split(',')[0].trim();
  if (!name) return null;

  return {
    id: uid(),
    name,
    quantity,
    originalQuantity: quantity,
    unit,
    checked: false,
    notes: rest.includes(',') ? rest.split(',').slice(1).join(',').trim() : undefined,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRecipeParser() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const parseRecipe = useCallback((text: string) => {
    setIsParsing(true);
    idCounter = 0;

    const rawLines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    // ── Title detection ────────────────────────────────────────────────────────
    // First line is title if: ≤ 8 words, no leading digit, not an obvious header
    let title = 'My Recipe';
    let bodyStart = 0;
    const first = rawLines[0] ?? '';
    if (
      first &&
      first.split(' ').length <= 8 &&
      !/^\d/.test(first) &&
      !/^(ingredients?|instructions?|directions?|method|steps?|מרכיבים|הכנה):?$/i.test(first)
    ) {
      title = first;
      bodyStart = 1;
    }

    // ── Single-pass: each line → ingredient or instruction row ─────────────────
    const ingredients: Ingredient[] = [];
    const rows: MixedRow[] = [];
    let instrCount = 0;

    for (const line of rawLines.slice(bodyStart)) {
      const stripped = line.replace(/^[-•*]\s*/, '').trim();
      if (!stripped) continue;

      // Strip leading numbered step markers for parsing, keep original text for display
      const withoutNumber = stripped.replace(/^\d+[.)]\s*/, '');

      const ing = parseIngredientLine(withoutNumber);
      if (ing) {
        ingredients.push(ing);
        rows.push({ kind: 'ingredient', ingredientId: ing.id });
      } else {
        // Everything else is an instruction — preserve the original text exactly
        rows.push({ kind: 'instruction', text: stripped, id: `instr-${++instrCount}` });
      }
    }

    setRecipe({ title, ingredients, rows, instructions: [], rawText: text });
    setRawText(text);
    setIsParsing(false);
  }, []);

  const updateIngredient = useCallback((id: string, changes: Partial<Ingredient>) => {
    setRecipe((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ingredients: prev.ingredients.map((ing) =>
          ing.id === id ? { ...ing, ...changes } : ing
        ),
      };
    });
  }, []);

  const toggleChecked = useCallback((id: string) => {
    setRecipe((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ingredients: prev.ingredients.map((ing) =>
          ing.id === id ? { ...ing, checked: !ing.checked } : ing
        ),
      };
    });
  }, []);

  const updateTitle = useCallback((title: string) => {
    setRecipe((prev) => (prev ? { ...prev, title } : prev));
  }, []);

  const updateCategory = useCallback((category: string) => {
    setRecipe((prev) => (prev ? { ...prev, category } : prev));
  }, []);

  const clearRecipe = useCallback(() => {
    setRecipe(null);
    setRawText('');
    idCounter = 0;
  }, []);

  return {
    recipe, setRecipe, rawText, setRawText, isParsing,
    parseRecipe, updateIngredient, updateTitle, updateCategory,
    toggleChecked, clearRecipe,
  };
}
