import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Loader2, AlertCircle, Edit3, Trash2, Plus, Minus, Sparkles, Image as ImageIcon } from 'lucide-react';

// Resize an image to max 1024px before uploading to save bandwidth and API tokens.
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
      canvas.toBlob(
        blob => {
          const reader = new FileReader();
          reader.onloadend = () => resolve({ base64: reader.result, blob });
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        0.85,
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

const CATEGORY_EMOJI = {
  produce: '🥬',
  protein: '🥩',
  dairy: '🥛',
  grain: '🌾',
  spice: '🌶️',
  sauce: '🥫',
  condiment: '🧂',
  frozen: '🧊',
  snack: '🍪',
  beverage: '🥤',
  other: '📦',
};

// Match items in a fuzzy way to detect duplicates against existing pantry.
// Returns the matching existing pantry item if found, else null.
function findExistingMatch(itemName, existingPantry) {
  const lower = (itemName || '').toLowerCase().trim();
  if (!lower) return null;
  // Try exact match first
  let match = existingPantry.find(p => (p.name || '').toLowerCase().trim() === lower);
  if (match) return match;
  // Try substring match (3+ char overlap)
  match = existingPantry.find(p => {
    const pName = (p.name || '').toLowerCase().trim();
    if (pName.length < 3 || lower.length < 3) return false;
    return pName.includes(lower) || lower.includes(pName);
  });
  return match;
}

export default function PantryScanModal({ open, onClose, onAddItems, onMergeItems, existingPantry = [] }) {
  const [stage, setStage] = useState('capture'); // capture | scanning | review | error
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState([]); // array of { base64, blob, id }
  const [items, setItems] = useState([]); // editable list of detected items
  const [detectedLocation, setDetectedLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const handlePhotoSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setError('');

    try {
      const newPhotos = [];
      for (const file of files) {
        if (photos.length + newPhotos.length >= 6) break;
        const { base64, blob } = await resizeImage(file, 1024);
        newPhotos.push({
          base64,
          blob,
          id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        });
      }
      setPhotos(prev => [...prev, ...newPhotos]);
    } catch (err) {
      setError('Failed to process photo: ' + err.message);
    } finally {
      // Reset input so the same file can be selected again
      if (e.target) e.target.value = '';
    }
  };

  const removePhoto = (id) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const scanPhotos = async () => {
    if (photos.length === 0) return;
    setStage('scanning');
    setError('');

    try {
      const res = await fetch('/api/scan-pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: photos.map(p => ({ base64: p.base64, mimeType: 'image/jpeg' })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Scan failed (${res.status})`);
      }

      const data = await res.json();
      const detected = (data.items || []).map((item, i) => {
        const existing = findExistingMatch(item.name, existingPantry);
        return {
          ...item,
          _id: 'scan_' + Date.now() + '_' + i,
          _selected: item.confidence !== 'low',
          _existing: existing, // Track full existing item if found
          _action: existing ? 'merge' : 'add', // 'merge' or 'add'
        };
      });

      if (detected.length === 0) {
        setError('No food items detected. Try a clearer photo with items visible.');
        setStage('error');
        return;
      }

      setItems(detected);
      setDetectedLocation(data.detected_location || 'pantry');
      setStage('review');
    } catch (err) {
      console.error('Scan error:', err);
      setError(err.message || 'Failed to scan photo');
      setStage('error');
    }
  };

  const updateItem = (id, patch) => {
    setItems(prev => prev.map(it => it._id === id ? { ...it, ...patch } : it));
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(it => it._id !== id));
  };

  const handleSave = async () => {
    const selected = items.filter(it => it._selected);
    if (selected.length === 0) {
      setError('Select at least one item to add');
      return;
    }
    setSaving(true);
    try {
      // Separate new additions from merges
      const toAdd = selected.filter(it => it._action === 'add').map(it => ({
        name: it.name,
        qty: Number(it.qty) || 1,
        unit: it.unit || 'unit',
        category: it.category,
        is_perishable: !!it.is_perishable,
        location: it.location,
      }));

      const toMerge = selected.filter(it => it._action === 'merge' && it._existing).map(it => ({
        existing: it._existing,
        addQty: Number(it.qty) || 1,
      }));

      if (toAdd.length > 0) {
        await onAddItems(toAdd);
      }
      if (toMerge.length > 0 && onMergeItems) {
        await onMergeItems(toMerge);
      }

      // Reset & close
      setStage('capture');
      setItems([]);
      setPhotos([]);
      onClose();
    } catch (err) {
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setStage('capture');
    setError('');
    setItems([]);
    setPhotos([]);
  };

  const selectedCount = items.filter(i => i._selected).length;
  const mergeCount = items.filter(i => i._selected && i._action === 'merge').length;
  const addCount = items.filter(i => i._selected && i._action === 'add').length;

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
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #E8DDC9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color="#A85C32" />
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#3D2F22' }}>
              {stage === 'capture' && `Scan Pantry${photos.length > 0 ? ` (${photos.length} photo${photos.length > 1 ? 's' : ''})` : ''}`}
              {stage === 'scanning' && 'Analyzing...'}
              {stage === 'review' && `Review (${selectedCount} selected)`}
              {stage === 'error' && 'Something went wrong'}
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: 4, borderRadius: 6, color: '#7A6450',
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {stage === 'capture' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, fontSize: 14, color: '#5C4A3A', lineHeight: 1.6 }}>
                Take photos of your pantry, fridge, or spice rack. Add up to <strong>6 photos</strong> to cover more shelves — the AI scans them all together.
              </p>
              <div style={{
                background: '#FFF4E6', border: '1px solid #E8B587', borderRadius: 10,
                padding: 12, fontSize: 12, color: '#7A4220', display: 'flex', gap: 10,
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Tip:</strong> Use multiple angles for big areas (front + back of pantry, top + bottom shelves) so nothing gets missed.
                </div>
              </div>

              {/* Photo thumbnails */}
              {photos.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: '#9A8470', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 8 }}>
                    Photos ({photos.length}/6)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {photos.map(p => (
                      <div key={p.id} style={{
                        position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
                        border: '1px solid #E8DDC9',
                      }}>
                        <img src={p.base64} alt="Pantry" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => removePhoto(p.id)} style={{
                          position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11,
                          background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <input
                ref={cameraInputRef} type="file" accept="image/*" capture="environment"
                onChange={handlePhotoSelected} style={{ display: 'none' }}
              />
              <input
                ref={fileInputRef} type="file" accept="image/*" multiple
                onChange={handlePhotoSelected} style={{ display: 'none' }}
              />

              {/* Add more photos buttons */}
              {photos.length < 6 && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => cameraInputRef.current?.click()} style={{ ...secondaryBtn, flex: 1 }}>
                    <Camera size={16} /> {photos.length === 0 ? 'Take Photo' : 'Take Another'}
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} style={{ ...secondaryBtn, flex: 1 }}>
                    <ImageIcon size={16} /> {photos.length === 0 ? 'Upload' : 'Add From Gallery'}
                  </button>
                </div>
              )}

              {/* Scan button — only when we have photos */}
              {photos.length > 0 && (
                <button onClick={scanPhotos} style={primaryBtn}>
                  <Sparkles size={18} /> Scan {photos.length} photo{photos.length > 1 ? 's' : ''}
                </button>
              )}
            </div>
          )}

          {stage === 'scanning' && (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              {photos.length > 0 && (
                <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                  {photos.map(p => (
                    <img key={p.id} src={p.base64} alt="" style={{
                      width: 60, height: 60, objectFit: 'cover', borderRadius: 6, opacity: 0.6,
                    }} />
                  ))}
                </div>
              )}
              <Loader2 size={36} className="spin" style={{ color: '#A85C32', marginBottom: 12 }} />
              <div style={{ fontSize: 15, color: '#3D2F22', fontWeight: 500 }}>
                AI is identifying items...
              </div>
              <div style={{ fontSize: 12, color: '#7A6450', marginTop: 4 }}>
                {photos.length > 1 ? `Scanning ${photos.length} photos · ` : ''}
                Usually takes {photos.length > 2 ? '8-15' : '3-8'} seconds
              </div>
            </div>
          )}

          {stage === 'review' && (
            <div>
              <div style={{
                background: '#fff', border: '1px solid #E8DDC9', borderRadius: 10,
                padding: 12, marginBottom: 14, fontSize: 13, color: '#5C4A3A',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
              }}>
                <div>
                  <span style={{ color: '#9A8470' }}>Detected: </span>
                  <strong style={{ textTransform: 'capitalize' }}>{detectedLocation}</strong>
                  <span style={{ color: '#9A8470' }}> · {items.length} item{items.length !== 1 ? 's' : ''}</span>
                </div>
                {mergeCount > 0 && (
                  <div style={{ fontSize: 12, color: '#A85C32', fontWeight: 500 }}>
                    {mergeCount} will merge into existing
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {items.map(item => (
                  <ItemRow
                    key={item._id}
                    item={item}
                    onUpdate={(patch) => updateItem(item._id, patch)}
                    onRemove={() => removeItem(item._id)}
                  />
                ))}
              </div>

              {items.length === 0 && (
                <div style={{ textAlign: 'center', padding: 32, color: '#9A8470', fontSize: 13 }}>
                  No items left. Scan another photo.
                </div>
              )}
            </div>
          )}

          {stage === 'error' && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <AlertCircle size={36} color="#C4856E" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 14, color: '#3D2F22', marginBottom: 16 }}>{error}</div>
              <button onClick={reset} style={primaryBtn}>Try Again</button>
            </div>
          )}
        </div>

        {/* Footer */}
        {stage === 'review' && (
          <div style={{
            padding: 16, borderTop: '1px solid #E8DDC9',
            display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center',
          }}>
            <button onClick={reset} style={{
              background: 'transparent', border: '1px solid #E8DDC9', color: '#5C4A3A',
              padding: '10px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
            }}>
              ← Rescan
            </button>
            <button onClick={handleSave} disabled={saving || selectedCount === 0} style={{
              ...primaryBtn,
              width: 'auto',
              opacity: (saving || selectedCount === 0) ? 0.5 : 1,
              cursor: (saving || selectedCount === 0) ? 'not-allowed' : 'pointer',
            }}>
              {saving ? <><Loader2 size={16} className="spin" /> Saving...</> :
               <><Check size={16} /> {addCount > 0 && mergeCount > 0
                  ? `Add ${addCount} · Merge ${mergeCount}`
                  : addCount > 0
                    ? `Add ${addCount} to Pantry`
                    : `Merge ${mergeCount} existing`}</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemRow({ item, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false);
  const isMerge = item._action === 'merge';

  return (
    <div style={{
      background: item._selected ? '#fff' : '#F5EFE3',
      border: '1px solid ' + (isMerge ? '#E8B587' : '#E8DDC9'),
      borderRadius: 10, padding: 10,
      opacity: item._selected ? 1 : 0.5,
    }}>
      {/* Top row: checkbox + emoji + name (wraps if long) */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <input
          type="checkbox"
          checked={item._selected}
          onChange={e => onUpdate({ _selected: e.target.checked })}
          style={{ width: 18, height: 18, cursor: 'pointer', flexShrink: 0, marginTop: 4 }}
        />
        <div style={{ fontSize: 22, flexShrink: 0, lineHeight: 1.2 }}>
          {CATEGORY_EMOJI[item.category] || '📦'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <input
              type="text"
              value={item.name}
              onChange={e => onUpdate({ name: e.target.value })}
              onBlur={() => setEditing(false)}
              autoFocus
              style={{
                fontSize: 14, fontWeight: 500, color: '#3D2F22',
                border: '1px solid #A85C32', borderRadius: 4, padding: '2px 6px',
                width: '100%',
              }}
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              style={{
                background: 'transparent', border: 'none', padding: 0, textAlign: 'left',
                cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 6,
                width: '100%',
              }}
            >
              <span style={{
                fontSize: 14, fontWeight: 500, color: '#3D2F22', textTransform: 'capitalize',
                wordBreak: 'break-word', flex: 1, lineHeight: 1.35,
              }}>
                {item.name}
              </span>
              <Edit3 size={11} color="#9A8470" style={{ flexShrink: 0, marginTop: 4 }} />
            </button>
          )}
          <div style={{ fontSize: 11, color: '#7A6450', marginTop: 3, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ textTransform: 'capitalize' }}>{item.category}</span>
            <span>·</span>
            <span style={{ textTransform: 'capitalize' }}>{item.location}</span>
            {item.confidence === 'low' && (
              <>
                <span>·</span>
                <span style={{ color: '#C4856E', fontWeight: 500 }}>low confidence</span>
              </>
            )}
            {isMerge && item._existing && (
              <>
                <span>·</span>
                <span style={{ color: '#A85C32', fontWeight: 500 }}>
                  ⊕ Merge into existing ({item._existing.qty} {item._existing.unit})
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action toggle (if it's a potential duplicate, let user choose merge vs add) */}
      {item._existing && (
        <div style={{
          display: 'flex', gap: 6, marginBottom: 8, paddingLeft: 38,
        }}>
          <button
            onClick={() => onUpdate({ _action: 'merge' })}
            style={{
              ...actionToggle,
              background: item._action === 'merge' ? '#A85C32' : '#fff',
              color: item._action === 'merge' ? '#fff' : '#5C4A3A',
            }}
          >
            ⊕ Merge (add to existing qty)
          </button>
          <button
            onClick={() => onUpdate({ _action: 'add' })}
            style={{
              ...actionToggle,
              background: item._action === 'add' ? '#A85C32' : '#fff',
              color: item._action === 'add' ? '#fff' : '#5C4A3A',
            }}
          >
            + New
          </button>
        </div>
      )}

      {/* Bottom row: qty controls + unit + remove */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        paddingLeft: 38,
      }}>
        <button onClick={() => onUpdate({ qty: Math.max(0.25, (Number(item.qty) || 1) - 1) })} style={qtyBtn}>
          <Minus size={12} />
        </button>
        <span style={{ minWidth: 28, textAlign: 'center', fontSize: 13, fontWeight: 500, color: '#3D2F22' }}>
          {item.qty}
        </span>
        <button onClick={() => onUpdate({ qty: (Number(item.qty) || 1) + 1 })} style={qtyBtn}>
          <Plus size={12} />
        </button>
        <select
          value={item.unit}
          onChange={e => onUpdate({ unit: e.target.value })}
          style={{
            fontSize: 11, padding: '4px 6px', border: '1px solid #E8DDC9',
            borderRadius: 4, background: '#fff', color: '#5C4A3A',
            marginLeft: 4,
          }}
        >
          {['unit', 'g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'bunch', 'bottle', 'jar', 'can', 'bag', 'box', 'pack'].map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <div style={{ flex: 1 }} />
        <button onClick={onRemove} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#C4856E', padding: 4,
        }}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

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

const actionToggle = {
  padding: '4px 10px', borderRadius: 12, border: '1px solid #E8DDC9',
  fontSize: 10, fontWeight: 600, cursor: 'pointer',
  textTransform: 'uppercase', letterSpacing: '0.3px',
};
