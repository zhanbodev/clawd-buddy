// Appended to a copy of hooks/register.js by tools/preview.sh, so it can call workFrame,
// partyFrame, fireworksFrame, gridRows and QUADS directly. Writes a PNG to argv[2].
import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
const Box = (p) => ({ t: 'Box', ...p }), Text = (p) => ({ t: 'Text', ...p })
const QW = 6, QH = 12 // one quarter-cell, roughly a terminal's aspect
const BG = [0x1e, 0x20, 0x30]
const parse = (s) => (s ? s.match(/\d+/g).map(Number) : null)
// A 5 by 7 bitmap for each character the drawings write as text; anything else draws as a box
const FONT = {
  '{': '..##..#....#...#.....#....#.....##.', '}': '.##.....#....#.....#...#....#..##..',
  '<': '....#...#...#...#.....#.....#.....#', '>': '#.....#.....#.....#...#...#...#....',
  '/': '....#....#...#...#...#...#....#....', '(': '...#...#...#....#....#.....#.....#.',
  ')': '.#.....#.....#....#....#...#...#...', ';': '......##...##........##....#...#...',
  '=': '..........#####.....#####..........', '[': '.###..#....#....#....#....#....###.',
  ']': '.###....#....#....#....#....#..###.', '&': '.##..#..#.#.#...#...#.#.##..#..##.#',
  '#': '.#.#..#.#.#####.#.#.#####.#.#..#.#.', '!': '..#....#....#....#....#.........#..',
  '+': '.......#....#..#####..#....#.......', '*': '.......#..#.#.#.###.#.#.#..#.......',
}
const BOX = '#####' + '#...#'.repeat(5) + '#####'
// Turn a gridRows tree into a pixel image of what the terminal draws
function picture(tree) {
  const rows = tree.children.length, cols = tree.width
  const w = cols * 2 * QW, h = rows * 2 * QH
  const img = Array.from({ length: h }, () => Array.from({ length: w }, () => BG))
  tree.children.forEach((row, r) => {
    let col = 0
    for (const c of row.children) {
      if (c.t === 'Box') { col += c.width; continue }
      for (const ch of [...c.children[0]]) {
        const mask = QUADS.indexOf(ch)
        if (mask < 0) {
          // A written character: its bitmap, doubled, in the middle of the cell
          const bits = FONT[ch] || BOX, color = parse(c.color)
          for (let i = 0; i < 35; i++) {
            if (bits[i] !== '#') continue
            const x0 = col * 2 * QW + 1 + (i % 5) * 2, y0 = r * 2 * QH + 5 + Math.floor(i / 5) * 2
            for (let y = y0; y < y0 + 2; y++) for (let x = x0; x < x0 + 2; x++) img[y][x] = color
          }
          col += 1
          continue
        }
        for (let q = 0; q < 4; q++) {
          const color = (mask >> q) & 1 ? parse(c.color) : parse(c.backgroundColor)
          if (!color) continue
          const x0 = (col * 2 + (q & 1)) * QW, y0 = (r * 2 + (q >> 1)) * QH
          for (let y = y0; y < y0 + QH; y++) for (let x = x0; x < x0 + QW; x++) img[y][x] = color
        }
        col += 1
      }
    }
  })
  return img
}
// Lay several pictures out on a sheet, one row of frames per line
const lines = []
lines.push(['ahead', 'left', 'right', 'blink'].map((look) => picture(gridRows(Box, Text, idleFrame(look)))))
// A click: the hop, the wink, the glances and the eyes rolling around
lines.push([0, 1, 5, 8, 10, 16, 18, 22].map((i) => picture(gridRows(Box, Text, pokeFrame(i)))))
for (const p of ['think', 'read', 'bash', 'search']) lines.push([0, 2, 5, 9].map((t) => picture(gridRows(Box, Text, workFrame(p, t)))))
// Typing gets two rows of consecutive frames, to show the code bubbles rising and popping
for (const from of [8, 16]) lines.push([0, 1, 2, 3, 4, 5, 6, 7].map((i) => picture(gridRows(Box, Text, workFrame('edit', from + i)))))
// Music mode: headphones on each working pose, then eight frames of dancing to a beat every
// third frame, with notes rising from the ear cups
lines.push(['think', 'read', 'bash', 'search', 'edit'].map((p) => picture(gridRows(Box, Text, workFrame(p, 3, true)))))
lines.push([0, 1, 2, 3, 4, 5, 6, 7].map((t) => {
  const beats = Math.floor(t / 3) + 1
  const notes = []
  for (let b = 0; b < beats; b += 1) if (t - b * 3 < NOTE_LIFE) notes.push({ born: b * 3, side: b & 1 ? 1 : -1, shape: b % 2, color: PARTY_COLORS[b % 4] })
  return picture(gridRows(Box, Text, danceFrame(t, { level: t > 4 ? 8 : 5, beats, beatAt: t % 3 === 0 ? t : -1, notes })))
}))
lines.push([0, 2, 5].map((t) => picture(gridRows(Box, Text, partyFrame(t)))))
lines.push([3, 7, 12].map((t) => picture(gridRows(Box, Text, fireworksFrame(t)))))
const GAP = 24
const W = Math.max(...lines.map((l) => l.reduce((a, p) => a + p[0].length + GAP, GAP)))
const H = lines.reduce((a, l) => a + Math.max(...l.map((p) => p.length)) + GAP, GAP)
const sheet = Array.from({ length: H }, () => Array.from({ length: W }, () => [0x15, 0x16, 0x20]))
let y = GAP
for (const l of lines) {
  let x = GAP
  for (const p of l) { p.forEach((row, dy) => row.forEach((c, dx) => (sheet[y + dy][x + dx] = c))); x += p[0].length + GAP }
  y += Math.max(...l.map((p) => p.length)) + GAP
}
// Minimal PNG encoder
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]) }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2
const raw = Buffer.concat(sheet.map((row) => Buffer.from([0, ...row.flat()])))
writeFileSync(process.argv[2], Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]))
