import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RedNoteStudio } from "../components/RedNoteStudio";
import "../app/globals.css";

function PrivacyPage() {
  return (
    <main className="xhs-legal">
      <a className="xhs-legal-back" href="/">← 返回创作工作台</a>
      <article>
        <span className="xhs-legal-kicker">PRIVACY</span>
        <h1>隐私说明</h1>
        <p className="xhs-legal-updated">更新日期：2026 年 8 月 29 日</p>
        <section>
          <h2>你的内容留在哪里</h2>
          <p>薯光当前使用内置的结构化创作引擎。你输入的主题、读者、关键词以及保存的草稿，都只保存在当前浏览器的本地存储中，不会上传到我们的服务器。</p>
        </section>
        <section>
          <h2>我们不收集什么</h2>
          <p>当前版本不要求注册账号，不收集姓名、手机号、邮箱、支付信息，也不使用广告追踪或跨站画像。</p>
        </section>
        <section>
          <h2>如何删除数据</h2>
          <p>你可以在工作台左侧删除单篇草稿，也可以通过浏览器设置清除本网站的本地存储。清除浏览器数据后，草稿无法恢复。</p>
        </section>
        <section>
          <h2>内容责任</h2>
          <p>生成结果用于辅助创作。发布前请核实事实、版权、广告表达与平台规范。薯光不是小红书官方产品。小工具版本在离线容器中运行，不会向外部服务器发送草稿。</p>
        </section>
      </article>
    </main>
  );
}

const isPrivacyPage = window.location.pathname.replace(/\/+$/, "") === "/privacy";

createRoot(document.getElementById("root")!).render(
  <StrictMode>{isPrivacyPage ? <PrivacyPage /> : <RedNoteStudio />}</StrictMode>,
);
