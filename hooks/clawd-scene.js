// Scenes for the desktop app: the card above the prompt becomes a little pixel city by the bay,
// after San Francisco, that follows the time of day where the user is (morning, noon, dusk,
// night), and while Claude has nothing on, the mascot keeps itself busy in it: fishing off the
// waterfront, on its laptop at a café table, watering a planter, or at night dozing on a bench
// under a street lamp.
//
// Everything is an SVG. The motion is the SVG's own animation (SMIL), every loop started at a
// negative offset taken from the clock, so a drawing sent later carries on where the last one
// was instead of starting over; while the mascot idles, nothing needs drawing again.
//
// Units: the scene is laid out in units of U CSS pixels, square. The mascot's own pixels are a
// unit wide and two tall, as a terminal cell's halves are, so it looks as it does everywhere.

const U = 2.5
// The ids the drawing's defs go by, unique to each drawing so two on one page never mix
let ID = 'cs'
export const SCENE_H = 32
// The top of the grass
const G = 25

const ORANGE = '#d97757'
const EYE = '#000000'

// The times of day, by the local hour they start at
export const PERIODS = ['morning', 'noon', 'dusk', 'night']

export function periodAt(hour, minute = 0) {
  const t = hour + minute / 60
  if (t >= 5 && t < 10) return 'morning'
  if (t >= 10 && t < 16.5) return 'noon'
  if (t >= 16.5 && t < 19.5) return 'dusk'
  return 'night'
}

export const ACTIVITIES = ['fishing', 'laptop', 'garden', 'sleep']

// Which pastime, by the time of day: seed picks among them, weighted. Late at night it's bed.
const WEIGHTS = {
  morning: { garden: 45, fishing: 30, laptop: 25 },
  noon: { fishing: 40, laptop: 35, garden: 25 },
  dusk: { fishing: 50, laptop: 30, garden: 20 },
  night: { sleep: 60, laptop: 40 },
}

export function pickActivity(period, seed, hour = 21) {
  if (period === 'night' && (hour >= 23 || hour < 5)) return seed % 7 === 0 ? 'laptop' : 'sleep'
  const weights = WEIGHTS[period]
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  let r = hash(seed) % total
  for (const [name, w] of Object.entries(weights)) {
    if (r < w) return name
    r -= w
  }
  return Object.keys(weights)[0]
}

function hash(n) {
  return Math.imul((n | 0) + 1, 2654435761) >>> 0
}

// A seeded random source, the same layout every time for the same seed
function random(seed) {
  let s = hash(seed) || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 100000) / 100000
  }
}

// The city's colors by the time of day, after San Francisco: glass towers, white and sandstone
// and terracotta mid-rises, the bridge's orange, golden hills, the bay, painted houses, palms
const CITY = {
  morning: {
    glass: '#9cc8e8', glass2: '#a9cfe9', line: '#c9e3f4', shine: '#eef8fe', white: '#f4f1ea', sand: '#e9d6b8', terra: '#dca07c',
    bridge: '#d9603e', hills: '#cdbf8a', bay: '#8fc3e6', bayLight: '#e3f3fc', pave: '#ebe5d9', joint: '#d8d1c3', kerb: '#d0c8b9',
    lamp: '#5f6672', rail: '#f6f6f2', lit: '#ffe7a6', trunk: '#9a7a56', palm: '#5fa463', roof: '#8a6a7a', trim: '#ffffff',
    houses: ['#f4b6c2', '#a8d8c8', '#f7e1a0', '#b7c7ef'],
  },
  noon: {
    glass: '#7fb8e6', glass2: '#8fc2ea', line: '#b8ddf6', shine: '#eaf7ff', white: '#f7f5ef', sand: '#ecd8b4', terra: '#e09a72',
    bridge: '#e0582f', hills: '#d4c27c', bay: '#5ea9e4', bayLight: '#d5ecfb', pave: '#efe9dd', joint: '#dbd4c6', kerb: '#d2cabb',
    lamp: '#5f6672', rail: '#ffffff', lit: '#ffe7a6', trunk: '#a07c52', palm: '#4fa357', roof: '#8a6a7a', trim: '#ffffff',
    houses: ['#f4b6c2', '#a8d8c8', '#f7e1a0', '#b7c7ef'],
  },
  dusk: {
    glass: '#b06d7d', glass2: '#a8667a', line: '#d4888a', shine: '#ffc39a', white: '#d9a69a', sand: '#c48a82', terra: '#b8705f',
    bridge: '#c9472c', hills: '#9a5a6a', bay: '#c77a8a', bayLight: '#ffc08a', pave: '#b9928e', joint: '#a8827e', kerb: '#a08080',
    lamp: '#4a3a48', rail: '#ecccc4', lit: '#ffd36a', trunk: '#5a3a40', palm: '#4a3a48', roof: '#5a3a4a', trim: '#f0d0c8',
    houses: ['#c98a96', '#8aa898', '#c9b07a', '#9298c0'],
  },
  night: {
    glass: '#22315a', glass2: '#263760', line: '#2e4070', shine: '#3a4d80', white: '#2c3760', sand: '#283152', terra: '#2a2c4a',
    bridge: '#8a3028', hills: '#151d38', bay: '#1a2a52', bayLight: '#ffd76a', pave: '#30364a', joint: '#282d40', kerb: '#3c4258',
    lamp: '#20232f', rail: '#4a5270', lit: '#ffd76a', trunk: '#1a1d2a', palm: '#18222a', roof: '#1f2236', trim: '#3a4060',
    houses: ['#4a3a58', '#2f4a4a', '#4a4630', '#353f62'],
  },
}
// How many windows are lit, by the time of day
const LIT = { morning: 0.03, noon: 0, dusk: 0.25, night: 0.5 }

const PALETTES = {
  morning: {
    sky: ['#9cc9f5', '#b6d8f5', '#d3e4ef', '#f6dcc4', '#fbc9a2'],
    sun: '#fff1b8',
    glow: '#ffe2a8',
    cloud: '#ffffff',
    cloudShade: '#f3dccb',
  },
  noon: {
    sky: ['#3f8ef0', '#56a0f3', '#71b2f5', '#93c6f7', '#b7daf9'],
    sun: '#fff27a',
    glow: '#fff7b8',
    cloud: '#ffffff',
    cloudShade: '#dbe9f7',
  },
  dusk: {
    sky: ['#3a2c5c', '#6b3a6d', '#b2496a', '#e8735a', '#f8a95c'],
    sun: '#ffb25a',
    glow: '#ff8a4c',
    cloud: '#f2a07e',
    cloudShade: '#b4627a',
  },
  night: {
    sky: ['#070b1f', '#0d1430', '#141d40', '#1c2850', '#25345f'],
    moon: '#f4f0cf',
    cloud: '#3a4672',
    cloudShade: '#2a3460',
    star: '#fff8d6',
  },
}

// A rectangle, in units
function R(x, y, w, h, fill, extra = '') {
  return '<rect x="' + n(x * U) + '" y="' + n(y * U) + '" width="' + n(w * U) + '" height="' + n(h * U) + '" fill="' + fill + '"' + extra + '/>'
}

function n(v) {
  return Math.round(v * 100) / 100
}

// A loop's timing attributes, picked up where the clock has it: t seconds in, dur long
function loop(t, dur, phase = 0) {
  return ' dur="' + n(dur) + 's" begin="-' + n((t + phase) % dur) + 's" repeatCount="indefinite"'
}

