// Tuning knobs
// Time between animation frames. Redraws are throttled, so don't go much below 100.
const FRAME_MS = 150
// How long a tool's pose lasts before the mascot goes back to thinking
const POSE_MS = 3000
// How many frames the celebration plays (about 4.5 seconds)
const CELEBRATE_FRAMES = 30
// Only celebrate a turn that took at least this long. Set to 0 to celebrate every turn.
const MIN_TURN_MS = 5000

// Drawings are grids of pixels drawn with quadrant block characters, as Claude Code draws
// its own logo: each terminal cell holds 2 by 2 pixels. Widths and heights are in pixels.
// The mascot lives at the right end of the band directly above the prompt, standing on the
// prompt's top line. While Claude works its canvas is 26 by 10 pixels, drawn as 13 columns by
// 5 rows: the mascot stands on the bottom row, with room at the right for props and above
// for the code bubbles that rise while it types. Every working pose is drawn this tall, so
// switching poses never moves the lines above the band.
const SW = 26
const SH = 10
// The pixel row the mascot's head is on while it stands on the canvas's bottom row
const TOP = SH - 5
// While Claude waits for you the canvas is 26 by 8 pixels: the mascot on its bottom rows, with
// room above to hop when you click it
const IDLE_H = 8
// The celebration's canvas: 40 by 10 pixels, drawn as 20 columns by 5 rows
const CW = 40
const CH = 10

const ORANGE = 0xd97757
// The logo's eyes are black, not holes showing the terminal's background
const EYE = 0x000000
const WHITE = 0xf5f0e8
const GREY = 0x8a8a8a
const YELLOW = 0xf9c74f
const BLUE = 0x6cb4ee
const GREEN = 0x8bd48b
const PINK = 0xe58fbf
const RED = 0xe5484d
const LAPTOP = 0x5c6370
// The music mode's headphones: a silver band and pink ear cups
const HEADBAND = 0xc9ced8
const EARCUP = PINK
const CODE_COLORS = [BLUE, YELLOW, GREEN, PINK]
const PARTY_COLORS = [PINK, BLUE, YELLOW, GREEN, RED, WHITE]

// Bits of code that bubble up from the mascot's head while it types. Plain ASCII only, so each
// character fills exactly one terminal cell.
const CODE_BITS = ['{}', '</>', '()', ';', '=>', '[]', '&&', '//', '#', '!=', '++']
// A new code bubble surfaces every this many frames, and spends as long on each row
const BUBBLE_EVERY = 4

// Music notes, drawn in pixels rather than as ♪ characters, whose width terminals disagree
// on: a quarter note and an eighth note, three pixels tall
const NOTES = [
  ['.#', '.#', '##'],
  ['.##', '.#.', '##.'],
]
// How many frames a note floats up before it's gone
const NOTE_LIFE = 5
// In music mode the canvas grows by this many pixels on each side, for a little equalizer of
// five bars a side, each a pixel wide with a pixel between, standing on the floor
const EQ_W = 10
const EQ_BARS = 5
// The tallest an equalizer bar gets, in pixels; it stays below the notes, which float higher
const EQ_MAX = 6
const EQ_COLOR = 0xc4704a

// Chatting with Clawd: the pane the chat shows in, the most messages it keeps, how many of
// them a reply reads, and how many messages of the session's own conversation it's told of
const CHAT_PANE = 'clawd-chat'
const CHAT_KEEP = 50
const CHAT_READS = 20
const SCENE_MESSAGES = 8
// The models a reply can come from: an alias for $.model.complete, or `main`, a fork of the
// session's own conversation on its own model
const CHAT_MODELS = ['haiku', 'sonnet', 'opus', 'main']
// The speech bubble beside the mascot: its widest, in terminal columns, and how long it stays
const BUBBLE_WIDTH = 36
const BUBBLE_MIN_MS = 6000
const BUBBLE_MAX_MS = 20000
// While Claude works, a reply shows only this long before the mascot gets back to work
const BUBBLE_WORKING_MS = 5000

// What the mascot says, in each language the `language` option offers: the caption beside
// each pose, and the cheers it picks from when a task is done
const WORDS = {
  zh: {
    poses: { think: '思考中', read: '阅读中', edit: '编辑中', bash: '运行中', search: '搜索中' },
    cheers: ['任务完成!', '搞定啦!', '干得漂亮!', '太棒了!'],
    command: '显示或隐藏 Clawd、开关音乐模式,或和 Clawd 聊天',
    usage: '用法:/clawd show | hidden | music [start | stop] | chat [想说的话 | close | clear]',
    shown: 'Clawd 出来啦。',
    hidden: 'Clawd 已隐藏,输入 /clawd show 让它回来。',
    hiddenMusic: 'Clawd 已隐藏,音乐模式也一起关了。输入 /clawd show 让它回来。',
    building: '第一次开启,正在编译听音乐的小程序…',
    musicOn:
      'Clawd 戴上耳机了,会跟着这台 Mac 正在播放的音乐摇摆。只读取声音有多响,不用麦克风,也不保存任何声音。\n' +
      '第一次开启时,macOS 会弹窗问"clawd-ears"能否录制系统音频,点"允许"即可。\n' +
      '如果放着音乐 Clawd 却不动(比如之前点了不允许):打开 系统设置 → 隐私与安全性 → 录屏与系统录音,' +
      '在下方"仅系统录音"列表里找到 clawd-ears 并打开开关,然后输入 /clawd music stop 再 /clawd music start。',
    musicAlready: '音乐模式已经开着了。',
    musicOff: '音乐模式已关闭,耳机摘下来了。',
    musicNotOn: '音乐模式本来就是关着的。',
    musicHidden: 'Clawd 现在是隐藏的,先输入 /clawd show。',
    musicFailed: '音乐模式开不了:',
    musicStopped: 'Clawd 的音乐模式停了:',
    chatYou: '你',
    chatPlaceholder: '跟 Clawd 说点什么…(Esc 回到主输入框)',
    chatSend: '发送',
    chatThinking: 'Clawd 正在想…',
    chatHello: '跟 Clawd 打个招呼吧。它看得到 Claude 在做什么,但不会动你的文件。聊天内容不会进入 Claude 的对话。',
    chatFailed: 'Clawd 没听清:',
    chatFallback: '主会话还没有能分叉的对话,这次先用 haiku 回答。',
    chatCleared: '和 Clawd 的聊天记录清空了。',
    chatLanguage: 'Reply in Simplified Chinese, unless the user writes to you in another language.',
    chatHint: '想说的话 | close | clear',
  },
  en: {
    poses: { think: 'Thinking', read: 'Reading', edit: 'Editing', bash: 'Running', search: 'Searching' },
    cheers: ['All done!', 'Nailed it!', 'Great job!', 'Awesome!'],
    command: 'Show or hide Clawd, turn music mode on or off, or chat with Clawd',
    usage: 'Usage: /clawd show | hidden | music [start | stop] | chat [message | close | clear]',
    shown: 'Clawd is back.',
    hidden: 'Clawd is hidden. Run /clawd show to bring it back.',
    hiddenMusic: 'Clawd is hidden, and music mode is off too. Run /clawd show to bring it back.',
    building: 'First time on: building the little program that listens to the music…',
    musicOn:
      'Clawd has its headphones on and moves to whatever this Mac is playing. It reads only how loud the sound is, never the microphone, and keeps no audio.\n' +
      'The first time, macOS asks whether "clawd-ears" may record system audio: click Allow.\n' +
      'If music plays and Clawd stays still (say you clicked Don\'t Allow): open System Settings → Privacy & Security → Screen & System Audio Recording, ' +
      'find clawd-ears in the "System Audio Recording Only" list and switch it on, then run /clawd music stop and /clawd music start.',
    musicAlready: 'Music mode is already on.',
    musicOff: 'Music mode is off, and the headphones are off.',
    musicNotOn: 'Music mode was already off.',
    musicHidden: 'Clawd is hidden. Run /clawd show first.',
    musicFailed: "Music mode couldn't start: ",
    musicStopped: "Clawd's music mode stopped: ",
    chatYou: 'You',
    chatPlaceholder: 'Say something to Clawd… (Esc goes back to the prompt)',
    chatSend: 'send',
    chatThinking: 'Clawd is thinking…',
    chatHello: "Say hi to Clawd. It can see what Claude is doing, but it never touches your files. The chat stays out of Claude's conversation.",
    chatFailed: "Clawd didn't catch that: ",
    chatFallback: 'The session has no conversation to fork yet, so haiku answers this one.',
    chatCleared: 'The chat with Clawd is cleared.',
    chatLanguage: 'Reply in English, unless the user writes to you in another language.',
    chatHint: 'message | close | clear',
  },
}

