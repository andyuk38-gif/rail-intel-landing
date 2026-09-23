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
const TOP_Z = BOARD_Z + CHIP_H;

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

const ADDONS = [
  {
    id: "qa",
    label: "QA",
    color: "#c084fc",
    x: -220,
    y: -132,
    points: [
      { x: -136, y: -132 },
      { x: -220, y: -132 },
    ],
  },
  {
    id: "tasks",
    label: "Tasks",
    color: "#22d3ee",
    x: -158,
    y: 252,
    points: [
      { x: -82, y: 134 },
      { x: -82, y: 252 },
      { x: -158, y: 252 },
    ],
  },
  { id: "briefs", label: "Briefs", color: "#fb7185", x: -400, y: -150 },
  { id: "trainee", label: "Trainee", color: "#818cf8", x: -45, y: -225 },
  {
    id: "reports",
    label: "Reports",
    color: "#f472b6",
    x: 108,
    y: -178,
    points: [
      { x: 108, y: -134 },
      { x: 108, y: -178 },
    ],
  },
  { id: "leave", label: "Leave", color: "#2dd4bf", x: -260, y: 110 },
  { id: "medication", label: "Medication", color: "#fb923c", x: 400, y: 150 },
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

function edgeMarks({ z, length, width, gap = 0 }) {
  const faces = [
    { x0: -CHIP, y0: -CHIP, x1: CHIP, y1: -CHIP, nx: 0, ny: -1 },
    { x0: CHIP, y0: -CHIP, x1: CHIP, y1: CHIP, nx: 1, ny: 0 },
    { x0: CHIP, y0: CHIP, x1: -CHIP, y1: CHIP, nx: 0, ny: 1 },
    { x0: -CHIP, y0: CHIP, x1: -CHIP, y1: -CHIP, nx: -1, ny: 0 },
  ];
  const count = 11;
  const quads = [];
  const points = [];

  for (const face of faces) {
    const dx = face.x1 - face.x0;
    const dy = face.y1 - face.y0;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    for (let i = 0; i < count; i += 1) {
      const t = (i + 0.5) / count;
      const x = face.x0 + dx * t + face.nx * gap;
      const y = face.y0 + dy * t + face.ny * gap;
      const px = x - ux * width;
      const py = y - uy * width;
      const qx = x + ux * width;
      const qy = y + uy * width;
      const corners = [
        screen(px, py, z),
        screen(qx, qy, z),
        screen(qx + face.nx * length, qy + face.ny * length, z),
        screen(px + face.nx * length, py + face.ny * length, z),
      ];
      quads.push(poly(corners));
      points.push(...corners);
    }
  }
  return { quads, points };
}

function pins() {
  return edgeMarks({ z: BOARD_Z + 10, length: 18, width: 4.2, gap: 0 }).quads;
}

function boundsOf(points, pad) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    if (point.x < minX) minX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.x > maxX) maxX = point.x;
    if (point.y > maxY) maxY = point.y;
  }
  return {
    x: minX - pad,
    y: minY - pad,
    w: maxX - minX + pad * 2,
    h: maxY - minY + pad * 2,
  };
}

function diamond(size, z) {
  return [
    screen(-size, -size, z),
    screen(size, -size, z),
    screen(size, size, z),
    screen(-size, size, z),
  ];
}

function chipBox() {
  const pinPoints = edgeMarks({ z: BOARD_Z + 10, length: 18, width: 4.2, gap: 0 }).points;
  return boundsOf(
    [
      ...pinPoints,
      ...diamond(CHIP, TOP_Z),
      ...diamond(CHIP, BOARD_Z),
    ],
    8
  );
}

function chipIds(prefix) {
  if (prefix === "engine") {
    return {
      pkg: "engine-pkg",
      side: "engine-pkg-side",
      die: "engine-die-matte",
      clip: "engine-die-clip",
    };
  }
  return {
    pkg: "token-pkg",
    side: "token-pkg-side",
    die: "token-die",
    clip: "token-die-clip",
  };
}

