import type { SubstituteOption, Recipe } from '../types/recipe';

// ─── Types ────────────────────────────────────────────────────────────────────

type RecipeContext = 'dessert' | 'bread' | 'savory' | 'general';

type Role =
  | 'fat' | 'sweetener' | 'leavener' | 'binder' | 'liquid'
  | 'flour' | 'starch' | 'chocolate' | 'cocoa' | 'acid'
  | 'salt' | 'protein' | 'dairy' | 'nut' | 'fruit'
  | 'spice' | 'herb' | 'flavor' | 'egg' | 'thickener';

interface IngredientProfile {
  roles: Role[];
  cookingFunction: string;
  substitutes: SubstituteOption[];
  contextPriority?: Partial<Record<RecipeContext, { priority: string[]; insight: string }>>;
}

export interface SubstituteResult {
  substitutes: SubstituteOption[];
  chefNote: string;
}

// ─── Role descriptions (for Chef's Note generation) ─────────────────────────

const ROLE_FUNCTIONS: Record<Role, string> = {
  fat:        'moisture, tenderness, and richness',
  sweetener:  'sweetness and caramelization',
  leavener:   'lift and lightness',
  binder:     'structure and cohesion',
  liquid:     'hydration and texture',
  flour:      'gluten structure and body',
  starch:     'thickening and texture',
  chocolate:  'chocolate flavor and richness',
  cocoa:      'intense cocoa flavor and dark color',
  acid:       'brightness, acidity, and chemical activation',
  salt:       'flavor enhancement and balance',
  protein:    'substance and savory depth',
  dairy:      'richness and creaminess',
  nut:        'crunch, nuttiness, and healthy fats',
  fruit:      'natural sweetness, moisture, and flavor',
  spice:      'warmth and aromatic complexity',
  herb:       'fresh aromatic flavor',
  flavor:     'flavor depth and complexity',
  egg:        'binding, structure, lift, and richness',
  thickener:  'body, texture, and viscosity',
};

// ─── Hebrew → English map ─────────────────────────────────────────────────────

const HEBREW_TO_ENGLISH: Record<string, string> = {
  'חמאה': 'butter', 'חמאה רכה': 'butter', 'חמאה מומסת': 'butter',
  'שמן': 'oil', 'שמן זית': 'olive oil', 'שמן קוקוס': 'coconut oil',
  'שמן חמניות': 'sunflower oil', 'שמן קנולה': 'canola oil',
  'מרגרינה': 'margarine',
  'קמח': 'flour', 'קמח לבן': 'flour', 'קמח חיטה': 'flour',
  'קמח מלא': 'whole wheat flour', 'קמח שקדים': 'almond flour',
  'קמח שיבולת שועל': 'oat flour',
  'סוכר': 'sugar', 'סוכר לבן': 'sugar', 'סוכר חום': 'brown sugar',
  'אבקת סוכר': 'powdered sugar', 'דבש': 'honey',
  'סירופ מייפל': 'maple syrup', 'סוכר קוקוס': 'coconut sugar',
  'ביצה': 'eggs', 'ביצים': 'eggs',
  'חלב': 'milk', 'חלב פרה': 'milk', 'חלב שקדים': 'almond milk',
  'חלב קוקוס': 'coconut milk', 'חלב שיבולת שועל': 'oat milk',
  'שמנת': 'heavy cream', 'שמנת מתוקה': 'heavy cream',
  'שמנת חמוצה': 'sour cream', 'גבינה לבנה': 'cream cheese',
  'גבינת שמנת': 'cream cheese', 'יוגורט': 'yogurt',
  'לבן': 'buttermilk', 'קפיר': 'buttermilk',
  'אבקת אפייה': 'baking powder', 'סודה לשתייה': 'baking soda',
  'שמרים': 'yeast',
  'תמצית וניל': 'vanilla extract', 'וניל': 'vanilla', 'קינמון': 'cinnamon',
  'מלח': 'salt', 'פלפל': 'pepper',
  'שוקולד': 'chocolate', 'שוקולד מריר': 'dark chocolate',
  'קקאו': 'cocoa powder', 'אבקת קקאו': 'cocoa powder',
  'תמרים': 'dates', 'קוקוס': 'desiccated coconut',
  'חמאת בוטנים': 'peanut butter', 'טחינה': 'tahini',
  'שוקולד לבן': 'white chocolate', 'שוקו': 'cocoa powder',
  'עוגיות': 'biscuit', 'חלב מרוכז': 'condensed milk',
  'שמן שומשום': 'sesame oil', 'חומוס': 'chickpeas',
};

// ─── Role-based fallback substitutes ─────────────────────────────────────────

