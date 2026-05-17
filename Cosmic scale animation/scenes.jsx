// scenes.jsx — CosmoTender: Field notes from the bidder's universe
// Sprite-based cosmic animation. All scenes share the navy background
// rendered by <Universe>, then a sequence of <Sprite> windows tells facts.

// ── Tokens (mirror tender-wave so we don't need to read a CSS var here) ──
const T = {
  navy:        '#0B1B30',
  navyDeep:    '#081326',
  navySoft:    '#1B344F',
  rule:        '#1F3B5C',
  ice:         '#EEF2F6',
  paper:       '#FFFFFF',
  onDeep:      '#E8EEF6',
  onDeepDim:   '#8FA0B6',
  ocean:       '#3C6E9C',
  oceanInk:    '#2A5379',
  oceanSoft:   '#7FA4C7',
  oceanGlow:   '#DCE7F4',
  forest:      '#3FA56D',
  forestDeep:  '#1F7A4D',
  mustard:     '#D5A93A',
  mustardDeep: '#8A6D1F',
  wine:        '#C24A5C',
  wineDeep:    '#A02234',
  mono:        'JetBrains Mono, ui-monospace, monospace',
  sans:        '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
};

// ── Helpers ─────────────────────────────────────────────────────────────
const TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
const fmtMoney = (n) => {
  // €N.NN trillion / billion / million — keep it cosmic
  const abs = Math.abs(n);
  if (abs >= 1e12) return '€ ' + (n / 1e12).toFixed(2) + ' T';
  if (abs >= 1e9)  return '€ ' + (n / 1e9).toFixed(1) + ' B';
  if (abs >= 1e6)  return '€ ' + (n / 1e6).toFixed(1) + ' M';
  return '€ ' + Math.round(n).toLocaleString('en-US').replace(/,/g, ' ');
};
const fmtInt = (n) => Math.round(n).toLocaleString('en-US').replace(/,/g, ' ');

// Deterministic pseudo-random (so the starfield is stable across renders)
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Persistent universe layer (stars + horizon grid) ────────────────────
const STARS = (() => {
  const r = mulberry32(7);
  return Array.from({ length: 220 }, () => ({
    x: r() * 1920,
    y: r() * 1080,
    s: 0.4 + r() * 1.6,
    a: 0.18 + r() * 0.55,
    p: r() * TAU,
    sp: 0.5 + r() * 1.2,
  }));
})();

function Universe() {
  const t = useTime();
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `radial-gradient(120% 80% at 50% 110%, ${T.navySoft} 0%, ${T.navy} 35%, ${T.navyDeep} 100%)`,
      overflow: 'hidden',
    }}>
      <svg viewBox="0 0 1920 1080" width="1920" height="1080"
           style={{ position: 'absolute', inset: 0, display: 'block' }}>
        {/* Faint coordinate grid */}
        <g stroke={T.rule} strokeWidth="1" opacity="0.35">
          {Array.from({ length: 12 }, (_, i) => (
            <line key={'h' + i} x1="0" x2="1920" y1={(i + 1) * 90} y2={(i + 1) * 90} />
          ))}
          {Array.from({ length: 20 }, (_, i) => (
            <line key={'v' + i} y1="0" y2="1080" x1={(i + 1) * 96} x2={(i + 1) * 96} />
          ))}
        </g>
        {/* Stars */}
        {STARS.map((s, i) => {
          const tw = 0.5 + 0.5 * Math.sin(t * s.sp + s.p);
          return (
            <circle key={i} cx={s.x} cy={s.y} r={s.s}
                    fill={T.oceanGlow} opacity={s.a * tw} />
          );
        })}
      </svg>
    </div>
  );
}

