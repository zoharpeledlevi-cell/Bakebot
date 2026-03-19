export type Lang = 'en' | 'he';

const en = {
  // Header
  tagline: 'Smart AI Sous-Chef',
  newRecipe: 'New Recipe',
  langToggle: 'עב',

  // Hero
  heroTitle1: 'Scale any recipe,',
  heroTitleAccent: 'instantly.',
  heroSubtitle: "Paste your recipe below. We'll parse it, let you scale it, and suggest smart substitutes.",

  // RecipeParser
  pasteTitle: 'Paste Your Recipe',
  pasteSubtitle: "We'll parse it into structured ingredients automatically",
  parseBtnIdle: 'Parse Recipe',
  parseBtnLoading: 'Parsing...',
  pastePlaceholder: `Chocolate Chip Cookies

Ingredients:
2 1/4 cups all-purpose flour
1 tsp baking soda
1 tsp salt
1 cup butter, softened
3/4 cup granulated sugar
3/4 cup brown sugar
2 large eggs
2 tsp vanilla extract
2 cups chocolate chips

Instructions:
1. Preheat oven to 375°F...`,

  // ScalingControls
  scaleRecipe: 'Scale Recipe',
  fractions: 'Fractions',
  multipliers: 'Multipliers',
  resetScale: 'Reset (×1)',
  scaledTo: 'Currently scaled to',
  ofOriginal: 'of original',

  // ScaleByIngredient
  scaleByIng: 'Scale by Ingredient',
  scaleByIngTitle: 'Scale by Ingredient',
  scaleByIngDesc: "Tell us how much of one ingredient you have, and we'll scale the entire recipe to match.",
  chooseIngredient: 'Choose an ingredient',
  selectIngredient: 'Select ingredient…',
  howMuch: 'How much',
  doYouHave: 'do you have?',
  original: 'original',
  scaleFactor: 'Scale factor',
  applyScale: 'Apply Scale',

  // RecipeCard
  kitchenMode: 'Kitchen Mode',
  exitKitchenMode: 'Exit Kitchen Mode',
  kitchenHint: "Tap each ingredient as you add it. Press 'Exit Kitchen Mode' when done.",
  progress: 'Progress',
  ingredientsLabel: 'ingredients',
  colQty: 'Qty',
  colUnit: 'Unit',
  colIngredient: 'Ingredient',

  // Categories
  catCookies: 'Cookies',
  catCake: 'Cake',
  catBread: 'Bread',
  catPastry: 'Pastry',
  catSavory: 'Savory',
  catDrinks: 'Drinks',
  catOther: 'Other',

  // SubstituteModal
  substitutesFor: 'Substitutes for',
  chefsAnalysis: "Chef's Analysis",
  analyzingRecipe: 'Analyzing your recipe…',
  findingBest: 'Finding the best substitutes for this dish',
  allRejected: 'All suggestions have been rejected.',
  trySearching: 'Try searching online for more options.',
  ratio: 'Ratio',
  catPerfect: 'Perfect Match',
  catVegan: 'Vegan / Parve',
  catHealthier: 'Healthier Option',
  catPantry: 'Pantry Basics',

  // Units (values are always English canonical; labels are language-specific)
  unitNone: '—',
  unitCup: 'cup',
  unitTbsp: 'tbsp',
  unitTsp: 'tsp',
  unitG: 'g',
  unitKg: 'kg',
  unitOz: 'oz',
  unitLb: 'lb',
  unitMl: 'ml',
  unitL: 'l',
  unitPiece: 'piece',
  unitClove: 'clove',
  unitSlice: 'slice',
  unitPinch: 'pinch',
  unitWhole: 'whole',
};

