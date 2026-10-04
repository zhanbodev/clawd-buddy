// The values clawd-buddy keeps in $.state: held by Claude Code for the session, so they
// survive the module reloading, as it does when a /config option changes. `chat` is the chat
// with Clawd so far.
declare module 'claude-code' {
  interface PluginState {
    'clawd-buddy': {
      chat: { history: { role: 'user' | 'clawd' | 'note'; text: string }[] }
    }
  }
}
