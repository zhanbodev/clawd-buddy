<h1 align="center">Clawd Buddy</h1>

<p align="center"><b>English</b> | <a href="README.zh-CN.md">中文</a></p>

<p align="center">
  <img src="docs/images/poke.gif" width="480" alt="Clawd above the prompt, clicked: it hops with its arms up, winks and looks around">
</p>

<p align="center">
  Bring <b>Clawd</b>, Claude Code's pixel mascot, into your terminal.<br>
  It lives above the prompt, acts out whatever Claude is doing, bubbles code while it types, dances to your music, hops when you click it, and chats with you.
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="#commands">Commands</a> ·
  <a href="#talk-to-clawd">Talk to Clawd</a> ·
  <a href="#music-mode">Music mode</a> ·
  <a href="#settings">Settings</a> ·
  <a href="#development">Development</a>
</p>

---

## What it does

<table>
  <tr>
    <td width="50%">
      <img src="docs/images/typing.gif" alt="Clawd typing on a laptop, side on, with code bubbles rising from its head"><br>
      <b>Writing code</b><br>
      While Claude edits a file, Clawd sits side on at a little laptop, typing away, with bits of code like <code>{}</code> <code>&lt;/&gt;</code> <code>;</code> bubbling up from its head.
    </td>
    <td width="50%">
      <img src="docs/images/poses.gif" alt="Clawd thinking, reading a page, running, and searching with a magnifying glass"><br>
      <b>Thinking · Reading · Running · Searching</b><br>
      Its pose follows the tool Claude is using: thought dots while it thinks, a page held up while it reads, a run while a command runs, a magnifying glass while it searches.
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="docs/images/dance.gif" alt="Clawd in headphones bouncing to the beat, music notes rising from the ear cups"><br>
      <b>Music mode</b><br>
      Headphones on, it bounces to the beat of whatever your Mac is playing, with notes floating up from its ear cups.
    </td>
    <td width="50%">
      <img src="docs/images/celebrate.gif" alt="A party, then fireworks, when a task is done"><br>
      <b>Celebrations</b><br>
      When an answer took more than 5 seconds, it ends with a party or fireworks, picked at random.
    </td>
  </tr>
</table>

And a few small touches:

- **Always there**: while Claude waits for you, Clawd stands at the right end of the prompt, blinking and glancing around now and then.
- **Click it**: it hops with its arms up, winks its right eye, glances to each side, and rolls its eyes all around.
- **Not selectable**: dragging to select text never picks up Clawd, so it never ends up in what you copy.
- **Plain captions**: beside it reads something like "Editing… · register.js". Only the file's name is shown, never anything else from a tool's input.
- **English and Chinese**: follows your system language, or pick one yourself.
- **Free to watch**: everything but the chat calls no model and uses no network. Chatting calls a model with your own Claude account, only when you send a message.

## Install

You need:

- **Claude Code 2.1.287 or later**, the first version that supports mods.
- **The terminal**. The Desktop app keeps its own spinner and shows no Clawd.
- For **music mode** only: macOS 14.2 or later, and the Xcode command line tools (`xcode-select --install`).

### From the plugin marketplace

In Claude Code, add this repository as a marketplace, then install the plugin from it:

```
/plugin marketplace add zhanbodev/clawd-buddy
```

```
/plugin install clawd-buddy@clawd-buddy
```

Or from your shell:

```bash
claude plugin marketplace add zhanbodev/clawd-buddy
```

```bash
claude plugin install clawd-buddy@clawd-buddy
```

Clawd appears in your next session. To get a newer release later:

```bash
claude plugin marketplace update clawd-buddy && claude plugin update clawd-buddy@clawd-buddy
```

**Upgrading from 1.0.0?** It was called `clawd-spinner` then. Remove the old plugin and its marketplace, then install as above:

```bash
claude plugin uninstall clawd-spinner@clawd-spinner && claude plugin marketplace remove clawd-spinner
```

### From source

To hack on it, clone it and start Claude Code with `--plugin-dir`:

```bash
git clone https://github.com/zhanbodev/clawd-buddy.git ~/mods/clawd-buddy
```

```bash
claude --plugin-dir ~/mods/clawd-buddy
```

To load your copy in every session without the flag, add this to `~/.claude/settings.json`, with your own absolute path:

```json
{
  "env": {
    "CLAUDE_CODE_PLUGIN_DIRS": "/Users/you/mods/clawd-buddy"
  }
}
```

Changes to the code reload by themselves, with no restart.

## Commands

Type them in Claude Code. They work while Claude is answering, too.

