"use client";

import {
  Bookmark, Check, ChevronRight, Clock3, Copy, Download, FileText,
  Hash, LayoutTemplate, Lightbulb, PenLine, RefreshCw, Send,
  ShieldCheck, Smartphone, Sparkles, Trash2, TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

type ContentType = "干货教程" | "好物种草" | "探店体验" | "生活记录";
type Tone = "真诚分享" | "轻松活泼" | "专业清晰" | "温柔治愈";

type Draft = {
  id: string;
  createdAt: string;
  topic: string;
  audience: string;
  keywords: string;
  contentType: ContentType;
  tone: Tone;
  titles: string[];
  selectedTitle: string;
  body: string;
  tags: string[];
};

const STORAGE_KEY = "rednote-studio-drafts-v1";

const contentTypes: Array<{ name: ContentType; icon: string }> = [
  { name: "干货教程", icon: "📝" },
  { name: "好物种草", icon: "🛍️" },
  { name: "探店体验", icon: "📍" },
  { name: "生活记录", icon: "☁️" },
];

const tones: Tone[] = ["真诚分享", "轻松活泼", "专业清晰", "温柔治愈"];
const starterTopics = ["低预算出租屋改造", "通勤快速妆容", "周末城市漫游", "新手健身入门"];
const riskyWords = ["全网第一", "100%", "绝对有效", "永久有效", "暴富", "躺赚", "包治百病"];

function isDraft(value: unknown): value is Draft {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Draft>;
  return typeof item.id === "string" && typeof item.topic === "string" &&
    typeof item.body === "string" && typeof item.selectedTitle === "string" &&
    Array.isArray(item.titles) && item.titles.every((title) => typeof title === "string") &&
    Array.isArray(item.tags) && item.tags.every((tag) => typeof tag === "string") &&
    contentTypes.some((type) => type.name === item.contentType) && tones.includes(item.tone as Tone);
}

const initialDraft: Draft = {
  id: "preview-draft",
  createdAt: "",
  topic: "低预算把出租屋改造成奶油风",
  audience: "刚毕业、独居的女生",
  keywords: "租房改造、低预算、奶油风",
  contentType: "干货教程",
  tone: "真诚分享",
  titles: [
    "租房改造｜3000元住进奶油风小家",
    "低预算改造出租屋，我做对了这5件事",
    "别急着买家具！出租屋改造先做这一步",
    "独居女孩的奶油风小家，温柔又省钱",
    "租房也要好好住｜我的低成本改造清单",
  ],
  selectedTitle: "租房改造｜3000元住进奶油风小家",
  body: "搬进空荡荡的出租屋时，我也没想到只花一顿旅行的钱，就能把它变成现在这个温柔的小家。\n\n先说结论：租房改造真的不用一次买齐，先统一颜色，再慢慢补软装，效果会比堆满家具更好。\n\n01｜先确定一个主色\n我选了奶油白＋浅木色，全屋只保留两种大色块，视觉立刻干净很多。\n\n02｜把预算花在最显眼的地方\n窗帘、地毯和主灯决定了房间的氛围。我把原本的冷白灯换成暖光，晚上回家真的很治愈。\n\n03｜能软装就不硬改\n墙面用无痕贴，旧柜子加一块桌布，退租时也不会心疼。\n\n我的改造清单和预算都整理好了，想看哪一部分可以告诉我，下篇继续拆解～",
  tags: ["租房改造", "低预算改造", "奶油风", "独居生活", "出租屋布置", "我的小家"],
};

function trimTitle(title: string) {
  const characters = Array.from(title);
  return characters.length > 28 ? `${characters.slice(0, 27).join("")}…` : title;
}

function cleanTags(topic: string, keywords: string, contentType: ContentType) {
  const raw = `${keywords}、${topic}`
    .split(/[、,，/\s]+/)
    .map((item) => item.replace(/[#｜|：:。！!？?]/g, "").trim())
    .filter((item) => item.length >= 2 && item.length <= 10);
  const defaults: Record<ContentType, string[]> = {
    干货教程: ["实用干货", "新手友好", "经验分享"],
    好物种草: ["好物分享", "真实测评", "提升幸福感"],
    探店体验: ["周末去哪儿", "城市探店", "氛围感"],
    生活记录: ["生活碎片", "记录生活", "今日份快乐"],
  };
  return Array.from(new Set([...raw, ...defaults[contentType]])).slice(0, 8);
}

function createTitles(topic: string, contentType: ContentType, cycle: number) {
  const groups: Record<ContentType, string[][]> = {
    干货教程: [
      [`${topic}｜新手也能照着做`, `关于${topic}，我总结了这5点`, `别急着开始！${topic}先看这篇`, `${topic}避坑指南，亲测有用`, `从0到1搞定${topic}，步骤都在这`],
      [`${topic}全流程，一篇讲清楚`, `做完${topic}，我最想分享的6件事`, `${topic}没那么难，方法整理好了`, `新手版${topic}，少走弯路`, `收藏这份${topic}实用清单`],
    ],
    好物种草: [
      [`${topic}｜这次真的买对了`, `用了30天，我来认真聊聊${topic}`, `${topic}值不值？优缺点都说清`, `近期幸福感好物：${topic}`, `不是广！${topic}真实使用感受`],
      [`被问爆的${topic}，终于来交作业`, `${topic}测评｜适合谁，不适合谁`, `买前犹豫，买后真香的${topic}`, `${topic}使用一周后的真实想法`, `理性种草${topic}，先看完再决定`],
    ],
    探店体验: [
      [`${topic}｜值得专程来一次吗？`, `藏不住了！${topic}真实体验`, `${topic}打卡攻略，怎么拍都好看`, `周末去${topic}，人均和避坑都在这`, `${topic}探店｜氛围满分，味道呢？`],
      [`${topic}不滤镜测评，值不值得去`, `刚从${topic}回来，说点大实话`, `${topic}半日路线，我替你走好了`, `本地人带路｜${topic}这样玩`, `${topic}拍照机位＋点单清单`],
    ],
    生活记录: [
      [`${topic}｜认真生活的小小证据`, `最近的快乐，是${topic}给的`, `普通的一天，因为${topic}变可爱`, `${topic}，把日子过成喜欢的样子`, `生活碎片｜关于${topic}的温柔记录`],
      [`慢一点，感受${topic}的好`, `${topic}｜今天也有好好生活`, `平凡日常里，被${topic}治愈了`, `记录${topic}，留住小小幸福`, `我的近期生活关键词：${topic}`],
    ],
  };
  return groups[contentType][cycle % 2].map(trimTitle);
}

function createBody(topic: string, audience: string, keywords: string, contentType: ContentType, tone: Tone) {
  const target = audience.trim() || "正在做功课的你";
  const keyList = keywords.split(/[、,，]+/).map((item) => item.trim()).filter(Boolean);
  const keywordSentence = keyList.length ? `这次我主要围绕${keyList.join("、")}来整理。` : "这次把过程和感受都认真整理了一遍。";
  const openings: Record<Tone, string> = {
    真诚分享: `关于${topic}，我前前后后折腾了不少时间。没有夸张滤镜，也不藏缺点，今天把真实体验一次说清。`,
    轻松活泼: `姐妹们，${topic}这件事我终于搞明白了！踩过坑，也捡到过宝，趁热把作业交上来～`,
    专业清晰: `这篇内容会从准备、执行和复盘三个部分拆解${topic}，帮助${target}快速建立清晰思路。`,
    温柔治愈: `慢慢整理${topic}的过程，也是在重新照顾自己的生活。想把这些细小却有用的经验分享给你。`,
  };
  const bodies: Record<ContentType, string> = {
    干货教程: `${openings[tone]}\n\n${keywordSentence}\n\n01｜开始前先想清楚目标\n不要急着照搬别人的答案，先列出自己的需求、预算和不能妥协的部分。方向清楚后，会省下很多重复尝试。\n\n02｜把大目标拆成3个小步骤\n先完成最影响结果的一步，再处理细节。每做完一步就记录变化，过程会轻松很多。\n\n03｜给自己留一点试错空间\n第一次不完美很正常。小范围测试、及时复盘，比一次投入太多更稳妥。\n\n适合${target}直接参考的小清单：\n✓ 明确需求和预算\n✓ 优先解决核心问题\n✓ 记录过程方便复盘\n\n还有哪一步想看更详细的拆解？留言告诉我，下篇继续写～`,
    好物种草: `${openings[tone]}\n\n${keywordSentence}\n\n先说我的使用背景：我是${target}，所以更在意实际体验和长期使用感，而不是刚拆箱时的惊艳。\n\n让我满意的地方\n✓ 上手门槛低，日常使用很顺手\n✓ 细节设计比预想中贴心\n✓ 放进真实生活里，不会增加负担\n\n需要提前知道的地方\n它并不是适合所有人。如果你更看重极致性能，或者使用频率很低，建议先想清楚需求，不必跟风。\n\n我的结论：先看场景，再看预算。适合自己的才是真正的好物。想看具体参数或使用细节，我可以再单独整理一篇。`,
    探店体验: `${openings[tone]}\n\n${keywordSentence}\n\n📍体验速览\n环境：有自己的风格，非高峰时段更舒服\n服务：整体自然，不会过度打扰\n体验：亮点和不足都很明显\n\n我的建议路线\n先从最有代表性的区域开始，再慢慢逛周边。想拍照的话，尽量避开正午，傍晚的光线更柔和。\n\n适合${target}，如果只是匆匆打卡可能会有点可惜。价格、路线和我的真实感受都写在图里了，出发前记得再确认营业时间～`,
    生活记录: `${openings[tone]}\n\n${keywordSentence}\n\n最近我开始把注意力放回日常：认真吃一顿饭、收拾好房间、出门看看天色。看起来都是小事，却一点点把生活的节奏找了回来。\n\n${topic}没有让我突然变成更厉害的人，但它提醒我，普通日子也值得被认真对待。\n\n分享给${target}：不必等到一切准备好再开始。今天做一件让自己舒服的小事，就已经很棒了。\n\n把这段日常留在这里，也祝刷到这篇笔记的你，今天有一个小小的好消息。`,
  };
  return bodies[contentType];
}

function buildDraft(topic: string, audience: string, keywords: string, contentType: ContentType, tone: Tone, cycle: number): Draft {
  const cleanTopic = topic.trim() || "我的真实体验";
  const titles = createTitles(cleanTopic, contentType, cycle);
  return {
    id: `${Date.now()}-${cycle}`, createdAt: new Date().toISOString(), topic: cleanTopic,
    audience, keywords, contentType, tone, titles, selectedTitle: titles[0],
    body: createBody(cleanTopic, audience, keywords, contentType, tone),
    tags: cleanTags(cleanTopic, keywords, contentType),
  };
}

function scoreDraft(draft: Draft) {
  const titleLength = Array.from(draft.selectedTitle).length;
  const bodyLength = Array.from(draft.body).length;
  const riskyMatches = riskyWords.filter((word) => `${draft.selectedTitle}${draft.body}`.includes(word));
  const keywordList = draft.keywords.split(/[、,，]+/).filter(Boolean);
  const keywordHit = keywordList.length === 0 || keywordList.some((keyword) => draft.body.includes(keyword.trim()));
  const titleScore = Math.max(58, Math.min(98, 72 + (/\d/.test(draft.selectedTitle) ? 8 : 0) + (/[？?！!｜|]/.test(draft.selectedTitle) ? 7 : 0) + (titleLength <= 24 ? 8 : -6)));
  const structureScore = Math.max(60, Math.min(98, 68 + (draft.body.includes("01｜") ? 12 : 0) + (bodyLength >= 220 ? 10 : 0) + (draft.body.includes("✓") ? 6 : 0)));
  const overall = Math.round(titleScore * 0.45 + structureScore * 0.4 + (riskyMatches.length ? 62 : 95) * 0.15);
  return { titleLength, bodyLength, riskyMatches, keywordHit, titleScore, structureScore, overall };
}

export function RedNoteStudio() {
  const [topic, setTopic] = useState(initialDraft.topic);
  const [audience, setAudience] = useState(initialDraft.audience);
  const [keywords, setKeywords] = useState(initialDraft.keywords);
  const [contentType, setContentType] = useState<ContentType>(initialDraft.contentType);
  const [tone, setTone] = useState<Tone>(initialDraft.tone);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [history, setHistory] = useState<Draft[]>([]);
  const [generationCycle, setGenerationCycle] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeNav, setActiveNav] = useState("创作工作台");

  useEffect(() => {
    let timer: number | undefined;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        const validDrafts = Array.isArray(parsed) ? parsed.filter(isDraft).slice(0, 8) : [];
        timer = window.setTimeout(() => setHistory(validDrafts), 0);
      }
    } catch { /* 本地存储不可用时，创作功能仍可正常使用。 */ }
    return () => { if (timer) window.clearTimeout(timer); };
  }, []);

  const metrics = useMemo(() => scoreDraft(draft), [draft]);

  const updateHistory = (items: Draft[]) => {
    setHistory(items);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  };

  const generate = () => {
    const nextCycle = generationCycle + 1;
    setGenerationCycle(nextCycle);
    setDraft(buildDraft(topic, audience, keywords, contentType, tone, nextCycle));
    setSaved(false);
  };

  const saveDraft = () => {
    const savedDraft = { ...draft, createdAt: new Date().toISOString(), id: draft.id === "preview-draft" ? `${Date.now()}-saved` : draft.id };
    updateHistory([savedDraft, ...history.filter((item) => item.id !== savedDraft.id)].slice(0, 8));
    setDraft(savedDraft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const copyText = async (value: string, label: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const helper = document.createElement("textarea");
        helper.value = value;
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        helper.remove();
      }
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1600);
    } catch { setCopied(null); }
  };

  const copyAll = () => void copyText(`${draft.selectedTitle}\n\n${draft.body}\n\n${draft.tags.map((tag) => `#${tag}`).join(" ")}`, "全部");

  const exportDraft = () => {
    const text = `${draft.selectedTitle}\n\n${draft.body}\n\n${draft.tags.map((tag) => `#${tag}`).join(" ")}`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    const safeName = (draft.topic || "小红书笔记").replace(/[<>:"/\\|?*]/g, "-").slice(0, 40);
    link.download = `${safeName}.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const loadDraft = (item: Draft) => {
    setDraft(item); setTopic(item.topic); setAudience(item.audience); setKeywords(item.keywords);
    setContentType(item.contentType); setTone(item.tone);
  };

  const navigation = [
    { label: "创作工作台", icon: PenLine, target: "creation-workbench" },
    { label: "标题灵感", icon: TrendingUp, target: "title-ideas" },
    { label: "标签助手", icon: Hash, target: "tag-helper" },
    { label: "内容检查", icon: ShieldCheck, target: "content-check" },
  ];

  const navigateTo = (label: string, target: string) => {
    setActiveNav(label);
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="xhs-shell">
      <aside className="xhs-sidebar">
        <div className="xhs-brand">
          <div className="xhs-brand-mark"><Sparkles size={20} /></div>
          <div><strong>薯光</strong><span>REDNOTE STUDIO</span></div>
        </div>
        <nav className="xhs-nav" aria-label="主要功能">
          <p className="xhs-nav-label">创作工具</p>
          {navigation.map((item) => {
            const Icon = item.icon;
            return <button className={activeNav === item.label ? "active" : ""} key={item.label} onClick={() => navigateTo(item.label, item.target)} type="button"><Icon size={18} /><span>{item.label}</span></button>;
          })}
        </nav>
        <div className="xhs-sidebar-section">
          <div className="xhs-section-heading"><span>最近草稿</span><span className="xhs-count">{history.length}</span></div>
          <div className="xhs-history-list">
            {history.length === 0 ? <div className="xhs-empty-history"><Clock3 size={17} /><span>保存后会出现在这里</span></div> : history.slice(0, 5).map((item) => (
              <div className="xhs-history-item" key={item.id}>
                <button type="button" onClick={() => loadDraft(item)}><span>{item.topic}</span><small>{item.contentType} · {new Date(item.createdAt).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}</small></button>
                <button className="xhs-delete" type="button" aria-label="删除草稿" onClick={() => updateHistory(history.filter((draftItem) => draftItem.id !== item.id))}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
        <div className="xhs-sidebar-tip"><div className="xhs-tip-icon"><Lightbulb size={17} /></div><div><strong>创作小贴士</strong><p>标题先给结果，正文再讲过程，读者更容易停留。</p></div></div>
      </aside>

      <main className="xhs-main">
        <header className="xhs-topbar">
          <div><span className="xhs-eyebrow">CONTENT WORKSPACE</span><h1>{activeNav}</h1></div>
          <div className="xhs-top-actions">
            <span className="xhs-local-status"><span /> 已在本机保存</span>
            <button className="xhs-ghost-button" type="button" onClick={exportDraft}><Download size={17} /> 导出</button>
            <button className="xhs-save-button" type="button" onClick={saveDraft}>{saved ? <Check size={17} /> : <Bookmark size={17} />}{saved ? "已保存" : "保存草稿"}</button>
          </div>
        </header>

        <section className="xhs-intro">
          <div><div className="xhs-intro-pill"><Sparkles size={14} /> 从一个想法，到一篇完整笔记</div><h2>今天想分享什么？</h2><p>输入你的主题，快速获得标题、正文结构和标签建议。</p></div>
          <div className="xhs-intro-decoration" aria-hidden="true"><span>01</span><span>灵感</span><span>成稿</span></div>
        </section>

        <div className="xhs-workspace">
          <section className="xhs-editor-column">
            <div className="xhs-panel xhs-input-panel" id="creation-workbench">
              <div className="xhs-panel-heading"><div><span className="xhs-step">01</span><h3>告诉我你的创作想法</h3></div><span className="xhs-engine-tag">结构化创作引擎</span></div>
              <label className="xhs-field"><span>内容主题 <em>必填</em></span><textarea value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="例如：第一次去青岛旅行的真实感受" maxLength={60} /><small>{Array.from(topic).length}/60</small></label>
              <div className="xhs-starters"><span>试试这些：</span>{starterTopics.map((item) => <button type="button" key={item} onClick={() => setTopic(item)}>{item}</button>)}</div>
              <div className="xhs-field"><span>内容类型</span><div className="xhs-type-grid">{contentTypes.map((item) => <button className={contentType === item.name ? "active" : ""} key={item.name} type="button" onClick={() => setContentType(item.name)}><span>{item.icon}</span>{item.name}{contentType === item.name && <Check size={14} />}</button>)}</div></div>
              <div className="xhs-two-fields"><label className="xhs-field"><span>目标读者</span><input value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="谁会喜欢这篇内容？" /></label><label className="xhs-field"><span>关键词</span><input value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="用顿号分隔关键词" /></label></div>
              <div className="xhs-field"><span>表达语气</span><div className="xhs-tone-row">{tones.map((item) => <button className={tone === item ? "active" : ""} type="button" key={item} onClick={() => setTone(item)}>{item}</button>)}</div></div>
              <button className="xhs-generate" type="button" onClick={generate} disabled={!topic.trim()}><Sparkles size={19} /> 生成完整笔记 <ChevronRight size={18} /></button>
              <p className="xhs-privacy"><ShieldCheck size={14} /> 内容仅在你的浏览器中处理和保存</p>
            </div>

            <div className="xhs-panel xhs-result-panel" id="title-ideas">
              <div className="xhs-panel-heading"><div><span className="xhs-step">02</span><h3>挑选一个标题</h3></div><button className="xhs-text-button" type="button" onClick={generate}><RefreshCw size={15} /> 换一组</button></div>
              <div className="xhs-title-list">{draft.titles.map((title, index) => <button className={draft.selectedTitle === title ? "selected" : ""} key={`${title}-${index}`} type="button" onClick={() => setDraft({ ...draft, selectedTitle: title })}><span className="xhs-title-index">{String(index + 1).padStart(2, "0")}</span><span className="xhs-title-copy">{title}<small>{Array.from(title).length} 字</small></span><span className="xhs-title-check">{draft.selectedTitle === title && <Check size={15} />}</span></button>)}</div>
              <div className="xhs-body-heading"><div><span className="xhs-step">03</span><h3>编辑正文</h3></div><button className="xhs-text-button" type="button" onClick={() => void copyText(draft.body, "正文")}>{copied === "正文" ? <Check size={15} /> : <Copy size={15} />}{copied === "正文" ? "已复制" : "复制正文"}</button></div>
              <textarea aria-label="笔记正文" className="xhs-body-editor" value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} />
              <div className="xhs-body-meta"><span>{metrics.bodyLength} 字</span><span>建议 300–800 字</span></div>
              <div className="xhs-tags-heading" id="tag-helper"><h4><Hash size={16} /> 推荐标签</h4><span>{draft.tags.length} 个</span></div>
              <div className="xhs-tag-list">{draft.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
            </div>
          </section>

          <aside className="xhs-preview-column">
            <div className="xhs-preview-sticky">
              <div className="xhs-preview-header"><div><Smartphone size={17} /><strong>发布预览</strong></div><span>小红书风格</span></div>
              <div className="xhs-phone">
                <div className="xhs-phone-bar"><span>9:41</span><span className="xhs-phone-island" /><span>•••</span></div>
                <div className="xhs-cover"><div className="xhs-cover-orbit orbit-one" /><div className="xhs-cover-orbit orbit-two" /><span className="xhs-cover-kicker">{draft.contentType} · {draft.tone}</span><h3>{draft.topic}</h3><p>把喜欢的生活，认真分享给你</p><div className="xhs-cover-stamp">RED<br />NOTE</div></div>
                <div className="xhs-note-preview"><div className="xhs-author-row"><span className="xhs-avatar">薯</span><div><strong>认真生活研究所</strong><small>刚刚</small></div><button type="button">关注</button></div><h4>{draft.selectedTitle}</h4><p>{draft.body}</p><div className="xhs-preview-tags">{draft.tags.slice(0, 5).map((tag) => <span key={tag}>#{tag}</span>)}</div></div>
                <div className="xhs-phone-actions"><span>♡ 1,268</span><span>☆ 386</span><span>◯ 92</span><Send size={16} /></div>
              </div>

              <div className="xhs-score-card">
                <div className="xhs-score-top"><div><span>内容完成度</span><strong>{metrics.overall}<small>/100</small></strong></div><div className="xhs-score-ring" style={{ "--score": `${metrics.overall * 3.6}deg` } as CSSProperties}><Sparkles size={18} /></div></div>
                <div className="xhs-score-bars"><div><span>标题吸引力</span><i><b style={{ width: `${metrics.titleScore}%` }} /></i><em>{metrics.titleScore}</em></div><div><span>正文结构</span><i><b style={{ width: `${metrics.structureScore}%` }} /></i><em>{metrics.structureScore}</em></div></div>
              </div>

              <div className="xhs-check-card" id="content-check"><div className="xhs-check-heading"><ShieldCheck size={17} /><strong>发布前检查</strong></div><div className="xhs-check-list"><div className={metrics.titleLength <= 28 ? "pass" : "warn"}><span>{metrics.titleLength <= 28 ? <Check size={13} /> : "!"}</span><p>标题长度<strong>{metrics.titleLength} 字</strong></p></div><div className={metrics.keywordHit ? "pass" : "warn"}><span>{metrics.keywordHit ? <Check size={13} /> : "!"}</span><p>关键词布局<strong>{metrics.keywordHit ? "已覆盖" : "待补充"}</strong></p></div><div className={metrics.riskyMatches.length === 0 ? "pass" : "warn"}><span>{metrics.riskyMatches.length === 0 ? <Check size={13} /> : "!"}</span><p>高风险用语<strong>{metrics.riskyMatches.length === 0 ? "未发现" : metrics.riskyMatches.join("、")}</strong></p></div></div></div>
              <button className="xhs-copy-all" type="button" onClick={copyAll}>{copied === "全部" ? <Check size={18} /> : <Copy size={18} />}{copied === "全部" ? "整篇笔记已复制" : "复制整篇笔记"}</button>
            </div>
          </aside>
        </div>

        <footer className="xhs-footer"><div><LayoutTemplate size={16} /> 薯光内容工作台</div><p>非小红书官方产品 · <a href="/privacy">隐私说明</a> · 请在发布前核实内容与平台规范</p><div><FileText size={15} /> 草稿仅保存在本机</div></footer>
      </main>
    </div>
  );
}
