import React, { useState } from 'react';
import { ChefHat, Mail, Lock, Loader2 } from 'lucide-react';

export default function AuthScreen({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = mode === 'signin' ? onSignIn : onSignUp;
      const { error } = await fn(email, password);
      if (error) {
        setError(error.message);
      } else if (mode === 'signup') {
        setSignupSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
    setLoading(false);
  };

  if (signupSuccess) {
    return (
      <div style={shell}>
        <div style={card}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
          <h2 className="serif" style={{ fontSize: 28, fontWeight: 500, margin: '0 0 12px' }}>Check your email</h2>
          <p style={{ color: '#5C4A3A', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to verify, then come back here and sign in.
          </p>
          <button onClick={() => { setSignupSuccess(false); setMode('signin'); }}
            style={{ ...btnSecondary, marginTop: 24 }}>
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={shell}>
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <ChefHat size={28} color="#A85C32" strokeWidth={1.5} />
          <h1 className="serif" style={{ fontSize: 36, fontWeight: 500, margin: 0, letterSpacing: '-0.02em', color: '#2A1F1A' }}>Mise.</h1>
        </div>
        <p className="sans" style={{ fontSize: 13, color: '#8B6F47', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 32 }}>Your weekly kitchen</p>

        <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, margin: '0 0 24px' }}>
          {mode === 'signin' ? 'Welcome back.' : 'Create your account.'}
        </h2>

        <form onSubmit={submit}>
          <label style={label}>Email</label>
          <div style={inputWrap}>
            <Mail size={16} color="#8B6F47" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoComplete="email" autoCapitalize="off"
              style={input}
            />
          </div>

          <label style={{ ...label, marginTop: 16 }}>Password</label>
          <div style={inputWrap}>
            <Lock size={16} color="#8B6F47" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              style={input}
            />
          </div>

          {error && (
            <div style={errorBox}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{ ...btnPrimary, marginTop: 24, opacity: loading ? 0.7 : 1 }}>
            {loading ? <Loader2 size={16} className="spin" /> : null}
            {loading ? 'Working…' : (mode === 'signin' ? 'Sign in' : 'Create account')}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#8B6F47' }}>
          {mode === 'signin' ? "First time? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
            style={btnLink}>
            {mode === 'signin' ? 'Create an account' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

const shell = {
  minHeight: '100vh', background: '#FAF6EF',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
};
const card = {
  width: '100%', maxWidth: 420, background: '#fff',
  border: '1px solid #E8DDC9', borderRadius: 12, padding: '36px 32px'
};
const label = {
  display: 'block', fontSize: 12, color: '#5C4A3A',
  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 500
};
const inputWrap = { position: 'relative' };
const input = {
  width: '100%', padding: '12px 14px 12px 40px', border: '1px solid #E8DDC9',
  borderRadius: 8, fontSize: 15, outline: 'none', background: '#FAF6EF'
};
const btnPrimary = {
  width: '100%', padding: '14px 20px', background: '#A85C32', color: '#FAF6EF',
  border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
};
const btnSecondary = {
  padding: '10px 18px', background: 'transparent', border: '1px solid #E8DDC9',
  borderRadius: 8, fontSize: 14, color: '#2A1F1A'
};
const btnLink = {
  background: 'transparent', border: 'none', color: '#A85C32',
  fontWeight: 500, padding: 0, textDecoration: 'underline'
};
const errorBox = {
  marginTop: 16, padding: '10px 14px', background: '#FFF0E8',
  border: '1px solid #F5C9B0', borderRadius: 6, color: '#A85C32', fontSize: 13
};
