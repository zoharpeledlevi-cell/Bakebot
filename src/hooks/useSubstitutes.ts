import { useState, useCallback, useRef } from 'react';
import type { SubstituteOption, Recipe } from '../types/recipe';
import { getContextAwareSubstitutes } from '../utils/substituteData';

export function useSubstitutes() {
  const [activeIngredient, setActiveIngredient] = useState<{ id: string; name: string } | null>(null);
  const [substitutes, setSubstitutes] = useState<SubstituteOption[]>([]);
  const [chefNote, setChefNote] = useState<string>('');
  // Tracks indices into the ORIGINAL `substitutes` array — safe across multiple rejections
  const [rejectedIndices, setRejectedIndices] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSubstitutes = useCallback((id: string, name: string, recipe?: Recipe) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setActiveIngredient({ id, name });
    setSubstitutes([]);
    setChefNote('');
    setRejectedIndices(new Set());
    setIsLoading(true);
    setIsOpen(true);

    // Short delay simulates context-analysis + lets the sparkle animation show
    timerRef.current = setTimeout(() => {
      const result = getContextAwareSubstitutes(name, recipe);
      setSubstitutes(result.substitutes);
      setChefNote(result.chefNote);
      setIsLoading(false);
    }, 480);
  }, []);

  /** Pass the ORIGINAL index from the full `substitutes` array. */
  const rejectSubstitute = useCallback((originalIndex: number) => {
    setRejectedIndices((prev) => {
      const next = new Set(prev);
      next.add(originalIndex);
      return next;
    });
  }, []);

  const closeSubstitutes = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(false);
    setActiveIngredient(null);
    setSubstitutes([]);
    setChefNote('');
    setRejectedIndices(new Set());
    setIsLoading(false);
  }, []);

  return {
    activeIngredient,
    substitutes,     // full list — modal filters internally using rejectedIndices
    chefNote,
    rejectedIndices,
    isLoading,
    isOpen,
    openSubstitutes,
    rejectSubstitute,
    closeSubstitutes,
  };
}
