import jsPDF from "jspdf";

/**
 * Clean markdown symbols for plain text PDF rendering
 */
const cleanMarkdownForPdf = (raw) => {
  if (!raw) return "";
  return raw
    .replace(/[\uE000-\uF8FF\uFFF0-\uFFFF]/g, "")
    .replace(/\[?\s*(?:source|Source)\s*\[?\s*\d+\s*\]?\s*\]?|\(\s*(?:source|Source)\s*\d+\s*\)|\[\d+\]/gi, "")
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold
    .replace(/\*(.*?)\*/g, "$1")     // italic
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1") // inline code / block code wrapper
    .replace(/^#+\s+/gm, "")         // headers
    .replace(/^\s*[\-\*•]\s+/gm, "• ") // bullet points
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

/**
 * Helper to check and handle page break
 */
function ensureSpace(doc, cursorY, requiredSpace, pageHeight, margin) {
  if (cursorY + requiredSpace > pageHeight - margin - 12) {
    doc.addPage();
    return margin + 6;
  }
  return cursorY;
}

/**
 * Add page numbers and footer to all pages in doc
 */
function addFooter(doc, footerSubtitle = "MTI RAG Assistant") {
  const totalPages = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // #94a3b8
    doc.text(
      `Page ${i} of ${totalPages}  |  ${footerSubtitle}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }
}

/**
 * Exports a single Q&A response (Question + Assistant Answer) to PDF.
 * @param {Object} params
 * @param {string} [params.question] - User's question text
 * @param {string} params.text - Assistant's response text
 * @param {string} [params.timestamp] - Time string when response was generated
 * @param {Array<string>} [params.references] - List of referenced document names
 */
export function exportMessageToPdf({ question, text, timestamp, references = [] }) {
  if (!text && !question) return;

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  let cursorY = margin;

  // Header Banner
  doc.setFillColor(37, 99, 235); // #2563eb Primary blue
  doc.rect(margin, cursorY, contentWidth, 14, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("MTI Knowledge Assistant — Query & Response", margin + 5, cursorY + 9);

  cursorY += 20;

  // Timestamp & metadata line
  if (timestamp) {
    doc.setTextColor(100, 116, 139); // #64748b
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Generated on: ${timestamp}`, margin, cursorY);
    cursorY += 7;
  }

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  // SECTION 1: USER QUESTION (if present)
  if (question && question.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235); // Blue label
    doc.text("User Question:", margin, cursorY);
    cursorY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // Dark slate

    const questionLines = doc.splitTextToSize(cleanMarkdownForPdf(question), contentWidth - 4);
    const qLineHeight = 5.2;

    // Draw light grey box background for question
    const qBoxHeight = questionLines.length * qLineHeight + 4;
    cursorY = ensureSpace(doc, cursorY, qBoxHeight, pageHeight, margin);

    doc.setFillColor(248, 250, 252); // #f8fafc
    doc.rect(margin, cursorY - 3, contentWidth, qBoxHeight, "F");
    doc.setDrawColor(203, 213, 225); // Left border accent
    doc.setLineWidth(0.8);
    doc.line(margin, cursorY - 3, margin, cursorY - 3 + qBoxHeight);

    questionLines.forEach((line) => {
      cursorY = ensureSpace(doc, cursorY, qLineHeight, pageHeight, margin);
      doc.text(line, margin + 4, cursorY);
      cursorY += qLineHeight;
    });

    cursorY += 6;

    // Divider between Question and Answer
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 8;
  }

  // SECTION 2: ASSISTANT RESPONSE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(37, 99, 235); // Blue label
  doc.text("Assistant Response:", margin, cursorY);
  cursorY += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59); // #1e293b

  const cleanText = cleanMarkdownForPdf(text);
  const lines = doc.splitTextToSize(cleanText, contentWidth);
  const lineHeight = 5.5;

  lines.forEach((line) => {
    cursorY = ensureSpace(doc, cursorY, lineHeight, pageHeight, margin);
    doc.text(line, margin, cursorY);
    cursorY += lineHeight;
  });

  // SECTION 3: DOCUMENT REFERENCES
  if (references && references.length > 0) {
    cursorY += 6;
    cursorY = ensureSpace(doc, cursorY, 20, pageHeight, margin);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235);
    doc.text("Document References:", margin, cursorY);
    cursorY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    references.forEach((ref) => {
      cursorY = ensureSpace(doc, cursorY, 5, pageHeight, margin);
      doc.text(`• ${ref}`, margin + 3, cursorY);
      cursorY += 5;
    });
  }

  // Footer on all pages
  addFooter(doc, "MTI RAG Assistant — Query Response");

  // Save File
  const cleanDate = new Date().toISOString().slice(0, 10);
  const filename = `MTI_QA_${cleanDate}_${Date.now().toString().slice(-4)}.pdf`;
  doc.save(filename);
}

