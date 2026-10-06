// Game mode: the mascot runs along the band above the prompt and jumps over what comes its way,
// as the browser's offline dinosaur does. The rules live here, shared by both ways of drawing it:
//
// - In the terminal, this module's default export is a Client: the game runs in its region on
//   the surface's own frame clock, the run, the jumps and the presses never waiting on the hooks
//   module, which only mounts it and keeps the best score. A click on the region jumps, and
//   gives it the keyboard, so space, up or w jump too until Escape hands the keyboard back.
//   Props: { words: { start, over, hi, esc, paused, faster }, hi, jumps }: jumps counts the
//   spaces typed into the empty prompt, each one a press here.
// - The desktop app loads no Client, so there the hooks module runs the game with these rules
//   and draws each moment with gameSvg: an SVG whose motion between moments is its own
//   animation, played by the app at the screen's pace.
//
// Everything moves in real time: the speed is in pixels a second, and each frame moves the
// world a whole pixel or two, never a fraction, so the run never judders.

// The canvas is 16 pixels tall, 8 terminal rows; each terminal cell shows 2 by 2 pixels
const H = 16
// The ground line is the next to last pixel row, and everything stands on the row above it.
// In the terminal that puts the feet at the bottom of one row of cells and the ground at the
// top of the next: a cell shows one color over another, so feet sharing a cell with the
// ground would be lost in it.
const GROUND_Y = H - 2
const FEET = GROUND_Y - 1
// The mascot, side on and facing right, a few cells in from the left; its body is 11 pixels
// wide and 4 tall over a row of legs
const CLAWD_X = 6
const CLAWD_TOP = FEET - 4
// A jump rises 9 pixels and lasts 0.7 seconds
const JUMP_V = 51.4
const GRAVITY = 147
const AIR_S = (2 * JUMP_V) / GRAVITY
// The run starts at 30 pixels a second and speeds up by 5 every 100 points, up to 65
const SPEED_START = 30
const SPEED_UP = 5
const SPEED_MAX = 65
// Up to 50 pixels a second each frame moves the world a pixel; faster, two
const ONE_PIXEL_MAX = 50
// Between frames while nothing moves (before the start, paused, after a crash)
const IDLE_MS = 50
// The desktop's drawings carry the run this many seconds on their own, so obstacles are laid
// out that far past the right edge: they slide in by the drawing's own animation
export const HOLD_S = 6
const AHEAD = SPEED_MAX * HOLD_S

const ORANGE = 0xd97757
const EYE = 0x000000
const GREEN = 0x5fae5f
const RED = 0xe5484d
const WHITE = 0xf5f0e8
const GROUND = 0x8a8a8a
const FLECK = 0x555555
const CLOUD = 0x4a4a4a
// Pixels from one fleck on the ground to the next: even, so each fleck starts on a cell
const FLECK_EVERY = 30
const SCORE = 'rgb(170,170,170)'
const MESSAGE = 'rgb(230,230,230)'
const FASTER = 'rgb(249,199,79)'

const QUADS = ' ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█'

function colorOf(c) {
  return 'rgb(' + (c >> 16) + ',' + ((c >> 8) & 255) + ',' + (c & 255) + ')'
}

function blankGrid(width, height = H) {
  return Array.from({ length: height }, () => Array(width).fill(null))
}

function px(grid, x, y, color) {
  x = Math.round(x)
  y = Math.round(y)
  if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) grid[y][x] = color
}

function rect(grid, x, y, w, h, color) {
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) px(grid, x + xx, y + yy, color)
}

// The mascot side on, facing right, its head on row top: both eyes toward the front, a stubby
// arm either side, the legs taking turns. In the air the arms go up and the legs tuck in; after
// a crash the eyes squeeze shut.
//
//   .███████████.        ██.........██     in the air
//   .████▪████▪█.        .█▪████▪███..
//   █████████████
//   .███████████.
//   ..█.█...█.█..        running, the other step one pixel on
function drawRunner(grid, top, frame, air, dead) {
  const x = CLAWD_X
  rect(grid, x, top, 11, 4, ORANGE)
  if (dead) {
    rect(grid, x + 3, top + 1, 2, 1, EYE)
    rect(grid, x + 8, top + 1, 2, 1, EYE)
  } else {
    px(grid, x + 4, top + 1, EYE)
    px(grid, x + 9, top + 1, EYE)
  }
  if (air) {
    px(grid, x - 1, top + 1, ORANGE)
    px(grid, x - 2, top, ORANGE)
    px(grid, x + 11, top + 1, ORANGE)
    px(grid, x + 12, top, ORANGE)
  } else {
    px(grid, x - 1, top + 2, ORANGE)
    px(grid, x + 11, top + 2, ORANGE)
  }
  const legs = air ? [2, 4, 8, 10] : frame ? [1, 3, 7, 9] : [2, 4, 8, 10]
  for (const lx of legs) px(grid, x + lx, top + 4, ORANGE)
}