const ROLE_FALLBACKS: Record<Role, SubstituteOption[]> = {
  fat: [
    { name: 'Coconut oil', ratio: '1:1', category: 'vegan', effect: 'Neutral fat with a light coconut aroma. Keeps baked goods moist.' },
    { name: 'Applesauce', ratio: '½ cup per 1 cup', category: 'healthier', effect: 'Reduces fat significantly. Adds moisture and mild sweetness.' },
    { name: 'Greek yogurt', ratio: '¾ cup per 1 cup', category: 'healthier', effect: 'Adds protein and tang while keeping baked goods moist.' },
    { name: 'Avocado (mashed)', ratio: '1:1', category: 'healthier', effect: 'Healthy monounsaturated fats. Creates a dense, fudgy texture.' },
  ],
  sweetener: [
    { name: 'Honey', ratio: '¾ cup per 1 cup', category: 'healthier', effect: 'Natural sweetener with floral notes. Reduce other liquids by 3 tbsp.' },
    { name: 'Maple syrup', ratio: '¾ cup per 1 cup', category: 'healthier', effect: 'Distinctive warm maple flavor. Reduce other liquids slightly.' },
    { name: 'Coconut sugar', ratio: '1:1', category: 'healthier', effect: 'Lower glycemic index. Caramel-like depth with less browning.' },
    { name: 'Agave syrup', ratio: '⅔ cup per 1 cup', category: 'vegan', effect: 'Neutral sweetness, very liquid. Reduce other liquids by 2–3 tbsp.' },
  ],
  leavener: [
    { name: 'Baking powder', ratio: '3 tsp per 1 tsp baking soda', category: 'pantry', effect: 'Slower acting; may produce a slightly denser rise.' },
    { name: 'Baking soda + acid', ratio: '¼ tsp soda + ½ tsp vinegar per 1 tsp baking powder', category: 'pantry', effect: 'DIY baking powder. Acts immediately on contact.' },
    { name: 'Whipped egg whites', ratio: '2 whites per 1 tsp leavener', category: 'perfect', effect: 'Physical leavener. Creates an airy, cloud-like crumb.' },
  ],
  binder: [
    { name: 'Flax egg (1 tbsp ground flax + 3 tbsp water)', ratio: '1 per egg', category: 'vegan', effect: 'Binds well with a subtle earthy flavor. Let sit 5 minutes before using.' },
    { name: 'Chia egg (1 tbsp chia + 3 tbsp water)', ratio: '1 per egg', category: 'vegan', effect: 'Neutral binder. Let sit 5 minutes to form a gel.' },
    { name: 'Aquafaba', ratio: '3 tbsp per egg', category: 'vegan', effect: 'Chickpea brine. Excellent binder; can even whip into meringue.' },
    { name: 'Cornstarch + water', ratio: '1 tbsp + 3 tbsp water', category: 'pantry', effect: 'Light binder for cookies and cakes. Neutral flavor.' },
  ],
  liquid: [
    { name: 'Oat milk', ratio: '1:1', category: 'vegan', effect: 'Closest to dairy in consistency and mild sweetness.' },
    { name: 'Almond milk', ratio: '1:1', category: 'vegan', effect: 'Light and thin. Mild nutty undertone.' },
    { name: 'Water', ratio: '1:1', category: 'pantry', effect: 'Completely neutral. May reduce richness slightly.' },
    { name: 'Coconut milk', ratio: '1:1', category: 'vegan', effect: 'Richer and creamier. Adds a subtle coconut flavor.' },
  ],
  flour: [
    { name: 'Almond flour', ratio: '1:1', category: 'healthier', effect: 'Gluten-free, moist, nutty. Best in cookies and dense cakes.' },
    { name: 'Oat flour', ratio: '1:1', category: 'healthier', effect: 'Blend oats fine. Mild flavor, slightly denser. Certified GF available.' },
    { name: 'Whole wheat flour', ratio: '½ cup per 1 cup', category: 'healthier', effect: 'Use half the amount for lighter results. Nutty flavor, more fiber.' },
    { name: 'Gluten-free all-purpose blend', ratio: '1:1', category: 'pantry', effect: 'Designed to mimic all-purpose flour. Results vary by brand.' },
  ],
  starch: [
    { name: 'Arrowroot powder', ratio: '1:1', category: 'vegan', effect: 'Clear, neutral gel. Works well in sauces and pie fillings.' },
    { name: 'Tapioca starch', ratio: '1:1', category: 'vegan', effect: 'Slightly chewy texture. Great for pie fillings and puddings.' },
    { name: 'Potato starch', ratio: '1:1', category: 'pantry', effect: 'Strong thickener. Neutral flavor. Don\'t boil too long.' },
    { name: 'All-purpose flour', ratio: '2 tbsp per 1 tbsp starch', category: 'pantry', effect: 'Classic thickener. Creates an opaque, slightly floury result.' },
  ],
  chocolate: [
    { name: 'Cocoa powder + fat', ratio: '3 tbsp cocoa + 1 tbsp oil per 1 oz chocolate', category: 'pantry', effect: 'Adjust sugar since cocoa is unsweetened. Works in baked goods.' },
    { name: 'Carob chips', ratio: '1:1', category: 'vegan', effect: 'Caffeine-free, naturally sweeter with a caramel-like flavor.' },
    { name: 'Dark chocolate (70%+)', ratio: '1:1', category: 'healthier', effect: 'Higher antioxidants. Slightly more bitter — reduce added sugar.' },
  ],
  cocoa: [
    { name: 'Carob powder', ratio: '1:1', category: 'vegan', effect: 'Naturally sweet, caffeine-free. Similar dark color; mellower, less bitter.' },
    { name: 'Dutch-process cocoa', ratio: '1:1', category: 'perfect', effect: 'Darker, richer, and less acidic. Gives a more intense chocolate color.' },
    { name: 'Melted dark chocolate', ratio: '2 tbsp melted (reduce fat by 1 tbsp)', category: 'perfect', effect: 'Deeper, more complex flavor. Adds fat — reduce butter/oil slightly.' },
    { name: 'Cacao powder (raw)', ratio: '1:1', category: 'healthier', effect: 'Maximum antioxidants. Slightly more bitter and astringent.' },
  ],
  acid: [
    { name: 'Lemon juice', ratio: '1:1', category: 'pantry', effect: 'Bright citrus acidity. Slightly noticeable flavor in delicate recipes.' },
    { name: 'Apple cider vinegar', ratio: '1:1', category: 'pantry', effect: 'Mild, slightly fruity acidity. Barely detectable in baked goods.' },
    { name: 'White vinegar', ratio: '1:1', category: 'pantry', effect: 'Sharp, clean acidity. Use only if flavor is neutralized in cooking.' },
    { name: 'Cream of tartar', ratio: '¼ tsp per ½ tsp acid', category: 'perfect', effect: 'Pure tartaric acid. Activates baking soda with zero flavor impact.' },
  ],
  salt: [
    { name: 'Sea salt', ratio: '1:1', category: 'perfect', effect: 'Same saltiness with subtle mineral complexity. A direct swap.' },
    { name: 'Kosher salt', ratio: '1½ tsp per 1 tsp table salt', category: 'pantry', effect: 'Larger, less dense flakes. Use 50% more by volume.' },
    { name: 'Himalayan pink salt', ratio: '1:1', category: 'healthier', effect: 'Trace minerals; same saltiness. Negligible flavor difference.' },
  ],
  protein: [
    { name: 'Tofu (firm)', ratio: '1:1', category: 'vegan', effect: 'Neutral flavor that absorbs surrounding spices and sauces.' },
    { name: 'Tempeh', ratio: '1:1', category: 'vegan', effect: 'Nutty, fermented flavor. Firmer texture than tofu.' },
    { name: 'Chickpeas', ratio: '1:1', category: 'vegan', effect: 'Hearty, mild flavor. Works well in stews and curries.' },
    { name: 'Lentils', ratio: '1:1', category: 'vegan', effect: 'Earthy, hearty protein. Great in soups, stews, and patties.' },
  ],
  dairy: [
    { name: 'Oat milk', ratio: '1:1', category: 'vegan', effect: 'Closest in consistency and slight sweetness to regular dairy.' },
    { name: 'Coconut cream', ratio: '1:1', category: 'vegan', effect: 'Rich and fatty. Adds a tropical note.' },
    { name: 'Cashew cream', ratio: '1:1', category: 'vegan', effect: 'Neutral, silky. Blend soaked cashews with water until smooth.' },
    { name: 'Soy milk', ratio: '1:1', category: 'vegan', effect: 'Highest protein of plant milks. Behaves most like dairy in baking.' },
  ],
  nut: [
    { name: 'Sunflower seeds', ratio: '1:1', category: 'pantry', effect: 'Nut-free crunch and mild flavor. Safe for nut allergies.' },
    { name: 'Pumpkin seeds (pepitas)', ratio: '1:1', category: 'pantry', effect: 'Mild, slightly nutty. Nut-free and protein-rich.' },
    { name: 'Toasted oats', ratio: '1:1', category: 'pantry', effect: 'Adds hearty texture without nuts. Slightly sweet and chewy.' },
    { name: 'Different nut variety', ratio: '1:1', category: 'perfect', effect: 'Most nuts are interchangeable by weight. Flavor profiles differ subtly.' },
  ],
  fruit: [
    { name: 'Similar fresh fruit', ratio: '1:1', category: 'perfect', effect: 'Use the closest in-season option for the best flavor match.' },
    { name: 'Frozen fruit (thawed)', ratio: '1:1', category: 'pantry', effect: 'Almost identical after thawing. Drain excess liquid before using.' },
    { name: 'Canned fruit (well drained)', ratio: '1:1', category: 'pantry', effect: 'Softer texture. Drain and pat dry thoroughly.' },
  ],
  spice: [
    { name: 'Allspice', ratio: '½ tsp per 1 tsp', category: 'pantry', effect: 'Has notes of cinnamon, clove, and nutmeg. Versatile spice substitute.' },
    { name: 'Mixed warming spice blend', ratio: '1:1', category: 'pantry', effect: 'Use any generic warming spice mix if the specific spice isn\'t available.' },
  ],
  herb: [
    { name: 'Dried version of same herb', ratio: '⅓ the fresh amount', category: 'pantry', effect: 'Dried herbs are 3× more concentrated. Use one-third of the fresh amount.' },
    { name: 'Italian herb blend', ratio: '1:1', category: 'pantry', effect: 'Mix of oregano, basil, thyme. Works in most savory contexts.' },
  ],
  flavor: [
    { name: 'Vanilla bean paste', ratio: '1:1', category: 'perfect', effect: 'Stronger, more complex. Visible specks of vanilla bean.' },
    { name: 'Almond extract', ratio: '½ tsp per 1 tsp', category: 'pantry', effect: 'Much more intense. Use half. Pairs beautifully with chocolate and cherry.' },
    { name: 'Maple syrup', ratio: '1 tsp per 1 tsp', category: 'pantry', effect: 'Adds subtle sweetness and caramel notes instead of floral vanilla.' },
  ],
  egg: [
    { name: 'Flax egg (1 tbsp ground flax + 3 tbsp water)', ratio: '1 per egg', category: 'vegan', effect: 'Earthy flavor; excellent binder. Let sit 5 min to gel. Best in dense baked goods.' },
    { name: 'Chia egg (1 tbsp chia + 3 tbsp water)', ratio: '1 per egg', category: 'vegan', effect: 'Neutral flavor; good binder. Gel in 5 min. Adds tiny specks.' },
    { name: 'Aquafaba (chickpea brine)', ratio: '3 tbsp per egg', category: 'vegan', effect: 'Whips into meringue-like foam. Best for airy cakes, mousses, and macarons.' },
    { name: 'Unsweetened applesauce', ratio: '¼ cup per egg', category: 'pantry', effect: 'Adds moisture and mild sweetness. Best for muffins, quick breads, and brownies.' },
  ],
  thickener: [
    { name: 'Arrowroot powder', ratio: '1:1', category: 'vegan', effect: 'Clear, glossy gel. Neutral flavor. Works at lower temperatures.' },
    { name: 'Tapioca starch', ratio: '1:1', category: 'vegan', effect: 'Slightly chewy texture. Great for puddings and pie fillings.' },
    { name: 'All-purpose flour', ratio: '2 tbsp per 1 tbsp starch', category: 'pantry', effect: 'Classic thickener for sauces and gravies. Creates an opaque result.' },
  ],
};

