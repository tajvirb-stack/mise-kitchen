import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Home, BookOpen, Calendar, ShoppingCart, Package, Sparkles, Plus, Settings,
  ChefHat, Users, Clock, ArrowLeft, ArrowRight, Check, X, Trash2, Edit3,
  Play, Pause, RotateCcw, Search, ChevronRight, Minus, Copy, LogOut,
  AlertCircle, Loader2, Info, Salad, Flame, UtensilsCrossed,
  Star, TrendingUp, Undo2, AlertTriangle, Receipt, Link2, Camera, Image as ImageIcon
} from 'lucide-react';
import { formatQty, scaleStepText } from '../lib/utils';
import { findComponentRecipe } from '../lib/components-decoder';
import { findSubstitutes, suggestSimilarRecipes, suggestPantryFriendly, generateSmartWeekPlan, pairScore, pantryScore, buildSwappedIngredient, rewriteStepForSwap } from '../lib/suggestions';
import { getPrimaryProtein } from '../lib/nutrition';
import { groupByAisle } from '../lib/aisles';
import { autoDeductPantry, expiryStatus, suggestUseSoon, buildBatchPrepPlan, calcCookingStats, daysUntilExpiry } from '../lib/kitchen-ops';
import { EQUIPMENT_MODES, INGREDIENT_MODES, fullyResolveStep, resolveIngredient, getSupportedEquipment, hasIngredientAlternates } from '../lib/recipe-variants';
import NutritionTotals from '../components/NutritionTotals';
import SmartSuggestions from '../components/SmartSuggestions';
import FoodLog from '../components/FoodLog';
import { NutritionProvider, useNutritionContext } from '../components/NutritionContext';
import { generateMacroAwareWeekPlan, projectDailyMacros } from '../lib/macro-planner';
import PantryScanModal from '../components/PantryScanModal';
import {
  ReceiptScanModal,
  RecipeImportModal,
  WhatCanIMakeTonight,
  PlatePhotoLogger,
} from '../components/AIFeatures';
import { splitStepIntoBullets, highlightInStep, detectParallelTask } from '../lib/step-format';
import { buildCookPlan, recipeHasParallelism } from '../lib/cook-scheduler';
import { supabase } from '../lib/supabase';
import { SEED_RECIPES } from '../lib/seed-recipes';

const NAV = [
  { id: 'home', label: 'Kitchen', icon: Home },
  { id: 'recipes', label: 'Recipes', icon: BookOpen },
  { id: 'week', label: 'Week', icon: Calendar },
  { id: 'grocery', label: 'Grocery', icon: ShoppingCart },
  { id: 'pantry', label: 'Pantry', icon: Package },
  { id: 'prep', label: 'Prep', icon: Sparkles },
];

export default function Kitchen({ user, household, members, data, weeklyIngredients, groceryList, prepTasks, modes, onSignOut, updateHouseholdName }) {
  // Persist navigation state across iOS PWA backgrounding / phone-lock.
  // When iOS sleeps the browser, the JS context can be torn down and rebuilt,
  // resetting useState defaults. sessionStorage survives the backgrounding.
  const [view, setViewRaw] = useState(() => {
    try { return sessionStorage.getItem('mise_view') || 'home'; } catch { return 'home'; }
  });
  const [activeRecipeId, setActiveRecipeIdRaw] = useState(() => {
    try { return sessionStorage.getItem('mise_active_recipe') || null; } catch { return null; }
  });
  const [cookingStepIdx, setCookingStepIdxRaw] = useState(() => {
    try { return parseInt(sessionStorage.getItem('mise_cooking_step')) || 0; } catch { return 0; }
  });
  const [cookingScale, setCookingScale] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Air fryer sub-type — 'basket' or 'convection' (Cuisinart style)
  // Affects the temperature note shown in air fryer alt steps
  const [airFryerType, setAirFryerTypeRaw] = useState(() => {
    try { return localStorage.getItem('mise_airfryer_type') || 'convection'; } catch { return 'convection'; }
  });
  const setAirFryerType = (t) => {
    setAirFryerTypeRaw(t);
    try { localStorage.setItem('mise_airfryer_type', t); } catch {}
  };

  // Persisting wrappers
  const setView = (v) => {
    setViewRaw(v);
    try {
      sessionStorage.setItem('mise_view', v);
      // When explicitly navigating home, clear the in-progress recipe state
      // so a subsequent phone-lock doesn't revive a stale cooking session
      if (v === 'home') {
        sessionStorage.removeItem('mise_active_recipe');
        sessionStorage.removeItem('mise_cooking_step');
      }
    } catch {}
  };
  const setActiveRecipeId = (id) => {
    setActiveRecipeIdRaw(id);
    try {
      if (id) sessionStorage.setItem('mise_active_recipe', id);
      else sessionStorage.removeItem('mise_active_recipe');
    } catch {}
  };
  const setCookingStepIdx = (idx) => {
    setCookingStepIdxRaw(idx);
    try { sessionStorage.setItem('mise_cooking_step', String(idx)); } catch {}
  };

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // If the persisted recipe no longer exists, gracefully fall back to home
  useEffect(() => {
    if ((view === 'recipe' || view === 'cook') && activeRecipeId && !data.loading) {
      const exists = data.recipes.find(r => r.id === activeRecipeId);
      if (!exists) {
        setView('home');
        setActiveRecipeId(null);
      }
    }
  }, [view, activeRecipeId, data.recipes, data.loading]);

  // Thread airFryerType into modes so RecipeView + CookingMode can access it
  const modesWithAFType = modes ? { ...modes, airFryerType, setAirFryerType } : modes;

  const activeRecipe = data.recipes.find(r => r.id === activeRecipeId);
  const weekCount = data.weekPlan.length;
  const groceryCount = groceryList.filter(g => g.need > 0).length;

  return (
    <NutritionProvider>
    <div style={{ minHeight: '100vh', background: '#FAF6EF' }}>
      {!isMobile && <Sidebar view={view} setView={(v) => { setView(v); }} weekCount={weekCount} groceryCount={groceryCount} onSettings={() => setShowSettings(true)} household={household} />}

      <main style={{ marginLeft: isMobile ? 0 : 240, padding: isMobile ? '16px 14px 96px' : '32px 48px', maxWidth: 1280, overflowX: 'hidden', boxSizing: 'border-box' }}>
        {view === 'home' && <HomeView data={data} groceryList={groceryList} setView={setView} setActiveRecipeId={setActiveRecipeId} />}
        {view === 'recipes' && <RecipesView data={data} setView={setView} setActiveRecipeId={setActiveRecipeId} />}
        {view === 'recipe' && activeRecipe && <RecipeView recipe={activeRecipe} data={data} setView={setView} setCookingStepIdx={setCookingStepIdx} setCookingScale={setCookingScale} modes={modesWithAFType} />}
        {view === 'cook' && activeRecipe && <CookingMode recipe={activeRecipe} stepIdx={cookingStepIdx} setStepIdx={setCookingStepIdx} scale={cookingScale} setView={setView} data={data} modes={modesWithAFType} />}
        {view === 'week' && <WeekView data={data} setView={setView} setActiveRecipeId={setActiveRecipeId} />}
        {view === 'grocery' && <GroceryView groceryList={groceryList} data={data} household={household} />}
        {view === 'pantry' && <PantryView data={data} />}
        {view === 'prep' && <PrepView prepTasks={prepTasks} weekPlan={data.weekPlan} recipes={data.recipes} />}
        {view === 'import' && <ImportView data={data} setView={setView} setActiveRecipeId={setActiveRecipeId} />}
      </main>

      {isMobile && <BottomNav view={view} setView={setView} weekCount={weekCount} groceryCount={groceryCount} onSettings={() => setShowSettings(true)} />}

      {/* Undo toast — appears bottom-center for 6 seconds after a destructive action */}
      <UndoToast data={data} isMobile={isMobile} />

      {showSettings && (
        <SettingsModal
          user={user}
          household={household}
          members={members}
          data={data}
          onClose={() => setShowSettings(false)}
          onSignOut={onSignOut}
          updateHouseholdName={updateHouseholdName}
        />
      )}
    </div>
    </NutritionProvider>
  );
}

// -------- Sidebar (desktop) --------
function Sidebar({ view, setView, weekCount, groceryCount, onSettings, household }) {
  return (
    <aside style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 240, background: '#2A1F1A', padding: '32px 0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 28px 24px', borderBottom: '1px solid rgba(212,197,176,0.15)', marginBottom: 24 }}>
        <div className="serif" style={{ fontSize: 24, fontWeight: 600, color: '#FAF6EF', letterSpacing: '-0.02em' }}>Mise.</div>
        <div className="sans" style={{ fontSize: 11, color: '#8B6F47', marginTop: 4, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{household.name}</div>
      </div>
      {NAV.map(item => {
        const Icon = item.icon;
        const active = view === item.id;
        const badge = item.id === 'week' ? weekCount : item.id === 'grocery' ? groceryCount : 0;
        return (
          <button key={item.id} onClick={() => setView(item.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 28px', border: 'none',
            background: active ? 'rgba(212,197,176,0.08)' : 'transparent',
            color: active ? '#FAF6EF' : '#A89379',
            textAlign: 'left',
            borderLeft: active ? '2px solid #D4A574' : '2px solid transparent',
            fontSize: 14
          }}>
            <Icon size={18} strokeWidth={1.5} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {badge > 0 && <span style={{ background: '#D4A574', color: '#2A1F1A', fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{badge}</span>}
          </button>
        );
      })}
      <button onClick={() => setView('import')} style={{
        margin: '12px 18px 0', padding: '10px 14px', background: '#A85C32', color: '#FAF6EF',
        border: 'none', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13
      }}>
        <Plus size={14} /> Add recipe
      </button>
      <div style={{ marginTop: 'auto' }}>
        <button onClick={onSettings} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 28px',
          border: 'none', background: 'transparent', color: '#A89379', fontSize: 13
        }}>
          <Settings size={16} strokeWidth={1.5} />Settings
        </button>
      </div>
    </aside>
  );
}

// -------- Bottom Nav (mobile) --------
function BottomNav({ view, setView, weekCount, groceryCount, onSettings }) {
  // Show 4 main nav items + Pantry + Settings on mobile
  const main = NAV.slice(0, 4); // home, recipes, week, grocery
  return (
    <nav className="safe-bottom" style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, background: '#2A1F1A',
      display: 'flex', justifyContent: 'space-around', padding: '8px 0',
      borderTop: '1px solid rgba(212,197,176,0.15)', zIndex: 50
    }}>
      {main.map(item => {
        const Icon = item.icon;
        const active = view === item.id;
        const badge = item.id === 'week' ? weekCount : item.id === 'grocery' ? groceryCount : 0;
        return (
          <button key={item.id} onClick={() => setView(item.id)} style={{
            background: 'transparent', border: 'none', padding: '6px 8px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            color: active ? '#D4A574' : '#A89379', position: 'relative', minWidth: 60
          }}>
            <Icon size={22} strokeWidth={1.5} />
            <span style={{ fontSize: 10, fontWeight: 500 }}>{item.label}</span>
            {badge > 0 && (
              <span style={{ position: 'absolute', top: 0, right: 8, background: '#D4A574', color: '#2A1F1A', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8, minWidth: 14 }}>{badge}</span>
            )}
          </button>
        );
      })}
      <button onClick={() => setView('pantry')} style={{
        background: 'transparent', border: 'none', padding: '6px 8px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        color: view === 'pantry' ? '#D4A574' : '#A89379', position: 'relative', minWidth: 60
      }}>
        <Package size={22} strokeWidth={1.5} />
        <span style={{ fontSize: 10, fontWeight: 500 }}>Pantry</span>
      </button>
      <button onClick={onSettings} style={{
        background: 'transparent', border: 'none', padding: '6px 8px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        color: '#A89379', minWidth: 60
      }}>
        <Settings size={22} strokeWidth={1.5} />
        <span style={{ fontSize: 10, fontWeight: 500 }}>Settings</span>
      </button>
    </nav>
  );
}

