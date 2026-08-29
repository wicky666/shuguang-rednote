# 薯光 · 小红书内容创作工作台

一个本地优先的小红书内容创作工具。从选题到成稿，集中完成标题生成、正文结构化、标签推荐、内容评分、风险词检查和手机端发布预览。生产版本运行在 OpenAI Sites / Cloudflare Workers 上，创作内容仍只保存在用户自己的浏览器中。

## 已实现功能

- 四种内容类型：干货教程、好物种草、探店体验、生活记录
- 四种表达语气：真诚分享、轻松活泼、专业清晰、温柔治愈
- 每次生成 5 个标题候选，并实时计算标题长度与吸引力
- 可直接编辑的结构化正文与推荐标签
- 小红书风格封面和笔记手机预览
- 标题、正文结构、关键词及高风险用语检查
- 一键复制整篇笔记、导出 TXT
- localStorage 本地草稿保存、恢复与删除
- 桌面端、平板和手机端响应式布局

## 启动项目

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

生产构建：

```bash
npm run build
npm start
```

## 技术说明

- Vinext + React 19 + TypeScript
- Tailwind CSS 4（基础主题）+ 自定义响应式设计
- lucide-react 图标
- 当前版本使用内置结构化创作引擎，不依赖外部 API
- 草稿仅保存在使用者浏览器中
- OpenAI Sites / Cloudflare Workers 兼容构建

> 本项目不是小红书官方产品。发布前请自行核实内容事实与平台最新规范。
