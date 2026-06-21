import { useRef, useEffect } from 'react';

const GRID_SIZE = 100;

// ── Grid ──────────────────────────────────────────────────────────────────────

function drawGrid(ctx, camX, camY, w, h) {
  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;
  const x0 = Math.floor((camX - w / 2) / GRID_SIZE) * GRID_SIZE;
  const y0 = Math.floor((camY - h / 2) / GRID_SIZE) * GRID_SIZE;
  ctx.beginPath();
  for (let x = x0; x < camX + w / 2 + GRID_SIZE; x += GRID_SIZE) {
    ctx.moveTo(x, camY - h / 2); ctx.lineTo(x, camY + h / 2);
  }
  for (let y = y0; y < camY + h / 2 + GRID_SIZE; y += GRID_SIZE) {
    ctx.moveTo(camX - w / 2, y); ctx.lineTo(camX + w / 2, y);
  }
  ctx.stroke();
}

// ── World border ──────────────────────────────────────────────────────────────

function drawWorldBorder(ctx, worldSize) {
  ctx.shadowColor = '#ff3355';
  ctx.shadowBlur  = 18;
  ctx.strokeStyle = '#ff3355';
  ctx.lineWidth   = 5;
  ctx.strokeRect(0, 0, worldSize, worldSize);
  ctx.shadowBlur  = 0;
}

// ── Pellets ───────────────────────────────────────────────────────────────────

const FRUITS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🍑', '🍒'];

function drawPellets(ctx, pellets, frame) {
  for (const [id, x, y, hue] of pellets) {
    const t    = id % 4;
    const pulse = 0.6 + 0.4 * Math.sin(frame * 0.06 + id * 0.37);

    if (t === 3) {
      // Fruit emoji (every 4th pellet)
      ctx.shadowBlur    = 0;
      ctx.globalAlpha   = 0.92;
      ctx.font          = `${(11 + pulse * 4) | 0}px serif`;
      ctx.textAlign     = 'center';
      ctx.textBaseline  = 'middle';
      ctx.fillText(FRUITS[id % FRUITS.length], x, y);
      ctx.globalAlpha   = 1;
      ctx.textBaseline  = 'alphabetic';
    } else {
      // Standard glowing dot
      const r = 4 + pulse * 1.8;
      ctx.shadowColor = `hsl(${hue},100%,65%)`;
      ctx.shadowBlur  = 10;
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 1.8);
      grd.addColorStop(0,   `hsl(${hue},100%,88%)`);
      grd.addColorStop(0.5, `hsl(${hue},90%,62%)`);
      grd.addColorStop(1,   `hsla(${hue},80%,40%,0)`);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle  = grd;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  // Ensure clean state after pellets
  ctx.shadowBlur   = 0;
  ctx.globalAlpha  = 1;
  ctx.textBaseline = 'alphabetic';
}

// ── Snake ─────────────────────────────────────────────────────────────────────

function drawSnake(ctx, snake, isOwn) {
  const body = snake.body; // [[x,y], ...]
  const hw   = isOwn ? 12 : 9.5;

  // Body polyline (only if we have body data)
  if (body && body.length > 1) {
    if (isOwn) {
      // Outer glow
      ctx.beginPath();
      ctx.moveTo(snake.x, snake.y);
      for (const [bx, by] of body) ctx.lineTo(bx, by);
      ctx.strokeStyle = `${snake.color}44`;
      ctx.lineWidth   = hw * 2 + 10;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.stroke();
    }

    // Main body
    ctx.beginPath();
    ctx.moveTo(snake.x, snake.y);
    for (const [bx, by] of body) ctx.lineTo(bx, by);
    ctx.strokeStyle = snake.color;
    ctx.lineWidth   = hw * 2;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();

    // Dark spine
    ctx.strokeStyle = 'rgba(0,0,0,0.28)';
    ctx.lineWidth   = hw * 0.65;
    ctx.stroke();

    // Light highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth   = hw * 0.3;
    ctx.stroke();
  }

  // Head — always drawn
  const headR = hw + 2;
  ctx.shadowColor = snake.color;
  ctx.shadowBlur  = 14;
  ctx.beginPath();
  ctx.arc(snake.x, snake.y, headR, 0, Math.PI * 2);
  ctx.fillStyle = snake.color;
  ctx.fill();
  ctx.shadowBlur  = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth   = 2;
  ctx.stroke();

  // Eyes
  const eyeDist = headR * 0.55;
  for (const off of [-0.42, 0.42]) {
    const ea = snake.dir + off;
    const ex = snake.x + Math.cos(ea) * eyeDist;
    const ey = snake.y + Math.sin(ea) * eyeDist;
    ctx.beginPath();
    ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      ex + Math.cos(snake.dir) * 1.2,
      ey + Math.sin(snake.dir) * 1.2,
      1.8, 0, Math.PI * 2,
    );
    ctx.fillStyle = '#111';
    ctx.fill();
  }

  // Boost spark at tail
  if (snake.boosting && body && body.length > 0) {
    const tail = body[body.length - 1];
    ctx.shadowColor = snake.color;
    ctx.shadowBlur  = 16;
    ctx.beginPath();
    ctx.arc(tail[0], tail[1], 7, 0, Math.PI * 2);
    ctx.fillStyle = `${snake.color}bb`;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Name label
  const ly = snake.y - headR - 11;
  ctx.font          = isOwn ? 'bold 14px sans-serif' : '12px sans-serif';
  ctx.textAlign     = 'center';
  ctx.textBaseline  = 'alphabetic';
  ctx.fillStyle     = 'rgba(0,0,0,0.6)';
  ctx.fillText(snake.name, snake.x + 1, ly + 1);
  ctx.fillStyle     = isOwn ? '#ffe566' : '#e2e8f0';
  ctx.fillText(snake.name, snake.x, ly);
}

// ── Explosion system ──────────────────────────────────────────────────────────

function addExplosion(list, x, y, color) {
  const COUNT = 32;
  const particles = [];
  for (let i = 0; i < COUNT; i++) {
    const angle = (i / COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const spd   = 1.5 + Math.random() * 7;
    const spark = Math.random() < 0.4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      r: 2 + Math.random() * 3,
      col: spark ? `hsl(${20 + Math.random() * 35 | 0},100%,65%)` : color,
      life: 1.0,
      dec: 0.015 + Math.random() * 0.012,
    });
  }
  list.push({ particles, ring: 0, ringMax: 65, x, y, color });
}

