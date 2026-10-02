# clawd-spinner 交接文档

> 写于 2026-10-02,来自 suyao 仓库里的一次 Claude Code 会话(“Claude Mods 使用方法”)。
> 完整原始对话已导出到 `~/Downloads/session-export-1790954591211.zip`,这里是整理后的要点。

## 这是什么

一个 Claude Code **mod**(v2.1.287 起支持的插件类型,用 JS/TS 钩子改 Claude Code 的界面和行为)。它让一只**逐像素复刻官方 logo 的 Clawd** 常驻在输入框上方的右端(站在输入框顶线上,和官方的 Clawd 打字图一样):空闲时站着偶尔眨眼、左右看,工作时按 Claude 正在用的工具切换动作,任务完成后放一段庆祝动画。Claude Code 自己的 spinner 行保持原样。

- 不调用任何模型:零成本,也不向外发送任何内容。
- 只在终端生效:Desktop 里的 `e.surface !== 'terminal'` 会直接 `next(e)`,什么也不画。
- 需要 Claude Code ≥ 2.1.287。本机已从 2.1.285 升级到 2.1.287。

## 文件

```
clawd-spinner/
├── .claude-plugin/plugin.json   清单:name=clawd-spinner, version 0.2.0
├── .claude-plugin/types/        Claude Code 加载时自动生成的类型声明,别手改
├── hooks/hooks.json             {"modules": ["./register.js"]}
├── hooks/clawd-view.js          Client 的显示模块:把 register.js 算好的每一帧画出来,并把点击告诉它
├── tests/clawd.test.ts          点击、隐藏/显示的测试(本机 `claude plugin test` 被功能开关关着,还没跑过)
├── hooks/register.js            全部逻辑,约 500 行
├── native/clawd-ears.swift     音乐模式的听音小程序(Core Audio Tap),首次开启时编译到 native/build/(已 gitignore)
├── README.md / README.zh-CN.md  对外介绍,默认英文,顶部 "English | 中文" 互相跳转;配图在 docs/images/(由 tools/readme-images.sh 生成)
├── tools/                       (只在本地,已加入 .gitignore,不进仓库)
├── tools/render.mjs             预览图和 README 配图共用的渲染代码:像素画转图片、PNG 和 GIF 编码器
├── tools/readme-images.sh       从代码生成 README 里的 5 张 GIF
├── tools/preview.sh             把所有动画帧渲染成一张 PNG,不用启动 Claude Code
├── tools/preview-sheet.mjs      preview.sh 用的 PNG 生成器(自带极简 PNG 编码器和 5×7 点阵字,零依赖)
└── tsconfig.json                Claude Code 自动生成
```

## 常用命令

```bash
claude --plugin-dir ~/mods/clawd-spinner        # 本次会话加载,改文件后自动热重载
claude plugin validate ~/mods/clawd-spinner     # 静态校验:事件名、API 调用
~/mods/clawd-spinner/tools/preview.sh out.png   # 出帧预览图,改完动画先看这个
```

## 当前设计(register.js)

### 渲染方式:四分块字符 + 普通 Text

- 画布是像素网格。**每个终端格 = 2×2 个像素**,用四分块字符 `QUADS = ' ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█'` 画,和官方 logo 的画法相同。
- `gridRows(Box, Text, grid)`:每格取出现最多的颜色做前景(`color`),次多的做背景(`backgroundColor`)。格子里有空像素时不设背景,空像素保持透明。同色的相邻格合并成一个 `Text`,空白段用 `Box({width, height:1})` 占位。
- 也能在格子里写**文字**:`write(grid, col, row, text, color)` 记到 `grid.words`,该格显示这个字符,盖住格内像素。只用 ASCII,保证一个字符占一格。代码泡泡就是这么画的。
- 颜色写成 `'rgb(r,g,b)'` 字符串,和 Claude Code 自己主题的写法一致。
- **每一行和整体都设了 `width` + `flexShrink: 0`**。这一点很关键:旁边的文字列会通过 flex 布局挤压像素画,v3 的“缺一列、眼睛错位”就是这个原因。

