import { useRef, useEffect } from 'react';

const GRID_SIZE = 100;

// ── Grid & border ─────────────────────────────────────────────────────────────

function drawGrid(ctx, camX, camY, w, h, worldSize) {
  ctx.strokeStyle = 'rgba(255,255,255,0.028)';
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

function drawWorldBorder(ctx, worldSize) {
  ctx.strokeStyle = '#ff3355';
  ctx.lineWidth = 5;
  ctx.shadowColor = '#ff3355';
  ctx.shadowBlur = 18;
  ctx.strokeRect(0, 0, worldSize, worldSize);
  ctx.shadowBlur = 0;
}

// ── Star helper ───────────────────────────────────────────────────────────────

function traceStar(ctx, cx, cy, rOut, rIn, pts, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const r  = i % 2 === 0 ? rOut : rIn;
    const a  = (i / (pts * 2)) * Math.PI * 2 + rot;
    if (i === 0) ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    else         ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
}

// ── Pellets ───────────────────────────────────────────────────────────────────

const FRUITS = ['🍎','🍊','🍋','🍇','🍓','🫐','🍑','🍒'];

function drawPellets(ctx, pellets, frame) {
  for (const [id, x, y, hue] of pellets) {
    const kind  = id % 5;        // 0-2 = glow dot, 3 = star, 4 = fruit
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.07 + id * 0.4);

    if (kind <= 2) {
      // Standard glowing dot
      const r = 4.5 + pulse * 1.5;
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
      grd.addColorStop(0, `hsl(${hue},100%,88%)`);
      grd.addColorStop(0.45, `hsl(${hue},90%,60%)`);
      grd.addColorStop(1, `hsl(${hue},80%,40%00)`);
      ctx.shadowColor = `hsl(${hue},100%,65%)`;
      ctx.shadowBlur  = 10;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

    } else if (kind === 3) {
      // Glowing star
      const rot = frame * 0.025 + id;
      const ro = 7 + pulse * 2;
      ctx.shadowColor = `hsl(${hue},100%,70%)`;
      ctx.shadowBlur  = 12;
      ctx.fillStyle   = `hsl(${hue},100%,78%)`;
      traceStar(ctx, x, y, ro, ro * 0.45, 5, rot);
      ctx.fill();

    } else {
      // Fruit emoji
      ctx.shadowBlur = 0;
      ctx.font = `${13 + pulse * 3}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(FRUITS[id % FRUITS.length], x, y);
    }
    ctx.shadowBlur = 0;
  }
}

// ── Snake ─────────────────────────────────────────────────────────────────────

function drawSnake(ctx, snake, isOwn) {
  const body = snake.body;
  if (!body || body.length === 0) return;

  const hw = isOwn ? 12 : 9.5;

  if (body.length > 1) {
    // Outer glow (own snake)
    if (isOwn) {
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

    // Spine (dark)
    ctx.strokeStyle = 'rgba(0,0,0,0.28)';
    ctx.lineWidth   = hw * 0.65;
    ctx.stroke();

    // Highlight streak (light top)
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth   = hw * 0.35;
    ctx.stroke();
  }

  // Head
  const headR = hw + 2;
  ctx.beginPath();
  ctx.arc(snake.x, snake.y, headR, 0, Math.PI * 2);
  ctx.fillStyle = snake.color;
  ctx.shadowColor = snake.color;
  ctx.shadowBlur  = 14;
  ctx.fill();
  ctx.shadowBlur  = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.38)';
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

  // Boost tail spark
  if (snake.boosting) {
    const tail = body[body.length - 1];
    if (tail) {
      ctx.shadowColor = snake.color;
      ctx.shadowBlur  = 16;
      ctx.beginPath();
      ctx.arc(tail[0], tail[1], 7, 0, Math.PI * 2);
      ctx.fillStyle = `${snake.color}cc`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Name tag
  const ly = snake.y - headR - 11;
  ctx.font = isOwn ? 'bold 14px "Space Grotesk",sans-serif' : '12px "Space Grotesk",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillText(snake.name, snake.x + 1, ly + 1);
  ctx.fillStyle = isOwn ? '#ffe566' : '#e2e8f0';
  ctx.fillText(snake.name, snake.x, ly);
}

// ── Creatures (decorative wandering critters) ──────────────────────────────────

function initCreatures(worldSize) {
  return Array.from({ length: 10 }, () => ({
    x: Math.random() * worldSize,
    y: Math.random() * worldSize,
    angle:      Math.random() * Math.PI * 2,
    wander:     Math.random() * Math.PI * 2,
    speed:      0.35 + Math.random() * 0.3,
    changeIn:   Math.floor(Math.random() * 180),
    hue:        18 + Math.random() * 15,
  }));
}

function updateCreatures(creatures, snakes, worldSize) {
  for (const c of creatures) {
    c.changeIn--;
    if (c.changeIn <= 0) {
      c.wander  += (Math.random() - 0.5) * 2.0;
      c.changeIn = 80 + Math.floor(Math.random() * 140);
    }

    // Flee nearest snake
    let flee = false, fleeAng = c.wander;
    for (const s of snakes) {
      if (Math.hypot(s.x - c.x, s.y - c.y) < 220) {
        fleeAng = Math.atan2(c.y - s.y, c.x - s.x);
        flee = true;
        break;
      }
    }

    c.angle += ((flee ? fleeAng : c.wander) - c.angle) * 0.06;
    const spd = flee ? c.speed * 2.8 : c.speed;
    c.x += Math.cos(c.angle) * spd;
    c.y += Math.sin(c.angle) * spd;
    c.x = Math.max(15, Math.min(worldSize - 15, c.x));
    c.y = Math.max(15, Math.min(worldSize - 15, c.y));
  }
}

function drawCreature(ctx, c) {
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.angle);

  // Tail
  ctx.beginPath();
  ctx.moveTo(-7, 0);
  ctx.quadraticCurveTo(-14, -5, -18, -1);
  ctx.strokeStyle = `hsl(${c.hue},25%,50%)`;
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 4.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = `hsl(${c.hue},28%,42%)`;
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(8, 0, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = `hsl(${c.hue},24%,48%)`;
  ctx.fill();

  // Ear
  ctx.beginPath();
  ctx.arc(10.5, -4, 2.8, 0, Math.PI * 2);
  ctx.fillStyle = `hsl(${c.hue},22%,54%)`;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(10.5, -4, 1.3, 0, Math.PI * 2);
  ctx.fillStyle = `hsl(${c.hue + 10},38%,68%)`;
  ctx.fill();

  // Eye
  ctx.beginPath();
  ctx.arc(12, -1, 1.3, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(12.3, -1.4, 0.45, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  // Snout / nose
  ctx.beginPath();
  ctx.arc(12.5, 1.5, 0.8, 0, Math.PI * 2);
  ctx.fillStyle = `hsl(${c.hue + 5},45%,65%)`;
  ctx.fill();

  ctx.restore();
}

// ── Explosion system ──────────────────────────────────────────────────────────

function addExplosion(list, x, y, color) {
  const COUNT = 36;
  const particles = [];
  for (let i = 0; i < COUNT; i++) {
    const angle = (i / COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const spd   = 1.5 + Math.random() * 7;
    const spark = Math.random() < 0.45;
    particles.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      r: 2 + Math.random() * 3.5,
      col: spark ? `hsl(${30 + Math.random() * 35},100%,65%)` : color,
      life: 1.0,
      dec: 0.014 + Math.random() * 0.013,
    });
  }
  list.push({ particles, ring: 0, ringMax: 70, x, y, color });
}

function updateDrawExplosions(ctx, list) {
  for (let i = list.length - 1; i >= 0; i--) {
    const e = list[i];
    let alive = false;

    // Expanding ring
    if (e.ring < e.ringMax) {
      e.ring += 3.5;
      const a = 1 - e.ring / e.ringMax;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.ring, 0, Math.PI * 2);
      ctx.strokeStyle = e.color;
      ctx.lineWidth   = 2.5;
      ctx.globalAlpha = a * 0.7;
      ctx.stroke();
      ctx.globalAlpha = 1;
      if (e.ring < e.ringMax) alive = true;
    }

    // Second inner ring (offset)
    if (e.ring > 10 && e.ring < e.ringMax + 20) {
      const r2 = e.ring * 0.55;
      const a2 = Math.max(0, 1 - r2 / e.ringMax) * 0.45;
      ctx.beginPath();
      ctx.arc(e.x, e.y, r2, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth   = 1.5;
      ctx.globalAlpha = a2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Particles
    for (const p of e.particles) {
      if (p.life <= 0) continue;
      alive = true;
      p.x  += p.vx;
      p.y  += p.vy;
      p.vx *= 0.93;
      p.vy *= 0.93;
      p.life -= p.dec;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.r * p.life), 0, Math.PI * 2);
      ctx.fillStyle   = p.col;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (!alive) list.splice(i, 1);
  }
}

// ── Minimap ───────────────────────────────────────────────────────────────────

function roundRect(ctx, x, y, w, h, r) {
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
  const mx = cw - SIZE - PAD;
  const my = ch - SIZE - PAD;
  const scale = SIZE / snap.worldSize;

  ctx.save();
  roundRect(ctx, mx, my, SIZE, SIZE, R);
  ctx.clip();

  ctx.globalAlpha = 0.88;
  ctx.fillStyle = 'rgba(4,8,24,0.95)';
  ctx.fillRect(mx, my, SIZE, SIZE);

  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = '#00f5ff';
  ctx.lineWidth = 0.5;
  const step = SIZE / 4;
  ctx.beginPath();
  for (let i = 1; i < 4; i++) {
    ctx.moveTo(mx + i * step, my); ctx.lineTo(mx + i * step, my + SIZE);
    ctx.moveTo(mx, my + i * step); ctx.lineTo(mx + SIZE, my + i * step);
  }
  ctx.stroke();

  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = '#ff3355';
  ctx.lineWidth   = 1.5;
  ctx.strokeRect(mx + 1, my + 1, SIZE - 2, SIZE - 2);

  ctx.globalAlpha = 0.65;
  for (const [, px, py, hue] of snap.pellets) {
    ctx.fillStyle = `hsl(${hue ?? 180},100%,72%)`;
    ctx.fillRect(mx + px * scale - 1, my + py * scale - 1, 2, 2);
  }

  ctx.globalAlpha = 0.9;
  for (const s of snap.snakes) {
    if (s.id === mySnake?.id) continue;
    const sx = mx + s.x * scale, sy = my + s.y * scale;
    ctx.beginPath();
    ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.fill();
  }

  if (mySnake) {
    const vx = mx + (mySnake.x - cw / 2) * scale;
    const vy = my + (mySnake.y - ch / 2) * scale;
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#00f5ff';
    ctx.fillRect(vx, vy, cw * scale, ch * scale);
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(vx, vy, cw * scale, ch * scale);
  }

  if (mySnake) {
    const sx = mx + mySnake.x * scale, sy = my + mySnake.y * scale;
    const dir = mySnake.dir ?? 0;
    ctx.globalAlpha = 0.35;
    ctx.shadowColor = '#fff'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill();
    ctx.globalAlpha = 1; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.shadowBlur = 0; ctx.globalAlpha = 0.95;
    const tip = { x: sx + Math.cos(dir) * 11, y: sy + Math.sin(dir) * 11 };
    const l   = { x: sx + Math.cos(dir + 2.5) * 2.5, y: sy + Math.sin(dir + 2.5) * 2.5 };
    const r2  = { x: sx + Math.cos(dir - 2.5) * 2.5, y: sy + Math.sin(dir - 2.5) * 2.5 };
    ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.lineTo(l.x, l.y); ctx.lineTo(r2.x, r2.y);
    ctx.closePath(); ctx.fillStyle = '#00f5ff'; ctx.fill();
  }

  ctx.restore();

  ctx.save();
  ctx.shadowColor = '#00c8ff'; ctx.shadowBlur = 12;
  ctx.strokeStyle = 'rgba(0,200,255,0.85)'; ctx.lineWidth = 1.5;
  roundRect(ctx, mx, my, SIZE, SIZE, R); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.7; ctx.fillStyle = '#00f5ff';
  ctx.font = 'bold 8px monospace'; ctx.textAlign = 'left';
  ctx.fillText('MAP', mx + 9, my + 14);
  ctx.globalAlpha = 0.5; ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'right';
  ctx.fillText(`${snap.snakes.length}P`, mx + SIZE - 9, my + 14);
  ctx.restore();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function GameCanvas({ snapshot, playerId, onInput, active }) {
  const canvasRef    = useRef(null);
  const snapshotRef  = useRef(null);
  const playerIdRef  = useRef(null);
  const boostRef     = useRef(false);
  const rafRef       = useRef(null);
  const frameRef     = useRef(0);

  // Explosion + creature state
  const explosionsRef = useRef([]);
  const prevSnakesRef = useRef(new Map());  // id → {x,y,color}
  const creaturesRef  = useRef([]);

  useEffect(() => { snapshotRef.current = snapshot; }, [snapshot]);
  useEffect(() => { playerIdRef.current = playerId; }, [playerId]);

  // ── Input ──────────────────────────────────────────────────────────────────

  const keysRef      = useRef(new Set());
  const mouseDirRef  = useRef(0);

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
      if (e.button === 0) { boostRef.current = true; onInput(mouseDirRef.current, true); }
    };
    const onMouseUp = (e) => {
      if (e.button === 0) { boostRef.current = false; onInput(mouseDirRef.current, false); }
    };

    const DIRS = new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD']);
    const onKeyDown = (e) => {
      if (DIRS.has(e.code)) { e.preventDefault(); keysRef.current.add(e.code); const d = keyDir(); if (d !== null) onInput(d, boostRef.current); }
      if (e.code === 'Space') { e.preventDefault(); boostRef.current = true; onInput(keyDir() ?? mouseDirRef.current, true); }
    };
    const onKeyUp = (e) => {
      keysRef.current.delete(e.code);
      if (e.code === 'Space') { boostRef.current = false; onInput(mouseDirRef.current, false); }
      const d = keyDir();
      if (d !== null) onInput(d, boostRef.current);
    };

    const keyInterval = setInterval(() => {
      const d = keyDir(); if (d !== null) onInput(d, boostRef.current);
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
      const w = canvas.width, h = canvas.height;

      if (!snap) {
        ctx.fillStyle = '#080c18';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#334155';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Connecting…', w / 2, h / 2);
        return;
      }

      // ── Init creatures once ──
      if (creaturesRef.current.length === 0 && snap.worldSize) {
        creaturesRef.current = initCreatures(snap.worldSize);
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
      prevSnakesRef.current = new Map(snap.snakes.map(s => [s.id, { x: s.x, y: s.y, color: s.color }]));

      // Update wandering creatures
      updateCreatures(creaturesRef.current, snap.snakes, snap.worldSize);

      // ── Camera ──
      const mySnake = snap.snakes.find(s => s.id === playerIdRef.current);
      const camX = mySnake ? mySnake.x : snap.worldSize / 2;
      const camY = mySnake ? mySnake.y : snap.worldSize / 2;

      // ── Background ──
      ctx.fillStyle = '#080c18';
      ctx.fillRect(0, 0, w, h);

      // Subtle radial vignette toward center (lighter)
      const bg2 = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.65);
      bg2.addColorStop(0, 'rgba(12,20,44,0.4)');
      bg2.addColorStop(1, 'rgba(2,4,14,0)');
      ctx.fillStyle = bg2;
      ctx.fillRect(0, 0, w, h);

      // ── World space ──
      ctx.save();
      ctx.translate(w / 2 - camX, h / 2 - camY);

      drawGrid(ctx, camX, camY, w, h, snap.worldSize);
      drawWorldBorder(ctx, snap.worldSize);

      // Creatures (behind pellets and snakes)
      for (const c of creaturesRef.current) drawCreature(ctx, c);

      drawPellets(ctx, snap.pellets, frameRef.current);

      // Snakes: others first, own on top
      for (const s of snap.snakes) {
        if (s.id !== playerIdRef.current) drawSnake(ctx, s, false);
      }
      if (mySnake) drawSnake(ctx, mySnake, true);

      // Explosions (world space)
      updateDrawExplosions(ctx, explosionsRef.current);

      ctx.restore();

      // Minimap (screen space)
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
