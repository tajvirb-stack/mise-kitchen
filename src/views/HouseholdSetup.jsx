import React, { useState } from 'react';
import { Home, Users, Loader2, ArrowRight } from 'lucide-react';

// Aggressively sanitize an invite code: keep only hex characters (0-9, a-f).
// Invite codes are 8-character hex strings, so anything else is junk
// (invisible Unicode from copy-paste, accidental whitespace, etc).
function sanitizeInviteCode(raw) {
  return (raw || '')
    .toLowerCase()
    .replace(/[^0-9a-f]/g, '')  // hex characters only
    .slice(0, 8);                 // cap at 8 chars
}

export default function HouseholdSetup({ user, onCreate, onJoin, error }) {
  const [mode, setMode] = useState('choose'); // choose | create | join
  const [householdName, setHouseholdName] = useState('My Kitchen');
  const [displayName, setDisplayName] = useState((user?.email || '').split('@')[0]);
  const [inviteCode, setInviteCode] = useState('');
  const [busy, setBusy] = useState(false);

  const submitCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    await onCreate(householdName.trim(), displayName.trim());
    setBusy(false);
  };
  const submitJoin = async (e) => {
    e.preventDefault();
    setBusy(true);
    // Sanitize one more time at submit to be extra safe
    const cleanCode = sanitizeInviteCode(inviteCode);
    await onJoin(cleanCode, displayName.trim());
    setBusy(false);
  };

  // Handle paste explicitly to clean clipboard content before it lands in state
  const handleInvitePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    setInviteCode(sanitizeInviteCode(pasted));
  };

  const cleanLength = sanitizeInviteCode(inviteCode).length;
  const codeReady = cleanLength === 8;

  return (
    <div style={shell}>
      <div style={card}>
        <h1 className="serif" style={{ fontSize: 32, fontWeight: 500, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Welcome.
        </h1>
        <p style={{ fontSize: 15, color: '#5C4A3A', margin: '0 0 28px', lineHeight: 1.6 }}>
          A "household" is a group that shares recipes, weekly plans, and grocery lists. You can start a new one or join one someone else created.
        </p>

        {mode === 'choose' && (
          <>
            <button onClick={() => setMode('create')} style={choiceCard}>
              <Home size={22} color="#A85C32" strokeWidth={1.5} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="serif" style={{ fontSize: 16, fontWeight: 500, color: '#2A1F1A', marginBottom: 2 }}>Start a new household</div>
                <div style={{ fontSize: 12, color: '#8B6F47' }}>You'll get an invite code to share with family</div>
              </div>
              <ArrowRight size={16} color="#A89379" />
            </button>

            <button onClick={() => setMode('join')} style={{ ...choiceCard, marginTop: 10 }}>
              <Users size={22} color="#5C7A3A" strokeWidth={1.5} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="serif" style={{ fontSize: 16, fontWeight: 500, color: '#2A1F1A', marginBottom: 2 }}>Join with an invite code</div>
                <div style={{ fontSize: 12, color: '#8B6F47' }}>Got an 8-character code from someone? Use it here</div>
              </div>
              <ArrowRight size={16} color="#A89379" />
            </button>
          </>
        )}

        {mode === 'create' && (
          <form onSubmit={submitCreate}>
            <label style={label}>Household name</label>
            <input value={householdName} onChange={e => setHouseholdName(e.target.value)} placeholder="My Kitchen" style={input} required />

            <label style={{ ...label, marginTop: 16 }}>Your display name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Tajvir" style={input} required />

            {error && <div style={errorBox}>{error}</div>}

            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button type="button" onClick={() => setMode('choose')} style={btnSecondary}>Back</button>
              <button type="submit" disabled={busy} style={{ ...btnPrimary, flex: 1 }}>
                {busy ? <Loader2 size={16} className="spin" /> : null}
                {busy ? 'Setting up your kitchen…' : 'Create household'}
              </button>
            </div>
            <p style={{ fontSize: 12, color: '#8B6F47', marginTop: 12, lineHeight: 1.5 }}>
              We'll pre-load your kitchen with 20 HelloFresh recipes ready to use.
            </p>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={submitJoin}>
            <label style={label}>Invite code</label>
            <input
              value={inviteCode}
              onChange={e => setInviteCode(sanitizeInviteCode(e.target.value))}
              onPaste={handleInvitePaste}
              placeholder="abc12def"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={8}
              style={{
                ...input,
                letterSpacing: '0.15em',
                fontFamily: 'monospace',
                fontSize: 16,
              }}
              required
            />
            <div style={{
              fontSize: 11,
              color: codeReady ? '#5C7A3A' : '#8B6F47',
              marginTop: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              {codeReady
                ? '✓ Code looks good'
                : `${cleanLength} of 8 characters · invisible characters auto-removed`}
            </div>

            <label style={{ ...label, marginTop: 16 }}>Your display name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" style={input} required />

            {error && <div style={errorBox}>{error}</div>}

            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button type="button" onClick={() => setMode('choose')} style={btnSecondary}>Back</button>
              <button
                type="submit"
                disabled={busy || !codeReady}
                style={{
                  ...btnPrimary,
                  flex: 1,
                  opacity: (busy || !codeReady) ? 0.5 : 1,
                  cursor: (busy || !codeReady) ? 'not-allowed' : 'pointer',
                }}
              >
                {busy ? <Loader2 size={16} className="spin" /> : null}
                {busy ? 'Joining…' : 'Join household'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const shell = { minHeight: '100vh', background: '#FAF6EF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 };
const card = { width: '100%', maxWidth: 480, background: '#fff', border: '1px solid #E8DDC9', borderRadius: 12, padding: '36px 32px' };
const choiceCard = {
  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
  padding: '18px 18px', background: '#FAF6EF', border: '1px solid #E8DDC9',
  borderRadius: 10, transition: 'all 0.15s'
};
const label = { display: 'block', fontSize: 12, color: '#5C4A3A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 500 };
const input = { width: '100%', padding: '12px 14px', border: '1px solid #E8DDC9', borderRadius: 8, fontSize: 15, outline: 'none', background: '#FAF6EF' };
const btnPrimary = { padding: '12px 20px', background: '#A85C32', color: '#FAF6EF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 };
const btnSecondary = { padding: '12px 16px', background: 'transparent', border: '1px solid #E8DDC9', borderRadius: 8, fontSize: 14, color: '#2A1F1A' };
const errorBox = { marginTop: 16, padding: '10px 14px', background: '#FFF0E8', border: '1px solid #F5C9B0', borderRadius: 6, color: '#A85C32', fontSize: 13 };
