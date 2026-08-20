from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Optional, Dict
from fpdf import FPDF
import io
import re

router = APIRouter()

class QuizPdfRequest(BaseModel):
    document_title: str
    questions: List[Dict]
    score: Optional[int] = None
    total: Optional[int] = None

class FlashcardsPdfRequest(BaseModel):
    document_title: str
    flashcards: List[Dict]

class NotesPdfRequest(BaseModel):
    note_title: str
    document_title: str
    note_type: str = "exam"
    content: str

class PDFReport(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(79, 70, 229) # Deep Indigo
        self.cell(0, 8, "EduMitra-AI", ln=1, align="L")
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(120, 120, 140)
        self.cell(0, 5, "Your AI-powered learning companion", ln=1, align="L")
        self.set_draw_color(220, 220, 240)
        self.line(10, self.get_y() + 2, 200, self.get_y() + 2)
        self.ln(6)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(150, 150, 170)
        self.cell(0, 10, f"EduMitra-AI Study Document  |  Page {self.page_no()}", align="C")

def clean_inline(text: str) -> str:
    if not text: return ""
    s = text.strip()
    s = re.sub(r"\*+(.*?)\*+", r"\1", s)
    s = re.sub(r"\_+(.*?)\_+", r"\1", s)
    s = re.sub(r"\$\$(.*?)\$\$", r"\1", s)
    s = re.sub(r"\$(.*?)\$", r"\1", s)
    # Replace unicode characters for latin1 output in FPDF
    s = s.encode("latin-1", "replace").decode("latin-1")
    return s

@router.post("/export-quiz-pdf")
async def export_quiz_pdf(req: QuizPdfRequest):
    """
    Generate a printable PDF for a generated quiz.
    """
    try:
        pdf = PDFReport()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        pdf.set_font("Helvetica", "B", 16)
        pdf.set_text_color(30, 41, 59)
        pdf.cell(0, 10, clean_inline(f"Quiz: {req.document_title}"), ln=1)

        if req.score is not None and req.total is not None:
            pct = round((req.score / req.total) * 100)
            pdf.set_font("Helvetica", "B", 11)
            pdf.set_text_color(16, 185, 129)
            pdf.cell(0, 7, f"Attempt Score: {req.score} / {req.total} ({pct}%)", ln=1)

        pdf.ln(4)

        for idx, q in enumerate(req.questions, 1):
            pdf.set_font("Helvetica", "B", 11)
            pdf.set_text_color(30, 41, 59)
            q_text = clean_inline(f"Q{idx}. {q.get('question', '')}")
            pdf.multi_cell(0, 6, q_text)
            pdf.ln(2)

            options = q.get("options", {})
            correct = q.get("correct_answer", "")
            for key in ["A", "B", "C", "D"]:
                opt_val = clean_inline(options.get(key, ""))
                is_correct = key == correct
                pdf.set_font("Helvetica", "B" if is_correct else "", 10)
                pdf.set_text_color(16, 185, 129 if is_correct else 71, 85, 105)
                prefix = f"  [{key}] "
                pdf.cell(0, 5, f"{prefix}{opt_val}" + ("  (Correct Answer)" if is_correct else ""), ln=1)

            if q.get("explanation"):
                pdf.ln(1)
                pdf.set_font("Helvetica", "I", 9)
                pdf.set_text_color(100, 116, 139)
                pdf.multi_cell(0, 5, clean_inline(f"Explanation: {q['explanation']}"))
            pdf.ln(6)

        pdf_bytes = pdf.output()
        filename = f"EduMitra-AI_Quiz_{req.document_title.replace(' ', '_')}.pdf"

        return Response(
            content=bytes(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate Quiz PDF: {e}")


@router.post("/export-flashcards-pdf")
async def export_flashcards_pdf(req: FlashcardsPdfRequest):
    """
    Generate a printable PDF study deck for flashcards.
    """
    try:
        pdf = PDFReport()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        pdf.set_font("Helvetica", "B", 16)
        pdf.set_text_color(30, 41, 59)
        pdf.cell(0, 10, clean_inline(f"Flashcards Deck: {req.document_title}"), ln=1)
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 6, f"Total Cards: {len(req.flashcards)}", ln=1)
        pdf.ln(4)

        for idx, card in enumerate(req.flashcards, 1):
            pdf.set_fill_color(248, 250, 252)
            pdf.set_draw_color(226, 232, 240)
            pdf.rect(10, pdf.get_y(), 190, 32, style="FD")

            start_y = pdf.get_y() + 3
            pdf.set_xy(14, start_y)
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(99, 102, 241)
            pdf.cell(0, 5, f"CARD #{idx}", ln=1)

            pdf.set_x(14)
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(15, 23, 42)
            pdf.multi_cell(180, 5, clean_inline(f"Q: {card.get('question', '')}"))

            pdf.set_x(14)
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(51, 65, 85)
            pdf.multi_cell(180, 5, clean_inline(f"A: {card.get('answer', '')}"))

            pdf.set_y(start_y + 32)

        pdf_bytes = pdf.output()
        filename = f"EduMitra-AI_Flashcards_{req.document_title.replace(' ', '_')}.pdf"

        return Response(
            content=bytes(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate Flashcards PDF: {e}")


@router.post("/export-notes-pdf")
async def export_notes_pdf(req: NotesPdfRequest):
    """
    Generate a styled PDF for AI Study Notes.
    """
    try:
        pdf = PDFReport()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # Title Banner
        pdf.set_font("Helvetica", "B", 15)
        pdf.set_text_color(30, 41, 59)
        pdf.cell(0, 9, clean_inline(req.note_title), ln=1)

        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 6, clean_inline(f"Material: {req.document_title}  |  Category: {req.note_type.upper()}"), ln=1)
        pdf.ln(4)

        lines = req.content.split("\n")
        for line in lines:
            trimmed = line.strip()
            if not trimmed:
                pdf.ln(2)
                continue

            cleaned = clean_inline(trimmed)

            if trimmed.startswith("# "):
                pdf.set_font("Helvetica", "B", 13)
                pdf.set_text_color(79, 70, 229)
                pdf.multi_cell(0, 7, cleaned.replace("# ", ""))
                pdf.ln(2)
            elif trimmed.startswith("## "):
                pdf.set_font("Helvetica", "B", 11.5)
                pdf.set_text_color(67, 56, 202)
                pdf.multi_cell(0, 6, cleaned.replace("## ", ""))
                pdf.ln(1)
            elif trimmed.startswith("### "):
                pdf.set_font("Helvetica", "B", 10.5)
                pdf.set_text_color(30, 41, 59)
                pdf.multi_cell(0, 5, cleaned.replace("### ", ""))
            elif trimmed.startswith("- ") or trimmed.startswith("* "):
                pdf.set_font("Helvetica", "", 9.5)
                pdf.set_text_color(51, 65, 85)
                bullet_text = "  - " + cleaned.replace("- ", "").replace("* ", "")
                pdf.multi_cell(0, 5, bullet_text)
            elif trimmed.startswith(">"):
                pdf.set_font("Helvetica", "I", 9)
                pdf.set_text_color(79, 70, 229)
                pdf.multi_cell(0, 5, f"  [Note]: {cleaned.replace('>', '').strip()}")
            else:
                pdf.set_font("Helvetica", "", 9.5)
                pdf.set_text_color(51, 65, 85)
                pdf.multi_cell(0, 5, cleaned)

        pdf_bytes = pdf.output()
        filename = f"EduMitra-AI_Notes_{req.note_title.replace(' ', '_')}.pdf"

        return Response(
            content=bytes(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate Notes PDF: {e}")