function chipDefs(prefix) {
  const ids = chipIds(prefix);
  const dieInset = 16;
  const die = diamond(CHIP - dieInset, TOP_Z + 1);
  return `                  <linearGradient id="${ids.pkg}" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#314158" />
                    <stop offset="0.48" stop-color="#1c2838" />
                    <stop offset="1" stop-color="#121a26" />
                  </linearGradient>
                  <linearGradient id="${ids.side}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#243246" />
                    <stop offset="1" stop-color="#101720" />
                  </linearGradient>
                  <linearGradient id="${ids.die}" gradientUnits="userSpaceOnUse" x1="${fmt(die[0].x)}" y1="${fmt(die[0].y)}" x2="${fmt(die[2].x)}" y2="${fmt(die[2].y)}">
                    <stop offset="0" stop-color="#4a5160" />
                    <stop offset="0.42" stop-color="#3a414c" />
                    <stop offset="1" stop-color="#2a3038" />
                  </linearGradient>
                  <clipPath id="${ids.clip}">
                    <polygon points="${poly(die)}" />
                  </clipPath>`;
}

function chipBody(base, prefix) {
  const ids = chipIds(prefix);
  const dieInset = 16;
  const pinMarkup = pins()
    .map((points) => `        <polygon class="engine-pin" points="${points}" />`)
    .join("\n");
  return `${pinMarkup}
                <polygon class="engine-chip__side" points="${poly([
                  screen(-CHIP, CHIP, TOP_Z),
                  screen(CHIP, CHIP, TOP_Z),
                  screen(CHIP, CHIP, BOARD_Z),
                  screen(-CHIP, CHIP, BOARD_Z),
                ])}" fill="url(#${ids.side})" />
                <polygon class="engine-chip__side engine-chip__side--right" points="${poly([
                  screen(CHIP, -CHIP, TOP_Z),
                  screen(CHIP, CHIP, TOP_Z),
                  screen(CHIP, CHIP, BOARD_Z),
                  screen(CHIP, -CHIP, BOARD_Z),
                ])}" fill="url(#${ids.side})" />
                <polygon class="engine-chip__top" points="${poly(diamond(CHIP, TOP_Z))}" fill="url(#${ids.pkg})" />
                <polygon class="engine-die" points="${poly(diamond(CHIP - dieInset, TOP_Z + 1))}" fill="url(#${ids.die})" />
                <g clip-path="url(#${ids.clip})">
                  <g class="engine-brand" transform="${brandPlane(TOP_Z + 2.2)}">
                    <image href="${esc(base)}images/rail-intel-icon.png" x="-38" y="-74" width="76" height="76" />
                    <text class="engine-brand__by" x="0" y="40" text-anchor="middle">powered by</text>
                    <text class="engine-brand__name" x="0" y="76" text-anchor="middle">Rail Intel</text>
                  </g>
                </g>`;
}

function nodeButton(branch, side, left, top, extraClass, enterIndex) {
  const tone = TONE[branch.tone];
  const label = `${branch.label}. Feeds ${branch.feeds}. Rule: ${branch.rule}. Live feed: ${branch.live}.`;
  return `            <button type="button" class="engine-node engine-node--${side}${branch.primary ? " engine-node--primary" : ""} ${extraClass}${branch.id === "assessments" ? " is-on" : ""}" data-branch="${esc(branch.id)}" data-feeds="${esc(branch.feeds)}" data-rule="${esc(branch.rule)}" data-live="${esc(branch.live)}" data-tone="${esc(branch.tone)}" style="--node: ${tone}; --in: ${enterIndex}; left: ${left}%; top: ${top}%;" aria-pressed="${branch.id === "assessments" ? "true" : "false"}" tabindex="-1" aria-hidden="true" aria-label="${esc(label)}">
              <span class="engine-node__top">
                <span class="engine-node__index">${esc(branch.index)}</span>
                <span class="engine-node__label">${esc(branch.label)}</span>
              </span>
              <span class="engine-node__feeds">${esc(branch.feeds)}</span>
              <span class="engine-node__live"><span class="engine-node__dot" aria-hidden="true"></span>${esc(branch.live)}</span>
            </button>`;
}

