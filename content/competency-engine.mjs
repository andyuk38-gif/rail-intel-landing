/**
 * Competency & Cycles hero — one isometric engine.
 * The core drives assessment and compliance; each branch shows what it feeds,
 * with a rule on the trace and a live feed on the branch.
 */

const esc = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;
const SCALE = 0.9;
const OX = 700;
const OY = 448;
const VB_W = 1400;
const VB_H = 880;

const BOARD_X = 468;
const BOARD_Y = 268;
const BOARD_Z = 20;
const CHIP = 116;
const CHIP_H = 40;

const TONE = {
  amber: "#f59e0b",
  green: "#34d399",
  steel: "#93c5fd",
};

const BRANCHES = [
  {
    id: "cycles",
    index: "01",
    label: "Cycles",
    feeds: "Start, expiry and events",
    rule: "One live cycle of each type",
    gate: "ONE LIVE",
    live: "Driver · 18 months",
    tone: "steel",
    x: -168,
    y: -248,
  },
  {
    id: "criteria",
    index: "02",
    label: "Criteria",
    feeds: "The framework on each cycle",
    rule: "Criteria linked before the cycle runs",
    gate: "LINKED",
    live: "36 criteria attached",
    tone: "steel",
    x: 96,
    y: -248,
  },
  {
    id: "standards",
    index: "03",
    label: "Standards",
    feeds: "Grade scales and timing rules",
    rule: "Company standard applied once",
    gate: "APPLIED",
    live: "Grade scale A–E",
    tone: "steel",
    x: 318,
    y: -158,
  },
  {
    id: "timing",
    index: "04",
    label: "Timing",
    feeds: "Daylight and darkness hours",
    rule: "Trainee hours checked against the standard",
    gate: "HOURS",
    live: "Darkness · 120h",
    tone: "steel",
    x: 392,
    y: 36,
  },
  {
    id: "compliance",
    index: "05",
    label: "Compliance",
    feeds: "Protecting your operations",
    rule: "A lapsed mandatory competency is flagged",
    gate: "IN DATE",
    live: "PTS clear · 0 lapsed",
    tone: "green",
    primary: true,
    x: 236,
    y: 236,
  },
  {
    id: "evidence",
    index: "06",
    label: "Evidence",
    feeds: "The signed observation record",
    rule: "A pass needs a recorded observation",
    gate: "SIGNED",
    live: "Signed · 09:14",
    tone: "steel",
    x: -8,
    y: 278,
  },
  {
    id: "assessments",
    index: "07",
    label: "Assessments",
    feeds: "In-cab Demonstrate and Explain",
    rule: "Flag a criterion that falls short",
    gate: "FLAG",
    live: "Cab assessment · unit 4",
    tone: "amber",
    primary: true,
    x: -268,
    y: 196,
  },
  {
    id: "development",
    index: "08",
    label: "Development",
    feeds: "Open points into the next cycle",
    rule: "Unresolved development points carry over",
    gate: "CARRY",
    live: "2 points open",
    tone: "steel",
    x: -404,
    y: 8,
  },
];

const TICKER = [
  "Check · early assessment window",
  "Rule · one live cycle of each type",
  "Feed · darkness hours minimum",
  "Check · template or custom cycle",
  "Rule · open development points carry over",
  "Feed · two-year driver cycle",
  "Check · one-year PTS cycle",
  "Rule · a short observation is flagged, not passed",
  "Feed · continuous cycle renewal",
  "Check · company timing standard",
];

function fmt(n) {
  return (Math.round(n * 10) / 10).toString();
}

function screen(x, y, z = 0) {
  return {
    x: OX + (x - y) * COS * SCALE,
    y: OY + ((x + y) * SIN - z) * SCALE,
  };
}

function pt(p) {
  return `${fmt(p.x)},${fmt(p.y)}`;
}

function poly(points) {
  return points.map(pt).join(" ");
}

