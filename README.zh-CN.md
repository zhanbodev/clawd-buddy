<h1 align="center">Clawd Buddy</h1>

<p align="center"><a href="README.md">English</a> | <b>中文</b></p>

<p align="center">
  <img src="docs/images/poke.gif" width="480" alt="Clawd 站在输入框上方,被点了一下:举手跳起、眨眼、东张西望">
</p>

<p align="center">
  让 Claude Code 的像素小吉祥物 <b>Clawd</b> 住进你的终端。<br>
  它站在输入框上方,跟着 Claude 的工作切换动作,会冒代码泡泡,会听歌跳舞,点它一下还会跳起来,还能陪你聊天。
</p>

<p align="center">
  <a href="#最新改进">最新改进</a> ·
  <a href="#安装">安装</a> ·
  <a href="#命令">命令</a> ·
  <a href="#和-clawd-聊天">和 Clawd 聊天</a> ·
  <a href="#音乐模式">音乐模式</a> ·
  <a href="#设置">设置</a> ·
  <a href="#开发">开发</a>
</p>

---

## 最新改进

**1.3.1**

- **选哪个聊天模型,Clawd 都知道整个会话**:`haiku`、`sonnet`、`opus` 现在会拿到你和 Claude 到目前为止的对话副本(最新的约 4 万字),而不只是最近几条消息。所以主会话用 Opus、和 Clawd 聊天用 Sonnet 时,它照样知道 Claude 做过的所有事。见[设置默认的聊天模型](#设置默认的聊天模型)。

**1.3.0**

- **在输入框里切换聊天模型和思考强度**:`/clawd model sonnet`、`/clawd effort high`。两者都会存进 `/config`,切换后之前的聊天记录还在。
- **小屏适配**:聊天面板放在输入框上方时会限制高度,给 Clawd 留出位置;屏幕实在放不下两者时,Clawd 主动让位,把空间留给聊天和代码。
- **对话气泡更整齐**:英文按空格换行,不再把单词拆开。

更早的版本:

- **1.2.0**:可以和 Clawd 聊天(`/clawd chat`、聊天面板、对话气泡),音乐命令改为 `/clawd music start|stop`,聊天或听歌时 Clawd 照样先忙手上的活。
- **1.1.0**:由 Clawd Spinner 改名而来,命令改为 `/clawd`,音乐模式加了两侧的音乐条。

所有版本见 [Releases 页面](https://github.com/zhanbodev/clawd-buddy/releases)。

## 它会做什么

<table>
  <tr>
    <td width="50%">
      <img src="docs/images/typing.gif" alt="Clawd 侧身在笔记本上打字,头顶冒出代码泡泡"><br>
      <b>写代码</b><br>
      Claude 编辑文件时,Clawd 侧身敲着一台小笔记本,头顶不停冒出 <code>{}</code> <code>&lt;/&gt;</code> <code>;</code> 这样的代码泡泡。
    </td>
    <td width="50%">
      <img src="docs/images/poses.gif" alt="Clawd 依次思考、举着纸阅读、小跑、拿放大镜搜索"><br>
      <b>思考 · 阅读 · 运行 · 搜索</b><br>
      动作跟着 Claude 正在用的工具变:想事情时冒思考点点,读文件举着一页纸,跑命令一路小跑,搜索时举着放大镜。
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="docs/images/dance.gif" alt="Clawd 戴着耳机跟着节拍跳动,音符从耳罩冒出"><br>
      <b>音乐模式</b><br>
      戴上耳机,跟着这台 Mac 正在播放的音乐节拍跳,音符从两侧耳罩往上飘。
    </td>
    <td width="50%">
      <img src="docs/images/celebrate.gif" alt="任务完成后的派对和烟花"><br>
      <b>完成庆祝</b><br>
      一次回答超过 5 秒,结束时随机来一段派对或烟花。
    </td>
  </tr>
</table>

还有这些小细节:

- **一直都在**:空闲时它站在输入框右上方,偶尔眨眼、左右看看。
- **点它一下**:举手跳起、右眼眨一下、东张西望、两只眼睛到处转。
- **选不中**:用鼠标拖选文字时不会把 Clawd 选进去,复制不到它。
- **说人话**:旁边写着"编辑中… · register.js",只显示文件名,不显示其他任何工具输入。
- **中英双语**:跟随系统语言,也可以手动指定。
- **看它免费**:除了聊天,其他功能都不调用模型、不联网。聊天时用你自己的 Claude 账号调用模型,只在你发消息时才调用。

## 安装

需要:

- **Claude Code 2.1.287 或更高版本**(从这个版本开始支持 mod)。
- **在终端里使用**。Desktop 应用里不显示,保持原样。
- **音乐模式**另外需要 macOS 14.2 以上,以及 Xcode Command Line Tools(`xcode-select --install`)。

### 从插件市场安装

在 Claude Code 里先把这个仓库添加为插件市场,再从里面安装:

```
/plugin marketplace add zhanbodev/clawd-buddy
```

```
/plugin install clawd-buddy@clawd-buddy
```

也可以在终端里执行:

```bash
claude plugin marketplace add zhanbodev/clawd-buddy
```

```bash
claude plugin install clawd-buddy@clawd-buddy
```

下次打开 Claude Code 就能看到 Clawd。以后有新版本时更新:

```bash
claude plugin marketplace update clawd-buddy && claude plugin update clawd-buddy@clawd-buddy
```

**用过 1.0.0?** 那时它叫 `clawd-spinner`。先删掉旧插件和旧市场,再按上面的方法安装:

```bash
claude plugin uninstall clawd-spinner@clawd-spinner && claude plugin marketplace remove clawd-spinner
```

### 从源码运行

想改代码的话,clone 下来,带上 `--plugin-dir` 启动 Claude Code:

```bash
git clone https://github.com/zhanbodev/clawd-buddy.git ~/mods/clawd-buddy
```

```bash
claude --plugin-dir ~/mods/clawd-buddy
```

想让这份源码每次都加载,不用每次带参数:在 `~/.claude/settings.json` 里加上下面这段(路径换成你自己的,要写绝对路径):

```json
{
  "env": {
    "CLAUDE_CODE_PLUGIN_DIRS": "/Users/你的用户名/mods/clawd-buddy"
  }
}
```

改了代码会自动重新加载,不用重启。

## 命令

在 Claude Code 里输入,Claude 正在回答时也能用:

| 命令 | 作用 |
| :-- | :-- |
| `/clawd show` | 让 Clawd 出来 |
| `/clawd hidden` | 把 Clawd 藏起来,下次打开 Claude Code 也还是藏着 |
| `/clawd music start` | 开启音乐模式 |
| `/clawd music stop` | 关闭音乐模式 |
| `/clawd chat` | 打开和 Clawd 的聊天,直接打字 |
| `/clawd chat 想说的话` | 对 Clawd 说一句话 |
| `/clawd chat close` / `clear` | 关闭聊天 / 清空聊天记录 |
| `/clawd model [模型]` | 查看或切换聊天模型:`haiku`、`sonnet`、`opus`、`main` |
| `/clawd effort [强度]` | 查看或设置思考强度:`default`、`low`、`medium`、`high`、`xhigh`、`max` |

## 和 Clawd 聊天

Clawd 不只是看着,你还可以直接跟它说话。

- 输入 `/clawd chat`,或者 `/clawd chat 你好呀` 直接说一句。会打开一个**聊天面板**:宽的终端里停靠在对话右侧,窄的终端里在输入框上方。面板里是完整的聊天记录,下面有输入框可以接着聊。按 Esc 回到主输入框,面板留着,方便边干活边看。
- Clawd 回复时会跳一下,身边冒出一个**对话气泡**显示它说的话,几秒后消失;完整内容在面板里。
- Clawd 知道现在在发生什么:Claude 正在做什么,以及你和 Claude 到目前为止的整个对话,会话再长也一样。它不能跑工具、不能改文件,真要干活时它会让你去找 Claude。
- 聊天**不进入 Claude 的对话**:你和 Clawd 说的话 Claude 看不到;会话结束,聊天记录也就忘了。
- 用 `/clawd model sonnet` 切换谁来回答(也可以在 `/config` 的 **Chat model / 聊天模型** 里选,见下面的设置),用 `/clawd effort high` 调整思考强度。两者都会存进设置,切换后之前的聊天记录还在。
- 面板的底色由 Claude Code 的主题决定,而主对话区透出的是终端自己的底色。想让面板和终端完全一样,用 `/theme` 选 ANSI 主题:深色终端选 **Dark mode (ANSI colors only)**(`"theme": "dark-ansi"`),浅色终端选对应的浅色 ANSI 主题。深色终端配 `light` 主题时面板会是白色;选 `dark` 是接近多数深色终端的深灰。

### 设置默认的聊天模型

和 Clawd 聊天用的模型是单独设置的,和主会话无关:比如主会话用 Opus,和 Clawd 聊天用 Sonnet。没设置时默认用 `haiku`,设置一次之后,以后每个会话都默认用你选的模型。三种设置方法任选其一:

- **在输入框里**:`/clawd model sonnet`。只输入 `/clawd model` 可以查看现在用的是哪个。
- **在 `/config` 里**:找到 **Chat model / 聊天模型**,选一个。
- **在 `~/.claude/settings.json` 里**,写在插件 id 下面(从插件市场安装时是 `clawd-buddy@clawd-buddy`,用 `--plugin-dir` 加载时是 `clawd-buddy@inline`):

  ```json
  {
    "pluginConfigs": {
      "clawd-buddy@clawd-buddy": {
        "options": { "chatModel": "sonnet", "chatEffort": "default" }
      }
    }
  }
  ```

思考强度同理,用 `/clawd effort` 或 `/config` 里的 **Chat effort / 聊天思考强度** 设置。各个模型分别知道多少、贵不贵,见[设置](#设置)。

## 音乐模式

**怎么开**

1. 先放一首歌,然后输入 `/clawd music start`。第一次会花几秒钟编译一个听音乐的小程序,之后就直接用了。
2. macOS 会弹窗问 **clawd-ears 是否可以录制系统音频**,点"允许"。
3. Clawd 戴上耳机,开始跟着节拍跳。

**没弹窗,或者之前点了不允许?**

打开 **系统设置 → 隐私与安全性 → 录屏与系统录音**,在下方"仅系统录音"列表里找到 **clawd-ears**,把开关打开。然后输入 `/clawd music stop`,再输入 `/clawd music start`。

**它听到了什么**

- 用 macOS 的 Core Audio 读取"这台 Mac 正在播放的声音",**不使用麦克风**。
- 每 50 毫秒只算一次音量,再判断有没有节拍。声音本身不保存、不上传,也不离开这个小程序。
- 只在音乐模式开着时运行,关掉马上退出。实测约 22 MB 内存,CPU 接近 0。

## 设置

在 `/config` 里找到 **Language / 语言**:

| 值 | 效果 |
| :-- | :-- |
| `auto`(默认) | 跟随系统语言:`LC_ALL`、`LC_MESSAGES`、`LANG` 里第一个设了的值以 `zh` 开头就用中文,否则英文 |
| `zh` | 中文 |
| `en` | English |

还有 **Chat model / 聊天模型**,决定和 Clawd 聊天时谁来回答:

| 值 | 效果 |
| :-- | :-- |
| `haiku`(默认) | 又快又省。拿到 Claude 正在做什么,以及到目前为止的对话副本(最新的约 4 万字:每条消息的文字和用到的工具、文件) |
| `sonnet`、`opus` | 同样的对话副本,换更大的模型回答。比如主会话用 Opus,和 Clawd 聊天用 Sonnet |
| `main` | 分叉主会话,用主会话的模型,走提示缓存:Clawd 知道完整对话,一点不截。更贵,也更慢。主会话还没有回答过时,先由 haiku 代答 |

还有 **Chat effort / 聊天思考强度**,用 `/clawd effort` 设置:`default`(交给模型决定),或 `low` 到 `max`。不支持的模型会忽略它,`main` 沿用主会话的设置。

## 它是怎么画出来的

- Clawd 用"四分块"字符(`▘ ▝ ▀ ▖ ▌ ▞ ▛ ▗ ▚ ▐ ▜ ▄ ▙ ▟ █`)画:一个字符格装 2×2 个像素,和 Claude Code 自己画 logo 的方式一样,造型也是照着官方 logo 逐像素复刻的。
- 它画在 mod 的"输入框上方区域"里,外面套了一个 `Client` 区域。鼠标在它上面按下时由它接管,所以既能响应点击,又不会被选中复制。
- 每 150 毫秒一帧,只在工作、庆祝、跳舞或被点的时候持续重绘;空闲时只在眨眼、转头那一下才重绘。

## 开发

```bash
claude plugin validate .        # 静态检查:用到的事件和 API
```

```
clawd-buddy/
├── .claude-plugin/
│   ├── plugin.json              清单:名字、版本、语言设置
│   └── marketplace.json         让这个仓库成为可以安装的插件市场
├── hooks/
│   ├── hooks.json               指向 register.js
│   ├── register.js              全部动画和逻辑
│   └── clawd-view.js            显示 Clawd、接收点击的 Client 模块
├── native/
│   ├── clawd-ears.swift         音乐模式的听音小程序
│   └── Info.plist               它申请"系统录音"权限时的说明
├── types/index.d.ts             声明存在 $.state 里的本次会话聊天记录
├── docs/images/                 README 里的动图
├── tests/                       claude plugin test 用的测试
└── HANDOFF.md                   设计细节、踩过的坑和待办
```

设计上的取舍、每一版改了什么、哪些地方还没实测,都记在 [HANDOFF.md](HANDOFF.md) 里。

## 说明

Clawd 是 Anthropic 的 Claude Code 吉祥物。这是一个粉丝自制的 mod,不是 Anthropic 官方出品。