function poseOf(tool) {
  if (tool === 'Read') return 'read'
  if (tool === 'Edit' || tool === 'Write' || tool === 'NotebookEdit') return 'edit'
  if (tool === 'Bash') return 'bash'
  if (tool === 'Grep' || tool === 'Glob' || tool === 'WebSearch' || tool === 'WebFetch') {
    return 'search'
  }
  return 'think'
}

// --- Drawing -----------------------------------------------------------------

function blank(width, height) {
  const grid = Array.from({ length: height }, () => Array(width).fill(null))
  // Text drawn over the pixels in whole terminal cells, as [column, row, text, color]
  grid.words = []
  return grid
}

// Write text starting at a terminal cell's column and row, one character a cell. It covers
// whatever pixels that cell holds.
function write(grid, col, row, text, color) {
  grid.words.push([col, row, text, color])
}

function px(grid, x, y, color) {
  if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) grid[y][x] = color
}

function rect(grid, x, y, w, h, color) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) px(grid, xx, yy, color)
  }
}

// A pseudo-random number from a seed: the same seed always gives the same number
function hash(n) {
  return Math.imul(n + 1, 2654435761) >>> 0
}

// Claude Code's mascot, pixel for pixel as its logo draws it, 17 wide and 5 tall, starting
// at column ox with its head on row top:
//
//   ..█████████████..
//   ..██.███████.██..   the eyes are black
//   █████████████████   the arms stick out on this row
//   ..█████████████..
//   ..█.█.......█.█..
//
// eyeShift moves the eyes a pixel sideways and eyeDrop a pixel down; blink closes them and wink
// only the right one. armL and armR are 'down' or 'up'. legStep 1 or 2 moves the legs a
// pixel left or right, as in a step.
function drawClawd(grid, o) {
  const { ox = 0, top = 0, eyeShift = 0, eyeDrop = 0, blink = false, wink = false } = o
  const { armL = 'down', armR = 'down', legStep = 0 } = o
  rect(grid, ox + 2, top, 13, 4, ORANGE)
  if (!blink) {
    px(grid, ox + 4 + eyeShift, top + 1 + eyeDrop, EYE)
    if (!wink) px(grid, ox + 12 + eyeShift, top + 1 + eyeDrop, EYE)
  }
  if (armL === 'up') {
    px(grid, ox + 1, top + 1, ORANGE)
    px(grid, ox, top, ORANGE)
    px(grid, ox, top - 1, ORANGE)
  } else if (armL === 'down') {
    rect(grid, ox, top + 2, 2, 1, ORANGE)
  }
  if (armR === 'up') {
    px(grid, ox + 15, top + 1, ORANGE)
    px(grid, ox + 16, top, ORANGE)
    px(grid, ox + 16, top - 1, ORANGE)
  } else if (armR === 'down') {
    rect(grid, ox + 15, top + 2, 2, 1, ORANGE)
  }
  const shift = legStep === 1 ? -1 : legStep === 2 ? 1 : 0
  for (const lx of [2, 4, 12, 14]) px(grid, ox + lx + shift, top + 4, ORANGE)
}

// The mascot seen from the side, facing left, 14 wide and 5 tall, starting at column ox with
// its head on row top. The near eye sits on the face's front edge and the far one further
// back; the arm reaches forward. With tap the arm angles down and its hand, two pixels wide,
// lands on a key a row lower and a column further forward (drawn here from column ox - 1):
//
//   ...███████████       ....███████████
//   ...▪█████▪████       ....▪█████▪████
//   ██████████████       ..█████████████
//   ...███████████       ██..███████████
//   ...█.█...█.█..       ....█.█...█.█..
function drawClawdSide(grid, o) {
  const { ox = 0, top = 0, blink = false, tap = false } = o
  rect(grid, ox + 3, top, 11, 4, ORANGE)
  if (!blink) {
    px(grid, ox + 3, top + 1, EYE)
    px(grid, ox + 9, top + 1, EYE)
  }
  if (tap) {
    rect(grid, ox + 1, top + 2, 2, 1, ORANGE)
    rect(grid, ox - 1, top + 3, 2, 1, ORANGE)
  } else {
    rect(grid, ox, top + 2, 3, 1, ORANGE)
  }
  for (const lx of [3, 5, 9, 11]) px(grid, ox + lx, top + 4, ORANGE)
}

