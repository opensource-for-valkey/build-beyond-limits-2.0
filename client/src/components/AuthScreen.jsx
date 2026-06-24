import { useState, useEffect, useRef } from 'react';
import AnimatedBg from './AnimatedBg.jsx';
import { audio } from '../audio/AudioManager.js';

const FONT = "'Space Grotesk','Inter',system-ui,sans-serif";

const T = {
  teal: '#00d4aa',
  tealGlow: 'rgba(0,212,170,0.3)',
  tealDim: 'rgba(0,212,170,0.1)',
  blue: '#38bdf8',
  panel: 'rgba(6,10,24,0.92)',
  border: 'rgba(255,255,255,0.07)',
  tealBorder: 'rgba(0,212,170,0.3)',
  text: '#e8f4ff',
  muted: '#4a6080',
  error: '#f87171',
};

const inp = {
  background: 'rgba(4,8,20,0.9)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  padding: '13px 16px',
  color: T.text,
  fontSize: 15,
  outline: 'none',
  width: '100%',
  fontFamily: FONT,
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

export default function AuthScreen({ wsSend, pendingRef, onAuth }) {
  const [name, setName]       = useState(() => { try { return localStorage.getItem('sq_last_name') || ''; } catch { return ''; } });
  const [pin, setPin]         = useState('');
  const [mode, setMode]       = useState(null);   // null | 'register' | 'login'
  const [step, setStep]       = useState('name'); // 'name' | 'pin'
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [shake, setShake]     = useState(false);
  const nameRef = useRef(null);
  const pinRef  = useRef(null);

  useEffect(() => { nameRef.current?.focus(); }, []);
  useEffect(() => { if (step === 'pin') pinRef.current?.focus(); }, [step]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const checkName = async () => {
    const n = name.trim();
    if (n.length < 2) { setError('Name must be at least 2 characters.'); triggerShake(); return; }
    setError('');
    setLoading(true);
    audio.click();

    const result = await new Promise(resolve => {
      pendingRef.current.nameStatus = resolve;
      wsSend({ type: 'check_name', name: n });
      setTimeout(() => {
        if (pendingRef.current.nameStatus === resolve) {
          pendingRef.current.nameStatus = null;
          resolve(null);
        }
      }, 4000);
    });

    setLoading(false);
    if (!result) { setError('Connection error. Try again.'); triggerShake(); return; }
    setMode(result.isNew ? 'register' : 'login');
    setStep('pin');
  };

  const submit = () => {
    if (pin.length !== 4) { setError('PIN must be 4 digits.'); triggerShake(); return; }
    setError('');
    audio.click();
    try { localStorage.setItem('sq_last_name', name.trim()); } catch {}
    try { localStorage.setItem('sq_last_pin', pin); } catch {}
    onAuth(name.trim(), pin);
  };

  const back = () => {
    setStep('name');
    setMode(null);
    setPin('');
    setError('');
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  const nameTrimmed = name.trim();

  return (
    <div style={{ position: 'fixed', inset: 0, fontFamily: FONT, overflow: 'hidden' }}>
      <AnimatedBg />

      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 40%, rgba(0,212,170,0.04) 0%, rgba(3,6,18,0.7) 100%)',
      }} />

      {/* Center card */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
        <div style={{
          width: '100%', maxWidth: 420,
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderTop: `2px solid ${T.teal}`,
          borderRadius: 20,
          padding: '40px 36px',
          backdropFilter: 'blur(40px)',
          boxShadow: `0 0 80px rgba(0,212,170,0.07), 0 32px 64px rgba(0,0,0,0.6)`,
          animation: shake ? 'authShake 0.4s ease' : 'none',
        }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🐍</div>
            <div style={{
              fontSize: 22, fontWeight: 900, letterSpacing: 3,
              color: T.teal, textShadow: `0 0 24px ${T.tealGlow}`,
            }}>SLITHER QUEST</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 4, letterSpacing: 2 }}>
              {step === 'name'
                ? 'ENTER YOUR IDENTITY'
                : mode === 'register'
                  ? '🆕 CREATE YOUR PIN'
                  : '🔒 WELCOME BACK'}
            </div>
          </div>

          {/* Step: Name */}
          {step === 'name' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: 3, fontWeight: 800, color: T.muted, marginBottom: 8 }}>
                  PLAYER NAME
                </div>
                <input
                  ref={nameRef}
                  style={inp}
                  placeholder="e.g. VenomKing"
                  maxLength={20}
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  onFocus={e => { e.target.style.borderColor = T.tealBorder; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  onKeyDown={e => e.key === 'Enter' && !loading && nameTrimmed.length >= 2 && checkName()}
                />
              </div>

              {error && <ErrorMsg>{error}</ErrorMsg>}

              <Btn
                onClick={checkName}
                loading={loading}
                disabled={nameTrimmed.length < 2 || loading}
              >
                {loading ? 'CHECKING…' : 'CONTINUE →'}
              </Btn>
            </div>
          )}

          {/* Step: PIN */}
          {step === 'pin' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Who */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(0,212,170,0.06)',
                border: `1px solid ${T.tealBorder}`,
                borderRadius: 10, padding: '10px 14px',
              }}>
                <div style={{ fontSize: 18 }}>👤</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{name.trim()}</div>
                  <div style={{ fontSize: 10, color: T.muted }}>
                    {mode === 'register' ? 'New player — set your PIN' : 'Returning player — enter PIN'}
                  </div>
                </div>
                <button
                  onClick={back}
                  style={{
                    marginLeft: 'auto', background: 'none', border: 'none',
                    color: T.muted, cursor: 'pointer', fontSize: 11, fontFamily: FONT,
                  }}
                >change</button>
              </div>

              <div>
                <div style={{ fontSize: 9, letterSpacing: 3, fontWeight: 800, color: T.muted, marginBottom: 8 }}>
                  4-DIGIT PIN
                </div>
                <input
                  ref={pinRef}
                  style={{ ...inp, letterSpacing: 12, textAlign: 'center', fontSize: 26 }}
                  type="password"
                  inputMode="numeric"
                  placeholder="••••"
                  maxLength={4}
                  value={pin}
                  onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                  onFocus={e => { e.target.style.borderColor = T.tealBorder; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  onKeyDown={e => e.key === 'Enter' && pin.length === 4 && submit()}
                />
                <div style={{ fontSize: 10, color: T.muted, marginTop: 6 }}>
                  {mode === 'register'
                    ? 'Choose a 4-digit PIN — it locks your identity.'
                    : 'Enter your PIN to verify identity.'}
                </div>
              </div>

              {error && <ErrorMsg>{error}</ErrorMsg>}

              <Btn
                onClick={submit}
                disabled={pin.length !== 4}
              >
                {mode === 'register' ? '🎮 CREATE ACCOUNT' : '🔓 LOGIN'}
              </Btn>
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 10, color: '#1e3a4a' }}>
            Your PIN is hashed and stored securely.
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700;800;900&display=swap');
        @keyframes authShake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-5px)}
          80%{transform:translateX(5px)}
        }
        input::placeholder { color: #1e3a4a; }
      `}</style>
    </div>
  );
}

function Btn({ children, onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: '100%', padding: '14px',
        borderRadius: 12, border: 'none',
        fontWeight: 800, fontSize: 13, letterSpacing: 2,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        fontFamily: FONT,
        background: disabled || loading
          ? 'rgba(255,255,255,0.05)'
          : 'linear-gradient(135deg, #00d4aa, #0ea5e9)',
        color: disabled || loading ? '#1e3a4a' : '#030912',
        boxShadow: disabled || loading ? 'none' : '0 0 28px rgba(0,212,170,0.35)',
        transition: 'all 0.25s',
      }}
    >
      {children}
    </button>
  );
}

function ErrorMsg({ children }) {
  return (
    <div style={{
      background: 'rgba(248,113,113,0.08)',
      border: '1px solid rgba(248,113,113,0.25)',
      borderRadius: 8, padding: '9px 14px',
      fontSize: 12, color: T.error, fontWeight: 600,
    }}>
      ⚠ {children}
    </div>
  );
}
