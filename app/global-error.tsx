"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="zh-CN">
      <body>
        <main className="xhs-error-state">
          <div className="xhs-brand-mark">薯</div>
          <h1>刚刚走神了一下</h1>
          <p>你的本地草稿没有被删除。可以重新加载工作台后继续创作。</p>
          <button type="button" onClick={reset}>重新加载</button>
        </main>
      </body>
    </html>
  );
}