// Code bubbles rising from the typing mascot's head, whose top is on pixel row top and
// spans cell columns 7 to 12. Each one surfaces as a blip on the head, floats up a row of
// text at a time, drifting sideways as it goes, then pops. While one rises the next surfaces.
function drawBubbles(grid, t, top) {
  const newest = Math.floor(t / BUBBLE_EVERY)
  for (let k = Math.max(0, newest - 1); k <= newest; k += 1) {
    const age = t - k * BUBBLE_EVERY
    // Hashed twice, since one hash of numbers in a row gives numbers in a pattern
    const h = hash(hash(k) >>> 16)
    const bit = CODE_BITS[(h >>> 16) % CODE_BITS.length]
    const color = CODE_COLORS[(h >>> 24) % CODE_COLORS.length]
    // The cell column it surfaces at, and the one it drifts to on the top row
    const col = 8 + ((h >>> 20) % 2)
    const drifted = col + ((h >>> 28) & 1 ? 1 : -1)
    // The text rows above the head: the one just over it, then the one above that
    const row = (top >> 1) - 1
    if (age === 0) rect(grid, col * 2, top - 1, 2, 1, color)
    else if (age < BUBBLE_EVERY) write(grid, col, row, bit, color)
    else if (age < BUBBLE_EVERY * 2 - 1) write(grid, drifted, row - 1, bit, color)
    else write(grid, drifted + (bit.length >> 1), row - 1, '*', GREY)
  }
}

// The mascot typing on a little laptop seen from the side, as in Claude Code's own art: the
// keyboard lies flat in front of it and the screen leans back, facing the mascot. A key
// lights up with each tap, and code bubbles up from its head.
function drawTyping(grid, t, phones = false) {
  const tap = (t & 1) === 1
  // The keyboard along the floor, then the screen leaning back from its hinge at the far end
  rect(grid, 4, SH - 1, 10, 1, LAPTOP)
  for (let i = 1; i <= 3; i += 1) px(grid, 4 - i, SH - 1 - i, LAPTOP)
  // One of the keys left of the hand lights up as it's tapped
  if (tap) rect(grid, 4 + ((hash(hash(t) >>> 16) >>> 16) % 3) * 2, SH - 1, 2, 1, WHITE)
  // Its eyes and the tapping hand land on even columns, so no terminal cell has to show
  // them beside an empty pixel, which would drop their color
  drawClawdSide(grid, { ox: 11, top: TOP, tap, blink: t % 16 >= 15 })
  if (phones) drawHeadphonesSide(grid, 11, TOP)
  drawBubbles(grid, t, TOP)
}

// Headphones on the front-facing mascot drawn at ox with its head on row top: a band over
// its head and an ear cup on each side, above its arms
function drawHeadphones(grid, ox, top) {
  rect(grid, ox + 1, top - 1, 15, 1, HEADBAND)
  rect(grid, ox, top, 2, 2, EARCUP)
  rect(grid, ox + 15, top, 2, 2, EARCUP)
}

// Headphones on the mascot seen from the side: the band over the back of its head and the
// near ear cup behind its far eye
function drawHeadphonesSide(grid, ox, top) {
  rect(grid, ox + 7, top - 1, 6, 1, HEADBAND)
  rect(grid, ox + 11, top, 2, 2, EARCUP)
}

// One music note, its top left pixel at x and y
function drawNote(grid, shape, x, y, color) {
  shape.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx += 1) if (row[dx] === '#') px(grid, x + dx, y + dy, color)
  })
}

// The mascot dancing in music mode, at step t. dance says how loud the music is (level, 0 to
// 9), how many beats have landed, the step the last one landed on, and the notes in the air,
// each { born, side, shape, color }. On a beat it hops a pixel and steps its feet, and it
// blinks once every few seconds. Notes rise from its ear cups and drift out.
function danceFrame(t, dance) {
  const grid = blank(SW + EQ_W * 2, SH)
  const ox = EQ_W + 4
  drawEqualizer(grid, t, dance)
  const top = TOP - (t === dance.beatAt ? 1 : 0)
  drawClawd(grid, { ox, top, blink: t % 30 === 29, legStep: dance.beats > 0 ? 1 + (dance.beats & 1) : 0 })
  drawHeadphones(grid, ox, top)
  for (const note of dance.notes) {
    const age = t - note.born
    const x = note.side < 0 ? ox - 3 - (age >> 1) : ox + 17 + (age >> 1)
    drawNote(grid, NOTES[note.shape], x, TOP - 3 - age, note.color)
  }
  return grid
}

// The equalizer bars at both sides of the dancing mascot. Each bar stands as tall as the
// music is loud, give or take a pixel of its own each frame, and every bar jumps a pixel on a
// beat. In silence they lie flat, a pixel tall.
function drawEqualizer(grid, t, dance) {
  const width = grid[0].length
  const loud = (dance.level / 9) * (EQ_MAX - 1)
  const jump = t === dance.beatAt ? 1 : 0
  for (let i = 0; i < EQ_BARS * 2; i += 1) {
    const x = i < EQ_BARS ? i * 2 : width - 1 - (i - EQ_BARS) * 2
    const wobble = dance.level > 0 ? ((hash(hash(t * 16 + i) >>> 16) >>> 16) % 3) - 1 : 0
    const height = Math.max(1, Math.min(EQ_MAX, Math.round(1 + loud + wobble + jump)))
    rect(grid, x, SH - height, 1, height, EQ_COLOR)
  }
}

// The working mascot's pixel grid for a pose at animation step t, in headphones while music
// mode is on
function workFrame(pose, t, phones = false) {
  const grid = blank(SW, SH)
  const ox = 2
  if (pose === 'read') {
    drawClawd(grid, { ox, top: TOP, eyeShift: [-1, 0, 1, 0][(t >> 1) & 3] })
    if (phones) drawHeadphones(grid, ox, TOP)
    // A page held up at the right, with two lines of text
    rect(grid, 20, TOP - 1, 4, 4, WHITE)
    rect(grid, 21, TOP, 2, 1, GREY)
    rect(grid, 21, TOP + 2, 2, 1, GREY)
  } else if (pose === 'edit') {
    drawTyping(grid, t, phones)
  } else if (pose === 'bash') {
    const top = TOP - (t & 1)
    drawClawd(grid, { ox, top, legStep: 1 + (t & 1) })
    if (phones) drawHeadphones(grid, ox, top)
    // Speed lines trailing behind
    px(grid, 0, top + (t & 1 ? 1 : 3), GREY)
    px(grid, 1, top + (t & 1 ? 3 : 1), GREY)
  } else if (pose === 'search') {
    const look = (t >> 2) & 1
    drawClawd(grid, { ox, top: TOP, eyeShift: look ? 1 : -1 })
    if (phones) drawHeadphones(grid, ox, TOP)
    // A magnifying glass at the right, bobbing as it searches: a ring and a handle
    const y = TOP - 1 + look
    rect(grid, 21, y, 3, 1, BLUE)
    px(grid, 20, y + 1, BLUE)
    px(grid, 24, y + 1, BLUE)
    rect(grid, 21, y + 2, 3, 1, BLUE)
    px(grid, 25, y + 3, GREY)
  } else {
    // Thinking: a gentle bob, a blink now and then, a glance to each side, and thought dots
    const top = TOP - ((t >> 2) & 1)
    drawClawd(grid, {
      ox,
      top,
      blink: t % 20 >= 18,
      eyeShift: [0, 0, 0, 0, 0, 0, -1, -1, 0, 0, 0, 1, 1, 0][(t >> 1) % 14],
    })
    if (phones) drawHeadphones(grid, ox, top)
    const dots = [[20, TOP + 3], [22, TOP + 2], [24, TOP + 1]].slice(0, (t >> 2) % 4)
    for (const [x, y] of dots) px(grid, x, y, GREY)
  }
  return grid
}

