import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { QuizQuestion, Flashcard } from "./types";

/** Clean inline markdown artifacts like **bold**, *italic*, and math $ delims */
function cleanInlineMarkdown(text: string): string {
  if (!text) return "";
  let s = text.trim();
  // Strip bold and italic markers
  s = s.replace(/\*\*\*(.*?)\*\*\*/g, "$1");
  s = s.replace(/\*\*(.*?)\*\*/g, "$1");
  s = s.replace(/\*(.*?)\*/g, "$1");
  s = s.replace(/___(.*?)___/g, "$1");
  s = s.replace(/__(.*?)__/g, "$1");
  s = s.replace(/_(.*?)_/g, "$1");
  // Clean LaTeX delimiters
  s = s.replace(/\$\$(.*?)\$\$/g, "$1");
  s = s.replace(/\$(.*?)\$/g, "$1");
  // Clean HTML entities
  s = s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  return s;
}

interface MarkdownBlock {
  type: "h1" | "h2" | "h3" | "paragraph" | "bullet" | "numbered" | "table" | "code" | "callout" | "equation";
  text?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
  codeLanguage?: string;
}

/** Parse markdown text into structured content blocks */
function parseMarkdownToBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.split("\n");
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip blank lines
    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Code Block ```
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      blocks.push({
        type: "code",
        text: codeLines.join("\n"),
        codeLanguage: lang || "code",
      });
      continue;
    }

    // 2. Markdown Table (starts with |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const parseRow = (r: string) =>
          r
            .split("|")
            .slice(1, -1)
            .map((cell) => cleanInlineMarkdown(cell.trim()));

        const headers = parseRow(tableLines[0]);
        let startIdx = 1;
        // Skip delimiter row if present (|---|---|)
        if (tableLines[1].includes("---")) {
          startIdx = 2;
        }

        const rows = tableLines.slice(startIdx).map(parseRow);
        blocks.push({
          type: "table",
          headers,
          rows,
        });
      }
      continue;
    }

    // 3. Blockquote / Callout
    if (trimmed.startsWith(">")) {
      const calloutLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        calloutLines.push(lines[i].trim().replace(/^>\s*/, ""));
        i++;
      }
      blocks.push({
        type: "callout",
        text: cleanInlineMarkdown(calloutLines.join(" ")),
      });
      continue;
    }

    // 4. Equations ($$ ... $$ or $ ... $)
    if (trimmed.startsWith("$$") || (trimmed.startsWith("$") && trimmed.endsWith("$") && trimmed.length > 2)) {
      const eqText = trimmed.replace(/^\$\$|\$\$$|^\$|\$$/g, "").trim();
      blocks.push({
        type: "equation",
        text: eqText,
      });
      i++;
      continue;
    }

    // 5. Headings
    if (trimmed.startsWith("# ")) {
      blocks.push({ type: "h1", text: cleanInlineMarkdown(trimmed.slice(2)) });
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "h2", text: cleanInlineMarkdown(trimmed.slice(3)) });
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "h3", text: cleanInlineMarkdown(trimmed.slice(4)) });
      i++;
      continue;
    }
    if (trimmed.startsWith("#### ")) {
      blocks.push({ type: "h3", text: cleanInlineMarkdown(trimmed.slice(5)) });
      i++;
      continue;
    }

    // 6. Bullet Lists (- or *)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      const items: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* ") || lines[i].trim().startsWith("• "))
      ) {
        items.push(cleanInlineMarkdown(lines[i].trim().replace(/^[-*•]\s*/, "")));
        i++;
      }
      blocks.push({ type: "bullet", items });
      continue;
    }

    // 7. Numbered Lists (1. 2.)
    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(cleanInlineMarkdown(lines[i].trim().replace(/^\d+\.\s*/, "")));
        i++;
      }
      blocks.push({ type: "numbered", items });
      continue;
    }

    // 8. Paragraph
    blocks.push({ type: "paragraph", text: cleanInlineMarkdown(trimmed) });
    i++;
  }

  return blocks;
}

/**
 * Generate and download a beautifully formatted PDF for Quizzes.
 */
export function downloadQuizPDF(
  documentTitle: string,
  questions: QuizQuestion[],
  score?: number
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header Banner
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("EduMitra-AI", 14, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Your AI-powered learning companion", 14, 22);

  // Document & Date Info
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Quiz Assessment: ${documentTitle}`, 14, 38);

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on ${dateStr}`, 14, 44);

  if (score !== undefined) {
    const pct = Math.round((score / questions.length) * 100);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text(`Attempt Result: ${score} / ${questions.length} (${pct}%)`, pageWidth - 14, 44, { align: "right" });
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 48, pageWidth - 14, 48);

  let currentY = 54;

  questions.forEach((q, idx) => {
    if (currentY > doc.internal.pageSize.height - 40) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);

    const questionLines = doc.splitTextToSize(`Q${idx + 1}. ${q.question}`, pageWidth - 28);
    doc.text(questionLines, 14, currentY);
    currentY += questionLines.length * 6 + 2;

    const tableData = Object.entries(q.options).map(([key, value]) => {
      const isCorrect = key === q.correct_answer;
      return [
        isCorrect ? `[${key}] *` : `[${key}]`,
        value,
        isCorrect ? "Correct Answer" : "",
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [],
      body: tableData,
      theme: "plain",
      styles: { fontSize: 9, cellPadding: 2, textColor: [51, 65, 85] },
      columnStyles: {
        0: { cellWidth: 15, fontStyle: "bold" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 35, fontStyle: "bold", textColor: [16, 185, 129] },
      },
      margin: { left: 18, right: 14 },
    });

    // @ts-expect-error - lastAutoTable is injected by jspdf-autotable plugin
    currentY = doc.lastAutoTable.finalY + 3;

    if (q.explanation) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      const expLines = doc.splitTextToSize(`Explanation: ${q.explanation}`, pageWidth - 32);
      doc.text(expLines, 18, currentY);
      currentY += expLines.length * 4.5 + 6;
    } else {
      currentY += 4;
    }
  });

  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`EduMitra-AI Printable Quiz  |  Page ${i} of ${totalPages}`, pageWidth / 2, doc.internal.pageSize.height - 10, {
      align: "center",
    });
  }

  const cleanTitle = documentTitle.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
  doc.save(`EduMitra-AI_Quiz_${cleanTitle}.pdf`);
}

/**
 * Generate and download a printable PDF Flashcard deck.
 */
export function downloadFlashcardsPDF(
  documentTitle: string,
  flashcards: Flashcard[]
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header Banner
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("EduMitra-AI", 14, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Your AI-powered learning companion", 14, 22);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Flashcard Study Deck: ${documentTitle}`, 14, 38);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Total Flashcards: ${flashcards.length}`, 14, 44);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 48, pageWidth - 14, 48);

  let currentY = 54;

  flashcards.forEach((card, idx) => {
    const cardHeight = 36;
    if (currentY + cardHeight > doc.internal.pageSize.height - 20) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, currentY, pageWidth - 28, cardHeight, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text(`CARD ${idx + 1} OF ${flashcards.length}`, 20, currentY + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    const qLines = doc.splitTextToSize(`Q: ${card.question}`, pageWidth - 42);
    doc.text(qLines, 20, currentY + 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const aLines = doc.splitTextToSize(`A: ${card.answer}`, pageWidth - 42);
    doc.text(aLines, 20, currentY + 23);

    currentY += cardHeight + 8;
  });

  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`EduMitra-AI Printable Flashcards  |  Page ${i} of ${totalPages}`, pageWidth / 2, doc.internal.pageSize.height - 10, {
      align: "center",
    });
  }

  const cleanTitle = documentTitle.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
  doc.save(`EduMitra-AI_Flashcards_${cleanTitle}.pdf`);
}

/**
 * PROFFESIONAL DOCUMENT RENDERING PIPELINE FOR AI NOTES PDF
 * Parses markdown/structured notes into clean typography, styled headers,
 * tables (via autoTable), code blocks, callouts, equations, page numbers,
 * and header/footer banners.
 */
export function downloadNotesPDF(
  noteTitle: string,
  documentTitle: string,
  noteType: string,
  markdownContent: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // 1. Header Banner
  doc.setFillColor(49, 46, 129); // Deep Indigo
  doc.rect(0, 0, pageWidth, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("EduMitra-AI", margin, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(224, 231, 255);
  doc.text("Your Personal AI Learning Companion  |  Study Notes", margin, 23);

  // Note Metadata Header Box
  let currentY = 38;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(noteTitle, contentWidth);
  doc.text(titleLines, margin, currentY);
  currentY += titleLines.length * 6 + 2;

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Material: ${documentTitle}   •   Category: ${noteType.replace("_", " ").toUpperCase()}   •   Date: ${dateStr}`, margin, currentY);
  currentY += 6;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // Function to ensure page overflow protection
  const checkPageOverflow = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 22;
    }
  };

  // 2. Parse Markdown into Structured AST Blocks
  const blocks = parseMarkdownToBlocks(markdownContent);

  // 3. Render Blocks with Typography & Styles
  blocks.forEach((block) => {
    switch (block.type) {
      case "h1": {
        checkPageOverflow(16);
        currentY += 4;
        doc.setFillColor(79, 70, 229);
        doc.rect(margin, currentY, 3, 10, "F"); // Left Accent Pill

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(30, 41, 59);
        const textLines = doc.splitTextToSize(block.text || "", contentWidth - 8);
        doc.text(textLines, margin + 6, currentY + 7);
        currentY += Math.max(12, textLines.length * 6 + 4);
        break;
      }

      case "h2": {
        checkPageOverflow(14);
        currentY += 3;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11.5);
        doc.setTextColor(67, 56, 202); // Dark Indigo
        const textLines = doc.splitTextToSize(block.text || "", contentWidth);
        doc.text(textLines, margin, currentY);
        currentY += textLines.length * 5 + 2;

        doc.setDrawColor(199, 210, 254);
        doc.line(margin, currentY, margin + 40, currentY); // Underline bar
        currentY += 4;
        break;
      }

      case "h3": {
        checkPageOverflow(10);
        currentY += 2;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        const textLines = doc.splitTextToSize(block.text || "", contentWidth);
        doc.text(textLines, margin, currentY);
        currentY += textLines.length * 5 + 2;
        break;
      }

      case "paragraph": {
        if (!block.text) break;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        const textLines = doc.splitTextToSize(block.text, contentWidth);
        checkPageOverflow(textLines.length * 4.5 + 2);
        doc.text(textLines, margin, currentY);
        currentY += textLines.length * 4.5 + 4;
        break;
      }

      case "bullet": {
        if (!block.items || block.items.length === 0) break;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);

        block.items.forEach((item) => {
          const itemLines = doc.splitTextToSize(item, contentWidth - 8);
          checkPageOverflow(itemLines.length * 4.5 + 2);
          doc.setFillColor(79, 70, 229);
          doc.circle(margin + 2, currentY - 1.5, 1, "F"); // Bullet Point
          doc.text(itemLines, margin + 6, currentY);
          currentY += itemLines.length * 4.5 + 2;
        });
        currentY += 2;
        break;
      }

      case "numbered": {
        if (!block.items || block.items.length === 0) break;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);

        block.items.forEach((item, numIdx) => {
          const itemLines = doc.splitTextToSize(item, contentWidth - 10);
          checkPageOverflow(itemLines.length * 4.5 + 2);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(79, 70, 229);
          doc.text(`${numIdx + 1}.`, margin, currentY);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(51, 65, 85);
          doc.text(itemLines, margin + 7, currentY);
          currentY += itemLines.length * 4.5 + 2;
        });
        currentY += 2;
        break;
      }

      case "table": {
        if (!block.headers || block.headers.length === 0) break;
        checkPageOverflow(25);

        autoTable(doc, {
          startY: currentY,
          head: [block.headers],
          body: block.rows || [],
          theme: "striped",
          headStyles: {
            fillColor: [79, 70, 229],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 8.5,
          },
          styles: {
            fontSize: 8,
            cellPadding: 2.5,
            textColor: [51, 65, 85],
            overflow: "linebreak",
          },
          margin: { left: margin, right: margin },
        });

        // @ts-expect-error - lastAutoTable injected by jspdf-autotable plugin
        currentY = doc.lastAutoTable.finalY + 6;
        break;
      }

      case "code": {
        if (!block.text) break;
        doc.setFont("courier", "normal");
        doc.setFontSize(8.5);

        const codeLines = doc.splitTextToSize(block.text, contentWidth - 10);
        const blockHeight = codeLines.length * 4 + 6;
        checkPageOverflow(blockHeight);

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, currentY, contentWidth, blockHeight, 2, 2, "FD");

        doc.setTextColor(15, 23, 42);
        doc.text(codeLines, margin + 4, currentY + 4.5);
        currentY += blockHeight + 4;
        break;
      }

      case "callout": {
        if (!block.text) break;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);

        const calloutLines = doc.splitTextToSize(block.text, contentWidth - 10);
        const calloutHeight = calloutLines.length * 4.5 + 6;
        checkPageOverflow(calloutHeight);

        doc.setFillColor(238, 242, 255); // Soft indigo tint
        doc.rect(margin, currentY, contentWidth, calloutHeight, "F");

        doc.setFillColor(79, 70, 229);
        doc.rect(margin, currentY, 2.5, calloutHeight, "F"); // Accent bar

        doc.setTextColor(30, 41, 59);
        doc.text(calloutLines, margin + 5, currentY + 5);
        currentY += calloutHeight + 4;
        break;
      }

      case "equation": {
        if (!block.text) break;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);

        const eqLines = doc.splitTextToSize(`[EQUATION]: ${block.text}`, contentWidth - 8);
        const eqHeight = eqLines.length * 5 + 6;
        checkPageOverflow(eqHeight);

        doc.setFillColor(243, 244, 246);
        doc.setDrawColor(209, 213, 219);
        doc.roundedRect(margin, currentY, contentWidth, eqHeight, 2, 2, "FD");

        doc.setTextColor(67, 56, 202);
        doc.text(eqLines, margin + 4, currentY + 5);
        currentY += eqHeight + 4;
        break;
      }
    }
  });

  // 4. Header & Footer Loop across all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Top subtle header line (pages 2+)
    if (i > 1) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(99, 102, 241);
      doc.text("EduMitra-AI  |  Study Notes Guide", margin, 12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text(noteTitle.slice(0, 45), pageWidth - margin, 12, { align: "right" });
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, 15, pageWidth - margin, 15);
    }

    // Bottom Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `EduMitra-AI Printable Study Notes  •  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  const cleanFilename = noteTitle.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 35);
  doc.save(`EduMitra-AI_Notes_${cleanFilename}.pdf`);
}
