// The surface module that shows the mascot in the band above the prompt. The hooks module works
// out every frame and hands it over as props: gridRuns' data, each terminal row's runs of cells
// as { text, color, backgroundColor }. Drawn here, in a Client's region, the mascot holds the
// pointer: a press on it can't start a text selection, so it never gets copied, and a left
// click tells the hooks module, which makes the mascot hop and look around.
export default function ClawdView(props, surface) {
  const { Box, Text } = surface.elements
  surface.onPointer((event) => {
    if (event.type === 'down' && event.button === 'left') surface.post({ poke: true })
  })
  const { columns, rows } = props
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