// A pixel sprite, rows of characters, its bottom left at (x, bottom) in units; each pixel a
// unit wide and two tall, as the mascot's are. '#' is the body, 'E' an eye, 'e' an eye shut
// (its lower half), anything in colors by its key; '.' or ' ' nothing.
function sprite(rows, x, bottom, colors = {}) {
  const out = []
  const top = bottom - rows.length * 2
  rows.forEach((row, ry) => {
    let cx = 0
    while (cx < row.length) {
      const ch = row[cx]
      let end = cx + 1
      while (end < row.length && row[end] === ch) end++
      const y = top + ry * 2
      if (ch === '#') out.push(R(x + cx, y, end - cx, 2, ORANGE))
      else if (ch === 'E') out.push(R(x + cx, y, end - cx, 2, EYE))
      else if (ch === 'e') out.push(R(x + cx, y, end - cx, 1, ORANGE) + R(x + cx, y + 1, end - cx, 1, EYE))
      else if (colors[ch]) out.push(R(x + cx, y, end - cx, 2, colors[ch]))
      cx = end
    }
  })
  return outlined(out.join(''))
}

// A drawing with a dark rim round it, so the mascot stands out from any sky: the same shapes in
// the rim's color, nudged half a unit each way, under the drawing itself
const RIM = '#2a1712'
function outlined(inner) {
  const rim = inner.replace(/fill="[^"]+"/g, 'fill="' + RIM + '"')
  const d = n(0.5 * U)
  return (
    '<g opacity="0.9">' +
    ['-' + d + ' 0', d + ' 0', '0 -' + d, '0 ' + d].map((o) => '<g transform="translate(' + o + ')">' + rim + '</g>').join('') +
    '</g>' + inner
  )
}

// A soft shadow on the ground under the mascot, from x, w units wide
function shadow(x, w) {
  return '<ellipse cx="' + n((x + w / 2) * U) + '" cy="' + n((G + 1) * U) + '" rx="' + n((w / 2 + 1) * U) + '" ry="' + n(1.2 * U) + '" fill="#000000" opacity="0.22"/>'
}

const mirror = (rows) => rows.map((r) => [...r].reverse().join(''))

// The mascot, as the logo has it, and side on facing right
const FRONT = [
  '..#############..',
  '..##E#######E##..',
  '#################',
  '..#############..',
  '..#.#.......#.#..',
]
const FRONT_ASLEEP = [
  '..#############..',
  '..#ee#######ee#..',
  '#################',
  '..#############..',
  '..#.#.......#.#..',
]
const SIDE = [
  '###########..',
  '####E####E#..',
  '#############',
  '###########..',
  '.#.#...#.#...',
]
const SIDE_TAP = [
  '###########..',
  '####E####E#..',
  '############.',
  '############.',
  '.#.#...#.#...',
]
const SIDE_CHEER = [
  '...........#.',
  '###########..',
  '####E####E#..',
  '###########..',
  '###########..',
  '.#.#...#.#...',
]

// A disc of pixels, its center (cx, cy) and radius r in units, as rows of rects; minus another
// disc when given, for a crescent
function disc(cx, cy, r, fill, minus) {
  const out = []
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    const dy = y + 0.5 - cy
    if (Math.abs(dy) > r) continue
    const half = Math.sqrt(r * r - dy * dy)
    let x0 = Math.round(cx - half)
    let x1 = Math.round(cx + half)
    if (minus) {
      const mdy = y + 0.5 - minus.cy
      if (Math.abs(mdy) <= minus.r) {
        const mh = Math.sqrt(minus.r * minus.r - mdy * mdy)
        const m0 = Math.round(minus.cx - mh)
        const m1 = Math.round(minus.cx + mh)
        // Keep what's left of the cut, the crescent's side
        if (m0 <= x0 && m1 >= x1) continue
        if (m0 > x0 && m0 < x1) x1 = m0
        else if (m1 > x0 && m1 < x1) x0 = m1
      }
    }
    if (x1 > x0) out.push(R(x0, y, x1 - x0, 1, fill))
  }
  return out.join('')
}

// A ridge of hills: a stepped skyline from column heights, filled down to the grass
function ridge(width, base, amp, seed, fill) {
  const rnd = random(seed)
  const a = 0.05 + rnd() * 0.04
  const b = 0.13 + rnd() * 0.06
  const pa = rnd() * 6
  const pb = rnd() * 6
  let d = 'M0 ' + n(G * U)
  let last = null
  for (let x = 0; x <= width; x += 2) {
    const h = Math.round(base + amp * (0.6 * Math.sin(x * a + pa) + 0.4 * Math.sin(x * b + pb)))
    const y = G - Math.max(1, h)
    if (y !== last) {
      d += ' V' + n(y * U)
      last = y
    }
    d += ' H' + n(Math.min(width, x + 2) * U)
  }
  d += ' V' + n(G * U) + ' Z'
  return '<path d="' + d + '" fill="' + fill + '"/>'
}

function cloudShape(x, y, s, p) {
  return (
    R(x + 2 * s, y, 5 * s, s, p.cloud) +
    R(x, y + s, 10 * s, s, p.cloud) +
    R(x + 1 * s, y + 2 * s, 8 * s, s, p.cloudShade)
  )
}

// The waterfront at the right end: its left edge
function pondLeft(width) {
  return width - 30
}

