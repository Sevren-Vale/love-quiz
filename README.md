# LoveQuiz · 关于喜欢你的15道小问题

一份可以用手机打开的小惊喜。15 道题，每题三个选项，每个选项触发不同的原创 SVG 互动。测试根据真实答案计算四种恋爱人格之一，并选出三条专属回忆。最后可以亲手拆开隐藏情书。

用原生 HTML、CSS、JavaScript ES Modules、SVG 和 Web Animations API 实现。上线时只需要静态托管，无构建和第三方依赖。答题进度只保存在当前浏览器，可修改、回顾和重填。分享包含人格名称和链接。

## 本地启动

在 PowerShell 中运行以下命令，再打开 [本地预览](http://127.0.0.1:5500/)。

```powershell
Set-Location 'D:\Projects\AIProjects\LoveQuiz'
node scripts/serve.mjs
```

本机已用 Node.js 24 运行。浏览器通过 HTTP 加载 ES Modules，直接双击 HTML 可能白屏。默认只接受本机请求。

## 测试

```powershell
node --test tests/logic.test.mjs tests/browser.test.mjs
```

逻辑测试检查题目、互动映射、计分、平局与状态恢复。浏览器测试启动本机 Chrome，通过 DevTools 协议访问本地临时服务器，覆盖全部 45 个场景启动、快速切换、自然清理、完整答题与拆信流程、刷新恢复、修改、重测和手动分享回退。它还在 GitHub Pages 风格的 /love-quiz/ 子路径下检查资源，并检查多个视口宽度。Chrome 安装在其他位置时，可以在当前 PowerShell 会话将 LOVEQUIZ_CHROME 指向其可执行文件。

## 文件与修改入口

```text
LoveQuiz/
├── index.html
├── assets/icons/heart.svg
├── css/
│   ├── variables.css       主题色、字体、圆角
│   ├── style.css           布局、移动端样式
│   └── animations.css      页面、信封和背景动效
├── js/
│   ├── config.js           站名、首页文案、署名、时长
│   ├── questions.js        题目、选项、人格映射、回忆
│   ├── results.js          计分、四种人格、情书正文
│   ├── art.js              原创 SVG 图形
│   ├── effects.js          45 个场景与动画调度
│   ├── state.js            页面流转、恢复校验和持久化
│   ├── ui.js               页面与对话框模板
│   └── main.js             事件、页面切换、分享
├── scripts/serve.mjs       开发用 HTTP 服务器
├── tests/
│   ├── logic.test.mjs
│   └── browser.test.mjs
├── package.json
├── .gitignore
├── .nojekyll
├── README.md
└── CHANGELOG.md
```

- 改题目时，编辑 questions.js 每行的主题、题干和三个选项。末尾三字母按 A/B/C 映射人格，S 为甜心，T 为捣蛋鬼，R 为幻想家，W 为守护者。第 3、7、14 题的回忆要随选项文案一起改。
- 改互动时，在 effects.js 搜索 Q01_A 等编号。每个场景记录提示语、绘图对象和关键帧，图形在 art.js 中定义。
- 改人格或情书正文时，编辑 results.js。站名、副标题、情书标题和署名在 config.js。修改站名后也可同步改 index.html 的初始标题与简介。
- 改配色时，从 css/variables.css 的变量入手。

## GitHub Pages 发布与更新

1. 登录 [GitHub 新建仓库](https://github.com/new)，创建空的公开仓库 love-quiz，描述填写 “A tiny interactive love quiz made with love.”。如果同名仓库已存在，先确认它就是这个项目。公开部署会公开情书正文源码，答题记录仍留在访问者浏览器。
2. 在项目目录关联刚创建的仓库并推送。本次工作区检测到的账号为 Sevren-Vale。若你使用其他账号，改用新仓库的实际地址。首次推送时，按 Git Credential Manager 提示在官方浏览器页面登录。

```powershell
git remote add origin https://github.com/Sevren-Vale/love-quiz.git
git push -u origin main
```

3. 打开仓库 Settings → Pages。Source 选 Deploy from a branch，分支选 main，目录选 /(root)，保存。等 Actions 中的部署成功，从 Pages 设置复制实际链接。参见 [GitHub Pages 官方配置](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。
4. 日后修改文件，先运行测试，再用 git add 添加改过的文件，git commit 提交，git push 更新 main。等待 Pages 重新发布后打开线上地址验证。

### 白屏、404 与手机检查

本地白屏时先确认通过 HTTP 访问，检查浏览器控制台与 Network 面板。线上 404 时，检查 Pages 的部署状态、分支和目录，确认该分支根目录存在 index.html 和 .nojekyll。若首页能开但样式或按钮失效，查看相对路径资源是否 404，文件大小写要一致。

用手机打开 Pages 页面给出的实际网址，点开始、选一次答案、刷新确认续答，再完成测试并拆信。发送前用目标手机的网络检查，尤其是从 Wi-Fi 切换到移动数据后。若目标网络访问不稳定，可保留 Pages 版，把同一静态文件放到目标网络可用的静态托管服务。

同一 Wi-Fi 本地联调时，可以在当前 PowerShell 会话设置 `$env:LOVEQUIZ_HOST='0.0.0.0'` 后启动预览，用手机打开电脑局域网 IP 加端口 5500。此方式取决于已有网络和防火墙规则。
