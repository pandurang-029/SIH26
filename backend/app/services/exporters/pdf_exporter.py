import os
from pathlib import Path
from typing import List, Union
from pydantic import BaseModel

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)

from app.schemas.output_schemas import ExecutiveSummaryOutput, AdvisoryOutput
from app.services.exporters.base_exporter import BaseDocumentExporter


def NumberedCanvasFactory(doc_title: str):
    """
    Factory creating a page numbering canvas for ReportLab PDF documents.
    """
    from reportlab.pdfgen import canvas

    class NumberedCanvas(canvas.Canvas):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self._saved_page_states = []

        def showPage(self):
            self._saved_page_states.append(dict(self.__dict__))
            self._startPage()

        def save(self):
            num_pages = len(self._saved_page_states)
            for state in self._saved_page_states:
                self.__dict__.update(state)
                self.draw_header_footer(num_pages)
                super().showPage()
            super().save()

        def draw_header_footer(self, page_count):
            self.saveState()
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#475569"))

            # Header
            self.drawString(54, 11 * inch - 36, "NTRO CONTENT TRANSFORMATION PLATFORM | OFFICIAL REPORT")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)

            # Footer
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(8.5 * inch - 54, 36, page_text)
            self.drawString(54, 36, "CONFIDENTIAL & PROPRIETARY — FOR OFFICIAL USE ONLY")
            self.line(54, 48, 8.5 * inch - 54, 48)

            self.restoreState()

    return NumberedCanvas