// ─── Ingredient database ──────────────────────────────────────────────────────

const INGREDIENT_DB: Record<string, IngredientProfile> = {
  // FATS
  'butter': {
    roles: ['fat', 'dairy', 'flavor'],
    cookingFunction: 'provides fat for tenderness, a creamy dairy flavor, and promotes browning (Maillard reaction)',
    substitutes: [
      { name: 'Coconut oil', ratio: '1:1', category: 'vegan', effect: 'Light coconut aroma; slightly denser result. Solid at room temp like butter.' },
      { name: 'Applesauce', ratio: '½ cup per 1 cup', category: 'healthier', effect: 'Slashes fat; adds natural moisture and mild sweetness. Expect chewier results.' },
      { name: 'Margarine', ratio: '1:1', category: 'pantry', effect: 'Nearly identical behavior in baking; slightly less complex flavor. Dairy-free.' },
      { name: 'Avocado (mashed)', ratio: '1:1', category: 'healthier', effect: 'Healthy monounsaturated fats; creates a dense, fudgy texture. Perfect for brownies.' },
    ],
    contextPriority: {
      dessert: { priority: ['Applesauce', 'Coconut oil', 'Avocado'], insight: 'For sweet baked goods, applesauce is the smartest swap — it cuts fat while keeping moisture high.' },
      bread: { priority: ['Margarine', 'Coconut oil'], insight: 'In bread dough, margarine gives you the closest structure without the dairy.' },
      savory: { priority: ['Margarine', 'Coconut oil'], insight: 'For savory cooking, any neutral fat works. Margarine is the most seamless swap.' },
    },
  },
  'margarine': {
    roles: ['fat'],
    cookingFunction: 'provides fat and moisture, functioning almost identically to butter in most recipes',
    substitutes: [
      { name: 'Butter', ratio: '1:1', category: 'perfect', effect: 'Richer, more complex flavor. Contains dairy.' },
      { name: 'Coconut oil', ratio: '1:1', category: 'vegan', effect: 'Solid at room temperature; light coconut aroma.' },
      { name: 'Vegetable shortening', ratio: '1:1', category: 'pantry', effect: 'Creates a flaky, tender texture. Neutral flavor, no dairy.' },
    ],
  },
  'oil': {
    roles: ['fat'],
    cookingFunction: 'provides liquid fat for moisture, tenderness, and a consistently moist crumb',
    substitutes: [
      { name: 'Melted butter', ratio: '1:1', category: 'perfect', effect: 'Richer flavor and golden color. Use melted and cooled to room temp.' },
      { name: 'Applesauce', ratio: '½ cup per 1 cup oil', category: 'healthier', effect: 'Cuts fat significantly; adds moisture. Best in muffins, cakes, quick breads.' },
      { name: 'Avocado (pureed)', ratio: '1:1', category: 'healthier', effect: 'Healthy fats and creamy texture. Great for brownies and chocolate bakes.' },
      { name: 'Greek yogurt', ratio: '¾ cup per 1 cup oil', category: 'healthier', effect: 'Adds protein and tang; keeps baked goods moist and tender.' },
    ],
  },
  'olive oil': {
    roles: ['fat', 'flavor'],
    cookingFunction: 'provides fat with a distinctive fruity, slightly peppery flavor that defines Mediterranean cooking',
    substitutes: [
      { name: 'Avocado oil', ratio: '1:1', category: 'healthier', effect: 'Neutral, high smoke point. No flavor change in cooked dishes.' },
      { name: 'Grapeseed oil', ratio: '1:1', category: 'perfect', effect: 'Very neutral flavor; high smoke point. Excellent all-purpose swap.' },
      { name: 'Butter (melted)', ratio: '1:1', category: 'pantry', effect: 'Richer, dairy flavor. Changes character in delicate Mediterranean dishes.' },
    ],
  },
  // SWEETENERS
  'sugar': {
    roles: ['sweetener'],
    cookingFunction: 'adds sweetness, triggers caramelization for color and flavor, and retains moisture to keep baked goods soft',
    substitutes: [
      { name: 'Honey', ratio: '¾ cup per 1 cup', category: 'healthier', effect: 'Sweeter than sugar; adds moisture and floral notes. Reduce other liquids by ¼ cup, lower oven 25°F.' },
      { name: 'Maple syrup', ratio: '¾ cup per 1 cup', category: 'healthier', effect: 'Distinct maple flavor; reduce other liquids slightly.' },
      { name: 'Coconut sugar', ratio: '1:1', category: 'healthier', effect: 'Lower glycemic index; deep caramel-like flavor. Near-direct swap.' },
      { name: 'Brown sugar', ratio: '1:1', category: 'pantry', effect: 'Adds molasses notes and extra moisture; slightly richer result.' },
    ],
    contextPriority: {
      dessert: { priority: ['Coconut sugar', 'Honey', 'Maple syrup'], insight: 'Coconut sugar is the most seamless dessert swap — same volume, richer caramel depth.' },
      bread: { priority: ['Honey', 'Maple syrup'], insight: 'Honey not only sweetens but actively feeds the yeast, improving rise and browning.' },
      savory: { priority: ['Brown sugar', 'Coconut sugar'], insight: 'In savory dishes, brown sugar adds complexity and balances acidity without sweetening the dish.' },
    },
  },
  'brown sugar': {
    roles: ['sweetener', 'flavor'],
    cookingFunction: 'adds sweetness plus molasses-caramel depth, extra moisture, and a soft, chewy texture',
    substitutes: [
      { name: 'White sugar + 1 tbsp molasses', ratio: '1 cup + 1 tbsp molasses', category: 'pantry', effect: 'This is literally how brown sugar is made. A perfect, exact replica.' },
      { name: 'Coconut sugar', ratio: '1:1', category: 'healthier', effect: 'Natural caramel flavor; slightly less sweet and darker color.' },
      { name: 'Maple syrup', ratio: '¾ cup per 1 cup', category: 'healthier', effect: 'Liquid substitute; reduce other liquids by 3 tbsp per cup used.' },
    ],
  },
  'powdered sugar': {
    roles: ['sweetener'],
    cookingFunction: 'adds sweetness and creates smooth, dissolve-instantly texture in frostings, glazes, and delicate pastries',
    substitutes: [
      { name: 'Blend granulated sugar + cornstarch', ratio: '1 cup sugar + 1 tsp cornstarch, blended 2 min', category: 'pantry', effect: 'DIY powdered sugar. Blend until fine powder. Works perfectly.' },
      { name: 'Coconut sugar (blended fine)', ratio: '1:1', category: 'healthier', effect: 'Blend until powdery. Produces a darker-colored frosting.' },
    ],
  },
  'honey': {
    roles: ['sweetener', 'liquid', 'flavor'],
    cookingFunction: 'sweetens with floral complexity, adds extra moisture, and has natural antimicrobial properties',
    substitutes: [
      { name: 'Maple syrup', ratio: '1:1', category: 'perfect', effect: 'Same consistency; different flavor (warm maple vs floral). Best 1:1 liquid swap.' },
      { name: 'Agave syrup', ratio: '1:1', category: 'vegan', effect: 'More neutral flavor; slightly thinner consistency. Works in most contexts.' },
      { name: 'Simple syrup (sugar + water)', ratio: '1¼ cup per 1 cup honey', category: 'pantry', effect: 'Less complex; no floral notes. Reduce other liquids slightly.' },
    ],
  },
  'maple syrup': {
    roles: ['sweetener', 'liquid', 'flavor'],
    cookingFunction: 'adds sweetness with a distinctive warm, caramel-maple flavor while providing liquid moisture',
    substitutes: [
      { name: 'Honey', ratio: '1:1', category: 'perfect', effect: 'Same texture; floral flavor instead of maple. Most seamless liquid swap.' },
      { name: 'Agave syrup', ratio: '1:1', category: 'vegan', effect: 'More neutral; slightly thinner. No maple flavor.' },
      { name: 'Golden syrup', ratio: '1:1', category: 'pantry', effect: 'Sweet and buttery with a mild caramel note. No maple flavor.' },
    ],
  },
  'coconut sugar': {
    roles: ['sweetener'],
    cookingFunction: 'adds sweetness with a deep caramel-butterscotch flavor and a slightly lower glycemic impact than white sugar',
    substitutes: [
      { name: 'Brown sugar', ratio: '1:1', category: 'perfect', effect: 'Very similar caramel notes. Slightly stickier and moister result.' },
      { name: 'Raw cane sugar (turbinado)', ratio: '1:1', category: 'pantry', effect: 'Less caramel flavor; larger crystals. Works in most recipes.' },
    ],
  },
  // LEAVENERS
  'baking powder': {
    roles: ['leavener'],
    cookingFunction: 'creates lift through CO2 bubbles released in two stages — once when wet, again when heated',
    substitutes: [
      { name: 'Baking soda + cream of tartar', ratio: '¼ tsp soda + ½ tsp cream of tartar per 1 tsp', category: 'perfect', effect: 'Chemically identical to baking powder. Acts in two stages just like baking powder.' },
      { name: 'Baking soda + lemon juice', ratio: '¼ tsp soda + ½ tsp lemon juice per 1 tsp', category: 'pantry', effect: 'Acts immediately; may leave a slight citrus tang in very delicate recipes.' },
      { name: 'Baking soda + plain yogurt', ratio: '¼ tsp soda per 1 tsp (replace ½ cup liquid with yogurt)', category: 'pantry', effect: 'Yogurt\'s lactic acid activates the soda. Adds slight tang.' },
    ],
  },
  'baking soda': {
    roles: ['leavener'],
    cookingFunction: 'creates powerful lift when paired with an acidic ingredient (buttermilk, yogurt, vinegar, lemon juice); also accelerates browning',
    substitutes: [
      { name: 'Baking powder', ratio: '3 tsp per 1 tsp baking soda', category: 'pantry', effect: 'Weaker; may result in slightly denser baked goods. Best when the recipe has no other acid.' },
      { name: 'Potassium bicarbonate', ratio: '1:1', category: 'healthier', effect: 'Sodium-free; identical leavening power. Reduce added salt slightly.' },
    ],
  },
  'yeast': {
    roles: ['leavener', 'flavor'],
    cookingFunction: 'leavens through fermentation, creating CO2 for rise AND generating complex flavor compounds — it does two jobs at once',
    substitutes: [
      { name: 'Sourdough starter', ratio: '½ cup per packet + reduce water by ¼ cup', category: 'perfect', effect: 'Fermentation-based; develops even more complex flavor. Much longer rise time.' },
      { name: 'Baking powder', ratio: '1 tsp per ¼ oz yeast packet', category: 'pantry', effect: 'Quick chemical leavener; gives rise without fermentation. Results in a quick-bread texture, not true bread.' },
      { name: 'Baking soda + acid', ratio: '½ tsp soda + ½ tsp vinegar', category: 'pantry', effect: 'Emergency substitute; creates immediate rise but zero fermentation flavor.' },
    ],
  },
  // EGGS
  'eggs': {
    roles: ['egg', 'binder', 'protein', 'liquid', 'fat'],
    cookingFunction: 'simultaneously binds ingredients, provides structure, creates lift (when beaten), adds richness and emulsification — a uniquely multifunctional ingredient',
    substitutes: [
      { name: 'Flax egg (1 tbsp ground flax + 3 tbsp water)', ratio: '1 per egg', category: 'vegan', effect: 'Earthy flavor; excellent binder. Let sit 5 min. Best in dense baked goods like cookies and brownies.' },
      { name: 'Chia egg (1 tbsp chia + 3 tbsp water)', ratio: '1 per egg', category: 'vegan', effect: 'Neutral flavor; reliable binder. Let sit 5 min. Adds tiny, visible specks.' },
      { name: 'Aquafaba (chickpea brine)', ratio: '3 tbsp per egg', category: 'vegan', effect: 'Whips into meringue-like foam. Best for airy cakes, mousse, and macarons.' },
      { name: 'Unsweetened applesauce', ratio: '¼ cup per egg', category: 'pantry', effect: 'Adds moisture and mild sweetness. Best for muffins, quick breads, and brownies.' },
    ],
    contextPriority: {
      dessert: { priority: ['Aquafaba', 'Flax egg', 'applesauce'], insight: 'For light, airy desserts, aquafaba is exceptional — it actually whips to peaks for mousses and macarons.' },
      bread: { priority: ['Flax egg', 'Chia egg'], insight: 'For bread, a flax egg provides reliable binding power with a mild, wholesome flavor.' },
      savory: { priority: ['Flax egg', 'Chia egg'], insight: 'In savory bakes, flax or chia egg binds without altering the flavor profile.' },
    },
  },
  // DAIRY
  'milk': {
    roles: ['dairy', 'liquid'],
    cookingFunction: 'provides hydration, subtle richness from milk proteins and fat, and helps develop browning in baked goods',
    substitutes: [
      { name: 'Oat milk', ratio: '1:1', category: 'vegan', effect: 'Closest to dairy in consistency and mild sweetness. Works in nearly everything.' },
      { name: 'Almond milk', ratio: '1:1', category: 'vegan', effect: 'Lighter and thinner; mild nutty flavor. Best in cakes and pancakes.' },
      { name: 'Soy milk', ratio: '1:1', category: 'vegan', effect: 'Highest protein of plant milks. Behaves most like dairy in baking.' },
      { name: 'Coconut milk', ratio: '1:1', category: 'vegan', effect: 'Richer and creamier; adds coconut flavor. Best in custards, curries, and tropical desserts.' },
    ],
    contextPriority: {
      dessert: { priority: ['Oat milk', 'Coconut milk'], insight: 'For sweet recipes, oat milk\'s natural sweetness and creamy body makes it the most seamless choice.' },
      savory: { priority: ['Oat milk', 'Soy milk'], insight: 'In savory dishes, use unsweetened oat or soy milk to avoid any unintended sweetness.' },
      bread: { priority: ['Oat milk', 'Soy milk'], insight: 'Oat milk\'s richness helps bread brown beautifully and gives a tender crumb.' },
    },
  },
  'buttermilk': {
    roles: ['dairy', 'liquid', 'acid'],
    cookingFunction: 'adds moisture, tangy acidity that tenderizes gluten, and activates baking soda for extra lift',
    substitutes: [
      { name: 'Milk + 1 tbsp lemon juice (let sit 5 min)', ratio: '1 cup milk + 1 tbsp lemon', category: 'pantry', effect: 'DIY buttermilk. The acid curdles the milk, replicating the tang and activation power.' },
      { name: 'Plain yogurt (thinned with water)', ratio: '1:1', category: 'perfect', effect: 'Same acidity and tang. Thin to milk consistency with a splash of water.' },
      { name: 'Kefir', ratio: '1:1', category: 'perfect', effect: 'Naturally tangy and acidic; functionally identical to buttermilk.' },
      { name: 'Sour cream (thinned)', ratio: '1:1', category: 'pantry', effect: 'Very similar tang and fat content. Thin with milk or water to pouring consistency.' },
    ],
  },
  'heavy cream': {
    roles: ['dairy', 'fat', 'liquid'],
    cookingFunction: 'adds richness and creaminess; can be whipped into airy peaks or reduced into silky, thick sauces',
    substitutes: [
      { name: 'Coconut cream', ratio: '1:1', category: 'vegan', effect: 'Rich and thick; adds tropical coconut note. Whips beautifully when chilled overnight.' },
      { name: 'Cashew cream', ratio: '1:1', category: 'vegan', effect: 'Blend soaked cashews with water. Completely neutral, silky smooth.' },
      { name: 'Half-and-half + butter', ratio: '⅞ cup + 1 tbsp butter per cup', category: 'pantry', effect: 'Matches fat content of heavy cream. Works in most cooked dishes (won\'t whip).' },
      { name: 'Evaporated milk', ratio: '1:1', category: 'pantry', effect: 'Lower fat; good for sauces but won\'t whip into peaks.' },
    ],
    contextPriority: {
      dessert: { priority: ['Coconut cream', 'Cashew cream'], insight: 'Chilled coconut cream whips into beautiful peaks — a stunning, dairy-free replacement in desserts.' },
      savory: { priority: ['Cashew cream', 'Half-and-half + butter'], insight: 'Cashew cream is entirely neutral and silky — invisible in savory sauces.' },
    },
  },
  'sour cream': {
    roles: ['dairy', 'fat', 'acid'],
    cookingFunction: 'adds tangy richness and fat while activating leaveners and tenderizing gluten for soft, moist results',
    substitutes: [
      { name: 'Plain Greek yogurt', ratio: '1:1', category: 'healthier', effect: 'Same tang and acidity with more protein and less fat. Works perfectly.' },
      { name: 'Full-fat plain yogurt', ratio: '1:1', category: 'perfect', effect: 'Almost identical — slightly thinner but same tang and fat content.' },
      { name: 'Crème fraîche', ratio: '1:1', category: 'perfect', effect: 'Richer and slightly less tangy. Very close result.' },
      { name: 'Coconut cream + 1 tbsp lemon juice', ratio: '1 cup cream + 1 tbsp lemon', category: 'vegan', effect: 'Tangy, rich, dairy-free. Very close to sour cream in behavior.' },
    ],
  },
  'cream cheese': {
    roles: ['dairy', 'fat', 'flavor'],
    cookingFunction: 'adds rich, tangy creaminess and thick structure to frostings, cheesecakes, and fillings',
    substitutes: [
      { name: 'Mascarpone', ratio: '1:1', category: 'perfect', effect: 'Richer and less tangy. Excellent in cheesecakes and cream cheese frostings.' },
      { name: 'Ricotta (strained overnight)', ratio: '1:1', category: 'healthier', effect: 'Lighter and slightly grainy. Strain overnight in a cheesecloth for best texture.' },
      { name: 'Greek yogurt (strained)', ratio: '1:1', category: 'healthier', effect: 'Very tangy; lower fat. Strain for 2+ hours to thicken.' },
      { name: 'Cashew cream cheese', ratio: '1:1', category: 'vegan', effect: 'Blend soaked cashews, lemon juice, and a pinch of salt. Smooth and tangy.' },
    ],
  },
  'yogurt': {
    roles: ['dairy', 'fat', 'acid'],
    cookingFunction: 'adds moisture, protein, and a slight tang that tenderizes gluten and activates leaveners',
    substitutes: [
      { name: 'Sour cream', ratio: '1:1', category: 'perfect', effect: 'Same tang and fat content. The most seamless swap.' },
      { name: 'Buttermilk', ratio: '1:1', category: 'pantry', effect: 'Thinner; same acidity. May need to reduce other liquids slightly.' },
      { name: 'Kefir', ratio: '1:1', category: 'perfect', effect: 'Liquid but same probiotic tang and acidity.' },
      { name: 'Coconut yogurt', ratio: '1:1', category: 'vegan', effect: 'Same consistency; adds a subtle coconut flavor.' },
    ],
  },
  'condensed milk': {
    roles: ['dairy', 'sweetener', 'liquid'],
    cookingFunction: 'provides intense sweetness and creamy dairy richness in a concentrated, thick form',
    substitutes: [
      { name: 'Coconut condensed milk', ratio: '1:1', category: 'vegan', effect: 'Same thick sweetness; adds a subtle coconut note. Widely available.' },
      { name: 'Evaporated milk + sugar (simmered)', ratio: '½ cup evap milk + ½ cup sugar (simmer until thick)', category: 'pantry', effect: 'DIY condensed milk. Cook down until thick and caramel-like.' },
    ],
  },
  // FLOURS
  'flour': {
    roles: ['flour'],
    cookingFunction: 'provides structure through gluten network formation when mixed with liquid — the structural backbone of most baked goods',
    substitutes: [
      { name: 'Bread flour', ratio: '1:1', category: 'perfect', effect: 'Higher protein → stronger gluten → chewier, more structured result.' },
      { name: 'Whole wheat flour', ratio: '½ cup per 1 cup', category: 'healthier', effect: 'Nutty, denser. Substitute max half for the best balance of nutrition and texture.' },
      { name: 'Almond flour', ratio: '1:1', category: 'healthier', effect: 'Gluten-free, moist, nutty. May need an extra egg for binding.' },
      { name: 'Oat flour', ratio: '1:1', category: 'pantry', effect: 'Blend oats until fine. Mild, slightly sweet. Slightly denser crumb.' },
    ],
    contextPriority: {
      dessert: { priority: ['Almond flour', 'Cake flour', 'Oat flour'], insight: 'For delicate desserts, almond flour adds moisture and a nutty depth; cake flour gives the lightest crumb.' },
      bread: { priority: ['Bread flour', 'Whole wheat flour'], insight: 'Bread flour\'s high protein provides the strong gluten structure this recipe needs.' },
      savory: { priority: ['Oat flour', 'Almond flour'], insight: 'In savory dishes, oat flour blends in seamlessly and adds a hearty, wholesome texture.' },
    },
  },
  'all-purpose flour': {
    roles: ['flour'],
    cookingFunction: 'provides medium-protein gluten structure — the versatile workhorse of baking that balances structure and tenderness',
    substitutes: [
      { name: 'Bread flour', ratio: '1:1', category: 'perfect', effect: 'Higher protein → chewier, stronger crumb. Best for breads and pizza.' },
      { name: 'Cake flour', ratio: '1 cup + 2 tbsp per 1 cup', category: 'perfect', effect: 'Lower protein → lighter, more tender crumb. Best for cakes and muffins.' },
      { name: 'Almond flour', ratio: '1:1', category: 'healthier', effect: 'Gluten-free; dense and moist. Add 1 extra egg for structure.' },
      { name: 'Oat flour', ratio: '1:1', category: 'healthier', effect: 'Blend rolled oats fine. Slightly sweet and dense. Certified GF available.' },
    ],
    contextPriority: {
      dessert: { priority: ['Cake flour', 'Almond flour'], insight: 'Cake flour gives a lighter, more delicate crumb — the ideal choice for this sweet recipe.' },
      bread: { priority: ['Bread flour', 'Whole wheat flour'], insight: 'Bread flour provides superior structure and chew for any yeast-based recipe.' },
    },
  },
  'cornstarch': {
    roles: ['starch', 'thickener'],
    cookingFunction: 'thickens sauces and custards to a silky consistency; lightens cakes when mixed with flour by diluting gluten',
    substitutes: [
      { name: 'Arrowroot powder', ratio: '1:1', category: 'vegan', effect: 'Clear, glossy finish; works at lower temps. Better for acidic sauces.' },
      { name: 'Tapioca starch', ratio: '1:1', category: 'vegan', effect: 'Slightly chewy, glossy. Great in pie fillings and puddings.' },
      { name: 'All-purpose flour', ratio: '2 tbsp per 1 tbsp cornstarch', category: 'pantry', effect: 'Creates an opaque, less glossy result. Standard thickener for gravies.' },
      { name: 'Potato starch', ratio: '1:1', category: 'pantry', effect: 'Very effective thickener; neutral flavor. Don\'t boil too long or it breaks down.' },
    ],
  },
  // CHOCOLATE & COCOA
  'cocoa powder': {
    roles: ['cocoa', 'flavor'],
    cookingFunction: 'provides intense bitter chocolate flavor and dark, rich color; also acts as a mild acidifier in baking',
    substitutes: [
      { name: 'Carob powder', ratio: '1:1', category: 'vegan', effect: 'Naturally sweet, caffeine-free. Similar dark color. Mellower, less bitter — almost caramel-like.' },
      { name: 'Dutch-process cocoa', ratio: '1:1', category: 'perfect', effect: 'Darker, richer, and less acidic than regular cocoa. Gives a deeper color and intense chocolate hit.' },
      { name: 'Melted dark chocolate', ratio: '2 tbsp per 1 tbsp cocoa (reduce fat by 1 tbsp)', category: 'perfect', effect: 'More complex chocolate flavor. Adds fat — reduce butter/oil by ~1 tbsp per 2 tbsp chocolate.' },
      { name: 'Cacao powder (raw)', ratio: '1:1', category: 'healthier', effect: 'Unprocessed version; more antioxidants. Slightly more bitter and astringent.' },
    ],
    contextPriority: {
      dessert: { priority: ['Dutch-process cocoa', 'Carob powder', 'Melted dark chocolate'], insight: 'For sweet baked goods, Dutch-process cocoa gives the deepest, richest chocolate color and flavor.' },
      savory: { priority: ['Carob powder'], insight: 'In savory recipes, carob\'s natural sweetness balances better than intensely bitter cocoa.' },
    },
  },
  'chocolate': {
    roles: ['chocolate', 'fat', 'sweetener', 'flavor'],
    cookingFunction: 'provides chocolate flavor, fat for richness and texture, and sweetness all in one ingredient',
    substitutes: [
      { name: 'Cocoa powder + oil + sugar', ratio: '3 tbsp cocoa + 1 tbsp oil + 2 tbsp sugar per 1 oz', category: 'pantry', effect: 'Perfect for baking — you\'re simply reconstituting all of chocolate\'s components separately.' },
      { name: 'Carob chips', ratio: '1:1', category: 'vegan', effect: 'Caffeine-free; naturally sweeter with a distinct earthy, caramel-like flavor.' },
      { name: 'Dark chocolate (70%+)', ratio: '1:1', category: 'healthier', effect: 'Higher antioxidants; less sugar. Slightly more bitter — reduce added sugar.' },
    ],
  },
  'dark chocolate': {
    roles: ['chocolate', 'fat', 'flavor'],
    cookingFunction: 'provides intense bittersweet chocolate flavor with high cocoa butter for melt-in-mouth richness',
    substitutes: [
      { name: 'Unsweetened chocolate + sugar', ratio: '1 oz + 2 tsp sugar per oz of dark chocolate', category: 'pantry', effect: 'Exact flavor recreation. Adjust sugar to match the darkness of your chocolate.' },
      { name: 'Cocoa powder + fat', ratio: '3 tbsp cocoa + 1 tbsp butter per oz', category: 'pantry', effect: 'Works in baked goods; missing the solid chocolate texture.' },
      { name: 'Carob bar (dark)', ratio: '1:1', category: 'vegan', effect: 'Caffeine-free; naturally sweeter and less bitter.' },
    ],
  },
  'chocolate chips': {
    roles: ['chocolate', 'fat', 'sweetener'],
    cookingFunction: 'provides bursts of chocolate flavor and a melty texture throughout baked goods',
    substitutes: [
      { name: 'Chopped dark chocolate bar', ratio: '1:1', category: 'perfect', effect: 'Better quality chocolate; creates bigger, puddly chocolate pockets.' },
      { name: 'Carob chips', ratio: '1:1', category: 'vegan', effect: 'Caffeine-free, dairy-free. Sweeter with a caramel-chocolate flavor.' },
      { name: 'Cacao nibs', ratio: '1:1', category: 'healthier', effect: 'Intense, slightly bitter chocolate crunch. Much less sweet — adjust recipe sugar.' },
    ],
  },
  // ACIDS
  'lemon juice': {
    roles: ['acid', 'flavor'],
    cookingFunction: 'adds bright citrus acidity, enhances all other flavors, prevents browning, and activates baking soda',
    substitutes: [
      { name: 'Lime juice', ratio: '1:1', category: 'perfect', effect: 'Same acidity; slightly more tropical citrus flavor.' },
      { name: 'Apple cider vinegar', ratio: '½ tsp per 1 tsp lemon juice', category: 'pantry', effect: 'More acidic; mild fruity note. Use half the amount.' },
      { name: 'White wine vinegar', ratio: '½ tsp per 1 tsp', category: 'pantry', effect: 'Sharp, clean acidity. Barely noticeable in cooked applications.' },
      { name: 'Cream of tartar', ratio: '½ tsp per 1 tbsp lemon juice', category: 'perfect', effect: 'Pure acid; zero flavor impact. Best when you need the chemical reaction but not the citrus taste.' },
    ],
  },
  // SPICES & FLAVORS
  'vanilla': {
    roles: ['flavor'],
    cookingFunction: 'enhances sweetness perception and adds warm, floral complexity that rounds out all other flavors',
    substitutes: [
      { name: 'Vanilla bean paste', ratio: '1:1', category: 'perfect', effect: 'More complex and intense; contains visible seeds for a premium appearance.' },
      { name: 'Vanilla bean (scraped)', ratio: '1 bean per 1 tsp extract', category: 'perfect', effect: 'Strongest, most complex vanilla flavor. Beautiful visible seeds.' },
      { name: 'Almond extract', ratio: '½ tsp per 1 tsp vanilla', category: 'pantry', effect: 'Much more intense; use half. Adds a marzipan-like note. Pairs beautifully with chocolate.' },
      { name: 'Maple syrup', ratio: '1 tsp per 1 tsp', category: 'pantry', effect: 'Caramel-sweetness instead of floral vanilla. Works in most bakes.' },
    ],
  },
  'vanilla extract': {
    roles: ['flavor'],
    cookingFunction: 'adds warm, floral vanilla flavor and subtly enhances the sweetness of everything it touches',
    substitutes: [
      { name: 'Vanilla bean paste', ratio: '1:1', category: 'perfect', effect: 'Stronger and more complex; adds visible vanilla specks.' },
      { name: 'Vanilla powder', ratio: '½ tsp per 1 tsp extract', category: 'perfect', effect: 'Concentrated; alcohol-free. Works in both wet and dry applications.' },
      { name: 'Almond extract', ratio: '½ tsp per 1 tsp', category: 'pantry', effect: 'Much stronger profile — use half. Pairs beautifully with cherry and chocolate.' },
    ],
  },
  'cinnamon': {
    roles: ['spice', 'flavor'],
    cookingFunction: 'adds warm, sweet, slightly spicy complexity and the signature warmth associated with baked goods',
    substitutes: [
      { name: 'Allspice', ratio: '¼ tsp per ½ tsp cinnamon', category: 'pantry', effect: 'Covers cinnamon\'s warm notes plus clove and nutmeg undertones.' },
      { name: 'Nutmeg + pinch of cloves', ratio: '½ tsp combined per 1 tsp cinnamon', category: 'pantry', effect: 'Replicates the warm spice complexity from multiple angles.' },
      { name: 'Cardamom', ratio: '¼ tsp per 1 tsp cinnamon', category: 'pantry', effect: 'Floral, citrusy warmth. Use sparingly — it\'s stronger than cinnamon.' },
    ],
  },
  'salt': {
    roles: ['salt', 'flavor'],
    cookingFunction: 'enhances every other flavor in the recipe, balances sweetness, and strengthens the gluten structure in bread',
    substitutes: [
      { name: 'Sea salt', ratio: '1:1', category: 'perfect', effect: 'Identical saltiness; subtle mineral complexity. A direct swap.' },
      { name: 'Kosher salt', ratio: '1½ tsp per 1 tsp table salt', category: 'pantry', effect: 'Larger, less dense flakes. Use 50% more by volume to match saltiness.' },
      { name: 'Himalayan pink salt', ratio: '1:1', category: 'healthier', effect: 'Trace minerals; same saltiness. Negligible flavor difference in cooked food.' },
    ],
  },
  // NUTS & SEEDS
  'tahini': {
    roles: ['nut', 'fat', 'flavor'],
    cookingFunction: 'adds rich sesame flavor, creamy fat, and a pleasant bitterness that balances both sweet and savory dishes',
    substitutes: [
      { name: 'Sunflower seed butter', ratio: '1:1', category: 'vegan', effect: 'Nut-free; milder, slightly sweeter flavor. Same creamy texture.' },
      { name: 'Cashew butter', ratio: '1:1', category: 'vegan', effect: 'Mild, creamy, neutral. Missing the sesame flavor but same consistency.' },
      { name: 'Almond butter', ratio: '1:1', category: 'vegan', effect: 'Slightly grainy with nutty sweetness. Changes flavor profile considerably.' },
    ],
  },
  'peanut butter': {
    roles: ['nut', 'fat', 'flavor', 'protein'],
    cookingFunction: 'adds intense nutty flavor, thick creamy texture, healthy fat, and protein',
    substitutes: [
      { name: 'Almond butter', ratio: '1:1', category: 'perfect', effect: 'Milder, slightly more complex nuttiness. Same creamy consistency.' },
      { name: 'Sunflower seed butter', ratio: '1:1', category: 'vegan', effect: 'Nut-free alternative; mild, slightly earthy flavor.' },
      { name: 'Cashew butter', ratio: '1:1', category: 'vegan', effect: 'Creamier and milder. Less intense but same fat content.' },
    ],
  },
  // SPECIALTY
  'biscuit': {
    roles: ['flour', 'starch', 'fat'],
    cookingFunction: 'provides the crumbly, sweet, slightly buttery base structure and texture in no-bake recipes',
    substitutes: [
      { name: 'Graham crackers (crushed)', ratio: '1:1', category: 'pantry', effect: 'Similar crumbly-sweet base with honey notes.' },
      { name: 'Digestive biscuits', ratio: '1:1', category: 'pantry', effect: 'Classic choice; slightly more buttery and substantial.' },
      { name: 'Oat cookies', ratio: '1:1', category: 'healthier', effect: 'Heartier texture with more fiber and nuttiness.' },
    ],
  },
  'dates': {
    roles: ['sweetener', 'fruit', 'flavor'],
    cookingFunction: 'provides natural caramel sweetness, sticky binding, and a chewy, fudgy texture that sugar alone can\'t replicate',
    substitutes: [
      { name: 'Prunes (pitted)', ratio: '1:1', category: 'perfect', effect: 'Similar sticky-sweet texture and rich, deep flavor. Near-perfect swap.' },
      { name: 'Raisins (soaked)', ratio: '1:1', category: 'pantry', effect: 'Smaller; sweeter. Soak in warm water for 15 min to soften first.' },
      { name: 'Dried figs', ratio: '1:1', category: 'pantry', effect: 'Slightly seedier texture; similar deep sweetness and chewy body.' },
    ],
  },
  'desiccated coconut': {
    roles: ['flavor', 'fat'],
    cookingFunction: 'adds chewy texture, natural sweetness, and tropical coconut flavor throughout the recipe',
    substitutes: [
      { name: 'Shredded coconut', ratio: '1:1', category: 'perfect', effect: 'Longer strands; same flavor. Pulse in blender for a finer result.' },
      { name: 'Toasted oats (fine)', ratio: '1:1', category: 'pantry', effect: 'Adds chew and mild sweetness without the coconut flavor.' },
      { name: 'Ground almonds', ratio: '1:1', category: 'healthier', effect: 'Adds nuttiness and a similar dry, crumbly texture.' },
    ],
  },
  'applesauce': {
    roles: ['fruit', 'liquid', 'sweetener'],
    cookingFunction: 'adds natural moisture, mild sweetness, and acts as a fat replacer through its natural pectin and water content',
    substitutes: [
      { name: 'Mashed ripe banana', ratio: '1:1', category: 'perfect', effect: 'Same moisture and binding; stronger, more noticeable banana flavor.' },
      { name: 'Pumpkin puree', ratio: '1:1', category: 'pantry', effect: 'Earthy, mildly sweet. Excellent in spiced bakes and muffins.' },
      { name: 'Mashed sweet potato', ratio: '1:1', category: 'pantry', effect: 'Rich, naturally sweet. Dense texture. Great in chocolate and spiced recipes.' },
    ],
  },
  'gelatin': {
    roles: ['thickener', 'binder'],
    cookingFunction: 'sets liquids into a firm, sliceable gel by forming a protein network as it cools',
    substitutes: [
      { name: 'Agar agar', ratio: '1 tsp per 1 tbsp gelatin', category: 'vegan', effect: 'Plant-based gelling agent. Sets firmer and more opaque. Use less.' },
      { name: 'Pectin', ratio: 'Follow package ratio', category: 'vegan', effect: 'Fruit-derived; best for jams and fruit-based gels. Requires sugar to activate.' },
      { name: 'Arrowroot powder', ratio: '2 tsp per 1 tbsp gelatin', category: 'vegan', effect: 'Creates a softer gel. Best for custards and puddings, not firm molds.' },
    ],
  },
};