// What comes along the ground: cacti of three kinds, and a red bug
const KINDS = {
  cactus: { w: 3, h: 4 },
  tall: { w: 3, h: 6 },
  pair: { w: 7, h: 5 },
  bug: { w: 5, h: 3 },
}

function drawObstacle(grid, kind, x) {
  const { h } = KINDS[kind]
  const top = FEET - h + 1
  if (kind === 'bug') {
    rect(grid, x, top, 5, 2, RED)
    px(grid, x, top, WHITE)
    for (const lx of [0, 2, 4]) px(grid, x + lx, top + 2, RED)
    return
  }
  const cactus = (cx, ch) => {
    const t = FEET - ch + 1
    rect(grid, cx + 1, t, 1, ch, GREEN)
    px(grid, cx, t + 1, GREEN)
    px(grid, cx, t + 2, GREEN)
    px(grid, cx + 2, t + 2, GREEN)
    px(grid, cx + 2, t + 3, GREEN)
  }
  if (kind === 'pair') {
    cactus(x, 5)
    cactus(x + 4, 4)
  } else cactus(x, h)
}

function drawCloud(grid, x, y) {
  rect(grid, x + 1, y, 4, 1, CLOUD)
  rect(grid, x, y + 1, 6, 1, CLOUD)
}

export function newGame(hi) {
  return {
    mode: 'ready',
    top: CLAWD_TOP,
    vy: 0,
    speed: SPEED_START,
    level: 0,
    dist: 0,
    obstacles: [],
    clouds: [],
    nextGap: 60,
    // Milliseconds of game time, and when things happened in it
    time: 0,
    overAt: 0,
    flashUntil: 0,
    escUntil: 0,
    hi: hi || 0,
  }
}

export function score(g) {
  return Math.floor(g.dist / 3)
}

function onGround(g) {
  return g.top >= CLAWD_TOP && g.vy === 0
}

// Pixels the world moves each frame, and how long a frame is
function stride(g) {
  return g.speed > ONE_PIXEL_MAX ? 2 : 1
}

export function frameMs(g) {
  return g.mode === 'run' ? (stride(g) * 1000) / g.speed : IDLE_MS
}

function jump(g) {
  g.vy = -JUMP_V
}

// A press: the first starts the run with a jump, then each jumps if on the ground, and after a
// crash, once it has sunk in, starts over. Returns the state to go on with.
export function press(g) {
  if (g.mode === 'ready') {
    g.mode = 'run'
    jump(g)
  } else if (g.mode === 'run') {
    if (onGround(g)) jump(g)
  } else if (g.mode === 'paused') {
    g.mode = 'run'
  } else if (g.mode === 'over' && g.time - g.overAt > 400) {
    const fresh = newGame(g.hi)
    fresh.mode = 'run'
    jump(fresh)
    return fresh
  }
  return g
}

// The desktop's Start: a run from the beginning, on the ground
export function start(g) {
  if (g.mode === 'paused') {
    g.mode = 'run'
    return g
  }
  if (g.mode === 'run') return g
  const fresh = newGame(g.hi)
  fresh.mode = 'run'
  return fresh
}

export function pause(g) {
  if (g.mode === 'run') g.mode = 'paused'
  else if (g.mode === 'paused') g.mode = 'run'
  return g
}