// The sky, the city and the waterfront for a time of day
function backdrop(width, period, t, seed) {
  const p = PALETTES[period]
  const out = []
  const rnd = random(seed)
  // The sky in bands, each joined to the next by a row of checks
  const bands = p.sky.length
  const bandH = G / bands
  p.sky.forEach((color, i) => out.push(R(0, Math.floor(i * bandH), width, Math.ceil(bandH) + 1, color)))
  for (let i = 1; i < bands; i++) out.push('<rect x="0" y="' + n(Math.floor(i * bandH) * U) + '" width="' + n(width * U) + '" height="' + n(U) + '" fill="url(#' + ID + 'd' + i + ')"/>')
  // Sun, moon and stars
  if (period === 'morning') {
    const sy = 9
    out.push(disc(width * 0.16, sy, 7, p.glow, null).replace(/fill=/g, 'opacity="0.35" fill='), disc(width * 0.16, sy, 4.5, p.sun))
  } else if (period === 'noon') {
    out.push(disc(width * 0.42, 6, 7, p.glow, null).replace(/fill=/g, 'opacity="0.35" fill='), disc(width * 0.42, 6, 4, p.sun))
  } else if (period === 'dusk') {
    const sy = 12
    out.push(disc(width * 0.3, sy, 11, p.glow, null).replace(/fill=/g, 'opacity="0.3" fill='), disc(width * 0.3, sy, 6.5, p.sun))
  } else {
    // Stars, twinkling each at its own pace, and now and then a shooting star
    // Fewer over the city's lights
    for (let i = 0; i < Math.round(width / 16); i++) {
      const sx = Math.floor(rnd() * width)
      const sy = Math.floor(rnd() * (G - 6))
      if (sx > width * 0.14 && sx < width * 0.24 && sy < 12) continue
      const big = rnd() < 0.15
      const d = 2 + rnd() * 4
      out.push(
        '<g>' + R(sx, sy, big ? 1 : 0.6, big ? 1 : 0.6, p.star) + (big ? R(sx - 0.6, sy + 0.3, 2.2, 0.4, p.star, ' opacity="0.6"') : '') +
          '<animate attributeName="opacity" values="1;0.25;1"' + loop(t, d, rnd() * d) + '/></g>',
      )
    }
    out.push(disc(width * 0.19, 6, 4.5, p.moon, { cx: width * 0.19 + 2.2, cy: 5, r: 4 }))
    const from = width * 0.75
    // A shooting star: once every 17 seconds, across in under a second
    out.push(
      '<g opacity="0">' + R(from, 3, 6, 0.6, p.star) + R(from + 6, 3, 1, 0.6, '#ffffff') +
        '<animateTransform attributeName="transform" type="translate" values="0 0;0 0;' + n(-30 * U) + ' ' + n(8 * U) + ';' + n(-30 * U) + ' ' + n(8 * U) + '" keyTimes="0;0.9;0.95;1"' + loop(t, 17) + '/>' +
        '<animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;0.9;0.91;0.95;1"' + loop(t, 17) + '/></g>',
    )
  }
  // Clouds drifting by, slowly, round and round
  const clouds = period === 'night' ? 2 : 3
  for (let i = 0; i < clouds; i++) {
    const cy = 2 + Math.floor(rnd() * 7)
    const s = rnd() < 0.5 ? 1 : 1.5
    const d = 140 + rnd() * 80
    out.push(
      '<g' + (period === 'night' ? ' opacity="0.6"' : '') + '>' + cloudShape(0, cy, s, p) +
        '<animateTransform attributeName="transform" type="translate" values="' + n(width * U) + ' 0;' + n(-16 * U) + ' 0"' + loop(t, d, (i / clouds) * d) + '/></g>',
    )
  }
  // Birds in the morning, crossing now and then
  if (period === 'morning') {
    for (let i = 0; i < 2; i++) {
      const by = 5 + i * 3
      out.push(
        '<g>' +
          '<g>' + R(0, by, 1, 1, '#4a4a5a') + R(1, by + 1, 1, 1, '#4a4a5a') + R(2, by, 1, 1, '#4a4a5a') +
          '<animate attributeName="opacity" values="1;0" calcMode="discrete"' + loop(t, 0.5, i * 0.2) + '/></g>' +
          '<g>' + R(0, by + 1, 1, 1, '#4a4a5a') + R(1, by + 1, 1, 1, '#4a4a5a') + R(2, by + 1, 1, 1, '#4a4a5a') +
          '<animate attributeName="opacity" values="0;1" calcMode="discrete"' + loop(t, 0.5, i * 0.2) + '/></g>' +
          '<animateTransform attributeName="transform" type="translate" values="' + n(-6 * U) + ' 0;' + n((width + 6) * U) + ' ' + n(-3 * U) + '"' + loop(t, 26, i * 1.5) + '/></g>',
      )
    }
  }
  out.push(cityGround(width, period, t, seed), waterfront(width, t, period))
  return out.join('')
}

// The city by the bay, after San Francisco: golden hills and the bay behind, the Golden Gate
// on the left (fog drifting through it in the morning), a downtown of towers with sky between
// them (a pyramid, a round-topped tower, glass), a row of painted Victorian houses, palms, the
// paving, a street lamp, and by day a pigeon
function cityGround(width, period, t, seed) {
  const c = CITY[period]
  const out = []
  const rnd = random(seed + 11)
  // The hills and the bay at their feet, glinting
  out.push(ridge(width, 7, 2.5, seed + 5, c.hills))
  out.push(R(0, G - 4, width, 4, c.bay))
  for (let i = 0; i < 6; i++) {
    const gx = Math.floor(rnd() * width)
    out.push('<g>' + R(gx, G - 3 + (i % 3), 3, 0.5, c.bayLight, ' opacity="0.7"') + '<animate attributeName="opacity" values="0.8;0.2;0.8"' + loop(t, 3 + rnd() * 3, rnd() * 3) + '/></g>')
  }
  out.push(goldenGate(Math.round(width * 0.02), Math.round(width * 0.31), c, t, period))
  if (period === 'morning') {
    // Fog rolling in through the Gate
    for (let i = 0; i < 2; i++) {
      out.push(
        '<g opacity="0.55">' + R(0, G - 9 + i * 3, 30, 2, '#ffffff') + R(6, G - 10 + i * 3, 16, 1, '#ffffff') +
          '<animateTransform attributeName="transform" type="translate" values="' + n(-30 * U) + ' 0;' + n(width * 0.45 * U) + ' 0"' + loop(t, 60, i * 25) + '/>' +
          '<animate attributeName="opacity" values="0;0.6;0.6;0" keyTimes="0;0.15;0.8;1"' + loop(t, 60, i * 25) + '/></g>',
      )
    }
  }
  out.push(downtown(Math.round(width * 0.42), Math.round(width * 0.7), c, rnd, t, period))
  out.push(paintedLadies(Math.round(width * 0.335), c, rnd, period))
  // Palms in a pair along the waterfront
  out.push(palm(spotOf(width) - 44, c, t, 0), palm(spotOf(width) - 37, c, t, 1.3))
  // The paving, its joints, the kerb along its top
  out.push(R(0, G, width, SCENE_H - G, c.pave))
  out.push('<rect x="0" y="' + n((G + 1) * U) + '" width="' + n(width * U) + '" height="' + n((SCENE_H - G - 1) * U) + '" fill="url(#' + ID + 'p)"/>')
  out.push(R(0, G, width, 1, c.kerb))
  // A street lamp left of the mascot's spot, lit from dusk on
  const lx = spotOf(width) - 26
  const on = period === 'dusk' || period === 'night'
  if (on) {
    out.push(
      '<polygon points="' + [[lx, G - 13], [lx - 7, G], [lx + 9, G]].map(([a, b]) => n(a * U) + ',' + n(b * U)).join(' ') + '" fill="#ffd76a" opacity="0.16">' +
        '<animate attributeName="opacity" values="0.16;0.12;0.16"' + loop(t, 4) + '/></polygon>',
    )
  }
  out.push(R(lx, G - 13, 1, 13, c.lamp), R(lx - 1, G - 1, 3, 1, c.lamp), R(lx - 1, G - 14, 3, 1, c.lamp), R(lx - 0.5, G - 13, 2, 1, on ? '#ffe9a8' : '#c8ccd4'))
  // A pigeon by day, walking back and forth, bobbing its head
  if (period === 'morning' || period === 'noon') {
    const px0 = Math.round(width * 0.5)
    const bird =
      R(0, -2, 3, 2, '#8d93a6') + R(0.5, -1, 2, 0.6, '#a9aec0') + R(0.7, 0, 0.5, 1, '#d98a5a') + R(1.8, 0, 0.5, 1, '#d98a5a') +
      '<g>' + R(3, -3, 1.2, 1.2, '#6d7388') + R(4.2, -2.6, 0.6, 0.5, '#e0a050') +
      '<animateTransform attributeName="transform" type="translate" values="0 0;' + n(0.6 * U) + ' ' + n(1.2 * U) + ';0 0" keyTimes="0;0.5;1"' + loop(t, 0.8) + '/></g>'
    out.push(
      '<g transform="translate(' + n(px0 * U) + ' ' + n((G + 3) * U) + ')"><g>' + bird +
        '<animateTransform attributeName="transform" type="translate" values="0 0;' + n(8 * U) + ' 0;' + n(8 * U) + ' 0;0 0;0 0" keyTimes="0;0.4;0.5;0.9;1"' + loop(t, 14) + '/></g></g>',
    )
  }
  return out.join('')
}

