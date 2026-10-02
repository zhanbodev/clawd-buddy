<h1 align="center">Clawd Spinner</h1>

<p align="center"><a href="README.md">English</a> | <b>中文</b></p>

<p align="center">
  <img src="docs/images/poke.gif" width="480" alt="Clawd 站在输入框上方,被点了一下:举手跳起、眨眼、东张西望">
</p>

<p align="center">
  让 Claude Code 的像素小吉祥物 <b>Clawd</b> 住进你的终端。<br>
  它站在输入框上方,跟着 Claude 的工作切换动作,会冒代码泡泡,会听歌跳舞,点它一下还会跳起来。
</p>

<p align="center">
  <a href="#安装">安装</a> ·
  <a href="#命令">命令</a> ·
  <a href="#音乐模式">音乐模式</a> ·
  <a href="#设置">设置</a> ·
  <a href="#开发">开发</a>
</p>

---

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
- **零成本**:不调用任何模型,也不联网。

## 安装

需要:

- **Claude Code 2.1.287 或更高版本**(从这个版本开始支持 mod)。
- **在终端里使用**。Desktop 应用里不显示,保持原样。
- **音乐模式**另外需要 macOS 14.2 以上,以及 Xcode Command Line Tools(`xcode-select --install`)。

下载后,带上 `--plugin-dir` 启动 Claude Code 就能看到 Clawd:

```bash
git clone https://github.com/zhanbodev/clawd-spinner.git ~/mods/clawd-spinner
```

```bash
claude --plugin-dir ~/mods/clawd-spinner
```

想让它每次都在,不用每次带参数:在 `~/.claude/settings.json` 里加上下面这段(路径换成你自己的,要写绝对路径):

```json
{
  "env": {
    "CLAUDE_CODE_PLUGIN_DIRS": "/Users/你的用户名/mods/clawd-spinner"
  }
}
```

改了代码会自动重新加载,不用重启。

## 命令

在 Claude Code 里输入,Claude 正在回答时也能用:

| 命令 | 作用 |
| :-- | :-- |
| `/clawd-spinner show` | 让 Clawd 出来 |
| `/clawd-spinner hidden` | 把 Clawd 藏起来,下次打开 Claude Code 也还是藏着 |
| `/clawd-spinner startmusic` | 开启音乐模式 |
| `/clawd-spinner stopmusic` | 关闭音乐模式 |

## 音乐模式

**怎么开**

1. 先放一首歌,然后输入 `/clawd-spinner startmusic`。第一次会花几秒钟编译一个听音乐的小程序,之后就直接用了。
2. macOS 会弹窗问 **clawd-ears 是否可以录制系统音频**,点"允许"。
3. Clawd 戴上耳机,开始跟着节拍跳。

**没弹窗,或者之前点了不允许?**

打开 **系统设置 → 隐私与安全性 → 录屏与系统录音**,在下方"仅系统录音"列表里找到 **clawd-ears**,把开关打开。然后输入 `/clawd-spinner stopmusic`,再输入 `/clawd-spinner startmusic`。

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

## 它是怎么画出来的

- Clawd 用"四分块"字符(`▘ ▝ ▀ ▖ ▌ ▞ ▛ ▗ ▚ ▐ ▜ ▄ ▙ ▟ █`)画:一个字符格装 2×2 个像素,和 Claude Code 自己画 logo 的方式一样,造型也是照着官方 logo 逐像素复刻的。
- 它画在 mod 的"输入框上方区域"里,外面套了一个 `Client` 区域。鼠标在它上面按下时由它接管,所以既能响应点击,又不会被选中复制。
- 每 150 毫秒一帧,只在工作、庆祝、跳舞或被点的时候持续重绘;空闲时只在眨眼、转头那一下才重绘。

## 开发

```bash
claude plugin validate .        # 静态检查:用到的事件和 API
```

```
clawd-spinner/
├── .claude-plugin/plugin.json   清单:名字、版本、语言设置
├── hooks/
│   ├── hooks.json               指向 register.js
│   ├── register.js              全部动画和逻辑
│   └── clawd-view.js            显示 Clawd、接收点击的 Client 模块
├── native/
│   ├── clawd-ears.swift         音乐模式的听音小程序
│   └── Info.plist               它申请"系统录音"权限时的说明
├── docs/images/                 README 里的动图
├── tests/                       claude plugin test 用的测试
└── HANDOFF.md                   设计细节、踩过的坑和待办
```

设计上的取舍、每一版改了什么、哪些地方还没实测,都记在 [HANDOFF.md](HANDOFF.md) 里。

## 说明

Clawd 是 Anthropic 的 Claude Code 吉祥物。这是一个粉丝自制的 mod,不是 Anthropic 官方出品。