### Clawd 造型

从截图里的官方 logo 放大后逐像素量出,17×5 像素:

```
..█████████████..    身体 13 宽
..██.███████.██..    眼睛 = 纯黑 EYE(0x000000),在身体第 2、10 列
█████████████████    手臂这一行两边各伸出 2
..█████████████..
..█.█.......█.█..    4 条腿,在身体第 0、2、10、12 列
```

`drawClawd(grid, { ox, top, eyeShift, blink, armL, armR, legStep })`:手臂取值 `'down' | 'up' | 'none'`,`legStep` 让腿左右挪一格,用来做迈步动作。

### 工作姿势

画布 `SW×SH = 26×10` 像素,即 13 列 × 5 行。Clawd 站在最底行(头在 `TOP = SH - 5`),在 `ox=2`,右侧留给道具,上方两行留给打字时的代码泡泡。**所有姿势都画这么高**,这样切换姿势时 spinner 高度不变,上下文字不会跳。

| pose | 触发工具 | 动画 |
|---|---|---|
| think | 默认;工具调用 3 秒(`POSE_MS`)后回到这个状态 | 上下晃、眨眼、左右瞄,右下方冒思考点点 |
| read | Read | 眼睛左右扫,旁边举一页纸 |
| edit | Edit / Write / NotebookEdit | **侧面视角**(参考官方 Clawd 打字图):`drawClawdSide` 面朝左,前眼在脸的前沿;左边一台小笔记本,键盘平放,屏幕向后仰、朝着 Clawd。手每帧上下敲一次,敲下时左侧一个键变亮。头顶不断冒出代码泡泡(`drawBubbles`):先在头顶冒一个色块,再以 `{}` `</>` `;` 等文字往上升两行并左右漂移,最后变成灰色 `*` 破掉;每 `BUBBLE_EVERY = 4` 帧冒一个 |
| bash | Bash | 腿交替迈步、身体颠,后面有速度线 |
| search | Grep / Glob / WebSearch / WebFetch | 右侧一个上下晃的蓝色放大镜 |

全部画在 `AbovePrompt` 区域(紧贴输入框上方),整行右对齐、右边留 2 列。“思考中...”这类提示紧挨在 Clawd **左边**,对齐 Clawd 身体的中间那行。Read/Edit 时会附上**只有文件名**(最多 24 字),工具的其他输入一律不显示。不再改 `Spinner`,所以耗时和中断提示照旧。

空闲时画布是 `SW×IDLE_H = 26×8`(4 行,上面留一行给点击时跳起来),`idleLook` 在 9 秒循环里眨眼、左看、右看;只在样子变化时才重绘。工作时 5 行、庆祝 5 行,回到空闲变回 3 行,高度只在回合开始/结束时变。有调查问卷(`hasSurvey`)时让出这块区域。

### 完成庆祝

- 和 Clawd 同一个位置(`AbovePrompt` 右端),画布 `CW×CH = 40×10` 像素,即 20 列 × 5 行,欢呼文字在左边。
- 播放 `CELEBRATE_FRAMES = 30` 帧(约 4.5 秒)后自动收起。
- 只有耗时 ≥ `MIN_TURN_MS = 5000` 的回合才会庆祝。按 Esc 中断(`turn.abort`)不庆祝。新回合开始会立刻结束庆祝。
- 两套随机二选一:
  - `partyFrame`:尖顶派对帽、挥手跳跃、两个椭圆气球、14 片纸屑。
  - `fireworksFrame`:每 5 帧炸开一朵 8 向烟花,带同色拖尾,最后变灰。
- 跳到最高点会闭眼。文字从 `CHEERS` 里随机选。
- 如果 `e.props.maxRows` 放不下当前画布(窗口太矮),跳过不画。

### 事件和计时

