export type NoteDraft = {
  topic: string;
  selectedTitle: string;
  body: string;
  tags: string[];
  contentType: string;
  tone: string;
};

export function getMiniTool() {
  const miniTool = window.xhs?.miniTool;
  if (!miniTool || typeof miniTool.postNote !== "function") return null;
  return miniTool;
}

export function clipChars(text: string, max: number) {
  const chars = Array.from(text);
  return chars.length <= max ? text : chars.slice(0, max).join("");
}

export function formatFullNote(draft: NoteDraft) {
  const tags = draft.tags.map((tag) => `#${tag}`).join(" ");
  return `${draft.selectedTitle}\n\n${draft.body}\n\n${tags}`.trim();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const chars = Array.from(text);
  const lines: string[] = [];
  let current = "";
  for (const char of chars) {
    const next = `${current}${char}`;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = char;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 5);
}

export function renderCoverDataUrl(draft: NoteDraft) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1200;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const gradient = ctx.createLinearGradient(0, 0, 900, 1200);
  gradient.addColorStop(0, "#f06a62");
  gradient.addColorStop(0.55, "#ee4d45");
  gradient.addColorStop(1, "#c83732");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 900, 1200);

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.arc(760, 160, 210, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(800, 220, 130, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(790, 180, 220, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "28px sans-serif";
  ctx.fillText(`${draft.contentType} · ${draft.tone}`, 72, 150);

  ctx.font = "bold 72px serif";
  const titleLines = wrapText(ctx, draft.topic || draft.selectedTitle, 740);
  titleLines.forEach((line, index) => {
    ctx.fillText(line, 72, 280 + index * 92);
  });

  ctx.font = "32px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.fillText("把喜欢的生活，认真分享给你", 72, 280 + titleLines.length * 92 + 36);

  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.arc(780, 1040, 56, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "22px serif";
  ctx.textAlign = "center";
  ctx.fillText("RED", 780, 1034);
  ctx.fillText("NOTE", 780, 1062);
  ctx.textAlign = "left";

  ctx.font = "24px sans-serif";
  ctx.fillText("薯光 · 内容工作台", 72, 1108);

  return canvas.toDataURL("image/jpeg", 0.88);
}
