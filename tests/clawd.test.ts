import { expect, mock, test } from 'claude-code/testing'

// What Claude Code passes to the band's ui.render hook, apart from the app
const BAND = {
  plugin: 'clawd-buddy',
  surface: 'terminal',
  component: 'AbovePrompt',
  viewport: { columns: 100, rows: 30 },
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 15,
    bodyColumns: 100,
    scroll: { offset: 0, bodyRows: 15 },
    view: {},
  },
} as const

// One frame lasts 150 ms (FRAME_MS)
const FRAME = 150

// Start a session the way Claude Code does, with every call the mod makes answered
async function start($, on) {
  const clock = mock.clock(on)
  mock.env(on, { LANG: 'zh_CN.UTF-8' })
  mock.store(on, {})
  on('command.register', () => ({ value: undefined }))
  on('session.start', () => ({ cwd: '/work' }))
  // What Claude Code draws in the band when the mod draws nothing there
  on('ui.render', () => ({ type: 'Text', props: {}, children: ['nothing of ours'] }))
  on('command.run', () => ({ text: '' }))
  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  return clock
}

// The rows of quadrant characters the mascot's Client draws, top to bottom
async function picture(ui) {
  const rows = await ui.findAll({ type: 'Box', in: 'clawd' })
  const texts = []
  for (const row of rows.slice(1)) texts.push(JSON.stringify(row))
  return texts.join('\n')
}

test('a click makes the mascot hop, wink and look around, then settle', async ($, on) => {
  const clock = await start($, on)
  const ui = await $.ui.mount(BAND)
  const resting = await picture(ui)
  expect(resting).toContain('▄')

  await ui.pointer({ type: 'down', x: 3, y: 2, button: 'left', in: 'clawd' })
  const hopping = await picture(ui)
  expect(hopping).not.toBe(resting)

  // Partway through, still not at rest
  await clock.advance(FRAME * 5)
  expect(await picture(ui)).not.toBe(resting)

  // The whole reaction is 26 frames; one frame more and it's back as it was
  await clock.advance(FRAME * 22)
  expect(await picture(ui)).toBe(resting)
})

test('a right click does nothing', async ($, on) => {
  await start($, on)
  const ui = await $.ui.mount(BAND)
  const resting = await picture(ui)
  await ui.pointer({ type: 'down', x: 3, y: 2, button: 'right', in: 'clawd' })
  expect(await picture(ui)).toBe(resting)
})

test('/clawd hidden empties the band and show brings the mascot back', async ($, on) => {
  await start($, on)
  const ui = await $.ui.mount(BAND)
  expect(await ui.find({ type: 'Client' })).toBeDefined()

  const hidden = await $.command.run({ command: 'clawd', args: 'hidden' })
  expect(hidden.text).toContain('隐藏')
  await ui.redraw()
  expect(await ui.find({ type: 'Client' })).toBeUndefined()

  await $.command.run({ command: 'clawd', args: 'show' })
  await ui.redraw()
  expect(await ui.find({ type: 'Client' })).toBeDefined()
})

test('/clawd chat answers in the pane and keeps the chat out of the command output', async ($, on) => {
  await start($, on)
  on('session.messages', () => ({ value: [{ role: 'user', text: 'fix the tests', toolUses: [] }] }))
  on('model.complete', ($, e) => ({
    value: { isAnswered: true, text: 'Go get them!', usage: { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } },
  }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.scroll', () => ({ value: {} }))
  const answer = await $.command.run({ command: 'clawd', args: 'chat hello Clawd' })
  // Nothing of the chat goes into the transcript
  expect(answer.text).toBeUndefined()
  const pane = await $.ui.mount({
    plugin: 'clawd-buddy',
    surface: 'terminal',
    component: 'Pane',
    requestId: 'clawd-chat',
    viewport: { columns: 100, rows: 30 },
    props: { title: 'Clawd', isFocused: true, bodyColumns: 50, placement: 'dock', scroll: { offset: 0, bodyRows: 20 }, view: {} },
  })
  expect(await pane.find({ type: 'Markdown', text: 'hello Clawd' })).toBeDefined()
  expect(await pane.find({ key: 'clawd-chat-input' })).toBeDefined()
})