// The Golden Gate from x0 to x1: two towers, the deck, the main cable sagging between them
// and the suspenders down from it; at night lights along the cable and on the towers' tops
function goldenGate(x0, x1, c, t, period) {
  const out = []
  const span = x1 - x0
  const a = x0 + Math.round(span * 0.22)
  const b = x1 - Math.round(span * 0.22)
  const top = G - 19
  const deck = G - 6
  // The cable's height at x: rising to each tower from the ends, sagging between them
  const cable = (x) => {
    if (x <= a) return deck - (deck - top) * Math.pow((x - x0) / (a - x0), 1.5)
    if (x >= b) return deck - (deck - top) * Math.pow((x1 - x) / (x1 - b), 1.5)
    const u = (x - (a + b) / 2) / ((b - a) / 2)
    return top + (deck - 2 - top) * (1 - u * u)
  }
  for (let x = x0; x <= x1; x++) {
    const y = Math.round(cable(x))
    out.push(R(x, y, 1, 0.8, c.bridge))
    if (x > a + 1 && x < b - 1 && x % 3 === 0) out.push(R(x + 0.4, y + 0.8, 0.3, deck - y - 0.8, c.bridge, ' opacity="0.6"'))
  }
  out.push(R(x0, deck, span, 1, c.bridge), R(x0, deck + 1, span, 0.5, c.bridge, ' opacity="0.6"'))
  for (const tx of [a, b]) {
    out.push(R(tx - 1, top - 1, 1, G - 4 - top + 1, c.bridge), R(tx + 1, top - 1, 1, G - 4 - top + 1, c.bridge))
    for (const by of [top, top + 4, top + 8]) out.push(R(tx - 1, by, 3, 1, c.bridge))
    if (period === 'night') {
      out.push('<g>' + R(tx, top - 2, 1, 1, '#ff5a4a') + '<animate attributeName="opacity" values="1;0.1;1" keyTimes="0;0.5;1" calcMode="discrete"' + loop(t, 2) + '/></g>')
    }
  }
  if (period === 'night' || period === 'dusk') {
    for (let x = x0 + 2; x < x1; x += 4) {
      out.push('<g>' + R(x, Math.round(cable(x)) - 0.2, 0.7, 0.7, c.lit) + '<animate attributeName="opacity" values="1;0.4;1"' + loop(t, 3, (x % 7) * 0.4) + '/></g>')
    }
  }
  return out.join('')
}

// Downtown between x0 and x1: towers of their own shapes, sky left between them. At night (and
// some at dusk) their windows light up, the round-topped tower's crown cycling through colors.
function downtown(x0, x1, c, rnd, t, period) {
  const out = []
  const span = Math.max(30, x1 - x0)
  const lit = LIT[period]
  // Windows lit on a grid over a face, some flickering
  const windows = (x, y, w, h, step = 2) => {
    if (!lit) return
    for (let wy = y + 1; wy < y + h - 1; wy += step) {
      for (let wx = x + 1; wx < x + w - 1; wx += step) {
        if (rnd() >= lit) continue
        out.push(rnd() < 0.06 ? '<g>' + R(wx, wy, 1, 1, c.lit) + '<animate attributeName="opacity" values="1;0;1" keyTimes="0;0.5;1" calcMode="discrete"' + loop(t, 6 + rnd() * 10, rnd() * 10) + '/></g>' : R(wx, wy, 1, 1, c.lit))
      }
    }
  }
  const glass = (x, w, h, color) => {
    out.push(R(x, G - h, w, h, color), '<rect x="' + n(x * U) + '" y="' + n((G - h) * U) + '" width="' + n(w * U) + '" height="' + n(h * U) + '" fill="url(#' + ID + 'g)"/>')
    out.push('<polygon points="' + [[x, G - h + 2], [x + 2, G - h], [x + 3, G - h], [x, G - h + 4]].map(([a, b]) => n(a * U) + ',' + n(b * U)).join(' ') + '" fill="' + c.shine + '" opacity="0.5"/>')
    out.push(R(x, G - h, w, 0.6, c.line))
    windows(x, G - h, w, h)
  }
  const block = (x, w, h, color) => {
    out.push(R(x, G - h, w, h, color), '<rect x="' + n((x + 1) * U) + '" y="' + n((G - h + 1) * U) + '" width="' + n((w - 2) * U) + '" height="' + n((h - 2) * U) + '" fill="url(#' + ID + 'o)"/>')
    out.push(R(x - 0.5, G - h, w + 1, 0.8, c.white))
    windows(x, G - h, w, h)
  }
  // The pyramid: narrowing to a spire, two wings halfway up
  const pyramid = (x, w, h) => {
    for (let r = 0; r < h; r++) {
      const rw = Math.max(1, Math.round((w * (r + 1)) / h))
      out.push(R(x + (w - rw) / 2, G - h + r, rw, 1, c.white))
    }
    out.push(R(x + w / 2 - 0.3, G - h - 4, 0.6, 4, c.white))
    out.push(R(x + w * 0.2, G - h * 0.55, 1, 3, c.white), R(x + w * 0.8 - 1, G - h * 0.55, 1, 3, c.white))
    out.push('<rect x="' + n((x + w * 0.3) * U) + '" y="' + n((G - h * 0.5) * U) + '" width="' + n(w * 0.4 * U) + '" height="' + n(h * 0.45 * U) + '" fill="url(#' + ID + 'o)"/>')
    if (lit) windows(x + w * 0.25, G - h * 0.6, w * 0.5, h * 0.6)
  }
  // The round-topped tower, its crown lit in turning colors at night
  const rounded = (x, w, h) => {
    out.push(R(x + 2, G - h, w - 4, 1, c.glass2), R(x + 1, G - h + 1, w - 2, 1, c.glass2), R(x, G - h + 2, w, h - 2, c.glass2))
    out.push('<rect x="' + n(x * U) + '" y="' + n((G - h + 2) * U) + '" width="' + n(w * U) + '" height="' + n((h - 2) * U) + '" fill="url(#' + ID + 'h)"/>')
    if (period === 'night' || period === 'dusk') {
      out.push(
        R(x + 2, G - h, w - 4, 1, '#6cb4ee') .replace('/>', '><animate attributeName="fill" values="#6cb4ee;#e58fbf;#8bd48b;#f9c74f;#6cb4ee"' + loop(t, 10) + '/></rect>') +
          R(x + 1, G - h + 1, w - 2, 1, '#6cb4ee').replace('/>', '><animate attributeName="fill" values="#6cb4ee;#e58fbf;#8bd48b;#f9c74f;#6cb4ee"' + loop(t, 10, 0.5) + '/></rect>'),
      )
    }
    windows(x, G - h + 3, w, h - 3)
  }
  const at = (f) => Math.round(x0 + span * f)
  block(at(0), 8, 8, c.sand)
  glass(at(0.1), 7, 14, c.glass)
  pyramid(at(0.22), 9, 22)
  block(at(0.37), 6, 10, c.white)
  rounded(at(0.47), 8, 21)
  glass(at(0.62), 6, 12, c.glass)
  glass(at(0.72), 8, 16, c.glass2)
  block(at(0.86), 7, 7, c.terra)
  return out.join('')
}