- `session.start`:启动 `$.clock.every(FRAME_MS=150)`。工作中或庆祝中每帧调 `$.ui.invalidate('ui.render')`;空闲时只在 `idleLook` 变化时调,以免白白重绘。
- `turn.start` / `turn.complete` / `turn.abort`:维护 `isWorking` 和庆祝状态。
- `tool.call`:根据 `e.tool` 设置姿势,`e.file_path` 只取文件名。

### 用 Client 显示、点击互动

- 区域里不直接放文字,而是放一个 `Client`(`key: 'clawd'`,`module: './clawd-view.js'`)。`gridRuns(grid)` 把像素网格算成纯数据(每行若干 `{ text, color, backgroundColor }`),作为 props 交给它;`clawd-view.js` 照同样的方式画(和 `runRows` 是同一段逻辑,改一处记得改另一处)。
- 为什么用 Client:鼠标在 Client 区域按下后由它接管,终端既不会选中文字也不会滚动,所以 Clawd **选不中、复制不到**;而且只有 Client 能收到点击(`Image` 能画像素但收不到点击,而且 Client 里不能放 Image/Raster)。
- 左键按下 → `surface.post({ poke: true })` → `ui.message` 钩子把 `poke` 设为 0 → 按 `POKE` 表每帧一步:跳两像素并举手、右眼(屏幕右边那只)眨两帧、左右张望两轮、眼睛往下转一圈,共 26 帧约 4 秒。工作中、庆祝中不响应。眼睛不往上看:头顶那排像素和上面的空像素在同一个终端格里,往上看会把旁边的橙色吃掉。
- 实机验证:tmux 里往终端发 SGR 鼠标序列 `\e[<0;列;行M` / `\e[<0;列;行m` 就能模拟点击,截屏能看到跳起和眨眼。
- 注意:`~/.claude/skills/clawd-spinner` 是指向本项目的软链接,不带 `--plugin-dir` 时从那里加载;带 `--plugin-dir` 时那份会因为重名不加载,这是正常的。

### 命令 `/clawd-spinner`

在 `session.start` 里用 `$.command.register` 注册(`immediate: true`,回答进行中也能用):

- `show` / `hidden`(也认 `hide`):显示或隐藏 Clawd。状态存在 `$.store` 的 `hidden`,跨会话保留。隐藏时区域直接 `next(e)`,时钟也不再重绘;隐藏会顺便关掉音乐模式。
- `startmusic` / `stopmusic`:音乐模式。

### 音乐模式

- **听什么**:`native/clawd-ears.swift` 用 Core Audio 的 process tap(macOS 14.2+)读系统正在播放的声音,不碰麦克风。音频不出这个进程,每 50 ms 只算一次响度(vDSP),再用"比前一秒平均响 35% 且在上升、间隔 ≥250 ms"判断节拍。输出一行 `<0-9 响度> <0/1 节拍>`,变化时才输出,静音时每秒一行心跳。实测内存约 16 MB,CPU 约 0%。
- **怎么跑**:mod 首次 `startmusic` 时用 `xcrun swiftc -O` 编译(约 8 秒,源码比二进制新就重编),再用 `$.process.spawn` 启动、逐行读。`stopmusic` 时退出读取循环就会结束子进程;mod 卸载、会话结束也会结束它;子程序发现父进程没了也会自己退出。
- **权限**:需要"系统录音"权限。macOS 把权限算在"负责"这个进程的应用头上;从终端启动时那是终端应用(用户用的是 kitty),它的 Info.plist 没写录音用途,macOS 就**不弹窗、直接给静音**。所以 clawd-ears 一启动先用私有的 `responsibility_spawnattrs_setdisclaim` 拉起一个"自己负责自己"的副本(Claude 桌面应用的 disclaimer 也是这么做的),副本共用同一个输出管道;`native/Info.plist`(含 `NSAudioCaptureUsageDescription`)通过 `-sectcreate __TEXT __info_plist` 链进二进制。这样第一次开启会弹窗问"clawd-ears"能否录制系统音频,设置里也会出现 clawd-ears 这一项。外层进程等副本结束、转发 SIGTERM,发现自己的父进程没了就一起退出。两个进程合计约 22 MB。注意:ad-hoc 签名,重新编译后 macOS 可能会再问一次。
- **画面**:空闲时换成 `danceFrame`(5 行):Clawd 戴银色头带、粉色耳罩的耳机,每个节拍跳起一像素、两脚交替踩,每 30 帧(约 4.5 秒)眨一次眼;音符是像素画(没用 ♪ 字符,它的宽度在 CJK 终端里不确定),从两侧耳罩轮流往上飘,`NOTE_LIFE` 帧后消失。没检测到节拍但响度 ≥3 时,每 6 帧也冒一个音符。工作时照常做工作姿势,只是戴着耳机(`workFrame(pose, t, phones)`;侧面打字用 `drawHeadphonesSide`)。
- 调试:`xcrun swiftc -O -D DEBUG_EARS ...` 编出的版本会往 stderr 打印每 50 ms 的采样数和响度。用 tmux 测 mod 时,可以临时把 `native/build/clawd-ears` 换成一个循环 `echo "6 1"` 的脚本来模拟节拍。

