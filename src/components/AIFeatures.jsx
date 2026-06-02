// All 4 AI features in one file to reduce file count.
// - ReceiptScanModal
// - RecipeImportModal
// - WhatCanIMakeTonight (home widget)
// - PlatePhotoLogger

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Camera, Upload, X, Check, Loader2, AlertCircle, Edit3, Trash2,
  Plus, Minus, Sparkles, Receipt, Link2, ChefHat, ChevronRight,
  Clock, Image as ImageIcon, Wand2,
} from 'lucide-react';

// ============================================================
// SHARED HELPERS
// ============================================================

async function resizeImage(file, maxSize = 1024) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ base64: reader.result, blob });
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.85);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

const CATEGORY_EMOJI = {
  produce: '🥬', protein: '🥩', dairy: '🥛', grain: '🌾',
  spice: '🌶️', sauce: '🥫', condiment: '🧂', frozen: '🧊',
  snack: '🍪', beverage: '🥤', other: '📦',
};

const primaryBtn = {
  background: '#A85C32', color: '#FAF6EF', border: 'none',
  borderRadius: 10, padding: '12px 18px', fontSize: 14, fontWeight: 600,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: 8, width: '100%',
};

const secondaryBtn = {
  background: '#fff', color: '#5C4A3A', border: '1px solid #E8DDC9',
  borderRadius: 10, padding: '12px 18px', fontSize: 13, fontWeight: 500,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: 6, width: '100%',
};

const qtyBtn = {
  width: 22, height: 22, border: '1px solid #E8DDC9', background: '#fff',
  borderRadius: 4, cursor: 'pointer', padding: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C4A3A',
};

function ModalShell({ open, onClose, title, icon, footer, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: '#FAF6EF', borderRadius: 16, maxWidth: 540, width: '100%',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #E8DDC9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {icon}
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#3D2F22' }}>{title}</h2>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: 4, borderRadius: 6, color: '#7A6450',
          }}><X size={20} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>{children}</div>
        {footer && (
          <div style={{
            padding: 16, borderTop: '1px solid #E8DDC9',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>{footer}</div>
        )}
      </div>
    </div>
  );
}