const he: typeof en = {
  // Header
  tagline: 'סו-שף חכם עם בינה מלאכותית',
  newRecipe: 'מתכון חדש',
  langToggle: 'EN',

  // Hero
  heroTitle1: 'התאימו כל מתכון',
  heroTitleAccent: 'בקלות ובמהירות.',
  heroSubtitle: 'הדביקו את המתכון למטה. אנחנו נזהה את המרכיבים באופן אוטומטי ונאפשר לכם לשנות כמויות ולהציע תחליפים חכמים.',

  // RecipeParser
  pasteTitle: 'הדבקת המתכון',
  pasteSubtitle: 'נזהה את המרכיבים ונסדר אותם בטבלה נוחה',
  parseBtnIdle: 'ניתוח מתכון',
  parseBtnLoading: 'מפרסר...',
  pastePlaceholder: `עוגיות שוקולד צ'יפס

מרכיבים:
2¼ כוסות קמח לבן
כפית אבקת אפייה
כפית מלח
כוס חמאה רכה
¾ כוס סוכר לבן
¾ כוס סוכר חום
2 ביצים גדולות
2 כפיות תמצית וניל
2 כוסות שוקולד צ'יפס

הכנה:
1. חמם תנור ל-190 מעלות...`,

  // ScalingControls
  scaleRecipe: 'שינוי כמויות',
  fractions: 'שברים',
  multipliers: 'מכפילים',
  resetScale: 'אפס (×1)',
  scaledTo: 'מוכפל כעת ב',
  ofOriginal: 'מהמקור',

  // ScaleByIngredient
  scaleByIng: 'שנה לפי מרכיב',
  scaleByIngTitle: 'שנה לפי מרכיב',
  scaleByIngDesc: 'ספר לנו כמה מרכיב אחד יש לך, ונשנה את כל המתכון בהתאם.',
  chooseIngredient: 'בחר מרכיב',
  selectIngredient: 'בחר מרכיב…',
  howMuch: 'כמה',
  doYouHave: 'יש לך?',
  original: 'מקור',
  scaleFactor: 'מקדם שינוי',
  applyScale: 'החל שינוי',

  // RecipeCard
  kitchenMode: 'מצב מטבח',
  exitKitchenMode: 'יצא ממצב מטבח',
  kitchenHint: "הקש על כל מרכיב כשמוסיפים אותו. לחץ 'יצא ממצב מטבח' כשסיימת.",
  progress: 'התקדמות',
  ingredientsLabel: 'מרכיבים',
  colQty: 'כמות',
  colUnit: 'יחידה',
  colIngredient: 'מרכיב',

  // Categories
  catCookies: 'עוגיות',
  catCake: 'עוגה',
  catBread: 'לחם',
  catPastry: 'מאפה',
  catSavory: 'מלוח',
  catDrinks: 'שתייה',
  catOther: 'אחר',

  // SubstituteModal
  substitutesFor: 'תחליפים עבור',
  chefsAnalysis: 'ניתוח השף',
  analyzingRecipe: 'מנתח את המתכון…',
  findingBest: 'מחפש את התחליפים הטובים ביותר עבור המנה',
  allRejected: 'כל ההצעות נדחו.',
  trySearching: 'נסה לחפש אונליין לאפשרויות נוספות.',
  ratio: 'יחס',
  catPerfect: 'התאמה מושלמת',
  catVegan: 'טבעוני / פרווה',
  catHealthier: 'אפשרות בריאה יותר',
  catPantry: 'מה שיש בבית',

  // Units
  unitNone: '—',
  unitCup: 'כוס',
  unitTbsp: 'כף',
  unitTsp: 'כפית',
  unitG: 'גרם',
  unitKg: 'ק"ג',
  unitOz: 'oz',
  unitLb: 'lb',
  unitMl: 'מ"ל',
  unitL: 'ליטר',
  unitPiece: 'יחידה',
  unitClove: 'שן',
  unitSlice: 'פרוסה',
  unitPinch: 'קמצוץ',
  unitWhole: 'שלם',
};

export const translations = { en, he };
export type TranslationKey = keyof typeof en;