// A row of painted Victorian houses from x: pastel fronts, gabled roofs, white trim, bay
// windows, steps to the doors; lit up at night
function paintedLadies(x, c, rnd, period) {
  const out = []
  c.houses.forEach((color, i) => {
    const hx = x + i * 7
    out.push(R(hx, G - 7, 6, 7, color))
    out.push(R(hx + 2, G - 10, 2, 1, c.roof), R(hx + 1, G - 9, 4, 1, c.roof), R(hx, G - 8, 6, 1, c.roof))
    out.push(R(hx, G - 7, 6, 0.5, c.trim))
    const lit = period === 'night' || (period === 'dusk' && rnd() < 0.6)
    out.push(R(hx + 1, G - 6, 2, 3, c.trim), R(hx + 1.4, G - 5.6, 1.2, 2.2, lit ? c.lit : c.glass))
    out.push(R(hx + 4, G - 3, 1.2, 3, c.roof), R(hx + 3.5, G - 0.6, 2.2, 0.6, c.trim))
    out.push(R(hx + 4, G - 6, 1.2, 1.4, lit && rnd() < 0.7 ? c.lit : c.glass))
  })
  return out.join('')
}

// A palm: a leaning trunk, fronds drooping from its top, swaying a little
function palm(x, c, t, phase) {
  const out = []
  for (let i = 0; i < 14; i++) out.push(R(x + Math.floor(i / 5), G - 1 - i, 1, 1, c.trunk))
  const tx = x + 2
  const ty = G - 15
  const fronds = [
    [-1, 0], [-2, 0], [-3, 1], [-4, 2],
    [1, 0], [2, 0], [3, 1], [4, 2],
    [-1, -1], [-2, -2], [1, -1], [2, -2], [0, -1],
  ]
  out.push(
    '<g>' + fronds.map(([dx, dy]) => R(tx + dx, ty + dy, 1, 1, c.palm)).join('') + R(tx, ty, 1, 1, c.palm) +
      '<animateTransform attributeName="transform" type="translate" values="0 0;' + n(0.4 * U) + ' 0;0 0"' + loop(t, 3.5, phase) + '/></g>',
  )
  return out.join('')
}

// The waterfront at the right end: the bay, a kerb, a white railing along the edge
function waterfront(width, t, period) {
  const x0 = pondLeft(width)
  const c = CITY[period]
  const out = []
  out.push(R(x0, G, 30, SCENE_H - G, c.bay))
  out.push(R(x0, G, 30, 1, c.kerb))
  out.push(R(x0, G - 4, 30, 0.8, c.rail))
  for (let x = x0; x < width; x += 4) out.push(R(x, G - 4, 0.8, 4, c.rail))
  const glint = (gx, gy, w, d, ph) =>
    '<g>' + R(gx, gy, w, 1, c.bayLight, ' opacity="0.8"') +
    '<animateTransform attributeName="transform" type="translate" values="0 0;' + n(2 * U) + ' 0;0 0"' + loop(t, d, ph) + '/>' +
    '<animate attributeName="opacity" values="1;0.3;1"' + loop(t, d * 0.7, ph) + '/></g>'
  out.push(glint(x0 + 6, G + 3, 5, 5, 0), glint(x0 + 15, G + 5, 6, 6, 2), glint(x0 + 10, G + 6, 3, 4, 1))
  return out.join('')
}

// The defs the backdrop's fills use: the sky's checks, the glass, the windows, the paving
function defs(period) {
  const p = PALETTES[period]
  const out = []
  const c = CITY[period]
  // Glass: thin mullions; the round tower: bands; offices: a grid of windows; the paving
  out.push(
    '<pattern id="' + ID + 'g" width="' + n(2 * U) + '" height="' + n(U) + '" patternUnits="userSpaceOnUse">' + R(0, 0, 0.4, 1, c.line, ' opacity="0.8"') + '</pattern>',
    '<pattern id="' + ID + 'h" width="' + n(U) + '" height="' + n(2 * U) + '" patternUnits="userSpaceOnUse">' + R(0, 0, 1, 0.4, c.line, ' opacity="0.8"') + '</pattern>',
    '<pattern id="' + ID + 'o" width="' + n(2 * U) + '" height="' + n(2 * U) + '" patternUnits="userSpaceOnUse">' + R(0.5, 0.5, 1, 1, c.glass, ' opacity="0.55"') + '</pattern>',
    '<pattern id="' + ID + 'p" width="' + n(8 * U) + '" height="' + n(3 * U) + '" patternUnits="userSpaceOnUse">' + R(0, 2, 8, 0.4, c.joint) + R(3, 0, 0.4, 2, c.joint) + '</pattern>',
  )
  for (let i = 1; i < p.sky.length; i++) {
    out.push(
      '<pattern id="' + ID + 'd' + i + '" width="' + n(2 * U) + '" height="' + n(U) + '" patternUnits="userSpaceOnUse">' +
        R(0, 0, 1, 1, p.sky[i - 1]) + R(1, 0, 1, 1, p.sky[i]) + '</pattern>',
    )
  }
  return '<defs>' + out.join('') + '</defs>'
}

// Where the mascot stands: its left edge, a little way left of the waterfront
export function spotOf(width) {
  return pondLeft(width) - 15
}

// Two drawings taking turns every half of dur: a, then b
function alternate(a, b, t, dur, phase = 0) {
  return (
    '<g>' + a + '<animate attributeName="opacity" values="1;0" calcMode="discrete"' + loop(t, dur, phase) + '/></g>' +
    '<g opacity="0">' + b + '<animate attributeName="opacity" values="0;1" calcMode="discrete"' + loop(t, dur, phase) + '/></g>'
  )
}

// A drawing shown only between from and to of a cycle dur seconds long
function window(inner, t, dur, from, to) {
  const k0 = n(from / dur)
  const k1 = n(to / dur)
  return (
    '<g opacity="0">' + inner +
    '<animate attributeName="opacity" values="0;1;0" keyTimes="0;' + k0 + ';' + k1 + '" calcMode="discrete"' + loop(t, dur) + '/></g>'
  )
}