// ─── Role inference for unknown ingredients ──────────────────────────────────

function inferRoles(name: string): Role[] {
  const n = name.toLowerCase();
  if (/cocoa|cacao|chocolate|carob/i.test(n)) return ['cocoa', 'flavor'];
  if (/flour|powder\b/i.test(n) && !/cocoa|cacao|baking|spice/i.test(n)) return ['flour'];
  if (/sugar|syrup|honey|molasses|agave|nectar/i.test(n)) return ['sweetener'];
  if (/\boil\b|fat\b|lard|shortening/i.test(n)) return ['fat'];
  if (/milk|cream\b|butter(?:milk)?/i.test(n) && !/peanut|almond|cocoa/i.test(n)) return ['dairy', 'liquid'];
  if (/\begg|whites|yolks/i.test(n)) return ['egg', 'binder'];
  if (/extract|essence|vanilla|cinnamon|cardamom|zest/i.test(n)) return ['flavor'];
  if (/baking powder|baking soda|bicarbonate|yeast/i.test(n)) return ['leavener'];
  if (/\bsalt\b|kosher|himalayan/i.test(n)) return ['salt'];
  if (/vinegar|lemon juice|lime juice/i.test(n)) return ['acid'];
  if (/nut|almond|cashew|walnut|pecan|pistachio|hazelnut|peanut|seed|tahini/i.test(n)) return ['nut', 'fat'];
  if (/starch|gelatin|agar|arrowroot|tapioca|pectin|xanthan/i.test(n)) return ['thickener', 'starch'];
  if (/chicken|beef|pork|fish|salmon|tuna|tofu|tempeh|lentil|bean/i.test(n)) return ['protein'];
  if (/cheese|yogurt|kefir|quark|ricotta|mascarpone|curd/i.test(n)) return ['dairy'];
  if (/fruit|berry|apple|banana|mango|peach|cherry|grape|plum|fig/i.test(n)) return ['fruit'];
  if (/herb|basil|oregano|thyme|rosemary|mint|parsley|cilantro|dill/i.test(n)) return ['herb'];
  if (/spice|pepper|cumin|paprika|turmeric|ginger|clove|nutmeg|cardamom|saffron/i.test(n)) return ['spice'];
  if (/butter\b/i.test(n)) return ['fat', 'dairy', 'flavor'];
  return [];
}