### 为什么 Clawd 和输入线之间隔一行

`AbovePrompt` 区域和输入框顶线之间有一行是 Claude Code 自己的提示行(平时空着,有通知时会显示,比如 tmux 下的 focus-events 提示)。它不属于任何可接管的位置(`PromptHint` 是输入框**下面**那行)。用 `position: 'absolute', bottom: -1` 往下挪会被区域裁掉,实测腿那一行直接没了。Clawd 的腿已经画在区域最后一行的下半格,这已经是能贴到的最近位置。

调试技巧:`tmux new-session -d -s clawd -x 100 -y 30 "claude --plugin-dir ..."`,再 `tmux capture-pane -t clawd -p` 就能读到真实界面的文字,改文件会热重载。终端面板的 read_terminal 读不到全屏界面。

### 语言设置

- `plugin.json` 的 `userConfig.language`:`auto`(默认)/ `zh` / `en`,在 `/config` 里是一个下拉选择。值存在 `settings.json` 的 `pluginConfigs["clawd-spinner"].options.language`。
- 文字都在 `WORDS` 表里(姿势提示 + 庆祝语),加语言只要加一组。
- `auto` 在 `session.start` 时按 `LC_ALL` → `LC_MESSAGES` → `LANG` 的顺序取第一个有值的,以 `zh` 开头用中文,否则英文(都没设也是英文)。
- 一个包同时支持两种语言,不拆包分发。

## 发布

- 仓库本身就是插件市场:`.claude-plugin/marketplace.json`(市场名 `clawd-spinner`,唯一的插件 `source: "./"` 指向仓库根目录)。安装:`/plugin marketplace add zhanbodev/clawd-spinner`,再 `/plugin install clawd-spinner@clawd-spinner`。
- `plugin.json` 里写了 `version`,用户会停在这个版本,**发新版必须改版本号**,用户再 `claude plugin marketplace update clawd-spinner && claude plugin update clawd-spinner@clawd-spinner`。
- 发版步骤:改 `plugin.json` 的 `version` → `claude plugin validate .claude-plugin/plugin.json` 和 `claude plugin validate .`(后者检查市场清单)→ 提交推送 → `git tag vX.Y.Z` 推送 → `gh release create vX.Y.Z`。
- 可以用 `CLAUDE_CONFIG_DIR=<临时目录> claude plugin marketplace add <本地仓库路径>` 加 `claude plugin install` 在隔离环境里试装,不碰真实设置。
- 本机 `~/.claude/skills/clawd-spinner` 是指向本项目的软链接;如果再从市场安装,会出现两个同名插件,只留一个。
- v1.0.0:2026-10-03 首个正式版。

## 迭代历史

记录这些是为了以后不再走同样的弯路。