function dedupe(points) {
  const out = [];
  for (const point of points) {
    const prev = out[out.length - 1];
    if (!prev || Math.hypot(prev.x - point.x, prev.y - point.y) > 1) out.push(point);
  }
  return out;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function chipExit(target) {
  const ax = Math.abs(target.x) / CHIP;
  const ay = Math.abs(target.y) / CHIP;
  const pad = 16;
  if (ax >= ay) {
    const s = Math.sign(target.x) || 1;
    return { x: s * (CHIP + pad), y: clamp(target.y * 0.42, -CHIP * 0.62, CHIP * 0.62) };
  }
  const s = Math.sign(target.y) || 1;
  return { x: clamp(target.x * 0.42, -CHIP * 0.62, CHIP * 0.62), y: s * (CHIP + pad) };
}

function route(target) {
  const exit = chipExit(target);
  const horizontal = Math.abs(exit.x) > CHIP;
  const launch = {
    x: exit.x + (horizontal ? Math.sign(exit.x) * 36 : 0),
    y: exit.y + (horizontal ? 0 : Math.sign(exit.y) * 36),
  };
  const elbow =
    Math.abs(target.x - launch.x) >= Math.abs(target.y - launch.y)
      ? { x: target.x, y: launch.y }
      : { x: launch.x, y: target.y };
  return dedupe([exit, launch, elbow, target]);
}

function toPath(boardPoints, z) {
  return boardPoints
    .map((point, index) => {
      const projected = screen(point.x, point.y, z);
      return `${index === 0 ? "M" : "L"}${fmt(projected.x)} ${fmt(projected.y)}`;
    })
    .join(" ");
}

function gateBoardPoint(path) {
  const node = path[path.length - 1];
  let best = null;
  let bestLen = 0;
  for (let i = 1; i < path.length; i += 1) {
    const a = path[i - 1];
    const b = path[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const point = { x: a.x + (b.x - a.x) * 0.34, y: a.y + (b.y - a.y) * 0.34 };
    const fromNode = Math.hypot(point.x - node.x, point.y - node.y);
    const fromChip = Math.hypot(point.x, point.y);
    if (len < bestLen || fromNode < 72 || fromChip < CHIP + 52) continue;
    best = point;
    bestLen = len;
  }
  return best || path[Math.min(1, path.length - 1)];
}

function anchorFor(point) {
  const center = screen(0, 0, BOARD_Z + CHIP_H);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  if (Math.abs(dx) > Math.abs(dy) * 0.85) return dx < 0 ? "left" : "right";
  return dy < 0 ? "top" : "bottom";
}

function boardCircle(cx, cy, z, r) {
  const c = screen(cx, cy, z);
  return { c, rx: r * COS * SCALE, ry: r * SIN * SCALE };
}

function pins() {
  const faces = [
    { x0: -CHIP, y0: -CHIP, x1: CHIP, y1: -CHIP, nx: 0, ny: -1 },
    { x0: CHIP, y0: -CHIP, x1: CHIP, y1: CHIP, nx: 1, ny: 0 },
    { x0: CHIP, y0: CHIP, x1: -CHIP, y1: CHIP, nx: 0, ny: 1 },
    { x0: -CHIP, y0: CHIP, x1: -CHIP, y1: -CHIP, nx: -1, ny: 0 },
  ];
  const count = 11;
  const width = 4.2;
  const length = 18;
  const z = BOARD_Z + 10;
  const quads = [];

  for (const face of faces) {
    const dx = face.x1 - face.x0;
    const dy = face.y1 - face.y0;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    for (let i = 0; i < count; i += 1) {
      const t = (i + 0.5) / count;
      const x = face.x0 + dx * t;
      const y = face.y0 + dy * t;
      const px = x - ux * width;
      const py = y - uy * width;
      const qx = x + ux * width;
      const qy = y + uy * width;
      quads.push(
        poly([
          screen(px, py, z),
          screen(qx, qy, z),
          screen(qx + face.nx * length, qy + face.ny * length, z),
          screen(px + face.nx * length, py + face.ny * length, z),
        ])
      );
    }
  }
  return quads;
}

function nodeButton(branch, side, left, top, extraClass) {
  const tone = TONE[branch.tone];
  const label = `${branch.label}. Feeds ${branch.feeds}. Rule: ${branch.rule}. Live feed: ${branch.live}.`;
  return `            <button type="button" class="engine-node engine-node--${side}${branch.primary ? " engine-node--primary" : ""} ${extraClass}${branch.id === "assessments" ? " is-on" : ""}" data-branch="${esc(branch.id)}" data-feeds="${esc(branch.feeds)}" data-rule="${esc(branch.rule)}" data-live="${esc(branch.live)}" data-tone="${esc(branch.tone)}" style="--node: ${tone}; left: ${left}%; top: ${top}%;" aria-pressed="${branch.id === "assessments" ? "true" : "false"}" aria-label="${esc(label)}">
              <span class="engine-node__top">
                <span class="engine-node__index">${esc(branch.index)}</span>
                <span class="engine-node__label">${esc(branch.label)}</span>
              </span>
              <span class="engine-node__feeds">${esc(branch.feeds)}</span>
              <span class="engine-node__live"><span class="engine-node__dot" aria-hidden="true"></span>${esc(branch.live)}</span>
            </button>`;
}

export function renderCompetencyEngineHero() {
  const traceZ = BOARD_Z + 1.5;
  const topZ = BOARD_Z + CHIP_H;
  const routes = BRANCHES.map((branch) => ({ branch, path: route(branch) }));

  const boardTop = poly([
    screen(-BOARD_X, -BOARD_Y, BOARD_Z),
    screen(BOARD_X, -BOARD_Y, BOARD_Z),
    screen(BOARD_X, BOARD_Y, BOARD_Z),
    screen(-BOARD_X, BOARD_Y, BOARD_Z),
  ]);
  const boardFront = poly([
    screen(-BOARD_X, BOARD_Y, BOARD_Z),
    screen(BOARD_X, BOARD_Y, BOARD_Z),
    screen(BOARD_X, BOARD_Y, 0),
    screen(-BOARD_X, BOARD_Y, 0),
  ]);
  const boardRight = poly([
    screen(BOARD_X, -BOARD_Y, BOARD_Z),
    screen(BOARD_X, BOARD_Y, BOARD_Z),
    screen(BOARD_X, BOARD_Y, 0),
    screen(BOARD_X, -BOARD_Y, 0),
  ]);

  const grid = [];
  for (let x = -BOARD_X + 36; x < BOARD_X; x += 36) {
    grid.push(
      `M${fmt(screen(x, -BOARD_Y, BOARD_Z).x)} ${fmt(screen(x, -BOARD_Y, BOARD_Z).y)} L${fmt(screen(x, BOARD_Y, BOARD_Z).x)} ${fmt(screen(x, BOARD_Y, BOARD_Z).y)}`
    );
  }
  for (let y = -BOARD_Y + 36; y < BOARD_Y; y += 36) {
    grid.push(
      `M${fmt(screen(-BOARD_X, y, BOARD_Z).x)} ${fmt(screen(-BOARD_X, y, BOARD_Z).y)} L${fmt(screen(BOARD_X, y, BOARD_Z).x)} ${fmt(screen(BOARD_X, y, BOARD_Z).y)}`
    );
  }

  const holes = [
    [-BOARD_X + 42, -BOARD_Y + 42],
    [BOARD_X - 42, -BOARD_Y + 42],
    [BOARD_X - 42, BOARD_Y - 42],
    [-BOARD_X + 42, BOARD_Y - 42],
  ].map(([x, y]) => boardCircle(x, y, BOARD_Z + 0.4, 11));

  const chipTop = [
    screen(-CHIP, -CHIP, topZ),
    screen(CHIP, -CHIP, topZ),
    screen(CHIP, CHIP, topZ),
    screen(-CHIP, CHIP, topZ),
  ];
  const dieInset = 30;
  const die = [
    screen(-CHIP + dieInset, -CHIP + dieInset, topZ + 1),
    screen(CHIP - dieInset, -CHIP + dieInset, topZ + 1),
    screen(CHIP - dieInset, CHIP - dieInset, topZ + 1),
    screen(-CHIP + dieInset, CHIP - dieInset, topZ + 1),
  ];
  const dieMinX = Math.min(...die.map((p) => p.x));
  const dieMaxX = Math.max(...die.map((p) => p.x));
  const dieMinY = Math.min(...die.map((p) => p.y));
  const dieMaxY = Math.max(...die.map((p) => p.y));
  const core = boardCircle(0, 0, topZ + 2, 26);
  const ringA = boardCircle(0, 0, topZ + 2, 34);
  const ringB = boardCircle(0, 0, topZ + 2, 46);

  const dieGrid = [];
  for (let i = 1; i < 5; i += 1) {
    const t = dieInset + ((CHIP * 2 - dieInset * 2) * i) / 5;
    dieGrid.push(toPath([{ x: -CHIP + t, y: -CHIP + dieInset }, { x: -CHIP + t, y: CHIP - dieInset }], topZ + 1.2));
    dieGrid.push(toPath([{ x: -CHIP + dieInset, y: -CHIP + t }, { x: CHIP - dieInset, y: -CHIP + t }], topZ + 1.2));
  }

  const branchMarkup = routes
    .map(({ branch, path }, index) => {
      const tone = TONE[branch.tone];
      const d = toPath(path, traceZ);
      const gateAt = gateBoardPoint(path);
      const gatePoint = screen(gateAt.x, gateAt.y, traceZ + 8);
      const width = Math.max(58, branch.gate.length * 6.6 + 16);
      const delay = (-index * 0.37).toFixed(2);
      const duration = (branch.primary ? 2.4 : 3.1 + (index % 3) * 0.35).toFixed(2);
      return `        <path class="engine-trace${branch.primary ? " engine-trace--primary" : ""}${branch.id === "assessments" ? " is-on" : ""}" data-branch="${esc(branch.id)}" d="${d}" pathLength="100" style="color: ${tone}" />
        <path class="engine-packet${branch.id === "assessments" ? " is-on" : ""}" data-branch="${esc(branch.id)}" d="${d}" pathLength="100" style="color: ${tone}; animation-duration: ${duration}s; animation-delay: ${delay}s" />
        <g class="engine-gate${branch.id === "assessments" ? " is-on" : ""}" data-branch="${esc(branch.id)}">
          <rect x="${fmt(gatePoint.x - width / 2)}" y="${fmt(gatePoint.y - 9)}" width="${fmt(width)}" height="18" rx="9" fill="#0c121b" stroke="${tone}" />
          <text x="${fmt(gatePoint.x)}" y="${fmt(gatePoint.y + 3.5)}" fill="${tone}">${esc(branch.gate)}</text>
        </g>`;
    })
    .join("\n");

  const pinMarkup = pins()
    .map((points) => `        <polygon class="engine-pin" points="${points}" />`)
    .join("\n");

  const holeMarkup = holes
    .map(
      (hole) =>
        `        <ellipse class="engine-hole" cx="${fmt(hole.c.x)}" cy="${fmt(hole.c.y)}" rx="${fmt(hole.rx)}" ry="${fmt(hole.ry)}" />`
    )
    .join("\n");

  const nodes = routes
    .map(({ branch, path }) => {
      const end = screen(path[path.length - 1].x, path[path.length - 1].y, traceZ);
      const side = anchorFor(end);
      const left = ((end.x / VB_W) * 100).toFixed(3);
      const top = ((end.y / VB_H) * 100).toFixed(3);
      return nodeButton(branch, side, left, top, "engine-node--board");
    })
    .join("\n");

  const list = BRANCHES.map((branch) => {
    const tone = TONE[branch.tone];
    const label = `${branch.label}. Feeds ${branch.feeds}. Rule: ${branch.rule}. Live feed: ${branch.live}.`;
    return `            <button type="button" class="engine-list__item${branch.primary ? " engine-list__item--primary" : ""}${branch.id === "assessments" ? " is-on" : ""}" data-branch="${esc(branch.id)}" data-feeds="${esc(branch.feeds)}" data-rule="${esc(branch.rule)}" data-live="${esc(branch.live)}" data-tone="${esc(branch.tone)}" style="--node: ${tone}" aria-pressed="${branch.id === "assessments" ? "true" : "false"}" aria-label="${esc(label)}">
              <span class="engine-list__index">${esc(branch.index)}</span>
              <span class="engine-list__copy">
                <span class="engine-list__label">${esc(branch.label)}</span>
                <span class="engine-list__feeds">${esc(branch.feeds)}</span>
              </span>
              <span class="engine-list__meta">
                <span class="engine-list__rule">${esc(branch.gate)}</span>
                <span class="engine-list__live"><span class="engine-node__dot" aria-hidden="true"></span>${esc(branch.live)}</span>
              </span>
            </button>`;
  }).join("\n");

  const coreLabel = screen(0, 0, topZ + 2);
  const coreLeft = ((coreLabel.x / VB_W) * 100).toFixed(3);
  const coreTop = ((coreLabel.y / VB_H) * 100).toFixed(3);
  const tickerItems = [...TICKER, ...TICKER]
    .map((item) => `                <span class="engine-ticker__item">${esc(item)}</span>`)
    .join("\n");

  const defaultBranch = BRANCHES.find((branch) => branch.id === "assessments");

  return `        <div class="engine" data-competency-engine data-active="assessments">
          <p class="sr-only">The competency engine sits at the centre. Branches leave it for cycles, criteria, standards, timing, compliance, evidence, assessments and development. Each branch shows what the engine feeds, the rule checked along that trace, and a live feed.</p>
          <div class="engine__bar">
            <span class="engine__status"><span class="engine__status-dot" aria-hidden="true"></span>Live feeds</span>
            <span class="engine__device">Competency engine</span>
            <span class="engine__outputs">Drives assessment and compliance</span>
          </div>
          <div class="engine__viewport">
            <div class="engine__scene" data-engine-scene>
              <svg class="engine__svg" viewBox="0 0 ${VB_W} ${VB_H}" role="presentation" aria-hidden="true">
                <defs>
                  <linearGradient id="engine-board" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#1a2433" />
                    <stop offset="0.55" stop-color="#121a26" />
                    <stop offset="1" stop-color="#0d141e" />
                  </linearGradient>
                  <linearGradient id="engine-board-side" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#1c2838" />
                    <stop offset="1" stop-color="#090e15" />
                  </linearGradient>
                  <linearGradient id="engine-pkg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#314158" />
                    <stop offset="0.48" stop-color="#1c2838" />
                    <stop offset="1" stop-color="#121a26" />
                  </linearGradient>
                  <linearGradient id="engine-pkg-side" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#243246" />
                    <stop offset="1" stop-color="#101720" />
                  </linearGradient>
                  <radialGradient id="engine-core" cx="50%" cy="46%" r="52%">
                    <stop offset="0" stop-color="#fff4d6" />
                    <stop offset="28%" stop-color="#fbbf24" />
                    <stop offset="62%" stop-color="#f59e0b" stop-opacity="0.35" />
                    <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
                  </radialGradient>
                  <linearGradient id="engine-scan-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stop-color="#fbbf24" stop-opacity="0" />
                    <stop offset="50%" stop-color="#fff7e8" stop-opacity="0.7" />
                    <stop offset="100%" stop-color="#fbbf24" stop-opacity="0" />
                  </linearGradient>
                  <filter id="engine-glow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="6" />
                  </filter>
                  <clipPath id="engine-board-clip">
                    <polygon points="${boardTop}" />
                  </clipPath>
                  <clipPath id="engine-die-clip">
                    <polygon points="${poly(die)}" />
                  </clipPath>
                </defs>
                <ellipse class="engine-floor" cx="${OX}" cy="${fmt(screen(0, 40, 0).y)}" rx="430" ry="78" />
                <polygon class="engine-board__side" points="${boardFront}" fill="url(#engine-board-side)" />
                <polygon class="engine-board__side engine-board__side--right" points="${boardRight}" fill="url(#engine-board-side)" />
                <polygon class="engine-board__top" points="${boardTop}" fill="url(#engine-board)" />
                <g clip-path="url(#engine-board-clip)">
                  <path class="engine-grid" d="${grid.join(" ")}" />
                </g>
${holeMarkup}
${branchMarkup}
${pinMarkup}
                <polygon class="engine-chip__side" points="${poly([
                  screen(-CHIP, CHIP, topZ),
                  screen(CHIP, CHIP, topZ),
                  screen(CHIP, CHIP, BOARD_Z),
                  screen(-CHIP, CHIP, BOARD_Z),
                ])}" />
                <polygon class="engine-chip__side engine-chip__side--right" points="${poly([
                  screen(CHIP, -CHIP, topZ),
                  screen(CHIP, CHIP, topZ),
                  screen(CHIP, CHIP, BOARD_Z),
                  screen(CHIP, -CHIP, BOARD_Z),
                ])}" />
                <polygon class="engine-chip__top" points="${poly(chipTop)}" />
                <polygon class="engine-die" points="${poly(die)}" />
                <g clip-path="url(#engine-die-clip)">
                  <path class="engine-die__grid" d="${dieGrid.join(" ")}" />
                  <rect class="engine-scan" x="${fmt(dieMinX)}" y="${fmt(dieMinY)}" width="26" height="${fmt(dieMaxY - dieMinY)}" fill="url(#engine-scan-grad)" style="--scan: ${fmt(dieMaxX - dieMinX)}px" />
                </g>
                <ellipse class="engine-core" cx="${fmt(core.c.x)}" cy="${fmt(core.c.y)}" rx="${fmt(core.rx)}" ry="${fmt(core.ry)}" filter="url(#engine-glow)" />
                <ellipse class="engine-core__hot" cx="${fmt(core.c.x)}" cy="${fmt(core.c.y)}" rx="${fmt(core.rx * 0.42)}" ry="${fmt(core.ry * 0.42)}" />
                <ellipse class="engine-ring" cx="${fmt(ringA.c.x)}" cy="${fmt(ringA.c.y)}" rx="${fmt(ringA.rx)}" ry="${fmt(ringA.ry)}" />
                <ellipse class="engine-ring engine-ring--compliance" cx="${fmt(ringB.c.x)}" cy="${fmt(ringB.c.y)}" rx="${fmt(ringB.rx)}" ry="${fmt(ringB.ry)}" />
              </svg>
              <p class="engine-core-label" style="left: ${coreLeft}%; top: ${coreTop}%;">
                <span class="engine-core-label__mark">Core</span>
                <span class="engine-core-label__live"><span class="engine-core-label__dot" aria-hidden="true"></span>Live</span>
              </p>
${nodes}
            </div>
          </div>
          <div class="engine-list">
${list}
          </div>
          <div class="engine-bezel">
            <div class="engine-readout" id="competency-engine-readout">
              <p class="engine-readout__item">
                <span class="engine-readout__kicker">Feeds</span>
                <strong data-engine-feeds>${esc(defaultBranch.feeds)}</strong>
              </p>
              <p class="engine-readout__item">
                <span class="engine-readout__kicker">Rule</span>
                <strong data-engine-rule>${esc(defaultBranch.rule)}</strong>
              </p>
              <p class="engine-readout__item">
                <span class="engine-readout__kicker">Live feed</span>
                <strong data-engine-live>${esc(defaultBranch.live)}</strong>
              </p>
            </div>
            <div class="engine-bezel__foot">
              <button type="button" class="engine-toggle" data-engine-toggle aria-pressed="false">Pause</button>
              <div class="engine-ticker" aria-hidden="true">
                <div class="engine-ticker__track">
${tickerItems}
                </div>
              </div>
            </div>
          </div>
        </div>`;
}
