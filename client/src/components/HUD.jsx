import { useState, useEffect } from 'react';

const FONT = "'Space Grotesk','Inter',system-ui,sans-serif";

const BASE = {
  position: 'absolute', top: 0, left: 0,
  width: '100%', height: '100%',
  pointerEvents: 'none', userSelect: 'none',
  fontFamily: FONT,
};

// ── Round timer ───────────────────────────────────────────────────────────────

function GameTimer({ timeLeftMs }) {
  if (timeLeftMs === null || timeLeftMs === undefined) return null;
  const total  = Math.max(0, Math.ceil(timeLeftMs / 1000));
  const m      = Math.floor(total / 60);
  const s      = total % 60;
  const urgent = total <= 30;
  const warn   = total <= 60;

  return (
    <div style={{
      position: 'absolute', top: 14, left: '50%',
      transform: 'translateX(-50%)',
      background: urgent
        ? 'rgba(239,68,68,0.14)'
        : warn
          ? 'rgba(249,115,22,0.11)'
          : 'rgba(3,9,20,0.88)',
      border: `1px solid ${urgent ? 'rgba(239,68,68,0.45)' : warn ? 'rgba(249,115,22,0.35)' : 'rgba(0,200,255,0.14)'}`,
      borderRadius: 12, padding: '6px 22px',
      backdropFilter: 'blur(18px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      boxShadow: urgent
        ? '0 0 18px rgba(239,68,68,0.25)'
        : warn ? '0 0 14px rgba(249,115,22,0.18)' : '0 4px 20px rgba(0,0,0,0.4)',
      animation: urgent ? 'timerPulse 0.9s ease infinite' : 'none',
      minWidth: 90,
    }}>
      <div style={{
        fontSize: 8, letterSpacing: 3, fontWeight: 800,
        color: urgent ? '#fca5a5' : warn ? '#fdba74' : '#334155',
      }}>ROUND</div>
      <div style={{
        fontSize: 24, fontWeight: 900, letterSpacing: 2,
        color: urgent ? '#ef4444' : warn ? '#f97316' : '#f1f5f9',
        fontVariantNumeric: 'tabular-nums', lineHeight: 1.1,
      }}>{`${m}:${String(s).padStart(2, '0')}`}</div>
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

const MEDALS = ['🥇', '🥈', '🥉'];

function Leaderboard({ leaderboard, playerId }) {
  return (
    <div style={{
      position: 'absolute', top: 14, right: 14,
      background: 'rgba(3,9,20,0.90)',
      border: '1px solid rgba(0,200,255,0.12)',
      borderTop: '2px solid rgba(0,200,255,0.3)',
      borderRadius: 12, padding: '12px 14px',
      minWidth: 200,
      backdropFilter: 'blur(18px)',
      boxShadow: '0 4px 28px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        fontSize: 8, fontWeight: 800, letterSpacing: 3,
        color: '#00f5ff', marginBottom: 10, textAlign: 'center',
      }}>LEADERBOARD</div>

      {leaderboard.length === 0 && (
        <div style={{ color: '#334155', fontSize: 11, textAlign: 'center' }}>No players yet</div>
      )}

      {leaderboard.map((e, i) => {
        const isMe = e.id === playerId;
        return (
          <div key={e.id || i} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, marginBottom: i < leaderboard.length - 1 ? 4 : 0,
            padding: '4px 8px', borderRadius: 7,
            background: isMe ? 'rgba(0,245,255,0.08)' : 'transparent',
            border: isMe ? '1px solid rgba(0,245,255,0.18)' : '1px solid transparent',
          }}>
            {/* Rank */}
            <span style={{ fontSize: 13, flexShrink: 0, width: 22, textAlign: 'center' }}>
              {i < 3 ? MEDALS[i] : <span style={{ color: '#334155', fontSize: 10 }}>#{i + 1}</span>}
            </span>

            {/* Color dot */}
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: e.color || '#475569', flexShrink: 0,
              boxShadow: e.color ? `0 0 5px ${e.color}` : 'none',
            }} />

            {/* Name */}
            <span style={{
              flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              color: isMe ? '#00f5ff' : '#e2e8f0',
              fontWeight: isMe ? 800 : 500,
            }}>{e.name}</span>

            {/* Score */}
            <span style={{
              color: i === 0 ? '#fbbf24' : '#64748b',
              fontVariantNumeric: 'tabular-nums',
              fontSize: 13, fontWeight: 700,
            }}>{e.score}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Killfeed ──────────────────────────────────────────────────────────────────

function Killfeed({ entries }) {
  return (
    <div style={{ position: 'absolute', bottom: 96, left: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
      {entries.map((e, i) => (
        <div key={e.key} style={{
          background: 'rgba(3,9,20,0.88)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 8, padding: '5px 12px', fontSize: 11,
          backdropFilter: 'blur(14px)',
          opacity: 1 - i * 0.18,
          animation: 'kfSlide 0.25s ease',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        }}>
          {e.killerName
            ? <><span style={{ color: '#f87171', fontWeight: 700 }}>{e.killerName}</span>
                <span style={{ color: '#374151' }}> ⚡ </span>
                <span style={{ color: '#93c5fd' }}>{e.victimName}</span>
                <span style={{ color: '#334155' }}> +{e.length}</span></>
            : <><span style={{ color: '#93c5fd' }}>{e.victimName}</span>
                <span style={{ color: '#374151' }}> hit the wall</span></>}
        </div>
      ))}
    </div>
  );
}

// ── Score bar ─────────────────────────────────────────────────────────────────

function ScoreBar({ snapshot, playerId }) {
  const me = snapshot?.snakes?.find(s => s.id === playerId);
  if (!me) return null;
  return (
    <div style={{
      position: 'absolute', bottom: 16, left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(3,9,20,0.90)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 28, padding: '8px 28px',
      display: 'flex', gap: 24, alignItems: 'center',
      backdropFilter: 'blur(18px)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    }}>
      <Pill label="LENGTH" value={me.length} color="#22c55e" />
      <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.07)' }} />
      <Pill label="SCORE"  value={me.score}  color="#fbbf24" />
      {me.boosting && (
        <>
          <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.07)' }} />
          <div style={{
            fontSize: 11, fontWeight: 800, color: '#f97316',
            letterSpacing: 1.5,
            animation: 'boostGlow 0.5s ease infinite',
          }}>⚡ BOOST</div>
        </>
      )}
    </div>
  );
}

function Pill({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 48 }}>
      <div style={{ fontSize: 8, letterSpacing: 2.5, color: '#475569', fontWeight: 800 }}>{label}</div>
      <div style={{
        fontSize: 20, fontWeight: 900, color,
        fontVariantNumeric: 'tabular-nums', lineHeight: 1.15,
        textShadow: `0 0 14px ${color}55`,
      }}>{value}</div>
    </div>
  );
}

// ── Room badge ────────────────────────────────────────────────────────────────

function RoomBadge({ roomCode }) {
  const [copied, setCopied] = useState(false);
  if (!roomCode) return null;
  const copy = () => {
    navigator.clipboard.writeText(roomCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div onClick={copy} title="Click to copy" style={{
      position: 'absolute', top: 14, left: 14,
      background: 'rgba(3,9,20,0.90)',
      border: '1px solid rgba(0,200,255,0.15)',
      borderRadius: 10, padding: '7px 16px',
      cursor: 'pointer', backdropFilter: 'blur(18px)',
      pointerEvents: 'all',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      transition: 'border-color 0.2s',
    }}>
      <div style={{ fontSize: 8, color: '#334155', letterSpacing: 2.5, fontWeight: 800 }}>ROOM</div>
      <div style={{
        fontSize: 18, fontWeight: 900, letterSpacing: 5,
        color: copied ? '#22c55e' : '#00f5ff',
        transition: 'color 0.2s', fontFamily: 'monospace',
      }}>{copied ? '✓ COPIED' : roomCode}</div>
    </div>
  );
}

// ── Greeting banner ───────────────────────────────────────────────────────────

function Greeting({ text, onDismiss }) {
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setVis(false); setTimeout(onDismiss, 500); }, 5500);
    return () => clearTimeout(t);
  }, []);
  if (!text) return null;
  return (
    <div style={{
      position: 'absolute', top: 72, left: '50%',
      transform: vis ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-12px)',
      background: 'rgba(3,9,20,0.94)',
      border: '1px solid rgba(0,245,255,0.2)',
      borderRadius: 12, padding: '12px 24px',
      fontSize: 13, color: '#bae6fd',
      textAlign: 'center', maxWidth: 400,
      backdropFilter: 'blur(22px)',
      opacity: vis ? 1 : 0,
      transition: 'opacity 0.5s, transform 0.5s',
      boxShadow: '0 0 24px rgba(0,245,255,0.08)',
    }}>{text}</div>
  );
}

// ── Controls hint ─────────────────────────────────────────────────────────────

function ControlsHint() {
  return (
    <div style={{
      position: 'absolute', bottom: 16, right: 16,
      fontSize: 9, color: '#1e3a4a', textAlign: 'right',
      lineHeight: 2, letterSpacing: 0.8,
    }}>
      Steer: mouse / WASD / arrows<br />
      Boost: hold click / space
    </div>
  );
}

// ── Main HUD ──────────────────────────────────────────────────────────────────

export default function HUD({
  leaderboard, killfeed, snapshot, playerId,
  roomCode, greeting, onGreetingDismiss, timeLeftMs,
}) {
  return (
    <div style={BASE}>
      <RoomBadge roomCode={roomCode} />
      <GameTimer timeLeftMs={timeLeftMs} />
      <Leaderboard leaderboard={leaderboard} playerId={playerId} />
      <Killfeed entries={killfeed} />
      <ScoreBar snapshot={snapshot} playerId={playerId} />
      {greeting && <Greeting text={greeting} onDismiss={onGreetingDismiss} />}
      <ControlsHint />

      <style>{`
        @keyframes kfSlide    { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes boostGlow  { 0%,100%{opacity:1;text-shadow:0 0 8px #f97316} 50%{opacity:0.5;text-shadow:none} }
        @keyframes timerPulse { 0%,100%{box-shadow:0 0 0 rgba(239,68,68,0)} 50%{box-shadow:0 0 18px rgba(239,68,68,0.4)} }
      `}</style>
    </div>
  );
}
