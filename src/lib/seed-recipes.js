// SEED RECIPES — v4.5 foolproofed edition
// ========================================
// Every step has been rewritten with:
//   - Specific pan size, heat level, oil quantity
//   - Exact tsp/tbsp seasoning amounts (no "season to taste")
//   - Specific times + visual cues + (for meat) safe internal temps
//   - Air fryer alternative (calibrated for Cuisinart Convection: −-10°C, −15% time, AIR FRY mode, middle rack)
//   - Fresh ↔ paste ingredient alternates (garlic, ginger, lemongrass, ginger-garlic)
//   - Phase-tagged (prep / cook / plate)
//
// Conversion ratios used:
//   Fresh garlic (1 clove, ~3g minced)       ↔ 1 tsp garlic paste
//   Fresh ginger (1 inch / ~15g grated)      ↔ 1 tbsp ginger paste
//   Fresh ginger-garlic puree (2 tbsp DIY)   ↔ 2 tbsp jarred ginger-garlic paste
//   Fresh lemongrass (1 stalk minced)        ↔ 1 tbsp lemongrass paste

export const SEED_RECIPES = [

  // ==========================================================================
  // 1. Beef Spring Roll-Inspired Rice Bowls
  // ==========================================================================
  {
    id: 'hf_001',
    mealType: 'dinner',
    leftoverFriendly: true,
    nutrition: { calories: 720, protein: 42, fat: 28, carbs: 78, fiber: 6, sodium: 1080 },
    costcoSourcing: ['Kirkland 90/10 ground beef', 'Kirkland jasmine rice', 'Kirkland organic carrots', 'Costco cucumbers'],
    title: 'Beef Spring Roll-Inspired Rice Bowls',
    servings: 2, timeMin: 35,
    description: 'With green cabbage, crispy shallots, and plum sauce. Family Friendly.',
    tags: ['beef','asian','family-friendly'],
    image: '🍚',
    ingredients: [
      { id:'hf001_1', qty:250, unit:'g', name:'ground beef', protein:true },
      { id:'hf001_2', qty:56, unit:'g', name:'crispy fried shallots (jarred)' },
      { id:'hf001_3', qty:113, unit:'g', name:'green cabbage, shredded' },
      { id:'hf001_4', qty:1, unit:'unit', name:'carrot, peeled' },
      { id:'hf001_5', qty:2, unit:'unit', name:'green onions' },
      { id:'hf001_6', qty:2, unit:'tbsp', name:'ginger-garlic puree (made from 1 inch ginger + 2 cloves garlic, grated together)',
        alternates: [{ modeId:'paste', qty:2, unit:'tbsp', name:'jarred ginger-garlic paste' }] },
      { id:'hf001_7', qty:4, unit:'tbsp', name:'hoisin sauce' },
      { id:'hf001_8', qty:0.25, unit:'cup', name:'plum sauce' },
      { id:'hf001_9', qty:1, unit:'tbsp', name:'sesame oil (toasted)' },
      { id:'hf001_10', qty:1, unit:'tbsp', name:'black sesame seeds' },
      { id:'hf001_11', qty:0.75, unit:'cup', name:'jasmine rice' },
      { id:'hf001_12', qty:1, unit:'tbsp', name:'seasoned rice vinegar' }
    ],
    steps: [
      { id:'hf001_s1', phase:'cook', timerSec:180,
        text:'In a small saucepan over medium heat, warm 1 tsp sesame oil. Add the rice and toast, stirring constantly with a wooden spoon, until the grains are fragrant and lightly golden — about 3 minutes.' },
      { id:'hf001_s2', phase:'cook', timerSec:900,
        text:'Pour in 1¼ cups water and ¼ tsp coarse salt. Bring to a rolling boil, then cover and reduce heat to LOW. Cook 15 minutes until water is fully absorbed and rice is tender. Remove from heat, keep covered, rest 5 min before fluffing.' ,
        parallelTask:'While rice cooks: do all the prep below (chop veg, slice protein, make sauces). 15 minutes is enough to get everything ready.'},
      { id:'hf001_s3', phase:'prep', timerSec:null,
        text:'While rice cooks: thinly slice green onions on a diagonal (whites and greens together). Grate the peeled carrot on the large holes of a box grater.' },
      { id:'hf001_s4', phase:'prep', timerSec:null,
        text:'In a large bowl, whisk together 1 tbsp rice vinegar, 1 tsp granulated sugar, 1 tbsp neutral oil (vegetable or canola), ¼ tsp salt, and 2 grinds of black pepper. Add the shredded cabbage, grated carrot, and ¾ of the sliced green onions (save the rest for garnish). Toss to coat. Set aside while you cook the beef — the cabbage will soften slightly.' },
      { id:'hf001_s5', phase:'cook', timerSec:360,
        text:'Heat a 10-inch non-stick skillet over medium-high heat with ½ tbsp neutral oil. When the oil shimmers, add the ground beef. Break it into small crumbles with a wooden spoon. Cook undisturbed 2 min to develop browning, then stir and cook 4 more minutes until no pink remains and small crispy bits form.',
        airFryerAlt: null,
        stovetopAlt: null },
      { id:'hf001_s6', phase:'cook', timerSec:90,
        text:'Reduce heat to MEDIUM. Add the ginger-garlic puree to the beef. Stir constantly and cook 60-90 seconds until fragrant (do not let garlic burn — it turns bitter). Add the 4 tbsp hoisin sauce and remaining ½ tbsp sesame oil. Stir to coat every crumble. Cook 30 seconds until glossy. Off heat.',
        pasteAlt: { text:'Reduce heat to MEDIUM. Add the ginger-garlic paste to the beef. Stir constantly 30 seconds — paste cooks faster than fresh and burns easily. Add the 4 tbsp hoisin and remaining ½ tbsp sesame oil. Stir 30 seconds until glossy. Off heat.', timerSec:60 } },
      { id:'hf001_s7', phase:'plate', timerSec:null,
        text:'Fluff rice with a fork. Stir in the 1 tbsp black sesame seeds. Divide rice between 2 wide bowls. Top each with beef, then a generous mound of cabbage slaw. Drizzle 2 tbsp plum sauce per bowl. Sprinkle with crispy shallots and reserved green onions. Serve immediately.' }
    ]
  },

  // ==========================================================================
  // 2. Moroccan-Spiced Chicken
  // ==========================================================================
  {
    id: 'hf_002',
    mealType: 'dinner',
    leftoverFriendly: true,
    nutrition: { calories: 685, protein: 48, fat: 22, carbs: 72, fiber: 11, sodium: 920 },
    costcoSourcing: ['Kirkland boneless skinless chicken thighs', 'Kirkland organic chickpeas (can)', 'Kirkland Greek yogurt 2%'],
    title: 'Moroccan-Spiced Chicken with Chickpeas, Zucchini & Peppers',
    servings: 2, timeMin: 35,
    description: 'High Protein. Balanced. A weeknight classic.',
    tags: ['chicken','moroccan','high-protein','balanced'],
    image: '🍗',
    ingredients: [
      { id:'hf002_1', qty:2, unit:'unit', name:'boneless skinless chicken breasts (~170g each)', protein:true },
      { id:'hf002_2', qty:1, unit:'unit', name:'can chickpeas (400g), drained and rinsed' },
      { id:'hf002_3', qty:1, unit:'unit', name:'medium zucchini' },
      { id:'hf002_4', qty:1, unit:'unit', name:'red or yellow bell pepper' },
      { id:'hf002_5', qty:0.5, unit:'unit', name:'yellow onion, thinly sliced' },
      { id:'hf002_6', qty:2, unit:'clove', name:'garlic',
        alternates: [{ modeId:'paste', qty:2, unit:'tsp', name:'garlic paste' }] },
      { id:'hf002_7', qty:7, unit:'g', name:'fresh parsley (small bunch)' },
      { id:'hf002_8', qty:1, unit:'tbsp', name:'Moroccan spice blend (1 tsp cumin + ½ tsp paprika + ½ tsp coriander + ¼ tsp ginger + ¼ tsp cinnamon + ¼ tsp turmeric)' },
      { id:'hf002_9', qty:2, unit:'tbsp', name:'tomato paste' },
      { id:'hf002_10', qty:0.33, unit:'cup', name:'plain Greek yogurt (full fat)' },
      { id:'hf002_11', qty:1, unit:'tbsp', name:'red wine vinegar' },
      { id:'hf002_12', qty:1, unit:'unit', name:'lemon (for yogurt sauce)' }
    ],
    steps: [
      { id:'hf002_s1', phase:'prep', timerSec:null,
        text:'Preheat oven to 230°C with rack in the middle position. Halve zucchini lengthwise, then cut into ½-inch half-moons. Core bell pepper and cut into 1-inch pieces. Mince garlic (or measure paste). Pick parsley leaves and chop fine — you should have about 2 tbsp.' ,
        prepNote: '→ veg goes on sheet pan (step 2), chicken gets seasoned (step 3)'},
      { id:'hf002_s2', phase:'cook', timerSec:900,
        text:'On a half sheet pan: toss zucchini and bell pepper with 1 tbsp olive oil, ½ tsp coarse salt, and ¼ tsp pepper. Spread in a single layer. Roast in middle of oven 12-15 minutes, flipping once at the 8-minute mark, until edges are browned and a piece pierces easily with a fork.',
        airFryerAlt: { text:'Set Cuisinart air fryer to AIR FRY mode at 225°C (oven was 230°C, drop -10°C). Toss zucchini and bell pepper with 1 tbsp olive oil, ½ tsp coarse salt, ¼ tsp pepper. Arrange in single layer on the wire/perforated tray (use the AirFryer basket setup). Air fry 10-12 minutes, shaking tray at 6 minutes, until edges are browned.', timerSec:660 } ,
        parallelTask:'While the oven works: prep the rest of the ingredients (chop, slice, make sauces). 15 minutes is enough for all prep.'},
      { id:'hf002_s3', phase:'prep', timerSec:null,
        text:'Pat chicken breasts very dry with paper towels (key for browning). Season both sides evenly with ½ tbsp of the Moroccan spice blend (save the other ½ tbsp for the stew), ½ tsp coarse salt, and ¼ tsp pepper.' },
      { id:'hf002_s4', phase:'cook', timerSec:600,
        text:'Heat a 12-inch oven-safe skillet (cast iron or stainless) over medium-high with 1 tbsp olive oil. When oil shimmers, place chicken smooth-side-down. Sear undisturbed 4 min until a deep golden crust forms. Flip and sear 1 more min. Transfer skillet to the oven (or transfer chicken to a baking sheet). Roast 5-7 minutes until a thermometer inserted in the thickest part reads 75°C. Transfer to a cutting board, rest 5 min.',
        airFryerAlt: { text:'Skip stovetop sear if using air fryer for the chicken. Brush chicken with 1 tsp olive oil per side. Place on wire rack of Cuisinart air fryer set to AIR FRY at 195°C. Cook 14-18 min depending on thickness, flipping at 8 min, until internal temp reads 75°C. Rest 5 min on a cutting board before slicing.', timerSec:1080 } ,
        parallelTask:"While the oven works: prep all remaining ingredients so you're ready to plate the moment it's done."},
      { id:'hf002_s5', phase:'cook', timerSec:180,
        text:'Return the chicken skillet to medium heat. Add 1 tbsp olive oil, the sliced onion, the minced garlic, and the remaining ½ tbsp Moroccan spice. Stir constantly 2-3 min until onion is softened and garlic is fragrant — do not let garlic burn.',
        pasteAlt: { text:'Return the chicken skillet to medium heat. Add 1 tbsp olive oil and the sliced onion. Cook 2 min until soft. Add the garlic paste + remaining ½ tbsp Moroccan spice. Stir constantly 30 seconds — paste burns faster than minced.', timerSec:150 } },
      { id:'hf002_s6', phase:'cook', timerSec:420,
        text:'Add 2 tbsp tomato paste to the skillet. Stir constantly 60 seconds until it darkens to brick-red (this builds flavor). Add 1 tbsp red wine vinegar and stir. Add the drained chickpeas + ⅓ cup water. Simmer uncovered, stirring occasionally, 5-6 minutes until thickened and chickpeas have absorbed flavor.' },
      { id:'hf002_s7', phase:'plate', timerSec:null,
        text:'Stir the roasted vegetables and half the chopped parsley into the chickpea stew. Make the yogurt sauce: in a small bowl, mix ⅓ cup Greek yogurt + 1 tbsp lemon juice + ¼ tsp salt + 1 tbsp water. Slice chicken on the bias into ½-inch slices. Plate: stew on the bottom, sliced chicken on top, drizzle yogurt sauce in a generous zigzag, sprinkle remaining parsley.' }
    ]
  },

  // ==========================================================================
  // 3. Peruvian-Inspired Roasted Chicken & Zesty Lime Rice
  // ==========================================================================
  {
    id: 'hf_003',
    mealType: 'dinner',
    leftoverFriendly: false,
    nutrition: { calories: 780, protein: 52, fat: 32, carbs: 65, fiber: 7, sodium: 1050 },
    costcoSourcing: ['Kirkland boneless skinless chicken thighs', 'Kirkland russet potatoes', 'Lime 12-pack'],
    title: 'Peruvian-Inspired Roasted Chicken & Zesty Lime Rice',
    servings: 2, timeMin: 35,
    description: 'With herby yogurt sauce. High Protein.',
    tags: ['chicken','peruvian','high-protein'],
    image: '🍋',
    ingredients: [
      { id:'hf003_1', qty:2, unit:'unit', name:'boneless skinless chicken breasts', protein:true },
      { id:'hf003_2', qty:1, unit:'cup', name:'quick-cook brown rice (or jasmine rice)' },
      { id:'hf003_3', qty:1, unit:'tbsp', name:'Mexican seasoning (½ tsp chili powder + ¾ tsp cumin + ¼ tsp paprika + ¼ tsp garlic powder + ¼ tsp onion powder)' },
      { id:'hf003_4', qty:1.5, unit:'tsp', name:'Golden Turmeric blend (¾ tsp turmeric + ¼ tsp cumin + ¼ tsp paprika + ¼ tsp garlic powder)' },
      { id:'hf003_5', qty:1, unit:'unit', name:'lime' },
      { id:'hf003_6', qty:7, unit:'g', name:'fresh cilantro (small bunch)' },
      { id:'hf003_7', qty:1, unit:'clove', name:'garlic',
        alternates: [{ modeId:'paste', qty:1, unit:'tsp', name:'garlic paste' }] },
      { id:'hf003_8', qty:0.33, unit:'cup', name:'plain Greek yogurt (full fat)' },
      { id:'hf003_9', qty:1, unit:'unit', name:'red bell pepper' },
      { id:'hf003_10', qty:1, unit:'unit', name:'medium zucchini' }
    ],
    steps: [
      { id:'hf003_s1', phase:'cook', timerSec:1500,
        text:'Preheat oven to 220°C with rack in the middle. In a medium saucepan, combine the rice + 1½ cups water + ¼ tsp coarse salt + ¾ tsp of the Golden Turmeric blend (save the rest). Bring to a rolling boil, then reduce heat to LOW, cover, and cook 22-25 min (for brown rice) or 15 min (jasmine) until water is absorbed.' ,
        parallelTask:'While rice cooks: do all the prep below (chop veg, slice protein, make sauces). 15 minutes is enough to get everything ready.'},
      { id:'hf003_s2', phase:'prep', timerSec:null,
        text:'Pat chicken dry with paper towels. In a bowl, toss with ½ tbsp olive oil + remaining ¾ tsp Golden Turmeric + the 1 tbsp Mexican seasoning + ½ tsp coarse salt + ¼ tsp pepper + half the minced garlic. Rub the spice mixture in evenly with your hands. Core and slice bell pepper into ½-inch strips. Halve zucchini and cut into ½-inch half-moons.' ,
        prepNote: '→ chicken goes into oven (step 3), veg get sautéed (step 4)'},
      { id:'hf003_s3', phase:'cook', timerSec:600,
        text:'Heat a 12-inch oven-safe skillet over medium-high with 1 tbsp olive oil. Sear chicken smooth-side-down undisturbed 4 min until a deep golden crust forms. Flip, sear 1 min. Transfer skillet to oven, roast 5-7 min until thermometer reads 75°C internal. Rest 5 min on cutting board.',
        airFryerAlt: { text:'Skip stovetop sear. Place seasoned chicken on Cuisinart air fryer wire rack. Set to AIR FRY at 195°C. Cook 14-18 min, flipping at 8 min, until internal temp reads 75°C. Rest 5 min on cutting board before slicing.', timerSec:1080 } ,
        parallelTask:"While the oven works: prep all remaining ingredients so you're ready to plate the moment it's done."},
      { id:'hf003_s4', phase:'cook', timerSec:300,
        text:'In the chicken skillet (or a fresh 10-inch non-stick pan), medium-high heat with 1 tbsp olive oil. Add bell pepper + zucchini in a single layer. Cook undisturbed 2 min, then toss and cook 3 more min until edges char and vegetables are tender-crisp. Season with ¼ tsp salt + ⅛ tsp pepper. Off heat.' },
      { id:'hf003_s5', phase:'prep', timerSec:null,
        text:'Finely chop cilantro — you should have about 2 tbsp. Zest the entire lime with a microplane (about 1 tsp zest), then juice half (about 1 tbsp juice). In a small bowl, mix ⅓ cup Greek yogurt + 1 tbsp lime juice + remaining minced garlic + 1 tbsp water + 2 tbsp chopped cilantro + ¼ tsp salt + ⅛ tsp pepper.',
        pasteAlt: { text:'Finely chop cilantro. Zest the entire lime, juice half. In a small bowl, mix ⅓ cup Greek yogurt + 1 tbsp lime juice + remaining ½ tsp garlic paste + 1 tbsp water + 2 tbsp chopped cilantro + ¼ tsp salt + ⅛ tsp pepper.', timerSec:null } },
      { id:'hf003_s6', phase:'plate', timerSec:null,
        text:'Fluff the rice with a fork, stir in the lime zest. Slice the chicken on the bias into ½-inch slices. Plate: bed of lime rice, then the roasted vegetables alongside, then the sliced chicken on top. Drizzle the herby yogurt sauce in a zigzag. Cut the remaining lime half into wedges and serve alongside for squeezing.' }
    ]
  },

  // ==========================================================================
  // 4. Chili-Garlic Salmon Rice Bowls with Sesame-Ginger Bok Choy
  // ==========================================================================
  {
    id: 'hf_004',
    mealType: 'dinner',
    leftoverFriendly: false,
    nutrition: { calories: 710, protein: 38, fat: 26, carbs: 78, fiber: 5, sodium: 970 },
    costcoSourcing: ['Costco Atlantic salmon fillets', 'Kirkland jasmine rice', 'Huy Fong chili-garlic sauce', 'Kirkland frozen edamame'],
    title: 'Chili-Garlic Salmon Rice Bowls with Sesame-Ginger Bok Choy',
    servings: 2, timeMin: 25,
    description: 'Spicy. Quick weeknight win.',
    tags: ['salmon','asian','spicy','quick'],
    image: '🐟',
    ingredients: [
      { id:'hf004_1', qty:2, unit:'unit', name:'salmon fillets, skin-on (~5-6 oz each)', protein:true },
      { id:'hf004_2', qty:0.75, unit:'cup', name:'jasmine rice' },
      { id:'hf004_3', qty:2, unit:'unit', name:'baby bok choy (Shanghai style)' },
      { id:'hf004_4', qty:0.5, unit:'unit', name:'yellow onion' },
      { id:'hf004_5', qty:1, unit:'unit', name:'carrot, peeled' },
      { id:'hf004_6', qty:14, unit:'g', name:'crispy fried shallots (jarred)' },
      { id:'hf004_7', qty:1, unit:'tbsp', name:'chili-garlic sauce (Huy Fong / Lee Kum Kee)' },
      { id:'hf004_8', qty:4, unit:'tbsp', name:'ginger sauce (3 tbsp soy + 1 tsp rice vinegar + 1 tsp brown sugar + 1 tsp grated ginger + 1 tsp toasted sesame oil)' },
      { id:'hf004_9', qty:1, unit:'tbsp', name:'toasted sesame oil' }
    ],
    steps: [
      { id:'hf004_s1', phase:'cook', timerSec:900,
        text:'In a medium saucepan, bring 1¼ cups water + ¼ tsp salt to a boil. Add rice, stir once, reduce to LOW, cover, and cook 15 min. Remove from heat, keep covered, rest 5 min.' ,
        parallelTask:"While rice cooks: do all the prep below (chop veg, slice protein, make sauces) so you're ready to cook the moment it's done."},
      { id:'hf004_s2', phase:'prep', timerSec:null,
        text:'Halve bok choy lengthwise and separate the leaves from the stems (cut each leaf away from its stem; stems go in one pile, leaves in another — they cook for different times). Thinly slice ½ onion into half-moons. Slice the peeled carrot into thin coins (⅛ inch).' ,
        prepNote: '→ bok choy goes into pan (step 3), salmon gets seared (step 4)'},
      { id:'hf004_s3', phase:'cook', timerSec:360,
        text:'Heat a 12-inch non-stick skillet over medium-high with 1 tbsp neutral oil. Add onion + carrot + bok choy stems. Cook 3 min stirring occasionally until onion edges color. Add bok choy leaves, cook 2 min until just wilted. Drizzle 2 tbsp of the ginger sauce + ½ tbsp sesame oil. Toss 30 seconds. Off heat, transfer veg to a plate, wipe pan clean.' },
      { id:'hf004_s4', phase:'cook', timerSec:240,
        text:'Pat salmon very dry with paper towels (water = no crisp skin). Season skin side with ¼ tsp salt; flesh side with ¼ tsp salt + a few grinds of pepper. In the same 12-inch skillet, medium-high, with 1 tbsp neutral oil. When oil shimmers (not smoking), place salmon SKIN-SIDE-DOWN. Press gently with a spatula for the first 20 seconds to prevent curl. Cook undisturbed 4 min — skin should release easily when crisp.',
        airFryerAlt: { text:'Pat salmon very dry. Season both sides with ¼ tsp salt each + pepper. Brush flesh side with 1 tsp neutral oil. Place skin-side-down on Cuisinart wire rack. AIR FRY at 195°C for 8-10 min total — no flipping needed; salmon is done when it flakes with a fork and the skin is crisp. Use the wire/perforated tray for airflow under the fillet.', timerSec:540 } },
      { id:'hf004_s5', phase:'cook', timerSec:150,
        text:'Flip salmon flesh-side-down. Brush the now-up-facing skin with the 1 tbsp chili-garlic sauce. Cook 2-3 more minutes — salmon is done when it flakes easily with a fork and internal temp reads 50°C (medium) or 65°C (well done). Tip: thin fillets cook faster; check at 2 min.' },
      { id:'hf004_s6', phase:'plate', timerSec:null,
        text:'Divide rice between 2 wide bowls. Top with the ginger bok choy and vegetables. Place salmon (chili-garlic side up) on top. Drizzle each bowl with 1 tbsp remaining ginger sauce. Sprinkle generously with crispy fried shallots.' }
    ]
  },

  // ==========================================================================
  // 5. Portuguese Piri Piri Chicken
  // ==========================================================================
  {
    id: 'hf_005',
    mealType: 'dinner',
    leftoverFriendly: true,
    nutrition: { calories: 745, protein: 50, fat: 30, carbs: 60, fiber: 8, sodium: 1100 },
    costcoSourcing: ['Kirkland boneless skinless chicken thighs', 'Kirkland russet potatoes', 'Costco bell pepper variety pack'],
    title: 'Oven-Ready Portuguese Piri Piri Chicken',
    servings: 2, timeMin: 50,
    description: 'With veggies, potatoes, and cilantro-yogurt sauce. High Protein.',
    tags: ['chicken','portuguese','high-protein','spicy'],
    image: '🌶️',
    ingredients: [
      { id:'hf005_1', qty:4, unit:'unit', name:'boneless skinless chicken thighs (~270g total)', protein:true },
      { id:'hf005_2', qty:1, unit:'unit', name:'large russet potato' },
      { id:'hf005_3', qty:1, unit:'unit', name:'red bell pepper' },
      { id:'hf005_4', qty:1, unit:'unit', name:'small red onion' },
      { id:'hf005_5', qty:7, unit:'g', name:'fresh cilantro (small bunch)' },
      { id:'hf005_6', qty:0.25, unit:'cup', name:'feta cheese, crumbled' },
      { id:'hf005_7', qty:0.33, unit:'cup', name:'plain Greek yogurt' },
      { id:'hf005_8', qty:2, unit:'tbsp', name:'Piri Piri sauce (Nando\'s, or 1 tbsp sriracha + 1 tbsp red wine vinegar + 1 tsp smoked paprika)' },
      { id:'hf005_9', qty:1.5, unit:'tbsp', name:'Chili-Cumin spice blend (1 tsp cumin + 1 tsp chili powder + ½ tsp smoked paprika + ½ tsp garlic powder + ¼ tsp dried oregano)' },
      { id:'hf005_10', qty:1, unit:'unit', name:'lemon (for yogurt sauce)' }
    ],
    steps: [
      { id:'hf005_s1', phase:'prep', timerSec:null,
        text:'Preheat oven to 220°C with rack in the middle. Scrub potato (skin on), cut into ¾-inch cubes. Core and slice bell pepper into ½-inch strips. Slice red onion into ½-inch wedges. Finely chop cilantro — about 2 tbsp.' ,
        prepNote: '→ veg go on sheet pan (step 2), chicken gets marinated (step 3)'},
      { id:'hf005_s2', phase:'cook', timerSec:1800,
        text:'On a half sheet pan: toss potato + bell pepper + red onion with 2 tbsp olive oil + ¾ tbsp of the Chili-Cumin blend + ¾ tsp coarse salt + ¼ tsp pepper. Spread in a single layer. Roast 28-30 min, flipping with a spatula at the 15-min mark. Vegetables should be deeply browned with crispy edges and a fork pierces potato easily.',
        airFryerAlt: { text:'Set Cuisinart AIR FRY mode at 210°C. Toss vegetables with 2 tbsp olive oil + ¾ tbsp Chili-Cumin blend + ¾ tsp salt + ¼ tsp pepper. Spread on the wire/perforated tray in single layer. Cook 22-25 min, shaking tray at 12 min, until deeply browned. The fan circulates better than oven — check earlier.', timerSec:1380 } ,
        parallelTask:"While the oven works: prep all remaining ingredients so you're ready to plate the moment it's done."},
      { id:'hf005_s3', phase:'prep', timerSec:null,
        text:'Pat chicken thighs very dry with paper towels. In a bowl, toss with 1 tbsp olive oil + remaining ¾ tbsp Chili-Cumin blend + the 2 tbsp Piri Piri sauce + ½ tsp salt + ¼ tsp pepper. Coat every surface.' ,
        prepNote: '→ this chicken goes on its own pan in the oven (step 4)'},
      { id:'hf005_s4', phase:'cook', timerSec:1500,
        text:'Place chicken thighs on a separate small sheet pan (or push vegetables to one side of the same pan if it fits). Roast in the same 220°C oven 23-25 min until thermometer in thickest part reads 75°C. Chicken thighs are forgiving — a little extra time only makes them juicier.',
        airFryerAlt: { text:'Place chicken thighs on the Cuisinart wire rack (clean from veg). AIR FRY at 210°C for 17-20 min, flipping at 10 min, until internal temp reads 75°C. Thighs are forgiving — they stay juicy even at 80°C.', timerSec:1080 } ,
        parallelTask:"While the oven works: prep all remaining ingredients so you're ready to plate the moment it's done."},
      { id:'hf005_s5', phase:'cook', timerSec:120,
        text:'Final 2 minutes: switch oven to BROIL (maximum heat setting). Watch closely — pull as soon as the chicken tops are charred in spots (90-150 seconds). This adds smoky depth. If using air fryer, this step is unnecessary — air fryer already chars the surface.',
        airFryerAlt: { text:'Skip — air fryer already chars the surface in the previous step. No broil needed.', timerSec:0 } },
      { id:'hf005_s6', phase:'prep', timerSec:null,
        text:'Make yogurt sauce: in a small bowl, mix ⅓ cup Greek yogurt + 1 tbsp lemon juice + half the chopped cilantro + ¼ tsp salt + 1 tbsp water. Taste; if too thick, add 1 more tsp water.' ,
        prepNote: '→ drizzled over the finished chicken at the end'},
      { id:'hf005_s7', phase:'plate', timerSec:null,
        text:'Plate the roasted vegetables. Top with chicken thighs. Drizzle the cilantro-yogurt sauce in a generous zigzag. Sprinkle with the crumbled feta and remaining cilantro. Lemon wedges on the side.' }
    ]
  },


  // ==========================================================================
  // 6. SuperQuick Korean-Style Beef Bowls
  // ==========================================================================
  {
    id: 'hf_006',
    mealType: 'dinner',
    leftoverFriendly: true,
    nutrition: { calories: 695, protein: 44, fat: 24, carbs: 72, fiber: 5, sodium: 1180 },
    costcoSourcing: ['Kirkland 90/10 ground beef', 'Kirkland jasmine rice', 'Sinto kimchi', 'Costco organic eggs', 'Kikkoman soy sauce'],
    title: 'SuperQuick Korean-Style Beef Bowls',
    servings: 2, timeMin: 20,
    description: 'With sesame-edamame rice and gingery slaw. Family Friendly. Spicy.',
    tags: ['beef','korean','quick','high-protein'],
    image: '🥩',
    ingredients: [
      { id:'hf006_1', qty:250, unit:'g', name:'ground beef (80/20)', protein:true },
      { id:'hf006_2', qty:0.75, unit:'cup', name:'jasmine rice' },
      { id:'hf006_3', qty:170, unit:'g', name:'pre-shredded coleslaw mix (cabbage + carrot)' },
      { id:'hf006_4', qty:0.5, unit:'cup', name:'shelled edamame (frozen)' },
      { id:'hf006_5', qty:2, unit:'unit', name:'green onions' },
      { id:'hf006_6', qty:3, unit:'tbsp', name:'ginger sauce (2 tbsp soy + 1 tsp brown sugar + 1 tsp grated ginger + 1 tsp toasted sesame oil + 1 tsp rice vinegar)' },
      { id:'hf006_7', qty:2, unit:'tbsp', name:'spicy mayo (2 tbsp Kewpie mayo + 1 tsp sriracha + ½ tsp lime juice)' },
      { id:'hf006_8', qty:1, unit:'tsp', name:'Better Than Bouillon vegetable base' },
      { id:'hf006_9', qty:1, unit:'tbsp', name:'sesame seeds (toasted)' },
      { id:'hf006_10', qty:2, unit:'tbsp', name:'seasoned rice vinegar' }
    ],
    steps: [
      { id:'hf006_s1', phase:'cook', timerSec:900,
        text:'In a medium saucepan, bring 1¼ cups water + 1 tsp Better Than Bouillon (whisk to dissolve) to a boil. Add rice, stir once, reduce to LOW, cover, cook 15 min. Off heat, stir in the frozen edamame + ½ tbsp sesame seeds. Cover, rest 5 min (residual heat thaws edamame).' ,
        parallelTask:"While rice cooks: do all the prep below (chop veg, slice protein, make sauces) so you're ready to cook the moment it's done."},
      { id:'hf006_s2', phase:'prep', timerSec:null,
        text:'Thinly slice green onions on a diagonal — whites and greens separately if you want; otherwise together. In a medium bowl, whisk 2 tbsp rice vinegar + ½ tsp sugar + ¼ tsp salt. Add the coleslaw mix and toss. Let sit while you cook the beef — it softens slightly and absorbs the dressing.' ,
        prepNote: '→ this IS the slaw — it sits while beef cooks'},
      { id:'hf006_s3', phase:'cook', timerSec:360,
        text:'Heat a 10-inch non-stick skillet over medium-high with ½ tbsp neutral oil. Add the ground beef. Break into small crumbles. Cook undisturbed 2 min for browning, then stir and continue cooking 4 more min until no pink remains and crispy bits form. Drain off excess fat if more than 1 tbsp.' },
      { id:'hf006_s4', phase:'cook', timerSec:90,
        text:'Reduce heat to MEDIUM. Pour the 3 tbsp ginger sauce over the beef. Stir to coat every crumble. Cook 60-90 seconds until the sauce reduces and looks glossy/sticky.' },
      { id:'hf006_s5', phase:'plate', timerSec:null,
        text:'Divide rice between 2 wide bowls. Top with the saucy beef, then a generous mound of the gingery slaw. Drizzle 1 tbsp spicy mayo per bowl. Sprinkle with green onions and remaining ½ tbsp sesame seeds.' }
    ]
  },

  // ==========================================================================
  // 7. Moroccan Poached Salmon Tagine
  // ==========================================================================
  {
    id: 'hf_007',
    mealType: 'dinner',
    leftoverFriendly: false,
    nutrition: { calories: 680, protein: 40, fat: 24, carbs: 70, fiber: 9, sodium: 880 },
    costcoSourcing: ['Costco Atlantic salmon fillets', 'Kirkland organic couscous', 'Costco zucchini'],
    title: 'Smart Moroccan-Spiced Poached Salmon Tagine',
    servings: 2, timeMin: 30,
    description: 'With chickpeas, zucchini, and tomato. High Protein.',
    tags: ['salmon','moroccan','high-protein'],
    image: '🍲',
    ingredients: [
      { id:'hf007_1', qty:2, unit:'unit', name:'salmon fillets, skin-on (~5-6 oz each)', protein:true },
      { id:'hf007_2', qty:1, unit:'unit', name:'can chickpeas (14 oz), drained' },
      { id:'hf007_3', qty:1, unit:'unit', name:'medium zucchini' },
      { id:'hf007_4', qty:1, unit:'unit', name:'medium tomato' },
      { id:'hf007_5', qty:1, unit:'unit', name:'shallot' },
      { id:'hf007_6', qty:2, unit:'clove', name:'garlic',
        alternates: [{ modeId:'paste', qty:2, unit:'tsp', name:'garlic paste' }] },
      { id:'hf007_7', qty:7, unit:'g', name:'fresh parsley (small bunch)' },
      { id:'hf007_8', qty:1, unit:'tbsp', name:'Moroccan spice blend (1 tsp cumin + ½ tsp paprika + ½ tsp coriander + ¼ tsp ginger + ¼ tsp cinnamon + ¼ tsp turmeric)' },
      { id:'hf007_9', qty:2, unit:'tbsp', name:'tomato paste' }
    ],
    steps: [
      { id:'hf007_s1', phase:'prep', timerSec:null,
        text:'Thinly slice shallot into rings. Mince garlic (or measure paste). Halve zucchini lengthwise, cut into ½-inch half-moons. Core tomato and cut into ½-inch dice. Pick parsley leaves and chop fine — about 2 tbsp.' },
      { id:'hf007_s2', phase:'cook', timerSec:180,
        text:'Heat a 12-inch skillet (with a lid, that fits the salmon flat) over medium with 1 tbsp olive oil. Add shallot, cook 2 min until softened. Add minced garlic + 1 tbsp Moroccan spice blend. Stir constantly for 45 seconds until fragrant — don\'t let the spices burn.',
        pasteAlt: { text:'Heat a 12-inch skillet with a lid over medium with 1 tbsp olive oil. Add shallot, cook 2 min until softened. Add 2 tsp garlic paste + 1 tbsp Moroccan spice. Stir constantly 20-30 seconds — paste burns very fast.', timerSec:150 } },
      { id:'hf007_s3', phase:'cook', timerSec:300,
        text:'Add the 2 tbsp tomato paste. Stir constantly 60 seconds until it darkens to brick red (this kills the raw tomato taste). Add the diced tomato + ¾ cup water + ½ tsp sugar + ¼ tsp coarse salt + ¼ tsp pepper. Bring to a simmer, then cook 4 minutes until tomatoes break down.' },
      { id:'hf007_s4', phase:'cook', timerSec:300,
        text:'Add the drained chickpeas + zucchini half-moons. Stir, return to a simmer. Cook uncovered 5 min, stirring once, until zucchini begins to soften.' },
      { id:'hf007_s5', phase:'cook', timerSec:480,
        text:'Pat salmon very dry. Season with ½ tsp coarse salt + ¼ tsp pepper. Nestle salmon SKIN-SIDE-DOWN into the simmering tagine, pushing it down so the liquid comes ⅔ up the sides of the fillet. Cover. Reduce heat to medium-low. Cook 6-8 min — salmon is done when it flakes easily and internal temp reads 50°C (medium) or 65°C (well done). Don\'t flip; the steam under the lid cooks the top.' ,
        parallelTask:'While it simmers: chop garnishes, slice cooked items, set out serving plates.'},
      { id:'hf007_s6', phase:'plate', timerSec:null,
        text:'Divide tagine between 2 shallow bowls, salmon on top. Sprinkle generously with chopped parsley. Serve with crusty bread to soak up the sauce.' }
    ]
  },

  // ==========================================================================
  // 8. Chicken, Feta & Cucumber Gyro Bowls
  // ==========================================================================
  {
    id: 'hf_008',
    mealType: 'dinner',
    leftoverFriendly: true,
    nutrition: { calories: 670, protein: 48, fat: 24, carbs: 60, fiber: 6, sodium: 1020 },
    costcoSourcing: ['Kirkland boneless skinless chicken thighs', 'Kirkland feta block', 'Kirkland Greek yogurt 2%', 'Costco cucumbers'],
    title: 'Chicken, Feta & Cucumber Gyro Bowls',
    servings: 2, timeMin: 30,
    description: 'With rice and lemon-dill yogurt sauce. High Protein.',
    tags: ['chicken','greek','high-protein','bowls'],
    image: '🥗',
    ingredients: [
      { id:'hf008_1', qty:2, unit:'unit', name:'boneless skinless chicken breasts', protein:true },
      { id:'hf008_2', qty:0.75, unit:'cup', name:'long-grain white rice' },
      { id:'hf008_3', qty:1, unit:'unit', name:'red bell pepper' },
      { id:'hf008_4', qty:1, unit:'unit', name:'medium tomato' },
      { id:'hf008_5', qty:2, unit:'unit', name:'mini cucumbers (or ½ English cucumber)' },
      { id:'hf008_6', qty:1, unit:'unit', name:'shallot' },
      { id:'hf008_7', qty:1, unit:'unit', name:'lemon' },
      { id:'hf008_8', qty:0.25, unit:'cup', name:'feta cheese, crumbled' },
      { id:'hf008_9', qty:0.5, unit:'cup', name:'plain Greek yogurt (full fat)' },
      { id:'hf008_10', qty:1, unit:'tbsp', name:'Zesty Garlic blend (½ tsp garlic powder + ¼ tsp onion powder + ½ tsp dried parsley + ½ tsp dried oregano + ¼ tsp dried lemon peel + ¼ tsp salt)' },
      { id:'hf008_11', qty:1, unit:'tsp', name:'Dill-Garlic blend (½ tsp dried dill + ¼ tsp garlic powder + ¼ tsp onion powder)' },
      { id:'hf008_12', qty:1, unit:'tsp', name:'Better Than Bouillon chicken base' }
    ],
    steps: [
      { id:'hf008_s1', phase:'cook', timerSec:1200,
        text:'In a medium saucepan, bring 1¼ cups water + 1 tsp Better Than Bouillon chicken base + ½ tbsp butter to a boil. Add rice, stir once, reduce to LOW, cover, cook 18-20 min. Off heat, rest 5 min. Fluff with fork.' ,
        parallelTask:'While rice cooks: do all the prep below (chop veg, slice protein, make sauces). 15 minutes is enough to get everything ready.'},
      { id:'hf008_s2', phase:'prep', timerSec:null,
        text:'Mince shallot (about 2 tbsp). Dice cucumbers, tomato, and bell pepper into ¼-inch pieces (small dice). Zest the lemon with a microplane (about 1 tsp zest), then juice the whole lemon (about 2-3 tbsp juice).' ,
        prepNote: '→ cucumber + tomato + pepper → Greek salad (step 4)'},
      { id:'hf008_s3', phase:'prep', timerSec:null,
        text:'Make yogurt sauce: in a small bowl, whisk together ½ cup Greek yogurt + 1 tsp lemon zest + 1 tbsp lemon juice + the 1 tsp Dill-Garlic blend + 1 tbsp olive oil + ¼ tsp salt + ⅛ tsp pepper. If too thick, add 1 tsp water.' ,
        prepNote: '→ this is the tzatziki — drizzled at the end'},
      { id:'hf008_s4', phase:'prep', timerSec:null,
        text:'Make Greek salad: in a medium bowl, toss diced cucumber + tomato + bell pepper + minced shallot with remaining 1-2 tbsp lemon juice + 1 tbsp olive oil + ¼ tsp salt + ⅛ tsp pepper. Let sit while chicken cooks.' ,
        prepNote: '→ sits alongside the rice in the bowl'},
      { id:'hf008_s5', phase:'prep', timerSec:null,
        text:'Pat chicken very dry. Season both sides evenly with the 1 tbsp Zesty Garlic blend + ¼ tsp additional coarse salt + ⅛ tsp pepper. Rub the seasoning in firmly.' },
      { id:'hf008_s6', phase:'cook', timerSec:540,
        text:'Heat a 12-inch non-stick skillet over medium-high with 1 tbsp olive oil. When oil shimmers, place chicken smooth-side-down. Sear undisturbed 4-5 min until deep golden crust forms. Flip, reduce heat to MEDIUM, cook 4-5 more min until thermometer reads 75°C. Rest on cutting board 5 min, then slice on the bias into ½-inch slices.',
        airFryerAlt: { text:'Brush seasoned chicken with 1 tsp olive oil. Place on Cuisinart wire rack. AIR FRY at 195°C for 14-18 min, flipping at 8 min, until internal temp reads 75°C. Rest 5 min before slicing.', timerSec:1080 } },
      { id:'hf008_s7', phase:'plate', timerSec:null,
        text:'Divide rice between 2 wide bowls. Top each with a portion of Greek salad and the sliced chicken. Drizzle yogurt sauce in a generous zigzag. Sprinkle crumbled feta over the top.' }
    ]
  },

  // ==========================================================================
  // 9. Chicken Vindaloo
  // ==========================================================================
  {
    id: 'hf_009',
    mealType: 'dinner',
    leftoverFriendly: true,
    nutrition: { calories: 720, protein: 46, fat: 22, carbs: 78, fiber: 7, sodium: 980 },
    costcoSourcing: ['Kirkland boneless skinless chicken thighs', 'Kirkland basmati rice', 'Kirkland canned coconut milk', 'Patak\'s vindaloo paste'],
    noTomatoNote: 'HF version uses tomato base. Substitute with full-fat coconut milk + 1 tbsp tamarind paste for the same body and tang.',
    title: 'Indian Spiced Chicken Vindaloo with Bulgur',
    servings: 2, timeMin: 35,
    description: 'High Protein. Restaurant-style at home.',
    tags: ['chicken','indian','high-protein'],
    image: '🍛',
    ingredients: [
      { id:'hf009_1', qty:2, unit:'unit', name:'boneless skinless chicken breasts', protein:true },
      { id:'hf009_2', qty:0.5, unit:'cup', name:'bulgur wheat (medium grind)' },
      { id:'hf009_3', qty:1, unit:'unit', name:'red bell pepper' },
      { id:'hf009_4', qty:0.5, unit:'unit', name:'red onion' },
      { id:'hf009_5', qty:2, unit:'cup', name:'baby spinach (~60g, loosely packed)' },
      { id:'hf009_6', qty:7, unit:'g', name:'fresh cilantro (small bunch)' },
      { id:'hf009_7', qty:2, unit:'tbsp', name:'ginger-garlic puree (1 tbsp grated ginger + 3 cloves grated garlic)',
        alternates: [{ modeId:'paste', qty:2, unit:'tbsp', name:'jarred ginger-garlic paste' }] },
      { id:'hf009_8', qty:0.5, unit:'cup', name:'Tikka sauce (¼ cup tomato paste + ¼ cup heavy cream + 1 tsp garam masala + ¼ tsp salt + ¼ tsp sugar, simmered 2 min)' },
      { id:'hf009_9', qty:2, unit:'tbsp', name:'tomato paste' },
      { id:'hf009_10', qty:1, unit:'tbsp', name:'Dal spice blend (1 tsp cumin + ½ tsp coriander + ½ tsp turmeric + ½ tsp garam masala + ¼ tsp cardamom)' },
      { id:'hf009_11', qty:1, unit:'tbsp', name:'red wine vinegar (or apple cider vinegar)' },
      { id:'hf009_12', qty:1, unit:'tsp', name:'Better Than Bouillon vegetable base' }
    ],
    steps: [
      { id:'hf009_s1', phase:'cook', timerSec:720,
        text:'In a small pot, bring 1 cup water + 1 tsp Better Than Bouillon + ½ tbsp butter to a boil. Add bulgur, stir, cover, REMOVE FROM HEAT (do not keep cooking). Let sit 12 min — bulgur absorbs the liquid off-heat. Fluff with fork.' ,
        parallelTask:'While bulgur absorbs: do all the prep work for the chicken and vegetables — you have a full 12 minutes.'},
      { id:'hf009_s2', phase:'prep', timerSec:null,
        text:'Cut chicken into 1-inch cubes. Core and dice bell pepper into ½-inch pieces. Halve and slice red onion into ½-inch wedges. Finely chop cilantro — about 2 tbsp.' ,
        prepNote: '→ chicken gets seared (step 3), veg go into the sauce (step 4)'},
      { id:'hf009_s3', phase:'cook', timerSec:360,
        text:'Heat a 12-inch non-stick skillet over medium-high with 1 tbsp neutral oil. Pat chicken dry, season with ½ tsp coarse salt + ¼ tsp pepper. Add chicken in single layer (don\'t overcrowd; cook in 2 batches if needed). Sear undisturbed 3 min, then stir and cook 3 more min until golden and just cooked through (internal temp 75°C). Transfer to a plate.',
        airFryerAlt: { text:'Toss cubed chicken with 1 tbsp neutral oil + ½ tsp salt + ¼ tsp pepper. Spread on Cuisinart wire rack in a single layer. AIR FRY at 210°C for 8-10 min, shaking at 5 min, until internal temp reads 75°C. Transfer to a plate.', timerSec:540 } },
      { id:'hf009_s4', phase:'cook', timerSec:240,
        text:'Reduce skillet heat to MEDIUM. Add 1 tbsp neutral oil + onion + bell pepper. Cook 3 min until softened. Add the ginger-garlic puree + Dal spice blend. Stir constantly 45-60 seconds until fragrant — do not burn the spices.',
        pasteAlt: { text:'Reduce heat to MEDIUM. Add 1 tbsp oil + onion + bell pepper. Cook 3 min until softened. Add ginger-garlic paste + Dal spice. Stir constantly 30 seconds — paste cooks faster.', timerSec:210 } },
      { id:'hf009_s5', phase:'cook', timerSec:240,
        text:'Add the 2 tbsp tomato paste + 1 tbsp vinegar + 1 tsp sugar. Stir 60 seconds until tomato paste darkens. Add the Tikka sauce + ¼ cup water. Bring to a simmer, cook 3 min until slightly thickened.' },
      { id:'hf009_s6', phase:'cook', timerSec:120,
        text:'Return chicken to skillet (with any accumulated juices). Add the baby spinach. Stir until spinach wilts — about 90 seconds. Taste and adjust with salt (¼ tsp at a time).' },
      { id:'hf009_s7', phase:'plate', timerSec:null,
        text:'Divide bulgur between 2 bowls. Spoon vindaloo over the top. Sprinkle generously with chopped cilantro.' }
    ]
  },

  // ==========================================================================
  // 10. Turkey Chili & Roasted Potato Hash Bowls
  // ==========================================================================
  {
    id: 'hf_010',
    mealType: 'dinner',
    leftoverFriendly: true,
    nutrition: { calories: 650, protein: 44, fat: 22, carbs: 65, fiber: 11, sodium: 940 },
    costcoSourcing: ['Kirkland extra lean ground turkey', 'Kirkland russet potatoes', 'Costco canned white beans', 'Costco canned green chiles'],
    noTomatoNote: 'HF version uses tomato base. Build as a white chili: ground turkey, white beans, green chiles, cumin, lime, garlic.',
    title: 'Turkey Chili & Roasted Potato Hash Bowls',
    servings: 2, timeMin: 35,
    description: 'With sour cream and bell peppers. Family Friendly. High Protein.',
    tags: ['turkey','tex-mex','family-friendly','high-protein'],
    image: '🌶️',
    ingredients: [
      { id:'hf010_1', qty:250, unit:'g', name:'ground turkey (93/7)', protein:true },
      { id:'hf010_2', qty:350, unit:'g', name:'yellow potatoes (Yukon Gold)' },
      { id:'hf010_3', qty:1, unit:'unit', name:'green bell pepper' },
      { id:'hf010_4', qty:2, unit:'unit', name:'green onions' },
      { id:'hf010_5', qty:1, unit:'unit', name:'medium tomato' },
      { id:'hf010_6', qty:3, unit:'tbsp', name:'sour cream' },
      { id:'hf010_7', qty:0.5, unit:'cup', name:'sharp cheddar, shredded' },
      { id:'hf010_8', qty:1, unit:'tbsp', name:'Tex-Mex paste (1 tbsp tomato paste + 1 tsp chipotle in adobo + ½ tsp smoked paprika + ¼ tsp cocoa powder + ¼ tsp cumin)' },
      { id:'hf010_9', qty:2, unit:'tbsp', name:'tomato paste' }
    ],
    steps: [
      { id:'hf010_s1', phase:'cook', timerSec:1500,
        text:'Preheat oven to 230°C with rack in the middle. Cube potatoes (skin on) into ½-inch pieces. On a half sheet pan: toss with 1 tbsp olive oil + ¾ tsp coarse salt + ¼ tsp pepper. Spread in single layer. Roast 22-25 min, flipping with a spatula at 12 min, until deeply golden and crispy on the outside.',
        airFryerAlt: { text:'Set Cuisinart AIR FRY at 225°C. Toss potatoes with 1 tbsp olive oil + ¾ tsp salt + ¼ tsp pepper. Spread on wire/perforated tray in single layer. AIR FRY 18-20 min, shaking tray at 10 min, until crispy outside and tender inside.', timerSec:1140 } ,
        parallelTask:"While the oven works: prep all remaining ingredients so you're ready to plate the moment it's done."},
      { id:'hf010_s2', phase:'prep', timerSec:null,
        text:'Core and dice bell pepper into ¼-inch pieces. Thinly slice green onions on a diagonal. Core and dice tomato into ¼-inch pieces.' ,
        prepNote: '→ peppers go into the turkey (step 4), tomato is a topping at the end'},
      { id:'hf010_s3', phase:'cook', timerSec:360,
        text:'Heat a 10-inch non-stick skillet over medium-high with 1 tbsp neutral oil. Add ground turkey, break into small pieces. Cook undisturbed 2 min, then stir and continue 4 min until no pink remains. Season with ½ tsp salt + ¼ tsp pepper.' },
      { id:'hf010_s4', phase:'cook', timerSec:420,
        text:'Add the diced bell pepper, cook 2 min until softened. Add the Tex-Mex paste + 2 tbsp tomato paste. Stir constantly 60 seconds until darkened. Add ⅓ cup water. Simmer 4-5 min until thickened to a chili-like consistency.' },
      { id:'hf010_s5', phase:'cook', timerSec:null,
        text:'Stir the roasted potatoes into the chili. The potatoes will absorb some sauce — that\'s good.' },
      { id:'hf010_s6', phase:'plate', timerSec:null,
        text:'Divide between 2 bowls. While still hot, top each with ¼ cup shredded cheddar (it melts from residual heat). Top with diced tomato, sliced green onions, and a generous dollop of sour cream. Serve immediately.' }
    ]
  },

  // ==========================================================================
  // 11. Smoky Dry-Rub Chicken with Wedges & Ranch
  // ==========================================================================
  {
    id: 'hf_011',
    mealType: 'dinner',
    leftoverFriendly: true,
    nutrition: { calories: 690, protein: 50, fat: 26, carbs: 58, fiber: 7, sodium: 1050 },
    costcoSourcing: ['Kirkland boneless skinless chicken thighs', 'Kirkland russet potatoes', 'Kirkland organic ranch'],
    title: 'Smoky Dry-Rub Chicken with Wedges & Ranch',
    servings: 2, timeMin: 35,
    description: 'With corn, roasted potato wedges, and ranch dressing. High Protein.',
    tags: ['chicken','american','bbq','high-protein'],
    image: '🥔',
    ingredients: [
      { id:'hf011_1', qty:2, unit:'unit', name:'boneless skinless chicken breasts', protein:true },
      { id:'hf011_2', qty:350, unit:'g', name:'yellow potatoes (Yukon Gold)' },
      { id:'hf011_3', qty:0.75, unit:'cup', name:'corn kernels (frozen or canned, drained)' },
      { id:'hf011_4', qty:1, unit:'unit', name:'red bell pepper' },
      { id:'hf011_5', qty:2, unit:'unit', name:'green onions' },
      { id:'hf011_6', qty:1, unit:'tbsp', name:'Applewood Smoke blend (1 tsp smoked paprika + ½ tsp brown sugar + ½ tsp garlic powder + ¼ tsp onion powder + ¼ tsp cumin + ¼ tsp salt)' },
      { id:'hf011_7', qty:0.5, unit:'tsp', name:'garlic salt' },
      { id:'hf011_8', qty:4, unit:'tbsp', name:'ranch dressing (store-bought or homemade)' }
    ],
    steps: [
      { id:'hf011_s1', phase:'cook', timerSec:1500,
        text:'Preheat oven to 230°C with rack in the middle. Scrub potatoes, cut into wedges (cut potato in half lengthwise, then each half into 4 long wedges = 8 per potato). On a half sheet pan: toss with 1 tbsp olive oil + ½ tsp garlic salt + ¼ tsp pepper. Spread in single layer, cut-sides down. Roast 25 min, flipping at 12 min, until deeply golden and crispy.',
        airFryerAlt: { text:'Set Cuisinart AIR FRY at 225°C. Toss wedges with 1 tbsp olive oil + ½ tsp garlic salt + ¼ tsp pepper. Arrange on wire/perforated tray cut-side-down in single layer. AIR FRY 20-22 min, shaking at 10 min, until crispy.', timerSec:1260 } ,
        parallelTask:"While the oven works: prep all remaining ingredients so you're ready to plate the moment it's done."},
      { id:'hf011_s2', phase:'prep', timerSec:null,
        text:'Core and dice bell pepper into ¼-inch pieces. Thinly slice green onions on a diagonal — about 3 tbsp.' ,
        prepNote: '→ peppers go into the corn salsa (step 5)'},
      { id:'hf011_s3', phase:'prep', timerSec:null,
        text:'Pat chicken very dry with paper towels. Rub all over with 1 tsp olive oil. Then evenly coat with the entire 1 tbsp Applewood Smoke blend + ¼ tsp additional coarse salt + ⅛ tsp pepper. Use your hands to press the rub firmly into the meat.' },
      { id:'hf011_s4', phase:'cook', timerSec:600,
        text:'Heat a 12-inch oven-safe skillet over medium-high with 1 tbsp olive oil. When oil shimmers, place chicken smooth-side-down. Sear undisturbed 4-5 min until a deep dark crust forms (the brown sugar in the rub helps caramelize). Flip and cook 4-5 min until internal temp reads 75°C. Rest 5 min on cutting board.',
        airFryerAlt: { text:'Brush rubbed chicken with 1 tsp neutral oil. Place on Cuisinart wire rack. AIR FRY at 195°C for 14-18 min, flipping at 8 min, until internal temp reads 75°C. The brown sugar in the rub may darken quickly — that\'s desired flavor. Rest 5 min before slicing.', timerSec:1080 } },
      { id:'hf011_s5', phase:'cook', timerSec:300,
        text:'In the same skillet (or a fresh 10-inch non-stick), medium heat with 1 tbsp butter. Add corn + diced bell pepper. Cook stirring occasionally 4-5 min until corn is lightly charred in spots and bell pepper is softened.' },
      { id:'hf011_s6', phase:'cook', timerSec:null,
        text:'Off heat. Stir in the sliced green onions + ¼ tsp salt + ⅛ tsp pepper. Taste and adjust.' },
      { id:'hf011_s7', phase:'plate', timerSec:null,
        text:'Slice chicken on the bias into ½-inch slices. Plate: pile of crispy potato wedges + sliced chicken + corn salsa. Serve ranch in small bowls alongside for dipping or drizzling.' }
    ]
  },

  // ==========================================================================
  // 12. Vietnamese Lemongrass Chicken with Rice Noodles
  // ==========================================================================
  {
    id: 'hf_012',
    mealType: 'dinner',
    leftoverFriendly: true,
    nutrition: { calories: 660, protein: 42, fat: 20, carbs: 75, fiber: 5, sodium: 1180 },
    costcoSourcing: ['Kirkland boneless skinless chicken thighs', 'Kirkland jasmine rice', 'Costco organic carrots', 'Roasted peanuts'],
    noTomatoNote: 'Skip the tomato garnish. Use extra carrot ribbons and pickled cabbage instead.',
    noCilantroNote: 'Skip cilantro garnish. Use scallions and Thai basil instead.',
    title: 'Vietnamese Lemongrass Chicken with Rice Noodles',
    servings: 2, timeMin: 45,
    description: 'With nuoc cham, carrots, and lettuce. High Protein.',
    tags: ['chicken','vietnamese','high-protein','noodles'],
    image: '🌿',
    ingredients: [
      { id:'hf012_1', qty:4, unit:'unit', name:'boneless skinless chicken thighs (~270g total)', protein:true },
      { id:'hf012_2', qty:1, unit:'unit', name:'lemongrass stalk (or 1 tbsp lemongrass paste)',
        alternates: [{ modeId:'paste', qty:1, unit:'tbsp', name:'lemongrass paste (Gourmet Garden or similar)' }] },
      { id:'hf012_3', qty:100, unit:'g', name:'dried rice vermicelli noodles (bún)' },
      { id:'hf012_4', qty:1, unit:'unit', name:'carrot, julienned (or pre-shredded ~56g)' },
      { id:'hf012_5', qty:0.5, unit:'unit', name:'romaine lettuce head' },
      { id:'hf012_6', qty:7, unit:'g', name:'fresh cilantro (small bunch)' },
      { id:'hf012_7', qty:1, unit:'unit', name:'lime' },
      { id:'hf012_8', qty:1, unit:'unit', name:'small tomato' },
      { id:'hf012_9', qty:2, unit:'clove', name:'garlic',
        alternates: [{ modeId:'paste', qty:2, unit:'tsp', name:'garlic paste' }] },
      { id:'hf012_10', qty:0.25, unit:'cup', name:'roasted peanuts, chopped' },
      { id:'hf012_11', qty:1, unit:'tbsp', name:'soy sauce' },
      { id:'hf012_12', qty:2, unit:'tbsp', name:'fish sauce (Red Boat or Three Crabs)' },
      { id:'hf012_13', qty:4, unit:'tbsp', name:'Nuoc Cham (3 tbsp fish sauce + 3 tbsp water + 2 tbsp lime juice + 2 tbsp sugar + 1 minced garlic clove + ½ small chili)' }
    ],
    steps: [
      { id:'hf012_s1', phase:'prep', timerSec:900,
        text:'Trim lemongrass: cut off tough top and bulb-bottom, peel away tough outer layers to reveal the pale tender core. Finely mince this core (about 1 tbsp). Mince garlic. In a medium bowl, combine chicken thighs + minced lemongrass + half the minced garlic + 1 tbsp fish sauce + 1 tbsp soy sauce + 1 tbsp neutral oil + 1 tbsp sugar + ½ tsp pepper. Massage in with your hands. Let marinate 15 minutes at room temperature (the salt + sugar tenderizes; longer is fine).',
        pasteAlt: { text:'In a medium bowl, combine chicken thighs + 1 tbsp lemongrass paste + 1 tsp garlic paste + 1 tbsp fish sauce + 1 tbsp soy sauce + 1 tbsp neutral oil + 1 tbsp sugar + ½ tsp pepper. Massage in. Marinate 15 minutes.', timerSec:900 } },
      { id:'hf012_s2', phase:'cook', timerSec:480,
        text:'Bring a kettle or pot of water to a boil. Place noodles in a large heatproof bowl. Pour boiling water over to fully submerge. Soak 6-8 minutes (check package — they should be tender but with slight bite). Drain in a colander and rinse with cold water to stop cooking and remove excess starch. Toss with 1 tsp neutral oil to prevent sticking.' ,
        parallelTask:'While noodles cook: prep all ingredients for the sauce/topping so you can toss everything together immediately.'},
      { id:'hf012_s3', phase:'prep', timerSec:null,
        text:'Shred lettuce (chiffonade by stacking leaves, rolling, then slicing thin). Thinly slice tomato. Roughly chop cilantro. If you didn\'t buy pre-shredded carrot, peel and julienne (cut into matchsticks) or use the large holes of a box grater.' ,
        prepNote: '→ these go directly into the bowl at plating'},
      { id:'hf012_s4', phase:'cook', timerSec:720,
        text:'Heat a 12-inch non-stick skillet over medium-high with 1 tbsp neutral oil. Remove chicken from marinade (let excess drip off). Add to skillet smooth-side-down. Sear undisturbed 5-6 min until deeply caramelized (the sugar in the marinade browns fast). Flip, cook 5-6 more min until internal temp reads 75°C. Rest on cutting board 5 min, then slice into ½-inch strips against the grain.',
        airFryerAlt: { text:'Place marinated thighs (let excess drip off) on Cuisinart wire rack. AIR FRY at 210°C for 14-18 min, flipping at 8 min. Internal temp should read 75°C. The marinade sugars caramelize beautifully. Rest 5 min, then slice.', timerSec:1080 } },
      { id:'hf012_s5', phase:'plate', timerSec:null,
        text:'Build the bowls (in this order, layered): noodles on the bottom, then shredded lettuce + julienned carrot + tomato slices around the edges. Place sliced chicken on top. Spoon the 4 tbsp Nuoc Cham generously over everything (this is the dressing — be liberal). Top with chopped cilantro, chopped peanuts, and a lime wedge for squeezing.' }
    ]
  },

  // ==========================================================================
  // 13. Chinese Kung Pao Chicken
  // ==========================================================================
  {
    id: 'hf_013',
    mealType: 'dinner',
    leftoverFriendly: true,
    nutrition: { calories: 715, protein: 48, fat: 26, carbs: 70, fiber: 5, sodium: 1240 },
    costcoSourcing: ['Kirkland boneless skinless chicken breasts', 'Kirkland jasmine rice', 'Costco bell pepper variety pack', 'Roasted peanuts'],
    title: 'Chinese Kung Pao Chicken with Ginger Rice',
    servings: 2, timeMin: 35,
    description: 'With peppers, celery, peanuts. Spicy.',
    tags: ['chicken','chinese','spicy','stir-fry'],
    image: '🥡',
    ingredients: [
      { id:'hf013_1', qty:4, unit:'unit', name:'boneless skinless chicken thighs (~270g total)', protein:true },
      { id:'hf013_2', qty:0.75, unit:'cup', name:'basmati or jasmine rice' },
      { id:'hf013_3', qty:1, unit:'unit', name:'red bell pepper' },
      { id:'hf013_4', qty:3, unit:'unit', name:'celery stalks' },
      { id:'hf013_5', qty:3, unit:'unit', name:'green onions' },
      { id:'hf013_6', qty:2, unit:'clove', name:'garlic',
        alternates: [{ modeId:'paste', qty:2, unit:'tsp', name:'garlic paste' }] },
      { id:'hf013_7', qty:15, unit:'g', name:'fresh ginger (1-inch knob)',
        alternates: [{ modeId:'paste', qty:1, unit:'tbsp', name:'ginger paste' }] },
      { id:'hf013_8', qty:0.33, unit:'cup', name:'roasted unsalted peanuts' },
      { id:'hf013_9', qty:3, unit:'tbsp', name:'soy sauce' },
      { id:'hf013_10', qty:2, unit:'tbsp', name:'sweet chili sauce' },
      { id:'hf013_11', qty:1, unit:'tbsp', name:'chili-garlic sauce (Huy Fong)' },
      { id:'hf013_12', qty:2, unit:'tbsp', name:'cornstarch' }
    ],
    steps: [
      { id:'hf013_s1', phase:'cook', timerSec:900,
        text:'Grate half the ginger (about 1½ tsp). In a medium saucepan, bring 1¼ cups water + grated ginger + ¼ tsp salt to a boil. Add rice, stir once, reduce to LOW, cover, cook 15 min. Off heat, rest 5 min covered.',
        pasteAlt: { text:'In a medium saucepan, bring 1¼ cups water + ½ tbsp ginger paste + ¼ tsp salt to a boil. Add rice, stir once, reduce to LOW, cover, cook 15 min. Off heat, rest 5 min covered.', timerSec:900 } ,
        parallelTask:'While rice cooks: do all the prep below (chop veg, slice protein, make sauces). 15 minutes is enough to get everything ready.'},
      { id:'hf013_s2', phase:'prep', timerSec:null,
        text:'Cut chicken into ¾-inch cubes. Core bell pepper and cut into ½-inch pieces. Slice celery on a diagonal into ½-inch pieces. Slice green onions on a diagonal (keep whites and greens separate — whites for cooking, greens for garnish). Mince garlic. Mince the remaining half of the ginger (about 1 tbsp).' ,
        prepNote: '→ veg go into the wok (step 5-6), chicken gets velveted (step 3)'},
      { id:'hf013_s3', phase:'prep', timerSec:null,
        text:'In a medium bowl, toss the cubed chicken with 1 tbsp cornstarch + 1 tbsp soy sauce + 1 tsp neutral oil. Massage to coat every piece. (The cornstarch creates a velvety crust — Chinese restaurant technique called "velveting".)' ,
        prepNote: '→ chicken goes into the hot wok (step 5)'},
      { id:'hf013_s4', phase:'prep', timerSec:null,
        text:'Whisk the sauce in a small bowl: remaining 2 tbsp soy sauce + 2 tbsp sweet chili + 1 tbsp chili-garlic + 2 tsp sugar + ¼ cup water + 1 tbsp cornstarch (yes, more cornstarch — this thickens the sauce in the pan).' ,
        prepNote: '→ sauce gets poured into the wok (step 6)'},
      { id:'hf013_s5', phase:'cook', timerSec:360,
        text:'Heat a wok or large 14-inch skillet over HIGH heat with 2 tbsp neutral oil (peanut or vegetable). When oil is shimmering and ALMOST smoking (this is key for stir-fry), add chicken in a single layer. Don\'t stir for 60 seconds — let it sear. Then stir-fry vigorously 4-5 more minutes until golden and just cooked through. Transfer to a plate.' },
      { id:'hf013_s6', phase:'cook', timerSec:240,
        text:'Return wok to medium-high. Add 1 tbsp neutral oil + bell pepper + celery + green onion whites + minced garlic + minced ginger. Stir-fry 2 min — vegetables should be tender-crisp. Re-whisk the sauce (cornstarch settles) and pour in. It will bubble and thicken in 30-60 seconds. Return chicken with juices to the wok. Toss to coat. Cook 60 seconds more until glossy and saucy.',
        pasteAlt: { text:'Return wok to medium-high. Add 1 tbsp oil + bell pepper + celery + green onion whites + 2 tsp garlic paste + remaining ginger paste. Stir-fry 90 seconds — paste burns fast so move quickly. Re-whisk sauce, pour in, bubble and thicken 30-60 sec. Return chicken, toss to coat.', timerSec:180 } },
      { id:'hf013_s7', phase:'plate', timerSec:null,
        text:'Off heat. Stir in the peanuts (they should stay crunchy — don\'t cook them). Divide rice between 2 bowls. Top with the Kung Pao. Garnish with the reserved green onion greens.' }
    ]
  },

  // ==========================================================================
  // 14. Mango-Glazed Salmon with Curried Chickpeas
  // ==========================================================================
  {
    id: 'hf_014',
    mealType: 'dinner',
    leftoverFriendly: false,
    nutrition: { calories: 720, protein: 38, fat: 24, carbs: 80, fiber: 8, sodium: 880 },
    costcoSourcing: ['Costco Atlantic salmon fillets', 'Kirkland canned chickpeas', 'Kirkland canned coconut milk', 'Mango chutney'],
    title: 'Smart Mango-Glazed Salmon with Curried Chickpeas',
    servings: 2, timeMin: 30,
    description: 'With crispy shallots. High Protein.',
    tags: ['salmon','indian','high-protein'],
    image: '🥭',
    ingredients: [
      { id:'hf014_1', qty:2, unit:'unit', name:'salmon fillets, skin-on (~5-6 oz each)', protein:true },
      { id:'hf014_2', qty:1, unit:'unit', name:'can chickpeas (14 oz), drained but reserve liquid' },
      { id:'hf014_3', qty:0.5, unit:'unit', name:'carrot, finely diced (~¼ cup)' },
      { id:'hf014_4', qty:7, unit:'g', name:'fresh cilantro (small bunch)' },
      { id:'hf014_5', qty:2, unit:'tbsp', name:'crispy fried shallots (jarred)' },
      { id:'hf014_6', qty:3, unit:'tbsp', name:'mango chutney (Patak\'s Major Grey)' },
      { id:'hf014_7', qty:1.5, unit:'tsp', name:'Cumin-Turmeric blend (¾ tsp cumin + ½ tsp turmeric + ¼ tsp coriander)' },
      { id:'hf014_8', qty:1, unit:'tsp', name:'Better Than Bouillon vegetable base' }
    ],
    steps: [
      { id:'hf014_s1', phase:'cook', timerSec:240,
        text:'In a large saucepan, melt 1 tbsp butter over medium heat. Add the finely diced carrot. Cook 3-4 min until softened.' },
      { id:'hf014_s2', phase:'cook', timerSec:600,
        text:'Add the drained chickpeas + 1½ tsp Cumin-Turmeric blend + 1 tsp Better Than Bouillon + ½ cup water + ¼ cup of the reserved chickpea liquid (aquafaba — adds body). Bring to a simmer, reduce to medium-low. Cook uncovered 8-10 min, stirring occasionally. Use a fork to lightly smash about ⅓ of the chickpeas against the side of the pan — this creates body without making it mushy. Season with ¼ tsp salt + ⅛ tsp pepper.' ,
        parallelTask:'While it simmers: chop garnishes, slice cooked items, set out serving plates.'},
      { id:'hf014_s3', phase:'prep', timerSec:null,
        text:'Pat salmon very dry with paper towels. Season skin side with ¼ tsp salt; flesh side with ¼ tsp salt + ⅛ tsp pepper. Brush the flesh side generously with 2 tbsp of the mango chutney (save 1 tbsp for serving).' ,
        prepNote: '→ this salmon goes straight into the pan (step 4)'},
      { id:'hf014_s4', phase:'cook', timerSec:240,
        text:'Heat a 12-inch non-stick skillet over medium-high with 1 tbsp neutral oil. When oil shimmers (not smoking), place salmon SKIN-SIDE-DOWN. Press gently with a spatula for first 20 seconds to prevent curl. Cook undisturbed 4 min until skin is crisp and releases easily from pan.',
        airFryerAlt: { text:'Pat salmon dry, season as above, brush flesh side with 2 tbsp mango chutney. Place skin-side-down on Cuisinart wire rack. AIR FRY at 195°C for 9-11 min total — no flipping. Salmon is done when it flakes easily. The chutney glaze will caramelize on the surface.', timerSec:600 } },
      { id:'hf014_s5', phase:'cook', timerSec:180,
        text:'Flip salmon flesh-side-down. Brush the now-up-facing skin with another ½ tbsp mango chutney. Cook 2-3 more min until salmon flakes easily and internal temp reads 50°C (medium) or 65°C (well done).' },
      { id:'hf014_s6', phase:'plate', timerSec:null,
        text:'Finely chop cilantro — about 2 tbsp. Spoon the curried chickpeas into 2 shallow bowls. Top with salmon. Drizzle remaining ½ tbsp mango chutney over salmon. Sprinkle with chopped cilantro and a generous pinch of crispy fried shallots.' }
    ]
  },

  // ==========================================================================
  // 15. Sticky Bang Bang Salmon Bowls
  // ==========================================================================
  {
    id: 'hf_015',
    mealType: 'dinner',
    leftoverFriendly: false,
    nutrition: { calories: 740, protein: 38, fat: 28, carbs: 75, fiber: 6, sodium: 1060 },
    costcoSourcing: ['Costco Atlantic salmon fillets', 'Kirkland jasmine rice', 'Huy Fong sriracha', 'Kewpie mayo'],
    title: 'Sticky Bang Bang Salmon Bowls',
    servings: 2, timeMin: 25,
    description: 'With bright slaw, broccoli, and gingery rice. Spicy.',
    tags: ['salmon','asian','spicy','quick'],
    image: '🥗',
    ingredients: [
      { id:'hf015_1', qty:2, unit:'unit', name:'salmon fillets, skin-on (~5-6 oz each)', protein:true },
      { id:'hf015_2', qty:0.75, unit:'cup', name:'jasmine rice' },
      { id:'hf015_3', qty:227, unit:'g', name:'broccoli florets (~2 cups)' },
      { id:'hf015_4', qty:113, unit:'g', name:'red cabbage, shredded' },
      { id:'hf015_5', qty:1, unit:'unit', name:'avocado' },
      { id:'hf015_6', qty:3, unit:'unit', name:'radishes' },
      { id:'hf015_7', qty:1, unit:'tbsp', name:'black sesame seeds' },
      { id:'hf015_8', qty:3, unit:'tbsp', name:'sweet chili sauce' },
      { id:'hf015_9', qty:3, unit:'tbsp', name:'Kewpie mayonnaise (or regular mayo)' },
      { id:'hf015_10', qty:2, unit:'tbsp', name:'ginger-garlic puree (1 tbsp grated ginger + 2 cloves grated garlic)',
        alternates: [{ modeId:'paste', qty:2, unit:'tbsp', name:'jarred ginger-garlic paste' }] },
      { id:'hf015_11', qty:3, unit:'tbsp', name:'soy sauce' },
      { id:'hf015_12', qty:2, unit:'tbsp', name:'seasoned rice vinegar' }
    ],
    steps: [
      { id:'hf015_s1', phase:'cook', timerSec:900,
        text:'In a medium saucepan, bring 1¼ cups water + half the ginger-garlic puree + 1 tbsp butter + ¼ tsp salt to a boil. Add rice, stir once, reduce to LOW, cover, cook 15 min. Off heat, stir in ½ tbsp black sesame seeds. Rest 5 min covered.',
        pasteAlt: { text:'In a medium saucepan, bring 1¼ cups water + 1 tbsp ginger-garlic paste + 1 tbsp butter + ¼ tsp salt to a boil. Add rice, stir once, reduce to LOW, cover, cook 15 min. Off heat, stir in ½ tbsp sesame seeds.', timerSec:900 } ,
        parallelTask:"While rice cooks: do all the prep below (chop veg, slice protein, make sauces) so you're ready to cook the moment it's done."},
      { id:'hf015_s2', phase:'prep', timerSec:null,
        text:'Trim radish tops, slice radishes paper-thin (use a mandoline if you have one). Halve avocado, remove pit, slice into ¼-inch slices in the skin, scoop out with a spoon.' ,
        prepNote: '→ avocado + radish go directly into the bowl at plating'},
      { id:'hf015_s3', phase:'prep', timerSec:null,
        text:'In a medium bowl, whisk 2 tbsp rice vinegar + ½ tsp sugar + ¼ tsp salt. Add the shredded red cabbage and sliced radish. Toss. Let sit while you make the rest — it pickles slightly.' ,
        prepNote: '→ this IS the pickled slaw — sits while rest cooks'},
      { id:'hf015_s4', phase:'prep', timerSec:null,
        text:'Make Bang Bang sauce: in a small bowl, whisk 3 tbsp mayo + 3 tbsp sweet chili sauce + 1 tbsp soy sauce. (Reserve 2 tbsp for drizzling at the end; use the rest to glaze the salmon.)' ,
        prepNote: '→ 2 tbsp saved for drizzle at plating, rest glazes the salmon'},
      { id:'hf015_s5', phase:'cook', timerSec:480,
        text:'Pat salmon very dry. Season skin side with ¼ tsp salt; flesh side with ¼ tsp salt + ⅛ tsp pepper. Heat a 12-inch non-stick skillet over medium-high with 1 tbsp neutral oil. When oil shimmers, place salmon SKIN-SIDE-DOWN, press gently for first 20 seconds. Cook 4 min undisturbed. Flip, brush the skin generously with most of the Bang Bang sauce (save 2 tbsp). Cook 2-3 more min until salmon flakes and internal temp reads 50°C (medium) or 65°C (well done).',
        airFryerAlt: { text:'Pat dry, season as above. Place skin-side-down on Cuisinart wire rack. AIR FRY at 195°C for 6 min, then brush top generously with Bang Bang sauce. Continue cooking 4-5 more min until salmon flakes. Saves you wiping the pan.', timerSec:600 } },
      { id:'hf015_s6', phase:'cook', timerSec:300,
        text:'Wipe out the skillet (or use the same after removing salmon). Medium-high heat with 1 tbsp neutral oil. Add the broccoli florets + remaining ginger-garlic puree + 1 tbsp soy sauce + 2 tbsp water. Stir, then cover and steam-fry 4-5 min until broccoli is tender-crisp and water has evaporated. Final 30 seconds uncovered to crisp.',
        pasteAlt: { text:'Wipe skillet, medium-high heat with 1 tbsp oil. Add broccoli + 1 tbsp ginger-garlic paste + 1 tbsp soy + 2 tbsp water. Stir constantly 30 seconds (paste burns), then cover and steam 4 min. Final 30 sec uncovered.', timerSec:300 } },
      { id:'hf015_s7', phase:'plate', timerSec:null,
        text:'Divide rice between 2 wide bowls. Arrange the broccoli, pickled cabbage-radish slaw, and avocado slices around the edges. Place salmon in the center. Drizzle reserved 2 tbsp Bang Bang sauce. Sprinkle the remaining ½ tbsp black sesame seeds.' }
    ]
  },

  // ==========================================================================
  // 16. Fajita-Inspired Chicken Flatbreads
  // ==========================================================================
  {
    id: 'hf_016',
    mealType: 'dinner',
    leftoverFriendly: false,
    nutrition: { calories: 730, protein: 42, fat: 26, carbs: 72, fiber: 8, sodium: 1180 },
    costcoSourcing: ['Kirkland boneless skinless chicken breasts', 'Costco flatbreads', 'Kirkland shredded cheese blend', 'Costco bell pepper variety pack'],
    noTomatoNote: 'Replace tomato sauce base with chipotle aioli (light mayo + chipotle pepper + lime + garlic).',
    title: 'Fajita-Inspired Chicken Flatbreads',
    servings: 2, timeMin: 25,
    description: 'With sour cream dressing and cheddar.',
    tags: ['chicken','tex-mex','quick','flatbread'],
    image: '🫓',
    ingredients: [
      { id:'hf016_1', qty:250, unit:'g', name:'ground chicken (or beef)', protein:true },
      { id:'hf016_2', qty:2, unit:'unit', name:'naan-style flatbreads (~6-inch)' },
      { id:'hf016_3', qty:1, unit:'unit', name:'red or green bell pepper' },
      { id:'hf016_4', qty:2, unit:'unit', name:'green onions' },
      { id:'hf016_5', qty:0.5, unit:'cup', name:'sharp cheddar, shredded' },
      { id:'hf016_6', qty:3, unit:'tbsp', name:'sour cream' },
      { id:'hf016_7', qty:2, unit:'tbsp', name:'tomato paste' },
      { id:'hf016_8', qty:1, unit:'tbsp', name:'Tex-Mex paste (1 tbsp tomato paste + 1 tsp chipotle in adobo + ½ tsp smoked paprika + ¼ tsp cocoa + ¼ tsp cumin)' },
      { id:'hf016_9', qty:0.5, unit:'tsp', name:'garlic salt' },
      { id:'hf016_10', qty:1, unit:'unit', name:'lime' }
    ],
    steps: [
      { id:'hf016_s1', phase:'prep', timerSec:null,
        text:'Preheat oven to 230°C with rack in upper-middle position. Core bell pepper and slice into thin strips (⅛-¼ inch). Thinly slice green onions on a diagonal — about 3 tbsp.' ,
        prepNote: '→ peppers go into the pan with chicken (step 2)'},
      { id:'hf016_s2', phase:'cook', timerSec:420,
        text:'Heat a 10-inch non-stick skillet over medium-high with 1 tbsp neutral oil. Add ground chicken + bell pepper + ½ tsp garlic salt + ¼ tsp pepper. Break chicken into small pieces with a wooden spoon. Cook 6-7 min, stirring occasionally, until chicken is no longer pink and peppers are softened.' },
      { id:'hf016_s3', phase:'cook', timerSec:90,
        text:'Add the 1 tbsp Tex-Mex paste + 2 tbsp tomato paste + 2 tbsp water. Stir constantly 60-90 seconds until the paste darkens and the mixture is glossy.' },
      { id:'hf016_s4', phase:'prep', timerSec:null,
        text:'Place flatbreads on a half sheet pan (or two if needed). Divide chicken mixture evenly between flatbreads, spreading to the edges. Top each with ¼ cup shredded cheddar.' },
      { id:'hf016_s5', phase:'cook', timerSec:540,
        text:'Bake in oven 8-10 min until cheese is bubbly with brown spots and flatbread edges are golden-crispy. (If flatbreads are getting too dark before cheese melts, drop oven to 220°C.)',
        airFryerAlt: { text:'Set Cuisinart AIR FRY at 210°C. Place 1 topped flatbread on the rack (likely won\'t fit both at once — bake in 2 rounds, OR use bake mode for both). AIR FRY 6-8 min until cheese is bubbly and edges crisp. Repeat for second flatbread (keeps the first warm under foil).', timerSec:480 } },
      { id:'hf016_s6', phase:'prep', timerSec:null,
        text:'Make crema: in a small bowl, mix 3 tbsp sour cream + 1 tsp lime juice + 1 tsp water + a small pinch of salt. Drizzle consistency.' },
      { id:'hf016_s7', phase:'plate', timerSec:null,
        text:'Cut flatbreads into wedges (like a pizza). Drizzle with lime crema. Sprinkle with sliced green onions. Lime wedges alongside for squeezing.' }
    ]
  },

  // ==========================================================================
  // 17. Caramelized Honey-Garlic Turkey Noodles
  // ==========================================================================
  {
    id: 'hf_017',
    mealType: 'dinner',
    leftoverFriendly: true,
    nutrition: { calories: 695, protein: 42, fat: 22, carbs: 78, fiber: 6, sodium: 1320 },
    costcoSourcing: ['Kirkland extra lean ground turkey', 'Costco udon or ramen noodles', 'Honey', 'Kikkoman soy sauce', 'Costco bell pepper variety pack'],
    title: 'Caramelized Honey-Garlic Turkey Noodles',
    servings: 2, timeMin: 25,
    description: 'With snow peas and sesame seeds. Spicy.',
    tags: ['turkey','asian','noodles','spicy','quick'],
    image: '🍜',
    ingredients: [
      { id:'hf017_1', qty:250, unit:'g', name:'ground turkey (93/7)', protein:true },
      { id:'hf017_2', qty:170, unit:'g', name:'linguine (or any long noodle)' },
      { id:'hf017_3', qty:113, unit:'g', name:'snow peas, ends trimmed' },
      { id:'hf017_4', qty:1, unit:'unit', name:'carrot, julienned (or pre-shredded ~56g)' },
      { id:'hf017_5', qty:2, unit:'unit', name:'green onions' },
      { id:'hf017_6', qty:1, unit:'tbsp', name:'toasted sesame seeds' },
      { id:'hf017_7', qty:4, unit:'tbsp', name:'honey-garlic sauce (2 tbsp soy + 2 tbsp honey + 2 cloves grated garlic + 1 tsp rice vinegar + 1 tsp toasted sesame oil)' },
      { id:'hf017_8', qty:2, unit:'tbsp', name:'ginger-garlic puree (1 tbsp grated ginger + 2 cloves grated garlic)',
        alternates: [{ modeId:'paste', qty:2, unit:'tbsp', name:'jarred ginger-garlic paste' }] },
      { id:'hf017_9', qty:1, unit:'tbsp', name:'chili-garlic sauce' },
      { id:'hf017_10', qty:2, unit:'tbsp', name:'soy sauce' }
    ],
    steps: [
      { id:'hf017_s1', phase:'cook', timerSec:600,
        text:'Bring a large pot of water to a rolling boil. Salt generously (1 tbsp coarse salt per 4 quarts). Add linguine. Cook according to package timing minus 1 minute (al dente). Before draining, RESERVE 1 cup of pasta water. Drain pasta.' ,
        parallelTask:'While noodles cook: prep all ingredients for the sauce/topping so you can toss everything together immediately.'},
      { id:'hf017_s2', phase:'prep', timerSec:null,
        text:'Thinly slice green onions on a diagonal. Trim stem ends from snow peas. If carrot isn\'t pre-shredded, julienne or grate on box grater.' ,
        prepNote: '→ snow peas + carrot go into the wok (step 5)'},
      { id:'hf017_s3', phase:'cook', timerSec:480,
        text:'Heat a wok or 14-inch skillet over medium-high with 1 tbsp neutral oil. Add ground turkey. Break into small crumbles, spread across pan. Cook undisturbed 3 min for browning. Stir and cook 5 more min until edges are crispy and golden (this is the "caramelized" part — let it go).' },
      { id:'hf017_s4', phase:'cook', timerSec:90,
        text:'Reduce heat to MEDIUM. Add ginger-garlic puree to turkey. Stir constantly 60-90 seconds until fragrant — do not burn.',
        pasteAlt: { text:'Reduce heat to MEDIUM. Add ginger-garlic paste. Stir 30-45 seconds (paste burns faster).', timerSec:45 } },
      { id:'hf017_s5', phase:'cook', timerSec:240,
        text:'Add carrot + snow peas. Stir-fry 2 min until snow peas are bright green and tender-crisp. Add 4 tbsp honey-garlic sauce + 2 tbsp soy sauce + 1 tbsp chili-garlic + ¼ cup reserved pasta water. Bring to a simmer. Add drained noodles. Toss vigorously with tongs to coat every strand — about 1-2 min. If sauce looks too thick, add another splash of pasta water.' },
      { id:'hf017_s6', phase:'plate', timerSec:null,
        text:'Divide between 2 wide bowls. Top with sliced green onions + 1 tbsp toasted sesame seeds.' }
    ]
  },

  // ==========================================================================
  // 18. Roasted Pesto Salmon with Herbed Couscous
  // ==========================================================================
  {
    id: 'hf_018',
    mealType: 'dinner',
    leftoverFriendly: false,
    nutrition: { calories: 710, protein: 42, fat: 32, carbs: 50, fiber: 7, sodium: 820 },
    costcoSourcing: ['Costco Atlantic salmon fillets', 'Kirkland basil pesto', 'Kirkland russet potatoes', 'Costco green beans'],
    title: 'Roasted Pesto Salmon with Herbed Couscous',
    servings: 2, timeMin: 30,
    description: 'With garlicky sautéed veggies. High Protein.',
    tags: ['salmon','italian','high-protein','quick'],
    image: '🌿',
    ingredients: [
      { id:'hf018_1', qty:2, unit:'unit', name:'salmon fillets, skin-on (~5-6 oz each)', protein:true },
      { id:'hf018_2', qty:0.75, unit:'cup', name:'pearl couscous (Israeli couscous)' },
      { id:'hf018_3', qty:113, unit:'g', name:'sugar snap peas, ends trimmed' },
      { id:'hf018_4', qty:113, unit:'g', name:'cherry tomatoes' },
      { id:'hf018_5', qty:0.5, unit:'unit', name:'yellow onion' },
      { id:'hf018_6', qty:1, unit:'unit', name:'lemon' },
      { id:'hf018_7', qty:7, unit:'g', name:'fresh parsley (small bunch)' },
      { id:'hf018_8', qty:0.25, unit:'cup', name:'basil pesto (refrigerated, like Buitoni or homemade)' },
      { id:'hf018_9', qty:2, unit:'clove', name:'garlic',
        alternates: [{ modeId:'paste', qty:2, unit:'tsp', name:'garlic paste' }] },
      { id:'hf018_10', qty:1, unit:'tbsp', name:'Zesty Garlic blend (½ tsp garlic powder + ½ tsp dried parsley + ½ tsp dried oregano + ¼ tsp dried lemon peel + ¼ tsp salt)' }
    ],
    steps: [
      { id:'hf018_s1', phase:'cook', timerSec:840,
        text:'Preheat oven to 220°C with rack in the middle. In a medium saucepan, bring 1¾ cups water + ½ tsp salt to a boil. Add couscous, stir, and reduce to medium. Simmer uncovered 12-14 min until tender (taste a piece). Drain in a colander.' ,
        parallelTask:"While the oven works: prep all remaining ingredients so you're ready to plate the moment it's done."},
      { id:'hf018_s2', phase:'cook', timerSec:null,
        text:'Pick parsley leaves and chop fine — about 2 tbsp. Zest the lemon with a microplane (about 1 tsp). Return drained couscous to the pot. Stir in 1 tbsp butter + 1 tbsp chopped parsley + 1 tsp lemon zest + ¼ tsp salt + ⅛ tsp pepper. Cover to keep warm.' },
      { id:'hf018_s3', phase:'prep', timerSec:null,
        text:'Pat salmon very dry. Season with ¼ tsp salt + ⅛ tsp pepper. Brush the flesh side (top, not skin) generously with 3 tbsp of the basil pesto (save 1 tbsp for plating).' ,
        prepNote: '→ goes on the sheet pan to roast (step 4)'},
      { id:'hf018_s4', phase:'cook', timerSec:780,
        text:'Place salmon skin-down on a parchment-lined sheet pan. Roast 11-13 min — salmon is done when it flakes easily and internal temp reads 50°C (medium) or 65°C (well done). The pesto will form a herby crust.',
        airFryerAlt: { text:'Place pesto-brushed salmon skin-down on Cuisinart wire rack. AIR FRY at 210°C for 8-10 min total — no flipping. The pesto crust crisps beautifully. Salmon is done when it flakes.', timerSec:540 } ,
        parallelTask:'While vegetables roast: get the protein seasoned and the rest of the recipe prepped.'},
      { id:'hf018_s5', phase:'cook', timerSec:300,
        text:'While salmon roasts: thinly slice the half onion. Halve cherry tomatoes. Mince garlic. Heat a 10-inch skillet over medium-high with 1 tbsp olive oil. Add onion, cook 3 min until softened and edges color. Add snap peas + tomatoes + minced garlic + 1 tsp Zesty Garlic blend. Cook 2-3 min until tomatoes blister and snap peas are bright green and tender-crisp.',
        pasteAlt: { text:'Slice onion. Halve tomatoes. Heat skillet medium-high with 1 tbsp olive oil. Add onion, cook 3 min. Add snap peas + tomatoes + 2 tsp garlic paste + 1 tsp Zesty Garlic blend. Cook 2 min (paste burns fast — keep stirring) until tomatoes blister.', timerSec:300 } },
      { id:'hf018_s6', phase:'plate', timerSec:null,
        text:'Divide couscous between 2 bowls. Top with the sautéed vegetables and the pesto salmon. Drizzle remaining 1 tbsp pesto. Top with remaining chopped parsley. Lemon wedges alongside.' }
    ]
  },

  // ==========================================================================
  // 19. Cheesy Tex-Mex Beef and Orzo Skillet
  // ==========================================================================
  {
    id: 'hf_019',
    mealType: 'dinner',
    leftoverFriendly: true,
    nutrition: { calories: 760, protein: 46, fat: 28, carbs: 80, fiber: 7, sodium: 1280 },
    costcoSourcing: ['Kirkland 90/10 ground beef', 'Kirkland orzo pasta', 'Kirkland shredded cheese blend', 'Costco bell pepper variety pack'],
    noTomatoNote: 'Replace tomato base with beef broth + chipotle in adobo (purée 1-2 chipotles into broth) for smoky depth without tomato.',
    title: 'Cheesy Tex-Mex Beef and Orzo Skillet',
    servings: 2, timeMin: 35,
    description: 'With tortilla crumble and sour cream. Family Friendly.',
    tags: ['beef','tex-mex','family-friendly','one-pot'],
    image: '🧀',
    ingredients: [
      { id:'hf019_1', qty:250, unit:'g', name:'ground beef (80/20)', protein:true },
      { id:'hf019_2', qty:170, unit:'g', name:'orzo pasta' },
      { id:'hf019_3', qty:1, unit:'unit', name:'red bell pepper' },
      { id:'hf019_4', qty:2, unit:'unit', name:'green onions' },
      { id:'hf019_5', qty:60, unit:'g', name:'baby spinach (~2 cups, loose-packed)' },
      { id:'hf019_6', qty:0.5, unit:'cup', name:'sharp cheddar, shredded' },
      { id:'hf019_7', qty:3, unit:'tbsp', name:'sour cream' },
      { id:'hf019_8', qty:85, unit:'g', name:'tortilla chips, lightly crushed' },
      { id:'hf019_9', qty:2, unit:'tbsp', name:'tomato paste' },
      { id:'hf019_10', qty:1, unit:'tbsp', name:'Mexican seasoning (½ tsp chili powder + ¾ tsp cumin + ¼ tsp paprika + ¼ tsp garlic powder + ¼ tsp onion powder)' },
      { id:'hf019_11', qty:1, unit:'tsp', name:'Better Than Bouillon beef base' },
      { id:'hf019_12', qty:1, unit:'tsp', name:'garlic salt' }
    ],
    steps: [
      { id:'hf019_s1', phase:'cook', timerSec:360,
        text:'Heat a large 12-inch OVEN-SAFE skillet (cast iron or stainless) over medium-high with 1 tbsp neutral oil. Add ground beef + sliced bell pepper (cut into ½-inch strips) + 1 tsp garlic salt + ¼ tsp pepper. Break beef into small pieces. Cook 5-6 min until no pink remains and peppers are softened.' ,
        prepNote: '→ everything goes into the skillet together (step 1 is the only cook step)'},
      { id:'hf019_s2', phase:'cook', timerSec:null,
        text:'Drain off excess fat if more than 1 tbsp remaining. Stir in the 1 tbsp Mexican seasoning + 2 tbsp tomato paste. Cook 60 seconds until tomato paste darkens. Add 2 cups water + 1 tsp Better Than Bouillon beef base + the 170g orzo. Stir to combine and dislodge anything stuck to the pan.' },
      { id:'hf019_s3', phase:'cook', timerSec:780,
        text:'Bring to a simmer. Reduce heat to MEDIUM. Cook 12-14 min, stirring every 2 minutes (otherwise orzo sticks together), until orzo is tender and the liquid has thickened to a creamy consistency. Taste — should be al dente with a slight bite.' ,
        parallelTask:'While noodles cook: prep all ingredients for the sauce/topping so you can toss everything together immediately.'},
      { id:'hf019_s4', phase:'cook', timerSec:90,
        text:'Off heat. Stir in the baby spinach in 2 batches, allowing it to wilt as you add (about 60-90 seconds). Sprinkle the ½ cup shredded cheddar evenly over the top.' },
      { id:'hf019_s5', phase:'cook', timerSec:180,
        text:'Place skillet under the BROILER set to high (or BROIL setting in your oven, rack about 6 inches from element). Broil 2-3 min, watching constantly through the window — pull as soon as cheese is bubbling with golden-brown spots. Burns fast.',
        airFryerAlt: { text:'If your skillet won\'t fit in the Cuisinart, transfer the orzo mixture to a smaller broiler-safe baking dish first. Top with cheese. Set Cuisinart to BROIL HIGH and broil 2-3 min until cheese bubbles. Or skip — the cheese will melt from residual heat if you cover the skillet for 60 seconds.', timerSec:180 } },
      { id:'hf019_s6', phase:'plate', timerSec:null,
        text:'Thinly slice green onions. Scoop directly from the skillet into 2 bowls. Top with crushed tortilla chips, sliced green onions, and a dollop of sour cream.' }
    ]
  },

  // ==========================================================================
  // 20. Honey-Glazed Chicken with Roasted Veg
  // ==========================================================================
  {
    id: 'hf_020',
    mealType: 'dinner',
    leftoverFriendly: true,
    nutrition: { calories: 700, protein: 50, fat: 24, carbs: 70, fiber: 6, sodium: 980 },
    costcoSourcing: ['Kirkland boneless skinless chicken thighs', 'Honey', 'Kirkland russet potatoes', 'Costco green beans'],
    title: 'Honey-Glazed Chicken with Roasted Veg',
    servings: 2, timeMin: 40,
    description: 'A weeknight classic — sweet, savory, foolproof.',
    tags: ['chicken','asian','quick','easy'],
    image: '🍯',
    ingredients: [
      { id:'hf020_1', qty:2, unit:'unit', name:'boneless skinless chicken breasts', protein:true },
      { id:'hf020_2', qty:2, unit:'tbsp', name:'honey' },
      { id:'hf020_3', qty:3, unit:'tbsp', name:'soy sauce' },
      { id:'hf020_4', qty:2, unit:'clove', name:'garlic',
        alternates: [{ modeId:'paste', qty:2, unit:'tsp', name:'garlic paste' }] },
      { id:'hf020_5', qty:1, unit:'unit', name:'broccoli head (~1 lb)' },
      { id:'hf020_6', qty:2, unit:'unit', name:'medium carrots' },
      { id:'hf020_7', qty:0.75, unit:'cup', name:'jasmine rice' },
      { id:'hf020_8', qty:1, unit:'tbsp', name:'rice vinegar' },
      { id:'hf020_9', qty:1, unit:'tsp', name:'toasted sesame oil' }
    ],
    steps: [
      { id:'hf020_s1', phase:'cook', timerSec:900,
        text:'In a medium saucepan, bring 1¼ cups water + ¼ tsp salt to a boil. Add rice, stir once, reduce to LOW, cover, cook 15 min. Off heat, rest 5 min covered.' ,
        parallelTask:"While rice cooks: do all the prep below (chop veg, slice protein, make sauces) so you're ready to cook the moment it's done."},
      { id:'hf020_s2', phase:'cook', timerSec:1080,
        text:'Preheat oven to 220°C with rack in the middle. Cut broccoli into 1-inch florets. Slice carrots into ¼-inch coins on a diagonal. On a half sheet pan: toss with 1 tbsp olive oil + ½ tsp coarse salt + ¼ tsp pepper. Spread in single layer. Roast 18-20 min, flipping at 10 min, until edges are charred and a fork pierces carrot easily.',
        airFryerAlt: { text:'Set Cuisinart AIR FRY at 210°C. Toss broccoli florets and carrot coins with 1 tbsp olive oil + ½ tsp salt + ¼ tsp pepper. Spread on wire/perforated tray in single layer. AIR FRY 14-16 min, shaking at 8 min, until edges char and carrots are tender.', timerSec:900 } ,
        parallelTask:'While the oven works: prep the rest of the ingredients (chop, slice, make sauces). 15 minutes is enough for all prep.'},
      { id:'hf020_s3', phase:'prep', timerSec:null,
        text:'Mince garlic (or measure paste). In a small bowl, whisk together 2 tbsp honey + 3 tbsp soy sauce + minced garlic + 1 tbsp rice vinegar + 1 tsp toasted sesame oil. Set aside — this becomes the glaze.',
        pasteAlt: { text:'In a small bowl, whisk together 2 tbsp honey + 3 tbsp soy sauce + 2 tsp garlic paste + 1 tbsp rice vinegar + 1 tsp toasted sesame oil. Set aside.', timerSec:null } ,
        prepNote: '→ becomes the glaze poured over the chicken (step 5)'},
      { id:'hf020_s4', phase:'cook', timerSec:480,
        text:'Pat chicken very dry. Season with ½ tsp salt + ¼ tsp pepper. Heat a 12-inch non-stick skillet over medium-high with 1 tbsp neutral oil. When oil shimmers, place chicken smooth-side-down. Sear undisturbed 4 min until deep golden. Flip, cook 4 more min until internal temp reaches 70°C (it will continue cooking in the glaze).' },
      { id:'hf020_s5', phase:'cook', timerSec:240,
        text:'Reduce heat to MEDIUM-LOW. Pour the honey-soy glaze over the chicken. The pan will steam — that\'s good. Simmer, basting the chicken with the glaze every 30 seconds using a spoon, for 3-4 min until the glaze reduces to a syrupy consistency and internal temp reaches 75°C. The glaze should coat the back of a spoon.' },
      { id:'hf020_s6', phase:'plate', timerSec:null,
        text:'Rest chicken on a cutting board 3 min, then slice on the bias into ½-inch slices. Divide rice between 2 bowls. Add the roasted vegetables alongside. Top with sliced chicken. Spoon the remaining glaze from the pan over everything.' }
    ]
  },

  // ==========================================================================
  // BREAKFAST RECIPES (5)
  // ==========================================================================

  {
    id: 'bf_001',
    mealType: 'breakfast',
    leftoverFriendly: false,
    nutrition: { calories: 515, protein: 50, fat: 12, carbs: 55, fiber: 10, sodium: 180 },
    costcoSourcing: ['Quaker rolled oats', 'Kirkland Greek yogurt 2%', 'Perfect Sports Diesel whey isolate', 'Kirkland chia seeds', 'Costco apples'],
    title: 'High-Protein Overnight Oats',
    servings: 1, timeMin: 5,
    description: 'Prep the night before. Your daily morning anchor — creamy Greek yogurt, fresh apple, hint of cinnamon.',
    tags: ['breakfast','high-protein','no-cook','meal-prep'],
    image: '🥣',
    ingredients: [
      { id:'bf001_1', qty:0.5, unit:'cup', name:'rolled oats' },
      { id:'bf001_2', qty:1, unit:'scoop', name:'whey isolate protein powder (vanilla)', protein:true },
      { id:'bf001_3', qty:0.75, unit:'cup', name:'Greek yogurt (2%)', protein:true },
      { id:'bf001_4', qty:0.5, unit:'cup', name:'unsweetened almond milk' },
      { id:'bf001_5', qty:1, unit:'tbsp', name:'chia seeds' },
      { id:'bf001_6', qty:0.5, unit:'unit', name:'apple, diced' },
      { id:'bf001_7', qty:1, unit:'tsp', name:'honey or monk fruit sweetener (optional)' },
      { id:'bf001_8', qty:0.5, unit:'tsp', name:'cinnamon' }
    ],
    steps: [
      { id:'bf001_s1', phase:'prep', timerSec:null,
        text:'Add ½ cup rolled oats, 1 scoop protein powder, 1 tbsp chia seeds, and ½ tsp cinnamon to a 16 oz mason jar. Stir dry ingredients with a fork to break up any protein powder clumps.' },
      { id:'bf001_s2', phase:'prep', timerSec:null,
        text:'Add ¾ cup Greek yogurt and ½ cup almond milk. Stir vigorously with a long spoon until protein powder is fully dissolved — no streaks. The mixture should look like thick pudding.' },
      { id:'bf001_s3', phase:'prep', timerSec:null,
        text:'Seal jar and refrigerate at least 4 hours, ideally overnight. Keeps 4 days in the fridge.' },
      { id:'bf001_s4', phase:'plate', timerSec:null,
        text:'In the morning, top with ½ diced apple. Drizzle 1 tsp honey if using. Eat cold straight from the jar.' }
    ]
  },

  {
    id: 'bf_002',
    mealType: 'breakfast',
    leftoverFriendly: true,
    nutrition: { calories: 425, protein: 40, fat: 14, carbs: 32, fiber: 6, sodium: 720 },
    costcoSourcing: ['Kirkland liquid egg whites', 'Kirkland sweet potatoes', 'Olympic Provisions chorizo', 'Costco baby spinach'],
    title: 'Spicy Chorizo & Egg White Breakfast Skillet',
    servings: 2, timeMin: 20,
    description: 'Smoky turkey chorizo, fluffy egg whites, crisp sweet potato cubes with cayenne. Cook once, eat twice.',
    tags: ['breakfast','high-protein','spicy','meal-prep'],
    image: '🌶️',
    ingredients: [
      { id:'bf002_1', qty:1, unit:'cup', name:'liquid egg whites', protein:true },
      { id:'bf002_2', qty:2, unit:'unit', name:'whole eggs', protein:true },
      { id:'bf002_3', qty:170, unit:'g', name:'turkey chorizo (or lean ground turkey + chorizo seasoning)', protein:true },
      { id:'bf002_4', qty:1, unit:'unit', name:'medium sweet potato, diced ¼-inch' },
      { id:'bf002_5', qty:2, unit:'cup', name:'baby spinach' },
      { id:'bf002_6', qty:0.5, unit:'tsp', name:'smoked paprika' },
      { id:'bf002_7', qty:0.25, unit:'tsp', name:'cayenne pepper (more to taste)' },
      { id:'bf002_8', qty:2, unit:'clove', name:'garlic, minced' },
      { id:'bf002_9', qty:1, unit:'tbsp', name:'olive oil' }
    ],
    steps: [
      { id:'bf002_s1', phase:'prep', timerSec:null,
        text:'Dice 1 medium sweet potato into ¼-inch cubes. Small cubes cook faster and crisp better. Mince 2 cloves garlic.' },
      { id:'bf002_s2', phase:'cook', timerSec:480,
        text:'Heat 1 tbsp olive oil in a 10-inch non-stick skillet over MEDIUM-HIGH. Add sweet potato cubes, season with ¼ tsp salt. Cook 8 minutes, stirring every 2 min, until fork-tender with crispy edges.' },
      { id:'bf002_s3', phase:'cook', timerSec:300,
        text:'Push sweet potatoes to one side of the pan. Add 170g turkey chorizo to the empty side. Brown 4-5 min, breaking it up with a wooden spoon. Add garlic, ½ tsp smoked paprika, ¼ tsp cayenne. Stir everything together.' },
      { id:'bf002_s4', phase:'cook', timerSec:30,
        text:'Add 2 cups spinach and toss until fully wilted, about 30 seconds.' },
      { id:'bf002_s5', phase:'cook', timerSec:180,
        text:'Whisk 1 cup egg whites with 2 whole eggs in a bowl. Pour over the skillet mixture. Reduce heat to MEDIUM-LOW. Stir gently with a silicone spatula until eggs are just set but still creamy, 2-3 min.' },
      { id:'bf002_s6', phase:'plate', timerSec:null,
        text:'Plate immediately or portion into two meal-prep containers. Reheats well for 3 days — microwave 90 sec covered.' }
    ]
  },

  {
    id: 'bf_003',
    mealType: 'breakfast',
    leftoverFriendly: false,
    nutrition: { calories: 410, protein: 45, fat: 16, carbs: 22, fiber: 3, sodium: 680 },
    costcoSourcing: ['Kirkland 2% cottage cheese', 'Kirkland organic eggs', "Mike's Hot Honey", 'Kirkland everything bagel seasoning'],
    title: 'Hot Honey Cottage Cheese Power Bowl',
    servings: 1, timeMin: 5,
    description: 'No-cook breakfast bomb. Cottage cheese, hard-boiled eggs, hot honey, everything bagel seasoning. Done in 5 minutes.',
    tags: ['breakfast','high-protein','no-cook','spicy'],
    image: '🍯',
    ingredients: [
      { id:'bf003_1', qty:1, unit:'cup', name:'cottage cheese (2%)', protein:true },
      { id:'bf003_2', qty:2, unit:'unit', name:'hard-boiled eggs, halved', protein:true },
      { id:'bf003_3', qty:1, unit:'tbsp', name:"hot honey (Mike's Hot Honey or honey + chili flakes)" },
      { id:'bf003_4', qty:1, unit:'tsp', name:'everything bagel seasoning' },
      { id:'bf003_5', qty:0.25, unit:'tsp', name:'red pepper flakes (optional)' }
    ],
    steps: [
      { id:'bf003_s1', phase:'plate', timerSec:null,
        text:'Spoon 1 cup cottage cheese into a bowl. Top with 2 halved hard-boiled eggs (cut side up).' },
      { id:'bf003_s2', phase:'plate', timerSec:null,
        text:'Drizzle 1 tbsp hot honey over the entire bowl. Sprinkle 1 tsp everything bagel seasoning evenly. Add red pepper flakes if you want extra heat.' },
      { id:'bf003_s3', phase:'plate', timerSec:null,
        text:'Eat immediately. Batch tip: Sunday hard-boil 6-8 eggs (in the air fryer at 130°C for 16 min, then ice bath) for a week of fast assembly.' }
    ]
  },

  {
    id: 'bf_004',
    mealType: 'breakfast',
    leftoverFriendly: false,
    nutrition: { calories: 480, protein: 42, fat: 11, carbs: 50, fiber: 9, sodium: 130 },
    costcoSourcing: ['Kirkland Greek yogurt 2%', 'Costco frozen berry blend', 'Kirkland chia seeds', 'Three Wishes or KIND protein granola'],
    title: 'Greek Yogurt Power Bowl with Protein Granola',
    servings: 1, timeMin: 5,
    description: 'Greek yogurt base with mixed berries, protein granola, and chia. Sweet without the sugar crash.',
    tags: ['breakfast','high-protein','no-cook'],
    image: '🫐',
    ingredients: [
      { id:'bf004_1', qty:1.25, unit:'cup', name:'Greek yogurt (2%)', protein:true },
      { id:'bf004_2', qty:0.5, unit:'scoop', name:'whey isolate (optional, for protein boost)', protein:true },
      { id:'bf004_3', qty:0.5, unit:'cup', name:'mixed berries (fresh or frozen, thawed)' },
      { id:'bf004_4', qty:0.33, unit:'cup', name:'high-protein granola' },
      { id:'bf004_5', qty:1, unit:'tbsp', name:'chia seeds' },
      { id:'bf004_6', qty:1, unit:'tsp', name:'honey (optional)' },
      { id:'bf004_7', qty:0.25, unit:'tsp', name:'cinnamon' }
    ],
    steps: [
      { id:'bf004_s1', phase:'prep', timerSec:null,
        text:'In a bowl, stir 1¼ cup Greek yogurt with ½ scoop whey isolate (if using) and ¼ tsp cinnamon until smooth — no powder lumps.' },
      { id:'bf004_s2', phase:'plate', timerSec:null,
        text:'Top with ½ cup berries, ⅓ cup granola, and 1 tbsp chia seeds. Drizzle 1 tsp honey if desired.' },
      { id:'bf004_s3', phase:'plate', timerSec:null,
        text:'Eat immediately so the granola stays crunchy.' }
    ]
  },

  {
    id: 'bf_005',
    mealType: 'breakfast',
    leftoverFriendly: true,
    nutrition: { calories: 285, protein: 30, fat: 6, carbs: 30, fiber: 5, sodium: 240 },
    costcoSourcing: ['Quaker rolled oats', 'Kirkland liquid egg whites', 'Perfect Sports Diesel whey isolate', 'Costco bananas'],
    title: 'Spicy Protein Pancakes (Freezer Batch)',
    servings: 4, timeMin: 25,
    description: 'Batch 8 pancakes, freeze 6. Banana, whey, oats, sneaky pinch of cayenne for warmth. Microwave 60 sec in the morning.',
    tags: ['breakfast','high-protein','meal-prep','freezer-friendly'],
    image: '🥞',
    ingredients: [
      { id:'bf005_1', qty:2, unit:'cup', name:'rolled oats' },
      { id:'bf005_2', qty:4, unit:'unit', name:'ripe bananas' },
      { id:'bf005_3', qty:2, unit:'scoop', name:'whey isolate (vanilla)', protein:true },
      { id:'bf005_4', qty:1, unit:'cup', name:'liquid egg whites', protein:true },
      { id:'bf005_5', qty:0.5, unit:'cup', name:'Greek yogurt', protein:true },
      { id:'bf005_6', qty:1, unit:'tsp', name:'cinnamon' },
      { id:'bf005_7', qty:0.25, unit:'tsp', name:'cayenne (optional but recommended)' },
      { id:'bf005_8', qty:1, unit:'tsp', name:'baking powder' },
      { id:'bf005_9', qty:1, unit:'tsp', name:'vanilla extract' }
    ],
    steps: [
      { id:'bf005_s1', phase:'prep', timerSec:60,
        text:'Add 2 cups rolled oats to a blender and blend 30-60 seconds to form a coarse flour. Add 4 bananas, 2 scoops whey, 1 cup egg whites, ½ cup Greek yogurt, 1 tsp cinnamon, ¼ tsp cayenne, 1 tsp baking powder, 1 tsp vanilla. Blend until smooth, scraping sides once.' },
      { id:'bf005_s2', phase:'cook', timerSec:180,
        text:'Heat a 10-inch non-stick skillet over MEDIUM heat. Lightly spray with cooking spray. Pour ¼ cup batter per pancake (3 at a time fits). Cook 2-3 min until bubbles form on top and edges look set, then flip with a thin spatula and cook 1-2 more min until golden underneath.' },
      { id:'bf005_s3', phase:'cook', timerSec:null,
        text:'Repeat until all batter is used — should make 8 pancakes. Transfer to a wire rack to cool completely (15 min). Cooling on a rack prevents soggy bottoms.' },
      { id:'bf005_s4', phase:'prep', timerSec:null,
        text:'Stack with small squares of parchment paper between each pancake. Place stack in a zip-top freezer bag. Freezes 2 months.' },
      { id:'bf005_s5', phase:'plate', timerSec:90,
        text:'Reheat from frozen: microwave 60-90 sec, OR air fryer at 175°C for 3 min. Serve 2 pancakes per breakfast topped with Greek yogurt, berries, or a drizzle of hot honey.' }
    ]
  },

  // ==========================================================================
  // LUNCH WRAPS (6)
  // ==========================================================================

  {
    id: 'lw_001',
    mealType: 'lunch',
    leftoverFriendly: false,
    nutrition: { calories: 490, protein: 37, fat: 18, carbs: 28, fiber: 19, sodium: 920 },
    costcoSourcing: ['Mission Carb Balance wraps', 'Kirkland liquid egg whites', 'Maple Leaf turkey bacon', 'Frozen hash brown patties', 'Costco baby spinach'],
    title: 'Classic Egg White & Turkey Bacon Wrap',
    servings: 1, timeMin: 12,
    description: 'The base wrap — protein-loaded with massive fiber from the keto wrap. Batch the bacon Sunday for 5-minute weekday assembly.',
    tags: ['lunch','high-protein','high-fiber','wrap'],
    image: '🌯',
    ingredients: [
      { id:'lw001_1', qty:0.5, unit:'cup', name:'liquid egg whites (or 4 egg whites)', protein:true },
      { id:'lw001_2', qty:1, unit:'unit', name:'whole egg', protein:true },
      { id:'lw001_3', qty:3, unit:'strip', name:'turkey bacon', protein:true },
      { id:'lw001_4', qty:1, unit:'unit', name:'frozen hash brown patty' },
      { id:'lw001_5', qty:1, unit:'cup', name:'baby spinach' },
      { id:'lw001_6', qty:1, unit:'unit', name:'high-fiber keto wrap (Mission Carb Balance)' },
      { id:'lw001_7', qty:1, unit:'tsp', name:'olive oil or cooking spray' }
    ],
    steps: [
      { id:'lw001_s1', phase:'cook', timerSec:600,
        text:'Air fry hash brown at 205°C for 10 min (no flip needed), or skillet over medium-high heat 4 min per side. Should be deep golden with crispy edges.' },
      { id:'lw001_s2', phase:'cook', timerSec:180,
        text:'In a 10-inch non-stick skillet over MEDIUM heat, cook 3 strips turkey bacon 2-3 min per side until lightly crispy. Transfer to a paper towel. Leave the rendered fat in the pan.' },
      { id:'lw001_s3', phase:'cook', timerSec:90,
        text:'Whisk eggs with ¼ tsp salt and pepper. Pour into the same hot skillet (bacon fat adds flavor). Stir with a silicone spatula for 60 seconds until almost set, then fold in 1 cup spinach. Toss until wilted, about 30 sec more.' },
      { id:'lw001_s4', phase:'prep', timerSec:20,
        text:'Warm wrap in a dry pan over medium 20 sec to prevent cracking when rolling.' },
      { id:'lw001_s5', phase:'plate', timerSec:null,
        text:'Layer on the warm wrap: eggs first (centered, leaving 2 inches at top and bottom), then turkey bacon, then hash brown. Fold sides in, then roll tightly bottom-to-top. Slice diagonally.' }
    ]
  },

  {
    id: 'lw_002',
    mealType: 'lunch',
    leftoverFriendly: false,
    nutrition: { calories: 535, protein: 36, fat: 22, carbs: 28, fiber: 19, sodium: 1100 },
    costcoSourcing: ['Mission Carb Balance wraps', 'Kirkland liquid egg whites', 'Maple Leaf turkey bacon', 'Huy Fong sriracha', 'Pickled jalapeños'],
    title: 'Spicy Sriracha Egg White Wrap',
    servings: 1, timeMin: 12,
    description: 'Same base as the classic with sriracha-mayo and pickled jalapeños. Brings the heat.',
    tags: ['lunch','high-protein','high-fiber','spicy','wrap'],
    image: '🔥',
    ingredients: [
      { id:'lw002_1', qty:0.5, unit:'cup', name:'liquid egg whites', protein:true },
      { id:'lw002_2', qty:1, unit:'unit', name:'whole egg', protein:true },
      { id:'lw002_3', qty:3, unit:'strip', name:'turkey bacon', protein:true },
      { id:'lw002_4', qty:1, unit:'unit', name:'frozen hash brown patty' },
      { id:'lw002_5', qty:1, unit:'cup', name:'baby spinach' },
      { id:'lw002_6', qty:1, unit:'unit', name:'high-fiber keto wrap' },
      { id:'lw002_7', qty:1, unit:'tbsp', name:'light mayo or Greek yogurt' },
      { id:'lw002_8', qty:1, unit:'tsp', name:'sriracha (more to taste)' },
      { id:'lw002_9', qty:4, unit:'slice', name:'pickled jalapeños' },
      { id:'lw002_10', qty:0.25, unit:'tsp', name:'smoked paprika' }
    ],
    steps: [
      { id:'lw002_s1', phase:'prep', timerSec:null,
        text:'Stir 1 tbsp mayo and 1 tsp sriracha in a small bowl. Adjust heat by adding more sriracha if you want a stronger kick.' },
      { id:'lw002_s2', phase:'cook', timerSec:600,
        text:'Air fry hash brown at 205°C for 10 min until golden and crispy.' },
      { id:'lw002_s3', phase:'cook', timerSec:180,
        text:'Cook turkey bacon in a non-stick skillet over MEDIUM heat 2-3 min per side. Set aside.' },
      { id:'lw002_s4', phase:'cook', timerSec:90,
        text:'Whisk eggs with ¼ tsp smoked paprika and a pinch of salt. Scramble in the same skillet 60 sec, then fold in 1 cup spinach for 30 sec until wilted.' },
      { id:'lw002_s5', phase:'prep', timerSec:20,
        text:'Warm wrap 20 sec in a dry pan.' },
      { id:'lw002_s6', phase:'plate', timerSec:null,
        text:'Spread sriracha-mayo across the wrap. Layer eggs, turkey bacon, hash brown, then top with pickled jalapeño slices. Roll tight, slice diagonally.' }
    ]
  },

  {
    id: 'lw_003',
    mealType: 'lunch',
    leftoverFriendly: false,
    nutrition: { calories: 520, protein: 38, fat: 22, carbs: 27, fiber: 19, sodium: 1080 },
    costcoSourcing: ['Mission Carb Balance wraps', 'Kirkland liquid egg whites', 'Maple Leaf turkey bacon', 'Kirkland feta block', 'Lemon 6-pack'],
    title: 'Feta & Spinach Mediterranean Egg Wrap',
    servings: 1, timeMin: 12,
    description: 'Tangy feta with sautéed spinach, lemon, oregano. Mediterranean comfort with zero tomato.',
    tags: ['lunch','high-protein','high-fiber','mediterranean','wrap'],
    image: '🧀',
    ingredients: [
      { id:'lw003_1', qty:0.5, unit:'cup', name:'liquid egg whites', protein:true },
      { id:'lw003_2', qty:1, unit:'unit', name:'whole egg', protein:true },
      { id:'lw003_3', qty:3, unit:'strip', name:'turkey bacon', protein:true },
      { id:'lw003_4', qty:1, unit:'unit', name:'frozen hash brown patty' },
      { id:'lw003_5', qty:2, unit:'cup', name:'baby spinach (extra for that Mediterranean vibe)' },
      { id:'lw003_6', qty:1, unit:'unit', name:'high-fiber keto wrap' },
      { id:'lw003_7', qty:2, unit:'tbsp', name:'crumbled feta cheese' },
      { id:'lw003_8', qty:0.25, unit:'tsp', name:'dried oregano' },
      { id:'lw003_9', qty:1, unit:'tsp', name:'fresh lemon juice' },
      { id:'lw003_10', qty:0.25, unit:'tsp', name:'red pepper flakes' }
    ],
    steps: [
      { id:'lw003_s1', phase:'cook', timerSec:600,
        text:'Air fry hash brown at 205°C for 10 min. Cook 3 strips turkey bacon in a non-stick skillet over MEDIUM heat 2-3 min per side. Set both aside.' },
      { id:'lw003_s2', phase:'cook', timerSec:90,
        text:'Whisk eggs with ¼ tsp oregano and pepper. Scramble in the same skillet 60 sec, then fold in 2 cups spinach until fully wilted. Off heat, squeeze 1 tsp lemon juice over eggs and crumble 2 tbsp feta on top — residual heat softens it.' },
      { id:'lw003_s3', phase:'prep', timerSec:20,
        text:'Warm wrap 20 sec in a dry pan.' },
      { id:'lw003_s4', phase:'plate', timerSec:null,
        text:'Layer egg mixture, turkey bacon, hash brown. Sprinkle ¼ tsp red pepper flakes. Roll tight.' }
    ]
  },

  {
    id: 'lw_004',
    mealType: 'lunch',
    leftoverFriendly: false,
    nutrition: { calories: 565, protein: 37, fat: 27, carbs: 30, fiber: 22, sodium: 1050 },
    costcoSourcing: ['Mission Carb Balance wraps', 'Kirkland liquid egg whites', 'Maple Leaf turkey bacon', 'Costco avocado 6-pack', 'Herdez salsa verde'],
    title: 'Avocado & Salsa Verde Egg Wrap',
    servings: 1, timeMin: 12,
    description: 'Creamy avocado + tomatillo salsa verde (no tomato). Fresh, satisfying, clean.',
    tags: ['lunch','high-protein','high-fiber','mexican','wrap'],
    image: '🥑',
    ingredients: [
      { id:'lw004_1', qty:0.5, unit:'cup', name:'liquid egg whites', protein:true },
      { id:'lw004_2', qty:1, unit:'unit', name:'whole egg', protein:true },
      { id:'lw004_3', qty:3, unit:'strip', name:'turkey bacon', protein:true },
      { id:'lw004_4', qty:1, unit:'unit', name:'frozen hash brown patty' },
      { id:'lw004_5', qty:1, unit:'cup', name:'baby spinach' },
      { id:'lw004_6', qty:1, unit:'unit', name:'high-fiber keto wrap' },
      { id:'lw004_7', qty:0.5, unit:'unit', name:'avocado, sliced' },
      { id:'lw004_8', qty:2, unit:'tbsp', name:'salsa verde (jarred, tomatillo-based)' },
      { id:'lw004_9', qty:0.25, unit:'tsp', name:'cumin' }
    ],
    steps: [
      { id:'lw004_s1', phase:'cook', timerSec:600,
        text:'Air fry hash brown at 205°C for 10 min. Cook 3 strips turkey bacon over MEDIUM 2-3 min per side. Slice ½ avocado.' },
      { id:'lw004_s2', phase:'cook', timerSec:90,
        text:'Whisk eggs with ¼ tsp cumin and salt. Scramble in skillet 60 sec, fold in 1 cup spinach for 30 sec.' },
      { id:'lw004_s3', phase:'prep', timerSec:20,
        text:'Warm wrap 20 sec in a dry pan.' },
      { id:'lw004_s4', phase:'plate', timerSec:null,
        text:'Spread 2 tbsp salsa verde across wrap. Layer eggs, turkey bacon, hash brown, then avocado slices. Roll tightly — the avocado makes it rich enough without any other sauce.' }
    ]
  },

  {
    id: 'lw_005',
    mealType: 'lunch',
    leftoverFriendly: false,
    nutrition: { calories: 545, protein: 38, fat: 25, carbs: 27, fiber: 19, sodium: 1280 },
    costcoSourcing: ['Mission Carb Balance wraps', "Frank's RedHot", 'Maple Leaf turkey bacon', 'Kirkland organic ranch', 'Blue cheese crumbles'],
    title: 'Buffalo Turkey & Ranch Egg Wrap',
    servings: 1, timeMin: 12,
    description: "Toss turkey bacon in Frank's buffalo sauce. Ranch cooling. Game-day energy at lunch.",
    tags: ['lunch','high-protein','high-fiber','spicy','wrap'],
    image: '🌶️',
    ingredients: [
      { id:'lw005_1', qty:0.5, unit:'cup', name:'liquid egg whites', protein:true },
      { id:'lw005_2', qty:1, unit:'unit', name:'whole egg', protein:true },
      { id:'lw005_3', qty:3, unit:'strip', name:'turkey bacon', protein:true },
      { id:'lw005_4', qty:1, unit:'unit', name:'frozen hash brown patty' },
      { id:'lw005_5', qty:1, unit:'cup', name:'baby spinach' },
      { id:'lw005_6', qty:1, unit:'unit', name:'high-fiber keto wrap' },
      { id:'lw005_7', qty:1, unit:'tbsp', name:"Frank's RedHot buffalo sauce" },
      { id:'lw005_8', qty:1, unit:'tbsp', name:'light ranch dressing' },
      { id:'lw005_9', qty:1, unit:'tbsp', name:'crumbled blue cheese (optional)' }
    ],
    steps: [
      { id:'lw005_s1', phase:'cook', timerSec:600,
        text:'Air fry hash brown at 205°C for 10 min until crispy.' },
      { id:'lw005_s2', phase:'cook', timerSec:180,
        text:'Cook 3 strips turkey bacon over MEDIUM heat 2-3 min per side. Chop into pieces while still hot and toss with 1 tbsp buffalo sauce in a small bowl.' },
      { id:'lw005_s3', phase:'cook', timerSec:90,
        text:'Whisk eggs with salt and pepper. Scramble in the same skillet, fold in 1 cup spinach.' },
      { id:'lw005_s4', phase:'prep', timerSec:20,
        text:'Warm wrap 20 sec in a dry pan.' },
      { id:'lw005_s5', phase:'plate', timerSec:null,
        text:'Drizzle 1 tbsp ranch across the wrap. Layer eggs, buffalo turkey bacon, hash brown, blue cheese if using. Roll tight and eat immediately — the heat is best fresh.' }
    ]
  },

  {
    id: 'lw_006',
    mealType: 'lunch',
    leftoverFriendly: false,
    nutrition: { calories: 555, protein: 38, fat: 26, carbs: 30, fiber: 19, sodium: 1180 },
    costcoSourcing: ['Mission Carb Balance wraps', 'Kirkland basil pesto', 'Kirkland roasted red peppers (jar)', 'Kirkland Parmigiano Reggiano'],
    title: 'Pesto & Roasted Pepper Egg Wrap',
    servings: 1, timeMin: 12,
    description: 'Basil pesto + roasted red peppers. Café-quality wrap. No tomato — sweet roasted peppers do the work.',
    tags: ['lunch','high-protein','high-fiber','italian','wrap'],
    image: '🌿',
    ingredients: [
      { id:'lw006_1', qty:0.5, unit:'cup', name:'liquid egg whites', protein:true },
      { id:'lw006_2', qty:1, unit:'unit', name:'whole egg', protein:true },
      { id:'lw006_3', qty:3, unit:'strip', name:'turkey bacon', protein:true },
      { id:'lw006_4', qty:1, unit:'unit', name:'frozen hash brown patty' },
      { id:'lw006_5', qty:1, unit:'cup', name:'baby spinach' },
      { id:'lw006_6', qty:1, unit:'unit', name:'high-fiber keto wrap' },
      { id:'lw006_7', qty:1, unit:'tbsp', name:'basil pesto' },
      { id:'lw006_8', qty:2, unit:'tbsp', name:'roasted red peppers, jarred, sliced' },
      { id:'lw006_9', qty:1, unit:'tbsp', name:'grated parmesan' }
    ],
    steps: [
      { id:'lw006_s1', phase:'cook', timerSec:600,
        text:'Air fry hash brown at 205°C for 10 min until crispy. Cook 3 strips turkey bacon over MEDIUM 2-3 min per side.' },
      { id:'lw006_s2', phase:'cook', timerSec:90,
        text:'Whisk eggs with salt and pepper. Scramble in skillet 60 sec, fold in 1 cup spinach.' },
      { id:'lw006_s3', phase:'prep', timerSec:20,
        text:'Warm wrap 20 sec in a dry pan.' },
      { id:'lw006_s4', phase:'plate', timerSec:null,
        text:'Spread 1 tbsp pesto on the warm wrap. Layer eggs, turkey bacon, 2 tbsp sliced roasted peppers, hash brown. Sprinkle 1 tbsp parmesan. Roll tight, slice diagonally.' }
    ]
  },

  // ==========================================================================
  // LUNCH BOWLS (4)
  // ==========================================================================

  {
    id: 'lb_001',
    mealType: 'lunch',
    leftoverFriendly: true,
    nutrition: { calories: 620, protein: 48, fat: 22, carbs: 56, fiber: 5, sodium: 1150 },
    costcoSourcing: ['Kirkland 90/10 lean ground beef', 'Kikkoman gochujang', 'Kirkland jasmine rice', 'Kirkland organic eggs', 'Sinto kimchi (Costco)'],
    title: 'Spicy Korean Gochujang Beef Bowl',
    servings: 2, timeMin: 20,
    description: 'Gochujang-glazed ground beef over jasmine rice with kimchi and fried egg. Bold, spicy, deeply savory.',
    tags: ['lunch','high-protein','spicy','korean','bowl'],
    image: '🥢',
    ingredients: [
      { id:'lb001_1', qty:450, unit:'g', name:'lean ground beef (90/10)', protein:true },
      { id:'lb001_2', qty:2, unit:'tbsp', name:'gochujang (Korean chili paste)' },
      { id:'lb001_3', qty:1, unit:'tbsp', name:'soy sauce (low sodium)' },
      { id:'lb001_4', qty:1, unit:'tbsp', name:'rice vinegar' },
      { id:'lb001_5', qty:1, unit:'tsp', name:'toasted sesame oil' },
      { id:'lb001_6', qty:1, unit:'tsp', name:'honey or brown sugar' },
      { id:'lb001_7', qty:3, unit:'clove', name:'garlic, minced',
        alternates: [{ modeId:'paste', qty:1, unit:'tbsp', name:'garlic paste' }] },
      { id:'lb001_8', qty:1, unit:'tsp', name:'fresh ginger, grated',
        alternates: [{ modeId:'paste', qty:1, unit:'tsp', name:'ginger paste' }] },
      { id:'lb001_9', qty:1, unit:'cup', name:'jasmine rice (dry — makes 3 cups cooked)' },
      { id:'lb001_10', qty:2, unit:'unit', name:'eggs (for frying)', protein:true },
      { id:'lb001_11', qty:0.5, unit:'cup', name:'kimchi' },
      { id:'lb001_12', qty:2, unit:'unit', name:'scallions, sliced' },
      { id:'lb001_13', qty:1, unit:'tsp', name:'sesame seeds' }
    ],
    steps: [
      { id:'lb001_s1', phase:'cook', timerSec:900,
        text:'Cook rice: rinse 1 cup jasmine rice until water runs clear. Add to a small saucepan with 1½ cups water and ¼ tsp salt. Bring to a boil, cover, reduce to LOW. Simmer 15 min. Off heat, rest covered 5 min, then fluff with a fork.' ,
        parallelTask:'While rice cooks: do all the prep below (chop veg, slice protein, make sauces). 15 minutes is enough to get everything ready.'},
      { id:'lb001_s2', phase:'prep', timerSec:null,
        text:'In a small bowl, whisk 2 tbsp gochujang + 1 tbsp soy sauce + 1 tbsp rice vinegar + 1 tsp sesame oil + 1 tsp honey. This is the glaze.' },
      { id:'lb001_s3', phase:'cook', timerSec:360,
        text:'Heat a 12-inch skillet over MEDIUM-HIGH. Add 450g ground beef. Break it up with a wooden spoon and brown 5-6 min until no pink remains. Drain excess fat (leave ~1 tbsp in the pan for flavor).' },
      { id:'lb001_s4', phase:'cook', timerSec:180,
        text:'Add minced garlic and ginger to the beef. Stir 30 sec until fragrant. Pour in the gochujang glaze. Simmer over MEDIUM 2-3 min until glaze thickens and coats the beef like a sticky sauce.' },
      { id:'lb001_s5', phase:'cook', timerSec:180,
        text:'In a separate small non-stick pan, heat 1 tsp oil over MEDIUM. Crack 2 eggs and fry sunny-side up, 2-3 min until whites are set but yolks are still runny.' },
      { id:'lb001_s6', phase:'plate', timerSec:null,
        text:'Divide rice between 2 bowls. Top with gochujang beef, ¼ cup kimchi each, and a fried egg. Sprinkle sliced scallions and sesame seeds. Break the yolk to mix into the rice.' }
    ]
  },

  {
    id: 'lb_002',
    mealType: 'lunch',
    leftoverFriendly: false,
    nutrition: { calories: 540, protein: 52, fat: 26, carbs: 22, fiber: 5, sodium: 1320 },
    costcoSourcing: ['Costco rotisserie chicken', "Frank's RedHot", 'Kirkland organic ranch', 'Costco romaine hearts 6-pack', "French's crispy fried onions"],
    title: 'Buffalo Chicken Crunch Bowl',
    servings: 2, timeMin: 15,
    description: 'Shredded rotisserie chicken tossed in buffalo, over romaine with ranch, crispy onions, blue cheese. Wedge salad energy.',
    tags: ['lunch','high-protein','spicy','bowl'],
    image: '🍗',
    ingredients: [
      { id:'lb002_1', qty:2, unit:'cup', name:'shredded rotisserie chicken', protein:true },
      { id:'lb002_2', qty:3, unit:'tbsp', name:"Frank's RedHot buffalo sauce" },
      { id:'lb002_3', qty:1, unit:'tbsp', name:'melted butter' },
      { id:'lb002_4', qty:6, unit:'cup', name:'chopped romaine lettuce' },
      { id:'lb002_5', qty:1, unit:'stalk', name:'celery, diced' },
      { id:'lb002_6', qty:0.5, unit:'unit', name:'cucumber, diced' },
      { id:'lb002_7', qty:0.25, unit:'cup', name:'shredded carrot' },
      { id:'lb002_8', qty:2, unit:'tbsp', name:'light ranch dressing' },
      { id:'lb002_9', qty:2, unit:'tbsp', name:'crumbled blue cheese' },
      { id:'lb002_10', qty:0.25, unit:'cup', name:'crispy fried onions' }
    ],
    steps: [
      { id:'lb002_s1', phase:'prep', timerSec:60,
        text:'In a microwave-safe bowl, toss 2 cups shredded chicken with 3 tbsp buffalo sauce and 1 tbsp melted butter. Microwave 60 sec to warm through and let the sauce soak in.' },
      { id:'lb002_s2', phase:'plate', timerSec:null,
        text:'Divide 6 cups romaine between two bowls. Top each with celery, cucumber, and shredded carrot.' },
      { id:'lb002_s3', phase:'plate', timerSec:null,
        text:'Pile buffalo chicken on top. Drizzle 1 tbsp ranch each. Sprinkle blue cheese crumbles and crispy fried onions. Eat immediately — the onions soften fast.' }
    ]
  },

  {
    id: 'lb_003',
    mealType: 'lunch',
    leftoverFriendly: true,
    nutrition: { calories: 610, protein: 50, fat: 22, carbs: 52, fiber: 6, sodium: 880 },
    costcoSourcing: ['Kirkland boneless skinless chicken thighs', 'Kirkland feta block', 'Costco kalamata olives', 'Tzatziki dip', 'Costco couscous'],
    title: 'Greek Chicken Power Bowl',
    servings: 2, timeMin: 25,
    description: 'Air fryer chicken thighs over couscous with cucumber, feta, olives, tzatziki. Mediterranean, no tomato.',
    tags: ['lunch','high-protein','mediterranean','bowl'],
    image: '🫒',
    ingredients: [
      { id:'lb003_1', qty:450, unit:'g', name:'boneless skinless chicken thighs', protein:true },
      { id:'lb003_2', qty:1, unit:'tbsp', name:'olive oil' },
      { id:'lb003_3', qty:1, unit:'tsp', name:'dried oregano' },
      { id:'lb003_4', qty:1, unit:'tsp', name:'smoked paprika' },
      { id:'lb003_5', qty:0.5, unit:'tsp', name:'garlic powder' },
      { id:'lb003_6', qty:0.25, unit:'tsp', name:'cayenne' },
      { id:'lb003_7', qty:1, unit:'unit', name:'lemon (juice + zest)' },
      { id:'lb003_8', qty:1, unit:'cup', name:'couscous (dry)' },
      { id:'lb003_9', qty:1, unit:'unit', name:'cucumber, diced' },
      { id:'lb003_10', qty:0.33, unit:'cup', name:'crumbled feta' },
      { id:'lb003_11', qty:0.25, unit:'cup', name:'kalamata olives, pitted' },
      { id:'lb003_12', qty:0.25, unit:'cup', name:'tzatziki' },
      { id:'lb003_13', qty:2, unit:'cup', name:'baby spinach or arugula' }
    ],
    steps: [
      { id:'lb003_s1', phase:'prep', timerSec:null,
        text:'In a bowl, toss 450g chicken thighs with 1 tbsp olive oil, 1 tsp oregano, 1 tsp smoked paprika, ½ tsp garlic powder, ¼ tsp cayenne, lemon zest, ½ tsp salt, and ¼ tsp pepper.' },
      { id:'lb003_s2', phase:'cook', timerSec:900,
        text:'Air fry at 205°C for 14-16 min, flipping at 8 min. Internal temp should reach 75°C at the thickest part. Let rest 5 min on a cutting board, then slice across the grain.' },
      { id:'lb003_s3', phase:'cook', timerSec:300,
        text:'While chicken cooks: pour 1 cup boiling water over 1 cup couscous in a heat-safe bowl. Cover with a plate. Let sit 5 min, then fluff with a fork.' },
      { id:'lb003_s4', phase:'plate', timerSec:null,
        text:'Divide couscous and greens between 2 bowls. Top with sliced chicken, diced cucumber, feta, olives. Dollop tzatziki. Squeeze remaining lemon juice over everything.' }
    ]
  },

  {
    id: 'lb_004',
    mealType: 'lunch',
    leftoverFriendly: false,
    nutrition: { calories: 580, protein: 42, fat: 22, carbs: 52, fiber: 8, sodium: 720 },
    costcoSourcing: ['Costco Atlantic salmon fillets', 'Kirkland frozen edamame', 'Kirkland jasmine rice', 'Costco avocado 6-pack', 'Kewpie or light mayo'],
    title: 'Spicy Salmon Rice Bowl (Leftover-Friendly)',
    servings: 1, timeMin: 10,
    description: 'Flake leftover salmon over jasmine rice with sriracha mayo, edamame, cucumber, avocado. Sushi-bowl energy in 10 minutes.',
    tags: ['lunch','high-protein','spicy','asian','bowl','leftover'],
    image: '🍣',
    ingredients: [
      { id:'lb004_1', qty:140, unit:'g', name:'cooked salmon (leftover or fresh)', protein:true },
      { id:'lb004_2', qty:0.75, unit:'cup', name:'cooked jasmine rice' },
      { id:'lb004_3', qty:0.5, unit:'cup', name:'shelled edamame (frozen, steamed)' },
      { id:'lb004_4', qty:0.5, unit:'unit', name:'cucumber, sliced' },
      { id:'lb004_5', qty:0.25, unit:'unit', name:'avocado, sliced' },
      { id:'lb004_6', qty:1, unit:'tbsp', name:'light mayo' },
      { id:'lb004_7', qty:1, unit:'tsp', name:'sriracha (more to taste)' },
      { id:'lb004_8', qty:0.5, unit:'tsp', name:'soy sauce (low sodium)' },
      { id:'lb004_9', qty:1, unit:'tsp', name:'sesame seeds' },
      { id:'lb004_10', qty:1, unit:'unit', name:'scallion, sliced' },
      { id:'lb004_11', qty:1, unit:'sheet', name:'nori (optional, crumbled)' }
    ],
    steps: [
      { id:'lb004_s1', phase:'prep', timerSec:120,
        text:'Microwave frozen edamame with 1 tbsp water in a covered bowl for 2 min. Drain. Slice cucumber and avocado.' },
      { id:'lb004_s2', phase:'prep', timerSec:null,
        text:'Stir 1 tbsp mayo with 1 tsp sriracha for spicy mayo. Add more sriracha if you want extra heat.' },
      { id:'lb004_s3', phase:'cook', timerSec:60,
        text:'Microwave ¾ cup rice 60 sec to warm. Flake 140g salmon into bite-size pieces. Drizzle ½ tsp soy sauce over the salmon.' },
      { id:'lb004_s4', phase:'plate', timerSec:null,
        text:'In a bowl: rice as base, then arrange salmon, edamame, cucumber, avocado in sections like a chirashi bowl. Drizzle spicy mayo across. Top with sesame seeds, scallions, and crumbled nori.' }
    ]
  }

];