function brandPlane(z) {
  const origin = screen(0, 0, z);
  return `matrix(${fmt(COS * SCALE)} ${fmt(SIN * SCALE)} ${fmt(-COS * SCALE)} ${fmt(SIN * SCALE)} ${fmt(origin.x)} ${fmt(origin.y)})`;
}

function socketMarkup() {
  const housing = diamond(CHIP + 14, BOARD_Z + 1.5);
  const cavity = diamond(CHIP - 2, BOARD_Z + 0.8);
  const floor = diamond(CHIP - 26, BOARD_Z + 0.35);
  const pads = edgeMarks({ z: BOARD_Z + 2.5, length: 13, width: 3.05, gap: 2 });
  const padMarkup = pads.quads
    .map((points) => `          <polygon class="engine-socket__pad" points="${points}" />`)
    .join("\n");
  const pulseAt = screen(0, 0, BOARD_Z + 2);
  const pulseX = screen(CHIP + 36, -(CHIP + 36), BOARD_Z + 2);
  const pulseY = screen(CHIP + 36, CHIP + 36, BOARD_Z + 2);
  const key = poly([
    screen(-CHIP + 10, -CHIP + 28, BOARD_Z + 3),
    screen(-CHIP + 28, -CHIP + 10, BOARD_Z + 3),
    screen(-CHIP + 10, -CHIP + 10, BOARD_Z + 3),
  ]);
  const bracketSize = CHIP + 6;
  const arm = 28;
  const z = BOARD_Z + 3.2;
  const brackets = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ]
    .map(([sx, sy]) => {
      const x = sx * bracketSize;
      const y = sy * bracketSize;
      const origin = screen(x, y, z);
      const alongX = screen(x - sx * arm, y, z);
      const alongY = screen(x, y - sy * arm, z);
      return `M${fmt(origin.x)} ${fmt(origin.y)} L${fmt(alongX.x)} ${fmt(alongX.y)} M${fmt(origin.x)} ${fmt(origin.y)} L${fmt(alongY.x)} ${fmt(alongY.y)}`;
    })
    .join(" ");

  return `        <g class="engine-socket">
          <ellipse class="engine-socket__pulse" cx="${fmt(pulseAt.x)}" cy="${fmt(pulseAt.y)}" rx="${fmt(Math.abs(pulseX.x - pulseAt.x))}" ry="${fmt(Math.abs(pulseY.y - pulseAt.y))}" />
          <polygon class="engine-socket__housing" points="${poly(housing)}" />
${padMarkup}
          <polygon class="engine-socket__cavity" points="${poly(cavity)}" />
          <polygon class="engine-socket__floor" points="${poly(floor)}" />
          <polygon class="engine-socket__key" points="${key}" />
          <path class="engine-socket__brackets" d="${brackets}" />
          <g class="engine-socket__cross" transform="${brandPlane(BOARD_Z + 2.2)}">
            <path d="M-16 0 H16 M0 -16 V16" />
          </g>
        </g>`;
}

