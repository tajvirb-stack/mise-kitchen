import React from 'react';
import { useNutrition } from '../hooks/useNutrition';

export default function NutritionTotals({ date }) {
  const { targets, totals, loading } = useNutrition(date);

  if (loading || !targets) return null;

  const metrics = [
    { label: 'Protein', current: totals.protein, target: targets.protein_target, unit: 'g', color: '#A85C32' },
    { label: 'Calories', current: totals.calories, target: targets.calories_target, unit: '', color: '#5C4A3A' },
    { label: 'Fiber', current: totals.fiber, target: targets.fiber_target, unit: 'g', color: '#6B7F3A' },
  ];

  return (
    <div style={{
      background: '#FBF6EE',
      border: '1px solid #E8DDC9',
      borderRadius: 14,
      padding: 16,
      margin: '12px 0',
    }}>
      <h3 style={{
        margin: '0 0 14px 0',
        fontSize: 13,
        color: '#9A8470',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
      }}>
        Today's Nutrition
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {metrics.map(m => {
          const pct = Math.min(100, (m.current / m.target) * 100);
          const remaining = Math.max(0, m.target - m.current);
          const overshoot = m.current > m.target;
          return (
            <div key={m.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: '#3D2F22', fontWeight: 500 }}>{m.label}</span>
                <span style={{ color: '#7A6450' }}>
                  <span style={{ fontWeight: 600, color: '#3D2F22' }}>
                    {Math.round(m.current)}{m.unit}
                  </span>
                  {' '}/ {m.target}{m.unit}
                  {!overshoot && remaining > 0 && (
                    <span style={{ color: '#A85C32', marginLeft: 6, fontSize: 11 }}>
                      -{Math.round(remaining)}
                    </span>
                  )}
                </span>
              </div>
              <div style={{ background: '#F0E4D0', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                <div style={{
                  background: m.color,
                  height: '100%',
                  width: `${pct}%`,
                  transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }} />
              </div>
            </div>
          );
        })}
      </div>
      {totals.sodium > 0 && (
        <div style={{
          fontSize: 11,
          color: totals.sodium > targets.sodium_max ? '#C4856E' : '#7A6450',
          marginTop: 10,
          textAlign: 'right',
        }}>
          Sodium: {Math.round(totals.sodium)}mg / {targets.sodium_max}mg max
        </div>
      )}
    </div>
  );
}