// One frame on. Returns what happened that a drawing might show at once, or null:
// { land, spawn, crash, level, hi }.
export function step(g, width) {
  const ms = frameMs(g)
  g.time += ms
  if (g.mode !== 'run') return null
  const news = {}
  const dx = stride(g)
  g.dist += dx
  // The jump, in real time
  if (!onGround(g)) {
    const dt = ms / 1000
    g.vy += GRAVITY * dt
    g.top += g.vy * dt
    if (g.top >= CLAWD_TOP) {
      g.top = CLAWD_TOP
      g.vy = 0
      news.land = true
    }
  }
  // Faster every 100 points, up to the top speed, the score flashing to say so
  const level = Math.floor(score(g) / 100)
  if (level > g.level) {
    g.level = level
    const speed = Math.min(SPEED_MAX, SPEED_START + SPEED_UP * level)
    if (speed > g.speed) {
      g.speed = speed
      g.flashUntil = g.time + 1200
      news.level = true
    }
  }
  // The ground and what's on it slide left; a new obstacle once the last is far enough in
  for (const o of g.obstacles) o.x -= dx
  g.obstacles = g.obstacles.filter((o) => o.x + KINDS[o.kind].w > 0)
  for (const c of g.clouds) c.x -= dx * 0.3
  g.clouds = g.clouds.filter((c) => c.x + 6 > 0)
  // New obstacles are laid out ahead, past the right edge, each a gap after the last
  for (;;) {
    const last = g.obstacles[g.obstacles.length - 1]
    if (last && last.x >= width + AHEAD) break
    const kinds =
      g.level < 1 ? ['cactus', 'cactus', 'bug'] : g.level < 2 ? ['cactus', 'tall', 'bug'] : ['cactus', 'tall', 'pair', 'bug']
    g.obstacles.push({ x: last ? last.x + g.nextGap : width, kind: kinds[Math.floor(Math.random() * kinds.length)] })
    // Room enough to land and jump again, more the faster it goes
    g.nextGap = Math.round(g.speed * AIR_S + 20 + Math.random() * 60)
    news.spawn = true
  }
  if (g.clouds.length < 4 && Math.random() < 0.004 * dx) {
    g.clouds.push({ x: width + Math.random() * 120, y: 3 + Math.floor(Math.random() * 3) })
  }
  // A hit: the body's box against each obstacle's, a pixel forgiven on each side
  const feet = Math.round(g.top) + 4
  for (const o of g.obstacles) {
    const { w, h } = KINDS[o.kind]
    if (o.x + w - 2 >= CLAWD_X + 1 && o.x + 1 <= CLAWD_X + 10 && feet >= FEET - h + 2) {
      g.mode = 'over'
      g.overAt = g.time
      news.crash = true
      if (score(g) > g.hi) {
        g.hi = score(g)
        news.hi = g.hi
      }
      break
    }
  }
  return news.land || news.spawn || news.crash || news.level ? news : null
}

// Whether a character takes two cells (CJK and the like), and how many cells a text takes
function isWide(ch) {
  return /[ᄀ-￿]/.test(ch) && !/[─-▟]/.test(ch)
}

function cellsOf(text) {
  return [...text].reduce((n, ch) => n + (isWide(ch) ? 2 : 1), 0)
}

function pad(n) {
  return String(n).padStart(5, '0')
}

// The texts over the track, as { col, row, text, color, anchor, flash }: the score at the top
// right, flashing as the run speeds up; a message in the middle
function texts(g, columns, words) {
  const out = []
  const scoreText = (g.hi > 0 ? (words.hi || 'HI') + ' ' + pad(g.hi) + '  ' : '') + pad(score(g))
  const flash = g.time < g.flashUntil
  out.push({ col: columns - cellsOf(scoreText) - 1, row: 0, text: scoreText, color: SCORE, anchor: 'end', flash })
  const reminding = g.time < g.escUntil
  let message = ''
  let color = MESSAGE
  if (reminding) message = words.esc
  else if (g.mode === 'ready') message = words.start
  else if (g.mode === 'paused') message = words.paused
  else if (g.mode === 'over') message = words.over
  else if (flash) {
    message = words.faster
    color = FASTER
  }
  if (message) out.push({ col: Math.max(0, Math.floor((columns - cellsOf(message)) / 2)), row: 1, text: message, color, anchor: 'middle' })
  return out
}

// The frame for the terminal: the pixels, columns cells wide (2 pixels each) and H tall, and
// the texts written over whole cells
export function paint(g, columns, words) {
  const grid = blankGrid(columns * 2)
  for (const c of g.clouds) drawCloud(grid, c.x, c.y)
  // The ground, one unbroken line, flecked darker here and there so it shows the run. A fleck
  // fills a whole cell and moves a cell at a time: one half in a cell and half in the next
  // would leave a gap in the line each side, a gap that comes and goes as it moves.
  const off = g.dist - (g.dist % 2)
  for (let x = 0; x < columns * 2; x++) px(grid, x, GROUND_Y, (x + off) % FLECK_EVERY < 2 ? FLECK : GROUND)
  // The obstacles go over the mascot, so the one it ran into shows
  drawRunner(grid, g.top, Math.floor(g.dist / 3) % 2 === 0, !onGround(g), g.mode === 'over')
  for (const o of g.obstacles) drawObstacle(grid, o.kind, o.x)
  // Before the start the message blinks; a flashing score blinks too
  const shown = texts(g, columns, words).filter((t) => {
    if (t.flash) return Math.floor(g.time / 150) % 2 === 0
    if (t.anchor === 'middle' && g.mode === 'ready') return Math.floor(g.time / 500) % 2 === 0
    return true
  })
  return { grid, texts: shown }
}