1. **v0 cartoon-spinner**:每次工具调用让 Sonnet 画 ASCII 字符画。用户觉得不好看,已废弃。还有个隐私问题:哪怕只发工具名,也要过模型。
2. **v1**:16×10 半块像素,用 `Raster` 画,5 行高。用户很喜欢,加了笔记本写代码的动画。
3. **v2**:缩小到 12×8,加了庆祝。用户截图发现**残影**:spinner 上方多出一份被切掉一半的旧帧。怀疑是 `Raster` 重绘时没擦干净,没有最终确认。
4. **v3**:改用半块字符 + `Text`。结果被 flex 挤压,画面错乱;造型也被吐槽像太空侵略者,“没有第一版好看”。
5. **v4**:四分块字符 + 官方 logo 逐像素复刻 + 固定宽度。
6. **v5(当前)**:按用户给的官方截图,把编辑姿势改成侧面打字,屏幕不再对着用户;头顶冒代码泡泡。为了给泡泡留空间,画布从 3 行加高到 5 行,所有姿势统一高度。
7. **v6(当前)**:用户要求 Clawd 常驻在输入线右侧上方,且提示文字别离 Clawd 太远。改为整只画在 `AbovePrompt` 右端,不再替换 `Spinner`;加了空闲动画。离线预览图检查正常,**还没在用户终端里实际确认过**(终端面板的 read_terminal 读不到 Claude Code 的全屏界面,只能请用户看)。

## 待办 / 未验证

- [ ] **音乐模式实测**:在用户自己的终端里 `startmusic`,确认 macOS 弹出系统录音权限、放歌时节拍检测的灵敏度(阈值 1.35、最短间隔 250 ms、静音线 0.003 都可能要调)。

- [ ] **实机确认 v6**:右对齐的位置和右边距是否贴合输入线;工作时 5 行高是否合适(非打字姿势上方会空两行,可以考虑也利用起来);四分块字符在用户的字体下是否正常;v2 的残影是否消失;`rgb(...)` 颜色是否被接受。如果不被接受,会话里会出现一行 `ui.render (Spinner) refused: ...`,这块区域就不画了。
- [ ] 确认 `turn.complete` 在每次回答结束时都会触发,庆祝能正常出现。
- [ ] **让它一直生效**:推荐在 `~/.claude/settings.json` 里加 `"env": { "CLAUDE_CODE_PLUGIN_DIRS": "/Users/liangzhanbo/mods/clawd-spinner" }`,效果等同每次带 `--plugin-dir`,也支持热重载。用户还没同意改全局设置。另一种做法是把 `~/mods` 做成本地插件市场再 `/plugin install`,但每次改代码都要改版本号重装。
- [ ] 可选:加 `claude plugin test` 测试;用 `userConfig` 把 `MIN_TURN_MS` 等参数也做成配置项;发布到市场。

## 参考

- 官方 mods 文档:https://code.claude.com/docs/en/plugins/mods/overview
  - 界面绘制:https://code.claude.com/docs/en/plugins/mods/interface
  - 完整参考(事件、方法、元素、限制):https://code.claude.com/docs/en/plugins/mods/reference
- 类型声明:https://github.com/anthropics/claude-code/blob/main/mods/types/claude-code.d.ts(以本机生成的 `.claude-plugin/types/` 为准)
- 官方示例 mod:https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods
- 同类社区作品,都不是以官方 Clawd 造型为主:
  - [falkoro/clawd-cartoons](https://github.com/falkoro/clawd-cartoons):受 [@anshuc 推文](https://x.com/anshuc/status/2105773281936650247)启发的独立实现。Sonnet 现写场景程序,在沙箱解释器里以 20fps 用 `Raster` + `$.ui.blit` 绘制。会把 Bash 命令原文和提示词前 200 字发给模型。代码在 PR #1,未合并。
  - [Saiharsharudra03/clawd-spinner](https://github.com/Saiharsharudra03/clawd-spinner):按 spinner 动词演 11 种 ASCII 小剧场,不调模型。

## 偏好记录

- 用户用中文交流,喜欢**可爱、贴近官方 Clawd 形象**的风格。
- 每次改完动画,先用 `tools/preview.sh` 出图自查,再请用户在终端里实机看。
