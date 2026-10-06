<h1 align="center">Clawd Buddy</h1>

<p align="center"><b>English</b> | <a href="README.zh-CN.md">中文</a></p>

<p align="center">
  <img src="docs/images/poke.gif" width="480" alt="Clawd above the prompt, clicked: it hops with its arms up, winks and looks around">
</p>

<p align="center">
  Bring <b>Clawd</b>, Claude Code's pixel mascot, into your terminal and the Claude desktop app.<br>
  It lives above the prompt, acts out whatever Claude is doing, bubbles code while it types, dances to your music, hops when you click it, chats with you, and plays a game with you.
</p>

<p align="center">
  <a href="#whats-new">What's new</a> ·
  <a href="#install">Install</a> ·
  <a href="#commands">Commands</a> ·
  <a href="#talk-to-clawd">Talk to Clawd</a> ·
  <a href="#desktop-app">Desktop app</a> ·
  <a href="#game-mode">Game mode</a> ·
  <a href="#music-mode">Music mode</a> ·
  <a href="#settings">Settings</a> ·
  <a href="#development">Development</a>
</p>

---

## What's new

**1.4.0**

- **The Claude desktop app**: Clawd now lives in the Code tab of the desktop app too, in a little pixel city by the bay, after San Francisco. The scene follows your local time (morning, noon, dusk, night), and while Claude has nothing on, Clawd fishes off the waterfront, codes at a café table, waters a planter, or dozes on a bench at night. See [Desktop app](#desktop-app).
- **Game mode**: `/clawd game` turns the band above the prompt into a runner game, like the browser's offline dinosaur: press space in the empty prompt and Clawd jumps over cacti and bugs, faster every 100 points. See [Game mode](#game-mode).
- **A chat pane for the desktop app**: your messages on the right, Clawd's replies rendered as markdown, the box at the bottom.

Earlier releases:

- **1.3.1**: every chat model gets a copy of the whole session so far.
- **1.3.0**: `/clawd model` and `/clawd effort` switch the chat model from the prompt; small terminals leave Clawd its spot.
- **1.2.0**: chat with Clawd (`/clawd chat`, a chat pane and speech bubbles), `/clawd music start|stop`, and Clawd keeps working while it chats or listens.
- **1.1.0**: renamed from Clawd Spinner, the `/clawd` command, and equalizer bars in music mode.

Every release is on the [releases page](https://github.com/zhanbodev/clawd-buddy/releases).

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
- **The terminal**, or the **Code tab of the Claude desktop app**. A few things are terminal only; see [Desktop app](#desktop-app).
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
| `/clawd game` / `game stop` | Starts / ends [game mode](#game-mode) |
| `/clawd scene next` | Desktop app: shows the next time of day (morning, noon, dusk, night, then your local time again) |
| `/clawd scene morning\|noon\|dusk\|night` / `auto` | Desktop app: pins a time of day / follows your local time again |
| `/clawd scene off` / `on` | Desktop app: plain Clawd without the scene / the scene back |
| `/clawd idle fishing\|laptop\|garden\|sleep` / `auto` | Desktop app: pins what Clawd does while it waits / picks by the time of day again |
| `/clawd chat` | Opens the chat with Clawd, ready to type |
| `/clawd chat <message>` | Says something to Clawd |
| `/clawd chat close` / `clear` | Closes the chat / clears it |
| `/clawd model [name]` | Shows or switches the chat model: `haiku`, `sonnet`, `opus` or `main` |
| `/clawd effort [level]` | Shows or sets how hard it thinks: `default`, `low`, `medium`, `high`, `xhigh` or `max` |

## Talk to Clawd

Clawd doesn't only watch: you can chat with it.

- Run `/clawd chat`, or `/clawd chat hi Clawd!` to say something right away. A **chat pane** opens beside the transcript, or above the prompt in a narrow terminal, with the whole chat so far and a box to keep typing in. Press Esc to go back to the prompt; the pane stays, so you can keep reading.
- When Clawd answers, it hops, and a **speech bubble** with its reply pops up beside it for a few seconds. The full reply is in the pane.
- Clawd knows what's going on: what Claude is doing right now and your whole conversation with Claude so far, however long the session runs. It can't run tools or change files, so for real work it sends you back to Claude.
- The chat **stays out of Claude's conversation**: nothing you say to Clawd reaches Claude, and the chat is forgotten when the session ends.
- Choose who answers with `/clawd model sonnet` (or under **Chat model / 聊天模型** in `/config`, below), and how hard it thinks with `/clawd effort high`. Both are saved to your settings, and switching keeps the chat so far.
- The pane takes its background from Claude Code's theme, while the main transcript shows your terminal's own background. To have the pane match your terminal exactly, pick an ANSI theme with `/theme`: **Dark mode (ANSI colors only)** for a dark terminal (`"theme": "dark-ansi"`), or its light counterpart for a light one. With `light` in a dark terminal the pane comes out white; `dark` gives a dark gray close to most dark terminals.

### Pick the chat model

Clawd's chat has a model of its own, separate from the session's: run the session on Opus and chat with Clawd on Sonnet, say. The chat uses `haiku` until you pick another, and your pick becomes the default for every session after. Pick it any of these ways:

- **From the prompt**: `/clawd model sonnet`. Run `/clawd model` alone to see the current one.
- **In `/config`**: find **Chat model / 聊天模型** and choose.
- **In `~/.claude/settings.json`**, under the plugin's id (`clawd-buddy@clawd-buddy` when installed from the marketplace, `clawd-buddy@inline` when loaded with `--plugin-dir`):

  ```json
  {
    "pluginConfigs": {
      "clawd-buddy@clawd-buddy": {
        "options": { "chatModel": "sonnet", "chatEffort": "default" }
      }
    }
  }
  ```

`/clawd effort` and **Chat effort / 聊天思考强度** set how hard it thinks the same way. What each model knows and costs is under [Settings](#settings).

## Desktop app

In the Code tab of the Claude desktop app, the card above the prompt becomes a small pixel city by the bay, after San Francisco: the Golden Gate, golden hills, a pyramid tower and a round-topped one, painted Victorian houses, palms and the waterfront.

<p align="center">
  <img src="docs/images/scene-morning.svg" width="700" alt="Morning: fog drifting through the Golden Gate, Clawd fishing off the waterfront"><br>
  <img src="docs/images/scene-noon.svg" width="700" alt="Noon: blue sky, Clawd coding on a laptop at a café table"><br>
  <img src="docs/images/scene-dusk.svg" width="700" alt="Dusk: a pink sky, the street lamp on, Clawd watering a planter"><br>
  <img src="docs/images/scene-night.svg" width="700" alt="Night: lit windows, the tower's crown changing color, Clawd dozing on a bench">
</p>

- **It follows your local time**: morning from 5:00, noon from 10:00, dusk from 16:30, night from 19:30. Fog drifts through the Gate in the morning; at night the windows light up, the bridge's cable twinkles and the round tower's crown cycles through colors.
- **While Claude has nothing on**, Clawd keeps itself busy, a new pastime every few minutes: fishing off the waterfront (every so often a fish bites, comes up the line and lands in its bucket), coding at a café table with a coffee, watering a planter, or at night dozing on a bench under the lamp.
- **While Claude works**, Clawd acts it out in the scene as it does in the terminal, its caption and speech bubbles drawn there too.
- **Try it**: `/clawd scene next` steps through the times of day, `/clawd idle fishing` pins a pastime. `/clawd scene off` brings back plain Clawd.
- **Terminal only, for now**: clicking Clawd (the desktop app loads no `Client` module, so nothing in the card takes a click) and the hint for a command's arguments under the prompt.

## Game mode

`/clawd game` turns the band above the prompt into a runner game, like the browser's offline dinosaur. `/clawd game stop` ends it.

- **Jump**: with the prompt empty, press space (the space doesn't land in the prompt; with text in it, space types as usual). In the terminal a click on the track jumps too, and after that click space, up or w; Escape gives the keyboard back to the prompt. In the desktop app, press **Start**, which then turns into **Jump ↵**: press Enter to jump. Clicking anywhere on the card puts the focus back on it.
- **Faster and harder**: every 100 points the run speeds up and the score flashes, up to a top speed; taller cacti and pairs of them show up as it goes.
- **Your best score** is kept across sessions.
- While you play, the captions and speech bubbles stay out of the way (the chat pane still works), and music mode waits: if it was on, Clawd goes back to dancing when the game ends.

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
| `haiku` (default) | Fast and light. Gets what Claude is doing and a copy of your conversation so far (the newest 40,000 characters or so, each message's words and the tools and files it used) |
| `sonnet`, `opus` | The same copy, answered by a bigger model. Chat with Sonnet while the session itself runs on Opus, say |
| `main` | Forks the session's own conversation, on the session's own model, from its prompt cache: Clawd knows everything, with nothing cut. Costs more, and takes longer. Before the session's first answer, haiku stands in |

And **Chat effort / 聊天思考强度**, set with `/clawd effort`: `default` (leave it to the model), or `low` to `max`. Models without an effort setting ignore it, and `main` uses the session's own.

## How it's drawn

- Clawd is drawn with quadrant block characters (`▘ ▝ ▀ ▖ ▌ ▞ ▛ ▗ ▚ ▐ ▜ ▄ ▙ ▟ █`), four pixels to a character cell, the way Claude Code draws its own logo. Its shape is copied pixel for pixel from that logo.
- It's drawn in the mod band above the prompt, inside a `Client` region. A press on the region goes to Clawd, so it can answer clicks and can't be selected.
- In the desktop app the same pixels are drawn as an SVG, each pixel twice as tall as wide like a terminal cell's halves. The scene's motion is the SVG's own animation (SMIL), each loop started from the clock, so a new drawing picks up where the last one left off.
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
│   ├── clawd-view.js            The Client module that shows Clawd and takes clicks
│   ├── clawd-game.js            Game mode: its rules, the terminal's Client, the desktop's SVG
│   └── clawd-scene.js           The desktop app's city scenes and Clawd's pastimes
├── native/
│   ├── clawd-ears.swift         The program music mode listens with
│   └── Info.plist               The reason it gives when it asks to record system audio
├── types/index.d.ts             Declares the chat history kept for the session in $.state
├── docs/images/                 The animations in this README
├── tests/                       Tests for claude plugin test
└── HANDOFF.md                   Design notes, pitfalls and open items (in Chinese)
```

The design choices, what each version changed, and what's still untested are in [HANDOFF.md](HANDOFF.md).

## Note

Clawd is the mascot of Anthropic's Claude Code. This is an unofficial mod made by a fan, not a product of Anthropic.