// A grid's pixels as SVG rects, each row's runs of one color merged, offset by ox pixels
function rects(grid, sw, sh, ox = 0) {
  const out = []
  for (let y = 0; y < grid.length; y++) {
    let x = 0
    while (x < grid[y].length) {
      const c = grid[y][x]
      let end = x + 1
      while (end < grid[y].length && grid[y][end] === c) end++
      if (c !== null) {
        out.push('<rect x="' + (x + ox) * sw + '" y="' + y * sh + '" width="' + (end - x) * sw + '" height="' + sh + '" fill="' + colorOf(c) + '"/>')
      }
      x = end
    }
  }
  return out.join('')
}

function escapeXml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const n2 = (n) => Math.round(n * 100) / 100

// The frame for the desktop app: an SVG of this moment whose own animation carries it on, the
// world sliding left at the run's speed, the legs stepping, a jump rising and falling, so the
// app plays the motion at the screen's pace and the hooks module sends a new one only when
// something changes (a jump, a landing, a new obstacle, a crash) and now and then for the score.
// Each pixel is sw by sh CSS pixels.
export function gameSvg(g, columns, words, sw, sh) {
  const W = columns * 2
  const running = g.mode === 'run'
  const v = g.speed
  const HOLD = HOLD_S
  const out = []
  // Something that slides left from pixel x at speed pixels a second while the run goes on
  const slide = (x, inner, speed) =>
    '<g transform="translate(' + n2(x * sw) + ' 0)"><g>' + inner +
    (running ? '<animateTransform attributeName="transform" type="translate" from="0 0" to="' + n2(-speed * HOLD * sw) + ' 0" dur="' + HOLD + 's" fill="freeze"/>' : '') +
    '</g></g>'
  for (const c of g.clouds) {
    const grid = blankGrid(6)
    drawCloud(grid, 0, c.y)
    out.push(slide(c.x, rects(grid, sw, sh), v * 0.3))
  }
  // The ground: one line, and its flecks sliding by, round and round
  out.push('<rect x="0" y="' + GROUND_Y * sh + '" width="' + W * sw + '" height="' + sh + '" fill="' + colorOf(GROUND) + '"/>')
  const phase = g.dist % FLECK_EVERY
  const flecks = []
  for (let x = -phase; x < W + FLECK_EVERY; x += FLECK_EVERY) {
    flecks.push('<rect x="' + x * sw + '" y="' + GROUND_Y * sh + '" width="' + 2 * sw + '" height="' + sh + '" fill="' + colorOf(FLECK) + '"/>')
  }
  out.push(
    '<g>' + flecks.join('') +
      (running ? '<animateTransform attributeName="transform" type="translate" from="0 0" to="' + n2(-FLECK_EVERY * sw) + ' 0" dur="' + n2(FLECK_EVERY / v) + 's" repeatCount="indefinite"/>' : '') +
      '</g>',
  )
  // The mascot
  const width = CLAWD_X + 14
  const sprite = (frame, air, dead) => {
    const grid = blankGrid(width)
    drawRunner(grid, CLAWD_TOP, frame, air, dead)
    return rects(grid, sw, sh)
  }
  // Running on the ground: two steps taking turns, one every 3 pixels of the run, from a
  // moment on (the landing, or at once)
  const runFrom = (begin) => {
    const period = n2(6 / v)
    const show = begin > 0 ? ' visibility="hidden"' : ''
    const at = begin > 0 ? '<set attributeName="visibility" to="visible" begin="' + n2(begin) + 's"/>' : ''
    return (
      '<g' + show + '>' + sprite(true, false, false) + at +
      '<animate attributeName="opacity" values="1;0" dur="' + period + 's" calcMode="discrete" repeatCount="indefinite"/></g>' +
      '<g' + show + ' opacity="0">' + sprite(false, false, false) + at +
      '<animate attributeName="opacity" values="0;1" dur="' + period + 's" calcMode="discrete" repeatCount="indefinite"/></g>'
    )
  }
  const lift = (g.top - CLAWD_TOP) * sh
  if (g.mode === 'over') {
    out.push('<g transform="translate(0 ' + n2(lift) + ')">' + sprite(true, !onGround(g), true) + '</g>')
  } else if (!onGround(g)) {
    // The rest of the jump, frame by frame as the hooks module will play it, until it lands,
    // then the run goes on
    const dys = [n2(lift)]
    if (running) {
      let top = g.top
      let vy = g.vy
      const dt = frameMs(g) / 1000
      while (dys.length < 200) {
        vy += GRAVITY * dt
        top += vy * dt
        if (top >= CLAWD_TOP) {
          dys.push(0)
          break
        }
        dys.push(n2((top - CLAWD_TOP) * sh))
      }
    }
    const air = ((dys.length - 1) * frameMs(g)) / 1000
    const anim =
      dys.length > 1
        ? '<animateTransform attributeName="transform" type="translate" values="' + dys.map((d) => '0 ' + d).join(';') +
          '" dur="' + n2(air) + 's" fill="freeze"/>'
        : ''
    const landed = running ? '<set attributeName="visibility" to="hidden" begin="' + n2(air) + 's"/>' : ''
    out.push('<g transform="translate(0 ' + dys[0] + ')">' + sprite(true, true, false) + anim + landed + '</g>')
    if (running) out.push(runFrom(air))
  } else if (running) {
    out.push(runFrom(0))
  } else {
    out.push(sprite(true, false, false))
  }
  for (const o of g.obstacles) {
    const grid = blankGrid(KINDS[o.kind].w)
    drawObstacle(grid, o.kind, 0)
    out.push(slide(o.x, rects(grid, sw, sh), v))
  }
  // The texts, in the app's own font, placed by their anchors. While the run goes on the
  // score counts up by itself: one text for each point to come, each shown in its turn.
  const cell = 2 * sw
  const textAt = (t, text, extra, attrs = '') => {
    const cells = cellsOf(text)
    const x = t.anchor === 'end' ? (t.col + cells) * cell : t.anchor === 'middle' ? (t.col + cells / 2) * cell : t.col * cell
    return (
      '<text x="' + n2(x) + '" y="' + n2((t.row * 2 + 1.7) * sh) + '" text-anchor="' + (t.anchor || 'start') +
      '" font-family="ui-monospace, Menlo, monospace" font-size="' + n2(2.2 * sh) + '" fill="' + t.color + '"' + attrs + '>' +
      escapeXml(text) + extra + '</text>'
    )
  }
  for (const t of texts(g, columns, words)) {
    if (t.anchor === 'end' && running) {
      // The score: this point now, and each next one when the run gets there
      const prefix = g.hi > 0 ? (words.hi || 'HI') + ' ' + pad(g.hi) + '  ' : ''
      const blink = t.flash ? '<animate attributeName="opacity" values="1;0.15" dur="0.3s" calcMode="discrete" repeatCount="4"/>' : ''
      const now = score(g)
      const times = [0]
      for (let k = now + 1; times.length < 400; k++) {
        const at = (k * 3 - g.dist) / v
        if (at > HOLD) break
        times.push(Math.max(0, at))
      }
      times.forEach((at, i) => {
        const until = i + 1 < times.length ? times[i + 1] : null
        const shown =
          i === 0
            ? until === null ? '' : '<set attributeName="visibility" to="hidden" begin="' + n2(until) + 's"/>'
            : '<set attributeName="visibility" to="visible" begin="' + n2(at) + 's"' + (until === null ? '' : ' dur="' + n2(until - at) + 's"') + '/>'
        out.push(textAt(t, prefix + pad(now + i), (i === 0 ? blink : '') + shown, i === 0 ? '' : ' visibility="hidden"'))
      })
      continue
    }
    const blink = t.flash ? '<animate attributeName="opacity" values="1;0.15" dur="0.3s" calcMode="discrete" repeatCount="4"/>' : ''
    // "Faster!" goes once the flash is over
    const gone = t.anchor === 'middle' && running && g.time < g.flashUntil ? '<set attributeName="visibility" to="hidden" begin="' + n2((g.flashUntil - g.time) / 1000) + 's"/>' : ''
    out.push(textAt(t, t.text, blink + gone))
  }
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + W * sw + '" height="' + H * sh + '" viewBox="0 0 ' + W * sw + ' ' + H * sh +
    '" shape-rendering="crispEdges">' + out.join('') + '</svg>'
  )
}

