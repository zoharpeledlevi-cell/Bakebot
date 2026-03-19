/** Normalise units to a canonical form */
export function normaliseUnit(raw: string): string {
  const u = raw.trim().toLowerCase();
  const map: Record<string, string> = {
    // cups
    cup: 'cup', cups: 'cup', c: 'cup',
    // tablespoons
    tablespoon: 'tbsp', tablespoons: 'tbsp', tbs: 'tbsp', tbsp: 'tbsp',
    // teaspoons
    teaspoon: 'tsp', teaspoons: 'tsp', tsp: 'tsp',
    // grams / kilograms
    gram: 'g', grams: 'g', g: 'g',
    kilogram: 'kg', kilograms: 'kg', kg: 'kg',
    // ounces / pounds
    ounce: 'oz', ounces: 'oz', oz: 'oz',
    pound: 'lb', pounds: 'lb', lb: 'lb', lbs: 'lb',
    // millilitres / litres
    milliliter: 'ml', millilitre: 'ml', ml: 'ml',
    liter: 'l', litre: 'l', l: 'l',
    // pieces / count
    piece: 'piece', pieces: 'piece', pcs: 'piece',
    large: 'large', medium: 'medium', small: 'small',
    whole: 'whole', clove: 'clove', cloves: 'clove',
    slice: 'slice', slices: 'slice',
    pinch: 'pinch', pinches: 'pinch',
    dash: 'dash', dashes: 'dash',
    can: 'can', cans: 'can',
  };
  return map[u] ?? raw.trim();
}

/** Return a human-friendly display unit (pluralised when needed) */
export function displayUnit(unit: string, qty: number | null): string {
  if (!unit) return '';
  const pluralMap: Record<string, string> = {
    cup: 'cups', tbsp: 'tbsp', tsp: 'tsp',
    g: 'g', kg: 'kg', oz: 'oz', lb: 'lbs',
    ml: 'ml', l: 'l',
    piece: 'pieces', clove: 'cloves', slice: 'slices',
    pinch: 'pinches', dash: 'dashes', can: 'cans',
  };
  if (qty !== null && qty === 1) return unit;
  return pluralMap[unit] ?? unit;
}
