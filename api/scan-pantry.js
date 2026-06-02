// Vercel serverless function for scanning pantry/fridge photos with Gemini.
// Supports multiple images in one request for better coverage of large pantries.

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `You are a precise kitchen inventory assistant. Identify EVERY food item visible across all photo(s) the user has provided. The photos may show a pantry, fridge, spice rack, freezer, or counter.

## STRICT NAMING RULES

For each item, use the most SPECIFIC name a North American shopper would recognize.

GOOD (specific):
- "garlic powder", "smoked paprika", "ground cumin"
- "basmati rice", "rolled oats", "whole wheat pasta"
- "kalamata olives", "dijon mustard", "sriracha"
- "Greek yogurt", "extra-virgin olive oil"
- "boneless skinless chicken breasts"
- "Roma tomatoes", "yellow onion", "fresh cilantro"

BAD (too generic — NEVER use):
- "spice", "seasoning", "herbs"
- "rice", "pasta", "grain"
- "sauce", "condiment", "dressing"
- "oil", "vinegar"
- "meat", "fish", "produce", "vegetable"

If you cannot read a label clearly:
- Use the BEST guess based on color/shape (e.g. "dried oregano (likely)")
- Set confidence to "low"

For BRANDED items where the brand matters (specialty hot sauces, distinctive products):
- Include the brand: "Frank's RedHot", "Mike's Hot Honey", "Huy Fong sriracha"
For generic items, OMIT the brand: "olive oil" not "Filippo Berio olive oil"

## CATEGORIZATION RULES (must be exact)

Categories (pick ONE per item):
- "produce" — fresh fruits and vegetables
- "protein" — meat, poultry, fish, eggs, tofu, deli items, beans (canned/dried)
- "dairy" — milk, yogurt, cheese, butter, cream
- "grain" — rice, pasta, bread, oats, flour, cereal
- "spice" — ground spices, herbs, salt, pepper, seasoning blends
- "sauce" — hot sauces, soy sauce, tomato sauce, pasta sauce, marinades
- "condiment" — mustard, mayo, ketchup, relish, pickles, jam, honey
- "frozen" — anything from freezer compartment
- "snack" — chips, crackers, cookies, nuts, granola bars
- "beverage" — milk alternatives, juice, soda, water, coffee, tea
- "other" — only if truly none of the above fit

## QUANTITY RULES

- For PACKAGED items (jars, cans, boxes, bags): count the package, qty=1, unit matches container
  - 3 cans of beans → 3 separate entries each qty=1 unit="can", OR one entry qty=3 unit="can"
  - 1 box of pasta → qty=1, unit="box"
- For SPICES in jars: qty=1, unit="jar"
- For FRESH PRODUCE: count individual items
  - "5 apples" → qty=5, unit="unit"
  - "1 bunch of bananas" → qty=1, unit="bunch"
- For BULK or LOOSE items where you can't tell amount: qty=1, unit="bag" or "container"

## LOCATION INFERENCE

Based on visible context:
- "pantry" — shelves, cupboards, dry storage
- "fridge" — refrigerator compartment (drinks visible, condiments, fresh items)
- "freezer" — frozen foods, ice

If you see multiple zones in one image, label each item by its zone.

## EXPIRY

- For fresh produce, meat, dairy: set is_perishable=true
- For canned, dried, spiced, packaged shelf-stable items: is_perishable=false

## SKIP

- Non-food items (paper towels, cleaning supplies, utensils, dishware)
- Items you cannot identify at all (don't guess "something")
- Items in the photo background that aren't clearly part of the inventory

## OUTPUT

Return ONLY valid JSON in this EXACT format. No markdown, no preamble:

{
  "detected_location": "pantry" | "fridge" | "freezer" | "spice_rack" | "mixed",
  "items": [
    {
      "name": "garlic powder",
      "qty": 1,
      "unit": "jar",
      "category": "spice",
      "is_perishable": false,
      "location": "pantry",
      "confidence": "high"
    }
  ]
}

If the user provides multiple photos, combine all items into one list. Do not duplicate items visible in multiple photos — choose the photo with the clearest view.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY environment variable not set. Add it in Vercel project settings.',
    });
  }

  try {
    // Accept both legacy single-image and new multi-image formats
    const { imageBase64, mimeType = 'image/jpeg', images } = req.body;
    let imageList = [];

    if (Array.isArray(images) && images.length > 0) {
      // New multi-image format: [{ base64, mimeType }, ...]
      imageList = images.map(img => ({
        base64: (img.base64 || '').replace(/^data:image\/\w+;base64,/, ''),
        mimeType: img.mimeType || 'image/jpeg',
      })).filter(img => img.base64);
    } else if (imageBase64) {
      // Legacy single-image format
      imageList = [{
        base64: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        mimeType,
      }];
    }

    if (imageList.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    if (imageList.length > 6) {
      return res.status(400).json({ error: 'Maximum 6 images per scan' });
    }

    // Build Gemini request parts: prompt + all image parts
    const parts = [
      { text: SYSTEM_PROMPT },
      ...(imageList.length > 1
        ? [{ text: `\n\nThe user has provided ${imageList.length} photos. Analyze ALL of them together and return a SINGLE combined inventory list.` }]
        : []),
      ...imageList.map(img => ({
        inline_data: { mime_type: img.mimeType, data: img.base64 },
      })),
    ];

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.15, // Lower = more consistent naming
          maxOutputTokens: 8192, // More room for multi-image responses
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
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(500).json({ error: 'No response from Gemini', raw: data });
    }

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        return res.status(500).json({ error: 'Failed to parse Gemini response as JSON', raw: text });
      }
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Scan handler error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb', // Increased for multi-image
    },
  },
};
