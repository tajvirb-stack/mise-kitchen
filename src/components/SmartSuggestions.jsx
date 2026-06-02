import React from 'react';
import { useNutrition } from '../hooks/useNutrition';

export default function SmartSuggestions({ date }) {
  const { targets, totals, logEntries } = useNutrition(date);
  if (!targets) return null;

  const proteinGap = targets.protein_target - totals.protein;
  const calorieGap = targets.calories_target - totals.calories;
  const fiberGap = targets.fiber_target - totals.fiber;
  const hour = new Date().getHours();
  const hasLogged = logEntries.length > 0;

  const suggestions = [];

  // Empty day — no suggestions yet
  if (!hasLogged) return null;

  // Protein gap suggestions
  if (proteinGap > 40 && hour > 12) {
    suggestions.push({
      icon: '💪',
      title: `${Math.round(proteinGap)}g protein short`,
      message: 'A protein shake (~25g) and cottage cheese (~25g) would close the gap.',
      priority: 'high',
    });
  } else if (proteinGap > 20 && hour > 16) {
    suggestions.push({
      icon: '🥛',
      title: `${Math.round(proteinGap)}g protein to go`,
      message: 'A protein shake or high-protein snack before bed will get you there.',
      priority: 'medium',
    });
  }

  // Fiber gap
  if (fiberGap > 15 && hour > 17 && totals.calories > 1000) {
    suggestions.push({
      icon: '🌾',
      title: `${Math.round(fiberGap)}g fiber short`,
      message: 'A high-fiber snack bar or a psyllium supplement will help.',
      priority: 'medium',
    });
  }

  // Calorie management
  if (calorieGap < -200) {
    suggestions.push({
      icon: '⚠️',
      title: `${Math.abs(Math.round(calorieGap))} cal over target`,
      message: "Scale tomorrow's dinner portion or lighten a snack to balance.",
      priority: 'medium',
    });
  } else if (calorieGap > 500 && hour > 20) {
    suggestions.push({
      icon: '🍽️',
      title: `${Math.round(calorieGap)} cal short`,
      message: 'Add a light snack like Greek yogurt with fruit or nut butter on toast.',
      priority: 'low',
    });
  }

  // On-track message
  if (suggestions.length === 0 && totals.calories > 1500 && proteinGap < 20) {
    suggestions.push({
      icon: '✅',
      title: 'On track today',
      message: `${Math.round(totals.protein)}g protein, ${Math.round(totals.fiber)}g fiber. Nice work.`,
      priority: 'success',
    });
  }

  // When nothing else to suggest, surface any uncooked favourites
  if (suggestions.length === 0) {
    try {
      const favIds = JSON.parse(localStorage.getItem('mise_favourites') || '[]');
      if (favIds.length > 0) {
        suggestions.push({
          icon: '⭐',
          title: `${favIds.length} favourite recipe${favIds.length === 1 ? '' : 's'} saved`,
          message: 'Check your favourites for a meal you loved before.',
          priority: 'low',
        });
      }
    } catch {}
  }

  if (suggestions.length === 0) return null;

  const colors = {
    high: { bg: '#FFF1E3', border: '#E8B587', text: '#7A4220' },
    medium: { bg: '#FFFAEB', border: '#D9C170', text: '#806012' },
    low: { bg: '#F0F4E6', border: '#9FB66B', text: '#4A5826' },
    success: { bg: '#EBF4DC', border: '#A8C46B', text: '#3A5210' },
  };

  return (
    <div style={{ margin: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {suggestions.map((s, i) => {
        const c = colors[s.priority];
        return (
          <div key={i} style={{
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: 12,
            padding: 12,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}>
            <div style={{ fontSize: 20, lineHeight: 1 }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{s.title}</div>
              <div style={{ fontSize: 12, color: c.text, opacity: 0.85, marginTop: 2 }}>{s.message}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