// What the waiting mascot is doing at step t: mostly looking ahead, now and then blinking or
// glancing to each side, over a nine-second loop
function idleLook(t) {
  const beat = t % 60
  if (beat === 29 || beat === 59) return 'blink'
  if (beat >= 40 && beat < 46) return 'left'
  if (beat >= 46 && beat < 52) return 'right'
  return 'ahead'
}

// What the mascot does when you click it, a frame each: hops with its arms up, winks its right
// eye, glances to each side, then rolls its eyes all around, as [hop, eyeShift, eyeDrop, wink].
// The eyes never look up: on the head's top row they'd share a terminal cell with the empty
// pixels above it, which would drop the orange beside them.
const POKE = [
  [1, 0, 0, false], [2, 0, 0, false], [2, 0, 0, false], [1, 0, 0, false], [0, 0, 0, false],
  [0, 0, 0, true], [0, 0, 0, true], [0, 0, 0, false],
  [0, -1, 0, false], [0, -1, 0, false], [0, 1, 0, false], [0, 1, 0, false],
  [0, -1, 0, false], [0, -1, 0, false], [0, 1, 0, false], [0, 1, 0, false],
  [0, -1, 1, false], [0, 0, 1, false], [0, 1, 1, false], [0, 1, 0, false], [0, 0, 0, false],
  [0, -1, 0, false], [0, -1, 1, false], [0, 0, 1, false], [0, 1, 1, false], [0, 0, 0, false],
]

// The mascot reacting to a click, at frame i of POKE. In music mode, given the music as
// danceFrame takes it, it keeps its headphones on, its place on the dancing canvas, and the
// equalizer beside it.
function pokeFrame(i, phones = false, dance = null) {
  const [hop, eyeShift, eyeDrop, wink] = POKE[i]
  const height = phones ? SH : IDLE_H
  const ox = phones ? EQ_W + 4 : 2
  const top = height - 5 - hop
  const arm = hop === 2 ? 'up' : 'down'
  const grid = blank(phones ? SW + EQ_W * 2 : SW, height)
  if (phones && dance) drawEqualizer(grid, i, dance)
  drawClawd(grid, { ox, top, eyeShift, eyeDrop, wink, armL: arm, armR: arm })
  if (phones) drawHeadphones(grid, ox, top)
  return grid
}

// The waiting mascot's pixel grid, standing where it stands in the working poses
function idleFrame(look) {
  const grid = blank(SW, IDLE_H)
  const eyeShift = look === 'left' ? -1 : look === 'right' ? 1 : 0
  drawClawd(grid, { ox: 2, top: IDLE_H - 5, blink: look === 'blink', eyeShift })
  return grid
}

// Clawd jumping with its arms waving in the air, centred on the celebration's canvas.
// Returns the head's row, so a hat can sit on it.
function drawCheering(grid, t) {
  const jump = [0, 1, 2, 1][(t >> 1) & 3]
  const top = 5 - jump
  const wave = (t >> 1) & 1
  drawClawd(grid, {
    ox: 11,
    top,
    armL: wave ? 'up' : 'down',
    armR: wave ? 'down' : 'up',
    // Squeezed-shut happy eyes at the top of each jump
    blink: jump === 2,
  })
  return top
}

// Party: a hat, two balloons and confetti falling past
function partyFrame(t) {
  const grid = blank(CW, CH)
  // Confetti falls at one or two pixels a frame, and wraps back to the top
  for (let i = 0; i < 14; i += 1) {
    const h = hash(i * 7)
    const speed = 1 + (h % 2)
    const y = (((h >>> 8) % CH) + t * speed) % CH
    px(grid, h % CW, y, PARTY_COLORS[(h >>> 4) % PARTY_COLORS.length])
  }
  // Oval balloons at the sides, bobbing a pixel, each on a string
  for (const [x, color] of [[2, PINK], [34, BLUE]]) {
    const y = ((t >> 2) + x) & 1
    rect(grid, x + 1, y, 2, 1, color)
    rect(grid, x, y + 1, 4, 2, color)
    rect(grid, x + 1, y + 3, 2, 1, color)
    px(grid, x + 2, y + 4, GREY)
    px(grid, x + 1, y + 5, GREY)
  }
  const top = drawCheering(grid, t)
  // The party hat on the head's centre: a yellow pompom over a striped cone
  px(grid, 19, top - 3, YELLOW)
  rect(grid, 18, top - 2, 3, 1, PINK)
  rect(grid, 17, top - 1, 5, 1, BLUE)
  return grid
}

// Fireworks: a new burst every five frames, each ring of sparks growing and fading
function fireworksFrame(t) {
  const grid = blank(CW, CH)
  const centers = [[6, 2], [33, 2], [19, 1], [27, 3], [12, 3]]
  // Pixels are twice as tall as they're wide, so sparks travel twice as far sideways
  const spokes = [[2, 0], [-2, 0], [0, 1], [0, -1], [1.4, 0.7], [-1.4, 0.7], [1.4, -0.7], [-1.4, -0.7]]
  const latest = Math.floor(t / 5)
  for (let b = Math.max(0, latest - 2); b <= latest; b += 1) {
    const age = t - b * 5
    const [cx, cy] = centers[b % centers.length]
    const color = PARTY_COLORS[b % PARTY_COLORS.length]
    for (const [dx, dy] of spokes) {
      // Each spark trails a second one of its color, and both grey out as the burst fades
      const fading = age >= 7
      px(grid, cx + Math.round(dx * age), cy + Math.round(dy * age), fading ? GREY : color)
      if (age > 1) {
        const back = age - 1
        px(grid, cx + Math.round(dx * back), cy + Math.round(dy * back), fading ? GREY : color)
      }
    }
    // The flash at the moment of the burst
    if (age < 2) rect(grid, cx - 1, cy, 3, 1, WHITE)
  }
  // Twinkling stars in the bottom corners
  const twinkle = t % 4 < 2
  px(grid, twinkle ? 1 : 3, twinkle ? 8 : 9, YELLOW)
  px(grid, twinkle ? 38 : 36, twinkle ? 7 : 8, YELLOW)
  drawCheering(grid, t)
  return grid
}

