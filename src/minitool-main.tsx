import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RedNoteStudio } from "../components/RedNoteStudio";
import "../app/globals.css";

document.documentElement.classList.add("minitool");
document.documentElement.lang = "zh-CN";

const root = document.getElementById("root");
if (!root) throw new Error("missing #root");

createRoot(root).render(
  <StrictMode>
    <RedNoteStudio />
  </StrictMode>,
);