// The canvas as rows of runs, each cell a quadrant block in its most common color over the
// second, text written over whole cells (a wide character over two)
function draw(Box, Text, grid, columns, shown) {
  const written = new Map()
  for (const { col, row, text, color } of shown) {
    let c = col
    for (const ch of text) {
      const wide = isWide(ch)
      if (c >= 0 && c < columns) written.set(row * columns + c, [ch, color])
      if (wide && c + 1 >= 0 && c + 1 < columns) written.set(row * columns + c + 1, ['', color])
      c += wide ? 2 : 1
    }
  }
  const rows = []
  for (let y = 0; y < grid.length; y += 2) {
    const runs = []
    for (let x = 0; x < columns * 2; x += 2) {
      const quad = [grid[y][x], grid[y][x + 1], grid[y + 1][x], grid[y + 1][x + 1]]
      const counts = new Map()
      for (const c of quad) if (c !== null) counts.set(c, (counts.get(c) || 0) + 1)
      const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c)
      const fg = ranked.length > 0 ? ranked[0] : null
      let bg = ranked.length > 1 && !quad.includes(null) ? ranked[1] : null
      let mask = 0
      quad.forEach((c, i) => {
        if (c !== null && c === fg) mask |= 1 << i
      })
      let char = QUADS[mask]
      let color = fg === null ? null : colorOf(fg)
      const word = written.get((y / 2) * columns + x / 2)
      if (word) {
        char = word[0]
        color = word[1]
        bg = null
      }
      const backgroundColor = bg === null ? null : colorOf(bg)
      const last = runs[runs.length - 1]
      if (last && last.color === color && last.backgroundColor === backgroundColor) last.text += char
      else runs.push({ text: char, color, backgroundColor })
    }
    rows.push(
      Box({
        flexDirection: 'row',
        width: columns,
        flexShrink: 0,
        children: runs.map(({ text, color, backgroundColor }) => {
          if (color === null) return Box({ width: text.length, height: 1, flexShrink: 0 })
          return Text(backgroundColor === null ? { children: [text], color } : { children: [text], color, backgroundColor })
        }),
      }),
    )
  }
  return Box({ flexDirection: 'column', width: columns, flexShrink: 0, children: rows })
}