// ============================================================
// 1. RECEIPT SCAN MODAL
// ============================================================
export function ReceiptScanModal({ open, onClose, onAddItems, onMergeItems, existingPantry = [] }) {
  const [stage, setStage] = useState('capture'); // capture | scanning | review | error
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(null);
  const [items, setItems] = useState([]);
  const [storeName, setStoreName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [saving, setSaving] = useState(false);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const findExisting = (name) => {
    const lower = (name || '').toLowerCase().trim();
    if (!lower) return null;
    return existingPantry.find(p => {
      const pn = (p.name || '').toLowerCase().trim();
      if (pn === lower) return true;
      if (pn.length >= 3 && lower.length >= 3 && (pn.includes(lower) || lower.includes(pn))) return true;
      return false;
    }) || null;
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStage('scanning');
    setError('');
    try {
      const { base64 } = await resizeImage(file, 1280); // Higher res for receipts (small text)
      setPhoto(base64);
      const res = await fetch('/api/ai-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'receipt_scan',
          images: [{ base64, mimeType: 'image/jpeg' }],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Scan failed (${res.status})`);
      }
      const data = await res.json();
      const detected = (data.items || []).map((item, i) => {
        const existing = findExisting(item.name);
        return {
          ...item,
          _id: 'r_' + Date.now() + '_' + i,
          _selected: item.confidence !== 'low',
          _existing: existing,
          _action: existing ? 'merge' : 'add',
        };
      });
      if (detected.length === 0) {
        setError('No items detected. Make sure the receipt is well-lit and readable.');
        setStage('error');
        return;
      }
      setItems(detected);
      setStoreName(data.store_name || '');
      setPurchaseDate(data.purchase_date || '');
      setStage('review');
    } catch (err) {
      setError(err.message || 'Failed to scan receipt');
      setStage('error');
    }
  };

  const update = (id, patch) => setItems(prev => prev.map(it => it._id === id ? { ...it, ...patch } : it));
  const remove = (id) => setItems(prev => prev.filter(it => it._id !== id));

  const handleSave = async () => {
    const selected = items.filter(it => it._selected);
    if (selected.length === 0) return;
    setSaving(true);
    try {
      const toAdd = selected.filter(it => it._action === 'add').map(it => ({
        name: it.name, qty: Number(it.qty) || 1, unit: it.unit || 'unit',
        category: it.category, is_perishable: !!it.is_perishable, location: 'pantry',
      }));
      const toMerge = selected.filter(it => it._action === 'merge' && it._existing).map(it => ({
        existing: it._existing, addQty: Number(it.qty) || 1,
      }));
      if (toAdd.length > 0) await onAddItems(toAdd);
      if (toMerge.length > 0 && onMergeItems) await onMergeItems(toMerge);
      setStage('capture'); setItems([]); setPhoto(null);
      onClose();
    } catch (err) {
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => { setStage('capture'); setError(''); setItems([]); setPhoto(null); };
  const selectedCount = items.filter(i => i._selected).length;

  return (
    <ModalShell
      open={open} onClose={onClose}
      title={stage === 'capture' ? 'Scan Receipt' : stage === 'scanning' ? 'Reading receipt...' : stage === 'review' ? `${selectedCount} of ${items.length} selected` : 'Error'}
      icon={<Receipt size={18} color="#A85C32" />}
      footer={stage === 'review' && (
        <>
          <button onClick={reset} style={{
            background: 'transparent', border: '1px solid #E8DDC9', color: '#5C4A3A',
            padding: '10px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
          }}>← Rescan</button>
          <button onClick={handleSave} disabled={saving || selectedCount === 0} style={{
            ...primaryBtn, width: 'auto', flex: 1,
            opacity: (saving || selectedCount === 0) ? 0.5 : 1,
            cursor: (saving || selectedCount === 0) ? 'not-allowed' : 'pointer',
          }}>
            {saving ? <><Loader2 size={16} className="spin" />Saving...</> : <><Check size={16} />Add {selectedCount}</>}
          </button>
        </>
      )}
    >
      {stage === 'capture' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, fontSize: 14, color: '#5C4A3A', lineHeight: 1.6 }}>
            Snap a photo of your grocery receipt. The AI will extract every food item and offer to add them to your pantry.
          </p>
          <div style={{
            background: '#FFF4E6', border: '1px solid #E8B587', borderRadius: 10,
            padding: 12, fontSize: 12, color: '#7A4220', display: 'flex', gap: 10,
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div><strong>Tip:</strong> Lay the receipt flat, good lighting, hold camera straight overhead. Long receipts? Take 2 photos and they'll work better separately.</div>
          </div>
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
          <button onClick={() => cameraInputRef.current?.click()} style={primaryBtn}><Camera size={18} />Take Photo</button>
          <button onClick={() => fileInputRef.current?.click()} style={secondaryBtn}><Upload size={16} />Upload from Gallery</button>
        </div>
      )}

      {stage === 'scanning' && (
        <div style={{ textAlign: 'center', padding: '40px 16px' }}>
          {photo && <img src={photo} alt="" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 12, marginBottom: 16, opacity: 0.7 }} />}
          <Loader2 size={36} className="spin" style={{ color: '#A85C32', marginBottom: 12 }} />
          <div style={{ fontSize: 15, color: '#3D2F22', fontWeight: 500 }}>Parsing receipt...</div>
          <div style={{ fontSize: 12, color: '#7A6450', marginTop: 4 }}>Reading items and matching to your pantry</div>
        </div>
      )}

      {stage === 'review' && (
        <div>
          {(storeName || purchaseDate) && (
            <div style={{
              background: '#fff', border: '1px solid #E8DDC9', borderRadius: 10,
              padding: 10, marginBottom: 12, fontSize: 13, color: '#5C4A3A',
            }}>
              {storeName && <span style={{ fontWeight: 600 }}>{storeName}</span>}
              {storeName && purchaseDate && ' · '}
              {purchaseDate && <span>{purchaseDate}</span>}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map(item => (
              <PantryItemRow key={item._id} item={item} onUpdate={(p) => update(item._id, p)} onRemove={() => remove(item._id)} />
            ))}
          </div>
        </div>
      )}

      {stage === 'error' && (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <AlertCircle size={36} color="#C4856E" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 14, color: '#3D2F22', marginBottom: 16 }}>{error}</div>
          <button onClick={reset} style={primaryBtn}>Try Again</button>
        </div>
      )}
    </ModalShell>
  );
}

// Shared item row for receipt + pantry scans
function PantryItemRow({ item, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false);
  const isMerge = item._action === 'merge';

  return (
    <div style={{
      background: item._selected ? '#fff' : '#F5EFE3',
      border: '1px solid ' + (isMerge ? '#E8B587' : '#E8DDC9'),
      borderRadius: 10, padding: 10,
      opacity: item._selected ? 1 : 0.5,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <input type="checkbox" checked={item._selected}
          onChange={e => onUpdate({ _selected: e.target.checked })}
          style={{ width: 18, height: 18, cursor: 'pointer', flexShrink: 0, marginTop: 4 }} />
        <div style={{ fontSize: 22, flexShrink: 0, lineHeight: 1.2 }}>
          {CATEGORY_EMOJI[item.category] || '📦'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <input type="text" value={item.name} onChange={e => onUpdate({ name: e.target.value })}
              onBlur={() => setEditing(false)} autoFocus
              style={{ fontSize: 14, fontWeight: 500, color: '#3D2F22', border: '1px solid #A85C32', borderRadius: 4, padding: '2px 6px', width: '100%' }} />
          ) : (
            <button onClick={() => setEditing(true)}
              style={{ background: 'transparent', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 6, width: '100%' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#3D2F22', textTransform: 'capitalize', wordBreak: 'break-word', flex: 1, lineHeight: 1.35 }}>{item.name}</span>
              <Edit3 size={11} color="#9A8470" style={{ flexShrink: 0, marginTop: 4 }} />
            </button>
          )}
          <div style={{ fontSize: 11, color: '#7A6450', marginTop: 3, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ textTransform: 'capitalize' }}>{item.category}</span>
            {item.price && <><span>·</span><span>${Number(item.price).toFixed(2)}</span></>}
            {isMerge && item._existing && (
              <><span>·</span><span style={{ color: '#A85C32', fontWeight: 500 }}>⊕ Merge into existing ({item._existing.qty} {item._existing.unit})</span></>
            )}
          </div>
        </div>
      </div>
      {item._existing && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, paddingLeft: 38 }}>
          <button onClick={() => onUpdate({ _action: 'merge' })}
            style={{ padding: '4px 10px', borderRadius: 12, border: '1px solid #E8DDC9', fontSize: 10, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.3px',
              background: item._action === 'merge' ? '#A85C32' : '#fff',
              color: item._action === 'merge' ? '#fff' : '#5C4A3A' }}>⊕ Merge</button>
          <button onClick={() => onUpdate({ _action: 'add' })}
            style={{ padding: '4px 10px', borderRadius: 12, border: '1px solid #E8DDC9', fontSize: 10, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.3px',
              background: item._action === 'add' ? '#A85C32' : '#fff',
              color: item._action === 'add' ? '#fff' : '#5C4A3A' }}>+ New</button>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 38 }}>
        <button onClick={() => onUpdate({ qty: Math.max(0.25, (Number(item.qty) || 1) - 1) })} style={qtyBtn}><Minus size={12} /></button>
        <span style={{ minWidth: 28, textAlign: 'center', fontSize: 13, fontWeight: 500, color: '#3D2F22' }}>{item.qty}</span>
        <button onClick={() => onUpdate({ qty: (Number(item.qty) || 1) + 1 })} style={qtyBtn}><Plus size={12} /></button>
        <select value={item.unit} onChange={e => onUpdate({ unit: e.target.value })}
          style={{ fontSize: 11, padding: '4px 6px', border: '1px solid #E8DDC9', borderRadius: 4, background: '#fff', color: '#5C4A3A', marginLeft: 4 }}>
          {['unit', 'g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'bunch', 'bottle', 'jar', 'can', 'bag', 'box', 'pack'].map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button onClick={onRemove} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#C4856E', padding: 4 }}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}


// ============================================================
// 2. RECIPE IMPORT MODAL
// ============================================================
export function RecipeImportModal({ open, onClose, onAddRecipe }) {
  const [stage, setStage] = useState('input'); // input | fetching | review | error
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleFetch = async () => {
    if (!url.trim()) return;
    setStage('fetching');
    setError('');
    try {
      // Step 1: Fetch the page
      const fetchRes = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!fetchRes.ok) {
        const err = await fetchRes.json().catch(() => ({}));
        throw new Error(err.error || `Failed to fetch URL (${fetchRes.status})`);
      }
      const fetched = await fetchRes.json();

      // Step 2: Send page content (JSON-LD or text) to AI for parsing
      const aiInput = fetched.type === 'json_ld'
        ? `Source URL: ${fetched.url}\n\nRecipe JSON-LD:\n${JSON.stringify(fetched.recipe, null, 2)}`
        : `Source URL: ${fetched.url}\n\nPage text:\n${fetched.text}`;

      const aiRes = await fetch('/api/ai-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'recipe_import', text: aiInput }),
      });
      if (!aiRes.ok) {
        const err = await aiRes.json().catch(() => ({}));
        throw new Error(err.error || `AI parsing failed (${aiRes.status})`);
      }
      const parsed = await aiRes.json();
      if (!parsed.title || !parsed.ingredients || !parsed.steps) {
        throw new Error('Could not parse a recipe from this page. Try a different URL.');
      }
      setRecipe(parsed);
      setStage('review');
    } catch (err) {
      setError(err.message || 'Failed to import recipe');
      setStage('error');
    }
  };

  const handleSave = async () => {
    if (!recipe) return;
    setSaving(true);
    try {
      await onAddRecipe({
        title: recipe.title,
        servings: Number(recipe.servings) || 2,
        timeMin: Number(recipe.timeMin) || 30,
        description: recipe.description || '',
        tags: recipe.tags || [],
        image: recipe.image || '🍽️',
        mealType: recipe.mealType || 'dinner',
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
        nutrition: recipe.estimated_nutrition_per_serving || {},
      });
      setStage('input'); setUrl(''); setRecipe(null);
      onClose();
    } catch (err) {
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => { setStage('input'); setError(''); setRecipe(null); };

  return (
    <ModalShell
      open={open} onClose={onClose}
      title={stage === 'input' ? 'Import Recipe from URL' : stage === 'fetching' ? 'Importing...' : stage === 'review' ? 'Review Recipe' : 'Error'}
      icon={<Link2 size={18} color="#A85C32" />}
      footer={stage === 'review' && (
        <>
          <button onClick={reset} style={{
            background: 'transparent', border: '1px solid #E8DDC9', color: '#5C4A3A',
            padding: '10px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
          }}>← Try another URL</button>
          <button onClick={handleSave} disabled={saving} style={{
            ...primaryBtn, width: 'auto', flex: 1,
            opacity: saving ? 0.5 : 1, cursor: saving ? 'not-allowed' : 'pointer',
          }}>
            {saving ? <><Loader2 size={16} className="spin" />Saving...</> : <><Check size={16} />Add Recipe</>}
          </button>
        </>
      )}
    >
      {stage === 'input' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, fontSize: 14, color: '#5C4A3A', lineHeight: 1.6 }}>
            Paste a link to any recipe online. We'll fetch it, parse the ingredients and steps, and add it to your recipes.
          </p>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#5C4A3A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 500 }}>
              Recipe URL
            </label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://www.bonappetit.com/recipe/..."
              autoComplete="off" spellCheck={false}
              style={{
                width: '100%', padding: '12px 14px', border: '1px solid #E8DDC9', borderRadius: 8,
                fontSize: 14, outline: 'none', background: '#fff',
              }}
              onKeyDown={e => { if (e.key === 'Enter') handleFetch(); }}
            />
          </div>
          <button onClick={handleFetch} disabled={!url.trim()} style={{
            ...primaryBtn, opacity: !url.trim() ? 0.5 : 1, cursor: !url.trim() ? 'not-allowed' : 'pointer',
          }}>
            <Sparkles size={16} />Import Recipe
          </button>
          <div style={{ fontSize: 11, color: '#9A8470', marginTop: 4, lineHeight: 1.5 }}>
            Works best with structured recipe sites (Bon Appétit, NYT Cooking, Serious Eats, AllRecipes, food blogs with proper recipe cards).
          </div>
        </div>
      )}

      {stage === 'fetching' && (
        <div style={{ textAlign: 'center', padding: '40px 16px' }}>
          <Loader2 size={36} className="spin" style={{ color: '#A85C32', marginBottom: 12 }} />
          <div style={{ fontSize: 15, color: '#3D2F22', fontWeight: 500 }}>Importing recipe...</div>
          <div style={{ fontSize: 12, color: '#7A6450', marginTop: 4 }}>
            Fetching page and parsing with AI
          </div>
        </div>
      )}

      {stage === 'review' && recipe && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: '#fff', border: '1px solid #E8DDC9', borderRadius: 10, padding: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{recipe.image || '🍽️'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#3D2F22', lineHeight: 1.35, wordBreak: 'break-word' }}>
                  {recipe.title}
                </div>
                <div style={{ fontSize: 11, color: '#7A6450', marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span>{recipe.servings} servings</span>
                  <span>·</span>
                  <span>{recipe.timeMin} min</span>
                  <span>·</span>
                  <span style={{ textTransform: 'capitalize' }}>{recipe.mealType}</span>
                </div>
              </div>
            </div>
            {recipe.description && (
              <div style={{ fontSize: 12, color: '#5C4A3A', lineHeight: 1.5, marginTop: 4 }}>
                {recipe.description}
              </div>
            )}
            {recipe.estimated_nutrition_per_serving && (
              <div style={{
                fontSize: 11, color: '#7A6450', marginTop: 10, padding: 8,
                background: '#FAF4E9', borderRadius: 6,
              }}>
                <strong>Per serving (estimated):</strong> {recipe.estimated_nutrition_per_serving.protein}g P · {recipe.estimated_nutrition_per_serving.calories} cal · {recipe.estimated_nutrition_per_serving.fiber}g fiber
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#9A8470', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 6 }}>
              Ingredients ({recipe.ingredients.length})
            </div>
            <div style={{
              background: '#fff', border: '1px solid #E8DDC9', borderRadius: 10, padding: 12,
            }}>
              {recipe.ingredients.slice(0, 8).map((ing, i) => (
                <div key={i} style={{ fontSize: 13, color: '#3D2F22', padding: '2px 0' }}>
                  {ing.qty} {ing.unit} {ing.name}
                </div>
              ))}
              {recipe.ingredients.length > 8 && (
                <div style={{ fontSize: 11, color: '#9A8470', marginTop: 6 }}>
                  +{recipe.ingredients.length - 8} more
                </div>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#9A8470', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 6 }}>
              Steps ({recipe.steps.length})
            </div>
            <div style={{
              background: '#fff', border: '1px solid #E8DDC9', borderRadius: 10, padding: 12,
            }}>
              {recipe.steps.slice(0, 3).map((step, i) => (
                <div key={i} style={{ fontSize: 12, color: '#3D2F22', padding: '4px 0', lineHeight: 1.5 }}>
                  <strong>{i + 1}.</strong> {step.text}
                </div>
              ))}
              {recipe.steps.length > 3 && (
                <div style={{ fontSize: 11, color: '#9A8470', marginTop: 4 }}>
                  +{recipe.steps.length - 3} more steps
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {stage === 'error' && (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <AlertCircle size={36} color="#C4856E" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 14, color: '#3D2F22', marginBottom: 16 }}>{error}</div>
          <button onClick={reset} style={primaryBtn}>Try Again</button>
        </div>
      )}
    </ModalShell>
  );
}


// ============================================================
// 3. WHAT CAN I MAKE TONIGHT (home widget)
// ============================================================
export function WhatCanIMakeTonight({ data, setView, setActiveRecipeId }) {
  const [expanded, setExpanded] = useState(false);

  // Compute suggestions based on pantry overlap + meal-type heuristic
  const suggestions = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    // Determine which meal type to suggest based on time
    let targetMealType = 'dinner';
    if (hour < 10) targetMealType = 'breakfast';
    else if (hour < 15) targetMealType = 'lunch';
    else targetMealType = 'dinner';

    const pantryNames = new Set(
      (data.pantry || []).map(p => (p.name || '').toLowerCase().trim())
    );

    // Score recipes by pantry overlap
    const scored = (data.recipes || [])
      .filter(r => {
        const mt = r.mealType || r.meal_type;
        return !mt || mt === targetMealType;
      })
      .map(r => {
        const ingredients = r.ingredients || [];
        let matched = 0;
        for (const ing of ingredients) {
          const iname = (ing.name || '').toLowerCase();
          for (const pname of pantryNames) {
            if (pname.length < 3 || iname.length < 3) continue;
            if (iname.includes(pname) || pname.includes(iname)) {
              matched++;
              break;
            }
          }
        }
        const matchPct = ingredients.length ? matched / ingredients.length : 0;
        return { recipe: r, matchPct, matched, total: ingredients.length };
      })
      .filter(s => s.matchPct >= 0.3) // At least 30% pantry overlap
      .sort((a, b) => b.matchPct - a.matchPct)
      .slice(0, 3);

    // If pantry overlap gives nothing, fall back to fastest recipes of that meal type
    let items = scored;
    let fallback = false;
    if (items.length === 0) {
      fallback = true;
      items = (data.recipes || [])
        .filter(r => { const mt = r.mealType || r.meal_type; return !mt || mt === targetMealType; })
        .sort((a, b) => (a.timeMin || 30) - (b.timeMin || 30))
        .slice(0, 3)
        .map(recipe => ({ recipe, matchPct: 0, matched: 0, total: (recipe.ingredients || []).length }));
    }
    return { items, mealType: targetMealType, fallback };
  }, [data.recipes, data.pantry]);

  if (suggestions.items.length === 0) return null;

  const mealLabels = { breakfast: 'breakfast', lunch: 'lunch', dinner: 'dinner' };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFF1ED 0%, #FAEDE0 100%)',
      border: '1px solid #E8B587', borderRadius: 12, padding: 14,
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Wand2 size={16} color="#A85C32" />
          <h3 style={{
            margin: 0, fontSize: 12, color: '#7A4220', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.6px',
          }}>
            What can I make for {mealLabels[suggestions.mealType]}?
          </h3>
        </div>
        <span style={{ fontSize: 10, color: '#A85C32', fontWeight: 500 }}>
            {suggestions.fallback ? 'Quickest recipes' : 'Based on pantry'}
          </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {suggestions.items.map(({ recipe, matchPct, matched, total }) => (
          <button key={recipe.id}
            onClick={() => { setActiveRecipeId(recipe.id); setView('recipe'); }}
            style={{
              background: '#fff', border: '1px solid rgba(232, 181, 135, 0.4)',
              borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: 24, flexShrink: 0 }}>{recipe.image || '🍽️'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#3D2F22', lineHeight: 1.3, wordBreak: 'break-word' }}>
                {recipe.title}
              </div>
              <div style={{ fontSize: 11, color: '#7A6450', marginTop: 3 }}>
                {suggestions.fallback ? `${recipe.timeMin || 30} min` : `${matched}/${total} ingredients on hand · ${recipe.timeMin || 30} min`}
              </div>
            </div>
            <ChevronRight size={16} color="#A85C32" />
          </button>
        ))}
      </div>
    </div>
  );
}


// ============================================================
// 4. PLATE PHOTO LOGGER
// ============================================================
export function PlatePhotoLogger({ open, onClose, onLog }) {
  const [stage, setStage] = useState('capture'); // capture | analyzing | review | error
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(null);
  const [result, setResult] = useState(null);
  const [mealSlot, setMealSlot] = useState('snack');
  const [editedMacros, setEditedMacros] = useState(null);
  const [saving, setSaving] = useState(false);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-pick meal slot based on time — hook MUST come before any conditional return
  useEffect(() => {
    if (!open) return;
    const hour = new Date().getHours();
    if (hour < 10) setMealSlot('breakfast');
    else if (hour < 15) setMealSlot('lunch');
    else if (hour < 21) setMealSlot('dinner');
    else setMealSlot('snack');
  }, [open]);

  if (!open) return null;

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStage('analyzing');
    setError('');
    try {
      const { base64 } = await resizeImage(file, 1024);
      setPhoto(base64);
      const res = await fetch('/api/ai-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'plate_photo',
          images: [{ base64, mimeType: 'image/jpeg' }],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Analysis failed (${res.status})`);
      }
      const data = await res.json();
      if (!data.totals) {
        throw new Error('Could not analyze the photo. Try a clearer shot.');
      }
      setResult(data);
      setEditedMacros(data.totals);
      setStage('review');
    } catch (err) {
      setError(err.message || 'Failed to analyze plate');
      setStage('error');
    }
  };

  const handleSave = async () => {
    if (!editedMacros || !result) return;
    setSaving(true);
    try {
      await onLog({
        name: result.meal_name || 'Logged meal',
        emoji: '🍽️',
        mealSlot,
        ...editedMacros,
      });
      setStage('capture'); setResult(null); setPhoto(null);
      onClose();
    } catch (err) {
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => { setStage('capture'); setError(''); setResult(null); setPhoto(null); };
  const updateMacro = (field, val) => setEditedMacros(m => ({ ...m, [field]: parseInt(val, 10) || 0 }));

  return (
    <ModalShell
      open={open} onClose={onClose}
      title={stage === 'capture' ? 'Snap Meal Photo' : stage === 'analyzing' ? 'Analyzing meal...' : stage === 'review' ? 'Confirm Macros' : 'Error'}
      icon={<Camera size={18} color="#A85C32" />}
      footer={stage === 'review' && editedMacros && (
        <>
          <button onClick={reset} style={{
            background: 'transparent', border: '1px solid #E8DDC9', color: '#5C4A3A',
            padding: '10px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
          }}>← Retake</button>
          <button onClick={handleSave} disabled={saving} style={{
            ...primaryBtn, width: 'auto', flex: 1,
            opacity: saving ? 0.5 : 1, cursor: saving ? 'not-allowed' : 'pointer',
          }}>
            {saving ? <><Loader2 size={16} className="spin" />Logging...</> : <><Check size={16} />Log to {mealSlot}</>}
          </button>
        </>
      )}
    >
      {stage === 'capture' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, fontSize: 14, color: '#5C4A3A', lineHeight: 1.6 }}>
            Snap a photo of your plate. AI estimates the macros so you can log it in one tap.
          </p>
          <div style={{
            background: '#FFF4E6', border: '1px solid #E8B587', borderRadius: 10,
            padding: 12, fontSize: 12, color: '#7A4220', display: 'flex', gap: 10,
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div><strong>Heads up:</strong> AI macro estimates are approximate — you'll be able to edit before logging.</div>
          </div>
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
          <button onClick={() => cameraInputRef.current?.click()} style={primaryBtn}><Camera size={18} />Take Photo</button>
          <button onClick={() => fileInputRef.current?.click()} style={secondaryBtn}><ImageIcon size={16} />Upload from Gallery</button>
        </div>
      )}

      {stage === 'analyzing' && (
        <div style={{ textAlign: 'center', padding: '40px 16px' }}>
          {photo && <img src={photo} alt="" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 12, marginBottom: 16, opacity: 0.7 }} />}
          <Loader2 size={36} className="spin" style={{ color: '#A85C32', marginBottom: 12 }} />
          <div style={{ fontSize: 15, color: '#3D2F22', fontWeight: 500 }}>Estimating macros...</div>
        </div>
      )}

      {stage === 'review' && result && editedMacros && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {photo && (
            <img src={photo} alt={result.meal_name} style={{
              width: '100%', maxHeight: 220, objectFit: 'cover',
              borderRadius: 10, border: '1px solid #E8DDC9',
            }} />
          )}

          <div style={{
            background: '#fff', border: '1px solid #E8DDC9', borderRadius: 10, padding: 12,
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#3D2F22', textTransform: 'capitalize' }}>
              {result.meal_name}
            </div>
            <div style={{ fontSize: 11, color: '#9A8470', marginTop: 4 }}>
              Confidence: <span style={{
                color: result.confidence === 'high' ? '#5C7A3A' : result.confidence === 'medium' ? '#D4A574' : '#C4856E',
                fontWeight: 600,
              }}>{result.confidence}</span>
              {result.notes && <span> · {result.notes}</span>}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#9A8470', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 6 }}>
              Meal slot
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['breakfast', 'lunch', 'dinner', 'snack'].map(s => (
                <button key={s} onClick={() => setMealSlot(s)}
                  style={{
                    flex: 1, padding: 7, border: 'none', borderRadius: 7,
                    background: mealSlot === s ? '#A85C32' : '#EDE0CC',
                    color: mealSlot === s ? '#fff' : '#5C4A3A',
                    fontSize: 11, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize',
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#9A8470', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 8 }}>
              Estimated macros (tap to edit)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { key: 'protein', label: 'Protein', unit: 'g', color: '#A85C32' },
                { key: 'calories', label: 'Calories', unit: '', color: '#5C4A3A' },
                { key: 'fat', label: 'Fat', unit: 'g', color: '#D4A574' },
                { key: 'carbs', label: 'Carbs', unit: 'g', color: '#7A6450' },
                { key: 'fiber', label: 'Fiber', unit: 'g', color: '#5C7A3A' },
                { key: 'sodium', label: 'Sodium', unit: 'mg', color: '#C4856E' },
              ].map(f => (
                <div key={f.key} style={{
                  background: '#fff', border: '1px solid #E8DDC9', borderRadius: 8, padding: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ fontSize: 11, color: '#7A6450', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: f.color, display: 'inline-block' }} />
                    {f.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <input type="number" value={editedMacros[f.key] || 0}
                      onChange={e => updateMacro(f.key, e.target.value)}
                      style={{
                        width: 50, textAlign: 'right', border: '1px solid #E8DDC9',
                        borderRadius: 4, padding: '3px 5px', fontSize: 13, fontWeight: 600, color: '#3D2F22',
                      }} />
                    <span style={{ fontSize: 11, color: '#7A6450' }}>{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {stage === 'error' && (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <AlertCircle size={36} color="#C4856E" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 14, color: '#3D2F22', marginBottom: 16 }}>{error}</div>
          <button onClick={reset} style={primaryBtn}>Try Again</button>
        </div>
      )}
    </ModalShell>
  );
}