function colorOf(c) {
  return 'rgb(' + (c >> 16) + ',' + ((c >> 8) & 255) + ',' + (c & 255) + ')'
}

// The quadrant block for each set of filled quarters: bit 1 is the upper left, 2 the upper
// right, 4 the lower left and 8 the lower right
const QUADS = ' ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█'

// Draw a pixel grid as plain text, one Box row for each terminal row. Each cell shows its
// four pixels as a quadrant block in the cell's most common color, over a background of the
// second most common. A cell with an empty pixel gets no background, so empty pixels stay
// empty. A cell with text written in it shows that character instead. Runs of cells with
// the same colors share one Text. Every row has a fixed width, so the layout beside it can't
// squeeze the drawing.
function gridRows(Box, Text, grid) {
  return runRows(Box, Text, gridRuns(grid))
}

// A pixel grid as plain data: its width in cells, and each terminal row's runs of cells as
// { text, color, backgroundColor }, the colors as 'rgb(...)' strings, or null where the cells
// are empty. What the Client that shows the mascot draws from.
function gridRuns(grid) {
  const columns = grid[0].length / 2
  // The written characters by cell, as [character, color]
  const written = new Map()
  for (const [col, row, text, color] of grid.words || []) {
    ;[...text].forEach((ch, i) => {
      if (col + i >= 0 && col + i < columns) written.set(row * columns + col + i, [ch, color])
    })
  }
  const rows = []
  for (let y = 0; y < grid.length; y += 2) {
    const runs = []
    for (let x = 0; x < grid[0].length; x += 2) {
      const quad = [grid[y][x], grid[y][x + 1], grid[y + 1][x], grid[y + 1][x + 1]]
      const counts = new Map()
      for (const c of quad) if (c !== null) counts.set(c, (counts.get(c) || 0) + 1)
      const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c)
      let fg = ranked.length > 0 ? ranked[0] : null
      let bg = ranked.length > 1 && !quad.includes(null) ? ranked[1] : null
      let mask = 0
      quad.forEach((c, i) => {
        if (c !== null && c === fg) mask |= 1 << i
      })
      let char = QUADS[mask]
      const word = written.get((y / 2) * columns + x / 2)
      if (word) [char, fg, bg] = [word[0], word[1], null]
      const color = fg === null ? null : colorOf(fg)
      const backgroundColor = bg === null ? null : colorOf(bg)
      const last = runs[runs.length - 1]
      if (last && last.color === color && last.backgroundColor === backgroundColor) last.text += char
      else runs.push({ text: char, color, backgroundColor })
    }
    rows.push(runs)
  }
  return { columns, rows }
}

// gridRuns' data drawn as elements. hooks/clawd-view.js draws it the same way.
function runRows(Box, Text, { columns, rows }) {
  return Box({
    flexDirection: 'column',
    width: columns,
    flexShrink: 0,
    children: rows.map((runs) =>
      Box({
        flexDirection: 'row',
        width: columns,
        flexShrink: 0,
        children: runs.map(({ text, color, backgroundColor }) => {
          if (color === null) return Box({ width: text.length, height: 1, flexShrink: 0 })
          return Text(backgroundColor === null ? { children: [text], color } : { children: [text], color, backgroundColor })
        }),
      }),
    ),
  })
}

// --- Mod ---------------------------------------------------------------------

// Animation step, the current pose, and when that pose expires
let step = 0
let pose = 'think'
let poseUntil = 0
// The file the current Read, Edit or Write is working on, shown beside the caption
let target = ''
// While a turn runs the mascot redraws every frame; while waiting, only when its look changes
let isWorking = false
let idle = 'ahead'
let turnStartedAt = 0
// The celebration on screen, or null: which one, what it says, and how far it has played
let celebration = null
let celebrationStep = 0
// Hidden with /clawd hidden, which lasts across sessions
let hidden = false
// While the mascot reacts to a click, the frame of POKE it's on; else -1. A reply from a chat
// plays only the hop, up to frame pokeLast.
let poke = -1
let pokeLast = POKE.length - 1
// While music mode is on, the program listening to the music, as { ears }; else null
let music = null
// What the music is doing, for danceFrame: how loud, how many beats so far, the step the last
// one landed on, and the notes in the air
const dance = { level: 0, beats: 0, beatAt: -1, notes: [] }

// The listening program, built from its Swift source the first time music mode starts and
// again after the source or its Info.plist changes. The Info.plist is linked into it, so macOS
// can ask for the system audio permission in its name. Throws when it can't be built, as on a
// Mac without Xcode's command line tools or any other system.
async function earsProgram($) {
  const dir = $.plugin.root + '/native'
  const source = dir + '/clawd-ears.swift'
  const plist = dir + '/Info.plist'
  const program = dir + '/build/clawd-ears'
  const newer = async (than) => (await $.process.run(['/bin/test', program, '-nt', than])).exitCode === 0
  if ((await newer(source)) && (await newer(plist))) return program
  $.ui.toast(WORDS_NOW.building)
  await $.process.run(['/bin/mkdir', '-p', dir + '/build'])
  const link = ['-Xlinker', '-sectcreate', '-Xlinker', '__TEXT', '-Xlinker', '__info_plist', '-Xlinker', plist]
  const built = await $.process.run(['/usr/bin/xcrun', 'swiftc', '-O', '-o', program, source, ...link], {
    timeoutMs: 300000,
  })
  if (built.exitCode !== 0) {
    throw new Error((built.stderr || built.stdout).trim().split('\n').slice(-2).join(' ') || 'swiftc failed')
  }
  return program
}

// One line from the listening program: the music's level, and whether a beat just landed
function hear($, line) {
  const [level, beat] = line.split(' ').map(Number)
  if (!Number.isFinite(level)) return
  dance.level = level
  if (beat === 1) {
    dance.beats += 1
    dance.beatAt = step
    addNote()
    // Hop on the beat now, not at the next frame
    if (!isWorking && !celebration) $.ui.invalidate('ui.render')
  }
}

// A note rises from one ear cup, the other one than last time
function addNote() {
  const n = dance.beats + dance.notes.length
  dance.notes.push({
    born: step,
    side: n & 1 ? 1 : -1,
    shape: (hash(n) >>> 16) % NOTES.length,
    color: PARTY_COLORS[(hash(n) >>> 20) % 4],
  })
  if (dance.notes.length > 4) dance.notes.shift()
}

