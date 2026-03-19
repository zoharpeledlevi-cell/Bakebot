import { useCallback, useState } from 'react';
import type { Ingredient, Recipe } from '../types/recipe';
import { scaleQuantity, toDecimal } from '../utils/fractions';

export type ScalePreset = '1/4' | '1/3' | '1/2' | '2/3' | '3/4' | 2 | 3 | 4 | 5;

export function useScaling(recipe: Recipe | null, setRecipe: (r: Recipe | null) => void) {
  const [currentFactor, setCurrentFactor] = useState<number>(1);

  const applyScale = useCallback(
    (factor: ScalePreset | number) => {
      if (!recipe) return;
      const decimal = typeof factor === 'string' ? toDecimal(factor) : factor;
      setCurrentFactor(decimal);

      const scaled: Ingredient[] = recipe.ingredients.map((ing) => ({
        ...ing,
        quantity: scaleQuantity(ing.originalQuantity, decimal),
      }));

      setRecipe({ ...recipe, ingredients: scaled });
    },
    [recipe, setRecipe]
  );

  const scaleByIngredient = useCallback(
    (ingredientId: string, targetQty: number) => {
      if (!recipe) return;
      const target = recipe.ingredients.find((i) => i.id === ingredientId);
      if (!target || !target.originalQuantity || target.originalQuantity === 0) return;
      const factor = targetQty / target.originalQuantity;
      applyScale(factor);
    },
    [recipe, applyScale]
  );

  const resetScale = useCallback(() => {
    if (!recipe) return;
    setCurrentFactor(1);
    const reset: Ingredient[] = recipe.ingredients.map((ing) => ({
      ...ing,
      quantity: ing.originalQuantity,
    }));
    setRecipe({ ...recipe, ingredients: reset });
  }, [recipe, setRecipe]);

  // Resets only the factor number — does NOT touch recipe state.
  // Use this when clearing the recipe so the two setRecipe calls don't fight.
  const resetFactor = useCallback(() => setCurrentFactor(1), []);

  return { currentFactor, applyScale, scaleByIngredient, resetScale, resetFactor };
}