function updateDrawExplosions(ctx, list) {
  for (let i = list.length - 1; i >= 0; i--) {
    const e = list[i];
    let alive = false;

    // Expanding ring
    if (e.ring < e.ringMax) {
      e.ring += 3.5;
      const alpha = (1 - e.ring / e.ringMax) * 0.65;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.ring, 0, Math.PI * 2);
      ctx.strokeStyle = e.color;
      ctx.lineWidth   = 2.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
      alive = true;
    }

    // Particles
    for (const p of e.particles) {
      if (p.life <= 0) continue;
      alive = true;
      p.x  += p.vx; p.y  += p.vy;
      p.vx *= 0.93;  p.vy *= 0.93;
      p.life -= p.dec;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.r * p.life), 0, Math.PI * 2);
      ctx.fillStyle = p.col;
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    if (!alive) list.splice(i, 1);
  }
}

// ── Minimap ───────────────────────────────────────────────────────────────────

function rrPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawMinimap(ctx, snap, mySnake, cw, ch) {
  const SIZE = 180, PAD = 16, R = 12;
  const mx    = cw - SIZE - PAD;
  const my    = ch - SIZE - PAD;
  const scale = SIZE / snap.worldSize;

  // ── Clipped map interior ──
  ctx.save();
  rrPath(ctx, mx, my, SIZE, SIZE, R);
  ctx.clip();

  ctx.globalAlpha = 0.88;
  ctx.fillStyle   = 'rgba(4,8,24,0.95)';
  ctx.fillRect(mx, my, SIZE, SIZE);

  // Grid
  ctx.globalAlpha = 0.09;
  ctx.strokeStyle = '#00f5ff';
  ctx.lineWidth   = 0.5;
  ctx.beginPath();
  for (let i = 1; i < 4; i++) {
    const step = SIZE / 4;
    ctx.moveTo(mx + i * step, my); ctx.lineTo(mx + i * step, my + SIZE);
    ctx.moveTo(mx, my + i * step); ctx.lineTo(mx + SIZE, my + i * step);
  }
  ctx.stroke();

  // World border hint
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = '#ff3355';
  ctx.lineWidth   = 1.5;
  ctx.strokeRect(mx + 1, my + 1, SIZE - 2, SIZE - 2);

  // Pellets
  ctx.globalAlpha = 0.65;
  for (const [, px, py, hue] of snap.pellets) {
    ctx.fillStyle = `hsl(${hue ?? 180},100%,72%)`;
    ctx.fillRect(mx + px * scale - 1, my + py * scale - 1, 2, 2);
  }

  // Other snakes
  ctx.globalAlpha = 0.9;
  for (const s of snap.snakes) {
    if (s.id === mySnake?.id) continue;
    ctx.beginPath();
    ctx.arc(mx + s.x * scale, my + s.y * scale, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.fill();
  }

  // Viewport rect
  if (mySnake) {
    const vx = mx + (mySnake.x - cw / 2) * scale;
    const vy = my + (mySnake.y - ch / 2) * scale;
    ctx.globalAlpha = 0.14;
    ctx.fillStyle   = '#00f5ff';
    ctx.fillRect(vx, vy, cw * scale, ch * scale);
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth   = 0.8;
    ctx.strokeRect(vx, vy, cw * scale, ch * scale);
  }

  // Own snake marker + direction arrow
  if (mySnake) {
    const sx  = mx + mySnake.x * scale;
    const sy  = my + mySnake.y * scale;
    const dir = mySnake.dir ?? 0;

    ctx.globalAlpha = 1;
    ctx.shadowColor = '#fff';
    ctx.shadowBlur  = 6;
    ctx.beginPath();
    ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Arrow tip
    const tip = { x: sx + Math.cos(dir) * 10, y: sy + Math.sin(dir) * 10 };
    const l   = { x: sx + Math.cos(dir + 2.5) * 2.5, y: sy + Math.sin(dir + 2.5) * 2.5 };
    const r2  = { x: sx + Math.cos(dir - 2.5) * 2.5, y: sy + Math.sin(dir - 2.5) * 2.5 };
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(l.x, l.y);
    ctx.lineTo(r2.x, r2.y);
    ctx.closePath();
    ctx.fillStyle = '#00f5ff';
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.restore();

  // ── Glowing border + labels (outside clip) ──
  ctx.save();
  ctx.shadowColor = '#00c8ff';
  ctx.shadowBlur  = 12;
  ctx.strokeStyle = 'rgba(0,200,255,0.85)';
  ctx.lineWidth   = 1.5;
  rrPath(ctx, mx, my, SIZE, SIZE, R);
  ctx.stroke();
  ctx.shadowBlur  = 0;

  ctx.globalAlpha  = 0.7;
  ctx.fillStyle    = '#00f5ff';
  ctx.font         = 'bold 8px monospace';
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('MAP', mx + 9, my + 6);

  ctx.globalAlpha  = 0.5;
  ctx.fillStyle    = '#94a3b8';
  ctx.textAlign    = 'right';
  ctx.fillText(`${snap.snakes.length}P`, mx + SIZE - 9, my + 6);

  ctx.globalAlpha  = 1;
  ctx.restore();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function GameCanvas({ snapshot, playerId, onInput, active }) {
  const canvasRef     = useRef(null);
  const snapshotRef   = useRef(null);
  const playerIdRef   = useRef(null);
  const boostRef      = useRef(false);
  const rafRef        = useRef(null);
  const frameRef      = useRef(0);
  const explosionsRef = useRef([]);
  const prevSnakesRef = useRef(new Map());

  useEffect(() => { snapshotRef.current  = snapshot; }, [snapshot]);
  useEffect(() => { playerIdRef.current  = playerId; }, [playerId]);

  // ── Input ──────────────────────────────────────────────────────────────────

  const keysRef     = useRef(new Set());
  const mouseDirRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const keyDir = () => {
      const k = keysRef.current;
      let dx = 0, dy = 0;
      if (k.has('ArrowUp')    || k.has('KeyW')) dy -= 1;
      if (k.has('ArrowDown')  || k.has('KeyS')) dy += 1;
      if (k.has('ArrowLeft')  || k.has('KeyA')) dx -= 1;
      if (k.has('ArrowRight') || k.has('KeyD')) dx += 1;
      if (dx === 0 && dy === 0) return null;
      return Math.atan2(dy, dx);
    };

    let lastMouseSend = 0;
    const onMouseMove = (e) => {
      const now = Date.now();
      if (now - lastMouseSend < 30) return;
      lastMouseSend = now;
      const rect = canvas.getBoundingClientRect();
      mouseDirRef.current = Math.atan2(
        e.clientY - rect.top  - canvas.height / 2,
        e.clientX - rect.left - canvas.width  / 2,
      );
      onInput(mouseDirRef.current, boostRef.current);
    };

    const onMouseDown = (e) => {
      if (e.button === 0) { boostRef.current = true;  onInput(mouseDirRef.current, true);  }
    };
    const onMouseUp = (e) => {
      if (e.button === 0) { boostRef.current = false; onInput(mouseDirRef.current, false); }
    };

    const DIRS = new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD']);
    const onKeyDown = (e) => {
      if (DIRS.has(e.code)) {
        e.preventDefault();
        keysRef.current.add(e.code);
        const d = keyDir();
        if (d !== null) onInput(d, boostRef.current);
      }
      if (e.code === 'Space') {
        e.preventDefault();
        boostRef.current = true;
        onInput(keyDir() ?? mouseDirRef.current, true);
      }
    };
    const onKeyUp = (e) => {
      keysRef.current.delete(e.code);
      if (e.code === 'Space') { boostRef.current = false; onInput(mouseDirRef.current, false); }
      const d = keyDir();
      if (d !== null) onInput(d, boostRef.current);
    };

    const keyInterval = setInterval(() => {
      const d = keyDir();
      if (d !== null) onInput(d, boostRef.current);
    }, 33);

    canvas.addEventListener('mousemove',  onMouseMove);
    canvas.addEventListener('mousedown',  onMouseDown);
    canvas.addEventListener('mouseup',    onMouseUp);
    window.addEventListener('keydown',    onKeyDown);
    window.addEventListener('keyup',      onKeyUp);
    return () => {
      clearInterval(keyInterval);
      canvas.removeEventListener('mousemove',  onMouseMove);
      canvas.removeEventListener('mousedown',  onMouseDown);
      canvas.removeEventListener('mouseup',    onMouseUp);
      window.removeEventListener('keydown',    onKeyDown);
      window.removeEventListener('keyup',      onKeyUp);
    };
  }, [active, onInput]);

  // ── Render loop ────────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      frameRef.current++;

      const snap = snapshotRef.current;
      const w    = canvas.width;
      const h    = canvas.height;

      if (!snap) {
        ctx.fillStyle = '#080c18';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle    = '#334155';
        ctx.font         = '18px sans-serif';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Connecting…', w / 2, h / 2);
        ctx.textBaseline = 'alphabetic';
        return;
      }

      // ── Detect snake deaths → explosions ──
      const curMap = new Map(snap.snakes.map(s => [s.id, s]));
      if (prevSnakesRef.current.size > 0) {
        for (const [id, prev] of prevSnakesRef.current) {
          if (!curMap.has(id)) {
            addExplosion(explosionsRef.current, prev.x, prev.y, prev.color);
          }
        }
      }
      prevSnakesRef.current = new Map(
        snap.snakes.map(s => [s.id, { x: s.x, y: s.y, color: s.color }])
      );

      const mySnake = snap.snakes.find(s => s.id === playerIdRef.current);
      const camX    = mySnake ? mySnake.x : snap.worldSize / 2;
      const camY    = mySnake ? mySnake.y : snap.worldSize / 2;

      // ── Background ──
      ctx.fillStyle = '#080c18';
      ctx.fillRect(0, 0, w, h);

      // ── World transform ──
      ctx.save();
      ctx.translate(w / 2 - camX, h / 2 - camY);

      drawGrid(ctx, camX, camY, w, h);
      drawWorldBorder(ctx, snap.worldSize);
      drawPellets(ctx, snap.pellets, frameRef.current);

      // Draw snakes — others first, own on top
      for (const s of snap.snakes) {
        if (s.id !== playerIdRef.current) drawSnake(ctx, s, false);
      }
      if (mySnake) drawSnake(ctx, mySnake, true);

      // Explosions
      updateDrawExplosions(ctx, explosionsRef.current);

      ctx.restore();

      // ── Minimap ──
      drawMinimap(ctx, snap, mySnake, w, h);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', cursor: active ? 'none' : 'default' }}
    />
  );
}