export function renderCompetencyEngineHero(base = "../") {
  const traceZ = BOARD_Z + 1.5;
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

  const seat = chipBox();
  const seatStyle = `left:${((seat.x / VB_W) * 100).toFixed(3)}%;top:${((seat.y / VB_H) * 100).toFixed(3)}%;width:${((seat.w / VB_W) * 100).toFixed(3)}%;height:${((seat.h / VB_H) * 100).toFixed(3)}%`;

  const addonTraceMarkup = ADDONS.map((addon, index) => {
    const d = toPath(addon.points || route(addon), traceZ);
    const delay = (-index * 0.42).toFixed(2);
    const draw = (0.2 + index * 0.05).toFixed(2);
    return `        <path class="engine-trace engine-trace--addon" d="${d}" pathLength="100" style="color: ${addon.color}; --draw: ${draw}s" />
        <path class="engine-packet engine-packet--addon" d="${d}" pathLength="100" style="color: ${addon.color}; animation-duration: 3.6s; animation-delay: ${delay}s" />`;
  }).join("\n");

  const addonPillMarkup = ADDONS.map((addon) => {
    const end = addon.points ? addon.points[addon.points.length - 1] : addon;
    const point = screen(end.x, end.y, traceZ + 8);
    const width = Math.max(52, addon.label.length * 7.4 + 22);
    const height = 22;
    return `        <g class="engine-pill">
          <rect x="${fmt(point.x - width / 2)}" y="${fmt(point.y - height / 2)}" width="${fmt(width)}" height="${height}" rx="11" fill="#0c121b" stroke="${addon.color}" />
          <text x="${fmt(point.x)}" y="${fmt(point.y + 4)}" fill="${addon.color}">${esc(addon.label)}</text>
        </g>`;
  }).join("\n");

  const branchMarkup = routes
    .map(({ branch, path }, index) => {
      const tone = TONE[branch.tone];
      const d = toPath(path, traceZ);
      const gateAt = gateBoardPoint(path);
      const gatePoint = screen(gateAt.x, gateAt.y, traceZ + 8);
      const width = Math.max(58, branch.gate.length * 6.6 + 16);
      const delay = (-index * 0.37).toFixed(2);
      const duration = (branch.primary ? 2.4 : 3.1 + (index % 3) * 0.35).toFixed(2);
      const draw = (index * 0.06).toFixed(2);
      return `        <path class="engine-trace${branch.primary ? " engine-trace--primary" : ""}${branch.id === "assessments" ? " is-on" : ""}" data-branch="${esc(branch.id)}" d="${d}" pathLength="100" style="color: ${tone}; --draw: ${draw}s" />
        <path class="engine-packet${branch.id === "assessments" ? " is-on" : ""}" data-branch="${esc(branch.id)}" d="${d}" pathLength="100" style="color: ${tone}; animation-duration: ${duration}s; animation-delay: ${delay}s" />
        <g class="engine-gate${branch.id === "assessments" ? " is-on" : ""}" data-branch="${esc(branch.id)}">
          <rect x="${fmt(gatePoint.x - width / 2)}" y="${fmt(gatePoint.y - 9)}" width="${fmt(width)}" height="18" rx="9" fill="#0c121b" stroke="${tone}" />
          <text x="${fmt(gatePoint.x)}" y="${fmt(gatePoint.y + 3.5)}" fill="${tone}">${esc(branch.gate)}</text>
        </g>`;
    })
    .join("\n");

  const holeMarkup = holes
    .map(
      (hole) =>
        `        <ellipse class="engine-hole" cx="${fmt(hole.c.x)}" cy="${fmt(hole.c.y)}" rx="${fmt(hole.rx)}" ry="${fmt(hole.ry)}" />`
    )
    .join("\n");

  const nodes = routes
    .map(({ branch, path }, index) => {
      const end = screen(path[path.length - 1].x, path[path.length - 1].y, traceZ);
      const side = anchorFor(end);
      const left = ((end.x / VB_W) * 100).toFixed(3);
      const top = ((end.y / VB_H) * 100).toFixed(3);
      return nodeButton(branch, side, left, top, "engine-node--board", index);
    })
    .join("\n");

  const list = BRANCHES.map((branch) => {
    const tone = TONE[branch.tone];
    const label = `${branch.label}. Feeds ${branch.feeds}. Rule: ${branch.rule}. Live feed: ${branch.live}.`;
    return `            <button type="button" class="engine-list__item${branch.primary ? " engine-list__item--primary" : ""}${branch.id === "assessments" ? " is-on" : ""}" data-branch="${esc(branch.id)}" data-feeds="${esc(branch.feeds)}" data-rule="${esc(branch.rule)}" data-live="${esc(branch.live)}" data-tone="${esc(branch.tone)}" style="--node: ${tone}" aria-pressed="${branch.id === "assessments" ? "true" : "false"}" tabindex="-1" aria-hidden="true" aria-label="${esc(label)}">
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

  const tickerItems = [...TICKER, ...TICKER]
    .map((item) => `                <span class="engine-ticker__item">${esc(item)}</span>`)
    .join("\n");

  const defaultBranch = BRANCHES.find((branch) => branch.id === "assessments");

  return `        <div class="engine" data-competency-engine data-active="assessments">
          <p class="sr-only">The competency engine starts in the tray beside this introduction. Drag it into the empty socket on the board, or press the chip to seat it. Once it connects, branches leave the engine for cycles, criteria, standards, timing, compliance, evidence, assessments and development. Each branch shows what the engine feeds, the rule checked along that trace, and a live feed. Optional add-ons leave on separate coloured traces, labelled QA, Tasks, Briefs, Trainee, Reports, Leave and Medication.</p>
          <p class="sr-only" data-engine-announce aria-live="polite"></p>
          <div class="engine__bar">
            <span class="engine__status"><span class="engine__status-dot" aria-hidden="true"></span><span data-engine-status-label>Socket open</span></span>
            <span class="engine__device" data-engine-device>Awaiting Rail Intel Technologies</span>
            <span class="engine__outputs" data-engine-outputs>Drag the chip to seat</span>
          </div>
          <div class="engine__viewport">
            <div class="engine-surge" aria-hidden="true"></div>
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
                  <linearGradient id="engine-socket-well" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#05080d" />
                    <stop offset="1" stop-color="#121a26" />
                  </linearGradient>
${chipDefs("engine")}
                  <clipPath id="engine-board-clip">
                    <polygon points="${boardTop}" />
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
${socketMarkup()}
                <g class="engine-live-layer">
${addonTraceMarkup}
${branchMarkup}
${addonPillMarkup}
                </g>
                <g class="engine-chip">
${chipBody(base, "engine")}
                </g>
              </svg>
              <div class="engine-socket-hit" data-engine-socket style="${seatStyle}">
                <span class="engine-socket-hit__label engine-socket-hit__label--idle">Drop here</span>
                <span class="engine-socket-hit__label engine-socket-hit__label--armed">Release</span>
              </div>
${nodes}
            </div>
          </div>
          <div class="engine-list">
${list}
          </div>
          <div class="engine-bezel">
            <div class="engine-readout" id="competency-engine-readout">
              <p class="engine-readout__standby" data-engine-standby>The socket is open. Drag the processor chip into the socket to power the branches.</p>
              <div class="engine-readout__grid">
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
            </div>
            <div class="engine-bezel__foot">
              <button type="button" class="engine-toggle" data-engine-toggle aria-pressed="false" hidden>Pause</button>
              <div class="engine-ticker" aria-hidden="true">
                <div class="engine-ticker__track">
${tickerItems}
                </div>
              </div>
            </div>
          </div>
        </div>`;
}

export function renderCompetencyEngineBay(base = "../") {
  const seat = chipBox();
  return `          <aside class="engine-bay" data-engine-bay style="--token-ratio: ${fmt(seat.w)} / ${fmt(seat.h)}">
            <p class="engine-bay__kicker" data-engine-kicker>Ready to seat</p>
            <div class="engine-bay__slot">
              <div class="engine-bay__home" data-engine-home>
              <button type="button" class="engine-token" data-engine-token aria-describedby="engine-bay-hint">
                <svg class="engine-token__svg" viewBox="${fmt(seat.x)} ${fmt(seat.y)} ${fmt(seat.w)} ${fmt(seat.h)}" role="presentation" aria-hidden="true">
                  <defs>
${chipDefs("token")}
                  </defs>
${chipBody(base, "token")}
                </svg>
                <span class="sr-only">Competency engine chip. Drag it onto the socket, or press to seat it.</span>
              </button>
              </div>
            </div>
            <p class="engine-bay__hint" id="engine-bay-hint"><span data-engine-hint>Drag into the socket</span></p>
            <button type="button" class="engine-lift" data-engine-lift hidden>Lift chip</button>
          </aside>`;
}
