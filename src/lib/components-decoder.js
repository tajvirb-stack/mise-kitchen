// Component decoder — when an ingredient mentions a HelloFresh-only component,
// this provides the from-scratch recipe with substitution instructions.
// Match is case-insensitive substring match against ingredient names.

export const COMPONENT_RECIPES = {
  // ============ SAUCES ============
  'tomato sauce base': {
    name: 'Tomato Sauce Base',
    quickSub: '2 tbsp = 2 tbsp tomato paste mixed with 2 tbsp water + ¼ tsp salt + ¼ tsp sugar',
    ingredients: [
      '2 tbsp tomato paste',
      '2 tbsp water',
      '¼ tsp salt',
      '¼ tsp sugar'
    ],
    method: 'Just whisk together. That\'s it. (HelloFresh\'s "tomato sauce base" is essentially a concentrated, pre-seasoned tomato paste.)',
    storeNote: 'Or use 2 tbsp tomato passata reduced for 5 min. Or 2 tbsp marinara sauce simmered down.'
  },

  'tex-mex paste': {
    name: 'Tex-Mex Paste',
    quickSub: 'Mix tomato paste + chipotle in adobo + cumin + smoked paprika + cocoa powder',
    ingredients: [
      '1 small yellow onion, finely chopped',
      '4 garlic cloves, minced',
      '2 tbsp olive oil',
      '1 (14 oz) can fire-roasted diced tomatoes (or regular)',
      '2 tbsp tomato paste',
      '2 chipotle peppers in adobo + 1 tsp adobo sauce',
      '1 tbsp chili powder',
      '1 tsp ground cumin',
      '1 tsp smoked paprika',
      '1 tsp unsweetened cocoa powder (the secret ingredient)',
      '1 tbsp rice vinegar',
      '1 tsp honey or brown sugar',
      '½ tsp salt'
    ],
    method: 'Sauté onion in oil 4 min until soft. Add garlic, 30 sec. Add everything else, simmer 15 min on medium-low. Blend smooth. Cool, jar it. Makes ~1 cup. Lasts 1 week fridge / 3 months frozen in ice cube trays.',
    storeNote: 'Quick version: 2 tbsp tomato paste + 1 chopped chipotle in adobo + ½ tsp each of cumin, chili powder, smoked paprika, cocoa powder. Whisk together.'
  },

  'tikka sauce': {
    name: 'Tikka Sauce',
    quickSub: 'Buy a jar of Patak\'s Tikka Masala Sauce — closest match',
    ingredients: [
      '2 tbsp butter or ghee',
      '1 small onion, minced',
      '2 tbsp ginger-garlic puree',
      '1 tbsp garam masala',
      '1 tsp ground cumin',
      '1 tsp ground coriander',
      '½ tsp turmeric',
      '½ tsp cayenne (adjust)',
      '1 (14 oz) can crushed or fire-roasted tomatoes',
      '2 tbsp tomato paste',
      '½ cup heavy cream',
      '1 tsp sugar, salt to taste'
    ],
    method: 'Melt butter, sauté onion 5 min. Add ginger-garlic + spices, 1 min. Add tomatoes + paste, simmer 10 min. Stir in cream + sugar. Blend smooth for restaurant-style. Salt to taste. Makes ~2 cups. Freezes 3 months.',
    storeNote: 'For a quick sub: ½ cup tomato sauce + 1 tbsp curry powder + 2 tbsp heavy cream + pinch of cayenne.'
  },

  'piri piri sauce': {
    name: 'Piri Piri Sauce',
    quickSub: 'Buy: Nando\'s Hot Peri-Peri Sauce. Closest match.',
    ingredients: [
      '4 red chili peppers (Fresno or red bird\'s eye), seeded',
      '2 garlic cloves',
      '1 roasted red pepper (jarred)',
      '2 tbsp red wine vinegar',
      '2 tbsp olive oil',
      '1 tsp smoked paprika',
      '1 tsp dried oregano',
      '1 tsp salt',
      'juice of ½ lemon'
    ],
    method: 'Blend everything smooth. Yields ~½ cup. Lasts 2 weeks fridge.',
    storeNote: 'Or use ½ cup Nando\'s + 1 tbsp olive oil + ½ tsp smoked paprika.'
  },

  'plum sauce': {
    name: 'Plum Sauce',
    quickSub: 'Mix plum/apricot jam + soy + rice vinegar + ginger',
    ingredients: [
      '½ cup plum jam or apricot jam',
      '2 tbsp soy sauce',
      '1 tbsp rice vinegar',
      '1 tsp grated ginger',
      '1 small garlic clove, grated',
      '¼ tsp Chinese five-spice (optional)',
      'pinch red pepper flakes'
    ],
    method: 'Stir in small saucepan, simmer 2 min, cool. Lasts 2 weeks fridge.',
    storeNote: 'Quickest: jar of Lee Kum Kee Plum Sauce.'
  },

  'sweet chili sauce': {
    name: 'Sweet Chili Sauce',
    quickSub: 'Buy: Mae Ploy or Thai Kitchen Sweet Chili. Identical.',
    ingredients: [
      '½ cup rice vinegar',
      '½ cup sugar',
      '¼ cup water',
      '1 tbsp grated garlic',
      '1 tbsp red pepper flakes',
      '1 tsp salt',
      '1 tbsp cornstarch + 2 tbsp cold water'
    ],
    method: 'Boil vinegar + sugar + water. Add garlic + red pepper flakes + salt. Mix cornstarch in cold water, stir into pan. Simmer 1 min until thick.',
    storeNote: ''
  },

  'chili-garlic sauce': {
    name: 'Chili-Garlic Sauce',
    quickSub: 'Buy: Huy Fong (rooster brand) Chili Garlic Sauce. Spot-on match.',
    ingredients: ['Just buy it.'],
    method: 'Available at any grocery store, Asian aisle. The squat jar with the green lid and rooster logo. ~$4.',
    storeNote: 'In a pinch: sambal oelek works too.'
  },

  'hoisin sauce': {
    name: 'Hoisin Sauce',
    quickSub: 'Buy: Lee Kum Kee or Kikkoman Hoisin. Identical.',
    ingredients: ['Just buy it.'],
    method: 'Asian aisle of any grocery store. ~$4.',
    storeNote: ''
  },

  'ginger sauce': {
    name: 'Ginger Sauce (HelloFresh\'s Umami Ginger Sauce)',
    quickSub: 'Soy + rice vinegar + brown sugar + ginger + sesame oil',
    ingredients: [
      '¼ cup soy sauce',
      '2 tbsp rice vinegar',
      '2 tbsp brown sugar or honey',
      '1 tbsp grated fresh ginger',
      '1 tsp sesame oil',
      '1 tsp cornstarch dissolved in 2 tsp water'
    ],
    method: 'Combine in small pot, simmer 2 min until glossy. Yields ~½ cup. Lasts 2 weeks fridge.',
    storeNote: ''
  },

  'spicy mayo': {
    name: 'Spicy Mayo',
    quickSub: 'Mayo + sriracha + lime juice',
    ingredients: [
      '¼ cup mayonnaise',
      '1 tbsp Sriracha (or chili-garlic sauce)',
      '1 tsp lime juice',
      '½ tsp sugar',
      'pinch of salt'
    ],
    method: 'Whisk together. Lasts 1 week fridge.',
    storeNote: ''
  },

  'honey-garlic sauce': {
    name: 'Honey-Garlic Sauce',
    quickSub: 'Soy + honey + vinegar + garlic + sesame oil',
    ingredients: [
      '¼ cup soy sauce',
      '3 tbsp honey',
      '2 tbsp rice vinegar',
      '3 garlic cloves, minced (or 1 tbsp ginger-garlic puree)',
      '1 tsp sesame oil',
      '1 tsp cornstarch in 1 tbsp water'
    ],
    method: 'Whisk in small pot, simmer 2 min until thick and glossy.',
    storeNote: ''
  },

  'nuoc cham': {
    name: 'Nuoc Cham (Vietnamese dipping sauce)',
    quickSub: 'Fish sauce + lime + sugar + garlic + chili',
    ingredients: [
      '3 tbsp fish sauce',
      '3 tbsp warm water',
      '2 tbsp sugar',
      '2 tbsp lime juice',
      '1 garlic clove, minced',
      '1 small Thai chili or red chili, sliced',
      '1 tsp grated carrot (optional, traditional)'
    ],
    method: 'Whisk until sugar dissolves. Yields ~⅔ cup.',
    storeNote: ''
  },

  'mango chutney': {
    name: 'Mango Chutney',
    quickSub: 'Buy: Patak\'s Mango Chutney. Identical.',
    ingredients: [
      '½ cup chopped fresh or frozen mango',
      '2 tbsp rice vinegar',
      '1 tbsp sugar',
      '1 tsp grated ginger',
      'pinch salt + pinch cayenne'
    ],
    method: 'Microwave 90 sec, mash slightly with fork.',
    storeNote: 'Brooklyn Delhi makes a great one too.'
  },

  'ranch dressing': {
    name: 'Ranch Dressing',
    quickSub: 'Buy: Hidden Valley Ranch.',
    ingredients: [
      '½ cup mayonnaise',
      '¼ cup buttermilk (or sour cream + 1 tsp lemon juice)',
      '1 tsp dried dill',
      '1 tsp dried parsley',
      '½ tsp garlic powder',
      '½ tsp onion powder',
      '½ tsp salt',
      'pinch black pepper'
    ],
    method: 'Whisk. Lasts 1 week fridge.',
    storeNote: ''
  },

  'basil pesto': {
    name: 'Basil Pesto',
    quickSub: 'Buy refrigerated pesto: Kirkland, Rana, Trader Joe\'s, Costco. Way better than jarred.',
    ingredients: [
      '2 cups fresh basil leaves',
      '⅓ cup olive oil',
      '¼ cup pine nuts (or walnuts)',
      '¼ cup grated parmesan',
      '2 garlic cloves',
      '½ tsp salt',
      'juice of ½ lemon'
    ],
    method: 'Blend in food processor.',
    storeNote: ''
  },

  // ============ SPICE BLENDS ============
  // Notation: every HelloFresh "spice packet" of ~8g for 2 servings = ~2 tbsp of homemade blend.
  // Make once in a jar, keeps 6 months.

  'moroccan spice blend': {
    name: 'Moroccan Spice Blend',
    quickSub: 'Cumin + smoked paprika + coriander + ginger + cinnamon + turmeric',
    ingredients: [
      '2 parts ground cumin',
      '2 parts smoked paprika',
      '1 part ground coriander',
      '1 part ground ginger',
      '1 part ground cinnamon',
      '1 part turmeric',
      '½ part black pepper',
      '½ part cayenne'
    ],
    method: 'Mix in jar. (1 part = 1 tsp for small batch, 1 tbsp for big batch.) 2 tbsp of blend = 1 HelloFresh packet for 2 servings.',
    storeNote: 'Keeps 6 months in airtight jar.'
  },

  'mexican seasoning': {
    name: 'Mexican Seasoning',
    quickSub: 'Chili powder + cumin + paprika + garlic + onion + oregano',
    ingredients: [
      '4 parts chili powder',
      '2 parts ground cumin',
      '2 parts smoked paprika',
      '1 part garlic powder',
      '1 part onion powder',
      '1 part dried oregano',
      '½ part salt'
    ],
    method: 'Mix in jar. 2 tbsp = 1 HF packet.',
    storeNote: 'Or buy any taco/fajita seasoning.'
  },

  'golden turmeric spice blend': {
    name: 'Golden Turmeric Spice Blend',
    quickSub: 'Turmeric + cumin + paprika + garlic',
    ingredients: [
      '3 parts turmeric',
      '2 parts ground cumin',
      '1 part smoked paprika',
      '1 part garlic powder',
      '½ part black pepper'
    ],
    method: 'Mix in jar. 2 tbsp = 1 HF packet.',
    storeNote: ''
  },

  'chili-cumin spice blend': {
    name: 'Chili-Cumin Spice Blend',
    quickSub: 'Cumin + chili powder + paprika + garlic + oregano',
    ingredients: [
      '3 parts ground cumin',
      '2 parts chili powder',
      '2 parts smoked paprika',
      '1 part garlic powder',
      '1 part dried oregano',
      '½ part salt'
    ],
    method: 'Mix in jar. 2 tbsp = 1 HF packet.',
    storeNote: ''
  },

  'dal spice blend': {
    name: 'Dal Spice Blend (Indian curry blend)',
    quickSub: 'Cumin + coriander + turmeric + garam masala + cardamom',
    ingredients: [
      '2 parts ground cumin',
      '2 parts ground coriander',
      '1 part turmeric',
      '1 part garam masala',
      '½ part ground cardamom',
      '½ part black pepper',
      '½ part cayenne'
    ],
    method: 'Mix in jar. 2 tbsp = 1 HF packet.',
    storeNote: 'Or use 2 parts curry powder + 1 part garam masala.'
  },

  'cumin-turmeric spice blend': {
    name: 'Cumin-Turmeric Spice Blend',
    quickSub: 'Cumin + turmeric + coriander + paprika',
    ingredients: [
      '2 parts ground cumin',
      '2 parts turmeric',
      '1 part ground coriander',
      '1 part smoked paprika',
      '½ part black pepper',
      '½ part salt'
    ],
    method: 'Mix in jar.',
    storeNote: ''
  },

  'zesty garlic blend': {
    name: 'Zesty Garlic Blend',
    quickSub: 'Garlic powder + onion powder + parsley + oregano + lemon peel',
    ingredients: [
      '3 parts garlic powder',
      '2 parts onion powder',
      '1 part dried parsley',
      '1 part dried oregano',
      '1 part dried lemon peel (or 2 parts fresh lemon zest, refrigerate)',
      '½ part black pepper'
    ],
    method: 'Mix in jar.',
    storeNote: ''
  },

  'dill-garlic spice blend': {
    name: 'Dill-Garlic Spice Blend',
    quickSub: 'Dried dill + garlic powder + onion powder + parsley',
    ingredients: [
      '3 parts dried dill',
      '2 parts garlic powder',
      '1 part onion powder',
      '1 part dried parsley',
      '½ part black pepper'
    ],
    method: 'Mix in jar.',
    storeNote: ''
  },

  'applewood smoke spice': {
    name: 'Applewood Smoke Spice',
    quickSub: 'Smoked paprika + brown sugar + garlic + onion + cumin',
    ingredients: [
      '3 parts smoked paprika',
      '2 parts brown sugar',
      '1 part garlic powder',
      '1 part onion powder',
      '1 part ground cumin',
      '½ part dry mustard',
      '½ part black pepper'
    ],
    method: 'Mix in jar. The brown sugar makes this caramelize beautifully when seared.',
    storeNote: ''
  },

  'cream sauce spice blend': {
    name: 'Cream Sauce Spice Blend',
    quickSub: 'Mostly cornstarch — used for velveting/thickening',
    ingredients: [
      '2 parts wheat flour (or cornstarch for GF)',
      '2 parts onion powder',
      '2 parts garlic powder',
      '½ part salt',
      'pinch of nutmeg'
    ],
    method: 'Mix in jar. Note: this is 90% cornstarch — you can usually substitute 1 tbsp cornstarch + ¼ tsp salt + ¼ tsp garlic powder.',
    storeNote: ''
  },

  'garlic salt': {
    name: 'Garlic Salt',
    quickSub: 'Mix kosher salt + garlic powder',
    ingredients: [
      '3 parts kosher salt',
      '1 part garlic powder'
    ],
    method: 'Mix in jar.',
    storeNote: 'Or use Lawry\'s Garlic Salt from the spice aisle.'
  },

  // ============ PASTES & PUREES ============
  'ginger-garlic puree': {
    name: 'Ginger-Garlic Puree',
    quickSub: 'Equal parts grated ginger + grated garlic + a splash of oil',
    ingredients: [
      '4 oz fresh ginger, peeled',
      '1 head garlic, peeled (about 4 oz)',
      '1 tbsp neutral oil',
      'pinch of salt'
    ],
    method: 'Blend smooth in small food processor, OR finely grate both and mix. Yields ~½ cup. 1 tbsp = 1 HelloFresh packet portion.',
    storeNote: 'Freeze in ice cube trays in 1 tbsp portions, then bag them. Lasts 3 months. Or fridge: 2 weeks.'
  },

  'garlic puree': {
    name: 'Garlic Puree',
    quickSub: 'Peeled garlic blended with a splash of oil',
    ingredients: [
      'Peeled garlic cloves (any amount)',
      'splash of neutral oil',
      'pinch of salt'
    ],
    method: 'Blend smooth or finely grate. Same storage as above.',
    storeNote: 'Or microplane fresh garlic right when you need it.'
  },

  // ============ STOCKS & EXTRAS ============
  'beef broth concentrate': {
    name: 'Beef Broth Concentrate',
    quickSub: 'Use 1 tsp Better Than Bouillon Beef Base.',
    ingredients: ['1 tsp Better Than Bouillon Beef Base = 1 HelloFresh packet'],
    method: 'Available at any grocery store, in the soup aisle. The jar in the small refrigerated section. ~$6, lasts forever.',
    storeNote: 'If you don\'t have it, 1 cup beef stock works wherever the recipe calls for "1 packet broth concentrate + 1 cup water" → just use 1 cup beef stock.'
  },

  'chicken stock powder': {
    name: 'Chicken Stock Powder',
    quickSub: 'Use 1 tsp Better Than Bouillon Chicken Base.',
    ingredients: ['1 tsp Better Than Bouillon Chicken Base = 1 HelloFresh packet'],
    method: 'Same aisle, jar with yellow label.',
    storeNote: 'Substitute: 1 cup chicken stock for "1 packet + 1 cup water".'
  },

  'vegetable stock powder': {
    name: 'Vegetable Stock Powder',
    quickSub: 'Use 1 tsp Better Than Bouillon Vegetable Base.',
    ingredients: ['1 tsp Better Than Bouillon Vegetable Base = 1 HelloFresh packet'],
    method: 'Same aisle, jar with green label.',
    storeNote: 'Substitute: 1 cup veg stock for "1 packet + 1 cup water".'
  },

  'vegetable broth concentrate': {
    name: 'Vegetable Broth Concentrate',
    quickSub: 'Use 1 tsp Better Than Bouillon Vegetable Base.',
    ingredients: ['1 tsp Better Than Bouillon Vegetable Base'],
    method: 'Same aisle, jar with green label.',
    storeNote: ''
  },

  'crispy shallots': {
    name: 'Crispy Shallots',
    quickSub: 'Buy: jarred fried shallots (Asian grocery) — Maesri brand',
    ingredients: [
      '4 shallots, very thinly sliced',
      '½ cup neutral oil for frying',
      'pinch salt'
    ],
    method: 'Fry shallots in oil over medium heat, stirring constantly, until golden brown (8-10 min). Drain on paper towels. Salt while hot. Store airtight 1 week.',
    storeNote: 'Can substitute French\'s Crispy Fried Onions in a pinch.'
  },

  'yogurt sauce': {
    name: 'Yogurt Sauce (HelloFresh\'s all-purpose creamy condiment)',
    quickSub: 'Greek yogurt + lemon + garlic + olive oil',
    ingredients: [
      '½ cup full-fat Greek yogurt',
      '1 tbsp olive oil',
      '1 tbsp lemon juice',
      '1 small garlic clove, grated',
      '¼ tsp salt',
      'pinch black pepper'
    ],
    method: 'Whisk together. Yields ~½ cup. ~6 tbsp = 1 HelloFresh packet for 4 servings.',
    storeNote: 'Variants: + 1 tsp dried dill (dill version), + 1 tsp lemon zest + 1 tsp dill (lemon-dill), + 2 tbsp chopped cilantro (herby/Peruvian).'
  }
};

// Match an ingredient name to a component recipe (substring, case-insensitive)
export function findComponentRecipe(ingredientName) {
  if (!ingredientName) return null;
  const lower = ingredientName.toLowerCase();
  for (const [key, recipe] of Object.entries(COMPONENT_RECIPES)) {
    if (lower.includes(key)) return recipe;
  }
  return null;
}