// ─── Context detection ────────────────────────────────────────────────────────

function detectContext(recipe?: Recipe): RecipeContext {
  if (!recipe) return 'general';
  const category = (recipe.category ?? '').toLowerCase();
  const title    = (recipe.title ?? '').toLowerCase();
  const ingNames = recipe.ingredients.map((i) => i.name.toLowerCase()).join(' ');

  if (['cookies', 'cake', 'pastry', 'dessert', 'drinks'].some((c) => category.includes(c))) return 'dessert';
  if (category === 'bread') return 'bread';
  if (category === 'savory') return 'savory';
  if (/cake|cookie|muffin|brownie|tart|pie|cupcake|biscuit|dessert|sweet|truffle|ball|bars?|fudge/i.test(title)) return 'dessert';
  if (/bread|loaf|baguette|focaccia|sourdough|roll|brioche|pita/i.test(title)) return 'bread';
  if (/soup|stew|pasta|curry|roast|grill|chicken|beef|pork|fish|shrimp|salad|sauce/i.test(title)) return 'savory';
  if (/vanilla|chocolate|cocoa|sugar|confection|cream/i.test(ingNames)) return 'dessert';
  if (/yeast|bread flour|sourdough/i.test(ingNames)) return 'bread';
  return 'general';
}

// ─── Chef's Note generator ────────────────────────────────────────────────────