// Fishing on the bank, rod out over the water. Every 14 seconds a catch: the float dips twice,
// the rod jerks up, the float goes under in a splash and the fish comes up on the line,
// wriggling; it dangles at the rod's tip, then flies over the mascot's head into the bucket
// behind it (a splash, a "+1"), the mascot hopping for joy; then the rod goes down and the
// float is back on the water.
function fishing(width, t, period) {
  const x = spotOf(width) + 2
  const out = []
  const bottom = G + 1
  const top = bottom - 10
  const CYCLE = 14
  const k = (sec) => n(sec / CYCLE)
  const at = (pts) => pts.map(([a, b]) => n(a * U) + ' ' + n(b * U)).join(';')
  // The rod held out low, and jerked up for the catch
  const hx = x + 13
  const hy = bottom - 6
  const low = []
  for (let i = 0; i < 11; i++) low.push(R(hx + i, hy - Math.round(i * 0.8) - 1, 1, 1, '#8a5a3a'))
  const high = []
  for (let i = 0; i < 11; i++) high.push(R(hx + Math.round(i * 0.45), hy - i - 1, 1, 1, '#8a5a3a'))
  const tip = [hx + 11, hy - 10]
  const raised = [hx + 5.5, hy - 11]
  // The float on the water, and the bucket behind the mascot
  const fx = tip[0] + 4
  const fy = G + 2
  const bx = x - 7
  // Shown from one second of the cycle to another
  const during = (from, to) => '<animate attributeName="opacity" values="0;1;0" keyTimes="0;' + k(from) + ';' + k(to) + '" calcMode="discrete"' + loop(t, CYCLE) + '/>'
  const except = (from, to) => '<animate attributeName="opacity" values="1;0;1" keyTimes="0;' + k(from) + ';' + k(to) + '" calcMode="discrete"' + loop(t, CYCLE) + '/>'
  // The line: from the rod's tip (low, or raised for the catch) to the float, then to the fish
  // as it comes up, slack once the fish is off, and back to the float when the rod goes down
  const lineEnd = [
    [0, [fx + 0.5, fy]],
    [9.7, [fx + 0.5, fy]],
    [9.9, [fx, fy - 1.5]],
    [10.9, [raised[0], raised[1] + 3]],
    [11.2, [raised[0], raised[1] + 3]],
    [11.25, [raised[0] + 0.5, raised[1] + 4]],
    [12.6, [raised[0] + 0.5, raised[1] + 4]],
    [12.61, [fx + 0.5, fy]],
    [CYCLE, [fx + 0.5, fy]],
  ]
  const keys = lineEnd.map(([sec]) => k(sec)).join(';')
  const anim = (attr, values, mode = '') => '<animate attributeName="' + attr + '" values="' + values + '" keyTimes="' + keys + '"' + mode + loop(t, CYCLE) + '/>'
  const startX = lineEnd.map(([sec]) => n((sec >= 9.7 && sec < 12.61 ? raised[0] : tip[0]) * U)).join(';')
  const startY = lineEnd.map(([sec]) => n((sec >= 9.7 && sec < 12.61 ? raised[1] : tip[1]) * U)).join(';')
  out.push(
    '<line x1="' + n(tip[0] * U) + '" y1="' + n(tip[1] * U) + '" x2="' + n((fx + 0.5) * U) + '" y2="' + n(fy * U) + '" stroke="#ececec" stroke-width="0.6" opacity="0.85">' +
      anim('x1', startX, ' calcMode="discrete"') + anim('y1', startY, ' calcMode="discrete"') +
      anim('x2', lineEnd.map(([, p]) => n(p[0] * U)).join(';')) + anim('y2', lineEnd.map(([, p]) => n(p[1] * U)).join(';')) +
      '</line>',
  )
  // The float, bobbing; two dips at the bite; gone under for the catch
  out.push(
    '<g><g><g>' + R(fx, fy - 1, 1, 1, '#ffffff') + R(fx, fy, 1, 1, '#e5484d') +
      '<animateTransform attributeName="transform" type="translate" values="0 0;0 ' + n(0.6 * U) + ';0 0"' + loop(t, 2) + '/></g>' +
      '<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 ' + n(1.6 * U) + ';0 0;0 ' + n(1.6 * U) + ';0 0;0 0" keyTimes="0;' +
      [8.9, 9.05, 9.2, 9.35, 9.5].map(k).join(';') + ';1"' + loop(t, CYCLE) + '/></g>' + except(9.7, 12.6) + '</g>',
  )
  // Rings spreading from the float now and then
  out.push(
    '<ellipse cx="' + n((fx + 0.5) * U) + '" cy="' + n((fy + 1) * U) + '" rx="2" ry="1" fill="none" stroke="' + CITY[period].bayLight + '" stroke-width="0.8">' +
      '<animate attributeName="rx" values="1;9"' + loop(t, 3) + '/><animate attributeName="ry" values="0.5;3"' + loop(t, 3) + '/>' +
      '<animate attributeName="opacity" values="0.9;0"' + loop(t, 3) + '/></ellipse>',
  )
  // The splash as the fish comes out
  out.push(
    '<g opacity="0">' + R(fx - 2, fy - 1, 1, 1, '#ffffff') + R(fx + 2, fy - 1.5, 1, 1, '#ffffff') + R(fx - 1, fy - 2.5, 1, 1, '#ffffff') + R(fx + 1, fy - 3, 1, 1, '#ffffff') +
      during(9.7, 10.2) + '</g>',
  )
  // The bucket, a little water in it
  out.push(
    R(bx, G - 3, 4, 3, '#7f8fa6') + R(bx - 0.5, G - 3.5, 5, 0.8, '#a9b6c8') + R(bx + 0.5, G - 3, 3, 0.6, '#5fa8e0') +
      R(bx, G - 5, 0.6, 1.5, '#a9b6c8') + R(bx + 3.4, G - 5, 0.6, 1.5, '#a9b6c8') + R(bx + 0.5, G - 5.5, 3, 0.6, '#a9b6c8') + R(bx, G - 1, 4, 0.5, '#6a7a90'),
  )
  // The fish: up on the line, wriggling, held at the tip, then over into the bucket
  const fishA = R(0, 0, 3, 1, '#9ad0e8') + R(3, -0.5, 1, 2, '#6aa8c8') + R(0.4, 0.1, 0.6, 0.6, '#1a1a1a')
  const fishB = R(0, 0, 3, 1, '#9ad0e8') + R(3, -1, 1, 1, '#6aa8c8') + R(3.5, 0, 0.8, 1, '#6aa8c8') + R(0.4, 0.1, 0.6, 0.6, '#1a1a1a')
  const path = [
    [0, [fx - 1, fy]],
    [9.7, [fx - 1, fy]],
    [9.9, [fx - 1.5, fy - 2]],
    [10.9, [raised[0] - 2, raised[1] + 3]],
    [11.2, [raised[0] - 2, raised[1] + 3.3]],
    [11.55, [x + 5, top - 6]],
    [11.9, [bx + 0.5, G - 3.5]],
    [CYCLE, [bx + 0.5, G - 3.5]],
  ]
  out.push(
    '<g opacity="0"><g>' + alternate(fishA, fishB, t, 0.3) +
      '<animateTransform attributeName="transform" type="translate" values="' + at(path.map(([, p]) => p)) + '" keyTimes="' + path.map(([sec]) => k(sec)).join(';') + '"' + loop(t, CYCLE) + '/></g>' +
      during(9.7, 11.9) + '</g>',
  )
  // The bucket's splash and a "+1"
  out.push('<g opacity="0">' + R(bx, G - 5, 1, 1, '#7fc8ff') + R(bx + 3, G - 5.5, 1, 1, '#7fc8ff') + R(bx + 1.5, G - 6.5, 1, 1, '#7fc8ff') + during(11.9, 12.3) + '</g>')
  out.push(
    '<g opacity="0"><text x="' + n((bx + 0.5) * U) + '" y="' + n((G - 6) * U) + '" font-family="ui-monospace, Menlo, monospace" font-weight="bold" font-size="9" fill="#f9c74f" stroke="#2a1712" stroke-width="2" paint-order="stroke">+1' +
      '<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 ' + n(-5 * U) + ';0 ' + n(-5 * U) + '" keyTimes="0;' + k(11.9) + ';' + k(13) + ';1"' + loop(t, CYCLE) + '/></text>' +
      during(11.9, 13) + '</g>',
  )
  // The mascot with its rod (low, or up for the catch), hopping for joy as the fish lands
  const hop = [0, 0, -1.6, 0, -1, 0, 0]
  const hopAt = [0, 11.2, 11.45, 11.7, 11.9, 12.1, CYCLE]
  out.push(shadow(x, 11))
  out.push(
    '<g>' + sprite(SIDE, x, bottom) +
      '<g>' + low.join('') + except(9.7, 12.6) + '</g>' +
      '<g opacity="0">' + high.join('') + during(9.7, 12.6) + '</g>' +
      '<animateTransform attributeName="transform" type="translate" values="' + hop.map((h) => '0 ' + n(h * U)).join(';') + '" keyTimes="' + hopAt.map(k).join(';') + '"' + loop(t, CYCLE) + '/></g>',
  )
  // Sparkles of joy over its head
  out.push(
    '<g opacity="0">' + R(x + 2, top - 3, 1, 1, '#f9c74f') + R(x + 1, top - 2, 3, 1, '#f9c74f') + R(x + 2, top - 1, 1, 1, '#f9c74f') +
      R(x + 9, top - 5, 1, 1, '#ffe9a8') + R(x + 8, top - 4, 3, 1, '#ffe9a8') + R(x + 9, top - 3, 1, 1, '#ffe9a8') + during(11.3, 12.5) + '</g>',
  )
  return out.join('')
}

