import React, { useState } from 'react';
import { useNutrition } from '../hooks/useNutrition';

const SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function FoodLog({ date }) {
  const { logEntries, quickAdds, logQuickAdd, deleteEntry } = useNutrition(date);
  const [showQuickAdds, setShowQuickAdds] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('snack');

  const handleQuickAdd = async (qa) => {
    await logQuickAdd(qa, 1, selectedSlot);
    setShowQuickAdds(false);
  };

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #EFE5D2',
      borderRadius: 14,
      padding: 16,
      margin: '12px 0',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <h3 style={{
          margin: 0,
          fontSize: 13,
          color: '#9A8470',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
        }}>
          Today's Log
        </h3>
        <button
          onClick={() => setShowQuickAdds(!showQuickAdds)}
          style={{
            background: '#A85C32',
            color: '#fff',
            border: 'none',
            borderRadius: 22,
            padding: '7px 14px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Quick add
        </button>
      </div>

      {showQuickAdds && (
        <div style={{
          background: '#FAF4E9',
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
        }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
            {SLOTS.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSlot(s)}
                style={{
                  flex: 1,
                  padding: 7,
                  border: 'none',
                  borderRadius: 7,
                  background: selectedSlot === s ? '#A85C32' : '#EDE0CC',
                  color: selectedSlot === s ? '#fff' : '#5C4A3A',
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            maxHeight: 280,
            overflowY: 'auto',
          }}>
            {quickAdds.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                padding: 16,
                textAlign: 'center',
                color: '#9A8470',
                fontSize: 12,
                fontStyle: 'italic',
              }}>
                No quick-add foods yet. Add some in Settings.
              </div>
            ) : (
              quickAdds.map(qa => (
                <button
                  key={qa.id}
                  onClick={() => handleQuickAdd(qa)}
                  style={{
                    background: '#fff',
                    border: '1px solid #E8DDC9',
                    borderRadius: 8,
                    padding: 9,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: 12,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#A85C32'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8DDC9'; }}
                >
                  <div style={{ fontWeight: 500, color: '#3D2F22', fontSize: 12 }}>
                    {qa.emoji} {qa.name}
                  </div>
                  <div style={{ color: '#7A6450', fontSize: 10, marginTop: 3 }}>
                    {qa.protein}g P · {qa.calories} cal
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {logEntries.length === 0 ? (
        <div style={{
          color: '#9A8470',
          fontSize: 12,
          textAlign: 'center',
          padding: 12,
          fontStyle: 'italic',
        }}>
          No meals logged yet. Tap + Quick add to start.
        </div>
      ) : (
        SLOTS.map(slot => {
          const items = logEntries.filter(e => e.meal_slot === slot);
          if (items.length === 0) return null;
          return (
            <div key={slot} style={{ marginBottom: 12 }}>
              <div style={{
                fontSize: 10,
                color: '#9A8470',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.5px',
                marginBottom: 6,
              }}>
                {slot}
              </div>
              {items.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: '#FAF4E9',
                  borderRadius: 10,
                  marginBottom: 4,
                }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#3D2F22', fontWeight: 500 }}>
                      {item.emoji || ''} {item.custom_name || item.recipes?.title || 'Unknown'}
                    </div>
                    <div style={{ fontSize: 11, color: '#7A6450', marginTop: 2 }}>
                      {item.protein}g P · {item.calories} cal · {item.fiber}g fiber
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEntry(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#C4856E',
                      cursor: 'pointer',
                      fontSize: 18,
                      lineHeight: 1,
                      padding: '4px 8px',
                      borderRadius: 6,
                    }}
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