// Start the listening program and dance to what it hears. Resolves once it's listening, or
// throws why it couldn't.
async function startMusic($) {
  const ears = $.process.spawn({ argv: [await earsProgram($)] })
  const session = { ears }
  music = session
  let settle
  const started = new Promise((resolve) => (settle = resolve))
  void (async () => {
    let pending = ''
    try {
      for await (const piece of ears) {
        // Turned off: leaving the loop ends the program
        if (music !== session) break
        if (piece.stream !== 'stdout') continue
        pending += piece.text
        for (let end = pending.indexOf('\n'); end >= 0; end = pending.indexOf('\n')) {
          const line = pending.slice(0, end)
          pending = pending.slice(end + 1)
          if (line === 'ok') settle('')
          else if (line.startsWith('error ')) settle(line.slice(6))
          else hear($, line)
        }
      }
      settle('exited')
    } catch (err) {
      settle(String((err && err.message) || err))
    }
    // The program ended by itself: music mode is over
    if (music === session) {
      stopMusic()
      $.ui.toast(WORDS_NOW.musicStopped + 'clawd-ears exited')
      $.ui.invalidate('ui.render')
    }
  })()
  const problem = await started
  if (problem) {
    stopMusic()
    throw new Error(problem)
  }
}

// Turn music mode off: the loop reading the program ends at its next line, which ends it
function stopMusic() {
  if (!music) return
  const { ears } = music
  music = null
  Object.assign(dance, { level: 0, beats: 0, beatAt: -1, notes: [] })
  if (typeof ears.return === 'function') ears.return().catch(() => {})
}

// The words in use, for the helpers above that run outside a hook
let WORDS_NOW = WORDS.zh

// The chat with Clawd, for this session only: its messages, each { role, text } with role
// 'user', 'clawd' or 'note'; whether a reply is on its way, and whether more was said
// meanwhile; the speech bubble beside the mascot, { text, until }; and the model replies
// come from
const chat = { history: [], pending: false, again: false, bubble: null, model: 'haiku' }

// Who Clawd is, for the model that speaks for it
function persona() {
  return [
    "You are Clawd, the little pixel mascot of Claude Code. You live just above the user's prompt in their terminal, watching them and Claude work, and you dance when they play music.",
    "You are their buddy, not their coding agent: you can't run tools, read files or change anything. When they want work done, cheer them on and suggest they ask Claude in the main prompt.",
    'Keep replies short, one to three sentences, unless they ask for more. Be warm, playful and honest, and never make up what Claude did.',
    'Speak only your words: no actions or stage directions in asterisks or brackets.',
    WORDS_NOW.chatLanguage,
  ].join('\n')
}

// What's going on, for a model that can't see the session itself: whether Claude is working,
// and the latest few messages of the user's conversation with Claude, each cut short, its tool
// calls reduced to the tool and the file's name
async function sceneDigest($) {
  let messages = []
  try {
    messages = await $.session.messages()
  } catch {}
  const lines = []
  for (const m of messages.slice(-SCENE_MESSAGES)) {
    const tools = (m.toolUses || []).map((use) => {
      const file = use.input && (use.input.file_path || use.input.notebook_path || use.input.path)
      return file ? use.tool + ' ' + String(file).split('/').pop() : use.tool
    })
    const text = String(m.text || '').replace(/\s+/g, ' ').trim().slice(0, 400)
    if (!text && tools.length === 0) continue
    lines.push((m.role === 'user' ? 'User: ' : 'Claude: ') + text + (tools.length ? ' [tools: ' + tools.join(', ') + ']' : ''))
  }
  const now = isWorking
    ? 'Claude is working right now (' + pose + (target ? ', on ' + target : '') + ').'
    : 'Claude is waiting for the user.'
  return (now + "\nThe latest of the user's conversation with Claude:\n" + (lines.join('\n') || '(nothing yet)')).slice(-6000)
}

// One reply from Clawd to the chat so far, as a chat message: from a fork of the session's
// own conversation in `main` mode, else from the configured model told what's going on. A
// failure comes back as a note saying why.
async function clawdReply($) {
  const said = chat.history
    .filter((m) => m.role !== 'note')
    .slice(-CHAT_READS)
    .map((m) => (m.role === 'user' ? 'User: ' : 'Clawd: ') + m.text)
    .join('\n\n')
  const why = (r) => WORDS_NOW.chatFailed + String(r.reason === 'api-error' ? r.error || r.status || r.reason : r.reason)
  try {
    if (chat.model === 'main') {
      const r = await $.model.fork({
        prompt:
          persona() +
          '\n\nThis is a side chat with Clawd, the mascot, about what is going on; it is not a request to act. Answer only as Clawd would.\n\nThe chat so far:\n' +
          said +
          '\n\nClawd:',
      })
      if (r.isAnswered) return { role: 'clawd', text: r.text.trim() }
      if (r.reason !== 'nothing-to-fork') return { role: 'note', text: why(r) }
      chat.history.push({ role: 'note', text: WORDS_NOW.chatFallback })
    }
    const r = await $.model.complete({
      model: chat.model === 'main' ? 'haiku' : chat.model,
      system: persona() + '\n\n' + (await sceneDigest($)),
      prompt: 'The chat so far:\n' + said + "\n\nReply as Clawd to the user's last message.",
      maxTokens: 800,
      timeoutMs: 60000,
    })
    return r.isAnswered ? { role: 'clawd', text: r.text.trim() } : { role: 'note', text: why(r) }
  } catch (err) {
    return { role: 'note', text: WORDS_NOW.chatFailed + String((err && err.message) || err) }
  }
}

// The user said something to Clawd: keep it, and get a reply. One reply at a time; whatever
// is said while one is on its way is answered together once it arrives.
async function say($, text) {
  chat.history.push({ role: 'user', text })
  chat.bubble = null
  if (chat.pending) {
    chat.again = true
    return chatChanged($)
  }
  chat.pending = true
  chatChanged($)
  do {
    chat.again = false
    const reply = await clawdReply($)
    chat.history.push(reply)
    if (reply.role === 'clawd') {
      const ms = isWorking
        ? BUBBLE_WORKING_MS
        : Math.min(BUBBLE_MAX_MS, Math.max(BUBBLE_MIN_MS, reply.text.length * 120))
      chat.bubble = { text: reply.text, until: (await $.clock.now()) + ms }
      // A hop as the reply lands, unless the mascot is busy
      if (!isWorking && !celebration) {
        poke = 0
        pokeLast = 4
      }
    }
  } while (chat.again)
  chat.pending = false
  chatChanged($)
}