// On the laptop, at a crate: code scrolling up the screen, the hands tapping; at night the
// screen lights the mascot up
function laptop(width, t, period) {
  // Far enough from the water for the café table to stand on the pavement
  const x = spotOf(width) - 11
  const bottom = G + 1
  const out = []
  const cx = x + 15
  // A café table, and a coffee steaming beside the laptop
  out.push(R(cx - 1, G - 4, 12, 1, '#f2eee6'), R(cx, G - 3, 10, 0.5, '#c9c3b8'), R(cx + 4.5, G - 3, 1, 3, '#5a5f6a'), R(cx + 2.5, G, 5, 0.8, '#5a5f6a'))
  out.push(R(cx + 8.3, G - 6, 1.6, 2, '#ffffff'), R(cx + 8.3, G - 6, 1.6, 0.5, '#7a4a2a'), R(cx + 9.9, G - 5.5, 0.6, 1, '#ffffff'))
  out.push(
    '<g>' + R(cx + 8.8, G - 7, 0.5, 1, '#ffffff', ' opacity="0.7"') +
      '<animateTransform attributeName="transform" type="translate" values="0 0;' + n(0.6 * U) + ' ' + n(-3 * U) + '"' + loop(t, 2) + '/>' +
      '<animate attributeName="opacity" values="0.8;0"' + loop(t, 2) + '/></g>',
  )
  // The laptop: the base, and the screen turned a little toward us
  out.push(R(cx + 1, G - 5, 7, 1, '#9aa0aa'))
  const sx = cx + 2
  const sy = G - 12
  out.push(R(sx, sy, 7, 7, '#3a3f4a'), R(sx + 1, sy + 1, 5, 5, '#141826'))
  // The code, three colored lines scrolling up, clipped to the screen
  const lines = []
  const colors = ['#6cb4ee', '#f9c74f', '#8bd48b', '#e58fbf', '#c49cf0', '#6cb4ee']
  colors.forEach((c, i) => lines.push(R(sx + 1.5, sy + 1.5 + i * 1.5, 1 + ((i * 7) % 4), 0.6, c)))
  out.push(
    '<clipPath id="' + ID + 's"><rect x="' + n((sx + 1) * U) + '" y="' + n((sy + 1) * U) + '" width="' + n(5 * U) + '" height="' + n(5 * U) + '"/></clipPath>' +
      '<g clip-path="url(#' + ID + 's)"><g>' + lines.join('') + lines.join('').replace(/y="([\d.]+)"/g, (m, v) => 'y="' + n(Number(v) + 9 * U) + '"') +
      '<animateTransform attributeName="transform" type="translate" values="0 0;0 ' + n(-9 * U) + '"' + loop(t, 4) + '/></g></g>',
  )
  // A light from the screen; strong at night
  const glow = period === 'night' ? 0.28 : period === 'dusk' ? 0.16 : 0.08
  out.push(
    '<polygon points="' + [[sx, sy + 1], [sx, sy + 6], [x + 2, bottom], [x + 2, bottom - 11]].map(([a, b]) => n(a * U) + ',' + n(b * U)).join(' ') +
      '" fill="#9fd0ff" opacity="' + glow + '"><animate attributeName="opacity" values="' + glow + ';' + n(glow * 0.6) + ';' + glow + '"' + loop(t, 2.3) + '/></polygon>',
  )
  // The mascot, tapping away
  out.push(shadow(x, 11))
  out.push(alternate(sprite(SIDE, x, bottom), sprite(SIDE_TAP, x, bottom), t, 0.5))
  // Now and then a little star of delight
  out.push(window(R(x + 11, bottom - 13, 1, 1, '#f9c74f') + R(x + 10, bottom - 12, 3, 1, '#f9c74f') + R(x + 11, bottom - 11, 1, 1, '#f9c74f'), t, 9, 6, 7.2))
  return out.join('')
}

// Watering three flowers with a can, the drops falling, the flowers swaying, a butterfly about
function garden(width, t) {
  const x = spotOf(width) - 1
  const bottom = G + 1
  const out = []
  // The flowers grow in a planter box on the pavement
  const soil = G - 3
  out.push(R(x - 16, G - 3, 16, 3, '#c0673f'), R(x - 16, G - 3, 16, 0.8, '#d98058'), R(x - 15, G - 1, 14, 0.5, '#a3552f'))
  // The flowers, left of the mascot
  const flowers = [
    [x - 14, 4, '#e58fbf'],
    [x - 9, 6, '#f9c74f'],
    [x - 4, 5, '#c49cf0'],
  ]
  flowers.forEach(([fx, h, color], i) => {
    out.push(
      '<g>' + R(fx + 1, soil - h, 1, h, '#3f8f3f') + R(fx + 2, soil - h + 2, 1, 1, '#4fa64a') +
        R(fx, soil - h - 2, 3, 1, color) + R(fx - 0.5, soil - h - 1, 4, 1, color) + R(fx + 1, soil - h - 1.5, 1, 1, '#ffe36a') +
        '<animateTransform attributeName="transform" type="translate" values="0 0;' + n(0.5 * U) + ' 0;0 0;' + n(-0.5 * U) + ' 0;0 0"' + loop(t, 3, i * 0.7) + '/></g>',
    )
  })
  // The mascot facing them, the can in hand
  out.push(shadow(x + 2, 11), sprite(mirror(SIDE), x, bottom))
  // The can: a body, a hoop of a handle over it, a long spout tipped down to the flowers
  const can = x - 5
  const canY = bottom - 8
  out.push(
    R(can, canY, 4, 3, '#4fb3a9'),
    R(can, canY + 2, 4, 1, '#3f9a91'),
    R(can + 1, canY - 2, 2, 1, '#3f9a91'),
    R(can + 0.5, canY - 1.5, 0.6, 1.5, '#3f9a91'),
    R(can + 2.9, canY - 1.5, 0.6, 1.5, '#3f9a91'),
    R(can - 1, canY + 0.5, 1, 1, '#4fb3a9'),
    R(can - 2, canY - 0.5, 1, 1, '#4fb3a9'),
    R(can - 3, canY - 1, 1.2, 1, '#3f9a91'),
  )
  // Drops falling from the spout onto the flowers (the box's soil is higher up)
  for (let i = 0; i < 3; i++) {
    out.push(
      '<g>' + R(can - 3 - i * 0.6, canY, 0.7, 1, '#7fc8ff') +
        '<animateTransform attributeName="transform" type="translate" values="0 0;' + n(-1 * U) + ' ' + n((soil === G ? 7 : 4) * U) + '"' + loop(t, 0.9, i * 0.3) + '/>' +
        '<animate attributeName="opacity" values="1;1;0" keyTimes="0;0.7;1"' + loop(t, 0.9, i * 0.3) + '/></g>',
    )
  }
  // A butterfly, wings beating, wandering round the flowers
  const wings = alternate(R(0, 0, 1, 1, '#ffb3d9') + R(2, 0, 1, 1, '#ffb3d9') + R(1, 0.5, 1, 1, '#4a3a4a'), R(0, 0.5, 1, 0.5, '#ffb3d9') + R(2, 0.5, 1, 0.5, '#ffb3d9') + R(1, 0.5, 1, 1, '#4a3a4a'), t, 0.3)
  const lift = G - soil
  const path = [[x - 16, G - 10 - lift], [x - 10, G - 14 - lift], [x - 3, G - 11 - lift], [x - 8, G - 8 - lift], [x - 14, G - 12 - lift], [x - 16, G - 10 - lift]]
  out.push(
    '<g>' + wings + '<animateTransform attributeName="transform" type="translate" values="' + path.map(([a, b]) => n(a * U) + ' ' + n(b * U)).join(';') + '"' + loop(t, 9) + '/></g>',
  )
  return out.join('')
}