// ── Persistent chrome: corner labels + global counter ───────────────────
function Chrome({ totalDuration, scenes }) {
  const t = useTime();
  // Find active scene index
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (t >= scenes[i].start && t < scenes[i].end) { idx = i; break; }
    if (t >= scenes[i].end) idx = i;
  }
  const total = scenes.length;
  const mm = String(Math.floor(t / 60)).padStart(2, '0');
  const ss = (t % 60).toFixed(2).padStart(5, '0');

  return (
    <>
      {/* Top-left: brand mark */}
      <div style={{
        position: 'absolute', top: 36, left: 48,
        display: 'flex', alignItems: 'center', gap: 14,
        color: T.onDeep, fontFamily: T.sans, fontWeight: 600, fontSize: 18,
        letterSpacing: '-0.005em',
      }}>
        <svg width="22" height="22" viewBox="0 0 22 22">
          <circle cx="11" cy="11" r="10" fill="none" stroke={T.ocean} strokeWidth="1.5" />
          <path d="M2 12 Q 6.5 7, 11 12 T 20 12" fill="none" stroke={T.ocean} strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        CosmoTender
        <span style={{
          fontFamily: T.mono, fontSize: 11, color: T.onDeepDim,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          marginLeft: 6, paddingLeft: 14, borderLeft: `1px solid ${T.rule}`,
        }}>
          Field notes
        </span>
      </div>

      {/* Top-right: scene counter */}
      <div style={{
        position: 'absolute', top: 36, right: 48,
        fontFamily: T.mono, fontSize: 12, color: T.onDeepDim,
        textTransform: 'uppercase', letterSpacing: '0.14em',
        display: 'flex', gap: 18, alignItems: 'center',
      }}>
        <span style={{ color: T.oceanGlow }}>
          {String(idx + 1).padStart(2, '0')}
        </span>
        <span style={{ opacity: 0.5 }}>/ {String(total).padStart(2, '0')}</span>
        <span style={{ width: 1, height: 14, background: T.rule }} />
        <span>T+ {mm}:{ss}</span>
      </div>

      {/* Bottom-left: live-sync dot */}
      <div style={{
        position: 'absolute', bottom: 40, left: 48,
        display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: T.mono, fontSize: 11, color: T.onDeepDim,
        textTransform: 'uppercase', letterSpacing: '0.12em',
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: 999, background: T.forest,
          boxShadow: `0 0 8px ${T.forest}`,
          opacity: 0.6 + 0.4 * Math.sin(t * 3),
        }} />
        TenderNed · live
      </div>

      {/* Bottom-right: progress bar */}
      <div style={{
        position: 'absolute', bottom: 40, right: 48,
        width: 260, fontFamily: T.mono, fontSize: 10, color: T.onDeepDim,
        textTransform: 'uppercase', letterSpacing: '0.12em',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Transmission</span>
          <span>{Math.round((t / totalDuration) * 100)}%</span>
        </div>
        <div style={{ height: 2, background: T.rule, position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${(t / totalDuration) * 100}%`, background: T.ocean,
          }} />
        </div>
      </div>
    </>
  );
}

// ── Reusable sprite primitives ──────────────────────────────────────────

// CelestialBody — a circle that can orbit a center, with optional glow ring.
function Body({
  cx, cy, r, color, glow = false, ring = false,
  ringColor, ringDash, opacity = 1, label,
  labelColor, labelOffset = 18,
}) {
  return (
    <g opacity={opacity}>
      {glow && (
        <circle cx={cx} cy={cy} r={r * 2.2} fill={color} opacity={0.08} />
      )}
      {glow && (
        <circle cx={cx} cy={cy} r={r * 1.5} fill={color} opacity={0.14} />
      )}
      <circle cx={cx} cy={cy} r={r} fill={color} />
      {ring && (
        <circle cx={cx} cy={cy} r={r + 8} fill="none"
                stroke={ringColor || color} strokeWidth="1"
                strokeDasharray={ringDash || '2 4'} opacity="0.7" />
      )}
      {label && (
        <text x={cx + r + labelOffset} y={cy + 4}
              fill={labelColor || T.onDeepDim}
              fontFamily={T.mono} fontSize="11"
              letterSpacing="0.12em" textTransform="uppercase">
          {label}
        </text>
      )}
    </g>
  );
}

// CountUp — eases an integer/float from 0 → target across a span.
function CountUp({ to, format = fmtInt, ease = Easing.easeOutCubic, span = 0.7 }) {
  const { progress } = useSprite();
  const t = ease(Math.min(1, progress / span));
  return <>{format(to * t)}</>;
}

// FactLabel — the recurring "FACT 0X · TITLE" header
function FactLabel({ index, title, x = 120, y = 220 }) {
  const { localTime, duration } = useSprite();
  const entry = Math.min(1, localTime / 0.35);
  const exit = Math.max(0, (localTime - (duration - 0.5)) / 0.5);
  const op = entry * (1 - exit);
  const tx = (1 - entry) * -16;
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `translateX(${tx}px)`,
      opacity: op,
      display: 'flex', alignItems: 'center', gap: 14,
      fontFamily: T.mono, fontSize: 13, color: T.oceanGlow,
      textTransform: 'uppercase', letterSpacing: '0.18em',
    }}>
      <span style={{ color: T.ocean }}>FACT {String(index).padStart(2, '0')}</span>
      <span style={{ width: 28, height: 1, background: T.rule }} />
      <span style={{ color: T.onDeepDim }}>{title}</span>
    </div>
  );
}

// Headline — display-weight sans, fades + slides up
function Headline({ children, x = 120, y = 280, size = 96, maxWidth = 1100, color = T.onDeep }) {
  const { localTime, duration } = useSprite();
  const entry = Math.min(1, localTime / 0.6);
  const exit = Math.max(0, (localTime - (duration - 0.5)) / 0.5);
  const eased = Easing.easeOutCubic(entry);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, maxWidth,
      transform: `translateY(${(1 - eased) * 24}px)`,
      opacity: eased * (1 - exit),
      fontFamily: T.sans, fontWeight: 600,
      fontSize: size, lineHeight: 1.04,
      letterSpacing: '-0.025em',
      color, textWrap: 'pretty',
    }}>
      {children}
    </div>
  );
}

function Sub({ children, x = 120, y = 480, size = 22, color = T.onDeepDim, maxWidth = 720, delay = 0.2 }) {
  const { localTime, duration } = useSprite();
  const entry = Math.min(1, Math.max(0, (localTime - delay)) / 0.6);
  const exit = Math.max(0, (localTime - (duration - 0.5)) / 0.5);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, maxWidth,
      transform: `translateY(${(1 - entry) * 14}px)`,
      opacity: entry * (1 - exit),
      fontFamily: T.sans, fontSize: size,
      lineHeight: 1.45, color,
    }}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE 1 — Title: a small system slowly forming
// ═══════════════════════════════════════════════════════════════════════
function SceneTitle() {
  const { localTime, duration } = useSprite();
  const t = localTime;
  const fadeOut = Math.max(0, (t - (duration - 0.6)) / 0.6);

  // Orbits assemble
  const sunR    = lerp(0, 70, Easing.easeOutCubic(Math.min(1, t / 1.0)));
  const ringOp  = Math.min(1, Math.max(0, t - 0.4) / 0.6) * (1 - fadeOut);
  const planetOp = Math.min(1, Math.max(0, t - 0.8) / 0.8) * (1 - fadeOut);

  const cx = 1380, cy = 540;

  // Three orbits at increasing radii, decreasing speed
  const orbits = [
    { r: 130, speed: 0.9, pr: 14, color: T.forest, label: 'GO',    phase: 0.0 },
    { r: 215, speed: 0.55, pr: 18, color: T.mustard, label: 'MAYBE', phase: 1.7 },
    { r: 305, speed: 0.35, pr: 12, color: T.wine,    label: 'NOGO',  phase: 3.0 },
  ];

  return (
    <>
      <svg viewBox="0 0 1920 1080" width="1920" height="1080"
           style={{ position: 'absolute', inset: 0 }}>
        {/* Orbit rings */}
        {orbits.map((o, i) => (
          <circle key={i} cx={cx} cy={cy} r={o.r}
                  fill="none" stroke={T.rule} strokeWidth="1"
                  strokeDasharray="2 5" opacity={ringOp * 0.9} />
        ))}
        {/* Sun */}
        <g>
          <circle cx={cx} cy={cy} r={sunR * 2.4} fill={T.ocean} opacity={0.06} />
          <circle cx={cx} cy={cy} r={sunR * 1.6} fill={T.ocean} opacity={0.12} />
          <circle cx={cx} cy={cy} r={sunR} fill={T.ocean} />
          <circle cx={cx} cy={cy} r={sunR} fill="none" stroke={T.oceanGlow}
                  strokeWidth="1" opacity={0.4} />
        </g>
        {/* Planets */}
        {orbits.map((o, i) => {
          const a = o.phase + t * o.speed;
          const px = cx + Math.cos(a) * o.r;
          const py = cy + Math.sin(a) * o.r * 0.55; // slight ellipse
          return (
            <g key={i} opacity={planetOp}>
              <circle cx={px} cy={py} r={o.pr * 1.8} fill={o.color} opacity={0.15} />
              <circle cx={px} cy={py} r={o.pr} fill={o.color} />
              <text x={px + o.pr + 12} y={py + 4}
                    fill={o.color}
                    fontFamily={T.mono} fontSize="13" fontWeight="700"
                    letterSpacing="0.16em">
                {o.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Title block (left) */}
      <Sub x={120} y={340} size={14} color={T.ocean} delay={0.0}>
        <span style={{ fontFamily: T.mono, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          a cosmographic survey
        </span>
      </Sub>
      <Headline x={120} y={380} size={110} maxWidth={1100}>
        Field notes from the<br />
        <span style={{ color: T.oceanSoft }}>bidder's universe.</span>
      </Headline>
      <Sub x={120} y={680} size={24} maxWidth={760} delay={0.5}>
        Five observations about the Dutch tender market, mapped as celestial bodies.
        Pursue the bright ones. Let the rest drift past.
      </Sub>
      <Sub x={120} y={820} size={13} color={T.onDeepDim} delay={0.9}>
        <span style={{ fontFamily: T.mono, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
          Run time · 0:48 · CosmoTender intelligence
        </span>
      </Sub>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE 2 — €2 trillion: gravitational mass
// ═══════════════════════════════════════════════════════════════════════
function SceneMass() {
  const { localTime, duration } = useSprite();
  const t = localTime;

  // Big circle grows in
  const growth = Easing.easeOutCubic(Math.min(1, t / 1.4));
  const fadeOut = Math.max(0, (t - (duration - 0.6)) / 0.6);

  const cx = 1380, cy = 560;
  const bigR = lerp(0, 360, growth);
  const nlR  = lerp(0, 95, Easing.easeOutCubic(Math.min(1, Math.max(0, t - 1.0) / 1.0)));

  // Comparison dots — sub-markets within EU
  const comparisons = [
    { name: 'Defense', value: '€ 240 B', dx: -240, dy: -180, r: 26 },
    { name: 'Health',  value: '€ 310 B', dx:  220, dy: -120, r: 32 },
    { name: 'Infra',   value: '€ 180 B', dx:  140, dy:  210, r: 22 },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - fadeOut }}>
      <svg viewBox="0 0 1920 1080" width="1920" height="1080"
           style={{ position: 'absolute', inset: 0 }}>
        {/* EU mass */}
        <g>
          <circle cx={cx} cy={cy} r={bigR + 30} fill="none"
                  stroke={T.ocean} strokeWidth="1"
                  strokeDasharray="3 6" opacity={growth * 0.6} />
          <circle cx={cx} cy={cy} r={bigR} fill={T.ocean} opacity={growth * 0.12} />
          <circle cx={cx} cy={cy} r={bigR} fill="none" stroke={T.ocean}
                  strokeWidth="1.5" opacity={growth * 0.8} />
        </g>
        {/* Label EU */}
        <text x={cx} y={cy - bigR - 22}
              fill={T.oceanSoft} fontFamily={T.mono}
              fontSize="12" letterSpacing="0.18em"
              textAnchor="middle" opacity={growth}>
          EU PUBLIC PROCUREMENT
        </text>

        {/* NL nested */}
        <g>
          <circle cx={cx} cy={cy} r={nlR + 8} fill="none"
                  stroke={T.forest} strokeWidth="1" opacity={0.5} />
          <circle cx={cx} cy={cy} r={nlR} fill={T.forest} opacity={0.85} />
        </g>
        <text x={cx} y={cy + 6}
              fill={T.navy} fontFamily={T.mono} fontWeight="700"
              fontSize="18" letterSpacing="0.1em"
              textAnchor="middle"
              opacity={Math.min(1, Math.max(0, t - 1.8) / 0.5)}>
          NL
        </text>
        <text x={cx} y={cy + 28}
              fill={T.navyDeep} fontFamily={T.mono}
              fontSize="11" letterSpacing="0.14em"
              textAnchor="middle"
              opacity={Math.min(1, Math.max(0, t - 1.8) / 0.5)}>
          € 85 B
        </text>

        {/* Comparison satellites */}
        {comparisons.map((c, i) => {
          const op = Math.min(1, Math.max(0, t - 2.4 - i * 0.18) / 0.5);
          return (
            <g key={i} opacity={op}>
              <line x1={cx + c.dx} y1={cy + c.dy}
                    x2={cx + c.dx + (c.dx > 0 ? 90 : -90)}
                    y2={cy + c.dy + (c.dy > 0 ? 40 : -40)}
                    stroke={T.rule} strokeWidth="1" />
              <circle cx={cx + c.dx} cy={cy + c.dy} r={c.r}
                      fill={T.navySoft} stroke={T.oceanSoft}
                      strokeWidth="1" />
              <text x={cx + c.dx + (c.dx > 0 ? 100 : -100)}
                    y={cy + c.dy + (c.dy > 0 ? 50 : -50)}
                    textAnchor={c.dx > 0 ? 'start' : 'end'}
                    fill={T.onDeep} fontFamily={T.mono}
                    fontSize="12" letterSpacing="0.1em">
                {c.value}
                <tspan x={cx + c.dx + (c.dx > 0 ? 100 : -100)}
                       dy="16" fill={T.onDeepDim} fontSize="10"
                       letterSpacing="0.18em">
                  {c.name.toUpperCase()}
                </tspan>
              </text>
            </g>
          );
        })}
      </svg>

      <FactLabel index={1} title="Gravitational mass" />
      <Headline x={120} y={290} size={88} maxWidth={1000}>
        <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.oceanGlow }}>
          <CountUp to={2.0} format={(n) => '€ ' + n.toFixed(2) + ' T'} span={0.55} />
        </span>
        <span style={{ color: T.onDeepDim, fontSize: 32, fontWeight: 500, marginLeft: 18, letterSpacing: 0 }}>
          / year
        </span>
        <div style={{ marginTop: 18, fontSize: 64, color: T.onDeep, letterSpacing: '-0.02em' }}>
          The procurement belt orbits Europe.
        </div>
      </Headline>
      <Sub x={120} y={640} size={22} maxWidth={780} delay={1.4}>
        Public bodies across the EU buy roughly <strong style={{ color: T.onDeep }}>14% of GDP</strong>{' '}
        on the open market — and ~€85B of that flows through Dutch contracting
        authorities every year.
      </Sub>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE 3 — Velocity: a new tender every 21 minutes
// ═══════════════════════════════════════════════════════════════════════
const STREAM = (() => {
  const r = mulberry32(31);
  return Array.from({ length: 70 }, () => ({
    y: 280 + r() * 660,
    delay: r() * 5.5,
    speed: 280 + r() * 220,
    size: 4 + r() * 10,
    color: r() < 0.65 ? T.oceanSoft : r() < 0.85 ? T.forest : T.mustard,
    opacity: 0.4 + r() * 0.55,
  }));
})();

function SceneVelocity() {
  const { localTime, duration } = useSprite();
  const t = localTime;
  const fadeOut = Math.max(0, (t - (duration - 0.6)) / 0.6);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - fadeOut }}>
      <svg viewBox="0 0 1920 1080" width="1920" height="1080"
           style={{ position: 'absolute', inset: 0 }}>
        {/* TenderNed gate on the right */}
        <g opacity={Math.min(1, t / 0.5)}>
          <line x1="1520" y1="200" x2="1520" y2="980"
                stroke={T.ocean} strokeWidth="1.5" strokeDasharray="3 4" />
          <text x="1540" y="220" fill={T.oceanSoft}
                fontFamily={T.mono} fontSize="12" letterSpacing="0.18em">
            TENDERNED
          </text>
          <text x="1540" y="240" fill={T.onDeepDim}
                fontFamily={T.mono} fontSize="11" letterSpacing="0.14em">
            INGEST GATE
          </text>
        </g>

        {/* Streaming tender dots */}
        {STREAM.map((s, i) => {
          const start = s.delay;
          const elapsed = t - start;
          if (elapsed < 0) return null;
          // Travel from x=1900 → x=-50
          const x = 1900 - elapsed * s.speed;
          if (x < -50) return null;
          // Fade in first 80px, fade out last 200px
          let op = s.opacity;
          if (x > 1820) op *= (1900 - x) / 80;
          if (x < 100)  op *= Math.max(0, x + 50) / 150;
          return (
            <g key={i} opacity={op}>
              <circle cx={x} cy={s.y} r={s.size} fill={s.color} />
              <circle cx={x + s.size * 3} cy={s.y} r={s.size * 0.4}
                      fill={s.color} opacity="0.4" />
              <circle cx={x + s.size * 5} cy={s.y} r={s.size * 0.2}
                      fill={s.color} opacity="0.2" />
            </g>
          );
        })}
      </svg>

      <FactLabel index={2} title="Velocity" />
      <Headline x={120} y={290} size={88} maxWidth={1200}>
        <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.oceanGlow }}>
          <CountUp to={25000} format={fmtInt} span={0.7} />
        </span>
        <span style={{ color: T.onDeepDim, fontSize: 32, fontWeight: 500, marginLeft: 18, letterSpacing: 0 }}>
          new tenders / year
        </span>
        <div style={{ marginTop: 18, fontSize: 64, color: T.onDeep, letterSpacing: '-0.02em' }}>
          One new opportunity every<br />
          <span style={{ color: T.oceanSoft }}>21 minutes.</span>
        </div>
      </Headline>
      <Sub x={120} y={760} size={22} maxWidth={760} delay={1.0}>
        TenderNed publishes opportunities round the clock. Even at one minute
        of human attention per notice, that's <strong style={{ color: T.onDeep }}>
        416 hours</strong> a year just to read the headlines.
      </Sub>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE 4 — Approach angle: 1 in 5 wins
// ═══════════════════════════════════════════════════════════════════════
function SceneOdds() {
  const { localTime, duration } = useSprite();
  const t = localTime;
  const fadeOut = Math.max(0, (t - (duration - 0.6)) / 0.6);

  const cx = 1420, cy = 560;
  // Target / contract
  const targetR = lerp(0, 70, Easing.easeOutCubic(Math.min(1, t / 0.8)));

  // 5 approaching bodies — 4 burn up, 1 lands
  const approaches = [
    { start: 0.4, color: T.wine,   angle: 200, dist: 600, burn: 0.65, label: 'NOGO' },
    { start: 0.7, color: T.wine,   angle: 220, dist: 560, burn: 0.70, label: 'NOGO' },
    { start: 1.0, color: T.mustard, angle: 245, dist: 580, burn: 0.78, label: 'BURN' },
    { start: 1.3, color: T.mustard, angle: 160, dist: 540, burn: 0.72, label: 'BURN' },
    { start: 1.6, color: T.forest, angle: 180, dist: 620, burn: 1.0, label: 'GO' }, // this one lands
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - fadeOut }}>
      <svg viewBox="0 0 1920 1080" width="1920" height="1080"
           style={{ position: 'absolute', inset: 0 }}>
        {/* Atmosphere ring */}
        <circle cx={cx} cy={cy} r={targetR + 80}
                fill="none" stroke={T.ocean} strokeWidth="1"
                strokeDasharray="2 6" opacity="0.5" />
        <circle cx={cx} cy={cy} r={targetR + 160}
                fill="none" stroke={T.ocean} strokeWidth="1"
                strokeDasharray="2 8" opacity="0.3" />

        {/* Target */}
        <circle cx={cx} cy={cy} r={targetR} fill={T.ocean} />
        <circle cx={cx} cy={cy} r={targetR * 0.5} fill={T.oceanInk} />
        <text x={cx} y={cy + 6} textAnchor="middle"
              fill={T.oceanGlow} fontFamily={T.mono}
              fontSize="13" fontWeight="700" letterSpacing="0.12em">
          AWARD
        </text>

        {/* Approaches */}
        {approaches.map((a, i) => {
          const local = t - a.start;
          if (local < 0) return null;
          const dur = 2.6;
          const p = Math.min(1, local / dur);
          const eased = Easing.easeInCubic(p);
          const dist = lerp(a.dist, a.burn === 1 ? targetR + 14 : (1 - a.burn) * a.dist + a.dist * a.burn * 0.3, eased);
          // Compute position from polar angle
          const rad = (a.angle * Math.PI) / 180;
          const px = cx + Math.cos(rad) * dist;
          const py = cy + Math.sin(rad) * dist;

          // Body radius shrinks slightly as it burns
          const r = 16 * (a.burn === 1 ? 1 : Math.max(0.2, 1 - Math.max(0, (p - a.burn) / (1 - a.burn))));

          // Burnup flash
          const burnedT = a.burn < 1 ? Math.max(0, p - a.burn) / (1 - a.burn) : 0;
          const burnOp = Math.max(0, 1 - burnedT * 1.5);

          // Trail
          const tailLen = 90;
          const tailX = px - Math.cos(rad) * tailLen;
          const tailY = py - Math.sin(rad) * tailLen;

          return (
            <g key={i} opacity={burnOp}>
              <line x1={tailX} y1={tailY} x2={px} y2={py}
                    stroke={a.color} strokeWidth="1.5"
                    opacity="0.4" strokeLinecap="round" />
              <circle cx={px} cy={py} r={r * 1.8} fill={a.color} opacity={0.12} />
              <circle cx={px} cy={py} r={r} fill={a.color} />
              {burnedT > 0.05 && burnedT < 0.8 && (
                <circle cx={px} cy={py} r={r * (1 + burnedT * 3)}
                        fill="none" stroke={a.color}
                        strokeWidth="1.5" opacity={1 - burnedT} />
              )}
              {p > 0.05 && (
                <text x={px} y={py - r - 12} textAnchor="middle"
                      fill={a.color} fontFamily={T.mono}
                      fontSize="11" fontWeight="700" letterSpacing="0.12em">
                  {a.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <FactLabel index={3} title="Approach angle" />
      <Headline x={120} y={290} size={88} maxWidth={1000}>
        <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.oceanGlow }}>1</span>
        <span style={{ color: T.onDeepDim, marginLeft: 8, marginRight: 8 }}>in</span>
        <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.oceanGlow }}>5</span>
        <span style={{ color: T.onDeepDim, fontSize: 32, fontWeight: 500, marginLeft: 18, letterSpacing: 0 }}>
          bids lands the award.
        </span>
        <div style={{ marginTop: 18, fontSize: 64, color: T.onDeep, letterSpacing: '-0.02em' }}>
          The other four burn up<br />
          <span style={{ color: T.wine }}>on re-entry.</span>
        </div>
      </Headline>
      <Sub x={120} y={760} size={22} maxWidth={780} delay={1.0}>
        Industry-wide win rates hover around <strong style={{ color: T.onDeep }}>20%</strong>.
        Which is why the only economic move is to qualify hard, and only fly
        the trajectories you can actually finish.
      </Sub>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE 5 — Burn time: 80–400 hours per pursuit
// ═══════════════════════════════════════════════════════════════════════
function SceneBurnTime() {
  const { localTime, duration } = useSprite();
  const t = localTime;
  const fadeOut = Math.max(0, (t - (duration - 0.6)) / 0.6);

  // Spiral of dots — each dot is ~10 hours of work
  const totalDots = 40;
  const visibleDots = Math.floor(Math.min(totalDots, t * 14));

  const cx = 1420, cy = 540;
  const baseR = 90;

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - fadeOut }}>
      <svg viewBox="0 0 1920 1080" width="1920" height="1080"
           style={{ position: 'absolute', inset: 0 }}>
        {/* Core */}
        <circle cx={cx} cy={cy} r={48} fill={T.mustardDeep} />
        <circle cx={cx} cy={cy} r={48} fill="none" stroke={T.mustard}
                strokeWidth="1.5" opacity="0.7" />
        <text x={cx} y={cy - 4} textAnchor="middle"
              fill={T.mustard} fontFamily={T.mono}
              fontSize="11" letterSpacing="0.16em">
          BID
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle"
              fill={T.onDeep} fontFamily={T.mono} fontWeight="700"
              fontSize="14" letterSpacing="0.08em">
          PURSUIT
        </text>

        {/* Spiral arms — each dot adds onto a growing pursuit */}
        {Array.from({ length: visibleDots }, (_, i) => {
          const k = i / totalDots;
          const angle = k * TAU * 2.6 + t * 0.25;
          const r = baseR + k * 260;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r * 0.85;
          // First batch = qualification (forest), second batch = writing (ocean), last = wine if it stretches past
          const col = k < 0.35 ? T.forest : k < 0.75 ? T.ocean : T.mustard;
          // newest dot pulses
          const isNew = i === visibleDots - 1;
          return (
            <g key={i}>
              {isNew && (
                <circle cx={px} cy={py} r={16} fill={col} opacity="0.3" />
              )}
              <circle cx={px} cy={py} r={5 + k * 2} fill={col} />
            </g>
          );
        })}

        {/* Legend lines */}
        <g opacity={Math.min(1, Math.max(0, t - 2.0) / 0.6)}>
          <g transform="translate(1100, 920)">
            <circle cx="0" cy="0" r="5" fill={T.forest} />
            <text x="14" y="4" fill={T.onDeepDim} fontFamily={T.mono}
                  fontSize="11" letterSpacing="0.14em">
              QUALIFY · 70%
            </text>
          </g>
          <g transform="translate(1340, 920)">
            <circle cx="0" cy="0" r="5" fill={T.ocean} />
            <text x="14" y="4" fill={T.onDeepDim} fontFamily={T.mono}
                  fontSize="11" letterSpacing="0.14em">
              WRITE · 25%
            </text>
          </g>
          <g transform="translate(1560, 920)">
            <circle cx="0" cy="0" r="5" fill={T.mustard} />
            <text x="14" y="4" fill={T.onDeepDim} fontFamily={T.mono}
                  fontSize="11" letterSpacing="0.14em">
              REVIEW · 5%
            </text>
          </g>
        </g>
      </svg>

      <FactLabel index={4} title="Burn time" />
      <Headline x={120} y={290} size={88} maxWidth={1000}>
        <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.oceanGlow }}>
          <CountUp to={400} span={0.8} />
        </span>
        <span style={{ color: T.onDeepDim, fontSize: 32, fontWeight: 500, marginLeft: 18, letterSpacing: 0 }}>
          hours per serious bid.
        </span>
        <div style={{ marginTop: 18, fontSize: 60, color: T.onDeep, letterSpacing: '-0.02em' }}>
          And <span style={{ color: T.forest }}>most of it</span><br />
          is spent <em style={{ fontStyle: 'italic', color: T.oceanSoft }}>before</em> you write.
        </div>
      </Headline>
      <Sub x={120} y={760} size={22} maxWidth={760} delay={1.0}>
        A real pursuit absorbs 80–400 hours of senior time. The decisive
        spend is up-front — reading the dossier, mapping the requirements,
        deciding whether to fly at all.
      </Sub>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE 6 — Decay window: deadlines tighten
// ═══════════════════════════════════════════════════════════════════════
function SceneDeadline() {
  const { localTime, duration } = useSprite();
  const t = localTime;
  const fadeOut = Math.max(0, (t - (duration - 0.6)) / 0.6);

  const cx = 1380, cy = 560;
  const R = 280;

  // Clock-arc fills as time passes
  const arcProgress = Easing.easeInOutCubic(Math.min(1, t / 3.0));
  const dayMarker = Math.min(35, Math.round(arcProgress * 35));

  // Build clock arc
  const startA = -Math.PI / 2;
  const endA = startA + arcProgress * TAU;
  const arcPath = describeArc(cx, cy, R, startA, endA);

  // Bidder dots that wake up at different days — most cluster late
  const bidders = [
    { day: 4,  delay: 0.4, color: T.forest, label: 'Day 4 · 5%' },
    { day: 12, delay: 0.9, color: T.oceanSoft, label: 'Day 12 · 20%' },
    { day: 22, delay: 1.6, color: T.mustard, label: 'Day 22 · 45%' },
    { day: 30, delay: 2.2, color: T.wine, label: 'Day 30 · 80%' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - fadeOut }}>
      <svg viewBox="0 0 1920 1080" width="1920" height="1080"
           style={{ position: 'absolute', inset: 0 }}>
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={R} fill="none"
                stroke={T.rule} strokeWidth="1.5" />
        {/* Tick marks every 5 days */}
        {Array.from({ length: 7 }, (_, i) => {
          const a = -Math.PI / 2 + (i / 7) * TAU;
          const x1 = cx + Math.cos(a) * (R - 8);
          const y1 = cy + Math.sin(a) * (R - 8);
          const x2 = cx + Math.cos(a) * (R + 8);
          const y2 = cy + Math.sin(a) * (R + 8);
          const lx = cx + Math.cos(a) * (R + 30);
          const ly = cy + Math.sin(a) * (R + 30);
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={T.onDeepDim} strokeWidth="1" />
              <text x={lx} y={ly + 4} textAnchor="middle"
                    fill={T.onDeepDim} fontFamily={T.mono}
                    fontSize="11" letterSpacing="0.1em">
                D{i * 5}
              </text>
            </g>
          );
        })}

        {/* Filled arc */}
        <path d={arcPath} fill="none" stroke={T.ocean}
              strokeWidth="6" strokeLinecap="round" opacity="0.9" />

        {/* Bidder activity dots */}
        {bidders.map((b, i) => {
          const op = Math.min(1, Math.max(0, t - b.delay) / 0.5);
          const a = -Math.PI / 2 + (b.day / 35) * TAU;
          const px = cx + Math.cos(a) * R;
          const py = cy + Math.sin(a) * R;
          const labelOffset = b.day > 17 ? 1 : -1;
          return (
            <g key={i} opacity={op}>
              <circle cx={px} cy={py} r={14 + i * 3} fill={b.color} opacity="0.22" />
              <circle cx={px} cy={py} r={10 + i * 1.5} fill={b.color} />
              {/* Label */}
              <text x={px + (labelOffset > 0 ? 40 : -40)}
                    y={py + 5}
                    textAnchor={labelOffset > 0 ? 'start' : 'end'}
                    fill={T.onDeep} fontFamily={T.mono}
                    fontSize="13" letterSpacing="0.08em">
                {b.label}
              </text>
            </g>
          );
        })}

        {/* Center day counter */}
        <text x={cx} y={cy - 10} textAnchor="middle"
              fill={T.onDeepDim} fontFamily={T.mono} fontSize="13"
              letterSpacing="0.18em">
          DAY
        </text>
        <text x={cx} y={cy + 30} textAnchor="middle"
              fill={T.oceanGlow} fontFamily={T.mono} fontSize="56"
              fontWeight="700" letterSpacing="-0.02em">
          {String(dayMarker).padStart(2, '0')}
        </text>
        <text x={cx} y={cy + 56} textAnchor="middle"
              fill={T.onDeepDim} fontFamily={T.mono} fontSize="11"
              letterSpacing="0.18em">
          OF 35
        </text>
      </svg>

      <FactLabel index={5} title="Decay window" />
      <Headline x={120} y={290} size={88} maxWidth={1000}>
        <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.oceanGlow }}>
          35 days
        </span>
        <span style={{ color: T.onDeepDim, fontSize: 32, fontWeight: 500, marginLeft: 18, letterSpacing: 0 }}>
          from publish to submit.
        </span>
        <div style={{ marginTop: 18, fontSize: 60, color: T.onDeep, letterSpacing: '-0.02em' }}>
          Most bidders wake up<br />
          at <span style={{ color: T.wine }}>day 28.</span>
        </div>
      </Headline>
      <Sub x={120} y={760} size={22} maxWidth={780} delay={1.0}>
        EU procurement law sets a 35-day minimum response window. Half of
        bidders haven't started by day 22 — the ones who win started
        scoring on day one.
      </Sub>
    </div>
  );
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const x1 = cx + Math.cos(startAngle) * r;
  const y1 = cy + Math.sin(startAngle) * r;
  const x2 = cx + Math.cos(endAngle) * r;
  const y2 = cy + Math.sin(endAngle) * r;
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE 7 — Outro: find your signal
// ═══════════════════════════════════════════════════════════════════════
function SceneOutro() {
  const { localTime, duration } = useSprite();
  const t = localTime;
  const fadeOut = Math.max(0, (t - (duration - 0.4)) / 0.4);

  const cx = 960, cy = 580;

  // Many small noise dots fading into a single bright pulse
  const noiseDots = (() => {
    const r = mulberry32(99);
    return Array.from({ length: 90 }, () => ({
      a: r() * TAU,
      d: 200 + r() * 360,
      s: 2 + r() * 5,
      c: r() < 0.7 ? T.onDeepDim : (r() < 0.9 ? T.mustard : T.wine),
      delay: r() * 0.8,
    }));
  })();

  // Noise collapses toward center, signal pulses
  const collapse = Easing.easeInOutCubic(Math.min(1, t / 2.4));
  const signalR = 18 + Math.sin(t * 3) * 4 + collapse * 60;
  const signalOp = Math.min(1, Math.max(0, t - 1.2) / 0.8);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - fadeOut }}>
      <svg viewBox="0 0 1920 1080" width="1920" height="1080"
           style={{ position: 'absolute', inset: 0 }}>
        {/* Noise dissolving inward */}
        {noiseDots.map((d, i) => {
          const local = Math.max(0, t - d.delay);
          const p = Math.min(1, local / 2.0);
          const eased = Easing.easeInCubic(p);
          const dist = lerp(d.d, 0, eased);
          const px = cx + Math.cos(d.a) * dist;
          const py = cy + Math.sin(d.a) * dist * 0.7;
          const op = (1 - p) * 0.6;
          return (
            <circle key={i} cx={px} cy={py} r={d.s} fill={d.c} opacity={op} />
          );
        })}

        {/* Concentric pulses */}
        {[0, 1, 2].map((k) => {
          const phase = (t * 0.6 + k * 0.4) % 1.5;
          const rr = signalR + phase * 220;
          const op = Math.max(0, 0.55 - phase * 0.4) * signalOp;
          return (
            <circle key={k} cx={cx} cy={cy} r={rr}
                    fill="none" stroke={T.ocean} strokeWidth="1.5"
                    opacity={op} />
          );
        })}

        {/* Signal body */}
        <circle cx={cx} cy={cy} r={signalR * 1.8} fill={T.ocean} opacity={signalOp * 0.15} />
        <circle cx={cx} cy={cy} r={signalR} fill={T.ocean} opacity={signalOp} />
        <circle cx={cx} cy={cy} r={signalR * 0.5} fill={T.oceanGlow} opacity={signalOp} />
      </svg>

      {/* Bottom-anchored copy */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 760,
        textAlign: 'center', opacity: signalOp,
      }}>
        <div style={{
          fontFamily: T.mono, fontSize: 13, color: T.ocean,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          marginBottom: 18,
        }}>
          CosmoTender · Signal over noise
        </div>
        <div style={{
          fontFamily: T.sans, fontWeight: 600, fontSize: 96,
          color: T.onDeep, letterSpacing: '-0.025em', lineHeight: 1.0,
        }}>
          Find your signal.
        </div>
        <div style={{
          marginTop: 28, fontFamily: T.sans, fontSize: 20,
          color: T.onDeepDim, letterSpacing: '-0.005em',
        }}>
          Scored, sorted, ready by 08:00.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Scene timeline
// ═══════════════════════════════════════════════════════════════════════
const SCENES = [
  { name: 'Title',       start:  0.0, end:  6.5, Comp: SceneTitle },
  { name: 'Mass',        start:  6.5, end: 14.5, Comp: SceneMass },
  { name: 'Velocity',    start: 14.5, end: 22.0, Comp: SceneVelocity },
  { name: 'Odds',        start: 22.0, end: 30.5, Comp: SceneOdds },
  { name: 'Burn',        start: 30.5, end: 38.5, Comp: SceneBurnTime },
  { name: 'Deadline',    start: 38.5, end: 47.0, Comp: SceneDeadline },
  { name: 'Outro',       start: 47.0, end: 54.0, Comp: SceneOutro },
];
const DURATION = 54.0;

function App() {
  return (
    <Stage width={1920} height={1080} duration={DURATION}
           background={T.navy} loop autoplay persistKey="tender-cosmos">
      <Universe />
      {SCENES.map((s, i) => (
        <Sprite key={i} start={s.start} end={s.end}>
          <s.Comp />
        </Sprite>
      ))}
      <Chrome totalDuration={DURATION} scenes={SCENES} />
    </Stage>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