| Command | What it does |
| :-- | :-- |
| `/clawd show` | Brings Clawd back |
| `/clawd hidden` | Hides Clawd. It stays hidden in later sessions too |
| `/clawd music start` | Turns music mode on |
| `/clawd music stop` | Turns music mode off |
| `/clawd chat` | Opens the chat with Clawd, ready to type |
| `/clawd chat <message>` | Says something to Clawd |
| `/clawd chat close` / `clear` | Closes the chat / clears it |

## Talk to Clawd

Clawd doesn't only watch: you can chat with it.

- Run `/clawd chat`, or `/clawd chat hi Clawd!` to say something right away. A **chat pane** opens beside the transcript, or above the prompt in a narrow terminal, with the whole chat so far and a box to keep typing in. Press Esc to go back to the prompt; the pane stays, so you can keep reading.
- When Clawd answers, it hops, and a **speech bubble** with its reply pops up beside it for a few seconds. The full reply is in the pane.
- Clawd knows what's going on: what Claude is doing right now and the latest of your conversation. It can't run tools or change files, so for real work it sends you back to Claude.
- The chat **stays out of Claude's conversation**: nothing you say to Clawd reaches Claude, and the chat is forgotten when the session ends.
- Choose who answers under **Chat model / 聊天模型** in `/config`, below.
- The pane takes its background from Claude Code's theme, while the main transcript shows your terminal's own background. To have the pane match your terminal exactly, pick an ANSI theme with `/theme`: **Dark mode (ANSI colors only)** for a dark terminal (`"theme": "dark-ansi"`), or its light counterpart for a light one. With `light` in a dark terminal the pane comes out white; `dark` gives a dark gray close to most dark terminals.

## Music mode

**Turn it on**

1. Play some music, then run `/clawd music start`. The first time, it takes a few seconds to build the small program that listens.
2. macOS asks whether **clawd-ears may record system audio**. Click Allow.
3. Clawd puts its headphones on and starts dancing to the beat.

**No prompt, or you clicked Don't Allow?**

Open **System Settings → Privacy & Security → Screen & System Audio Recording**, find **clawd-ears** in the "System Audio Recording Only" list below, and switch it on. Then run `/clawd music stop` and `/clawd music start`.

**What it hears**

- It reads what your Mac is playing through Core Audio. It **never uses the microphone**.
- Every 50 ms it works out only how loud the sound is, and whether a beat landed. The audio itself is never saved or sent, and never leaves that small program.
- The program runs only while music mode is on, and quits the moment you turn it off. It uses about 22 MB of memory and close to no CPU.

## Settings

In `/config`, find **Language / 语言**:

| Value | Effect |
| :-- | :-- |
| `auto` (default) | Follows your system language: Chinese when the first of `LC_ALL`, `LC_MESSAGES` and `LANG` that's set starts with `zh`, English otherwise |
| `zh` | Chinese |
| `en` | English |

And **Chat model / 聊天模型**, for who answers when you chat with Clawd:

| Value | Effect |
| :-- | :-- |
| `haiku` (default) | Fast and light. Gets what Claude is doing and a short digest of your latest messages |
| `sonnet`, `opus` | The same digest, answered by a bigger model |
| `main` | Forks the session's own conversation, on the session's own model: Clawd knows everything said so far. Costs more, and takes longer. Before the session's first answer, haiku stands in |

## How it's drawn

- Clawd is drawn with quadrant block characters (`▘ ▝ ▀ ▖ ▌ ▞ ▛ ▗ ▚ ▐ ▜ ▄ ▙ ▟ █`), four pixels to a character cell, the way Claude Code draws its own logo. Its shape is copied pixel for pixel from that logo.
- It's drawn in the mod band above the prompt, inside a `Client` region. A press on the region goes to Clawd, so it can answer clicks and can't be selected.
- A frame lasts 150 ms. Clawd redraws every frame only while it works, celebrates, dances or reacts to a click. While it waits, it redraws only when it blinks or glances.

## Development

```bash
claude plugin validate .        # Static check: the events and APIs the mod uses
```

```
clawd-buddy/
├── .claude-plugin/
│   ├── plugin.json              Manifest: name, version, the language setting
│   └── marketplace.json         Makes this repository a marketplace you can install from
├── hooks/
│   ├── hooks.json               Points to register.js
│   ├── register.js              Every animation and all the logic
│   └── clawd-view.js            The Client module that shows Clawd and takes clicks
├── native/
│   ├── clawd-ears.swift         The program music mode listens with
│   └── Info.plist               The reason it gives when it asks to record system audio
├── docs/images/                 The animations in this README
├── tests/                       Tests for claude plugin test
└── HANDOFF.md                   Design notes, pitfalls and open items (in Chinese)
```

The design choices, what each version changed, and what's still untested are in [HANDOFF.md](HANDOFF.md).

## Note

Clawd is the mascot of Anthropic's Claude Code. This is an unofficial mod made by a fan, not a product of Anthropic.
