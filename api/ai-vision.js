// Generic AI vision/text endpoint. Routes to different prompts based on task type.
// All four AI features (pantry scan, receipt scan, plate photo, recipe import) call this.

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const PROMPTS = {
  pantry_scan: `You are a precise kitchen inventory assistant. Identify EVERY food item visible across all photo(s) the user has provided. The photos may show a pantry, fridge, spice rack, freezer, or counter.

## STRICT NAMING RULES

For each item, use the most SPECIFIC name a North American shopper would recognize.

GOOD: "garlic powder", "smoked paprika", "basmati rice", "Greek yogurt", "Frank's RedHot"
BAD (never use): "spice", "seasoning", "sauce", "oil", "meat", "produce"

If you cannot read a label clearly:
- Use the BEST guess based on color/shape (e.g. "dried oregano (likely)")
- Set confidence to "low"

## CATEGORIZATION (exact, pick ONE):
"produce", "protein", "dairy", "grain", "spice", "sauce", "condiment", "frozen", "snack", "beverage", "other"

## QUANTITY
- Spices in jars: qty=1, unit="jar"
- Packaged goods: count packages (qty=1, unit="box"/"can"/"bag")
- Fresh produce: count individual items (qty=5, unit="unit")

## EXPIRY
- Fresh produce, meat, dairy: is_perishable=true
- Canned, dried, spiced, packaged shelf-stable: is_perishable=false

## SKIP
- Non-food items (utensils, paper towels, cleaning supplies)
- Items in background that aren't clearly inventory

## OUTPUT — Return ONLY valid JSON, no markdown:
{
  "detected_location": "pantry" | "fridge" | "freezer" | "spice_rack" | "mixed",
  "items": [
    { "name": "garlic powder", "qty": 1, "unit": "jar", "category": "spice", "is_perishable": false, "location": "pantry", "confidence": "high" }
  ]
}

If multiple photos provided, combine into ONE list (don't duplicate items visible across photos).`,

  receipt_scan: `You are a grocery receipt parser. Extract every food/grocery item from the receipt photo.

## RULES

For each line item that is FOOD or KITCHEN-RELATED:
- Get the item name as readable on the receipt
- Translate abbreviations to common names: "ORG BABY SPINCH" → "organic baby spinach", "WHL MLK 2%" → "whole milk 2%", "ROTISS CHKN" → "rotisserie chicken"
- Costco-specific: items like "KS CHKN BRST" mean "Kirkland chicken breast"
- Get the quantity (default 1 if unclear)
- Categorize using these exact categories:
  "produce", "protein", "dairy", "grain", "spice", "sauce", "condiment", "frozen", "snack", "beverage", "other"

## SKIP
- Non-food: cleaning supplies, paper goods, household, electronics, alcohol
- Receipt headers, store info, payment info, totals, tax lines
- Tips, discounts, redemptions
- Unclear items where you can't tell what they are

## OUTPUT — ONLY valid JSON, no markdown:
{
  "store_name": "Costco" | "Loblaws" | etc.,
  "purchase_date": "YYYY-MM-DD" | null,
  "items": [
    {
      "name": "boneless skinless chicken breasts",
      "raw_text": "KS CHKN BRST 2.5KG",
      "qty": 1,
      "unit": "pack",
      "price": 22.99,
      "category": "protein",
      "is_perishable": true,
      "confidence": "high"
    }
  ]
}`,

  plate_photo: `You are a nutrition estimator. Analyze the photo of food on a plate/bowl and estimate the macros.

## RULES

1. Identify each visible food item on the plate
2. Estimate the portion size based on standard plate size (typical dinner plate ~10-11 inches)
3. Calculate APPROXIMATE total calories, protein, fat, carbs, fiber, sodium for the whole plate (combined)
4. Be CONSERVATIVE — slightly underestimate rather than overestimate
5. Confidence levels:
   - "high": clearly visible, standard portion, recognizable foods
   - "medium": mostly visible, foods identifiable, portion estimate has some uncertainty
   - "low": hard to see, unusual presentation, mixed dish where macros vary widely

## COMMON REFERENCE VALUES (per 100g cooked unless noted):
- chicken breast: 165 cal, 31g P
- ground beef 90/10: 176 cal, 27g P
- salmon: 208 cal, 20g P
- white rice cooked: 130 cal, 2.7g P
- pasta cooked: 131 cal, 5g P
- bread: 265 cal, 9g P per slice
- egg (1 whole): 70 cal, 6g P
- avocado: 160 cal per half
- cheese: 100 cal per oz, 7g P

## OUTPUT — ONLY valid JSON, no markdown:
{
  "meal_name": "string — describe the plate in 4-8 words",
  "components": [
    { "food": "grilled chicken breast", "estimated_grams": 170, "calories": 280, "protein": 53 }
  ],
  "totals": {
    "calories": 540,
    "protein": 45,
    "fat": 18,
    "carbs": 50,
    "fiber": 6,
    "sodium": 600
  },
  "confidence": "high" | "medium" | "low",
  "notes": "Optional 1-sentence caveat if there's uncertainty"
}`,

  recipe_import: `You are a recipe parser. Convert the provided recipe webpage/text into structured data.

## NAMING RULES
- Recipe title: use the original from the source
- Ingredient names: lowercase, descriptive (e.g. "boneless skinless chicken thighs", "low-sodium soy sauce")
- Step IDs: sequential like step_1, step_2

## INGREDIENTS — each one needs:
- id: "ing_1", "ing_2", etc.
- qty: numeric quantity (e.g. 2, 0.5, 0.25)
- unit: one of "g", "kg", "ml", "l", "cup", "tbsp", "tsp", "oz", "lb", "clove", "unit", "pinch", "slice", "strip"
- name: the ingredient name (no qty in here)
- protein: true if it's the main protein source (chicken, beef, fish, tofu, eggs etc), else omit

## STEPS — each one needs:
- id: "step_1", "step_2", etc.
- phase: "prep" | "cook" | "plate"
- timerSec: seconds if waiting/cooking is involved, else null
- text: the instruction text (1-2 sentences, clear and actionable)

## SERVINGS & TIME
- servings: how many portions the recipe makes (number)
- timeMin: total active time in minutes (number)

## CATEGORIZATION
- mealType: "breakfast" | "lunch" | "dinner" based on the recipe's typical usage
- tags: 2-5 short tags like ["high-protein", "spicy", "asian", "weeknight"]

## OUTPUT — ONLY valid JSON, no markdown:
{
  "title": "Spicy Korean Beef Bowls",
  "servings": 2,
  "timeMin": 25,
  "mealType": "dinner",
  "description": "1-2 sentence summary",
  "tags": ["korean", "spicy", "high-protein"],
  "image": "🥢",
  "ingredients": [
    { "id": "ing_1", "qty": 450, "unit": "g", "name": "lean ground beef", "protein": true }
  ],
  "steps": [
    { "id": "step_1", "phase": "cook", "timerSec": 360, "text": "Brown beef in skillet over medium-high heat, 5-6 minutes." }
  ],
  "estimated_nutrition_per_serving": {
    "calories": 620, "protein": 48, "fat": 22, "carbs": 56, "fiber": 5, "sodium": 1150
  }
}`,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY environment variable not set in Vercel project settings.',
    });
  }

  try {
    const { task, images, text } = req.body;
    if (!task || !PROMPTS[task]) {
      return res.status(400).json({
        error: 'Invalid or missing task. Must be: pantry_scan, receipt_scan, plate_photo, or recipe_import',
      });
    }

    // Normalize images list
    let imageList = [];
    if (Array.isArray(images) && images.length > 0) {
      imageList = images.map(img => ({
        base64: (img.base64 || '').replace(/^data:image\/\w+;base64,/, ''),
        mimeType: img.mimeType || 'image/jpeg',
      })).filter(img => img.base64);
    }

    // Validate: must have images OR text
    if (imageList.length === 0 && !text) {
      return res.status(400).json({ error: 'Must provide either images or text' });
    }
    if (imageList.length > 6) {
      return res.status(400).json({ error: 'Maximum 6 images per request' });
    }

    // Build parts array
    const parts = [{ text: PROMPTS[task] }];
    if (text) {
      parts.push({ text: '\n\nUser input:\n' + text });
    }
    for (const img of imageList) {
      parts.push({ inline_data: { mime_type: img.mimeType, data: img.base64 } });
    }

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.15,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', geminiRes.status, errText);
      return res.status(geminiRes.status).json({
        error: 'Gemini API error',
        status: geminiRes.status,
        detail: errText.slice(0, 500),
      });
    }

    const data = await geminiRes.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      return res.status(500).json({ error: 'No response from Gemini', raw: data });
    }

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        return res.status(500).json({ error: 'Failed to parse Gemini response', raw: responseText });
      }
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('AI vision handler error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};