// Redraw after the chat changed, trimmed to its last CHAT_KEEP messages, and once the pane has
// drawn the change, scroll it to the bottom
function chatChanged($) {
  if (chat.history.length > CHAT_KEEP) chat.history.splice(0, chat.history.length - CHAT_KEEP)
  $.ui.invalidate('ui.render')
  $.clock
    .sleep(100)
    .then(() => $.ui.scroll({ to: { key: 'clawd-chat-input' }, in: CHAT_PANE, block: 'end' }))
    .catch(() => {})
}

// How many terminal columns a character takes: two for wide East Asian characters and emoji
function cellsOf(ch) {
  return /[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]|[\u{1f300}-\u{1faff}]/u.test(ch) ? 2 : 1
}

// A reply fitted into the speech bubble: Markdown marks dropped, wrapped to width columns,
// at most lines lines, the last ending in … when it doesn't all fit
function bubbleLines(text, width, lines) {
  const flat = text.replace(/[*_`#>]+/g, '').replace(/\s+/g, ' ').trim()
  const out = ['']
  let used = 0
  for (const ch of flat) {
    const w = cellsOf(ch)
    if (used + w > width) {
      if (out.length === lines) {
        out[lines - 1] = out[lines - 1].replace(/.$/u, '…')
        return out
      }
      out.push('')
      used = 0
      if (ch === ' ') continue
    }
    out[out.length - 1] += ch
    used += w
  }
  return out
}

// What /clawd takes next, once a subcommand that takes more is typed: drawn dim at the end of
// the hint line under the prompt, since the typeahead's own hint shows only the subcommands,
// and only until anything is typed after /clawd
let subHint = ''
function subHintFor(draft) {
  if (/^\/clawd\s+music\s/.test(draft)) return '/clawd music: start | stop'
  if (/^\/clawd\s+chat\s/.test(draft)) return '/clawd chat: ' + WORDS_NOW.chatHint
  return ''
}

export function register(on, options) {
  // The language the mascot speaks: the one the `language` option picks, or with `auto`, the
  // one the locale names, as any program reads it. Chinese locales get Chinese, others English.
  let words = WORDS.zh
  on('session.start', async ($, e, next) => {
    const language = options && options.language
    if (language === 'zh' || language === 'en') {
      words = WORDS[language]
    } else {
      const locale =
        (await $.env.get('LC_ALL')) || (await $.env.get('LC_MESSAGES')) || (await $.env.get('LANG')) || ''
      words = locale.toLowerCase().startsWith('zh') ? WORDS.zh : WORDS.en
    }
    WORDS_NOW = words
    chat.model = CHAT_MODELS.includes(options && options.chatModel) ? options.chatModel : 'haiku'
    hidden = (await $.store.get('hidden')) === true
    await $.command.register({
      name: 'clawd',
      description: words.command,
      argumentHint: 'show | hidden | music | chat',
      immediate: true,
    })
    $.clock.every(FRAME_MS, async () => {
      if (hidden) return
      // The speech bubble goes once it has been read
      if (chat.bubble && (await $.clock.now()) > chat.bubble.until) {
        chat.bubble = null
        $.ui.invalidate('ui.render')
      }
      // Notes float up and away, and loud music with no beat found still gives off a note now
      // and then
      if (music) {
        dance.notes = dance.notes.filter((note) => step + 1 - note.born < NOTE_LIFE)
        const last = dance.notes.length > 0 ? dance.notes[dance.notes.length - 1].born : -99
        if (dance.level >= 3 && step + 1 - last >= 6) addNote()
      }
      if (isWorking) {
        step += 1
        // After a while with no new tool call, the mascot goes back to thinking
        if (pose !== 'think' && (await $.clock.now()) > poseUntil) {
          pose = 'think'
          target = ''
        }
        $.ui.invalidate('ui.render')
      } else if (celebration) {
        celebrationStep += 1
        // The last redraw after the party ends clears the band
        if (celebrationStep >= CELEBRATE_FRAMES) celebration = null
        $.ui.invalidate('ui.render')
      } else if (poke >= 0) {
        poke = poke < pokeLast ? poke + 1 : -1
        step += 1
        $.ui.invalidate('ui.render')
      } else if (chat.pending || (music && (dance.level > 0 || dance.notes.length > 0))) {
        step += 1
        $.ui.invalidate('ui.render')
      } else {
        step += 1
        if (idleLook(step) !== idle) {
          idle = idleLook(step)
          $.ui.invalidate('ui.render')
        }
      }
    })
    return next(e)
  })

  // A click on the mascot, from hooks/clawd-view.js: it hops and looks around, unless it's
  // busy working or partying
  on('ui.message', async ($, e, next) => {
    if (e.element !== 'clawd') return next(e)
    if (e.data && e.data.poke && !isWorking && !celebration) {
      poke = 0
      pokeLast = POKE.length - 1
      $.ui.invalidate('ui.render')
    }
    return {}
  })

  on('turn.start', async ($, e, next) => {
    isWorking = true
    poke = -1
    // Back to work: a word from the chat makes way for what Claude is doing
    chat.bubble = null
    pose = 'think'
    target = ''
    turnStartedAt = await $.clock.now()
    // A new turn ends any party still going
    if (celebration) {
      celebration = null
      $.ui.invalidate('ui.render')
    }
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    isWorking = false
    if ((await $.clock.now()) - turnStartedAt >= MIN_TURN_MS) {
      celebration = {
        kind: Math.random() < 0.5 ? 'party' : 'fireworks',
        cheer: words.cheers[Math.floor(Math.random() * words.cheers.length)],
      }
      celebrationStep = 0
    }
    $.ui.invalidate('ui.render')
    return next(e)
  })

  on('turn.abort', async ($, e, next) => {
    isWorking = false
    $.ui.invalidate('ui.render')
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    pose = poseOf(String(e.tool || ''))
    poseUntil = (await $.clock.now()) + POSE_MS
    // Show only the file's name, cut short, and never anything else from the tool's input
    const file = pose === 'edit' || pose === 'read' ? String(e.file_path || e.notebook_path || '') : ''
    target = file ? file.split('/').pop().slice(0, 24) : ''
    return next(e)
  })

  // As /clawd music or /clawd chat is typed, what comes next shows under the prompt
  on('prompt.edit', async ($, e, next) => {
    const result = await next(e)
    const wanted = subHintFor(e.text.slice(0, e.start) + e.inputText + e.text.slice(e.end))
    if (wanted !== subHint) {
      subHint = wanted
      $.ui.invalidate('ui.render')
    }
    return result
  })
  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    if (!subHint) return next(e)
    return next({ ...e, props: { ...e.props, tail: subHint } })
  })

  // /clawd show | hidden | music [start | stop] | chat [message | close | clear]. The old
  // startmusic and stopmusic still work, for anyone used to them.
  on('command.run', { command: 'clawd' }, async ($, e) => {
    const arg = String(e.args || '').trim().toLowerCase().replace(/\s+/g, ' ')
    const musicOn = arg === 'music start' || arg === 'music on' || arg === 'startmusic'
    const musicOff = arg === 'music stop' || arg === 'music off' || arg === 'stopmusic'
    let text = words.usage
    if (arg === 'chat' || arg.startsWith('chat ')) {
      // What's said goes to the chat pane and the bubble, never into Claude's conversation: the
      // command answers with no text and no context
      const message = String(e.args).trim().slice(4).trim()
      if (message.toLowerCase() === 'close') {
        await $.ui.close({ id: CHAT_PANE }).catch(() => {})
        return {}
      }
      if (message.toLowerCase() === 'clear') {
        Object.assign(chat, { history: [], bubble: null })
        $.ui.invalidate('ui.render')
        return { text: words.chatCleared }
      }
      // With nothing to say yet, the pane takes the keyboard so the user can type in it
      await $.ui.open({ id: CHAT_PANE, title: 'Clawd', ...(message ? {} : { focus: true }) })
      if (message) void say($, message)
      return {}
    }
    if (arg === 'show') {
      hidden = false
      await $.store.set('hidden', false)
      text = words.shown
    } else if (arg === 'hidden' || arg === 'hide') {
      text = music ? words.hiddenMusic : words.hidden
      stopMusic()
      hidden = true
      await $.store.set('hidden', true)
    } else if (musicOn) {
      if (hidden) text = words.musicHidden
      else if (music) text = words.musicAlready
      else {
        try {
          await startMusic($)
          text = words.musicOn
        } catch (err) {
          text = words.musicFailed + String((err && err.message) || err)
        }
      }
    } else if (musicOff) {
      text = music ? words.musicOff : words.musicNotOn
      stopMusic()
    }
    $.ui.invalidate('ui.render')
    return { text }
  })

  // The chat with Clawd, in its own pane: every message so far, then a box to say more
  on('ui.render', { component: 'Pane' }, async ($, e, next) => {
    if (e.requestId !== CHAT_PANE) return next(e)
    const { Box, Text, Input } = $.ui.resolve(e)
    const rows = []
    if (chat.history.length === 0 && !chat.pending) rows.push(Text({ children: [words.chatHello], color: 'inactive' }))
    chat.history.forEach((m, i) => {
      if (m.role === 'note') {
        rows.push(Text({ children: [m.text], color: 'inactive' }))
        return
      }
      const isUser = m.role === 'user'
      rows.push(
        Box({
          flexDirection: 'column',
          children: [
            Text({ children: [isUser ? words.chatYou : 'Clawd'], bold: true, color: isUser ? 'inactive' : 'claude' }),
            Text({ children: [m.text], color: 'text', wrap: 'wrap' }),
          ],
        }),
      )
    })
    if (chat.pending) rows.push(Text({ children: [words.chatThinking], color: 'claude' }))
    rows.push(
      Input({
        key: 'clawd-chat-input',
        placeholder: words.chatPlaceholder,
        value: '',
        submitLabel: words.chatSend,
        autoFocus: true,
        onSubmit: (value) => {
          const message = String(value || '').trim()
          if (message) void say($, message)
        },
      }),
    )
    return Box({ flexDirection: 'column', rowGap: 1, children: rows })
  })

  // The mascot at the right end of the band above the prompt, always there: acting out what
  // Claude is doing while it works, partying when a task is done, and waiting otherwise.
  // Claude Code's own spinner line stays as it is, for the elapsed time and interrupt hint.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // The block characters are drawn for the terminal, and a survey gets the band to itself
    if (hidden || e.surface !== 'terminal' || e.props.hasSurvey) return next(e)
    let grid
    let caption = ''
    if (isWorking) {
      grid = workFrame(pose, step, music !== null)
      caption = words.poses[pose] + '.'.repeat(1 + ((step >> 2) % 3)) + (target ? ' · ' + target : '')
    } else if (celebration) {
      grid = celebration.kind === 'party' ? partyFrame(celebrationStep) : fireworksFrame(celebrationStep)
      caption = celebration.cheer
    } else if (poke >= 0) {
      grid = pokeFrame(poke, music !== null, dance)
    } else if (chat.pending) {
      // Thinking up a reply to the chat, headphones still on in music mode: it dances only
      // when it has nothing else to do
      grid = workFrame('think', step, music !== null)
    } else if (music) {
      grid = danceFrame(step, dance)
    } else {
      grid = idleFrame(idle)
    }
    const rows = grid.length / 2
    // Leave the band alone in a window too short to hold the drawing
    if (typeof e.props.maxRows === 'number' && e.props.maxRows < rows) return next(e)
    const { Box, Text, Client } = $.ui.resolve(e)
    const children = []
    // While Clawd answers the chat, and for a while after, a speech bubble beside it says so, in
    // place of the caption; it's as tall as the drawing, so the band never grows for it. While
    // Claude works the mascot keeps working and keeps its caption, and only its reply shows,
    // briefly.
    const speech = chat.pending && !isWorking ? '.'.repeat(1 + (step % 3)) : chat.bubble ? chat.bubble.text : ''
    if (speech) {
      const room = typeof e.props.bodyColumns === 'number' ? e.props.bodyColumns - grid[0].length / 2 - 8 : BUBBLE_WIDTH
      const lines = bubbleLines(speech, Math.max(8, Math.min(BUBBLE_WIDTH, room) - 4), Math.max(1, rows - 2))
      children.push(
        Box({
          borderStyle: 'round',
          borderColor: 'gray',
          paddingX: 1,
          alignSelf: 'flex-end',
          flexShrink: 1,
          children: [Text({ children: [lines.join('\n')] })],
        }),
      )
    } else if (caption) {
      // The caption sits right beside the mascot, on the middle row of its body
      children.push(
        Box({
          flexDirection: 'column',
          justifyContent: 'flex-end',
          height: rows,
          paddingBottom: 1,
          flexShrink: 1,
          children: [Text({ children: [caption], color: 'yellow', bold: true, wrap: 'truncate-start' })],
        }),
      )
    }
    const drawing = gridRuns(grid)
    children.push(
      Client({ key: 'clawd', module: './clawd-view.js', props: drawing, width: drawing.columns, height: rows }),
    )
    const ours = Box({
      flexDirection: 'row',
      justifyContent: 'flex-end',
      columnGap: 1,
      paddingRight: 2,
      ...(typeof e.props.bodyColumns === 'number' ? { width: e.props.bodyColumns } : {}),
      children,
    })
    // Keep what the mods after this one draw in the band
    const theirs = await next(e)
    return theirs ? Box({ flexDirection: 'column', children: [ours, theirs] }) : ours
  })
}
