import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import katex from "katex";

/**
 * Convert Markdown text (with KaTeX delimiters and GFM tables) to clean HTML for PDF rendering.
 */
function markdownToHtmlForPdf(rawText) {
  if (!rawText) return "";

  let text = rawText
    .replace(/[\uE000-\uF8FF\uFFF0-\uFFFF]/g, "")
    .replace(/\[?\s*(?:source|Source)\s*\[?\s*\d+\s*\]?\s*\]?|\(\s*(?:source|Source)\s*\d+\s*\)|\[\d+\]/gi, "")
    .trim();

  // 1. Math block display: \[ ... \] or $$ ... $$
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (match, eq) => {
    try {
      return `<div class="katex-block">${katex.renderToString(eq.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch {
      return `<div class="katex-block"><code>${eq.trim()}</code></div>`;
    }
  });
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, eq) => {
    try {
      return `<div class="katex-block">${katex.renderToString(eq.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch {
      return `<div class="katex-block"><code>${eq.trim()}</code></div>`;
    }
  });

  // 2. Math inline: \( ... \) or $ ... $
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (match, eq) => {
    try {
      return `<span class="katex-inline">${katex.renderToString(eq.trim(), { displayMode: false, throwOnError: false })}</span>`;
    } catch {
      return `<code>${eq.trim()}</code>`;
    }
  });
  text = text.replace(/\$([^\$\n]+?)\$/g, (match, eq) => {
    try {
      return `<span class="katex-inline">${katex.renderToString(eq.trim(), { displayMode: false, throwOnError: false })}</span>`;
    } catch {
      return `<code>${eq.trim()}</code>`;
    }
  });

  // 3. Convert markdown tables
  text = text.replace(/(?:^|\n)(\|.+?\|\n\|[-:\s|]+\|\n(?:\|.+?\|\n?)+)/g, (match, tableBlock) => {
    const lines = tableBlock.trim().split("\n");
    if (lines.length < 2) return match;
    const headerRow = lines[0].split("|").filter((c, i, a) => i > 0 && i < a.length - 1).map((c) => c.trim());
    const bodyRows = lines.slice(2).map((r) => r.split("|").filter((c, i, a) => i > 0 && i < a.length - 1).map((c) => c.trim()));

    const thead = `<thead><tr>${headerRow.map((h) => `<th>${h}</th>`).join("")}</tr></thead>`;
    const tbody = `<tbody>${bodyRows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>`;
    return `\n\n<div class="table-container"><table class="pdf-table">${thead}${tbody}</table></div>\n\n`;
  });

  // 4. Headers (#, ##, ###, ####)
  text = text.replace(/^####\s+(.*$)/gim, "<h4>$1</h4>");
  text = text.replace(/^###\s+(.*$)/gim, "<h3>$1</h3>");
  text = text.replace(/^##\s+(.*$)/gim, "<h2>$1</h2>");
  text = text.replace(/^#\s+(.*$)/gim, "<h1>$1</h1>");

  // 5. Bold & Italic
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

  // 6. Blockquotes
  text = text.replace(/^>\s+(.*$)/gim, "<blockquote>$1</blockquote>");

  // 7. Bullet & Numbered lists
  text = text.replace(/^\s*[\-\*•]\s+(.*$)/gim, "<li>$1</li>");
  text = text.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
  text = text.replace(/<\/ul>\s*<ul>/g, "");

  // 8. Paragraphs
  const paragraphs = text.split(/\n{2,}/);
  text = paragraphs
    .map((p) => {
      p = p.trim();
      if (!p) return "";
      if (
        p.startsWith("<h") ||
        p.startsWith("<div") ||
        p.startsWith("<ul") ||
        p.startsWith("<table") ||
        p.startsWith("<blockquote")
      ) {
        return p;
      }
      return `<p>${p.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  return text;
}

/**
 * Generate shared CSS styles for high-fidelity PDF rendering
 */
function getPdfContainerStyles() {
  return `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Devanagari', 'Hindi Sangam MN', Arial, sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    width: 794px;
    padding: 32px 36px;
    box-sizing: border-box;
    line-height: 1.7;
    font-size: 13.5px;
  `;
}

/**
 * Export single Q&A Response to High-Resolution PDF
 */
export async function exportMessageToPdf({
  question,
  text,
  timestamp,
  references = [],
  isHindi = false,
}) {
  if (!text && !question) return;

  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: -9999px;
    z-index: -1000;
    ${getPdfContainerStyles()}
  `;

  const headerTitle = isHindi
    ? "भारत मौसम विज्ञान विभाग — मौसम प्रशिक्षण संस्थान (MTI)"
    : "India Meteorological Department — Meteorological Training Institute (MTI)";

  const headerSubtitle = isHindi
    ? "आधिकारिक प्रश्नोत्तर एवं अनुसंधान रिपोर्ट | MTI Knowledge Assistant"
    : "Official Meteorological Knowledge & Research Report | MTI Knowledge Assistant";

  const questionLabel = isHindi ? "📌 प्रश्न (User Question):" : "📌 User Question:";
  const answerLabel = isHindi
    ? "📖 MTI सहायक का उत्तर (Official Scientific Response):"
    : "📖 Official Meteorological Response:";
  const referencesLabel = isHindi ? "📚 संदर्भित साहित्य (References):" : "📚 Document References:";
  const footerWatermark = isHindi
    ? "मौसम प्रशिक्षण संस्थान (IMD) • आधिकारिक ज्ञान प्रणाली"
    : "Meteorological Training Institute (IMD) • Official Knowledge System";

  const generatedTime = timestamp || new Date().toLocaleString("en-IN");
  const renderedAnswerHtml = markdownToHtmlForPdf(text);
  const renderedQuestionHtml = markdownToHtmlForPdf(question);

  container.innerHTML = `
    <style>
      .pdf-header {
        background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
        color: #ffffff;
        padding: 16px 20px;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      .pdf-header h1 {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 800;
        letter-spacing: 0.01em;
      }
      .pdf-header p {
        margin: 0;
        font-size: 11px;
        opacity: 0.92;
      }
      .pdf-meta {
        font-size: 10.5px;
        color: #64748b;
        margin-bottom: 16px;
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 8px;
      }
      .pdf-section-title {
        font-size: 12.5px;
        font-weight: 750;
        color: #1d4ed8;
        margin-top: 14px;
        margin-bottom: 8px;
      }
      .pdf-question-box {
        background-color: #f8fafc;
        border-left: 4px solid #2563eb;
        border-top: 1px solid #e2e8f0;
        border-right: 1px solid #e2e8f0;
        border-bottom: 1px solid #e2e8f0;
        border-radius: 0 6px 6px 0;
        padding: 12px 16px;
        margin-bottom: 20px;
        font-size: 13px;
        color: #0f172a;
      }
      .pdf-answer-box {
        color: #1e293b;
        line-height: 1.75;
      }
      .pdf-answer-box h1 { font-size: 15px; font-weight: 800; color: #0f172a; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px; margin-top: 18px; margin-bottom: 8px; }
      .pdf-answer-box h2 { font-size: 14px; font-weight: 750; color: #1e293b; border-bottom: 1px solid #f1f5f9; padding-bottom: 3px; margin-top: 16px; margin-bottom: 6px; }
      .pdf-answer-box h3 { font-size: 13.5px; font-weight: 700; color: #1e293b; margin-top: 14px; margin-bottom: 6px; }
      .pdf-answer-box h4 { font-size: 12.5px; font-weight: 650; color: #334155; margin-top: 12px; margin-bottom: 4px; }
      .pdf-answer-box p { margin: 6px 0; }
      .pdf-answer-box ul { padding-left: 20px; margin: 6px 0; }
      .pdf-answer-box li { margin-bottom: 4px; }
      .pdf-answer-box blockquote { border-left: 3.5px solid #2563eb; background: rgba(37, 99, 235, 0.05); padding: 8px 12px; margin: 10px 0; font-style: italic; border-radius: 0 6px 6px 0; }
      .pdf-answer-box code { font-family: Consolas, Monaco, monospace; font-size: 12px; background: #f1f5f9; padding: 2px 5px; border-radius: 4px; color: #1d4ed8; }
      
      .table-container {
        margin: 16px 0;
        overflow-x: hidden;
      }
      .pdf-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        text-align: left;
        border: 1px solid #cbd5e1;
      }
      .pdf-table th {
        background-color: #f1f5f9;
        font-weight: 750;
        color: #0f172a;
        padding: 9px 12px;
        border: 1px solid #cbd5e1;
      }
      .pdf-table td {
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
        color: #334155;
        vertical-align: top;
      }
      .pdf-table tr:nth-child(even) td {
        background-color: #f8fafc;
      }

      .katex-block {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 10px 14px;
        margin: 12px 0;
        text-align: center;
      }
      .katex-inline {
        padding: 0 2px;
      }

      .pdf-references {
        margin-top: 24px;
        padding-top: 12px;
        border-top: 1px dashed #cbd5e1;
      }
      .pdf-references ul {
        padding-left: 18px;
        margin: 6px 0;
        font-size: 11.5px;
        color: #475569;
      }
      .pdf-footer {
        margin-top: 30px;
        padding-top: 10px;
        border-top: 1px solid #e2e8f0;
        font-size: 10px;
        color: #94a3b8;
        display: flex;
        justify-content: space-between;
      }
    </style>

    <div class="pdf-header">
      <h1>${headerTitle}</h1>
      <p>${headerSubtitle}</p>
    </div>

    <div class="pdf-meta">
      <span><strong>Date & Time:</strong> ${generatedTime}</span>
      <span><strong>Document Type:</strong> Official RAG Synthesis</span>
    </div>

    ${
      question && question.trim()
        ? `
      <div class="pdf-section-title">${questionLabel}</div>
      <div class="pdf-question-box">${renderedQuestionHtml}</div>
    `
        : ""
    }

    <div class="pdf-section-title">${answerLabel}</div>
    <div class="pdf-answer-box">${renderedAnswerHtml}</div>

    ${
      references && references.length > 0
        ? `
      <div class="pdf-references">
        <div class="pdf-section-title" style="font-size: 11.5px; margin-top: 0;">${referencesLabel}</div>
        <ul>
          ${references.map((ref) => `<li>${ref}</li>`).join("")}
        </ul>
      </div>
    `
        : ""
    }

    <div class="pdf-footer">
      <span>${footerWatermark}</span>
      <span>IMD Meteorological Training Institute</span>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const doc = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    let heightLeft = contentHeight;
    let position = margin;

    // First page
    doc.addImage(imgData, "JPEG", margin, position, contentWidth, contentHeight);
    heightLeft -= pageHeight - margin * 2;

    // Subsequent pages if content overflows A4 height
    while (heightLeft > 0) {
      position = heightLeft - contentHeight + margin;
      doc.addPage();
      doc.addImage(imgData, "JPEG", margin, position, contentWidth, contentHeight);
      heightLeft -= pageHeight - margin * 2;
    }

    const cleanDate = new Date().toISOString().slice(0, 10);
    const langTag = isHindi ? "Hindi" : "EN";
    const filename = `MTI_QA_Report_${cleanDate}_${langTag}_${Date.now().toString().slice(-4)}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error("High-fidelity PDF export failed, using standard fallback:", err);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Export full conversation thread to PDF
 */
export async function exportFullConversationToPdf({
  threadTitle = "Active Conversation",
  messages = [],
  isHindi = false,
}) {
  if (!messages || messages.length === 0) return;

  const turns = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === "user") {
      let assistantMsg = null;
      if (i + 1 < messages.length && messages[i + 1].role === "assistant") {
        assistantMsg = messages[i + 1];
      }
      turns.push({
        turnIndex: turns.length + 1,
        question: msg.text || "",
        userTimestamp: msg.timestamp || "",
        answer: assistantMsg ? assistantMsg.text || "" : "",
        references: assistantMsg ? assistantMsg.references || [] : [],
      });
    }
  }

  if (turns.length === 0) return;

  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: -9999px;
    z-index: -1000;
    ${getPdfContainerStyles()}
  `;

  const headerTitle = isHindi
    ? "भारत मौसम विज्ञान विभाग — संपूर्ण वार्तालाप रिकॉर्ड"
    : "India Meteorological Department — Complete Conversation Record";

  container.innerHTML = `
    <style>
      .pdf-header {
        background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
        color: #ffffff;
        padding: 16px 20px;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      .pdf-header h1 { margin: 0 0 4px 0; font-size: 16px; font-weight: 800; }
      .pdf-header p { margin: 0; font-size: 11px; opacity: 0.92; }
      .turn-card {
        margin-bottom: 24px;
        padding-bottom: 18px;
        border-bottom: 1px solid #e2e8f0;
      }
      .turn-header {
        font-size: 12px;
        font-weight: 750;
        color: #2563eb;
        margin-bottom: 8px;
      }
      .q-box {
        background: #f8fafc;
        border-left: 3.5px solid #2563eb;
        padding: 10px 14px;
        border-radius: 0 6px 6px 0;
        margin-bottom: 10px;
        font-size: 13px;
        color: #0f172a;
      }
      .a-box {
        font-size: 13px;
        line-height: 1.7;
        color: #1e293b;
      }
      .table-container { margin: 12px 0; }
      .pdf-table { width: 100%; border-collapse: collapse; font-size: 11.5px; border: 1px solid #cbd5e1; }
      .pdf-table th { background: #f1f5f9; padding: 7px 10px; font-weight: 700; border: 1px solid #cbd5e1; }
      .pdf-table td { padding: 6px 10px; border: 1px solid #e2e8f0; }
      .katex-block { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px; margin: 10px 0; text-align: center; }
    </style>

    <div class="pdf-header">
      <h1>${headerTitle}</h1>
      <p>Thread: ${threadTitle} | Exported: ${new Date().toLocaleString()}</p>
    </div>

    ${turns
      .map(
        (t) => `
      <div class="turn-card">
        <div class="turn-header">Turn #${t.turnIndex} ${t.userTimestamp ? `(${t.userTimestamp})` : ""}</div>
        <div class="q-box"><strong>Q:</strong> ${markdownToHtmlForPdf(t.question)}</div>
        <div class="a-box">${markdownToHtmlForPdf(t.answer)}</div>
      </div>
    `
      )
      .join("")}
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;
    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    let heightLeft = contentHeight;
    let position = margin;

    doc.addImage(imgData, "JPEG", margin, position, contentWidth, contentHeight);
    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
      position = heightLeft - contentHeight + margin;
      doc.addPage();
      doc.addImage(imgData, "JPEG", margin, position, contentWidth, contentHeight);
      heightLeft -= pageHeight - margin * 2;
    }

    const cleanTitle = threadTitle.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 20);
    const cleanDate = new Date().toISOString().slice(0, 10);
    doc.save(`MTI_Conversation_${cleanTitle}_${cleanDate}.pdf`);
  } catch (err) {
    console.error("Conversation PDF export failed:", err);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