// Dozing on a bench under the lamp, breathing slow, the z's drifting up
function sleep(width, t) {
  const x = spotOf(width) - 4
  const out = []
  // The bench: its back behind the mascot, the seat it sits on, the legs
  out.push(R(x - 2, G - 10, 21, 1, '#8a5a3a'), R(x - 2, G - 8, 21, 1, '#8a5a3a'), R(x - 1, G - 10, 1, 7, '#5a3a26'), R(x + 16, G - 10, 1, 7, '#5a3a26'))
  out.push(R(x - 2, G - 4, 21, 1, '#a8743e'), R(x - 1, G - 3, 1, 3, '#4a4f5a'), R(x + 16, G - 3, 1, 3, '#4a4f5a'))
  out.push(dozing(x, G - 3, t))
  return out.join('')
}

// The mascot asleep, eyes shut, rising and falling with each breath, the z's drifting up
function dozing(x, bottom, t) {
  const out = []
  out.push(
    '<g>' + sprite(FRONT_ASLEEP, x, bottom) +
      '<animateTransform attributeName="transform" type="translate" values="0 0;0 ' + n(-0.5 * U) + ';0 0"' + loop(t, 3.6) + '/></g>',
  )
  // The z's
  ;[0, 1.2, 2.4].forEach((ph, i) => {
    const size = 6 + i
    out.push(
      '<text x="' + n((x + 14) * U) + '" y="' + n((bottom - 11) * U) + '" font-family="ui-monospace, Menlo, monospace" font-weight="bold" font-size="' + size + '" fill="#e8e8f8">z' +
        '<animateTransform attributeName="transform" type="translate" values="0 0;' + n(5 * U) + ' ' + n(-9 * U) + '"' + loop(t, 3.6, ph) + '/>' +
        '<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.7;1"' + loop(t, 3.6, ph) + '/></text>',
    )
  })
  return out.join('')
}

const DRAW = { fishing, laptop, garden, sleep }

function escapeXml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// The whole scene as an SVG, width units wide and SCENE_H tall:
// - period: the time of day; t: seconds on the clock, for the animations to pick up from
// - activity: the pastime while idle, or null when the mascot is drawn from mascot instead
// - mascot: a pixel grid (rows of colors as numbers, or null), drawn at the mascot's spot,
//   each pixel a unit wide and two tall, with grid.words over it as [column, row, text, color]
// - bubble: lines of text a speech bubble left of the mascot says; caption: a line of status
// - seed: the layout of hills, trees and stars
export function sceneSvg({ width, period, t = 0, activity = null, mascot = null, bubble = null, caption = '', seed = 7 }) {
  ID = 'cs-' + period + '-' + (activity || 'm') + '-' + (hash(width * 31 + seed) % 10000) + '-'
  const out = [defs(period), backdrop(width, period, t, seed)]
  const spot = spotOf(width)
  if (mascot) {
    // Right-aligned to where the mascot would stand, its bottom on the grass; each of its
    // pixels a unit wide and two tall, its words a cell (2 by 2 pixels) each
    const cols = mascot[0].length
    const left = spot + 17 - cols
    const top = G + 1 - mascot.length * 2
    const rects = []
    for (let y = 0; y < mascot.length; y++) {
      let x = 0
      while (x < cols) {
        const c = mascot[y][x]
        let end = x + 1
        while (end < cols && mascot[y][end] === c) end++
        if (c !== null) rects.push(R(left + x, top + y * 2, end - x, 2, hex(c)))
        x = end
      }
    }
    out.push(shadow(spot, 15), outlined(rects.join('')))
    for (const [col, row, text, color] of mascot.words || []) {
      out.push(
        '<text x="' + n((left + col * 2) * U) + '" y="' + n((top + row * 4 + 3.3) * U) + '" font-family="ui-monospace, Menlo, monospace" font-weight="bold" font-size="' + n(3.6 * U) + '" fill="' + (typeof color === 'number' ? hex(color) : color) + '">' + escapeXml(text) + '</text>',
      )
    }
  } else if (activity && DRAW[activity]) {
    out.push(DRAW[activity](width, t, period))
  }
  if (caption) {
    out.push(
      '<text x="' + n((spot - 3) * U) + '" y="' + n((G - 3) * U) + '" text-anchor="end" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="bold" font-size="11" fill="#f9c74f" stroke="#1a1a1a" stroke-width="2.5" paint-order="stroke">' +
        escapeXml(caption) + '</text>',
    )
  }
  if (bubble && bubble.length) out.push(speech(bubble, spot - 2))
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + n(width * U) + '" height="' + n(SCENE_H * U) + '" viewBox="0 0 ' + n(width * U) + ' ' + n(SCENE_H * U) + '" shape-rendering="crispEdges">' +
    '<clipPath id="' + ID + 'c"><rect width="' + n(width * U) + '" height="' + n(SCENE_H * U) + '" rx="8"/></clipPath>' +
    '<g clip-path="url(#' + ID + 'c)">' + out.join('') + '</g></svg>'
  )
}

function hex(c) {
  return '#' + c.toString(16).padStart(6, '0')
}

// A speech bubble, its right edge at right (units), the lines inside in the app's font
function speech(lines, right) {
  const size = 11
  const lineH = 13
  const widthPx = Math.max(...lines.map((l) => [...l].reduce((a, ch) => a + (/[ᄀ-￿]/.test(ch) ? size : size * 0.58), 0))) + 14
  const heightPx = lines.length * lineH + 8
  const x = right * U - widthPx
  const y = 2 * U
  const tail = 'M' + n(right * U - 10) + ' ' + n(y + heightPx - 1) + ' l6 6 l2 -6 z'
  return (
    '<g shape-rendering="auto"><rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(widthPx) + '" height="' + n(heightPx) + '" rx="5" fill="#fffdf6" stroke="#2a2a2a" stroke-width="1"/>' +
    '<path d="' + tail + '" fill="#fffdf6" stroke="#2a2a2a" stroke-width="1"/>' +
    '<rect x="' + n(right * U - 11) + '" y="' + n(y + heightPx - 2) + '" width="10" height="2" fill="#fffdf6"/>' +
    lines.map((l, i) => '<text x="' + n(x + 7) + '" y="' + n(y + 4 + (i + 1) * lineH - 3) + '" font-family="ui-sans-serif, system-ui, sans-serif" font-size="' + size + '" fill="#2a2a2a">' + escapeXml(l) + '</text>').join('') +
    '</g>'
  )
}
