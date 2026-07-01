// Classify ingredients into grocery store aisles for organized shopping lists.
//
// The order here matters — the list will display aisles in this order to match
// a natural grocery shopping route: enter store → produce → meat → seafood →
// dairy → bakery → pantry/canned → spices/oils/condiments → frozen → international.

export const AISLES = [
  { id: 'produce', label: 'Produce', icon: '🥬', order: 1 },
  { id: 'meat', label: 'Meat', icon: '🥩', order: 2 },
  { id: 'seafood', label: 'Seafood', icon: '🐟', order: 3 },
  { id: 'dairy', label: 'Dairy & Eggs', icon: '🥛', order: 4 },
  { id: 'bakery', label: 'Bakery', icon: '🍞', order: 5 },
  { id: 'pantry', label: 'Pantry', icon: '🥫', order: 6 },
  { id: 'spices', label: 'Spices & Oils', icon: '🧂', order: 7 },
  { id: 'condiments', label: 'Condiments', icon: '🍯', order: 8 },
  { id: 'frozen', label: 'Frozen', icon: '🧊', order: 9 },
  { id: 'international', label: 'International', icon: '🌏', order: 10 },
  { id: 'other', label: 'Other', icon: '🛒', order: 99 }
];

// Keyword → aisle. First match wins, so order matters.
// We use word-boundary-aware substring matching against the lowercase ingredient name.
const AISLE_RULES = [
  // Produce
  { aisle: 'produce', keywords: [
    'lettuce','spinach','arugula','kale','cabbage','bok choy','chard','greens',
    'tomato','onion','shallot','scallion','green onion','garlic','ginger','lemongrass',
    'pepper','bell pepper','jalapeño','jalapeno','chili','poblano','serrano','habanero',
    'cucumber','zucchini','squash','eggplant','radish','beet','carrot','celery',
    'potato','sweet potato','yam','parsnip','turnip','cauliflower','broccoli','asparagus',
    'mushroom','avocado','lime','lemon','orange','grapefruit','apple','banana','berry',
    'mango','pineapple','grape','melon','peach','pear','plum','cilantro','parsley',
    'basil','mint','dill','rosemary','thyme','oregano fresh','sage','chives','tarragon',
    'snow pea','snap pea','sugar snap','green bean','corn fresh','cherry tomato'
  ]},

  // Meat (chicken, beef, pork, etc.)
  { aisle: 'meat', keywords: [
    'chicken breast','chicken thigh','chicken leg','chicken wing','chicken whole',
    'ground chicken','ground beef','ground turkey','ground pork','ground lamb',
    'beef','steak','sirloin','ribeye','flank','brisket','chuck','round',
    'pork','pork chop','pork loin','pork shoulder','bacon','prosciutto','ham',
    'sausage','chorizo','salami','pepperoni','hot dog','bratwurst',
    'turkey','duck','lamb','veal','rabbit'
  ]},

  // Seafood
  { aisle: 'seafood', keywords: [
    'salmon','tuna','cod','tilapia','halibut','snapper','sea bass','mahi','swordfish',
    'shrimp','prawn','scallop','mussel','clam','oyster','squid','octopus','calamari',
    'crab','lobster','crawfish','anchovy','sardine','mackerel','trout','fish'
  ]},

  // Dairy & eggs
  { aisle: 'dairy', keywords: [
    'milk','cream','heavy cream','half-and-half','half and half','buttermilk',
    'yogurt','greek yogurt','sour cream','crème fraîche','creme fraiche',
    'cheese','cheddar','mozzarella','parmesan','feta','goat cheese','blue cheese',
    'brie','camembert','swiss','provolone','gouda','manchego','ricotta','cottage cheese',
    'mexican blend','monterey jack','cream cheese','mascarpone',
    'egg','eggs','butter'
  ]},

  // Bakery / bread
  { aisle: 'bakery', keywords: [
    'bread','baguette','sourdough','rye','ciabatta','focaccia','english muffin',
    'bagel','tortilla','flatbread','naan','pita','wrap','bun','roll','dinner roll',
    'pizza dough','puff pastry','phyllo','filo','croissant','muffin','crouton'
  ]},

  // Pantry (canned, dry goods, baking, grains, pasta)
  { aisle: 'pantry', keywords: [
    'rice','jasmine rice','basmati','brown rice','wild rice','arborio','sushi rice',
    'pasta','spaghetti','linguine','penne','rigatoni','fettuccine','orzo','couscous',
    'noodle','rice noodle','vermicelli','udon','ramen','soba','egg noodle',
    'bulgur','farro','quinoa','barley','oats','oatmeal','polenta','grits','cornmeal',
    'flour','all-purpose','bread flour','almond flour','chickpea flour','cornstarch',
    'sugar','brown sugar','powdered sugar','confectioners','honey','maple syrup','agave',
    'baking soda','baking powder','yeast','vanilla','vanilla extract','almond extract',
    'chocolate chip','cocoa','cacao','sprinkles',
    'canned tomato','crushed tomato','tomato sauce','marinara','tomato paste','passata',
    'chickpea','bean','canned chickpea','canned bean','black bean','kidney bean','pinto bean','cannellini',
    'lentil','split pea','dried bean',
    'canned tuna','canned salmon','canned sardine','canned anchovy',
    'broth','stock','bouillon','better than bouillon','chicken stock','beef broth','vegetable stock',
    'coconut milk','coconut cream','evaporated milk','condensed milk',
    'tortilla chip','crackers','pretzel','breadcrumb','panko','cracker',
    'peanut','almond','cashew','walnut','pecan','pistachio','pine nut','sunflower seed','pumpkin seed','sesame seed','chia seed','flax seed','nut',
    'raisin','craisin','dried cranberry','dried apricot','date','prune','dried fig'
  ]},

  // Spices & oils
  { aisle: 'spices', keywords: [
    'salt','kosher salt','sea salt','flake salt','pepper','black pepper','white pepper','peppercorn',
    'cumin','coriander','paprika','smoked paprika','turmeric','curry powder','garam masala',
    'cinnamon','nutmeg','cloves','cardamom','allspice','star anise','bay leaf',
    'chili powder','cayenne','chili flake','red pepper flake','crushed red pepper','sumac','za\'atar',
    'oregano','dried oregano','dried basil','dried thyme','dried rosemary','dried dill','dried parsley','dried mint','dried tarragon','dried sage',
    'garlic powder','onion powder','garlic salt','five-spice','five spice',
    'olive oil','extra virgin','vegetable oil','canola oil','grapeseed','sunflower oil','peanut oil','sesame oil','toasted sesame','coconut oil','avocado oil',
    'butter melted','ghee'
  ]},

  // Condiments & sauces
  { aisle: 'condiments', keywords: [
    'soy sauce','tamari','fish sauce','worcestershire','oyster sauce',
    'vinegar','rice vinegar','balsamic','red wine vinegar','white wine vinegar','apple cider vinegar','sherry vinegar','distilled vinegar',
    'mustard','dijon','yellow mustard','whole grain mustard',
    'ketchup','mayonnaise','mayo','aioli','tartar sauce','cocktail sauce',
    'hot sauce','sriracha','sambal','chili-garlic','chili garlic','tabasco','frank\'s','cholula',
    'sweet chili','plum sauce','duck sauce','hoisin','black bean sauce','xo sauce',
    'bbq sauce','barbecue','steak sauce','a1','horseradish','tartar',
    'pesto','tapenade','tahini','hummus','salsa','guacamole','olive','caper','pickle','relish',
    'jam','jelly','preserves','marmalade','peanut butter','almond butter',
    'mango chutney','chutney','harissa','gochujang','miso','wasabi'
  ]},

  // Frozen
  { aisle: 'frozen', keywords: [
    'frozen','ice cream','popsicle','frozen pizza','frozen vegetable','frozen fruit',
    'frozen berries','frozen mango','frozen corn','frozen pea','frozen edamame','edamame',
    'frozen broccoli','frozen spinach','frozen shrimp','frozen fish'
  ]},

  // International
  { aisle: 'international', keywords: [
    'kimchi','sauerkraut','crispy shallot','crispy fried shallot','fried onion',
    'wonton wrapper','dumpling wrapper','rice paper','spring roll wrapper',
    'pickled ginger','wakame','nori','seaweed','dashi','mirin','sake','rice wine',
    'gochugaru','furikake','bonito',
    'tahini','pomegranate molasses','rose water','orange blossom','tamarind',
    'masa','plantain'
  ]}
];

// Classify a single ingredient name into an aisle id.
export function aisleFor(name) {
  if (!name) return 'other';
  const lower = name.toLowerCase();
  // Try every rule, longest keyword first to avoid e.g. "rice" matching before "rice noodle"
  const flat = AISLE_RULES.flatMap(r => r.keywords.map(k => ({ k, aisle: r.aisle, len: k.length })));
  flat.sort((a, b) => b.len - a.len);
  for (const { k, aisle } of flat) {
    if (lower.includes(k)) return aisle;
  }
  return 'other';
}

// Group an array of grocery items by aisle, returning ordered sections.
// Each section: { aisle, label, icon, items }
export function groupByAisle(items) {
  const buckets = {};
  AISLES.forEach(a => { buckets[a.id] = { ...a, items: [] }; });
  items.forEach(it => {
    const aisle = aisleFor(it.name);
    buckets[aisle].items.push(it);
  });
  // Return only non-empty, in defined order
  return AISLES.map(a => buckets[a.id]).filter(b => b.items.length > 0);
}
