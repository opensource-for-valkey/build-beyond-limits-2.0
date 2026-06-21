import { useState } from 'react';

export default function JoinScreen({ onJoin }) {
  const [name, setName] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length > 0) onJoin(trimmed);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #0d1b2a 0%, #0a0a14 100%)',
      zIndex: 100,
    }}>
      {/* Decorative grid lines */}
      <svg style={{ position: 'absolute', inset: 0, opacity: 0.04 }} width="100%" height="100%">
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div style={{
        position: 'relative',
        background: 'rgba(10,15,30,0.92)',
        border: '1px solid rgba(100,200,255,0.2)',
        borderRadius: 18,
        padding: '48px 56px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 60px rgba(0,100,255,0.1)',
        minWidth: 340,
      }}>
        {/* Title */}
        <div>
          <div style={{
            fontSize: 42, fontWeight: 900, letterSpacing: -1,
            background: 'linear-gradient(135deg, #44aaff, #88ffcc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            textAlign: 'center',
          }}>
            SLITHER QUEST
          </div>
          <div style={{ color: '#556', fontSize: 13, textAlign: 'center', marginTop: 4 }}>
            Eat pellets &bull; Grow &bull; Outlast everyone
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
          <input
            autoFocus
            maxLength={20}
            placeholder="Enter your name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10, padding: '12px 16px',
              color: '#fff', fontSize: 16,
              outline: 'none',
              width: '100%',
            }}
          />
          <button
            type="submit"
            disabled={!name.trim()}
            style={{
              background: name.trim()
                ? 'linear-gradient(135deg, #1a6bff, #00d4aa)'
                : 'rgba(255,255,255,0.1)',
              border: 'none', borderRadius: 10,
              padding: '13px', color: '#fff',
              fontSize: 16, fontWeight: 700,
              cursor: name.trim() ? 'pointer' : 'not-allowed',
              transition: 'opacity 0.2s',
            }}
          >
            PLAY
          </button>
        </form>

        {/* Tips */}
        <div style={{ color: '#445', fontSize: 12, textAlign: 'center', lineHeight: 2 }}>
          Steer: mouse or WASD / arrow keys &nbsp;&bull;&nbsp; Boost: hold click or space<br />
          Boost burns length but drops pellets &nbsp;&bull;&nbsp; Hit another snake to die
        </div>
      </div>
    </div>
  );
}