class PdfExporter(BaseDocumentExporter):
    """
    ReportLab PDF Exporter for Executive Summary and Advisory models.
    """

    def export(
        self, output_model: Union[ExecutiveSummaryOutput, AdvisoryOutput], destination_path: Path
    ) -> Path:
        destination_path.parent.mkdir(parents=True, exist_ok=True)

        if isinstance(output_model, ExecutiveSummaryOutput):
            return self.export_executive_summary_pdf(output_model, destination_path)
        elif isinstance(output_model, AdvisoryOutput):
            return self.export_advisory_pdf(output_model, destination_path)
        else:
            raise ValueError(f"Unsupported model type for PDF export: {type(output_model)}")

    def export_executive_summary_pdf(
        self, output: ExecutiveSummaryOutput, destination_path: Path
    ) -> Path:
        doc = SimpleDocTemplate(
            str(destination_path),
            pagesize=letter,
            leftMargin=54,
            rightMargin=54,
            topMargin=54,
            bottomMargin=54,
        )

        styles = getSampleStyleSheet()
        
        # Custom Styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=24,
            textColor=colors.HexColor("#0F172A"),
            alignment=0,
            spaceAfter=6,
        )

        badge_style = ParagraphStyle(
            "BadgeStyle",
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=11,
            textColor=colors.HexColor("#1E40AF"),
            spaceAfter=12,
        )

        heading_style = ParagraphStyle(
            "SectionHeading",
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=15,
            textColor=colors.HexColor("#1E293B"),
            spaceBefore=12,
            spaceAfter=6,
        )

        body_style = ParagraphStyle(
            "ReportBody",
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#334155"),
            spaceAfter=8,
        )

        bullet_style = ParagraphStyle(
            "ReportBullet",
            parent=body_style,
            leftIndent=15,
            firstLineIndent=-10,
            spaceAfter=4,
        )

        source_style = ParagraphStyle(
            "SourceText",
            fontName="Helvetica-Oblique",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#475569"),
            spaceAfter=4,
        )

        story = []

        # Document Header
        story.append(Paragraph("EXECUTIVE SUMMARY BRIEFING", badge_style))
        story.append(Paragraph(output.title, title_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563EB"), spaceAfter=14))

        # Executive Summary Paragraph
        story.append(Paragraph("Executive Summary", heading_style))
        story.append(Paragraph(output.executive_summary, body_style))
        story.append(Spacer(1, 8))

        # Key Points
        if output.key_points:
            story.append(Paragraph("Key Decision Points", heading_style))
            for pt in output.key_points:
                story.append(Paragraph(f"• {pt}", bullet_style))
            story.append(Spacer(1, 8))

        # Statistics Table
        if output.important_statistics:
            story.append(Paragraph("Key Metrics & Quantitative Indicators", heading_style))
            table_data = [["Metric / Indicator", "Value", "Context / Source Page"]]
            for stat in output.important_statistics:
                src_page_str = f"Page {stat.source_page}" if stat.source_page else "-"
                ctx_str = f"{stat.context} ({src_page_str})" if stat.context else src_page_str
                table_data.append([stat.metric, stat.value, ctx_str])

            t = Table(table_data, colWidths=[2.5 * inch, 1.5 * inch, 2.8 * inch])
            t.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ])
            )
            story.append(t)
            story.append(Spacer(1, 10))

        # Risks & Recommendations
        if output.risks:
            story.append(Paragraph("Identified Operational Risks", heading_style))
            for rk in output.risks:
                src_str = f" [Source: Page {rk.source_page}]" if rk.source_page else ""
                sev_str = f" ({rk.severity} Severity)" if rk.severity else ""
                story.append(Paragraph(f"• <b>{rk.risk}</b>{sev_str}{src_str}", bullet_style))
            story.append(Spacer(1, 8))

        if output.recommendations:
            story.append(Paragraph("Strategic Action Recommendations", heading_style))
            for rec in output.recommendations:
                src_str = f" [Source: Page {rec.source_page}]" if rec.source_page else ""
                pri_str = f" (Priority: {rec.priority})" if rec.priority else ""
                story.append(Paragraph(f"• <b>{rec.recommendation}</b>{pri_str}{src_str}", bullet_style))
            story.append(Spacer(1, 10))

        # Source References
        if output.source_references:
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#94A3B8"), spaceBefore=10, spaceAfter=8))
            story.append(Paragraph("Source Page References & Provenance", heading_style))
            for ref in output.source_references:
                story.append(Paragraph(f"• <b>Page {ref.page_number}</b> — <i>\"{ref.supporting_text}\"</i>", source_style))

        canvas_class = NumberedCanvasFactory(output.title)
        doc.build(story, canvasmaker=canvas_class)
        return destination_path

    def export_advisory_pdf(self, output: AdvisoryOutput, destination_path: Path) -> Path:
        doc = SimpleDocTemplate(
            str(destination_path),
            pagesize=letter,
            leftMargin=54,
            rightMargin=54,
            topMargin=54,
            bottomMargin=54,
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#0F172A"),
            alignment=0,
            spaceAfter=6,
        )

        badge_style = ParagraphStyle(
            "BadgeStyle",
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=11,
            textColor=colors.HexColor("#991B1B"),
            spaceAfter=10,
        )

        heading_style = ParagraphStyle(
            "SectionHeading",
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#1E293B"),
            spaceBefore=10,
            spaceAfter=4,
        )

        body_style = ParagraphStyle(
            "ReportBody",
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#334155"),
            spaceAfter=8,
        )

        bullet_style = ParagraphStyle(
            "ReportBullet",
            parent=body_style,
            leftIndent=15,
            firstLineIndent=-10,
            spaceAfter=4,
        )

        source_style = ParagraphStyle(
            "SourceText",
            fontName="Helvetica-Oblique",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#475569"),
            spaceAfter=4,
        )

        story = []

        # Header
        story.append(Paragraph(f"OPERATIONAL ADVISORY — PRIORITY: {output.priority.upper()}", badge_style))
        story.append(Paragraph(output.title, title_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#DC2626"), spaceAfter=12))

        # Metadata Header Box
        meta_table = [
            ["Intended Recipient Audience:", output.intended_audience],
            ["Urgency / Priority Level:", output.priority]
        ]
        t_meta = Table(meta_table, colWidths=[2.2 * inch, 4.6 * inch])
        t_meta.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FEF2F2")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#7F1D1D")),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#FCA5A5")),
            ])
        )
        story.append(t_meta)
        story.append(Spacer(1, 10))

        # Situation Briefing
        story.append(Paragraph("Situation Briefing", heading_style))
        story.append(Paragraph(output.situation, body_style))

        # Risk Assessment
        story.append(Paragraph("Comprehensive Risk Assessment", heading_style))
        story.append(Paragraph(output.risk_assessment, body_style))

        # Key Findings
        if output.key_findings:
            story.append(Paragraph("Key Analytical Findings", heading_style))
            for item in output.key_findings:
                src_str = f" [Source: Page {item.source_page}]" if item.source_page else ""
                story.append(Paragraph(f"• {item.finding}{src_str}", bullet_style))
            story.append(Spacer(1, 6))

        # Recommended Action Directives
        if output.recommended_actions:
            story.append(Paragraph("Recommended Action Directives", heading_style))
            for action in output.recommended_actions:
                src_str = f" [Source: Page {action.source_page}]" if action.source_page else ""
                pri_str = f" ({action.priority} Priority)" if action.priority else ""
                story.append(Paragraph(f"• <b>{action.recommendation}</b>{pri_str}{src_str}", bullet_style))
            story.append(Spacer(1, 10))

        # Source References
        if output.source_references:
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#94A3B8"), spaceBefore=10, spaceAfter=8))
            story.append(Paragraph("Source Page References & Provenance", heading_style))
            for ref in output.source_references:
                story.append(Paragraph(f"• <b>Page {ref.page_number}</b> — <i>\"{ref.supporting_text}\"</i>", source_style))

        canvas_class = NumberedCanvasFactory(output.title)
        doc.build(story, canvasmaker=canvas_class)
        return destination_path