/**
 * Exports the entire conversation thread (all Questions and Answers) to PDF.
 * @param {Object} params
 * @param {string} [params.threadTitle] - Title of active conversation thread
 * @param {Array<Object>} params.messages - List of message objects in the thread
 */
export function exportFullConversationToPdf({ threadTitle = "Active Conversation", messages = [] }) {
  if (!messages || messages.length === 0) return;

  // Filter out welcome message if desired, or group into Q&A turns
  const turns = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === "user") {
      // Find subsequent assistant response
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
        assistantTimestamp: assistantMsg ? assistantMsg.timestamp || "" : "",
      });
    }
  }

  if (turns.length === 0) return;

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  let cursorY = margin;

  // Title Banner
  doc.setFillColor(37, 99, 235); // #2563eb Primary blue
  doc.rect(margin, cursorY, contentWidth, 16, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("MTI Knowledge Assistant — Full Conversation Record", margin + 5, cursorY + 10);

  cursorY += 22;

  // Thread Subheader
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // Dark slate
  doc.text(`Thread: ${threadTitle}`, margin, cursorY);
  cursorY += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const nowStr = new Date().toLocaleString();
  doc.text(`Exported on: ${nowStr}  |  Total Q&A Turns: ${turns.length}`, margin, cursorY);
  cursorY += 7;

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 10;

  // Loop through Q&A turns
  turns.forEach((turn) => {
    cursorY = ensureSpace(doc, cursorY, 25, pageHeight, margin);

    // Turn Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235);
    const turnHeader = `Q&A Turn #${turn.turnIndex}${turn.userTimestamp ? ` (${turn.userTimestamp})` : ""}`;
    doc.text(turnHeader, margin, cursorY);
    cursorY += 6;

    // User Question
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Question:", margin, cursorY);
    cursorY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    const qLines = doc.splitTextToSize(cleanMarkdownForPdf(turn.question), contentWidth - 4);
    qLines.forEach((line) => {
      cursorY = ensureSpace(doc, cursorY, 5, pageHeight, margin);
      doc.text(line, margin + 4, cursorY);
      cursorY += 5;
    });

    cursorY += 3;

    // Assistant Answer
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(37, 99, 235);
    doc.text("Answer:", margin, cursorY);
    cursorY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    const aLines = doc.splitTextToSize(cleanMarkdownForPdf(turn.answer), contentWidth - 4);
    aLines.forEach((line) => {
      cursorY = ensureSpace(doc, cursorY, 5, pageHeight, margin);
      doc.text(line, margin + 4, cursorY);
      cursorY += 5;
    });

    // Document References if present
    if (turn.references && turn.references.length > 0) {
      cursorY += 2;
      cursorY = ensureSpace(doc, cursorY, 6, pageHeight, margin);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`References: ${turn.references.join(", ")}`, margin + 4, cursorY);
      cursorY += 5;
    }

    cursorY += 4;

    // Divider Line between turns
    cursorY = ensureSpace(doc, cursorY, 6, pageHeight, margin);
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.4);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 8;
  });

  // Footer on all pages
  addFooter(doc, `MTI RAG Assistant — ${threadTitle}`);

  // Save File
  const cleanTitle = threadTitle.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 20);
  const cleanDate = new Date().toISOString().slice(0, 10);
  const filename = `MTI_Conversation_${cleanTitle}_${cleanDate}.pdf`;
  doc.save(filename);
}