// Each instance's press, for a new count of jumps in its props to reach
const presses = new WeakMap()

export default function ClawdGame(props, surface) {
  const { Box, Text } = surface.elements
  const words = props.words || {}
  if (surface.state === undefined) {
    const first = newGame(props.hi)
    // The frame clock runs at the game's own pace: one frame per pixel or two the world moves,
    // so it restarts whenever the run speeds up
    let ms = 0
    let stop = null
    let drawnAt = 0
    const schedule = (s) => {
      const next = frameMs(s)
      if (next === ms) return
      if (stop) stop()
      ms = next
      stop = surface.every(ms, tick)
    }
    const tick = () => {
      const s = surface.state || first
      const news = step(s, Math.max(40, surface.columns * 2))
      if (news && news.hi) surface.post({ hi: news.hi })
      // While it runs every frame draws; standing still, a few a second do, for the blinks
      if (s.mode === 'run' || news || s.time - drawnAt >= 150) {
        drawnAt = s.time
        surface.setState({ ...s })
      }
      schedule(s)
    }
    const act = () => {
      const before = surface.state || first
      const s = press(before)
      s.jumpsSeen = before.jumpsSeen
      surface.setState({ ...s })
      schedule(s)
    }
    surface.onPointer((event) => {
      if (event.type === 'down' && event.button === 'left') act()
    })
    // The keys go to the game until Escape; any other key typed meanwhile, meant for the
    // prompt, brings up a reminder of the way back
    surface.onKey((event) => {
      if (event.key === ' ' || event.key === 'space' || event.key === 'up' || event.key === 'w') act()
      else {
        const s = surface.state || first
        surface.setState({ ...s, escUntil: s.time + 2000 })
      }
    })
    presses.set(surface, act)
    first.jumpsSeen = props.jumps || 0
    surface.setState(first)
    schedule(first)
  }
  const g = surface.state || newGame(props.hi)
  if ((props.hi || 0) > g.hi) g.hi = props.hi
  // A space typed into the empty prompt since the last drawing
  if ((props.jumps || 0) > (g.jumpsSeen || 0)) {
    g.jumpsSeen = props.jumps
    const act = presses.get(surface)
    if (act) act()
  }
  const columns = Math.max(20, surface.columns || 60)
  const { grid, texts: shown } = paint(g, columns, words)
  return draw(Box, Text, grid, columns, shown)
}