function generateChefNote(
  ingredientName: string,
  profile: IngredientProfile,
  context: RecipeContext,
  recipeTitle: string
): string {
  const displayName = ingredientName.charAt(0).toUpperCase() + ingredientName.slice(1);
  const recipeRef = recipeTitle && recipeTitle !== 'My Recipe'
    ? `In your **${recipeTitle}**`
    : `In this recipe`;

  const primaryRole = profile.roles[0];
  const roleFn = ROLE_FUNCTIONS[primaryRole] ?? 'its unique properties';

  const contextNote = profile.contextPriority?.[context]?.insight ?? '';

  return `${recipeRef}, ${displayName} ${profile.cookingFunction}. When substituting, your priority is preserving ${roleFn}.${contextNote ? ' ' + contextNote : ''}`;
}

// ─── Ingredient lookup ────────────────────────────────────────────────────────

function findProfile(name: string): { profile: IngredientProfile; key: string } | null {
  const lower = name.toLowerCase().trim();

  // 1. Exact match
  if (INGREDIENT_DB[lower]) return { profile: INGREDIENT_DB[lower], key: lower };

  // 2. Aliases
  const ALIASES: Record<string, string> = {
    'egg': 'eggs', 'large egg': 'eggs', 'medium egg': 'eggs',
    'vegetable oil': 'oil', 'canola oil': 'oil', 'sunflower oil': 'oil',
    'olive oil': 'olive oil',
    'all purpose flour': 'all-purpose flour',
    'plain flour': 'all-purpose flour',
    'corn starch': 'cornstarch', 'corn flour': 'cornstarch',
    'vanilla essence': 'vanilla extract',
    'bitter chocolate': 'dark chocolate',
    'bittersweet chocolate': 'dark chocolate',
    'semisweet chocolate': 'dark chocolate',
    'heavy whipping cream': 'heavy cream', 'whipping cream': 'heavy cream',
    'double cream': 'heavy cream',
    'cocoa': 'cocoa powder', 'cacao powder': 'cocoa powder',
    'unsweetened cocoa': 'cocoa powder',
    'white sugar': 'sugar', 'granulated sugar': 'sugar', 'caster sugar': 'sugar',
    'sea salt': 'salt', 'kosher salt': 'salt', 'table salt': 'salt',
    'dried coconut': 'desiccated coconut', 'coconut flakes': 'desiccated coconut',
    'cream': 'heavy cream',
    'plain yogurt': 'yogurt', 'greek yogurt': 'yogurt',
    'whole milk': 'milk', 'skim milk': 'milk', 'semi-skimmed milk': 'milk',
  };
  if (ALIASES[lower]) return findProfile(ALIASES[lower]);

  // 3. Partial match (ingredient name contains a DB key or vice versa)
  const partialKey = Object.keys(INGREDIENT_DB).find(
    (k) => (lower.includes(k) && k.length > 3) || (k.includes(lower) && lower.length > 3)
  );
  if (partialKey) return { profile: INGREDIENT_DB[partialKey], key: partialKey };

  // 4. Role inference fallback
  const inferredRoles = inferRoles(lower);
  if (inferredRoles.length > 0) {
    const primaryRole = inferredRoles[0];
    return {
      profile: {
        roles: inferredRoles,
        cookingFunction: `provides ${ROLE_FUNCTIONS[primaryRole] ?? 'its unique properties'} in this recipe`,
        substitutes: ROLE_FALLBACKS[primaryRole] ?? [],
      },
      key: lower,
    };
  }

  return null;
}