// -------- Settings modal (signout, household info, invite code) --------
// -------- MacroTargetsEditor — edit daily nutrition targets --------
function MacroTargetsEditor() {
  const [targets, setTargets] = useState(null);
  const [draftTargets, setDraftTargets] = useState({
    calories_target: 2300,
    protein_target: 190,
    fiber_target: 50,
    sodium_max: 2300,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from('user_nutrition_targets')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setTargets(data);
        setDraftTargets({
          calories_target: data.calories_target,
          protein_target: data.protein_target,
          fiber_target: data.fiber_target,
          sodium_max: data.sodium_max || 2300,
        });
      }
      setLoading(false);
    })();
  }, []);

  const updateField = (field, value) => {
    setDraftTargets(t => ({ ...t, [field]: Math.max(0, parseInt(value, 10) || 0) }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');
      const payload = {
        user_id: user.id,
        ...draftTargets,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('user_nutrition_targets')
        .upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;
      setTargets(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = targets && (
    targets.calories_target !== draftTargets.calories_target ||
    targets.protein_target !== draftTargets.protein_target ||
    targets.fiber_target !== draftTargets.fiber_target ||
    targets.sodium_max !== draftTargets.sodium_max
  );

  if (loading) return (
    <div style={{ background: '#FAF6EF', padding: 16, borderRadius: 8, color: '#9A8470', fontSize: 13 }}>
      Loading targets…
    </div>
  );

  const fields = [
    { key: 'protein_target', label: 'Protein', unit: 'g', accent: '#A85C32', hint: 'Recommended: 0.7–1g per lb bodyweight' },
    { key: 'calories_target', label: 'Calories', unit: '', accent: '#5C4A3A', hint: 'Moderate deficit for body recomposition' },
    { key: 'fiber_target', label: 'Fiber', unit: 'g', accent: '#5C7A3A', hint: '50g+ supports gut health and satiety' },
    { key: 'sodium_max', label: 'Sodium max', unit: 'mg', accent: '#C4856E', hint: 'Below 2,300mg supports blood pressure' },
  ];

  return (
    <div style={{ background: '#FAF6EF', padding: 16, borderRadius: 8 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
        {fields.map(f => (
          <div key={f.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <label style={{
                fontSize: 13, fontWeight: 500, color: '#3D2F22',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{
                  display: 'inline-block', width: 8, height: 8, borderRadius: 4,
                  background: f.accent,
                }} />
                {f.label}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  value={draftTargets[f.key]}
                  onChange={e => updateField(f.key, e.target.value)}
                  style={{
                    width: 80, padding: '6px 8px', textAlign: 'right',
                    border: '1px solid #E8DDC9', borderRadius: 6,
                    fontSize: 14, fontWeight: 600, color: '#3D2F22',
                    background: '#fff', outline: 'none',
                  }}
                  min="0"
                />
                <span style={{ fontSize: 12, color: '#7A6450', minWidth: 24 }}>{f.unit}</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#9A8470', marginLeft: 14 }}>
              {f.hint}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={save}
        disabled={saving || !hasChanges}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
          background: saved ? '#5C7A3A' : '#A85C32', color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500,
          cursor: (saving || !hasChanges) ? 'not-allowed' : 'pointer',
          opacity: (saving || !hasChanges) ? 0.5 : 1,
          width: '100%', justifyContent: 'center',
        }}
      >
        {saving ? <><Loader2 size={14} className="spin" />Saving…</> :
         saved ? <><Check size={14} />Saved!</> :
         <><Check size={14} />{hasChanges ? 'Save changes' : 'No changes'}</>}
      </button>
    </div>
  );
}

function SettingsModal({ user, household, members, data, onClose, onSignOut, updateHouseholdName }) {
  const [copied, setCopied] = useState(false);
  const [reseeding, setReseeding] = useState(false);
  const [reseedDone, setReseedDone] = useState(false);
  const [reseedConfirmOpen, setReseedConfirmOpen] = useState(false);
  const copyCode = () => {
    navigator.clipboard.writeText(household.invite_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const reseedRecipes = async () => {
    setReseedConfirmOpen(true);
  };

  const doReseed = async () => {
    setReseedConfirmOpen(false);
    setReseeding(true);
    try {
      await supabase.from('recipes').delete().eq('household_id', household.id);
      const seed = SEED_RECIPES.map(r => ({
        household_id: household.id,
        title: r.title,
        servings: r.servings,
        time_min: r.timeMin,
        description: r.description,
        tags: r.tags,
        image: r.image,
        ingredients: r.ingredients,
        steps: r.steps,
        created_by: user.id,
        meal_type: r.mealType || 'dinner',
        leftover_friendly: r.leftoverFriendly || false,
        nutrition: r.nutrition || {},
        costco_sourcing: r.costcoSourcing || [],
        no_tomato_note: r.noTomatoNote || null,
        no_cilantro_note: r.noCilantroNote || null
      }));
      // Insert in chunks to avoid payload limits
      for (let i = 0; i < seed.length; i += 10) {
        await supabase.from('recipes').insert(seed.slice(i, i + 10));
      }
      if (data?.reload) await data.reload();
      setReseedDone(true);
      setTimeout(() => { setReseedDone(false); onClose(); }, 1500);
    } catch (e) {
      alert('Reseed failed: ' + e.message);
    }
    setReseeding(false);
  };
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(42,31,26,0.5)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 12, padding: 28, maxWidth: 460, width: '100%',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <h2 className="serif" style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>Settings</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8B6F47' }}><X size={20} /></button>
        </div>

        <section style={{ marginBottom: 24 }}>
          <h3 style={sectionH3}>Household</h3>
          <div style={{ background: '#FAF6EF', padding: 16, borderRadius: 8 }}>
            {/* Household name — editable */}
            {(() => {
              const [editingName, setEditingName] = React.useState(false);
              const [draftName, setDraftName] = React.useState(household.name);
              if (editingName) {
                return (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                    <input value={draftName} onChange={e => setDraftName(e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', border: '1px solid #E8DDC9', borderRadius: 6, fontSize: 16, fontFamily: 'inherit' }}
                      onKeyDown={e => { if (e.key === 'Enter') { updateHouseholdName && updateHouseholdName(draftName); setEditingName(false); } if (e.key === 'Escape') setEditingName(false); }}
                      autoFocus
                    />
                    <button onClick={() => { updateHouseholdName && updateHouseholdName(draftName); setEditingName(false); }}
                      style={{ padding: '6px 12px', background: '#5C7A3A', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}
                    >Save</button>
                    <button onClick={() => setEditingName(false)}
                      style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #E8DDC9', borderRadius: 6, fontSize: 13, cursor: 'pointer', color: '#5C4A3A' }}
                    >Cancel</button>
                  </div>
                );
              }
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div className='serif' style={{ fontSize: 18, fontWeight: 500 }}>{household.name}</div>
                  <button onClick={() => setEditingName(true)}
                    style={{ padding: '2px 8px', fontSize: 11, background: 'transparent', border: '1px solid #E8DDC9', borderRadius: 4, color: '#8B6F47', cursor: 'pointer' }}
                  >Rename</button>
                </div>
              );
            })()}
            <div style={{ fontSize: 12, color: '#8B6F47', marginBottom: 12 }}>{members.length} member{members.length === 1 ? '' : 's'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {members.map(m => (
                <div key={m.user_id} style={{ fontSize: 13, color: '#5C4A3A' }}>
                  • {m.display_name || 'Member'} {m.user_id === user.id && <span style={{ color: '#8B6F47' }}>(you)</span>}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#5C4A3A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 500 }}>Invite code</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <code style={{
                flex: 1, padding: '10px 14px', background: '#fff', border: '1px solid #E8DDC9',
                borderRadius: 6, fontFamily: 'monospace', fontSize: 16, letterSpacing: '0.1em', color: '#2A1F1A'
              }}>{household.invite_code}</code>
              <button onClick={copyCode} style={{
                padding: '10px 14px', background: copied ? '#5C7A3A' : '#2A1F1A', color: '#fff',
                border: 'none', borderRadius: 6, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6
              }}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: '#8B6F47', marginTop: 8, lineHeight: 1.5, margin: '8px 0 0' }}>
              Share this code with anyone you want to add to your household. They'll get the same recipes, week plan, grocery list, and pantry.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h3 style={sectionH3}>Daily Nutrition Targets</h3>
          <div style={{ fontSize: 13, color: '#5C4A3A', marginBottom: 10, lineHeight: 1.5 }}>
            Set your daily macro and calorie goals. Smart Plan and the home dashboard will use these targets.
          </div>
          <MacroTargetsEditor />
        </section>

        <section style={{ marginBottom: 24 }}>
          <h3 style={sectionH3}>Recipes</h3>
          <div style={{ fontSize: 13, color: '#5C4A3A', marginBottom: 10, lineHeight: 1.5 }}>
            Reload all 20 HelloFresh recipes with the latest prep/cook/plate structure, metric units, and from-scratch sauce instructions. Your week plan and pantry stay intact.
          </div>
          <button onClick={reseedRecipes} disabled={reseeding} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
            background: reseedDone ? '#5C7A3A' : '#A85C32', color: '#fff', border: 'none',
            borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: reseeding ? 'wait' : 'pointer',
            opacity: reseeding ? 0.7 : 1
          }}>
            {reseeding ? <><Loader2 size={14} className="spin" />Reloading…</> :
             reseedDone ? <><Check size={14} />Done!</> :
             <><RotateCcw size={14} />Refresh recipes</>}
          </button>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h3 style={sectionH3}>Account</h3>
          <div style={{ fontSize: 13, color: '#5C4A3A', marginBottom: 12 }}>
            Signed in as <strong>{user.email}</strong>
          </div>
          <button onClick={onSignOut} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
            background: 'transparent', border: '1px solid #E8DDC9', borderRadius: 8,
            color: '#A85C32', fontSize: 13
          }}>
            <LogOut size={14} /> Sign out
          </button>
        </section>

        <p style={{ fontSize: 11, color: '#A89379', textAlign: 'center', margin: 0 }}>Mise · Synced across all your devices</p>
      </div>

      {reseedConfirmOpen && (
        <div onClick={() => setReseedConfirmOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(42,31,26,0.5)', zIndex: 400,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 12, padding: 24, maxWidth: 380, width: '100%'
          }}>
            <h3 className="serif" style={{ fontSize: 18, margin: '0 0 10px' }}>Refresh all recipes?</h3>
            <p className="sans" style={{ fontSize: 13, color: '#5C4A3A', lineHeight: 1.6, margin: '0 0 16px' }}>
              This will delete all built-in recipes <strong>and any custom recipes you've added</strong>,
              then re-import the latest versions with improved instructions and air fryer alternatives.
              Your week plan, pantry, and grocery list are kept.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setReseedConfirmOpen(false)} style={{
                padding: '8px 16px', background: 'transparent', border: '1px solid #E8DDC9',
                borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#5C4A3A'
              }}>Cancel</button>
              <button onClick={doReseed} style={{
                padding: '8px 16px', background: '#A85C32', color: '#FAF6EF',
                border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer'
              }}>Yes, refresh</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const sectionH3 = { fontSize: 12, color: '#8B6F47', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px', fontWeight: 600 };

// -------- HOME VIEW --------
// -------- TodaysMeals — shows planned meals for today by slot --------
function TodaysMeals({ data, setView, setActiveRecipeId }) {
  // Map JS day-of-week to our app's 3-letter day codes
  const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayCode = dayMap[new Date().getDay()];

  const todayPlans = useMemo(() => {
    return (data.weekPlan || []).filter(w => w.day === todayCode);
  }, [data.weekPlan, todayCode]);

  const slotOrder = ['breakfast', 'lunch', 'dinner'];
  const slotLabels = {
    breakfast: { emoji: '🌅', label: 'Breakfast' },
    lunch: { emoji: '🥗', label: 'Lunch' },
    dinner: { emoji: '🍽️', label: 'Dinner' }
  };

  // Quick-glance totals for the day
  const dayTotals = useMemo(() => {
    let cal = 0, p = 0, fb = 0;
    for (const plan of todayPlans) {
      const r = data.recipes.find(x => x.id === plan.recipe_id);
      if (!r?.nutrition) continue;
      const servings = plan.servings || 1;
      cal += (r.nutrition.calories || 0) * servings;
      p += (r.nutrition.protein || 0) * servings;
      fb += (r.nutrition.fiber || 0) * servings;
    }
    return { cal, p, fb };
  }, [todayPlans, data.recipes]);

  if (todayPlans.length === 0) {
    return (
      <div style={{
        background: '#fff', border: '1px solid #E8DDC9', borderRadius: 12,
        padding: 16, margin: '12px 0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{
            margin: 0, fontSize: 13, color: '#9A8470', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.6px'
          }}>
            Today's Meals
          </h3>
          <button
            onClick={() => setView('week')}
            style={{
              background: 'transparent', border: 'none', color: '#A85C32',
              fontSize: 12, cursor: 'pointer', fontWeight: 500
            }}
          >
            View week →
          </button>
        </div>
        <div style={{
          color: '#9A8470', fontSize: 13, textAlign: 'center',
          padding: '16px 8px', fontStyle: 'italic'
        }}>
          Nothing planned for today. Head to Recipes and plan a smart week.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#fff', border: '1px solid #E8DDC9', borderRadius: 12,
      padding: 16, margin: '12px 0',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{
          margin: 0, fontSize: 13, color: '#9A8470', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.6px'
        }}>
          Today's Meals
        </h3>
        {dayTotals.cal > 0 && (
          <div style={{ fontSize: 11, color: '#7A6450' }}>
            <span style={{ fontWeight: 600, color: '#A85C32' }}>{Math.round(dayTotals.p)}g</span> protein ·{' '}
            <span style={{ fontWeight: 600 }}>{Math.round(dayTotals.cal)}</span> cal
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {slotOrder.map(slot => {
          const slotPlans = todayPlans.filter(p => (p.meal_slot || 'dinner') === slot);
          const labels = slotLabels[slot];

          if (slotPlans.length === 0) {
            return (
              <div key={slot} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', background: '#FAF4E9',
                borderRadius: 8, opacity: 0.55
              }}>
                <div style={{ fontSize: 18 }}>{labels.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#9A8470', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                    {labels.label}
                  </div>
                  <div style={{ fontSize: 12, color: '#9A8470', fontStyle: 'italic' }}>
                    Nothing planned
                  </div>
                </div>
              </div>
            );
          }

          if (slotPlans.length === 0) {
            return (
              <button key={slot} onClick={() => setView('recipes')} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', background: 'transparent',
                borderRadius: 8, border: '1px dashed #C9B89A',
                cursor: 'pointer', width: '100%', textAlign: 'left',
                marginBottom: 6
              }}>
                <span style={{ fontSize: 18, opacity: 0.4 }}>{labels.emoji}</span>
                <span className='sans' style={{ fontSize: 12, color: '#8B6F47' }}>Add {labels.label.toLowerCase()} →</span>
              </button>
            );
          }
          return slotPlans.map(plan => {
            const recipe = data.recipes.find(r => r.id === plan.recipe_id);
            if (!recipe) return null;
            const nut = recipe.nutrition || {};
            return (
              <button
                key={plan.id}
                onClick={() => { setActiveRecipeId(recipe.id); setView('recipe'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', background: '#FAF4E9',
                  borderRadius: 8, border: '1px solid transparent',
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#A85C32'; e.currentTarget.style.background = '#FFF8EE'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = '#FAF4E9'; }}
              >
                <div style={{ fontSize: 24 }}>{recipe.image || labels.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: '#9A8470', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                    {labels.label}
                  </div>
                  <div style={{ fontSize: 13, color: '#3D2F22', fontWeight: 500, lineHeight: 1.3, marginTop: 2 }}>
                    {recipe.title}
                  </div>
                  {nut.calories && (
                    <div style={{ fontSize: 11, color: '#7A6450', marginTop: 3 }}>
                      {nut.protein}g protein · {nut.calories} cal · {recipe.timeMin || 30} min
                    </div>
                  )}
                </div>
                <ChevronRight size={16} color="#A85C32" />
              </button>
            );
          });
        })}
      </div>
    </div>
  );
}

// -------- SnapMealPhotoButton — opens plate photo logger --------
function SnapMealPhotoButton() {
  const [open, setOpen] = useState(false);
  const { logQuickAdd } = useNutritionContext();

  const handleLog = async (data) => {
    // Log to food log via quick-add API (it accepts macros directly)
    await logQuickAdd({
      name: data.name,
      emoji: data.emoji,
      calories: data.calories,
      protein: data.protein,
      fat: data.fat,
      carbs: data.carbs,
      fiber: data.fiber,
      sodium: data.sodium,
    }, 1, data.mealSlot);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        width: '100%', background: '#fff', color: '#5C4A3A',
        border: '1px dashed #A85C32', borderRadius: 12, padding: '10px 14px',
        fontSize: 13, fontWeight: 500, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginBottom: 10,
      }}>
        <Camera size={14} color="#A85C32" />
        Snap meal photo to log macros
      </button>
      <PlatePhotoLogger open={open} onClose={() => setOpen(false)} onLog={handleLog} />
    </>
  );
}


// Only shows nutrition widgets once the user has set targets or logged at least one meal.
// Prevents empty progress bars from cluttering the home screen for new users.
function NutritionGate({ children }) {
  const { totals, targets } = useNutritionContext();
  const hasSetTargets = targets && (targets.calories_target > 0 || targets.protein_target > 0);
  const hasLoggedFood = totals && (totals.calories > 0 || totals.protein > 0);
  if (!hasSetTargets && !hasLoggedFood) return null;
  return children;
}

function HomeView({ data, groceryList, setView, setActiveRecipeId }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const needCount = groceryList.filter(g => g.need > 0).length;
  const expiringCount = useMemo(() => {
    const now = new Date();
    return (data.pantry || []).filter(p => {
      if (!p.expires_on) return false;
      const exp = new Date(p.expires_on + 'T00:00:00');
      const days = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 3;
    }).length;
  }, [data.pantry]);

  // Only show alerts that need action
  // (expiringCount used below in the chip row)
  const useSoon = useMemo(() => suggestUseSoon(data.recipes, data.pantry, data.weekPlan), [data.recipes, data.pantry, data.weekPlan]);
  const expiringItems = useMemo(() => (data.pantry || []).filter(p => {
    const s = expiryStatus(p);
    return s && (s.level === 'expired' || s.level === 'today' || s.level === 'urgent');
  }), [data.pantry]);

  const stats = useMemo(() => calcCookingStats(data.cookingLog || []), [data.cookingLog]);
  const hasLeftovers = (data.leftovers || []).length > 0;

  return (
    <div className="fade-in">
      {/* Compact header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <h1 className="serif" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1, margin: 0, letterSpacing: '-0.02em' }}>
          Today
        </h1>
        <div className="sans" style={{ fontSize: 11, color: '#8B6F47', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {today}
        </div>
      </div>

      {/* HERO: Today's planned meals — the main thing */}
      <TodaysMeals data={data} setView={setView} setActiveRecipeId={setActiveRecipeId} />

      {/* AI suggestion: What can I make tonight based on pantry */}
      <WhatCanIMakeTonight data={data} setView={setView} setActiveRecipeId={setActiveRecipeId} />

      {/* Daily nutrition tracking */}
      <NutritionGate><NutritionTotals date={new Date().toISOString().split('T')[0]} /></NutritionGate>

      {/* Today's food log — only shown after first use */}
      <NutritionGate><FoodLog date={new Date().toISOString().split('T')[0]} /></NutritionGate>

      {/* Smart suggestions — only when actionable */}
      <SmartSuggestions date={new Date().toISOString().split('T')[0]} />

      {/* Expiring items alert — only when something's expiring within 3 days */}
      {expiringItems.length > 0 && (
        <div style={{
          background: '#FFF1ED', border: '1px solid #F5C9B0', borderRadius: 10,
          padding: '12px 14px', marginBottom: 12,
          display: 'flex', alignItems: 'flex-start', gap: 10
        }}>
          <AlertTriangle size={16} color="#A85C32" style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 13, color: '#5C4A3A', lineHeight: 1.5 }}>
            <strong>{expiringItems.length} expiring soon:</strong>{' '}
            {expiringItems.slice(0, 3).map(p => p.name).join(', ')}
            {expiringItems.length > 3 && ` +${expiringItems.length - 3} more`}
            {useSoon.length > 0 && (
              <button onClick={() => { setActiveRecipeId(useSoon[0].recipe.id); setView('recipe'); }} style={{
                background: '#A85C32', color: '#FAF6EF', border: 'none',
                padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                marginLeft: 8, verticalAlign: 'middle'
              }}>
                <Sparkles size={10} />Try {useSoon[0].recipe.title.slice(0, 24)}{useSoon[0].recipe.title.length > 24 ? '…' : ''}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Leftovers — fridge inventory in a compact row */}
      {hasLeftovers && (
        <div style={{
          background: '#fff', border: '1px solid #E8DDC9', borderRadius: 10,
          padding: 12, marginBottom: 12,
        }}>
          <div className="sans" style={{ fontSize: 11, color: '#9A8470', letterSpacing: '0.6px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>
            In the fridge ({data.leftovers.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.leftovers.slice(0, 3).map(l => {
              const r = data.recipes.find(x => x.id === l.recipe_id);
              if (!r) return null;
              const cookedDate = l.cooked_on ? new Date(l.cooked_on + 'T00:00:00') : null;
              const daysOld = cookedDate ? Math.floor((Date.now() - cookedDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
              return (
                <div key={l.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                  background: '#FAF4E9', borderRadius: 8,
                }}>
                  <div style={{ fontSize: 20, flexShrink: 0 }}>{r.image || '🍽️'}</div>
                  <button onClick={() => { setActiveRecipeId(r.id); setView('recipe'); }} style={{
                    flex: 1, background: 'transparent', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', minWidth: 0
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#3D2F22', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                    <div style={{ fontSize: 10, color: '#A85C32', marginTop: 1 }}>
                      {l.servings_left} left · {daysOld === 0 ? 'today' : daysOld + 'd ago'}
                    </div>
                  </button>
                  <button onClick={() => data.consumeLeftover(l.id, 1)} style={{
                    padding: '5px 10px', background: '#5C7A3A', color: '#FAF6EF',
                    border: 'none', borderRadius: 14, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                    flexShrink: 0
                  }}>
                    Ate one
                  </button>
                </div>
              );
            })}
            {data.leftovers.length > 3 && (
              <div style={{ fontSize: 11, color: '#9A8470', textAlign: 'center', paddingTop: 4 }}>
                +{data.leftovers.length - 3} more leftover{data.leftovers.length - 3 === 1 ? '' : 's'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Snap meal photo button */}
      <SnapMealPhotoButton />

      {/* FoodLog is rendered above inside NutritionGate — removed duplicate */}

      {/* Quick stats footer — 3 tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 16, marginBottom: stats.totalCooked > 0 ? 12 : 0 }}>
        <StatTile label="Planned" value={data.weekPlan.length} accent="#A85C32" onClick={() => setView('week')} />
        <StatTile label="Recipes" value={data.recipes.length} accent="#5C7A3A" onClick={() => setView('recipes')} />
        <StatTile label="To buy" value={needCount} accent="#D4A574" onClick={() => setView('grocery')} />
        {expiringCount > 0 && (
          <StatTile label="Expiring" value={expiringCount} accent="#C0392B" onClick={() => setView('pantry')} />
        )}
      </div>

      {/* Cooking activity strip — only if there's history */}
      {stats.totalCooked > 0 && (
        <div style={{
          background: 'transparent', borderRadius: 8,
          padding: '10px 0', display: 'flex', gap: 14, alignItems: 'center',
          fontSize: 12, color: '#7A6450', flexWrap: 'wrap',
        }}>
          <TrendingUp size={14} color="#5C7A3A" />
          <span>
            <strong style={{ color: '#3D2F22' }}>{stats.lastWeek}</strong> cooked this week
          </span>
          {stats.currentStreak > 1 && (
            <span>· <strong style={{ color: '#A85C32' }}>{stats.currentStreak}-day streak 🔥</strong></span>
          )}
          {stats.avgRating && (
            <span>· {stats.avgRating.toFixed(1)} <Star size={11} fill="#D4A574" color="#D4A574" style={{ display: 'inline', verticalAlign: '-1px' }} /> avg</span>
          )}
        </div>
      )}
    </div>
  );
}

// Compact nutrition strip — pulls from shared context (live updates)
function CompactNutrition() {
  const { targets, totals } = useNutritionContext();
  if (!targets) return null;

  const metrics = [
    { label: 'P', current: totals.protein, target: targets.protein_target, unit: 'g', color: '#A85C32' },
    { label: 'Cal', current: totals.calories, target: targets.calories_target, unit: '', color: '#5C4A3A' },
    { label: 'F', current: totals.fiber, target: targets.fiber_target, unit: 'g', color: '#5C7A3A' },
  ];

  return (
    <div style={{
      background: '#FAF4E9', border: '1px solid #EFE5D2', borderRadius: 10,
      padding: '10px 12px', marginBottom: 12,
      display: 'flex', gap: 12, alignItems: 'center',
    }}>
      {metrics.map((m, i) => {
        const pct = Math.min(100, (m.current / m.target) * 100);
        return (
          <div key={m.label} style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
              <span style={{ color: '#7A6450', fontWeight: 600 }}>{m.label}</span>
              <span style={{ color: '#3D2F22', fontWeight: 500 }}>
                {Math.round(m.current)}{m.unit}
                <span style={{ color: '#9A8470', fontWeight: 400 }}> / {m.target}{m.unit}</span>
              </span>
            </div>
            <div style={{ background: '#EDE0CC', borderRadius: 3, height: 5, overflow: 'hidden' }}>
              <div style={{
                background: m.color, height: '100%', width: pct + '%',
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const mealRow = {
  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
  background: '#fff', border: '1px solid #E8DDC9', borderRadius: 8, width: '100%'
};
const mealEmoji = {
  fontSize: 26, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: '#FAF6EF', borderRadius: 6, flexShrink: 0
};
const recipeMini = {
  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
  background: 'transparent', border: '1px solid transparent', borderRadius: 6, width: '100%'
};

function StatTile({ label, value, accent, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '16px 18px', background: '#fff', border: '1px solid #E8DDC9',
      borderRadius: 8, textAlign: 'left'
    }}>
      <div className="sans" style={{ fontSize: 10, color: '#8B6F47', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</div>
      <div className="serif" style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 500, color: accent, lineHeight: 1, marginTop: 6 }}>{value}</div>
    </button>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="serif" style={{ fontSize: 18, fontWeight: 500, color: '#2A1F1A', margin: '0 0 12px', paddingBottom: 6, borderBottom: '1px solid #E8DDC9' }}>{children}</h2>
  );
}

function EmptyCard({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '24px', background: '#fff', border: '1px dashed #C9B89A', borderRadius: 8,
      color: '#8B6F47', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 14
    }}>{children}</button>
  );
}

// -------- UNDO TOAST --------
// Shows after a destructive action (delete recipe / pantry item / week meal).
// User has 6 visible seconds to tap "Undo"; backend supports up to 30s.
function UndoToast({ data, isMobile }) {
  const [visible, setVisible] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(6);
  const timerRef = useRef(null);
  const lastSeenAt = useRef(0);

  // Watch for delete events
  useEffect(() => {
    if (!data.lastDeleteAt || data.lastDeleteAt === lastSeenAt.current) return;
    lastSeenAt.current = data.lastDeleteAt;
    setVisible(true);
    setSecondsLeft(6);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          setVisible(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [data.lastDeleteAt]);

  if (!visible) return null;

  const kindLabel = {
    recipe: 'Recipe',
    pantry: 'Pantry item',
    week_plan: 'Meal'
  }[data.lastDeleteKind] || 'Item';

  const handleUndo = async () => {
    setRestoring(true);
    const ok = await data.undoLastDelete();
    setRestoring(false);
    setVisible(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!ok) alert('Could not restore — try refreshing.');
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? 88 : 24,
      left: '50%', transform: 'translateX(-50%)',
      background: '#2A1F1A', color: '#FAF6EF',
      padding: '10px 14px 10px 16px', borderRadius: 10,
      boxShadow: '0 6px 24px rgba(42,31,26,0.3)',
      display: 'flex', alignItems: 'center', gap: 12,
      zIndex: 200, maxWidth: 360, fontSize: 13,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <Trash2 size={14} color="#F5C9B0" />
      <div style={{ flex: 1 }}>
        {kindLabel} deleted
        <span style={{ marginLeft: 6, opacity: 0.5, fontSize: 11 }}>· {secondsLeft}s</span>
      </div>
      <button onClick={handleUndo} disabled={restoring} style={{
        background: 'transparent', border: '1px solid #FAF6EF',
        color: '#FAF6EF', padding: '5px 12px', borderRadius: 14,
        fontSize: 12, fontWeight: 500, cursor: restoring ? 'wait' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 4
      }}>
        {restoring ? <Loader2 size={11} className="spin" /> : <Undo2 size={11} />}
        Undo
      </button>
      <button onClick={() => { setVisible(false); if (timerRef.current) clearInterval(timerRef.current); }} style={{
        background: 'transparent', border: 'none', color: '#FAF6EF',
        padding: 4, cursor: 'pointer', opacity: 0.6
      }}>
        <X size={13} />
      </button>
    </div>
  );
}

// -------- RECIPES LIST --------
function RecipesView({ data, setView, setActiveRecipeId }) {
  const [importModalOpen, setImportModalOpen] = useState(false);

  const handleImportRecipe = async (recipe) => {
    if (data?.addRecipe) {
      await data.addRecipe(recipe);
    }
  };
  const [search, setSearch] = useState('');

  // Favourites — stored in localStorage (personal preference, not shared across household)
  const [favourites, setFavourites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mise_favourites') || '[]'); } catch { return []; }
  });
  const toggleFav = (id) => {
    setFavourites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem('mise_favourites', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const [proteinFilter, setProteinFilter] = useState(() => { try { return sessionStorage.getItem('mise_rf_protein') || 'all'; } catch { return 'all'; } });
  const [pantryOnly, setPantryOnly] = useState(() => { try { return sessionStorage.getItem('mise_rf_pantry') === 'true'; } catch { return false; } });
  const [timeFilter, setTimeFilter] = useState(() => { try { return sessionStorage.getItem('mise_rf_time') || 'all'; } catch { return 'all'; } });
  const [mealFilter, setMealFilter] = useState(() => { try { return sessionStorage.getItem('mise_rf_meal') || 'all'; } catch { return 'all'; } });
  const [planning, setPlanning] = useState(false);
  // Persist filter state so it survives navigation
  const setProteinFilterP = v => { setProteinFilter(v); try { sessionStorage.setItem('mise_rf_protein', v); } catch {} };
  const setPantryOnlyP = v => { setPantryOnly(v); try { sessionStorage.setItem('mise_rf_pantry', String(v)); } catch {} };
  const setTimeFilterP = v => { setTimeFilter(v); try { sessionStorage.setItem('mise_rf_time', v); } catch {} };
  const setMealFilterP = v => { setMealFilter(v); try { sessionStorage.setItem('mise_rf_meal', v); } catch {} };

  const filtered = useMemo(() => {
    return data.recipes.filter(r => {
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (proteinFilter !== 'all' && getPrimaryProtein(r) !== proteinFilter) return false;
      if (timeFilter !== 'all' && r.timeMin > Number(timeFilter)) return false;
      if (mealFilter !== 'all' && (r.mealType || r.meal_type) !== mealFilter) return false;
      if (pantryOnly && pantryScore(r, data.pantry) < 2) return false;
      return true;
    });
  }, [data.recipes, search, proteinFilter, pantryOnly, timeFilter, mealFilter, data.pantry]);

  // Group recipes by their pair-with-week-plan score for badges
  const recipesWithBadges = useMemo(() => {
    return filtered.map(r => ({
      ...r,
      _pairScore: pairScore(r, data.recipes, data.weekPlan),
      _pantryScore: pantryScore(r, data.pantry),
      _nutrition: r.nutrition,
      _protein: getPrimaryProtein(r)
    }));
  }, [filtered, data.recipes, data.weekPlan, data.pantry]);

  const planSmartWeek = async () => {
    if (data.weekPlan.length > 0) {
      if (!window.confirm(`This will REPLACE your current week plan with 21 meals (7 breakfasts + 7 lunches + 7 dinners) that share ingredients (so you only need one grocery trip).\n\nProceed?`)) return;
      // Clear existing
      for (const w of data.weekPlan) {
        await data.removeFromWeek(w.id);
      }
    }
    setPlanning(true);

    // Filter recipes by meal type
    const breakfasts = data.recipes.filter(r => (r.mealType || r.meal_type) === 'breakfast');
    const lunches = data.recipes.filter(r => (r.mealType || r.meal_type) === 'lunch');
    const dinners = data.recipes.filter(r => (r.mealType || r.meal_type) === 'dinner');

    // Pick 7 from each category using smart-week logic — uses pantry, prefers ingredient overlap, varies protein
    // Macro-aware planning — fetch user's targets
    let macroTargets = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: tdata } = await supabase
          .from('user_nutrition_targets')
          .select('*')
          .eq('user_id', user.id)
          .single();
        macroTargets = tdata;
      }
    } catch (e) {
      console.warn('Could not load nutrition targets — falling back to standard planning:', e);
    }

    const planFn = macroTargets ? generateMacroAwareWeekPlan : generateSmartWeekPlan;
    const pickBreakfasts = planFn(breakfasts, Math.min(7, breakfasts.length), data.pantry, macroTargets || true);
    const pickLunches = planFn(lunches, Math.min(7, lunches.length), data.pantry, macroTargets || true);
    const pickDinners = planFn(dinners, Math.min(7, dinners.length), data.pantry, macroTargets || true);

    // Build day labels with actual dates starting from the current week's Monday
  const days = (() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((name, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday = d.toDateString() === today.toDateString();
      const dateStr = d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
      return { code: name, label: name, dateStr, isToday };
    });
  })();

    // If we don't have 7 of a category, cycle through what we have (e.g. only 5 breakfasts → repeat 2)
    const cyclePick = (arr, i) => arr.length === 0 ? null : arr[i % arr.length];

    for (let i = 0; i < 7; i++) {
      const bf = cyclePick(pickBreakfasts, i);
      const lu = cyclePick(pickLunches, i);
      const di = cyclePick(pickDinners, i);
      if (bf) await data.addToWeek(bf.id, days[i].code, 'breakfast');
      if (lu) await data.addToWeek(lu.id, days[i].code, 'lunch');
      if (di) await data.addToWeek(di.id, days[i].code, 'dinner');
    }
    setPlanning(false);
    setView('week');
  };

  const proteinOptions = [
    { id: 'all', label: 'All', emoji: '' },
    { id: 'chicken', label: 'Chicken', emoji: '🍗' },
    { id: 'beef', label: 'Beef', emoji: '🥩' },
    { id: 'salmon', label: 'Salmon', emoji: '🐟' },
    { id: 'turkey', label: 'Turkey', emoji: '🦃' },
    { id: 'vegetarian', label: 'Veg', emoji: '🥗' }
  ];

  return (
    <div className="fade-in">
      <PageHeader kicker="The library" title="All recipes" subtitle={`${filtered.length} of ${data.recipes.length} shown`} />

      {/* Meal type tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All', icon: UtensilsCrossed },
          { id: 'breakfast', label: 'Breakfast', icon: Flame },
          { id: 'lunch', label: 'Lunch', icon: Salad },
          { id: 'dinner', label: 'Dinner', icon: ChefHat },
        ].map(m => {
          const Icon = m.icon;
          const active = mealFilter === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMealFilterP(m.id)}
              style={{
                padding: '8px 14px', borderRadius: 18, border: '1px solid',
                borderColor: active ? '#A85C32' : '#E8DDC9',
                background: active ? '#A85C32' : '#fff',
                color: active ? '#FAF6EF' : '#5C4A3A',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <Icon size={13} />{m.label}
            </button>
          );
        })}
      </div>

      {/* Import recipe button */}
      <button onClick={() => setImportModalOpen(true)} style={{
        width: '100%', background: '#fff', color: '#5C4A3A',
        border: '1px dashed #A85C32', borderRadius: 12, padding: '10px 14px',
        fontSize: 13, fontWeight: 500, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginBottom: 12,
      }}>
        <Link2 size={14} color="#A85C32" />
        Import recipe from URL
      </button>

      {/* Smart plan button */}
      <button
        onClick={planSmartWeek}
        disabled={planning}
        style={{
          width: '100%', padding: '14px 18px', marginBottom: 16,
          background: 'linear-gradient(135deg, #5C7A3A 0%, #4A6230 100%)',
          color: '#FAF6EF', border: 'none', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontSize: 15, fontWeight: 500, cursor: planning ? 'wait' : 'pointer',
          opacity: planning ? 0.7 : 1, boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
        }}
      >
        {planning ? <><Loader2 size={16} className="spin" />Planning your week…</> :
         <><Sparkles size={16} />Plan a smart week (21 meals · breakfast/lunch/dinner)</>}
      </button>

      {/* Search */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B6F47' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{
            width: '100%', padding: '10px 14px 10px 36px', background: '#fff', border: '1px solid #E8DDC9', borderRadius: 8, fontSize: 14, outline: 'none'
          }} />
        </div>
        <button onClick={() => setView('import')} style={{
          padding: '10px 16px', background: '#A85C32', color: '#FAF6EF', border: 'none', borderRadius: 8, fontSize: 14,
          display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'
        }}><Plus size={14} />Add</button>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        {proteinOptions.map(p => (
          <button key={p.id} onClick={() => setProteinFilterP(p.id)} style={{
            padding: '6px 12px', borderRadius: 16, border: '1px solid',
            borderColor: proteinFilter === p.id ? '#2A1F1A' : '#E8DDC9',
            background: proteinFilter === p.id ? '#2A1F1A' : '#fff',
            color: proteinFilter === p.id ? '#FAF6EF' : '#5C4A3A',
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            {p.emoji && <span style={{ fontSize: 13 }}>{p.emoji}</span>}{p.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setPantryOnlyP(!pantryOnly)} disabled={data.pantry.length === 0} style={{
          padding: '6px 12px', borderRadius: 16, border: '1px solid',
          borderColor: pantryOnly ? '#A85C32' : '#E8DDC9',
          background: pantryOnly ? '#A85C32' : '#fff',
          color: pantryOnly ? '#FAF6EF' : (data.pantry.length === 0 ? '#A89379' : '#5C4A3A'),
          fontSize: 12, fontWeight: 500,
          cursor: data.pantry.length === 0 ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 4,
          opacity: data.pantry.length === 0 ? 0.5 : 1
        }}>
          <Package size={11} />Uses my pantry
        </button>
        {[
          { v: 'all', l: 'Any time' },
          { v: '30', l: '≤ 30 min' },
          { v: '45', l: '≤ 45 min' }
        ].map(t => (
          <button key={t.v} onClick={() => setTimeFilterP(t.v)} style={{
            padding: '6px 12px', borderRadius: 16, border: '1px solid',
            borderColor: timeFilter === t.v ? '#2A1F1A' : '#E8DDC9',
            background: timeFilter === t.v ? '#2A1F1A' : '#fff',
            color: timeFilter === t.v ? '#FAF6EF' : '#5C4A3A',
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            <Clock size={11} />{t.l}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyCard><Search size={20} /><div>No recipes match these filters</div></EmptyCard>
      )}

      {/* Favourites strip — shown when user has starred recipes */}
      {favourites.length > 0 && !search && proteinFilter === 'all' && mealFilter === 'all' && (
        <div style={{ marginBottom: 20 }}>
          <h2 className="serif" style={{ fontSize: 16, fontWeight: 500, margin: '0 0 10px', color: '#D4A574', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Star size={14} fill="#D4A574" color="#D4A574" />Favourites
          </h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {data.recipes.filter(r => favourites.includes(r.id)).map(r => (
              <button key={r.id} onClick={() => { setActiveRecipeId(r.id); setView('recipe'); }} style={{
                padding: '8px 14px', background: '#FFF8EE', border: '1px solid #D4A574', borderRadius: 20,
                fontSize: 13, color: '#2A1F1A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}>
                <span style={{ fontSize: 16 }}>{r.image || '🍽️'}</span>{r.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: 10 }}>
        {recipesWithBadges.map(r => (
          <article key={r.id} style={{
            background: '#fff', border: '1px solid #E8DDC9', borderRadius: 10, overflow: 'hidden', position: 'relative'
          }}>
            {/* Favourite star */}
            <button
              onClick={e => { e.stopPropagation(); toggleFav(r.id); }}
              style={{
                position: 'absolute', top: 8, right: 8, zIndex: 2,
                background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 12,
                padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center'
              }}
              title={favourites.includes(r.id) ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Star size={14} fill={favourites.includes(r.id) ? '#D4A574' : 'none'} color={favourites.includes(r.id) ? '#D4A574' : '#C9B89A'} strokeWidth={1.5} />
            </button>
            {/* Badges */}
            {(r._pairScore >= 3 || r._pantryScore >= 3) && (
              <div style={{
                position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4, zIndex: 1, flexWrap: 'wrap'
              }}>
                {r._pairScore >= 3 && (
                  <span style={{
                    padding: '3px 8px', background: '#5C7A3A', color: '#FAF6EF',
                    borderRadius: 10, fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
                    display: 'flex', alignItems: 'center', gap: 3
                  }}>
                    <Sparkles size={9} />Pairs well
                  </span>
                )}
                {r._pantryScore >= 3 && (
                  <span style={{
                    padding: '3px 8px', background: '#A85C32', color: '#FAF6EF',
                    borderRadius: 10, fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
                    display: 'flex', alignItems: 'center', gap: 3
                  }}>
                    <Package size={9} />In pantry
                  </span>
                )}
              </div>
            )}
            <button onClick={() => { setActiveRecipeId(r.id); setView('recipe'); }} style={{ width: '100%', padding: 0, background: 'transparent', border: 'none', textAlign: 'left' }}>
              <div style={{ background: '#FAF6EF', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>{r.image || '🍽️'}</div>
              <div style={{ padding: 14 }}>
                <h3 className="serif" style={{ fontSize: 16, fontWeight: 500, margin: '0 0 6px', lineHeight: 1.3 }}>{r.title}</h3>
                <div className="sans" style={{ fontSize: 11, color: '#8B6F47', display: 'flex', gap: 10, marginBottom: 6 }}>
                  <span><Clock size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: '-2px' }} />{r.timeMin}m</span>
                  <span><Users size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: '-2px' }} />{r.servings}</span>
                  <span>{(r.ingredients || []).length} ing.</span>
                </div>
                {r._nutrition && (
                  <div className="sans" style={{ fontSize: 10, color: '#A85C32', display: 'flex', gap: 8, fontWeight: 500 }}>
                    <span>~{r._nutrition.calories} cal</span>
                    <span>{r._nutrition.protein}g protein</span>
                  </div>
                )}
              </div>
            </button>
            <div style={{ display: 'flex', borderTop: '1px solid #F0E6D2', padding: 8, gap: 4 }}>
              <button onClick={() => data.addToWeek(r.id)} style={miniBtn('#5C7A3A')}><Calendar size={12} /> Add to week</button>
              <button onClick={() => { if (confirm(`Delete "${r.title}"?`)) data.deleteRecipe(r.id); }} style={{ padding: 8, background: 'transparent', border: 'none', color: '#A85C32' }}><Trash2 size={13} /></button>
            </div>
          </article>
        ))}
      </div>
      <RecipeImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onAddRecipe={handleImportRecipe}
      />
    </div>
  );
}

const miniBtn = (color) => ({
  flex: 1, padding: '6px 10px', background: 'transparent', border: 'none', color,
  fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 4
});

// Stateful "Add to week" button — shows ✓ confirmation for 1.5 seconds then resets
function AddToWeekButton({ recipeId, addToWeek }) {
  const [added, setAdded] = useState(false);
  const handle = async () => {
    if (added) return;
    await addToWeek(recipeId);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };
  return (
    <button onClick={handle} style={{
      padding: '14px 18px',
      background: added ? '#5C7A3A' : 'transparent',
      color: added ? '#FAF6EF' : '#2A1F1A',
      border: `1px solid ${added ? '#5C7A3A' : '#2A1F1A'}`,
      borderRadius: 8, fontSize: 14,
      display: 'flex', alignItems: 'center', gap: 6,
      transition: 'all 0.2s', cursor: 'pointer'
    }}>
      {added ? <><Check size={15} />Added!</> : <><Calendar size={15} />Add to week</>}
    </button>
  );
}

function PageHeader({ kicker, title, subtitle, back }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {back && <button onClick={back} style={{ background: 'transparent', border: 'none', color: '#8B6F47', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: 0, marginBottom: 10 }}><ArrowLeft size={14} />Back</button>}
      {kicker && <div className="sans" style={{ fontSize: 11, color: '#8B6F47', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>{kicker}</div>}
      <h1 className="serif" style={{ fontSize: 'clamp(20px, 5.5vw, 32px)', fontWeight: 400, margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{title}</h1>
      {subtitle && <p className="sans" style={{ fontSize: 14, color: '#5C4A3A', margin: 0 }}>{subtitle}</p>}
    </div>
  );
}

// -------- SINGLE RECIPE --------
function RecipeView({ recipe, data, setView, setCookingStepIdx, setCookingScale, modes }) {
  const [scale, setScale] = useState(1);
  const [editing, setEditing] = useState(false);
  const [openComponent, setOpenComponent] = useState(null);
  const [openSubstitute, setOpenSubstitute] = useState(null);
  const [swapModal, setSwapModal] = useState(null); // { ing, subs } — active swap modal
  const [swapping, setSwapping] = useState(false);
  const scaledServings = Math.round(recipe.servings * scale);

  // Compute which equipment modes + ingredient modes this recipe supports
  const supportedEquipment = useMemo(() => getSupportedEquipment(recipe), [recipe]);
  const hasIngAlts = useMemo(() => hasIngredientAlternates(recipe), [recipe]);
  // Honour the global preference only if this recipe supports it; otherwise fall
  // back to the recipe's primary method (supportedEquipment[0]) so the toggle
  // always has a valid, highlighted selection.
  const eqMode = supportedEquipment.includes(modes?.equipmentMode) ? modes.equipmentMode : supportedEquipment[0];
  const ingMode = modes?.ingredientMode || 'fresh';

  // Compute the parallel cook plan so we can show time savings on the Start button
  const recipeCookPlan = useMemo(() => {
    const resolved = (recipe.steps || []).map(s => fullyResolveStep(s, eqMode, ingMode));
    return buildCookPlan(resolved);
  }, [recipe.steps, eqMode, ingMode]);
  const canParallelRecipe = recipeCookPlan.hasParallelism && recipeCookPlan.savedMinutes >= 3;

  const startCooking = () => {
    if (setCookingScale) setCookingScale(scale);
    setCookingStepIdx(0);
    setView('cook');
  };

  const updateIngredient = (id, patch) => {
    const updated = recipe.ingredients.map(i => i.id === id ? { ...i, ...patch } : i);
    data.updateRecipe(recipe.id, { ingredients: updated });
  };
  const swapProtein = (id, newName) => {
    const oldIng = recipe.ingredients.find(i => i.id === id);
    const updated = recipe.ingredients.map(i => i.id === id ? { ...i, name: newName } : i);
    let newSteps = recipe.steps;
    if (oldIng) {
      const oldWord = oldIng.name.split(/\s+/).find(w => /^(chicken|beef|pork|salmon|shrimp|tofu|turkey|fish|steak)/i.test(w));
      const newWord = newName.split(/\s+/).find(w => /^(chicken|beef|pork|salmon|shrimp|tofu|turkey|fish|steak)/i.test(w));
      if (oldWord && newWord && oldWord.toLowerCase() !== newWord.toLowerCase()) {
        newSteps = recipe.steps.map(s => ({
          ...s, text: s.text.replace(new RegExp(`\\b${oldWord}\\b`, 'gi'), newWord)
        }));
      }
    }
    data.updateRecipe(recipe.id, { ingredients: updated, steps: newSteps });
  };

  // Apply a chosen substitute: update the ingredient + rewrite all step text
  const applySwap = async (ing, substituteText) => {
    setSwapping(true);
    try {
      const newIng = buildSwappedIngredient(ing, substituteText);
      const liveIng = recipe.ingredients.find(x => x.id === ing.id) || ing;
      const originalName = liveIng._swappedFrom || liveIng.name || ing.name;
      const updatedIngredients = recipe.ingredients.map(i =>
        i.id === ing.id ? { ...i, name: newIng.name, _swappedFrom: originalName, _swappedTo: substituteText } : i
      );
      // Store swap in step.userText — this field takes priority over ALL alt modes
      // (air fryer, paste, etc.) in fullyResolveStep. This ensures the swap is always
      // visible regardless of what equipment/ingredient mode the user has selected.
      const updatedSteps = recipe.steps.map(s => {
        const currentText = s.userText || s.text; // rewrite from current displayed text
        const newText = rewriteStepForSwap(currentText, ing.name, substituteText);
        if (newText === currentText) return s; // no change, don't pollute userText
        return { ...s, userText: newText };
      });
      await data.updateRecipe(recipe.id, { ingredients: updatedIngredients, steps: updatedSteps });
      setSwapModal(null);
    } catch (e) {
      alert('Swap failed: ' + (e.message || 'unknown error'));
    }
    setSwapping(false);
  };

  // Group steps by phase, preserving original order within each phase.
  // Each step is run through fullyResolveStep to apply equipment + ingredient modes,
  // which may swap text and timer values based on the active toggles.
  const phaseGroups = useMemo(() => {
    const groups = { prep: [], cook: [], plate: [] };
    (recipe.steps || []).forEach((step, originalIdx) => {
      const resolved = fullyResolveStep(step, eqMode, ingMode);
      const phase = step.phase || 'cook';
      groups[phase] = groups[phase] || [];
      groups[phase].push({ ...resolved, originalIdx });
    });
    return groups;
  }, [recipe.steps, eqMode, ingMode]);

  const phaseConfig = {
    prep: { label: 'Prep', icon: Salad, color: '#5C7A3A', bg: '#F0F5E8', desc: 'Get everything ready' },
    cook: { label: 'Cook', icon: Flame, color: '#A85C32', bg: '#FFF0E0', desc: 'Apply heat' },
    plate: { label: 'Plate & serve', icon: UtensilsCrossed, color: '#7A5C32', bg: '#FAF1DC', desc: 'Bring it together' }
  };

  return (
    <div className="fade-in">
      <PageHeader back={() => setView('recipes')} kicker={(recipe.tags || []).join(' · ') || 'Recipe'} title={recipe.title} subtitle={recipe.description} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={startCooking} style={{
          flex: '1 1 auto', padding: '14px 20px', background: '#A85C32', color: '#FAF6EF', border: 'none', borderRadius: 8,
          fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}>
          <ChefHat size={18} />
          Start cooking
          {canParallelRecipe && (
            <span style={{
              background: 'rgba(255,255,255,0.2)', borderRadius: 10,
              padding: '2px 8px', fontSize: 12, fontWeight: 500
            }}>
              ~{Math.round(recipeCookPlan.parallelMinutes)}m smart
            </span>
          )}
        </button>
        <AddToWeekButton recipeId={recipe.id} addToWeek={data.addToWeek} />
        <button onClick={() => setEditing(!editing)} style={{
          padding: '14px 16px', background: 'transparent', color: '#5C4A3A', border: '1px solid #E8DDC9', borderRadius: 8,
          fontSize: 14, display: 'flex', alignItems: 'center', gap: 6
        }}><Edit3 size={14} />{editing ? 'Done' : 'Edit'}</button>
      </div>

      {/* Mode toggles — only shown when the recipe has alternates. */}
      {(supportedEquipment.length > 1 || hasIngAlts) && modes && (
        <div style={{
          background: '#fff', border: '1px solid #E8DDC9', borderRadius: 10,
          padding: '10px 12px', marginBottom: 16,
          display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap'
        }}>
          {supportedEquipment.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#8B6F47', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>Cook with</span>
              <div style={{ display: 'flex', gap: 0, padding: 3, background: '#FAF6EF', borderRadius: 18 }}>
                {supportedEquipment.map(modeId => {
                  const mode = EQUIPMENT_MODES[modeId];
                  if (!mode) return null;
                  const active = eqMode === modeId;
                  return (
                    <button key={modeId} onClick={() => modes.setEquipmentMode(modeId)} style={{
                      padding: '5px 12px', borderRadius: 14, border: 'none',
                      background: active ? '#2A1F1A' : 'transparent',
                      color: active ? '#FAF6EF' : '#5C4A3A',
                      fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      <span style={{ fontSize: 13 }}>{mode.icon}</span>{mode.label}
                    </button>
                  );
                })}
              </div>

            </div>
          )}

          {hasIngAlts && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#8B6F47', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>Ingredients</span>
              <div style={{ display: 'flex', gap: 0, padding: 3, background: '#FAF6EF', borderRadius: 18 }}>
                {Object.values(INGREDIENT_MODES).map(mode => {
                  const active = ingMode === mode.id;
                  return (
                    <button key={mode.id} onClick={() => modes.setIngredientMode(mode.id)} style={{
                      padding: '5px 12px', borderRadius: 14, border: 'none',
                      background: active ? '#2A1F1A' : 'transparent',
                      color: active ? '#FAF6EF' : '#5C4A3A',
                      fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      <span style={{ fontSize: 13 }}>{mode.icon}</span>{mode.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #E8DDC9', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: '1px solid #F0E6D2', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 56 }}>{recipe.image || '🍽️'}</div>
          <div style={{ display: 'flex', gap: 18, color: '#5C4A3A', fontSize: 15, flexWrap: 'wrap' }}>
            <span><Clock size={15} style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px' }} />{recipe.timeMin}m</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={15} />
              <button onClick={() => setScale(Math.max(0.5, scale - 0.5))} style={qtyBtn}><Minus size={12} /></button>
              <span style={{ fontWeight: 500, minWidth: 70, textAlign: 'center', flexShrink: 0 }}>{scaledServings} servings</span>
              <button onClick={() => setScale(scale + 0.5)} style={qtyBtn}><Plus size={12} /></button>
            </span>
          </div>
        </div>

        {/* Nutrition info */}
        {(() => {
          const nut = recipe.nutrition;
          if (!nut) return null;
          return (
            <div style={{
              display: 'flex', gap: 18, padding: '14px 0', borderBottom: '1px solid #F0E6D2',
              fontSize: 13, color: '#5C4A3A', flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B6F47' }}>Per serving</span>
                <span style={{ fontWeight: 500, color: '#A85C32', marginTop: 2 }}>~{nut.calories} cal</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B6F47' }}>Protein</span>
                <span style={{ fontWeight: 500, marginTop: 2 }}>{nut.protein}g</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B6F47' }}>Carbs</span>
                <span style={{ fontWeight: 500, marginTop: 2 }}>{nut.carbs}g</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B6F47' }}>Fat</span>
                <span style={{ fontWeight: 500, marginTop: 2 }}>{nut.fat}g</span>
              </div>
              <div style={{ flex: 1, fontSize: 10, color: '#A89379', fontStyle: 'italic', alignSelf: 'flex-end' }}>
                Estimates ±15%
              </div>
            </div>
          );
        })()}

        {/* Ingredients with decoder */}
        <div style={{ paddingTop: 24 }}>
          <h3 className="serif" style={{ fontSize: 18, fontWeight: 500, margin: '0 0 14px', borderBottom: '1px solid #E8DDC9', paddingBottom: 8 }}>Ingredients</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(recipe.ingredients || []).map(rawIng => {
              const ing = resolveIngredient(rawIng, ingMode);
              // Split prep instructions out of ingredient names for cleaner display
              // e.g. 'yellow onion, thinly sliced' -> name='yellow onion' note='thinly sliced'
              const [ingDisplayName, ingPrepNote] = (() => {
                const commaIdx = ing.name.indexOf(', ');
                if (commaIdx > 0) {
                  const prep = ing.name.slice(commaIdx + 2);
                  const isPrep = /^(thinly|finely|roughly|coarsely|freshly|skin.on|bone.in|drained|rinsed|peeled|sliced|diced|chopped|minced|grated|shredded|crumbled|halved|trimmed|julienned|washed|loosely)/i.test(prep);
                  if (isPrep) return [ing.name.slice(0, commaIdx), prep];
                }
                return [ing.name, null];
              })();
              const decoder = findComponentRecipe(ingDisplayName);
              // Strip parenthetical descriptions and trailing qualifiers before matching
              // e.g. 'ginger-garlic puree (made from 1 inch...)' → 'ginger-garlic puree'
              // e.g. 'carrot, peeled' → 'carrot'
              // Use _swappedFrom (original name) if available so re-swapping
              // always looks up the original ingredient, not the current swapped name.
              // Re-read from recipe.ingredients to get latest _swappedFrom after a swap.
              const liveIngForMatch = recipe.ingredients.find(x => x.id === ing.id) || ing;
              const nameToMatch = liveIngForMatch._swappedFrom || liveIngForMatch.name;
              const ingNameForMatch = nameToMatch
                .replace(/\s*\([^)]*\)/g, '') // strip (parentheticals)
                .replace(/,.*$/, '')             // strip ', peeled' etc
                .replace(/\s+(fresh|dried|frozen|canned|jarred|toasted|shredded|chopped|sliced|diced|minced|grated|peeled|skin.on|bone.in)\b.*/i, '') // strip cooking adjectives
                .trim();
              const subs = findSubstitutes(ingNameForMatch);
              const isOpen = openComponent === ing.id;
              const isSubOpen = openSubstitute === ing.id;
              return (
                <li key={ing.id} className="sans" style={{ fontSize: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 500, minWidth: 60, flexShrink: 0, color: ing.protein ? '#A85C32' : '#2A1F1A' }}>
                      {formatQty(ing.qty * scale, ing.unit)} {ing.unit !== 'unit' && ing.unit !== 'whole' ? ing.unit : ''}
                    </span>
                    {editing ? (
                      <input value={ing.name}
                        onChange={e => ing.protein ? swapProtein(ing.id, e.target.value) : updateIngredient(ing.id, { name: e.target.value })}
                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #E8DDC9', borderRadius: 4, fontSize: 15, background: ing.protein ? '#FFF8F2' : '#fff' }} />
                    ) : (
                      <span style={{ flex: 1, color: ing.protein ? '#A85C32' : '#2A1F1A', fontWeight: ing.protein ? 500 : 400 }}>
                        {ingDisplayName}
                        {ingPrepNote && (
                          <span className="sans" style={{ fontSize: 10, color: '#8B6F47', marginLeft: 4, fontStyle: 'italic' }}>
                            ({ingPrepNote})
                          </span>
                        )}
                        {ing._isAlt && <span style={{ fontSize: 10, marginLeft: 6, padding: '2px 6px', background: '#FAF1DC', color: '#7A5C32', borderRadius: 3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>{INGREDIENT_MODES[ingMode]?.shortLabel || 'alt'}</span>}
                        {ing.protein && <span style={{ fontSize: 10, marginLeft: 6, padding: '2px 6px', background: '#FFF0E0', color: '#A85C32', borderRadius: 3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>protein</span>}
                        {decoder && (
                          <button onClick={() => { setOpenComponent(isOpen ? null : ing.id); setOpenSubstitute(null); }} style={{
                            marginLeft: 8, padding: '2px 8px', background: '#FFF8F2', color: '#A85C32',
                            border: '1px solid #F5C9B0', borderRadius: 12, fontSize: 11, fontWeight: 500,
                            display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer'
                          }}>
                            <Info size={11} />{isOpen ? 'Hide' : 'How to make'}
                          </button>
                        )}
                        {subs && (
                          <button onClick={() => {
                          // Get fresh ingredient from recipe (has _swappedFrom if previously swapped)
                          const freshIng = recipe.ingredients.find(x => x.id === ing.id) || ing;
                          setSwapModal({ ing: freshIng, subs });
                        }} style={{
                            marginLeft: 6, padding: '2px 8px', background: '#F0F5E8', color: '#5C7A3A',
                            border: '1px solid #C5D9A8', borderRadius: 12, fontSize: 11, fontWeight: 500,
                            display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer'
                          }}>
                            <Sparkles size={11} />Swap
                          </button>
                        )}
                      </span>
                    )}
                  </div>
                  {decoder && isOpen && (
                    <div style={{
                      marginTop: 10, marginLeft: 88, padding: '14px 18px',
                      background: '#FFF8F2', border: '1px solid #F5C9B0', borderRadius: 8
                    }}>
                      <div className="serif" style={{ fontSize: 15, fontWeight: 500, color: '#A85C32', marginBottom: 6 }}>{decoder.name}</div>
                      <div style={{ fontSize: 13, color: '#5C4A3A', marginBottom: 10, fontStyle: 'italic' }}>
                        Quick sub: {decoder.quickSub}
                      </div>
                      <div style={{ fontSize: 12, color: '#8B6F47', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 6 }}>From scratch</div>
                      <ul style={{ margin: '0 0 10px', paddingLeft: 18, fontSize: 13, color: '#2A1F1A', lineHeight: 1.6 }}>
                        {decoder.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                      </ul>
                      <div style={{ fontSize: 12, color: '#8B6F47', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 4 }}>Method</div>
                      <p style={{ margin: 0, fontSize: 13, color: '#2A1F1A', lineHeight: 1.6 }}>{decoder.method}</p>
                      {decoder.storeNote && (
                        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#5C4A3A', fontStyle: 'italic' }}>💡 {decoder.storeNote}</p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {editing && (
            <div style={{ marginBottom: 20, padding: 12, background: '#FFF8F2', borderRadius: 6, fontSize: 13, color: '#A85C32', lineHeight: 1.5 }}>
              <Sparkles size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
              Edit a protein and the cooking steps update automatically.
            </div>
          )}

          {/* Phase-grouped method */}
          <h3 className="serif" style={{ fontSize: 18, fontWeight: 500, margin: '24px 0 14px', borderBottom: '1px solid #E8DDC9', paddingBottom: 8 }}>Method</h3>

          {['prep', 'cook', 'plate'].map(phaseKey => {
            const steps = phaseGroups[phaseKey] || [];
            if (steps.length === 0) return null;
            const cfg = phaseConfig[phaseKey];
            const Icon = cfg.icon;
            return (
              <section key={phaseKey} style={{ marginBottom: 28 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', background: cfg.bg, borderRadius: 8, marginBottom: 12,
                  borderLeft: `3px solid ${cfg.color}`
                }}>
                  <Icon size={18} color={cfg.color} strokeWidth={1.8} />
                  <div>
                    <div className="serif" style={{ fontSize: 15, fontWeight: 600, color: cfg.color, lineHeight: 1.2 }}>{cfg.label}</div>
                    <div className="sans" style={{ fontSize: 11, color: '#5C4A3A', letterSpacing: '0.05em' }}>{cfg.desc} · {steps.length} step{steps.length === 1 ? '' : 's'}</div>
                  </div>
                </div>
                <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {steps.map((step) => (
                    <li key={step.id} style={{ display: 'flex', gap: 14 }}>
                      <div className="serif" style={{ fontSize: 22, fontWeight: 500, color: cfg.color, minWidth: 32, lineHeight: 1 }}>{String(step.originalIdx + 1).padStart(2, '0')}</div>
                      <div className="sans" style={{ fontSize: 16, lineHeight: 1.65, flex: 1 }}>
                        {scaleStepText(step.text, scale)}
                        {step.timerSec && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 8, padding: '2px 10px', background: '#F0E6D2', borderRadius: 12, fontSize: 12, color: '#5C4A3A' }}><Clock size={11} />{Math.round(step.timerSec / 60)}m</span>}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}

          {/* Photo gallery */}
          {(() => {
            const recipePhotos = (data.photos || []).filter(p => p.recipe_id === recipe.id);
            if (recipePhotos.length === 0) return null;
            return (
              <section style={{ marginTop: 32 }}>
                <h3 className="serif" style={{ fontSize: 18, fontWeight: 500, margin: '0 0 14px', borderBottom: '1px solid #E8DDC9', paddingBottom: 8 }}>
                  Cooked it ({recipePhotos.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                  {recipePhotos.map(photo => (
                    <div key={photo.id} style={{
                      position: 'relative', borderRadius: 8, overflow: 'hidden',
                      border: '1px solid #E8DDC9', background: '#FAF6EF'
                    }}>
                      <img src={photo.public_url} alt={photo.notes || 'Cooked dish'} style={{
                        width: '100%', height: 140, objectFit: 'cover', display: 'block'
                      }} />
                      {photo.notes && (
                        <div className="sans" style={{ padding: '6px 10px', fontSize: 11, color: '#5C4A3A', fontStyle: 'italic' }}>
                          {photo.notes}
                        </div>
                      )}
                      <div className="sans" style={{ padding: '4px 10px 8px', fontSize: 10, color: '#8B6F47' }}>
                        {new Date(photo.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <button onClick={() => { if (confirm('Delete this photo?')) data.deletePhoto(photo); }} style={{
                        position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13,
                        background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}
        </div>
      </div>

      {/* Ingredient swap modal */}
      {swapModal && (
        <div onClick={() => !swapping && setSwapModal(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(42,31,26,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16, zIndex: 500
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#FAF6EF', borderRadius: 14, padding: '20px 16px',
            maxWidth: 480, width: '100%', maxHeight: '85vh', overflowY: 'auto'
          }}>
            <div style={{ marginBottom: 16 }}>
              <div className="sans" style={{ fontSize: 11, color: '#5C7A3A', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Ingredient swap</div>
              <h2 className="serif" style={{ fontSize: 22, margin: '0 0 4px', color: '#2A1F1A' }}>
                Swapping: {swapModal.ing._swappedFrom || swapModal.ing.name}
              </h2>
              <p className="sans" style={{ fontSize: 13, color: '#5C4A3A', margin: 0, lineHeight: 1.5 }}>
                Choose a substitute. The recipe will update — ingredient list and all step instructions.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {/* Restore original option — only shown if ingredient was previously swapped */}
              {swapModal.ing._swappedFrom && swapModal.ing._swappedFrom !== swapModal.ing.name && (
                <button
                  onClick={() => !swapping && applySwap(swapModal.ing, swapModal.ing._swappedFrom)}
                  disabled={swapping}
                  style={{
                    padding: '14px 16px', borderRadius: 10, cursor: swapping ? 'wait' : 'pointer',
                    background: '#F0F5E8', border: '1px solid #5C7A3A',
                    borderLeft: '4px solid #5C7A3A', textAlign: 'left',
                    opacity: swapping ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div className='sans' style={{ fontSize: 11, color: '#5C7A3A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Restore original</div>
                      <div className='sans' style={{ fontSize: 14, color: '#2A1F1A' }}>{swapModal.ing._swappedFrom}</div>
                    </div>
                    <RotateCcw size={16} color='#5C7A3A' />
                  </div>
                </button>
              )}
              {swapModal.subs.substitutes.map((sub, i) => (
                <button
                  key={i}
                  onClick={() => !swapping && applySwap(swapModal.ing, sub.text)}
                  disabled={swapping}
                  style={{
                    padding: '14px 16px', borderRadius: 10, cursor: swapping ? 'wait' : 'pointer',
                    background: '#fff', border: '1px solid #E8DDC9',
                    borderLeft: `4px solid ${sub.healthier ? '#5C7A3A' : '#A85C32'}`,
                    textAlign: 'left', opacity: swapping ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      {sub.healthier && (
                        <span style={{
                          display: 'inline-block', marginBottom: 6, padding: '2px 7px',
                          background: '#5C7A3A', color: '#fff', borderRadius: 8,
                          fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600
                        }}>Healthier</span>
                      )}
                      <div className="sans" style={{ fontSize: 14, color: '#2A1F1A', lineHeight: 1.5, marginBottom: swapModal.subs.howToMake ? 8 : 0 }}>
                        {sub.text}
                      </div>
                      {swapModal.subs.howToMake && i === 0 && (
                        <div className="sans" style={{
                          fontSize: 12, color: '#5C7A3A', padding: '6px 10px',
                          background: '#F0F5E8', borderRadius: 6, lineHeight: 1.5
                        }}>
                          💡 How to make it: {swapModal.subs.howToMake}
                        </div>
                      )}
                    </div>
                    <ArrowRight size={16} color="#C9B89A" style={{ marginTop: 2, flexShrink: 0 }} />
                  </div>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setSwapModal(null)}
                disabled={swapping}
                style={{
                  flex: 1, padding: '12px 0', background: 'transparent',
                  border: '1px solid #E8DDC9', borderRadius: 8, fontSize: 14,
                  color: '#5C4A3A', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const qtyBtn = { width: 22, height: 22, border: '1px solid #E8DDC9', background: '#fff', borderRadius: 4, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' };

// -------- COOKING MODE --------
// ============================================================
// COOKING MODE — All steps on one page with independent timers
// ============================================================
// Every step visible at once. Each timer runs independently.
// Check steps off as you complete them. Fully flexible — do
// them in any order, run multiple timers simultaneously.

function CookingMode({ recipe, stepIdx, setStepIdx, scale = 1, setView, data, modes }) {
  const { logRecipe: cookedDialogLogNutrition } = useNutritionContext();
  const [showCookedDialog, setShowCookedDialog] = useState(false);
  const [leftoverServings, setLeftoverServings] = useState(0);
  const [leftoverNotes, setLeftoverNotes] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [savingDialog, setSavingDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [autoDeduct, setAutoDeduct] = useState(true);
  const [deductSummary, setDeductSummary] = useState(null);
  // Guards the one-time cook side-effects (log history, deduct pantry, log macros)
  // so that clicking "Save & finish" a second time — after the deduction summary
  // is shown — just closes the dialog instead of re-running everything.
  const cookCommittedRef = useRef(false);

  // Match the detail view: use the global preference only if this recipe supports
  // it, else the recipe's primary method — so timers/mode stay consistent.
  const supportedEquipment = useMemo(() => getSupportedEquipment(recipe), [recipe]);
  const eqMode = supportedEquipment.includes(modes?.equipmentMode) ? modes.equipmentMode : supportedEquipment[0];
  const ingMode = modes?.ingredientMode || 'fresh';

  // Resolve all steps for current equipment/ingredient mode
  const allSteps = useMemo(() => {
    // Keep ORIGINAL recipe order — the recipe author ordered steps intentionally.
    // e.g. "Season chicken (prep)" comes AFTER "Roast veg (cook)" because you do it
    // during the roasting time. Sorting by phase would break this logic.
    return (recipe.steps || []).map(s => fullyResolveStep(s, eqMode, ingMode));
  }, [recipe.steps, eqMode, ingMode]);

  // Per-step timers: { [stepId]: { initial, deadline, running, done } }
  // 'deadline' is an absolute epoch-ms timestamp of when the timer will hit zero.
  // remaining = Math.ceil((deadline - Date.now()) / 1000)
  // This approach survives phone lock: when JS resumes, Date.now() reflects
  // real wall-clock time so the remaining computation is always accurate.
  // Key timers by equipment+ingredient mode: air-fryer steps have different
  // durations than oven, so each mode gets its own persisted timer set instead
  // of reusing stale oven timings.
  const timerStorageKey = `mise_timers_${recipe.id}_${eqMode}_${ingMode}`;

  // Build fresh timers from the MODE-RESOLVED steps, so each timer's duration
  // matches the step text the cook is reading (air-fryer time, not oven time).
  // A resolved timerSec of 0/null (e.g. a "skip in air-fryer" step) gets no timer.
  const buildFreshTimers = (steps) => {
    const t = {};
    for (const s of steps) {
      if (s.timerSec) t[s.id] = { initial: s.timerSec, deadline: null, remaining: s.timerSec, running: false, done: false };
    }
    return t;
  };
  // Restore a persisted set for this key (survives iOS remount on unlock), else fresh.
  const restoreTimers = (key, steps) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        for (const id of Object.keys(parsed)) {
          const t = parsed[id];
          if (t.running && t.deadline) {
            const remaining = Math.max(0, Math.ceil((t.deadline - now) / 1000));
            parsed[id] = remaining <= 0
              ? { ...t, remaining: 0, running: false, done: true }
              : { ...t, remaining };
          }
        }
        return parsed;
      }
    } catch {}
    return buildFreshTimers(steps);
  };

  const [timers, setTimers] = useState(() => restoreTimers(timerStorageKey, allSteps));

  // When the equipment/ingredient mode changes the storage key changes too —
  // reload that mode's timers (or build fresh from the resolved steps) so the
  // countdowns and progress bar stay in sync with the displayed step.
  const timerKeyRef = useRef(timerStorageKey);
  useEffect(() => {
    if (timerKeyRef.current !== timerStorageKey) {
      timerKeyRef.current = timerStorageKey;
      setTimers(restoreTimers(timerStorageKey, allSteps));
    }
  }, [timerStorageKey, allSteps]);

  // Checked steps (completed)
  const [checked, setChecked] = useState(new Set());

  // Persist timers to sessionStorage so phone-lock remounts restore correctly
  React.useEffect(() => {
    try { localStorage.setItem(timerStorageKey, JSON.stringify(timers)); } catch {}
  }, [timers, timerStorageKey]);

  // Timer storage is cleaned up when the user finishes cooking (not on unmount)
  // because iOS may unmount/remount on lock-screen without the user intending to stop

  const intervalRef = useRef(null);
  const fireAlarm = () => {
    try { navigator.vibrate && navigator.vibrate([300, 100, 300, 100, 600]); } catch {}
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.35, 0.7].forEach(delay => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
        o.start(ctx.currentTime + delay); o.stop(ctx.currentTime + delay + 0.35);
      });
    } catch {}
  };

  // Tick every second — recomputes remaining from deadline for each running timer.
  // Using deadline (absolute timestamp) means phone-lock doesn't lose time:
  // when JS resumes, Date.now() is accurate and remaining is always correct.
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      setTimers(prev => {
        let anyRunning = false;
        for (const t of Object.values(prev)) {
          if (t.running && !t.done) { anyRunning = true; break; }
        }
        if (!anyRunning) return prev;

        const next = { ...prev };
        for (const id of Object.keys(next)) {
          const t = next[id];
          if (!t.running || t.done || !t.deadline) continue;
          const remaining = Math.max(0, Math.ceil((t.deadline - now) / 1000));
          if (remaining <= 0) {
            next[id] = { ...t, remaining: 0, running: false, done: true };
            setTimeout(fireAlarm, 0); // outside setState
          } else {
            next[id] = { ...t, remaining };
          }
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const toggleTimer = (stepId, timerSec) => {
    setTimers(prev => {
      const t = prev[stepId] || { initial: timerSec, deadline: null, remaining: timerSec, running: false, done: false };
      if (t.done) {
        // Reset to full duration
        return { ...prev, [stepId]: { initial: timerSec, deadline: null, remaining: timerSec, running: false, done: false } };
      }
      if (t.running) {
        // Pause: freeze current remaining, clear deadline
        const remaining = t.deadline ? Math.max(0, Math.ceil((t.deadline - Date.now()) / 1000)) : t.remaining;
        return { ...prev, [stepId]: { ...t, remaining, deadline: null, running: false } };
      } else {
        // Start/resume: set deadline = now + remaining seconds
        const deadline = Date.now() + (t.remaining * 1000);
        return { ...prev, [stepId]: { ...t, deadline, running: true } };
      }
    });
  };

  const fmt = (sec) => {
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const phaseConfig = {
    prep: { label: 'Prep', color: '#5C7A3A', bg: '#F0F5E8', border: '#C5D9A8' },
    cook: { label: 'Cook', color: '#A85C32', bg: '#FFF0E0', border: '#F5C9B0' },
    plate: { label: 'Plate', color: '#7A5C32', bg: '#FAF1DC', border: '#E8D5AA' }
  };

  const totalChecked = checked.size;
  const totalSteps = allSteps.length;

  // Parallel time savings
  const cookPlan = useMemo(() => buildCookPlan(allSteps), [allSteps]);
  const savedMin = cookPlan.hasParallelism ? Math.round(cookPlan.savedMinutes) : 0;

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => setView('recipe')} style={{
          background: 'transparent', border: 'none', color: '#8B6F47',
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, padding: 0, cursor: 'pointer'
        }}><ArrowLeft size={16} />Exit</button>
        <div style={{ flex: 1 }}>
          <div className="serif" style={{ fontSize: 18, fontWeight: 500, color: '#2A1F1A', lineHeight: 1.2 }}>{recipe.title}</div>
          <div className="sans" style={{ fontSize: 12, color: '#8B6F47', marginTop: 2 }}>
            {totalChecked}/{totalSteps} steps done
            {savedMin > 0 && <span style={{ marginLeft: 8, color: '#5C7A3A', fontWeight: 500 }}>· save ~{savedMin}m by running timers together</span>}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 5, background: '#F0E6D2', borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#5C7A3A', width: `${totalSteps > 0 ? (totalChecked / totalSteps) * 100 : 0}%`, transition: 'width 0.4s' }} />
      </div>

      {/* All steps in original recipe order — phase badges on each card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {allSteps.map((step, idx) => {
          const thisPhase = step.phase || 'cook';
          // Show a "while X cooks" hint when a prep step immediately follows a cook step with a timer
          const prevStep = idx > 0 ? allSteps[idx - 1] : null;
          const prevHasTimer = prevStep && prevStep.timerSec && prevStep.timerSec >= 180;
          const showParallelHint = thisPhase === 'prep' && prevStep && (prevStep.phase || 'cook') === 'cook' && prevHasTimer;
          const parallelHintText = showParallelHint
            ? `⏱ Do this while ${prevStep.text.split(' ').slice(0, 4).join(' ').toLowerCase()}… is going`
            : null;
          const phaseLabel = { prep: '🥣 Prep', cook: '🔥 Cook', plate: '🍽️ Plate & serve' }[thisPhase] || thisPhase;
          const phaseStepCount = 0; // no longer grouping
          const phase = phaseConfig[step.phase || 'cook'] || phaseConfig.cook;
          const timer = timers[step.id];
          const isChecked = checked.has(step.id);
          const bullets = splitStepIntoBullets(step.text);
          // Drive the bar off the timer's own starting duration (not step.timerSec)
          // and clamp, so it can't render inverted/overfull if the two ever diverge.
          const pct = timer && timer.initial > 0 ? Math.max(0, Math.min(100, ((timer.initial - timer.remaining) / timer.initial) * 100)) : 0;

          return (
            <React.Fragment key={step.id}>
            {/* Parallel hint — shown when this prep step can be done while previous cook step runs */}
            {parallelHintText && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 12px', background: '#FFF8F2',
                border: '1px solid #F5C9B0', borderRadius: 8,
                marginTop: 4
              }}>
                <Sparkles size={12} color="#A85C32" />
                <span className="sans" style={{ fontSize: 12, color: '#5C4A3A', fontStyle: 'italic' }}>
                  {parallelHintText}
                </span>
              </div>
            )}
            {isChecked ? (
              // Collapsed view for completed steps
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', background: '#F0F5E8',
                border: '1px solid #C5D9A8', borderLeft: '4px solid #5C7A3A',
                borderRadius: 8, cursor: 'pointer'
              }}
              onClick={() => setChecked(prev => { const n = new Set(prev); n.delete(step.id); return n; })}
              >
                <Check size={14} color="#5C7A3A" style={{ flexShrink: 0 }} />
                <span className="sans" style={{ fontSize: 13, color: '#5C7A3A', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {step.text.split('.')[0].slice(0, 60)}{step.text.split('.')[0].length > 60 ? '…' : ''}
                </span>
                <span className="sans" style={{ fontSize: 10, color: '#5C7A3A', opacity: 0.6, flexShrink: 0 }}>tap to undo</span>
              </div>
            ) : (
            <div style={{
              background: '#fff',
              border: `1px solid ${phase.border}`,
              borderLeft: `4px solid ${phase.color}`,
              borderRadius: 10,
              padding: '14px 16px',
              transition: 'border-color 0.3s'
            }}>
              {/* Step header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                {/* Check circle */}
                <button
                  onClick={() => setChecked(prev => { const n = new Set(prev); isChecked ? n.delete(step.id) : n.add(step.id); return n; })}
                  style={{
                    flexShrink: 0, width: 26, height: 26, borderRadius: 13, border: 'none',
                    background: isChecked ? '#5C7A3A' : phase.bg,
                    border: `2px solid ${isChecked ? '#5C7A3A' : phase.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', marginTop: 2
                  }}
                >
                  {isChecked
                    ? <Check size={14} color="#fff" />
                    : <span className="sans" style={{ fontSize: 11, fontWeight: 700, color: phase.color }}>{idx + 1}</span>
                  }
                </button>

                {/* Phase badge */}
                <span style={{
                  flexShrink: 0, fontSize: 10, padding: '2px 7px',
                  background: phase.bg, color: phase.color,
                  borderRadius: 8, fontWeight: 600, letterSpacing: '0.08em',
                  textTransform: 'uppercase', marginTop: 4
                }}>{phase.label}</span>
                {/* Time estimate for active steps without a countdown timer */}
                {!timer && step.phase !== 'plate' && (
                  <span className="sans" style={{ fontSize: 10, color: '#8B6F47', marginTop: 5, flexShrink: 0 }}>
                    {step.text.toLowerCase().includes('stir constantly') || step.text.toLowerCase().includes('toss') ? '~2 min' :
                     step.text.toLowerCase().includes('sear') || step.text.toLowerCase().includes('brown') ? '~4 min' :
                     step.text.toLowerCase().includes('chop') || step.text.toLowerCase().includes('slice') || step.text.toLowerCase().includes('dice') || step.text.toLowerCase().includes('mince') ? '~3 min' :
                     step.text.toLowerCase().includes('whisk') || step.text.toLowerCase().includes('mix') || step.text.toLowerCase().includes('toss') ? '~2 min' :
                     step.text.toLowerCase().includes('preheat') ? '~1 min' : null}
                  </span>
                )}

                {/* Timer controls — inline with header */}
                {timer && (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <div className="serif" style={{
                      fontSize: 20, fontVariantNumeric: 'tabular-nums', fontWeight: 600,
                      color: timer.done ? '#5C7A3A' : timer.remaining < 60 && timer.running ? '#A85C32' : '#2A1F1A',
                      minWidth: 46, textAlign: 'right'
                    }}>
                      {timer.done ? '✓' : fmt(timer.remaining)}
                    </div>
                    <button
                      onClick={() => toggleTimer(step.id, step.timerSec)}
                      style={{
                        width: 32, height: 32, borderRadius: 16,
                        background: timer.done ? '#F0E6D2' : timer.running ? '#FFF0E0' : phase.color,
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      {timer.done
                        ? <RotateCcw size={13} color="#8B6F47" />
                        : timer.running
                          ? <Pause size={13} color="#A85C32" />
                          : <Play size={13} color="#fff" />
                      }
                    </button>
                  </div>
                )}
              </div>

              {/* Timer progress bar */}
              {timer && !timer.done && timer.initial > 0 && (
                <div style={{ height: 3, background: '#F0E6D2', borderRadius: 2, margin: '0 0 10px 36px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: phase.color, width: `${pct}%`, transition: 'width 1s linear' }} />
                </div>
              )}

              {/* Step text — bulleted */}
              <div style={{ paddingLeft: 28, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(bullets.length > 1 ? bullets : [step.text]).map((line, i) => {
                  const segs = highlightInStep(line);
                  return (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      {bullets.length > 1 && (
                        <span style={{ width: 5, height: 5, borderRadius: 3, background: phase.color, flexShrink: 0, marginTop: 8 }} />
                      )}
                      <span className="sans" style={{ fontSize: 15, color: '#2A1F1A', lineHeight: 1.55, textDecoration: isChecked ? 'line-through' : 'none' }}>
                        {segs.map((seg, j) => seg.type === 'highlight'
                          ? <mark key={j} style={{ background: phase.bg, color: phase.color, padding: '1px 5px', borderRadius: 3, fontWeight: 600 }}>{seg.value}</mark>
                          : <span key={j}>{seg.value}</span>
                        )}
                      </span>
                    </div>
                  );
                })}

                {/* Prep note — shows where this prep output goes */}
                {step.prepNote && !isChecked && (
                  <div style={{
                    marginTop: 8, padding: '6px 10px',
                    background: phase.bg, borderRadius: 6,
                    display: 'flex', alignItems: 'flex-start', gap: 6
                  }}>
                    <span style={{ fontSize: 12 }}>💡</span>
                    <span className="sans" style={{ fontSize: 12, color: phase.color, lineHeight: 1.4, fontStyle: 'italic' }}>
                      {step.prepNote}
                    </span>
                  </div>
                )}

                {/* parallelTask hint — shown when timer is long */}
                {(() => {
                  const parallel = detectParallelTask(step, allSteps, idx);
                  if (!parallel.hasParallel || isChecked) return null;
                  return (
                    <div style={{
                      marginTop: 8, padding: '6px 10px',
                      background: '#FFF8F2', border: '1px solid #F5C9B0',
                      borderRadius: 6, display: 'flex', gap: 6, alignItems: 'flex-start'
                    }}>
                      <Sparkles size={13} color="#A85C32" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span className="sans" style={{ fontSize: 12, color: '#5C4A3A', lineHeight: 1.4 }}>
                        {parallel.suggestion}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
            )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Done cooking button */}
      <button
        onClick={() => { setLeftoverServings(0); setDeductSummary(null); cookCommittedRef.current = false; setShowCookedDialog(true); }}
        style={{
          marginTop: 24, width: '100%', padding: '16px 24px',
          background: totalChecked === totalSteps ? '#5C7A3A' : '#2A1F1A',
          color: '#FAF6EF', border: 'none', borderRadius: 12,
          fontSize: 16, fontWeight: 500, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}
      >
        <Check size={18} />
        {totalChecked === totalSteps ? 'All done — log this meal!' : `Done cooking (${totalChecked}/${totalSteps} checked)`}
      </button>



      {/* Cooked-it dialog */}
      {showCookedDialog && (
        <div onClick={() => setShowCookedDialog(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(42,31,26,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 14, padding: 28, maxWidth: 420, width: '100%', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, margin: '0 0 6px' }}>Nice cooking!</h2>
            <p className="sans" style={{ fontSize: 14, color: '#5C4A3A', margin: '0 0 20px' }}>How did it go?</p>

            {/* Rating */}
            <div style={{ marginBottom: 20 }}>
              <div className="sans" style={{ fontSize: 12, color: '#8B6F47', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rating</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setRating(n)} style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 28, lineHeight: 1,
                    opacity: n <= rating ? 1 : 0.3, transition: 'opacity 0.15s'
                  }}>⭐</button>
                ))}
              </div>
            </div>

            {/* Leftovers */}
            <div style={{ marginBottom: 16 }}>
              <div className="sans" style={{ fontSize: 12, color: '#8B6F47', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Leftovers to save?</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => setLeftoverServings(Math.max(0, leftoverServings - 1))} style={{ width: 32, height: 32, borderRadius: 16, border: '1px solid #E8DDC9', background: '#fff', fontSize: 18, cursor: 'pointer' }}>−</button>
                <span className="serif" style={{ fontSize: 20, minWidth: 40, textAlign: 'center' }}>{leftoverServings}</span>
                <button onClick={() => setLeftoverServings(leftoverServings + 1)} style={{ width: 32, height: 32, borderRadius: 16, border: '1px solid #E8DDC9', background: '#fff', fontSize: 18, cursor: 'pointer' }}>+</button>
                <span className="sans" style={{ fontSize: 13, color: '#8B6F47' }}>serving{leftoverServings !== 1 ? 's' : ''}</span>
              </div>
              {leftoverServings > 0 && (
                <textarea
                  placeholder="Notes (e.g. 'in the blue container')"
                  value={leftoverNotes}
                  onChange={e => setLeftoverNotes(e.target.value)}
                  rows={2}
                  style={{ width: '100%', marginTop: 8, padding: '8px 10px', border: '1px solid #E8DDC9', borderRadius: 6, fontSize: 13, resize: 'none', boxSizing: 'border-box' }}
                />
              )}
            </div>

            {/* Auto-deduct */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '10px 14px', background: '#FAF6EF', borderRadius: 8 }}>
              <input type="checkbox" checked={autoDeduct} onChange={e => setAutoDeduct(e.target.checked)} id="autoDeductCB" style={{ width: 16, height: 16 }} />
              <label htmlFor="autoDeductCB" className="sans" style={{ fontSize: 13, color: '#2A1F1A', cursor: 'pointer' }}>
                Deduct ingredients from pantry automatically
              </label>
            </div>

            {deductSummary && deductSummary.length > 0 && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: '#F0F5E8', border: '1px solid #C5D9A8', borderRadius: 8 }}>
                <div className="sans" style={{ fontSize: 11, color: '#5C7A3A', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Deducted from pantry</div>
                {deductSummary.map((d, i) => (
                  <div key={i} className="sans" style={{ fontSize: 12, color: '#5C4A3A' }}>
                    − {d.consumed} {d.unit} {d.ingName}
                  </div>
                ))}
              </div>
            )}

            <button
              disabled={savingDialog}
              onClick={async () => {
                setSavingDialog(true);
                try {
                  // Run the cook side-effects exactly once. On a second click (after
                  // the deduction summary is shown) this block is skipped and we fall
                  // straight through to closing the dialog.
                  if (!cookCommittedRef.current) {
                    const { data: sess } = await supabase.auth.getSession();
                    const uid = sess?.session?.user?.id || null;
                    const totalServings = Math.round(recipe.servings * scale);
                    if (data?.logCooking) {
                      await data.logCooking(recipe.id, totalServings, rating || null, leftoverNotes.trim() || null, uid);
                    }
                    if (leftoverServings > 0 && data?.addLeftover) {
                      await data.addLeftover(recipe.id, leftoverServings, leftoverNotes.trim() || null);
                    }
                    // Log macros BEFORE the pantry-summary early return, so a cooked
                    // meal always counts toward the day's goals (previously this was
                    // skipped whenever auto-deduct found pantry items to subtract).
                    if (cookedDialogLogNutrition) {
                      try { await cookedDialogLogNutrition(recipe, totalServings); } catch {}
                    }
                    let summary = [];
                    if (autoDeduct && data) {
                      const { autoDeductPantry } = await import('../lib/kitchen-ops');
                      summary = await autoDeductPantry(recipe, scale, data.pantry, data);
                      setDeductSummary(summary);
                    }
                    cookCommittedRef.current = true;
                    // Show the "deducted from pantry" summary first; the next click closes.
                    if (summary.length > 0) { setSavingDialog(false); return; }
                  }
                } catch (e) { console.error(e); }
                setSavingDialog(false);
                setShowCookedDialog(false);
                try { localStorage.removeItem(timerStorageKey); } catch {}
                setView('home');
              }}
              style={{
                width: '100%', padding: '14px 24px',
                background: '#5C7A3A', color: '#FAF6EF', border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 500, cursor: savingDialog ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: savingDialog ? 0.7 : 1
              }}
            >
              {savingDialog ? <><Loader2 size={16} className="spin" />Saving…</> : <><Check size={16} />Save & finish</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// -------- WEEK VIEW --------
function WeekView({ data, setView, setActiveRecipeId }) {
  // Build day labels with actual dates starting from the current week's Monday
  const days = (() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((name, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday = d.toDateString() === today.toDateString();
      const dateStr = d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
      return { code: name, label: name, dateStr, isToday };
    });
  })();

  // Compute weekly summary
  const summary = useMemo(() => {
    const orderedPlans = days
      .flatMap(d => data.weekPlan.filter(w => w.day === d))
      .map(w => ({ plan: w, recipe: data.recipes.find(r => r.id === w.recipe_id) }))
      .filter(x => x.recipe);

    let totalCals = 0;
    let totalProtein = 0;
    const proteins = [];
    const cuisines = new Set();

    orderedPlans.forEach(({ plan, recipe }) => {
      const nut = recipe.nutrition;  // real per-serving macros from the DB recipe
      if (nut) {
        totalCals += (nut.calories || 0) * plan.servings;
        totalProtein += (nut.protein || 0) * plan.servings;
      }
      proteins.push(getPrimaryProtein(recipe));
      (recipe.tags || []).forEach(t => {
        if (['asian','italian','mexican','tex-mex','indian','moroccan','mediterranean','american','korean','vietnamese','chinese','peruvian','portuguese'].includes(t)) {
          cuisines.add(t);
        }
      });
    });

    // Find variety problems: same protein 2+ days in a row
    const varietyIssues = [];
    for (let i = 1; i < proteins.length; i++) {
      if (proteins[i] === proteins[i-1] && proteins[i] !== 'other') {
        varietyIssues.push(proteins[i]);
      }
    }

    return {
      totalMeals: orderedPlans.length,
      totalCals: Math.round(totalCals),
      totalProtein: Math.round(totalProtein),
      uniqueProteins: new Set(proteins.filter(p => p !== 'other')).size,
      uniqueCuisines: cuisines.size,
      varietyIssues: [...new Set(varietyIssues)]
    };
  }, [data.weekPlan, data.recipes]);

  const { targets } = useNutritionContext();

  // Per-day macro forecast from the planned meals, vs the user's daily targets.
  const forecast = (() => {
    const perDay = days.map(dayObj => {
      const code = typeof dayObj === 'string' ? dayObj : dayObj.code;
      const dayPlans = data.weekPlan.filter(w => w.day === code);
      const m = projectDailyMacros(dayPlans, data.recipes);
      return { code, calories: Math.round(m.calories), protein: Math.round(m.protein), fiber: Math.round(m.fiber), hasMeals: dayPlans.length > 0 };
    });
    const planned = perDay.filter(d => d.hasMeals && (d.calories > 0 || d.protein > 0));
    const n = planned.length || 1;
    const avg = {
      calories: Math.round(planned.reduce((a, d) => a + d.calories, 0) / n),
      protein: Math.round(planned.reduce((a, d) => a + d.protein, 0) / n),
      fiber: Math.round(planned.reduce((a, d) => a + d.fiber, 0) / n),
    };
    return { perDay, avg, plannedCount: planned.length, hasData: planned.length > 0 };
  })();

  return (
    <div className="fade-in">
      <PageHeader kicker="Weekly plan" title="This week" subtitle={`${data.weekPlan.length} meal${data.weekPlan.length === 1 ? '' : 's'} scheduled`} />

      {/* Quick "Plan smart week" CTA when empty */}
      {data.weekPlan.length === 0 && (
        <EmptyCard onClick={() => setView('recipes')}><Calendar size={20} /><div>No meals planned yet — browse recipes or hit "Plan smart week" for a full 21-meal week</div></EmptyCard>
      )}

      {/* Weekly summary */}
      {data.weekPlan.length > 0 && (
        <div style={{
          background: '#fff', border: '1px solid #E8DDC9', borderRadius: 10,
          padding: '14px 16px', marginBottom: 14, display: 'flex', gap: 18, flexWrap: 'wrap'
        }}>
          <div>
            <div className="sans" style={{ fontSize: 10, color: '#8B6F47', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Meals</div>
            <div className="serif" style={{ fontSize: 22, fontWeight: 500, color: '#A85C32', marginTop: 2, lineHeight: 1 }}>{summary.totalMeals}</div>
          </div>
          {summary.totalCals > 0 && (
            <>
              <div>
                <div className="sans" style={{ fontSize: 10, color: '#8B6F47', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total cal</div>
                <div className="serif" style={{ fontSize: 22, fontWeight: 500, marginTop: 2, lineHeight: 1 }}>~{(summary.totalCals/1000).toFixed(1)}k</div>
              </div>
              <div>
                <div className="sans" style={{ fontSize: 10, color: '#8B6F47', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total protein</div>
                <div className="serif" style={{ fontSize: 22, fontWeight: 500, marginTop: 2, lineHeight: 1 }}>{summary.totalProtein}g</div>
              </div>
            </>
          )}
          <div>
            <div className="sans" style={{ fontSize: 10, color: '#8B6F47', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Variety</div>
            <div className="serif" style={{ fontSize: 16, fontWeight: 500, marginTop: 2, color: '#5C7A3A' }}>
              {summary.uniqueProteins} protein{summary.uniqueProteins === 1 ? '' : 's'} · {summary.uniqueCuisines} cuisine{summary.uniqueCuisines === 1 ? '' : 's'}
            </div>
          </div>
        </div>
      )}

      {/* Weekly macro forecast — projected from planned meals vs daily targets */}
      {data.weekPlan.length > 0 && forecast.hasData && targets && (
        <div style={{ background: '#fff', border: '1px solid #E8DDC9', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
          <div className="sans" style={{ fontSize: 10, color: '#8B6F47', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            Weekly forecast · avg/day across {forecast.plannedCount} planned day{forecast.plannedCount === 1 ? '' : 's'}
          </div>
          {[
            { label: 'Protein', val: forecast.avg.protein, target: targets.protein_target, unit: 'g', color: '#A85C32' },
            { label: 'Calories', val: forecast.avg.calories, target: targets.calories_target, unit: '', color: '#5C4A3A' },
            { label: 'Fiber', val: forecast.avg.fiber, target: targets.fiber_target, unit: 'g', color: '#5C7A3A' },
          ].map(m => {
            const pct = m.target ? Math.min(100, Math.round((m.val / m.target) * 100)) : 0;
            return (
              <div key={m.label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#5C4A3A', marginBottom: 3 }}>
                  <span className="sans">{m.label}</span>
                  <span className="sans"><strong style={{ color: m.color }}>{m.val}{m.unit}</strong> / {m.target}{m.unit} avg/day</span>
                </div>
                <div style={{ height: 6, background: '#F0E6D2', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: m.color, borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
          <div style={{ display: 'flex', gap: 4, marginTop: 12, alignItems: 'flex-end' }}>
            {forecast.perDay.map(d => {
              const t = targets.protein_target || 190;
              const h = Math.max(3, Math.min(100, (d.protein / t) * 100));
              const hit = d.protein >= t * 0.9;
              return (
                <div key={d.code} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: '100%', height: 32, display: 'flex', alignItems: 'flex-end' }}>
                    <div title={`${d.protein}g protein`} style={{ width: '100%', height: `${h}%`, background: d.hasMeals ? (hit ? '#5C7A3A' : '#D9A15C') : '#F0E6D2', borderRadius: '3px 3px 0 0' }} />
                  </div>
                  <span className="sans" style={{ fontSize: 9, color: '#8B6F47' }}>{d.code[0]}</span>
                </div>
              );
            })}
          </div>
          <div className="sans" style={{ fontSize: 10, color: '#A89379', marginTop: 6, fontStyle: 'italic' }}>Protein per planned day vs target — bars turn green at 90%+ of goal.</div>
        </div>
      )}

      {/* Variety warning */}
      {summary.varietyIssues.length > 0 && (
        <div style={{
          background: '#FFF8E8', border: '1px solid #E8C977', borderRadius: 8,
          padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#7A5C32',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <AlertCircle size={14} />
          <span>Same protein 2 days in a row: {summary.varietyIssues.join(', ')}. Consider mixing it up.</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        {days.map(dayObj => {
        const day = typeof dayObj === 'string' ? dayObj : dayObj.code;
          const dayPlans = data.weekPlan.filter(w => w.day === day);
          const slotOrder = ['breakfast', 'lunch', 'dinner'];
          const slotLabels = { breakfast: '🌅 Breakfast', lunch: '🥗 Lunch', dinner: '🍽️ Dinner' };
          return (
            <div key={day} style={{
              background: '#fff',
              border: `1px solid ${dayObj.isToday ? '#A85C32' : '#E8DDC9'}`,
              borderRadius: 10, padding: 12
            }}>
              <div style={{ marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #F0E6D2' }}>
                <div className="serif" style={{ fontSize: 16, fontWeight: 500, color: dayObj.isToday ? '#A85C32' : '#2A1F1A' }}>
                  {day}
                  {dayObj.isToday && <span className="sans" style={{ fontSize: 10, marginLeft: 6, padding: '1px 6px', background: '#A85C32', color: '#FAF6EF', borderRadius: 8, verticalAlign: 'middle', fontWeight: 600 }}>Today</span>}
                </div>
                <div className="sans" style={{ fontSize: 10, color: '#8B6F47', marginTop: 1 }}>{dayObj.dateStr}</div>
              </div>
              {slotOrder.map(slot => {
                const slotPlans = dayPlans.filter(w => (w.meal_slot || 'dinner') === slot);
                return (
                  <div key={slot} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: '#8B6F47', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
                      {slotLabels[slot]}
                    </div>
                    {slotPlans.length === 0 && (
                      <div style={{
                        fontSize: 11, color: '#A89379', fontStyle: 'italic',
                        padding: '6px 8px', background: '#FAF4E9', borderRadius: 6,
                        border: '1px dashed #E8DDC9'
                      }}>
                        — empty —
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {slotPlans.map(w => {
                  const r = data.recipes.find(x => x.id === w.recipe_id);
                  if (!r) return null;
                  const nut = r.nutrition;
                  return (
                    <div key={w.id} style={{
                      background: '#FAF6EF', borderRadius: 8, padding: 10, position: 'relative'
                    }}>
                      <button
                        onClick={() => data.removeFromWeek(w.id)}
                        aria-label="Remove from week"
                        style={{
                          position: 'absolute', top: 6, right: 6,
                          width: 30, height: 30, borderRadius: 15,
                          border: 'none', background: '#FFE4D6', color: '#A85C32',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', padding: 0,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        <X size={16} strokeWidth={2.5} />
                      </button>

                      <button
                        onClick={() => { setActiveRecipeId(r.id); setView('recipe'); }}
                        style={{ background: 'transparent', border: 'none', padding: 0, textAlign: 'left', width: '100%', paddingRight: 32 }}
                      >
                        <div style={{ fontSize: 22, marginBottom: 4 }}>{r.image || '🍽️'}</div>
                        <div className="serif" style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, marginBottom: 4 }}>{r.title}</div>
                        <div className="sans" style={{ fontSize: 10, color: '#8B6F47', display: 'flex', gap: 6, marginBottom: 2 }}>
                          <span><Clock size={9} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 2 }} />{r.timeMin || 30}m</span>
                          {nut && <><span>·</span><span>~{nut.calories} cal</span><span>·</span><span>{nut.protein}g protein</span></>}
                        </div>
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                        <button
                          onClick={() => data.updateWeekServings(w.id, Math.max(1, w.servings - 1))}
                          style={miniQty}
                          aria-label="Fewer servings"
                        >−</button>
                        <span style={{ fontSize: 11, color: '#5C4A3A', flex: 1, textAlign: 'center', fontWeight: 500 }}>
                          {w.servings} serv
                        </span>
                        <button
                          onClick={() => data.updateWeekServings(w.id, w.servings + 1)}
                          style={miniQty}
                          aria-label="More servings"
                        >+</button>
                      </div>

                      <select
                        value={w.day}
                        onChange={e => { if (e.target.value !== w.day) data.updateWeekDay(w.id, e.target.value); }}
                        style={{
                          marginTop: 6, width: '100%', fontSize: 11, padding: '4px 6px',
                          border: '1px solid #E8DDC9', borderRadius: 4, background: '#fff', color: '#5C4A3A'
                        }}
                      >
                        {days.map(d => <option key={d} value={d}>{d === w.day ? `On ${d}` : `Move to ${d}`}</option>)}
                      </select>
                    </div>
                  );
                })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
const miniQty = { width: 26, height: 26, border: '1px solid #E8DDC9', background: '#fff', borderRadius: 4, fontSize: 14, padding: 0, fontWeight: 500, color: '#5C4A3A', cursor: 'pointer' };

// -------- GROCERY VIEW --------
function GroceryView({ groceryList, data, household }) {
  // Persist checked state to localStorage so closing the tab or phone-lock
  // doesn't erase what you've shopped for. Keyed per household.
  const householdId = household?.id || 'default';
  const storageKey = `mise_grocery_checked_${householdId}`;
  const [checked, setChecked] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(checked)); } catch {}
  }, [checked, storageKey]);

  const [hideChecked, setHideChecked] = useState(false);

  // Review modal — appears when user taps "Done shopping" with checked items
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewItems, setReviewItems] = useState([]);
  const [addingToPantry, setAddingToPantry] = useState(false);
  const [pantryToast, setPantryToast] = useState('');

  const toggleItem = (name, unit) => {
    const key = name + (unit || 'unit');
    setChecked(c => ({ ...c, [key]: !c[key] }));
  };
  const needed = groceryList.filter(g => g.need > 0);
  const covered = groceryList.filter(g => g.need === 0 && g.qty > 0);

  // Sections grouped by aisle, in shop-friendly order
  const sections = useMemo(() => groupByAisle(needed), [needed]);

  // Keep screen awake while on the grocery list
  useEffect(() => {
    let lock;
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(l => { lock = l; }).catch(() => {});
    }
    return () => { try { lock && lock.release(); } catch {} };
  }, []);

  const totalChecked = Object.values(checked).filter(Boolean).length;
  const total = needed.length;
  const allDone = total > 0 && totalChecked === total;

  // Build the review list from currently-checked items
  const startReview = () => {
    const items = needed
      .filter(item => checked[item.name + (item.unit || 'unit')])
      .map(item => ({
        name: item.name,
        qty: item.need,
        unit: item.unit
      }));
    if (items.length === 0) {
      alert('Check off the items you bought first.');
      return;
    }
    setReviewItems(items);
    setReviewOpen(true);
  };

  // Commit the review items into the pantry. For each item, look for an existing
  // pantry row with matching name (case-insensitive) and unit. If found, increment
  // qty. Otherwise, add a new row.
  const commitToPantry = async () => {
    if (!data?.addPantry || !data?.updatePantry) {
      alert('Pantry not available — try reloading.');
      return;
    }
    setAddingToPantry(true);
    try {
      const existingPantry = data.pantry || [];
      for (const item of reviewItems) {
        if (!item.name?.trim() || !item.qty || Number(item.qty) <= 0) continue;
        const match = existingPantry.find(p =>
          p.name.toLowerCase().trim() === item.name.toLowerCase().trim()
          && (p.unit || 'unit') === (item.unit || 'unit')
        );
        if (match) {
          await data.updatePantry(match.id, { qty: (Number(match.qty) || 0) + Number(item.qty) });
        } else {
          await data.addPantry(item.name.trim(), Number(item.qty), item.unit || 'unit');
        }
      }
      // Clear checks for items we just added
      const addedCount = reviewItems.length;
      setChecked(prev => {
        const next = { ...prev };
        for (const item of reviewItems) {
          delete next[item.name + (item.unit || 'unit')];
        }
        return next;
      });
      setReviewOpen(false);
      setReviewItems([]);
      setPantryToast(`✓ ${addedCount} item${addedCount === 1 ? '' : 's'} added to pantry`);
    } catch (e) {
      alert('Failed to add to pantry: ' + (e.message || 'unknown error'));
    }
    setAddingToPantry(false);
  };

  const clearAllChecks = () => {
    if (totalChecked === 0) return;
    if (!confirm(`Uncheck all ${totalChecked} items?`)) return;
    setChecked({});
  };

  return (
    <div className="fade-in">
      <PageHeader
        kicker="Shopping"
        title="Grocery list"
        subtitle={`${needed.length} to buy${covered.length > 0 ? ' · ' + covered.length + ' in pantry' : ''}`}
      />

      {needed.length === 0 ? (
        <EmptyCard><Check size={20} /><div>Nothing needed. Plan some meals.</div></EmptyCard>
      ) : (
        <>
          {/* Toolbar */}
          <div style={{
            display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setHideChecked(!hideChecked)}
              style={{
                padding: '10px 14px', borderRadius: 8,
                background: hideChecked ? '#2A1F1A' : '#fff',
                color: hideChecked ? '#FAF6EF' : '#5C4A3A',
                border: hideChecked ? 'none' : '1px solid #E8DDC9',
                fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
              }}
            >
              {hideChecked ? <Check size={12} /> : null}
              Hide checked
            </button>
            {totalChecked > 0 && (
              <button
                onClick={startReview}
                style={{
                  padding: '10px 16px', borderRadius: 8,
                  background: '#5C7A3A', color: '#FAF6EF', border: 'none',
                  fontSize: 14, fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
                }}
              >
                <Package size={14} />Done shopping ({totalChecked})
              </button>
            )}
            {totalChecked > 0 && (
              <button
                onClick={clearAllChecks}
                title="Uncheck all items"
                style={{
                  padding: '10px 12px', borderRadius: 8,
                  background: 'transparent', color: '#8B6F47',
                  border: '1px solid #E8DDC9',
                  fontSize: 13, display: 'flex', alignItems: 'center', gap: 4
                }}
              >
                <X size={12} />Clear
              </button>
            )}
            <div style={{ flex: 1 }} />
            <div className="sans" style={{ fontSize: 12, color: '#8B6F47' }}>
              {totalChecked}/{total} checked
            </div>
          </div>

          {/* Progress bar */}
          <div style={{
            height: 8, background: '#F0E6D2', borderRadius: 4, overflow: 'hidden',
            marginBottom: 18
          }}>
            <div style={{
              height: '100%', width: `${total > 0 ? (totalChecked / total) * 100 : 0}%`,
              background: allDone ? '#5C7A3A' : '#A85C32', transition: 'width 0.3s'
            }} />
          </div>

          {allDone && (
            <div style={{
              background: '#F0F5E8', border: '1px solid #C5D9A8', borderRadius: 10,
              padding: '14px 16px', marginBottom: 16, color: '#5C7A3A', fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <Check size={16} /> All done! Ready to go home and cook.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {sections.map((section) => {
              // Filter out checked items if hideChecked is on
              const visibleItems = hideChecked
                ? section.items.filter(it => !checked[it.name + (it.unit || 'unit')])
                : section.items;
              if (visibleItems.length === 0) return null;
              const sectionChecked = section.items.filter(it => checked[it.name + (it.unit || 'unit')]).length;
              const sectionDone = sectionChecked === section.items.length;

              return (
                <section key={section.id}>
                  <h3 className="serif" style={{
                    fontSize: 18, fontWeight: 500,
                    margin: '0 0 10px', paddingBottom: 6,
                    borderBottom: '1px solid #E8DDC9',
                    display: 'flex', alignItems: 'center', gap: 8,
                    opacity: sectionDone ? 0.5 : 1
                  }}>
                    <span style={{ fontSize: 22 }}>{section.icon}</span>
                    <span style={{ flex: 1 }}>{section.label}</span>
                    <span className="sans" style={{
                      fontSize: 11, color: '#8B6F47', fontWeight: 400,
                      letterSpacing: '0.1em', textTransform: 'uppercase'
                    }}>
                      {sectionChecked}/{section.items.length}
                    </span>
                  </h3>
                  {visibleItems.map((item, i) => {
                    const key = item.name + (item.unit || 'unit');
                    const isChecked = checked[key];
                    return (
                      <button
                        key={key}
                        onClick={() => toggleItem(item.name, item.unit)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '14px 8px',
                          borderBottom: i === visibleItems.length - 1 ? 'none' : '1px solid #F0E6D2',
                          opacity: isChecked ? 0.4 : 1,
                          background: 'transparent', border: 'none', borderBottom: i === visibleItems.length - 1 ? 'none' : '1px solid #F0E6D2',
                          width: '100%', textAlign: 'left', cursor: 'pointer'
                        }}
                      >
                        <div style={{
                          width: 32, height: 32,
                          borderRadius: 16,
                          border: isChecked ? '2px solid #5C7A3A' : '1.5px solid #C9B89A',
                          background: isChecked ? '#5C7A3A' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {isChecked && <Check size={18} color="#fff" />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="sans" style={{
                            fontSize: 17,
                            textDecoration: isChecked ? 'line-through' : 'none',
                            fontWeight: 500,
                            color: '#2A1F1A'
                          }}>
                            {item.name}
                          </div>
                          {(
                            <div className="sans" style={{ fontSize: 11, color: '#8B6F47', marginTop: 2 }}>
                              For: {item.sources.map(s => s.recipeTitle).filter((v, i, a) => a.indexOf(v) === i).slice(0, 2).join(', ')}
                              {item.hasInPantry && <span style={{ marginLeft: 6, color: '#5C7A3A' }}>· {formatQty(item.have, item.unit)} in pantry</span>}
                            </div>
                          )}
                        </div>
                        <div className="serif" style={{
                          fontSize: 20,
                          fontWeight: 500, color: '#A85C32',
                          minWidth: 65, textAlign: 'right'
                        }}>
                          {formatQty(item.need, item.unit)} <span style={{ fontSize: 13, color: '#8B6F47' }}>{item.unit !== 'unit' ? item.unit : ''}</span>
                        </div>
                      </button>
                    );
                  })}
                </section>
              );
            })}
          </div>
        </>
      )}

      {/* Pantry-added toast */}
      {pantryToast && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          background: '#5C7A3A', color: '#FAF6EF', padding: '10px 20px', borderRadius: 24,
          fontSize: 14, fontWeight: 500, zIndex: 2000, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap'
        }}
          ref={el => { if (el) { clearTimeout(window._pantryToastTimer); window._pantryToastTimer = setTimeout(() => setPantryToast(''), 2500); } }}
        >
          <Check size={14} />{pantryToast}
        </div>
      )}

      {/* Review modal — opens when user taps "Done shopping" */}
      {reviewOpen && (
        <div
          onClick={() => !addingToPantry && setReviewOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(42, 31, 26, 0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, zIndex: 1000
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FAF6EF', borderRadius: 14, padding: 24,
              maxWidth: 520, width: '100%', maxHeight: '85vh',
              display: 'flex', flexDirection: 'column'
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <div className="sans" style={{ fontSize: 11, color: '#A85C32', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
                Add to pantry
              </div>
              <h2 className="serif" style={{ fontSize: 24, margin: 0, color: '#2A1F1A' }}>
                Review your shop
              </h2>
              <div className="sans" style={{ fontSize: 13, color: '#5C4A3A', marginTop: 4 }}>
                {reviewItems.length} item{reviewItems.length === 1 ? '' : 's'} ready. Edit quantity if you bought more or less.
              </div>
            </div>

            <div style={{
              flex: 1, overflowY: 'auto', padding: '4px 0',
              borderTop: '1px solid #E8DDC9', borderBottom: '1px solid #E8DDC9',
              marginBottom: 16
            }}>
              {reviewItems.length === 0 ? (
                <div className="sans" style={{ fontSize: 13, color: '#8B6F47', padding: '16px 0', textAlign: 'center' }}>
                  No items to add.
                </div>
              ) : reviewItems.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 0', borderBottom: idx < reviewItems.length - 1 ? '1px solid #F0E6D2' : 'none'
                }}>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={item.qty}
                    onChange={e => {
                      const next = [...reviewItems];
                      next[idx] = { ...next[idx], qty: e.target.value };
                      setReviewItems(next);
                    }}
                    style={{
                      width: 70, padding: '6px 8px', border: '1px solid #E8DDC9', borderRadius: 4,
                      fontSize: 14, textAlign: 'center', background: '#fff'
                    }}
                  />
                  <span className="sans" style={{ fontSize: 12, color: '#8B6F47', minWidth: 40 }}>
                    {item.unit || ''}
                  </span>
                  <span className="serif" style={{ fontSize: 15, color: '#2A1F1A', flex: 1 }}>
                    {item.name}
                  </span>
                  <button
                    onClick={() => setReviewItems(reviewItems.filter((_, i) => i !== idx))}
                    title="Remove this item"
                    style={{
                      padding: 6, background: 'transparent', border: 'none', color: '#A85C32',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => !addingToPantry && setReviewOpen(false)}
                disabled={addingToPantry}
                style={{
                  padding: '10px 18px', background: 'transparent', color: '#5C4A3A',
                  border: '1px solid #E8DDC9', borderRadius: 8, fontSize: 14, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={commitToPantry}
                disabled={addingToPantry || reviewItems.length === 0}
                style={{
                  padding: '10px 18px', background: '#5C7A3A', color: '#FAF6EF',
                  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                  opacity: (addingToPantry || reviewItems.length === 0) ? 0.6 : 1
                }}
              >
                {addingToPantry ? (
                  <><Loader2 size={14} className="spin" />Adding…</>
                ) : (
                  <><Check size={14} />Add {reviewItems.length} to pantry</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------- PANTRY --------

// Perishable keywords — items that typically expire within 1-2 weeks
const PERISHABLE_KEYWORDS = [
  'chicken','beef','pork','salmon','fish','turkey','shrimp','lamb','steak','mince',
  'milk','yogurt','cream','cheese','butter','cottage cheese','sour cream',
  'eggs','egg',
  'spinach','lettuce','arugula','kale','herbs','parsley','cilantro','basil','mint',
  'strawberr','raspberr','blueberr','blackberr','grape','cherry',
  'avocado','tomato','zucchini','cucumber','bell pepper','broccoli','cauliflower',
  'mushroom','asparagus','green onion','leek',
  'tofu','tempeh',
];
const DEFAULT_EXPIRY_DAYS = {
  chicken: 3, beef: 4, pork: 4, salmon: 2, fish: 2, turkey: 3, shrimp: 2,
  milk: 7, yogurt: 14, cream: 10, butter: 30, 'sour cream': 14, 'cottage cheese': 7,
  eggs: 21, egg: 21,
  spinach: 5, lettuce: 7, herbs: 7, parsley: 7, cilantro: 7, basil: 5,
  strawberr: 5, raspberr: 3, blueberr: 7, avocado: 4, tomato: 7,
  mushroom: 7, asparagus: 5, broccoli: 7, cauliflower: 10, zucchini: 7,
  tofu: 5, tempeh: 7,
};
function getPerishableExpiry(name) {
  const lower = name.toLowerCase();
  for (const [kw, days] of Object.entries(DEFAULT_EXPIRY_DAYS)) {
    if (lower.includes(kw)) {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0, 10);
    }
  }
  for (const kw of PERISHABLE_KEYWORDS) {
    if (lower.includes(kw)) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().slice(0, 10);
    }
  }
  return null;
}

function PantryView({ data }) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('unit');
  const [expiresOn, setExpiresOn] = useState('');
  const [showExpiry, setShowExpiry] = useState(false);
  const [sortBy, setSortBy] = useState('expiry'); // expiry | name | recent
  const [pantrySearch, setPantrySearch] = useState('');
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // Bulk-add handler used by PantryScanModal
  const handleBulkAdd = async (items) => {
    for (const item of items) {
      const extra = {};
      if (item.is_perishable) extra.is_perishable = true;
      // Smart expiry default: perishable items get 7-day expiry by default
      if (item.is_perishable && !item.expires_on) {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        extra.expires_on = d.toISOString().slice(0, 10);
      }
      await data.addPantry(item.name, item.qty, item.unit, extra);
    }
  };

  // Bulk-merge handler: increment qty of existing pantry items
  const handleBulkMerge = async (merges) => {
    for (const { existing, addQty } of merges) {
      const newQty = (Number(existing.qty) || 0) + (Number(addQty) || 1);
      await data.updatePantry(existing.id, { qty: newQty });
    }
  };

  const submit = () => {
    if (!name.trim()) return;
    const extra = expiresOn ? { expires_on: expiresOn, is_perishable: true } : {};
    data.addPantry(name.trim(), parseFloat(qty) || 1, unit, extra);
    setName(''); setQty(''); setUnit('unit'); setExpiresOn(''); setShowExpiry(false);
  };

  // Sort pantry
  const sortedPantry = useMemo(() => {
    const list = [...data.pantry].filter(p =>
      !pantrySearch || p.name.toLowerCase().includes(pantrySearch.toLowerCase())
    );
    if (sortBy === 'expiry') {
      list.sort((a, b) => {
        const da = daysUntilExpiry(a.expires_on);
        const db = daysUntilExpiry(b.expires_on);
        if (da === null && db === null) return a.name.localeCompare(b.name);
        if (da === null) return 1;
        if (db === null) return -1;
        return da - db;
      });
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0));
    }
    return list;
  }, [data.pantry, sortBy]);

  const expiringCount = data.pantry.filter(p => {
    const status = expiryStatus(p);
    return status && (status.level === 'expired' || status.level === 'today' || status.level === 'urgent' || status.level === 'soon');
  }).length;

  return (
    <div className="fade-in">
      <PageHeader kicker="Inventory" title="Pantry" subtitle={
        data.pantry.length === 0 ? 'What you already have at home.' :
        `${data.pantry.length} item${data.pantry.length === 1 ? '' : 's'}${expiringCount > 0 ? ` · ${expiringCount} expiring` : ''}`
      } />

      {/* AI scan buttons — two side by side */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setScanModalOpen(true)} style={{
          flex: 1, background: 'linear-gradient(135deg, #A85C32 0%, #C26A3D 100%)',
          color: '#FAF6EF', border: 'none', borderRadius: 12, padding: '12px 14px',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: '0 2px 8px rgba(168, 92, 50, 0.25)',
        }}>
          <Sparkles size={16} />
          Scan Pantry/Fridge
        </button>
        <button onClick={() => setReceiptModalOpen(true)} style={{
          flex: 1, background: '#5C7A3A',
          color: '#FAF6EF', border: 'none', borderRadius: 12, padding: '12px 14px',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: '0 2px 8px rgba(92, 122, 58, 0.25)',
        }}>
          <Receipt size={16} />
          Scan Receipt
        </button>
      </div>

      {/* Add form */}
      <div style={{ background: '#fff', border: '1px solid #E8DDC9', borderRadius: 8, padding: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <input value={name} onChange={e => {
            setName(e.target.value);
            // Auto-suggest expiry date for perishable items
            const suggested = getPerishableExpiry(e.target.value);
            if (suggested && !expiresOn) {
              setExpiresOn(suggested);
              setShowExpiry(true);
            } else if (!suggested && !expiresOn) {
              setShowExpiry(false);
            }
          }} onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Ingredient" style={{
              flex: '2 1 180px', padding: '8px 12px', border: '1px solid #E8DDC9',
              borderRadius: 6, fontSize: 14, outline: 'none'
            }} />
          <input value={qty} onChange={e => setQty(e.target.value)} type="number" placeholder="Qty"
            style={{
              flex: '1 0 60px', maxWidth: 80, padding: '8px 12px', border: '1px solid #E8DDC9',
              borderRadius: 6, fontSize: 14, outline: 'none'
            }} />
          <select value={unit} onChange={e => setUnit(e.target.value)} style={{
            padding: '8px 10px', border: '1px solid #E8DDC9', borderRadius: 6, fontSize: 14, background: '#fff'
          }}>
            {['unit', 'whole', 'g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'clove', 'piece'].map(u => <option key={u}>{u}</option>)}
          </select>
          <button onClick={submit} style={{
            padding: '8px 16px', background: '#5C7A3A', color: '#FAF6EF',
            border: 'none', borderRadius: 6, fontSize: 14, cursor: 'pointer'
          }}>Add</button>
        </div>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setShowExpiry(!showExpiry)} style={{
            padding: '4px 10px', background: 'transparent', border: '1px solid #E8DDC9',
            borderRadius: 4, fontSize: 11, color: '#5C4A3A', cursor: 'pointer'
          }}>
            {showExpiry ? '−' : '+'} Expiration date
          </button>
          {showExpiry && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="date" value={expiresOn} onChange={e => setExpiresOn(e.target.value)}
                style={{ padding: '4px 8px', border: '1px solid #E8DDC9', borderRadius: 4, fontSize: 12 }} />
              {getPerishableExpiry(name) && (
                <span className='sans' style={{ fontSize: 10, color: '#A85C32' }}>auto-detected</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      {data.pantry.length > 6 && (
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Search size={14} color='#8B6F47' style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={pantrySearch}
            onChange={e => setPantrySearch(e.target.value)}
            placeholder='Search pantry…'
            style={{
              width: '100%', padding: '8px 10px 8px 32px', border: '1px solid #E8DDC9',
              borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff',
              boxSizing: 'border-box'
            }}
          />
          {pantrySearch && (
            <button onClick={() => setPantrySearch('')} style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'transparent', border: 'none', color: '#8B6F47', padding: 2, cursor: 'pointer'
            }}><X size={13} /></button>
          )}
        </div>
      )}

      {/* Sort tabs */}
      {data.pantry.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {[
            { id: 'expiry', label: 'By expiry' },
            { id: 'name', label: 'By name' },
            { id: 'recent', label: 'Recently added' }
          ].map(t => (
            <button key={t.id} onClick={() => setSortBy(t.id)} style={{
              padding: '5px 12px', borderRadius: 14, border: '1px solid',
              borderColor: sortBy === t.id ? '#2A1F1A' : '#E8DDC9',
              background: sortBy === t.id ? '#2A1F1A' : '#fff',
              color: sortBy === t.id ? '#FAF6EF' : '#5C4A3A',
              fontSize: 11, fontWeight: 500, cursor: 'pointer'
            }}>{t.label}</button>
          ))}
        </div>
      )}

      {data.pantry.length === 0 ? <EmptyCard><Package size={20} /><div>Pantry is empty.</div></EmptyCard> : (
        <div style={{ background: '#fff', border: '1px solid #E8DDC9', borderRadius: 8, overflow: 'hidden' }}>
          {sortedPantry.filter(p => (Number(p.qty) || 0) > 0).map((p, i, arr) => {
            const status = expiryStatus(p);
            return (
              <div key={p.id} style={{
                padding: '10px 14px',
                borderBottom: i === sortedPantry.length - 1 ? 'none' : '1px solid #F0E6D2',
                background: status?.level === 'expired' ? '#FFF1ED' : 'transparent'
              }}>
                {/* Top row: name + expiry badge (wraps to multiple lines if needed) */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                  <Package size={14} color={status?.color || '#8B6F47'} style={{ marginTop: 4, flexShrink: 0 }} />
                  <input value={p.name} onChange={e => data.updatePantry(p.id, { name: e.target.value })}
                    style={{
                      flex: 1, border: 'none', background: 'transparent', fontSize: 14, outline: 'none', minWidth: 0,
                      color: status?.level === 'expired' ? '#A85C32' : '#2A1F1A',
                      padding: '2px 0',
                      wordBreak: 'break-word',
                    }} />
                  {status && (
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, background: status.bg,
                      color: status.color, fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
                      textTransform: 'uppercase', whiteSpace: 'nowrap', marginTop: 4, flexShrink: 0
                    }}>{status.label}</span>
                  )}
                </div>

                {/* Bottom row: qty, unit, date, delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 22, flexWrap: 'wrap' }}>
                  <input type="number" value={p.qty} onChange={e => data.updatePantry(p.id, { qty: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: 56, padding: '4px 6px', border: '1px solid #E8DDC9',
                      borderRadius: 4, fontSize: 13, textAlign: 'right'
                    }} />
                  <select value={p.unit} onChange={e => data.updatePantry(p.id, { unit: e.target.value })}
                    style={{
                      padding: '4px 6px', border: '1px solid #E8DDC9', borderRadius: 4, fontSize: 12, background: '#fff'
                    }}>
                    {['unit', 'whole', 'g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'clove', 'piece'].map(u => <option key={u}>{u}</option>)}
                  </select>
                  <input type="date" value={p.expires_on || ''}
                    onChange={e => data.updatePantry(p.id, { expires_on: e.target.value || null, is_perishable: !!e.target.value })}
                    title="Expiration date"
                    style={{
                      width: 130, padding: '4px 6px', border: '1px solid #E8DDC9', borderRadius: 4,
                      fontSize: 11, color: '#5C4A3A'
                    }} />
                  <div style={{ flex: 1 }} />
                  <button onClick={() => data.deletePantry(p.id)}
                    style={{ background: 'transparent', border: 'none', color: '#A85C32', padding: 4, cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          {sortedPantry.filter(p => (Number(p.qty) || 0) === 0).length > 0 && (
            <div style={{ borderTop: '1px solid #F0E6D2', padding: '8px 14px', opacity: 0.5 }}>
              <div className='sans' style={{ fontSize: 10, color: '#8B6F47', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 500 }}>Out of stock</div>
              {sortedPantry.filter(p => (Number(p.qty) || 0) === 0).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #F0E6D2' }}>
                  <span className='sans' style={{ flex: 1, fontSize: 13, color: '#5C4A3A', textDecoration: 'line-through' }}>{p.name}</span>
                  <button onClick={() => data.deletePantry(p.id)} style={{ background: 'transparent', border: 'none', color: '#A85C32', padding: 4, cursor: 'pointer' }}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    <PantryScanModal
      open={scanModalOpen}
      onClose={() => setScanModalOpen(false)}
      onAddItems={handleBulkAdd}
      onMergeItems={handleBulkMerge}
      existingPantry={data.pantry}
    />
    <ReceiptScanModal
      open={receiptModalOpen}
      onClose={() => setReceiptModalOpen(false)}
      onAddItems={handleBulkAdd}
      onMergeItems={handleBulkMerge}
      existingPantry={data.pantry}
    />
    </div>
  );
}

// -------- PREP DAY --------
function PrepView({ prepTasks, weekPlan, recipes }) {
  const [completed, setCompleted] = useState({});
  const toggle = key => setCompleted(c => ({ ...c, [key]: !c[key] }));

  // Batch plan groups overlapping step-level prep
  const batchTasks = useMemo(() => buildBatchPrepPlan(weekPlan, recipes), [weekPlan, recipes]);

  const totalTasks = prepTasks.length + batchTasks.length;
  const doneCount = Object.values(completed).filter(Boolean).length;

  return (
    <div className="fade-in">
      <PageHeader kicker="Sunday hour of glory" title="Prep day" subtitle="Knock out chopping once. Your weeknights will thank you." />
      {weekPlan.length === 0 ? (
        <EmptyCard><Sparkles size={20} /><div>Plan some meals to see prep tasks.</div></EmptyCard>
      ) : totalTasks === 0 ? (
        <EmptyCard><Check size={20} /><div>No batchable prep — your meals are pretty grab-and-go.</div></EmptyCard>
      ) : (
        <>
          {totalTasks > 0 && (
            <div style={{ height: 6, background: '#F0E6D2', borderRadius: 3, overflow: 'hidden', marginBottom: 18 }}>
              <div style={{
                height: '100%', width: `${(doneCount / totalTasks) * 100}%`,
                background: '#5C7A3A', transition: 'width 0.3s'
              }} />
            </div>
          )}

          {/* Cross-recipe batch tasks (high value) */}
          {batchTasks.length > 0 && (
            <>
              <h3 className="serif" style={{ fontSize: 16, fontWeight: 500, margin: '0 0 12px', color: '#5C7A3A' }}>
                <Sparkles size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
                Batch these across multiple meals
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {batchTasks.map((t, i) => {
                  const key = `batch_${i}`;
                  const done = completed[key];
                  return (
                    <button key={key} onClick={() => toggle(key)} style={{
                      background: done ? '#F0F5E8' : '#fff',
                      border: '1px solid', borderColor: done ? '#C5D9A8' : '#E8DDC9',
                      borderRadius: 10, padding: '14px 18px', textAlign: 'left',
                      width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12,
                      opacity: done ? 0.7 : 1
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 12, marginTop: 2,
                        border: done ? '2px solid #5C7A3A' : '1.5px solid #C9B89A',
                        background: done ? '#5C7A3A' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {done && <Check size={14} color="#fff" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="serif" style={{
                          fontSize: 16, fontWeight: 500, marginBottom: 4,
                          textDecoration: done ? 'line-through' : 'none'
                        }}>{t.task}</div>
                        <div className="sans" style={{ fontSize: 12, color: '#5C4A3A' }}>
                          For {t.recipes.length} meals: {t.recipes.map(r => r.title).join(', ')}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Single-ingredient prep totals (existing logic) */}
          {prepTasks.length > 0 && (
            <>
              <h3 className="serif" style={{ fontSize: 16, fontWeight: 500, margin: '0 0 12px' }}>
                Total ingredients to prep
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {prepTasks.map((t, i) => {
                  const key = `task_${i}`;
                  const done = completed[key];
                  return (
                    <button key={key} onClick={() => toggle(key)} style={{
                      background: done ? '#F0F5E8' : '#fff',
                      border: '1px solid', borderColor: done ? '#C5D9A8' : '#E8DDC9',
                      borderRadius: 10, padding: '14px 18px', textAlign: 'left',
                      width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
                      opacity: done ? 0.7 : 1
                    }}>
                      <div className="serif" style={{ fontSize: 24, fontWeight: 500, color: '#A85C32', minWidth: 32, opacity: done ? 0.5 : 1 }}>{String(i + 1).padStart(2, '0')}</div>
                      <div style={{ flex: 1 }}>
                        <div className="serif" style={{ fontSize: 15, fontWeight: 500, textTransform: 'capitalize', marginBottom: 2, textDecoration: done ? 'line-through' : 'none' }}>
                          {t.task}
                        </div>
                        <div className="sans" style={{ fontSize: 12, color: '#8B6F47' }}>
                          Total: <strong>{formatQty(t.totalQty, t.unit)} {t.unit !== 'unit' ? t.unit : ''}</strong> · {t.recipes.length} recipe{t.recipes.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div style={{
            background: '#FFF8F2', border: '1px solid #E8DDC9', borderRadius: 8,
            padding: '12px 16px', fontSize: 12, color: '#5C4A3A',
            display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 18
          }}>
            <Sparkles size={14} color="#A85C32" style={{ flexShrink: 0, marginTop: 2 }} />
            <div><strong>Storage tip:</strong> diced onions and minced garlic keep 5 days in airtight containers. Pre-cut veggies keep 4–5 days. Wash herbs only when ready to use.</div>
          </div>
        </>
      )}
    </div>
  );
}

// -------- IMPORT (placeholder — manual entry) --------
function ImportView({ data, setView, setActiveRecipeId }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🍽️');
  const [servings, setServings] = useState(2);
  const [timeMin, setTimeMin] = useState(30);
  const [tags, setTags] = useState('');
  const [ingredients, setIngredients] = useState([
    { id: 'i1', qty: 1, unit: 'unit', name: '', protein: false }
  ]);
  const [steps, setSteps] = useState([
    { id: 's1', text: '', timerSec: null, phase: 'prep' }
  ]);

  const save = async () => {
    if (!title.trim()) return alert('Recipe needs a title.');
    const validIngs = ingredients.filter(i => i.name.trim());
    const validSteps = steps.filter(s => s.text.trim());
    if (validIngs.length === 0) return alert('Add at least one ingredient.');
    if (validSteps.length === 0) return alert('Add at least one step.');

    const r = {
      title: title.trim(),
      servings: parseInt(servings) || 2,
      timeMin: parseInt(timeMin) || 30,
      description: description.trim(),
      tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      image: emoji || '🍽️',
      ingredients: validIngs,
      steps: validSteps
    };
    const created = await data.addRecipe(r);
    if (created) { setActiveRecipeId(created.id); setView('recipe'); }
  };

  const emojiOptions = ['🍽️','🍗','🥩','🐟','🍖','🥗','🍝','🍜','🍛','🍲','🥘','🌮','🌯','🥙','🍔','🍕','🍣','🍱','🥡','🍚','🥧','🍰','🥞','🌶️','🍯','🧀'];
  const phaseOptions = [
    { id: 'prep', label: 'Prep', color: '#5C7A3A', bg: '#F0F5E8', emoji: '🔪' },
    { id: 'cook', label: 'Cook', color: '#A85C32', bg: '#FFF0E0', emoji: '🔥' },
    { id: 'plate', label: 'Plate', color: '#7A5C32', bg: '#FAF1DC', emoji: '🍽️' }
  ];

  const addIngredient = () => {
    setIngredients([...ingredients, { id: 'i' + Date.now(), qty: 1, unit: 'unit', name: '', protein: false }]);
  };
  const addStep = (phase = 'cook') => {
    setSteps([...steps, { id: 's' + Date.now(), text: '', timerSec: null, phase }]);
  };
  const updateIng = (i, patch) => {
    const c = [...ingredients]; c[i] = { ...c[i], ...patch }; setIngredients(c);
  };
  const updateStep = (i, patch) => {
    const c = [...steps]; c[i] = { ...c[i], ...patch }; setSteps(c);
  };

  return (
    <div className="fade-in">
      <PageHeader back={() => setView('recipes')} kicker="New recipe" title="Add your own recipe" subtitle="Build a recipe from scratch" />

      <div style={{ background: '#fff', border: '1px solid #E8DDC9', borderRadius: 12, padding: 24 }}>
        {/* Title row with emoji */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-start' }}>
          <select value={emoji} onChange={e => setEmoji(e.target.value)} style={{
            padding: '12px', fontSize: 22, border: '1px solid #E8DDC9', borderRadius: 6, background: '#FAF6EF',
            cursor: 'pointer', minWidth: 60, textAlign: 'center'
          }}>
            {emojiOptions.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Recipe title" style={{
            flex: 1, padding: '12px 14px', border: '1px solid #E8DDC9', borderRadius: 6,
            fontSize: 18, fontFamily: 'Fraunces, serif', outline: 'none'
          }} />
        </div>

        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
          placeholder="Brief description (optional) — e.g. 'Roasted chicken with garlicky rice and herby yogurt sauce'"
          style={{
            width: '100%', padding: '10px 12px', border: '1px solid #E8DDC9', borderRadius: 6,
            fontSize: 13, marginBottom: 14, fontFamily: 'inherit', resize: 'vertical'
          }}
        />

        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <label style={{ flex: 1, fontSize: 12, color: '#5C4A3A' }}>
            Servings
            <input type="number" min="1" value={servings} onChange={e => setServings(e.target.value)} style={{
              width: '100%', padding: '8px 10px', border: '1px solid #E8DDC9', borderRadius: 4, marginTop: 4, fontSize: 14
            }} />
          </label>
          <label style={{ flex: 1, fontSize: 12, color: '#5C4A3A' }}>
            Time (min)
            <input type="number" min="1" value={timeMin} onChange={e => setTimeMin(e.target.value)} style={{
              width: '100%', padding: '8px 10px', border: '1px solid #E8DDC9', borderRadius: 4, marginTop: 4, fontSize: 14
            }} />
          </label>
        </div>

        <label style={{ display: 'block', fontSize: 12, color: '#5C4A3A', marginBottom: 20 }}>
          Tags (comma-separated)
          <input value={tags} onChange={e => setTags(e.target.value)} placeholder="chicken, italian, weeknight" style={{
            width: '100%', padding: '8px 10px', border: '1px solid #E8DDC9', borderRadius: 4, marginTop: 4, fontSize: 13
          }} />
        </label>

        {/* Ingredients */}
        <h4 className="serif" style={{ fontSize: 16, fontWeight: 500, margin: '0 0 10px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Ingredients</span>
          <span className="sans" style={{ fontSize: 11, color: '#8B6F47', fontWeight: 400 }}>{ingredients.filter(i => i.name.trim()).length} added</span>
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {ingredients.map((ing, i) => (
            <div key={ing.id} style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="number" min="0" step="0.25" value={ing.qty} onChange={e => updateIng(i, { qty: parseFloat(e.target.value) || 0 })}
                style={{ width: 60, padding: '6px 8px', border: '1px solid #E8DDC9', borderRadius: 4, fontSize: 13 }} />
              <select value={ing.unit} onChange={e => updateIng(i, { unit: e.target.value })}
                style={{ padding: '6px 8px', border: '1px solid #E8DDC9', borderRadius: 4, fontSize: 13, background: '#fff', minWidth: 70 }}>
                {['unit', 'whole', 'g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'clove', 'piece', 'pinch', 'oz', 'lb'].map(u => <option key={u}>{u}</option>)}
              </select>
              <input value={ing.name} onChange={e => updateIng(i, { name: e.target.value })}
                placeholder="ingredient name (e.g. boneless chicken breasts)"
                style={{ flex: 1, padding: '6px 10px', border: '1px solid #E8DDC9', borderRadius: 4, fontSize: 13, minWidth: 140 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#5C4A3A', cursor: 'pointer' }}>
                <input type="checkbox" checked={ing.protein} onChange={e => updateIng(i, { protein: e.target.checked })} />
                protein
              </label>
              <button onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))}
                style={{ background: 'transparent', border: 'none', color: '#A85C32', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addIngredient} style={{
          padding: '8px 14px', background: 'transparent', border: '1px dashed #C9B89A',
          borderRadius: 6, fontSize: 13, color: '#5C4A3A', cursor: 'pointer', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <Plus size={12} /> Add ingredient
        </button>

        {/* Steps */}
        <h4 className="serif" style={{ fontSize: 16, fontWeight: 500, margin: '0 0 10px' }}>Steps</h4>
        <p className="sans" style={{ fontSize: 12, color: '#8B6F47', margin: '0 0 12px', lineHeight: 1.5 }}>
          Tag each step with a phase: <strong style={{ color: '#5C7A3A' }}>Prep</strong> (chopping, mixing sauces), <strong style={{ color: '#A85C32' }}>Cook</strong> (heat), <strong style={{ color: '#7A5C32' }}>Plate</strong> (final assembly). The app will group them.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {steps.map((s, i) => {
            const ph = phaseOptions.find(p => p.id === (s.phase || 'cook'));
            return (
              <div key={s.id} style={{
                display: 'flex', gap: 8, alignItems: 'flex-start',
                padding: 10, background: ph.bg, borderRadius: 8,
                borderLeft: `3px solid ${ph.color}`
              }}>
                <span className="serif" style={{ fontSize: 18, color: ph.color, minWidth: 22, fontWeight: 500, paddingTop: 4 }}>{i + 1}</span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {phaseOptions.map(p => (
                      <button key={p.id} onClick={() => updateStep(i, { phase: p.id })}
                        style={{
                          padding: '3px 10px', borderRadius: 12, border: '1px solid',
                          borderColor: s.phase === p.id ? p.color : '#E8DDC9',
                          background: s.phase === p.id ? p.color : '#fff',
                          color: s.phase === p.id ? '#fff' : '#5C4A3A',
                          fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                          cursor: 'pointer'
                        }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <textarea value={s.text} onChange={e => updateStep(i, { text: e.target.value })} rows={2}
                    placeholder={`${ph.label} step…`}
                    style={{
                      width: '100%', padding: '6px 10px', border: '1px solid #E8DDC9',
                      borderRadius: 4, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box'
                    }} />
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}>
                    <span style={{ color: '#8B6F47' }}>Timer:</span>
                    <input type="number" min="0" placeholder="seconds" value={s.timerSec || ''}
                      onChange={e => updateStep(i, { timerSec: e.target.value ? parseInt(e.target.value) : null })}
                      style={{ width: 70, padding: '3px 6px', border: '1px solid #E8DDC9', borderRadius: 4, fontSize: 11 }} />
                    {s.timerSec > 0 && <span style={{ color: '#8B6F47' }}>≈ {Math.round(s.timerSec / 60)}m</span>}
                  </div>
                </div>
                <button onClick={() => setSteps(steps.filter((_, idx) => idx !== i))}
                  style={{ background: 'transparent', border: 'none', color: '#A85C32', padding: 4, cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {phaseOptions.map(p => (
            <button key={p.id} onClick={() => addStep(p.id)} style={{
              padding: '8px 14px', background: 'transparent', border: `1px dashed ${p.color}`,
              borderRadius: 6, fontSize: 12, color: p.color, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500
            }}>
              <Plus size={11} /> Add {p.label.toLowerCase()} step
            </button>
          ))}
        </div>

        <button onClick={save} style={{
          padding: '14px 28px', background: '#5C7A3A', color: '#FAF6EF', border: 'none',
          borderRadius: 8, fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'
        }}>
          <Check size={16} />Save recipe
        </button>
      </div>
    </div>
  );
}

// useMemo is imported at the top.