// ─── Hebrew translation ───────────────────────────────────────────────────────

function translateIngredient(raw: string): string {
  const trimmed = raw.trim();
  if (HEBREW_TO_ENGLISH[trimmed]) return HEBREW_TO_ENGLISH[trimmed];
  const hebrewKey = Object.keys(HEBREW_TO_ENGLISH).find(
    (k) => trimmed.includes(k) || k.includes(trimmed)
  );
  if (hebrewKey) return HEBREW_TO_ENGLISH[hebrewKey];
  return trimmed.toLowerCase();
}

// ─── Context-aware ordering ───────────────────────────────────────────────────

function applyContextOrder(
  subs: SubstituteOption[],
  profile: IngredientProfile,
  context: RecipeContext
): SubstituteOption[] {
  const priority = profile.contextPriority?.[context]?.priority;
  if (!priority) return subs;
  return [...subs].sort((a, b) => {
    const ai = priority.findIndex((p) => a.name.toLowerCase().includes(p.toLowerCase()));
    const bi = priority.findIndex((p) => b.name.toLowerCase().includes(p.toLowerCase()));
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getContextAwareSubstitutes(
  ingredientName: string,
  recipe?: Recipe
): SubstituteResult {
  const englishName = translateIngredient(ingredientName);
  const context     = detectContext(recipe);
  const recipeTitle = recipe?.title ?? 'My Recipe';

  const found = findProfile(englishName);

  if (!found) {
    return {
      substitutes: [
        {
          name: 'No specific substitutes found',
          ratio: '—',
          category: 'pantry',
          effect: 'This ingredient may be uniquely essential. Try searching for a specific substitute online.',
        },
      ],
      chefNote: `This ingredient is hard to classify, so substituting may significantly change the recipe. When in doubt, try to find the original or look for a specialized recipe that accounts for its absence.`,
    };
  }

  const ordered = applyContextOrder(found.profile.substitutes, found.profile, context);
  const chefNote = generateChefNote(englishName, found.profile, context, recipeTitle);

  return { substitutes: ordered, chefNote };
}

// Legacy alias (keep for any direct calls)
export const getSubstitutes = (name: string) => getContextAwareSubstitutes(name);
